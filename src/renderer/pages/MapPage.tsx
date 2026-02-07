import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Compass } from 'lucide-react';
import { BLUEMAP } from '../constants';

/**
 * MapPage - BlueMap Integration
 * 
 * BlueMap has its own controls for navigation:
 * - Mouse drag: Pan the map
 * - Scroll wheel: Zoom in/out
 * - Right-click drag: Rotate view
 * - Shift+click: First person mode
 * 
 * The native BlueMap sidebar/UI is cropped out using the "virtual window" technique.
 */

// Default view centered on the base
const DEFAULT_HASH = '#world:-70:22:-22:200:0:0:0:0:perspective';

const MapPage = memo(function MapPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const mapUrl = `${BLUEMAP.baseUrl}/${DEFAULT_HASH}`;

    return (
        <div className="relative w-full h-full bg-deep overflow-hidden">
            {/* Map Iframe with Virtual Window Cropping */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                {/* 
                    Virtual Window Strategy:
                    Scale the iframe to 120% to push the BlueMap UI elements off-screen.
                    This gives a clean, immersive map view.
                */}
                <div className="absolute w-[120%] h-[120%] -top-[10%] -left-[10%]">
                    <iframe
                        src={mapUrl}
                        className={`w-full h-full border-0 transition-opacity duration-1000 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                        title="BlueMap"
                        style={{ pointerEvents: 'auto' }}
                        onLoad={() => setIsLoading(false)}
                    />
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-deep z-0">
                        <div className="relative">
                            <div className="absolute inset-0 bg-brand-primary/20 blur-xl rounded-full animate-pulse" />
                            <Loader2 className="w-12 h-12 text-brand-primary animate-spin relative z-10" />
                        </div>
                        <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 text-sm font-mono text-brand-primary/80 uppercase tracking-widest"
                        >
                            Initialisation du Satellite...
                        </motion.span>
                    </div>
                )}

                {/* Vignette Overlay */}
                <div className="absolute inset-0 pointer-events-none z-10 shadow-[inset_0_0_150px_rgba(0,0,0,0.6)] mix-blend-multiply" />

                {/* Gradient Fade at bottom to blend with dock */}
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-deep/80 to-transparent pointer-events-none z-10" />
            </div>

            {/* Controls Help - Top Left */}
            <motion.div
                className="absolute top-6 left-6 z-20 pointer-events-auto"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            >
                <motion.div
                    className="flex items-center bg-surface/60 backdrop-blur-xl border border-black/5 rounded-full shadow-lg overflow-hidden group hover:border-brand-primary/30 hover:shadow-[0_0_15px_rgba(251,191,36,0.15)] transition-colors duration-300"
                    onHoverStart={() => setIsHovered(true)}
                    onHoverEnd={() => setIsHovered(false)}
                    initial={{ width: 44 }}
                    animate={{ width: isHovered ? 'auto' : 44 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                    <div className="flex-shrink-0 w-11 h-11 flex items-center justify-center text-text-muted group-hover:text-brand-primary transition-colors duration-300">
                        <Compass size={20} strokeWidth={1.5} />
                    </div>

                    <motion.div
                        className="whitespace-nowrap overflow-hidden pr-5"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{
                            opacity: isHovered ? 1 : 0,
                            width: isHovered ? 'auto' : 0
                        }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="flex flex-col gap-0.5 leading-none">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted/80">
                                Contrôles
                            </span>
                            <span className="text-xs font-medium text-text-main">
                                Molette: Zoom • Glisser: Déplacer
                            </span>
                        </div>
                    </motion.div>
                </motion.div>
            </motion.div>
        </div>
    );
});

export default MapPage;
