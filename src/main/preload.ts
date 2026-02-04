import { contextBridge, ipcRenderer } from 'electron';

// Types for the exposed API
export interface ElectronAPI {
    // Window controls
    minimize: () => void;
    maximize: () => void;
    close: () => void;
    quit: () => void;

    // Config
    getConfig: (key: string) => Promise<unknown>;
    setConfig: (key: string, value: unknown) => Promise<boolean>;
    getAllConfig: () => Promise<Record<string, unknown>>;

    // Dialogs
    openFile: (options?: { title?: string; filters?: { name: string; extensions: string[] }[] }) => Promise<string | null>;
    openFolder: (options?: { title?: string }) => Promise<string | null>;

    // Server
    getServerStatus: () => Promise<{ online: boolean; players?: { online: number; max: number } }>;

    // Minecraft
    launchMinecraft: (options: {
        username: string;
        ram: number;
        javaPath?: string;
        minecraftPath?: string;
    }) => Promise<{ success: boolean; error?: string }>;

    // App info
    getVersion: () => Promise<string>;
    getPlatform: () => Promise<string>;

    // Events
    on: (channel: string, func: (...args: unknown[]) => void) => () => void;
}

// Expose protected methods to renderer
const electronAPI: ElectronAPI = {
    // Window controls
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
    quit: () => ipcRenderer.send('app:quit'),

    // Config
    getConfig: (key) => ipcRenderer.invoke('config:get', key),
    setConfig: (key, value) => ipcRenderer.invoke('config:set', key, value),
    getAllConfig: () => ipcRenderer.invoke('config:getAll'),

    // Dialogs
    openFile: (options) => ipcRenderer.invoke('dialog:openFile', options),
    openFolder: (options) => ipcRenderer.invoke('dialog:openFolder', options),

    // Server
    getServerStatus: () => ipcRenderer.invoke('server:status'),

    // Minecraft
    launchMinecraft: (options) => ipcRenderer.invoke('minecraft:launch', options),

    // App info
    getVersion: () => ipcRenderer.invoke('app:version'),
    getPlatform: () => ipcRenderer.invoke('app:platform'),

    // Events
    on: (channel, func) => {
        const subscription = (_: unknown, ...args: unknown[]) => func(...args);
        ipcRenderer.on(channel, subscription);
        return () => {
            ipcRenderer.removeListener(channel, subscription);
        };
    },
};

contextBridge.exposeInMainWorld('electron', electronAPI);

// Type declaration for renderer
declare global {
    interface Window {
        electron: ElectronAPI;
    }
}
