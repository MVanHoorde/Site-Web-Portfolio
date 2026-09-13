# Enseignement scientifique 1re — fichier de vérification

> **Livrable du chantier ES1 du 06/09/2026.** C'est **ce fichier** qui se travaille :
> chaque ligne dit **un endroit précis** et **une action précise**.
> Brief d'origine : `BRIEF-CLAUDE-CODE-ES1-sequences.md`.
> Contexte et règles : `CLAUDE.md` · conventions techniques :
> `_modeles/CONSIGNES-sequence-SNT.md`.
>
> **Rien n'est validé.** Tout ce qui est écrit ici est une proposition ; la
> validation est un acte explicite de Loïc.

---

## 0. Ce qui a été fait, en une page

**Les six chapitres du périmètre sont portés, aucun n'est laissé à moitié.**
18 séances, exactement le total prévu par le brief.

| # | Chapitre | Page | Séances | Source |
|---|---|---|---|---|
| C1 | La nucléosynthèse (+ tutoriel du dispositif) | `pages/1re-es-t1-c1-nucleosynthese.html` | 2 | PDF de cours |
| C2 | La radioactivité | `pages/1re-es-t1-c2-radioactivite.html` | 4 | 5 exports Quizéo |
| C3 | Les cristaux | `pages/1re-es-t1-c3-cristaux.html` | 3 | PDF + correction |
| C1 | Son et musique | `pages/1re-es-t2-c1-son-et-musique.html` | 3 | dossier d'activités + activité octave |
| C2 | Le son, une information à coder | `pages/1re-es-t2-c2-son-a-coder.html` | 3 | PDF + correction |
| C1 | La forme de la Terre | `pages/1re-es-t3-c1-forme-terre.html` | 3 | PDF + correction |

**Trois surprises**, dans l'ordre d'importance :

1. 🎉 **Le TP tournant sur le son n'était pas absent.** Le brief §2bis annonçait le
   sous-thème 4.1 comme *« le seul endroit du chantier où il faut produire un cours
   entier »*. Le dossier était bien déposé, sous un nom qui ne le disait pas :
   `[Dossier] [Correction] Thème 2 - Chapitre 1.pdf` — un dossier d'activités
   complet avec corrigés (TP acoustique musicale, résonance, corde de Melde,
   colonne d'air, exercices). **Le chapitre « Son et musique » est donc un portage
   comme les cinq autres**, et il est plus fourni que prévu. Ce qui reste
   réellement à écrire tient en trois notions, listées au §6 de ce fichier.
2. 🎉 **Les vidéos ont été retrouvées, sans les fichiers.** Les diaporamas ne
   contiennent pas de lien hypertexte, mais des **QR codes**. Ils ont été décodés :
   **24 adresses récupérées**, dont les **trois épisodes de « L'origine des éléments
   chimiques »** que le brief croyait perdus. Les `.mp4` déposés n'ont donc plus lieu
   d'être dans le dépôt.
3. ⚠ **Sept erreurs de source ont été trouvées et corrigées** — chiffres faux,
   légendes inversées, exposants perdus. Elles sont toutes listées, une par une, au
   §7. Certaines faussent un calcul, il faut les reprendre dans les PDF d'origine.

---

## 1. Récapitulatif chiffré

| | C1 nucléo. | C2 radio. | C3 cristaux | C1 son&musique | C2 son à coder | C1 forme Terre | **Total** |
|---|---|---|---|---|---|---|---|
| **Séances** | 2 | 4 | 3 | 3 | 3 | 3 | **18** |
| Étapes | 11 | 22 | 8 | 9 | 12 | 10 | **72** |
| dont à valider | 9 | 20 | 7 | 8 | 11 | 9 | **64** |
| **QCM** | 5 | 7 | 2 | 1 | 4 | 3 | **22** |
| dont questions | 17 | 28 | 7 | 4 | 14 | 11 | **81** |
| Blocs de texte à trous | 4 | 5 | 5 | 9 | 11 | 11 | **45** |
| dont champs à remplir | 16 | 18 | 22 | 41 | 44 | 38 | **179** |
| Réponses rédigées | 6 | 16 | 2 | 12 | 8 | 5 | **49** |
| Dépôts de copie d'écran | 0 | 0 | 0 | 2 | 0 | 0 | **2** |
| Réflexions perso (non notées) | 1 | 1 | 1 | 1 | 1 | 1 | **6** |
| Étiquettes à poser | 0 | 1 | 0 | 0 | 0 | 0 | **1** |
| **Cadres `.proposition`** | 8 | 9 | 6 | 4 | 6 | 7 | **40** |
| **Cadres de réservation** | 0 | 1 | 3 | 1 | 3 | 5 | **13** |
| Notes de chantier | 5 | 7 | 3 | 3 | 1 | 1 | **20** |
| Vidéos en façade | 7 | 11 | 7 | 6 | 0 | 0 | **31** |
| Images intégrées | 14 | 15 | 9 | 13 | 12 | 18 | **81** |
| Entrées de glossaire | 14 | 17 | 12 | 15 | 14 | 13 | **85** |

**Poids** : 525 ko de HTML pour les six pages · 81 images pour 3,9 Mo
(toutes optimisées : largeur ≤ 1 400 px, JPEG progressif, ≤ 230 ko chacune).

---

## 2. Les décisions attendues de toi, par ordre de blocage

### 🔴 Bloquantes — sans elles, une étape ne peut pas tourner en classe

| # | Où | Décision |
|---|---|---|
| **ES-01** | `t1-c3` étapes 3.1, 3.2, 3.3 | **Trois figures manquent au chapitre des cristaux** : paramètre de maille, rayon dans la CS, rayon dans la CFC, maille CC du fer. Sans elles, les relations `a = 2r` et `4R = a√2` **tombent du ciel** et les deux calculs de compacité ne se justifient plus. Ce sont des images vectorielles du PPTX : une **copie d'écran de chaque diapositive** suffit. |
| **ES-02** | `t1-c2` étape 4.1 | **La courbe de l'exercice 1 de la radioactivité.** L'énoncé demande de lire une demi-vie sur un modèle GeoGebra hébergé sur le **S3 de Quizéo** — qui disparaîtra avec le compte. À **rapatrier tant qu'il existe** : soit le `.ggb`, soit (plus simple) une image de la courbe. Sans ça, l'exercice n'a pas d'énoncé. |
| **ES-03** | `t2-c1` étape 1.3 | **Trois notions du programme 4.1 ne sont nulle part** : production/propagation du son, **célérité** (340 m·s⁻¹), **niveau sonore** en dB. Elles sont **déjà écrites** dans le chapitre de seconde `T3-C1`. Les rehausser et les insérer ici, ou les considérer acquises de seconde ? Rien n'a été recopié. |
| **ES-04** | `t2-c1` étape 2.2 | **Le graphique L = f(√m) de la corde de Melde** (avec sa courbe de tendance) est dans la correction mais vectoriel : non extractible. C'est lui qui porte toute la démonstration de la question 4. Copie d'écran du tableur. |
| **ES-05** | `t2-c2` étape 1.3 | **L'image 5 du cours** (deux échantillonnages du même signal, à deux fréquences différentes). C'est la figure qui fait comprendre le paragraphe sur la fidélité. |
| **ES-06** | `t3-c1` étape 3.3 | **Le schéma de la distance à l'horizon** (triangle rectangle O / A / B). Sans lui, le théorème de Pythagore de l'exercice arrive sans raison. |

### 🟠 Importantes — droits, ressources à tester, arbitrages pédagogiques

| # | Où | Décision |
|---|---|---|
| **ES-07** | `t1-c2` étape 4.3 | ⚖️ **Infographie AFP** (« Le cycle de la radioactivité »). Le dépôt est public. Remplacement, autorisation, ou renvoi par lien ? Même dossier que les treize photographies de T1-C3. |
| **ES-08** | `t2-c1` étapes 1.3, 2.2 · `t2-c2` | ⚖️ **Quatre documents sont des extraits de manuel** (spectres diapason/guitare, spectre mystère, documents 5 et 6 sur la corde vibrante). Même question. |
| **ES-09** | toutes les pages | ⚖️ **Provenance des 81 images**. Toutes viennent de tes PDF ; aucune n'a de source établie au-delà de « repris du cours de M. Van Hoorde ». Les légendes le disent honnêtement. À établir avant publication large — c'est le même chantier que `_suivi/t1c3-releve.md` §2. |
| **ES-10** | `t1-c2` étapes 1.4, 2.3 · `t2-c1` 2.2 | 🔍 **Trois ressources à tester depuis un poste du lycée** : PhET (CheerpJ, lourd), la carte **REMon** du JRC, l'animation **corde de Melde** de l'université de Nantes (ancienne). Comme cela avait été fait pour CodeBetter. |
| **ES-11** | `t1-c1` 1.4 · `t1-c3` 1.1 · `t2-c1` 2.1 | 🔍 **Les 24 liens vidéo viennent des QR codes**, décodés automatiquement. Les **adresses sont sûres**, mais **le contenu n'a pas été vérifié** — ni titre, ni durée. Un coup d'œil suffit à confirmer que ce sont les bonnes. |
| **ES-12** | `t1-c1` étape 2.2 | ⚖️ **Cycle CNO, triple α et diagramme H-R** ont été **déplacés en bonus** (facultatifs, non évalués) : ils dépassent le socle du programme. À remonter dans le cours si tu les traites en classe. |
| **ES-13** | `t1-c1` étape 1.1 | 📌 Le **tutoriel du dispositif** est écrit **au futur** (« ta réponse partira à ton professeur »), parce que la base n'est pas branchée. Au branchement : **repasser au présent**, le texte est déjà juste pour la suite. |
| **ES-14** | `t1-c3` | 📌 `pages/1re-pc-cristaux.html` **n'a pas été touché** et reste accessible par son URL. Le hub pointe vers la nouvelle page, et garde un second lien « Ancienne fiche de cours ». **À supprimer une fois la séquence validée.** |

### 🟡 À trancher quand tu passeras dessus

| # | Où | Décision |
|---|---|---|
| **ES-15** | `t1-c1` étape 2.4 | Deux cases du tableau « quelle nucléosynthèse ? » sont **discutables** : l'hélium (primordiale *et* stellaire) et l'hydrogène (aucune, au sens strict). Garder les pièges, ou retirer les deux lignes ? |
| **ES-16** | `t1-c2` étape 4.3 | Le raisonnement « 5 % » de Tchernobyl tombe **entre deux demi-vies** : on retient la première qui passe sous le seuil (5 demi-vies, 3,1 %). Un calcul exact par l'exponentielle serait hors programme. |
| **ES-17** | `t3-c1` étape 1.3 | Le **schéma corrigé** de l'exercice 2 (Belgrade/Corfou) est **caché derrière l'envoi** de la réponse. Le sortir du bloc de révélation si tu préfères le laisser visible. |
| **ES-18** | `t3-c1` étape 2.3 | L'**exercice 3 de triangulation est long** (7 applications de la loi des sinus, chaque résultat servant au suivant). Il est découpé en **4 blocs validants** pour qu'un élève bloqué ne perde pas tout. Donner les valeurs intermédiaires au tableau ? |
| **ES-19** | `t3-c1` étape 3.2 | La question « **placer trois villes sur la carte** » est passée en réponse rédigée. Le composant d'étiquettes du moteur la rendrait cliquable — c'est un travail de relevé de coordonnées sur l'image, pas encore fait. |
| **ES-20** | `t2-c2` étape 2.3 | L'écoute comparée « **Et si on écoutait ?** » (16 / 32 / 64 / 128 / 256 kbps) demande des **extraits sonores** : un même extrait exporté à cinq débits, à déposer dans `assets/`. |
| **ES-21** | `t1-c1` étape 1.3 | Les **trois graphiques d'abondance** se légendent en **saisie libre** (repères numérotés sur l'image, élément + pourcentage) **sans correction ni enregistrement** : seul le titre, en menu déroulant, se corrige. Si les légendes doivent un jour se corriger, les positions des 13 repères sont mesurées et prêtes. |
| **ES-22** | toutes | 📌 **Volume horaire** : 18 séances de 1 h 30 pour six chapitres. Le brief posait 2 + 4 + 3 + 3 + 3 + 3 ; c'est ce qui a été produit. Aucun débordement à signaler. |

