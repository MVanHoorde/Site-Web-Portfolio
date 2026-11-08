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
| `018` | ✅ **Exécuté le 13/09/2026** (éprouvé en local le même jour). 🔴 Pas encore copié dans `supabase/migrations/` ni inscrit au registre. Les **espaces** du tableau de bord (`classes.espace` : `snt`, `es1`, `est`, `pc2`, `cfa`) et **un compte dans plusieurs classes** (table `eleves_classes`, fonction `rejoindre_autre_classe()`, un seul groupe SNT par élève). La lecture enseignant est cloisonnée **par famille** : la progression et les absences sur le préfixe de leur clé (`famille_de_cle()`), les copies sur les seules classes SNT et ES. `mon_plafond()` cherche la classe SNT de l'élève. Les cinq classes de Loïc hors SNT naissent **fermées** ; son rattachement (§8) est **en commentaire**, à jouer avec le lot 2 du tableau de bord. Banc d'essai : chaîne `001`→`017` rejouée sur PostgreSQL 18, `018` appliquée deux fois, **36 contrôles d'intrusion passés** |
| `019` | La **mise en service** des espaces : le rattachement de Loïc à ses sept classes hors SNT (le §8 du `018`, retrouvé par `SNTDEM`) et l'**ouverture** des cinq classes aux inscriptions. Aucune structure. S'arrête **avant** d'ouvrir quoi que ce soit si `SNTDEM` n'a pas exactement un enseignant. Éprouvé sur la chaîne `001`→`019`, rejoué deux fois, cas d'échec compris |
| `020` | Les **quatre classes des deux collègues** — `ES1R05`, `ES1R06` (enseignement scientifique de 1re), `APCAST` et `APHUSS` (deux groupes d'**AP** de physique-chimie) — plus leurs deux rattachements, en commentaire comme au `017`. Aucune structure : il s'exécute dans l'éditeur SQL. 🔴 Les codes d'AP portent le **nom de la collègue**, seule exception du dépôt à « la base ne porte pas d'annuaire » : un groupe d'AP ne correspond à aucune classe de 2nde. Éprouvé sur PostgreSQL, rejoué deux fois |
| `021` | ✅ **Exécuté le 03/10/2026** par Loïc dans le SQL Editor. La table **`signalements`** — le bouton « J'ai vu un bug » des pages de cours. Élève connecté : il écrit les siens, ne les relit pas. Enseignant : lit, marque traité (seule colonne modifiable), supprime — ceux des élèves de ses classes **dans la famille de la page** (`mon_eleve_pour`, 018). Déclencheur : vingt signalements par élève et par jour. 🔴 **Pas éprouvé sur la chaîne locale** (le banc PostgreSQL n'a pas pu tourner le 03/10) : il reprend tel quel les fonctions et la forme des policies du `011` et du `018`. Copié dans `supabase/migrations/20261003150000_signalements.sql`, inscrit au registre |
| `022` | 🆕 **Boîte à cartes (Leitner)**, l'application de flashcards publiée sur `mvanhoorde.github.io/Leitner/`, qui se connecte avec les comptes du site. 🔴 **Purement additif** : quatre tables `leitner_paquets`, `leitner_cartes`, `leitner_etats`, `leitner_profils`, des fonctions préfixées `leitner_`, le stockage privé `leitner` (photos, `<auth uid>/…`, 800 Ko, 150 par compte). Rattaché au **compte** (`auth.users`), pas à la fiche élève : un enseignant garnit la bibliothèque commune (`public = true`, réservé à `est_enseignant()`). Chacun lit et écrit ses lignes ; tout compte lit les paquets publics ; un enseignant **lit** (sans écrire) ce que font les élèves de ses classes, toutes familles confondues (`leitner_mon_eleve`). Plafonds : 300 paquets, 5 000 cartes par compte. Éprouvé le 04/10 sur la chaîne `001`→`021` (PostgreSQL 18, Auth et Storage simulés), appliqué deux fois, **21 contrôles d'intrusion passés**. Copié dans `supabase/migrations/20261004150000_leitner.sql`, appliqué par l'intégration GitHub au push |
| `023` | Le groupe d'**AP « Boîte à cartes »** (`APLEIT`, espace `pc2`, ouvert) et son rattachement à Loïc, retrouvé par `SNTDEM` comme au `019` — s'arrête sans rien écrire sinon. Aucune structure : comme le `020`, il s'exécute dans l'éditeur SQL ou par `supabase db query --linked -f`. Un élève qui a déjà un compte ajoute le groupe depuis l'application (« Mon compte », ou le champ « Code du groupe » à la connexion), par `rejoindre_autre_classe()`. Éprouvé sur le banc le 04/10, rejoué deux fois, cas d'échec compris |
| `024` | Le **compte d'un élève depuis la tablette**, et la **correction en rafale**. Colonne `decision` (`valider`/`refaire`, défaut `refaire`) sur `modeles_correction` ; table `notes_eleves` (enseignant, élève, 200 car. — lue par son auteur seul) ; `reinitialiser_mdp_eleve()` (mot de passe provisoire généré, bcrypt par `pgcrypto`, rendu une fois) et `supprimer_eleve()` (supprime le compte `auth.users`, tout suit en cascade). Les deux fonctions exigent `mon_eleve()` ; 🔴 la suppression **refuse** un élève dont une classe a un autre enseignant. Éprouvé le 06/10 **sur la base réelle dans une transaction annulée** : 13 contrôles, élève partagé compris. ✅ **Appliqué le 06/10** par la CLI et inscrit au registre ; copié dans `supabase/migrations/20261006120000_comptes-eleves-et-decisions.sql` |
| `025` | Les **photos déposées** dans les séquences (signalé en classe le 06/10 : elles n'étaient envoyées nulle part). Stockage privé **`depots`** — un fichier, pas une ligne de `progression` : 600 Ko, JPEG seulement, **60 par compte**, chemin imposé `<auth uid>/<séquence>/<code>.jpg`. Le premier dossier est le propriétaire (lui seul dépose, remplace, efface) ; le deuxième dit la famille : **l'enseignant ne lit que les photos de la famille de sa classe** (`mon_eleve_pour`, 018). Trois fonctions `depots_` (le compteur ne compte que *son* dossier). Purement additif. Éprouvé le 06/10 sur PostgreSQL 18 (Auth et Storage simulés), appliqué deux fois, **27 contrôles d'intrusion passés**. 🔴 Une photo ne s'efface pas en SQL (`storage.protect_delete`) : la purge passe par l'API Storage (`bdd/outils/occupation.sql`) — y compris pour les photos d'un compte supprimé par `supprimer_eleve()` (024), qui restent jusqu'à la purge. Copié dans `supabase/migrations/20261006140000_depots-photos.sql` |
| `026` | Le **+0,5 des signalements retenus**. Deux colonnes sur `signalements` : `bonus_le` (l'enseignant l'accorde — seule colonne qu'il écrit avec `traite`) et `bonus_vu_le` (l'élève a vu la notification). Un déclencheur fait de `bonus_le` la date du serveur, garde la première date, marque traité, et efface « vu » quand le bonus change. Côté élève, deux fonctions : `mes_bonus_signalement()` (ses seuls bonus non vus) et `bonus_signalement_vus(uuid[])` (ne touche que ses lignes) — il ne relit toujours pas ses signalements. Purement additif. Éprouvé le 11/10 **sur la base réelle dans une transaction annulée** : 15 contrôles (auto-attribution refusée, date falsifiée corrigée, « vu » interdit à l'enseignant, autre élève aveugle, anon refusé). ✅ **Appliqué le 11/10** par la CLI et inscrit au registre ; copié dans `supabase/migrations/20261011110000_signalements-bonus.sql` |
| `027` | Les **réponses types des collègues** : `modeles_collegues(code)` rend, pour une question, les phrases gardées par les **autres** enseignants — texte, décision, nom (`enseignants.libelle`), jamais `auth_id` — sans reproposer une phrase déjà gardée (à la casse et aux espaces près). Réservé à `est_enseignant()`. Lecture seule : la policy `modeles_les_miens` (011) est intacte, « + Garder » passe par une insertion ordinaire. Purement additif. Éprouvé le 16/10 **sur la base réelle dans une transaction annulée** (lecture croisée Loïc/MARTIN, élève refusé). ✅ **Appliqué le 16/10** par la CLI et inscrit au registre ; copié dans `supabase/migrations/20261016120000_modeles-partages.sql` |
| `028` | Un élève **change de groupe de SNT** : `changer_groupe_snt(code)` remplace son groupe de SNT par celui du code (ou sa classe d'inscription, si c'était elle — le déclencheur du `018` suit). Progression, copies, absences restent à l'élève, donc passent au nouvel enseignant ; les classes hors SNT ne bougent pas. Refuse un code hors SNT (`PAS_UN_GROUPE_SNT`) et l'élève sans groupe de SNT (`AUCUN_GROUPE_SNT`, renvoyé vers `rejoindre_autre_classe()`). Né du remplacement d'octobre 2026 (B, E → A, F). Purement additif. Éprouvé le 17/10 **sur la base réelle dans une transaction annulée** : 6 contrôles (inscription PC intacte, idempotence, code PC refusé, classe d'inscription suivie et progression intacte, anon refusé). Copié dans `supabase/migrations/20261017120000_changer-groupe-snt.sql`. ✅ **Appliqué** dans le SQL Editor (fonction présente en base, constaté le 18/10) mais **absent du registre de la CLI** : `supabase migration repair --status applied 20261017120000`, à lancer par Loïc, sinon le prochain `db push` la rejoue (sans dégât : `create or replace`) |
| `029` | Le **cahier de textes recopié** de B vers A (t0 S1-S3) et de E vers F (t0 S1-S4), pour les élèves qui changent de groupe au `028`. Plafond d'avance non touché. Aucune structure : SQL Editor ou `supabase db query --linked -f`. Rejouable. ✅ **Lancé par Loïc** (signalé le 18/10) |
| `030` | ✅ **Exécuté le 31/10/2026** par Loïc dans le SQL Editor (six vérifications vraies). Copié dans `supabase/migrations/20261031120000_padago.sql` : rejouable, l'intégration peut le repasser sans dommage. **Padago**, les pads à serrures (`outils/padago/`). 🔴 **Purement additif** : `padago_invitations` (empreintes SHA-256 de codes d'invitation à usage unique — jamais le code), `padago_auteurs`, `padago_pads` (brouillon à codes en clair, lu par l'autrice seule ; version élève à empreintes, lue pad par pad par `padago_lire(slug)`, appelable sans compte). Autrice = compte enseignant, ou invitation acceptée (`padago_accepter_invitation`) — n'ouvre que Padago. Copie entre collègues par `padago_copier(slug)` (autrices seules, pads `copiable`). Plafonds : 200 pads par compte, 400 ko par pad. **Aucune donnée d'élève.** Six vérifications en fin de fichier. Banc : `_outils/tests/padago-schema.test.mjs` (PGlite), 29 contrôles d'intrusion passés, rejoué deux fois |
| `031` | ✅ **Exécuté le 07/11/2026** par Loïc dans le SQL Editor, §11 compris (4 classes à 2 enseignants, 7 tables en temps réel). Copié dans `supabase/migrations/20261107120000_emc.sql` : rejouable, l'intégration peut le repasser sans dommage. **EMC seconde** (« Le Labyrinthe de Nina », séances des 12-13/11). Espace `emc` ajouté à `classes_espace_connu` (seule modification d'un existant), **4 classes** (`NINA27`, `NINA48`, `NINA63`, `NINA91`) et leurs séances. Tables `emc_contenus` (réglages, pré-remplis avec les annexes du plan), `emc_seances` (étape pilotée), `emc_participants` (table tirée et liée au compte, prêt), `emc_mots` / `emc_mots_masques`, `emc_notes` (lues par la table), `emc_carte` / `emc_carte_masques`, `emc_votes`, `emc_enquete` (**ni élève ni heure**), `emc_aide` (enseignants de la classe seuls). La carte : `emc_zone_de` / `emc_dans_zone` refusent **en base** tout élément hors de la zone de sa table (miroir JS dans `emc-commun.js`, mêmes points de contrôle). Fonctions `emc_entrer`, `emc_pret`, `emc_repondre_enquete`, `emc_cloturer` (efface l'aide), `emc_supprimer_comptes` (comptes créés pour l'EMC seulement — `supprimer_eleve` refuserait, les classes ont deux enseignants). Sept tables ajoutées à `supabase_realtime`. Le rattachement des deux enseignants (§11) est **en commentaire**. Banc : `_outils/tests/emc-schema.test.mjs` (PGlite), **217 contrôles** (40 élèves, intrusions, rejoué deux fois), qui **échoue** quand on retire le contrôle de zone, ouvre l'aide ou lève le plafond de l'enquête. |
| `032` | ✅ **Exécuté le 07/11/2026** par Loïc (après le 033 : sans effet, ils sont indépendants). Copié dans `supabase/migrations/20261107180000_emc-fusion.sql`. **EMC : les mots, les notes et les votes s'enregistrent.** Panne vue au premier test réel : la page écrit ces trois tables en upsert (`merge-duplicates`), que PostgREST traduit en `on conflict do update set` **toutes** les colonnes envoyées, clé comprise ; le `031` n'accordait l'update que sur `mots`/`emojis`, `texte`, `valeur` → refus 42501. Accorde l'update sur les colonnes de clé, et les policies « changer » exigent en plus d'être participant de la séance visée (on ne déplace pas sa ligne ailleurs). Banc : `emc-schema.test.mjs` écrit désormais comme PostgREST ; sans le `032`, 4 échecs (la panne exacte). |
| `034` | ✅ **Exécuté le 08/11/2026** par Loïc (SQL Editor). Copié dans `supabase/migrations/20261108120000_emc-six-seances.sql`. Fonction `emc-cartes` déployée le même jour. **EMC : les six séances, les cartes éphémères, le jeu de rôle.** `emc_seances` reçoit `module` (`nina` · `accueil` · `restitution`), `prefixe` (lettre des cartes) et `etat` (jsonb piloté) ; étapes 0-9. Deux classes (`JDRD12` accueil groupe D, `REST21` restitution 2nde 1), rattachées aux enseignants du premier créneau ; libellés datés (seulement s'ils sont d'origine). `emc_cartes` (identifiant, code, lisibles des seuls enseignants de la classe) avec `emc_cartes_autoriser` (jeton du prof) et `emc_carte_inscrire` (**clé de service seulement**, appelée par la fonction Edge `emc-cartes`). `emc_reinitialiser` (après une répétition). Jeu de rôle : `emc_jdr` (origine, numéros de questions, feux, « reconnu » — **aucune réponse**), `emc_binomes`, `emc_jdr_tirer` (classes d'origine croisées, trinôme), `emc_jdr_echanger`. `emc_mur` (portrait, je retiens, définition : modéré, statut hors de portée de l'élève). Restitution : `emc_restit` (ateliers écrits par l'élève, son mot), `emc_postits` (le mur : dans son groupe seulement, à l'étape 4, masquable par le prof), `emc_mon_groupe` (groupes posés par le prof dans `emc_seances.etat`). `emc_cloturer` efface en plus portraits et « je retiens ». Cinq tables de plus en temps réel. Contenus `etapes_accueil`, `jdr` (fiche-guide de l'équipe EMC, exemple à relire), `etapes_restitution`, `restitution` (libertés à relire). Banc : `emc-schema.test.mjs`, **334 contrôles** (35 cartes, 31 élèves de 10 classes d'origine, 30 tirages sans collision, retardataires, mur de post-it). Fonction Edge : `supabase functions deploy emc-cartes --no-verify-jwt` depuis `Site-Web-Portfolio/` (banc : `deno test supabase/functions/emc-cartes/cartes_test.ts`, 10 tests). |
| `033` | ✅ **Exécuté le 07/11/2026** par Loïc. Copié dans `supabase/migrations/20261107180100_emc-contenus.sql`. **EMC : contenus enrichis** (données seulement). Titre de l'étape 1, 20 émojis de plus (32), pour chaque numéro une icône / qui répond / quand appeler, les deux vidéos YouTube de la campagne (la 2022-2023 d'abord ; l'autre cite le 3020, devenu le 3018), une icône par mission. **N'écrase rien de réglé au tableau de bord** : chaque changement ne s'applique que sur le contenu d'origine ; les émojis s'ajoutent sans doublon (banc : rejoué sur des contenus modifiés à la main). |

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
