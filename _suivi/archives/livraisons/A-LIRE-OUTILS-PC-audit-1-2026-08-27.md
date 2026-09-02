# À lire — audit 1 des outils transversaux de PC, 27/08/2026

**Objet.** Application du brief `BRIEF-CLAUDE-CODE-OUTILS-PC-audit-1.md` sur les
deux outils de seconde, `o1` (écriture scientifique) et `o2` (chiffres
significatifs), leurs deux fiches A4, et le cahier de vacances pour le seul point
qui l'imposait.

**Tout est fait**, parties A à G. Aucun asset partagé n'a été touché :
`sequence-snt.js?v=41`, `sequence-snt.css?v=41` et `progression.js?v=16` sont
inchangés — vérifié par `git status`, pas de mémoire.

---

## Ce que tu dois trancher — trois points, un seul urgent

1. 🔴 **La justification du seuil de l'ordre de grandeur** (décision **O-22**).
   Ta décision « le seuil est 5 » est appliquée partout, sans réserve. Mais
   l'**argumentation** qui l'accompagnait dans le brief ne tient pas : sur un axe
   **linéaire** de 1 à 10, les deux zones de part et d'autre de 5 font 4 et 5
   unités — elles n'ont pas la même longueur — et « 5 est plus près de 10 que
   de 1 » n'est vrai qu'en *facteur*, c'est-à-dire l'argument `√10` qu'on
   abandonne. J'ai donc justifié le seuil par l'**arrondi** : *« tu regardes a,
   et rien d'autre : en dessous de 5 tu redescends, à partir de 5 tu montes — le
   cas limite est réglé une fois pour toutes, 5 monte »*. Le schéma est un axe
   gradué régulièrement, trait de seuil sur le 5, sans note sur les longueurs.
   **C'est du fond : à valider ou à réécrire.**

2. **`2000 g` porte maintenant quatre chiffres significatifs** — conséquence
   directe et assumée de ta décision sur les zéros de fin. Le compteur de `o2`
   l'affiche. Tu le savais, je le redis parce que c'est ce que les élèves
   verront.

3. **Les hectares** sont écartés des conversions de surfaces, comme tu l'as
   demandé. Le tableau s'arrête à `km²` … `mm²`. On les ajoute en dix minutes si
   tu changes d'avis.

---

## Un point du brief que je n'ai pas pu suivre — et pourquoi

**La case `#teacherMode` reste dans la page** (décision **O-21**). Le brief
demandait de retirer, avec le bloc `.ens-zone`, le
`<input type="checkbox" id="teacherMode" hidden>` de `nav.seances`.

Je l'ai fait, puis vérifié au navigateur : **la page casse**. Le moteur écrit
`document.getElementById('teacherMode').addEventListener(...)` **sans garde**
(`sequence-snt.js` l.350) ; la case absente, toute son initialisation s'arrête
là — pas de barre de progression, pas de modales, pas de barre d'actions, une
erreur JS à l'ouverture. Comme le moteur est partagé par huit pages et qu'on ne
le modifie pas, la case reste, avec un commentaire qui explique pourquoi. Le
**mode enseignant lui-même a bien disparu de l'affichage** : sans le bloc
`.ens-zone`, plus rien ne peut cocher cette case, elle est inerte.

---

## Deux endroits où j'ai fait plus simple que le brief

- **Les pictogrammes de la frise** (B5). Le brief prévoyait d'élargir le
  `viewBox` de 26 px et de décaler tous les `x`. Mesure faite : les exposants ne
  descendent pas sous `x = 104`, il y avait donc **déjà** la place. Les huit
  pictogrammes sont posés dans cette gouttière, le `viewBox` n'a pas bougé et
  **aucune coordonnée existante n'a été touchée** — beaucoup moins risqué.
- **La frise de la fiche A4** n'existe pas en SVG : c'est une phrase à trois
  repères (`10⁻¹⁰ m` · `10⁰ m` · `10⁷ m`). Il n'y avait donc rien à illustrer, et
  la question des deux pages ne se posait pas.

---

## Ce qui a changé, outil par outil

### Les deux, en une passe (partie A)

- **Le récapitulatif PDF du moteur est retiré**, aux **trois** endroits où il
  paraissait : barre de fin de partie, modale de « Recommencer », pop-up de fin.
  Les deux dernières sont construites à la demande — il a fallu un
  `MutationObserver`, un simple balayage au chargement les manquait. Le bouton
  « Recommencer » reste. Le mot « PDF » et la « fiche » du moteur n'apparaissent
  plus nulle part à l'écran, séance terminée comprise (testé en jouant la partie
  entière).
