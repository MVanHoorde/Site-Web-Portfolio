/* ============================================================
 *  lire-xlsx.js — lit un classeur Excel (.xlsx) SUR L'APPAREIL
 *
 *  Pour la table des noms (Réglages du tableau de bord) : le
 *  classeur tel qu'il est rangé sur OneDrive, sans passer par
 *  « Enregistrer en CSV ». Aucune bibliothèque, aucun CDN (règle
 *  RGPD du site) : un .xlsx est un zip de fichiers XML, que le
 *  navigateur sait décompresser seul (DecompressionStream).
 *
 *  LireXlsx.enTexte(ArrayBuffer) → Promise<string>
 *    le texte d'UNE feuille, au format CSV « ; » d'Excel français,
 *    que ProfAPI.chargerNoms lit déjà. La feuille retenue est la
 *    première qui porte un en-tête « Identifiant » ; à défaut, la
 *    première du classeur.
 *
 *  Le vieux format .xls (binaire) n'est pas lu : il faut le
 *  réenregistrer en .xlsx ou en CSV.
 * ============================================================ */
(function (global) {
  'use strict';

  var PLAFOND = 30 * 1024 * 1024;   /* un fichier XML décompressé, au plus */

  function u16(o, i) { return o[i] | (o[i + 1] << 8); }
  function u32(o, i) { return (o[i] | (o[i + 1] << 8) | (o[i + 2] << 16)) + o[i + 3] * 16777216; }

  /* Répertoire central du zip : nom → { methode, taille, decalage } */
  function lireZip(o) {
    var fin = -1;
    for (var i = o.length - 22; i >= 0 && i >= o.length - 65557; i--) {
      if (o[i] === 0x50 && o[i + 1] === 0x4b && o[i + 2] === 0x05 && o[i + 3] === 0x06) { fin = i; break; }
    }
    if (fin < 0) throw new Error('pas un classeur .xlsx');
    var nb = u16(o, fin + 10), p = u32(o, fin + 16), entrees = {};
    var dec = new TextDecoder('utf-8');
    for (var k = 0; k < nb; k++) {
      if (u32(o, p) !== 0x02014b50) break;
      var lgNom = u16(o, p + 28), lgExtra = u16(o, p + 30), lgCom = u16(o, p + 32);
      var nom = dec.decode(o.subarray(p + 46, p + 46 + lgNom));
      entrees[nom] = { methode: u16(o, p + 10), taille: u32(o, p + 20), decalage: u32(o, p + 42) };
      p += 46 + lgNom + lgExtra + lgCom;
    }
    return entrees;
  }

  function extraire(o, entrees, nom) {
    var e = entrees[nom];
    if (!e) return Promise.resolve(null);
    var d = e.decalage;
    var debut = d + 30 + u16(o, d + 26) + u16(o, d + 28);
    var brut = o.subarray(debut, debut + e.taille);
    if (e.methode === 0) return Promise.resolve(new TextDecoder('utf-8').decode(brut));
    if (e.methode !== 8) return Promise.reject(new Error('compression non prise en charge'));
    if (typeof DecompressionStream === 'undefined')
      return Promise.reject(new Error('navigateur trop ancien pour lire un .xlsx'));
    var flux = new Blob([brut]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    return new Response(flux).arrayBuffer().then(function (b) {
      if (b.byteLength > PLAFOND) throw new Error('feuille trop volumineuse');
      return new TextDecoder('utf-8').decode(b);
    });
  }

  function xml(texte) { return new DOMParser().parseFromString(texte, 'application/xml'); }
  function tous(n, tag) { return Array.prototype.slice.call(n.getElementsByTagNameNS('*', tag)); }
  function enfant(n, tag) {
    for (var c = n.firstElementChild; c; c = c.nextElementSibling) if (c.localName === tag) return c;
    return null;
  }

  /* Texte d'une chaîne riche (<si> ou <is>) : les <t>, sauf la
     phonétique (<rPh>) qu'Excel japonais y glisse. */
  function texteRiche(n) {
    return tous(n, 't').filter(function (t) {
      return !(t.parentNode && t.parentNode.localName === 'rPh');
    }).map(function (t) { return t.textContent; }).join('');
  }

  function colonne(ref) {
    var m = /^([A-Z]+)/.exec(ref || ''), c = 0;
    if (!m) return -1;
    for (var i = 0; i < m[1].length; i++) c = c * 26 + (m[1].charCodeAt(i) - 64);
    return c - 1;
  }

  function lignesFeuille(doc, partagees) {
    var lignes = [];
    tous(doc, 'row').forEach(function (r, iR) {
      var nR = parseInt(r.getAttribute('r'), 10);
      var ligne = [], suivante = 0;
      tous(r, 'c').forEach(function (c) {
        var col = colonne(c.getAttribute('r'));
        if (col < 0) col = suivante;
        suivante = col + 1;
        var type = c.getAttribute('t'), v = enfant(c, 'v'), val = '';
        if (type === 's') val = v ? (partagees[parseInt(v.textContent, 10)] || '') : '';
        else if (type === 'inlineStr') { var is = enfant(c, 'is'); val = is ? texteRiche(is) : ''; }
        else val = v ? v.textContent : '';
        ligne[col] = val;
      });
      lignes[(nR > 0 ? nR : iR + 1) - 1] = ligne;
    });
    return lignes;
  }

  function enCsv(lignes) {
    var out = [];
    for (var i = 0; i < lignes.length; i++) {
      var l = lignes[i] || [], champs = [];
      for (var j = 0; j < l.length; j++) {
        var t = String(l[j] == null ? '' : l[j]).replace(/[\r\n]+/g, ' ');
        if (/[;",]/.test(t)) t = '"' + t.replace(/"/g, '""') + '"';
        champs.push(t);
      }
      out.push(champs.join(';'));
    }
    return out.join('\n');
  }

  function cheminCible(cible) {
    cible = String(cible || '');
    if (cible.charAt(0) === '/') return cible.slice(1);
    return 'xl/' + cible.replace(/^\.\//, '');
  }

  function enTexte(tampon) {
    var o = new Uint8Array(tampon);
    var entrees;
    try { entrees = lireZip(o); } catch (e) { return Promise.reject(e); }
    return Promise.all([
      extraire(o, entrees, 'xl/workbook.xml'),
      extraire(o, entrees, 'xl/_rels/workbook.xml.rels'),
      extraire(o, entrees, 'xl/sharedStrings.xml')
    ]).then(function (r) {
      if (!r[0]) throw new Error('pas un classeur .xlsx');
      var cibles = {};
      if (r[1]) tous(xml(r[1]), 'Relationship').forEach(function (n) {
        cibles[n.getAttribute('Id')] = cheminCible(n.getAttribute('Target'));
      });
      var feuilles = tous(xml(r[0]), 'sheet').map(function (s) {
        var id = s.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id')
              || s.getAttribute('r:id');
        return cibles[id];
      }).filter(Boolean);
      if (!feuilles.length) feuilles = Object.keys(entrees).filter(function (n) {
        return /^xl\/worksheets\/[^/]+\.xml$/.test(n);
      }).sort();
      var partagees = r[2] ? tous(xml(r[2]), 'si').map(texteRiche) : [];

      /* feuille après feuille, jusqu'à celle qui a un en-tête « Identifiant » */
      var premiere = null, k = 0;
      function suivante() {
        if (k >= feuilles.length) return premiere || '';
        return extraire(o, entrees, feuilles[k++]).then(function (t) {
          if (!t) return suivante();
          var lignes = lignesFeuille(xml(t), partagees);
          var csv = enCsv(lignes);
          if (premiere === null) premiere = csv;
          var trouve = lignes.slice(0, 30).some(function (l) {
            return (l || []).some(function (c) { return /^\s*identifiant\s*$/i.test(c || ''); });
          });
          return trouve ? csv : suivante();
        });
      }
      return suivante();
    });
  }

  /* Un .xlsx commence par « PK » (zip), un CSV jamais. */
  function estXlsx(tampon) {
    var o = new Uint8Array(tampon, 0, Math.min(4, tampon.byteLength));
    return o.length >= 4 && o[0] === 0x50 && o[1] === 0x4b && o[2] === 0x03 && o[3] === 0x04;
  }
  /* Le vieux .xls binaire (OLE) : D0 CF 11 E0 */
  function estXlsAncien(tampon) {
    var o = new Uint8Array(tampon, 0, Math.min(4, tampon.byteLength));
    return o.length >= 4 && o[0] === 0xd0 && o[1] === 0xcf && o[2] === 0x11 && o[3] === 0xe0;
  }

  global.LireXlsx = { enTexte: enTexte, estXlsx: estXlsx, estXlsAncien: estXlsAncien };
})(window);
