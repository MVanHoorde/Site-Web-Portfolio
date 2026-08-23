# À LIRE — audit du 23/08/2026, les quatre lots appliqués

> Brief traité en entier : partie I (module `m1`), partie II (générateur de
> fiches), partie III (dette de suivi).
> `node verifier.mjs` : **18 problèmes** — c'est le nouveau repère.
> Les trois pages du moteur (`m1`, `t1`, `t2`) rejouées au navigateur :
> **0 erreur JS**, tous les blocs de réponse passent « tout est juste ».

---

## ⚠ Cette livraison déborde sur le livret CFA — 19 fichiers, une ligne chacun

Uniquement ceci, rien d'autre :

```
-<script src="../assets/js/progression.js?v=15" defer></script>
+<script src="../assets/js/progression.js?v=16" defer></script>
```

**Pourquoi** : le lot 4 a modifié `assets/js/progression.js`, et le livret CFA
charge **ce même fichier physique** depuis son branchement sur les comptes le
19/08. Sans le nouveau `?v=`, un apprenti qui a déjà ouvert le livret garderait
l'ancienne version en cache.

**Ce que ça change pour le CFA : rien.** Les deux seules fonctions modifiées —
`mesReponses()` et `versions()` — ne sont appelées par **aucune** page CFA. Le
livret n'utilise de `progression.js` que la couche comptes.

**Ce que ça révèle** : le livret CFA n'apparaissait **ni dans `CLAUDE.md` ni dans
`MANIFESTE.md`** — quatrième famille de contenu, 17 outils, deux codes de classe,
branchée sur Supabase, et absente de la carte. C'est ce qui rendait illisible
qu'une modification faite pour le SNT touche 19 de ses fichiers.

Corrigé : le livret a sa ligne dans les deux fichiers de référence, et les **trois
assets partagés** sont nommés avec leur portée exacte —
`assets/js/progression.js` → **24 fichiers**, `sequence-snt.js`/`.css` → **4**,
`chapitre-commun.css` → les 14 chapitres PC.

Règle posée : **toute livraison qui touche un asset partagé annonce les parties
qu'elle déborde.** Incrémenter le `?v=` ne suffit pas — il faut le dire.

---

## 🔴 Ce qui attend une décision de ta part

1. **Le niveau d'exigence de la grille `REP-R1`.** Elle n'existait pas ; j'en ai
   posé une V1 marquée `"_statut"` dans `ia-snt/criteres-snt.json`, à deux
   étages comme celles de `t1` : **un seul** des trois points demandés suffit
   pour accepter. C'est délibérément coulant — c'est un bonus non évalué. À
   resserrer si tu le juges trop bas.

2. **Le tableau des poids vierge de la fiche.** Le brief dit qu'il n'a plus
   d'objet — la fiche n'est jamais imprimée. Je l'ai retiré. Si tu le voulais
   comme **modèle à recopier sur le cahier**, il revient en trois lignes.

3. **Le durcissement base de `correction_ia`** — `bdd/schema/015`, écrit et
   **non exécuté**, avec trois voies chiffrées. Détail au §4 ci-dessous.

4. **Le classement de 1.5 passe à 11 items.** Tu en demandais cinq de plus, les
   voici. Mais le tri se valide **au 6ᵉ essai** : avec onze écritures à ranger,
   c'est peut-être court. À juger au premier passage devant des élèves.

---

## 1 · Ce qui a changé dans `m1`

### Étape 1.1
- La décomposition de 4073 fait maintenant saisir **les chiffres ET les poids**
  (7 champs au lieu de 3). Un **exemple sur 3506** est posé juste avant, après
  le passage « pourquoi comptons-nous par dix ? » — sur un autre nombre, sinon
  il donnait la réponse de l'exercice.
- La base 60 se décompose en **six temps** au lieu de deux : les trois rangs,
  puis les trois produits séparément, puis la somme.
- **QCM q3** — « transistor » était **en gras dans l'option** : le gras saute, et
  deux leurres crédibles entrent (résistance, carte graphique). Le corrigé
  explique pourquoi chacun est faux — la carte graphique manipule bien des 0 et
  des 1, mais *parce qu'*elle est bâtie en transistors : conséquence, pas cause.
