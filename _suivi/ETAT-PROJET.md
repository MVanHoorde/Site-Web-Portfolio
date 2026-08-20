# État du projet

> **Réécrit** à chaque session, jamais empilé. Ce fichier décrit **l'état
> courant** — jamais comment on y est arrivé.
> Historique → `JOURNAL.md` · décisions → `DECISIONS.md` · détail par chapitre →
> `chapitres.md` · contexte et règles → `CLAUDE.md` · index → `MANIFESTE.md`.
>
> Dernière réécriture : **20/08/2026**
> Site : https://mvanhoorde.github.io/Site-Web-Portfolio/ · Repo : MVanHoorde/Site-Web-Portfolio

---


> 🔗 **Pour reprendre une session interrompue, lire `REPRISE.md` à la racine.**
> Il contient l'état au 01/08/2026, les bugs connus non corrigés, les décisions
> en attente et les pièges rencontrés.

## Où on en est

| Partie | État |
|---|---|
| **PC seconde** | 14 chapitres en ligne. T1-C1→C4 dégrossis à fond ; les 10 autres portent **206 blocs `.a-faire`**. Aucun cours validé. |
| **SNT** | 8 séquences (t0→t7). `t1` et `t2` sur le moteur partagé ; `t0`, `t1`, `t2` en V0 complète ; `t3`→`t7` en V0 partielle (S1 rédigée, suite en 🚧). Aucune validée. |
| **SNT — plafond d'avance** | 🆕 Écrit le 20/08, **branché sur `t0`, `t1`, `t2` et le hub**, testé (21 assertions sur le module, harnais DOM sur la cascade). ⚠ **`bdd/schema/013-verrou-progression.sql` reste à exécuter** — tant qu'il ne l'est pas, `mon_plafond()` n'existe pas et **rien n'est fermé** : le repli est volontaire, mais le verrou ne fonctionne pas. Deux textes vus par les élèves attendent la validation de Loïc. |
| **SNT — `t1` Internet** | Séances 1, 2, 3 et étapes 5.1, 5.2, 5.3 refondues. **Restent : 5.4, 5.6, et la fin de thème** (Filius + passerelle NSI facultative). Deux blocs de 5.3 attendent le moteur (relevé et rappel). Les **QCM des deux vidéos sont posés** (20/08) : `NET-Q-cables`, 15 questions en bonus à l'étape 3.5, et 14 questions ajoutées à `NET-Q8` en 5.3. Seule séquence sur le moteur partagé. |
| **Base de données** | ✅ **en service.** Supabase, région **West EU (Paris)**. 7 tables, 10 policies RLS, 4 fonctions, sauvegarde hebdo + réveil quotidien. Pilote prouvé de bout en bout sur `t1`. |
| **Pré-correction IA SNT** | ✅ worker local complet, testé, avec garde-fous et tri de relecture (`ia-snt/`). ⚠ boucle non fermée — voir ci-dessous. |
| **Livret CFA** | 17 outils + index en ligne, tous à la structure `.contexte` / `.question` / `.reponse`. Mise en page reprise le 19/08 (une seule colonne, un seul bord d'attaque), puis **audit de contenu des dix-sept outils le même jour** : accroche recentrée sur l'atelier, « effort » → « force » partout, `ε` pour l'écart et `θ` pour les angles de rotation, paliers 1 dégonflés de leur guidage, sous-questions concaténées, vecteurs fléchés et racines couvrantes. Deux figures produites (bras de levage de l'Outil 5, composantes de l'Outil 14), une dizaine corrigées. Les **fiches A4 ne suivront qu'après validation des versions en ligne** — 15 des 17 liens « version à imprimer » sont donc morts. Rien de validé : **l'Outil 0 est le premier attendu en relecture**. Depuis le 19/08 le livret est **branché sur le dispositif de comptes** : connecté, le travail va en base et suit l'apprenti d'un appareil à l'autre ; sans compte, tout reste sur l'appareil comme avant, et la page le dit. Les deux codes de classe (`CFA26A`, `MVT26A`) sont ouverts : `bdd/schema/012-classes-cfa.sql` a été exécuté le 20/08. |
| **Cahier de vacances** | 14 pages, 2 blocs 🚧. La partie la plus finie du dépôt. |
| **ES Terminale** | frise fonctionnelle en local ; `serveur-frise/` et `ia-correction/` en chantier. |

**Validation** : aucun contenu n'est validé à ce jour. La mise en ligne n'est pas
un jalon — ce qui se suit, c'est le niveau de finition **validé par Loïc**, acte
explicite, jamais présumé.

---

## Ce qui bloque

### ① Chemin critique — la boucle est refermée (reste l'interface)

Depuis le `010` (31/07), une copie peut aller jusqu'à l'élève. Trois fonctions
le permettent, et elles seules : `valider_copie`, `signaler_copie`,
`rouvrir_copie`. Le worker, lui, n'a toujours aucun moyen de poser un statut —
c'est ce qui matérialise la décision humaine exigée par le cadre AI Act
(article 6(3), tâche préparatoire).

Ce qui est en place :

- `008` (27/07) — rôle enseignant : table `enseignants`, `est_enseignant()`,
  **lecture** des copies, des élèves et des classes.
- `009` (31/07) — suivi de classe : `seances_faites`, `absences`, `jalons`,
  plus la lecture de `progression`.
- `010` (31/07) — **écriture** : les trois fonctions de correction, plus le
  traitement du statut `signale` côté séquence (verdict rouge, bouton d'envoi
  rendu à l'élève pour qu'il puisse réécrire). Assets passés en `?v=22` sur
  `t1` **et** `t2`, qui traînait encore en `?v=19`.

Les trois migrations ont été jouées et éprouvées sur un PostgreSQL 16 : rejeu,
test d'intrusion élève et anonyme, et vérification que valider une copie ne
réveille pas le déclencheur d'archivage.

**Il ne reste plus de verrou en base**, et le compte enseignant existe
(`l.vanhoorde@…`, inscrit le 27/07). Ce qui manque est l'interface, découpée en
lots :

- [x] **A — socle** : `prof/index.html` + `assets/js/prof-api.js`. Connexion,
      contrôle du rôle, coquille à quatre onglets, chargement de la table des
      noms en mémoire vive. `verifier.mjs` surveille la cohérence de
      configuration entre `prof-api.js` et `progression.js`.
- [x] **B — file de correction** : pile triée (signalées d'abord, puis
      ancienneté), critères, message proposé, valider / renvoyer / annuler.
      Parcours éprouvé hors navigateur avec un DOM simulé (`jsdom`) : ordre de
      tri, échappement du texte élève, appels de fonction et paramètres.
- [x] **C — rituel** : ouverture (absents, deux taps) et clôture (séances faites,
      note dictée au micro du clavier, travail donné, à reprendre).
- [x] **D — grille de suivi** : une colonne par séance avec le détail chiffré,
      cinq états calculés (terminée / en cours / pas encore / en retard / absent),
      deux compteurs distincts par élève — retard du jour et dette antérieure.
      Dépliage étape par étape en attente des `data-cle` (voir DECISIONS).
- [x] **E — cahier de textes** : bloc prêt à coller, repris automatiquement
      d'un autre groupe ayant déjà fait la même séance.
- [x] **F — fiche élève** : avancement et toutes ses réponses, accessible d'un
      clic sur son nom dans la grille. Rapports agrégés : pas encore.

Repli si la page prend du retard sur la rentrée : un script en ligne de commande
sur le PC de Loïc (lister · afficher `tri.a_verifier` · appeler `valider_copie`)
suffit désormais à faire tourner le dispositif.

### ② Portage des sept séquences sur le moteur partagé

Le gabarit est extrait (23/07) et `t1` tourne dessus. Les sept autres ont encore
leur copie inline, plus ancienne : leur HTML n'est pas marqué comme le moteur
l'attend (`data-step`, `data-gate`, `.field[data-focus-code]`, `script.qcm-data`,
`#dico-source`). **Une séquence à la fois, ouverte et testée.** Priorité : `t0` et
`t2`, les deux qui serviront en septembre.

