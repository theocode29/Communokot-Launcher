// Tab types
export type TabId = 'home' | 'map' | 'updates' | 'settings';

// Tab configuration
export interface TabConfig {
    id: TabId;
    label: string;
    number: string;
    color: string;
}

// Server status
export interface ServerStatus {
    online: boolean;
    players?: {
        online: number;
        max: number;
    };
    latency?: number;
    version?: string;
    motd?: string;
}

// News/Update item
export interface NewsItem {
    id: string;
    title: string;
    subtitle?: string;
    content: string;
    image: string;
    date: string;
}

// User configuration
export interface UserConfig {
    username: string;
    ram: number;
    javaPath: string;
    minecraftPath: string;
}

// Launch result
export interface LaunchResult {
    success: boolean;
    error?: string;
}

// Electron API (from preload)
export interface ElectronAPI {
    minimize: () => void;
    maximize: () => void;
    close: () => void;
    quit: () => void;
    getConfig: (key: string) => Promise<unknown>;
    setConfig: (key: string, value: unknown) => Promise<boolean>;
    getAllConfig: () => Promise<UserConfig>;
    openFile: (options?: { title?: string; filters?: { name: string; extensions: string[] }[] }) => Promise<string | null>;
    openFolder: (options?: { title?: string }) => Promise<string | null>;
    getServerStatus: () => Promise<ServerStatus>;
    launchMinecraft: (options: {
        username: string;
        ram: number;
        javaPath?: string;
        minecraftPath?: string;
    }) => Promise<LaunchResult>;
    getVersion: () => Promise<string>;
    getPlatform: () => Promise<string>;
    on: (channel: string, func: (...args: any[]) => void) => () => void;
}

declare global {
    interface Window {
        electron: ElectronAPI;
    }
}
