// CommonJS preload script for Electron
// Must use require() instead of import for proper CJS compatibility
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to renderer
const electronAPI = {
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
};

contextBridge.exposeInMainWorld('electron', electronAPI);
