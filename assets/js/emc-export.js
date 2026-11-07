/* ============================================================
 *  emc-export.js — télécharger et partager les résultats de la
 *  séance EMC (nuage, harcèlomètre, carte mentale, enquête), pour
 *  les imprimer ou les envoyer.
 *
 *  La mécanique est celle des fiches SNT (sequence-snt.js, « LA
 *  FICHE EN VRAI PDF », 04/10/2026) : la page fabrique le PDF
 *  elle-même, html2canvas-pro photographie, jsPDF assemble ; puis
 *  on le remet par la feuille de partage d'iOS (« Enregistrer dans
 *  Fichiers », OneDrive) quand l'appareil sait partager un fichier,
 *  et par un téléchargement, partout. Deux gestes, pas un : Safari
 *  refuse une feuille de partage ouverte plusieurs secondes après le
 *  toucher — on prépare d'abord, on enregistre ensuite.
 *
 *  Les bibliothèques sont hébergées dans assets/js/vendor (MIT) et
 *  chargées au premier export seulement.
 *
 *  API
 *    EMC.Export.pdf({ titre, sousTitre, pages: [{ titre, element |
 *                     canvas | blob }], paysage }) → Promise<Blob>
 *    EMC.Export.proposer(fabrique | blob, nomFichier, opts)
 *        (opts.titre, opts.attente : le message pendant la préparation)
 *        ouvre la fenêtre, attend le fichier, puis « Enregistrer /
 *        partager » + « Télécharger ».
 *    EMC.Export.feuille(largeurPx) → un <div> blanc hors écran, à
 *        remplir avant de le passer en  element  (et à retirer après).
 *
 *  🔴 Jamais de nom ni de pseudo dans un export, jamais l'aide.
 * ============================================================ */
