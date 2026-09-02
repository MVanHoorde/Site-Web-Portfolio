# Brief n° 2 — audit du thème 1, séances 2 et 3 · 22/08/2026

Destinataire : Claude Code, dans VS Code, dépôt `Site-Web-Portfolio` ouvert.
Origine : relecture par Loïc de l'ancienne séance 2 (« Internet et moi ») et de
la séance 3 (« Le réseau physique »), étape par étape.

---

## 0. AVERTISSEMENT SUR LA NUMÉROTATION — à lire en premier

**Ce brief a été rédigé sur l'état du dépôt AVANT le brief n° 1.** Toutes les
références (`2.3`, `3.1`, `3.2`…) désignent la numérotation **actuelle du
fichier**, pas celle d'après la découpe.

Si le brief n° 1 a déjà été appliqué, la séance 1 a été coupée en deux et tout
a glissé. Table de correspondance :

| Ce brief dit | Après le brief n° 1 | Titre |
|---|---|---|
| séance 2 | **séance 3** | Internet et moi |
| séance 3 | **séance 4** | Le réseau physique |
| étape 2.3 | étape 3.3 | Enquête maison — va voir ta box |
| étape 3.1 | étape 4.1 | Les topologies |
| étape 3.2 | étape 4.2 | Les câbles sous-marins |
| étape 3.3 | étape 4.3 | Du réseau mondial à ta maison |
| étape 3.4 | étape 4.4 | Les données et leur trafic |
| étape 3.5 | étape 4.5 | Pour aller plus loin (bonus) |

**Ne jamais identifier une étape par son numéro seul.** Se repérer au
`data-cle` posé au lot H du brief n° 1 (`t1-topologies`, `t1-cables-sous-marins`,
`t1-jusqua-la-maison`, `t1-trafic`, `t1-bonus-reseau-physique`,
`t1-bonus-internet-et-moi`), ou à défaut au titre.

Rappels du brief n° 1 : `verifier.mjs` doit sortir **19** problèmes, lire le vrai
code avant de modifier, aucun contenu pédagogique nouveau hors des blocs balisés
« proposition ».

---

## 1. PRÉREQUIS — hors périmètre de Claude Code

Le bouton « Partager avec la classe » échoue : la migration
`bdd/schema/014-reponses-personnelles.sql` n'a jamais été exécutée. Sans elle,
`statut = 'partage'` viole la contrainte `reponses_libres_statut_check` **et**
la policy `reponses_envoyer`. **Loïc l'exécute lui-même dans l'éditeur SQL
Supabase. Ne rien modifier dans le JS : le code est correct.**

---

## LOT K — Ancienne étape 2.3 : l'enquête maison

L'étape est **validée sur le fond** — Loïc la trouve très réussie. Un seul
ajout, dans le texte vu par l'élève.

Le bloc `perso-box` porte déjà `🛠️ À faire chez toi · avec l'accord d'un
adulte`. Il faut aller plus loin et dire explicitement, dans le corps du texte :

- que l'activité est **facultative** et **non évaluée** ;
- qu'elle demande le **mot de passe administrateur de la box**, que l'élève ne
  connaît pas et **doit demander à un adulte de la famille** ;
- qu'un refus des parents est **une réponse parfaitement acceptable**, et que
  l'élève n'a rien à rattraper dans ce cas.

Formulation à produire par Claude Code, dans le ton de la page — tutoiement,
bienveillant. **Trois phrases maximum.** Le reste du bloc ne bouge pas.

> ⚠️ **Ne pas ajouter de `data-perso-code` à ce bloc.** Le commentaire HTML qui
> le précède l'interdit explicitement et donne la raison : l'IP publique d'un
> logement et la consommation d'un foyer sont des données personnelles, et pas
> seulement celles de l'élève. C'est l'exception, elle est voulue.

---

## LOT L — Étape 3.1 : les topologies

