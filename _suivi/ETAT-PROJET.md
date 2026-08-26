# État du projet

> **Réécrit** à chaque session, jamais empilé. Ce fichier décrit **l'état
> courant** — jamais comment on y est arrivé.
> Historique → `JOURNAL.md` · décisions → `DECISIONS.md` · détail par chapitre →
> `chapitres.md` · contexte et règles → `CLAUDE.md` · index → `MANIFESTE.md`.
>
> Dernière réécriture : **26/08/2026** (dernière passe : **les deux outils de
> seconde s'ouvrent en entier** — `o1` et `o2` ne verrouillent plus rien : toutes
> leurs étapes sont visibles dès l'arrivée et la partie « S'entraîner » ne se
> mérite plus. Le moteur partagé le lit sur un drapeau de page,
> `data-etapes="ouvertes"` ; les six séquences SNT, qui ne le portent pas, sont
> inchangées — vérifié au navigateur. `sequence-snt.js` passe en `?v=42` dans les
> six pages qui le chargent. Avant elle : **l'audit 2 de T3-C1
> « Émission et perception d'un son »**, lots A et B appliqués. Quatre points
> attendaient un arbitrage : **deux étaient déjà réglés** — les liens TP5, TP6 et
> DS4 avaient été posés après l'audit —, **un s'est tranché à la mesure** (la
> césure du mot surligné `célérité`, visible dès 1150 px), et le dernier portait
> sur **autre chose que ce que l'audit supposait** : ce n'était ni le placement du
> bloc formule ni le crayon, mais **l'indice `son` remonté à mi-hauteur du `c`**.
> Cause commune à trois défauts trouvés ce jour-là : **un conteneur flex ou grid
> qui reçoit du contenu inline en fait des cellules** — les `<sub>` de `.eq`
> (7 blocs formule cassés dans 5 chapitres), les fragments d'étape de
> `.methode li` (les 4 étapes de T3-C1 en escalier). Corrigés dans le socle, donc
> pour les 14 chapitres. **La vidéo de la cloche à vide n'était pas coupable** :
> l'erreur 153 venait de notre `referrerpolicy="no-referrer"`, pas de la vidéo —
> aucune n'a été changée, et la façade reste à **0 requête tierce avant le clic**.
> La méthode passe en **deux colonnes** avec une figure d'étapes SVG produite pour
> elle. Avant elle : **l'audit 1 des deux
> outils transversaux de physique-chimie** — `o1` et `o2` relus par Loïc les 26
> et 27/08, et repris de bout en bout : deux décisions de fond appliquées au
> dépôt entier (le **seuil de l'ordre de grandeur passe à 5**, l'**ambiguïté des
> zéros de fin disparaît** au profit des nombres exacts), la méthode de `o1`
> scindée en cinq étapes, un test après **chaque** bloc de contenu — trois QCM
> et treize blocs de vérification ajoutés —, les neuf « à retenir » restructurés
> en trois temps, huit pictogrammes dessinés dans la frise des échelles, le
> récapitulatif PDF du moteur retiré des outils, et les majuscules automatiques
> supprimées partout où elles changeaient le sens d'une unité. Avant elle :
> **les DS et les TP déposés dans les chapitres de physique-chimie** — 21 sujets (6 DS, 15 TP)
> publiés dans `assets/pdf/pc/`, liés depuis les 15 cartes du hub et depuis
> 13 chapitres, la carte **T3-C5 « Formation d'une image »** créée sans page de
> cours (le TP13 en tient lieu), et le dossier de travail `_a-deposer/` — 130
> fichiers dont des corrections et des données de classe — mis hors de portée de
> git ; aucune correction en ligne. Avant elle, dans la même journée : **le hub de seconde** —
> les seize cartes de `pages/2nde-physique-chimie.html` ramenées à une phrase
> d'accroche et, pour neuf d'entre elles, une vignette tirée du cours ; les
> listes « Notions abordées » du thème 3 supprimées. La veille : **le lot 1 de la
> quatrième famille — les outils transversaux de physique-chimie**. Deux outils
> produits de bout en bout, `o1` « Puissances de dix et écriture scientifique »
> et `o2` « Les chiffres significatifs », chacun avec sa page écran sur le moteur
> SNT, sa fiche A4 complétée en deux pages exactement, et son QR code généré et
> autovérifié ; la famille est posée au hub PC avant le thème 1, et
> `_modeles/CONSIGNES-outil-PC.md` fixe les conventions. Avant elle, dans la même
> journée : **l'audit 1 de `T3-C1`**
> — la V1 intégrale du matin, relue à voix haute par Loïc, est passée de *fidèle
> mais sèche* à un cours qui respire : figures ramenées à une taille de lecture,
> quatre mises en regard texte/figure, divisions en vraies fractions, cours étoffé
> d'un bloc Méthode, de l'amplitude et des seuils de danger, vidéo d'expérience
> intégrée sans fuite RGPD, puis **le socle CSS corrigé pour les 14 chapitres**
> — les lignes de calcul se replient au lieu de défiler, ce qui rendait
> 45 calculs sur 159 illisibles sur téléphone. Avant elle, dans la même journée : **trois V1
> intégrales de chapitres PC** — `T3-C1`, `T3-C3` « Dispersion et spectres » et
> `T3-C4` « Réfraction et réflexion », 82 figures posées, sept corrections de fond
> tracées)
> Site : https://mvanhoorde.github.io/Site-Web-Portfolio/ · Repo : MVanHoorde/Site-Web-Portfolio

