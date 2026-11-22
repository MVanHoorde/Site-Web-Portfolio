/* ============================================================
 *  prof-frise-audit.js — l'audit des fiches de la frise de l'IA
 *  (prof/frise-ia.html · page élève pages/term-es-t3-c5-frise-ia.html)
 *  22/11/2026.
 *
 *  L'élève envoie sa fiche : une copie FRIA-RENDU (statut 'partage')
 *  dans reponses_libres. Ici, le professeur la lit en entier (textes,
 *  images, sources cliquables), puis :
 *   · renvoie une RÉPONSE précise (signaler_copie, mot obligatoire) :
 *     l'élève voit « ✎ À reprendre » sous ce champ et peut le réécrire ;
 *   · valide une réponse (valider_copie) : elle est figée chez l'élève ;
 *   · renvoie la FICHE pour correction (signaler_copie sur FRIA-RENDU,
 *     mot obligatoire) ou la valide (valider_copie sur FRIA-RENDU).
 *  Aucune table de plus : les fonctions de bdd/schema/010 suffisent,
 *  et l'archivage de 014 remet FRIA-RENDU en 'partage' quand l'élève
 *  renvoie sa fiche corrigée.
 *
 *  Noms : ProfAPI.nomDe (table locale), jamais en base.
 * ============================================================ */
