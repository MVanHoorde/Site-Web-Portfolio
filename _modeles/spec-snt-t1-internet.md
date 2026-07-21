# Séquence SNT — Internet · Spécification de travail (V2)

> **Rangement (21/07/2026)** — fichier de pilotage déposé par Loïc, retranscrit ici
> tel quel (seul l'encodage a été corrigé). Il pilote la refonte de
> `pages/2nde-snt-t1-internet.html`. Consignes de production du gabarit :
> `_modeles/CONSIGNES-sequence-SNT.md`. Suivi : `_suivi/chapitres.md`.

> **Usage :** fichier de pilotage à ouvrir dans VS Code, à donner comme contexte à Claude Code pour construire la séquence « Internet » du site.
> **Vocabulaire :** on parle de **séquence** (séquence numérique), plus de « hub » — terme plus simple pour les collègues qui s'appuieront sur ce travail. À répercuter dans le code, l'UI et tous les contenus.
> **Sources de contenu :** fichier équipe `02 — Historique d'internet et routage` (OneDrive partagé) + apports listés ici.
> **Règles du chantier (rappel socle) :** fond commun collègues inchangé, forme repensée · bloc socle solide + « pour aller plus loin » · passerelle NSI facultative si pertinent · liens biblio/sources systématiques sur tout point d'histoire · dates et chiffres vérifiés (voir §9, plusieurs corrections à intégrer).

---

## 1. Décisions générales (issues de la dictée)

- **Récupérer la totalité du contenu** du fichier source (la version actuellement sur le site est trop pauvre), **sauf** les paragraphes « Prérequis » et « Publics cibles » (supprimés).
- Garder l'**introduction avec les objectifs**.
- **Pictogramme « à voir plus tard »** : créer un signe/icône réutilisable dans toute la séquence (et les autres séquences) signalant qu'une notion sera approfondie ultérieurement. Au survol/clic : mini-message rassurant (« Pas de panique, cours complet plus tard ») + **où** (quelle séquence) la notion sera traitée. Pas de date précise. Premiers usages : **adresse IP** et **le Web**.
- **Glossaire évolutif** (nouveau, transversal — voir §7.5) : le glossaire n'est plus un bloc isolé en fin de parcours, il se **construit au fur et à mesure de la séquence** et apparaît **complété à la fin**.
- ⏪ *Déplacé vers la séquence d'introduction (t0) :* la posture pédagogique SNT (venir avec **casque/écouteurs + stylet**, avancer à son rythme, côté autodidacte de l'apprentissage du numérique). Considérée comme **acquise** au moment de cette séquence — à implémenter directement dans la séquence d'introduction, pas ici. **[Reporter dans la spec de la séquence t0.]**
- Cadre technique transversal : suivi de sortie de page, prise de notes intégrée, dictionnaire, mode focus (flou), IA de pré-correction (voir §7).

---

## 2. Architecture de la séquence

| Étape | Titre | Contenu principal |
|---|---|---|
| 1 | Qu'est-ce qu'Internet ? | Définition élève (diagnostic) → lecture → 2ᵉ définition corrigée → réseau des réseaux → sémantique Inter+Net |
| 2 | Histoire d'Internet | Podcast France Culture ép. 1 + QCM + cours débloqué + encadré 🇫🇷 Cyclades |
| 3 | Protocoles | Vidéo Cookie connecté + modèle OSI + modèle TCP/IP + encapsulation |
| 4 | Routage | Routeur, table de routage, exercice |
| 5 | Évaluez-vous | Activité réseau/routeurs (ex-« activité 3 »), associations mots-clés, **glossaire complété** + auto-éval |

---

## 3. Étape 1 — Qu'est-ce qu'Internet ?

### 3.1 Déroulé
1. **Question ouverte d'entrée — tentative n°1 (diagnostic, non corrigée)** : « Donne TA définition d'Internet, sans faire aucune recherche. »
   - **Mode focus** : le reste de la page est **flouté** pendant la rédaction (voir §7.6).
   - Contrainte : **2 phrases max** (~150 caractères, à ajuster — la « cinquantaine » dictée semble trop courte pour 2 phrases, vérifier la limite dans le code).
   - **Blocage sur la page** (pas de recherche possible / détection de sortie, voir §7.2).
   - **Pas de « bonne réponse » affichée à ce stade** : c'est SA définition, stockée telle quelle (diagnostic prof + entrée n°1 du glossaire évolutif).
2. **Affichage du paragraphe d'information** (définition de référence du fichier source `02` + décomposition sémantique **Inter + Net**, remontée ici — importante, tombe régulièrement en évaluation : *inter*-connected *net*-works → **le réseau des réseaux**).
3. **Question ouverte — tentative n°2 (corrigée)** : après lecture, l'élève **redonne une définition d'Internet**.
   - **Mode focus** : page à nouveau floutée — vrai exercice de restitution, pas de recopie.
   - **Corrigée par l'IA** (pré-correction critériée, voir §7.3) et **associée à la tentative n°1** (l'élève voit son évolution ; le prof aussi).
   - La version corrigée/validée devient l'entrée « Internet » du **glossaire évolutif**.
