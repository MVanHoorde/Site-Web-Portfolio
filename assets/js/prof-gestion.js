/* ============================================================
 *  prof-gestion.js — la gestion du site entre collègues
 *  (11/11/2026, bdd/schema/038-gestion-collegues.sql)
 *
 *  Pour tout enseignant :
 *   · Suivi → « 👥 Gérer les élèves de la classe » : deux coches par
 *     élève. « Masquer » le retire de SON suivi (grille, absents) ;
 *     « À supprimer » prévient le gestionnaire, et masque en attendant.
 *   · Réglages → « Les onglets affichés » : les onglets qu'il ne veut
 *     pas voir (Réglages reste toujours là, pour revenir en arrière).
 *   · Le bouton ✉️ « Écrire à M. Van Hoorde » de la barre du haut, et
 *     les réponses ; la fenêtre « ✨ Nouveautés » (prof-nouveautes.js).
 *   Réglages en base (reglages_enseignant), donc sur tous ses
 *   appareils ; tant que le 038 n'est pas passé, sur l'appareil seul.
 *
 *  Pour le gestionnaire (Loïc, table gestionnaires) : l'onglet
 *  « Gestion » — comptes à supprimer (effacement, même partagé) et
 *  messages des collègues, avec réponse.
 *
 *  Branché par prof/index.html : ProfGestion.brancher({ … }) donne au
 *  module de quoi rafraîchir le suivi, les onglets et lire le contexte.
 *  Aucun nom d'élève ne part en base : le pseudonyme seul.
 * ============================================================ */
