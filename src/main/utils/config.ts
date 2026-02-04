import Store from 'electron-store';

export interface ConfigSchema {
    username: string;
    ram: number;
    javaPath: string;
    minecraftPath: string;
}

const defaults: ConfigSchema = {
    username: 'Player',
    ram: 4,
    javaPath: 'auto',
    minecraftPath: '',
};

const store = new Store<ConfigSchema>({
    name: 'config',
    defaults,
    clearInvalidConfig: true,
});

export function getConfig<K extends keyof ConfigSchema>(key: K): ConfigSchema[K] {
    return store.get(key);
}

export function setConfig<K extends keyof ConfigSchema>(key: K, value: ConfigSchema[K]): void {
    store.set(key, value);
}

export function getAllConfig(): ConfigSchema {
    return {
        username: store.get('username'),
        ram: store.get('ram'),
        javaPath: store.get('javaPath'),
        minecraftPath: store.get('minecraftPath'),
    };
}

export function resetConfig(): void {
    store.clear();
}
