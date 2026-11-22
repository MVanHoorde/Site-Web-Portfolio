/* ============================================================
 *  frise-ia-thematiques.js — les thématiques de présentation du
 *  17/12 (validées par Loïc le 22/11/2026, PAR TYPE et non par époque).
 *
 *  🔴 Chargé par le tableau de bord SEULEMENT (prof/frise-ia.html,
 *  prof/frise-ia-jourj.html) : les élèves les découvrent le 10/12.
 *  Le dépôt est public : ce fichier reste lisible par qui le cherche.
 *
 *  Chaque sujet de frise-ia-sujets.js appartient à une thématique ;
 *  AJUSTE déplace un sujet pour une classe (répartitions validées le
 *  22/11 : en T6, pas de groupe « la machine contre l'humain »).
 *  Les groupes d'une classe = ses élèves rangés par sujet : un élève
 *  qui change de sujet change de groupe sans rien toucher ici.
 * ============================================================ */
(function (global) {
  var THEMES = [
    { id: 'machines',  titre: 'Les machines à calculer', icone: '⚙️' },
    { id: 'pionniers', titre: 'Les pionniers et les idées', icone: '💡' },
    { id: 'humain',    titre: 'La machine contre l’humain', icone: '♟️' },
    { id: 'apprendre', titre: 'Apprendre comme un cerveau', icone: '🧠' },
    { id: 'quotidien', titre: 'L’IA au quotidien', icone: '📱' },
    { id: 'deraille',  titre: 'Quand ça déraille', icone: '⚠️' }
  ];
  var SUJETS = {
    machines:  ['anticythere', 'automates', 'pascaline', 'jacquard', 'babbage', 'hollerith', 'eniac', 'transistor', 'minitel', 'nvidia'],
    pionniers: ['ada-lovelace', 'leibniz-binaire', 'boole-logique', 'turing-1936', 'bletchley-colossus', 'von-neumann', 'shannon-bit',
                'grace-hopper', 'dartmouth', 'inria', 'minsky-papert', 'pouzin-cyclades'],
    humain:    ['turc-mecanique', 'test-turing', 'eliza', 'deep-blue', 'watson-jeopardy', 'alphago'],
    apprendre: ['perceptron', 'systemes-experts', 'lecun-convolutifs', 'imagenet-alexnet', 'attention', 'alphafold'],
    quotidien: ['chatgpt', 'mistral', 'assistants-vocaux', 'traduction-automatique', 'voiture-autonome', 'bayes-anti-spam', 'generation-images'],
    deraille:  ['bogues-celebres', 'ver-morris', 'hallucinations', 'biais-algorithmes', 'donnees-massives', 'cout-energetique', 'ai-act', 'cnil']
  };
  /* par code de classe : sujet → thématique */
  var AJUSTE = {
    EST606: { 'von-neumann': 'machines', 'alphago': 'apprendre', 'test-turing': 'pionniers' }
  };

  var DE = {};
  Object.keys(SUJETS).forEach(function (t) { SUJETS[t].forEach(function (s) { DE[s] = t; }); });

  function themeDe(sujet, codeClasse) {
    var a = AJUSTE[codeClasse] || {};
    return a[sujet] || DE[sujet] || null;
  }

  /* Les groupes d'une classe : [{theme, eleves:[{eleve, sujet}]}], sans les vides. */
  function groupes(eleves, tirages, codeClasse) {
    var par = {}; (tirages || []).forEach(function (t) { par[t.eleve_id] = t.sujet; });
    var g = THEMES.map(function (t) { return { theme: t, eleves: [] }; });
    var sans = [];
    (eleves || []).forEach(function (e) {
      var s = par[e.id], t = s && themeDe(s, codeClasse);
      if (!t) { sans.push(e); return; }
      g.filter(function (x) { return x.theme.id === t; })[0].eleves.push({ eleve: e, sujet: s });
    });
    return { groupes: g.filter(function (x) { return x.eleves.length; }), sansSujet: sans };
  }

  global.FRISE_THEMES = { THEMES: THEMES, SUJETS: SUJETS, themeDe: themeDe, groupes: groupes };
})(window);
