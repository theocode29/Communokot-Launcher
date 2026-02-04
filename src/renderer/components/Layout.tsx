import { ReactNode } from 'react';
import Navigation from './Navigation';
import type { TabId } from '../types';

interface LayoutProps {
    children: ReactNode;
    activeTab: TabId;
    onTabChange: (tab: TabId) => void;
    version: string;
}

export default function Layout({ children, activeTab, onTabChange, version }: LayoutProps) {
    return (
        <div className="relative w-screen h-screen overflow-hidden bg-deep">
            {/* --- Background Layer --- */}
            <div className="absolute inset-0 z-0">
                {/* Main Wallpaper - use CSS background for performance */}
                <div
                    className="absolute inset-0 bg-cover bg-center will-change-transform"
                    style={{ backgroundImage: 'url(/background_01.jpg)' }}
                >
                    <div className="absolute inset-0 bg-deep/70" /> {/* Darkening */}
                </div>

                {/* Ambient Glow (Brand) - optimized: smaller blur, smaller element */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60vw] h-[40vh] bg-brand-primary/5 blur-[80px] rounded-full pointer-events-none will-change-transform" />
            </div>

            {/* --- Effects Layer --- */}
            <div className="noise-overlay" />
            <div className="vignette-overlay" />

            {/* --- Drag Region --- */}
            <div className="absolute top-0 left-0 w-full h-8 z-[60] drag-region" />

            {/* --- Main Content --- */}
            <main className="relative z-10 w-full h-full flex flex-col">
                <div className="flex-1 overflow-hidden">
                    {children}
                </div>
            </main>

            {/* --- Navigation Dock --- */}
            <div className="absolute bottom-0 left-0 w-full z-50">
                <Navigation activeTab={activeTab} onTabChange={onTabChange} />
            </div>

            {/* --- Version --- */}
            <div className="fixed bottom-4 right-6 z-40 text-[10px] font-mono text-white/20 select-none pointer-events-none">
                v{version}
            </div>


        </div>
    );
}
