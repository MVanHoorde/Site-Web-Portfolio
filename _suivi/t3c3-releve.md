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
