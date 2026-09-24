# État du projet

> **Réécrit** à chaque session, jamais empilé. Ce fichier décrit **l'état
> courant** — jamais comment on y est arrivé.
> Historique → `JOURNAL.md` · décisions → `DECISIONS.md` · détail par chapitre →
> `chapitres.md` · contexte et règles → `CLAUDE.md` · index → `MANIFESTE.md`.
>
> Dernière réécriture : **24/09/2026**.
>
> 🔴 **Ce paragraphe ne liste plus les passes.** Il en accumulait trente-deux,
> soudées par des « Passe du même jour » — l'empilement que ce fichier est
> précisément censé éviter. La suite des passes vit dans `JOURNAL.md`, qui est
> fait pour ça ; ici ne restent que l'état courant et ce qui bloque.
>
> **Dernière passe — le moteur des séquences, après le cours de terminale (24/09).**
> Pour **toutes** les pages du moteur (`sequence-snt.js?v=50`, `.css?v=45`) :
> une étape n'est validée qu'à sa **dernière** question rédigée (la 1ʳᵉ réponse
> validait l'étape et ouvrait « Séance terminée » au `term-es-t2-c1` 1.5 ;
> 32 étapes concernées, dont 8 en `t1`) ; la fenêtre d'écriture et le QCM
> **se réduisent** pour relire l'énoncé ; « **Modifier ma réponse** » tant que
> la copie n'est pas corrigée ; **palette de symboles** (grec, exposants,
> indices). **DigiView abandonné** : les 6 vidéos de t0, t1, m1 reviennent en
> `youtube-nocookie`, lancées d'un seul clic. La fiche lit sa matière dans la
> page (elle se disait « SNT · Seconde » partout).
> ⏳ **À auditer par Loïc** : les **5 fiches de l'ES de terminale** ont une
> partie fixe **V1** au standard SNT (`t2-c1` S1-S2, `t2-c2` S1-S3), mesurées
> remplies à 4, 4, 3, 3 et 3 pages — au-dessus des 2 visées ; points de fond
> listés dans chaque commentaire `FICHE DE LA SÉANCE`. Et à observer en
> classe : la vidéo « C'est pas sorcier » du `t2-c1`, irréprochable hors du lycée.
>
> **Même jour — l'ES de terminale est ouvert aux élèves.** Le `019`
> a été exécuté dans Supabase : `EST303` et `EST606` sont **ouvertes aux
> inscriptions** (vérifié à l'écran, `actif = true`), les élèves de T3 et T6
> peuvent créer leur compte et leur travail est enregistré. Les **27 cadres de
> travail** des deux chapitres du thème 2 (12 au `t2-c1`, 15 au `t2-c2`) ne sont
> plus visibles des élèves : ils reviennent d'un clic sur « mode enseignant ».
> Deux cadres affirmaient encore que « la progression n'est pas enregistrée »,
> faux depuis le branchement du 13/09 — réécrits. La **frise** est retirée du hub
> de terminale (elle demande le serveur local) et l'accueil ne dit plus « 🚧
> chapitres en chantier » pour l'ES de terminale. Détail : `DECISIONS.md`.
>
> **Passe précédente — SNT t0 après le premier test en classe (22/09).** Les
> étapes 1.5, 2.2 et 3.6 de `t0` se valident enfin, par un QCM de 3 questions ;
> la fiche et « Séance terminée » n'arrivent plus avant l'étape qui les explique,
> et ce pop-up ne revient plus à chaque rechargement. L'élève est prévenu par une
> fenêtre quand Loïc valide ou renvoie sa copie. La table des réponses types
> manquait en base : migration 011 exécutée par Loïc. Détail : `DECISIONS.md`.
> ⚠ **Effet à surveiller en classe** : un élève qui avait fini la séance 1 (ou 2,
> ou 3) avant le 22/09 voit la séance suivante se refermer tant qu'il n'a pas
> fait le nouveau QCM — une minute, ou le mode enseignant.
> **Même jour — T1-C1 outillé de bout en bout.** Page reprise (26 crayons,
> exercices dans l'ordre), diaporama **validé par Loïc** (19 diapositives,
> tous les exercices, Kahoot en clôture), fiche de 12 pages écrite et liée
> depuis la page. Deux règles valent désormais pour tous les diaporamas :
> Kahoot en clôture et tous les exercices projetés. Détail : `chapitres.md`.
> La passe précédente (T1-C2 aligné sur T1-C3, chaîne des diaporamas
> versionnée) est au `JOURNAL.md` du 20/09.
>
> 🔴 **Ce qui demande une relecture de Loïc en priorité** : l'étape 1.5 « Si ça tourne
> mal » de `o3` — seul contenu du dépôt qui engage la **sécurité d'élèves**. Elle est
> désormais conforme à la **circulaire 2024-074** (relue le 12/09, sept situations),
> mais reste à confronter au **règlement du laboratoire** et aux **équipements réels de
> la salle 0.26** : le texte officiel ne dit pas où sont la douche et le rince-œil. Ensuite, les **six arbitrages en attente** (O-23 à O-26, O-28, O-29).
> 🆕 Et depuis le 06/09 : les **six images manquantes de l'ES 1re** (ES-01 à ES-06),
> sans lesquelles trois exercices n'ont pas d'énoncé complet — toutes sont des copies
> d'écran de diapositives que Loïc a déjà. Tout est listé dans
> `_suivi/es1-verification.md`, qui est **le fichier à ouvrir** pour ce chantier.

## 🧪 Essai iPad : la fiche de la séance 1 de t0 passe par Safari — à tester le 25/09

**Le bug, vu en classe.** Ouvert depuis l'icône de l'écran d'accueil ou depuis le
lecteur de QR code, le cours n'est pas dans Safari : iOS y ignore `window.print()`
sans rien dire. Le bouton « Enregistrer en PDF » de la fiche ne fait rien, et l'élève
ne peut pas déposer son PDF sur OneDrive. Tout le moteur est concerné (SNT, outils PC,
ES) ; dans Safari lui-même, tout marche.

**L'essai, limité à la fiche de la séance 1 de `2nde-snt-t0`**, dans un script
propre à la page (le moteur partagé n'est pas touché, aucun `?v=N` à incrémenter) :
si l'impression ne s'ouvre pas dans les 1,5 s, la fiche propose « Ouvrir ma fiche
dans Safari » par l'adresse `x-safari-https://…?fiche=1`. Dans Safari, un encadré
fait se connecter l'élève (le stockage de l'app n'est pas celui de Safari), puis
ouvre la fiche d'un clic. Rejoué au Chromium, impression neutralisée : les quatre
cas passent. **Pas testable ici :** que `x-safari-https://` ouvre vraiment Safari
depuis l'app et depuis le lecteur QR. C'est ce que dit le test en classe.

**Après le test :** concluant → porter dans `sequence-snt.js` (toutes les séances,
les 22 pages, guides élèves et enseignants) ; raté → retirer le bloc
`ESSAI iPad` de la page et dire aux élèves d'ouvrir le cours dans Safari.

## ✅ Chaque TP est sous son chapitre, et le 🚧 « TP » a disparu du hub

**Appliqué le 20/09/2026.** Loïc a redéposé les quinze sujets de TP de seconde
dans `_a-deposer/tp/TP/`. Premier constat, mesuré : les **quinze PDF sont
identiques au bit** à ceux déjà en ligne (md5 égaux) — la renumérotation du 05/09
était bien appliquée, **aucun fichier à remplacer**.

**Ce que la relecture des en-têtes a trouvé.** Le contrôle du 05/09 avait vérifié
le *numéro* imprimé sur chaque feuille, pas le *chapitre* inscrit dans son
en-tête. En lisant les quinze en-têtes (THÈME + Chapitre, première page), trois
rattachements du hub divergeaient du document distribué en classe :

| TP | En-tête du document | Était au hub | Décision de Loïc |
|---|---|---|---|
| TP3 *Pourquoi saler…* | T1-C2 seul | T1-C1 **et** T1-C2 | retiré de T1-C1 |
| TP8 *Un tir au canon* | T2-**C1** | T2-**C2** | déplacé en T2-C1 |
| TP13 *Réfraction / Dispersion / Spectres* | T3-C3 **et C4** | T3-C3 seul | ajouté à T3-C4 |

Le troisième expliquait le 🚧 de T3-C4 : ce n'était pas un TP manquant, c'était un
TP non lié. Le renvoi 🧪 de T1-C1 vers le TP3 **reste** dans le fil du cours, partie
« corps pur ou mélange » : un renvoi contextuel n'est pas un rattachement.

**Le 🚧 « TP en travaux » disparaît du hub — les quatre.** T1-C3 (atome), T1-C6
(cortège électronique), T2-C2 (modéliser une action, depuis le départ du TP8) et
T2-C3 (principe d'inertie) n'ont aucun TP, et n'en attendent pas : la progression
en compte quinze, tous en ligne. Le chantier annonçait un manque qui n'existe pas.
Le hub ne porte plus **aucun** 🚧 de TP.

**Fichiers touchés** — `2nde-physique-chimie.html` (7 cartes : liens et comptes),
`2nde-pc-t2-c1-decrire-le-mouvement.html` et `…t2-c2-modeliser-une-action.html`
(le renvoi 🧪 du TP8 suit le TP), `…t3-c4-refraction-reflexion.html` (renvoi 🧪 du
TP13 en fin de partie 03), plus `chapitres.md` et `DECISIONS.md`.

**Contrôlé, pas supposé.** Un audit Playwright du hub confronte le `.cp-compte`
annoncé de chaque carte à ses liens réels : **15 cartes, 0 écart**. `node
verifier.mjs` rend **exactement 19 problèmes**, le repère du jour — aucune
régression, aucun lien de TP cassé.

⚠ **Ce qui n'est pas fait, et attend un arbitrage.** Le dépôt contient les
**quinze corrigés de TP** (`TPn [CORRECTION]…`), plus la grille d'évaluation et les
coups de pouce du TP5, les programmes Python de TP7, TP9 et TP12, les fichiers
LatisPro du TP2 et les tableurs du TP3. **Rien n'a été mis en ligne** : la
décision D1 du 26/08 tient — les corrections partent par mail contre preuve de
travail. Les publier serait une décision nouvelle.

## ✅ Les huit outils de 2nde PC sont ouverts

Décision de Loïc, **20/09/2026** : *« les figures seront à compléter au fur et à
mesure… on peut les mettre en ligne pour le moment. Je vais juste pas les lancer
aux élèves pour que mes collègues puissent voir au moins. »*

`o6` a été ouvert par le chantier O4-O6, puis **`o7` et `o8`** dans la foulée,
après leur refonte. `node verifier.mjs` ne liste **plus aucun outil** parmi les
contenus hors d'atteinte — il n'en reste que six, tous en ES de 1re.

**Ce qui a été fait dans la même livraison**, comme l'exige la règle du 19/09 :
les cartes OUTIL 7 et OUTIL 8 du hub portent leurs deux entrées (cours + fiche
PDF), `prof/guide-ap.html` annonce **les huit outils** avec les descriptions d'O7
et d'O8 et sa date de révision au 20 septembre, et les quatre PDF de guides sont
régénérés. 🔴 **Le mot aux collègues reste à envoyer** — il est rédigé dans
`_suivi/outils-o4-o6.md` §1, et couvre les trois outils d'un coup.

**Ce qui est publié en étant incomplet, et pourquoi c'est sans danger :**

| | Ce qui manque | Pourquoi ça passe |
|---|---|---|
| `o4`, `o5` | 4 figures | cadres de réservation visibles, le texte se suffit |
| `o7` | 3 figures | idem |
| `o8` | 8 captures d'écran | idem |
| `o8b`, `o8c` | **17 procédures non vérifiées** sur machines | elles portent `data-verifie="non"`, **le disent à l'élève** et renvoient au simulateur NumWorks. C'est la prudence qui est à l'écran — 🔴 ne pas retirer ces avertissements avant d'avoir vérifié sur machine |

Les pages sœurs `o8b` (tableur) et `o8c` (calculatrice) **ne figurent pas au hub**,
à dessein : on n'y entre que depuis O8, leur prérequis affiché.

---

## 🆕 Les outils O7 et O8 sont refondus — une méthode, et trois pages pour O8

Chantier du 20/09/2026, mené depuis le brief « Refonte des outils O7 et O8 » et
son audit compagnon. Décisions&nbsp;: `DECISIONS.md`, second bloc du 20/09.
Récit&nbsp;: `JOURNAL.md`.

🔴 **Pour reprendre&nbsp;: `_suivi/o7-o8-a-revoir.md`.** C’est **le** fichier à
ouvrir — quatre décisions à trancher (dont deux qui décident si les élèves voient
ces outils), trois figures et huit captures à produire, dix-sept procédures de
calculatrice à confirmer, une donnée à recaler, et la liste de ce qu’il ne faut
**pas** rouvrir. Le détail de ce qui a été fait vit dans
`archives/livraisons/A-LIRE-OUTILS-O7-O8-2026-09-20.md`.

**O7 — une seule méthode.** Le triangle n'est plus une méthode&nbsp;: il ne reste
qu'un encadré de cinq lignes, **sans dessin et sans mode d'emploi**, qui dit qu'il
existe, pourquoi il s'arrête (une somme, un carré, plus de trois lettres) et qu'on
passe à autre chose. La « méthode des chiffres » et les « cinq niveaux » ont
disparu. À la place&nbsp;: la balance, le tableau des opérations inverses en neuf
lignes, la méthode en trois temps, sa **rédaction attendue** (une ligne par
opération, l'opération notée en marge) et **cinq cas délicats**, chacun résolu puis
estompé. Puis **71 relations** en 10 séries, classées **par structure algébrique**
et non par difficulté&nbsp;: l'élève qui s'est planté sur un dénominateur vient
chercher la série (c), pas « le niveau 2 ».

**Les 71 corrigés sont vérifiés par le calcul.** Pour chacun&nbsp;: on fixe les
variables indépendantes, la relation de départ est donc vraie par construction, et
on contrôle que la formule du corrigé redonne la grandeur isolée — sur trois jeux
de valeurs. Les huit **copies fautives** de la série (i) sont contrôlées à
l'envers&nbsp;: leur formule doit NE PAS redonner la bonne valeur. Aucun écart.

**O8 — trois pages, un seul jeu de données.** Le tronc commun garde tout
l'existant et gagne deux étapes&nbsp;: **proportionnalité contre fonction affine**
(avec la loi d'Ohm et un étalonnage en regard), **quand a-t-on le droit de forcer
l'origine**, **interpolation contre extrapolation**, le **domaine de validité**, et
**R² avec sa mise en garde**. Deux pages sœurs le prolongent&nbsp;:
`2nde-pc-o8b-graphique-tableur.html` (5 parcours, 6 étapes identiques pour tous) et
`2nde-pc-o8c-graphique-calculatrice.html` (7 parcours, 7 étapes identiques). La
numérotation des outils **reste 1 → 8**&nbsp;: les deux sœurs ne figurent pas au
hub, on n'y entre que depuis O8, qui est leur **prérequis affiché**.

🔴 **Le jeu de données vit à un seul endroit** — `assets/js/o8-donnees.js`, chargé
par les trois pages. **Pente, ordonnée à l'origine, R² et interpolations y sont
calculés**, jamais recopiés&nbsp;: une valeur affichée ne peut pas diverger du
tableau que l'élève a sous les yeux. 🔴 **Nouvel asset partagé**&nbsp;: le modifier
oblige à incrémenter son `?v=N` dans les **trois** pages.

🔴 **Ce qui bloque — les captures, et les machines.** **8 captures d'écran**
manquent (Excel bureau ×2, LibreOffice ×2, Google Sheets, NumWorks, TI-83,
Casio 35+E II) et **3 figures** pour O7 (balance, machine à opérations, exemple
annoté). Surtout&nbsp;: **17 procédures de calculatrice ne sont pas vérifiées** —
la TI-82 Advanced et la fx-92 Collège entièrement, plus la régression
proportionnelle sur TI et Casio et l'interface de la Graph Math+. Elles portent
`data-verifie="non"`, **l'élève le voit**, et chacune renvoie au simulateur
NumWorks. Liste complète dans le rapport de livraison.

🔴 **Les masses volumiques de l'étalonnage D2 sont plausibles, pas sourcées.**
Elles donnent une droite affine cohérente et une ordonnée à l'origine égale à la
masse volumique de l'eau — ce qui suffit à l'enseignement visé — mais elles sont à
**recaler sur une table de référence** avant d'être présentées comme des valeurs
mesurées. Marqué en commentaire dans `assets/js/o8-donnees.js`.

⏳ **Deux arbitrages en attente.** (1) La **fiche O8 passe à trois pages** —
dérogation à la règle des deux pages de `CONSIGNES-outil-PC.md` §7, déclarée dans
`exporter-fiches.mjs`. Motif&nbsp;: le cours a doublé, et le §7 interdit qu'une
partie du cours vive seulement à l'écran. Si la dérogation est refusée, c'est la
**grille vierge** du verso qui sortira, pas le cours. (2) **O7 et O8 restent 🚧 au
hub** — mais l'ouverture d'O6 le 20/09 rend `o7` **atteignable par son renvoi**, et
la version que les élèves y trouvent est désormais la version refondue.

**Ce qui n'a pas bougé.** Le moteur partagé n'est pas touché&nbsp;: l'auto-évaluation
des 71 items et le sélecteur de matériel sont codés **en local dans les pages**
(`CONSIGNES-outil-PC.md` §5). Le choix de matériel est gardé en **localStorage** —
c'est une préférence d'affichage, pas du travail d'élève&nbsp;: rien ne part en base.

## 🆕 Les outils O4, O5 et O6 sont repris, fiches comprises — et O6 est ouvert

Chantier du 20/09/2026, mené depuis le rapport d'audit et le brief du même jour.
Décisions&nbsp;: `DECISIONS.md`, bloc du 20/09. Récit&nbsp;: `JOURNAL.md`.

**État des trois pages**

| | Ce qui a été ajouté | Figures |
|---|---|---|
| **o4** | photos adjointes aux 17 schémas · In/Ex · tolérances A/B (hors programme) · rinçage, double trait, tare · 8 pièces de matériel courant · **étape 1.5 &laquo; Dessiner le montage &raquo;** · exercice 6 (copie à corriger) · grille d'auto-évaluation | **9 posées** · 2 cadres de réservation |
| **o5** | &laquo; si… alors… &raquo; · protocole / expérience · temps et personne · tableau de mesures · valeur de référence · retour critique · exercice 6 · grille | 0 · **2 cadres de réservation** |
| **o6** | exercices **7 à 10** en trois séries — conversions qui piègent, résultats à juger, loi d'Ohm et réfraction · grille | 0 · aucun cadre&nbsp;: les trois figures demandées existent déjà en HTML |

**🔴 Ce qui bloque — deux figures, et une seule cause.** Les figures **O4-04**
(fiole jaugée) et **O4-05** (pipette à deux traits) sont les deux figures de
priorité haute de O4, et les deux images déposées sont **fausses**&nbsp;: la fiole
porte une échelle graduée complète au lieu d'un trait unique, avec &laquo; 70 &raquo;
écrit deux fois. Ce qu'il faut voir sur chacune est écrit dans le cadre de
réservation, sur la page. Deux autres cadres attendent en O5&nbsp;: le schéma
&laquo; bon contre mauvais &raquo; (O5-02) et la copie annotée en trois couleurs (O5-04).

**✅ O6 est ouvert aux élèves et aux collègues** (20/09, décision de Loïc). Lien
rétabli sur le hub de 2nde PC, `guide-ap.html` mis à jour — &laquo; six outils ouverts &raquo;,
descriptions d'O4 et d'O5 complétées, date de révision au 20 septembre — et les
quatre PDF de guides régénérés. **Reste à envoyer le mot à CASTEL et HUSSON.**

🔴 **Effet de bord à trancher&nbsp;: `o7` est devenu atteignable.** L'outil 6 renvoie
vers l'outil 7 pour isoler une grandeur&nbsp;; en ouvrant `o6`, ce renvoi rend `o7`
accessible alors que le hub l'annonce encore &laquo; 🚧 en travaux &raquo;. Deux sorties&nbsp;:
l'ouvrir lui aussi, ou retirer le renvoi. `verifier.mjs` ne compte plus que **7**
contenus hors d'atteinte, contre 9 le 19/09.

**✅ Les trois fiches A4 sont enrichies**, et chacune tient toujours en **deux pages
exactement** (mesuré : `209,9 × 297,0 mm`, une `.feuille` = une page).

| Fiche | Ce qui y est descendu | Ce qu'il a fallu arbitrer |
|---|---|---|
| **o4** | In/Ex · le petit matériel de la paillasse (8 pièces) · rinçage de la verrerie · double trait · tare | rien — le recto avait de la place |
| **o5** | protocole / expérience et les temps de verbe · les règles du tableau de mesures · valeur de référence et retour critique · deux cases de checklist | le verso était plein&nbsp;: le **tableau de mesures rempli** n'y est pas, seules ses **règles** y figurent — le modèle vit sur la page en ligne |
| **o6** | le barème des **six conversions qui piègent** | il remplace le bloc &laquo; trois oublis &raquo;, dont il reprend les deux pièges |

🔴 **Les tolérances de classe A ne sont pas descendues sur la fiche O4** — faute de
place, et parce qu'elles ne sont **pas exigibles**. Elles restent en &laquo; pour aller
plus loin &raquo; sur la page. À recouper avec les inscriptions de la verrerie du lycée.

Sur `o4` et `o5`, les espacements du verso ont été resserrés pour accueillir ces
ajouts&nbsp;: **seule la forme a changé, aucun texte n'a été retiré**. Les trois
planches de cartes de `2nde-pc-o4/` n'ont finalement pas servi — les fiches portent
déjà leurs propres schémas au trait.

## 🆕 Ce qui est prêt doit arriver aux collègues — et `verifier.mjs` le rappelle

Règle posée par Loïc le 19/09/2026, dans `CLAUDE.md` : *« quand c'est gérable pour
un cours et que je vais l'utiliser, mes collègues doivent l'avoir — quitte à ce que
tu me le rappelles. »*

Le rappel ne repose pas sur la mémoire. `node verifier.mjs` sort maintenant, en
points de vigilance, les **contenus écrits mais hors d'atteinte depuis l'accueil** :
il part d'`index.html` et suit les liens de proche en proche, **commentaires HTML
retirés**. Ce que ce parcours n'atteint pas n'existe pas pour un élève — ni pour une
collègue.

**Neuf contenus au 19/09/2026** :

| Masqué | Depuis | Pour qui ça compte |
|---|---|---|
| `1re-es-t1-c2-radioactivite` · `t1-c3-cristaux` · `t2-c1-son-et-musique` · `t2-c2-son-a-coder` · `t3-c1-forme-terre` | 13/09 (`MASQUÉ-ES1`) | **CASTEL**, qui a deux classes d'ES et n'a donc qu'un chapitre à montrer |
| `1re-pc-cristaux` (ancienne fiche) | 13/09 | idem |
| `2nde-pc-o6` · `o7` · `o8` | 05/09 (🚧 au hub) | **CASTEL et HUSSON** en AP : cinq outils sur huit |

🔴 **Le parcours, pas le lien entrant.** Un chapitre masqué garde un lien vers le
suivant, masqué lui aussi : compter les liens entrants en déclarait deux accessibles
sur neuf. Mesuré le 19/09 en écrivant le contrôle.

Quand l'un d'eux s'ouvre, la livraison comprend : le lien rétabli, le **guide de la
matière** et sa date de révision, le PDF régénéré, et le **mot à envoyer** aux
collègues, proposé à Loïc.

## 🆕 Deux collègues dans le tableau de bord : ES 1re et AP de physique-chimie

Demande de Loïc du 17/09/2026. **CASTEL** prend l'enseignement scientifique en
**1re 5** et **1re 6**, *plus* un groupe d'**AP** de physique-chimie ; **HUSSON**
prend un groupe d'**AP**, et rien d'autre. Elles ne font pas de SNT.

**Rien à coder côté espaces** : depuis le `018`, un compte voit les espaces où il a
une classe. CASTEL aura donc l'accueil « Mes espaces » à deux cartes, HUSSON entrera
directement dans l'espace de physique-chimie. Le cloisonnement du `016` fait le
reste : chacune ne voit que ses classes.

**Ce qui est livré**

| Quoi | Où |
|---|---|
| Quatre classes + les deux rattachements | `bdd/schema/020-classes-collegues-es-ap.sql` |
| Guide « enseignement scientifique de 1re » | `prof/guide-es.html` · PDF `assets/pdf/prof/guide-es.pdf` |
| Guide « l'AP de physique-chimie » | `prof/guide-ap.html` · PDF `assets/pdf/prof/guide-ap.pdf` |
| 🔴 Un guide **par matière**, pas par personne (19/09) | qui a les deux cours reçoit les deux guides |
| Lien *Aide* qui suit l'espace ouvert, encart des guides | `prof/index.html` |
| Les quatre guides à l'export | `exporter-guides.mjs` |

Les deux guides couvrent, en plus des gestes du tableau de bord, **les adresses du
site en toutes lettres** (cliquables à l'écran, lisibles sur le PDF) et **la mise du
site sur l'écran d'accueil de l'iPad** — geste à faire faire à la classe entière à la
première séance.

**Les quatre codes** (19/09) : `ES1R05` · `ES1R06` · `APCAST` · `APHUSS`. Les deux
groupes d'AP portent le **nom de leur professeure** parce qu'ils ne correspondent à
aucune classe de 2nde : ils mélangent des élèves de toutes les secondes, et leur
composition bouge dans l'année.

🔴 **Il reste un geste à faire, dans Supabase, et il ne peut pas l'être d'ici**

**Créer les deux comptes** (Authentication → Users → Add user, *Auto confirm* coché,
mot de passe conforme à la politique du projet), puis exécuter les deux lignes
`rattacher_enseignant()` du `020` §3 — elles sont écrites, adresses comprises. Tant que
ce n'est pas fait, leur tableau de bord est vide : c'est le seul effet visible de
l'entre-deux, et il se répare en une ligne.

**Ce qui n'a pas été changé, et qu'il faudra regarder**

- **L'ES 1re reste masquée** (13/09) : CASTEL n'aura qu'une séquence — la
  nucléosynthèse — et aucune fiche de séance. Son guide le dit franchement. C'est le
  chantier à ouvrir en premier si elle veut s'en servir vraiment (`es1-verification.md`
  §0bis).
- **Trois outils de PC sur huit** restent marqués 🚧 sur le hub de 2nde (O6, O7, O8) :
  l'AP dispose donc de cinq outils.

## 🆕 ES 1re : la nucléosynthèse seule, prête pour les élèves

Décision de Loïc du 13/09/2026. Le hub de 1re n'ouvre plus que **T1-C1** ; les cinq
autres chapitres et l'ancienne fiche des cristaux sont en commentaire (`MASQUÉ-ES1`).
La **fiche de séance est coupée** sur les six pages par `<body data-fiche="non">`,
nouvel interrupteur de `sequence-snt.js` (**`?v=47`, 21 fichiers**).

Page nucléosynthèse remise en état pour les élèves : avertissement « progression pas
encore enregistrée » retiré du pied de page (faux depuis le branchement), tutoriel 1.1
au présent (ES-13), lien vers le chapitre 2 masqué, deux cadres de chantier périmés
supprimés. **Défaut corrigé** : le glossaire du chapitre ne se rouvrait pas au retour
d'un élève connecté (il relisait les étapes avant la reprise depuis la base).

🔴 **Dès qu'on retravaille l'ES 1re, tout se démasque** : `_suivi/es1-verification.md`
§0bis. `verifier.mjs` : 19 problèmes, les mêmes que sur HEAD (dont l'indice de niveau
1 de `term-es-t2-c2`, préexistant).

## 🆕 Les fiches de séance d'Internet (t1) sont auditées

Audit de Loïc du 13/09/2026, séances 1 à 6. Chaque séance a sa partie fixe, rangée
**par étape du cours** : l'« à retenir » à côté de son image, le travail de l'élève en
cadres titrés. Schémas de structure redessinés aux couleurs de la fiche : services /
route (S1), datagramme avec détour et mini-frise des quatre dates de 2.3 (S2),
topologies (S4), encapsulation **complétée** — celle de la page est construite en JS —
et réseau A-B-C-D (S5), adresse IPv4 en octets, réseau local et hiérarchie DNS (S6).

Mesurées remplies (Chromium, PDF A4) : **S1 2 · S2 3 · S3 1 · S4 4** (5 avec le
bonus rempli) **· S5 3 · S6 3** pages. Banc d'essai : fausses réponses d'environ
130 caractères ; des réponses réelles plus longues allongent S4.

**Générateur** (`sequence-snt.js?v=46`, 21 fichiers) : emplacement
`data-fiche-tableaux` ; les productions d'un bonus (perso, dépôts, notes) vont dans
« Pour aller plus loin » ; le renvoi « 🔭 à voir plus tard » ne s'imprime plus dans les
« à retenir » ; classes `fx-sans-lbl`, `fx-petit`, `fx-trio`. Et un défaut ancien :
le filtre des tableaux visait `[data-reveal]`, que le moteur pose sur **chaque
section** — aucun tableau rempli n'arrivait sur une fiche. Effet mesuré sur t0 et
m1 : même nombre de pages, m1 S1 retrouve son tableau des combinaisons.

- 🔴 **À relire par Loïc** : les textes écrits pour la fiche — l'« à retenir » du
  datagramme (la page n'en a pas), le paragraphe de synthèse de 4.4, la phrase
  d'exemples de câbles, les adresses d'exemple de S6 (`203.0.113.7`, réservée à la
  documentation ; `1.1.1.1`, `8.8.8.8`).
- ⏳ **Deux écarts relevés dans la page, non tranchés** : la correction de la frise
  (2.4) marque six « dates à retenir » (1969, 1973, 1978, 1980, 1983, 1989) quand
  l'« à retenir » de 2.3 en donne d'autres (1971, 1983, 1986) — la fiche suit 2.3 ;
  l'encadré 2.2 CYCLADES est marqué « ✦ bonus » alors que le datagramme est central.
- ⏳ Le bandeau « il reste à envoyer » répète le nom d'une étape autant de fois qu'elle
  a de questions (S4 : trois fois « Du réseau mondial à ta maison »).

## 🆕 SNT : les « à retenir » se lisent d'un regard, le gras est allégé

**Fait le 13/09/2026, sur les 9 pages SNT** (t0-t7, m1) et donc sur leurs fiches, qui
lisent les blocs dans la page. Les 80 « à retenir » sont passés en puces courtes, sans
`<code>`, avec 3 `<dfn>` rouges et 2 gras au plus. Le gras du corps a été divisé
par deux environ (t1 : 636 → 329 · t2 : 493 → 264 · m1 : 455 → 220 · t0 : 525 → 310).
Règles : `CONSIGNES-sequence-SNT.md` §6 ; contrôle : `python _outils/tests/mesure_retenir.py
pages/<page>.html` → `alertes=0` partout. Moteur partagé : `sequence-snt.css?v=43`,
`sequence-snt.js` (depuis passé en `?v=46`). Fiches générées et mesurées (1 à 3 pages A4, vides).

**Corrections de fond faites à la suite, avec l'accord de Loïc** : t2 — l'IP n'est plus
dite « passerelle » (c'est la box), étapes renumérotées (séance 3 : 3.1-3.4 ; séance 4 :
4.1-4.5) · t0 1.1 — « passe au vert dès que tu as répondu », la validation du
professeur venant ensuite · t5 — trois sphères se coupent en **deux** points · t6 —
Apollo « l'un des pionniers » · t7 — consigne de la frise au tutoiement · fiche : la
bulle d'un mot du vocabulaire ne sort plus brute (`collectVocabulaire()`). Laissé :
m1 1.1 « nos minutes par 60 secondes » (ellipse correcte).

⏳ **À revoir si un terme manque** : dans les blocs qui avaient plus de 3 `<dfn>`, t0
*box*, *jack*, *M.2*, *bus*, *ROM*, *serveur*… sont repassés en texte simple.

## 🆕 Le tableau de bord passe en espaces — toutes les classes de Loïc

**Demandé le 13/09/2026.** Un seul tableau de bord, à la même adresse, organisé en
**espaces** : SNT · ES 1re (1re 2) · ES Terminale (T3, T6) · PC 2nde (2nde 1 et AP)
· CFA. Loïc voit les cinq ; les collègues, rattachés à des groupes SNT seulement,
arrivent directement sur le SNT et ne voient rien de changé. Décisions :
`DECISIONS.md`, « Le tableau de bord s'organise en espaces ».

| Lot | Contenu | État |
|---|---|---|
| **1 — base** | `bdd/schema/018` : espaces, un compte dans plusieurs classes, lecture cloisonnée par famille (progression, absences, copies), `mon_plafond()` sur la classe SNT, cinq classes. **36 contrôles** sur PostgreSQL local | ✅ exécuté le 13/09 |
| **2 — tableau de bord** | Accueil des espaces (sauté s'il n'y en a qu'un), onglets par espace, élèves lus par `eleves_classes`, vue d'ensemble outils PC et livret CFA, ES sans file de correction. Les classes fermées à l'inscription ne disparaissent plus | ✅ en ligne |
| **3 — client élève et ES** | `progression.js?v=17` (**55 fichiers**) : un code tapé par un compte existant ajoute la classe ; menu « Mes classes » du badge ; connexion **sur place** (`data-accueil="sur-place"`) ; `data-reponses="personnelles"`. Les **8 pages d'ES** branchées (`es1-tN-cN`, `est-tN-cN`), leurs `data-cle` de terminale passées en `est-` | ✅ codé et testé |
| **4 — PC 2nde** | `assets/js/suivi-pc.js` sur les **14 chapitres** et les **8 outils** : ouverture, déblocage par le code, PDF ouverts. Vue « Chapitres et documents » et fiche élève complète au tableau de bord | ✅ codé et testé |
| **5 — documentation** | Guides `prof/` et PDF, `CLAUDE.md`, `MANIFESTE.md`, consignes chapitre PC / outil PC / ES, gabarits, fichiers de vérification ES, `bdd/README.md` | ✅ |

**Éprouvé comment.** Base : chaîne `001`→`019` rejouée sur un PostgreSQL 18 jetable
(rôles, `auth.users`, `auth.uid()` imités), `018` et `019` appliqués deux fois,
**36 contrôles d'intrusion** — Martin ne lit pas les outils PC de son élève venu en
2nde 1, Loïc ne lit ni ne valide ses copies SNT — et le cas d'échec du `019`.
Pages : Chromium avec une base simulée, **43 contrôles** au tableau de bord (collègue
SNT seul, Loïc cinq espaces, iPad 820 px) et **28 au parcours élève** (inscription ES
sur place, élève SNT qui entre en 2nde 1 puis en AP, second groupe SNT refusé,
réponse d'ES en statut `partage`, ouverture et déblocage d'un chapitre, PDF
enregistré puis ouvert, rien d'écrit sans compte).

✅ **Mise en service faite.** `bdd/schema/019-mise-en-service-espaces.sql` a été
exécuté dans l'éditeur SQL : Loïc est rattaché à ses sept classes hors SNT, et les
cinq nouvelles classes sont **ouvertes aux inscriptions** — `EST303` et `EST606`
vérifiées à `actif = true` le 24/09/2026. Reste à **distribuer les codes** :
`ES1R02` (1re 2), `EST303` (T3), `EST606` (T6), `PC2S01` (2nde 1), `AP2S26` (AP).
Un élève de 2nde qui a déjà son compte SNT tape **son identifiant et son mot de passe
habituels** avec le code, ou passe par « Mes classes » dans son badge.

⏳ **Ce qui reste ouvert après la livraison**
- **ES-13** : le tutoriel du dispositif (T1-C1) est écrit **au futur** alors que la base
  est branchée — à repasser au présent, formulation de Loïc.
- **Les textes des trois bandeaux de connexion** : proposition de Claude, à valider.
- **Un indice qui livre la réponse** en terminale T2-C2 (2 cas) : `verifier.mjs` le voit
  depuis qu'il contrôle aussi la terminale ; le repère passe à **19** tant que ce n'est
  pas tranché.
- **La checklist « Pour le DS, je sais »** des chapitres PC ne remonte pas : à décider.
- **Registre de migrations** : déposer `018` et `019` dans `supabase/migrations/`
  **après** `supabase migration repair --status applied`, jamais avant.
- **Présenter « Mes classes » dans t0** (règle du référentiel vivant) : aucun texte
  n'a été écrit dans la séquence d'introduction.

## 🆕 Les fiches de séance de t0 sont auditées, et le générateur suit de nouvelles règles

Audit de Loïc du 13/09/2026, séance par séance, sur les fiches déposées dans OneDrive.

- **Générateur (toutes les pages sur le moteur : SNT, outils PC, ES)** : deux
  compteurs, trace de l'élève seulement, mot du professeur s'il existe, « pour aller
  plus loin » seulement si rempli, dépôts photo enfin repris (réduits), glossaire de
  l'année retiré. Règles dans `CONSIGNES-sequence-SNT.md` §17.
- **t0** : quatre parties fixes à emplacements ; mesurées remplies à 2 / 3 / 4 / 2
  pages. Affiche des ports en 3.1, « à retenir » restructurés et balisés `<dfn>`,
  corrections d'audit (en-tête 4 séances, 2.1, 2.6 M.2 et ordre, jacks, Blu-ray).
- 🔴 **À relire par Loïc** : le contenu des quatre fiches de t0, en particulier le
  « à retenir » réécrit pour la fiche de 2.5 (sans PCIe) et le récap du cours en S1.
- ⏳ **Restent hors de ce chantier** : `m1` affiche deux sections « Pour aller plus
  loin » (la sienne, statique, et la nouvelle) ; les fiches sans partie fixe restent
  en V1 automatique (t2 à t7) ; les réponses « plus loin » sans code ne survivent pas
  à un rechargement.

## 🆕 La correction se fait classe par classe, et le worker suit les séances

**Fait le 13/09/2026**, à la demande des collègues.

**Tableau de bord** (`prof/index.html`, onglet « À corriger ») : un sélecteur de
classe en tête, avec le nombre de copies en attente par classe, plus « Toutes mes
classes » ; il est synchronisé avec Séance et Suivi. La **file des copies est
visible** en colonne, **rangée par nom** (vrai nom si la table est chargée), avec une
barre de couleur d'attente — vert < 10 min, jaune 10-40 min, orange > 40 min, rouge
depuis la veille (seuils proposés, constantes en tête du bloc). « Passer » est
remplacé par Précédente / Suivante et les flèches du clavier. La validation en lot
ne porte plus que sur la classe affichée. Sur iPad en portrait, la file se replie
derrière un bouton. Testé sous Playwright avec une base simulée (1180 et 820 px,
0 erreur JS, pas de débordement). Guides mis à jour et PDF régénérés.

**Worker** (`ia-snt/`) : fini la passe toutes les 15 min en continu. Le calendrier vit
dans `horaires-worker.psd1` ; `planifier-worker.ps1` en tire **deux tâches** —
ouverture de session + 18 h (sans réveil), et les quatre créneaux de SNT (mardi
11 h 05-12 h 20, jeudi 8 h 15-9 h 55 et 13 h 10-14 h 25, vendredi 10 h 15-11 h 30) avec
**réveil du PC 10 min avant**, une passe toutes les 5 min jusqu'à 15 min après la fin,
et la veille empêchée pendant le créneau. Heures posées en heure locale (Windows les
écrivait en UTC : décalage d'une heure au changement d'heure). Syntaxe et calendrier
testés ; **les tâches ne sont pas encore installées**.

⏳ **Reste à Loïc** :
1. Relancer `planifier-worker.ps1` dans un **PowerShell administrateur** (l'ancienne
   tâche à 15 min tourne jusque-là).
2. Les soirs avant une séance : **mettre en veille, ne pas éteindre**.
3. Allumage depuis un PC éteint : piste **BIOS (RTC Alarm)**, modèle de carte mère à
   relever.
4. Valider ou ajuster les seuils de couleur d'attente.

⚠ Les créneaux sont ceux de Loïc : les copies des groupes des collègues arrivées hors
créneau attendent le matin ou 18 h (bouton « Corriger sans l'IA » en attendant).

## 🆕 Le chapitre ES T1-C1 « La nucléosynthèse » est refondu sur deux audits

**Premier audit le 12/09/2026, second le 13/09.** Loïc a audité le chapitre de bout en
bout — mise en forme, vocabulaire, structure, activités, ressources — puis relu la
page refondue. **Rien n'est validé** : tout ce qui touche au fond reste une proposition.
Relevé détaillé : `_suivi/es1-verification.md` §11 (premier audit) et §12 (second).

**La page aujourd'hui** — 3 séances (dont « Réviser », non verrouillée) · 14 étapes
(9 à valider) · 7 QCM (54 questions, dont un de prérequis *sans enjeu*) · 3 légendes
de graphique à compléter · 6 réactions à qualifier · 1 tri de noyaux · 6 schémas SVG
générés · glossaire progressif de 18 entrées · **153 gras dont 17 rouges**.
Un **troisième audit, par Claude**, a suivi le 13/09 : seules ses corrections certaines
sont appliquées (§7 de `_suivi/t1c1-audit-claude-2026-09-13.md`), le reste attend.

**Ce que le second audit a ajouté**
- **Une étape se valide quand tout y est fait**, et plus au premier bloc réussi : son
  cercle se remplit au prorata, et le « à retenir » attend la dernière activité.
  Script **dans la page** — le moteur partagé n'a pas été touché. Parcours d'élève
  rejoué au navigateur : 9 étapes sur 9, 0 erreur JS.
- **Un panneau « 🧪 Classification »**, au-dessus du glossaire : le tableau de 1.2
  rouvert par-dessus la page, une fiche par élément (nom, Z, état à 20 °C, CHON). Pas
  la provenance — c'est la réponse de la séance 2. Masqué pendant QCM et réponses
  rédigées. Les 118 noms vivent dans `_outils/es/tableau_periodique.py`.
- Photos du **réacteur PULSTAR** et du **rémanent de Kepler** en place ; légendes des
  graphiques d'abondance en **saisie libre, sans correction** ; atelier « reconnaître
  les noyaux » retiré ; gras et rouge remis à la table des conventions.
- **Erreurs de source corrigées** : la fusion du silicium donne du **⁵⁶Ni**, pas du ⁵⁸Ni ;
  un hélium 3, et non un neutron, forme le béryllium 7 ; l'exemple de « fission »
  ¹⁵N + ¹H n'en était pas une (remplacé par l'uranium 235) ; les pourcentages de la
  lithosphère sont **en masse** — l'unité est dite, les valeurs n'ont pas bougé.
- **Les cadres professeur** (`.chantier`, `.proposition`) ne s'affichent plus qu'en
  mode enseignant.

**Régénérer les schémas** : `python _outils/es/tableau_periodique.py` (2 tableaux) et
`python _outils/es/noyaux.py` (4 schémas de noyaux), qui s'injectent seuls dans la page.

🔴 **Ce qui reste à Loïc**
- **Relire et valider** — en particulier la validation bloc par bloc et le panneau,
  deux nouveaux fonctionnements : s'ils conviennent, ils ont vocation à remonter dans
  le moteur (22 pages, bump `?v=`).
- **« Étape suivante descend trop loin »** : non reproduit en 820×1180, 1024×768 ni
  768×1024. Préciser l'appareil (Safari iPad ?).
- **Lever l'ambiguïté** « le second QCM doit remonter en 1.1 », et fournir les **autres
  vidéos** annoncées dans le premier audit.
- **Trancher les suites de l'audit de Claude** : rythme de la séance 1 (écarté pour
  l'instant), points du programme non couverts (produire un graphique, « De Fraunhofer à
  Bethe »), idées d'activités — tout est coté par effort dans l'audit.
- **Mode enseignant** : le bouton « Afficher le « à retenir » » reste désactivé tant que
  l'étape n'est pas remplie — défaut du moteur partagé, 22 pages, non corrigé.
- **Provenance des images reprises du cours** (ES-09) : les mentions ont été retirées de
  la page, la question reste ouverte.

⚠ Vu en passant, hors périmètre : les **boutons `.btn` du moteur s'affichent en Times
New Roman** — `sequence-snt.css` y demande IBM Plex Sans sans police de secours (voir le
bloc « polices IBM Plex Sans cassées » plus bas). Correctif d'une ligne, 22 pages.

## 🆕 L'outil 3 « Sécurité au laboratoire » est relu contre la circulaire officielle

**Fait le 12/09/2026.** Loïc a audité l'outil écran par écran, puis fourni la
**circulaire n° 2024-074 du 05/09/2024** et ses deux annexes de l'Observatoire
national de la sécurité. La page et la fiche A4 ont été relues contre ce texte.
Décisions **O-33 à O-42** dans `DECISIONS.md`.

**Deux passages contredisaient le texte officiel**, et sont corrigés partout (page,
fiche, QCM, corrigés) :

| Ce que disait l'outil | Ce que dit le texte officiel |
|---|---|
| « Lunettes et gants ne sont pas systématiques » | Blouse **boutonnée** + **lunettes** = EPI de base, à chaque séance ; seuls les **gants** dépendent du produit |
| « Retirer le vêtement imbibé pendant le rinçage » | Ne **pas** ôter un vêtement **collé à la peau** — et ne pas retirer une lentille |

**Quatre consignes officielles manquaient**, elles sont entrées : refermer le flacon ·
nommer tout récipient dans lequel on verse · le feu sur les vêtements de quelqu'un
(1.5 passe à **sept situations**) · le reste de l'étiquette (**DANGER / ATTENTION**,
mentions **H**, conseils **P**, date de préparation). Le pictogramme au point
d'exclamation récupère la **destruction de l'ozone**.

**Trois changements d'interaction**, tous dans la page — `sequence-snt.js` n'est pas
touché, aucun `?v=` à incrémenter :

- **la planche des neuf** tient sur trois rangées centrées, le détail s'ouvre au clic
  sur un pictogramme (sans JavaScript, tout s'affiche comme avant) ;
- **la vérification des neuf** se fait en **fenêtre** : porte, voile qui grise la page
  et fige le défilement, **un pictogramme à la fois**, une seule validation à la fin.
  🔴 Le champ ne quitte pas son `.step` — c'est `closest('.step')` qui fait valider
  l'étape au clic sur « Vérifier », et le moteur reste seul à corriger et enregistrer ;
- **le corrigé rédigé s'ouvre à la correction** (sauf à la reprise d'une session), et
  le badge du champ ne répète plus « Exercice N » sous le titre « Exercice N ».

**Le bilan passe à treize questions** : deux sur les EPI, trois montrant un
pictogramme dessiné dans l'énoncé. Et la **circulaire est jointe en téléchargement**
en pied de parcours (`assets/pdf/pc/reference/`, nouveau dossier).

**Les deux paillasses aux erreurs sont retirées (O-43).** La scène des six erreurs de
l'étape 1.3 et l'exercice aux huit erreurs disparaissent, CSS et JS compris : la
séance 2 compte **quatre exercices**, renumérotés (les `data-cle` ne changent pas, pour
ne pas effacer de progression). Le pied de page perd l'encart de production et ne
garde que « D'où viennent ces règles » et l'avertissement sur le règlement ; le chapô
de la séance 1 court sur toute la largeur. L'idée d'**exemples de mauvaises
manipulations** revient plus tard, sur photos de la salle de TP (`IDEES.md`). Loïc
trouve la page satisfaisante — ce n'est pas une validation.

**Ce qui reste :**

1. **La fiche A4** annonce encore « cinq exercices, deux paillasses à corriger, un
   bilan de huit questions » (dernier encart) : une phrase à corriger, puis réexport.
2. **Les photos de la salle de TP**, et d'éventuelles vidéos, à fournir par Loïc.
3. **Les cinq pictogrammes d'équipement** (douche, rince-œil, extincteur, couverture,
   sortie) restent en cadres `.reserve` : ce sont des **pictogrammes réglementaires**,
   qui ne se dessinent pas de mémoire (O-41) — il faut les vectoriser depuis une source
   officielle ISO 7010. Les quatre photos fournies sont des visuels de catalogue, dont
   une porte « reproduction interdite » : elles servent de référence, pas de fichiers à
   publier dans un dépôt public.

## 🆕 L'enseignement scientifique de terminale passe sur le moteur

**Les deux chapitres du thème 2 sont portés** (`term-es-t2-c1`, `term-es-t2-c2`) :
ils tournaient sur le gabarit des chapitres de physique-chimie, ils tournent
désormais sur le moteur des séquences, dans la grammaire de l'ES de 1re. **5 séances,
25 étapes, 8 QCM, 20 textes à trous (79 champs), 7 réponses rédigées, 32 figures.**
Le portage s'est fait **en place**, sous le même nom de fichier : les liens du hub
n'ont pas bougé.

**Le hub de terminale n'affiche plus que ce qui est traité.** Thème 1 entier, 2.3,
2.4 et thème 3 entier passent **en commentaire HTML** — retirés de l'affichage, pas
du fichier, chaque bloc portant la ligne qui dit comment le rétablir. La **séquence
d'ouverture (la frise) reste visible**. Le chapeau, qui annonçait « trois grands
thèmes » devant un seul, est réécrit.

**Le chapitre 2 avait zéro image ; il en a dix-sept.** Son bloc « à faire » demandait
d'ouvrir un **PPTX de 230 Mo** pour les extraire : elles étaient toutes dans le PDF de
correction, qui pèse 2,8 Mo. La carte de la géothermie y était **coupée en deux
morceaux**, recollés avant export. Il ne manque plus qu'**une seule image** dans les
deux chapitres — les trois photos de turbines du T2-C2, présentes en vignettes de
120 px, inutilisables. Un cadre de réservation les attend.

**Les QR codes ont de nouveau payé — mais pas partout.** Le diaporama du T2-C1 en
portait : **7 vidéos et 2 Kahoot** récupérées, les 11 puces `href="#"` sont remplies,
chaque titre vérifié un par un. La **correction de l'exercice 2** (groupe électrogène)
et sa **fiche technique** étaient page 7 du même PDF. 🔴 **Mais le PDF du T2-C2 ne
porte aucun QR code** : ses 15 liens vidéo restent introuvables. Leurs titres exacts
sont listés — une recherche suffit pour chacun.

🔴 **Cinq erreurs de source, dont une était visible des élèves** : l'exercice 3 du
T2-C1 proposait en ligne **l'arséniure de gallium** là où la correction dit
**germanium**. Les quatre autres : une légende « cycles de Milankovitch » devant un
graphique ΔT/CO₂, un « PES » pour « FES », une batterie au lithium à 90 % dans
l'énoncé et 80 % dans sa propre correction, trois numéros d'image employés deux fois.
**Corrigées dans les pages, pas dans les PDF.**

✅ **Branché en base le 13/09/2026**, avec l'ES de 1re : `data-sequence="est-t2-cN"`,
réponses rédigées en réponses personnelles. Voir le bloc « Le tableau de bord passe
en espaces ».

**Le moteur n'a pas été modifié d'une ligne.** `node verifier.mjs` : **18 problèmes
avant, 18 après**. Les deux pages ouvertes dans un Chromium : aucune erreur JS,
aucune ressource en échec, **aucune iframe ne porte de `src`** au chargement.

⏳ **Rien n'est validé**, et **7 décisions attendent** (D1-D7) : le sort de la
checklist « Pour le DS », la contradiction sur le coût des tours de béton, la forme
de l'exercice 3, la chaîne YouTube à confirmer, le branchement en base, le retour des
chapitres masqués, les fiches élève. Relevé complet :
**`_suivi/es-term-verification.md`**.

---

## 🆕 L'enseignement scientifique de 1re passe sur le moteur

**Fait le 06/09/2026.** Les six chapitres dont Loïc a le contenu sont portés sur le
moteur de séquences, depuis les documents de `_a-deposer/es1/`. **18 séances**,
72 étapes, 22 QCM, 81 questions, 179 champs à remplir, 81 images. Le livrable qui
compte est **`_suivi/es1-verification.md`** : c'est là que vivent le récapitulatif
chiffré, les 22 décisions attendues classées par blocage, le relevé chapitre par
chapitre et le tri du dossier de dépôt.

| Chapitre | Page | Séances |
|---|---|---|
| C1 nucléosynthèse (+ tutoriel du dispositif) | `1re-es-t1-c1-nucleosynthese.html` | 2 |
| C2 radioactivité | `1re-es-t1-c2-radioactivite.html` | 4 |
| C3 cristaux | `1re-es-t1-c3-cristaux.html` | 3 |
| C1 son et musique | `1re-es-t2-c1-son-et-musique.html` | 3 |
| C2 le son, une information à coder | `1re-es-t2-c2-son-a-coder.html` | 3 |
| C1 la forme de la Terre | `1re-es-t3-c1-forme-terre.html` | 3 |

**Ce qui bloque vraiment** : **six images** (ES-01 à ES-06). Quatre figures des
cristaux, la courbe GeoGebra de la radioactivité, le graphique de la corde de Melde,
l'image 5 du son à coder, le schéma de la distance à l'horizon. Toutes sont
**vectorielles dans les PPTX** et ne sortent pas du PDF. Sans elles, `a = 2r`,
`4R = a√2` et le Pythagore de l'horizon arrivent sans justification. Une copie
d'écran de diapositive suffit à chaque fois.

**Trois bonnes surprises.** ① Le **TP tournant sur le son n'était pas absent** : il
était déposé sous le nom `[Dossier] [Correction] Thème 2 - Chapitre 1.pdf` — dossier
d'activités complet, corrigés compris. Le chapitre annoncé comme « le seul à écrire
entièrement » est donc un portage comme les autres. ② Les **QR codes des diaporamas
se décodent** : 24 URL récupérées, dont les trois épisodes de « L'origine des éléments
chimiques » que les `.mp4` déposés ne permettaient pas d'intégrer. La méthode résout
au passage le point ouvert de `term-es-t2-c1`. ③ Deux composants annoncés comme
manquants **existaient déjà** dans le moteur : les associations (`initEtiquettes`) et
les QCM à réponses multiples (le champ `"r"` accepte un tableau). **Le moteur n'a pas
été modifié d'une ligne.**

**Sept erreurs trouvées dans les documents sources** (exposant perdu, dénominateur
manquant, facteur 150 au lieu de 160, 3¹² ≈ 2⁹ au lieu de 2¹⁹, « 16 fois » au lieu de
« 2 fois », « N = 8 o » au lieu de 3 octets, oxygène en Z = 6). Corrigées dans les
pages, signalées sur place, listées au §7 du fichier de vérification — **pas encore
dans les PDF d'origine**.

✅ **Branché en base le 13/09/2026** : client de progression chargé,
`data-sequence="es1-tN-cN"`, réponses rédigées en réponses personnelles, connexion sur
place. Voir le bloc « Le tableau de bord passe en espaces ».

`node verifier.mjs` : **18 problèmes avant, 18 après** — le repère est intact. Le
filtre `pagesSNT` couvre désormais les pages ES et a immédiatement attrapé quatre
indices qui livraient la réponse et huit QCM biaisés en longueur : corrigés.

---

## 🆕 Les quinze TP de seconde, remplacés et renumérotés

**Appliqué le 05/09/2026.** Loïc a retravaillé les quinze sujets pendant l'été et
les a **renumérotés**. Douze PDF sur quinze ont un contenu nouveau ; TP7
(*Ariane*), TP8 (*Un tir au canon*) et TP15 (*Lewis*) sont identiques au bit
près. Douze portent un **numéro nouveau**.

**Ce que ça change au-delà des octets.** Le dépôt nommait ses fichiers d'après le
numéro imprimé sur le sujet, et les pastilles de chapitre l'affichaient
(`🧪 TP5 — Analyse d'un son`). Remplacer le contenu sans toucher aux noms aurait
laissé le site annoncer un numéro que la feuille distribuée en classe contredit.
Décision T1 : **le site suit le papier**. Ont donc bougé —

- les **15 fichiers** de `assets/pdf/pc/tp/`, renommés ;
- les **15 pastilles** des 10 pages de chapitre et l'étiquette « Synthèse du TP3 »
  de T1-C2 ;
- les **13 liens** du hub `2nde-physique-chimie.html` ;
- l'outil **`o4` verrerie**, qui citait le TP six fois, et sa **fiche A4** deux
  fois — le TP y prend au passage le titre de son PDF, « La verrerie au
  laboratoire », et son PDF de fiche a été **ré-exporté** ;
- `chapitres.md`, `DECISIONS.md` (D2 remplacée) et
  `erreurs-sources-fiches-outils.md`.

**Contrôlé, pas supposé.** Les quinze PDF ont été ouverts et lus : le numéro
imprimé en première page correspond au numéro du fichier, quinze fois sur quinze.
`node verifier.mjs` rend **exactement 18 problèmes** — les 18 liens `cfa/outil-*`
du repère, aucun lien de TP cassé.

⚠ **Un effet à connaître.** Les anciennes URL de TP **cassent** : pas de copie de
compatibilité (décision T2). Les liens partagés depuis le 26/08 sont morts. *(Le
second effet — le dossier `_a-deposer/tp/` resté à l'ancienne numérotation — est
sans objet depuis le redépôt du 20/09 : voir le bloc de tête.)*

## 🆕 Le plafond d'avance ouvrait le module, pas le cours — corrigé

**Appliqué le 05/09/2026.** Décision : « Les outils transversaux sortent du
plafond » (`DECISIONS.md`), **provisoire**, à reprendre quand la progression de
l'année SNT sera arrêtée.

**Ce qui n'allait pas.** Sur un groupe neuf à `avance_max = 2`, la frise du
tableau de bord n'ouvrait pas la première séance du cours : elle ouvrait les deux
séances du module `snt-m1` et fermait `snt-t0/s1`. `verrou-snt.js` triait la file
des séances par `Object.keys(SEANCES_SNT).sort()`, et `'snt-m1'` se range avant
`'snt-t0'` — le module tenait les rangs 0 et 1 de l'année. Curseur à −1, plafond
à 1 : seuls ces deux rangs étaient ouverts. Le tableau de bord lisant ce même
calcul, il affichait fidèlement une file fausse. **Trois groupes concernés côté
élève** : B, E et N, les seuls à `avance_max = 2` ; les onze autres sont à
« tout ouvert » et ne voyaient rien.

**La règle.** Une séquence dont la clé commence par `snt-m` est hors
progression : toujours ouverte, jamais comptée dans le curseur, absente de la
frise. Le préfixe est déjà la convention du hub (famille « Outils
transversaux ») — un futur `snt-m2` en hérite sans qu'on y touche.

**Le suivi n'est pas touché.** Cahier de textes, absents, grille élève par élève,
compteurs de retard et de dette fonctionnent pour un module comme pour un thème,
en le choisissant dans le menu Thème : cette chaîne lit `seances_faites` filtré
sur la séquence, jamais `VerrouSNT`. Vérifié avant livraison.

**Corrigé au passage** : `snt-m1` s'affichait brut dans les menus de thème et
dans la phrase du plafond (`replace('snt-t', 'Thème ')` ne l'attrapait pas), ce
qui rendait le module quasi introuvable — donc son suivi aussi. Une fonction
`nomSequence()` nomme les deux familles : « Thème 3 », « Module M1 ».

**Fichiers.** `assets/js/verrou-snt.js` (la règle), `prof/index.html` (libellés +
ligne « Hors plafond » sous la frise), `?v=2 → ?v=3` dans les **6 fichiers** qui
chargent le verrou, les **deux guides** `prof/` et leurs PDF régénérés.
`node verifier.mjs` : **18 problèmes**, repère intact.

## 🆕 Le hub de 2nde PC : les chapitres d'abord, six outils refermés

**Appliqué le 05/09/2026** sur `pages/2nde-physique-chimie.html` et `index.html`.
Décisions O-30 à O-32.

**L'ordre de la page a changé.** La section « Outils transversaux » ne s'ouvre plus
le hub : elle le **ferme**, sous les trois thèmes. Motif : l'élève arrive pour le
chapitre de la semaine, et huit cartes d'outils le repoussaient sous la ligne de
flottaison. Mesuré après coup, le thème 1 commence à **461 px** au lieu de ~1 300.

**Six outils sur huit sont refermés.** Seuls `o1` (écriture scientifique) et `o2`
(chiffres significatifs) restent ouverts, avec leur cours et leur fiche PDF. `o3` à
`o8` gardent leur carte — titre et résumé visibles, l'élève voit ce qui arrivera —
mais leurs deux liens sont remplacés par une mention unique **« Cours et fiche
🚧 »**, grisée, en trait pointillé, doublée pour les lecteurs d'écran. C'est
le mécanisme `.a-venir` déjà employé dix fois sur ce hub, et déjà appliqué à `o3` et
`o4` dans la colonne de l'accueil : le geste **aligne le hub sur l'accueil**.

Motif : les huit outils sont **écrits** depuis le 28/08 mais **aucun n'est validé**,
et les arbitrages O-22 à O-29 restent en attente — `o3` au premier chef, dont
l'étape « Si ça tourne mal » engage la sécurité en salle 0.26.

🔴 **Ce qui n'est pas fait, et qu'il faut savoir.** Les six pages et leurs six
PDF **restent atteignables par leur URL** : le dépôt est public, retirer un lien ne
ferme pas la porte. Vérifié qu'aucune autre page du dépôt n'y renvoie — le hub était
leur unique point d'entrée — mais une adresse déjà connue d'un élève continue de
fonctionner. Si cela doit changer, il faut poser un bandeau sur les six pages, ou
les sortir du dépôt publié.

**Rouvrir un outil** le jour où il est validé : rendre à sa liste `.docs` ses deux
entrées de liens. Rien n'a été supprimé — ni page, ni PDF, ni fiche source.

`node verifier.mjs` : **18 problèmes**, tous des liens `cfa/outil-*`. Repère intact.

## 🆕 La rentrée est faite : 14 groupes, cinq enseignants, une base cloisonnée

**Exécuté et vérifié en base le 04/09/2026.** `bdd/schema/016` (cloisonnement)
puis `017` (les groupes) sont passés ; Loïc est rattaché à ses trois groupes plus
les deux classes de démonstration, et son tableau de bord ne montre plus que
ça — les deux classes du CFA en sont sorties, comme voulu.

Les 14 codes sont `SNT26A` … `SNT26N`, sur les lettres que le lycée emploie déjà.
`avance_max = 2` sur B, E et N ; **40 (tout ouvert) partout ailleurs**, parce que
le plafond se déduit des séances déclarées faites et bloquerait sinon les élèves
d'un collègue qui ne tient pas le cahier de textes.

🔴 **Deux défauts préexistants trouvés en chemin, tous deux réparés :** les trois
fonctions de correction (`security definer`, donc hors RLS) ne vérifiaient que
« est-ce un professeur ? » — n'importe quel enseignant aurait pu valider
n'importe quelle copie du lycée ; et **aucune policy d'écriture n'existait sur
`classes`**, si bien que le réglage du plafond d'avance n'écrivait rien depuis
août tout en affichant un succès.

✅ **Le rangement Supabase est fait aussi.** `supabase migration list` répond
**11 migrations locales, 0 absente du registre distant** : local et distant
concordent enfin, et un push ne rejouera rien. Six migrations ont dû être
déclarées appliquées, pas cinq — **le `011` du 01/08 n'avait jamais été inscrit
au registre non plus**, ce qu'aucun fichier de doc ne disait. L'état de
l'historique se lit avec `supabase migration list`, jamais dans une note.

⏳ **Et à mesure que les collègues donnent une adresse** : créer leur compte dans
*Authentication → Users*, puis décommenter leur ligne au §3 du `017`. Onze
groupes attendent encore leur enseignant, ce qui est normal.

## 🔴 Les polices IBM Plex Sans sont cassées, et ça dépasse largement le tableau de bord

Mesuré au navigateur le 04/09/2026, famille par famille, sur 88 caractères de
français courant :

| Famille | Glyphes servis |
|---|---|
| **IBM Plex Sans** (400, 400i, 500, 600) | **11 sur 88** |
| IBM Plex Mono · Space Grotesk · Inter · Spectral · EB Garamond | 86 sur 88 ✓ |

Les quatre fichiers `assets/fonts/IBMPlexSans-*.woff2` sont des sous-ensembles
quasi vides. Conséquence : `assets/css/sequence-snt.css` en fait le corps de
texte de **toutes les séquences SNT et des huit outils de PC**, qui rendent donc
en Segoe UI sur Windows, en San Francisco sur iPad — et en **Times New Roman**,
un serif au milieu d'une page sans empattement, aux deux endroits où aucun repli
n'est déclaré (`.cloze input` et `.diagram text`). C'est ce dernier point qui est
visible à l'œil.

Ça n'a jamais sauté aux yeux parce que les polices système de remplacement sont
correctes. Ce ne sont simplement pas celles qu'on a choisies.

**Rien n'a été touché** : `sequence-snt.css` est un asset partagé, et le réparer
impose d'incrémenter le `?v=N` sur ses 6 fichiers. Trois voies, au choix de
Loïc :

1. **Regénérer de vraies polices** IBM Plex Sans (OFL) et les sous-ensembler
   correctement — restitue l'intention typographique, demande de récupérer les
   fichiers source ;
2. **Intercaler `'Inter'`** juste après `'IBM Plex Sans'` dans la pile. Inter est
   auto-hébergée, complète, du même genre ; tout redevient déterministe d'un
   appareil à l'autre, et Plex Sans reprend la main d'elle-même le jour où elle
   est réparée. C'est ce qui a été fait **dans les deux guides seulement** ;
3. **Ne rien faire**, en corrigeant au minimum les deux déclarations sans repli
   qui tombent en Times.

**T1-C3 est corrigé de bout en bout, et le lot transverse avec.** Les deux briefs
d'audit du 02/09 sont appliqués : les puissances de dix passent en balise sur les
8 fichiers de seconde PC concernés (62 conversions, 22 sur T1-C3), la notation A/Z X
monte dans `chapitre-commun.css` — qui passe en **?v=9** sur ses 17 fichiers —, les
21 pieds de page de `pages/` disent la même année `© 2026/2027`, et les quatre liens
publics vers un DS **corrigé** sont retirés. Sur le chapitre : sept figures refaites
au schéma de noyau de référence plus le SVG inline de l'exercice 3, six erreurs de
fond corrigées et tracées, cinq notions passées en encart (13 → **19** marqueurs
`.a-noter`), l'Image 10 supprimée comme doublon et les figures renumérotées 1 → 10.
Chaque figure a été rendue en PNG et mesurée : aucun débordement de viewBox, aucune
bande vide, aucun texte croisé par un trait. `node verifier.mjs` reste à **18
problèmes**.

**La page a été validée par Loïc le 02/09/2026, et la fiche élève suit.**
`fiches/fiche-2nde-t1c3.html` → `assets/pdf/pc/fiches/fiche-2nde-t1c3.pdf`, **6 pages**
A4 exactes, 9 polices incorporées, remplissage mesuré entre 81 et 95 % — aucune page
ne déborde, aucun titre de section seul en bas. Elle porte les 19 notions et les
12 exercices. La **frise historique y figure en lecture**, marquée « à lire, rien à
compléter » : c'est le seul bloc qui ne se complète pas, à la demande de Loïc. Le
bouton `hors-verrou` est posé sur la page du cours — T1-C3 devient le **3ᵉ chapitre
sur 14** à porter sa fiche, après t1-c2 et t1-c4.

🔴 **Ce qui attend encore Loïc sur T1-C3** : (1) **l'origine des treize photographies**
du chapitre — portraits de savants et Atomium — inventoriée dans
`_suivi/t1c3-releve.md` §2, seul point qui engage autre chose que de la mise en
forme ; (2) la **validation de la fiche** ; (3) la répartition des exercices de manuel
entre les compétences **`ds2` et `ds3`**.

**Deux constats sortis du relevé, à trancher plus tard.** Les checklists DS ne
souffrent pas d'une duplication générale — il n'y en a qu'une sur tout le site,
celle de T1-C3 : le vrai trou est que **tout le thème 3 est nu** (19 compétences
sans aucune référence de manuel). Et les **outils `o1`…`o8`** sont restés hors de
la passe sur les exposants : ils tournent sur le moteur SNT, donc la règle `sup` du
CSS commun ne les atteint pas — `o1` « écriture scientifique » en compte 73.

**La fiche élève de T3-C1 est en ligne, et sa chaîne tourne depuis le dépôt.** Le
générateur est dans `_outils/fiches/` — `gabarit_fiche.py` (commun aux quatorze
fiches), `fiche_t3c1.py` (le chapitre), `mesurer_pages.py` (le remplissage). Vérifié
sur place : il **régénère la fiche octet pour octet**. La fiche est distribuée en PDF
(8 pages, A4 exact, 10 polices incorporées) et son bouton `hors-verrou` est posé sur
la page du chapitre — accessible sans code, pour l'élève absent.

🔴 **Un défaut abîmait le PDF sans se voir à l'écran.** `.feuille` est un conteneur
flex qui passe en hauteur fixe à l'impression : ses enfants y deviennent
compressibles, et le **cartouche entier — bandeau, logo, titre, introduction — était
écrasé à zéro et absent du PDF**, alors que le navigateur l'affichait parfaitement.
Une ligne de CSS (`flex-shrink:0` sur tout sauf `.corps`) le rétablit ; le creux
cumulé retombe à 39 mm, exactement le chiffre annoncé par le standard. Sur la dernière
page, c'est la **marge de notes** — plus haute que la colonne principale — qui
poussait le bloc « code de déblocage + QR » par-dessus le pied : la page qui porte une
clôture passe à `lignes_notes=30`.

**Trois autres corrections pour que la chaîne tourne sur le poste** : la console
Windows en cp1252 tuait le script sur un `✓` **avant** l'écriture de la fiche ;
`pdftoppm` n'y est pas installé, la mesure passe par PyMuPDF ; et la relecture des QR,
contrôle **bloquant**, dépendait de `cairosvg` et de sa DLL cairo absente — le repli
repeint le tracé SVG lui-même, les cinq QR passent `✓`.

⏳ **Deux choses à trancher.** La fiche est **en avance sur la validation** : le jalon 5
(« cours VALIDÉ », acte explicite de Loïc) n'a jamais été posé, et la fiche est déjà
téléchargeable. Et `fonts.css` **n'a pas d'italique pour IBM Plex Mono** : les mentions
« Donnée : … » sortent en Consolas — ça concerne toutes les fiches.

**Les supports de classe ont leurs consignes.** Les
deux standards écrits le 29/08 hors dépôt sont déposés dans `_modeles/` sous le nom
`CONSIGNES-fiche-eleve-PC.md` et `CONSIGNES-diaporama-PC.md`. Ils décrivent, sur le
gabarit T3-C1, comment concevoir la **feuille A4 qui fait écrire le cours** et le
**diaporama de projection** qui ne montre jamais de correction.

**La chaîne des diaporamas n'existe pas** — tranché par Loïc. Elle ne sera pas
récupérée : `CONSIGNES-diaporama-PC.md` reste une **méthode** (les neuf règles, la
séquence d'animation, les pièges), pas un mode d'emploi, et `_outils/diaporamas/` a
été supprimé plutôt que laissé vide. **Un diaporama se retouche à la main dans
PowerPoint.**

Le fichier de T3-C1, lui, a été retrouvé : 12 diapositives, 53 étapes d'animation,
34 médias, dans la version aux indices typographiques (l'autre copie porte encore
`U max` en texte plat). Il ne vivait que dans `Téléchargements` ; il est désormais
**versionné** dans `assets/pptx/pc/diaporama-2nde-t3c1.pptx`, précisément parce qu'il
n'est plus régénérable. Contrôlé avant d'être versé — le dépôt est public : aucune
correction à l'écran, aucune donnée d'élève. **Aucune page n'y renvoie**, mais son URL
reste accessible. Au passage, `.gitattributes` déclare enfin `pptx`, `docx`, `m4a`,
`mp3` et `mp4` comme binaires : un `.pptx` est un zip, et le seul `.m4a` déjà
versionné vivait dans cet angle mort (vérifié intact).

🔴 **Le tableau des célérités du diaporama est faux**, vérifié dans le fichier : Eau
**1 500** · **Bois 3 300** · Acier **5 000**, quand le cours et la fiche donnent cinq
milieux — Eau 1450 · Glace 3200 · Verre 5300 · Acier 5750. Projeté tel quel, l'écran
contredit la feuille que l'élève complète. `STANDARD-fiches` affirmait le contraire
(« le diaporama a été recalé ») : c'était faux, et l'erreur avait été reprise dans la
consigne le matin même. À corriger **à la main** — rien ne peut régénérer ce fichier.

**Sept chiffres et prescriptions recalés** dans les consignes déposées : l'export PDF
passe par `node exporter-fiches.mjs` et non par une impression manuelle ; le contrôle
des polices entre dans la checklist (six fiches sur six portent des caractères servis
en Arial) ; seize marqueurs `a-noter` sur T3-C1 et non quatorze ; le tableau des
célérités est celui du cours, cinq milieux ; le code de déblocage est **S0NORE** ;
et `MANIFESTE.md` annonçait le SNT en « phase 2 » quand `CLAUDE.md` dit « phase 1 ».

**La racine est rangée.** Les **vingt notes de livraison** (`A-LIRE-*`, `BRIEF-*`,
`LOT-CFA-a-lire`) passent dans `_suivi/archives/livraisons/` : ce sont des récits, et
la règle du dépôt veut que la doc décrive l'état courant. Le cas limite était
`A-LIRE-DABORD.md` — un nom impératif sur une procédure d'extraction périmée depuis le
23/07, exactement le piège qu'un assistant ouvre en premier. Les trois `_test-*.mjs`
rejoignent `_outils/tests/` ; les **3,7 Mo d'aperçus d'audit** sortent du suivi Git.
`verifier.mjs` reste à **18**.

**L'ornement des encarts « Histoire des sciences » ne repose plus sur un glyphe.**
Le fleuron `U+2766` n'existait dans aucune des vingt-deux polices auto-hébergées : il
s'affichait par repli sur une police système. Il est remplacé par un **filet court +
un losange**, dessinés en CSS, dans **une seule règle** de `chapitre-commun.css`. La
feuille passe en **`?v=8` dans les 17 fichiers**. Dix encarts changent d'allure. ⚠ Le dixième
était `term-es-t2-c1` : **cette page a quitté la feuille commune le 12/09**, en passant
sur le moteur des séquences.
Vérifié à la mesure : symétrie au pixel, losange à 0,22px de la médiane des capitales,
libellé sur deux lignes à 390px sans losange orphelin, et **survie à la photocopie**
(niveaux de gris + seuil dur).

**Les fiches de 2nde PC se distribuent en PDF.** Douze fiches exportées dans
`assets/pdf/pc/fiches/` — `t1c2` (**12 p.**, générée), `t1c3` (6 p.), `t1c4` (6 p.),
`t3c1` (8 p.), et les huit fiches d'outil. À l'époque de ce bloc il y en avait six —
`t1c2` (10 p.), `t1c4` (6 p.), `o1`, `o2` et `o4` (2 p.),
`o3` (4 p.) — toutes en `209,9 × 297,0 mm`, polices incorporées. **Les dix-sept liens
du dépôt ont basculé** (2 chapitres, 4 outils × 2, le hub × 4, les 2 gabarits × 3) ;
aucun lien mort, `verifier.mjs` reste à **18**. L'export est scripté :
`node exporter-fiches.mjs`, qui **lit `fiches/`** plutôt qu'une liste — `o3` puis `o4`
sont apparus pendant la session, une liste tenue à la main aurait déjà dérivé.

🔴 **Ce que l'export a révélé, et qui n'a pas été touché : six fiches sur six
contiennent des caractères qu'aucune de nos six familles ne couvre.** Exposants et
indices Unicode (`⁺` `⁻¹` `₆`), symboles (`⩽` `⩾` `≈` `✓` `⚠` `⚙` `π` `Δ`), et les
libellés des planches SVG de `o3` et `o4`, servis en **Arial**. Ils sortent donc du
PDF dans un autre dessin que le reste de la feuille. C'est le même piège que le
fleuron, mais **sur du contenu** : rien n'a été modifié, c'est du fond.

> Passe précédente : **les outils transversaux, lots A et B** —
> la renumérotation du catalogue à huit outils, deux gabarits extraits de `o1`, sept
> arbitrages tranchés par défaut (O-23 à O-29), et la production complète de
> **`o3` Sécurité au laboratoire**, page et fiche A4 de 4 pages.
>
> 🔴 **Ce qui demande une relecture de Loïc en priorité** : l'étape 1.5 « Si ça tourne
> mal » de `o3`. C'est du **contenu neuf** — absent des douze fiches sources — et c'est
> le seul contenu du dépôt qui engage la **sécurité d'élèves**. Il doit être cohérent
> avec le règlement du laboratoire de l'établissement et avec les équipements
> réellement présents en salle 0.26.
>
> Passe encore avant : **l'audit 3 de T3-C1, lots A à F**. Le chapitre est passé du
> chantier de forme au **fond**. Trois
> énoncés étaient faux et ne le sont plus, dont un qui comptait : **l'amplitude
> valait, dans la page, l'écart entier entre les extrema — elle en vaut la
> moitié**. Quatre passages disaient la même erreur et ont bougé ensemble ; un
> troisième encart formule pose `A = (U_max − U_min)/2`.
>
> Le vrai sujet était ailleurs. La **partie 4 portait 764 mots, 9 figures, la
> moitié de la checklist du DS — et aucun exercice.** Quatre exercices ont été
> écrits, calqués sur ce que le DS4 demande réellement : l'écho de la falaise
> (aller-retour), l'audibilité d'un clic de dauphin à 125 kHz, la comparaison de
> trois signaux **sans le moindre calcul**, et la lecture de l'échelle en
> décibels — ce dernier règle la compétence `ds8`, sans exercice depuis le 25/08.
> Les corrections 4, 5 et 6, qui faisaient 24, 30 et 40 mots, sont rédigées.
> **Le chapitre porte désormais 10 exercices et 18 figures.**
>
> **L'Image 3 est refondue et pilotable** : un seul repère au lieu de deux
> panneaux séparés, les deux signaux superposés, l'axe des ordonnées enfin sur le
> zéro — et un curseur qui fait varier la fréquence de 1 à 8 Hz, tracé, étiquette
> et réglette redessinés ensemble. La **frise des fréquences** (Image 9) est
> refaite en SVG maison : il ne reste plus un seul `-source` dans la partie 4.
> Les figures du bloc Méthode **s'agrandissent au clic**, mécanisme posé dans la
> feuille commune. Neuf images ont été produites dans la session — l'archive que
> le brief annonçait n'existait pas, mais toutes les sources brutes étaient là.
>
> 🔴 **La feuille commune des chapitres est lue par 15 fichiers, pas 14.** Le
> brief et `CLAUDE.md` parlent des « 14 pages PC » ; il faut y ajouter
> `_modeles/gabarit-chapitre.html`. Les **deux pages d'enseignement scientifique
> de Terminale**, qui la chargeaient aussi, en sont sorties le 12/09 en passant
> sur le moteur des séquences. La consigne est à corriger.
>
> ⏳ **Tout le contenu neuf est une proposition non validée** : les quatre
> exercices, les trois corrections rédigées, l'accroche du chapitre (une
> « partie 0 » posée devant l'ouverture, qui n'a pas bougé), la partie 2 étoffée,
> les définitions du sismogramme et de l'électrocardiogramme. **La fiche élève
> n'a pas démarré** : elle est le lot G, verrouillé par le jalon 5 — « ce cours me
> convient », un acte explicite de Loïc, que rien dans cette session ne remplace.
> Un point attend son manuel : le renvoi `22 p.266` est cité en face de **deux**
> compétences différentes de la checklist DS.

---


> 🔗 **Pour reprendre une session interrompue, lire `REPRISE.md` à la racine.**
> Il contient l'état courant, les bugs connus non corrigés, les décisions
> en attente et les pièges rencontrés.

## Où on en est

| Partie | État |
|---|---|
| **PC seconde** | 14 chapitres en ligne. 🆕 **Les sujets de DS et de TP sont en ligne depuis le 26/08** : 6 DS et 15 TP dans `assets/pdf/pc/`, une puce par sujet sur la carte du hub et un `.video-chip` dans la page — le TP après la section dont il est l'application, le DS dans « Pour le DS, je sais ». Un sujet à cheval est lié depuis chaque chapitre qu'il couvre. La puce « Exercices 🚧 » a disparu des 14 cartes. **Aucune correction n'est en ligne** (elles partent par mail contre preuve de travail), et aucun fichier portant un nom de classe ou une date de séance n'a rejoint le dépôt. Le hub compte désormais **15 cartes de chapitre** : T3-C5 « Formation d'une image » existe **sans page de cours** — le TP14 en tient lieu, c'est la forme retenue, pas un chantier. 🆕 **Les quinze sujets de TP ont été remplacés et renumérotés le 05/09** : le site porte désormais le numéro imprimé sur la feuille distribuée en classe (table de correspondance dans `DECISIONS.md`). Sept fichiers annexes (programmes Python, tableurs, vidéo, fichiers Latis Pro) attendent un arbitrage avant toute publication. 🆕 **Le hub a été repris le 26/08** : une phrase d'accroche par carte, une vignette tirée du cours sur 9 des 17 cartes (les 8 autres n'ont aucun visuel disponible). Les phrases ne sont pas validées. 🆕 **Trois sont en V1 intégrale** (25/08) : `T3-C1` (**audits 1 et 2 entièrement appliqués** au 26/08 — 6 figures refaites en SVG maison, méthode en deux colonnes avec figure d'étapes, 8 transitions, 4 encarts d'histoire des sciences, 2 icônes d'exercice, 12 gras d'insistance retirés, **plus aucun `.a-faire`** ; il ne lui manque que sa fiche élève), `T3-C3` (34 figures) et `T3-C4` (20) — cours entier à l'écran, plus aucun `.a-faire` sauf le lien de DS. 🆕 **L'encart 🔧 « Lien du DS » a été retiré partout où le lien est posé** (T2-C1, T3-C3, T3-C4, en plus de T3-C1) : T3-C3 et T3-C4 n'ont désormais plus aucun `.a-faire`. Chez T2-C2, T2-C3 et T3-C2, sans lien DS, l'encart garde son sens et reste en place. 🆕 **La fiche vierge se télécharge depuis le haut de la page de cours**, `.hors-verrou`, même sans le code — posé sur `t1c2` et `t1c4`, **les 2 seuls chapitres sur 14 dont la fiche est écrite** ; les 12 autres attendent la leur. Leurs trois relevés attendent tes décisions. **Le thème 3 n'a plus que T3-C2 en ébauche.** T1-C1→C4 sont dégrossis à fond ; les **sept autres portent 81 blocs `.a-faire`**, à reprendre selon `_modeles/CONSIGNES-V1-integrale-PC.md`. 🆕 **Plus aucun exercice de PC n'est sans corrigé** : les trois qui manquaient (T2-C1 ex. 2 et 3, T2-C2 ex. 10) ont été rédigés le 25/08, figures comprises. Aucun cours validé. |
| **Outils transversaux PC** | **Quatrième famille, ouverte le 25/08.** Des méthodes que tous les chapitres mobilisent, hors progression, disponibles toute l'année. 🆕 **LES HUIT OUTILS SONT ÉCRITS** au 28/08, tous en V1 proposée : `o1` écriture scientifique · `o2` chiffres significatifs · `o3` sécurité au laboratoire · `o4` verrerie · `o5` compte rendu de TP · `o6` présenter un calcul · `o7` relation algébrique · `o8` graphique. Le catalogue a été **renuméroté** (O-23) dans l'ordre où un élève les rencontre, et **« Convertir » en sort** — `o1` en avait absorbé tout le fond le 26/08. Chaque outil a sa page, sa **fiche A4** (2 pages, 4 pour `o3`) et sa carte au hub. 🔴 **Mais seuls `o1` et `o2` sont OUVERTS aux élèves depuis le 05/09** : rien n'étant validé, les cartes de `o3` à `o8` restent visibles au hub mais **sans aucun lien**, marquées « en travaux 🚧 » (O-31). Les pages et les PDF existent toujours et restent atteignables par leur URL. La section des outils est passée **sous les trois thèmes** (O-30). **Le visuel est dessiné ici, sauf le figuratif** (règle du 29/08) : 21 pièces de verrerie (`o4`), une frise de rubriques (`o5`), deux copies annotées (`o6`), le triangle et les fractions empilées (`o7`), cinq graphiques dont une grille vierge (`o8`). 🆕 **`o3` fait exception depuis le 29/08** : ses 9 pictogrammes CLP sont **vectorisés** depuis le PDF officiel, sa tenue est une **illustration fournie**, et ses 5 équipements sont des **cadres de réservation** en attente d'image. 🆕 **Deux gabarits** (`_modeles/gabarit-outil-PC.html` et `gabarit-fiche-outil-PC.html`) : un nouvel outil se copie depuis eux, et non plus depuis `o1`. Tous tournent sur le moteur SNT **sans le modifier**, et **les fiches se distribuent en PDF** depuis le 28/08 (`node exporter-fiches.mjs`). 🔴 **Décisions de fond en vigueur** : seuil de l'ordre de grandeur à **5**, pas de zéro ambigu en seconde, « à retenir » en **trois temps**. ⏳ **Rien n'est validé**, et **sept arbitrages sont appliqués par défaut** (O-23 à O-29), tous en attente sauf O-27. ⚠️ **`o3` engage la sécurité d'élèves** : son étape « Si ça tourne mal » doit être relue contre le règlement du laboratoire et les équipements réels de la salle 0.26. |
| **SNT** | 8 séquences de thème (`t0`→`t7`) **+ 1 module transversal** (`m1` « Représenter l'information »). `t0`, `t1` et `t2` sont sur le **moteur partagé** et en **V0 complète** ; `t3`→`t7` en V0 partielle (S1 rédigée, suite en 🚧). **`t1` est le seul thème validé sur le fond** (23/08) — il sera *clos* après la vérification des fiches. **`t0` a été refondue le 23/08 puis auditée le 24/08** : voir sa ligne. |
| **SNT — plafond d'avance** | 🆕 Écrit le 20/08, **branché sur `t0`, `t1`, `t2` et le hub**, testé (21 assertions sur le module, harnais DOM sur la cascade) et **vérifié au rendu** dans un navigateur sans interface : bandeau, pictogramme et teinte mesurés sur les deux familles de pages, en mode élève et en mode enseignant. Le tableau de bord affiche les **dates de clôture** (cases de clôture et frise, format `12/09`). ✅ **`bdd/schema/013-verrou-progression.sql` a été exécuté le 20/08/2026** par Loïc : `mon_plafond()` répond en base, et un appel anonyme se heurte bien à `42501 permission denied` — la fonction est réservée aux comptes connectés, comme prévu. Le plafond est donc **actif de bout en bout**. Deux textes vus par les élèves attendent la validation de Loïc. |
| **SNT — `t0` Introduction** | 🔄 **Refondue le 23/08/2026, reprise les 24 et 25/08.** État courant : **4 séances · 26 étapes · 18 portes · 6 QCM (39 questions) · 4 réponses rédigées corrigées · 2 réponses personnelles · 2 dépôts d'image · 10 fiches d'élément · 1 tri · 1 exercice d'étiquettes · 1 poste de visionnage · 4 SVG maison**. Apports du 25/08 : l'activité débranchée devient la **séance 4**, dans la cascade et avec sa fiche, où l'élève remplit **dix fiches d'élément** (photo redimensionnée dans le navigateur, nom, ce qu'il fait — trois suffisent à valider) ; un **exercice d'étiquettes à poser** sur la façade arrière en 3.3, dix zones contrôlées une à une sur l'image source ; **trois captures de l'interface** en 1.1, produites depuis la page rendue ; et la **carte du thème** enfin chargée — sans elle, le lien « ⌂ Sommaire » ne faisait rien. ⏳ **Rien n'est validé.** Restent ouverts : la **remontée des photos vers le tableau de bord** (chantier séparé, avec une durée de conservation à décider) et la **licence des 37 images issues du PDF d'un collègue**.
| **SNT — `t1` Internet** | ✅ **Validé sur le fond le 23/08/2026**, audit dicté page ouverte, les 26 étapes descendues une à une. **6 séances · 25 étapes** (5.5 supprimée) · 112 questions de QCM toutes relues · 27 réponses rédigées · 27 grilles de pré-correction, aucune orpheline · aucun bloc `.a-venir`. Les échafaudages ont quitté la page élève : neuf notes de chantier retirées, contenu consigné dans `DECISIONS.md`. Corrigés le même jour : le titre fantôme des « pour aller plus loin » (3.3 s'annonçait « À faire chez toi »), la porte d'intuition de 4.3 qui s'ouvrait à la frappe au lieu du partage, le clic muet sur une étape à venir, et la superposition de la carte de progression (deux rangées dès 6 nœuds, libellés sur deux lignes). Ajouté : un **dépôt de deux copies d'écran en 6.4** (`NET-D6`, `NET-D7`) pour garder trace des `ping` et `tracert`. ⏳ **Ce qui manque pour clore** : (1) le passage de vérification de Loïc **sur les fiches** ; (2) `ping`/`tracert` et `nslookup` **depuis un poste de la salle** — si l'ICMP sortant est filtré, l'étape 6.4 est à repenser ; (3) les **copies d'écran déposées ne remontent pas encore dans la fiche** (`CONSIGNES-sequence-SNT.md` §17.2). **Plus aucun contenu pédagogique ne manque** : la passerelle NSI, dernier trou, est abandonnée pour le moment et rangée dans `IDEES.md`. |
| **SNT — module `m1` Représenter l'information** | 🔎 **Audits des 22 et 23/08 traités en entier.** 2 séances, 9 étapes, **6 QCM** (dont un bonus adossé à une vidéo), 9 exercices, **4 composants SVG maison** et un bilan de 12 questions. Le module pose le socle mathématique : ce qu'est une base, ce qu'est une puissance, la notation en indice (`1011₂`). **Apports du 23/08** : la décomposition positionnelle fait saisir *les chiffres* et pas seulement les poids, avec un exemple posé avant ; la base 60 se décompose en six temps ; le tableau des combinaisons **se complète** de 5 bits au cas général n ; l'atelier 1.5 est **découpé en trois groupes** A/B/C, chacun avec sa correction détaillée ; le classement passe à **11 écritures** et ses deux règles deviennent un indice ; l'écart de 2.2 se calcule sur la **formule générale** ; le bonus 1.1 devient **vidéo Veritasium + QCM de 5 questions**, et `REP-R1` un résumé. Les trois outils manipulables **annoncent enfin leur limite** (1 à 4095) et disent pourquoi ils refusent un nombre ; la flèche de la potence est **rectiligne**. Tout vérifié au navigateur : les 9 blocs passent « tout est juste » sur les réponses attendues, **0 erreur JS**, repli à 390 px sans débordement de page. **Le bloc de chantier et les badges « à valider » ont été retirés le 23/08** à la demande de Loïc — geste d'affichage, pas validation : **rien n'est validé, tout le contenu pédagogique reste une proposition.** |
| **SNT — moteur partagé (`sequence-snt.js` v41)** | 🔧 **Deux composants et trois correctifs le 25/08**, après les quatre changements du 24/08 (vidéos derrière une affiche, barre de fiche verrouillée, pastille « rendu pas relu », figures dans la fiche). Nouveaux : **`initElements`** — des fiches photo + nom + description, l'image étant **redimensionnée dans le navigateur** (une photo de téléphone pèse 3 à 5 Mo, dix feraient plier l'onglet) ; **`initEtiquettes`** — des noms à poser sur une photo, en **deux temps** plutôt qu'en glisser natif, qui ne fonctionne pas au doigt sur iPad. Corrigés : ① **les dépôts de photo ne validaient aucune étape** — `initDepot` appelait deux fonctions d'un autre bloc du fichier et levait une erreur à chaque dépôt ; ② le plafond de 1600 px des blocs « pour aller plus loin », qui coupait la vidéo de fin sur iPad ; ③ un bloc qui se dépliait hors de l'écran, où le clic paraissait sans effet.
| **Base de données** | ✅ **en service.** Supabase, région **West EU (Paris)**. 7 tables, 10 policies RLS, 4 fonctions, sauvegarde hebdo + réveil quotidien. Pilote prouvé de bout en bout sur `t1`. |
| **Pré-correction IA SNT** | ✅ worker local complet, testé, avec garde-fous et tri de relecture (`ia-snt/`). Calendrier calé sur les séances depuis le 13/09 (`horaires-worker.psd1`) — ⏳ **tâches à réinstaller en administrateur**. ⚠ boucle non fermée — voir ci-dessous. |
| **Livret CFA** | 17 outils + index en ligne, tous à la structure `.contexte` / `.question` / `.reponse`. Mise en page reprise le 19/08 (une seule colonne, un seul bord d'attaque), puis **audit de contenu des dix-sept outils le même jour** : accroche recentrée sur l'atelier, « effort » → « force » partout, `ε` pour l'écart et `θ` pour les angles de rotation, paliers 1 dégonflés de leur guidage, sous-questions concaténées, vecteurs fléchés et racines couvrantes. Deux figures produites (bras de levage de l'Outil 5, composantes de l'Outil 14), une dizaine corrigées. Les **fiches A4 ne suivront qu'après validation des versions en ligne** — 15 des 17 liens « version à imprimer » sont donc morts. Rien de validé : **l'Outil 0 est le premier attendu en relecture**. Depuis le 19/08 le livret est **branché sur le dispositif de comptes** : connecté, le travail va en base et suit l'apprenti d'un appareil à l'autre ; sans compte, tout reste sur l'appareil comme avant, et la page le dit. Les deux codes de classe (`CFA26A`, `MVT26A`) sont ouverts : `bdd/schema/012-classes-cfa.sql` a été exécuté le 20/08. |
| **Cahier de vacances** | 14 pages, 2 blocs 🚧. La partie la plus finie du dépôt. |
| **Coque — page d'accueil** 🆕 | 🔄 **Refondue le 27/08** après comparaison de onze maquettes (dix organisations, puis six fonds). Deux colonnes asymétriques : à gauche les trois classes en portes illustrées — PC, SNT, CFA en **une seule porte** pour les deux diplômes — les trois autres niveaux en lignes sobres marquées `.a-venir`, puis l'adresse professionnelle réelle ; à droite une colonne collante (gravure du jour, 4 fiches-outils, Animations 🚧, Mission Spectra). Nouvelle bande « Auteur & vidéo » en pied, **vide, trois entrées en chantier**. Le compte à rebours bascule sur l'état du projet passé le 1er septembre. `style.css` **non modifié** ; tout le CSS reste inline. Décisions ACC-1 à ACC-12. ⏳ **Deux formulations à valider** : la bascule d'après-rentrée (« En chantier · ouverture en cours d'année ») et le libellé des trois entrées « Auteur & vidéo ». La planche du jour reste un **cadre annoté** tant que `gravures/` est vide. |
| **ES Première** 🆕 | **Ouvert le 06/09/2026.** Six chapitres, **18 séances**, sur le moteur de séquences — nucléosynthèse (qui porte aussi le **tutoriel du dispositif**, rôle de `t0` pour le SNT), radioactivité, cristaux, son et musique, son à coder, forme de la Terre. Tout est porté depuis les documents de Loïc ; **40 cadres `.proposition`** signalent ce que Claude a ajouté, **13 cadres de réservation** ce qui manque. ✅ **Branché en base le 13/09/2026** (`es1-tN-cN`, réponses personnelles). 🔴 **Seule la nucléosynthèse est ouverte aux élèves, fiches de séance coupées** — à démasquer dès qu'on y retravaille (`es1-verification.md` §0bis). 🔴 **Six images bloquent trois exercices** (ES-01 à ES-06). Le hub porte la numérotation de Loïc (C1, C2, C3) et une carte `.a-venir` pour **3.3 « La Terre dans l'Univers »**. `1re-pc-cristaux.html` reste en place jusqu'à validation. **Rien n'est validé** — relevé complet : `_suivi/es1-verification.md`. |
| **ES Terminale** 🆕 | **Les deux chapitres du thème 2 tournent sur le moteur des séquences** : `t2-c2` « Production et stockage de l'électricité » (3 séances, tel que porté) et `t2-c1` « Deux siècles d'énergie électrique », **refondu sur audit le 12/09** (2 séances + une séance Bilan, 16 étapes, 5 QCM, 12 questions ouvertes **corrigées en classe** — corrigés hors Git dans `_corriges-es/`). Les **12 vidéos et 2 Kahoot** du `t2-c1` sont posées (QR + hyperliens du PPTX) ; les **15 liens du `t2-c2` restent introuvables** — son PPTX n'a pas encore été ouvert. ✅ **Branché en base le 13/09/2026**, comme la 1re (`est-tN-cN`). 🆕 **Ouvert aux élèves le 24/09/2026** : `EST303` (T3) et `EST606` (T6) acceptent les inscriptions, l'accueil ne porte plus « 🚧 chantier » pour ce niveau, et les **27 cadres de travail** (12 au `t2-c1`, 15 au `t2-c2`) sont **masqués aux élèves** — ils reviennent d'un clic sur « mode enseignant » (`body.teacher`, règle CSS locale à chaque page, aucun asset partagé touché). 🔴 **Le hub n'affiche que ce qui est traité** : thème 1, 2.3, 2.4 et thème 3 sont **en commentaire**, et **la frise l'est depuis le 24/09** — elle demande `serveur-frise/`, qui ne tourne qu'en local. **Rien n'est validé côté fond** ; points à vérifier en priorité sur le `t2-c1` et décisions D1-D7 (D5 faite) : `_suivi/es-term-verification.md` §4 et §8. À côté : `serveur-frise/` et `ia-correction/` en chantier. |

**Validation** : un seul contenu est validé à ce jour — **`t1` « Internet », sur
le fond, le 23/08/2026**, et il n'est pas encore *clos* (il attend la vérification
des fiches). Tout le reste est une proposition. La mise en ligne n'est pas un
jalon — ce qui se suit, c'est le niveau de finition **validé par Loïc**, acte
explicite, jamais présumé.

---

## Ce qui bloque

### ① Chemin critique — la boucle est refermée (reste l'interface)

Depuis le `010` (31/07), une copie peut aller jusqu'à l'élève. Trois fonctions
le permettent, et elles seules : `valider_copie`, `signaler_copie`,
`rouvrir_copie`. Le worker, lui, n'a toujours aucun moyen de poser un statut —
c'est ce qui matérialise la décision humaine exigée par le cadre AI Act
(article 6(3), tâche préparatoire).

Ce qui est en place :

- `008` (27/07) — rôle enseignant : table `enseignants`, `est_enseignant()`,
  **lecture** des copies, des élèves et des classes.
- `009` (31/07) — suivi de classe : `seances_faites`, `absences`, `jalons`,
  plus la lecture de `progression`.
- `010` (31/07) — **écriture** : les trois fonctions de correction, plus le
  traitement du statut `signale` côté séquence (verdict rouge, bouton d'envoi
  rendu à l'élève pour qu'il puisse réécrire). Assets passés en `?v=22` sur
  `t1` **et** `t2`, qui traînait encore en `?v=19`.

Les trois migrations ont été jouées et éprouvées sur un PostgreSQL 16 : rejeu,
test d'intrusion élève et anonyme, et vérification que valider une copie ne
réveille pas le déclencheur d'archivage.

**Il ne reste plus de verrou en base**, et le compte enseignant existe
(`l.vanhoorde@…`, inscrit le 27/07). Ce qui manque est l'interface, découpée en
lots :

- [x] **A — socle** : `prof/index.html` + `assets/js/prof-api.js`. Connexion,
      contrôle du rôle, coquille à quatre onglets, chargement de la table des
      noms en mémoire vive. `verifier.mjs` surveille la cohérence de
      configuration entre `prof-api.js` et `progression.js`.
- [x] **B — file de correction** : pile triée (signalées d'abord, puis
      ancienneté), critères, message proposé, valider / renvoyer / annuler.
      Parcours éprouvé hors navigateur avec un DOM simulé (`jsdom`) : ordre de
      tri, échappement du texte élève, appels de fonction et paramètres.
- [x] **C — rituel** : ouverture (absents, deux taps) et clôture (séances faites,
      note dictée au micro du clavier, travail donné, à reprendre). Chaque séance
      affiche sa **date de clôture**, `—` tant qu'elle n'est pas fermée.
- [x] **D — grille de suivi** : une colonne par séance avec le détail chiffré,
      cinq états calculés (terminée / en cours / pas encore / en retard / absent),
      deux compteurs distincts par élève — retard du jour et dette antérieure.
      Dépliage étape par étape en attente des `data-cle` (voir DECISIONS).
- [x] **E — cahier de textes** : bloc prêt à coller, repris automatiquement
      d'un autre groupe ayant déjà fait la même séance.
- [x] **F — fiche élève** : avancement et toutes ses réponses, accessible d'un
      clic sur son nom dans la grille. Rapports agrégés : pas encore.

Repli si la page prend du retard sur la rentrée : un script en ligne de commande
sur le PC de Loïc (lister · afficher `tri.a_verifier` · appeler `valider_copie`)
suffit désormais à faire tourner le dispositif.

### ② Portage des sept séquences sur le moteur partagé

Le gabarit est extrait (23/07) et `t1` tourne dessus. Les sept autres ont encore
leur copie inline, plus ancienne : leur HTML n'est pas marqué comme le moteur
l'attend (`data-step`, `data-gate`, `.field[data-focus-code]`, `script.qcm-data`,
`#dico-source`). **Une séquence à la fois, ouverte et testée.** Priorité : `t0` et
`t2`, les deux qui serviront en septembre.

🔴 **Le coût se paie déjà en double écriture.** `t1`, `t2` et le hub lisent
`assets/css/sequence-snt.css` ; `t0` et `t3`→`t7` portent une **copie inline** de
cette feuille. Toute règle de verrouillage doit donc être posée **aux deux
endroits** — le bloc `.plafonne` (teinte d'attente et sablier) manquait dans les
six copies et n'y a été ajouté que le 20/08. Prochaine règle oubliée, prochain
écart silencieux : c'est l'argument le plus concret pour finir ce portage.

Second point de vigilance, apparenté : une page branchée sur le plafond a besoin
de **deux** choses, le script `verrou-snt.js` **et** `data-sequence` sur son
`<body>`. `t0` avait le premier sans le second, et le plafond n'y fermait rien
sans qu'aucune erreur ne le signale. `t3`→`t7` n'ont ni l'un ni l'autre, ce qui
est cohérent avec leur état partiel — le jour où on les branche, les deux.

**Un module nommé `m1` passe à travers les listes en dur.** Le dépôt énumère les
huit thèmes à **quatre** endroits : le filtre `pagesSNT` de `verifier.mjs`, son
tableau de fraîcheur, celui de `generer-seances.mjs` et celui de
`generer-questions.mjs`. Les quatre ont été élargis le 21/08. Le premier est le
plus dangereux : une page qui échappe à `pagesSNT` échappe aussi au contrôle
`localStorage`, donc au garde-fou RGPD, **sans qu'aucune erreur ne le signale**.
Le filtre a été testé en y introduisant volontairement un `localStorage`, vérifié
détecté, puis retiré. Toute future page hors `t0`→`t7` demandera la même revue.

### ③ La frise ES à brancher

Décision prise le 23/07 : elle passe sur Supabase. Le modèle est écrit
(`bdd/schema/007-frise-es.sql`) mais **à valider par Loïc** avant exécution. Il
reste à écrire les fonctions correspondantes dans `progression.js` et à remplacer
l'objet `API` de `pages/term-es-s01-frise.html`, qui retombe encore sur
`localStorage`.

## 📋 L'étape 4.2 « Les câbles sous-marins » n'est pas allégée — tranché

> Le plan d'allègement posé le 22/08 (pistes A, B, C, D) est **écarté** par Loïc
> le 23/08/2026, à la clôture du thème. L'étape garde ses 8 blocs, ses 4 dépôts
> et ses 4 rédactions. Motif : l'inégalité de volume entre séances est un outil
> de gestion de classe, pas un défaut — voir `DECISIONS.md`, « Clôture de `t1` ».
> **Ne pas rouvrir ces pistes.** Le seul coût à surveiller est celui de la
> correction pour l'enseignant (14 réponses rédigées par élève sur la séance 4),
> qui se mesurera au premier passage via le tableau de bord.

---

## Prochaines actions

- [ ] 🔴 🆕 **`o3` — récupérer les cinq images d'équipement.** Douche, rince-œil,
      extincteur, couverture anti-feu, sortie : l'outil est **publié avec cinq
      cadres de réservation visibles**, ce qui est assumé. Les noms de fichier
      attendus, ce qu'il faut y voir et la contrainte de format sont dans
      `_suivi/o3-releve.md` §2 ; les **numéros ISO 7010 exacts sont à relire sur
      une planche**, ils ne sont donnés nulle part de mémoire. À l'intégration,
      trancher aussi le sort de `.eq.feu` : si les images normalisées portent
      déjà leur fond de couleur, la classe n'a plus d'objet.
- [ ] 🆕 **`o3` — trois réserves sur l'illustration de la tenue**, aucune
      bloquante, aucune corrigeable dans le code : le garçon a les cheveux
      **non attachés** alors que le repère ① dit le contraire ; les deux élèves
      portent **lunettes et gants** là où la fiche dit, juste à côté, qu'ils ne
      sont pas systématiques ; les quatre repères sont **dupliqués**. Elles se
      corrigent en régénérant l'image. Détail : `_suivi/o3-releve.md` §4.

- [ ] 🆕 **Trancher le sort des caractères servis par une police système dans les
      fiches** — `node exporter-fiches.mjs` les liste à chaque export. Trois cas
      distincts : les **exposants et indices Unicode** (`Na⁺`, `10⁻²⁷`, `C₆H₁₂`),
      qui pourraient passer par `<sup>`/`<sub>` ; les **symboles** (`⩽` `⩾` `≈`
      `✓` `⚠` `⚙` `π` `Δ`), à remplacer ou à dessiner ; les **libellés des
      planches SVG** de `o3` et `o4`, servis en **Arial** alors que la règle CSS
      demande IBM Plex Sans — celui-là ressemble à un vrai défaut technique, pas
      à un manque de glyphe. C'est du **fond** : rien n'a été touché.
- [ ] 🆕 **Regénérer les PDF après toute retouche d'une fiche** — `node
      exporter-fiches.mjs`, et le PDF repart dans la même livraison que le HTML.
      Le script refuse un export en écart ; il ne se contourne pas à la main.
- [ ] 🔴 🆕 **Relire l'étape 1.5 « Si ça tourne mal » de `o3`** — contenu neuf,
      seul contenu du dépôt qui engage la **sécurité d'élèves**. À confronter au
      **règlement du laboratoire** de l'établissement et aux équipements
      réellement présents en **salle 0.26** (douche, rince-œil, extincteur,
      couverture anti-feu, sortie). Tant que ce point n'est pas fait, `o3` ne se
      distribue pas.
- [ ] 🆕 **Valider ou corriger les six arbitrages en attente** (O-23 à O-26, O-28,
      O-29). Le lot H (la série « Convertir » versée dans `o1`) ne se lance
      qu'après validation d'O-23 ; les lots C à G attendent le feu vert.
- [ ] 🆕 **Scanner le QR code de la fiche `o3`** avec un téléphone avant toute
      impression en série. Il est autovérifié par son générateur (syndromes nuls
      et relecture de la matrice), mais aucun lecteur tiers n'était disponible
      dans la session pour le confirmer.
- [ ] 🆕 **DS / TP — trancher les sept fichiers annexes et deux placements.**
      À dire avant publication : les `.py` du TP07 et du TP14 (code élève ou
      corrigé ?), la vidéo `.mp4` du TP09 (origine et droits), les trois `.ltp`
      Latis Pro du TP06, les deux `.xlsx` du TP01 (gabarits vierges ?). À
      confirmer aussi : le **TP12 couvre la réfraction**, donc T3-C4 — une
      seconde puce ? ; la puce « TP — capteur de température » de T3-C2, remplacée
      par le TP14 ; le **texte de la carte « Formation d'une image »**, qui est une
      proposition ; et la note « Lien du DS — à poser chaque année », devenue
      redondante dans les quatre chapitres qui ont maintenant leur sujet
      (T2-C1, T3-C1, T3-C3, T3-C4). La **renumérotation des DS**
      reste à ta main, elle n'a pas été touchée.

- [x] ~~**Outils transversaux — me transmettre les PDF sources**~~ — ✅ **reçus le
      26/08/2026**, les neuf fiches. `o1` et `o2` repris sur leur fond dans la
      foulée. Les sources de `o5` à `o8` sont là aussi, à ne pas produire sans commande.
- [ ] 🆕 **Outils transversaux — deux arbitrages de `o4` encore ouverts.** Le **tri de
      la verrerie** (le brief dit « précise / usage courant », la source dit
      « pour contenir / pour mesurer un volume ») et le **nombre de niveaux de
      `o4`** (le brief en demande 3, la source en a 5).
- [ ] 🆕 **Outils transversaux — lire `o1` et `o2` à l'écran et trancher.**
      ⚠️ **Ce sont les deux seuls outils OUVERTS aux élèves depuis le 05/09** (O-31) : ils sont donc lus en classe pendant que la relecture attend. Les six
      autres sont refermés, ce qui rend leur relecture moins urgente — mais **pas**
      celle de ces deux-là.
      🔴 **Le point le plus important est O-4, et les sources l'ont rouvert** : la
      fiche du collègue écrit « les zéros situés à droite sont significatifs » et
      « 50 n'a que deux chiffres significatifs », ce qui donnerait `100` → **3**
      chiffres — quand le brief demandait `100` → **1**, ambigu. La V1 tient une
      troisième voie (l'ambiguïté nommée, qui justifie l'écriture scientifique),
      mais elle **nuance une affirmation du collègue**. Les trois issues sont
      posées dans `DECISIONS.md`. Attendent aussi : les deux calculs ajoutés à la
      série finale de `o2` (O-5), le mot « Séance » de la fiche générée (O-2), et
      **cinq erreurs de calcul** relevées dans les documents sources, à signaler
      à l'équipe.
- [ ] 🆕 **Lire les trois cours à l'écran et trancher leurs relevés** (`t3c1`, `t3c3`, `t3c4`).
      Trois décisions sortent du lot : définir l'**amplitude** dans T3-C1 (elle fonde tout le
      IV-C sans être définie) ; choisir la sortie du **graphe de l'exercice 3 de T3-C4**, qui
      ne donne pas les 20 °C attendus ; et relire en priorité **les cinq corrections de T3-C4**,
      écrites par Claude faute de corrigé dans la source.
- [ ] 🆕 **Chapitre PC suivant en V1 intégrale.** Restent **81 blocs `.a-faire`** sur sept
      chapitres : T2-C2 (20), T2-C1 (15), T3-C2 (11), T2-C3 (10), T1-C5 et T1-C6 (9), T1-C7 (7).
      **T3-C2 finirait le thème 3.** Méthode éprouvée sur trois chapitres : les trois passes
      d'extraction, la vérification visuelle image par image, la découpe du rendu pour les
      annotations qui sont des formes PowerPoint, et la mesure de courbe quand un exercice
      repose sur une lecture graphique. Compter une session par chapitre.
- [ ] **`t1` — présenter dans `t0` deux mécanismes nés en 4.2** (reporté ici le
      22/08 en retirant la note de chantier de la page, règle du référentiel vivant) :
      le **dépôt de copie d'écran** et le **« à retenir » différé** jusqu'à ce que
      toutes les réponses soient là. Ils fonctionnent dans `t1` mais n'ont jamais
      été expliqués nulle part à l'élève
- [ ] **`m1` — relecture du contenu par Loïc** : les 11 QCM et leurs leurres, les 21 items
      d'atelier, les formulations des 9 étapes. Rien n'est validé. Puis arbitrer la durée
      réelle après le premier passage en classe, et le sort des deux PNG de référence
      (`_modeles/reference-m1/`), devenus inutiles depuis que la potence est en SVG
- [ ] **Correctif `seuil()` du moteur** (chantier ouvert le 21/08) : `/^[0-9 ]+$/` au lieu de
      `/^[0-9]+$/`, pour qu'un nombre écrit avec des espaces reste strict. `t1` accepte
      aujourd'hui `40 001` pour `40 000`. Impose `?v=33` sur les neuf pages **et** le hub
- [x] ~~**`t1` lot 2 — moteur du relevé et du rappel**~~ — ✅ **fait et testé le
      22/08.** Le champ « relevé » se valide sur le format et non sur la valeur, le
      rappel s'ouvre en boîte de dialogue comparée au relevé du même élève, et un
      `.cloze` accepte son propre `data-cle`. Assets à `?v=37`
- [x] ~~**`t1` lot 3 — étape 6.4** (diagnostic réseau)~~ — ✅ **fait.** L'étape porte
      ses consignes, ses questions (`tracert` Google et Tokyo) et son « à retenir ».
      **Plus aucun bloc `.a-venir` dans `t1`**
- [x] ~~**`t1` lot 4 — le bonus adressage**~~ — ✅ **fait.** `t1-bonus-adressage`
      (6.6) traite IPv6 et l'hexadécimal, hors des 100 %.
- [x] ~~**`t1` — la passerelle NSI facultative**~~ — **abandonnée pour le moment**
      (23/08). Elle n'avait jamais été écrite ; la déplacer dans le bonus 6.6
      revenait à s'engager à la rédiger. Partie dans `IDEES.md`. `t1` n'a donc
      **plus aucun contenu manquant**.
- [ ] **`t1` — les copies d'écran déposées doivent remonter dans la fiche.**
      `collectEtapes()` ignore les `[data-depot-apercu]` ; l'étape 6.4 en produit
      deux, l'étape 4.2 quatre. Spécifié dans `CONSIGNES-sequence-SNT.md` §17.2,
      **pas codé**.
- [ ] Depuis un poste de la salle : `ping` / `tracert` — si l'ICMP sortant est bloqué,
      l'étape **6.4** tombe entière — puis `nslookup` sur les trois sites du relevé de **6.3**
      (pas de CDN, pas trois adresses dans le même /16) — remplaçants notés dans `DECISIONS.md`
- [x] ~~Visionner les deux vidéos et écrire les questions de QCM~~ — fait le
      20/08 **à partir des transcriptions** fournies par Loïc, chaque question
      ancrée sur un passage cité. ⏳ reste à éprouver en classe : `NET-Q8` compte
      **18 questions d'affilée**. Décision de Loïc du 20/08 : **on ne scinde pas
      pour l'instant**, on juge au premier passage devant des élèves réels
- [ ] **Chantier QCM — les biais de forme sur les sept autres séquences.**
      `t1` est **fait** (20/08) : plus aucun biais de longueur, position de la bonne
      réponse répartie, tous les blocs à 3 questions ou plus. Reste **23 questions
      signalées, dont 20 marquées 🔴**, liste triée par `node verifier.mjs --qcm`.
      ⚠️ **`t2` porte à elle seule les 20 cas marqués**, pour 42 questions — près
      d'une sur deux. Méthode arrêtée par Loïc : **étoffer les leurres** jusqu'à la
      longueur de la bonne réponse, jamais raccourcir celle-ci ; granularité
      identique entre options ; position répartie par permutation, en épargnant les
      listes dont l'ordre porte du sens
- [x] ~~**`bdd/schema/014-reponses-personnelles.sql` à exécuter**~~ — ✅ **exécuté par
      Loïc le 22/08/2026.** Le statut `partage` est accepté par la contrainte et par
      les deux policies d'écriture, et un partage rectifié ne rebascule plus en file
      de correction. « Partager avec la classe » écrit désormais réellement en base
- [x] ~~**`t1` — `data-cle` sur les 26 étapes**~~ — ✅ **fait le 22/08/2026**, avant
      la découpe de la séance 1 et avant toute création de classe réelle. 71 clés
      uniques sur les trois séquences portées ; `verifier.mjs` refuse un doublon
- [x] ~~**Le prérequis « binaire » de `t1` n'existe pas**~~ — ✅ **réglé** : c'est le
      module **`m1` « Représenter l'information »**, écrit le 21/08. Le bandeau de
      prérequis en tête de la **séance 6** y renvoie. ⏳ Reste ouvert : `m1` n'est
      référencé depuis **aucune** séquence du hub, alors que `t7` mobilise le poids
      des fichiers — décision de progression à prendre
- [ ] **Porter le mécanisme « réponse personnelle partagée » dans `t0` puis les six
      autres séquences.** Le texte est présenté dans `t0` (S1, bloc perso) comme
      l'exige le référentiel vivant ; le **code** attend que `t0` passe sur le
      moteur partagé
- [ ] **RGPD — les quatre `<iframe>` de `t1` se chargent à l'ouverture de la page**,
      sans un clic. Journal réseau mesuré le 20/08 : `embed.radiofrance.fr` (116
      requêtes), `youtube-nocookie` (109), `jnn-pa.googleapis.com` (21),
      `fonts.gstatic.com` (13), `www.google.com` (10), `csp.withgoogle.com` (4).
      Une **façade « clic pour charger »** (vignette + bouton qui injecte l'iframe)
      supprime les six hôtes tant que l'élève n'a rien demandé, et ne dépend pas de
      l'arbitrage PeerTube en cours
- [ ] **Écrire l'étape 5 minimale** (`ia-snt/valider.mjs`) — le dernier maillon
- [x] ~~Porter `t2` sur le moteur partagé~~ — fait le 25/07 (lot 0)
- [ ] Porter `t0` sur le moteur partagé, puis les cinq séquences restantes
- [x] ~~`t2` lot 1 — séance 1 refondue~~ — fait le 25/07
- [x] ~~`t2` lot 3 — séance 2 HTML/CSS~~ · ~~lot 4 — cookies en séance 4~~ — faits le 25/07
- [x] ~~`t2` lot 2 — séance 3~~ · ~~lot 5 — frise débranchée~~ — faits le 25/07
- [ ] **`t2` : imprimer les étiquettes de la frise** (`WEB·D`, 20 étiquettes)
- [ ] Vérifier en salle : CodeBetter accessible depuis le réseau du lycée,
      et quels navigateurs sont installés (l'étape cookies en demande deux).
      Non bloquant depuis le 25/07 : l'étape CodeBetter n'est plus une porte
- [ ] Écrire la grille de critères IA des cinq réponses corrigées de `t2` :
      `WEB-R1b` · `WEB-R2a` · `WEB-R3b` · `WEB-R4a` · `WEB-R4b`
- [ ] **`t2` 1.3 : vidéo HTTP** — adresse nocookie, titre, chaîne, durée,
      puis questions de QCM après visionnage (par Loïc)
- [ ] Relire et exécuter `bdd/schema/007-frise-es.sql`, puis brancher la page de frise
- [ ] `moteur.mjs` en `temperature: 0` + `seed` fixe — préalable à tout re-benchmark
- [ ] Rework de la grille R1/C2 à froid (restructurer, pas reformuler)
- [ ] Réparer `pages/term-spe-physique-chimie.html → docs/tp-1-1.pdf`
- [ ] Ré-encoder `audio/2nde-pc-t3-c4-intro.m4a` (31 Mo → ~2 Mo, mono 64 kbit/s)
- [ ] Nettoyer les couleurs en dur hors `:root` (les six restantes ≈ 46).
      `t2` : les 52 du `<style>` sont parties avec le portage, **18 subsistent dans ses SVG**
      (invisibles du vérificateur, qui ne lit que les balises `<style>`)
- [x] ~~Nettoyage avant rentrée : compte `leproftest` + lignes de test~~ — **tranché le 04/09 : on garde.** Les comptes de test deviennent le matériel de démonstration (`SNTDEM`, 35 copies) et le terrain d'essai des collègues (`PROF26`). Seule `SNTTEA` a été supprimée
- [ ] 🔴 Révoquer la clé `service_role` — **dernière action avant la mise en service**

## ⏳ En attente de Loïc — rappels récurrents

> À ressortir tant que ce n'est pas coché.

**Gravures de l'accueil** (domaine public, à déposer dans `gravures/` — sources
dans `gravures/A-LIRE.txt`). Tant qu'un fichier manque, l'accueil montre un cadre
vide annoté à la place de la planche.

- [ ] `01-prisme-newton.jpg` — Newton, prisme, 1704
- [ ] `02-machine-nollet.jpg` — Nollet, machine électrostatique, 1743
- [ ] `03-alambic-encyclopedie.jpg` — Encyclopédie, distillation, 1765
- [ ] `04-pile-volta.jpg` — Volta, la pile, 1800
- [ ] `05-camera-obscura.jpg` — Kircher, chambre noire, 1646
- [ ] `06-barometre-torricelli.jpg` — Torricelli, baromètre, 1644
- [ ] `07-champ-faraday.jpg` — Faraday, lignes de champ, 1852
- [ ] `08-spectre-fraunhofer.jpg` — Fraunhofer, spectre solaire, 1814

**Accueil** — refondu le 27/08 : deux colonnes, trois portes illustrées, atelier
collant à droite, bande « Auteur & vidéo » en pied. Détail dans `DECISIONS.md`
(ACC-1 à ACC-12).

- [x] Vraie adresse en place : `l.vanhoorde@enseignant.isaac-etoile.fr`
- [ ] **Espace classe ENT — où l'annoncer ?** Le bloc « Courriel / Établissement /
      ENT » a disparu avec la refonte, et son lien mort avec lui. Rien ne le
      remplace pour l'instant
- [ ] **Bande « Auteur & vidéo »** : trois entrées en chantier (Auteur, Vidéo,
      Prestations). Elle attend du contenu, pas du code
- [ ] (plus tard) Page « collection de gravures ». Le lien « Voir la collection »
      est retiré de l'accueil tant que `gravures/` est vide

**Base de données — réflexes permanents** (pas des cases à cocher)

- **Sept jours consécutifs sans allumer le PC = projet Supabase mis en pause.**
  Rien n'est perdu, la relance se fait d'un clic au tableau de bord ; mais le
  site ne répond plus entre-temps. Le rattrapage sauve la sauvegarde, pas le
  réveil.
- Vérifier de temps en temps `C:\Sauvegardes-SNT\journal.log` : une ligne `OK`
  par semaine. Une ligne `ECHEC` ou une absence de ligne = sauvegarde muette.
- 🔴 **Le jour de création des comptes** : collecter les identifiants choisis par
  les élèves et tenir la table identifiant→nom **sur le PC uniquement**, hors
  base. Sans elle, un identifiant oublié devient introuvable, y compris pour Loïc.
- Faire le ménage dans `C:\Sauvegardes-SNT` quand la base contiendra des copies
  d'élèves (règle de purge à ajouter au script à ce moment-là).

**Licences et contenus**

- [ ] Vérifier le contrat Tableo avant de republier des cours sur le site
