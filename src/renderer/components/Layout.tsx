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
                {/* Main Wallpaper */}
                <div
                    className="absolute inset-0 bg-cover bg-center transition-all duration-700"
                    style={{ backgroundImage: 'url(/background_01.jpg)' }}
                >
                    <div className="absolute inset-0 bg-deep/60" /> {/* Darkening */}
                </div>

                {/* Ambient Glow (Brand) */}
                <div className="absolute -bottom-1/2 left-1/2 -translate-x-1/2 w-[100vw] h-[100vh] bg-brand-primary/10 blur-[150px] rounded-full pointer-events-none" />
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
