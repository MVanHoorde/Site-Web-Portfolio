# EMC seconde, *Le Labyrinthe de Nina* : audit et architecture

> Phase 0 du plan `PLAN-EMC-seconde-labyrinthe-nina.md` (v1, 07/11/2026).
> Séances des jeudi 12 et vendredi 13/11/2026 : **4 créneaux de 2 h**, 30 à 40
> élèves de seconde, M. Van Hoorde et Mme Castel présents à chaque fois, iPad
> personnel fourni par l'établissement.
> Ce fichier décrit l'état courant. Les décisions datées partent dans
> `DECISIONS.md`.

## 1. Décisions de Loïc (07/11/2026)

| Sujet | Décision |
|---|---|
| Identité | **Identifiants seulement**, aucun nom réel en base, y compris dans « J'ai besoin d'en parler ». La correspondance identifiant ↔ nom se fait sur une **feuille papier** qui circule, pour tous les élèves, y compris ceux qui ont déjà un compte. |
| Invités | **Pas d'invité.** L'élève sans compte en crée un vrai, par le mécanisme existant. Les comptes créés pour l'EMC sont **supprimés après**. |
| Classes | **Une classe EMC par créneau** (4 codes de 6 caractères, écrits au tableau). Vous êtes rattachés tous les deux à chacune. |
| Temps réel | Realtime, testé à 40 élèves. Supabase reste sur l'**offre gratuite**. |
| Carte mentale | Complète, **sans solution de repli**, avec **sous-zones** et zoom. Pas d'import d'image. |
| Contenus | Ceux du plan (annexes A à F) sont **validés avec Mme Castel**. **Tout est modifiable depuis le tableau de bord**, avec la possibilité d'ajouter et de retirer des éléments. |
| Podium et bonbons | Sur papier, en dehors du site. |
| Notes de mission | Chacun écrit les siennes et voit celles de sa table. |
| Messages d'aide | Ils ne valent que pour la séance et sont **effacés à la clôture**. La CPE et l'infirmière sont prévenues par mail personnel, sans compte sur le site. |
| Vidéo | MP4 sur le OneDrive (YouTube est bloqué au lycée), **avec en plus le lien d'origine**. |
| Exports | Harcèlomètre, nuage de mots et émojis, et surtout la carte mentale : **téléchargement en PDF ou en image pour imprimer et partager**, par la même mécanique qu'en SNT. |
| Fiche d'association | En PDF imprimable, dans la chaîne des fiches. On y ajoute le modèle de la **feuille de correspondance**. |
| Enquête | Seulement celle de fin, pas de mini-enquête pendant l'activité. |

## 2. Ce que le dépôt fournit déjà, et ce qu'il ne fournit pas

