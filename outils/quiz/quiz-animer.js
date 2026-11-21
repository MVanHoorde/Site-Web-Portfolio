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
  var Q = window.Quiz, $ = Q.$, $$ = Q.$$, esc = Q.esc;
  var app = $('#app');
  var CLE_ANIM = 'quiz.animation';
  var mesQuiz = [];

  /* ============================================================
   *  1. Bibliothèque — rangée en dossiers (051)
   *  Racine : une vignette par section (classe), illustrée par un
   *  visuel du site. Dans un dossier : ses sous-dossiers (chapitres),
   *  puis ses quiz, l'image du dossier en filigrane derrière.
   *  Sans 051 en base, la bibliothèque reste une liste à plat.
   * ============================================================ */
  var cats = null;          // null : 051 absent ; sinon la liste des dossiers
  var courant = null;       // id du dossier ouvert ; null = racine ; 'sans' = sans dossier
  var gestionnaire = false;
  var CLE_DOSSIER = 'quiz.dossier';

  function bibliotheque() {
    sortirScene();
    try { courant = localStorage.getItem(CLE_DOSSIER) || null; } catch (e) { /* rien */ }
    app.innerHTML =
      '<div class="filigrane" id="filigrane" aria-hidden="true"></div>' +
      '<div class="page">' +
        '<section id="ouvertes" hidden><h2>Parties ouvertes</h2><div class="defile"><table class="tableau" id="t-ouvertes"></table></div></section>' +
        '<section id="biblio"><p class="note">Chargement…</p></section>' +
        '<section><h2>Importer</h2>' +
          '<label class="depot" id="depot"><input type="file" id="f-import" accept=".json,application/json" multiple hidden>' +
            '<b>Déposer ici un ou plusieurs fichiers de quiz (.json)</b><br><span class="note" id="depot-note">ou cliquer pour les choisir. Un quiz déjà présent (même identifiant) est mis à jour ; ses parties passées gardent leurs questions d\'origine.</span></label>' +
          '<ul class="journal" id="journal"></ul>' +
        '</section>' +
      '</div>';
    var depot = $('#depot'), champ = $('#f-import');
    champ.onchange = function () { importer(champ.files); champ.value = ''; };
    ['dragenter', 'dragover'].forEach(function (t) { depot.addEventListener(t, function (e) { e.preventDefault(); depot.classList.add('survol'); }); });
    ['dragleave', 'drop'].forEach(function (t) { depot.addEventListener(t, function (e) { e.preventDefault(); depot.classList.remove('survol'); }); });
    depot.addEventListener('drop', function (e) { importer(e.dataTransfer.files); });
    Q.rpc('est_gestionnaire', {}).then(function (g) { gestionnaire = !!g; }, function () {});
    chargerQuiz();
    chargerOuvertes();
  }

  function chargerQuiz() {
    var lireQuiz = Q.rest('quiz_quiz?select=*&order=slug.asc');
    var lireCats = Q.rest('quiz_categories?select=id,parent,nom,sigle,image,focus,ordre,visible_eleves,auteur&order=ordre.asc,nom.asc')
      .catch(function (e) {
        // 051 pas encore en base : la liste à plat, comme avant
        if (/quiz_categories|PGRST205|42P01|does not exist|schema cache/i.test(String(e.message) + ' ' + String(e.code))) return null;
        throw e;
      });
    return Promise.all([lireQuiz, lireCats]).then(function (r) {
      mesQuiz = r[0] || [];
      cats = r[1];
      if (cats && courant && courant !== 'sans' && !cat(courant)) courant = null;
      dessinerBiblio();
    }).catch(erreurGlobale);
  }
  function trouver(id) { return mesQuiz.filter(function (z) { return z.id === id; })[0]; }

  /* ---------- l'arbre ---------- */
  function cat(id) { return (cats || []).filter(function (c) { return c.id === id; })[0]; }
  function enfants(id) { return (cats || []).filter(function (c) { return (c.parent || null) === (id || null); }); }
  function chemin(id) { var l = [], c = cat(id); while (c) { l.unshift(c); c = cat(c.parent); } return l; }
  function quizDe(id) {
    if (id === 'sans') return mesQuiz.filter(function (z) { return !z.categorie || !cat(z.categorie); });
    return mesQuiz.filter(function (z) { return z.categorie === id; });
  }
  /* tout ce qu'un dossier contient, sous-dossiers compris */
  function compte(id) {
    return quizDe(id).length + enfants(id).reduce(function (n, c) { return n + compte(c.id); }, 0);
  }
  /* l'image d'un dossier, ou à défaut celle du plus proche parent qui en a une */
  function imageDe(id) {
    var c = cat(id);
    while (c) { if (c.image) return { src: c.image, focus: c.focus }; c = cat(c.parent); }
    return null;
  }
  function peutModifier(c) { return c && (c.auteur === Q.monUid() || gestionnaire); }
  /* « 2de SNT » → 2<sup>de</sup> SNT, comme les portes de l'accueil du site */
  function sigleHtml(s) {
    return esc(s || '').replace(/^(\d|T)(de|re|le|e)\b/, '$1<sup>$2</sup>');
  }

  function poserFiligrane(id) {
    var f = $('#filigrane'); if (!f) return;
    var im = id && id !== 'sans' ? imageDe(id) : null, u = im && Q.urlFiligrane(im.src);
    f.style.backgroundImage = u ? 'url("' + u.replace(/"/g, '%22') + '")' : '';
    f.style.backgroundPosition = (im && im.focus) || '50% 50%';
    f.hidden = !u;
  }

  function vignette(c) {
    var im = imageDe(c.id), u = im && Q.urlFiligrane(im.src), n = compte(c.id), racine = !c.parent;
    var style = u ? ' style="--img:url(&quot;' + esc(u) + '&quot;);--focus:' + esc((im && im.focus) || '50% 50%') + '"' : '';
    return '<button type="button" class="vignette' + (racine ? ' section' : ' chapitre') + (u ? '' : ' sans-image') + '" data-ouvrir="' + c.id + '"' + style + '>' +
      (racine
        ? '<span class="vis"><span class="voile"></span><span class="gros">' + sigleHtml(c.sigle || c.nom) + '</span></span>'
        : '') +
      '<span class="txt"><span class="nom">' + esc(c.nom) + '</span>' +
        '<span class="meta">' + n + ' quiz' + (enfants(c.id).length ? ' · ' + enfants(c.id).length + ' dossier' + (enfants(c.id).length > 1 ? 's' : '') : '') +
        (c.visible_eleves ? '' : ' · <b>masqué aux élèves</b>') + '</span></span>' +
    '</button>';
  }

  function carteQuiz(z) {
    var moi = Q.monUid(), aMoi = z.auteur === moi, n = (z.questions || []).length;
    var aVerifier = (z.questions || []).filter(function (q) { return q.a_verifier; }).length;
    return '<article class="carte-quiz">' +
      '<h3>' + esc(z.titre) + '</h3>' +
      '<div class="meta">' + esc([z.niveau, z.matiere].filter(Boolean).join(' · ')) + '</div>' +
      '<div class="meta">' + n + ' question' + (n > 1 ? 's' : '') + ' · ' + (aMoi ? 'à moi' : 'd\'un collègue') + ' · modifié le ' + new Date(z.modifie_le).toLocaleDateString('fr-FR') +
        (aVerifier ? ' · <b style="color:var(--rouge)">' + aVerifier + ' à vérifier</b>' : '') +
        (cats && z.catalogue === false ? ' · <b>hors entraînement</b>' : '') + '</div>' +
      '<div class="actions">' +
        '<button class="bouton rouge petit" type="button" data-lancer="' + z.id + '">Lancer</button>' +
        '<button class="bouton creux petit" type="button" data-apercu="' + z.id + '">Aperçu</button>' +
        (aMoi ? '<button class="bouton creux petit" type="button" data-salle="' + z.id + '" title="Le QR code à poser sur une diapositive ou une fiche">QR code fixe</button>' : '') +
        (aMoi ? '<a class="bouton creux petit" href="editer.html?quiz=' + z.id + '">Modifier</a>' : '') +
        (aMoi && cats ? '<button class="bouton creux petit" type="button" data-ranger="' + z.id + '">Ranger</button>' : '') +
        '<button class="bouton creux petit" type="button" data-export="' + z.id + '">Exporter</button>' +
        (aMoi ? '<button class="lien-bouton" type="button" data-suppr="' + z.id + '">Supprimer</button>' : '') +
      '</div></article>';
  }

  function dessinerBiblio() {
    var box = $('#biblio'); if (!box) return;
    if (courant === 'sans' && !quizDe('sans').length) courant = null;   // tout est rangé
    try { if (courant) localStorage.setItem(CLE_DOSSIER, courant); else localStorage.removeItem(CLE_DOSSIER); } catch (e) { /* rien */ }
    var h = '';
    if (!cats) {
      // 051 absent
      h = '<div class="titre-biblio"><h2>Les quiz</h2><span class="pousse"></span><a class="bouton rouge petit" href="editer.html">+ Quiz</a></div><p class="note">' + (mesQuiz.length ? mesQuiz.length + ' quiz' : 'Aucun quiz pour l\'instant : importe un fichier ci-dessous.') +
        ' — Les dossiers arrivent avec le fichier SQL 051.</p><div class="liste-quiz">' + mesQuiz.map(carteQuiz).join('') + '</div>';
      courant = null;
    } else if (!courant) {
      var sans = quizDe('sans').length;
      h = '<div class="titre-biblio"><h2>Les sections</h2><span class="pousse"></span>' +
          '<button class="bouton creux petit" type="button" id="b-nouveau">+ Nouvelle section</button>' +
          '<a class="bouton rouge petit" href="editer.html">+ Quiz</a></div>' +
        '<p class="note">' + mesQuiz.length + ' quiz en tout. Une section par classe ; dedans, un dossier par chapitre.</p>' +
        '<div class="vignettes sections">' + enfants(null).map(vignette).join('') +
          (sans ? '<button type="button" class="vignette chapitre sans-image" data-ouvrir="sans"><span class="txt"><span class="nom">Sans dossier</span><span class="meta">' + sans + ' quiz à ranger</span></span></button>' : '') +
        '</div>';
    } else {
      var c = cat(courant), ch = courant === 'sans' ? [] : chemin(courant);
      var fil = '<nav class="fil" aria-label="Où suis-je"><button type="button" class="lien-bouton" data-ouvrir="">Toutes les sections</button>' +
        ch.map(function (x, i) {
          return ' <span aria-hidden="true">›</span> ' + (i < ch.length - 1 ? '<button type="button" class="lien-bouton" data-ouvrir="' + x.id + '">' + esc(x.nom) + '</button>' : '<b>' + esc(x.nom) + '</b>');
        }).join('') + (courant === 'sans' ? ' <span aria-hidden="true">›</span> <b>Sans dossier</b>' : '') + '</nav>';
      var sous = courant === 'sans' ? [] : enfants(courant), liste = quizDe(courant);
      h = fil +
        '<div class="titre-biblio">' + (c && !c.parent ? '<span class="sigle">' + sigleHtml(c.sigle || '') + '</span>' : '') +
          '<h2>' + esc(c ? c.nom : 'Sans dossier') + '</h2><span class="pousse"></span>' +
          (c ? '<button class="bouton creux petit" type="button" id="b-nouveau">+ Dossier</button>' : '') +
          '<a class="bouton rouge petit" href="editer.html' + (c ? '?dossier=' + c.id : '') + '">+ Quiz</a>' +
          (peutModifier(c) ? '<button class="bouton creux petit" type="button" id="b-modifier">Modifier</button>' : '') + '</div>' +
        (c && !c.visible_eleves ? '<p class="note"><b>Masqué aux élèves</b> : ce dossier et tout ce qu\'il contient sont absents de la page d\'entraînement.</p>' : '') +
        (sous.length ? '<div class="vignettes">' + sous.map(vignette).join('') + '</div>' : '') +
        (liste.length ? '<div class="liste-quiz">' + liste.map(carteQuiz).join('') + '</div>'
          : (sous.length ? '' : '<p class="note">Dossier vide. Crée un sous-dossier, range un quiz ici (bouton « Ranger »), ou importe un fichier : déposé pendant que ce dossier est ouvert, il y est rangé.</p>'));
    }
    box.innerHTML = h;
    poserFiligrane(courant);
    var note = $('#depot-note');
    if (note && cats) note.textContent = courant && courant !== 'sans'
      ? 'ou cliquer pour les choisir. Un fichier sans « dossier » est rangé dans « ' + cat(courant).nom + ' ». Un quiz déjà présent (même identifiant) est mis à jour.'
      : 'ou cliquer pour les choisir. Un fichier peut porter son chemin : "dossier": ["2de SNT", "Le Web"]. Un quiz déjà présent (même identifiant) est mis à jour.';
    box.querySelectorAll('[data-ouvrir]').forEach(function (b) {
      b.onclick = function () { courant = b.dataset.ouvrir || null; dessinerBiblio(); window.scrollTo(0, 0); };
    });
    var bn = $('#b-nouveau'); if (bn) bn.onclick = function () { editerDossier(null, courant); };
    var bm = $('#b-modifier'); if (bm) bm.onclick = function () { editerDossier(cat(courant)); };
    box.querySelectorAll('[data-lancer]').forEach(function (b) { b.onclick = function () { dialogueLancer(trouver(b.dataset.lancer)); }; });
    box.querySelectorAll('[data-apercu]').forEach(function (b) { b.onclick = function () { apercu(trouver(b.dataset.apercu)); }; });
    box.querySelectorAll('[data-salle]').forEach(function (b) { b.onclick = function () { qrFixe(trouver(b.dataset.salle)); }; });
    box.querySelectorAll('[data-ranger]').forEach(function (b) { b.onclick = function () { ranger(trouver(b.dataset.ranger)); }; });
    box.querySelectorAll('[data-export]').forEach(function (b) { b.onclick = function () { exporter(trouver(b.dataset.export)); }; });
    box.querySelectorAll('[data-suppr]').forEach(function (b) { b.onclick = function () { supprimer(trouver(b.dataset.suppr)); }; });
  }

  /* ---------- créer ou modifier un dossier ---------- */
  /* Les visuels du site, proposés d'un clic (ceux des portes de l'accueil). */
  var VISUELS = [
    ['assets/img/pc/2nde-pc-t1-c2/t1c2-fer-fusion-coulee.jpg', 'Fonte en fusion (2de PC)'],
    ['assets/img/snt/2nde-snt-t0-systemes-informatises/t0-carte-mere.jpg', 'Carte mère (SNT)'],
    ['assets/img/es/1re-es-t1-c1/t1c1-supernova-kepler-accueil.jpg', 'Supernova de Kepler (1re ES)'],
    ['assets/img/es/term-es-t2-c1/t2c1-turboalternateur-paluel-accueil.jpg', 'Turboalternateur (Tle ES)'],
    ['assets/img/pc/2nde-pc-t2-c2/t2c2-pommes-branche.jpg', 'Pommes (CFA)'],
    ['assets/img/quiz/sections/bts-ms-karman-nasa.jpg', 'Tourbillons de Kármán (BTS MS)']
  ];
  /* Une image de l'ordinateur : réduite à 720 px et recompressée, pour
     tenir en base sous 120 000 caractères (le filigrane n'a pas besoin
     de détail). */
  function reduireImage(fichier) {
    return new Promise(function (ok, ko) {
      var img = new Image(), u = URL.createObjectURL(fichier);
      img.onload = function () {
        URL.revokeObjectURL(u);
        var l = 720, k = Math.min(1, l / Math.max(img.width, img.height));
        var c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height);
        var q = 0.72, d = c.toDataURL('image/jpeg', q);
        while (d.length > 110000 && q > 0.3) { q -= 0.1; d = c.toDataURL('image/jpeg', q); }
        if (d.length > 110000) { c.width = Math.round(c.width / 2); c.height = Math.round(c.height / 2); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); d = c.toDataURL('image/jpeg', 0.6); }
        ok(d);
      };
      img.onerror = function () { URL.revokeObjectURL(u); ko(new Error('Image illisible.')); };
      img.src = u;
    });
  }

  function editerDossier(c, parent) {
    var neuf = !c, racine = neuf ? !parent || parent === 'sans' : !c.parent;
    var etat = { image: c ? c.image || '' : '', focus: c ? c.focus || '50% 50%' : '50% 50%' };
    var d = $('#d-dossier');
    $('#dossier-corps').innerHTML =
      '<h2>' + (neuf ? (racine ? 'Nouvelle section' : 'Nouveau dossier') : 'Modifier « ' + esc(c.nom) + ' »') + '</h2>' +
      (!neuf || !racine ? '' : '<p class="note">Une section par classe ; les chapitres se rangent dedans.</p>') +
      '<div class="champ"><label for="dos-nom">Nom</label><input id="dos-nom" maxlength="80" required value="' + esc(c ? c.nom : '') + '" placeholder="' + (racine ? 'ex. SNT — seconde' : 'ex. Le Web') + '"></div>' +
      (racine ? '<div class="champ"><label for="dos-sigle">Sigle sur la vignette</label><input id="dos-sigle" maxlength="16" value="' + esc(c ? c.sigle || '' : '') + '" placeholder="ex. 2de SNT"></div>' : '') +
      '<div class="champ"><label>Image en filigrane</label>' +
        '<div class="apercu-filigrane" id="dos-apercu"><span>' + esc(c ? c.nom : 'Aperçu') + '</span></div>' +
        '<div class="visuels" id="dos-visuels">' + VISUELS.map(function (v) {
          return '<button type="button" data-v="' + esc(v[0]) + '" title="' + esc(v[1]) + '" style="background-image:url(&quot;' + esc(Q.urlImage(v[0])) + '&quot;)"><span class="sr">' + esc(v[1]) + '</span></button>';
        }).join('') + '</div>' +
        '<div class="ligne-boutons"><label class="bouton creux petit"><input type="file" id="dos-fichier" accept="image/*" hidden>Image de l\'ordinateur…</label>' +
          '<button class="lien-bouton" type="button" id="dos-sans">' + (racine ? 'Sans image' : 'Celle du dossier parent') + '</button></div>' +
        '<input id="dos-chemin" placeholder="ou un chemin du site (assets/img/…) / une adresse https" value="' + esc(/^data:/.test(etat.image) ? '' : etat.image) + '" style="font-size:.95rem">' +
        '<label for="dos-focus" class="note">Cadrage vertical de l\'image</label><input type="range" id="dos-focus" min="0" max="100" value="' + parseInt(String(etat.focus).split(' ')[1] || '50', 10) + '">' +
      '</div>' +
      '<label class="case"><input type="checkbox" id="dos-visible"' + (!c || c.visible_eleves ? ' checked' : '') + '><span><b>Visible des élèves</b> — ses quiz sont proposés sur la page d\'entraînement du site. Décoché, le dossier et tout ce qu\'il contient restent entre enseignants.</span></label>' +
      '<p class="erreur" id="dos-err"></p>' +
      '<div class="boutons">' +
        (!neuf && peutModifier(c) ? '<button class="lien-bouton" type="button" id="dos-suppr" style="margin-right:auto">Supprimer le dossier</button>' : '') +
        '<button class="bouton creux petit" type="button" id="dos-annuler">Annuler</button>' +
        '<button class="bouton rouge petit" type="button" id="dos-ok">' + (neuf ? 'Créer' : 'Enregistrer') + '</button></div>';
    var maj = function () {
      var src = etat.image || (!neuf && c.parent ? (imageDe(c.parent) || {}).src : (!racine && parent ? (imageDe(parent) || {}).src : '')) || '';
      var u = Q.urlFiligrane(src), a = $('#dos-apercu');
      a.style.backgroundImage = u ? 'url("' + u.replace(/"/g, '%22') + '")' : '';
      a.style.backgroundPosition = etat.focus;
      a.querySelector('span').textContent = $('#dos-nom').value || 'Aperçu';
      $$('#dos-visuels button').forEach(function (b) { b.classList.toggle('choisi', b.dataset.v === etat.image); });
    };
    $$('#dos-visuels button').forEach(function (b) { b.onclick = function () { etat.image = b.dataset.v; $('#dos-chemin').value = b.dataset.v; maj(); }; });
    $('#dos-sans').onclick = function () { etat.image = ''; $('#dos-chemin').value = ''; maj(); };
    $('#dos-chemin').oninput = function () { etat.image = this.value.trim(); maj(); };
    $('#dos-nom').oninput = maj;
    $('#dos-focus').oninput = function () { etat.focus = '50% ' + this.value + '%'; maj(); };
    $('#dos-fichier').onchange = function () {
      var f = this.files[0]; if (!f) return;
      reduireImage(f).then(function (data) { etat.image = data; $('#dos-chemin').value = ''; maj(); },
                           function (e) { $('#dos-err').textContent = e.message; });
    };
    $('#dos-annuler').onclick = function () { d.close(); };
    var bs = $('#dos-suppr');
    if (bs) bs.onclick = function () {
      if (enfants(c.id).length) { $('#dos-err').textContent = 'Ce dossier contient des sous-dossiers : déplace-les ou supprime-les d\'abord.'; return; }
      var n = quizDe(c.id).length;
      if (!confirm('Supprimer le dossier « ' + c.nom + ' » ?' + (n ? ' Ses ' + n + ' quiz ne sont pas supprimés : ils reviennent « sans dossier ».' : ''))) return;
      Q.rest('quiz_categories?id=eq.' + c.id, { methode: 'DELETE' }).then(function () {
        d.close(); courant = c.parent || null; chargerQuiz();
      }, function (e) { $('#dos-err').textContent = Q.messageErreur(e); });
    };
    $('#dos-ok').onclick = function () {
      var nom = $('#dos-nom').value.trim();
      if (!nom) { $('#dos-err').textContent = 'Donne un nom au dossier.'; return; }
      if (etat.image && !Q.urlFiligrane(etat.image)) { $('#dos-err').textContent = 'Chemin d\'image non reconnu : assets/img/…/x.jpg ou une adresse https.'; return; }
      var corps = { nom: nom, image: etat.image || null, focus: etat.focus, visible_eleves: $('#dos-visible').checked };
      if (racine) corps.sigle = ($('#dos-sigle').value || '').trim() || null;
      var req;
      if (neuf) {
        corps.parent = racine ? null : parent;
        corps.ordre = enfants(corps.parent).length + 1;
        req = Q.rest('quiz_categories', { methode: 'POST', corps: corps, prefer: 'return=representation' });
      } else req = Q.rest('quiz_categories?id=eq.' + c.id, { methode: 'PATCH', corps: corps, prefer: 'return=representation' });
      this.disabled = true;
      var b = this;
      req.then(function (r) {
        d.close();
        if (neuf && r && r[0]) courant = r[0].id;
        chargerQuiz();
      }, function (e) { b.disabled = false; $('#dos-err').textContent = Q.messageErreur(e); });
    };
    d.showModal(); maj(); $('#dos-nom').focus();
  }

  /* ---------- ranger un quiz ---------- */
  function ranger(z) {
    var d = $('#d-dossier');
    var options = [];
    (function parcourir(id, prof) {
      enfants(id).forEach(function (c) { options.push([c.id, prof, c.nom]); parcourir(c.id, prof + 1); });
    })(null, 0);
    $('#dossier-corps').innerHTML = '<h2>Ranger « ' + esc(z.titre) + ' »</h2>' +
      '<div class="champ"><label for="r-dossier">Dossier</label><select id="r-dossier"><option value="">— sans dossier —</option>' +
        options.map(function (o) {
          return '<option value="' + o[0] + '"' + (o[0] === z.categorie ? ' selected' : '') + '>' + '   '.repeat(o[1]) + (o[1] ? '└ ' : '') + esc(o[2]) + '</option>';
        }).join('') + '</select></div>' +
      '<label class="case"><input type="checkbox" id="r-catalogue"' + (z.catalogue !== false ? ' checked' : '') + '><span><b>Proposé à l\'entraînement</b> — les élèves le trouvent sur la page d\'entraînement du site (si son dossier est visible).</span></label>' +
      '<p class="erreur" id="dos-err"></p>' +
      '<div class="boutons"><button class="bouton creux petit" type="button" id="dos-annuler">Annuler</button>' +
        '<button class="bouton rouge petit" type="button" id="dos-ok">Ranger</button></div>';
    $('#dos-annuler').onclick = function () { d.close(); };
    $('#dos-ok').onclick = function () {
      var v = $('#r-dossier').value || null;
      Q.rest('quiz_quiz?id=eq.' + z.id, { methode: 'PATCH', corps: { categorie: v, catalogue: $('#r-catalogue').checked } })
        .then(function () { d.close(); chargerQuiz(); }, function (e) { $('#dos-err').textContent = Q.messageErreur(e); });
    };
    d.showModal();
  }

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
        $('#ouvertes').querySelectorAll('[data-reprendre]').forEach(function (b) { b.onclick = function () { ouvrirScene(b.dataset.reprendre); }; });
        $('#ouvertes').querySelectorAll('[data-terminer]').forEach(function (b) {
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
            // déposé dans un dossier ouvert, un fichier sans « dossier » y est rangé
            var ici = cats && courant && courant !== 'sans' && !z.dossier ? cat(courant) : null;
            return Q.rpc('quiz_importer', { p_quiz: z }).then(function (id) {
              return ici ? Q.rest('quiz_quiz?id=eq.' + id, { methode: 'PATCH', corps: { categorie: ici.id } }) : null;
            }).then(function () {
              journal('✓ ' + f.name + ' — « ' + z.titre + ' » (' + (z.questions || []).length + ' questions)' +
                (ici ? ' → ' + ici.nom : z.dossier ? ' → ' + [].concat(z.dossier).join(' › ') : ''));
            }, function (e) { journal('✗ ' + f.name + ' — « ' + z.titre + ' » : ' + Q.messageErreur(e), true); });
          });
        }, Promise.resolve());
      }).catch(function (e) {
        journal('✗ ' + f.name + ' : ' + (e instanceof SyntaxError ? 'ce n\'est pas un JSON valide' : Q.messageErreur(e)), true);
      }).then(chargerQuiz);
    });
  }
  function exporter(z) {
    var d = { slug: z.slug, titre: z.titre, niveau: z.niveau, matiere: z.matiere, description: z.description, partage: z.partage, salle: z.salle };
    if (cats && z.categorie && cat(z.categorie)) d.dossier = chemin(z.categorie).map(function (c) { return c.nom; });
    if (z.catalogue === false) d.catalogue = false;
    d.questions = z.questions;
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
          (q.revoir ? '<p class="note">' + Q.revoirHtml(q.revoir) + '</p>' : '') +
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
    var z = p.quiz_id && trouver(p.quiz_id), im = z && cats && z.categorie ? imageDe(z.categorie) : null, u = im && Q.urlFiligrane(im.src);
    if (u) { scene.style.setProperty('--filigrane', 'url("' + u.replace(/"/g, '%22') + '")'); scene.style.setProperty('--filigrane-pos', im.focus || '50% 50%'); }
    else scene.style.removeProperty('--filigrane');
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
        // un titre long (deux lignes) poussait le PIN hors de l'affiche en 1280 × 720
        '<div><div class="titre-affiche' + (p.titre.length > 16 ? ' long' : '') + '">' + esc(p.titre) + '</div>' +
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
      // un élève qui change de nom (048) reste le même inscrit : on met le nom à jour
      if (deja[j.id]) { if (deja[j.id].textContent !== j.pseudo) { deja[j.id].textContent = j.pseudo; deja[j.id].title = 'Retirer ' + j.pseudo; } return; }
      var b = document.createElement('button'); b.type = 'button'; b.dataset.id = j.id; b.textContent = j.pseudo;
      b.title = 'Retirer ' + j.pseudo;
      b.onclick = function () {
        if (!confirm('Retirer « ' + b.textContent + ' » de la partie ?')) return;
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
    var droite = (q.cours ? '<div class="panneau"><h3>À retenir</h3><p>' + Q.rendre(q.cours) + '</p>' +
        (q.revoir && q.revoir.texte ? '<p class="note">Dans le cours : ' + esc(q.revoir.texte) + '</p>' : '') + '</div>' : '') +
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
