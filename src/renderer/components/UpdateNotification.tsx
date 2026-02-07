import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, CheckCircle2, RefreshCw, XCircle } from 'lucide-react';

interface UpdateProgress {
    percent: number;
    transferred: number;
    total: number;
    bytesPerSecond: number;
}

interface UpdateInfo {
    version: string;
    files: { url: string; sha512: string; size: number }[];
    path: string;
    sha512: string;
    releaseName: string;
    releaseNotes: string;
    releaseDate: string;
}

export default function UpdateNotification() {
    const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'downloading' | 'downloaded' | 'error'>('idle');
    const [progress, setProgress] = useState<UpdateProgress | null>(null);
    const [version, setVersion] = useState<string>('');

    useEffect(() => {
        if (!window.electron) return;

        const cleanupAvailable = window.electron.on('update:available', (info: UpdateInfo) => {
            setStatus('available');
            setVersion(info.version);
        });

        const cleanupProgress = window.electron.on('update:progress', (prog: UpdateProgress) => {
            setStatus('downloading');
            setProgress(prog);
        });

        const cleanupReady = window.electron.on('update:ready', () => {
            setStatus('downloaded');
        });

        const cleanupError = window.electron.on('update:error', () => {
            setStatus('error');
        });

        return () => {
            // Assuming window.electron.on returns a cleanup function or we need to handle it.
            // Based on typical ipcRenderer patterns, we might need a distinct off method or the on method returns a disposer.
            // Let's assume standard disposal for now, if not we'll adjustment.
            cleanupAvailable();
            cleanupProgress();
            cleanupReady();
            cleanupError();
        };
    }, []);

    if (status === 'idle' || status === 'checking') return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-4 right-4 z-50 w-80 bg-deep border border-black/5 rounded-lg shadow-xl overflow-hidden backdrop-blur-md"
            >
                <div className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                        {status === 'downloading' && <Download className="w-5 h-5 text-brand-primary animate-pulse" />}
                        {status === 'downloaded' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                        {status === 'available' && <RefreshCw className="w-5 h-5 text-blue-400" />}
                        {status === 'error' && <XCircle className="w-5 h-5 text-red-500" />}

                        <div className="flex-1">
                            <h3 className="text-sm font-medium text-text-main">
                                {status === 'available' && `Mise à jour ${version} détectée`}
                                {status === 'downloading' && `Téléchargement de la ${version}...`}
                                {status === 'downloaded' && `Mise à jour prête !`}
                                {status === 'error' && `Erreur de mise à jour`}
                            </h3>
                            {status === 'available' && (
                                <p className="text-xs text-text-muted">Le téléchargement va commencer...</p>
                            )}
                        </div>
                    </div>

                    {status === 'downloading' && progress && (
                        <div className="space-y-1">
                            <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-brand-primary"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress.percent}%` }}
                                    transition={{ duration: 0.1 }}
                                />
                            </div>
                            <div className="flex justify-between text-[10px] text-text-muted">
                                <span>{(progress.transferred / 1024 / 1024).toFixed(1)} MB / {(progress.total / 1024 / 1024).toFixed(1)} MB</span>
                                <span>{progress.percent.toFixed(0)}%</span>
                            </div>
                        </div>
                    )}

                    {status === 'downloaded' && (
                        <div className="mt-2">
                            <button
                                onClick={() => window.electron.installUpdate()}
                                className="w-full px-3 py-1.5 text-xs font-medium text-white bg-brand-primary hover:bg-brand-primary/90 rounded transition-colors"
                            >
                                Redémarrer pour installer
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
