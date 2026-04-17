# API IPC & Contrat `window.electron`

## Comportement actuel

L’API renderer est exposée par `contextBridge` dans `src/main/preload.ts` sous `window.electron`.

## Contrat public `window.electron`

### Contrôles fenêtre/app

- `minimize(): void` -> IPC `window:minimize`
- `maximize(): void` -> IPC `window:maximize`
- `close(): void` -> IPC `window:close`
- `quit(): void` -> IPC `app:quit`

### Configuration

- `getConfig(key: string): Promise<unknown>` -> IPC invoke `config:get`
- `setConfig(key: string, value: unknown): Promise<boolean>` -> IPC invoke `config:set`
- `getAllConfig(): Promise<LauncherConfig>` -> IPC invoke `config:getAll`

`LauncherConfig` attendu:
- `username: string`
- `ram: number`
- `javaPath: string`
- `minecraftPath: string`
- `performancePreset: 'low-end' | 'balanced' | 'high-end' | 'auto'`
- `manageOwnConfigs: boolean`
- `controllerModeEnabled: boolean`

### Dialogues fichiers

- `openFile(options?): Promise<string | null>` -> IPC invoke `dialog:openFile`
- `openFolder(options?): Promise<string | null>` -> IPC invoke `dialog:openFolder`

### Serveur

- `getServerStatus(): Promise<{ online: boolean; players?: { online: number; max: number } }>` -> IPC invoke `server:status`

### Lancement jeu

- `launchMinecraft(options): Promise<{ success: boolean; error?: string }>` -> IPC invoke `minecraft:launch`
- options:
  - `username: string`
  - `ram: number`
  - `javaPath?: string`
  - `minecraftPath?: string`

### Info app

- `getVersion(): Promise<string>` -> IPC invoke `app:version`
- `getPlatform(): Promise<string>` -> IPC invoke `app:platform`

### Update

- `installUpdate(): void` -> IPC send `update:install`

### Événements

- `on(channel: string, func: (...args: unknown[]) => void): () => void`
- retourne une fonction de désabonnement

## Retours et erreurs attendues

| API | Retour nominal | Cas d'erreur attendu |
|---|---|---|
| `getConfig` | valeur stockée | rejet Promise si IPC indisponible |
| `setConfig` | `true` | rejet Promise si IPC indisponible |
| `getAllConfig` | objet config complet | rejet Promise si IPC indisponible |
| `openFile` | chemin fichier | `null` si annulation dialogue |
| `openFolder` | chemin dossier | `null` si annulation dialogue |
| `getServerStatus` | `{ online: boolean, ... }` | retourne `{ online: false }` sur erreur réseau/API |
| `launchMinecraft` | `{ success: true }` | `{ success: false, error: string }` en cas d'échec pipeline/lancement |
| `getVersion` | version app | rejet Promise si IPC indisponible |
| `getPlatform` | `darwin`/`win32`/`linux` | rejet Promise si IPC indisponible |
| `installUpdate` | envoi événement install | pas de retour direct; erreurs rapportées via `update:error` |
| `on` | fonction unsubscribe | canal non écouté => aucun événement reçu |

## Matrice IPC main ↔ renderer

| Canal | Type | Direction | Entrée | Sortie | Usage UI |
|---|---|---|---|---|---|
| `window:minimize` | send | Renderer -> Main | - | - | boutons frame |
| `window:maximize` | send | Renderer -> Main | - | - | boutons frame |
| `window:close` | send | Renderer -> Main | - | - | boutons frame |
| `app:quit` | send | Renderer -> Main | - | - | bouton QUIT |
| `config:get` | invoke | Renderer -> Main | `key` | valeur clé | chargement config |
| `config:set` | invoke | Renderer -> Main | `key, value` | `true` | persistance paramètres |
| `config:getAll` | invoke | Renderer -> Main | - | config complète | init App |
| `dialog:openFile` | invoke | Renderer -> Main | options | path ou `null` | sélection Java |
| `dialog:openFolder` | invoke | Renderer -> Main | options | path ou `null` | sélection `.minecraft` |
| `server:status` | invoke | Renderer -> Main | - | statut serveur | badge Home |
| `minecraft:launch` | invoke | Renderer -> Main | options launch | `{ success, error? }` | bouton jouer |
| `app:version` | invoke | Renderer -> Main | - | string version | affichage version |
| `app:platform` | invoke | Renderer -> Main | - | plateforme | diagnostics |
| `hardware:detect` | invoke | Renderer -> Main | - | infos hardware | usage interne |
| `update:install` | send | Renderer -> Main | - | - | action redémarrage update |
| `launch:progress` | event | Main -> Renderer | `{ task, progress }` | - | barre progression |
| `update:checking` | event | Main -> Renderer | - | - | notification update |
| `update:available` | event | Main -> Renderer | info version | - | notification update |
| `update:progress` | event | Main -> Renderer | progress | - | notification update |
| `update:ready` | event | Main -> Renderer | info version | - | bouton installer |
| `update:error` | event | Main -> Renderer | message | - | affichage erreur |
| `update:log` | event | Main -> Renderer | log string | - | capsule logs |

## Contrats updater/events

- `update:available`: objet update (`version` au minimum, structure `electron-updater`)
- `update:progress`:
  - Windows/Linux: payload `electron-updater` (inclut `percent`, `transferred`, `total`, `bytesPerSecond`)
  - macOS (flux manuel PKG): objet reconstruit avec mêmes clés principales
- `update:ready`: info update prête à installer
- `update:error`: message texte
- `update:log`: log texte

## Contrat lancement/progression

- Événement progression: `launch:progress` -> `{ task: string, progress: number }`
- Résultat final: `{ success: true }` ou `{ success: false, error: string }`
- Comportement en cas d’échec:
  - échec setup Fabric/mods/presets -> `success: false` + message explicite
  - exception IPC/main inattendue -> `success: false` + fallback `Unknown critical error`

## Limites connues

- Le type renderer local `ElectronAPI` contient encore `showMap/hideMap` non implémentés dans preload.
- Le canal `hardware:detect` n’est pas exposé explicitement dans preload actuel.

## Impact utilisateur

- API stable pour les pages actuelles (Home/Settings/Updates).
- Les événements update/log permettent un diagnostic visible côté UI.

## Référence code

- API preload: `src/main/preload.ts`
- Types renderer: `src/renderer/types.ts`
- Handlers IPC: `src/main/index.ts`
- Update events: `src/main/updater.ts`
