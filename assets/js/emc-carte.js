/* ============================================================
 *  emc-carte.js — la carte mentale collaborative de l'EMC
 *  (« La liberté à l'épreuve du labyrinthe de Nina »).
 *
 *  Un canevas Konva (assets/js/vendor/konva-9.3.6.min.js) monté
 *  dans un conteneur, en trois modes :
 *    · 'eleve'      : voit toute la carte, n'écrit QUE dans la zone
 *                     de sa table ;
 *    · 'prof'       : écrit partout (centre compris), sélectionne,
 *                     masque, supprime ;
 *    · 'projection' : lecture seule, zoom et plein écran.
 *
 *  API (window.EMC.Carte) :
 *    var carte = EMC.Carte.monter(conteneur, {
 *      mode, zone, eleveId?, contenus: { carte, missions },
 *      persister(ligne) → Promise,      // nouvel élément
 *      modifier(id, champs) → Promise   // { supprime } | { donnees } | { couleur } | { masque }
 *    });
 *    carte.charger(lignes) · carte.appliquer(ligne)
 *    carte.etat({ ouverte, figee, zonesVerrouillees })
 *    carte.contenus(c) · carte.vueEnsemble() · carte.centrerSur(zone)
 *    carte.exporterPNG({ ratio }) → Promise<Blob>
 *    carte.selection · événement 'emc:selection' sur le conteneur
 *    carte.contenuMasque(id, donnees)  // prof : le contenu caché (emc_carte_masques)
 *    carte.lignes()                    // éléments visibles (tests, export)
 *    carte.detruire()
 *
 *  Repère : monde de 4000 × 4000, centre (0, 0), y vers le bas.
 *  La géométrie (zones, sous-zones) est celle de emc-commun.js, qui
 *  est le miroir de emc_zone_de (031-emc.sql). EMC.dansZone est le
 *  juge : rien n'est persisté qu'il refuse, puisque le serveur le
 *  refuserait aussi.
 * ============================================================ */
