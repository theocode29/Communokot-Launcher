import { useState, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import BlueMapViewer from '../components/BlueMapViewer';
import { BLUEMAP } from '../constants';

type MapMode = '2d' | '3d';

const MapPage = memo(function MapPage() {
    const [mode, setMode] = useState<MapMode>('3d');

    // Build the full URL based on mode
    const mapUrl = useMemo(() => {
        const hash = mode === '3d' ? BLUEMAP.default3D : BLUEMAP.default2D;
        return `${BLUEMAP.baseUrl}/${hash}`;
    }, [mode]);

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <motion.div
                className="glass px-6 py-4 flex items-center justify-between border-b border-white/10"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div>
                    <h2 className="text-lg font-bold tracking-wide">CARTE DU MONDE</h2>
                    <p className="text-xs text-text-secondary">Exploration 3D du monde Communokot</p>
                </div>

                {/* Mode toggle */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setMode('3d')}
                        className={`
              px-4 py-2 text-sm font-medium rounded-sm border transition-all
              ${mode === '3d'
                                ? 'bg-tab-map text-white border-tab-map'
                                : 'bg-transparent text-text-secondary border-white/20 hover:border-white/40'
                            }
            `}
                    >
                        <span className="flex items-center gap-2">
                            <span
                                className={`w-2 h-2 rounded-full ${mode === '3d' ? 'bg-white' : 'bg-text-muted'}`}
                            />
                            MODE 3D
                        </span>
                    </button>

                    <button
                        onClick={() => setMode('2d')}
                        className={`
              px-4 py-2 text-sm font-medium rounded-sm border transition-all
              ${mode === '2d'
                                ? 'bg-amber-500 text-black border-amber-500'
                                : 'bg-transparent text-text-secondary border-white/20 hover:border-white/40'
                            }
            `}
                    >
                        <span className="flex items-center gap-2">
                            <span
                                className={`w-2 h-2 rounded-full ${mode === '2d' ? 'bg-black' : 'bg-text-muted'}`}
                            />
                            MODE 2D
                        </span>
                    </button>
                </div>
            </motion.div>

            {/* Map viewer */}
            <motion.div
                className="flex-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
            >
                <BlueMapViewer url={mapUrl} />
            </motion.div>
        </div>
    );
});

export default MapPage;
