# BRIEF — Refonte de `t0` « Les systèmes informatisés »

**Destinataire :** Claude Code, dans le dépôt `MVanHoorde/Site-Web-Portfolio` ouvert dans VS Code.
**Rédigé le :** 23/08/2026 · **Auteur du cadrage :** Loïc (arbitrages) + Claude (structure).
**Statut de tout contenu pédagogique ci-dessous :** proposition V1. Loïc reste souverain sur le fond, le ton et le barème. Ne rien inventer au-delà de ce brief : signaler et demander.

**Audit de départ :** `_suivi/t0-audit-2026-08-23.md`. Le lire en entier avant de commencer.

---

## 0. Périmètre — lire en premier

### Ce qu'il faut produire

La **refonte complète** de `pages/2nde-snt-t0-systemes-informatises.html` :
portage sur le moteur partagé, **trois séances** au lieu de deux, et la
**totalité** du contenu des trois documents source de Loïc — la page n'en porte
aujourd'hui que 43 %.

C'est la séquence qui **enseigne le fonctionnement du cours à des élèves qui
découvrent le site**. Chaque mécanisme y est d'abord **expliqué**, puis
**mis en action** dans une étape suivante. À la fin de `t0`, un élève doit
avoir utilisé de ses mains tous les dispositifs qu'il rencontrera dans l'année.

### Ce qu'il ne faut surtout PAS produire

- ❌ **Aucune migration de base de données.** `t0` n'utilise que des mécanismes
  déjà en base.
- ❌ **Aucun nouveau composant.** Tout existe déjà dans `sequence-snt.js`. Si un
  besoin semble réclamer un composant neuf, c'est presque toujours qu'un
  composant existant n'a pas été trouvé : chercher d'abord dans `t1`.
- ❌ **Ne pas modifier le moteur** (`sequence-snt.js`, `sequence-snt.css`) sauf
  nécessité démontrée — et alors le signaler, pas le faire en silence. Toute
  modification du moteur déborde sur `m1`, `t1`, `t2` et le hub.
- ❌ **Ne pas toucher aux six séquences non migrées** (`t3`→`t7`). Hors périmètre.
- ❌ Aucun CDN, aucun `localStorage`, aucune couleur en dur hors `:root`.

### Le piège de cette refonte en particulier

`t0` est aujourd'hui un **fork figé du moteur** : 272 lignes de `<style>` et
229 lignes de `<script>` en ligne, soit 46 % du fichier. La tentation sera de
corriger ce fork. **Il faut le supprimer**, pas le réparer. Bonne nouvelle :
**91 des 94 classes** de `t0` sont déjà reconnues par `sequence-snt.css`
(le moteur a été extrait de la même souche). Seules `a-noter`, `switch` et
`tlabel` sont orphelines.

---

## 1. Fichiers à lire avant d'écrire une ligne

Obligatoire, dans cet ordre :

| Fichier | Pourquoi |
|---|---|
| `_suivi/t0-audit-2026-08-23.md` | L'état des lieux mesuré. Ne pas refaire le diagnostic. |
| `_suivi/t0-images.md` | Le manifeste des 47 images déjà déposées, avec provenances et pièges de résolution. |
| `_modeles/CONSIGNES-sequence-SNT.md` | La grammaire complète. §3 trajet d'étape, §5 règles techniques, §10 validation, §11 livraison, §15 mécanismes transverses. |
| `pages/2nde-snt-t1-internet.html` | **La référence structurelle.** Entête, marquage, navigation, et le gabarit exact de chaque type d'exercice. Voir §4 ci-dessous pour la carte des emprunts. |
| `assets/js/sequence-snt.js` | Le moteur. Repérer en particulier `initEvaluabilite()` (§1ter) et le mode enseignant (§3). |
| `assets/css/sequence-snt.css` | Vérifier quelles classes de `t0` sont déjà couvertes avant d'en inventer. |
| `assets/js/verrou-snt.js` | Le plafond d'avance. Comprendre pourquoi il ne ferme rien seul. |
| `verifier.mjs`, `generer-seances.mjs`, `generer-questions.mjs` | Les trois scripts à relancer. |
| `pages/2nde-snt.html` | Le hub. `data-seances` de `t0` passe de 3 à 4. |
| `_suivi/DECISIONS.md` | Y consigner les décisions du §2. |

