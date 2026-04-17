# Documentation Canonique — Communokot Launcher v1.4.2

Dernière révision: 17 avril 2026

Ce dossier est la source de vérité documentaire du projet. Tout contenu historique redondant est conservé uniquement comme redirection de compatibilité.

## Périmètre

Cette documentation couvre le comportement effectivement implémenté dans le code actuel:
- runtime Electron + React + TypeScript
- flux de lancement Minecraft (Fabric, mods, presets, backup)
- contrat IPC et API `window.electron`
- build, packaging, CI/CD et auto-update
- guide fonctionnel utilisateur
- références techniques (mods, endpoints externes, sécurité, dépannage)

## Navigation

- [Architecture & Runtime](./ARCHITECTURE_RUNTIME.md)
- [API IPC & Contrat window.electron](./IPC_API_REFERENCE.md)
- [Ops & Release](./OPS_RELEASE.md)
- [Guide Fonctionnel](./FUNCTIONAL_GUIDE.md)
- [Référence Technique](./TECHNICAL_REFERENCE.md)
- [Changelog](./CHANGELOG.md)

## Conventions éditoriales

- Langue: français technique
- Horodatage: dates absolues (JJ mois AAAA)
- Traçabilité: chaque section importante contient:
  - **Comportement actuel**
  - **Limites connues**
  - **Impact utilisateur**
  - **Référence code**

## État de validation (17 avril 2026)

- Tests: `npm test` -> **67/67 tests passés**
- Build: `npm run build` -> **succès**

Les commandes et résultats détaillés sont archivés dans [Ops & Release](./OPS_RELEASE.md).

## Documents historiques (compat)

Ces fichiers existent encore pour préserver les liens, mais redirigent vers les pages canoniques:
- `DEVELOPMENT.md`
- `DOCUMENTATION_COMPLETE.md`
- `LAUNCHER_DESCRIPTION.md`
- `MODS_DOCUMENTATION.md`
- `PERFORMANCE.md`
- `PROJECT_ARCHITECTURE.md`
- `SERVER_STATUS.md`
- `USER_GUIDE_ROBUST.md`
