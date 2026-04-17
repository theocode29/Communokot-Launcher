# Changelog

Toutes les évolutions notables du launcher sont documentées ici.

## [1.4.2] - 2026-04-17

### Résumé
Cette version stabilise complètement l'écran **Paramètres** (toggles, affichage, fluidité), améliore la lisibilité UX, et repositionne la version de l'application en **haut à droite** de la fenêtre.

### Changements côté utilisateur
- L'écran Paramètres est plus lisible et plus simple à configurer.
- Les options de type interrupteur (mode manette, gestion manuelle des configs) sont désormais stables.
- Les presets performance sont affichés avec des libellés orientés utilisateur :
  - `Auto`
  - `PC modeste`
  - `Équilibré`
  - `Performance max`
- La version du launcher est affichée en haut à droite (au lieu du bas à droite).

### Changements techniques
- Refonte du composant switch dans Paramètres avec un contrôle sémantique robuste (`button` + `role="switch"` + `aria-checked`).
- Uniformisation des transitions d'état UI (durées courtes, sans effets visuels agressifs).
- Mise à jour du flux `updateConfig` en mode **optimistic UI** avec rollback sécurisé si l'écriture IPC échoue.
- Renforcement du typage TypeScript pour les presets (`as const` + `satisfies`).
- Ajout d'un utilitaire `cn` (`clsx` + `tailwind-merge`) pour stabiliser la composition de classes Tailwind.

### Fichiers principaux impactés
- `src/renderer/pages/ParametersPage.tsx`
- `src/renderer/App.tsx`
- `src/renderer/components/Layout.tsx`
- `src/renderer/lib/cn.ts`

### Validation
- Build complet validé :
  - `npm run build`
- Vérifications manuelles prévues/recommandées :
  - toggles (clic simple, clic rapide)
  - navigation entre onglets puis retour Paramètres
  - persistance après redémarrage
  - navigation clavier (focus visible + activation)
