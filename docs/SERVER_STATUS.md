# Documentation du Système de Statut Serveur

## Vue d'ensemble

Le Communokot Launcher récupère les informations d'état du serveur via l'API **freemcserver.net**. Ce document explique le flux de données et l'architecture que j'ai mis en place.

---

## Endpoint API

**URL:** `https://api.freemcserver.net/v4/server/1949282/ping`
**Méthode:** `GET`
**Authentification:** Aucune requise

### Structure de la Réponse

```json
{
    "success": true,
    "data": {
        "online": true,
        "players": {
            "online": 0,
            "max": 20,
            "list": []
        },
        "version": {
            "name": "Paper 1.21.11",
            "protocol": 774
        },
        "motd": {
            "raw": "Le serveur minecraft duComunokot ✊☭"
        }
    }
}
```

### Champs Clés

| Champ | Type | Description |
|-------|------|-------------|
| `data.online` | `boolean` | Si le serveur est actuellement en ligne |
| `data.players.online` | `number` | Nombre actuel de joueurs connectés |
| `data.players.max` | `number` | Nombre maximum de joueurs autorisés |
| `data.version.name` | `string` | Version du serveur Minecraft |

---

## Flux de Données

```
┌──────────────────────────────────────────────────────────────────┐
│                         PROCESSUS PRINCIPAL                       │
│  ┌─────────────────┐      ┌───────────────────────────────────┐  │
│  │  serverStatus.ts │──────▶│ axios.get(freemcserver API)       │  │
│  │  checkServerStatus()│◀────│ Retourne: { online, players, ... }│  │
│  └─────────────────┘      └───────────────────────────────────┘  │
│           │                                                       │
│           │ IPC: 'server:status'                                  │
│           ▼                                                       │
│  ┌─────────────────┐                                              │
│  │    index.ts      │                                              │
│  │  ipcMain.handle()│                                              │
│  └─────────────────┘                                              │
└──────────────────────────────────────────────────────────────────┘
           │
           │ contextBridge
           ▼
┌──────────────────────────────────────────────────────────────────┐
│                       PROCESSUS DE RENDU                          │
│  ┌─────────────────┐      ┌─────────────────┐                    │
│  │ public/preload.cjs│──────▶│  window.electron │                    │
│  │  getServerStatus()│      │  .getServerStatus()│                    │
│  └─────────────────┘      └─────────────────┘                    │
│                                    │                              │
│                                    ▼                              │
│                           ┌─────────────────┐                    │
│                           │     App.tsx      │                    │
│                           │  pollServerStatus│                    │
│                           │  toutes les 30s  │                    │
│                           └─────────────────┘                    │
│                                    │                              │
│                                    ▼                              │
│                           ┌─────────────────┐                    │
│                           │  HomePage.tsx    │                    │
│                           │ - ServerStatus   │                    │
│                           │ - Bouton désactivé│                    │
│                           └─────────────────┘                    │
└──────────────────────────────────────────────────────────────────┘
```

---

## Problèmes & Dépannage

### Statut Indiqué Hors Ligne ?

Si l'indicateur est hors ligne mais que l'API renvoie "200 OK" :

1.  **Vérifier les Logs du Terminal** : Chercher `[ServerStatus] API Axios error` ou `API unknown error`.
2.  **Vérifier le Preload** : S'assurer que `dist/renderer/preload.cjs` existe et est en pur CommonJS.
3.  **Vérifier les Logs du Renderer** : Ouvrir les DevTools de l'app (Cmd+Option+I), aller dans Console, et chercher :
    -   `[App] Server status received: ...` (Bon)
    -   `[App] window.electron is undefined` (Mauvais - Échec du Preload)

### Script de Preload

Le script de preload est situé à `public/preload.cjs`.
- Il n'est **PAS** empaqueté par Vite.
- Il utilise l'extension `.cjs` pour forcer Electron à le traiter comme du CommonJS (puisque `package.json` définit `"type": "module"`).
- Il est copié directement vers `dist/renderer/preload.cjs` pendant le build.

### Représentation Visuelle
Le statut est affiché via le composant `ServerStatusBadge`, qui utilise le système de design "CommunoCode" :
-   **Police** : JetBrains Mono (Look Technique/Terminal).
-   **Hors Ligne** : Texte Rouge Foncé (`#7f1d1d`).
-   **En Ligne** : Texte Blanc avec un indicateur lumineux.
-   **Disposition** : Coin supérieur droit de la Page d'Accueil.
