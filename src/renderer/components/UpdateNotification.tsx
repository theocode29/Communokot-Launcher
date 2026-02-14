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
    const [logs, setLogs] = useState<string[]>([]);
    const [showLogs, setShowLogs] = useState(false);

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
            setShowLogs(true); // Auto-show logs on error
        });

        // Log listener
        const cleanupLogs = window.electron.on('update:log', (message: unknown) => {
            if (typeof message === 'string') {
                setLogs(prev => [...prev.slice(-19), message]); // Keep last 20 logs
            }
        });

        return () => {
            cleanupAvailable();
            cleanupProgress();
            cleanupReady();
            cleanupError();
            cleanupLogs();
        };
    }, []);

    if (status === 'idle' && !showLogs) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-4 right-4 z-50 w-96 bg-deep border border-black/5 rounded-lg shadow-xl overflow-hidden backdrop-blur-md flex flex-col max-h-[80vh]"
            >
                <div className="p-4 bg-deep/50 border-b border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        {status === 'downloading' && <Download className="w-5 h-5 text-brand-primary animate-pulse" />}
                        {status === 'downloaded' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                        {status === 'available' && <RefreshCw className="w-5 h-5 text-blue-400" />}
                        {status === 'error' && <XCircle className="w-5 h-5 text-red-500" />}

                        <h3 className="text-sm font-medium text-text-main">
                            {status === 'available' && `Mise à jour ${version}`}
                            {status === 'downloading' && `Téléchargement ${version}...`}
                            {status === 'downloaded' && `Mise à jour prête`}
                            {status === 'error' && `Erreur mise à jour`}
                            {status === 'idle' && `Journal de mise à jour`}
                        </h3>
                    </div>
                    <button
                        onClick={() => setShowLogs(!showLogs)}
                        className="text-xs text-text-muted hover:text-text-main underline"
                    >
                        {showLogs ? 'Masquer logs' : 'Voir logs'}
                    </button>
                </div>

                <div className="p-4">
                    {status === 'available' && (
                        <p className="text-xs text-text-muted mb-2">Le téléchargement va commencer...</p>
                    )}

                    {status === 'downloading' && progress && (
                        <div className="space-y-1 mb-2">
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

                    {showLogs && (
                        <div className="mt-4 p-2 bg-black/20 rounded border border-white/5 h-48 overflow-y-auto custom-scrollbar">
                            {logs.length === 0 ? (
                                <p className="text-[10px] text-text-muted italic">Aucun log disponible...</p>
                            ) : (
                                logs.map((log, i) => (
                                    <p key={i} className="text-[10px] text-text-muted font-mono whitespace-pre-wrap mb-1">
                                        {log}
                                    </p>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
