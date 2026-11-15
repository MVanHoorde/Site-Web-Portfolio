# Rappels d'entrée de séance — SNT

> État au 15/11/2026. Décisions : `_suivi/DECISIONS.md` (15/11/2026). Mécanique commune avec l'ES :
> `_suivi/rappels-es1.md` (tirage, enregistrement, formes de question, règles d'écriture).
> 🔴 **Allumés pour les élèves le 15/11/2026.** Les reprises (`=`) sont des QCM déjà audités ; les questions
> `≈` (reformulées, ou d'images) attendent l'audit de Loïc dans `prof/rappels.html?espace=snt`.

## Ce qui est en place

- **Séquences** : tout ce qui est audité jusqu'à la fin d'Internet.

  | Séquence | Banque | Questions | dont reprises `=` | `≈` reformulées | `≈` images nouvelles |
  |---|---|---|---|---|---|
  | Introduction, systèmes informatisés | `assets/js/rappels/snt-t0.js` | 38 | 29 | 1 | 8 |
  | Représenter l'information | `assets/js/rappels/snt-m1.js` | 38 | 36 | 1 | 1 |
  | Internet | `assets/js/rappels/snt-t1.js` | 88 | 68 | 14 | 6 |

- **Mêmes conditions qu'en ES** : 4 questions à l'ouverture, après plus de 2 h d'absence, élève connecté ; 3 sur les 3 dernières étapes validées, 1 plus ancienne. Moteur : `assets/js/rappels-es.js` (le nom est resté, il sert aux deux matières).
- **Écartés** : les QCM du mode d'emploi du dispositif (`SYS-Q1`, `SYS-Q8`, `SYS-Q6` : pastilles, rituel de la fiche, mode enseignant) ; deux questions sur les chiffres d'une vidéo (`REP-Q5` 1 et 4) ; « ces trois documents… » (`NET-Q-trafic` 8). Les étapes bonus non verrouillées ne posent rien.
- **Images** : seulement celles que la page montre à l'étape ou avant. La carte de CYCLADES et le croquis d'ARPANET portent leur nom écrit : on y demande autre chose (ce que les PTT ont préféré, où étaient les quatre nœuds). Le graphique de Moore porte son titre : il accompagne « quel type de loi ? », pas « quelle loi ? ».
- **L'encart Pouzin (2.2)** n'a pas de `step-kicker` : le moteur et l'écran d'audit lisent son numéro dans `.ix`.
- **Tableau de bord** : lien ⟲ Rappels dans les espaces ES 1re et SNT ; `rappels.html?espace=snt` ne liste que les trois séquences SNT.
- **Banc d'essai** : `python -I _outils/tests/rappels-snt.test.py .` — ouverture après 3 h, quatre questions jouées, résultats enregistrés, rien sous 2 h ni pour un invité, images présentes et chargées, écran d'audit complet.

## Ajouter une séquence

À faire **en dernier**, une fois la séquence auditée (décision du 15/11/2026).

1. Reprendre ses QCM : ils sont en JSON dans la page (`.qcmbox` → `script.qcm-data`, champs `q`, `o`, `r`, `c`). Une photo dans l'énoncé (`<img>`) devient `image:{src, alt}`. Une réponse multiple se reformule en QCM à une réponse ; plus de 6 choix, on en retire.
2. Écrire `assets/js/rappels/snt-tN.js` (en-tête : modèle de `snt-t1.js`), l'ajouter à `prof/rappels.html` (script + liste `CHAPITRES`, espace `snt`).
3. Sur la page, après `sequence-snt.js` : `rappels-rendu.js`, la banque, `rappels-es.js` ; `data-rappels="actif"` sur le `<body>`.
4. Ajouter la séquence au banc (`SEQS`) et le relancer.
