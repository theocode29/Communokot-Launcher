import electronUpdater from 'electron-updater';
const { autoUpdater } = electronUpdater;
import { BrowserWindow, ipcMain, app } from 'electron';

export function initAutoUpdater(mainWindow: BrowserWindow): void {
    // CRITICAL: Disable signature verification for unsigned builds
    // This is required because we are not code-signing the application on macOS
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (autoUpdater as any).verifyUpdateCodeSignature = false;

    // Disable auto-install on quit to prevent conflicts and loops
    autoUpdater.autoInstallOnAppQuit = false;
    autoUpdater.autoDownload = true;

    const sendLog = (message: string) => {
        console.log(message);
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('update:log', message);
        }
    };

    sendLog('[Updater] Initializing auto-updater...');
    sendLog(`[Updater] Current version: ${app.getVersion()}`);
    sendLog('[Updater] Signature verification disabled (unsigned mode)');

    autoUpdater.on('checking-for-update', () => {
        sendLog('[Updater] Checking for updates...');
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('update:checking');
        }
    });

    autoUpdater.on('update-available', (info) => {
        sendLog(`[Updater] Update available: ${info.version}`);
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('update:available', info);
        }
    });

    autoUpdater.on('update-not-available', (info) => {
        sendLog(`[Updater] No updates available. Latest: ${info.version}`);
    });

    autoUpdater.on('download-progress', (progress) => {
        // Don't spam logs with progress, just console
        console.log(`[Updater] Download progress: ${progress.percent.toFixed(1)}%`);
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('update:progress', progress);
        }
    });

    autoUpdater.on('update-downloaded', (info) => {
        sendLog(`[Updater] Update downloaded: ${info.version}`);
        sendLog('[Updater] Ready to install. Waiting for user trigger.');
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('update:ready', info);
        }
    });

    autoUpdater.on('error', (error) => {
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
        sendLog('[Updater] IPC: User requested install. Calling quitAndInstall...');
        // quitAndInstall(isSilent, isForceRunAfter)
        try {
            autoUpdater.quitAndInstall(false, true);
        } catch (err) {
            sendLog(`[Updater] Failed to quit and install: ${err}`);
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

