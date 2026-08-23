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
   *  2 à 5 nœuds : disposition d'origine, une ligne serpentée dans
   *  une boîte 680 × 300.
   *
   *  6 nœuds et plus : DEUX RANGÉES en serpentin, dans une boîte plus
   *  haute. Le regard suit l'ordre : on part en haut à gauche, on va à
   *  droite, on descend, on repart vers la gauche.
   *
   *  Pourquoi 6 et plus 7 (audit du 23/08/2026) : sur une seule ligne,
   *  six disques laissent 85 px entre deux centres voisins, alors que
   *  le libellé d'une séance en fait couramment 170. Le nom de la
   *  sixième séance de t1 recouvrait donc le disque de la cinquième et
   *  sortait de la boîte de 46 px. Le défaut était mécanique : il
   *  revenait dès qu'un libellé dépassait une vingtaine de caractères.
   *  Écarter les nœuds n'aurait fait que déplacer le seuil ; les deux
   *  rangées le suppriment, avec 230 px entre voisins et aucune
   *  rencontre possible entre un libellé et un disque de l'autre rang.
   *
   *  Les dispositions 2 à 5 restent au pixel près celles d'avant
   *  l'extraction du composant.
   * ---------------------------------------------------------- */
  var PLACES = {
    2: [[190,150],[490,150]],
    3: [[130,190],[340,105],[560,190]],
    4: [[140,180],[305,105],[455,205],[600,110]],
    5: [[110,185],[250,100],[390,195],[520,105],[625,200]],
    6: [[105,95],[335,95],[565,95],[565,290],[335,290],[105,290]],
    7: [[105,95],[260,95],[415,95],[570,95],[490,290],[300,290],[110,290]],
    8: [[105,95],[260,95],[415,95],[570,95],[570,290],[415,290],[260,290],[105,290]]
  };
  /* Hauteur de la boîte large, par nombre de nœuds. Les 20 px de plus
     qu'à l'origine logent la deuxième ligne d'un libellé long — voir
     lignesNom() : sans eux, le nom d'un nœud du rang bas passait sous
     le bord de la boîte. */
  function hauteurLarge(n) { return (n >= 6) ? 420 : 320; }

  /* ----------------------------------------------------------
   *  Couper un libellé long en deux lignes
   *
   *  Une séance s'appelle « Activité débranchée — la frise du Web » ou
   *  « Adresses IP, DNS et diagnostic » : sur une seule ligne, ces
   *  noms font 170 à 210 px et vont recouvrir le disque ou le nom du
   *  nœud voisin. Écarter les nœuds ne réglait rien — le nom suivant
   *  serait plus long. On coupe donc le libellé en deux lignes aussi
   *  équilibrées que possible, sur l'espace le plus proche du milieu.
   *  Deux lignes suffisent : au-delà, c'est le nom de la séance qu'il
   *  faut raccourcir, pas la carte qu'il faut agrandir.
   * ---------------------------------------------------------- */
  var NOM_COURT = 26;                       /* caractères sur une ligne */
  function lignesNom(txt) {
    txt = String(txt == null ? '' : txt).trim();
    if (txt.length <= NOM_COURT) return [txt];
    var milieu = txt.length / 2, coupe = -1, ecart = Infinity;
    for (var i = 0; i < txt.length; i++) {
      if (txt.charAt(i) !== ' ') continue;
      var d = Math.abs(i - milieu);
      if (d < ecart) { ecart = d; coupe = i; }
    }
    if (coupe < 0) return [txt];            /* un seul mot, très long */
    return [txt.slice(0, coupe), txt.slice(coupe + 1)];
  }

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
    var g = '<g class="hub-n ' + esc(n.classe || '') + '" data-noeud="' + esc(n.id) + '"'
      + ' data-nom="' + esc(n.nom) + '">'
      + '<a>'
      + '<circle class="hub-piste" cx="'+x+'" cy="'+y+'" r="'+R_ANNEAU+'"/>'
      + '<circle class="hub-arc" cx="'+x+'" cy="'+y+'" r="'+R_ANNEAU+'" '
      +   'transform="rotate(-90 '+x+' '+y+')" stroke-dasharray="0 '+c.toFixed(1)+'"/>'
      + '<circle class="hub-disque" cx="'+x+'" cy="'+y+'" r="31"/>'
      + '<text class="hub-num" x="'+x+'" y="'+y+'" text-anchor="middle" '
      +   'dominant-baseline="central">' + esc(n.num) + '</text>';
    /* Le nom complet reste lisible d'un seul tenant sur le <g> : une
       fois découpé en <tspan>, textContent recolle les morceaux sans
       l'espace de la coupure, et l'infobulle disait « la frisedu Web ». */
    var ls = lignesNom(n.nom), saut = 15;
    function pave(px, ancre, yPremiere) {
      return '<text class="hub-nom" x="'+px+'" y="'+yPremiere+'"'+ancre+'>'
        + ls.map(function (l, i) {
            return '<tspan x="'+px+'" dy="'+(i ? saut : 0)+'">' + esc(l) + '</tspan>';
          }).join('')
        + '</text>';
    }
    if (vertical) {
      var yv = y - 4 - (ls.length - 1) * 8;
      g += pave(x+52, '', yv)
         + '<text class="hub-etat" x="'+(x+52)+'" y="'+(yv+(ls.length-1)*saut+18)+'"></text>';
    } else {
      var yh = y + R_ANNEAU + 24;
      g += pave(x, ' text-anchor="middle"', yh)
         + '<text class="hub-etat" x="'+x+'" y="'+(yh+(ls.length-1)*saut+16)+'" text-anchor="middle"></text>';
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

    /* La boîte déborde de 30 px de chaque côté du cadre historique de
       680 px, sans déplacer un seul nœud : le libellé d'un nœud posé
       tout au bord (x = 625 sur cinq nœuds) n'a que 55 px devant lui et
       sortait du cadre, rattrapé de justesse par overflow:visible. Une
       marge symétrique coûte 4 % de réduction et supprime le cas. */
    var h = '<svg class="hub-svg hub-large" viewBox="-30 0 740 '+H+'" role="img" aria-hidden="true">';
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
        titre.textContent = (g.getAttribute('data-nom') || (nom ? nom.textContent : ''))
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
