/* ============================================================
 *  quiz-animer.js — l'écran enseignant
 *  ------------------------------------------------------------
 *  1. Bibliothèque : mes quiz et ceux des collègues, import d'un
 *     fichier JSON, aperçu (avec les corrigés), export, suppression
 *  2. Parties encore ouvertes : reprendre après un rechargement
 *  3. La scène projetée : accueil (QR + PIN), question, correction,
 *     classement, podium. Pilotée au clavier (Espace / →) ou au clic.
 *
 *  La tablette du professeur est le chef d'orchestre : c'est elle
 *  qui change d'écran (quiz_piloter) et qui réveille les téléphones
 *  (canal temps réel). Recharger la page en pleine partie ne perd
 *  rien : la partie vit en base, « Reprendre » la retrouve.
 * ============================================================ */
(function () {
  'use strict';
  var Q = window.Quiz, $ = Q.$, esc = Q.esc;
  var app = $('#app');
  var CLE_ANIM = 'quiz.animation';
  var mesQuiz = [];

  /* ============================================================
   *  1. Bibliothèque
   * ============================================================ */
  function bibliotheque() {
    sortirScene();
    app.innerHTML =
      '<div class="page">' +
        '<section id="ouvertes" hidden><h2>Parties ouvertes</h2><div class="defile"><table class="tableau" id="t-ouvertes"></table></div></section>' +
        '<section><h2>Les quiz</h2><p class="note" id="n-quiz">Chargement…</p><div class="liste-quiz" id="liste"></div></section>' +
        '<section><h2>Importer</h2>' +
          '<label class="depot" id="depot"><input type="file" id="f-import" accept=".json,application/json" multiple hidden>' +
            '<b>Déposer ici un ou plusieurs fichiers de quiz (.json)</b><br><span class="note">ou cliquer pour les choisir. Un quiz déjà présent (même identifiant) est mis à jour ; ses parties passées gardent leurs questions d\'origine.</span></label>' +
          '<ul class="journal" id="journal"></ul>' +
        '</section>' +
      '</div>';
    var depot = $('#depot'), champ = $('#f-import');
    champ.onchange = function () { importer(champ.files); champ.value = ''; };
    ['dragenter', 'dragover'].forEach(function (t) { depot.addEventListener(t, function (e) { e.preventDefault(); depot.classList.add('survol'); }); });
    ['dragleave', 'drop'].forEach(function (t) { depot.addEventListener(t, function (e) { e.preventDefault(); depot.classList.remove('survol'); }); });
    depot.addEventListener('drop', function (e) { importer(e.dataTransfer.files); });
    chargerQuiz();
    chargerOuvertes();
  }

  function chargerQuiz() {
    return Q.rest('quiz_quiz?select=id,slug,titre,niveau,matiere,description,auteur,partage,modifie_le,questions,salle&order=modifie_le.desc')
      .then(function (l) {
        mesQuiz = l || [];
        var moi = Q.monUid();
        $('#n-quiz').textContent = mesQuiz.length ? mesQuiz.length + ' quiz' : 'Aucun quiz pour l\'instant : importe un fichier ci-dessous.';
        $('#liste').innerHTML = mesQuiz.map(function (z) {
          var aMoi = z.auteur === moi, n = (z.questions || []).length;
          var aVerifier = (z.questions || []).filter(function (q) { return q.a_verifier; }).length;
          return '<article class="carte-quiz">' +
            '<h3>' + esc(z.titre) + '</h3>' +
            '<div class="meta">' + esc([z.niveau, z.matiere].filter(Boolean).join(' · ')) + '</div>' +
            '<div class="meta">' + n + ' question' + (n > 1 ? 's' : '') + ' · ' + (aMoi ? 'à moi' : 'd\'un collègue') + ' · modifié le ' + new Date(z.modifie_le).toLocaleDateString('fr-FR') +
              (aVerifier ? ' · <b style="color:var(--rouge)">' + aVerifier + ' à vérifier</b>' : '') + '</div>' +
            '<div class="actions">' +
              '<button class="bouton rouge petit" type="button" data-lancer="' + z.id + '">Lancer</button>' +
              '<button class="bouton creux petit" type="button" data-apercu="' + z.id + '">Aperçu</button>' +
              (aMoi ? '<button class="bouton creux petit" type="button" data-salle="' + z.id + '" title="Le QR code à poser sur une diapositive ou une fiche">QR code fixe</button>' : '') +
              '<button class="bouton creux petit" type="button" data-export="' + z.id + '">Exporter</button>' +
              (aMoi ? '<button class="lien-bouton" type="button" data-suppr="' + z.id + '">Supprimer</button>' : '') +
            '</div></article>';
        }).join('');
        app.querySelectorAll('[data-lancer]').forEach(function (b) { b.onclick = function () { dialogueLancer(trouver(b.dataset.lancer)); }; });
        app.querySelectorAll('[data-apercu]').forEach(function (b) { b.onclick = function () { apercu(trouver(b.dataset.apercu)); }; });
        app.querySelectorAll('[data-salle]').forEach(function (b) { b.onclick = function () { qrFixe(trouver(b.dataset.salle)); }; });
        app.querySelectorAll('[data-export]').forEach(function (b) { b.onclick = function () { exporter(trouver(b.dataset.export)); }; });
        app.querySelectorAll('[data-suppr]').forEach(function (b) { b.onclick = function () { supprimer(trouver(b.dataset.suppr)); }; });
      })
      .catch(erreurGlobale);
  }
  function trouver(id) { return mesQuiz.filter(function (z) { return z.id === id; })[0]; }

  function chargerOuvertes() {
    var depuis = new Date(Date.now() - 12 * 3600000).toISOString();
    Q.rest('quiz_parties?select=id,titre,pin,phase,idx,groupe,ouverte_le,questions&close_le=is.null&ouverte_le=gt.' + encodeURIComponent(depuis) + '&order=ouverte_le.desc')
      .then(function (l) {
        if (!l || !l.length) return;
        $('#ouvertes').hidden = false;
        $('#t-ouvertes').innerHTML = '<tr><th>Ouverte</th><th>Quiz</th><th>Groupe</th><th>PIN</th><th>Où en est-on</th><th></th></tr>' +
          l.map(function (p) {
            var ou = p.phase === 'accueil' ? 'accueil' : 'question ' + (p.idx + 1) + ' / ' + p.questions.length;
            return '<tr><td>' + new Date(p.ouverte_le).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + '</td><td>' + esc(p.titre) + '</td><td>' + esc(p.groupe || '') + '</td>' +
              '<td>' + p.pin + '</td><td>' + ou + '</td><td><button class="bouton petit" data-reprendre="' + p.id + '">Reprendre</button> ' +
              '<button class="lien-bouton" data-terminer="' + p.id + '">Terminer</button></td></tr>';
          }).join('');
        app.querySelectorAll('[data-reprendre]').forEach(function (b) { b.onclick = function () { ouvrirScene(b.dataset.reprendre); }; });
        app.querySelectorAll('[data-terminer]').forEach(function (b) {
          b.onclick = function () { Q.rpc('quiz_piloter', { p_partie: b.dataset.terminer, p_action: 'fin' }).then(bibliotheque, erreurGlobale); };
        });
      }).catch(function () { /* pas bloquant */ });
  }

  /* ---------- import ---------- */
  function journal(texte, ko) {
    var li = document.createElement('li'); li.textContent = texte; if (ko) li.className = 'ko';
    $('#journal').prepend(li);
  }
  /* Un fichier porte un quiz { slug, titre, questions }, ou une
     banque { quiz: [ … ] } (l'export du prototype). */
  function importer(fichiers) {
    Array.prototype.forEach.call(fichiers || [], function (f) {
      f.text().then(function (t) {
        var d = JSON.parse(t), liste = Array.isArray(d.quiz) ? d.quiz : [d];
        return liste.reduce(function (p, z) {
          return p.then(function () {
            if (!z.slug && z.id) z.slug = String(z.id);
            if (!z.slug || !z.titre) throw new Error('il manque « slug » ou « titre »');
            return Q.rpc('quiz_importer', { p_quiz: z }).then(function () {
              journal('✓ ' + f.name + ' — « ' + z.titre + ' » (' + (z.questions || []).length + ' questions)');
            }, function (e) { journal('✗ ' + f.name + ' — « ' + z.titre + ' » : ' + Q.messageErreur(e), true); });
          });
        }, Promise.resolve());
      }).catch(function (e) {
        journal('✗ ' + f.name + ' : ' + (e instanceof SyntaxError ? 'ce n\'est pas un JSON valide' : Q.messageErreur(e)), true);
      }).then(chargerQuiz);
    });
  }
  function exporter(z) {
    var d = { slug: z.slug, titre: z.titre, niveau: z.niveau, matiere: z.matiere, description: z.description, partage: z.partage, questions: z.questions };
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' }));
    a.download = z.slug + '.json'; document.body.appendChild(a); a.click(); a.remove();
  }
  function supprimer(z) {
    if (!confirm('Supprimer « ' + z.titre + ' » ? Les statistiques des parties déjà jouées sont gardées.')) return;
    Q.rest('quiz_quiz?id=eq.' + z.id, { methode: 'DELETE' }).then(chargerQuiz, erreurGlobale);
  }

  /* ---------- aperçu : tout, corrigés et points à vérifier compris ---------- */
  var NOMS_TYPES = { qcm: 'QCM', vf: 'Vrai / faux', num: 'Valeur numérique', ordre: 'Remise en ordre', zone: 'Zone sur image',
                     assoc: 'Association', mot: 'Mot à taper', curseur: 'Curseur' };
  function corrigeTexte(q) {
    if (q.type === 'qcm' || q.type === 'vf') {
      var opts = q.options || ['Vrai', 'Faux'];
      return '<ol type="A" style="margin:4px 0;padding-left:1.6em">' + opts.map(function (o, i) {
        var ok = (q.correct || []).indexOf(i) >= 0, why = q.pourquoi && q.pourquoi[i];
        return '<li' + (ok ? ' style="font-weight:700;color:var(--juste)"' : '') + '>' + Q.rendre(o) + (ok ? ' ✓' : '') +
          (why ? '<div class="note">→ ' + Q.rendre(why) + '</div>' : '') + '</li>';
      }).join('') + '</ol>';
    }
    if (q.type === 'num') {
      var n = q.num || {};
      return '<p>✓ <b>' + Q.ecrireNombre(n.valeur) + ' ' + esc(n.unite || '') + '</b> (± ' + Math.round((n.tolerance != null ? n.tolerance : 0.02) * 1000) / 10 + ' %)' +
        (n.unites ? ' · unités proposées : ' + esc(n.unites.join(', ')) : '') + '</p>' +
        (n.pieges || []).map(function (p) { return '<p class="note">piège ' + Q.ecrireNombre(p.valeur) + ' ' + esc(p.unite || '') + ' → ' + Q.rendre(p.message || '') + '</p>'; }).join('');
    }
    if (q.type === 'ordre') return '<ol style="margin:4px 0">' + (q.items || []).map(function (t) { return '<li>' + Q.rendre(t) + '</li>'; }).join('') + '</ol>';
    if (q.type === 'zone') return '<p>' + (q.zone.cibles || []).length + ' zone(s) juste(s) sur ' + esc(q.zone.src) + '</p>';
    if (q.type === 'assoc') return '<ul style="margin:4px 0">' + (q.paires || []).map(function (p) { return '<li>' + Q.rendre(p[0]) + ' → ' + Q.rendre(p[1]) + '</li>'; }).join('') + '</ul>';
    if (q.type === 'mot') return '<p>✓ <b>' + esc((q.mot.acceptes || []).join(' · ')) + '</b>' + (q.mot.indice ? ' · indice : ' + esc(q.mot.indice) : '') + '</p>' +
      (q.mot.pieges || []).map(function (p) { return '<p class="note">piège « ' + esc(p.mot) + ' » → ' + Q.rendre(p.message || '') + '</p>'; }).join('');
    if (q.type === 'curseur') { var c = q.curseur; return '<p>✓ <b>' + Q.ecrireNombre(c.valeur) + ' ' + esc(c.unite || '') + '</b> (± ' + Q.ecrireNombre(c.tolerance || 0) + ', des points jusqu’à ± ' + Q.ecrireNombre(c.marge != null ? c.marge : 3 * (c.tolerance || c.pas || 1)) + ') · échelle ' + Q.ecrireNombre(c.min) + ' à ' + Q.ecrireNombre(c.max) + ', pas ' + Q.ecrireNombre(c.pas || 1) + '</p>'; }
    return '';
  }
  function apercu(z) {
    $('#apercu-corps').innerHTML = '<h2>' + esc(z.titre) + '</h2><p class="note">' + esc(z.description || '') + '</p>' +
      (z.questions || []).map(function (q, i) {
        var img = q.image && Q.urlImage(q.image.src);
        return '<section class="panneau" style="margin-top:12px">' +
          '<h3>Question ' + (i + 1) + ' · ' + NOMS_TYPES[q.type] + ' · ' + (q.temps || 20) + ' s' + (q.notion ? ' · ' + esc(q.notion) : '') + (q.bo ? ' · BO : ' + esc(q.bo) : '') + '</h3>' +
          (q.a_verifier ? '<p class="erreur">⚠ À vérifier : ' + esc(q.a_verifier) + '</p>' : '') +
          '<p><b>' + Q.rendre(q.enonce) + '</b></p>' +
          (img ? '<img src="' + esc(img) + '" alt="' + esc(q.image.alt || '') + '" style="max-width:280px;border:1px solid var(--encre)">' : '') +
          (q.image_attendue ? '<div class="reserve-img">Image à fournir : ' + esc(q.image_attendue) + '</div>' : '') +
          corrigeTexte(q) +
          (q.cours ? '<p class="note"><b>À retenir</b> — ' + Q.rendre(q.cours) + '</p>' : '') +
          '</section>';
      }).join('');
    $('#d-apercu').showModal();
  }

  /* ---------- le QR code fixe d'un quiz ----------
     Il porte l'adresse de la SALLE du quiz, qui ne change jamais : posé
     sur une diapositive ou une fiche, il fait attendre les élèves jusqu'au
     lancement (ils entrent alors d'eux-mêmes), ou leur permet de
     s'entraîner seuls quand aucune partie n'est ouverte. */
  function qrMatrice(texte) {
    var g = window.qrcode(0, 'M'); g.addData(texte); g.make(); return g;
  }
  function qrPng(texte, code) {
    var g = qrMatrice(texte), n = g.getModuleCount(), m = 16, bord = 4 * m;
    var c = document.createElement('canvas');
    c.width = n * m + 2 * bord; c.height = n * m + 2 * bord + 70;
    var x = c.getContext('2d');
    x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
    x.fillStyle = '#141A26';
    for (var r = 0; r < n; r++) for (var k = 0; k < n; k++) if (g.isDark(r, k)) x.fillRect(bord + k * m, bord + r * m, m, m);
    x.font = 'bold 44px Courier New, monospace'; x.textAlign = 'center';
    x.fillText(code, c.width / 2, n * m + 2 * bord + 30);
    return c.toDataURL('image/png');
  }
  function qrFixe(z) {
    var url = Q.urlSalle(z.salle);
    $('#apercu-corps').innerHTML = '<h2>QR code fixe — ' + esc(z.titre) + '</h2>' +
      '<div style="display:flex;gap:24px;align-items:center;flex-wrap:wrap">' +
        '<div class="qr" style="width:260px">' + qrMatrice(url).createSvgTag({ cellSize: 6, margin: 2, scalable: true }) + '</div>' +
        '<div style="flex:1;min-width:240px">' +
          '<p class="capitales">Code de salle</p><p class="pin" style="font-size:2.4rem">' + esc(z.salle) + '</p>' +
          '<p class="note" style="word-break:break-all">' + esc(url) + '</p>' +
          '<p>Ce QR code ne change jamais : posez-le sur la diapositive ou la fiche.</p>' +
          '<ul class="note" style="padding-left:1.2em">' +
            '<li><b>En classe</b> : les élèves scannent et attendent ; quand vous lancez le quiz, ils entrent tous dans la partie.</li>' +
            '<li><b>Sans partie ouverte</b> (à la maison) : ils peuvent s’entraîner seuls. Ces essais sont rangés à part dans vos statistiques.</li>' +
          '</ul>' +
          '<p><a class="bouton petit" id="b-png" download="diapason-' + esc(z.slug) + '-' + esc(z.salle) + '.png">Télécharger l’image (PNG)</a> ' +
          '<button class="bouton creux petit" type="button" id="b-copier">Copier l’adresse</button></p>' +
        '</div></div>';
    $('#b-png').href = qrPng(url, z.salle);
    $('#b-copier').onclick = function () {
      var b = this;
      (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(function () { b.textContent = 'Adresse copiée'; }, function () { prompt('Adresse à copier :', url); });
    };
    $('#d-apercu').showModal();
  }

  /* ---------- lancer ---------- */
  function dialogueLancer(z) {
    var d = $('#d-lancer');
    $('#d-lancer-titre').textContent = z.titre;
    try { $('#l-groupe').value = localStorage.getItem('quiz.groupe') || ''; } catch (e) { /* rien */ }
    d.returnValue = '';
    d.onclose = function () {
      if (d.returnValue !== 'ok') return;
      var g = $('#l-groupe').value.trim();
      try { localStorage.setItem('quiz.groupe', g); } catch (e) { /* rien */ }
      Q.rpc('quiz_lancer', { p_quiz: z.id, p_groupe: g || null, p_options: { pari: $('#l-pari').checked } })
        .then(function (r) { ouvrirScene(r.id); }, erreurGlobale);
    };
    d.showModal();
  }

  function erreurGlobale(e) {
    if (/SESSION_EXPIREE/.test(String(e && e.message))) { location.reload(); return; }
    alert(Q.messageErreur(e));
  }

  /* ============================================================
   *  3. La scène projetée
   * ============================================================ */
  var P = null;   // { partie, suivi, vue, echeance, rt, minuteur, chrono, enCours }

  function ouvrirScene(id) {
    Q.rest('quiz_parties?id=eq.' + id + '&select=*').then(function (l) {
      if (!l || !l.length) throw new Error('QUIZ_PARTIE_INCONNUE');
      try { localStorage.setItem(CLE_ANIM, id); } catch (e) { /* rien */ }
      P = { partie: l[0], suivi: null, vue: null, echeance: 0, enCours: false, auto: false };
      P.rt = Q.canal(id, function () {}, function () {});
      document.addEventListener('keydown', clavier);
      rafraichir();
    }).catch(erreurGlobale);
  }
  function sortirScene() {
    if (!P) return;
    clearTimeout(P.minuteur); clearInterval(P.chrono);
    if (P.rt) P.rt.fermer();
    document.removeEventListener('keydown', clavier);
    var s = $('.scene'); if (s) s.remove();
    P = null;
    try { localStorage.removeItem(CLE_ANIM); } catch (e) { /* rien */ }
  }

  function rafraichir() {
    if (!P) return;
    clearTimeout(P.minuteur);
    Q.rpc('quiz_suivi', { p_partie: P.partie.id }).then(function (s) {
      if (!P) return;
      var avant = P.suivi; P.suivi = s;
      if (s.phase === 'question') {
        var ech = performance.now() + s.reste_ms;
        if (!avant || avant.idx !== s.idx || avant.phase !== 'question' || Math.abs(ech - P.echeance) > 700) P.echeance = ech;
      }
      var vue = s.phase === 'correction' && P.vue === 'classement' && avant && avant.idx === s.idx ? 'classement' : s.phase;
      var cle = vue + '|' + s.idx;
      if (cle !== P.vueCle) { P.vue = vue; P.vueCle = cle; P.auto = false; dessiner(); }
      else majDynamique();
      // tout le monde a répondu : on n'attend pas la fin du chrono
      if (s.phase === 'question' && s.joueurs.length && s.reponses.length >= s.joueurs.length && !P.auto) {
        P.auto = true; setTimeout(function () { action('corriger'); }, 700);
      }
      P.minuteur = setTimeout(rafraichir, s.phase === 'question' ? 800 : s.phase === 'accueil' ? 1500 : 4000);
    }).catch(function (e) {
      if (/SESSION_EXPIREE/.test(String(e && e.message))) return erreurGlobale(e);
      if (P) P.minuteur = setTimeout(rafraichir, 2000);
    });
  }

  function action(quoi, idx) {
    if (!P || P.enCours) return;
    P.enCours = true;
    Q.rpc('quiz_piloter', { p_partie: P.partie.id, p_action: quoi, p_idx: idx == null ? null : idx }).then(function (r) {
      P.enCours = false;
      if (P.rt) P.rt.envoyer(r.version);
      rafraichir();
    }).catch(function (e) { if (P) P.enCours = false; if (!/QUIZ_PAS_DE_QUESTION/.test(String(e.message))) erreurGlobale(e); else rafraichir(); });
  }
  function principal() {
    if (!P || !P.suivi) return;
    var s = P.suivi, n = P.partie.questions.length;
    if (P.vue === 'accueil') action('question', 0);
    else if (P.vue === 'question') action('corriger');
    else if (P.vue === 'correction') { P.vue = 'classement'; P.vueCle = 'classement|' + s.idx; dessiner(); }
    else if (P.vue === 'classement') { if (s.idx + 1 < n) action('question', s.idx + 1); else action('fin'); }
  }
  function clavier(e) {
    if (document.querySelector('dialog[open]') || /INPUT|TEXTAREA|SELECT/.test((e.target || {}).tagName)) return;
    if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); principal(); }
    else if (e.key === 'f' || e.key === 'F') pleinEcran();
  }
  function pleinEcran() {
    var d = document.documentElement;
    if (document.fullscreenElement) document.exitFullscreen(); else if (d.requestFullscreen) d.requestFullscreen().catch(function () {});
  }

  /* ---------- dessin ---------- */
  /* l'espace fine manque dans Abril Fatface : une marge à la place */
  function pinLisible(p) { return p.slice(0, 3) + '<span style="margin-left:.28em"></span>' + p.slice(3); }
  function cadre(corps, pied) {
    var p = P.partie, s = P.suivi;
    var scene = $('.scene') || document.body.appendChild(document.createElement('div'));
    scene.className = 'scene';
    scene.innerHTML = '<div class="cadre">' +
      '<div class="tete"><span class="marque">' + esc(Q.NOM) + '</span><span>' + esc(p.titre) + '</span><span class="pousse"></span>' +
        (P.vue !== 'accueil' && P.vue !== 'fin' && !s.ferme ? '<span>Code <b>' + pinLisible(p.pin) + '</b></span>' : '') +
        '<span id="nb-joueurs">' + s.joueurs.length + ' joueur' + (s.joueurs.length > 1 ? 's' : '') + '</span>' +
        '<button class="lien-bouton" type="button" id="b-plein" title="Plein écran (touche F)">⛶</button>' +
        '<button class="lien-bouton" type="button" id="b-sortir">Quitter l\'écran</button></div>' +
      corps + (pied ? '<div class="pied">' + pied + '</div>' : '') + '</div>';
    $('#b-plein').onclick = pleinEcran;
    $('#b-sortir').onclick = function () {
      if (P.suivi.phase === 'fin' || confirm('Quitter l\'écran ? La partie reste ouverte : tu pourras la reprendre depuis la bibliothèque.')) bibliotheque();
    };
    var b = $('#b-principal'); if (b) b.onclick = principal;
  }
  function piedAvec(libelle, extra) {
    return '<span class="aide">Espace ou → pour avancer · F plein écran</span><span class="pousse"></span>' + (extra || '') +
      (libelle ? '<button class="bouton rouge" type="button" id="b-principal">' + libelle + '</button>' : '');
  }

  function dessiner() {
    clearInterval(P.chrono);
    if (P.vue === 'accueil') return vueAccueil();
    if (P.vue === 'question') return vueQuestion();
    if (P.vue === 'correction') return vueCorrection();
    if (P.vue === 'classement') return vueClassement();
    if (P.vue === 'fin') return vueFin();
  }
  function majDynamique() {
    if (P.vue === 'accueil') majInscrits();
    if (P.vue === 'question') {
      var c = $('#nb-rep'); if (c) c.textContent = P.suivi.reponses.length;
      var t = $('#sur-rep'); if (t) t.textContent = P.suivi.joueurs.length;
    }
    majNbJoueurs();
  }
  function majNbJoueurs() {
    var j = $('#nb-joueurs'), n = P.suivi.joueurs.length;
    if (j) j.textContent = n + ' joueur' + (n > 1 ? 's' : '');
  }

  /* --- accueil : l'affiche --- */
  function vueAccueil() {
    var p = P.partie, url = Q.urlEleve(), qr = '';
    if (window.qrcode) { var g = window.qrcode(0, 'M'); g.addData(Q.urlEleve(p.pin)); g.make(); qr = g.createSvgTag({ cellSize: 6, margin: 1, scalable: true }); }
    var n = p.questions.length;
    cadre('<div class="accueil">' +
      '<div class="gauche">' +
        '<div class="capitales">★ ' + esc(p.groupe || 'Grande séance') + ' ★</div>' +
        '<div><div class="titre-affiche">' + esc(p.titre) + '</div>' +
          '<div class="sous filet" style="margin-top:14px">' + n + ' question' + (n > 1 ? 's' : '') + (p.options && p.options.pari ? ' · pari de confiance' : '') + '</div></div>' +
        '<div class="rejoindre">' +
          '<div style="text-align:center"><div class="qr">' + qr + '</div><div class="capitales" style="margin-top:6px">Scannez</div></div>' +
          '<div class="ou" aria-hidden="true">ou</div>' +
          '<div class="pin-bloc"><div class="capitales">Code d\'entrée</div><div class="pin">' + pinLisible(p.pin) + '</div>' +
            '<div class="url">sur ' + esc(url.replace(/^https?:\/\//, '')) + '</div></div>' +
        '</div>' +
      '</div>' +
      '<div class="droite"><div class="entete"><span>Concurrents inscrits</span><span class="nb" id="nb-inscrits">0</span></div>' +
        '<div class="inscrits" id="inscrits"></div>' +
        '<p class="note" style="margin-top:auto">Cliquer un nom pour le retirer de la partie. Ceux qui attendaient avec le QR code fixe du quiz entrent d’eux-mêmes.</p></div>' +
      '</div>', piedAvec('Ouvrir la séance'));
    majInscrits();
  }
  function majInscrits() {
    var box = $('#inscrits'); if (!box) return;
    var deja = {}; box.querySelectorAll('button').forEach(function (b) { deja[b.dataset.id] = b; });
    var vus = {};
    P.suivi.joueurs.forEach(function (j) {
      vus[j.id] = 1;
      if (deja[j.id]) return;
      var b = document.createElement('button'); b.type = 'button'; b.dataset.id = j.id; b.textContent = j.pseudo;
      b.title = 'Retirer ' + j.pseudo;
      b.onclick = function () {
        if (!confirm('Retirer « ' + j.pseudo + ' » de la partie ?')) return;
        Q.rpc('quiz_exclure', { p_partie: P.partie.id, p_joueur: j.id }).then(function () {
          if (P.rt) P.rt.envoyer(-1); rafraichir();
        }, erreurGlobale);
      };
      box.appendChild(b);
    });
    Object.keys(deja).forEach(function (id) { if (!vus[id]) deja[id].remove(); });
    $('#nb-inscrits').textContent = P.suivi.joueurs.length;
    majNbJoueurs();
  }

  /* --- question --- */
  function enonceHtml(q, i) {
    var img = q.image && Q.urlImage(q.image.src);
    return '<div class="q-entete"><span class="q-num">Question ' + (i + 1) + ' / ' + P.partie.questions.length + '</span>' +
      (q.notion ? '<span class="q-notion">' + esc(q.notion) + '</span>' : '') + '</div>' +
      '<p class="q-enonce">' + Q.rendre(q.enonce) + '</p>' +
      { img: img ? '<div class="q-image"><img src="' + esc(img) + '" alt="' + esc(q.image.alt || '') + '"></div>' : '' }.img;
  }
  function optionsDe(q) { return q.type === 'vf' ? (q.options || ['Vrai', 'Faux']) : q.options; }
  function grilleOptions(q, comptes, correction) {
    return '<div class="grille-proj">' + optionsDe(q).map(function (o, i) {
      var bonne = correction && q.correct.indexOf(i) >= 0;
      return '<div class="rep c' + i + (correction ? (bonne ? ' bonne' : ' eteinte') : '') + '"><span class="forme" aria-hidden="true">' + Q.FORMES[i] + '</span>' +
        '<span><span class="lettre">' + Q.LETTRES[i] + '</span> · ' + Q.rendre(o) + '</span>' +
        (comptes ? '<span class="nb">' + comptes[i] + '</span>' : '') + '</div>';
    }).join('') + '</div>';
  }
  function zoneHtml(q, reponses, correction) {
    var h = '<div style="text-align:center"><div class="zone-proj"><img src="' + esc(Q.urlImage(q.zone.src)) + '" alt="' + esc(q.zone.alt || '') + '">';
    if (correction) {
      (q.zone.cibles || []).forEach(function (z) { h += '<span class="cible" style="left:' + z.x + '%;top:' + z.y + '%;width:' + z.l + '%;height:' + z.h + '%"></span>'; });
      (reponses || []).forEach(function (r) {
        if (r.reponse && typeof r.reponse.x === 'number') h += '<span class="impact' + (r.juste ? ' ok' : '') + '" style="left:' + r.reponse.x + '%;top:' + r.reponse.y + '%"></span>';
      });
    }
    return h + '</div></div>';
  }
  /* l'association projetée : à gauche dans l'ordre, à droite mélangée
     (le même mélange que sur les téléphones) ; à la correction, en paires */
  function assocProj(q, correction) {
    var g = q.paires.map(function (p) { return p[0]; });
    var d = correction ? q.paires.map(function (p) { return p[1]; }) : q.melange.map(function (k) { return q.paires[k][1]; });
    return '<div class="assoc-proj">' + g.map(function (t, i) {
      return '<div><b>' + (i + 1) + '</b><span>' + Q.rendre(t) + '</span></div><div><b>' + (correction ? '→' : Q.LETTRES[i]) + '</b><span>' + Q.rendre(d[i]) + '</span></div>';
    }).join('') + '</div>';
  }
  /* le curseur projeté : l'échelle ; à la correction, la bonne valeur, la
     tolérance et un point par réponse de la classe */
  function curseurProj(q, reponses, correction) {
    var c = q.curseur, pc = function (v) { return Math.max(0, Math.min(100, (v - c.min) / (c.max - c.min) * 100)); };
    var h = '<div class="curseur-proj"><span>' + Q.ecrireNombre(c.min) + '</span><div class="piste">';
    if (correction) {
      var t = c.tolerance || 0;
      h += '<span class="tol" style="left:' + pc(c.valeur - t) + '%;width:' + (pc(c.valeur + t) - pc(c.valeur - t)) + '%"></span>';
      (reponses || []).forEach(function (r) { if (r.reponse && typeof r.reponse.valeur === 'number') h += '<span class="coup" style="left:' + pc(r.reponse.valeur) + '%"></span>'; });
      h += '<span class="marque" style="left:' + pc(c.valeur) + '%"></span>';
    }
    return h + '</div><span>' + Q.ecrireNombre(c.max) + ' ' + esc(c.unite || '') + '</span></div>' +
      (correction ? '<p class="curseur-juste">✓ <b>' + Q.ecrireNombre(c.valeur) + ' ' + esc(c.unite || '') + '</b>' + (t ? ' (± ' + Q.ecrireNombre(t) + ' accepté)' : '') + ' · un point rouge par réponse</p>' : '<p class="note">Curseur à placer sur le téléphone.</p>');
  }
  function vueQuestion() {
    var s = P.suivi, q = P.partie.questions[s.idx], corps;
    if (q.type === 'qcm' || q.type === 'vf') corps = grilleOptions(q, null, false);
    else if (q.type === 'num') corps = '<div class="bandeau-saisie">Réponse à taper sur le téléphone' + (q.num.unites && q.num.unites.length > 1 ? ', unité à choisir' : q.num.unites && q.num.unites.length === 1 ? ', en ' + esc(q.num.unites[0]) : '') + '.</div>';
    else if (q.type === 'ordre') corps = '<ol class="ordre-proj">' + q.melange.map(function (k, i) { return '<li><b>' + Q.LETTRES[i] + '</b><span>' + Q.rendre(q.items[k]) + '</span></li>'; }).join('') + '</ol><p class="note">À remettre dans l\'ordre sur le téléphone.</p>';
    else if (q.type === 'assoc') corps = assocProj(q) + '<p class="note">À relier sur le téléphone.</p>';
    else if (q.type === 'mot') corps = '<div class="bandeau-saisie">Réponse à taper sur le téléphone' + (q.mot.indice ? ' · ' + esc(q.mot.indice) : '') + '.</div>';
    else if (q.type === 'curseur') corps = curseurProj(q, null, false);
    else corps = zoneHtml(q, null, false) + '<p class="note" style="text-align:center">À toucher sur l\'image du téléphone.</p>';
    var img = q.image && Q.urlImage(q.image.src);
    cadre('<div class="corps">' +
      '<div class="q-entete"><span class="q-num">Question ' + (s.idx + 1) + ' / ' + P.partie.questions.length + '</span>' + (q.notion ? '<span class="q-notion">' + esc(q.notion) + '</span>' : '') + '</div>' +
      '<div class="q-milieu"><div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:16px">' +
        '<p class="q-enonce">' + Q.rendre(q.enonce) + '</p>' +
        (img ? '<div class="q-image"><img src="' + esc(img) + '" alt="' + esc(q.image.alt || '') + '"></div>' : '') + '</div>' +
        '<div class="compte"><div class="rond" id="rond"><span id="sec"></span></div><div class="nb-rep"><b id="nb-rep">' + s.reponses.length + '</b>réponses sur <span id="sur-rep">' + s.joueurs.length + '</span></div></div>' +
      '</div>' + corps + '</div>', piedAvec('Arrêter le chrono'));
    var duree = (q.temps || 20) * 1000;
    var tic = function () {
      var reste = Math.max(0, P.echeance - performance.now()), r = $('#rond');
      if (!r) return;
      r.style.setProperty('--p', (reste / duree).toFixed(3));
      r.classList.toggle('urgent', reste < 5000);
      $('#sec').textContent = Math.ceil(reste / 1000);
      if (reste <= 0 && !P.auto) { P.auto = true; action('corriger'); }
    };
    tic(); P.chrono = setInterval(tic, 100);
  }

  /* --- correction --- */
  function libelleCategorie(q, c) {
    if (c === 'juste') return 'Juste';
    if (c === 'faux') return 'Faux';
    if (c === 'unite') return 'Bonne valeur, mauvaise unité';
    if (c === 'autre') return q.type === 'num' ? 'Autre valeur' : q.type === 'mot' ? 'Autre mot' : 'Autre';
    if (c === 'proche') return 'Proche';
    if (c === 'loin') return 'Trop loin';
    var pa = /^partiel:(\d+)$/.exec(c);
    if (pa) return pa[1] + ' paire' + (+pa[1] > 1 ? 's' : '') + ' sur ' + q.paires.length;
    var m = /^piege:(\d+)$/.exec(c);
    if (m && q.type === 'mot') return '« ' + q.mot.pieges[+m[1]].mot + ' »';
    if (m) { var p = q.num.pieges[+m[1]]; return Q.ecrireNombre(p.valeur) + (p.unite ? ' ' + p.unite : ''); }
    return c;
  }
  function messageCategorie(q, c) {
    if (/^\d+$/.test(c)) return q.pourquoi && q.pourquoi[+c];
    if (c === 'unite') return (q.num && q.num.message_unite) || 'La valeur est bonne, mais pas l\'unité.';
    var m = /^piege:(\d+)$/.exec(c);
    if (m) return (q.type === 'mot' ? q.mot : q.num).pieges[+m[1]].message;
    return null;
  }
  function vueCorrection() {
    var s = P.suivi, q = P.partie.questions[s.idx], rep = s.reponses, total = s.joueurs.length;
    var justes = rep.filter(function (r) { return r.juste; }).length;
    var haut = '', repart = '';
    // les erreurs, de la plus fréquente à la plus rare
    var cats = {};
    rep.forEach(function (r) { if (!r.juste) cats[r.categorie] = (cats[r.categorie] || 0) + 1; });
    var erreurs = Object.keys(cats).filter(function (c) { return messageCategorie(q, c); }).sort(function (a, b) { return cats[b] - cats[a]; });

    if (q.type === 'qcm' || q.type === 'vf') {
      var comptes = optionsDe(q).map(function () { return 0; });
      rep.forEach(function (r) { (r.reponse.choix || []).forEach(function (i) { if (comptes[i] != null) comptes[i]++; }); });
      haut = grilleOptions(q, comptes, true);
    } else if (q.type === 'zone') {
      haut = zoneHtml(q, rep, true);
    } else if (q.type === 'ordre') {
      haut = '<ol class="ordre-proj">' + q.items.map(function (t, i) { return '<li><b>' + (i + 1) + '</b><span>' + Q.rendre(t) + '</span></li>'; }).join('') + '</ol>';
    } else if (q.type === 'num') {
      var n = q.num;
      haut = '<div class="bandeau-saisie" style="border-style:solid;border-color:var(--juste)">✓ <b>' + Q.ecrireNombre(n.valeur) + (n.unite ? ' ' + esc(n.unite) : '') + '</b>' +
        (n.autres || []).map(function (a) { return ' &nbsp;ou&nbsp; ' + Q.ecrireNombre(a.valeur) + ' ' + esc(a.unite || ''); }).join('') + '</div>';
    }
    else if (q.type === 'assoc') haut = assocProj(q, true);
    else if (q.type === 'curseur') haut = curseurProj(q, rep, true);
    else if (q.type === 'mot') {
      // les mots tapés par la classe, du plus fréquent au plus rare
      var mots = {}; rep.forEach(function (r) { var w = String((r.reponse && r.reponse.texte) || '').trim().toLowerCase(); if (w) mots[w] = (mots[w] || 0) + 1; });
      var tri = Object.keys(mots).sort(function (x, y) { return mots[y] - mots[x]; }).slice(0, 8);
      haut = '<div class="bandeau-saisie" style="border-style:solid;border-color:var(--juste)">✓ <b>' + esc(q.mot.acceptes[0]) + '</b>' +
        (tri.length ? '<div class="note" style="margin-top:8px">Tapé en classe : ' + tri.map(function (w) { return esc(w) + ' (' + mots[w] + ')'; }).join(' · ') + '</div>' : '') + '</div>';
    }
    if (q.type !== 'qcm' && q.type !== 'vf') {
      var toutes = {}; rep.forEach(function (r) { toutes[r.categorie] = (toutes[r.categorie] || 0) + 1; });
      var ordre = Object.keys(toutes).sort(function (a, b) { return (b === 'juste') - (a === 'juste') || toutes[b] - toutes[a]; });
      var max = Math.max.apply(null, [1].concat(ordre.map(function (c) { return toutes[c]; })));
      repart = '<div class="barres">' + ordre.map(function (c) {
        return '<div class="ligne' + (c === 'juste' ? ' bonne' : '') + '"><span>' + esc(libelleCategorie(q, c)) + '</span><span class="piste"><i style="width:' + (toutes[c] / max * 100) + '%"></i></span><span class="n">' + toutes[c] + '</span></div>';
      }).join('') + '</div>';
    }
    var sansRep = total - rep.length;
    var droite = (q.cours ? '<div class="panneau"><h3>À retenir</h3><p>' + Q.rendre(q.cours) + '</p></div>' : '') +
      (erreurs.length ? '<div class="panneau piege"><h3>Erreur la plus fréquente · ' + cats[erreurs[0]] + ' élève' + (cats[erreurs[0]] > 1 ? 's' : '') + '</h3><p>' + Q.rendre(messageCategorie(q, erreurs[0])) + '</p></div>' : '');
    var bilan = '<div class="correction"><div class="panneau"><h3>Réponses de la classe</h3>' +
        '<div class="grand">' + (rep.length ? Math.round(justes / rep.length * 100) : 0) + ' % de réussite</div>' +
        '<p>' + justes + ' juste' + (justes > 1 ? 's' : '') + ' sur ' + rep.length + ' réponse' + (rep.length > 1 ? 's' : '') + (sansRep > 0 ? ' · ' + sansRep + ' sans réponse' : '') + '</p>' + repart + '</div>' +
        '<div style="display:flex;flex-direction:column;gap:14px;min-width:0">' + droite + '</div></div>';
    // la zone : l'image à gauche, le bilan à droite — tout tient sur un écran 16:9
    // zone et association : la figure à gauche, le bilan à droite — tout tient sur un écran 16:9
    if (q.type === 'zone' || q.type === 'assoc') bilan = '<div class="zone-corr">' + haut + bilan + '</div>', haut = '';
    cadre('<div class="corps">' + enonceHtml(q, s.idx).replace('class="q-enonce"', 'class="q-enonce" style="font-size:clamp(1.2rem,2.2vw,2rem)"') + haut + bilan +
      '</div>', piedAvec('Classement', s.idx + 1 < P.partie.questions.length ? '<button class="bouton creux" type="button" id="b-suivante">Question suivante</button>' : ''));
    var b = $('#b-suivante'); if (b) b.onclick = function () { action('question', s.idx + 1); };
  }

  /* --- classement et fin --- */
  function tries() { return P.suivi.joueurs.slice().sort(function (a, b) { return b.score - a.score; }); }
  function vueClassement() {
    var s = P.suivi, n = P.partie.questions.length, top = tries().slice(0, 5);
    cadre('<div class="corps" style="justify-content:center;gap:28px">' +
      '<div style="text-align:center"><div class="capitales">Après la question ' + (s.idx + 1) + ' / ' + n + '</div><div class="titre-affiche" style="font-size:clamp(2.4rem,5vw,4.6rem)">Classement</div></div>' +
      '<ol class="classement">' + top.map(function (j, i) {
        return '<li><span class="r">' + (i + 1) + '</span><span class="p">' + esc(j.pseudo) + '</span><span class="s">' + j.score + '</span></li>';
      }).join('') + '</ol></div>', piedAvec(s.idx + 1 < n ? 'Question suivante' : 'Résultats finaux'));
  }
  function vueFin() {
    var t = tries(), m = [t[1], t[0], t[2]];
    cadre('<div class="corps">' +
      '<div style="text-align:center"><div class="capitales">' + esc(P.partie.titre) + '</div><div class="titre-affiche" style="font-size:clamp(2.4rem,5vw,4.6rem)">Le podium</div></div>' +
      '<div class="podium">' + m.map(function (j, k) {
        if (!j) return '<div class="marche"></div>';
        var r = [2, 1, 3][k];
        return '<div class="marche m' + r + '"><div class="who">' + esc(j.pseudo) + '</div><div class="pts">' + j.score + ' pts</div><div class="bloc">' + r + '</div></div>';
      }).join('') + '</div></div>',
      '<span class="aide">Chaque élève voit son bilan sur son téléphone.</span><span class="pousse"></span>' +
      '<a class="bouton creux" href="stats.html?partie=' + P.partie.id + '">Statistiques de la partie</a>' +
      '<button class="bouton" type="button" id="b-retour">Bibliothèque</button>');
    $('#b-retour').onclick = bibliotheque;
  }

  /* ---------- démarrage ---------- */
  Q.poserNom();
  Q.exigerConnexion(app, function () {
    var enCours = null;
    try { enCours = localStorage.getItem(CLE_ANIM); } catch (e) { /* rien */ }
    bibliotheque();
    if (enCours) ouvrirScene(enCours);
  });
})();