(function (global) {
  'use strict';

  var NOM_GESTIONNAIRE = 'M. Van Hoorde';
  var APPLI = 'cours';     /* clé de nouveautes_vues (Leitner a la sienne) */
  var ONGLETS = [
    { k: 'correction',   l: 'À corriger' },
    { k: 'seance',       l: 'Séance' },
    { k: 'suivi',        l: 'Suivi' },
    { k: 'signalements', l: 'Signalements' },
    { k: 'defi',         l: 'Défi S4' },
    { k: 'emc',          l: 'EMC' }
  ];
  var $ = function (s) { return document.querySelector(s); };
  var H = {};              /* les crochets posés par prof/index.html */
  var REG = { masques: {}, onglets: {}, vues: {}, enBase: false };
  var GEST = false;
  var MES_DEMANDES = {};   /* eleve_id → true : mes demandes de suppression */
  var minuteur = null;

  function esc(t) {
    return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function quand(s) {
    return s ? new Date(s).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(' ', ' à ') : '';
  }
  function jour(s) { return s ? new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' }) : ''; }
  function pasActive(e) { return /reglages_enseignant|demandes_suppression|messages_gestion|est_gestionnaire|gestion_|does not exist|schema cache|Could not find|PGRST20/i.test((e && e.message) || ''); }
  function moi() { return ProfAPI.monId(); }
  function nomDe(p) { return ProfAPI.nomDe(p); }
  function cleLocale() { return 'prof.reglages.' + moi(); }

  /* ============================================================
     Réglages
     ============================================================ */
  function versEnsemble(l) { var o = {}; (l || []).forEach(function (x) { o[x] = true; }); return o; }
  function lireReglages() {
    REG = { masques: {}, onglets: {}, vues: {}, enBase: false };
    return ProfAPI.lire('reglages_enseignant?select=eleves_masques,onglets_masques,nouveautes_vues&auth_id=eq.' + encodeURIComponent(moi()))
      .then(function (l) { REG.enBase = true; return l && l[0]; })
      .catch(function () {
        try { return JSON.parse(global.localStorage.getItem(cleLocale())); } catch (e) { return null; }
      })
      .then(function (r) {
        if (!r) return;
        REG.masques = versEnsemble(r.eleves_masques);
        REG.onglets = versEnsemble(r.onglets_masques);
        REG.vues = (r.nouveautes_vues && typeof r.nouveautes_vues === 'object') ? r.nouveautes_vues : {};
      });
  }
  function enregistrer() {
    clearTimeout(minuteur);
    minuteur = setTimeout(function () {
      var r = { eleves_masques: Object.keys(REG.masques), onglets_masques: Object.keys(REG.onglets), nouveautes_vues: REG.vues };
      try { global.localStorage.setItem(cleLocale(), JSON.stringify(r)); } catch (e) {}
      if (!REG.enBase) return;
      r.auth_id = moi(); r.maj_le = new Date().toISOString();
      ProfAPI.ecrire('reglages_enseignant', r, true).catch(function (e) {
        var z = $('#r-onglets-etat'); if (z) z.textContent = 'Réglage non enregistré en ligne : ' + (e.message || e);
      });
    }, 400);
  }

  function masque(id) { return !!(id && (REG.masques[id] || MES_DEMANDES[id])); }
  function ongletMasque(k) { return k !== 'reglages' && k !== 'gestion' && !!REG.onglets[k]; }

  function rendreOnglets() {
    var z = $('#r-onglets'); if (!z) return;
    z.innerHTML = ONGLETS.map(function (o) {
      return '<label style="display:inline-flex;gap:6px;align-items:center;margin:0 18px 8px 0;font-weight:400">' +
        '<input type="checkbox" data-onglet-vu="' + o.k + '"' + (REG.onglets[o.k] ? '' : ' checked') + '> ' + esc(o.l) + '</label>';
    }).join('');
    $('#r-onglets-etat').innerHTML = REG.enBase ? '' :
      'Réglage gardé sur cet appareil seulement : la mise à jour de la base (038) n’est pas encore passée.';
  }
  document.addEventListener('change', function (ev) {
    var c = ev.target;
    if (!c || !c.matches || !c.matches('#r-onglets input[data-onglet-vu]')) return;
    if (c.checked) delete REG.onglets[c.dataset.ongletVu]; else REG.onglets[c.dataset.ongletVu] = true;
    enregistrer();
    if (H.appliquerOnglets) H.appliquerOnglets();
  });

  /* ============================================================
     Suivi → Gérer les élèves de la classe
     ============================================================ */
  var DERNIERS = [];
  function rendreEleves(eleves) {
    DERNIERS = eleves || DERNIERS;
    var z = $('#g-gerer-liste'); if (!z) return;
    var tous = $('#g-gerer-tous').checked;
    var nbMasques = DERNIERS.filter(function (e) { return masque(e.id); }).length;
    $('#g-gerer-compte').textContent = DERNIERS.length ? '· ' + DERNIERS.length + ' élève' + (DERNIERS.length > 1 ? 's' : '') +
      (nbMasques ? ', dont ' + nbMasques + ' masqué' + (nbMasques > 1 ? 's' : '') : '') : '';
    if (!DERNIERS.length) { z.innerHTML = '<p class="muet">Aucun élève dans cette classe.</p>'; return; }
    /* deux pseudos, un même nom (table des noms chargée) : le doublon probable */
    var parNom = {};
    DERNIERS.forEach(function (e) {
      var n = nomDe(e.pseudo);
      if (n && n !== e.pseudo) { var k = n.toLowerCase(); (parNom[k] = parNom[k] || []).push(e.pseudo); }
    });
    var liste = DERNIERS.filter(function (e) { return tous || !masque(e.id); }).slice()
      .sort(function (a, b) { return nomDe(a.pseudo).localeCompare(nomDe(b.pseudo), 'fr'); });
    if (!liste.length) { z.innerHTML = '<p class="muet">Tous les élèves de cette classe sont masqués.</p>'; return; }
    z.innerHTML = '<div class="tableau-enveloppe"><table class="gst-table"><thead><tr><th>Élève</th>' +
      '<th class="c">Masquer</th><th class="c">À supprimer</th></tr></thead><tbody>' +
      liste.map(function (e) {
        var n = nomDe(e.pseudo), k = n.toLowerCase(), autres = (parNom[k] || []).filter(function (p) { return p !== e.pseudo; });
        return '<tr data-id="' + esc(e.id) + '" class="' + (REG.masques[e.id] ? 'gst-masque ' : '') + (MES_DEMANDES[e.id] ? 'gst-suppr' : '') + '">' +
          '<td><span class="gst-nom">' + esc(n) + '</span>' + (n !== e.pseudo ? ' <span class="tresmuet mono">' + esc(e.pseudo) + '</span>' : '') +
          (autres.length ? ' <span class="pastille comp">même nom que ' + esc(autres.join(', ')) + '</span>' : '') +
          (MES_DEMANDES[e.id] ? ' <span class="pastille comp">suppression demandée</span>' : '') + '</td>' +
          '<td class="c"><input type="checkbox" data-masquer aria-label="Masquer ' + esc(e.pseudo) + '"' + (REG.masques[e.id] ? ' checked' : '') + '></td>' +
          '<td class="c"><input type="checkbox" data-suppr aria-label="Demander la suppression de ' + esc(e.pseudo) + '"' + (MES_DEMANDES[e.id] ? ' checked' : '') + '></td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  function demanderSuppression(e) {
    var motif = global.prompt('Demander à ' + NOM_GESTIONNAIRE + ' de supprimer le compte « ' + e.pseudo + ' » ?\n\n' +
      'Pourquoi ? (facultatif — par exemple « doublon de plume24 », « élève parti ». Aucun nom d’élève.)', '');
    if (motif === null) return Promise.resolve(false);
    /* insertion simple : la base n'ouvre pas la modification d'une demande ;
       une demande déjà faite (clé en double) compte comme faite */
    return ProfAPI.ecrire('demandes_suppression', { eleve_id: e.id, demande_par: moi(), motif: motif.trim().slice(0, 300) || null }, false)
      .catch(function (err) { if (!/duplicate|23505|409/.test((err && err.message) || '')) throw err; })
      .then(function () { MES_DEMANDES[e.id] = true; return true; });
  }
  function retirerDemande(e) {
    return ProfAPI.supprimer('demandes_suppression?eleve_id=eq.' + encodeURIComponent(e.id) + '&demande_par=eq.' + encodeURIComponent(moi()))
      .then(function () { delete MES_DEMANDES[e.id]; });
  }
  function apresChangement() {
    rendreEleves();
    if (H.rafraichirSuivi) H.rafraichirSuivi();
  }
  document.addEventListener('change', function (ev) {
    var c = ev.target, tr = c && c.closest && c.closest('#g-gerer-liste tr[data-id]');
    if (c && c.id === 'g-gerer-tous') { rendreEleves(); return; }
    if (!tr) return;
    var e = DERNIERS.filter(function (x) { return x.id === tr.dataset.id; })[0]; if (!e) return;
    var etat = $('#g-gerer-etat');
    if (c.hasAttribute('data-masquer')) {
      if (c.checked) REG.masques[e.id] = true; else delete REG.masques[e.id];
      enregistrer(); apresChangement(); return;
    }
    if (!c.hasAttribute('data-suppr')) return;
    c.disabled = true;
    (c.checked ? demanderSuppression(e) : retirerDemande(e).then(function () { return true; }))
      .then(function (fait) {
        if (!fait) c.checked = false;
        etat.textContent = fait && c.checked ? 'Demande envoyée à ' + NOM_GESTIONNAIRE + '.' : '';
        apresChangement();
      })
      .catch(function (err) {
        c.checked = !c.checked;
        etat.textContent = pasActive(err) ? 'Pas encore possible : la mise à jour de la base (038) n’est pas passée.' : 'Échec : ' + (err.message || err);
      })
      .then(function () { c.disabled = false; });
  });

  /* ============================================================
     Onglet Gestion (gestionnaire seul)
     ============================================================ */
  var SUPPR = [], MSGS = [];
  function chargerGestion() {
    return Promise.all([
      ProfAPI.appeler('gestion_suppressions').then(function (l) { SUPPR = l || []; }).catch(function (e) { SUPPR = null; $('#gst-suppr').innerHTML = '<p class="muet">Erreur : ' + esc(e.message) + '</p>'; }),
      ProfAPI.appeler('gestion_messages').then(function (l) { MSGS = l || []; }).catch(function (e) { MSGS = null; $('#gst-msgs').innerHTML = '<p class="muet">Erreur : ' + esc(e.message) + '</p>'; })
    ]).then(rendreGestion);
  }
  function rendreGestion() {
    var nonLus = MSGS ? MSGS.filter(function (m) { return !m.lu_le; }).length : 0;
    var parEleve = {};
    (SUPPR || []).forEach(function (x) { (parEleve[x.eleve_id] = parEleve[x.eleve_id] || []).push(x); });
    var ids = Object.keys(parEleve);
    var total = nonLus + ids.length, n = $('#gst-n');
    if (n) { n.hidden = !total; n.textContent = total; }
    majBouton(nonLus);
    if (SUPPR) $('#gst-suppr').innerHTML = ids.length ? ids.map(function (id) {
      var l = parEleve[id], x = l[0], n2 = nomDe(x.pseudo);
      return '<div class="encadre gst-carte" data-id="' + esc(id) + '"><div><b>' + esc(n2) + '</b>' +
        (n2 !== x.pseudo ? ' <span class="tresmuet mono">' + esc(x.pseudo) + '</span>' : '') +
        ' <span class="tresmuet">· ' + esc((x.classes || []).join(' · ')) + '</span></div>' +
        '<div class="tresmuet">Enseignants : ' + esc((x.enseignants || []).join(', ') || '—') + ' · compte créé le ' + esc(jour(x.cree_le)) +
        ' · ' + (x.derniere_connexion ? 'dernière connexion le ' + esc(jour(x.derniere_connexion)) : 'jamais connecté') + '</div>' +
        l.map(function (d) { return '<p style="margin:6px 0 0">Demandé par <b>' + esc(d.demande_par) + '</b> le ' + esc(quand(d.demande_le)) + (d.motif ? ' : ' + esc(d.motif) : '') + '</p>'; }).join('') +
        '<div class="rangee" style="margin:10px 0 0"><button data-effacer style="color:var(--err)">Effacer définitivement</button>' +
        '<button data-ecarter>Écarter la demande</button></div></div>';
    }).join('') : '<p class="muet">Aucune demande de suppression.</p>';
    if (!MSGS) return;
    var tout = $('#gst-msgs-tout').checked, liste = tout ? MSGS : MSGS.filter(function (m) { return !m.lu_le; });
    $('#gst-msgs').innerHTML = liste.length ? liste.map(function (m) {
      return '<div class="encadre gst-carte' + (m.lu_le ? ' gst-lu' : '') + '" data-id="' + esc(m.id) + '"><div><b>' + esc(m.auteur) + '</b>' +
        ' <span class="tresmuet">· ' + esc(quand(m.cree_le)) + (m.ou ? ' · ' + esc(m.ou) : '') + '</span></div>' +
        '<p class="gst-texte">' + esc(m.message) + '</p>' +
        (m.reponse ? '<p class="gst-reponse"><b>Votre réponse</b> (' + esc(quand(m.repondu_le)) + ') : ' + esc(m.reponse) + '</p>' : '') +
        '<div class="gst-rep" hidden><textarea rows="3" maxlength="2000">' + esc(m.reponse || '') + '</textarea></div>' +
        '<div class="rangee" style="margin:10px 0 0"><button data-lu="' + (m.lu_le ? '0' : '1') + '">' + (m.lu_le ? 'Remettre non lu' : '✓ Lu') + '</button>' +
        '<button data-repondre>' + (m.reponse ? 'Modifier la réponse' : 'Répondre') + '</button>' +
        '<button data-suppr-msg>Supprimer</button></div></div>';
    }).join('') : '<p class="muet">Aucun message' + (tout ? '' : ' non lu') + '.</p>';
  }
  function brancherGestion() {
    $('#gst-msgs-tout').addEventListener('change', rendreGestion);
    $('#gst-recharger').addEventListener('click', chargerGestion);
    $('#gst-suppr').addEventListener('click', function (ev) {
      var b = ev.target.closest('button'), carte = ev.target.closest('.gst-carte'); if (!b || !carte) return;
      var id = carte.dataset.id, x = (SUPPR || []).filter(function (s) { return s.eleve_id === id; })[0] || {};
      var p;
      if (b.hasAttribute('data-effacer')) {
        if (!global.confirm('Effacer définitivement le compte « ' + x.pseudo + ' » ?\n\nTout son travail part avec, chez tous ses enseignants : ' +
          ((x.enseignants || []).join(', ') || '—') + '. C’est irréversible.')) return;
        p = ProfAPI.appeler('effacer_eleve_demande', { p_eleve: id }).then(function () {
          delete REG.masques[id]; enregistrer();
          if (H.rafraichirTout) H.rafraichirTout();
        });
      } else if (b.hasAttribute('data-ecarter')) {
        if (!global.confirm('Écarter la demande pour « ' + x.pseudo + ' » ? Le compte reste.')) return;
        p = ProfAPI.supprimer('demandes_suppression?eleve_id=eq.' + encodeURIComponent(id));
      }
      if (!p) return;
      b.disabled = true;
      p.then(chargerGestion).catch(function (e) { b.disabled = false; global.alert('Échec : ' + (e.message || e)); });
    });
    $('#gst-msgs').addEventListener('click', function (ev) {
      var b = ev.target.closest('button'), carte = ev.target.closest('.gst-carte'); if (!b || !carte) return;
      var chemin = 'messages_gestion?id=eq.' + encodeURIComponent(carte.dataset.id), p;
      if (b.dataset.lu) p = ProfAPI.modifier(chemin, { lu_le: b.dataset.lu === '1' ? new Date().toISOString() : null });
      else if (b.hasAttribute('data-repondre')) {
        var box = carte.querySelector('.gst-rep');
        if (box.hidden) { box.hidden = false; b.textContent = 'Envoyer la réponse'; box.querySelector('textarea').focus(); return; }
        p = ProfAPI.modifier(chemin, { reponse: box.querySelector('textarea').value.trim() || null });
      } else if (b.hasAttribute('data-suppr-msg')) {
        if (!global.confirm('Supprimer ce message ? Son auteur ne le verra plus non plus.')) return;
        p = ProfAPI.supprimer(chemin);
      }
      if (!p) return;
      b.disabled = true;
      p.then(chargerGestion).catch(function (e) { b.disabled = false; global.alert('Échec : ' + (e.message || e)); });
    });
  }

  /* ============================================================
     Bouton ✉️ et fenêtres
     ============================================================ */
  var CSS =
    'dialog.gst-dlg{border:0;border-radius:16px;padding:20px 22px;width:calc(100% - 32px);max-width:560px;max-height:calc(100% - 32px);overflow:auto;color:#161f33;background:#fff;box-shadow:0 24px 70px rgba(0,0,0,.35);font:inherit;font-size:15px;line-height:1.5}' +
    'dialog.gst-dlg::backdrop{background:rgba(13,20,36,.6)}' +
    '.gst-dlg h2{font-size:19px;margin:0 0 6px}.gst-dlg h3{font-size:15px;margin:18px 0 6px}.gst-dlg p{margin:0}' +
    '.gst-dlg textarea{display:block;width:100%;box-sizing:border-box;min-height:120px;font:inherit;font-size:16px;padding:9px 11px;border:1px solid #c7cfdd;border-radius:9px}' +
    '.gst-aide{font-size:13px;color:#4a566e;margin:6px 0 0}.gst-etat{min-height:1.5em;font-size:14px;margin:10px 0 0}.gst-etat.err{color:#b3261e}' +
    '.gst-actions{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap;margin-top:12px}' +
    '.gst-histo{border-top:1px solid #e3e8f0;padding:8px 0;font-size:14px}.gst-histo small{display:block;color:#4a566e;font-size:12.5px}' +
    '.gst-histo .q{white-space:pre-wrap;overflow-wrap:anywhere}.gst-histo .r{margin-top:6px;padding:8px 10px;border-radius:9px;background:#eef6f1;white-space:pre-wrap;overflow-wrap:anywhere}' +
    '.gst-histo .r.neuf{box-shadow:inset 3px 0 0 #12805c}' +
    '.gst-table{border-collapse:collapse;width:100%;font-size:14px}.gst-table th,.gst-table td{padding:7px 8px;border-bottom:1px solid var(--line,#d3dae7);text-align:left}' +
    '.gst-table .c{text-align:center;width:1%;white-space:nowrap}.gst-table input{width:20px;height:20px;cursor:pointer}' +
    '.gst-table tr.gst-masque td{opacity:.55}.gst-table tr.gst-suppr .gst-nom{text-decoration:line-through;text-decoration-color:var(--err,#c33a2f)}' +
    '.gst-carte{margin:0 0 10px}.gst-carte.gst-lu{opacity:.7}.gst-texte{white-space:pre-wrap;overflow-wrap:anywhere;margin:8px 0 0}' +
    '.gst-reponse{margin:8px 0 0;font-size:14px;color:#0c5c42}.gst-rep textarea{width:100%;box-sizing:border-box;font:inherit;padding:8px;margin-top:8px}' +
    '.gst-nv-ed{margin:14px 0 0}.gst-nv-ed>small{color:#4a566e;font-size:12.5px}' +
    '.gst-nv-pt{display:grid;grid-template-columns:200px 1fr;gap:14px;align-items:center;border-top:1px solid #e3e8f0;padding:12px 0}' +
    '@media (max-width:520px){.gst-nv-pt{grid-template-columns:1fr}}.gst-nv-pt b{display:block;font-size:15px;margin-bottom:2px}.gst-nv-pt p{font-size:14px;color:#3a4459}' +
    '.nv-ecran{background:#f4f6fb;border:1px solid #d3dae7;border-radius:10px;padding:8px;font-size:11.5px;line-height:1.3;color:#161f33;min-height:84px}' +
    '.nv-ligne{display:grid;grid-template-columns:1fr 46px 58px;align-items:center;gap:4px;padding:4px 6px;background:#fff;border-radius:5px;margin-bottom:3px}' +
    '.nv-ligne.nv-tete{background:none;color:#4a566e;font-size:10px;padding:0 6px}.nv-ligne.nv-tete span:not(:first-child){text-align:center}.nv-ligne .nv-case{justify-self:center}' +
    '.nv-id{font-family:ui-monospace,monospace}.nv-barre .nv-id{text-decoration:line-through;text-decoration-color:#c33a2f}.nv-pale{opacity:.5}' +
    '.nv-case{display:inline-flex;width:14px;height:14px;border:1.5px solid #4a566e;border-radius:3px;align-items:center;justify-content:center;font-size:10px;color:#fff;vertical-align:-2px;flex:none}' +
    '.nv-case.nv-oui{background:#161f33;border-color:#161f33}.nv-case.nv-rouge{background:#c33a2f;border-color:#c33a2f}' +
    '.nv-puce{font-style:normal;font-size:9.5px;background:#fbe6e3;color:#8f2a22;border-radius:3px;padding:0 4px;display:inline-block;text-decoration:none}' +
    '.nv-titre{font-weight:600;margin:0 0 6px}.nv-choix{display:flex;gap:6px;align-items:center;padding:3px 2px}' +
    '.nv-coin{display:flex;flex-direction:column;align-items:flex-start;gap:6px}' +
    '.nv-bulle{background:#fff;border:1px solid #d3dae7;border-radius:9px 9px 9px 2px;padding:5px 8px;max-width:85%}' +
    '.nv-bouton{background:#fff;border:1px solid #d3dae7;border-radius:7px;padding:4px 8px;color:#4a566e}';
  function style() {
    if (document.getElementById('gst-style')) return;
    var s = document.createElement('style'); s.id = 'gst-style'; s.textContent = CSS; document.head.appendChild(s);
  }
  function fenetre(id, html) {
    var d = document.getElementById(id); if (d) d.remove();
    d = document.createElement('dialog'); d.className = 'gst-dlg'; d.id = id;
    d.setAttribute('aria-labelledby', id + '-titre'); d.innerHTML = html;
    document.body.appendChild(d); return d;
  }

  var MES_MSGS = [];
  function cleReponses() { return 'prof.reponses-vues.' + moi(); }
  function vuesLe() { try { return global.localStorage.getItem(cleReponses()) || ''; } catch (e) { return ''; } }
  function chargerMesMessages() {
    return ProfAPI.lire('messages_gestion?select=id,ou,message,cree_le,lu_le,reponse,repondu_le&auteur=eq.' + encodeURIComponent(moi()) + '&order=cree_le.desc&limit=20')
      .then(function (l) { MES_MSGS = l || []; }).catch(function () { MES_MSGS = null; })
      .then(function () {
        if (!GEST) majBouton(MES_MSGS ? MES_MSGS.filter(function (m) { return m.repondu_le && m.repondu_le > vuesLe(); }).length : 0);
      });
  }
  function majBouton(n) {
    var b = $('#btn-ecrire'); if (!b) return;
    b.innerHTML = '✉️ ' + (GEST ? 'Messages' : 'Écrire à ' + NOM_GESTIONNAIRE) +
      (n ? ' <span class="sig-n">' + n + '</span>' : '');
  }
  function ouvrirEcrire() {
    style();
    var ou = H.contexte ? H.contexte() : 'Tableau de bord', avant = vuesLe();
    var d = fenetre('gst-ecrire',
      '<form novalidate><h2 id="gst-ecrire-titre">✉️ Écrire à ' + esc(NOM_GESTIONNAIRE) + '</h2>' +
      '<p class="gst-aide" style="margin:0 0 12px">Une demande, une correction, un souci : il le lira dans son tableau de bord et vous répondra ici. ' +
        'Vous écrivez depuis : <b>' + esc(ou) + '</b>.</p>' +
      '<label for="gst-msg" style="font-weight:600;font-size:14px">Votre message</label>' +
      '<textarea id="gst-msg" maxlength="2000" rows="5" placeholder="Par exemple : plume25 est un doublon de plume24 ; ajouter ma classe du jeudi…"></textarea>' +
      '<p class="gst-aide">Aucun nom d’élève : son pseudonyme suffit.</p>' +
      '<p class="gst-etat" role="status" aria-live="polite"></p>' +
      '<div class="gst-actions"><button type="button" data-fermer>Fermer</button><button type="submit" class="primaire" data-envoyer>Envoyer</button></div>' +
      '<h3>Vos derniers messages</h3><div class="gst-histo-liste"><p class="gst-aide">Chargement…</p></div></form>');
    var ta = d.querySelector('textarea'), etat = d.querySelector('.gst-etat'), env = d.querySelector('[data-envoyer]');
    function dire(t, err) { etat.textContent = t; etat.classList.toggle('err', !!err); }
    function histo() {
      var z = d.querySelector('.gst-histo-liste');
      if (MES_MSGS === null) { z.innerHTML = '<p class="gst-aide">Pas encore activé : la base attend une mise à jour.</p>'; return; }
      z.innerHTML = MES_MSGS.length ? MES_MSGS.map(function (m) {
        return '<div class="gst-histo"><small>' + esc(quand(m.cree_le)) + (m.ou ? ' · ' + esc(m.ou) : '') + ' · ' +
          (m.reponse ? 'répondu le ' + esc(quand(m.repondu_le)) : m.lu_le ? 'lu le ' + esc(quand(m.lu_le)) : 'envoyé, pas encore lu') + '</small>' +
          '<div class="q">' + esc(m.message) + '</div>' +
          (m.reponse ? '<div class="r' + (m.repondu_le > avant ? ' neuf' : '') + '"><b>' + esc(NOM_GESTIONNAIRE) + ' :</b> ' + esc(m.reponse) + '</div>' : '') + '</div>';
      }).join('') : '<p class="gst-aide">Aucun message envoyé pour l’instant.</p>';
    }
    d.querySelector('[data-fermer]').addEventListener('click', function () { d.close(); });
    d.querySelector('form').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var t = ta.value.trim();
      if (t.length < 3) { dire('Écrivez au moins quelques mots.', true); ta.focus(); return; }
      env.disabled = true; dire('Envoi…');
      ProfAPI.ecrire('messages_gestion', { auteur: moi(), message: t, ou: ou })
        .then(function () { ta.value = ''; dire('Envoyé. Merci !'); return chargerMesMessages().then(histo); })
        .catch(function (e) {
          dire(pasActive(e) ? 'La boîte à messages n’est pas encore activée : prévenez ' + NOM_GESTIONNAIRE + '.'
            : /PLAFOND_MESSAGES/.test(e.message) ? 'Trente messages par jour au plus : réessayez demain.' : 'Échec : ' + (e.message || e), true);
        })
        .then(function () { env.disabled = false; });
    });
    d.showModal(); ta.focus();
    chargerMesMessages().then(function () {
      histo();
      try { global.localStorage.setItem(cleReponses(), new Date().toISOString()); } catch (e) {}
      majBouton(0);
    });
  }

  /* ---------- nouveautés ---------- */
  function editions() {
    var esp = H.espaces ? H.espaces() : null;
    return (global.PROF_NOUVEAUTES || []).filter(function (x) {
      return !x.espaces || !esp || x.espaces.some(function (e) { return esp.indexOf(e) >= 0; });
    }).sort(function (a, b) { return b.n - a.n; });
  }
  function annoncer(toutes) {
    var vue = +REG.vues[APPLI] || 0;
    var liste = toutes ? editions().slice(0, 4) : editions().filter(function (x) { return x.n > vue; });
    if (!liste.length) { if (toutes) global.alert('Aucune nouveauté pour l’instant.'); return; }
    if (!toutes && document.querySelector('dialog[open]')) return;
    style();
    var dl = function (s) { return new Date(s + 'T12:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }); };
    var d = fenetre('gst-nv',
      '<h2 id="gst-nv-titre">✨ ' + (toutes ? 'Les dernières nouveautés' : 'Du nouveau dans le tableau de bord') + '</h2>' +
      liste.map(function (ed) {
        return '<div class="gst-nv-ed"><small>' + esc(dl(ed.date)) + '</small><h3 style="margin:2px 0 4px">' + esc(ed.titre) + '</h3>' +
          (ed.points || []).map(function (p) { return '<div class="gst-nv-pt"><div>' + (p.visuel || '') + '</div><div><b>' + esc(p.titre) + '</b><p>' + esc(p.texte) + '</p></div></div>'; }).join('') + '</div>';
      }).join('') +
      '<p class="gst-aide" style="margin-top:8px">Vous retrouvez ces annonces avec le bouton « ✨ » de la barre du haut.</p>' +
      '<div class="gst-actions"><button type="button" class="primaire" data-ok>J’ai compris</button></div>');
    var max = Math.max.apply(null, editions().map(function (x) { return x.n; }));
    d.addEventListener('close', function () { if (max > vue) { REG.vues[APPLI] = max; enregistrer(); } d.remove(); });
    d.querySelector('[data-ok]').addEventListener('click', function () { d.close(); });
    d.showModal();
  }

  /* ============================================================
     Points d'entrée
     ============================================================ */
  var installe = false;
  global.ProfGestion = {
    brancher: function (h) { H = h || {}; },
    /* À la connexion, avant le choix de l'espace : les onglets et le
       suivi doivent déjà tenir compte des réglages. Ne rejette jamais. */
    entrer: function () {
      GEST = false; MES_DEMANDES = {};
      return Promise.all([
        lireReglages(),
        ProfAPI.appeler('est_gestionnaire').then(function (v) { GEST = v === true; }).catch(function () {}),
        ProfAPI.lire('demandes_suppression?select=eleve_id&demande_par=eq.' + encodeURIComponent(moi()))
          .then(function (l) { (l || []).forEach(function (x) { MES_DEMANDES[x.eleve_id] = true; }); }).catch(function () {})
      ]).then(function () {
        style();
        if (!installe) {
          installe = true;
          $('#btn-ecrire').addEventListener('click', function () { if (GEST && H.ouvrirGestion) H.ouvrirGestion(); else ouvrirEcrire(); });
          $('#btn-nouveautes').addEventListener('click', function () { annoncer(true); });
          brancherGestion();
        }
        $('#btn-ecrire').style.display = '';
        $('#btn-nouveautes').style.display = '';
        majBouton(0);
        rendreOnglets();
        if (GEST) chargerGestion(); else chargerMesMessages();
      }).catch(function (e) { console.error('gestion', e); });
    },
    annoncer: function () { try { annoncer(false); } catch (e) { console.error('nouveautés', e); } },
    quitter: function () {
      ['#btn-ecrire', '#btn-nouveautes'].forEach(function (s) { var b = $(s); if (b) b.style.display = 'none'; });
      GEST = false;
    },
    masque: masque,
    ongletMasque: ongletMasque,
    estGestionnaire: function () { return GEST; },
    rendreEleves: rendreEleves,
    chargerGestion: chargerGestion,
    /* Fiche élève : la suppression directe est refusée (élève partagé). */
    demanderSuppression: function (e) {
      return demanderSuppression(e).then(function (fait) { if (fait) apresChangement(); return fait; });
    }
  };
})(window);
