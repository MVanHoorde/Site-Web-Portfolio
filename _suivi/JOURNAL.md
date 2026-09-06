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

## 06/09/2026 — L'enseignement scientifique de 1re passe sur le moteur

Six chapitres portés en une session, 18 séances, depuis les documents déposés dans
`_a-deposer/es1/`. Le brief était explicite : aller au bout de ce qui est faisable
sans Loïc, ne pas demander de validation intermédiaire, et rendre à la fin un
fichier de vérification point par point. C'est ce qui a été fait — le livrable est
`_suivi/es1-verification.md`.

Trois choses ne se sont pas passées comme prévu, toutes dans le bon sens.

**Le TP tournant n'était pas absent.** Le brief §2bis annonçait le sous-thème 4.1
comme « le seul endroit du chantier où il faut produire un cours entier », le TP de
Loïc étant réputé non déposé. Il l'était, sous un nom qui ne le disait pas :
`[Dossier] [Correction] Thème 2 - Chapitre 1.pdf`. Ouvert par acquit de conscience,
il s'est révélé être un dossier d'activités complet, corrigés compris — TP
d'acoustique musicale sur Audacity, activité sur la résonance avec Tacoma et les
deux diapasons, TP de la corde de Melde avec ses mesures, TP de la colonne d'air,
et trois exercices de lecture de spectres. Le chapitre le plus coûteux du chantier
est devenu un portage comme les autres.

