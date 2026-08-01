# REPRISE — à lire en premier

> **Ce fichier est le point d'entrée de toute nouvelle conversation sur le
> projet SNT.** Il dit où on en est, ce qui reste ouvert, et ce qui ne doit
> surtout pas être refait. Le détail des décisions vit dans
> `_suivi/DECISIONS.md` ; l'état des chantiers dans `_suivi/ETAT-PROJET.md`.
>
> Dernière mise à jour : **1ᵉʳ août 2026**, fin de session.

---

## 1. Où on en est

Le dispositif tourne de bout en bout : un élève répond → le worker
pré-corrige sur le PC → le professeur valide depuis son iPad → l'élève voit
le retour. Cette boucle a été **éprouvée en conditions réelles** le
1ᵉʳ août avec deux comptes de test.

**En production, vérifié :**

- Migrations `008` à `011` appliquées et contrôlées (RLS active, `anon` sans
  aucun droit, fonctions `security definer`)
- Compte enseignant `l.vanhoorde@enseignant.isaac-etoile.fr` reconnu
- Tableau de bord `prof/index.html` : connexion, file de correction,
  validation en lot, rituel de séance, grille de suivi, fiche élève,
  bibliothèque de réponses types
- Worker automatisé (tâche planifiée Windows, toutes les 15 min)
- Grilles de pré-correction : **thème 1 complet, 30 sur 30**

**Comptes de test à supprimer avant la rentrée :** `leproftest`, `test02`,
plus ceux créés le 01/08. Classes de test : `SNTTSA`, `SNTTSB`.

---

## 2. 🔴 À faire avant toute autre chose

### 2.1 Les `data-cle` sur les étapes — SEUL POINT IRRÉVERSIBLE

Les clés de progression sont **positionnelles** (`et-s3-2`). Insérer une
étape ailleurs qu'en fin de séance réaffecte silencieusement le travail
déjà enregistré.

Aujourd'hui c'est sans conséquence — personne n'a de vraies données. **Après
la rentrée, c'est du travail d'élève perdu, sans message d'erreur.**

C'est aussi ce qui bloque le dépliage étape par étape de la grille de suivi.

### 2.2 Régénérer la clé `service_role`

Elle a transité dans une archive le 31/07. Supabase → Settings → API Keys →
régénérer, puis remettre dans `ia-snt/.env` et relancer le worker.
**Statut : non confirmé par Loïc.**

### 2.3 Ne jamais inclure `ia-snt/.env` dans une archive

Il est gitignoré, donc absent du dépôt public — mais `zip -r` l'emporte
quand même. Il était **encore présent** dans l'archive du 01/08.

```
zip -r depot.zip . -x "ia-snt/.env" ".git/*"
```

---

## 3. Bugs connus et non corrigés

| # | Où | Quoi |
|---|---|---|
| B1 | `pages/2nde-snt-t1-internet.html`, séance 1 | Un `div.step` **vide** entre les étapes 1.4 et 1.6, sans `data-step` ni `data-gate`. Sans effet visible, mais il fausse les comptages d'étapes. À supprimer. |
| B2 | Numérotation des étapes | Les numéros affichés (`ÉTAPE 1.6`) sont **écrits en dur** dans la page, pas générés. Un décalage est possible entre le numéro affiché et le rang réel. À vérifier avant la rentrée. |
| B3 | QCM, toutes séquences | **52 questions** ont leur bonne réponse trahie par sa longueur (la plus longue ou la plus courte de façon isolée). `node verifier.mjs` les liste. Non bloquant, à reprendre au fil de l'eau. |
| B4 | `criteres-snt.json` | Le thème 2 (`WEB-*`, 10 questions libres) n'a **aucune grille**. Les copies ressortiront en « sans objet ». Sans urgence : le thème 2 n'est pas abordé en septembre. |

