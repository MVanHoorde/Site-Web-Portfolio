# `bdd/outils/` — scripts d'exploitation de la base

Scripts Windows (`.bat`) qui font tourner la base au quotidien.
Ils ne contiennent **aucun secret** et peuvent être poussés sans risque.

## Les fichiers

| Fichier | Rôle |
|---|---|
| `sauvegarde-hebdo.bat` | Écrit un fichier `.sql` complet du schéma `public` sur le disque, puis inscrit une ligne dans la table `sauvegardes` |
| `config-exemple.bat` | Modèle de configuration. **Ne jamais remplir ce fichier-ci** : le recopier hors du dépôt |
| `reveil-quotidien.bat` | Pose une requête triviale à la base, une fois par jour, pour empêcher la mise en pause du plan gratuit — et mesure l'occupation des quotas (voir plus bas) |
| `occupation-ligne.sql` | La mesure d'occupation des quotas en **une ligne**, lue chaque jour par `reveil-quotidien.bat` |
| `occupation.sql` | Le **détail** (plus grosses tables, photos par séquence) et la **procédure de purge**. `supabase db query --linked -f bdd/outils/occupation.sql -o table` |

## Surveiller les quotas (depuis le 06/10/2026)

Le plan gratuit offre **500 Mo de base** (partagés par tout : réponses,
progression, classes, Boîte à cartes, collègues) et **1 Go de fichiers** (photos
déposées par les élèves, stockage `depots` ; photos de la Boîte à cartes,
`leitner`). Trois rappels, sans rien avoir à retenir :

1. **Chaque jour**, le réveil écrit une ligne dans `occupation.log` :
   `2026-10-06 base=17Mo/500 fichiers=2Mo/1024 depots=0Mo etat=OK` ;
2. **au-delà de 70 %** d'un quota (`etat=ALERTE`), il pose
   `ALERTE-QUOTA-SUPABASE.txt` **sur le Bureau** — le fichier revient chaque
   jour tant que le seuil est dépassé ;
3. **`node verifier.mjs`** relit la dernière ligne à chaque session : il affiche
   l'occupation, relaie l'alerte, signale une mesure de plus de 4 jours (tâche
   arrêtée), et **de juin à août** rappelle la **purge de fin d'année** des
   photos déposées.

🔴 Une photo ne s'efface **pas** en SQL (Supabase l'interdit, pour ne pas laisser
de fichier orphelin) : tableau de bord → Storage, ou `supabase storage rm` —
voir `occupation.sql`. Les photos ne sont **pas** dans la sauvegarde
hebdomadaire : une purge est définitive.

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
les **comptes élèves** (identifiant + mot de passe haché). Conséquence à
connaître : une restauration dans un projet neuf retrouverait les fiches
élèves, mais plus les comptes qui les authentifient — les élèves devraient
recréer un compte, ou être réinscrits.

## Codes de sortie

| Code | Signification |
|---|---|
| `0` | Tout s'est bien passé |
| `1` | Échec — pas de fichier de sauvegarde produit |
| `2` | Fichier produit, mais trace en base non inscrite |

## Journaux

| Fichier | Contenu |
|---|---|
| `C:\Sauvegardes-SNT\journal.log` | une ligne par sauvegarde hebdomadaire |
| `C:\Sauvegardes-SNT\reveil.log` | une ligne par réveil quotidien |
| `C:\Sauvegardes-SNT\occupation.log` | une ligne par jour : occupation de la base et des fichiers |