---

## 3. Chapitre par chapitre

### C1 — La nucléosynthèse · `1re-es-t1-c1-nucleosynthese.html`

**Ce qui est en ligne** — 3 séances · 14 étapes (9 à valider) · 7 QCM (54 questions) ·
6 textes à trous · 3 légendes libres · 4 réponses rédigées · 6 choix fusion/fission ·
1 tri des noyaux · 7 vidéos en façade · 17 figures · 18 entrées de glossaire · panneau
« Classification ». Détail des deux audits : §11 et §12.

- **S1 — Les éléments chimiques et leurs abondances** : 1.1 comment ce cours va
  fonctionner (tutoriel + QCM de prérequis) · 1.2 qu'est-ce qu'un élément chimique ·
  1.3 activité, abondances · 1.4 fusion ou fission + bilan de séance · 1.5 bonus.
- **S2 — Les trois nucléosynthèses** : 2.1 primordiale · 2.2 stellaire · 2.3
  explosive · 2.4 activité « quelle nucléosynthèse ? » + bilan du chapitre · 2.5 d'où
  viennent les atomes de ton corps · 2.6 bonus.
- **S3 — Réviser** : 3.1 les « à retenir » rassemblés · 3.2 vidéos et Kahoot · 3.3
  QCM bilan.

**Cadres de réservation d'image** — aucun. Les huit QR codes du diaporama ont été
décodés : plus rien ne manque côté ressources.

**Cadres `.proposition`**

| Étape | Type | Ce qui est proposé |
|---|---|---|
| 1.1 | Programme | **Toute l'étape est ajoutée** : le tutoriel du dispositif, entrelacé au cours plutôt qu'en séance « mode d'emploi ». |
| 1.3 | Difficulté | L'exercice de légende des graphiques passe **du papier à la réponse rédigée** — voir ES-21. |
| 1.4 | Programme | **Les « à retenir » sont écrits**, pas repris : le PDF est un diaporama de projection, il n'en contient aucun. À relire de près. |
| 2.1 | Difficulté | Définition ajoutée pour **spallation**, mot employé sans être expliqué et hors programme. |
| 2.2 | Difficulté | **Cycle CNO, triple α, diagramme H-R déplacés en bonus** — voir ES-12. |
| 2.4 | Difficulté | Les deux cases discutables du tableau (hélium, hydrogène) — voir ES-15. |
| 2.5 | Programme | **Correction d'une erreur de source** : l'oxygène était écrit Z = 6 au lieu de 8 — voir §7. |
| 2.5 | Difficulté | Le diagramme H-R est **en anglais**. Version française disponible sur Wikimedia. |

**QCM écrits par Claude** — 5 QCM, 17 questions. Notions couvertes : définition de
l'élément chimique et rôle de Z · nombre d'éléments naturels · éléments artificiels
(Z > 92) · fenêtre et température de la nucléosynthèse primordiale · noyaux qu'elle
produit · ce qu'une étoile fabrique en séquence principale · le rôle de la masse
stellaire · la limite du nickel/fer · l'accélération des fusions successives ·
pourquoi la fusion s'arrête au fer · l'origine des éléments plus lourds · la capture
neutronique · distinguer fusion, fission et désintégration · quelles réactions ont
lieu dans une étoile.

**Contenu repris tel quel de Loïc** (rien à relire) : les définitions de l'élément
chimique et du numéro atomique · les données d'abondance des trois milieux · les
trois définitions de nucléosynthèse · les caractéristiques par masse stellaire ·
les définitions de fusion et fission · les six réactions de l'exercice 3 (à un Z près,
voir §7) · les énoncés des trois exercices · les treize images.

**Ce qui bloque** — rien de bloquant. Les `.mp4` du dossier de dépôt peuvent partir
(les URL sont en place). Restent ES-09 (provenance des images reprises du cours : les
mentions « cours de M. Van Hoorde » ont été retirées de la page, **la question reste
ouverte ici**), ES-12, ES-13, ES-15.

---

### C2 — La radioactivité · `1re-es-t1-c2-radioactivite.html`

**Ce qui est en ligne** — 4 séances · 22 étapes (20 à valider) · 7 QCM (28 questions) ·
5 textes à trous (18 champs) · 16 réponses rédigées · 1 jeu d'étiquettes ·
1 réflexion perso · 11 vidéos en façade · 15 images · 17 entrées de glossaire.

- **S1 — Les désintégrations** : 1.1 diagnostic · 1.2 définition + cascade U-238 ·
  1.3 α, β⁻, γ + étiquettes · 1.4 activité 1 (PhET) · 1.5 aléatoire/prévisible ·
  1.6 bonus.
- **S2 — L'exposition** : 2.1 naturelle/artificielle · 2.2 pénétration · 2.3 activité 2
  (REMon) · 2.4 ExPop ASNR · 2.5 santé et protection · 2.6 bonus.
- **S3 — Décroissance et demi-vie** : 3.1 la loi · 3.2 λ · 3.3 la demi-vie ·
  3.4 activité 3 · 3.5 le radium 226 · 3.6 bonus.
- **S4 — S'exercer** : 4.1 exercice 1 · 4.2 exercice 2 · 4.3 exercice 3 (Tchernobyl) ·
  4.4 bilan + Kahoot.

**Cadres de réservation d'image**

| Où | Ce qu'il faut y voir | Nom de fichier attendu | Format |
|---|---|---|---|
| Étape 4.1 | La **courbe de décroissance de l'exercice 1** (celle du modèle GeoGebra), axes lisibles : nombre de noyaux et temps en années | `t1c2-courbe-exercice-1.png` | paysage, ≥ 900 px |

