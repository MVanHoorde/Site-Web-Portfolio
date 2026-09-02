# Relevé — T1-C3 « Constitution de l'atome »

> **Créé le 02/09/2026**, en application du lot D1 du brief d'audit
> `BRIEF-CLAUDE-CODE-T1C3-audit-2026-09-02.md`. Ce chapitre n'avait pas de
> relevé, contrairement à t3-c1, t3-c3 et t3-c4.
>
> Il inventorie **l'origine de chaque image du chapitre** et signale celles dont
> la provenance n'est pas certaine. Chaque ligne marquée ⚠ appelle une décision.

---

## 1. Figures — toutes maison, aucune dépendance externe

Les onze figures du chapitre sont des SVG produits pour le site. Aucune n'est
reprise d'une source tierce : **aucune attribution n'est due, et aucune licence
ne contraint leur réutilisation.** Sept ont été refaites le 02/09/2026.

| Fichier | Image | Origine | Refaite le 02/09 |
|---|---|---|---|
| `t1c3-fig-histoire-lignees.svg` | frise | maison | non |
| `t1c3-fig-modele-bohr.svg` | 1 | maison | **oui** — couches concentriques (D3), flèche partant du noyau, mêmes comptes des deux côtés |
| `t1c3-fig-ecriture-azx.svg` | 2 | maison | **oui** — légendes déplacées à gauche, plus aucune flèche ne croise le X |
| `t1c3-fig-noyaux-h-c14-be9.svg` | 3 | maison | **oui** — un seul rayon de nucléon, particules tangentes, viewBox recadré |
| `t1c3-fig-isotopes-grille.svg` | 4 | maison | **oui** — légendes remises dans le bon sens et sorties du tracé, notations A/Z construites |
| `t1c3-fig-abondances-plomb.svg` | 5 | maison | non — **validée par Loïc (D4)** |
| `t1c3-fig-charges-atome.svg` | 6 | maison | **oui** — noyau détaillé, couches, bilan Q(atome) = 0 restitué |
| `t1c3-fig-dimensions-football.svg` | 7 | maison | **oui** — noyau ramené à l'échelle, « 50 mètres » et bille de stylo restituées |
| `t1c3-fig-ion-lithium.svg` | 8 | maison | **oui** — lithium 7 (D2), départ de l'électron en zigzag |
| `t1c3-fig-element-fer.svg` | 9 | maison | **oui** — disposition en étoile, cuivre ajouté, notation A/Z construite |
| *(SVG inline)* | exercice 3 | maison | **oui** — 13 protons et 14 neutrons réellement dessinés |
| `t1c3-fig-classification-principe.svg` | *(ancienne Image 10)* | maison | **retirée de la page** — doublon du tableau périodique (arbitrage Q1). Le fichier reste sur disque, plus aucune page ne le référence. |

### ⚠ Le fichier `Isotope_CNO.svg` n'a pas été trouvé

Le lot D1 du brief prévoyait de remplacer la grille des isotopes par un fichier
`Isotope_CNO.svg` fourni par Loïc — auteur **Antonsusi**, Wikimedia Commons,
licence **CC BY-SA 3.0**, attribution obligatoire et visible.

**Ce fichier n'est nulle part dans le dépôt.** La grille maison a donc été
conservée et refaite : elle porte déjà le carbone, l'azote et l'oxygène, soit
exactement le contenu annoncé par le nom du fichier attendu.

**Conséquence favorable :** aucune attribution CC BY-SA n'est due, et le
`data-origine` que le brief demandait de poser sur la `<figure>` n'a pas lieu
d'être. Si tu veux malgré tout la figure de Wikimedia, dépose-la dans
`assets/img/pc/2nde-pc-t1-c3/` et signale-le : l'attribution devra alors
apparaître dans la légende, et non seulement dans un attribut.

---

## 2. ⚠ Photographies — origine à confirmer

Treize fichiers JPEG, tous **antérieurs à cet audit**, dont l'origine n'est
documentée nulle part dans le dépôt. Ce sont les seules images du chapitre qui
posent une question de droits.

