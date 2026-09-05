# Registre des décisions

> **Une ligne par décision, datée, avec son statut.** En ajout seul : une
> décision remplacée n'est pas effacée, elle passe en ~~barré~~ avec un renvoi
> vers celle qui la remplace.
>
> **Pourquoi ce fichier existe.** Avant lui, une décision qui changeait laissait
> le paragraphe périmé en place, coiffé d'un « ⚠ Mise à jour du 20/07 ». Les
> fichiers de référence finissaient par contenir autant de faux que de vrai —
> l'audit du 23/07 y a trouvé six contradictions, dont cinq dans un seul
> paragraphe. Désormais : **les fichiers de référence décrivent l'état courant,
> l'historique vit ici.**

Statuts : ✅ en vigueur · ~~barré~~ remplacée · ⏳ en attente d'arbitrage

---

## En attente d'arbitrage

| Date posée | Sujet | Enjeu |
|---|---|---|
| 18/07/2026 | ⏳ Volume horaire type d'une séquence SNT | Le Web fait ≈ 6 h sur 4 séances + 1 débranchée. |
| 18/07/2026 | ⏳ Équivalent d'un « régime A » pour les séquences SNT | Non tranché : une séquence se rédige, elle ne se transcrit pas d'un PPTX. |
| 16/07/2026 | ⏳ Ordre du Thème 3 (PC) | Ordre des PPTX conservé, ou renumérotation son / spectres / signaux. |
| 21/07/2026 | ⏳ Harmonisation des codes d'activité `NET·xx` / `NET-xx` | Gelée le temps de traiter la couche Supabase. |
| — | ⏳ Sort de `2nde-snt.html` à la racine | Redirection conservée, ou `git rm`. |
| 20/08/2026 | ⏳ **Les deux textes du plafond, vus par les élèves** | Le bandeau d'une séance fermée (`verrou-snt.js`, `MOT_PLAFOND`) et la note d'une carte fermée au hub (`hub-snt.js`, `.tc-plafond`). C'est du **fond pédagogique** : proposition à valider, pas un acquis. |
| 20/08/2026 | ~~⏳ **Sort de `supabase/migrations/`**~~ | Le dossier s'arrête au `011`. `012`, `013` et `014` ont été joués à la main sans y être copiés ; `007` (frise ES) n'y est pas non plus et n'a jamais été exécuté — il attend la validation de Loïc. Soit on le réaligne (et il redevient la référence rejouable), soit on l'abandonne au profit de `bdd/schema/` seul. En l'état il décrit une base qui n'existe plus. **Tranché et fait le 04/09/2026 : réaligné.** Les fichiers manquants y sont déposés, horodatés à leur date d'exécution réelle, et déclarés appliqués : `migration list` donne 11 locales, 0 absente. Il y en avait **six** et non cinq — le `011` n'avait jamais été inscrit au registre non plus. `007` (frise ES) demeure hors historique tant qu'il n'est pas exécuté. |
| 20/08/2026 | ~~⏳ **Les trois questions ajoutées à `NET-Q7`**~~ (`t1` 5.2 — IP privée/publique, DHCP) | Le bloc n'en portait qu'une, sous le minimum de 3-4 de la §15.5. Trois écrites à partir de ce que dit l'étape : adresses privées réutilisables d'un logement à l'autre, adresse publique unique du foyer, attribution dynamique. **Contenu : proposition, pas un acquis.** **Validées le 23/08** (clôture de `t1`). |
| 22/08/2026 | ~~⏳ **L'allègement de l'étape 4.2 « Les câbles sous-marins »**~~ | Huit blocs numérotés, trois textes à trous, un QCM de dix questions, quatre dépôts d'image : Loïc la trouve trop lourde. Un **plan d'allègement** est proposé dans `ETAT-PROJET.md`, **rien n'a été appliqué** — le contenu pédagogique lui appartient. **Tranché le 23/08 : écarté** — la séance 4 n'est pas allégée, voir « Clôture de `t1` ». |
| 22/08/2026 | ⏳ **Le « pour aller plus loin » à déplacer vers la nouvelle séance 2** | La dictée était ambiguë. Lecture la plus probable (Loïc et moi) : c'est le bonus **Pouzin / CYCLADES** de l'ancienne étape 1.5 qui deviendrait le bonus de fin de la séance 2 — il porte déjà le podcast France Culture sur CYCLADES, et l'enquête box n'a rien à voir avec ARPANET. **Laissé en l'état**, ce n'est pas à Claude Code d'en décider. |
| 22/08/2026 | ~~⏳ **Textes proposés, non validés, dans les étapes 4.2 et 4.3**~~ | Les trois phrases de l'enquête box, le développement sur Meta/Microsoft et sur 2Africa, le passage sur la fibre optique, la définition de « saturer », le paragraphe qui sépare les topologies d'Internet, et la note d'en-tête de 4.3. Tous marqués « PROPOSITION À VALIDER » dans le HTML. **Validés le 23/08** (clôture de `t1`). |
| 22/08/2026 | ~~⏳ **Deux grilles de pré-correction devenues orphelines** (`NET-R-ville`, `NET-R4b`)~~ | Tranché le 23/08 à la clôture de `t1` : **supprimées**, voir la section « Clôture de `t1` ». |
| 20/08/2026 | ~~⏳ **Les 51 leurres de QCM réécrits dans `t1`**~~ | Méthode retenue par Loïc (étoffer les distracteurs) appliquée aux 20 questions signalées. Chaque leurre a été rallongé et rendu plus plausible : **c'est du contenu**, à relire avant validation. Deux questions ont été touchées par ricochet et remises en état (`NET-Q8` q15, `NET-Q4` q2). **Validés le 23/08** (clôture de `t1`). |
| 20/08/2026 | ~~⏳ **Les deux indices de niveau 2 réécrits** (`t1`)~~ | « Quelques centaines de km : 425 » et « Des gigaoctets par seconde : Go/s » livraient la réponse — le premier sur un exercice de **lecture de carte**, ce qui le vidait de son sens. Remplacés par un renvoi vers l'endroit où lire, et par une règle de construction d'unité. **Validés le 23/08** (clôture de `t1`). |
| 25/07/2026 | ⏳ Hébergement des vidéos SNT | La vidéo DNS et celle des couches existent sur le **PeerTube du ministère** (`apps.education.fr`). `youtube-nocookie` supprime le cookie publicitaire mais **pas les publicités**, ce qui est le motif de Loïc. Réserve à lever avant de basculer : PeerTube peut diffuser en **pair-à-pair**, ce qui exposerait l'IP de l'élève à d'autres spectateurs. **23/08 : statu quo pour `t1`** — « ça fonctionne comme ça, c'est très bien ». Ne conditionne plus la validation du thème ; **Digiview** est ajouté aux pistes à évaluer (`IDEES.md`). |
| 26/08/2026 | ⏳ **Les `.py` du TP07 et du TP14** | Lesquels sont le code **donné aux élèves** (« prog à modif » ?) et lesquels sont des corrigés ? Rien n'est publié tant que ce n'est pas dit. |
| 26/08/2026 | ⏳ **La vidéo `DISSOLUTION … .mp4` du TP09** | Origine et droits non établis, vraisemblablement une vidéo tierce téléchargée. Un lien vaut mieux qu'un fichier lourd dans le dépôt. |
| 26/08/2026 | ⏳ **Les trois `.ltp` du TP06** (Latis Pro) | Format propriétaire, utile en salle de TP seulement. À confirmer avant publication. |
| 26/08/2026 | ⏳ **Les deux `.xlsx` du TP01** (« graphique (eau salée) », « valeurs (élèves) ») | Ni nom de classe ni date : probablement des gabarits vierges. À ouvrir et vérifier avant de publier. |
| 26/08/2026 | ~~⏳ **La fiche « coups de pouce et mesures » du TP03**~~ | **Tranché le 26/08 : elle ne part pas.** « Ne mets pas les coups de pouce, juste les fichiers TP en PDF » — seul le PDF du sujet nu est publié. |
| 26/08/2026 | ⏳ **Le TP12 couvre aussi la réfraction** | Le brief le rattache au seul T3-C3 « Dispersion et spectres », mais son titre et son sujet portent la réfraction, qui est T3-C4. Une seconde puce (D4) ? À trancher au lot 2. |
| 26/08/2026 | ⏳ **La puce « TP — capteur de température » de T3-C2** | Ce TP annoncé n'existe pas dans le lot ; la puce d'attente a cédé la place au TP14 « Protection d'une LED ». À confirmer, ou à rétablir à côté. |
| 26/08/2026 | ⏳ **La note « Lien du DS — à poser chaque année »** (7 chapitres) | Ce bloc `.a-faire` dit qu'un lien « DS » figure dans la source mais n'est jamais activé. Dans **T2-C1, T3-C1, T3-C3 et T3-C4** le sujet du DS est désormais posé juste au-dessus : la note y est redondante. La retirer sur ces quatre-là (elle reste juste sur T2-C2, T2-C3 et T3-C2, qui n'ont pas de DS), ou la garder pour les années suivantes ? |
| 26/08/2026 | ⏳ **Les deux cartes « Outils transversaux » du hub 2nde PC** | Elles restent en `.chapitre`, ouvertes, pendant que les quinze chapitres deviennent des panneaux repliables. Le brief ne couvre que les cartes de chapitre et n'attribue pas d'illustration aux outils. Les convertir aussi (avec deux images à choisir), ou assumer les deux styles ? |
| 26/08/2026 | ⏳ **Le cadrage de `t2c1-danseur-rotation.jpg`** | Dans la bande repliée (230 × 88), à `--cp-focus:50% 55%`, il ne reste qu'une masse rouge floue : le derviche n'est pas identifiable. Réglage à revoir, ou photo à changer — jamais l'image elle-même (§8.3 du brief). |
| 26/08/2026 | ⏳ **La maquette `panneau-ouverture-continue.html`** | Absente du dépôt au moment de la refonte. Le CSS structurant (hauteurs, voile, chiffre, ouverture continue) vient du brief §3.3 ; `.cp-tit`, `.cp-num`, `h3`, `.cp-compte`, `.cp-chev`, `.cp-corps`, `.cp-res` et `.cp-liens` ont été dérivés de la charte « papier d'étude ». À réaligner si la maquette est déposée. |
| 02/09/2026 | ~~⏳ **La chaîne des diaporamas**~~ | **Tranché le jour même : elle n'existe pas** et ne sera pas récupérée. Voir « La chaîne des diaporamas n'existe pas ». |
| 02/09/2026 | ~~⏳ **La place du `.pptx` de T3-C1**~~ | **Tranché le jour même : versionné** dans `assets/pptx/pc/`. Voir « La chaîne des diaporamas n'existe pas », DIA-7 et DIA-8. |
| 02/09/2026 | ⏳ **La fiche de T3-C1 est en avance sur la validation du cours** | Elle est intégrée et téléchargeable depuis le 02/09, alors que le **jalon 5** (« cours VALIDÉ », acte explicite de Loïc) n'a jamais été posé. Soit le cours est validé et le jalon suit, soit la fiche attend — mais l'état actuel dit les deux à la fois. |
| 02/09/2026 | ⏳ **IBM Plex Mono n'a pas d'italique auto-hébergée** | Les mentions « Donnée : … » des énoncés sortent du PDF en `Consolas-Italic`, dans un autre dessin que le reste. Ajouter la fonte italique à `assets/css/fonts.css`, ou renoncer à l'italique sur le mono ? Concerne toutes les fiches, pas seulement T3-C1. |
| 26/08/2026 | ⏳ **Le texte de la carte « Formation d'une image »** | La phrase qui dit que le TP **est** le cours est une V1 (§8.1 du brief). Deux propriétés à garder si Loïc la réécrit : aucune tournure d'attente, et la raison énoncée simplement. |
| 05/09/2026 | ⏳ **La place des outils transversaux dans la progression SNT** | Règle provisoire posée ce jour : `snt-m*` est hors de la file du plafond, toujours ouvert, jamais compté. Loïc la reprendra **quand la progression de l'année sera établie** — le module pourrait alors devenir une étape datée, ou rester une ressource permanente. Voir « Les outils transversaux sortent du plafond ». |

---

## Les outils transversaux sortent du plafond — 05/09/2026

**Le symptôme.** Sur le tableau de bord, la frise d'un groupe neuf à
`avance_max = 2` n'ouvrait pas la première séance du cours : elle ouvrait les
deux séances du module `snt-m1`, et fermait `snt-t0/s1`.

**La cause.** `verrou-snt.js` linéarisait la file des séances par
`Object.keys(SEANCES_SNT).sort()`. `'snt-m1'` se range avant `'snt-t0'` : le
module occupait les rangs 0 et 1 de l'année. Curseur à −1, plafond à
−1 + 2 = 1 → seuls les rangs 0 et 1 étaient ouverts. Le tableau de bord lisant
ce même calcul, il affichait fidèlement une file fausse. Trois groupes étaient
concernés côté élève : B, E et N, les seuls à `avance_max = 2`.

**La règle retenue.** Une séquence dont la clé commence par `snt-m` est **hors
progression** :

- **toujours ouverte**, quel que soit le plafond ;
- **jamais comptée** dans le curseur — clôturer M1 S1 n'ouvre aucune séance de
  thème ;
- **absente de la frise**, qui ne montre que ce que le plafond commande ; une
  ligne sous la frise le dit, pour que l'absence ne se lise pas comme un oubli.

Le préfixe est déjà la convention du hub (famille « Outils transversaux »,
pages `2nde-snt-mN-…`) : un futur `snt-m2` héritera de la règle sans qu'on y
touche.

**Ce que la règle ne touche pas.** Le **suivi** d'un module est celui de
n'importe quelle séquence — cahier de textes, absents, grille élève par élève,
compteurs de retard et de dette — en le choisissant comme thème. Cette chaîne
passe par `seances_faites` filtré sur la séquence, jamais par `VerrouSNT`.
Vérifié avant livraison.

**Corrigé au passage.** `snt-m1` s'affichait **brut** dans les menus de thème et
dans la phrase du plafond : `replace('snt-t', 'Thème ')` ne l'attrapait pas. Une
fonction `nomSequence()` nomme désormais les deux familles (« Thème 3 »,
« Module M1 »). Le module en devenait quasi introuvable dans le tableau de bord,
donc son suivi aussi.

**Statut : provisoire.** Inscrite en attente d'arbitrage ci-dessus. Elle vaut
tant que la progression de l'année n'est pas arrêtée.

---

## La rentrée 2026 : les 14 groupes et le cloisonnement — 04/09/2026

Passage de un à cinq enseignants de SNT. Ce qui n'avait aucune conséquence à un
seul professeur en avait cinq à la rentrée.

| Réf | Décision | État |
|---|---|---|
| RE-1 | **Les 14 groupes du lycée sont créés, tous, même ceux des collègues qui ne suivront pas le dispositif.** Motif : ça leur permet d'essayer avec des élèves fictifs sans rien demander à personne, et rien n'est à créer en urgence le jour où l'un d'eux bascule | ✅ |
| RE-2 | **Codes `SNT26A` … `SNT26N`** — six caractères, majuscules, reprenant **les lettres que le lycée emploie déjà**. Un élève qui entend « groupe E » tape `SNT26E` sans réfléchir. Seul `SNT26I` demande un « i comme Isaac » à l'oral | ✅ |
| RE-3 | **Chaque enseignant ne voit et ne touche que ses groupes** (`016`). Table `enseignants_classes`, 9 policies, 3 fonctions de correction resserrées. Aucune copie d'élève ne franchit la frontière entre collègues, **dans les deux sens** — Loïc ne lit pas davantage les groupes des autres | ✅ |
| RE-4 | **Le tableau de bord est un outil de SNT, et rien d'autre.** Le livret CFA et le reste restent dehors : leur progression ne s'y suit pas. Aucun filtre n'a été codé pour ça — une classe rattachée à personne est invisible de tous, et c'est suffisant | ✅ |
| RE-5 | **`avance_max = 40` (tout ouvert) partout sauf sur les trois groupes de Loïc.** Indispensable et non prudent : le plafond se déduit des séances déclarées faites, donc un enseignant qui ne tient pas le cahier de textes bloquerait ses élèves dès la séance 2. Chacun peut le redescendre depuis l'onglet *Séance* | ✅ |
| RE-6 | **Le worker de correction IA ne change pas** : il écrit globalement en `service_role`, hors RLS. Le tri se fait à la **lecture** — une copie corrigée n'apparaît que dans la file de l'enseignant de l'élève. Aucune ligne de code de tri n'existe, et c'est pour ça qu'elle ne peut pas se tromper. Coût des copies fictives : négligeable à 350 élèves | ✅ |
| RE-7 | **Les comptes de test sont conservés**, et changent de statut : de reliquats à effacer, ils deviennent le matériel de démonstration. `SNTDEM` (35 copies, à Loïc) porte la vraie file de correction pour les captures d'écran ; `PROF26` (0 copie, aux cinq) est le terrain d'essai commun. `SNTTEA` supprimée, ses 2 élèves versés dans `SNTDEM` | ✅ |
| RE-8 | **Convention `zz-` pour les élèves fictifs**, pour qu'ils restent repérables et supprimables en bloc en fin d'année sans risquer de toucher un vrai élève. À supprimer par le compte d'authentification, jamais par la fiche élève — le sens inverse laisse un compte orphelin | ✅ |
| RE-9 | **Deux guides, pas un**, atteignables par le bouton *Aide* du tableau de bord et exportés en PDF pour la pièce jointe. Ils font partie du **périmètre du tableau de bord** : toute modification de celui-ci les met à jour dans la même livraison. Un guide faux envoie chercher le problème au mauvais endroit | ✅ |

### Trois défauts préexistants trouvés en chemin

| Réf | Ce que c'était | État |
|---|---|---|
| RE-10 | 🔴 **Le chemin d'écriture des corrections n'était pas gardé.** `valider_copie`, `signaler_copie` et `rouvrir_copie` sont `security definer` : elles **contournent la RLS par construction**, et ne vérifiaient que « est-ce un professeur ? ». Fermer la lecture ne suffisait donc pas — n'importe quel enseignant aurait pu valider n'importe quelle copie du lycée en connaissant son identifiant. Corrigé dans le `016`, contrôle de classe **avant** toute lecture de la copie, pour que les messages d'erreur eux-mêmes ne renseignent pas | ✅ |
| RE-11 | 🔴 **Le réglage du plafond d'avance n'écrivait rien depuis le début.** Le tableau de bord fait un PATCH sur `classes`, mais aucune policy `update` n'existait sur cette table : sous RLS le PATCH ne modifiait aucune ligne, et PostgREST répondait 200, que l'interface lisait comme un succès. Même panne muette que le bouton « Partager avec la classe » du 20/08. Confirmé par l'audit `7f` du `016` — il n'y avait bien que la lecture. Réparé par `classes_regler_prof` | ✅ |
| RE-12 | 🔴 **`REPRISE.md` annonçait deux classes de test qui n'existaient pas.** `SNTTSA` et `SNTTSB` contre `SNTTEA` en réalité, et une seule au lieu de deux. Le fichier portait pourtant sa propre alerte — « non revérifié depuis le 01/08 ». Le ménage écrit d'après lui a visé à côté sans rien trouver, ce qui est le bon comportement, mais a coûté un aller-retour. **Leçon : une note de doc qui se déclare non vérifiée doit l'être avant de servir de source à du code qui efface** | ✅ |

---

## La chaîne des diaporamas n'existe pas — 02/09/2026

Loïc : « elle n'existe pas ». `extract_svg.py`, `build.js` et `anime.py` ont vécu
le temps d'une session hors dépôt et ne sont pas récupérables. Le fichier produit,
lui, a été retrouvé et vérifié.

| # | Décision | Statut |
|---|---|---|
| DIA-1 | **`CONSIGNES-diaporama-PC.md` est une méthode, pas un mode d'emploi.** Les neuf règles, la mécanique d'animation et les pièges disent *quoi refaire* ; aucune commande de la §4 ne peut être lancée. Le document le dit maintenant en tête, et la §4 est titrée « telle qu'elle a tourné une fois » | ✅ |
| DIA-2 | **`_outils/diaporamas/` est supprimé.** Un dossier vide qui attend une chaîne qui n'arrivera pas est un mensonge de rangement | ✅ |
| DIA-3 | **Un diaporama se retouche à la main dans PowerPoint.** Corollaire de DIA-1 : rien ne peut le régénérer. Le standard §8 le disait déjà pour les animations — ça vaut désormais pour tout le fichier | ✅ |
| DIA-4 | **La version finale est identifiée** : celle dont les indices sont typographiques (`U`+`max` en deux runs), conforme à R4. Le second fichier de `Téléchargements`, d'apparence identique (12 diapositives, 53 étapes, 34 médias), porte encore `U max` en texte plat | ✅ |
| DIA-5 | **Le `.pptx` est mis à l'abri dans `_a-deposer/diaporamas/`** — zone **ignorée par Git**, donc rien n'est publié, mais rien n'est sauvegardé non plus. Geste conservatoire : il ne vivait que dans `Téléchargements` | ✅ |
| DIA-7 | **Le `.pptx` est versionné** — `assets/pptx/pc/diaporama-2nde-<code>.pptx`, 2 Mo. Motif : il n'est plus régénérable, et une zone ignorée par Git ne sauvegarde rien. Contrôlé avant d'être versé, le dépôt étant public : aucune correction à l'écran (R1), aucune donnée d'élève ni de classe, métadonnées limitées à la signature du professeur — déjà publique sur le site. **Aucune page n'y renvoie**, mais il reste accessible par son URL | ✅ |
| DIA-8 | **`.gitattributes` déclare les formats binaires manquants** — `pptx`, `docx`, `m4a`, `mp3`, `mp4`. Un `.pptx` est un zip : traité comme du texte sous `* text=auto eol=lf`, il serait corrompu. `audio/2nde-pc-t3-c4-intro.m4a` était déjà versionné dans cet angle mort ; vérifié intact, la détection automatique avait suffi — la déclaration explicite verrouille le comportement | ✅ |
| DIA-6 | 🔴 **Le tableau des célérités du diaporama est faux.** Vérifié dans le fichier : Air 340 · Eau **1 500** · **Bois 3 300** · Acier **5 000**, alors que le cours et la fiche donnent cinq milieux — Air 340 · Eau 1450 · Glace 3200 · Verre 5300 · Acier 5750. `STANDARD-fiches` affirmait que « le diaporama a été recalé » : **c'était faux**, et l'affirmation avait été reprise telle quelle dans la consigne le 02/09 au matin. Corrigée | ✅ |

---

## La chaîne des fiches élève entre dans le dépôt — 02/09/2026

Le générateur écrit hors dépôt le 29/08 est déposé dans `_outils/fiches/`, avec
la fiche de T3-C1 et ses deux images. Vérifié sur place : il régénère la fiche
**octet pour octet**. Trois défauts que seul le passage sur le poste de
production pouvait révéler ont été corrigés, dont un qui abîmait le PDF sans se
voir à l'écran.

| # | Décision | Statut |
|---|---|---|
| FIC-1 | **Le cartouche ne peut plus être avalé.** `.feuille` est un conteneur flex qui passe en hauteur fixe à l'impression : ses enfants y deviennent compressibles, et le cartouche (`height:60mm; overflow:hidden`) était **écrasé à zéro** — titre, logo, bandeau et introduction absents du PDF, alors que l'écran les montrait. `.feuille > *:not(.corps) { flex-shrink:0 }` : seul `.corps` absorbe, et un vrai débordement redevient visible | ✅ |
| FIC-2 | **La clôture ne passe plus sous le pied.** C'est la marge de notes (33 lignes × 7,6 mm), plus haute que la colonne principale, qui fixe la hauteur du corps de page : elle poussait le bloc « code de déblocage + QR » par-dessus le pied. La page qui porte une clôture passe à `lignes_notes=30`. Réduire la colonne principale n'y changeait rien — c'est la fausse piste à ne pas reprendre | ✅ |
| FIC-3 | **La chaîne tourne sous Windows.** Console en cp1252 : les `✓` et `⚠` levaient `UnicodeEncodeError` et tuaient le script **avant** l'écriture de la fiche → `sys.stdout.reconfigure(encoding="utf-8")`. `pdftoppm` (poppler) n'est pas installé → `mesurer_pages.py` rend par **PyMuPDF**, sans binaire externe. Fins de ligne forcées en LF | ✅ |
| FIC-4 | **La relecture des QR ne dépend plus de cairo.** `cairosvg` exige une DLL absente des postes Windows, ce qui rendait muet un contrôle **bloquant**. Le repli repeint le tracé SVG lui-même — donc relit bien le fichier livré, pas la matrice d'origine. Les cinq QR de T3-C1 passent `✓` | ✅ |
| FIC-5 | **La fiche est en ligne** : source générée `fiches/fiche-2nde-t3c1.html`, PDF de 8 pages, bouton `hors-verrou` sur la page du chapitre. Creux cumulé 44 mm, aucun débordement, A4 exact, 10 polices incorporées | ✅ |
| FIC-6 | **L'aperçu du 29/08 n'est plus une référence** : il porte 272 mm de creux, l'état d'avant les corrections de remplissage. Le générateur fait foi | ✅ |

---

## Les supports de classe entrent dans le dépôt — 02/09/2026

Deux standards de production écrits le 29/08 hors dépôt — la **fiche élève** et le
**diaporama de projection** de T3-C1 — y sont déposés. L'audit qui a accompagné ce
dépôt a trouvé que les deux documents décrivent un outillage **absent du disque
entier**, et que la racine portait vingt notes de livraison datées, c'est-à-dire du
récit rangé là où on cherche des consignes.

| # | Décision | Statut |
|---|---|---|
| SUP-1 | **Les deux standards deviennent des `CONSIGNES-`** : `_modeles/CONSIGNES-fiche-eleve-PC.md` et `_modeles/CONSIGNES-diaporama-PC.md`. Une seule convention pour « ce que j'ouvre avant de produire X » — le préfixe `STANDARD-` aurait fait cohabiter deux nommages pour la même fonction | ✅ |
| SUP-2 | **La chaîne d'export PDF est celle du dépôt.** Le standard prescrivait une impression manuelle depuis un navigateur ; `node exporter-fiches.mjs` fait la même chose par Chrome (`printToPDF`, `preferCSSPageSize`) **et** contrôle chaque export à la mesure. §4 étape 5 réécrite | ✅ |
| SUP-3 | **Le contrôle des polices entre dans la checklist des fiches.** Six fiches sur six portent des caractères qu'aucune des six familles auto-hébergées ne couvre (`⁻¹`, `⩽`, `π`, `Δ`…), servis en Arial. C'est le piège du fleuron, mais sur du contenu | ✅ |
| SUP-4 | **Les vingt notes de livraison passent en archive** — `_suivi/archives/livraisons/`. Elles racontent une session, elles ne prescrivent rien. `A-LIRE-DABORD.md` était le cas limite : un nom impératif sur une procédure d'extraction périmée depuis le 23/07 | ✅ |
| SUP-5 | **Les aperçus d'audit sortent du suivi Git** (`/_apercus-*/`, 3,7 Mo, 23 fichiers). Ce sont des captures de contrôle de la passe en cours, pas des assets du site | ✅ |
| SUP-6 | **`_outils/` est créé** : `tests/` pour les trois scripts de contrôle qui traînaient à la racine (ils lisent `DEPOT = '.'` — à lancer depuis la racine), `fiches/` et `diaporamas/` réservés aux chaînes de production | ✅ |
| SUP-7 | **Chiffres recalés** : seize marqueurs `a-noter` sur T3-C1 et non quatorze ; le tableau des célérités est celui du cours (cinq milieux) ; le code de déblocage est **S0NORE** ; `MANIFESTE.md` disait le SNT en « phase 2 » quand `CLAUDE.md`, plus récent, dit « phase 1 » | ✅ |

---

## Fin des illustrations figuratives dessinées de mémoire — 29/08/2026

Les visuels de l'outil 3 avaient été dessinés en SVG le 28/08. Relus à l'écran,
ils ne tenaient pas : la silhouette de l'élève était disgracieuse, et les neuf
pictogrammes CLP avaient des **formes inventées** — or c'est précisément l'objet
que l'élève doit reconnaître **à l'identique** sur un flacon. Un pictogramme
approximatif n'est pas un défaut esthétique, c'est une erreur de cours.

| # | Décision | Statut |
|---|---|---|
| IMG-1 | **Pas d'illustration figurative dessinée de mémoire.** Un schéma SVG maison reste légitime quand il représente une **structure** (axes, flèches, graphes, montages, arbres de décision) : là, le tracé est le contenu. Il ne l'est pas pour un **objet du monde** — silhouette, appareil, animal, pictogramme réglementaire, matériel de laboratoire. Portée : les 14 chapitres, pas seulement `o3` | ✅ |
| IMG-2 | **À la place, un cadre de réservation `.reserve`** aux dimensions finales, portant le nom de fichier attendu, une phrase décrivant ce qu'il faut y voir, et la contrainte de format. Loïc récupère l'image ; l'intégration se réduit à remplacer une balise. Patron de référence : `pages/2nde-pc-o3-securite-laboratoire.html` | ✅ |
| IMG-3 | ~~**« Les symboles CLP se dessinent maison »**~~ — **renversée.** Le sprite **vectorisé depuis les pictogrammes officiels** fait référence et se recopie tel quel d'un fichier à l'autre. Motif : l'élève doit reconnaître sur le flacon exactement ce qu'il a vu en cours. Cette règle antérieure avait produit neuf formes inventées | ✅ |
| IMG-4 | **Les cinq équipements de `o3` restent en attente d'image** : douche, rince-œil, extincteur, couverture anti-feu, sortie. L'outil 3 est **publié avec cinq cadres visibles**, ce qui est assumé — un trou doit se voir. Les références **ISO 7010** exactes restent à relire sur une planche avant de récupérer les fichiers | ✅ |
| IMG-5 | **Trois fichiers de référence réécrits** au lieu d'être coiffés d'une mise à jour : `CLAUDE.md` § Règles techniques communes, `_modeles/CONSIGNES-outil-PC.md` §5 et `_modeles/CONSIGNES-sequence-SNT.md` §consignes techniques portaient tous « les pictogrammes et les schémas se dessinent en SVG » | ✅ |

---

## La page d'accueil passe en deux colonnes — 27/08/2026

Onze maquettes jetables produites et comparées côte à côte : dix organisations
possibles, puis six fonds de page appliqués à celle qui a été retenue. L'accueil
était la seule page à n'avoir pas suivi le reste — quatre blocs centrés de même
largeur, dont le plus imposant (la planche du jour, 450 px) est vide tant que
`gravures/` n'est pas rempli, pendant que le hub PC recevait ses panneaux
illustrés.

| # | Décision | Statut |
|---|---|---|
| ACC-1 | **Maquette 03, « deux colonnes asymétriques »** (2,05fr / 1fr, gouttière 3,4 rem). La colonne large porte ce qui **est** une classe, la colonne étroite collante ce qui n'en est pas — gravure, fiches-outils, animations, Mission Spectra | ✅ |
| ACC-2 | **Le fond de page ne change pas.** Cinq partis pris ont été maquettés sur la structure retenue — encre inversée, deux papiers, spectre étiré, strates, blanc de laboratoire — et comparés au quadrillage de 32 px actuel, qui est conservé | ✅ |
| ACC-3 | **Une seule porte CFA**, étiquetée `CFA MATHS`, les deux diplômes nommés dans le résumé (« BTS MMCM et Bac pro MVTR »). Remplace le doublon de la table des matières, qui n'était documenté que par un commentaire dans `index.html`. **Sans effet sur la base** : les deux codes de classe `CFA26A` et `MVT26A` du 19/08 restent distincts | ✅ |
| ACC-4 | **Les trois classes deviennent des portes illustrées**, grammaire `.porte` dérivée de `.chap-panneau` du hub PC (bande de 230 px, voile, niveau en blanc) en version lien simple. Nom distinct : `.chapitre` et `.chap-panneau` ne sont pas réemployés | ✅ |
| ACC-5 | **L'accroche du chapeau devient neutre** — « Cours, travaux pratiques et corrigés, ouverts à toute heure. » Mission Spectra est désormais visible dans son encadré carmin : l'annoncer aussi dans le chapeau faisait redite | ✅ |
| ACC-6 | **Le lien « Voir la collection » est retiré** tant que `gravures/` est vide. Il bouclait sur lui-même. Aucune page `gravures.html` n'est créée : le sourcing (8 → 15-20 planches) n'est pas fait | ✅ |
| ACC-7 | **Le compte à rebours bascule.** Avant le 1er septembre : « N jours avant la rentrée », au singulier la veille. Après : « En chantier · ouverture en cours d'année ». Un `Math.max(0, …)` aurait affiché « 0 jours » indéfiniment. **La formule d'après-rentrée est une proposition à valider** | ✅ |
| ACC-8 | **Les trois niveaux dont les chapitres sont à venir** (1ʳᵉ ES, Tˡᵉ ES, Tˡᵉ spé) portent `.a-venir` **sur leur étiquette**, pas sur leur lien : les hubs sont ouverts et cliquables, ce sont leurs chapitres qui manquent | ✅ |
| ACC-9 | **Onglet « Auteur & vidéo » ouvert** : bande pleine largeur en pied de page pour l'activité d'auto-entreprise, trois entrées en cadre pointillé, toutes « en chantier ». Sans `🚧` : c'est une bande entière en attente, pas un lien manquant dans une liste | ✅ |
| ACC-10 | **Le bloc `<dl>` « Courriel / Établissement / ENT » disparaît** au profit d'une rubrique « Écrire » en colonne large — 38 caractères en monospace ne tiennent pas dans la colonne étroite. **Conséquence : l'espace classe ENT n'est plus annoncé sur l'accueil** ; sa case de suivi est requalifiée | ✅ |
| ACC-11 | **`style.css` n'est pas touché** (`git diff --stat` : `index.html` seul). Il sert de reliure à quatre autres hubs. Tout le CSS de l'accueil reste inline. Piège associé : `body` y porte `background-size: 32px 32px`, donc toute future règle qui poserait un `background-image` sur `body` sans réinitialiser `background-size` verrait sa trame repliée sur un carreau de 32 px, sans erreur visible | ✅ |
| ACC-12 | **Deux réglages ajoutés hors maquette** : sous 900 px la planche est bornée à 420 px (elle s'étirait sur toute la mesure, gravure perdue au milieu d'un cadre de 800 px) ; la planche garde `object-fit: contain` sur fond blanc, comme avant la refonte — une planche gravée est une figure, on ne la rogne pas | ✅ |

---

## Les cartes du hub 2nde PC se replient — 26/08/2026

Maquette `panneau-ouverture-continue.html` retenue par Loïc : le panneau qui
grandit. Quinze chapitres, une illustration chacun, tout replié au chargement.

| # | Décision | Statut |
|---|---|---|
| D1 | **Le panneau qui grandit** : bande d'image à gauche, chiffre blanc dedans, titre et décompte à droite | ✅ |
| D2 | **Ouverture continue en CSS pur, sans JavaScript** — `::details-content` + `interpolate-size:allow-keywords`. La dégradation naturelle sur navigateur ancien (ouverture instantanée, image et chiffre toujours animés) est acceptée : pas de script de repli | ✅ |
| D3 | **Aucun lien atteignable tant que la carte est repliée**, « Cours en ligne » compris. Vérifié au clavier : 45 tabulations, zéro lien de chapitre atteint | ✅ |
| D4 | **L'illustration se change en une ligne** : variable CSS `--img` posée en `style` sur `.cp-vis`, pas de balise `<img>`. Cadrage par `--cp-focus`, qui prend un couple horizontal **puis** vertical. Mode d'emploi en commentaire avant la première carte | ✅ |
| D5 | **Un décompte de ressources reste visible au repli** (`cours · 2 TP · 1 éval`), rédigé à la main pour chaque carte à partir des liens réellement présents. T3-C5 n'a pas de cours en ligne : il affiche `1 TP · 1 éval` | ✅ |
| D6 | **Bande à 88 px repliée / 186 px dépliée**, posées en variables CSS (`--cp-h-replie`, `--cp-h-deplie`) parce que ce sont des réglages. Rendu à quinze cartes : ni trop dense ni trop haut, valeurs conservées | ✅ |
| D7 | **La refonte ne concerne que le hub de 2nde PC.** Les sélecteurs `.chapitre*` de `style.css` sont laissés intacts — ils servent encore à `1re-es`, `term-es` et `term-spe`, rouvertes au navigateur pour le confirmer. Nouvelles classes `.chap-panneau` / `.cp-*`, CSS local à la page | ✅ |
| D8 | **Deux réglages responsive ajoutés hors maquette** : sous 860 px le décompte passe sous le titre (à 820 px il frôlait un titre sur deux lignes) ; sous 700 px les libellés de lien repassent en `display:inline`, la mention « pdf » restant sinon perchée en bout de première ligne | ✅ |

---

## Les outils PC s'ouvrent en entier — 26/08/2026

Demande de Loïc : « débloquer systématiquement toutes les étapes dans les outils
de seconde PC ». Le code disait l'inverse de la consigne — `CONSIGNES-outil-PC.md`
annonçait un outil « ouvert toute l'année », et les deux pages héritaient sans
le vouloir des deux verrous du moteur SNT.

| # | Décision | Statut |
|---|---|---|
| OUV-1 | **Un drapeau déclaratif, `data-etapes="ouvertes"` sur `<body>`**, plutôt qu'un test sur le préfixe `pc-o` du slug. Le moteur reste ignorant de la famille de la page : ce qu'il lit, c'est une intention écrite dans le HTML. Toute page qui le portera sera ouverte, outil ou non | ✅ |
| OUV-2 | **Les deux verrous tombent ensemble** : la révélation étape par étape (`initReveal`) et la cascade de séances (`refresh`). Ouvrir les étapes sans ouvrir la section 2 aurait laissé les exercices du soir derrière la méthode | ✅ |
| OUV-3 | **Le moteur SNT n'est pas dupliqué.** Trois gardes de deux lignes dans `sequence-snt.js` (dont `toutRevel`, sinon quitter le mode enseignant remasquait tout). Mesuré au navigateur : `t1` et `m1` inchangées — 19 et 7 étapes masquées, séances suivantes verrouillées, zéro erreur JS | ✅ |
| OUV-4 | **L'étape 1.1 de `o1` se coche au chargement.** Elle se validait « à la lecture », au signal de révélation de l'étape 1.2 — signal qui n'existe plus. Assumé : sur un outil la barre ne note personne, et une pastille qui ne se cocherait jamais serait pire. Le commentaire de la page a été réécrit en conséquence | ✅ |
| OUV-5 | `sequence-snt.js` passe en **`?v=42` dans les 6 pages** qui le chargent (o1, o2, m1, t0, t1, t2). Le CSS n'a pas bougé : il reste en `?v=41` | ✅ |

---

## Audit 2 de T3-C1 « Émission et perception d'un son » — 26/08/2026

Quatre points étaient remontés à l'arbitrage de Loïc dans
`A-LIRE-T3C1-AUDIT-2-2026-08-26.md`. **Trois se sont réglés à la mesure**, un
seul a demandé son arbitrage — et il portait sur autre chose que ce que l'audit
supposait.

| # | Décision | Statut |
|---|---|---|
| A2-1 | **Les liens TP et DS étaient déjà posés** (commit `9d0b352`, postérieur à l'audit) : TP5, TP6 et DS4. Les décisions 3 et 4 de l'audit tombent. Seul l'encart 🔧 « Lien du DS », devenu faux, est retiré — le chapitre n'a plus aucun `.a-faire` | ✅ |
| A2-2 | **Un mot surligné ne se coupe jamais.** `hyphens:auto` sur les `<p>` justifiés césurait `célérité` **à l'intérieur du fond teal** dès 1150 px de fenêtre. `.terme` passe en `hyphens:none` dans le socle : le texte courant garde sa césure, les mots à fond coloré restent entiers | ✅ |
| A2-3 | **Le contenu de `.eq` est enveloppé dans `.eq-corps`.** `.eq` est un conteneur flex : chaque `<sub>` en était un flex item, perdait son `vertical-align` et remontait à mi-hauteur du caractère indicé. C'était le vrai « souci de la formule ». **7 blocs formule dans 5 chapitres** étaient touchés ; les 19 blocs du dépôt et le gabarit portent désormais le span | ✅ |
| A2-4 | **`.methode li` ne peut pas être un conteneur grid.** Même piège : chaque fragment inline d'une étape devenait une cellule, et l'étape partait en escalier (« Repérer un / motif qui se répète. / élémentaire »). Le numéro romain passe en position absolue dans une gouttière : rendu identique, contenu inline préservé | ✅ |
| A2-5 | **La vidéo de la cloche à vide n'est pas en cause.** L'« erreur 153 » venait de `referrerpolicy="no-referrer"` sur l'iframe créée au clic : privé de referrer, YouTube refuse l'intégration. Remplacé par `strict-origin-when-cross-origin`, qui ne transmet que le **domaine** du site, jamais l'URL de la page ni le chapitre consulté. La façade reste étanche : **0 requête tierce avant le clic**, mesuré | ✅ |
| A2-6 | **Le gras marque le mot à retenir, jamais l'emphase orale.** 12 gras d'insistance retirés de T3-C1 (64 → 50). Règle à porter dans `CONSIGNES-chapitre-PC.md` | ✅ |
| A2-7 | **La méthode passe en deux colonnes**, avec une figure d'étapes SVG produite pour elle : 4 vignettes, signal **composé** (fondamentale + 2 harmoniques déphasées), T = 4,0 ms sur 4 motifs — voisin de l'exercice 1 sans le copier | ✅ |

### Suite du même jour — lots C, D, E et points laissés ouverts

| # | Décision | Statut |
|---|---|---|
| A2-8 | **La figure d'étapes passe en 2 × 2.** Empilée, elle faisait 603 px contre 214 px pour le texte : 389 px de blanc. En deux rangées, l'écart tombe à 33 px et les quatre étapes tiennent chacune sur une ligne sèche (mesuré : il faut 353 px de colonne, elle en a 367). Les sous-titres des vignettes, qui redisaient le texte de gauche, sont supprimés | ✅ |
| A2-9 | **Un code couleur commun à toutes les figures de signal**, fixé sur la figure 4 : `U_max` en rouge Hα, `U_min` en violet Hγ, l'amplitude — grandeur dérivée — en vert, le repérage en or, la courbe en encre. L'élève retrouve en partie 4 les couleurs vues en partie 1 | ✅ |
| A2-10 | **Les 6 figures du lot 4 sont refaites en SVG inline** : 233 Ko de JPEG/PNG crénelés remplacés par 65 Ko de SVG nets à toute échelle — **la page s'allège de 168 Ko**. Inline et non appelées comme fichiers image : un SVG chargé en image vit dans un contexte isolé où les `@font-face` du site sont absentes, les étiquettes seraient tombées en police système | ✅ |
| A2-11 | **Les figures 13 (diapason + son pur) fusionnent** : le diapason est redessiné et la sinusoïde recréée. `.fig-duo`, qui n'existait que pour ce couple, est retirée | ✅ |
| A2-12 | **Deux icônes d'exercice** (orage, baleine), décoratives, `aria-hidden`, flottées à droite de l'énoncé | ✅ |
| A2-13 | **Lot D — le texte respire** : la répétition d'ouverture de la partie 1 devient une mise en route ; **8 transitions** posées entre parties et sections, dans une classe `.passage` créée pour elles (filet fin + italique, distincte de `.aparte`) ; **4 encarts `.histoire`**, un par partie — le hertz, la cloche à vide de Boyle et Hooke, le la 440, le décibel des Bell Labs. ⏳ **Fond à valider** | ⏳ |
| A2-14 | **Lot E — la fiche vierge se télécharge depuis le cours, en permanence.** Classe `.hors-verrou` : seule exception du dépôt à `body.verrouille`, qui masquait tout l'article. Motif : la fiche doit rester accessible à l'élève absent, malade ou en avance — le verrou protège le **cours**, pas le support que l'élève remplira. Posé sur les **2 chapitres dont la fiche existe** (`t1c2`, `t1c4`), en commentaire prêt à décommenter dans le gabarit. Règle inscrite dans `CONSIGNES-chapitre-PC.md` §6 | ✅ |
| A2-15 | **L'encart 🔧 « Lien du DS » est retiré partout où le lien est posé** : T2-C1, T3-C3, T3-C4, en plus de T3-C1. T3-C3 et T3-C4 n'ont plus aucun `.a-faire`, leur CSS mort est retiré. T2-C2, T2-C3 et T3-C2 n'ont pas de lien DS : l'encart y garde son sens | ✅ |

| A2-16 | **Les 5 graphes d'exercice passent aussi en SVG** (énoncés 1 et 3, leurs deux corrections annotées, le rappel de l'exercice 2). Ils n'étaient pas dans la liste du lot 4, mais ce sont les **seules figures dont un énoncé dépend** — sans elles, il n'y a rien à mesurer — et le brief de la fiche élève les suppose vectorielles. Le motif de l'exercice 1 est un **son composé reconstruit** : série de Fourier à 3 harmoniques ajustée par moindres carrés sur des points relevés sur la courbe d'origine (écart max **0,019 V**), donc même allure, même période, mêmes extrema, mais un tracé qui nous appartient | ✅ |
| A2-17 | **Les figures disent exactement ce que disent les corrigés**, contrôlé à la génération : ex. 1 — pics à 0,30 / 2,93 / 5,57 / 8,20 ms, soit 3T = 7,9 ms entre `t_i` et `t_f` ; ex. 3 — maxima à 6 / 29,25 / 52,5 / 75,75 / 99 ms, soit **4T = 93 ms** de maximum à maximum, `f` = 43,0 Hz, `U_max` = 4 V et `U_min` = 0 V atteints au volt près. Aucun corrigé n'a eu à bouger | ✅ |

**Bilan du passage au vectoriel** : **12 images remplacées, 614 Ko** de JPEG et de
PNG contre 76 Ko de HTML en plus — **538 Ko économisés au chargement**, et des
figures nettes à toute échelle. Il ne reste que 8 photos et schémas de source,
ceux que l'audit a explicitement laissés (sismogramme, ECG, guitare, vague,
compressions, frise, champ auditif, acuité).

