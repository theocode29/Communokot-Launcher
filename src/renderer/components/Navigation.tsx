import { memo, useCallback } from 'react';
import type { TabId } from '../types';
import { motion, LayoutGroup } from 'framer-motion';
import { Home, Map, Newspaper, Settings, Power } from 'lucide-react';
// If Lucide is not available, I'll use text or SVGs. I installed it in the previous step.

interface NavigationProps {
    activeTab: TabId;
    onTabChange: (tab: TabId) => void;
}

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'home', label: 'ACCUEIL', icon: Home },
    { id: 'map', label: 'CARTE', icon: Map },
    { id: 'updates', label: 'ACTUALITÉS', icon: Newspaper },
    { id: 'settings', label: 'PARAMÈTRES', icon: Settings },
];

const Navigation = memo(function Navigation({ activeTab, onTabChange }: NavigationProps) {
    const handleQuit = useCallback(() => {
        window.electron?.quit();
    }, []);

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4 pointer-events-none flex justify-center">
            <nav className="pointer-events-auto flex items-center gap-2 p-2 bg-surface/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl ring-1 ring-black/50">
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
                                    ${isActive ? 'text-brand-primary' : 'text-text-muted hover:text-white hover:bg-white/5'}
                                `}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTabBg"
                                        className="absolute inset-0 bg-white/5 rounded-xl border border-white/5 will-change-transform"
                                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                                    />
                                )}

                                <span className="relative z-10 mb-1">
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
                                        className="absolute bottom-0 w-8 h-1 bg-brand-primary rounded-t-full will-change-transform"
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
                        <Power size={24} />
                        <span className="text-[10px] font-bold tracking-widest uppercase mt-1 opacity-60 group-hover:opacity-100">
                            QUIT
                        </span>
                    </button>
                </LayoutGroup>
            </nav>
        </div>
    );
});

export default Navigation;