**Règle absolue du projet :** lire le vrai code avant de proposer. Ne jamais
partir d'une hypothèse sur ce que contient un fichier.

---

## 2. Décisions déjà validées par Loïc (ne pas rouvrir)

| # | Décision | Date |
|---|---|---|
| T0-1 | **Préfixe de code : `SYS-*`.** Fixé. Suit la logique `NET-*` / `WEB-*` / `REP-*`. | 23/08 |
| T0-2 | **Trois séances**, plus l'activité débranchée. | 23/08 |
| T0-3 | **L'activité débranchée « autopsie d'une tour » reste en chantier** (⏳, ressource 🚧, **sans `data-gate`**). Pas de poste disponible. Ne pas la développer. | 23/08 |
| T0-4 | **Le dépôt sur le classeur numérique OneDrive s'enseigne hors du cours en ligne.** `t0` le suppose acquis et n'explique pas le geste. Ce que `t0` enseigne, c'est la **génération de la fiche** par le site. | 23/08 |
| T0-5 | **Supprimer la phrase « cette page ne garde rien en mémoire ».** Fausse dès le portage, et elle donne un mauvais motif au rituel de la fiche. | 23/08 |
| T0-6 | **Les élèves relèvent certains ports en photo** sur les postes de la salle, via le mécanisme de dépôt de copie d'écran. | 23/08 |
| T0-7 | **Les quatre photos de Loïc sont publiables** et peuvent être présentées comme **sa propre machine** — c'est un ressort pédagogique, pas un aveu. | 23/08 |
| T0-8 | **Les captures macOS et ChromeOS sont conservées.** Décision explicite de Loïc : usage non commercial, pédagogique. *Note versée au dossier : le critère juridique n'est pas la commercialité mais le caractère **public** du site ; à revoir si le site s'ouvre à d'autres établissements. Créditer auteur et source à côté de chaque image.* | 23/08 |
| T0-9 | Le tableau « Computer Ports Identification » est **écarté** (aucune licence identifiable) et **remplacé par un jeu de connecteurs en SVG**. | 23/08 |

---

## 3. Architecture des trois séances

Principe directeur : **un mécanisme est expliqué, puis mis en action à l'étape
suivante.** Jamais expliqué sans être pratiqué dans la même séance.

### Répartition des mécanismes

| Séance | Mécanismes présentés | Mis en action sur |
|---|---|---|
| 1 | tout le mode d'emploi (1.1) · QCM plein écran · texte à trous · **réponse rédigée envoyée en correction** · réponse perso non notée · fiche de fin de séance | 1.2 → 1.6 |
| 2 | **dépôt de copie d'écran** · « à retenir » masqué · **glossaire permanent** | 2.2 → 2.5 |
| 3 | **entraide** · **mode enseignant à code** · plafond d'avance | 3.4 → 3.6 |

### Séance 1 — « Des machines partout, et un cours qui s'apprend en le faisant »