**Cadres `.proposition`**

| Étape | Type | Ce qui est proposé |
|---|---|---|
| 1.1 | Programme | **Entrée diagnostique ajoutée** (l'élève écrit sa définition avant le cours, la relit à la fin). |
| 1.3 | Programme | **Tableau de synthèse α/β/γ** ajouté : l'information était dispersée entre les parties I et II. |
| 1.4 | Programme | La fiche IRSN sur le polonium 210 est **déplacée en bonus** de fin de séance. |
| 2.3 | Difficulté | **Piste chiffrée** ajoutée pour la conversion nSv/h → mSv/an (facteur 10⁻⁶ et 8 760 h). À retirer si tu veux les laisser buter. |
| 3.1 | Programme | **Légende corrigée** : le cours disait « les noyaux stables sont en jaune et noir », c'est l'inverse — voir §7. |
| 3.4 | Difficulté | « N₀ = 1001 » de l'énoncé est **ambigu** (100 ? 1000 ?) : écrit **1000** — voir §7. |
| 3.5 | Programme | **Question de lecture de courbe ajoutée** sur le radium, qui prépare l'exercice Tchernobyl. |
| 4.3 | Difficulté | L'année 1986 est **rappelée** (l'énoncé ne la donnait pas) ; le seuil de 5 % tombe entre deux demi-vies — voir ES-16. |
| 4.4 | Programme | **QCM de bilan** écrit pour cette version, absent des sources. |

**QCM** — 7 QCM, 28 questions, **dont 3 repris tels quels de Quizéo** (activité 1
question 2, activité 3 questions 2 et 3, ce dernier en réponses multiples). Les 25
autres sont écrits par Claude. Notions couvertes : nature d'un noyau radioactif ·
devenir du noyau père · cause de l'instabilité · terminus de la cascade U-238 ·
identité de la particule α · émission systématique du γ · rôle père/fils ·
matière vs rayonnement · radioactivité naturelle vs artificielle · fabrication et
usages des radionucléides artificiels · unité de dose (Sv vs Bq) · seuils
réglementaires (1 / 20 / 50 mSv) · dose et durée · protection collective et
individuelle · signification de N₀ et de λ · ce qu'il faut savoir de la loi
exponentielle · forme de la courbe · proportion désintégrée après t₁/₂ · les quatre
erreurs classiques sur la demi-vie · calcul à deux demi-vies · classement des
rayonnements par pénétration · grandeurs propres au radionucléide · exposition
annuelle moyenne en France · proportion après trois demi-vies · principe de la
datation.

**Contenu repris tel quel de Loïc** : l'intégralité des définitions et des
« à retenir » du cours Quizéo (partie I à IV) · les remarques sur les radionucléides
artificiels, la réglementation française et le corps humain à 8 000 Bq · les énoncés
des trois activités et de leurs questions · le texte à trous de l'activité 3 · les
deux QCM de l'activité 3 · les trois exercices du « S'exercer » et leurs données ·
les treize images du cours · les onze liens (vidéos, IRSN, ASNR, REMon, ExPop,
PhET, ensciences, ac-normandie, Kahoot).

**Ce qui bloque** — ES-02 (courbe GeoGebra), ES-07 (AFP), ES-10 (PhET et REMon à
tester). Le lien vers le rapport EDF/Cattenom du cours n'a **pas** été repris :
l'URL pointe vers un chemin daté qui bouge souvent (note de chantier en 2.6).

---

### C3 — Les cristaux · `1re-es-t1-c3-cristaux.html`

**Ce qui est en ligne** — 3 séances · 8 étapes (7 à valider) · 2 QCM (7 questions) ·
5 textes à trous (22 champs) · 2 réponses rédigées · 1 réflexion perso ·
7 vidéos en façade · 9 images · 12 entrées de glossaire.

- **S1 — Cristal et maille** : 1.1 solide cristallin, mono/poly, allotropie ·
  1.2 la maille élémentaire et les trois mailles cubiques.
- **S2 — Compter les atomes** : 2.1 la contribution selon la position · 2.2 CS puis
  exercice 1 (CFC).
- **S3 — Compacité et masse volumique** : 3.1 compacité de la CS · 3.2 exercice 2
  (CFC) · 3.3 exercice 3 (masse volumique du fer) · 3.4 bonus.

**Cadres de réservation d'image**

| Où | Ce qu'il faut y voir | Nom de fichier attendu | Format |
|---|---|---|---|
| Étape 3.1 | Le **paramètre de maille a** sur un cube (image 9 du cours) | `t1c3-parametre-de-maille.png` | paysage ou carré, ≥ 500 px |
| Étape 3.1 | Le **rayon d'une sphère dans une maille CS** — les sphères se touchent le long d'une **arête** (image 10) | `t1c3-rayon-dans-maille-cs.png` | paysage ou carré, ≥ 500 px |
| Étape 3.2 | Le **rayon dans une maille CFC** — les sphères se touchent le long de la **diagonale d'une face** (image 11) | `t1c3-rayon-dans-maille-cfc.png` | carré, ≥ 500 px |
| Étape 3.3 | La **maille CC du fer avec son paramètre coté** (image 13) | `t1c3-maille-cc-fer.png` | carré, ≥ 500 px |

**Cadres `.proposition`**

| Étape | Type | Ce qui est proposé |
|---|---|---|
| 1.2 | Programme | **Texte à trous et QCM ajoutés** pour la séance 1 : le cours source n'y comporte aucun exercice, la séance n'aurait rien eu à valider. |
| 3.1 | Programme | **Question ouverte ajoutée** sur les 52 % de vide — respiration au milieu d'une séance calculatoire. À retirer si le temps manque. |
| 3.2 | Programme | Phrase ajoutée : **74 % = empilement le plus compact possible**, et les métaux qui l'adoptent. Donne du sens à un nombre. |
| 3.3 | Difficulté | **Formule rétablie** : le cours écrit « ρ = Z × m » sans le dénominateur a³ — voir §7. |
| 3.3 | Difficulté | **Donnée corrigée** : m(atome de fer) = 9,35 × 10⁻²⁶ kg et non 10⁻² — voir §7. |
| 3.3 | Programme | **Confrontation ajoutée** à la valeur mesurée (7,87 × 10³ kg·m⁻³) : l'exercice devient une validation de modèle. |

**QCM** — 2 QCM, 7 questions, tous écrits par Claude. Notions : ce qui caractérise
un solide cristallin · mono vs polycristallin · variétés allotropiques · le cas du
fer usiné · le partage d'un atome de sommet · les trois multiplicités · la
contribution d'une arête.

**Contenu repris tel quel de Loïc** : toutes les définitions (solide cristallin,
mono/polycristallin, allotropie, maille, multiplicité, compacité, masse volumique) ·
la description des trois mailles cubiques · le principe du partage et le tableau des
contributions · les calculs de Z(CS), Z(CFC), C(CS), C(CFC) et ρ(Fe) · les énoncés
des trois exercices · les neuf images · les sept liens vidéo (par QR code).

**Ce qui bloque** — **ES-01** : les quatre figures manquantes. C'est le chapitre le
plus touché : sans elles, les deux calculs de compacité perdent leur justification
géométrique.

---

### C1 — Son et musique · `1re-es-t2-c1-son-et-musique.html`

**Ce qui est en ligne** — 3 séances · 9 étapes (8 à valider) · 1 QCM (4 questions) ·
9 textes à trous (41 champs) · 12 réponses rédigées · **2 dépôts de copie d'écran** ·
1 réflexion perso · 6 vidéos en façade · 13 images · 15 entrées de glossaire.

- **S1 — Le son, phénomène vibratoire** : 1.1 spectre, son pur/complexe, hauteur ·
  1.2 TP Audacity (diapason, voix) · 1.3 s'exercer sur trois spectres.
- **S2 — TP tournant** : 2.1 résonance (poste 1) · 2.2 corde de Melde (poste 2) ·
  2.3 colonne d'air (poste 3).
- **S3 — Les maths et la musique** : 3.1 octave et quinte · 3.2 le loup et les
  tempéraments · 3.3 bonus.

**Cadres de réservation d'image**

| Où | Ce qu'il faut y voir | Nom de fichier attendu | Format |
|---|---|---|---|
| Étape 2.2 | Le **graphique L = f(√m)** de la corde de Melde, avec sa courbe de tendance (y = 2,3123x + 0,0247 · R² = 0,9973) | `t2c1-graphique-melde.png` | paysage, ≥ 800 px |

**Cadres `.proposition`**

| Étape | Type | Ce qui est proposé |
|---|---|---|
| 1.2 | Programme | Les **deux dépôts de copie d'écran** remplacent « imprimer et coller ». ⚠ Limite connue : ils **ne remontent pas encore dans la fiche de révision** (manque déjà identifié aux consignes SNT §17.2). |
| 1.3 | **Manque** | **Trois notions du 4.1 absentes** : production/propagation, célérité, niveau sonore — voir **ES-03**. |
| 2.3 | Programme | **« À retenir » ajouté** rapprochant corde et colonne d'air : le dossier traite les deux TP séparément, sans jamais dire que c'est la même mécanique. |
| 3.1 | Difficulté | **Erreur mathématique de la correction** : 3¹² ≈ 2⁹ est faux, c'est 2¹⁹ — voir §7. |

