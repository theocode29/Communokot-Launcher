// Preload script for Electron - Pure CommonJS
// This file is copied directly to dist, no bundler transformation
const { contextBridge, ipcRenderer } = require('electron');

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

    // Server status - fetches from freemcserver.net API
    getServerStatus: () => ipcRenderer.invoke('server:status'),

    // Minecraft
    launchMinecraft: (options) => ipcRenderer.invoke('minecraft:launch', options),

    // App info
    getVersion: () => ipcRenderer.invoke('app:version'),
    getPlatform: () => ipcRenderer.invoke('app:platform'),
};

contextBridge.exposeInMainWorld('electron', electronAPI);
