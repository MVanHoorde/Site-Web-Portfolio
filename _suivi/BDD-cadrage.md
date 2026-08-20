# Volet « base de données » — cadrage et décisions

> Conversation de cadrage du 20/07/2026, rangée dans `_suivi/` le même jour.
> Sert à la fois de **brief pour la suite** et de **matière pour la présentation
> de rentrée**.
>
> **⚠ Mise à jour du 22/07/2026 — virage anonyme → comptes.** L'identification par
> *connexions anonymes* (envisagée les 20-21/07) a été **abandonnée** au profit de
> **comptes par identifiant + mot de passe** choisis par l'élève, pour garantir la
> **portabilité maison↔lycée**. Mots de passe hachés (on *réinitialise*, on ne lit
> jamais). Le socle base de données est **exécuté et le pilote prouvé de bout en
> bout** (voir §7). Les mentions « anonyme » ci-dessous ont été corrigées ; si une
> subsiste, c'est la version « comptes » qui fait foi.

---

## 1. Le problème posé

Le site est statique (GitHub Pages). Toute la mémoire du parcours élève vit dans le
`localStorage` du navigateur : perdue en changeant de poste, invisible pour le
professeur. Les séquences SNT contiennent déjà une interface de correction de texte libre
(statut *en attente* → *validé*) qui, aujourd'hui, **fait semblant**.

Objectif du volet : une progression réellement sauvegardée côté serveur, socle commun
aux cours et au futur RPG.

## 1bis. Coordonnées du projet Supabase

| | |
|---|---|
| Nom du projet | `pedagogie-vanhoorde` (créé le 20/07/2026) |
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

### Emplacements locaux (PC de Loïc, hors dépôt)

| | |
|---|---|
| Dépôt Git | `C:\Users\Utilisateur\Desktop\Clone Git\Site-Web-Portfolio` |
| Sauvegardes | `C:\Sauvegardes-SNT\` |
| Journaux | `C:\Sauvegardes-SNT\journal.log` · `reveil.log` |
| Configuration des scripts (contient le mot de passe) | `%USERPROFILE%\.supabase-vanhoorde\config.bat` |
| Chaîne de connexion | Session pooler, `aws-0-eu-west-3.pooler.supabase.com:5432` |

## 2. Architecture retenue

```
Site statique (GitHub Pages, HTML/CSS/JS vanilla)
        │  HTTPS
        ▼
