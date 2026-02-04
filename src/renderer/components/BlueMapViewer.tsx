import { useState, useCallback, memo } from 'react';

interface BlueMapViewerProps {
    url: string;
    className?: string;
}

const BlueMapViewer = memo(function BlueMapViewer({ url, className = '' }: BlueMapViewerProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const handleLoad = useCallback(() => {
        setLoading(false);
        setError(false);
    }, []);

    const handleError = useCallback(() => {
        setLoading(false);
        setError(true);
    }, []);

    const handleRetry = useCallback(() => {
        setLoading(true);
        setError(false);
    }, []);

    return (
        <div className={`relative w-full h-full ${className}`}>
            {/* Loading state */}
            {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 iframe-loading">
                    <div className="w-12 h-12 border-3 border-white/20 border-t-tab-map rounded-full animate-spin" />
                    <p className="text-sm text-text-secondary">Chargement de la carte...</p>
                </div>
            )}

            {/* Error state */}
            {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-surface/50">
                    <div className="text-4xl">🗺️</div>
                    <p className="text-lg font-medium">Impossible de charger la carte</p>
                    <p className="text-sm text-text-secondary">
                        Vérifiez que le serveur BlueMap est accessible
                    </p>
                    <button
                        onClick={handleRetry}
                        className="mt-4 px-4 py-2 bg-tab-map text-white rounded hover:bg-tab-map/80 transition-colors"
                    >
                        Réessayer
                    </button>
                </div>
            )}

            {/* Iframe */}
            <iframe
                key={url} // Force remount on URL change
                src={url}
                onLoad={handleLoad}
                onError={handleError}
                className={`w-full h-full border-0 ${loading || error ? 'invisible' : ''}`}
                allow="fullscreen"
                title="BlueMap - Carte du monde Communokot"
            />
        </div>
    );
});

export default BlueMapViewer;