**Les vidéos ont été retrouvées sans les fichiers.** Les trois épisodes de
« L'origine des éléments chimiques » avaient été déposés en `.mp4` — inutilisables
(Claude ne les regarde pas, et une vidéo n'a rien à faire dans un dépôt public) et
sans URL. Les diaporamas exportés en PDF ne contiennent aucun lien hypertexte, mais
ils contiennent des **QR codes**. Décodés en multi-échelle : **24 adresses**, dont
les trois épisodes. La méthode vaut au-delà de ce chantier — c'est exactement le
point resté ouvert sur `term-es-t2-c1` (« décoder les QR → liens vidéo, 7 chips
en # »). Elle est notée dans `CLAUDE.md`.

**Sept erreurs dormaient dans les documents sources.** Un atome de fer à 93 grammes
(exposant −2 au lieu de −26), un dénominateur `a³` disparu à la mise en page, un
stade à 150 m dans un calcul qui n'aboutit qu'à 160, une égalité fausse d'un facteur
mille (3¹² ≈ 2⁹ au lieu de 2¹⁹ — et c'est justement l'écart qui *est* le comma
pythagoricien), un « seize fois plus de données » qui vaut deux, un « N = 8 o » à
lire « 3 octets », un oxygène en Z = 6. Toutes corrigées dans les pages, toutes
signalées sur place par un cadre violet, toutes listées au §7 du fichier de
vérification. Les PDF d'origine, eux, les portent encore.

Côté technique, deux composants annoncés comme manquants existaient déjà : les
« associations » se font avec `initEtiquettes`, et les QCM à réponses multiples sont
gérés depuis toujours par le champ `"r"` du JSON, qui accepte un tableau. Le moteur
n'a donc pas été touché d'une ligne. Une seule décision mérite d'être retenue : le
client de progression n'est **pas** chargé sur ces pages. Chargé sans
`data-sequence`, il aurait affiché aux élèves « connecte-toi pour enregistrer ton
travail » alors que rien n'aurait été enregistré. Sans lui, le moteur dit la vérité.

`verifier.mjs` revient à son repère de **18 problèmes** — les 18 liens `cfa/outil-*`
connus. Le filtre `pagesSNT` couvre désormais les pages ES ; il a immédiatement
attrapé quatre indices de niveau 1 qui livraient la réponse et huit QCM dont la
bonne réponse était la plus longue. Corrigés.

---

## 05/09/2026 — Les quinze TP de seconde reviennent renumérotés

Loïc a retravaillé ses quinze sujets de TP pendant l'été et les a redéposés. La
demande tenait en une ligne — « faire la maj, enlever la mention (1) dans les noms
des fichiers ». Le `(1)` n'était que la marque d'un re-téléchargement : les cinq
doublons se sont révélés identiques au MD5 près, aucune ambiguïté sur la source à
prendre.

**Ce que la lecture des PDF a révélé, et qui n'était pas dans la demande.** Le
numéro imprimé en première page a bougé pour **douze sujets sur quinze**. *Analyse
d'un son* passe de TP5 à TP1, *Pourquoi saler les routes enneigées* de TP1 à TP3,
*La verrerie* de TP11 à TP9 — et ainsi de suite. Or le dépôt nomme ses fichiers
d'après ce numéro et l'affiche sur ses pastilles. Remplacer les octets sans
toucher aux noms aurait fait dire au site l'inverse de ce que lit l'élève sur sa
feuille. Question posée, tranchée par Loïc : **le site suit le papier**, sans
copie de compatibilité pour les anciennes URL.

**Le chantier réel.** Quinze fichiers renommés ; quinze pastilles et une étiquette
de synthèse dans dix pages de chapitre ; treize liens du hub ; l'outil `o4`
verrerie, qui citait « le TP11 » six fois et sa fiche A4 deux fois — le TP y prend
au passage le titre de son PDF, « La verrerie au laboratoire » ; le PDF de la
fiche `o4` ré-exporté ; `chapitres.md`, `DECISIONS.md` (D2 barrée, remplacée par
T1–T4) et `erreurs-sources-fiches-outils.md`.

**Contrôlé à la lecture, pas au nom de fichier.** Les quinze PDF ont été ouverts
et leur première page lue : le numéro imprimé correspond au numéro du fichier,
quinze fois sur quinze. `node verifier.mjs` rend **18 problèmes**, les 18 liens
`cfa/outil-*` du repère — aucun lien de TP cassé.

**Un piège de sed, en passant.** Le remplacement du titre du TP9 contenait des
`&nbsp;` : `sed` interprète `&` dans la chaîne de remplacement comme « le motif
entier », et la ligne est ressortie avec le titre imbriqué trois fois. Repéré à la
relecture du diff, réparé en Python. Les remplacements suivants ont évité `&` dans
la partie droite.

**Ce qui reste ouvert.** Les dossiers de `_a-deposer/tp/` gardent l'ancienne
numérotation : `TP11 - La précision de la verrerie au laboratoire/` désigne
désormais le TP publié sous le n° 9. Zone de dépôt de sources brutes, citée telle
quelle par ce journal et les archives — renommage non fait, arbitrage T4.

---

## 04/09/2026 — La rentrée : 14 groupes, cinq enseignants, et une base cloisonnée

L'équipe de SNT passe de un à cinq. Dix classes de 2nde redécoupées en 14 groupes
d'environ 25, en quatre barrettes ; la classe 2.10, à 24 élèves, est déjà à la
taille d'un groupe et n'est pas scindée. Répartition relevée sur la présentation
de rentrée et confirmée par Loïc : COUVRAT A·F·K, VAN HOORDE B·E·N, MARTIN
D·H·J·L, SANCHEZ ALZATE I·M, MAGOPHY C·G — chaque enseignant a exactement un
groupe par barrette, ce qui a servi de contrôle de cohérence.

Deux fichiers exécutés dans la foulée. Le `016` pose le cloisonnement : jusque-là
`est_enseignant()` était booléen, et tout compte inscrit lisait toutes les
classes, tous les élèves et toutes les copies du lycée. Le `017` crée les 14
groupes, renomme la classe pilote en `SNTDEM` pour libérer `SNT26A` — le groupe A
appartient à Couvrat cette année —, et supprime la classe de test.

**Ce que le cloisonnement a révélé de plus important, ce n'est pas ce qu'il a
fermé, c'est ce qu'il a fallu fermer en plus.** Les corrections ne passent pas
par une écriture directe mais par trois fonctions `security definer` qui
contournent la RLS par construction : fermer la lecture n'aurait rien garanti.
Et l'audit du `016` a confirmé au passage qu'aucune policy d'écriture n'existait
sur `classes` — le réglage du plafond d'avance n'avait donc jamais rien écrit,
en affichant un succès depuis le mois d'août.

Le relevé des classes de test de `REPRISE.md` s'est révélé faux (`SNTTSA` /
`SNTTSB` annoncées, `SNTTEA` en réalité, et une seule au lieu de deux). Le
ménage écrit d'après lui n'a d'abord rien trouvé — le bon comportement, mais un
aller-retour de perdu. Le fichier portait pourtant sa propre alerte « non
revérifié depuis le 01/08 ».

Deux classes hors progression sont conservées et ne font pas le même travail :
`PROF26` est le terrain d'essai commun aux cinq, où chacun crée ses élèves
fictifs sous le préfixe `zz-` ; `SNTDEM` garde ses 35 copies, seul matériel du
dépôt montrant une vraie file de correction, et sert aux captures d'écran des
guides.

Deux guides écrits et branchés sur un bouton *Aide* : la prise en main pour les
collègues, le dispositif en détail pour Loïc, avec export PDF contrôlé à la
mesure. Leur rédaction a mis au jour un défaut bien plus large qu'eux :
**les quatre fichiers `IBMPlexSans-*.woff2` ne portent que 5 glyphes sur 69**.
Toutes les séquences SNT et les huit outils de PC rendent donc leur texte en
police système — et en Times New Roman là où aucun repli n'est déclaré. Mesuré
au navigateur, famille par famille ; les cinq autres sont saines.

---

## 27/08/2026 — L'accueil quitte la page de titre pour deux colonnes

L'accueil empilait quatre blocs centrés de même largeur et de même rythme — titre,
gravure du jour, table des matières, Mission Spectra — sans hiérarchie entre eux.
Le plus imposant, la planche du jour (450 px de haut), est **vide** : `gravures/`
ne contient que son `A-LIRE.txt`. Pendant ce temps le hub PC recevait ses panneaux
illustrés. L'accueil était devenu la page la moins illustrée du site.

**Onze maquettes, comparées côte à côte.** Dix organisations : la porte d'entrée
(01), le sommaire du cahier (02), deux colonnes asymétriques (03), par public
plutôt que par niveau (04), le tableau de bord « reprendre où j'en étais » (05),
la planche en fond (06), trois portes (07), l'index filtrable (08), le mur de
quinze images (09), le cahier de bord daté (10). **La 03 est retenue** : elle
casse l'empilement vertical sans rien promettre qui n'existe pas — le tableau de
bord (05) et le cahier daté (10) supposent un entretien hebdomadaire, le mur
d'images (09) ne montre qu'une matière sur trois.

Puis cinq fonds appliqués à la maquette retenue — encre inversée, deux papiers,
spectre étiré, strates, blanc de laboratoire — face au fond actuel servant de
témoin. **Le quadrillage de 32 px est conservé.**

**Le piège du fond, pour la fois où la question reviendra.** `style.css` pose
`background-size: 32px 32px` sur `body`. Une nouvelle règle qui poserait un
`background-image` sur `body` sans réinitialiser `background-size` verrait sa
trame repliée sur un carreau de 32 px — sans erreur, sans rien dans la console,
juste un fond qui ne ressemble pas à ce qu'on a écrit.

**Ce que la page dit maintenant.** Colonne large : les trois classes réellement
suivies, en portes illustrées (photo, niveau en blanc sur voile, matière en
monospace), puis les trois autres niveaux en lignes sobres, puis l'adresse
professionnelle — la vraie, `l.vanhoorde@enseignant.isaac-etoile.fr`, à la place
du gabarit `prenom.nom@exemple.fr`. Colonne étroite, collante : la gravure du
jour, les quatre fiches-outils, une entrée « Animations » en attente, et Mission
Spectra dans son encadré carmin. En pied de page, une bande neuve « Auteur &
vidéo » pour l'activité d'auto-entreprise, entièrement en chantier.

**Vérifié au navigateur**, pas seulement dans le CSS : zéro débordement
horizontal à 1360, 900 et 380 px (le 380 mesuré dans une iframe, le Chromium nu
mettant en page à ~500 px minimum) ; les quatre ancres de navigation existent ;
les trois photos de porte se résolvent depuis la racine ; le repli de la planche
s'affiche bien en cadre annoté, l'image restant masquée ; huit tabulations
donnent un contour carmin de 2 px sur chaque lien et chaque porte. Le compte à
rebours a été rejoué horloge truquée : « 1 jour » le 31 août, bascule sur l'état
du projet le 1er septembre et après. `verifier.mjs` : **18 problèmes avant, 18
après**, et le compteur de liens inertes reste à 2.

`style.css` n'a pas bougé — il relie quatre autres hubs, et `git diff --stat` ne
montre qu'`index.html`.

---

## 26/08/2026 — Le hub de seconde se replie : quinze panneaux, zéro JavaScript

Quinze cartes ouvertes en permanence faisaient une page de trois écrans et demi,
où le chapitre 12 se trouvait à la molette. Les cartes deviennent des `<details>`
repliables : bande d'image de 88 px à gauche, numéro du chapitre en blanc dedans,
titre, décompte des ressources, chevron. Au dépli, la bande passe à 186 px, le
chiffre grossit de 2,1 à 4,4 rem, le résumé et les liens apparaissent —
**tout ensemble, sur 0,36 s**.

**L'ouverture continue sans une ligne de script.** `::details-content` transitionné
sur `block-size`, `opacity` et `content-visibility`, avec
`interpolate-size:allow-keywords` déclaré sur `:root` : sans cette déclaration,
`block-size:auto` n'est pas interpolable et l'animation ne se produit tout
simplement pas. Mesuré au navigateur, tous les 40 ms : la carte passe de 90 à
377 px en huit paliers, la bande de 88 à 186, le chiffre de 34 à 70 px. Aucun
saut de hauteur, aucune erreur JS.

**Nouvelles classes, CSS local à la page.** `.chapitre` est chargée par quatre
hubs ; la toucher dans `style.css` en aurait cassé trois sans qu'aucun test ne le
dise. Le style vit donc sous `.chap-panneau` / `.cp-*`, dans le `<style>` de la
page. `style.css` n'a **pas** été modifié — `git diff --stat` le confirme, et les
trois autres hubs ont été rouverts au navigateur : 13, 13 et 25 cartes `.chapitre`,
zéro panneau, rendu identique.

**L'image passe par une variable CSS, pas par une balise.**
`style="--img:url('…');--cp-focus:50% 62%"` sur `.cp-vis` : changer une
illustration, c'est éditer une chaîne de caractères. Un mode d'emploi de dix
lignes est posé en commentaire juste avant la première carte. Neuf des quinze
photos sont en portrait et se font rogner dans une bande de rapport 2,6:1 :
huit valeurs de cadrage mesurées par Loïc ont été recopiées telles quelles.

**Ce qui a été vérifié pour de vrai**, au navigateur et pas au raisonnement :
tous les chapitres repliés au chargement (15/15) ; 45 tabulations au clavier sans
atteindre **un seul** lien de chapitre ; un fragment de texte `#:~:text=` — même
mécanisme que Ctrl+F — **ouvre** le chapitre qui contient le mot ;
`prefers-reduced-motion` donne l'état final en 25 ms ; aucun débordement
horizontal à 1100, 820, 768 ni 390 px (ce dernier mesuré dans une iframe, le
Chromium nu mettant en page à 500 px minimum) ; les quinze images se chargent.

**Deux réglages ajoutés hors maquette**, la page à 820 px les réclamait : sous
860 px le décompte descend sous le titre, qu'il frôlait quand celui-ci passait sur
deux lignes ; sous 700 px les libellés de lien repassent en `display:inline`, sans
quoi la mention « pdf » restait perchée en bout de première ligne.

**Poids** : 723 ko d'images chargées à l'arrivée sur la page, 48 ko par carte en
moyenne, la plus lourde à 103 ko (`t1c4-poudre-grains.jpg`). Sous le seuil du
mégaoctet, aucune compression faite.

**Signalé, non traité.** Les deux cartes « Outils transversaux » restent en
`.chapitre` : le brief porte sur les cartes de **chapitre**, et les outils n'ont
pas d'illustration attribuée. Elles cohabitent donc avec les panneaux, dans un
style visiblement différent. Le cadrage de `t2c1-danseur-rotation.jpg` ne laisse
qu'une masse rouge floue dans la bande repliée. Et la maquette de référence
`panneau-ouverture-continue.html` n'était pas dans le dépôt : le CSS structurant
vient du brief, le reste (titre, décompte, corps, liens) est dérivé de la charte
« papier d'étude » de `style.css`.

**Contrôle** : `verifier.mjs` → **18 problèmes**, les 18 liens `cfa/outil-*`
attendus, inchangés.

---

## 26/08/2026 — Les outils de seconde s'ouvrent en entier

Demande de Loïc, en une phrase : « débloquer systématiquement toutes les étapes
dans les outils de seconde PC ». À l'ouverture du dossier, le code disait
l'inverse de la consigne — `CONSIGNES-outil-PC.md` promet un outil « ouvert toute
l'année », et un commentaire de `o1` l'écrivait noir sur blanc (« un outil est
ouvert toute l'année, il n'a rien à déverrouiller »), pendant que les deux pages
héritaient sans le vouloir des **deux** verrous du moteur SNT : la révélation
étape par étape, et la cascade qui ferme la section 2 tant que la méthode n'est
pas finie.

**Ce qui a été fait.** Un drapeau de page, `data-etapes="ouvertes"` sur le
`<body>`, et trois gardes dans `sequence-snt.js` : `initReveal()` ne masque plus
rien et ne crée plus le bouton « Étape suivante ↓ », la cascade de `refresh()` ne
pose plus `locked`, et `toutRevel()` ne remasque plus en quittant le mode
enseignant — cet oubli-là aurait refermé la page au premier clic sur la case
professeur. Le `locked` écrit en dur sur `#s2` est retiré des deux pages.

**Le piège évité.** Écrire ces gardes en `classList.remove()` réveillait le
`MutationObserver` des `.steps` et tuait l'onglet (piège du 22/08) : tout passe
par `toggle(…, false)`, qui n'écrit rien quand il n'y a rien à retirer.

**Mesuré au navigateur, pas déduit du CSS.** `o1` : 9 étapes sur 9 visibles,
`s2` ouverte, aucun bouton « suivante », zéro erreur JS. `o2` : 8 sur 8. Témoins
SNT inchangés — `t1` garde ses 19 étapes masquées et ses cinq séances fermées,
`m1` ses 7. `node verifier.mjs` : 18 problèmes, le repère exact.

**Un effet de bord assumé.** L'étape 1.1 de `o1` se validait « à la lecture », au
moment où l'étape 1.2 se révélait. Ce signal n'existe plus : elle se coche
maintenant au chargement. Sur un outil, la barre de progression est un
pense-bête, pas une note — et une pastille qui ne se cocherait jamais serait
pire. Le commentaire de la page a été réécrit plutôt que laissé à décrire un
mécanisme disparu.

---

## 27/08/2026 — Audit 1 des outils PC : deux décisions de fond, et un moteur sans garde

Relecture de `o1` et `o2` par Loïc les 26 et 27/08. Le modèle est validé ; ce qui
suit porte sur le contenu, la densité d'exercices et quatre défauts de forme.

**Deux décisions de fond, appliquées au dépôt entier.** Le **seuil de l'ordre de
grandeur passe de `√10 ≈ 3,16` à 5** — « on n'utilise pas du tout la racine de
dix au lycée » — ce qui touche la page `o1`, sa fiche A4 et le cahier de vacances
`diag-j01`, sans changer une seule réponse d'exercice. Et **l'ambiguïté des zéros
de fin disparaît** : `100` fait trois chiffres significatifs, `50` en fait deux,
c'est la fiche du collègue qui l'emporte. La notion de **nombre exact** (formule,
définition, dénombrement) prend sa place — plus utile que celle qu'elle remplace,
les élèves la rencontrent dès le premier calcul de physique.

**L'argument du seuil ne survivait pas au changement de seuil.** Le brief
proposait de garder l'idée que « les deux zones ont la même longueur ». Elle
n'est vraie que pour `√10` : sur un axe linéaire de 1 à 10, les deux zones de
part et d'autre de 5 font 4 et 5 unités, et « 5 est plus près de 10 que de 1 »
n'est vrai qu'en facteur — c'est-à-dire l'argument qu'on abandonne. Le seuil est
donc justifié par l'**arrondi**, et le schéma refait en axe linéaire, sans note
sur les longueurs. Signalé comme proposition à valider (O-22).

**Le moteur n'a pas de garde sur `#teacherMode`.** Le brief demandait de retirer
la case cachée avec le bloc du mode enseignant. Fait, puis vérifié au navigateur :
la page casse. `sequence-snt.js` l.350 fait
`document.getElementById('teacherMode').addEventListener(...)` sans test, et toute
l'initialisation s'arrête là — barre de progression et modales comprises. La case
reste donc, inerte faute de `.ens-zone` pour la cocher, et c'est écrit dans les
consignes pour `o3` à `o8`.

**La densité d'exercices était le vrai sujet.** Chaque étape se fermait sur un
micro-champ de deux cases, quel que soit ce qu'elle avait introduit. `o1` passe de
4 à 12 blocs de vérification et gagne deux QCM (6 et 10 questions) ; `o2` passe de
4 à 8 et gagne un QCM de 6. La méthode de `o1` s'est scindée en cinq étapes au
passage — l'ancienne 1.3 empilait quatre règles de calcul, treize préfixes et
quatre cas de conversion. Les **conversions de surfaces**, qui n'existaient que
dans une incise, ont enfin un tableau, une règle et trois exercices.

**Les « à retenir » passent à trois temps** — la règle, grande et centrée · le
geste · le contrôle, plus « le piège » quand il y en a un. Motif : « quand tout
est en gras, rien ne l'est ». Neuf blocs repris, plus les deux fiches A4, et la
structure devient une convention de la famille (`CONSIGNES-outil-PC.md` §3).

**Deux simplifications par rapport au brief, toutes deux mesurées avant d'agir.**
Les huit pictogrammes de la frise tiennent dans les 104 px déjà libres à gauche de
l'axe : le `viewBox` n'a pas bougé, aucune coordonnée existante n'a été décalée.
Et la frise de la fiche A4 n'existe pas en SVG — c'est une phrase à trois
repères : il n'y avait rien à illustrer.

**Contrôles.** `verifier.mjs` : 18 problèmes, inchangés. Aucun asset partagé
modifié. Les deux parties 1 jouées en entier au navigateur : 5/5 et 4/4 étapes,
jauge à 100 %, partie 2 déverrouillée, zéro erreur console. Toutes les réponses
attendues rejouées : 114/114 champs acceptés sur `o1`, 56/56 sur `o2`. Le mot
« PDF » a disparu des trois endroits où le moteur l'écrivait, séance terminée
comprise. Rendu mesuré en iframe à 768 et 390 px : aucun débordement. Les deux
fiches tiennent toujours en deux pages exactement.

---

## 22/08/2026 — Audit du module `m1` : onze lots, et deux bugs qui touchaient tout le site

Troisième brief de la journée, sur le module « Représenter l'information ». Onze
lots, du bug d'affichage à la refonte du socle mathématique.

**Les deux bugs signalés étaient le même bug.** L'audit décrivait « des balises
HTML visibles en clair » dans une question de l'étape 1.1, et, séparément, « un
souci de typographie » dans la question 3 du QCM de 2.2. Les deux venaient de
`baliserSobre()`, la fonction du moteur qui rouvre une petite liste de balises
dans les options de QCM après les avoir échappées. Sa regex n'acceptait que des
balises **sans attribut** : `<i lang="en">binary digit</i>` restait échappé et
l'élève lisait le code source. Et comme la fonction échappe d'abord tout, les
entités typographiques du fichier de cours y passaient aussi :
`1&nbsp;073&nbsp;741&nbsp;824` s'affichait en toutes lettres. Un seul correctif
règle les deux, et il profite aux neuf séquences.

**Le « à retenir » s'ouvrait trop tôt, et c'était un choix.** Le commentaire du
moteur le disait franchement : depuis le 22/07, « la révélation se fait toute
seule dès la dernière réponse ». Sauf que remplir n'est pas se corriger — le
bilan donne les réponses à un élève qui n'a pas encore cliqué sur Vérifier. La
règle change pour toutes les séquences. Détail qui compte : la trace du clic est
posée sur le **bloc** et non sur l'étape, sinon une étape à deux exercices se
serait validée à moitié.

**Un cadre invisible depuis le 21/08.** Le bloc `.demo-a` de l'étape 1.3 — la
démonstration de la méthode A — n'était styé **nulle part** : ni dans le CSS
partagé, ni dans le CSS de la page. Il s'affichait donc sans cadre ni titre,
noyé dans le texte. Renommé `.exemple` et stylé, il sert maintenant aux exemples
travaillés de 1.2 et 1.3.

**Une collision de nom de classe.** Le calcul déroulé utilisait
`<span class="res">` pour le résultat. Or `.res{display:flex;flex-direction:column}`
existe déjà dans le CSS partagé : « 77 » et son indice « 10 » se retrouvaient
l'un **sous** l'autre. Invisible à la relecture du code, évident à la capture.
Renommé `.res-calc`.

**Deux pièges d'outillage, notés pour la prochaine fois.** `String.replace()`
interprète `$` dans le texte de remplacement : un `$('…')` de mon patch est
arrivé dans le moteur en `$('…')`, et le bloc s'est appliqué deux fois. Depuis,
tous les patchs passent une **fonction** de remplacement. Et corriger une
coquille avec `io.open(…, 'w')` en Python a réécrit les 1394 lignes du fichier
HTML **en CRLF**, alors que tout le dépôt est en LF — rattrapé avant le commit.

**Ce que le module gagne.** Le socle mathématique, qui manquait : ce qu'est une
puissance, les rangs en base 10 et en base 2 en regard, et la notation de la base
en indice, posée une fois et employée partout ensuite. Un exercice d'entrée sur
la décomposition positionnelle, avant tout binaire, sur deux bases que les élèves
connaissent déjà — la base 10 et la base 60 du temps. Les trente combinaisons de
1 à 4 bits **écrites en clair**, avec le seul bit ajouté coloré : le doublement
se voit. Un quatrième composant SVG, la **méthode A pas à pas**, pendant exact de
la potence, avec le journal des soustractions en grand. L'adresse IP expliquée
**avant** d'être interrogée. La loi de Moore en bonus, derrière une question de
recherche dont la réponse déclenche la figure. Le téraoctet binaire calculé par
les élèves plutôt que donné. Et un disque dur photographié de 1998 dont les
3 227 Mo constructeur font exactement 3,005 Gio — le décalage Go/Gio sur un
objet réel, à la décimale près.

**Ce qui reste à trancher** : le placement de la photo des transistors (posée
dans le document, là où le texte les nomme), la formulation de l'ordre de
grandeur « 1,12 million de kilomètres », et le volume du bilan de 2.4, écrit à
douze questions. Le « Monsieur Jean-Luc » que l'audit soupçonnait d'être une
référence orpheline **n'existe nulle part dans le dépôt** : rien à réparer de ce
côté.

---

## 22/08/2026 — Audit des séances 3 et 4 de `t1` : trois diagnostics, dont deux faux au départ

Deuxième brief de la journée, sur l'ancienne séance 2 (« Internet et moi ») et
l'ancienne séance 3 (« Le réseau physique »). Il avait été écrit **avant** la
découpe du matin, donc toute sa numérotation avait glissé d'un cran — les
`data-cle` posés la veille ont servi exactement à ça : se repérer sans jamais
compter les étapes.

**Le diagnostic qu'on croyait tenir, et qui était faux.** Loïc signalait trois
blocs de menus déroulants « totalement illisibles », et le brief supposait la
même cause que le tableau de Lannion : largeur intrinsèque des champs, pas de
conteneur défilant. Mesure au navigateur : rien à voir. `.label-selects label`
était en `display:grid` — et en grille, **chaque enfant direct devient une
cellule**. Un énoncé écrit « Si le `<b>`fil partagé`</b>` est coupé en son
milieu… » se retrouvait éclaté en trois cases. Les questions **sans balise** dans
leur énoncé, elles, s'affichaient parfaitement : d'où un défaut illisible à la
relecture du code et évident à l'écran. C'est exactement le partage 1 sain /
2-3-4 cassés que Loïc décrivait, et personne ne l'aurait deviné sans capture.

**Le bug qu'on n'a pas reproduit.** Le brief demandait de trouver pourquoi le
bilan de fin d'activité refusait de s'ouvrir. Parcours joué pour de vrai dans
Chrome sur trois étapes — rédactions dans la scène de focus, textes à trous,
menus, QCM cliqué question par question : **le bilan s'ouvre à chaque fois, au
bon moment**, et le compteur descend d'une unité par bloc rempli. Le seul chemin
reproductible vers le symptôme est le tableau de Lannion rogné : sous 520 px, la
carte escamotait deux à quatre champs de saisie, le texte à trous ne pouvait
donc jamais être complet, et le bilan restait fermé sans que rien ne l'explique.
Corrigé — 8 champs sur 8 atteignables à 390 px. Si le blocage se reproduit sur
un écran large, il faudra le prendre en session connectée : tout ce qui
distingue encore le cas de Loïc du mien passe par Supabase.

**Le piège du jour.** En ajoutant une animation à l'ouverture de la porte
d'intuition, l'onglet s'est mis à mourir au chargement. Cause : un
`MutationObserver` surveille `class` dans `.steps` et rappelle `bqMaj()`. Or
`classList.remove()` **réécrit l'attribut même quand le jeton est absent** —
mutation, rappel, mutation, jusqu'à tuer le moteur de rendu. `classList.toggle(t,
false)` court-circuite dans ce cas : c'est pour ça que le code d'origine, qui
n'utilisait que `toggle`, convergeait depuis toujours. Deux lignes en apparence
équivalentes, et l'une des deux fait exploser la page.

**Le reste.** L'enquête box dit maintenant qu'elle est facultative, qu'elle
réclame un mot de passe que seul un adulte détient, et qu'un refus des parents
est une réponse acceptable — trois phrases, dans le texte vu par l'élève. Le
maillé remonte dans la liste des topologies et Internet en sort : ce n'est pas
une quatrième forme, c'est un assemblage des trois. Le débriefing sur l'ordre de
grandeur ne se lit plus avant d'avoir cherché. Quatre notes de chantier réglées
ont quitté la page pour le suivi. Et deux images de fibre optique sont entrées
dans le dépôt, sous CC BY-SA 2.5 et CC BY 3.0, avec auteur, nom de fichier,
licence et lien dans chaque légende — la photo est passée de 3 Mo à 56 Ko au
passage, ce qui n'est pas un détail sur le réseau d'un lycée.

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
**coque du site uniquement** : accueil (refondu depuis, voir l'entrée du
27/08/2026 : deux colonnes, portes illustrées, atelier collant), pages de
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

- [x] Remplacer le courriel placeholder `prenom.nom@exemple.fr` par la vraie
      adresse — fait le 27/08 : `l.vanhoorde@enseignant.isaac-etoile.fr`
- [ ] Décider où annoncer l'espace classe ENT : le bloc « Courriel /
      Établissement / ENT » a disparu de l'accueil le 27/08, son lien mort avec lui
- [ ] (plus tard) Créer la page « collection de gravures ». Le lien
      « Voir la collection » a été retiré de l'accueil le 27/08 : il bouclait sur
      lui-même

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

**22/08/2026, fin de journée — le plafond d'avance désaccordé entre le prof et
l'élève.** Loïc signale des thèmes fermés côté élève alors que son tableau de
bord affiche « tout ouvert ». Deux choses en cause, dont une de la session.

**De la session** : `seances-snt.js` a été régénéré au lot J (t1 passe à
6 séances, donc tous les rangs à partir de `snt-t2` glissent d'un cran) **sans
que son `?v=13` bouge**. Les navigateurs servaient donc l'ancien référentiel
depuis leur cache. Pire : `prof/index.html` le chargeait **sans `?v=` du tout**
et recevait, lui, la version fraîche. Le professeur et l'élève ne calculaient
pas sur le même ordre de séances. Passé à `?v=14` partout, `prof/index.html`
compris, et `verifier.mjs` refuse désormais — **en bloquant** — une référence
sans `?v=` ou deux versions divergentes : le rang d'une séance commande le
plafond, une version en retard ouvre ou ferme les mauvaises portes en silence.
La règle 🔴 du versionnement de `CLAUDE.md` ne visait que
`chapitre-commun.css` ; elle vaut pour tout fichier **généré**.

**Ce que la lecture du code apprend sur le symptôme.** Un thème n'est fermé au
hub que si **toutes** ses séances dépassent le plafond, et le plafond vaut
« rang de la dernière séance faite + avance autorisée ». Simulation faite sur le
référentiel réel : si le plafond était simplement bas, `snt-t1` resterait ouvert
(ses rangs 5 à 10, plafond 7 avec T1 S1 faite). Or la capture montre `m1`
— rangs 0 et 1 — comme **seul** thème sans bandeau. Cette signature-là ne
s'obtient qu'avec un plafond au rang 1, donc `dernierFait = -1` : **aucune
séance faite n'est reconnue côté élève**, et `plafondLeve` y est faux. Reste à
savoir pourquoi — la purge des lignes de test du matin, ou une session qui n'est
pas sur la classe SNTTEA. Non tranché : ça se lit en base, pas dans le dépôt.

**Tranché le soir même** : le compte utilisé sur le hub n'était pas rattaché à
la classe réglée dans le tableau de bord. Cette autre classe avait le défaut
`avance_max = 2` et aucune ligne dans `seances_faites` — d'où le plafond au
rang 1, et `m1` seul ouvert. Aucun défaut de code : le plafond faisait
exactement ce qu'on lui demandait. Le correctif de cache reste nécessaire pour
sa propre raison.

Deux choses à en retenir. La signature de la panne se lisait dans la capture
avant même d'ouvrir la base : **quel** thème reste ouvert dit à quel rang est le
plafond, et « m1 seul » ne pouvait vouloir dire qu'une chose. Et surtout : rien,
nulle part, ne dit à l'élève dans quelle classe il est. Un élève qui se
tromperait de code à l'inscription travaillerait des semaines dans la mauvaise
classe sans jamais le voir. Versé dans `IDEES.md`.


---

## 23/08/2026 — refonte de `t0`, la séquence qui enseigne le cours

La séquence d'introduction avait un défaut que rien ne signalait : elle
**décrivait aux élèves des mécanismes qu'elle n'avait pas**. Barre de
progression, marques d'évaluabilité, QCM plein écran, glossaire, mode enseignant
à code : tout cela était écrit dans son texte, et absent de son code. Elle
tournait sur un **fork figé du moteur** — 272 lignes de `<style>` et 229 de
`<script>` recopiées avant l'extraction du moteur partagé, soit 46 % du fichier
— et ne portait que **43 %** du contenu de ses trois documents source.

Deux points durs, mesurés au navigateur avant de commencer. Le **mode
enseignant** n'était pas protégé : un clic sur la case, sans code, sans
minuterie, ouvrait tout — et l'étape qui expliquait où trouver la case était
lue par les élèves. La **réponse rédigée** était une simulation : un
`setTimeout` de 2,4 s jouait la pré-correction, rien ne partait. Et
`Progression.disponible()` répondait `true` pendant qu'aucun appel réseau n'était
émis : un élève pouvait finir toute l'introduction et rester affiché à 0 % dans
le hub.

Le travail s'est fait en trois lots, avec relecture entre chaque, parce qu'une
passe unique aurait produit un diff que personne ne peut relire.

**Lot 1 — le portage.** Le fork est supprimé, pas réparé : c'est la bonne
nouvelle de l'audit, 91 des 94 classes de `t0` étaient déjà reconnues par
`sequence-snt.css`, le moteur ayant été extrait de la même souche. Restaient
`a-noter`, `switch` et `tlabel`, relogées ou disparues avec l'interrupteur nu.
Les 44 couleurs en dur hors `:root` s'évaporent d'un coup.

**Lot 2 — les trois séances.** Le document d'origine tient en une séance d'1 h 30 ;
avec 100 % du contenu **plus** une étape 1.1 qui présente et fait tester chaque
mécanisme, deux séances ne suffisaient plus. Principe directeur retenu : **un
mécanisme est expliqué, puis mis en action à l'étape suivante**. À la fin de
`t0`, un élève a utilisé de ses mains les douze dispositifs qu'il rencontrera
dans l'année. Quatre SVG ont été dessinés, dont la **planche des quatorze
connecteurs à la même échelle** qui remplace le tableau anglophone sans licence.

**Lot 3 — l'intégration.** Sommaire régénéré (`t0` passe de 3 à 4 séances, d'où
`seances-snt.js?v=15` sur les six pages), 47 questions au répertoire, quatre
grilles de pré-correction, hub à jour.

Deux choses à en retenir. La première : **le banc d'essai a trouvé une erreur
que la relecture n'aurait pas vue.** J'avais écrit, en 1.1 puis en 2.3, qu'un
bouton « Afficher le à retenir » révèle le bilan. Faux depuis la décision du
25/07 : le moteur l'ouvre **tout seul** dès que l'exercice est fait, et le bouton
n'est plus qu'un compteur verrouillé. Le texte reproduisait exactement le défaut
qu'on venait de corriger — décrire un mécanisme que le code n'a pas. Il a fallu
ouvrir la page dans un vrai navigateur et cliquer pour s'en apercevoir.

La seconde : **la checklist du brief se trompait sur trois marqueurs.** Elle
demandait qu'il ne reste aucun `data-check-cloze`, `data-check-diagram` ni
`data-share`, les rangeant parmi les vestiges du fork. Ce sont des composants
vivants du moteur, employés 8, 3 et 10 fois dans `t1`. Les supprimer aurait
retiré à `t0` le texte à trous, les associations et le partage des réponses
personnelles. Seuls `data-qcm` et `data-free` étaient réellement des vestiges,
et ils ont disparu. Une checklist se vérifie contre le code, elle aussi.

---

## 24/08/2026 — `t0`, deuxième audit : ce que le navigateur a montré

Vingt lots dictés après un test en classe sur la page livrée la veille. Trois
choses méritent d'être racontées, parce qu'aucune des trois ne se voyait dans le
code.

**L'archive d'images n'était jamais arrivée.** Le brief décrivait cinq photos
livrées, une capture d'écran et vingt-six images reconstruites ; le dossier ne
contenait que les fichiers du 23/08. Seuls le brief et une planche de contrôle
avaient été déposés dans `Téléchargements`. Mais tout le matériau source était
là : les cinq originaux Wikimedia, et surtout le PDF « 01 — Les systèmes
informatisés (AD) — élèves » d'où viennent les images du dossier. La livraison a
donc été refaite sur place. Le diagnostic du brief était exact : dans le PDF,
chaque image est un JPEG **accompagné d'un masque de transparence**, et
l'extraction qui avait alimenté le dossier avait gardé le JPEG en jetant le
masque — d'où des objets aplatis sur du noir. Réextraction masque compris,
composition sur blanc : **26 images** exactement, le compte annoncé. Quatre
images de bonus dormaient dans le même PDF, dont la tablette qui manquait à
l'accroche de 1.2. Quant à la capture de la barre de fin de séance, elle n'avait
pas besoin d'être fournie : la page rendue dans un Chromium sans interface la
produit mieux, et à jour.

**La barre de fiche ne se masquait pas, et la raison était un ordre
d'exécution.** Le verrou demandé était simple — la barre reste cachée tant que la
dernière étape à valider n'est pas dévoilée. Écrit dans `refresh()`, il ne
marchait pas : mesuré au navigateur, `barreCachee` valait `false` alors que
l'étape était bien masquée. Le masquage initial est posé par `initReveal()`, qui
vit dans le **bloc suivant** du fichier — donc *après* le premier `refresh()`. Au
moment du calcul, aucune étape n'était encore masquée. La révélation prévient
désormais la barre par un événement `etape-revelee`, seul moyen de traverser le
cloisonnement des blocs. Sans un test dans un vrai navigateur, la page serait
partie avec le verrou inopérant et l'air de fonctionner.

**Les vidéos partaient chez Google avant que personne n'ait cliqué.** La
checklist du brief demandait qu'aucune requête ne parte vers un autre domaine que
`youtube-nocookie.com`. Vérification faite à l'ouverture de la page, sans la
moindre interaction : `fonts.gstatic.com`, `www.google.com`,
`jnn-pa.googleapis.com`. Une `<iframe>` YouTube charge ses ressources **dès le
rendu**, y compris dans une étape masquée, y compris en mode `nocookie` — qui ne
supprime que le cookie publicitaire. L'adresse IP de chaque élève partait donc à
la seconde où il ouvrait le cours, ce que la règle des polices auto-hébergées
interdit partout ailleurs sur le site. Les vidéos sont passées derrière une
affiche locale : `data-src` dans les pages, `initVideos()` dans le moteur, et
l'iframe n'est créée qu'au clic. Premier essai insuffisant — le remplacement en
JavaScript arrivait après que le navigateur eut lancé la requête ; il a fallu que
le `src` n'existe pas dans le HTML. Mesure finale : **zéro requête externe** au
chargement de `t0`, `t1`, `t2` et `m1`, et la vidéo se charge normalement au clic.

Deux corrections plus discrètes, du même genre. Les annotations posées sur les
languettes PCIe tombaient dans le vide : les pourcentages étaient calculés sur le
cadre de la figure, alors que l'image, contrainte en hauteur, n'en occupe qu'une
partie — et le conteneur, enfant d'un flex, s'étirait encore au-delà. Il a fallu
un conteneur ajusté à l'image et un `align-self`, puis mesurer la position réelle
des contacts dorés dans les fichiers plutôt que de l'estimer. Et le brief
annonçait « exactement 2 anomalies connues » pour `verifier.mjs` : le repère est
**18**, les dix-huit liens `cfa/outil-*` vers des fiches non écrites, comme
`CLAUDE.md` le dit. Un repère faux transforme une non-régression en fausse alerte.

---

## 25/08/2026 — `t0` : ce qu'on trouve quand on va vérifier

Sept demandes de Loïc, captures à l'appui. Trois d'entre elles ont mis au jour
des défauts qui n'étaient pas dans la liste.

**Un dépôt de photo ne validait rien, et personne ne pouvait le voir.** En
préparant les dix fiches de la séance 4, il fallait s'appuyer sur le mécanisme
de dépôt existant. Premier réflexe : le tester pour de bon, en envoyant un
fichier depuis le navigateur. L'aperçu de la photo s'affiche bien — et la console
dit `verdict is not defined`. `initDepot` appelle deux fonctions définies dans un
autre bloc du fichier, invisibles depuis le sien : l'élève ne recevait aucune
confirmation, et surtout **l'étape n'était jamais validée**. Les trois dépôts de
`t0` étaient dans cet état depuis leur écriture. C'est le cloisonnement des blocs
du moteur, déjà rencontré le 24/08 pour la barre de fiche — sauf qu'ici l'erreur
était visible dans la console depuis des semaines, et que personne n'y regardait.

**La vidéo coupée n'était pas coupée partout.** Loïc signalait qu'elle
n'apparaissait pas en entier. Mesure faite à cinq largeurs d'écran : à 1600, 1366,
1100 et 900 px le bloc tient dans le plafond CSS de 1600 px ; à **768 px**, la
largeur d'un iPad en portrait, il en fait 1747 et le bas disparaît. Le défaut ne
se voyait que sur la machine de l'élève, pas sur celle où l'on écrit la page.

**Le lien « Sommaire » de `t0` ne faisait rien.** Trouvé en cherchant à
reproduire la carte des séances d'une des captures : `carte-reseau.js` n'était pas
chargé sur cette page, donc `hubCarte()` renvoyait une chaîne vide et la modale ne
s'ouvrait pas. Un lien visible, cliquable, sans effet — depuis la refonte du 23/08.
La question « faut-il généraliser la carte à `t0` ? », ouverte depuis deux jours,
s'est réglée toute seule : il ne s'agissait pas d'un choix mais d'un manque.

Deux composants ont été écrits pour les demandes elles-mêmes. Les **dix fiches
d'élément** redimensionnent la photo dans le navigateur avant de l'afficher : une
photo de téléphone pèse 3 à 5 Mo, dix d'un coup feraient plier l'onglet — et sans
cette réduction, la remontée vers le tableau de bord serait de toute façon
impraticable. Les **étiquettes à poser** sur la façade arrière n'utilisent pas le
glisser-déposer HTML5, qui ne fonctionne pas au doigt sur iPad : on touche
l'étiquette, puis l'endroit. Le même geste marche à la souris, au doigt et au
clavier. Les dix zones ont été placées à l'œil, puis contrôlées en dessinant les
cadres directement sur l'image source — plus sûr que de juger sur une capture
d'écran réduite.

Enfin, les captures d'interface attendues depuis le 24/08 n'ont pas eu besoin
d'être fournies : la page rendue les produit, états simulés compris. Elles se
referont à l'identique le jour où l'interface changera, ce qu'un fichier envoyé
par messagerie ne permet pas.

**Ce qui n'a pas été fait**, et c'est délibéré : la remontée des photos vers le
tableau de bord. Une photo déposée ne quitte aujourd'hui jamais le navigateur.
La faire remonter demande une migration, un espace de stockage, des règles
d'accès — et une décision sur la durée de conservation de photos prises en
classe. Ce n'est pas un réglage de fin de session.



## 25/08/2026 — T3-C1, audit 1 : le cours reprend de la place

Le matin, la V1 intégrale. L'après-midi, Loïc la relit page ouverte et dicte son
verdict : **fidèle mais sèche**. Les images 1 et 2 donnent le bon équilibre, puis
il se dégrade — les figures écrasent le texte, et le PPTX est plus fourni que la
page, ce qui ne devrait jamais arriver.

Six lots, enchaînés d'un trait à sa demande après le premier compte rendu.

**Ce que la mesure a appris, et que la lecture du CSS n'aurait pas dit.** Le brief
prescrivait `line-height:2.15` sur les lignes portant une fraction. Appliqué tel
quel, l'interligne se propageait **à l'intérieur** de la fraction : chacun des
deux étages doublait, et le bloc formule passait de 46 à **138 px** de haut. Un
`.avec-frac .frac { line-height:1.15 }` le ramène à 88 px — le doublement honnête
d'une fraction à deux étages.

Même chose pour les vignettes : le brief demandait 150 px et « une seule ligne en
desktop ». Mesure faite, la colonne de cours n'offre que **742 px** — à 150 px les
cinq vignettes de l'exercice 4 passaient à la ligne. Une base flexible (118 px,
étirée jusqu'à 150) donne une ligne en desktop, deux sur iPad, trois à 380 px.

**Quatre signalements de collision étaient des artefacts** de ma propre mesure : je
ne testais que l'axe vertical, or le crayon ✎ et la colonne `.grandeurs` sont
*à côté* horizontalement. Le vrai test est l'intersection de rectangles.

**Un défaut réel trouvé, et laissé.** À 380 px, cinq résultats encadrés débordent
à droite et sont rognés. J'ai rendu la version d'avant l'audit pour trancher :
**13 débordements avant, 13 après**, mêmes endroits, mêmes amplitudes. Ce n'est
pas une régression — c'est `.resultat { white-space:nowrap }` combiné à
`.eq-ligne { text-align:center }`, dans le socle. Le corriger touche les 14
chapitres et leur `?v=N` : c'est une décision à part, posée en `A1-7`.

**La vidéo de la cloche à vide entre dans le cours sans rien laisser fuir.** Une
façade SVG maison (la cloche, la sonnerie, les ondes qui s'éteignent, la pompe),
un bouton, et l'iframe `youtube-nocookie` créée **au clic seulement**. Vérifié au
navigateur : **zéro requête vers un hôte externe au chargement**, zéro iframe dans
le DOM avant le clic. Premier essai, le bouton rouge masquait la sonnerie — le
sujet même de l'illustration ; il est descendu en bas de la façade.

**Les trois vidéos anonymes ont retrouvé leur nom** — relevés sur l'oEmbed de
YouTube, pas inventés : Les Bons Profs, Les génies des sciences, C'est pas
sorcier.

**Une incohérence antérieure est devenue visible en rapprochant les blocs** : la
phrase « le domaine audible se subdivise en trois zones » annonçait un tableau qui
en aligne cinq. Tant que le texte et le tableau étaient éloignés, personne ne le
voyait. Corrigé.

Retiré à sa demande : la remarque sur les **chiffres significatifs** de
l'exercice 2 — la notion arrive après ce chapitre dans sa progression. Versé dans
`IDEES.md` : les **animations interactives** (faire varier période et fréquence,
voir le signal se déformer, l'entendre), qu'il veut, mais plus tard.

Tous les textes ajoutés sont des **propositions à valider** : le bloc Méthode,
l'énoncé étoffé de l'exercice 1, le lien grave/aigu, l'amplitude et sa mise en
garde, la question sur la cloche à vide, les seuils de danger et de douleur.


## 25/08/2026 — « fait tout de même » : le socle réparé

J'avais laissé le débordement des résultats à 380 px en le posant comme une
décision à part : il touche les 14 chapitres et leur `?v=N`. Loïc a tranché en
trois mots.

**Le coupable n'était pas celui que j'avais nommé.** J'avais accusé
`.resultat { white-space:nowrap }`. En ouvrant le socle, c'est
`.eq-ligne { white-space:nowrap; overflow-x:auto }` qui pose le problème :
combiné à `text-align:center`, une ligne trop large sort des **deux** côtés, et
le navigateur ne défile jamais vers la gauche — la moitié gauche du calcul est
perdue pour de bon.

**L'ampleur ne se devinait pas.** Mesure sur les 14 chapitres à 380 px :
**45 lignes de calcul sur 159 amputées, sur 11 chapitres**, jusqu'à **324 px** de
formule disparus (la masse molaire de la dopamine, en T1-C4). Trois pages avaient
même un scroll horizontal complet. Le défaut ne touchait donc pas T3-C1 en
particulier — il vivait là depuis le début, sur presque tout le cours de seconde.

**La correction retenue** : une ligne de calcul se **replie**, elle ne défile
pas. `white-space:normal` + `line-height:1.75` sur `.eq-ligne`, `.eq-exo` et
`.formule-cours-rappel` ; les atomes restent insécables, ils l'étaient déjà
(`.nb`, `.resultat`, `.frac`). Mesure après : **0 débordement**, sur les trois
largeurs. Le repli tombe souvent juste — l'équation de combustion de T1-C2 se
coupe **après la flèche**, exactement là où la typographie le veut. Il coupe
parfois après un `×` : moins élégant, mais lisible, alors qu'avant le calcul
était tronqué.

**Le scroll horizontal venait d'ailleurs**, et deux causes se cachaient derrière :
huit tableaux `.tab` **jamais enveloppés** dans un `<div class="defile">` (quatre
rien qu'en T1-C1) ; et la frise historique de T1-C3, où `grid-template-columns:1fr`
refusait de descendre sous la largeur *min-content* de la rangée flex du nœud —
le classique qui se répare en `minmax(0,1fr)`. Les trois pages sont maintenant à
380 px pile.

Socle en **`?v=4`** dans les **17** fichiers qui le chargent — et non 14 : le
gabarit, et **deux pages d'enseignement scientifique de terminale** que je ne
soupçonnais pas. `verifier.mjs` contrôle lui-même cette cohérence, et la confirme.

Vérifié : 18 problèmes (le repère), aucune erreur JS sur les 16 pages, balance des
balises intacte sur les 7 pages dont j'ai modifié le HTML, verrou de T3-C1 rejoué
en entier.

---

## 25/08/2026 — Lot 1 des outils transversaux de physique-chimie

Quatrième famille du dépôt, ouverte sur brief. Deux outils produits de bout en
bout, plus les consignes durables.

**Livré** — `pages/2nde-pc-o1-ecriture-scientifique.html` et
`pages/2nde-pc-o2-chiffres-significatifs.html` sur le moteur SNT, sans le
modifier ; leurs deux fiches A4 **complétées**, en deux pages exactement ; la
famille « Outils transversaux » au hub PC, avant le thème 1 ;
`_modeles/CONSIGNES-outil-PC.md`, autonome ; et l'inscription de la famille dans
`MANIFESTE.md` et `CLAUDE.md`.

**Ce qui a surpris, et qui a changé la production.**

Le moteur partagé a été conçu pour des **mots**, et trois de ses comportements
sont nuisibles sur des **nombres**. Le plus grave : sa normalisation efface le
signe moins, si bien que `10^-3` et `10^3` sont indistinguables — un élève qui
oublie le signe de l'exposant, l'erreur la plus fréquente sur cet outil, aurait
été compté juste, en vert, sans rien voir. Le contournement ne touche pas le
moteur : le signe passe par un `<select>`, que le moteur corrige à l'exact et
sans Levenshtein, avec des `value` opaques (`pos` / `neg`) parce que `+` et `−`
se normalisent tous deux en chaîne vide. D'où la table de saisie à trois
colonnes — **une colonne par décision** — qui structure les deux outils. Les
deux autres comportements et leurs mesures sont consignés dans `DECISIONS.md`
(M-1 à M-3).

Trois pièges d'outillage se sont ajoutés (P-1 à P-3) : `.res` existait déjà dans
la feuille partagée en `display:flex` et faisait éclater tous les encadrés de
résultat sans la moindre erreur ; `verifier.mjs` cherche le nom du sommaire
généré jusque dans les **commentaires** HTML, si bien qu'un commentaire disant
« ce fichier n'est pas chargé » faisait échouer le contrôle de version ; et le
mode headless de Chrome impose une largeur de mise en page minimale d'environ
500 px, ce qui fait **rogner** une capture demandée à 390 px au lieu de la faire
replier — j'ai cru une demi-heure à un défaut de responsive qui n'existait pas.

Aucun générateur de QR code n'existait dans le dépôt, et aucune bibliothèque
n'est autorisée. L'encodeur écrit pour l'occasion (version 6, niveau M, mode
octet) **s'autovérifie** avant de sortir quoi que ce soit : syndromes
Reed-Solomon tous nuls, et relecture de la matrice produite rendant l'URL de
départ. Le contrôle a fait son travail dès le premier essai, en trouvant deux
vrais défauts — un polynôme générateur construit à l'envers, et un bit de format
écrasé par le module toujours noir.

**Contrôles.** `verifier.mjs` : 18 problèmes avant, 18 après. 15 assertions
passées sur `o1` (curseur exact sur toute la plage, aucun artefact de flottant),
22 sur `o2` (compteur exact sur onze nombres, mauvaise règle refusée, résultat
faux d'un chiffre refusé), 0 erreur JS sans base configurée. 144 textes de SVG
mesurés contre leur `viewBox` : aucun débordement. Aucun défilement horizontal à
768 ni à 390 px. Les deux fiches sortent en **deux pages A4 exactement**.

**Corrections de fond.** Trois erreurs de calcul relevées, dont deux dans des
documents partagés avec des collègues — à leur signaler. Détail dans
`DECISIONS.md`.

**Reste ouvert.** Les lots 2 (`o3`, sécurité en salle de TP) et 3 (`o4`,
relation algébrique) sont **bloqués faute de leurs PDF sources**, absents du
dépôt — et deux d'entre eux ne contiennent que des images. Quatre points de fond
attendent l'arbitrage de Loïc (O-2, O-4, O-5, plus les trois corrections).

---

## 26/08/2026 — Le hub de seconde : une phrase, une image, seize cartes qui se ressemblent

Passe de forme sur `pages/2nde-physique-chimie.html`, sur demande.

**Les seize cartes parlaient trois langues.** Les deux outils transversaux
annonçaient leur contenu en deux phrases ; les chapitres des thèmes 1 et 2 en une
ligne d'énumération de notions ; ceux du thème 3 en une phrase suivie d'une liste
« Notions abordées » de quatre puces — un sommaire qui redisait celui du cours,
sur la page censée donner envie de l'ouvrir. Tout est ramené à **une seule phrase
d'accroche**, écrite pour l'élève qui hésite à cliquer, et les listes disparaissent.

**Neuf cartes portent une vignette tirée du cours** : huile et eau, coulée de
fer, modèle de Bohr, lingots d'or, chronophotographie du skieur, réaction du
support, diapason, prisme, crayon brisé. Aucune image nouvelle — chacune est déjà
dans son chapitre, avec son `alt`, repris tel quel.

**Sept cartes restent sans vignette, et c'est un état, pas un choix définitif** :
T1-C5, T1-C6, T1-C7, T2-C3 et T3-C2 sont des ébauches sans le moindre visuel, et
les deux outils n'ont que des SVG inline, non réutilisables en fichier. L'image
viendra avec leur V1 intégrale. En attendant, ces cartes gardent le texte pleine
largeur : rien de vide, rien d'inventé.

**Le CSS partagé est scopé par classe.** `style.css` sert six pages, dont trois
hubs qui utilisent aussi `.chapitre-corps`. La variante vit donc sous
`.chapitre-corps.avec-vignette`, et une media query — la **première du fichier**,
à 760 px — fait repasser la vignette au-dessus du texte sur iPad en portrait.
Les autres hubs ne bougent pas d'un pixel.

Vérifié au rendu dans un navigateur sans interface, à 1200 px et à 700 px, et
`node verifier.mjs` sort toujours **18 problèmes** — le repère, donc aucune
régression. **Les seize phrases sont des propositions, rien n'est validé.**

---

## 26/08/2026 — Les PDF sources arrivent, `o1` et `o2` repris sur leur fond

Loïc a transmis les **neuf fiches sources** du chantier des outils. Elles
confirment une partie du cadrage, en corrigent une autre, et débloquent les
lots 2 et 3.

**Cinq ajouts de fond** dans `o1` et `o2`, tous du collègue et tous absents de la
V1 : les **quatre règles de calcul sur les puissances de dix** — ce sont elles
qui *prouvent* ce que la V1 affirmait, en particulier pourquoi le dénominateur
change de signe et pourquoi les volumes se multiplient par 3 ; la **conversion
vers un préfixe** et sa règle du changement de signe ; les **trois équivalences
de volume** et le tableau qui aligne les mètres cubes sur les litres ;
**`003,20`**, le seul nombre qui porte les deux familles de zéros ; et
l'**incertitude relative `ΔA/A`**, avec la seconde façon d'estimer `ΔA`.

Arbitrage de place assumé sur la fiche de `o1` : la table des dix-huit repères
d'échelle, ajoutée la veille, est réduite à ses trois bornes. Elle est ○ support
à l'écran, où la frise reste entière ; les quatre règles sont ★★. Le fond passe
avant le support.

**Le point de fond rouvert.** La fiche du collègue écrit « les zéros situés à
droite sont significatifs » et « 50 n'a que deux chiffres significatifs » — ce
qui donne `100` → **3**, quand le brief demandait **1**. La contradiction n'est
donc pas interne à l'outil : elle est **entre la source et le brief**. La V1 tient
une troisième voie (l'ambiguïté nommée, qui justifie l'écriture scientifique),
mais elle nuance une affirmation du collègue. Trois issues posées dans
`DECISIONS.md`, en attente.

**Trois erreurs de calcul de plus** dans les corrigés, portant le total à cinq.
La plus vicieuse : `5933 dag·cm⁻³` aboutit au **bon** résultat par **deux erreurs
qui se compensent** — toutes les lignes intermédiaires sont décalées d'un facteur
dix (le corrigé prend `1 dag = 10² g`), puis une seconde faute ramène au bon
exposant. Un élève qui suit ligne à ligne est perdu. Toutes recalculées en
fractions exactes, jamais au flottant.

**Deux écarts entre le brief et les sources**, à arbitrer avant le lot 2 : le
**tri de la verrerie** (le brief dit « précise / usage courant », la fiche dit
« pour contenir / pour mesurer un volume ») et le **nombre de niveaux de `o4`**
(le brief en annonce trois, la fiche en compte cinq). Leçon consignée dans les
consignes : **le brief résume la source, il ne la remplace pas.**

**Contrôles.** `verifier.mjs` : 18 avant, 18 après. 16 assertions sur `o1`, **25**
sur `o2` (trois de plus pour `003,20`), 0 erreur JS. 144 textes de SVG mesurés
contre leur `viewBox`, aucun débordement. Aucun défilement horizontal à 768 ni à
390 px. Les deux fiches sortent toujours en **deux pages A4 exactement**, avec
8 à 26 mm de marge selon la page — quatre passes de rééquilibrage entre recto et
verso ont été nécessaires pour loger le fond ajouté.

---

## 26/08/2026 — DS et TP : le premier lot descend dans les chapitres

Vingt-et-un sujets sont arrivés — six DS, quinze TP — chacun dans son dossier de
travail, avec ses corrections, ses `.docx`, ses tableurs et ses programmes. Le
lot 1 les dépose, relie le **hub entier** et les **sept chapitres du thème 1**.

**Le premier geste n'a pas été de copier un fichier, mais d'en interdire cent
trente.** `_a-deposer/` n'était pas ignoré par git : un `git add -A` aurait mis
en ligne les corrections de tous les TP, deux fichiers `.py` nommés
`TP11 2de6 GP1 27-01-2023` et un classeur `TP10 2de6 GP1 03-02-2023.xlsx` — soit
un groupe d'élèves, une date de séance, et des relevés. Le dossier est désormais
dans `.gitignore` ; le tri se fait à la main, fichier par fichier, et **seul le
PDF du sujet nu** rejoint `assets/pdf/pc/`.

**Ce qui est publié.** 6 DS (`ds1-t1c1.pdf` … `ds6-t3c3-t3c4-t3c5.pdf`) et 15 TP
(`tp01-…` … `tp15-…`), soit 30 Mo. Aucune correction, aucun `.docx`, aucune
grille de notation, aucun fichier portant un nom de classe. Le chip SharePoint
du DS corrigé de `c1` n'a pas été touché.

**Le mécanisme, en deux points et un seul composant.** Sur le hub, la puce
`Exercices 🚧` disparaît des quatorze cartes — elle n'annonçait rien qui existe —
et cède la place à une puce par sujet. Dans la page du chapitre, le sujet
réapparaît en `.video-chip`, à côté des vidéos : le TP **après la section dont il
est l'application**, le DS dans « Pour le DS, je sais ». Rien n'a été ajouté à
`chapitre-commun.css` : le composant existait déjà dans les quatorze chapitres.

**Un sujet à cheval est lié partout où il porte.** DS2 apparaît dans `c2` et dans
`c3`, DS5 dans `c5` (et dans T2-C1 au hub), TP1 dans `c1` et dans `c2` — vers le
même fichier, avec un libellé qui le dit : « DS2 — Thème 1, ch. 2 et 3 (sujet) ».

**Deux écarts du brief, tranchés en le disant.** Le lot 1 excluait `c7`, alors
que le tableau des TP lui donne le TP15 : il est traité ici, il est du thème 1.
Et les slugs suivent la règle du §5 (`ds1-t1c1.pdf`), pas les exemples du §4.1
qui la contredisaient.

**Trois cartes du thème 3 annonçaient un TP nommé** — « célérité du son »,
« capteur de température », « spectroscope ». Les deux premières correspondent au
TP6 et, de plus loin, au TP14 ; « spectroscope » au TP12. Ces puces d'attente ont
cédé la place aux vrais sujets. Celle de T3-C2 est la moins évidente : le TP
« capteur de température » annoncé n'existe pas dans le lot, c'est le TP14
« Protection d'une LED » qui prend sa place — à confirmer.

**Contrôles.** `verifier.mjs` : 18 problèmes avant, 18 après. Les 20 liens PDF
posés pointent tous vers un fichier présent (le vingt-et-unième, `tp13`, attend
sa carte au lot 2). Rendu mesuré à 390 px dans une iframe, chapitre déverrouillé :
`scrollWidth = 390`, aucun débordement, aucun chip hors cadre, les trois chips de
`c1` s'empilent proprement sous la checklist.

---

## 26/08/2026 — Lot 2 : les thèmes 2 et 3, et un chapitre qui n'a pas de page

Le lot 2 termine le dépôt : dix chips de plus dans les six chapitres des thèmes 2
et 3, et la carte du chapitre qui se traite en TP.

**Où sont allés les dix chips.** TP7 dans « Vitesse d'un système » et DS5 dans la
checklist de T2-C1 ; TP8 dans « Exemples de forces » (T2-C2) ; TP5 dans
« Caractéristiques d'un signal périodique », TP6 dans « Émission et propagation
d'un signal sonore » et DS4 dans la checklist de T3-C1 ; TP14 dans « Loi d'Ohm »
(T3-C2) ; TP12 et DS6 dans T3-C3 ; DS6 dans T3-C4. Vingt-quatre chips en tout
avec le lot 1, tous vérifiés section par section.

**Le TP12 a été posé dans « Les spectres lumineux », pas dans « Dispersion ».**
Il traverse les deux sections du chapitre ; le placer à la fin, c'est faire que
l'élève le rencontre une fois qu'il a de quoi le faire. Et il porte aussi la
**réfraction**, qui est T3-C4 : au titre de D4, une seconde puce s'y justifierait
— posée en attente, le brief ne le rattachait qu'à T3-C3.

**La carte « Formation d'une image ».** Créée à la fin du thème 3, en `CH. 5`.
Elle n'a **pas** de puce « Cours en ligne », pas de `🚧`, aucune tournure
d'attente : sa liste commence par le TP13, qui **est** le cours, et se poursuit
par le DS6. La phrase de résumé le dit sans s'excuser — c'est une V1, à valider.
Le DS6 garde ses chips internes dans `c3` et `c4`, qui ont chacun leur page ; la
nouvelle carte n'en a aucun, faute de page où le poser.

**Trois pièges de structure, dans les pages.** Le script qui pose les chips a
d'abord visé, dans T1-C2, un `div.videos` **logé dans un encart d'exemple** — le
chip s'est retrouvé sous le cuivre et le nitrate d'argent. Corrigé en mesurant la
**profondeur d'imbrication** plutôt que l'indentation, qui ment : dans T3-C1 le
bloc est collé à un `</figure><p>` en plein milieu de ligne. Puis, dans T3-C3, le
bloc de chips **contient** un encart « à faire » — le chip se pose donc après le
dernier `</a>`, jamais à la fin du bloc. Cet encart dit « Lien du DS — à poser
chaque année » : il est désormais juste sous le DS6, donc redondant. Question
posée, rien supprimé.

**Contrôles.** `verifier.mjs` : 18 problèmes, inchangés. Les **21 PDF sont tous
liés**, aucun orphelin, aucun lien mort. La carte CH. 5 ne contient ni `a-venir`,
ni `🚧`, ni « Cours en ligne ». Rendu mesuré à 390 px : `scrollWidth = 390` sur le
hub et sur T3-C3, aucun chip hors cadre, les puces de la nouvelle carte s'empilent
comme les autres.

---

## 26/08/2026 — Audit 2 de T3-C1 : quatre arbitrages demandés, un seul l'était vraiment

L'audit remontait **quatre points à trancher**. Trois se sont réglés à la mesure,
et le quatrième portait sur autre chose que ce qu'on croyait.

**Deux décisions étaient déjà caduques.** L'audit s'appuyait sur `079753e` ; le
commit `9d0b352` avait posé entre-temps les liens **TP5**, **TP6** et **DS4**. Le
« il y a le lien pour le TP, c'est cool » de Loïc n'était donc pas une confusion :
il auditait bien une version plus récente que celle relue. Seul restait l'encart
🔧 devenu faux, retiré — T3-C1 n'a plus aucun `.a-faire`.

**La coupure « célérité » se reproduit, mais pas où on la cherchait.** Mesurée à
793 / 1024 / 1280 / 1440 px : le mot est entier aux deux premières largeurs,
**césuré aux deux dernières**. `hyphens:auto` coupait `célé-` / `rité` **à
l'intérieur du fond teal**. Un mot surligné ne peut pas se couper : `.terme` passe
en `hyphens:none`, le texte courant garde sa césure. Correctif de socle, donc
valable pour les 14 chapitres.

**« Le souci de la formule, toujours au même niveau que le milieu de C » — ce
n'était ni le placement du bloc, ni le crayon.** Les 15 crayons de la page sont au
pixel près à la même position, et les deux blocs formule ont la même géométrie
(480 px, décalés de 205). Loïc a tranché : c'est **l'indice `son` qui flottait à
mi-hauteur du `c`**. Cause : `.eq` est un conteneur flex, le `<sub>` en devenait un
flex item et perdait son `vertical-align` — `align-items:center` faisait le reste.
Audit du dépôt : **7 blocs formule cassés dans 5 chapitres** (T1-C3, T1-C5, T2-C2,
T3-C1, T3-C4). Les 19 blocs du dépôt et le gabarit portent désormais un
`.eq-corps` qui rassemble le contenu en un seul flex item.

**Le même piège, deux fois.** En passant la méthode en deux colonnes, les quatre
étapes se sont disloquées : « Repérer un / motif qui se répète. / élémentaire ».
`.methode li` était lui aussi un conteneur grid, et chaque fragment inline y
devenait une cellule. Le défaut **préexistait** — le `<li>` de `HEAD` est
identique — il ne se voyait pas en pleine largeur. Le numéro romain passe en
position absolue : plus de grid, rendu inchangé, vérifié sur T1-C5 qui n'a pas
bougé.

**La vidéo de la cloche à vide n'était pas coupable.** Six candidates de
remplacement testées, toutes « refusées » — 6/6, trop beau. Le test se faisait
depuis `about:blank` : sans origine valide, YouTube renvoie l'erreur 153 pour
**toutes** les vidéos. Retesté derrière un vrai serveur HTTP, la vidéo d'Unisciel
s'intègre parfaitement. Le vrai coupable était dans notre propre JS :
`referrerpolicy="no-referrer"` sur l'iframe créée au clic. Remplacé par
`strict-origin-when-cross-origin` — YouTube apprend le **domaine**, jamais l'URL
de la page ni le chapitre lu. Façade re-mesurée : **0 requête tierce avant le
clic**, 32 après, lecteur fonctionnel. **Aucune vidéo n'a été changée.**

**La figure d'étapes.** Quatre vignettes, signal **composé** (fondamentale +
harmoniques 2 et 3 déphasées) : motif reconnaissable mais irrégulier, T = 4,0 ms
sur 4 motifs de 2,0 à 18,0 ms — voisin de l'exercice 1 (T ≈ 2,6 ms, 3 motifs, axe
en secondes) sans en être la copie. Le tracé, d'abord répété quatre fois, pesait
29 Ko à lui seul : défini une fois dans `<defs>`, réutilisé par `<use>`, **12 Ko**.

**Calibrages, mesurés.** Images 6-7 : 150 → 200 px de haut. Images 16-17 :
110 → 375 px, dans une classe **distincte** de `.serie` pour ne pas toucher aux
cinq vignettes de l'exercice 4, validées. La hauteur est **plafonnée par le
casque** (source 303 × 377) : à 375 px il est affiché 302 px de large, un pixel
sous le crénelage. Les deux occupent 629 px sur les 890 de la colonne — on ne peut
pas aller plus loin sans abîmer l'image.

**Chasse au gras** : 64 → 50 dans l'article, 12 retraits d'insistance orale, dont
les trois de l'énoncé de l'exercice 1. L'exercice 2 redonne enfin le résultat de
l'exercice 1 en toutes lettres.

**Contrôles.** `verifier.mjs` : **18 problèmes**, inchangés. `chapitre-commun.css`
passe en `?v=5` sur les **17 fichiers** qui le chargent. Aucune balise non fermée.
Les indices : **0 bloc formule mal placé** contre 7 avant.

**Signalé, non traité** (hors périmètre) : trois autres chapitres — T2-C1, T3-C3,
T3-C4 — portent encore l'encart 🔧 « Lien du DS » alors que **leur lien DS est
déjà posé**. Même redondance que celle retirée ici. T2-C2, T2-C3 et T3-C2 n'ont
pas de lien DS : chez eux l'encart garde son sens.

---

## 26/08/2026 (suite) — T3-C1 : les lots C, D et E, et la fiche qui manque

Consigne : « fais tout ». Les lots restants de l'audit 2 y sont passés, plus les
quatre points laissés ouverts le matin.

**Les points ouverts, d'abord.** La méthode déséquilibrait ses colonnes : 214 px
de texte contre 603 px de figure, soit **389 px de blanc**. Empiler quatre
vignettes dans une demi-largeur ne pouvait pas tomber juste. Passées en **2 × 2**,
elles font 205 px : l'écart tombe à **33 px**. Au passage, la mesure a montré
qu'il fallait 353 px de colonne pour que les étapes tiennent sur une ligne sèche
— la colonne en offre 367, d'où la largeur de figure retenue (356 px, pas 420 qui
avait inversé le déséquilibre). Les sous-titres des vignettes, qui redisaient mot
pour mot les étapes de gauche, sont tombés : à 170 px de vignette ils étaient
illisibles de toute façon.

**Trois autres chapitres portaient l'encart 🔧 devenu faux** — T2-C1, T3-C3,
T3-C4 — alors que leur lien de DS était posé. Retirés. T3-C3 et T3-C4 n'ont
plus aucun `.a-faire` : leur CSS mort est parti avec, comme celui de T3-C1.
T2-C2, T2-C3 et T3-C2 n'ont pas de lien DS ; chez eux l'encart dit encore vrai,
on n'y touche pas.

**Lot C — les six figures.** Le code couleur se fixe sur la figure 4 et tout s'y
aligne : `U_max` en rouge, `U_min` en violet, l'amplitude en vert parce qu'elle
se déduit des deux, le repérage en or, la courbe en encre. L'élève retrouve en
partie 4 les couleurs de la partie 1.

Un défaut de fond a failli passer : la normalisation du signal composé se faisait
sur `max(|g|)`. Les creux d'un son composé étant plus profonds que les crêtes, la
ligne `U_max` **n'était jamais atteinte par la courbe** — un maximum qui ne
maximise rien. Normalisation refaite en **étendue** : la courbe touche exactement
+1 et −1, et l'axe passe au milieu, ce qui rend vraies *en même temps* les deux
lectures de la figure 14 (amplitude = de l'axe au sommet ; écart des extrema = le
double). Contrôle imprimé à chaque génération.

Même vigilance sur la figure 3 : elle annonçait « f = 1 Hz » en traçant **un
seul motif sur trois secondes**. Le nombre de motifs vaut f × durée ; corrigé, et
la durée ramenée à 2 s pour que le contraste 1 Hz / 3 Hz reste lisible.

Bilan de poids : **233 Ko de JPEG et PNG remplacés par 65 Ko de SVG**. La page
s'allège de 168 Ko *et* devient nette à toute échelle. Les SVG sont **inline**,
pas appelés comme fichiers : un SVG chargé en image vit dans un contexte isolé où
les `@font-face` du site n'existent pas — toutes les étiquettes seraient tombées
en police système.

**Lot D — le texte respire.** La partie 1 s'ouvrait en redisant mot pour mot la
définition qui suivait ; elle commence maintenant par une mise en route. Huit
transitions posées, dans une classe `.passage` créée pour elles — filet fin et
italique, distincte de `.aparte` qui est une note en mono. Quatre encarts
`.histoire` (le composant existait dans le socle et ne servait pas) : le hertz,
la cloche à vide de Boyle et Hooke, le la 440, le décibel des Bell Labs. Aucun
portrait : rien de disponible sous une licence sûre, et la règle RGPD interdit
d'aller en chercher sur un CDN. Les dates que les sources se disputent — année
d'adoption du hertz, du la 440 — sont formulées de façon à rester vraies quelle
que soit la version. **Tout ce lot est une proposition, le fond appartient à Loïc.**

**Lot E — la fiche vierge.** `.hors-verrou` est la **seule exception** du dépôt à
`body.verrouille`, qui masquait tout l'article sauf le cadenas. C'est une entorse
assumée : le verrou protège le cours, pas le support que l'élève remplira en
classe, et un élève absent doit pouvoir imprimer sa fiche. Effet de bord traité :
l'article verrouillé porte désormais **deux** éléments visibles, il est passé en
`flex-direction:column` — sans quoi le bouton se rangeait à côté du cadenas.

Le bouton n'est posé que sur les **2 chapitres dont la fiche existe** (`t1c2`,
`t1c4`). Poser un lien vers une fiche absente serait un lien cassé et une
promesse non tenue. Le gabarit le porte en commentaire, la règle est dans
`CONSIGNES-chapitre-PC.md` §6.

**Un piège payé.** `verifier.mjs` est passé de 18 à 19 problèmes après le lot C.
Le coupable : un commentaire CSS où j'avais écrit une balise image d'exemple —
le vérificateur lit les attributs de source **jusque dans les commentaires** et
la comptait en lien cassé. Reformulé, noté dans la page pour le prochain.

**Contrôles.** `verifier.mjs` : **18**, retrouvés. Les **16 pages PC testées à
390 px** : aucun débordement horizontal, aucune erreur JS. Façade vidéo
re-mesurée : **0 requête tierce avant le clic**, lecteur fonctionnel. Le bouton
de fiche vérifié visible **page verrouillée** et bien placé sous le cadenas.
`chapitre-commun.css` passe en `?v=6` sur ses 17 fichiers.

**Ce qui reste, et pourquoi.** La **fiche de T3-C1 n'existe pas**, donc le
chapitre ne porte pas le bouton du lot E. Elle relève du jalon 6, et son brief
(`BRIEF-CLAUDE-CODE-T3C1-fiche.md` §0) la verrouille explicitement derrière le
jalon 5 — « cours VALIDÉ », un acte de Loïc, jamais présumé. Douze chapitres sur
quatorze sont dans ce cas.

---

## 26/08/2026 (fin) — les graphes d'exercice, reconstruits plutôt que recopiés

« Et tu ne peux pas faire ces figures ? » Si. Les cinq graphes des exercices —
énoncés 1 et 3, leurs deux corrections annotées, le rappel de l'exercice 2 —
sont passés en SVG à leur tour.

**Le problème n'était pas de dessiner, mais de rester fidèle.** Ces graphes ne
sont pas décoratifs : l'énoncé de l'exercice 1 demande de mesurer une période
**sur celui-là**, et le corrigé, déjà en ligne, annonce des valeurs précises. Une
figure approximative aurait rendu son propre corrigé faux.

Pour l'exercice 1, plutôt que de dessiner à vue un « signal composé qui y
ressemble », j'ai relevé neuf points sur la courbe d'origine et **ajusté une série
de Fourier à trois harmoniques par moindres carrés** : écart maximal **0,019 V**,
minimum −1,326 V et maximum +1,634 V contre −1,32 et +1,60 relevés. Le tracé est
reconstruit — il nous appartient — mais il a la même allure, la même période et
les mêmes extrema. C'est ce que l'exercice demande de lire.

**Une lecture à trancher sur l'exercice 3.** Le corrigé dit « 4 motifs sur
4T = 93 ms », tandis que le texte alternatif de l'ancienne image parlait de
« 3 à 93 ms » — soit 90 ms, ce qui aurait donné 44 Hz et non 43. La figure
d'origine repérait les points de mi-descente ; de **maximum à maximum**, 6 → 99 ms,
l'intervalle vaut exactement 93 ms. C'est cette lecture qui est dessinée : elle
tombe juste au chiffre près sur le corrigé, et pointer un sommet est plus sûr pour
un élève que pointer un passage à mi-hauteur.

Chaque génération imprime ses contrôles : pics de l'exercice 1 à 0,30 / 2,93 /
5,57 / 8,20 ms ; maxima de l'exercice 3 à 6 / 29,25 / 52,5 / 75,75 / 99 ms ;
`f` = 43,0 Hz ; `u(6 ms)` = 4,00 V et `u(17,62 ms)` = 0,00 V. **Aucun corrigé n'a
eu à bouger.**

**Bilan du passage au vectoriel, maintenant complet** : **12 images remplacées,
614 Ko** de JPEG et de PNG contre 76 Ko de HTML en plus — **538 Ko économisés au
chargement**, et plus rien ne crénelle. Il reste 8 fichiers de source, ceux que
l'audit avait explicitement laissés : sismogramme, ECG, guitare, vague, schéma
des compressions, frise des fréquences, champ auditif, acuité selon l'âge.

Contrôles : `verifier.mjs` **18**, aucun débordement à 390 ni à 1280 px, et le
rappel de l'exercice 2 tient dans sa colonne de 200 px sans déborder — il reste
petit, comme validé.

**Conséquence pour la fiche** : les trois schémas que le brief déclarait
indispensables (graphe de l'exercice 1, graphe de l'exercice 3, extrema et
amplitude) existent désormais en SVG. La condition n° 2 du verrou de démarrage
est levée. Restent la condition n° 1 — les lots de l'audit, faits — et la n° 3,
la seule qui compte encore : **« cours validé », un acte de Loïc.**

---

## 27/08/2026 — Audit 3 de T3-C1, lot 0 : les images, produites ici faute d'archive

Le brief de l'audit 3 annonçait une archive `images-t3c1-audit-3.zip` à extraire à
la racine, neuf fichiers prêts à poser, « aucune conversion, aucun recadrage ».
**Cette archive n'existe nulle part** : ni à la racine, ni dans `Downloads`, et le
dépôt était propre au démarrage. Le dossier `assets/img/pc/2nde-pc-t3-c1/` portait
encore ses fichiers d'avant — `t3c1-guitare-source.jpg`, `t3c1-saxophone.jpg`, un
diapason de 4,5 ko et un casque de 9,7 ko.

En revanche, **toutes les sources brutes étaient là**, téléchargées le matin même.
Le traitement a donc été refait dans la session, à partir d'elles.

**Provenance des fichiers** (à consigner ici, comme demandé) :

| Fichier produit | Source | Licence |
|---|---|---|
| `t3c1-portrait-hertz.jpg` | `Heinrich_Rudolf_Hertz_2.jpg` | Wikimedia Commons — domaine public |
| `t3c1-portrait-bell.jpg` | `Alexander_Graham_Bell.jpg` | Wikimedia Commons — domaine public |
| `t3c1-diapason.jpg` | `pexels-thirdman-6194035.jpg` | Pexels — licence libre, sans attribution |
| `t3c1-casque-anti-bruit.jpg` | `pexels-vintage-stories-5697799.jpg` | Pexels — licence libre, sans attribution |
| `t3c1-guitare.svg` | `openclipart-vectors-guitar-149427.svg` | Pixabay / OpenClipart — licence libre |
| `t3c1-saxophone.png` | `alles-saxophone-1473373.ai` | Pixabay — licence libre |
| `t3c1-icone-orage.svg` | `openicons-thunderstorm-98541.svg` | Pixabay / OpenIcons — licence libre |
| `t3c1-icone-baleine.svg` | `openclipart-vectors-animal-159277.svg` | Pixabay / OpenClipart — licence libre |
| figure du La | dessin de session + croche fournie par Loïc | maison |

**Ce qui a été fait.** Hertz arrivait déjà au format de l'encart (340×364) : simple
recompression. Bell est passé de 480×624 à 400×520. Le diapason était un portrait
4311×6466 : recadré en paysage 3:2 serré sur l'instrument, **boule du manche
comprise** — un premier cadrage la coupait, il a fallu réélargir. Le casque, 6000×4000,
est resserré sur le buste.

Le saxophone était un PDF Illustrator à dégradés. Converti en vectoriel il aurait
pesé plus d'un mégaoctet ; il a donc été rendu à 4× par PyMuPDF, détouré sur son
fond blanc, recadré sur le contenu opaque, ramené à 600×1000 et quantifié à
128 couleurs — **49 ko, fond transparent**. La conversion vectorielle n'est pas à
retenter.

La guitare porte désormais son annotation : `viewBox` étendu de `0 0 991.59 1057.4`
à `0 0 991.59 1210` pour loger, sous l'instrument, un repère « caisse de résonance »
relié au corps par un trait en `--h-gamma`. Le groupe est isolé sous
`id="annot-caisse"` : il se déplace ou se retire d'un bloc. Le texte est en
`'IBM Plex Mono'` avec repli monospace — **chargé par `<img>`, un SVG n'accède pas
aux polices auto-hébergées de la page** : le repli système s'appliquera. Inliner le
SVG dans la page reste possible si la police du site est indispensable, au prix de
38 ko de HTML.

**La clé de sol, tracée à la plume.** Le dessin est construit
paramétriquement : une goutte inclinée qui se resserre, puis une volute enroulée
sur la ligne de sol. Les proportions ont été calées sur un glyphe de référence,
mesuré puis écarté — **baseline sur la ligne du bas de la portée, interligne
= 267 unités em**, ce qui donne une clé de 6,5 interlignes de haut. Le contour
d'une police n'est pas redistribuable ; seules ses proportions ont servi.

Le premier jet, un trait d'épaisseur constante, ne ressemblait pas à une clé de
sol. Ce qui manquait était la **plume** : le contour est désormais l'enveloppe
d'un segment de plume à angle fixe (25°) translaté le long de la courbe — épais
quand la courbe est perpendiculaire à la plume, fin quand elle lui est parallèle.
La largeur suit en plus un profil le long du parcours : la plume attaque en
s'élargissant sur la queue, s'affine au sommet de la boucle, et **décroît de deux
tiers dans la volute**, sans quoi les spires se rejoignent et le centre se bouche.

Le calage musical est juste : le **La₃ tombe bien dans le deuxième interligne en
partant du bas**, la position exacte en clé de sol. Loïc a retenu cette variante
— portée complète — parmi trois. Les deux autres, employant la croche qu'il a
fournie, restent dans `_apercus-audit3-t3c1/` : la figure entière sans portée, et
la portée avec la croche en repère.

Après `svgo` à une décimale : **4,8 ko**, lisible à 380 px de large.

**Ce qui est déposé.** Sept fichiers neufs dans `assets/img/pc/2nde-pc-t3-c1/`. Les
deux substitutions qui écrasent un fichier référencé — diapason et casque —
attendent le lot C, où la règle CSS de hauteur fixe qui coupait le diapason sera
traitée dans le même geste : écraser sans elle laisserait la page dans un état
intermédiaire incohérent.

Contrôle : `verifier.mjs` **18**.

---

## 27/08/2026 (suite) — Audit 3 de T3-C1 : les lots A à F, d'un trait

Loïc a levé l'arrêt entre chaque lot — « tu peux tout lancer » — après avoir
tranché les huit arbitrages en attente. Le lot G, la fiche élève, n'a **pas**
démarré : « tout lancer » n'est pas le jalon 5, qui est un acte explicite.

**Ce qui était faux, et qui ne l'est plus.** L'amplitude valait, dans la page,
l'écart entier entre les extrema. Elle en vaut la moitié. Les quatre passages
concernés ont bougé ensemble et un encart formule pose désormais
`A = (U_max − U_min)/2`. À la vérification, l'énoncé de l'exercice 3 ne demandait
pas l'amplitude : il n'y avait donc pas de « 4 V » erroné à reprendre, mais un
exercice à compléter — c'est le seul du chapitre où l'amplitude se lit sur un
graphe. Sa correction dit maintenant le piège plutôt que le résultat.

La définition du niveau d'intensité sonore parlait du lien entre `L` et
l'amplitude ; c'est le lien entre `L` et l'intensité `I` qui est en jeu, et c'est
d'ailleurs de `I` que parle le paragraphe juste au-dessus.

**Le vrai sujet de l'audit était ailleurs : la partie 4.** 764 mots, 9 figures, la
moitié de la checklist du DS — et aucun exercice. Quatre exercices ont été écrits,
calqués sur ce que le DS4 demande réellement : l'écho de la falaise, l'audibilité
d'un clic de dauphin à 125 kHz, la comparaison de trois signaux sans le moindre
calcul, et la lecture de l'échelle en décibels. Le troisième s'appuie sur une
figure produite pour lui — trois signaux sur la même fenêtre de temps, sans
aucune graduation chiffrée, pour que la comparaison se fasse à l'œil et pas à la
règle.

**Deux points du brief ne correspondaient plus à la page.** Le diapason n'était
pas coupé : l'Image 13 est un SVG maison depuis l'audit 2 et la photo n'était pas
employée — d'où la décision de poser la photo ailleurs, en regard de la partition
du La (Image 14). Et dans la correction de l'exercice 1, `t_i` et `t_f` étaient
déjà sur des maximums, à 0,30 et 8,20 ms : le défaut réel était que les pointillés
s'arrêtaient au sommet du pic. Ils descendent maintenant jusqu'à l'axe des temps,
et chaque maximum porte un point cerclé.

**L'Image 3, refondue.** Elle portait deux panneaux séparés, chacun avec son
repère : la comparaison ne pouvait pas se faire. Un seul repère désormais, les
deux signaux superposés, l'axe des ordonnées passant enfin par le zéro de l'axe
des temps — il était tracé une graduation avant. Deux réglettes sous la courbe
montrent que trois motifs du signal à 3 Hz tiennent dans un motif du signal à
1 Hz. Et la figure est **pilotable** : un curseur fait varier la fréquence du
signal violet de 1 à 8 Hz, le tracé, l'étiquette et la réglette se redessinent
ensemble. Un bouton d'animation balaie la plage — il ne s'affiche pas si l'élève
a désactivé les animations.

**Ce qui a changé dans la feuille commune.** L'agrandissement d'une figure au clic
(F1) : voile sombre, fermeture au clic extérieur et à Échap, focus rendu à
l'élément d'origine, figure navigable au clavier. Une erreur à noter, trouvée à la
mesure et pas à la lecture : le cadre était en `max-width` et se dimensionnait au
contenu, pendant que le SVG se dimensionnait au cadre — la figure « agrandie »
faisait 300 px. Une largeur explicite règle la boucle.

**Le `?v=7` touche 17 fichiers, pas 14.** Le brief et `CLAUDE.md` parlent des
« 14 pages PC ». Le dépôt en compte trois de plus qui chargent
`chapitre-commun.css` : le gabarit de chapitre et les **deux pages
d'enseignement scientifique de Terminale**. Elles auraient servi l'ancienne
feuille depuis le cache des élèves. La consigne est à corriger.

**Contrôles.** Chromium sans interface aux trois largeurs 1440 / 768 / 380 px :
aucun débordement horizontal, aucun élément hors cadre, aucune erreur JavaScript.
Le verrou S0NORE ouvre toujours la page — empreinte SHA-256 recalculée et
comparée à celle qu'attend le script. Aucune requête vers un hôte externe au
chargement. Série des figures continue de 1 à 18, aucun renvoi orphelin après
l'insertion de l'Image 14. `verifier.mjs` → **18**.

**Ce qui reste à Loïc.** Tout le contenu neuf — quatre exercices, trois
corrections rédigées, l'accroche, la partie 2 étoffée, les définitions du
sismogramme et de l'électrocardiogramme — est une **proposition**. Et le doublon
`22 p.266` de la checklist DS attend son manuel.

---

## 28/08/2026 — Outils transversaux, lots A et B

**Le catalogue est renuméroté.** Les numéros `o3` à `o8` avaient été réservés en
juillet dans un ordre qui ne correspondait plus aux priorités. Aucun de ces
fichiers n'existait : la renumérotation était gratuite ce jour, elle ne l'aurait
plus jamais été. Les huit outils suivent désormais l'ordre où un élève de seconde
les rencontre. **« Convertir » sort du catalogue** — `o1` en avait absorbé tout le
fond le 26/08, un outil dédié aurait fait doublon avec son étape 1.4.

**Deux gabarits, enfin.** `_modeles/gabarit-outil-PC.html` et
`gabarit-fiche-outil-PC.html`, extraits de `o1` et vidés de toute physique.
Jusqu'ici `o1` servait de gabarit par copier-coller — la manière exacte de perdre
une convention en la recopiant de travers. Les commentaires qui portent les
décisions O-10, O-19, O-20 et O-21 sont conservés en entier : une règle dont on a
oublié le motif est une règle qu'on casse à la révision suivante.

**Sept arbitrages, tranchés par défaut.** Deux d'entre eux — le tri de la
verrerie et le nombre de niveaux — traînaient depuis le 26/08 et avaient arrêté
la production deux jours. Chacun porte désormais un défaut appliqué sans
attendre, marqué comme proposition. O-27 fait exception : Loïc l'a tranché.

**`o3` Sécurité au laboratoire est écrit.** 5 étapes, 5 exercices, 17 questions de
QCM, 30 champs à menu déroulant, deux paillasses aux erreurs cliquables, une
fiche A4 de 4 pages. Les **neuf pictogrammes CLP** et les **cinq équipements de
sécurité** sont dessinés en SVG maison — on ne télécharge jamais un pictogramme
de danger.

**Trois choses ont mordu, et méritent d'être retenues.**

1. **`<svg hidden>` ne masque pas un SVG inline.** Il garde sa taille par défaut
   de 300 × 150 px et pousse toute la page vers le bas. Le défaut est invisible à
   la lecture du code : il ne se voit qu'au rendu. `style="display:none"` règle
   la question, dans la page comme dans la fiche.
2. **`fill:none` ne capture pas le pointeur.** Les zones cliquables des paillasses
   n'étaient atteignables que sur les traits du dessin — l'élève devait viser un
   trait de 2 px. `fill:transparent` rend toute la zone sensible. Trouvé en
   rejouant les clics par script, pas à l'œil.
3. **Mesurer une fiche A4 avec `scrollHeight` ne prouve rien** : en `media print`,
   `.feuille` porte `overflow:hidden`, et un débordement est écrêté avant d'être
   mesuré. Il faut relâcher `height` et `overflow`, puis mesurer le bas du dernier
   enfant. Les quatre pages ont été vérifiées ainsi.

**Contrôles.** `node verifier.mjs` → **18**, avant comme après. Aucun asset
partagé modifié (`git status -- assets/` vide). Zéro erreur console. Les 30
champs rejoués rendent « Tout est juste » ; les 14 zones des deux paillasses
répondent et se remettent à zéro. Rendu sans débordement à 1100, 768 et **390 px
mesurés dans une iframe** — le headless imposant une largeur minimale d'environ
500 px, une capture demandée à 390 px rogne au lieu de replier. QR code généré
par l'encodeur maison et autovérifié deux fois : syndromes Reed-Solomon nuls sur
les quatre blocs, et relecture de la matrice rendant l'URL.

**Ce qui reste à Loïc.** Tout est proposition. En priorité : **l'étape 1.5 « Si ça
tourne mal »**, contenu neuf, seul contenu du dépôt qui engage la sécurité
d'élèves — à relire contre le règlement du laboratoire et les équipements réels
de la salle 0.26.

---

## 28/08/2026 (suite) — Deux chantiers transverses : l'ornement, et les fiches en PDF

Deux chantiers indépendants, tous deux hors d'un chapitre particulier.

### L'ornement des encarts « Histoire des sciences »

Une seule ligne à réécrire, et pourtant le motif comptait : le fleuron `U+2766`
n'existe dans **aucune** des vingt-deux polices auto-hébergées, il s'affichait donc
par repli sur une police système. Remplacé par un **filet court + un losange**
(variante B, tranchée par Loïc), tout en CSS.

Trois choses que le brief n'avait pas prévues, toutes trouvées à la mesure :

1. **Le caractère n'était pas `U+2767`, mais `U+2766`.** Le brief nommait le
   premier. Chercher le mauvais code point ne rend rien, et on conclut que
   l'ornement n'existe nulle part.
2. **`text-align:center` ne se remplace pas par `justify-content:center`.** Le
   brief demandait la substitution ; les deux propriétés ne font pas le même
   travail. Mesuré dans une iframe de 390px : le libellé passe sur deux lignes et,
   sans `text-align`, les deux lignes se collaient à gauche de leur item de flex.
3. **Le losange en quatre bordures est une fausse bonne idée.** Elle garantit
   l'impression (une bordure s'imprime toujours, un fond non), mais Chrome arrondit
   une bordure de 2,5px à 2px sur un écran non-Retina : mesuré, l'étiquette passait
   de 288,80px à 286,80px de large. Retour au fond plein, et
   `print-color-adjust:exact` — qui s'hérite jusqu'aux pseudo-éléments — pour
   l'impression.

**Contrôles.** Symétrie mesurée sur la capture, pas jugée à l'œil : 12,00px entre
filet et losange **de chaque côté** (mon impression visuelle disait le contraire —
c'était le cadrage du crop). Centre du losange à **0,22px** de la médiane des
capitales, calculée depuis `fontBoundingBoxAscent` et la cap-height du canvas.
Photocopie simulée : PDF → niveaux de gris → seuil dur à 200 ; filets et losanges
survivent intacts.

**Piège rencontré.** Mesurer les encarts sur une vraie page ne donne rien : le
verrou masque tout l'`<article>`. Il faut retirer `body.verrouille` dans le script
de mesure — ou, comme ici, extraire les dix encarts réels des sept fichiers dans
une page de contrôle jetable.

### Les fiches de 2nde PC passent en PDF

Six fiches exportées, contrôlées, et **dix-sept liens** basculés. Trois choses à
retenir :

1. **`--print-to-pdf` en ligne de commande sort du Letter**, 612×792 pt, même quand
   la fiche déclare `@page size:A4`. Seul `Page.printToPDF` par le protocole de
   débogage expose `preferCSSPageSize`. D'où `exporter-fiches.mjs`, qui pilote
   Chrome par CDP — WebSocket natif de Node, aucune dépendance.
2. **Le nombre de pages ne se fige pas fiche par fiche.** Première version du
   script : « deux pages par outil, deux par chapitre » — et `t1c2` sortait à 10,
   `t1c4` à 6. Ce ne sont pas des débordements : ces fiches portent 10 et 6
   `.feuille`. Le contrôle est devenu **une feuille dedans, une page dehors**, qui
   attrape le vrai débordement sans rien figer.
3. **Le script lit `fiches/` au lieu de tenir une liste.** Décidé après avoir vu
   `o3` puis `o4` apparaître **pendant** la session : la liste écrite au début
   était déjà fausse au milieu.

**Ce que l'export a révélé.** Les métadonnées d'un PDF Chrome se lisent en clair,
sans bibliothèque : `/MediaBox`, `/Count`, `/BaseFont`, `/FontFile`. En les
regardant, six fiches sur six embarquent des **polices système** — Consolas, Times,
Cambria Math, Segoe UI Symbol, Arial. Diagnostic affiné en interrogeant Chrome
lui-même (`CSS.getPlatformFontsForNode`, qui donne la police réelle et le nombre de
glyphes par nœud) : exposants et indices Unicode, symboles mathématiques et de
signalisation, et — le plus visible — les **55 glyphes en Arial** des libellés de la
silhouette de sécurité de `o3`, alors que leur règle CSS demande bien IBM Plex Sans.
C'est le même piège que le fleuron, mais sur du contenu : **rien n'a été touché**,
tout est reporté dans `ETAT-PROJET.md`.

**Contrôles.** `node verifier.mjs` → **18**, avant comme après. Aucun lien mort vers
`assets/pdf/pc/fiches/`. Les six PDF mesurent `209,9 × 297,0 mm` et portent leurs
polices incorporées. `chapitre-commun.css` en `?v=8` dans les **17** fichiers.

---

## 28/08/2026 — Les cinq outils restants (lots C à G)

`o4` verrerie · `o5` compte rendu de TP · `o6` présenter un calcul · `o7`
relation algébrique · `o8` graphique. **Les huit outils du catalogue sont
désormais écrits.** Chacun a sa page, sa fiche A4 et sa carte au hub.

**Tout le visuel est dessiné ici**, sans une seule image téléchargée : 21 pièces
de verrerie et de matériel (`o4`), une frise verticale des huit rubriques (`o5`),
deux copies annotées (`o6`), le triangle et les fractions empilées (`o7`), cinq
graphiques dont un tracé fautif à six défauts et une grille vierge (`o8`).

**La convention des fiches a changé pendant le chantier**, et les cinq outils s'y
sont alignés : le HTML reste la **source**, mais ce qui se distribue est son
**export PDF** (`node exporter-fiches.mjs`). Les liens des pages et du hub
pointent vers le PDF.

**Ce qui a mordu, et qui vaut d'être retenu.**

1. **Le nom d'une feuille versionnée dans un COMMENTAIRE suffit à casser le
   contrôle.** Un commentaire de `o5` disait « un outil ne charge pas
   chapitre-commun.css » — `verifier.mjs` a compté la page comme chargeant la
   feuille sans numéro de version. Exactement le piège déjà documenté pour
   `seances-snt`. La règle est maintenant **généralisée** dans les consignes et
   dans le gabarit : ne jamais écrire le nom d'une feuille ou d'un script
   versionné suivi de son extension, même en commentaire.
2. **`getBBox()` rend des coordonnées LOCALES.** Un `<text>` placé dans un
   `<g transform="translate(...)">` y paraît hors de son viewBox alors qu'il est
   en place — quatre faux positifs sur le triangle de `o7`. Le contrôle compare
   désormais les **rectangles écran**, qui intègrent les transforms.
3. **La pop-up de fin de séance du moteur intercepte les clics suivants.** Le
   harnais comptait comme « en échec » cinq blocs de `o5` qu'il n'avait jamais pu
   cliquer. Ce n'est pas un défaut de la page : c'est le comportement normal du
   moteur quand toutes les étapes passent au vert. Le harnais referme la modale
   entre deux vérifications.
4. **Une mesure qui nuance le brief, sur `o6`.** Le brief annonçait « 104 blocs »
   employant les cinq étiquettes du cours. Le dépôt porte **143 blocs `.etape`**,
   dont **90 seulement** emploient l'une des cinq ; deux chapitres n'en emploient
   **aucune** (`t2-c1` 0/10, `t3-c3` 0/7), et 13 corrections seulement commencent
   par « Extraction des informations ». Le modèle existe, il n'est pas
   systématique — et la page se garde donc de dire à l'élève qu'il le retrouvera
   « partout ».

**Contrôles.** `node verifier.mjs` → **18**, le repère retrouvé. Aucun asset
partagé modifié de mon fait. Pour les cinq outils : **zéro erreur console**, tous
les champs rejoués rendent « tout est juste » (39 · 40 · 43 · 28 · 30), aucun
texte SVG hors de son cadre, rendu sans débordement à 1200, 768 et **390 px
mesurés en iframe**, fiches en **2 pages exactement** vérifiées à la mesure puis
par l'export PDF, QR codes générés et autovérifiés (syndromes Reed-Solomon nuls +
relecture rendant l'URL).

**Ce qui reste à Loïc.** Tout est proposition. En priorité l'étape 1.5 de `o3`,
puis les six arbitrages en attente. Et le lot H — la série « Convertir » versée
dans `o1` — n'est **pas** fait : il attend la validation d'O-23.


---

## 29/08/2026 — Outil 3 : les dessins maison cèdent la place à de vraies images

Trois remplacements dans les deux seuls fichiers de l'outil 3
(`fiches/fiche-2nde-o3-securite-laboratoire.html` et
`pages/2nde-pc-o3-securite-laboratoire.html`), plus une règle transverse.

**Provenance des fichiers — c'est le point important.**

- `assets/img/pc/2nde-pc-o3/o3-tenue-laboratoire.png` — **illustration générée**,
  fournie par Loïc le 28/08/2026. Retouches : recadrage des marges, réduction à
  1280 px, quantification 128 couleurs (365 Ko, 1280 × 935, rapport 1,37 : 1).
  Marquée `data-origine` dans les deux fichiers, pour que l'origine voyage avec
  la balise et non dans un fichier de suivi qu'on n'ouvre pas.
- **Sprite CLP** — vectorisé le 29/08/2026 depuis les neuf images embarquées dans
  `_a-deposer/fiches-outils/fiche_Pictogrammes de sécurité.pdf` (173 × 173 px,
  couche alpha), par `potrace` en suréchantillonnage 4×, alphamax 1.3. Les
  pictogrammes SGH/CLP sont des **symboles réglementaires**, pas des créations
  graphiques.

**Lot A — les neuf pictogrammes.** Remplacement à zéro friction : mêmes `id`,
même `viewBox`, mêmes classes, donc **aucun des 47 `<use>`** (28 dans la page,
19 dans la fiche) n'a été touché. Deux différences de structure : `#clp-cadre`,
l'ancien losange partagé, disparaît — chaque pictogramme porte son cadre ; et
`.clp-fond` change de sens, c'est désormais le losange **entier**, posé en
premier, sans quoi le symbole noir baignerait dans la couleur du bloc sur la
page web (la source PDF a un intérieur transparent).

