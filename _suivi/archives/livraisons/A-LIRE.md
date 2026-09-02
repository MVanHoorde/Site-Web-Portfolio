# Séquence Web — les cinq lots, terminés (25/07/2026)

Extraire à la **racine du dépôt**. Cette archive **remplace** la précédente
(la première livraison du lot 0 laissait du CSS orphelin — voir §5).

```
pages/2nde-snt-t2-le-web.html   portée + séance 1 refondue
assets/js/sequence-snt.js       + piège à clic, console corrigée
assets/css/sequence-snt.css     + habillage du piège à clic
pages/2nde-snt-t1-internet.html version (?v=19) — 2 lignes, rien d'autre
pages/2nde-snt.html             version (?v=19) — 1 ligne
_suivi/DECISIONS.md · ETAT-PROJET.md
```

```powershell
node verifier.mjs
```
→ **exactement 2 problèmes** connus.

---

## 1. Lot 0 — le portage

Plus une ligne de CSS ni de JavaScript propre à cette page : 22 800 caractères
de `<style>` et 16 000 de `<script>` sont partis.

| Avant | Après |
|---|---|
| QCM inline, une question | **QCM plein écran** |
| zones de texte libre | **mode focus**, copier-coller bloqué |
| interrupteur « mode enseignant » | **zone à code** avec chronomètre |
| — | barre « tu es ici », pliage automatique, numérotation calculée, feuille mobile, carte de reprise |

Le **piège à clic** de la séance 4 n'existait que dans cette page : il est
monté dans le moteur partagé, remise à zéro comprise. Inerte ailleurs.

## 2. Lot 1 — la séance 1, en quatre étapes

**1.1 · Le Web n'est pas Internet.** Le partage entre les deux, avec le test
qui tranche (un message, un jeu en ligne, une mise à jour : Internet travaille,
le Web non). Une histoire courte, de Ted Nelson (1965) à Google (1998), en
passant par le domaine public de 1993. Et **tout le vocabulaire du thème
disséminé** derrière les pictos 🔭 : lien hypertexte, HTML, CSS, URL, HTTP,
moteur de recherche, navigation privée — annoncés, pas à apprendre. QCM de
5 questions.