| Besoin du plan | Constat | Conséquence |
|---|---|---|
| Comptes élèves | Identifiant et mot de passe, email synthétique `identifiant@snt.local` (`progression.js:374-472`). `creerCompte(id, mdp, code)` crée le compte et rejoint la classe ; `rejoindreAutreClasse(code)` ajoute une classe à un compte existant (018). | Réutilisé tel quel. Un compte créé avec un code EMC a sa classe EMC comme **classe d'inscription** : c'est ce qui permet de les retrouver pour les supprimer. |
| Connexion anonyme Supabase | Désactivée le 22/07/2026. | Pas utilisée. |
| Mme Castel | Les classes collègues existent (020). Son rattachement s'est fait par `rattacher_enseignant()`, à confirmer en base. | ⏳ Loïc vérifie que son compte se connecte au tableau de bord. |
| Cloisonnement | Un enseignant ne voit que les classes de `enseignants_classes` (016, 018). Il voit le travail d'un élève **par famille** (`mon_eleve_pour`). | Tables `emc_*` dédiées, autorisées par la classe EMC. Un de tes élèves de SNT qui rejoint une classe EMC n'ouvre pas son SNT à Mme Castel. |
| Suppression de compte | `supprimer_eleve` (024) **refuse** dès qu'une classe de l'élève a un autre enseignant. Avec deux enseignants par classe EMC, elle refuserait toujours. | Fonction propre `emc_supprimer_comptes(classe)`, réservée aux comptes dont **toutes** les classes sont des classes EMC. |
| « Je suis prêt » | Codé en dur dans le jeu de dés (`1re-es-t1-c2-radioactivite.html:3021`). Le pilotage relit la base toutes les 5 s (`prof/decroissance.html:370`). | « Prêt » générique à écrire : une colonne `pret` par participant. Le compteur affiché est `prêts / présents`. |
| Temps réel | Aucune table dans la publication `supabase_realtime`, et pas de `supabase-js` dans le site (des `fetch` faits à la main). | `supabase-js` 2.45.4 (MIT, 111 Ko) **auto-hébergé** dans `assets/js/vendor/`, utilisé **seulement pour Realtime**. Le reste passe par REST, comme ailleurs. |
| Tableau de bord | Les espaces sont une liste fermée (`prof/index.html:735-749`). Un module séparé est possible sur le modèle de `prof-defi.js`. Une page de pilotage peut reprendre la session du tableau de bord, comme `decroissance.html`. | Espace `emc` avec un onglet rempli par `assets/js/prof-emc.js`. Le pilotage et la projection vivent dans des pages à part. |
| Export PDF | html2canvas-pro 2.5.1 et jsPDF 4.2.1 dans `assets/js/vendor/`. Partage iOS en deux gestes, puis lien de téléchargement (`sequence-snt.js:3053-3264`), mais tout est privé dans le moteur SNT. | Même mécanique, recopiée dans `emc-export.js`. La carte est exportée **depuis Konva** (`toDataURL` à 3× ou plus), sans html2canvas. |
| Tests | Banc PGlite pour le SQL (`_outils/tests/padago-schema.test.mjs`). Python Playwright 1.62 et Chromium sont installés. Le patron de banc multi-élèves sur fausse base REST n'est pas versionné. | `_outils/tests/emc-schema.test.mjs` (RLS, zones, tirage des tables) et `_outils/tests/emc-classe.py` (40 navigateurs), **versionnés cette fois**. |
| Charte | `--ink #161f33` (marine), `--activity #c26a12` (orange) ; cyan `#3fa7d6` dans le cahier. Polices auto-hébergées. | Variables reprises dans `emc/emc.css`, avec le cyan ajouté. |

## 3. Architecture

### 3.1 Pages

| Fichier | Vue | Connexion |
|---|---|---|
| `emc/index.html` | **Élève** : se connecter ou créer un compte avec le code EMC, numéro de table, étape en cours, « Je suis prêt », encart des numéros d'urgence, « J'ai besoin d'en parler » | Session élève de `progression.js` (`snt.session`) |
| `prof/emc.html` | **Pilotage** : choix du créneau, étapes, compteurs, participants, alertes d'aide, modération, carte (outils prof), exports, clôture | Session du tableau de bord (`prof-api.js`) |
| `prof/emc-projection.html` | **Projection** : résultats agrégés qui s'accumulent étape par étape. **Ne lit jamais** `emc_aide`, et n'affiche ni identifiant ni nom (contrôle automatique) | Session du tableau de bord |
| `prof/emc-contenus.html` | **Contenus** : questions, émojis, missions et sous-zones, légende des couleurs, situations du harcèlomètre (ordre, activation, ajout, retrait), enquête, vidéos, numéros | Session du tableau de bord |
| `prof/index.html` (espace `emc`) | Les 4 créneaux avec leur code, le nombre de participants, des liens vers Piloter, Projeter et Contenus | — |
| `assets/js/emc-commun.js` | Client REST et Realtime, géométrie des zones (**la même** que celle du SQL), file d'attente hors ligne | — |
| `assets/js/emc-carte.js` | Canevas Konva : zones, sous-zones, outils, zoom | — |
| `assets/js/emc-export.js` | PDF et PNG | — |

