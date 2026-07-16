# État du projet — Site pédagogique Physique-Chimie

> Dernière mise à jour : 16/07/2026 · tenu à jour par Loïc + Claude
> Site : https://mvanhoorde.github.io/Site-Web-Portfolio/ · Repo : MVanHoorde/Site-Web-Portfolio

Vue d'ensemble. Détail par chapitre dans `chapitres.md` ; idées dans `IDEES.md`.

---

## 🎯 Objectif de la période (vacances)

**Dégrossir un maximum de chapitres** (régime A) : mettre TOUT en ligne à l'état
d'ébauche navigable, manques signalés par blocs 🚧. Loïc va déposer les PPTX de
tous les chapitres. Le raffinage et la **validation** viendront ensuite, en
régime B, chapitre par chapitre.

**Régime A élargi depuis le 15/07** (voir `_modeles/CONSIGNES-production-chapitre.md`) :
exercices et corrections rédigés en entier même quand une image les accompagne,
encarts formule reconstitués depuis la source, QR codes et hyperliens vidéo
décodés et posés en vrais liens (Kahoot compris), courte recherche web possible
si un point manque pour la compréhension. Restent en régime B : photos réelles,
schémas/illustrations à redessiner en SVG, grands tableaux, et — toujours —
le lien du DS (jamais posé automatiquement, quel que soit le contenu de la
source, puisqu'il change chaque année).

## ⚠ Statut de validation — à lire

- **Aucun cours n'est validé à ce jour.** Certaines fiches ont été *proposées*
  (C2, C3, C4) mais **aucune n'est validée**.
- La **mise en ligne n'est pas un jalon** : tout est / sera en ligne. Ce qui se
  suit, c'est le **niveau de finition validé** (jalons 2 → 7 de `chapitres.md`).
- La validation est un **acte explicite de Loïc** (« oui, ce cours me convient,
  je peux l'utiliser l'an prochain »), jamais présumée par Claude.

## 🚦 Priorités

1. **Finir le dégrossissage** de tous les chapitres disponibles (régime A).
2. Mettre en place le travail en **Claude Code / VS Code** pour le raffinage.
3. Démarrer le raffinage + la validation, en commençant par les chapitres les
   plus utilisés en début d'année.
4. Intégrer le **calendrier scolaire** (fourni plus tard) pour ordonner les priorités.

## ⚠ Alertes

- ✅ **Page de niveau `pages/2nde-physique-chimie.html` mise à jour et fournie** :
  les 4 chapitres du Thème 3 y sont **liés** (liens anti-préfixe, mêmes cartes
  `.chapitre` que les Thèmes 1-2, descriptions à puces conservées).
- ⚠ **T3 — divergence de structure à trancher (décision de Loïc).** L'ancienne
  page prévoyait 3 chapitres, avec **spectres en CH.2 et signaux en CH.3** ; les
  PPTX déposés donnent **4 chapitres** dans l'ordre son / signaux / spectres /
  réfraction (+ réfraction, absent de l'ancienne page). La page a été alignée sur
  **l'ordre des PPTX/slugs** (obligatoire pour que carte et page portent le même
  numéro). Deux ajustements faits, réversibles : (1) « Vision et image — spectres
  lumineux » renommé **« Dispersion et spectres »** (titre réel de la page de
  cours) ; (2) signaux et spectres permutés. Si Loïc préfère l'ordre pédagogique
  son / spectres / signaux, il faut **renuméroter les fichiers** (t3-c2 ↔ t3-c3 :
  noms, clés localStorage, titres internes) — à faire en régime B.
- ⚠ **T3-C2 (signaux et capteurs) Ex2, loi des nœuds au point B : correction de
  la source fausse → corrigée.** La source écrivait une relation incohérente au
  nœud B ; rétablie en **I₃ + I₆ = I₅** (I₅ sortant), avec un aparté explicatif.
  À revoir en régime B.
- ⚠ **T3-C2 : pas de diapositive « Pour le DS » ni de Kahoot** dans la source →
  liste de compétences à fournir (bloc 🚧), pas de chip Kahoot.
- ⚠ **T3-C2 : hyperliens vidéo dupliqués dans la source** (mêmes URLs sur
  plusieurs diapositives) → posés au mieux à leur emplacement le plus probable ;
  à vérifier en régime B.
- 🔴 **T3-C4 (réfraction et réflexion) : la source est une VERSION ÉLÈVE, sans
  corrigés.** Les **5 corrections ont été rédigées par Claude** (calculs vérifiés)
  et **portent la mention « à valider »** sur la page. À contrôler en priorité en
  régime B. En particulier **Ex3** (température de l'eau depuis n=1,333) dépend
  d'un **graphe n=f(θ) laissé en 🚧** : réponse ≈ 20 °C donnée sous réserve.
- ⚠ **T3 (4 chapitres) : liens DS laissés en attente** — jamais posés
  automatiquement (ils changent chaque année). Bloc 🚧 dédié dans chaque
  checklist.
- ⚠ **C6 et C7 : pas de diapositive « Pour le DS »** dans les sources — listes de compétences à fournir (et pas de Kahoot non plus pour ces deux chapitres).
- ⚠ **C5 : lien DS laissé en attente** — un lien existe dans la source (étiqueté « DS - 2024 », donc 2024/2025) mais n'a pas été activé, dans l'attente du choix de Loïc (DS de cette année ou de l'an dernier).
- ⚠ **T2 (3 chapitres) : liens DS laissés en attente** — comme pour C5, des liens « DS » figurent dans les sources mais ne sont jamais posés automatiquement.
- ⚠ **T2-C2 Ex6 : unité corrigée** — la source notait le résultat « ≈ 1,98×10²⁰ kg » ; corrigé en **newton (N)** (la valeur numérique est exacte).
- ⚠ **T2-C2 Ex8 : deux points à trancher** — (1) la correction inverse g Paris (9,73) et g équateur (9,81) par rapport à l'énoncé et à l'Image 13 (physiquement, g est plus grand à Paris ≈ 9,81) ; (2) l'écart annoncé « 8 % » est en réalité ≈ **0,8 %**. Transcrit fidèlement, avec aparté ; à revoir en régime B.
- ⚠ **T2-C2 : doublon de numéro d'exercice** — deux « Exercice 10 » dans la source (diapos 11 et 13) ; le second (plan incliné) a été renuméroté **Ex11**.
- ⚠ **T2-C3 : coquille corrigée** — « le masse » → « la masse » (définition de l'inertie).
- 💡 **Décision (T2) — convention d'écriture des vecteurs** : en ébauche, la flèche est rendue par un caractère combinant Unicode placé au-dessus du symbole (lisible, mais imparfait sur les groupes multi-lettres). À raffiner en régime B (petit composant SVG ou notation dédiée).

## 📊 Avancement (Seconde — Thème 1)

Tout est en ligne à l'état d'ébauche. Niveau de finition **validé** :

| Chapitre | Cours validé | Fiche |
|---|---|---|
| T1-C1 Matière macroscopique | ⬜ non | — |
| T1-C2 Transformations phys./chim. | ⬜ non | proposée, non validée |
| T1-C3 Constitution de l'atome | ⬜ non | proposée, non validée |
| T1-C4 Dénombrer les entités | ⬜ non | proposée, non validée |
| T1-C5 Solutions aqueuses | ⬜ non | — |
| T1-C6 Cortège électronique | ⬜ non | — |
| T1-C7 Stabilité des entités chimiques | ⬜ non | — |

> Les autres thèmes/chapitres s'ajouteront au fil du dégrossissage.

## 📊 Avancement (Seconde — Thème 2)

Tout est en ligne à l'état d'ébauche (régime A élargi). Niveau de finition **validé** :

| Chapitre | Cours validé | Fiche | Code |
|---|---|---|---|
| T2-C1 Décrire le mouvement | ⬜ non | — | REP3RE |
| T2-C2 Modéliser une action sur un système | ⬜ non | — | F0RCES |
| T2-C3 Le principe d'inertie | ⬜ non | — | IN3RTE |

> Codes de déblocage choisis par Claude, à transmettre via le cahier de textes (modifiables).

## 📊 Avancement (Seconde — Thème 3 · Ondes et signaux)

**Nouveau (16/07).** Les 4 chapitres sont **en ligne à l'état d'ébauche**
(régime A élargi). ⚠ **Pas encore liés** depuis la page de niveau (absente —
voir Alertes + snippet `cartes-theme3-a-coller.html`). Niveau de finition
**validé** :

| Chapitre | Cours validé | Fiche | Code |
|---|---|---|---|
| T3-C1 Émission et perception d'un son | ⬜ non | — | S0NORE |
| T3-C2 Signaux et capteurs | ⬜ non | — | S1GNAL |
| T3-C3 Dispersion et spectres | ⬜ non | — | PR1SME |
| T3-C4 Réfraction et réflexion | ⬜ non | — | M1RAGE |

> Codes de déblocage choisis par Claude, à transmettre via le cahier de textes (modifiables).
> **Rappels de vigilance pour le régime B** : C2 (nœud B corrigé, pas de DS/Kahoot,
> vidéos dupliquées) et surtout **C4 (corrections rédigées par Claude, à valider)**.

## 🔜 Prochaines actions

- [ ] **Trancher la structure du Thème 3** (ordre des PPTX conservé, ou
      renumérotation vers son / spectres / signaux — voir Alertes).
- [ ] **Valider les 5 corrections de T3-C4** rédigées par Claude (source sans corrigé).
- [ ] Trancher le nœud B de **T3-C2 Ex2** et la loi des nœuds associée.
- [ ] Déposer les PPTX des chapitres restants pour dégrossissage (régime A).
- [ ] Vérifier que chaque ébauche est liée depuis `pages/2nde-physique-chimie.html`.
- [ ] Cloner le repo dans VS Code + extension Claude Code (pour le raffinage).
- [ ] Fournir le calendrier scolaire pour ordonner les priorités.
