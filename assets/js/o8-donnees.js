/* ============================================================
 *  o8-donnees.js — les jeux de données de l'outil 8, à UN SEUL
 *  endroit, partagés par les trois pages de l'outil :
 *      pages/2nde-pc-o8-construire-un-graphique.html   (à la main)
 *      pages/2nde-pc-o8b-graphique-tableur.html        (au tableur)
 *      pages/2nde-pc-o8c-graphique-calculatrice.html   (à la machine)
 *
 *  POURQUOI UN FICHIER À PART
 *  Chaque étude de cas doit pouvoir être traitée à la main, au
 *  tableur ET à la calculatrice avec EXACTEMENT le même jeu de
 *  valeurs : c'est la comparaison des trois résultats qui apprend
 *  quelque chose. Trois copies d'un tableau dans trois pages
 *  divergeraient à la première correction.
 *
 *  🔴 LES RÉSULTATS NE SONT PAS ÉCRITS, ILS SONT CALCULÉS.
 *  Pente, ordonnée à l'origine, R² et valeurs interpolées sont
 *  obtenus ici, par la méthode des moindres carrés, à partir des
 *  points bruts. Rien n'est recopié : une valeur affichée à l'élève
 *  ne peut donc pas diverger du tableau qu'il a sous les yeux.
 *  Les mêmes formules ont servi à contrôler les jeux avant
 *  publication.
 *
 *  ⚠ PORTÉE DU FICHIER : il ne contient QUE du contenu de cours —
 *  des mesures de physique et des fonctions de calcul. Aucune donnée
 *  d'élève, aucun appel réseau, aucun stockage. RGPD sans objet.
 *
 *  ⚠ CE FICHIER EST PARTAGÉ PAR TROIS PAGES. Le modifier oblige à
 *  incrémenter son ?v=N dans les TROIS, sinon les navigateurs des
 *  élèves servent l'ancienne version depuis leur cache.
 *
 *  Pas de module, pas d'import : un IIFE qui pose window.O8, comme
 *  le reste du dépôt.
 * ============================================================ */