4. Ouverture automatique sur **« le réseau des réseaux »** (notion d'évaluation) : donner ici l'intégralité du paragraphe « Introduction à l'histoire d'Internet » du fichier `02`.
5. Première mention de l'**adresse IP** → pictogramme « à voir plus tard » (précisé : approfondie dans cette séquence, étapes 3-4, puis séquence dédiée). Idem pour **le Web** → séquence complète à venir.

### 3.2 Images à intégrer (2)
Chercher sur **Wikimedia Commons** (toujours avec mention de licence) :
- Une image de **datacenter** (allées de serveurs) — incarne le « où est Internet physiquement ».
- Une **image générique d'Internet et de ses usages** (carte des connexions mondiales type « Internet map », ou visuel des usages).
- [PROPOSITION] Carte des **câbles sous-marins** (submarinecablemap.com, ou carte Commons) — très visuel, casse le mythe du « tout passe par satellite ».

---

## 4. Étape 2 — Histoire d'Internet

### 4.1 Support principal : podcast France Culture
Série **« Une histoire de l'Internet »** (Julien Le Bot, France Culture, 2022 — 8 épisodes ×15 min).
Page série : https://www.radiofrance.fr/franceculture/podcasts/serie-une-histoire-de-l-internet

**Épisode 1/8 — « 1969 : on a parlé sur les réseaux » (13 min)** — écoute intégrée :
```html
<iframe src="https://embed.radiofrance.fr/franceculture/diffusion/3a8a2251-e64b-4a8d-a992-9ca98804956b" width="100%" height="144" frameborder="0" allowfullscreen></iframe>
```
UI pendant l'écoute (voir §7.1) : lecteur (pause/reprise, vitesse ×2 si l'embed le permet — sinon accepter les contrôles natifs de l'iframe) + **encart de prise de notes** à droite + **dictionnaire** accessible en dessous (termes attendus : *asynchrone*, *télégraphe*, *protocole*…). Message : « Tes notes te serviront pour le QCM. »

### 4.2 Banque de questions du QCM post-écoute
(auto-corrigé ; les notes de l'élève restent visibles)
1. Comment s'appelle l'ancêtre d'Internet ? → **Arpanet** (à faire placer/écrire).
2. Dans quel pays est-il né ? → **États-Unis**.
3. Dans quel contexte historique ? → **Guerre froide**.
4. Qui le finance/le pilote au départ ? → **L'armée américaine** (agence ARPA/DARPA).
5. Pour faire quoi au départ ? → **Relier des ordinateurs entre plusieurs universités**.
6. Quelles universités ? → **UCLA, Stanford (SRI), UC Santa Barbara, Utah** (détail : les 4 premiers nœuds de 1969) — **à placer sur une carte des États-Unis** (voir 4.5).
7. Décennie des débuts ? → **années 1960** ; réseau réellement opérationnel : **1969** (premier message le 29 octobre 1969, UCLA → Stanford : « LO » — le système plante avant « LOGIN » : anecdote à mettre en encart, elle marche très bien).
8. L'idée de départ était-elle de connecter toute la planète ? → **Non** (question « pour être complet »).
9. Existait-il d'autres réseaux de communication longue portée avant Internet ? → question ouverte (IA, mode focus) ; attendus : **télégraphe**, radio, télévision, courrier postal, téléphone. Point-clé du corrigé : la spécificité d'Internet = l'information **numérique** (et la commutation de paquets).
10. Premiers usages du réseau ? → échanges de données scientifiques, **premières blagues entre chercheurs**, communication militaire. (Ajouter : le **courriel dès 1971**, Ray Tomlinson et le @ — souvent cité en éval.)
11. Séparation réseau scientifique / réseau militaire : en quelle année ? → **1983** (MILNET se sépare d'Arpanet — vérifié, voir §9).
12. Question d'actualisation du chiffre du podcast : « Le podcast (2022) parle d'environ 3 milliards de connectés. Et aujourd'hui ? » → **~6 milliards début 2026 (73 % de l'humanité), ~2 milliards restent hors ligne** (source : Digital Report 2026, We Are Social/Meltwater). Excellente occasion de faire travailler le réflexe « une donnée numérique se périme ».
13. Le déploiement d'Internet est-il uniforme/égalitaire sur Terre ? → Non ; fractures géographiques (Asie du Sud, Afrique centrale) — enchaîne avec la question 12.

### 4.3 Cours débloqué après le QCM (grand paragraphe de synthèse)
Rédiger un paragraphe dense reprenant **tout le contenu du fichier `02`** sur l'histoire, enrichi de :
- Contexte Guerre froide, ARPA (1958), commutation de paquets (Kleinrock, Baran, Davies).
- 1969 : 4 nœuds. 1971 : courriel (@). **1971 : FTP** (protocole de transfert de fichiers — point qui tombe en éval ; mentionner ici avec picto « protocoles : juste après », la vraie définition de *protocole* arrive à l'étape 3).
- **NCP → TCP/IP** : ⚠️ décision de la dictée : **sortir NCP (et le développement FTP/TCP-IP technique) de l'historique** et le déplacer à l'étape 3 « mécanismes de transport ». Dans l'historique, on ne garde que la mention datée.
- **1er janvier 1983 : bascule d'Arpanet sur TCP/IP** (« flag day ») + séparation MILNET.
- **NSFNET (1986)** : réseau de la **National Science Foundation** (agence fédérale américaine de financement de la recherche — développer le sigle dans le paragraphe) qui devient l'épine dorsale civile. ⚠️ Reformuler la phrase du podcast : Internet **n'a pas failli s'appeler NSFNET** ; NSFNET est le réseau qui a succédé à Arpanet comme colonne vertébrale (voir §9). 1990 : Arpanet débranché. Années 1990 : ouverture commerciale + Web.
- **UUCP et Usenet** (encarts dédiés) : UUCP (1976-79, copie de fichiers entre machines Unix par ligne téléphonique) ; Usenet (1979-80, Duke/UNC) = **groupes de discussion** — encarts « c'est l'ancêtre de… » : courrier électronique → mails d'aujourd'hui, groupes de discussion → forums/Reddit/Discord. Donne de la profondeur historique aux usages actuels.
- **Pas de grande figure fondatrice** : contrairement à l'ordinateur/les entreprises (Turing, Lovelace, Jobs, Musk…), Internet est une **œuvre collective** — personne ne peut dire « l'inventeur d'Internet ». Insister : c'est un marqueur culturel du réseau (collaboration, RFC, standards ouverts). [Recherche à faire : 2-3 phrases sur les **RFC** comme incarnation de cette collaboration — bonne passerelle NSI facultative.]
- [Recherche à faire] **Ordres de grandeur des débits/volumes** aux débuts (Arpanet : lignes 50 kbit/s en 1969) vs aujourd'hui — avec picto « à voir plus tard » si on donne des ko/Mo/Go (les préfixes seront étudiés ailleurs).

### 4.4 Encadré 🇫🇷 « bleu-blanc-rouge » : Cyclades et la France
- **Louis Pouzin, réseau Cyclades (1971-73)** : invente le **datagramme** — paquet autonome, remise « au mieux », fiabilité assurée par les machines aux extrémités et non par le réseau. **Vint Cerf reprend ces idées dans TCP/IP.** La France a bel et bien co-inventé les concepts d'Internet.
- Fin de l'histoire : les **PTT** privilégient **Transpac** (circuits virtuels, X.25) puis le **Minitel** ; Cyclades perd ses financements (~1978).
- **Minitel (à développer, avec image — décision actée)** : lancement 1980-82, des millions de terminaux, l'annuaire électronique, le 3615… un « pré-Internet » français centralisé, fermé le **30 juin 2012**. Belle discussion : réseau **centralisé** (Minitel) vs **décentralisé** (Internet). Image Wikimedia Commons : terminal Minitel 1.
- Podcast « pour aller plus loin » : **Épisode 2/8 — « Cyclades : la France a failli inventer Internet »** :
```html
<iframe src="https://embed.radiofrance.fr/franceculture/diffusion/713057cd-7e68-4e9c-9f4c-feaaca5e242f" width="100%" height="144" frameborder="0" allowfullscreen></iframe>
```
- Sources encadré : page Wikipédia CYCLADES ; P. Mounier-Kuhn, *L'Informatique en France…* ; documentaire France TV « Les Français qui n'ont pas inventé Internet ».

### 4.5 Contre-culture, communautés, politique (fil « réflexion »)
- À partir de ~6 min du podcast : Internet s'ancre aussi dans la **contestation de l'autorité de la côte Ouest** (Californie). Introduire tôt la Californie : on y retrouvera les **géants de la tech** (question possible : « Dans quelle région des États-Unis se concentrent les géants du numérique ? »).
- **Micro-ordinateurs et hippies — vérifié, c'est vrai et documenté** (à intégrer au cours) :
  - **Community Memory** (Berkeley, **1973**) : premier « BBS » public, un terminal partagé dans un magasin de disques — première communauté numérique grand public.
  - **People's Computer Company** (1972) : « le pouvoir de l'ordinateur au peuple ».
  - **Homebrew Computer Club** (1975, Silicon Valley) : club de bidouilleurs d'où sortent… **Wozniak et Jobs** (Apple). Le lien hippies → micro-informatique passe par là.
  - **Whole Earth Catalog** (Stewart Brand, 1968) puis **The WELL** (1985), communauté en ligne pionnière. (Épisode 6/8 du podcast couvre exactement ce fil : Stewart Brand → Zuckerberg.)
  - « Faire de la politique par la communauté » : trait fondateur de la culture geek/du logiciel libre — à souligner.
- **Steve Jobs, « l'ordinateur = une bicyclette pour l'esprit »** : l'image vient d'une étude sur l'efficacité énergétique de la locomotion (le condor vs l'humain à vélo) ; extrait vidéo célèbre (interview ~1980/1990, chercher l'extrait sous-titré FR sur YouTube). Concept d'***empowerment*** (outil d'émancipation) à expliquer aux élèves.
  - ⚠️ **Correction de date (dictée : « 1974, premier Apple »)** : Apple est fondée en **avril 1976**, Apple I en **1976** (Altair 8800 : 1975). Utiliser 1976.
- **Question ouverte réflexive (réponse IA + stockage pour débat en classe, mode focus)** : citation du podcast, « de l'utopie des débuts au cauchemar totalitaire ». « Cette formule te semble-t-elle coller à la réalité ? Pourquoi es-tu d'accord / pas d'accord ? » — pas de bonne réponse, l'objectif est l'argumentation. **Vue prof agrégée indispensable** pour ouvrir le débat en milieu/fin de séance (voir §7.4).

### 4.6 Images étape 2 (Wikimedia Commons, licences à citer)
- Carte logique d'**Arpanet** (mars 1977) — classique et parlante.
- **IMP** (Interface Message Processor) — la « première box ».
- Photo **Louis Pouzin** (Commons, plusieurs photos CC).
- **Minitel 1**.
- Carte du backbone **NSFNET** (T1, ~1991).
- Carte interactive ou statique des **4 premières universités** (à générer en SVG : fond carte USA + 4 points légendés — schéma technique répétitif, candidat IA).

---

## 5. Étape 3 — Protocoles (mécanismes de transport)

### 5.1 Pré-requis affiché AVANT la vidéo
**Définition de « protocole »** (absente de la vidéo) + exemples de la vie courante (protocole de politesse, protocole médical, règles du code de la route…) — un protocole = ensemble de règles communes pour que des acteurs différents se comprennent. C'est ici qu'on rapatrie **FTP et NCP** sortis de l'historique (bref développement « pour aller plus loin » : FTP, NCP → remplacé par TCP/IP en 1983).
→ **Glossaire évolutif** : l'élève rédige ici sa tentative de définition de « protocole » (mode focus), pré-corrigée par l'IA.

### 5.2 Vidéo support
**Cookie connecté — modèle OSI / TCP-IP** : https://www.youtube.com/watch?v=26jazyc7VNk
Même UI que le podcast : vidéo en haut, **prise de notes en dessous**, dictionnaire accessible. Cours de synthèse **débloqué après validation des questions**.
Idée forte à reprendre en ouverture : *les appareils connectés doivent respecter les mêmes règles, parler le même langage, suivre les mêmes consignes* — c'est la raison d'être du modèle OSI et du modèle TCP/IP.

### 5.3 Banque de questions
1. Combien de couches dans le modèle **OSI** ? → **7** (question offerte, le chiffre est donné).
2. Que signifie OSI ? → **Open Systems Interconnection**.
3. Question ouverte : redonner la définition du modèle OSI avec l'exemple de la vidéo (ou un autre exemple à trouver — [recherche : proposer une analogie type « envoi d'un colis » ou « lettre diplomatique traduite »]).
4. Exercice : **remettre les 7 couches dans l'ordre** (drag & drop). Consigne explicite : *pas à apprendre par cœur*, juste savoir les réordonner avec leurs descriptions (issues de la vidéo).
5. **TCP vs UDP** : la comparaison **avec / sans accusé de réception** de la vidéo est excellente — à reprendre dans le QCM ET dans le cours débloqué. (À connaître.)
6. **Le modèle TCP/IP = simplification du modèle OSI** en **4 couches : Application · Transport · Internet · Accès réseau** — **à apprendre**, et c'est CE modèle qu'ils devront savoir **reconstruire** (exercice évaluable, drag & drop).
7. Question croisée : « Combien de couches dans le modèle OSI ? dans le modèle TCP/IP ? »
8. Contenu des couches : on **verra** DNS et HTTP (pictos « à voir plus tard » avec séquence cible) ; **encarts "pour aller plus loin"** pour DHCP, FTP, SSH, SMTP (non exigibles). Adresse **IP** : première définition ici, picto « cours complet plus tard ».
9. **Encapsulation** : dans un sens on encapsule, dans l'autre on décapsule couche après couche. Vocabulaire **à connaître : message → segment → datagramme → trame → bits**. Ajouter dans le cours un **exemple ultra concret** ([à rédiger] : envoi d'un message « Salut ! » sur une messagerie, suivi étape par étape ; possible analogie poupées russes / colis suremballé).
10. Question : « Tous les équipements du réseau utilisent-ils tout le modèle ? » → ordinateur/serveur : **les 4 couches** ; **routeur** : jusqu'à la couche Internet ; **switch** : couche Accès réseau. (Switch et routeur pas encore vus — picto « définis à l'étape suivante ».)
11. L'image bilan de la vidéo à **6:09** est excellente — capture à recréer en SVG maison (droits !) plutôt que capture brute.