**1.2 · Navigateur ou moteur de recherche&nbsp;?** La question est **posée
d'abord**, avant toute lecture (`WEB-R1a`, non corrigée, personne ne juge le
premier jet), puis l'élève va voir sur son poste, lit les documents, et
**reprend la même question à la fin** (`WEB-R1b`, corrigée, celle qui compte).
Entre les deux : le navigateur comme logiciel, le moteur comme site, l'image
de la voiture et du GPS, les parts de marché 2026, la Chine et la Russie —
deux exceptions pour deux raisons opposées — et l'index comme objet de
**souveraineté** (Qwant, Ecosia, l'index européen Staan). QCM de 6 questions.

**1.3 · La requête HTTP.** Poste de visionnage, puis l'anatomie réelle d'une
requête (`GET`, chemin, version, `Host`, `Accept`, `User-Agent`) et d'une
réponse (les familles `2xx` `3xx` `4xx` `5xx`, et pourquoi le 404 est une
erreur *du client*). Schéma à légender en quatre questions, et un encart sur
le cadenas qui dit clairement le contresens : **chiffré ne veut pas dire
fiable**. QCM de 5 questions.

**1.4 · Décomposer une URL.** Le schéma en couleurs, morceau par morceau,
jusqu'au **port**, aux **paramètres** et à l'**ancre** — que tes documents
avaient et que la page n'avait pas. Les extensions, avec le piège dit
franchement : `gouv.fr` et `univ-poitiers.fr` ne sont **pas** des extensions.
L'ICANN, l'AFNIC, et le fait qu'un nom de domaine se **loue**. Texte à trous
avec deux niveaux d'indices, QCM de 4 questions.

Le Minitel, le « et toi&nbsp;? » et le « pour aller plus loin » sont conservés
tels quels.

## 3. Ce qui t'attend, toi seul

1. **Le cadre vidéo de 1.3 est vide** — il me faut l'adresse
   `youtube-nocookie`, le titre, la chaîne et la durée.
2. **Les questions sur la vidéo sont à écrire après visionnage.** Même
   décision qu'en séquence Internet : je ne l'ai pas vue, je ne peux garantir
   aucune question sur son contenu. Le QCM actuel ne porte que sur les
   documents de la page, pour que l'étape reste validable sans elle.
3. **La manipulation `WEB·1a` de 1.2** (« repère ton navigateur et ton moteur
   sur le poste ») attend ta consigne exacte.
4. **Une décision** : la séance 1 passe à **≈ 2 h**. On garde en deux temps,
   ou on déplace `1.4` en séance 2&nbsp;?

## 4. Tes documents, ce que j'en ai fait

**Repris** : la métaphore de la toile, le modèle client-serveur, l'anatomie
des requêtes et des réponses (activité p24), la décomposition complète de
l'URL (p32), les extensions, l'ICANN, la définition du moteur et du
métamoteur, les quatre mots à ne pas confondre (p33), le tableau des moteurs
par pays.

**Refait** : les parts de marché de **juin 2017** et **août 2019** sont
remplacées par StatCounter **2026**. Et j'ai écrit dans la page que les
estimations varient de 87 % à 93 % selon les sources — c'est un objet
d'esprit critique en soi, pas un détail à cacher.

**Corrigé** : « Word Wide Web » → *World Wide Web* · « TCP/IP (Transmission
Control Protocol) » → **le modèle** TCP/IP · `.asso`, `.univ` et `.gouv`
présentés comme des extensions alors que ce sont des **sous-domaines** de
`.fr`.

**Non republié** : les quatre scans du **cahier Nathan** (p24, p27, p32, p33).
Le site est public : leurs énoncés sont réécrits avec nos propres données.

## 5. L'incident de la première livraison

Le CSS contenait, ligne 255, un commentaire où la balise ouvrante de `body`
était écrite en toutes lettres. Mon script coupait « du `<style>` au premier
`<body>` » : il s'est arrêté là et a laissé 29 lignes de CSS hors de toute
balise, affichées en texte brut.

Deux parades, appliquées et vérifiées :

1. **On ne borne plus une coupe sur une balise ouvrante** — seulement sur les
   fermantes, qui ne peuvent pas apparaître en littéral dans ce qu'elles ferment.
2. **Un garde-fou clôt chaque passe** : il retire du corps de page les scripts,
   les commentaires et les balises, puis cherche dans le reste des `*/`, des
   `{prop:valeur}`, des `@media`, des `function(`. Un seul fragment et la
   passe échoue.

## 6. Vérifié

```
verifier.mjs           2 problèmes connus, rien de neuf
node --check           moteur : syntaxe bonne
generer-seances.mjs    37 séances, à jour
garde-fou              texte visible propre
9 QCM                  JSON valide, aucune réponse hors bornes
21 codes de champ      tous uniques
structure              415 balises ouvrantes / 415 fermantes
```

## 7. Lot 3 — la séance 2, HTML & CSS

**2.1 · Une page, deux langages.** Les deux versants — ce que le développeur
écrit, ce que l'utilisateur voit — les balises courantes, le CSS et son
intérêt (une ligne change tout un site), et les **standards du W3C** qui
expliquent qu'une page s'affiche partout pareil.

**2.2 · Écrire ta première page.** L'atelier CodeBetter, avec **tes deux
codes d'origine** (le lycée, les secondes, Merriweather 32 px) et tes quatre
manipulations : recopier, ajouter « La Classe de Première », retirer un
`<li>` puis un `<ul>` pour voir ce qui casse, refaire les couleurs. Trois
captures attendues. La question sur `<ul>` et `<li>` se répond **pendant**
la manip, pas après.

**2.3 · Le rôle des balises, avec tes mots.** Conservée, complétée.

**2.4 · Inspecter — et truquer — une vraie page.** Tes cinq manipulations sur
Rimbaud, dans l'ordre. Avec, en tête, l'avertissement qui compte : tu modifies
**ta copie**, pas Wikipédia. Et à l'arrivée, le vrai enseignement : tu viens
de fabriquer une fausse page crédible en trente secondes, donc **une capture
d'écran ne prouve rien**. Ça prépare la séance 3.

**2.5 · Chacun son métier.** Tes huit tâches de l'exercice 18 p33, à trier
entre HTML et CSS — avec le cas « mettre en gras », qui fait débat et qu'on
traite au lieu de l'éviter.

## 8. Lot 4 — les cookies, en séance 4

Une étape ajoutée après « ce que ton navigateur garde de toi ».

L'élève **cherche lui-même** le chemin vers la suppression des cookies, sur
**deux** navigateurs. Aucun pas-à-pas n'est donné : le savoir-faire visé,
c'est justement de trouver un réglage qu'on n'a jamais cherché. Deux repères
seulement, et un avertissement sur les postes partagés.

Puis la comparaison, qui est le cœur de l'affaire : certains navigateurs
trient **par site**, d'autres **par période**. Ni l'un ni l'autre n'est le
bon — ils répondent à deux besoins différents.

Autour : la distinction **cookie de session / cookie tiers**, le **RGPD** et
pourquoi refuser doit être aussi simple qu'accepter, et un tableau de ce que
la navigation privée cache — et surtout de ce qu'elle **ne** cache **pas**.

**Anti-doublon** : ton document sur la sécurité contenait aussi la définition
du navigateur et ses parts de marché. Elles sont traitées **une seule fois**,
en 1.2. La séance 4 n'en reprend rien.

## 9. Un faux positif corrigé au passage

`verifier.mjs` a signalé **six liens cassés** dans mes exemples de code : il
lisait `href="…"` et `src="chat.jpg"` comme de vraies adresses. Les
guillemets des exemples s'écrivent maintenant en `&quot;` — l'élève voit
exactement le même code, le contrôle ne s'y trompe plus. J'ai vérifié en
décodant les blocs : le code affiché est correct au caractère près.

Nouvelle classe `pre.code-bloc` dans le CSS partagé : défilement horizontal
plutôt que césure, pour qu'un code reste juste à recopier sur iPad.

## 10. Ensuite

**Lot 2 — la séance 3, moteurs de recherche**, avec le document 03 : les cinq
tâches à replacer (exploration, indexation, classement de notoriété, recherche
par mots-clés, tri), le SEO, et le tableau géographique refait en 2026.

**Lot 5 — la frise débranchée** et ses 20 repères datés.

Et une décision qui ne peut être que la tienne : **la séquence est passée de
6 h à 7 h 30**. Il faut arbitrer ce qui se retire ou devient facultatif.

---

## 11. Arbitrages appliqués le 25/07 au soir

Tu as validé les cinq créneaux et tu m'as laissé appliquer le reste. Voici
exactement ce que j'ai fait — pour que tu puisses revenir sur chaque point.

**Cinq créneaux assumés.** Rien n'est raccourci. L'en-tête l'annonce.

**`2.2` CodeBetter n'est plus bloquante.** C'est la correction la plus utile
de la soirée : cette étape dépend d'un service extérieur au site. Si le filtre
du réseau le coupe un lundi matin, un élève se retrouvait verrouillé pour la
séance entière. Elle reste au programme, elle n'est plus une porte.

**`2.5` passe en consolidation hors 100 %.** Visible, faisable, pas exigible.

**L'ancienne étape 3.1 est supprimée** — et c'est la réparation d'une erreur
que j'ai commise au lot 1 : en écrivant `1.2`, j'ai repris la définition du
moteur et du métamoteur qui existait déjà en tête de séance 3. Deux
traitements complets de la même notion, ce que les consignes interdisent
explicitement. J'ai gardé celui de la séance 1, plus riche (il porte l'index
et la souveraineté). La séance 3 s'ouvre maintenant sur le classement des
pages, avec un renvoi vers la séance 1. Le code `WEB-R4` est retiré et **ne
sera pas recyclé** : un code de champ qui a existé ne doit jamais désigner
autre chose plus tard.

