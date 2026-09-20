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

## 2 · 🔴 Trois figures manquent

Chacune est un **cadre de réservation** visible sur la page : le nom de fichier
attendu et ce qu'il faut y voir y sont écrits. L'intégration se réduira à
remplacer la balise.

| ID | Fichier attendu | Ce qu'il faut y voir | Où |
|---|---|---|---|
| **O4-04** | `o4-fiole-jaugee-photo.jpg` | Une fiole jaugée avec un **unique trait de jauge** sur le col — surtout pas une échelle graduée — et les inscriptions lisibles (volume, `20 °C`, tolérance). | page O4, étape 1.1 |
| **O5-02** | `o5-schema-bon-mauvais.png` | Deux schémas du **même** montage côte à côte. À gauche le bon : tracé à la règle, à plat, légendé horizontalement, avec un titre. À droite le mauvais : perspective, ombré, sans légende ni titre. | page O5, étape 1.2 |
| **O5-04** | `o5-copie-annotee.png` | Un extrait de compte rendu manuscrit annoté en **trois couleurs** : observation, interprétation, conclusion, chacune étiquetée en marge. | page O5, étape 1.3 |

Contraintes : fond blanc, pièce entière, ≥ 800 px de haut pour O4 ; ≥ 1000 px de
large pour O5. Déposer dans `_a-deposer/o4/` ou `o5/`.

🔴 **Deux d'entre elles ont déjà échoué une fois.** Les images générées pour la
fiole jaugée et pour le verre à pied portaient des **échelles fausses** — « 70 »
et « 300 » écrits deux fois. Sur une image d'instrument gradué, **vérifier
l'échelle avant tout le reste** : un pictogramme faux est une erreur de cours.

### Les deux prompts à rejouer

🔴 **La cause des deux échecs est la même : on a laissé le modèle écrire une
échelle.** Un modèle d'image ne compte pas ; il dessine ce qui *ressemble* à une
graduation. Les deux prompts ci-dessous lui retirent ce travail : on énumère les
chiffres un par un, ou on lui demande de n'en écrire aucun.

**Fiole jaugée** — fichier attendu `o4-fiole-jaugee-photo.jpg` :

> Fiole jaugée de laboratoire en verre transparent, fond blanc, style
> photographique professionnel. Corps en forme de poire, long col étroit et
> **parfaitement lisse**. ⚠ **Le col ne porte AUCUNE graduation, AUCUNE échelle,
> AUCUN chiffre le long du col** — uniquement **un seul et unique trait de
> jauge**, un fin anneau horizontal gravé à mi-hauteur du col. Bouchon rodé en
> verre. Inscriptions gravées sur la panse, sur trois lignes seulement :
> « 100 mL », « 20 °C », « ±0,10 mL ». Aucun autre texte, aucun autre chiffre.

**Verre à pied gradué** — fichier attendu `o4-verre-a-pied-photo.jpg` :

> Verre à pied de laboratoire en verre transparent, fond blanc, style
> photographique professionnel. Cône largement évasé vers le haut — **l'ouverture
> est plus large que le cône n'est haut** — bec verseur sur le bord, tige très
> courte, large pied circulaire. ⚠ **Échelle graduée portant EXACTEMENT ces six
> nombres, de bas en haut, chacun une seule fois : 50, 100, 200, 300, 400, 500.**
> Aucun nombre répété, aucun autre chiffre. Mention « mL » en haut de l'échelle.
> Ce n'est **pas** un verre à vin ni un verre à cocktail.

💡 **Si l'échelle sort encore fausse :** la demander **sans aucun chiffre**, avec
les seuls traits. Le schéma au trait de la page n'en porte pas et reste juste ;
une photo sans chiffres vaut mieux qu'une photo qui en invente.

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

---

## 7 · La passe du 20/09 au soir — ce qui a changé sur O4

Demandes de Loïc après relecture de la page.

### Ce qui est fait

