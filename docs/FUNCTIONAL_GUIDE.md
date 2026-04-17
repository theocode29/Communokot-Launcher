# Guide Fonctionnel

## Comportement actuel

### Onglet Accueil

- Affiche l’état serveur (online/offline + joueurs).
- Bouton `JOUER`:
  - désactivé si serveur offline
  - lance le pipeline Minecraft si online
  - affiche progression par étapes
- Cooldown post-lancement: 60 secondes.

### Onglet Carte

- Affiche une map externe via `<webview>`.
- Injection CSS pour masquer l’UI native de la map.
- Zoom visuel du conteneur (`scale-125`) pour rendu immersif.

### Onglet Actualités

- Récupère les news depuis `launcher-news/main/updates.json` (GitHub raw).
- Fallback local minimal si erreur réseau.

### Onglet Paramètres

- Pseudo Minecraft
- RAM (`2,4,6,8,12,16` Go)
- Preset performance (`auto`, `low-end`, `balanced`, `high-end`)
- Toggle gestion manuelle de config mod
- Toggle mode manette
- Sélection chemin Java (dialog fichier)
- Sélection dossier `.minecraft` (dialog dossier)

### Persistance config

- Sauvegarde en `electron-store`.
- Stratégie UI optimiste avec rollback local si échec IPC.

## Limites connues

- Le mode carte dépend entièrement d’un endpoint externe.
- Le fallback news n’inclut qu’une entrée statique minimale.
- L’interface ne propose pas encore un écran dédié de restauration des backups.

## Impact utilisateur

- Expérience d’usage orientée “one-click launch”.
- Paramétrage simple mais suffisant pour profils matériels variés.
- Feedback explicite pendant lancement et mise à jour.

## Référence code

- App shell: `src/renderer/App.tsx`
- Home: `src/renderer/pages/HomePage.tsx`
- Map: `src/renderer/pages/MapPage.tsx`
- News: `src/renderer/pages/UpdatesPage.tsx`
- Paramètres: `src/renderer/pages/ParametersPage.tsx`
- Layout/navigation: `src/renderer/components/Layout.tsx`, `src/renderer/components/Navigation.tsx`
