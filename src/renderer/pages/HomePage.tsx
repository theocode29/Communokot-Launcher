import { useState, useCallback, memo, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import ServerStatusBadge from '../components/ServerStatus';
import ProgressBar from '../components/ProgressBar';
import type { ServerStatus, LaunchResult } from '../types';
import { Play } from 'lucide-react';

interface HomePageProps {
    serverStatus: ServerStatus;
    version: string;
    onLaunch: () => Promise<LaunchResult>;
}

const HomePage = memo(function HomePage({ serverStatus, onLaunch }: HomePageProps) {
    const [launching, setLaunching] = useState(false);
    const [cooldown, setCooldown] = useState(false);
    const [cooldownTime, setCooldownTime] = useState(0);
    const [error, setError] = useState<string | null>(null);

    // Progress State
    const [progress, setProgress] = useState(0);
    const [progressText, setProgressText] = useState('');

    useEffect(() => {
        // Cooldown timer
        if (cooldownTime > 0) {
            const timer = setInterval(() => {
                setCooldownTime((prev) => Math.max(0, prev - 1));
            }, 1000);
            return () => clearInterval(timer);
        } else if (cooldownTime === 0 && cooldown) {
            setCooldown(false);
        }
    }, [cooldownTime, cooldown]);

    useEffect(() => {
        // Listen for progress events
        const removeListener = window.electron.on('launch:progress', (data: any) => {
            setProgress(data.progress);
            setProgressText(data.task);
        });

        return () => {
            removeListener();
        };
    }, []);

    const handleLaunch = useCallback(async () => {
        if (cooldown) return;

        setLaunching(true);
        setError(null);
        setProgress(0);
        setProgressText("Initialisation...");

        try {
            const result = await onLaunch();
            if (!result.success) {
                setError(result.error || 'Échec du lancement');
                setLaunching(false); // Only stop launching state if error
            } else {
                // Success - wait a bit then start cooldown
                // Usually we consider it launched
                setLaunching(false);
                setCooldown(true);
                setCooldownTime(60); // 1 minute cooldown
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
            setLaunching(false);
        }
    }, [onLaunch, cooldown]);

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
                        className="absolute inset-0 blur-2xl opacity-50 text-brand-primary pointer-events-none select-none text-7xl md:text-8xl font-black tracking-tighter"
                    >
                        COMMUNOKOT
                    </h1>

                    <h1 className="text-7xl md:text-8xl font-black tracking-tighter text-white drop-shadow-2xl z-10 relative">
                        COMMUNOKOT
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
                    className="mt-4 flex flex-col items-center gap-6 w-full max-w-lg px-4"
                >
                    <Button
                        size="lg"
                        variant={launching || cooldown ? 'secondary' : (serverStatus.online ? 'primary' : 'secondary')}
                        onClick={handleLaunch}
                        loading={launching} // We keep this true during launch to show spinner/disabled state
                        disabled={!serverStatus.online || cooldown || launching}
                        className={`text-lg px-12 py-6 tracking-widest font-black shadow-[0_0_50px_rgba(230,179,37,0.0)] hover:shadow-[0_0_50px_rgba(230,179,37,0.3)] transition-shadow duration-500 ${(!serverStatus.online || cooldown || launching) ? 'opacity-50 grayscale cursor-not-allowed bg-surface border-black/5' : ''}`}
                        icon={!launching && !cooldown && <Play fill="currentColor" size={20} />}
                    >
                        {launching ? 'LANCEMENT EN COURS...' : (cooldown ? `PATIENTER (${cooldownTime}s)` : (serverStatus.online ? 'JOUER' : 'HORS LIGNE'))}
                    </Button>

                    {/* Progress Bar Container */}
                    <div className="w-full h-12 flex items-center justify-center">
                        {launching && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="w-full"
                            >
                                <ProgressBar progress={progress} text={progressText} />
                            </motion.div>
                        )}

                        {/* Spacer for error to prevent layout jump */}
                        {!launching && error && (
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
