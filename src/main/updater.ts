import electronUpdater from 'electron-updater';
const { autoUpdater } = electronUpdater;
import { BrowserWindow, ipcMain, app } from 'electron';

export function initAutoUpdater(mainWindow: BrowserWindow): void {
    // Disable auto-install on quit to prevent conflicts and loops
    autoUpdater.autoInstallOnAppQuit = false;
    autoUpdater.autoDownload = true;

    console.log('[Updater] Initializing auto-updater...');
    console.log('[Updater] Current version:', app.getVersion());

    autoUpdater.on('checking-for-update', () => {
        console.log('[Updater] Checking for updates...');
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('update:checking');
        }
    });

    autoUpdater.on('update-available', (info) => {
        console.log('[Updater] Update available:', info.version);
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('update:available', info);
        }
    });

    autoUpdater.on('update-not-available', (info) => {
        console.log('[Updater] No updates available. Latest version:', info.version);
    });

    autoUpdater.on('download-progress', (progress) => {
        console.log(`[Updater] Download progress: ${progress.percent.toFixed(1)}%`);
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('update:progress', progress);
        }
    });

    autoUpdater.on('update-downloaded', (info) => {
        console.log('[Updater] Update downloaded:', info.version);
        console.log('[Updater] Ready to install.');
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('update:ready', info);
        }
    });

    autoUpdater.on('error', (error) => {
        console.error('[Updater] Error:', error);
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('update:error', error instanceof Error ? error.message : String(error));
        }
    });

    // Handle install request from renderer
    ipcMain.on('update:install', () => {
        console.log('[Updater] Quit and install requested by user');
        // quitAndInstall(isSilent, isForceRunAfter)
        // We set isSilent to false so the installer UI (if any) might confirm, 
        // and isForceRunAfter to true to restart the app.
        // On macOS, this usually just quits and replaces the app bundle.
        try {
            autoUpdater.quitAndInstall(false, true);
        } catch (err) {
            console.error('[Updater] Failed to quit and install:', err);
        }
    });

    // Initial check
    setTimeout(() => {
        if (!app.isPackaged) {
            console.log('[Updater] Skipping update check in dev mode');
            return;
        }

        console.log('[Updater] triggering initial update check');
        autoUpdater.checkForUpdates().catch((err) => {
            console.error('[Updater] Check failed:', err);
        });
    }, 3000);
}

