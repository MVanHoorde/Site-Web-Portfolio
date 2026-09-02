# État du projet

> **Réécrit** à chaque session, jamais empilé. Ce fichier décrit **l'état
> courant** — jamais comment on y est arrivé.
> Historique → `JOURNAL.md` · décisions → `DECISIONS.md` · détail par chapitre →
> `chapitres.md` · contexte et règles → `CLAUDE.md` · index → `MANIFESTE.md`.
>
> Dernière réécriture : **02/09/2026** (dernière passe : **l'audit de T1-C3 et son lot
> transverse sont appliqués** — bloc ci-dessous. Passe du même jour : **la fiche élève de T3-C1
> est en ligne, et sa chaîne de production tourne depuis le dépôt** — bloc ci-dessous.
> Passe du même jour : **les supports de classe entrent dans le dépôt, et la racine
> est rangée**. Passe du 29/08 :
> **les dessins figuratifs de
> `o3` cèdent la place à de vraies images** — les 9 pictogrammes CLP vectorisés depuis
> le PDF officiel, la tenue en illustration fournie, les 5 équipements en cadres de
> réservation ; et la règle transverse qui en découle dans `CLAUDE.md`. Passe du
> 28/08 : **les huit outils transversaux de PC sont écrits** — `o4` verrerie, `o5` compte rendu de TP, `o6` présenter un calcul,
> `o7` relation algébrique et `o8` graphique produits d'affilée, page + fiche + carte au
> hub pour chacun. Passes précédentes du même jour : l'ornement des encarts d'histoire,
> et le passage des fiches de 2nde PC en PDF).
>
> 🔴 **Ce qui demande une relecture de Loïc en priorité** : l'étape 1.5 « Si ça tourne
> mal » de `o3` — contenu neuf, seul contenu du dépôt qui engage la **sécurité
> d'élèves**, à confronter au règlement du laboratoire et aux équipements de la salle
> 0.26. Ensuite, les **six arbitrages en attente** (O-23 à O-26, O-28, O-29).

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
feuille passe en **`?v=8` dans les 17 fichiers**. Dix encarts changent d'allure, dont
**un hors seconde PC** — `term-es-t2-c1` : la feuille est partagée, c'est voulu.
Vérifié à la mesure : symétrie au pixel, losange à 0,22px de la médiane des capitales,
libellé sur deux lignes à 390px sans losange orphelin, et **survie à la photocopie**
(niveaux de gris + seuil dur).

