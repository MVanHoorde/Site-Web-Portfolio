/* ============================================================
 *  emc-restitution.js — la restitution avec la 2nde 1, côté élève
 *  (module 'restitution' de emc/index.html, 034 §5b).
 *
 *  7 étapes, 75 min : 0 connexion · 1 météo des deux jours (émojis)
 *  · 2 mon parcours (ateliers ÉCRITS librement, mot-clé, liberté)
 *  · 3 par atelier (son groupe, posé par le prof) · 4 le mur de
 *  post-it « Nos libertés » · 5 ma définition (un mot, une phrase)
 *  · 6 clôture.
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
      corps: { classe_id: cx.S.classe, eleve_id: cx.S.eleveId, parcours: m.parcours, mot: m.mot || null } });
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

  /* 2 — Mon parcours : les ateliers, écrits librement */
  function e2(s, cx) {
    var r = rc(cx), max = r.parcours_max || 6;
    s.appendChild(encadre(r.parcours_consigne || ''));
    var b = cx.bloc(); s.appendChild(b);
    var lignes = el('div', { class: 'parcours' }); b.appendChild(lignes);
    var dl = el('datalist', { id: 'libertes' }, (r.libertes || []).map(function (x) { return el('option', { value: x }); }));
    b.appendChild(dl);
    var ajout = el('button', { type: 'button' }, '➕ Un autre atelier');
    var etatE = el('p', { class: 'etat-envoi', role: 'status', 'aria-live': 'polite' });
    var env = el('button', { type: 'button', class: 'primaire' }, 'Enregistrer mon parcours');
    b.appendChild(el('div', { class: 'rangee', style: 'margin-top:.6rem' }, ajout, env));
    b.appendChild(etatE);
    var donnees = (maLigne(cx).parcours || []).slice();
    if (!donnees.length) donnees = [{}, {}];
    function rendre() {
      lignes.innerHTML = '';
      donnees.forEach(function (d, i) {
        var a = el('input', { type: 'text', maxlength: '60', placeholder: 'L\'atelier (ex. débat sur les réseaux)', value: d.atelier || '', 'aria-label': 'Atelier ' + (i + 1) });
        var m = el('input', { type: 'text', maxlength: '30', placeholder: 'Un mot-clé', value: d.mot || '', 'aria-label': 'Mot-clé ' + (i + 1) });
        var l = el('input', { type: 'text', maxlength: '60', list: 'libertes', placeholder: 'La liberté en jeu (choisis ou écris)', value: d.liberte || '', 'aria-label': 'Liberté ' + (i + 1) });
        [a, m, l].forEach(function (x, k) { x.addEventListener('input', function () { d[['atelier', 'mot', 'liberte'][k]] = x.value; }); });
        lignes.appendChild(el('div', { class: 'parcours-ligne' }, el('span', { class: 'num-atelier' }, String(i + 1)), a, m, l));
      });
      ajout.disabled = donnees.length >= max;
    }
    rendre();
    ajout.addEventListener('click', function () { if (donnees.length < max) { donnees.push({}); rendre(); } });
    if ((maLigne(cx).parcours || []).length) { etatE.className = 'etat-envoi ok'; etatE.textContent = '✓ Enregistré. Tu peux encore modifier.'; }
    env.addEventListener('click', function () {
      var p = donnees.map(function (d) {
        return { atelier: String(d.atelier || '').trim().slice(0, 60), mot: String(d.mot || '').trim().slice(0, 30), liberte: String(d.liberte || '').trim().slice(0, 60) };
      }).filter(function (d) { return d.atelier; });
      if (!p.length) { etatE.className = 'etat-envoi err'; etatE.textContent = 'Écris au moins un atelier.'; return; }
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

  /* 4 — Le mur de post-it */
  function e4(s, cx) {
    var r = rc(cx), g = monGroupe(cx);
    s.appendChild(encadre(r.mur_consigne || ''));
    if ((etat(cx).oral || null) && g && etat(cx).oral === g.n) s.appendChild(encadre(el('b', null, '🎤 C\'est à votre groupe de présenter !'), 'orange'));
    var b = cx.bloc(); s.appendChild(b);
    if (!g) { b.appendChild(el('p', { class: 'muet' }, 'Tu n\'as pas encore de groupe : lève la main.')); return; }
    b.appendChild(el('h2', null, (g.symbole ? g.symbole + ' ' : '') + g.titre));
    var sorte = (r.postits && r.postits[0] && r.postits[0].sorte) || 'fait';
    var choix = el('div', { class: 'sortes', role: 'group', 'aria-label': 'Sorte de post-it' });
    function rendreChoix() {
      choix.innerHTML = '';
      (r.postits || []).forEach(function (p) {
        var bt = el('button', { type: 'button', 'aria-pressed': p.sorte === sorte ? 'true' : 'false', style: 'background:' + p.couleur },
          p.titre);
        bt.addEventListener('click', function () { sorte = p.sorte; rendreChoix(); });
        choix.appendChild(bt);
      });
    }
    rendreChoix();
    var t = el('textarea', { rows: '2', maxlength: '140', 'aria-label': 'Ton post-it', placeholder: '140 caractères au plus' });
    var etatE = el('p', { class: 'etat-envoi', role: 'status', 'aria-live': 'polite' });
    var env = el('button', { type: 'button', class: 'primaire' }, '📌 Poster');
    b.appendChild(choix); b.appendChild(t); b.appendChild(env); b.appendChild(etatE);
    var mur = el('div', { class: 'mur-groupe' }); s.appendChild(mur);
    function couleur(so) { var p = (r.postits || []).filter(function (x) { return x.sorte === so; })[0]; return p ? p.couleur : '#fff'; }
    function relire() {
      return EMC.lire('emc_postits?select=id,eleve_id,groupe,sorte,texte,masque&classe_id=eq.' + cx.S.classe + '&groupe=eq.' + g.n + '&order=cree_le').then(function (l) {
        mur.innerHTML = '';
        if (!l.length) mur.appendChild(el('p', { class: 'tresmuet' }, 'Pas encore de post-it dans votre colonne.'));
        l.forEach(function (x) {
          var moi = x.eleve_id === cx.S.eleveId;
          mur.appendChild(el('div', { class: 'postit' + (x.masque ? ' masque' : ''), style: 'background:' + couleur(x.sorte) }, x.texte,
            moi ? el('button', { type: 'button', class: 'retirer', title: 'Retirer mon post-it', onclick: function () {
              EMC.supprimer('emc_postits?id=eq.' + x.id).then(relire, function (e) { cx.toast(EMC.message(e), 'err'); });
            } }, '✕') : null));
        });
      }, function () {});
    }
    relire();
    var iv = setInterval(function () { if (!document.hidden) relire(); }, 4000);
    cx.enQuittant(function () { clearInterval(iv); });
    env.addEventListener('click', function () {
      var x = t.value.trim();
      if (!x) { etatE.className = 'etat-envoi err'; etatE.textContent = 'Écris ton post-it.'; return; }
      env.disabled = true;
      EMC.ecrire('emc_postits', { id: EMC.uuid(), classe_id: cx.S.classe, eleve_id: cx.S.eleveId, groupe: g.n, sorte: sorte, texte: x.slice(0, 140) })
        .then(function () { t.value = ''; etatE.className = 'etat-envoi ok'; etatE.textContent = '✓ Posté !'; env.disabled = false; relire(); },
              function (e) { env.disabled = false; etatE.className = 'etat-envoi err'; etatE.textContent = EMC.horsLigne(e) ? 'Pas de réseau : réessaie.' : EMC.message(e); });
    });
  }

  /* 5 — Ma définition : un mot, puis une phrase */
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

  /* 6 — Clôture */
  function e6(s, cx) {
    var b = cx.bloc(); s.appendChild(b);
    b.appendChild(el('h2', null, (rc(cx).merci || 'Merci !') + ' 🙏'));
    b.appendChild(el('p', null, 'Si tu as besoin d\'en parler, tu peux aller voir la CPE, l\'infirmière, ou un professeur.'));
    var nz = el('div'); b.appendChild(nz);
    EMC.Vues.numerosDetailles(nz, cx.contenu('numeros') || EMC.NUMEROS_DEFAUT);
  }

  EMC.Modules.restitution = {
    titre: 'Nos libertés',
    cleEtapes: 'etapes_restitution',
    etapes: [e0, e1, e2, e3, e4, e5, e6],
    demarrer: function (cx) {
      try { var m = JSON.parse(localStorage.getItem('emc.restit.moi.' + cx.S.classe) || 'null'); if (m) R.moi = m; } catch (e) {}
      if (!R.moi) EMC.lire('emc_restit?select=parcours,mot&classe_id=eq.' + cx.S.classe).then(function (l) {
        if (l && l[0] && !R.moi) { R.moi = { parcours: l[0].parcours || [], mot: l[0].mot }; if (cx.S.seance && [2, 5].indexOf(cx.S.seance.etape) >= 0) cx.rafraichir(); }
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
