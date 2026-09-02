# À lire — Ornement des encarts d'histoire · les fiches en PDF · 28/08/2026

Deux chantiers transverses, indépendants l'un de l'autre, aucun n'entre dans le
fond d'un chapitre.

---

## 🔴 Les trois points à savoir avant d'ouvrir quoi que ce soit

**1. Le chantier 1 sort du périmètre « seconde PC ».** L'ornement vit dans
`assets/css/chapitre-commun.css`, feuille partagée : la modification touche les
dix encarts des sept fichiers concernés, dont
`pages/term-es-t2-c1-deux-siecles-energie-electrique.html`, **qui n'est pas de la
seconde**. C'est voulu — l'ornement doit rester unique sur le site — mais cette
page est à relire au rendu comme les autres.

**2. Le parc de fiches a doublé pendant la session.** Au départ : `t1c2`, `t1c4`,
`o1`, `o2`. `o3` puis `o4` sont apparus en cours de route, avec leurs fiches. Les
six sont exportées et liées. Le script d'export **lit `fiches/`** au lieu de tenir
une liste : la prochaine fiche que tu écris sera prise en compte sans rien
déclarer.

**3. Ce que l'export a révélé, et que je n'ai pas touché.** Les six fiches
contiennent des caractères qu'**aucune de nos six familles de polices ne couvre** :
ils sortent du PDF dans le dessin d'une police système. C'est le même piège que le
fleuron du chantier 1, mais **sur du contenu** — donc c'est à toi. Détail au bas de
cette page.

---

## Chantier 1 — l'ornement des encarts « Histoire des sciences »

`❦` remplacé par **filet court + losange**, symétrique, tout en CSS : zéro glyphe,
zéro SVG, zéro image. Une seule règle réécrite dans la feuille commune ; aucune
page ne portait l'ornement en dur.

**Une correction au brief :** le caractère n'était pas `U+2767` mais **`U+2766`**.
Le constat, lui, était juste — il n'était dans aucune des vingt-deux polices
auto-hébergées.

**Deux écarts assumés par rapport au brief**, tous deux imposés par la mesure :

- **`text-align:center` est conservé** en plus de `justify-content:center`. Le
  brief demandait de le remplacer ; les deux ne font pas le même travail. À 390 px
  le libellé passe sur deux lignes, et sans `text-align` les deux lignes se
  collaient à gauche, laissant un grand vide face au losange de droite.
- **`print-color-adjust:exact` ajouté.** Filets et losanges sont des arrière-plans,
  là où le fleuron était du texte. Sans cette ligne l'ornement disparaît quand le
  navigateur n'imprime pas les graphiques d'arrière-plan.

**`chapitre-commun.css` passe en `?v=8`, dans les 17 fichiers** (16 pages + le
gabarit) — pas 14, comme le rappelle déjà la décision du 27/08.

### Ce qui a été vérifié, et comment

| Contrôle | Résultat |
|---|---|
| Plus aucun `❦` dans le dépôt | ✔ aucune occurrence |
| `?v=8` partout | ✔ 16 dans `pages/`, 1 dans `_modeles/` |
| `node verifier.mjs` | ✔ **18**, inchangé |
| Symétrie filet ↔ losange | ✔ **12,00 px de chaque côté**, mesuré au pixel sur capture |
| Alignement vertical | ✔ centre du losange à **0,22 px** de la médiane des capitales |
| Rendu 1200 px · 500 px · 390 px | ✔ dont le libellé sur deux lignes, losanges symétriques, jamais orphelins |
| Photocopie noir et blanc | ✔ PDF → niveaux de gris → seuil dur : filets et losanges survivent |
| Aucun autre sélecteur touché | ✔ la modification tient dans le bloc `.histoire .etq` |

---

## Chantier 2 — les fiches de 2nde PC passent en PDF

**Six fiches exportées** dans `assets/pdf/pc/fiches/`, **dix-sept liens basculés**,
aucun lien mort. Les fiches de SNT et de CFA n'ont pas été touchées.

| Fiche | Pages | Format | Qui imprime |
|---|---|---|---|
| `fiche-2nde-t1c2.pdf` | 10 | 209,9 × 297,0 mm | **toi**, et tu distribues |
| `fiche-2nde-t1c4.pdf` | 6 | 209,9 × 297,0 mm | **toi**, et tu distribues |
| `fiche-2nde-o1-ecriture-scientifique.pdf` | 2 | 209,9 × 297,0 mm | **l'élève** |
| `fiche-2nde-o2-chiffres-significatifs.pdf` | 2 | 209,9 × 297,0 mm | **l'élève** |
| `fiche-2nde-o3-securite-laboratoire.pdf` | 4 | 209,9 × 297,0 mm | **l'élève** |
| `fiche-2nde-o4-verrerie-materiel.pdf` | 2 | 209,9 × 297,0 mm | **l'élève** |

### Les deux libellés — propositions à valider

- **Chapitre** — « 📄 Télécharger la fiche de cours (PDF, vierge) », avec en
  dessous : *la feuille distribuée en classe, à compléter — disponible en
  permanence, code ou pas*. L'ancien texte disait « à imprimer » ; c'est toi qui
  imprimes, l'élève vient la **retrouver** (absent, malade, feuille perdue).
- **Outil** — « 🖨️ Fiche outil (PDF) — la méthode complète, à imprimer et à
  coller ». « Complète » parce qu'elle est sans trou, contrairement à celle d'un
  chapitre.
- **Hub PC** — « Fiche à imprimer (PDF) → ».

### La règle de production, écrite une fois pour toutes