(function (global) {
  'use strict';

  var EMC = global.EMC;
  var Konva = global.Konva;
  var DEMI = EMC.DEMI, R0 = EMC.R_CENTRE, R1 = EMC.R_ANNEAU;
  var RAD = Math.PI / 180;
  var POLICE = "'Inter', 'IBM Plex Sans', system-ui, sans-serif";
  /* Les émojis d'abord dans une police d'émojis : sur certains postes, la
     police du texte en fournit une version sans couleur, ou rien. */
  var POLICE_EMOJI = "'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', 'IBM Plex Sans', sans-serif";
  var POLICE_TITRE = "'Space Grotesk', 'Inter', sans-serif";
  var MARINE = '#173d6b', ENCRE = '#161f33', CYAN = '#3fa7d6';

  var COULEURS_DEFAUT = [
    { cle: 'bleu', hex: '#2563c9', sens: 'Fait observé dans le jeu' },
    { cle: 'orange', hex: '#e8743b', sens: 'Liberté ou droit en jeu' },
    { cle: 'rouge', hex: '#d6402b', sens: 'Émotion, ressenti' },
    { cle: 'violet', hex: '#7a3e8f', sens: 'Personne impliquée' },
    { cle: 'vert', hex: '#2fae6a', sens: 'Action, solution, ressource' },
    { cle: 'noir', hex: '#161f33', sens: 'Décoration, titres, flèches (libre)' }
  ];

  /* Teintes de fond par quadrant : [anneau intérieur, anneau extérieur]. */
  var TEINTES = { NE: ['#fdf0e6', '#fff8f2'], NO: ['#f2edfa', '#f9f6fd'],
                  SO: ['#e7f5ee', '#f3faf6'], SE: ['#e5f0fa', '#f2f8fd'] };

  /* Les autocollants : des émojis, et des « pastilles » de texte dans
   * l'univers des SMS et des réseaux sociaux. Aucune image importée. */
  var AUTOCOLLANTS = [
    '👍', '❤️', '💔', '😢', '😡', '😨', '😔', '😶', '🤝', '💪', '👀', '🙈', '🚫', '✋', '🆘',
    '📱', '💬', '🔔', '📸', '🔒', '⚠️', '✅', '❌', '❓', '⭐', '🔥', '➡️', '⬅️', '⬆️', '⬇️',
    '#StopHarcèlement', '#NonAuHarcèlement', '3018', 'STOP', 'LIKE', '1 notification', 'Vu ✓✓', 'Bloquer', 'Signaler'
  ];
  function estPastille(s) { return /[A-Za-z0-9#]/.test(s); }

  /* En unités de la carte (4000 de côté) : 4 est déjà un trait net à
     l'écran d'une table ; les deux derniers servent aux titres. */
  var EPAISSEURS = [{ cle: 'tresfin', v: 1.5, t: 'Très fin' }, { cle: 'fin', v: 2.5, t: 'Fin' }, { cle: 'moyen', v: 4, t: 'Moyen' },
                    { cle: 'epais', v: 7, t: 'Épais' }, { cle: 'tresepais', v: 12, t: 'Très épais' }];
  var TAILLES = [{ v: 30, t: 'Petit' }, { v: 44, t: 'Moyen' }, { v: 70, t: 'Grand' }];
  var MARGE = 4;                 // un point gardé est à 4 unités du bord de sa zone
  var ECHELLE_MAX = 8;
  var IOS = /iP(ad|hone|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  function arrondi(v) { return Math.round(v * 10) / 10; }
  function bornes(v, a, b) { return Math.max(a, Math.min(b, v)); }

  /* Le point au bord du carré dans la direction a (degrés). */
  function bordCarre(a) {
    var c = Math.cos(a * RAD), s = Math.sin(a * RAD), t = DEMI / Math.max(Math.abs(c), Math.abs(s));
    return { x: c * t, y: s * t };
  }

  /* Un point est « bon » pour la zone z s'il y est, marge comprise. */
  function dansAvecMarge(z, x, y) {
    return EMC.zoneDe(x, y) === z && EMC.zoneDe(x - MARGE, y - MARGE) === z && EMC.zoneDe(x + MARGE, y - MARGE) === z
      && EMC.zoneDe(x - MARGE, y + MARGE) === z && EMC.zoneDe(x + MARGE, y + MARGE) === z;
  }

  /* Le rectangle qui contient une zone (pour centrer la vue dessus). */
  function boiteZone(z) {
    if (z === 0) return { x: -R0, y: -R0, l: 2 * R0, h: 2 * R0 };
    var g = EMC.geometrie(z), xs = [], ys = [];
    for (var a = g.a0; a <= g.a1 + 0.01; a += 5) {
      var rmax = g.rmax || (DEMI / Math.max(Math.abs(Math.cos(a * RAD)), Math.abs(Math.sin(a * RAD))));
      [g.rmin, rmax].forEach(function (r) { xs.push(Math.cos(a * RAD) * r); ys.push(Math.sin(a * RAD) * r); });
    }
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    return { x: x0, y: y0, l: x1 - x0, h: y1 - y0 };
  }

  /* Tracer le contour d'une zone dans un contexte de canevas. */
  function tracerZone(ctx, z) {
    var g = EMC.geometrie(z);
    ctx.beginPath();
    if (z === 0) { ctx.arc(0, 0, R0, 0, 2 * Math.PI, false); ctx.closePath(); return; }
    if (g.rmax) {
      ctx.arc(0, 0, g.rmax, g.a0 * RAD, g.a1 * RAD, false);
      ctx.arc(0, 0, g.rmin, g.a1 * RAD, g.a0 * RAD, true);
    } else {
      var p0 = bordCarre(g.a0), p1 = bordCarre(g.a1), m = (g.a0 + g.a1) / 2;
      var coin = { x: Math.sign(Math.round(Math.cos(m * RAD) * 1e6)) * DEMI, y: Math.sign(Math.round(Math.sin(m * RAD) * 1e6)) * DEMI };
      ctx.moveTo(Math.cos(g.a0 * RAD) * R1, Math.sin(g.a0 * RAD) * R1);
      ctx.lineTo(p0.x, p0.y);
      ctx.lineTo(coin.x, coin.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.lineTo(Math.cos(g.a1 * RAD) * R1, Math.sin(g.a1 * RAD) * R1);
      ctx.arc(0, 0, R1, g.a1 * RAD, g.a0 * RAD, true);
    }
    ctx.closePath();
  }

  /* ----------------------------------------------------------
   *  Monter une carte
   * ---------------------------------------------------------- */
  function monter(conteneur, opts) {
    opts = opts || {};
    var mode = opts.mode || 'projection';
    var maZone = mode === 'eleve' ? opts.zone : null;
    var c = { carte: (opts.contenus && opts.contenus.carte) || {}, missions: (opts.contenus && opts.contenus.missions) || [] };
    var persister = opts.persister || function () { return Promise.resolve(); };
    var modifier = opts.modifier || function () { return Promise.resolve(); };

    var etat = { ouverte: mode !== 'eleve', figee: false, zonesVerrouillees: [] };
    var outil = mode === 'eleve' ? 'crayon' : (mode === 'prof' ? 'selection' : 'main');
    var couleur = 'bleu', epaisseur = 4, tailleTexte = 44, forme = 'rect', autocollant = '👍';
    var elements = {};       // id → { ligne, noeud, local: champs en attente, attente: bool }
    var mesIds = {};         // élève : les éléments que j'ai posés
    var masques = {};        // prof : id → donnees cachées
    var annuler = [], refaire = [];
    var outilAvant = null;
    var api = { selection: null };

    /* --- le DOM --- */
    conteneur.classList.add('carte-cadre');
    conteneur.innerHTML = '';
    conteneur.style.display = 'flex';
    conteneur.style.flexDirection = 'column';
    if (!conteneur.style.height && conteneur.getBoundingClientRect().height < 200) conteneur.style.height = '72vh';
    var barre = EMC.el('div', { class: 'carte-outils', role: 'toolbar', 'aria-label': 'Outils de la carte' });
    var hote = EMC.el('div', { class: 'carte-scene', style: 'position:relative;flex:1;min-height:280px;overflow:hidden;touch-action:none;' });
    var toast = EMC.el('div', { role: 'status', 'aria-live': 'polite',
      style: 'position:absolute;left:50%;top:10px;transform:translateX(-50%);background:#0b1d39;color:#fff;padding:.4rem .8rem;border-radius:10px;font-size:.9rem;display:none;z-index:5;max-width:90%;text-align:center;' });
    var bandeau = EMC.el('div', { style: 'position:absolute;left:10px;bottom:10px;background:rgba(255,255,255,.94);border:1px solid #d3dae7;border-radius:10px;padding:.35rem .7rem;font-size:.9rem;display:none;z-index:4;' });
    hote.appendChild(toast); hote.appendChild(bandeau);
    conteneur.appendChild(barre); conteneur.appendChild(hote);

    var stage = new Konva.Stage({ container: hote, width: Math.max(hote.clientWidth, 300), height: Math.max(hote.clientHeight, 280) });
    var calqueFond = new Konva.Layer({ listening: false });
    var calqueElements = new Konva.Layer();
    var calqueVoile = new Konva.Layer({ listening: false });
    var calqueBrouillon = new Konva.Layer({ listening: false });
    var calqueSelection = new Konva.Layer({ listening: false });
    stage.add(calqueFond, calqueElements, calqueVoile, calqueBrouillon, calqueSelection);
    /* le canevas de Konva reçoit les gestes : on les gère nous-mêmes */
    stage.content.style.touchAction = 'none';

    function couleurHex(cle) {
      var l = (c.carte.couleurs && c.carte.couleurs.length) ? c.carte.couleurs : COULEURS_DEFAUT;
      for (var i = 0; i < l.length; i++) if (l[i].cle === cle) return l[i].hex;
      return ENCRE;
    }
    function dire(m) {
      toast.textContent = m; toast.style.display = 'block';
      clearTimeout(dire.t); dire.t = setTimeout(function () { toast.style.display = 'none'; }, 3200);
    }

    /* ----------------------------------------------------------
     *  Le fond : carré, zones, sous-zones, titres, centre.
     * ---------------------------------------------------------- */
    function texte(o) {
      return new Konva.Text(Object.assign({ fontFamily: POLICE, fill: '#4a566e', listening: false, perfectDrawEnabled: false }, o));
    }
    function dessinerFond() {
      calqueFond.destroyChildren();
      var g = new Konva.Group();
      g.add(new Konva.Rect({ x: -DEMI, y: -DEMI, width: 2 * DEMI, height: 2 * DEMI, fill: '#ffffff' }));
      for (var z = 1; z <= 8; z++) {
        (function (z) {
          var geo = EMC.geometrie(z);
          g.add(new Konva.Shape({ sceneFunc: function (ctx, s) { tracerZone(ctx, z); ctx.fillStrokeShape(s); },
            fill: TEINTES[geo.quadrant][geo.rmax ? 0 : 1], perfectDrawEnabled: false }));
        })(z);
      }
      /* sous-zones : séparations pointillées et titres */
      for (z = 1; z <= 8; z++) {
        var m = c.missions[z - 1] || {}, titres = m.sous_zones && m.sous_zones.length ? m.sous_zones : [''];
        var sz = EMC.sousZones(z, titres), geo2 = EMC.geometrie(z);
        sz.forEach(function (s, i) {
          if (i > 0) {
            var a = s.a0, fin = s.rmax ? { x: Math.cos(a * RAD) * s.rmax, y: Math.sin(a * RAD) * s.rmax } : bordCarre(a);
            g.add(new Konva.Line({ points: [Math.cos(a * RAD) * s.rmin, Math.sin(a * RAD) * s.rmin, fin.x, fin.y],
              stroke: '#b9c4d6', strokeWidth: 3, dash: [18, 14], perfectDrawEnabled: false }));
          }
          if (!s.titre) return;
          var am = (s.a0 + s.a1) / 2, r = s.rmax ? R1 - 95 : R1 + 150;
          var largeur = s.rmax ? 300 : 360;
          g.add(texte({ x: Math.cos(am * RAD) * r - largeur / 2, y: Math.sin(am * RAD) * r - 22, width: largeur,
            text: s.titre, fontSize: 25, fontStyle: 'italic', align: 'center', fill: '#56637b', lineHeight: 1.15 }));
        });
        /* nom de la zone, en filigrane au milieu */
        var amz = (geo2.a0 + geo2.a1) / 2, rz = geo2.rmax ? (R0 + R1) / 2 + 20 : 1830;
        var nom = 'Table ' + z + ' · ' + EMC.NOMS_ZONES[z] + (m.verbe ? '\n' + m.verbe : '');
        g.add(texte({ x: Math.cos(amz * RAD) * rz - 220, y: Math.sin(amz * RAD) * rz - 40, width: 440, text: nom,
          fontSize: 32, fontFamily: POLICE_TITRE, fontStyle: 'bold', align: 'center', fill: '#8b97ad', opacity: 0.85 }));
      }
      /* traits de structure */
      g.add(new Konva.Circle({ x: 0, y: 0, radius: R1, stroke: '#8fa1bb', strokeWidth: 5 }));
      [[0, -DEMI, 0, -R0], [0, R0, 0, DEMI], [-DEMI, 0, -R0, 0], [R0, 0, DEMI, 0]].forEach(function (p) {
        g.add(new Konva.Line({ points: p, stroke: MARINE, strokeWidth: 6 }));
      });
      g.add(new Konva.Rect({ x: -DEMI, y: -DEMI, width: 2 * DEMI, height: 2 * DEMI, stroke: MARINE, strokeWidth: 8 }));
      /* titres des quadrants, dans les coins */
      var q = c.carte.quadrants || {};
      var coins = { NE: [DEMI - 940, -DEMI + 22, 'right'], NO: [-DEMI + 40, -DEMI + 22, 'left'],
                    SO: [-DEMI + 40, DEMI - 110, 'left'], SE: [DEMI - 940, DEMI - 110, 'right'] };
      Object.keys(coins).forEach(function (k) {
        if (!q[k]) return;
        g.add(texte({ x: coins[k][0], y: coins[k][1], width: 900, align: coins[k][2], text: k + ' · ' + q[k],
          fontSize: 36, fontFamily: POLICE_TITRE, fontStyle: 'bold', fill: MARINE, lineHeight: 1.15 }));
      });
      /* les quatre directions */
      function axe(t, x, y, rot) {
        if (!t) return;
        var n = texte({ text: t, fontSize: 34, fontFamily: POLICE_TITRE, fontStyle: 'bold', fill: '#c4610f', width: 1100, align: 'center' });
        n.offsetX(550); n.offsetY(17); n.position({ x: x, y: y }); n.rotation(rot); g.add(n);
      }
      axe(c.carte.nord ? 'NORD · ' + c.carte.nord : '', 0, -DEMI + 140, 0);
      axe(c.carte.sud ? 'SUD · ' + c.carte.sud : '', 0, DEMI - 140, 0);
      axe(c.carte.est ? 'EST · ' + c.carte.est : '', DEMI - 50, 0, 90);
      axe(c.carte.ouest ? 'OUEST · ' + c.carte.ouest : '', -DEMI + 50, 0, -90);
      /* les deux anneaux, nommés le long de l'axe nord */
      if (c.carte.anneau_interieur) g.add(texte({ x: 20, y: -R1 + 40, width: 360, text: c.carte.anneau_interieur, fontSize: 22, fill: '#6b7891' }));
      if (c.carte.anneau_exterieur) g.add(texte({ x: 20, y: -R1 - 72, width: 400, text: c.carte.anneau_exterieur, fontSize: 22, fill: '#6b7891' }));
      /* le centre */
      g.add(new Konva.Circle({ x: 0, y: 0, radius: R0, fill: '#e8eff8', stroke: MARINE, strokeWidth: 6 }));
      var bloc = new Konva.Group();
      var t1 = texte({ width: 760, align: 'center', text: c.carte.titre || '', fontSize: 26, fill: '#4a566e', fontFamily: POLICE_TITRE });
      var t2 = texte({ width: 800, align: 'center', text: c.carte.centre || '', fontSize: 46, fontStyle: 'bold', fill: MARINE, fontFamily: POLICE_TITRE, lineHeight: 1.15 });
      var t3 = texte({ width: 720, align: 'center', text: c.carte.centre_source || '', fontSize: 22, fontStyle: 'italic', fill: '#4a566e', lineHeight: 1.2 });
      var y = 0;
      [t1, t2, t3].forEach(function (t) { t.x(-t.width() / 2); t.y(y); y += t.height() + 22; bloc.add(t); });
      bloc.y(-y / 2 + 10);
      g.add(bloc);
      calqueFond.add(g);
      calqueFond.batchDraw();
    }

    /* Le voile : zones verrouillées, et pour l'élève, les zones qui ne
     * sont pas la sienne. Au-dessus des éléments, sans écouter. */
    function dessinerVoile() {
      calqueVoile.destroyChildren();
      var verrous = etat.zonesVerrouillees || [];
      for (var z = 0; z <= 8; z++) {
        (function (z) {
          var autre = mode === 'eleve' && z !== maZone, verrou = z > 0 && verrous.indexOf(z) >= 0;
          if (autre || verrou) {
            calqueVoile.add(new Konva.Shape({ sceneFunc: function (ctx, s) { tracerZone(ctx, z); ctx.fillStrokeShape(s); },
              fill: verrou ? 'rgba(120,130,150,0.18)' : 'rgba(255,255,255,0.28)', name: 'voile' }));
          }
          if (verrou) {
            var m = EMC.milieu(z);
            calqueVoile.add(texte({ x: m.x - 60, y: m.y + 40, width: 120, align: 'center', text: '🔒', fontSize: 80, name: 'voile' }));
          }
        })(z);
      }
      if (mode === 'eleve' && maZone) {
        calqueVoile.add(new Konva.Shape({ sceneFunc: function (ctx, s) { tracerZone(ctx, maZone); ctx.fillStrokeShape(s); },
          stroke: CYAN, strokeWidth: 12, name: 'contour' }));
      }
      calqueVoile.batchDraw();
    }

    /* ----------------------------------------------------------
     *  Les éléments
     * ---------------------------------------------------------- */
    function nouveauNoeud(l) {
      var d = l.donnees || {}, hex = couleurHex(l.couleur), n;
      if (l.type === 'trait' && Array.isArray(d.points)) {
        n = new Konva.Line({ points: d.points.length === 2 ? d.points.concat(d.points) : d.points, stroke: hex,
          strokeWidth: d.epaisseur || 10, lineCap: 'round', lineJoin: 'round', tension: 0.35, hitStrokeWidth: 28,
          perfectDrawEnabled: false, shadowForStrokeEnabled: false });
      } else if (l.type === 'fleche' && Array.isArray(d.points)) {
        var e = d.epaisseur || 10;
        n = new Konva.Arrow({ points: d.points, stroke: hex, fill: hex, strokeWidth: e, pointerLength: 12 + e * 3,
          pointerWidth: 10 + e * 3, lineCap: 'round', hitStrokeWidth: 28, perfectDrawEnabled: false });
      } else if ((l.type === 'texte' || l.type === 'autocollant' || l.type === 'forme') && typeof d.x === 'number') {
        n = new Konva.Group({ x: d.x, y: d.y });
        var L = d.l || 100, H = d.h || 60;
        if (l.type === 'texte') {
          n.add(new Konva.Text({ text: d.texte || '', width: L, fontSize: d.taille || 44, fontFamily: POLICE,
            fill: hex, lineHeight: 1.2, wrap: 'word', perfectDrawEnabled: false }));
        } else if (l.type === 'autocollant') {
          var sym = d.symbole || '⭐';
          if (estPastille(sym)) {
            n.add(new Konva.Rect({ width: L, height: H, cornerRadius: H / 2, fill: hex, perfectDrawEnabled: false }));
            n.add(new Konva.Text({ text: sym, width: L, height: H, align: 'center', verticalAlign: 'middle',
              fontSize: H * 0.5, fontStyle: 'bold', fontFamily: POLICE, fill: '#fff', perfectDrawEnabled: false }));
          } else {
            n.add(new Konva.Text({ text: sym, width: L, height: H, align: 'center', verticalAlign: 'middle',
              fontSize: Math.min(L, H) * 0.85, fontFamily: POLICE_EMOJI, perfectDrawEnabled: false }));
          }
        } else {
          var trait = { stroke: hex, strokeWidth: 6, fill: hex + '14', perfectDrawEnabled: false };
          if (d.forme === 'ellipse') n.add(new Konva.Ellipse(Object.assign({ x: L / 2, y: H / 2, radiusX: L / 2, radiusY: H / 2 }, trait)));
          else if (d.forme === 'bulle') {
            n.add(new Konva.Shape(Object.assign({ sceneFunc: function (ctx, s) {
              var r = Math.min(30, H / 4), hb = H * 0.8;
              ctx.beginPath();
              ctx.moveTo(r, 0); ctx.lineTo(L - r, 0); ctx.quadraticCurveTo(L, 0, L, r);
              ctx.lineTo(L, hb - r); ctx.quadraticCurveTo(L, hb, L - r, hb);
              ctx.lineTo(L * 0.32, hb); ctx.lineTo(L * 0.14, H); ctx.lineTo(L * 0.2, hb);
              ctx.lineTo(r, hb); ctx.quadraticCurveTo(0, hb, 0, hb - r);
              ctx.lineTo(0, r); ctx.quadraticCurveTo(0, 0, r, 0);
              ctx.closePath(); ctx.fillStrokeShape(s);
            } }, trait)));
          } else n.add(new Konva.Rect(Object.assign({ width: L, height: H, cornerRadius: 14 }, trait)));
        }
      }
      if (n) n.setAttr('emcId', l.id);
      return n;
    }

    /* Ce que doit montrer ce mode, pour cette ligne. */
    function visible(l) {
      if (l.supprime) return false;
      if (l.masque) return mode === 'prof';
      return true;
    }

    function rendre(id) {
      var e = elements[id];
      if (!e) return;
      if (e.noeud) { e.noeud.destroy(); e.noeud = null; }
      var l = Object.assign({}, e.ligne, e.local || {});
      if (!visible(l)) return;
      if (l.masque) {
        var cache = masques[id] || (e.ligne.donnees && Object.keys(e.ligne.donnees).length ? e.ligne.donnees : null);
        if (!cache) return;
        l = Object.assign({}, l, { donnees: cache });
      }
      var n = nouveauNoeud(l);
      if (!n) return;
      if (l.masque) { n.opacity(0.28); }
      if (e.attente) n.opacity(0.6);
      calqueElements.add(n);
      e.noeud = n;
      majDeplacable(id);
    }

    function majDeplacable(id) {
      var e = elements[id];
      if (!e || !e.noeud) return;
      var l = e.ligne, boite = l.type === 'texte' || l.type === 'autocollant' || l.type === 'forme';
      var permis = boite && !l.masque && ((mode === 'prof' && outil === 'selection') ||
        (mode === 'eleve' && outil === 'deplacer' && mesIds[id] && outilsActifs()));
      e.noeud.draggable(!!permis);
    }

    function poser(l, opts2) {
      var e = elements[l.id];
      if (!e) { e = elements[l.id] = { ligne: l }; }
      else {
        if (opts2 && opts2.serveur && e.ligne.maj_le && l.maj_le && l.maj_le < e.ligne.maj_le) return;
        e.ligne = Object.assign({}, e.ligne, l);
      }
      if (mode === 'eleve' && opts.eleveId && l.eleve_id === opts.eleveId) mesIds[l.id] = true;
      if (l.masque && l.donnees && Object.keys(l.donnees).length) masques[l.id] = masques[l.id] || l.donnees;
      rendre(l.id);
    }

    /* ----------------------------------------------------------
     *  Vue : zoom, déplacement
     * ---------------------------------------------------------- */
    function echelleMin() { return Math.min(0.1, ajuste() * 0.8); }
    function ajuste() { return Math.min(stage.width(), stage.height()) / (2 * DEMI * 1.03); }
    function poserVue(s, x, y) {
      s = bornes(s, echelleMin(), ECHELLE_MAX);
      stage.scale({ x: s, y: s }); stage.position({ x: x, y: y });
      stage.batchDraw();
      majTexteEditeur();
    }
    function cadrer(b, marge) {
      marge = marge || 1.08;
      var s = Math.min(stage.width() / (b.l * marge), stage.height() / (b.h * marge));
      s = bornes(s, echelleMin(), ECHELLE_MAX);
      poserVue(s, caler(stage.width() / 2 - (b.x + b.l / 2) * s, stage.width(), s),
                  caler(stage.height() / 2 - (b.y + b.h / 2) * s, stage.height(), s));
    }
    /* Cadrer une zone de coin (tables 2, 4, 6, 8) ne doit pas montrer le
     * vide au-delà du bord de la carte : on recale tant que la carte
     * est plus grande que l'écran, on la centre sinon. */
    function caler(pos, cote, s) {
      var demi = DEMI * s;
      if (2 * demi <= cote) return cote / 2;
      return bornes(pos, cote - demi, demi);
    }
    function vueEnsemble() { cadrer({ x: -DEMI, y: -DEMI, l: 2 * DEMI, h: 2 * DEMI }, 1.03); }
    function centrerSur(z) { cadrer(boiteZone(z), 1.12); }
    function zoomer(f, sx, sy) {
      var s0 = stage.scaleX(), s = bornes(s0 * f, echelleMin(), ECHELLE_MAX);
      if (sx == null) { sx = stage.width() / 2; sy = stage.height() / 2; }
      var wx = (sx - stage.x()) / s0, wy = (sy - stage.y()) / s0;
      poserVue(s, sx - wx * s, sy - wy * s);
    }
    function monde(sx, sy) { var s = stage.scaleX(); return { x: (sx - stage.x()) / s, y: (sy - stage.y()) / s }; }
    function ecran(wx, wy) { var s = stage.scaleX(); return { x: wx * s + stage.x(), y: wy * s + stage.y() }; }

    /* ----------------------------------------------------------
     *  Outils et droits
     * ---------------------------------------------------------- */
    function outilsActifs() {
      if (mode === 'projection') return false;
      if (mode === 'prof') return true;
      return etat.ouverte && !etat.figee && (etat.zonesVerrouillees || []).indexOf(maZone) < 0;
    }
    function raisonFermee() {
      if (!etat.ouverte) return 'La carte s\'ouvrira à l\'étape « Carte mentale ». Tu peux déjà la regarder.';
      if (etat.figee) return 'La carte est figée par tes professeurs : on regarde, on n\'écrit plus.';
      if ((etat.zonesVerrouillees || []).indexOf(maZone) >= 0) return 'Ta zone est verrouillée pour l\'instant.';
      return '';
    }
    /* La zone où ce point peut recevoir un élément, ou null. */
    function zoneEcriture(x, y) {
      if (mode === 'eleve') return dansAvecMarge(maZone, x, y) ? maZone : null;
      var z = EMC.zoneDe(x, y);
      return z != null && dansAvecMarge(z, x, y) ? z : null;
    }

    /* Recaler une boîte dans sa zone : on la rapproche du milieu de la
     * zone, puis on la réduit (sauf un texte, dont la taille compte). */
    function recaler(z, type, d) {
      if (EMC.dansZone(z, type, d)) return d;
      var m = EMC.milieu(z), cx = d.x + d.l / 2, cy = d.y + d.h / 2;
      for (var k = 1; k <= 24; k++) {
        var t = Math.min(1, k / 12), f = (type === 'texte' || k <= 12) ? 1 : Math.pow(0.85, k - 12);
        var l = d.l * f, h = d.h * f, nx = cx + (m.x - cx) * t, ny = cy + (m.y - cy) * t;
        var essai = Object.assign({}, d, { x: arrondi(nx - l / 2), y: arrondi(ny - h / 2), l: arrondi(l), h: arrondi(h) });
        if (EMC.dansZone(z, type, essai)) return essai;
      }
      return null;
    }

    /* Persister un nouvel élément, l'afficher tout de suite. */
    function creer(z, type, d, opts3) {
      if (!EMC.dansZone(z, type, d)) { dire('Hors de ta zone : pas enregistré.'); return null; }
      var l = { id: EMC.uuid(), zone: z, type: type, couleur: couleur, donnees: d };
      elements[l.id] = { ligne: Object.assign({ masque: false, supprime: false }, l), attente: true };
      mesIds[l.id] = true;
      rendre(l.id);
      calqueElements.batchDraw();
      if (!(opts3 && opts3.sansPile)) { annuler.push({ quoi: 'ajout', id: l.id }); refaire = []; majBoutons(); }
      persister(l).then(function () {
        var e = elements[l.id]; if (e) { e.attente = false; rendre(l.id); calqueElements.batchDraw(); }
      }, function (err) {
        var e = elements[l.id]; if (e && e.noeud) e.noeud.destroy();
        delete elements[l.id];
        annuler = annuler.filter(function (a) { return a.id !== l.id; });
        majBoutons();
        dire('Pas enregistré : ' + (EMC.message ? EMC.message(err) : err));
        calqueElements.batchDraw();
      });
      return l;
    }

    /* Une modification : appliquée tout de suite à l'écran, et
     * protégée contre une relecture plus ancienne jusqu'à la réponse. */
    function changer(id, champs) {
      var e = elements[id];
      if (!e) return Promise.resolve();
      e.local = Object.assign({}, e.local || {}, champs);
      rendre(id); calqueElements.batchDraw();
      if (api.selection && api.selection.id === id) montrerSelection(id);
      return modifier(id, champs).then(function () {
        e.ligne = Object.assign({}, e.ligne, champs);
        if (champs.masque === true && e.ligne.donnees && Object.keys(e.ligne.donnees).length) masques[id] = e.ligne.donnees;
        delete e.local;
        rendre(id); calqueElements.batchDraw();
      }, function (err) {
        delete e.local; rendre(id); calqueElements.batchDraw();
        dire('Pas enregistré : ' + (EMC.message ? EMC.message(err) : err));
        throw err;
      });
    }

    /* ----------------------------------------------------------
     *  Le crayon : un trait découpé au bord de la zone
     * ---------------------------------------------------------- */
    var trace = null;   // { runs: [{ zone, pts: [] }], ligneBrouillon… }
    function debutTrace(p) {
      trace = { runs: [], courant: null, noeuds: [], depart: p, dernier: null };
      ajoutPoint(p);
    }
    function ajoutPoint(p) {
      var z = zoneEcriture(p.x, p.y), s = stage.scaleX();
      if (z == null) { trace.courant = null; return; }
      var r = trace.courant;
      if (!r || r.zone !== z) {
        r = trace.courant = { zone: z, pts: [] };
        trace.runs.push(r);
        var n = new Konva.Line({ points: [], stroke: couleurHex(couleur), strokeWidth: epaisseur, lineCap: 'round',
          lineJoin: 'round', tension: 0.35, listening: false });
        calqueBrouillon.add(n); r.noeud = n;
      }
      var k = r.pts.length;
      if (k >= 2) {
        var dx = p.x - r.pts[k - 2], dy = p.y - r.pts[k - 1];
        if (dx * dx + dy * dy < Math.pow(1.6 / s, 2)) return;
      }
      r.pts.push(arrondi(p.x), arrondi(p.y));
      r.noeud.points(r.pts.length === 2 ? r.pts.concat(r.pts) : r.pts);
      calqueBrouillon.batchDraw();
    }
    function finTrace() {
      if (!trace) return;
      var t = trace; trace = null;
      calqueBrouillon.destroyChildren(); calqueBrouillon.batchDraw();
      var groupe = [];
      t.runs.forEach(function (r) {
        if (!r.pts.length) return;
        var pts = r.pts.length === 2 ? r.pts.concat([arrondi(r.pts[0] + 0.5), r.pts[1]]) : r.pts;
        for (var i = 0; i < pts.length; i += 3998) {
          var bout = pts.slice(Math.max(0, i - 2), i + 3998);
          if (bout.length < 4) continue;
          var d = { points: bout, epaisseur: epaisseur };
          if (EMC.dansZone(r.zone, 'trait', d)) { var l = creer(r.zone, 'trait', d, { sansPile: true }); if (l) groupe.push(l.id); }
        }
      });
      if (groupe.length) { annuler.push({ quoi: 'ajout', ids: groupe }); refaire = []; majBoutons(); }
    }

    /* La flèche : du point de départ au dernier point valide de la même zone. */
    var fleche = null;
    function debutFleche(p) {
      var z = zoneEcriture(p.x, p.y);
      if (z == null) return;
      fleche = { zone: z, a: p, b: p, noeud: new Konva.Arrow({ points: [p.x, p.y, p.x, p.y], stroke: couleurHex(couleur),
        fill: couleurHex(couleur), strokeWidth: epaisseur, pointerLength: 12 + epaisseur * 3, pointerWidth: 10 + epaisseur * 3 }) };
      calqueBrouillon.add(fleche.noeud);
    }
    function suiteFleche(p) {
      if (!fleche) return;
      if (zoneEcriture(p.x, p.y) === fleche.zone) fleche.b = p;
      fleche.noeud.points([fleche.a.x, fleche.a.y, fleche.b.x, fleche.b.y]);
      calqueBrouillon.batchDraw();
    }
    function finFleche() {
      if (!fleche) return;
      var f = fleche; fleche = null;
      calqueBrouillon.destroyChildren(); calqueBrouillon.batchDraw();
      var dx = f.b.x - f.a.x, dy = f.b.y - f.a.y;
      if (dx * dx + dy * dy < 400) { dire('Fais glisser pour tracer la flèche.'); return; }
      creer(f.zone, 'fleche', { points: [arrondi(f.a.x), arrondi(f.a.y), arrondi(f.b.x), arrondi(f.b.y)], epaisseur: epaisseur });
    }

    /* Formes et autocollants : un toucher pose la taille par défaut,
     * un glisser dessine la boîte. */
    var boite = null;
    function debutBoite(p) {
      var z = zoneEcriture(p.x, p.y);
      if (z == null) { dire(mode === 'eleve' ? 'Pose-le dans ta zone (table ' + maZone + ').' : 'Hors de la carte.'); return; }
      boite = { zone: z, a: p, b: p, noeud: new Konva.Rect({ x: p.x, y: p.y, width: 1, height: 1, stroke: CYAN, strokeWidth: 3 / stage.scaleX(), dash: [8, 6] }) };
      calqueBrouillon.add(boite.noeud);
    }
    function suiteBoite(p) {
      if (!boite) return;
      boite.b = p;
      boite.noeud.setAttrs({ x: Math.min(boite.a.x, p.x), y: Math.min(boite.a.y, p.y), width: Math.abs(p.x - boite.a.x), height: Math.abs(p.y - boite.a.y) });
      calqueBrouillon.batchDraw();
    }
    function finBoite() {
      if (!boite) return;
      var b = boite; boite = null;
      calqueBrouillon.destroyChildren(); calqueBrouillon.batchDraw();
      var l = Math.abs(b.b.x - b.a.x), h = Math.abs(b.b.y - b.a.y), d;
      var parDefaut = l * stage.scaleX() < 12 && h * stage.scaleX() < 12;
      if (outil === 'forme') {
        if (parDefaut) { l = 260; h = forme === 'bulle' ? 170 : 150; }
        d = { x: parDefaut ? b.a.x - l / 2 : Math.min(b.a.x, b.b.x), y: parDefaut ? b.a.y - h / 2 : Math.min(b.a.y, b.b.y), l: Math.max(l, 20), h: Math.max(h, 20), forme: forme };
        d = Object.assign(d, { x: arrondi(d.x), y: arrondi(d.y), l: arrondi(d.l), h: arrondi(d.h) });
        d = recaler(b.zone, 'forme', d);
        if (d) creer(b.zone, 'forme', d); else dire('Pas assez de place ici : essaie plus au milieu de ta zone.');
      } else {
        var pastille = estPastille(autocollant);
        if (parDefaut) { h = pastille ? 64 : 120; l = pastille ? Math.max(120, mesurer(autocollant, h * 0.5, 'bold') + h) : 120; }
        d = { x: arrondi(parDefaut ? b.a.x - l / 2 : Math.min(b.a.x, b.b.x)), y: arrondi(parDefaut ? b.a.y - h / 2 : Math.min(b.a.y, b.b.y)),
              l: arrondi(Math.max(l, 30)), h: arrondi(Math.max(h, 30)), symbole: autocollant };
        d = recaler(b.zone, 'autocollant', d);
        if (d) creer(b.zone, 'autocollant', d); else dire('Pas assez de place ici : essaie plus au milieu de ta zone.');
      }
    }
    function mesurer(t, taille, style) {
      var n = new Konva.Text({ text: t, fontSize: taille, fontFamily: POLICE, fontStyle: style || 'normal' });
      var w = n.width(); n.destroy(); return w;
    }

    /* ----------------------------------------------------------
     *  Le texte : un champ HTML posé sur la carte
     * ---------------------------------------------------------- */
    var editeur = null;
    function ouvrirEditeur(p, z, existant) {
      fermerEditeur();
      var zoneTexte = EMC.el('textarea', { 'aria-label': 'Texte à poser sur la carte', rows: 3,
        style: 'width:100%;min-height:4.5rem;font:16px/1.3 Inter,system-ui,sans-serif;' });
      var tailles = EMC.el('div', { class: 'rangee', style: 'gap:.3rem;margin:.35rem 0;' });
      var taille = existant ? existant.ligne.donnees.taille || 44 : tailleTexte;
      TAILLES.forEach(function (t) {
        var b = EMC.el('button', { type: 'button', class: t.v === taille ? 'actif' : '', 'aria-pressed': String(t.v === taille),
          style: 'min-height:36px;padding:.2rem .6rem;', onclick: function () {
            taille = t.v; tailleTexte = t.v;
            Array.prototype.forEach.call(tailles.children, function (x) { x.classList.remove('actif'); x.setAttribute('aria-pressed', 'false'); });
            b.classList.add('actif'); b.setAttribute('aria-pressed', 'true');
          } }, t.t);
        tailles.appendChild(b);
      });
      var boiteHtml = EMC.el('div', { style: 'position:absolute;z-index:6;background:#fff;border:2px solid ' + couleurHex(couleur) +
        ';border-radius:12px;padding:.5rem;width:min(320px,90%);box-shadow:0 6px 24px rgba(0,0,0,.18);' },
        zoneTexte, tailles,
        EMC.el('div', { class: 'rangee', style: 'gap:.4rem;justify-content:flex-end;' },
          EMC.el('button', { type: 'button', onclick: fermerEditeur }, 'Annuler'),
          EMC.el('button', { type: 'button', class: 'primaire', onclick: valider }, existant ? 'Modifier' : 'Poser')));
      hote.appendChild(boiteHtml);
      editeur = { html: boiteHtml, p: p, z: z };
      if (existant) zoneTexte.value = existant.ligne.donnees.texte || '';
      majTexteEditeur();
      setTimeout(function () { zoneTexte.focus(); }, 30);
      function valider() {
        var t = zoneTexte.value.replace(/\s+$/, '').slice(0, 500);
        fermerEditeur();
        if (!t.trim()) return;
        var largeur = Math.min(700, Math.max(80, mesurerLignes(t, taille))) + 4;
        var mesure = new Konva.Text({ text: t, width: largeur, fontSize: taille, fontFamily: POLICE, lineHeight: 1.2, wrap: 'word' });
        var h = mesure.height(); mesure.destroy();
        var base = existant ? existant.ligne.donnees : { x: p.x, y: p.y };
        var d = { x: arrondi(base.x), y: arrondi(base.y), l: arrondi(largeur), h: arrondi(h), texte: t, taille: taille };
        d = recaler(z, 'texte', d);
        if (!d) { dire('Ce texte ne tient pas ici : essaie plus petit, ou plus au milieu de ta zone.'); return; }
        if (existant) {
          var avant = existant.ligne.donnees;
          changer(existant.ligne.id, { donnees: d });
          annuler.push({ quoi: 'donnees', id: existant.ligne.id, avant: avant, apres: d }); refaire = []; majBoutons();
        } else creer(z, 'texte', d);
      }
    }
    function mesurerLignes(t, taille) {
      return t.split('\n').reduce(function (m, l) { return Math.max(m, mesurer(l || ' ', taille)); }, 0);
    }
    function majTexteEditeur() {
      if (!editeur) return;
      var e = ecran(editeur.p.x, editeur.p.y);
      var x = bornes(e.x, 6, Math.max(6, hote.clientWidth - 330)), y = bornes(e.y + 12, 6, Math.max(6, hote.clientHeight - 190));
      editeur.html.style.left = x + 'px'; editeur.html.style.top = y + 'px';
    }
    function fermerEditeur() { if (editeur) { editeur.html.remove(); editeur = null; } }

    /* ----------------------------------------------------------
     *  Toucher un élément : gomme, sélection, édition
     * ---------------------------------------------------------- */
    function idSous(sx, sy) {
      var n = stage.getIntersection({ x: sx, y: sy });
      while (n && !n.getAttr('emcId')) n = n.getParent();
      return n ? n.getAttr('emcId') : null;
    }
    function gommer(id) {
      if (!id) return;
      if (mode === 'eleve' && !mesIds[id]) { dire('Tu ne peux effacer que ce que tu as posé.'); return; }
      changer(id, { supprime: true }).catch(function () {});
      annuler.push({ quoi: 'suppression', id: id }); refaire = []; majBoutons();
    }

    var panneauSel = null;
    function montrerSelection(id) {
      calqueSelection.destroyChildren();
      if (panneauSel) { panneauSel.remove(); panneauSel = null; }
      var e = id && elements[id];
      api.selection = e ? Object.assign({}, e.ligne, e.local || {}) : null;
      conteneur.dispatchEvent(new CustomEvent('emc:selection', { detail: api.selection }));
      if (!e) { calqueSelection.batchDraw(); return; }
      if (e.noeud) {
        var r = e.noeud.getClientRect({ relativeTo: calqueElements });
        calqueSelection.add(new Konva.Rect({ x: r.x - 10, y: r.y - 10, width: r.width + 20, height: r.height + 20,
          stroke: CYAN, strokeWidth: 3 / stage.scaleX(), dash: [12 / stage.scaleX(), 8 / stage.scaleX()] }));
      }
      calqueSelection.batchDraw();
      var l = api.selection;
      panneauSel = EMC.el('div', { role: 'dialog', 'aria-label': 'Élément sélectionné',
        style: 'position:absolute;right:10px;top:10px;z-index:6;background:#fff;border:1px solid #d3dae7;border-radius:12px;padding:.6rem;box-shadow:0 6px 24px rgba(0,0,0,.15);max-width:260px;font-size:.9rem;' },
        EMC.el('div', null, EMC.el('b', null, { trait: 'Trait', fleche: 'Flèche', texte: 'Texte', autocollant: 'Autocollant', forme: 'Forme' }[l.type] || l.type),
          ' · zone ' + l.zone + (l.masque ? ' · masqué' : '')),
        l.type === 'texte' && l.donnees && l.donnees.texte ? EMC.el('div', { class: 'tresmuet', style: 'margin:.3rem 0;white-space:pre-wrap;max-height:6em;overflow:auto;' }, l.donnees.texte) : null,
        EMC.el('div', { class: 'rangee', style: 'gap:.35rem;margin-top:.4rem;' },
          EMC.el('button', { type: 'button', onclick: function () { changer(id, { masque: !l.masque }).catch(function () {}); } }, l.masque ? '👁 Démasquer' : '🙈 Masquer'),
          EMC.el('button', { type: 'button', class: 'danger', onclick: function () {
            changer(id, { supprime: true }).catch(function () {}); montrerSelection(null);
          } }, '🗑 Supprimer'),
          EMC.el('button', { type: 'button', 'aria-label': 'Fermer', onclick: function () { montrerSelection(null); } }, '✕')));
      hote.appendChild(panneauSel);
    }

    /* ----------------------------------------------------------
     *  Les gestes
     * ---------------------------------------------------------- */
    var pointeurs = {};      // pointerId → { x, y }
    var pince = null, glisse = null, geste = null, departGeste = null;

    function posEcran(ev) { var r = hote.getBoundingClientRect(); return { x: ev.clientX - r.left, y: ev.clientY - r.top }; }
    function annulerGeste() {
      trace = null; fleche = null; boite = null; geste = null;
      calqueBrouillon.destroyChildren(); calqueBrouillon.batchDraw();
    }

    function surDown(ev) {
      if (ev.target !== stage.content && !stage.content.contains(ev.target)) return;
      var p = posEcran(ev);
      pointeurs[ev.pointerId] = p;
      var n = Object.keys(pointeurs).length;
      if (n === 2) {
        annulerGeste();
        var ids = Object.keys(pointeurs), a = pointeurs[ids[0]], b = pointeurs[ids[1]];
        pince = { d0: Math.hypot(a.x - b.x, a.y - b.y) || 1, c0: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
                  s0: stage.scaleX(), x0: stage.x(), y0: stage.y() };
        return;
      }
      if (n > 2) return;
      departGeste = p;
      /* un élément déplaçable sous le doigt : Konva s'en charge */
      var idDessous = idSous(p.x, p.y);
      if (idDessous && elements[idDessous] && elements[idDessous].noeud && elements[idDessous].noeud.draggable()) { geste = 'konva'; return; }
      var moyen = ev.button === 1 || ev.button === 2;
      if (outil === 'main' || moyen || outil === 'selection' || outil === 'gomme' || outil === 'deplacer' || outil === 'texte') {
        glisse = { x: p.x, y: p.y, sx: stage.x(), sy: stage.y() };
        geste = 'main';
        try { hote.setPointerCapture(ev.pointerId); } catch (e) {}
        return;
      }
      if (!outilsActifs()) { dire(raisonFermee()); return; }
      try { hote.setPointerCapture(ev.pointerId); } catch (e) {}
      var w = monde(p.x, p.y);
      geste = outil;
      if (outil === 'crayon') {
        if (mode === 'eleve' && EMC.zoneDe(w.x, w.y) !== maZone) dire('Tu écris dans ta zone : table ' + maZone + '.');
        debutTrace(w);
      } else if (outil === 'fleche') {
        debutFleche(w);
        if (!fleche) dire(mode === 'eleve' ? 'Commence la flèche dans ta zone.' : 'Hors de la carte.');
      } else if (outil === 'forme' || outil === 'autocollant') debutBoite(w);
      ev.preventDefault();
    }

    function surMove(ev) {
      if (!pointeurs[ev.pointerId]) return;
      var p = posEcran(ev);
      pointeurs[ev.pointerId] = p;
      if (pince) {
        var ids = Object.keys(pointeurs);
        if (ids.length < 2) return;
        var a = pointeurs[ids[0]], b = pointeurs[ids[1]];
        var d = Math.hypot(a.x - b.x, a.y - b.y), cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
        var s = bornes(pince.s0 * d / pince.d0, echelleMin(), ECHELLE_MAX);
        var wx = (pince.c0.x - pince.x0) / pince.s0, wy = (pince.c0.y - pince.y0) / pince.s0;
        poserVue(s, cx - wx * s, cy - wy * s);
        return;
      }
      if (geste === 'main' && glisse) { poserVue(stage.scaleX(), glisse.sx + p.x - glisse.x, glisse.sy + p.y - glisse.y); return; }
      if (geste === 'crayon' && trace) {
        var liste = ev.getCoalescedEvents ? ev.getCoalescedEvents() : [ev];
        if (!liste.length) liste = [ev];
        liste.forEach(function (e2) { var q = posEcran(e2); ajoutPoint(monde(q.x, q.y)); });
      } else if (geste === 'fleche') suiteFleche(monde(p.x, p.y));
      else if (geste === 'forme' || geste === 'autocollant') suiteBoite(monde(p.x, p.y));
    }

    function surUp(ev) {
      if (!pointeurs[ev.pointerId]) return;
      var p = posEcran(ev);
      delete pointeurs[ev.pointerId];
      if (pince) { if (Object.keys(pointeurs).length < 2) { pince = null; geste = null; glisse = null; } return; }
      var g = geste; geste = null;
      var tape = departGeste && Math.hypot(p.x - departGeste.x, p.y - departGeste.y) < 8;
      if (g === 'crayon') finTrace();
      else if (g === 'fleche') finFleche();
      else if (g === 'forme' || g === 'autocollant') finBoite();
      else if ((g === 'main' || g === 'konva') && tape && ev.type !== 'pointercancel') toucher(p);
      glisse = null;
    }

    /* Un toucher bref, selon l'outil. */
    function toucher(p) {
      var id = idSous(p.x, p.y), w = monde(p.x, p.y);
      if (outil === 'gomme') { if (!outilsActifs()) { dire(raisonFermee()); return; } gommer(id); }
      else if (outil === 'selection' && mode === 'prof') montrerSelection(id);
      else if (outil === 'texte') {
        if (!outilsActifs()) { dire(raisonFermee()); return; }
        var e = id && elements[id];
        if (e && e.ligne.type === 'texte' && (mode === 'prof' || mesIds[id])) { ouvrirEditeur(w, e.ligne.zone, e); return; }
        var z = zoneEcriture(w.x, w.y);
        if (z == null) { dire(mode === 'eleve' ? 'Écris dans ta zone : table ' + maZone + '.' : 'Hors de la carte.'); return; }
        ouvrirEditeur(w, z, null);
      }
    }

    function surRoulette(ev) {
      ev.preventDefault();
      var p = posEcran(ev);
      if (ev.ctrlKey || Math.abs(ev.deltaY) >= Math.abs(ev.deltaX)) zoomer(Math.pow(1.0018, -ev.deltaY * (ev.ctrlKey ? 4 : 1)), p.x, p.y);
      else poserVue(stage.scaleX(), stage.x() - ev.deltaX, stage.y());
    }

    hote.addEventListener('pointerdown', surDown);
    hote.addEventListener('pointermove', surMove);
    hote.addEventListener('pointerup', surUp);
    hote.addEventListener('pointercancel', surUp);
    hote.addEventListener('wheel', surRoulette, { passive: false });
    hote.addEventListener('contextmenu', function (e) { e.preventDefault(); });

    /* Déplacer une boîte (Konva) : on ne la laisse pas sortir de sa zone. */
    calqueElements.on('dragstart', function (ev) {
      var id = ev.target.getAttr('emcId'), e = elements[id];
      if (e) e.avant = Object.assign({}, e.ligne.donnees);
    });
    calqueElements.on('dragmove', function (ev) {
      var n = ev.target, id = n.getAttr('emcId'), e = elements[id];
      if (!e) return;
      var d = Object.assign({}, e.ligne.donnees, (e.local && e.local.donnees) || {}, { x: n.x(), y: n.y() });
      if (EMC.dansZone(e.ligne.zone, e.ligne.type, d)) e.dernier = { x: n.x(), y: n.y() };
      else if (e.dernier) n.position(e.dernier);
      else n.position({ x: e.ligne.donnees.x, y: e.ligne.donnees.y });
    });
    calqueElements.on('dragend', function (ev) {
      var n = ev.target, id = n.getAttr('emcId'), e = elements[id];
      if (!e) return;
      var avant = e.avant || e.ligne.donnees;
      var d = Object.assign({}, avant, { x: arrondi(n.x()), y: arrondi(n.y()) });
      e.dernier = null;
      if (d.x === avant.x && d.y === avant.y) return;
      if (!EMC.dansZone(e.ligne.zone, e.ligne.type, d)) { rendre(id); calqueElements.batchDraw(); return; }
      changer(id, { donnees: d }).catch(function () {});
      annuler.push({ quoi: 'donnees', id: id, avant: avant, apres: d }); refaire = []; majBoutons();
    });

    /* ----------------------------------------------------------
     *  Annuler, refaire
     * ---------------------------------------------------------- */
    function rejouer(a, sens) {
      var ids = a.ids || [a.id];
      ids.forEach(function (id) {
        if (!elements[id]) return;
        if (a.quoi === 'ajout') changer(id, { supprime: sens === 'annuler' }).catch(function () {});
        else if (a.quoi === 'suppression') changer(id, { supprime: sens !== 'annuler' }).catch(function () {});
        else if (a.quoi === 'donnees') changer(id, { donnees: sens === 'annuler' ? a.avant : a.apres }).catch(function () {});
      });
    }
    function faireAnnuler() {
      if (!outilsActifs()) { dire(raisonFermee()); return; }
      var a = annuler.pop(); if (!a) return; rejouer(a, 'annuler'); refaire.push(a); majBoutons();
    }
    function faireRefaire() {
      if (!outilsActifs()) { dire(raisonFermee()); return; }
      var a = refaire.pop(); if (!a) return; rejouer(a, 'refaire'); annuler.push(a); majBoutons();
    }

    /* ----------------------------------------------------------
     *  La barre d'outils
     * ---------------------------------------------------------- */
    /* Une barre compacte : la carte doit garder la place. La légende
     * et la sous-barre tiennent sur une ligne, qui défile au besoin. */
    var COMPACT = 'min-height:38px;padding:.2rem .55rem;font-size:.88rem;white-space:nowrap;flex:none;';
    var LIGNE = 'gap:.3rem;width:100%;flex-wrap:nowrap;overflow-x:auto;-webkit-overflow-scrolling:touch;padding-bottom:2px;';
    var boutons = {}, sousBarre = EMC.el('div', { class: 'rangee', style: LIGNE });
    function bouton(cle, texte, etiquette, action) {
      var b = EMC.el('button', { type: 'button', 'aria-label': etiquette, title: etiquette, onclick: action, style: COMPACT }, texte);
      boutons[cle] = b; return b;
    }
    function choisirOutil(o) {
      outil = o; fermerEditeur();
      ['crayon', 'texte', 'fleche', 'forme', 'autocollant', 'gomme', 'deplacer', 'main', 'selection'].forEach(function (k) {
        if (boutons[k]) { boutons[k].classList.toggle('actif', k === o); boutons[k].setAttribute('aria-pressed', String(k === o)); }
      });
      Object.keys(elements).forEach(majDeplacable);
      dessinerSousBarre();
      if (o !== 'selection') montrerSelection(null);
      hote.style.cursor = o === 'main' ? 'grab' : (o === 'crayon' || o === 'fleche' || o === 'forme' || o === 'autocollant') ? 'crosshair' : 'default';
    }
    function dessinerSousBarre() {
      sousBarre.innerHTML = '';
      if (outil === 'crayon' || outil === 'fleche') {
        EPAISSEURS.forEach(function (e) {
          sousBarre.appendChild(EMC.el('button', { type: 'button', class: e.v === epaisseur ? 'actif' : '', 'aria-pressed': String(e.v === epaisseur),
            'aria-label': 'Épaisseur ' + e.t, style: COMPACT + 'flex:none;', onclick: function () { epaisseur = e.v; dessinerSousBarre(); } },
            EMC.el('span', { style: 'display:inline-block;width:22px;height:' + Math.max(1, Math.round(e.v / 1.6)) + 'px;background:currentColor;border-radius:4px;' }), e.t));
        });
      } else if (outil === 'forme') {
        [['rect', '▭ Cadre'], ['ellipse', '◯ Ellipse'], ['bulle', '💬 Bulle de SMS']].forEach(function (f) {
          sousBarre.appendChild(EMC.el('button', { type: 'button', class: f[0] === forme ? 'actif' : '', 'aria-pressed': String(f[0] === forme),
            style: COMPACT + 'flex:none;', onclick: function () { forme = f[0]; dessinerSousBarre(); } }, f[1]));
        });
        sousBarre.appendChild(EMC.el('span', { class: 'tresmuet', style: 'white-space:nowrap;font-size:.85rem;' }, 'Touche pour poser, ou fais glisser pour choisir la taille.'));
      } else if (outil === 'autocollant') {
        AUTOCOLLANTS.forEach(function (s) {
          sousBarre.appendChild(EMC.el('button', { type: 'button', class: s === autocollant ? 'actif' : '', 'aria-pressed': String(s === autocollant),
            'aria-label': 'Autocollant ' + s, style: 'flex:none;min-height:36px;padding:.15rem .45rem;' + (estPastille(s) ? 'font-size:.8rem;' : 'font-size:1.25rem;'),
            onclick: function () { autocollant = s; dessinerSousBarre(); } }, s));
        });
      } else if (outil === 'texte') {
        sousBarre.appendChild(EMC.el('span', { class: 'tresmuet', style: 'white-space:nowrap;font-size:.85rem;' }, 'Touche la carte là où tu veux écrire. Touche un de tes textes pour le modifier.'));
      } else if (outil === 'gomme') {
        sousBarre.appendChild(EMC.el('span', { class: 'tresmuet', style: 'white-space:nowrap;font-size:.85rem;' }, mode === 'eleve' ? 'Touche un de tes éléments pour l\'effacer.' : 'Touche un élément pour l\'effacer.'));
      } else if (outil === 'deplacer') {
        sousBarre.appendChild(EMC.el('span', { class: 'tresmuet', style: 'white-space:nowrap;font-size:.85rem;' }, 'Fais glisser un de tes textes, autocollants ou formes (dans ta zone).'));
      } else if (outil === 'main') {
        sousBarre.appendChild(EMC.el('span', { class: 'tresmuet', style: 'white-space:nowrap;font-size:.85rem;' }, 'Fais glisser pour te déplacer. Pince à deux doigts pour zoomer.'));
      } else if (outil === 'selection') {
        sousBarre.appendChild(EMC.el('span', { class: 'tresmuet', style: 'white-space:nowrap;font-size:.85rem;' }, 'Touche un élément pour le masquer ou le supprimer ; fais glisser un texte pour le déplacer.'));
      }
      sousBarre.style.display = sousBarre.children.length ? 'flex' : 'none';
    }
    var legende = EMC.el('div', { class: 'legende', role: 'radiogroup', 'aria-label': 'Couleur : le type de contenu', style: 'display:flex;' + LIGNE });
    function dessinerLegende() {
      legende.innerHTML = '';
      var l = (c.carte.couleurs && c.carte.couleurs.length) ? c.carte.couleurs : COULEURS_DEFAUT;
      l.forEach(function (k) {
        legende.appendChild(EMC.el('button', { type: 'button', role: 'radio', class: k.cle === couleur ? 'actif' : '',
          'aria-checked': String(k.cle === couleur), 'aria-label': k.sens, style: 'min-height:34px;padding:.15rem .5rem;font-size:.8rem;white-space:nowrap;flex:none;',
          onclick: function () { couleur = k.cle; dessinerLegende(); } },
          EMC.el('span', { class: 'pastille-couleur', style: 'background:' + k.hex + ';' }), k.sens));
      });
    }
    function majBoutons() {
      var actifs = outilsActifs();
      ['crayon', 'texte', 'fleche', 'forme', 'autocollant', 'gomme', 'deplacer'].forEach(function (k) { if (boutons[k]) boutons[k].disabled = !actifs; });
      if (boutons.annuler) boutons.annuler.disabled = !actifs || !annuler.length;
      if (boutons.refaire) boutons.refaire.disabled = !actifs || !refaire.length;
      var r = mode === 'eleve' ? raisonFermee() : '';
      bandeau.textContent = r; bandeau.style.display = r ? 'block' : 'none';
      /* carte fermée : on passe à la main, et l'outil revient à la réouverture */
      if (!actifs && mode === 'eleve' && outil !== 'main') { outilAvant = outil; choisirOutil('main'); }
      else if (actifs && outilAvant) { var o = outilAvant; outilAvant = null; choisirOutil(o); }
    }
    function pleinEcran() {
      var f = document.fullscreenElement || document.webkitFullscreenElement;
      if (f) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      else (conteneur.requestFullscreen || conteneur.webkitRequestFullscreen || function () {}).call(conteneur);
    }
    function construireBarre() {
      barre.innerHTML = '';
      /* Une seule ligne d'outils, qui défile au besoin : sur iPad, la carte
       * garde la hauteur (quatre lignes de boutons lui en prenaient la moitié). */
      var outils = EMC.el('div', { class: 'rangee', style: LIGNE });
      barre.appendChild(outils);
      if (mode !== 'projection') {
        outils.appendChild(bouton('crayon', '✏️ Crayon', 'Crayon', function () { choisirOutil('crayon'); }));
        outils.appendChild(bouton('texte', '🔤 Texte', 'Texte', function () { choisirOutil('texte'); }));
        outils.appendChild(bouton('fleche', '↗ Flèche', 'Flèche', function () { choisirOutil('fleche'); }));
        outils.appendChild(bouton('forme', '▭ Forme', 'Formes', function () { choisirOutil('forme'); }));
        outils.appendChild(bouton('autocollant', '😀 Autocollant', 'Autocollants', function () { choisirOutil('autocollant'); }));
        outils.appendChild(bouton('gomme', '🧽 Gomme', 'Gomme', function () { choisirOutil('gomme'); }));
        if (mode === 'eleve') outils.appendChild(bouton('deplacer', '✥ Déplacer', 'Déplacer un de mes éléments', function () { choisirOutil('deplacer'); }));
        if (mode === 'prof') outils.appendChild(bouton('selection', '👆 Sélection', 'Sélectionner un élément', function () { choisirOutil('selection'); }));
        outils.appendChild(bouton('main', '🖐 Main', 'Se déplacer sur la carte', function () { choisirOutil('main'); }));
        outils.appendChild(bouton('annuler', '↶', 'Annuler', faireAnnuler));
        outils.appendChild(bouton('refaire', '↷', 'Refaire', faireRefaire));
      }
      outils.appendChild(bouton('moins', '−', 'Dézoomer', function () { zoomer(1 / 1.4); }));
      outils.appendChild(bouton('plus', '+', 'Zoomer', function () { zoomer(1.4); }));
      if (mode === 'eleve') outils.appendChild(bouton('mazone', '⌖ Ma zone', 'Centrer sur ma zone', function () { centrerSur(maZone); }));
      outils.appendChild(bouton('tout', '⊡ Tout', 'Voir toute la carte', vueEnsemble));
      outils.appendChild(bouton('plein', '⛶', 'Plein écran', pleinEcran));
      if (mode !== 'projection') { barre.appendChild(sousBarre); barre.appendChild(legende); dessinerLegende(); }
      choisirOutil(outil);
      majBoutons();
    }

    /* ----------------------------------------------------------
     *  Taille de la scène
     * ---------------------------------------------------------- */
    var premiere = true;
    function redimensionner() {
      var w = hote.clientWidth, h = hote.clientHeight;
      if (!w || !h) return;
      var cx = (stage.width() / 2 - stage.x()) / stage.scaleX(), cy = (stage.height() / 2 - stage.y()) / stage.scaleX();
      stage.size({ width: w, height: h });
      if (premiere) { premiere = false; if (mode === 'eleve' && maZone) centrerSur(maZone); else vueEnsemble(); return; }
      poserVue(stage.scaleX(), w / 2 - cx * stage.scaleX(), h / 2 - cy * stage.scaleX());
    }
    var obs = global.ResizeObserver ? new ResizeObserver(redimensionner) : null;
    if (obs) obs.observe(hote); else global.addEventListener('resize', redimensionner);
    document.addEventListener('fullscreenchange', redimensionner);

    /* ----------------------------------------------------------
     *  Export : toute la carte, à haute définition, fond blanc
     * ---------------------------------------------------------- */
    function exporterPNG(o) {
      o = o || {};
      var cote = Math.min(2 * DEMI * (o.ratio || 3), o.plafond || (IOS ? 4096 : 10000));
      var s = stage.scaleX(), pr = cote / (2 * DEMI * s);
      var masquesVisibles = [];
      Object.keys(elements).forEach(function (id) {
        var e = elements[id];
        if (e.noeud && e.ligne.masque) { e.noeud.visible(false); masquesVisibles.push(e.noeud); }
      });
      calqueVoile.visible(false); calqueBrouillon.visible(false); calqueSelection.visible(false);
      return new Promise(function (resolve, reject) {
        try {
          var region = { x: stage.x() - DEMI * s, y: stage.y() - DEMI * s, width: 2 * DEMI * s, height: 2 * DEMI * s, pixelRatio: pr };
          var source = stage.toCanvas(region);
          var cv = document.createElement('canvas');
          cv.width = source.width; cv.height = source.height;
          var ctx = cv.getContext('2d');
          ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height);
          ctx.drawImage(source, 0, 0);
          source.width = source.height = 0;
          cv.toBlob(function (b) { cv.width = cv.height = 0; b ? resolve(b) : reject(new Error('Export impossible')); }, 'image/png');
        } catch (e) { reject(e); }
      }).finally(function () {
        masquesVisibles.forEach(function (n) { n.visible(true); });
        calqueVoile.visible(true); calqueBrouillon.visible(true); calqueSelection.visible(true);
        stage.batchDraw();
      });
    }

    /* ----------------------------------------------------------
     *  Surface publique
     * ---------------------------------------------------------- */
    api.charger = function (lignes) {
      calqueElements.destroyChildren();
      elements = {};
      (lignes || []).forEach(function (l) { poser(l, { serveur: true }); });
      calqueElements.batchDraw();
    };
    api.appliquer = function (l) {
      if (!l || !l.id) return;
      poser(l, { serveur: true });
      calqueElements.batchDraw();
      if (api.selection && api.selection.id === l.id) montrerSelection(l.id);
    };
    api.contenuMasque = function (id, donnees) {
      if (!donnees) return;
      masques[id] = donnees;
      if (elements[id]) { rendre(id); calqueElements.batchDraw(); }
    };
    api.etat = function (e) {
      etat = Object.assign({}, etat, e || {});
      dessinerVoile(); majBoutons();
      Object.keys(elements).forEach(majDeplacable);
    };
    api.contenus = function (nc) {
      if (nc && nc.carte) c.carte = nc.carte;
      if (nc && nc.missions) c.missions = nc.missions;
      dessinerFond(); dessinerVoile(); if (mode !== 'projection') dessinerLegende();
      Object.keys(elements).forEach(rendre); calqueElements.batchDraw();
    };
    api.vueEnsemble = vueEnsemble;
    api.centrerSur = centrerSur;
    api.exporterPNG = exporterPNG;
    api.lignes = function () {
      return Object.keys(elements).map(function (id) { return Object.assign({}, elements[id].ligne, elements[id].local || {}); })
        .filter(function (l) { return !l.supprime && !l.masque; });
    };
    api.echelle = function () { return stage.scaleX(); };
    api.stage = stage;
    api.outil = choisirOutil;
    api.detruire = function () {
      if (obs) obs.disconnect(); else global.removeEventListener('resize', redimensionner);
      document.removeEventListener('fullscreenchange', redimensionner);
      stage.destroy(); conteneur.innerHTML = '';
    };

    dessinerFond();
    dessinerVoile();
    construireBarre();
    stage.size({ width: Math.max(hote.clientWidth, 300), height: Math.max(hote.clientHeight, 280) });
    if (hote.clientWidth) redimensionner();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { dessinerFond(); Object.keys(elements).forEach(rendre); stage.batchDraw(); });
    return api;
  }

  EMC.Carte = { monter: monter, AUTOCOLLANTS: AUTOCOLLANTS };
})(window);
