/* ============================================================
 *  quiz-calculatrice.js — la calculatrice « collège » du téléphone
 *  ------------------------------------------------------------
 *  Ouverte par le bouton « Calculatrice » d'une question qui porte
 *  "calculatrice": true. Chiffres, virgule, + − × ÷, parenthèses,
 *  fraction à VRAIE barre (numérateur au-dessus du dénominateur),
 *  carré, puissance de 10. L'expression s'affiche rendue par KaTeX.
 *
 *  🔴 Tout reste sur l'appareil : aucune requête, aucune donnée
 *  envoyée. Pas d'eval : un petit analyseur maison (§3) calcule.
 *
 *  L'expression est un arbre, pas une chaîne : une ligne est une
 *  liste de nœuds — un caractère { t: 'c', v: '7' }, une fraction
 *  { t: 'frac', num: [ligne], den: [ligne] }, une puissance de 10
 *  { t: 'p10', exp: [ligne] }. Le curseur est une pile de cadres
 *  { l: ligne, i: position, noeud, place } : on entre dans une
 *  fraction, on en sort par ▶.
 *
 *  Quiz.calculatrice.ouvrir({ surResultat: fn }) — fn(nombre) reçoit
 *  le résultat quand l'élève touche « Utiliser ce résultat ».
 *  Quiz.calculatrice.fermer(oublier) — oublier : efface l'expression.
 * ============================================================ */
