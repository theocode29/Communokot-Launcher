import { useState, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import ServerStatusBadge from '../components/ServerStatus';
import type { ServerStatus, LaunchResult } from '../types';
import { Play } from 'lucide-react';

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
        <div
            className="h-full flex flex-col items-center justify-center text-center relative pointer-events-auto"
        >
            {/* Content Container */}
            <motion.div
                className="z-10 flex flex-col items-center gap-10 -mt-20"
            >
                {/* Title Group */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="relative flex flex-col items-center"
                >
                    {/* Shadow/Glow behind title */}
                    <h1
                        className="absolute inset-0 blur-2xl opacity-50 text-brand-primary pointer-events-none select-none text-8xl md:text-9xl font-black tracking-tighter leading-[0.85]"
                    >
                        COMMUNO<br />KOT
                    </h1>

                    <h1 className="text-8xl md:text-9xl font-black tracking-tighter text-white drop-shadow-2xl leading-[0.85] z-10 relative">
                        COMMUNO<br />KOT
                    </h1>

                    {/* Server Status Capsule - Integrated directly below title */}
                    <div className="mt-8 z-20">
                        <ServerStatusBadge status={serverStatus} />
                    </div>
                </motion.div>

                {/* Launch Button Area */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-4 flex flex-col items-center gap-6"
                >
                    <Button
                        size="lg"
                        variant={launching ? 'secondary' : (serverStatus.online ? 'primary' : 'secondary')}
                        onClick={handleLaunch}
                        loading={launching}
                        disabled={!serverStatus.online}
                        className={`text-lg px-12 py-6 tracking-widest font-black shadow-[0_0_50px_rgba(251,191,36,0.0)] hover:shadow-[0_0_50px_rgba(251,191,36,0.3)] transition-shadow duration-500 ${!serverStatus.online ? 'opacity-50 grayscale cursor-not-allowed bg-surface border-white/10' : ''}`}
                        icon={!launching && <Play fill="currentColor" size={20} />}
                    >
                        {launching ? 'INITIALISATION...' : (serverStatus.online ? 'JOUER' : 'HORS LIGNE')}
                    </Button>

                    <div className="h-6">
                        {/* Spacer for error to prevent layout jump, or absolute positioning */}
                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-error font-mono text-xs uppercase tracking-wider bg-black/50 px-3 py-1 rounded border border-error/20"
                            >
                                [ERREUR] {error}
                            </motion.p>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
});

export default HomePage;