**Jamais reproduit en test automatisé, à confirmer sur iPad :** le
défilement vers une étape (le haut du cadre doit arriver juste sous la barre
`#prog4`) et le placement du menu des retours, qui s'ouvre au-dessus de la
pastille flottante.

---

## 4. Ce qui attend une décision ou un contenu de Loïc

- **Phrases toutes faites du tableau de bord** — constante `PHRASES` en tête
  du script de `prof/index.html`. Les quatre formulations actuelles sont des
  propositions, à réécrire dans son ton.
- **`NET-G-modele-tcpip`** — l'emploi de « modèle » plutôt que « protocole »
  est en critère `plus_loin`. Le passer en `socle` ?
- **`NET-G-modem`** — retrouver « moduler / démoduler » est en `socle`.
  Trop exigeant ?
- **Quatre grilles de raisonnement à calibrer** avec de fausses copies,
  comme on l'a fait pour `NET-R3a` : `NET-R1` (datagramme), `NET-R2`
  (invention en avance), `NET-R4` (Marseille), `NET-R5` (réseau sans centre).
- **`NET-R4b`** — la grille décrit le champ plausible de la vidéo
  (M Bidouille, câbles sous-marins) mais **son contenu n'a pas été vérifié**.
  Un résumé de Loïc permettrait de la resserrer.
- **QCM des étapes 1.3 et 1.7** — non traités. 1.3 s'appuie sur le podcast
  (transcription non disponible), 1.7 est la frise, qui a déjà son exercice.
- **Volume du thème 1** — 7 épisodes de podcast + 3 ajouts de contenu.
  Décision 📌 en attente dans la page : garder, élaguer, ou répartir.

---

## 5. Chantiers différés, avec leurs décisions déjà prises

Ne pas rediscuter le principe : il est arrêté. Reprendre l'exécution.

### 5.1 Cadence du worker — dès que Loïc aura son emploi du temps (~fin août)

Remplacer la cadence unique de 15 min par des déclencheurs différenciés dans
`ia-snt/planifier-worker.ps1` : **toutes les 5 min (voire 1–2) pendant les
créneaux SNT**, toutes les heures le reste du temps. Trois séances d'1 h 15
par semaine, horaires fixes. Le rattrapage à l'allumage existe déjà
(déclencheur `AtLogOn`). Prévoir un petit fichier d'horaires que Loïc
remplit, à partir duquel le script génère les déclencheurs.

### 5.2 Correction par les pairs — ~novembre 2026

Circuit arrêté : **l'élève corrige d'abord, l'IA en repli** si personne ne
prend la copie (délai généreux, type 24 h). Toute correction d'élève remonte
à Loïc et passe par lui avant d'atteindre le destinataire — rien
d'automatique. Éligibilité du correcteur : séance entièrement terminée ET
toutes ses propres réponses validées. Copies anonymisées, pool de 3-4 qui se
poussent. Grille simplifiée à cocher + appréciation obligatoire.

**Motif du report :** la grille simplifiée ne peut pas être écrite avant
d'avoir de vraies copies de secondes.

À construire : table `corrections_pairs` + attribution avec verrou, écran
élève, second type d'objet dans la file de correction (~2-3 sessions).
Conséquences acceptées : le retour à l'élève arrive **plus tard** qu'avec
l'IA seule, et le volume de relecture de Loïc **double**.

### 5.3 Ouverture aux collègues — pas en 2026-2027

Loïc est seul en SNT cette année. Technique : table `enseignants_classes`
(`auth_id` + `classe_id`), et les policies passent de « est enseignant » à
« est enseignant **de cette classe** » — environ une demi-journée.

Trois points non techniques à régler **avant** d'ouvrir :
1. les rattachements sont posés par un administrateur (Loïc), jamais
   auto-attribués ;
2. le cloisonnement est réciproque — Loïc ne verrait plus les groupes des
   collègues sans un statut à part, à décider ;
