import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface InstallationHelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function InstallationHelpModal({ isOpen, onClose }: InstallationHelpModalProps) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative w-full max-w-2xl bg-surface-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="p-8">
                        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-brand-primary to-blue-400 bg-clip-text text-transparent">
                            Guide d'Installation & Mise à jour
                        </h2>

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Windows Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-[#0078D6] flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M0 0h11.377v11.372H0V0zm12.623 0H24v11.372H12.623V0zM0 12.628h11.377V24H0V12.628zm12.623 0H24V24H12.623V12.628z" /></svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-white">Windows</h3>
                                </div>
                                <div className="bg-surface-800 p-4 rounded-lg border border-white/5 space-y-3">
                                    <p className="text-sm text-gray-300">
                                        Lors de la première installation ou mise à jour, vous pourriez voir l'écran bleu <strong>SmartScreen</strong>.
                                    </p>
                                    <ol className="list-decimal list-inside text-sm text-gray-400 space-y-2">
                                        <li>Cliquez sur <strong>Informations complémentaires</strong></li>
                                        <li>Cliquez sur le bouton <strong>Exécuter quand même</strong></li>
                                    </ol>
                                    <div className="mt-2 text-xs text-white/30 bg-white/5 p-2 rounded">
                                        Cela arrive car notre application est développée par la communauté et n'a pas de certificat payant Microsoft.
                                    </div>
                                </div>
                            </div>

                            {/* macOS Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                                        <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.5 1.3 0 2.52.88 3.31.88.78 0 2.26-1.09 3.81-1.09 1.33.05 2.58.54 3.53 1.37-3.17 1.9-2.6 6.55.94 8.05-.18.57-.42 1.15-.7 1.7M13 3.5c.67-.83 1.14-1.97 1-3.07-1.01.05-2.22.68-2.92 1.5-.59.7-1.07 1.83-1 2.98 1.12.09 2.25-.56 2.92-1.41" /></svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-white">macOS</h3>
                                </div>
                                <div className="bg-surface-800 p-4 rounded-lg border border-white/5 space-y-3">
                                    <p className="text-sm text-gray-300">
                                        Apple bloque les applications non signées par défaut via <strong>Gatekeeper</strong>.
                                    </p>
                                    <ol className="list-decimal list-inside text-sm text-gray-400 space-y-2">
                                        <li>Si le message "Impossible d'ouvrir" apparaît :</li>
                                        <li>Faites un <strong>Clic Droit</strong> (ou Ctrl+Clic) sur l'application</li>
                                        <li>Sélectionnez <strong>Ouvrir</strong> dans le menu</li>
                                        <li>Cliquez sur <strong>Ouvrir</strong> dans la fenêtre de confirmation</li>
                                    </ol>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/10 text-center">
                            <p className="text-sm text-white/40">
                                Une fois cette manipulation effectuée lors de la première installation, les futures mises à jour seront beaucoup plus fluides !
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
