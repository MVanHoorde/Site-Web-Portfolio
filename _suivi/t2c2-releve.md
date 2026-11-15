# Relevé — T2-C2 « Modéliser une action sur un système » (V1 intégrale, 13/11/2026)

Page : `pages/2nde-pc-t2-c2-modeliser-une-action.html` · images : `assets/img/pc/2nde-pc-t2-c2/`
(+ `CREDITS.md`, nouveau) · source de référence : `Thème 2 - Chapitre 2 [correction] - Modéliser une
action sur un système.pptx` et son PDF (14 diapositives). Les numéros de diapo sont ceux du PPTX
(diapo 1 = couverture ; la pastille imprimée sur la diapo vaut N − 1). Code de déblocage inchangé
(empreinte conservée), slug `2nde-t2c2`, `data-suivi="pc-t2-c2"`.

Bilan : **1 seul `.a-faire`** (le lien du DS), les 15 images numérotées de la source posées avec
leur légende **intégrale**, **19 SVG inline** (`<title>` + `<desc>` + `aria-labelledby`), 13 images
extraites (6 photos, 7 cliparts `-source`), 2 tableaux-images retranscrits en `table.tab`,
**36 vecteurs en `.vec`** dans le texte (+ ceux des SVG, flèche dessinée), plus aucune flèche
combinante U+20D7. Les deux anciens fichiers `t2c2-reaction-support-source.jpg` et
`t2c2-ex10-correction.svg` sont retirés : l'image 14 et la correction de l'exercice 10 sont
désormais des SVG inline.

## 1. Erreurs de physique corrigées

`grep -n "SOURCE → CORRIGÉ" pages/2nde-pc-t2-c2-modeliser-une-action.html` → **9 commentaires**,
ci-dessous dans l'ordre de la page.

1. **Image 7 (diapo 5) — une norme notée avec une flèche.** La source écrivait
   « F→ Terre/Pomme = 5 N » (flèche sur la norme). Une norme est un nombre : la page écrit
   F<sub>Terre/Pomme</sub> = 5 N sans flèche ; le vecteur garde la sienne le long du tracé.
2. **Image 8 (diapo 6), schéma — point d'application du poids.** Les deux flèches partaient du point
   de contact. Le poids, action à distance, part maintenant du centre de gravité G du ballon (règle
   posée diapo 4) ; la réaction garde le point de contact.
3. **Image 8 (diapo 6), légende — mauvaise loi invoquée.** « Dans ce cas, en vertu de la troisième loi
   de Newton, on peut écrire F<sub>sol/ballon</sub> = −F<sub>Terre/ballon</sub> ». Ces deux forces
   s'exercent sur le **même** système : ce n'est pas une paire action-réaction (celle-ci est
   F<sub>sol/ballon</sub> / F<sub>ballon/sol</sub>). Leur égalité vient de l'immobilité du ballon.
   La page dit « le ballon étant immobile, ces deux forces se compensent » et ajoute un aparté qui
   nomme la vraie paire. **À valider** : c'est la correction la plus lourde du chapitre, et elle
   anticipe le principe d'inertie du chapitre 3.
4. **Tableau des astres (diapo 8, exercice 6) — masse de Jupiter.** « 1.8000E27 » kg →
   **1,90 × 10<sup>27</sup> kg** (référence 1,898 × 10<sup>27</sup> ; écart de 5 %). Sans effet sur
   les calculs du chapitre.
5. **Exercice 6 (diapo 8) — unité du résultat.** « ≈ 1,98 × 10<sup>20</sup> kg » → **N** ; la valeur
   est exacte (1,981 × 10<sup>20</sup>). Correction déjà signalée dans l'ébauche, conservée.
6. **Image 13 (diapo 10), encart de l'infographie — G.** « G = 6.657 × 10<sup>−11</sup> » →
   **6,67 × 10<sup>−11</sup> N·m<sup>2</sup>·kg<sup>−2</sup>**, la valeur du cours.
