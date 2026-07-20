# `bdd/outils/` — scripts d'exploitation de la base

Scripts Windows (`.bat`) qui font tourner la base au quotidien.
Ils ne contiennent **aucun secret** et peuvent être poussés sans risque.

## Les fichiers

| Fichier | Rôle |
|---|---|
| `sauvegarde-hebdo.bat` | Écrit un fichier `.sql` complet du schéma `public` sur le disque, puis inscrit une ligne dans la table `sauvegardes` |
| `config-exemple.bat` | Modèle de configuration. **Ne jamais remplir ce fichier-ci** : le recopier hors du dépôt |
| `reveil-quotidien.bat` | *(jalon 4c — à venir)* |

## Le fichier de configuration

Les scripts lisent leurs paramètres dans :

```
%USERPROFILE%\.supabase-vanhoorde\config.bat
```

Cet emplacement est **hors du dépôt Git**. C'est ce qui garantit que le mot
de passe de la base ne peut pas partir sur GitHub par inadvertance, même en
cas de `git add .` distrait.

Trois variables y sont définies :

- `SUPA_URL` — adresse de la base, sans mot de passe (Session pooler, Paris)
- `PGPASSWORD` — le mot de passe, lu automatiquement par `pg_dump` et `psql`
- `SUPA_DEST` — dossier de destination des sauvegardes

Le mot de passe est fourni **à part** de l'adresse, et non inséré dedans :
un mot de passe contenant `@`, `:` ou `/` casserait l'adresse.

## Emplacements retenus

| | |
|---|---|
| Sauvegardes | `C:\Sauvegardes-SNT\` |
| Journal local | `C:\Sauvegardes-SNT\journal.log` |
| Configuration | `%USERPROFILE%\.supabase-vanhoorde\config.bat` |
| Copie externe | *à décider* |

## Ce que le dump contient — et ne contient pas

`pg_dump --schema=public` sauvegarde les sept tables, leurs contraintes,
leurs déclencheurs et leurs données.

Il ne sauvegarde **pas** le schéma `auth`, propriété de Supabase, où vivent
les sessions anonymes des élèves. Conséquence à connaître : une restauration
dans un projet neuf retrouverait les fiches élèves, mais plus le lien entre
une fiche et la session du navigateur qui l'a créée. Point ouvert, à traiter
au jalon 5.

## Codes de sortie

| Code | Signification |
|---|---|
| `0` | Tout s'est bien passé |
| `1` | Échec — pas de fichier de sauvegarde produit |
| `2` | Fichier produit, mais trace en base non inscrite |
