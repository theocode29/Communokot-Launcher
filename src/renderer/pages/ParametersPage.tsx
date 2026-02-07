import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import type { UserConfig } from '../types';
import { Settings2, Cpu, AlertTriangle, Check, LifeBuoy, Zap } from 'lucide-react';
import InstallationHelpModal from '../components/InstallationHelpModal';

interface ParametersPageProps {
    config: UserConfig;
    onConfigChange: (key: keyof UserConfig, value: string | number | boolean) => void;
}

const RAM_OPTIONS = [2, 4, 6, 8, 12, 16];

const ParametersPage = memo(function ParametersPage({ config, onConfigChange }: ParametersPageProps) {
    const [isHelpOpen, setIsHelpOpen] = useState(false);

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
                <motion.div
                    className="mb-12 flex items-end justify-between border-b border-black/10 pb-8"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div className="flex items-end gap-6">
                        <div className="p-4 bg-surface border border-black/10 rounded-2xl shadow-sm">
                            <Settings2 size={32} strokeWidth={1.5} className="text-text-main" />
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
                        className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-surface/90 border border-white/10 rounded-lg text-sm font-bold text-text-main transition-colors shadow-sm"
                    >
                        <LifeBuoy size={18} className="text-brand-primary" strokeWidth={2.5} />
                        <span>AIDE</span>
                    </button>
                </motion.div>

                <InstallationHelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

                <div className="space-y-12">
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
                                <Cpu className="text-text-muted" size={20} strokeWidth={1.5} />
                                <p className="text-sm text-text-muted">
                                    Allouez plus de mémoire pour améliorer la stabilité, surtout avec des shaders.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {RAM_OPTIONS.map(renderRamOption)}
                            </div>
                        </div>
                    </motion.section>

                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                    >
                        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                            <span className="w-1 h-6 bg-brand-primary rounded-full" />
                            OPTIMISATION DES MODS
                        </h2>

                        <div className="bg-surface p-8 rounded-2xl border border-black/5">
                            <div className="flex items-center gap-3 mb-6">
                                <Zap className="text-text-muted" size={20} strokeWidth={1.5} />
                                <p className="text-sm text-text-muted">
                                    Configuration automatique des mods d'optimisation (Sodium, Lithium, etc.) selon votre matériel.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                {[
                                    { id: 'auto', label: 'AUTO', desc: 'Détection automatique' },
                                    { id: 'low-end', label: 'LOW-END', desc: 'PC bas de gamme' },
                                    { id: 'balanced', label: 'BALANCED', desc: 'Équilibré' },
                                    { id: 'high-end', label: 'HIGH-END', desc: 'Haute performance' },
                                ].map(preset => {
                                    const isSelected = config.performancePreset === preset.id;
                                    return (
                                        <button
                                            key={preset.id}
                                            onClick={() => onConfigChange('performancePreset', preset.id)}
                                            className={`
                                                relative group flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300
                                                ${isSelected
                                                    ? 'bg-brand-primary/10 border-brand-primary shadow-[0_0_20px_rgba(230,179,37,0.1)]'
                                                    : 'bg-deep border-black/5 hover:border-brand-primary/50 hover:bg-black/20'}
                                            `}
                                        >
                                            {isSelected && (
                                                <div className="absolute top-3 right-3 text-brand-primary">
                                                    <Check size={16} strokeWidth={4} />
                                                </div>
                                            )}
                                            <span className={`text-lg font-black ${isSelected ? 'text-brand-primary' : 'text-text-main'}`}>
                                                {preset.label}
                                            </span>
                                            <span className="text-[10px] text-text-muted mt-1 uppercase tracking-wider">
                                                {preset.desc}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex items-center justify-between p-4 bg-deep rounded-xl border border-black/5">
                                <div className="flex-1">
                                    <label className="block text-sm font-bold text-text-main">
                                        Gérer mes propres configurations
                                    </label>
                                    <p className="text-xs text-text-muted mt-1">
                                        Désactive l'application automatique des presets d'optimisation
                                    </p>
                                </div>
                                <button
                                    onClick={() => onConfigChange('manageOwnConfigs', !config.manageOwnConfigs)}
                                    className={`
                                        relative w-14 h-8 rounded-full transition-colors duration-300
                                        ${config.manageOwnConfigs ? 'bg-brand-primary' : 'bg-black/30'}
                                    `}
                                >
                                    <span
                                        className={`
                                            absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-300
                                            ${config.manageOwnConfigs ? 'translate-x-6' : 'translate-x-0'}
                                        `}
                                    />
                                </button>
                            </div>
                        </div>
                    </motion.section>

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