### 5.4 ⚠️ Correction terminologique (à répercuter PARTOUT, site + cours + évals)
On ne dit pas « **le protocole TCP/IP** » mais « **le modèle TCP/IP** », qui contient (entre autres) **deux protocoles : TCP et IP**. (Erreur repérée par Loïc dans sa propre pratique depuis 3 ans — chercher/remplacer dans tous les contenus existants.)

---

## 6. Étape 4 — Routage

- Garder l'esprit du fichier source : **routeur, table de routage** — peu de changements.
- **Supprimer** « Routons, routons, petits pâtés-ponts » (trop enfantin pour des 2des).
- **Exercice table de routage : conserver** (très intéressant) + **donner un exemple de table de routage** dans le cours avant l'exercice.
- **Glossaire évolutif** : tentatives de définitions pour **routeur, switch, modem, ADSL, TCP/IP** au fil de l'étape (recherche en ligne **autorisée** pour ces termes techniques — contrairement aux définitions de restitution comme « Internet »). Règles de saisie : voir §7.5.
- QCM : déjà fait en étapes 2-3 — proposer ici une **forme d'évaluation différente** ([à retravailler] : texte à trous ? schéma à légender ?).

---

## 7. Fonctionnalités techniques transverses (à développer dans le code)

### 7.1 « Poste d'écoute/visionnage »
Composant réutilisable : média (iframe Radio France / YouTube) + **encart de prise de notes** (sauvegardé en base, réutilisable au QCM) + **mini-dictionnaire** intégré (recherche de notions ; contenu du dico alimenté par séquence). Mise en page : notes à droite du podcast, notes sous la vidéo. Contrôles pause/reprise ; vitesse ×2 si l'embed l'expose (sinon, contrôles natifs de l'iframe = acceptable, non bloquant).

### 7.2 Suivi de présence sur la page
- Détection de sortie de page/onglet (visibilitychange/blur) → **message gentil mais un peu pressant** (pas de sanction).
- **Comptage par session** consultable par le prof : nombre de sorties par élève. Fonctionne tablette ET ordinateur.
- Utilisé en mode « strict » pour les définitions de restitution (étape 1) : rédaction sans recherche.

### 7.3 IA de pré-correction des questions ouvertes
Premier déploiement réel du cadre déjà validé (projet éval assistée par IA) : **pré-correction uniquement, critères + justification, jamais de note** ; pseudonymisation par code élève ; ici, enjeu réduit (pas d'évaluation certificative) — bon terrain d'essai. Cas d'usage dans cette séquence : définition d'Internet tentative n°2 (étape 1), question « autres réseaux avant Internet », question réflexive utopie/cauchemar, toutes les entrées du glossaire évolutif.

### 7.4 Vue prof « brainstorming »
Accès rapide, en cours de séance, aux réponses libres des élèves (définitions, avis sur la citation) : vue agrégée/liste pour **lancer le débat** en milieu/fin de séance. Simple requête sur la base — à prévoir dès le schéma de données.

### 7.5 Glossaire évolutif (décision actée)
Le glossaire se construit **tout au long de la séquence** et remplace le bloc glossaire isolé de fin :
- Chaque terme-clé a un « moment glossaire » placé dans le déroulé : au bon endroit, l'élève rédige **sa tentative de définition** (mode focus, §7.6).
- **Deux régimes selon le terme** :
  - **Restitution** (ex. *Internet*, *protocole*, *réseau des réseaux*) : sans recherche, après avoir rencontré la notion — la définition vient de sa compréhension. Certaines (comme *Internet*) sont données **en fin de parcours de la notion**, après apprentissage.
  - **Recherche personnelle** (ex. *modem*, *ADSL*, *switch*) : recherche en ligne autorisée, mais reformulation obligatoire.
- Règles de saisie communes : **saisie clavier obligatoire, copier-coller désactivé** ; limite **100 → 200 caractères** (vérifier/relever la limite actuelle dans le code) ; IA de pré-correction : (a) contrôle anti-plagiat léger (la formulation n'existe pas telle quelle en ligne, si faisable), (b) évaluation critériée « écrit avec tes mots ? » avec critères explicités, (c) fautes d'orthographe signalées, non sanctionnées.
- **Affichage final (étape 5)** : le glossaire apparaît **complété**, rassemblant toutes les définitions validées de l'élève — son objet à lui, connecté à tout ce qui précède (répond à la critique « glossaire déconnecté » de l'ancien format). Les termes non traités restent grisés/à compléter.
- Composant pensé **réutilisable pour toutes les séquences** (le glossaire pourrait même devenir inter-séquences à terme — [proposition à valider]).

### 7.6 Mode focus (flou de page)
Composant réutilisable pour tout exercice de rédaction : quand une définition/réponse ouverte est demandée, **le reste de la page est flouté** (overlay + `backdrop-filter: blur`) — impossible de relire le paragraphe au-dessus, vrai exercice de restitution. Se combine avec le suivi de sortie de page (§7.2). Utilisé pour : les deux tentatives de définition d'Internet, les questions ouvertes IA, tous les « moments glossaire » en régime restitution.

---

## 8. Résumés des 8 épisodes du podcast (pour réemploi dans d'autres séquences)

*(Je ne peux pas écouter l'audio ; résumés établis à partir des descriptifs officiels de la série — à affiner à ton écoute.)*

1. **1969 : on a parlé sur les réseaux** — Arpanet, moments fondateurs, portée politique du réseau. → **utilisé ici (étape 2)**.
2. **Cyclades : la France a failli inventer Internet** — Louis Pouzin, le datagramme, ce que TCP/IP doit à la France. → **utilisé ici (encadré 🇫🇷, aller plus loin)**.
3. **Internet au pays des Soviets** — l'URSS/Russie et le contrôle du réseau (Klyosov, Soldatov). → réutilisable : séquence Web/Réseaux sociaux (censure, souveraineté numérique), ou débat citoyenneté numérique.
4. **La Chine, Internet et la Grande Muraille** — le modèle chinois du cyberespace et son exportation. → réutilisable : mêmes séquences que l'ép. 3 ; très bon pendant « localisation des données ».
5. **L'Europe crée le web (et les États-Unis s'en emparent)** — Tim Berners-Lee, Robert Cailliau, puis Andreessen/Netscape. → **candidat évident pour la séquence Web** (à réserver dès maintenant).
6. **Les enfants terribles du réseau** — l'histoire du mot « communauté » : Stewart Brand → Zuckerberg. → réutilisable : séquence Réseaux sociaux ; complète le fil contre-culture de l'étape 2.
7. **Y a-t-il un pilote dans le Net ?** — gouvernance : États, GAFA, société civile. → réutilisable : séquence Web ou séance débat (qui gouverne Internet ? ICANN, etc.).
8. **Vie ou mort d'une utopie ?** — de l'utopie libertaire à la surveillance. → prolonge directement la question réflexive de l'étape 2 ; bon support de conclusion d'année ou de débat.

---

## 9. Fact-checks & corrections à intégrer (domaine mouvant — vérifié juillet 2026)

| Point (dictée/podcast) | Statut | Correction |
|---|---|---|
| « 3 milliards de connectés » (podcast 2022) | **Périmé** | **~6,04 milliards début 2026 (73,2 % de l'humanité)**, ~2 milliards hors ligne (Digital Report 2026, We Are Social/Meltwater). En faire une question pédagogique (donnée périssable). |
| « 1974 : premier Apple » | **Inexact** | Apple fondée **avril 1976**, Apple I **1976** (Altair : 1975, Homebrew : 1975). |
| « Internet devait s'appeler NSFNET » | **À reformuler** | NSFNET (1986, National Science Foundation) = successeur civil d'Arpanet comme épine dorsale, pas un « premier nom » d'Internet. |
| « Séparation scientifique/militaire : 1983 » | **Exact** | MILNET se sépare d'Arpanet en 1983 ; même année, bascule TCP/IP (1er janvier 1983, « flag day »). |
| « Micro-ordinateurs créés par des hippies » | **Vrai (nuancé)** | Fil contre-culture documenté : Community Memory (1973), PCC (1972), Homebrew (1975) → Apple. À intégrer. |
| Universités d'origine | **Précisé** | 4 nœuds 1969 : UCLA, SRI (Stanford), UCSB, Utah. |
| « Bicyclette pour l'esprit » (Jobs) | **Exact** | Origine : étude sur l'efficacité de la locomotion (condor) ; extraits vidéo disponibles. |
| « protocole TCP/IP » | **À corriger partout** | Dire **modèle TCP/IP** (contenant les protocoles TCP et IP). |

---

## 10. Propositions supplémentaires (à valider ✅/❌ par Loïc)

1. **Frise chronologique interactive** de la séquence (1958 ARPA → 2012 mort du Minitel → aujourd'hui), construite progressivement par l'élève au fil des étapes (chaque QCM validé « pose » ses dates). Réutilise la mécanique frise déjà travaillée en ens. scientifique.
2. **Anecdote « LO »** (premier message d'Arpanet, crash avant « LOGIN ») en encart d'accroche de l'étape 2.
3. **Passerelle NSI (facultative, non évaluée)** : encart « si la spé NSI te tente » sur les RFC/standards ouverts et sur la lecture d'une vraie table de routage (`traceroute` montré en capture).
4. **Carte des câbles sous-marins** + question « comment ton message traverse-t-il l'Atlantique ? » (accroche matérialité du réseau, prépare le routage).
5. **Ray Tomlinson et le @** (1971) : mini-encart, très efficace en éval et en anecdote.
6. **Exemple concret d'encapsulation** rédigé façon « colis » (message → segment → datagramme → trame → bits) avec schéma SVG maison.
7. Question bonus culture : « Pourquoi ne peut-on pas citer L'inventeur d'Internet ? » en question ouverte courte (IA) — évalue la compréhension du caractère collectif.
8. **Extrait Jobs sous-titré FR** intégré (2 min max) plutôt que cité seulement.
9. Recréer l'image bilan de la vidéo Cookie connecté (6:09) en **SVG maison** (évite le problème de droits, cohérence graphique du site).
10. Prévoir dès maintenant la **réservation de l'épisode 5/8** pour la séquence Web (cohérence de la série sur l'année).
11. **Glossaire inter-séquences** : à terme, le glossaire évolutif de chaque séquence alimente un glossaire d'année unique par élève (son « dictionnaire SNT personnel »).

---

## 11. Sources / biblio (à afficher dans la séquence, règle systématique)

- France Culture, *Une histoire de l'Internet*, Julien Le Bot, 2022 (série 8 ép.) — page série Radio France.
- Cookie connecté, *Modèle OSI / TCP-IP* (YouTube).
- Wikipédia : ARPANET · CYCLADES · Louis Pouzin · NSFNET · Minitel · Community Memory · Homebrew Computer Club · Usenet · UUCP.
- P. Mounier-Kuhn, *L'Informatique en France, de la Seconde Guerre mondiale au Plan Calcul*, PUPS, 2010.
- France Télévisions, doc. *Les Français qui n'ont pas inventé Internet*.
- We Are Social / Meltwater, *Digital Report 2026* (chiffres de connexion mondiale).
- Wikimedia Commons pour toutes les images (licence à mentionner sous chaque image).

---

## 12. Prompt de démarrage pour Claude Code (à coller)

> Tu travailles sur la séquence SNT « Internet » du site. Lis d'abord ce fichier `sequence-snt-internet-spec.md` en entier : il contient l'architecture (§2), le contenu détaillé par étape (§3-6), les composants techniques à développer (§7) et les corrections factuelles obligatoires (§9). Règles : on dit « séquence », jamais « séquence » (renommer partout dans le code et l'UI existants) ; fond du fichier source `02` conservé, forme repensée ; chaque point d'histoire est sourcé (§11) ; terminologie « modèle TCP/IP » partout ; pictogramme « à voir plus tard », mode focus (flou) et glossaire évolutif = composants réutilisables. Commence par me proposer un plan d'implémentation (composants §7 d'abord, puis étapes 1→5) et attends ma validation avant de coder.

---

---

## 13. V3 — arbitrages de la session du 21/07/2026 (soir)

> Cette section **prime sur les §1 à §12** en cas de contradiction. Elle a été
> appliquée dans `pages/2nde-snt-t1-internet.html`. Reste à valider par Loïc.

### 13.1 Architecture — la §2 est caduque

| Séance | Titre | Contenu |
|---|---|---|
| S1 | **C'est quoi Internet ?** | définition diagnostic · Inter+Net · podcast · ARPANET · 🇫🇷 CYCLADES · réseau mondial · frise · débat |
| S2 | **Le réseau physique** | topologies · câbles sous-marins · du réseau mondial à ta maison |
| S3 | Protocoles & routage | inchangée |
| S4 | Adresses IP & DNS | **gelée**, sortira en séquences séparées |
| Bilan | routage humain · 8 routeurs · glossaire | inchangée |

- **« Internet ≠ Web »** quitte cette séquence : traitement complet en **séquence Web**, rappel d'une ligne ici + picto.
- **Minitel** : **mentionné seulement** (frise + encart 🇫🇷), **pas d'image, pas de développement** — il part en séquence Web, juste après l'encart cocorico de là-bas. Annule la décision du §4.4.
- **Vocabulaire figé** : une *séquence* contient des *séances* ; côté élève on dit *thème*. Aucune reprise sur les 8 pages.

### 13.2 Échelle d'évaluabilité (nouvelle, transversale)

| Marque | Niveau | Blocs |
|---|---|---|
| ★★ | à savoir | à retenir · glossaire (définition **validée**, pas la tentative de diagnostic) |
| ★ | à savoir faire | exercices, dont les exercices bilan |
| ○ | support | documents · vidéos · podcasts |
| ✦ | bonus | 🇫🇷 fierté française · le sais-tu |
| — | non évalué | pour aller plus loin · activité d'introduction |

Marquage **discret** sur chaque bloc, expliqué **une fois pour toutes en t0**.
⚠️ *bonus* ≠ *facultatif* : le bonus peut rapporter des points, le « pour aller plus loin » jamais. Formes distinctes.

### 13.3 Grammaire visuelle

Couleur = **rôle** (lire / se repérer / faire / retenir / culture) · forme = **statut**.
Bandeaux **allégés** partout **sauf « à retenir »**, seul bloc conservé en plein (ardoise `--retain`).
Drapeau tricolore devenu un **liseré** à côté du mot, pour que « Fierté française » redevienne lisible.

### 13.4 Barre de progression (valide pour toutes les séquences)

Sommaire d'**étapes groupées par séance**, à gauche, cliquable. États : fait · en attente · en cours · à venir.
Repli en **bandeau horizontal** (R4), réouverture par **languette** (R1). Repli d'office sous 1180 px et en **mode focus**.
**Aucun `localStorage`.** Champ `data-echeance` prévu pour les **dates cibles**, **volontairement laissé vide** (arbitrage : on ne s'invente pas un calendrier qu'on ne tiendra pas).
**Étapes révélées une à une** à l'intérieur d'une séance.

### 13.5 QCM — composant transverse

Bouton → ouverture **plein écran**, reste de la page **flouté** · questions **enchaînées horizontalement**, jamais empilées · **3 à 4 questions minimum** · **récapitulatif des bonnes réponses** en sortie, sur la page **et** sur la fiche, avec compléments « hors programme, mais bon à savoir » · le QCM du podcast est **remonté juste sous l'écoute**.
Chaque étape doit afficher **ce qui reste à faire pour la valider** (risque identifié : l'élève ne sait plus comment valider).

### 13.6 Correction des trous — trois états

Normalisation (minuscules, accents, ponctuation, articles) · **variantes acceptées** par trou (`data-variantes`, séparateur `|`) · **distance de Levenshtein** (1 faute ≤ 7 caractères, 2 au-delà) → état **jaune « presque »** : l'étape est **validée**, l'orthographe est corrigée et signalée, **jamais sanctionnée** · **indices à deux niveaux** par trou (`data-indice1`, `data-indice2`).
Plus tard, l'IA remplacera les listes de variantes.

### 13.7 Validation d'une étape — **à l'envoi** (décision arrêtée)

Une étape est validée dès que l'élève a **produit quelque chose** sur chaque champ requis, **juste ou faux**.
⚠️ Conséquence sur le schéma de données : il faut **deux informations distinctes**, *fait* et *juste*, la seconde n'étant visible que côté enseignant.

### 13.8 Mode enseignant

Sorti du sommaire déroulant · mention **discrète en tête de page**, **ne suit pas le défilement** · ouverture par **code** (empreinte **SHA-256** dans la page, code changeable) · **coupé au bout de 30 minutes**, minuterie visible, coupé aussi par un rechargement.
⚠️ **Limite assumée** : page publique + inspecteur = contournable. C'est un **ralentisseur**, pas une serrure. La vraie serrure viendra du **rôle vérifié côté Supabase**. Ne jamais mettre de contenu sensible derrière ce verrou.

### 13.9 Glossaire = dictionnaire permanent

Il quitte le poste d'écoute (qui ne garde qu'un **encadré vocabulaire**) et devient **accessible en permanence**, **cherchable**, prévu pour **traverser les séquences** (Web, réseaux sociaux…).
⚠️ Tant que la **clé anon** n'est pas renseignée, les définitions de l'élève **ne le suivent pas** d'une page à l'autre.
Pas d'API de dictionnaire externe : appeler le Wiktionnaire depuis le navigateur enverrait l'**IP de chaque élève** à Wikimedia, et un dictionnaire généraliste est mauvais sur le vocabulaire réseau. Dictionnaire **embarqué**, alimenté séquence par séquence.

### 13.10 Images

Taille modérée, **agrandissables au clic**, légende à côté, **source et licence sous chaque image**.
Le **croquis manuscrit de décembre 1969** remplace le SVG des 4 nœuds qui était en chantier.
Carte **Opte** : CC BY 2.5 — **OK sur le site**, à revérifier avant tout **usage commercial** (Tableo).
Licences ⚖️ à confirmer sur Commons : croquis 1969, ARPANET années 1970, démo 1977, carte logique 1977, CYCLADES, Louis Pouzin, NSFNET.
🔴 **Conflit de règle à arbitrer** : `CONSIGNES-sequence-SNT.md` §5 interdit tout asset externe aux séquences SNT. Des **photographies** ne peuvent pas être inlinées (page à plusieurs mégaoctets). Un dossier `assets/img/snt/2nde-snt-t1-internet/` a donc été créé. **La règle doit être modifiée** : « SVG inline obligatoire ; images matricielles autorisées dans `assets/img/snt/<slug>/`, optimisées ».

### 13.11 Fiche élève et PDF

Dedans : objectifs · **tous les à retenir** · définitions de glossaire validées · réponses aux exercices **avec la correction et les compléments** · frise · schémas · sources · **notes prises pendant l'écoute** · **les deux tentatives de définition d'Internet côte à côte** · réflexions perso.
Réduits : documents (titre + 2 lignes, et **supprimés s'ils n'apportent rien de plus que le « à retenir »**) · vidéos et podcasts (titre, durée, lien, **QR code**, **pas de lecteur**).
Dehors : « pour aller plus loin » · notes de chantier.
**PDF : feuille de style d'impression + « Enregistrer en PDF » du navigateur** (décision arrêtée). Aucune bibliothèque, aucun CDN.

### 13.12 Corrections de fond appliquées

- « transfert de paquets » **retiré de l'historique** : le mot arrive avec le **datagramme** (CYCLADES), puis avec l'**encapsulation** (TCP/IP). Chaîne à tenir dans cet ordre.
- Le paragraphe qui suit le datagramme doit s'intituler **« Qu'est-ce qu'un datagramme ? »**, et le terme doit être **employé plusieurs fois**.
- La question finale de l'ancienne 2.2 (lien datagramme ↔ TCP/IP) **saute** : TCP/IP n'est pas encore vu. Le lien se fera **depuis l'étape protocoles**, en rappelant CYCLADES.
- **NCP** : picto « à voir plus tard » ici, explication réelle dans la partie TCP/IP.
- **Inria** : infobulle. Vérifié — l'INRIA devient **Inria** le 7 juillet 2011, l'institut ayant volontairement abandonné le sigle ; les textes officiels le nomment toujours « Institut national de recherche en informatique et en automatique ».
- Colonne des dates du tableau ARPANET rendue **insécable**.
- **Frise verticale unique**, du plus ancien en haut au plus récent en bas, **une entrée par année**, dates clés en **bleu** et le reste en **gris**, avec légende.

### 13.13 Erreurs relevées dans le fichier équipe `02`

- « **Le 21 novembre 1969** » est la date du **lien permanent** UCLA–SRI. Le **premier message** (« LO ») est du **29 octobre 1969** — absent du fichier, alors que c'est l'anecdote la plus efficace.
- « **TCP/IP inventé en 1977** » : imprécis. TCP est décrit par Cerf et Kahn en 1974, la bascule générale est le 1ᵉʳ janvier 1983. **1977 est l'année de la démonstration à trois réseaux** — d'où l'image intégrée : le fond des collègues est conservé, et la date reprend son vrai sens.
- « protocole TCP/IP » → **modèle TCP/IP** partout.

### 13.14 Reste ouvert

- Encart **PTT** à écrire (les élèves ne savent pas ce que c'est).
- **Titre** et **légende des ronds orange** du schéma du datagramme.
- **QR codes** des ressources (SVG statiques, générés une fois, aucun appel externe).
- **Glisser-déposer** des 7 couches OSI · **SVG bilan** OSI/TCP-IP (recréation, pas de capture).
- Extrait **Steve Jobs** sous-titré, sinon un encart écrit.
- Reprise du fichier **`2nde-snt-t2-le-web.html`** : accueillir « Internet ≠ Web » et le Minitel.
- Portage dans **t0** (référentiel vivant) : échelle d'évaluabilité, barre de progression, révélation séquentielle, mécanique du QCM, glossaire permanent, mode enseignant.
- **Test Playwright** de la page V3 (checklist §10 des consignes) : non exécuté.

---

## 14. V4 — audit de la séance 1 par Loïc (21/07/2026, soir)

> Cette section **prime sur les §1 à §13**. Elle a été appliquée à
> `pages/2nde-snt-t1-internet.html`. Les arbitrages ouverts du §14.6 ont été
> validés par Loïc avant implémentation.

### 14.1 Étape par étape

| Étape | Décision |
|---|---|
| 1.1 | **Validée** sous réserve d'un avertissement avant envoi : la définition part telle quelle et n'est plus modifiable, **sans conséquence, pas de note**. Deux boutons : *Continuer à écrire* / *Envoyer ma définition*. |
| 1.2 | **Validée** sous réserve d'un picto « à voir plus tard » sur la mention des **câbles** (renvoi séance 2). |
| 1.3 | Bloc **« Vocabulaire » supprimé** (doublon du dictionnaire du poste d'écoute). QCM **dégraissé de 14 à 4 questions** : tout ce que reposent le texte à trous, 1.4 et 1.6 est retiré. |
| 1.5 | Encadré « à ne pas confondre Internet/Web » **supprimé** (le sujet ouvre la séquence Web). Les deux liens **Wikipédia supprimés**. Le lien datagramme ↔ TCP/IP est **annoncé, pas expliqué** : il se fera depuis l'étape Protocoles. Nouveau bloc révélé après réponse : chemins différents, arrivée dans le désordre, **et pourquoi l'information arrive quand même**. |
| 1.6 | QCM **étoffé à 7 questions** avant validation : les trois dates à retenir, le 1ᵉʳ janvier 1983, NSFNET, la **contre-culture californienne** (Californie + Homebrew Computer Club), le chiffre périmé, et **l'œuvre collective sans inventeur unique en dernière position**. |
| 1.7 | Ressource **« frise imprimable NET·2b » supprimée** : elle n'existe pas et n'existera pas. Glisser-déposer : **essais illimités**, la correction ne tombe plus au premier clic ; **deux niveaux d'indices** (4 dates repères, puis 8) ; bouton *Voir la correction* séparé. |
| 1.8 | L'enquête **Minitel part en séquence Web**. À sa place : **enquête famille sur l'arrivée d'Internet** (années 1970 → 2000) — année d'arrivée, premiers usages, ce qui a le plus changé, les peurs du début, les regrets. Plusieurs questions au choix. Travail à la maison **non mentionné sur la page** (dit à l'oral). |
| 1.9 | **Validée** sans changement. |
| Bilan | Le bloc « associe chaque événement à sa date » **quitte 1.7** et devient l'**étape D.3 « Les dates, de mémoire »** : reprise à distance, plusieurs semaines après. |

### 14.2 Règle typographique — l'italique (nouvelle, transversale)

Sources : *Lexique des règles typographiques en usage à l'Imprimerie nationale* ·
Clés de la rédaction (Portail linguistique du Canada) · Vitrine linguistique de
l'OQLF (typographie sur le Web).

- **Italique** : mots et expressions étrangers **non entrés dans les dictionnaires
  français** (*World Wide Web*, *network*, *interconnected*, *inter-networks*,
  *flag day*, *backbone*) ; titres d'œuvres et de séries (*Une histoire de
  l'Internet*) ; toute expression **au moment où on la nomme** — l'autonyme
  (le *réseau des réseaux*, un *datagramme*).
- **Romain** : les mots passés dans l'usage français — Internet, Web, mail,
  streaming, routeur, protocole, courriel.
- **Jamais italique + guillemets** ensemble. Dans un texte déjà en italique,
  l'élément revient en romain.
- **Balisage** : `<i lang="en">World Wide Web</i>` — l'attribut `lang` fait
  prononcer correctement le mot par les synthèses vocales.

### 14.3 Picto « à voir plus tard » — allègement

Le libellé complet (🔭 « à voir plus tard ») n'apparaît **qu'au premier usage de
la page** ; les suivants sont réduits au **télescope seul** (`.plustard.court`),
l'infobulle restant identique. Neuf pictos sur dix sont concernés.

### 14.4 Bonus « pour aller plus loin » — dans le fil

Les quatre blocs « pour aller plus loin » deviennent des **étapes du fil**
(1.10, 2.5, 3.6, 4.6) : révélés comme les autres, présents dans la barre de
progression, mais **sans `data-gate`** — ils n'entrent donc pas dans les 100 %.
La **pastille de niveau** remonte dans l'en-tête du bloc : collée en bas, elle
était invisible replié et orpheline déplié.

### 14.5 Fiche de séance — refonte

- **PDF par impression** : la fiche s'ouvre dans un **onglet** avec un bouton
  « Imprimer / Enregistrer en PDF » et une feuille de style `@media print` +
  `@page`. Aucune bibliothèque, aucun CDN (conforme §13.11). Repli en
  téléchargement de fichier si l'onglet est bloqué par le navigateur.
- **Plus aucun statut** « validé / en attente / à faire » : c'est un document de
  travail, pas un bulletin.
- **L'essentiel du cours, pas seulement les réponses** : objectifs de chaque
  étape · **tous les « à retenir »** · les **tableaux de repères** et la **frise
  corrigée** · le **vocabulaire** · les **deux définitions d'Internet côte à
  côte** · les réponses de l'élève · les notes d'écoute · les récapitulatifs de
  QCM avec leurs compléments · le glossaire personnel · les sources.
- **Dehors** : les « pour aller plus loin », les illustrations, les documents longs.

### 14.6 Sources — règle appliquée

Wikipédia **bannie** de la séquence. Sources ajoutées aux étapes 1.2, 1.3, 1.4
et 1.6 : Interstices (Inria), Inria, Internet Society, Computer History Museum,
The Opte Project, France Culture. La biblio de chaque étape est reprise
automatiquement dans la fiche.

### 14.7 Arbitrages du 21/07 au soir (2ᵉ passe)

- **Premier message d'ARPANET — récit complété (validé)** : les opérateurs tapent
  <i lang="en">LOGIN</i> le 29 octobre 1969 ; seules les deux premières lettres,
  « LO », passent avant le plantage, et il faut **environ une heure** pour que le
  mot entier arrive. Cette version réconcilie le récit des collègues et celui
  d'Interstices (Inria), désormais cité en source. Appliqué au tableau de 1.4, au
  QCM de 1.4 et à la frise.
- **Marquage du bonus — une seule mention (validé)** : sur un bloc « pour aller
  plus loin », seul l'en-tête porte **« hors 100 % »**. Aucune pastille
  d'évaluabilité n'est posée, ni sur le bloc, ni sur les intitulés, ni sur les
  champs qu'il contient : c'était redondant.

### 14.8 Reste ouvert

- ⚠ **Licences des six images** portant encore « ⚖️ à confirmer » (croquis 1969,
  ARPANET années 1970, démonstration 1977, CYCLADES, Louis Pouzin, NSFNET).
  **Wikimedia Commons n'est pas accessible en lecture depuis l'outil** : la ligne
  exacte ne peut pas être récupérée automatiquement. Elle doit être **copiée
  depuis chaque page de fichier** et collée dans la légende (`<span class="src">`).
  Rien n'a été inventé à la place — la mention « ⚖️ licence à confirmer » reste
  visible tant que ce n'est pas fait.
- **Enquête Minitel** à accueillir dans `2nde-snt-t2-le-web.html`.

---

*Fin de la spec V2 — mise à jour au fil des validations (§10). Reporter la posture pédagogique (casque/stylet/autonomie) dans la spec de la séquence d'introduction (t0).*