**Piège relevé au passage** : un commentaire CSS contenant une balise image
d'exemple a fait passer `verifier.mjs` de 18 à 19 problèmes — il lit les
attributs de source **jusque dans les commentaires**. Ne pas écrire de balise
image d'exemple dans une page.

Reste ouvert : l'alignement du bloc formule de 3-C (Loïc a tranché que le
problème était l'indice, pas le centrage — le centrage n'a donc pas été touché)
et, surtout, **la fiche de T3-C1 elle-même**, qui n'existe pas : le chapitre ne
peut donc pas porter le bouton du lot E. Elle relève du jalon 6, verrouillé par
la validation explicite du cours (jalon 5), que Loïc n'a pas donnée.

---

## V1 intégrale des chapitres PC — 25/08/2026

Dictée par Loïc : **voir d'abord son cours entier sur le web**, et seulement
ensuite décider quoi changer. L'ébauche texte-only, qui laissait un `.a-faire` à
la place de chaque image, ne le permet pas.

| # | Décision | Statut |
|---|---|---|
| V1-1 | **Le régime A « ébauche rapide » est remplacé** par la V1 intégrale. Consignes : `_modeles/CONSIGNES-V1-integrale-PC.md` | ✅ |
| V1-2 | **Aucun `.a-faire` ne peut être posé au motif qu'un contenu est une image.** Seule exception qui subsiste : le lien de DS | ✅ |
| V1-3 | **Les schémas de la source sont posés tels quels**, suffixés `-source`, en attendant leur SVG à la charte. Un cours complet avec une image moche vaut mieux qu'un cours troué | ✅ |
| V1-4 | **Les images sans licence identifiable sont reprises quand même.** Crédit quand la source est connue, `data-origine` sinon, inventaire dans le relevé du chapitre. *Note versée au dossier, comme en `T0-8` : le critère qui compte est le caractère **public** du site, pas l'usage non commercial — à rouvrir si le site s'ouvre à d'autres établissements* | ✅ |
| V1-5 | **Les erreurs de physique évidentes sont corrigées sans demander**, mais jamais en silence : commentaire `<!-- SOURCE → CORRIGÉ … -->` à l'endroit exact + ligne dans le relevé, pour que Loïc vérifie | ✅ |
| V1-6 | **Un relevé par chapitre** : `_suivi/tXcY-releve.md`. Cinq sections imposées, dont « remarques pédagogiques » où Claude signale sans corriger | ✅ |
| V1-7 | **Le jalon 1 change de définition** (`chapitres.md`) : « ébauche en ligne » → « V1 intégrale en ligne ». Les 14 chapitres PC repassent en `🔄` | ✅ |
| V1-8 | **La fiche élève reste le dernier jalon.** Aucune fiche ne se fait avant que le cours soit figé | ✅ |

Premier chapitre traité : **T3-C1 « Émission et perception d'un son »**, en V1
intégrale depuis le 25/08/2026 — 28 figures posées, un seul `.a-faire` (le lien de
DS), quatre retouches de fond à valider dans `_suivi/t3c1-releve.md`.

---

## Refonte de `t0` « Les systèmes informatisés » — 23/08/2026

Séquence d'introduction refondue de bout en bout : elle enseigne les mécanismes
du cours, et c'était la seule à ne pas les avoir. **Rien n'est validé** — tout le
contenu pédagogique ci-dessous est une proposition.

### Arbitrages dictés par Loïc avant la refonte

| # | Décision | Statut |
|---|---|---|
| T0-1 | **Préfixe de code : `SYS-*`**, dans la logique de `NET-*` / `WEB-*` / `REP-*` | ✅ |
| T0-2 | **Trois séances**, plus l'activité débranchée | ✅ |
| T0-3 | L'activité débranchée « autopsie d'une tour » **reste en chantier** : pas de poste disponible. Sans `data-gate`, elle ne bloque rien | ✅ |
| T0-4 | **Le dépôt sur le classeur OneDrive s'enseigne hors du cours en ligne.** `t0` le suppose acquis ; ce qu'elle enseigne, c'est la **génération** de la fiche | ✅ |
| T0-5 | **Supprimer « cette page ne garde rien en mémoire »** : fausse dès le portage, et mauvais motif donné au rituel de la fiche | ✅ |
| T0-6 | **Les élèves relèvent les ports en photo** sur les postes de la salle, via le dépôt de copie d'écran | ✅ |
| T0-7 | **Les quatre photos de Loïc sont publiables** et présentées comme **sa propre machine** — ressort pédagogique assumé | ✅ |
| T0-8 | **Captures macOS / ChromeOS conservées** : usage pédagogique non commercial. *Note versée au dossier : le critère juridique n'est pas la commercialité mais le caractère **public** du site — à revoir si le site s'ouvre à d'autres établissements* | ✅ |
| T0-9 | Le tableau anglophone « Computer Ports Identification » est **écarté** (aucune licence identifiable) et **remplacé par un jeu de connecteurs en SVG** | ✅ |

### Décisions prises pendant la refonte

| Sujet | Décision | Statut |
|---|---|---|
| **Le fork est supprimé, pas réparé** | 272 lignes de `<style>` et 229 de `<script>` retirées ; `sequence-snt.css/js` branchés. Les 44 couleurs en dur hors `:root` disparaissent du vérificateur | ✅ |
| **Simulation de correction** | Le `setTimeout` de 2,4 s qui jouait la pré-correction est **mort**. Les rédigés partent en base par `data-focus-code` | ✅ |
| **Mode enseignant** | L'interrupteur nu (cliquable sans code) devient la `.ens-zone` à **code SHA-256** et **minuterie de 30 min**, comme sur `t1` | ✅ |
| **Trois marqueurs de la checklist du brief conservés** | `data-check-cloze`, `data-check-diagram` et `data-share` **ne sont pas des vestiges du fork** : ce sont des composants vivants du moteur, employés 8, 3 et 10 fois dans `t1`. Seuls `data-qcm` et `data-free` ont disparu | ✅ |
| **`data-cle`** | Les 12 clés existantes sont **conservées à l'identique** sur les étapes correspondantes. `t0-systeme-exploitation` est **retirée et non recyclée** : l'OS devient le sixième critère de l'étape 3.5, il n'a plus d'étape à lui | ⏳ à confirmer |
| **Codes de champ** | `SYS-Q1` à `SYS-Q6` (QCM) · `SYS-R1`, `SYS-R2`, `SYS-R-ports` (rédigés) · `SYS-G-ssd` (glossaire) · `SYS-D1`, `SYS-D2` (dépôts) · `SYS-P1`, `SYS-P2` (perso, non notés) | ⏳ à valider |
| **Les deux rédigés des « pour aller plus loin »** | Pas de `data-focus-code` : la réponse reste locale, aucune copie n'entre dans la file de correction, aucune grille à écrire. Même repli que l'enquête box de `t1` 4.3 | ⏳ à confirmer |
| **Quatre grilles de pré-correction** | `SYS-R1`, `SYS-R2`, `SYS-R-ports`, `SYS-G-ssd`, à deux étages, marquées `_statut`, **sans clause d'exclusion**. Le niveau d'exigence attend Loïc | ⏳ à valider |
| **Le tri glisser-déposer entre dans `t0`** | Le brief prévoyait « doc + QCM + glossaire » en 2.5 ; le QCM y est remplacé par un **tri chronologique des supports de stockage**. Motif : c'est le seul endroit naturel de la séquence pour que l'élève manipule ce composant, et `t0` doit lui avoir fait pratiquer **tous** les dispositifs de l'année | ⏳ à valider |
| **Recherche en ligne en 2.4** | Question **laissée ouverte** : elle suppose un poste par élève. Le repli est écrit dans la page — les quatre cartes y sont en photo, l'élève en nomme une — et signalé par un `<aside class="chantier decision">` | 📌 en attente |
| **Le « à retenir » masqué** | Le moteur l'ouvre **tout seul** dès que l'exercice est fait ; le bouton ne sert que de compteur verrouillé. Les textes de 1.1 et 2.3 ont été réécrits en conséquence — ils décrivaient un bouton à cliquer, qui n'existe plus depuis la décision du 25/07 | ✅ |
| **`carte-reseau.js` non chargé** | `t0` n'affiche pas la carte de séances en tête de page, comme `t2` et `m1`. Seule `t1` la charge. À décider si on la généralise | 📌 en attente |
| **`?v=` du moteur** | `sequence-snt.css/js` **restent en `?v=39`** : ces fichiers ne sont pas modifiés, incrémenter forcerait un rechargement inutile chez tous les élèves. `seances-snt.js` passe en revanche de `?v=14` à **`?v=15`** sur les 6 pages : il est régénéré (`t0` passe de 3 à 4 séances) | ✅ |

### Ce qui reste ouvert

| Sujet | Enjeu |
|---|---|
| ⏳ **Tout le contenu pédagogique des trois séances** | Proposition V1 dans le ton de Loïc, à relire. En particulier les 31 questions de QCM et les deux réponses rédigées corrigées |
| ⏳ **Cinq images manquantes** | Trois systèmes « qui n'en ont pas l'air » (borne de bus, caisse automatique, lave-linge) — c'est l'accroche de la séance 1 —, une montre connectée, une baie de serveurs. Cadres réservés dans la page |
| ⏳ **Trois images utiles mais non bloquantes** | Une carte mère ≥ 900 px, un SSD M.2 seul, un touchpad en gros plan |
| ⏳ **Sort de l'activité débranchée** | L'exercice de légende n'a plus besoin d'un poste physique : l'étape 3.3 le fait en ligne sur deux photos réelles. La débranchée garde-t-elle une raison d'être, ou fusionne-t-elle avec 3.3 ? |

## Audit 2 de `t0` « Les systèmes informatisés » — 24/08/2026

Deuxième passe sur la séquence d'introduction, brief dicté après test en classe
sur la page livrée le 23/08. La numérotation reprend à **T0-10** : `T0-4` à
`T0-9` sont prises par les arbitrages du 23/08 et ne changent pas de sens.

| # | Décision | Statut |
|---|---|---|
| T0-10 | **La page donne des consignes, pas des justifications pédagogiques.** Le « pourquoi » du dispositif se dit à l'oral, quand le professeur sent une réticence. Écrit, il allonge, il infantilise et il donne prise à la contestation | ✅ |
| T0-11 | **Le gras redevient rare** : réservé au terme technique à sa première apparition et aux valeurs à retenir (230 V, x16, 2,54 cm). Jamais sur un verbe de consigne, une négation ou un membre de phrase. Six termes au maximum dans un « à retenir », aucun dans la colonne de droite d'un tableau | ✅ |
| T0-12 | **L'entraide est reportée après la rentrée.** Le mécanisme est conçu mais non déployé : toutes ses mentions sortent des pages élèves (1.1, 3.4, 3.6). L'étape 3.6 est réduite au mode enseignant et au glossaire, et **perd son `data-gate`** | ✅ |
| T0-13 | **La barre de fiche est masquée** tant que la dernière étape **à valider** de la séance n'est pas dévoilée. Jamais conditionnée à la validation : l'élève qui n'a pas fini à la sonnerie doit pouvoir déposer sa trace | ✅ |
| T0-14 | **L'étape « Autopsie d'une vraie machine » (2.6) est remplacée** par un QCM de bilan de 15 questions, dont six avec photo. La photo de l'intérieur de la machine y sert de question | ✅ |
| T0-15 | **L'inspecteur d'éléments est annoncé comme PC uniquement.** Safari sur iPad n'en a pas ; la voie officielle d'Apple passe par un Mac relié en USB. Aucun contournement (application tierce, marque-page JavaScript) n'est développé | ✅ |
| T0-16 | **Le cours s'aligne sur le vocabulaire de la vidéo de 2.2** — matériel/logiciel, bus, BIOS, puce graphique intégrée — puisque c'est la première formulation que les élèves reçoivent. `SDRAM` n'est **pas** repris : il n'apparaît que dans la vidéo bonus de 49 min, hors programme | ✅ |
| T0-17 | **Les élèves disposent d'un accès à la recherche web** (tablette ou salle informatique). Les exercices de recherche en ligne n'ont plus de version de repli — la question laissée ouverte le 23/08 est tranchée | ✅ |
| T0-18 | **Aucune requête réseau ne part avant un clic de l'élève.** Mesuré au navigateur : une `<iframe>` YouTube, même en `nocookie` et même dans une étape masquée, contacte `fonts.gstatic.com`, `google.com` et `googleapis.com` **dès l'ouverture de la page**. Les vidéos passent donc derrière une affiche locale (`data-src` + `initVideos`), sur les quatre pages du moteur | ✅ |

### Ce que la fiche de séance embarque désormais

| Sujet | Décision | Statut |
|---|---|---|
| **Images dans la fiche** | Une fiche embarque **toutes les figures des étapes à valider** de la séance, avec leur légende, deux par ligne à l'impression. Motif : l'évaluation demande de **reconnaître** des objets, une fiche uniquement textuelle n'y prépare pas. Exclus : les figures des blocs « pour aller plus loin » et les surcouches d'annotation SVG, décoratives | ✅ |
| **Pastille « rendu, pas encore relu »** | Le test `is-done` passait avant `attente-corr` : l'étape s'affichait verte pleine dans la barre de progression alors qu'elle est creuse et pointillée dans le fil. Des deux repères, le plus visible mentait. Corrigé ; l'étape continue de compter dans la progression | ✅ |
| **Légende des pastilles** | Elle annonçait 4 états pour 6 réellement produits, sur **deux familles** de pastilles. Réécrite en deux tableaux, avec les pastilles **dessinées aux vraies couleurs du moteur** plutôt qu'en emojis — l'emoji ne ressemble pas à ce que l'élève a sous les yeux, c'était la source de la confusion | ✅ |

### Ce qui reste ouvert

| Sujet | Enjeu |
|---|---|
| ⏳ **Tout le contenu pédagogique reste à valider** | Y compris les 15 questions du QCM de bilan et les trois questions ajoutées à `SYS-Q1` |
| ⏳ **Captures de l'interface pour l'étape 1.1** | Lot suspendu : les fichiers transmis le 24/08 étaient des documents personnels sans rapport avec le site (recette, documents de garde d'enfant). Emplacement réservé par un commentaire HTML. À reprendre depuis un compte élève en fonctionnement |
| 📌 **Licence des images issues du PDF du collègue** | 37 images de `t0` viennent du document « 01 — Les systèmes informatisés (AD) — élèves » et ne portent ni source ni licence, sur un site public. Décision à prendre : accord de l'auteur, ou remplacement par des équivalents CC |
| 📌 **Cadrage de la caisse automatique** | Des clients de supermarché sont visibles sur la photo (Wikimedia, CC BY 2.0). Recadrage possible si la projection en classe gêne |

## `t0` — troisième passe, 25/08/2026

Retours de Loïc après ouverture de la page, captures à l'appui.

| # | Décision | Statut |
|---|---|---|
| T0-19 | **L'activité débranchée devient la séance 4.** Elle entre dans la cascade de déverrouillage (elle s'ouvre quand la séance 3 est validée), porte sa propre barre de fiche et ses deux étapes à valider. Elle ferme la séquence, donc elle ne verrouille rien après elle — elle peut dépendre du matériel sans bloquer personne | ✅ |
| T0-20 | **Dix fiches d'élément** en 4.2 : pour chacune une photo, un nom, et ce que l'élément fait en trois mots. **Trois fiches remplies suffisent à valider** ; les sept autres rapportent des points. Le nom et la description partent en base au fil de la frappe et reviennent à la visite suivante ; **la photo, elle, reste dans la page** tant que la remontée vers le tableau de bord n'est pas écrite | ✅ |
| T0-21 | **Un exercice d'étiquettes à poser sur la photo** de la vieille tour, en 3.3 : dix emplacements marqués, dix noms à placer. Il vient **en plus** de l'exercice à menus, qui reste — reconnaître un nom dans une liste et trouver l'objet sur une image ne sont pas le même travail. Le geste est en **deux temps** (toucher l'étiquette, toucher l'endroit) et non un glisser natif, qui ne fonctionne pas au doigt sur iPad | ✅ |
| T0-22 | **La carte du thème est chargée sur `t0`.** La question était ouverte depuis le 23/08 ; elle est tranchée par un défaut : sans `carte-reseau.js`, le lien « ⌂ Sommaire » de la barre du haut **ne faisait rien du tout** | ✅ |
| T0-23 | **Trois captures de l'interface entrent dans l'étape 1.1** (lot A7, levé) : le plan du thème, le fil d'une séance avec ses cinq états, la barre de progression. Elles sont **produites depuis la page rendue**, états simulés — donc refaisables à l'identique quand l'interface changera | ✅ |

### Trois défauts trouvés en cherchant autre chose

