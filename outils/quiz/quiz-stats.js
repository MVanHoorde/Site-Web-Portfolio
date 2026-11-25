/* ============================================================
 *  quiz-stats.js — ce que les parties ont laissé
 *  ------------------------------------------------------------
 *  · Une partie : réussite par question (avec la répartition des
 *    réponses), par notion, par élève (pseudonyme), export CSV.
 *  · Un quiz, toutes parties confondues : la réussite de chaque
 *    question d'une classe à l'autre, d'une année à l'autre.
 *  Les données ne quittent pas la base : lues sous RLS, l'enseignant
 *  ne voit que ses propres parties.
 * ============================================================ */
(function () {
  'use strict';
  var Q = window.Quiz, $ = Q.$, esc = Q.esc;
  var app = $('#app');
  var parties = [];

  function pct(a, b) { return b ? Math.round(a / b * 100) : 0; }
  function jauge(p) {
    return '<span class="jauge' + (p < 40 ? ' faible' : p < 70 ? ' moyen' : '') + '"><i style="width:' + p + '%"></i></span>' + p + ' %';
  }
  function date(d) { return new Date(d).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }); }
  function seconde(ms) { return (ms / 1000).toFixed(1).replace('.', ',') + ' s'; }
  function telecharger(nom, lignes) {
    var csv = '﻿' + lignes.map(function (l) {
      return l.map(function (c) { c = String(c == null ? '' : c); return /[;"\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(';');
    }).join('\r\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = nom; document.body.appendChild(a); a.click(); a.remove();
  }
  function enLots(ids, f) {   // les URL trop longues échouent : 40 parties par requête
    var lots = [];
    for (var i = 0; i < ids.length; i += 40) lots.push(ids.slice(i, i + 40));
    return Promise.all(lots.map(f)).then(function (r) { return [].concat.apply([], r); });
  }

  /* ---------------- la liste ---------------- */
  function liste() {
    history.replaceState(null, '', location.pathname);
    app.innerHTML = '<div class="page"><h2>Mes parties en classe</h2><p class="note" id="n">Chargement…</p>' +
      '<div class="defile"><table class="tableau" id="t"></table></div>' +
      '<h2>Par quiz, toutes parties en classe confondues</h2><div class="defile"><table class="tableau" id="t-quiz"></table></div>' +
      '<h2>Entraînement hors classe</h2><p class="note" id="n-solo">Les élèves qui ont refait un quiz seuls, avec son QR code fixe.</p>' +
      '<div class="defile"><table class="tableau" id="t-solo"></table></div></div>';
    Q.rest('quiz_parties?select=id,quiz_id,titre,groupe,ouverte_le,phase,idx,questions,mode&order=ouverte_le.desc&limit=600').then(function (l) {
      var toutes = l || [];
      parties = toutes.filter(function (p) { return p.mode !== 'solo'; });
      entrainements(toutes.filter(function (p) { return p.mode === 'solo'; }).slice(0, 300));
      $('#n').textContent = parties.length ? parties.length + ' partie' + (parties.length > 1 ? 's' : '') + '. Cliquer une ligne pour le détail.' : 'Aucune partie jouée pour l\'instant.';
      $('#t').innerHTML = '<tr><th>Date</th><th>Quiz</th><th>Groupe</th><th>Questions jouées</th></tr>' + parties.map(function (p) {
        var jouees = p.phase === 'fin' ? p.questions.length : Math.max(0, p.idx + (p.phase === 'question' ? 0 : 1));
        return '<tr class="cliquable" data-id="' + p.id + '"><td>' + date(p.ouverte_le) + '</td><td>' + esc(p.titre) + '</td><td>' + esc(p.groupe || '') + '</td><td>' + jouees + ' / ' + p.questions.length + '</td></tr>';
      }).join('');
      app.querySelectorAll('#t tr[data-id]').forEach(function (tr) { tr.onclick = function () { detail(tr.dataset.id); }; });
      var parQuiz = {};
      parties.forEach(function (p) { var k = p.quiz_id || p.titre; (parQuiz[k] = parQuiz[k] || { titre: p.titre, ids: [] }).ids.push(p.id); });
      $('#t-quiz').innerHTML = '<tr><th>Quiz</th><th>Parties</th></tr>' + Object.keys(parQuiz).map(function (k) {
        return '<tr class="cliquable" data-k="' + esc(k) + '"><td>' + esc(parQuiz[k].titre) + '</td><td>' + parQuiz[k].ids.length + '</td></tr>';
      }).join('');
      app.querySelectorAll('#t-quiz tr[data-k]').forEach(function (tr) { tr.onclick = function () { cumul(parQuiz[tr.dataset.k]); }; });
    }).catch(erreur);
  }

  /* L'entraînement seul : une partie par élève et par essai. On montre
     qui a retravaillé quoi, et avec quel résultat. */
  function entrainements(solos) {
    if (!solos.length) { $('#t-solo').innerHTML = '<tr><td class="note">Aucun entraînement pour l\'instant.</td></tr>'; return; }
    var ids = solos.map(function (p) { return p.id; });
    Promise.all([
      enLots(ids, function (lot) { return Q.rest('quiz_joueurs?select=partie_id,pseudo&partie_id=in.(' + lot.join(',') + ')'); }),
      enLots(ids, function (lot) { return Q.rest('quiz_reponses?select=partie_id,juste&partie_id=in.(' + lot.join(',') + ')'); })
    ]).then(function (r) {
      var pseudo = {}, justes = {}, repondu = {};
      r[0].forEach(function (j) { pseudo[j.partie_id] = j.pseudo; });
      r[1].forEach(function (x) { repondu[x.partie_id] = (repondu[x.partie_id] || 0) + 1; if (x.juste) justes[x.partie_id] = (justes[x.partie_id] || 0) + 1; });
      $('#t-solo').innerHTML = '<tr><th>Date</th><th>Quiz</th><th>Élève</th><th>Justes</th><th>Terminé</th></tr>' + solos.map(function (p) {
        return '<tr class="cliquable" data-id="' + p.id + '"><td>' + date(p.ouverte_le) + '</td><td>' + esc(p.titre) + '</td><td>' + esc(pseudo[p.id] || '—') + '</td>' +
          '<td>' + (justes[p.id] || 0) + ' / ' + p.questions.length + '</td><td>' + (p.phase === 'fin' ? 'oui' : 'arrêté à la question ' + (p.idx + 1)) + '</td></tr>';
      }).join('');
      app.querySelectorAll('#t-solo tr[data-id]').forEach(function (tr) { tr.onclick = function () { detail(tr.dataset.id); }; });
    }).catch(erreur);
  }

  /* ---------------- une partie ---------------- */
  function detail(id) {
    history.replaceState(null, '', '?partie=' + id);
    app.innerHTML = '<div class="page"><p class="note">Chargement…</p></div>';
    Promise.all([
      Q.rest('quiz_parties?id=eq.' + id + '&select=*'),
      Q.rest('quiz_joueurs?partie_id=eq.' + id + '&select=id,pseudo,rejoint_le&order=rejoint_le'),
      Q.rest('quiz_reponses?partie_id=eq.' + id + '&select=joueur_id,idx,reponse,juste,categorie,points,temps_ms,sur'),
      // 053 : les indices payants pris (sans le 053 en base : pas de colonne)
      Q.rest('quiz_indices?partie_id=eq.' + id + '&select=idx').catch(function () { return null; })
    ]).then(function (r) {
      var p = r[0][0]; if (!p) throw new Error('QUIZ_PARTIE_INCONNUE');
      var joueurs = r[1], reps = r[2], qs = p.questions;
      var parIndice = qs.map(function () { return 0; });
      (r[3] || []).forEach(function (x) { if (parIndice[x.idx] != null) parIndice[x.idx]++; });
      var avecIndice = r[3] !== null && qs.some(function (q) { return q.indice; });
      var parQ = qs.map(function () { return []; });
      reps.forEach(function (x) { if (parQ[x.idx]) parQ[x.idx].push(x); });
      var jouees = qs.map(function (_, i) { return parQ[i].length > 0 || (p.phase === 'fin') || i < p.idx || (i === p.idx && p.phase !== 'question'); });
      var nJoues = jouees.filter(Boolean).length;

      /* par question */
      var lignesQ = qs.map(function (q, i) {
        var l = parQ[i], j = l.filter(function (x) { return x.juste; }).length;
        var t = l.length ? l.reduce(function (a, x) { return a + x.temps_ms; }, 0) / l.length : 0;
        return { i: i, q: q, n: l.length, justes: j, p: pct(j, l.length), t: t, joue: jouees[i], ind: parIndice[i] };
      });
      var tq = '<tr><th>N°</th><th>Question</th><th>Notion</th><th>Réussite</th><th>Répartition</th><th>Temps moyen</th><th>Sans réponse</th>' +
          (avecIndice ? '<th title="Élèves qui ont pris l’indice payant">💡 Indice pris</th>' : '') + '</tr>' +
        lignesQ.map(function (L) {
          if (!L.joue) return '<tr><td>' + (L.i + 1) + '</td><td colspan="' + (avecIndice ? 7 : 6) + '" class="note">' + '<span class="enonce-court">' + Q.rendre(L.q.enonce) + '</span>' + ' — pas jouée</td></tr>';
          return '<tr><td>' + (L.i + 1) + '</td><td>' + '<span class="enonce-court">' + Q.rendre(L.q.enonce) + '</span>' + '</td><td>' + esc(L.q.notion || '') + '</td><td>' + jauge(L.p) + '</td>' +
            '<td>' + repartition(L.q, parQ[L.i]) + '</td><td>' + seconde(L.t) + '</td><td>' + Math.max(0, joueurs.length - L.n) + '</td>' +
            (avecIndice ? '<td>' + (L.q.indice ? L.ind + ' / ' + joueurs.length : '—') + '</td>' : '') + '</tr>';
        }).join('');

      /* par notion */
      var notions = {};
      lignesQ.forEach(function (L) {
        if (!L.joue) return;
        var k = L.q.notion || 'Sans notion', o = notions[k] = notions[k] || { q: 0, n: 0, j: 0 };
        o.q++; o.n += joueurs.length; o.j += L.justes;
      });
      var tn = '<tr><th>Notion</th><th>Questions</th><th>Réussite</th></tr>' + Object.keys(notions).sort(function (a, b) {
        return notions[a].j / notions[a].n - notions[b].j / notions[b].n;
      }).map(function (k) { var o = notions[k]; return '<tr><td>' + esc(k) + '</td><td>' + o.q + '</td><td>' + jauge(pct(o.j, o.n)) + '</td></tr>'; }).join('');

      /* par élève */
      var eleves = joueurs.map(function (j) {
        var l = reps.filter(function (x) { return x.joueur_id === j.id; });
        var ratees = {};
        lignesQ.forEach(function (L) {
          if (!L.joue) return;
          var x = l.filter(function (y) { return y.idx === L.i; })[0];
          if (!x || !x.juste) { var k = L.q.notion || 'Sans notion'; ratees[k] = (ratees[k] || 0) + 1; }
        });
        return { pseudo: j.pseudo, score: Math.max(0, l.reduce(function (a, x) { return a + x.points; }, 0)),
                 justes: l.filter(function (x) { return x.juste; }).length, repondu: l.length,
                 ratees: Object.keys(ratees).sort(function (a, b) { return ratees[b] - ratees[a]; }).slice(0, 3) };
      }).sort(function (a, b) { return b.score - a.score; });
      var te = '<tr><th>Rang</th><th>Élève</th><th>Score</th><th>Justes</th><th>Répondu</th><th>Notions à revoir</th></tr>' + eleves.map(function (e, i) {
        return '<tr><td>' + (i + 1) + '</td><td>' + esc(e.pseudo) + '</td><td>' + e.score + '</td><td>' + e.justes + ' / ' + nJoues + '</td><td>' + e.repondu + '</td><td>' + esc(e.ratees.join(' · ')) + '</td></tr>';
      }).join('');

      var tot = reps.length, tj = reps.filter(function (x) { return x.juste; }).length;
      app.innerHTML = '<div class="page">' +
        '<p><button class="lien-bouton" id="b-liste">← Toutes les parties</button></p>' +
        '<h2>' + esc(p.titre) + '</h2>' +
        '<p class="note">' + date(p.ouverte_le) + (p.groupe ? ' · ' + esc(p.groupe) : '') + ' · ' + joueurs.length + ' élève' + (joueurs.length > 1 ? 's' : '') +
          ' · ' + nJoues + ' / ' + qs.length + ' questions jouées · réussite globale ' + pct(tj, tot) + ' %</p>' +
        '<div class="onglets" role="tablist">' +
          '<button role="tab" aria-selected="true" data-o="q">Par question</button><button role="tab" aria-selected="false" data-o="n">Par notion</button><button role="tab" aria-selected="false" data-o="e">Par élève</button></div>' +
        '<div class="defile" data-p="q"><table class="tableau">' + tq + '</table></div>' +
        '<div class="defile" data-p="n" hidden><table class="tableau">' + tn + '</table></div>' +
        '<div class="defile" data-p="e" hidden><table class="tableau">' + te + '</table>' +
          '<p class="note">Les pseudonymes sont remplacés par #1, #2… trente jours après la partie.</p></div>' +
        '<p style="display:flex;gap:10px;flex-wrap:wrap"><button class="bouton petit" id="b-csv-q">Exporter les questions (CSV)</button>' +
          '<button class="bouton creux petit" id="b-csv-e">Exporter les élèves (CSV)</button><span style="flex:1"></span>' +
          '<button class="lien-bouton" id="b-suppr">Supprimer cette partie et ses réponses</button></p>' +
        '</div>';
      $('#b-liste').onclick = liste;
      app.querySelectorAll('[data-o]').forEach(function (b) {
        b.onclick = function () {
          app.querySelectorAll('[data-o]').forEach(function (x) { x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
          app.querySelectorAll('[data-p]').forEach(function (x) { x.hidden = x.dataset.p !== b.dataset.o; });
        };
      });
      $('#b-csv-q').onclick = function () {
        telecharger('quiz-' + p.ouverte_le.slice(0, 10) + '-questions.csv', [['N°', 'Énoncé', 'Notion', 'BO', 'Réponses', 'Justes', 'Réussite %', 'Temps moyen (s)', 'Indice pris']].concat(
          lignesQ.map(function (L) { return [L.i + 1, L.q.enonce, L.q.notion || '', L.q.bo || '', L.n, L.justes, L.p, (L.t / 1000).toFixed(1).replace('.', ','), L.q.indice ? L.ind : '']; })));
      };
      $('#b-csv-e').onclick = function () {
        telecharger('quiz-' + p.ouverte_le.slice(0, 10) + '-eleves.csv', [['Rang', 'Élève', 'Score', 'Justes', 'Répondu', 'Notions à revoir']].concat(
          eleves.map(function (e, i) { return [i + 1, e.pseudo, e.score, e.justes, e.repondu, e.ratees.join(' · ')]; })));
      };
      $('#b-suppr').onclick = function () {
        if (!confirm('Supprimer définitivement cette partie et toutes ses réponses ?')) return;
        Q.rest('quiz_parties?id=eq.' + p.id, { methode: 'DELETE' }).then(liste, erreur);
      };
    }).catch(erreur);
  }

  var COULEURS = ['var(--r0)', 'var(--r1)', 'var(--r2)', 'var(--r3)', 'var(--r4)', 'var(--r5)'];
  function repartition(q, l) {
    if (!l.length) return '';
    var segs = [];
    if (q.type === 'qcm' || q.type === 'vf') {
      var opts = q.options || ['Vrai', 'Faux'], c = opts.map(function () { return 0; }), tot = 0;
      l.forEach(function (x) { (x.reponse.choix || []).forEach(function (i) { if (c[i] != null) { c[i]++; tot++; } }); });
      segs = c.map(function (n, i) { return [n / Math.max(1, tot), COULEURS[i], Q.LETTRES[i] + ' : ' + n + ((q.correct || []).indexOf(i) >= 0 ? ' (juste)' : '')]; });
    } else {
      var j = l.filter(function (x) { return x.juste; }).length;
      segs = [[j / l.length, 'var(--juste)', 'justes : ' + j], [1 - j / l.length, 'var(--encre-2)', 'fausses : ' + (l.length - j)]];
    }
    return '<span class="repartition" title="' + esc(segs.map(function (s) { return s[2]; }).join(' · ')) + '">' +
      segs.map(function (s) { return '<i style="width:' + (s[0] * 100) + '%;background:' + s[1] + '"></i>'; }).join('') + '</span>';
  }

  /* ---------------- un quiz, toutes parties ---------------- */
  function cumul(groupe) {
    app.innerHTML = '<div class="page"><p class="note">Chargement…</p></div>';
    var ps = parties.filter(function (p) { return groupe.ids.indexOf(p.id) >= 0; });
    enLots(groupe.ids, function (lot) {
      return Q.rest('quiz_reponses?select=partie_id,idx,juste&partie_id=in.(' + lot.join(',') + ')');
    }).then(function (reps) {
      // une question se reconnaît à son énoncé : le quiz a pu changer d'une partie à l'autre
      var parEnonce = {}, ordre = [];
      ps.forEach(function (p) {
        p.questions.forEach(function (q, i) {
          var k = q.enonce;
          if (!parEnonce[k]) { parEnonce[k] = { q: q, n: 0, j: 0, parGroupe: {} }; ordre.push(k); }
        });
      });
      var index = {}; ps.forEach(function (p) { index[p.id] = p; });
      reps.forEach(function (x) {
        var p = index[x.partie_id], q = p && p.questions[x.idx]; if (!q) return;
        var o = parEnonce[q.enonce], g = p.groupe || '—';
        o.n++; if (x.juste) o.j++;
        var og = o.parGroupe[g] = o.parGroupe[g] || { n: 0, j: 0 }; og.n++; if (x.juste) og.j++;
      });
      var groupes = {}; ps.forEach(function (p) { groupes[p.groupe || '—'] = 1; });
      var gs = Object.keys(groupes);
      app.innerHTML = '<div class="page"><p><button class="lien-bouton" id="b-liste">← Toutes les parties</button></p>' +
        '<h2>' + esc(groupe.titre) + '</h2><p class="note">' + ps.length + ' partie' + (ps.length > 1 ? 's' : '') + ' · ' + reps.length + ' réponses</p>' +
        '<div class="defile"><table class="tableau"><tr><th>Question</th><th>Notion</th><th>Réussite</th>' + gs.map(function (g) { return '<th>' + esc(g) + '</th>'; }).join('') + '</tr>' +
        ordre.map(function (k) {
          var o = parEnonce[k];
          return '<tr><td>' + '<span class="enonce-court">' + Q.rendre(k) + '</span>' + '</td><td>' + esc(o.q.notion || '') + '</td><td>' + jauge(pct(o.j, o.n)) + '</td>' +
            gs.map(function (g) { var x = o.parGroupe[g]; return '<td>' + (x ? pct(x.j, x.n) + ' %' : '') + '</td>'; }).join('') + '</tr>';
        }).join('') + '</table></div></div>';
      $('#b-liste').onclick = liste;
    }).catch(erreur);
  }

  function erreur(e) {
    if (/SESSION_EXPIREE/.test(String(e && e.message))) return location.reload();
    app.innerHTML = '<div class="page"><p class="erreur">' + esc(Q.messageErreur(e)) + '</p><button class="bouton petit" onclick="location.reload()">Recharger</button></div>';
  }

  Q.poserNom();
  Q.exigerConnexion(app, function () {
    var m = /[?&]partie=([0-9a-f-]{36})/.exec(location.search);
    if (m) detail(m[1]); else liste();
  });
})();
