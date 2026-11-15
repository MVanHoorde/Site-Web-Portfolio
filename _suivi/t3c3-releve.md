# Relevé — T3-C3 « Dispersion de la lumière et spectres lumineux »

> **V1 intégrale produite le 25/08/2026** selon `_modeles/CONSIGNES-V1-integrale-PC.md`.
> Source : `Thème 3 - Chapitre 3 [correction] - Dispersion de la lumière et spectres lumineux.pptx`
> (+ PDF, 11 diapos + couverture) → `pages/2nde-pc-t3-c3-dispersion-spectres.html`.
>
> **Ouvrir la page et le PDF côte à côte doit donner le même cours.** Les 18 images
> de la source sont posées avec leurs légendes ; il ne reste qu'un bloc 🚧, celui
> du lien de DS.
>
> **Ce qui a été produit** : 34 fichiers dans `assets/img/pc/2nde-pc-t3-c3/` (920 ko),
> 34 figures sur la page, 4 jeux de données chiffrées sortis des images,
> 1 correction de fond tracée par `<!-- ÉBAUCHE → CORRIGÉ … -->`.
> Code de déblocage inchangé : **PR1SME**.

---

## 1. Erreurs de physique corrigées

**Aucune dans la source.** Le contenu du PPTX est juste de bout en bout — c'est
la première fois sur les trois chapitres repris.

En revanche, **une erreur de l'ébauche** (rédigée par Claude en régime A, absente
de la source) a été corrigée :

| # | Où | Ce que disait l'ébauche | Ce que dit la page | Pourquoi |
|---|---|---|---|---|
| **É1** | Correction de l'exercice 1 | « après le prisme, on obtient un ensemble de **lumières polychromatiques** décomposées en radiations » | Le faisceau d'entrée est une **lumière polychromatique** ; après la fente, la radiation verte isolée est **monochromatique** — le second prisme ne la décompose pas. | C'est l'inverse qui était écrit : la décomposition **sépare** une lumière polychromatique en radiations **monochromatiques**. La source ne donne pas cette correction (le schéma est seulement à légender), l'erreur venait donc entièrement de l'ébauche. Marqueur distinct `ÉBAUCHE → CORRIGÉ`, pour ne pas laisser croire que la source était fautive. |

## 2. Incohérences de calcul

**Aucune.** Les deux exercices chiffrés ont été refaits à la main :

- **Exercice 2** — conversions vérifiées : 4,7 × 10⁻⁷ m = 470 nm, 0,75 µm = 750 nm,
  200 × 10⁻⁹ m = 200 nm. Les quatre classements de la source sont justes. Les
  conversions, qui n'étaient nulle part sur la page, sont maintenant écrites
  étape par étape dans la correction.
- **Exercice 5** — l'échelle 88 mm ↔ 250 nm et la première raie à 4 mm de 450 nm
  donnent bien λ₁ = 450 + 250 × 4 / 88 = 461,4 ≈ **461 nm**. Les trois autres
  valeurs de la source (498, 612, 672 nm) sont cohérentes avec les raies du
  lithium du tableau (460, 497, 610, 670 nm) : l'identification tient.

## 3. Contenus récupérés qui n'étaient nulle part ailleurs