---


> 🔗 **Pour reprendre une session interrompue, lire `REPRISE.md` à la racine.**
> Il contient l'état courant, les bugs connus non corrigés, les décisions
> en attente et les pièges rencontrés.

## Où on en est

| Partie | État |
|---|---|
| **PC seconde** | 14 chapitres en ligne. 🆕 **Les sujets de DS et de TP sont en ligne depuis le 26/08** : 6 DS et 15 TP dans `assets/pdf/pc/`, une puce par sujet sur la carte du hub et un `.video-chip` dans la page — le TP après la section dont il est l'application, le DS dans « Pour le DS, je sais ». Un sujet à cheval est lié depuis chaque chapitre qu'il couvre. La puce « Exercices 🚧 » a disparu des 14 cartes. **Aucune correction n'est en ligne** (elles partent par mail contre preuve de travail), et aucun fichier portant un nom de classe ou une date de séance n'a rejoint le dépôt. Le hub compte désormais **15 cartes de chapitre** : T3-C5 « Formation d'une image » existe **sans page de cours** — le TP13 en tient lieu, c'est la forme retenue, pas un chantier. Sept fichiers annexes (programmes Python, tableurs, vidéo, fichiers Latis Pro) attendent un arbitrage avant toute publication. 🆕 **Le hub a été repris le 26/08** : une phrase d'accroche par carte, une vignette tirée du cours sur 9 des 17 cartes (les 8 autres n'ont aucun visuel disponible). Les phrases ne sont pas validées. 🆕 **Trois sont en V1 intégrale** (25/08) : `T3-C1` (17 images + 2 tableaux + 1 vidéo intégrée, **audits 1 et 2 appliqués** — lots A et B du 26/08 : méthode en deux colonnes avec figure d'étapes SVG, calibrages mesurés, 12 gras d'insistance retirés, **plus aucun `.a-faire`**), `T3-C3` (34 figures) et `T3-C4` (20) — cours entier à l'écran, plus aucun `.a-faire` sauf le lien de DS. ⚠ **T2-C1, T3-C3 et T3-C4 portent encore l'encart 🔧 « Lien du DS » alors que leur lien DS est posé** : même redondance que celle retirée de T3-C1, signalée non traitée. Chez T2-C2, T2-C3 et T3-C2, sans lien DS, l'encart garde son sens. Leurs trois relevés attendent tes décisions. **Le thème 3 n'a plus que T3-C2 en ébauche.** T1-C1→C4 sont dégrossis à fond ; les **sept autres portent 81 blocs `.a-faire`**, à reprendre selon `_modeles/CONSIGNES-V1-integrale-PC.md`. 🆕 **Plus aucun exercice de PC n'est sans corrigé** : les trois qui manquaient (T2-C1 ex. 2 et 3, T2-C2 ex. 10) ont été rédigés le 25/08, figures comprises. Aucun cours validé. |
| **Outils transversaux PC** 🆕 | **Quatrième famille, ouverte le 25/08.** Des méthodes que tous les chapitres mobilisent, hors progression, disponibles toute l'année. **2 outils sur 8 écrits**, tous deux **audités et repris le 27/08** : `o1` « Puissances de dix et écriture scientifique » (désormais **5 étapes** de méthode — l'ancienne 1.3 était trop lourde et s'est scindée — 12 blocs de vérification, **2 QCM** de 6 et 10 questions, 8 pictogrammes dessinés dans la frise, et les **conversions de surfaces** qui n'existaient que dans une incise) et `o2` « Les chiffres significatifs » (le `±` expliqué avant d'être employé, les deux règles **justifiées par l'intervalle de mesure**, un QCM de 6 questions, 8 blocs de vérification). Chacun a sa **fiche A4 complétée**, en deux pages exactement, avec QR code. Tournent sur le moteur SNT **sans le modifier** — le récapitulatif PDF qu'il propose est neutralisé en local, aux trois endroits où il paraît. 🔴 **Deux décisions de fond tranchées par Loïc le 27/08** : le **seuil de l'ordre de grandeur est 5** (`√10 ≈ 3,16` a disparu du dépôt, cahier de vacances compris) et **il n'y a pas de zéro ambigu en seconde** (`100` fait trois chiffres significatifs ; les **nombres exacts** prennent la place de l'ambiguïté). Les « à retenir » passent à une structure en **trois temps** — règle · geste · contrôle, plus « le piège » — qui devient une convention de la famille. `o3` sécurité en salle de TP et `o4` relation algébrique restent **cadrés, non écrits** ; les neuf PDF sources ne sont pas dans le dépôt et manqueront pour `o3` à `o8`. ⏳ **Rien n'est validé** : tout le contenu pédagogique est une proposition, à commencer par la nouvelle justification du seuil (O-22). |
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
- [ ] 🆕 **Outils transversaux — lot 2 (`o3`, sécurité en salle de TP), débloqué.**
      Le plus lourd en dessin : neuf pictogrammes CLP en `<symbol>`, la verrerie,
      la paillasse aux huit erreurs. Deux arbitrages à rendre avant : le **tri de
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