Contenu : introduction et **Étape 1** du document source (constitution et
fonctionnalités de l'Internet).

| Étape | Titre | Type | Niveau |
|---|---|---|---|
| 1.1 | **Bienvenue — le mode d'emploi de ton cours** | doc long + QCM récapitulatif | ★★ `data-gate` |
| 1.2 | Les systèmes informatisés sont partout | doc + QCM plein écran | ★★ `data-gate` |
| 1.3 | Internet, ce n'est pas le Web : serveurs, terminaux, services | doc + tri/association | ★★ `data-gate` |
| 1.4 | Ce qu'on fait avec — et ce qu'on fait sans | doc + **réponse rédigée `SYS-R1`** | ★ `data-gate` |
| 1.5 | Le rituel de fin de séance : ta fiche | doc | — |
| 1.6 | Et toi ? | perso `SYS-P1` | — |
| bonus | Pour aller plus loin + clin d'œil NSI | repliable | ✦ |

**L'étape 1.1 est la pièce maîtresse de la séquence.** Elle est volontairement
longue. Elle doit couvrir, dans cet ordre :

1. **La géographie** — séquence, séance, étape ; on entre par le hub, pas par un
   favori.
2. **Le trajet d'une étape** — objectif 🎯, ressource, « à retenir », exercice.
   Y compris le « à retenir » **masqué** jusqu'à un clic sur les étapes fournies.
3. **Les pastilles** — ⚪ à faire · 🟡 envoyé, en attente · 🟢 validé.
4. **La révélation séquentielle** — une étape à la fois, bouton « Étape
   suivante ↓ ».
5. **La barre de progression** à gauche, son repli ⇤ / ⇥, le clic pour naviguer.
6. **L'échelle d'évaluabilité** ★★ · ★ · ○ · ✦ · — avec le tableau des cinq
   marques. *(Le moteur les injecte automatiquement : ne pas les écrire à la
   main dans le HTML.)*
7. **Le déblocage par le mérite** — toutes les étapes `à valider` d'une séance
   vertes → la suivante s'ouvre.
8. **Le plafond d'avance** — au plus **deux séances ouvertes en avance** sur ce
   que la classe a réellement fait. ⚠️ Le texte doit dire vrai : le jour de la
   rentrée, rien n'étant clôturé, les séances 1 et 2 sont ouvertes et la 3 est
   fermée. Formuler « on avance ensemble », pas « tu peux prendre deux séances
   d'avance ».
9. **Les cinq types d'exercice et leur mode de correction** — c'est le point que
   Loïc veut explicite :

   | Type | Corrigé par | Ce que voit l'élève |
   |---|---|---|
   | QCM | le navigateur, **en direct** | vert / rouge immédiat + bonne réponse |
   | texte à trous | le navigateur, **en direct** | cases vertes / rouges |
   | association, tri | le navigateur, **en direct** | idem |
   | **réponse rédigée** | **envoyée**, pré-corrigée, **puis validée par le professeur** | 🟡 en attente, puis 🟢 avec un retour écrit |
   | réponse personnelle | **jamais corrigée** | pas de bonne réponse, sert la discussion de classe |

10. **Le copier-coller bloqué** sur les rédigés, et pourquoi.
11. **La fiche de fin de séance** — la page enregistre tout, la fiche sert à
    garder une trace hors ligne. *(Ne pas expliquer le dépôt OneDrive — T0-4.)*
12. **Le glossaire**, **l'entraide** et **le mode enseignant** : annoncés en une
    phrase chacun, avec renvoi aux séances 2 et 3 où ils seront pratiqués.

Puis un **QCM récapitulatif** en plein écran, `SYS-Q1`, de **6 à 8 questions**,
qui vérifie que le mode d'emploi est passé. C'est ce QCM qui `data-gate`
l'étape.

### Séance 2 — « Dans le ventre de la machine »

Contenu : **Étape 2** du document source, partie composants internes.

| Étape | Titre | Type | Niveau |
|---|---|---|---|
| 2.1 | Un terminal informatique, c'est quoi ? | doc + QCM | ★★ `data-gate` |
| 2.2 | L'alimentation — du secteur aux composants | doc + texte à trous | ★★ `data-gate` |
| 2.3 | La carte mère, le processeur, la mémoire vive | doc + « à retenir » masqué + association | ★★ `data-gate` |
| 2.4 | Les cartes d'extension | doc + **dépôt de copie d'écran** `SYS-D1` | ★ `data-gate` |
| 2.5 | Le stockage : optique, magnétique, flash | doc + QCM + **glossaire** | ★★ `data-gate` |
| 2.6 | Autopsie d'une vraie machine | légende de la photo de Loïc | ★ `data-gate` |
| bonus | ROM, BIOS, UEFI · IDE/PATA → SATA | repliable | ✦ |

Notions **obligatoirement** couvertes, toutes absentes de la page actuelle :
terminal informatique · extrémité du réseau · PSU · 230 V → +12 V / +5 V ·
batterie · circuit imprimé · ROM · BIOS · UEFI · CPU / Central Processing Unit ·
cœurs · GHz · RAM / Random Access Memory · « ça rame » · unité centrale ·
cartes d'extension · PCIe (et PCI, AGP en bonus) · GPU · mémoire vidéo ·
carte son · carte réseau · carte Wi-Fi · contrôleur USB · lecteurs optiques ·
CD / DVD / BluRay · polycarbonate · laser · disquette · HDD · SSD ·
mémoire flash · IDE / PATA · SATA · miniaturisation et intégration à la carte mère.

**Étape 2.4 — dépôt de copie d'écran.** L'élève cherche en ligne l'image d'une
carte d'extension (graphique, son, réseau ou Wi-Fi), la dépose, et indique
laquelle. Porter le mécanisme depuis la séance 4 de `t1`. Prévoir la consigne
« une copie d'écran de ce qu'on te demande d'observer, jamais une photo
personnelle ».
*Décision ouverte, à signaler et non trancher : la recherche en ligne suppose
des postes disponibles. Prévoir un repli où la carte est fournie en image et où
l'élève la nomme.*

**Étape 2.6 — la photo de Loïc.** Utiliser `1000009209` (intérieur ouvert de sa
machine). Y sont visibles et légendables : la carte mère, deux barrettes de
mémoire vive, la carte graphique (PNY GeForce RTX 5080), l'emplacement M.2
sérigraphié `M.2 PCIe 4.0`, le bloc de refroidissement liquide sur le
processeur avec son afficheur CPU/GPU, et les ventilateurs. Présenter la machine
comme **celle du professeur** (T0-7) — le contraste avec la vieille tour de la
séance 3 est un ressort de la séquence.

### Séance 3 — « Brancher juste, et choisir sa machine »

Contenu : **Étape 2** partie périphériques externes, et **Étape 3** entière.

| Étape | Titre | Type | Niveau |
|---|---|---|---|
| 3.1 | Les périphériques externes et leurs connectiques | doc + **SVG des connecteurs** + association | ★★ `data-gate` |
| 3.2 | L'USB, le port qui a tout remplacé | doc + QCM | ★★ `data-gate` |
| 3.3 | **Autopsie d'une façade arrière** | légende sur les photos de Loïc | ★ `data-gate` |
| 3.4 | Relève les ports de ton poste | **dépôt de photo** `SYS-D2` + **entraide** | ★ `data-gate` |
| 3.5 | Choisir une machine : six critères | doc + **réponse rédigée `SYS-R2`** | ★ `data-gate` |
| 3.6 | Les derniers rouages : entraide et mode enseignant | doc + QCM | ★★ `data-gate` |
| 3.7 | Et toi, quelle machine ? | perso `SYS-P2` | — |
| bonus | Définition ≠ résolution · PS/2 et DB-25 · USB4 | repliable | ✦ |

Notions **obligatoirement** couvertes : moniteur · VGA · DVI · HDMI ·
DisplayPort · enceintes · casque · micro · jack · RCA · S/PDIF · box internet ·
routeur · NAS · RJ45 · souris · clavier · imprimante · scanner ·
USB / Universal Serial Bus · USB-A 2.0 et 3.1 SuperSpeed · micro-USB-B ·
USB-C · USB4 · PS/2 · DB-25 · mobilité · appareils fixes / mobiles · pouce ·
2,54 cm · **définition vs résolution** · dpi · densité · tactile · touchpad ·
puissance · fréquence · stockage · système d'exploitation · Windows · Android ·
macOS · iOS · Linux · ChromeOS.

**Étape 3.3 — le cœur de la séance.** Deux photos de Loïc, en vis-à-vis :

- `1000009211` — arrière d'une **vieille tour**. Légendables : interrupteur
  230 V, prise secteur C14, deux ports PS/2 (violet clavier, vert souris), DVI,
  VGA, quatre USB-A 2.0, deux USB-A 3.0 (bleus), RJ45, trois jacks audio
  (rose micro, vert sortie, bleu entrée), une carte d'extension à sortie DVI,
  deux antennes Wi-Fi.
  ⚠️ **Recadrer ou flouter le code-barres du numéro de série** avant intégration.
- `1000009210` — arrière de la **machine récente**, câblée. Légendables : HDMI,
  DisplayPort, un second HDMI, USB, PS/2, USB 3.2, RJ45, trois jacks audio, et
  les sorties de la carte graphique en dessous.

L'exercice que le document source n'a pas et qui vaut le détour : **qu'est-ce
qui a disparu, qu'est-ce qui est apparu ?** (PS/2 et VGA en voie d'extinction,
DisplayPort arrivé, USB partout). C'est la meilleure porte d'entrée vers l'idée
que le matériel a une histoire.

