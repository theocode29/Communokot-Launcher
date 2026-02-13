# Guide d’optimisation du client Minecraft avec Fabric/Sodium (modes Low, Balanced, High)

Ce guide propose des réglages précis pour optimiser Minecraft (Fabric) en fonction de trois profils (« low-end », « balanced », « high-end »). Il couvre la configuration de plusieurs mods d’optimisation (Fabric API, Sodium, ImmediatelyFast, FerriteCore, Entity Culling, Lithium, LazyDFU, ModernFix, Sodium Leaf Culling) ainsi que quelques paramètres graphiques de base du jeu. Chaque section décrit le rôle du mod (avec une citation de sa documentation) et donne des extraits de configuration recommandés pour chaque profil (Low, Balanced, High). 

## Fabric API

Fabric API est **la bibliothèque de base** indispensable à tout mod Fabric【89†L177-L185】. Elle n’a pas de réglage de performance à modifier : assurez-vous simplement d’installer la dernière version compatible de Fabric Loader et de Fabric API pour votre version de Minecraft.  

## Sodium

Sodium remplace complètement le moteur de rendu de Minecraft pour **améliorer drastiquement les FPS et éliminer les micro-saccades**, tout en préservant l’aspect graphique vanilla【73†L93-L100】. Par défaut, Sodium active automatiquement toutes ses optimisations compatibles avec votre matériel. En pratique, les options principales se règlent dans les “Video Settings” de Minecraft (le nouveau menu fourni par Sodium) et dans le fichier `sodium-options.json` (ou via `GameSettings` sous Fabric). Voici les points clés à vérifier :

- **Distance de rendu (Render Distance)** : en mode Low, il est recommandé de réduire la distance de rendu à 6–8 chunks. En Balanced, ~12–14, et en High 16 ou plus.  
- **Use Entity Culling** : activez (« ON ») cette option pour que Sodium fasse un premier tri basique des entités hors-champ (bien que le mod **Entity Culling** gère déjà de manière plus agressive ce cas, laisser activé ne pose pas de conflit【36†L224-L232】).  
- **Smooth Lighting** : en Low, mettez sur « OFF » ou « Minimum »; en Balanced/High, « OFF » pour gagner quelques FPS, sauf si vous tenez à la qualité visuelle.  
- **Autres options** (Fast Render, Clouds OFF, Particules réduites, vSync désactivé, etc.) : ajustez-les également pour privilégier les performances en Low/Balanced et la qualité visuelle en High.  

Dans la plupart des cas, **aucun fichier de config manuel de Sodium ne doit être modifié** – les réglages vidéo ci-dessus, couplés à Sodium + Lithium + les autres mods listés, suffisent. Par exemple, pour le profil Low on utilisera des paramètres graphiques bas, tandis qu’en High on pourra autoriser une qualité plus élevée.  

> **Sources :** Sodium est un mod d’optimisation graphique très efficace【73†L93-L100】. Il est conçu pour être largement compatible et activer ses optimisations « par défaut » donne déjà le meilleur compromis performance/qualité【73†L116-L124】【73†L93-L100】. 

## ImmediatelyFast

ImmediatelyFast améliore les performances du **rendu en mode immédiat** (interfaces graphiques, textes, HUD, etc.) en batchant mieux les appels GPU【92†L82-L84】. Ce mod apporte en pratique une accélération très visible des menus, des éléments HUD et des textes (par exemple les noms au-dessus des joueurs). 

ImmFast offre un fichier de configuration (`config/immediatelyfast.toml` ou similaire) qui permet d’activer/désactiver certaines optimisations. Par défaut, **la plupart des options sont activées** ; on recommande de garder les valeurs par défaut pour la plupart, mais on peut ajuster selon le profil :

```toml
# Exemple de config pour ImmediatelyFast (config/immediatelyfast.toml)

# Réglages généraux (toujours activés pour améliorer le rendu immédiat)
font_atlas_resizing = true           # optimise le rendu des polices
map_atlas_generation = true         # optimise le rendu des cartes en main
hud_batching = true                 # optimise le rendu du HUD et GUI
fast_text_lookup = true            # accélère la recherche de glyphes pour le texte
avoid_redundant_framebuffer_switching = true  # évite certains changements de framebuffer inutiles

# Options expérimentales (peuvent être activées en mode Low pour plus de perf)
# (laisser sur false en High pour compatibilité maximale)
experimental_disable_error_checking = ${EXPERIMENTAL1}
experimental_disable_resource_pack_conflict_handling = false
experimental_sign_text_buffering = false
experimental_screen_batching = ${EXPERIMENTAL2}
```