**Les fiches de 2nde PC se distribuent maintenant en PDF.** Six fiches exportées dans
`assets/pdf/pc/fiches/` — `t1c2` (10 p.), `t1c4` (6 p.), `o1`, `o2` et `o4` (2 p.),
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
> 🔴 **`chapitre-commun.css` est en `?v=8` — dans 17 fichiers, pas 14.** Le
> brief et `CLAUDE.md` parlent des « 14 pages PC » ; le dépôt compte trois
> fichiers de plus qui chargent cette feuille : `_modeles/gabarit-chapitre.html`
> et les **deux pages d'enseignement scientifique de Terminale**. La consigne est
> à corriger.
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
| **PC seconde** | 14 chapitres en ligne. 🆕 **Les sujets de DS et de TP sont en ligne depuis le 26/08** : 6 DS et 15 TP dans `assets/pdf/pc/`, une puce par sujet sur la carte du hub et un `.video-chip` dans la page — le TP après la section dont il est l'application, le DS dans « Pour le DS, je sais ». Un sujet à cheval est lié depuis chaque chapitre qu'il couvre. La puce « Exercices 🚧 » a disparu des 14 cartes. **Aucune correction n'est en ligne** (elles partent par mail contre preuve de travail), et aucun fichier portant un nom de classe ou une date de séance n'a rejoint le dépôt. Le hub compte désormais **15 cartes de chapitre** : T3-C5 « Formation d'une image » existe **sans page de cours** — le TP13 en tient lieu, c'est la forme retenue, pas un chantier. Sept fichiers annexes (programmes Python, tableurs, vidéo, fichiers Latis Pro) attendent un arbitrage avant toute publication. 🆕 **Le hub a été repris le 26/08** : une phrase d'accroche par carte, une vignette tirée du cours sur 9 des 17 cartes (les 8 autres n'ont aucun visuel disponible). Les phrases ne sont pas validées. 🆕 **Trois sont en V1 intégrale** (25/08) : `T3-C1` (**audits 1 et 2 entièrement appliqués** au 26/08 — 6 figures refaites en SVG maison, méthode en deux colonnes avec figure d'étapes, 8 transitions, 4 encarts d'histoire des sciences, 2 icônes d'exercice, 12 gras d'insistance retirés, **plus aucun `.a-faire`** ; il ne lui manque que sa fiche élève), `T3-C3` (34 figures) et `T3-C4` (20) — cours entier à l'écran, plus aucun `.a-faire` sauf le lien de DS. 🆕 **L'encart 🔧 « Lien du DS » a été retiré partout où le lien est posé** (T2-C1, T3-C3, T3-C4, en plus de T3-C1) : T3-C3 et T3-C4 n'ont désormais plus aucun `.a-faire`. Chez T2-C2, T2-C3 et T3-C2, sans lien DS, l'encart garde son sens et reste en place. 🆕 **La fiche vierge se télécharge depuis le haut de la page de cours**, `.hors-verrou`, même sans le code — posé sur `t1c2` et `t1c4`, **les 2 seuls chapitres sur 14 dont la fiche est écrite** ; les 12 autres attendent la leur. Leurs trois relevés attendent tes décisions. **Le thème 3 n'a plus que T3-C2 en ébauche.** T1-C1→C4 sont dégrossis à fond ; les **sept autres portent 81 blocs `.a-faire`**, à reprendre selon `_modeles/CONSIGNES-V1-integrale-PC.md`. 🆕 **Plus aucun exercice de PC n'est sans corrigé** : les trois qui manquaient (T2-C1 ex. 2 et 3, T2-C2 ex. 10) ont été rédigés le 25/08, figures comprises. Aucun cours validé. |
| **Outils transversaux PC** | **Quatrième famille, ouverte le 25/08.** Des méthodes que tous les chapitres mobilisent, hors progression, disponibles toute l'année. 🆕 **LES HUIT OUTILS SONT ÉCRITS** au 28/08, tous en V1 proposée : `o1` écriture scientifique · `o2` chiffres significatifs · `o3` sécurité au laboratoire · `o4` verrerie · `o5` compte rendu de TP · `o6` présenter un calcul · `o7` relation algébrique · `o8` graphique. Le catalogue a été **renuméroté** (O-23) dans l'ordre où un élève les rencontre, et **« Convertir » en sort** — `o1` en avait absorbé tout le fond le 26/08. Chaque outil a sa page, sa **fiche A4** (2 pages, 4 pour `o3`) et sa carte au hub. **Le visuel est dessiné ici, sauf le figuratif** (règle du 29/08) : 21 pièces de verrerie (`o4`), une frise de rubriques (`o5`), deux copies annotées (`o6`), le triangle et les fractions empilées (`o7`), cinq graphiques dont une grille vierge (`o8`). 🆕 **`o3` fait exception depuis le 29/08** : ses 9 pictogrammes CLP sont **vectorisés** depuis le PDF officiel, sa tenue est une **illustration fournie**, et ses 5 équipements sont des **cadres de réservation** en attente d'image. 🆕 **Deux gabarits** (`_modeles/gabarit-outil-PC.html` et `gabarit-fiche-outil-PC.html`) : un nouvel outil se copie depuis eux, et non plus depuis `o1`. Tous tournent sur le moteur SNT **sans le modifier**, et **les fiches se distribuent en PDF** depuis le 28/08 (`node exporter-fiches.mjs`). 🔴 **Décisions de fond en vigueur** : seuil de l'ordre de grandeur à **5**, pas de zéro ambigu en seconde, « à retenir » en **trois temps**. ⏳ **Rien n'est validé**, et **sept arbitrages sont appliqués par défaut** (O-23 à O-29), tous en attente sauf O-27. ⚠️ **`o3` engage la sécurité d'élèves** : son étape « Si ça tourne mal » doit être relue contre le règlement du laboratoire et les équipements réels de la salle 0.26. |
| **SNT** | 8 séquences de thème (`t0`→`t7`) **+ 1 module transversal** (`m1` « Représenter l'information »). `t0`, `t1` et `t2` sont sur le **moteur partagé** et en **V0 complète** ; `t3`→`t7` en V0 partielle (S1 rédigée, suite en 🚧). **`t1` est le seul thème validé sur le fond** (23/08) — il sera *clos* après la vérification des fiches. **`t0` a été refondue le 23/08 puis auditée le 24/08** : voir sa ligne. |
| **SNT — plafond d'avance** | 🆕 Écrit le 20/08, **branché sur `t0`, `t1`, `t2` et le hub**, testé (21 assertions sur le module, harnais DOM sur la cascade) et **vérifié au rendu** dans un navigateur sans interface : bandeau, pictogramme et teinte mesurés sur les deux familles de pages, en mode élève et en mode enseignant. Le tableau de bord affiche les **dates de clôture** (cases de clôture et frise, format `12/09`). ✅ **`bdd/schema/013-verrou-progression.sql` a été exécuté le 20/08/2026** par Loïc : `mon_plafond()` répond en base, et un appel anonyme se heurte bien à `42501 permission denied` — la fonction est réservée aux comptes connectés, comme prévu. Le plafond est donc **actif de bout en bout**. Deux textes vus par les élèves attendent la validation de Loïc. |
| **SNT — `t0` Introduction** | 🔄 **Refondue le 23/08/2026, reprise les 24 et 25/08.** État courant : **4 séances · 26 étapes · 18 portes · 6 QCM (39 questions) · 4 réponses rédigées corrigées · 2 réponses personnelles · 2 dépôts d'image · 10 fiches d'élément · 1 tri · 1 exercice d'étiquettes · 1 poste de visionnage · 4 SVG maison**. Apports du 25/08 : l'activité débranchée devient la **séance 4**, dans la cascade et avec sa fiche, où l'élève remplit **dix fiches d'élément** (photo redimensionnée dans le navigateur, nom, ce qu'il fait — trois suffisent à valider) ; un **exercice d'étiquettes à poser** sur la façade arrière en 3.3, dix zones contrôlées une à une sur l'image source ; **trois captures de l'interface** en 1.1, produites depuis la page rendue ; et la **carte du thème** enfin chargée — sans elle, le lien « ⌂ Sommaire » ne faisait rien. ⏳ **Rien n'est validé.** Restent ouverts : la **remontée des photos vers le tableau de bord** (chantier séparé, avec une durée de conservation à décider) et la **licence des 37 images issues du PDF d'un collègue**.
| **SNT — `t1` Internet** | ✅ **Validé sur le fond le 23/08/2026**, audit dicté page ouverte, les 26 étapes descendues une à une. **6 séances · 25 étapes** (5.5 supprimée) · 112 questions de QCM toutes relues · 27 réponses rédigées · 27 grilles de pré-correction, aucune orpheline · aucun bloc `.a-venir`. Les échafaudages ont quitté la page élève : neuf notes de chantier retirées, contenu consigné dans `DECISIONS.md`. Corrigés le même jour : le titre fantôme des « pour aller plus loin » (3.3 s'annonçait « À faire chez toi »), la porte d'intuition de 4.3 qui s'ouvrait à la frappe au lieu du partage, le clic muet sur une étape à venir, et la superposition de la carte de progression (deux rangées dès 6 nœuds, libellés sur deux lignes). Ajouté : un **dépôt de deux copies d'écran en 6.4** (`NET-D6`, `NET-D7`) pour garder trace des `ping` et `tracert`. ⏳ **Ce qui manque pour clore** : (1) le passage de vérification de Loïc **sur les fiches** ; (2) `ping`/`tracert` et `nslookup` **depuis un poste de la salle** — si l'ICMP sortant est filtré, l'étape 6.4 est à repenser ; (3) les **copies d'écran déposées ne remontent pas encore dans la fiche** (`CONSIGNES-sequence-SNT.md` §17.2). **Plus aucun contenu pédagogique ne manque** : la passerelle NSI, dernier trou, est abandonnée pour le moment et rangée dans `IDEES.md`. |
| **SNT — module `m1` Représenter l'information** | 🔎 **Audits des 22 et 23/08 traités en entier.** 2 séances, 9 étapes, **6 QCM** (dont un bonus adossé à une vidéo), 9 exercices, **4 composants SVG maison** et un bilan de 12 questions. Le module pose le socle mathématique : ce qu'est une base, ce qu'est une puissance, la notation en indice (`1011₂`). **Apports du 23/08** : la décomposition positionnelle fait saisir *les chiffres* et pas seulement les poids, avec un exemple posé avant ; la base 60 se décompose en six temps ; le tableau des combinaisons **se complète** de 5 bits au cas général n ; l'atelier 1.5 est **découpé en trois groupes** A/B/C, chacun avec sa correction détaillée ; le classement passe à **11 écritures** et ses deux règles deviennent un indice ; l'écart de 2.2 se calcule sur la **formule générale** ; le bonus 1.1 devient **vidéo Veritasium + QCM de 5 questions**, et `REP-R1` un résumé. Les trois outils manipulables **annoncent enfin leur limite** (1 à 4095) et disent pourquoi ils refusent un nombre ; la flèche de la potence est **rectiligne**. Tout vérifié au navigateur : les 9 blocs passent « tout est juste » sur les réponses attendues, **0 erreur JS**, repli à 390 px sans débordement de page. **Le bloc de chantier et les badges « à valider » ont été retirés le 23/08** à la demande de Loïc — geste d'affichage, pas validation : **rien n'est validé, tout le contenu pédagogique reste une proposition.** |
| **SNT — moteur partagé (`sequence-snt.js` v41)** | 🔧 **Deux composants et trois correctifs le 25/08**, après les quatre changements du 24/08 (vidéos derrière une affiche, barre de fiche verrouillée, pastille « rendu pas relu », figures dans la fiche). Nouveaux : **`initElements`** — des fiches photo + nom + description, l'image étant **redimensionnée dans le navigateur** (une photo de téléphone pèse 3 à 5 Mo, dix feraient plier l'onglet) ; **`initEtiquettes`** — des noms à poser sur une photo, en **deux temps** plutôt qu'en glisser natif, qui ne fonctionne pas au doigt sur iPad. Corrigés : ① **les dépôts de photo ne validaient aucune étape** — `initDepot` appelait deux fonctions d'un autre bloc du fichier et levait une erreur à chaque dépôt ; ② le plafond de 1600 px des blocs « pour aller plus loin », qui coupait la vidéo de fin sur iPad ; ③ un bloc qui se dépliait hors de l'écran, où le clic paraissait sans effet.
| **Base de données** | ✅ **en service.** Supabase, région **West EU (Paris)**. 7 tables, 10 policies RLS, 4 fonctions, sauvegarde hebdo + réveil quotidien. Pilote prouvé de bout en bout sur `t1`. |
| **Pré-correction IA SNT** | ✅ worker local complet, testé, avec garde-fous et tri de relecture (`ia-snt/`). ⚠ boucle non fermée — voir ci-dessous. |
| **Livret CFA** | 17 outils + index en ligne, tous à la structure `.contexte` / `.question` / `.reponse`. Mise en page reprise le 19/08 (une seule colonne, un seul bord d'attaque), puis **audit de contenu des dix-sept outils le même jour** : accroche recentrée sur l'atelier, « effort » → « force » partout, `ε` pour l'écart et `θ` pour les angles de rotation, paliers 1 dégonflés de leur guidage, sous-questions concaténées, vecteurs fléchés et racines couvrantes. Deux figures produites (bras de levage de l'Outil 5, composantes de l'Outil 14), une dizaine corrigées. Les **fiches A4 ne suivront qu'après validation des versions en ligne** — 15 des 17 liens « version à imprimer » sont donc morts. Rien de validé : **l'Outil 0 est le premier attendu en relecture**. Depuis le 19/08 le livret est **branché sur le dispositif de comptes** : connecté, le travail va en base et suit l'apprenti d'un appareil à l'autre ; sans compte, tout reste sur l'appareil comme avant, et la page le dit. Les deux codes de classe (`CFA26A`, `MVT26A`) sont ouverts : `bdd/schema/012-classes-cfa.sql` a été exécuté le 20/08. |
| **Cahier de vacances** | 14 pages, 2 blocs 🚧. La partie la plus finie du dépôt. |
| **Coque — page d'accueil** 🆕 | 🔄 **Refondue le 27/08** après comparaison de onze maquettes (dix organisations, puis six fonds). Deux colonnes asymétriques : à gauche les trois classes en portes illustrées — PC, SNT, CFA en **une seule porte** pour les deux diplômes — les trois autres niveaux en lignes sobres marquées `.a-venir`, puis l'adresse professionnelle réelle ; à droite une colonne collante (gravure du jour, 4 fiches-outils, Animations 🚧, Mission Spectra). Nouvelle bande « Auteur & vidéo » en pied, **vide, trois entrées en chantier**. Le compte à rebours bascule sur l'état du projet passé le 1er septembre. `style.css` **non modifié** ; tout le CSS reste inline. Décisions ACC-1 à ACC-12. ⏳ **Deux formulations à valider** : la bascule d'après-rentrée (« En chantier · ouverture en cours d'année ») et le libellé des trois entrées « Auteur & vidéo ». La planche du jour reste un **cadre annoté** tant que `gravures/` est vide. |
| **ES Terminale** | frise fonctionnelle en local ; `serveur-frise/` et `ia-correction/` en chantier. |

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
- [ ] Nettoyage avant rentrée : compte `leproftest` + lignes de test
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
