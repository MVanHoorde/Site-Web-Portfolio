/* ============================================================
 *  quiz-catalogue.js — la page d'entraînement des élèves (sans compte)
 *  ------------------------------------------------------------
 *  quiz_catalogue (051) rend les dossiers visibles et, pour chaque
 *  quiz, son titre et son code de salle — jamais une question. Un clic
 *  mène à la salle du quiz en mode « seul » : l'élève donne son nom et
 *  s'entraîne aussitôt, la correction suit chaque réponse.
 *
 *  Navigation par l'adresse (#d=<id>) : le bouton « retour » du
 *  téléphone remonte d'un dossier.
 * ============================================================ */
(function () {
  'use strict';
  var Q = window.Quiz, $ = Q.$, esc = Q.esc;
  var app = $('#app');
  var C = null;   // { categories, quiz }

  function cat(id) { return C.categories.filter(function (c) { return c.id === id; })[0]; }
  function enfants(id) { return C.categories.filter(function (c) { return (c.parent || null) === (id || null); }); }
  function quizDe(id) { return C.quiz.filter(function (z) { return z.categorie === id; }); }
  function compte(id) { return quizDe(id).length + enfants(id).reduce(function (n, c) { return n + compte(c.id); }, 0); }
  function chemin(id) { var l = [], c = cat(id); while (c) { l.unshift(c); c = cat(c.parent); } return l; }
  function imageDe(id) { var c = cat(id); while (c) { if (c.image) return c; c = cat(c.parent); } return null; }
  function sigleHtml(s) { return esc(s || '').replace(/^(\d|T)(de|re|le|e)\b/, '$1<sup>$2</sup>'); }

  function vignette(c) {
    var im = imageDe(c.id), u = im && Q.urlFiligrane(im.image), racine = !c.parent, n = compte(c.id);
    var style = u ? ' style="--img:url(&quot;' + esc(u) + '&quot;);--focus:' + esc(im.focus || '50% 50%') + '"' : '';
    return '<a class="vignette' + (racine ? ' section' : ' chapitre') + (u ? '' : ' sans-image') + '" href="#d=' + c.id + '"' + style + '>' +
      (racine ? '<span class="vis"><span class="voile"></span><span class="gros">' + sigleHtml(c.sigle || c.nom) + '</span></span>' : '') +
      '<span class="txt"><span class="nom">' + esc(c.nom) + '</span><span class="meta">' + n + ' quiz</span></span></a>';
  }
  function carte(z) {
    return '<a class="quiz-eleve" href="index.html?salle=' + encodeURIComponent(z.salle) + '&amp;seul=1">' +
      '<b>' + esc(z.titre) + '</b>' +
      (z.description ? '<span>' + esc(z.description) + '</span>' : '') +
      '<span>' + z.n + ' question' + (z.n > 1 ? 's' : '') + '</span>' +
      '<span class="go">S\'entraîner →</span></a>';
  }

  function poserFiligrane(id) {
    var f = $('#filigrane'), im = id ? imageDe(id) : null, u = im && Q.urlFiligrane(im.image);
    f.style.backgroundImage = u ? 'url("' + u.replace(/"/g, '%22') + '")' : '';
    f.style.backgroundPosition = (im && im.focus) || '50% 50%';
    f.hidden = !u;
  }

  function dessiner() {
    if (!C) return;
    var m = /#d=([0-9a-f-]{36})/.exec(location.hash), id = m && cat(m[1]) ? m[1] : null;
    var h;
    if (!id) {
      var sections = enfants(null).filter(function (c) { return compte(c.id) > 0; });
      h = '<div><p class="capitales">Quiz d\'entraînement</p><h1>Choisis ta classe</h1></div>' +
        '<p class="note">Sans compte : ton prénom suffit. La correction s\'affiche après chaque réponse, et tu peux recommencer autant que tu veux.</p>' +
        (sections.length ? '<div class="vignettes sections">' + sections.map(vignette).join('') + '</div>'
                         : '<p class="note">Aucun quiz d\'entraînement pour l\'instant.</p>') +
        '<div class="code-partie"><span>En classe, le professeur projette un code à 6 chiffres ?</span><a class="bouton rouge petit" href="index.html">Entrer le code</a></div>';
    } else {
      var c = cat(id), ch = chemin(id), sous = enfants(id).filter(function (x) { return compte(x.id) > 0; }), liste = quizDe(id);
      h = '<nav class="fil" aria-label="Où suis-je"><a href="#">Toutes les classes</a>' +
          ch.map(function (x, i) { return ' <span aria-hidden="true">›</span> ' + (i < ch.length - 1 ? '<a href="#d=' + x.id + '">' + esc(x.nom) + '</a>' : '<b>' + esc(x.nom) + '</b>'); }).join('') + '</nav>' +
        '<div class="titre-biblio">' + (!c.parent && c.sigle ? '<span class="sigle">' + sigleHtml(c.sigle) + '</span>' : '') + '<h1>' + esc(c.nom) + '</h1></div>' +
        (sous.length ? '<div class="vignettes">' + sous.map(vignette).join('') + '</div>' : '') +
        (liste.length ? (sous.length ? '<h2>Les quiz</h2>' : '') + '<div class="liste-entrainement">' + liste.map(carte).join('') + '</div>' : '') +
        (!sous.length && !liste.length ? '<p class="note">Pas encore de quiz ici.</p>' : '');
    }
    app.innerHTML = h;
    poserFiligrane(id);
    var t = app.querySelector('h1'); if (t && document.activeElement && document.activeElement.tagName === 'A') { t.tabIndex = -1; t.focus({ preventScroll: true }); }
    window.scrollTo(0, 0);
  }

  Q.poserNom();
  window.addEventListener('hashchange', dessiner);
  Q.rpc('quiz_catalogue', {}, true).then(function (c) {
    C = { categories: (c && c.categories) || [], quiz: (c && c.quiz) || [] };
    dessiner();
  }).catch(function (e) {
    app.innerHTML = '<h1>S\'entraîner</h1><p class="erreur">' + esc(/quiz_catalogue|PGRST202|Could not find/i.test(String(e.message))
      ? 'La page d\'entraînement n\'est pas encore ouverte.' : Q.messageErreur(e)) + '</p>' +
      '<div class="code-partie"><span>En classe, avec un code à 6 chiffres :</span><a class="bouton rouge petit" href="index.html">Entrer le code</a></div>';
  });
})();
