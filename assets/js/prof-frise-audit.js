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
  /* a = la consigne lue par l'élève (data-focus-question de la page) :
     l'export la joint à chaque réponse, pour que la correction se fasse
     contre ce qui a été demandé. 🔴 À tenir identique à la page élève. */
  var CHAMPS = [
    { c: 'FRIA-TITRE',  t: 'Titre', bloc: 'Pour la frise', a: 'Un titre court qui donne envie d’en savoir plus. Pas seulement le nom du sujet : dire ce qu’il a de marquant.' },
    { c: 'FRIA-DATE',   t: 'Date ou période', bloc: 'Pour la frise', a: 'L’année, ou la période si elle s’étale.' },
    { c: 'FRIA-RESUME', t: 'Résumé pour la frise', bloc: 'Pour la frise', a: 'Une ou deux phrases, 30 mots au plus : ce que quelqu’un doit retenir du sujet s’il ne lit que ça.' },
    { c: 'FRIA-Q1', t: '1 · De quoi s’agit-il ?', bloc: 'Les six questions', a: 'Présenter le sujet à quelqu’un qui n’en a jamais entendu parler. 40 à 120 mots.' },
    { c: 'FRIA-Q2', t: '2 · Quand, où, dans quel contexte ?', bloc: 'Les six questions', a: 'Situer le sujet dans son époque : ce qui se passait autour. 40 à 120 mots.' },
    { c: 'FRIA-Q3', t: '3 · Qui ?', bloc: 'Les six questions', a: 'Les personnes, les équipes ou les entreprises derrière. Si on ne sait pas, le dire et dire pourquoi. 40 à 120 mots.' },
    { c: 'FRIA-Q4', t: '4 · Comment ça marche ?', bloc: 'Les six questions', a: 'Le principe, avec ses mots. Tout terme technique est expliqué. 60 à 200 mots.' },
    { c: 'FRIA-Q5', t: '5 · Qu’est-ce que ça a changé ? Quel lien avec l’IA d’aujourd’hui ?', bloc: 'Les six questions', a: 'Ce que le sujet a rendu possible, et ce qui le sépare encore d’une IA. 60 à 200 mots.' },
    { c: 'FRIA-Q6', t: '6 · Ce qui t’a surpris', bloc: 'Les six questions', a: 'Une anecdote, un chiffre, une controverse. 20 à 100 mots.' },
    { c: 'FRIA-IMG1L', t: 'Image 1 · légende et source', img: 'FRIA-IMG1', bloc: 'Les images', a: 'Légende : ce qu’on voit sur l’image. Puis la source : auteur ou organisme, site, licence s’il y en a une.' },
    { c: 'FRIA-IMG2L', t: 'Image 2 · légende et source', img: 'FRIA-IMG2', bloc: 'Les images', facultatif: true, a: 'Légende puis source (image facultative).' },
    { c: 'FRIA-IMG3L', t: 'Image 3 · légende et source', img: 'FRIA-IMG3', bloc: 'Les images', facultatif: true, a: 'Légende puis source (image facultative).' },
    { c: 'FRIA-SRC1', t: 'Source 1', lien: true, bloc: 'Les sources', a: 'Une source écrite selon l’aide : auteur ou organisme, « titre », site, date, adresse, consulté le… Encyclopédies collaboratives et assistants IA refusés.' },
    { c: 'FRIA-SRC2', t: 'Source 2', lien: true, bloc: 'Les sources', a: 'Une deuxième source, différente de la première (un autre site ou document).' }
  ];

  /* La grille de la fiche — la même que la rubrique « Comment tu es
     évalué » de la page élève. 🔴 À tenir identique. */
  var GR = global.FRISE_GRILLES;
  var GRILLE = GR.FICHE.map(function (c) { return [c[0] + ' (/' + c[1] + ')', c[2] + (c[3] ? ' — barème : ' + c[3] : '')]; });
  function sousSeuil(f, x) { var m = GR.SEUILS[f.c]; return m && x && x.texte.length < m ? m : 0; }

  /* Ce que l'IA reçoit en tête de tout export. Retour FORMATIF, jamais de
     note (décision EST-FRISE-01, AI Act 6(3)) ; un format de sortie fixe,
     pour que le retour se recopie réponse par réponse dans l'audit. */
  var CONSIGNE = [
    'Tu aides un professeur d’enseignement scientifique (terminale, programme 3.5 : histoire de l’IA) à préparer le retour sur des fiches de recherche d’élèves. Ces fiches serviront à une frise collective et à un oral de 1 min à 1 min 30 par élève.',
    'Pour CHAQUE fiche, produis un retour formatif. Tu ne donnes JAMAIS de note ni d’appréciation chiffrée : c’est le professeur qui évalue.',
    'Juge chaque réponse contre la consigne indiquée sous elle et contre son seuil de caractères quand il y en a un (le nombre de caractères est donné) et contre le sujet de la fiche. Vérifie l’exactitude des faits, les sources (fiabilité ; encyclopédies collaboratives et assistants IA refusés) et la cohérence des images avec le sujet.',
    'Un texte qui semble copié ou produit par une IA se signale comme « à vérifier par le professeur », jamais comme une certitude.',
    'Le mot à l’élève tutoie, reste bienveillant et précis : ce qui va, puis ce qu’il faut faire, en une ou deux phrases par réponse.',
    'Réponds exactement dans ce format, une section par fiche, dans l’ordre :',
    '### <code de la fiche>\nGrille :\n1. Complète — <constat court>\n2. Assez développée — <constat court>\n3. Avec ses mots — <constat court>\n4. Images — <constat court>\n5. Sources — <constat court>\n6. Sujet bien traité — <constat court>\nÀ vérifier par le professeur : <ou « rien »>\nÀ reprendre :\n- <code du champ, par ex. FRIA-Q4> : <mot à l’élève>\nMot global : <trois phrases au plus, à l’élève>'
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

  /* Le code d'une fiche dans les exports : stable (tiré de l'identifiant
     de l'élève), sans rien d'identifiant. Le nom ne sort JAMAIS de cette
     page ; le code s'affiche à côté du nom, dans la liste et l'audit. */
  function code(e) {
    var h = 2166136261;
    for (var i = 0; i < e.id.length; i++) { h ^= e.id.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return 'E-' + (h % 1048576).toString(16).toUpperCase().padStart(5, '0');
  }

  /* ---------- l'export pour la correction par IA ----------
     ids : les élèves à exporter. Ouvre une page à part : consigne + grille
     + fiches (codes, jamais de noms), avec trois gestes : imprimer en PDF
     (images comprises), télécharger le texte (.md), copier le texte. */
  function exporter(ids, titreExport) {
    var liste = etat.eleves.filter(function (e) { return ids.indexOf(e.id) >= 0; })
      .filter(function (e) { var r = etat.rep[e.id] || {}; return CHAMPS.some(function (f) { return r[f.c]; }); })
      .sort(function (a, b) { return code(a).localeCompare(code(b)); });
    if (!liste.length) { alert('Aucune fiche à exporter : ces élèves n’ont encore rien écrit.'); return; }
    var w = global.open('', '_blank');
    if (!w) { alert('La fenêtre d’export a été bloquée : autorise les fenêtres pour ce site, puis recommence.'); return; }
    var jour = new Date().toLocaleDateString('fr-FR');

    var md = ['# Frise de l’IA — ' + titreExport + ' — export du ' + jour, '', '## Consigne', ''];
    CONSIGNE.forEach(function (l) { md.push(l, ''); });
    md.push('## Grille de la fiche', '');
    GRILLE.forEach(function (g, i) { md.push((i + 1) + '. **' + g[0] + '** — ' + g[1]); });
    md.push('');

    var corps = liste.map(function (e) {
      var r = etat.rep[e.id] || {}, t = etat.tirages[e.id], s = t && t.sujet && F ? F.PAR_ID[t.sujet] : null;
      var sujet = s ? s.titre + ' (' + s.date + ')' : 'sujet non tiré';
      var rendu = r['FRIA-RENDU'];
      var etatFiche = !rendu ? 'pas encore envoyée' : rendu.statut === 'partage' ? (rendu.version > 1 ? 'renvoyée après correction' : 'envoyée') : rendu.statut === 'signale' ? 'renvoyée pour correction, pas encore reprise' : 'validée';
      md.push('---', '', '## ' + code(e) + ' — ' + sujet, '', '_Fiche ' + etatFiche + '._', '');
      var h = '<section class="fiche"><h2>' + code(e) + ' <span>' + esc(sujet) + '</span></h2><p class="etat">Fiche ' + esc(etatFiche) + '</p>';
      CHAMPS.forEach(function (f) {
        var x = r[f.c];
        if (!x && f.facultatif) return;
        var txt = x ? x.texte : '(pas de réponse)';
        var marque = x && x.statut === 'signale' ? ' [déjà renvoyée à l’élève : « ' + (x.commentaire_prof || '') + ' »]' : x && x.version > 1 ? ' [réécrite après un retour]' : '';
        var seuil = GR.SEUILS[f.c], ss = sousSeuil(f, x);
        var mesure = x ? ' — ' + x.texte.length + ' caractères' + (seuil ? ' (seuil ' + seuil + (ss ? ' : SOUS LE SEUIL)' : ' : atteint)') : '') : '';
        md.push('### ' + f.c + ' · ' + f.t + marque, '_Consigne : ' + f.a + '_' + mesure, '', txt, '');
        h += '<div class="champ"><h3>' + esc(f.c) + ' · ' + esc(f.t) + '<small>' + esc(marque) + '</small></h3>' +
          '<p class="consigne">Consigne : ' + esc(f.a) + '<b>' + esc(mesure) + '</b></p>' +
          (f.img ? '<div class="img" data-img="' + e.id + '|' + f.img + '"></div>' : '') +
          '<p class="rep">' + esc(txt) + '</p></div>';
      });
      return h + '</section>';
    }).join('');

    var texte = md.join('\n');
    w.document.write('<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>Frise de l’IA — export ' + esc(titreExport) + '</title><style>' +
      'body{font:15px/1.5 Georgia,serif;color:#141a26;max-width:820px;margin:0 auto;padding:20px}' +
      'h1{font:700 22px system-ui,sans-serif;margin:0 0 4px}h2{font:700 18px system-ui,sans-serif;border-bottom:2px solid #141a26;padding-bottom:4px;margin:0 0 4px}' +
      'h2 span{font-weight:400;font-size:15px;color:#5f6472;margin-left:8px}h3{font:600 14px system-ui,sans-serif;margin:0}h3 small{font-weight:400;color:#c63a27}' +
      '.barre{position:sticky;top:0;background:#fffdf8;border:1px solid #d8d1bf;border-radius:10px;padding:10px;margin-bottom:16px;display:flex;flex-wrap:wrap;gap:8px;align-items:center}' +
      '.barre button{font:600 14px system-ui,sans-serif;border:1px solid #141a26;background:#141a26;color:#fff;border-radius:8px;padding:8px 12px;cursor:pointer}' +
      '.barre button.g{background:#fff;color:#141a26}.barre span{font:13px system-ui,sans-serif;color:#3f7f4c}' +
      '.consigne-ia,.grille{border:1px solid #d8d1bf;border-radius:10px;padding:10px 14px;margin-bottom:12px;background:#fffdf8}' +
      '.consigne-ia p{margin:4px 0}.consigne-ia pre{white-space:pre-wrap;font:12.5px ui-monospace,monospace;background:#f3f1ea;padding:8px;border-radius:6px}' +
      '.fiche{margin-top:22px}.champ{border-left:3px solid #d8d1bf;padding:2px 0 2px 10px;margin:10px 0}' +
      '.consigne{font:12.5px system-ui,sans-serif;color:#5f6472;margin:2px 0}.rep{white-space:pre-wrap;margin:4px 0}' +
      '.img img{max-width:100%;max-height:300px;border:1px solid #d8d1bf;border-radius:6px;margin:4px 0}.etat{font:13px system-ui,sans-serif;color:#5f6472;margin:0 0 6px}' +
      '@media print{.barre{display:none}.fiche{break-before:page}body{padding:0}@page{size:A4;margin:14mm}}' +
      '</style></head><body>' +
      '<div class="barre"><button id="pdf">🖨️ Imprimer en PDF (avec les images)</button><button class="g" id="dl">⬇ Texte (.md)</button><button class="g" id="cp">📋 Copier le texte</button><span id="ok"></span></div>' +
      '<h1>Frise de l’IA — ' + esc(titreExport) + '</h1><p class="etat">Export du ' + esc(jour) + ' · ' + liste.length + ' fiche' + (liste.length > 1 ? 's' : '') + ' · codes seulement, aucun nom.</p>' +
      '<div class="consigne-ia"><h2>Consigne pour l’IA</h2>' + CONSIGNE.map(function (l) { return /\n/.test(l) ? '<pre>' + esc(l) + '</pre>' : '<p>' + esc(l) + '</p>'; }).join('') + '</div>' +
      '<div class="grille"><h2>Grille de la fiche</h2><ol>' + GRILLE.map(function (g) { return '<li><b>' + esc(g[0]) + '</b> — ' + esc(g[1]) + '</li>'; }).join('') + '</ol></div>' +
      corps + '</body></html>');
    w.document.close();

    var d = w.document, ok = d.getElementById('ok');
    d.getElementById('pdf').onclick = function () { w.print(); };
    d.getElementById('dl').onclick = function () {
      var a = d.createElement('a');
      a.href = URL.createObjectURL(new Blob([texte], { type: 'text/markdown;charset=utf-8' }));
      a.download = 'frise-ia-' + titreExport.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + new Date().toISOString().slice(0, 10) + '.md';
      d.body.appendChild(a); a.click(); a.remove();
      ok.textContent = 'Fichier téléchargé.';
    };
    d.getElementById('cp').onclick = function () {
      w.navigator.clipboard.writeText(texte).then(function () { ok.textContent = 'Texte copié : colle-le dans la conversation.'; },
        function () { ok.textContent = 'Copie refusée : utilise le bouton « Texte (.md) ».'; });
    };
    /* les images, une fois la page écrite (elles ne vont que dans le PDF) */
    d.querySelectorAll('[data-img]').forEach(function (z) {
      var p = z.getAttribute('data-img').split('|'), e = etat.eleves.filter(function (x) { return x.id === p[0]; })[0];
      if (!e || !e.auth_id) return;
      image(e, p[1]).then(function (u) { z.innerHTML = u ? '<img alt="Image déposée" src="' + u + '">' : (p[1] === 'FRIA-IMG1' ? '<p class="consigne">(pas d’image déposée)</p>' : ''); });
    });
  }

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
    var libelle = { partage: 'à lire', signale: 'renvoyées', corrige: 'validées' }[etat.onglet];
    var ecrivent = etat.eleves.filter(function (e) { return Object.keys(etat.rep[e.id] || {}).length; }).length;
    var exports = '<div class="au-exports"><span>⬇ Export pour l’IA, avec consigne et grille :</span>' +
      '<button type="button" data-exporter="onglet"' + (l.length ? '' : ' disabled') + '>Les ' + l.length + ' fiches ' + libelle + '</button>' +
      '<button type="button" data-exporter="classe"' + (ecrivent ? '' : ' disabled') + '>Toute la classe (' + ecrivent + ' fiches commencées)</button></div>';
    boite.innerHTML = exports + (!total
      ? '<p class="aide">Aucune fiche envoyée dans cette classe pour l’instant. Le bouton « 📮 J’envoie ma fiche » est en bas de la fiche des élèves ; il refuse une fiche incomplète.</p>'
      : !l.length ? '<p class="aide">Rien ici.</p>'
      : '<ul class="au-liste">' + l.map(function (x) {
          var t = etat.tirages[x.e.id];
          return '<li><button type="button" data-ouvrir="' + x.e.id + '"><b>' + esc(ProfAPI.nomDe(x.e.pseudo)) + ' <small>' + code(x.e) + '</small></b>' +
            '<span>' + esc(titre(t && t.sujet)) + '</span>' +
            '<small>' + (x.r.statut === 'partage' ? (x.r.version > 1 ? '↻ renvoyée corrigée ' : 'envoyée ') + esc(quand(x.r.envoye_le))
                                                 : esc(quand(x.r.corrige_le))) + '</small></button></li>';
        }).join('') + '</ul>');
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
        '<div class="au-q">' + esc(f.t) + ' ' + puce(r) + (r ? ' <small>' + n + ' mots · ' + r.texte.length + ' car.</small>' : '') +
          (sousSeuil(f, r) ? ' <span class="chip ko">sous le seuil de ' + GR.SEUILS[f.c] + '</span>' : '') + '</div>' +
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
        '<div><h2>' + esc(ProfAPI.nomDe(e.pseudo)) + ' <small class="au-code">' + code(e) + '</small></h2><div class="aide">' + esc(titre(t && t.sujet)) + ' · ' + total + ' mots au total' +
          (rendu ? ' · ' + (rendu.statut === 'partage' ? 'envoyée ' + esc(quand(rendu.envoye_le)) : rendu.statut === 'signale' ? 'renvoyée ' + esc(quand(rendu.corrige_le)) : 'validée ' + esc(quand(rendu.corrige_le))) : ' · <b>pas encore envoyée</b>') +
        '</div></div>' +
        '<span class="au-nav"><button type="button" data-exporter="un">⬇ Exporter pour l’IA</button>' +
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
      if (b.dataset.exporter) {
        var x = b.dataset.exporter, nomClasse = ($('#classes [aria-pressed="true"]') || {}).textContent || 'classe';
        if (x === 'un') { var el = etat.eleves.filter(function (z) { return z.id === etat.ouvert; })[0]; exporter([etat.ouvert], nomClasse + ' — fiche ' + code(el)); }
        else if (x === 'onglet') exporter((etat.files[etat.onglet] || []).map(function (z) { return z.e.id; }), nomClasse + ' — fiches ' + { partage: 'à lire', signale: 'renvoyées', corrige: 'validées' }[etat.onglet]);
        else exporter(etat.eleves.map(function (z) { return z.id; }), nomClasse + ' — toute la classe');
        return;
      }
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
