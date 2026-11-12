# Rappels d'entrée de séance — ES 1re

> État au 12/11/2026. Décisions : `_suivi/DECISIONS.md` (12/11/2026).
> **Rien n'est validé** : les questions attendent l'audit de Loïc.

## Ce qui est en place

- **Mécanique** : `assets/js/rappels-es.js`, chargé après `sequence-snt.js`.
  - À l'ouverture d'un chapitre, après plus de 2 h d'absence, l'élève connecté reçoit 4 questions : 3 sur ses 3 dernières étapes validées, dans l'ordre du cours, et 1 plus ancienne.
  - Le tirage est au hasard, et les choix des QCM sont mélangés à l'affichage.
  - Une question réussie ne revient plus ; une question manquée revient en priorité.
  - L'élève peut passer les questions. Le bandeau lui dit qu'elles lui serviront pour les évaluations.
  - Les questions s'ouvrent après la carte « Bon retour » du moteur.
- **Banques** :
  - `assets/js/rappels/es1-t1-c2.js` : radioactivité, 65 questions ;
  - `assets/js/rappels/es1-t1-c3.js` : cristaux, 44 questions.
- **Audit et statistiques** : `prof/rappels.html`, lien « ⟲ Rappels » du tableau de bord, espace ES 1re.
  - L'onglet Audit montre chaque question avec sa bonne réponse. On la marque ✓, ✎ ou ✗, avec une note, puis « Copier mes remarques » produit le texte à transmettre.
  - L'onglet Statistiques donne les taux de réussite par étape, par question et par élève, ainsi que les séries passées.
- **Enregistrement** : dans l'état de la séquence (`progression`, champs `rappels/<id>`, `rappels/_vu`, `rappels/_series`). Aucune table nouvelle.

## Pour allumer un chapitre

1. Loïc audite la banque dans `prof/rappels.html`, puis colle ses remarques dans la conversation.
2. Claude applique les remarques.
3. Sur le `<body>` de la page : `data-rappels="actif"`.

Avant l'étape 3, on peut essayer sur une page avec `?rappels=essai` dans l'adresse.

Les cristaux ne chargent pas encore le module : leur page est en refonte. Le jour de l'activation, il faudra ajouter les deux balises `<script>` après `sequence-snt.js`, comme en radioactivité.

## Écrire une question

- **Autoportante** : rappeler en une demi-phrase le contexte de toute activité citée. Exemple : la balise de Poitiers mesure la radioactivité ambiante de l'air.
- Uniquement ce que l'étape (ou ce qui la précède) a présenté ; aucune image.
- Pour les QCM : bonne réponse répartie entre A et D, choix de longueurs voisines, distracteurs plausibles.