| # | Diapo | Ce qui manquait | Où c'est maintenant |
|---|---|---|---|
| **M1** | 3 | **Les valeurs de l'exercice 2** : l'énoncé de la page disait « les radiations suivantes » sans donner λ₁ à λ₄ — l'exercice était inutilisable. | Les quatre valeurs sont posées en `.donnees` sous la question, et la correction montre les conversions. |
| **M2** | 4, Image 6 | La **longueur d'onde de chaque couleur** : violet 400, indigo 425, bleu 470, vert 550, jaune 600, orange 630, rouge 665 nm. | Figure posée, les sept valeurs écrites dans la légende. |
| **M3** | 4, Image 7 | Les **bornes du spectre visible** : 400, 420, 500, 575, 620, 800 nm, et le sens petites/grandes longueurs d'onde. | Figure posée, bornes et sens écrits dans la légende. |
| **M4** | 8, Image 15 | Les **températures** des trois spectres : 3 000 °C, 1 500 °C, 800 °C. | Figure posée, les trois températures et ce qu'on voit à chacune écrits dans la légende. |
| **M5** | 7, Image 12 | Le **chiffrage du spectre solaire** : environ 25 000 raies et bandes sombres, et les éléments identifiables (hydrogène, hélium, carbone, oxygène, fer). | Figure posée, chiffre et liste dans la légende. |
| **M6** | 7 | Le **montage complet** « quel est le spectre du Soleil ? » (fente, lentille, prisme, écran) — jamais montré. | Figure posée en tête du II-A. |
| **M7** | 9, Images 16-18 | Les **trois spectres de raies** (mercure polychromatique, sodium quasi monochromatique, hydrogène) — absents sous toutes leurs formes. | Les trois figures posées avant l'exercice 5, avec leur nature dans la légende. |
| **M8** | 8, Image 14 | Les **cinq sources de lumière** (soudure, four, ampoule à filament, LED, Soleil). | Rangée de cinq vignettes de même hauteur, légende commune. |
| **M9** | 5, 6, 9 | Les **captures des trois animations** (PhET prismes, LaboSims spectre d'émission, PhET corps noir) : les liens étaient là, mais rien ne montrait ce qu'on allait ouvrir — et l'exercice 4 ne se fait **qu'avec** l'animation du corps noir. | Les trois aperçus sont posés à côté de leur lien, celui du corps noir juste sous l'exercice 4. |

## 4. Licences à confirmer

**Toutes les figures.** Aucune ne porte de crédit dans la source. Chaque `<figure>`
porte `data-origine="source PPTX — licence non identifiée"` (34 figures).

Trois cas méritent d'être distingués le jour d'un assainissement :

- **les captures d'animations** (PhET ×2, LaboSims) — PhET est diffusé en CC-BY,
  la capture est donc a priori reprenable **avec attribution** ; c'est le cas le
  plus facile à régulariser, et il concerne 3 figures ;
- **la gravure de Newton** (Image 1) — une gravure de 1666 reproduite : l'œuvre est
  dans le domaine public, la photographie de la gravure peut ne pas l'être ;
- **les spectres et schémas de manuel** (Images 6, 7, 12, 13, 15, 16, 17, 18, réseau
  Jeulin) — ce sont eux qui appellent la vigilance, et **le régime B les remplacera
  de toute façon** par des SVG maison, ce qui règle la question.

## 5. Remarques pédagogiques — tu tranches

| # | Remarque |
|---|---|
| **P1** | **La source numérote deux figures « Image 9 »** : le réseau de diffraction (diapo 7) et l'arc-en-ciel (diapo 6). Les deux sont posées avec leur numéro d'origine et la note est portée dans la légende du réseau. À trancher dans le PPTX si tu le rouvres. |
| **P2** | Le chapitre annonce **λ_R = 800 nm** pour la borne rouge du visible. La valeur usuelle des manuels de seconde oscille entre 750 et 800 nm ; c'est un choix, pas une erreur — mais il vaut d'être **le même dans le DS et dans les exercices** (l'exercice 2 classe justement 750 nm en visible, ce qui ne marche qu'avec 800). |
| **P3** | L'exercice 4 (« le corps noir ») ne se fait **qu'avec l'animation PhET** : sans elle, aucune des quatre questions n'a de support sur la page. L'aperçu est maintenant posé, mais il faudrait sans doute une consigne explicite « ouvre l'animation, règle la température sur… ». |
| **P4** | La légende de l'Image 5 dit qu'une lumière blanche est polychromatique « car elle contient **au moins deux couleurs dites complémentaires**, voire toutes les couleurs ». La notion de couleurs complémentaires n'est **définie nulle part** dans le chapitre et n'est pas nécessaire à l'argument. |
| **P5** | Le **spectre d'absorption** n'est jamais évoqué, alors que le spectre du Soleil (Image 12) en est précisément un — ses 25 000 raies sombres sont des raies d'absorption. Le chapitre les présente comme des raies « qui permettent de déterminer la composition », sans nommer le phénomène. Le programme de seconde ne l'exige pas ; à toi de voir si l'ellipse te va. |
| **P6** | Le tableau « Pour le DS » renvoie à « 15 p. 229 » pour *exploiter un spectre de raies* — un numéro de page qui sort de la plage du chapitre (279-298). Coquille probable du PPTX. |

---

## Ce qui vient ensuite (§11 des consignes)

| Jalon | État |
|---|---|
| 1. V1 intégrale en ligne | ✅ **fait** |
| 2. Texte & exercices validés | ⬜ à toi : É1 et les six remarques ci-dessus |
| 3. Images retravaillées | ⬜ régime B — 28 fichiers `-source` à passer en SVG |
| 4. Ajouts & approfondissements | ⬜ |
| 5. Cours VALIDÉ | ⬜ |
| 6. Fiche élève | ⬜ **seulement une fois le cours figé** |

---

## 13/11/2026 — Schémas de structure refaits en SVG à la charte

> Règle du 13/11/2026 (`CONSIGNES-V1-integrale-PC.md` §4) : un schéma de structure
> se refait en SVG inline dès la V1. La page passe de **0 à 17 SVG**, tous avec
> `<title>`, `<desc>` et `aria-labelledby` (aucun SVG n'existait avant : rien à
> rattraper de ce côté). Aucun texte de cours modifié ; aucune erreur de physique
> trouvée dans les figures, donc aucun `SOURCE → CORRIGÉ` ajouté.

### Ce qui a été remplacé — 16 fichiers `-source`, 17 SVG

| Figure | Ce qui fait foi dans le SVG |
|---|---|
| Image 2 — prisme | Rayons tracés par la loi de Descartes, prisme équilatéral au minimum de déviation. **Écart d'indice entre couleurs exagéré** (n = 1,62 à 400 nm, 1,50 à 700 nm, loi de Cauchy), sinon l'éventail ferait 1,5° ; c'est dit dans le `<desc>`. Éventail continu, couleur calculée depuis λ. |
| Image 3 — recomposition | Même tracé pour le premier prisme ; lentille convergente qui rabat l'éventail sur la face du second prisme, retourné ; faisceau blanc de sortie tracé à l'indice du vert. Schéma de principe (dit dans le `<desc>`). |
| Ex. 1 — prisme, fente, prisme | Même tracé ; la fente est posée à la hauteur exacte du rayon vert (530 nm), le second prisme sur sa trajectoire. Étiquettes : premier prisme, fente, second prisme. L'étiquette « lumière blanche » du fichier extrait **n'est pas reprise** : c'est l'un des trois termes que l'élève doit placer (le recadrage du PPTX la masquait déjà). |
| Image 6 — longueurs d'onde | Sept sinusoïdes dont la période est **proportionnelle à λ** : 400, 425, 470, 550, 600, 630, 665 nm. La source ne l'était pas (violet 53 px, rouge 132 px : rapport 2,5 au lieu de 1,66). Cote posée entre deux maxima successifs, comme la définition. |
| Image 7 — domaine visible | Axe **linéaire** 400 → 800 nm, graduations de la source (400, 420, 500, 575, 620, 800) à leur vraie place (la source les espaçait irrégulièrement). Dégradé calculé depuis λ ; au-delà de 700 nm le rouge s'assombrit (sensibilité de l'œil), ce qui rejoint P2 sans la trancher. Zones UV et IR hachurées de part et d'autre. |
| Ex. 3 — spectre électromagnétique | Frise **schématique, non proportionnelle, comme la source** : cases de domaines côte à côte, repères 10<sup>6</sup>, 10<sup>8</sup>, 10<sup>10</sup>, 10<sup>12</sup>, 10<sup>14</sup>, 10<sup>15</sup>, 10<sup>19</sup>, 10<sup>21</sup> Hz posés dans leur domaine, **sans graduation** qui ferait croire à une échelle régulière. Les pictogrammes (pylône, téléviseur, radar…) ne sont pas redessinés (règle du dessin figuratif) ; les usages sont dans la liste de l'énoncé. Voir E1 ci-dessous. |
| Image 8 — goutte d'eau | Rayon entrant au paramètre d'impact 0,86 R (arc primaire), réfraction, réflexion sur le fond, réfraction de sortie, tous calculés ; il ressort vers l'arrière et vers le bas. Indices de l'eau 1,344 (400 nm) et 1,331 (700 nm), écart **multiplié par 4** pour la lisibilité (dit dans le `<desc>`). |
| Montage « spectre du Soleil » | Vue de côté : lumière solaire, fente, lentille, prisme, écran ; éventail tracé de 400 à 800 nm, spectre sur l'écran en dégradé. |
| Image 13 — trois spectres | Raies **mesurées sur l'image source**, calibrées sur les quatre raies de Balmer de la première bande (410,17 · 434,05 · 486,13 · 656,28 nm ; résidu 0,1 nm). La deuxième bande est l'**hélium** à 0,3 nm près (402,6 · 412,1 · 414,4 · 438,8 · 443,8 · 447,1 · 471,3 · 492,2 · 501,6 · 504,8 · 587,6 · 667,8), plus une raie à 687 nm que l'hélium n'explique pas ; la troisième n'est pas identifiée (deux raies bleues à 423 et 437 nm, une série de 533 à 666 nm, en partie celles du néon). Positions conservées telles que mesurées ; aucun nom d'élément ajouté sur la page (la source n'en donne pas). |
| Image 15 — corps chaud | Trois bandes **calculées par la loi de Planck** à 3 000, 1 500 et 800 °C : luminance rapportée à celle de 700 nm, rendue sur 1,5 décade (ce qui est 30 fois plus faible que le rouge devient noir), couleur depuis λ. Le rendu suit la légende : rouge sombre seul à 800 °C, jaune et vert à 1 500 °C, tout le visible à 3 000 °C. |
| Image 16 — mercure | Une quarantaine de raies **mesurées sur l'image source**, calibrées sur huit raies du mercure (404,66 · 407,78 · 435,83 · 491,61 · 546,07 · 576,96 · 579,07 · 690,75 nm ; résidu ≤ 0,8 nm), éclat de chaque raie repris de la source. |
| Image 17 — sodium | Doublet 588,995 et 589,592 nm. À l'échelle du spectre, les deux raies se confondent (0,6 nm, moins d'un pixel) : un **agrandissement** les sépare, avec leurs valeurs. |
| Image 18 — hydrogène | Les quatre raies de Balmer : 410,17 · 434,05 · 486,13 · 656,28 nm. |
| Ex. 5 — feu d'artifice | Raies mesurées sur l'image source contre ses propres graduations : 459,9 · 497,0 · 610,1 · 670,2 nm, soit **exactement les raies du lithium du tableau** (460 · 497 · 610 · 670) — c'est là qu'elles sont posées. Axe 450 → 700 nm gradué tous les 50 nm, comme la source. |
| Ex. 6 — spectres a, b, c, d | a et c : raies mesurées sur la source, posées sur une plage 400 → 750 nm (la source n'a pas d'axe ; c'est la plage pour laquelle les couleurs des raies concordent). b et d : spectres continus calculés par la loi de Planck, à 1 000 °C pour b et 1 500 °C pour d (températures choisies pour reproduire l'allure de la source, **non affichées**). |
| Ex. 6 — correction | La photo `t3c3-ex6-acier-chauffe.jpg` en fond (`<image>` dans le SVG), les deux spectres b et d calculés comme ci-dessus, trois repères rouges : extrémités → b, partie jaune → d. Le `data-origine` de la figure signale la photo de fond. |