### ③ La frise ES à brancher

Décision prise le 23/07 : elle passe sur Supabase. Le modèle est écrit
(`bdd/schema/007-frise-es.sql`) mais **à valider par Loïc** avant exécution. Il
reste à écrire les fonctions correspondantes dans `progression.js` et à remplacer
l'objet `API` de `pages/term-es-s01-frise.html`, qui retombe encore sur
`localStorage`.

## Prochaines actions

- [ ] **`t1` lot 2 — moteur du relevé et du rappel** : type de champ « relevé »
      (validé sur le format, pas la valeur) · rappel en boîte de dialogue sur fond
      flouté, comparé au relevé du même élève · prise en charge d'un `data-cle` sur
      un bloc `.cloze` · incrémenter le `?v=` **du CSS et du JS**, dans **les deux
      pages** (au 20/08 : `sequence-snt.css?v=29`, `sequence-snt.js?v=30`)
- [ ] **`t1` lot 3 — étape 4.4** : donner les consignes, étoffer les questions,
      descendre le « à retenir », refaire `NET·4c` (le sortir de `.res`, retirer `.a-venir`)
- [ ] **`t1` lot 4 — étape 4.6** : QCM IPv6 à la place des champs, et beaucoup plus de sources
- [ ] **`t1` lot 5 — fin de thème** : Filius en validation intégratrice + passerelle
      NSI facultative (ports, masque de sous-réseau)
