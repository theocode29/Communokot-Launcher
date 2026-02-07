import electronUpdater from 'electron-updater';
const { autoUpdater } = electronUpdater;
import { BrowserWindow, ipcMain } from 'electron';

export function initAutoUpdater(mainWindow: BrowserWindow): void {
    // Disable signature verification for unsigned builds if needed, usually handled by builder config
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;

    console.log('[Updater] Initializing auto-updater...');

    autoUpdater.on('checking-for-update', () => {
        console.log('[Updater] Checking for updates...');
        if (!mainWindow.isDestroyed()) {
            mainWindow.webContents.send('update:checking');
        }
    });

    autoUpdater.on('update-available', (info) => {
        console.log('[Updater] Update available:', info.version);
        if (!mainWindow.isDestroyed()) {
            mainWindow.webContents.send('update:available', info);
        }
    });

    autoUpdater.on('update-not-available', () => {
        console.log('[Updater] No updates available');
        // Optional: send event if we want to show "Up to date" in UI
    });

    autoUpdater.on('download-progress', (progress) => {
        console.log(`[Updater] Download progress: ${progress.percent.toFixed(1)}%`);
        if (!mainWindow.isDestroyed()) {
            mainWindow.webContents.send('update:progress', progress);
        }
    });

    autoUpdater.on('update-downloaded', (info) => {
        console.log('[Updater] Update downloaded:', info.version);
        if (!mainWindow.isDestroyed()) {
            mainWindow.webContents.send('update:ready', info);
        }
    });

    autoUpdater.on('error', (error) => {
        console.error('[Updater] Error:', error);
        if (!mainWindow.isDestroyed()) {
            mainWindow.webContents.send('update:error', error.message);
        }
    });

    // Handle install request from renderer
    ipcMain.on('update:install', () => {
        console.log('[Updater] Quit and install requested');
        autoUpdater.quitAndInstall(false, true);
    });

    // Initial check
    setTimeout(() => {
        autoUpdater.checkForUpdatesAndNotify().catch((err) => {
            console.error('[Updater] Check failed:', err);
        });
    }, 3000);
}

