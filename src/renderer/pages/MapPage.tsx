import { memo, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

const MAP_URL = 'https://theocode29.github.io/Communokot-world-map/#overworld:-1085:0:-155:1006:0.42:0.46:0:0:perspective';

/**
 * MapPage - BlueMap Integration via <webview>
 * 
 * We use a <webview> tag (Electron-specific) to embed the external map.
 * This allows us to:
 * 1. Render app UI (vignette, nav) *over* the map.
 * 2. Transform (zoom/crop) the map container.
 * 3. Inject CSS to hide the BlueMap UI.
 */
const MapPage = memo(function MapPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const webviewRef = useRef<any>(null);

    useEffect(() => {
        const webview = webviewRef.current;
        if (!webview) return;

        const handleDomReady = () => {
            // Inject CSS to hide BlueMap UI
            // We target common BlueMap UI containers to hide coordinates, menus, etc.
            webview.insertCSS(`
                /* Hide all UI elements */
                #ui, .ui-root, .blue-map-ui, header, .top-bar, .bottom-bar, .sidebar, .menu, .ui-header, .ui-container {
                    display: none !important;
                }
                
                /* Ensure map fills screen */
                body, html, #map-container, canvas {
                    width: 100% !important;
                    height: 100% !important;
                    overflow: hidden !important;
                    background-color: #0d0d0d !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }
            `);
        };

        webview.addEventListener('dom-ready', handleDomReady);

        return () => {
            webview.removeEventListener('dom-ready', handleDomReady);
        };
    }, []);

    return (
        <div className="relative w-full h-full bg-deep overflow-hidden">
            {/* 
                Webview Container
                We scale this to "zoom in" and crop the edges.
             */}
            <div className="w-full h-full transform scale-125 origin-center">
                <webview
                    ref={webviewRef}
                    src={MAP_URL}
                    className="w-full h-full"
                    // @ts-ignore - webview tag property
                    webpreferences="contextIsolation=no, nodeIntegration=no"
                />
            </div>

            {/* Loading/Placeholder behind (visible if webview is transparent initially) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 -z-10 opacity-50 pointer-events-none">
                <div className="relative">
                    <div className="absolute inset-0 bg-brand-primary/20 blur-xl rounded-full animate-pulse" />
                    <Loader2 className="w-12 h-12 text-brand-primary animate-spin relative z-10" />
                </div>
                <span className="text-sm font-mono text-brand-primary/80 uppercase tracking-widest">
                    Connexion Satellite...
                </span>
            </div>
        </div>
    );
});

export default MapPage;