(function (global) {
  'use strict';
  var Q = global.Quiz, esc = Q.esc;

  /* ----------------------------------------------------------
   *  1. Le modèle et le curseur
   * ---------------------------------------------------------- */
  var racine = [], pile = [{ l: racine, i: 0 }], resultat = null, erreur = '';
  function cadre() { return pile[pile.length - 1]; }
  function vider() { racine = []; pile = [{ l: racine, i: 0 }]; resultat = null; erreur = ''; }

  function inserer(noeud) {
    var c = cadre();
    c.l.splice(c.i, 0, noeud); c.i++;
    if (noeud.t === 'frac') { c.i--; entrer(noeud, 'num', 0); }
    else if (noeud.t === 'p10') { c.i--; entrer(noeud, 'exp', 0); }
  }
  /* entrer dans une place d'un nœud (le cadre courant pointe AVANT le nœud) */
  function entrer(noeud, place, ou) {
    var l = noeud[place];
    pile.push({ l: l, i: ou === 'fin' ? l.length : 0, noeud: noeud, place: place });
  }
  /* sortir du nœud courant : le curseur se pose après (ou avant) lui */
  function sortir(apres) {
    if (pile.length < 2) return;
    var c = pile.pop(), p = cadre(), k = p.l.indexOf(c.noeud);
    p.i = apres ? k + 1 : k;
  }
  function droite() {
    var c = cadre();
    if (c.i < c.l.length) {
      var n = c.l[c.i];
      if (n.t === 'frac') return entrer(n, 'num', 0);
      if (n.t === 'p10') return entrer(n, 'exp', 0);
      c.i++; return;
    }
    if (c.place === 'num') { pile.pop(); return entrer(c.noeud, 'den', 0); }
    sortir(true);
  }
  function gauche() {
    var c = cadre();
    if (c.i > 0) {
      var n = c.l[c.i - 1];
      if (n.t === 'frac') { c.i--; return entrer(n, 'den', 'fin'); }
      if (n.t === 'p10') { c.i--; return entrer(n, 'exp', 'fin'); }
      c.i--; return;
    }
    if (c.place === 'den') { pile.pop(); return entrer(c.noeud, 'num', 'fin'); }
    sortir(false);
  }
  function effacer() {
    var c = cadre();
    if (c.i > 0) {
      var n = c.l[c.i - 1];
      // une fraction ou une puissance pleine : on y entre d'abord, on la vide ensuite
      if (n.t === 'frac' && (n.num.length || n.den.length)) { c.i--; return entrer(n, 'den', 'fin'); }
      if (n.t === 'p10' && n.exp.length) { c.i--; return entrer(n, 'exp', 'fin'); }
      c.l.splice(c.i - 1, 1); c.i--; return;
    }
    if (c.place === 'den') { pile.pop(); return entrer(c.noeud, 'num', 'fin'); }
    if (pile.length > 1) {
      var vide = c.noeud.t === 'frac' ? !c.noeud.num.length && !c.noeud.den.length : !c.noeud.exp.length;
      sortir(false);
      if (vide) cadre().l.splice(cadre().i, 1);
    }
  }

  /* ----------------------------------------------------------
   *  2. L'affichage : l'arbre en LaTeX, le curseur en rouge
   * ---------------------------------------------------------- */
  var CURSEUR = '\\textcolor{#a8321f}{\\rule[-0.15em]{0.08em}{1em}}';
  var VIDE = '\\textcolor{#9a8f7d}{\\square}';
  var TEX = { '×': '\\times ', '÷': '\\div ', '−': '-', '+': '+', ',': '{,}', '(': '\\left(', ')': '\\right)', '²': '^{2}' };
  function tex(l) {
    var c = cadre(), h = '', ici = c.l === l;
    if (!l.length) return ici ? CURSEUR : VIDE;
    // des parenthèses dépareillées le temps de la frappe : \left( sans \right) casse KaTeX
    var ouvertes = 0;
    l.forEach(function (n) { if (n.t === 'c' && n.v === '(') ouvertes++; if (n.t === 'c' && n.v === ')') ouvertes--; });
    for (var k = 0; k < l.length; k++) {
      if (ici && c.i === k) h += CURSEUR;
      var n = l[k], prec = l[k - 1];
      if (n.t === 'frac') h += '{\\dfrac{' + tex(n.num) + '}{' + tex(n.den) + '}}';
      else if (n.t === 'p10') {
        // « × 10ⁿ » après un nombre ; « 10ⁿ » seul en tête ou après un opérateur
        var seul = !prec || (prec.t === 'c' && /[+−×÷(]/.test(prec.v));
        h += (seul ? '' : '\\times ') + '10^{' + tex(n.exp) + '}';
      } else if (n.v === '²') h += prec ? '^{2}' : '{}^{2}';
      else if (n.v === '(' || n.v === ')') h += ouvertes === 0 ? TEX[n.v] : n.v;
      else h += TEX[n.v] || n.v;
    }
    if (ici && c.i === l.length) h += CURSEUR;
    return h;
  }
  function rendreTex(t) {
    if (!global.katex) return '<span class="tex-brut">' + esc(t) + '</span>';
    try { return global.katex.renderToString(t, { throwOnError: false, trust: false, strict: 'ignore', displayMode: true, output: 'htmlAndMathml' }); }
    catch (e) { return '<span class="tex-brut">' + esc(t) + '</span>'; }
  }

  /* Un nombre, écrit à la française : 19,62 ; 2,4 × 10⁸ au-delà du million
     ou en deçà du millième. Dix chiffres significatifs au plus. */
  function decomposer(v) {
    if (v === 0) return { m: '0', e: 0 };
    var a = Math.abs(v);
    if (a >= 1e-3 && a < 1e9) return { m: String(+v.toPrecision(10)), e: 0 };
    var e = Math.floor(Math.log10(a)), m = +(v / Math.pow(10, e)).toPrecision(10);
    if (Math.abs(m) >= 10) { m = +(m / 10).toPrecision(10); e++; }
    return { m: String(m), e: e };
  }
  function nombreTex(v) {
    var d = decomposer(v), m = d.m.replace('-', '−');
    var ent = m.split('.')[0], dec = m.split('.')[1];
    // les milliers séparés d'une espace fine, comme au collège
    ent = ent.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,');
    var t = (ent + (dec ? '{,}' + dec : '')).replace('−', '-');
    return d.e ? t + '\\times 10^{' + d.e + '}' : t;
  }

  /* ----------------------------------------------------------
   *  3. Le calcul : un analyseur descendant, jamais eval
   *  expr   := terme (('+' | '−') terme)*
   *  terme  := signe (('×' | '÷') signe | signe implicite)*
   *  signe  := ('−' | '+') signe | suffixe
   *  suffixe:= base ('²' | ×10ⁿ)*
   *  base   := nombre | '(' expr ')' | fraction | 10ⁿ
   * ---------------------------------------------------------- */
  function Incomplet(m) { this.message = m; }
  function jetons(l) {
    var out = [], num = '';
    function pousser() { if (num) { out.push({ t: 'n', v: num }); num = ''; } }
    l.forEach(function (n) {
      if (n.t === 'c' && /[0-9,]/.test(n.v)) { num += n.v; return; }
      pousser();
      out.push(n.t === 'c' ? { t: 'o', v: n.v } : n);
    });
    pousser();
    return out;
  }
  function evaluer(l) {
    var js = jetons(l), k = 0;
    if (!js.length) throw new Incomplet('Expression vide.');
    function vu() { return js[k]; }
    function est(v) { var j = js[k]; return j && j.t === 'o' && j.v === v; }
    function expr() {
      var v = terme();
      while (est('+') || est('−')) { var o = js[k++].v, w = terme(); v = o === '+' ? v + w : v - w; }
      return v;
    }
    function commenceBase() { var j = vu(); return j && (j.t === 'n' || j.t === 'frac' || j.t === 'p10' || (j.t === 'o' && j.v === '(')); }
    function terme() {
      var v = signe();
      for (;;) {
        if (est('×')) { k++; v *= signe(); }
        else if (est('÷')) { k++; var w = signe(); if (w === 0) throw new Incomplet('Division par zéro.'); v /= w; }
        else if (commenceBase()) v *= suffixe();       // 2(3 + 4), 3 · fraction
        else return v;
      }
    }
    function signe() {
      if (est('−')) { k++; return -signe(); }
      if (est('+')) { k++; return signe(); }
      return suffixe();
    }
    function puissance10(n) {
      var e = evaluer(n.exp);
      if (Math.abs(e) > 300) throw new Incomplet('Exposant trop grand.');
      return Math.pow(10, e);
    }
    function suffixe() {
      var v = base();
      for (;;) {
        if (est('²')) { k++; v = v * v; }
        else if (vu() && vu().t === 'p10') { v *= puissance10(js[k++]); }
        else return v;
      }
    }
    function base() {
      var j = js[k];
      if (!j) throw new Incomplet('Expression incomplète.');
      if (j.t === 'n') {
        k++;
        if (!/^(\d+(,\d*)?|,\d+)$/.test(j.v)) throw new Incomplet('Nombre mal écrit : « ' + j.v + ' ».');
        return parseFloat(j.v.replace(',', '.'));
      }
      if (j.t === 'frac') {
        k++;
        if (!j.num.length || !j.den.length) throw new Incomplet('Fraction incomplète.');
        var d = evaluer(j.den);
        if (d === 0) throw new Incomplet('Division par zéro.');
        return evaluer(j.num) / d;
      }
      if (j.t === 'p10') { k++; return puissance10(j); }
      if (j.t === 'o' && j.v === '(') {
        k++;
        var v = expr();
        if (!est(')')) throw new Incomplet('Une parenthèse n\'est pas fermée.');
        k++; return v;
      }
      throw new Incomplet('Expression incomplète.');
    }
    var v = expr();
    if (k < js.length) throw new Incomplet(est(')') ? 'Une parenthèse fermée de trop.' : 'Expression incomplète.');
    if (!isFinite(v)) throw new Incomplet('Résultat trop grand.');
    return v;
  }

  /* ----------------------------------------------------------
   *  4. Le panneau
   * ---------------------------------------------------------- */
  var TOUCHES = [
    ['frac', '<span class="k-frac" aria-hidden="true"><i></i><b></b><i></i></span>', 'Fraction'],
    ['²', 'x<sup>2</sup>', 'Au carré'],
    ['p10', '×10<sup>n</sup>', 'Fois dix puissance n'],
    ['(', '(', 'Parenthèse ouvrante'], [')', ')', 'Parenthèse fermante'],
    ['7'], ['8'], ['9'], ['efface', '⌫', 'Effacer'], ['C', 'C', 'Tout effacer'],
    ['4'], ['5'], ['6'], ['×', '×', 'Multiplier'], ['÷', '÷', 'Diviser'],
    ['1'], ['2'], ['3'], ['+', '+', 'Plus'], ['−', '−', 'Moins'],
    ['0'], [',', ',', 'Virgule'], ['gauche', '◀', 'Curseur à gauche'], ['droite', '▶', 'Curseur à droite, sortir de la fraction'], ['=', '=', 'Calculer']
  ];
  var panneau = null, options = {}, ouvreur = null;

  function construire() {
    panneau = document.createElement('div');
    panneau.className = 'calc';
    panneau.setAttribute('role', 'dialog');
    panneau.setAttribute('aria-modal', 'false');
    panneau.setAttribute('aria-labelledby', 'calc-titre');
    panneau.hidden = true;
    panneau.innerHTML =
      '<div class="calc-tete"><b id="calc-titre">Calculatrice</b>' +
        '<span class="calc-note">reste sur ton téléphone</span>' +
        '<button type="button" class="calc-fermer" data-k="fermer" aria-label="Fermer la calculatrice">✕</button></div>' +
      '<div class="calc-ecran"><div class="calc-expr" id="calc-expr"></div><div class="calc-res" id="calc-res" aria-live="polite"></div></div>' +
      '<div class="calc-touches">' + TOUCHES.map(function (t) {
        var cls = /^\d$/.test(t[0]) ? ' chiffre' : t[0] === '=' ? ' egal' : /^(C|efface)$/.test(t[0]) ? ' efface' : '';
        return '<button type="button" class="calc-k' + cls + '" data-k="' + esc(t[0]) + '"' + (t[2] ? ' aria-label="' + esc(t[2]) + '"' : '') + '>' + (t[1] || t[0]) + '</button>';
      }).join('') + '</div>' +
      '<button type="button" class="bouton rouge calc-utiliser" id="calc-utiliser" hidden>Utiliser ce résultat</button>';
    document.body.appendChild(panneau);
    panneau.addEventListener('click', function (e) {
      var b = e.target.closest('[data-k]'); if (!b) return;
      touche(b.dataset.k);
    });
    panneau.querySelector('#calc-utiliser').onclick = function () {
      if (resultat == null || !options.surResultat) return;
      var f = options.surResultat; fermer(false); f(resultat);
    };
    panneau.addEventListener('keydown', clavier);
  }

  function touche(k) {
    if (k === 'fermer') return fermer(false);
    if (k === '=') {
      try { resultat = evaluer(racine); erreur = ''; } catch (e) {
        if (!(e instanceof Incomplet)) throw e;
        resultat = null; erreur = e.message;
      }
      return dessiner();
    }
    resultat = null; erreur = '';
    if (k === 'C') vider();
    else if (k === 'efface') effacer();
    else if (k === 'gauche') gauche();
    else if (k === 'droite') droite();
    else if (k === 'frac') inserer({ t: 'frac', num: [], den: [] });
    else if (k === 'p10') inserer({ t: 'p10', exp: [] });
    else inserer({ t: 'c', v: k });
    dessiner();
  }

  function clavier(e) {
    var k = e.key, map = { '*': '×', 'x': '×', '/': '÷', '-': '−', '.': ',', 'Enter': '=', 'Backspace': 'efface',
                           'ArrowLeft': 'gauche', 'ArrowRight': 'droite', 'Delete': 'C', '^': 'p10' };
    if (k === 'Escape') { e.preventDefault(); return fermer(false); }
    if (k === 'Tab') return;      // le focus circule entre les touches
    var v = /^[0-9,+()]$/.test(k) ? k : map[k];
    // Entrée sur une touche qui a le focus : c'est la touche qui compte
    if (k === 'Enter' && e.target.closest && e.target.closest('[data-k]')) return;
    if (!v) return;
    e.preventDefault(); touche(v);
  }

  function dessiner() {
    if (!panneau) return;
    panneau.querySelector('#calc-expr').innerHTML = rendreTex(tex(racine));
    var r = panneau.querySelector('#calc-res');
    r.innerHTML = erreur ? '<span class="calc-erreur">' + esc(erreur) + '</span>'
      : resultat != null ? rendreTex('=\\ ' + nombreTex(resultat)) : '';
    var u = panneau.querySelector('#calc-utiliser');
    u.hidden = resultat == null || !options.surResultat;
  }

  function ouvrir(opts) {
    options = opts || {};
    if (!panneau) construire();
    ouvreur = document.activeElement;
    panneau.hidden = false;
    document.body.classList.add('calc-ouverte');
    dessiner();
    var egal = panneau.querySelector('[data-k="7"]'); if (egal) egal.focus({ preventScroll: true });
  }
  function fermer(oublier) {
    if (oublier) vider();
    if (!panneau || panneau.hidden) return;
    panneau.hidden = true;
    document.body.classList.remove('calc-ouverte');
    if (ouvreur && document.contains(ouvreur)) try { ouvreur.focus({ preventScroll: true }); } catch (e) { /* rien */ }
  }

  Q.calculatrice = {
    ouvrir: ouvrir, fermer: fermer, ouverte: function () { return !!(panneau && !panneau.hidden); },
    // pour les bancs d'essai et la saisie : le calcul seul, et l'écriture d'un nombre
    decomposer: decomposer,
    _evaluer: function (l) { return evaluer(l); }
  };
})(window);