(function (global) {
  'use strict';

  /* ----------------------------------------------------------
   *  1. La régression linéaire
   * ---------------------------------------------------------- */

  /* y = a·x + b — le cas général. */
  function affine(xs, ys) {
    var n = xs.length, i;
    var mx = 0, my = 0;
    for (i = 0; i < n; i++) { mx += xs[i]; my += ys[i]; }
    mx /= n; my /= n;
    var sxy = 0, sxx = 0;
    for (i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) * (xs[i] - mx); }
    var a = sxy / sxx, b = my - a * mx;
    return qualite(xs, ys, a, b, my);
  }

  /* y = a·x — l'origine est FORCÉE.
     🔴 Un choix de physique, jamais de confort : on ne force que si
     un argument physique impose le point (0 ; 0). Voir l'étape
     « proportionnalité ou fonction affine ? » de l'outil. */
  function proportionnel(xs, ys) {
    var n = xs.length, i, my = 0, sxy = 0, sxx = 0;
    for (i = 0; i < n; i++) my += ys[i];
    my /= n;
    for (i = 0; i < n; i++) { sxy += xs[i] * ys[i]; sxx += xs[i] * xs[i]; }
    var a = sxy / sxx;
    return qualite(xs, ys, a, 0, my);
  }

  /* R² = 1 − SCR/SCT, la somme des carrés des résidus rapportée à la
     dispersion autour de la moyenne.
     ⚠ Sur un modèle à origine forcée, cette définition peut donner un
     R² très inférieur — voire NÉGATIF — quand le forçage ne se
     justifie pas. Ce n'est pas un bug : c'est précisément ce qui rend
     la faute visible sur l'étalonnage D2. */
  function qualite(xs, ys, a, b, my) {
    var scr = 0, sct = 0, i, e;
    for (i = 0; i < xs.length; i++) {
      e = ys[i] - (a * xs[i] + b);
      scr += e * e;
      sct += (ys[i] - my) * (ys[i] - my);
    }
    var r2 = 1 - scr / sct;
    return { a: a, b: b, r2: r2, r: Math.sqrt(Math.max(r2, 0)) };
  }

  /* ----------------------------------------------------------
   *  2. Affichage — chiffres significatifs et virgule décimale
   * ---------------------------------------------------------- */

  /* n chiffres significatifs, virgule française. Renvoi O2 : un
     résultat ne porte pas plus de chiffres que les mesures.
     🔴 toPrecision et non un arrondi maison : lui seul CONSERVE les
     zéros de fin, qui sont significatifs (0,000700 fait bien trois
     chiffres, 0,0007 n'en ferait qu'un). Au-delà de 10⁴ ou en deçà
     de 10⁻³, on bascule en écriture scientifique — renvoi O1. */
  function cs(x, n) {
    if (!isFinite(x)) return '—';
    if (x === 0) return '0';
    var e = Math.floor(Math.log10(Math.abs(x)));
    var s = (e >= 4 || e <= -3) ? x.toExponential(n - 1) : x.toPrecision(n);
    if (s.indexOf('e') < 0) return fr(s);
    var m = s.split('e');
    return fr(m[0]) + ' × 10<sup>' + fr(m[1].replace('+', '')) + '</sup>';
  }

  /* nombre fixe de décimales, virgule française */
  function dec(x, n) {
    if (!isFinite(x)) return '—';
    return fr(x.toFixed(n));
  }

  /* virgule décimale, et le VRAI signe moins (U+2212) et non le trait
     d'union : sur une fiche imprimée, « -0,507 » et « −0,507 » ne se
     lisent pas pareil, et le second est le bon. */
  function fr(s) { return String(s).replace('.', ',').replace(/-/g, '−'); }

  /* ----------------------------------------------------------
   *  3. Les jeux de données
   *
   *  Chaque jeu porte ses points BRUTS et rien d'autre : tout ce qui
   *  s'en déduit se calcule. `origine` dit si forcer le passage par
   *  (0 ; 0) se justifie, et `pourquoi` porte l'argument — c'est un
   *  argument de physique, il doit être lisible dans la source.
   * ---------------------------------------------------------- */
  var JEUX = {

    /* ⚠ La colonne x est en AMPÈRES. La conversion mA → A fait partie
       de l'exercice : sans elle, la pente vaut 0,1 au lieu de 100. */
    D1: {
      titre: 'Caractéristique d\'un conducteur ohmique',
      x: [0, 0.020, 0.040, 0.060, 0.080, 0.100, 0.120],
      y: [0.00, 1.98, 4.05, 5.92, 8.10, 9.95, 12.10],
      xnom: 'I', xunite: 'A', ynom: 'U', yunite: 'V',
      xbrut: [0, 20, 40, 60, 80, 100, 120], xbrutunite: 'mA',
      penteNom: 'R', penteUnite: 'Ω',
      origine: 'legitime',
      pourquoi: 'Sans courant, il n\'y a aucune tension aux bornes du conducteur : le point (0 ; 0) est imposé par la physique, pas par le tableau.'
    },

    /* Lampe à incandescence : la résistance du filament croît avec sa
       température, donc la caractéristique s'incurve.
       🔴 Sert à montrer qu'un R² élevé ne prouve pas le modèle. */
    D1bis: {
      titre: 'Caractéristique d\'une lampe (dipôle non ohmique)',
      x: [0, 0.020, 0.040, 0.060, 0.080, 0.100, 0.120],
      y: [0.00, 0.35, 1.03, 1.90, 2.94, 4.12, 5.44],
      xnom: 'I', xunite: 'A', ynom: 'U', yunite: 'V',
      xbrut: [0, 20, 40, 60, 80, 100, 120], xbrutunite: 'mA',
      penteNom: '—', penteUnite: '—',
      origine: 'sans objet',
      pourquoi: 'Le nuage est incurvé : aucune droite ne le modélise, avec ou sans origine forcée.'
    },

    /* 🔴 À RECALER sur une table de référence (Perry's Chemical
       Engineers' Handbook, 6ᵉ éd., ou équivalent) : ces masses
       volumiques sont PLAUSIBLES, pas sourcées. Elles donnent une
       droite affine cohérente et une ordonnée à l'origine égale à la
       masse volumique de l'eau, ce qui suffit à l'enseignement visé,
       mais elles ne doivent pas être présentées comme des valeurs de
       table. Signalé dans la note de livraison du 20/09/2026. */
    D2: {
      titre: 'Étalonnage : masse volumique et concentration en masse',
      x: [0, 20, 40, 60, 80, 100],
      y: [1.000, 1.013, 1.027, 1.041, 1.055, 1.070],
      xnom: 'C<sub>m</sub>', xunite: 'g/L', ynom: 'ρ', yunite: 'g/mL',
      penteNom: 'a', penteUnite: '(g/mL)/(g/L)',
      origine: 'faute',
      pourquoi: 'À concentration nulle, il reste de l\'eau — et l\'eau a une masse volumique. Forcer l\'origine reviendrait à dire que l\'eau pure ne pèse rien.'
    },

    /* Hors programme de seconde : ouverture vers la première. */
    D3: {
      titre: 'Loi de Beer-Lambert (première — ouverture)',
      x: [0, 2, 4, 6, 8, 10],
      y: [0.00, 0.29, 0.58, 0.88, 1.15, 1.45],
      xnom: 'C', xunite: 'mmol/L', ynom: 'A', yunite: '',
      penteNom: 'k', penteUnite: 'L/mmol',
      origine: 'legitime',
      pourquoi: 'Une solution sans espèce colorée n\'absorbe pas : A = 0 quand C = 0, par définition de l\'absorbance.'
    },

    P: {
      titre: 'Le poids en fonction de la masse',
      x: [0, 0.100, 0.200, 0.300, 0.400, 0.500],
      y: [0.00, 0.98, 1.97, 2.94, 3.92, 4.90],
      xnom: 'm', xunite: 'kg', ynom: 'P', yunite: 'N',
      penteNom: 'g', penteUnite: 'N/kg',
      origine: 'legitime',
      pourquoi: 'Un objet sans masse n\'a pas de poids : le point (0 ; 0) est imposé.'
    },

    mV: {
      titre: 'Identifier un liquide par sa masse volumique',
      x: [0, 10.0, 20.0, 30.0, 40.0, 50.0],
      y: [0.00, 7.92, 15.75, 23.70, 31.52, 39.48],
      xnom: 'V', xunite: 'mL', ynom: 'm', yunite: 'g',
      penteNom: 'ρ', penteUnite: 'g/mL',
      origine: 'legitime',
      pourquoi: 'Un volume nul de liquide a une masse nulle — à condition d\'avoir tare le récipient.'
    },

    dvt: {
      titre: 'Vitesse du son dans l\'air',
      x: [0, 0.0290, 0.0580, 0.0875, 0.1165, 0.1455],
      y: [0, 10.0, 20.0, 30.0, 40.0, 50.0],
      xnom: 't', xunite: 's', ynom: 'd', yunite: 'm',
      penteNom: 'v', penteUnite: 'm/s',
      origine: 'legitime',
      pourquoi: 'Au démarrage du chronomètre, le son n\'a encore parcouru aucune distance.'
    },

    refraction: {
      titre: 'Réfraction air → plexiglas',
      x: [0, 0.174, 0.342, 0.500, 0.643, 0.766],
      y: [0, 0.259, 0.508, 0.743, 0.961, 1.140],
      xnom: 'sin i<sub>2</sub>', xunite: '', ynom: 'sin i<sub>1</sub>', yunite: '',
      penteNom: 'n<sub>2</sub>', penteUnite: 'sans unité',
      origine: 'legitime',
      pourquoi: 'Un rayon qui arrive perpendiculairement n\'est pas dévié : sin i₁ = 0 quand sin i₂ = 0.'
    }
  };

  /* ----------------------------------------------------------
   *  4. Rendu — le tableau de valeurs, en HTML
   *
   *  🔴 UN TABLEAU, JAMAIS UNE IMAGE. Il doit rester sélectionnable
   *  (l'élève le recopie dans son tableur), lisible au lecteur
   *  d'écran, et se reflow sur téléphone.
   * ---------------------------------------------------------- */
  function tableau(cle, options) {
    var j = JEUX[cle];
    if (!j) return '';
    var o = options || {};
    var brut = o.brut && j.xbrut;                 /* montrer x en mA plutôt qu'en A */
    var xs = brut ? j.xbrut : j.x;
    var xu = brut ? j.xbrutunite : j.xunite;
    var enteteX = j.xnom + (xu ? ' (' + xu + ')' : '');
    var enteteY = j.ynom + (j.yunite ? ' (' + j.yunite + ')' : '');
    var h = '<div class="tv-wrap"><table class="tv">';
    h += '<caption>' + j.titre + '</caption>';
    h += '<tr><th scope="row">' + enteteX + '</th>';
    xs.forEach(function (v) { h += '<td>' + String(v).replace('.', ',') + '</td>'; });
    h += '</tr><tr><th scope="row">' + enteteY + '</th>';
    j.y.forEach(function (v) {
      h += '<td>' + (o.decimales != null ? dec(v, o.decimales) : String(v).replace('.', ',')) + '</td>';
    });
    return h + '</tr></table></div>';
  }

  /* Le modèle d'un jeu, prêt à afficher : pente, ordonnée, R², et
     l'équation écrite AVEC LES GRANDEURS PHYSIQUES ET LEURS UNITÉS —
     jamais « y = 98,7x ». */
  function modele(cle, forcerOrigine, nbCS) {
    var j = JEUX[cle];
    var n = nbCS || 3;
    var m = forcerOrigine ? proportionnel(j.x, j.y) : affine(j.x, j.y);
    var uniteA = j.yunite && j.xunite ? j.yunite + '/(' + j.xunite + ')' : (j.yunite || 'sans unité');
    return {
      a: m.a, b: m.b, r2: m.r2, r: m.r,
      aTexte:  cs(m.a, n),
      bTexte:  cs(m.b, n),
      /* 🔴 « 1,0000 » serait un mensonge : un R² qui n'est pas
         exactement 1 ne doit pas s'afficher comme 1. On dit alors
         « > 0,9999 », ce qui est vrai et se commente en classe. */
      r2Texte: (m.r2 < 1 && m.r2 >= 0.99995) ? '&gt; 0,9999' : dec(m.r2, 4),
      uniteA: uniteA,
      /* l'équation telle qu'on l'écrit sur une copie */
      equation: j.ynom + ' = ' + cs(m.a, n) + ' × ' + j.xnom
              + (forcerOrigine ? '' : (m.b >= 0 ? ' + ' : ' − ') + cs(Math.abs(m.b), n))
    };
  }

  /* Interpolation : quel x correspond à ce y, d'après le modèle ? */
  function interpoler(cle, y, forcerOrigine) {
    var m = forcerOrigine ? proportionnel(JEUX[cle].x, JEUX[cle].y)
                          : affine(JEUX[cle].x, JEUX[cle].y);
    return (y - m.b) / m.a;
  }

  /* Le domaine réellement mesuré — au-delà, on extrapole. */
  function domaine(cle) {
    var xs = JEUX[cle].x;
    return { min: Math.min.apply(null, xs), max: Math.max.apply(null, xs) };
  }

  /* ----------------------------------------------------------
   *  5. Remplissage automatique de la page
   *
   *  Un élément qui porte data-o8-tableau="D1" reçoit son tableau ;
   *  data-o8-valeur="D1.aTexte" reçoit la valeur calculée. Déclaratif :
   *  aucune ligne de JS propre à une page, et une valeur affichée ne
   *  peut pas être saisie à la main dans le HTML.
   * ---------------------------------------------------------- */
  function remplir(racine) {
    var r = racine || document;

    Array.prototype.forEach.call(r.querySelectorAll('[data-o8-tableau]'), function (el) {
      el.innerHTML = tableau(el.dataset.o8Tableau, {
        brut: el.hasAttribute('data-brut'),
        decimales: el.dataset.decimales != null ? parseInt(el.dataset.decimales, 10) : null
      });
    });

    Array.prototype.forEach.call(r.querySelectorAll('[data-o8-valeur]'), function (el) {
      var p = el.dataset.o8Valeur.split('.');      /* « D1.aTexte » */
      var forcee = el.hasAttribute('data-origine-forcee');
      var m = modele(p[0], forcee, el.dataset.cs ? parseInt(el.dataset.cs, 10) : 3);
      if (m[p[1]] != null) el.innerHTML = m[p[1]];
    });

    Array.prototype.forEach.call(r.querySelectorAll('[data-o8-interpoler]'), function (el) {
      var p = el.dataset.o8Interpoler.split(':');  /* « D2:1.032 » */
      var x = interpoler(p[0], parseFloat(p[1]), el.hasAttribute('data-origine-forcee'));
      el.innerHTML = cs(x, el.dataset.cs ? parseInt(el.dataset.cs, 10) : 3);
    });
  }

  global.O8 = {
    JEUX: JEUX,
    affine: affine, proportionnel: proportionnel,
    cs: cs, dec: dec,
    tableau: tableau, modele: modele, interpoler: interpoler, domaine: domaine,
    remplir: remplir
  };

  if (global.document) {
    if (global.document.readyState === 'loading') {
      global.document.addEventListener('DOMContentLoaded', function () { remplir(); });
    } else {
      remplir();
    }
  }

})(window);
