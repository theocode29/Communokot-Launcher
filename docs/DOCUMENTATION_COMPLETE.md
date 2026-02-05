# Documentation Complète du Communokot Launcher

Bienvenue dans la documentation complète et unifiée du projet **Communokot Launcher**. Ce document regroupe toutes les informations techniques, architecturales et les guides d'utilisation que j'ai produits.

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
9.  [Gestion du Resource Pack et Logs](#9-gestion-du-resource-pack-et-logs)
10. [Système d'Installation et d'Optimisation](#10-système-dinstallation-et-doptimisation)
11. [Crédits et Licence](#11-crédits-et-licence)

---

## 1. Introduction

Le **Communokot Launcher** (v1.1.1) est une application de bureau conçue pour faciliter l'accès au serveur Minecraft "Communokot" (Version 1.21.11). L'accent est mis sur la performance, l'esthétique et la simplicité, avec un design "Liquid Glass" sombre profond (`#050505`).

---

## 2. Fonctionnalités

-   🚀 **Lancement Direct** : Connexion automatique au serveur avec configuration optimisée.
-   🛠️ **Auto-Fabric & Mods** : Installation transparente de Fabric Loader 0.18.0 et des mods d'optimisation via Modrinth API.
-   📊 **Barre de Progression** : Feedback visuel détaillé pendant l'initialisation du jeu.
-   🗺️ **Carte Satellite** : Intégration de *BlueMap* via une stratégie de "Virtual Window" qui masque l'interface native pour une immersion totale.
-   📰 **Système de News** : Affichage dynamique de cartes d'actualités gérées via un outil CLI dédié.
-   ⚙️ **Gestion des Paramètres** : Allocation RAM, sélecteur de dossier Minecraft, et persistence des préférences.
-   🔄 **Auto-Update Launcher** : Intégration `electron-updater` avec les releases GitHub.
-   🎨 **UX Soignée** : Audit de contraste complet et animations Framer Motion.

---

## 3. Installation

Identique aux instructions du [README](../README.md). J'assure le support pour les architectures Windows, macOS (Intel) et macOS (Apple Silicon).

---

## 4. Spécifications Techniques

| Couche | Technologie | Note |
|--------|-------------|------|
| **Core** | **Electron 33** | Base système. |
| **UI** | **React 18** | Composants modulaires. |
| **Logic** | **TypeScript 5** | Sécurité du typage. |
| **Styles** | **Tailwind CSS** | Design system "CommunoCode". |
| **Stockage** | **Electron-Store** | Persistence des JSON. |

---

## 5. Architecture du Projet

Le projet utilise une communication IPC stricte entre le **Main** (Node.js) et le **Renderer** (React). 
La logique de lancement Minecraft repose sur `minecraft-launcher-core`, encapsulée dans `src/main/minecraft.ts`.

---

## 6. Optimisations de Performance

-   **Virtual Window Technique** : Pour la carte BlueMap, j'utilise un iframe dimensionné à 120% avec un décalage de -10% pour rogner les menus natifs et gagner en surface d'affichage.
-   **GPU Acceleration** : Forçage des flags Chromium pour éviter le lag sur les cartes 3D.
-   **Lazy Loading** : Initialisation à la demande des pages lourdes.

---

## 7. Système de Statut Serveur

Interrogation périodique (toutes les 30s) de l'API `freemcserver.net`. En version 1.1.1, l'affichage a été affiné pour plus de précision (capsules de statut).

---

## 8. Guide de Développement

### Outil de Publication (News)
Utilise le script dans `tools/launcher-news-tool/` pour générer les entrées JSON d'actualités.

---

## 9. Gestion du Resource Pack et Logs

J'ai implémenté un système robuste de mise à jour du pack de textures :
- **Synchronisation** : Comparaison du hash SHA-256 local vs distant (GitHub).
- **Vérification d'intégrité** : Re-calcul du hash après téléchargement pour éviter les fichiers corrompus.
- **Logs Détaillés** : Le processus de synchronisation est entièrement loggué dans la console (`[ResourcePack]`) pour faciliter le diagnostic des erreurs de téléchargement ou d'installation dans le dossier Minecraft.

---

## 10. Système d'Installation et d'Optimisation

J'ai ajouté une couche d'automatisation critique pour garantir une expérience de jeu fluide sans intervention manuelle de l'utilisateur :

- **Fabric Installer** : Le launcher télécharge dynamiquement l'installeur Fabric et configure le profil `fabric-loader-0.18.0-1.21.11`.
- **Modrinth API SDK** : Une intégration sur mesure avec Modrinth permet de récupérer les dernières versions stables de :
    - *Sodium* (Performances de rendu)
    - *ImmediatelyFast* (Optimisation réseau/entités)
    - *Lithium* (Optimisation CPU/physique)
    - *FerriteCore* (Réduction de l'usage RAM)
    - *EntityCulling* (Culling des entités non visibles)
- **Nettoyage Intelligent** : Le launcher vérifie le dossier `mods` à chaque démarrage et supprime les fichiers obsolètes ou non autorisés pour éviter les conflits.

---

## 11. Crédits et Licence

**Auteur** : Théophile (Communokot)
**Licence** : MIT

---
*Dernière mise à jour : 5 Février 2026 (v1.1.1)*
