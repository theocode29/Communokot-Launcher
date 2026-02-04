# Communokot Launcher - Project Architecture

## Overview

The Communokot Launcher is a modern, high-performance Minecraft launcher built with the **Electron + Vite + React** stack. It implements a custom design system ("CommunoCode") inspired by cinematic sci-fi interfaces (Star Wars Jedi, Braun, Nothing OS).

## Tech Stack

| Component | Technology | Reasoning |
|-----------|------------|-----------|
| **Core** | Electron (v33+) | Cross-platform desktop capabilities (Node.js + Chromium). |
| **Bundler** | Vite | Ultra-fast build times compared to Webpack. HMR support. |
| **UI Framework** | React 19 | Component-based UI logic. |
| **Styling** | Tailwind CSS | Utility-first styling for rapid design implementation. |
| **Animation** | Framer Motion | Smooth, physics-based layout transitions. |
| **State** | React Hooks | Local state management (sufficient for this scale). |

---

## Directory Structure

```
src/
├── main/                 # Electron Main Process (Node.js)
│   ├── index.ts          # Entry point. Window creation & IPC handlers.
│   ├── minecraft.ts      # Game launching logic (child_process).
│   ├── serverStatus.ts   # API polling logic.
│   └── ...
├── renderer/             # Electron Renderer Process (React UI)
│   ├── components/       # Reusable UI elements (Navigation, Button).
│   ├── pages/            # Page views (HomePage, MapPage).
│   ├── styles/           # Global CSS & Tailwind imports.
│   └── App.tsx           # Main layout & routing logic.
└── ...
```

## Design System: "CommunoCode"

### Philosophy
-   **Dark Mode Only**: `#050505` base background.
-   **Sharp Edges**: `0px` border-radius on all UI elements (Buttons, Inputs).
-   **Typography**: `Inter` (Display/UI) + `JetBrains Mono` (Data/Technical).
-   **Atmosphere**: SVG Noise Overlay + Vignette for depth. No flat colors.

### Key Components

#### 1. Navigation (`Navigation.tsx`)
-   **Style**: Floating Overlay (Bottom Center).
-   **Behavior**: Minimal, glass-morphism bar.
-   **Interaction**: Active tab indicator follows selection.

#### 2. Action Buttons (`Button.tsx`)
-   Rectangular, high-contrast.
-   Hover effect: Physical padding expansion (`hover:px-10`).
-   No drop shadows (brutalist approach).

---

## Data Flow

### Server Status
1.  **Renderer (`App.tsx`)** calls `window.electron.getServerStatus()` every 30s.
2.  **Main (`index.ts`)** receives IPC call, delegates to `checkServerStatus()`.
3.  **Logic (`serverStatus.ts`)** fetches `api.freemcserver.net`.
4.  **Return**: Data flows back to Renderer to update `ServerStatusBadge`.

### Game Launch
1.  **User** clicks "LAUNCH_GAME".
2.  **Renderer** sends `launch-minecraft` IPC event with config (RAM, Username).
3.  **Main (`minecraft.ts`)** spawns Java process with correct arguments.
4.  **Main** sends `stdout` / `stderr` back to Renderer (optional console view).

---

## Best Practices

1.  **Strict IPC**: Never expose Node.js directly to the Renderer. Use `contextBridge` in `preload.cjs`.
2.  **No `remote` module**: Avoid Electron's remote module for security and performance.
3.  **Tailwind Config**: Define all colors/fonts in `tailwind.config.js`, do not hardcode hex values in components.
4.  **Aesthetics**: Always check for `no-select` on UI elements to prevent text highlighting.

---

## Troubleshooting

### "Window.electron is undefined"
-   Check `public/preload.cjs` exists.
-   Ensure `main/index.ts` points to the `.cjs` file.
-   Verify invalid ESM imports aren't sneaking into the preload script.

### Styles Broken?
-   Ensure `globals.css` imports `@tailwind`.
-   Check `tailwind.config.js` `content` array includes your file paths.