`1000009208` (unité centrale fermée) sert d'illustration au mot « unité
centrale » en 2.1.

**Étape 3.4 — relevé photo.** T0-6. L'élève photographie les ports de son poste
avec sa tablette et dépose l'image. Une fois validé, il devient ressource pour
ses camarades : c'est là qu'on présente l'**entraide**.

---

## 4. Carte des emprunts à `t1`

Ne rien réinventer. Chaque composant existe déjà et fonctionne.

| Besoin | Où le prendre |
|---|---|
| Entête complet, `<body data-sequence>` | `t1`, lignes 1–20 |
| QCM plein écran | `t1`, `<div class="qcmbox" data-code="…">` + `<script type="application/json" class="qcm-data">` |
| Réponse rédigée envoyée en correction | `t1`, `data-focus-code` / `data-focus-question` / `data-focus-min` / `data-focus-max` |
| Réponse personnelle non notée | `t1`, `data-perso-code` / `data-perso-question` / `data-perso-titre` |
| Texte à trous | `t1`, étape 5.1 |
| Tri / association | `t1`, `data-ordre` / `data-tri-libelle` / `data-tri-indices` |
| **Dépôt de copie d'écran** | `t1`, séance 4 — `data-depot-code`, `.depot-btn`, `.depot-zone`, `.depot-apercu` |
| **« À retenir » masqué** | `t1`, séance 4 — `data-reveal-bilan` |
| Glossaire | `t1`, `data-glossaire` (20 occurrences, choisir un cas simple) |
| Indices à deux niveaux | `t1`, `data-indice1` / `data-indice2` |
| Bandeau de verrouillage | `t1`, `.lock-banner` + `.lockable` |

