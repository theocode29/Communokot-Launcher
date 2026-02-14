# Communokot Launcher v1.3.5 - Guide Utilisateur

## Système d'Optimisation Avancé

Le launcher Communokot intègre un système de gestion de configuration robuste conçu pour maximiser les performances de Minecraft tout en garantissant la sécurité de vos données.

### Fonctionnalités Clés

1.  **Application de Presets Intelligente**
    *   Détection automatique de votre matériel (RAM, CPU, GPU).
    *   Application de presets optimisés : `Low-End`, `Balanced`, ou `High-End`.
    *   Supporte Sodium, Lithium, FerriteCore, EntityCulling, ImmediatelyFast, LazyDFU, ModernFix, Sodium Leaf Culling et Mod Menu.

2.  **Sécurité et Fiabilité**
    *   **Zéro Corruption** : Vérification stricte des fichiers avant écriture.
    *   **Backups Automatiques** : Une sauvegarde est créée avant chaque changement majeur.
    *   **Mode "Safe Boot"** : En cas de problème critique, le launcher peut restaurer une configuration minimale stable.

3.  **Respect de vos Modifications**
    *   Si vous modifiez manuellement une option (ex: distance de vue), le launcher le détecte et **ne l'écrase pas** lors des mises à jour de presets.
    *   Option "Gérer mes propres configurations" disponible dans les paramètres pour désactiver totalement l'automatisation.

### Utilisation

#### 1. Choix du Preset
Allez dans l'onglet **Paramètres** :
*   **Auto (Recommandé)** : Le launcher choisit le meilleur preset pour votre PC.
*   **Low-End** : Pour les PC anciens ou bureautiques. Max FPS, graphismes réduits.
*   **Balanced** : Le meilleur compromis qualité/perf.
*   **High-End** : Pour les PC gamers. Graphismes max, distance de vue élevée.

#### 2. Gestion des Backups
Le launcher conserve les 10 dernières sauvegardes de vos configurations dans `.launcher-backups/`.
En cas de pépin, vous pouvez restaurer manuellement ces fichiers (une interface de restauration sera ajoutée prochainement).

#### 3. Simulation (Dry Run)
Lors du développement ou via la console, le système peut simuler l'application d'un preset pour voir exactement quels fichiers seraient modifiés, sans rien toucher.

### Dépannage

*   **Erreur lors de la mise à jour ?**
    Le launcher affiche désormais une **Capsule Diagnostic** : cliquez sur "Voir logs" pour comprendre pourquoi la mise à jour bloque (ex: droits d'accès, réseau).
*   **Conflits avec d'autres mods ?**
    Le système détecte automatiquement les incompatibilités connues (ex: Intel 13/14th gen, Mac M1/M2) et installe automatiquement Fabric Loader **0.18.4** pour assurer la compatibilité logicielle.

---
*Développé pour Communokot - Février 2026*
