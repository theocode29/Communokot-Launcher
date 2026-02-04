# Documentation Complète du Communokot Launcher

Bienvenue dans la documentation complète et unifiée du projet **Communokot Launcher**. Ce document regroupe toutes les informations techniques, architecturales et les guides d'utilisation que j'ai produits pour ce projet.

---

## 📑 Table des Matières

1.  [Introduction](#1-introduction)
2.  [Fonctionnalités](#2-fonctionnalités)
3.  [Installation](#3-installation)
4.  [Spécifications Techniques](#4-spécifications-techniques)
5.  [Architecture du Projet](#5-architecture-du-projet)
6.  [Optimisations de Performance](#6-optimisations-de-performance)
7.  [Système de Statut Serveur](#7-système-de-statut-serveur)
8.  [Guide de Développement](#8-guide-de-développement)
9.  [Crédits et Licence](#9-crédits-et-licence)

---

## 1. Introduction

Le **Communokot Launcher** est une application de bureau moderne conçue pour faciliter l'accès au serveur Minecraft "Communokot". J'ai conçu cette application pour être performante, esthétique et simple d'utilisation, en remplaçant les lanceurs génériques par une expérience sur-mesure.

Le design s'inspire d'une esthétique "Science-Fiction Cinématographique" (Star Wars Jedi, Braun, Nothing OS), avec un thème sombre profond (`#050505`) et des éléments d'interface brutalistes.

---

## 2. Fonctionnalités

-   🚀 **Lancement en un clic** : Connexion instantanée au serveur sans configuration complexe.
-   🗺️ **Carte en Direct** : Intégration native de *BlueMap* pour visualiser le monde en 3D directement depuis le launcher.
-   📰 **Fil d'Actualités** : Les dernières mises à jour du serveur affichées sous forme de cartes élégantes avec images.
-   ⚙️ **Paramètres Personnalisés** : Gestion facile de l'allocation RAM, du chemin Java et du pseudo.
-   🔄 **Mises à jour Automatiques** : Le launcher se met à jour tout seul grâce à l'intégration GitHub Releases.
-   🎨 **Interface Premium** : Animations fluides (Framer Motion) et design soigné.

---

## 3. Installation

### Pour les Utilisateurs

Téléchargez simplement la dernière version depuis la page [GitHub Releases](https://github.com/theocode29/Communokot-Launcher/releases).

-   **Windows** : Exécutable `.exe` (installeur automatique).
-   **macOS** :
    -   Puce Intel : Version `-x64.dmg`
    -   Puce Apple Silicon (M1/M2/M3) : Version `-arm64.dmg`

### Pour les Développeurs (Depuis la source)

```bash
# Clonez le projet
git clone https://github.com/theocode29/Communokot-Launcher.git
cd Communokot-Launcher

# Installez les dépendances
npm install

# Lancez en mode développement
npm run electron:dev
```

---

## 4. Spécifications Techniques

J'ai choisi une stack technologique moderne pour garantir performance et maintenabilité :

| Couche | Technologie | Rôle |
|--------|-------------|------|
| **Runtime** | **Electron 33** | Base de l'application desktop (Chromium + Node.js). |
| **Frontend** | **React 18** | Construction de l'interface utilisateur. |
| **Langage** | **TypeScript 5** | Typage statique pour un code robuste. |
| **Bundler** | **Vite 5** | Compilation ultra-rapide et HMR (Hot Module Replacement). |
| **Styles** | **Tailwind CSS** | Design system utilitaire. |
| **Animation** | **Framer Motion** | Mouvements fluides de l'interface. |
| **Données** | **Electron-Store** | Persistance des paramètres locaux. |

---

## 5. Architecture du Projet

### Structure des Dossiers

L'organisation du code que j'ai établie sépare clairement le processus principal (backend) du rendu (frontend) :

```
src/
├── main/                 # --- BACKEND (Node.js) ---
│   ├── index.ts          # Point d'entrée, création de fenêtre.
│   ├── minecraft.ts      # Logique de lancement du jeu (Java spawn).
│   ├── serverStatus.ts   # Récupération de l'état du serveur.
│   └── ipcUtils.ts       # Sécurité des échanges inter-processus.
│
├── renderer/             # --- FRONTEND (React) ---
│   ├── components/       # Composants UI (Boutons, Navigation).
│   ├── pages/            # Vues (Accueil, Carte, News, Paramètres).
│   ├── styles/           # CSS global et configuration du thème.
│   └── App.tsx           # Routeur et layout principal.
```

### Flux de Données (Data Flow)

Le **Processus Principal** (Main) et le **Processus de Rendu** (Renderer) communiquent **uniquement** via IPC (Inter-Process Communication) sécurisé par un `contextBridge`.

1.  **Lancement du Jeu** :
    -   Le Renderer demande le lancement (`minecraft:launch`).
    -   Le Main vérifie la config, trouve Java, et spawn le processus Minecraft avec les arguments de connexion directe au serveur Communokot.

2.  **Statut Serveur** :
    -   Le Renderer demande le statut périodiquement.
    -   Le Main interroge l'API `freemcserver.net` et renvoie les données (Joueurs, MOTD, Statut).

---

## 6. Optimisations de Performance

Pour assurer une fluidité maximale, notamment avec la carte 3D intégrée, j'ai mis en place plusieurs optimisations :

-   **Flags Chromium** : Activation forcée de l'accélération GPU (`ignore-gpu-blacklist`, `enable-accelerated-2d-canvas`) dans `main/index.ts`.
-   **Lazy Loading** : La page "Carte" (`BlueMapViewer`) n'est chargée que si l'utilisateur clique dessus, économisant de la mémoire au démarrage.
-   **Vite Chunking** : Le code est découpé en petits morceaux (`chunks`) pour optimiser le chargement initial.
-   **Builds Natifs** : Sur macOS, je génère des builds séparés pour Intel et Apple Silicon pour éviter la pénalité de performance de Rosetta.

---

## 7. Système de Statut Serveur

Le launcher affiche en temps réel l'état du serveur Minecraft.

-   **Source** : API `freemcserver.net` (GRATUIT).
-   **Endpoint** : `GET https://api.freemcserver.net/v4/server/1949282/ping`
-   **Fréquence** : Actualisation toutes les 30 secondes.

Si le serveur est hors ligne, le bouton "JOUER" se désactive et un indicateur rouge apparaît.

---

## 8. Guide de Développement

### Commandes Utiles

-   `npm run electron:dev` : Lance toute l'application en mode dev.
-   `npm run dist:win` : Crée l'installeur Windows.
-   `npm run dist:mac` : Crée les installateurs macOS.
-   `node tools/launcher-news-tool/index.js create` : Lance l'assistant CLI pour ajouter une news.

### Ajouter une News
J'ai créé un petit outil en ligne de commande pour faciliter la gestion des news. Lancez la commande ci-dessus, et répondez aux questions (Titre, Image, Texte). Cela générera automatiquement le JSON nécessaire que le launcher lira.

### Bonnes Pratiques de Code
-   Utilisez toujours **TypeScript** strict.
-   Pour le style, utilisez les classes **Tailwind** et évitez le CSS pur sauf exception.
-   Respectez le design system "CommunoCode" (Bordures 0px, Noir Profond, Contrastes forts).

---

## 9. Crédits et Licence

**Auteur** : Théophile (Projet Communokot)
**Licence** : MIT

---
*Cette documentation a été générée le 4 Février 2026 et reflète l'état actuel de la version 1.0.4.*
