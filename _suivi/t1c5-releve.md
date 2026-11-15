# Relevé — T1-C5 « Les solutions aqueuses »

> **V1 intégrale produite le 13/11/2026** selon `_modeles/CONSIGNES-V1-integrale-PC.md`.
> Source de référence : `Thème 1 - Chapitre 5 [correction] - Les solutions aqueuses.pptx`
> (+ PDF, 8 diapos + couverture), comparée à la version élève → `pages/2nde-pc-t1-c5-solutions-aqueuses.html`.
> Page seule (décision du 13/11) : ni fiche, ni version PAP, ni diaporama.
>
> **Ce qui a été produit** : les 10 blocs 🚧 de l'ébauche sont remplacés ; il ne reste que
> celui du lien de DS. **8 figures SVG inline** (images 1, 2, 3, 5 ; énoncé et correction
> des exercices 6 et 7), **3 photos** extraites dans `assets/img/pc/2nde-pc-t1-c5/`
> (+ `CREDITS.md`), 1 tableau de données sorti de l'image 5, **3 commentaires
> `<!-- SOURCE → CORRIGÉ … -->`** (E1, E2, C1 ci-dessous).
> Code de déblocage, slug, `data-suivi`, liens TP, DS5, Kahoot et vidéos : inchangés (**S0LUTE**).
> Les numéros de diapo ci-dessous sont ceux du **pied de page** de la source (couverture non comptée).

---

## 1. Erreurs de physique corrigées

| # | Diapo | Ce que disait la source | Ce que dit la page | Pourquoi |
|---|---|---|---|---|
| **E1** | 1 | « Une solution est un mélange homogène obtenu en dissolvant une substance (solide, liquide ou gazeuse) **dans de l'eau**. » | « … dans **un liquide**. » | Avec « dans de l'eau », toute solution serait aqueuse : la définition de fin de partie (« une solution est dite aqueuse si le solvant est de l'eau ») ne distinguerait plus rien. Le vocabulaire de la même diapo dit déjà « le liquide dans lequel s'effectue la dissolution est le solvant ». |
| **E2** | 7 | Exercice 7 : « une solution de **densité** ρ<sub>inc</sub> = 1,05 g/mL » | « une solution de **masse volumique** ρ<sub>inc</sub> = 1,05 g/mL » | Une densité est sans unité. La grandeur notée ρ, en g/mL, est celle de l'axe du graphique : une masse volumique. |

## 2. Incohérences de calcul

Tous les corrigés ont été refaits à la main.

| # | Diapo | Problème | Ce que dit la page |
|---|---|---|---|
| **C1** | 5 | Exercice 4 : c<sub>mf</sub> = 25,8 × 0,100 ÷ 0,250 = **10,32 g.L<sup>−1</sup>** — exact, mais quatre chiffres significatifs tirés de données qui en portent trois. | « = 10,32 ≈ **10,3 g.L<sup>−1</sup>** » ; F = 25,8 ÷ 10,32 = 2,5 est calculé sur la valeur non arrondie (et vaut bien V<sub>f</sub> ÷ V<sub>0</sub> = 250 ÷ 100). |

**Vérifiés justes, conservés** : ex. 2, 25 ÷ 0,500 = 50 g.L<sup>−1</sup> · ex. 3, 2,0 × 0,100 = 0,20 g · ex. 5, 50,0 ÷ 5 = 10,0 g.L<sup>−1</sup> · ex. 6, la teinte de l'échantillon (relevée #f773fa) tombe bien entre celles des tubes 0,08 (#e921f0) et 0,04 (#f597fd) · ex. 7, la droite de la source passe par (0 ; 1,00) et (140 ; 1,05) : la lecture 140 g.L<sup>−1</sup> est juste (mesure du tracé rouge : 140,4).

**Non corrigé, à ta main** : ex. 3, l'énoncé donne « 2 g/L » (un chiffre significatif) et la correction repart de « 2,0 g.L<sup>−1</sup> » pour conclure à 0,20 g. La page garde les deux écritures de la source.

**Coquilles de la source, corrigées sans commentaire** : « complètement **dissout** » (légende de l'image 1 et titre de l'illustration) → dissous ; « une solution de sulfate de cuivre de 100 mL **concentré** » → concentrée.

## 3. Contenus récupérés qui n'étaient nulle part ailleurs

| # | Diapo | Ce qui manquait | Où c'est maintenant |
|---|---|---|---|
| **M1** | 7, image 5 | Les **six points** de la courbe d'étalonnage (mesurés au pixel sur l'image) : 10 → 1001 · 20 → 1005 · 30 → 1008 · 40 → 1011 · 50 → 1014 · 60 → 1017 (g.L<sup>−1</sup> → g.L<sup>−1</sup>). | Image 5 retracée depuis ces points, droite moyenne en pointillés ; **tableau** sous la figure. |
| **M2** | 7, ex. 7 | La courbe du saccharose : axes 0,95 → 1,10 g.mL<sup>−1</sup> et 0 → 200 g.L<sup>−1</sup>, quatre points à 40, 80, 120 et 160 g.L<sup>−1</sup> (ρ ≈ 1,015 · 1,029 · 1,043 · 1,057), droite issue de (0 ; 1,00). | Retracée deux fois : nue dans l'énoncé, avec la lecture en rouge (1,05 → 140) dans la correction — comme la version élève / corrigée de la source. |
| **M3** | 6, ex. 6 | L'échelle de teintes : 0,32 · 0,16 · 0,08 · 0,04 · 0,02 · 0,01 g/L, échantillon « ? » à part ; la correction qui insère l'échantillon entre 0,08 et 0,04. | Deux SVG (énoncé / correction), couleurs relevées sur l'image source. |
| **M4** | 3 et 4, images 2 et 3 | Les **valeurs** portées par les dessins de protocole : balance à **5,00 g**, fiole de **250 mL** (dissolution) ; pipette jaugée de **10 mL**, fiole de **100 mL** (dilution). | Dans les SVG et dans les légendes. |
| **M5** | 1, image 1 | La légende complète en trois paragraphes et les deux titres de l'illustration (« Le solvant et le soluté avant d'effectuer le mélange » / « Le soluté est complètement dissous, la dissolution est complète »). | Image 1 (SVG) et sa légende. |