| Sujet | Ce qui n'allait pas | Statut |
|---|---|---|
| **Les dépôts de photo ne validaient rien** | `initDepot` appelait `verdict()` et `markDone()`, définis dans un autre bloc du fichier : chaque dépôt levait « verdict is not defined ». L'aperçu de la photo s'affichait, mais l'élève n'avait **aucune confirmation** et l'étape **n'était jamais validée**. Les trois dépôts de `t0` étaient touchés depuis leur écriture | ✅ corrigé |
| **Le « pour aller plus loin » de la séance 2 était coupé** | Le CSS ouvrait le bloc jusqu'à 1600 px ; à 768 px de large — un iPad en portrait — il en fait 1747, et la vidéo de fin disparaissait. La hauteur est désormais mesurée, puis libérée après l'animation | ✅ corrigé |
| **Un bloc déplié hors de l'écran** | Sur un bloc situé en bas de page, tout se dépliait sous le bord de la fenêtre : rien ne bougeait à l'écran et le clic paraissait sans effet. Le bloc est maintenant ramené dans la vue | ✅ corrigé |

### Ce qui reste ouvert

| Sujet | Enjeu |
|---|---|
| 📌 **Les photos vers le tableau de bord** | Demandé le 25/08, **non fait — chantier séparé par décision de Loïc**. Aujourd'hui une photo déposée ne quitte jamais le navigateur : il faut une migration (bucket de stockage, table, RLS), l'envoi côté élève et l'affichage côté professeur. Ce sont des **photos prises en classe** : une durée de conservation doit être décidée avant d'écrire la moindre ligne |
| ⏳ **Coordonnées des dix zones de 3.3** | Repérées à l'œil sur la photo puis contrôlées en dessinant les cadres sur l'image source — les dix tombent juste. À revoir si la photo est reprise |
| ⏳ **Le barème du défi** | Toujours la version minimale du 24/08. Les dix fiches lui donnent maintenant une assiette naturelle : 1 point par fiche nommée, 1 de plus si ce qu'elle fait est juste |

## Clôture de `t1` « Internet » — 23/08/2026

Audit dicté par Loïc, page ouverte, les 26 étapes descendues une à une. **Le thème
est validé sur le fond et n'a plus aucun contenu à écrire.** Il sera *clos* quand
Loïc aura fait son dernier passage de vérification sur les fiches.

| Date | Décision | Statut |
|---|---|---|
| 23/08/2026 | **L'inégalité de volume entre séances est assumée.** Les séances de `t1` vont de 6 à 67 champs ; ce n'est pas un défaut d'équilibrage et il ne faut pas le « corriger ». Motif : la séance affichée n'est qu'une partie de l'heure. D'autres activités se mènent en SNT à côté, et une séance légère laisse la place à de la révision ou à un changement de rythme — l'alternance lourd / léger est un **outil de gestion de classe**, pas un accident. Conséquence : le nombre de champs n'est un critère d'audit ni sur `t1` ni ailleurs. Ce qui reste un critère : la **charge de correction pour l'enseignant**, qui n'est pas la même grandeur (la séance 4 porte 14 réponses rédigées par élève — plusieurs centaines de copies sur trois groupes). | ✅ |
| 23/08/2026 | **La passerelle NSI facultative est abandonnée pour le moment.** Le premier temps de l'audit la plaçait dans le bonus 6.6 pour ne pas l'emporter avec Filius. Vérification faite le même jour : ni « ports » ni « masque de sous-réseau » n'existaient dans `t1` — c'était donc **du contenu à écrire**, pas un déplacement. Loïc tranche : **on ne l'écrit pas maintenant**, elle part dans `IDEES.md`. Conséquence directe : `t1` n'a **plus aucun contenu manquant**, et la passerelle NSI ne conditionne plus sa clôture. Le bonus 6.6 reste en l'état — IPv6 et hexadécimal, hors 100 %. | ✅ |
| 23/08/2026 | **L'étape 5.5 `t1-bonus-protocoles` est supprimée.** Motif : « le pour aller plus loin de 5.5 n'est pas très intéressant ». Trois conséquences appliquées : la grille `NET-R5` retirée de `criteres-snt.json` (avec `NET-R-ville` et `NET-R4b`, orphelines de plus longue date), **aucune renumérotation** des clés voisines — les `data-cle` sont sémantiques, pas positionnelles, et c'est le bénéfice direct du travail du 22/08 —, et **le dénominateur des 100 % ne bouge pas** : un bonus n'a pas de `data-gate`, et un QCM posé dans un bonus est explicitement exclu de la validation. `t1` passe de 26 à **25 étapes**. | ✅ |
| 23/08/2026 | **Les 51 leurres de QCM de `t1` sont validés**, ainsi que les trois questions ajoutées à `NET-Q7`, les deux indices de niveau 2 réécrits et les textes proposés des étapes 4.2 et 4.3. C'était le dernier morceau de relecture de contenu en attente sur ce thème ; les attentes correspondantes du 20 et du 22/08 sont levées. Le chantier « biais de forme » reste ouvert **sur les autres séquences**, `t2` en tête. | ✅ |
| 23/08/2026 | **Le volume du thème n'est pas réduit, et la séance 4 n'est pas allégée.** Les 7 podcasts et les 4 vidéos restent ; les quatre `<iframe>` gardent leur chargement actuel (pas de façade « clic pour charger ») ; les pistes A/B/C/D du plan d'allègement de 4.2 sont **écartées** et ne doivent pas être rouvertes. Mot pour mot : « elle dure longtemps, elle a toujours duré longtemps, ce n'est pas dramatique. » Remplace l'attente du 22/08 sur 4.2. | ✅ |
| 23/08/2026 | **`NET-Q8` garde ses 18 questions** — on ne scinde pas, on juge au premier passage en classe. | ✅ |
| 23/08/2026 | **Les échafaudages quittent la page élève de `t1`** : le bloc « État de la séquence — non close », les blocs jaunes de tête, la note de fin de page et les `<aside class="chantier">` dont la question est tranchée. Conformément à la règle du référentiel vivant, **rien n'est supprimé sans être d'abord écrit ici**. ⏳ Comme pour `m1`, ce retrait **ne vaut pas clôture** : le jalon reste ouvert jusqu'à la vérification des fiches. | ✅ |
| 23/08/2026 | **Un dépôt de captures d'écran entre en 6.4** (`NET-D6` pour les `ping`, `NET-D7` pour les `tracert`), sur le mécanisme déjà en service à l'étape 4.2. Motif : une fenêtre de commandes se referme et il n'en reste rien. Les images restent **en mémoire du poste** — data URL dans le DOM, jamais en base. Elles doivent **remonter dans la fiche de révision** : entrée à ajouter à la partie adaptative du générateur, consignée dans le brief `m1` §II-C, **pas encore codée**. | ✅ |
| 23/08/2026 | **Une porte d'intuition s'ouvre sur le partage, plus sur la frappe.** En 4.3, le document « les 5 façons d'arriver chez toi » apparaissait dès la première lettre écrite, avant le clic sur « Partager avec la classe ». C'est l'**acte** qui ouvre, pas la saisie. Correction faite dans le moteur (`bqMaj`) : elle vaut pour toute porte future. Une porte sans bouton de partage garde l'ancienne règle, sinon elle ne s'ouvrirait jamais. | ✅ |
| 23/08/2026 | **Un « pour aller plus loin » s'appelle par son propre en-tête.** Le sommaire et les lignes repliées lisaient `.fl`/`.pl`/`.bl` sans regarder la profondeur : ils attrapaient le bandeau d'une perso-box **nichée dans le bonus**, et l'étape 3.3 s'annonçait « À faire chez toi » — un dispositif qui n'a jamais existé. Le `.bonus-head` passe désormais en premier. Corrige aussi l'étape 4.5, qui s'annonçait « Mes notes de visionnage ». | ✅ |
| 23/08/2026 | **Un clic sur une étape « à venir » conduit au bouton « Étape suivante ».** La condition d'ouverture ne bouge pas — une étape à venir ne s'ouvre toujours pas d'un clic sur sa ligne fantôme — mais le clic cesse d'être muet : la page défile jusqu'au bouton et le souligne 1,6 s. Motif : un geste sans réponse se lit comme une panne. | ✅ |
| 23/08/2026 | **Ce que portaient les neuf notes de chantier retirées de la page, et qui doit survivre.** ① La vidéo du poste 5.2 s'ouvre sur **≈ 45 s de publicité NordVPN** (« changer son IP publique », « contourner les géoblocages ») : **à annoncer en classe**, et réutilisable telle quelle à l'étape 6.1. ② La vidéo du bloc `NET-Q8` (6.3) **ne dit rien du cache DNS** : elle laisse croire que toute la chaîne est reparcourue à chaque clic — à corriger à l'oral. ③ Au moment de valider `t2` « Le Web », vérifier qu'il **ne garde qu'un rappel d'une ligne sur le DNS** (CONSIGNES §14.1 : un seul traitement complet par notion). ④ La note de l'étape 4.3 annonçait « Filius part en fin de thème avec la passerelle NSI » : **devenu faux** le 23/08 — motif de retrait supplémentaire. Le reste des notes était de l'historique de refonte, déjà consigné plus bas dans ce registre. | ✅ |
| 23/08/2026 | **La carte de progression passe à deux rangées dès 6 nœuds** (au lieu de 7), les libellés longs sont **coupés en deux lignes**, et la boîte gagne 30 px de marge de chaque côté et 20 px de haut. Motif : sur une ligne, six disques laissent 85 px entre voisins pour des libellés de 170 — le nom de la séance 6 de `t1` recouvrait le disque de la séance 5 et sortait du cadre de 46 px. Le défaut était **mécanique** : il revenait dès qu'un nom dépassait une vingtaine de caractères. Loïc a autorisé le composant à prendre plus de place. Les dispositions à 2, 3, 4 et 5 nœuds restent au pixel près celles d'avant. Vérifié au navigateur : **plus un seul chevauchement** sur les neuf cartes du hub ni sur celle de `t1`. | ✅ |

---

## Audit du module `m1` et dette de suivi — 23/08/2026