- **QCM q4** — le leurre « parce que c'est plus simple pour faire des
  mathématiques » entre, et le corrigé explicite le piège : nos mathématiques
  s'**écrivent** en base 10, mais ce sont les mêmes dans n'importe quelle base.

### Bonus 1.1 — refait
Vidéo **Veritasium** (Pr Andrea Morello, UNSW) en `youtube-nocookie`, avec la
mention « en anglais, active les sous-titres » et le repère « les cinq réponses
sont entre la 3ᵉ et la 8ᵉ minute ». Puis un **QCM de 5 questions** (`REP-Q5`),
hors des 100 %.

- **22 nm** est la bonne réponse. Le **52** devient un leurre, et le corrigé dit
  d'où il vient : la vidéo enchaîne sur « environ cinquante atomes de silicium »
  entre source et drain. Deux nombres voisins, deux grandeurs différentes.
- La question sur le nombre de transistors attend **« environ un milliard »** —
  le chiffre *de la vidéo*. Le corrigé traite l'écart avec aujourd'hui comme
  l'exercice lui-même : « cette vidéo date de 2013 […] savoir repérer qu'une
  source est dépassée, et de combien, c'est exactement ce que la loi de Moore
  t'apprend à faire. » (Ton chiffre de 200 milliards tient : le Blackwell B200
  en compte 208.)
- `REP-R1` n'est plus « cherche la loi de Moore » mais **un résumé de la vidéo**,
  et reçoit sa grille.

### Étape 1.2
- Le « à retenir » qui listait **les huit réponses juste sous les huit trous**
  passe dans le champ : il ne s'ouvre que si tout est juste, ou **au 3ᵉ essai**.
- L'échauffement binaire → décimal gagne un bouton **« Afficher la correction »**
  qui apparaît au **2ᵉ essai**.

### Étape 1.3
- **La limite est enfin dite.** Elle valait 1 à 4095 (12 bits), écrite en
  `min`/`max` et appliquée par un `focus()` muet — d'où « 3000 passe, 5000 non,
  sans un mot ». Elle s'affiche à côté du champ, et le dépassement produit
  « *« 5000 » est hors de ce que l'outil sait tracer : choisis un nombre entre 1
  et 4095.* » **Je ne l'ai pas relevée.**
- « Remplir le tableau » → **« Essayer avec ce nombre »**, champ à droite du
  bouton. Même disposition pour la potence.
- **La flèche de remontée est rectiligne** : elle part sous le dernier reste,
  longe l'escalier par la gauche et monte tout droit. Plus aucun recouvrement.
- La note de remontée passe de 17 à **20 px**, le résultat de 30 à **36 px**.

### Étape 1.4
Le tableau qui **donnait** 5 à 8 bits devient un **tableau à compléter**. Les
quatre premières lignes restent données (tu les avais validées) ; 5, 6, 7, 8
bits et le **cas général n** sont à produire — n en listes déroulantes, « 2ⁿ » ne
se tape pas au clavier. Correction quand tout est juste, ou par bouton au 3ᵉ essai.

### Étape 1.5 — découpée
Trois `.field` séparés : **A** binaire→décimal, **B** décimal→binaire, **C**
raisonnement. Chacun son bouton, **sa correction détaillée** — pas un verdict —
et ses indices, qui se rangent désormais au niveau du bloc. L'étape n'est validée
que lorsque les trois groupes **et** le classement sont faits.

Le classement passe à **11 écritures** (une de plus par longueur déjà présente,
plus `11111111`), et les deux règles de comparaison deviennent un **indice qu'on
demande** — elles s'affichaient jusqu'ici dès le premier « Vérifier », juste ou faux.

### Étape 2.1
L'ordre des quatre questions d'ordre de grandeur est **cassé** : photo → caractère
→ film → SMS. Elles montaient d'un cran à chaque fois ; l'élève suivait la
progression au lieu de raisonner.

### Étape 2.2
La formule n'est plus le calcul déjà appliqué mais **la formule générale** :
`|v₁ − v₂| ÷ v₂`, ×100 pour le pourcentage. **C'est l'élève qui décide qui est la
valeur de référence** — c'est la seule vraie difficulté, et elle lui est dite. Les
deux indices sont progressifs : le premier désigne v₂, le second pose le calcul.
La correction reformule : « pour chaque tranche de 100 octets annoncés, la machine
en compte un peu moins de 91 dans *ses* unités. Personne ne t'a volé d'octets. »

