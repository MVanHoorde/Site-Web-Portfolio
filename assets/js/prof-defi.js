/* ============================================================
 *  prof-defi.js — l'onglet « Défi S4 » du tableau de bord
 *  ------------------------------------------------------------
 *  11/10/2026. La séance 4 de l'introduction SNT (t0) est un défi :
 *  chaque groupe démonte une unité centrale, en photographie et nomme
 *  les éléments (jusqu'à 30 fiches), puis la remonte. Un seul groupe
 *  gagne par classe ; la récompense (chez Loïc, +1 point au prochain contrôle) n’est affichée qu’à ses groupes, dans la page t0. On désigne le
 *  meilleur TRAVAIL INDIVIDUEL ; son auteur donne ensuite à Loïc les
 *  noms de son groupe — le site ne connaît pas les groupes.
 *
 *  LE VOTE, À L'AVEUGLE, EN TROIS TEMPS (décision de Loïc)
 *    1. Écrémage   — « Incomplet » élimine, « Garder » passe au tri.
 *    2. Premier tri — « Bien » ou « Pas retenu ».
 *    3. Duels       — les travaux « Bien » sortent deux par deux ;
 *                     le perdant est éliminé, jusqu'au dernier.
 *    Le podium : le gagnant, puis les deux derniers éliminés.
 *  Chaque travail porte un NUMÉRO tiré au hasard à la première
 *  ouverture, gardé ensuite : ni pseudo ni nom à l'écran avant que
 *  Loïc ne clique « Révéler les noms du podium ».
 *
 *  OÙ VIT LE VOTE — dans le navigateur de Loïc (localStorage), pas en
 *  base : un usage ponctuel, un seul votant, aucune table à créer.
 *  Il ne contient que des identifiants techniques et des verdicts.
 *  Contrepartie : un vote commencé sur l'ordinateur ne se retrouve
 *  pas sur l'iPad.
 *
 *  EXPORTER POUR CLAUDE — un fichier HTML autonome, photos réduites
 *  incorporées, sans nom ni identifiant, avec les MÊMES numéros. Loïc
 *  le dépose dans _a-deposer/defi-s4/ ; Claude classe de son côté,
 *  sans connaître le vote, et l'on compare.
 *
 *  Sources : textes des fiches dans  progression  (domaine 'cours',
 *  clés elem-SYS-E01 … E30) ; photos dans le stockage « depots »
 *  (<compte>/snt-t0/<code>.jpg, bdd/schema/025).
 * ============================================================ */
