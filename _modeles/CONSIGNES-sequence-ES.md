# Consignes — séquences « Enseignement scientifique Terminale » 🚧

Troisième famille de pages (après chapitres PC et séquences SNT) : les **séquences
participatives de l'ens. scientifique de Terminale**. Première pièce :
`pages/term-es-s01-frise.html` (la grande frise).

## Ce qui la distingue
- CSS **inline autonome** (comme les séquences SNT), mais **identité papier d'étude**
  du site : variables du chapitre-commun reprises, polices de `fonts.css`,
  coque reliure (spectre fin, nav mono, pied Garamond).
- Persistance **locale** + **couche API** (`const API = {...}`) au contrat figé :
  le passage au serveur (`/serveur-frise/`) ne change QUE `URL_SERVEUR`.
- **Mode enseignant par `?prof=1`** (cohérent avec `?verrou=1` des chapitres) :
  vue de suivi, clé des titres, jetons, export CSV, titres « retenus » (★).
- Balise `.a-faire` 🚧 obligatoire sur tout manque, comme dans les chapitres.

## Règles propres à cette famille
1. **Aucun champ « note » nulle part** (page, serveur, IA) — garde-fous codés,
   ne pas les retirer. Voir `/ia-correction/README.md` (AI Act art. 6(3)).
2. Élèves identifiés par **code pseudonyme** `E-NN` uniquement.
3. **Deux sources exigées** au dépôt ; liste `SOURCES_BANNIES` dans la page
   (encyclopédies collaboratives, assistants IA) — à faire évoluer par Loïc.
4. Tirage de sujet : **2 tirés, 1 choisi, pas de retirage** (géré côté page
   aujourd'hui, côté serveur demain — le serveur renvoie 409 sur retirage).
5. Jetons d'engagement **semi-automatiques** (fiche, sources, placement,
   titre retenu) + bonus manuel enseignant ; les jetons donnent un **droit de
   choisir** (pôle, camp du débat), jamais des points de note.

---

# Les six chapitres d'ES de 1re — sur le moteur SNT

Deuxième pièce de la famille, et de loin la plus fournie : `pages/1re-es-tN-cN-….html`,
**6 chapitres, 18 séances**, portés le 06/09/2026. Ils ne suivent **pas** les règles
ci-dessus (pas de frise, pas de jetons, pas de tirage) : ils tournent sur le **moteur
des séquences SNT** (`assets/css/sequence-snt.css` + `assets/js/sequence-snt.js`), avec
sa grammaire séquence → séance → étape → champ. État et points en attente :
`_suivi/es1-verification.md`. 🔴 **Branchés en base depuis le 13/09/2026**, comme
les deux chapitres de terminale : `progression.js` dans le `<head>`, et sur `<body>`
`data-sequence="es1-tN-cN"` (terminale : `est-tN-cN`), `data-reponses="personnelles"`
— les réponses rédigées se corrigent **en classe**, elles partent en réponses
personnelles, jamais dans la file ni chez le worker —, `data-accueil="sur-place"`
et `data-renvoi-texte`. Les `data-cle` d'étape de terminale commencent par `est-`.
Pas de plafond d'avance. Un nouveau chapitre s'ajoute à `generer-questions.mjs` et
`generer-sequences-espaces.mjs`.

## Conventions de mise en forme (audit du 12/09/2026)

Motif : le gras employé partout donne un rendu « généré par IA », et l'œil n'a plus
aucun repère pour distinguer ce qui compte. Trois niveaux, **jamais cumulés** :

| Forme | Sens | Dose |
|---|---|---|
| `<b>` | structure du texte : terme de programme, à sa **première** occurrence dans l'étape | 2 par paragraphe, 1 par puce, 1 par correction de QCM, **0 dans une légende de figure** |
| `<b class="cle">` | rouge — **le mot que l'élève doit pouvoir restituer** en évaluation | 1 par bloc « à retenir », 1 par puce de bilan |
| `.plustard def` | mot dont la définition s'ouvre au survol (et alimente le glossaire) | à volonté |

Le rouge de mise en évidence (`--cle: #b3122b`) n'est **pas** le rouge des verdicts
(`--err`) : celui-là veut dire « faux », et un mot important ne doit jamais porter
cette couleur.

**Une activité se reconnaît à sa couleur avant d'être lue.** L'orange (`--activity`)
est déjà, dans ce moteur, la couleur de « tu agis » — QCM, étiquettes à poser : on la
reprend, on n'en invente pas une autre. Deux formes : `.card.activite` (+ badge
`.badge.act`) quand l'étape entière est une activité, `.activite` quand elle n'en
occupe qu'une partie.

**Le mot « exercice » ne s'écrit nulle part.** Il n'y a que des **activités**. Pour
une liste d'illustrations, on parle d'**exemples**, jamais de « a / b / c ».

**Chaque étape s'ouvre sur un `.transi`** : deux phrases rappelant ce qui vient d'être
fait et annonçant la suite. Il est placé en tête du `.card-body`, avant l'objectif —
c'est ce que l'élève lit en dépliant l'étape.

**La trace écrite.** En enseignement scientifique, la notion de *dossier numérique*
n'existe pas. Formulation à tenir : l'élève dépose sa fiche dans un dossier qu'il crée
sur OneDrive **s'il le souhaite**, ou la conserve comme il lui convient — avec le
conseil de passer par OneDrive.

Les trois composants (`.cle`, `.activite`, `.transi`) vivent dans le `<style>` de
chaque page ES, pas dans le CSS partagé : le SNT ne les a pas encore adoptés. Patron de
référence : `pages/1re-es-t1-c1-nucleosynthese.html`.

## 🚧 Chantiers ouverts de la famille
- cours-01-histoire (après S3, à partir de la frise réelle de la classe)
- cours-02-ia (fonctionnement, biais, outils, vigilances)
- pack débat IA (grille .docx prête hors dépôt ; plans de travail + cartes
  contraintes à décliner ; Digipad + Forms à créer)
- champ image dans le dépôt (dépend du serveur)
- vote des titres en classe (main levée pour l'instant)