### Étape 2.3
Se valide **à la première manipulation d'un curseur**. Sa note disait qu'elle « ne
compte pas dans ta progression » — c'était faux : le sommaire compte **toutes** les
étapes d'une séance, `data-gate` ou non. Elle dit maintenant ce qui est vrai.

### Étape 2.4 — bilan
**12 questions, aucune retirée.** Quatre reformulations : Q3 (« Convertis cette
valeur en décimal »), Q9 (passe en **ko**), Q11 (« un dossier de 300 photos pèse
de l'ordre de… », options neuves), Q12 (« 500 Mo à 100 Mb/s, combien de temps ? »
— qui piège vraiment la confusion bit/octet : répondre 5 s, c'est avoir divisé
sans convertir).

---

## 2 · Le moteur partagé — deux attributs, et deux seulement

Trois des cinq points du §I-B **n'étaient pas des chantiers moteur** :

| | Ce que j'ai trouvé |
|---|---|
| **B2** validation par sous-partie | `bqReste()` comptait déjà **bloc par bloc**. Découper 1.5 en trois `.field` suffit |
| **B3** position des indices | `.indices-pied` est déjà créé en pied de **chaque** `.cloze`. Les 13 items vivaient dans un seul bloc, d'où l'indice qui partait loin. La variante « étiquette compacte » n'est pas touchée |
| **B5** limites des composants | Les trois outils sont **inline dans `m1`**, pas dans le moteur |

Restent, dans `sequence-snt.js` :

- **`data-essais-avant-correction="N"`** (+ `data-correction-bouton`) sur un
  `.field` : règle **par exercice** quand la correction se révèle ;
- **`data-valide-sur-interaction`** sur une étape sans exercice.

Sans ces attributs, **rien ne bouge**. Mesuré sur `t1` et `t2` : 0 erreur, aucun
attribut neuf, et un champ témoin sans attribut ne révèle toujours rien même après
quatre essais.

### ⚠ Deux bugs que j'ai introduits puis corrigés

À noter, parce qu'ils sont sournois et qu'ils reviendront :

1. **`$$` dans une chaîne de remplacement de `String.replace()` produit un seul
   `$`.** Mes trois `$$('…')` sont arrivés dans le fichier en `$('…')` — qui rend
   *un* élément et n'a pas de `.forEach`. TypeError à chaque clic sur « Vérifier ».
   Règle posée : pour patcher un fichier, **`split()/join()`, jamais `replace()`**.
2. **`var seuil = …` a masqué `function seuil(mot)`** dans toute la portée du
   gestionnaire (hoisting) : la correction tolérante à l'orthographe plantait
   avant même d'être atteinte. Renommé `seuilEssais`.

Les deux sont dans `DECISIONS.md`.

---

## 3 · La fiche de révision — refaite

`assets/js/sequence-snt.js`, `ficheHTML()`. Documentée dans
`_modeles/CONSIGNES-sequence-SNT.md` **§17**.

**L'en-tête** lit le thème dans `h1.title` et la séance dans `.seance-head h2`.
Plus de « Séquence Internet » en dur, plus de « S1 ». Vérifié : sur `t1` elle
affiche « Internet — Séance 1 — C'est quoi Internet ? ».

**Le bandeau de complétion**, trois compteurs — étapes parcourues, questions
envoyées, corrections reçues — plus une ligne nommant ce qui manque. Il appelle
**`EtatSNT.resume()`**, exposé pour l'occasion : c'est le calcul que la page écrit
en base et que ton tableau de bord relit. **Aucun second comptage.** La fiche dit
elle-même qu'elle est indicative et que ta grille fait foi.

**La partie fixe** est déclarée dans la page, en `<template data-fiche-fixe>`.
Celle de `m1` séance 1 est posée : **cinq schémas SVG** repris de ta maquette —
les trois écritures de 77, le tableau des poids, les deux méthodes côte à côte,
le doublement — plus l'entraînement à réponses retournées et les mots-clés.
Aucune couleur en dur : tout passe par des classes `f-*` / `fx-*` définies dans
`ficheCSS()`, **une seule palette à tenir**. Sans template, la fiche se rabat sur
les « à retenir » et reste utilisable — c'est le cas de `t1` et de `m1` séance 2.

