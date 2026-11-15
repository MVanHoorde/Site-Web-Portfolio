# Relevé — T2-C1 « Décrire le mouvement » (V1 intégrale, 13/11/2026)

Page : `pages/2nde-pc-t2-c1-decrire-le-mouvement.html` · images : `assets/img/pc/2nde-pc-t2-c1/`
(+ `CREDITS.md`) · source de référence : `Thème 2 - Chapitre 1 [correction] - Décrire le
mouvement.pptx` et son PDF (10 diapositives). Les numéros de diapo sont ceux du PPTX (diapo 1 =
couverture ; la pastille imprimée sur la diapo vaut N − 1). Code de déblocage inchangé : **REP3RE**.

Bilan : **0 `.a-faire`** (le lien du DS existe déjà : `ds5-t2c1-t1c5.pdf`), 15 images de la source
toutes posées avec leur légende, **16 SVG inline** (`<title>` + `<desc>` + `aria-labelledby`),
9 images extraites, **73 vecteurs en `.vec`**, plus aucune flèche combinante U+20D7.

## 1. Erreurs de physique corrigées

`grep -n "SOURCE → CORRIGÉ" pages/2nde-pc-t2-c1-decrire-le-mouvement.html` → **2 lignes**, ci-dessous.

1. **Image 12 (diapo 7) — longueurs des vecteurs vitesse moyenne.** Les quatre flèches de la
   source ne respectent pas v<sub>3→j</sub> = M<sub>3</sub>M<sub>j</sub> / Δt<sub>3→j</sub> :
   v<sub>3→12</sub> y est la plus longue et v<sub>3→7</sub> la plus courte. Avec les positions
   relevées et un intervalle constant, l'ordre est v<sub>3→4</sub> > v<sub>3→12</sub> >
   v<sub>3→7</sub> > v<sub>3→9</sub> (en pixels de l'image : 69,7 ; 45,6 ; 31,5 ; 25,3 par
   intervalle). La page garde les **directions** de la source et trace les **longueurs à une même
   échelle**. Effet voulu : la figure montre maintenant que v<sub>3→j</sub> se rapproche de la
   vitesse en 3 quand j se rapproche de 3. À valider — tu peux préférer une figure purement
   qualitative, mais alors il vaudrait mieux le dire dans la légende.
2. **Image 11 bis (diapo 6) — construction de M<sub>12</sub>M<sub>26</sub>.** Sur la photo de la
   source, l'étiquette M<sub>12</sub> tombe sur la 11ᵉ position (et M<sub>26</sub> à un rang près),
   alors que les exercices 2 et 3 comptent les 34 croix de la simplification. La construction est
   retracée en SVG sur le **nuage de croix des exercices**, avec leur numérotation : une seule
   numérotation circule dans le chapitre. Même construction que la source (vecteurs position en
   orange, déplacement en bleu, −OM<sub>12</sub> et M<sub>12</sub>M<sub>26</sub> reporté en
   pointillés). La photo annotée de la source n'est pas reprise.

Corrections de forme, sans commentaire SOURCE → CORRIGÉ (commentaire HTML simple à l'endroit) :
« l'origine des dates **et** le moment du tir » → **est** (diapo 3) ; définition de la
chronophotographie « permettant ainsi repérer […] d'en tracer **sa** trajectoire et d'en calculer
**sa** vitesse » → « de repérer », « la trajectoire », « la vitesse » (diapo 4).

## 2. Incohérences de calcul

Tous les calculs des corrigés vérifiés à la main : 3,8 cm × 2 = 7,6 m ; 7,6 / (2 × 0,5) = 7,6 m·s<sup>−1</sup>
→ 0,76 cm ; 3,0 / 0,5 = 6,0 m·s<sup>−1</sup> → 0,6 cm ; 3,8 / (0,5 − 0) = 7,6 m·s<sup>−1</sup> → 0,76 cm. **Justes.**

- **M<sub>3</sub>M<sub>4</sub> mesure plutôt 3,1 m que 3,0 m.** Croix relevées sur l'image des motos
  (en px : 92, 257, 422, 555, 688,5, 806) avec M<sub>1</sub>M<sub>2</sub> = 1,9 cm : écarts 1,90 ·
  1,90 · 1,53 · 1,54 · 1,35 cm, soit 3,8 · 3,8 · 3,06 · 3,07 · 2,71 m. La valeur 3,0 m de la
  correction est un arrondi défendable (lecture au mm : 1,5 cm → 3,0 m). Rien changé.
- **Exercice 5 :** v<sub>1</sub> = v<sub>2</sub> = 7,6 m·s<sup>−1</sup> : la remarque « la norme des vecteurs
  vitesse diminue » n'est vraie qu'à partir de M<sub>2</sub>. Texte laissé tel quel.
- « t<sub>2</sub> − t<sub>1</sub> = 0,5 − 0 » suppose t<sub>1</sub> = 0, jamais posé dans l'énoncé.

## 3. Contenus récupérés qui n'étaient nulle part ailleurs

- **Une vidéo oubliée par l'ébauche** : diapo 4, forme « Réviser en vidéo » →
  `youtube.com/watch?v=t5Kd9PELu18` (« Décrire un mouvement : trajectoire, vitesse, bilan »,
  chaîne e-profs - Physique Chimie). Posée après l'exercice 1. Les 9 autres liens (8 vidéos +
  Kahoot) étaient déjà là ; le lien OneDrive du DS 2024-2025 (diapo 10) n'est pas repris, le DS5
  du dépôt est lié.
