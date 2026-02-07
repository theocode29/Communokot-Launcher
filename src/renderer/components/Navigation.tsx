import { memo, useCallback } from 'react';
import type { TabId } from '../types';
import { motion, LayoutGroup } from 'framer-motion';
import { House, Map, Newspaper, Settings2, LogOut } from 'lucide-react';
// Using Premium Apple-style icons:
// Home -> House (More modern)
// Newspaper -> Newspaper (Classic News, thin stroke)
// Settings -> Settings2 (Sliders, more refined)

interface NavigationProps {
    activeTab: TabId;
    onTabChange: (tab: TabId) => void;
}

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'home', label: 'ACCUEIL', icon: House },
    { id: 'map', label: 'CARTE', icon: Map },
    { id: 'updates', label: 'ACTUS', icon: Newspaper },
    { id: 'settings', label: 'RÉGLAGES', icon: Settings2 },
];

const Navigation = memo(function Navigation({ activeTab, onTabChange }: NavigationProps) {
    const handleQuit = useCallback(() => {
        window.electron?.quit();
    }, []);

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4 pointer-events-none flex justify-center">
            <nav className="pointer-events-auto flex items-center gap-2 p-2 bg-surface/80 backdrop-blur-xl border border-black/10 rounded-2xl shadow-xl ring-1 ring-black/5">
                <LayoutGroup>
                    {TABS.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id)}
                                className={`
                                    relative group flex flex-col items-center justify-center
                                    h-16 w-24 rounded-xl transition-all duration-300
                                    ${isActive ? 'text-text-main' : 'text-text-muted hover:text-text-main hover:bg-black/5'}
                                `}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTabBg"
                                        className="absolute inset-0 bg-black/5 rounded-xl border border-black/5 will-change-transform"
                                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                                    />
                                )}

                                <span className={`relative z-10 mb-1 ${isActive ? 'text-brand-primary' : ''}`}>
                                    <tab.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                                </span>
                                <span className={`
                                    relative z-10 text-[10px] font-bold tracking-widest uppercase
                                    transition-opacity duration-300
                                    ${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}
                                `}>
                                    {tab.label}
                                </span>

                                {isActive && (
                                    <motion.div
                                        layoutId="activeTabGlow"
                                        className="absolute -bottom-1 w-12 h-[3px] bg-brand-primary rounded-full shadow-[0_0_10px_rgba(230,179,37,0.5)] will-change-transform"
                                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                                    />
                                )}
                            </button>
                        );
                    })}

                    <div className="w-px h-10 bg-white/10 mx-2" />

                    <button
                        onClick={handleQuit}
                        className="
                            relative group flex flex-col items-center justify-center
                            h-16 w-20 rounded-xl transition-colors
                            text-text-muted hover:text-error hover:bg-error/10
                        "
                        title="Quitter"
                    >
                        <LogOut size={22} strokeWidth={2} />
                        <span className="text-[9px] font-bold tracking-widest uppercase mt-1 opacity-60 group-hover:opacity-100">
                            QUIT
                        </span>
                    </button>
                </LayoutGroup>
            </nav>
        </div>
    );
});

export default Navigation;
