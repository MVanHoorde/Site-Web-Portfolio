# Relevé — T3-C4 « Réfraction et réflexion de la lumière »

> **V1 intégrale produite le 25/08/2026** selon `_modeles/CONSIGNES-V1-integrale-PC.md`.
> Source : `Thème 3 - Chapitre 4 - Réfraction et réflexion de la lumière.pptx`
> (+ PDF, 10 diapos + couverture) → `pages/2nde-pc-t3-c4-refraction-reflexion.html`.
>
> ⚠ **La source de ce chapitre est la version ÉLÈVE : elle ne contient aucun corrigé.**
> Les cinq corrections de la page ont été rédigées par Claude et **rien n'y est
> validé**. Elles ont toutes été refaites à la main cette fois-ci (§2).
>
> **Ce qui a été produit** : 20 fichiers dans `assets/img/pc/2nde-pc-t3-c4/` (652 ko),
> 20 figures sur la page, 3 jeux de données sortis des images, 1 correction de fond
> tracée par `<!-- ÉBAUCHE → CORRIGÉ … -->` et la mention d'attribution rectifiée sur
> les cinq exercices.
> Code de déblocage inchangé : **M1RAGE**.

---

## 1. Erreurs de physique corrigées

**Aucune dans la source** — mais deux corrections dans ce que l'ébauche avait ajouté :

| # | Où | Ce que disait la page | Ce qu'elle dit maintenant | Pourquoi |
|---|---|---|---|---|
| **É1** | Correction de l'exercice 3 | « n = 1,333 correspond à une température d'environ **20 °C** » | La courbe passe par n = 1,333 vers **10 °C** (branche décroissante), avec la plage 5–13 °C compte tenu de la précision de lecture, et la seconde solution vers −10 °C écartée comme non physique ici. | La courbe de l'Image 7 a été **mesurée point par point** après calibration sur ses graduations : son maximum est à 1,3333 vers 277 K (≈ 4 °C), elle passe par 1,3330 vers 282 K (≈ 9 °C) et **donne n ≈ 1,332 à 20 °C**. La réponse 20 °C ne se lit pas sur ce graphe. Voir P2 : c'est peut-être la question, ou le graphe, qu'il faut changer. |
| **É2** | Les **cinq** blocs de correction | « Correction rédigée par **M. Van Hoorde** / à valider » | « Correction rédigée par **Claude**, calculs vérifiés — à valider : la source de ce chapitre est la version élève, elle ne contient aucun corrigé. » | La mention t'attribuait cinq corrections que tu n'as pas écrites. Sur un site public et signé, c'est la seule ligne de ce relevé qui ne pouvait pas attendre. |

## 2. Incohérences de calcul

**Aucune** — les cinq corrections ont été refaites à la main, indépendamment :

| Exercice | Calcul refait | Verdict |
|---|---|---|
| **1** — temps Terre-Soleil | 1,50 × 10¹¹ / 3,00 × 10⁸ = 500 s = 8 min 20 s | ✅ juste |
| **2** — indice de l'eau | 3,00 × 10⁸ / 2,25564 × 10⁸ = 1,3300 | ✅ juste |
| **3** — température de l'eau | lecture graphique mesurée | ❌ corrigé, voir É1 |
| **4** — réfraction eau → plexiglas | sin i₂ = 1,33 × sin 45° / 1,50 = 0,6270 → i₂ = 38,8° | ✅ juste |
| **5** — angle limite eau → air | sin i_lim = 1,00 / 1,33 = 0,7519 → i_lim = 48,8° | ✅ juste |

## 3. Contenus récupérés qui n'étaient nulle part ailleurs