- **La barre du haut** : le bouton ☰ (sommaire) disparaît, « Thèmes » devient
  « Retour », l'infobulle dit « Revenir à la physique-chimie ». La barre reste
  déployée, rien ne dépendait de `body.prog-reduit`.
- **Le mode enseignant** et la ligne « Aucun verrou » sont retirés de l'affichage.
- **Les majuscules automatiques** ne s'appliquent plus à un texte pouvant porter
  une unité ou une variable : `Convertir 32 kg·L⁻¹ en g·cL⁻¹` s'affichait
  `32 KG·L⁻¹ EN G·CL⁻¹`. Retiré de `.exemple-titre`, `.saisie th` et — le brief
  ne l'avait pas vu — `.ex-lab`, où « On isole a et n » devenait « ON ISOLE A ET
  N ». Même passe sur les `.etq` des encadrés des deux fiches, où l'on trouvait
  `✓ Cas 3 — une unité composée : 32 kg·L⁻¹ en g·cL⁻¹`.
- **Les durées** sont revues : `≈ 1 h 45, en deux fois` ; la méthode `≈ 1 h`,
  l'entraînement `≈ 45 min`.
- **Les neuf « à retenir »** passent à la structure en trois temps — *la règle*
  (grande, centrée, seule), *le geste*, *le contrôle*, plus *le piège* quand il
  y en a un. Le gras ne sert plus qu'à un mot par ligne. Même grammaire, en
  version compacte, sur les deux fiches A4.

### `o1` — écriture scientifique

- **Cinq étapes** au lieu de quatre : l'ancienne 1.3 se scinde en **1.3
  Calculer avec des puissances de dix, et les préfixes** et **1.4 Convertir :
  unités composées, volumes, surfaces**. L'ordre de grandeur devient 1.5. Les
  renvois croisés ont suivi — dont un que le brief n'avait pas listé, le corrigé
  de l'exercice 4 qui pointait « l'exemple résolu de l'étape 1.3 ».
- **Le seuil est 5** partout : page, fiche A4, et `cahier/diag-j01-…` (le seuil
  uniquement, rien d'autre n'a été touché dans le cahier). Le schéma est refait
  en **axe linéaire**. Aucune réponse d'exercice ne change.
- **Un cas dans la bande où les deux règles divergeaient** est ajouté à deux
  endroits : `4,2 × 10⁵` dans la vérification de l'étape, et la **distance
  Terre–Lune `3,8 × 10⁸ m`** en cinquième ligne de l'exercice 5.
- **L'étape 1.1 perd son exercice** de phrases à compléter et se valide **à la
  lecture** — précisément quand tu révèles l'étape suivante. Elle garde son
  `data-gate`, la barre monte toujours à 100 %, la partie 2 se déverrouille
  (testé).
- **Beaucoup plus de tests** : le tableau de l'étape 1.2 passe à **six** lignes
  (dont une écriture fausse à corriger) et gagne un **QCM de 6 questions** sur
  les pièges ; l'étape 1.3 gagne un test des règles de calcul **et un QCM de 10
  questions** sur les préfixes, dans les deux sens et sur sept unités
  différentes ; l'étape 1.4 gagne trois unités composées, quatre volumes (dont
  un qui traverse les deux systèmes) et **les surfaces**, qui n'existaient que
  dans une incise : tableau `km²`…`mm²`, règle du facteur 2, trois conversions.
- **Huit pictogrammes** dans la frise : Terre, terrain de football, maison,
  silhouette, grain de sable, bactérie, ADN, atome. Monochromes, aucune couleur
  en dur.
- **Plus de texte barré** dans « à éviter » : une croix rouge en tête de ligne.

### `o2` — chiffres significatifs

- **L'ambiguïté disparaît.** Règle 4 : « les zéros à droite comptent ». Le
  compteur perd son troisième état ; il affiche **3** pour `100`, **2** pour
  `50`, **4** pour `2000`, **5** pour `0,020540`, **3** pour `003,20`, avec une
  glose non vide dans chaque cas (les douze cas testés au navigateur).
- **Les nombres exacts** prennent la place — formule, définition, dénombrement.
  L'exercice 2 de la section 2, qui portait entièrement sur `100`, devient
  l'exercice des nombres exacts (périmètre `2πr`, 57 neutrons, dilution au
  dixième), avec son corrigé rédigé.
- **Le `±` s'explique avant d'être employé** : ce qu'il dit (un intervalle), ce
  qu'il ne dit pas (ni erreur, ni maladresse — toute mesure en porte une), d'où
  vient le nombre. Le `.point-cle` sur `ΔA` a été **déplacé** là plutôt que
  répété. **`ΔA / A` est démotée** en note dépliable « pour plus tard », non
  évaluée, comme tu l'as demandé.
