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
| 25/07/2026 | ⏳ **Poser un `data-cle` explicite sur les 27 étapes de `t1`** | Les clés de persistance sont aujourd'hui **positionnelles** (`et-s4-2`). Insérer une étape ailleurs qu'en fin de séance réaffecte le travail déjà enregistré des élèves. À faire **avant** la création des vraies classes : aujourd'hui seul `leproftest` serait orphelin. |
| 25/07/2026 | ⏳ Hébergement des vidéos SNT | La vidéo DNS et celle des couches existent sur le **PeerTube du ministère** (`apps.education.fr`). `youtube-nocookie` supprime le cookie publicitaire mais **pas les publicités**, ce qui est le motif de Loïc. Réserve à lever avant de basculer : PeerTube peut diffuser en **pair-à-pair**, ce qui exposerait l'IP de l'élève à d'autres spectateurs. |

---

## Architecture & dispositif

| Date | Décision | Statut |
|---|---|---|
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
| 25/07/2026 | **Questions de QCM sur une vidéo : écrites par Loïc, après visionnage.** Vaut pour M Bidouille (2.5) et Cookie connecté (4.3). Motif : l'IA ne visionne pas, elle ne peut donc garantir aucune question sur le contenu. En attendant, le QCM du temps 6 porte **sur le contenu de la page seule**, pour que l'étape reste validable ; les questions vidéo s'ajouteront au même bloc `NET-Q8` | ✅ |
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

