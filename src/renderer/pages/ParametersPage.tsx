import { memo, useId, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Check, Cpu, Gamepad2, LifeBuoy, Settings2, Zap } from 'lucide-react';
import Button from '../components/Button';
import InstallationHelpModal from '../components/InstallationHelpModal';
import type { UserConfig } from '../types';
import { cn } from '../lib/cn';

interface ParametersPageProps {
  config: UserConfig;
  onConfigChange: (key: keyof UserConfig, value: string | number | boolean) => void;
}

const RAM_OPTIONS = [2, 4, 6, 8, 12, 16] as const;

const PERFORMANCE_PRESETS = [
  { id: 'auto', label: 'Auto', helper: 'Choisit le profil adapté à votre PC.' },
  { id: 'low-end', label: 'PC modeste', helper: 'Favorise la fluidité sur les petites configurations.' },
  { id: 'balanced', label: 'Équilibré', helper: 'Bon compromis entre qualité et performances.' },
  { id: 'high-end', label: 'Performance max', helper: 'Privilégie la qualité sur les PC puissants.' },
] as const satisfies ReadonlyArray<{
  id: UserConfig['performancePreset'];
  label: string;
  helper: string;
}>;

const sectionCardClass = 'rounded-2xl border border-black/10 bg-surface shadow-sm';

interface SwitchRowProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (nextValue: boolean) => void;
  icon?: ReactNode;
}

const SwitchRow = memo(function SwitchRow({
  id,
  label,
  description,
  checked,
  onChange,
  icon,
}: SwitchRowProps) {
  const labelId = `${id}-label`;
  const descriptionId = `${id}-description`;

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-black/10 bg-deep p-4">
      <div className="min-w-0 flex-1">
        <p id={labelId} className="inline-flex items-center gap-2 text-sm font-semibold text-text-main text-pretty">
          {icon}
          <span>{label}</span>
        </p>
        <p id={descriptionId} className="mt-1 text-xs text-text-muted text-pretty">
          {description}
        </p>
      </div>

      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        aria-labelledby={labelId}
        aria-describedby={descriptionId}
        onClick={() => onChange(!checked)}
        className={cn(
          'inline-flex h-8 w-14 items-center rounded-full border border-black/20 bg-black/20 p-1 transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
          'hover:border-black/30 active:opacity-90',
          checked && 'border-brand-primary bg-brand-primary',
        )}
      >
        <span
          className={cn(
            'size-6 rounded-full bg-white transition-transform duration-150',
            checked ? 'translate-x-6' : 'translate-x-0',
          )}
        />
      </button>
    </div>
  );
});

