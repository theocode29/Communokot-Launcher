import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import Navigation from './components/Navigation';
import type { TabId, UserConfig, ServerStatus } from './types';
import { STATUS_POLL_INTERVAL } from './constants';

// Lazy load pages for performance
const HomePage = lazy(() => import('./pages/HomePage.tsx'));
const MapPage = lazy(() => import('./pages/MapPage.tsx'));
const UpdatesPage = lazy(() => import('./pages/UpdatesPage.tsx'));
const ParametersPage = lazy(() => import('./pages/ParametersPage.tsx'));

// Loading fallback
const PageLoader = () => (
    <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
);

export default function App() {
    const [activeTab, setActiveTab] = useState<TabId>('home');
    const [config, setConfig] = useState<UserConfig | null>(null);
    const [serverStatus, setServerStatus] = useState<ServerStatus>({ online: false });
    const [appVersion, setAppVersion] = useState<string>('1.0.0');

    // Load initial config and version
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                if (window.electron) {
                    const [loadedConfig, version] = await Promise.all([
                        window.electron.getAllConfig(),
                        window.electron.getVersion(),
                    ]);
                    setConfig(loadedConfig as UserConfig);
                    setAppVersion(version);
                } else {
                    // Mock config for browser development
                    setConfig({
                        username: 'Player',
                        ram: 4,
                        javaPath: 'auto',
                        minecraftPath: '',
                    });
                }
            } catch (error) {
                console.error('Failed to load config:', error);
            }
        };

        loadInitialData();
    }, []);

    // Poll server status
    const checkServerStatus = useCallback(async () => {
        try {
            if (window.electron) {
                const status = await window.electron.getServerStatus();
                console.log('[App] Server status received:', status);
                setServerStatus(status);
            } else {
                console.warn('[App] window.electron is undefined - preload failed');
                setServerStatus({ online: false });
            }
        } catch (error) {
            console.error('[App] Failed to check server status:', error);
            setServerStatus({ online: false });
        }
    }, []);

    useEffect(() => {
        checkServerStatus();
        const interval = setInterval(checkServerStatus, STATUS_POLL_INTERVAL);
        return () => clearInterval(interval);
    }, [checkServerStatus]);

    // Update config
    const updateConfig = useCallback(async (key: keyof UserConfig, value: string | number) => {
        if (window.electron) {
            await window.electron.setConfig(key, value);
        }
        setConfig((prev) => prev ? { ...prev, [key]: value } : null);
    }, []);

    // Launch game
    const launchGame = useCallback(async () => {
        if (!config || !window.electron) return { success: false, error: 'Not ready' };

        return window.electron.launchMinecraft({
            username: config.username,
            ram: config.ram,
            javaPath: config.javaPath || undefined,
            minecraftPath: config.minecraftPath || undefined,
        });
    }, [config]);

    // Render active page
    const renderPage = () => {
        switch (activeTab) {
            case 'home':
                return (
                    <HomePage
                        serverStatus={serverStatus}
                        version={appVersion}
                        onLaunch={launchGame}
                    />
                );
            case 'map':
                return <MapPage />;
            case 'updates':
                return <UpdatesPage />;
            case 'settings':
                return config ? (
                    <ParametersPage config={config} onConfigChange={updateConfig} />
                ) : (
                    <PageLoader />
                );
            default:
                return null;
        }
    };

    return (
        <div className="h-screen flex flex-col bg-surface text-text-primary overflow-hidden">
            {/* Background image */}
            <div
                className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: 'url(/background_01.jpg)',
                    filter: 'brightness(0.7)',
                }}
            />

            {/* Content overlay */}
            <div className="relative z-10 flex flex-col h-full">
                {/* Navigation */}
                <Navigation
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />

                {/* Page content */}
                <main className="flex-1 overflow-hidden">
                    <Suspense fallback={<PageLoader />}>
                        {renderPage()}
                    </Suspense>
                </main>
            </div>
        </div>
    );
}