| Fichier | Sujet | Ce qu'il faut vérifier |
|---|---|---|
| `t1c3-atomium.jpg` | l'Atomium de Bruxelles | ⚠ **le plus sensible** : l'Atomium est une œuvre architecturale **encore protégée** (André Waterkeyn, mort en 2005), et la Belgique n'a pas de liberté de panorama étendue à l'usage commercial. Un usage pédagogique non commercial est en principe toléré, mais l'origine du cliché reste à établir. |
| `t1c3-portrait-democrite.jpg` · `-aristote.jpg` | bustes antiques | photographies d'œuvres du domaine public : c'est **le cliché** qui porte un droit, pas le buste. Origine à établir. |
| `t1c3-portrait-lavoisier.jpg` · `-dalton.jpg` · `-mendeleiev.jpg` | portraits peints ou gravés | œuvres du domaine public ; même remarque sur le cliché. |
| `t1c3-portrait-curie.jpg` · `-thomson.jpg` · `-rutherford.jpg` · `-chadwick.jpg` · `-bohr.jpg` · `-debroglie.jpg` · `-schrodinger.jpg` | photographies de savants | ⚠ **le point à regarder en premier** : ces clichés datent du XX<sup>e</sup> siècle et peuvent être encore protégés selon le photographe et le pays. |

**Ce qu'il reste à faire, et qui t'appartient :** dire d'où viennent ces treize
fichiers. Si ce sont des reprises de Wikimedia Commons, la fiche de chaque
fichier donne l'auteur et la licence, et il suffit alors de les reporter ici puis
en `data-origine` sur chaque `<img>`. Aucun de ces fichiers n'a été touché par
l'audit du 02/09.

---

## 3. Ce que l'audit du 02/09/2026 a corrigé sur le fond

Chaque correction de physique est tracée dans la page par un commentaire
`<!-- SOURCE → CORRIGÉ · … -->`. Repérage : `grep -n "SOURCE → CORRIGÉ" pages/2nde-pc-t1-c3-constitution-atome.html`

| Lot | Ce que disait la page | Ce qu'elle dit | Pourquoi |
|---|---|---|---|
| **A3** | la médaille du bandeau de frise dessinait deux ellipses croisées | deux cercles concentriques, noyau et électrons | des ellipses croisées figurent le modèle de **Rutherford** ; le bandeau annonce celui de **Bohr** (D3) |
| **E2** | exercice 6 : « ≈ 1833 » | **≈ 1,83 × 10³** | quatre chiffres significatifs tirés de données qui en portent trois (D4) |
| **F3** | exercice 9 : 2,7234 × 10⁻¹⁸ C | **2,723 × 10⁻¹⁸ C** | cinq chiffres significatifs à partir d'une donnée qui en porte quatre (D4) |
| **G2** | exercice 10 : balle de tennis → 6,4 km | **bille de stylo (0,50 mm) → 1,0 × 10² m** | l'énoncé contredisait le terrain de football de l'Image 7 ; la source 2025/2026 portait déjà la bonne donnée **dans sa figure** (D1) |
| **H2** | lithium à 3 neutrons | **4 neutrons — lithium 7** | la source enseignait le lithium 7 en diapositive 4 mais en dessinait 3 en diapositive 10 ; la page avait suivi la mauvaise version (D2) |
| **I3** | exercice 12 : l'ion F²⁻ | **le difluor F₂** | F²⁻ n'existe pas, le fluor ne forme que F⁻ (D5) |

---

## 4. Reste à ta main

- **L'origine des treize photographies** (§2). C'est le seul point qui engage
  autre chose que de la mise en forme.
- **Le fichier `Isotope_CNO.svg`** : à déposer si tu tiens à la figure de
  Wikimedia plutôt qu'à la grille maison (§1).
- **Les compétences `ds2` et `ds3`** partagent des références de manuel
  identiques (`man. 15 p.81 | 22 p.83`) : c'est la seule duplication stricte de
  tout le site. Une répartition des quatre exercices entre les deux compétences
  reste à trancher.
- **La fiche élève** : bloquée jusqu'à ta validation de la page.