| Date | Décision | Statut |
|---|---|---|
| 23/08/2026 | **Le bloc de chantier et les huit badges « à valider » quittent `m1`.** Ils étaient visibles des élèves ; Loïc en a demandé le retrait une fois l'audit appliqué. Ce qui ne bouge pas : les huit `data-gate` (le badge n'était que leur habillage, le verrouillage progressif est intact), le badge « ouverture » de l'étape 2.3 — statut pédagogique, pas état de chantier — et la règle `.chantier` de `sequence-snt.css`, employée par huit autres pages. ⏳ **Ce retrait ne vaut pas validation** : le jalon `VALIDÉ` de `chapitres.md` reste ouvert, et le contenu pédagogique reste une proposition tant que Loïc ne l'a pas dit. | ✅ |
| 23/08/2026 | **Le livret CFA entre dans la carte du projet.** Il n'apparaissait ni dans `CLAUDE.md` ni dans `MANIFESTE.md` — quatrième famille de contenu, 17 outils, deux codes de classe, branchée sur les comptes depuis le 19/08, et invisible. C'est ce qui a rendu illisible qu'une modification de `progression.js` faite pour le SNT touche 19 de ses fichiers. | ✅ |
| 23/08/2026 | **Les trois assets partagés sont nommés, avec leur portée.** `progression.js` (SNT + CFA + hub, **24 fichiers**), `sequence-snt.js`/`.css` (4 fichiers, contrôlé par `verifier.mjs`), `chapitre-commun.css` (les 14 chapitres PC). Règle : **toute livraison qui touche un asset partagé annonce les parties qu'elle déborde** — le `?v=` seul ne suffit pas, il faut le dire. | ✅ |
| 23/08/2026 | **Le repère de `node verifier.mjs` est 18, et non plus « 2 ».** L'`id="ri"` dupliqué de `cahier/diag-j03-formation-image.html` est corrigé — le marqueur SVG du corrigé « siJuste » s'appelle désormais `ri-juste`. Restent **18 liens** `cfa/outil-*` → `fiches/cfa/fiche-outil-NN.html` : un seul motif, les fiches à imprimer attendent la validation des versions en ligne. **Tout autre écart est une régression.** | ✅ |
| 23/08/2026 | ~~**Les deux grilles orphelines sont conservées, pas supprimées.**~~ Remplacée le même jour par la décision de clôture de `t1` : `NET-R-ville` et `NET-R4b` sont **supprimées**, avec `NET-R5`. Motif du revirement : conserver une grille sans question, fût-elle marquée, c'est garder du faux dans un fichier de référence — exactement ce que ce registre existe pour éviter. L'esprit de correction reste consultable ici et dans l'historique Git. | ~~remplacée~~ |
| 23/08/2026 | **`m1` se fait intégralement en classe.** Rien à la maison : Loïc doit être présent pendant que les élèves sortent une feuille et posent le tableau des poids à la main. Conséquence : la phrase du bloc de chantier « le temps dépendra de ce qui est donné à faire à la maison » est fausse, et la durée « ≈ 2 h » sera remplacée par le découpage réel après minutage. | ✅ |
| 23/08/2026 | **La photo des transistors reste dans le document**, après le paragraphe qui les nomme. La proposition de la déplacer après la question 3 du QCM est écartée. | ✅ |
| 23/08/2026 | **La formulation « 1,12 million de km » est validée telle quelle** (bonus loi de Moore). Calcul revérifié : 28 × 10⁹ × 4 cm = 1,12 × 10⁹ m, soit 2,9 fois la distance Terre-Lune. | ✅ |
| 23/08/2026 | **Le bilan de l'étape 2.4 reste à 12 questions.** Aucune retirée. Seules trois formulations changent (Q3, Q9, Q11-Q12), pour éviter la répétition mot pour mot avec l'étape 2.1 — le recouvrement de fond, lui, est assumé : un bilan repasse sur l'acquis. | ✅ |
| 23/08/2026 | **La réponse attendue sur la taille des transistors est 22 nm**, celle que cite la vidéo Veritasium (« a 22 nanometer node »). Le « 52 » vient vraisemblablement des ~50 atomes de silicium entre source et drain mentionnés juste après : il devient un **leurre explicité dans le corrigé**, jamais une bonne réponse. Même principe pour l'ordre de grandeur du nombre de transistors : la réponse attendue est celle de la vidéo (**environ un milliard**, quad-core de 2013), l'écart avec aujourd'hui (~200 milliards ; le Blackwell B200 en compte 208) étant traité **en commentaire** — c'est précisément l'exercice sur la loi de Moore. | ✅ |
| 23/08/2026 | **Deux attributs ajoutés au moteur partagé, et deux seulement** : `data-essais-avant-correction` (seuil de révélation d'une correction, par exercice) et `data-valide-sur-interaction` (une étape sans exercice se valide à la première manipulation réelle). Valeur par défaut = **comportement actuel strictement inchangé** : aucune des huit séquences ne bouge. | ✅ |
| 23/08/2026 | **La validation par sous-partie et la position des indices ne sont PAS un chantier moteur.** `bqReste()` compte déjà bloc par bloc, et `.indices-pied` est créé en pied de **chaque** `.cloze` : découper l'étape 1.5 en trois `.field` (A, B, C) suffit à obtenir une validation par groupe **et** des indices au niveau du bloc. `.indices-pied` n'est pas touché — la variante « étiquette compacte » utilisée ailleurs reste intacte. | ✅ |
| 23/08/2026 | **Le `$` d'un remplacement JavaScript est mangé par `String.replace()`.** Trois `$('…')` sont arrivés dans le moteur en `$('…')` — qui rend UN élément et n'a pas de `.forEach` : TypeError à chaque clic sur « Vérifier ». Règle : pour patcher un fichier, **`split()/join()`, jamais `replace()`** — il réinterprète `$`, `| 23/08/2026 | **La limite des composants manipulables de `m1` est 1 à 4095**`, `$1`. | ✅ |
| 23/08/2026 | **Ne jamais déclarer un `var` du nom d'une fonction du fichier.** `var seuil = …` a masqué `function seuil(mot)` dans toute la portée du gestionnaire de clic (hoisting) : la correction tolérante à l'orthographe plantait avant d'être atteinte. Renommé `seuilEssais`. | ✅ |
| 23/08/2026 | **L'étape 1.5 est découpée en trois `.field` (A, B, C).** Chacun son bouton, sa correction détaillée, ses indices. L'étape n'est validée que lorsque les trois groupes ET le classement sont faits — `bqReste()` comptait déjà bloc par bloc, le moteur n'a pas bougé. | ✅ |
| 23/08/2026 | **Le tri de 1.5 passe de 6 à 11 écritures**, et les deux règles de comparaison deviennent un **indice qu'on demande** (bouton local) au lieu d'être révélées dès le premier « Vérifier », juste ou faux. `data-tri-indices="1"` retient la révélation automatique jusqu'à un ordre entièrement juste. ⚠ Le tri se valide au 6ᵉ essai : avec 11 items, à éprouver devant des élèves. | ✅ |
| 23/08/2026 | **Le tableau des combinaisons de 1.4 se complète au lieu de se lire.** Les lignes 1 à 4 bits restent données (validées le 22/08) ; 5, 6, 7, 8 bits et le **cas général n** sont à produire — n en listes déroulantes, « 2ⁿ » ne se tape pas au clavier. | ✅ |
| 23/08/2026 | **L'écart de 2.2 se calcule avec la formule générale** `|v₁ − v₂| ÷ v₂ × 100`, et c'est l'élève qui décide qui est la valeur de référence. Le calcul déjà appliqué ne laissait qu'une saisie de calculatrice. Les deux indices deviennent progressifs : le premier désigne v₂, le second pose le calcul. | ✅ |
| 23/08/2026 | **L'ordre des quatre questions d'ordre de grandeur de 2.1 est cassé** (photo → caractère → film → SMS). Elles montaient d'un cran à chaque fois : l'élève suivait la progression au lieu de raisonner. | ✅ |
| 23/08/2026 | **Le bonus de 1.1 devient une vidéo + un QCM.** Veritasium avec le Pr Andrea Morello, servie en `youtube-nocookie`, sous-titres signalés, repères temporels donnés. `REP-R1` n'est plus « cherche la loi de Moore » mais **un résumé de la vidéo**, et reçoit enfin une grille — ⏳ **V1, niveau d'exigence à arbitrer**. | ✅ |
| 23/08/2026 | **La fiche de révision est refaite.** En-tête lu dans la page (jamais « Séquence Internet », jamais « S1 »), bandeau de complétion à trois compteurs, partie fixe en `<template data-fiche-fixe>` par séance, partie adaptative avec les corrections. **Sortent** : les bonnes réponses des QCM (elles en feraient un corrigé) et « Sources des documents ». Détail : `CONSIGNES-sequence-SNT.md` §17. | ✅ |
| 23/08/2026 | **Un seul comptage de progression dans tout le dispositif** : `resume()`, exposé sur `EtatSNT`. La page l'écrit en base, le tableau de bord le relit, la fiche l'affiche. Interdiction d'en écrire un second à côté — ils divergeraient, et c'est l'élève qui verrait l'écart. | ✅ |
| 23/08/2026 | **Le tableau des poids vierge de la maquette de fiche est abandonné.** La fiche n'est jamais imprimée : elle est déposée sur OneDrive. Un cadre à remplir au crayon n'y a plus d'objet. ⏳ **À confirmer** si Loïc le voulait comme modèle à recopier sur le cahier. | ✅ |
| 23/08/2026 | **`correction_ia` n'est plus rapatriée en entier** dans le navigateur de l'élève : `progression.js` ne demande que verdict, message et « pour aller plus loin ». ⚠ **Hygiène, pas verrou** — la policy laisse l'élève lire SA ligne en entier s'il forge la requête. Le durcissement base est écrit et **non exécuté** dans `bdd/schema/015`, avec trois voies à trancher. | ✅ |
| 23/08/2026 | **La limite des composants manipulables de `m1` est 1 à 4095** (12 bits), et elle est locale à la page — les trois outils sont en JS inline, pas dans le moteur. Elle était appliquée par un `focus()` muet : l'élève croyait à un bug. Elle doit être **affichée à côté du champ** et produire un message explicite au dépassement. La limite elle-même n'est pas relevée. | ✅ |

---

## Audit de `t1` — séance 1, relue étape par étape — 22/08/2026

| Date | Décision | Statut |
|---|---|---|
| 22/08/2026 | **La séance 1 de `t1` est coupée en deux.** Sept étapes pour une heure, c'était trop, d'autant que les élèves qui terminent partent sur France IOI. S1 garde la définition et les origines (1.1→1.3) ; la nouvelle S2 « D'ARPANET à Internet » prend ARPANET, Pouzin, le réseau mondial et la frise. Le thème passe de 5 à **6 séances** | ✅ |
| 22/08/2026 | **Les `data-cle` se posent avant tout renumérotage**, jamais après : une fois les clés sémantiques en place, déplacer une étape n'a plus d'effet sur la progression enregistrée. Dans l'autre ordre on casse deux fois. Remplace la décision en attente du 25/07 | ✅ |
| 22/08/2026 | **Convention de clé `t1-<slug>`, sans numéro de séance.** Divergence assumée avec `m1` (`rep-s1-…`) : `t1` est la page qu'on renumérote, une clé contenant « s1 » y deviendrait mensongère au premier déplacement. Les clés de `m1` ne sont **pas** renommées — les renommer orphelinerait ses données de test pour rien | ✅ |
| 22/08/2026 | **Seuil minimum de rédaction : 20 caractères partout.** « Les élèves doivent avoir la possibilité d'envoyer peu de choses. » Les `data-focus-max`, eux, ne bougent pas : leur dispersion protège le budget de jetons du worker de pré-correction | ✅ |
| 22/08/2026 | **Les infobulles passent en `position:fixed`, placées en JS.** Le diagnostic de départ — « elles débordent du bord de la page » — était faux : ce sont les `overflow:hidden` de `.card`, `.retain`, `.france-box`, `.poste` et `.glosmot` qui coupaient. Ils portent l'arrondi de ces blocs et restent | ✅ |
| 22/08/2026 | **L'étiquette de champ perd son `float:right`** et prend sa propre ligne. Les libellés à rallonge se réduisent à leur tête, le détail passant dans une bulle tactile | ✅ |
| 22/08/2026 | **La frise se valide au 6ᵉ essai**, plus au 3ᵉ, et « voir la correction » la valide aussi — elle ne le faisait pas. À la validation, toutes les dates sortent en bout de ligne | ✅ |
| 22/08/2026 | **Un corrigé ne doit jamais donner la réponse d'une question ultérieure.** Trois cas trouvés dans `t1` (deux en 1.4, un en 1.6) : c'était le **corrigé**, pas l'énoncé, qui fuitait. Défaut de conception à surveiller ailleurs dans le projet | ✅ |
| 22/08/2026 | **La question 4 de l'étape 1.4 réécrite** (« Un réseau sans centre a aussi un prix. Lequel ? »). Elle recouvrait la question 8 ; elle porte désormais la contrepartie et ouvre un pont vers le routage. **Relue et validée par Loïc le 22/08** | ✅ |
| 22/08/2026 | **Les douze `<li>` de la frise ont désormais leur date.** Le brief croyait qu'il n'en manquait qu'une (la CNIL) ; il en manquait quatre. Loïc a validé les trois autres : **1977** (trois réseaux reliés — la démonstration SATNET/PRNET/ARPANET du 22 novembre), **1979** (Usenet), **1986** (NSFNET). Elles sont en `data-niveau="3"` : le compte-gouttes s'arrête au niveau 2, donc elles n'apparaissent qu'à la validation et le verdict « neuf dates sur douze, les trois restantes se déduisent » reste exact | ✅ |

## Audit de `t1` — séances 3 et 4, relues étape par étape — 22/08/2026

| Date | Décision | Statut |
|---|---|---|
| 22/08/2026 | ✅ **`bdd/schema/014-reponses-personnelles.sql` a été exécuté par Loïc.** Le statut `partage` est désormais accepté par `reponses_libres_statut_check` et par les policies `reponses_envoyer` / `reponses_reecrire` ; `archive_version_reponse()` ne rebascule plus un partage en `en_attente` quand l'élève rectifie son texte. Le bouton « Partager avec la classe » écrit donc réellement en base — `progression.js` posait déjà `statut: 'partage'`, le code n'a jamais eu besoin d'être touché | ✅ |
| 22/08/2026 | **L'enquête box dit désormais, en toutes lettres, qu'elle est facultative.** Trois phrases dans le corps du texte : non évaluée, elle réclame le **mot de passe administrateur** que seul un adulte du foyer peut donner, et un refus des parents est une réponse acceptable. Le bloc reste **sans `data-perso-code`** : l'IP publique d'un logement et la consommation d'un foyer sont des données personnelles de **tout le foyer**, pas seulement de l'élève. C'est l'exception, elle est voulue | ✅ |
| 22/08/2026 | **`display:grid` sur un `<label>` éclate son énoncé.** En grille, chaque enfant direct devient une cellule : « Si le `<b>`fil partagé`</b>` est coupé… » se répartissait sur trois cases. Seules les questions **sans balise** dans leur énoncé s'affichaient correctement — d'où un défaut invisible à la relecture du code et flagrant à l'écran. `.label-selects label` repasse en `display:block`, le menu prend toute la largeur en dessous. Règle : **ne jamais mettre en grille un conteneur dont le contenu est une phrase** | ✅ |
| 22/08/2026 | **Un tableau de saisie qui dépasse son cadre défile, il ne se fait pas rogner.** `.card{overflow:hidden}` faisait disparaître deux à quatre champs du tableau de Lannion sous 520 px — l'élève ne pouvait pas remplir ce qu'il ne voyait pas, et rien ne le signalait. Conteneur `.table-scroll` + `input.short{width:100%}`. Mesuré : 8 champs sur 8 atteignables à 390 et 500 px | ✅ |
| 22/08/2026 | **Le maillé remonte, Internet sort de la liste.** Le maillé était présenté juste avant la question sur Internet, dont la réponse venait donc d'être lue — et un item liait carrément « maillé » à « Internet à l'échelle mondiale ». Le maillé passe en 2ᵉ position, l'item fautif disparaît, et Internet obtient un bloc à part : ce n'est pas une quatrième topologie, c'est un **assemblage** de topologies | ✅ |
| 22/08/2026 | **Le réseau en bus s'illustre par la guirlande électrique**, plus par le câble coaxial — qui ne parle plus à personne. Le coaxial reste dans l'encart d'histoire, à sa place : celle d'un fait daté | ✅ |
| 22/08/2026 | **Un débriefing ne s'affiche pas avant qu'on ait cherché.** Le texte sur l'ordre de grandeur (« tu as peut-être trouvé entre tant et tant ») était sous la question : il donnait la réponse. Il passe en révélation conditionnelle — après un clic sur Vérifier, et seulement à **±25 %** de la valeur de référence. Mécanisme déclaratif et générique : `data-ordre` / `data-ordre-tol` sur le trou, `.reveal` existant pour l'affichage | ✅ |
| 22/08/2026 | **La question 1 de l'étape 4.3 ne part plus en correction.** Ce que l'élève lit sur la carte dépend d'où il habite : il n'y a rien à corriger. `data-focus-code` retiré. L'en-tête de l'étape dit maintenant **ce qui part chez le professeur et ce qui reste sur le poste** — l'élève doit le savoir sans avoir à le deviner | ✅ |
| 22/08/2026 | **On regarde une vidéo de la même façon partout.** Le bonus de la séance 4 annonçait un « poste de visionnage » mais offrait un champ en mode focus envoyé en correction. Il utilise désormais le composant `.poste` comme les trois autres vidéos : notes libres, gardées, affichées pendant le questionnaire | ✅ |
| 22/08/2026 | **Les notes de chantier réglées quittent les pages.** Trois `aside.chantier` retirés (4.1 exemple du bus, 4.2 trois points, 4.3 numérotation) plus le bandeau « Fraîcheur » de 4.4. Ce qui restait ouvert est parti dans `IDEES.md` et `ETAT-PROJET.md` : **la documentation vit dans le suivi, pas en marqueur inline** | ✅ |
| 22/08/2026 | 🔴 **Dans `bqMaj`, ne jamais écrire une classe sans vérifier qu'elle change.** Un `MutationObserver` surveille `class` dans `.steps` et rappelle `bqMaj`. Or `classList.remove()` réécrit l'attribut **même quand le jeton est absent** : mutation → `bqMaj` → mutation → l'onglet meurt. `classList.toggle(t,false)`, lui, court-circuite — c'est pourquoi le code d'origine convergeait. Trouvé au navigateur en ajoutant l'animation de la porte d'intuition | ✅ |

## Audit de `t1` — séances 5 et 6, relues étape par étape — 22/08/2026

| Date | Décision | Statut |
|---|---|---|
| 22/08/2026 | **La numérotation des étapes hors 100 % reste telle quelle.** Ce n'est ni un bug ni une troncature : la page applique deux conventions sans exception. Étape **verrouillable** (`data-gate`, comptée dans les 100 %) → `<div class="step-kicker">ÉTAPE X.Y</div>` ; étape **hors 100 %** (réponse personnelle, bonus, fierté française) → pastille `<span class="ix">X.Y</span>`. Les **9 blocs** concernés : 2.2, 3.1, 3.2, 3.3, 4.3, 4.5, 5.5, 6.5, 6.6. Loïc a examiné les trois options et garde la distinction : la pastille porte l'information « ceci n'entre pas dans ta progression ». 🔴 **Consignée ici pour qu'un audit futur ne la corrige pas par erreur.** | ✅ |
| 22/08/2026 | **`normaliser()` ne vide plus une réponse d'un mot vide.** La liste des articles retirés contient `d` (pour l'élision « d' ») : `normaliser("D")` rendait `""`, le vérificateur lisait une case non remplie et le `.filter(Boolean)` supprimait la réponse attendue elle-même. **Trois** réponses du dépôt étaient concernées, pas deux : `D` en 5.4 de `t1`, `une` dans la trilatération de `t5`, et `D` dans le graphe de `t3` — cette dernière non repérée par l'audit. Les mots vides ne partent désormais que s'il reste quelque chose après. Corrige aussi un **faux positif** symétrique sur les trous en menu déroulant, où « de » valait « D ». | ✅ |
| 22/08/2026 | **La pastille d'évaluabilité des postes de visionnage passe en ligne, dans leur intitulé.** « Poste de visionnage » et « Poste d'écoute » ne matchaient aucun motif de la branche 1 de `initEvaluabilite()` : le bloc retombait en branche 2 et récoltait un `niv-coin` qui pendait en bas à droite. Motif ancré `^poste` ajouté. Correction **dans le moteur**, donc valable pour tous les postes de toutes les séquences. Inventaire avant/après sur l'état calculé : **4 pastilles migrées, aucune autre différence**. | ✅ |
| 22/08/2026 | **Le relevé d'adresses et le rappel de mémoire ont leur moteur** (§12 de `sequence-snt.js`). Le relevé se valide sur le **format** — quatre nombres de 0 à 255 — jamais sur le contenu : deux élèves peuvent légitimement relever deux adresses différentes pour le même site. Une fois validé il passe en lecture seule et part en base sous la clé stable `…/releve-dns`. Le rappel **n'est plus dans le flux** : il s'ouvre en fenêtre sur fond flouté qui masque le relevé, et compare champ à champ. L'élève sans relevé n'est pas bloqué : on accepte, on garde, et on le renvoie au temps 1. Le chantier « Lot 2 » de la page est retiré. | ✅ |
| 22/08/2026 | **`clozeChamps()` voit désormais les champs sans réponse attendue** (`data-releve-champ`, `data-rappel-champ`). C'était leur nature même — on y recopie ce qu'un outil affiche — et ils étaient invisibles pour la persistance : le relevé d'un élève disparaissait au rechargement. **`clozeCle()`** honore par ailleurs un `data-cle` porté par le bloc, au lieu de sa position : une clé positionnelle aurait changé au premier bloc inséré avant lui. | ✅ |
| 22/08/2026 | **L'Inria sort du relevé de l'étape 6.3** : `inria.fr` ne répond plus à l'outil `mon-ip.com`. On passe à **deux** sites — l'université de Poitiers et l'AFNIC, gestionnaire du `.fr` — et on n'en cherche pas un troisième. Neuf mentions de « trois » corrigées dans l'étape, y compris le corrigé du QCM `NET-Q8`. | ✅ |
| 22/08/2026 | **Le prérequis « binaire » de la séance 6 remonte en bandeau de séance**, avec un lien vers le module `m1`. Il vivait en `doc-note` **à l'intérieur** de l'étape 6.1 : l'élève ne le découvrait qu'une fois entré. Nouvelle classe `.prereq-banner` — reprendre `.lock-banner` tel quel ne marchait pas, il est en `display:none` hors `.seance.locked` et le prérequis aurait donc disparu au moment précis où l'élève entre dans la séance. | ✅ |
| 22/08/2026 | **« Manipule d'abord » (6.4) cesse d'être un `.res-item.activity`.** C'est le style réservé aux **liens à ouvrir** : rien n'y était cliquable, et l'orange des ressources laissait croire qu'il manquait un lien. Nouveau composant `.manip` — teinte d'encre, liste numérotée, couleurs prises dans les variables `:root`. Cinq cibles de `ping` choisies chacune pour montrer une chose, et deux `tracert` à comparer (Google et Tokyo, au lieu de Google et Qwant). | ✅ |
| 22/08/2026 | **Qwant reste au programme comme échec instructif.** Un site qui ne répond pas au `ping` n'est pas en panne : il **refuse** de répondre. C'est une notion, pas un raté — et le texte de l'étape le dit maintenant explicitement, pour que l'élève ne croie pas à une panne de sa machine. ⚠️ **Reste à départager sur une machine de la salle** si c'est Qwant qui ne répond pas à l'ICMP, ou le réseau du lycée qui bloque l'ICMP sortant — dans ce second cas, rien ne pingue et l'étape entière tombe. Aucun code ne répare cela. | ✅ |
| 22/08/2026 | **Les « à retenir » ne précèdent plus les questions auxquelles ils répondent.** Deux cas traités : en 5.2 le bloc bilan est descendu **après les trois glossaires** (il ne s'ouvre que lorsque tous les blocs de réponse de l'étape sont remplis, glossaires compris — l'élève lisait un bouton verrouillé, descendait, puis devait remonter) ; en 6.4 le `.retain` placé **avant** le texte à trous et la question rédigée devient un bilan à révéler, en fin d'étape. Conséquence mécanique à connaître : `bqReste()` comptera **quatre** blocs en 6.4 au lieu de deux — le bilan s'ouvrira plus tard, et l'étape devient longue. | ✅ |
| 22/08/2026 | **Le bouton « Partager avec la classe » de l'étape 5.1 est supprimé.** Le partage y est automatique, la bulle du champ le dit déjà, et le bouton laissait croire qu'il restait une action à faire. Vérification menée sur les **19 boutons de partage du dépôt** : c'était le **seul** sans `.perso` parent, donc le seul qui levait une `TypeError` au clic. Les 18 autres sont opérationnels. | ✅ |
| 22/08/2026 | **Le schéma d'encapsulation (5.2) garde son clic-clic ; seul son libellé est corrigé.** Il annonçait « glisser les mots » alors que la consigne dit, correctement, « clique un mot, puis une case ». Le glisser-déposer est **abandonné** : trois cases font 26 px de large (`writing-mode:vertical-rl`), sous la cible tactile de 44 px du projet, et le clic-clic gère naturellement qu'un même mot remplisse plusieurs cases. | ✅ |
| 22/08/2026 | **Le flou du mode focus respecte `prefers-reduced-motion`.** Il ne le faisait pas : seules les transitions étaient coupées. Le flou est désormais retiré et remplacé par un fond plus dense — qui a demandé moins d'animation n'a pas demandé moins de contraste. Même traitement que la modale du sommaire. Bénéficie aussi aux réponses rédigées existantes. | ✅ |

---

## Module transversal `snt-m1` « Représenter l'information » — 21/08/2026

| Date | Décision | Statut |
|---|---|---|
| 21/08/2026 | **Le binaire devient une séquence autonome**, pas une annexe de `t1`. Filius, lui, devient une séance du thème 1 — hors du périmètre de ce module | ✅ |
| 21/08/2026 | Titre **« Représenter l'information »** et non « Le binaire » : on pourra y raccorder d'autres ateliers (texte, son, image) sans refonte ni renommage | ✅ |
| 21/08/2026 | **Préfixe `m` et non `t`** (`snt-m1`) : ce n'est pas un thème du programme SNT. Conséquence technique réelle — le dépôt énumère les huit thèmes dans **quatre** listes en dur, toutes élargies (voir plus bas) | ✅ |
| 21/08/2026 | **Aucun verrouillage inter-séquences.** C'est la progression annuelle de Loïc qui garantit que le binaire précède l'étape 5.1 de `t1`, pas le site. Aucune dépendance codée entre les pages | ✅ |
| 21/08/2026 | Le socle traite les conversions **dans les deux sens** — « historiquement dans l'équipe ». Décimal→binaire **et** binaire→décimal en séance 1, avec **deux méthodes** présentées côte à côte (soustraction descendante · divisions successives en potence), aucune imposée | ✅ |
| 21/08/2026 | **Deux séances**, chacune se terminant par son atelier. 9 étapes au total | ✅ |
| 21/08/2026 | **Le RVB reste traité en entier dans `t7`.** Ici, simple ouverture de quelques minutes (« 256 niveaux par canal »), marquée `○ support` et **sans `data-gate`**. La répétition est **voulue** : la règle « un seul traitement complet par notion » (`CONSIGNES-sequence-SNT.md` §14.1) **ne doit pas être invoquée contre ce choix** — c'est consigné ici pour ça | ✅ |
| 21/08/2026 | Le **masque de sous-réseau** n'entre pas dans ce module : il ira en bonus repliable dans la future séance Filius de `t1`. **Ne pas l'étiqueter « pont NSI »** — vérification faite sur les annexes du BO, il est absent du programme de SNT, de NSI première **et** de NSI terminale. C'est une note de compréhension | ✅ |
| 21/08/2026 | **Pas d'estimation horaire figée.** « ≈ 2 h » est indicatif et signalé comme provisoire dans la note de chantier de la page : le module n'a jamais tourné devant une classe, et le temps dépendra du travail donné à la maison | ✅ |
| 21/08/2026 | **Ateliers à liste fixe, identique pour tous les élèves** : aucun tirage, aucune graine, aucun score chiffré, aucune note. Motif : permettre l'entraide et rendre les résultats comparables. L'évaluation se fait sur un autre support, hors du site. La version « entraînement illimité » est reportée dans `IDEES.md` | ✅ |
| 21/08/2026 | Code d'activité **`REP·x`** à l'affichage, **`REP-x`** en base (§14.3 : le point médian est fragile hors du texte). `REP·Q1` à `REP·Q3`, `REP·A1`, `REP·A2` | ⛔ remplacée le 22/08 |
| 21/08/2026 | **`data-cle` explicites sur les 9 étapes** du module (`rep-s1-deux-chiffres`…). Le moteur les lit déjà en priorité sur le repli positionnel (`sequence-snt.js`, fonction `cle()`) : **aucune modification du moteur, aucun effet sur les autres pages**, et aucune donnée élève n'existait encore sur cette page. Ne préjuge pas de la migration des 27 étapes de `t1`, qui reste le chantier ouvert du 25/07 | ✅ |
| 21/08/2026 | Une **famille « Outils transversaux »** au hub, après « Pour commencer », plutôt que de ranger le module dans « Données et information » : le mélanger aux sept thèmes brouillerait la lecture de la progression. Chip correspondante en tête du masthead de la page | ✅ |
| 21/08/2026 | **Étape 2.3 sans `data-gate`.** Une étape à valider sans champ à remplir ne se valide jamais et bloquerait la fin de séance. L'ouverture RVB étant « support, non évaluée », elle n'est pas une porte : 8 étapes verrouillantes sur 9 | ✅ |
| 21/08/2026 | **Réponses binaires à saisir sans espace.** Le groupement par 4 demandé au cadrage n'est **pas** accepté : mesure faite en rejouant le comparateur du moteur sur toutes les chaînes binaires jusqu'à 12 bits — ajouter la variante espacée ferait passer **289 saisies fausses pour justes** sur 6 items (`1111111` accepté pour `11111110`), et « 16 000 » ferait accepter **160000**. Consigne explicite dans les deux ateliers à la place. Cause et correctif : voir le chantier `seuil()` ci-dessous | ✅ |
| 21/08/2026 | **L'atelier 1 compte 13 items, pas 12.** L'item « laquelle ne tient pas dans un octet ? » a **deux** réponses justes (`100000000` et `1111111111`) : il est dédoublé en « la plus courte » / « la plus longue », ce qui lève l'ambiguïté sans tolérance dangereuse | ⛔ remplacée le 22/08 |

### Module `m1` — décisions de l'audit du 22/08/2026

| Date | Décision | Statut |
|---|---|---|
| 22/08/2026 | **Périmètre de conversion asymétrique.** Binaire → décimal ne dépasse **jamais 8 bits** dans un exercice, un QCM ou une évaluation. Décimal → binaire peut monter au-delà (jusqu'à ~3000) : la méthode des divisions ne coûte rien de plus sur un grand nombre. 🔴 **C'est une contrainte de conception, pas un contenu affiché** — aucune phrase méta sur le périmètre ne figure dans la page élève | ✅ |
| 22/08/2026 | **La notation de la base en indice** (`1011₂`, `77₁₀`) est introduite une fois en 1.1 et employée **systématiquement** ensuite. Argument retenu pour l'introduire : le même dessin `1011` vaut onze en base 2 et mille onze en base 10 | ✅ |
| 22/08/2026 | **Le pont mathématique passe par les puissances**, pas par le doublement. « À chaque rang on double » devient « chaque rang vaut une puissance de 2 » ; la première formulation peut rester en second rideau | ✅ |
| 22/08/2026 | Les codes d'activité **ne s'affichent plus** (remplace la décision du 21/08). Ils restent dans l'attribut `data-code`, réservé à la base : vérification faite, **aucun code du dépôt ne le lit aujourd'hui**, mais le renommer coûterait les réponses enregistrées le jour où il servira. Aucun autre module SNT n'affichait de code : le travers était propre à `m1` | ✅ |
| 22/08/2026 | Plus d'intitulé **« Atelier »** : ce sont des exercices, présentés comme tels. L'atelier 2 devient un **bilan de fin de module**, QCM unique de 12 questions couvrant les neuf étapes (volume à valider) | ⏳ à valider |
| 22/08/2026 | **L'étape 1.5 n'a plus de « à retenir »** : c'est de l'entraînement pur, elle n'introduit aucune notion neuve | ✅ |
| 22/08/2026 | **Le « à retenir » attend le clic sur « Vérifier »** — décision de moteur, elle **vaut pour toutes les séquences**. Elle remplace la règle du 22/07 (« la révélation se fait dès la dernière réponse ») : remplir n'est pas se corriger, et le bilan donne les réponses | ✅ |
| 22/08/2026 | **Chaque méthode de conversion a son outil pas à pas**, et les deux démarrent sur **77** : même nombre, deux chemins, même résultat. 77 sort en revanche des exercices — il est intégralement traité au-dessus | ✅ |
| 22/08/2026 | **Les combinaisons sont écrites, pas annoncées** : les 30 combinaisons de 1 à 4 bits figurent en clair, et seul le **bit ajouté** est coloré, pour que le doublement se lise au lieu de se dire | ✅ |
| 22/08/2026 | **La loi de Moore va en bonus non évalué**, derrière une **question de recherche** : la figure et sa légende ne se révèlent qu'**après** la réponse de l'élève. Le graphique s'arrêtant en 2020, une ligne datée le prolonge (M4, Blackwell) et dit explicitement où il s'arrête | ✅ |
| 22/08/2026 | **Les préfixes k, M, G, T sont présentés comme ceux de la physique-chimie**, pas comme des unités d'informatique. Pont explicite et voulu : Loïc enseigne les deux matières | ✅ |
| 22/08/2026 | **Images auto-hébergées** dans `assets/img/snt/2nde-snt-m1-representer-information/` (et non `assets/img/rep-info/` comme le proposait l'audit) : c'est la convention du dépôt, une famille par slug de page. Servies en `<picture>` webp + repli, `loading="lazy"`, dimensions déclarées | ✅ |

### Chantiers ouverts découverts en écrivant ce module

| Date posée | Sujet | Enjeu |
|---|---|---|
| 21/08/2026 | ⏳ **`seuil()` rend tolérante toute réponse contenant un espace** (`assets/js/sequence-snt.js`) | Le test `/^[0-9]+$/` ne reconnaît pas « 40 000 » comme un nombre : l'attente bascule alors sur une tolérance Levenshtein de 1 ou 2. **`t1` porte déjà 5 variantes dans ce cas**, dont « 40 000 », qui accepte aujourd'hui `40 001` comme juste. Correctif d'une ligne — `/^[0-9 ]+$/` — mais il touche le **moteur partagé** : il impose de passer `?v=32` à `?v=33` sur le CSS et le JS des neuf pages **et** du hub, plus un test de non-régression sur tous les trous du dépôt. **Décision de Loïc du 21/08 : signaler, ne rien toucher dans cette livraison.** |
| 21/08/2026 | ⏳ **Le titre de la fiche élève colle le numéro au titre** — « S1Compter comme une machine », « S1C'est quoi Internet ? » | Le moteur concatène le texte de `.s-num` et celui du `<h2>` sans séparateur (`seanceTitle`). Défaut partagé par toutes les séquences, visible sur chaque fiche téléchargée. Correctif dans le moteur, donc même contrainte de versionnage que ci-dessus. |
| 21/08/2026 | ⏳ **`CONSIGNES-sequence-SNT.md` §3 décrit un trajet d'étape périmé** | Il place le « à retenir » **avant** le champ à compléter. Les décisions du 25/07 et du 26/07 l'ont descendu **après** l'activité, en révélation automatique — c'est ce que fait le moteur et ce que font `t1`, `t2` et `m1`. La consigne dit encore l'inverse. |

---

## Séance 2 de `t1`, réponses personnelles et QCM — 20/08/2026

| Date | Décision | Statut |
|---|---|---|
| 20/08/2026 | 🔴 **Une séance sans `data-gate` traverse le dispositif sans laisser de trace.** `seanceComplete()` rend `true` quand une séance n'a aucune porte : la séance 2 de `t1` s'auto-validait, ouvrait la séance 3 en même temps qu'elle, affichait 0 % à vie et remontait « en retard » dans la grille du professeur — alors que l'élève avait tout fait. À vérifier sur **chaque** séance au moment de la valider : une séance sans porte est un trou, pas un raccourci | ✅ |
| 20/08/2026 | 🔴 **Le bouton « Partager avec la classe » n'enregistrait rien.** Il passait le textarea en lecture seule et affichait « ✅ Merci — ta réponse nourrit la discussion de classe » — sans écrire ni en base, ni dans l'état. L'enquête auprès des grands-parents, un devoir fait à la maison, disparaissait au rechargement. Le mot affiché est désormais adossé à un envoi réel, et distingue l'invité sans compte (rien à enregistrer, c'est normal) de la panne (on rend la main pour réessayer) | ✅ |
| 20/08/2026 | **Les réponses personnelles vont en base au statut `partage`**, dans la même table que les copies (`bdd/schema/014`). Motif : pour l'élève comme pour le professeur c'est un texte écrit, rangé au même endroit ; ce qui les sépare est leur destin — l'une est corrigée, l'autre est lue et discutée. Un statut le dit à un seul endroit ; une seconde table aurait dupliqué la RLS, l'archivage des versions, la fiche élève et la purge de fin d'année | ✅ |
| 20/08/2026 | 🔴 **Le déclencheur d'archivage devait cesser de tout ramener à `en_attente`.** Il le faisait dès que le texte changeait : une réponse personnelle rectifiée aurait basculé **toute seule** dans la file de correction et sous le worker IA, sans erreur ni message. Un partage reste un partage ; tout le reste repart à zéro comme avant | ✅ |
| 20/08/2026 | **L'enquête maison (`t1` s2 bonus) et « les appareils de ta box » (`t1` 5.5) restent LOCALES**, sans `data-perso-code`. Elles demandent l'inventaire des appareils d'un logement : une donnée qui concerne tout le foyer, pas seulement l'élève. Prolonge la décision du 26/07. Ne pas leur ajouter de code « par cohérence » — l'exception est le sujet | ✅ |
| 20/08/2026 | **Les deux étapes de la séance 2 deviennent des portes** (enquête + débat), validées à l'envoi comme tout le reste (§15.7). Un élève empêché de faire l'enquête à la maison est débloqué par le mode enseignant — c'est le cas d'usage pour lequel il existe | ✅ |
| 20/08/2026 | **Biais de longueur des QCM : on étoffe les leurres**, on ne raccourcit pas la bonne réponse. Les distracteurs sont portés à sa longueur et rendus plus plausibles ; le QCM devient plus discriminant. Appliqué aux 20 questions signalées de `t1`, qui n'en porte plus aucune. `t2` (20 cas marqués) reste à traiter | ✅ |
| 20/08/2026 | **La position de la bonne réponse se répartit par permutation, jamais par réécriture.** Elle sortait 41 fois sur 99 en 2ᵉ position dans `t1` : un élève qui le remarque coche « la deuxième » et marque des points sans rien savoir. 19 permutations plus tard : 25 · 22 · 26 · 24 · 2. Sont exclues les listes dont l'ordre porte du sens (années croissantes, 8/32/64/256, échelle « 12 heures / 12 jours / 12 semaines ») | ✅ |
| 20/08/2026 | **La numérotation des étapes suit la séance.** `t1` affichait « ÉTAPE 2.1 » dans la séance 3 : les pastilles étaient restées sur l'ancienne série, décalée d'une séance depuis l'insertion de « Internet et moi ». Le reste de la page — notes de chantier, renvois « détaillé à l'étape 4.3 », `ETAT-PROJET` — utilisait déjà la numérotation par séance : ce sont les pastilles qui mentaient | ✅ |
| 20/08/2026 | 🔴 **Les deux générateurs ne s'exécutaient pas du tout sous Windows.** Le garde comparait `import.meta.url` à un gabarit `file://` + `process.argv[1]`, soit `file://C:\...` face à `file:///C:/...` : `node generer-questions.mjs` se terminait **sans rien faire et sans rien dire**, sur la machine même où on le lance. Corrigé avec `pathToFileURL`. À retenir pour tout futur script à double usage (exécuté / importé) | ✅ |
| 20/08/2026 | **Le sommaire fixe couvrait le fil d'Ariane au chargement**, sur toute largeur ≥ 1180 px : `#prog4` est un frère de `.wrap`, il partait du bord gauche pendant que le contenu se décalait. Il reçoit le même décalage. Le défaut ne durait que le premier écran — donc la toute première image vue par l'élève | ✅ |

---

## Architecture & dispositif

| Date | Décision | Statut |
|---|---|---|
| 20/08/2026 | 🔴 **Un envoi en lot vers PostgREST exige des objets à clés identiques.** Le tableau de bord construisait les lignes de `seances_faites` à géométrie variable — `faite_le` seulement sur les séances déjà en base, les trois textes seulement sur la séance du jour. Cocher une séance ancienne et la séance du jour ensemble suffisait à tout faire échouer sur `PGRST102 « All object keys must match »`, sans qu'aucune ligne ne parte. Les lignes portent désormais **les mêmes sept clés**, valeurs vides à `null` et `faite_le` explicite. Une seule écriture du dépôt envoie plusieurs objets d'un coup ; les huit autres passent un objet unique et ne peuvent pas rencontrer ce cas | ✅ |
| 20/08/2026 | 🔴 **Le message du bandeau de verrouillage se désigne par élimination, jamais par sa position.** `verrou-snt.js` visait `span:last-child` ; or `compteurSeances()` ajoute *après coup* un `<span class="compte">5 étapes</span>` qui devient le dernier enfant. Le mot du plafond partait donc dans le compteur — chasse fixe, `white-space:nowrap`, texte débordant du cadre — et `data-mot-origine` recollait « 5 étapes » à la place du message de mérite au dégel. Le message est repéré comme l'enfant direct qui n'est ni `.k` ni `.compte`, puis marqué `.mot` | ✅ |
| 20/08/2026 | 🔴 **Cadenas et sablier : c'est l'ordre d'écriture qui tranche.** Une séance fermée par le plafond est presque toujours AUSSI fermée par le mérite : elle cumule `.locked` et `.plafonne`, à spécificité égale. Le `⏳` était écrit **avant** le `🔒` et ne s'affichait donc jamais. Règle : le sablier après le cadenas ; le `🔓` du mode enseignant garde une spécificité supérieure et reste le dernier mot | ✅ |
| 20/08/2026 | 🔴 **Une page qui charge `verrou-snt.js` doit porter `data-sequence` sur son `<body>`.** Sans lui, `sequenceDeLaPage()` rend une chaîne vide, `ouverte()` répond `true` sur tout et le plafond ne s'applique à rien — silencieusement, puisque le repli va dans le sens de l'ouverture. `t0` était dans ce cas depuis son branchement. À vérifier **ensemble**, script et attribut, à chaque nouvelle séquence branchée | ✅ |
| 20/08/2026 | 🔴 **Le plafond d'avance passe par une fonction, jamais par une policy.** `seances_faites` porte `note`, `travail_donne` et `non_termine` — le cahier de textes dicté en fin d'heure. Une policy `select` pour les élèves le leur donnerait à lire. **Aucune policy n'est ajoutée sur la table** : `mon_plafond()` est `security definer`, `set search_path = ''`, et ne rend que des couples (séquence, séance) plus deux réglages | ✅ |
| 20/08/2026 | **Le curseur ne se saisit pas, il se déduit** de `seances_faites`, donc de la clôture déjà faite pour le cahier de textes. Aucune saisie nouvelle pour Loïc, et rien à reprendre le jour où il recule une séance. Prolonge la décision du 31/07 (le curseur n'est jamais stocké) | ✅ |
| 20/08/2026 | **Sans compte, rien n'est fermé** — et de même si la base ne répond pas, si l'élève n'a pas de classe, ou si le `013` n'est pas encore appliqué. Trois replis, tous dans le sens de l'ouverture. Même doctrine que le livret CFA : le cours passe avant le dispositif | ✅ |
| 20/08/2026 | **Le plafond se juge séance par séance, pas thème par thème.** Un thème entamé garde ses premières séances ouvertes et ne ferme que la suite ; le plafond **franchit les fins de thème**, puisqu'il se compte sur l'ordre global des séances | ✅ |
| 20/08/2026 | **`.locked` porte les deux verrous, `.plafonne` ne choisit que le texte.** C'est `.locked` qui commande le sommaire, la barre « tu es ici » et les gardes de saisie. Dire « finis la séance précédente » à un élève qui l'a finie serait un mensonge : d'où la seconde classe, et un bandeau distinct | ✅ |
| 20/08/2026 | **L'ordre des séances a une seule source** : `VerrouSNT.rangs()`, lu aussi bien par les pages élèves que par le tableau de bord. Deux calculs séparés finiraient par diverger, et c'est l'élève qui verrait la différence | ✅ |
| 20/08/2026 | **`ProfAPI.modifier()` refuse un PATCH sans filtre**, comme `supprimer()`. PostgREST applique un PATCH sans `?` à **toutes** les lignes : un « avance_max = 0 » mal formé fermerait le cours à toutes les classes d'un coup | ✅ |
| 20/08/2026 | **La date du jour se calcule à la main, jamais avec `toISOString()`** (côté page comme côté SQL, où l'on lit `now() at time zone 'Europe/Paris'`). `toISOString()` rend l'heure UTC : entre minuit et 2 h en été, la France est déjà au lendemain et la soupape se refermerait un jour trop tôt | ✅ |
| 20/08/2026 | **Le `013` s'exécute à la main, et n'est pas copié dans `supabase/migrations/`.** Ce dossier est appliqué automatiquement à chaque push : y déposer le fichier aurait exécuté le SQL en base à la fusion, sans décision explicite. Chemin retenu et **fait le 20/08 par Loïc** : SQL Editor. `012` a suivi le même chemin, et `007` n'est ni dans le dossier ni en base ; les deux dossiers ne sont donc plus des copies conformes — ce qu'il en advient est une question ouverte, portée en attente d'arbitrage | ✅ |
| 20/08/2026 | **Le détecteur de biais de QCM mesure l'ampleur, il ne la constate plus.** `verifier.mjs` signalait toute bonne réponse strictement la plus longue ou la plus courte : **60 signalements dont 13 tenaient à 1–3 caractères**, invisibles pour un élève, pendant que la queue montait à 74 — le bruit masquait les vrais cas. Deux mesures conjointes désormais : **écart ≥ 6 caractères** avec l'option la plus proche **et ≥ 15 %** de la longueur moyenne des options ; **marqué 🔴 au-delà de 12 car. et 30 %**. Résultat : **43 signalements, dont 34 marqués**, triés par ampleur décroissante, l'écart affiché dans le message. Le filtre « options courtes » devient inutile et disparaît : « 213 » face à « 4 » ne franchit aucun des deux seuils | ✅ |
| 20/08/2026 | **`node verifier.mjs --qcm`** sort la liste complète des biais de longueur, triée. Sans l'option, le rapport n'en montre que les 8 plus marqués | ✅ |
| 20/08/2026 | **La consigne du lanceur de QCM dit la vérité selon l'étape.** Elle était en dur : « Obligatoire pour valider l'étape », y compris sur un QCM posé dans un bonus — donc hors `data-gate`, hors validation et hors 100 %. Elle dépend maintenant de la présence de `data-gate` sur l'étape. Corrige aussi `WEB-Q2b` dans la séquence du Web, qui mentait déjà. `sequence-snt.js?v=29` → `v=30` sur les deux pages qui le chargent | ✅ |
| 20/08/2026 | 🔴 **Les numéros d'étape écrits en dur dans le HTML sont des vestiges morts** : `numeroter()` les recalcule au chargement depuis le rang de l'étape dans sa séance. Ce qui n'est recalculé par personne, ce sont les **renvois en toutes lettres** (« détaillé à l'étape 3.3 », « vu en séance 2 ») — neuf étaient faux dans `t1`, dont quatre visibles des élèves. À vérifier après tout déplacement d'étape ; **lire le rendu, jamais la source** | ✅ |
| 19/08/2026 | 🔴 **Un message d'erreur d'authentification ne se devine pas depuis le code HTTP.** `creerCompte()` traduisait TOUT 400/422 de GoTrue en « cet identifiant est déjà pris ». Or le projet applique une politique de mot de passe — au moins une minuscule, une majuscule et un chiffre — et un mot de passe refusé sort en 422 `weak_password` : l'élève changeait d'identifiant à l'infini sans jamais toucher à la seule chose qui n'allait pas. Constaté en usage réel à la première inscription CFA. Le client lit désormais `error_code` et distingue mot de passe faible, identifiant pris, identifiant refusé et trop de tentatives ; **la règle du mot de passe est annoncée sous le champ**, avant la frappe | ✅ |
| 19/08/2026 | 🔴 **Créer un compte se fait en deux temps, et le second peut échouer seul.** Le compte d'authentification d'abord, l'inscription en classe ensuite : si la seconde rate (code de classe faux, réseau coupé), il reste un compte que `ma_session()` ne voit pas. L'élève est alors traité comme non connecté ET son identifiant est « déjà pris » — une impasse dont il ne peut pas sortir. « Créer mon compte » tente maintenant une **connexion de secours** avec le mot de passe saisi : si elle passe, c'est bien son compte, et l'inscription en classe reprend là où elle s'était arrêtée | ✅ |
| 19/08/2026 | 🔴 **Livret CFA — le travail des apprentis est sauvegardé en base, dans le dispositif de comptes déjà en service.** Aucune table créée, aucune migration : domaine `cours`, clés `cfa-o00` … `cfa-o16`, **une ligne par fiche** valant `{ v, champs, fait }`. Les rédactions ne partent PAS dans `reponses_libres` — sur ce livret ce sont des brouillons personnels, pas des copies à corriger ; ce choix se rouvre sans migration le jour où il faudra les lire | ✅ |
| 19/08/2026 | **Livret CFA — le régime sans compte reste entier.** Sans connexion, tout continue de vivre dans le `localStorage`, comme avant. Un apprenti qui a oublié son mot de passe ne doit pas rester devant une fiche morte : le cours passe avant le dispositif | ✅ |
| 19/08/2026 | 🔴 **Le travail fait sans compte est repris à la première connexion.** Sinon, la seule chose que le compte devait apporter — ne rien perdre — est précisément ce qu'il fait perdre. Règle de fusion : **la base gagne toujours**, on ne remonte qu'un champ qu'elle n'a pas ; les clés locales reprises sont ensuite effacées, la doctrine du dispositif étant qu'un élève connecté n'a que son jeton en `localStorage` | ✅ |
| 19/08/2026 | 🔴 **Une page ne promet jamais ce qu'elle ne tient plus.** Les dix-sept fiches affichaient « rien n'est envoyé, ni à ton professeur, ni à personne d'autre » : la phrase devenait fausse le jour du branchement. Elle est désormais portée par `data-mention-donnees` et **réécrite par le script selon le régime réel**. Même motif pour le bandeau de `progression.js`, dont le texte par défaut (« ton travail ne sera pas enregistré ») est vrai en SNT et faux sur le livret : il se surcharge par `data-renvoi-texte` | ✅ |
| 19/08/2026 | **Deux classes CFA, pas une.** `CFA26A` (BTS MMCM) et `MVT26A` (bac pro MVTR) : le livret distingue déjà les deux publics, et un code par formation permet de voir qui avance, groupe par groupe | ✅ |
| 19/08/2026 | **Livret CFA — le livret s'adresse d'abord à l'atelier, le BTS vient en second temps.** L'accroche de l'Outil 0 partait du sujet d'examen de trente pages : le bac pro MVTR décrochait dès la première ligne. Elle part maintenant d'une situation d'atelier — un problème à régler, une documentation épaisse où retrouver l'information — et un encart séparé, « Et si tu poursuis en BTS », porte l'horizon de l'examen. Chaque public trouve son entrée nommée | ✅ |
| 19/08/2026 | **Livret CFA — l'écart relatif se note `ε`.** `e` seul se confondait avec tout le reste. Réserve connue et assumée : `ε` désigne aussi la déformation relative en RDM, que les BTS croiseront ; l'ambiguïté est jugée moins coûteuse qu'un symbole muet. Outils 4 et 6 | ✅ |
| 19/08/2026 | **Livret CFA — `α` pour les pentes et les angles de pièce, `θ` pour les angles de rotation.** Dès qu'il s'agit d'un mouvement, c'est `θ` qui s'emploie en cinématique. L'Outil 13 est passé de l'un à l'autre, et le dit en toutes lettres puisque les outils se prennent dans le désordre | ✅ |
| 19/08/2026 | **Livret CFA — un seul mot : « force ».** Le livret disait « effort » ici et « force » là, parfois dans la même phrase. 106 occurrences remplacées, accords compris | ✅ |
| 19/08/2026 | 🔴 **Livret CFA — la règle de rédaction compte QUATRE étapes.** La page écran de l'Outil 0 les avait fusionnées (l'application numérique se fait en nombres, l'unité réapparaît sur le résultat encadré) ; la fiche A4, le corrigé, les deux gabarits et `CONSIGNES-fiche-outil-CFA.md` §5 en annonçaient encore cinq. Contradiction dans les fichiers de référence, corrigée partout | ✅ |
| 19/08/2026 | 🔴 **Livret CFA — une question posée à l'élève est une question telle qu'un sujet la poserait.** Deux conséquences : *(a)* quand on montre la copie d'un élève fictif, **la question qui lui a été posée est citée d'abord**, dans un bloc `.enonce`, avant la copie ; *(b)* les consignes qui n'existent pas dans un sujet sont bannies — « relever parmi les données celles qui sont nécessaires » donne la moitié de la réponse et ne s'écrit nulle part ailleurs | ✅ |
| 19/08/2026 | **Livret CFA — les sous-questions qui découpent un même geste sont concaténées.** Un palier 3 demandait la section, puis la force, puis la comparaison : trois questions pour ce qu'un sujet pose en une. Le découpage est resté là où il correspond à de vraies questions successives | ✅ |
| 19/08/2026 | **Livret CFA — le palier 1 garde sa structure, pas son guidage.** Les amorces qui donnaient l'opération à faire (« V = 90 ÷ ___ ») ont été réduites à un trou de résultat ; la première question d'une série garde son amorce et sert de modèle aux suivantes | ✅ |
| 19/08/2026 | **Livret CFA — le vecteur porte sa flèche, la racine porte son trait.** Deux composants CSS : `.vec` (hampe et pointe en `em`, pas le caractère combinant U+20D7, qui se place au petit bonheur et disparaît à l'impression) et `.rac` (`√` suivi d'un `.sous` à `border-top`, qui rend les parenthèses inutiles). Un vecteur sans flèche est désormais une erreur au même titre qu'un résultat sans unité | ✅ |
| 19/08/2026 | **Livret CFA — `.eq-exo` n'a plus de retrait à gauche.** Dans un exemple résolu, la ligne des données partait du bord de la colonne et celle de la relation 1 rem plus loin : l'œil voyait un décrochement là où il n'y a aucune hiérarchie | ✅ |
| 19/08/2026 | **Livret CFA — une lettre grecque dans une formule en italique passe en romain (`.grec`).** En Garamond italique, l'alpha grec et le « a » latin ont le même dessin à un jambage près : « tan α » se lisait « tan a ». Le romain les sépare sans changer de famille | ✅ |
| 19/08/2026 | ⚠ **Livret CFA — `.formule-bloc .eq` est un conteneur flex : tout `<span>` qu'on y pose fait DISPARAÎTRE les espaces qui l'entourent** (« tan α » sort « tanα »). Dès qu'une formule contient un span, envelopper la ligne dans `<span class="l">` | ✅ |
| 19/08/2026 | **Livret CFA — jamais de lettre grecque dans une `.etq`.** L'étiquette passe en capitales par le CSS, et « sin α ≈ tan α » s'y affichait « SIN A ≈ TAN A ». Le libellé se reformule en toutes lettres | ✅ |
| 19/08/2026 | 🔴 **Livret CFA — la colonne de lecture se mesure en `rem`, jamais en `ch`.** `--mesure: 68ch` se recalculait dans la police de chaque bloc : titre 2,4 rem, paragraphe 1,06 rem, aparté monospace 0,74 rem, tableau 0,8 rem — quatre largeurs différentes, donc quatre marges différentes une fois centrées. Le bord gauche descendait en escalier (h1 190 px, h2 213, paragraphe 330, tableau 356, aparté 365) et la page n'avait plus de ligne de fuite. `--mesure: 36rem`, et un seul bord d'attaque | ✅ |
| 19/08/2026 | **Livret CFA — la marge gauche des blocs est calculée, pas `auto`.** `margin-inline: max(0px, (100% - var(--mesure)) / 2) auto` : les blocs pleine largeur sont centrés comme avant, mais un bloc plus étroit que la colonne — un tableau, qui prend la largeur de son contenu — s'aligne sur le texte au lieu de flotter au milieu | ✅ |
| 19/08/2026 | 🔴 **Livret CFA — jamais `display: grid` sur un élément à contenu inline mixte.** En grid, **chaque balise enfant devient une cellule** : dans `.methode li`, un `<strong>` au milieu d'une phrase passait seul à la ligne suivante. La règle de l'Outil 6 sortait à un mot par ligne sur quarante lignes, celle de l'Outil 0 hachée en trois. Puce en `::before` absolu et retrait en `padding` | ✅ |
| 19/08/2026 | **Livret CFA — le contenu des tableaux s'aligne à gauche par défaut ; le centrage se demande** (`.valeurs` sur le `<table>`, qui centre toutes les colonnes sauf la première). Centrer par défaut revenait à centrer de la prose — le barème de l'Outil 0, la colonne « où on le rencontre » des préfixes — et six pages portaient déjà des rustines `text-align: left` | ✅ |
| 19/08/2026 | **Livret CFA — une légende de figure se place SOUS le dessin, jamais à sa droite.** Quatre figures (outils 9, 10, 11, 13) avaient du texte hors `viewBox` : le SVG le rognait en plein mot. Élargir le `viewBox` ne marche pas — il rapetisse le dessin *et* le texte, jusqu'à l'illisible sur photocopie ; descendre ne coûte que de la hauteur | ✅ |
| 19/08/2026 | **Livret CFA — le témoin « enregistré » ne suit pas une case à compléter.** `cfa-livret.js` en pose un après chaque champ mémorisé ; en `display: block` après un `input.trou`, il renvoyait l'unité à la ligne suivante (tout le tableau de gammes de l'Outil 1 sur deux lignes par cellule). Il sort du flux visuel après une case, reste annoncé par `aria-live`, et demeure visible sous un `textarea` — là où l'on écrit longtemps | ✅ |
| 01/08/2026 | 🔴 **Un `MutationObserver` surveille les classes des étapes — toute écriture inconditionnelle dans `majLignes()` boucle à l'infini.** Il rappelle `majBarre()` → `majLignes()` à chaque changement de classe ; un `classList.remove/add` systématique se redéclenchait lui-même et **figeait la page au chargement** (constaté en usage réel le 01/08, compte `test04`). Règle : dans ce chemin, ne jamais écrire une classe, un texte ou un attribut sans avoir vérifié qu'il change réellement. Garde-fou : `t-mutation` compte les mutations sur la vraie page | ✅ non négociable |
| 01/08/2026 | **Défiler APRÈS recalcul de la page, jamais dans la même frame.** `scrollIntoView()` appelé juste après avoir démasqué une étape visait sa position d'avant (hauteur encore nulle), et `replierFaites()` raccourcissait la page au-dessus dans la foulée — on arrivait trop bas, le haut du cadre passait sous la barre. Fonction `defilerVers()` : deux `requestAnimationFrame` avant de viser | ✅ |
| 01/08/2026 | **Toutes les étapes n'ont pas de `.step-title`.** Les encadrés spéciaux (`.france-box`, bonus) portent leur titre dans `.fl` — l'étape 1.5 « Fierté française » était donc impossible à replier. Le repli cherche désormais le premier titre disponible quel que soit le gabarit, et seul le CONTENU se replie : masquer aussi le bandeau ferait disparaître ce sur quoi on vient de cliquer | ✅ |
| 01/08/2026 | **Le troisième état existe aussi dans la colonne de gauche** (« rendu · en attente », cercle pointillé). Il n'était posé que sur la pastille de l'étape : le sommaire latéral affichait « validée » alors que le professeur n'avait rien lu | ✅ |
| 01/08/2026 | **Une copie renvoyée s'ouvre pré-remplie**, texte surligné, curseur à la fin, et un bouton « repartir de zéro ». Faire tout retaper pour ajouter une phrase est décourageant — et l'élève réécrit alors moins bien que la première fois. **Une première rédaction n'est jamais pré-remplie** : sur « ta définition sans recherche », il n'y a rien à reprendre | ✅ |
| 01/08/2026 | **La pastille navigue sur ce qu'elle annonce.** Elle comptait les copies à reprendre mais faisait défiler TOUS les retours : « 2 à reprendre » puis un 3ᵉ clic vers une étape validée. Dès qu'il y a des copies à reprendre, le parcours ne porte que sur elles — ce qui demande une action passe avant ce qui est déjà réglé | ✅ |
| 01/08/2026 | **Liste dépliable des retours** (séance · étape · titre · état). Sur cinq séances, « 2 à reprendre » ne dit pas s'il faut remonter en séance 1 ou descendre en séance 4. Une seule entrée : on y va directement, un menu d'un élément serait une politesse inutile | ✅ |
| 01/08/2026 | **Le titre d'une étape ne passe plus sous la barre.** `#prog4` est collante ; `scrollIntoView()` amenait le titre derrière elle — on arrivait sur une étape dont on ne voyait pas le nom. `scroll-margin-top` réserve sa hauteur, et tous les défilements passent en `block:'start'` (le centrage de la reprise était un contournement du même défaut). Un seul réglage couvre aussi les liens d'ancre du sommaire | ✅ |
| 01/08/2026 | **La hauteur de la barre est MESURÉE, pas devinée.** Elle varie selon la largeur d'écran, le nombre de séances et la longueur des libellés : une constante serait fausse sur la moitié des appareils. `ResizeObserver` + `orientationchange` pour les tablettes ; le CSS garde une valeur de repli. La mesure doit se faire **après** l'insertion de la barre — placée avant, elle ne pose rien | ✅ |
| 01/08/2026 | **Le badge de session ne chevauche plus le bouton ☰.** `progression.js` le pose en `top:10 right:12`, exactement sous la barre. Décalé **côté CSS de la séquence** plutôt qu'en touchant `progression.js` : le badge ne lui appartient pas, et une page sans barre garde le placement d'origine. Sur mobile il passe en bas | ✅ |
| 01/08/2026 | **QCM à choix multiple** : si `r` est un **tableau** d'indices, l'étape bascule en « coche tout ce qui convient » — un entier reste un choix unique, donc **aucun QCM existant n'est touché**. Le mode multiple ne valide pas au clic (il faut confirmer, sinon le premier clic fermerait la question) et exige l'ensemble exact : ni oubli, ni case en trop — cocher tout ne donne pas le point | ✅ |
| 01/08/2026 | **Biais de longueur des QCM : contrôle automatique dans `verifier.mjs`** (signalé, non bloquant). La bonne réponse est souvent la plus longue, parce qu'on y met la nuance — l'élève la repère sans lire. **52 questions concernées dans les QCM existants**, et 9 sur 11 de mes propositions initiales, y compris après relecture. Options courtes (dates, nombres) exclues du contrôle | ✅ |
| 01/08/2026 | **Séance 1 enrichie** : 1.2 passe de 0 à 5 questions (dont la première en choix multiple), 1.4 de 4 à 8, 1.6 de 7 à 10. Gradient facile → difficile, jusqu'à 7 options. Longueurs homogénéisées et vérifiées | ✅ |
| 01/08/2026 | **La frise ne valide plus son étape au premier clic sur « Vérifier ».** Elle se marquait faite même avec un seul élément bien placé, et le pop-up « Séance terminée » s'ouvrait pendant que l'élève replaçait ses dates. Sur un tri, **vérifier n'est pas rendre** : validation quand l'ordre est juste, ou au 3ᵉ essai | ✅ |
| 01/08/2026 | **Troisième état de pastille : rendu mais pas encore relu** (`attente-corr`, cercle creux pointillé vert). L'étape compte comme faite — le travail EST rendu, la suite se débloque — mais le **vert plein reste réservé à ce que le professeur a relu**. Sans cette distinction, l'élève croit son travail validé alors que personne ne l'a lu | ✅ |
| 01/08/2026 | **Les étapes se replient en cliquant sur leur titre.** La classe `.replie` existait dans le CSS mais rien ne l'activait : on pouvait ouvrir une étape, jamais la refermer. On ne replie jamais l'étape en cours de travail. Titre accessible au clavier (`role=button`, Entrée/Espace) | ✅ |
| 01/08/2026 | **Pastille flottante « mes retours »** (44 px, bas de page) + récapitulatif des corrections dans la carte de reprise. Sur une page de 26 étapes, un retour de professeur est enterré : l'élève ne savait pas qu'on lui avait répondu. Rouge quand une copie est à reprendre — le seul cas où il DOIT agir | ✅ |
| 01/08/2026 | **Les options de QCM acceptent un balisage limité** (`code`, `b`, `i`, `sup`…). La question passait par `innerHTML`, l'option par `textContent` : `<code>192.168.1.226</code>` s'affichait en toutes lettres. On échappe tout puis on restaure une liste courte de balises — pas d'`innerHTML` en grand, et **une réponse d'élève ne passe jamais par ce chemin** | ✅ |
| 01/08/2026 | **Piège de portée : ne pas définir une fonction hors de l'IIFE qui l'utilise.** `champsCorriges` était déclarée au niveau global, la pastille dans un module : `ReferenceError` silencieux, la pastille ne se créait jamais. La remontée de déclaration ne traverse pas un IIFE. Un seul point d'entrée exposé (`window.SNTallerCorrection`) | ✅ |
| 01/08/2026 | **Bug bloquant corrigé : une copie renvoyée ne pouvait pas être réécrite.** Le JS remettait `style="display:''"` sur le bouton d'envoi, mais la règle CSS `.rempli .gaction{display:none}`, plus spécifique, l'emportait — l'élève lisait « reprends ta réponse » sans pouvoir le faire. Classe `.a-refaire` ajoutée **dans le CSS** : un correctif JS seul ne tient pas ici. Constaté en test réel, invisible en test automatisé | ✅ |
| 01/08/2026 | **Bug bloquant corrigé : un rechargement faisait reculer la progression.** À l'envoi, `validerFocus()` marque l'étape faite sans attendre le worker ; à la ré-hydratation, `markDone` n'était appelé que si `statut === 'corrige'`. Rouvrir la page reverrouillait donc la séance jusqu'au passage du worker (étape 1.5 bloquée après un redémarrage). **Règle : un rechargement ne doit jamais faire perdre une progression acquise** | ✅ |
| 01/08/2026 | **Bibliothèque de réponses types (`011`), rangée par question.** Les mêmes manques reviennent copie après copie ; on écrit la phrase une fois et on la réutilise. En base et non dans le navigateur : le stockage local meurt avec la session (12 h) et ne suit pas de l'iPad au PC. Cloisonnée par `auth_id` dès maintenant, pour ne pas avoir à migrer le jour où des collègues arrivent. Mémoriser est **toujours** un geste explicite | ✅ |
| 01/08/2026 | **« Corriger sans l'IA » ne lance pas Ollama** — le tableau de bord ne peut pas atteindre le PC de Loïc. Le bouton fait entrer dans la file les copies que le worker n'a pas encore vues, pour correction à la main en séance | ✅ |
| 31/07/2026 | **Thème 1 entièrement couvert : 30 grilles sur 30.** Les références sont tirées des **corrigés déjà écrits dans la page**, pas d'une recherche web : c'est ce que les élèves ont sous les yeux, donc la seule source qui ne puisse pas contredire le cours | ✅ V1 à valider |
| 31/07/2026 | **Quatre questions ont une grille de FORME, pas de fond** (`NET-R-ville`, `NET-R6`, `NET-R7`, `NET-R4b`) : le débit d'une commune, un `tracert` personnel, une box, une vidéo non vue par le modèle. Leur `esprit` dit explicitement à l'IA qu'elle ne peut rien vérifier et ne doit jamais contredire l'élève. On juge qu'une unité de débit est présente, pas que la valeur est bonne | ✅ |
| 31/07/2026 | **`NET-R-correze` : la date doit être réglée sur 2021.** L'énoncé demandait de comparer la Corrèze à ses voisins, mais sur la carte ARCEP en 2026 l'écart s'est refermé — la question ne montrait plus rien. Énoncé corrigé, et le corrigé prolongé : repasser en 2026 fait voir le rattrapage, ce qui renforce la leçon au lieu de l'affaiblir. **Rappel : toute question adossée à une carte datée doit préciser l'année** — sinon elle se périme sans prévenir | ✅ |
| 31/07/2026 | **Grilles à deux étages : socle commun de complétude + critères propres.** Le socle (`C-sens`, `C-sujet`, `C-plausible`, `C-precision`) rend jugeables les questions ouvertes ; il ne s'applique QUE sur `"socle_commun": true`, jamais d'office — sept critères de front et un modèle 12B se disperse. `C-precision` reste en `plus_loin` : en seconde, l'imprécision n'est pas un motif de renvoi | ✅ |
| 31/07/2026 | **Champ `reference` : ce que le professeur sait et que le modèle ne peut pas savoir** (débit d'une commune, tracé d'un câble, contenu d'une vidéo). Injecté comme *élément de correction*, explicitement pas comme modèle de rédaction : l'élève n'a pas à retrouver ces mots, seulement à ne pas les contredire. Rend jugeables les 7 questions documentaires qu'on allait laisser sans grille | ✅ |
| 31/07/2026 | **Les références vivent d'abord dans `criteres-snt.json`, pas en base.** L'édition depuis le tableau de bord viendra quand le contenu sera stable : construire l'écran maintenant, ce serait fabriquer une interface pour du contenu qui n'existe pas encore | ⏳ |
| 31/07/2026 | **Calibrage `NET-R3a` validé par Loïc** : serrer la main, dire allô, les feux rouges → tous ACCEPTÉS. Seule la reformulation creuse (« des règles qu'on suit tous, par exemple en cours ») est renvoyée. Principe général pour la séquence : **on est coulant, ce sont des secondes** | ✅ |
| 31/07/2026 | **Tout `.ps1` s'enregistre en UTF-8 AVEC BOM et sans caractère typographique.** Windows PowerShell 5.1 décode un `.ps1` sans BOM comme de l'ANSI : les tirets cadratins deviennent `â€"`, et ce guillemet typographique est traité par l'analyseur comme un vrai guillemet — chaînes déséquilibrées, script refusé, **avec un message désignant une ligne sans rapport** (erreur annoncée ligne 246, cause réelle ligne 226). Diagnostic reproduit à l'identique en décodant volontairement le fichier en CP1252. `verifier.mjs` contrôle désormais BOM et caractères sur tous les `.ps1`, en bloquant | ✅ non négociable |
| 31/07/2026 | **Plus de `process.exit()` dans le worker.** Appelé juste après un `fetch`, il coupait le processus pendant la fermeture du socket HTTP et Windows levait « Assertion failed: !(handle->flags & UV_HANDLE_CLOSING) ». C'était le chemin emprunté chaque fois qu'il n'y avait rien à faire — donc la majorité des passes planifiées : le journal se remplissait d'erreurs alors que tout allait bien. On laisse Node se terminer seul | ✅ |
| 31/07/2026 | **Journal du worker en UTF-8 forcé, des deux côtés.** node écrit en UTF-8, la console PowerShell lisait en page de codes héritée : « Rien +� pr+�-corriger ». Un journal illisible ne sert à rien le jour où on le consulte | ✅ |
| 31/07/2026 | **La fenêtre de contexte et la graine sont fixées dans `moteur.mjs`, pas dans Ollama.** L'interface d'Ollama était réglée sur **4k** et le worker en héritait sans le savoir : le total actuel passait tout juste, mais la grille ne couvre encore que 3 codes sur 40 — en l'étendant on aurait débordé, avec pour seul symptôme une dégradation silencieuse des jugements. `num_ctx: 8192` et `seed: 42` désormais dans le code. La qualité de la pré-correction ne doit pas dépendre d'un curseur dans une fenêtre de réglages | ✅ |
| 31/07/2026 | **Option « Cloud » d'Ollama à désactiver.** Le modèle local reste local, mais l'interrupteur ouvre une porte : si `IA_MODELE` pointait un jour vers un modèle hébergé, les copies partiraient sans que rien ne proteste. Désactivé, l'appel échoue bruyamment — c'est le comportement souhaitable | ✅ |
| 31/07/2026 | **Le tableau de bord ne lance pas le worker, et ne le lancera pas.** C'est une page publique servie par GitHub Pages : lui donner le pouvoir d'exécuter un programme sur le PC serait une faille, pas une fonctionnalité. L'automatisation vit sur la machine (`ia-snt/planifier-worker.ps1`, tâche planifiée toutes les 15 min, session ouverte) ; la page se contente de **dire si le worker a tourné** — sans quoi une file vide est ambiguë : soit les élèves n'ont rien envoyé, soit le worker dort depuis trois jours, et les deux appellent des gestes opposés | ✅ |
| 31/07/2026 | **Tâche planifiée plutôt que service Windows.** Un service tourne sans session ouverte, mais Ollama a besoin de la session pour le GPU : le service échouerait en silence toutes les quinze minutes. Corollaire assumé : **rien ne tourne PC éteint** — les copies du dimanche soir attendent lundi. C'est le prix d'un modèle local et souverain | ✅ |
| 31/07/2026 | **Rafraîchissement automatique toutes les 3 minutes**, mais jamais si l'onglet est masqué (iPad en veille) ni si un commentaire est en cours de rédaction — la copie en train d'être lue ne doit pas disparaître sous les doigts | ✅ |
| 31/07/2026 | **Le curseur ne s'avance jamais seul.** Quand la moitié du groupe a entamé la séance suivante, la page la *propose* d'un tap (`origine = 'suggeree'`). Un curseur qui bougerait tout seul repeindrait la grille en rouge sans explication | ✅ |
| 31/07/2026 | **Grille par séance avec le détail chiffré (`4/6`), PAS de dépliage étape par étape.** Les étapes de `t1` n'ont ni `id` ni `data-cle` : leurs clés sont positionnelles, ce que le registre signale comme instable depuis le 25/07. Reproduire ces clés côté tableau de bord produirait des appariements faux dès qu'une étape bouge. Le dépliage attend l'arbitrage sur les `data-cle` | ⏳ |
| 31/07/2026 | **Le cahier de textes se reprend d'un groupe à l'autre** : à la clôture d'une séance déjà faite ailleurs, les textes de l'autre classe sont proposés (uniquement dans les champs vides — on n'écrase jamais ce qui est déjà saisi) | ✅ |
| 31/07/2026 | **Bouton « copier » avec repli par sélection.** L'API presse-papiers exige un contexte sécurisé et une permission ; un bouton qui ne fait rien serait pire que pas de bouton. En cas de refus, le bloc est sélectionné et l'invite passe à « fais Ctrl+C » | ✅ |
| 31/07/2026 | **Validation en lot plutôt qu'automatique.** Automatiser côté worker aurait un défaut connu : le tri repère les copies douteuses mais **n'attrape pas un « accepté » confiant mais faux** — l'élève recevrait un message que personne n'a lu. Le bouton « Valider les N copies sans alerte » supprime la corvée du un-par-un sans déplacer la décision humaine, donc sans toucher au cadre AI Act | ✅ |
| 31/07/2026 | **Sondage aléatoire : 1 copie sur 5 reste dans la file** à chaque validation en lot (tirage sans remise, pour ne pas retomber toujours sur les mêmes élèves). Sans lui, Loïc ne verrait plus jamais ce que l'IA valide en son nom, et une grille qui dérive passerait des semaines inaperçue. C'est le seul garde-fou contre ça | ✅ |
| 31/07/2026 | **L'énoncé est rappelé en face de la copie**, depuis `assets/js/questions-snt.js` généré par `generer-questions.mjs`. Corriger sans relire la question, c'est corriger de mémoire — au bout de trois copies on ne sait plus si « c'est court » est un défaut ou la consigne (NET-1a demande deux phrases maximum) | ✅ |
| 31/07/2026 | **Phrases toutes faites : proposition V1 de Claude, à réécrire par Loïc.** Elles s'ajoutent au texte au lieu de le remplacer et n'envoient rien seules — c'est toujours Valider ou Renvoyer qui décide. Constante `PHRASES` en tête du script | ⏳ libellés à valider |
| 31/07/2026 | **La file de correction ne montre que les copies DÉJÀ pré-corrigées** (`statut='en_attente'` ET `correction_ia` non nulle). Corriger sans le travail préparatoire du worker n'a pas d'intérêt, et faire figurer les copies qu'il n'a pas encore vues donnerait une fausse impression de retard | ✅ |
| 31/07/2026 | **Ordre de la file : les copies signalées par `tri.a_verifier` d'abord, puis par ancienneté.** Tri fait côté page et non en SQL — le drapeau vit dans le JSONB, et sur trois groupes le volume ne justifie pas une vue dédiée | ✅ |
| 31/07/2026 | **« Annuler » ne couvre que la dernière action**, via `rouvrir_copie`. C'est un filet pour le clic malheureux, pas un historique : au-delà, on repasse par la file | ✅ |
| 31/07/2026 | **Le tableau de bord a son propre client Supabase** (`assets/js/prof-api.js`). `progression.js` sait tout faire mais **démarre seul et injecte son interface élève** — badge, modale de compte — ce qui pousserait une interface d'élève par-dessus celle du professeur. L'URL et la clé anon y sont donc dupliquées, et **`verifier.mjs` bloque si les deux divergent** : sans ce contrôle, le tableau de bord interrogerait un autre projet sans le dire, en affichant simplement zéro copie | ✅ |
| 31/07/2026 | **La session professeur se périme au bout de 12 h**, indépendamment du renouvellement automatique de Supabase. Sans cette limite, une session ouverte le resterait des semaines — et un iPad qui traîne en salle des profs donnerait accès à toutes les copies. Douze heures couvrent une journée de cours, pas une semaine d'oubli. Clé `snt.prof`, distincte de `snt.session` : un poste peut porter les deux | ✅ |
| 31/07/2026 | **`prof/index.html` est une page publique et le restera.** Elle ne contient aucun secret ; sans compte professeur elle n'affiche rien. La serrure est côté base (RLS + `est_enseignant()`), jamais côté page — on n'y écrit donc jamais une information qu'un visiteur ne devrait pas lire | ✅ |
| 31/07/2026 | **Le refus de rôle et le mauvais mot de passe donnent deux messages distincts.** Dire « identifiants incorrects » à quelqu'un dont le mot de passe est bon mais qui n'est pas inscrit dans `enseignants` enverrait chercher le problème au mauvais endroit | ✅ |
| 31/07/2026 | **La correction passe par trois fonctions, pas par une policy UPDATE** (`010`). Une policy « le professeur peut modifier `reponses_libres` » lui donnerait le droit de réécrire le **texte de l'élève** — et réveillerait le déclencheur d'archivage, qui remettrait la copie en `en_attente` en effaçant la correction au moment même de la poser. `valider_copie` / `signaler_copie` / `rouvrir_copie` ne touchent que `statut`, `corrige_le`, `commentaire_prof` | ✅ |
| 31/07/2026 | **`signale` veut dire « à refaire »**, pas « drapeau interne ». Côté élève : verdict rouge, pastille « À reprendre », et le **bouton d'envoi réapparaît** — sans lui l'élève lisait « reprends ta réponse » sans pouvoir le faire. La classe `rempli` et le corrigé révélé sont conservés | ✅ |
| 31/07/2026 | **On ne renvoie pas une copie sans dire pourquoi** : `signaler_copie` lève une exception si le professeur n'écrit rien **et** que l'IA n'a produit aucun message. Garde retirable en supprimant un bloc `if` | ✅ |
| 31/07/2026 | **Validation : tel quel ou mon texte, jamais d'édition du message IA.** Sans commentaire, l'élève reçoit le message IA relu + la ligne de transparence ; avec commentaire, le mot du professeur remplace tout. C'est la politique déjà câblée dans `rendreRetour()` | ✅ |
| 31/07/2026 | **`rouvrir_copie` conserve `correction_ia` et efface `commentaire_prof`** : le travail du worker n'est pas perdu, et c'est le seul moyen de retirer un commentaire écrit par erreur (`valider_copie` conserve l'existant quand on ne lui passe rien) | ✅ |
| 31/07/2026 | **Le retard est calculé, jamais stocké.** La base ne garde que des faits — `seances_faites` (ce que la classe a fait), `absences` (qui n'était pas là), `progression` (ce que l'élève a fait). Les couleurs de la grille et le délai de rattrapage vivent dans le JS. Conséquence voulue : reculer le curseur d'une séance recolore tout, sans script de rattrapage | ✅ |
| 31/07/2026 | **Le curseur de progression n'est pas une colonne** : c'est la séance de rang le plus élevé ayant une ligne dans `seances_faites`. L'ordre des séances est déjà connu par `assets/js/seances-snt.js`, généré depuis les pages. Stocker le curseur, ce serait le dupliquer — donc l'exposer à mentir | ✅ |
| 31/07/2026 | **Aucun planning de séance saisi d'avance.** La date naît à la clôture de la séance. Un prévisionnel de ~120 dates serait faux dès octobre et coûterait l'année en corrections ; les intentions vivent dans `jalons`, à raison d'**une date par thème et par classe** — un grain qui survit à la dérive, et qui donne l'écart utile (« deux séances avant la Toussaint ») | ✅ |
| 31/07/2026 | **Le rituel plutôt que le tableau de bord** : l'appli enseignant s'utilise en deux gestes encadrant la séance — pop-up des absents à l'ouverture, clôture dictée à la fin. C'est la clôture qui avance le curseur, recolore la grille et rédige le cahier de textes. Aucune saisie n'est faite deux fois | ✅ |
| 31/07/2026 | **Cahier de textes normalisé entre groupes** : à la clôture d'une séance déjà faite avec un autre groupe, l'entrée précédente est reproposée pré-remplie. École Directe n'ayant pas d'interface de dépôt, la sortie est un bloc de texte à copier | ✅ |
| 31/07/2026 | **Dictée = clavier iOS, pas `webkitSpeechRecognition`.** L'API navigateur souffre de bugs persistants en mode continu et **ne fonctionne pas pour une application installée sur l'écran d'accueil** — précisément l'usage visé. Un simple champ de texte + le micro du clavier : même moteur, rien à coder, rien à maintenir | ✅ |
| 31/07/2026 | **Le grain de la grille de suivi : séance dépliable en étapes** (option C). La vue par séance pour le coup d'œil, le dépliage pour le diagnostic. Le retard se lit en **deux compteurs distincts** — séance en cours / dette antérieure — et non dans la seule couleur | ✅ |
| 31/07/2026 | **« À corriger » n'apparaît pas dans la grille de suivi** : c'est un état du travail de Loïc, pas de l'élève. Il vit dans la file de correction. Une pastille répond à une seule question | ✅ |
| 26/07/2026 | **Le « à retenir » et le bilan ne se révèlent plus à la demande**&nbsp;: ils s'affichent seuls quand tous les blocs de réponse de l'étape sont remplis. Le bouton subsiste mais informe de ce qui manque, et ne reste cliquable qu'en mode enseignant (montrer le corrigé au tableau). La révélation ne juge pas la justesse&nbsp;: répondre faux donne accès au corrigé, c'est là qu'il sert le plus | ✅ |
| 26/07/2026 | **Porte d'intuition** (`data-porte`)&nbsp;: une question d'ouverture peut masquer le reste de son étape tant qu'elle n'a pas de réponse. Posée sur l'étape 3.3. Même motif que le point précédent, pris par l'autre bout&nbsp;: on ne lit pas le cours avant d'avoir dit ce qu'on croyait savoir | ✅ |
| 26/07/2026 | **Grilles d'association refondues** (`.label-selects`)&nbsp;: le flex-wrap enroulait les paires en pavé irrégulier et noyait les sous-titres numérotés. Passage en grille énoncé&nbsp;/&nbsp;choix, repli en une colonne sous 760&nbsp;px. Trois exercices concernés | ✅ |
| 26/07/2026 | **Texte courant justifié** sur la séquence Internet, avec `hyphens:auto` et retour au fer à gauche sous 520&nbsp;px. Portée limitée aux paragraphes de contenu. Généralisation aux sept autres séquences et au reste du site&nbsp;: à faire après vérification visuelle | ✅ |
| 26/07/2026 | **Badges de ressource de `t1` en clair** (`CARTE`, `CARTE FR`, `OUTIL`, `TERMINAL`) au lieu de `NET·1b`… `t1` sort donc de la convention `LOC·2` / `PHO·1b` encore en vigueur ailleurs. La décision d'harmonisation du 21/07 reste gelée | ✅ |
| 26/07/2026 | **La séquence Internet passe à CINQ séances.** L'ancienne S1 (10 étapes) est coupée après 1.7&nbsp;: S1 « C'est quoi Internet&nbsp;? » garde la définition et l'histoire (7 étapes), la nouvelle S2 « Internet et moi » reçoit l'enquête familiale, le débat et le bonus (3 étapes). Les suivantes glissent d'un rang | ✅ |
| 26/07/2026 | **La cascade de déverrouillage des séances est généralisée.** Elle était écrite à la main pour quatre séances (`s1`…`s4`) dans `sequence-snt.js`&nbsp;: une cinquième serait restée verrouillée à vie, sans erreur ni signal. Elle boucle désormais sur les `.seance` réellement présentes, triées par `data-seance` | ✅ |
| 23/07/2026 | **Gabarit SNT partagé : OUI**, extrait du terrain (le code de `t1`), pas réécrit. `assets/css/sequence-snt.css` + `assets/js/sequence-snt.js` deviennent les 3ᵉ et 4ᵉ ressources partagées. `t1` passe de 383 à 256 ko. Portage des sept autres : une à la fois, testée | ✅ |
| 23/07/2026 | **La frise ES passe sur Supabase**, comme la SNT. `serveur-frise/` abandonné : il demandait hébergement, auth, HTTPS, purge, sauvegardes, registre — Supabase les fournit, et son README envisageait d'exposer le PC personnel sur Internet. Modèle proposé dans `bdd/schema/007-frise-es.sql`, **à valider** | ✅ |
| 23/07/2026 | `ia-correction/` **fusionné dans `ia-snt/`** : même moteur, seule la grille change | ✅ |
| 23/07/2026 | Les liens inertes deviennent des **mentions « en travaux »** (`<span class="a-venir">` + picto 🚧 + texte pour lecteur d'écran), et **restent** ainsi tant que la ressource n'existe pas. Un lien qui ne mène nulle part n'a plus l'air cliquable | ✅ |
| 23/07/2026 | **Nommage unifié** : un préfixe de niveau par niveau (`2nde-` · `1re-` · `term-`), jours du cahier en `jNN-`, images préfixées par leur chapitre (`t1-`, `t1c1-`, `t2c1-`), minuscules et tirets partout. Motif : Windows est insensible à la casse, GitHub Pages non | ✅ |
| 20/07/2026 | Persistance des séquences SNT = **base Supabase**, plus de `localStorage` (sauf le jeton de session) | ✅ |
| 20/07/2026 | Région **West EU (Paris)**, plan gratuit. Cible souveraine Clever Cloud, à proposer à l'établissement en septembre | ✅ |
| 20/07/2026 | Ordre de branchement : **une séquence SNT pilote → les autres séquences → les chapitres de PC** | ✅ |
| 20/07/2026 | `assets/js/progression.js` autorisé comme **second asset partagé** (avec `fonts.css`) — dérogation à l'autonomie des séquences | ✅ |
| 20/07/2026 | Doublure GitHub Actions pour le réveil Supabase : **écartée en connaissance de cause** | ✅ |
| 20/07/2026 | ~~Identification par **pseudonyme + code de classe** via les connexions anonymes de Supabase~~ | ~~remplacée le 22/07~~ |
| 22/07/2026 | Identification par **identifiant + mot de passe choisis par l'élève**. Motif : portabilité maison↔lycée. Connexions anonymes désactivées. Email synthétique `identifiant@snt.local`, jamais envoyé. Mot de passe **haché**, jamais lisible : on réinitialise, on ne consulte pas | ✅ |
| 21/07/2026 | Images matricielles **autorisées** dans `assets/img/snt/<slug>/` (≤ 1400 px, JPEG progressif, ~200 ko), légende + source + licence obligatoires. Le SVG inline reste le premier réflexe | ✅ |
| 22/07/2026 | Affichage du retour élève : **`commentaire_prof` prime** ; à défaut, message IA validé + ligne de transparence. L'élève ne voit rien tant que `statut ≠ 'corrige'` | ✅ |
| 25/07/2026 | **Un exercice de rappel se compare au relevé de l'élève lui-même**, jamais à une valeur figée. Motif&nbsp;: une adresse IP n'est pas une constante — derrière un CDN, un même nom renvoie plusieurs adresses selon le lieu et le moment. Le moteur lit la saisie de l'élève dans `ETAT.champs['…/<clé du bloc>']`, déjà persistée en base et restaurée au chargement | ✅ |
| 25/07/2026 | Nouveau type de champ **« relevé »** : validé sur le **format** (quatre nombres de 0 à 255) et non sur la valeur. Réutilise l'acquis de l'étape 4.1 comme contrôle de saisie | ✅ à coder (lot 2) |

---

## Pré-correction IA

| Date | Décision | Statut |
|---|---|---|
| — | **Jamais de note.** L'IA observe des critères et justifie ; Loïc reste souverain. AI Act art. 6(3), tâche préparatoire. Garde-fou mécanique : toute sortie contenant une note est rejetée | ✅ non négociable |
| 22/07/2026 | **100 % local** (Ollama, PC de Loïc). L'API Mistral est écartée : la réponse de l'élève ne quitte jamais la machine | ✅ |
| 22/07/2026 | Modèle **Mistral Nemo**. Mistral Small (24B) déborde des 16 Go de VRAM (split 5/95 CPU/GPU) et le delta de qualité est dans le bruit | ✅ |
| 22/07/2026 | Architecture en **deux passes** : le modèle juge les critères → le **code** calcule verdict et aide → le modèle rédige le message en sachant le verdict | ✅ |
| 22/07/2026 | Le worker **ne touche jamais au statut**. Le passage `en_attente → corrige` est un geste de Loïc | ✅ |
| 22/07/2026 | **Retour à la grille d'origine** R1/C2 : le rework l'avait dégradée (3 → 11 divergences). Rework reporté à froid. Leçon : sur petit modèle, **restructurer** (un critère = une chose), pas reformuler | ✅ |
| 23/07/2026 | **Rôle d'aidant** : socle complet **+ au moins `AIDE_PLUS_LOIN_MINI` critère « pour aller plus loin »**. L'ancien ratio 2/3 sur l'ensemble des critères le rendait mathématiquement inatteignable (0,20 sur NET-1b avec un socle parfait) | ✅ |
| 22/07/2026 | Tri de relecture **asymétrique** : mieux vaut un drapeau de trop. Budget cible ≤ 1 copie sur 3 à vérifier, à mesurer sur de vraies copies | ✅ |
| 22/07/2026 | Une copie « à compléter » ou marquée ⚠ passe **forcément par le clic de Loïc** — jamais de validation en lot | ✅ |

---

## RGPD & conformité

| Date | Décision | Statut |
|---|---|---|
| 31/07/2026 | **Les absences ne portent aucun motif.** La colonne n'existe pas dans le schéma, pour qu'on ne puisse pas y céder un jour de fatigue : un motif peut être une donnée de santé ou de vie familiale. Le marquage **ne fait pas foi** — le registre officiel est celui de la vie scolaire ; c'est une note de travail, modifiable et sans conséquence pour l'élève | ✅ non négociable |
| 31/07/2026 | **La note de fin de séance est du contenu de cours, jamais un nom d'élève.** Elle vit en base, qui est pseudonyme par construction ; y dicter « X n'a rien fait » ferait basculer tout le dispositif dans le fichier nominatif. Rappel inscrit dans le commentaire SQL de la colonne, donc visible depuis le tableau de bord Supabase | ✅ non négociable |
| 31/07/2026 | **Ne jamais inclure `ia-snt/.env` dans une archive qui sort du PC.** Il est gitignoré, donc absent du dépôt public — mais un `zip -r` l'emporte quand même. Commande de référence : `zip -r depot.zip . -x "ia-snt/.env" ".git/*"`. Toute sortie accidentelle ⇒ régénérer la clé `service_role` | ✅ |
| 31/07/2026 | **La table des noms vit le temps de la session, pas plus, pas moins.** En mémoire vive seule elle disparaissait à chaque rafraîchissement et dès qu'iOS déchargeait l'onglet — inutilisable en classe. À l'année, elle ferait dormir un fichier nominatif dix mois dans un appareil mobile, session fermée comprise — exclu. Sur la durée de session, c'est proportionné : qui prend l'iPad déverrouillé voit déjà toutes les copies, et les noms tombent au même instant que le jeton. **Un seul objet en stockage, un seul effacement — les noms ne doivent jamais survivre au jeton** | ✅ |
| 31/07/2026 | ~~**Le tableau de bord n'affiche des noms qu'en mémoire.**~~ *(remplacée le 31/07 par la ligne ci-dessus)* **Le tableau de bord n'affiche des noms qu'en mémoire.** La correspondance identifiant→nom est un CSV local, chargé dans le navigateur en début de session, jamais envoyé ni persisté (pas de `localStorage` : un iPad ne doit pas garder de noms en cache). Sans le fichier, l'appli reste utilisable en pseudonymes — c'est le mode « projection au tableau » | ✅ |
| — | **Aucune police, aucun script depuis un CDN.** Tout auto-hébergé | ✅ non négociable |
| — | Pseudonymisation : aucun nom réel en base. Table identifiant→nom **sur le PC de Loïc uniquement** | ✅ |
| — | Aucune donnée sensible : pas de photo, pas de voix d'élève | ✅ |
| — | Alertes de décrochage basées sur la **progression réelle**, jamais sur le temps passé ni la comparaison entre élèves | ✅ |
| 20/07/2026 | Ne **jamais** committer un fichier de sauvegarde (`*.dump`, `dump-*.sql`) : il contiendrait des données d'élèves | ✅ |
| — | La clé `service_role` vit dans `ia-snt/.env`, gitignorée, jamais dans une page | ✅ |
| — | Mode enseignant : **ralentisseur, pas serrure** (page publique + inspecteur = contournable). Jamais de contenu sensible derrière. La vraie serrure viendra du rôle vérifié côté Supabase | ✅ |
| 23/07/2026 | Le code enseignant se note **hors dépôt** : le dépôt est public | ✅ |

---

## Pédagogie & production

| Date | Décision | Statut |
|---|---|---|
| 20/08/2026 | **QCM d'une vidéo : écrit à partir de sa transcription intégrale, fournie par Loïc.** Le modèle ne visionne pas, mais il peut lire — chaque question est alors **ancrée sur un passage cité**, vérifiable en un coup d'œil. Remplace la décision du 25/07 qui réservait ce travail à Loïc. Livré en **15 propositions par vidéo** dont il en retient 10, avec les questions écartées et leur motif | ✅ |
| 20/08/2026 | **Trois règles de forme pour un QCM**, en plus de la règle de position du 25/07 : options de **longueur comparable**, distracteurs de **même granularité** (un chiffre répond à un chiffre, un mécanisme à un mécanisme), et **position de la bonne réponse répartie** — le moteur n'ayant pas de mélange, l'ordre du JSON est l'ordre affiché | ✅ |
| 20/08/2026 | **Câbles sous-marins (étape 3.5) : 15 questions, `NET-Q-cables`, dans le bonus donc hors 100 %.** Le récit des quatre tentatives est trop riche pour être perdu, mais l'histoire des câbles n'est pas au programme : elle reste une récompense pour les élèves rapides | ✅ |
| 20/08/2026 | **DNS (étape 5.3) : 14 questions ajoutées au bloc `NET-Q8`**, qui en compte donc **18** — 4 sur la page, 14 sur la vidéo. ⚠️ À éprouver en classe : 18 questions d'affilée, c'est long. Si c'est trop, on scinde en deux blocs | ⏳ à éprouver |
| 20/08/2026 | **Une question de QCM déduite plutôt que citée est écartée.** Sur les 15 propositions DNS, celle sur la délégation est retirée par Loïc ; celle sur le nombre de serveurs interrogés est conservée mais signalée comme la seule à déduire du fonctionnement décrit | ✅ |
| — | Sur le **fond pédagogique**, la vision de Loïc est souveraine. L'IA est l'échafaudage, jamais le concepteur | ✅ non négociable |
| — | Contenu partagé avec des collègues : **on refait la forme, jamais le fond** | ✅ |
| — | La **validation** est un acte explicite de Loïc. La mise en ligne n'est pas un jalon | ✅ |
| 17/07/2026 | **Référentiel vivant** : tout nouveau mécanisme du cours se présente d'abord dans `t0` ; les autres séquences n'en portent que des rappels discrets | ✅ |
| 18/07/2026 | **Intégrer plutôt que renvoyer** : la notion nécessaire à une étape est traitée dans l'étape. Navigation autorisée, délégation de contenu interdite | ✅ |
| 18/07/2026 | Notes de chantier **dans la page** (`<aside class="chantier">`), encadrées par `<!-- CHANTIER -->` pour être supprimées d'un geste à la validation | ✅ |
| 21/07/2026 | **Échelle d'évaluabilité** ★★ / ★ / ○ / ✦ / — sur chaque bloc. *bonus* ≠ *facultatif* | ✅ |
| 21/07/2026 | Validation d'une étape **à l'envoi** : validée dès que l'élève a produit quelque chose. Deux informations distinctes en base, **fait** et **juste** | ✅ |
| 21/07/2026 | Trous **tolérants** : variantes + Levenshtein → état « presque », l'étape est validée, l'orthographe signalée jamais sanctionnée | ✅ |
| 21/07/2026 | Vocabulaire **figé** : séquence → séance → étape → champ. Côté élève, on dit *thème* | ✅ |
| — | Cible matérielle **iPad et téléphone** : jamais de `:hover` seul, jamais de `title` seul, cibles ≥ 44 px | ✅ acquis |
| 18/07/2026 | Réseaux sociaux : **plateformes fictives** pour les exemples, vraies plateformes pour les faits sourcés uniquement | ✅ |
| 18/07/2026 | Localisation : tout sur **cartes.gouv.fr** (Géoportail ferme en sept. 2026) | ✅ |
| 23/07/2026 | La doc de référence décrit **l'état courant** ; l'historique va dans `JOURNAL.md`, les décisions ici. Plus de « ⚠ Mise à jour du… » empilé | ✅ |
| 25/07/2026 | **Les contenus du site ne seront pas vendus.** Les images sont donc évaluées pour un usage **pédagogique non commercial** uniquement. Chantier licences **clos** : ne pas le réouvrir sauf demande explicite de Loïc | ✅ clos |
| 25/07/2026 | Numérotation t1 de référence : S1 `1.1→1.10` · S2 `2.1→2.5` · S3 `3.1→3.5` · S4 `4.1→4.6`, *pour aller plus loin* compris. Calculée par `numeroter()` sur les blocs `.step` | ✅ |
| 25/07/2026 | **Décision du 21/07 annulée** : l'adresse IP et le DNS **restent** dans la séquence Internet. Un thème distinct sera consacré au binaire, et la séance 4 l'a en **prérequis** | ✅ |
| 25/07/2026 | Le « à retenir » s'affiche **automatiquement** à la fin de l'activité, plus par bouton — partout, blocs de définitions compris | ✅ |
| 25/07/2026 | Pas d'animation infoforall en 3.3 : Filius en fin de thème suffit comme temps fort. L'animation reste en réserve si l'étape doit être étoffée | ✅ |
| 25/07/2026 | **Texte à trous : variante « étiquette compacte »**. Interligne 1,85, champ dans la police du texte, largeur calculée par le moteur d'après la réponse attendue, `min-width:44px`. Le texte des indices se range en **pied de bloc**, relié au trou par un numéro qui n'apparaît qu'avec lui | ✅ |
| 25/07/2026 | **Bloc définition : « fiche de dictionnaire » (D1)**. Gouttière teintée de 46 px portant l'icône de glossaire, corps sur fond blanc. Faite en pseudo-éléments : aucun HTML ni JS à modifier, les blocs à venir en héritent | ✅ |
| 25/07/2026 | `.glosmot` était défini **deux fois** avec des styles contradictoires (bordure + rayon complets d'un côté, filet gauche et rayon droit de l'autre) : la cascade gardait les deux. Définition unique désormais, dans le § grammaire V2 | ✅ corrigé |
| 25/07/2026 | **Deux natures d'aide, selon ce que l'exercice demande.** Information à l'écran (lecture de carte, de schéma) → un seul rappel **« Où chercher »**, visible d'emblée, jamais de contenu, aucun indice par champ : `data-aide="localisation"` + `data-ou` sur le bloc. Information hors de vue (restitution) → indices à deux niveaux après échec, inchangés | ✅ |
| 25/07/2026 | Règle : **un indice de niveau 1 ne contient jamais la réponse.** Au niveau 2, c'est le filet de secours — admis en restitution, proscrit en lecture de document. Contrôlé par `verifier.mjs` (§ 6 bis) | ✅ |
| 25/07/2026 | **Gras** : un terme n'est mis en relief qu'à sa première apparition dans l'étape, et les intitulés de questions n'en portent aucun. Exclus : tableaux, « à retenir », bulles, et les `data-focus-question` (mode focus, hors flux). 80 balises retirées | ✅ 1re passe |
| 25/07/2026 | Exercice d'encapsulation : **banque de mots avant** les libellés Émission / modèle TCP/IP / Réception, pour qu'ils touchent la grille qu'ils nomment | ✅ |
| 25/07/2026 | Tableau comparatif OSI / TCP/IP (3.2) refait en **3 colonnes** : une colonne d'intitulés donne un sens aux lignes — *le sigle veut dire · sa nature · combien de couches · ce qu'on en attend*. Les sigles sont développés **dans le tableau**, et une note rappelle que TCP et IP sont des protocoles là où TCP/IP est le modèle | ✅ |
| 25/07/2026 | Cause du débordement identifiée : `.doc-table td:first-child{white-space:nowrap}` est faite pour une 1re colonne servant de **clé courte**. Sur un comparatif (cellules de 90 caractères) elle poussait la 2e colonne hors du cadre. Corrigé par une classe `.compare`, la règle globale restant valable pour les 8 autres tableaux | ✅ |
| 25/07/2026 | Étape 3.4 réordonnée : **schéma → tables de A et B en exemple → exercice C/D → à retenir → glossaire**. Le « à retenir » ne précède plus l'exercice qu'il résume | ✅ |
| 25/07/2026 | Les tables de A et B, jusque-là décrites **en prose**, deviennent deux tableaux remplis : l'élève voit le format de la réponse avant qu'on le lui demande | ✅ |
| 25/07/2026 | Question 5 de 2.2 refondue : **document écrit + chronologie 1858→aujourd'hui + 4 sources + lecture du tableau + 2 dépôts d'image + QCM de 10 questions**. Périmètre strict : *évolution des technologies*. La pose et les dangers restent en Q7 et Q8 | ⏳ à valider |
| 25/07/2026 | Consigne des dépôts d'image : « transatlantique » **n'est pas imposé** — la distinction fait l'objet d'une question du QCM | ✅ |
| 25/07/2026 | Règle QCM : la bonne réponse ne doit pas se concentrer sur une position. À surveiller à chaque nouveau QCM | ✅ |
| 25/07/2026 | Question 6 de 2.2 : **le calcul n'est plus écrit**. Trois étapes de recherche — longueur totale des câbles · circonférence équatoriale · nombre de tours —, l'opération est à trouver par l'élève | ⏳ à valider |
| 25/07/2026 | Les sources donnent 1,4 à 1,8 million de km : **la fourchette est acceptée** (30 à 45 tours) et la variation devient la leçon — notion d'**ordre de grandeur**, expliquée sous l'exercice | ✅ |
| 25/07/2026 | Étape 2.4 : **doc 1 conservé** (SVG maison), **doc 2 remplacé** par l'infographie Arcep fournie par Loïc, **doc 3 créé** avec le graphique Our World in Data. Les deux SVG maison de remplacement sont abandonnés | ⏳ à valider |
| 25/07/2026 | QCM trafic porté à **8 questions** sur les trois documents, avec un avertissement préalable : les documents ne seront plus accessibles une fois le QCM lancé. Options de longueur comparable, la précision est dans la correction | ⏳ à valider |
| 25/07/2026 | Séance 2, *pour aller plus loin* : **poste de visionnage** (vidéo M Bidouille sur les câbles, via `youtube-nocookie.com`) + prise de notes ouverte. La question « Pourquoi Marseille&nbsp;? » est conservée en second — à supprimer sur un mot de Loïc | ⏳ à valider |
| 25/07/2026 | Étape 3.1 : QCM porté de 1 à **4 questions** + encart *« un protocole sans ordinateur »*, réponse personnelle **partagée avec la classe** | ⏳ à valider |
| 25/07/2026 | Étape 3.2 : la consigne du jeu nomme explicitement le **modèle OSI** · le paragraphe de transition OSI → TCP/IP passe **entre le jeu et le doc des 4 couches** · les 4 couches deviennent **★★ à savoir** (connaissance, plus savoir-faire) · le « schéma à reconstruire », redondant avec l'encapsulation, cède la place à un **QCM de 6 questions** (code `NET-Q5` conservé) | ⏳ à valider |
| 25/07/2026 | Étape 3.3 refondue : **3 documents** (deux métiers · analogie du déménagement · TCP vs UDP), « vérifie ta compréhension » conservé, **QCM de 4 questions**, « à retenir » descendu après. `NET·3` et `NET·3b` retirés. Filius et la passerelle NSI partent en fin de thème | ⏳ à valider |
| 25/07/2026 | Étape 4.1 refondue : l'élève **reconstitue** la structure de l'adresse par six questions enchaînées — 8 bits → 256 valeurs → 255 → 32 bits → 4,3 milliards — au lieu de la lire dans un document. Rappel de prérequis en tête d'étape, QCM de 4 questions, « à retenir » descendu à la fin | ⏳ à valider |
| 25/07/2026 | **Étape 4.3 refondue en sept temps** : relevé de trois adresses IP → rappel de mémoire **sur fond flouté** → doc « pourquoi un annuaire » → poste de visionnage → QCM → « à retenir ». **L'échec de mémorisation est le ressort de l'étape**, pas un accident à contourner. La définition arrive après l'échec | ⏳ à valider |
| 25/07/2026 | Les trois sites du relevé : `www.univ-poitiers.fr` · `www.inria.fr` · `www.afnic.fr`. Motifs — Poitiers est vérifié (l'IP tapée dans la barre ouvre bien le site), Inria apparaît déjà en séance 1 avec Pouzin et CYCLADES, et l'AFNIC referme la boucle puisqu'elle est nommée dans le « à retenir ». **À vérifier une fois par `nslookup` depuis un poste de la salle** : pas de CDN, et pas trois adresses dans le même /16 (sinon les élèves repèrent le motif). Remplaçants : `www.ac-poitiers.fr`, `www.cnrs.fr`, `www.unilim.fr` | ⏳ à vérifier sur poste |
| 25/07/2026 | ~~Questions de QCM sur une vidéo : écrites par Loïc, après visionnage. L'IA ne visionne pas, elle ne peut garantir aucune question sur le contenu.~~ Remplacée le 20/08/2026 : voir « QCM d'une vidéo à partir de sa transcription » | ~~remplacée~~ |
| 25/07/2026 | La contrainte technique devient du contenu : « deux élèves peuvent relever **deux adresses différentes** pour un même gros site et avoir **tous les deux raison** » est expliqué dans le doc et posé en question de QCM, au lieu d'être masqué | ✅ |
| 25/07/2026 | Étape 4.2 : « à retenir » **descendu après le QCM** et correction vide du QCM **remplie** (elle sépare désormais l'ICANN du DHCP, ce qui prépare la première question de 4.3) | ✅ |
| 25/07/2026 | `NET·4c` (4.4) **n'est pas une ressource** mais une consigne de manipulation sur le poste de la salle. Sa mise en forme en `res-item` dans une liste `.res` la faisait ressembler aux liens externes voisins — d'où l'impression d'ouvrir un site web. À sortir de `.res` et à débarrasser de `.a-venir` (rien n'est en travaux) | ✅ à faire (lot 3) |
| 25/07/2026 | **La grande note d'état en tête de `t1` est réduite à un pointeur** vers `DECISIONS.md` et `ETAT-PROJET.md`. Elle affirmait encore quatre choses fausses (S4 en 4.1→4.5, S1 en 1.1→1.9, « à retenir » derrière un bouton, licences « à confirmer ») : la sédimentation avait migré des fichiers de référence vers les pages | ✅ |
| 25/07/2026 | **Séquence Web portée sur le moteur partagé (lot 0)** — ordre validé par Loïc : portage d'abord, contenu ensuite. CSS et JS inline supprimés (37 000 caractères), 6 QCM inline → **QCM plein écran** (`WEB-Q1`→`WEB-Q6`), 9 champs libres → **mode focus** (`WEB-R1`→`WEB-R9`), mode enseignant à code. Le **piège à clic** de la séance 4, absent du moteur, y a été porté (sans effet sur les séquences qui n'ont pas ses attributs) | ✅ |
| 25/07/2026 | **Séquence Web — nouvelle séance 1** dictée par Loïc : `1.1` grande introduction (histoire du Web + dissémination du vocabulaire du thème avec pictos 🔭) · `1.2` navigateur ≠ moteur de recherche, la question ouverte est **posée avant** la recherche puis **reposée à la fin** pour validation · `1.3` requête HTTP en poste de visionnage puis schéma à compléter · `1.4` l'URL enrichie | ⏳ à produire (lot 1) |
| 25/07/2026 | **Documents OneDrive du thème Web reçus et dépouillés.** Décision : on garde l'esprit et le contenu, on refait les chiffres et les erreurs. ⚖️ Les quatre activités scannées du **cahier Nathan** (p24, p27, p32, p33) **ne seront pas republiées** : énoncés réécrits avec nos propres données. Corrections actées : « Word Wide Web » → *World Wide Web* · « TCP/IP (Transmission Control Protocol) » → **le modèle** TCP/IP · `.asso` `.univ` `.gouv` ne sont pas des extensions mais des sous-domaines de `.fr` | ✅ |
| 25/07/2026 | **Vidéos de la séquence Web : cadres laissés vides.** Loïc fournira les questions après visionnage — même règle qu'en séquence Internet | ✅ |
| 25/07/2026 | **Séquence Web, séance 1 produite (lot 1)** — quatre étapes : `1.1` Le Web n'est pas Internet (partage Internet/Web, histoire 1965→1998, vocabulaire du thème disséminé en 🔭) · `1.2` Navigateur ou moteur de recherche (question **posée avant** puis **reposée à la fin**, `WEB-R1a` / `WEB-R1b`) · `1.3` La requête HTTP (poste de visionnage, méthodes, codes de statut, schéma à légender, encart HTTPS) · `1.4` Décomposer une URL (port, paramètres, ancre, ICANN/AFNIC). Minitel, « et toi ? » et bonus conservés | ⏳ à valider |
| 25/07/2026 | **Chiffres refaits, source StatCounter 2026.** Navigateurs (janvier 2026, monde, tous appareils) : Chrome ≈ 71 %, Safari ≈ 15 %, Edge ≈ 5 %, Firefox ≈ 2 %. Moteurs (mai 2026) : Google ≈ 90 %, Bing ≈ 5 %. **Écrit dans la page** que les estimations varient de 87 % à 93 % selon les sources, et qu'il faut retenir l'ordre de grandeur, pas la décimale — l'écart entre sources est lui-même un objet d'esprit critique | ✅ |
| 25/07/2026 | **Ajout au programme de 1.2 : la souveraineté de l'index.** En Europe, 96 % des recherches reposent sur l'index de deux entreprises américaines, 3,5 % sur celui d'un acteur russe. Qwant (FR) et Ecosia (DE) ont créé **European Search Perspective** en novembre 2024 et l'index **Staan**, déjà en service sur une partie des requêtes en français. Prolonge la ligne « fierté française » de la séquence Internet | ⏳ à valider |
| 25/07/2026 | **Contresens explicitement traité en 1.3** : le cadenas HTTPS garantit que l'échange est illisible en route, **pas** que le site est honnête. Posé en question de QCM. Prépare la séance 4 | ⏳ à valider |
| 25/07/2026 | **La séance 1 passe de 1 h 30 à ≈ 2 h** (durée de la séquence : 6 h → 6 h 30). **Décision en attente de Loïc** : garder en deux temps, ou déplacer `1.4` (l'URL) en séance 2 | 📌 en attente |
| 25/07/2026 | **Séquence Web, séance 2 produite (lot 3)** — cinq étapes : `2.1` les deux versants d'une page, balises, CSS, standards W3C · `2.2` atelier **CodeBetter** avec les deux codes d'origine de Loïc, quatre manipulations et trois captures · `2.3` le rôle des balises avec ses mots · `2.4` l'inspecteur sur la page Rimbaud (Verlaine→Baudelaire, `h1`→`h4`, `b`→`em`, `title`, portrait→Pesquet) · `2.5` huit tâches à trier entre HTML et CSS (ex. 18 p33 réécrit) | ⏳ à valider |
| 25/07/2026 | **La manip de l'inspecteur débouche sur une leçon d'esprit critique**, pas seulement sur du code : l'élève fabrique une fausse page Wikipédia en trente secondes, donc **une capture d'écran ne prouve rien**. Repris en QCM et annoncé comme préparant la séance 3 | ⏳ à valider |
| 25/07/2026 | **Séquence Web, étape cookies ajoutée en séance 4 (lot 4)** — l'élève **cherche lui-même** le chemin sur deux navigateurs (aucun pas-à-pas donné : le savoir-faire visé est de trouver un réglage inconnu), puis compare les deux logiques, par **site** ou par **période**. Avec le RGPD, la distinction cookie de session / cookie tiers, et ce que la navigation privée **ne** cache **pas** | ⏳ à valider |
| 25/07/2026 | **Anti-doublon** : le document sur la sécurité du navigateur contenait aussi la définition du navigateur et ses parts de marché. Traitées **une seule fois**, en 1.2. La séance 4 n'en garde rien | ✅ |
| 25/07/2026 | **Les exemples de code écrivent leurs guillemets en `&quot;`** : `verifier.mjs` prenait `href="…"` et `src="chat.jpg"` pour de vrais liens internes et signalait 6 liens cassés. L'élève voit exactement le même code ; le contrôle ne s'y trompe plus. Nouvelle classe `pre.code-bloc` dans le CSS partagé | ✅ |
| 25/07/2026 | **Durée de la séquence : 6 h → 7 h 30** (S1 ≈ 2 h, S2 ≈ 2 h, S4 ≈ 2 h). **À arbitrer par Loïc** : ce qui se retire, ou ce qui devient facultatif | 📌 en attente |
| 25/07/2026 | **Durée : cinq créneaux assumés (option A)** — la séquence Web passe à ≈ 7 h 30 et on ne raccourcit pas le contenu. Motif retenu par Loïc : le thème était celui de sa lassitude, le calendrier se rattrape, pas le goût | ✅ |
| 25/07/2026 | **`2.2` CodeBetter n'est plus une étape bloquante.** Motif : elle dépend d'un service extérieur au site. Si le filtre du réseau du lycée le coupe, un élève ne doit pas se retrouver verrouillé pour la séance entière | ✅ |
| 25/07/2026 | **`2.5` (HTML ou CSS, huit tâches) passe en consolidation hors 100 %** (option C) : reste visible et faisable, n'entre pas dans la validation | ✅ |
| 25/07/2026 | **L'ancienne étape 3.1 est supprimée.** Sa définition du moteur et du métamoteur faisait **doublon exact** avec ce que j'ai écrit en `1.2` — erreur de ma part au lot 1. §14.1 : un seul traitement complet par notion. Le « Le sais-tu ? » sur Qwant n'est pas perdu : `1.2` le traite plus largement, avec l'index européen. La séance 3 s'ouvre désormais sur le classement des pages, avec un renvoi vers la séance 1. Le code `WEB-R4` est **retiré et non recyclé** | ✅ |
| 25/07/2026 | **`WEB-R8` (« un réflexe que tu comptes appliquer ») devient une réponse personnelle partagée**, non corrigée : c'est un engagement, pas un savoir — le corriger n'a pas de sens | ✅ |
| 25/07/2026 | **Charge de correction, chiffre rectifié.** J'avais annoncé 12 réponses rédigées et 864 copies : faux, quatre d'entre elles sont dans des blocs bonus donc facultatives. Le vrai point de départ était **7 corrigées obligatoires** (≈ 504 copies pour trois groupes). Après arbitrages : **5** (≈ 360 copies, ≈ 120 relectures au budget d'une sur trois) | ✅ |
| 25/07/2026 | **Séquence Web, séance 3 refondue (lot 2)** — le moteur travaille en **deux temps** : pré-calcul (exploration, indexation, classement de notoriété) puis recherche (mots-clés, tri). Les cinq tâches du document 03 deviennent un exercice à menus. Ajout du **SEO** et de la distinction **résultat classé / résultat acheté** (mention « Annonce »). La **grille de fiabilité en quatre questions** — qui, quand, pourquoi, comment — reprend l'étape 3 du document 01, avec en plus le réflexe géographique et la relecture de l'URL | ⏳ à valider |
| 25/07/2026 | **Frise débranchée (lot 5)** — les 20 étiquettes du document 04, **sans leurs dates**. Deux repères hors informatique (la Lune, le premier ordinateur portable) pour situer l'époque. **« Le premier ordinateur portable » est gardé sans réponse unique, exprès** : selon la définition retenue on trouve 1975, 1981 ou 1982 — l'enjeu devient *pourquoi les sources divergent*, ce qui prolonge la séance 3. Durée 30 → 45 min | ⏳ à valider |
| 25/07/2026 | **Nomenclature des codes de champ unifiée** : `WEB-Q<séance><lettre>` pour les QCM, `WEB-R<séance><lettre>` pour les réponses rédigées. 22 codes, tous uniques, tous cohérents avec leur séance. Les codes `WEB-Q2` et `WEB-R4` retirés en cours de route ne sont **pas recyclés** | ✅ |



---

## Audit 1 de T3-C1 — 25/08/2026

Audit oral de Loïc sur la V1 intégrale livrée le matin même. Trois points
demandaient son arbitrage avant de coder ; il les a tranchés en ouverture.

| # | Décision | Statut |
|---|---|---|
| A1-1 | **Une division s'écrit avec une vraie barre de fraction**, jamais avec un slash. Vaut pour **tous les chapitres de physique**, pas seulement T3-C1. Le socle a déjà `.frac` | ✅ |
| A1-2 | **Vidéo d'expérience : façade cliquable.** Vignette SVG maison hébergée dans le dépôt + bouton ▶ ; l'iframe `youtube-nocookie` n'est injectée **qu'au clic**. Ni chip simple, ni iframe directe — celle-ci exposerait l'IP de l'élève à Google dès le chargement | ✅ |
| A1-3 | **Image de l'exercice 2 : vignette de rappel** dans la colonne étroite (`.duo-x`), légendée « Rappel — le signal de l'exercice 1 », plutôt que suppression + renvoi par ancre. L'élève ne doit pas remonter dans la page pour faire un calcul | ✅ |
| A1-4 | **Source sonore de l'exercice 1 : formulation neutre.** « Le signal électrique délivré par un microphone placé devant une source sonore » — la source PPTX ne dit pas de quel instrument il s'agit, on n'invente pas | ✅ |
| A1-5 | **La remarque sur les chiffres significatifs est retirée de la page.** La notion arrive après ce chapitre dans la progression de Loïc. Les résultats restent arrondis, sans justification visible ; les commentaires `<!-- SOURCE → CORRIGÉ … -->` restent, invisibles pour l'élève | ✅ |
| A1-6 | **Tout le CSS de l'audit reste dans le `<style>` local de la page.** Toucher `chapitre-commun.css` obligerait à incrémenter le `?v=N` dans les 14 chapitres — hors périmètre | ✅ |
| A1-7 | **Une ligne de calcul se replie, elle ne défile pas.** Le vrai coupable n'était pas `.resultat` mais `.eq-ligne { white-space:nowrap; overflow-x:auto }` : combiné à `text-align:center`, une ligne trop large sortait des **deux** côtés, et la moitié gauche était **inatteignable au défilement**. Ampleur mesurée sur les 14 chapitres à 380 px : **45 lignes de calcul sur 159 amputées, sur 11 chapitres, jusqu'à 324 px perdus**. `white-space:normal` + `line-height:1.75` sur `.eq-ligne`, `.eq-exo` et `.formule-cours-rappel` ; les atomes (`.nb`, `.resultat`, `.frac`) restent insécables. **Mesure après : 0 débordement.** Socle passé en **`?v=4`** dans les 17 fichiers qui le chargent | ✅ |
| A1-8 | ⏳ **Les fractions méritent-elles de monter dans le socle ?** La règle d'interligne (`.avec-frac`) et le garde-fou `.avec-frac .frac { line-height:1.15 }` — sans lui le bloc formule triple de hauteur — sont aujourd'hui locaux à T3-C1. Ils seront à remonter quand un deuxième chapitre passera en fractions | ⏳ |

**Deux classes locales nouvelles**, à remonter au socle si elles se répètent :
`.encart.attention` (mise en garde, filet rouge — le socle ne connaît que
définition / propriété / exemple / notation) et `.duo-fig` (texte à gauche,
figure ou tableau à droite). `.duo-fig` inverse volontairement les colonnes de
`.duo` : l'ordre du DOM suit alors l'ordre de lecture — on définit, puis on
illustre — y compris au repli en une colonne sous 900 px.


### Trouvé en mesurant A1-7 — corrigé dans la foulée (25/08/2026)

Trois pages avaient un **scroll horizontal de page entière** à 380 px, sans
rapport avec les lignes de calcul.

| # | Décision | Statut |
|---|---|---|
| A1-9 | **Huit tableaux `.tab` n'étaient pas enveloppés** dans un `<div class="defile">` (T1-C1 ×4, T1-C2, T1-C3, T1-C4, T1-C7). Sans lui, un tableau large pousse la page entière. Tous enveloppés ; `.defile{overflow-x:auto}` est sans effet tant que le tableau tient | ✅ |
| A1-10 | **Frise historique de T1-C3** : le halo décoratif `.fh-rayons` déborde de 26 px de part et d'autre du nœud — invisible tant que la grille a des colonnes, hors page une fois repliée. Et `.fh-bas { grid-template-columns:1fr }` refusait de descendre sous la largeur *min-content* de la rangée flex du nœud. Corrigé en `minmax(0,1fr)` + halo resserré + `flex-wrap` dans la media query 720 px | ✅ |

**Effet de bord assumé, à connaître** : les deux pages d'**enseignement
scientifique de terminale** (`term-es-t2-c1`, `term-es-t2-c2`) chargent le même
socle. Elles bénéficient de la correction et sont passées en `?v=4` comme les
autres.

**Reste imparfait, et c'est le prix du choix** : une ligne qui se replie coupe
parfois après un `×` plutôt qu'avant. Bien grouper les produits demanderait
d'entourer chaque facteur d'un `<span class="nb">` dans les 14 chapitres — une
passe à part. **Lisible et un peu laid vaut mieux qu'amputé.**

---

## Famille « Outils transversaux » de physique-chimie (25/08/2026)

Quatrième famille du dépôt. Les huit décisions de cadrage, posées par Loïc au
lancement du chantier :

| # | Décision | Statut |
|---|---|---|
| D1 | Les outils sont une **famille à part entière**, pas un chapitre ni une séquence. Ils ne suivent aucune progression : un élève de janvier et un élève de septembre y accèdent pareil | ✅ |
| D2 | Ils tournent sur le **moteur SNT** (`sequence-snt.js` + `sequence-snt.css`), pas sur `chapitre-commun.css`. Motif : c'est le seul moteur qui apporte les trous tolérants, les QCM plein écran, le mode enseignant et l'enregistrement en base | ✅ |
| D3 | Les pages vivent dans **`pages/`**, préfixe **`oN`**. Motif : le contrôle de synchronisation des `?v=` de `verifier.mjs` ne parcourt que `pages/` ; un dossier à part sortait du filet sans que rien ne le signale | ✅ |
| D4 | **Les corrigés sont en ligne**, sur la page, sous l'énoncé. C'est la différence assumée avec le livret CFA (§7 des consignes CFA : « les corrigés ne sont pas en ligne » — cette phrase ne vaut **que** pour le CFA). Motif : les exercices se font **à la maison**, l'élève doit pouvoir se corriger seul le soir | ✅ |
| D5 | La **fiche A4 est complétée**, pas à trous. Le cours est écrit en entier, les exemples résolus. Elle se distribue en classe et se colle ; on ne perd pas d'heure à la remplir | ✅ |
| D6 | Les `data-cle` sont posées **dès la V1**, préfixées par la clé de l'outil (`pc-o1-…`), pour que le branchement des comptes ne coûte rien plus tard. Les outils fonctionnent sans compte | ✅ |
| D7 | **Aucun verrouillage entre outils, ni entre outils et chapitres.** C'est la progression de Loïc qui décide quand un outil est traité, pas le site | ✅ |
| D8 | Le fond des fiches OneDrive des collègues est **conservé** ; seule la forme est refaite. Les erreurs de calcul repérées sont corrigées **et signalées** à Loïc, qui préviendra l'équipe | ✅ |

### Arbitrages du lot 1 (25/08/2026)

| # | Décision | Statut |
|---|---|---|
| O-1 | ~~**Nommage des deux « fiches » à l'écran** : la fiche A4 imprimable est la « fiche outil », le récapitulatif produit par le moteur devient « Mes réponses »~~ | ⛔ remplacée le 27/08 par **O-6** : il n'y a plus qu'une fiche |
| O-2 | ~~**Le mot « Séance » dans la fiche générée par le moteur**~~ | ⛔ sans objet depuis le 27/08 : la fiche générée est retirée des outils (**O-6**) |
| O-3 | **L'incertitude reste dans `o2`**, en trois lignes marquées ○ support : sans elle, le chiffre significatif n'est qu'une convention arbitraire, et 3,20 ≠ 3,2 ne se justifie plus | ✅ |
| O-4 | ~~**Le statut des zéros de fin d'un entier** : les deux sont ambigus, et l'ambiguïté devient la leçon~~ | ⛔ **tranché le 27/08 par Loïc**, voir **O-8** : il n'y a pas de zéro ambigu en seconde |
| O-5 | **La série finale de `o2` compte huit calculs, contre six fournis.** Les deux ajoutés (`0,456 × 12,3` et `6,20 − 0,025`) ne réemploient **que des nombres déjà présents** dans les six autres, et couvrent chacun une règle. Proposition à valider | ⏳ |


### Audit 1 des deux outils — arbitrages du 27/08/2026

Relecture de `o1` et `o2` par Loïc les 26 et 27/08. Le modèle général est
validé — structure en deux sections, trajet d'une étape, composant `.exemple`,
bloc `.niv`, corrigés en ligne : *« c'est vraiment très bien »*. Ce qui suit ne
porte que sur le contenu et sur quatre défauts de forme.

| # | Décision | Statut |
|---|---|---|
| O-6 | 🔴 **Le récapitulatif de réponses du moteur est retiré des outils.** Sans objet ici : la fiche outil s'imprime complète, c'est elle qu'on colle. Le moteur l'émet à **trois** endroits (barre de fin de partie, modale de « Recommencer », pop-up de fin) — les trois sont neutralisés **en local** par `retirerFichePDF()`, avec un `MutationObserver` pour les deux modales, construites à la demande. Le bouton « Recommencer » reste. Remplace **O-1** et rend **O-2** sans objet | ✅ |
| O-7 | 🔴 **Le seuil de l'ordre de grandeur est 5.** *« On n'utilise pas du tout la racine de dix au lycée. 5 comme frontière, c'est ce qu'on fait. »* `√10 ≈ 3,16` disparaît entièrement du dépôt pour la seconde — page `o1`, fiche A4 et cahier de vacances (`diag-j01`) compris. Aucune réponse d'exercice ne change ; seuls les textes bougent | ✅ |
| O-8 | 🔴 **Il n'y a pas de zéro ambigu en seconde.** *« 100, c'est trois chiffres significatifs. Basta. »* La règle 4 devient « les zéros à droite comptent », sans réserve — c'est la convention de la **fiche du collègue**. Le troisième état du compteur (orange) disparaît. Conséquence assumée : `2000 g` porte **quatre** chiffres significatifs. Clôt la question ouverte le 25/08 (**O-4**) | ✅ |
| O-9 | **Les nombres exacts prennent la place de l'ambiguïté** dans `o2` 1.1. Un nombre issu d'une **formule**, d'une **définition** ou d'un **dénombrement** n'est pas une mesure : il ne limite jamais la précision d'un résultat. Notion plus utile que celle qu'elle remplace — les élèves la rencontrent dès le premier calcul. L'exercice 2 de la section 2, qui portait entièrement sur `100`, devient l'exercice des nombres exacts | ✅ |
| O-10 | **La structure des « à retenir » en trois temps** — la règle (grande, centrée, seule) · le geste · le contrôle, plus « le piège » quand il y en a un. Appliquée aux **neuf** blocs des deux outils et aux deux fiches A4, sans bloc témoin préalable. Motif : *« beaucoup de texte, beaucoup de gras »* — quand tout est en gras, rien ne l'est. Devient une **convention de la famille** et vaudra pour `o3` à `o8` (`CONSIGNES-outil-PC.md` §3) | ✅ |
| O-11 | **La méthode de `o1` passe à cinq étapes.** L'ancienne 1.3 empilait les règles de calcul, le tableau des préfixes et quatre cas de conversion : elle se scinde en **1.3 Calculer avec des puissances de dix, et les préfixes** (`pc-o1-s1-prefixes`) et **1.4 Convertir : unités composées, volumes, surfaces** (`pc-o1-s1-convertir`). L'ordre de grandeur devient 1.5. Cinq est la limite haute admise par le §2 des consignes | ✅ |
| O-12 | **Un test après chaque bloc de contenu, dimensionné au bloc.** *« À chaque fois qu'on ajoute une nouvelle chose, il faudrait tout de suite pouvoir tester. »* Remplace la règle du §3 (« un `data-cloze` d'une ou deux cases, pas davantage »), que l'audit invalide. `o1` passe de 4 à 12 blocs de vérification et gagne deux QCM (6 et 10 questions) ; `o2` passe de 4 à 8 et gagne un QCM de 6 questions | ✅ |
| O-13 | **`o2` — un seul principe, deux lectures.** Un résultat ne peut pas être plus précis que la donnée la moins précise ; ce qui change, c'est le sens de « précis » — **en proportion** pour `×` et `÷` (on compte les chiffres significatifs), **en rang** pour `+` et `−` (on repère la colonne). Mène désormais les deux `.retain` et le bloc `.duo`. **Validé par Loïc le 27/08** | ✅ |
| O-14 | **Les deux règles de `o2` sont justifiées par l'expérience**, en faisant tourner l'intervalle de mesure dans le calcul (`2,5 × 3,42`, `1,25 + 0,025`, et le contre-exemple `250,0 + 5,0`). Marqués **○ support** : l'élève doit savoir appliquer la règle, comprendre d'où elle sort est un bonus | ✅ |
| O-15 | **L'incertitude relative `ΔA / A` est démotée** en note dépliable « pour plus tard », marquée **— non évalué**. Elle flottait sans emploi dans `o2` 1.2. Le vocabulaire de la précision **relative** reste (O-13), la formule ne s'exige plus | ✅ |
| O-16 | **Le `±` s'explique avant d'être employé** (`o2` 1.2) : ce qu'il dit (un intervalle), ce qu'il ne dit pas (ce n'est ni une erreur ni une maladresse — toute mesure en porte une), et d'où vient le nombre (le `.point-cle` sur `ΔA`, **déplacé** avant le schéma plutôt que répété) | ✅ |
| O-17 | **Les conversions de surfaces entrent dans `o1` 1.4** — tableau `km²`…`mm²`, règle du facteur 2, trois conversions. Elles n'existaient que dans une incise. **Sans les hectares** : arbitrage de Loïc du 27/08, on s'en tient aux unités du système | ✅ |
| O-18 | **`o1` 1.1 se valide à la lecture.** Son exercice de phrases à compléter n'apportait rien : supprimé. L'étape garde son `data-gate` — le lui retirer ferait voir à l'élève une pastille qui ne se coche jamais — et se valide quand le moteur **révèle l'étape suivante** (`etape-revelee`), en annonçant `etape-validee` comme les autres moteurs. Aucune comptabilité parallèle : c'est le moteur qui enregistre | ✅ |
| O-19 | **Plus de texte barré sur du contenu à lire.** `.eviter .faux` portait un `line-through` qui traversait chiffres et exposants — on ne lisait plus l'écriture qu'on doit apprendre à reconnaître. Remplacé par une croix rouge en tête de ligne | ✅ |
| O-20 | 🔴 **Plus de `text-transform:uppercase` sur un texte pouvant porter une unité ou une variable.** `Convertir 32 kg·L⁻¹ en g·cL⁻¹` s'affichait `32 KG·L⁻¹ EN G·CL⁻¹` — où `G` est le giga et où `CL` n'existe pas. Retiré de `.exemple-titre`, `.ex-lab` (« On isole a et n » devenait « ON ISOLE A ET N ») et `.saisie th` sur les deux pages, et des `.etq` des encadrés sur les deux fiches. Les étiquettes qui ne portent rien de scientifique gardent leurs capitales | ✅ |
| O-21 | **La case `#teacherMode` reste dans la page** alors que le mode enseignant est retiré de l'affichage. Le brief demandait de la supprimer ; **vérifié au navigateur, la page casse** : le moteur fait `document.getElementById('teacherMode').addEventListener(...)` **sans garde** (`sequence-snt.js` l.350) et toute son initialisation s'arrête — barre de progression et modales comprises. Sans le bloc `.ens-zone`, plus rien ne peut la cocher : elle est inerte | ✅ |
| O-22 | **La justification du seuil ne peut plus être celle des facteurs.** *« Les deux zones ont la même longueur »* et *« 5 est déjà du côté de 10 »* ne sont vraies que pour `√10` — sur un axe **linéaire** de 1 à 10, les deux zones font 4 et 5 unités. Le seuil est donc justifié par l'**arrondi** : en dessous de 5 on descend, à partir de 5 on monte. Le schéma passe en axe linéaire, graduations régulières, sans note sur les longueurs. **Proposition à valider** | ⏳ |

### Arbitrages du 28/08/2026 — outils `o3` à `o8`

Brief de Loïc du 28/08 après relecture des douze fiches papier de seconde de
l'an dernier. **Deux arbitrages traînaient depuis le 26/08** — le tri de la
verrerie et le nombre de niveaux — et avaient arrêté la production pendant deux
jours. La méthode change : chaque arbitrage porte désormais un **défaut appliqué
sans attendre**, marqué `PROPOSITION À VALIDER` dans le fichier produit et listé
dans le `A-LIRE`. Rien ne reste en suspens.

**O-27 fait exception : Loïc l'a tranché.** Ce n'est plus un arbitrage, c'est une
commande ; seule la rédaction reste à valider.

| # | Décision | Statut |
|---|---|---|
| O-23 | **Catalogue à huit outils, renumérotés dans l'ordre où un élève les rencontre** : `o3` sécurité · `o4` verrerie · `o5` compte rendu de TP · `o6` présenter un calcul · `o7` relation algébrique · `o8` graphique. Les numéros réservés en juillet ne correspondaient plus aux priorités, et **aucun des fichiers n'existait** : la renumérotation était gratuite ce jour, elle ne l'aurait plus jamais été. Elle ne touche ni un `data-cle`, ni un QR code, ni un lien — seulement deux fichiers de doc. **« Convertir » sort du catalogue** : `o1` en a absorbé tout le fond le 26/08, un outil dédié ferait doublon avec son étape 1.4 ; sa série de douze conversions rejoint la section 2 de `o1`. **Proposition à valider** | ⏳ |
| O-24 | **Le tri de la verrerie (`o4`) est double, et dans cet ordre.** Le brief de juillet demandait deux colonnes « précise / usage courant » ; la fiche du collègue trie *pour contenir* / *pour mesurer un volume* / *autre*, la précision n'étant qu'une sous-mention. Défaut retenu : le **tri fonctionnel de la source est le tri principal** — c'est son fond, on n'y touche pas — et la **précision devient une seconde lecture**, dans une étape à part, sous forme d'échelle ordonnée (bécher · erlenmeyer → éprouvette graduée → pipette graduée → pipette jaugée · fiole jaugée · burette). Motif : la compétence du programme est *« choisir la verrerie adaptée »*, elle demande le critère de précision — et ce critère est déjà **établi expérimentalement** dans le dépôt par le TP11, où l'on pèse l'eau prélevée avec cinq verreries. L'outil renvoie au TP, le TP justifie l'échelle. Rien n'est retiré à la source, un axe lui est ajouté. **Proposition à valider** | ⏳ |
| O-25 | 🔴 **Le modèle de rédaction d'un calcul est celui du cours en ligne, mot pour mot.** Trois vocabulaires coexistaient pour le même geste : les corrections des chapitres, le §4 des consignes, et la fiche du collègue en huit temps. Défaut retenu : **`Extraction des informations` → `Formule du cours` → `Manipulation d'expression algébrique` → `Application numérique` → `Conclusion`**. Motif : ce sont les étiquettes que l'élève voit dans **toutes** les corrections rédigées du site — 16 blocs en T1-C2, 33 en T1-C3, 25 en T1-C4, 17 en T2-C2, 13 en T3-C1. C'est déjà « le modèle mis en place dans le cours en ligne » ; l'outil ne fait que le **nommer**, et toute autre formulation créerait un troisième objet. Les deux temps propres à la fiche du collègue s'**absorbent** : *convertir en unités SI* et *attribuer un symbole à la grandeur cherchée* entrent dans **Extraction des informations** ; *le bon nombre de chiffres significatifs* devient le **contrôle de la Conclusion**. **Proposition à valider** | ⏳ |
| O-26 | **`o7` garde les cinq niveaux de la fiche de Loïc, avec un marquage d'évaluabilité qui fait le tri.** Le brief de juillet en demandait trois ; la fiche en compte cinq, chacun avec son titre de sa main, et les niveaux 4 et 5 emploient `√`, `10^x` et `log`. Défaut retenu : niveaux 1 à 3 `★` à savoir faire · niveau 4 `○` support · niveau 5 `—` non évalué, présenté comme un défi, **titre de Loïc conservé tel quel**. Rien n'est retiré de sa fiche, et rien d'inaccessible n'est exigé. Le `log` est hors programme de seconde : le dire en une ligne, ne pas l'enseigner. **Proposition à valider** | ⏳ |
| O-27 | 🔴 **`o3` gagne une cinquième étape : la conduite en cas d'incident.** Les douze fiches sources ne disent **rien** de ce qu'on fait quand ça arrive — projection dans l'œil, sur la peau, verre cassé, début d'incendie. C'était le seul manque de fond des douze fiches. Le cœur de l'étape : **prévenir immédiatement le professeur, toujours, même si ça paraît bénin** — et sa justification, qui est ce qui fait qu'un élève déclare vraiment un incident : *signaler un incident n'est jamais une faute, le cacher en est une*. Six situations, une ligne de geste chacune. Le contrôle est le repérage des cinq équipements **en entrant dans la salle**. Trois interdits : aucun conseil médical au-delà du rinçage à l'eau et de l'alerte, aucun geste où l'élève manipule un extincteur, aucun ton alarmiste. ⚠️ **La rédaction doit être vérifiée contre le règlement du laboratoire de l'établissement et les équipements réellement présents en salle 0.26** : c'est le seul contenu du chantier qui engage la sécurité d'élèves. **Tranché par Loïc le 28/08 ; seule la rédaction reste à valider** | ✅ |
| O-28 | **Le renvoi vidéo de `o5` reste, sur la page seulement.** `Fiche_guide - Rédiger un TP.pdf` renvoie à une vidéo YouTube (Gaelle Kroonen, « Réaliser un rapport de laboratoire »). Le §5 des consignes interdit les ressources **chargées** depuis l'extérieur ; un lien hypertexte n'en est pas une — rien ne part vers YouTube tant que l'élève ne clique pas, et aucune adresse IP n'est exposée au chargement de la page. Le lien vit dans une puce locale copiée de la `.video-chip` des chapitres, avec `target="_blank" rel="noopener"`. **Pas sur la fiche A4**, qui porte déjà son QR code vers la page. **Proposition à valider** | ⏳ |
| O-29 | **La numérotation de `Fiche_guide - Rédiger un TP` est refaite.** La source porte **deux rubriques n°6**, numérote le schéma `n°5` alors qu'il est imprimé après l'expérience, et sa conclusion renvoie aux « objectifs fixés dans le n°1 » alors que l'objectif est le n°2. Défaut retenu : **huit rubriques renumérotées proprement**, dans l'ordre que la numérotation de la source révèle — le schéma est bien pensé *avant* la manipulation : 1 titre · 2 objectif · 3 hypothèse(s) · 4 matériel · 5 schéma de l'expérience · 6 expérience · 7 observation et interprétation · 8 conclusion — et le renvoi final corrigé vers le **n°2**. Correction de forme sur un document de collègue : **à signaler à l'équipe** (`_suivi/erreurs-sources-fiches-outils.md`). **Proposition à valider** | ⏳ |

### Ce que le chantier des lots 2 à 8 ne touche pas

- **aligner les `.ex-lab` de `o1` et `o2` sur les cinq étiquettes d'O-25** : leurs
  libellés (`Les données, avec leur unité`, `L'application numérique`, `La phrase
  de conclusion`, `Le contrôle`…) sont proches mais pas identiques. **Les laisser
  tels quels** — c'est un audit, pas un lot. Ligne ouverte dans `_suivi/IDEES.md` ;
- **élargir le filtre `pagesSNT` de `verifier.mjs`** aux pages `2nde-pc-oN` ;
- **poser des renvois « outils utiles »** dans les quatorze chapitres — relève du
  brief transverse ;
- **modifier T2-C2**, même si `o8` en montre le besoin (son jeu `P = f(m)` est
  exactement celui du poids) ;
- **toucher à `_a-deposer/`** autrement qu'en lecture.

### Ce qui reste hors périmètre — à ne pas ouvrir sans commande

- l'**édition des exercices du cahier de vacances** (`diag-j01`) : seul le seuil
  y a été repris, rien d'autre ;
- l'**édition des exercices de la section 2 de `o2`**, sauf l'exercice 2 qui
  devait disparaître avec l'ambiguïté ;
- l'ordre des sections de la **fiche A4 de `o1`** (`01` forme · `02` ordre de
  grandeur · `03` préfixes · `04` calculatrice), qui ne suit pas celui de
  l'écran et s'en écarte un peu plus depuis la scission de l'étape 1.3. Elle
  tient en deux pages, c'est fragile : ne pas la réordonner sans commande.

### Corrections apportées aux documents source — à signaler à l'équipe

Les fiches OneDrive sont partagées avec des collègues : on refait la forme,
jamais le fond. Trois exceptions, qui sont des erreurs de calcul.

| Document | Erreur | Correction |
|---|---|---|
| `fiche (correction)_Convertir.pdf` | La ligne `379,45 kW` reprend par copier-coller les valeurs de la ligne précédente (`358 × 10³ W`) et aboutit à `3,58 × 10⁻⁴ GW` | `379,45 kW = 3,7945 × 10⁵ W` = **`3,7945 × 10⁻⁴ GW`** |
| `fiche (correction)_Manipuler une relation algébrique.pdf`, niveau 1 | `a = b/c` donne `c = b/c` | `c = ` **`b/a`** — *à appliquer au lot 3* |
| Brief du 25/08, §6.2 exercice 6 | « 47 ordres de grandeur d'écart » entre `1,66 × 10⁻²⁴` et `1,66 × 10²²` | **46** : l'écart des exposants vaut `22 − (−24) = 46`, soit un facteur `10⁴⁶` |

### Trois propriétés du moteur qui piègent les réponses NUMÉRIQUES

Découvertes et **mesurées** en produisant `o1` et `o2`. Le moteur a été conçu
pour des mots ; ces trois comportements sont inoffensifs sur du texte et
nuisibles sur des nombres. Consignées dans `_modeles/CONSIGNES-outil-PC.md` §6.

| # | Constat | Contournement retenu |
|---|---|---|
| M-1 | **`normaliser()` efface le signe moins** : `-3` et `3` donnent tous deux `3`, et `10^-3` devient indistinguable de `10^3`. Un élève qui oublie le signe de l'exposant — l'erreur la plus fréquente — serait compté juste, en vert, sans rien voir | **Le signe passe par un `<select>`**, corrigé à l'exact et sans Levenshtein. Les `value` sont des jetons distincts après normalisation (`pos` / `neg`), jamais `+` / `−`, qui se normalisent tous deux en chaîne vide. Vérifié : un signe faux est refusé, et le menu est marqué `revoir` |
| M-2 | **Levenshtein tolère une faute au-delà de 4 caractères.** Mesuré : `255,1` est accepté pour `255,0`, `9,6486` pour `9,6485` — marqués « presque », avec la bonne valeur réécrite dans la case et signalée à l'élève | Réponses courtes partout où c'est possible (`0,20`, `1,28`, `8,6`, entiers) : `seuil()` y vaut 0. Au-delà de trois chiffres significatifs, la tolérance existe et **on l'assume** — l'élève voit la bonne valeur, et le corrigé rédigé est juste dessous. Corriger `seuil()` toucherait le moteur partagé |
| M-3 | **Une réponse en un seul champ est illisible** : `5,25×10⁶` saisi de six manières se normalise de six manières, et les exposants Unicode (`10⁻¹⁹`) disparaissent purement et simplement | **Une colonne par décision** : nombre, puis `a`, puis le signe de `n`, puis `n`. Chaque case ne porte qu'un choix, et chaque choix est vérifiable à l'exact |

### Trois pièges d'outillage, à ne pas réapprendre

| # | Piège | Ce qu'il faut faire |
|---|---|---|
| P-1 | **`.res` existe déjà dans `sequence-snt.css`**, en `display:flex; flex-direction:column`. Un encadré de résultat nommé ainsi éclate en trois lignes, sans erreur ni avertissement | Comparer **par script** les classes du `<style>` inline avec celles de la feuille partagée, avant de livrer. Classe renommée en `.encadre` |
| P-2 | **`verifier.mjs` cherche le nom du sommaire généré, extension comprise, dans TOUT le HTML — commentaires inclus.** Un commentaire disant « ce fichier n'est pas chargé » faisait échouer le contrôle de version | Écrire le nom sans son extension : « le sommaire généré (`assets/js/seances-snt`) » |
| P-3 | **Le mode headless de Chrome impose une largeur de mise en page minimale d'environ 500 px.** Une capture demandée à 390 px **rogne** au lieu de replier : on croit voir un défaut qui n'existe pas, ou l'on manque celui qui existe | Mesurer le `scrollWidth` dans une **iframe** de 390 px, et capturer cette iframe depuis une fenêtre plus large |

### Ce que `verifier.mjs` ne voit pas sur un outil

Son filtre `pagesSNT` ne retient que les pages `2nde-snt-tN` et `2nde-snt-mN` :
une page `2nde-pc-oN-…` n'y entre pas. Trois contrôles ne s'appliquent donc
**pas** aux outils et sont tenus à la main : couleurs en dur hors `:root`,
`localStorage` interdit, unicité des `data-cle` d'étape. Le contrôle des versions
d'assets, lui, balaie tout `pages/` et les couvre bien — c'est la raison d'être
de D3. **Élargir le filtre est une modification de `verifier.mjs`, hors périmètre
du chantier des outils.** ⏳

---

## Outils PC — les PDF sources reçus le 26/08/2026

Loïc a transmis les **neuf fiches sources**. Elles confirment une partie du
cadrage, en corrigent une autre, et débloquent les lots 2 et 3.

### Ce qu'elles ajoutent à `o1` et `o2` — du fond qui manquait

| # | Ajout | D'où il vient |
|---|---|---|
| S-1 | **Les quatre règles de calcul sur les puissances de dix** — `a·10^m × b·10^n = ab·10^(m+n)` · `(a·10^m)/(b·10^n) = (a/b)·10^(m−n)` · `1/aⁿ = a⁻ⁿ` · `(a·10^m)ⁿ = aⁿ·10^(m·n)`. Elles **prouvent** ce que la V1 se contentait d'affirmer : pourquoi les exposants s'ajoutent, pourquoi le dénominateur change de signe, pourquoi les volumes se multiplient par 3 | `fiche_Ecriture scientifique…pdf` |
| S-2 | **La conversion vers un préfixe** (et non vers l'unité de base) : « le signe de la puissance + devient − et − devient + », avec ses quatre exemples. La V1 ne traitait que le trajet vers l'unité de base puis d'un préfixe à l'autre | `fiche_Convertir.pdf` |
| S-3 | **Les trois équivalences de volume** (`1 dm³ = 1 L` · `1 m³ = 1000 L` · `1 cm³ = 1 mL`, « retenir une seule des trois ») et le **tableau qui aligne** m³/dm³/cm³/mm³ sur kL…mL | `fiche_Convertir.pdf` |
| S-4 | **`003,20`** — le seul nombre qui porte les **deux** familles de zéros : ceux de gauche s'effacent, celui de droite non. C'est l'exemple que la source a choisi, et il vaut mieux que deux nombres séparés | `fiche_Ecriture scientifique…pdf` |
| S-5 | **L'incertitude relative `ΔA/A`**, et la **seconde** façon d'estimer `ΔA` : la moitié de l'unité du **dernier rang affiché** sur un appareil à écran. La V1 ne donnait que la demi-graduation d'un instrument gradué | `fiche_Ecriture scientifique…pdf` |

**Ce que ces ajouts ont coûté sur la fiche A4 de `o1`** : la table des **dix-huit
repères d'échelle**, ajoutée le 25/08 au titre du §11, est réduite à ses **trois
bornes** (atome · toi · Terre). Arbitrage assumé : elle est marquée ○ **support**
à l'écran, où la frise reste entière et bien plus lisible qu'une table ; les
quatre règles de calcul, elles, sont ★★. **Le fond passe avant le support.**

### 🔴 O-4 rouvert : ce que la source dit vraiment des zéros de fin

La fiche du collègue **affirme** deux choses que la V1 avait nuancées :

> « Les zéros situés à gauche du nombre ne sont pas significatifs, **ceux situés
> à droite le sont**. »
> « **50 n'a que deux chiffres significatifs** alors que 6,20 en a 3. »

Appliquée à la lettre, cette règle donne **`100` → 3 chiffres significatifs**.
Or le brief de Loïc demandait, à l'exercice 2, **`100` → 1 chiffre significatif,
l'écriture étant ambiguë**.

**La contradiction n'est donc pas interne à l'outil : elle est entre la fiche du
collègue et le brief.** Trois issues, et c'est du fond :

1. **suivre la source** — les zéros de fin comptent : `50` → 2, `100` → 3. Il
   faut alors réécrire l'exercice 2, qui perd sa raison d'être ;
2. **suivre le brief** — les zéros de fin d'un entier sont ambigus : `100` → 1,
   et `50` → 1 aussi, ce qui casse l'exemple `6,20 ÷ 50 = 0,12` de la source ;
3. **la voie tenue en V1** — l'ambiguïté est nommée et devient la leçon : elle
   justifie l'écriture scientifique, donc l'outil 1. Le compteur la montre en
   orange, troisième couleur. `50` reste à 2 chiffres *dans ce contexte*, parce
   que l'énoncé le pose comme une mesure ; `100`, sans contexte, reste ambigu.

La V1 tient la troisième. **Elle nuance une affirmation du collègue** — et la
règle du dépôt est « on refait la forme, jamais le fond ». ⏳ **À trancher.**

### Trois erreurs de plus dans les corrigés sources — à signaler à l'équipe

Toutes recalculées en fractions exactes.

| Document | Ce qui est écrit | Ce qui est juste |
|---|---|---|
| `fiche (correction)_Convertir.pdf`, ligne `379,45 kW` | `= 358 × 10³ W = … = 3,58 × 10⁻⁴ GW` — les valeurs de la ligne précédente ont été recopiées | **`3,7945 × 10⁻⁴ GW`** *(déjà signalé le 25/08, confirmé par la source)* |
| `fiche (correction)_Convertir.pdf`, ligne `5933 dag·cm⁻³` | Le **résultat final `5,933 × 10¹⁸ cg·hm⁻³` est juste**, mais **toutes les lignes intermédiaires sont fausses** : le corrigé prend `1 dag = 10² g` au lieu de `10¹`, ce qui décale tout d'un facteur 10, puis une seconde erreur (`10¹³` écrit `= 5,933×10¹⁸ × 10⁻⁶`, qui vaut `10¹²`) ramène par hasard au bon résultat | Lignes justes : `5,933×10⁴ g·cm⁻³` → `5,933×10⁶ cg·cm⁻³` → `5,933×10¹² cg·m⁻³` → `5,933×10¹⁸ cg·hm⁻³`. **Un élève qui suit ligne à ligne est perdu** |
| `fiche (correction)_Convertir.pdf`, ligne `0,98 m·s⁻¹` | `= 3,528 km·h⁻¹` — **quatre** chiffres significatifs pour une donnée qui en a **deux** | **`3,5 km·h⁻¹`**. C'est exactement ce que l'outil 2 sert à empêcher, et les deux fiches du même auteur se contredisent |
| `fiche (correction)_Manipuler…pdf`, niveau 1 | `a = b/c` donne `c = b/c` | `c = ` **`b/a`** *(déjà signalé, confirmé)* |
| `fiche (correction)_Manipuler…pdf`, niveau 5 | `d − e = R` donne `e = R − d` | `e = ` **`d − R`** — le signe est inversé |

### Deux écarts entre le brief et les sources, pour les lots suivants

| Lot | Le brief disait | La source dit | ⏳ |
|---|---|---|---|
| **2 — `o3` verrerie** | trier en **« précise »** (fiole jaugée, pipettes, burette) / **« usage courant »** (bécher, erlenmeyer, éprouvette, tube à essai) | trier en **« pour contenir »** (bécher, erlenmeyer, tube à essai, fiole jaugée, verre à pied, cristallisoir, coupelle, ballon) / **« pour mesurer un volume »** (éprouvette, pipette graduée, pipette jaugée, propipette, burette) / **« autre »** (entonnoir, ampoule à décanter, réfrigérant) — la précision étant une **sous-mention** de chaque pièce | ⏳ |
| **2 — `o3` pictogrammes** | libellés « Nocif, irritant » et « Danger pour la santé » | libellés exacts du collègue : **« DANGEREUX POUR LA SANTE »** (point d'exclamation) et **« TRÈS DANGEREUX POUR LA SANTE »** (silhouette). Trois familles : dangers **physiques** (5), pour la **santé** (4), pour l'**environnement** (1) | ✅ on suit la source |
| **3 — `o4` niveaux** | « les trois niveaux de la fiche source » | la source en compte **cinq** : N4 ajoute `√(b−d²)/c` et `10^(b−d)/√c`, N5 ajoute `log(a/b) = ∛(c/(d−e)²)`. Chacun porte un titre de la main de Loïc (« C'est moi le patron ! ») | ⏳ garder 3 ou aller à 5 ? |

### Les quatre outils réservés ont désormais leur source

`fiche_Convertir.pdf` → **o5** · `fiche_Présenter un calcul.pdf` → **o6** ·
`fiche_Construire un graphique.pdf` → **o7** · `Fiche_guide - Rédiger un TP.pdf`
→ **o8**. Rien n'est à produire sans commande.

⚠ `fiche_Présenter un calcul.pdf` donne la méthode de rédaction d'un calcul **du
collègue**, en huit temps. Elle recouvre les quatre règles du livret CFA
retenues au §4 des consignes, plus la **conversion en unités du système
international** et l'attribution d'un **symbole** à la grandeur cherchée. Quand
`o6` sera commandé, c'est cette version-là qui fera référence, et il faudra
décider si les outils déjà écrits s'y alignent.

⚠ `fiche_La dissolution.pdf` ne correspond à **aucun** des huit outils : c'est du
contenu de chapitre (solutions aqueuses, `T1-C5`). Son encadré sur le **ménisque**
est en revanche celui que le brief demandait de reprendre dans `o3`.

---

## Dépôt des DS et des TP en physique-chimie — 26/08/2026

Cadrage : `BRIEF-CLAUDE-CODE-DS-TP-PC.md`. Sept décisions de Loïc, en vigueur.

| # | Décision | Statut |
|---|---|---|
| D1 | **Les corrections restent hors ligne**, transmises par mail contre preuve de travail. Aucun mécanisme de déblocage n'est construit. Le chip SharePoint « DS 2024/2025 (corrigé) » de `c1` reste tel quel | ✅ |
| D2 | Les sujets sont déposés **avec leur numérotation actuelle** (DS1…DS6, TP01…TP15), héritée d'une progression antérieure. Pas de renumérotation | ✅ |
| D3 | La puce `Exercices 🚧` **disparaît des 14 cartes** du hub, y compris celles qui ne reçoivent rien | ✅ |
| D4 | Un sujet est lié à **tous** les chapitres qu'il couvre, vers le même fichier | ✅ |
| D5 | **Seuls les PDF de sujet** rejoignent le dépôt. Docx, corrections, ressources annexes, code et tableurs restent dehors tant qu'ils ne sont pas triés | ✅ |
| D6 | **T3-C5 « Formation d'une image » : carte au hub, sans page de cours.** Le TP13 tient lieu de cours — la notion est intégralement reprise en première et en terminale | ✅ *(carte créée le 26/08, texte à valider)* |
| D7 | **Aucune formulation d'attente sur cette carte** : ni « cours à venir », ni « en travaux », ni `🚧`. C'est la forme retenue, pas un chantier | ✅ |

**D8 (26/08, tranché par Loïc au §7 du brief)** — ✅ **Aucun fichier portant un
nom de classe ou une date de séance ne rejoint le dépôt.** Exclusion, pas
question ouverte : `TP10 2de6 GP1 03-02-2023.xlsx` et les deux
`TP11 2de6 GP1/GP2 27-01-2023.py` restent définitivement hors dépôt.

**Conséquence technique du 26/08** : `_a-deposer/` — le dossier de travail où
arrivent les sujets bruts — n'était **pas** ignoré par git. Ajouté à
`.gitignore`. Sans cela, un `git add -A` publiait les 130 fichiers du lot,
corrections et données de classe comprises.

**Écarts du brief tranchés en le disant** (26/08, à confirmer) : `c7` est traité
au lot 1 alors que le §0 l'en excluait — le §3.2 lui attribue le TP15 et il est
du thème 1. Les noms de fichiers suivent la règle du §5 (`ds1-t1c1.pdf`), pas les
exemples du §4.1 qui la contredisaient.

---

## 27/08/2026 — Audit 3 de T3-C1 : huit arbitrages de Loïc

**Statut : en vigueur.** Tranchés par Loïc en séance, appliqués dans la foulée.

| # | Question | Décision |
|---|---|---|
| 1 | Seuil de danger : 80 ou 85 dB(A) ? | **80 dB conservé.** C'est la valeur de la source et celle du DS4 déjà en ligne. 85 dB(A) est le seuil d'action réglementaire, 80 le seuil d'alerte : l'écart est réel, mais aligner le cours obligerait à reprendre un PDF déjà distribué. |
| 2 | « Le son d'un éclair » | **Corrigé en « tonnerre ».** Formulation, pas physique. L'énoncé dit maintenant « Tu vois un éclair, puis le tonnerre te parvient 9 secondes plus tard ». |
| 3 | 3,06 km à partir d'un « 9 s » | **Arrondi à 3 km.** Trois chiffres significatifs pour une donnée qui n'en porte qu'un. La correction explique pourquoi, et donne au passage le repère « 3 secondes pour 1 km ». |
| 4 | Notation de la célérité : `c_son` ou `v` ? | **`c_son` gardé, `v` mentionné.** La notation du programme reste celle du cours ; un aparté prévient que les sujets de devoir écrivent `v`. Le DS4, déjà en ligne en PDF, ne bouge pas. |
| 5 | L'exercice d'écho : en remplacement du 6 ou en plus ? | **En plus.** L'exercice 6 (la baleine) reste comme marche intermédiaire — un trajet simple — avant l'aller-retour. L'écho devient l'exercice 7. |
| 6 | L'accroche du chapitre | **Une « partie 0 » ajoutée devant**, le paragraphe d'ouverture conservé tel quel. Trois paragraphes hors numérotation, avec lettrine. |
| 7 | Le saxophone : repère ou médaillon ? | **Repère « anche » sur le bec**, même traitement que la guitare. L'annotation est dessinée dans le PNG lui-même. |
| 8 | L'erreur relative, demandée au DS4 | **Rien ajouté au cours** : elle relève du TP5/TP6. Signalée, non écrite. |

**Ce qui reste ouvert.** Le doublon `22 p.266`, cité en face de deux compétences différentes
de la checklist DS (`ds4` période/fréquence et `ds7` intensité/niveau), n'est **pas tranché** :
il faut le manuel, qui n'est pas dans le dépôt. Deux compétences n'ont par ailleurs aucun
exercice de manuel en face : `ds1` (caisse de résonance) et `ds6` (fréquence → hauteur).

---

## 27/08/2026 — `chapitre-commun.css` passe en `?v=7`, dans 17 fichiers et non 14

**Statut : en vigueur.** L'audit 3 ajoute à la feuille commune l'agrandissement d'une figure
au clic (lot F1) et l'habillage du pilote d'une figure animée (F2).

Le brief et `CLAUDE.md` parlent des « 14 pages PC ». **Le dépôt en compte 17** qui chargent
cette feuille : les 14 chapitres de physique-chimie, `_modeles/gabarit-chapitre.html`, et les
**deux pages d'enseignement scientifique de Terminale** (`term-es-t2-c1`, `term-es-t2-c2`).
Les trois dernières auraient servi l'ancienne feuille depuis le cache. Le `?v=N` doit donc être
incrémenté dans **17 fichiers**, et la consigne devrait être corrigée en ce sens.

---

## 28/08/2026 — L'ornement des encarts « Histoire des sciences » : variante B

**Statut : en vigueur.** Tranché par Loïc. Ce n'était pas une question de goût :
le fleuron `U+2766` n'existe dans **aucune** des vingt-deux polices auto-hébergées
du dépôt — les sous-ensembles latins s'arrêtent à la ponctuation courante. Il
s'affichait donc **par repli sur une police système** : dessin variable d'un
appareil à l'autre, rendu possible en emoji couleur, tofu possible.

**Retenu — variante B :** de part et d'autre du libellé, en partant de l'extérieur,
un **filet horizontal court** puis un **losange plein**. Symétrique, **tout en CSS**,
zéro glyphe, zéro SVG, zéro image. Le losange est un carré de 5px tourné à 45°
(7,1px de diagonale, la place lui est réservée par des marges de 1,05px).

Ce que la production a ajouté au brief, et pourquoi :

- **`text-align:center` conservé en plus de `justify-content:center`.** Le brief
  demandait de le remplacer. Mesuré à 390px : le libellé passe sur deux lignes, et
  sans `text-align` les deux lignes se collent à gauche dans leur item de flex —
  la seconde laissait un grand vide face au losange de droite. Les deux propriétés
  ne font pas le même travail : l'une place les items, l'autre les lignes de texte.
- **`print-color-adjust:exact`.** Filets et losanges sont des arrière-plans ;
  l'ancien fleuron était du texte. Sans cette ligne, l'ornement disparaît quand le
  navigateur n'imprime pas les graphiques d'arrière-plan.
- **Le losange est resté un fond plein, pas quatre bordures.** La variante en
  bordures s'imprime en toutes circonstances, mais Chrome arrondit une bordure de
  2,5px à 2px sur un écran non-Retina : le losange y perdait un cinquième de sa
  taille. Mesuré : 288,80px de large avec le fond, 286,80px avec les bordures.

Portée : la modification tient en **une règle** de `assets/css/chapitre-commun.css`,
partagée. Elle touche donc les **dix encarts** des sept fichiers concernés, dont
`term-es-t2-c1`, qui **n'est pas de la seconde**. C'est voulu — l'ornement doit
rester unique sur le site.

Contrôles passés : plus aucune occurrence du fleuron dans le dépôt · `?v=8` dans
les 17 fichiers · symétrie mesurée au pixel (12,00px de chaque côté entre filet et
losange) · centre du losange à **0,22px** de la médiane des capitales · rendu à
1200px, 500px et 390px · simulation photocopie (niveaux de gris + seuil dur) :
filets et losanges survivent.

---

## 28/08/2026 — Les fiches de 2nde PC se distribuent en PDF

**Statut : en vigueur.** Tranché par Loïc. La consigne **ne vaut que pour la
seconde physique-chimie** — ni SNT, ni CFA, ni enseignement scientifique.

**Deux distributions, deux libellés :**

| Famille | Qui imprime | Point d'entrée | Ce que dit le lien |
|---|---|---|---|
| Chapitres de 2nde PC | **Loïc**, et il distribue en classe | `.fiche-vierge.hors-verrou`, en haut du cours | « Télécharger la fiche de cours (PDF, vierge) » · *la feuille distribuée en classe, à compléter* |
| Outils transversaux `o1`…`oN` | **l'élève**, quand il en a besoin | le hub PC **et** la page de l'outil | « Fiche outil (PDF) — la méthode complète, à imprimer et à coller » |

Libellés = **propositions à valider**. Le lien d'un outil n'est jamais derrière un
verrou : l'outil est ouvert toute l'année, sa fiche aussi.

🔴 **Le HTML est la source, le PDF est un export. Jamais l'inverse.** Un PDF
corrigé à la main serait écrasé au premier export suivant, et les deux
divergeraient sans que rien ne le signale. L'export est scripté —
`node exporter-fiches.mjs` — et **contrôle à la mesure** : format
`209,9 × 297,0 mm`, une `.feuille` de la source pour une page du PDF, polices
auto-hébergées incorporées. Il refuse de valider un export en écart.

Ce que la production a changé par rapport au brief :

- **Le nombre de pages n'est pas figé fiche par fiche.** Le brief prévoyait un
  nombre arrêté ; la source le dit déjà, une `.feuille` valant une page. Le
  contrôle est devenu « une feuille dedans, une page dehors », qui attrape le
  débordement d'un paragraphe ajouté sans y penser. Constaté à l'export :
  `t1c2` fait **10 pages**, `t1c4` **6** — ce sont bien des fiches longues, pas
  un débordement.
- **Le script ne tient pas de liste de fiches**, il lit `fiches/`. Décidé après
  avoir vu `o3` puis `o4` apparaître pendant la session : une liste tenue à la
  main dérive.

Ce qui **ne change pas** : le QR code des fiches d'outils continue de pointer vers
la **page en ligne** de l'outil, pas vers le PDF.

**Reste ouvert — les caractères servis par une police système.** L'export mesure
que six fiches sur six contiennent des caractères qu'aucune de nos six familles ne
couvre : exposants et indices Unicode (`⁺` `⁻¹` `₆`), symboles (`⩽` `⩾` `≈` `✓` `⚠`
`⚙` `π` `Δ`), et dans `o3`/`o4` les libellés en Arial des planches SVG (55 et
plusieurs dizaines de glyphes). Même piège que le fleuron ci-dessus, mais sur du
contenu : c'est **du fond**, rien n'a été touché.

---

## 02/09/2026 — Audit T1-C3 et lot transverse : ce qui a été tranché

**En vigueur.** Appliqué le jour même, sur les deux briefs d'audit du 02/09.

### T-01 · Les puissances de dix s'écrivent en balise, jamais en Unicode

`10⁻²⁷` saisi en caractères Unicode oblige le navigateur à chercher une police de
substitution **pour le seul signe moins** — IBM Plex Mono n'a pas ces glyphes — et
le signe arrive avec sa propre hauteur d'exposant. Le défaut est invisible dans un
éditeur et systématique à l'écran. La forme retenue est `10<sup>−27</sup>`, avec le
vrai signe moins U+2212.

**Ce qui ne bouge pas :** les **charges chimiques** (`Cl⁻`, `O²⁻`, `Fe³⁺`, `p⁺`,
`n⁰`, `e⁻`) et les **configurations électroniques** (`1s² 2s² 2p⁶`) restent en
Unicode. Elles font partie de l'écriture du symbole chimique, elles s'affichent en
police sérif où le rendu est correct, et les convertir casserait les recherches
plein texte.

**Étendu au-delà du brief :** les **exposants d'unité** (`kg⁻¹`, `m·s⁻¹`,
`g·mol⁻¹`, `cm³`) souffrent exactement du même défaut, plusieurs étant dans des
`.nb` en IBM Plex Mono. Ils sont passés en balise eux aussi. En SVG, où `<sup>`
n'existe pas, l'exposant se pose en `<tspan>` avec un `dy` et une taille
**absolue en px**.

### T-02 · La notation A/Z X quitte le `<style>` de T1-C3 pour le CSS commun

T1-C6 et T1-C7 en auront besoin. `.azx` et `.azx .az` vivent désormais dans
`assets/css/chapitre-commun.css`.

**Le correctif n'est pas celui que le brief envisageait.** Le brief proposait
`align-items: baseline` ou un empilement en `<sup>`/`<sub>`. La voie retenue est
une troisième : **`.azx` repasse en flux inline pur**, sans `inline-flex`. Le
symbole chimique redevient un nœud texte, il repose donc sur la ligne de base par
construction, et non par un réglage à ajuster. Mesuré en rendu réel sur les
24 notations de la page : **écart 0,00 px**.

**Le `.resultat` qui rayait le Z n'était pas un défaut indépendant** — c'était une
conséquence du précédent. Le brief le traitait comme un point séparé et proposait
un `padding-bottom`. Ce padding seul ne suffisait pas : le trait restait 4,86 px
trop haut. Une fois la colonne A/Z correctement calée
(`vertical-align: .8em`, centrage mesuré à 0,02 px près), le padding nécessaire
**tombe de 0,62 em à 0,16 em**. Le trait passe 5,7 px sous le bas du Z.

`chapitre-commun.css` passe en **`?v=9`** sur ses 17 fichiers.

### T-03 · Un seul format d'année en pied de page : `© 2026/2027`

Quatre formats coexistaient (`© 2025`, `© 2025/2026`, `© 2025-2026`, `© 2026`) —
le brief n'en avait relevé que trois. Vingt et une pages de `pages/` sont alignées.
`2nde-snt.html` reste dehors : le périmètre posé par Loïc pour cette passe est la
physique-chimie de seconde.

Au passage, les **quatre chapitres du thème 3** portaient un pied de page
identique, sans numéro de chapitre : on ne pouvait pas les distinguer. Ils portent
désormais « Thème 3, Chapitre N — Ondes et signaux ». Le **fil d'ariane**, lui,
garde la forme commune à tous les chapitres (« Thème N — nom du thème »).

### T-04 · Les liens « DS (corrigé) » sont retirés

Quatre pages (t1-c1 à t1-c4) portaient un lien SharePoint public vers un sujet de
DS **corrigé**, dont deux vers le même fichier. Cela contredisait la règle du
projet : les corrections ne sont pas publiées, elles sont distribuées par courriel
contre preuve de travail. Les liens vers les **sujets** (`assets/pdf/pc/ds/`) sont
conservés. Plus aucun lien SharePoint ne subsiste dans `pages/`.

### T1C3-01 · L'Image 10 est supprimée (arbitrage Q1 du brief chapitre)

La figure « principe de rangement » précédait immédiatement le tableau périodique
complet, qui dit la même chose en mieux, et sa flèche « de gauche à droite »
contredisait le saut visible entre Mg et B. Les figures sont renumérotées 1 → 10.
Le fichier `t1c3-fig-classification-principe.svg` reste sur disque, plus référencé
par aucune page.

### T1C3-02 · Les autres arbitrages du brief chapitre, tranchés par défaut

- **Q2** — l'ion F²⁻ de l'exercice 12 devient le **difluor F₂** : le fluor ne forme
  que F⁻, et le difluor appartient bien à l'élément fluor, ce qui est un piège plus
  formateur.
- **Q3** — le « À retenir » du bandeau de frise **sort de la construction** et
  devient un paragraphe sous la frise.
- **Q4** — le second élément de l'Image 9 est le **cuivre**.
- **Q5** — l'exemple travaillé du lithium 7 n'a pas été ajouté en partie 03 : la
  décision D2 le fait déjà vivre dans l'Image 8 et sa légende, et la partie 03 est
  déjà dense. **À rouvrir si Loïc le souhaite.**

### T1C3-03 · Deux points du brief sont tombés sans objet

- **C3** — le composant `.notation-noyau`, dont le brief demandait de retirer le
  `position:absolute`, n'a **aucune occurrence dans le HTML** : c'était du CSS
  mort. Les règles ont été supprimées plutôt que refactorées.
- **D1** — le fichier `Isotope_CNO.svg` annoncé comme fourni **n'est pas dans le
  dépôt**. La grille maison, qui porte déjà le carbone, l'azote et l'oxygène, a été
  conservée et refaite. **Conséquence favorable : aucune attribution CC BY-SA n'est
  due.** Détail dans `_suivi/t1c3-releve.md`.

### En attente d'un arbitrage de Loïc

- Les compétences **`ds2` et `ds3`** de T1-C3 partagent des références de manuel
  identiques (`man. 15 p.81 | 22 p.83`). C'est la **seule duplication stricte du
  site** — le brief la disait générale, le relevé sur les 11 chapitres qui portent
  une checklist dit l'inverse. Rien n'a été réattribué.
- Le vrai défaut général des checklists est ailleurs : **tout le thème 3 est nu**
  (19 compétences sans aucune référence de manuel, dont 7 sur t3-c1, 6 sur t3-c3 et
  6 sur t3-c4). Rattacher des exercices à des compétences relève du fond.
- Les **outils transversaux `o1`…`o8`** sont restés hors de la passe sur les
  puissances de dix : ils tournent sur le moteur SNT et ne chargent pas
  `chapitre-commun.css`, donc la règle `sup` ne s'y applique pas. `o1`
  « écriture scientifique » en compte **73 occurrences** — il faudra sa propre
  règle dans `sequence-snt.css`.

---

## 05/09/2026 — Les outils transversaux passent sous les chapitres, et six d'entre eux ferment

**En vigueur.** Appliqué le jour même sur `pages/2nde-physique-chimie.html` et
`index.html`. Demande de Loïc.

### O-30 · La section « Outils transversaux » se place APRÈS les trois thèmes

L'ordre du 25/08 mettait les outils **en tête du hub**, au motif qu'ils sont hors
progression et ouverts toute l'année. Motif retenu contre lui : ce qui est ouvert
toute l'année n'est pas pour autant ce qu'on vient chercher en premier. L'élève
arrive sur le hub pour **le chapitre de la semaine** — c'est la progression qui
fait sa chronologie, et huit cartes d'outils entre lui et le thème 1 repoussaient
les chapitres sous la ligne de flottaison. Les outils sont une **boîte à outils**,
consultée au besoin : ils ferment la page. Mesuré après déplacement, le thème 1
commence à **461 px** au lieu de ~1 300, et la section des outils à 2 283 px.

Le commentaire du fichier qui justifiait l'ordre inverse a été **réécrit**, pas
surchargé.

### O-31 · Seuls `o1` et `o2` restent ouverts ; `o3` à `o8` sont marqués « en travaux »

Les huit outils sont **écrits** depuis le 28/08, mais aucun n'est validé et les
arbitrages O-22 à O-29 restent en attente. Défaut retenu : **ne pas exposer aux
élèves un contenu qui n'a pas été relu**, `o3` en particulier — sa cinquième
étape engage la sécurité en salle 0.26 et sa rédaction doit encore être vérifiée
contre le règlement du laboratoire (O-27).

Forme retenue : **la carte reste visible**, avec son titre et son résumé — l'élève
voit ce qui arrivera — et ses deux liens sont remplacés par **une mention unique**
`.a-venir` « Cours et fiche 🚧 », doublée pour les lecteurs d'écran. Pas de lien
mort, pas de carte escamotée. C'est le mécanisme déjà employé dix fois sur ce hub
pour les TP et les évaluations à venir, et déjà appliqué à `o3`/`o4` dans la
colonne « Fiches-outils » de l'accueil : le geste **aligne le hub sur l'accueil**,
il n'invente rien.

**Ce que cela ne fait pas.** Les six pages et leurs six PDF **restent en ligne et
atteignables par leur URL** — le dépôt est public, retirer un lien ne ferme pas la
porte. Vérifié : aucune autre page du dépôt ne pointe vers `o3`…`o8`, le hub était
leur unique point d'entrée. Ce qui est visé est l'exposition aux élèves, pas le
secret.

**Comment on rouvre un outil :** rendre à sa liste `.docs` ses deux entrées de
liens. Rien d'autre n'a été retiré — ni page, ni PDF, ni fiche source.

### O-32 · Le libellé de `o4` sur l'accueil est corrigé

`index.html` annonçait `o4` « Calcul littéral » — un reste de la numérotation
d'avant O-23, où `o4` désignait autre chose. L'outil 4 est **« La verrerie et le
matériel »**. Corrigé.