3. à plusieurs, cela devient un traitement d'établissement : accord du chef
   d'établissement, inscription au registre des traitements, information des
   familles.

---

## 6. Pièges rencontrés — ne pas les réintroduire

Chacun a coûté du temps le 01/08. Ils sont documentés en détail dans
`_suivi/DECISIONS.md` ; voici le rappel court.

- **Un correctif JS peut être annulé par une règle CSS plus spécifique.**
  `.rempli .gaction{display:none}` l'emportait sur `style="display:''"`. Le
  bug était invisible en test automatisé : le test vérifiait que le JS
  faisait le bon geste, pas que le geste avait un effet à l'écran.
- **La remontée de déclaration ne traverse pas un IIFE.** Une fonction
  définie au niveau global était invisible depuis un module → `ReferenceError`
  silencieux, la pastille ne se créait jamais.
- **`scrollIntoView()` dans la même frame qu'un changement de classe** vise
  une position périmée. Toujours attendre deux `requestAnimationFrame`.
- **Ne jamais ancrer une extraction HTML sur un crochet ou une chaîne
  fixe** : l'ordre des attributs varie, BeautifulSoup le normalise à
  l'affichage, et les tableaux d'options contiennent des `[`.
- **Une regex `<div[^>]*>` casse sur les attributs contenant `>`** (ex.
  `<b>pourquoi</b>` dans un énoncé). 17 questions sur 40 étaient perdues
  silencieusement.
- **Windows PowerShell 5.1 lit un `.ps1` sans BOM comme de l'ANSI.** Les
  tirets cadratins deviennent des guillemets et cassent le script, avec un
  message désignant une ligne sans rapport. `verifier.mjs` le contrôle
  désormais.
- 🔴 **Un `MutationObserver` surveille les classes des étapes.** Il rappelle
  `majBarre()` → `majLignes()` à chaque changement. Une écriture de classe
  inconditionnelle dans ce chemin **fige la page au chargement** — c'est
  arrivé le 01/08, l'onglet tournait en boucle. Toujours vérifier qu'une
  valeur change avant de l'écrire. Le test `t-mutation` (vraie page +
  observateur réel) l'attrape ; les tests unitaires, non — ils n'ont pas
  d'observateur.
- **Toutes les étapes n'ont pas le même gabarit** : les encadrés spéciaux
  (`.france-box`) portent leur titre dans `.fl`, pas `.step-title`.

---

## 7. Méthode de travail — ce qui marche

1. **Lire le vrai code avant de proposer.** Plusieurs bugs venaient d'une
   supposition sur le fonctionnement du moteur.
2. **Tester avant de livrer.** L'environnement dispose de PostgreSQL 16
   (migrations), `jsdom` (comportement des pages), PowerShell 7 (analyse
   syntaxique des `.ps1`). Les suites de test vivent hors dépôt mais sont
   reconstructibles.
3. **Vérifier qu'un test échoue quand on casse la chose testée.** Un test
   qui répond toujours « OK » ne vaut rien — cette vérification a servi
   plusieurs fois.
4. **Incrémenter `?v=N` sur `sequence-snt.css` ET `.js`, dans TOUTES les
   pages**, y compris le hub `2nde-snt.html`. `verifier.mjs` le contrôle
   maintenant (bloquant).
5. **Sortie attendue de `node verifier.mjs` : exactement 2 problèmes** —
   `docs/tp-1-1.pdf` et l'`id="ri"` du cahier. Tout écart est une régression.
6. **Livraison en archives ZIP cumulatives**, extractibles à la racine.

---

## 8. Ordre suggéré pour la prochaine session

1. Les `data-cle` (§2.1) — le seul point qui devienne irréversible
2. Les deux bugs de contenu B1 et B2
3. Les décisions en attente du §4, qui débloquent les grilles
4. Le reste au fil de l'eau

Tout le reste peut vivre toute l'année sans gêner personne.
