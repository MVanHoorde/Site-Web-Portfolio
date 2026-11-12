/* ============================================================
 *  emc-restitution.js — la restitution avec la 2nde 1, côté élève
 *  (module 'restitution' de emc/index.html, 034 §5b, 040).
 *
 *  7 étapes, 75 min : 0 connexion · 1 météo des deux jours (émojis)
 *  · 2 mon parcours (3 ou 4 ateliers, chacun une fois, du préféré au
 *  moins aimé ; mot-clé, liberté) · 3 par atelier (son groupe = sa
 *  TABLE, posés par le prof) · 4 le mur de post-it « Nos libertés »
 *  (3 colonnes ; réflexion, écriture, puis passage au tableau)
 *  · 5 ma définition (SUR LE LIVRET papier : la consigne seule)
 *  · 6 retour sur les deux jours (ANONYME : emc_repondre_enquete),
 *  puis l'expression libre (nuage).
 *  Décisions de Loïc : 08/11 (ateliers choisis, mur de post-it),
 *  12/11 (après les séances du jeudi : voir 040).
 * ============================================================ */
(function (global) {
  'use strict';
  var EMC = global.EMC, el = EMC.el;
  EMC.Modules = EMC.Modules || {};
  var R = { moi: null };

  /* Les textes du retour : ceux du 040, en secours si la clé manque. */
  var RETOUR = {
    intro: 'Ton avis nous sert à améliorer ces deux jours pour les prochaines secondes. Sois honnête : c\'est anonyme.',
    global_titre: 'Ces deux jours',
    ressenti_question: 'Globalement, comment as-tu vécu ces deux jours ?',
    appris_question: 'As-tu appris des choses ?',
    proposition_question: 'Une proposition pour améliorer ces deux jours ?',
    ateliers_titre: 'Tes ateliers',
    atelier_note: 'Ton avis sur cet atelier',
    atelier_sert: 'Est-ce que ça sert ?',
    atelier_compris: 'As-tu compris pourquoi tu l\'as fait ?',
    atelier_texte: 'Un ressenti, une idée (facultatif)',
    jdr_titre: 'Le jeu de rôle du début, « Je m\'appelle… »',
    restit_titre: 'Cette séance de restitution',
    texte_question: 'Un mot, une idée (facultatif)'
  };
  var NOTES = [{ v: 1, e: '😞', l: 'Pas du tout' }, { v: 2, e: '🙁', l: 'Pas trop' }, { v: 3, e: '😐', l: 'Moyen' }, { v: 4, e: '🙂', l: 'Bien' }, { v: 5, e: '😃', l: 'Très bien' }];
  var APPRIS = ['Beaucoup', 'Un peu', 'Pas vraiment'];
  var SERT = ['Oui', 'Un peu', 'Non'];
  var COMPRIS = ['Oui', 'En partie', 'Non'];

  function rc(cx) { return cx.contenu('restitution') || { libertes: [], postits: [] }; }
  function encadre(t, g) { return el('div', { class: 'encadre' + (g ? ' ' + g : '') }, t); }
  function etat(cx) { return (cx.S.seance && cx.S.seance.etat) || {}; }
  function monGroupe(cx) {
    var n = (etat(cx).affectations || {})[cx.S.eleveId];
    if (!n) return null;
    return (etat(cx).groupes || []).filter(function (g) { return g.n === n; })[0] || { n: n, titre: 'Groupe ' + n, symbole: '' };
  }
  function bornes(cx) {
    var r = rc(cx), max = Math.max(1, r.parcours_max || 4);
    return { min: Math.min(max, Math.max(1, r.parcours_min || 3)), max: max };
  }

  /* ma ligne emc_restit, envoyée entière par la file */
  function maLigne(cx) { return R.moi || (R.moi = { parcours: [], mot: null }); }
  function envoyer(cx, champs) {
    var m = maLigne(cx);
    Object.keys(champs).forEach(function (k) { m[k] = champs[k]; });
    try { localStorage.setItem('emc.restit.moi.' + cx.S.classe, JSON.stringify(m)); } catch (e) {}
    return cx.S.file.pousser({ methode: 'POST', chemin: 'emc_restit?on_conflict=classe_id,eleve_id', cle: 'restit', opts: { fusion: true },
      corps: Object.assign({ classe_id: cx.S.classe, eleve_id: cx.S.eleveId, parcours: m.parcours, mot: m.mot || null },
        /* la colonne vient du 035 : on ne l'envoie que si elle sert */
        m.expression ? { expression: m.expression } : {}) });
  }

  /* 0 — Connexion et retour */
  function e0(s, cx) {
    var r = rc(cx), b = cx.bloc();
    b.appendChild(el('h2', null, '🗽 ' + (r.titre || 'Nos libertés')));
    b.appendChild(el('p', { class: 'mission-texte' }, r.accroche || ''));
    b.appendChild(cx.boutonPret(true));
    b.appendChild(el('p', { class: 'etat-envoi ' + (cx.S.pret ? 'ok' : 'att') }, cx.S.pret ? '✅ Tu es prêt·e. Attends la suite.' : 'Touche « Je suis prêt·e ».'));
    s.appendChild(b);
  }

  /* 1 — La météo : 1 ou 2 émojis (emc_mots, étape 1) */
  function e1(s, cx) {
    var r = rc(cx), cat = (cx.contenu('mots') || {}).emojis || [], b = cx.bloc();
    b.appendChild(el('h2', null, r.meteo_question || 'Comment je ressors de ces deux jours ?'));
    b.appendChild(el('p', { class: 'muet' }, r.meteo_aide || '1 ou 2 émojis'));
    var choisis = [];
    var grille = el('div', { class: 'emojis', role: 'group' });
    var boutons = cat.map(function (x) {
      var bt = el('button', { type: 'button', 'aria-pressed': 'false' }, el('span', { class: 'e', 'aria-hidden': 'true' }, x.e), x.l);
      bt.dataset.e = x.e;
      bt.addEventListener('click', function () {
        var i = choisis.indexOf(x.e);
        if (i >= 0) choisis.splice(i, 1); else { if (choisis.length >= 2) choisis.shift(); choisis.push(x.e); }
        maj();
      });
      grille.appendChild(bt); return bt;
    });
    function maj() { boutons.forEach(function (bt) { bt.setAttribute('aria-pressed', choisis.indexOf(bt.dataset.e) >= 0 ? 'true' : 'false'); }); }
    var etatE = el('p', { class: 'etat-envoi', role: 'status', 'aria-live': 'polite' });
    var env = el('button', { type: 'button', class: 'primaire', style: 'margin-top:1rem' }, 'Envoyer');
    b.appendChild(grille); b.appendChild(env); b.appendChild(etatE);
    s.appendChild(b);
    EMC.lire('emc_mots?select=emojis&classe_id=eq.' + cx.S.classe).then(function (l) {
      if (l && l[0] && !choisis.length) { choisis = (l[0].emojis || []).slice(0, 2); maj(); etatE.className = 'etat-envoi ok'; etatE.textContent = '✓ Déjà envoyé. Tu peux changer.'; }
    }, function () {});
    env.addEventListener('click', function () {
      if (!choisis.length) { etatE.className = 'etat-envoi err'; etatE.textContent = 'Choisis au moins un émoji.'; return; }
      cx.S.file.pousser({ methode: 'POST', chemin: 'emc_mots?on_conflict=classe_id,eleve_id', cle: 'mots', opts: { fusion: true },
        corps: { classe_id: cx.S.classe, eleve_id: cx.S.eleveId, mots: [], emojis: choisis.slice() } });
      cx.majEtatEnvoi(etatE, '✓ Envoyé ! Tu peux encore changer.');
    });
  }

  /* 2 — Mon parcours. 3 ou 4 ateliers (040), chacun UNE fois, du préféré
     (1) au moins aimé. Ils se CHOISISSENT dans la liste des contenus
     (enseignants et salle : on s'y retrouve) ; « Autre » laisse
     l'écrire. Un atelier déjà pris sur une autre ligne est grisé.
     Sans liste réglée, on écrit tout. */
  function libelleAtelier(a) {
    if (!a) return '';
    return (a.nom ? '« ' + a.nom + ' » — ' : '') + (a.enseignants || '') + (a.salle ? ' · ' + a.salle : '');
  }
  function cleLigne(d) { return d.ref ? 'ref:' + d.ref : EMC.normaliserMot(d.atelier); }
  function e2(s, cx) {
    var r = rc(cx), b0 = bornes(cx), liste = r.ateliers || [];
    s.appendChild(encadre(EMC.riche(r.parcours_consigne || '')));
    var b = cx.bloc(); s.appendChild(b);
    b.appendChild(el('p', { class: 'tresmuet', style: 'margin:0 0 .3rem' },
      'Ligne 1 = l\'atelier que tu as préféré. ▲ pour en remonter un. ' + (b0.min === b0.max ? b0.max + ' ateliers.' : b0.min + ' ou ' + b0.max + ' ateliers, chacun une seule fois.')));
    var lignes = el('div', { class: 'parcours' }); b.appendChild(lignes);
    b.appendChild(el('datalist', { id: 'libertes' }, (r.libertes || []).map(function (x) { return el('option', { value: x }); })));
    var etatE = el('p', { class: 'etat-envoi', role: 'status', 'aria-live': 'polite' });
    var env = el('button', { type: 'button', class: 'primaire' }, 'Enregistrer mon parcours');
    b.appendChild(el('div', { class: 'rangee', style: 'margin-top:.6rem' }, env));
    b.appendChild(etatE);
    var donnees = (maLigne(cx).parcours || []).slice(0, b0.max).map(function (d) { return Object.assign({}, d, { autre: !d.ref && !!d.atelier && !!liste.length }); });
    while (donnees.length < b0.max) donnees.push({});
    function prisAilleurs(i) {
      var m = {}; donnees.forEach(function (d, j) { if (j !== i && (d.ref || d.atelier)) m[cleLigne(d)] = true; }); return m;
    }
    function rendre() {
      lignes.innerHTML = '';
      donnees.forEach(function (d, i) {
        /* l'ordre est un classement : du plus aimé au moins aimé (retour de
           Mme Castel, 08/11). Il sert à former les groupes (040). */
        var champs = [el('div', { class: 'num-atelier' }, el('span', null, String(i + 1)),
          i > 0 ? el('button', { type: 'button', class: 'monter', 'aria-label': 'Remonter l’atelier ' + (i + 1), title: 'Remonter',
            onclick: function () { var x = donnees[i]; donnees[i] = donnees[i - 1]; donnees[i - 1] = x; rendre(); } }, '▲') : null)];
        var pris = prisAilleurs(i);
        var libre = el('input', { type: 'text', maxlength: '60', value: d.ref ? '' : (d.atelier || ''), 'aria-label': 'Atelier ' + (i + 1) + ', écrit',
          placeholder: liste.length ? 'Écris le nom de l\'atelier' : 'L\'atelier (ex. débat sur les réseaux)' });
        libre.addEventListener('input', function () { d.ref = null; d.atelier = libre.value; });
        libre.addEventListener('change', rendre);
        if (liste.length) {
          var sel = el('select', { 'aria-label': 'Atelier ' + (i + 1) + (i === 0 ? ', ton préféré' : '') });
          sel.appendChild(el('option', { value: '' }, i === 0 ? '— Ton atelier préféré —' : '— Choisis l\'atelier —'));
          liste.forEach(function (a) {
            sel.appendChild(el('option', { value: a.n, selected: d.ref === a.n || null, disabled: pris['ref:' + a.n] || null },
              libelleAtelier(a) + (pris['ref:' + a.n] ? ' (déjà choisi)' : '')));
          });
          sel.appendChild(el('option', { value: 'autre', selected: d.autre || null }, '✏️ Un autre atelier (je l\'écris)'));
          sel.addEventListener('change', function () {
            if (sel.value === 'autre') { d.ref = null; d.autre = true; d.atelier = ''; }
            else { var a = liste.filter(function (x) { return String(x.n) === sel.value; })[0]; d.autre = false; d.ref = a ? a.n : null; d.atelier = a ? (a.nom || a.enseignants) : ''; }
            rendre();
          });
          champs.push(sel);
          if (d.autre) champs.push(libre);
        } else champs.push(libre);
        var m = el('input', { type: 'text', maxlength: '30', placeholder: 'Un mot-clé', value: d.mot || '', 'aria-label': 'Mot-clé ' + (i + 1) });
        var l = el('input', { type: 'text', maxlength: '60', list: 'libertes', placeholder: 'La liberté en jeu (choisis ou écris)', value: d.liberte || '', 'aria-label': 'Liberté ' + (i + 1) });
        m.addEventListener('input', function () { d.mot = m.value; });
        l.addEventListener('input', function () { d.liberte = l.value; });
        champs.push(m, l);
        lignes.appendChild(el('div', { class: 'parcours-ligne' + (liste.length ? ' avec-liste' : '') + (d.autre ? ' avec-autre' : '') }, champs));
      });
    }
    rendre();
    if ((maLigne(cx).parcours || []).length) { etatE.className = 'etat-envoi ok'; etatE.textContent = '✓ Enregistré. Tu peux encore modifier.'; }
    env.addEventListener('click', function () {
      var p = donnees.map(function (d) {
        var x = { atelier: String(d.atelier || '').trim().slice(0, 60), mot: String(d.mot || '').trim().slice(0, 30), liberte: String(d.liberte || '').trim().slice(0, 60) };
        if (d.ref) x.ref = d.ref;
        return x;
      }).filter(function (d) { return d.atelier; });
      var vus = {}, double = null;
      p.forEach(function (d) { var k = cleLigne(d); if (vus[k]) double = d.atelier; vus[k] = true; });
      if (double) { etatE.className = 'etat-envoi err'; etatE.textContent = '« ' + double + ' » est en double : chaque atelier une seule fois.'; return; }
      if (p.length < b0.min || p.length > b0.max) {
        etatE.className = 'etat-envoi err';
        etatE.textContent = (b0.min === b0.max ? 'Il faut ' + b0.max : 'Il faut ' + b0.min + ' ou ' + b0.max) + ' ateliers (tu en as mis ' + p.length + ').';
        return;
      }
      envoyer(cx, { parcours: p });
      cx.majEtatEnvoi(etatE, '✓ Enregistré. Tu peux encore modifier.');
    });
  }

  /* 3 — Par atelier : ta table, ton groupe */
  function e3(s, cx) {
    var g = monGroupe(cx), b = cx.bloc(); s.appendChild(b);
    if (!g) { b.appendChild(el('p', { class: 'muet', style: 'text-align:center;font-size:1.2rem' }, '🧩 Les groupes arrivent…')); return; }
    b.appendChild(el('div', { class: 'table-geante' }, el('div', { class: 'muet' }, 'Va à la'), el('div', { class: 'n' }, 'TABLE ' + g.n)));
    if (g.symbole) b.appendChild(el('div', { class: 'symbole-geant petit' }, g.symbole));
    b.appendChild(el('p', { class: 'consigne-geante' }, g.titre));
    b.appendChild(el('p', { class: 'mission-texte', style: 'text-align:center' }, EMC.riche(rc(cx).groupe_consigne || '')));
  }

  /* Les post-it d'une liste, rangés en trois colonnes (fait · appris ·
     liberté). opts.retirer : l'élève peut retirer les siens. */
  function colonnes(cx, l, opts) {
    var r = rc(cx), sortes = r.postits || [];
    return el('div', { class: 'mur-colonnes' }, sortes.map(function (so) {
      var miens = l.filter(function (x) { return x.sorte === so.sorte; });
      return el('div', { class: 'mur-colonne' }, el('h3', { style: 'background:' + so.couleur }, so.titre + (miens.length ? ' · ' + miens.length : '')),
        miens.map(function (x) {
          return el('div', { class: 'postit' + (x.masque ? ' masque' : ''), style: 'background:' + so.couleur },
            x.texte,
            opts && opts.retirer && x.eleve_id === cx.S.eleveId ? el('button', { type: 'button', class: 'retirer', title: 'Retirer mon post-it', onclick: function () { opts.retirer(x); } }, '✕') : null);
        }));
    }));
  }

  /* 4 — Le mur : trois colonnes côte à côte, chacune son champ et son
     « Poster » (Loïc, 08/11). Puis chaque groupe passe au tableau. */
  function e4(s, cx) {
    var r = rc(cx), g = monGroupe(cx);
    if (g && etat(cx).oral === g.n) {
      s.appendChild(el('div', { class: 'a-vous' }, el('div', { class: 'a-vous-icone' }, '🎤'),
        el('div', null, el('b', null, 'C’est à votre groupe de présenter !'), el('span', null, 'Une minute, au tableau, tous ensemble : couleur par couleur.'))));
    }
    s.appendChild(encadre(EMC.riche(r.mur_consigne || '')));
    if (!g) { var v = cx.bloc(); v.appendChild(el('p', { class: 'muet' }, 'Tu n’as pas encore de groupe : lève la main.')); s.appendChild(v); return; }
    s.appendChild(el('h2', { class: 'mur-titre' }, 'Table ' + g.n + ' · ' + (g.symbole ? g.symbole + ' ' : '') + g.titre));
    var saisie = el('div', { class: 'mur-saisie' });
    (r.postits || []).forEach(function (so) {
      var t = el('textarea', { rows: '3', maxlength: '140', 'aria-label': so.titre, placeholder: 'Une idée par post-it (140 caractères)' });
      var etatE = el('p', { class: 'etat-envoi', role: 'status', 'aria-live': 'polite' });
      var env = el('button', { type: 'button', class: 'primaire' }, '📌 Poster');
      env.addEventListener('click', function () {
        var x = t.value.trim();
        if (!x) { etatE.className = 'etat-envoi err'; etatE.textContent = 'Écris d’abord ton idée.'; return; }
        env.disabled = true;
        EMC.ecrire('emc_postits', { id: EMC.uuid(), classe_id: cx.S.classe, eleve_id: cx.S.eleveId, groupe: g.n, sorte: so.sorte, texte: x.slice(0, 140) })
          .then(function () { t.value = ''; etatE.className = 'etat-envoi ok'; etatE.textContent = '✓ Posté !'; env.disabled = false; relire(); },
                function (e) { env.disabled = false; etatE.className = 'etat-envoi err'; etatE.textContent = EMC.horsLigne(e) ? 'Pas de réseau : réessaie.' : EMC.message(e); });
      });
      saisie.appendChild(el('div', { class: 'mur-case', style: 'border-top:8px solid ' + so.couleur }, el('h3', null, so.titre), t, env, etatE));
    });
    s.appendChild(saisie);
    s.appendChild(el('h3', { class: 'tresmuet', style: 'margin:1rem 0 .3rem' }, 'Les post-it de votre groupe'));
    var mur = el('div'); s.appendChild(mur);
    function relire() {
      return EMC.lire('emc_postits?select=id,eleve_id,groupe,sorte,texte,masque&classe_id=eq.' + cx.S.classe + '&groupe=eq.' + g.n + '&order=cree_le').then(function (l) {
        mur.innerHTML = '';
        mur.appendChild(colonnes(cx, l, { retirer: function (x) {
          EMC.supprimer('emc_postits?id=eq.' + x.id).then(relire, function (e) { cx.toast(EMC.message(e), 'err'); });
        } }));
      }, function () {});
    }
    relire();
    var iv = setInterval(function () { if (!document.hidden) relire(); }, 4000);
    cx.enQuittant(function () { clearInterval(iv); });
  }

  /* 5 — Ma définition : elle s'écrit SUR LE LIVRET papier, pas sur le
     site (Loïc, 12/11) : la tablette ne montre que la consigne. */
  function e5(s, cx) {
    var r = rc(cx), b = cx.bloc(); s.appendChild(b);
    b.appendChild(el('div', { class: 'symbole-geant petit' }, '📖'));
    b.appendChild(el('p', { class: 'consigne-geante' }, 'Sur ton livret'));
    b.appendChild(el('p', { class: 'mission-texte', style: 'text-align:center' },
      EMC.riche(r.definition_consigne || 'Sur ton livret : écris une toute nouvelle définition de la liberté, nourrie des ateliers. Ne recopie pas celle du début.')));
  }
  /* ---------- 6 — Le retour sur les deux jours (anonyme) ---------- */
  /* Une rangée de boutons, un seul choisi (re-toucher le retire). */
  function choix(options, lib) {
    var val = null;
    var g = el('div', { class: 'retour-choix', role: 'group', 'aria-label': lib });
    var bts = options.map(function (o) {
      var b = el('button', { type: 'button', 'aria-pressed': 'false', title: o.l || o.v },
        o.e ? el('span', { class: 'e', 'aria-hidden': 'true' }, o.e) : null, el('span', null, o.l || String(o.v)));
      b.addEventListener('click', function () { val = val === o.v ? null : o.v; bts.forEach(function (x, i) { x.setAttribute('aria-pressed', options[i].v === val ? 'true' : 'false'); }); });
      g.appendChild(b); return b;
    });
    return { n: g, val: function () { return val; } };
  }
  function question(titre, champ) { return el('div', { class: 'retour-q' }, el('div', { class: 'retour-lib' }, titre), champ); }
  function zone(max, place) { return el('textarea', { rows: '2', maxlength: String(max), placeholder: place || '' }); }
  var notes = function (lib) { return choix(NOTES.map(function (x) { return { v: x.v, e: x.e, l: x.l }; }), lib); };
  var mots = function (l, lib) { return choix(l.map(function (x) { return { v: x, l: x }; }), lib); };

  function blocAtelier(cx, q, a, rang) {
    var at = (rc(cx).ateliers || []).filter(function (x) { return a.ref && x.n === a.ref; })[0];
    var titre = at ? (at.nom || at.enseignants) : a.atelier;
    var n = notes(q.atelier_note), s = mots(SERT, q.atelier_sert), c = mots(COMPRIS, q.atelier_compris), t = zone(300, q.atelier_texte);
    var b = el('div', { class: 'retour-atelier' },
      el('h4', null, el('span', { class: 'retour-rang' }, String(rang)), titre, at && at.nom && at.enseignants ? el('span', { class: 'tresmuet' }, ' — ' + at.enseignants) : null),
      question(q.atelier_note, n.n), question(q.atelier_sert, s.n), question(q.atelier_compris, c.n), question(q.atelier_texte, t));
    return { n: b, lire: function () {
      return { ref: a.ref || null, cle: a.ref ? 'ref:' + a.ref : EMC.normaliserMot(a.atelier), titre: String(titre || '').slice(0, 60), rang: rang,
               note: n.val(), sert: s.val(), compris: c.val(), texte: t.value.trim().slice(0, 300) || null };
    } };
  }

  function e6(s, cx) {
    var r = rc(cx), q = Object.assign({}, RETOUR, r.retour || {});
    var cleFaite = 'emc.retour.' + cx.S.classe, b = cx.bloc(); s.appendChild(b);
    if (cx.relire(cleFaite)) {
      b.appendChild(el('h2', null, 'Merci pour ton retour 🙏'));
      b.appendChild(el('p', null, 'Tes réponses ont bien été envoyées, de façon anonyme.'));
    } else {
      b.appendChild(el('div', { class: 'encadre' }, el('b', null, '🔒 Anonyme. '), q.intro));
      /* A — ces deux jours */
      var gr = notes(q.ressenti_question), ga = mots(APPRIS, q.appris_question), gp = zone(500, 'Ce qu\'on pourrait changer, ajouter, garder…');
      b.appendChild(el('h3', { class: 'retour-titre' }, q.global_titre));
      b.appendChild(question(q.ressenti_question, gr.n)); b.appendChild(question(q.appris_question, ga.n)); b.appendChild(question(q.proposition_question, gp));
      /* B — chaque atelier fait (ceux de l'étape 2) */
      b.appendChild(el('h3', { class: 'retour-titre' }, q.ateliers_titre));
      var parcours = (maLigne(cx).parcours || []).filter(function (a) { return a.atelier; });
      var zAt = el('div'); b.appendChild(zAt);
      var blocs = [];
      function ajouter(a) { var x = blocAtelier(cx, q, a, blocs.length + 1); blocs.push(x); zAt.appendChild(x.n); }
      parcours.forEach(ajouter);
      /* sans parcours (étape 2 manquée) : on choisit ici ses ateliers */
      var liste = rc(cx).ateliers || [];
      if (!parcours.length) {
        zAt.appendChild(el('p', { class: 'tresmuet' }, 'Tu n\'as pas indiqué tes ateliers à l\'étape 2 : ajoute ceux que tu as faits.'));
        if (liste.length) {
          var sel = el('select', { 'aria-label': 'Ajouter un atelier' }, el('option', { value: '' }, '➕ Ajouter un atelier que j\'ai fait'),
            liste.map(function (a) { return el('option', { value: a.n }, libelleAtelier(a)); }));
          sel.addEventListener('change', function () {
            var a = liste.filter(function (x) { return String(x.n) === sel.value; })[0];
            if (a && blocs.length < bornes(cx).max) { ajouter({ ref: a.n, atelier: a.nom || a.enseignants }); sel.querySelector('option[value="' + a.n + '"]').disabled = true; }
            sel.value = ''; sel.disabled = blocs.length >= bornes(cx).max;
          });
          b.appendChild(sel);
        }
      }
      /* C — le jeu de rôle, D — cette séance */
      var jn = notes(q.jdr_titre), jt = zone(300, q.texte_question), rn = notes(q.restit_titre), rt = zone(300, q.texte_question);
      b.appendChild(el('h3', { class: 'retour-titre' }, q.jdr_titre)); b.appendChild(question(q.atelier_note, jn.n)); b.appendChild(question(q.texte_question, jt));
      b.appendChild(el('h3', { class: 'retour-titre' }, q.restit_titre)); b.appendChild(question(q.atelier_note, rn.n)); b.appendChild(question(q.texte_question, rt));
      var etatE = el('p', { class: 'etat-envoi', role: 'status', 'aria-live': 'polite' });
      var env = el('button', { type: 'button', class: 'primaire' }, '📨 Envoyer mon retour (anonyme)');
      b.appendChild(env); b.appendChild(etatE);
      b.appendChild(el('p', { class: 'tresmuet' }, 'Une seule fois : relis-toi avant d\'envoyer. Rien ne relie tes réponses à ton identifiant.'));
      env.addEventListener('click', function () {
        var rep = { v: 1,
          global: { ressenti: gr.val(), appris: ga.val(), proposition: gp.value.trim().slice(0, 500) || null },
          ateliers: blocs.map(function (x) { return x.lire(); }),
          jdr: { note: jn.val(), texte: jt.value.trim().slice(0, 300) || null },
          restit: { note: rn.val(), texte: rt.value.trim().slice(0, 300) || null } };
        var rien = rep.global.ressenti == null && !rep.global.proposition && rep.jdr.note == null && rep.restit.note == null
          && !rep.ateliers.some(function (a) { return a.note != null || a.texte; });
        if (rien) { etatE.className = 'etat-envoi err'; etatE.textContent = 'Réponds au moins à une question.'; return; }
        env.disabled = true; etatE.className = 'etat-envoi att'; etatE.textContent = 'Envoi…';
        EMC.rpc('emc_repondre_enquete', { p_classe: cx.S.classe, p_reponses: rep, p_temoignage: null }).then(function () {
          cx.stocker(cleFaite, '1'); cx.rafraichir();
        }, function (e) {
          env.disabled = false; etatE.className = 'etat-envoi err';
          etatE.textContent = EMC.horsLigne(e) ? 'Pas de réseau : réessaie dans un instant.' : /COMPLETE/.test(String(e && e.message)) ? 'Toutes les réponses sont déjà arrivées.' : EMC.message(e);
        });
      });
    }
    /* l'expression libre, pour finir : le nuage au tableau */
    var c = cx.bloc(); s.appendChild(c);
    var t = el('textarea', { id: 'r-expr', rows: '2', maxlength: '120', placeholder: 'Un mot ou une phrase' });
    t.value = maLigne(cx).expression || '';
    var e3b = el('p', { class: 'etat-envoi', role: 'status' });
    var b3 = el('button', { type: 'button', class: 'primaire' }, 'Envoyer');
    c.appendChild(el('label', { for: 'r-expr' }, '💬 ' + (r.expression_question || 'Ces deux jours, en un mot ou une phrase.')));
    c.appendChild(t); c.appendChild(b3); c.appendChild(e3b);
    c.appendChild(el('p', { class: 'tresmuet' }, 'Facultatif. Affiché sans ton nom, dans le nuage au tableau.'));
    b3.addEventListener('click', function () {
      var x = t.value.trim();
      if (!x) { e3b.className = 'etat-envoi err'; e3b.textContent = 'C\'est facultatif : rien à envoyer.'; return; }
      envoyer(cx, { expression: x.slice(0, 120) });
      cx.majEtatEnvoi(e3b, '✓ Envoyé. Regarde le nuage !');
    });
    var m = cx.bloc(); s.appendChild(m);
    m.appendChild(el('h2', null, (r.merci || 'Merci !') + ' 🙏'));
    m.appendChild(el('p', null, 'Si tu as besoin d\'en parler, tu peux aller voir la CPE, l\'infirmière, ou un professeur.'));
  }


  EMC.Modules.restitution = {
    titre: 'Nos libertés',
    cleEtapes: 'etapes_restitution',
    sansBandeau: true,                 /* pas de numéros d'urgence ici (Loïc, 08/11) */
    etapes: [e0, e1, e2, e3, e4, e5, e6],
    demarrer: function (cx) {
      try { var m = JSON.parse(localStorage.getItem('emc.restit.moi.' + cx.S.classe) || 'null'); if (m) R.moi = m; } catch (e) {}
      if (!R.moi) EMC.lire('emc_restit?select=parcours,mot,expression&classe_id=eq.' + cx.S.classe).then(function (l) {
        if (l && l[0] && !R.moi) { R.moi = { parcours: l[0].parcours || [], mot: l[0].mot, expression: l[0].expression }; if (cx.S.seance && [2, 6].indexOf(cx.S.seance.etape) >= 0) cx.rafraichir(); }
      }, function () {});
    },
    badge: function (cx) {
      var g = monGroupe(cx);
      return g ? el('span', { class: 'pastille table grande-table symbole-badge', title: g.titre }, (g.symbole ? g.symbole + ' ' : '') + 'T' + g.n) : el('span', { class: 'pastille grande-table' }, '🗽');
    },
    majSeance: function (cx, avant, ligne) {
      var a = avant.etat || {}, b = ligne.etat || {};
      var groupes = JSON.stringify([a.affectations, a.groupes]) !== JSON.stringify([b.affectations, b.groupes]);
      if (groupes) cx.rendreBarre();
      /* à l'étape 4, on ne redessine (et ne vide la saisie) que si le
         groupe change, ou si le tour de parole arrive ou quitte MON
         groupe : le passage des autres ne touche pas ma tablette */
      var g = (b.affectations || {})[cx.S.eleveId];
      var monTour = (a.oral === g) !== (b.oral === g);
      if ((ligne.etape === 3 && groupes) || (ligne.etape === 4 && (groupes || monTour))) cx.rafraichir();
    },
    quitter: function (cx) { try { localStorage.removeItem('emc.restit.moi.' + cx.S.classe); } catch (e) {} }
  };
})(window);