### L1 — Les podcasts n'ont pas leur place ici
L'intertitre dit `🎧 Pour écouter avant le débat`. **Il n'y a pas de débat dans
cette étape** — le débat est dans l'ancienne séance 2. L'annonce est fausse.

Déplacer ce bloc `biblio` vers le « Pour aller plus loin » de la séance
(étape 3.5), en fin de bloc bonus. L'intertitre y devient `🎧 Pour écouter`,
sans mention de débat.

### L2 — Défaut de mise en page sous les points 2, 3 et 4
Loïc : « totalement illisible ». Relire le rendu réel des trois blocs et
identifier la cause avant de corriger — c'est vraisemblablement la même famille
que le tableau du lot M1 (largeur intrinsèque des champs, pas de conteneur
défilant, rognage par `.card{overflow:hidden}`), mais **le vérifier plutôt que
le supposer.**

### L3 — Séparer le maillé d'Internet, et remonter le maillé
Aujourd'hui le réseau **maillé** est présenté juste avant **Internet**, ce qui
rend la question sur Internet triviale : la réponse vient d'être lue.

- **Remonter le maillé** plus haut dans la liste des topologies, de façon qu'il
  ne soit plus l'item qui précède immédiatement Internet. Loïc veut « voir s'ils
  ont un peu oublié ce qu'ils ont mis juste avant ».
- **Séparer nettement les deux notions** : le maillé est une topologie,
  Internet est un assemblage de topologies. Ce ne sont pas deux items de même
  rang.
- Sur l'item Internet, l'élève doit **choisir entre les trois topologies**
  présentées, et non recopier la précédente.

### L4 — Remplacer l'exemple du câble coaxial
L'exemple du **câble coaxial** pour illustrer le réseau en bus ne parle plus à
personne. Le remplacer par la **guirlande électrique** ou la **multiprise en
série** — Loïc préfère la guirlande. Adapter le schéma s'il en porte la trace.

### L5 — Retirer le cadre rouge
Loïc voit un encadré rouge de prise de décision dans cette zone. **Attention :
il n'y a aucun `<aside class="chantier">` dans l'étape 3.1 elle-même** — le
bloc vu appartient probablement à une étape voisine. Le localiser avant
d'agir.

Règle générale à appliquer sur toute la page : **retirer les blocs
`<aside class="chantier">` dont le contenu est réglé.** Celui du lot N4
(« 📅 Fraîcheur — étape 3.4 ») en fait partie. Pour chacun, vérifier dans
`_suivi/DECISIONS.md` ou `_suivi/JOURNAL.md` que la décision est bien close
avant de supprimer. Lister dans le compte rendu ceux qui ont été retirés et
ceux qui restent, avec la raison.

**Le reste de l'étape 3.1 est validé.**

---

## LOT M — Étape 3.2 : les câbles sous-marins

L'étape la plus chargée du thème, et celle qui demande le plus de travail.

### M1 — Le tableau de Lannion déborde
Cause vérifiée. Le bloc `1 · Les câbles qui arrivent à Lannion` contient un
`<table class="doc-table">` à **cinq colonnes**, dont quatre remplies
d'`<input class="short">`. Le CSS ne prévoit rien :

- `.doc-table{width:100%}` (ligne ~167), sans conteneur défilant ;
- `.doc-table td:first-child{white-space:nowrap;width:1%}` (ligne ~900) fige la
  colonne des noms ;
- les `<input>` gardent leur largeur intrinsèque (~20 caractères) et refusent
  de se comprimer.

La table réclame plus large que son `.field`, déborde, et se fait rogner par le
`.card{overflow:hidden}`. **La variante `.doc-table.compare` a reçu un
traitement responsive (lignes ~905-909) ; celle-ci ne l'a jamais eu.**

Correctif :
- `.doc-table input.short{width:100%;min-width:0;box-sizing:border-box}` ;
- envelopper la table dans un conteneur `overflow-x:auto` ;
- vérifier à 1280, 820 et 390 px.