- [ ] Depuis un poste de la salle : `nslookup` sur les trois sites du relevé de 4.3
      (pas de CDN, pas trois adresses dans le même /16) — remplaçants notés dans `DECISIONS.md`
- [x] ~~Visionner les deux vidéos et écrire les questions de QCM~~ — fait le
      20/08 **à partir des transcriptions** fournies par Loïc, chaque question
      ancrée sur un passage cité. ⏳ reste à éprouver en classe : `NET-Q8` compte
      maintenant **18 questions d'affilée**, à scinder si c'est trop
- [ ] **Chantier QCM — reprendre les biais de forme sur tout le projet.** Seuil du
      détecteur affiné le 20/08 (il mesure l'ampleur au lieu de la constater) :
      **43 questions signalées, dont 34 marquées 🔴**, liste triée par
      `node verifier.mjs --qcm`. Attaquer par le haut — les quatre premières
      dépassent 45 caractères d'écart. Trois règles à appliquer : longueur
      comparable, distracteurs de même granularité, position de la bonne réponse
      répartie. ⚠️ **`t2` est de loin la plus touchée** : **20 des 34 cas marqués
      pour 42 questions**, contre **14 sur 97** dans `t1` — près d'une question sur
      deux, contre une sur sept
- [ ] **Écrire l'étape 5 minimale** (`ia-snt/valider.mjs`) — le dernier maillon
- [x] ~~Porter `t2` sur le moteur partagé~~ — fait le 25/07 (lot 0)
- [ ] Porter `t0` sur le moteur partagé, puis les cinq séquences restantes
- [x] ~~`t2` lot 1 — séance 1 refondue~~ — fait le 25/07
- [x] ~~`t2` lot 3 — séance 2 HTML/CSS~~ · ~~lot 4 — cookies en séance 4~~ — faits le 25/07
- [x] ~~`t2` lot 2 — séance 3~~ · ~~lot 5 — frise débranchée~~ — faits le 25/07
- [ ] **`t2` : imprimer les étiquettes de la frise** (`WEB·D`, 20 étiquettes)
- [ ] Vérifier en salle : CodeBetter accessible depuis le réseau du lycée,
      et quels navigateurs sont installés (l'étape cookies en demande deux).
      Non bloquant depuis le 25/07 : l'étape CodeBetter n'est plus une porte
- [ ] Écrire la grille de critères IA des cinq réponses corrigées de `t2` :
      `WEB-R1b` · `WEB-R2a` · `WEB-R3b` · `WEB-R4a` · `WEB-R4b`
- [ ] **`t2` 1.3 : vidéo HTTP** — adresse nocookie, titre, chaîne, durée,
      puis questions de QCM après visionnage (par Loïc)
- [ ] Relire et exécuter `bdd/schema/007-frise-es.sql`, puis brancher la page de frise
- [ ] `moteur.mjs` en `temperature: 0` + `seed` fixe — préalable à tout re-benchmark
- [ ] Rework de la grille R1/C2 à froid (restructurer, pas reformuler)
- [ ] Réparer `pages/term-spe-physique-chimie.html → docs/tp-1-1.pdf`
- [ ] Ré-encoder `audio/2nde-pc-t3-c4-intro.m4a` (31 Mo → ~2 Mo, mono 64 kbit/s)
- [ ] Nettoyer les couleurs en dur hors `:root` (les six restantes ≈ 46).
      `t2` : les 52 du `<style>` sont parties avec le portage, **18 subsistent dans ses SVG**
      (invisibles du vérificateur, qui ne lit que les balises `<style>`)
- [ ] Nettoyage avant rentrée : compte `leproftest` + lignes de test
- [ ] 🔴 Révoquer la clé `service_role` — **dernière action avant la mise en service**

## ⏳ En attente de Loïc — rappels récurrents

> À ressortir tant que ce n'est pas coché.

**Gravures de l'accueil** (domaine public, à déposer dans `gravures/` — sources
dans `gravures/A-LIRE.txt`). Tant qu'un fichier manque, l'accueil montre un cadre
vide annoté à la place de la planche.

- [ ] `01-prisme-newton.jpg` — Newton, prisme, 1704
- [ ] `02-machine-nollet.jpg` — Nollet, machine électrostatique, 1743
- [ ] `03-alambic-encyclopedie.jpg` — Encyclopédie, distillation, 1765
- [ ] `04-pile-volta.jpg` — Volta, la pile, 1800
- [ ] `05-camera-obscura.jpg` — Kircher, chambre noire, 1646
- [ ] `06-barometre-torricelli.jpg` — Torricelli, baromètre, 1644
- [ ] `07-champ-faraday.jpg` — Faraday, lignes de champ, 1852
- [ ] `08-spectre-fraunhofer.jpg` — Fraunhofer, spectre solaire, 1814

**Accueil**

- [ ] Remplacer `prenom.nom@exemple.fr` par la vraie adresse
- [ ] Mettre le vrai lien de l'espace classe ENT (actuellement `href="#"`)
- [ ] (plus tard) Page « collection de gravures »

**Base de données — réflexes permanents** (pas des cases à cocher)

- **Sept jours consécutifs sans allumer le PC = projet Supabase mis en pause.**
  Rien n'est perdu, la relance se fait d'un clic au tableau de bord ; mais le
  site ne répond plus entre-temps. Le rattrapage sauve la sauvegarde, pas le
  réveil.
- Vérifier de temps en temps `C:\Sauvegardes-SNT\journal.log` : une ligne `OK`
  par semaine. Une ligne `ECHEC` ou une absence de ligne = sauvegarde muette.
- 🔴 **Le jour de création des comptes** : collecter les identifiants choisis par
  les élèves et tenir la table identifiant→nom **sur le PC uniquement**, hors
  base. Sans elle, un identifiant oublié devient introuvable, y compris pour Loïc.
- Faire le ménage dans `C:\Sauvegardes-SNT` quand la base contiendra des copies
  d'élèves (règle de purge à ajouter au script à ce moment-là).

**Licences et contenus**

- [ ] Vérifier le contrat Tableo avant de republier des cours sur le site
