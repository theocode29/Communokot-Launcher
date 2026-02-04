import type { TabConfig } from './types';

// Server Configuration
export const MC_SERVER = {
    host: 'mc1949282.fmcs.cloud',
    port: 25565,
    version: '1.21.11',
} as const;

// BlueMap Configuration
export const BLUEMAP = {
    baseUrl: 'http://mc1949282.fmcs.cloud:50100',
    worldName: 'world',
    // Default position for 3D view
    default3D: '#world:-25:13:-101:408:-0.1:0.87:0:0:perspective',
    // Default position for 2D view
    default2D: '#world:-25:14:-101:408:0:0:0:1:flat',
} as const;

// News API
export const NEWS_URL = 'https://raw.githubusercontent.com/theocode29/Communokot-Launcher/main/launcher-news/updates.json';

// Tab Configuration
export const TABS: TabConfig[] = [
    { id: 'home', label: 'ACCUEIL', number: '01', color: '#C4F623' },
    { id: 'map', label: 'CARTE', number: '02', color: '#3B82F6' },
    { id: 'updates', label: 'MISES À JOUR', number: '03', color: '#FF4500' },
    { id: 'settings', label: 'PARAMÈTRES', number: '04', color: '#D946EF' },
] as const;

// RAM Options
export const RAM_OPTIONS = [2, 4, 6, 8, 12, 16] as const;

// Server status polling interval (ms)
export const STATUS_POLL_INTERVAL = 30000;

// Debounce delay for config saves (ms)
export const CONFIG_SAVE_DELAY = 300;
