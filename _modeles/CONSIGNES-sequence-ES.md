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

## 🚧 Chantiers ouverts de la famille
- cours-01-histoire (après S3, à partir de la frise réelle de la classe)
- cours-02-ia (fonctionnement, biais, outils, vigilances)
- pack débat IA (grille .docx prête hors dépôt ; plans de travail + cartes
  contraintes à décliner ; Digipad + Forms à créer)
- champ image dans le dépôt (dépend du serveur)
- vote des titres en classe (main levée pour l'instant)