(function () {
  'use strict';

  var SEQ = 'snt-t0';
  var NB_FICHES = 30;
  var AVANT = ['SYS-AV1', 'SYS-AV2', 'SYS-AV3'];
  var APRES = ['SYS-AP1', 'SYS-AP2', 'SYS-AP3'];
  var TABLE = 'SYS-D3';
  var CLE_VOTE = 'snt.prof.defi.';      /* + id de la classe */

  var panneau = document.getElementById('p-defi');
  var bouton = document.querySelector('nav.onglets button[data-onglet="defi"]');
  if (!panneau || !bouton || !window.ProfAPI) return;

  function $(s, r) { return (r || document).querySelector(s); }
  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }
  function code2(n) { return 'SYS-E' + (n < 10 ? '0' : '') + n; }
  function chemin(t, code) { return t.compte + '/' + SEQ + '/' + code + '.jpg'; }

  /* ---------- l'interface fixe ---------- */
  var style = el('style');
  style.textContent =
    '.df-barre{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:0 0 12px}' +
    '.df-etapes{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0 16px}' +
    '.df-etapes button{background:var(--surface-2);color:var(--ink-soft)}' +
    '.df-etapes button.actif{background:var(--link-wash);color:var(--link);border-color:var(--link);font-weight:600}' +
    '.df-carte{border:1px solid var(--line);border-radius:12px;padding:14px;margin:0 0 14px;background:var(--surface)}' +
    '.df-carte.gagnant{border:2px solid var(--ok)}' +
    '.df-tete{display:flex;gap:8px;align-items:baseline;flex-wrap:wrap;margin-bottom:10px}' +
    '.df-num{font-size:17px;font-weight:700;color:var(--ink)}' +
    '.df-info{font-size:13px;color:var(--ink-soft)}' +
    '.df-alerte{font-size:12.5px;font-weight:600;padding:2px 9px;border-radius:999px;background:var(--wait-wash);color:#7a5400}' +
    '.df-nom{font-size:14px;font-weight:600;color:var(--ok);margin-left:auto}' +
    '.df-bande{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin-bottom:12px}' +
    '.df-bloc{background:var(--surface-2);border-radius:10px;padding:8px}' +
    '.df-bloc h4{margin:0 0 6px;font-size:12.5px;text-transform:uppercase;letter-spacing:.04em;color:var(--ink-soft)}' +
    '.df-photos{display:flex;gap:6px;flex-wrap:wrap}' +
    '.df-photos .df-vide{font-size:13px;color:var(--err)}' +
    '.df-img{width:96px;height:72px;object-fit:cover;border-radius:6px;background:var(--line);cursor:zoom-in;border:0;padding:0;display:block}' +
    '.df-img img{width:100%;height:100%;object-fit:cover;border-radius:6px;display:block}' +
    '.df-fiches{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:8px;margin:0;padding:0;list-style:none}' +
    '.df-fiche{display:flex;gap:8px;align-items:flex-start;border:1px solid var(--line);border-radius:9px;padding:6px;font-size:13px}' +
    '.df-fiche .df-img{width:64px;height:52px;flex:none}' +
    '.df-fiche b{display:block;color:var(--ink)}' +
    '.df-fiche span{color:var(--ink-soft)}' +
    '.df-fiche .df-sans{width:64px;height:52px;flex:none;border-radius:6px;border:1px dashed var(--line);' +
      'display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--ink-faint)}' +
    '.df-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}' +
    '.df-actions .ok{background:var(--ok);color:#fff;border-color:var(--ok)}' +
    '.df-actions .non{color:var(--err)}' +
    '.df-duel{display:grid;grid-template-columns:1fr 1fr;gap:12px}' +
    '@media (max-width:820px){.df-duel{grid-template-columns:1fr}}' +
    '.df-podium{display:flex;gap:10px;flex-wrap:wrap;margin:6px 0 16px}' +
    '.df-marche{flex:1;min-width:150px;border-radius:12px;padding:12px;background:var(--surface-2);text-align:center}' +
    '.df-marche .r{font-size:24px}.df-marche .n{font-size:16px;font-weight:700}' +
    '.df-marche .df-nom{display:block;margin:6px 0 0}' +
    '.df-loupe{position:fixed;inset:0;background:rgba(10,14,25,.86);display:flex;align-items:center;' +
      'justify-content:center;z-index:50;padding:16px}' +
    '.df-loupe img{max-width:100%;max-height:100%;border-radius:8px}' +
    '.df-loupe button{position:absolute;top:12px;right:12px}';
  document.head.appendChild(style);

  panneau.innerHTML =
    '<div class="df-barre">' +
      '<label for="df-classe" style="margin:0">Classe</label> <select id="df-classe"></select>' +
      '<button type="button" id="df-recharger">Recharger</button>' +
      '<button type="button" id="df-annuler" hidden>↶ Annuler le dernier choix</button>' +
      '<button type="button" id="df-export">Exporter pour Claude</button>' +
      '<span id="df-etat" class="muet"></span>' +
    '</div>' +
    '<p class="muet" style="margin:0 0 6px">Le défi de la séance 4 de l’introduction&nbsp;: les travaux de la classe, ' +
      '<b>sans les noms</b>, sous un numéro tiré au hasard. Un seul groupe gagne&nbsp;: tu demandes à l’auteur ' +
      'du travail gagnant les noms de son groupe. Ton vote reste sur cet appareil.</p>' +
    '<nav class="df-etapes" id="df-etapes"></nav>' +
    '<div id="df-contenu"></div>' +
    '<div class="rangee" style="margin-top:22px"><button type="button" id="df-raz" class="non">Recommencer le vote de cette classe</button></div>';

  var selClasse = $('#df-classe', panneau), zone = $('#df-contenu', panneau);
  var etatTxt = $('#df-etat', panneau), etapes = $('#df-etapes', panneau);

  /* ---------- l'état ---------- */
  var classes = [], classe = null, travaux = [], vote = null;
  var vue = null, reveles = false, demarre = false, generation = 0;
  var urls = {};                 /* chemin → URL blob: (ou promesse) */

  function lireVote() {
    var v = null;
    try { v = JSON.parse(localStorage.getItem(CLE_VOTE + classe) || 'null'); } catch (e) {}
    if (!v || typeof v !== 'object') v = {};
    v.nums = v.nums || {}; v.prochain = v.prochain || 1;
    v.etat = v.etat || {}; v.duels = v.duels || []; v.histo = v.histo || [];
    return v;
  }
  function garderVote() {
    try { localStorage.setItem(CLE_VOTE + classe, JSON.stringify(vote)); } catch (e) {}
  }

  /* ---------- chargement ---------- */
  function parLots(liste, n, f) {
    var res = new Array(liste.length), i = 0;
    function suivant() {
      if (i >= liste.length) return Promise.resolve();
      var k = i++;
      return Promise.resolve(f(liste[k])).then(function (r) { res[k] = r; return suivant(); });
    }
    var w = []; for (var j = 0; j < Math.min(n, liste.length); j++) w.push(suivant());
    return Promise.all(w).then(function () { return res; });
  }

  function demarrer() {
    demarre = true;
    etatTxt.textContent = 'Chargement…';
    ProfAPI.lire('classes?select=id,libelle,espace&order=code.asc').then(function (l) {
      classes = (l || []).filter(function (c) { return (c.espace || 'snt') === 'snt'; });
      selClasse.innerHTML = '';
      classes.forEach(function (c) {
        var o = el('option', null, c.libelle); o.value = c.id; selClasse.appendChild(o);
      });
      classe = classes.length ? classes[0].id : null;
      charger();
    }).catch(erreur);
  }

  function erreur(e) { etatTxt.textContent = 'Lecture impossible : ' + ((e && e.message) || e); }

  function charger() {
    Object.keys(urls).forEach(function (k) { if (typeof urls[k] === 'string') URL.revokeObjectURL(urls[k]); });
    urls = {}; travaux = []; reveles = false; vue = null;
    var gen = ++generation;
    if (!classe) { zone.innerHTML = '<div class="vide">Aucune classe de SNT.</div>'; etatTxt.textContent = ''; return; }
    vote = lireVote();
    etatTxt.textContent = 'Chargement des travaux…';
    zone.innerHTML = '';
    ProfAPI.lire('eleves_classes?select=eleves(id,pseudo,auth_id)&classe_id=eq.' + encodeURIComponent(classe))
      .then(function (l) {
        var eleves = (l || []).map(function (x) { return x.eleves; }).filter(Boolean);
        if (!eleves.length) return [eleves, [], []];
        var ids = eleves.map(function (e) { return e.id; }).join(',');
        return Promise.all([
          eleves,
          ProfAPI.lire('progression?select=eleve_id,cle,valeur&domaine=eq.cours&cle=like.elem-SYS-E*&eleve_id=in.(' + ids + ')'),
          parLots(eleves, 6, function (e) {
            return e.auth_id ? ProfAPI.listerDepots(e.auth_id + '/' + SEQ).catch(function () { return []; }) : [];
          })
        ]);
      })
      .then(function (r) {
        if (gen !== generation) return;
        construire(r[0], r[1] || [], r[2] || []);
        etatTxt.textContent = '';
        rendre();
      })
      .catch(function (e) { if (gen === generation) erreur(e); });
  }

  function construire(eleves, progs, listes) {
    var textes = {};
    progs.forEach(function (p) { textes[p.eleve_id + '|' + p.cle.slice(5)] = p.valeur || {}; });
    eleves.forEach(function (e, k) {
      var fichiers = {};
      (listes[k] || []).forEach(function (n) { fichiers[String(n).split('/').pop().replace(/\.jpg$/, '')] = true; });
      var t = { id: e.id, pseudo: e.pseudo, compte: e.auth_id, fiches: [], av: [], ap: [], table: null, complets: 0 };
      for (var i = 1; i <= NB_FICHES; i++) {
        var c = code2(i), v = textes[e.id + '|' + c] || {};
        var titre = String(v.titre || '').trim(), desc = String(v.desc || '').trim();
        var photo = fichiers[c] ? chemin(t, c) : null;
        if (!titre && !desc && !photo) continue;
        t.fiches.push({ n: i, titre: titre, desc: desc, photo: photo });
        if (photo && titre.length > 1) t.complets++;
      }
      AVANT.forEach(function (c) { if (fichiers[c]) t.av.push(chemin(t, c)); });
      APRES.forEach(function (c) { if (fichiers[c]) t.ap.push(chemin(t, c)); });
      if (fichiers[TABLE]) t.table = chemin(t, TABLE);
      if (!t.fiches.length && !t.av.length && !t.ap.length && !t.table) return;   /* rien rendu */
      t.douteux = t.complets < 3 || !t.av.length || !t.ap.length;
      travaux.push(t);
    });
    /* numéros : tirés au hasard pour les nouveaux venus, gardés ensuite */
    var sans = travaux.filter(function (t) { return !vote.nums[t.id]; });
    for (var i = sans.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), x = sans[i]; sans[i] = sans[j]; sans[j] = x;
    }
    sans.forEach(function (t) { vote.nums[t.id] = vote.prochain++; });
    if (sans.length) garderVote();
    travaux.forEach(function (t) { t.num = vote.nums[t.id]; });
    travaux.sort(function (a, b) { return a.num - b.num; });
    travaux.nbEleves = eleves.length;
  }

  /* ---------- le vote ---------- */
  function etatDe(t) { return vote.etat[t.id] || null; }
  function perdants() {
    var p = {}; vote.duels.forEach(function (d) { p[d.p] = true; }); return p;
  }
  function enLice() {
    var p = perdants();
    return travaux.filter(function (t) { return etatDe(t) === 'bien' && !p[t.id]; });
  }
  function aTrier()  { return travaux.filter(function (t) { return !etatDe(t); }); }
  function gardes()  { return travaux.filter(function (t) { return etatDe(t) === 'garde'; }); }
  function ecartes() {
    var p = perdants();
    return travaux.filter(function (t) {
      var e = etatDe(t); return e === 'incomplet' || e === 'non' || (e === 'bien' && p[t.id]);
    });
  }
  function poser(t, e) {
    vote.histo.push({ type: 'etat', id: t.id, avant: etatDe(t) });
    if (e) vote.etat[t.id] = e; else delete vote.etat[t.id];
    garderVote(); rendre();
  }
  function duel(g, p) {
    vote.duels.push({ g: g.id, p: p.id });
    vote.histo.push({ type: 'duel' });
    garderVote(); rendre();
  }
  function annuler() {
    var h = vote.histo.pop(); if (!h) return;
    if (h.type === 'duel') vote.duels.pop();
    else if (h.type === 'remise') { vote.etat[h.id] = h.avant; vote.duels = h.duels; }
    else if (h.avant) vote.etat[h.id] = h.avant; else delete vote.etat[h.id];
    vue = null;                     /* on revient là où le choix a été défait */
    garderVote(); rendre();
  }
  /* un travail écarté revient au premier tri : il sort aussi des duels */
  function remettre(t) {
    vote.histo.push({ type: 'remise', id: t.id, avant: etatDe(t), duels: vote.duels.slice() });
    vote.duels = vote.duels.filter(function (d) { return d.p !== t.id; });
    vote.etat[t.id] = 'garde';
    garderVote(); rendre();
  }

  /* la paire suivante : ceux qui ont le moins combattu, puis par numéro —
     déterministe, pour qu'un rechargement remontre le même duel */
  function paire() {
    var l = enLice(), nb = {};
    vote.duels.forEach(function (d) { nb[d.g] = (nb[d.g] || 0) + 1; nb[d.p] = (nb[d.p] || 0) + 1; });
    l.sort(function (a, b) { return ((nb[a.id] || 0) - (nb[b.id] || 0)) || (a.num - b.num); });
    return l.slice(0, 2);
  }
  function podium() {
    var l = enLice(); if (l.length !== 1) return null;
    var par = {}; travaux.forEach(function (t) { par[t.id] = t; });
    var pod = [l[0]];
    for (var i = vote.duels.length - 1; i >= 0 && pod.length < 3; i--) {
      var t = par[vote.duels[i].p];
      if (t && etatDe(t) === 'bien') pod.push(t);
    }
    return pod;
  }

  /* ---------- rendu ---------- */
  function phaseCourante() {
    if (aTrier().length) return 'ecremage';
    if (gardes().length) return 'tri';
    return 'duels';
  }

  function rendre() {
    $('#df-annuler', panneau).hidden = !vote || !vote.histo.length;
    if (!travaux.length) {
      etapes.innerHTML = '';
      zone.innerHTML = '';
      var v = el('div', 'vide');
      v.appendChild(el('div', 'g', 'Aucun travail déposé pour le défi dans cette classe.'));
      v.appendChild(document.createTextNode((travaux.nbEleves || 0) + ' élève(s) inscrit(s). Les travaux apparaissent dès qu’un élève remplit une fiche ou dépose une photo en séance 4.'));
      zone.appendChild(v);
      return;
    }
    /* une étape vidée passe la main à la suivante */
    if (!vue || (vue === 'ecremage' && !aTrier().length) || (vue === 'tri' && !gardes().length)) vue = phaseCourante();
    var defs = [
      ['ecremage', '1 · Écrémage', aTrier().length],
      ['tri', '2 · Premier tri', gardes().length],
      ['duels', '3 · Duels', enLice().length],
      ['ecartes', 'Écartés', ecartes().length]
    ];
    etapes.innerHTML = '';
    defs.forEach(function (d) {
      var b = el('button', vue === d[0] ? 'actif' : '', d[1] + ' (' + d[2] + ')');
      b.type = 'button';
      b.addEventListener('click', function () { vue = d[0]; rendre(); });
      etapes.appendChild(b);
    });
    zone.innerHTML = '';
    if (vue === 'ecremage') rendreListe(aTrier(),
      'Tout est trié. Passe au premier tri.',
      'Élimine les travaux incomplets. Le site signale ceux qui ont moins de 3 fiches complètes (photo et nom), ou pas de photo d’avant ou d’après — à toi de juger.',
      function (t, a) {
        bout(a, 'Incomplet', 'non', function () { poser(t, 'incomplet'); });
        bout(a, 'Garder', 'ok', function () { poser(t, 'garde'); });
      });
    else if (vue === 'tri') rendreListe(gardes(),
      aTrier().length ? 'Rien à trier ici pour l’instant : finis d’abord l’écrémage.' : 'Tout est trié. Passe aux duels.',
      'Parmi les travaux complets : lesquels sont bons ? Seuls les « Bien » vont en duel.',
      function (t, a) {
        bout(a, 'Pas retenu', 'non', function () { poser(t, 'non'); });
        bout(a, 'Bien ✓', 'ok', function () { poser(t, 'bien'); });
      });
    else if (vue === 'ecartes') rendreListe(ecartes(), 'Aucun travail écarté.',
      'Les travaux éliminés, quelle qu’en soit l’étape. « Remettre en jeu » les renvoie au premier tri.',
      function (t, a) {
        var e = etatDe(t);
        a.insertBefore(el('span', 'df-info', e === 'incomplet' ? 'Écarté : incomplet' : e === 'non' ? 'Écarté : pas retenu' : 'Écarté : duel perdu'), a.firstChild);
        bout(a, 'Remettre en jeu', '', function () { remettre(t); });
      });
    else rendreDuels();
  }

  function bout(parent, txt, cls, f) {
    var b = el('button', cls, txt); b.type = 'button'; b.addEventListener('click', f); parent.appendChild(b); return b;
  }

  function rendreListe(liste, quandVide, aide, actions) {
    zone.appendChild(el('p', 'muet', aide));
    if (!liste.length) { zone.appendChild(el('div', 'vide', quandVide)); return; }
    liste.forEach(function (t) { zone.appendChild(carte(t, actions)); });
    observer();
  }

  function rendreDuels() {
    if (aTrier().length || gardes().length) {
      zone.appendChild(el('p', 'muet', 'Les duels s’ouvrent quand l’écrémage et le premier tri sont finis (' +
        (aTrier().length + gardes().length) + ' travail(aux) à trier).'));
      return;
    }
    var l = enLice();
    if (!l.length) { zone.appendChild(el('div', 'vide', 'Aucun travail « Bien » : rien à départager.')); return; }
    var pod = podium();
    if (pod) { rendrePodium(pod); return; }
    var p = paire();
    zone.appendChild(el('p', 'muet', l.length + ' travaux encore en lice. Choisis le meilleur des deux : l’autre est éliminé.'));
    var d = el('div', 'df-duel');
    p.forEach(function (t, k) {
      d.appendChild(carte(t, function (u, a) {
        bout(a, '🏆 Celui-ci est meilleur', 'ok', function () { duel(t, p[1 - k]); });
      }));
    });
    zone.appendChild(d);
    observer();
  }

  function rendrePodium(pod) {
    zone.appendChild(el('h3', null, 'Le podium'));
    var p = el('div', 'df-podium');
    ['🥇', '🥈', '🥉'].forEach(function (m, k) {
      var t = pod[k]; if (!t) return;
      var c = el('div', 'df-marche');
      c.appendChild(el('div', 'r', m));
      c.appendChild(el('div', 'n', 'Travail n° ' + t.num));
      if (reveles) c.appendChild(el('span', 'df-nom', nomDe(t)));
      p.appendChild(c);
    });
    zone.appendChild(p);
    var a = el('div', 'df-actions');
    if (!reveles) bout(a, 'Révéler les noms du podium', 'ok', function () { reveles = true; rendre(); });
    else if (!ProfAPI.nomsCharges()) a.appendChild(el('span', 'df-info', 'Ce sont des identifiants : charge la table des noms dans Réglages pour voir les vrais noms.'));
    zone.appendChild(a);
    zone.appendChild(el('p', 'muet', 'L’auteur du travail gagnant te donne les noms de son groupe : chacun reçoit la récompense annoncée.'));
    pod.forEach(function (t, k) {
      var c = carte(t, null); if (k === 0) c.classList.add('gagnant'); zone.appendChild(c);
    });
    observer();
  }

  function nomDe(t) { return ProfAPI.nomDe(t.pseudo); }

  function carte(t, actions) {
    var c = el('article', 'df-carte');
    var h = el('div', 'df-tete');
    h.appendChild(el('span', 'df-num', 'Travail n° ' + t.num));
    h.appendChild(el('span', 'df-info', t.complets + ' fiche' + (t.complets > 1 ? 's' : '') + ' complète' + (t.complets > 1 ? 's' : '') +
      ' sur ' + t.fiches.length + ' · ' + t.av.length + ' photo(s) avant · ' + t.ap.length + ' après'));
    if (t.douteux) h.appendChild(el('span', 'df-alerte', 'incomplet ?'));
    c.appendChild(h);

    var b = el('div', 'df-bande');
    b.appendChild(bloc('Avant le démontage', t.av, 'pas de photo d’avant'));
    b.appendChild(bloc('La table, machine démontée', t.table ? [t.table] : [], 'pas de photo de la table'));
    b.appendChild(bloc('Après le remontage', t.ap, 'pas de photo d’après'));
    c.appendChild(b);

    var ul = el('ul', 'df-fiches');
    t.fiches.forEach(function (f) {
      var li = el('li', 'df-fiche');
      if (f.photo) li.appendChild(vignette(f.photo, 'Élément ' + f.n));
      else li.appendChild(el('span', 'df-sans', 'sans photo'));
      var txt = el('div');
      txt.appendChild(el('b', null, f.titre || '(sans nom)'));
      txt.appendChild(el('span', null, f.desc || '—'));
      li.appendChild(txt);
      ul.appendChild(li);
    });
    if (!t.fiches.length) ul.appendChild(el('li', 'df-info', 'Aucune fiche d’élément.'));
    c.appendChild(ul);

    if (actions) { var a = el('div', 'df-actions'); actions(t, a); c.appendChild(a); }
    return c;
  }

  function bloc(titre, chemins, vide) {
    var d = el('div', 'df-bloc');
    d.appendChild(el('h4', null, titre));
    var p = el('div', 'df-photos');
    if (!chemins.length) p.appendChild(el('span', 'df-vide', vide));
    chemins.forEach(function (ch, k) { p.appendChild(vignette(ch, titre + ' ' + (k + 1))); });
    d.appendChild(p);
    return d;
  }

  /* les photos se chargent à l'approche de l'écran : une classe entière,
     c'est plusieurs centaines de fichiers */
  function vignette(ch, alt) {
    var b = el('button', 'df-img'); b.type = 'button';
    b.setAttribute('aria-label', 'Agrandir : ' + alt);
    b.dataset.chemin = ch;
    b.addEventListener('click', function () { loupe(ch); });
    return b;
  }
  function url(ch) {
    if (urls[ch]) return Promise.resolve(urls[ch]);
    var p = ProfAPI.lireDepot(ch).then(function (blob) {
      if (!blob) { delete urls[ch]; return null; }
      urls[ch] = URL.createObjectURL(blob); return urls[ch];
    });
    urls[ch] = p;
    return p;
  }
  var io = null;
  function observer() {
    if (io) io.disconnect();
    var bs = zone.querySelectorAll('.df-img[data-chemin]');
    function charge(b) {
      Promise.resolve(url(b.dataset.chemin)).then(function (u) {
        if (!u || b.firstChild) return;
        var im = el('img'); im.src = u; im.alt = ''; b.appendChild(im);
      });
    }
    if (!('IntersectionObserver' in window)) { Array.prototype.forEach.call(bs, charge); return; }
    io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); charge(e.target); } });
    }, { rootMargin: '400px' });
    Array.prototype.forEach.call(bs, function (b) { io.observe(b); });
  }
  function loupe(ch) {
    var o = el('div', 'df-loupe'); o.setAttribute('role', 'dialog'); o.setAttribute('aria-label', 'Photo agrandie');
    var f = el('button', null, 'Fermer ✕'); f.type = 'button';
    var retour = document.activeElement;
    function fermer() { o.remove(); document.removeEventListener('keydown', clavier); if (retour) retour.focus(); }
    function clavier(e) { if (e.key === 'Escape') fermer(); }
    o.addEventListener('click', function (e) { if (e.target === o || e.target === f) fermer(); });
    document.addEventListener('keydown', clavier);
    o.appendChild(f);
    Promise.resolve(url(ch)).then(function (u) { if (u) { var im = el('img'); im.src = u; im.alt = 'Photo agrandie'; o.appendChild(im); } });
    document.body.appendChild(o);
    f.focus();
  }

  /* ---------- exporter pour Claude ---------- */
  function echapper(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  /* réduite à 640 px : assez pour juger, un fichier qui reste maniable */
  function reduite(ch) {
    return ProfAPI.lireDepot(ch).then(function (blob) {
      if (!blob) return '';
      return new Promise(function (ok) {
        var u = URL.createObjectURL(blob), im = new Image();
        im.onload = function () {
          var e = Math.min(1, 640 / Math.max(im.width, im.height));
          var c = document.createElement('canvas');
          c.width = Math.round(im.width * e); c.height = Math.round(im.height * e);
          c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
          URL.revokeObjectURL(u);
          try { ok(c.toDataURL('image/jpeg', 0.72)); } catch (err) { ok(''); }
        };
        im.onerror = function () { URL.revokeObjectURL(u); ok(''); };
        im.src = u;
      });
    }).catch(function () { return ''; });
  }
  function exporter() {
    var liste = travaux.filter(function (t) { return etatDe(t) !== 'incomplet'; });
    if (!liste.length) { etatTxt.textContent = 'Rien à exporter.'; return; }
    var chemins = [];
    liste.forEach(function (t) {
      chemins = chemins.concat(t.av, t.table ? [t.table] : [], t.ap,
        t.fiches.filter(function (f) { return f.photo; }).map(function (f) { return f.photo; }));
    });
    var faits = 0, data = {}, btn = $('#df-export', panneau);
    btn.disabled = true;
    etatTxt.textContent = 'Export : 0 / ' + chemins.length + ' photos…';
    parLots(chemins, 6, function (ch) {
      return reduite(ch).then(function (d) {
        data[ch] = d; faits++;
        etatTxt.textContent = 'Export : ' + faits + ' / ' + chemins.length + ' photos…';
      });
    }).then(function () {
      var cl = classes.find(function (c) { return c.id === classe; });
      var lib = cl ? cl.libelle : '';
      var jour = new Date().toISOString().slice(0, 10);
      function imgs(l) {
        return l.length ? l.map(function (ch) { return data[ch] ? '<img src="' + data[ch] + '" alt="">' : '<em>(photo illisible)</em>'; }).join('')
                        : '<em>aucune</em>';
      }
      var h = '<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Défi S4 — ' + echapper(lib) + ' — ' + jour + '</title>' +
        '<style>body{font-family:system-ui,sans-serif;max-width:1100px;margin:20px auto;padding:0 16px;color:#161f33}' +
        'section{border:1px solid #ccc;border-radius:10px;padding:12px;margin:16px 0}img{max-width:300px;max-height:300px;margin:4px;vertical-align:top}' +
        'table{border-collapse:collapse;width:100%}td,th{border:1px solid #ddd;padding:6px;vertical-align:top;text-align:left}td img{max-width:200px}</style></head><body>' +
        '<h1>Défi S4 — ' + echapper(lib) + '</h1>' +
        '<p>Export anonyme du ' + jour + ' pour Claude. ' + liste.length + ' travaux ; aucun nom ni identifiant, les numéros sont ceux de l’écran du professeur. ' +
        'Les travaux écartés comme incomplets ne figurent pas.</p>' +
        '<p><b>Critères annoncés aux élèves :</b> nombre d’éléments correctement nommés, justesse de « ce qu’il fait », photos nettes et bien cadrées, ' +
        'machine correctement remontée (photos d’avant et d’après).</p>';
      liste.forEach(function (t) {
        h += '<section id="travail-' + t.num + '"><h2>Travail n° ' + t.num + '</h2>' +
          '<p>' + t.complets + ' fiche(s) complète(s) sur ' + t.fiches.length + '</p>' +
          '<h3>Avant le démontage</h3>' + imgs(t.av) +
          '<h3>La table, machine démontée</h3>' + imgs(t.table ? [t.table] : []) +
          '<h3>Après le remontage</h3>' + imgs(t.ap) +
          '<h3>Fiches d’élément</h3><table><tr><th>#</th><th>Photo</th><th>Nom</th><th>Ce qu’il fait</th></tr>' +
          t.fiches.map(function (f) {
            return '<tr><td>' + f.n + '</td><td>' + (f.photo ? imgs([f.photo]) : '<em>sans photo</em>') + '</td><td>' +
              echapper(f.titre || '(sans nom)') + '</td><td>' + echapper(f.desc || '—') + '</td></tr>';
          }).join('') + '</table></section>';
      });
      h += '</body></html>';
      var a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([h], { type: 'text/html' }));
      a.download = 'defi-s4-' + lib.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + jour + '.html';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 10000);
      etatTxt.textContent = 'Exporté : ' + liste.length + ' travaux. Dépose le fichier dans _a-deposer/defi-s4/.';
    }).catch(erreur).then(function () { btn.disabled = false; });
  }

  /* ---------- branchements ---------- */
  bouton.addEventListener('click', function () { if (!demarre) demarrer(); });
  selClasse.addEventListener('change', function () { classe = selClasse.value; charger(); });
  $('#df-recharger', panneau).addEventListener('click', charger);
  $('#df-annuler', panneau).addEventListener('click', annuler);
  $('#df-export', panneau).addEventListener('click', exporter);
  $('#df-raz', panneau).addEventListener('click', function () {
    if (!classe || !confirm('Effacer tout le vote de cette classe ? Les numéros des travaux restent les mêmes.')) return;
    vote.etat = {}; vote.duels = []; vote.histo = [];
    garderVote(); vue = null; reveles = false; rendre();
  });
})();
