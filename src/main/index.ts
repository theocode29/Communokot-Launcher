import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { launchMinecraft, type LaunchOptions } from './minecraft';
import { checkServerStatus } from './serverStatus';
import { getConfig, setConfig, getAllConfig, type ConfigSchema } from './utils/config';

// ESM __dirname polyfill
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// App is ready when this module is loaded

let mainWindow: BrowserWindow | null = null;

const isDev = !app.isPackaged;

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
            preload: join(__dirname, '../renderer/preload.cjs'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false,
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
        properties: ['openFile'],
        ...options,
    });
    return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('dialog:openFolder', async (_, options?: Electron.OpenDialogOptions) => {
    const result = await dialog.showOpenDialog(mainWindow!, {
        properties: ['openDirectory'],
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
    try {
        const result = await launchMinecraft(options);
        return result;
    } catch (error) {
        console.error('Failed to launch Minecraft:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
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
