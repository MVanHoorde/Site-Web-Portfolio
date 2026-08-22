# État du projet

> **Réécrit** à chaque session, jamais empilé. Ce fichier décrit **l'état
> courant** — jamais comment on y est arrivé.
> Historique → `JOURNAL.md` · décisions → `DECISIONS.md` · détail par chapitre →
> `chapitres.md` · contexte et règles → `CLAUDE.md` · index → `MANIFESTE.md`.
>
> Dernière réécriture : **22/08/2026**
> Site : https://mvanhoorde.github.io/Site-Web-Portfolio/ · Repo : MVanHoorde/Site-Web-Portfolio

---


> 🔗 **Pour reprendre une session interrompue, lire `REPRISE.md` à la racine.**
> Il contient l'état au 01/08/2026, les bugs connus non corrigés, les décisions
> en attente et les pièges rencontrés.

## Où on en est

| Partie | État |
|---|---|
| **PC seconde** | 14 chapitres en ligne. T1-C1→C4 dégrossis à fond ; les 10 autres portent **206 blocs `.a-faire`**. Aucun cours validé. |
| **SNT** | 8 séquences de thème (t0→t7) **+ 1 module transversal** (`m1` « Représenter l'information », écrit le 21/08). `t1` et `t2` sur le moteur partagé ; `t0`, `t1`, `t2` en V0 complète ; `t3`→`t7` en V0 partielle (S1 rédigée, suite en 🚧). Aucune validée. **`t1` est en cours de validation** — voir sa ligne. |
| **SNT — plafond d'avance** | 🆕 Écrit le 20/08, **branché sur `t0`, `t1`, `t2` et le hub**, testé (21 assertions sur le module, harnais DOM sur la cascade) et **vérifié au rendu** dans un navigateur sans interface : bandeau, pictogramme et teinte mesurés sur les deux familles de pages, en mode élève et en mode enseignant. Le tableau de bord affiche les **dates de clôture** (cases de clôture et frise, format `12/09`). ✅ **`bdd/schema/013-verrou-progression.sql` a été exécuté le 20/08/2026** par Loïc : `mon_plafond()` répond en base, et un appel anonyme se heurte bien à `42501 permission denied` — la fonction est réservée aux comptes connectés, comme prévu. Le plafond est donc **actif de bout en bout**. Deux textes vus par les élèves attendent la validation de Loïc. |
| **SNT — `t1` Internet** | 🔎 **Audit du 20/08** (trois lots), puis **audit de la séance 1 le 22/08** (dix lots). La séquence compte désormais **6 séances** : la séance 1 portait sept étapes pour une heure, elle est coupée après « Aux origines d'Internet » et la nouvelle **S2 « D'ARPANET à Internet »** reprend ARPANET, Pouzin, le réseau mondial et la frise ; les quatre suivantes se décalent. **Les 26 étapes portent enfin un `data-cle` sémantique** (`t1-arpanet`…), posé AVANT la découpe pour que la progression des élèves ne bouge pas — `verifier.mjs` refuse maintenant une clé dupliquée. Aussi : infobulles en `position:fixed` (elles étaient rognées par les `overflow:hidden`, pas par le bord de la fenêtre), étiquettes de champ sur leur propre ligne avec le détail en bulle, seuil de rédaction à 20 caractères partout, frise validée au 6ᵉ essai et « voir la correction » qui valide enfin, trois corrigés qui donnaient la réponse d'une question ultérieure. **Restent** : étape **6.4** (activité TERMINAL en `.a-venir`), **6.6**, le moteur du relevé et du rappel (6.3), la fin de thème (Filius + passerelle NSI facultative), et le prérequis binaire — désormais porté par le module `m1`. ✅ La question 4 de l'étape 1.4 et les **quatre dates manquantes de la frise** sont relues et **validées** (22/08) — elle est complète, douze sur douze ; les lignes de test Supabase ont été purgées le même jour. ⏳ Reste à relire avant validation : les 51 leurres de QCM et les 3 questions de `NET-Q7` (20/08). **Audit des séances 3 et 4 le 22/08** (lots K à O) : l'enquête box dit enfin qu'elle est facultative et pourquoi ; les menus déroulants ne coupent plus leur énoncé en trois (`display:grid` sur un `<label>`) ; le tableau de Lannion défile au lieu d'escamoter quatre champs sous 520 px ; le maillé remonte et Internet sort de la liste des topologies ; la guirlande remplace le câble coaxial ; l'étape des câbles gagne un passage sourcé sur la fibre optique **avec deux images Wikimedia attribuées**, un développement sur *pourquoi* Meta et Microsoft possèdent des câbles, et des chiffres 2Africa remis à jour (fin 2025) ; le débriefing d'ordre de grandeur ne s'affiche plus qu'après un clic sur Vérifier et à ±25 % ; la question 1 de 4.3 ne part plus en correction et l'en-tête dit ce qui part chez le professeur ; le bonus de la séance 4 utilise enfin le composant `.poste` ; quatre notes de chantier réglées ont quitté la page. **Rien de tout ce qui est du contenu n'est validé** — tous les textes neufs sont marqués « PROPOSITION À VALIDER » dans le HTML. ⏳ Un **plan d'allègement de l'étape 4.2** est proposé plus bas, non appliqué. |
| **SNT — module `m1` Représenter l'information** | 🆕 Écrit le 21/08, **d'emblée sur le moteur partagé** — troisième page dans ce cas après `t1` et `t2`. 2 séances, 9 étapes, 4 QCM, 2 ateliers à liste fixe. Trois composants SVG maison : tableau des poids cliquable, **potence des divisions** (reproduction du geste manuscrit de Loïc, paramétrable de 1 à 4095, pas à pas, repli vertical sur téléphone) et nuancier RVB. **Parcours élève joué de bout en bout dans un navigateur** : 18/18 trous justes, QCM 3/3 et 4/4, 5/5 étapes validées, **séance 2 débloquée**, fiche portant les 12 réponses d'atelier, aucune erreur JS aux trois largeurs ni en `prefers-reduced-motion`. `verifier.mjs` inchangé à 19. **Rien n'est validé : tout le contenu pédagogique est une proposition.** |
| **Base de données** | ✅ **en service.** Supabase, région **West EU (Paris)**. 7 tables, 10 policies RLS, 4 fonctions, sauvegarde hebdo + réveil quotidien. Pilote prouvé de bout en bout sur `t1`. |
| **Pré-correction IA SNT** | ✅ worker local complet, testé, avec garde-fous et tri de relecture (`ia-snt/`). ⚠ boucle non fermée — voir ci-dessous. |
| **Livret CFA** | 17 outils + index en ligne, tous à la structure `.contexte` / `.question` / `.reponse`. Mise en page reprise le 19/08 (une seule colonne, un seul bord d'attaque), puis **audit de contenu des dix-sept outils le même jour** : accroche recentrée sur l'atelier, « effort » → « force » partout, `ε` pour l'écart et `θ` pour les angles de rotation, paliers 1 dégonflés de leur guidage, sous-questions concaténées, vecteurs fléchés et racines couvrantes. Deux figures produites (bras de levage de l'Outil 5, composantes de l'Outil 14), une dizaine corrigées. Les **fiches A4 ne suivront qu'après validation des versions en ligne** — 15 des 17 liens « version à imprimer » sont donc morts. Rien de validé : **l'Outil 0 est le premier attendu en relecture**. Depuis le 19/08 le livret est **branché sur le dispositif de comptes** : connecté, le travail va en base et suit l'apprenti d'un appareil à l'autre ; sans compte, tout reste sur l'appareil comme avant, et la page le dit. Les deux codes de classe (`CFA26A`, `MVT26A`) sont ouverts : `bdd/schema/012-classes-cfa.sql` a été exécuté le 20/08. |
| **Cahier de vacances** | 14 pages, 2 blocs 🚧. La partie la plus finie du dépôt. |
| **ES Terminale** | frise fonctionnelle en local ; `serveur-frise/` et `ia-correction/` en chantier. |

**Validation** : aucun contenu n'est validé à ce jour. La mise en ligne n'est pas
un jalon — ce qui se suit, c'est le niveau de finition **validé par Loïc**, acte
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

## 📋 Plan d'allègement de l'étape 4.2 « Les câbles sous-marins » — proposition, rien n'est appliqué

> Posé le 22/08/2026 à la demande de Loïc : « pas très sexy, avec son nombre de
> questions et ses cadres gris en boucle ». **Aucune de ces pistes n'a été
> exécutée** — le contenu pédagogique lui appartient. Il choisit, ou il écarte.

**Ce que l'étape contient aujourd'hui** : 8 blocs numérotés, 3 textes à trous,
1 QCM de 10 questions, 4 dépôts d'image, 4 réponses rédigées envoyées en
correction. Le bilan ne s'ouvre qu'après **8 blocs de réponse** remplis.

**Piste A — fusionner les deux atterrages français.** Les blocs 3 (*Amitié*, au
Porge) et 4 (*2Africa*, à Marseille) posent la même question à deux câbles.
Une seule réponse rédigée, en deux volets, ferait le même travail : −1 bloc
compté, −1 rédaction à corriger.

**Piste B — basculer la pose et les dangers en bonus.** Les blocs 7 (comment on
pose un câble) et 8 (ce qui l'endommage) sont les deux plus « culture générale »
de l'étape, et les deux dont le corrigé se lit comme un article. Déplacés dans
le « pour aller plus loin » de la séance, ils sortent des 100 % : −2 blocs
comptés, et le bonus y gagne en substance. Le « à retenir » les mentionne déjà,
donc rien ne se perd pour qui n'ouvre pas le bonus.

**Piste C — un seul dépôt d'image au lieu de quatre.** Les deux dépôts du bloc 5
(un câble d'époque, une fibre d'aujourd'hui) faisaient sens quand rien
n'illustrait la fibre ; depuis le 22/08 l'étape porte deux images de fibre en
propre. Garder le dépôt « câble d'époque » (recherche réelle) et supprimer
l'autre. Le dépôt du bloc 2 (carte de France) et celui du bloc 4 (parcours de
2Africa) sont, eux, la trace du travail sur la carte : ils restent.

**Piste D — casser la répétition visuelle.** Ce qui fatigue n'est pas seulement
le nombre : c'est huit `.field` gris identiques à la file. Deux gestes
possibles, indépendants du contenu — (1) sortir du cadre gris ce qui n'est pas
une question (documents, tableaux, images), comme le QCM vient de l'être ;
(2) marquer les blocs par leur **nature** plutôt que par leur numéro (lecture de
carte · calcul · rédaction), pour que l'œil voie une progression au lieu d'une
liste.

**Effet cumulé de A + B + C** : de 8 à 5 blocs comptés, de 4 à 3 rédactions à
corriger, de 4 à 3 dépôts. L'étape garde ses deux temps forts — le tableau de
Lannion et le calcul d'ordre de grandeur.

---

## Prochaines actions

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
- [ ] **`t1` lot 2 — moteur du relevé et du rappel** : type de champ « relevé »
      (validé sur le format, pas la valeur) · rappel en boîte de dialogue sur fond
      flouté, comparé au relevé du même élève · prise en charge d'un `data-cle` sur
      un bloc `.cloze` · incrémenter le `?v=` **du CSS et du JS**, dans **les deux
      pages** (au 20/08, après l'audit : `sequence-snt.css?v=32`,
      `sequence-snt.js?v=32`, `progression.js?v=15`, `verrou-snt.js?v=2`)
- [ ] **`t1` lot 3 — étape 5.4** (diagnostic réseau) : donner les consignes, étoffer
      les questions, descendre le « à retenir », sortir l'activité TERMINAL de `.res`
      et retirer son `.a-venir` — **seul bloc `.a-venir` restant de la séquence**
- [ ] **`t1` lot 4 — étape 5.6** : QCM IPv6 à la place des champs, et beaucoup plus de sources
- [ ] **`t1` lot 5 — fin de thème** : Filius en validation intégratrice + passerelle
      NSI facultative (ports, masque de sous-réseau)
- [ ] Depuis un poste de la salle : `nslookup` sur les trois sites du relevé de 5.3
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
- [ ] **Le prérequis « binaire » de la séance 5 de `t1` n'existe pas.** L'étape 5.1
      demande à l'élève de reconstituer 8 bits → 256 → 255 → 32 bits → 4,3 milliards
      « en s'appuyant sur le thème binaire vu ailleurs ». Aucune séquence SNT ne le
      porte : à écrire, à rattacher à `t0`, ou à rendre autonome dans `t1`
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

**Accueil**

- [ ] Remplacer `prenom.nom@exemple.fr` par la vraie adresse
- [ ] Mettre le vrai lien de l'espace classe ENT (actuellement `href="#"`)
- [ ] (plus tard) Page « collection de gravures »

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