- **Profil High-end** : on garde généralement les valeurs par défaut (celles suggérées ci-dessus), et on laisse toutes les options expérimentales (`experimental_…`) sur **false** pour une stabilité maximale.  
- **Profil Balanced** : activer `font_atlas_resizing`, `hud_batching`, etc. en **true** (pour les gains de performance), garder `experimental_*` sur false, sauf si on tolère un risque mineur.  
- **Profil Low-end** : en plus des réglages de Balanced, on peut activer certaines options expérimentales pour gratter encore quelques FPS ; par exemple `experimental_disable_error_checking = true` et `experimental_screen_batching = true`. Cela peut exposer des bugs mineurs mais améliore les performances CPU des interfaces.  

> **Source :** ImmediatelyFast est conçu pour booster le rendu en mode immédiat et fonctionne "out-of-the-box", les options config servent surtout à régler des cas particuliers【92†L82-L84】【92†L198-L204】.  

## FerriteCore

FerriteCore réduit fortement la **consommation de mémoire RAM** de Minecraft【94†L180-L185】. Ce mod s’intègre sans risque avec les autres optimisations (notamment Lithium) et n’a **pas de config utilisateur** à modifier. Il suffit de l’installer : il optimise automatiquement le fonctionnement interne pour libérer de la mémoire (ex. dans certains packs, la RAM utilisée peut passer de 3,1 Go à ~1,1 Go sur l’écran titre【94†L180-L185】). 

> **Source :** « This mod reduces the memory usage of Minecraft in a few different ways. »【94†L180-L185】  

## Entity Culling

Entity Culling utilise un **path-tracing asynchrone** pour ne PAS calculer ni rendre les entités (mobs, animaux, items, etc.) et les tuiles d’entités qui sont *complètement hors du champ de vision*【25†L102-L110】. Autrement dit, tout ce qui est masqué par des blocs (murs, sol, etc.) ne sera pas rendu ni mis à jour, ce qui libère énormément de ressources. 

Entity Culling est client-side only et n’altère en rien le comportement du serveur ou de la simulation du jeu【36†L259-L268】. Son config (accessible dans `config/entityculling-client.toml` ou `.json`) permet notamment de :  
- **Activer/désactiver le rendu culling** (`skipHiddenEntityRendering`) et le tick culling (`skipEntityTicking`) des entités hors-vision.  
- **Whitelist** d’entités ou de tuiles particulières à ne pas culler (par exemple des animations ou mécaniques mod).  

**Réglages recommandés :** Pour maximiser la performance tout en conservant une expérience correcte :  
- Toujours **activer le culling de rendu** (skipHiddenEntityRendering = true) et **de tuiles d’entités** (skipHiddenBlockEntityRendering = true) quel que soit le profil.  
- **Tick culling (skipEntityTicking)** : en mode High-end, vous pouvez éventuellement le laisser *désactivé* si vous souhaitez éviter tout effet secondaire mineur (certaines animations peuvent se figer hors champ). En Balanced et surtout en Low, activez-le (`true`) pour réduire la charge du processeur en stoppant les mises à jour des entités hors-vision.  
- **Listes blanches (whitelist)** : les valeurs par défaut suffisent dans la plupart des cas. Si vous notez des anomalies graphiques (ex. entités « glitchées »), ajoutez ces entités concernées dans `skipHiddenEntityRenderingBlacklist` ou `skipHiddenBlockEntityRenderingBlacklist`.  

Voici un extrait type de config (les clés exactes peuvent varier selon la version) :

```json
// config/entityculling-client.toml (ou .json)
{
  "skipHiddenEntityRendering": true,
  "skipHiddenBlockEntityRendering": true,
  "skipEntityTicking": ${TICK_CULLING},      // false en High, true en Balanced/Low
  "entityTickingWhitelist": [],
  "skipHiddenEntityRenderingBlacklist": [],
  "skipHiddenBlockEntityRenderingBlacklist": []
}
```

- **Profil High-end** : skipHiddenEntityRendering=true, skipEntityTicking=false.  
- **Profil Balanced** : skipHiddenEntityRendering=true, skipEntityTicking=true.  
- **Profil Low-end** : skipHiddenEntityRendering=true, skipEntityTicking=true (culling le plus agressif).  

