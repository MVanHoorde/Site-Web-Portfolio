/* ============================================================
 *  prof-emc.js — l'onglet « EMC » du tableau de bord
 *  ------------------------------------------------------------
 *  07/11/2026. Séances d'EMC de seconde autour du « Labyrinthe de
 *  Nina » (architecture : _suivi/AUDIT-EMC.md). L'espace 'emc' n'est
 *  visible que des enseignants rattachés à une classe EMC — Loïc et
 *  Mme Castel, à droits égaux.
 *
 *  Ce panneau est un sommaire : pour chaque créneau, le CODE à
 *  écrire au tableau, qui est là, qui est prêt, l'étape en cours, les
 *  demandes d'aide en attente (le nombre seulement : le détail vit
 *  dans le pilotage) ; et les portes vers le pilotage, la projection
 *  et l'éditeur de contenus. Le travail se fait dans ces pages-là.
 *
 *  Relu toutes les 15 s tant que l'onglet est ouvert.
 * ============================================================ */
(function () {
  'use strict';

  var panneau = document.getElementById('p-emc');
  var bouton = document.querySelector('nav.onglets button[data-onglet="emc"]');
  if (!panneau || !bouton || !window.ProfAPI) return;

  var NOMS_ETAPES = ['Installation', 'Mots & émotions', 'Missions', 'Le jeu', 'Carte mentale',
                     'Vidéo', 'Harcèlomètre', 'Enquête'];

  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }

  var style = el('style');
  style.textContent =
    '.emc-liste{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px;margin:12px 0}' +
    '.emc-creneau{border:1px solid var(--line);border-radius:12px;padding:14px;background:var(--surface)}' +
    '.emc-creneau.aide{border:2px solid var(--err)}' +
    '.emc-code{font:700 30px/1 "IBM Plex Mono",monospace;letter-spacing:.08em;color:var(--ink)}' +
    '.emc-lib{font-size:14px;color:var(--ink-soft);margin:4px 0 10px}' +
    '.emc-chiffres{display:flex;gap:16px;flex-wrap:wrap;margin:6px 0 12px;font-size:14px}' +
    '.emc-chiffres b{font-size:20px;display:block;color:var(--ink)}' +
    '.emc-alerte{color:var(--err);font-weight:700}' +
    '.emc-actions{display:flex;gap:8px;flex-wrap:wrap}' +
    '.emc-actions a{display:inline-flex;align-items:center;min-height:40px;padding:6px 14px;border-radius:var(--r);' +
      'border:1px solid var(--line);text-decoration:none;font-weight:600;color:var(--ink);background:var(--surface)}' +
    '.emc-actions a.primaire{background:var(--link);border-color:var(--link);color:#fff}' +
    '.emc-docs{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:10px 18px;margin:8px 0 4px}' +
    '.emc-docs h3{font-size:14px;margin:0 0 4px;color:var(--ink-soft);text-transform:uppercase;letter-spacing:.04em}' +
    '.emc-docs a{display:flex;align-items:center;gap:8px;min-height:40px;padding:4px 0;color:var(--link);font-weight:600;text-decoration:none}' +
    '.emc-docs a span{font-weight:400;color:var(--ink-soft);font-size:13px}' +
    '.emc-docs-boite{border:1px solid var(--line);border-radius:12px;padding:12px 14px;margin:12px 0;background:var(--surface)}';
  document.head.appendChild(style);

  var etat = el('p', 'muet', 'Chargement…');
  var liste = el('div', 'emc-liste');
  var intro = el('div', 'encadre');
  intro.innerHTML =
    '<b>EMC seconde, 12 et 13/11.</b> Une séance = une classe : l\'accueil du groupe D (jeu de rôle), ' +
    'les quatre créneaux du Labyrinthe de Nina, la restitution avec la 2nde 1. ' +
    'Les élèves entrent avec une <b>carte</b> (identifiant + code à 4 chiffres) : à générer et imprimer dans le pilotage, onglet 🎟 Cartes. ' +
    '<br>📋 <b>Feuille de correspondance</b> : relevez sur papier identifiant ↔ nom, prénom, classe. ' +
    'Pour voir les noms dans le pilotage, chargez-la comme fichier dans <b>Réglages → table des noms</b> ' +
    '(elle ne quitte pas cet appareil).';
  var liens = el('div', 'emc-actions');
  var aContenus = el('a', null, '✏️ Contenus de la séance (questions, missions, situations…)');
  aContenus.href = 'emc-contenus.html';
  liens.appendChild(aContenus);
  panneau.appendChild(el('h2', null, 'EMC seconde'));
  panneau.appendChild(intro);
  panneau.appendChild(liens);

  /* 08/11/2026 — tout le papier et les mémos au même endroit, dans
     l'ordre où on s'en sert (sources : fiches/emc/, guide-emc.html). */
  var PDF = '../assets/pdf/';
  var DOCS = [
    { titre: '📋 Les mémos (une page chacun)', liens: [
      ['emc/memo-1-deux-jours.pdf', '1 · Les deux jours dans l’ordre', 'la veille, chaque séance, la fin'],
      ['emc/memo-2-jeu-de-role.pdf', '2 · Le jeu de rôle, minuté', 'jeudi 8 h 30, groupe D'],
      ['emc/memo-3-labyrinthe.pdf', '3 · Le Labyrinthe, minuté', 'les 4 créneaux'],
      ['emc/memo-4-restitution.pdf', '4 · La restitution, minutée', 'vendredi 14 h, 2nde 1'],
      ['prof/guide-emc.pdf', 'Le guide complet', 'il fait foi']] },
    { titre: '🖨 À imprimer pour les élèves', liens: [
      ['emc/fiche-liberte-pour-moi.pdf', '« La liberté, pour moi »', 'jeu de rôle, étape 8 · 2 par A4'],
      ['emc/fiche-association-nina.pdf', 'Fiche d’association personnages ↔ rôles', 'Labyrinthe, pendant le jeu'],
      ['emc/feuille-correspondance.pdf', 'Feuille de correspondance (vierge)', 'en secours : la planche de cartes donne la pré-remplie']] }
  ];
  var boite = el('div', 'emc-docs-boite');
  boite.appendChild(el('b', null, 'Documents à imprimer et mémos'));
  boite.appendChild(el('p', 'muet', 'Les cartes des élèves, elles, se génèrent dans chaque séance : « Piloter » → 🎟 Cartes.'));
  var docs = el('div', 'emc-docs');
  DOCS.forEach(function (g) {
    var col = el('div'); col.appendChild(el('h3', null, g.titre));
    g.liens.forEach(function (d) {
      var a = el('a', null, '📄 ' + d[1]); a.href = PDF + d[0]; a.target = '_blank'; a.rel = 'noopener';
      a.appendChild(el('span', null, '· ' + d[2])); col.appendChild(a);
    });
    docs.appendChild(col);
  });
  boite.appendChild(docs);
  panneau.appendChild(boite);
  panneau.appendChild(liste);
  panneau.appendChild(etat);

  function compter(lignes, cle) {
    var n = {};
    lignes.forEach(function (l) { n[l[cle]] = (n[l[cle]] || 0) + 1; });
    return n;
  }

  var minuteur = null;
  function charger() {
    return ProfAPI.lire('classes?select=id,code,libelle&espace=eq.emc&order=code').then(function (classes) {
      if (!classes.length) { liste.innerHTML = ''; etat.textContent = 'Aucune classe EMC rattachée à ton compte.'; return; }
      var ids = classes.map(function (c) { return c.id; }).join(',');
      return Promise.all([
        ProfAPI.lire('emc_participants?select=classe_id,pret&classe_id=in.(' + ids + ')'),
        ProfAPI.lire('emc_seances?select=classe_id,etape,cloturee_le,module&classe_id=in.(' + ids + ')'),
        ProfAPI.lire('emc_aide?select=classe_id&statut=eq.a_traiter&classe_id=in.(' + ids + ')')
      ]).then(function (r) {
        var presents = compter(r[0], 'classe_id');
        var prets = compter(r[0].filter(function (p) { return p.pret; }), 'classe_id');
        var aides = compter(r[2], 'classe_id');
        var seance = {}; r[1].forEach(function (s) { seance[s.classe_id] = s; });
        liste.innerHTML = '';
        classes.forEach(function (c) {
          var s = seance[c.id] || {}, a = aides[c.id] || 0;
          var b = el('div', 'emc-creneau' + (a ? ' aide' : ''));
          b.appendChild(el('div', 'emc-code', c.code));
          b.appendChild(el('div', 'emc-lib', c.libelle));
          var ch = el('div', 'emc-chiffres');
          var f = function (n, lib) { var x = el('span'); x.appendChild(el('b', null, String(n))); x.appendChild(document.createTextNode(lib)); return x; };
          ch.appendChild(f(presents[c.id] || 0, 'présents'));
          ch.appendChild(f(prets[c.id] || 0, 'prêts'));
          var et = el('span');
          et.appendChild(el('b', null, s.cloturee_le ? 'Close' : (s.etape != null ? 'Étape ' + s.etape : '—')));
          et.appendChild(document.createTextNode(s.cloturee_le ? 'séance clôturée' : (s.etape != null ? (s.module && s.module !== 'nina' ? '' : NOMS_ETAPES[s.etape]) : 'pas commencée')));
          ch.appendChild(et);
          b.appendChild(ch);
          if (a) b.appendChild(el('p', 'emc-alerte', '🔔 ' + a + ' demande' + (a > 1 ? 's' : '') + ' « J\'ai besoin d\'en parler » à traiter'));
          var act = el('div', 'emc-actions');
          var p = el('a', 'primaire', 'Piloter'); p.href = 'emc.html?classe=' + encodeURIComponent(c.code);
          var q = el('a', null, 'Projeter ↗'); q.href = s.module === 'accueil' ? 'emc-accueil.html?vue=projection&classe=' + encodeURIComponent(c.code)
            : s.module === 'restitution' ? 'emc-restitution.html?vue=projection&classe=' + encodeURIComponent(c.code)
            : 'emc-projection.html?classe=' + encodeURIComponent(c.code); q.target = '_blank';
          act.appendChild(p); act.appendChild(q);
          b.appendChild(act);
          liste.appendChild(b);
        });
        etat.textContent = 'Mis à jour à ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + '.';
      });
    }).catch(function (e) { etat.textContent = 'Lecture impossible : ' + (e.message || e); });
  }

  function ouvert() { return panneau.classList.contains('actif'); }
  bouton.addEventListener('click', function () {
    charger();
    if (!minuteur) minuteur = setInterval(function () { if (ouvert() && !document.hidden) charger(); }, 15000);
  });
})();
