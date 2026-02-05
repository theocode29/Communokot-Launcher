# 🎮 Communokot Launcher

<div align="center">

![Communokot Logo](public/icon.png)

**Un launcher Minecraft moderne et performant pour le serveur Communokot**

[![Electron](https://img.shields.io/badge/Electron-33-47848F?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

---

- 🚀 **Lancement en un clic** — Connexion instantanée au serveur Communokot (Version 1.1.1)
- 🗺️ **Carte immersive** — Visualiseur 3D BlueMap avec navigation intuitive et vue "Virtual Window"
- 📰 **Fil d'actualités** — Mises à jour du serveur via un outil de publication dédié
- ⚙️ **Paramètres** — Allocation de RAM, chemin Java, sélecteur de chemin Minecraft
- 🔄 **Mises à jour automatiques** — Système de déploiement continu via GitHub Releases
- 🎨 **Interface Moderne** — Thème sombre "Liquid Glass" optimisé pour le contraste et l'accessibilité
- 📦 **Resource Pack Auto** — Synchronisation avec vérification d'intégrité SHA-256 et logs détaillés

---

## 🛠️ Stack Technique

| Couche | Technologie |
|-------|------------|
| Core | Electron 33 |
| UI | React 18 + TypeScript |
| Bundler | Vite 5 |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Stockage | electron-store |

---

## 📦 Installation

### Depuis les Releases
Téléchargez la dernière version depuis les [GitHub Releases](https://github.com/theocode29/Communokot-Launcher/releases).

- **Windows**: installeur `.exe`
- **macOS (Intel)**: `-x64.dmg`
- **macOS (Apple Silicon)**: `-arm64.dmg`

### Depuis la Source

Consultez le [Guide de Développement](docs/DEVELOPMENT.md) pour les instructions complètes d'installation.

```bash
# Démarrage Rapide
npm install
npm run electron:dev
```

---

## 📁 Structure du Projet

```
src/
├── main/               # Processus principal Electron
│   ├── index.ts        # Gestionnaires de fenêtre & IPC
│   ├── minecraft.ts    # Logique de lancement du jeu
│   └── serverStatus.ts # Ping du serveur
└── renderer/           # UI React
    ├── components/     # Navigation, Bouton, Layout
    ├── pages/          # Accueil, Carte, Mises à jour, Paramètres
    └── styles/         # Variables globales Tailwind
```

---

## 📚 Documentation

- [Spécifications Techniques](docs/LAUNCHER_DESCRIPTION.md) - Spécifications complètes du projet et logique.
- [Architecture du Projet](docs/PROJECT_ARCHITECTURE.md) - Analyse approfondie de la stack et du flux de données.
- [Guide de Développement](docs/DEVELOPMENT.md) - Comment lancer, construire et contribuer.
- [API Statut Serveur](docs/SERVER_STATUS.md) - Détails de l'intégration API.
- [Optimisations de Performance](docs/PERFORMANCE.md) - Commutateurs GPU et bundling.
- [Gestion du Resource Pack](docs/DOCUMENTATION_COMPLETE.md#9-gestion-du-resource-pack) - Guide complet sur l'auto-update et les outils de hachage.

---

## 🔗 Liens

- **Serveur**: `mc1949282.fmcs.cloud:25565`
- **Carte en direct**: [BlueMap](http://mc1949282.fmcs.cloud:50100)

---

## 📄 Licence

MIT © Équipe Communokot
