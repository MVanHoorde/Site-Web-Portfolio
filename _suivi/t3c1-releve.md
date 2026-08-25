# Relevé — T3-C1 « Émission et perception d'un son »

> **V1 intégrale produite le 25/08/2026** selon `_modeles/CONSIGNES-V1-integrale-PC.md`.
> Source : `Thème 3 - Chapitre 1 [correction] - Emission et perception d'un son.pptx`
> (+ PDF, 11 diapos + couverture) → `pages/2nde-pc-t3-c1-emission-perception-son.html`.
>
> **Ouvrir la page et le PDF côte à côte doit donner le même cours.** Les 17 images
> de la source sont posées, légendes comprises ; il ne reste qu'un seul bloc 🚧,
> celui du lien de DS. Ce document est ce que tu as à lire : chaque ligne appelle
> une décision de ta part.
>
> **Ce qui a été produit** : 28 fichiers dans `assets/img/pc/2nde-pc-t3-c1/` (1,1 Mo),
> 28 figures sur la page, 5 données chiffrées sorties des images, 4 corrections
> tracées par un commentaire `<!-- SOURCE → CORRIGÉ … -->`.
> Code de déblocage inchangé : **S0NORE**.

---

## 1. Erreurs de physique corrigées

| # | Diapo | Ce que disait la source | Ce que dit la page | Pourquoi |
|---|---|---|---|---|
| **E1** | 9 (IV-C) | « Un son est **deux fois plus intense** si la source sonore vibre avec une amplitude **deux fois plus grande**. » | « Un son est d'autant plus **intense** que la source sonore vibre avec une **grande amplitude**. » | L'intensité varie comme le **carré** de l'amplitude (×2 sur l'amplitude → ×4 sur l'intensité). Le programme ne demandant qu'un lien **qualitatif**, la proportionnalité a été retirée plutôt que remplacée par une loi en carré, hors programme en seconde. La suite du paragraphe (« un son deux fois plus intense n'est pas perçu deux fois plus fort ») est conservée : elle porte sur la perception, et elle est juste. |

## 2. Incohérences de calcul

| # | Diapo | Problème | Ce que dit la page |
|---|---|---|---|
| **C1** | 2 → 3 | L'exercice 1 donne 3T = 7,9 × 10⁻³ s puis T = 2,6 ms ; l'exercice 2 repart d'un **2,62 ms** qui n'apparaît nulle part. Or 7,9 × 10⁻³ / 3 = 2,633 × 10⁻³ s. | La correction de l'exercice 2 **repart de la valeur non arrondie** (2,633 × 10⁻³ s), avec la phrase qui explique pourquoi. |
| **C2** | 3 | La fréquence qui en découle, **382 Hz**, affiche trois chiffres significatifs là où la lecture graphique n'en donne que deux. | **f ≈ 3,8 × 10² Hz = 380 Hz**, avec une ligne sur les chiffres significatifs. |
| **C3** | 4 | Exercice 3 : **T ≈ 0,02325 s** — quatre chiffres significatifs tirés d'une lecture graphique qui en donne deux (4T = 93 ms). | **T ≈ 2,3 × 10⁻² s = 23 ms**. La fréquence (43 Hz), elle, était juste : elle est conservée, calculée depuis la valeur non arrondie. |
| **C4** | 7 | Exercice 6 : Δt ≈ **689,6 s** — exact, mais laissé en secondes et à quatre chiffres significatifs. | **Δt ≈ 690 s**, suivi d'une étape « Conclusion » : **≈ 11 min 30 s**. C'est ce qui rend le résultat parlant. |

**Non corrigé, à ta main :** exercice 5, `d = 340 × 9 = 3060 m = 3,06 km`. Le calcul est
exact, mais la durée « 9 s » n'a qu'un chiffre significatif : à la lettre, le résultat
s'écrirait 3 × 10³ m. La page garde la valeur de la source — c'est un choix de niveau,
pas de physique, et il t'appartient.

**Coquilles de la source, sans effet sur le sens** (déjà propres sur la page) : « les chants
sont si puissants **qui** celui d'une baleine » (→ que) ; « c'est **la** anche » (→ l'anche) ;
« U_min = **O** V » avec la lettre O (→ 0).

## 3. Contenus récupérés qui n'étaient nulle part ailleurs

| # | Diapo | Ce qui manquait | Où c'est maintenant |
|---|---|---|---|
| **M1** | 7 | Le paragraphe explicatif de la célérité en entier (molécules proches dans les métaux, dispersées dans les gaz). | Transcrit mot pour mot en III-C, avant la valeur de c_son(air). |
| **M2** | 8, Image 10 | La **subdivision du domaine audible** : graves 20–200 Hz, mediums 200–2 000 Hz, aigus 2 000–20 000 Hz. | Frise posée (Image 10) **et** données sorties de l'image dans un `table.tab` à cinq lignes (infrasons → ultrasons). |
| **M3** | 8, Image 11 | Le **champ auditif comparé des espèces** — absent de la page sous toutes ses formes. | Image 11 posée, et les repères chiffrés écrits dans la légende : axe jusqu'à 160 000 Hz, chat et chien au-delà de 40 000 Hz, chauve-souris et dauphin jusqu'à 160 000 Hz. |
| **M4** | 9, Image 13 | Le **chiffrage du timbre** : même La₃, fondamentale 440 Hz, harmoniques f₂ = 880 Hz et f₃ = 1 320 Hz. | Image 13 posée ; les trois fréquences sont écrites en toutes lettres dans la légende. |
| **M5** | 2, Images 1-2 | Le **contre-exemple** sismogramme (non périodique) opposé à l'ECG (périodique). | Les deux figures côte à côte **après la définition du phénomène périodique**, précédées d'une phrase qui pose le contraste. |
| **M6** | 10, Image 14 | Le graphe d'amplitude ; seule sa mise en garde figurait sur la page. | Image 14 posée juste avant la phrase « ne pas confondre hauteur et amplitude ». |
| **M7** | 8, Image 12 | Le graphe d'altération de l'acuité auditive avec l'âge. | Image 12 posée, avec les valeurs lues sur le graphe : près de 70 dB de perte à 8 000 Hz à 80 ans, une vingtaine dans les graves, zone critique pour la parole au-delà de 30 dB. |

**Autres récupérations** : les annotations des exercices 1 et 3 (T, 3T, tᵢ, t𝑓, 4T, U_max,
U_min) n'existent pas comme images — ce sont des formes PowerPoint. Elles ont été
récupérées par **découpe du rendu** et posées **dans les corrections**, le graphe nu servant
d'énoncé. Les cinq situations de l'exercice 4 sont désormais cinq photos légendées.

## 4. Licences à confirmer

**Toutes les figures.** Aucune des 17 images de la source ne porte de crédit. Conformément
à ta décision du 25/08/2026 (§5 des consignes), tout est repris et chaque `<figure>` porte
`data-origine="source PPTX — licence non identifiée"` — l'inventaire se sort à tout moment par
`grep -c 'data-origine' pages/2nde-pc-t3-c1-emission-perception-son.html` (28 figures).

Trois familles, si l'on devait assainir un jour :

- **photos d'objets** (saxophone, sonomètre, casque anti-bruit, Soleil, vague, antenne) —
  les plus faciles à remplacer par des équivalents libres ;
- **schémas et graphiques de manuel** (compressions/dilatations, champ auditif des espèces,
  acuité et âge, spectres des deux instruments, échelle des dB) — vraisemblablement issus
  d'un manuel, ce sont eux qui appellent le plus la vigilance ;
- **figures reconstructibles** (sismogramme, ECG, graphes d'exercice, frise des fréquences,
  extrema, amplitude) — le régime B les remplacera par des SVG maison, ce qui règle la
  question au passage.

## 5. Remarques pédagogiques — tu tranches

| # | Remarque |
|---|---|
| **P1** | L'**amplitude** n'est jamais définie. Elle est en ordonnée de tous les graphes, elle fonde le IV-C, et l'erreur E1 portait dessus. Il manque un encart définition, probablement en I-C à côté des extrema. Rien n'a été ajouté : c'est du fond. |
| **P2** | La compétence DS n° 8 — « exploiter une échelle de niveau d'intensité sonore » — n'a **aucun exercice** en face. La seule ressource est l'échelle de l'Image 15, désormais posée avec ses seuils chiffrés dans la légende : de quoi bâtir un exercice court. |
| **P3** | L'explication de la célérité par la densité (M1) est le raccourci scolaire habituel ; c'est la **rigidité** du milieu qui domine, pas sa masse volumique. Sans enjeu en seconde — transcrit tel quel, signalé pour mémoire. |
| **P4** | Exercice 5 : « le son d'un éclair » — c'est le **tonnerre**. Formulation, pas physique : laissé tel quel. |
| **P5** | Le tableau « Pour le DS » de la source renvoie à des numéros de diapo, pas à des sections. Le mapping est **déjà résolu sur la page** : la checklist renvoie aux quatre sections par ancre. Reste que la source elle-même envoie « rôle du milieu matériel » vers la diapo 4 (Les ondes) alors que la propagation est traitée en III-B — à corriger dans le PPTX si tu le rouvres. |
| **P6** | Le lien « DS – 2024 \| 2025 » de la dernière diapo pointe vers un **SharePoint personnel de l'établissement**. Il n'a pas été posé : le site est public, ce lien ne l'est pas. Le bloc 🚧 reste en place, c'est le seul de la page. |

---

## Ce qui vient ensuite (§11 des consignes)

| Jalon | État |
|---|---|
| 1. V1 intégrale en ligne | ✅ **fait** — tu peux lire le cours entier à l'écran |
| 2. Texte & exercices validés | ⬜ à toi : les six lignes ci-dessus (E1, C1-C4, P1-P6) |
| 3. Images retravaillées | ⬜ régime B — les 19 fichiers `-source` deviennent des SVG à la charte |
| 4. Ajouts & approfondissements | ⬜ |
| 5. Cours VALIDÉ | ⬜ |
| 6. Fiche élève | ⬜ **seulement une fois le cours figé** |