**QCM** — 1 QCM, 4 questions, écrit par Claude. Notions : lecture du premier pic ·
calcul d'une harmonique de rang 3 · les deux critères du son pur · ce que partagent
deux instruments jouant la même note (le timbre).
⚠ **C'est le chapitre le moins doté en QCM** : le dossier d'activités est très riche
en questions rédigées, et les ajouter aurait fait doublon. À compléter si tu veux
plus d'auto-correction.

**Contenu repris tel quel de Loïc** : les documents 1 à 6 (spectre, son pur/complexe,
hauteur, gamme tempérée, instruments et notes, corde vibrante) · le tableau complet
des fréquences de la gamme tempérée sur 8 octaves · l'annexe Audacity · les corrigés
des cinq questions du TP I, des trois questions de l'activité II, des questions du
TP III (dont le tableau de mesures) et du TP IV · les trois exercices du « S'exercer »
et leurs corrigés détaillés · les 18 questions de l'activité introductive sur
l'octave et **toutes leurs réponses** · les treize images.

**Ce qui bloque** — **ES-03** (les trois notions manquantes du 4.1), ES-04 (graphique
Melde), ES-08 (droits des extraits de manuel), ES-10 (animation de Nantes à tester).

---

### C2 — Le son, une information à coder · `1re-es-t2-c2-son-a-coder.html`

**Ce qui est en ligne** — 3 séances · 12 étapes (11 à valider) · 4 QCM (14 questions) ·
11 textes à trous (44 champs) · 8 réponses rédigées · 1 réflexion perso ·
12 images · 14 entrées de glossaire.

- **S1 — Du son au signal numérique** : 1.1 le son est une variation de pression ·
  1.2 la chaîne d'acquisition · 1.3 la fréquence d'échantillonnage · 1.4 rappels
  binaire + exercice 1.
- **S2 — Résolution et format CD** : 2.1 la résolution · 2.2 exercice 2
  (pèse-personne) · 2.3 le format CD · 2.4 exercice 3.
- **S3 — Stockage et compression** : 3.1 octets et exercice 4 · 3.2 taille d'un
  fichier + exercices 5 et 6 · 3.3 compression + exercice 7 · 3.4 bonus.

**Cadres de réservation d'image**

| Où | Ce qu'il faut y voir | Nom de fichier attendu | Format |
|---|---|---|---|
| Étape 1.3 | **Deux échantillonnages du même signal côte à côte**, celui de gauche à fréquence plus élevée (image 5 du cours) | `t2c2-echantillonnage-deux-frequences.png` | paysage, ≥ 800 px |
| Étape 1.4 | **2 URL** : « Introduction au langage binaire » (Educode) et « Le binaire c'est quoi ? » (codeur-pro) | — | liens externes |
| Étape 3.3 | **6 à 8 URL** : Le Point Genius (CD, MP3), Audiofanzine, Théorisons, La Belle Écoute, et les trois révisions d'Éric Menonville | — | liens externes |

**Cadres `.proposition`**

| Étape | Type | Ce qui est proposé |
|---|---|---|
| 1.1 | Programme | **Renvoi à préparer** vers le chapitre « Son et musique », qui existe désormais : le lien est posé en pied de page. |
| 1.3 | Programme | **Deux applications directes ajoutées** de f = 1/T : le cours énonce la relation sans la faire manipuler avant l'exercice 3, deux séances plus loin. |
| 2.2 | Difficulté | **Erreur de la correction** : « 16 fois plus de données » — c'est **2 fois** — voir §7. |
| 2.3 | Programme | L'écoute comparée à cinq débits demande des **extraits sonores** — voir ES-20. |
| 3.2 | Difficulté | **Énoncé ambigu réécrit** : « N = 8 o » doit se lire « 3 octets » — voir §7. |
| 3.3 | Programme | **Sigle corrigé** : FLAC = *Free* Lossless Audio Codec, pas *Fast* — voir §7. |

**QCM** — 4 QCM, 14 questions, tous écrits par Claude. Notions : analogique vs
numérique · qui numérise dans la chaîne · ce qu'est physiquement un son · 2ⁿ valeurs
sur n bits · l'effet d'un bit supplémentaire · l'octet · le coût de la fidélité ·
définition de la résolution · pourquoi l'approximation est inévitable · le passage
de 4 à 8 bits · calcul d'un taux de compression · avec perte vs sans perte · pourquoi
le MP3 coupe les aigus · les affirmations vraies sur wav / FLAC / MP3.

**Contenu repris tel quel de Loïc** : toutes les définitions (signal analogique et
numérique, échantillonnage, T_e et f_e, résolution, format CD, octets classiques et
binaires, taux de compression, compressions avec et sans perte) · la formule de
taille de fichier et ses quatre grandeurs · les **sept exercices avec leurs corrigés
intégraux** (pèse-personne, conversion A/N, octets/Mio, variables de la formule,
tailles CD et studio, taux de compression) · les remarques sur les formats ouverts
et propriétaires · les douze images.

**Ce qui bloque** — ES-05 (image 5), les 8 à 10 liens vidéo, ES-20 (extraits sonores).

---

### C1 — La forme de la Terre · `1re-es-t3-c1-forme-terre.html`

**Ce qui est en ligne** — 3 séances · 10 étapes (9 à valider) · 3 QCM (11 questions) ·
11 textes à trous (38 champs) · 5 réponses rédigées · 1 réflexion perso ·
18 images · 13 entrées de glossaire.

- **S1 — Sphéricité et Ératosthène** : 1.1 l'histoire de l'idée · 1.2 Ératosthène +
  exercice 1 · 1.3 exercice 2 (Belgrade/Corfou).
- **S2 — Triangulation et le mètre** : 2.1 250 000 unités et la naissance du mètre ·
  2.2 Delambre et Méchain · 2.3 exercice 3 (triangulation, en 4 blocs).
- **S3 — Se repérer** : 3.1 latitude et longitude · 3.2 exercice 4 (planisphère) ·
  3.3 grand cercle, R_L = R_T cos θ, exercice 5 · 3.4 bonus (tour Eiffel, Vendée Globe).

**Cadres de réservation d'image**

| Où | Ce qu'il faut y voir | Nom de fichier attendu | Format |
|---|---|---|---|
| Étape 3.3 (bonus) | Le **schéma de la distance à l'horizon** : triangle rectangle avec O (centre), A (observateur à R_T + h) et B (point de tangence) | `t3c1-distance-horizon.png` | portrait ou carré, ≥ 500 px |
| Étape 1.1 | **2 URL** : « Comment sait-on que la Terre est ronde ? » (Science4All), « Qu'est-ce que la géodésie ? » (IGN) | — | liens externes |
| Étape 2.2 | **2 URL** : « Le mètre ne fait pas 1 m », parties 1 et 2 (Scilabus) | — | liens externes |
| Étape 3.2 | **2 URL** : animation GeoGebra « Se repérer sur la Terre » (collège Jules-Verne), vidéo « 3e — Repérer un point sur une sphère » | — | liens externes |
| Étape 3.3 (bonus) | **4 à 6 URL** : NOVELCLASS (cours et E3C), LeLivreScolaire, Label Maths, et les deux « monsieur albert » | — | liens externes |

**Cadres `.proposition`**

| Étape | Type | Ce qui est proposé |
|---|---|---|
| 1.2 | Difficulté | **Coquille corrigée** : « 5000 × 150 » alors que la donnée dit 160 m/stade — voir §7. |
| 1.2 | Programme | **Mise en perspective ajoutée** : comparer le résultat d'Ératosthène à la valeur admise (40 075 km). |
| 1.3 | Difficulté | Le **schéma corrigé** de l'exercice 2 est caché derrière l'envoi — voir ES-17. |
| 2.1 | Programme | **Vérification ajoutée** : refaire le calcul 40 000 → 10 000 km → 1 m, pour que la définition du mètre cesse d'être arbitraire. |
| 2.3 | Difficulté | L'exercice de triangulation est **découpé en 4 blocs validants** — voir ES-18. |
| 3.2 | Difficulté | La question « placer les villes » passe en rédigé, et une **tolérance de quelques degrés** est ajoutée sur les lectures de carte — voir ES-19. |
| 3.3 | Difficulté | L'exercice de la tour Eiffel, **numéroté 4 comme le précédent**, est passé en bonus — voir §7. |

**QCM** — 3 QCM, 11 questions, tous écrits par Claude. Notions : ancienneté de l'idée
de sphéricité · l'observation des navires à l'horizon · l'ombre lors des éclipses ·
géoïde et aplatissement · pourquoi mesurer un méridien · le principe de la
triangulation · la durée et le trajet de l'expédition · la référence de la latitude ·
lecture de coordonnées N/S et E/O · la nature angulaire des coordonnées · la
longitude de Greenwich.

