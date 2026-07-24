/* ============================================================
 *  carte-reseau.js — moteur de carte-réseau (nœuds + anneaux)
 *  ------------------------------------------------------------
 *  Extrait de sequence-snt.js (lot 6) pour être partagé entre :
 *    · le HUB DE THÈME    — nœuds = séances, alimenté par le DOM
 *    · le HUB SNT         — nœuds = thèmes,  alimenté par Supabase
 *
 *  POURQUOI CETTE SÉPARATION
 *  Le code d'origine mélangeait deux choses : dessiner la carte, et
 *  aller chercher l'avancement dans le DOM de la séquence. Le hub SNT
 *  n'a pas de DOM de séquence : il n'a que huit lignes de base. Si le
 *  dessin sait lire le DOM, il n'est pas réutilisable ; s'il ne sait
 *  que dessiner à partir de données, il l'est. D'où la frontière :
 *
 *    dessiner(noeuds, options)  → du SVG, à partir de données pures
 *    majNoeuds(racine, etats)   → met à jour ce SVG, à partir d'états
 *
 *  Qui remplit « noeuds » et « etats » ne regarde pas ce fichier.
 *  C'est le rôle des deux adaptateurs (sequence-snt.js et hub-snt.js).
 *
 *  CLASSES CSS — inchangées (hub-n, hub-piste, hub-arc, hub-disque…)
 *  pour que la feuille de style existante continue de s'appliquer
 *  sans modification. Une seule est nouvelle : .hub-n.avenir.
 *
 *  RGPD : ce fichier ne connaît ni élève, ni identifiant, ni réseau.
 *  Il reçoit des nombres entre 0 et 1 et dessine des arcs de cercle.
 * ============================================================ */