---

## 5. Les images

**Les 47 images sont déjà dans le dépôt**, traitées et nommées, dans
`assets/img/snt/2nde-snt-t0-systemes-informatises/`. Manifeste complet et
avertissements : **`_suivi/t0-images.md`**, à lire avant d'en placer une seule.

Elles viennent de trois sources qui ne se traitent pas pareil :

- `📷` **4 photos de Loïc** — sa machine et une vieille tour. Aucune
  restriction ; **les présenter comme la machine du professeur**, c'est un
  ressort de la séquence. Numéro de série déjà flouté.
- `🌐` **2 images Wikimedia** (processeur i9-14900KF, SSD mSATA sur disque dur)
  — **crédit auteur + licence obligatoires** à côté de l'image.
- `📄` **41 images extraites des PDF du cours de Loïc** — provenance tierce non
  traçable, donc **aucun crédit possible**. Publication assumée par Loïc au
  titre de la décision T0-8. Ne pas inventer d'attribution.

### Trois pièges de résolution

- `t0-carte-mere.jpg` fait **640 × 480**. Cela suffit pour illustrer, **pas
  pour l'exercice de légende pleine largeur** de l'étape 2.3. Deux issues :
  rabattre l'exercice sur `t0-photo-machine-recente-interieur.jpg` (1100 px,
  photo de Loïc), ou signaler à Loïc qu'il faut une carte mère haute
  définition. **Ne pas agrandir** l'image existante.
- `t0-resolution-ecran.jpg` : **à ne pas utiliser**. C'est le schéma à refaire
  en SVG, et il confond définition et résolution comme le document source.
- Six fichiers sont sous 300 px (`t0-boitier-tour`, `t0-moniteur`,
  `t0-cable-vga`, `t0-cable-rca`, `t0-ssd-et-hdd`, `t0-logos-os`) : **vignettes
  de bandeau uniquement**.

### Ce qui reste à produire en SVG

Aucun n'est couvert par les photos. Palette du cours, auto-hébergé.

1. **Le jeu de connecteurs** à la même échelle, support de l'exercice
   d'association de 3.1 — remplace le tableau anglophone écarté (T0-9). Les
   photos de câbles servent d'illustration, pas d'exercice : ni même échelle,
   ni même fond.
   `VGA` · `DVI` · `HDMI` · `DisplayPort` · `RJ45` · `jack 3,5 mm` ·
   `S/PDIF optique` · `USB-A 2.0` · `USB-A 3.x` · `micro-USB-B` · `USB-C` ·
   `PS/2 clavier` · `PS/2 souris` · `C13/C14 secteur`
