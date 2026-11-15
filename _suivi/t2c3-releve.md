# Relevé — T2-C3 « Le principe d'inertie »

> **V1 intégrale produite le 13/11/2026** selon `_modeles/CONSIGNES-V1-integrale-PC.md`
> et les décisions du 13/11 (page seule, schémas en SVG dès la V1, vecteurs `.vec`).
> Source : `Thème 2 - Chapitre 3 [correction] - Le principe d'inertie.pptx` (+ PDF,
> 6 diapos + couverture) → `pages/2nde-pc-t2-c3-principe-d-inertie.html`.
>
> **Page et PDF côte à côte donnent le même cours.** Les 11 blocs 🚧 de l'ébauche sont
> remplacés ; il ne reste que celui du lien de DS.
>
> **Ce qui a été produit** : 6 images numérotées + la vidéo 1 ; **10 SVG inline** à la
> charte (`<title>`, `<desc>`, `aria-labelledby`) ; 10 fichiers d'images dans
> `assets/img/pc/2nde-pc-t2-c3/` (≈ 520 Ko, dont 236 Ko pour l'animation) +
> `CREDITS.md` ; 2 corrections tracées par `<!-- SOURCE → CORRIGÉ … -->`.
> Toutes les flèches combinantes U+20D7 de l'ébauche sont devenues des
> `<span class="vec">` (42 dans le texte ; les noms de vecteurs des SVG portent une
> flèche tracée). Code de déblocage **inchangé : IN3RTE** (empreinte conservée).

---

## 1. Erreurs de physique corrigées

| # | Diapo | Ce que disait la source | Ce que dit la page | Pourquoi |
|---|---|---|---|---|
| **E1** | 3 (exercice 2) | « Les forces de frottement sont toujours colinéaires **au sens** du déplacement du système. » | « … colinéaires au déplacement du système, **et de sens opposé**. » | La formulation se lit « dans le sens du déplacement » ; un frottement s'oppose au mouvement, et la correction de la source le trace d'ailleurs vers le haut de la pente. |
| **E2** | 3 (exercice 2, correction) | Schéma « à l'échelle » (100 N par trait) : pente ≈ 29° ; dans la construction de la question 2, le poids ne mesure que **≈ 5,9 unités au lieu de 7** (≈ 590 N au lieu de 700 N). C'est ce raccourci qui fait tomber la résultante (≈ 100 N) le long de la pente. | Les deux schémas sont **refaits à l'échelle exacte** (100 N ↔ 30 unités) sur une **pente de 44°** ; la résultante est parallèle à la pente, dirigée vers le bas, et vaut **≈ 340 N** (3,4 unités). Une légende sous la figure dit pourquoi 44°. | Avec P = 700 N, R = 500 N et 29°, la résultante aurait une composante perpendiculaire qui enfonce le skieur dans la neige : il faudrait R = P cos α ≈ 610 N. 44° est la seule pente compatible avec les données (cos α = 500 ÷ 700). **À trancher par toi** : soit garder 44° (page actuelle), soit garder la pente du dessin (≈ 29°) et passer R à **610 N** dans l'énoncé. |

## 2. Incohérences de calcul

| # | Diapo | Problème | Ce que dit la page |
|---|---|---|---|
| **C1** | 3 | Exercice 2 : voir E2 — la construction de la source ne respectait pas sa propre échelle pour P. | Construction exacte, résultante ≈ 340 N (vérifiée : P sin α − (f<sub>S</sub> + f<sub>A</sub>) = 700 × 0,700 − 150 ≈ 340 N ; composante perpendiculaire R − P cos α = 0). La valeur 340 N **n'est pas écrite** sur la page (la source ne donne pas de valeur) : proposition P4. |
| **C2** | 4 | Image 4 : les vecteurs R et P sur le chat n'avaient pas tout à fait la même longueur (42,7 contre 44,8 unités) alors qu'ils se compensent. | Même longueur (88 unités). |
| **C3** | 5 | Exercice 5, système de gauche : les trois forces dessinées ne se referment pas exactement (écart ≈ 2 unités sur des vecteurs de 45 à 93). | Le troisième vecteur est allongé de 1,7 unité pour que le triangle se ferme exactement, comme le dit la correction (∑F = 0). Les deux autres systèmes reprennent les vecteurs de la source au dixième près ; leurs résultantes sont celles de la source. |

Corrigés vérifiés : exercice 1 (sommes recalculées depuis les vecteurs de l'énoncé :
la construction de la page est exacte), exercice 3, exercice 4 (premier système :
R et P de même longueur, la résultante est F ; second : F + P + T se referme),
exercice 5 (système 1 : ∑F = 0 ; systèmes 2 et 3 : ∑F ≠ 0, dirigées comme dans la source).

**Coquille de la source, sans effet sur le sens** : « que **le** masse du système » (diapo 2) → « la masse ».

## 3. Contenus récupérés qui n'étaient nulle part ailleurs

| # | Diapo | Ce qui manquait | Où c'est maintenant |
|---|---|---|---|
| **M1** | 2 | Le texte « Attention ! Le repos n'existe que dans un système de référence… » était **reformulé** dans l'ébauche (« Remarque — le repos est relatif »). | Rétabli mot pour mot, en encart à côté de l'image 1. |
| **M2** | 6 | « … sa vitesse va augmenter **indéfiniment** au cours de sa chute » : le mot avait disparu de l'ébauche, ainsi que « car » (remplacé par un deux-points). | Rétabli mot pour mot. |
| **M3** | 3 | L'énoncé et la correction des exercices 1 et 2 **n'existaient qu'en formes PowerPoint** (connecteurs fléchés). | Géométrie relevée dans le PPTX (coordonnées, flips, rotations) et retracée en SVG : énoncés à l'identique, corrections reconstruites à partir des vecteurs de l'énoncé. |
| **M4** | 4 | Énoncé de l'exercice 4 (premier système : G avec R, F, P) et corrections des exercices 3 et 4. | SVG ; le second système (potence, boule, aimant) est l'image source. |
| **M5** | 5 | Les trois systèmes de l'exercice 5, leurs corrections et la **chronophotographie** (image de 8 croix). | SVG ; chronophotographie retracée depuis les points relevés : **8 positions alignées, pas constant de 76,9 px** sur l'image source (écarts mesurés 74 à 77 px) — mouvement rectiligne uniforme. |
| **M6** | 6 | La vidéo 1 de la diapo est une **animation GIF intégrée** (boule et plume dans le vide, BBC Two), pas un lien. L'ébauche avait collé son libellé sur le QR voisin. | Animation posée dans la page (WebP animé, image fixe si « réduire les animations »), avec sa légende. |
| **M7** | 6 | **Mapping des trois QR de la diapo 6 refait** depuis le PPTX : le QR près de la vidéo 1 (libellé « Réviser en vidéo ») → `PN1tudmLgcw`, *Chute libre et contraposée du principe d'inertie* (Paul Olivier) ; les deux QR du cadre « Réviser l'ensemble du cours en vidéo » → `_iFxa_DHowA` (Les génies des sciences) et `kYSIrurSFv8` (nicolas galiot). | Pastilles corrigées : « Réviser en vidéo » (et non plus « Chute libre dans le vide (plume et balle) »), « Réviser l'ensemble du cours en vidéo » ×2. |
| **M8** | 7 | DS : la source pointe vers un PDF de l'établissement (QR « DS – 2023 \| 2024 »). | Laissé en 🚧, comme le veut la règle. |

Les autres liens (diapos 2, 4, 5, Kahoot) étaient justes dans l'ébauche ; vérifiés par `click_action` des formes.

## 4. Licences à confirmer

Toutes les figures portent `data-origine="source PPTX — licence non identifiée"`. Détail
fichier par fichier : `assets/img/pc/2nde-pc-t2-c3/CREDITS.md`.

| Fichier | Nature |
|---|---|
| `t2c3-bobsleigh-depart.jpg` | photo (presse sportive probable, anneaux olympiques visibles) |
| `t2c3-camion-pousse.jpg` | photo |
| `t2c3-systeme-solaire.jpg` | vue d'artiste |
| `t2c3-chat-coussins-source.png` | illustration (images 1 et 4) |
| `t2c3-fusee-forces-source.png` | illustration avec vecteurs incrustés |
| `t2c3-skieur-source.jpg` | illustration vectorielle |
| `t2c3-pendule-aimant-source.png` | dessin avec vecteurs incrustés |
| `t2c3-chronophoto-chute-libre-source.png` | dessin |
| `t2c3-plume-balle-vide.webp` / `.jpg` | **extrait BBC Two** (logo à l'écran) — vraisemblablement l'émission *Human Universe* (B. Cox, chambre à vide de la NASA), à confirmer ; c'est la plus exposée des images du chapitre |
| `t2c3-decollage-navette.jpg` | préexistante, vignette de la page de niveau, origine non documentée |

## 5. Remarques pédagogiques

- **Exercice 3 : la réponse est à côté de la question.** L'image 4 (vecteurs R et P sur le chat, et sa légende « ∑F = R + P = 0 … le chat est donc au repos ») figure aussi dans la version élève de la diapo, à côté de l'énoncé. L'exercice ne demande donc rien que la légende ne dise. Pistes : retirer l'équation de la légende, ou déplacer l'image 4 après l'exercice.
- **Exercice 2 : l'angle de la pente n'est pas donné**, alors que la construction en dépend (voir E2). L'élève ne peut que le lire sur le dessin.
- **Exercice 5 : la correction justifie par « la contraposée » un raisonnement qui est celui de la réciproque** (mouvement rectiligne uniforme ⇒ forces compensées, partie II-B). La contraposée sert à éliminer les deux autres systèmes (∑F ≠ 0 ⇒ ni repos ni mouvement rectiligne uniforme). Non corrigé : c'est un choix de formulation, l'exercice étant placé en III.
- **Référentiel** : le principe d'inertie est énoncé sans mention du référentiel (galiléen / terrestre), alors que la définition du repos insiste sur la relativité du mouvement.
- **« Image 1 » / « Image 4 »** : le même dessin du chat sert deux fois ; c'est volontaire dans la source, signalé seulement.
- **Vidéos** : les pastilles restent des liens YouTube, comme dans les autres chapitres de PC ; la règle des MP4 sur le OneDrive (`data-video`) n'est appliquée à aucun chapitre de PC pour l'instant. Les six vidéos sont déjà listées dans `_suivi/videos-a-telecharger.md` ; la ligne de `PN1tudmLgcw` y porte encore l'ancien libellé « 🎬 Chute libre dans le vide (plume et balle) », à corriger (hors de mon périmètre).

## 6. Propositions de Claude à valider

| # | Où | Proposition |
|---|---|---|
| **P1** | début de 01 (avant la résultante), 02, 03, 04 | Quatre lignes `.aparte` de transition, absentes de la source : « Un système subit souvent plusieurs forces à la fois… », « Une fois les forces additionnées, que dit leur résultante du mouvement du système ? », « Et si le système n'est ni au repos, ni en mouvement rectiligne uniforme ? », « Un cas particulier où une seule force agit, sans rien pour la compenser. » |
| **P2** | exercice 1, correction | La phrase « On place les vecteurs bout à bout (l'origine de chacun à l'extrémité du précédent) ; la résultante relie l'origine du premier vecteur à l'extrémité du dernier. » vient de l'ébauche, **pas de la source** (qui ne donne que les constructions). Gardée. |
| **P3** | exercice 2, correction | Deux étapes « Question 1 — le schéma » / « Question 2 — la résultante », la phrase « Le skieur est réduit à un point. Les quatre forces sont représentées à l'échelle choisie : 100 N pour une unité. » et la légende sur la pente de 44°. |
| **P4** | exercice 2, correction | Écrire la valeur de la résultante, **≈ 340 N** (mesurée sur le schéma : 3,4 unités), pour que l'élève puisse vérifier sa construction. |
| **P5** | Vidéo 1 | Mention « Extrait BBC Two. » ajoutée en fin de légende (crédit). |
| **P6** | checklist | Item 1 renvoie à 01 et 02 (la source le rattache à la diapo 1, qui couvre les définitions). |

## 7. Technique

- CSS propre à la page (dans son `<style>`, rien dans `chapitre-commun.css`) : `.t2c3-paire`, `.t2c3-duo`, `.t2c3-deux`, styles de texte des SVG (`.t2c3-v`, `.t2c3-sig`, `.t2c3-op`, `.t2c3-m`, `.t2c3-g`), `figure svg.fig-t2c3`, `.fig-moyenne`, `.fig-large`, `h3.sous-partie` (remplace les `style=""` en ligne de l'ébauche), `.fig-video`, repli de `.duo-x` sous 600 px.
- La page n'est toujours **pas** liée à une fiche (pas de fiche T2-C3 à ce jour) ; la porte mentionne « en bas de ta fiche de cours », texte inchangé.
- Contrôles du 13/11 : Playwright sans erreur JS ; verrou (arrivée verrouillée → mauvais code refusé → `in3rte` débloque → tient au rechargement → `?verrou=1` reverrouille) ; 9 `<img>` chargées une à une + l'image du SVG de l'image 4 ; aucun élément SVG hors cadre ; aucun débordement à 390 px (iframe) ; `node --check` sur les 2 scripts ; aucune U+20D7 ; aucune barre de fraction ; `node verifier.mjs` : **19 problèmes**, le repère.
- Sources de la génération (hors dépôt) : `figures.py` (géométrie des SVG), `gabarit.html`, `construire.py` dans le bloc-notes de la session.