(function (global) {
  var F = global.FRISE_IA, SEQ = 'est-t3-c5';
  var CHAMPS = [
    { c: 'FRIA-TITRE',  t: 'Titre', bloc: 'Pour la frise' },
    { c: 'FRIA-DATE',   t: 'Date ou période', bloc: 'Pour la frise' },
    { c: 'FRIA-RESUME', t: 'Résumé pour la frise', bloc: 'Pour la frise' },
    { c: 'FRIA-Q1', t: '1 · De quoi s’agit-il ?', bloc: 'Les six questions' },
    { c: 'FRIA-Q2', t: '2 · Quand, où, dans quel contexte ?', bloc: 'Les six questions' },
    { c: 'FRIA-Q3', t: '3 · Qui ?', bloc: 'Les six questions' },
    { c: 'FRIA-Q4', t: '4 · Comment ça marche ?', bloc: 'Les six questions' },
    { c: 'FRIA-Q5', t: '5 · Qu’est-ce que ça a changé ? Quel lien avec l’IA d’aujourd’hui ?', bloc: 'Les six questions' },
    { c: 'FRIA-Q6', t: '6 · Ce qui t’a surpris', bloc: 'Les six questions' },
    { c: 'FRIA-IMG1L', t: 'Image 1 · légende et source', img: 'FRIA-IMG1', bloc: 'Les images' },
    { c: 'FRIA-IMG2L', t: 'Image 2 · légende et source', img: 'FRIA-IMG2', bloc: 'Les images', facultatif: true },
    { c: 'FRIA-IMG3L', t: 'Image 3 · légende et source', img: 'FRIA-IMG3', bloc: 'Les images', facultatif: true },
    { c: 'FRIA-SRC1', t: 'Source 1', lien: true, bloc: 'Les sources' },
    { c: 'FRIA-SRC2', t: 'Source 2', lien: true, bloc: 'Les sources' }
  ];
  var ONGLETS = [
    { k: 'partage', t: '📮 À lire' },
    { k: 'signale', t: '✎ Renvoyées' },
    { k: 'corrige', t: '✓ Validées' }
  ];

  var etat = { eleves: [], tirages: {}, rep: {}, onglet: 'partage', ouvert: null, urls: {} };
  var $ = function (s) { return document.querySelector(s); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function liens(s) {
    return esc(s).replace(/https?:\/\/[^\s<]+[^\s<.,;:!?)»]/g, function (u) {
      return '<a href="' + u + '" target="_blank" rel="noopener noreferrer">' + u + '</a>';
    });
  }
  function mots(s) { return (String(s || '').trim().match(/\S+/g) || []).length; }
  function quand(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) + ' ' +
      String(d.getHours()).padStart(2, '0') + 'h' + String(d.getMinutes()).padStart(2, '0');
  }
  function titre(id) { var s = F && F.PAR_ID[id]; return s ? s.titre : (id || 'sans sujet'); }
  function dire(t, ko) { var e = $('#au-msg'); if (e) { e.textContent = t || ''; e.className = 'au-msg' + (ko ? ' ko' : ''); } }

  /* ---------- la liste des fiches envoyées ---------- */
  function dessiner(eleves, tirages, rep) {
    etat.eleves = eleves || [];
    etat.tirages = {}; (tirages || []).forEach(function (t) { etat.tirages[t.eleve_id] = t; });
    etat.rep = rep || {};
    var boite = $('#audit-liste'); if (!boite) return;
    var par = { partage: [], signale: [], corrige: [] };
    etat.eleves.forEach(function (e) {
      var r = (etat.rep[e.id] || {})['FRIA-RENDU'];
      if (r && par[r.statut]) par[r.statut].push({ e: e, r: r });
    });
    Object.keys(par).forEach(function (k) {
      par[k].sort(function (a, b) { return String(a.r.envoye_le).localeCompare(String(b.r.envoye_le)); });
    });
    etat.files = par;
    var total = par.partage.length + par.signale.length + par.corrige.length;
    $('#audit-onglets').innerHTML = ONGLETS.map(function (o) {
      return '<button type="button" data-onglet="' + o.k + '" aria-pressed="' + (etat.onglet === o.k) + '">' + o.t +
        ' <b>' + par[o.k].length + '</b></button>';
    }).join('');
    var l = par[etat.onglet];
    boite.innerHTML = !total
      ? '<p class="aide">Aucune fiche envoyée dans cette classe pour l’instant. Le bouton « 📮 J’envoie ma fiche » est en bas de la fiche des élèves ; il refuse une fiche incomplète.</p>'
      : !l.length ? '<p class="aide">Rien ici.</p>'
      : '<ul class="au-liste">' + l.map(function (x) {
          var t = etat.tirages[x.e.id];
          return '<li><button type="button" data-ouvrir="' + x.e.id + '"><b>' + esc(ProfAPI.nomDe(x.e.pseudo)) + '</b>' +
            '<span>' + esc(titre(t && t.sujet)) + '</span>' +
            '<small>' + (x.r.statut === 'partage' ? (x.r.version > 1 ? '↻ renvoyée corrigée ' : 'envoyée ') + esc(quand(x.r.envoye_le))
                                                 : esc(quand(x.r.corrige_le))) + '</small></button></li>';
        }).join('') + '</ul>';
    if (etat.ouvert) ouvrir(etat.ouvert, true);
  }

  /* ---------- la fiche d'un élève ---------- */
  function puce(r) {
    if (!r) return '<span class="chip">vide</span>';
    if (r.statut === 'signale') return '<span class="chip ko">✎ renvoyée</span>';
    if (r.statut === 'corrige') return '<span class="chip ok">✓ validée</span>';
    return r.version > 1 ? '<span class="chip att">↻ réécrite</span>' : '';
  }
  function image(e, code) {
    var ch = e.auth_id + '/' + SEQ + '/' + code + '.jpg';
    if (!etat.urls[ch]) {
      etat.urls[ch] = ProfAPI.lireDepot(ch).then(function (b) { return b ? URL.createObjectURL(b) : null; }).catch(function () { return null; });
    }
    return etat.urls[ch];
  }

  function ouvrir(id, rafraichir) {
    var e = etat.eleves.filter(function (x) { return x.id === id; })[0];
    if (!e) return;
    etat.ouvert = id;
    var rep = etat.rep[id] || {}, rendu = rep['FRIA-RENDU'], t = etat.tirages[id];
    var total = 0, bloc = '';
    var html = CHAMPS.map(function (f) {
      var r = rep[f.c], h = '';
      if (f.bloc !== bloc) { bloc = f.bloc; h += '<h3 class="au-bloc">' + esc(bloc) + '</h3>'; }
      if (!r && f.facultatif) {
        return h + '<div class="au-champ au-vide" data-img-slot="' + (f.img || '') + '"><div class="au-q">' + esc(f.t) + ' <small>(facultative)</small></div><div class="au-img" data-img="' + (f.img || '') + '"></div></div>';
      }
      var n = r ? mots(r.texte) : 0; total += n;
      h += '<div class="au-champ' + (r ? '' : ' au-manque') + '" data-champ="' + f.c + '">' +
        '<div class="au-q">' + esc(f.t) + ' ' + puce(r) + (r ? ' <small>' + n + ' mots</small>' : '') + '</div>' +
        (f.img ? '<div class="au-img" data-img="' + f.img + '"><small>image…</small></div>' : '') +
        '<div class="au-texte">' + (r ? (f.lien ? liens(r.texte) : esc(r.texte)) : '<i>pas de réponse</i>') + '</div>' +
        (r && r.commentaire_prof ? '<div class="au-mot">Ton mot : ' + esc(r.commentaire_prof) + '</div>' : '') +
        (r ? '<div class="au-gestes">' +
              (r.statut !== 'corrige' ? '<button type="button" data-geste="valider" data-id="' + r.id + '" title="La réponse est figée chez l’élève">✓ Bonne</button>' : '') +
              '<button type="button" data-geste="reprendre" data-id="' + r.id + '">✎ À reprendre…</button>' +
              '<div class="au-saisie" hidden><textarea rows="2" placeholder="Ce que l’élève doit reprendre dans cette réponse"></textarea>' +
              '<button type="button" data-geste="renvoyer" data-id="' + r.id + '">Renvoyer cette réponse</button></div>' +
            '</div>' : '') +
        '</div>';
      return h;
    }).join('');

    var liste = (etat.files && etat.files[etat.onglet]) || [];
    var i = liste.map(function (x) { return x.e.id; }).indexOf(id);
    $('#audit-vue').innerHTML =
      '<div class="au-tete">' +
        '<button type="button" data-fermer>← Liste</button>' +
        '<div><h2>' + esc(ProfAPI.nomDe(e.pseudo)) + '</h2><div class="aide">' + esc(titre(t && t.sujet)) + ' · ' + total + ' mots au total' +
          (rendu ? ' · ' + (rendu.statut === 'partage' ? 'envoyée ' + esc(quand(rendu.envoye_le)) : rendu.statut === 'signale' ? 'renvoyée ' + esc(quand(rendu.corrige_le)) : 'validée ' + esc(quand(rendu.corrige_le))) : ' · <b>pas encore envoyée</b>') +
        '</div></div>' +
        '<span class="au-nav">' +
          (i > 0 ? '<button type="button" data-ouvrir="' + liste[i - 1].e.id + '">‹ Précédente</button>' : '') +
          (i >= 0 && i < liste.length - 1 ? '<button type="button" data-ouvrir="' + liste[i + 1].e.id + '">Suivante ›</button>' : '') +
        '</span>' +
      '</div>' +
      '<div class="au-corps">' + html + '</div>' +
      '<div class="au-fin">' +
        '<h3>Ton retour sur la fiche</h3>' +
        (rendu && rendu.commentaire_prof ? '<div class="au-mot">Déjà envoyé : ' + esc(rendu.commentaire_prof) + '</div>' : '') +
        '<textarea id="au-global" rows="4" placeholder="Ce qui va, ce qu’il faut corriger avant le 17/12. L’élève le lit en tête et en bas de sa fiche."></textarea>' +
        '<div class="au-gestes">' +
          '<button type="button" class="ko" data-geste="fiche-renvoyer"' + (rendu ? '' : ' disabled') + '>✎ Renvoyer pour correction</button>' +
          '<button type="button" class="ok" data-geste="fiche-valider"' + (rendu ? '' : ' disabled') + '>✓ Valider la fiche</button>' +
        '</div>' +
        '<p class="au-msg" id="au-msg" aria-live="polite"></p>' +
        (rendu ? '' : '<p class="aide">L’élève n’a pas encore envoyé sa fiche : tu peux renvoyer une réponse précise, pas la fiche entière.</p>') +
      '</div>';
    $('#audit-liste-zone').hidden = true;
    $('#audit-vue').hidden = false;
    if (!rafraichir) $('#audit').scrollIntoView({ block: 'start' });

    document.querySelectorAll('#audit-vue [data-img]').forEach(function (z) {
      var code = z.getAttribute('data-img'); if (!code || !e.auth_id) { z.innerHTML = ''; return; }
      image(e, code).then(function (u) {
        if (u) { z.innerHTML = '<a href="' + u + '" target="_blank" rel="noopener"><img alt="Image déposée" src="' + u + '"></a>'; var c = z.closest('.au-vide'); if (c) c.classList.remove('au-vide'); }
        else z.innerHTML = code === 'FRIA-IMG1' ? '<i>pas d’image déposée</i>' : '';
      });
    });
  }

  function fermer() {
    etat.ouvert = null;
    $('#audit-vue').hidden = true; $('#audit-vue').innerHTML = '';
    $('#audit-liste-zone').hidden = false;
  }

  function agir(fonction, id, mot, bouton) {
    bouton.disabled = true; dire('Envoi…');
    return ProfAPI.appeler(fonction, { p_copie: id, p_commentaire: mot || null }).then(function () {
      dire('C’est fait : l’élève le voit à sa prochaine visite (ou dans les deux minutes s’il a la page ouverte).');
      if (global.friseRecharger) global.friseRecharger();
    }).catch(function (err) { bouton.disabled = false; dire('Refusé : ' + err.message, true); });
  }

  function brancher() {
    var zone = $('#audit'); if (!zone) return;
    zone.addEventListener('click', function (ev) {
      var b = ev.target.closest('button'); if (!b) return;
      if (b.dataset.onglet) { etat.onglet = b.dataset.onglet; fermer(); dessiner(etat.eleves, Object.keys(etat.tirages).map(function (k) { return etat.tirages[k]; }), etat.rep); return; }
      if (b.dataset.ouvrir) { ouvrir(b.dataset.ouvrir); return; }
      if (b.hasAttribute('data-fermer')) { fermer(); return; }
      var g = b.dataset.geste; if (!g) return;
      var rep = etat.rep[etat.ouvert] || {}, rendu = rep['FRIA-RENDU'];
      if (g === 'valider') return agir('valider_copie', b.dataset.id, null, b);
      if (g === 'reprendre') { var s = b.parentNode.querySelector('.au-saisie'); s.hidden = !s.hidden; if (!s.hidden) s.querySelector('textarea').focus(); return; }
      if (g === 'renvoyer') {
        var m = b.parentNode.querySelector('textarea').value.trim();
        if (!m) { dire('Écris ce que l’élève doit reprendre dans cette réponse.', true); return; }
        return agir('signaler_copie', b.dataset.id, m, b);
      }
      var mg = ($('#au-global') || {}).value; mg = (mg || '').trim();
      if (g === 'fiche-renvoyer') {
        if (!mg) { dire('Un renvoi doit dire quoi corriger : écris ton retour.', true); return; }
        return agir('signaler_copie', rendu.id, mg, b);
      }
      if (g === 'fiche-valider') {
        if (!confirm('Valider la fiche ? L’élève la verra « ✓ validée ».')) return;
        return agir('valider_copie', rendu.id, mg, b);
      }
    });
  }

  global.FriseAudit = { dessiner: dessiner };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', brancher); else brancher();
})(window);
