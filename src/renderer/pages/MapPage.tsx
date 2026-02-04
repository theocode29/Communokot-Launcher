import { memo } from 'react';
import { motion } from 'framer-motion';
import { Map as MapIcon, Info } from 'lucide-react';
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
                        className="w-full h-full border-0"
                        title="BlueMap"
                        style={{ pointerEvents: 'auto' }}
                    />
                </div>

                {/* Gradient Fade at bottom to blend with dock */}
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-deep/80 to-transparent pointer-events-none z-10" />
            </div>

            {/* Info HUD - Top Left */}
            <motion.div
                className="absolute top-8 left-8 max-w-xs z-20 pointer-events-auto"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                <div className="bg-deep/80 backdrop-blur border border-white/10 p-4 rounded-xl shadow-xl">
                    <div className="flex items-center gap-2 mb-2 text-brand-primary">
                        <MapIcon size={16} />
                        <span className="text-xs font-bold uppercase tracking-widest">Carte du Monde</span>
                    </div>
                    <p className="text-xs text-text-muted leading-relaxed">
                        Navigation en temps réel.
                    </p>
                </div>
            </motion.div>

            {/* Controls Help - Bottom Right */}
            <motion.div
                className="absolute bottom-24 right-8 z-20 pointer-events-auto"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
            >
                <div className="bg-deep/80 backdrop-blur border border-white/10 p-3 rounded-xl shadow-xl">
                    <div className="flex items-center gap-2 text-white/60">
                        <Info size={14} />
                        <span className="text-[10px] font-mono uppercase tracking-wider">
                            Molette: Zoom • Clic+Glisser: Déplacer
                        </span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
});

export default MapPage;
