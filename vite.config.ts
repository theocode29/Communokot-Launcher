import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';
import { resolve } from 'path';

export default defineConfig({
    plugins: [
        react(),
        electron([
            {
                entry: 'src/main/index.ts',
                onstart(args) {
                    args.startup();
                },
                vite: {
                    build: {
                        outDir: 'dist/main',
                        rollupOptions: {
                            external: ['electron', 'electron-store', 'electron-updater'],
                        },
                    },
                },
            },
        ]),
        renderer(),
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src/renderer'),
            '@main': resolve(__dirname, 'src/main'),
        },
    },
    publicDir: 'public',
    build: {
        outDir: 'dist/renderer',
        emptyOutDir: true,
    },
    server: {
        port: 5173,
        strictPort: true,
    },
    optimizeDeps: {
        exclude: ['electron'],
    },
});