> **Source :** Entity Culling « skips the rendering of block entities and mobs hidden behind structures » grâce à du multithreading【36†L213-L222】【25†L102-L110】. Ce mod client-side ne change pas le gameplay, seulement le rendu.  

## Lithium

Lithium optimise la **logique interne du jeu** (physique, IA des mobs, tick des blocs, collisions, etc.) sans modifier le comportement vanilla【53†L117-L124】. Il améliore aussi bien les performances serveur que client, en accélérant les « ticks » du monde. 

Par défaut, Lithium active **toutes ses optimisations** (« mixins ») pour maximiser la performance. Son système de config est « semi-peu commun » et consiste à activer/désactiver des patchs individuels dans un fichier JSON (ex. `lithium.mixin.json`). Heureusement, on peut laisser le fichier de config **vide**, ce qui signifie « tout par défaut »【53†L123-L128】. 

- **Recommandation générale** : ne modifiez rien : le config vide (ou inexistant) fournit déjà « le meilleur réglage de performance que le mod peut offrir »【53†L123-L128】.  
- Pour les profils Low/Balanced/High, les réglages de Lithium restent identiques : activez le mod et utilisez la config par défaut.  
- **Option avancée** : si un patch spécifique pose problème (peu probable dans les mods modernes), on peut le désactiver à l’aide du fichier JSON. Mais cela n’est pas nécessaire pour un usage standard.

```json
// config/lithium-client.toml (ou .json)
// Fichier JSON vide signifie « tout actif pour perf optimale »【53†L123-L128】.
{}
```

> **Source :** Lithium utilise un système de config permettant d’activer/désactiver finement ses optimisations, mais « un fichier de configuration vide est tout à fait normal et signifie que vous souhaitez utiliser les options par défaut, qui sont déjà configurées pour fournir les meilleures performances »【53†L117-L124】.  

## LazyDFU

LazyDFU accélère le **démarrage du jeu** en différant l’initialisation du DataFixerUpper (système de conversions de mondes anciens) jusqu’à ce que ce soit nécessaire. **Important :** depuis la version Minecraft 1.19.4, Mojang a grandement optimisé cette étape par défaut, donc **LazyDFU n’est plus utile** sur 1.19.4+【63†L99-L107】. On l’installera uniquement si vous utilisez une version plus ancienne (1.19 à 1.19.3 par ex.). Ce mod n’a pas de config à ajuster : il suffit de l’installer ou non.

> **Source :** À partir de Minecraft 1.19.4, « ce mod n’est plus nécessaire dans de nombreuses configurations » car Mojang a amélioré l’initialisation DFU【63†L99-L107】.  

## ModernFix

ModernFix est un mod « couteau-suisse » qui regroupe de nombreuses optimisations et corrections pour les versions modernes de Minecraft (¹.16+). Il vise à améliorer les performances, réduire l’usage mémoire et corriger divers bugs sans trop impacter l’expérience de jeu【65†L189-L197】. Par exemple, il peut doubler la vitesse de lancement des gros modpacks sur 1.16–1.19【65†L189-L197】.  

ModernFix dispose d’un fichier de config principal `modernfix-mixins.properties` (dans `config/`). Par défaut, la plupart des patchs sont activés, mais vous pouvez ajuster deux catégories principales selon le profil :  
- **dynamic_resources** (optimisation du chargement de modèles) : généralement recommandé (`true`) sur tous les profils pour de meilleures performances, surtout avec shaders ou packs de ressources lourds.  
- **low_mem** (mode très faible mémoire) : à activer (`true`) seulement si vous êtes en mode Low-end (RAM très limitée).  

Exemple de config pour les trois profils (les noms de clés dépendent de la version) :

```properties
# config/modernfix-mixins.properties

# Améliore le rendu des ressources (recommandé partout)
mixin.perf.dynamic_resources = true

# Option « Ultra-Low Memory » (ne pas activer sur High/Balanced sauf besoin extrême)
mixin.opt.low_mem = ${LOW_MEM}
```

- **Profil High-end** : `dynamic_resources = true`, `low_mem = false` (pas de mode faible mémoire).  
- **Profil Balanced** : `dynamic_resources = true`, `low_mem = false`.  
- **Profil Low-end** : `dynamic_resources = true`, `low_mem = true` (optimisations mémoire agressives).  

