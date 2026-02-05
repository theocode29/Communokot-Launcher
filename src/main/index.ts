import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import electronUpdater from 'electron-updater';
const { autoUpdater } = electronUpdater;
import { launchMinecraft, type LaunchOptions } from './minecraft';
import { checkServerStatus } from './serverStatus';
import { getConfig, setConfig, getAllConfig, type ConfigSchema } from './utils/config';

// ESM __dirname polyfill
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// App is ready when this module is loaded

let mainWindow: BrowserWindow | null = null;

const isDev = !app.isPackaged;

// ============================================
// GPU & Performance Optimization Switches
// Must be set before app.whenReady()
// ============================================

// Enable hardware acceleration (safe for all platforms)
app.commandLine.appendSwitch('enable-accelerated-2d-canvas');

// Enable WebGL (essential for BlueMap)
app.commandLine.appendSwitch('ignore-gpu-blacklist');

// Use high-performance GPU on laptops with dual graphics
app.commandLine.appendSwitch('force_high_performance_gpu');

function createWindow(): void {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 1024,
        minHeight: 700,
        frame: false,
        transparent: false,
        backgroundColor: '#0D0D0D',
        webPreferences: {
            preload: join(__dirname, 'preload.cjs'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false,
            webviewTag: true, // Enable webview for BlueMap control
            webSecurity: false, // Allow loading HTTP BlueMap in iframe
            allowRunningInsecureContent: true,
        },
        icon: join(__dirname, '../../public/icon.png'),
    });

    // Load the app
    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools({ mode: 'detach' });
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
    }

    // Handle external links
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// App lifecycle
app.whenReady().then(() => {
    createWindow();

    // Auto Updater Configuration
    autoUpdater.autoDownload = true;
    autoUpdater.allowPrerelease = false;

    // Send update events to renderer
    autoUpdater.on('checking-for-update', () => {
        mainWindow?.webContents.send('update:checking');
    });

    autoUpdater.on('update-available', (info) => {
        mainWindow?.webContents.send('update:available', info);
    });

    autoUpdater.on('download-progress', (progressObj) => {
        mainWindow?.webContents.send('update:progress', progressObj);
    });

    autoUpdater.on('update-downloaded', (info) => {
        mainWindow?.webContents.send('update:ready', info);
    });

    autoUpdater.on('error', (err) => {
        console.error('AutoUpdater Error:', err);
        mainWindow?.webContents.send('update:error', err.message);
    });

    // Check for updates immediately
    autoUpdater.checkForUpdatesAndNotify().catch(err => {
        console.error('Failed to check for updates:', err);
    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// ============================================
// IPC Handlers
// ============================================

// Window controls
ipcMain.on('window:minimize', () => {
    mainWindow?.minimize();
});

ipcMain.on('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
        mainWindow.unmaximize();
    } else {
        mainWindow?.maximize();
    }
});

ipcMain.on('window:close', () => {
    mainWindow?.close();
});

ipcMain.on('app:quit', () => {
    app.quit();
});

// Config management
ipcMain.handle('config:get', async (_, key: string) => {
    return getConfig(key as keyof ConfigSchema);
});

ipcMain.handle('config:set', async (_, key: string, value: unknown) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setConfig(key as keyof ConfigSchema, value as any);
    return true;
});

ipcMain.handle('config:getAll', async () => {
    return getAllConfig();
});

// Dialog for file/folder selection
ipcMain.handle('dialog:openFile', async (_, options?: Electron.OpenDialogOptions) => {
    const result = await dialog.showOpenDialog(mainWindow!, {
        properties: ['openFile', 'showHiddenFiles'],
        ...options,
    });
    return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('dialog:openFolder', async (_, options?: Electron.OpenDialogOptions) => {
    const result = await dialog.showOpenDialog(mainWindow!, {
        properties: ['openDirectory', 'showHiddenFiles'],
        ...options,
    });
    return result.canceled ? null : result.filePaths[0];
});

// Server status
ipcMain.handle('server:status', async () => {
    return checkServerStatus();
});

// Minecraft launching
ipcMain.handle('minecraft:launch', async (_, options: LaunchOptions) => {
    console.log('[IPC] Received minecraft:launch request');
    try {
        const onProgress = (task: string, progress: number) => {
            console.log(`[IPC] Progress update: ${task} (${progress}%)`);
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('launch:progress', { task, progress });
            }
        };

        console.log('[IPC] Calling launching logic...');
        const result = await launchMinecraft({ ...options, onProgress });
        console.log('[IPC] Launch logic completed with result:', result);
        return result;
    } catch (error) {
        console.error('[IPC] FATAL ERROR in minecraft:launch:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown critical error'
        };
    }
});

// Get app version
ipcMain.handle('app:version', () => {
    return app.getVersion();
});

// Get platform
ipcMain.handle('app:platform', () => {
    return process.platform;
});
