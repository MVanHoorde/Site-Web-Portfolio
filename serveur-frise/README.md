# 🚧 Serveur de la frise — CHANTIER OUVERT

Backend de la séquence « La grande frise » (Term ES). **Rien ici n'est en
production.** Le site GitHub Pages est statique : ce serveur s'héberge à part
(PC de Loïc / VPS), et `pages/term-es-s01-frise.html` s'y raccorde en
renseignant `URL_SERVEUR` en tête de son script.

## Décisions déjà actées (ne pas défaire sans en reparler)
- **Pseudonymisation à la source** : le serveur ne connaît QUE des codes
  (`E-07`). La table code↔nom vit sur le PC de Loïc, jamais ici.
- **Aucun champ note, nulle part.** La pré-correction IA produit des critères
  + justifications (voir `/ia-correction/`). Conformité AI Act art. 6(3)
  (tâche préparatoire) : le système ne doit jamais évaluer à la place de
  l'enseignant.
- Données minimales, purge en fin d'année scolaire, registre de traitement à
  tenir (DPD établissement à prévenir avant mise en service réelle).

## Endpoints prévus (contrat d'interface avec la page)
| Méthode | Route | Rôle | Auth |
|---|---|---|---|
| GET  | /api/contributions | liste des dépôts | classe |
| POST | /api/contributions | déposer une fiche / un titre | classe |
| GET  | /api/tirages | attributions de sujets | classe |
| POST | /api/tirages | tirage / choix d'un sujet | classe |
| PUT  | /api/contributions | remplacement (titres retenus, bonus) | **enseignant** |
| GET  | /api/export.csv | relevé complet | **enseignant** |
| POST | /api/precorrection/:id | 🚧 déclenche la pré-correction IA (voir /ia-correction/) | **enseignant** |

## 🚧 Reste à faire
- [ ] Choisir l'hébergement (PC perso exposé ? VPS ? — voir Hermès/VPS au socle)
- [ ] Authentification enseignant (jeton simple suffira ; jamais de mdp élève)
- [ ] HTTPS obligatoire ; chiffrement du volume de données au repos
- [ ] Journalisation minimale (qui/quoi/quand par code, pas d'IP conservée)
- [ ] Purge automatisée fin d'année + sauvegarde chiffrée
- [ ] Registre de traitement + information familles (modèle à rédiger)
- [ ] Tests de charge : 35 élèves simultanés sur le tirage