**« Un réflexe que tu comptes appliquer » devient une réponse partagée**, non
corrigée. On ne corrige pas un engagement.

**Et une rectification que je te dois.** Je t'ai annoncé 12 réponses rédigées
et 864 copies. C'était faux : quatre d'entre elles sont dans des blocs bonus,
donc facultatives. Le vrai point de départ était **7 corrigées obligatoires**,
soit ≈ 504 copies pour trois groupes. Après ces arbitrages, il en reste
**5** — `WEB-R1b`, `WEB-R2`, `WEB-R5`, `WEB-R4a`, `WEB-R7` — soit ≈ 360 copies
et ≈ 120 relectures au budget d'une sur trois.

### Charge finale, par séance

| | Étapes | dont bloquantes | Rédigées corrigées |
|---|---|---|---|
| S1 | 6 | 4 | 2 |
| S2 | 6 | 3 | 1 |
| S3 | 5 | 4 | 1 |
| S4 | 6 | 5 | 2 |

Restent à produire : **lot 2** (séance 3, moteurs de recherche) et **lot 5**
(la frise débranchée).

---

## 12. Lot 2 — la séance 3, moteurs de recherche

**Le moteur travaille en deux temps.** Tes cinq tâches du document 03, dans
leurs deux phases : avant ta recherche, des robots **explorent**, les pages
sont **indexées**, chacune reçoit une note de **notoriété** ; au moment où tu
tapes, le moteur **recherche** dans l'index puis **trie**. L'exercice à menus
reprend exactement ton découpage, avec une sixième question qui vérifie que
l'élève a compris la séparation des deux temps.

