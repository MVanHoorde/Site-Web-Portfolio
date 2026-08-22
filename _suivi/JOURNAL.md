# Journal du projet

> **En ajout seul.** On n'y corrige rien, on n'y relit rien par défaut : c'est la
> mémoire longue. L'état courant vit dans `ETAT-PROJET.md`, les décisions dans
> `DECISIONS.md`.
>
> Ce fichier absorbe, au 23/07/2026 : l'ancien `ETAT-PROJET.md` (format
> chronologique), la note de reprise `Reprise_IA-SNT_et_affichage-eleve.md` et le
> brief `BDD-brief-jalon4.md`. **Rien n'a été supprimé** — les alertes techniques
> par chapitre (T2-C2 Ex8, T3-C2 nœud B, T3-C4 corrections à valider…) sont
> conservées telles quelles plus bas et restent la référence pour le régime B.

---

## 21/08/2026 — Le module transversal « Représenter l'information »

Écriture d'une neuvième page de séquence SNT, `snt-m1`, à partir du brief du
même jour. Le binaire, l'octet et les ordres de grandeur y deviennent un
**module** et non un thème : le préfixe `m` le dit, et c'est ce préfixe qui a
fait tout l'intérêt technique de la session.

**Ce qu'un nom hors série révèle.** Le dépôt énumère les huit thèmes dans
**quatre** listes en dur. Le brief en avait repéré trois ; la quatrième —
`generer-questions.mjs`, le répertoire des questions libres du tableau de bord —
n'apparaissait nulle part. Le module n'a aucune question libre aujourd'hui, donc
rien ne cassait : la première ajoutée aurait simplement manqué au tableau de
bord, sans erreur. Les quatre listes ont été élargies. La plus dangereuse était
le filtre `pagesSNT` de `verifier.mjs` : une page qui lui échappe échappe aussi
au contrôle `localStorage`, donc au garde-fou RGPD. Testé en y glissant un
`localStorage` volontaire, vérifié détecté, puis retiré.

**Trois bugs que seule l'exécution pouvait montrer.** Les deux composants SVG
(tableau des poids, potence) se dessinaient pendant que leur étape était encore
masquée — largeur nulle — et choisissaient donc la mise en page mobile *pour de
bon*, y compris sur un écran de 1280 px. Corrigé par un `ResizeObserver`, qui se
déclenche aussi à l'ouverture de l'étape. La première correction laissait encore
la potence en colonne à 820 px : le garde-fou protégeait la comparaison mais pas
le dessin, les deux suivent maintenant la même règle. Troisième : les encarts
intermédiaires utilisaient `.retain`, qui porte son propre bandeau « À RETENIR »
— l'élève le voyait deux fois par étape. Une classe locale `.point-cle` les
remplace.

**La tolérance de saisie, mesurée plutôt que supposée.** Le cadrage demandait
d'accepter le groupement par 4 (`1010 1100`). En rejouant le comparateur du
moteur sur toutes les chaînes binaires jusqu'à 12 bits, le compte est tombé :
ajouter la variante espacée ferait passer **289 saisies fausses pour justes** sur
six items seulement — `1111111` accepté pour `11111110`. La cause est dans
`seuil()` : le test `/^[0-9]+$/` ne reconnaît pas un nombre écrit avec des
espaces, et l'attente bascule sur une tolérance Levenshtein de 2. Sur l'atelier
des grandeurs, la variante « 16 000 » aurait fait accepter **160000** — une
erreur d'un facteur dix validée comme juste. Le module s'en tient donc à une
consigne « sans espace », zéro faux accepté.

Le même test a montré que **`t1` porte déjà cinq variantes dans ce cas**, dont
« 40 000 », qui accepte aujourd'hui `40 001`. Correctif d'une ligne, mais il
touche le moteur partagé et imposerait de repasser toutes les versions d'assets :
Loïc a tranché le jour même pour **signaler sans toucher**, le chantier est
ouvert dans `DECISIONS.md`.

**La potence.** Le brief fournissait deux photographies de la correction
manuscrite de Loïc (90 et 434) comme modèle à reproduire. Le SVG en reprend le
geste dans l'ordre : l'escalier des divisions, le diviseur à droite du trait, les
restes encadrés, les flèches de remontée, le résultat en `nombre₁₀ = bits₂`.
Trois écarts assumés et signalés — les restes sont en `--activity` et non en
rouge, parce que `--err` marque le faux partout ailleurs dans le dispositif ; la
potence s'arrête au dernier quotient non nul, là où la correction manuscrite
poussait une division de plus avec un reste entre parenthèses (arbitré par Loïc) ;
et un champ « essaie avec ton nombre » a été ajouté, validé lui aussi.

**Le parcours élève a été joué en entier** dans un navigateur sans interface, pas
seulement relu : 18 trous sur 18 justes, QCM 3/3 et 4/4, cinq étapes validées sur
cinq, séance 2 déverrouillée, fiche téléchargée portant les douze réponses
d'atelier. Aucune erreur JS en 390, 820, 1280 px ni en `prefers-reduced-motion`.
`verifier.mjs` reste à 19 problèmes — les mêmes qu'avant, tous hors SNT.

Deux défauts partagés relevés au passage, hors périmètre : le titre des fiches
colle le numéro au titre (« S1Compter comme une machine »), et le §3 des
consignes SNT décrit encore un trajet d'étape où le « à retenir » précède le
champ, alors que les décisions des 25 et 26/07 l'ont descendu après, en
révélation automatique.

Rien n'est validé : tout le contenu pédagogique du module est une proposition.

---

## 20/08/2026 (suite) — Le `013` est passé en base

Loïc a exécuté `bdd/schema/013-verrou-progression.sql` au SQL Editor. Vérifié
depuis le dépôt sans identifiants : un appel anonyme à `rpc/mon_plafond` répond
`42501 permission denied`, là où une fonction absente répondrait `PGRST202`. La
fonction existe donc, et n'est ouverte qu'aux comptes connectés — le `revoke`
du fichier a bien pris.

Le plafond d'avance est **actif de bout en bout** : réglages sur `classes`,
fonction en base, `verrou-snt.js` sur les pages, dates de clôture au tableau de
bord. Ce qui reste tient au fond, pas à la technique : les deux textes vus par
les élèves attendent toujours un arbitrage.

Le fichier n'a pas été copié dans `supabase/migrations/`, qui s'arrête au `011`.
Le chemin est donc tranché pour ce fichier — SQL Editor — mais le dossier de
migrations décrit désormais une base qui n'existe plus : question portée en
attente d'arbitrage.

---

## 20/08/2026 (suite) — Trois bugs, trouvés en tirant sur le même fil

Session partie d'une capture d'écran : le tableau de bord refusait d'enregistrer
une séance, `PGRST102 « All object keys must match »`. Chaque correctif a fait
apparaître le suivant.

**① Le lot d'objets mal formé.** Les lignes de `seances_faites` étaient
construites à géométrie variable : `faite_le` seulement pour les séances déjà en
base, les trois textes du cahier de textes seulement pour la séance du jour.
PostgREST exige des clés identiques sur tout le lot. Cocher S1 (ancienne) et S2
(du jour) ensemble — le cas normal d'une fin d'heure — et rien ne partait.
Sept clés pour toutes les lignes désormais. **Audit demandé par Loïc** : une
seule écriture du dépôt envoie plusieurs objets d'un coup, les huit autres
passent un objet unique. Le reste du dispositif ne peut pas rencontrer ce cas.

**② Le message du bandeau écrit dans le compteur.** Signalé par une seconde
capture, côté élève cette fois : le mot du plafond s'affichait en chasse fixe,
débordant du cadre, pendant que le vrai message se tassait sur trois mots de
large. `verrou-snt.js` visait `span:last-child` pour remplacer le texte — mais
`compteurSeances()` ajoute *après coup* un `<span class="compte">5 étapes</span>`
qui devient le dernier enfant. Second dégât, invisible à l'écran : au dégel du
plafond, « 5 étapes » revenait à la place du message de mérite.

**③ Le sablier qui ne s'affichait jamais, puis t0 qui ne se verrouillait pas.**
En vérifiant le rendu, le pictogramme restait `🔒` là où le CSS prévoit `⏳`.
Une séance plafonnée cumule presque toujours `.locked` et `.plafonne` : à
spécificité égale, la dernière règle écrite gagne, et le sablier était écrit
avant. En corrigeant, découverte que **six pages portent une copie inline du CSS
de séquence** — `t0`, `t3` à `t7` — et qu'aucune n'avait le bloc `.plafonne` :
ni teinte d'attente, ni sablier. Puis, en mesurant `t0` dans le navigateur :
`data-sequence` **absent de son `<body>`**. La page chargeait `verrou-snt.js`
depuis son branchement pour n'en rien faire — le plafond n'y fermait rien, sans
le moindre message d'erreur, puisque tous les replis vont dans le sens de
l'ouverture.

**Ce que la méthode a changé.** Les trois derniers points ne se voyaient pas dans
le code : le Chromium sans interface a servi à *mesurer* le rendu — police
calculée du message, `content` du `::before`, teinte du bandeau, débordement —
sur `t1` (feuille partagée) et sur `t0` (CSS inline), en mode élève et en mode
enseignant. Le `data-sequence` manquant est sorti d'une sonde écrite pour
comprendre un « aucune séance plafonnée » inattendu.

**Livré** — `prof/index.html` (enregistrement réparé, **dates de clôture**
ajoutées sur les cases de clôture et sur la frise du plafond, format `12/09`,
date découpée à la main et jamais via `new Date(iso)` qui parse en UTC),
`verrou-snt.js?v=2`, `sequence-snt.css?v=31`, le bloc `.plafonne` dans les six
pages à CSS inline, `data-sequence="snt-t0"`.

**Non vérifié en vrai** : l'affichage des dates dans le tableau de bord, qui
demande une session Supabase que le navigateur sans interface n'a pas.

---

## 20/08/2026 (suite) — Le plafond d'avance

Le verrou entre séances existait depuis l'origine : la séance N+1 s'ouvre quand
la N est finie. C'est du **mérite**, sans plafond — un élève rapide traversait la
séquence en une soirée. On pose un **plafond par-dessus** : une classe ouvre au
plus `avance_max` séances (2 par défaut) au-delà de la dernière séance
réellement faite, **toutes séquences confondues**. Les deux s'additionnent.

**Le travail venait d'ailleurs.** Une session distante avait écrit et éprouvé
l'ensemble, sans droit de pousser ; la consigne reçue décrivait deux voies —
appliquer le patch, ou rejouer le diff. **Ni le patch ni les diffs n'étaient sur
la machine** (rien dans `~/Downloads`, rien à la racine), et les deux fichiers
neufs n'étaient pas non plus dans le document. Tout a donc été **réécrit** à
partir de la spécification, sur la branche `claude/pc-access-2jfbye`.

**Un piège de cache évité de peu.** La consigne demandait de passer
`sequence-snt.js` de `?v=29` à `?v=30`. Or `v=30` avait déjà été posé le matin
même, pour la correction du lanceur de QCM, et **poussé**. Garder ce numéro
aurait laissé les navigateurs qui ont déjà chargé la page servir un moteur sans
plafond, indéfiniment et sans un signe. Le moteur passe donc en **`?v=31`**, la
feuille en `?v=30` (elle change aussi : le bandeau du plafond a sa teinte).

