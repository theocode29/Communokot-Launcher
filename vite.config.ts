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
            {
                entry: 'src/main/preload.ts',
                onstart(args) {
                    args.reload();
                },
                vite: {
                    build: {
                        outDir: 'dist/main',
                        emptyOutDir: false, // Don't empty as we are building into same dir as main
                        lib: {
                            entry: 'src/main/preload.ts',
                            formats: ['cjs'],
                            fileName: 'preload',
                        },
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
        // Optimize chunking for better caching and faster initial load
        rollupOptions: {
            output: {
                manualChunks: {
                    // Core React - cached separately, rarely changes
                    'react-vendor': ['react', 'react-dom'],
                    // Animation library - heavy, load separately
                    'animation': ['framer-motion'],
                    // UI utilities - icons and toasts
                    'ui': ['lucide-react', 'sonner', 'clsx', 'tailwind-merge'],
                },
            },
        },
    },
    server: {
        port: 5173,
        strictPort: true,
    },
    optimizeDeps: {
        exclude: ['electron'],
    },
});
