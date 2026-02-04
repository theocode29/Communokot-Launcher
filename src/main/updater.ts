import { autoUpdater } from 'electron-updater';
import { BrowserWindow, dialog, shell, app } from 'electron';
import { join } from 'path';

export function initAutoUpdater(mainWindow: BrowserWindow): void {
    // Disable signature verification for unsigned builds (crucial for this setup)
    // mostly handled by electron-builder config, but good to ensure
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;

    console.log('[Updater] Initializing auto-updater...');

    autoUpdater.on('checking-for-update', () => {
        console.log('[Updater] Checking for updates...');
        mainWindow.webContents.send('update:status', 'checking');
    });

    autoUpdater.on('update-available', (info) => {
        console.log('[Updater] Update available:', info.version);
        mainWindow.webContents.send('update:available', info);
        mainWindow.webContents.send('update:status', 'available');
    });

    autoUpdater.on('update-not-available', () => {
        console.log('[Updater] No updates available');
        mainWindow.webContents.send('update:status', 'not-available');
    });

    autoUpdater.on('download-progress', (progress) => {
        console.log(`[Updater] Download progress: ${progress.percent.toFixed(1)}%`);
        mainWindow.webContents.send('update:progress', progress);
        mainWindow.webContents.send('update:status', 'downloading');
    });

    autoUpdater.on('update-downloaded', (info) => {
        console.log('[Updater] Update downloaded:', info.version);
        mainWindow.webContents.send('update:ready', info);
        mainWindow.webContents.send('update:status', 'downloaded');

        // Platform specific handling
        if (process.platform === 'darwin') {
            dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: 'Mise à jour prête',
                message: `La version ${info.version} a été téléchargée. Elle va s'ouvrir automatiquement. Merci de glisser l'application dans votre dossier Applications.`,
                buttons: ['Ouvrir']
            }).then(() => {
                // Determine the path to the downloaded file. 
                // Electron-updater usually stores it in standard cache locations.
                // For DMG updates on Mac, we might need to guide the user or just let them know.
                // Actually, standard behavior for dmg target might not auto-mount in valid electron-updater flow without signing.
                // But let's try to find the file or just notify.

                // For "dmg" target, electron-updater might just download it.
                // We can try to open the directory.
                if (info.downloadedFile) {
                    shell.showItemInFolder(info.downloadedFile);
                    shell.openPath(info.downloadedFile);
                } else {
                    // Fallback if path isn't readily available in info object for some versions
                    // Usually it is.
                }
                setImmediate(() => {
                    app.quit();
                });
            });
        } else {
            // Windows / Linux
            dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: 'Mise à jour prête',
                message: `La version ${info.version} est prête. L'application va redémarrer pour l'installer.`,
                buttons: ['Redémarrer maintenant', 'Plus tard']
            }).then((result) => {
                if (result.response === 0) {
                    autoUpdater.quitAndInstall(false, true);
                }
            });
        }
    });

    autoUpdater.on('error', (error) => {
        console.error('[Updater] Error:', error);
        mainWindow.webContents.send('update:error', error.message);
        mainWindow.webContents.send('update:status', 'error');
    });

    // Initial check
    setTimeout(() => {
        autoUpdater.checkForUpdatesAndNotify().catch((err) => {
            console.error('[Updater] Check failed:', err);
        });
    }, 3000);
}