Supabase  ──  PostgreSQL managé, région West EU (Paris)
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
| Identification | **Compte par identifiant + mot de passe** choisis par l'élève (virage du 22/07/2026, pour la portabilité maison↔lycée). L'identifiant — minuscules, chiffres, tirets — fabrique une adresse interne `identifiant@snt.local`, jamais envoyée. Mot de passe **haché** par Supabase. Aucun nom réel, aucune adresse réelle en base |
| Session | Jeton en `localStorage` (reconnaissance auto sur le même appareil) **et** reconnexion par identifiant + mot de passe depuis n'importe quel appareil (portabilité maison↔lycée) |
| Postes partagés | Modale d'accueil à **chaque arrivée** (« content de te revoir » / « ce n'est pas toi ? »), **badge « connecté comme… » permanent**, et **déconnexion qui recharge la page** (efface de l'écran le travail de l'élève précédent) |
| Personnalisation | Avatars + fonds dès le départ (récompenses cosmétiques = monnaie du RPG). Sources libres de droits ou maison |
| Pilote | **Une séquence SNT**, une étape, avec un champ de texte libre — cycle complet de bout en bout |
| Modération | Annoncée explicitement dans la séquence t0, passages réguliers, messages pédagogiques aux élèves. Limite de caractères sur les champs libres |
| IA | API Mistral (coût annuel estimé : quelques euros au maximum) ou modèle local |
| Sauvegardes | Export hebdomadaire manuel sur disque + copie externe (le plan gratuit n'en fait aucune) |
| Correction assistée | Piste **La Quizinière** (Réseau Canopé, gratuit, français) comme outil d'appoint — pas d'intégration au site |

### Décisions ajoutées le 20/07/2026

| Sujet | Décision |
|---|---|
| Client de base de données | Fichier **partagé** `assets/js/progression.js` — dérogation explicite à la règle « une séquence SNT est autonome » (§5 des consignes SNT) |
| Ordre de branchement | **SNT d'abord** (pilote), puis les autres séquences, **puis** les chapitres de physique-chimie |
| Chapitres de PC | **Hors périmètre** pour l'instant. Leur `localStorage` (checklist + verrou SHA-256) reste en place. Migration prévue après le pilote, le RPG concernant aussi les élèves de PC |
| Plafond d'avance SNT | **Écrit le 20/08/2026**, fichier `bdd/schema/013-verrou-progression.sql`. Deux colonnes sur `classes` et une fonction `security definer` — pas de table, pas de policy nouvelle. Le curseur n'est pas stocké : il se déduit de `seances_faites`, comme le prévoit la décision du 31/07 |
| Livret CFA | **Branché le 19/08/2026.** Aucune table créée, aucune migration : la progression du livret s'écrit dans `progression`, domaine `cours`, clés `cfa-o00` … `cfa-o16`, **une ligne par fiche** dont la valeur est `{ v, champs, fait }`. Les rédactions ne passent PAS par `reponses_libres` : sur ce livret elles sont des brouillons personnels, pas des copies à corriger. Deux codes de classe ouverts — `CFA26A` (BTS MMCM) et `MVT26A` (bac pro MVTR), fichier `bdd/schema/012-classes-cfa.sql` |
| Sécurité du projet | Les trois cases activées à la création : *Data API*, *expose new tables*, **et *Enable automatic RLS*** — toute table naît fermée |
| Intégration GitHub | **Activée à la création.** Sans effet tant que `supabase/` n'existe pas. Sera exploitée au jalon 4, après `supabase init` / `db pull` |
| Emplacement du schéma | `bdd/schema/*.sql`, numérotés, exécutés à la main. **Pas** `supabase/migrations/` avant le jalon 4 (risque de conflit d'historique) |
| Codes d'activité en base | Point médian remplacé par un tiret : `WEB·2b` → `WEB-2b`. L'affichage dans les séquences reste libre. **`CONSIGNES-sequence-SNT.md` §14.3 à compléter** |
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
| `CONSIGNES-sequence-SNT.md` §5 — « `localStorage` interdit » | « Aucune donnée de progression en `localStorage` ; seul le jeton de session y réside » | ✅ appliqué le 20/07/2026 |
| `CONSIGNES-sequence-SNT.md` §5 — « aucun asset externe » | Deux ressources partagées autorisées : `fonts.css` et `progression.js` | ✅ appliqué le 20/07/2026 |
| `CONSIGNES-sequence-SNT.md` §7 — « ne pas coder en prévision de la phase 2 » | Caduque : la phase 2 est ouverte. Coder contre le contrat de données | ✅ appliqué le 20/07/2026 |
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

1. ✅ Réécrire les §5, §7 et §13 de `CONSIGNES-sequence-SNT.md` — fait le 20/07/2026
2. ✅ Créer le compte Supabase (région Paris) et la table `classes` — 20/07/2026
3. ⏳ Schéma SQL — `001` à `005` écrits, validés syntaxiquement (analyseur
   PostgreSQL), rangés dans `bdd/schema/`. **Exécution à confirmer** : `004` doit
   renvoyer 7 lignes, `rls_active = true`, `nb_regles = 0`
4. ✅ CLI Supabase, scripts `.bat`, tâches planifiées, historique de
   migrations — fait le 20/07/2026 (détail au §9)
5. ✅ Poser les règles RLS — exécutées le **22/07/2026** (`006-rls-et-fonctions.sql`)
   puis réconciliées dans l'historique de migrations (local = remote). Préalables
   faits : **provider Email activé, Confirm email désactivé** (les adresses
   `@snt.local` sont synthétiques, jamais envoyées), **connexions anonymes
   désactivées** ; **clé anon** relevée. Principe retenu : chaque élève ne voit que ses lignes ;
   `classes` et `sauvegardes` restent **totalement fermées** (sinon la liste des
   codes de classe serait publique) ; on y accède par deux fonctions
   `security definer` — `rejoindre_classe()` et `ma_session()`. L'élève ne peut
   **pas** écrire `statut`, `correction_ia` ni `commentaire_prof` : c'est le
   worker, en `service_role`, qui les remplit.
6. ✅ `assets/js/progression.js` (client partagé) — réécrit le **22/07/2026** :
   HTTP nu via `fetch` (pas de `supabase-js`, qui n'existe qu'en CDN — RGPD) ;
   **comptes par identifiant + mot de passe** (`creerCompte` / `seConnecter`,
   adresse interne `identifiant@snt.local`) ; jeton en `localStorage` **et rien
   d'autre** ; repli silencieux si la base est absente (une séquence reste
   utilisable sans enregistrement). Injecte aussi la **modale d'accueil**
   (créer / se connecter / continuer en invité), le **bandeau invité** et le
   **badge « connecté comme… »**. `CLE_ANON` renseignée.
7bis. ✅ **Livret CFA branché le 19/08/2026.** `cfa-livret.js` réécrit autour
   d'un *dépôt* à deux régimes : connecté → base ; sans compte → localStorage,
   entier, comme avant. Le travail fait sans compte est **repris** à la première
   connexion (la base gagne toujours en cas de conflit, et les clés locales
   reprises sont effacées). Dix-neuf assertions passées en Chromium sans
   interface, chemin d'erreur compris. `bdd/schema/012-classes-cfa.sql` a été
   **exécuté le 20/08/2026** : les deux codes de classe existent, les apprentis
   peuvent créer leur compte.

   ⚠ **`bdd/schema/013-verrou-progression.sql` reste à exécuter** — le plafond
   d'avance SNT : deux colonnes sur `classes` (`avance_max`, `ouvert_jusqu_au`)
   et la fonction `mon_plafond()`. Tant qu'il n'est pas passé, la fonction
   n'existe pas et **rien n'est fermé** : le repli est volontaire, mais le
   verrou ne rend aucun service. 🔴 **Aucune policy n'est ajoutée sur
   `seances_faites`** : la table porte le cahier de textes (notes, travail
   donné), elle reste fermée aux élèves. Le fichier n'a **pas** été copié dans
   `supabase/migrations/` — ce dossier s'applique tout seul au push, et le
   chemin d'exécution est une décision de Loïc, pas un effet de bord d'une
   fusion.

7. ✅ Pilote branché et **prouvé de bout en bout** le 22/07/2026 : compte
   `leproftest` (classe démo `SNT26A`) → réponse `NET-1a` arrivée dans
   `reponses_libres` (`statut = en_attente`). Câblé sur **t1 Internet** et **t0** ;
   reste à généraliser aux 6 autres séquences.

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
- **« Clé anon » ≠ « connexions anonymes »** (à ne jamais confondre) : la *clé
  anon* est la carte d'accès API publique, toujours utilisée ; les *connexions
  anonymes* étaient une méthode de login, **abandonnée le 22/07/2026** au profit
  des comptes identifiant + mot de passe (portabilité maison↔lycée)
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

### Ajouts du jalon 4 (outillage, 20/07/2026)

- **Gestionnaire de paquets** : un magasin d'applications en ligne de commande.
  *Scoop* sous Windows, l'équivalent d'`apt` sous Linux ou de *Homebrew* sur Mac
- **Bucket** (Scoop) : un catalogue de recettes d'installation. Celui de
  Supabase est officiel et s'ajoute à la main
- **Session pooler** : un intermédiaire qui reçoit les connexions à la place du
  serveur. Sur Supabase, c'est la seule voie joignable en IPv4 — la connexion
  directe est en IPv6, que toutes les box ne gèrent pas
- **Variable d'environnement** : une valeur nommée que le système transmet aux
  programmes qu'il lance. `PGPASSWORD` est lue d'elle-même par `pg_dump` et
  `psql` : c'est ce qui permet de tenir le mot de passe hors de l'adresse de
  connexion, et donc à l'abri des caractères spéciaux
- **Code de sortie** : le nombre qu'un programme renvoie en terminant. `0` veut
  dire « tout va bien », toute autre valeur signale un problème. C'est ce que
  teste `if errorlevel` dans un `.bat`
- **`timestamptz`** : un instant stocké en UTC, indépendamment du fuseau. Règle
  associée : la base stocke en UTC, l'affichage convertit en heure locale.
  Motif : les changements d'heure rendraient l'ordre chronologique ambigu — or
  le journal `evenements` est fait pour être rejoué dans l'ordre
- **Historique de migrations** : une table cachée **dans la base**, qui liste
  les migrations déjà appliquées. Le renversement qui compte : ce n'est plus
  l'auteur qui se souvient de ce qu'il a exécuté, c'est la base qui tient le
  registre
- **Shadow database** (base fantôme) : une base jetable que la CLI monte le
  temps de comparer deux structures, puis efface. C'est elle qui impose Docker
- **`migration repair`** : déclarer une migration comme appliquée sans
  l'exécuter. Sert exactement à amorcer un historique sur une base préexistante
- **Tâche planifiée Windows** : `Register-ScheduledTask` en PowerShell plutôt
  que l'interface graphique — moins d'erreurs de saisie sur les chemins
  contenant des espaces, et l'option de rattrapage accessible d'une ligne

---

## 9. Jalon 4 — outillage local (fait le 20/07/2026)

### Ce qui tourne désormais tout seul

| Tâche planifiée Windows | Quand | Ce qu'elle fait |
|---|---|---|
| `Supabase - sauvegarde hebdomadaire` | mercredi 18 h | `pg_dump` du schéma `public` vers `C:\Sauvegardes-SNT` + une ligne dans la table `sauvegardes` |
| `Supabase - reveil quotidien` | tous les jours 12 h 30 | une requête sur `classes`, pour que le compteur d'inactivité reparte de zéro |

Les deux sont créées avec `-StartWhenAvailable` : une tâche manquée parce que le
PC était éteint se rattrape au démarrage suivant.

⚠ **Le rattrapage sauve la sauvegarde, pas le réveil.** Un réveil en retard ne
réveille rien. Si le PC reste éteint plus de sept jours d'affilée — vacances —
le projet est mis en pause. Données intactes, relance d'un clic au tableau de
bord, mais le site ne répond plus entre-temps. La doublure GitHub Actions a été
**écartée en connaissance de cause** : le PC hébergera de toute façon le worker
de correction IA, dont les requêtes réveilleront la base d'elles-mêmes.

### Outils installés

Scoop · CLI Supabase 2.109.1 · outils PostgreSQL 18.4 (`pg_dump`, `psql`) ·
Docker Desktop.

Docker ne sert qu'aux commandes de comparaison de schéma (`db pull`, `db diff`,
`db dump`). Les deux tâches planifiées appellent `pg_dump` et `psql`
directement : elles fonctionnent Docker éteint. C'est délibéré — une tâche de
3 h du matin qui dépend d'un service graphique lancé est fragile par
construction.