Les 16 fichiers remplacés ne sont plus appelés nulle part (vérifié dans tout le
dépôt) et ont été retirés du dossier ; ils restent dans l'historique Git.
`assets/img/pc/2nde-pc-t3-c3/CREDITS.md` est créé : il inventorie les 19 images
restantes et liste les 16 retirées avec le SVG qui les remplace.

### Ce qui est gardé en image — 7 fichiers `-source`

| Fichier | Pourquoi |
|---|---|
| `t3c3-newton-experience-source.jpg` (Image 1) | gravure ancienne : document historique |
| `t3c3-laser-monochromatique-source.jpg` (Image 4) | photo réelle |
| `t3c3-prisme-polychromatique-source.jpg` (Image 5) | image de synthèse photoréaliste, pas un schéma |
| `t3c3-prismes-systeme-dispersif-source.jpg` (Image 10) | photo d'objet |
| `t3c3-spectroscope-source.jpg` (Image 11) | photo d'objet |
| `t3c3-reseau-diffraction-source.jpg` (Image 9, II-A) | photo d'objet |
| `t3c3-spectre-soleil-source.jpg` (Image 12) | photographie d'un spectre réel à haute résolution : ses milliers de raies sont une mesure, pas un schéma |

Les captures d'animations, les photos d'arc-en-ciel, les vignettes de sources
lumineuses et la photo de l'acier n'étaient pas suffixées `-source` : inchangées.

