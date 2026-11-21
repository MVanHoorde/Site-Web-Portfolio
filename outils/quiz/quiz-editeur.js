/* ============================================================
 *  quiz-editeur.js — l'éditeur de quiz (editer.html)
 *  ------------------------------------------------------------
 *  editer.html?quiz=<id>      modifier un quiz (son auteur seul)
 *  editer.html?dossier=<id>   créer un quiz rangé dans ce dossier
 *  editer.html                créer un quiz sans dossier
 *
 *  Le modèle est l'objet JSON du format de fichier (LISEZMOI.md) :
 *  ce qu'on écrit ici est exactement ce qu'un import enverrait.
 *  Enregistrer passe par quiz_importer (la base valide chaque
 *  question) ; le validateur quiz_question_invalide est aussi
 *  appelé avant, pour montrer l'erreur sur la bonne question.
 *  Un brouillon reste sur l'appareil tant que rien n'est enregistré.
 * ============================================================ */
(function () {
  'use strict';
  var Q = window.Quiz, $ = Q.$, $$ = Q.$$, esc = Q.esc;
  var app = $('#app');

  var TYPES = [
    ['qcm', 'QCM', 'De 2 à 6 réponses, une ou plusieurs justes'],
    ['vf', 'Vrai / faux', 'Une affirmation à juger'],
    ['num', 'Valeur numérique', 'Un nombre à taper, unité au choix'],
    ['ordre', 'Remise en ordre', '2 à 8 éléments à classer'],
    ['zone', 'Zone sur image', 'Toucher le bon endroit d\'une image'],
    ['assoc', 'Association', '3 à 6 paires à relier'],
    ['mot', 'Mot à taper', 'Une réponse courte, pièges prévus'],
    ['curseur', 'Curseur', 'Placer une valeur sur une échelle']
  ];
  var NOMS = {}; TYPES.forEach(function (t) { NOMS[t[0]] = t[1]; });

  var E = {
    quiz: null,        // métadonnées
    qs: [],            // questions (format du fichier)
    sel: 0,
    sale: false,
    erreurs: {},       // indice → message du validateur
    cats: null,        // dossiers (051), null si absents
    lectureSeule: false
  };

  /* ============================================================
   *  Outils
   * ============================================================ */
  function copie(o) { return JSON.parse(JSON.stringify(o)); }
  function nombre(s) { var v = Q.lireNombre(s); return isNaN(v) ? undefined : v; }
  function ecrire(v) { return v == null || (typeof v === 'number' && isNaN(v)) ? '' : String(v).replace('.', ','); }
  function slugifier(t) {
    return String(t || '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70) || 'quiz';
  }
  function lirePath(o, chemin) {
    return chemin.split('.').reduce(function (a, k) { return a == null ? undefined : a[k]; }, o);
  }
  function poserPath(o, chemin, v) {
    var ks = chemin.split('.'), a = o;
    for (var i = 0; i < ks.length - 1; i++) {
      if (a[ks[i]] == null) a[ks[i]] = /^\d+$/.test(ks[i + 1]) ? [] : {};
      a = a[ks[i]];
    }
    if (v === undefined) { if (Array.isArray(a)) a[ks[ks.length - 1]] = undefined; else delete a[ks[ks.length - 1]]; }
    else a[ks[ks.length - 1]] = v;
  }
  function q() { return E.qs[E.sel]; }

  /* Une question neuve, prête à être valide une fois les textes écrits. */
  function nouvelle(type) {
    var b = { type: type, enonce: '', temps: 20 };
    if (type === 'qcm') { b.options = ['', '', '', '']; b.correct = [0]; }
    if (type === 'vf') b.correct = [0];
    if (type === 'num') b.num = { valeur: undefined, tolerance: 0.02, unite: '' };
    if (type === 'ordre') b.items = ['', '', ''];
    if (type === 'zone') { b.zone = { src: '', alt: '', cibles: [] }; b.temps = 30; }
    if (type === 'assoc') { b.paires = [['', ''], ['', ''], ['', '']]; b.temps = 40; }
    if (type === 'mot') b.mot = { acceptes: [''] };
    if (type === 'curseur') b.curseur = { min: 0, max: 100, pas: 1, valeur: 50, tolerance: 0, unite: '' };
    return b;
  }

  /* Changer de type : on garde l'énoncé, le point de cours, l'image…
     et ce qui se transpose d'un type à l'autre. */
  var COMMUNS = ['enonce', 'temps', 'notion', 'bo', 'niveau', 'cours', 'revoir', 'image', 'image_attendue', 'a_verifier'];
  function convertir(a, type) {
    var b = nouvelle(type);
    COMMUNS.forEach(function (k) { if (a[k] !== undefined) b[k] = copie(a[k]); });
    if (a.type === 'qcm' && type === 'vf') {
      b.correct = [(a.correct || [0])[0] === 1 ? 1 : 0];
      if ((a.options || []).length === 2) b.options = a.options.slice();
    }
    if (a.type === 'vf' && type === 'qcm') {
      b.options = (a.options || ['Vrai', 'Faux']).slice(); b.correct = (a.correct || [0]).slice();
      if (a.pourquoi) b.pourquoi = a.pourquoi.slice();
    }
    if (a.type === 'num' && type === 'curseur' && a.num && typeof a.num.valeur === 'number') {
      var v = a.num.valeur;
      b.curseur = { min: 0, max: Math.max(10, Math.ceil(v * 2)), pas: 1, valeur: v,
                    tolerance: Math.abs(v * (a.num.tolerance != null ? a.num.tolerance : 0.02)), unite: a.num.unite || '' };
    }
    if (a.type === 'curseur' && type === 'num' && a.curseur) {
      var c = a.curseur;
      b.num = { valeur: c.valeur, tolerance: c.valeur ? Math.abs((c.tolerance || 0) / c.valeur) || 0.02 : 0.02, unite: c.unite || '' };
    }
    if ((a.type === 'num' || a.type === 'curseur') && type === 'mot') {
      var x = a.num ? a.num.valeur : a.curseur.valeur;
      if (x != null) b.mot = { acceptes: [String(x)] };
    }
    if (a.type === 'qcm' && type === 'ordre') b.items = (a.options || []).slice(0, 8);
    if (a.type === 'ordre' && type === 'qcm') { b.options = (a.items || []).slice(0, 6); b.correct = [0]; }
    if (a.type === 'qcm' && type === 'mot') b.mot = { acceptes: (a.correct || []).map(function (i) { return (a.options || [])[i]; }).filter(Boolean) };
    return b;
  }

  /* Ce qui part en base : nombres en nombres, champs vides retirés. */
  function nettoyer(src) {
    var a = copie(src), vide = function (v) { return v == null || (typeof v === 'string' && !v.trim()); };
    ['notion', 'bo', 'cours', 'image_attendue', 'a_verifier'].forEach(function (k) { if (vide(a[k])) delete a[k]; else a[k] = String(a[k]).trim(); });
    a.enonce = String(a.enonce || '').trim();
    if (a.niveau === '' || a.niveau == null) delete a.niveau; else a.niveau = +a.niveau;
    if (a.temps == null || isNaN(a.temps)) delete a.temps;
    if (a.revoir) { if (vide(a.revoir.lien)) delete a.revoir; else { a.revoir.lien = a.revoir.lien.trim(); a.revoir.texte = String(a.revoir.texte || '').trim() || 'la partie du cours'; } }
    if (a.image) { if (vide(a.image.src)) delete a.image; else { a.image.src = a.image.src.trim(); if (vide(a.image.alt)) a.image.alt = ''; } }
    if (a.type === 'qcm' || a.type === 'vf') {
      var n = a.type === 'vf' && !a.options ? 2 : (a.options || []).length;
      if (a.options) a.options = a.options.map(function (o) { return String(o || '').trim(); });
      a.correct = (a.correct || []).filter(function (i) { return i < n; }).sort();
      if (a.pourquoi) {
        a.pourquoi = Array.apply(null, Array(n)).map(function (_, i) {
          var m = a.pourquoi[i]; return a.correct.indexOf(i) >= 0 || vide(m) ? null : String(m).trim();
        });
        if (a.pourquoi.every(function (m) { return m === null; })) delete a.pourquoi;
      }
    }
    if (a.type === 'num') {
      var u = a.num;
      if (vide(u.unite)) delete u.unite;
      if (u.unites) { u.unites = u.unites.map(function (x) { return String(x).trim(); }).filter(Boolean); if (!u.unites.length) delete u.unites; }
      if (u.tolerance == null) delete u.tolerance;
      if (vide(u.message_unite)) delete u.message_unite;
      if (u.autres) { u.autres = u.autres.filter(function (x) { return x && typeof x.valeur === 'number'; }); if (!u.autres.length) delete u.autres; }
      if (u.pieges) {
        u.pieges = u.pieges.filter(function (x) { return x && typeof x.valeur === 'number'; })
          .map(function (x) { var p = { valeur: x.valeur, message: String(x.message || '').trim() }; if (!vide(x.unite)) p.unite = x.unite.trim(); return p; });
        if (!u.pieges.length) delete u.pieges;
      }
    }
    if (a.type === 'ordre') a.items = (a.items || []).map(function (x) { return String(x || '').trim(); });
    if (a.type === 'assoc') a.paires = (a.paires || []).map(function (p) { return [String(p[0] || '').trim(), String(p[1] || '').trim()]; });
    if (a.type === 'mot') {
      a.mot.acceptes = (a.mot.acceptes || []).map(function (x) { return String(x || '').trim(); }).filter(Boolean);
      if (vide(a.mot.indice)) delete a.mot.indice;
      if (a.mot.pieges) {
        a.mot.pieges = a.mot.pieges.filter(function (p) { return p && !vide(p.mot); }).map(function (p) { return { mot: p.mot.trim(), message: String(p.message || '').trim() }; });
        if (!a.mot.pieges.length) delete a.mot.pieges;
      }
    }
    if (a.type === 'zone') {
      a.zone.src = String(a.zone.src || '').trim();
      a.zone.cibles = (a.zone.cibles || []).map(function (c) {
        var r = function (v) { return Math.round(v * 10) / 10; };
        return { x: r(c.x), y: r(c.y), l: r(c.l), h: r(c.h) };
      });
    }
    if (a.type === 'curseur') {
      var c = a.curseur;
      if (vide(c.unite)) delete c.unite;
      if (c.marge == null) delete c.marge;
      if (c.tolerance == null) c.tolerance = 0;
    }
    return a;
  }

  /* ============================================================
   *  Le brouillon (sur l'appareil seulement)
   * ============================================================ */
  function cleBrouillon() { return 'quiz.brouillon.' + (E.quiz.id || 'neuf'); }
  var tBrouillon = null;
  function garderBrouillon() {
    clearTimeout(tBrouillon);
    tBrouillon = setTimeout(function () {
      try { localStorage.setItem(cleBrouillon(), JSON.stringify({ le: Date.now(), quiz: E.quiz, qs: E.qs })); } catch (e) { /* plein ou privé */ }
    }, 400);
  }
  function oublierBrouillon() { try { localStorage.removeItem(cleBrouillon()); } catch (e) { /* rien */ } }
  function lireBrouillon() { try { return JSON.parse(localStorage.getItem(cleBrouillon()) || 'null'); } catch (e) { return null; } }

  function salir() {
    E.sale = true;
    majEtat();
    garderBrouillon();
  }
  window.addEventListener('beforeunload', function (e) {
    if (E.sale && !E.lectureSeule) { e.preventDefault(); e.returnValue = ''; }
  });

  /* ============================================================
   *  Mise en page générale
   * ============================================================ */
  function optionsDossiers(choisi) {
    var o = ['<option value="">— sans dossier —</option>'];
    (function parcourir(id, prof) {
      (E.cats || []).filter(function (c) { return (c.parent || null) === id; }).forEach(function (c) {
        o.push('<option value="' + c.id + '"' + (c.id === choisi ? ' selected' : '') + '>' + '   '.repeat(prof) + (prof ? '└ ' : '') + esc(c.nom) + '</option>');
        parcourir(c.id, prof + 1);
      });
    })(null, 0);
    return o.join('');
  }

  function dessiner() {
    var z = E.quiz;
    app.innerHTML =
      '<div class="ed-barre">' +
        '<div class="ed-titre"><span class="capitales">' + (z.id ? 'Modifier' : 'Nouveau quiz') + '</span><h1 id="ed-titre-h">' + esc(z.titre || 'Sans titre') + '</h1></div>' +
        '<span class="pousse"></span>' +
        '<span class="ed-etat" id="ed-etat" role="status"></span>' +
        '<button class="bouton creux petit" type="button" id="b-tester">Tester</button>' +
        '<a class="bouton creux petit" id="b-lancer" href="animer.html">Lancer</a>' +
        (E.lectureSeule ? '<button class="bouton rouge petit" type="button" id="b-dupliquer">Dupliquer pour moi</button>'
                        : '<button class="bouton rouge petit" type="button" id="b-enregistrer" title="Ctrl + S">Enregistrer</button>') +
      '</div>' +
      (E.lectureSeule ? '<p class="ed-alerte">Ce quiz est celui d\'un collègue : vous pouvez le lire et le tester. Pour le modifier, dupliquez-le — la copie sera à vous.</p>' : '') +
      '<details class="ed-meta" id="ed-meta"' + (z.id ? '' : ' open') + '><summary>Le quiz : titre, dossier, élèves</summary>' +
        '<div class="ed-grille">' +
          '<div class="champ large"><label for="m-titre">Titre</label><input id="m-titre" maxlength="200" value="' + esc(z.titre || '') + '"></div>' +
          '<div class="champ large"><label for="m-desc">Description (vue des élèves)</label><input id="m-desc" maxlength="2000" value="' + esc(z.description || '') + '" placeholder="ex. Après la séance 3"></div>' +
          '<div class="champ"><label for="m-niveau">Niveau</label><input id="m-niveau" maxlength="80" value="' + esc(z.niveau || '') + '" placeholder="ex. 2de SNT"></div>' +
          '<div class="champ"><label for="m-matiere">Matière</label><input id="m-matiere" maxlength="80" value="' + esc(z.matiere || '') + '" placeholder="ex. SNT"></div>' +
          (E.cats ? '<div class="champ"><label for="m-dossier">Dossier</label><select id="m-dossier">' + optionsDossiers(z.categorie) + '</select></div>' : '') +
          '<div class="champ"><label for="m-slug">Identifiant</label><input id="m-slug" value="' + esc(z.slug || '') + '"' + (z.id ? ' readonly title="Fixé à la création : il relie le quiz à ses fichiers et à ses statistiques"' : '') + '></div>' +
          '<label class="case large"><input type="checkbox" id="m-catalogue"' + (z.catalogue !== false ? ' checked' : '') + '><span><b>Proposé à l\'entraînement</b> — les élèves le trouvent sur la page d\'entraînement du site, si son dossier est visible.</span></label>' +
          '<label class="case large"><input type="checkbox" id="m-partage"' + (z.partage !== false ? ' checked' : '') + '><span><b>Partagé avec les collègues</b> — ils peuvent le lancer et le dupliquer, pas le modifier.</span></label>' +
        '</div>' +
      '</details>' +
      '<div class="ed-corps">' +
        '<aside class="ed-liste" aria-label="Questions">' +
          '<div class="ed-liste-tete"><b id="ed-nb"></b><button class="bouton petit" type="button" id="b-ajouter">+ Question</button></div>' +
          '<ol id="ed-vignettes"></ol>' +
        '</aside>' +
        '<section class="ed-question" id="ed-question" aria-live="polite"></section>' +
      '</div>';

    var lier = function (id, cle, transf) {
      var el = $('#' + id); if (!el) return;
      el.addEventListener(el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'input', function () {
        z[cle] = transf ? transf(el) : el.value;
        if (cle === 'titre') {
          $('#ed-titre-h').textContent = el.value || 'Sans titre';
          if (!z.id && !E.slugTouche) { z.slug = slugifier(el.value); $('#m-slug').value = z.slug; }
        }
        if (cle === 'slug') E.slugTouche = true;
        salir();
      });
    };
    lier('m-titre', 'titre'); lier('m-desc', 'description'); lier('m-niveau', 'niveau'); lier('m-matiere', 'matiere');
    lier('m-dossier', 'categorie', function (el) { return el.value || null; });
    lier('m-slug', 'slug', function (el) { return slugifier(el.value); });
    lier('m-catalogue', 'catalogue', function (el) { return el.checked; });
    lier('m-partage', 'partage', function (el) { return el.checked; });

    $('#b-ajouter').onclick = choisirType;
    $('#b-tester').onclick = tester;
    var be = $('#b-enregistrer'); if (be) be.onclick = enregistrer;
    var bd = $('#b-dupliquer'); if (bd) bd.onclick = dupliquer;
    $('#b-lancer').onclick = function (e) {
      if (E.sale && !confirm('Des modifications ne sont pas enregistrées. Aller à la bibliothèque quand même ?')) e.preventDefault();
      else E.sale = false;
    };
    // un seul écouteur de saisie, posé une fois : le formulaire se redessine dedans
    var qb = $('#ed-question');
    qb.addEventListener('input', surSaisie);
    qb.addEventListener('change', function (e) { if (e.target.tagName === 'SELECT' && e.target.dataset.f) surSaisie(e); });
    dessinerListe();
    dessinerQuestion();
    majEtat();
    if (E.lectureSeule) $$('#app input, #app textarea, #app select').forEach(function (el) { el.disabled = true; });
  }

  function majEtat() {
    var e = $('#ed-etat'); if (!e) return;
    var nErr = Object.keys(E.erreurs).length;
    e.className = 'ed-etat' + (E.sale ? ' sale' : '') + (nErr ? ' ko' : '');
    e.textContent = E.lectureSeule ? 'Lecture seule' : nErr ? nErr + ' question' + (nErr > 1 ? 's' : '') + ' à corriger'
      : E.sale ? 'Modifications non enregistrées' : E.quiz.id ? 'Enregistré' : 'Pas encore enregistré';
  }

  /* ============================================================
   *  La liste des questions
   * ============================================================ */
  function resume(x) {
    var t = String(x.enonce || '').replace(/\$[^$]*\$/g, '…').replace(/\*\*/g, '').trim();
    return t ? (t.length > 70 ? t.slice(0, 68) + '…' : t) : '(énoncé à écrire)';
  }
  function dessinerListe() {
    $('#ed-nb').textContent = E.qs.length + ' question' + (E.qs.length > 1 ? 's' : '');
    var ol = $('#ed-vignettes');
    ol.innerHTML = E.qs.map(function (x, i) {
      var alerte = E.erreurs[i] || x.a_verifier;
      return '<li class="ed-vig' + (i === E.sel ? ' choisie' : '') + (E.erreurs[i] ? ' ko' : '') + '" data-i="' + i + '" draggable="' + (!E.lectureSeule) + '">' +
        '<button type="button" class="ed-vig-ouvrir" data-ouvrir="' + i + '" aria-current="' + (i === E.sel) + '">' +
          '<span class="num">' + (i + 1) + '</span>' +
          '<span class="txt"><span class="type">' + esc(NOMS[x.type] || x.type) + (alerte ? ' · <b title="' + esc(E.erreurs[i] || x.a_verifier) + '">⚠</b>' : '') + '</span>' +
          '<span class="enonce">' + esc(resume(x)) + '</span></span></button>' +
        (E.lectureSeule ? '' :
        '<span class="ed-vig-actions">' +
          '<button type="button" data-monter="' + i + '" title="Monter"' + (i ? '' : ' disabled') + '>↑</button>' +
          '<button type="button" data-descendre="' + i + '" title="Descendre"' + (i < E.qs.length - 1 ? '' : ' disabled') + '>↓</button>' +
          '<button type="button" data-dupliquer="' + i + '" title="Dupliquer">⧉</button>' +
          '<button type="button" data-supprimer="' + i + '" title="Supprimer">✕</button>' +
        '</span>') + '</li>';
    }).join('') || '<li class="note" style="padding:12px">Aucune question : « + Question » pour commencer.</li>';
    $$('[data-ouvrir]', ol).forEach(function (b) { b.onclick = function () { E.sel = +b.dataset.ouvrir; dessinerListe(); dessinerQuestion(); }; });
    $$('[data-monter]', ol).forEach(function (b) { b.onclick = function () { deplacer(+b.dataset.monter, +b.dataset.monter - 1); }; });
    $$('[data-descendre]', ol).forEach(function (b) { b.onclick = function () { deplacer(+b.dataset.descendre, +b.dataset.descendre + 1); }; });
    $$('[data-dupliquer]', ol).forEach(function (b) {
      b.onclick = function () { var i = +b.dataset.dupliquer; E.qs.splice(i + 1, 0, copie(E.qs[i])); E.sel = i + 1; decalerErreurs(); salir(); dessinerListe(); dessinerQuestion(); };
    });
    $$('[data-supprimer]', ol).forEach(function (b) {
      b.onclick = function () {
        var i = +b.dataset.supprimer;
        if (!confirm('Supprimer la question ' + (i + 1) + ' ?')) return;
        E.qs.splice(i, 1); E.sel = Math.max(0, Math.min(E.sel, E.qs.length - 1)); decalerErreurs(); salir(); dessinerListe(); dessinerQuestion();
      };
    });
    // glisser-déposer pour réordonner
    var depart = null;
    $$('.ed-vig', ol).forEach(function (li) {
      li.addEventListener('dragstart', function (e) { depart = +li.dataset.i; li.classList.add('tenue'); e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', String(depart)); } catch (x) { /* rien */ } });
      li.addEventListener('dragend', function () { li.classList.remove('tenue'); $$('.ed-vig', ol).forEach(function (x) { x.classList.remove('survol'); }); });
      li.addEventListener('dragover', function (e) { if (depart == null) return; e.preventDefault(); li.classList.add('survol'); });
      li.addEventListener('dragleave', function () { li.classList.remove('survol'); });
      li.addEventListener('drop', function (e) { e.preventDefault(); if (depart != null && depart !== +li.dataset.i) deplacer(depart, +li.dataset.i); depart = null; });
    });
  }
  function decalerErreurs() { E.erreurs = {}; majEtat(); }
  function deplacer(de, vers) {
    if (vers < 0 || vers >= E.qs.length) return;
    var x = E.qs.splice(de, 1)[0];
    E.qs.splice(vers, 0, x);
    E.sel = vers; decalerErreurs(); salir(); dessinerListe(); dessinerQuestion();
  }

  function choisirType() {
    var d = $('#d-type');
    $('#choix-types').innerHTML = TYPES.map(function (t) {
      return '<button type="button" class="choix-type" data-type="' + t[0] + '"><b>' + esc(t[1]) + '</b><span>' + esc(t[2]) + '</span></button>';
    }).join('');
    $$('#choix-types [data-type]').forEach(function (b) {
      b.onclick = function () {
        d.close();
        E.qs.splice(E.sel + 1 > E.qs.length ? E.qs.length : E.qs.length ? E.sel + 1 : 0, 0, nouvelle(b.dataset.type));
        E.sel = E.qs.length === 1 ? 0 : E.sel + 1;
        decalerErreurs(); salir(); dessinerListe(); dessinerQuestion();
        var en = $('#f-enonce'); if (en) en.focus();
      };
    });
    d.showModal();
  }

  /* ============================================================
   *  Le formulaire d'une question
   *  Chaque champ porte data-f="chemin" et data-t="type de valeur" ;
   *  un seul écouteur met le modèle à jour sans redessiner (le
   *  curseur reste dans le champ). Les boutons data-act modifient la
   *  structure (ajouter une option…) et redessinent le formulaire.
   * ============================================================ */
  function champ(label, chemin, opts) {
    opts = opts || {};
    var v = lirePath(q(), chemin), id = 'f-' + chemin.replace(/\./g, '-');
    var val = opts.t === 'nb' ? ecrire(v) : opts.t === 'pct' ? ecrire(v == null ? '' : Math.round(v * 100000) / 1000) :
      opts.t === 'liste' ? (v || []).join(', ') : opts.t === 'lignes' ? (v || []).join('\n') : (v == null ? '' : v);
    var attrs = ' id="' + id + '" data-f="' + chemin + '" data-t="' + (opts.t || 'txt') + '"' + (opts.ph ? ' placeholder="' + esc(opts.ph) + '"' : '') +
      (opts.t === 'nb' || opts.t === 'pct' ? ' inputmode="decimal"' : '');
    var input = opts.zone || opts.t === 'lignes'
      ? '<textarea' + attrs + ' rows="' + (opts.rows || 2) + '">' + esc(val) + '</textarea>'
      : '<input' + attrs + ' value="' + esc(val) + '" autocomplete="off">';
    return '<div class="champ' + (opts.large ? ' large' : '') + '">' + (label ? '<label for="' + id + '">' + label + '</label>' : '') + input +
      (opts.aide ? '<span class="aide">' + opts.aide + '</span>' : '') + '</div>';
  }
  function petitChamp(chemin, opts) {
    opts = opts || {};
    var v = lirePath(q(), chemin);
    var val = opts.t === 'nb' ? ecrire(v) : v == null ? '' : v;
    return '<input class="petit-champ' + (opts.cls ? ' ' + opts.cls : '') + '" data-f="' + chemin + '" data-t="' + (opts.t || 'txt') + '" value="' + esc(val) + '"' +
      (opts.ph ? ' placeholder="' + esc(opts.ph) + '"' : '') + (opts.aria ? ' aria-label="' + esc(opts.aria) + '"' : '') + (opts.t === 'nb' ? ' inputmode="decimal"' : '') + ' autocomplete="off">';
  }
  function bouton(act, texte, attrs) { return '<button type="button" class="ed-mini" data-act="' + act + '"' + (attrs || '') + '>' + texte + '</button>'; }

  function formType(x) {
    var h = '';
    if (x.type === 'qcm' || x.type === 'vf') {
      var opts = x.type === 'vf' && !x.options ? ['Vrai', 'Faux'] : x.options || [];
      h += '<h3>Réponses <span class="note">— cochez la ou les bonnes ; pour chaque fausse, le « pourquoi » montré à l\'élève qui l\'a choisie</span></h3><ol class="ed-options">' +
        opts.map(function (o, i) {
          var juste = (x.correct || []).indexOf(i) >= 0;
          return '<li class="ed-option' + (juste ? ' juste' : '') + '">' +
            '<span class="pastille c' + i + '">' + Q.FORMES[i] + ' ' + Q.LETTRES[i] + '</span>' +
            '<label class="ed-juste"><input type="' + (x.type === 'vf' ? 'radio' : 'checkbox') + '" name="juste" data-act="juste" data-i="' + i + '"' + (juste ? ' checked' : '') + '> juste</label>' +
            (x.type === 'vf' && !x.options ? '<b class="ed-vf">' + o + '</b>' : petitChamp('options.' + i, { ph: 'Réponse ' + Q.LETTRES[i], aria: 'Réponse ' + Q.LETTRES[i], cls: 'large' })) +
            (x.type === 'qcm' && opts.length > 2 ? bouton('suppr', '✕', ' data-liste="options" data-i="' + i + '" title="Retirer cette réponse"') : '') +
            (juste ? '' : '<div class="ed-pourquoi">' + petitChamp('pourquoi.' + i, { ph: 'Pourquoi c\'est faux (facultatif)', aria: 'Pourquoi la réponse ' + Q.LETTRES[i] + ' est fausse', cls: 'large' }) + '</div>') +
          '</li>';
        }).join('') + '</ol>' +
        (x.type === 'qcm' && opts.length < 6 ? bouton('ajout', '+ Réponse', ' data-liste="options"') : '') +
        (x.type === 'qcm' && (x.correct || []).length > 1 ? '<p class="note">Plusieurs bonnes réponses : l\'élève coche puis valide.</p>' : '');
    }
    if (x.type === 'num') {
      var n = x.num || {};
      h += '<h3>La valeur attendue</h3><div class="ed-grille">' +
        champ('Valeur juste', 'num.valeur', { t: 'nb', ph: 'ex. 9,81 ou 3,0 × 10^8' }) +
        champ('Tolérance (%)', 'num.tolerance', { t: 'pct', ph: '2', aide: 'Écart relatif accepté. 2 % par défaut.' }) +
        champ('Unité juste', 'num.unite', { ph: 'ex. m/s' }) +
        champ('Unités proposées', 'num.unites', { t: 'liste', ph: 'ex. m/s, km/h, m', aide: 'Séparées par des virgules ; vide = pas de choix d\'unité.' }) +
        champ('Message « bonne valeur, mauvaise unité »', 'num.message_unite', { large: true }) +
        '</div><h3>Autres écritures justes <span class="note">— la même grandeur dans une autre unité</span></h3>' +
        (n.autres || []).map(function (a, i) {
          return '<div class="ed-ligne">' + petitChamp('num.autres.' + i + '.valeur', { t: 'nb', ph: 'valeur', aria: 'Valeur' }) +
            petitChamp('num.autres.' + i + '.unite', { ph: 'unité', aria: 'Unité' }) + bouton('suppr', '✕', ' data-liste="num.autres" data-i="' + i + '"') + '</div>';
        }).join('') + bouton('ajout', '+ Autre écriture', ' data-liste="num.autres"') +
        '<h3>Pièges <span class="note">— une erreur attendue et son explication</span></h3>' +
        (n.pieges || []).map(function (p, i) {
          return '<div class="ed-ligne">' + petitChamp('num.pieges.' + i + '.valeur', { t: 'nb', ph: 'valeur', aria: 'Valeur piège' }) +
            petitChamp('num.pieges.' + i + '.unite', { ph: 'unité', aria: 'Unité' }) +
            petitChamp('num.pieges.' + i + '.message', { ph: 'Ce que l\'élève a fait de travers', cls: 'large', aria: 'Message' }) +
            bouton('suppr', '✕', ' data-liste="num.pieges" data-i="' + i + '"') + '</div>';
        }).join('') + bouton('ajout', '+ Piège', ' data-liste="num.pieges"');
    }
    if (x.type === 'ordre') {
      h += '<h3>Les éléments, <u>dans le bon ordre</u> <span class="note">— ils seront mélangés à chaque partie</span></h3><ol class="ed-items">' +
        (x.items || []).map(function (t, i, l) {
          return '<li class="ed-ligne"><span class="rang">' + (i + 1) + '</span>' + petitChamp('items.' + i, { cls: 'large', aria: 'Élément ' + (i + 1) }) +
            bouton('haut', '↑', ' data-liste="items" data-i="' + i + '"' + (i ? '' : ' disabled')) +
            bouton('bas', '↓', ' data-liste="items" data-i="' + i + '"' + (i < l.length - 1 ? '' : ' disabled')) +
            (l.length > 2 ? bouton('suppr', '✕', ' data-liste="items" data-i="' + i + '"') : '') + '</li>';
        }).join('') + '</ol>' + ((x.items || []).length < 8 ? bouton('ajout', '+ Élément', ' data-liste="items"') : '');
    }
    if (x.type === 'assoc') {
      h += '<h3>Les paires <span class="note">— la colonne de droite sera mélangée ; points partiels</span></h3>' +
        (x.paires || []).map(function (p, i, l) {
          return '<div class="ed-ligne"><span class="rang">' + (i + 1) + '</span>' + petitChamp('paires.' + i + '.0', { cls: 'large', ph: 'à gauche', aria: 'Paire ' + (i + 1) + ', gauche' }) +
            '<span aria-hidden="true">↔</span>' + petitChamp('paires.' + i + '.1', { cls: 'large', ph: 'à droite', aria: 'Paire ' + (i + 1) + ', droite' }) +
            (l.length > 3 ? bouton('suppr', '✕', ' data-liste="paires" data-i="' + i + '"') : '') + '</div>';
        }).join('') + ((x.paires || []).length < 6 ? bouton('ajout', '+ Paire', ' data-liste="paires"') : '');
    }
    if (x.type === 'mot') {
      var m = x.mot || {};
      h += '<h3>Réponses acceptées <span class="note">— sans majuscules, accents ni ponctuation ; la première est montrée à la correction</span></h3>' +
        (m.acceptes || []).map(function (a, i, l) {
          return '<div class="ed-ligne">' + petitChamp('mot.acceptes.' + i, { cls: 'large', aria: 'Réponse acceptée ' + (i + 1) }) +
            (l.length > 1 ? bouton('suppr', '✕', ' data-liste="mot.acceptes" data-i="' + i + '"') : '') + '</div>';
        }).join('') + bouton('ajout', '+ Réponse acceptée', ' data-liste="mot.acceptes"') +
        '<div class="ed-grille">' + champ('Indice (sous le champ)', 'mot.indice', { large: true, ph: 'ex. un seul mot' }) + '</div>' +
        '<h3>Pièges</h3>' +
        (m.pieges || []).map(function (p, i) {
          return '<div class="ed-ligne">' + petitChamp('mot.pieges.' + i + '.mot', { ph: 'mot piège', aria: 'Mot piège' }) +
            petitChamp('mot.pieges.' + i + '.message', { cls: 'large', ph: 'explication', aria: 'Explication' }) +
            bouton('suppr', '✕', ' data-liste="mot.pieges" data-i="' + i + '"') + '</div>';
        }).join('') + bouton('ajout', '+ Piège', ' data-liste="mot.pieges"');
    }
    if (x.type === 'curseur') {
      h += '<h3>L\'échelle</h3><div class="ed-grille">' +
        champ('Minimum', 'curseur.min', { t: 'nb' }) + champ('Maximum', 'curseur.max', { t: 'nb' }) +
        champ('Pas', 'curseur.pas', { t: 'nb', ph: '1' }) + champ('Unité', 'curseur.unite') +
        champ('Valeur juste', 'curseur.valeur', { t: 'nb' }) +
        champ('Tolérance (tous les points)', 'curseur.tolerance', { t: 'nb', ph: '0', aide: 'Écart absolu, dans l\'unité.' }) +
        champ('Marge (points partiels)', 'curseur.marge', { t: 'nb', ph: '3 × la tolérance', aide: 'Au-delà : aucun point.' }) +
        '</div>';
    }
    if (x.type === 'zone') {
      var zz = x.zone || {}, u = Q.urlImage(zz.src);
      h += '<h3>L\'image et les zones justes</h3><div class="ed-grille">' +
        champ('Image', 'zone.src', { large: true, ph: 'assets/img/… ou https://…', aide: 'Chemin depuis la racine du site, ou adresse https.' }) +
        champ('Description de l\'image', 'zone.alt', { large: true }) + '</div>' +
        (u ? '<p class="note">Tracez chaque zone juste à la souris ou au doigt, en la glissant sur l\'image.</p>' +
             '<div class="ed-zone" id="ed-zone"><img src="' + esc(u) + '" alt="' + esc(zz.alt || '') + '" draggable="false">' +
             (zz.cibles || []).map(function (c, i) {
               return '<span class="cible" style="left:' + c.x + '%;top:' + c.y + '%;width:' + c.l + '%;height:' + c.h + '%"><b>' + (i + 1) + '</b></span>';
             }).join('') + '<span class="cible trace" id="ed-trace" hidden></span></div>'
           : '<p class="reserve-img">Indiquez d\'abord l\'image, puis tracez les zones dessus.</p>') +
        '<ol class="ed-cibles">' + (zz.cibles || []).map(function (c, i) {
          return '<li class="ed-ligne"><span class="rang">' + (i + 1) + '</span>x ' + petitChamp('zone.cibles.' + i + '.x', { t: 'nb', aria: 'x' }) +
            'y ' + petitChamp('zone.cibles.' + i + '.y', { t: 'nb', aria: 'y' }) + 'l ' + petitChamp('zone.cibles.' + i + '.l', { t: 'nb', aria: 'largeur' }) +
            'h ' + petitChamp('zone.cibles.' + i + '.h', { t: 'nb', aria: 'hauteur' }) + '<span class="note">(en %)</span>' +
            bouton('suppr', '✕', ' data-liste="zone.cibles" data-i="' + i + '"') + '</li>';
        }).join('') + '</ol>';
    }
    return h;
  }

  function dessinerQuestion() {
    var box = $('#ed-question');
    var x = q();
    if (!x) { box.innerHTML = '<p class="note ed-vide">Ajoutez une première question avec « + Question ».</p>'; return; }
    var img = x.image || {};
    box.innerHTML =
      '<div class="ed-q-tete"><h2>Question ' + (E.sel + 1) + '</h2>' +
        '<label class="ed-type">Type <select id="f-type">' + TYPES.map(function (t) { return '<option value="' + t[0] + '"' + (t[0] === x.type ? ' selected' : '') + '>' + t[1] + '</option>'; }).join('') + '</select></label>' +
        '<label class="ed-type">Temps <input id="f-temps" data-f="temps" data-t="nb" inputmode="numeric" value="' + ecrire(x.temps) + '" size="3"> s</label>' +
      '</div>' +
      (E.erreurs[E.sel] ? '<p class="erreur ed-err">⚠ ' + esc(E.erreurs[E.sel]) + '</p>' : '') +
      '<form class="ed-form" id="ed-form" onsubmit="return false">' +
        champ('Énoncé', 'enonce', { zone: true, rows: 3, large: true, ph: 'La question. Formules entre $…$ (ex. $E = mc^2$, $\\ce{H2O}$), **gras**.' }) +
        formType(x) +
        '<details class="ed-plus" id="ed-plus"' + (E.plusOuvert || x.cours || x.revoir || x.notion || x.image || x.a_verifier ? ' open' : '') + '><summary>Correction, image, repères</summary><div class="ed-grille">' +
          champ('À retenir (montré à la correction)', 'cours', { zone: true, rows: 2, large: true }) +
          champ('À revoir : texte du lien', 'revoir.texte', { ph: 'ex. S5 · Le routage : l\'aiguillage des paquets', aide: 'Montré à l\'élève qui se trompe, et dans son bilan.' }) +
          champ('À revoir : adresse', 'revoir.lien', { ph: 'pages/2nde-snt-t1-internet.html#etape-t1-routage', aide: 'Une page du site ; #sN vise une séance, #etape-<clé> une étape.' }) +
          champ('Notion', 'notion', { ph: 'ex. Protocole HTTP', aide: 'Pour le bilan de l\'élève et les statistiques.' }) +
          '<div class="champ"><label for="f-niveau">Niveau</label><select id="f-niveau" data-f="niveau" data-t="niv"><option value="">—</option>' +
            [[1, '1 · restitution'], [2, '2 · application'], [3, '3 · raisonnement']].map(function (n) { return '<option value="' + n[0] + '"' + (+x.niveau === n[0] ? ' selected' : '') + '>' + n[1] + '</option>'; }).join('') + '</select></div>' +
          champ('Ligne du programme (BO)', 'bo', { large: true }) +
          champ('Image de l\'énoncé', 'image.src', { ph: 'assets/img/quiz/… ou https://…', aide: 'Chemin depuis la racine du site, ou adresse https.' }) +
          champ('Description de l\'image', 'image.alt') +
          champ('Image à fournir (vue des enseignants seulement)', 'image_attendue', { large: true }) +
          champ('Point à vérifier', 'a_verifier', { large: true, aide: 'Signalé dans la bibliothèque et l\'aperçu.' }) +
        '</div></details>' +
      '</form>' +
      '<div class="ed-apercu"><p class="capitales">Aperçu — écran projeté, correction affichée</p><div class="mini-scene" id="ed-apercu"></div></div>';
    if (E.lectureSeule) $$('#ed-question input, #ed-question textarea, #ed-question select, #ed-question .ed-mini').forEach(function (el) { el.disabled = true; });
    brancherForm();
    majApercu();
  }

  function brancherForm() {
    var box = $('#ed-question');
    $('#f-type').onchange = function () {
      E.qs[E.sel] = convertir(q(), this.value);
      delete E.erreurs[E.sel]; salir(); dessinerListe(); dessinerQuestion();
    };
    $$('[data-act]', box).forEach(function (b) { b.addEventListener(b.type === 'checkbox' || b.type === 'radio' ? 'change' : 'click', surAction); });
    $('#ed-plus').addEventListener('toggle', function () { E.plusOuvert = this.open; });
    var zone = $('#ed-zone'); if (zone) brancherZone(zone);
    var img = $('#ed-zone img'); if (img) img.onerror = function () { zone.insertAdjacentHTML('afterend', '<p class="erreur">Image introuvable à cette adresse.</p>'); };
  }

  function surSaisie(e) {
    var el = e.target, chemin = el.dataset && el.dataset.f;
    if (!chemin) return;
    var t = el.dataset.t, v = el.value, x = q();
    if (t === 'nb') v = v.trim() === '' ? undefined : nombre(v);
    else if (t === 'pct') v = v.trim() === '' ? undefined : (nombre(v) == null ? undefined : nombre(v) / 100);
    else if (t === 'liste') v = v.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    else if (t === 'lignes') v = v.split('\n');
    else if (t === 'niv') v = v ? +v : undefined;
    if (chemin.indexOf('image.') === 0 && !x.image) x.image = { src: '', alt: '' };
    if (chemin.indexOf('revoir.') === 0 && !x.revoir) x.revoir = { texte: '', lien: '' };
    poserPath(x, chemin, v);
    el.classList.toggle('invalide', (t === 'nb' || t === 'pct') && el.value.trim() !== '' && v === undefined);
    if (chemin === 'zone.src') { clearTimeout(E.tZone); E.tZone = setTimeout(dessinerQuestion, 700); }
    if (/^zone\.cibles/.test(chemin)) redessinerCibles();
    salir();
    majVignette();
    majApercu();
    validerPlusTard();
  }

  function surAction(e) {
    var b = e.currentTarget, act = b.dataset.act, x = q(), i = +b.dataset.i;
    if (act === 'juste') {
      if (x.type === 'vf') x.correct = [i];
      else {
        var c = (x.correct || []).slice(), k = c.indexOf(i);
        if (b.checked && k < 0) c.push(i); if (!b.checked && k >= 0) c.splice(k, 1);
        x.correct = c.sort();
      }
    } else {
      var chemin = b.dataset.liste, l = lirePath(x, chemin);
      if (!l) { poserPath(x, chemin, []); l = lirePath(x, chemin); }
      if (act === 'ajout') {
        l.push(chemin === 'paires' ? ['', ''] : chemin === 'num.autres' ? { valeur: undefined, unite: '' } :
               chemin === 'num.pieges' ? { valeur: undefined, unite: '', message: '' } : chemin === 'mot.pieges' ? { mot: '', message: '' } : '');
      }
      if (act === 'suppr') {
        l.splice(i, 1);
        if (chemin === 'options') {
          // les indices des bonnes réponses et des « pourquoi » suivent
          x.correct = (x.correct || []).filter(function (j) { return j !== i; }).map(function (j) { return j > i ? j - 1 : j; });
          if (!x.correct.length) x.correct = [0];
          if (x.pourquoi) x.pourquoi.splice(i, 1);
        }
      }
      if (act === 'haut' || act === 'bas') { var j = act === 'haut' ? i - 1 : i + 1; var t = l[i]; l[i] = l[j]; l[j] = t; }
    }
    salir(); dessinerListe(); dessinerQuestion(); validerPlusTard();
    if (act === 'ajout') {
      var n = lirePath(q(), b.dataset.liste).length, dern = $('#ed-question [data-f^="' + b.dataset.liste + '.' + (n - 1) + '"]');
      if (dern) dern.focus();
    } else {
      var cible = $('#ed-question [data-act="' + act + '"][data-liste="' + (b.dataset.liste || '') + '"]');
      if (cible && !cible.disabled) cible.focus();
    }
  }

  /* --- la zone : tracer un rectangle au doigt ou à la souris --- */
  function brancherZone(zone) {
    var debut = null, trace = $('#ed-trace');
    var pc = function (e) {
      var r = zone.getBoundingClientRect();
      return { x: Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100)), y: Math.max(0, Math.min(100, (e.clientY - r.top) / r.height * 100)) };
    };
    var rect = function (a, b) { return { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), l: Math.abs(a.x - b.x), h: Math.abs(a.y - b.y) }; };
    zone.addEventListener('pointerdown', function (e) {
      if (E.lectureSeule) return;
      e.preventDefault(); debut = pc(e); zone.setPointerCapture(e.pointerId);
    });
    zone.addEventListener('pointermove', function (e) {
      if (!debut) return;
      var r = rect(debut, pc(e));
      trace.hidden = false;
      trace.style.cssText = 'left:' + r.x + '%;top:' + r.y + '%;width:' + r.l + '%;height:' + r.h + '%';
    });
    var fin = function (e) {
      if (!debut) return;
      var r = rect(debut, pc(e)); debut = null; trace.hidden = true;
      if (r.l < 1.5 || r.h < 1.5) return;   // un simple toucher n'est pas une zone
      var x = q(); x.zone.cibles = x.zone.cibles || [];
      x.zone.cibles.push({ x: Math.round(r.x * 10) / 10, y: Math.round(r.y * 10) / 10, l: Math.round(r.l * 10) / 10, h: Math.round(r.h * 10) / 10 });
      salir(); dessinerListe(); dessinerQuestion(); validerPlusTard();
    };
    zone.addEventListener('pointerup', fin);
    zone.addEventListener('pointercancel', function () { debut = null; trace.hidden = true; });
  }
  function redessinerCibles() {
    var zone = $('#ed-zone'); if (!zone) return;
    $$('.cible:not(.trace)', zone).forEach(function (s, i) {
      var c = q().zone.cibles[i]; if (!c) return;
      s.style.cssText = 'left:' + c.x + '%;top:' + c.y + '%;width:' + c.l + '%;height:' + c.h + '%';
    });
  }

  function majVignette() {
    var li = $('.ed-vig[data-i="' + E.sel + '"] .enonce'); if (li) li.textContent = resume(q());
  }

  /* ============================================================
   *  L'aperçu : la question telle que projetée, correction affichée
   * ============================================================ */
  function apercuHtml(x) {
    var h = '<p class="q-enonce">' + (x.enonce ? Q.rendre(x.enonce) : '<span class="note">(énoncé)</span>') + '</p>';
    var img = x.image && Q.urlImage(x.image.src);
    if (img) h += '<div class="q-image"><img src="' + esc(img) + '" alt="' + esc(x.image.alt || '') + '"></div>';
    else if (x.image_attendue) h += '<div class="reserve-img">Image à fournir : ' + esc(x.image_attendue) + '</div>';
    if (x.type === 'qcm' || x.type === 'vf') {
      var opts = x.type === 'vf' && !x.options ? ['Vrai', 'Faux'] : x.options || [];
      h += '<div class="grille-proj">' + opts.map(function (o, i) {
        var ok = (x.correct || []).indexOf(i) >= 0;
        return '<div class="rep c' + i + (ok ? ' bonne' : ' eteinte') + '"><span class="forme" aria-hidden="true">' + Q.FORMES[i] + '</span><span>' + (o ? Q.rendre(o) : '…') + '</span></div>';
      }).join('') + '</div>';
    } else if (x.type === 'num') {
      var n = x.num || {};
      h += '<div class="bandeau-saisie juste">✓ <b>' + (n.valeur != null ? Q.ecrireNombre(n.valeur) : '?') + ' ' + esc(n.unite || '') + '</b> <span class="note">± ' +
        Math.round((n.tolerance != null ? n.tolerance : 0.02) * 1000) / 10 + ' %</span>' +
        (n.autres || []).filter(function (a) { return a && a.valeur != null; }).map(function (a) { return ' ou ' + Q.ecrireNombre(a.valeur) + ' ' + esc(a.unite || ''); }).join('') +
        (n.unites && n.unites.length ? '<div class="note">Unités proposées : ' + esc(n.unites.join(' · ')) + '</div>' : '') + '</div>';
    } else if (x.type === 'ordre') {
      h += '<ol class="ordre-proj">' + (x.items || []).map(function (t, i) { return '<li><b>' + (i + 1) + '</b><span>' + Q.rendre(t || '…') + '</span></li>'; }).join('') + '</ol>';
    } else if (x.type === 'assoc') {
      h += '<div class="assoc-proj">' + (x.paires || []).map(function (p) {
        return '<div><b>•</b><span>' + Q.rendre(p[0] || '…') + '</span></div><div><b>→</b><span>' + Q.rendre(p[1] || '…') + '</span></div>';
      }).join('') + '</div>';
    } else if (x.type === 'mot') {
      var m = x.mot || {};
      h += '<div class="bandeau-saisie juste">✓ <b>' + esc((m.acceptes || []).filter(Boolean).join(' · ') || '?') + '</b>' + (m.indice ? '<div class="note">Indice : ' + esc(m.indice) + '</div>' : '') + '</div>';
    } else if (x.type === 'curseur') {
      var c = x.curseur || {}, ok = typeof c.min === 'number' && typeof c.max === 'number' && c.max > c.min;
      var pc = function (v) { return ok ? Math.max(0, Math.min(100, (v - c.min) / (c.max - c.min) * 100)) : 0; }, t = c.tolerance || 0;
      h += '<div class="curseur-proj"><span>' + Q.ecrireNombre(c.min) + '</span><div class="piste">' +
        (ok ? '<span class="tol" style="left:' + pc(c.valeur - t) + '%;width:' + (pc(c.valeur + t) - pc(c.valeur - t)) + '%"></span><span class="marque" style="left:' + pc(c.valeur) + '%"></span>' : '') +
        '</div><span>' + Q.ecrireNombre(c.max) + ' ' + esc(c.unite || '') + '</span></div>' +
        '<p class="curseur-juste">✓ <b>' + Q.ecrireNombre(c.valeur) + ' ' + esc(c.unite || '') + '</b>' + (t ? ' (± ' + Q.ecrireNombre(t) + ')' : '') + '</p>';
    } else if (x.type === 'zone') {
      var z = x.zone || {}, u = Q.urlImage(z.src);
      h += u ? '<div style="text-align:center"><div class="zone-proj"><img src="' + esc(u) + '" alt="' + esc(z.alt || '') + '">' +
        (z.cibles || []).map(function (cc) { return '<span class="cible" style="left:' + cc.x + '%;top:' + cc.y + '%;width:' + cc.l + '%;height:' + cc.h + '%"></span>'; }).join('') + '</div></div>'
        : '<div class="reserve-img">Image de la zone à indiquer.</div>';
    }
    if (x.cours || (x.revoir && x.revoir.lien)) h += '<div class="panneau"><h3>À retenir</h3>' + (x.cours ? '<p>' + Q.rendre(x.cours) + '</p>' : '') +
      (x.revoir && x.revoir.lien ? '<p>' + Q.revoirHtml(x.revoir) + '</p>' : '') + '</div>';
    return h;
  }
  var tApercu = null;
  function majApercu() {
    clearTimeout(tApercu);
    tApercu = setTimeout(function () { var a = $('#ed-apercu'); if (a && q()) a.innerHTML = apercuHtml(q()); }, 120);
  }

  function tester() {
    $('#tester-corps').innerHTML = '<h2>' + esc(E.quiz.titre || 'Sans titre') + '</h2><p class="note">' + esc(E.quiz.description || '') + '</p>' +
      E.qs.map(function (x, i) {
        return '<section class="panneau ed-test"><h3>Question ' + (i + 1) + ' · ' + esc(NOMS[x.type]) + ' · ' + (x.temps || 20) + ' s' + (x.notion ? ' · ' + esc(x.notion) : '') + '</h3>' +
          (E.erreurs[i] ? '<p class="erreur">⚠ ' + esc(E.erreurs[i]) + '</p>' : '') +
          (x.a_verifier ? '<p class="erreur">À vérifier : ' + esc(x.a_verifier) + '</p>' : '') +
          '<div class="mini-scene">' + apercuHtml(x) + '</div></section>';
      }).join('');
    $('#d-tester').showModal();
  }

  /* ============================================================
   *  Validation et enregistrement
   * ============================================================ */
  var tValide = null;
  function validerPlusTard() {
    clearTimeout(tValide);
    var i = E.sel;
    tValide = setTimeout(function () { valider([i]); }, 900);
  }
  /* Ce que la base laisse passer mais qu'une classe verrait : un texte vide. */
  function verifLocale(x) {
    var vide = function (s) { return !String(s || '').trim(); };
    if (x.type === 'qcm' && (x.options || []).some(vide)) return 'une réponse est vide';
    if (x.type === 'ordre' && (x.items || []).some(vide)) return 'un élément à ordonner est vide';
    if (x.type === 'num' && (x.num.pieges || []).some(function (p) { return p && typeof p.valeur === 'number' && vide(p.message); })) return 'un piège n\'a pas de message';
    if (x.type === 'zone' && x.zone.src && !Q.urlImage(x.zone.src)) return 'image de la zone : un chemin du site ou une adresse https';
    if (x.image && x.image.src && x.image.src.trim() && !Q.urlImage(x.image.src)) return 'image : un chemin du site ou une adresse https';
    if (x.revoir && x.revoir.lien && x.revoir.lien.trim() && !Q.urlCours(x.revoir.lien)) return 'à revoir : une page du site (pages/….html#…) ou une adresse https';
    return null;
  }
  function valider(indices) {
    return Promise.all(indices.map(function (i) {
      if (!E.qs[i]) return null;
      return Q.rpc('quiz_question_invalide', { q: nettoyer(E.qs[i]) }).then(function (m) {
        m = m || verifLocale(nettoyer(E.qs[i]));
        if (m) E.erreurs[i] = m; else delete E.erreurs[i];
      }, function () { /* hors ligne : la base jugera à l'enregistrement */ });
    })).then(function () {
      majEtat(); dessinerListe();
      var p = $('.ed-err');
      if (E.erreurs[E.sel]) { if (p) p.textContent = '⚠ ' + E.erreurs[E.sel]; else $('.ed-q-tete').insertAdjacentHTML('afterend', '<p class="erreur ed-err">⚠ ' + esc(E.erreurs[E.sel]) + '</p>'); }
      else if (p) p.remove();
    });
  }

  function message(texte, ko) {
    var e = $('#ed-etat'); if (!e) return;
    e.textContent = texte; e.className = 'ed-etat' + (ko ? ' ko' : ' fait');
  }

  function enregistrer() {
    if (E.lectureSeule || E.enCours) return;
    var z = E.quiz;
    if (!String(z.titre || '').trim()) { $('#ed-meta').open = true; $('#m-titre').focus(); message('Donnez un titre au quiz.', true); return; }
    if (!/^[a-z0-9][a-z0-9-]{1,79}$/.test(z.slug || '')) { $('#ed-meta').open = true; message('Identifiant invalide : lettres minuscules, chiffres et tirets.', true); return; }
    if (!E.qs.length) { message('Le quiz n\'a aucune question.', true); return; }
    E.enCours = true;
    message('Vérification…');
    valider(E.qs.map(function (_, i) { return i; })).then(function () {
      var ko = Object.keys(E.erreurs).map(Number).sort(function (a, b) { return a - b; });
      if (ko.length) {
        E.enCours = false; E.sel = ko[0]; dessinerListe(); dessinerQuestion();
        message(ko.length + ' question' + (ko.length > 1 ? 's' : '') + ' à corriger avant d\'enregistrer (la ' + (ko[0] + 1) + 'e est ouverte).', true);
        return;
      }
      return slugLibre().then(function () {
        var p = { slug: z.slug, titre: z.titre.trim(), niveau: z.niveau || null, matiere: z.matiere || null, description: z.description || null,
                  partage: z.partage !== false, catalogue: z.catalogue !== false, questions: E.qs.map(nettoyer) };
        if (z.salle) p.salle = z.salle;
        message('Enregistrement…');
        return Q.rpc('quiz_importer', { p_quiz: p }).then(function (id) {
          return (E.cats ? Q.rest('quiz_quiz?id=eq.' + id, { methode: 'PATCH', corps: { categorie: z.categorie || null, catalogue: z.catalogue !== false } }) : Promise.resolve())
            .then(function () { return Q.rest('quiz_quiz?id=eq.' + id + '&select=id,salle,auteur,modifie_le'); })
            .then(function (l) {
              var neuf = !z.id;
              oublierBrouillon();
              z.id = id; if (l && l[0]) { z.salle = l[0].salle; z.auteur = l[0].auteur; z.modifie_le = l[0].modifie_le; }
              E.sale = false; E.enCours = false;
              if (neuf) { history.replaceState(null, '', 'editer.html?quiz=' + id); dessiner(); }
              message('Enregistré à ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
            });
        });
      });
    }).catch(function (e) {
      E.enCours = false;
      var m = Q.messageErreur(e), k = /question (\d+)/.exec(String(e && e.message));
      if (k) { E.erreurs[+k[1] - 1] = m; E.sel = +k[1] - 1; dessinerListe(); dessinerQuestion(); }
      message('Pas enregistré — ' + m, true);
    });
  }
  /* Un quiz neuf ne doit pas écraser un de mes quiz qui aurait le même
     identifiant : on ajoute -2, -3… */
  function slugLibre() {
    if (E.quiz.id) return Promise.resolve();
    var base = E.quiz.slug, essai = function (n) {
      var s = n ? base.slice(0, 75) + '-' + n : base;
      return Q.rest('quiz_quiz?select=id&slug=eq.' + encodeURIComponent(s)).then(function (l) {
        if (l && l.length) return essai(n ? n + 1 : 2);
        E.quiz.slug = s; var c = $('#m-slug'); if (c) c.value = s;
      });
    };
    return essai(0);
  }

  function dupliquer() {
    var z = E.quiz;
    E.quiz = { slug: slugifier(z.slug + '-copie'), titre: z.titre + ' (copie)', description: z.description, niveau: z.niveau, matiere: z.matiere,
               partage: true, catalogue: z.catalogue, categorie: z.categorie };
    E.lectureSeule = false; E.sale = true; E.erreurs = {};
    history.replaceState(null, '', 'editer.html');
    dessiner();
    message('Copie à vous : enregistrez-la pour la garder.');
  }

  /* ============================================================
   *  Démarrage
   * ============================================================ */
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) { e.preventDefault(); enregistrer(); }
  });

  function demarrer() {
    var p = new URLSearchParams(location.search), id = p.get('quiz'), dossier = p.get('dossier');
    var lireCats = Q.rest('quiz_categories?select=id,parent,nom,ordre&order=ordre.asc,nom.asc').catch(function () { return null; });
    var lireQuiz = id ? Q.rest('quiz_quiz?id=eq.' + encodeURIComponent(id) + '&select=*') : Promise.resolve(null);
    Promise.all([lireCats, lireQuiz]).then(function (r) {
      E.cats = r[0];
      if (id) {
        if (!r[1] || !r[1].length) throw new Error('Quiz introuvable (ou pas partagé avec vous).');
        var z = r[1][0];
        E.quiz = { id: z.id, slug: z.slug, titre: z.titre, description: z.description, niveau: z.niveau, matiere: z.matiere,
                   partage: z.partage, catalogue: z.catalogue, categorie: z.categorie || null, salle: z.salle, auteur: z.auteur, modifie_le: z.modifie_le };
        E.qs = copie(z.questions || []);
        E.lectureSeule = z.auteur !== Q.monUid();
      } else {
        E.quiz = { slug: '', titre: '', partage: true, catalogue: true, categorie: dossier || null };
        E.qs = [];
      }
      // un brouillon plus récent que la version enregistrée ?
      var b = !E.lectureSeule && lireBrouillon();
      if (b && (!E.quiz.modifie_le || b.le > Date.parse(E.quiz.modifie_le)) && b.qs && b.qs.length &&
          confirm('Un brouillon non enregistré de ce quiz existe sur cet appareil (' + new Date(b.le).toLocaleString('fr-FR') + '). Le reprendre ?')) {
        var garde = { id: E.quiz.id, salle: E.quiz.salle, auteur: E.quiz.auteur, modifie_le: E.quiz.modifie_le };
        E.quiz = Object.assign(b.quiz, garde); E.qs = b.qs; E.sale = true;
      } else if (b) oublierBrouillon();
      E.sel = 0;
      dessiner();
      if (E.qs.length && !E.lectureSeule) valider(E.qs.map(function (_, i) { return i; }));
    }).catch(function (e) {
      app.innerHTML = '<div class="page"><p class="erreur">' + esc(Q.messageErreur(e)) + '</p><p><a href="animer.html">← Bibliothèque</a></p></div>';
    });
  }

  Q.poserNom();
  Q.exigerConnexion(app, demarrer);
})();
