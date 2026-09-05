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
| `013` | Le **plafond d'avance** des élèves SNT : deux colonnes sur `classes` (`avance_max`, `ouvert_jusqu_au`) et la fonction `mon_plafond()`. 🔴 **Aucune policy n'est ajoutée sur `seances_faites`** : la table porte le cahier de textes (notes, travail donné), elle reste fermée aux élèves — la fonction ne rend que des couples (séquence, séance) |
| `014` | Le statut **`partage`** sur `reponses_libres` : les **réponses personnelles**, lues par le professeur, jamais corrigées ni notées. Aucune table, aucune colonne — une valeur de statut de plus, les deux policies d'écriture de l'élève, et le déclencheur d'archivage qui cesse de tout ramener à `en_attente`. 🔴 Sans ce dernier point, une réponse personnelle rectifiée basculerait **toute seule** dans la file de correction |

| `015` | 🔴 **PROPOSITION, non exécutée.** Ce qu'un élève peut lire de sa correction. `correction_ia` mêle ce qui lui est destiné (verdict, message, « pour aller plus loin ») et ce qui ne l'est pas (`tri.raisons`, `a_verifier_par_le_prof`, les constats critère par critère). Le fichier expose **trois voies** et n'en exécute aucune : le choix appartient à Loïc. Côté client, `progression.js` ne demande déjà plus que les trois champs utiles — hygiène, pas verrou |

| `016` | 🔴 Le **cloisonnement par enseignant** : la table `enseignants_classes`, trois fonctions de portée, **9 policies** réécrites et les **3 fonctions de correction** du `010` resserrées. Ces trois dernières sont le point qui n'allait pas de soi : `security definer`, elles contournent la RLS, et fermer la lecture ne suffisait donc pas. Pose aussi `classes_regler_prof`, la policy d'écriture qui **manquait depuis le 008** — sans elle le réglage du plafond d'avance ne s'écrivait jamais, en affichant un succès |
| `017` | Les **14 groupes de SNT de 2026-2027**, le renommage de la classe pilote en `SNTDEM` pour libérer `SNT26A`, les cinq lignes de rattachement, et la suppression de la classe de test |

✅ **Historique de migrations réaligné le 04/09/2026.** `supabase migration list`
répond désormais **11 migrations locales, 0 absente du registre distant**.

Ce qui s'était accumulé : `012`, `013` et `014` avaient été exécutés à la main
sans contrepartie ici, puis `016` et `017` s'y sont ajoutés. Les cinq fichiers
ont été déposés, horodatés à leur date d'exécution réelle, puis déclarés
appliqués — aucun SQL n'a été rejoué, seul un registre a été écrit.

🔴 **Le registre en disait plus que cette page.** On croyait l'historique arrêté
au `011` ; en réalité **le `011` lui-même n'y avait jamais été inscrit**
(`20260801103000`, la bibliothèque de réponses types, exécutée à la main le
01/08). Il y avait donc **six** migrations à réparer, pas cinq. Leçon : l'état de
l'historique se lit avec `supabase migration list`, jamais dans un fichier de
doc — le registre vit dans la base, et c'est lui qui fait foi.

```
supabase migration list      # le seul état qui fasse foi
```

## ⚠ Ne pas confondre avec `supabase/migrations/`

Le dépôt est **relié à Supabase par l'intégration GitHub** (activé le
20/07/2026). Cette intégration surveille un dossier précis :
`supabase/migrations/`. Tout fichier `.sql` déposé **là** est appliqué
automatiquement à la base à chaque push.

🔴 **Ce dossier n'est PAS produit par la CLI, contrairement à ce que ce
fichier a longtemps affirmé.** Vérifié le 04/09/2026 : `008`, `009` et `011`
sont **identiques octet pour octet** à leur jumeau de `bdd/schema/`. Seul
l'**horodatage** vient de la CLI (`supabase migration new`) ; le contenu est une
copie du fichier lisible. C'est la pratique réelle depuis le `007`, et elle est
saine — un seul texte à relire, aucune divergence possible entre les deux
dossiers. Ce qui reste vrai : on ne **modifie** jamais un fichier déjà déposé
là.

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
