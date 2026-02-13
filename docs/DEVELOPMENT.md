# Guide du Développeur

Ce guide décrit comment j'ai configuré, développé et construit le projet Communokot Launcher.

## Prérequis

- **Node.js** : v20 ou supérieur recommandé.
- **Gestionnaire de paquets** : npm (v10+).

## Configuration

1.  **Cloner le dépôt** :
    ```bash
    git clone https://github.com/theocode29/Communokot-Launcher.git
    cd Communokot-Launcher
    ```

2.  **Installer les dépendances** :
    ```bash
    npm install
    ```

## Commandes de Développement

### Démarrer en Mode Dev
Je lance le renderer React (avec HMR activé) et le processus principal Electron simultanément :
```bash
npm run electron:dev
```
*   Le Renderer tourne sur `http://localhost:5173`.
*   Electron se connecte à ce serveur local.

### Lancer les Tests
J'utilise **Vitest** pour garantir la fiabilité du moteur de configuration :
```bash
# Lancer tous les tests unitaires (50+)
npm test

# Mode watch pour le développement
npm run test:watch
```
Les tests couvrent la détection matérielle, la fusion des presets et l'intégrité des fichiers.

### Lancer l'Outil de News
Pour gérer les articles de news :
```bash
node tools/launcher-news-tool/index.js create
```
Je suis les invites interactives pour ajouter des nouvelles à `launcher-news/main/updates.json`.

## Build pour la Production

J'utilise `electron-builder` pour empaqueter l'application.

### Windows (.exe)
```bash
npm run dist:win
```
Sortie : `dist/${version}/Communokot Launcher Setup ${version}.exe`
> [!NOTE]
> L'installeur Windows inclut désormais `build/installer.nsh` qui utilise PowerShell pour "unblocker" les fichiers installés et limiter les blocages SmartScreen.

### macOS (.pkg / .dmg / .zip)
```bash
npm run dist:mac
```
Sorties : 
* `dist/${version}/Communokot Launcher-${version}-arm64.pkg` (Recommandé pour l'installation initiale)
* `dist/${version}/Communokot Launcher-${version}-arm64.dmg`
* `dist/${version}/Communokot Launcher-${version}-arm64.zip` (Utilisé par l'auto-updater)

> [!TIP]
> Le fichier `.pkg` contient un script `postinstall` (`build/pkg-scripts/postinstall`) qui exécute automatiquement `xattr -cr` sur l'application installée pour supprimer les attributs de quarantaine et corriger les erreurs de permissions lors des mises à jour.

## Structure du Projet

- `src/main/` : **Backend** (Processus Principal Electron). Gère le système de fichiers, le lancement du jeu, les backups et l'optimisation.
- `src/renderer/` : **Frontend** (UI React). Communique avec le main via `window.electron`.
- `public/` : Assets statiques (icônes, fond) et `preload.cjs`.
- `vitest.config.ts` : Configuration de la suite de tests.

## Directives de Code

- **Style** : J'utilise les variables de thème "Sable/Clair" dans `globals.css` (`--color-deep`, `--color-brand`).
- **Icônes** : J'utilise `lucide-react` pour toutes les icônes.
- **IPC** : Les nouveaux gestionnaires doivent être ajoutés à `src/main/index.ts` ET exposés dans `public/preload.cjs`.

## Dépannage du Développement

- **"Window.electron is undefined"** : S'assurer que le script de preload a chargé correctement. Vérifier la console pour "Preload script error".
- **Écran Blanc au Build** : Vérifier que `index.html` référence les bons chemins (généralement géré par Vite).