2. **Slots PCIe** x1 / x4 / x16 comparés.
3. **Pouces et diagonale** — le 15″ = 38,1 cm.
4. **Définition vs résolution**, proprement distinguées.

### Cadres vides à réserver

Seulement pour ce qui manque encore. Poser un cadre `🚧 image à venir` aux
bonnes proportions, pour que la mise en page ne bouge plus :

1. **Systèmes « qui n'en ont pas l'air »** — bandeau de trois vignettes.
   Accroche de la séance 1, rien dans les documents source ne la couvre.
2. **Montre connectée** et **baie de serveurs** — deux vignettes.
3. **Carte mère haute définition**, si l'exercice de 2.3 est maintenu en pleine
   largeur.

### Convention, pour toute image ajoutée ensuite

Maximum **1100 px de large** (jamais agrandir), JPEG qualité 84, progressif,
optimisé, **sous 300 Ko**. Redresser l'EXIF à l'enregistrement. Originaux
haute définition hors du dépôt. Aucune image appelée depuis un domaine
extérieur.

## 6. Questions et grilles

Créer les entrées `SYS-*` et les faire connaître aux deux fichiers générés.

| Code | Étape | Type |
|---|---|---|
| `SYS-Q1` | 1.1 | QCM récapitulatif du mode d'emploi, 6–8 questions |
| `SYS-R1` | 1.4 | réponse rédigée — ce qu'on peut faire sans connexion |
| `SYS-P1` | 1.6 | perso — les systèmes croisés depuis ce matin |
| `SYS-D1` | 2.4 | dépôt — une carte d'extension |
| `SYS-D2` | 3.4 | dépôt — les ports de ton poste |
| `SYS-R2` | 3.5 | réponse rédigée — quelle machine pour quel usage |
| `SYS-P2` | 3.7 | perso — et toi, quelle machine |

Puis :
- `node generer-questions.mjs` → `assets/js/questions-snt.js`
- Grilles de `SYS-R1` et `SYS-R2` dans `ia-snt/criteres-snt.json`, **marquées
  `"_statut"`**, à deux étages comme celles de `t1`.
- ⚠️ Les `SYS-P*` sont des **réponses personnelles** : pas de grille, elles ne
  partent jamais en correction. Vérifier qu'elles portent bien `.perso`.
- ⚠️ **Rédiger les critères sans clause d'exclusion.** Les petits modèles
  traitent comme requis tout élément mentionné dans un critère socle, même
  qualifié de facultatif.

---

## 7. Points d'intégration à ne pas oublier

| Fichier | Ce qui change |
|---|---|
| `pages/2nde-snt.html` | `data-seances` de `t0` : **3 → 4** (trois séances + la débranchée) |
| `generer-seances.mjs` | Relancer ; `snt-t0` est déjà dans `THEMES` |
| `assets/js/seances-snt.js` | Régénéré, `?v=` incrémenté **partout** |
| `assets/css/sequence-snt.css` · `assets/js/sequence-snt.js` | `?v=39` → `?v=40` sur **les 5 pages** qui les chargent, hub compris |
| `verifier.mjs` | Doit voir les 44 couleurs en dur disparaître et les clés `t0` rester uniques |
| `REPRISE.md` §1 | **Corriger la ligne fautive** qui affirme que `t0` est portée sur le moteur |
| `_suivi/DECISIONS.md` · `ETAT-PROJET.md` · `JOURNAL.md` · `chapitres.md` | Mis à jour |

Le pied de page « **Maquette V0** » disparaît. Le bloc
`<aside class="chantier">` de la ligne 338 est **supprimé** (son contenu est
désormais périmé) ; s'il en faut un nouveau pour la débranchée, le rédiger
court. Poser `class="eleve"` sur `<body>` n'est **pas** la solution : cette
classe n'est activée nulle part dans le dépôt.

---

## 8. Validation avant livraison

