import electronUpdater from 'electron-updater';
const { autoUpdater } = electronUpdater;
import { BrowserWindow, ipcMain, app, shell } from 'electron';
import { platform, arch } from 'os';
import axios from 'axios';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

// Type definitions for internal use
interface ManualUpdateState {
    downloadedFile: string | null;
    isDownloading: boolean;
}

const manualState: ManualUpdateState = {
    downloadedFile: null,
    isDownloading: false
};

export function initAutoUpdater(mainWindow: BrowserWindow): void {
    const isMac = platform() === 'darwin';

    // CRITICAL: Disable signature verification for unsigned builds
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (autoUpdater as any).verifyUpdateCodeSignature = false;

    // Disable auto-install on quit
    autoUpdater.autoInstallOnAppQuit = false;

    // For macOS, we handle download manually to get the DMG
    // For Windows, we let autoUpdater handle the NSIS/Squirrel flow
    autoUpdater.autoDownload = !isMac;

    const sendLog = (message: string) => {
        console.log(message);
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('update:log', message);
        }
    };

    sendLog('[Updater] Initializing auto-updater...');
    sendLog(`[Updater] Current version: ${app.getVersion()}`);
    sendLog(`[Updater] Platform: ${platform()}, Arch: ${arch()}`);
    if (isMac) sendLog('[Updater] macOS detected: Using manual PKG update flow (Quarantine Bypass)');

    autoUpdater.on('checking-for-update', () => {
        sendLog('[Updater] Checking for updates...');
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('update:checking');
        }
    });

    autoUpdater.on('update-available', async (info) => {
        sendLog(`[Updater] Update available: ${info.version}`);

        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('update:available', info);
        }

        if (isMac) {
            // Manual PKG Download Flow
            if (manualState.isDownloading) return;
            manualState.isDownloading = true;

            try {
                // Construct DMG URL
                // Pattern: Communokot Launcher-${version}-${arch}.pkg
                // URL encode the space: "Communokot%20Launcher"
                // Assuming standard electron-builder output format
                const currentArch = arch() === 'arm64' ? 'arm64' : 'x64';
                const fileName = `Communokot-Launcher-${info.version}-${currentArch}.pkg`;
                // Use the standard GitHub Releases download URL structure
                // Adjust if using a different provider, but typically standard with generic/github provider
                const downloadUrl = `https://github.com/theocode29/Communokot-Launcher/releases/download/v${info.version}/${fileName}`;

                const tempPath = join(app.getPath('downloads'), `Communokot-Launcher-${info.version}-${currentArch}.pkg`);

                sendLog(`[Updater] Starting manual download (PKG): ${downloadUrl}`);
                sendLog(`[Updater] Target: ${tempPath}`);

                const writer = createWriteStream(tempPath);
                const response = await axios({
                    url: downloadUrl,
                    method: 'GET',
                    headers: {
                        'User-Agent': 'Communokot-Launcher'
                    },
                    responseType: 'stream'
                });

                const totalLength = parseInt(response.headers['content-length'] || '0', 10);
                let downloadedLength = 0;

                response.data.on('data', (chunk: Buffer) => {
                    downloadedLength += chunk.length;
                    writer.write(chunk);

                    if (totalLength > 0 && mainWindow && !mainWindow.isDestroyed()) {
                        const percent = (downloadedLength / totalLength) * 100;
                        // Throttle updates slightly or just send
                        mainWindow.webContents.send('update:progress', {
                            percent: percent,
                            transferred: downloadedLength,
                            total: totalLength,
                            bytesPerSecond: 0 // Not calculating speed for simplicity
                        });
                    }
                });

                response.data.on('end', () => {
                    writer.end();
                    manualState.isDownloading = false;
                    manualState.downloadedFile = tempPath;
                    sendLog('[Updater] Manual download completed.');

                    if (mainWindow && !mainWindow.isDestroyed()) {
                        mainWindow.webContents.send('update:ready', info);
                    }
                });

                writer.on('error', (err: Error) => {
                    writer.close();
                    manualState.isDownloading = false;
                    sendLog(`[Updater] File write error: ${err.message}`);
                    if (mainWindow && !mainWindow.isDestroyed()) {
                        mainWindow.webContents.send('update:error', `Write error: ${err.message}`);
                    }
                });

            } catch (err) {
                manualState.isDownloading = false;
                const errMsg = err instanceof Error ? err.message : String(err);
                sendLog(`[Updater] Manual download failed: ${errMsg}`);
                if (mainWindow && !mainWindow.isDestroyed()) {
                    mainWindow.webContents.send('update:error', `Download failed: ${errMsg}`);
                }
            }
        }
    });

    autoUpdater.on('update-not-available', (info) => {
        sendLog(`[Updater] No updates available. Latest: ${info.version}`);
    });

    // Standard autoUpdater download progress (Windows/Linux)
    autoUpdater.on('download-progress', (progress) => {
        if (!isMac) {
            console.log(`[Updater] Download progress: ${progress.percent.toFixed(1)}%`);
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('update:progress', progress);
            }
        }
    });

    autoUpdater.on('update-downloaded', (info) => {
        if (!isMac) {
            sendLog(`[Updater] Update downloaded: ${info.version}`);
            sendLog('[Updater] Ready to install.');
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('update:ready', info);
            }
        }
    });

    autoUpdater.on('error', (error) => {
        // Ignore errors on Mac if we are doing manual flow and the error is about updates (except checking)
        // But autoUpdater might still emit errors if it tries to check and fails.
        const errorMessage = error instanceof Error ? error.message : String(error);
        sendLog(`[Updater] ERROR: ${errorMessage}`);
        if (error instanceof Error && error.stack) {
            sendLog(`[Updater] Stack: ${error.stack}`);
        }

        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('update:error', errorMessage);
        }
    });

    // Handle install request from renderer
    ipcMain.on('update:install', () => {
        sendLog('[Updater] IPC: Install requested.');

        if (isMac && manualState.downloadedFile) {
            sendLog(`[Updater] Opening PKG: ${manualState.downloadedFile}`);
            shell.openPath(manualState.downloadedFile).then((err) => {
                if (err) {
                    sendLog(`[Updater] Failed to open PKG: ${err}`);
                } else {
                    sendLog('[Updater] PKG opened. Quitting app...');
                    setTimeout(() => app.quit(), 1000);
                }
            });
        } else {
            // Standard flow
            sendLog('[Updater] Calling quitAndInstall...');
            try {
                autoUpdater.quitAndInstall(false, true);
            } catch (err) {
                sendLog(`[Updater] Failed to quit and install: ${err}`);
            }
        }
    });

    // Initial check
    setTimeout(() => {
        if (!app.isPackaged) {
            sendLog('[Updater] Skipping update check in dev mode');
            return;
        }

        sendLog('[Updater] triggering initial update check');
        autoUpdater.checkForUpdates().catch((err) => {
            sendLog(`[Updater] Check failed: ${err}`);
        });
    }, 3000);
}

