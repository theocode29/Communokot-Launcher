# Server Status System Documentation

## Overview

The Communokot Launcher retrieves server status information from the **freemcserver.net** API. This document explains the data flow and architecture.

---

## API Endpoint

**URL:** `https://api.freemcserver.net/v4/server/1949282/ping`
**Method:** `GET`
**Authentication:** None required

### Response Structure

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

### Key Fields

| Field | Type | Description |
|-------|------|-------------|
| `data.online` | `boolean` | Whether the server is currently online |
| `data.players.online` | `number` | Current number of connected players |
| `data.players.max` | `number` | Maximum allowed players |
| `data.version.name` | `string` | Minecraft server version |

---

## Data Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                         MAIN PROCESS                              │
│  ┌─────────────────┐      ┌───────────────────────────────────┐  │
│  │  serverStatus.ts │──────▶│ axios.get(freemcserver API)       │  │
│  │  checkServerStatus()│◀────│ Returns: { online, players, ... }│  │
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
│                       RENDERER PROCESS                            │
│  ┌─────────────────┐      ┌─────────────────┐                    │
│  │  public/preload.js │──────▶│  window.electron │                    │
│  │  getServerStatus()│      │  .getServerStatus()│                    │
│  └─────────────────┘      └─────────────────┘                    │
│                                    │                              │
│                                    ▼                              │
│                           ┌─────────────────┐                    │
│                           │     App.tsx      │                    │
│                           │  pollServerStatus│                    │
│                           │  every 30 seconds│                    │
│                           └─────────────────┘                    │
│                                    │                              │
│                                    ▼                              │
│                           ┌─────────────────┐                    │
│                           │  HomePage.tsx    │                    │
│                           │ - ServerStatus   │                    │
│                           │ - Button disable │                    │
│                           └─────────────────┘                    │
└──────────────────────────────────────────────────────────────────┘
```

---

## Issues & Debugging

### Status Indicated as Offline?

If the status indicator is offline but the API returns 200 OK:

1.  **Check Terminal Logs**: Look for `[ServerStatus] API Axios error` or `API unknown error`.
2.  **Verify Preload**: Ensure `dist/renderer/preload.js` exists and is pure CommonJS (starts with `const { contextBridge... } = require('electron')`).
3.  **Check Renderer Logs**: Open the app DevTools (Cmd+Option+I), go to Console, and look for:
    -   `[App] Server status received: ...` (Good)
    -   `[App] window.electron is undefined` (Bad - Preload failed)

### Preload Script

The preload script is located at `public/preload.js`. It is **NOT** bundled by Vite to ensure it remains valid CommonJS for Electron. It is copied directly to `dist/renderer/preload.js` during the build.

### CSP (Content-Security-Policy)

The `index.html` must allow connections to `https://api.freemcserver.net`.