| # | Diapo | Ce qui manquait | Où c'est maintenant |
|---|---|---|---|
| **M1** | 6 | La **nomenclature complète** : I le point d'incidence, i₁ l'angle d'incidence, i₂ l'angle de réfraction, r l'angle de réflexion. La page nommait les rayons mais jamais les angles. | Liste posée sous le schéma des trois rayons, avant la loi de Snell-Descartes. |
| **M2** | 8 | Le **cas n₂ > n₁** : le rayon se rapproche de la normale. La page ne donnait que le cas « moins réfringent », soit la moitié de la règle. | Les deux cas sont énoncés côte à côte, avec les deux schémas de la source. |
| **M3** | 8 | La **question 1 de l'exercice 5** — « retrouver i_lim à l'aide de la simulation » — avait disparu : il ne restait que le calcul. | L'énoncé retrouve ses deux questions, et l'aperçu de l'animation PhET est posé juste au-dessus. |
| **M4** | 2, Image 1 | La distance de l'expérience de Fizeau : **L = 8,6 km**, lisible seulement sur le schéma. | Figure posée, la distance et le principe (roue dentée en rotation) écrits dans la légende. |
| **M5** | 3, Image 4 | Les données du **JWST** : lancé le 25 décembre 2021, miroir de 6,5 m composé d'hexagones, renvoi vers un miroir secondaire. | Figure posée, données dans la légende. |
| **M6** | 4, 5 | Les deux **renvois internes** de la source : « l'explication complète du crayon brisé est à la fin du cours » et « ce phénomène est à l'origine des mirages ». | Les deux sont rétablis dans les légendes des Images 5 et 7. |
| **M7** | toutes | **Les 15 images du chapitre** : aucune n'était sur la page (5 blocs 🚧 en tenaient lieu). | Les 15 sont posées avec leurs légendes intégrales, plus la capture de l'animation PhET et les deux photos de mirage. |

## 4. Licences à confirmer

**Toutes les figures** (20). Chacune porte `data-origine="source PPTX — licence non identifiée"`.

Quelques cas se distinguent :

- **le JWST et le coucher de Soleil** — les images de la NASA sont libres de droits
  pour un usage éducatif, celle-ci en vient probablement : la plus facile à créditer ;
- **la capture PhET** — CC-BY, reprenable avec attribution ;
- **le crayon brisé, le crayon cassé, la pièce de monnaie, le ballon au laser** —
  ces photos ont l'air d'être des **prises de vue personnelles** (fond de cuisine,
  paillasse, table de salle des profs). Si elles sont de toi, elles ne posent aucun
  problème et méritent juste un crédit ; c'est à confirmer.
- **les schémas de manuel** (Images 2, 8, 10, 12, 13, tableau des indices, cas limites)
  — les mêmes réserves que sur les autres chapitres, et le régime B les remplacera.

## 5. Remarques pédagogiques — tu tranches

| # | Remarque |
|---|---|
| **P1** | ⚠ **Aucune des cinq corrections n'est de toi.** Elles sont justes (§2), mais c'est le chapitre où ta relecture compte le plus : à la moindre divergence de méthode attendue (notation, nombre de chiffres, usage de la calculatrice en degrés), c'est ma rédaction qu'il faut changer, pas la tienne. |
| **P2** | **Le graphe de l'exercice 3 ne donne pas 20 °C** (voir É1). Trois sorties possibles : garder le graphe et accepter la réponse ≈ 10 °C ; garder la question « température de référence des tables » et remplacer le graphe par un autre, cohérent avec n(20 °C) = 1,3330 ; ou reformuler la question en « à quelles températures cette eau peut-elle être ? », qui exploite justement le maximum de la courbe. La troisième est la plus riche, mais c'est ta progression. |
| **P3** | La source **promet** que « l'explication complète du crayon brisé est trouvable à la fin du cours » — et le IV-C montre l'expérience **sans jamais l'expliquer** : il n'y a pas de schéma de rayons. La promesse n'est pas tenue, ni dans le PPTX ni sur la page. C'est sans doute le manque le plus visible du chapitre pour un élève. |
| **P4** | Le tableau « Pour le DS » demande de « **réaliser ou compléter une représentation schématique** d'une réflexion / réfraction » : aucun exercice du chapitre ne fait tracer un schéma. Les cinq exercices sont des calculs ou des lectures. |
| **P5** | L'**angle de réflexion r** apparaît dans la nomenclature et sur les schémas, mais la **loi de la réflexion** (r = i₁) n'est jamais énoncée. Le chapitre donne les deux lois de Snell-Descartes pour la réfraction et laisse la réflexion sans sa relation. |
| **P6** | La **réflexion totale** est présentée en remarque, sans son usage le plus parlant : la **fibre optique**. Une phrase suffirait à raccrocher le chapitre au Thème 3 (signaux et transmission). |

