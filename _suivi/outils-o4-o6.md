# Outils O4, O5, O6 — ce qui reste à faire

> **Le fichier à ouvrir pour reprendre ce chantier.** Il décrit l'**état
> courant** : ce qui manque, ce qui est en attente d'un arbitrage, et le tri du
> dossier tampon. Le récit de la session vit dans `JOURNAL.md` (20/09/2026), les
> décisions dans `DECISIONS.md` (bloc du 20/09).
>
> Chantier mené le 20/09/2026 depuis le rapport d'audit « Audit et cahier des
> charges des fiches méthode O4, O5, O6 » et son brief compagnon.

---

## 0 · Où en sont les trois outils

Les trois pages et les trois fiches A4 sont **en ligne et à jour**, et les fiches
tiennent chacune en **deux pages exactement** — contrôle : `node exporter-fiches.mjs`.

✅ **Les huit outils de 2nde PC sont ouverts** depuis le 20/09 : O6 par ce
chantier, O7 et O8 par celui qui les a refondus le même jour. Plus aucun outil
n'est hors d'atteinte depuis l'accueil.

🔴 **Les quatre figures manquantes ne bloquent pas la mise en ligne** — choix de
Loïc le 20/09 : les pages sont publiées pour que **les collègues puissent les
voir**, les cadres de réservation restent visibles en attendant les images, et
les élèves n'y sont pas envoyés pour l'instant.

Ce qui suit est ce qui **manque encore**, par ordre de ce que ça coûte.

---

## 1 · 🔴 Le mot aux collègues — à envoyer

Règle du 19/09 : un contenu qui devient utilisable arrive aux collègues dans la
même livraison. Le lien, le guide et le PDF sont faits ; **il reste l'envoi**.

Destinataires : **CASTEL** et **HUSSON** (AP de physique-chimie).
Pièce jointe : `assets/pdf/prof/guide-ap.pdf`.

> Bonjour,
>
> **Les huit outils de méthode sont maintenant en ligne**, pour l'AP de seconde.
> Les trois derniers viennent de s'ouvrir :
>
> - **6 — Présenter un calcul** : les cinq étapes qu'on attend dans une rédaction
>   (extraire et convertir, poser la formule en lettres, l'isoler, l'appliquer,
>   conclure par une phrase), avec **dix exercices corrigés** — dont une série
>   entière sur les conversions qui piègent et une copie d'élève à corriger.
> - **7 — Manipuler une relation algébrique** : isoler une grandeur avec une seule
>   méthode, celle des maths, et **71 relations** classées par structure, toutes
>   corrigées ligne par ligne.
> - **8 — Construire et exploiter un graphique** : axes, droite moyenne,
>   coefficient directeur avec son unité, origine forcée ou non, interpoler et
>   extrapoler. Deux pages sœurs prolongent la méthode au **tableur** et à la
>   **calculatrice**.
>
> Chacun a sa fiche A4 à imprimer.
>
> Les outils 4 (la verrerie) et 5 (le compte rendu de TP) ont aussi été
> complétés : chaque pièce de verrerie y est maintenant en photo à côté de son
> schéma, et le compte rendu gagne le tableau de mesures et la comparaison à une
> valeur de référence.
>
> Le guide de l'AP est à jour, il est joint.
>
> Bonne journée,
> Loïc

---

## 2 · 🔴 Quatre figures manquent

Chacune est un **cadre de réservation** visible sur la page : le nom de fichier
attendu et ce qu'il faut y voir y sont écrits. L'intégration se réduira à
remplacer la balise.

| ID | Fichier attendu | Ce qu'il faut y voir | Où |
|---|---|---|---|
| **O4-04** | `o4-fiole-jaugee-photo.jpg` | Une fiole jaugée avec un **unique trait de jauge** sur le col — surtout pas une échelle graduée — et les inscriptions lisibles (volume, `20 °C`, tolérance). | page O4, étape 1.1 |
| **O4-05** | `o4-pipette-jaugee-photo.jpg` | Une pipette jaugée **à deux traits**, les deux visibles : l'un au-dessus du renflement, l'autre près de la pointe. | page O4, étape 1.1 |
| **O5-02** | `o5-schema-bon-mauvais.png` | Deux schémas du **même** montage côte à côte. À gauche le bon : tracé à la règle, à plat, légendé horizontalement, avec un titre. À droite le mauvais : perspective, ombré, sans légende ni titre. | page O5, étape 1.2 |
| **O5-04** | `o5-copie-annotee.png` | Un extrait de compte rendu manuscrit annoté en **trois couleurs** : observation, interprétation, conclusion, chacune étiquetée en marge. | page O5, étape 1.3 |

Contraintes : fond blanc, pièce entière, ≥ 800 px de haut pour O4 ; ≥ 1000 px de
large pour O5. Déposer dans `_a-deposer/o4/` ou `o5/`.

🔴 **Deux d'entre elles ont déjà échoué une fois.** Les images générées pour la
fiole jaugée et pour le verre à pied portaient des **échelles fausses** — « 70 »
et « 300 » écrits deux fois. Sur une image d'instrument gradué, **vérifier
l'échelle avant tout le reste** : un pictogramme faux est une erreur de cours.

---

## 3 · ⏳ Les arbitrages en attente

**a. ~~`o7` atteignable sans être ouvert~~ — réglé le 20/09.** Les outils **7 et 8
sont ouverts** au hub, sur décision de Loïc, après la refonte menée par l'autre
chantier du même jour (commit `ddfaee0`). Les **huit outils** sont donc en ligne,
`guide-ap.html` le dit et ses PDF sont régénérés. Les pages sœurs `o8b` (tableur)
et `o8c` (calculatrice) **ne figurent pas au hub** à dessein : on n'y entre que
depuis O8, qui est leur prérequis affiché.