### Ce qui a changé sur la page, hors figures

| # | Où | Quoi |
|---|---|---|
| **E1** | Exercice 3 | **L'énoncé montre désormais la frise vierge**, comme la version élève du PPTX : la figure complétée de la version corrigée était posée sous la question et livrait les réponses (règle « aucune bonne réponse devinable »). La **frise complétée** est ajoutée dans la correction. Commentaire HTML posé sur place. **À valider.** |
| **E2** | Exercice 5, correction | « 250 × 4 ⁄ 88 » écrit en **fraction empilée** (règle d'écriture permanente). Typographie, pas physique. |

### Restes ouverts — à toi

- **P1** (doublon « Image 9 ») et **P2** (borne λ<sub>R</sub> = 800 nm) : inchangés, non tranchés.
- **Ex. 5** : la correction raisonne sur l'échelle imprimée (« 88 mm ↔ 250 nm », « 4 mm de 450 nm »). À l'écran, le spectre n'a plus ces dimensions ; les raies sont à 460 · 497 · 610 · 670 nm et se lisent sur l'axe gradué. Les résultats de la correction (461 · 498 · 612 · 672 nm) restent dans l'incertitude de lecture ; tu voudras peut-être reformuler la méthode pour l'écran.
- **Image 13** : la troisième bande n'est pas identifiée (voir plus haut) ; nommer les trois éléments demanderait une source qui les donne.
- **Licences** : 19 images restent « licence non identifiée » (voir `CREDITS.md`) ; les deux captures PhET sont en CC-BY et appellent juste une attribution. La vignette du hub `t3c3-prisme-dispersion.jpg` n'a pas d'origine tracée.

### Contrôles

- Playwright (Chromium, serveur local) : **aucune erreur JS** ni requête en échec ; verrou fonctionnel (mauvais code refusé, `PR1SME` débloque) ; **18 images** chargées une à une, plus la photo de fond du SVG de l'ex. 6 ; **17 SVG**, tous avec un `aria-labelledby` qui pointe sur leur `<title>` et leur `<desc>` ; aucun texte hors du `viewBox`.
- Iframe de 390 px : `scrollWidth` = `clientWidth` = 390, aucun élément qui déborde.
- Chaque SVG regardé à côté de son image source, puis capturé dans la page.
- `node verifier.mjs` : **19 problèmes**, le repère — aucun ajouté ; « crédits d'images — toutes citées ».
