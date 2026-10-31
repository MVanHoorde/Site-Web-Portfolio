/* ============================================================
 *  padago-eleve.js — le mode élève
 *  ------------------------------------------------------------
 *  Statuts d'une colonne (prêts pour une v2 avec serveur) :
 *    verrouillee | ouverte | deposee | a_reprendre | validee
 *  Une colonne est FRANCHIE quand :
 *    libre → dès qu'elle est ouverte ; code → validee ;
 *    dépôt → deposee ou validee ; validation prof → validee.
 *  La colonne suivante s'ouvre quand toutes celles d'avant sont
 *  franchies. Les coffres ne bloquent pas : ils récompensent.
 *
 *  🔴 RIEN NE PART SUR INTERNET depuis cette page, à part la
 *  lecture du pad. Progression : localStorage (une clé par pad et
 *  par élève). Photos déposées : IndexedDB, sur la tablette.
 * ============================================================ */
(function () {
  'use strict';
  var P = window.Padago, esc = P.esc;
  var app = document.getElementById('app');
  var q = new URLSearchParams(location.search);
  var APERCU = q.get('apercu') === '1';

  var pad = null;      // version publiée (empreintes)
  var eleve = '';      // « Lina B. »
  var prog = null;     // progression de cet élève sur ce pad
  var PHOTOS = {};     // cid → URL d'objet, le temps de la page

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function toast(m) {
    var t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = m;
    document.body.appendChild(t); setTimeout(function () { t.remove(); }, 2800);
  }
  var MOUVEMENT = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
   *  CHARGEMENT DU PAD
   * ============================================================ */
  function charger() {
    if (APERCU) {
      var brut = null; try { brut = localStorage.getItem('padago.apercu'); } catch (e) { /* rien */ }
      if (!brut) return echec('Aperçu introuvable : relance « Tester comme un élève » depuis l\'éditeur.');
      return P.publier(JSON.parse(brut));
    }
    if (q.get('f')) {
      var nom = q.get('f').replace(/[^\w-]/g, '');
      return fetch('pads/' + nom + '.json', { cache: 'no-cache' }).then(function (r) {
        if (!r.ok) throw new Error('introuvable'); return r.json();
      }).then(P.publier);
    }
    var slug = (q.get('p') || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!slug) return Promise.reject(new Error('Lien incomplet : il manque l\'identifiant du pad.'));
    var cle = 'padago.cache.' + slug;
    return P.Api.lirePublie(slug).then(function (p) {
      if (!p) throw new Error('Ce pad n\'existe pas (ou plus). Vérifie le lien avec ta professeure.');
      try { localStorage.setItem(cle, JSON.stringify(p)); } catch (e) { /* rien */ }
      return p;
    }).catch(function (e) {
      // hors ligne : la dernière version lue sur cette tablette
      var c = null; try { c = JSON.parse(localStorage.getItem(cle) || 'null'); } catch (x) { /* rien */ }
      if (c && /Failed to fetch|NetworkError|Load failed/i.test(e.message)) { toast('Hors connexion : dernière version enregistrée sur la tablette.'); return c; }
      throw e;
    });
  }
  function echec(m) {
    app.innerHTML = '<div class="carte-form"><h1>Oups</h1><p>' + esc(m) + '</p></div>';
    return Promise.reject(new Error('arrêt'));
  }

  /* ============================================================
   *  PROGRESSION LOCALE
   * ============================================================ */
  function cleProg() { return 'padago.prog.' + pad.id + '.' + P.normaliser(eleve).replace(/[^a-z0-9]/g, ''); }
  function progVierge() { return { v: 1, eleve: eleve, colonnes: {}, depots: {}, coffres: {}, indices: {}, consommes: {}, ressentis: {} }; }
  function lireProg() {
    if (APERCU) return progVierge();
    try { var p = JSON.parse(localStorage.getItem(cleProg()) || 'null'); if (p && p.v === 1) return p; } catch (e) { /* rien */ }
    return progVierge();
  }
  function ecrireProg() {
    if (APERCU) return;
    try { localStorage.setItem(cleProg(), JSON.stringify(prog)); localStorage.setItem('padago.eleve', eleve); }
    catch (e) { toast('⚠ La tablette n\'a plus de place : ta progression n\'est pas gardée.'); }
  }

  /* --- photos : IndexedDB --- */
  var bdd = null;
  function ouvrirBdd() {
    if (bdd) return bdd;
    bdd = new Promise(function (ok, ko) {
      if (!window.indexedDB) return ko(new Error('pas d\'IndexedDB'));
      var r = indexedDB.open('padago', 1);
      r.onupgradeneeded = function () { r.result.createObjectStore('photos'); };
      r.onsuccess = function () { ok(r.result); }; r.onerror = function () { ko(r.error); };
    });
    return bdd;
  }
  function clePhoto(cid) { return pad.id + '|' + P.normaliser(eleve) + '|' + cid; }
  function garderPhoto(cid, blob) {
    if (APERCU) return Promise.resolve();
    return ouvrirBdd().then(function (db) {
      return new Promise(function (ok, ko) { var t = db.transaction('photos', 'readwrite'); t.objectStore('photos').put(blob, clePhoto(cid)); t.oncomplete = ok; t.onerror = function () { ko(t.error); }; });
    });
  }
  function lirePhoto(cid) {
    return ouvrirBdd().then(function (db) {
      return new Promise(function (ok) { var r = db.transaction('photos').objectStore('photos').get(clePhoto(cid)); r.onsuccess = function () { ok(r.result || null); }; r.onerror = function () { ok(null); }; });
    }).catch(function () { return null; });
  }
  /* Une photo d'ardoise n'a pas besoin de 12 mégapixels : 1280 px, JPEG. */
  function compresser(fichier) {
    return new Promise(function (ok, ko) {
      var img = new Image(), url = URL.createObjectURL(fichier);
      img.onload = function () {
        var s = Math.min(1, 1280 / Math.max(img.width, img.height));
        var c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
        c.toBlob(function (b) { b ? ok(b) : ko(new Error('photo')); }, 'image/jpeg', 0.72);
      };
      img.onerror = function () { ko(new Error('photo illisible')); };
      img.src = url;
    });
  }

  /* ============================================================
   *  RÈGLES DU PARCOURS
   * ============================================================ */
  function cols() { return pad.colonnes || []; }
  function principales() { return cols().filter(function (c) { return !c.secrete; }); }
  function statut(c) { return prog.colonnes[c.id] || 'ouverte'; }
  function franchie(c) {
    var t = (c.cadenas || {}).type || 'libre', s = statut(c);
    if (t === 'libre') return true;
    if (t === 'depot') return s === 'deposee' || s === 'validee';
    return s === 'validee';
  }
  function accessible(c) {
    if (c.secrete) return toutFini();
    var L = principales(), i = L.indexOf(c);
    for (var j = 0; j < i; j++) if (!franchie(L[j])) return false;
    return true;
  }
  function visible(c) { return !c.secrete || (pad.options && pad.options.salleSecrete && toutFini()); }
  function toutFini() { return principales().every(franchie); }
  function lesCoffres() { var l = []; cols().forEach(function (c) { if (c.coffre) l.push(c.coffre); }); return l; }
  function medaille(id) { return (pad.medailles || []).filter(function (m) { return m.id === id; })[0]; }
  function coffreOuvert(f) { return !!prog.coffres[f.id]; }
  function finalPret(f) {
    return lesCoffres().every(function (x) { return x === f || x.final || !x.medaille || coffreOuvert(x); });
  }

  /* La médaille gagnée : sa couleur, plafonnée par les indices
     payants vus depuis le coffre précédent. */
  function niveau(f, colonneDuCoffre) {
    var m = medaille(f.medaille); if (!m) return 'aucune';
    var base = m.couleur; if (!P.RANG[base]) return base;   // couleur libre : pas de niveau
    var plafond = 3, L = cols(), fin = L.indexOf(colonneDuCoffre);
    L.slice(0, fin + 1).forEach(function (c) {
      c.cartes.forEach(function (k) {
        var cout = prog.indices[k.id];
        if (cout && !prog.consommes[k.id]) plafond = Math.min(plafond, P.RANG[cout] || 3);
      });
    });
    var r = Math.min(P.RANG[base], plafond);
    return ['', 'bronze', 'argent', 'or'][r];
  }
  function consommerIndices(colonneDuCoffre) {
    var L = cols(), fin = L.indexOf(colonneDuCoffre);
    L.slice(0, fin + 1).forEach(function (c) { c.cartes.forEach(function (k) { if (prog.indices[k.id] !== undefined) prog.consommes[k.id] = true; }); });
  }

  /* ============================================================
   *  CODE DE REPRISE
   *  2 bits par colonne (rien, déposée, à reprendre, validée), 3 bits
   *  par coffre (fermé, bronze, argent, or, ouvert), une somme de
   *  contrôle liée au pad. Exemple : K7QM-2XAB-9F
   * ============================================================ */
  var B32 = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  var ST = ['ouverte', 'deposee', 'a_reprendre', 'validee'];
  var NV = ['', 'bronze', 'argent', 'or', 'ouvert'];
  function fnv(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h; }
  function codeReprise() {
    var bits = '';
    cols().forEach(function (c) { bits += ('0' + Math.max(0, ST.indexOf(statut(c))).toString(2)).slice(-2); });
    lesCoffres().forEach(function (f) {
      var v = prog.coffres[f.id], n = !v ? 0 : (NV.indexOf(v) > 0 ? NV.indexOf(v) : 4);
      bits += ('00' + n.toString(2)).slice(-3);
    });
    while (bits.length % 5) bits += '0';
    var corps = ''; for (var i = 0; i < bits.length; i += 5) corps += B32[parseInt(bits.substr(i, 5), 2)];
    var h = fnv(pad.id + '|' + corps);
    var code = corps + B32[h & 31] + B32[(h >>> 5) & 31];
    return code.replace(/(.{4})(?=.)/g, '$1-');
  }
  function appliquerReprise(saisi) {
    var s = String(saisi || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (s.length < 3) return false;
    var corps = s.slice(0, -2), ctrl = s.slice(-2), h = fnv(pad.id + '|' + corps);
    if (ctrl !== B32[h & 31] + B32[(h >>> 5) & 31]) return false;
    var bits = '';
    for (var i = 0; i < corps.length; i++) { var v = B32.indexOf(corps[i]); if (v < 0) return false; bits += ('0000' + v.toString(2)).slice(-5); }
    var p = progVierge(), k = 0;
    cols().forEach(function (c) { var n = parseInt(bits.substr(k, 2), 2); k += 2; if (n) p.colonnes[c.id] = ST[n]; });
    lesCoffres().forEach(function (f) { var n = parseInt(bits.substr(k, 3), 2); k += 3; if (n) p.coffres[f.id] = NV[n]; });
    // les dépôts ne voyagent pas (ils restent sur l'ancienne tablette) : on les note faits
    cols().forEach(function (c) { if (p.colonnes[c.id] && p.colonnes[c.id] !== 'ouverte') p.depots[c.id] = { texte: '', photo: false, date: new Date().toISOString(), repris: true }; });
    prog = p; ecrireProg();
    return true;
  }

  /* ============================================================
   *  ACCUEIL : LE PRÉNOM
   * ============================================================ */
  function accueil() {
    var connu = ''; try { connu = localStorage.getItem('padago.eleve') || ''; } catch (e) { /* rien */ }
    if (APERCU) { eleve = 'Aperçu'; prog = progVierge(); return dessiner(true); }
    if (connu) { eleve = connu; prog = lireProg(); return dessiner(true); }
    demanderPrenom();
  }
  function demanderPrenom(depuisVitrine) {
    app.innerHTML = '<div class="carte-form"><p style="font-size:2.4rem;margin:0" aria-hidden="true">🗝</p><h1>' + esc(pad.titre) + '</h1>'
      + '<p>Bienvenue&nbsp;! Écris ton <b>prénom</b> et l\'<b>initiale de ton nom</b>&nbsp;: ta progression sera gardée sur cette tablette.</p>'
      + '<form id="f"><label class="champ"><span>Prénom et initiale</span><input type="text" id="prenom" placeholder="Ex. : Lina B." autocomplete="off" maxlength="40" required></label>'
      + '<button class="btn primaire" type="submit" style="width:100%">C\'est parti →</button></form>'
      + '<details style="margin-top:1.2rem"><summary>J\'ai déjà commencé sur une autre tablette</summary>'
      + '<p class="muet">Écris ton prénom ci-dessus, puis ton <b>code de reprise</b> (il est dans ta vitrine 🏅 sur l\'autre tablette).</p>'
      + '<label class="champ"><span>Code de reprise</span><input type="text" id="reprise" autocomplete="off" autocapitalize="characters" placeholder="XXXX-XXXX-XX"></label></details>'
      + '<p class="muet" style="font-size:.82rem;margin-top:1rem">🔒 Rien n\'est envoyé sur Internet&nbsp;: ton prénom et ton travail restent sur cette tablette.</p></div>';
    $('#prenom').focus();
    $('#f').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var v = $('#prenom').value.trim().replace(/\s+/g, ' ');
      if (v.length < 2) return toast('Écris ton prénom.');
      eleve = v; prog = lireProg();
      var r = $('#reprise').value.trim();
      if (r && !appliquerReprise(r)) { toast('Ce code de reprise ne correspond pas à ce pad.'); return; }
      ecrireProg(); dessiner(true);
    });
  }

  /* ============================================================
   *  AFFICHAGE
   * ============================================================ */
  var ICO = { libre: '🔓', code: '🔢', depot: '📥', validation: '🙋' };
  function nbMedailles() { return lesCoffres().filter(function (f) { return coffreOuvert(f) && medaille(f.medaille); }).length; }
  var EDITION = {};   // cid → vrai : l'élève retouche un dépôt déjà fait (le statut ne bouge pas)

  function dessiner(premierAffichage) {
    var sx = window.scrollX, sy = window.scrollY, tab = $('#el-tableau'), sl = tab ? tab.scrollLeft : 0;
    var ctx = { coffres: {}, indices: !!(pad.options && pad.options.indices), indicesVus: {} };
    lesCoffres().forEach(function (f) { ctx.coffres[f.id] = f.titre || 'le coffre'; });
    Object.keys(prog.indices).forEach(function (k) { ctx.indicesVus[k] = true; });
    var vis = cols().filter(visible);
    var ici = vis.filter(function (c) { return accessible(c) && !franchie(c); })[0];

    var h = (APERCU ? '<div class="apercu-bandeau">👁 Aperçu élève — rien n\'est enregistré. Ferme l\'onglet pour revenir à l\'éditeur.</div>' : '')
      + '<header class="el-tete"><h1>' + esc(pad.titre) + '</h1><span class="qui">' + esc(eleve) + '</span>'
      + '<button class="btn btn-vitrine" type="button" id="vitrine">🏅 Ma vitrine' + (nbMedailles() ? '<span class="nb">' + nbMedailles() + '</span>' : '') + '</button></header>';
    if (pad.options && pad.options.carteParcours !== false) {
      h += '<nav class="parcours" aria-label="Carte du parcours">' + vis.map(function (c, i) {
        var cl = franchie(c) && accessible(c) ? 'fait' : accessible(c) ? 'ici' : 'ferme';
        var ico = c.secrete ? '✨' : cl === 'fait' ? '✓' : cl === 'ici' ? String(i + 1) : '🔒';
        return (i ? '<span class="trait' + (cl === 'fait' || (cl === 'ici' && i) ? ' fait' : '') + '"></span>' : '')
          + '<button type="button" class="' + cl + '" data-aller="' + esc(c.id) + '" aria-label="' + esc(c.titre) + '">' + ico + '</button>';
      }).join('') + '</nav>';
    }
    if (toutFini() && principales().length) {
      h += '<p class="info" style="margin:1rem;text-align:center">🎉 <b>Bravo ' + esc(eleve.split(' ')[0]) + ', tu as terminé le parcours&nbsp;!</b>'
        + (pad.options && pad.options.salleSecrete && cols().some(function (c) { return c.secrete; }) ? ' Une salle secrète vient de s\'ouvrir… ✨' : '') + '</p>';
    }
    h += '<div class="el-tableau" id="el-tableau">' + vis.map(function (c) { return colonneHTML(c, ctx); }).join('') + '</div>';
    app.innerHTML = h;
    brancher();
    var t2 = $('#el-tableau');
    if (premierAffichage) {
      if (ici) { var el = $('[data-col="' + ici.id + '"]'); if (el && t2) t2.scrollLeft = Math.max(0, el.offsetLeft - 16); }
    } else { t2.scrollLeft = sl; window.scrollTo(sx, sy); }
    // les photos déposées, relues depuis IndexedDB
    $$('[data-photo]').forEach(function (img) {
      var cid = img.getAttribute('data-photo');
      if (PHOTOS[cid]) { img.src = PHOTOS[cid]; img.hidden = false; return; }
      lirePhoto(cid).then(function (blob) { if (blob) { PHOTOS[cid] = URL.createObjectURL(blob); img.src = PHOTOS[cid]; img.hidden = false; } });
    });
  }

  function colonneHTML(c, ctx) {
    var ouverte = accessible(c);
    if (!ouverte) {
      var n = Math.min(Math.max(c.cartes.length, 1), 3), faux = '';
      for (var i = 0; i < n; i++) faux += '<div class="faux' + (i === 0 ? ' haut' : '') + '"></div>';
      return '<section class="el-col fermee" data-col="' + esc(c.id) + '"><h2>' + esc(c.titre) + '</h2><div class="etat">🔒 Verrouillée</div>'
        + '<div class="el-cartes" aria-hidden="true">' + faux + '</div>'
        + '<div class="voile"><span class="ico" aria-hidden="true">🔒</span>Termine l\'étape précédente<br>pour ouvrir celle-ci.</div></section>';
    }
    var h = '<section class="el-col' + (c.secrete ? ' secrete' : '') + '" data-col="' + esc(c.id) + '"><h2>' + (c.secrete ? '✨ ' : '') + esc(c.titre) + '</h2>'
      + '<div class="etat">' + (franchie(c) ? '✓ Étape franchie' : 'En cours') + '</div><div class="el-cartes">'
      + c.cartes.map(function (k) { return '<article class="kcarte">' + P.rendreCarte(k, ctx) + '</article>'; }).join('') + '</div>';
    h += serrureHTML(c);
    if (c.coffre) h += coffreHTML(c);
    if (pad.options && pad.options.ressentis && franchie(c) && (c.cadenas || {}).type !== 'libre') {
      var R = [['rien', '😵', 'Rien compris'], ['dur', '😓', 'Trop dur'], ['aise', '🙂', 'À l\'aise'], ['facile', '😎', 'Trop facile']];
      h += '<div class="serrure"><h3>Comment tu t\'es senti&nbsp;?</h3><div class="ressentis">' + R.map(function (r) {
        return '<button type="button" data-ressenti="' + r[0] + '" data-c="' + esc(c.id) + '"' + (prog.ressentis[c.id] === r[0] ? ' class="actif"' : '') + '>' + r[1] + '<small>' + r[2] + '</small></button>';
      }).join('') + '</div></div>';
    }
    return h + '</section>';
  }

  function serrureHTML(c) {
    var cad = c.cadenas || { type: 'libre' }, t = cad.type, s = statut(c), id = esc(c.id);
    if (t === 'libre') return '';
    if (t === 'code') {
      if (s === 'validee') return '<div class="serrure ouverte"><h3>🔓 Cadenas ouvert</h3></div>';
      return '<div class="serrure" data-serrure="' + id + '"><h3>' + ICO.code + ' ' + esc(cad.consigne || 'Entre le code pour ouvrir la suite') + '</h3>'
        + '<form class="ligne" data-code="' + id + '"><input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Code"><button class="btn primaire" type="submit">Ouvrir</button></form></div>';
    }
    // dépôt ou validation
    var d = prog.depots[c.id] || {}, f = cad.formats || ['texte', 'photo'];
    if (EDITION[c.id] && s !== 'validee') s = 'ouverte';
    var titre = (t === 'validation' ? ICO.validation : ICO.depot) + ' ' + esc(cad.consigne || 'Dépose ta production');
    var depot = '';
    if (d.texte) depot += '<p style="white-space:pre-wrap;background:#fff;border-radius:8px;padding:.5rem;margin:.3rem 0">' + esc(d.texte) + '</p>';
    if (d.photo) depot += '<img class="photo-depot" data-photo="' + id + '" alt="Ma photo déposée" hidden>';
    if (d.repris) depot += '<p class="muet" style="font-size:.85rem">Production déposée sur une autre tablette.</p>';
    if (s === 'validee') return '<div class="serrure ouverte"><h3>✅ ' + (t === 'validation' ? 'Validé par ta professeure' : 'Déposé') + '</h3>' + depot + '</div>';
    if (s === 'deposee' && t === 'depot') return '<div class="serrure ouverte"><h3>✅ Déposé — la suite est ouverte</h3>' + depot
      + '<button class="lien-btn" type="button" data-refaire="' + id + '">Modifier mon dépôt</button></div>';
    if (s === 'deposee' && t === 'validation') {
      return '<div class="serrure attente"><h3>🙋 Lève ton tétraèdre&nbsp;!</h3><p style="margin:.2rem 0">Ta professeure va venir regarder ta production et la valider.</p>' + depot
        + (pad.codeMaitreHash ? '<details style="margin-top:.5rem"><summary><b>Espace professeure</b></summary>'
          + '<form data-valider="' + id + '"><label class="champ"><span>Code maître</span><input type="password" inputmode="numeric" autocomplete="off" data-maitre></label>'
          + '<div class="ligne" style="flex-wrap:wrap"><button class="btn primaire" type="submit" data-act="ok">✓ Valider</button>'
          + '<input type="text" data-mot placeholder="Un mot pour l\'élève (facultatif)" style="flex:1 1 160px"><button class="btn" type="submit" data-act="reprendre">↺ À reprendre</button></div></form></details>'
          : '<p class="avert">La professeure n\'a pas encore choisi son code maître.</p>')
        + '<button class="lien-btn" type="button" data-refaire="' + id + '" style="margin-top:.4rem">Modifier mon dépôt</button></div>';
    }
    var retour = s === 'a_reprendre' ? '<p class="erreur" style="margin:.3rem 0">↺ À reprendre' + (d.retour ? '&nbsp;: <b>' + esc(d.retour) + '</b>' : '') + '</p>' : '';
    return '<div class="serrure' + (s === 'a_reprendre' ? ' reprendre' : '') + '"><h3>' + titre + '</h3>' + retour
      + '<form data-depot="' + id + '">'
      + (f.indexOf('texte') >= 0 ? '<textarea data-txt rows="3" placeholder="Écris ici…" style="min-height:80px">' + esc(d.texte || '') + '</textarea>' : '')
      + (f.indexOf('photo') >= 0 ? '<label class="btn" style="margin-top:.4rem;width:100%;cursor:pointer">📷 ' + (d.photo ? 'Changer ma photo' : 'Prendre une photo') + '<input type="file" accept="image/*" capture="environment" data-ph hidden></label><p class="muet" data-ph-nom style="font-size:.85rem;margin:.2rem 0"></p>' : '')
      + (d.photo ? '<img class="photo-depot" data-photo="' + id + '" alt="Ma photo" hidden>' : '')
      + '<button class="btn primaire" type="submit" style="width:100%;margin-top:.4rem">' + (t === 'validation' ? 'Déposer et demander la validation' : 'Déposer') + '</button></form></div>';
  }

  function coffreHTML(c) {
    var f = c.coffre, m = medaille(f.medaille), id = esc(f.id), ouvert = coffreOuvert(f);
    if (ouvert) {
      var nv = prog.coffres[f.id];
      return '<div class="coffre ouvert"><h3>🧰 ' + esc(f.titre || 'Coffre') + ' — ouvert</h3>'
        + (m ? '<div class="recompense">' + pastille(m, nv) + '<p style="margin:.4rem 0 0"><b>' + esc(m.nom) + '</b>' + (P.RANG[nv] ? ' · ' + nv : '') + '</p></div>' : '') + '</div>';
    }
    var lg = f.longueur || 4, chiffres = true;
    var h = '<div class="coffre" data-coffre="' + id + '"><h3>🧰 ' + esc(f.titre || 'Coffre') + (f.final ? ' · coffre final' : '') + '</h3>';
    if (f.final && !finalPret(f)) return h + '<p class="coffre-ferme-final">🔒 Ce coffre ne s\'ouvre qu\'avec toutes les autres médailles du pad.</p></div>';
    h += '<div class="molettes">';
    for (var i = 0; i < lg; i++) {
      h += '<div class="molette"><button type="button" data-tour="1" data-i="' + i + '" aria-label="Molette ' + (i + 1) + ' : suivant">▲</button>'
        + '<input class="val" data-m="' + i + '" value="0" maxlength="1" aria-label="Molette ' + (i + 1) + '" autocomplete="off" autocapitalize="characters">'
        + '<button type="button" data-tour="-1" data-i="' + i + '" aria-label="Molette ' + (i + 1) + ' : précédent">▼</button></div>';
    }
    return h + '</div><button class="btn primaire" type="button" data-ouvrir="' + id + '">Ouvrir le coffre</button></div>';
  }
  function pastille(m, nv) {
    var t = P.RANG[nv] ? P.teinte(nv) : P.teinte(m.couleur);
    return '<span class="medaille" style="--t:' + esc(t) + '">' + esc(m.icone || '🏅') + '</span>';
  }

  /* ============================================================
   *  LES GESTES DE L'ÉLÈVE
   * ============================================================ */
  function colonne(id) { return cols().filter(function (c) { return c.id === id; })[0]; }
  function apresAvancee(c, avant) {
    ecrireProg();
    var maintenant = principales().filter(franchie).length;
    dessiner();
    if (maintenant > avant) {
      var suite = cols().filter(function (x) { return visible(x) && accessible(x) && !franchie(x); })[0];
      toast(suite ? '🔓 « ' + suite.titre + ' » est ouverte !' : '🎉 Parcours terminé !');
      if (suite) { var el = $('[data-col="' + suite.id + '"]'); if (el) el.scrollIntoView({ behavior: MOUVEMENT ? 'smooth' : 'auto', inline: 'start', block: 'nearest' }); }
    }
  }

  function brancher() {
    $('#vitrine').addEventListener('click', vitrine);
    $$('[data-aller]').forEach(function (b) {
      b.addEventListener('click', function () {
        var el = $('[data-col="' + b.getAttribute('data-aller') + '"]');
        if (el) el.scrollIntoView({ behavior: MOUVEMENT ? 'smooth' : 'auto', inline: 'start', block: 'nearest' });
      });
    });
    $$('[data-indice]').forEach(function (b) {
      b.addEventListener('click', function () {
        var kid = b.getAttribute('data-indice'), k = null;
        cols().forEach(function (c) { c.cartes.forEach(function (x) { if (x.id === kid) k = x; }); });
        if (!k) return;
        if (k.indice.cout && !confirm('Si tu regardes cet indice, ta prochaine médaille ne pourra pas dépasser le niveau ' + k.indice.cout + '. Tu le veux quand même ?')) return;
        prog.indices[kid] = k.indice.cout || ''; ecrireProg(); dessiner();
      });
    });
    $$('[data-code]').forEach(function (f) {
      f.addEventListener('submit', function (ev) {
        ev.preventDefault();
        var c = colonne(f.getAttribute('data-code')), saisi = $('input', f).value;
        if (!saisi.trim()) return;
        var avant = principales().filter(franchie).length;
        P.empreinte(pad.sel, saisi).then(function (h) {
          if (h === c.cadenas.codeHash) { prog.colonnes[c.id] = 'validee'; apresAvancee(c, avant); }
          else { var s = f.closest('.serrure'); s.classList.remove('secoue'); void s.offsetWidth; s.classList.add('secoue'); toast('Ce n\'est pas le bon code. Relis le document !'); }
        });
      });
    });
    $$('[data-depot]').forEach(function (f) {
      var ph = $('[data-ph]', f), choisi = null;
      if (ph) ph.addEventListener('change', function () {
        choisi = ph.files[0] || null;
        $('[data-ph-nom]', f).textContent = choisi ? '📎 Photo prête : ' + (choisi.name || 'photo') : '';
      });
      f.addEventListener('submit', function (ev) {
        ev.preventDefault();
        var c = colonne(f.getAttribute('data-depot')), ta = $('[data-txt]', f);
        var ancien = prog.depots[c.id] || {};
        var texte = ta ? ta.value.trim() : '';
        if (!texte && !choisi && !ancien.photo) return toast('Écris ou photographie ta production avant de déposer.');
        var avant = principales().filter(franchie).length;
        var bouton = $('button[type=submit]', f); bouton.disabled = true;
        var suite = choisi ? compresser(choisi).then(function (blob) {
          if (PHOTOS[c.id]) URL.revokeObjectURL(PHOTOS[c.id]);
          PHOTOS[c.id] = URL.createObjectURL(blob);
          return garderPhoto(c.id, blob).then(function () { return true; }, function () { toast('⚠ La photo n\'a pas pu être gardée sur la tablette.'); return true; });
        }) : Promise.resolve(!!ancien.photo);
        suite.then(function (aPhoto) {
          delete EDITION[c.id];
          prog.depots[c.id] = { texte: texte, photo: aPhoto, date: new Date().toISOString() };
          prog.colonnes[c.id] = 'deposee';
          if (c.cadenas.type === 'validation') { ecrireProg(); dessiner(); toast('🙋 Lève ton tétraèdre : ta professeure va venir.'); }
          else apresAvancee(c, avant);
        }).catch(function (e) { bouton.disabled = false; toast('Photo illisible : réessaie.'); });
      });
    });
    $$('[data-refaire]').forEach(function (b) {
      b.addEventListener('click', function () {
        EDITION[b.getAttribute('data-refaire')] = true; dessiner();
      });
    });
    $$('[data-valider]').forEach(function (f) {
      var action = 'ok';
      $$('button[type=submit]', f).forEach(function (b) { b.addEventListener('click', function () { action = b.getAttribute('data-act'); }); });
      f.addEventListener('submit', function (ev) {
        ev.preventDefault();
        var c = colonne(f.getAttribute('data-valider')), code = $('[data-maitre]', f).value;
        var avant = principales().filter(franchie).length;
        P.empreinte(pad.sel, code).then(function (h) {
          if (h !== pad.codeMaitreHash) { toast('Code maître incorrect.'); $('[data-maitre]', f).value = ''; return; }
          if (action === 'reprendre') {
            prog.colonnes[c.id] = 'a_reprendre';
            prog.depots[c.id] = Object.assign({}, prog.depots[c.id], { retour: $('[data-mot]', f).value.trim() });
            ecrireProg(); dessiner(); toast('↺ À reprendre.');
          } else {
            prog.colonnes[c.id] = 'validee'; apresAvancee(c, avant);
            confettis();
          }
        });
      });
    });
    $$('[data-ressenti]').forEach(function (b) {
      b.addEventListener('click', function () { prog.ressentis[b.getAttribute('data-c')] = b.getAttribute('data-ressenti'); ecrireProg(); dessiner(); });
    });
    $$('.coffre[data-coffre]').forEach(brancherCoffre);
  }

  function brancherCoffre(el) {
    var fid = el.getAttribute('data-coffre'), c = null;
    cols().forEach(function (x) { if (x.coffre && x.coffre.id === fid) c = x; });
    if (!c) return;
    var f = c.coffre;
    var SUITE = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $$('[data-tour]', el).forEach(function (b) {
      b.addEventListener('click', function () {
        var i = $('[data-m="' + b.getAttribute('data-i') + '"]', el), j = SUITE.indexOf(i.value.toUpperCase());
        i.value = SUITE[(Math.max(j, 0) + (+b.getAttribute('data-tour')) + SUITE.length) % SUITE.length];
      });
    });
    $$('[data-m]', el).forEach(function (i, n, tous) {
      i.addEventListener('focus', function () { i.select(); });
      i.addEventListener('input', function () {
        i.value = P.normaliser(i.value).toUpperCase().replace(/[^0-9A-Z]/g, '').slice(-1);
        if (i.value && tous[n + 1]) tous[n + 1].focus();
      });
    });
    var bouton = $('[data-ouvrir]', el);
    if (!bouton) return;
    bouton.addEventListener('click', function () {
      var code = $$('[data-m]', el).map(function (i) { return i.value || '0'; }).join('');
      P.empreinte(pad.sel, code).then(function (h) {
        if (h !== f.codeHash) {
          el.classList.remove('secoue'); void el.offsetWidth; el.classList.add('secoue');
          return toast('Clac… le coffre reste fermé. Cherche les chiffres cachés !');
        }
        var nv = niveau(f, c);
        prog.coffres[f.id] = nv === 'aucune' ? 'ouvert' : nv;
        consommerIndices(c);
        ecrireProg();
        if (MOUVEMENT) el.classList.add('ouverture');
        setTimeout(function () {
          dessiner(); confettis();
          var m = medaille(f.medaille);
          if (m) toast('🏅 Nouvelle médaille : ' + m.nom + (P.RANG[nv] ? ' (' + nv + ')' : '') + ' !');
        }, MOUVEMENT ? 700 : 0);
      });
    });
  }

  function confettis() {
    if (!MOUVEMENT) return;
    var z = document.createElement('div'); z.className = 'confetti'; z.setAttribute('aria-hidden', 'true');
    var couleurs = ['#c9a227', '#8f2d2b', '#2f6b70', '#5f4b73', '#b0703c'];
    for (var i = 0; i < 40; i++) {
      var x = document.createElement('i');
      x.style.left = Math.random() * 100 + 'vw'; x.style.background = couleurs[i % couleurs.length];
      x.style.animationDelay = (Math.random() * 0.4) + 's'; x.style.animationDuration = (1.2 + Math.random()) + 's';
      z.appendChild(x);
    }
    document.body.appendChild(z); setTimeout(function () { z.remove(); }, 2600);
  }

  /* ============================================================
   *  VITRINE ET RÉCAPITULATIF
   * ============================================================ */
  function vitrine() {
    var meds = [];
    lesCoffres().forEach(function (f) { var m = medaille(f.medaille); if (m) meds.push({ m: m, f: f }); });
    var faites = principales().filter(function (c) { return franchie(c) && accessible(c); }).length;
    var d = document.createElement('dialog');
    d.innerHTML = '<div class="dlg-tete"><h2>🏅 Vitrine de ' + esc(eleve) + '</h2><button type="button" class="btn discret btn-ico no-print" data-fermer aria-label="Fermer">✕</button></div>'
      + '<div class="dlg-corps"><p style="margin:.2rem 0"><b>' + esc(pad.titre) + '</b> — ' + faites + ' étape(s) franchie(s) sur ' + principales().length
      + ' · ' + new Date().toLocaleDateString('fr-FR') + '</p>'
      + (meds.length ? '<div class="vitrine">' + meds.map(function (x) {
          var nv = prog.coffres[x.f.id];
          return nv ? '<figure>' + pastille(x.m, nv) + '<figcaption><b>' + esc(x.m.nom) + '</b>' + (P.RANG[nv] ? '<br>' + nv : '') + '</figcaption></figure>'
                    : '<figure><span class="medaille inconnue">?</span><figcaption class="muet">À gagner</figcaption></figure>';
        }).join('') + '</div>' : '<p class="muet">Ce pad ne remet pas de médailles.</p>')
      + (APERCU ? '' : '<h3 style="font-size:1rem;margin:1.2rem 0 .3rem">Mon code de reprise</h3>'
        + '<p class="muet" style="margin:.2rem 0;font-size:.88rem">Il te sert seulement si tu changes de tablette&nbsp;: note-le, il retrouve ta progression.</p>'
        + '<span class="code-reprise">' + codeReprise() + '</span>')
      + '</div><div class="dlg-pied"><button class="btn gauche" type="button" data-autre>Ce n\'est pas moi</button>'
      + '<button class="btn" type="button" data-imprimer>🖨 Imprimer</button><button class="btn primaire" type="button" data-fermer>Fermer</button></div>';
    document.body.appendChild(d);
    function fermer() { d.close(); d.remove(); }
    $$('[data-fermer]', d).forEach(function (b) { b.addEventListener('click', fermer); });
    d.addEventListener('cancel', function () { setTimeout(function () { d.remove(); }, 0); });
    $('[data-imprimer]', d).addEventListener('click', function () { window.print(); });
    $('[data-autre]', d).addEventListener('click', function () {
      fermer(); try { localStorage.removeItem('padago.eleve'); } catch (e) { /* rien */ }
      if (APERCU) return;
      demanderPrenom(true);
    });
    d.showModal();
  }

  /* ============================================================
   *  C'EST PARTI
   * ============================================================ */
  Promise.resolve().then(charger).then(function (p) {
    pad = p; pad.colonnes = pad.colonnes || []; pad.options = pad.options || {};
    pad.colonnes.forEach(function (c) { c.cartes = c.cartes || []; c.cadenas = c.cadenas || { type: 'libre' }; });
    document.title = pad.titre + ' — ' + P.NOM;
    accueil();
  }).catch(function (e) {
    if (e.message !== 'arrêt') app.innerHTML = '<div class="carte-form"><h1>Pad introuvable</h1><p>' + esc(P.messageErreur(e)) + '</p></div>';
  });
})();
