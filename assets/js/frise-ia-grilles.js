/* ============================================================
 *  frise-ia-grilles.js — la SOURCE UNIQUE des règles de la frise
 *  de l'IA : grilles d'évaluation, seuils de caractères, calendrier.
 *  (décision EST-FRISE-01, grilles validées par Loïc le 22/11/2026)
 *
 *  Lu par la page élève (rubrique « Comment tu es évalué »), le
 *  tableau de bord (prof/frise-ia.html : dossier, audit, exports pour
 *  l'IA) et l'outil du jour J (prof/frise-ia-jourj.html).
 *  🔴 Changer une règle = changer CE fichier, et incrémenter son ?v=
 *  dans les trois pages.
 * ============================================================ */
(function (global) {
  /* Seuils « pour avoir tous les points » (≠ minimum bloquant de la
     page, data-focus-min). Sous le seuil : −0,5 par question. */
  var SEUILS = { 'FRIA-Q1': 400, 'FRIA-Q2': 400, 'FRIA-Q3': 400, 'FRIA-Q4': 400, 'FRIA-Q5': 400, 'FRIA-Q6': 200 };

  /* [critère, points, ce que voit l'élève, comment le professeur compte] */
  var FICHE = [
    ['Complète', 3, 'Le titre, la date, le résumé pour la frise, les six questions, au moins une image, deux sources.',
     'Titre, date et résumé : 1 · six questions : 1 · une image et deux sources : 1'],
    ['Assez développée', 3, 'Au moins 400 caractères pour les questions 1 à 5, 200 pour la question 6.',
     '−0,5 par question sous son seuil'],
    ['Avec tes mots', 4, 'Tu reformules, avec ton vocabulaire, tu expliques les termes techniques. Un copier-coller ou un texte d’IA ne vaut rien.',
     'Copier-coller ou texte d’IA avéré : 0'],
    ['Des images légendées et sourcées', 2, 'Chaque image dit ce qu’elle montre et d’où elle vient.',
     'Légende : 1 · source : 1'],
    ['Des sources fiables, vérifiées', 3, 'Deux sources différentes, un auteur ou un organisme qu’on peut identifier. Ni encyclopédie collaborative, ni IA.',
     'Deux sources différentes : 1 · identifiables : 1 · pas d’encyclopédie collaborative ni d’IA : 1'],
    ['Le sujet est bien traité', 5, 'Dans le sujet, exact, compréhensible : on a l’essentiel de ton sujet en lisant ta fiche.',
     'Appréciation d’ensemble : pas de hors-sujet, pas d’erreur, l’essentiel est là']
  ];

  var ORAL = [
    ['Entre 1 min et 1 min 30', 4, 'Au moins une minute, au plus une minute trente. Va à l’essentiel.',
     'Dans la plage : 4 · jusqu’à 15 s en dessous ou au-dessus : 2 · au-delà : 0 (chrono du jour J)'],
    ['Tu ne lis pas', 5, 'Tes notes sont sur ta tablette, comme aide-mémoire. Tu présentes tes images, tu ne lis pas un texte.', ''],
    ['Tu vulgarises', 5, 'Ton but : intéresser ceux qui t’écoutent, comme au Grand oral.', ''],
    ['Tu t’appuies sur tes images', 3, 'Tu montres et tu expliques ce qu’on voit à l’écran.', ''],
    ['Tu t’adresses à la classe', 3, 'Voix posée, regard vers ceux qui écoutent.', '']
  ];

  /* Durée de l'oral, en secondes (chronos du jour J). */
  var DUREE = { min: 60, max: 90, tolerance: 15 };
  function pointsDuree(s) {
    if (s >= DUREE.min && s <= DUREE.max) return 4;
    if (s >= DUREE.min - DUREE.tolerance && s <= DUREE.max + DUREE.tolerance) return 2;
    return 0;
  }

  /* Le calendrier de la séquence. construit = l'interface existe.
     ouvert = ce qui est déjà fait. */
  var CALENDRIER = [
    { d: '2026-11-19', quoi: 'Ton sujet (questionnaire, tirage), début des recherches', qui: 'Classe entière', construit: true },
    { d: '2026-11-22', quoi: 'Envoi de la fiche, audit et retour du professeur, exports pour l’IA, rubrique « Comment tu es évalué »', qui: 'Tableau de bord', construit: true },
    { d: '2026-12-03', quoi: 'Fiche terminée · premiers retours · sélection des thématiques de débat', qui: 'Groupe A', construit: false },
    { d: '2026-12-10', quoi: 'Fiche terminée · premiers retours · sélection des thématiques de débat · thématiques et groupes de présentation publiés pour tous', qui: 'Groupe B', construit: false },
    { d: '2026-12-17', quoi: 'Présentations par thématique : ordre tiré au sort, projection pilotée par le professeur, mode oral sur tablette, chronos et grille d’oral', qui: 'Classe entière', construit: false },
    { d: '2027-01-14', quoi: 'Préparation des débats', qui: 'Groupe A', construit: false },
    { d: '2027-01-21', quoi: 'Préparation des débats', qui: 'Groupe B', construit: false },
    { d: '2027-01-28', quoi: 'Débat', qui: 'Terminale 6', construit: false },
    { d: '2027-02-11', quoi: 'Débat (bac blanc le 28/01)', qui: 'Terminale 3', construit: false, note: 'probable' }
  ];

  function total(g) { return g.reduce(function (s, c) { return s + c[1]; }, 0); }

  global.FRISE_GRILLES = { SEUILS: SEUILS, FICHE: FICHE, ORAL: ORAL, DUREE: DUREE, pointsDuree: pointsDuree,
                           CALENDRIER: CALENDRIER, total: total };
})(window);