**La partie adaptative** : les réponses rédigées **avec leur correction et les
conseils**, les recherches personnelles, les notes, le glossaire, et les tableaux
complétés (les saisies y sont **figées en texte** — sans quoi la fiche
embarquerait des formulaires vides).
**Sortent** : les bonnes réponses des QCM et « Sources des documents ».

Je n'ai **pas** déposé la maquette dans `_modeles/` : elle ferait doublon avec le
template et divergerait à la première retouche. C'est le §17 qui tient le modèle.

---

## 4 · Le prérequis bloquant — traité, mais à moitié

`progression.js` demandait `correction_ia` **en entier** pour le navigateur de
l'élève. Il n'en affiche que trois champs ; tout le reste — `tri.raisons`,
`a_verifier_par_le_prof`, `note_orthographe`, les constats critère par critère —
voyageait jusqu'à son appareil pour n'y jamais servir. Avec une fiche qui imprime
la correction, il l'aurait lu dans le code source de sa propre fiche.

C'est corrigé : sélection de sous-champs jsonb, puis ré-emboîtage côté client —
`rendreRetour()` et `rendreRenvoi()` n'ont pas bougé d'une ligne.

⚠ **Mais c'est de l'hygiène, pas un verrou**, et le brief le présentait comme la
solution. La policy RLS autorise l'élève à lire **sa** ligne, colonnes comprises :
qui forge sa requête récupère encore tout. Le verrou ne peut être que côté base,
et il bute sur un nœud réel — dans Supabase, l'élève et toi êtes **le même rôle
SQL**, `authenticated`. Un `REVOKE` vous frapperait tous les deux.

`bdd/schema/015-correction-eleve.sql` expose **trois voies** — deux colonnes
(≈ une demi-journée, la boucle de correction en jeu), une fonction `security
definer` pour chacun (plus léger, RPC à câbler des deux côtés), ou s'arrêter à
l'hygiène (coût zéro : ce sont ses propres données, le risque est pédagogique et
non un défaut de cloisonnement). **Le fichier n'exécute rien.**

---

## 5 · La dette de suivi

- `REPRISE.md` **réécrit** — il datait du 1ᵉʳ août et faisait repartir de travers.
  Vérifié dans le code avant réécriture : `t1` a bien **6** séances, **0** `div.step`
  vide, **0** bloc `.a-venir`, **71** `data-cle` uniques. Le point irréversible ne
  concerne plus que **`t3`→`t7`**.
- `ETAT-PROJET.md` — **onze passages** réécrits (les quatre lignes fausses, trois
  numéros d'étape restés en 5.x après la découpe, `v36`→`v38`, `19`→`18`, plus les
  lignes `m1` et moteur remises à l'état courant).
- **Repère `verifier.mjs` : 18.** L'`id="ri"` dupliqué du cahier est corrigé
  (le marqueur du corrigé « siJuste » s'appelle `ri-juste`). Restent 18 liens
  `cfa/outil-*` vers des fiches à imprimer pas encore écrites : **un seul motif**.
- `questions-snt.js` régénéré — « Google et Tokyo », et `REP-R1` existe.
- Les deux grilles orphelines (`NET-R-ville`, `NET-R4b`) sont **conservées et
  marquées**, pas supprimées : leur esprit de correction est du fond, il resservira.
- QR codes Kahoot et renommage des Kahoots → `IDEES.md`.

---

## 6 · Versions d'assets

`sequence-snt.css` et `.js` → **`?v=38`** (4 pages, hub compris).
`progression.js` → **`?v=16`** (24 fichiers, livret CFA compris).

---

## Ce que je n'ai pas fait, volontairement

- **Le bloc de chantier et les badges « à valider » restent en place** : le brief
  les retire « une fois tout appliqué **et validé par Loïc** ». Rien n'est validé.
  J'ai seulement corrigé la phrase devenue fausse — « le temps dépendra de ce qui
  est donné à faire à la maison » — remplacée par la règle du 23/08 : le module se
  fait **intégralement en classe**.
- **Les fiches des séances suivantes** (`m1` séance 2, les six de `t1`) : le
  mécanisme est en place et documenté, les schémas restent à produire — c'est le
  poste le plus lourd, une séance à la fois.
