# Enseignement scientifique Terminale — fichier de vérification

> **Livrable du portage du 12/09/2026.** C'est **ce fichier** qui se travaille à
> l'audit : chaque ligne dit **un endroit précis** et **une action précise**.
> Contexte et règles : `CLAUDE.md` · conventions techniques :
> `_modeles/CONSIGNES-sequence-SNT.md` · le chantier jumeau de 1re :
> `_suivi/es1-verification.md`.
>
> **Rien n'est validé.** Tout ce qui est écrit ici est une proposition ; la
> validation est un acte explicite de Loïc.

---

## 0. Ce qui a été fait, en une page

**Les deux chapitres de terminale qui existaient en ligne passent sur le moteur des
séquences**, dans la grammaire séquence → séance → étape → champ de l'ES de 1re et
du SNT. Ils étaient écrits sur le **gabarit des chapitres de physique-chimie** (un
cours qu'on déroule, des encarts, une checklist « Pour le DS »).

| Chapitre | Page | Séances | Source |
|---|---|---|---|
| T2-C1 | `pages/term-es-t2-c1-deux-siecles-energie-electrique.html` | 2 | PDF `[CORRECTION] Thème 2 - Chapitre 1` (11 p.) |
| T2-C2 | `pages/term-es-t2-c2-production-stockage-electricite.html` | 3 | PDF `[CORRECTION] Thème 2 - Chapitre 2` (13 p.) |

**Le hub de terminale n'affiche plus que ce qui est traité** : la séquence
d'ouverture (la frise) et ces deux chapitres. Le thème 1 entier, les 2.3 et 2.4, et
le thème 3 entier sont **mis en commentaire** dans `pages/term-enseignement-scientifique.html`
— retirés de l'affichage, pas du fichier. Chaque bloc masqué porte une ligne
d'ouverture qui dit comment le rétablir.

**Trois gains, dans l'ordre d'importance :**

1. 🎉 **Le chapitre 2 avait zéro image ; il en a dix-sept.** Son ancien bloc « à
   faire » demandait d'ouvrir un **PPTX de 230 Mo** pour les extraire. Elles étaient
   toutes dans le **PDF de correction**, qui pèse 2,8 Mo. La carte de la géothermie
   y était **coupée en deux morceaux** : ils ont été recollés.
2. 🎉 **La correction de l'exercice 2 du chapitre 1 n'était pas perdue.** La page
   portait depuis juillet un « à faire : correction séquencée à transcrire ». Elle
   est page 7 du PDF, avec la **fiche technique du groupe électrogène** — l'image
   sans laquelle l'exercice était insoluble. Les deux sont en ligne.
3. 🎉 **Les 12 vidéos et 2 Kahoot du chapitre 1 sont toutes posées** : 7 vidéos et
   les 2 Kahoot par les QR codes du diaporama, les 5 dernières par les **hyperliens
   du PPTX** (`Téléchargements/[CORRECTION] Thème 2 - Chapitre 1 … .pptx`), que le
   PDF avait perdus. Chaque titre a été vérifié. ⚠ **Le PDF du chapitre 2 ne porte
   aucun QR code** : ses 15 liens restent introuvables — **son PPTX n'a pas encore
   été ouvert**, c'est la prochaine piste (§3.2).

**🆕 Le chapitre 1 a été refondu sur audit le même jour** (audit dicté par Loïc, en
trois vocaux, appliqué en un lot). Ce qui a changé et ce qu'il faut regarder en
premier : **§8**.

**Deux erreurs et deux contradictions ont été trouvées dans les sources** — détail
au §5. L'une d'elles faussait une réponse en ligne depuis juillet.

---

## 1. Récapitulatif chiffré

T2-C1 compté **après la refonte sur audit** ; T2-C2 tel que porté.

| | T2-C1 | T2-C2 | **Total** |
|---|---|---|---|
| **Séances** | 2 + bilan | 3 | **5 + 1 bilan** |
| Étapes | 16 (dont 1 révision, 3 bilan) | 13 | **29** |
| dont bonus dépliables | 2 | 0 | **2** |
| **QCM** | 5 | 4 | **9** |
| dont questions | 47 | 10 | **57** |
| Blocs de texte à trous | 3 (dont 1 en menus déroulants) | 11 | **14** |
| dont champs à remplir | 14 | 45 | **59** |
| Exercices à relier | 2 | 0 | **2** |
| Réponses rédigées | 12 (sans correction en ligne) | 5 | **17** |
| Réflexions perso (non notées) | 2 | 1 | **3** |
| Figures | 13 images + 2 schémas SVG | 17 | **32** |
| Vidéos | 12 + 2 Kahoot | 0 posée | **12** |
| Mots au glossaire | 13 (glossaire progressif) | 12 | **25** |
| Cadres « proposition » | 10 | 4 | **14** |
| Blocs « chantier » | 2 | 11 | **13** |
| Cadres de réservation d'image | 0 | 1 | **1** |
| Lignes de HTML | 1 982 | 1 221 | **3 203** |

**Contrôles passés le 12/09/2026 :**

- `node verifier.mjs` → **18 problèmes avant, 18 après** pour ce chantier. Le repère
  est intact (les 18 liens `cfa/outil-*` vers des fiches non écrites).
  ⚠ **Une autre session travaillait sur le dépôt en même temps** (relecture de l'outil 3
  contre la circulaire, figures SVG de l'ES de 1re, passage du moteur en `?v=43`). Elle a
  laissé un **19ᵉ problème qui n'appartient pas à ce chantier** : un `id` dupliqué
  (`pointe`) dans `pages/1re-es-t1-c1-nucleosynthese.html`, vraisemblablement un marqueur
  de flèche répété d'un SVG à l'autre. **À corriger de leur côté.**
- Les deux pages ouvertes dans un **Chromium** : **aucune erreur JS**, **aucune
  ressource en échec**, les 32 images existent sur le disque.
- **Aucune iframe ne porte de `src`** au chargement : les vidéos (12 au T2-C1 depuis la refonte) sont en
  `data-src` derrière une affiche, comme l'impose la règle RGPD du dépôt.
- Moteur en `sequence-snt.css?v=41` + `sequence-snt.js?v=43`, aligné sur les
  20 autres pages qui le chargent.

---

## 2. Le découpage retenu, séance par séance

Validé par Loïc avant écriture : **C1 en 2 séances, C2 en 3**, en suivant le
découpage des parties existantes.

### T2-C1 — Deux siècles d'énergie électrique (≈ 3 h) — état après la refonte sur audit

Règle de construction de chaque étape : cours → vidéo → **« à retenir » en bas** →
seulement ensuite l'activité qui le vérifie.

| Étape | Titre | Ce qu'elle porte |
|---|---|---|
| **S1 · 1.1** | Une ville, deux nuits | 2 peintures, **réflexion perso juste dessous**, vidéo « C'est pas sorcier » repliée en « pour aller plus loin » |
| **S1 · 1.2** | 1831 — Faraday et l'induction | 2 figures, texte, vidéo Faraday, **bloc « Que se passe-t-il dans le fil ? »** (schéma SVG + 3 analogies, non exigible), à retenir, **texte à trous en fenêtre floutée** (7 champs) |
| **S1 · 1.3** | Rotor, stator | 95 % (venu de 1.1), 3 paragraphes alternateur / rotor / stator, 2 figures + **mention d'évaluation**, vidéo CEA, **tableau centré en menus déroulants** + renvoi au chapitre 2, à retenir, QCM (5 q., fusion des deux anciens) |
| **S1 · 1.4** | Le rendement | conservation de l'énergie, **η = E(utile)/E(reçue)**, fractions sur deux niveaux, formules agrandies, à retenir, **activité 1** : chaîne énergétique redessinée + 2 questions ouvertes |
| **S1 · 1.5** | Le rendement d'un groupe électrogène | **fiche technique recomposée en document**, 4 questions ouvertes |
| **S1 · 1.6** | Réviser la séance *(non verrouillée)* | 2 vidéos, 2 Kahoot, QCM bilan (13 q., sans enjeu) |
| **S1 · 1.7** | *bonus* — pour aller plus loin | Fée Électricité (Klein), Galvani-Volta (Cogito Ergo Sum) |
| **S2 · 2.1** | Conducteur, isolant, semi-conducteur | 3 cartes de couleur, vidéo SOLEIL, à retenir, texte à trous (1 phrase, 3 champs), **exercice à relier**, QCM (7 q.) |
| **S2 · 2.2** | La cellule photovoltaïque | encart **hors programme** (jonction P/N, dopage), 2 figures, 2 vidéos, à retenir réécrit, QCM refait (6 q.) |
| **S2 · 2.3** | Pourquoi le rendement reste limité | électron-volt agrandi, exemple 3 eV, à retenir, **3 photons à relier** + 3 questions ouvertes |
| **S2 · 2.4** | Le meilleur absorbeur est-il le meilleur choix ? | ancien « exercice 3 » retravaillé : spectres + **document 2** (gap, abondance, usage) + 3 questions ouvertes |
| **S2 · 2.5** | Ouverture — améliorer le rendement | 2 graphiques, 2 pistes en cartes, vidéo ARTE, réflexion perso |
| **S2 · 2.6** | *bonus* — pour aller beaucoup plus loin | Le Réveilleur |
| **S3 · 3.1** | Tout le chapitre, en six cartes | le bilan réécrit |
| **S3 · 3.2** | Le grand QCM du chapitre | 16 q., sans enjeu |
| **S3 · 3.3** | Pour le devoir, je sais… | **6 vraies cases à cocher**, non enregistrées |

### T2-C2 — Production et stockage de l'électricité (≈ 4 h)

| Étape | Titre | Ce qu'elle porte |
|---|---|---|
| **S1 · 1.1** | Le problème à résoudre | courbe paléoclimat ΔT/CO₂, QCM (2 q.) |
| **S1 · 1.2** | A — Conversion d'énergie mécanique | schéma d'éolienne, **activité 1** (chaîne énergétique, tableau des 3 turbines, 3 questions) |
| **S1 · 1.3** | B — Conversion d'énergie thermique | chaîne commune aux 3 filières, centrale solaire, carte de géothermie, QCM (3 q.) |
| **S1 · 1.4** | C et D — radiative et chimique | PV dans la Vienne, pile Daniell, pile moderne, tableau de synthèse (8 champs) |
| **S2 · 2.1** | Pourquoi faut-il stocker ? | conso sur 1 jour / sur 1 an, texte à trous (5 champs) |
| **S2 · 2.2** | A — Accumulateurs | définition, schéma, QCM (2 q.) |
| **S2 · 2.3** | B — STEP, CAES, FES | STEP en coupe, volant d'inertie, tableau, texte à trous (6 champs) |
| **S2 · 2.4** | C et D — supercondensateurs et bilan | tableau Opecst, 2 graphiques comparatifs, QCM (3 q.) |
| **S2 · 2.5** | **Exercice 1 — pile à hydrogène** | schéma, équation-bilan, rendement global, 2 réponses rédigées |
| **S3 · 3.1** | Les neuf critères qu'on oublie | la liste à retenir, réflexion perso |
| **S3 · 3.2** | **Exercice 2 — tour de blocs de béton** | photo Energy Vault, E(pp), 3 textes à trous, 2 réponses rédigées |
| **S3 · 3.3** | **Exercice 3 — les tours au crible** | réponse rédigée longue + correction sur les 9 critères |
| **S3 · 3.4** | Bilan du chapitre | bilan dépliable, « pour le DS » |

---

## 3. Ce qui manque — liens et images

### 3.1 Les liens retrouvés (T2-C1) — à vérifier d'un coup d'œil

Récupérés par décodage des **QR codes du diaporama**, puis identifiés un par un.
Les adresses sont sûres ; les titres ci-dessous sont ceux que renvoie YouTube.

| Où | Intitulé du bouton dans le cours | Ce que c'est réellement |
|---|---|---|
| 1.1 | Rappels sur l'électricité | *Électricité* — C'est pas sorcier |
| 1.2 | L'expérience de Faraday | *Expérience de Faraday* — Morvan Joel |
| 1.3 | Comprendre en vidéo | *Comment produit-on de l'électricité ?* — CEA (départ à 1:26, comme le lien du PPTX) |
| 1.6 | Réviser en vidéo | *L'alternateur électrique* — Les Bons Profs |
| 1.6 | S'exercer en vidéo | *Rendement d'un alternateur 📝 Exercice* — e-profs |
| 1.6 | Maîtriser la conversion (Kahoot) | **deux** Kahoot : *Conversions, niveau 1* et *Les réflexes de la conversion* |
| 1.7 | Art et électricité | *La Fée Électricité de Raoul Dufy* — Étienne Klein, MAM Paris |
| 1.7 | Découvrir la chaîne YouTube de mon enseignant | *La controverse Galvani-Volta* — chaîne **Cogito Ergo Sum** ⚠ |
| 2.1 | Vidéo (hyperlien PPTX) | *L'électron libre ; La théorie des bandes* — Synchrotron SOLEIL (départ à 2:06) |
| 2.2 | Vidéo (hyperlien PPTX) | *Comment fonctionnent les panneaux solaires ?* — C'est pas sorcier |
| 2.2 | Vidéo, autre approche (hyperlien PPTX) | *Les cellules et panneaux photovoltaïques* — Jonathan Dumas |
| 2.5 | Vidéo (hyperlien PPTX) | *Comprendre la rareté des métaux rares \| Data Science* — ARTE |
| 2.6 | Pour aller beaucoup plus loin (hyperlien PPTX) | *Le Photovoltaïque.* — Le Réveilleur |

Le PPTX ne contient **aucun autre** QR code ni lien : les 9 images-QR et les 12
hyperliens ont tous été décodés.

⚠ **Une seule chose à confirmer** : la chaîne `@CogitoErgoSum1` est-elle bien la
tienne ? Rien dans le PDF ne le dit. Si oui, le même lien est à poser au chapitre 2,
étape 1.4, où le bouton « Pour découvrir votre enseignant — Youtuber ! » est vide.

### 3.2 Les liens introuvables — 15, tous au T2-C2

**Le PDF du chapitre 2 ne contient aucun QR code.** Piste à suivre avant toute
recherche : le **PPTX** du T2-C2, s'il existe dans les Téléchargements — celui du
T2-C1 a rendu en hyperliens les cinq adresses que son PDF avait perdues. Les titres
ci-dessous sont exacts, tels que le cours les donne.

**T2-C2 (15)** — répartis sur les trois séances :
*Barrages hydroélectriques* (Energia, 04/11/2017) ·
*Barrage de la Rance* (aTech) ·
*Hydroliennes : les courants marins* (LeBlob) ·
*Une hydrolienne inspirée par le mouvement des poissons* (Brut) ·
*Apprendre à représenter une chaîne énergétique* (aide méthode) ·
*Comment fonctionne une centrale thermique ?* (Lesics français, 10/12/2020) ·
*Centrale solaire à concentration* (Energia) ·
*Pyrénées : une centrale solaire à concentration unique* (Actu-Environnement) ·
*Centrale géothermique* (Energia) ·
*Les centrales nucléaires expliquées en 3 minutes* (Antoine vs Science, 16/08/2021) ·
*Comment ça marche une centrale nucléaire ?* (Tu mourras moins bête ép. 14, ARTE) ·
*EDF fête la science avec Jamy — Stocker l'électricité* (EDF) ·
*Cette usine souterraine est une ÉNORME batterie à eau !* (Révolution Énergétique, 08/02/2023) ·
*Il stocke de l'électricité avec des VOLANTS D'INERTIE* (Révolution Énergétique) ·
*C'est quoi un condensateur ?* (Mentalité Ingénieur, 03/03/2020) ·
*Stocker l'énergie 1/2 et 2/2* (Professeur Sims) ·
*L'intermittence des énergies renouvelables : c'est grave ?* (L'Esprit Sorcier TV) ·
*Un peu trop beau pour être vrai…* (titre seul, chaîne inconnue).

S'y ajoutent **trois documents écrits** cités au chapitre 2, étape 2.4 : la note
n°42 de l'Opecst (septembre 2023), un article SAFT de Patrick Bernard, et une fiche
de *Guide bâtiment durable.brussels*. Et **une animation** « Principe de la fission
nucléaire » (étape 1.3), absente du PDF.

### 3.3 Les images encore manquantes — une seule

| Page | Fichier attendu | Ce qu'il faut y voir |
|---|---|---|
| T2-C2, étape 1.2 | `t2c2-turbines-francis-kaplan-pelton.jpg` | Les **trois photos de turbines** du tableau de l'activité 1. Elles sont dans le PDF, mais en **vignettes de 120 px** : inutilisables. Une copie d'écran de la diapositive suffit. |

Un **cadre de réservation** est posé à cet endroit dans la page : l'intégration se
réduira à remplacer une balise.

---

## 4. Ce qui attend une décision de ta part

| # | Où | Question |
|---|---|---|
| **D1** | T2-C2 seulement | **La checklist « Pour le DS, je sais ».** **Tranché pour le T2-C1** à l'audit du 12/09 : de **vraies cases à cocher**, dans une séance « Bilan » à part (non enregistrées, faute de base). Reste à savoir si le **T2-C2 prend la même forme** — il porte encore le tableau de renvoi vers les étapes. |
| **D2** | T2-C2, étapes 3.2 et 3.3 | **Deux conclusions opposées dans la source** sur le coût des tours de béton : l'exercice 2 conclut « économiquement intéressant » (135 €/kWh contre 400 pour une batterie), l'exercice 3 « très élevé » (les STEP sont à 5-20 €/kWh). Les deux sont exactes, elles ne comparent pas à la même chose — mais l'élève qui enchaîne lira une contradiction. Ajouter une incise à l'exercice 2, ou **faire de cette tension une question** ? |
| **D3** | T2-C2, étape 3.3 | **Exercice 3 : un champ ou neuf ?** Posé ici en une seule réponse rédigée, comme dans la source. En **neuf champs courts**, un par critère, on garantirait qu'aucun n'est oublié — ce que l'exercice sanctionne justement. Rédaction continue (format bac) contre méthode complète. |
| **D4** | T2-C1, étape 1.7 | **La chaîne `@CogitoErgoSum1` est-elle la tienne ?** (voir §3.1) |
| **D5** | les deux pages | ✅ **Fait le 13/09/2026, avec la 1re** : `data-sequence="est-t2-cN"`, réponses personnelles, `data-cle` passées en `est-`. Classes T3 et T6 créées (`018`). — Énoncé d'origine : **Le branchement en base.** Comme l'ES de 1re, ces pages n'ont ni client de progression ni `data-sequence` : rien n'est enregistré, et le moteur le dit honnêtement. Le branchement demande les six gestes listés au §4 de `es1-verification.md`. À faire **en même temps que la 1re**, ou séparément ? |
| **D6** | hub terminale | **Les chapitres masqués.** Ils sont en commentaire, pas supprimés. Confirmer que c'est la bonne forme — et dire s'ils doivent **réapparaître un par un** au fil de l'année, ou tous ensemble. |
| **D7** | T2-C1 et T2-C2 | **Les fiches élève.** Aucune n'existe. Faut-il en produire, et sur quel modèle — celui des chapitres PC (`CONSIGNES-fiche-eleve-PC.md`) ou autre chose, l'ES n'ayant pas la même économie de séance ? |

---

## 5. Erreurs et contradictions trouvées dans les sources

**Toutes sont corrigées dans les pages et signalées sur place.** Aucune n'est encore
reprise dans les PDF d'origine.

| # | Où | Ce que dit la source | Ce qui a été mis en ligne |
|---|---|---|---|
| **E1** | T2-C1, ancien exercice 3 (étape 2.4) | La correction dit **germanium (Ge)**, avec la nuance rendement/coût face au GaAs et au Si. | La page **proposait l'arséniure de gallium** depuis juillet. **C'était faux.** Depuis la refonte sur audit, **aucune correction n'est plus en ligne** : la réponse juste est dans `_corriges-es/term-es-t2-c1-corriges.md` (hors Git), et l'activité est construite pour que l'élève découvre la nuance. |
| **E2** | T2-C2, p. 2 | Figure légendée « **Image 1 – Cycles de Milankovitch** ». | La figure montre les courbes **ΔT et CO₂ sur 450 000 ans**, pas les cycles de Milankovitch. Légende réécrite pour dire ce qu'on voit, en gardant l'explication d'origine. |
| **E3** | T2-C2, p. 7 | Figure légendée « **Image 9 – Schéma de principe du PES** ». | Il faut lire **FES** (*flywheel energy storage*). « PES » n'existe nulle part ailleurs dans le cours. |
| **E4** | T2-C2, exercice 1 | L'énoncé de la question 2 demande de comparer à une batterie lithium « **de l'ordre de 90 %** » ; la correction, deux lignes plus bas, écrit « **(~80 %)** ». | **90 %** retenu : c'est la valeur de l'énoncé, celle reprise à l'exercice 2 de la séance 3, et celle du tableau Opecst (90-95 % pour le Li-ion). |
| **E5** | T2-C2, p. 5 et 6 | Les numéros **Image 5, 6 et 7** sont utilisés **deux fois chacun** (filière PV de la Vienne / variabilité de la consommation, piles Daniell et moderne / accumulateur). | Sans conséquence ici, les pages ne renvoient pas aux numéros. À reprendre si le PDF reste distribué. |

---

## 6. Ce qui change ailleurs dans le dépôt

- **`chapitre-commun.css` n'est plus chargé que par 15 fichiers** (au lieu de 17) :
  les deux pages de terminale en sortent. Le `?v=9` est inchangé.
- **`sequence-snt.js` est chargé par 22 fichiers** au lieu de 20. Toute modification
  du moteur touche désormais aussi ces deux pages.
- **Aucun fichier partagé n'a été modifié** : ni le moteur, ni la feuille de style,
  ni le client de progression. Le portage n'a pas demandé une ligne de JS.
- **18 images ont rejoint le dépôt** : 17 dans `assets/img/es/term-es-t2-c2/`
  (dossier créé) et 1 dans `assets/img/es/term-es-t2-c1/`.

---

## 7. Provenance des images — à regarder avant une diffusion large

Les 17 figures du chapitre 2 sont **extraites du PDF de cours**, comme l'avait été
le lot de l'ES de 1re. Leur provenance est citée dans chaque légende quand la source
la donne : **Opecst**, **IFPEN**, **RTE**, **EDF**, **La Nouvelle République**,
**Batribox**, **Bruxelles Environnement**, **Wikipédia**, **Louernos Nature**,
`grvtsp.fr`. Au T2-C2, les autres portent la mention « reprise du cours de M. Van Hoorde ». **Au T2-C1, cette mention a été retirée de toutes les légendes** à la demande de l'audit du 12/09 (seules les sources nommées — Maull & Polyblank, musée de Tokyo, NREL — restent affichées).

Le dépôt étant **public**, c'est un point à regarder — non pas dans l'urgence, mais
avant toute diffusion hors classe. Le même constat vaut déjà pour les 14 figures du
chapitre 1, en ligne depuis juillet.

---

## 8. Refonte du T2-C1 sur audit (12/09/2026) — à vérifier en priorité

L'audit dicté a été appliqué en un lot. Contrôles : `node verifier.mjs` → 18
problèmes (le repère) ; Playwright à 1024 et 768 px → zéro erreur JS, aucune
iframe chargée d'avance, pas de défilement horizontal ; parcours joué : réflexion
perso 1.1, fenêtre et texte à trous 1.2, menus 1.3, exercice à relier 2.1,
cases à cocher 3.3 → chaque étape se valide.

**Corrigés des questions ouvertes** : `_corriges-es/term-es-t2-c1-corriges.md`,
**hors Git** (ajouté au `.gitignore`). Aucune correction n'est plus dans la page.

### 8.1 À regarder d'abord — là où j'ai touché au fond

| # | Où | Ce que j'ai fait, et pourquoi c'est fragile |
|---|---|---|
| **P1** | 1.2, bloc « Que se passe-t-il dans le fil ? » | **Contenu inventé** : électrons libres, force perpendiculaire (Lorentz sans le nom), schéma SVG, 3 analogies (lignes « coupées », sens du courant, tuyau bouché). Sens du schéma vérifié (champ entrant, fil vers la droite → électrons vers le bas). Le tuyau bouché est une analogie qui a ses limites (tension ≠ pression). Marqué **non exigible**. |
| **P2** | 1.4 | **η = E(utile)/E(reçue)** : j'ai tranché ton « énergie fournie sur énergie reçue » en « utile / reçue ». Ajout aussi de « pertes fer — dans les pièces métalliques aimantées », glose absente du cours. |
| **P3** | 2.2 | **Retiré du cours affiché** la phrase « les électrons circulent de la zone N à la zone P », avec la question de QCM qui la testait — interprétation de « ne pas décrire la précision du dopage ». Le reste du texte P/N est gardé, sous un encart « hors programme ». |
| **P4** | 2.4 | **Document 2 inventé** à partir de recherches : gaps 0,7 / 1,1 / 1,4 eV ; Si ≈ 28 % de la croûte ; Ge ≈ 1,5 ppm ; Ga ≈ 19 ppm ; As ≈ 2 ppm ; « plus de 90 % des panneaux vendus » en silicium. Ordres de grandeur sûrs, **chiffres exacts à vérifier** (Ga et As non recoupés). |
| **P5** | 2.3 et partout | Le cours dit « silicium **moins de 20 %** ». Les records de laboratoire NREL sont vers **27-28 %**, et les panneaux du commerce autour de 20-23 %. **Non modifié** (fond) — mais un élève curieux trouvera mieux en ligne. |
| **P6** | 1.1 | Le « poste de visionnage » est **gardé en 1.1, replié** en « pour aller plus loin », et non déplacé en 1.7. |

### 8.2 Interprétations de l'audit à confirmer

- **« Le à retenir va en bas des parties »** : appliqué comme « le à retenir ferme le
  cours de l'étape ». L'activité qui le vérifie (texte à trous, QCM, activité 1)
  vient **après** lui. Si tu voulais le « à retenir » strictement en dernier, il faut
  redescendre sous les QCM de 1.3, 2.1, 2.2 et sous les activités de 1.4 et 2.3.
- **« La vidéo, c'est l'ordinateur »** (1.3) : compris comme la vidéo du CEA, remontée
  sous les images.
- **« Exercice 1 / exercice 2 »** : le mot « exercice » a disparu (décision ES du 12/09
  et ta remarque sur 2.4) → « Activité 1 », « Activité 2 », même habillage orange.
- **Le bilan « à part »** : devenu une **séance 3 « Bilan du chapitre »**, non
  verrouillée, comme la séance « Réviser » de la nucléosynthèse. La 1.6 « Réviser »
  reste en séance 1, comme demandé : il y a donc deux QCM bilan (13 q. sur S1, 16 q.
  sur tout le chapitre).
- **La 2.5 « Ouverture »** est gardée **à valider** (la réflexion perso la valide).

### 8.3 Pas fait, ou pas faisable

- **« Je dois aussi … de ce chapitre-là »** : un mot manque dans le vocal. Le PPTX ne
  contient **aucun troisième Kahoot ni lien** (9 QR + 12 hyperliens décodés, tous
  posés). Un `DS1 - T ES - Thème 2 Chapitre 1.docx` et une évaluation de rattrapage
  sont dans les Téléchargements : **non ouverts, non intégrés**.
- **Police des boutons** : « Vérifier », « Répondre », « Fermer » s'affichent en
  police à empattements — c'est le défaut connu d'IBM Plex Sans dans le moteur
  partagé (`sequence-snt.css`), **non touché** ici.
- **Message du composant d'étiquettes** : le moteur félicite par « tu sais lire une
  façade arrière » (écrit pour le SNT). **Réécrit dans la page** par un petit script ;
  le moteur n'est pas modifié — à reprendre si d'autres pages utilisent l'exercice
  à relier.
- **Cases « je sais » et glossaire** : ni enregistrés ni restaurés au rechargement
  (pas de base, pas de `localStorage` en ES).
- **T2-C2** : non touché par cet audit.
