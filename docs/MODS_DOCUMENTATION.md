# Documentation des Mods et Optimisations

Ce document détaille les mods Minecraft installés par le **Communokot Launcher** ainsi que le fonctionnement du système de presets de performance dynamique.

---

## 📦 Liste des Mods Installés (Côté Client)

Pour garantir une expérience fluide même sur des configurations modestes, le launcher installe automatiquement une sélection de mods d'optimisation (version 1.21.11, sur Fabric 0.18.4) :

1. **Fabric API** : La bibliothèque de base indispensable pour faire fonctionner les autres mods sur l'écosystème Fabric.
2. **Sodium** : Le mod de performance de référence. Il remplace le moteur de rendu de Minecraft pour augmenter massivement le nombre d'images par seconde (FPS) et réduire les micro-saccades.
3. **ImmediatelyFast** : Optimise le rendu dit "immédiat". Cela améliore les performances des interfaces (menus), des noms au-dessus des joueurs et de tout le texte en jeu.
4. **FerriteCore** : Un mod spécialisé dans la réduction de la consommation de mémoire RAM par le jeu, permettant de libérer des ressources pour le reste du système.
5. **Entity Culling** : Utilise du "raytracing" asynchrone pour arrêter de calculer et de rendre les entités (joueurs, animaux, coffres) qui ne sont pas directement dans votre champ de vision.
6. **Lithium** : Optimise la logique interne du jeu (physique, IA des mobs, ticking des blocs) sans modifier le comportement vanilla. Fonctionne côté client et serveur.
7. **LazyDFU** : Diffère l'initialisation de DataFixerUpper au lancement pour accélérer le démarrage du jeu. *Note : obsolète depuis Minecraft 1.19.4, installé uniquement si une version compatible est disponible.*
8. **ModernFix** : Mod "couteau suisse" qui améliore les performances, réduit la consommation mémoire et corrige de nombreux bugs. Compatible avec tous les autres mods de performance.
9. **Sodium Leaf Culling** : Add-on pour Sodium qui optimise le rendu des feuilles en utilisant différents modes de culling (Solid Aggressive, Solid, Hollow) selon le préréglage de performance.
10. **Sound Physics Remastered** : Améliore l'immersion sonore en simulant la réverbération, l'absorption et l'atténuation réaliste des sons à travers les blocs.
11. **Simple Voice Chat** : Ajoute un chat vocal de proximité in-game, permettant de discuter avec les autres joueurs à proximité, avec des fonctionnalités comme le push-to-talk et l'ajustement du volume.
12. **Mod Menu** : Ajoute un écran de configuration pour voir la liste des mods installés et accéder à leurs paramètres directement depuis le menu du jeu.

---

## ⚙️ Presets de Performance

Le launcher propose trois niveaux de réglages automatiques, appliqués soit manuellement, soit via la détection automatique du matériel.

### 1. Bas de Gamme (Low-End)
*Destiné aux ordinateurs anciens ou avec puce graphique intégrée.*
- **Graphismes** : Rapides (Fast)
- **Nuages** : Désactivés
- **Feuilles & Météo** : Rapides
- **Distance de rendu** : 8 tronçons (chunks)
- **Limite FPS** : 60 FPS
- **Particules** : Minimales
- **Lumière Douce** : Désactivée (OFF)
- **Optimisation** : Culling d'entités agressif, textures animées uniquement si visibles.
- **Sodium Leaf Culling** : Mode `Solid Aggressive` — rendu solide des feuilles internes pour maximiser les FPS.
- **ModernFix** : Mode "Low Memory" activé + toutes optimisations.
- **ImmediatelyFast** : Optimisations expérimentales activées pour gain CPU max.

### 2. Équilibré (Balanced)
*Le réglage standard pour la plupart des ordinateurs portables modernes.*
- **Graphismes** : Rapides (Fast) — *Priorité à la fluidité*
- **Nuages** : Rapides
- **Feuilles & Météo** : Détaillés (Fancy)
- **Distance de rendu** : 12 tronçons (chunks)
- **Limite FPS** : 120 FPS
- **Particules** : Réduites (Decreased)
- **Lumière Douce** : Désactivée (OFF)
- **Sodium Leaf Culling** : Mode `Solid Aggressive` — performance maximale avec bon rendu visuel.
- **ModernFix** : Toutes les optimisations standards activées.
- **Lithium** : Toutes les optimisations de logique de jeu activées.

### 3. Haut de Gamme (High-End)
*Pour les PC de jeu avec carte graphique dédiée.*
- **Graphismes** : Détaillés (Fancy)
- **Nuages** : Détaillés
- **Distance de rendu** : 16 tronçons (chunks)
- **Limite FPS** : 240 FPS
- **Particules** : Toutes (All)
- **Qualité** : Fog et Vignette activés, distances d'entités maximales.
- **Sodium Leaf Culling** : Mode `Solid` — compromis idéal entre perf et esthétique (évite le "Hollow" trop coûteux).
- **ModernFix** : Toutes les optimisations standards activées.
- **Lithium** : Toutes les optimisations de logique de jeu activées.

---

## 🛡️ Système de Robustesse et Incompatibilités

Le launcher ne se contente pas d'appliquer des presets fixes. Il vérifie en temps réel les spécificités de votre matériel pour appliquer des correctifs ("patchs") de sécurité :

- **CPUs Intel 13/14ème Génération** : Limitation du rendu prédictif et bridage FPS pour éviter les crashs liés à l'instabilité connue de ces processeurs.
- **Apple Silicon (M1/M2/M3)** : Désactivation de certaines méthodes de mise en mémoire tampon OpenGL incompatibles avec la couche de traduction Metal d'Apple.
- **GPUs AMD** : Désactivation du culling de particules pour éviter des bugs visuels spécifiques aux pilotes AMD.
- **Mémoire Vive Faible** : Si le système a moins de 4 Go de RAM, la distance de rendu est automatiquement bridée pour éviter un crash par manque de mémoire.

---

## 🔄 Gestion des Modifications Utilisateur

Si vous modifiez manuellement un fichier de configuration dans le dossier `.minecraft/config`, le launcher le détectera via un système de "hashes" (empreintes numériques). 

Par défaut, le launcher **préserve vos modifications** lors de l'application d'un preset, sauf si vous forcez l'écrasement dans les paramètres.
