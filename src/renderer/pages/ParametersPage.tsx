import { useState, useCallback, useEffect, memo, useRef } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import { RAM_OPTIONS, CONFIG_SAVE_DELAY } from '../constants';
import type { UserConfig } from '../types';

interface ParametersPageProps {
    config: UserConfig;
    onConfigChange: (key: keyof UserConfig, value: string | number) => Promise<void>;
}

const ParametersPage = memo(function ParametersPage({ config, onConfigChange }: ParametersPageProps) {
    const [localConfig, setLocalConfig] = useState(config);
    const saveTimeoutRef = useRef<NodeJS.Timeout>();

    // Sync local state with props
    useEffect(() => {
        setLocalConfig(config);
    }, [config]);

    // Debounced save
    const handleChange = useCallback((key: keyof UserConfig, value: string | number) => {
        setLocalConfig(prev => ({ ...prev, [key]: value }));

        // Clear previous timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Debounce the save
        saveTimeoutRef.current = setTimeout(() => {
            onConfigChange(key, value);
        }, CONFIG_SAVE_DELAY);
    }, [onConfigChange]);

    // Browse for Java
    const handleBrowseJava = useCallback(async () => {
        if (!window.electron) return;

        const path = await window.electron.openFile({
            title: 'Sélectionner l\'exécutable Java',
            filters: [
                { name: 'Java', extensions: ['exe', ''] },
            ],
        });

        if (path) {
            handleChange('javaPath', path);
        }
    }, [handleChange]);

    // Browse for Minecraft
    const handleBrowseMinecraft = useCallback(async () => {
        if (!window.electron) return;

        const path = await window.electron.openFolder({
            title: 'Sélectionner le dossier .minecraft',
        });

        if (path) {
            handleChange('minecraftPath', path);
        }
    }, [handleChange]);

    return (
        <div className="h-full overflow-y-auto p-8">
            {/* Header */}
            <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                    PARAMÈTRES
                    <span className="w-3 h-3 rounded-full bg-tab-settings animate-pulse" />
                </h1>
                <p className="text-text-secondary mt-2">
                    Configurez votre expérience de jeu.
                </p>
            </motion.div>

            {/* Settings form */}
            <motion.div
                className="max-w-2xl space-y-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
            >
                {/* Username */}
                <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">
                        Pseudo
                    </label>
                    <input
                        type="text"
                        value={localConfig.username}
                        onChange={(e) => handleChange('username', e.target.value)}
                        placeholder="Entrez votre pseudo"
                        className="w-full px-4 py-3 bg-surface-light border border-white/10 rounded-sm
                       text-white placeholder-text-muted
                       focus:outline-none focus:border-tab-settings transition-colors"
                    />
                    <p className="text-xs text-text-muted">
                        C'est votre nom affiché en jeu
                    </p>
                </div>

                {/* RAM Selection */}
                <div className="space-y-3">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">
                        Mémoire Maximum (RAM)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {RAM_OPTIONS.map((ram) => (
                            <button
                                key={ram}
                                onClick={() => handleChange('ram', ram)}
                                className={`
                  px-4 py-3 text-sm font-medium border transition-all
                  ${localConfig.ram === ram
                                        ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                                        : 'bg-surface-light border-white/10 text-text-secondary hover:border-white/30'
                                    }
                `}
                            >
                                {ram} GO
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-text-muted">
                        Allouez plus de RAM pour de meilleures performances
                    </p>
                </div>

                {/* Java Path */}
                <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">
                        Chemin Java
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={localConfig.javaPath}
                            onChange={(e) => handleChange('javaPath', e.target.value)}
                            placeholder="auto"
                            className="flex-1 px-4 py-3 bg-surface-light border border-white/10 rounded-sm
                         text-white placeholder-text-muted font-mono text-sm
                         focus:outline-none focus:border-tab-settings transition-colors"
                        />
                        <Button
                            variant="secondary"
                            size="md"
                            onClick={handleBrowseJava}
                        >
                            PARCOURIR
                        </Button>
                    </div>
                    <p className="text-xs text-text-muted">
                        Laissez sur "auto" pour une détection automatique, ou spécifiez le chemin complet vers l'exécutable Java
                    </p>
                </div>

                {/* Minecraft Path */}
                <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">
                        Chemin d'installation Minecraft
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={localConfig.minecraftPath}
                            onChange={(e) => handleChange('minecraftPath', e.target.value)}
                            placeholder="Défaut"
                            className="flex-1 px-4 py-3 bg-surface-light border border-white/10 rounded-sm
                         text-white placeholder-text-muted font-mono text-sm
                         focus:outline-none focus:border-tab-settings transition-colors
                         overflow-hidden text-ellipsis"
                        />
                        <Button
                            variant="secondary"
                            size="md"
                            onClick={handleBrowseMinecraft}
                        >
                            PARCOURIR
                        </Button>
                    </div>
                    <p className="text-xs text-text-muted">
                        Chemin personnalisé vers le dossier .minecraft (optionnel)
                    </p>
                </div>

                {/* Reset button */}
                <div className="pt-4 border-t border-white/10">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            handleChange('username', 'Player');
                            handleChange('ram', 4);
                            handleChange('javaPath', 'auto');
                            handleChange('minecraftPath', '');
                        }}
                    >
                        Réinitialiser les paramètres
                    </Button>
                </div>
            </motion.div>
        </div>
    );
});

export default ParametersPage;