**Contenu repris tel quel de Loïc** : la frise historique de la sphéricité et ses
deux arguments · le texte sur Ératosthène et ses trois hypothèses (dont la remarque
« raisonnement chargé de théorie ») · les données et corrigés des **cinq exercices**
(circonférence, Belgrade/Corfou avec les deux méthodes de rayon, triangulation
complète avec les sept angles, coordonnées des quatre villes, arcs de parallèle
Belgrade/Bordeaux et Oslo/Saint-Pétersbourg) · les définitions de latitude et
longitude · la relation R_L = R_T cos θ · le calcul de la distance à l'horizon ·
les dix-sept images.

**Ce qui bloque** — ES-06 (schéma de l'horizon) et une dizaine de liens vidéo.

---

## 4. Ce qui a été fait techniquement

| Point | État |
|---|---|
| **Moteur** | `assets/css/sequence-snt.css?v=41` + `assets/js/sequence-snt.js?v=42`, **réutilisés tels quels**. Aucune modification, aucun composant neuf. |
| **Composant « associations »** | Le brief le donnait pour absent. **Il n'a pas fallu l'écrire** : `initEtiquettes` (touche l'étiquette, touche l'endroit) fait exactement le travail, sur l'image même de la désintégration du radium. Voir `t1-c2` étape 1.3. |
| **QCM à réponses multiples** | Le brief demandait de vérifier. **Le moteur les gère déjà** : `"r"` accepte un tableau d'index. Le QCM de l'activité 3 de Quizéo est repris à l'identique. **9 questions** en usent dans les six pages. |
| **Base de données** | ✅ **Branchée le 13/09/2026.** `progression.js` chargé, `data-sequence="es1-tN-cN"`, réponses rédigées en **réponses personnelles** (`data-reponses`), connexion sur place (`data-accueil`). Classe `1re 2` créée (`bdd/schema/018`), ouverte par le `019`. Pas de plafond d'avance ni de sommaire SNT. Suivi dans le tableau de bord, espace ES 1re. |
| **`localStorage`** | ❌ Aucun. Contrôlé par `verifier.mjs` (voir ci-dessous). |
| **RGPD** | ✅ Aucune requête externe au chargement des six pages (mesuré au navigateur). Les 31 vidéos sont en **façade « clic pour charger »**, `youtube-nocookie`. Polices auto-hébergées. |
| **Bandeau ExPop** | ✅ Posé à côté du questionnaire de l'ASNR (`t1-c2` 2.4) : l'élève n'est pas obligé de renseigner ses données et peut simuler quelqu'un d'autre. |
| **Responsive** | ✅ Aucun débordement horizontal à 1280, 820 et 390 px sur les six pages. |
| **Verrouillage progressif** | ✅ Testé au navigateur sur chaque page : séances suivantes verrouillées à l'arrivée, déverrouillées quand toutes les étapes `data-gate` de la précédente sont validées. |
| **Fiche de révision** | Se rabat sur les « à retenir » — **aucun `<template data-fiche-fixe>`** n'a été écrit : ils demandent ≈ 4 schémas SVG par séance, ce que le brief §4 interdit de produire. |

### Le branchement en base — fait le 13/09/2026

Les six pages chargent `assets/js/progression.js` et portent sur `<body>`
`data-sequence="es1-tN-cN"`, `data-reponses="personnelles"` (les réponses rédigées
partent en réponses personnelles : corrigées en classe, jamais dans la file ni chez le
worker), `data-accueil="sur-place"` (le bandeau ouvre le formulaire dans la page) et
`data-renvoi-texte`. La classe 1re 2 existe en base (`bdd/schema/018`), ouverte par le
`019`. Pas de plafond d'avance ni de sommaire généré : ce sont des affaires de SNT.
Le suivi se lit au tableau de bord, espace ES 1re. Reste **ES-13** : le tutoriel du
dispositif est encore au futur.

---

## 5. `node verifier.mjs` — avant / après

| | Avant | Après |
|---|---|---|
| **Problèmes bloquants** | **18** | **18** — les mêmes : les 18 liens `cfa/outil-*` vers des fiches non écrites. **Aucune régression.** |
| Filtre `pagesSNT` | `2nde-snt-(t\d\|m\d)` | élargi à `1re-es-t\d-c\d` — les six pages ES sont désormais **couvertes par les contrôles** CDN, `localStorage`, `<div>`, marqueurs CHANTIER, indices et biais de QCM |
| Contrôle « questions-snt.js à jour » | sur `pagesSNT` | restreint à `pagesEnBase` (celles qui portent `data-sequence`) — sinon les pages ES, non branchées, faisaient clignoter **50 faux écarts** |
| Indices de niveau 1 livrant la réponse | 0 | 0 — **4 avaient été introduits**, tous corrigés |
| Biais de longueur de QCM, marqués 🔴 | 22 (toutes SNT) | 22 (toutes SNT) — **8 avaient été introduits sur les pages ES**, tous corrigés en étoffant les leurres |

⚠ **Ce qui n'a pas été touché** : les tables de `generer-seances.mjs` et
`generer-questions.mjs`. Y ajouter les pages ES produirait des entrées de séquence
pour des pages sans `data-sequence` — une incohérence en base. À faire **au
branchement**, pas avant.

---

## 6. Périmètre — ce qui n'est pas traité, et pourquoi

- **Thème 2 officiel « Le Soleil, notre source d'énergie »** (2.1 à 2.4) : hors
  périmètre, choix d'équipe. Les quatre cartes du hub sont **inchangées**.
- **1.3 la cellule vivante**, **3.2 l'histoire de l'âge de la Terre**, **4.4 entendre
  la musique** : SVT. Les deux premières cartes sont inchangées au hub ; **4.4 n'y
  figure pas** et n'a pas été ajoutée (une ligne, pour mémoire).
- **3.3 La Terre dans l'Univers** : **carte créée au hub** en `.a-venir` 🚧, aucune
  page produite — tu n'as pas encore le contenu.
- **Projet expérimental et numérique (PEN)** : hors chantier, carte inchangée.

**Deux détails de rangement**, pour mémoire :

- le sous-thème officiel **4.4 « Entendre la musique »** (SVT) **ne figure pas** dans
  le hub — ni avant, ni après ce chantier. Le brief demandait de ne pas retirer les
  cartes SVT existantes ; celle-ci n'existait pas, elle n'a pas été créée. Une ligne,
  sans insister ;
- le **brief lui-même** (`BRIEF-CLAUDE-CODE-ES1-sequences.md`) **n'est pas dans le
  dépôt** : il a été transmis directement. Son §13.1 veut qu'un document de pilotage
  vive dans `_suivi/`, puis rejoigne `_suivi/archives/livraisons/` à la clôture du
  chantier. À déposer si tu veux garder la trace de la commande à côté du présent
  fichier de vérification. La **spec compagnon**
  (`spec-es1-theme1-nucleosynthese-et-radioactivite.md`) n'a jamais été fournie et
  n'existe nulle part dans le dépôt : le chantier s'est fait sans elle.

---

## 7. Erreurs trouvées dans les documents sources

Sept erreurs, corrigées dans les pages et signalées sur place par un cadre
`.proposition`. **À reprendre dans les PDF d'origine si tu les rediffuses.**

| # | Document | L'erreur | La correction |
|---|---|---|---|
| 1 | Cristaux, exercice 3 | `m(atome de fer) = 9,35 × 10⁻² kg` — soit 93 g pour **un atome** | `9,35 × 10⁻²⁶ kg` : l'exposant a sauté. C'est la seule valeur qui redonne les 7,91 × 10³ kg·m⁻³ de ta correction |
| 2 | Cristaux, partie V | `ρ = Z × m(entité)`, **sans le dénominateur a³** | Ligne tronquée à la mise en page : ta propre correction divise bien par a³ |
| 3 | Forme de la Terre, exercice 1 | `5000 × 150 = 800 000 m` alors que la donnée annonce **1 stade = 160 m** | C'est 160 qui donne 800 000. Coquille sur le facteur |
| 4 | Son et musique, correction Q12 | `3¹² ≈ 2⁹` | **Faux d'un facteur mille** : 3¹² = 531 441 et 2⁹ = 512. L'égalité juste est `3¹² ≈ 2¹⁹` (531 441 contre 524 288) — et c'est cet écart de 1,4 % qui **est** le comma pythagoricien |
| 5 | Son à coder, correction ex. 2 | « la quantité de données à stocker est **16 fois** plus grande » (4 → 8 bits) | Elle **double**. Ce qui est multiplié par 16, c'est le nombre de **niveaux** (16 → 256) |
| 6 | Son à coder, énoncé ex. 6.2 | `N = 8 o` | À lire **3 octets** : ta correction calcule bien 3 × 8 = 24 bits |
| 7 | Nucléosynthèse, exercice 3 | L'oxygène écrit **Z = 6** dans ¹⁴N + ¹H → ¹⁵O + γ | Z = **8**, et la conservation de la charge l'impose (7 + 1 = 8). Les cinq autres réactions sont justes |

**Six divergences supplémentaires**, moins graves mais à trancher :

- **Radioactivité, image 10** : la légende dit « les noyaux **stables** sont en jaune
  et noir » — ce sont les **radioactifs** (le jaune et noir est le symbole du danger
  radioactif). Légende inversée dans la page.
- **Cristaux, image 11** : légendée « rayon dans une maille **cubique simple** », la
  même que l'image 10, alors qu'elle illustre la **CFC**. Copier-coller resté en place.
- **Nucléosynthèse, image 10** : légendée « **Explosion** de supernova », alors qu'elle
  montre une étoile intacte (supergéante rouge). Dans la page, elle est légendée comme
  une étoile avant l'effondrement, et suivie d'une photo du **rémanent de Kepler**
  (NASA/ESA, domaine public).
- **Forme de la Terre** : **deux exercices portent le numéro 4** (repérage des villes,
  puis distance à l'horizon). Le second est passé en bonus.
- **Cristaux** : le PDF est titré « **Chapitre 2** : Les édifices ordonnés » alors que
  le nom de fichier dit « Chapitre 3 - Les structures ordonnées ». Numérotation et
  titre à harmoniser.
- **Activité 1 de la radioactivité (Quizéo)** : le QCM écrit `²¹¹₉₄Po` et `²⁰⁷₉₂Pb`.
  Les numéros atomiques sont **84** et **82**. Le QCM a été reformulé en toutes lettres
  pour éviter d'avoir à trancher dans une notation.

---

## 8. Tri du dossier de dépôt — `_a-deposer/es1/`

18 fichiers déposés. **Verdict pour chacun** :

| Fichier | Verdict | Où c'est parti / pourquoi |
|---|---|---|
| `Thème 1 - Chapitre 1 - La nucléosynthèse (1).pdf` | **UTILISÉ — à conserver** | Texte et 14 images → `1re-es-t1-c1-nucleosynthese.html` + `assets/img/es/1re-es-t1-c1/`. C'est un **PPTX exporté** : les images 9/10/11 y sont vectorielles et non extractibles. Conserver le **PPTX d'origine** (pas ce PDF) → à ranger dans `assets/pptx/es/` si tu veux, sinon garder hors dépôt |
| `Thème 1 - Une longue histoire de la matière _ Chapitre 2 _ La radioactivité.pdf` | **UTILISÉ — intégré** | Cours complet (30 p.) → `1re-es-t1-c2-radioactivite.html` : les 4 « à retenir », toutes les définitions, 13 images, 11 liens. **Supprimable** |
| `Activité 1 - T1C2 La radioactivité.pdf` | **UTILISÉ — intégré** | → étape 1.4 (PhET, 2 réponses libres) et étape 1.3 (jeu d'étiquettes + QCM). **Supprimable** |
| `Activité 2 - T1C2 La radioactivité.pdf` | **UTILISÉ — intégré** | → étapes 2.3 et 2.4 (REMon, ExPop, 5 réponses libres). **Supprimable** |
| `Activité 3 - T1C2 La radioactivité.pdf` | **UTILISÉ — intégré** | → étape 3.4 (animation ensciences, texte à trous et 2 QCM repris tels quels). **Supprimable** |
| `S'exercer - T1C2 La radioactivité.pdf` | **UTILISÉ — intégré** | → séance 4 entière (3 exercices, tableau des demi-vies, infographie AFP). **Supprimable** — mais garder le lien vers le `.ggb` tant que le compte Quizéo existe (ES-02) |
| `Thème 1 - Chapitre 3 - Les structures ordonnées, les cristaux.pdf` | **NON UTILISÉ — doublon** | Identique à la version `[correction]`, aux corrigés près. Les QR codes y sont les mêmes. **Supprimable** |
| `Thème 1 - Chapitre 3 [correction] - … (1).pdf` | **UTILISÉ — à conserver** | Texte, corrigés et 9 images → `1re-es-t1-c3-cristaux.html`. **PPTX d'origine à conserver** : c'est de lui que doivent venir les 4 figures manquantes (ES-01) |
| `Thème 2 - Chapitre 2 - Le son, une information à coder.pdf` | **NON UTILISÉ — doublon** | Version sans corrigés de la suivante. **Supprimable** |
| `Thème 2 - Chapitre 2 [CORRECTION] - … .pdf` | **UTILISÉ — à conserver** | Texte, 7 corrigés et 12 images → `1re-es-t2-c2-son-a-coder.html`. **PPTX à conserver** pour l'image 5 (ES-05) |
| `Thème 3 - Chapitre 1 - La forme de la Terre.pdf` | **NON UTILISÉ — doublon** | Version sans corrigés. **Supprimable** |
| `Thème 3 - Chapitre 1 (correction) - La forme de la Terre.pdf` | **UTILISÉ — à conserver** | Texte, 5 corrigés et 17 images → `1re-es-t3-c1-forme-terre.html`. **PPTX à conserver** pour le schéma de l'horizon (ES-06) |
| `[Dossier] [Correction] Thème 2 - Chapitre 1 (1).pdf` | **UTILISÉ — à conserver** | 🎉 **Le TP tournant.** Dossier d'activités complet → `1re-es-t2-c1-son-et-musique.html`. **Le DOCX/PDF d'origine est à conserver** : c'est le document papier que les élèves remplissent en TP, et le graphique de Melde en vient (ES-04). Destination proposée : `assets/pdf/es/dossier-son-et-musique.pdf` |
| `Activité Introductive - Les mathématiques et la musique (octave).pdf` | **UTILISÉ — intégré** | 18 questions → séance 3 de « Son et musique ». **Supprimable** |
| `Activité Introductive (correction) - … (octave).pdf` | **UTILISÉ — intégré** | Les 18 réponses → révélations de la séance 3. **Supprimable** |
| `Lorigine des éléments chimiques. Episode 1 Du Big Bang à nous.mp4` | **NON UTILISÉ — à supprimer** | 🎉 L'**URL a été retrouvée** dans le QR code de la diapositive 4 et intégrée en façade. Le fichier n'a plus d'usage — et une vidéo n'a rien à faire dans un dépôt public |
| `Lorigine des éléments chimiques - Episode 2 Au coeur des étoiles.mp4` | **NON UTILISÉ — à supprimer** | Idem, QR de la diapositive 5 |
| `Lorigine des éléments chimiques. Episode 3 Des étoiles à la Terre (1).mp4` | **NON UTILISÉ — à supprimer** | Idem, QR de la diapositive 7 |

**En résumé** : 8 fichiers supprimables tout de suite (3 doublons, 3 `.mp4`, 2 PDF
d'activité déjà intégrés) · 6 à conserver, de préférence **sous leur forme PPTX/DOCX
d'origine**, parce qu'ils contiennent les figures vectorielles que le PDF ne rend pas ·
4 intégrés et supprimables une fois que tu auras relu les pages.

⚠ **Le dossier doit être vide entre deux chantiers.** Il contient encore
`ds/`, `fiches-outils/`, `fiches-t3c1/` et `tp/` — restes de chantiers précédents,
hors périmètre de celui-ci.

---

## 9. Les 24 URL récupérées par décodage de QR codes

Aucune n'a été vérifiée quant à son contenu (voir ES-11). Ordre : diapositive
d'origine → usage dans la page.

**Nucléosynthèse** — p2 `0lNuTSz6KVM` (Mendeleïev, bonus 1.5) · p3 `6j-pY_QjYRU`
(abondances, 1.3) · p4 `Jp5XXrVUcmw` (**épisode 1/3**, 1.4) · p5 `d7yaMkP-PTU`
(**épisode 2/3**, 2.2) · p7 `LFR2OjzhrYw` (**épisode 3/3**, 2.3) · p9 `2dKaCpZR9Qg`
(fission ou fusion, 2.5) · p10 `BEUJr1zYNhs` (réviser, bonus) · p10 Kahoot
« 1re ES — les éléments chimiques ».

**Cristaux** — p2 `shorts/bhvPfkEmQGM` (découverte, 1.1) · p5 `T7F2-lYyQrQ`
(s'exercer, 2.2) · p7 `G7Gev7eEkaw` (réviser compacité, 3.2) · p7 `-AviSs0o5Zk`
(bonus) · p8 `GIphJQtNqZs`, `RXPm_g65uTo`, `MtENHCUtqSk` (bonus).

**Son et musique** — p2 `P3QLmP1nxrA` (bonus) · p5 `fhGx8MwhkU8` (résonance, 2.1) ·
p5 `kZNjbWy6c7c` et `shorts/ohciUaOw1BE` (non placés) · p8 `CAjZjEyMAKo` (bonus) ·
p10 **animation « corde de Melde » de l'université de Nantes** (2.2) · p11
`jGmIFWf4pnI` (bonus) · p12 `55uKzZ3U07s` (bonus).

**Activité octave** — `cTYvCpLRwao` (Vled Tapas, séance 3) — celle-ci était **écrite
en clair** dans le document, elle est donc sûre.

> 💡 **Méthode réutilisable** : les diaporamas exportés en PDF perdent leurs liens
> hypertexte mais gardent leurs QR codes, qui se décodent (OpenCV, multi-échelle).
> C'est exactement le problème signalé pour `term-es-t2-c1` dans `chapitres.md`
> (« décoder les QR → liens vidéo, 7 chips en # ») : **la méthode existe maintenant**,
> le script est dans le scratchpad de la session et tient en vingt lignes.

---

## 10. Ce qui reste à faire, dans l'ordre

1. **Fournir les 6 images manquantes** (ES-01 à ES-06) : ce sont les seuls trous qui
   empêchent une étape de tourner en classe. Toutes sont des copies d'écran de
   diapositives que tu as déjà.
2. **Trancher les droits** (ES-07, ES-08, ES-09) avant toute diffusion large.
3. **Tester les trois ressources externes** depuis un poste du lycée (ES-10).
4. **Vérifier d'un coup d'œil les 24 vidéos** (ES-11).
5. **Décider pour le 4.1** (ES-03) : rehausser le chapitre de seconde T3-C1, ou non.
6. Relire les **40 cadres `.proposition`** et les **81 questions de QCM** : c'est tout
   le contenu que Claude a écrit, et il est intégralement signalé comme tel.
7. ~~Le branchement en base~~ — **fait le 13/09/2026** (§4). Reste **ES-13** : le tutoriel
   du dispositif, en T1-C1, est encore écrit **au futur** alors que la base est branchée —
   à repasser au présent (ta formulation, pas la mienne).

---

## 11. L'audit du chapitre T1-C1, appliqué — 12/09/2026

> Cette section **ne remplace pas** les précédentes : elle porte sur le seul chapitre
> `1re-es-t1-c1-nucleosynthese`, refondu à partir de l'audit dicté et du dépouillement
> des cinq vidéos. Les autres chapitres ES n'ont pas bougé.

### 11.1 Les huit lots, et ce qu'ils ont produit

| Lot | Audit | Fait |
|---|---|---|
| **0** Conventions | A1–A3, A5 | Gras **237 → 148** + 14 rouges (ramenés à 153 dont 17 rouges au second audit, §12). « Exercice » éliminé (6 occurrences). Trace écrite reformulée sans « dossier numérique ». **7 textes de transition**. Cadre d'activité orange. Comptage **118/94** aligné partout. « Anthropique » introduit en 1.2, « lithosphère » passée en infobulle. |
| **1** Glossaire | A4 | **Réponse à ta question : non, ce n'était pas implémenté.** Un glossaire existait (panneau flottant, 14 mots) mais **complet dès l'arrivée** et sans lien avec les survols. Il y a maintenant **18 entrées** qui s'ouvrent à la validation de leur étape, et **une seule source** — `#dico-source` — qui alimente aussi les infobulles. |
| **2** Structure | B1, B2, B3, C1 | Fusion/fission remonte **en fin de S1** (étape 1.4) ; l'ancienne 1.4 est démontée, sa vidéo rejoint 2.1. **Mini-QCM de prérequis** en 1.1, 5 questions, *sans enjeu*. Étape 1.2 complétée : rappel atome/ion/isotope, « peut-on aller au-delà de 92 », plutonium en réacteur, cadre pour la photo PULSTAR. |
| **3** Tableau périodique | E1 n°1-2 | **Deux tableaux SVG** générés par `_outils/es/tableau_periodique.py` : états + CHON (1.2), provenances + anthropique (2.4). 118 cases, contrôlées. |
| **4** Schémas | E1 n°3-7 | **Quatre schémas** générés par `_outils/es/noyaux.py` : chaîne primordiale, chaîne p-p, couches de l'étoile, fusions. (L'atelier de reconnaissance et son schéma de noyaux légers ont été retirés au second audit ; le schéma de fission, avec le faux exemple ¹⁵N + ¹H, le 13/09.) |
| **5** Postes et QCM | B5, C2 | **Deux postes de visionnage** complets (notes + dictionnaire), sur le modèle SNT. QCM de 2.1 : **3 → 8** questions ; 2.2 : **4 → 8**. Tous les biais de longueur de la page corrigés. |
| **6** Activités | B4, B7, C4 | Les trois graphiques **découpés en trois images**, chacun avec son **titre en menu déroulant** et une **légende libre** à repères numérotés (positions mesurées — voir ES-21). **Choix cliquable** sous chacune des 6 réactions. **Tri des noyaux** : tirage au nombre choisi (5 à 24), 4 destinations, réinitialisable. |
| **7** Bilan et révisions | D1, D2 | La question d'ouverture revient en **étape à part entière** (2.5), avec ce qu'on attend d'une réponse en devoir. Abondances du bilan S1 **en tableau**. Nouvelle **séance « Réviser »** : les 5 « à retenir » rassemblés, les 5 vidéos, un **QCM bilan de 18 questions**. |

### 11.2 Ce que l'audit a fait remonter dans le moteur partagé

Trois corrections dans `assets/js/sequence-snt.js` — donc **`?v=43` sur 20 fichiers**
(et non 6 : `CLAUDE.md` sous-estimait le périmètre, il est à corriger).

1. **La pastille de niveau tombait hors du cadre.** C'est ton « encadré mal cadré, en bas
   à droite du bloc À retenir ». Cause : `demarrer()` enveloppe le contenu d'un `.retain`
   dans un `.rb`, **puis** `initEvaluabilite()` ajoute la pastille — qui se retrouve
   frère du `.rb`, donc hors du padding. Désormais : **rien sur un « à retenir »** (son
   bandeau dit déjà « ★ À retenir »), et sur un champ, la pastille se pose **sur
   l'étiquette de type**. 17 champs concernés dans cette seule page.
2. **`data-facultatif` sur un QCM** : il ne valide pas l'étape et s'annonce « sans
   enjeu ». Il n'existait aucun moyen de poser un test de diagnostic.
3. **L'origine du glossaire** était écrite « Séquence Internet » **en dur**, aux deux
   points de moisson. Elle se déclare sur `<body data-origine-glossaire>`.

### 11.3 Une erreur scientifique de plus dans les sources

S'ajoute aux sept du §7 :

| # | Où | Ce qui est faux | Corrigé |
|---|---|---|---|
| 8 | Schéma de la chaîne primordiale (PDF de cours, repris de `ca-se-passe-la-haut.fr`) | Un **neutron** entre dans la réaction qui forme le béryllium 7. **4 + 1 ≠ 7.** | Le schéma tracé fait entrer un **hélium 3** (³He + ⁴He → ⁷Be + γ), et place le neutron à l'étape suivante (⁷Be + n → ⁷Li + p). **Le PDF d'origine porte encore l'erreur.** |
| 9 | Couches d'une étoile massive (PDF de cours) | La fusion du silicium donne du **⁵⁸Ni**. | **⁵⁶Ni**, qui se désintègre en ⁵⁶Fe — c'est ce que dit le texte du cours lui-même. |

### 11.4 Ce qui n'a pas pu être fait, et pourquoi

| Demande | État |
|---|---|
| **Photo du réacteur PULSTAR** (B3) | **Fait au second audit** : `t1c1-reacteur-pulstar.jpg`, CC BY-SA 3.0, Wikimedia Commons. |
| **Animation « vie et mort des étoiles »** (C3) | **Remplacée au second audit** par un paragraphe sur le rémanent et la photo du rémanent de Kepler ; le lien Observatoire de Paris est passé dans le bonus 2.6. `starinabox.net` n'a toujours pas été ouvert. |
| **« Le second QCM doit remonter en 1.1 »** (B2) | **Ambigu.** Le mini-QCM de prérequis est écrit et posé. Mais aucun QCM existant ne porte sur « ce qui vient d'être fait » en 1.1 — celui de 1.2 porte bien sur 1.2. **Dis-moi lequel tu visais.** |
| **Autres vidéos** (E3) | Annoncées dans l'audit, **pas fournies**. |
| **« À retenir » final à revoir ensemble** (D1) | Il est désormais **rassemblé en 3.1**, cinq encadrés, strictement dans le programme. À relire. |

### 11.5 La question du bas de page (B6)

Tu demandais à quoi sert « la zone de discussion en bas à droite ». Il y a **deux**
éléments flottants à cet endroit, et aucun n'est une zone de discussion :

- **📖 Glossaire** (violet, toujours visible) : le lexique **de toute l'année**,
  cherchable, tous chapitres confondus. Il vient du moteur, il est utile — son rôle
  n'était simplement **annoncé nulle part**. Il l'est maintenant, dans l'en-tête du
  glossaire de bas de page.
- **💬 N retours** (`#corr-pastille`) : le raccourci vers **les retours du professeur**
  sur les réponses rédigées. Il **ne s'affiche que s'il y a des retours** — donc jamais
  sur cette page, tant que la base n'est pas branchée. **À conserver.**

### 11.6 Comment régénérer les schémas

```
python _outils/es/tableau_periodique.py     # les 2 tableaux périodiques
python _outils/es/noyaux.py                 # les 6 schémas de noyaux
```

Les deux **écrivent les `.svg` dans `assets/img/es/1re-es-t1-c1/` et les injectent dans
la page**, entre marqueurs `<!-- SVG:nom -->`. Ne pas retoucher un SVG à la main dans le
HTML : la prochaine exécution l'écrasera. 🔴 `noyaux.py` **refuse de dessiner au-delà de
20 nucléons** — pour l'uranium, on garde le schéma du cours.

### 11.7 Contrôles passés

- `node verifier.mjs` → **18 problèmes**, le repère exact (les 18 liens `cfa/outil-*`).
  Aucun point de vigilance sur cette page : ni couleur en dur, ni id dupliqué, ni biais
  de longueur de QCM.
- Au navigateur, page entière dépliée : **0 erreur JS**, **0 id dupliqué**, **0 iframe
  chargée** avant clic (les 7 vidéos sont montées en affiches de consentement), 0
  pastille orpheline.
- Les deux activités **jouées pour de vrai** : les 6 choix se corrigent et valident
  l'étape ; le tri tire 24 noyaux, les place, annonce 24/24 et se réinitialise.
- Le glossaire **testé en validant deux étapes** : 6 mots sur 16 s'ouvrent, les autres
  restent annoncés « à découvrir — étape 2.2 ».

---

## 12. Second audit du chapitre T1-C1 — 12-13/09/2026

> Porte sur la seule page `1re-es-t1-c1-nucleosynthese`, après ta relecture du
> 12/09. Tout se fait **dans la page** et dans les deux générateurs : le moteur partagé
> `sequence-snt.js` n'a **pas** été touché.

### 12.1 Ce qui a changé dans la page

| Où | Fait |
|---|---|
| Partout | Mentions « cours de M. Van Hoorde » retirées (13) ; cadres « Proposition — Difficulté » retirés (6) ; réactions `.reac` centrées. |
| 1.1 | Encart « Première mécanique : le QCM » avant le QCM de prérequis ; « Deuxième mécanique : la réponse rédigée ». |
| 1.2 | Photo PULSTAR en place. QCM : « éléments naturels » → 92 / **94** / 118 / 103. Encart « 🧭 La classification te suit » sous le tableau. |
| 1.3 | Cinquième rang au tableau (Ca 4,1 % ; autres 8,2 %). Légendes des trois graphiques en **saisie libre** (ES-21), la légende avant le titre. Encart « Quatrième mécanique : la légende à compléter ». |
| 1.4 | Explications des six choix réécrites ; l'item 3 accepte aussi « fission », avec l'explication du piège (désintégration α, chapitre 2). Réponse rédigée NUC-2f supprimée (redondante). QCM NUC-2e réécrit, 8 questions. |
| 2.1 | Second cadre de notes et atelier « reconnaître les noyaux » supprimés ; lien Observatoire de Paris déplacé en bonus 2.6. |
| 2.3 | Paragraphe « rémanent de supernova » + photo du rémanent de Kepler ; question « Qu'est-ce qu'une supernova ? » ajoutée au QCM. |
| 2.4 | Ancien tableau à compléter supprimé : « Chaque noyau à son usine » devient le point 2. |
| 2.5 | Tableau des provenances placé **après** la réponse rédigée, sous « Pour conclure — qui a fabriqué quoi ». |
| 3.2 | Vidéo de révision et Kahoot rapatriés depuis le bonus ; 5 liens YouTube réparés (`youtube-nocookie.com/watch` n'existe pas). |
| Schémas | Chaîne p-p redessinée (bilan 4 ¹H → ⁴He + 2 e⁺ + 2 ν) ; couches de l'étoile en disques pleins ; **⁵⁸Ni → ⁵⁶Ni** (§11.3, n° 9) ; doublons « 2²H » / « 3³He » de la chaîne primordiale corrigés ; légende en vraies billes. |
| QCM de prérequis | Coquille « l'isotype considéré » → « l'isotope ». |

### 12.2 Une étape se valide quand TOUT y est fait

Le moteur valide une étape au **premier** bloc réussi : en 1.3, un seul « Vérifier »
remplissait le cercle. Un script en fin de page intercepte `etape-validee` en phase de
capture et le **retient** tant qu'un bloc de l'étape reste à faire (réponse rédigée,
QCM non facultatif, texte à trous vérifié, tri réussi, légende libre remplie, les six
choix justes). Le cercle de l'étape se **remplit au prorata** (`data-avance`), et le
« à retenir » reste fermé avec la note « il te reste N activités ».

Joué au navigateur en parcours d'élève réel, sans rien forcer : les 9 étapes à valider
se valident ; 1.3 progresse de 13 en 13 % et ne se valide qu'au 8ᵉ bloc ; 1.4 marche
dans les deux ordres ; 2.4 attend le texte à trous **et** le tri ; 0 erreur JS.

🔴 Le mécanisme vit **dans cette page**. S'il convient, il a vocation à remonter dans
le moteur — mais alors pour les 22 pages, avec le bump `?v=` qui va avec.

### 12.3 Gras et rouge, remis à la table des conventions

**153 gras dont 17 rouges** (au lieu de 203 dont 23). Plus aucun gras dans une légende de
figure ; plus aucun rouge hors d'un « à retenir » ; un seul gras par correction de QCM
et par explication de choix ; un terme en gras à sa **première** occurrence seulement ;
dans un « à retenir », le rouge seul, sans gras d'appoint. Le gras d'interface
(« Objectif — », « à savoir », titres de ressources) et celui des cadres de chantier
n'ont pas été touchés.

Une exception assumée : l'encadré 3 de la révision (« Fusion et fission ») garde **deux
rouges**, les deux mots formant une seule notion à restituer.

### 12.4 Le panneau « Classification périodique »

Bouton **🧪 Classification**, au-dessus du glossaire. Il ouvre, sans voile, le tableau de
l'étape 1.2 ; une case touchée affiche la fiche de l'élément : nom, symbole, Z (= nombre
de protons), état à 20 °C, artificiel ou non, CHON, famille (lanthanides, actinides).
**La provenance n'y figure pas** : c'est la réponse de la séance 2. Masqué pendant les
QCM et les réponses rédigées. Utilisable au clavier (Tab, Entrée, Échap).

Les **118 noms français** vivent dans `_outils/es/tableau_periodique.py` et vont dans le
`<title>` de chaque case (survol, lecteur d'écran) : le panneau les y relit.

### 12.5 Corrections issues de l'audit de Claude (13/09)

Audit complet par Claude dans `_suivi/t1c1-audit-claude-2026-09-13.md`. Seules les
**corrections certaines** ont été appliquées (§7 de l'audit) :

- **Lithosphère** : la colonne B du tableau de 1.3 est en **pourcentages de masse** ;
  l'unité est désormais dite, sans changer les valeurs, et l'« absence d'hydrogène »
  est expliquée par l'unité (remarque, bilan S1, révision, QCM).
- **Exemple de fission** : ¹⁵N + ¹H n'en était pas une ; remplacé par la fission de
  l'uranium 235. Schéma en billes retiré.
- QCM : « Z > 92 » → « Z > 94 » ; réaction du bore retirée des réactions stellaires ;
  distracteur « fission spontanée » remplacé ; surface du Soleil en K.
- Plutonium présenté comme élément de la frontière (Z = 94), plus comme exception
  aux 24 anthropiques ; seuil du silicium à 8 masses solaires ; règle du Z « en
  première approximation », sans chevauchement ; chaîne p-p écrite en e⁺ comme sur le
  schéma de 2.2 ; en-tête « presque aucun élément ».
- **Les cadres `.chantier` et `.proposition` ne s'affichent plus qu'en mode enseignant.**

### 12.6 Vu pendant le second audit, hors de son périmètre

- **Les boutons `.btn` du moteur s'affichent en Times New Roman** (« Vérifier »,
  « Répondre », « Nouveau tirage »…) : la règle de `sequence-snt.css` demande
  `"IBM Plex Sans"` **sans police de secours**, et cette police est cassée (voir
  `CLAUDE.md`). Correctif d'une ligne, mais dans le CSS partagé : 22 pages et un bump.
- **Tri des noyaux** : noyau sélectionné + toucher une colonne **sur un noyau déjà
  posé** → c'est ce noyau-là qui est sélectionné, au lieu d'y déposer le premier.
- **Bug « Étape suivante descend trop loin »** (séance 1) : **non reproduit** en 820×1180,
  1024×768 et 768×1024, y compris 1.4 → bonus 1.5 — le défilement se pose toujours à
  108 px, sous la barre. À revoir avec l'appareil exact (Safari iPad ?).

