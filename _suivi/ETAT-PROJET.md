# État du projet — Site pédagogique Physique-Chimie

> Dernière mise à jour : 15/07/2026 · tenu à jour par Loïc + Claude
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

## 🔜 Prochaines actions

- [ ] Déposer les PPTX de tous les chapitres pour dégrossissage (régime A).
- [ ] Vérifier que chaque ébauche est liée depuis `pages/2nde-physique-chimie.html`.
- [ ] Cloner le repo dans VS Code + extension Claude Code (pour le raffinage).
- [ ] Fournir le calendrier scolaire pour ordonner les priorités.