### M2 — Accepter « Guernesey » pour le câble HUGO
Le champ provenance de HUGO a `data-answer="Royaume-Uni"` et pour variantes
`Angleterre|UK|Grande-Bretagne|Royaume Uni`. L'atterrage réel du câble est
**Guernesey**. Ajouter `Guernesey` et `Guernsey` aux variantes.

### M3 — Le câble Amitié : dire pourquoi Meta et Microsoft sont là
Le texte se contente de « on y retrouve deux géants du numérique ». Loïc :
« c'est trop survolé, les élèves ne vont pas comprendre l'intérêt de mentionner
ça ».

À développer, en trois ou quatre phrases : pourquoi des entreprises qui ne sont
pas des opérateurs télécoms financent et possèdent des câbles sous-marins —
maîtrise du coût et de la latence de leurs propres services, indépendance
vis-à-vis des opérateurs, capacité réservée pour leurs centres de données.
Nommer ce que possède chacun (Meta : Facebook, Instagram, WhatsApp ;
Microsoft : Azure, Teams, Xbox, LinkedIn), pour que « géant du numérique »
cesse d'être une formule creuse.

Reprendre le même angle dans **la question qui demande à l'élève s'il reconnaît
certains des propriétaires** : la réponse attendue doit expliquer, pas
seulement nommer.

### M4 — 2Africa : donner l'intérêt stratégique
Même traitement dans la réponse attendue : pourquoi un câble qui fait le tour
de l'Afrique, ce que change une connexion directe entre continents pour les
pays traversés, et ce que cela dit du déséquilibre de couverture — sujet déjà
ouvert en séance 1, question sur les 2 milliards hors ligne.

Chercher des éléments récents et sourcés. **Vérifier la fraîcheur : tout chiffre
daté doit porter sa source et son année.**

### M5 — Un intertitre orphelin, résidu de refonte
Deux `block-label` consécutifs portent le numéro **5** :

```html
<div class="block-label">5 · La fibre optique, et le tout premier câble<span class="niv">★★ à savoir</span></div>
<!-- Q5 — REFONTE 25/07/2026 : … -->
<div class="block-label">5 · Du télégraphe à la lumière : 170 ans de câbles<span class="niv">★★ à savoir</span></div>
```

Le premier est **vide** : son contenu a été absorbé par la refonte du 25/07,
mais le titre n'a jamais été supprimé. **Le retirer.** La numérotation 1→8
redevient continue.

### M6 — Un cadre orange dans un cadre gris
Le QCM (cadre orange) est enveloppé dans un conteneur gris qui n'a pas de raison
d'être. Les autres étapes ne font pas ça. **Aligner sur la logique des autres
étapes : le QCM se pose directement, sans enveloppe.**

### M7 — Ajouter un court passage sur la fibre optique
Le QCM pose une question sur la fibre optique, mais rien dans l'étape ne
l'explique — c'est ce que devait porter le bloc supprimé au M5.

**Court**, Loïc insiste : « il ne faut pas que ce soit trop lourd ». Le cœur,
la gaine, la protection ; la lumière qui se réfléchit sur les parois ; l'ordre
de grandeur du diamètre du cœur face à un cheveu.

**Deux images fournies par Loïc, à placer côte à côte** — reprendre le
composant `.duo-ill` déjà utilisé pour CYCLADES :

| Fichier | Sujet | Auteur | Licence |
|---|---|---|---|
| `Principe_fibre_optique_2.png` | Schéma de principe (cœur 10 µm, gaine 125 µm, protection 230 µm) | Christophe.Finot | **CC BY-SA 2.5** |
| `MultimodeFiber.jpg` | Macro d'une fibre multimode dégainée | Hhedeshian | **CC BY 3.0** |