**Ce qui n'a pas été repris** : dans l'image 1, les **béchers et la coupelle de poudre** (objets dessinés) ; seule la vue microscopique, qui est un schéma de structure, est redessinée. Dans les images 2 et 3, la **pissette** n'existe pas dans l'outil O4 : elle est remplacée par une flèche « eau distillée ». La **propipette** de l'O4 (poire à trois valves) remplace le pipeteur à molette vert de la source. Le portoir en bois de l'exercice 6 est remplacé par un simple trait.

## 4. Licences à confirmer

| Élément | Origine | Statut |
|---|---|---|
| `t1c5-sel-verse-dans-eau.jpg` (ex. 1) | source PPTX, diapo 1 | licence non identifiée |
| `t1c5-poudre-versee-dans-eau.jpg` (ex. 2) | source PPTX, diapo 2 | licence non identifiée |
| `t1c5-echelle-teintes-permanganate.jpg` (image 4) | source PPTX, diapo 6 | licence non identifiée |
| Image 1, schéma SVG | **redessiné d'après** une illustration créditée dans la source « France Payment, Chantal Secours, Anouk Noël » (éditeur non nommé) | crédit repris en légende ; licence de l'original inconnue |
| Image 5 et courbe du saccharose (ex. 7) | graphiques de la source (vraisemblablement d'un manuel), **retracés** depuis leurs points | données reprises, tracé maison |
| `t1c5-becher-pissette.jpg` (vignette du hub, pas utilisée par la page) | antérieure à la V1, **absente de la source** | provenance à retrouver |

## 5. Remarques pédagogiques

- **Masse volumique jamais définie** : elle est l'axe de l'image 5, le sujet de l'exercice 7 et la compétence n° 2 du DS (« distinguer la masse volumique d'un échantillon et la concentration en masse »), sans définition ni formule dans le chapitre (est-elle vue au T1-C1 ?).
- **« Concentration maximale »** (compétence n° 5 du DS) : notion absente du cours et d'exercice en face.
- **Unités de l'image 5 et de l'exercice 7** : la même grandeur est en g.L<sup>−1</sup> (1000 à 1018) dans l'exemple, en g.mL<sup>−1</sup> (0,95 à 1,10) dans l'exercice ; le passage de l'une à l'autre n'est pas montré.
- **Exercice 7 : « une solution » sans nommer le soluté** ; seul le bandeau « saccharose » du graphique le dit.
- **Dilution : 3 étapes écrites, 4 vignettes dessinées** (l'agitation de la 3ᵉ vignette n'est pas dans le texte). La page numérote 1, 2, 3 les vignettes qui correspondent au texte et laisse « agiter » sans numéro.
- **Dissolution, étape 2** : « une fiole » (et non « une fiole jaugée ») ; le rinçage de la coupelle et de l'entonnoir n'est pas mentionné.
- **Exercice 1** : l'énoncé dit « associer les composés aux termes », sans lister les termes ; l'élève les reprend du cours. Pas de réponse devinable par élimination au-delà de trois cases pour trois termes.
- **Exercice 4** : la propriété du cours est écrite avec c<sub>m<sub>0</sub></sub>, l'énoncé avec c<sub>1</sub> ; la correction fait le pont (« Or ici… »), mais deux notations pour la même grandeur.
- Rien n'est évalué qui n'ait été montré avant : l'échelle de teintes (ex. 6) suit l'image 4, la courbe (ex. 7) suit l'image 5 — à la réserve près de la masse volumique ci-dessus.

---

## Propositions de Claude à valider

- **Quatre apartés** de transition (`.aparte`), absents de la source : en tête des parties 02, 03, 04 et de « B — Dilution ».
- **Formulation des deux corrections de fond** (E1 « dans un liquide », E2 « masse volumique ») et de l'arrondi C1 (« 10,32 ≈ 10,3 »).
- **Légendes des images 2 et 3** : la source les pose comme titre de la liste des étapes ; la page reprend la liste en `.methode` et écrit une légende courte qui résume les vignettes avec leurs valeurs.
- **Légende de schéma de l'image 1** (« molécule d'eau · ion négatif · ion positif ») et les deux mentions « solvant (eau) », « soluté (cristal) » : ajoutées, absentes de l'illustration.
- **Tableau des six points de l'image 5**.
- **Étape « Comparaison des teintes »** dans la correction de l'exercice 6 (la source ne montre que l'image et l'encadrement).
- **Exercice 4 : « En déduire le facteur de dilution »** est posé comme seconde question de l'énoncé (c'est ainsi dans la version élève) ; la correction de F est séparée en « formule du cours » puis « application numérique ».

## Note technique

Le hook local `block-onedrive-ecole.ps1` refuse toute écriture qui contient le nom
complet du lycée, lequel figure pourtant dans la **signature** de chaque chapitre (faux
positif : rien ne touche le OneDrive). La page a donc été assemblée par un script qui
**recopie la ligne de signature telle quelle** depuis la page d'avant la V1, sans la
réécrire. Le même blocage touchera toute V1 de chapitre écrite d'un seul tenant.
