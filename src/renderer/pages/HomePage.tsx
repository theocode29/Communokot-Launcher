import { useState, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import ServerStatusBadge from '../components/ServerStatus';
import type { ServerStatus, LaunchResult } from '../types';
import { MC_SERVER } from '../constants';

interface HomePageProps {
    serverStatus: ServerStatus;
    version: string;
    onLaunch: () => Promise<LaunchResult>;
}

const HomePage = memo(function HomePage({ serverStatus, onLaunch }: HomePageProps) {
    const [launching, setLaunching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLaunch = useCallback(async () => {
        setLaunching(true);
        setError(null);

        try {
            const result = await onLaunch();
            if (!result.success) {
                setError(result.error || 'Échec du lancement');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
        } finally {
            setLaunching(false);
        }
    }, [onLaunch]);

    return (
        <div className="relative h-full flex flex-col">
            {/* Main content area */}
            <div className="flex-1 flex flex-col justify-end p-8">
                {/* Server status badge - top right */}
                <div className="absolute top-8 right-8">
                    <ServerStatusBadge status={serverStatus} />
                </div>

                {/* Title */}
                <motion.h1
                    className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    COMMUNOKOT
                </motion.h1>

                {/* Server info */}
                <motion.p
                    className="text-text-secondary text-sm mb-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    {MC_SERVER.host}:{MC_SERVER.port}
                </motion.p>
            </div>

            {/* Bottom bar */}
            <motion.div
                className="glass border-t border-white/10 px-8 py-4 flex items-center justify-between"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
            >
                {/* Version info */}
                <div>
                    <p className="text-xs text-text-muted uppercase tracking-wider mb-1">VERSION</p>
                    <p className="text-lg font-mono font-bold">{MC_SERVER.version}</p>
                </div>

                {/* Error message */}
                {error && (
                    <div className="flex-1 mx-8">
                        <p className="text-status-offline text-sm">{error}</p>
                    </div>
                )}

                {/* Play button */}
                <Button
                    variant="primary"
                    size="lg"
                    onClick={handleLaunch}
                    loading={launching}
                    disabled={!serverStatus.online}
                    className="min-w-[200px]"
                >
                    {launching ? 'LANCEMENT...' : 'JOUER'}
                    {!launching && (
                        <svg
                            className="w-5 h-5 ml-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14 5l7 7m0 0l-7 7m7-7H3"
                            />
                        </svg>
                    )}
                </Button>
            </motion.div>
        </div>
    );
});

export default HomePage;