**Le contrôle qui a servi à quelque chose.** Plutôt que de juger à l'œil, les
neuf symboles ont été rendus en 173 × 173 dans Chrome puis **appariés** aux neuf
pictogrammes du PDF, comparaison sur l'encre visible. Résultat : **bijection
9/9**, écart 2 à 3 %, deuxième candidat toujours 2 à 4 fois plus loin. Chaque
symbole est donc mesurément le bon, et aucun n'est confondable avec un autre.

⚠️ **Deux pièges rencontrés, à retenir.** (1) Comparer les **silhouettes alpha**
ne prouve rien : les neuf sont des losanges, distance nulle pour tous. C'est
l'encre qu'il faut comparer. (2) `pymupdf.Pixmap(doc, xref)` **perd le SMask** :
le hors-losange sort en noir opaque, la bbox devient le carré entier et
l'appariement renvoie n'importe quoi. Il faut recomposer image + masque via
`doc.extract_image()`.

**Lot B — l'illustration de la tenue.** Le `<svg>` de silhouette cède la place à
un `<img>`, `loading="lazy"` **sur la page web uniquement** (une image différée
sur une fiche faite pour l'impression est un risque inutile). Les 8 règles
`.sil-*` sont retirées de chaque côté. La page 1 de la fiche **ne déborde pas** :
aucune des trois solutions de repli prévues n'a été nécessaire, `.urgence` reste
en pied de page 1.

**Lot C — les cinq équipements passent en cadres de réservation.** Les icônes
`eq-*` n'avaient pas de source de remplacement : elles deviennent cinq `.reserve`
portant le nom du fichier attendu, ce qu'il faut y voir, et la contrainte de
format. Les cinq `<symbol id="eq-…">` quittent les deux sprites, avec `.eq svg`,
`.eq-s`, `.eq-p` et `.eq.feu .eq-s`. La classe `feu` **reste posée** sur deux
cartes : son sort se tranchera quand les images arriveront, selon qu'elles
portent ou non leur fond de couleur.

**Deux écarts au brief, assumés et mesurés.** (1) La grille des cinq équipements
passe de **70 à 97 px** de haut (+ 9,5 mm) : un cadre lisible ne tient pas dans
les 11 mm de l'ancienne icône. La page 3 avait la place, elle ne déborde pas.
(2) Les cinq cadres sont alignés sur une **hauteur commune** (`.eq` en flex
colonne, `.reserve` en `flex:1`) : sans cela les descriptions, de longueurs
inégales, faisaient danser la ligne des cinq titres.

**Trois textes réécrits parce qu'ils étaient devenus faux** — la doc décrit
l'état courant : l'en-tête `<svg>` de la page (« on ne télécharge JAMAIS un
pictogramme de danger », et la contrainte de tracé du losange intérieur, qui
décrivait un code disparu), `CONSIGNES-outil-PC.md` §5 et
`CONSIGNES-sequence-SNT.md`. Corrigé aussi l'`aria-label` du pictogramme
environnement : le poisson y est **échoué** sur la rive, pas mort dans l'eau —
la source le confirme.

⚠️ **Fins de ligne.** La page était en **CRLF intégral**, la fiche en LF ; le bloc
injecté a rendu la page mixte. `.gitattributes` impose `eol=lf` : la page a été
normalisée en LF. Vérifié — `git diff --stat` **inchangé** après conversion, Git
normalisait déjà à l'index. Aucun diff parasite.

**Contrôles.** `node verifier.mjs` → **18**, le repère tenu. Zéro `<use
href="#clp-cadre">` résiduel, 9 symboles de chaque côté, les deux blocs
**identiques au `diff`**. Aucun asset partagé modifié : les CSS touchés sont
inline dans les deux fichiers, pas de `?v=N` à incrémenter. PDF de la fiche
régénéré depuis la source corrigée.

---

## 02/09/2026 — Les supports de classe entrent dans le dépôt, et la racine est rangée

Deux documents écrits hors dépôt le 29/08 arrivent : le standard des **fiches
élève** et celui des **diaporamas de projection**, tous deux établis en
produisant T3-C1. Ils sont déposés dans `_modeles/` sous le nommage des
consignes — `CONSIGNES-fiche-eleve-PC.md`, `CONSIGNES-diaporama-PC.md` — pour
qu'une seule convention réponde à « ce que j'ouvre avant de produire X ».

**L'audit demandé avec le dépôt a trouvé plus que du rangement.**

*Les chaînes de production n'existent pas.* Les deux documents décrivent, étape
par étape, un outillage introuvable sur le disque entier : `gabarit_fiche.py`,
`fiche_t3c1.py` et `mesurer_pages.py` d'un côté, `extract_svg.py`, `build.js` et
`anime.py` de l'autre. La règle R12 des fiches — « ne jamais résoudre un problème
de chapitre en modifiant le gabarit » — est inapplicable faute de gabarit. Les
deux consignes portent désormais l'avertissement en tête, et `_outils/fiches/`
comme `_outils/diaporamas/` attendent, vides.

*La fiche de T3-C1 non plus.* Elle a bien été produite — 8 pages, 18 cadres à
lignes, 5 QR relus — mais ni sa source HTML, ni son PDF, ni son lien ne sont
dans le dépôt ; seul un aperçu subsiste dans `_a-deposer/fiches-t3c1/`, hors
Git. Or `chapitres.md` verrouille ce jalon derrière la validation du cours par
Loïc. La contradiction est posée en arbitrage plutôt que tranchée.

*Sept prescriptions recalées.* L'étape 5 des fiches demandait une impression
manuelle depuis un navigateur alors que `exporter-fiches.mjs` fait la même chose
par Chrome **et** mesure chaque page : elle pointe maintenant sur l'outil. Le
contrôle des polices entre dans la checklist — six fiches sur six portent des
caractères (`⁻¹`, `⩽`, `π`, `Δ`) qu'aucune des six familles auto-hébergées ne
couvre, servis en Arial ; T3-C1 écrit `m·s⁻¹`. Comptés sur la page plutôt que
recopiés : **seize** marqueurs `a-noter` et non quatorze, dix-huit images
numérotées (R6 était juste). Le tableau des célérités du diaporama, encore
annoncé « saisi de mémoire », est celui du cours depuis que la fiche l'a recalé :
cinq milieux. Le code de déblocage cherché par les points ouverts est **S0NORE**,
il était dans `t3c1-releve.md`. Enfin `MANIFESTE.md` disait le SNT en « phase 2 »
quand `CLAUDE.md`, plus récent d'un jour, dit « phase 1 ».

**Le rangement.** Vingt notes de livraison datées vivaient à la racine —
quinze `A-LIRE-*`, quatre `BRIEF-*`, `LOT-CFA-a-lire`. C'est du récit posé là où
on cherche des consignes, et le cas limite le montre : `A-LIRE-DABORD.md`,
nom impératif, contenait une procédure d'extraction périmée depuis le 23/07 —
exactement le fichier qu'un assistant ouvre en premier. Toutes sont dans
`_suivi/archives/livraisons/`, avec un README qui dit ce qu'elles sont et ce qui
fait foi à la place. Les trois `_test-*.mjs` deviennent `_outils/tests/` (ils
lisent `DEPOT = '.'` : se lancent depuis la racine, vérifié). Les deux dossiers
d'aperçus d'audit — 3,7 Mo, 23 fichiers suivis — sortent du suivi Git.

**Contrôles.** `node verifier.mjs` → **18**, le repère tenu. `node
_outils/tests/normaliser.mjs` passe depuis sa nouvelle place. Aucune page, aucun
asset partagé, aucun `?v=N` touché : la passe est entièrement documentaire.

---

## 02/09/2026 (suite) — La chaîne des fiches arrive, et le PDF perdait son cartouche

Loïc dépose dans `_outils/` l'archive du 29/08 : le générateur des fiches élève
(`gabarit_fiche.py`, `fiche_t3c1.py`, `mesurer_pages.py`), la fiche de T3-C1
générée, le logo « LYCÉE », le bandeau de cartouche, et la note d'intégration.
L'archive portant son arborescence relative, chaque fichier est remonté à sa
place réelle ; la note rejoint `_suivi/archives/livraisons/`.

**Premier contrôle : la chaîne tourne-t-elle vraiment ?** Elle ne tournait pas.
Trois défauts, tous propres au poste de production — la chaîne a été écrite dans
un sandbox Linux.

*La console.* Python meurt sur `UnicodeEncodeError` en écrivant `✓` dans une
console cp1252 — et il meurt **avant** d'écrire la fiche, si bien que le message
d'erreur parle d'un caractère au lieu de parler du QR. `sys.stdout.reconfigure`
en tête du gabarit et de `mesurer_pages.py`.

*La relecture des QR.* Contrôle **bloquant** du standard, muet ici : `cairosvg`
exige la DLL cairo, absente des postes Windows. Plutôt que de renoncer, le repli
repeint le tracé SVG lui-même — une grille de `M x y h w v1 h-w z` — et le décode
avec pyzbar. Il relit donc bien le fichier livré, et non la matrice d'origine.
Les cinq QR passent `✓`.

*poppler.* `mesurer_pages.py` appelait `pdftoppm`, pas installé. Rendu par
PyMuPDF, sans binaire externe ni fichier temporaire.

La chaîne régénère alors la fiche **octet pour octet**. Le cours n'a pas bougé
depuis le 29/08, et la reproductibilité est acquise.

**Le vrai défaut n'était visible que dans le PDF.** À l'export, la page 1 accusait
60 mm de creux, la page 8 « DÉBORDE ». Capture d'écran du HTML dans Chrome : le
cartouche est parfait. Capture du PDF : **il n'y est pas** — ni bandeau, ni logo,
ni titre, ni introduction. Le PDF ne contenait aucune image.

Cause : `.feuille` est un conteneur flex, et passe en **hauteur fixe** à
l'impression. Ses enfants deviennent alors compressibles, et le cartouche, qui
porte `height:60mm; overflow:hidden`, était écrasé à zéro — silencieusement. Le
gabarit se contredisait lui-même : sa règle de tête dit « pas de flex ni de grid
là où un tableau suffit ». `.feuille > *:not(.corps) { flex-shrink:0 }` rétablit
tout, et le creux cumulé retombe à **39 mm** — exactement le chiffre annoncé par
le standard, ce qui confirme la correction.

**La page 8 débordait pour une autre raison, et la première piste était fausse.**
Réduire le bloc « L'essentiel » de 5 à 4 lignes n'a rien changé du tout : ce
n'est pas la colonne principale qui fixe la hauteur du corps de page, c'est la
**marge de notes** — 33 lignes de 7,6 mm, soit 250 mm, plus haute que tout le
reste. Elle poussait le bloc de clôture par-dessus le pied, qui traversait les
cases du code de déblocage et les deux QR. La page qui porte une clôture passe à
`lignes_notes=30` ; les 5 lignes du bloc « essentiel » sont rétablies telles que
Loïc les avait écrites.

**Au passage, l'aperçu du 29/08 cesse d'être une référence** : mesuré, il porte
272 mm de creux — l'état d'avant les corrections de remplissage. Le générateur
fait foi.

**Livré.** `fiches/fiche-2nde-t3c1.html` (généré, ne pas éditer),
`assets/pdf/pc/fiches/fiche-2nde-t3c1.pdf` (8 pages, 209,9 × 297,0 mm, 10 polices
incorporées), et le bouton « Télécharger la fiche (vierge) » posé en
`hors-verrou` sur la page du chapitre — accessible sans code, pour l'élève
absent. `node verifier.mjs` → **18**, le repère tenu.

**Deux points laissés à Loïc.** La fiche est **en avance sur la validation** : le
jalon 5 (« cours VALIDÉ ») n'a jamais été posé, et la fiche est déjà
téléchargeable. Et `fonts.css` **ne fournit pas d'italique pour IBM Plex Mono** :
les mentions « Donnée : … » des énoncés sortent du PDF en Consolas, dans un autre
dessin que le reste — ça vaut pour toutes les fiches, pas seulement celle-ci.

---

## 02/09/2026 (fin) — La chaîne des diaporamas n'existe pas ; le fichier, si

Réponse de Loïc à la question laissée ouverte : « elle n'existe pas ».
`extract_svg.py`, `build.js` et `anime.py` ont vécu le temps d'une session hors
dépôt. Il n'y a rien à attendre, et `_outils/diaporamas/` est supprimé plutôt
que laissé vide — un dossier qui attend indéfiniment est un mensonge de
rangement.

`CONSIGNES-diaporama-PC.md` est requalifié : **une méthode, pas un mode
d'emploi**. Les neuf règles, la séquence d'animation et les pièges disent quoi
refaire le jour où l'on réoutille ; la §4 est titrée « telle qu'elle a tourné une
fois », avec l'avertissement que ses commandes ne peuvent plus être lancées.
Corollaire posé noir sur blanc : **un diaporama se retouche à la main dans
PowerPoint.**

**Le fichier, lui, a été retrouvé** dans `Téléchargements` — et il y en avait
deux, d'apparence identique : 12 diapositives, 53 étapes d'animation, 34 médias
chacun. Quatre diapositives diffèrent. Le départage s'est fait sur la règle R4 :
la bonne est celle dont les indices sont **typographiques** (`U` + `max` en deux
runs) ; l'autre porte encore `U max` en texte plat. Elle est mise à l'abri dans
`_a-deposer/diaporamas/` — zone ignorée par Git : rien n'est publié, mais rien
n'est sauvegardé non plus. Où le ranger pour de bon reste à trancher, et la
question presse maintenant qu'il n'est plus régénérable.

🔴 **Le contrôle a trouvé une erreur de cours dans le fichier.** Le tableau des
célérités y est toujours celui saisi de mémoire : Air 340 · Eau **1 500** ·
**Bois 3 300** · Acier **5 000**. Le cours en ligne et la fiche élève donnent
cinq milieux — Eau 1450 · Glace 3200 · Verre 5300 · Acier 5750. Projeté tel
quel, l'écran contredit la feuille que l'élève complète.

`STANDARD-fiches` affirmait pourtant que « le diaporama a été recalé ». C'était
faux, et l'affirmation avait été reprise telle quelle dans la consigne le matin
même, en croyant recaler une contradiction entre les deux documents. Le fichier
tranche : les deux documents disaient faux, dans des sens opposés. Corrigé, avec
la mention qu'il faut y aller à la main — et que passer de quatre à cinq
colonnes touche la mise en page du tableau, ce n'est pas un remplacement de
valeurs.

**Versionné le jour même.** Loïc tranche : « tu peux versionner ». Le fichier
part dans `assets/pptx/pc/diaporama-2nde-t3c1.pptx`, à côté des PDF de fiches et
de DS, sous le nommage des fiches (`diaporama-2nde-<code>`). Motif : il n'est
plus régénérable, et une zone ignorée par Git ne sauvegarde rien.

Contrôlé avant d'être versé, puisque le dépôt est public et que GitHub Pages
sert tout ce qu'il contient : aucune correction à l'écran (R1 tenue), aucun nom
de classe ni d'élève, métadonnées limitées à la signature du professeur — déjà
publique sur le site. Aucune page n'y renvoie ; il reste néanmoins accessible
par son URL, ce qui est assumé.

**Un angle mort au passage.** `.gitattributes` déclarait dix formats binaires,
mais pas `pptx` — or un `.pptx` est un zip, et la règle générale du dépôt est
`* text=auto eol=lf`. La détection automatique de Git avait suffi jusqu'ici
(vérifié : le seul `.m4a` déjà versionné, `audio/2nde-pc-t3-c4-intro.m4a`, est
intact), mais rien ne le garantissait. `pptx`, `docx`, `m4a`, `mp3` et `mp4`
sont désormais déclarés explicitement.

---

## 02/09/2026 — L'audit de T1-C3, et le transverse qu'il a révélé

Deux briefs, exécutés d'affilée : le transverse d'abord, parce que ses lots 1 et 2
touchent `chapitre-commun.css` et imposent un seul bump de version, puis le
chapitre.

**Ce que la mesure a démenti.** Le brief traitait le `.resultat` qui raye la
notation de noyau comme un défaut indépendant, à corriger par un
`padding-bottom`. Appliqué tel quel, le trait restait **4,86 px trop haut** : il
rayait toujours le Z. Le padding a d'abord été poussé à 0,62 em, ce qui faisait
passer le trait — mais corrigeait un symptôme. En calibrant l'alignement de la
colonne A/Z (ligne de base mesurée par une sonde de hauteur nulle, hauteur de
capitale par `TextMetrics`), l'écart réel était de **11 px**. Une fois
`vertical-align: .8em` posé, le padding nécessaire retombe à 0,16 em. Le point 2c
du brief n'existait que parce que le point 2a n'était pas corrigé.

**Le périmètre réel des puissances de dix débordait le brief.** Le `grep` remontait
17 fichiers, dont des pages qui ne chargent pas `chapitre-commun.css` — les outils
transversaux de PC et des séquences SNT. Borné à la seconde PC sur décision de
Loïc, il reste 8 fichiers et 62 conversions, dont **22 sur T1-C3 — exactement le
chiffre annoncé par le brief**. Deux occurrences étaient dans du SVG inline, où
`<sup>` n'existe pas : posées en `<tspan>` avec `dy` et taille absolue.

Le relevé a aussi sorti **66 exposants d'unité** (`kg⁻¹`, `m·s⁻¹`) que le brief ne
mentionnait pas, et qui souffrent du même défaut de police. Traités. Les
configurations électroniques de t1-c6 et t1-c7 (`1s² 2s² 2p⁶`, 198 occurrences),
elles, restent en Unicode : même statut que les charges chimiques.

**Un ratage, corrigé.** Le numéro de chapitre destiné aux pieds de page du thème 3
est d'abord parti dans le **fil d'ariane**, dont les autres chapitres ne portent
pas de numéro — une incohérence introduite en corrigeant une incohérence. Annulé
et reposé au bon endroit.

**Les figures.** Sept refaites, plus le SVG inline de l'exercice 3. Un générateur
commun pose les nucléons sur un **empilement hexagonal** : les centres sont
distants d'exactement deux rayons, donc les particules se touchent sans se
recouvrir — c'est la condition pour que l'élève puisse les compter, et c'était
précisément ce qui manquait à l'exercice 3, qui annonçait « 13 protons et
14 neutrons » sur un dessin de sept particules noyées dans un halo orange.

Chaque figure a été rendue en PNG et **mesurée** : débordement de viewBox et
proportion de hauteur vide. Le contrôle a attrapé ce que l'œil laisse passer — une
légende sortant de 64 px à droite sur l'Image 1, 23 % de vide sur l'Image 3, une
ligne de texte hors cadre sur l'Image 7 — et l'œil a attrapé ce que la mesure ne
voit pas : deux légendes qui se chevauchent, et surtout, sur l'Image 7, **la ligne
médiane du terrain passant exactement sur le point du noyau**, qui devenait
invisible. Elle a été retirée : le rectangle et le rond central suffisent à dire
« terrain de football ».

**La grille des isotopes portait un défaut que le brief demandait seulement de
vérifier.** Ses deux légendes étaient **interverties** — la flèche horizontale
annonçait « même ligne : même élément chimique » alors qu'elle décrit la variation
du nombre de neutrons — et elle traversait son propre texte. Ses notations, enfin,
étaient saisies en exposants Unicode et s'affichaient « 16O » : dans un SVG servi
par `<img>`, les polices du site ne s'appliquent pas. Refaite, notations
construites, légendes descendues sous la figure.

**Ce qui reste à Loïc** : l'origine des treize photographies du chapitre — c'est le
seul point qui engage autre chose que de la mise en forme, et l'Atomium en est le
cas le plus sensible. Puis la validation de la page, qui débloquera la fiche.

---

## 02/09/2026 — La fiche élève de T1-C3

Page validée par Loïc, la fiche suit dans la foulée. Six pages A4, les 19 notions
et les 12 exercices du chapitre.

**Une demande qui change le gabarit : la frise doit être sur la fiche, mais pas à
compléter.** Toutes les autres fiches du parc sont intégralement à trous — c'est
leur raison d'être. La frise historique fait exception : elle se lit, elle ne se
récite pas. Elle est donc posée en bloc `.frise-f`, trois colonnes pour les trois
lignées, chaque savant avec sa date et son apport, et l'étiquette dit explicitement
« à lire, rien à compléter » pour qu'aucun élève ne cherche un blanc à remplir.

**La pagination s'est faite à la mesure, en trois passes.** La première version
tenait sur six pages, mais la deuxième faisait 333 mm de haut : à l'écran elle
s'étirait sans rien signaler, à l'impression — où `.feuille` est figée à 296 mm
avec `overflow:hidden` — le bas aurait été coupé net. Le passage à huit pages a
réglé le débordement mais laissé trois pages à moitié vides, dont une à 22 %. Le
retour à six pages a demandé de resserrer les zones de calcul et de densifier la
frise. État final mesuré : 81, 87, 87, 89, 95 et 87 % de remplissage, aucun titre
de section seul en bas de page.

**Un caractère de repli évité.** Le premier export signalait trois polices système,
dont Segoe UI Symbol : c'était l'étoile ★ qui marque les trois piliers du modèle de
Seconde, et qu'aucune des six polices du dépôt ne couvre. Remplacée par une pastille
dessinée en CSS. Restent Consolas et Times New Roman italique, replis déjà connus et
partagés par les six autres fiches du parc.

T1-C3 devient le troisième chapitre sur quatorze à porter sa fiche, après t1-c2 et
t1-c4. Le bouton `hors-verrou` est posé sur la page : la fiche vierge reste
accessible à l'élève absent ou en avance, qui n'a pas encore le code.

## 05/09/2026 — Le hub de 2nde PC : les chapitres d'abord, six outils refermés

Demande de Loïc : *« les outils de seconde non validés marqués en travaux et non
accessibles, ne garder que les fiches outil 1 et 2, et les fiches placées sous les
cours, plus importants chronologiquement. »* Trois gestes sur
`pages/2nde-physique-chimie.html`, un sur `index.html`. Décisions O-30 à O-32.

**Ce qui a bougé.** La section « Outils transversaux » — titre, chapeau et huit
cartes, 142 lignes — est passée d'avant le thème 1 à la fin du `<main>`. Les six
cartes `o3` à `o8` ont perdu leurs deux liens au profit d'une mention `.a-venir`
« Cours et fiche 🚧 ». Une règle `.docs .a-venir` a été ajoutée au `<style>` de la
page : sans elle, la mention tombait en texte nu à côté de boutons encadrés, et la
carte fermée ressemblait à une carte inachevée plutôt qu'à une carte en attente.
Elle reprend donc la forme et la place du bouton voisin, en trait **pointillé** et
en encre pâle — la différence se lit sans avoir à lire.

**Le chapeau de la section était devenu faux** et a été réécrit, pas surchargé : il
promettait que *« chaque outil se lit en ligne »*, ce qui ne vaut plus que pour deux
sur huit.

**Contrôlé au navigateur, pas dans le CSS.** Relevé CDP sur le hub rendu : ordre des
quatre `h2.theme` conforme (thèmes 1, 2, 3 puis outils, ce dernier à 2 283 px sur
une page de 4 621) ; `o1` et `o2` portent bien leurs deux `href` chacun, `o3` à `o8`
en portent **zéro** ; la mention rend en `inline-block`, bordure `dashed 1px`,
curseur `default`, `text-decoration:none`, 150 × 33 px, et `closest('a')` est nul —
elle n'est cliquable par aucun chemin. 0 erreur JS.

**Aucune porte dérobée.** Recherche sur tout le dépôt : hors les six pages
elles-mêmes et leurs six fiches sources, **rien ne pointe vers `o3`…`o8`**. Le hub
était leur unique point d'entrée. `o1` et `o2`, restés ouverts, ne renvoient qu'à
`o1` et à leurs propres PDF — aucun des deux ne rouvre un outil fermé par un lien
de contenu.

**Un libellé périmé corrigé en passant.** L'accueil annonçait `o4` « Calcul
littéral », nom d'avant la renumérotation O-23 du 25/08. C'est « Verrerie et
matériel ».

`node verifier.mjs` : **18 problèmes**, tous des liens `cfa/outil-*` vers des fiches
non écrites. Le repère est intact, aucune régression.

Rien n'a été supprimé : les six pages, leurs six PDF et leurs six fiches sources
restent en place. Elles restent d'ailleurs **atteignables par leur URL** — le dépôt
est public et retirer un lien ne ferme pas une porte. Rouvrir un outil, le jour où
il est validé, se réduit à rendre à sa liste `.docs` ses deux entrées de liens.

---

## 05/09/2026 — Le plafond ouvrait le module au lieu du cours

Signalé par Loïc depuis le tableau de bord : le premier cours de l'année est une
séance du thème 0, or « débloquer deux séances » débloquait `snt-m1`.

**La cause tenait à un tri.** `verrou-snt.js` construit la file des séances par
`Object.keys(SEANCES_SNT).sort()`. `'snt-m1'` se range avant `'snt-t0'` — m avant
t : le module transversal occupait les rangs 0 et 1 de l'année entière. Sur un
groupe neuf, curseur à −1 et `avance_max = 2`, le plafond valait 1 : les deux
seules séances ouvertes étaient celles du module, et `snt-t0/s1` était fermée.

Le tableau de bord n'inventait rien — il lit ce calcul-là, délibérément, pour que
le professeur et l'élève ne voient jamais deux ordres différents. Il affichait donc
fidèlement une file fausse. Côté élève, **trois groupes** étaient touchés : B, E et
N, les seuls à `avance_max = 2` ; les onze autres sont à « tout ouvert ».

**La règle posée** (provisoire, `DECISIONS.md`) : une séquence en `snt-m*` est hors
progression — toujours ouverte, hors curseur, hors frise. Le préfixe est déjà la
convention du hub, un futur `snt-m2` en hérite seul.

**Question de Loïc en cours de route** : « et si on valide une séance transversale
dans le cahier de textes, le suivi s'active-t-il pour les élèves ? » Vérifié plutôt
qu'affirmé : la grille, les absents, les compteurs de retard et de dette passent par
`seancesDu(ctx.theme)` et `rangCurseur()`, qui lisent `seances_faites` filtré sur la
séquence — jamais `VerrouSNT`, dont l'usage se limite à `rendrePlafond()`. Le suivi
d'un module est donc entier ; seul l'avancement du curseur de l'année lui est retiré,
ce qui est la règle voulue.

**Un défaut trouvé en chemin.** `snt-m1` s'affichait **brut** dans le menu Thème et
dans la phrase du plafond : le `replace('snt-t', 'Thème ')` ne l'attrape pas. Le
module en était quasi introuvable dans le tableau de bord — donc son suivi aussi,
alors même qu'il fonctionnait. Une fonction `nomSequence()` nomme désormais les deux
familles, « Thème 3 » et « Module M1 ». Sans ce correctif, la réponse rassurante à
la question ci-dessus aurait été vraie sur le papier et inutilisable en pratique.

**Ce qui est absent de la frise se dit.** Une ligne sous la frise nomme les
séquences hors plafond et rappelle où leur suivi se lit : une disparition muette se
serait lue comme une panne.

`?v=2 → ?v=3` sur `verrou-snt.js` dans les 6 fichiers qui le chargent. Les deux
guides `prof/` reçoivent le passage correspondant — la prise en main dans le
registre des collègues, le dispositif avec la cause technique et l'aveu du symptôme
— et leurs PDF sont régénérés (5 et 8 pages, A4 mesuré, polices incorporées).

`node verifier.mjs` : **18 problèmes**, tous des liens `cfa/outil-*` vers des fiches
non écrites. Repère intact, aucune régression.

**Un faux positif de `verifier.mjs` en passant.** Le paragraphe ajouté au guide
technique nommait `seances-snt.js` en prose, dans une balise `<code>`. Le contrôle
qui exige un `?v=` sur ce fichier balaie **tout** le HTML du dépôt, sans distinguer
un chargement de script dune