/* ============================================================
 *  emc-vues.js — les résultats agrégés de la séance EMC, dessinés
 *  de la même façon au pilotage, à la projection et dans les
 *  exports : nuage de mots, émojis, harcèlomètre, enquête, QR code,
 *  numéros d'urgence.
 *
 *  🔴 Rien ici ne reçoit ni n'affiche de pseudo ou de nom : les
 *  fonctions prennent des lignes déjà réduites à leurs valeurs
 *  (mots, émojis, votes, réponses). C'est ce qui permet à la
 *  projection et aux exports de les utiliser sans risque.
 *
 *  Dépend de emc-commun.js (EMC.el, EMC.normaliserMot).
 * ============================================================ */
(function (global) {
  'use strict';
  var EMC = global.EMC, el = EMC.el;

  /* Le style des vues, injecté une fois : il vaut pour les trois
     pages enseignant et pour les feuilles d'export. */
  var css =
    '.v-nuage{display:flex;flex-wrap:wrap;gap:.2em .7em;align-items:center;justify-content:center;line-height:1.1;padding:.5em}' +
    '.v-nuage span{font-family:"Space Grotesk","Inter",sans-serif;font-weight:600;white-space:nowrap}' +
    '.v-nuage button{font-size:inherit;font-family:inherit;font-weight:inherit;min-height:0;padding:.05em .3em;border:1px dashed transparent;background:none;color:inherit}' +
    '.v-nuage button:hover{border-color:var(--ink-faint)}' +
    '.v-nuage .masque{opacity:.35;text-decoration:line-through}' +
    '.v-nuage-spirale{position:relative;width:100%;height:100%;min-height:8em;overflow:hidden}' +
    '.v-nuage-spirale .plan{position:absolute;left:0;top:0;transform-origin:0 0}' +
    '.v-nuage-spirale .plan>*{position:absolute;white-space:nowrap;line-height:1.05;font-family:"Space Grotesk","Inter",sans-serif;font-weight:600}' +
    '.v-nuage-spirale .plan>button{font-size:inherit;min-height:0;padding:0 .1em;border:1px dashed transparent;background:none}' +
    '.v-nuage-spirale .masque{opacity:.35;text-decoration:line-through}' +
    '.v-barres{display:grid;grid-template-columns:auto 1fr auto;gap:.3em .6em;align-items:center}' +
    '.v-barres .lib{white-space:nowrap}' +
    '.v-barres .jauge{height:1.1em;background:var(--surface-2);border-radius:6px;overflow:hidden}' +
    '.v-barres .jauge i{display:block;height:100%;background:var(--cyan);border-radius:6px}' +
    '.v-barres .n{font-variant-numeric:tabular-nums;font-weight:600;min-width:2ch;text-align:right}' +
    /* la version qui s'ajuste au cadre : jamais coupée, au pire elle défile */
    '.v-barres-cadre{overflow:auto;display:flex;flex-direction:column;justify-content:safe center;min-height:0}' +
    '.v-barres-multi{display:flex;gap:1.6em;align-items:flex-start;width:100%}' +
    '.v-barres-multi>.v-barres{flex:1 1 0;min-width:0}' +
    '.v-barres.sans-jauge{grid-template-columns:minmax(0,1fr) auto}' +
    '.v-barres.sans-jauge .jauge{display:none}' +
    '.v-hm{position:relative;padding:1.6em 0 .4em}' +
    '.v-hm .bande{display:flex;height:2.2em;border-radius:10px;overflow:hidden}' +
    '.v-hm .bande div{display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:.85em;text-align:center;padding:0 .3em;line-height:1.05}' +
    '.v-hm .graduation{display:flex;justify-content:space-between;font-size:.8em;margin-top:.2em;font-variant-numeric:tabular-nums}' +
    '.v-hm .curseur{position:absolute;top:0;transform:translateX(-50%);transition:left .6s ease;text-align:center;font-weight:700}' +
    '.v-hm .curseur::after{content:"";display:block;width:4px;height:3.1em;margin:0 auto;background:var(--ink);border-radius:2px}' +
    '.v-hm .disp{position:absolute;top:1.6em;height:2.2em;border:3px solid var(--ink);border-radius:10px;opacity:.55;pointer-events:none}' +
    '.v-histo{display:grid;grid-template-columns:repeat(11,1fr);gap:3px;align-items:end;height:6em;margin-top:.6em}' +
    '.v-histo div{background:var(--marine);border-radius:4px 4px 0 0;min-height:2px;position:relative}' +
    '.v-histo div span{position:absolute;top:-1.3em;left:0;right:0;text-align:center;font-size:.75em}' +
    '.v-histo-x{display:grid;grid-template-columns:repeat(11,1fr);gap:3px;font-size:.75em;text-align:center}' +
    '.v-stats{display:flex;gap:1.2em;flex-wrap:wrap;margin-top:.5em;font-variant-numeric:tabular-nums}' +
    '.v-stats b{font-size:1.25em}' +
    '.v-qr svg{display:block;width:100%;height:auto;background:#fff;border-radius:8px}' +
    'body.projection .v-barres .jauge{background:#23426e}' +
    'body.projection .v-hm .curseur::after{background:#fff}' +
    'body.projection .v-hm .disp{border-color:#fff}' +
    'body.projection .v-histo div{background:var(--cyan)}' +
    /* le volet « loi » du harcèlomètre (042) */
    '.v-loi h3{margin:0 0 .35em;font-size:1.1em}' +
    '.v-loi>p{margin:.3em 0}' +
    '.v-loi-grille{display:grid;grid-template-columns:repeat(auto-fit,minmax(15em,1fr));gap:.6em;margin:.6em 0}' +
    '.v-loi-grille>div{background:var(--surface-2);border-radius:10px;padding:.55em .75em;border-left:4px solid var(--err)}' +
    '.v-loi-grille>div.faire{border-left-color:var(--ok)}' +
    '.v-loi-grille b{display:block;margin-bottom:.15em}' +
    '.v-loi .chiffre{background:var(--cyan-wash);border-radius:10px;padding:.5em .75em;margin:.5em 0}' +
    '.v-loi .src,.v-reperes .src{font-size:.82em;color:var(--ink-soft);margin:.3em 0 0}' +
    '.v-chiffres{display:grid;grid-template-columns:repeat(auto-fit,minmax(12em,1fr));gap:.6em;margin:.4em 0 .6em}' +
    '.v-chiffres>div{background:var(--surface-2);border-radius:10px;padding:.55em .75em}' +
    '.v-chiffres .val{display:block;font:700 1.8em/1.1 "Space Grotesk","Inter",sans-serif;color:var(--marine)}' +
    '.v-reperes-liste{display:grid;grid-template-columns:repeat(auto-fit,minmax(16em,1fr));gap:.6em}' +
    '.v-reperes-liste>div{border:1px solid var(--line);border-radius:10px;padding:.55em .75em}' +
    '.v-reperes-liste b{display:block;margin-bottom:.15em}' +
    'body.projection .v-loi-grille>div,body.projection .v-chiffres>div{background:#183766}' +
    'body.projection .v-loi .chiffre{background:#183766}' +
    'body.projection .v-chiffres .val{color:var(--cyan)}' +
    'body.projection .v-reperes-liste>div{border-color:#23426e}' +
    'body.projection .v-loi .src,body.projection .v-reperes .src{color:#b7c6dd}';
  var s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);

  var Vues = {};

  /* ---------- nuage de mots ---------- */

  /* lignes : [{ mots: [...] }] · masques : ['forme normalisée', …]
   * → [{ forme, mot (la graphie la plus fréquente), n, masque }] */
  Vues.agregerMots = function (lignes, masques) {
    var m = {}, cache = {};
    (masques || []).forEach(function (x) { cache[x] = true; });
    (lignes || []).forEach(function (l) {
      (l.mots || []).forEach(function (brut) {
        var f = EMC.normaliserMot(brut);
        if (!f) return;
        var g = m[f] || (m[f] = { forme: f, n: 0, graphies: {} });
        g.n++;
        var aff = String(brut).trim().toLowerCase();
        g.graphies[aff] = (g.graphies[aff] || 0) + 1;
      });
    });
    return Object.keys(m).map(function (f) {
      var g = m[f], best = Object.keys(g.graphies).sort(function (a, b) { return g.graphies[b] - g.graphies[a]; })[0];
      return { forme: f, mot: best, n: g.n, masque: !!cache[f] };
    }).sort(function (a, b) { return b.n - a.n || a.mot.localeCompare(b.mot, 'fr'); });
  };

  var TEINTES = ['var(--marine)', 'var(--orange-fonce)', '#1d6f96', 'var(--ink)', '#7a3e8f', '#12805c'];
  /* au vidéoprojecteur, sur le fond marine */
  var TEINTES_SOMBRE = ['#ffd28a', '#7fd0f5', '#ffffff', '#f3a37a', '#c7b3ff', '#8fe3b5'];

  /* opts.surClic(mot) : le pilotage masque / démasque d'un clic.
   * opts.avecMasques : montrer les mots masqués (barrés).
   * opts.spirale : un vrai nuage (projection) — les mots se posent en
   *   spirale autour du plus fréquent, puis l'ensemble se met à
   *   l'échelle du cadre : il tient toujours dans l'écran, même avec
   *   de longs noms d'ateliers. Le conteneur doit avoir une hauteur. */
  Vues.nuage = function (conteneur, agreg, opts) {
    opts = opts || {};
    conteneur.innerHTML = '';
    var liste = agreg.filter(function (x) { return opts.avecMasques || !x.masque; }).slice(0, opts.max || 60);
    if (!liste.length) { conteneur.appendChild(el('p', { class: 'tresmuet' }, opts.vide || 'Pas encore de mots.')); return; }
    if (opts.spirale) return nuageSpirale(conteneur, liste, opts);
    var max = liste[0].n || 1, base = opts.taille || 1;
    var z = el('div', { class: 'v-nuage' });
    /* l'ordre alterne grands et petits : un nuage, pas un classement */
    var ordre = [];
    liste.forEach(function (x, i) { if (i % 2) ordre.push(x); else ordre.unshift(x); });
    ordre.forEach(function (x, i) {
      var t = (0.85 + 2.4 * Math.sqrt(x.n / max)) * base;
      var lib = x.mot + (opts.compte ? ' ·' + x.n : '');
      var noeud = opts.surClic
        ? el('button', { type: 'button', title: x.masque ? 'Démasquer' : 'Masquer', onclick: function () { opts.surClic(x); } }, lib)
        : el('span', null, lib);
      noeud.style.fontSize = t.toFixed(2) + 'em';
      var teintes = opts.teintes || (document.body.classList.contains('projection') ? TEINTES_SOMBRE : TEINTES);
      noeud.style.color = teintes[i % teintes.length];
      if (x.masque) noeud.classList.add('masque');
      z.appendChild(noeud);
    });
    conteneur.appendChild(z);
  };

  /* Un hachage stable : un mot garde son angle de départ d'une mise à
     jour à l'autre, le nuage ne se rebat pas à chaque nouveau mot. */
  function hache(t) { var h = 2166136261; for (var i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; }

  function nuageSpirale(conteneur, liste, opts) {
    var max = liste[0].n || 1, base = opts.taille || 1;
    var teintes = opts.teintes || (document.body.classList.contains('projection') ? TEINTES_SOMBRE : TEINTES);
    var cadre = el('div', { class: 'v-nuage-spirale' });
    var plan = el('div', { class: 'plan' });
    cadre.appendChild(plan);
    conteneur.appendChild(cadre);
    var W = cadre.clientWidth || conteneur.clientWidth || 600;
    var H = cadre.clientHeight || Math.round(W * 0.55);
    if (!cadre.clientHeight) cadre.style.height = H + 'px';
    var noeuds = liste.map(function (x, i) {
      var lib = x.mot + (opts.compte ? ' ·' + x.n : '');
      var n = opts.surClic
        ? el('button', { type: 'button', title: x.masque ? 'Démasquer' : 'Masquer', onclick: function () { opts.surClic(x); } }, lib)
        : el('span', null, lib);
      n.style.fontSize = ((0.85 + 2.4 * Math.sqrt(x.n / max)) * base).toFixed(2) + 'em';
      n.style.color = teintes[i % teintes.length];
      if (x.masque) n.classList.add('masque');
      plan.appendChild(n);
      return { n: n, x: x, l: n.offsetWidth, h: n.offsetHeight };
    });
    /* la spirale est étirée comme le cadre : un nuage large, pas un rond */
    var etire = Math.max(1, Math.min(2.6, W / H)), pose = [], marge = 7;
    var pas = Math.max(2, noeuds.reduce(function (s, o) { return s + o.h; }, 0) / noeuds.length * 0.3);
    function chevauche(r) {
      for (var k = 0; k < pose.length; k++) {
        var p = pose[k];
        if (r.x < p.x + p.l + marge && r.x + r.l + marge > p.x && r.y < p.y + p.h + marge && r.y + r.h + marge > p.y) return true;
      }
      return false;
    }
    noeuds.forEach(function (o, i) {
      var a0 = hache(o.x.forme || o.x.mot) * Math.PI * 2, r = { l: o.l, h: o.h, x: -o.l / 2, y: -o.h / 2 };
      if (i) {
        for (var t = 1; t < 20000; t++) {
          var ang = a0 + Math.sqrt(t) * 1.3, ray = pas * Math.sqrt(t);
          r.x = Math.cos(ang) * ray * etire - o.l / 2;
          r.y = Math.sin(ang) * ray - o.h / 2;
          if (!chevauche(r)) break;
        }
      }
      pose.push({ x: r.x, y: r.y, l: r.l, h: r.h });
      o.n.style.left = r.x + 'px'; o.n.style.top = r.y + 'px';
    });
    var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    pose.forEach(function (p) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x + p.l); y1 = Math.max(y1, p.y + p.h); });
    var ech = Math.min((W - 16) / (x1 - x0), (H - 16) / (y1 - y0), opts.agrandirMax || 1.25);
    plan.style.transform = 'translate(' + (W / 2) + 'px,' + (H / 2) + 'px) scale(' + ech.toFixed(3) + ') translate(' + (-(x0 + x1) / 2) + 'px,' + (-(y0 + y1) / 2) + 'px)';
    /* le cadre change de taille (plein écran, mode de projection) : on refait */
    if (global.ResizeObserver && !conteneur._nuageObs) {
      var avant = W + 'x' + H;
      conteneur._nuageObs = new ResizeObserver(function () {
        var c = conteneur.querySelector('.v-nuage-spirale');
        if (!c || !conteneur._nuageArgs) return;
        var maintenant = c.clientWidth + 'x' + c.clientHeight;
        if (maintenant === avant || !c.clientWidth) return;
        avant = maintenant;
        clearTimeout(conteneur._nuageT);
        conteneur._nuageT = setTimeout(function () { var a = conteneur._nuageArgs; Vues.nuage(conteneur, a[0], a[1]); }, 120);
      });
      conteneur._nuageObs.observe(conteneur);
    }
    conteneur._nuageArgs = [liste, opts];
  }

  /* ---------- barres (émojis, enquête) ---------- */
  function grilleBarres(items, max) {
    var g = el('div', { class: 'v-barres' });
    items.forEach(function (x) {
      var j = el('i'); j.style.width = (100 * x.n / max) + '%';
      if (x.couleur) j.style.background = x.couleur;
      g.appendChild(el('span', { class: 'lib' }, x.lib));
      g.appendChild(el('span', { class: 'jauge' }, j));
      g.appendChild(el('span', { class: 'n' }, String(x.n)));
    });
    return g;
  }
  /* opts.ajuster : la liste TIENT dans le conteneur (qui doit avoir une
     hauteur). On essaie 1, 2 puis 3 colonnes (la 1re colonne garde les
     plus choisis), et pour chacune la plus grande police qui tient ; on
     garde la combinaison la plus lisible. Avant (12/11), une liste trop
     haute était centrée puis coupée : on perdait le HAUT, c'est-à-dire
     les émotions les plus choisies. */
  Vues.barres = function (conteneur, items, opts) {
    opts = opts || {};
    conteneur.innerHTML = '';
    var max = Math.max.apply(null, items.map(function (x) { return x.n; }).concat([1]));
    if (!opts.ajuster) { conteneur.appendChild(grilleBarres(items, max)); return; }
    conteneur.classList.add('v-barres-cadre');
    function poser() {
      var H = conteneur.clientHeight, W = conteneur.clientWidth;
      conteneur.innerHTML = '';
      var multi = el('div', { class: 'v-barres-multi' });
      conteneur.appendChild(multi);
      /* sj : sans les jauges (libellé et nombre seuls) ; enHauteur : la
         hauteur compte (sinon on n'exige que la largeur, et le cadre défile) */
      function essayer(k, s, sj, enHauteur) {
        multi.innerHTML = ''; multi.style.fontSize = s + 'em';
        var par = Math.ceil(items.length / k);
        for (var i = 0; i < k; i++) {
          var tr = items.slice(i * par, (i + 1) * par);
          if (tr.length) { var g = grilleBarres(tr, max); if (sj) g.classList.add('sans-jauge'); multi.appendChild(g); }
        }
        if ((enHauteur !== false && multi.scrollHeight > H + 1) || multi.scrollWidth > W + 1) return false;
        /* chaque colonne garde ses libellés ET une jauge lisible : sinon
           un libellé long déborde sur la colonne voisine */
        for (var c = 0; c < multi.children.length; c++) {
          var col = multi.children[c];
          if (col.scrollWidth > col.clientWidth + 1) return false;
          var j = sj ? null : col.querySelector('.jauge');
          if (j && j.clientWidth < 24) return false;
        }
        return true;
      }
      if (!H || !W) { essayer(1, 1); return; }
      /* le plus lisible : la plus grande police, les jauges en bonus */
      var mieux = null, nk = Math.min(3, Math.max(1, items.length));
      [false, true].forEach(function (sj) {
        for (var k = 1; k <= nk; k++) {
          for (var s = 1; s >= 0.6; s -= 0.05) {
            if (essayer(k, s, sj)) { var sc = s + (sj ? 0 : 0.15); if (!mieux || sc > mieux.sc + 0.001) mieux = { k: k, s: s, sj: sj, sc: sc }; break; }
          }
        }
      });
      /* rien ne tient : une colonne lisible, sans jauge, et le cadre défile
         (on ne coupe ni ne chevauche jamais) */
      if (!mieux) {
        mieux = { k: 1, s: 0.6, sj: true, h: false };
        for (var s2 = 1; s2 >= 0.6; s2 -= 0.05) if (essayer(1, s2, true, false)) { mieux.s = s2; break; }
      }
      essayer(mieux.k, mieux.s, mieux.sj, mieux.h);
      conteneur.dataset.colonnes = mieux.k;
    }
    poser();
    conteneur._barresArgs = poser;
    if (global.ResizeObserver && !conteneur._barresObs) {
      var avant = conteneur.clientWidth + 'x' + conteneur.clientHeight;
      conteneur._barresObs = new ResizeObserver(function () {
        var m = conteneur.clientWidth + 'x' + conteneur.clientHeight;
        if (m === avant || !conteneur.clientWidth) return;
        avant = m;
        clearTimeout(conteneur._barresT);
        conteneur._barresT = setTimeout(function () { if (conteneur._barresArgs) conteneur._barresArgs(); }, 100);
      });
      conteneur._barresObs.observe(conteneur);
    }
  };

  /* lignes : [{ emojis: [...] }] · catalogue : contenus.mots.emojis */
  Vues.compterEmojis = function (lignes, catalogue) {
    var n = {};
    (lignes || []).forEach(function (l) { (l.emojis || []).forEach(function (e) { n[e] = (n[e] || 0) + 1; }); });
    var items = (catalogue || []).map(function (c) { return { lib: c.e + ' ' + c.l, n: n[c.e] || 0, e: c.e }; });
    /* un émoji retiré du catalogue en cours de séance reste compté */
    Object.keys(n).forEach(function (e) {
      if (!(catalogue || []).some(function (c) { return c.e === e; })) items.push({ lib: e, n: n[e], e: e });
    });
    return items.sort(function (a, b) { return b.n - a.n; });
  };
  Vues.emojis = function (conteneur, lignes, catalogue, opts) {
    var items = Vues.compterEmojis(lignes, catalogue);
    if (opts && opts.seulementUtilises) items = items.filter(function (x) { return x.n > 0; });
    Vues.barres(conteneur, items, opts);
  };

  /* ---------- harcèlomètre ---------- */
  Vues.statsVotes = function (valeurs) {
    var v = valeurs.filter(function (x) { return typeof x === 'number'; }).slice().sort(function (a, b) { return a - b; });
    var n = v.length, histo = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    v.forEach(function (x) { histo[Math.max(0, Math.min(10, Math.round(x)))]++; });
    if (!n) return { n: 0, histo: histo };
    var moy = v.reduce(function (a, b) { return a + b; }, 0) / n;
    var med = n % 2 ? v[(n - 1) / 2] : (v[n / 2 - 1] + v[n / 2]) / 2;
    var et = Math.sqrt(v.reduce(function (a, b) { return a + (b - moy) * (b - moy); }, 0) / n);
    return { n: n, moyenne: moy, mediane: med, ecart: et, min: v[0], max: v[n - 1], histo: histo };
  };

  var COULEURS_ECHELLE = ['#2fae6a', '#e0a21b', '#e8743b', '#c33a2f'];
  function fmt(x) { return x == null || isNaN(x) ? '—' : (Math.round(x * 10) / 10).toString().replace('.', ','); }
  Vues.fmt = fmt;

  /* La zone de l'échelle où tombe une valeur. */
  Vues.zoneEchelle = function (echelle, v) {
    for (var i = 0; i < (echelle || []).length; i++) if (v >= echelle[i].de - 0.5 && v <= echelle[i].a + 0.5) return i;
    return -1;
  };

  /* stats (statsVotes) · echelle : contenus.harcelometre.echelle
   * opts : { histo, stats, votants, prets } */
  Vues.harcelometre = function (conteneur, stats, echelle, opts) {
    opts = opts || {};
    conteneur.innerHTML = '';
    var w = el('div', { class: 'v-hm' });
    var bande = el('div', { class: 'bande' });
    (echelle || []).forEach(function (z, i) {
      var d = el('div', null, z.de + '–' + z.a);
      d.style.flex = String(z.a - z.de + 1);
      d.style.background = COULEURS_ECHELLE[i % 4];
      d.title = z.titre;
      bande.appendChild(d);
    });
    w.appendChild(bande);
    var grad = el('div', { class: 'graduation' });
    for (var k = 0; k <= 10; k++) grad.appendChild(el('span', null, String(k)));
    w.appendChild(grad);
    if (stats && stats.n) {
      var pos = function (v) { return ((v + 0.5) / 11 * 100) + '%'; };
      var disp = el('div', { class: 'disp' });
      var a = Math.max(0, stats.moyenne - stats.ecart), b = Math.min(10, stats.moyenne + stats.ecart);
      disp.style.left = pos(a); disp.style.width = 'calc(' + pos(b) + ' - ' + pos(a) + ')';
      disp.title = 'moyenne ± écart-type';
      w.appendChild(disp);
      var c = el('div', { class: 'curseur' }, fmt(stats.moyenne));
      c.style.left = pos(stats.moyenne);
      w.appendChild(c);
    }
    conteneur.appendChild(w);
    if (opts.histo !== false && stats) {
      var max = Math.max.apply(null, stats.histo.concat([1]));
      var h = el('div', { class: 'v-histo' }), x = el('div', { class: 'v-histo-x' });
      stats.histo.forEach(function (n, i) {
        var barre = el('div', null, n ? el('span', null, String(n)) : null);
        barre.style.height = (100 * n / max) + '%';
        h.appendChild(barre); x.appendChild(el('span', null, String(i)));
      });
      conteneur.appendChild(h); conteneur.appendChild(x);
    }
    if (opts.stats !== false && stats) {
      conteneur.appendChild(el('div', { class: 'v-stats' },
        el('span', null, 'Moyenne ', el('b', null, fmt(stats.moyenne))),
        el('span', null, 'Médiane ', el('b', null, fmt(stats.mediane))),
        el('span', null, 'Écart-type ', el('b', null, fmt(stats.ecart))),
        el('span', null, 'Votants ', el('b', null, String(stats.n || 0) + (opts.prets != null ? ' / ' + opts.prets : '')))));
    }
  };

  /* ---------- harcèlomètre : ce que dit la loi (042) ----------
   * sit : la situation (sit.loi : titre, texte, risque, demarches,
   * source, chiffre) · hm : contenus.harcelometre (loi_note).
   * Rend false si la situation n'a pas de volet « loi ». */
  Vues.aLoi = function (sit) { var l = sit && sit.loi; return !!(l && (l.texte || l.risque || l.demarches)); };
  Vues.loi = function (conteneur, sit, hm, opts) {
    opts = opts || {};
    conteneur.innerHTML = '';
    if (!Vues.aLoi(sit)) return false;
    var l = sit.loi, w = el('div', { class: 'v-loi' });
    if (opts.titre !== false) w.appendChild(el('h3', null, '⚖️ ' + (l.titre || 'Ce que dit la loi')));
    if (l.texte) w.appendChild(el('p', null, l.texte));
    var g = el('div', { class: 'v-loi-grille' });
    if (l.risque) g.appendChild(el('div', null, el('b', null, 'Ce qu\'on risque'), l.risque));
    if (l.demarches) g.appendChild(el('div', { class: 'faire' }, el('b', null, 'Que faire ?'), l.demarches));
    if (g.children.length) w.appendChild(g);
    if (l.chiffre) w.appendChild(el('div', { class: 'chiffre' }, '📊 ' + l.chiffre));
    var pied = [l.source, (hm && hm.loi_note) || ''].filter(Boolean).join(' · ');
    if (pied) w.appendChild(el('p', { class: 'src' }, pied));
    conteneur.appendChild(w);
    return true;
  };

  /* Les repères généraux et les chiffres en France.
   * opts : { chiffresSeuls } (le petit rappel de la projection) */
  Vues.reperesLoi = function (conteneur, hm, opts) {
    opts = opts || {};
    conteneur.innerHTML = '';
    hm = hm || {};
    var w = el('div', { class: 'v-reperes' });
    var ch = hm.chiffres || [];
    if (ch.length) {
      w.appendChild(el('div', { class: 'v-chiffres' }, ch.map(function (c) {
        return el('div', null, el('span', { class: 'val' }, c.valeur || ''), c.texte || '',
          c.source && !opts.chiffresSeuls ? el('p', { class: 'src' }, c.source) : null);
      })));
      if (hm.chiffres_question && !opts.chiffresSeuls) w.appendChild(el('p', null, el('b', null, '🤔 '), hm.chiffres_question));
    }
    if (!opts.chiffresSeuls && (hm.loi_reperes || []).length) {
      w.appendChild(el('div', { class: 'v-reperes-liste' }, hm.loi_reperes.map(function (r) {
        return el('div', null, el('b', null, r.titre || ''), r.texte || '');
      })));
    }
    if (!w.children.length) return false;
    conteneur.appendChild(w);
    return true;
  };

  /* ---------- enquête ---------- */
  /* reponses : [{ reponses: { q1: 'oui', … } }] · questions : contenus.enquete.questions */
  Vues.enquete = function (conteneur, lignes, questions) {
    conteneur.innerHTML = '';
    (questions || []).forEach(function (q) {
      var n = {};
      (lignes || []).forEach(function (l) { var r = l.reponses && l.reponses[q.id]; if (r) n[r] = (n[r] || 0) + 1; });
      var bloc = el('div', { style: 'margin-bottom:1em' }, el('h3', null, q.texte));
      var b = el('div'); bloc.appendChild(b);
      var sans = (lignes || []).filter(function (l) { return !(l.reponses && l.reponses[q.id]); }).length;
      Vues.barres(b, (q.choix || []).map(function (c) { return { lib: c, n: n[c] || 0 }; })
        .concat(sans ? [{ lib: 'sans réponse', n: sans, couleur: 'var(--ink-faint)' }] : []));
      conteneur.appendChild(bloc);
    });
  };

  /* ---------- QR code et numéros ---------- */
  Vues.qr = function (conteneur, url) {
    conteneur.innerHTML = '';
    if (!global.qrcode) { conteneur.appendChild(el('code', null, url)); return; }
    var q = global.qrcode(0, 'M'); q.addData(url); q.make();
    var d = el('div', { class: 'v-qr', title: url, html: q.createSvgTag({ cellSize: 6, margin: 2, scalable: true }) });
    conteneur.appendChild(d);
  };

  /* L'adresse de la page élève, à partir de celle de la page enseignant :
     …/Site-Web-Portfolio/prof/emc.html → …/Site-Web-Portfolio/emc/ */
  Vues.urlEleve = function (code) {
    var chemin = location.pathname.replace(/prof\/[^\/]*$/, 'emc/');
    return location.origin + chemin + (code ? '?code=' + encodeURIComponent(code) : '');
  };

  Vues.numeros = function (conteneur, numeros, opts) {
    conteneur.innerHTML = '';
    var z = el('div', { class: 'numeros' + (opts && opts.grand ? ' grand' : '') });
    (numeros || []).forEach(function (n) { z.appendChild(el('span', null, n.icone ? n.icone + ' ' : '', el('b', null, n.numero), ' ' + n.sens)); });
    conteneur.appendChild(z);
  };

  /* Les numéros en cartes : qui répond, quand appeler (étape 5, fin). */
  Vues.numerosDetailles = function (conteneur, numeros) {
    conteneur.innerHTML = '';
    var g = el('div', { class: 'numeros-details' });
    (numeros || []).forEach(function (n) {
      g.appendChild(el('div', null,
        el('div', { class: 'nd-tete' }, n.icone ? el('span', { class: 'nd-ic', 'aria-hidden': 'true' }, n.icone) : null, el('b', null, n.numero)),
        el('div', { class: 'nd-sens' }, n.sens),
        n.qui ? el('p', null, n.qui) : null,
        n.quand ? el('p', { class: 'nd-quand' }, el('b', null, 'Quand ? '), n.quand) : null));
    });
    conteneur.appendChild(g);
  };

  /* L'identifiant d'une vidéo YouTube (watch?v=, youtu.be/, embed/,
     shorts/), ou null. */
  Vues.youtubeId = function (url) {
    var m = /(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/.exec(url || '');
    return m ? m[1] : null;
  };

  /* Le lecteur d'une vidéo OneDrive, comme dans les séquences SNT :
     lien de partage + « download=1 » dans le lecteur natif, crédits
     et liens de secours dessous. Sans MP4, une vidéo YouTube est
     intégrée par youtube-nocookie.com — 🔴 sur les pages enseignant
     seulement (projection, pilotage) : la tablette d'un élève ne
     charge rien de YouTube, elle n'a que le lien. */
  Vues.video = function (conteneur, v) {
    conteneur.innerHTML = '';
    var yt = Vues.youtubeId(v.lien);
    if (!v.mp4 && yt) {
      var cadre = el('div', { class: 'video-yt' });
      cadre.appendChild(el('iframe', { src: 'https://www.youtube-nocookie.com/embed/' + yt + '?rel=0',
        title: v.titre || 'Vidéo', allow: 'autoplay; encrypted-media; picture-in-picture; fullscreen',
        allowfullscreen: 'true', referrerpolicy: 'strict-origin-when-cross-origin', loading: 'lazy' }));
      conteneur.appendChild(cadre);
    } else if (v.mp4) {
      var src = v.mp4 + (v.mp4.indexOf('?') >= 0 ? '&' : '?') + 'download=1';
      var vid = el('video', { controls: true, preload: 'metadata', playsinline: true, title: v.titre || '' });
      vid.src = src;
      vid.style.width = '100%'; vid.style.maxHeight = '70vh'; vid.style.background = '#000'; vid.style.borderRadius = '12px';
      conteneur.appendChild(vid);
    } else {
      conteneur.appendChild(el('div', { class: 'encadre orange' },
        'Pas encore de fichier MP4 pour cette vidéo : ajoute le lien de partage OneDrive dans « Contenus de la séance ».'));
    }
    var pied = el('p', { class: 'tresmuet' }, v.titre ? el('b', null, v.titre) : null);
    if (v.credits) pied.appendChild(document.createTextNode(' · ' + v.credits));
    if (v.mp4) { pied.appendChild(document.createTextNode(' · ')); pied.appendChild(el('a', { href: v.mp4, target: '_blank', rel: 'noopener' }, 'Ouvrir sur OneDrive')); }
    if (v.lien) { pied.appendChild(document.createTextNode(' · ')); pied.appendChild(el('a', { href: v.lien, target: '_blank', rel: 'noopener' }, 'Lien d\'origine')); }
    conteneur.appendChild(pied);
    if (v.note) conteneur.appendChild(el('div', { class: 'encadre orange video-note' }, v.note));
  };

  /* ---------- plein écran (les trois projections) ----------
   * La vraie API d'abord (préfixée pour Safari). Si le navigateur la
   * refuse — Chrome sur iPad, Safari ancien, page dans un cadre — on
   * passe en mode « immersif » : la page cache sa barre et occupe
   * toute la fenêtre (classe body.immersif, à styler par la page).
   * Essai du 11/11 : le bouton ne faisait rien depuis les tablettes. */
  function enPleinEcran() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }
  Vues.pleinEcran = function () {
    var d = document, e = d.documentElement, b = d.body;
    if (enPleinEcran() || b.classList.contains('immersif')) {
      b.classList.remove('immersif');
      if (enPleinEcran()) { var x = d.exitFullscreen || d.webkitExitFullscreen; if (x) try { x.call(d); } catch (er) {} }
      setTimeout(function () { global.dispatchEvent(new Event('resize')); }, 80);
      return;
    }
    var repli = function () {
      if (enPleinEcran()) return;
      b.classList.add('immersif');
      global.scrollTo(0, 0);
      global.dispatchEvent(new Event('resize'));
      var t = el('div', { class: 'toast-immersif', role: 'status' },
        'Cette tablette refuse le vrai plein écran : la page occupe toute la fenêtre. Sur iPad, dans Safari : « aA » → « Masquer la barre d\'outils ». Touche ⛶ pour revenir.');
      b.appendChild(t); setTimeout(function () { t.remove(); }, 7000);
    };
    var demande = e.requestFullscreen || e.webkitRequestFullscreen || e.webkitRequestFullScreen;
    if (!demande) return repli();
    try {
      var p = demande.call(e);
      if (p && p.then) p.then(null, repli);
    } catch (er) { return repli(); }
    setTimeout(repli, 700);         /* rien ne s'est passé : repli */
  };
  /* À brancher sur chaque bouton ⛶ ; Échap ou geste système = sortie. */
  Vues.boutonPleinEcran = function (bouton) {
    if (!bouton) return;
    bouton.addEventListener('click', Vues.pleinEcran);
    var maj = function () { bouton.setAttribute('aria-pressed', enPleinEcran() || document.body.classList.contains('immersif') ? 'true' : 'false'); setTimeout(function () { global.dispatchEvent(new Event('resize')); }, 80); };
    document.addEventListener('fullscreenchange', maj);
    document.addEventListener('webkitfullscreenchange', maj);
  };
  (function () {
    var s2 = document.createElement('style');
    s2.textContent = '.toast-immersif{position:fixed;left:50%;bottom:1rem;transform:translateX(-50%);z-index:90;max-width:min(90vw,640px);background:#fff;color:#161f33;border-radius:12px;padding:.7rem 1rem;font-size:1rem;box-shadow:0 6px 24px rgba(0,0,0,.35)}';
    document.head.appendChild(s2);
  })();

  EMC.Vues = Vues;
})(window);
