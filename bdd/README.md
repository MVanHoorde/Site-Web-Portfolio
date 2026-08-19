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

## Ce que contient `schema/`

| Fichier | Objet |
|---|---|
| `001` → `005` | Les sept tables, leurs contraintes, l'historique des versions |
| `006` | Les règles RLS et les deux fonctions `security definer` |
| `007` → `011` | Frise ES, rôle enseignant, suivi de classe, correction des copies |
| `012` | Les deux codes de classe du **livret CFA**. Aucune table, aucune colonne : le livret écrit dans `progression`, domaine `cours`, clés `cfa-o00` … `cfa-o16` |

## ⚠ Ne pas confondre avec `supabase/migrations/`

Le dépôt est **relié à Supabase par l'intégration GitHub** (activé le
20/07/2026). Cette intégration surveille un dossier précis :
`supabase/migrations/`. Tout fichier `.sql` déposé **là** est appliqué
automatiquement à la base à chaque push.

Ce dossier est **produit par la CLI Supabase**, jamais écrit à la main.

L'historique de migrations est amorcé : `supabase/migrations/` contient une
migration d'état initial, `20260720153000_etat-initial.sql`, déclarée **déjà
appliquée** dans la base, puis `20260722121414_rls-et-fonctions.sql`.
L'intégration GitHub est donc active et sans danger : au push, elle reconnaît
ces versions et ne rejoue rien.

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
touche pas au schéma `auth`, propriété de Supabase, où vivent les **comptes
élèves** (identifiant + mot de passe haché).

Conséquence : une restauration dans un projet neuf retrouverait les fiches
élèves, mais plus les comptes qui les authentifient — les élèves devraient
recréer un compte, ou être réinscrits. À garder en tête pour toute migration
de projet.

## Exploitation courante

Les scripts de sauvegarde et de réveil vivent dans `bdd/outils/`, avec leur
propre notice.
