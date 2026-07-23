# ⛔ Abandonné le 23/07/2026 — la frise passe sur Supabase

**Ce serveur ne sera pas développé.** Décision de Loïc : la frise ES est
traitée « de la même manière que les cours de SNT », c'est-à-dire dans la
**même base Supabase**.

## Pourquoi

Ce dossier demandait encore, avant de pouvoir recevoir une seule copie :
un hébergement (le README envisageait d'**exposer le PC personnel sur
Internet**), une authentification enseignante, HTTPS, une purge de fin
d'année, des sauvegardes, une journalisation, un registre de traitement.

Supabase fournit les six, et le socle SNT les a déjà éprouvés. Maintenir
deux backends pour la même finalité — stocker des copies pseudonymisées,
les faire pré-corriger localement, ne jamais produire de note — c'était
deux fois le travail, deux fois le dossier RGPD, et une surface de risque
en plus juste avant la rentrée.

## Où est passé quoi

| Ce qui était ici | Où c'est maintenant |
|---|---|
| Le modèle de données (contributions, tirages) | `bdd/schema/007-frise-es.sql` |
| Les règles d'accès | mêmes policies RLS que la SNT, dans le même fichier |
| L'auth élève | comptes Supabase, code pseudonyme `E-07` |
| L'auth enseignant | clé `service_role`, depuis le PC de Loïc |
| La pré-correction | `ia-snt/` — même moteur, autre grille |
| L'export CSV | requête `select` depuis le PC |

## Ce qui reste vrai et ne doit pas se perdre

- **Pseudonymisation à la source** : la base ne connaît que des codes.
  La table code↔nom vit sur le PC de Loïc.
- **Aucun champ note, nulle part.** AI Act art. 6(3) : la pré-correction
  est une tâche préparatoire, le système n'évalue jamais à la place de
  l'enseignant.
- Données minimales, purge en fin d'année scolaire, registre de
  traitement à tenir, **DPD de l'établissement à prévenir avant la mise
  en service réelle**.
- Test de charge à prévoir quand même : 35 élèves simultanés sur le
  tirage. Supabase encaisse, mais la page doit gérer les collisions.

## Le dossier lui-même

`server.js` est conservé pour mémoire (il documente le contrat
d'interface qui a servi à écrire `007-frise-es.sql`). Une fois la frise
branchée et testée, il peut partir :

```bash
git rm -r serveur-frise/
```
