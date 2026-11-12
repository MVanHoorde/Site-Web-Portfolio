# Rappels d'entrée de séance — ES 1re

> État au 12/11/2026. Décisions : `_suivi/DECISIONS.md` (12/11/2026).
> 🔴 **Allumés pour les élèves le 12/11/2026, mais l'audit sérieux de Loïc reste à faire**, question
> par question (`prof/rappels.html`). Il les a jugées « déjà vraiment très bien » et a demandé
> qu'elles soient posées sans attendre.

## Ce qui est en place

- **Mécanique** : `assets/js/rappels-es.js` (le tirage, l'enregistrement) et `assets/js/rappels-rendu.js` (l'affichage), chargés après `sequence-snt.js`, puis la banque du chapitre.
  - À l'ouverture d'un chapitre, après plus de 2 h d'absence, l'élève connecté reçoit 4 questions : 3 sur ses 3 dernières étapes validées, dans l'ordre du cours, et 1 plus ancienne.
  - Tirage au hasard ; une seule variante d'un même `groupe` par série ; choix et étiquettes mélangés à l'affichage.
  - Une question réussie ne revient plus ; une question manquée revient en priorité.
  - L'élève peut passer. Le bandeau lui dit qu'elles lui serviront pour les évaluations.
  - Les questions s'ouvrent après la carte « Bon retour » du moteur.
- **Formes** : QCM de 2 à 6 choix, association (liste déroulante, ou pastilles quand une étiquette porte une fraction), curseur (tolérance, ou encadrement `entre` pour une estimation), « réfléchis puis révèle ». Images sous l'énoncé ou dans les cases, carte N-Z tracée.
- **Allumés** sur la radioactivité et les cristaux : `<body data-rappels="actif">`. Ailleurs, essai avec `?rappels=essai`.
- **Banques** :
  - `assets/js/rappels/es1-t1-c2.js` : radioactivité, 99 questions ;
  - `assets/js/rappels/es1-t1-c3.js` : cristaux, 46 questions. Elles suivent les clés d'étape de la page refondue (10 étapes) ; la version en ligne n'en a que 7 tant que la refonte n'est pas publiée.
- **Audit et statistiques** : `prof/rappels.html`, lien « ⟲ Rappels » du tableau de bord, espace ES 1re.
  - Audit : chaque question jouable telle que l'élève la voit, la bonne réponse repliée dessous ; marques ✓ ✎ ✗ et notes gardées dans le navigateur ; « Copier mes remarques » produit le texte à transmettre.
  - Statistiques : réussite par étape, par question, par élève ; séries passées.
- **Enregistrement** : dans l'état de la séquence (`progression`, champs `rappels/<id>`, `rappels/_vu`, `rappels/_series`). Aucune table nouvelle.

## Ajouter un chapitre

1. Écrire la banque `assets/js/rappels/<séquence>.js` (format : en-tête de `rappels-rendu.js`).
2. Charger `rappels-rendu.js`, la banque, puis `rappels-es.js` après `sequence-snt.js` ; la faire auditer dans `prof/rappels.html` (ajouter le chapitre à sa liste).
3. Allumer : `data-rappels="actif"` sur le `<body>`.

## Écrire une question

- **Autoportante** : rappeler en une demi-phrase le contexte de toute activité citée. Exemple : la balise de Poitiers mesure la radioactivité ambiante de l'air.
- Uniquement ce que l'étape (ou ce qui la précède) a présenté — images comprises : seulement celles que le cours montre.
- Calcul de tête en moins de 5 secondes ; un curseur dont l'échelle contient les erreurs classiques ; un encadrement pour une estimation.
- QCM : 5 ou 6 choix dès qu'il y a des erreurs classiques à proposer ; bonne réponse répartie ; choix de longueurs voisines.
- 🔴 Fractions en `{{frac:num:den}}`, jamais de barre oblique hors des unités ; noyaux en `{{nuc:A:Z:X}}`.