---

## Ce qui vient ensuite (§11 des consignes)

| Jalon | État |
|---|---|
| 1. V1 intégrale en ligne | ✅ **fait** |
| 2. Texte & exercices validés | ⬜ **prioritaire ici** : les cinq corrections sont de moi, pas de toi |
| 3. Images retravaillées | ⬜ régime B |
| 4. Ajouts & approfondissements | ⬜ l'explication du crayon brisé (P3) y a sa place |
| 5. Cours VALIDÉ | ⬜ |
| 6. Fiche élève | ⬜ **seulement une fois le cours figé** |

---

## Reprise du 13/11/2026 — schémas en SVG à la charte, corrigés revérifiés

> Règle du 13/11/2026 (`CONSIGNES-V1-integrale-PC.md` §4) : les schémas de structure
> passent en SVG à la charte dès la V1. Périmètre de cette reprise : la page, son
> dossier d'images, ce relevé. Texte du cours non touché, hors écriture scientifique
> (fractions, indices) et les deux points de l'exercice 3 ci-dessous.

### A. Les dix images `-source` : toutes remplacées, toutes retirées du dossier

Chaque SVG est inline, porte `<title>`, `<desc>` et `aria-labelledby` (10 SVG sur la
page, 10 `aria-labelledby` résolus, contrôlés au navigateur). Les angles sont
**calculés**, pas relevés à l'œil, avec les indices de la page :