const ParametersPage = memo(function ParametersPage({ config, onConfigChange }: ParametersPageProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const switchIdPrefix = useId();

  return (
    <div className="h-full overflow-y-auto px-4 py-24 pb-48 md:px-8 custom-scrollbar">
      <div className="mx-auto max-w-3xl">
        <motion.div
          className="mb-12 flex items-end justify-between border-b border-black/10 pb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-end gap-6">
            <div className="flex size-16 items-center justify-center rounded-2xl border border-black/10 bg-surface shadow-sm">
              <Settings2 size={32} strokeWidth={1.5} className="text-text-main" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white text-balance">PARAMÈTRES</h1>
              <p className="mt-2 text-xs text-white/65 text-pretty">Réglez votre launcher en quelques étapes.</p>
            </div>
          </div>

          <button
            onClick={() => setIsHelpOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-black/10 bg-surface px-4 py-2 text-sm font-bold text-text-main shadow-sm transition-colors duration-200 hover:bg-surface/90"
          >
            <LifeBuoy size={18} className="text-brand-primary" strokeWidth={2.5} />
            <span>AIDE</span>
          </button>
        </motion.div>

        <InstallationHelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

        <div className="space-y-12">
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h2 className="mb-6 flex items-center gap-3 text-lg font-bold text-white text-balance">
              <span className="h-6 w-1 rounded-full bg-brand-primary" />
              COMPTE & JEU
            </h2>

            <div className={cn(sectionCardClass, 'p-6')}>
              <label htmlFor="minecraft-username" className="mb-3 block text-sm font-semibold text-text-main text-balance">
                Pseudo Minecraft
              </label>
              <input
                id="minecraft-username"
                type="text"
                value={config.username}
                onChange={(event) => onConfigChange('username', event.target.value)}
                placeholder="Votre pseudo"
                className="w-full rounded-xl border-2 border-transparent bg-deep p-4 font-semibold text-text-main outline-none transition-colors duration-200 placeholder:text-text-muted/60 focus:border-brand-primary"
              />
              <p className="mt-2 text-xs text-text-muted text-pretty">Nom utilisé pour vous connecter sur le serveur.</p>
            </div>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="mb-6 flex items-center gap-3 text-lg font-bold text-white text-balance">
              <span className="h-6 w-1 rounded-full bg-brand-primary" />
              PERFORMANCES (RAM)
            </h2>

            <div className={cn(sectionCardClass, 'p-8')}>
              <div className="mb-6 flex items-center gap-3">
                <Cpu className="text-text-muted" size={20} strokeWidth={1.5} />
                <p className="text-sm text-text-muted text-pretty">Choisissez la mémoire allouée au jeu.</p>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {RAM_OPTIONS.map((gb) => {
                  const isSelected = config.ram === gb;

                  return (
                    <button
                      key={gb}
                      onClick={() => onConfigChange('ram', gb)}
                      className={cn(
                        'relative flex flex-col items-center justify-center rounded-2xl border p-6 text-text-main transition-colors duration-200',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
                        isSelected
                          ? 'border-brand-primary bg-brand-primary/10'
                          : 'border-black/10 bg-surface hover:border-black/25 hover:bg-black/5',
                      )}
                    >
                      {isSelected && (
                        <div className="absolute right-3 top-3 text-brand-primary">
                          <Check size={16} strokeWidth={4} />
                        </div>
                      )}
                      <span className={cn('text-2xl font-black tabular-nums', isSelected && 'text-brand-primary')}>
                        {gb} <span className="text-xs font-bold text-text-muted">GO</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <h2 className="mb-6 flex items-center gap-3 text-lg font-bold text-white text-balance">
              <span className="h-6 w-1 rounded-full bg-brand-primary" />
              OPTIMISATION DES MODS
            </h2>

            <div className={cn(sectionCardClass, 'p-8')}>
              <div className="mb-6 flex items-center gap-3">
                <Zap className="text-text-muted" size={20} strokeWidth={1.5} />
                <p className="text-sm text-text-muted text-pretty">Choisissez le profil de performance le plus adapté.</p>
              </div>

              <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                {PERFORMANCE_PRESETS.map((preset) => {
                  const isSelected = config.performancePreset === preset.id;

                  return (
                    <button
                      key={preset.id}
                      onClick={() => onConfigChange('performancePreset', preset.id)}
                      className={cn(
                        'relative flex flex-col items-center justify-center rounded-2xl border p-5 text-center transition-colors duration-200',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
                        isSelected
                          ? 'border-brand-primary bg-brand-primary/10'
                          : 'border-black/10 bg-deep hover:border-brand-primary/60 hover:bg-black/5',
                      )}
                    >
                      {isSelected && (
                        <div className="absolute right-3 top-3 text-brand-primary">
                          <Check size={16} strokeWidth={4} />
                        </div>
                      )}
                      <span className={cn('text-base font-black text-balance', isSelected ? 'text-brand-primary' : 'text-text-main')}>
                        {preset.label}
                      </span>
                      <span className="mt-1 text-xs text-text-muted text-pretty">{preset.helper}</span>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-4">
                <SwitchRow
                  id={`${switchIdPrefix}-manage-own-configs`}
                  label="Gérer mes propres configurations"
                  description="Lance le jeu sans appliquer automatiquement les presets de mods."
                  checked={config.manageOwnConfigs}
                  onChange={(nextValue) => onConfigChange('manageOwnConfigs', nextValue)}
                />

                <SwitchRow
                  id={`${switchIdPrefix}-controller-mode`}
                  label="Activer le mode manette"
                  description="Permet de jouer à Minecraft avec une manette compatible."
                  checked={config.controllerModeEnabled}
                  onChange={(nextValue) => onConfigChange('controllerModeEnabled', nextValue)}
                  icon={<Gamepad2 size={14} className="text-brand-primary" />}
                />
              </div>
            </div>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="mb-6 flex items-center gap-3 text-lg font-bold text-white text-balance">
              <span className="h-6 w-1 rounded-full bg-brand-primary" />
              JAVA & FICHIERS
            </h2>

            <div className={cn(sectionCardClass, 'space-y-6 p-6')}>
              <div>
                <label className="mb-3 block text-sm font-semibold text-text-main text-balance">Chemin Java</label>
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={config.javaPath}
                    readOnly
                    className="flex-1 truncate rounded-xl border border-black/10 bg-deep p-4 font-mono text-xs text-text-muted"
                  />
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={async () => {
                      if (!window.electron) return;

                      const path = await window.electron.openFile({
                        title: "Sélectionner l'exécutable Java",
                        filters: [{ name: 'Java', extensions: ['exe', ''] }],
                      });

                      if (path) onConfigChange('javaPath', path);
                    }}
                  >
                    PARCOURIR
                  </Button>
                </div>
                <p className="mt-2 text-xs text-text-muted text-pretty">Chemin utilisé pour lancer Minecraft.</p>
              </div>

              <div>
                <label className="mb-3 block text-sm font-semibold text-text-main text-balance">Dossier .minecraft</label>
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={config.minecraftPath || 'Dossier par défaut'}
                    readOnly
                    className="flex-1 truncate rounded-xl border border-black/10 bg-deep p-4 font-mono text-xs text-text-muted"
                  />
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={async () => {
                      if (!window.electron) return;

                      const path = await window.electron.openFolder({
                        title: 'Sélectionner le dossier .minecraft',
                      });

                      if (path) onConfigChange('minecraftPath', path);
                    }}
                  >
                    PARCOURIR
                  </Button>
                </div>
                <p className="mt-2 text-xs text-text-muted text-pretty">Emplacement des fichiers du jeu.</p>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
});

export default ParametersPage;