### 3.2 Modèle de données (migration `031-emc.sql`)

- `classes.espace` accepte `'emc'`. Quatre classes EMC sont créées, et Loïc rattache les deux enseignants en SQL avec `rattacher_enseignant`.
- `emc_contenus (cle, valeur jsonb)` : tout ce qui se règle au tableau de bord, en commun aux 4 créneaux, pré-rempli avec les annexes. Lisible par les participants EMC, modifiable par les enseignants EMC.
- `emc_seances (classe_id pk, etape, situation_courante, situation_revelee, carte_figee, zones_verrouillees, ...)` : l'état piloté.
- `emc_participants (classe_id, eleve_id, table_num 1-8, pret, enquete_faite)` : la table est tirée par `emc_entrer()` (on prend la moins remplie, au hasard en cas d'égalité, sous verrou). Elle est **liée au compte** : se reconnecter redonne la même table.
- `emc_mots (classe_id, eleve_id, mots[], emojis[])` et `emc_mots_masques (classe_id, mot)` : réponses et modération.
- `emc_notes (classe_id, eleve_id, texte)` : chaque élève lit les notes de sa table.
- `emc_carte (id, classe_id, eleve_id, zone, type, couleur, donnees, masque, supprime)` : un trait, un texte, un autocollant ou une forme. **L'écriture n'est acceptée que dans la zone de sa table**, vérifiée par une fonction SQL qui contrôle chaque point.
- `emc_votes (classe_id, situation, eleve_id, valeur 0-10)` : modifiable seulement tant que la situation est ouverte.
- `emc_enquete (id aléatoire, classe_id, reponses, temoignage)` : **sans identité ni horodatage**. On n'y écrit que par une fonction, qui coche `enquete_faite` à part (on sait *qui* a répondu, jamais *quoi*).
- `emc_aide (classe_id, eleve_id, cases, message, statut)` : lisible des seuls enseignants de la classe, et effacée par `emc_cloturer()`.
- `emc_supprimer_comptes(classe)` : supprime les comptes dont toutes les classes sont des classes EMC. Un aperçu permet de les compter avant.

### 3.3 La carte : géométrie, zones et sous-zones

- Le monde est un carré de 4000 × 4000 unités, avec son centre en (0, 0).
  - **Centre** : disque de rayon 520, réservé aux enseignants (titre, citation de la DDHC).
  - **Anneau intérieur** : rayon de 520 à 1250 (les faits du jeu).
  - **Anneau extérieur** : au-delà de 1250, jusqu'au bord du carré. Les coins comptent, ce qui donne de la place.
- Il y a 4 quadrants, soit **8 zones**, numérotées comme les tables de l'annexe B.
- **Sous-zones** : chaque zone est découpée en secteurs angulaires égaux. Par défaut, il y en a 3 : la mission, puis la question 1, puis la question 2. Elles sont dessinées en fond, avec leur titre, et leur nombre et leurs titres se règlent au tableau de bord. Ce sont des **cadres de guidage** : l'élève est verrouillé sur sa zone, pas sur une sous-zone.
- La même fonction de géométrie existe en JS (le client découpe les traits au bord de la zone) et en SQL (le serveur refuse ce qui déborde). Les deux sont testées avec les **mêmes cas**.
- **Zoom** : pincement ou molette, boutons + et −, recentrage sur sa zone, de 0,1× à 8×. On écrit en grand dans un petit coin.
- **Outils** : crayon et texte, avec la palette et sa légende (annexe D), des autocollants dans l'esprit des SMS et des réseaux sociaux, des formes, annuler et refaire.

### 3.4 Realtime, et le budget de l'offre gratuite

L'offre gratuite donne 200 connexions simultanées et 2 millions de messages par mois. Un message, c'est un changement remis à un abonné.

| Flux | Par Realtime | Diffusé à |
|---|---|---|
| Étape, situation, verrous (`emc_seances`) | oui | tout le monde |
| Prêts et présents, votes, mots | oui | pilotage et projection |
| Alertes d'aide | oui | **les enseignants seulement** (RLS) |
| Carte | oui | pilotage, projection et **la table de l'élève**, grâce au filtre `canal = classe:zone` |
| Carte, autres zones, sur les iPad | non : relecture des nouveaux éléments toutes les 3 s | — |

Estimation : environ 100 000 messages par créneau, soit 400 000 pour les quatre. À mesurer pendant la recette.

### 3.5 Hors ligne

Une **file d'attente locale**, par élève et par créneau : traits, textes, notes, votes et mots. Chaque élément porte un identifiant fabriqué sur l'iPad, si bien qu'un renvoi ne crée pas de doublon. Elle se vide dès que le réseau revient. **Les messages d'aide n'y entrent jamais** : ils s'envoient tout de suite, et en cas d'échec on réessaie en mémoire, avec un avertissement.

## 4. Tests

1. **`_outils/tests/emc-schema.test.mjs`** (PGlite) contrôle :
   - le tirage équilibré des tables, et la même table après reconnexion ;
   - l'écriture hors de sa zone, refusée par le serveur même si on force le client ;
   - le vote hors de la situation ouverte, refusé ;
   - l'enquête, sans aucun lien avec l'identité ;
   - `emc_aide`, invisible d'un élève et d'un enseignant extérieur ;
   - la suppression des comptes EMC, limitée aux bons comptes.
2. **`_outils/tests/emc-classe.py`** (Playwright, fausse base REST plus Realtime simulé) : 2 enseignants et 40 élèves, dont 3 qui se déconnectent et se reconnectent et 2 qui perdent le réseau, sur les 7 étapes. Il vérifie que la projection ne contient aucun identifiant et que l'alerte arrive en moins de 3 s.
3. **Recette sur la vraie base**, après le `db push` : une classe de test et 40 clients réels contre `ztyv…`, pour mesurer Realtime et les messages, puis suppression des comptes de test.
4. `node verifier.mjs` : aucune régression par rapport au repère.

## 5. Ordre de construction

1. Migration 031 et banc PGlite.
2. `emc-commun.js`, page élève (connexion, table, prêt, aide), pilotage (étapes, participants, alertes), espace EMC du tableau de bord.
3. Étape 1 (mots et émojis), harcèlomètre, projection.
4. **Carte mentale.**
5. Missions et notes, vidéo et numéros d'urgence, enquête.
6. Exports, contenus au tableau de bord, fiche d'association et feuille de correspondance.
7. Bancs à 40 élèves, recette sur la vraie base, guide « EMC » du tableau de bord.

## 6. Ce que Loïc fait lui-même

Liste tenue à jour par Claude. La demander avec « le bilan EMC ».

- Vérifier que Mme Castel se connecte au tableau de bord.
- ✅ Migration 031 exécutée le 07/11/2026 dans le SQL Editor, §11 compris (vos deux comptes rattachés aux 4 classes EMC).
- Donner les 4 créneaux (jour, heure) pour les libellés des classes.
- Déposer la ou les vidéos en MP4 sur le OneDrive et donner leurs liens.
- Prévenir la CPE et l'infirmière par mail, avec les passages sensibles du jeu (annexe G3).
- Faire installer le jeu sur les iPad et vérifier le wifi (WebSocket vers `*.supabase.co`).
- Imprimer la feuille de correspondance et la fiche d'association.
- Faire la répétition avec Mme Castel avant le premier créneau.
- À chaque créneau : écrire le code au tableau et faire circuler la feuille.
- Après : clôturer chaque créneau (les messages d'aide sont effacés), puis supprimer les comptes EMC.
