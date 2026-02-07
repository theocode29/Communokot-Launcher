# Optimisations de Performance & Robustesse

Ce document décrit les optimisations de performance et les garanties de robustesse implémentées dans le Communokot Launcher.

---

## 🚀 Optimisations Core

### Commutateurs GPU & Chromium
J'applique des commutateurs de ligne de commande Chromium pour maximiser l'accélération matérielle (WebGL pour BlueMap) :
- `ignore-gpu-blacklist` : Force l'utilisation du GPU même si Chromium le juge "instable".
- `enable-accelerated-2d-canvas` : Accélération 2D.
- `force_high_performance_gpu` : Préfère le GPU dédié (Nvidia/AMD) au GPU intégré (Intel/M1).

### Bundle & Chargement
- **Vite Chunking** : Séparation des dépendances (`react`, `framer-motion`, `lucide`) pour un chargement atomique.
- **Lazy Loading** : La `MapPage` (BlueMap) est chargée à la demande uniquement.
- **ASAR Unpack** : Les modules natifs comme `electron-store` sont décompressés pour éviter les lags d'accès disque.

---

## 🛡️ Système de Robustesse (v1.1.1)

Le launcher intègre désormais un moteur d'optimisation "Hardware-Aware" qui garantit la stabilité du jeu.

### 1. Détection Matérielle (Automatic Scoring)
Le launcher calcule un score de performance (0-100) basé sur :
- **RAM Total** : Bonus significatif au-delà de 12 Go.
- **CPU Cores** : Optimisé pour les processeurs multi-cœurs (8+).
- **GPU Type** : Détection dédiée vs intégrée.
- **Résolution** : Pénalités intelligentes pour la 4K afin de suggérer des presets plus légers.

### 2. Presets de Performance
| Preset | Cible | Caractéristiques |
|--------|-------|------------------|
| **Low-End** | PC Bureautique / Ancien | Graphismes Fast, Entités réduites, RAM optimisée. |
| **Balanced** | PC Standard / Laptop | Équilibre qualité/perf (Sodium/Lithium optimisés). |
| **High-End** | PC Gaming / Apple Silicon | Haute distance de vue, shaders supportés, max chunks. |

### 3. Base d'Incompatibilités Humaine (DB)
Le système détecte les configurations à risque et applique des correctifs automatiques :
- **Intel 13/14th Gen** : Ajustement des buffers de Sodium pour éviter les crashs de micro-code.
- **Apple Silicon (M1/M2/M3)** : Optimisations spécifiques pour l'architecture ARM.
- **AMD Drivers** : Paramètres de compatibilité pour les anciennes versions d'Adrenalin.

---

## 🔄 Gestion des Données & Backups

### Protection Anti-Corruption
- **Validation Round-Trip** : Chaque fichier de config modifié (JSON, TOML, Properties) est relu et validé immédiatement après écriture.
- **Écritures Atomiques** : Utilisation de fichiers temporaires pour éviter les fichiers à 0 octet en cas de coupure de courant.

### Système de Backups Versionnés
Le launcher gère :
- **Backups Manifestés** : Chaque changement crée une entrée avec ID, date et raison.
- **Audit Log** : Historique des 100 dernières opérations (presets appliqués, restaure, etc.).
- **Auto-Pruning** : Conservation intelligente des 10 dernières versions pour limiter l'espace disque.

---

## 🧪 Validation Technique (AQ)

La fiabilité est assurée par une suite de **52 tests unitaires** couvrant :
- La fusion profonde des configurations (Deep Merge).
- Le calcul du score matériel.
- La simulation d'application (Dry-Run).
- La validité des parseurs TOML/Properties personnalisés.

---
*Optimisé pour Communokot - Février 2026*