(function (global) {
  'use strict';
  var EMC = global.EMC, el = EMC.el;

  var libs = null;
  function chargerScript(src) {
    return new Promise(function (ok, ko) {
      var s = document.createElement('script'); s.src = src; s.async = true;
      s.onload = ok; s.onerror = function () { ko(new Error('chargement impossible : ' + src)); };
      document.head.appendChild(s);
    });
  }
  function bibliotheques() {
    if (!libs) {
      var moi = document.querySelector('script[src*="emc-export.js"]');
      var base = moi ? moi.src.replace(/emc-export\.js.*$/, '') : '../assets/js/';
      libs = Promise.all([
        global.html2canvas ? 0 : chargerScript(base + 'vendor/html2canvas-pro-2.5.1.min.js'),
        (global.jspdf && global.jspdf.jsPDF) ? 0 : chargerScript(base + 'vendor/jspdf-4.2.1.umd.min.js')
      ]).catch(function (e) { libs = null; throw e; });
    }
    return libs;
  }

  /* Une feuille blanche hors écran, à la largeur voulue : on y monte
     un résultat à la taille d'impression, on la photographie. */
  function feuille(largeur) {
    var f = el('div', { class: 'emc-feuille' });
    f.style.cssText = 'position:absolute;left:-12000px;top:0;background:#fff;color:#161f33;padding:24px;'
      + 'width:' + (largeur || 1400) + 'px;font-size:18px;';
    document.body.appendChild(f);
    return f;
  }

  function enCanvas(p) {
    if (p.canvas) return Promise.resolve(p.canvas);
    if (p.blob) {
      return new Promise(function (ok, ko) {
        var u = URL.createObjectURL(p.blob), im = new Image();
        im.onload = function () {
          var c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight;
          var g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(im, 0, 0);
          URL.revokeObjectURL(u); ok(c);
        };
        im.onerror = function () { URL.revokeObjectURL(u); ko(new Error('image illisible')); };
        im.src = u;
      });
    }
    return global.html2canvas(p.element, { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false });
  }

  function aujourdhui() {
    return new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  /* Une page par entrée, l'image ajustée sous un titre, un pied commun. */
  function pdf(o) {
    return bibliotheques().then(function () {
      var jsPDF = global.jspdf.jsPDF;
      var doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: o.paysage === false ? 'portrait' : 'landscape', compress: true });
      var L = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight();
      var MX = 10, haut = 20, bas = 10;
      var pages = o.pages || [];
      var suite = Promise.resolve();
      pages.forEach(function (p, i) {
        suite = suite.then(function () { return enCanvas(p); }).then(function (cv) {
          if (i) doc.addPage();
          doc.setFont('helvetica', 'bold'); doc.setFontSize(15); doc.setTextColor(22, 31, 51);
          doc.text(p.titre || o.titre || '', MX, 13);
          doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(74, 86, 110);
          doc.text((o.titre || 'EMC seconde') + (o.sousTitre ? ' · ' + o.sousTitre : '') + ' · ' + aujourdhui(), MX, H - 5);
          doc.text((i + 1) + ' / ' + pages.length, L - MX, H - 5, { align: 'right' });
          var lmax = L - 2 * MX, hmax = H - haut - bas;
          var r = Math.min(lmax / cv.width, hmax / cv.height);
          var w = cv.width * r, h = cv.height * r;
          doc.addImage(cv.toDataURL('image/jpeg', 0.92), 'JPEG', MX + (lmax - w) / 2, haut, w, h, undefined, 'FAST');
        });
      });
      return suite.then(function () { return doc.output('blob'); });
    });
  }

  /* Nom de fichier sans accents ni espaces. */
  function nomPropre(s) {
    return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9.]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  }

  /* La fenêtre « Préparer → Enregistrer ». fabrique : une fonction
     qui rend une Promise<Blob>, ou directement un Blob. */
  function proposer(fabrique, nom, opts) {
    opts = opts || {};
    nom = nomPropre(nom);
    var etat = el('p', null, opts.attente || 'Préparation du fichier…');
    var actions = el('div', { class: 'rangee', hidden: true });
    var fermer = el('button', { type: 'button', onclick: function () { fond.remove(); } }, 'Fermer');
    var fond = el('div', { class: 'modale-fond', onclick: function (e) { if (e.target === fond) fond.remove(); } },
      el('div', { class: 'modale', role: 'dialog', 'aria-modal': 'true' },
        el('h2', null, opts.titre || 'Exporter'), etat, actions, el('div', { class: 'rangee', style: 'margin-top:1rem' }, fermer)));
    document.body.appendChild(fond);
    Promise.resolve(typeof fabrique === 'function' ? fabrique() : fabrique).then(function (blob) {
      if (!fond.isConnected) return;
      var type = blob.type || (/\.png$/i.test(nom) ? 'image/png' : 'application/pdf');
      var fichier = null;
      try { fichier = new File([blob], nom, { type: type }); } catch (e) {}
      var partage = !!(fichier && navigator.canShare && navigator.share && navigator.canShare({ files: [fichier] }));
      var url = URL.createObjectURL(blob);
      etat.textContent = '✅ Prêt : ' + nom + ' (' + Math.max(1, Math.round(blob.size / 1024)) + ' Ko).';
      actions.hidden = false;
      var aide = el('p', { class: 'tresmuet', style: 'flex-basis:100%' });
      if (partage) {
        actions.appendChild(el('button', { type: 'button', class: 'primaire', onclick: function () {
          navigator.share({ files: [fichier], title: nom }).catch(function (e) {
            if (e && e.name === 'AbortError') return;
            aide.textContent = 'Le partage n’a pas marché. Utilise plutôt « Télécharger ».';
          });
        } }, '📤 Enregistrer / partager'));
      }
      actions.appendChild(el('a', { class: 'bouton' + (partage ? '' : ' primaire'), href: url, download: nom, 'data-export': nom }, '📥 Télécharger'));
      aide.textContent = partage
        ? 'Sur iPad : « Enregistrer / partager », puis « Enregistrer dans Fichiers » (OneDrive) ou « Imprimer ».'
        : 'Le fichier arrive dans les Téléchargements : ouvre-le pour l’imprimer.';
      actions.appendChild(aide);
      if (opts.surPret) opts.surPret(blob);
    }).catch(function (e) {
      if (!fond.isConnected) return;
      etat.textContent = '⚠️ Le fichier n’a pas pu être préparé sur cet appareil : ' + (e && e.message || e);
      try { console.warn('export EMC :', e); } catch (_) {}
    });
    return fond;
  }

  EMC.Export = { pdf: pdf, proposer: proposer, feuille: feuille, bibliotheques: bibliotheques, nomPropre: nomPropre };
})(window);
