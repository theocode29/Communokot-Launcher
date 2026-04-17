# Architecture & Runtime

## Comportement actuel

### Vue d’ensemble

Le launcher est une application Electron à deux processus:
- **Main process** (`src/main`) pour système, IPC, launch Minecraft, updates
- **Renderer process** (`src/renderer`) pour UI React

Entrées techniques:
- Main: `src/main/index.ts`
- Preload: `src/main/preload.ts` (bundle CJS `dist/main/preload.cjs`)
- Renderer: `src/renderer/index.tsx`, `src/renderer/App.tsx`

### Séquence d’initialisation

1. `app.whenReady()`
2. Purge cache/session Electron
3. Création de fenêtre (`BrowserWindow`) sans frame
4. Chargement URL dev (`http://localhost:5173`) ou build renderer
5. Initialisation auto-updater
6. Exposition API preload via `contextBridge`

### WebPreferences actives

`BrowserWindow.webPreferences`:
- `preload`: `dist/main/preload.cjs`
- `nodeIntegration: false`
- `contextIsolation: true`
- `sandbox: false`
- `webviewTag: true`
- `webSecurity: false`
- `allowRunningInsecureContent: true`

### Flux de lancement Minecraft

Pipeline orchestration (`minecraft.ts`):
1. validation pseudo
2. création du dossier `.minecraft` si absent
3. check/update resource pack
4. installation Fabric si nécessaire
5. synchronisation des mods depuis Modrinth
6. application preset de performance (orchestrateur robuste)
7. lancement `minecraft-launcher-core`
8. émission progression vers UI (`launch:progress`)

### Flux preset robuste

`preset-orchestrator.ts`:
1. charge metadata config
2. mode user-managed: skip si activé
3. choix preset (`auto` via hardware score, sinon preset utilisateur)
4. check incompatibilités (patches automatiques)
5. détection modifications utilisateur
6. dry-run optionnel
7. backup versionné avant application
8. application atomique fichier par fichier
9. mise à jour metadata + audit log
10. fallback safe-boot sur erreur critique

### Architecture UI

- `App.tsx`: chargement config/version, polling statut serveur, routing par onglet
- Pages: `HomePage`, `MapPage`, `UpdatesPage`, `ParametersPage`
- `MapPage`: utilise `<webview>` avec injection CSS de masquage UI map
- `UpdateNotification`: écoute des événements updater

## Limites connues

- `webSecurity: false` et `allowRunningInsecureContent: true` sont actifs pour compat map.
- `sandbox` renderer désactivé (`false`).
- `MapPage` dépend d’un service externe; indisponibilité réseau = contenu map indisponible.
- Quelques structures preset/workaround utilisent des clés non homogènes (`v_sync`/`fps_limit` vs `max_fps` dans certaines branches de fallback).

## Impact utilisateur

- Lancement simplifié avec progression visible.
- Optimisations automatiques adaptées au matériel.
- Restauration possible via backups en cas de problème config.
- Expérience map immersive, mais dépendante du réseau externe.

## Référence code

- Main app + IPC: `src/main/index.ts`
- Preload: `src/main/preload.ts`
- Lancement: `src/main/minecraft.ts`
- Presets robustes: `src/main/preset-orchestrator.ts`
- Backups/audit/safe-boot: `src/main/backup-manager.ts`
- Hardware scoring: `src/main/hardware-detection.ts`
- Incompatibilités: `src/main/incompatibility-db.ts`
- Renderer shell: `src/renderer/App.tsx`
