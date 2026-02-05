import { motion } from 'framer-motion';

interface ProgressBarProps {
    progress: number;
    text?: string;
    className?: string;
}

const ProgressBar = ({ progress, text, className = '' }: ProgressBarProps) => {
    return (
        <div className={`w-full max-w-md flex flex-col items-center gap-3 ${className}`}>
            {/* Glass Container */}
            <div className="relative w-full h-2 bg-white/5 rounded-full overflow-hidden backdrop-blur-sm border border-white/10 shadow-inner">
                {/* Motion Bar */}
                <motion.div
                    className="absolute top-0 left-0 h-full bg-brand-primary shadow-[0_0_15px_rgba(230,179,37,0.6)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                    transition={{ duration: 0.5, ease: "circOut" }}
                />

                {/* Shine Effect */}
                <motion.div
                    className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                />
            </div>

            {/* Status Text using AnimatePresence would be nice, but simple text is fine for stability */}
            {text && (
                <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={text} // Re-animate on text change
                    className="text-white/70 text-xs font-mono tracking-wider uppercase"
                >
                    {text}
                </motion.p>
            )}
        </div>
    );
};

export default ProgressBar;