| Figure | Remplace | Géométrie |
|---|---|---|
| Image 1 — Fizeau | `t3c4-fizeau-source.jpg` | Schéma de principe redessiné (lentilles, lame semi-réfléchissante, roue dentée vue de profil, miroir, L = 8,6 km, mention « non à l'échelle »). Le faisceau source → lame → roue est construit par réflexion exacte sur la lame à 45°. **La photographie du montage d'époque est gardée** : découpée dans l'image composite → `t3c4-fizeau-montage.jpg`, ses légendes imprimées (« oculaire, roue dentée et son système d'entraînement », « collection École polytechnique ») passées dans la `figcaption`. |
| Image 2 — réflexion | `t3c4-reflexion-schema-source.jpg` | r = i = 30°. |
| Trois rayons et leurs angles | `t3c4-rayons-angles-source.jpg` | n₁ = 1,00 (air), n₂ = 1,50 (verre), i₁ = 45° → sin i₂ = 0,4714, **i₂ = 28,1°** ; r = i₁. La source était dessinée avec un rapport sin i₁ / sin i₂ ≈ 1,67, sans indice précisé. |
| Image 8 — plan d'incidence | `t3c4-plan-incidence-source.jpg` | Perspective cavalière ; n₁ = 1,00, n₂ = 1,50, i₁ = r₁ = 40° → **i₂ = 25,4°**. Couleurs de la légende conservées (rayons verts, normale en pointillés rouges). |
| Cas n₂ > n₁ | `t3c4-cas-n2-superieur-source.jpg` | air → verre, i₁ = 35° → **i₂ = 22,5°**, prolongement du rayon incident en pointillés fins pour voir le sens de la déviation. |
| Cas n₂ < n₁ | `t3c4-cas-n2-inferieur-source.jpg` | eau → air, i₁ = 35° → **i₂ = 49,7°** (35° reste sous l'angle limite de 48,8°). ⚠ Le schéma source était **faux à l'œil** : le rayon y passait quasiment sans déviation (38° → 38°). |
| Image 7 — n = f(T) | `t3c4-indice-temperature-source.jpg` | Courbe **retracée depuis un relevé pixel calibré** (240 K → x 169,1 ; 360 K → x 729,7 ; 1,334 → y 118,5 ; 1,320 → y 593,3), régression locale sur les colonnes que les marqueurs ne masquent pas ; 16 carrés pleins, 10 carrés vides et 6 cercles relevés un à un. Axes traduits (« temperature / K » → « température (K) », « index of refraction » → « indice de réfraction n »), quadrillage fin ajouté pour la lecture (5 K, 0,0005). |
| Image 10 — atmosphère | `t3c4-atmosphere-source.jpg` | Schéma de principe sans échelle : Soleil réel sous l'horizon, rayons rectilignes hors de l'atmosphère puis courbés, directions apparentes = tangentes aux rayons à l'arrivée ; le Soleil vu est au-dessus de l'horizon et aplati. Continents non redessinés. |
| Image 12 — mirage chaud | `t3c4-mirage-chaud-source.jpg` | Rayon venu du ciel, courbé dans l'air chauffé, direction apparente prolongée jusqu'au sol (« image du ciel : on croit voir de l'eau »). |
| Image 13 — mirage froid | `t3c4-mirage-froid-source.jpg` | Parcours réels bombés vers le haut, parcours imaginaires = tangentes à l'arrivée ; libellés de la source repris (« Parcours réel / imaginaire du rayon lumineux », « Air chaud », « Air froid »). |

**Choix à valider (Loïc)** — règle du dessin figuratif : le palmier et le soleil du
mirage chaud, les immeubles, la plage et le promeneur du mirage froid, l'œil et le
soleil du schéma de Fizeau **ne sont pas redessinés**. L'objet du mirage froid est une
flèche « bâtiments », l'observateur un point. Les photos réelles du chapitre (mirages,
coucher de Soleil, JWST, labyrinthe, crayons, pièce, ballon) et la capture PhET restent
des images.

`assets/img/pc/2nde-pc-t3-c4/CREDITS.md` est créé (12 fichiers, tous cités ;
`verifier.mjs` le contrôle). Licences inchangées : §4 ci-dessus.

### B. Les cinq corrections, refaites à la main

| Exercice | Calcul refait | Verdict |
|---|---|---|
| **1** | 1,50 × 10¹¹ / 3,00 × 10⁸ = 500 s = 8 min 20 s | ✅ juste |
| **2** | 3,00 × 10⁸ / 2,25564 × 10⁸ = 1,3300 | ✅ juste |
| **3** | lecture sur la courbe retracée | ⚠ deux corrections, É3 et É4 |
| **4** | 1,33 × 0,70711 / 1,50 = 0,62697 → i₂ = 38,83° | ✅ juste |
| **5** | 1,00 / 1,33 = 0,75188 → i_lim = 48,75° | ✅ juste |

| # | Ce que disait la page | Ce qu'elle dit maintenant | Pourquoi |
|---|---|---|---|
| **É3** | θ ≈ **10 °C** (283 K), plage 5 à 13 °C, autre solution vers −10 °C | θ ≈ **9 °C** (282 K), plage **4 à 12 °C**, autre solution vers **−9 °C** ; maximum « entre 271 et 277 K » au lieu de « vers 277 K » | La courbe retracée donne n = 1,3330 à **281,8 K** (8,7 °C) et à 264,5 K ; n = 1,3332 à 277,3 K et 1,3328 à 285,0 K. Le commentaire de l'ébauche lisait déjà « 282 K, soit environ 9 °C » : la réponse affichée le contredisait. Écart d'arrondi, pas de physique — P2 reste entier. |
| **É4** | la seconde solution est « de la **glace** surfondue » | « de l'**eau** surfondue (restée liquide sous 0 °C) » | Erreur de physique de l'ébauche : c'est le liquide qui se surfond. |

Les deux sont tracées dans la page par `<!-- ÉBAUCHE → CORRIGÉ … -->`.

**Écriture** : les neuf quotients des corrections et la formule n = c/v sont en
fractions empilées (`.frac`, plus de barre « ⁄ ») ; les indices Unicode des lignes
« Données » et des étapes des exercices 4 et 5 sont passés en `<sub>`.

### C. Contrôles du 13/11/2026

- Playwright : zéro erreur JS ; verrou → mauvais code refusé, `M1RAGE` déverrouille ;
  11 images chargées une à une ; 10 SVG, `aria-labelledby` résolus ; à 390 px (iframe)
  aucun débordement (scrollWidth = 390) ; chaque SVG capturé et regardé.
- `node verifier.mjs` : **19 problèmes**, le repère, aucun ajouté.

### D. Restes ouverts

- P1 à P6 ci-dessus, inchangés (dont P2 : le graphe ne donne pas 20 °C).
- Licences des photos (§4) : rien de neuf.
- Validation des schémas refaits (forme, couleurs, choix de ne pas dessiner les objets).
