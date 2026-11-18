/* ============================================================
 *  frise-ia-sujets.js — les 36 sujets de la frise de l'IA
 *  (terminale ES, 3.5 · pages/term-es-t3-c5-frise-ia.html)
 *
 *  Lu par la page élève (questionnaire, tirage) ET par le tableau
 *  de bord (prof/frise-ia.html). La base ne connaît que les
 *  identifiants (bdd/schema/049) : un titre se retouche ici, sans SQL.
 *  🔴 Ne jamais changer un identifiant une fois des sujets tirés :
 *  l'élève perdrait le sien. Ajouter un sujet = une ligne de plus.
 *
 *  Étiquettes (PROPOSITION du 18/11/2026, à valider par Loïc) : sur
 *  chaque axe, les numéros des réponses du questionnaire (AXES) que le
 *  sujet croise. Le score d'un sujet = nombre d'axes où il croise au
 *  moins un choix de l'élève (« croise 4 de tes choix »).
 * ============================================================ */
(function (global) {
  var AXES = [
    { id: 'epoque', q: 'Quelle époque t’attire ?',
      r: ['l’Antiquité', 'du Moyen Âge à la Révolution', 'le XIXᵉ siècle', 'les guerres mondiales',
          'la seconde moitié du XXᵉ', 'les années 2000-2010', 'aujourd’hui'] },
    { id: 'theme', q: 'Quels thèmes ?',
      r: ['mathématiques et logique', 'jeux et compétitions', 'art, image et musique', 'langage et conversation',
          'guerre et secrets', 'santé et vivant', 'argent et entreprises', 'lois, droits et vie privée'] },
    { id: 'genre', q: 'Quel genre de sujet ?',
      r: ['une personne', 'une machine ou un objet', 'une idée ou une théorie', 'une entreprise',
          'un événement', 'une loi ou une institution'] },
    { id: 'matiere', q: 'Plutôt…',
      r: ['ce qui se touche (le matériel)', 'ce qui se programme (le logiciel)', 'les deux'] },
    { id: 'lieu', q: 'Et d’où ?',
      r: ['la France', 'l’Europe', 'les États-Unis', 'le reste du monde', 'peu importe'] }
  ];

  /* [id, titre, date affichée, année de placement, époque, thèmes, genre, matière, lieu] */
  var L = [
    ['anticythere',        'La machine d’Anticythère',               'IIᵉ-Iᵉʳ s. av. J.-C.', -100,   [0],   [0],   [1],   [0], [1]],
    ['automates',          'Les automates, d’Al-Jazari à Vaucanson', '1206 → 1739',         1206,   [1],   [2],   [1],   [0], [1, 3]],
    ['pascaline',          'La pascaline',                            '1642',                1642,   [1],   [0, 6],[1],   [0], [0]],
    ['turc-mecanique',     'Le Turc mécanique',                       '1770',                1770,   [1],   [1],   [1, 4],[0], [1]],
    ['jacquard',           'Le métier à tisser de Jacquard',          '1801',                1801,   [2],   [2, 6],[1],   [2], [0]],
    ['babbage',            'La machine à différences de Babbage',     '1822',                1822,   [2],   [0],   [1, 0],[0], [1]],
    ['ada-lovelace',       'Ada Lovelace',                            '1843',                1843,   [2],   [0, 2],[0],   [1], [1]],
    ['hollerith',          'Les cartes perforées de Hollerith',       '1890',                1890,   [2],   [6],   [1, 3],[2], [2]],
    ['turing-1936',        'Turing et l’article de 1936',             '1936',                1936,   [3],   [0],   [0, 2],[1], [1]],
    ['bletchley-colossus', 'Bletchley Park et Colossus',              '1943-1944',           1943,   [3],   [4],   [1, 4],[2], [1]],
    ['eniac',              'L’ENIAC',                                 '1945',                1945,   [3],   [4, 0],[1],   [0], [2]],
    ['von-neumann',        'L’architecture de von Neumann',           '1945',                1945.6, [3],   [0],   [2, 0],[2], [2]],
    ['test-turing',        'Le test de Turing',                       '1950',                1950,   [4],   [3],   [2],   [1], [1]],
    ['grace-hopper',       'Grace Hopper et le premier compilateur',  '1952',                1952,   [4],   [3, 0],[0],   [1], [2]],
    ['dartmouth',          'Le séminaire de Dartmouth',               '1956',                1956,   [4],   [0],   [4],   [1], [2]],
    ['perceptron',         'Le perceptron de Rosenblatt',             '1958',                1958,   [4],   [5, 0],[1, 2],[2], [2]],
    ['eliza',              'ELIZA, premier agent conversationnel',    '1966',                1966,   [4],   [3, 5],[1],   [1], [2]],
    ['inria',              'Inria',                                   '1967',                1967,   [4],   [0],   [5],   [1], [0]],
    ['minsky-papert',      'Minsky et Papert : la critique',          '1969',                1969,   [4],   [0],   [2, 0],[1], [2]],
    ['pouzin-cyclades',    'Louis Pouzin et CYCLADES',                '1973',                1973,   [4],   [3],   [0],   [2], [0]],
    ['systemes-experts',   'Les systèmes experts (MYCIN)',            'années 1970',         1975,   [4],   [5],   [1, 2],[1], [2]],
    ['cnil',               'La CNIL et les données scolaires',        '1978',                1978,   [4],   [7],   [5],   [2], [0]],
    ['minitel',            'Le Minitel',                              '1982',                1982,   [4],   [6, 3],[1],   [2], [0]],
    ['lecun-convolutifs',  'LeCun et les réseaux convolutifs',        '1989',                1989,   [4],   [2, 0],[0, 2],[1], [0, 2]],
    ['deep-blue',          'Deep Blue contre Kasparov',               '1997',                1997,   [4],   [1],   [4, 1],[2], [2]],
    ['donnees-massives',   'Les données massives',                    'années 2000',         2006,   [5],   [6, 7],[2],   [1], [2, 4]],
    ['imagenet-alexnet',   'ImageNet et AlexNet',                     '2012',                2012,   [5],   [2],   [4],   [2], [2, 3]],
    ['nvidia',             'Nvidia, des jeux vidéo à l’IA',           '1993 → aujourd’hui',  2013.5, [5, 6],[6, 1],[3],   [0], [2]],
    ['alphago',            'AlphaGo et le coup 37',                   '2016',                2016,   [5],   [1],   [4],   [1], [1, 3]],
    ['attention',          '« Attention Is All You Need »',           '2017',                2017,   [5, 6],[3, 0],[2],   [1], [2]],
    ['generation-images',  'La génération d’images',                  '2022',                2022,   [6],   [2],   [1, 2],[1], [4]],
    ['chatgpt',            'ChatGPT',                                 '2022',                2022.6, [6],   [3, 6],[1, 3],[1], [2]],
    ['mistral',            'Mistral AI',                              '2023',                2023,   [6],   [6, 3],[3],   [1], [0]],
    ['hallucinations',     'Les « hallucinations »',                  '2023',                2023.5, [6],   [3, 7],[2],   [1], [4]],
    ['cout-energetique',   'Le coût énergétique des modèles',         '2023-2025',           2024.2, [6],   [5, 6],[2],   [2], [4]],
    ['ai-act',             'L’AI Act européen',                       '2024',                2024.6, [6],   [7],   [5],   [2], [1]]
  ];

  var SUJETS = L.map(function (l) {
    return { id: l[0], titre: l[1], date: l[2], annee: l[3],
             tags: { epoque: l[4], theme: l[5], genre: l[6], matiere: l[7], lieu: l[8] } };
  });
  var PAR_ID = {};
  SUJETS.forEach(function (s) { PAR_ID[s.id] = s; });

  /* Nombre d'axes où le sujet croise les choix (gouts = {axe: [numéros]}).
     « les deux » (matière) et « peu importe » (lieu) croisent tout. */
  function score(sujet, gouts) {
    var n = 0;
    AXES.forEach(function (a) {
      var choix = (gouts && gouts[a.id]) || [];
      if (!choix.length) return;
      var t = sujet.tags[a.id] || [];
      var touche = choix.some(function (c) {
        if (a.id === 'matiere' && (c === 2 || t.indexOf(2) >= 0)) return true;
        if (a.id === 'lieu' && (c === 4 || t.indexOf(4) >= 0)) return true;
        return t.indexOf(c) >= 0;
      });
      if (touche) n++;
    });
    return n;
  }

  /* Tous les identifiants, du plus au moins croisé ; égalités mélangées
     (c'est cette liste que la base départage par l'occupation). */
  function ordre(gouts) {
    return SUJETS.map(function (s) { return { id: s.id, n: score(s, gouts), h: Math.random() }; })
      .sort(function (a, b) { return (b.n - a.n) || (a.h - b.h); })
      .map(function (x) { return x.id; });
  }

  /* Résumé court d'un sujet : « Antiquité · une machine ou un objet » */
  function etiquette(s) {
    return [AXES[0].r[s.tags.epoque[0]], AXES[2].r[s.tags.genre[0]], AXES[3].r[s.tags.matiere[0]].replace(/ \(.*\)/, '')].join(' · ');
  }

  global.FRISE_IA = { AXES: AXES, SUJETS: SUJETS, PAR_ID: PAR_ID, score: score, ordre: ordre, etiquette: etiquette };
})(window);