**Le curseur ne se saisit pas.** Il se déduit de `seances_faites`, donc de la
clôture déjà faite pour le cahier de textes — prolongement direct de la décision
du 31/07. Aucune saisie nouvelle, et rien à reprendre le jour où Loïc recule une
séance.

**Ce qui a demandé le plus d'attention, c'est de ne pas mentir.**
`seances_faites` porte les notes et le travail donné : une policy de lecture
l'aurait ouverte aux élèves. D'où `mon_plafond()`, `security definer`,
`search_path` vide, qui ne rend que des couples (séquence, séance). Et côté
page, une séance fermée par le plafond ne peut pas afficher « finis la séance
précédente » à un élève qui l'a finie : `.locked` porte les deux verrous, mais
`.plafonne` choisit le texte.

**Vérifications.** 21 assertions sur le module sans DOM — ordre global des huit
thèmes, classe neuve, `avance_max` à 0, soupape, franchissement de fin de thème,
séance absente du référentiel, doublons dans les séances faites. Puis un harnais
DOM dans Chromium, qui montre la chaîne complète : s2 fermée par le mérite garde
son bandeau d'origine, s3 et s4 fermées par le plafond reçoivent le nouveau. Les
quatre pages réelles se rendent sans rien perdre (numérotation intacte, 13 et 12
lanceurs de QCM, 8 cartes au hub). `node verifier.mjs` : 19 problèmes, les mêmes
qu'avant, aucun ajouté.

**Deux choses restent, et elles ne sont pas de mon ressort.** Le `013` n'est pas
appliqué — tant qu'il ne l'est pas, `mon_plafond()` n'existe pas et **rien n'est
fermé**, ce qui est le repli voulu mais pas le service rendu. Et il n'a **pas**
été copié dans `supabase/migrations/` : ce dossier s'applique tout seul au push,
y déposer le fichier aurait exécuté du SQL en base sans décision explicite.
Loïc choisit son chemin — et les deux textes vus par les élèves attendent sa
validation.

---

## 20/08/2026 — Les QCM des deux vidéos, et ce qu'ils ont fait remonter

Loïc a fourni les **transcriptions intégrales** des vidéos de M Bidouille (câbles
sous-marins) et de Cookie connecté (DNS). La décision du 25/07 — « les questions
sur une vidéo, c'est Loïc qui les écrit, l'IA ne visionne pas » — tombe : le
modèle ne voit pas, mais il lit, et chaque question peut alors être **ancrée sur
un passage cité**. 15 propositions par vidéo, 10 retenues par Loïc.

**Ce qui est en ligne.** `NET-Q-cables`, 15 questions dans le bonus de l'étape
3.5 — hors 100 %, donc facultatif. Et 14 questions ajoutées à `NET-Q8` (étape
5.3), qui en compte maintenant 18 : les 4 premières sur la page, les suivantes
sur la vidéo. La question sur la *délégation* a été retirée par Loïc.

**Trois choses ont été trouvées en chemin, et aucune n'était le sujet.**

**1. Je me suis trompé de numéro d'étape, et Loïc a eu raison de le relever.**
J'avais annoncé la vidéo des câbles « en 2.5 » en lisant le `<span class="ix">`
du HTML. Or `numeroter()` **recalcule** tous les index au chargement, depuis le
rang de l'étape dans sa séance : à l'écran, c'est **3.5**. Les numéros écrits en
dur sont des vestiges morts, laissés tels quels. La leçon vaut au-delà du cas :
**sur cette page, la source ment, seul le rendu dit vrai.** Vérification faite en
Chromium headless, DOM à l'appui.

En revanche, les **renvois en toutes lettres** ne sont recalculés par personne.
Neuf étaient faux, dont quatre visibles des élèves : deux bulles « à voir plus
tard » renvoyaient à « l'étape 3.3 » au lieu de 4.3, et deux textes parlaient de
la « séance 2 » pour une notion vue en séance 1 (le datagramme, la bascule de
1983). Corrigés, DOM re-rendu **identique au caractère près**.

**2. Le lanceur de QCM mentait sur un bonus.** Sa consigne était en dur :
« Obligatoire pour valider l'étape ». Posée sur un QCM de bonus — sans
`data-gate`, donc hors validation et hors 100 % — elle était fausse. Elle dépend
maintenant du gating de l'étape. Le défaut existait déjà : `WEB-Q2b`, dans la
séquence du Web, l'affichait à tort depuis son portage. `sequence-snt.js` passe
en `?v=30` sur les deux pages qui le chargent.

**3. Le biais de longueur, mesuré.** Loïc a relevé que dans mes premières
propositions, la bonne réponse était « juste plus longue ou plus précise ».
Exact, et mesurable : reprise complète des 30 questions, écart moyen entre la
bonne réponse et ses distracteurs ramené de plusieurs caractères à **−0,9** et
**0,0**. Le contrôle de `verifier.mjs` (posé le 01/08) reste plus strict que
cette moyenne : il signale dès que la bonne réponse est **strictement** la plus
longue ou la plus courte, sans regarder l'ampleur. Sur les **60 questions** qu'il
signale aujourd'hui dans tout le projet, **13 le sont pour un écart de 1 à 3
caractères** — invisible pour un élève — pendant que la queue de distribution
monte jusqu'à **74 caractères**. Le bruit masquait les vrais cas.

**Seuil affiné dans la foulée.** Le détecteur ne constate plus, il mesure : écart
d'au moins **6 caractères** avec l'option la plus proche **et** d'au moins **15 %**
de la longueur moyenne des options — un même écart de 10 caractères saute aux yeux
sur des options de 20 et disparaît sur des options de 90. Au-delà de **12
caractères et 30 %**, la question est **marquée 🔴**. La liste est triée par
ampleur décroissante et l'écart figure dans le message, ce qui permet d'attaquer
par le haut. Le filtre « options courtes » de la première version disparaît : il
ne servait qu'à compenser l'absence de mesure. On passe de 60 signalements à
**43, dont 34 marqués**, 33 écarts étant écartés comme non significatifs. Aucune
des 29 questions posées aujourd'hui n'est retenue par le nouveau critère — les 8
qu'elles ajoutaient à l'ancien tenaient toutes à 3 caractères ou moins.
`node verifier.mjs --qcm` sort la liste complète pour le chantier à venir.

---

## 19/08/2026 (suite) — Première inscription réelle : deux pièges d'authentification

La première tentative de création de compte sur le livret a échoué, et le
message affiché était faux. Deux défauts, tous deux dans `progression.js`,
tous deux invisibles jusqu'à ce qu'un humain s'assoie devant le formulaire.

**1. Le message mentait.** `creerCompte()` traduisait tout 400/422 de GoTrue en
« cet identifiant est déjà pris ». Le serveur, lui, répondait
`weak_password` : le projet Supabase exige une minuscule, une majuscule et un
chiffre. L'élève changeait donc d'identifiant à chaque essai — `cfatest`,
`cfatest01`, `cfatest02`, `cfatest02-` — sans jamais toucher à son mot de passe,
la seule chose qui n'allait pas. Diagnostic fait en interrogeant directement
l'API d'authentification, avec un identifiant qui existait déjà pour ne rien
créer.

Le client lit maintenant `error_code`, distingue quatre motifs (mot de passe
faible, identifiant pris, identifiant refusé, trop de tentatives), et **annonce
la règle sous le champ** au lieu de la faire découvrir par l'échec.

**2. L'impasse du compte à moitié créé.** Créer un compte se fait en deux temps —
le compte d'authentification, puis l'inscription en classe. Si le second échoue
seul (code de classe faux, réseau coupé), il reste un compte que `ma_session()`
ne voit pas : l'élève est traité comme non connecté, et « Créer mon compte » lui
répond éternellement que son identifiant est pris. Aucune sortie.
« Créer mon compte » tente désormais une connexion de secours avec le mot de
passe saisi : si elle passe, c'est bien son compte, et l'inscription en classe
reprend là où elle s'était arrêtée.

**Portée.** Les deux correctifs valent aussi pour les séquences SNT, qui
partagent ce fichier. `progression.js` passe en `?v=14` sur les vingt-trois
pages qui le chargent — les quatre pages SNT en étaient restées à `?v=13`, les
dix-neuf pages CFA à `?v=3` : deux numérotations pour un même fichier, alignées
à cette occasion.

---

## 19/08/2026 (suite) — Le livret CFA rejoint le dispositif de comptes

Demande : « est-ce qu'on peut mettre en place ce que l'on a fait pour les
comptes SNT ? j'aimerais que leurs données soient sauvegardées ».

**Ce qui n'a pas eu à être fait.** Le socle de juillet était bien dimensionné :
la table `progression` accepte des clés libres dans un domaine `cours` déjà
ouvert, et `progression.js` savait déjà se poser sur n'importe quelle page
(`data-accueil="hub"` d'un côté, badge ou bandeau de l'autre). **Aucune table
créée, aucune colonne ajoutée, aucune migration.** Le seul SQL est l'ouverture
de deux codes de classe.

**Ce qui a été fait.** `cfa-livret.js` réécrit autour d'un *dépôt* : une couche
unique qui sait où va le travail, et deux implémentations derrière —
`localStorage` sans compte, base une fois connecté. Le reste du fichier (barre
de symboles, champs, marqueur, compteur) ignore complètement lequel des deux
tourne, ce qui évite d'avoir deux versions de la même logique à maintenir.

Une ligne de `progression` par fiche, valant `{ v, champs, fait }` — pas une
ligne par champ. Motif : `Progression.ecrire()` fait une fusion superficielle,
et une fiche à quinze champs coûterait quinze allers-retours au chargement sur
le wifi d'un atelier.

**Le point qui a demandé le plus de soin** n'est pas le branchement mais la
**reprise du travail fait sans compte**. Un apprenti travaille trois fiches en
invité, se crée un compte, et trouve son espace vide : le compte lui aurait
alors fait perdre exactement ce qu'il devait lui garantir. Au premier chargement
connecté, toutes les clés `cfa-` du navigateur sont regroupées par fiche et
remontées — **mais la base gagne toujours** : on ne pousse qu'un champ qu'elle
n'a pas, jamais par-dessus une réponse reprise en ligne. Les clés locales
reprises sont ensuite effacées.

**Le piège, et il était réel.** Les dix-sept fiches promettaient « rien n'est
envoyé, ni à ton professeur, ni à personne d'autre ». Brancher sans y toucher
aurait fait du livret une collecte silencieuse assortie d'une promesse écrite du
contraire. La mention est maintenant portée par `data-mention-donnees` et
réécrite selon le régime réel ; le bandeau de `progression.js`, qui annonce un
travail perdu (vrai en SNT, faux ici), se surcharge par `data-renvoi-texte`.

**Vérification.** Dix-neuf assertions en Chromium sans interface, en deux
passes : le régime sans compte sur les vraies pages (écriture, rechargement,
compteur, modale du hub), puis le régime connecté sur un faux client — reprise
du travail local, non-écrasement de la base, survie des autres réponses d'une
même fiche à chaque écriture, une seule requête pour huit frappes, et le chemin
d'erreur quand la base ne répond pas. Mise en page des dix-huit pages recontrôlée
au passage : rien n'a bougé.

