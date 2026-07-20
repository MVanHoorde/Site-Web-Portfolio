# `bdd/` — schéma de la base de données

Cette partie du projet contient **le schéma SQL** de la base Supabase :
la description des tables, des contraintes et (plus tard) des règles RLS.

Elle ne contient **aucune donnée d'élève** et ne doit jamais en contenir.

## Discipline

- Les fichiers de `schema/` sont **numérotés** et se rejouent **dans l'ordre**.
- Un fichier déjà exécuté n'est **jamais modifié** : on ajoute un fichier
  `NNN-correctif-….sql` derrière. C'est ce qui permet de reconstruire la base
  à partir de zéro, dans l'ordre, sans surprise.
- Chaque fichier est **idempotent quand c'est possible** (`if not exists`) :
  le rejouer ne doit pas tout casser.

## Comment exécuter un fichier

Tableau de bord Supabase → **SQL Editor** → *New query* → coller le contenu
du fichier → **Run**. Vérifier le message vert en bas.

## ⚠ Ne pas confondre avec `supabase/migrations/`

Le dépôt est **relié à Supabase par l'intégration GitHub** (activé le
20/07/2026). Cette intégration surveille un dossier précis :
`supabase/migrations/`. Tout fichier `.sql` déposé **là** est appliqué
automatiquement à la base à chaque push.

Ce dossier `supabase/` **n'existe pas encore** et ne doit pas être créé à la
main : il est produit par la CLI Supabase (`supabase init`, `supabase db pull`)
au **jalon 4**. Créer des migrations à la main avant que l'historique de
migrations soit initialisé provoquerait des conflits (Supabase tenterait de
rejouer des tables déjà créées).

### ✅ Jalon 4 franchi le 20/07/2026 — ce qui a changé

L'historique de migrations est amorcé. `supabase/migrations/` contient une
migration d'état initial, `20260720153000_etat-initial.sql`, déclarée **déjà
appliquée** dans la base. L'intégration GitHub est donc active et sans danger :
au push, elle reconnaît cette version et ne fait rien.

Note de méthode : `supabase db pull` a échoué de façon inexpliquée
(`No schema changes found` alors que les sept tables existent). L'amorçage a été
fait autrement — `supabase db dump --linked` pour produire le fichier, puis
`supabase migration repair --status applied` pour l'inscrire au registre.
Détail au §9 de `_suivi/BDD-cadrage.md`.

## Deux dossiers, deux rôles — ne pas les confondre

À partir de maintenant, la structure de la base existe sous **deux formes**.
C'est voulu.

| Dossier | Rôle | Écrit par |
|---|---|---|
| `bdd/schema/` | La version **lisible**. Fichiers numérotés, commentés ligne à ligne, qui expliquent *pourquoi* chaque table est ainsi. Sert à comprendre, à réviser, et à alimenter la présentation de rentrée | Loïc |
| `supabase/migrations/` | La version **exécutable**. SQL brut, sans commentaires, destiné à la CLI et à l'intégration GitHub | la CLI |

La règle : **toute modification future de structure passe par une migration.**

```
supabase migration new nom-du-changement
```

Cela crée un fichier horodaté dans `supabase/migrations/`. On y écrit le SQL,
on pousse sur GitHub, Supabase l'applique. En parallèle, on continue de tenir
`bdd/schema/` à jour pour la lisibilité — c'est un doublon assumé.

⚠ Ne plus exécuter de SQL de structure à la main dans l'éditeur du tableau de
bord : la base ne le saurait pas, et l'historique mentirait. L'éditeur SQL
reste bon pour **consulter** (des `select`), pas pour modifier.

## Ce que le dump ne contient pas

`pg_dump --schema=public` sauvegarde les sept tables et leurs données. Il ne
touche pas au schéma `auth`, propriété de Supabase, où vivent les sessions
anonymes des élèves.

Conséquence : une restauration dans un projet neuf retrouverait les fiches
élèves, mais plus le lien entre une fiche et la session du navigateur qui l'a
créée. Point ouvert, à traiter au **jalon 5** en même temps que les règles RLS.

## Exploitation courante

Les scripts de sauvegarde et de réveil vivent dans `bdd/outils/`, avec leur
propre notice.
