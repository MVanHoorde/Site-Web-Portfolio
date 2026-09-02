# À lire — Outils transversaux PC, lot 1

**Quatrième famille du dépôt.** Deux outils produits de bout en bout, plus les
consignes durables. Écrit le 25/08/2026, **repris le 26/08 sur le fond des PDF
sources**. Tout le contenu pédagogique est une **proposition V1, non validée**.

---

## Ce qui est fait

| Fichier | |
|---|---|
| `pages/2nde-pc-o1-ecriture-scientifique.html` | 🆕 Outil 1 — page écran |
| `fiches/fiche-2nde-o1-ecriture-scientifique.html` | 🆕 Outil 1 — fiche A4, **2 pages exactement** |
| `pages/2nde-pc-o2-chiffres-significatifs.html` | 🆕 Outil 2 — page écran |
| `fiches/fiche-2nde-o2-chiffres-significatifs.html` | 🆕 Outil 2 — fiche A4, **2 pages exactement** |
| `pages/2nde-physique-chimie.html` | ✏️ famille « Outils transversaux », avant le thème 1 |
| `_modeles/CONSIGNES-outil-PC.md` | 🆕 les conventions durables, autonomes |
| `MANIFESTE.md` · `CLAUDE.md` | ✏️ la famille y est inscrite |
| `_suivi/ETAT-PROJET.md` · `DECISIONS.md` · `chapitres.md` · `JOURNAL.md` | ✏️ suivi à jour |

**Aucun asset partagé n'a été touché** — ni `sequence-snt.js`, ni
`sequence-snt.css`, ni `progression.js`, ni `chapitre-commun.css`. Aucune
migration de base. Aucun `?v=` incrémenté.

---

## 🔴 Le point à trancher en premier : les zéros de fin d'un entier

**Tes sources ont rouvert la question**, et plus sérieusement que je ne le
croyais le 25.

La fiche du collègue **affirme** deux choses :

> « Les zéros situés à gauche du nombre ne sont pas significatifs, **ceux situés
> à droite le sont**. »
> « **50 n'a que deux chiffres significatifs** alors que 6,20 en a 3. »

Appliquée à la lettre, cette règle donne **`100` → 3 chiffres significatifs**.
Or le brief demandait, à l'exercice 2, **`100` → 1 chiffre, l'écriture étant
ambiguë**.

**La contradiction n'est pas dans l'outil : elle est entre la fiche du collègue
et le brief.** Trois issues, et c'est du fond — donc à toi :

| | Ce qu'on écrit | Ce que ça coûte |
|---|---|---|
| **1 · suivre la source** | les zéros de fin comptent&nbsp;: `50` → 2, `100` → 3 | l'exercice 2 perd sa raison d'être, et l'argument le plus fort en faveur de l'outil 1 disparaît |
| **2 · suivre le brief** | les zéros de fin d'un entier sont ambigus&nbsp;: `100` → 1, donc `50` → 1 | l'exemple `6,20 ÷ 50 = 0,12` de la source ne tient plus (il donnerait `0,1`) |
| **3 · ce que tient la V1** | l'ambiguïté est **nommée** et devient la leçon&nbsp;: elle justifie l'écriture scientifique. `50` reste à 2 chiffres *parce que l'énoncé le pose comme une mesure*&nbsp;; `100`, sans contexte, reste ambigu | **nuance une affirmation du collègue** — or la règle du dépôt est « on refait la forme, jamais le fond » |

La V1 tient la troisième, et le compteur de l'étape 1.1 montre l'ambiguïté en
orange, troisième couleur à côté de « compté » et « ne compte pas ». **Dis-moi
si je la garde.**

---

## Ce que les sources ont ajouté à `o1` et `o2`

Du fond du collègue qui manquait — c'est le principal apport du 26/08.