**Reste à faire à la main** : exécuter `bdd/schema/012-classes-cfa.sql` dans le
SQL Editor de Supabase. Tant que ce n'est pas fait, les codes `CFA26A` et
`MVT26A` n'existent pas et aucun apprenti ne peut créer de compte.

---

## 19/08/2026 (suite) — Livret CFA : audit de contenu des dix-sept outils

Audit dicté outil par outil, du 0 au 16. Relevé mis au propre dans
`CFA-audit-a-traiter.md` avant toute modification — treize points transversaux
et le détail fiche par fiche — puis traité en une passe.

**Trois arbitrages ont été demandés avant de commencer**, et ils commandent tout
le reste : l'accroche s'adresse à l'atelier avec un encart BTS séparé ;
l'écart relatif se note `ε` ; on commence par le socle CSS, puis l'Outil 0.

**Ce qui a changé sur le fond**

- L'Outil 0 perd son tableau de barème (« aucun intérêt »), cite la question
  posée avant de montrer la copie de l'élève, et son palier 3 ne demande plus de
  « relever les données utiles » — cette consigne n'existe pas dans un sujet.
- L'Outil 1 explique enfin *pourquoi* les unités comptent : une formule s'apprend
  avec ses unités, et l'erreur d'unité est la seule qui ne se voit pas dans une
  copie. Le tableau des conversions porte l'exposant `n` dans son en-tête et
  l'égalité en toutes lettres sous chaque facteur.
- L'Outil 2 traite les **deux sections d'un vérin** — sortie de tige, disque
  entier ; rentrée de tige, couronne — dans la règle, dans la figure, dans
  l'exemple et dans les trois paliers. C'est la première source d'erreur du
  chapitre et elle n'était nulle part.
- L'Outil 8 disait faux : « une erreur fait tomber tout ce qui suit ». Sur une
  copie, on ne perd les points qu'une fois ; ce qui compte ensuite, c'est la
  cohérence. Réécrit, avec l'ouverture « tout écrire d'un seul coup » en fin de
  fiche et un palier 3 sans aucune étape intermédiaire.
- Les vecteurs (14, 15, 16) : la notion de **composante** est enfin expliquée là
  où elle apparaît pour la première fois, schéma à l'appui ; les trois fiches
  gagnent des figures là où la formule seule était illisible.

**Ce qui a changé sur la forme**

Socle CSS d'abord (`?v=7`) : `.vec`, `.rac`, `.grec`, indices en Garamond
romain, `.eq-exo` sans retrait. Puis les figures : angle posé sur un côté du
triangle (11, 12, 14, 16), angle droit au mauvais sommet (10), axes sans pointe
de flèche (14, 16), libellés hors `viewBox` (14). Deux figures ne correspondaient
pas à leur énoncé : le vérin du palier 2 de l'Outil 14 était tracé à 18° pour un
énoncé qui annonce 40°, et les vecteurs du palier 1 ne montaient pas du nombre de
carreaux annoncé — les normes ne tombaient pas rondes sur un palier où personne
ne doit pouvoir échouer.

**Deux figures produites** là où le texte renvoyait à un dessin absent : le bras
de levage coté de l'Outil 5 (l'énoncé disait « reproduit ci-dessus » sans rien
au-dessus) et le schéma des composantes de l'Outil 14.

**Vérification** : les dix-huit pages repassées au harnais de mesure (bord
d'attaque, débordement horizontal, texte SVG hors `viewBox`, tableaux trop
larges) — aucun défaut. Les deux fiches A4 existantes tiennent toujours en
exactement deux pages à l'impression.

**Reste** : la validation de Loïc, outil par outil ; la passe impression sur les
dix-sept fiches A4 ; les quinze fiches A4 encore à produire.

---

## 19/08/2026 — Livret CFA : passe de mise en page sur les 18 pages écran

Motif : « tu as tout centré » et « de nombreux problèmes de localisation du
texte ». Vérification faite dans un Chromium sans interface (le `chrome-headless-shell`
déjà présent avec Playwright), captures à l'appui — c'est ce qui a permis de voir
que le problème n'était pas un excès de goût pour le centrage mais **trois bugs**.

**Ce qui n'allait pas, par ordre de gravité :**

1. `--mesure: 68ch`. L'unité `ch` dépend de la police de l'élément : chaque bloc
   obtenait sa propre largeur, et comme tous étaient centrés, le bord gauche
   descendait en escalier sur cinq positions différentes. Un livret sans ligne de
   fuite.
2. `.methode li { display: grid }`. En grid, chaque enfant devient une cellule :
   les `<strong>` au milieu des phrases partaient seuls à la ligne. **La règle de
   l'Outil 6 s'affichait à un mot par ligne** — c'est l'exemple qu'avait donné
   Loïc, et le pire défaut de la série.
3. Le témoin « enregistré sur cet appareil », posé par `cfa-livret.js` après
   chaque champ, est en `display: block` : après une case `input.trou`, il
   renvoyait l'unité à la ligne suivante. Les quinze lignes du tableau de gammes
   de l'Outil 1 se lisaient sur deux lignes chacune, la case au-dessus de « mm ».

**Trois autres défauts trouvés en cherchant :** les tableaux centraient leur
contenu par défaut (six pages portaient déjà des rustines `text-align: left`) ;
`figure.figure` redéclarait le raccourci `margin`, ce qui remettait ses marges
latérales à zéro et faisait sortir toutes les figures de la colonne ; et **quatre
figures avaient du texte hors `viewBox`**, rogné en plein mot par le SVG —
« SOH — sin α = opposé / ».

**Méthode qui a servi et resservira** : plutôt que de relire dix-huit pages à
l'œil, trois audits automatiques dans le navigateur — bords gauches de tous les
enfants directs comparés à la médiane, débordements horizontaux, et `getBBox()`
de chaque `<text>` SVG comparé au `viewBox`. Les trois passent à blanc en fin de
session. Le script vit dans le scratchpad, il est trivial à réécrire.

Décisions dans `DECISIONS.md` (six entrées au 19/08), règles de production dans
`CONSIGNES-fiche-outil-CFA.md` §6.