🔴 **Le HTML est la source, le PDF est un export.** Un PDF corrigé à la main serait
écrasé au premier export suivant, et les deux divergeraient sans que rien ne le
signale. La règle est inscrite dans `CONSIGNES-chapitre-PC.md` §6 et dans
`CONSIGNES-outil-PC.md` §7.

    node exporter-fiches.mjs        toutes les fiches
    node exporter-fiches.mjs o3     seulement celle-là

Le script pilote Chrome par le protocole de débogage — c'est le seul moyen de faire
respecter le `@page size:A4` de la fiche ; « Ctrl+P → Enregistrer en PDF » sort du
**Letter** sans le dire. Il refuse de valider un export en écart :

- **format** `209,9 × 297,0 mm`, la signature d'un A4 non redimensionné ;
- **pagination** : une `.feuille` dans la source, une page dans le PDF. Une page de
  plus = du contenu qui a débordé. Pour les outils, le plafond de deux pages
  (quatre pour `o3`) est contrôlé en plus ;
- **polices incorporées**, et signalement des polices de repli.

**Un écart au brief :** le nombre de pages n'est pas figé fiche par fiche. La
source le dit déjà. C'est ainsi qu'on apprend que `t1c2` fait **10 pages** et
`t1c4` **6** — ce ne sont pas des débordements, ces fiches portent bien 10 et 6
`.feuille`. (`chapitres.md` annonçait « ~8 pages » pour `t1c2` : corrigé.)

**Ce qui ne change pas :** le QR code des fiches d'outils continue de pointer vers
la **page en ligne** de l'outil, pas vers le PDF — son intérêt est de ramener
l'élève aux exercices corrigés, qui ne sont pas sur la feuille.

---

## ⏳ Ce qui te revient

### 1. Les caractères servis par une police système

`node exporter-fiches.mjs` les liste à chaque export. **Six fiches sur six** sont
concernées. Trois cas, très différents :

| Cas | Exemples | Piste |
|---|---|---|
| **Exposants et indices Unicode** | `Na⁺` · `10⁻²⁷` · `C₆H₁₂` | passer par `<sup>` / `<sub>`, que nos polices savent composer |
| **Symboles** | `⩽` `⩾` `≈` `✓` `✗` `⚠` `⚙` `π` `Δ` `ρ` `↑` `↓` | remplacer (`≤`, `<=`), ou dessiner comme on vient de le faire pour le losange |
| **Libellés des planches SVG** de `o3` et `o4` | « Cheveux attachés », « Blouse en coton »… — **55 glyphes en Arial** dans `o3` | leur règle CSS demande pourtant `IBM Plex Sans`, et la police est bien chargée : ça ressemble à un **vrai défaut technique**, pas à un manque de glyphe |

C'est du **fond** : rien n'a été modifié. Le troisième cas est le plus visible sur
la feuille imprimée, et probablement le plus facile à régler.

### 2. Deux chiffres devenus faux dans `CLAUDE.md`

La croissance du catalogue d'outils les a périmés — je ne les corrige pas parce
qu'ils bougeront encore avec `o5`…`o8` :

- `assets/js/sequence-snt.js` / `sequence-snt.css` : la doc annonce **6 fichiers**,
  le dépôt en compte **9** (les 4 outils PC, `m1`, `t0`, `t1`, `t2`, le gabarit
  d'outil) ;
- `assets/js/progression.js` : la doc annonce **24 fichiers**, le dépôt en compte
  **30**.

Le `?v=` de ces assets partagés est à incrémenter dans **tous** ces fichiers, pas
dans le nombre annoncé.

### 3. `verifier.mjs` est à 21 en fin de session, et les 3 écarts sont à toi

Le repère est bien resté à **18** pendant les deux chantiers. Il est monté à 21
quand `pages/2nde-pc-o5-compte-rendu-tp.html` est apparu, en cours de session :

- **2 liens** vers `fiches/fiche-2nde-o5-compte-rendu-tp.html`, pas encore écrite ;
- **1 faux positif** : `verifier.mjs` lit la phrase « …charge pas
  `chapitre-commun.css`. C'est un LIEN, pas une ressource » (ligne 140, un
  **commentaire**) comme un chargement sans `?v=`, et conclut à une version
  incohérente. Sa regex ne distingue pas commentaire et balise. Pas corrigé : c'est
  ton fichier en cours, et le correctif appartient à `verifier.mjs`.

Quand la fiche d'`o5` existera : `node exporter-fiches.mjs` la prendra **sans rien
déclarer**, puis ses deux liens basculent vers le PDF.

### 4. Un fantôme dans `chapitres.md`

L'entrée **T1-C3** porte « Fiche : **proposée** (~6 pages) », mais aucune fiche
`t1c3` n'existe dans `fiches/`. Soit la ligne s'est décalée depuis T1-C2, soit la
fiche existe hors dépôt. Pas touché : je ne sais pas laquelle des deux.

---

## Fichiers touchés

**Chantier 1** — `assets/css/chapitre-commun.css` (une règle) · les 16 pages de
`pages/` + `_modeles/gabarit-chapitre.html` (`?v=8` seulement).

**Chantier 2** — `exporter-fiches.mjs` (nouveau) · `assets/pdf/pc/fiches/` (6 PDF,
nouveaux) · liens dans `2nde-pc-t1-c2`, `2nde-pc-t1-c4`, `2nde-pc-o1` à `o4`,
`2nde-physique-chimie`, `_modeles/gabarit-chapitre.html`,
`_modeles/gabarit-outil-PC.html` · `_modeles/CONSIGNES-chapitre-PC.md` §6 ·
`_modeles/CONSIGNES-outil-PC.md` §7.

**Suivi** — `DECISIONS.md` (2 décisions datées) · `ETAT-PROJET.md` · `JOURNAL.md` ·
`chapitres.md` · `MANIFESTE.md` · `CLAUDE.md`.