> **Source :** ModernFix améliore le démarrage, l’usage mémoire et corrige de nombreux bugs, « sans compromettre l’expérience du jeu »【65†L189-L197】. Il permet par exemple à des modpacks volumineux de tourner avec peu de RAM en activant les options de mémoire ultra-faible.  

## Sodium Leaf Culling

Sodium Leaf Culling est un *add-on* pour Sodium qui optimise le rendu des **feuilles** en proposant plusieurs modes de « culling »【87†L75-L80】. Par défaut le mode est **Solid Aggressive** : les parties internes des blocs de feuilles sont rendues solides (opaque rapide) tandis que l’extérieur reste en mode Fancy. Cela donne un gros gain de FPS en forêt dense, sans presque rien changer à l’apparence générale【87†L75-L80】. D’autres modes (« Solid » moins agressif, « Hollow » plus agressif) existent. 

- Pour tous les profils, on recommande **le mode par défaut** (Solid Aggressive) pour maximiser les FPS.  
- Si vous souhaitez minimiser l’impact visuel en Balanced/High, vous pouvez essayer le mode **Solid** (moins de fusion de feuilles).  
- **Profil Low-end** : Solid Aggressive (maximisation des FPS).  
- **Profil Balanced/High** : Solid Aggressive ou Solid, selon votre tolérance visuelle.  

La configuration se trouve dans un fichier (par exemple `config/sodiumleafculling.properties`) sous forme de chaîne de caractères :

```properties
# config/sodiumleafculling.properties
leafCullingMode=SOLID_AGGRESSIVE   # Modes possibles: SOLID_AGGRESSIVE, SOLID, HOLLOW
```

> **Source :** Sodium Leaf Culling « optimise les performances des feuilles » en injectant directement dans le pipeline de rendu de Sodium. Par défaut (« Solid Aggressive »), l’intérieur des blocs de feuilles est rendu opaque pour un gain de performance notable【87†L75-L80】.  

## Paramètres graphiques Minecraft (généraux)

En complément des mods, ajustez les paramètres vidéo de Minecraft selon le profil :

- **Low-end** : Distance de rendu faible (6–8), Graphismes en “Fast” ou “Minimal”, Nuages OFF, Filtres antialiasing désactivés, Luminosité moyenne, Particules réduites, VSync OFF, etc. Tous les réglages visuels au minimum.  
- **Balanced** : Distance 12–14, Graphismes Fast, Particules diminuées, Luminosité au goût, le reste aux valeurs intermédiaires (Smooth Lighting OFF ou Minimum).  
- **High-end** : Distance 16+, Graphismes Fancy (qualité élevée) excepté peut-être Smooth Lighting en OFF pour garder un coup de FPS. Activer Occlusion (F3+pick :γ si disponible), mais prioriser les mods d’optimisation pour les FPS, pas les réglages vidéo.  

Cela assure que même sans mod, le jeu est configuré de manière raisonnable, et les mods ci-dessus viennent amplifier les gains.

## Résumé des réglages

- **Low-end** : Optimisations agressives. Mods configurés pour maximum de FPS (ticking culling activé, Leaf Culling *aggressive*, LowMem de ModernFix ON, ImmediatelyFast expérimental ON). Graphismes du jeu au minimum.  
- **Balanced** : Compromis (beaucoup d’optimisations activées, mais garder une stabilité visuelle). Ticking culling activé, Leaf Culling modéré, ModernFix dynamic ON, LowMem OFF.  
- **High-end** : Priorité à la qualité (optimisations toujours actives mais sans modes « extrêmes »). Par ex. désactiver le tick culling d’Entity Culling et le mode LowMem, éventuellement Leaf Culling **Solid** au lieu de aggressive pour l’esthétique, ImmediatelyFast expérimentaux OFF.  

Chaque profil utilise donc les mêmes mods, mais avec des configs légèrement adaptées pour équilibrer performance et confort de jeu. En appliquant ces réglages (en éditant les fichiers de config listés ci-dessus ou via les menus intégrés), vous optimiserez efficacement les performances du client Minecraft selon vos besoins.  

**Sources :** Documentation officielle et pages GitHub/Modrinth de chaque mod【89†L177-L185】【73†L93-L100】【92†L82-L84】【92†L198-L204】【94†L180-L185】【25†L102-L110】【53†L117-L124】【63†L99-L107】【65†L189-L197】【87†L75-L80】. Ces références confirment la fonction de chaque mod et justifient les réglages recommandés.