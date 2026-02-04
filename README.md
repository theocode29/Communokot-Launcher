# 🎮 Communokot Launcher

<div align="center">

![Communokot Logo](public/icon.png)

**A modern, high-performance Minecraft launcher for the Communokot server**

[![Electron](https://img.shields.io/badge/Electron-33-47848F?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

---

## ✨ Features

- 🚀 **One-Click Launch** — Connect to Communokot server instantly
- 🗺️ **Live Map** — Integrated BlueMap 3D world viewer
- 📰 **News Feed** — Server updates and announcements
- ⚙️ **Settings** — RAM allocation, Java path, username
- 🔄 **Auto-Updates** — Automatic launcher updates via GitHub Releases
- 🎨 **Modern UI** — Dark theme with smooth animations

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Core | Electron 33 |
| UI | React 18 + TypeScript |
| Bundler | Vite 5 |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Storage | electron-store |

---

## 📦 Installation

### From Releases
Download the latest version from [GitHub Releases](https://github.com/theocode29/Communokot-Launcher/releases).

- **Windows**: `.exe` installer
- **macOS (Intel)**: `-x64.dmg`
- **macOS (Apple Silicon)**: `-arm64.dmg`

### From Source

```bash
# Clone the repository
git clone https://github.com/theocode29/Communokot-Launcher.git
cd Communokot-Launcher

# Install dependencies
npm install

# Run in development
npm run electron:dev

# Build for production
npm run dist:mac   # macOS
npm run dist:win   # Windows
```

---

## 📁 Project Structure

```
src/
├── main/               # Electron main process
│   ├── index.ts        # Window & IPC handlers
│   ├── minecraft.ts    # Game launch logic
│   ├── serverStatus.ts # Server ping
│   └── utils/          # Config, IPC utilities
└── renderer/           # React UI
    ├── components/     # Navigation, Button, Layout
    ├── pages/          # Home, Map, Updates, Settings
    └── styles/         # Tailwind globals
```

---

## 📚 Documentation

- [Technical Specifications](docs/LAUNCHER_DESCRIPTION.md)
- [Project Architecture](docs/PROJECT_ARCHITECTURE.md)
- [Server Status API](docs/SERVER_STATUS.md)
- [Performance Optimizations](docs/PERFORMANCE.md)

---

## 🔗 Links

- **Server**: `mc1949282.fmcs.cloud:25565`
- **Live Map**: [BlueMap](http://mc1949282.fmcs.cloud:50100)

---

## 📄 License

MIT © Communokot Team