⚠️ **Les deux licences exigent l'attribution, et la CC BY-SA 2.5 impose le
partage à l'identique.** Chaque `<figcaption>` doit porter le nom de l'auteur,
le titre du fichier, la licence et son lien. Ne pas se contenter de « source :
Wikimedia ». Placer les fichiers dans `assets/img/snt/` — ce sont des
illustrations destinées aux élèves, contrairement aux PNG de `_modeles/`.

### M8 — Expliquer ce qu'est une saturation
La réponse attendue à la question sur la saturation emploie le mot sans le
définir. Ajouter une phrase : ce qui se passe quand la demande dépasse la
capacité du lien, et ce que l'utilisateur constate.

### M9 — La question « combien de fois le tour de la Terre ? »
Quatre corrections sur la même question.

1. `cherche puis écris ta réponse` → **« effectue une recherche sur le web »**.
   Loïc veut le vocabulaire juste.
2. Préciser que **la calculatrice est autorisée** : ce n'est pas un calcul
   mental.
3. Supprimer **« à toi de trouver l'opération »** — sans intérêt.
4. 🔴 **Le texte de débriefing ne doit plus s'afficher d'emblée.** Le passage
   « tu as peut-être trouvé entre tant et tant… c'est ce qu'on appelle l'ordre
   de grandeur » est aujourd'hui visible sous la question : il donne la réponse
   avant qu'elle soit cherchée.

   Il ne doit apparaître **qu'après un clic sur Vérifier**, et **seulement si le
   résultat est à peu près juste**. Tolérance : **±25 % autour de la valeur de
   référence**. Réutiliser le mécanisme de révélation existant (`data-reveal` /
   `.reveal.show`) plutôt que d'en inventer un.

### M10 — L'étape est trop lourde
Loïc : « pas très sexy, avec son nombre de questions et ses cadres gris en
boucle ». Huit blocs numérotés, trois `cloze`, un QCM, douze dépôts d'image.

> ⚠️ **Proposition attendue, pas exécution.** Claude Code produit un **plan
> d'allègement** en fin de tâche — quelles questions fusionner, lesquelles
> basculer en bonus, comment casser la répétition visuelle des cadres — et
> **n'applique rien** sans validation de Loïc. Le contenu pédagogique lui
> appartient.

---

## LOT N — Étapes 3.3, 3.4 et 3.5

### N1 — 3.3 : la révélation du document est trop rapide
Au clic, le document du dessous s'active instantanément. Loïc : « c'est peut-être
un peu rapide ». Ajouter une transition douce, et respecter
`prefers-reduced-motion`.

### N2 — 3.3 : « associe chaque réseau à son principal point faible »
Même défaut de mise en page qu'au lot L2 et au lot M1. Même traitement.

### N3 — 3.3 : ce qui part en correction, et ce qui n'y va pas
- **La question 1 est une question d'intuition** : elle dépend de l'élève, elle
  n'a pas de réponse juste. **Elle ne doit pas être envoyée pour correction.**
  Retirer son `data-focus-code` s'il en porte un.
- **Les questions 2 et 3 partent en correction** — comportement actuel à
  conserver.
- **Les définitions** : vérifier si elles sont envoyées. **Si elles ne le sont
  pas, les envoyer.**
- Dans les deux cas, **le préciser dans l'en-tête de l'étape** : l'élève doit
  savoir ce qui part chez son professeur et ce qui reste local.

### N4 — Retirer le bandeau « Fraîcheur »
`<aside class="chantier"><div class="cl">📅 Fraîcheur — étape 3.4</div>…`.
Loïc : « on peut le garder dans nos fichiers, mais non, on ne va pas le
garder ». **Le supprimer de la page**, après avoir reporté ce qu'il contient
encore d'ouvert dans `_suivi/IDEES.md` ou `_suivi/ETAT-PROJET.md` — la
documentation vit dans les fichiers de suivi, pas en marqueurs inline.

