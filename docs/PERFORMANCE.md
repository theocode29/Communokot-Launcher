# Performance Optimizations

This document describes the performance optimizations implemented in the Communokot Launcher to ensure smooth 3D map rendering and fast startup times.

---

## GPU & Chromium Switches

The following Chromium command-line switches are applied before `app.whenReady()` in [src/main/index.ts](../src/main/index.ts):

| Switch | Purpose |
|--------|---------|
| `ignore-gpu-blacklist` | Bypass Chromium's GPU restrictions for WebGL |
| `enable-gpu-rasterization` | Smoother 2D rendering |
| `enable-zero-copy` | Better GPU memory efficiency |
| `enable-webgl-draft-extensions` | Advanced WebGL features for BlueMap |
| `force_high_performance_gpu` | Use dedicated GPU on laptops |
| `enable-accelerated-video-decode` | Hardware video decoding |
| `disable-frame-rate-limit` | Unlock framerate for animations |

---

## Bundle Optimization

### Vite Chunking

Vendor libraries are split into separate chunks for better caching:

```javascript
manualChunks: {
    'react-vendor': ['react', 'react-dom'],
    'animation': ['framer-motion'],
    'ui': ['lucide-react', 'sonner', 'clsx', 'tailwind-merge'],
}
```

### ASAR Configuration

Native modules are unpacked for proper loading:

```yaml
asar: true
asarUnpack:
  - "**/*.node"
  - "**/node_modules/electron-store/**"
```

---

## Lazy Loading

Heavy pages are loaded on-demand using React.lazy():

```typescript
const MapPage = lazy(() => import('./pages/MapPage.tsx'));
```

This ensures the BlueMap module is only loaded when the user navigates to the Map tab.

---

## IPC Best Practices

The [ipcUtils.ts](../src/main/utils/ipcUtils.ts) module provides utilities for safe IPC handler management:

- `createSafeIpcHandler()` — Registers handlers with cleanup support
- `cleanupAllIpcHandlers()` — Bulk cleanup on app shutdown

This prevents memory leaks from orphaned listeners during long sessions.

---

## Performance Targets

| Metric | Target | Impact |
|--------|--------|--------|
| Time to Interactive | < 3.5s | Fast perceived startup |
| JavaScript Bundle | < 300 KB | Quick initial parse |
| IPC Latency | < 10ms | Responsive UI |
| Base Memory | 50-150 MB | Low system footprint |
| Idle CPU | < 2% | Preserves resources for game |

---

## Build Architectures

Multi-architecture builds are configured in `electron-builder.yml`:

- **macOS**: `arm64` (Apple Silicon) + `x64` (Intel)
- **Windows**: `x64`

This ensures native performance without Rosetta translation on Apple Silicon Macs.
