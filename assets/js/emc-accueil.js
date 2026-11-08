/* ============================================================
 *  emc-accueil.js — le jeu de rôle « Je m'appelle… », côté élève
 *  (module 'accueil' de emc/index.html, 034).
 *
 *  9 étapes : 0 accueil (classe d'origine, prêt) · 1 consignes ·
 *  2 trouve ton binôme (symbole) · 3 choix des questions · 4 échange
 *  (chrono, notes) · 5 feu vert / feu rouge · 6 présentations
 *  (« je me suis reconnu·e ? ») · 7 portrait mystère · 8 clôture.
 *
 *  🔴 Les NOTES de l'échange (famille, phobies, une personne
 *  admirée…) ne quittent JAMAIS la tablette : localStorage seulement,
 *  jamais la file d'envoi, jamais la base. Effacées à l'étape 8, à la
 *  fin de la séance et à la déconnexion. Ne remontent que des numéros
 *  de questions, des feux (oui/non) et le vote « reconnu·e ».
 *
 *  Contenus réglables : emc_contenus 'jdr' et 'etapes_accueil'.
 *  L'état piloté (chrono de l'échange, ordre de passage, binôme en
 *  cours, portrait projeté) vit dans emc_seances.etat.
 * ============================================================ */
(function (global) {
  'use strict';
  var EMC = global.EMC, el = EMC.el;
  EMC.Modules = EMC.Modules || {};

  var J = { moi: null, binome: [], lignes: [], ecoute: null, cx: null };

  function jdr(cx) { return cx.contenu('jdr') || { themes: [], consignes: [], symboles: [] }; }
  function toutes(cx) {
    var l = [];
    (jdr(cx).themes || []).forEach(function (t) { (t.questions || []).forEach(function (q) { l.push({ id: q.id, texte: q.texte, theme: t }); }); });
    return l;
  }
  function question(cx, id) { return toutes(cx).filter(function (q) { return q.id === id; })[0]; }
  function texteQ(cx, id) { if (id === 0) return jdr(cx).obligatoire || 'Prénom, nom'; var q = question(cx, id); return q ? q.texte : 'Question ' + id; }

  /* ---------- les notes : sur la tablette, et seulement là ---------- */
  function cleNotes(cx) { return 'emc.jdr.notes.' + cx.S.classe; }
  function notes(cx) { try { return JSON.parse(localStorage.getItem(cleNotes(cx)) || '{}') || {}; } catch (e) { return {}; } }
  function poserNote(cx, id, t) { var n = notes(cx); n[id] = t; try { localStorage.setItem(cleNotes(cx), JSON.stringify(n)); } catch (e) {} }
  function effacerNotes(cx) { try { localStorage.removeItem(cleNotes(cx)); } catch (e) {} }

  /* ---------- ma ligne emc_jdr, envoyée entière par la file ---------- */
  function maLigne(cx) {
    return J.moi || (J.moi = { classe_id: cx.S.classe, eleve_id: cx.S.eleveId, origine: null, questions: [], feux: {}, reconnu: null });
  }
  function envoyer(cx, champs) {
    var m = maLigne(cx);
    Object.keys(champs).forEach(function (k) { m[k] = champs[k]; });
    try { localStorage.setItem('emc.jdr.moi.' + cx.S.classe, JSON.stringify(m)); } catch (e) {}
    return cx.S.file.pousser({ methode: 'POST', chemin: 'emc_jdr?on_conflict=classe_id,eleve_id', cle: 'jdr', opts: { fusion: true },
      corps: { classe_id: m.classe_id, eleve_id: m.eleve_id, origine: m.origine, questions: m.questions, feux: m.feux, reconnu: m.reconnu } });
  }
  function relireLignes(cx) {
    return EMC.lire('emc_jdr?select=eleve_id,origine,questions,feux,reconnu&classe_id=eq.' + cx.S.classe).then(function (l) {
      J.lignes = l || [];
      var moi = J.lignes.filter(function (x) { return x.eleve_id === cx.S.eleveId; })[0];
      /* ce qui attend dans la file l'emporte sur la base */
      if (moi && !cx.S.file.enAttente()) J.moi = Object.assign({ classe_id: cx.S.classe }, moi);
      return J.lignes;
    });
  }
  function partenaires() { return J.lignes.filter(function (x) { return J.moi && x.eleve_id !== J.moi.eleve_id; }); }
  function monSymbole() { return J.binome[0] ? J.binome[0].symbole : null; }
  function monNumero() { return J.binome[0] ? J.binome[0].binome : null; }

  /* ---------- petits morceaux d'interface ---------- */
  function encadre(texte, genre) { return el('div', { class: 'encadre' + (genre ? ' ' + genre : '') }, texte); }
  function mmss(s) { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
  var audio = null;
  function bip(f) {
    try {
      audio = audio || new (global.AudioContext || global.webkitAudioContext)();
      var o = audio.createOscillator(), g = audio.createGain();
      o.frequency.value = f || 660; o.connect(g); g.connect(audio.destination);
      g.gain.setValueAtTime(0.0001, audio.currentTime);
      g.gain.exponentialRampToValueAtTime(0.2, audio.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.35);
      o.start(); o.stop(audio.currentTime + 0.4);
    } catch (e) {}
  }

  /* ============================================================
   *  Les étapes
   * ============================================================ */

  /* 0 — Accueil : ma classe d'origine, puis prêt */
  function e0(s, cx) {
    var j = jdr(cx), b = cx.bloc();
    b.appendChild(el('h2', null, '👋 ' + (j.titre || 'Je m\'appelle…')));
    b.appendChild(el('p', { class: 'mission-texte' }, j.accroche || ''));
    s.appendChild(b);
    var c = cx.bloc();
    c.appendChild(el('h2', null, 'Ta classe de seconde'));
    c.appendChild(el('p', { class: 'muet' }, 'Pour former des binômes de deux classes différentes.'));
    var grille = el('div', { class: 'origines', role: 'group', 'aria-label': 'Ta classe de seconde' });
    var n = j.origines || 10;
    for (var i = 1; i <= n; i++) (function (i) {
      grille.appendChild(el('button', { type: 'button', 'aria-pressed': maLigne(cx).origine === i ? 'true' : 'false',
        onclick: function () { envoyer(cx, { origine: i }); cx.rafraichir(); } }, '2nde ' + i));
    })(i);
    c.appendChild(grille);
    if (maLigne(cx).origine) {
      c.appendChild(cx.boutonPret(true));
      c.appendChild(el('p', { class: 'etat-envoi ' + (cx.S.pret ? 'ok' : 'att') }, cx.S.pret ? '✅ Tu es prêt·e. Attends la suite.' : 'Touche « Je suis prêt·e » quand c\'est bon.'));
    } else {
      c.appendChild(el('p', { class: 'etat-envoi att' }, 'Choisis ta classe pour continuer.'));
    }
    s.appendChild(c);
  }

  /* 1 — Les consignes, et l'exemple */
  function blocExemple(cx, ouvert) {
    var x = jdr(cx).exemple;
    if (!x) return null;
    var d = el('details', { class: 'exemple', open: ouvert || null },
      el('summary', null, '🎭 ' + (x.titre || 'Exemple')),
      el('p', { class: 'exemple-texte' }, x.texte),
      el('p', { class: 'tresmuet' }, 'Construit à partir des questions : ' + (x.questions || []).map(function (id) { return texteQ(cx, id); }).join(' · ')));
    return d;
  }
  function e1(s, cx) {
    var j = jdr(cx), b = cx.bloc();
    b.appendChild(el('ol', { class: 'consignes' }, (j.consignes || []).map(function (t) { return el('li', null, t); })));
    s.appendChild(b);
    var ex = blocExemple(cx, true);
    if (ex) s.appendChild(el('div', { class: 'carte-blanche' }, ex));
  }

  /* 2 — Trouve ton binôme */
  function e2(s, cx) {
    var b = cx.bloc();
    if (!monSymbole()) {
      b.appendChild(el('p', { class: 'muet', style: 'text-align:center;font-size:1.2rem' }, '🎲 Le tirage arrive…'));
      s.appendChild(b); return;
    }
    var trio = J.binome.length === 3;
    b.appendChild(el('div', { class: 'symbole-geant', 'aria-label': 'Ton symbole' }, monSymbole()));
    b.appendChild(el('p', { class: 'consigne-geante' }, trio ? 'Trouve les DEUX autres ' + monSymbole() + ' : vous êtes trois !' : 'Trouve l\'autre ' + monSymbole() + ' !'));
    b.appendChild(el('p', { class: 'muet', style: 'text-align:center' }, 'Lève ta tablette pour montrer ton symbole. Puis asseyez-vous ensemble.'));
    s.appendChild(b);
  }

  /* 3 — Choisis tes questions */
  function e3(s, cx) {
    var j = jdr(cx), min = j.min || 6, max = j.max || 8;
    var choisies = (maLigne(cx).questions || []).slice();
    var etat = el('p', { class: 'etat-envoi', role: 'status', 'aria-live': 'polite' });
    var compteur = el('div', { class: 'compteur-themes' });
    var valider = el('button', { type: 'button', class: 'primaire', style: 'width:100%' }, 'Valider mes questions');
    s.appendChild(encadre(el('span', null, 'Choisis ', el('b', null, min + ' à ' + max + ' questions'), ', avec ', el('b', null, 'au moins une par thème'),
      '. Obligatoire en plus : « ' + (j.obligatoire || 'Prénom, nom') + ' »')));
    var sticky = el('div', { class: 'barre-choix' }, compteur, valider);
    function maj() {
      compteur.innerHTML = '';
      compteur.appendChild(el('span', { class: 'pastille ' + (choisies.length >= min && choisies.length <= max ? 'ok' : 'att') }, choisies.length + ' / ' + min + '–' + max));
      (j.themes || []).forEach(function (t) {
        var k = t.questions.filter(function (q) { return choisies.indexOf(q.id) >= 0; }).length;
        compteur.appendChild(el('span', { class: 'pastille ' + (k ? 'ok' : 'att'), title: t.titre }, (t.icone || '') + ' ' + k));
      });
    }
    (j.themes || []).forEach(function (t) {
      var f = el('fieldset', { class: 'q theme' }, el('legend', null, (t.icone ? t.icone + ' ' : '') + 'Thème ' + t.n + ' : ' + t.titre));
      t.questions.forEach(function (q) {
        var inp = el('input', { type: 'checkbox', value: q.id, checked: choisies.indexOf(q.id) >= 0 || null });
        inp.addEventListener('change', function () {
          var i = choisies.indexOf(q.id);
          if (inp.checked && i < 0) {
            if (choisies.length >= max) { inp.checked = false; etat.className = 'etat-envoi err'; etat.textContent = 'Déjà ' + max + ' questions : décoche-en une d\'abord.'; return; }
            choisies.push(q.id);
          }
          if (!inp.checked && i >= 0) choisies.splice(i, 1);
          etat.textContent = ''; maj();
        });
        f.appendChild(el('label', null, inp, el('span', null, el('b', { class: 'num-q' }, q.id + '. '), q.texte)));
      });
      s.appendChild(f);
    });
    /* le compteur et « Valider » restent en bas de l'écran pendant
       qu'on parcourt les 30 questions */
    sticky.appendChild(etat);
    s.appendChild(sticky);
    maj();
    if ((maLigne(cx).questions || []).length) { etat.className = 'etat-envoi ok'; etat.textContent = '✓ Questions validées. Tu peux encore changer.'; }
    valider.addEventListener('click', function () {
      var manque = (j.themes || []).filter(function (t) { return !t.questions.some(function (q) { return choisies.indexOf(q.id) >= 0; }); });
      if (choisies.length < min || choisies.length > max) { etat.className = 'etat-envoi err'; etat.textContent = 'Il faut entre ' + min + ' et ' + max + ' questions (tu en as ' + choisies.length + ').'; return; }
      if (manque.length) { etat.className = 'etat-envoi err'; etat.textContent = 'Il manque une question pour : ' + manque.map(function (t) { return t.titre; }).join(', ') + '.'; return; }
      var ordre = toutes(cx).map(function (q) { return q.id; });
      choisies.sort(function (a, b) { return ordre.indexOf(a) - ordre.indexOf(b); });
      envoyer(cx, { questions: choisies.slice() });
      cx.majEtatEnvoi(etat, '✓ Questions validées. Tu peux encore changer tant que l\'étape est ouverte.');
    });
  }

  /* 4 — L'échange : chrono, et les notes (tablette seulement) */
  function chronoEchange(cx, zone) {
    var j = jdr(cx), total = (j.echange_minutes || 10) * 60, depuis = (cx.S.seance.etat || {}).echange_depuis;
    var alerte = false;
    function tic() {
      if (!document.body.contains(zone)) return clearInterval(iv);
      if (!depuis) { zone.innerHTML = ''; zone.appendChild(el('div', { class: 'chrono-eleve att' }, '⏳ Le chrono démarre au signal')); return; }
      var ecoule = (Date.now() - depuis) / 1000, reste = total - ecoule;
      var mi = ecoule >= total / 2;
      if (mi && !alerte) { alerte = true; if (ecoule < total / 2 + 3) { bip(880); setTimeout(function () { bip(880); }, 300); } }
      zone.innerHTML = '';
      zone.appendChild(el('div', { class: 'chrono-eleve' + (reste <= 0 ? ' fini' : mi ? ' moitie' : '') },
        reste > 0 ? '⏱ ' + mmss(reste) : '⏰ Temps écoulé', el('span', null, reste <= 0 ? '' : mi ? ' 🔄 Changez de rôle !' : ' — l\'un interroge, l\'autre répond')));
    }
    var iv = setInterval(tic, 500); tic();
    cx.enQuittant(function () { clearInterval(iv); });
  }
  function e4(s, cx) {
    var z = el('div'); s.appendChild(z); chronoEchange(cx, z);
    s.appendChild(encadre(el('span', null, el('b', null, '🔒 Tes notes restent sur cette tablette.'),
      ' Elles ne sont envoyées nulle part, et elles s\'effacent à la fin de la séance. Note des mots-clés, pas des phrases.'), 'cyan'));
    var mes = [0].concat(maLigne(cx).questions || []);
    if (mes.length === 1) s.appendChild(encadre('Tu n\'as pas validé de questions à l\'étape précédente : pose celles que tu veux, et note ici.', 'orange'));
    var n = notes(cx), b = cx.bloc();
    b.appendChild(el('h2', null, '📝 Ce que mon binôme me répond'));
    mes.forEach(function (id) {
      var t = el('textarea', { class: 'note-q', rows: '2', maxlength: '600', 'aria-label': texteQ(cx, id) });
      t.value = n[id] || '';
      t.addEventListener('input', function () { poserNote(cx, id, t.value); });
      b.appendChild(el('label', { class: 'q-note' }, el('span', null, texteQ(cx, id)), t));
    });
    if (mes.length === 1) {
      var libre = el('textarea', { class: 'note-q', rows: '6', maxlength: '2000', 'aria-label': 'Notes libres' });
      libre.value = n.libre || '';
      libre.addEventListener('input', function () { poserNote(cx, 'libre', libre.value); });
      b.appendChild(el('label', { class: 'q-note' }, el('span', null, 'Notes libres'), libre));
    }
    s.appendChild(b);
  }

  /* 5 — Feu vert, feu rouge : je décide ce qu'on peut dire de moi */
  function e5(s, cx) {
    var j = jdr(cx);
    s.appendChild(encadre(el('span', null, '🤝 ', j.feux || ''), 'orange'));
    var b = cx.bloc(); s.appendChild(b);
    var etat = el('p', { class: 'etat-envoi', role: 'status', 'aria-live': 'polite' });
    b.appendChild(el('p', { class: 'muet' }, j.feux_consigne || ''));
    var zone = el('div'); b.appendChild(zone); b.appendChild(etat);
    zone.appendChild(el('p', { class: 'tresmuet' }, 'Chargement des questions de ton binôme…'));
    relireLignes(cx).then(function () {
      var ids = [];
      partenaires().forEach(function (p) { (p.questions || []).forEach(function (id) { if (ids.indexOf(id) < 0) ids.push(id); }); });
      zone.innerHTML = '';
      if (!ids.length) { zone.appendChild(el('p', { class: 'muet' }, 'Ton binôme n\'a pas validé de questions sur le site : dis-lui de vive voix ce qu\'il ou elle peut raconter.')); return; }
      var feux = Object.assign({}, maLigne(cx).feux || {});
      ids.forEach(function (id) {
        var ligne = el('div', { class: 'feu-ligne' });
        function rendre() {
          ligne.innerHTML = '';
          var v = feux[id];
          ligne.appendChild(el('span', { class: 'feu-q' }, texteQ(cx, id)));
          ligne.appendChild(el('div', { class: 'feu-boutons', role: 'group' },
            el('button', { type: 'button', class: 'feu vert', 'aria-pressed': v === true ? 'true' : 'false', onclick: function () { feux[id] = true; rendre(); garder(); } }, '🟢 Oui'),
            el('button', { type: 'button', class: 'feu rouge', 'aria-pressed': v === false ? 'true' : 'false', onclick: function () { feux[id] = false; rendre(); garder(); } }, '🔴 Non')));
        }
        rendre(); zone.appendChild(ligne);
      });
      function garder() {
        envoyer(cx, { feux: Object.assign({}, feux) });
        var faits = ids.filter(function (id) { return typeof feux[id] === 'boolean'; }).length;
        cx.majEtatEnvoi(etat, faits === ids.length ? '✓ C\'est noté pour toutes les questions.' : '✓ Noté (' + faits + ' / ' + ids.length + ').');
      }
    }, function () { zone.innerHTML = ''; zone.appendChild(el('p', { class: 'encadre err' }, 'Pas de réseau : réessaie dans un instant.')); });
  }

  /* 6 — Les présentations */
  function feuxDesPartenaires(id) {
    var l = partenaires().filter(function (p) { return (p.questions || []).length >= 0; });
    var vals = l.map(function (p) { return (p.feux || {})[id]; }).filter(function (v) { return typeof v === 'boolean'; });
    if (!vals.length) return null;
    return vals.every(function (v) { return v; });
  }
  function e6(s, cx) {
    var et = cx.S.seance.etat || {}, ordre = et.ordre || [], i = et.courant, cour = ordre[i];
    var j = jdr(cx);
    var tete = cx.bloc(); s.appendChild(tete);
    if (cour == null) tete.appendChild(el('p', { class: 'muet' }, 'L\'ordre de passage va être tiré au sort…'));
    else if (cour === monNumero()) {
      tete.appendChild(el('div', { class: 'symbole-geant petit' }, monSymbole()));
      tete.appendChild(el('p', { class: 'consigne-geante' }, '🎤 C\'est à vous !'));
    } else {
      tete.appendChild(el('p', { class: 'muet', style: 'text-align:center' }, 'En ce moment : binôme ' + (i + 1) + ' sur ' + ordre.length));
      var pos = ordre.indexOf(monNumero());
      if (pos > i) tete.appendChild(el('p', { style: 'text-align:center' }, 'Votre tour : dans ' + (pos - i) + ' passage' + (pos - i > 1 ? 's' : '') + '.'));
    }
    /* je me suis reconnu·e ? — quand mon binôme vient de passer */
    if (cour != null && cour === monNumero()) {
      var r = cx.bloc(); s.appendChild(r);
      r.appendChild(el('h2', null, j.reconnu_question || 'Je me suis reconnu·e ?'));
      r.appendChild(el('p', { class: 'muet' }, 'Après que ton binôme t\'a présenté·e.'));
      var g = el('div', { class: 'reconnu', role: 'group' });
      (j.reconnu || []).forEach(function (x) {
        g.appendChild(el('button', { type: 'button', 'aria-pressed': maLigne(cx).reconnu === x.v ? 'true' : 'false',
          onclick: function () { envoyer(cx, { reconnu: x.v }); cx.rafraichir(); } }, el('span', { class: 'e' }, x.e), x.l));
      });
      r.appendChild(g);
    }
    /* ma présentation : mes notes, avec les feux de mon binôme */
    var b = cx.bloc(); s.appendChild(b);
    b.appendChild(el('h2', null, '🗣 Ma présentation'));
    b.appendChild(el('p', { class: 'muet' }, 'À la première personne : « Je m\'appelle… ». Un petit récit, environ 1 minute. Les 🔴 restent entre vous.'));
    var liste = el('div'); b.appendChild(liste);
    function rendre() {
      var n = notes(cx); liste.innerHTML = '';
      [0].concat(maLigne(cx).questions || []).forEach(function (id) {
        var f = id === 0 ? true : feuxDesPartenaires(id);
        liste.appendChild(el('div', { class: 'note-feu ' + (f === false ? 'rouge' : f === true ? 'vert' : '') },
          el('span', { class: 'pastille-feu' }, f === false ? '🔴' : f === true ? '🟢' : '⚪'),
          el('div', null, el('div', { class: 'tresmuet' }, texteQ(cx, id)), el('div', null, f === false ? '— on n\'en parle pas —' : (n[id] || '…')))));
      });
      if (n.libre) liste.appendChild(el('div', { class: 'note-feu' }, el('span', { class: 'pastille-feu' }, '📝'), el('div', null, n.libre)));
    }
    rendre();
    relireLignes(cx).then(rendre, function () {});
    var ex = blocExemple(cx, false); if (ex) b.appendChild(ex);
  }

  /* 7 — Portrait mystère : un détail surprenant, en feu vert */
  function e7(s, cx) {
    var j = jdr(cx);
    s.appendChild(encadre(j.portrait_consigne || ''));
    var b = cx.bloc(); s.appendChild(b);
    var etat = el('p', { class: 'etat-envoi', role: 'status', 'aria-live': 'polite' });
    var sel = el('select', { id: 'pm-q', 'aria-label': 'La question' });
    var t = el('textarea', { id: 'pm-t', rows: '3', maxlength: '300', placeholder: j.portrait_exemple ? 'Exemple : ' + j.portrait_exemple : '' });
    var env = el('button', { type: 'button', class: 'primaire' }, 'Envoyer mon portrait mystère');
    b.appendChild(el('label', { for: 'pm-q' }, 'La question (seulement celles en feu vert)'));
    b.appendChild(sel);
    b.appendChild(el('label', { for: 'pm-t' }, 'Le détail, à la première personne, sans prénom'));
    b.appendChild(t); b.appendChild(env); b.appendChild(etat);
    relireLignes(cx).then(function () {
      var vertes = (maLigne(cx).questions || []).filter(function (id) { return feuxDesPartenaires(id) === true; });
      sel.innerHTML = '';
      if (!vertes.length) sel.appendChild(el('option', { value: '' }, 'Aucune question en feu vert : choisis un détail que ton binôme accepte'));
      vertes.forEach(function (id) { sel.appendChild(el('option', { value: id }, texteQ(cx, id))); });
    }, function () {});
    EMC.lire('emc_mur?select=question,texte,statut&sorte=eq.portrait&classe_id=eq.' + cx.S.classe).then(function (l) {
      if (!l || !l[0]) return;
      t.value = l[0].texte;
      if (l[0].statut !== 'propose') { t.disabled = true; env.disabled = true; etat.className = 'etat-envoi ok'; etat.textContent = l[0].statut === 'valide' ? '✓ Retenu par le professeur. Surprise à la projection !' : 'Le professeur ne l\'a pas retenu.'; }
      else { etat.className = 'etat-envoi ok'; etat.textContent = '✓ Envoyé. Tu peux encore le corriger.'; }
    }, function () {});
    env.addEventListener('click', function () {
      var x = t.value.trim();
      if (!x) { etat.className = 'etat-envoi err'; etat.textContent = 'Écris le détail.'; return; }
      env.disabled = true;
      EMC.ecrire('emc_mur?on_conflict=classe_id,eleve_id,sorte', { classe_id: cx.S.classe, eleve_id: cx.S.eleveId, sorte: 'portrait',
        question: sel.value ? +sel.value : null, texte: x.slice(0, 300) }, { fusion: true }).then(function () {
        env.disabled = false; etat.className = 'etat-envoi ok'; etat.textContent = '✓ Envoyé. Le professeur le relit avant de le projeter.';
      }, function (e) { env.disabled = false; etat.className = 'etat-envoi err'; etat.textContent = EMC.horsLigne(e) ? 'Pas de réseau : réessaie.' : 'Déjà relu par le professeur : il ne se modifie plus.'; });
    });
  }

  /* 8 — Clôture : les notes s'effacent ; une phrase, si on veut */
  function e8(s, cx) {
    effacerNotes(cx);
    var j = jdr(cx), b = cx.bloc(); s.appendChild(b);
    b.appendChild(el('h2', null, 'Merci ! 🙏'));
    b.appendChild(encadre('🧹 Tes notes de l\'échange viennent d\'être effacées de cette tablette.', 'cyan'));
    var etat = el('p', { class: 'etat-envoi', role: 'status', 'aria-live': 'polite' });
    var t = el('textarea', { id: 'retiens', rows: '3', maxlength: '300' });
    var env = el('button', { type: 'button', class: 'primaire' }, 'Envoyer');
    b.appendChild(el('label', { for: 'retiens' }, j.retiens_question || 'Ce que je retiens de mon binôme (facultatif)'));
    b.appendChild(t); b.appendChild(env); b.appendChild(etat);
    env.addEventListener('click', function () {
      var x = t.value.trim();
      if (!x) { etat.className = 'etat-envoi err'; etat.textContent = 'C\'est facultatif : rien à envoyer.'; return; }
      EMC.ecrire('emc_mur?on_conflict=classe_id,eleve_id,sorte', { classe_id: cx.S.classe, eleve_id: cx.S.eleveId, sorte: 'retiens', texte: x.slice(0, 300) }, { fusion: true })
        .then(function () { etat.className = 'etat-envoi ok'; etat.textContent = '✓ Merci, c\'est envoyé.'; },
              function (e) { etat.className = 'etat-envoi err'; etat.textContent = EMC.message(e); });
    });
  }

  /* ============================================================ */
  EMC.Modules.accueil = {
    titre: 'Je m\'appelle…',
    cleEtapes: 'etapes_accueil',
    etapes: [e0, e1, e2, e3, e4, e5, e6, e7, e8],
    demarrer: function (cx) {
      J.cx = cx;
      try { var m = JSON.parse(localStorage.getItem('emc.jdr.moi.' + cx.S.classe) || 'null'); if (m && m.eleve_id === cx.S.eleveId) J.moi = m; } catch (e) {}
      relireLignes(cx).then(function () { if (cx.S.seance && cx.S.seance.etape === 0) cx.rafraichir(); }, function () {});
      J.ecoute = EMC.ecouter('emc_binomes', 'classe_id=eq.' + cx.S.classe, function () { relireBinome(cx); }, function () { relireBinome(cx); }, { periode: 4 });
    },
    badge: function () {
      return monSymbole() ? el('span', { class: 'pastille table grande-table symbole-badge', title: 'Ton symbole' }, monSymbole())
                          : el('span', { class: 'pastille grande-table' }, '🎭');
    },
    majSeance: function (cx, avant, ligne) {
      var a = JSON.stringify(avant.etat || {}), b = JSON.stringify(ligne.etat || {});
      if (a !== b && [4, 6].indexOf(ligne.etape) >= 0) cx.rafraichir();
    },
    fin: function (cx) { effacerNotes(cx); },
    quitter: function (cx) { effacerNotes(cx); try { localStorage.removeItem('emc.jdr.moi.' + cx.S.classe); } catch (e) {} }
  };

  function relireBinome(cx) {
    return EMC.lire('emc_binomes?select=eleve_id,binome,symbole&classe_id=eq.' + cx.S.classe).then(function (l) {
      var avant = JSON.stringify(J.binome);
      J.binome = l || [];
      if (avant !== JSON.stringify(J.binome)) {
        cx.rendreBarre();
        if (cx.S.seance && [2, 6].indexOf(cx.S.seance.etape) >= 0) cx.rafraichir();
      }
    }, function () {});
  }
})(window);