- **Les deux règles sont justifiées par l'expérience** — l'intervalle de mesure
  qu'on fait tourner dans le calcul : `2,5 × 3,42 → [8,37 ; 8,73]`,
  `1,25 + 0,025 → [1,2695 ; 1,2805]`, et le contre-exemple `250,0 + 5,0 →
  [254,9 ; 255,1]` qui montre que la règle du compte donnerait « entre 255 et
  265 ». Marqués **○ support**.
- **Un principe, deux lectures** (ta validation du 27/08) : le principe unique
  mène l'étape 1.3, le bloc `.duo` et les deux « à retenir ». « Précis » veut
  dire *en proportion* pour `× ÷`, *en rang* pour `+ −`.
- **Plus d'exercices** : 6 nombres à compter en 1.1 + 3 cases sur les nombres
  exacts, un **QCM de 6 questions** en 1.2, 4 calculs en 1.3 (dont deux
  divisions et un cas où les deux données ont le même compte), 5 en 1.4 dont
  **deux soustractions** et un cas où les deux règles divergent.

---

## Contrôles passés

| Contrôle | Résultat |
|---|---|
| `node verifier.mjs` | **18 problèmes**, avant comme après — le repère est tenu |
| Assets partagés | `git status` : aucun fichier de `assets/` modifié |
| Parcours complet des deux parties 1, au navigateur | 5/5 et 4/4 étapes validées, jauge **100 %**, partie 2 déverrouillée, **zéro erreur console** |
| Toutes les réponses attendues rejouées | `o1` **114/114** champs acceptés · `o2` **56/56** — aucune réponse que le moteur refuserait |
| Mot « PDF » / « fiche » du moteur | absents des trois endroits, séance terminée comprise |
| « ambigu » / « ambiguïté » | plus aucune occurrence dans `o2`, sa fiche, son JS |
| `3,16` / `√10` | plus aucune occurrence dans le dépôt (hors `_suivi/`, qui raconte la décision) |
| Textes SVG mesurés par `getBBox()` | aucun hors `viewBox`, frise et axe refaits compris |
| Majuscules au rendu | aucun libellé en capitales ne porte d'unité ni de variable |
| Rendu à 768 px et 390 px | aucun débordement horizontal — mesuré **en iframe**, le headless rognant sous 500 px |
| Les deux fiches A4 | **deux pages exactement** ; marges restantes : `o1` 32,5 / 12 mm, `o2` 18,6 / 12 mm |
| `data-cle` | tous préfixés `pc-o1-` / `pc-o2-`, tous uniques, y compris les clés de trous dans une même étape |
| `localStorage` | aucun |
| Couleurs en dur hors `:root` | aucune |
| Ouverture sans base configurée | zéro erreur console |
| QCM ajoutés | JSON valides ; bonnes réponses réparties sur les 4 positions ; aucun biais de longueur (écarts de −5 à +2 caractères) |

---

## Ce qui reste hors périmètre

- l'**édition des exercices du cahier de vacances** : seul le seuil y a été
  repris, rien d'autre — tu l'avais évoqué, ce n'est pas cadré ;
- l'**édition des exercices de la section 2 de `o2`**, sauf l'exercice 2 qui
  devait disparaître avec l'ambiguïté ;
- l'**ordre des sections de la fiche A4 de `o1`** (`01` forme · `02` ordre de
  grandeur · `03` préfixes · `04` calculatrice), qui ne suit pas l'écran et s'en
  écarte un peu plus depuis la scission. Elle tient en deux pages, c'est
  fragile : je ne l'ai pas touchée ;
- les **neuf PDF sources du collègue** ne sont pas dans le dépôt. Sans
  conséquence ici, mais ils manqueront pour `o3` à `o8`.

## Ce qui a surpris

- **Le moteur n'a pas de garde sur `#teacherMode`.** Une case cachée, retirée
  parce qu'elle ne sert à rien à l'écran, et huit pages potentiellement mortes.
  C'est noté dans les consignes (§2) pour `o3` à `o8`.
- **Le mécanisme du moteur pour valider une étape sans exercice existe déjà** —
  `data-valide-sur-interaction`. Il n'était pas utilisable ici (l'étape 1.1 n'a
  aucun contrôle à manipuler), mais il existe : à connaître pour les outils
  suivants.
- **L'argument du seuil ne survivait pas au changement de seuil.** C'est le seul
  endroit où le brief se contredisait lui-même, et il fallait le voir avant
  d'écrire — d'où le point 1 en tête de ce fichier.
