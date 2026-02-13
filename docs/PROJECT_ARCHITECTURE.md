# Communokot Launcher - Architecture du Projet

## Vue d'ensemble

Le Communokot Launcher est un lanceur Minecraft moderne et performant construit avec la stack **Electron + Vite + React**. J'ai implémenté un système de design personnalisé ("CommunoCode") inspiré des interfaces de science-fiction cinématographiques (Star Wars Jedi, Braun, Nothing OS).

## Stack Technique

| Composant | Technologie | Raisonnement |
|-----------|------------|--------------|
| **Core** | Electron (v33+) | Capacités bureau cross-platform (Node.js + Chromium). |
| **Bundler** | Vite | Temps de build ultra-rapides comparés à Webpack. Support HMR. |
| **Framework UI** | React 18 | Logique UI basée sur les composants. |
| **Styling** | Tailwind CSS | Styling "utility-first" pour une implémentation rapide du design. |
| **Animation** | Framer Motion | Transitions de layout fluides et basées sur la physique. |
| **État** | React Hooks | Gestion d'état local (suffisante pour cette échelle). |

---

## Structure des Dossiers

```
src/
├── main/                 # Processus Principal Electron (Node.js)
│   ├── index.ts          # Point d'entrée. Création de fenêtre & gestionnaires IPC.
│   ├── updater.ts        # Gestionnaire de mises à jour modulaire (GitHub Releases).
│   ├── minecraft.ts      # Logique de lancement du jeu (Launcher Handoff).
│   ├── preset-orchestrator.ts # Orchestrateur de performance & sécurité.
│   ├── backup-manager.ts # Backups, Audit logs & Safe Boot.
│   ├── incompatibility-db.ts # Base de données de correctifs hardware.
│   └── ...
├── renderer/             # Processus de Rendu Electron (React UI)
│   ├── components/       # Éléments UI réutilisables (Navigation, Bouton).
│   ├── pages/            # Vues des pages (HomePage, MapPage).
│   ├── styles/           # CSS Global & imports Tailwind.
│   └── App.tsx           # Layout principal & logique de routing.
└── ...
```

## Système de Design : "CommunoCode"

### Philosophie
-   **Mode Sombre Uniquement** : Fond de base `#050505`.
-   **Bords Nets** : `0px` de border-radius sur tous les éléments UI (Boutons, Inputs).
-   **Typographie** : `Inter` (Affichage/UI) + `JetBrains Mono` (Données/Technique).
-   **Atmosphère** : Overlay de Bruit SVG + Vignette pour la profondeur. Pas de couleurs plates.

### Composants Clés

#### 1. Navigation (`Navigation.tsx`)
-   **Style** : Overlay Flottant (Bas Centre).
-   **Comportement** : Barre minimaliste, effet glass-morphism.
-   **Interaction** : L'indicateur d'onglet actif suit la sélection.

#### 2. Boutons d'Action (`Button.tsx`)
-   Rectangulaires, haut contraste.
-   Effet Hover : Expansion physique du padding (`hover:px-10`).
-   Pas d'ombres portées (approche brutaliste).

---

## Flux de Données

### Statut du Serveur
1.  **Renderer (`App.tsx`)** appelle `window.electron.getServerStatus()` toutes les 30s.
2.  **Main (`index.ts`)** reçoit l'appel IPC, délègue à `checkServerStatus()`.
3.  **Logique (`serverStatus.ts`)** fetch `api.freemcserver.net`.
4.  **Retour** : Les données reviennent au Renderer pour mettre à jour `ServerStatusBadge`.

### Mises à jour Automatiques (v1.1.3)
1.  **Main (`updater.ts`)** : Vérifie la présence d'une nouvelle version sur GitHub Releases au démarrage.
2.  **Download** : Si disponible, le téléchargement commence en arrière-plan avec émission de `update:progress`.
3.  **Renderer (`UpdateNotification.tsx`)** : Affiche la progression et, une fois terminé, propose un bouton "Redémarrer".
4.  **Action** : Le clic sur le bouton envoie l'IPC `update:install` qui déclenche `quitAndInstall()` dans le Main.

### Lancement du Jeu (Orchestration Robuste)
1.  **Utilisateur** clique sur "JOUER".
2.  **Renderer** envoie l'événement IPC `minecraft:launch`.
3.  **Main (`preset-orchestrator.ts`)** orchestre la séquence de sécurité :
    - `hardware-detection.ts` : Analyse du matériel et calcul du score.
    - `incompatibility-db.ts` : Vérification des conflits mod/hardware.
    - `backup-manager.ts` : Création automatique d'un point de restauration.
    - `dry-run-engine.ts` : Simulation interne pour valider la fusion des configs.
    - `config-manager.ts` : Application atomique avec validation round-trip.
4.  **Main** poursuit avec la mise à jour classique :
    - `resourcepack.ts` : Sync du pack de ressources (SHA-256).
    - `fabric.ts` : Installation du loader Fabric si nécessaire.
    - `mods.ts` : Résolution dynamique (Modrinth API).
5.  **Main** invoque `minecraft-launcher-core` (MCLC).
6.  **Feedback** : Émission de `launch:progress` et journalisation dans `audit-log.json`.

---

## Bonnes Pratiques

1.  **IPC Strict** : Je n'expose jamais Node.js directement au Renderer. J'utilise `contextBridge` dans `preload.cjs`.
2.  **Pas de module `remote`** : J'évite le module remote d'Electron pour la sécurité et la performance.
3.  **Config Tailwind** : Je définis toutes les couleurs/polices dans `tailwind.config.js`, je ne code pas en dur les valeurs hexadécimales dans les composants.
4.  **Esthétique** : Je vérifie toujours `no-select` sur les éléments UI pour empêcher la sélection de texte.

---

## Dépannage

### "Window.electron is undefined"
-   Vérifier que `public/preload.cjs` existe.
-   S'assurer que `main/index.ts` pointe vers le fichier `.cjs`.
-   Vérifier que des imports ESM invalides ne se glissent pas dans le script de preload.

### Styles Cassés ?
-   S'assurer que `globals.css` importe `@tailwind`.
-   Vérifier que le tableau `content` de `tailwind.config.js` inclut bien les chemins de fichiers.