### Historique de migrations — comment il a été amorcé

`supabase db pull` a échoué de façon inexpliquée : après avoir monté sa base
fantôme et comparé, il a répondu `No schema changes found` alors que les sept
tables existent. Cause non élucidée.

Contournement retenu, qui n'utilise aucune comparaison :

```
supabase db dump --linked -f supabase/migrations/20260720153000_etat-initial.sql
supabase migration repair --status applied 20260720153000
```

La première commande fait décrire la base par elle-même. La seconde inscrit
cette version dans l'historique distant **en la déclarant déjà appliquée** :
rien n'est exécuté, une ligne est écrite dans un registre.

`supabase migration list` affiche désormais la version dans les deux colonnes.

### Conséquence : l'intégration GitHub est enfin active

Au prochain push, Supabase lira `supabase/migrations/`, y trouvera la version
`20260720153000`, la reconnaîtra comme appliquée, et ne fera rien. C'est le
résultat voulu : sans le `repair`, l'intégration aurait tenté de recréer sept
tables existantes.

Nouveau cycle de travail à partir de maintenant : écrire un fichier de
migration → pousser sur GitHub → Supabase applique.

### Point ouvert reporté au jalon 5

Le dump ne couvre pas le schéma `auth`, propriété de Supabase, où vivent les
**comptes élèves** (identifiant + mot de passe haché). Une restauration dans un
projet neuf retrouverait les fiches élèves mais plus les comptes qui les
authentifient : les élèves devraient recréer un compte, ou être réinscrits. À
garder en tête pour toute migration vers un autre projet (ex. Clever Cloud).
