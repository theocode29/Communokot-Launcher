import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('electron-store', () => {
    class MockStore<T extends Record<string, unknown>> {
        private readonly data = new Map<string, unknown>();

        constructor(options?: { defaults?: T }) {
            if (options?.defaults) {
                for (const [key, value] of Object.entries(options.defaults)) {
                    this.data.set(key, value);
                }
            }
        }

        get<K extends keyof T>(key: K): T[K] {
            return this.data.get(key as string) as T[K];
        }

        set<K extends keyof T>(key: K, value: T[K]): void {
            this.data.set(key as string, value);
        }

        clear(): void {
            this.data.clear();
        }
    }

    return { default: MockStore };
});

describe('config defaults and controller mode flag', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it('should expose controllerModeEnabled with default false', async () => {
        const { getConfig, getAllConfig } = await import('./config');

        expect(getConfig('controllerModeEnabled')).toBe(false);
        expect(getAllConfig().controllerModeEnabled).toBe(false);
    });

    it('should persist controllerModeEnabled updates', async () => {
        const { setConfig, getConfig, getAllConfig } = await import('./config');

        setConfig('controllerModeEnabled', true);

        expect(getConfig('controllerModeEnabled')).toBe(true);
        expect(getAllConfig().controllerModeEnabled).toBe(true);
    });
});