| # | Ajout | Pourquoi ça compte |
|---|---|---|
| **1** | **Les quatre règles de calcul sur les puissances de dix** : `a·10^m × b·10^n = ab·10^(m+n)`, `(a·10^m)/(b·10^n) = (a/b)·10^(m−n)`, `1/aⁿ = a⁻ⁿ`, `(a·10^m)ⁿ = aⁿ·10^(m·n)` | Elles **prouvent** ce que la V1 se contentait d'affirmer. La troisième explique le `10⁻²` du `g·cL⁻¹` — celle qu'on oublie ; la quatrième explique le ×3 des volumes |
| **2** | **La conversion vers un préfixe** (et non vers l'unité de base) : « le + devient −, le − devient + », avec ses quatre exemples | La V1 ne traitait que le trajet vers l'unité de base. Un tiers des conversions de ta fiche d'exercices relèvent de ce cas |
| **3** | **Les trois équivalences de volume** (`1 dm³ = 1 L`, `1 m³ = 1000 L`, `1 cm³ = 1 mL`, « retenir une seule des trois ») et le **tableau qui aligne** m³/dm³/cm³/mm³ sur kL…mL | Le litre tombe sous le dm³, le mL sous le cm³ : c'est la règle du facteur 3 lue dans l'autre sens |
| **4** | **`003,20`** — le seul nombre qui porte les **deux** familles de zéros à la fois | Ceux de gauche s'effacent sans rien changer, celui de droite non. Un seul nombre au lieu de deux exemples séparés |
| **5** | **L'incertitude relative `ΔA/A`**, et la **seconde** façon d'estimer `ΔA` : la demi-unité du dernier rang **affiché** sur un appareil à écran | La V1 ne donnait que la demi-graduation d'un instrument gradué. Et surtout : `± 1 g` est dérisoire sur un sac de ciment, catastrophique sur un comprimé — c'est le **rapport** qui mesure la précision |

**Ce que ça a coûté sur la fiche A4 de `o1`** : la table des dix-huit repères
d'échelle, ajoutée le 25, est réduite à ses **trois bornes** (atome · toi ·
Terre). Elle est marquée ○ support à l'écran, où la frise reste entière et bien
plus lisible qu'une table ; les quatre règles de calcul, elles, sont ★★. **Le
fond passe avant le support.** Si tu préfères l'inverse, c'est une ligne à
changer.

---

## Cinq erreurs de calcul dans les documents sources — à signaler à l'équipe

Toutes recalculées en fractions exactes, pas au flottant.

| Document | Ce qui est écrit | Ce qui est juste |
|---|---|---|
| `(correction)_Convertir`, ligne `379,45 kW` | `= 358 × 10³ W = … = 3,58 × 10⁻⁴ GW` — les valeurs de la ligne précédente ont été recopiées | **`3,7945 × 10⁻⁴ GW`** |
| `(correction)_Convertir`, ligne `5933 dag·cm⁻³` | Le **résultat final est juste** (`5,933 × 10¹⁸`), mais **toutes les lignes intermédiaires sont fausses** : le corrigé prend `1 dag = 10² g` au lieu de `10¹`. Une seconde erreur, plus loin, ramène par hasard au bon résultat | Lignes justes : `5,933×10⁴ g·cm⁻³` → `5,933×10⁶ cg·cm⁻³` → `5,933×10¹² cg·m⁻³` → `5,933×10¹⁸ cg·hm⁻³`. **Un élève qui suit ligne à ligne est perdu** |
| `(correction)_Convertir`, ligne `0,98 m·s⁻¹` | `= 3,528 km·h⁻¹` — **quatre** chiffres significatifs pour une donnée qui en a **deux** | **`3,5 km·h⁻¹`**. Les deux fiches du même auteur se contredisent, et c'est précisément ce que l'outil 2 sert à empêcher |
| `(correction)_Manipuler…`, niveau 1 | `a = b/c` donne `c = b/c` | `c = ` **`b/a`** |
| `(correction)_Manipuler…`, niveau 5 | `d − e = R` donne `e = R − d` | `e = ` **`d − R`** — le signe est inversé |

*(Le brief lui-même annonçait « 47 ordres de grandeur » pour le piège de la
calculatrice ; c'est **46** — `22 − (−24)`. Corrigé dans l'outil.)*

---

## Deux arbitrages avant que je lance le lot 2

Le brief **résume** tes sources, il ne les remplace pas — et sur deux points il
s'en écarte.

**1 · Le tri de la verrerie (`o3`).** Le brief demande deux colonnes,
« **précise** » (fiole jaugée, pipettes, burette) contre « **usage courant** »
(bécher, erlenmeyer, éprouvette, tube à essai). Ta fiche, elle, trie autrement :

- **Pour contenir** — bécher, erlenmeyer, tube à essai, fiole jaugée, verre à
  pied, cristallisoir, coupelle de pesée, ballon
- **Pour mesurer un volume** — éprouvette graduée, pipette graduée, pipette
  jaugée, propipette, burette
- **Autre** — entonnoir, ampoule à décanter, réfrigérant
- **Autre matériel** — chauffe-ballon, support élévateur, potence

…la précision n'étant qu'une **sous-mention** de chaque pièce (« précision
moyenne », « très bonne précision », « les graduations ne sont pas assez précises
pour mesurer un volume »). Ce n'est pas le même classement. **Lequel je suis ?**

