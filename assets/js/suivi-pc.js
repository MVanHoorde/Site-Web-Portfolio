/* ============================================================
 *  suivi-pc.js — ce que le professeur de 2nde voit de la consultation
 *  ------------------------------------------------------------
 *  Chargé par les chapitres et les outils de physique-chimie de 2nde,
 *  APRÈS progression.js. Décision de Loïc du 13/09/2026 : voir si les
 *  élèves de sa 2nde 1 consultent le cours en ligne et téléchargent
 *  leurs documents — « s'ils font leur boulot ».
 *
 *  CE QUI EST ENREGISTRÉ, ET RIEN D'AUTRE
 *   · un chapitre ouvert : première et dernière date, nombre de
 *     visites (une visite = une ouverture à plus de 30 min de la
 *     précédente), date du déblocage par le code de fin de chapitre ;
 *   · un PDF du cours ouvert depuis la page (fiche, TP, DS) : son nom,
 *     la page d'où il vient, première et dernière date, nombre.
 *  PAS de temps passé sur la page, pas de défilement, pas de clic
 *  ailleurs : ce serait disproportionné au regard du besoin.
 *  On enregistre le CLIC sur le lien, pas la lecture du fichier.
 *
 *  QUAND
 *  Seulement pour un élève CONNECTÉ, inscrit dans une classe. Sans
 *  compte, ce fichier ne fait rien et n'écrit rien nulle part — pas de
 *  localStorage, pas de cookie. L'élève est prévenu par le bandeau de
 *  progression.js (data-renvoi-texte de la page).
 *
 *  OÙ
 *  Table progression, domaine 'cours' :
 *    clé de la page (<body data-suivi="pc-t1-c2">)  la consultation
 *    'pc-telechargements'                         les téléchargements
 *  Les deux clés commencent par « pc- » : la base les range dans la
 *  famille PC (bdd/schema/018, famille_de_cle), un collègue de SNT ne
 *  les lit donc pas.
 *
 *  Un chapitre ne tourne pas sur le moteur des séquences : ce fichier
 *  est le seul lien entre lui et la base.
 * ============================================================ */
(function (global) {
  'use strict';

  var VISITE_MIN = 30;              /* minutes entre deux visites comptées */
  var CLE_TELECH = 'pc-telechargements';

  var P = global.Progression;
  var corps = global.document && global.document.body;
  if (!P || !P.disponible() || !corps) return;

  var CLE = corps.getAttribute('data-suivi');   /* 'pc-t1-c2', 'pc-o3' */

  /* Les écritures passent l'une après l'autre : ecrire() lit la ligne
     puis la réécrit, deux écritures simultanées sur la même clé
     s'écraseraient. */
  var file = Promise.resolve();
  function enFile(travail) {
    file = file.then(travail).catch(function () {});
    return file;
  }

  function maintenant() { return new Date().toISOString(); }

  P.session().then(function (moi) {
    if (!moi) return;

    /* ---- la consultation (chapitres seulement : un outil a déjà sa
            progression, écrite par le moteur sous sa propre clé) ---- */
    if (CLE && /^pc-t\d+-c\d+$/.test(CLE)) {
      enFile(function () {
        return P.lire('cours', CLE).then(function (v) {
          v = v || {};
          var t = maintenant();
          var ecart = v.dernier_le ? (Date.parse(t) - Date.parse(v.dernier_le)) / 60000 : Infinity;
          var maj = {
            premier_le: v.premier_le || t,
            dernier_le: t,
            visites   : (v.visites || 0) + (ecart > VISITE_MIN ? 1 : 0)
          };
          if (!corps.classList.contains('verrouille') && !v.debloque_le) maj.debloque_le = t;
          return P.ecrire('cours', CLE, maj);
        });
      });

      /* Déblocage pendant la visite : la porte à code retire la classe
         « verrouille » du body. */
      if (corps.classList.contains('verrouille') && global.MutationObserver) {
        var obs = new MutationObserver(function () {
          if (corps.classList.contains('verrouille')) return;
          obs.disconnect();
          enFile(function () {
            return P.lire('cours', CLE).then(function (v) {
              if (v && v.debloque_le) return null;
              return P.ecrire('cours', CLE, { debloque_le: maintenant() });
            });
          });
        });
        obs.observe(corps, { attributes: true, attributeFilter: ['class'] });
      }
    }

    /* ---- les téléchargements : les PDF du cours, où qu'ils soient
            dans la page ---- */
    global.document.addEventListener('click', function (ev) {
      var a = ev.target && ev.target.closest && ev.target.closest('a[href]');
      if (!a) return;
      var href = a.getAttribute('href') || '';
      var m = /assets\/pdf\/pc\/(?:[\w-]+\/)*([\w.-]+\.pdf)(?:[?#].*)?$/.exec(href);
      if (!m) return;
      var fichier = m[1];
      /* Un lien qui s'ouvre dans le MÊME onglet quitte la page : les deux
         allers-retours de l'écriture seraient coupés en route. On retient
         la navigation le temps d'écrire, 1,2 s au plus — au-delà, l'élève
         passe avant le compteur. Nouvel onglet ou touche de modification :
         la page reste, on n'intercepte rien. */
      var memeOnglet = (a.getAttribute('target') || '_self') === '_self'
                    && !ev.ctrlKey && !ev.metaKey && !ev.shiftKey && ev.button === 0;
      if (memeOnglet) ev.preventDefault();
      var ecrit = enFile(function () {
        return P.lire('cours', CLE_TELECH).then(function (v) {
          var t = maintenant();
          var avant = (v && v.fichiers && v.fichiers[fichier]) || {};
          var fichiers = Object.assign({}, (v && v.fichiers) || {});
          fichiers[fichier] = {
            page     : CLE || avant.page || null,
            premier_le: avant.premier_le || t,
            dernier_le: t,
            n        : (avant.n || 0) + 1
          };
          return P.ecrire('cours', CLE_TELECH, { fichiers: fichiers });
        });
      });
      if (memeOnglet) {
        var parti = false;
        var partir = function () { if (!parti) { parti = true; global.location.href = a.href; } };
        ecrit.then(partir);
        global.setTimeout(partir, 1200);
      }
    }, true);
  });
})(window);