- Les **légendes des images 1, 2, 3, 4, 10, 11, 13, 14** n'étaient pas sur la page.
- **Positions relevées** (scripts de relevé, pas à l'œil) : les 34 croix du skieur (identiques à
  celles des SVG de correction du 25/08 : M<sub>4</sub>, M<sub>7</sub>, M<sub>13</sub>,
  M<sub>21</sub> confirmés), les 6 croix des motos, les 15 points de l'image 12, les points des
  trois trajectoires de l'image 8, les espacements des trois rangées de la fiche mémo.
- **Fiche mémo de l'image 15** retranscrite (texte + rangées de points en SVG), l'image d'origine
  n'est pas conservée.
- Checklist du DS, item 4, remis mot pour mot : « … à des instants voisins séparés de Δt ; **le
  représenter** » (la fin manquait).

## 4. Licences à confirmer

Toutes les images extraites portent `data-origine="source PPTX — licence non identifiée"` :

| Fichier | Contenu | Note |
|---|---|---|
| `t2c1-pomme-point-materiel-source.jpg` | image 1, pomme (dessin) | clipart |
| `t2c1-perchiste-point-materiel.jpg` | image 2, saut à la perche + croix | cliché ancien, peut-être du domaine public (Marey ? Muybridge ?) — à identifier |
| `t2c1-chronophoto-perchiste.jpg` | image 9, même cliché | idem |
| `t2c1-chronometre.jpg` | image 4 | photo de banque d'images probable |
| `t2c1-referentiel-terrestre-athlete.jpg` | image 5 | photo de manuel probable |
| `t2c1-referentiel-geocentrique-source.jpg` | image 6 | illustration de manuel probable |
| `t2c1-referentiel-heliocentrique-source.jpg` | image 7 | idem |
| `t2c1-chronophoto-skieur.jpg` | image 11 | photo de manuel probable |
| `t2c1-motos-source.jpg` | support des exercices 4 et 5 | clipart |

- **Image 15, fiche mémo de Paul Olivier** : retranscrite, pas copiée. Crédit et lien vers sa vidéo
  dans la légende. Reste à savoir si cette reprise te convient.
- `t2c1-danseur-rotation.jpg` (vignette du hub, hors page) : origine non documentée, laissée telle quelle.

## 5. Remarques pédagogiques

- **Image 14 : le vecteur <i>a</i> (accélération)** est dessiné mais jamais défini dans le cours. Gardé
  pour rester fidèle ; à retirer ou à expliquer en une phrase.
- **Image 13 :** la source écrit V<sub>M(t3)</sub> (majuscule) ; la page écrit v, comme le reste du cours.
- **Exercice 4, « Légender les points » :** le sens du mouvement ne se lit qu'à l'orientation des
  motos. Rien ne dit que M<sub>1</sub> est à gauche.
- **Exercices 2 et 3 :** les croix M<sub>1</sub> → M<sub>3</sub> montent vers la gauche avant la
  descente (le skieur saute ?). Un élève qui numérote depuis le haut de la piste trouvera un
  décalage de deux rangs. M<sub>1</sub> et M<sub>2</sub> sont légendés, comme dans la source.
- Le mot « référentiel » est employé pour l'origine du vecteur position (« dépend de l'origine
  du référentiel ») ; strictement, c'est l'origine du **repère**.
- « Exemples de référentiels » : la définition de la source est la légende des images 5-7 ; la page
  la pose en encart, et la figure porte le nom du référentiel. Aucun texte doublé.
- La source numérote deux figures « Image 11 » (diapos 5 et 6) : la seconde devient **Image 11 bis**.
- Exercice 1 : « ci-contre » → « ci-dessous » (la photo est sous l'énoncé sur la page).

## 6. Propositions de Claude à valider

- **Correction de l'exercice 1** (case vide dans la source) : système, référentiel terrestre,
  trajectoire **curviligne**, sens droite → gauche, course d'élan presque rectiligne. Volontairement
  sans un mot sur la vitesse : la notion n'est vue qu'en partie 03.
- **Corrections des exercices 2 et 3** (25/08) : relues, **gardées**. Positions justes. Les SVG ont
  été refaits en inline (flèches au-dessus des noms des vecteurs, absentes avant). Deux
  formulations précisées : M<sub>13</sub> « au début de la boucle vers la droite » (avant :
  « juste après ce virage ») ; M<sub>4</sub> « juste après le point le plus haut »,
  M<sub>21</sub> « dans la partie basse, après la boucle de droite ».
- **Exercice 4 :** étape « 1 — Légender les points », d'après les étiquettes de la figure corrigée
  de la source.
- **Exercice 5 :** tableau des cinq vecteurs v<sub>1</sub> à v<sub>5</sub> (écarts relevés,
  normes, longueurs de flèche). La source ne corrige que v<sub>1</sub>.
- **Figures de correction des exercices 4 et 5** en SVG, à l'échelle exacte de l'énoncé (flèche =
  0,2 × M<sub>1</sub>M<sub>3</sub> pour v<sub>1→3</sub>, 0,4 × M<sub>i</sub>M<sub>i+1</sub>
  pour les autres).
- **Huit transitions `.aparte`** (une phrase chacune), sur le modèle de T1-C3 : après le point
  matériel, avant les exemples de référentiels, en tête de 02, avant le vecteur position, avant le
  vecteur déplacement, en tête de 03, avant la vitesse instantanée, avant la nature du mouvement.
- Étiquettes « rectiligne / circulaire / curviligne » ajoutées sous les trois tracés de l'image 8.
- La vitesse instantanée a son propre `.formule-bloc` ; ses « Grandeurs » (« M<sub>i+1</sub> la
  position succédant à M<sub>i</sub> », « la durée qui les sépare ») reformulent la propriété.