| | |
|---|---|
| 🔴 **Le verre à pied n'en était pas un** | Le schéma dessinait un **verre à vin** : cône étroit, longue tige. Refait d'après la photo déposée — cône **1,4 fois plus large que haut**, bec verseur, graduations, tige courte, pied large. Le symbole étant partagé, la correction vaut **partout** dans la page. |
| 🔴 **La coupelle avait la taille d'un cristallisoir** | 40 unités contre 44 : une soucoupe de 5 cm affichée comme un récipient de 15. Ramenée à 24, et reposée sur la ligne de base. |
| 🔴 **La figure 3 était une image générée** | Elle portait les deux erreurs ci-dessus **sans qu'on puisse les corriger**. Remplacée par une **planche construite à partir des mêmes schémas que les vignettes de l'étape 1.1** : une correction faite une fois vaut partout, la planche se reflow sur téléphone, elle suit le thème, et ses noms sont sélectionnables. |
| ✅ **Figure O4-05 résolue** | Les **trois pipettes jaugées** sont intégrées, en grand, avec le texte qui explique « à un trait / à deux traits ». |
| ✅ **L'œil de l'exercice 2** | Le pictogramme en losange est remplacé par l'œil en coupe déposé à 15 h 09, détouré sur fond transparent. Il regarde déjà vers l'éprouvette : rien à retourner. |
| ✅ **Agrandir les images au clic** | Les **34 images** de la page s'agrandissent au clic — et à la touche Entrée. Le moteur a bien un zoom, mais il ne vise que `figure.ill img` et n'est pas atteignable au clavier ; le §5 interdisant d'y toucher, l'appoint est **local à la page**. 16 contrôles au navigateur, tous passés. |
| ✅ **Les QCM** | Quatre petits QCM dans la méthode (étapes 1.1, 1.3, 1.4, 1.5 — seule 1.2 en avait un) et un **QCM bilan de 20 questions** en étape 2.7. **48 questions** sur la page. Positions des bonnes réponses rééquilibrées (le bilan est à 5/5/5/5) et aucun biais de longueur. |

### 🔴 Un désaccord à trancher — les pipettes jaugées

La passe du matin avait **écarté** cette image, pour deux motifs : « deux portent
25 ml » et « le second trait n'est pas lisible ». **Elle a été intégrée le
soir**, et voici pourquoi :

- les **deux « 25 ml » ne sont pas un défaut, c'est le sujet** : ce sont deux
  pipettes de même volume, l'une **à un trait**, l'autre **à deux traits**. Les
  mettre côte à côte est exactement ce que la page enseigne ;
- le second trait est **fin mais présent**, et il devient lisible avec
  l'**agrandissement au clic** — qui n'existait pas ce matin ;
- les **tolérances inscrites sont justes** (± 0,02 à 10 mL, ± 0,03 à 25 mL, les
  valeurs normalisées de classe A), et **aucune échelle** n'y figure — donc aucun
  risque de l'erreur qui a fait écarter la fiole et le verre à pied.

**À trancher :** on garde, ou on redemande une image où le second trait est plus
marqué ?

### 🔴 Ce que cette passe a appris sur les métadonnées

Le marqueur de provenance de ces images **n'est pas dans le XMP**. C'est un
manifeste **C2PA** (*Content Credentials*), en CBOR dans un segment JUMBF,
**signé et lié au contenu par un hash**. Conséquence : **aucune transformation
ne le préserve**, pas même un recadrage, et le recopier sur une image modifiée
serait trompeur — il attesterait d'un contenu qui a changé.

La règle est donc plus précise que « ne pas effacer les métadonnées » : une image
qu'il faut transformer se transforme, et **l'original intact reste dans le
dossier** à côté d'elle, suffixé `-source`. C'est ce qui a été fait pour l'œil
(`o4-oeil-coupe-source.jpg`). Les pipettes, elles, sont une **copie à
l'identique** : leur manifeste est intact. Détail dans le `CREDITS.md` du dossier.