```text
□ node --check sur le JS extrait de la page
□ node verifier.mjs → EXACTEMENT 18 problèmes connus (bloquant si écart)
□ node generer-seances.mjs → verifier.mjs annonce « seances-snt.js à jour »
□ node generer-questions.mjs → 41 + 7 = 48 questions
□ grep : aucun googleapis / cdn / unpkg / jsdelivr
□ grep : aucun localStorage / sessionStorage
□ grep : aucune couleur en dur hors du bloc :root  (44 → 0)
□ grep : plus aucun data-qcm / data-check-cloze / data-check-diagram /
         data-free / data-share — ce sont les marqueurs du fork supprimé
□ grep : fins de ligne LF, pas de CR introduit
□ toutes les balises <img> pointent vers assets/img/snt/2nde-snt-t0-…/ ;
  aucune image absente, aucun chemin cassé
□ chaque image 🌐 porte son crédit auteur + licence dans le HTML
□ aucune image agrandie au-delà de sa taille native
□ les 12 data-cle existantes sont CONSERVÉES à l'identique sur les étapes
  correspondantes ; les nouvelles étapes reçoivent des clés sémantiques neuves
□ Playwright, sur la machine de Loïc (Chromium non installable en session) :
  □ chargement sans erreur JS
  □ séances 2 et 3 verrouillées à l'arrivée → valider les data-gate → déblocage
  □ mode enseignant : demande un CODE, coupe après 30 min, rétablit à l'extinction
  □ réponse rédigée : envoi réel, pastille 🟡, aucun setTimeout de simulation
  □ dépôt de copie d'écran : l'image reste affichée, l'étape se valide
  □ « à retenir » masqué : apparaît au clic
  □ glossaire : bouton présent, recherche approximative fonctionnelle
  □ barre de progression : présente, repliable ⇤ / ⇥
  □ marques d'évaluabilité : injectées automatiquement sur tous les blocs
  □ réhydratation : recharger, les réponses sont toujours là
  □ « Télécharger ma fiche » contient les réponses
  □ captures 1280 / 820 / 390 px
□ Contrôle visuel des captures AVANT livraison
```

**Tester sur l'état calculé** (`getComputedStyle` sur la vraie page), jamais sur
le texte des règles CSS. Le projet a déjà connu 169 contrôles au vert avec 4
bugs réels en place.

**Le test qui compte le plus :** ouvrir la page **sans être connecté**, puis
**connecté**, et vérifier qu'un QCM validé produit bien un appel réseau. Le bug
d'origine était précisément qu'aucun n'était émis alors que
`Progression.disponible()` renvoyait `true`.

---

## 9. Livraison attendue

Les images sont **déjà dans le dépôt** : ne pas les redéposer dans l'archive,
sauf celles que tu aurais retouchées ou ajoutées.

1. **Archive delta** à la racine du dépôt, arborescence reproduite, uniquement
   les fichiers créés ou modifiés. Exclure `ia-snt/.env` :
   `zip -r depot.zip . -x "ia-snt/.env" ".git/*"`
2. Un fichier **`A-LIRE.md`** dans l'archive.
3. Le **`git diff --stat`**.
4. Les captures aux trois largeurs.
5. **Récapitulatif final** : décisions prises, décisions laissées ouvertes,
   images encore manquantes, liens inertes.

**Jalon dans `_suivi/chapitres.md`**, entrée `snt-t0` : maquette V0 · contenu
complet · interactivité complète · ressources définitives · VALIDÉ.

---

## 10. À ne pas décider seul — remonter à Loïc

- **Tout contenu pédagogique** des §3 : ce sont des propositions V1.
- Le **contenu exact du QCM `SYS-Q1`** et des deux rédigés.
- Le **niveau d'exigence** des grilles `SYS-R1` et `SYS-R2`.
- La **recherche en ligne en 2.4** : dépend de la disponibilité des postes.
  Prévoir le repli, signaler la question.
- Toute **notion du programme** qu'il faudrait ajouter au-delà des documents
  source.

Les chantiers ouverts se documentent **dans la page**, en
`<aside class="chantier">`, pas en accumulation de marqueurs inline. Ne pas
interrompre l'implémentation pour poser une question, sauf si la décision est
réellement bloquante.