**Non traité, volontairement** : les fiches A4 (`fiches/cfa/`), qui seront
refaites après validation des versions en ligne — donc aussi leur logo cassé
(`logo-isaac.png`, le fichier s'appelle `logo-isaac-baseline.png`) et leur
désaccord avec l'écran (« les cinq étapes » contre « les quatre étapes »).

---

## 23/07/2026 — Audit complet du dépôt

Audit exhaustif (SNT en priorité, puis l'ensemble du site). Constats principaux :

- **≈ 375 000 tokens** pour lire tout le projet — au-delà d'une fenêtre de
  contexte. `pages/2nde-snt-t1-internet.html` seul pèse ≈ 109 000 tokens.
- **6 contradictions** dans les fichiers de référence, dont **5 dans le seul §7**
  de `CONSIGNES-sequence-SNT.md` : région « Francfort » au lieu de Paris ·
  identification par connexions anonymes · « aucun mot de passe en base » ·
  « API Mistral ou modèle local » · « le worker réécrit le statut ». Toutes
  corrigées ce jour.
- **~260 ko de code dupliqué** : sept séquences partagent 98 % du même CSS/JS.
  `t1` a forké (CSS 60 %, JS 34 % de similarité avec le Web) et porte **seule**
  les 10 mécanismes du §15 — aucun n'est porté ailleurs.
- **La boucle SNT est ouverte** : rien dans le dépôt ne peut écrire
  `statut = 'corrige'`. L'élève ne voit donc jamais son retour.
- **94 couleurs en dur** hors `:root` et **144 attributs `style=`** dans `t1`
  (0 et 15-38 dans les autres séquences).
- **196 liens `href="#"`** visibles des élèves ; 1 lien réellement cassé
  (`term-spe-physique-chimie.html` → `docs/tp-1-1.pdf`).
- Le code enseignant `ROUTAGE` figurait **en clair** à côté de son empreinte
  SHA-256, et dans une note de chantier. Corrigé.
- Un `<aside class="chantier">` de `t1` (étape 3.3) n'était pas encadré par les
  marqueurs `<!-- CHANTIER -->` : il aurait survécu au nettoyage de validation
  et se serait affiché en classe. Corrigé.
- `bdd/schema/003` a été modifié après exécution (un commentaire seulement), ce
  que la discipline de `bdd/README.md` interdit. Règle à tenir, ou à relaxer
  explicitement en « commentaires autorisés ».
- `assets/img/snt/` a gardé les noms bruts de Wikimedia (majuscules, doubles
  underscores) : risque de 404 en production, Windows étant insensible à la casse
  et GitHub Pages non. Aujourd'hui tout correspond.
- `maquette-affichage-eleve.html`, annoncée « à garder en référence », n'est pas
  dans le dépôt. `moteur.mjs` est toujours en `temperature: 0.2` — préalable non
  levé avant tout re-benchmark.
- **Deux backends parallèles** : SNT sur Supabase (en service) et ES sur
  `serveur-frise/` (à héberger, auth/HTTPS/purge à faire). Même finalité.

Vérifié et **sans défaut** : aucun CDN ni Google Fonts sur les 8 séquences ·
aucun `localStorage` de progression (les 5 occurrences dans `t1` sont des
commentaires qui rappellent l'interdiction) · équilibre des `<div>` parfait sur
les 8 · 0 erreur de syntaxe sur les 76 blocs JS inline des 48 pages et sur les
8 fichiers `.mjs`/`.js` · 0 `id` dupliqué · 0 `<img>` sans `alt` · `?v=2`
cohérent sur les 17 fichiers · aucune dérive entre `bdd/schema/006` et la
migration Supabase (mêmes 10 policies, mêmes 4 fonctions) · les 8 cas de
`_test-verdict.mjs` passent.

**Fausse alerte levée** : la policy `reponses_reecrire` semble interdire le
renvoi après correction (`correction_ia is null`), mais le déclencheur
`before update` de 005 remet `correction_ia` à NULL **avant** l'évaluation du
`WITH CHECK` par PostgreSQL. Ça marche, et c'est finement pensé. Reste un cas
limite : renvoyer un texte **identique** ne déclenche rien et produit une erreur
HTTP brute — une ligne dans `envoyerReponse` suffirait.

**Bug ouvert — l'aide aux camarades est inatteignable.** `calculerAide()` fait le
ratio des critères « observé » sur le **total** (socle + `plus_loin`), seuil 2/3.
Or NET-1b a 1 socle pour 4 `plus_loin` → un élève au socle parfait plafonne à
0,20 ; NET-2c plafonne à 0,50. La suggestion « à valider » ne peut donc jamais
sortir. Contraire au principe affiché (« `plus_loin` ne bloque jamais »).
`_test-verdict.mjs` ne le voit pas : il n'assert que le verdict, jamais l'aide.

Corrections appliquées le même jour : les 6 corrections de vérité, la
restructuration de `_suivi/`, `MANIFESTE.md`, `verifier.mjs`, la fuite du code
enseignant, le bloc CHANTIER non encadré, le commentaire « note » de
`bdd/schema/003`.

---

## Archive — ancien `ETAT-PROJET.md` (format chronologique, jusqu'au 22/07/2026)


Vue d'ensemble. Détail par chapitre dans `chapitres.md` ; idées dans `IDEES.md`.
Contexte et règles de collaboration : `CLAUDE.md` à la racine. Consignes de
production, un fichier par gabarit : `_modeles/CONSIGNES-chapitre-PC.md` et
`_modeles/CONSIGNES-sequence-SNT.md`.

---

## 🎨 Identité graphique (décision du 16/07)

**Reliure « papier d'étude »** (variante B validée sur maquettes) appliquée à la
**coque du site uniquement** : accueil refondu (page de titre, gravure du jour en
rotation quotidienne, table des matières des classes, Mission Spectra), pages de
niveau via `style.css`, et fond/nav/pied des pages de chapitre via un bloc
`reliure-papier-etude` injecté (aussi dans `gabarit-chapitre.html`).
**L'intérieur des cours est intact** : encarts Hα/Hβ/Hγ, panneau de formule
sombre, verrou, JS — rien n'a bougé (vérifié par Playwright).
EB Garamond auto-hébergée (RGPD) dans `assets/fonts/`. Les 8 gravures du domaine
public restent à déposer dans `gravures/` (voir `gravures/A-LIRE.txt`) ; en
attendant, l'accueil affiche un cadre vide annoté.

---

## ⏳ En attente de Loïc — rappels récurrents

> Tâches côté Loïc, à ressortir régulièrement tant qu'elles ne sont pas cochées.
> Claude : rappeler ces points quand on retravaille le site (surtout l'accueil).

**Gravures de l'accueil** (domaine public, à déposer dans `gravures/` — détail et
sources dans `gravures/A-LIRE.txt`). Tant qu'un fichier manque, l'accueil montre
un cadre vide annoté à la place de la planche.

- [ ] `01-prisme-newton.jpg` — Newton, prisme, 1704
- [ ] `02-machine-nollet.jpg` — Nollet, machine électrostatique, 1743
- [ ] `03-alambic-encyclopedie.jpg` — Encyclopédie, distillation, 1765
- [ ] `04-pile-volta.jpg` — Volta, la pile, 1800
- [ ] `05-camera-obscura.jpg` — Kircher, chambre noire, 1646
- [ ] `06-barometre-torricelli.jpg` — Torricelli, baromètre, 1644
- [ ] `07-champ-faraday.jpg` — Faraday, lignes de champ, 1852
- [ ] `08-spectre-fraunhofer.jpg` — Fraunhofer, spectre solaire, 1814

**Autres retouches d'accueil en attente**

- [ ] Remplacer le courriel placeholder `prenom.nom@exemple.fr` par la vraie adresse
- [ ] Mettre le vrai lien de l'espace classe ENT (actuellement `href="#"`)
- [ ] (plus tard) Créer la page « collection de gravures » ; le lien
      « Parcourir la collection » de l'accueil boucle pour l'instant sur `#gravures`

**Base de données — vigilance permanente** (pas une case à cocher, un réflexe)

- Le PC de Loïc porte les deux tâches planifiées et, bientôt, le worker de
  correction IA. **Sept jours consécutifs sans allumer le PC = projet Supabase
  mis en pause.** Rien n'est perdu, la relance se fait d'un clic au tableau de
  bord — mais le site ne répond plus tant qu'elle n'a pas eu lieu.
- Vérifier de temps en temps `C:\Sauvegardes-SNT\journal.log` : une ligne `OK`
  par semaine. Une ligne `ECHEC` ou une absence de ligne = sauvegarde muette.
- Faire le ménage dans `C:\Sauvegardes-SNT` quand la base contiendra des
  copies d'élèves (règle de purge à ajouter au script à ce moment-là).

---

## 🎯 Objectif de la période (vacances)

**Dégrossir un maximum de chapitres** (régime A) : mettre TOUT en ligne à l'état
d'ébauche navigable, manques signalés par blocs 🚧. Loïc va déposer les PPTX de
tous les chapitres. Le raffinage et la **validation** viendront ensuite, en
régime B, chapitre par chapitre.

**Régime A élargi depuis le 15/07** (voir `_modeles/CONSIGNES-chapitre-PC.md`) :
exercices et corrections rédigés en entier même quand une image les accompagne,
encarts formule reconstitués depuis la source, QR codes et hyperliens vidéo
décodés et posés en vrais liens (Kahoot compris), courte recherche web possible
si un point manque pour la compréhension. Restent en régime B : photos réelles,
schémas/illustrations à redessiner en SVG, grands tableaux, et — toujours —
le lien du DS (jamais posé automatiquement, quel que soit le contenu de la
source, puisqu'il change chaque année).

## ⚠ Statut de validation — à lire

- **Aucun cours n'est validé à ce jour.** Certaines fiches ont été *proposées*
  (C2, C3, C4) mais **aucune n'est validée**.
- La **mise en ligne n'est pas un jalon** : tout est / sera en ligne. Ce qui se
  suit, c'est le **niveau de finition validé** (jalons 2 → 7 de `chapitres.md`).
- La validation est un **acte explicite de Loïc** (« oui, ce cours me convient,
  je peux l'utiliser l'an prochain »), jamais présumée par Claude.

## 🚦 Priorités

1. **Finir le dégrossissage** de tous les chapitres disponibles (régime A).
2. Mettre en place le travail en **Claude Code / VS Code** pour le raffinage.
3. Démarrer le raffinage + la validation, en commençant par les chapitres les
   plus utilisés en début d'année.
4. Intégrer le **calendrier scolaire** (fourni plus tard) pour ordonner les priorités.
5. 🆕 **Volet base de données** — jalons 4 à 7 (voir `_suivi/BDD-cadrage.md`).
   Ne bloque pas la rentrée : le site reste fonctionnel sans, mais c'est le
   socle du RPG et du suivi réel de progression.
6. 🆕 **SNT-T1 Internet — relire la séquence après les lots A→E du 21/07.**
   Six chantiers d'affilée y ont touché : numérotation des étapes, frise devenue
   exercice, glossaire automatique, images ré-agencées et ré-optimisées, QCM
   élargi, fiche téléchargée enrichie. C'est la séquence la plus avancée du
   site : elle sert de référence aux sept autres, donc **la valider avant de
   décliner**.

## ⚠ Alertes

- 🆕 **SNT-T1 — défaut de structure corrigé le 21/07, à surveiller ailleurs.**
  Un `</div>` surnuméraire refermait le conteneur `.wrap` au milieu de la page :
  quatre séances sur cinq s'affichaient **sur toute la largeur de l'écran**, hors
  colonne, et le bouton « Étape suivante » remontait au milieu du parcours. Rien
  ne le signalait — ni erreur JS, ni page cassée. **Les sept autres séquences SNT
  sont déclinées du même fichier : vérifier l'équilibre des `<div>` sur chacune**
  (comptage `<div` / `</div>` par section).

- 🆕 **SNT-T1 — deux décisions gelées par Loïc (21/07).** (1) Les **codes
  d'activité** ne sont pas renommés tant que la couche Supabase n'est pas
  traitée ; deux familles de clés cohabitent (`NET·xx` et `NET-xx`), à
  harmoniser plus tard. (2) Les **licences de six crédits images** restent « à
  confirmer » : vérification à faire en ligne par Loïc lui-même.

- 🆕 **SNT — règle du référentiel vivant (17/07).** La séquence d'introduction
  (`pages/2nde-snt-t0-systemes-informatises.html`) = cours « Systèmes
  informatisés » **entrelacé** avec le tutoriel du dispositif. **Toute nouvelle
  idée de fonctionnement du cours s'y présente explicitement en premier** ; les
  autres séquences n'en portent que des rappels discrets (pied de page). Voir
  `CONSIGNES-sequence-SNT.md` §8 — et y revenir sans cesse.
- ✅ **Vestige RGPD corrigé (17/07)** : la page orpheline `2nde-snt.html` à la
  **racine** (doublon obsolète, chargeait encore Google Fonts, liens `#`) est
  remplacée par une redirection propre vers `pages/2nde-snt.html`. Option plus
  radicale possible : `git rm` (décision Loïc).
- 🆕 **SNT — la séquence « Le Web » est en ligne (17/07)** : `pages/2nde-snt-t2-le-web.html`,
  lié depuis la carte SNT 2 de `pages/2nde-snt.html`. **Maquette V0, non validée.**
  C'est un **second gabarit**, distinct des chapitres de PC (séquence → séance →
  étape → champ ; pas de `localStorage` ; CSS inline) — voir
  `_modeles/CONSIGNES-sequence-SNT.md`.
- 🔴 **RÈGLE — aucune police depuis un CDN.** La maquette de la séquence chargeait Space
  Grotesk / IBM Plex Sans / IBM Plex Mono depuis `fonts.googleapis.com` : chaque
  élève ouvrant la page aurait envoyé son IP à Google, à rebours de la règle du
  site (polices auto-hébergées, `assets/css/fonts.css`). Corrigé : **IBM Plex Sans
  ajouté** en woff2 local (400, 400i, 500, 600 — latin, OFL) et déclaré dans
  `fonts.css`. À vérifier sur toute page importée de l'extérieur.
- ✅ **Page de niveau `pages/2nde-physique-chimie.html` mise à jour et fournie** :
  les 4 chapitres du Thème 3 y sont **liés** (liens anti-préfixe, mêmes cartes
  `.chapitre` que les Thèmes 1-2, descriptions à puces conservées).
- ⚠ **T3 — divergence de structure à trancher (décision de Loïc).** L'ancienne
  page prévoyait 3 chapitres, avec **spectres en CH.2 et signaux en CH.3** ; les
  PPTX déposés donnent **4 chapitres** dans l'ordre son / signaux / spectres /
  réfraction (+ réfraction, absent de l'ancienne page). La page a été alignée sur
  **l'ordre des PPTX/slugs** (obligatoire pour que carte et page portent le même
  numéro). Deux ajustements faits, réversibles : (1) « Vision et image — spectres
  lumineux » renommé **« Dispersion et spectres »** (titre réel de la page de
  cours) ; (2) signaux et spectres permutés. Si Loïc préfère l'ordre pédagogique
  son / spectres / signaux, il faut **renuméroter les fichiers** (t3-c2 ↔ t3-c3 :
  noms, clés localStorage, titres internes) — à faire en régime B.
- ⚠ **T3-C2 (signaux et capteurs) Ex2, loi des nœuds au point B : correction de
  la source fausse → corrigée.** La source écrivait une relation incohérente au
  nœud B ; rétablie en **I₃ + I₆ = I₅** (I₅ sortant), avec un aparté explicatif.
  À revoir en régime B.
- ⚠ **T3-C2 : pas de diapositive « Pour le DS » ni de Kahoot** dans la source →
  liste de compétences à fournir (bloc 🚧), pas de chip Kahoot.
- ⚠ **T3-C2 : hyperliens vidéo dupliqués dans la source** (mêmes URLs sur
  plusieurs diapositives) → posés au mieux à leur emplacement le plus probable ;
  à vérifier en régime B.
- 🔴 **T3-C4 (réfraction et réflexion) : la source est une VERSION ÉLÈVE, sans
  corrigés.** Les **5 corrections ont été rédigées par Claude** (calculs vérifiés)
  et **portent la mention « à valider »** sur la page. À contrôler en priorité en
  régime B. En particulier **Ex3** (température de l'eau depuis n=1,333) dépend
  d'un **graphe n=f(θ) laissé en 🚧** : réponse ≈ 20 °C donnée sous réserve.
- ⚠ **T3 (4 chapitres) : liens DS laissés en attente** — jamais posés
  automatiquement (ils changent chaque année). Bloc 🚧 dédié dans chaque
  checklist.
- ⚠ **C6 et C7 : pas de diapositive « Pour le DS »** dans les sources — listes de compétences à fournir (et pas de Kahoot non plus pour ces deux chapitres).
- ⚠ **C5 : lien DS laissé en attente** — un lien existe dans la source (étiqueté « DS - 2024 », donc 2024/2025) mais n'a pas été activé, dans l'attente du choix de Loïc (DS de cette année ou de l'an dernier).
- ⚠ **T2 (3 chapitres) : liens DS laissés en attente** — comme pour C5, des liens « DS » figurent dans les sources mais ne sont jamais posés automatiquement.
- ⚠ **T2-C2 Ex6 : unité corrigée** — la source notait le résultat « ≈ 1,98×10²⁰ kg » ; corrigé en **newton (N)** (la valeur numérique est exacte).
- ⚠ **T2-C2 Ex8 : deux points à trancher** — (1) la correction inverse g Paris (9,73) et g équateur (9,81) par rapport à l'énoncé et à l'Image 13 (physiquement, g est plus grand à Paris ≈ 9,81) ; (2) l'écart annoncé « 8 % » est en réalité ≈ **0,8 %**. Transcrit fidèlement, avec aparté ; à revoir en régime B.
- ⚠ **T2-C2 : doublon de numéro d'exercice** — deux « Exercice 10 » dans la source (diapos 11 et 13) ; le second (plan incliné) a été renuméroté **Ex11**.
- ⚠ **T2-C3 : coquille corrigée** — « le masse » → « la masse » (définition de l'inertie).
- 🔴 **RÈGLE — `assets/css/chapitre-commun.css` est versionné : incrémenter le
  `?v=N` dès qu'une modification change le rendu** (retoucher un commentaire du
  fichier ne compte pas). Les pages le chargent via
  `<link ... href="../assets/css/chapitre-commun.css?v=2">`. Si on modifie le CSS
  sans toucher au `?v=N`, l'URL reste identique et **les navigateurs qui ont déjà
  ouvert un chapitre servent l'ancienne feuille depuis leur cache** : la
  correction est invisible pour les élèves, qui ne feront jamais de Ctrl+Shift+R.
  Passer `?v=2` → `?v=3` partout : `git grep -l 'chapitre-commun.css' -- '*.html'`
  (14 chapitres + `_modeles/gabarit-chapitre.html`). Cas vécu le 16/07 : barre de
  fraction des blocs-formule corrigée, mais restée invisible jusqu'au versionnage.
- 💡 **Décision (T2) — convention d'écriture des vecteurs** : en ébauche, la flèche est rendue par un caractère combinant Unicode placé au-dessus du symbole (lisible, mais imparfait sur les groupes multi-lettres). À raffiner en régime B (petit composant SVG ou notation dédiée).

- 🆕 **SNT — séquence « Photographie numérique » S1 en ligne (18/07)** :
  `pages/2nde-snt-t7-photographie-numerique.html`, lié depuis la carte SNT 7.
  **Maquette V0, non validée** — S1 complète et testée (Playwright), S2-S5 en
  squelettes 🚧 verrouillés. Découpage 5 séances + frise débranchée arbitré par
  Loïc le 18/07. Détail, arbitrages et restes à faire : `_suivi/chapitres.md`
  (section SNT-T7). Deux erreurs de la source corrigées au passage dans le
  contenu à venir (canal alpha ≠ « saturation » ; formats d'images datés).

- 🆕 **SNT — chantier des 4 thèmes lancé (18/07)** : séquences **Réseaux sociaux**
  (`t3`, `SOC·x`), **Données structurées** (`t4`, `DAT·x`, court 2 séances),
  **Localisation & cartographie** (`t5`, `LOC·x`) et **Informatique embarquée**
  (`t6`, `EMB·x`) créés en **V0 partielle** (S1 rédigées, suite en squelettes
  🚧), liés depuis `pages/2nde-snt.html`. Arbitrages de périmètre et nouvelles
  règles de production (intégrer plutôt que renvoyer, notes de chantier dans la
  page, plateformes fictives) consignés dans `CONSIGNES-sequence-SNT.md` §14. Détail
  par séquence : `chapitres.md`. **Décisions 📌/⚖️/📅 en attente** signalées par des
  encarts `<aside class="chantier decision">` dans chaque page (voir §14.2).

## 📊 Avancement (Seconde — Thème 1)

Tout est en ligne à l'état d'ébauche. Niveau de finition **validé** :

| Chapitre | Cours validé | Fiche |
|---|---|---|
| T1-C1 Matière macroscopique | ⬜ non | — |
| T1-C2 Transformations phys./chim. | ⬜ non | proposée, non validée |
| T1-C3 Constitution de l'atome | ⬜ non | proposée, non validée |
| T1-C4 Dénombrer les entités | ⬜ non | proposée, non validée |
| T1-C5 Solutions aqueuses | ⬜ non | — |
| T1-C6 Cortège électronique | ⬜ non | — |
| T1-C7 Stabilité des entités chimiques | ⬜ non | — |

> Les autres thèmes/chapitres s'ajouteront au fil du dégrossissage.

## 📊 Avancement (Seconde — Thème 2)

Tout est en ligne à l'état d'ébauche (régime A élargi). Niveau de finition **validé** :

| Chapitre | Cours validé | Fiche | Code |
|---|---|---|---|
| T2-C1 Décrire le mouvement | ⬜ non | — | REP3RE |
| T2-C2 Modéliser une action sur un système | ⬜ non | — | F0RCES |
| T2-C3 Le principe d'inertie | ⬜ non | — | IN3RTE |

> Codes de déblocage choisis par Claude, à transmettre via le cahier de textes (modifiables).

## 📊 Avancement (Seconde — Thème 3 · Ondes et signaux)

**Nouveau (16/07).** Les 4 chapitres sont **en ligne à l'état d'ébauche**
(régime A élargi) et **liés** depuis `pages/2nde-physique-chimie.html` (fait —
voir Alerte plus haut). Niveau de finition **validé** :

| Chapitre | Cours validé | Fiche | Code |
|---|---|---|---|
| T3-C1 Émission et perception d'un son | ⬜ non | — | S0NORE |
| T3-C2 Signaux et capteurs | ⬜ non | — | S1GNAL |
| T3-C3 Dispersion et spectres | ⬜ non | — | PR1SME |
| T3-C4 Réfraction et réflexion | ⬜ non | — | M1RAGE |

> Codes de déblocage choisis par Claude, à transmettre via le cahier de textes (modifiables).
> **Rappels de vigilance pour le régime B** : C2 (nœud B corrigé, pas de DS/Kahoot,
> vidéos dupliquées) et surtout **C4 (corrections rédigées par Claude, à valider)**.

## 📊 Avancement (Seconde — SNT)

**Nouveau (17-18/07).** Gabarit « séquence élève », distinct des chapitres de PC.
Les 7 thèmes sont listés sur `pages/2nde-snt.html` ; **8 séquences existent** (t0 à
t7), tous liés depuis la page de niveau. Détail par séquence et restes à faire :
section « Seconde — SNT » de `chapitres.md`.

| Thème | Séquence en ligne | Validé | Ressources définitives |
|---|---|---|---|
| SNT 0 · Introduction 🧭 | ✅ V0 (2 séances + débranchée) | ⬜ non | ⬜ `SYS·1`, `SYS·D` à brancher |
| SNT 1 · Internet | ✅ V0 (4 séances + débranchée) | ⬜ non | ⬜ `NET·2b`, `NET·D`, liens `NET·3/4` à tester |
| SNT 2 · Le Web | ✅ V0 (4 séances + frise) | ⬜ non | ⬜ activités cahier + frise à brancher |
| SNT 3 · Réseaux sociaux | 🔄 V0 partiel (S1 OK, S2 aux ⅔, S4 enquête codée ; S3 + fin S4 🚧) | ⬜ non | ⬜ `SOC·P`, `SOC·D`, biblio Skyblog-BnF |
| SNT 4 · Données structurées | 🔄 V0 partiel (S1 Titanic OK ; S2 🚧) — séquence courte 2 séances | ⬜ non | ⬜ `DAT·1`, `DAT·1b`, `DAT·D`, biblio Légifrance |
| SNT 5 · Localisation & cartographie | 🔄 V0 partiel (S1-S2 OK ; S3-S4 🚧) | ⬜ non | ⬜ `LOC·1`, `LOC·2b`, `LOC·D`, biblios |
| SNT 6 · Informatique embarquée | 🔄 V0 partiel (S1 OK ; S2-S4 🚧) — 4 séances provisoire | ⬜ non | ⬜ `EMB·D`, biblios Moreno/IoT |
| SNT 7 · Photographie numérique | ✅ V0 (S1 complète + S2-S5 🚧 + débranchée cadrée) | ⬜ non | ⬜ `PHO·1`, `PHO·D` à brancher |

> Phase 1 (rentrée) : HTML statique autonome, correction locale réelle, texte
> libre **simulé**. Phase 2 (plus tard) : VPS + base de données + correction IA
> + comptes élèves. Ne pas mélanger les deux — voir
> `_modeles/CONSIGNES-sequence-SNT.md` §7.

## 🔜 Prochaines actions

- [ ] **Trancher la structure du Thème 3** (ordre des PPTX conservé, ou
      renumérotation vers son / spectres / signaux — voir Alertes).
- [ ] **Valider les 5 corrections de T3-C4** rédigées par Claude (source sans corrigé).
- [ ] Trancher le nœud B de **T3-C2 Ex2** et la loi des nœuds associée.
- [ ] Déposer les PPTX des chapitres restants pour dégrossissage (régime A).
- [ ] Vérifier que chaque ébauche est liée depuis `pages/2nde-physique-chimie.html`.
- [ ] Cloner le repo dans VS Code + extension Claude Code (pour le raffinage).
- [ ] Fournir le calendrier scolaire pour ordonner les priorités.
- [ ] **SNT — finaliser la séquence Web à 100 %** : étoffer la frise débranchée
      (étiquettes datées + corrigé), ajouter le bonus geek « 404 & codes HTTP »
      en séance 1, brancher les ressources définitives (`WEB·2b`, `WEB·D`).
- [ ] **SNT T7 Photo — rédiger S2 à S5** (séance par séance, arbitrage fait) +
      la frise débranchée `PHO·D` ; choisir la vidéo-débat deepfake (`PHO·1`).
- [ ] **SNT — finir les 4 séquences du 18/07** (T3-T6) : rédiger les séances en
      squelette, brancher les ressources définitives, lever les décisions 📌/⚖️/📅
      posées en encarts `chantier` dans chaque page. Détail : `chapitres.md`.
- [ ] **SNT — étape « Ranger pour retrouver » à ajouter dans t0** (données
      structurées en transversal, référentiel vivant — voir `CONSIGNES-sequence-SNT.md`
      §14.4).
- [ ] **SNT — trancher l'extraction d'un `gabarit-sequence-snt.html`** : conventions
      désormais confirmées par 8 séquences (décision de Loïc — `CONSIGNES-sequence-SNT.md` §13).
- [ ] 🆕 **BDD — jalon 4** : CLI Supabase sur Windows, `.bat` de sauvegarde et de
      réveil + tâches planifiées, puis `supabase init` / `db pull`.
- [ ] 🆕 **BDD — choisir la séquence pilote** (une séquence SNT, une étape, un champ de
      texte libre) pour le branchement de bout en bout.

---

## 🗄 Nouvelle partie (20/07) — Volet base de données

**Décision : la phase 2 des séquences SNT est ouverte.** La progression des élèves
quitte le `localStorage` pour une vraie base. Cadrage complet, modèle de données
et notions apprises : `_suivi/BDD-cadrage.md`.

| Pièce | État |
|---|---|
| Projet Supabase `pedagogie-vanhoorde`, région **West EU (Paris)**, plan gratuit | ✅ créé le 20/07 · ref `ztyvuiaohxekuyjeoaxz` |
| Sécurité à la création : Data API + expose new tables + **automatic RLS** | ✅ les trois activées |
| Intégration GitHub | ✅ **active** depuis le 20/07 — `supabase/migrations/` existe et l'historique est amorcé |
| `bdd/schema/001` à `005` — sept tables, contraintes, déclencheurs, vue | ✅ écrits et **exécutés** |
| Jalon 4 — CLI, sauvegardes, réveil, historique de migrations | ✅ fait le 20/07 · détail au §9 du cadrage |
| Règles RLS | ⬜ jalon 5 — **tables actuellement FERMÉES à tous, c'est voulu** |
| `assets/js/progression.js` (client partagé) | ⬜ jalon 6 |
| Pilote sur une séquence SNT | ⬜ jalon 7 — séquence à choisir |

**Conséquences déjà actées ailleurs** : `CONSIGNES-sequence-SNT.md` §5 (progression en
base, jeton seul en local ; `progression.js` autorisé comme second asset
partagé), §7 (phase 2 ouverte, coder contre le contrat de données, ordre de
branchement SNT → PC), §13 (encadré de mise à jour), §14.3 (codes d'activité au
tiret en base). Les chapitres de PC restent **hors périmètre** pour l'instant.

⚠ **Ne jamais committer un fichier de sauvegarde** (`*.sql` de dump, `*.dump`) :
il contiendrait des données d'élèves. Entrées ajoutées au `.gitignore` le 20/07.

**Ce qui tourne désormais tout seul** (scripts dans `bdd/outils/`, notice sur
place) : sauvegarde le mercredi 18 h vers `C:\Sauvegardes-SNT`, réveil quotidien
à 12 h 30. Les deux ont le rattrapage activé.

⚠ **Dépendance au PC de Loïc — à rappeler régulièrement.** Les deux tâches
planifiées et le futur worker de correction IA tournent sur son poste. Le
rattrapage sauve la sauvegarde, pas le réveil : si le PC reste éteint plus de
sept jours d'affilée (vacances), le projet Supabase est mis en pause. Données
intactes, relance d'un clic au tableau de bord, mais le site ne répond plus
entre-temps. Doublure GitHub Actions **écartée en connaissance de cause** le
20/07.

---

## 🚧 Nouvelle partie (19/07) — Séquence ES Terminale « frise & IA »

**Décision de Loïc : chantier ouvert d'un coup, architecture complète visée**
(pas de version dégradée) — frise participative + serveur de classe +
pré-correction IA locale. Détail des règles : `_modeles/CONSIGNES-sequence-ES.md`.

| Pièce | État |
|---|---|
| `pages/term-es-s01-frise.html` | ✅ fonctionnel en local (tirage 2→1, dépôt 2 sources + bannies, jetons, `?prof=1`, export CSV) |
| Page de niveau Term ES | ✅ lien séquence 1 activé (+ liste des chantiers) |
| `serveur-frise/` | 🚧 squelette Node natif : endpoints figés, garde-fou anti-note codé, auth enseignant à poser |
| `ia-correction/` | 🚧 prompt-cadre V1 + grille critères publiée + script Ollama (modèle à choisir : Qwen 3 candidat) avec garde-fous entrée/sortie |
| Cours 1 (histoire) / Cours 2 (IA) | 🚧 s'écrivent après S3/S5 |
| `pages/term-es-t2-c1-…` + `t2-c2-…` | ✅ ébauches complètes sur gabarit chapitre (texte fidèle aux PDF, images c1 posées, .a-faire sur QR/verrou/fiches) |
| Pack débat IA | grille .docx livrée hors dépôt ; plans de travail + cartes contraintes 🚧 |

**Rappels réglementaires actés** : AI Act annexe III applicable 02/08/2026 —
la pré-correction reste « tâche préparatoire » (art. 6(3)) : aucune note machine,
souveraineté de Loïc sur toute notation. RGPD : codes pseudonymes seuls sur
serveur, table code↔nom sur le PC de Loïc, purge fin d'année, DPD à prévenir
avant mise en service du serveur.

---

## Archive — note de reprise du 22/07/2026 (pré-correction IA SNT + affichage élève)

---

## Cadre de collaboration (inchangé)

- Répondre en français, une tâche à la fois, en réexpliquant le pourquoi niveau
  apprenti-éclairé. Sur le fond (grille, critères, ton des messages élèves, UX),
  **Loïc est souverain** ; l'IA est l'échafaudage.
- Livrer le code en **archives à extraire à la RACINE du dépôt** (chemins
  `ia-snt/…`, `pages/…`, etc.).
- **N'inventer rien : lire le vrai code avant de proposer.** Ne pas pousser de
  logistique de rentrée (rentrée à >1 mois, pas encore de classes/horaires).

---

## CHANTIER 1 — Outil IA de pré-correction des questions libres SNT (`ia-snt/`)

### Ce qui était déjà construit (rappel)
Worker local (`precorrection-snt.mjs`) : lit `reponses_libres` (Supabase, statut
`en_attente`, `correction_ia` NULL), délègue à `moteur.mjs`, écrit dans
`correction_ia`, ne touche JAMAIS au statut. Deux passes (le modèle juge chaque
critère ; le CODE calcule verdict + aide ; le modèle rédige le message élève).
Grille `criteres-snt.json` à deux étages (`socle` décide l'acceptation, `plus_loin`
= ambition, ne bloque jamais). Garde-fous : rejet de note, anti-injection,
validation de format. 100 % local, RGPD. Modèle via variable `IA_MODELE`.

### Matériel (mesuré cette session)
- **RTX 5080, 16 Go de VRAM.** Machine rapide → le goulot n'est jamais la vitesse,
  toujours le plafond 16 Go.
- **Mistral Small (24B) DÉBORDE** : `ollama ps` montre un split `5%/95% CPU/GPU`,
  d'où sa lenteur. Un modèle qui déborde fausse toute comparaison (Nemo « tout
  GPU » vs Small « moitié CPU »).
- Règle de conversion Q4 : ~0,6–0,7 Go/milliard. Tient large : 12–14B. Ne tient
  pas : 24–27B dense.

### Benchmark Small vs Nemo (ancienne grille)
- Small : 23/26 (88 %), 2 instables, injection 100 %, ortho 1/1.
- Nemo : 22/26 (85 %), 3 instables, injection 100 %, ortho 0/1.
- **Delta dans le bruit** (n=26, IC large). **Décision : rester sur Nemo**
  (léger, tient en VRAM, permet des `--repeat` élevés). Ne PAS passer à Small.

### Grille : édition ratée puis retour arrière
- Mon rework R1/C2 a **empiré** Nemo (3 → 11 divergences) + régression sur de
  bonnes copies C2. Causes : (a) un petit modèle **n'honore pas une clause
  d'exclusion** (« les paquets ne comptent pas pour R1 ») ; (b) un « bonus
  facultatif » ajouté à C2 a été lu comme une **exigence** → « partiellement »
  partout.
- **Retour à la grille d'origine** (`grille-origine.zip`). Le rework R1/C2 est
  **reporté à froid**. Leçon : sur petit modèle, **restructurer** (un critère =
  une seule chose à vérifier), pas reworder ; envisager d'**interdire
  « partiellement » sur les critères socle** (forcer binaire observé/non-observé).

### Tri de relecture — LIVRÉ et appliqué (`tri-relecture.zip`)
- Fonction `calculerTri(grille, …)` dans `moteur.mjs`, branchée dans les 3 sorties
  de `precorrigerUne` ; marqueur ⚠ dans le log du worker. Chaque
  `correction_ia.analyse` porte désormais `tri:{a_verifier, niveau, raisons}`.
- **Règle asymétrique** (coulant pour laisser passer, strict là où une copie en
  difficulté pourrait se cacher). Part en « ⚠ à vérifier » si : injection ·
  format KO · note rejetée · **un critère socle en « partiellement »** · ortho
  signalée. Net (socle clairement observé/non observé) → passe. Diagnostic ignore
  le socle.
- **Limite connue à ne pas oublier** : le tri n'attrape PAS un *« accepté »
  confiant mais faux* (ex. bug R1 « paquets → réseau », stable). Parades réelles :
  (1) corriger la grille à froid, (2) **sondage aléatoire** du bucket
  auto-validé.
- **Rectification importante** : l'**instabilité n'est PAS mesurée en prod** (le
  worker fait 1 passe/copie) ; c'est `evaluation.mjs --repeat` qui la mesure. Pour
  en faire un signal de tri, il faudrait faire tourner la passe 1 N fois dans le
  worker (double le temps) — cran optionnel.

### Arbitrage Loïc validé (côté enseignant)
« Net → passe sans vérification · doute → vérification · budget **≤ 1 copie sur 3**
à vérifier. » À mesurer sur de **VRAIES copies** (pas `copies-eval.json`, banc de
stress qui surestime le taux d'alerte). Si ça déborde : curseur = couper l'ortho
d'abord, puis ne garder qu'injection + format + socle indécis.

---

## CHANTIER 2 — Affichage du retour à l'élève, après correction (page t1)

### Terrain (lu cette session)
- Le **moteur focus/verdict est inline dans `pages/2nde-snt-t1-internet.html`**
  (~180 réf.), **pas** dans `progression.js`.
- `progression.js` s'expose sous le global **`Progression`** (`envoyerReponse`,
  `mesReponses`, `versions`…). Les réponses libres **partent en base** via
  `BASE.envoyerReponse` ; le `.verdict` du champ affiche déjà « ✅ enregistrée ».
- **Trou comblé** : `mesReponses()` n'était appelé **nulle part** → au
  rechargement, la réponse envoyée ET la correction étaient perdues.
- Pièges écartés : `.verdict` sert aussi aux **QCM** (ne pas écraser) ;
  `data-tri-verdict` = la **frise d'ordonnancement** (rien à voir avec nous).

### LIVRÉ (`t1-rehydratation.zip`) — que des ajouts, rien de modifié
- Fonction `rehydraterReponses()` dans le JS de la page : au chargement, si
  `Progression` dispo, balaie les `[data-focus-code]`, appelle `mesReponses()`,
  restaure l'écho + états (comme `validerFocus`) et remplit le `.verdict` via le
  helper `verdict()` existant. Ne duplique rien.
- CSS ajouté : `.verdict.amb` (à compléter, orange) · `.verdict.diag`
  (diagnostic, bleu) · styles internes (pastille, message, ligne IA, « pour aller
  plus loin »).
- Maquette de validation : `maquette-affichage-eleve.html` (à garder en référence).

### Décisions de fond validées
1. **Gating** : l'élève ne voit rien tant que `statut ≠ 'corrige'`. Le passage
   `en_attente → corrige` reste le geste de Loïc.
2. **L'élève ne lit que du validé.** Politique : **`commentaire_prof` PRIME** (s'il
   existe, l'élève ne lit que ça, sans texte IA ni ligne de transparence) ;
   sinon **message IA validé + ligne de transparence**. (Assouplissable en une
   ligne pour montrer les deux.)
3. **Ligne de transparence gardée et explicitée** : « préparé par une IA qui
   tourne seulement sur l'ordinateur de ton professeur — "locale" = ta réponse ne
   part pas sur Internet — puis relu et validé ».
4. **Couleurs** : accepté → `ok` (vert) · à compléter → `amb` (orange) ·
   diagnostic → `diag` (bleu) · en attente → `wait` (or).
5. **Hydratation réservée aux connectés** (invité → `mesReponses` [] → rien).
6. **« à compléter » ou copie ⚠ → forcément le clic de Loïc** (jamais de passage
   `corrige` en lot). Règle **côté enseignant**, à porter dans l'étape de
   validation (étape 5).

### Convention pour que ça s'étende tout seul
Une nouvelle question libre corrigée = `.field[data-focus-code="NET-XXX"]` + un
slot `.verdict` + une ligne `code_activite` en base + une entrée dans
`criteres-snt.json`. **Respect du patron = allumage automatique, zéro JS à
toucher.** C'est la seule règle de maintenance.

---

## Fils ouverts / prochains crans (par dépendance)

1. **`temperature: 0` + `seed` fixe** dans `moteur.mjs` (`appelOllama`, aujourd'hui
   0.2 en dur). **Préalable** à tout re-benchmark et au rework de grille : sans ça,
   on tune contre des dés. → me coller `moteur.mjs`.
2. **Rework grille R1/C2 à froid** : restructurer (un critère = une chose),
   envisager binaire sur le socle. Après le point 1.
3. **Comparer Gemma 4 / Qwen 3 vs Nemo** APRÈS le point 1, sur grille figée.
   Candidats qui tiennent en 16 Go : Gemma 4 (sortie JSON structurée native,
   pertinent pour la passe 1), Qwen 3 8B/14B. Pas le 24–27B dense.
4. **Instabilité comme signal de tri en prod** (optionnel) : passe 1 ×N dans le
   worker ; réutiliser la détection d'oscillation d'`evaluation.mjs`.
5. **Événement de connexion** dans `progression.js` (`seConnecter`) → rappeler
   `rehydraterReponses()` pour couvrir la connexion en cours de page. → touche
   `progression.js`.
6. **Bouton « réécrire » conditionnel** : NET-1a/1b sont marquées *définitives* ;
   décider quelles questions sont « rejouables » + confirmer que la base remet
   `correction_ia` à NULL. Décision de fond de Loïc.
7. **Étape 5** : validation enseignante + tableau de bord iPad (relève des
   `correction_ia`, filtre `tri.a_verifier`, passage `en_attente → corrige`).
   C'est là que vit la règle « ⚠ → forcément le clic ». Suppose le vrai rôle
   enseignant Supabase.
8. **Mesurer le taux de ⚠ sur de vraies copies** pour caler le ≤ 1/3.
9. **Nettoyage avant rentrée** : compte test `leproftest` + lignes de test.

---

## Archives produites cette session (à ranger dans le dépôt)

- **`grille-origine.zip`** — retour à la grille R1/C2 d'origine. **À extraire**
  pour repartir du meilleur point connu.
- **`tri-relecture.zip`** — `moteur.mjs` + `precorrection-snt.mjs` (le tri de
  relecture). **À extraire.**
- **`t1-rehydratation.zip`** — `pages/2nde-snt-t1-internet.html` (affichage élève).
  **À extraire.**
- **`maquette-affichage-eleve.html`** — maquette de validation (référence design).
- ⚠ **`grille-r1-c2.zip`** — mon édition ratée de la grille. **NE PAS extraire.**

---

*Fin de la note de reprise. Mettre à jour à chaque décision prise ou chantier avancé.*

---

## Archive — brief jalon 4 (base de données)

# Brief — Volet base de données, jalon 4

> À coller en début de nouvelle conversation. Écrit le 20/07/2026.

---

## Le message à coller

> **Volet base de données du site pédagogique — jalon 4.**
> Les jalons 1 à 3 sont faits : consignes réécrites, projet Supabase créé,
> schéma des sept tables écrit et exécuté. Le récapitulatif complet est dans
> le fichier `BDD-cadrage.md` que je te joins — lis-le d'abord.
>
> Ce que j'attends de cette session, dans l'ordre :
> 1. installer la **CLI Supabase** sur Windows (méthode la plus simple, je suis
>    débutant, pas d'éditeur de code exotique — VS Code + terminal intégré) ;
> 2. les deux scripts **`.bat`** : sauvegarde hebdomadaire (`supabase db dump`
>    vers un dossier local + une ligne insérée dans la table `sauvegardes`) et
>    réveil quotidien (contre la mise en pause après 7 jours d'inactivité) ;
> 3. la marche à suivre pour les deux **tâches planifiées Windows** ;
> 4. `supabase init` puis `supabase db pull`, pour initialiser l'historique de
>    migrations et donner enfin un sens à l'intégration GitHub déjà activée.
>
> Rappels de méthode : tout en français ; aucune décision silencieuse, tu
> proposes avant d'implémenter ; livraison en **archive delta** reproduisant
> l'arborescence, jamais le site complet ; tu poses le concept d'abord, le
> détail ensuite ; tu me challenges si je me trompe.

---

## Fichiers à joindre à la nouvelle conversation

**Obligatoire**

- `_suivi/BDD-cadrage.md` — architecture, décisions, modèle de données, notions
  apprises, coordonnées du projet. C'est le document pivot.

**Utile si la conversation touche au dépôt**

- `bdd/README.md` — la discipline des fichiers de schéma et l'avertissement sur
  `supabase/migrations/`.
- `.gitignore` — pour vérifier que les dumps sont bien exclus avant le premier
  `supabase db dump`.

**Pas nécessaire au jalon 4**

- Les fichiers `bdd/schema/*.sql` : leur contenu est résumé dans le cadrage.
  À joindre seulement en cas de problème d'exécution.
- L'archive complète du site : inutile ici, le jalon 4 ne touche à aucune page.
  Elle redeviendra utile au jalon 6 (client `progression.js`) et au jalon 7
  (branchement d'une séquence).

---

## Ce que la nouvelle session doit savoir sans avoir à demander

| | |
|---|---|
| Reference ID | `ztyvuiaohxekuyjeoaxz` |
| Project URL | `https://ztyvuiaohxekuyjeoaxz.supabase.co` |
| Région / plan | West EU (Paris) · Free |
| Intégration GitHub | activée, **sans effet** tant que `supabase/` n'existe pas |
| État des tables | 7 tables créées, RLS active, **aucune règle** — donc fermées à tous. C'est voulu, l'ouverture est le jalon 5 |
| Environnement | Windows, VS Code, Opera GX, dépôt poussé à la main depuis VS Code |
| Secrets | mot de passe de base et clé `service_role` dans un gestionnaire de mots de passe, **jamais** dans le dépôt ni dans une conversation |

## Décisions déjà prises — à ne pas rouvrir

- Supabase gratuit région Paris ; cible souveraine Clever Cloud en septembre.
- Identification par **compte identifiant + mot de passe** choisis par l'élève
  (virage du 22/07/2026, portabilité maison↔lycée ; l'identifiant fabrique une
  adresse interne `identifiant@snt.local`, jamais envoyée).
  Aucun email, aucun nom, aucun mot de passe en base.
- Code de classe générique par classe, fermé via `actif = false` après la
  deuxième séance, rouvert à la demande (option B).
- Codes d'activité au tiret en base (`WEB-2b`), point médian conservé à l'écran.
- Historique des rédactions **conservé** : archivage automatique par déclencheur
  dans `reponses_versions`. Bouton « voir mes versions » prévu, non implémenté.
- Schéma dans `bdd/schema/`, exécuté à la main, **pas** dans
  `supabase/migrations/` avant que `supabase db pull` ait initialisé
  l'historique.
- Chapitres de physique-chimie **hors périmètre** pour l'instant (leur
  `localStorage` reste en place) ; migration après le pilote SNT.

## Questions encore ouvertes

- Quelle séquence SNT sert de pilote (une étape, un champ de texte libre) ?
- Le dossier de destination des sauvegardes sur le PC de Loïc, et la copie
  externe (disque, clé, cloud ?).
- Rythme du worker de correction (à la demande ? toutes les N minutes ?).

### 23/07 (matin) — livraison, incident et réparation

Archive appliquée : moteur SNT extrait (`sequence-snt.css` + `.js`, t1 de 383 → 262 ko),
50 renommages, 200 liens inertes en mentions « en travaux », `calculerAide` réécrit,
frise ES cadrée sur Supabase (`bdd/schema/007-frise-es.sql`, à valider).

**Incident.** Le commentaire CSS de `.a-venir` contenait un exemple de balise
(`<a href="#">`) ; le script de conversion l'a pris pour un vrai lien et a avalé
1 200 à 5 500 caractères dans chacune des 8 séquences. Réparé le jour même :
contenu restitué, `</a>` rendu, CSS reposé dans la bonne feuille, commentaire
purgé de toute balise. **Leçon : ne jamais faire tourner un traitement de texte
sur un fichier qu'il vient lui-même de modifier.**

`verifier.mjs` n'a pas vu l'incident — il lui manque le contrôle `<a>`/`</a>`
et la détection de CSS égaré dans un `<svg>`. À ajouter.

Note d'outillage : `sh` n'existe pas dans PowerShell et WSL intercepte `bash`.
Le bon appel est `& "C:\Program Files\Git\bin\bash.exe" script.sh`.
---

## 25/07/2026 (soir) — séance 4 d'Internet, étape 4.3

Session consacrée à la **séance 4** de `t1`. Les vingt décisions de la session du
25/07 en journée sont déjà consignées dans `DECISIONS.md` ; ce qui suit couvre la
session du soir.

**Livré** — étape **4.3 refondue en sept temps** (relevé de trois adresses IP →
rappel de mémoire sur fond flouté → doc → poste de visionnage → QCM de 4 questions
→ « à retenir » → biblio de 4 sources). Étape **4.2** corrigée (« à retenir »
descendu après le QCM, correction vide remplie). **Deux notes de chantier périmées
réécrites**. Un seul fichier touché, aucun bump de version.

**Deux blocs volontairement inertes** dans 4.3, signalés par une note de chantier :
le relevé et le rappel attendent le moteur (lot 2). En l'état, le rappel s'affiche
en clair avec le relevé juste au-dessus — l'exercice n'a de sens qu'avec le flou.
Ce qui était soumis à validation, c'est la formulation.

**Découvertes techniques de la session**

- Le moteur ne connaît que `input[data-answer]` : un champ sans réponse attendue est
  **ignoré de bout en bout** — ni vérifié, ni élargi, ni enregistré. D'où le besoin
  d'un type de champ « relevé », validé sur le format.
- En revanche, la **persistance du contenu des trous existe déjà** (`ETAT.champs`,
  clé `étape + '/cloze-N'`, sauvegardée en base et réinjectée au chargement). Le
  rappel peut donc se comparer au relevé du même élève, y compris après un
  rechargement ou un passage maison↔lycée. Pas besoin d'inventer une mémoire.
- 🔴 **Les clés de persistance des étapes sont positionnelles.** `cle(step)` retombe
  sur `'et-s' + n° de séance + '-' + rang` faute de `id` ou de `data-cle` — et
  **aucune** des 27 étapes n'en porte. Insérer une étape ailleurs qu'en fin de
  séance réaffecterait silencieusement le travail déjà enregistré des élèves.
  Arbitrage en attente dans `DECISIONS.md`. Fenêtre idéale : **maintenant**, avant
  la création des vraies classes.
- Le « à retenir » ne s'affiche pas « automatiquement » par un mécanisme JS : il est
  simplement **placé en dernier dans le DOM**. Rien à coder pour respecter la règle,
  seulement à ordonner.
- Le **mode enseignant fait déjà** ce qu'on croyait manquer : il ouvre les séances
  verrouillées et révèle toutes les étapes, sans rien valider ni écrire en base.
  Mais la vérification du code exige un contexte sécurisé (`crypto.subtle`) : elle
  **échoue en `file://`**. Documenté dans `CONSIGNES-sequence-SNT.md` §15.8.
- `NET·4c` n'apparaissait qu'**une seule fois**, pas trois. La gêne venait de sa
  mise en forme : une consigne de manipulation balisée comme un lien externe, et
  affublée d'un `.a-venir` alors que rien n'était en travaux.

**Sources DNS relevées et vérifiées** — RFC 1034 (spécification en vigueur, 1987),
notice ACM de Paul Mockapetris (conception en 1983, RFC 882/883), AFNIC, ICANN.
Détail et réserves dans `_modeles/biblio-sources-SNT.md`.

**Piste ouverte, non traitée** — la vidéo DNS existe sur le PeerTube du ministère.
Motif de Loïc pour y regarder de plus près : ce sont les **publicités** qui le
gênent, et `nocookie` ne les enlève pas. Réserve à lever d'abord : le pair-à-pair
exposerait l'IP de l'élève à d'autres spectateurs.

---

## 20/08/2026 — audit de `t1` en vue de sa validation, puis trois lots

Loïc demande un audit du thème 1 « pour dire ce qu'il reste à mettre en place ou
à vérifier ». L'audit a été mené **sur la page rendue** autant que sur le fichier :
serveur local, Chromium sans interface, journal réseau, et la cascade de
déverrouillage rejouée pour de vrai plutôt que lue dans le code.

**Ce que seule l'exécution a montré.** Trois choses ne se voyaient pas à la
lecture :

- **La séance 2 ne fermait rien.** `seanceComplete()` rend `true` quand une
  séance n'a aucune porte — et la séance 2 n'en avait aucune. Valider la séance 1
  ouvrait donc la 2 **et** la 3 d'un coup, pendant que le bandeau de la 3
  promettait « se débloque quand la séance 2 est entièrement validée ». Mesuré en
  rejouant la cascade, pas déduit.
- **« Partager avec la classe » n'écrivait rien.** Le bouton passait le textarea
  en lecture seule et disait « ✅ Merci — ta réponse nourrit la discussion de
  classe ». Ni base, ni état, ni fiche. L'enquête auprès des grands-parents —
  un devoir fait à la maison, avec quelqu'un de sa famille — disparaissait au
  premier rechargement. C'est le seul défaut de l'audit qui **perdait du travail
  d'élève** ; tout le reste était réparable sans conséquence.
- **Les quatre `<iframe>` se chargent à l'ouverture de la page**, sans qu'on
  clique sur rien. Journal réseau : `embed.radiofrance.fr` 116 requêtes,
  `youtube-nocookie` 109, `jnn-pa.googleapis.com` 21, `fonts.gstatic.com` 13,
  `www.google.com` 10, `csp.withgoogle.com` 4. La police Google que la règle
  RGPD du projet bannit depuis le premier jour revient donc **par l'intérieur du
  lecteur vidéo**. Non traité ce jour : porté en action, avec une piste
  (façade « clic pour charger ») qui ne dépend pas de l'arbitrage PeerTube.

**Un défaut d'outillage, trouvé par accident.** `node generer-questions.mjs`
n'a rien fait, sans rien dire. Le garde d'exécution comparait `import.meta.url`
à un gabarit `file://` + `process.argv[1]` : sous Windows, `file://C:\...` face
à `file:///C:/...`. Les **deux** générateurs étaient dans ce cas, donc muets
depuis leur écriture sur la machine où on les lance. `verifier.mjs` ne pouvait
pas le voir : il importe `extraire()` et compare, il ne lance pas le script.

**Ce qui a été décidé en séance** (détail dans `DECISIONS.md`) : les deux étapes
de la séance 2 deviennent des portes ; les réponses personnelles vont en base au
statut `partage`, dans la même table que les copies ; les biais de longueur des
QCM se corrigent en **étoffant les leurres** ; `NET-Q7` passe à 4 questions et
`NET-Q8` garde ses 18, à éprouver en classe.

**Ce qui a été écarté, et pourquoi.** Deux blocs perso ne partent **pas** en base :
l'enquête maison de la séance 2 et « les appareils de ta box » en 5.5. Ils
demandent l'inventaire des appareils connectés d'un logement — une donnée qui
concerne tout le foyer, pas seulement l'élève. La page portait déjà cette
décision pour le premier, depuis le 26/07 ; elle est étendue au second et écrite
en commentaire dans les deux, avec la consigne de ne pas leur ajouter de code
« par cohérence ».

**Reste ouvert, et pèse sur la validation** : le `data-cle` des 26 étapes (clés
encore positionnelles — à poser avant les vraies classes), le prérequis
« binaire » de la séance 5 qui n'a aucune séquence pour le porter, l'étape 5.4,
la fin de thème, et le moteur du relevé et du rappel.

---

## 22/08/2026 — audit de `t1`, séance 1 : dix lots, et deux diagnostics retournés

Relecture de la séance 1 par Loïc, étape par étape, avant passage avec les
élèves. Dix lots, tous tranchés d'avance : rien à arbitrer en cours de route
sauf une question de QCM, balisée comme proposition.

**Deux fois, le code disait autre chose que ce qu'on croyait.** Les infobulles
« à voir plus tard » n'étaient pas coupées par le bord de la fenêtre mais par
les `overflow:hidden` de `.card`, `.retain`, `.france-box`, `.poste` et
`.glosmot` — les décaler n'aurait rien réglé. Et le bouton « voir la
correction » de la frise ne validait pas l'étape : la demande de Loïc ajoutait
un comportement manquant, elle n'en réparait pas un cassé.

**La redondance des QCM n'était pas où on la cherchait.** Trois fois sur
quatre, c'est le **corrigé** d'une question qui donnait la réponse d'une
question ultérieure — en 1.4 deux fois, en 1.6 une fois. Un énoncé redondant se
repère à la lecture ; un corrigé qui fuit, non. C'est un défaut de conception à
chercher ailleurs dans le projet.

**Ce que le brief n'avait pas vu, trouvé au contact du code.** La barre de
navigation du haut de `t1` listait les cinq séances **en dur**, avec un
`data-navlock` chacune : la découpe l'aurait laissée à cinq entrées. Quatre
`<li>` de la frise sur douze n'ont pas de date, pas un seul comme annoncé — et
depuis que la validation les révèle toutes, les trois trous restants se voient.
Le markup d'étiquette proposé au lot B2 donnait un `<button>` **vide**, sans
surface de clic ni cible tactile : le libellé est passé dedans. Et sa bulle
héritait du `text-transform:uppercase` de `.field-type`, donc sortait EN
CAPITALES ESPACÉES.

**Un bandeau qui aurait disparu derrière une bulle.** En bornant l'infobulle
dans la fenêtre, elle pouvait se poser sur le bandeau « ton travail n'est pas
enregistré » (`progression.js`, `z-index:9998`). Le placeur lui réserve sa
hauteur : un avertissement qui prévient l'élève que rien n'est sauvegardé ne
passe pas derrière une bulle d'aide.

**Ordre imposé, et il compte.** Les `data-cle` (lot H) avant la découpe (lot I).
Une fois les clés sémantiques posées, renuméroter n'a plus aucun effet sur la
progression enregistrée ; dans l'autre ordre, on casse deux fois. La découpe est
committée seule pour qu'un `git revert` reste simple.

**Vérifications.** `jsdom` n'est pas installé, donc `_test-revelation.mjs` ne
tourne pas : le même contrat a été rejoué dans Chrome sur la vraie page — quatre
bilans masqués, quatre boutons neutralisés, la porte d'intuition qui ferme
26 blocs puis les rouvre à la réponse. Les 49 infobulles de `t1` et `t2` ont été
ouvertes une à une à 1280, 820 et 390 px et mesurées par `elementFromPoint` :
aucune n'est masquée. `verifier.mjs` sort les mêmes 19 problèmes qu'au départ.

**Reste ouvert** : la relecture de la question 4 réécrite, les trois dates
manquantes de la frise, le test au doigt sur un vrai iPad, et le nettoyage des
lignes de test dans Supabase — les clés d'étapes ont changé de forme et les
identifiants de séance ont changé de sens.

**22/08/2026, plus tard — la frise complétée, et un bug plus vieux que l'audit.**
Loïc valide la question 4 réécrite et les trois dates qui manquaient encore :
1977 (les trois réseaux reliés), 1979 (Usenet), 1986 (NSFNET). Elles sont posées
en `data-niveau="3"` plutôt qu'en 2 : le bouton d'indices s'arrête au niveau 2,
donc le compte-gouttes reste à 4 puis 9 dates, le verdict « neuf sur douze, les
trois restantes se déduisent » redevient littéralement vrai, et les trois
dernières ne sortent qu'à la validation.

En vérifiant ce comportement au navigateur, la console a lâché
`defilerVers is not defined` à chaque clic sur « voir la correction ». La
fonction est définie dans l'IIFE qui va de la ligne 1436 à la 3087 ; le
handler de la frise vit dans celle qui commence à la 3089. **Le défaut est
antérieur à l'audit** — il existait déjà dans la version du 21/08, où cet appel
était la dernière instruction du handler : rien ne se voyait, sinon l'absence de
défilement vers la correction. Depuis le lot E2, la validation de l'étape passe
avant, donc elle n'a jamais été touchée. `defilerVers` est exposée sur `window`.

Ce que ça dit sur la méthode : trois passes de relecture du code n'avaient pas
vu ce bug, une seule ouverture de la page dans un vrai navigateur l'a sorti.
