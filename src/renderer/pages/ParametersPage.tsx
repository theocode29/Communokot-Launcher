import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import type { UserConfig } from '../types';
import { Settings, Cpu, AlertTriangle, Check, HelpCircle } from 'lucide-react';
import InstallationHelpModal from '../components/InstallationHelpModal';

interface ParametersPageProps {
    config: UserConfig;
    onConfigChange: (key: keyof UserConfig, value: string | number) => void;
}

const RAM_OPTIONS = [2, 4, 6, 8, 12, 16];

const ParametersPage = memo(function ParametersPage({ config, onConfigChange }: ParametersPageProps) {
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    // Helper for visual RAM selector
    const renderRamOption = (gb: number) => {
        const isSelected = config.ram === gb;
        return (
            <button
                key={gb}
                onClick={() => onConfigChange('ram', gb)}
                className={`
                    relative group flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300
                    ${isSelected
                        ? 'bg-brand-primary/10 border-brand-primary shadow-[0_0_20px_rgba(230,179,37,0.1)]'
                        : 'bg-surface border-black/5 hover:border-black/20 hover:bg-black/5'}
                `}
            >
                {isSelected && (
                    <div className="absolute top-3 right-3 text-brand-primary">
                        <Check size={16} strokeWidth={4} />
                    </div>
                )}
                <span className={`text-2xl font-black ${isSelected ? 'text-brand-primary' : 'text-text-main'}`}>
                    {gb} <span className="text-xs font-bold text-text-muted">GO</span>
                </span>
            </button>
        );
    };

    return (
        <div className="h-full overflow-y-auto px-4 md:px-8 py-24 pb-48 custom-scrollbar">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <motion.div
                    className="mb-12 flex items-end justify-between border-b border-black/10 pb-8"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div className="flex items-end gap-6">
                        <div className="p-4 bg-surface border border-black/10 rounded-2xl">
                            <Settings size={32} className="text-text-main" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter text-white">PARAMÈTRES</h1>
                            <p className="text-white/60 uppercase tracking-widest text-xs mt-2">
                                Configuration système
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsHelpOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-surface/90 border border-white/10 rounded-lg text-sm font-bold text-text-main transition-colors shadow-lg"
                    >
                        <HelpCircle size={18} className="text-brand-primary" />
                        <span>AIDE INSTALLATION</span>
                    </button>
                </motion.div>

                <InstallationHelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

                <div className="space-y-12">
                    {/* Section: Account */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                            <span className="w-1 h-6 bg-brand-primary rounded-full" />
                            COMPTE & JEU
                        </h2>

                        <div className="grid gap-6">
                            <div className="bg-surface p-6 rounded-2xl border border-black/5">
                                <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-3">
                                    Pseudo Minecraft
                                </label>
                                <input
                                    type="text"
                                    value={config.username}
                                    onChange={(e) => onConfigChange('username', e.target.value)}
                                    placeholder="Votre pseudo..."
                                    className="w-full bg-deep p-4 rounded-xl text-text-main font-bold border-2 border-transparent focus:border-brand-primary focus:bg-deep/50 transition-colors outline-none placeholder:text-text-muted/50"
                                />
                                <p className="mt-2 text-[10px] text-text-muted flex items-center gap-2">
                                    <AlertTriangle size={12} className="text-amber-500" />
                                    Assurez-vous d'avoir accès au serveur avec ce pseudo.
                                </p>
                            </div>
                        </div>
                    </motion.section>

                    {/* Section: Performance */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                            <span className="w-1 h-6 bg-brand-primary rounded-full" />
                            PERFORMANCES (RAM)
                        </h2>

                        <div className="bg-surface p-8 rounded-2xl border border-black/5">
                            <div className="flex items-center gap-3 mb-6">
                                <Cpu className="text-text-muted" size={20} />
                                <p className="text-sm text-text-muted">
                                    Allouez plus de mémoire pour améliorer la stabilité, surtout avec des shaders.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {RAM_OPTIONS.map(renderRamOption)}
                            </div>
                        </div>
                    </motion.section>

                    {/* Section: Java & Files */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                            <span className="w-1 h-6 bg-brand-primary rounded-full" />
                            JAVA & FICHIERS
                        </h2>

                        <div className="bg-surface p-6 rounded-2xl border border-black/5 space-y-6">
                            {/* Java Path */}
                            <div>
                                <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-3">
                                    Chemin Java
                                </label>
                                <div className="flex gap-4">
                                    <input
                                        type="text"
                                        value={config.javaPath}
                                        readOnly
                                        className="flex-1 bg-deep p-4 rounded-xl text-text-muted font-mono text-xs border border-black/5"
                                    />
                                    <Button
                                        variant="secondary"
                                        size="md"
                                        onClick={async () => {
                                            if (window.electron) {
                                                const path = await window.electron.openFile({
                                                    title: "Sélectionner l'exécutable Java",
                                                    filters: [{ name: 'Java', extensions: ['exe', ''] }]
                                                });
                                                if (path) onConfigChange('javaPath', path);
                                            }
                                        }}
                                    >
                                        PARCOURIR
                                    </Button>
                                </div>
                            </div>

                            {/* Minecraft Path */}
                            <div>
                                <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-3">
                                    Dossier .minecraft
                                </label>
                                <div className="flex gap-4">
                                    <input
                                        type="text"
                                        value={config.minecraftPath || 'Dossier par défaut'}
                                        readOnly
                                        className="flex-1 bg-deep p-4 rounded-xl text-text-muted font-mono text-xs border border-black/5"
                                    />
                                    <Button
                                        variant="secondary"
                                        size="md"
                                        onClick={async () => {
                                            if (window.electron) {
                                                const path = await window.electron.openFolder({
                                                    title: "Sélectionner le dossier .minecraft"
                                                });
                                                if (path) onConfigChange('minecraftPath', path);
                                            }
                                        }}
                                    >
                                        PARCOURIR
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.section>
                </div>
            </div>
        </div>
    );
});

export default ParametersPage;