(function (global) {
  'use strict';

  /* Rayon de l'anneau de progression. R_REVISION reste RÉSERVÉ à un
     futur anneau de révision (décision de Loïc : non dessiné). Le
     marqueur « tu es ici » se pose au-dessus de ce rayon-là pour que
     l'anneau puisse apparaître un jour sans rien déplacer. */
  var R_ANNEAU = 34, R_REVISION = 43;

  /* ----------------------------------------------------------
   *  Placements
   *
   *  2 à 6 nœuds : disposition d'origine, une ligne serpentée dans
   *  une boîte 680 × 300. Inchangée — la page Internet doit rendre
   *  exactement pareil qu'avant l'extraction.
   *
   *  7 et 8 nœuds : une seule ligne devient illisible (8 disques de
   *  68 px de diamètre dans 680 px, ils se touchent, et les libellés
   *  se chevauchent). On passe donc à DEUX RANGÉES en serpentin, dans
   *  une boîte plus haute. Le regard suit l'ordre : on part en haut à
   *  gauche, on va à droite, on descend, on repart vers la gauche.
   * ---------------------------------------------------------- */
  var PLACES = {
    2: [[190,150],[490,150]],
    3: [[130,190],[340,105],[560,190]],
    4: [[140,180],[305,105],[455,205],[600,110]],
    5: [[110,185],[250,100],[390,195],[520,105],[625,200]],
    6: [[100,180],[215,100],[330,190],[445,105],[555,190],[640,110]],
    7: [[105,95],[260,95],[415,95],[570,95],[490,290],[300,290],[110,290]],
    8: [[105,95],[260,95],[415,95],[570,95],[570,290],[415,290],[260,290],[105,290]]
  };
  /* Hauteur de la boîte large, par nombre de nœuds. */
  function hauteurLarge(n) { return (n >= 7) ? 400 : 300; }

  function esc(x) {
    return String(x == null ? '' : x)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ----------------------------------------------------------
   *  Décor de fond
   *
   *  Quelques nœuds morts et des liaisons pâles : c'est ce qui fait
   *  « réseau » plutôt que « frise ». Généré à partir de la hauteur
   *  réelle de la boîte, sinon il resterait collé en haut quand la
   *  carte passe à deux rangées.
   * ---------------------------------------------------------- */
  /* Les points hauts sont ancrés au HAUT de la boîte, les points bas
     au BAS. Les mesurer en proportion de la hauteur les faisait
     dériver dès que la boîte passait à 400 px — et, en 300 px, ne
     redonnait plus exactement le décor d'origine. Ancrage aux bords :
     la carte à deux rangées garde le même cadrage, et le rendu
     historique est reproduit à l'identique (test de non-régression). */
  function fond(pos, H) {
    var yA = 60, yB = 52;                    /* ancrés en haut  */
    var yC = H - 38, yD = H - 32,            /* ancrés en bas   */
        yE = H - 88, yF = H - 72;
    var p0 = pos[0], p2 = pos[Math.min(2, pos.length - 1)];
    return '<g class="hub-fond">'
      + '<circle cx="70" cy="'+yA+'" r="2.5"/><circle cx="215" cy="'+yC+'" r="2.5"/>'
      + '<circle cx="392" cy="'+yB+'" r="2.5"/><circle cx="530" cy="'+yD+'" r="2.5"/>'
      + '<circle cx="645" cy="'+yE+'" r="2.5"/><circle cx="38" cy="'+yF+'" r="2.5"/>'
      + '<path d="M70 '+yA+' L'+p0[0]+' '+p0[1]+' L215 '+yC+'"/>'
      + '<path d="M38 '+yF+' L'+p0[0]+' '+p0[1]+'"/>'
      + '<path d="M392 '+yB+' L'+p2[0]+' '+p2[1]+' L530 '+yD+'"/>'
      + '</g>';
  }

  /* ----------------------------------------------------------
   *  Un nœud
   *
   *  Toujours enveloppé dans un <a> : même quand il est verrouillé,
   *  l'élément existe et garde sa place. C'est majNoeuds() qui retire
   *  le href — retirer le href plutôt que masquer au CSS, parce qu'un
   *  lien sans href n'est ni cliquable ni atteignable au clavier,
   *  alors qu'un pointer-events:none laisse passer la tabulation.
   * ---------------------------------------------------------- */
  function noeud(n, x, y, vertical) {
    var c = 2 * Math.PI * R_ANNEAU;
    var g = '<g class="hub-n ' + esc(n.classe || '') + '" data-noeud="' + esc(n.id) + '">'
      + '<a>'
      + '<circle class="hub-piste" cx="'+x+'" cy="'+y+'" r="'+R_ANNEAU+'"/>'
      + '<circle class="hub-arc" cx="'+x+'" cy="'+y+'" r="'+R_ANNEAU+'" '
      +   'transform="rotate(-90 '+x+' '+y+')" stroke-dasharray="0 '+c.toFixed(1)+'"/>'
      + '<circle class="hub-disque" cx="'+x+'" cy="'+y+'" r="31"/>'
      + '<text class="hub-num" x="'+x+'" y="'+y+'" text-anchor="middle" '
      +   'dominant-baseline="central">' + esc(n.num) + '</text>';
    if (vertical) {
      g += '<text class="hub-nom" x="'+(x+52)+'" y="'+(y-4)+'">' + esc(n.nom) + '</text>'
         + '<text class="hub-etat" x="'+(x+52)+'" y="'+(y+14)+'"></text>';
    } else {
      g += '<text class="hub-nom" x="'+x+'" y="'+(y+R_ANNEAU+24)+'" text-anchor="middle">'
         +   esc(n.nom) + '</text>'
         + '<text class="hub-etat" x="'+x+'" y="'+(y+R_ANNEAU+40)+'" text-anchor="middle"></text>';
    }
    return g + '<title></title></a></g>';
  }

  /* ----------------------------------------------------------
   *  dessiner(noeuds, options) → chaîne HTML (deux SVG)
   *
   *  noeuds  : [{ id, num, nom, classe }]
   *  options : { decor:true|false, colonneSous:720 }
   *
   *  Deux dispositions dans le même composant, une seule visible
   *  selon la largeur. C'est le prix du placement libre des nœuds,
   *  assumé au lot 6 : une carte de réseau ne se réduit pas en
   *  colonne par simple CSS sans perdre ce qui la rend lisible.
   * ---------------------------------------------------------- */
  function dessiner(noeuds, options) {
    options = options || {};
    var n = noeuds.length;
    var pos = PLACES[n];
    if (!pos) {                                   /* au-delà de 8 : rang régulier */
      pos = noeuds.map(function (_, i) {
        return [80 + i * (520 / Math.max(1, n - 1)), i % 2 ? 110 : 190];
      });
    }
    var H = hauteurLarge(n);

    var h = '<svg class="hub-svg hub-large" viewBox="0 0 680 '+H+'" role="img" aria-hidden="true">';
    if (options.decor !== false) h += fond(pos, H);
    for (var i = 1; i < pos.length; i++) {
      var a = pos[i-1], b = pos[i];
      var mx = (a[0]+b[0])/2, my = (a[1]+b[1])/2 - 26;
      h += '<path class="hub-cable" data-cable="'+i+'" d="M'+a[0]+' '+a[1]
         +  ' Q'+mx+' '+my+' '+b[0]+' '+b[1]+'"/>';
    }
    h += '<g class="hub-ici hub-ici-large"><text class="hub-ici-txt" text-anchor="middle">TU ES ICI</text></g>';
    noeuds.forEach(function (nd, k) { h += noeud(nd, pos[k][0], pos[k][1], false); });
    h += '</svg>';

    var Hc = 50 + n * 104;
    h += '<svg class="hub-svg hub-colonne" viewBox="0 0 320 '+Hc+'" role="img" aria-hidden="true">';
    for (var j = 1; j < n; j++) {
      h += '<path class="hub-cable" data-cable="'+j+'" d="M60 '+(50+(j-1)*104+R_ANNEAU)
         +  ' L60 '+(50+j*104-R_ANNEAU)+'"/>';
    }
    h += '<g class="hub-ici hub-ici-colonne"><text class="hub-ici-txt">TU ES ICI</text></g>';
    noeuds.forEach(function (nd, k) { h += noeud(nd, 60, 50 + k * 104, true); });
    return h + '</svg>';
  }

  /* ----------------------------------------------------------
   *  majNoeuds(racine, etats)
   *
   *  etats : { id: { part, verrou, avenir, ici, etat, href } }
   *    part   0→1  remplissage de l'anneau
   *    verrou      accessible plus tard (contenu existant)
   *    avenir      contenu pas encore écrit — nœud fantôme
   *    ici         nœud courant, reçoit le marqueur
   *    etat        texte sous le nom (« 3 sur 5 », « terminée »…)
   *    href        destination ; absent → pas de lien
   *
   *  VERROU vs AVENIR : deux silences différents, et l'élève doit
   *  pouvoir les distinguer. « Verrouillé » = ça existe, ce n'est pas
   *  encore ton tour. « À venir » = ce n'est pas encore écrit. Les
   *  confondre laisserait croire à un blocage là où il n'y a qu'un
   *  chantier.
   * ---------------------------------------------------------- */
  function majNoeuds(racine, etats) {
    if (!racine) return;
    var c = 2 * Math.PI * R_ANNEAU;
    var gIci = { large: null, colonne: null };

    Array.prototype.forEach.call(racine.querySelectorAll('.hub-n'), function (g) {
      var e = etats[g.getAttribute('data-noeud')] || {};
      var part = Math.max(0, Math.min(1, e.part || 0));

      var arc = g.querySelector('.hub-arc');
      if (arc) arc.setAttribute('stroke-dasharray',
        (c * part).toFixed(1) + ' ' + (c * (1 - part) + 1).toFixed(1));

      var mort = !!(e.verrou || e.avenir);
      g.classList.toggle('verrou', !!e.verrou);
      g.classList.toggle('avenir', !!e.avenir);
      g.classList.toggle('fini',   part === 1 && !mort);
      g.classList.toggle('ici',    !!e.ici);

      var lien = g.querySelector('a');
      if (lien) {
        if (mort || !e.href) {
          lien.removeAttribute('href');
          lien.setAttribute('aria-disabled', 'true');
        } else {
          lien.setAttribute('href', e.href);
          lien.removeAttribute('aria-disabled');
        }
      }

      var etat = g.querySelector('.hub-etat');
      if (etat) etat.textContent = e.etat || '';
      var titre = g.querySelector('title');
      if (titre) {
        var nom = g.querySelector('.hub-nom');
        titre.textContent = (nom ? nom.textContent : '')
          + (e.etat ? ' — ' + e.etat : '');
      }

      if (e.ici) {
        var svg = g.closest ? g.closest('svg') : null;
        if (svg && svg.classList.contains('hub-large'))   gIci.large   = g;
        if (svg && svg.classList.contains('hub-colonne')) gIci.colonne = g;
      }
    });

    /* Le marqueur se pose au-dessus du nœud courant, une fois par
       disposition. Il est placé en coordonnées SVG, pas en CSS :
       une carte à placement libre n'a pas de flux à suivre. */
    ['large', 'colonne'].forEach(function (v) {
      var m = racine.querySelector('.hub-ici-' + v);
      if (!m) return;
      var g = gIci[v];
      if (!g) { m.setAttribute('opacity', '0'); return; }
      var piste = g.querySelector('.hub-piste');
      if (!piste) { m.setAttribute('opacity', '0'); return; }
      var cx = parseFloat(piste.getAttribute('cx'));
      var cy = parseFloat(piste.getAttribute('cy'));
      var t  = m.querySelector('.hub-ici-txt');
      m.setAttribute('opacity', '1');
      if (v === 'large') { t.setAttribute('x', cx); t.setAttribute('y', cy - R_REVISION - 8); }
      else               { t.setAttribute('x', cx + 52); t.setAttribute('y', cy - 22); }
    });
  }

  global.CarteReseau = {
    dessiner   : dessiner,
    majNoeuds  : majNoeuds,
    R_ANNEAU   : R_ANNEAU,
    R_REVISION : R_REVISION,
    PLACES     : PLACES
  };

})(window);
