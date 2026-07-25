# Séquence Web — lots 0, 1, 3 et 4 (25/07/2026)

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
