/* ============================================================
 *  emc-restitution.js — la restitution avec la 2nde 1, côté élève
 *  (module 'restitution' de emc/index.html, 034 §5b).
 *
 *  8 étapes, 75 min : 0 connexion · 1 météo des deux jours (émojis)
 *  · 2 mon parcours (ateliers ÉCRITS librement, mot-clé, liberté)
 *  · 3 par atelier (son groupe, posé par le prof) · 4 le mur de
 *  post-it « Nos libertés » (3 colonnes) · 5 analyse du mur, tous
 *  ensemble · 6 ma définition (un mot, une phrase) · 7 expression
 *  libre (nuage) et clôture.
 *  Décisions de Loïc (08/11) : pas de liste des ateliers des
 *  collègues ; un mur de post-it pour la production commune.
 * ============================================================ */
(function (global) {
  'use strict';
  var EMC = global.EMC, el = EMC.el;
  EMC.Modules = EMC.Modules || {};
  var R = { moi: null };

  function rc(cx) { return cx.contenu('restitution') || { libertes: [], postits: [] }; }
  function encadre(t, g) { return el('div', { class: 'encadre' + (g ? ' ' + g : '') }, t); }
  function etat(cx) { return (cx.S.seance && cx.S.seance.etat) || {}; }
  function monGroupe(cx) {
    var n = (etat(cx).affectations || {})[cx.S.eleveId];
    if (!n) return null;
    return (etat(cx).groupes || []).filter(function (g) { return g.n === n; })[0] || { n: n, titre: 'Groupe ' + n, symbole: '' };
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

  /* 2 — Mon parcours. Les ateliers se CHOISISSENT dans la liste des
     contenus (enseignants et salle : on s'y retrouve), sinon
     s'écrivent ; puis un mot-clé et la liberté en jeu. Sans liste
     réglée, on écrit tout. */
  function libelleAtelier(a) {
    if (!a) return '';
    return (a.nom ? '« ' + a.nom + ' » — ' : '') + (a.enseignants || '') + (a.salle ? ' · ' + a.salle : '');
  }
  function e2(s, cx) {
    var r = rc(cx), max = r.parcours_max || 6, liste = r.ateliers || [];
    s.appendChild(encadre(r.parcours_consigne || ''));
    var b = cx.bloc(); s.appendChild(b);
    var lignes = el('div', { class: 'parcours' }); b.appendChild(lignes);
    b.appendChild(el('datalist', { id: 'libertes' }, (r.libertes || []).map(function (x) { return el('option', { value: x }); })));
    var ajout = el('button', { type: 'button' }, '➕ Un autre atelier');
    var etatE = el('p', { class: 'etat-envoi', role: 'status', 'aria-live': 'polite' });
    var env = el('button', { type: 'button', class: 'primaire' }, 'Enregistrer mon parcours');
    b.appendChild(el('div', { class: 'rangee', style: 'margin-top:.6rem' }, ajout, env));
    b.appendChild(etatE);
    var donnees = (maLigne(cx).parcours || []).map(function (d) { return Object.assign({}, d); });
    if (!donnees.length) donnees = [{}, {}];
    function rendre() {
      lignes.innerHTML = '';
      donnees.forEach(function (d, i) {
        var champs = [el('span', { class: 'num-atelier' }, String(i + 1))];
        var libre = el('input', { type: 'text', maxlength: '60', value: d.ref ? '' : (d.atelier || ''), 'aria-label': 'Atelier ' + (i + 1) + ', écrit',
          placeholder: liste.length ? 'Ou écris son nom' : 'L\'atelier (ex. débat sur les réseaux)' });
        libre.addEventListener('input', function () { d.ref = null; d.atelier = libre.value; if (sel) sel.value = ''; });
        var sel = null;
        if (liste.length) {
          sel = el('select', { 'aria-label': 'Atelier ' + (i + 1) });
          sel.appendChild(el('option', { value: '' }, '— Choisis l\'atelier —'));
          liste.forEach(function (a) { sel.appendChild(el('option', { value: a.n, selected: d.ref === a.n || null }, libelleAtelier(a))); });
          sel.addEventListener('change', function () {
            var a = liste.filter(function (x) { return String(x.n) === sel.value; })[0];
            d.ref = a ? a.n : null; d.atelier = a ? (a.nom || a.enseignants) : ''; libre.value = '';
          });
          champs.push(sel);
        }
        champs.push(libre);
        var m = el('input', { type: 'text', maxlength: '30', placeholder: 'Un mot-clé', value: d.mot || '', 'aria-label': 'Mot-clé ' + (i + 1) });
        var l = el('input', { type: 'text', maxlength: '60', list: 'libertes', placeholder: 'La liberté en jeu (choisis ou écris)', value: d.liberte || '', 'aria-label': 'Liberté ' + (i + 1) });
        m.addEventListener('input', function () { d.mot = m.value; });
        l.addEventListener('input', function () { d.liberte = l.value; });
        champs.push(m, l);
        lignes.appendChild(el('div', { class: 'parcours-ligne' + (liste.length ? ' avec-liste' : '') }, champs));
      });
      ajout.disabled = donnees.length >= max;
    }
    rendre();
    ajout.addEventListener('click', function () { if (donnees.length < max) { donnees.push({}); rendre(); } });
    if ((maLigne(cx).parcours || []).length) { etatE.className = 'etat-envoi ok'; etatE.textContent = '✓ Enregistré. Tu peux encore modifier.'; }
    env.addEventListener('click', function () {
      var p = donnees.map(function (d) {
        var x = { atelier: String(d.atelier || '').trim().slice(0, 60), mot: String(d.mot || '').trim().slice(0, 30), liberte: String(d.liberte || '').trim().slice(0, 60) };
        if (d.ref) x.ref = d.ref;
        return x;
      }).filter(function (d) { return d.atelier; });
      if (!p.length) { etatE.className = 'etat-envoi err'; etatE.textContent = 'Choisis ou écris au moins un atelier.'; return; }
      envoyer(cx, { parcours: p });
      cx.majEtatEnvoi(etatE, '✓ Enregistré. Tu peux encore modifier.');
    });
  }

  /* 3 — Par atelier : retrouve ton groupe */
  function e3(s, cx) {
    var g = monGroupe(cx), b = cx.bloc(); s.appendChild(b);
    if (!g) { b.appendChild(el('p', { class: 'muet', style: 'text-align:center;font-size:1.2rem' }, '🧩 Les groupes arrivent…')); return; }
    if (g.symbole) b.appendChild(el('div', { class: 'symbole-geant petit' }, g.symbole));
    b.appendChild(el('p', { class: 'consigne-geante' }, g.titre));
    b.appendChild(el('p', { class: 'mission-texte', style: 'text-align:center' }, rc(cx).groupe_consigne || ''));
  }

  /* Les post-it d'une liste, rangés en trois colonnes (fait · appris ·
     liberté). opts.retirer : l'élève peut retirer les siens ;
     opts.symboles : montrer le symbole du groupe sur chaque post-it. */
  function colonnes(cx, l, opts) {
    var r = rc(cx), sortes = r.postits || [];
    var groupes = {}; (etat(cx).groupes || []).forEach(function (g) { groupes[g.n] = g; });
    return el('div', { class: 'mur-colonnes' }, sortes.map(function (so) {
      var miens = l.filter(function (x) { return x.sorte === so.sorte; });
      return el('div', { class: 'mur-colonne' }, el('h3', { style: 'background:' + so.couleur }, so.titre + (miens.length ? ' · ' + miens.length : '')),
        miens.map(function (x) {
          return el('div', { class: 'postit' + (x.masque ? ' masque' : ''), style: 'background:' + so.couleur },
            opts && opts.symboles && groupes[x.groupe] ? el('span', { class: 'postit-groupe', title: groupes[x.groupe].titre }, groupes[x.groupe].symbole + ' ') : null,
            x.texte,
            opts && opts.retirer && x.eleve_id === cx.S.eleveId ? el('button', { type: 'button', class: 'retirer', title: 'Retirer mon post-it', onclick: function () { opts.retirer(x); } }, '✕') : null);
        }));
    }));
  }

  /* 4 — Le mur : trois colonnes côte à côte, chacune son champ et son
     « Poster » (Loïc, 08/11 : choisir d'abord la sorte, c'était trop
     indirect). */
  function e4(s, cx) {
    var r = rc(cx), g = monGroupe(cx);
    if (g && etat(cx).oral === g.n) {
      s.appendChild(el('div', { class: 'a-vous' }, el('div', { class: 'a-vous-icone' }, '🎤'),
        el('div', null, el('b', null, 'C’est à votre groupe de présenter !'), el('span', null, 'Une minute, au tableau, tous ensemble.'))));
    }
    s.appendChild(encadre(EMC.riche(r.mur_consigne || '')));
    if (!g) { var v = cx.bloc(); v.appendChild(el('p', { class: 'muet' }, 'Tu n’as pas encore de groupe : lève la main.')); s.appendChild(v); return; }
    s.appendChild(el('h2', { class: 'mur-titre' }, (g.symbole ? g.symbole + ' ' : '') + g.titre));
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

  /* 5 — Analyse du mur, tous ensemble : tous les post-it de tous les
     groupes, rangés par colonne (comme au tableau). */
  function eAnalyse(s, cx) {
    var r = rc(cx);
    s.appendChild(encadre(el('span', null, '🔎 ', EMC.riche(r.analyse_consigne || 'Quelles libertés reviennent d’un atelier à l’autre ?')), 'orange'));
    var mur = el('div'); s.appendChild(mur);
    function relire() {
      return EMC.lire('emc_postits?select=id,eleve_id,groupe,sorte,texte,masque&classe_id=eq.' + cx.S.classe + '&masque=eq.false&order=cree_le').then(function (l) {
        mur.innerHTML = '';
        mur.appendChild(colonnes(cx, l, { symboles: true }));
      }, function () {});
    }
    relire();
    var iv = setInterval(function () { if (!document.hidden) relire(); }, 6000);
    cx.enQuittant(function () { clearInterval(iv); });
  }

  /* 6 — Ma définition : un mot, puis une phrase */
  function e5(s, cx) {
    var r = rc(cx), b = cx.bloc(); s.appendChild(b);
    var mot = el('input', { type: 'text', id: 'r-mot', maxlength: '30', value: maLigne(cx).mot || '' });
    var e1b = el('p', { class: 'etat-envoi', role: 'status' });
    var b1 = el('button', { type: 'button', class: 'primaire' }, 'Envoyer mon mot');
    b.appendChild(el('label', { for: 'r-mot' }, '1. ' + (r.mot_question || 'La liberté, en un mot ?')));
    b.appendChild(mot); b.appendChild(b1); b.appendChild(e1b);
    var c = cx.bloc(); s.appendChild(c);
    var def = el('textarea', { id: 'r-def', rows: '3', maxlength: '300', placeholder: r.definition_question || '' });
    var e2b = el('p', { class: 'etat-envoi', role: 'status' });
    var b2 = el('button', { type: 'button', class: 'primaire' }, 'Envoyer ma définition');
    c.appendChild(el('label', { for: 'r-def' }, '2. ' + (r.definition_question || 'Pour moi, la liberté, c\'est…')));
    c.appendChild(def); c.appendChild(b2); c.appendChild(e2b);
    c.appendChild(el('p', { class: 'tresmuet' }, 'Affichée sans ton nom, après relecture par le professeur.'));
    b1.addEventListener('click', function () {
      var x = mot.value.trim();
      if (!x) { e1b.className = 'etat-envoi err'; e1b.textContent = 'Écris un mot.'; return; }
      envoyer(cx, { mot: x.slice(0, 30) });
      cx.majEtatEnvoi(e1b, '✓ Envoyé. Regarde le nuage !');
    });
    EMC.lire('emc_mur?select=texte,statut&sorte=eq.definition&classe_id=eq.' + cx.S.classe).then(function (l) {
      if (!l || !l[0]) return;
      def.value = l[0].texte;
      if (l[0].statut !== 'propose') { def.disabled = true; b2.disabled = true; e2b.className = 'etat-envoi ok'; e2b.textContent = '✓ Relue par le professeur.'; }
    }, function () {});
    b2.addEventListener('click', function () {
      var x = def.value.trim();
      if (!x) { e2b.className = 'etat-envoi err'; e2b.textContent = 'Écris ta définition.'; return; }
      EMC.ecrire('emc_mur?on_conflict=classe_id,eleve_id,sorte', { classe_id: cx.S.classe, eleve_id: cx.S.eleveId, sorte: 'definition', texte: x.slice(0, 300) }, { fusion: true })
        .then(function () { e2b.className = 'etat-envoi ok'; e2b.textContent = '✓ Envoyée. Tu peux la corriger tant qu\'elle n\'est pas relue.'; },
              function (e) { e2b.className = 'etat-envoi err'; e2b.textContent = EMC.horsLigne(e) ? 'Pas de réseau : réessaie.' : 'Déjà relue : elle ne se modifie plus.'; });
    });
  }

  /* 7 — Expression libre (un mot, une phrase : le nuage), et merci */
  function e6(s, cx) {
    var r = rc(cx), c = cx.bloc(); s.appendChild(c);
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
    var b = cx.bloc(); s.appendChild(b);
    b.appendChild(el('h2', null, (r.merci || 'Merci !') + ' 🙏'));
    b.appendChild(el('p', null, 'Si tu as besoin d\'en parler, tu peux aller voir la CPE, l\'infirmière, ou un professeur.'));
  }


  EMC.Modules.restitution = {
    titre: 'Nos libertés',
    cleEtapes: 'etapes_restitution',
    sansBandeau: true,                 /* pas de numéros d'urgence ici (Loïc, 08/11) */
    etapes: [e0, e1, e2, e3, e4, eAnalyse, e5, e6],
    demarrer: function (cx) {
      try { var m = JSON.parse(localStorage.getItem('emc.restit.moi.' + cx.S.classe) || 'null'); if (m) R.moi = m; } catch (e) {}
      if (!R.moi) EMC.lire('emc_restit?select=parcours,mot,expression&classe_id=eq.' + cx.S.classe).then(function (l) {
        if (l && l[0] && !R.moi) { R.moi = { parcours: l[0].parcours || [], mot: l[0].mot, expression: l[0].expression }; if (cx.S.seance && [2, 6, 7].indexOf(cx.S.seance.etape) >= 0) cx.rafraichir(); }
      }, function () {});
    },
    badge: function (cx) {
      var g = monGroupe(cx);
      return g && g.symbole ? el('span', { class: 'pastille table grande-table symbole-badge', title: g.titre }, g.symbole) : el('span', { class: 'pastille grande-table' }, '🗽');
    },
    majSeance: function (cx, avant, ligne) {
      var a = avant.etat || {}, b = ligne.etat || {};
      var groupes = JSON.stringify([a.affectations, a.groupes]) !== JSON.stringify([b.affectations, b.groupes]);
      if (groupes) cx.rendreBarre();
      /* à l'étape 4, on ne redessine (et ne vide la saisie) que si le
         groupe ou le tour de parole change */
      if ((ligne.etape === 3 && groupes) || (ligne.etape === 4 && (groupes || a.oral !== b.oral))) cx.rafraichir();
    },
    quitter: function (cx) { try { localStorage.removeItem('emc.restit.moi.' + cx.S.classe); } catch (e) {} }
  };
})(window);
