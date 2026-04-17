# Changelog

Toutes les évolutions notables du launcher sont documentées ici.

## [1.4.2] - 2026-04-17

### Résumé
Version de stabilisation UI (Paramètres) et refonte documentaire complète du dossier `docs/` pour alignement strict avec le code actuel.

### Changements côté utilisateur
- Écran Paramètres stabilisé (switchs, lisibilité, interactions).
- Presets affichés avec libellés orientés usage (`Auto`, `PC modeste`, `Équilibré`, `Performance max`).
- Version affichée en haut à droite.

### Changements techniques
- `ParametersPage` refactorisé avec contrôle sémantique accessible (`role="switch"`, `aria-checked`).
- `updateConfig` en stratégie optimistic UI + rollback local si échec IPC.
- Typage renforcé (`as const`, `satisfies`) pour presets.
- Ajout utilitaire `cn` (`clsx` + `tailwind-merge`).

### Refonte documentation
- Nouveau corpus canonique:
  - `docs/README.md`
  - `docs/ARCHITECTURE_RUNTIME.md`
  - `docs/IPC_API_REFERENCE.md`
  - `docs/OPS_RELEASE.md`
  - `docs/FUNCTIONAL_GUIDE.md`
  - `docs/TECHNICAL_REFERENCE.md`
- Conversion des anciens documents redondants en redirections courtes conservées pour compatibilité des liens.
- Suppression des contradictions documentaires (versions, stack, chemins, compte de tests, flux update).

### Validation
- `npm test` -> 67/67 tests passés
- `npm run build` -> succès
