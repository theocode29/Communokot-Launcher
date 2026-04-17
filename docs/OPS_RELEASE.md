# Ops & Release

## Comportement actuel

### Prérequis

- Node.js 20+
- npm (lockfile présent)
- Git configuré pour publication

### Commandes projet

- Dev UI: `npm run dev`
- Build: `npm run build`
- Tests: `npm test`
- Electron dev: `npm run electron:dev`
- Packaging Windows: `npm run dist:win`
- Packaging macOS: `npm run dist:mac`
- Packaging multi-plateforme: `npm run dist:all`
- Publish release: `npm run publish`

### Packaging

Configuration dans `electron-builder.yml`:
- build output: `release/${version}`
- `asar: true`
- `asarUnpack` pour modules natifs/sensibles
- Windows NSIS + ZIP
- macOS DMG + ZIP + PKG
- Linux AppImage
- provider publication: GitHub (`theocode29/Communokot-Launcher`)

### CI/CD release

Workflow: `.github/workflows/release.yml`
- trigger: push tag `v*`
- matrix: `macos-latest`, `windows-latest`
- install deps, nettoyage métadonnées macOS
- publication Windows via `npm run publish`
- publication macOS arm64 puis x64 via `electron-builder --publish always`

### Auto-update runtime

- Initialisation updater au démarrage app packagée.
- Windows/Linux: flux `electron-updater` standard.
- macOS: téléchargement manuel PKG + ouverture installateur.
- Événements UI envoyés: checking/available/progress/ready/error/log.

### Validation exécutée (17 avril 2026)

- `npm test` -> **67/67 tests passés** (Vitest)
- `npm run build` -> **succès**

## Limites connues

- En mode dev, l’auto-update est volontairement ignoré.
- Le flux macOS est un contournement pragmatique (PKG manuel) et non un flux notarisation/signature complet.
- Le secret CI utilisé est `GH_TOKEN` (non standard `GITHUB_TOKEN`), dépend de la configuration repo.

## Impact utilisateur

- Mises à jour applicatives pilotées avec retour visuel détaillé.
- Packaging multi-cible compatible dev local + CI automatisée.

## Référence code

- Scripts npm: `package.json`
- Builder config: `electron-builder.yml`
- Workflow release: `.github/workflows/release.yml`
- Updater runtime: `src/main/updater.ts`
- Processus release historique: `RELEASE_PROCESS.md`
