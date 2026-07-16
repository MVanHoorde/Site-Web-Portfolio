# Site pédagogique — contexte projet

> Lu automatiquement à chaque session de Claude Code.
> Suivi détaillé : `_suivi/ETAT-PROJET.md` (vue d'ensemble, alertes),
> `_suivi/chapitres.md` (par chapitre), `_suivi/IDEES.md`.
> Conventions de production des chapitres PC : `_modeles/CONSIGNES-production-chapitre.md`.

---

## Qui je suis (ce qui est utile pour toi)

Loïc, professeur de physique-chimie et de SNT. Je tiens à la **qualité et à
l'originalité de mes contenus** — le réchauffé me démotive, la fierté de l'objet
est mon moteur. Je suis **non routinier** : je passe vite d'une idée à l'autre,
j'arrive préparé, je sais choisir mes combats. Ne me freine pas avec des
« priorise / tu en fais trop » génériques ; réserve les alertes aux **vrais
pièges concrets** (RGPD, dette technique, sécurité).

## Règle de collaboration (importante)

Sur tout ce qui touche le **fond pédagogique** (choix des notions, formulations,
progression, accroches), **ma vision est souveraine**. Ton rôle : échafaudage —
chercher, structurer, coder, encoder, proposer une V1 dans mon ton, assurer la
cohérence. Jamais concepteur à ma place. Quand tu proposes du contenu de cours,
signale-le comme une proposition à valider.

Contenu partagé avec des collègues : **on refait la forme, jamais le fond**
(compatibilité avec leur progression et leurs fichiers OneDrive).

**Commence toujours par proposer un plan court avant de modifier des fichiers,
et travaillons point par point.**

La **validation** est un acte explicite de ma part (« oui, ce cours me convient,
je peux l'utiliser l'an prochain »), jamais présumée. La mise en ligne n'est pas
un jalon : tout est / sera en ligne.

---

## Les deux familles de pages

Le dépôt héberge **deux gabarits distincts**, à ne pas mélanger :

| | **Chapitres physique-chimie** | **Hub SNT** |
|---|---|---|
| Exemple | `pages/2nde-pc-t1-c3-constitution-atome.html` | `pages/2nde-snt-t2-le-web.html` |
| Structure | thème → chapitre → sections | séquence → séance → étape → champ |
| Style | `assets/css/chapitre-commun.css?v=N` | CSS inline dans la page |
| Déblocage | code de déblocage (`AT0MES`…) | verrouillage progressif + mode enseignant |
| Persistance | `localStorage` | **interdit** — téléchargement de fiche |

## Règles techniques communes

- **RGPD dès la conception** : aucune collecte cachée, aucune donnée sensible,
  données minimales. **Polices auto-hébergées** (`assets/css/fonts.css`) —
  jamais de `fonts.googleapis.com` ni d'autre CDN qui exposerait l'IP des élèves.
- Pas de framework, pas de build : HTML/CSS/JS vanilla, lisible et modifiable.
- Ressources externes chargées par lien (vidéos, CodeBetter…). Illustrations
  maison en **SVG** quand c'est possible.
- Responsive (**cible iPad**), focus clavier visible, `prefers-reduced-motion`
  respecté.
- 🔴 **`assets/css/chapitre-commun.css` est versionné** : incrémenter le `?v=N`
  dès qu'une modification change le rendu, sinon les navigateurs des élèves
  servent l'ancienne feuille depuis leur cache (voir `_suivi/ETAT-PROJET.md`).

---

## Le hub SNT

### Le projet en une phrase

Un **hub numérique pour mes élèves de seconde en SNT** : chaque séquence du
programme est une suite de **séances fléchées**. L'élève suit des activités
(vidéos, manips, exercices), puis **complète une fiche** dont une partie se
**corrige automatiquement**. À terme, ce hub devient la colonne vertébrale de
mon enseignement SNT.

### Grammaire du hub (à respecter partout)

**Hiérarchie :** `séquence` → `séance` (≈ 1h30) → `étape` (une notion) →
`champ` (exercice).

**Trajet d'une étape**, toujours dans cet ordre : **objectif** (🎯) →
**ressources fléchées** (chacune avec un *code d'activité* en monospace type
`WEB·2b`, un *type*, et un *timing*) → **à retenir** → **champ à compléter**.

**Types de champs** (déjà codés dans `pages/2nde-snt-t2-le-web.html`, à réutiliser) :

- **QCM** — corrigé en direct (vert/rouge), valide l'étape.
- **Texte à trous** — corrigé en direct.
- **Schéma à légender** (SVG + menus déroulants) — corrigé en direct.
- **Définition / texte libre** — copier-coller **bloqué**, envoi « pour
  correction », statut *en attente* puis *validé* ; en phase 2 c'est l'IA qui
  corrige. Une réponse validée peut **révéler un encadré de contexte** (point
  d'histoire, biblio).
- **Réflexion perso** — **non notée**, bouton « Partager avec la classe », jamais
  de bon/mauvais (on valorise, on ne juge pas).

**Éléments transverses :**

- **Verrouillage progressif** : une séance se débloque quand la précédente est
  **entièrement validée** (les étapes marquées `data-gate`). Barre de progression
  par séance.
- **Mode enseignant** : interrupteur qui déverrouille tout (télécommande de
  coordination et de déblocage en cas d'élève coincé).
- **Télécharger ma fiche** (récap HTML) + **Recommencer** + **pop-up de fin de séance**.
- **Encadrés spéciaux** : « fierté française » 🇫🇷 (bandeau tricolore), « le
  sais-tu » (histoire), **biblio** (liens sources — à ajouter systématiquement
  dès qu'on ouvre un point d'histoire).
- **Bonus « pour aller plus loin »** : dépliable, avec des **manips fun/geek**
  (ex. trafiquer un titre via l'inspecteur) et des questions ouvertes ambitieuses.
- **Easter eggs** discrets bienvenus (message console, etc.).

### Design du hub (identité visuelle à conserver)

- **Polices** : `Space Grotesk` (titres), `IBM Plex Sans` (corps),
  `IBM Plex Mono` (codes, balises, URL) — toutes servies par
  `../assets/css/fonts.css`.
- **Palette** (variables CSS en tête de fichier) : fond gris-bleu froid, accent
  **bleu hypertexte** `--link:#2445c7`, ambre pour les activités, vert
  « validé », plus des teintes dédiées (france, histoire, bonus).
  **Réutilise les variables**, n'invente pas de couleurs en dur.
- **Ton des « à retenir »** : **simples, calibrés seconde**, et **pré-remplis**
  (trace de référence — ce n'est pas un champ à compléter). C'est un choix arrêté.

### Ton & pédagogie (SNT)

Niveau seconde, langage simple et direct. J'aime : les **points d'histoire**
contextualisés, la **fierté française** (avec sources), les **questions sur leurs
usages perso**, les **manips concrètes et amusantes**, l'esprit critique
(fiabilité, IA, sécurité). Chaque ouverture historique s'accompagne de **liens
biblio**.

### Le plan en deux phases (ne pas mélanger)

**Phase 1 — MAINTENANT : le contenu, prêt pour la rentrée.**
Finaliser les séquences en **HTML statique autonome**. La correction locale
(QCM, trous, schémas) fonctionne pour de vrai ; le texte libre est **simulé**
(statut *validé* après un délai). Présentable en classe sans aucun serveur.

**Phase 2 — PLUS TARD : le vrai système.**
VPS Linux en Europe (RGPD) hébergeant l'application + une **base de données** ;
correction du texte libre par IA (**Ollama en local sur RTX 5080** en test, ou
**API Claude** — modèle Haiku, quelques euros/an) ; **comptes élèves**,
sauvegarde côté serveur, tableau de bord enseignant, alertes de décrochage
**basées sur la progression réelle** (pas sur la surveillance du temps ni la
comparaison entre élèves — piège RGPD/éthique). Cette base « progression
exportable » servira aussi un futur projet de jeu pédagogique.

⚠ **Interdit en phase 1 : `localStorage` / `sessionStorage` dans le hub SNT**
(ça casse l'aperçu et ce n'est pas la vraie solution). La persistance passe par
le **téléchargement de fichier** ; en phase 2, par la base de données côté
serveur. (Les chapitres de physique-chimie, eux, utilisent `localStorage` — c'est
un gabarit distinct, voir le tableau plus haut.)