**2 · Le nombre de niveaux (`o4`).** Le brief parle des « trois niveaux de la
fiche source ». Ta fiche en compte **cinq**, chacun avec son titre de ta main —
le cinquième s'appelle *« Je ne comprends même pas pourquoi je suis du côté des
élèves… Laissez-moi l'estrade ! »*. Les niveaux 4 et 5 ajoutent
`√(b−d²)/c`, `10^(b−d)/√c` et `log(a/b) = ∛(c/(d−e)²)`. **Trois ou cinq ?**

---

## Les quatre outils réservés ont maintenant leur source

`fiche_Convertir` → **o5** · `fiche_Présenter un calcul` → **o6** ·
`fiche_Construire un graphique` → **o7** · `Fiche_guide - Rédiger un TP` →
**o8**. Rien produit : ils attendent ta commande.

⚠ **Un point à connaître pour plus tard.** `fiche_Présenter un calcul` donne
**ta** méthode de rédaction d'un calcul, en huit temps. Elle recouvre les quatre
règles du livret CFA que j'ai retenues, plus deux choses : la **conversion en
unités SI** et l'**attribution d'un symbole** à la grandeur cherchée. Le jour où
`o6` est commandé, c'est elle qui fera référence — et il faudra décider si `o1`
et `o2` s'y alignent.

*(`fiche_La dissolution` ne correspond à aucun outil : c'est du contenu de
chapitre, `T1-C5`. Son encadré sur le **ménisque** est en revanche celui que le
brief demandait de reprendre dans `o3`.)*

---

## Ce qui a coûté le plus cher, côté technique

**Le moteur a été conçu pour des mots, et sa normalisation efface le signe
moins** : `10^-3` et `10^3` y sont indistinguables. Un élève qui oublie le signe
de l'exposant — l'erreur même que l'outil sert à corriger — aurait été compté
juste, en vert, sans rien voir. D'où le menu déroulant pour le signe, et la table
de saisie à trois colonnes qui structure les deux outils. Les mesures sont dans
`DECISIONS.md` (M-1 à M-3), les contournements dans les consignes.

Trois pièges d'outillage, notés une fois pour toutes : `.res` existait déjà dans
la feuille partagée en `display:flex` · `verifier.mjs` lit jusqu'aux commentaires
HTML · le mode headless de Chrome met en page à 500 px minimum, si bien qu'une
capture demandée à 390 px **rogne** au lieu de replier.

---

## Contrôles passés

| Contrôle | Résultat |
|---|---|
| `node verifier.mjs` | **18 problèmes avant, 18 après** — les 18 liens `cfa/outil-*` attendus |
| Versions d'assets | alignées : `sequence-snt.css?v=41` · `sequence-snt.js?v=41` |
| Assets partagés modifiés | **aucun** |
| Banc d'essai `o1` | **16 assertions, 0 échec** — curseur exact sur toute la plage, signe d'exposant faux refusé, exposant faux d'une unité refusé |
| Banc d'essai `o2` | **25 assertions, 0 échec** — compteur exact sur douze nombres (dont `003,20`, `0,020540`, `100` et `50` en ambigus), mauvaise règle refusée, `0,2` refusé pour `0,20` |
| Erreurs JS sans base configurée | **0** sur les deux pages |
| Texte des SVG contre son `viewBox` | **144 textes mesurés, 0 débordement** |
| Défilement horizontal | **aucun** à 768 px ni à 390 px, sur les deux outils et sur le hub |
| Fiches A4 | **2 pages exactement** chacune, confirmé à l'export PDF (209,9 × 297,0 mm) |
| Marge restante | `o1` : 10 mm au recto, 26 mm au verso · `o2` : 8 mm et 19 mm |
| QR codes | syndromes Reed-Solomon nuls, relecture rendant l'URL exacte |

Sur téléphone, les tables de saisie **se replient** — l'énoncé sur sa propre
ligne, les champs dessous. À trois colonnes, la série finale de `o2` obligeait
sinon à faire défiler le bloc latéralement huit fois de suite.

---

## Ce que j'attends de toi

1. **Trancher les zéros de fin** (le point rouge en haut) — c'est le seul qui
   bloque une relecture sereine de `o2`.
2. **Les deux arbitrages du lot 2** : tri de la verrerie, nombre de niveaux.
3. Lire les deux outils à l'écran. Les deux calculs que j'ai ajoutés à la série
   finale de `o2` (`0,456 × 12,3` et `6,20 − 0,025`) n'emploient que des nombres
   déjà présents ailleurs, mais ce sont des ajouts : à valider ou à retirer.
4. Signaler les cinq erreurs à l'équipe.

Dis-moi pour la verrerie et les niveaux, et je lance le lot 2.
