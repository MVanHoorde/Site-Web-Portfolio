# Volet « base de données » — cadrage et décisions

> Conversation de cadrage du 20/07/2026, rangée dans `_suivi/` le même jour.
> Sert à la fois de **brief pour la suite** et de **matière pour la présentation
> de rentrée**.

---

## 1. Le problème posé

Le site est statique (GitHub Pages). Toute la mémoire du parcours élève vit dans le
`localStorage` du navigateur : perdue en changeant de poste, invisible pour le
professeur. Les hubs SNT contiennent déjà une interface de correction de texte libre
(statut *en attente* → *validé*) qui, aujourd'hui, **fait semblant**.

Objectif du volet : une progression réellement sauvegardée côté serveur, socle commun
aux cours et au futur RPG.

## 1bis. Coordonnées du projet Supabase

| | |
|---|---|
| Nom du projet | `snt-vanhoorde` (créé le 20/07/2026) |
| Reference ID | `ztyvuiaohxekuyjeoaxz` |
| Project URL (base) | `https://ztyvuiaohxekuyjeoaxz.supabase.co` |
| Endpoint REST | `https://ztyvuiaohxekuyjeoaxz.supabase.co/rest/v1/` |
| Région | West EU (Paris) |
| Plan | Free |

⚠ La **Project URL de base** (sans `/rest/v1/`) est ce qu'attendent la
bibliothèque `supabase-js` et le client `progression.js`. Le `/rest/v1/` n'est à
écrire que pour un appel HTTP fait à la main.

Ni le mot de passe de base, ni la clé `service_role` ne figurent dans ce dépôt.
La **clé anonyme** n'est pas un secret : elle apparaîtra en clair dans les pages.

## 2. Architecture retenue

```
Site statique (GitHub Pages, HTML/CSS/JS vanilla)
        │  HTTPS
        ▼
Supabase  ──  PostgreSQL managé, région Francfort
        │     + authentification (jeton de session)
        │     + API générée automatiquement
        │     + RLS (règles d'accès par ligne)
        ▲
        │  se sert et repose son résultat
Worker (PC de Loïc, ou poste allumé en permanence)
        └──  correction IA : API Mistral, ou modèle local sur RTX 5080
```

Point clé : le **worker** n'est pas dans la chaîne du site. Il se réveille, lit les
copies en attente, fait corriger, réécrit le statut. Supabase reste la seule source de
vérité. Aucun port ouvert, aucun VPS nécessaire, IA interchangeable.

## 3. Décisions arrêtées

