# Communokot Launcher — Spécifications Techniques & Guide de Reconstruction (v1.1.2)

Ce document sert de **référence unique** pour reconstruire intégralement l'application **Communokot Launcher**. J'y ai inclus l'architecture, la stack technique, la structure des fichiers, les configurations critiques et la logique métier, incluant le moteur d'optimisation robuste introduit en v1.1.1 et le système de mise à jour modulaire de la v1.1.2.

---

## 1. Stack Technique

*   **Runtime** : Node.js (v20+ recommandé)
*   **Core** : [Electron](https://www.electronjs.org/) (v33.x)
*   **Bundler** : [Vite](https://vitejs.dev/) (pour des builds ultra-rapides)
*   **Frontend** : [React](https://reactjs.org/) v19
*   **Langage** : [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
*   **Styling** : [Tailwind CSS](https://tailwindcss.com/) (Design System Custom)
*   **Networking** : `axios` (API reqs)
*   **Packaging** : `electron-builder` (NSIS pour Windows, DMG/ZIP pour macOS)
*   **Updates** : `electron-updater` (GitHub Releases)

---

## 2. Structure du Projet

L'arborescence complète des fichiers que j'ai établie :

```
Communokot launcher/
├── package.json
├── electron-builder.yml
├── tsconfig.json          # Config TypeScript globale (référence les autres)
├── tsconfig.node.json     # Config pour les fichiers de build (vite config)
├── tsconfig.web.json      # Config pour le renderer (React)
├── vite.config.ts         # Configuration Vite (Dual-config Main/Renderer)
├── tailwind.config.js     # Thème Brutalist
├── postcss.config.js      # PostCSS config (Tailwind + Autoprefixer)
├── .env.example           # VITE_API_URL, etc.
│
├── public/                # Assets statiques (copiés à la racine du build)
│   ├── bg_campfire.jpeg   # Fond d'écran 1
│   ├── bg_underwater.jpeg # Fond d'écran 2
│   └── icon.png           # Icône de l'application (512x512)
│
├── src/
│   ├── main/              # --- PROCESSUS PRINCIPAL (Node.js) ---
│   │   ├── index.ts        # Entry point, Window creation, IPC handling
│   │   ├── preload.ts      # ContextBridge (Secure Bridge)
│   │   ├── minecraft.ts    # Logique de lancement CLI Java (Handoff)
│   │   ├── fabric.ts       # Installation automatique de Fabric Loader
│   │   ├── mods.ts         # Gestionnaire de mods (Modrinth API)
│   │   ├── updater.ts      # Logique Auto-Updater modulaire (v1.1.2)
│   │   ├── resourcepack.ts # Gestion automatique des Resource Packs
│   │   ├── preset-orchestrator.ts # Orchestration robuste des performances
│   │   ├── backup-manager.ts # Système de versioning & recovery
│   │   ├── incompatibility-db.ts # Gestionnaire de correctifs hardware
│   │   ├── dry-run-engine.ts # Moteur de simulation de config
│   │   ├── config-manager.ts # Gestionnaire de fusion & validation atomique
│   │   └── utils/
│   │       ├── logger.ts   # Console wrapper instrumenté
│   │       └── config.ts   # Gestion electron-store / .env
│   │
│   └── renderer/          # --- PROCESSUS DE RENDU (React UI) ---
│       ├── index.html      # Point d'entrée HTML
│       ├── index.tsx       # Montage React Root
│       ├── App.tsx         # Layout principal & Router
│       ├── types.ts        # Types partagés (IPC interfaces)
│       ├── constants.ts    # Couleurs, URLs, Config statique
│       ├── styles/
│       │   └── globals.css  # Imports Tailwind components/utilities
│       ├── components/
│       │   ├── Navigation.tsx   # Barre d'onglets colorés
│       │   ├── Button.tsx       # Boutons "Brutalist" (Hard Shadow)
│       │   ├── ProgressBar.tsx  # Barre de progression "Liquid Glass"
│       │   └── BlueMapViewer.tsx # Iframe wrapper avec loader
│       └── pages/
│           ├── HomePage.tsx     # Hero section + Bouton PLAY
│           ├── MapPage.tsx      # Intégration BlueMap
│           ├── UpdatesPage.tsx  # Liste des news (fetch JSON)
│           └── ParametersPage.tsx # Formulaire settings (RAM, Java Path)
│
├── tools/
│   └── launcher-news-tool/ # Tool CLI pour générer updates.json
└── dist/                   # Dossier de sortie (généré par build)
```

---

## 3. Configurations Critiques

### 📦 `package.json`

```json
{
  "name": "communokot-launcher",
  "productName": "Communokot Launcher",
  "version": "1.0.4",
  "main": "dist/main/index.js",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "dist:win": "npm run build && electron-builder --win",
    "dist:mac": "npm run build && electron-builder --mac"
  },
  "dependencies": {
    "axios": "^1.x",
    "electron-store": "^8.x",
    "electron-updater": "^6.x",
    "framer-motion": "^10.x",
    "react": "^19.x",
    "react-dom": "^19.x"
  },
  "devDependencies": {
    "electron": "^33.x",
    "electron-builder": "^24.x",
    "tailwindcss": "^3.x",
    "typescript": "^5.x",
    "vite": "^5.x",
    "vite-plugin-electron": "^0.x"
  }
}
```

### 🛠 Configuration `electron-builder.yml`

```yaml
appId: com.communokot.launcher
productName: Communokot Launcher
directories:
  output: dist/${version}
files:
  - dist/**/*
  - package.json
win:
  target: nsis
  icon: public/icon.png
mac:
  target: 
    - dmg
    - zip
  icon: public/icon.png
publish:
  provider: github
  owner: theocode29
  repo: Communokot-Launcher
```

### 🎨 `tailwind.config.js` - Le Style "Swiss Brutalist"

```javascript
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Couleurs d'accentuation pour la navigation
        'tab-home': '#C4F623',   // Electric Lime
        'tab-map': '#1D4ED8',    // Electric Blue
        'tab-updates': '#FF4500', // International Orange
        'tab-settings': '#FF69B4', // Hot Pink
        'surface': '#F8F8F8',
        'line': '#E5E5E5'
      },
      boxShadow: {
        'brutalist': '4px 4px 0px 0px rgba(0,0,0,1)', // L'ombre dure caractéristique
      }
    }
  },
  plugins: [],
}
```

---

## 4. Logique d'Implémentation & Code

### Processus Principal (`src/main`)

1.  **`index.ts`** : Je crée une fenêtre `BrowserWindow` avec `frame: false`. J'injecte `preload.js`. Il gère le canal IPC `launch:progress` pour remonter les étapes au renderer.
2.  **`preset-orchestrator.ts`** :
    *   **Sécurité** : Création d'un backup -> Check Incompatibilités -> Simulation Dry Run.
    *   **Application** : Fusion intelligente des configs avec préservation des touches utilisateur et validation round-trip (Zéro corruption).
3.  **`minecraft.ts`** :
    *   Orchestration du lancement : Check Resource Pack -> Install Fabric -> Update Mods -> Launch MCLC.
    *   **Arguments Java** : `-Xmx{ram}G` + Connect Auto.
4.  **`fabric.ts`** : 
    *   Télécharge l'installeur JAR officiel de Fabric.
    *   Exécute l'installation en mode silencieux (`-noprofile`) pour générer le JSON de version.
5.  **`mods.ts`** :
    *   Interroge l'API Modrinth pour trouver les versions exactes de (Sodium, Lithium, FerriteCore, ImmediatelyFast, EntityCulling).
    *   Nettoie le dossier `mods/` pour ne garder que les JARs officiels optimisés.
5.  **IPC Handling** :
    ```typescript
    ipcMain.handle('minecraft:launch', async (_, options) => { ... });
    ipcMain.handle('get-config', () => store.get('config'));
    ipcMain.handle('set-config', (_, key, val) => store.set(key, val));
    ```

### Renderer (`src/renderer`)

1.  **Navigation (`App.tsx`)** :
    *   J'utilise un state `activeTab` ('home', 'map', etc.).
    *   J'affiche conditionnellement les composants de page (`<HomePage />`, `<MapPage />`).
    *   La barre de navigation change de couleur de bordure selon l'onglet actif.

2.  **Map (`MapPage.tsx`)** :
    *   Iframe pointant vers `http://mc1949282.fmcs.cloud:50100`.
    *   Je gère le `onLoad` pour masquer le spinner de chargement.

3.  **Updates (`UpdatesPage.tsx`)** :
    *   `useEffect` qui fetch: `https://raw.githubusercontent.com/theocode29/Communokot-Launcher/main/launcher-news/main/updates.json`
    *   Format JSON attendu : `[{ title: string, image: string, content: string, date: string }]`

4.  **Settings (`ParametersPage.tsx`)** :
    *   Champs : Input "Username", Slider "RAM" (2Go - 16Go), Input "Java Path".
    *   Sauvegarde automatique via IPC `set-config` à chaque changement.

---

## 5. Tooling Annexe

### Launcher News Tool (`tools/launcher-news-tool`)
Un script Node.js simple pour générer le JSON des news.
*   **Input** : Titre, URL Image, Texte.
*   **Output** : Met à jour le fichier `launcher-news/main/updates.json` et commit sur Git (si configuré).

---

## 6. URLs & Ressources Externes

*   **Serveur Minecraft** : `mc1949282.fmcs.cloud` (Port 25565)
*   **Serveur Map** : `http://mc1949282.fmcs.cloud:50100`
*   **Repo News** : `https://raw.githubusercontent.com/theocode29/Communokot-Launcher/main/launcher-news/main/updates.json`
*   **Repo Releases** : `theocode29/Communokot-Launcher`

---

## 7. Guide de Démarrage (Reconstruction)

1.  **Initialisation** :
    `npm create vite@latest . -- --template react-ts`
    `npm install electron electron-builder ...`

2.  **Configuration** :
    Je crée les fichiers de config (`vite.config.ts`, `tailwind.config.js`) avec le contenu ci-dessus.

3.  **Développement** :
    `npm run dev` -> Lance React (port 5173) + Electron Window.

4.  **Production** :
    `npm run dist:win` -> Génère l'exécutable Windows dans `dist/`.
