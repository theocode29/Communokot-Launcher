# Référence Technique

## Comportement actuel

### Schéma de configuration persistant

Source: `src/main/utils/config.ts`

Stockage:
- backend: `electron-store`
- fichier logique: `config.json` (namespace store `config`)

Clés, types, défauts et effet runtime:

| Clé | Type | Défaut | Effet runtime |
|---|---|---|---|
| `username` | `string` | `'Player'` | pseudo utilisé pour l'auth offline `minecraft-launcher-core` |
| `ram` | `number` | `4` | mémoire Java (`max`, `min`) injectée au lancement |
| `javaPath` | `string` | `'auto'` | résolution auto/manuelle de l'exécutable Java |
| `minecraftPath` | `string` | `''` | chemin racine `.minecraft` (fallback auto OS si vide) |
| `performancePreset` | `'low-end' \| 'balanced' \| 'high-end' \| 'auto'` | `'auto'` | pilotage orchestrateur presets et patchs |
| `manageOwnConfigs` | `boolean` | `false` | si `true`, bypass application automatique des presets |
| `controllerModeEnabled` | `boolean` | `false` | ajoute/supprime mods mode manette à la synchro |

### Mods gérés automatiquement

Source: `src/main/mods.ts`

Base mods obligatoires (sous réserve disponibilité Modrinth):
- Fabric API
- Sodium
- ImmediatelyFast
- FerriteCore
- Entity Culling
- Lithium
- LazyDFU
- ModernFix
- Sodium Leaf Culling
- Sound Physics Remastered
- Simple Voice Chat
- Mod Menu
- AmbientSounds
- CreativeCore
- Cool Rain
- Sound Controller
- Item Landing Sound
- Presence Footsteps

Mode manette (`controllerModeEnabled`):
- ajoute `MidnightControls` + dépendances requises
- supprime ces mods quand désactivé

### Presets performance

Source: `src/main/performance-presets.ts`

Presets: `low-end`, `balanced`, `high-end`
- Sodium: distances/rendu/particules/fps adaptés par profil
- Lithium/FerriteCore: optimisations activées
- EntityCulling: plus agressif sur profils faibles
- ImmediatelyFast: expérimental surtout profil faible
- ModernFix: mode low-mem actif sur low-end
- SodiumLeafCulling: mode plus agressif sur profils faibles

### Fabric

Source: `src/main/fabric.ts`
- Minecraft cible: `1.21.11`
- Loader Fabric: `0.18.4`
- Installer: JAR officiel Fabric Maven

### Resource Pack

Source: `src/main/resourcepack.ts`
- métadonnées version distantes (GitHub raw)
- téléchargement + vérification `sha256` et taille
- déploiement vers `<minecraftPath>/resourcepacks/Communokot_Pack.zip`

### Endpoints et ressources externes

- Statut serveur: `https://api.freemcserver.net/v4/server/1949282/ping`
- Mod versions: `https://api.modrinth.com/v2/project/.../version`
- Fabric installer: `https://maven.fabricmc.net/.../fabric-installer-1.0.0.jar`
- News: `https://raw.githubusercontent.com/theocode29/Communokot-Launcher/main/launcher-news/main/updates.json`
- Resource pack metadata/fichier: `https://raw.githubusercontent.com/theocode29/Communokot-Launcher/main/resourcepack/...`
- Map UI: `https://theocode29.github.io/Communokot-world-map/...`

### Sécurité Electron (état actuel)

- `contextIsolation: true`
- `nodeIntegration: false`
- `webviewTag: true`
- `sandbox: false`
- `webSecurity: false`
- `allowRunningInsecureContent: true`

Encart sécurité:
- Les choix `webSecurity: false` et `allowRunningInsecureContent: true` augmentent la surface de risque.
- La présence de `contextIsolation: true` + preload bridge limite l’exposition directe Node côté renderer.
- L’architecture actuelle favorise la compatibilité map/runtime, pas un profil de durcissement maximal.

## Limites connues

- Certains documents historiques mentionnaient React 19/fichiers inexistants; corrigé dans corpus canonique.
- `backup-manager` contient un profil safe-boot partiellement hétérogène (`ferritecore.mixin.json`).
- La cohérence de certaines clés de config (`max_fps` vs `fps_limit`) dépend des branches de fallback.

## Impact utilisateur

- Presets et correctifs automatiques améliorent stabilité/performance sans intervention.
- Les comportements externes (news/map/status/modrinth/fabric) restent sensibles à la disponibilité réseau.

## Référence code

- Config store: `src/main/utils/config.ts`
- Mods: `src/main/mods.ts`
- Presets: `src/main/performance-presets.ts`
- Fabric: `src/main/fabric.ts`
- Resource pack: `src/main/resourcepack.ts`
- Sécurité fenêtre: `src/main/index.ts`
- CSP: `index.html`

## Références externes validées (Context7)

Validation effectuée le **17 avril 2026** via Context7.

- Electron (`/electron/electron`)
  - Sécurité BrowserWindow et preload/contextBridge:
    - https://github.com/electron/electron/blob/main/docs/tutorial/security.md
    - https://github.com/electron/electron/blob/main/docs/tutorial/context-isolation.md
  - WebPreferences (valeurs et impacts de `webSecurity` / `allowRunningInsecureContent`):
    - https://github.com/electron/electron/blob/main/docs/api/structures/web-preferences.md
- TypeScript (`/microsoft/typescript-website`)
  - Guidance `moduleResolution: bundler` et options de build modernes:
    - https://github.com/microsoft/typeScript-website/blob/v2/packages/documentation/copy/en/modules-reference/guides/Choosing%20Compiler%20Options.md
  - Référence options `strict` et configuration projet:
    - https://github.com/microsoft/typeScript-website/blob/v2/packages/documentation/copy/en/project-config/Compiler%20Options.md
    - https://github.com/microsoft/typeScript-website/blob/v2/packages/documentation/copy/en/release-notes/TypeScript%205.0.md
- electron-builder (`/electron-userland/electron-builder`)
  - Configuration builder et cibles multi-plateformes:
    - https://github.com/electron-userland/electron-builder/blob/master/pages/programmatic-usage.md
  - Publication (`--publish`, provider GitHub, variables token):
    - https://context7.com/electron-userland/electron-builder/llms.txt
