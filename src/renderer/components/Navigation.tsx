import { memo, useCallback } from 'react';
import { TABS } from '../constants';
import type { TabId } from '../types';

interface NavigationProps {
    activeTab: TabId;
    onTabChange: (tab: TabId) => void;
}

const Navigation = memo(function Navigation({ activeTab, onTabChange }: NavigationProps) {
    const handleQuit = useCallback(() => {
        if (window.electron) {
            window.electron.quit();
        }
    }, []);

    // Get the active tab's color
    const activeColor = TABS.find(t => t.id === activeTab)?.color || '#C4F623';

    return (
        <nav
            className="drag-region relative z-50 flex items-center justify-between px-6 py-4 glass border-b"
            style={{ borderColor: `${activeColor}40` }}
        >
            {/* Tabs */}
            <div className="no-drag flex items-center gap-8">
                {TABS.map((tab) => {
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`
                relative flex items-center gap-2 px-1 py-2 
                text-sm font-medium tracking-wide uppercase
                transition-all duration-200 no-select
                ${isActive ? '' : 'opacity-60 hover:opacity-100'}
              `}
                            style={{ color: isActive ? tab.color : 'inherit' }}
                        >
                            <span
                                className={`
                  text-xs font-mono
                  ${isActive ? '' : 'opacity-50'}
                `}
                                style={{ color: isActive ? tab.color : 'inherit' }}
                            >
                                {tab.number}
                            </span>
                            <span className={isActive ? 'tab-underline active' : ''}>
                                {tab.label}
                            </span>

                            {/* Active indicator dot */}
                            {isActive && (
                                <span
                                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                                    style={{ backgroundColor: tab.color }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Quit button */}
            <button
                onClick={handleQuit}
                className="no-drag px-4 py-2 text-sm font-medium tracking-wider uppercase 
                   text-text-secondary hover:text-white transition-colors no-select"
            >
                QUIT
            </button>
        </nav>
    );
});

export default Navigation;
