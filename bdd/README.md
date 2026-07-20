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

En clair, jusqu'au jalon 4 :

- on écrit le SQL dans `bdd/schema/` ;
- on l'exécute **à la main** dans l'éditeur SQL ;
- `supabase/` reste absent, donc l'intégration GitHub tourne à vide — sans
  danger.

Au jalon 4, `supabase db pull` lira la base réelle et en fera une migration
propre : à partir de là, le pilotage passe par `supabase/migrations/`.