### N5 — Supprimer « Tu as tout parcouru ? »
`<p class="doc-note">Tu as tout parcouru&nbsp;? Affiche le à retenir.</p>` —
**deux occurrences, lignes ~1778 et ~1983**. Inutile : le bouton verrouillé
annonce déjà combien de réponses manquent. Supprimer les deux.

### N6 — Le bilan de l'activité ne s'ouvre pas
Symptôme : Loïc a répondu à tout et le bloc « à retenir » reste fermé. Constaté
en 3.2, possiblement aussi en 3.3.

**Cause non identifiée.** Ce qui est écarté :
- ce n'est **pas** l'échec du partage (lot 1) : pour un `textarea`,
  `bqRempli()` se contente de `!!el.value.trim()` ;
- ce ne sont **pas** les dépôts de copie d'écran : `data-depot` n'est pas dans
  le sélecteur de `bqReste()`.

Reste le plus probable : un bloc `[data-focus]` qui n'obtient jamais sa classe
`rempli` ni son `[data-focus-echo]`. **Diagnostiquer dans un navigateur** en
instrumentant `bqReste()` pour journaliser les éléments comptés vides, sur les
deux étapes. Corriger la cause, pas le symptôme — ne pas relâcher la condition
d'ouverture du bilan.

### N7 — Retour d'onglet : la page remonte en haut
En quittant l'onglet puis en y revenant (constaté sous Opera GX), la page
défile jusqu'en haut. Un écouteur `visibilitychange` existe ligne ~376 :
c'est le premier endroit à regarder. Le retour d'onglet ne doit **rien** faire
défiler.

### N8 — 3.5 : homogénéiser le poste de visionnage
Le bloc bonus porte un intertitre `Poste de visionnage` mais un champ
`Prise de notes · mode focus · envoyée pour correction`, alors que les étapes
non-bonus utilisent le composant `.poste` (3 occurrences dans la page).
**Aligner le bonus sur le composant `.poste`**, pour que la façon de regarder
une vidéo soit la même partout.

### N9 — 3.5 : le récapitulatif est tronqué
Il s'arrête à « le mécanicien serre le frein au lieu de l'ouvrir ». Cause :
`.modal .recap{max-height:200px;overflow:auto}` (CSS ligne ~317). Il défile en
théorie, mais 200 px c'est trois lignes. **Passer à `max-height:60vh`.**

**3.4 est validée** hors N4 et N5. **3.5 est validée** hors N8 et N9.

---

## LOT O — Vérifications

Identiques au brief n° 1 : `?v=` incrémenté sur les 4 pages du moteur partagé,
`node verifier.mjs` à **19**, `node verifier.mjs --qcm` après toute retouche de
QCM, garde-fou anti-fragments, bancs d'essai Node/jsdom, `git diff --stat`.

**Un contrôle en plus** : les deux images de fibre optique sont sous licences
Creative Commons à attribution obligatoire. Vérifier que chaque `<figcaption>`
porte auteur, licence et lien avant de committer.

---

## Question non tranchée — ne rien faire sans réponse de Loïc

Loïc a évoqué le déplacement d'un bloc « Pour aller plus loin » vers la fin de
la **nouvelle séance 2** (« D'ARPANET à Internet »), en y adjoignant les liens
de podcast autour de **CYCLADES**. La transcription est ambiguë sur le bloc
visé, et Loïc n'a pas su la reconstituer.

Deux lectures possibles :
1. le bonus de l'ancienne séance 2 (l'enquête box) y migre — thématiquement
   incohérent, l'enquête box parle du réseau domestique, pas d'ARPANET ;
2. le bonus Pouzin / CYCLADES (ancienne étape 1.5) devient le « pour aller plus
   loin » de fin de la nouvelle séance 2, au lieu d'en être la 2ᵉ étape sur 4 —
   cohérent, et il porte déjà le podcast France Culture sur CYCLADES.

**La lecture 2 est la plus probable, mais ce n'est pas à Claude Code d'en
décider.** Laisser en l'état et le rappeler dans le compte rendu.