| Sujet | Décision |
|---|---|
| Hébergement | **Supabase**, plan gratuit, région **West EU (Paris)** — meilleur que Francfort initialement prévu : sol français, latence moindre, argument plus simple devant la direction |
| Cible souveraine | **Clever Cloud** (100 % français, PostgreSQL managé, sauvegarde nuit) — à proposer à l'établissement en septembre |
| Identification | Pseudonyme + code de classe, via **connexions anonymes** Supabase. Aucun email, aucun nom, aucun mot de passe en base |
| Session | Jeton en `localStorage` → reconnaissance automatique d'une fois sur l'autre |
| Postes partagés | Bouton « ce n'est pas moi », pseudo affiché en permanence, case « c'est mon ordinateur » |
| Personnalisation | Avatars + fonds dès le départ (récompenses cosmétiques = monnaie du RPG). Sources libres de droits ou maison |
| Pilote | **Un hub SNT**, une étape, avec un champ de texte libre — cycle complet de bout en bout |
| Modération | Annoncée explicitement dans le hub t0, passages réguliers, messages pédagogiques aux élèves. Limite de caractères sur les champs libres |
| IA | API Mistral (coût annuel estimé : quelques euros au maximum) ou modèle local |
| Sauvegardes | Export hebdomadaire manuel sur disque + copie externe (le plan gratuit n'en fait aucune) |
| Correction assistée | Piste **La Quizinière** (Réseau Canopé, gratuit, français) comme outil d'appoint — pas d'intégration au site |

### Décisions ajoutées le 20/07/2026

| Sujet | Décision |
|---|---|
| Client de base de données | Fichier **partagé** `assets/js/progression.js` — dérogation explicite à la règle « un hub SNT est autonome » (§5 des consignes SNT) |
| Ordre de branchement | **SNT d'abord** (pilote), puis les autres hubs, **puis** les chapitres de physique-chimie |
| Chapitres de PC | **Hors périmètre** pour l'instant. Leur `localStorage` (checklist + verrou SHA-256) reste en place. Migration prévue après le pilote, le RPG concernant aussi les élèves de PC |
| Sécurité du projet | Les trois cases activées à la création : *Data API*, *expose new tables*, **et *Enable automatic RLS*** — toute table naît fermée |
| Intégration GitHub | **Activée à la création.** Sans effet tant que `supabase/` n'existe pas. Sera exploitée au jalon 4, après `supabase init` / `db pull` |
| Emplacement du schéma | `bdd/schema/*.sql`, numérotés, exécutés à la main. **Pas** `supabase/migrations/` avant le jalon 4 (risque de conflit d'historique) |
| Codes d'activité en base | Point médian remplacé par un tiret : `WEB·2b` → `WEB-2b`. L'affichage dans les hubs reste libre. **`CONSIGNES-hub-SNT.md` §14.3 à compléter** |
| Historique des copies | **Conservé.** Chaque rédaction remplacée est archivée automatiquement (déclencheur) dans `reponses_versions`. Objectif pédagogique : l'élève relit ses versions, le professeur voit « tu en es à ta 3ᵉ ». Bouton « voir mes versions » prévu sur le site, non implémenté pour l'instant |
| Code de classe | Option B : code générique, fermé via `actif = false` après la 2ᵉ séance, rouvert à la demande |

## 4. Modèle de données — sept tables

```
classes           id · code (6 car.) · libelle · annee_scolaire · actif
eleves            id · auth_id · pseudo · classe_id · cree_le
                     (unicité : pseudo unique dans une classe)
progression       id · eleve_id · domaine · cle · valeur (jsonb) · maj_le
                     (unicité : eleve + domaine + cle)
evenements        id · eleve_id · type · charge (jsonb) · horodatage · saison
reponses_libres   id · eleve_id · code_activite · version · texte · statut
                     · correction_ia · commentaire_prof · envoye_le · corrige_le
                     (unicité : eleve + code_activite — état COURANT)
reponses_versions id · reponse_id · eleve_id · code_activite · version
                     · texte · statut · correction_ia · commentaire_prof
                     · envoye_le · archive_le      (ajout seul)
sauvegardes       journal des exports (le dump vit hors de la base)
```

**Principes de conception**

- `progression` porte l'**état courant**, `evenements` porte l'**historique**.
  Séparer les deux permet de déclencher les quêtes du RPG sur des événements.
- `domaine` sert d'espace de nommage : `cours`, `deverrouillage`, `rpg`, `profil`.
- Le journal `evenements` est **append-only** : on n'efface jamais.
  Correction d'une triche → événement compensatoire (logique comptable).
  Reset à une date → rejouer les événements jusqu'à cette date.
  Nouvelle année → nouvelle `saison`, l'ancien reste consultable.

**Règle d'or du JSONB** — toujours lire avec une valeur par défaut :

```js
const xp = etat.xp ?? 0;
```

Conséquence : on peut enrichir le JSON toute l'année sans migration ni casse.
Discipline associée : **on ajoute, on ne renomme jamais, on ne supprime jamais**.
Ajouter un champ `"v": 1` dans chaque objet pour les évolutions de format.

## 5. Conflits résolus avec les consignes existantes

| Règle actuelle | Nouvelle formulation | État |
|---|---|---|
| `CONSIGNES-hub-SNT.md` §5 — « `localStorage` interdit » | « Aucune donnée de progression en `localStorage` ; seul le jeton de session y réside » | ✅ appliqué le 20/07/2026 |
| `CONSIGNES-hub-SNT.md` §5 — « aucun asset externe » | Deux ressources partagées autorisées : `fonts.css` et `progression.js` | ✅ appliqué le 20/07/2026 |
| `CONSIGNES-hub-SNT.md` §7 — « ne pas coder en prévision de la phase 2 » | Caduque : la phase 2 est ouverte. Coder contre le contrat de données | ✅ appliqué le 20/07/2026 |
| §7 — « VPS Linux en Europe » | Remplacé par Supabase (apprentissage) puis Clever Cloud (cible). Le VPS reste possible pour le worker, mais n'est pas nécessaire | ✅ appliqué le 20/07/2026 |
| §13 — « ce qui n'est pas encore arrêté » | Encadré de mise à jour : ce qui reste ouvert / ce qui est tranché | ✅ appliqué le 20/07/2026 |

## 6. Deux limites du plan gratuit Supabase

1. **Aucune sauvegarde automatique.** Supabase recommande lui-même l'export
   régulier via sa CLI (`supabase db dump`). Les sauvegardes quotidiennes
   n'arrivent qu'au plan payant (~25 $/mois).
2. **Pause après 7 jours d'inactivité.** Les vacances scolaires déclencheront la
   mise en pause. Les données ne sont pas perdues ; il faut relancer depuis le
   tableau de bord. Parade gratuite : requête quotidienne automatisée.

→ Deux fichiers `.bat` + deux tâches planifiées Windows à produire : **sauvegarde
hebdomadaire** et **réveil quotidien**.

## 7. Prochaines actions, dans l'ordre

1. ✅ Réécrire les §5, §7 et §13 de `CONSIGNES-hub-SNT.md` — fait le 20/07/2026
2. ✅ Créer le compte Supabase (région Paris) et la table `classes` — 20/07/2026
3. ⏳ Schéma SQL — `001` à `005` écrits, validés syntaxiquement (analyseur
   PostgreSQL), rangés dans `bdd/schema/`. **Exécution à confirmer** : `004` doit
   renvoyer 7 lignes, `rls_active = true`, `nb_regles = 0`
4. ⬜ CLI Supabase : scripts `.bat` de sauvegarde et de réveil, puis `supabase init` / `db pull` et bascule vers `supabase/migrations/`
5. ⬜ Poser les règles RLS
6. ⬜ Écrire `assets/js/progression.js` (client partagé)
7. ⬜ Brancher le pilote sur un hub SNT réel

## 8. Notions acquises pendant ce cadrage

*(pour le point récapitulatif sur les apprentissages, et les diapositives de backup)*

- **Table** : un tableau à colonnes typées et à lignes ajoutées au fil de l'eau ;
  un type de chose par table
- **Base de données** : l'ensemble des tables + relations + contraintes + moteur
- **Relation** : une colonne qui renvoie à l'`id` d'une autre table
- **Contrainte** : une règle que la base fait respecter elle-même
- **RLS** (*Row Level Security*) : filtrage des lignes accessibles selon la
  session — la brique de sécurité centrale
- **JWT** (*JSON Web Token*) : jeton signé identifiant la session
- **JSONB** : colonne PostgreSQL contenant un objet JSON interrogeable
- **Migration** : modification de la structure de la base
- **Worker** : programme de fond qui se sert dans la base et y repose son résultat
- **CLI** (*Command Line Interface*) : outil en ligne de commande
- **Dump** : fichier texte reconstituant structure + données
- **Fichier `.bat`** : suite de commandes Windows, avec variables (`set` / `%VAR%`)
- **Facturation au jeton** : entrée + sortie, tarif variable selon le modèle ;
  l'historique complet est renvoyé à chaque tour d'une conversation

### Ajouts du 20/07/2026

- **UUID** : identifiant unique tiré au hasard, non devinable — préféré à un
  entier auto-incrémenté pour tout ce qui est exposé au navigateur
- **Clé anonyme** (*anon key*) : carte d'accès publique, visible dans le code
  source ; ce n'est pas elle qui protège les données, ce sont les règles RLS
- **Clé `service_role`** : clé secrète qui contourne toutes les règles RLS —
  jamais dans le dépôt, jamais dans une page, uniquement dans le worker
- **Activer RLS avant d'écrire du code** : une table fermée par défaut, chaque
  ouverture devient un choix conscient et écrit
- **`GRANT` vs RLS** : le `GRANT` autorise ou refuse une **table** entière ;
  la RLS filtre **ligne par ligne**. Les deux sont nécessaires, ils ne
  répondent pas à la même question
- **Contrainte `check`** : une règle vérifiée par la base à chaque écriture
- **Clé étrangère** : `on delete cascade` (effacer le parent efface l'enfant)
  vs `on delete restrict` (refuser d'effacer un parent encore référencé)
- **Index partiel** : un index qui ne couvre qu'une partie des lignes
  (`where statut = 'en_attente'`) — minuscule et exactement adapté à une requête
- **Trigger** (déclencheur) : du code que la base exécute d'elle-même à chaque
  écriture — sert à ce qu'on ne puisse pas « oublier » de mettre un champ à jour
- **Upsert** : insérer, ou mettre à jour si la ligne existe déjà
  (`on conflict … do update`) — repose sur une contrainte d'unicité
- **Idempotent** : opération qu'on peut rejouer sans changer le résultat
  (`create table if not exists`, `drop … if exists` suivi de `create`)
- **Vue** : une requête enregistrée sous un nom ; elle ne stocke rien, elle se
  recalcule à chaque appel
- **`security_invoker`** : option indispensable sur une vue Supabase — sans
  elle, la vue s'exécute avec les droits de son propriétaire et **contourne la
  RLS** des tables qu'elle lit
- **Dénormalisation assumée** : recopier une colonne déjà déductible par
  jointure, pour simplifier les règles RLS et les requêtes