**b. La frise des huit rubriques de O5.** Le brief demandait de scinder
« protocole » et « expérience » en deux rubriques. La frise vient du document
d'une collègue, et la décision O-27 inscrite dans la page interdit d'ajouter une
rubrique : la distinction a donc été portée par le **texte** de l'étape 1.2.
**À confirmer par Loïc** — ou à rouvrir avec la collègue concernée.

**c. Les tolérances chiffrées de la verrerie.** Elles viennent de sources fiables
mais **non institutionnelles** (fabricants, sites universitaires). Elles sont sur
la page O4 en « pour aller plus loin », non exigibles. **À recouper avec les
inscriptions de la verrerie réelle du lycée** avant d'y accorder plus de place.

---

## 4 · Ce qui n'a pas tenu sur le papier

Les fiches A4 sont calibrées à deux pages. Deux contenus sont restés **en ligne
seulement**, faute de place :

- le **tableau de mesures rempli** de O5 — seules ses règles sont sur la fiche ;
- les **tolérances de classe A** de O4 — non exigibles, donc non prioritaires.

Si l'un des deux devient nécessaire sur le papier, il faudra retirer autre chose :
le resserrement des espacements a déjà été poussé à sa limite de lisibilité
(police du verso à 95 % sur O5, 96 % sur O4). **Ne pas descendre plus bas.**

---

## 5 · Tri du dossier tampon `_a-deposer/o4/`

Rendu le 20/09/2026. **Les 44 fichiers sont traités : le dossier peut être vidé.**

### UTILISÉ — intégré (35)

Tous copiés dans `assets/img/pc/2nde-pc-o4/`, renommés à la convention, et
inscrits dans le `CREDITS.md` du dossier, qui est la source de vérité.

| Ce qui a été déposé | Devenu |
|---|---|
| ChatGPT Image 20 sept. | `o4-menisque-parallaxe.png` — **figure 1** de la page |
| Balance de précision | `o4-balance-photo.jpg` — **figure 2** |
| Schéma de verrerie (8 éléments au trait) | `o4-planche-schemas-trait.jpg` — **figure 3** |
| Vue de paillasse, dilution 2nde | `o4-paillasse-dilution.jpg` — **figure 4** |
| 5 vues de paillasse (reflux, extraction, Büchner, titrage, calorimétrie) | `o4-paillasse-*.jpg` — **figures 5 à 9**, bloc bonus dépliable |
| Bécher, erlenmeyer, éprouvette, burette, ampoule à décanter, ballon, tube à essai, cristallisoir, coupelle, entonnoir, réfrigérant, propipette | vignettes de l'étape 1.1, à côté de leur schéma |
| Chauffe-ballon, support élévateur, potence, spatule | vignettes de l'étape 1.4 |
| Pissette, agitateur magnétique, verre de montre, pince en bois, thermomètre, compte-gouttes, pipettes Pasteur | vignettes de l'étape 1.4, famille « matériel courant » |
| 3 planches de cartes pédagogiques | `o4-cartes-*.jpg` — **rangées, non publiées** : elles répétaient mot pour mot les grilles de la page, et les fiches portent déjà leurs propres schémas |

Les photos d'objets isolés ont été **recadrées sur leur sujet** : plusieurs
n'occupaient qu'une fraction de leur carré et devenaient illisibles en vignette.
Le marqueur de provenance a été réinjecté et **vérifié fichier par fichier**.

### NON UTILISÉ (9)

| Fichier brut | Raison |
|---|---|
| Fiole jaugée | **erreur de cours** — col entièrement gradué (40 → 100) au lieu d'un trait unique, et « 70 » deux fois. À refaire, voir §2. |
| Verre à pied gradué (dépôt de 10 h 53) | **erreur de cours** — l'échelle lit 50, 100, 200, 300, **300**, 400, 500. |
| Verre à pied « conique inversée » | ce n'est pas un verre à pied de laboratoire mais un verre à cocktail. |
| Trois pipettes jaugées | deux portent « 25 ml » ; le second trait n'est pas lisible. Les tolérances inscrites (± 0,02 et ± 0,03) sont en revanche exactes. |
| Pipeteur_46418002 | pipeteur à molette — ce n'est pas la propipette à trois valves du cours. |
| Réfrigérant à serpentin · « AUTRE VERRERIE » (1) · thermomètre stylo · éprouvette hexagonale | doublons. |

### Les autres dossiers tampon

`ds/`, `es1/`, `fiches-outils/`, `fiches-t3c1/`, `o3/` traînent depuis des
chantiers antérieurs et **n'ont pas été triés** — ils sortent du périmètre de
cette session. Le dossier doit pouvoir être vide entre deux chantiers.

---

## 6 · Ce que ce chantier a laissé dans l'outillage

- `verifier.mjs` contrôle désormais que **toute image de `assets/img/**` est
  nommée dans le `CREDITS.md` de son dossier**. Il signale en vigilance les
  **31 dossiers d'images sans `CREDITS.md`** — à combler au fil des reprises.
- 🔴 **Pas de plafond de 480 000 pixels** : cette limite est une clause de la
  licence **Canva**, et aucune image du dépôt n'en vient. Le jour où une ligne
  `canva-design` apparaîtra dans un `CREDITS.md`, c'est dans ce contrôle qu'il
  faudra l'ajouter — son commentaire le dit.
- 🔴 **Ne jamais effacer les métadonnées** des images de `2nde-pc-o4/` : elles
  portent le marqueur de provenance « image générée par IA ». Pas de
  `convert -strip`, pas d'`oxipng -strip all`. Le recadrage, lui, les préserve.
