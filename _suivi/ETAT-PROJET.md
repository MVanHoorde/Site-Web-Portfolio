# État du projet

> **Réécrit** à chaque session, jamais empilé. Ce fichier décrit **l'état
> courant** — jamais comment on y est arrivé.
> Historique → `JOURNAL.md` · décisions → `DECISIONS.md` · détail par chapitre →
> `chapitres.md` · contexte et règles → `CLAUDE.md` · index → `MANIFESTE.md`.
>
> Dernière réécriture : **25/07/2026**
> Site : https://mvanhoorde.github.io/Site-Web-Portfolio/ · Repo : MVanHoorde/Site-Web-Portfolio

---

## Où on en est

| Partie | État |
|---|---|
| **PC seconde** | 14 chapitres en ligne. T1-C1→C4 dégrossis à fond ; les 10 autres portent **206 blocs `.a-faire`**. Aucun cours validé. |
| **SNT** | 8 séquences (t0→t7). `t1` et `t2` sur le moteur partagé ; `t0`, `t1`, `t2` en V0 complète ; `t3`→`t7` en V0 partielle (S1 rédigée, suite en 🚧). Aucune validée. |
| **SNT — `t1` Internet** | Séances 1, 2, 3 et étapes 4.1, 4.2, 4.3 refondues. **Restent : 4.4, 4.6, et la fin de thème** (Filius + passerelle NSI facultative). Deux blocs de 4.3 attendent le moteur (relevé et rappel). Seule séquence sur le moteur partagé. |
| **Base de données** | ✅ **en service.** Supabase, région **West EU (Paris)**. 7 tables, 10 policies RLS, 4 fonctions, sauvegarde hebdo + réveil quotidien. Pilote prouvé de bout en bout sur `t1`. |
| **Pré-correction IA SNT** | ✅ worker local complet, testé, avec garde-fous et tri de relecture (`ia-snt/`). ⚠ boucle non fermée — voir ci-dessous. |
| **Cahier de vacances** | 14 pages, 2 blocs 🚧. La partie la plus finie du dépôt. |
| **ES Terminale** | frise fonctionnelle en local ; `serveur-frise/` et `ia-correction/` en chantier. |

**Validation** : aucun contenu n'est validé à ce jour. La mise en ligne n'est pas
un jalon — ce qui se suit, c'est le niveau de finition **validé par Loïc**, acte
explicite, jamais présumé.

---

## Ce qui bloque

### ① Chemin critique — l'étape 5 n'existe pas

**Rien dans le dépôt ne peut faire passer une copie de `en_attente` à `corrige`.**
Ni le worker (par conception), ni `progression.js`, ni aucun script ; il n'existe
pas de rôle enseignant en base. Conséquence : l'élève envoie, le worker corrige,
et **l'élève ne voit jamais rien** — l'affichage est conditionné à
`statut === 'corrige'`.

Version minimale suffisante pour la rentrée : un script en ligne de commande sur
le PC de Loïc (lister · afficher `tri.a_verifier` · valider d'une touche). Le
tableau de bord iPad peut attendre. **C'est le dernier maillon.**

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
      un bloc `.cloze` · `?v=19` sur **le CSS et le JS**, dans **les deux pages**
- [ ] **`t1` lot 3 — étape 4.4** : donner les consignes, étoffer les questions,
      descendre le « à retenir », refaire `NET·4c` (le sortir de `.res`, retirer `.a-venir`)
- [ ] **`t1` lot 4 — étape 4.6** : QCM IPv6 à la place des champs, et beaucoup plus de sources
- [ ] **`t1` lot 5 — fin de thème** : Filius en validation intégratrice + passerelle
      NSI facultative (ports, masque de sous-réseau)
- [ ] Depuis un poste de la salle : `nslookup` sur les trois sites du relevé de 4.3
      (pas de CDN, pas trois adresses dans le même /16) — remplaçants notés dans `DECISIONS.md`
- [ ] Visionner les deux vidéos (M Bidouille en 2.5, Cookie connecté en 4.3) et
      écrire les questions de QCM
- [ ] **Écrire l'étape 5 minimale** (`ia-snt/valider.mjs`) — le dernier maillon
- [x] ~~Porter `t2` sur le moteur partagé~~ — fait le 25/07 (lot 0)
- [ ] Porter `t0` sur le moteur partagé, puis les cinq séquences restantes
- [x] ~~`t2` lot 1 — séance 1 refondue~~ — fait le 25/07
- [x] ~~`t2` lot 3 — séance 2 HTML/CSS~~ · ~~lot 4 — cookies en séance 4~~ — faits le 25/07
- [ ] **`t2` lot 2** — séance 3, moteurs de recherche (document 03 :
      les cinq tâches, le SEO, le tableau géographique refait)
- [ ] **`t2` lot 5** — frise débranchée, 20 repères datés
- [ ] Vérifier en salle : CodeBetter accessible depuis le réseau du lycée,
      et quels navigateurs sont installés (l'étape cookies en demande deux).
      Non bloquant depuis le 25/07 : l'étape CodeBetter n'est plus une porte
- [ ] Écrire la grille de critères IA des cinq réponses corrigées de `t2` :
      `WEB-R1b` · `WEB-R2` · `WEB-R5` · `WEB-R4a` · `WEB-R7` — après le lot 2
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
