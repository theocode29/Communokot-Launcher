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
10. [Documentation des Mods et Optimisations](#10-documentation-des-mods-et-optimisations)
11. [Système d'Installation et d'Optimisation](#11-système-dinstallation-et-doptimisation)
12. [Crédits et Licence](#12-crédits-et-licence)

---

## 1. Introduction

Le **Communokot Launcher** (v1.3.9) est une application de bureau conçue pour faciliter l'accès au serveur Minecraft "Communokot" (Minecraft Version 1.21.11). L'accent est mis sur la performance, l'esthétique et la simplicité, avec un design "Liquid Glass" sombre profond (`#050505`).

---

## 2. Fonctionnalités

-   🚀 **Lancement Direct** : Connexion automatique au serveur avec configuration optimisée.
-   🛠️ **Auto-Fabric & Mods** : Installation transparente de Fabric Loader 0.18.4 et des mods d'optimisation (Sodium, Lithium, etc.) via Modrinth API.
-   📊 **Barre de Progression** : Feedback visuel détaillé pendant l'initialisation du jeu.
-   🗺️ **Carte Satellite** : Intégration de *BlueMap* via une balise `<webview>` isolée, avec injection CSS pour une immersion totale (menus masqués) et zoom dynamique. <!-- v1.3.8 -->
-   📰 **Système de News** : Affichage dynamique de cartes d'actualités gérées via un outil CLI dédié.
-   ⚙️ **Gestion des Paramètres** : Allocation RAM, sélecteur de dossier Minecraft, et persistence des préférences.
-   🔄 **Auto-Update Launcher** : Système robuste incluant une **Capsule de Diagnostic** (logs en temps réel) et un flux de mise à jour hybride (v1.3.8+).
-   🛡️ **Installation macOS (Workaround Signature)** : Utilisation d'un flux de téléchargement manuel de `.pkg` sur macOS pour contourner l'absence de signature de code. Le paquet inclut un script `postinstall` (`xattr -cr`) pour retirer automatiquement les attributs de quarantaine et éviter l'erreur "Application endommagée". Sur Windows, le script NSIS gère le déblocage SmartScreen.
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

-   **Webview Isolation** : La carte BlueMap est isolée dans son propre processus de rendu via `<webview>`, garantissant que la navigation fluide du launcher n'est pas impactée par la charge 3D.
-   **Immersive Scale** : Utilisation de `transform: scale(1.25)` pour zoomer dans la carte et rogner les menus superflus nativement.
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
10. Documentation des Mods et Optimisations

Le launcher installe et gère une suite de 9 mods d'optimisation pour garantir la meilleure expérience possible :
- **Fabric API** : Base technique nécessaire.
- **Sodium** : Optimisation majeure du moteur de rendu.
- **ImmediatelyFast** : Accélération du rendu des interfaces et du texte.
- **FerriteCore** : Réduction de la consommation de RAM.
- **Entity Culling** : Suppression du rendu des entités non visibles.
- **Lithium** : Optimisation de la logique de jeu (physique, IA, ticking).
- **LazyDFU** : Démarrage accéléré (si version compatible disponible).
- **ModernFix** : Corrections de bugs et performances globales.
- **Sodium Leaf Culling** : Optimisation du rendu des feuilles.

Le système de **Presets de Performance** permet d'adapter ces mods selon trois niveaux (Bas de gamme, Équilibré, Haut de gamme) avec une détection automatique du matériel et des correctifs spécifiques pour les CPUs Intel récents et les puces Apple Silicon.

Pour plus de détails, consultez la [documentation dédiée aux mods](./MODS_DOCUMENTATION.md).

---

## 11. Système d'Installation et d'Optimisation Robuste (v1.1.1)

J'ai ajouté une couche d'automatisation et de sécurité critique pour garantir une expérience de jeu fluide et sans crash :

### 🛡️ Moteur de Robustesse
- **Détection Hardware** : Analyse en temps réel des spécifications du PC pour attribuer un score de performance.
- **Backups Automatiques** : Chaque modification de configuration est précédée d'une sauvegarde versionnée avec manifest.
- **Protection Anti-Corruption** : Les fichiers sont écrits de manière atomique et vérifiés par une lecture de contrôle immediat (round-trip validation).
- **Mode Safe Boot** : Possibilité de restaurer une configuration minimale stable en un clic.

### 📦 Optimisation Dynamique
- **Presets Intelligents** (Low, Balanced, High) configurés par des experts.
- **Correctifs d'Incompatibilités** : Workarounds automatiques pour les CPUs récents, les drivers instables et les spécificités macOS ARM.

### 🧪 Qualité Logicielle
- **Tests Unitaires (Vitest)** : Couverture complète du moteur de configuration avec 50+ tests automatisés.
- **Audit Log** : Journal persistant de toutes les actions système pour faciliter le support technique.

---

## 12. Crédits et Licence

**Auteur** : Théophile (Communokot)
**Licence** : MIT

---
*Dernière mise à jour : 15 Février 2026 (v1.3.9)*