7. **Exercice 8 (diapo 10) — g de Paris et de l'équateur inversés.** La correction prenait
   g<sub>Paris</sub> = 9,73 et g<sub>équateur</sub> = 9,81, à l'inverse de la légende de l'image 13
   (et de la physique). Remis dans l'ordre : P<sub>Paris</sub> ≈ **638 N**, P<sub>équateur</sub> ≈
   **632 N**. Déjà signalée dans l'ébauche, désormais corrigée.
8. **Exercice 8 (diapo 10) — « plus de 8 % » → ≈ 0,8 %.** (637,65 − 632,45) ÷ 637,65 = 0,0082.
   Erreur d'un facteur dix. Le calcul de l'écart relatif est écrit dans la correction (fraction
   empilée). Déjà signalée dans l'ébauche, désormais corrigée.
9. **Exercice 11 (diapo 13) — numérotation.** La source le numérote « Exercice 10 », en doublon avec
   « Compléter l'image 14 » (diapo 11). Renuméroté 11, comme dans l'ébauche.

Corrections de forme, sans commentaire SOURCE → CORRIGÉ (commentaire HTML simple à l'endroit pour les trois premières) :
« à **tout** action » → « toute » (diapo 2) ; « exprimée en **Newton** (N) » → « newton », nom
d'unité en minuscule (diapo 5) ; « cette force **appelons la** F » → « appelons-la » (diapo 9) ;
« sans **soucis** d'échelle » → « souci » (diapo 13) ; « Calculez […] représentez **la** » →
« représentez-la » (diapo 8).

## 2. Incohérences de calcul

Tous les calculs vérifiés à la main :
6,67 × 10<sup>−11</sup> × 5,98 × 10<sup>24</sup> × 7,34 × 10<sup>22</sup> ÷ (3,844 × 10<sup>8</sup>)<sup>2</sup>
= 1,981 × 10<sup>20</sup> N ✓ ; 6,67 × 10<sup>−11</sup> × 5,98 × 10<sup>24</sup> ÷ (6,380 × 10<sup>6</sup>)<sup>2</sup>
= 9,799 N·kg<sup>−1</sup> ✓ ; 65,0 × 9,81 = 637,65 ✓ ; 65,0 × 9,73 = 632,45 ✓ ;
1500 ÷ 1,625 = 923,08 ✓. Contrôle croisé : avec la masse et le rayon de la Lune du tableau,
g<sub>Lune</sub> = 1,621 N·kg<sup>−1</sup>, cohérent avec le 1,625 de l'image 13.

Ce qui ne se recoupe pas d'une diapo à l'autre (rien de modifié) :

- **Rayon de la Terre** : 6 380 km (exercice 7), 6 378,0 km (tableau de l'exercice 6),
  6,36 × 10<sup>6</sup> m (image 13). **Masse de la Terre** : 5,98 × 10<sup>24</sup> (cours, tableau)
  contre 5,983 × 10<sup>24</sup> (image 13). **g moyen** : 9,80 (exercice 7), 9,8067 (image 13),
  9,81 (Paris). Rien de faux, mais trois jeux de données pour la même planète.
- **g à l'équateur = 9,73 N·kg<sup>−1</sup>** (légende de l'image 13 et exercice 8) : la valeur de
  référence est plutôt **9,78**. Non modifié, parce que l'exercice 8 est construit dessus ; avec
  9,78, P<sub>équateur</sub> ≈ 636 N et l'écart tombe à 0,3 %. À toi de voir.
- Infographie aquaportail (image 13), valeurs qui s'écartent des références usuelles :
  Saturne 11,19 m·s<sup>−2</sup> (≈ 10,4), Uranus 9,01 (≈ 8,7–8,9), Neptune 11,28 (≈ 11,15).
  Tableau des astres : Vénus 6 056,8 km (≈ 6 051,8), Saturne 60 018 km (≈ 60 268 à l'équateur),
  Soleil 698 000 km (≈ 696 000), Mercure 3,28 × 10<sup>23</sup> kg (≈ 3,30). Transcrits tels quels.
- Image 7 : une pomme de poids 5 N pèse environ 510 g — grosse pomme. Sans conséquence.

## 3. Contenus récupérés qui n'étaient nulle part ailleurs

- **Le tableau des astres** de l'exercice 6 (10 astres, rayon et masse), retranscrit en
  `table.tab` : c'est là que l'élève trouve m<sub>Terre</sub> et m<sub>Lune</sub>.
- **L'infographie « pesanteur (g) »** (image 13) : 16 astres et satellites × 4 colonnes, plus la
  formule g = G × M ÷ r<sup>2</sup> (fraction empilée) et ses trois données terrestres. La valeur
  g<sub>Lune</sub> = 1,625, entourée dans la source, reste repérée (c'est la donnée de l'exercice 9).
- **Le paragraphe de la diapo 8** « Deux objets de masses respectives m<sub>A</sub> et m<sub>B</sub>
  s'attirent… » et la phrase de la diapo 9 « L'objet est attiré par la Terre et réciproquement… » :
  absents de l'ébauche.
- **Le diagramme objets-interactions manuscrit** de l'énoncé de l'exercice 3 (avion à réaction,
  air qui pousse / porte / freine, Terre), refait en SVG.
- **Les légendes intégrales** des images 1 à 15 (l'ébauche les résumait) ; le libellé exact des
  unités de g (« m·s<sup>−2</sup> ou N·kg<sup>−1</sup> »).
- **Exercice 11, tension** : la source dit « Sens : vers la droite | vers le fil » (l'ébauche avait
  écrit « vers le haut du plan »). Rétabli mot pour mot, ainsi que « Norme : ∅ ».
- **Exercice 4** : la réponse 2 de la source (« La norme de R vaut elle aussi 10 N, son sens est
  opposé à celui de P ») et la représentation à l'échelle (segment de 5 N).
- Les énoncés reprennent **exactement les données de la source** : l'ébauche avait ajouté
  m<sub>T</sub> et G aux données de l'exercice 7, g<sub>Lune</sub> à l'exercice 9 et m = 65,0 kg à
  l'énoncé de l'exercice 8. Retirés (voir §5).

## 4. Licences à confirmer

Toutes listées dans `assets/img/pc/2nde-pc-t2-c2/CREDITS.md`, chaque `<figure>` concernée porte
`data-origine="source PPTX — licence non identifiée"` :

- `t2c2-tennis-raquette.jpg` (image 1) — 🔴 **un joueur professionnel reconnaissable** : droit
  d'auteur **et** droit à l'image. C'est la plus exposée du chapitre.
- `t2c2-vase-table-forces-source.png` (image 6) — porte le filigrane **© www.youphysics.education** ;
  `t2c2-skieur-forces-source.jpg` vient probablement du même site.
- `t2c2-terre-figurine-source.jpg` (image 11) — figurine de jouet, marque probable.
- `t2c2-jupiter-io.jpg`, `t2c2-fusee-decollage.jpg` (Saturn V), `t2c2-terre.jpg`, `t2c2-lune.jpg`
  — très probablement NASA (domaine public), à confirmer.
- `t2c2-portrait-newton-kneller.jpg` — tableau de 1689 dans le domaine public ; reproduction
  d'origine inconnue.
- Cliparts : `t2c2-aimant-source.png`, `t2c2-pied-ballon-source.png`, `t2c2-avion-source.png`,
  `t2c2-pot-fleur-source.png`.
- Image 13 : infographie de **www.aquaportail.com**, retranscrite en tableau (crédit en légende ;
  données factuelles, mais la mise en forme d'origine n'est pas reprise).
- `t2c2-pommes-branche.jpg` (vignette du hub, antérieure) : origine inconnue, ajoutée au CREDITS.

## 5. Remarques pédagogiques

1. **Exercice 3 — vocabulaire jamais présenté.** La correction nomme portance, traînée, poussée des
   réacteurs ; le cours ne les définit nulle part. Le diagramme manuscrit de l'énoncé (« air qui
   pousse / porte / freine ») sert d'échafaudage, mais l'élève ne peut pas deviner les mots. Règle
   « rien d'évalué qui n'ait été montré » : à trancher.
2. **Exercice 8 — « Calcule ton poids »** : la masse de 65,0 kg n'apparaît que dans la correction.
   C'est cohérent avec la consigne (sa propre masse), mais l'élève qui se corrige compare des
   nombres différents.
3. **Exercice 7** : seules les données R<sub>T</sub> figurent ; m<sub>T</sub> est à prendre dans le
   tableau de l'exercice 6 et G dans le cours. Fidèle à la source ; un renvoi aiderait.
4. **Exercice 11 — « Étant immobile, il n'y a pas de frottements »** : l'immobilité n'implique pas
   l'absence de frottements (c'est même souvent l'inverse). « On néglige les frottements » ?
5. **Image 8 — flèches simples** (Sol → ballon, Terre ⇢ ballon) alors que la convention posée à
   l'image 4 est la double flèche : c'est en fait un diagramme des actions **subies** par le ballon.
   Reproduit tel quel ; à harmoniser ou à expliquer.
6. **Exercice 5 — « air »** : la paire action-réaction est fusée / gaz éjectés, pas fusée / air
   ambiant. Notation de la source conservée.
7. **Notation R ou R<sub>N</sub>** : le cours écrit R, l'image 14 et l'exercice 10 R<sub>N</sub>, sans
   que l'indice soit expliqué.
8. **La citation de Newton** n'est pas sourcée (la charte `.histoire` demande une citation sourcée ;
   le portrait est posé en figure simple, pas en encadré d'histoire des sciences).
9. **Image 12** est l'image 7 en réduction : posée telle quelle (même SVG redessiné en plus petit).

## 6. Propositions de Claude à valider

- **Six transitions `.aparte`** (sur le modèle de T1-C3), toutes nouvelles : « Une action en appelle
  souvent une autre… » (avant B), « Dire qui agit sur qui ne suffit pas… » (avant C), « Revenons à
  l'interaction… » (ouverture du II), « Et si l'un des deux corps est la Terre… » (avant le poids),
  « Le poids est une action à distance… » (avant la réaction du support), et l'aparté de l'image 8
  qui nomme la vraie paire action-réaction (lié à la correction n° 3).
- **Exercice 5** : la relation F<sub>air/fusée</sub> = −F<sub>fusée/air</sub> sous le schéma de
  correction (la source n'a que le dessin).
- **Exercice 3, correction** : flèches tracées portance = poids et poussée = traînée (vol en palier à
  vitesse constante) ; la source les dessinait de longueurs inégales, sans échelle annoncée.
- **Exercice 4** : R part du point de contact pot/livre, P du centre de gravité, sur la même verticale
  (la source les faisait partir du même point), longueur 2 × le segment de 5 N.
- **Exercice 10 — la correction du 25/08 vérifiée**, toujours rédigée par Claude (la source corrigée
  n'en porte pas). Texte conservé ; **schéma refait inline** avec deux rectifications :
  R<sub>N</sub> part désormais du **point de contact** (elle partait de G, contre l'image 14 et
  l'exercice 11) et, sur le plan incliné, R<sub>N</sub> est **plus courte** que P
  (R<sub>N</sub> = P × cos α, α = 20° sur la figure ; elle était de même longueur).
- **Diagrammes et schémas** : les objets du monde (pomme, ballon, solides) sont des formes simples ;
  avion, pot, fusée, Terre et Lune restent les images de la source, vecteurs posés en SVG par-dessus.
- Retrait des données ajoutées par l'ébauche (§3, dernier point) : si tu préfères les garder dans
  les énoncés, c'est une ligne chacune.

## Contrôles

`node verifier.mjs` : **19 problèmes**, le repère, aucun ajouté (le dossier d'images est désormais
documenté). Playwright : zéro erreur JS, aucune ressource en échec ; verrou (verrouillé à l'arrivée,
mauvais code refusé, bon code en minuscules accepté, persistance au rechargement, `?verrou=1`
reverrouille) ; 10 `<img>` chargées une à une et 8 `<image>` de SVG servies ; 19 SVG avec title,
desc et aria-labelledby, identifiants uniques ; aucun débordement à 390 px (iframe). Zéro U+20D7,
aucune barre de fraction, indices et exposants en balises.