Ajouté : le **SEO** — et sa conséquence, dite franchement : *le premier
résultat est le mieux classé, pas le plus vrai*. Et la distinction entre un
résultat **classé** et un résultat **acheté** (la mention « Annonce »), qui
n'était nulle part et qui est le premier réflexe utile devant une page de
résultats.

**La grille de fiabilité.** L'étape 3 de ton document 01 — la longue liste
auteur / date / structure / contenu — devient **quatre questions** : qui
écrit, quand, pourquoi, comment. Plus deux choses qui n'y étaient pas : le
réflexe **géographique** (une règle américaine n'est pas une règle française —
beaucoup d'erreurs d'exposé viennent de là, pas d'un site menteur), et la
**relecture de l'URL**, qui referme la boucle avec l'étape 1.4 :
`education.gouv.fr` et `education-gouv.info` ne se ressemblent que pour qui
ne regarde pas.

## 13. Lot 5 — la frise débranchée

Tes **vingt étiquettes**, distribuées **sans leurs dates** : les chercher fait
partie du travail. Les deux intrus de ta liste — les premiers pas sur la Lune,
le premier ordinateur portable — sont gardés et **assumés comme repères** :
ils servent à sentir l'époque.

Et j'ai gardé « le premier ordinateur portable » **exprès sans réponse
unique**. Selon la définition retenue — transportable, à batterie, écran
rabattable — on trouve 1975, 1981 ou 1982. La consigne le dit à l'élève : ne
cherche pas la bonne réponse, cherche pourquoi les sources ne sont pas
d'accord. C'est la séance 3 qui revient par la petite porte, sans écran.

Le « à retenir » tient en une idée : **Internet a vingt ans de plus que le
Web**. 1969 d'un côté — quatre ordinateurs qui se parlent, et deux hommes sur
la Lune la même année. 1989-1991 de l'autre.

Durée portée de 30 à 45 min.

### Les dates, pour toi

```
Internet     modem ~1958 (conventionnel) · ARPANET 1969 · TCP 1974
             CNIL 1978 · bascule TCP/IP 1983 · Napster 1999
             Facebook 2004 · iPhone 2007 · Instagram 2010
Web          hypertexte (Nelson) 1965 · proposition au CERN 1989
             domaine public + Mosaic 1993 · bannière pub + Yahoo! 1994
             JavaScript et PHP 1995 · CSS 1996 · Google 1998
Repères      la Lune 1969 · ordinateur portable 1975 / 1981 / 1982 (le piège)
```

Deux dates sont **conventionnelles** et non des faits tranchés : celle du
modem et celle de l'ordinateur portable. Je les ai laissées telles quelles —
mais mieux vaut le savoir avant de corriger.

## 14. Nomenclature des codes

Les codes de champ étaient devenus disparates au fil des lots. Ils sont
maintenant réguliers : `WEB-Q<séance><lettre>` pour les QCM,
`WEB-R<séance><lettre>` pour les réponses rédigées. **22 codes, tous uniques,
tous cohérents avec leur séance.** Les codes `WEB-Q2` et `WEB-R4`, retirés en
cours de route, ne sont pas recyclés.

## 15. Où en est la séquence

| | Étapes | dont bloquantes | QCM | Rédigées corrigées |
|---|---|---|---|---|
| S1 Le Web | 6 | 4 | 4 | 2 |
| S2 HTML & CSS | 6 | 3 | 2 | 1 |
| S3 Recherche & IA | 5 | 4 | 3 | 1 |
| S4 Sécurité | 6 | 5 | 3 | 2 |
| Frise | 1 | — | — | — |

Cinq créneaux, ≈ 7 h 30 plus 45 min sans écran.

### Ce qui reste, et qui ne dépend que de toi

1. La **vidéo de 1.3** : adresse `youtube-nocookie`, titre, chaîne, durée —
   puis les questions de QCM, après visionnage.
2. La **consigne exacte de `WEB·1a`** (repérer son navigateur et son moteur).
3. Les **étiquettes imprimables** de la frise (`WEB·D`).
4. **En salle** : CodeBetter passe-t-il le filtre ? quels navigateurs sur les
   postes ? et les tests Playwright aux trois largeurs.
5. La **licence de l'image du Minitel** sur Commons.
6. La **grille de critères IA** des cinq réponses corrigées : `WEB-R1b`,
   `WEB-R2a`, `WEB-R3b`, `WEB-R4a`, `WEB-R4b`.

