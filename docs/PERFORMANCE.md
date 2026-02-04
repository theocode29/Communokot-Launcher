# Optimisations de Performance

Ce document décrit les optimisations de performance que j'ai implémentées dans le Communokot Launcher pour assurer un rendu des cartes 3D fluide et des temps de démarrage rapides.

---

## Commutateurs GPU & Chromium

J'applique les commutateurs de ligne de commande Chromium suivants avant `app.whenReady()` dans [src/main/index.ts](../src/main/index.ts) :

| `ignore-gpu-blacklist` | Contourner les restrictions GPU de Chromium pour WebGL |
| `enable-accelerated-2d-canvas` | Accélération matérielle pour le Canvas 2D |
| `force_high_performance_gpu` | Utiliser le GPU dédié sur les ordinateurs portables |

*(J'ai retiré d'autres commutateurs comme `enable-zero-copy` pour des raisons de stabilité)*

---

## Optimisation du Bundle

### Découpage Vite (Chunking)

Les bibliothèques tierces sont séparées dans des chunks distincts pour une meilleure mise en cache :

```javascript
manualChunks: {
    'react-vendor': ['react', 'react-dom'],
    'animation': ['framer-motion'],
    'ui': ['lucide-react', 'sonner', 'clsx', 'tailwind-merge'],
}
```

### Configuration ASAR

Les modules natifs sont décompressés pour un chargement correct :

```yaml
asar: true
asarUnpack:
  - "**/*.node"
  - "**/node_modules/electron-store/**"
```

---

## Chargement Différé (Lazy Loading)

Les pages lourdes sont chargées à la demande en utilisant React.lazy() :

```typescript
const MapPage = lazy(() => import('./pages/MapPage.tsx'));
```

Cela garantit que le module BlueMap n'est chargé que lorsque l'utilisateur navigue vers l'onglet Carte.

---

## Bonnes Pratiques IPC

Le module [ipcUtils.ts](../src/main/utils/ipcUtils.ts) fournit des utilitaires pour la gestion sécurisée des gestionnaires IPC :

- `createSafeIpcHandler()` — Enregistre les gestionnaires avec support de nettoyage
- `cleanupAllIpcHandlers()` — Nettoyage en masse à la fermeture de l'application

Cela évite les fuites de mémoire dues aux auditeurs orphelins pendant les longues sessions.

---

## Objectifs de Performance

| Métrique | Cible | Impact |
|--------|--------|--------|
| Temps Interactif | < 3.5s | Démarrage perçu comme rapide |
| Bundle JavaScript | < 300 KB | Analyse initiale rapide |
| Latence IPC | < 10ms | UI Réactive |
| Mémoire de Base | 50-150 MB | Faible empreinte système |
| CPU en Veille | < 2% | Préserve les ressources pour le jeu |

---

## Architectures de Build

Les builds multi-architectures sont configurés dans `electron-builder.yml` :

- **macOS** : `arm64` (Apple Silicon) + `x64` (Intel)
- **Windows** : `x64`

Cela assure une performance native sans traduction Rosetta sur les Macs Apple Silicon.
