/* ============================================================
 *  prof-emc-outils.js — ce que tous les pilotages EMC partagent
 *  (prof/emc.html pour le Labyrinthe, prof/emc-accueil.html pour le
 *  jeu de rôle) : les CARTES éphémères et la CLÔTURE.
 *
 *  EMC.Outils.cartes(conteneur, classe, opts)
 *     générer N cartes (fonction Edge emc-cartes), les compter, voir
 *     lesquelles ont servi, ouvrir la planche à imprimer.
 *  EMC.Outils.cloture(conteneur, classe, opts)
 *     clôturer (emc_cloturer), remettre à zéro après une répétition
 *     (emc_reinitialiser), compter puis supprimer les comptes
 *     (emc_supprimer_comptes).
 *  opts.apres(quoi) : rappelé après chaque geste, pour relire.
 *
 *  Base : bdd/schema/031 et 034. Fonction : supabase/functions/emc-cartes.
 * ============================================================ */
(function (global) {
  'use strict';
  var EMC = global.EMC, el = EMC.el;

  function resultat(z, ok, t) { z.className = 'alerte show ' + (ok ? 'ok' : 'err'); z.textContent = t; }

  /* La fonction Edge : la base décide si ce prof en a le droit. */
  EMC.genererCartes = function (classeId, nombre) {
    return EMC.jeton().then(function (t) {
      return fetch(EMC.URL_PROJET + '/functions/v1/emc-cartes', {
        method: 'POST',
        headers: { apikey: EMC.CLE_ANON, Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' },
        body: JSON.stringify({ classe_id: classeId, nombre: nombre })
      });
    }).then(function (r) {
      return r.text().then(function (t) {
        var j = {}; try { j = JSON.parse(t); } catch (e) {}
        if (!r.ok && !(j.cartes && j.cartes.length)) {
          var err = new Error(j.erreur === 'PAS_MA_CLASSE' ? 'Cette séance n\'est pas rattachée à ton compte.'
            : r.status === 404 ? 'La fonction emc-cartes n\'est pas encore déployée (supabase functions deploy emc-cartes --no-verify-jwt).'
            : 'Génération impossible (' + (j.erreur || 'HTTP ' + r.status) + ').');
          err.statut = r.status; throw err;
        }
        return j;
      });
    });
  };

  var Outils = {};

  Outils.cartes = function (z, classe, opts) {
    opts = opts || {};
    z.innerHTML = '';
    var n = el('input', { type: 'number', min: '1', max: '40', value: '32', style: 'width:6rem', 'aria-label': 'Nombre de cartes' });
    var gen = el('button', { type: 'button', class: 'orange' }, 'Générer');
    var imp = el('a', { class: 'bouton primaire', href: 'emc-cartes.html?classe=' + encodeURIComponent(classe.code), target: '_blank' }, '🖨 Imprimer les cartes');
    var res = el('div', { class: 'alerte' });
    var etat = el('p', { class: 'muet' }, '…');
    var liste = el('div', { class: 'liste-cartes' });
    z.appendChild(el('div', { class: 'carte-blanche' },
      el('h2', null, '🎟 Cartes de la séance'),
      el('p', null, 'Chaque élève entre avec une carte : un identifiant et un code à 4 chiffres, ou le QR code. ',
        el('b', null, 'Les comptes partent à la suppression'), ' (onglet Clôture). Les élèves qui ont un compte sur le site utilisent aussi une carte : leur compte habituel n\'est pas touché.'),
      etat,
      el('div', { class: 'rangee' }, el('label', { style: 'margin:0;display:flex;gap:.5rem;align-items:center' }, 'Ajouter', n, 'cartes'), gen, imp),
      res));
    z.appendChild(el('div', { class: 'carte-blanche' }, el('h3', null, 'Les cartes'), liste));

    function relire() {
      return Promise.all([
        EMC.lire('emc_cartes?select=identifiant,code,eleve_id&classe_id=eq.' + classe.id + '&order=identifiant'),
        EMC.lire('emc_participants?select=eleve_id&classe_id=eq.' + classe.id)
      ]).then(function (r) {
        var entres = {}; r[1].forEach(function (p) { entres[p.eleve_id] = true; });
        var servies = r[0].filter(function (c) { return entres[c.eleve_id]; }).length;
        etat.textContent = r[0].length ? r[0].length + ' carte(s) préparée(s), ' + servies + ' déjà utilisée(s).' : 'Aucune carte pour l\'instant.';
        imp.hidden = !r[0].length;
        liste.innerHTML = '';
        if (!r[0].length) { liste.appendChild(el('p', { class: 'tresmuet' }, 'Génère-les avant la séance, puis imprime la planche.')); return; }
        liste.appendChild(el('div', { style: 'display:flex;flex-wrap:wrap;gap:.35rem' }, r[0].map(function (c) {
          return el('span', { class: 'pastille mono ' + (entres[c.eleve_id] ? 'ok' : ''), title: entres[c.eleve_id] ? 'entrée dans la séance' : 'pas encore utilisée' },
            c.identifiant, el('b', { style: 'margin-left:.5em;letter-spacing:.12em' }, c.code));
        })));
      }, function (e) { etat.textContent = EMC.message(e); });
    }
    gen.addEventListener('click', function () {
      var k = Math.max(1, Math.min(40, parseInt(n.value, 10) || 0));
      if (!confirm('Créer ' + k + ' carte(s) pour ' + classe.libelle + ' ?')) return;
      gen.disabled = true; gen.textContent = 'Création… (quelques secondes)';
      EMC.genererCartes(classe.id, k).then(function (j) {
        resultat(res, !j.ratees, j.cartes.length + ' carte(s) créée(s)' + (j.ratees ? ', ' + j.ratees + ' ratée(s) : relance pour les compléter.' : '. Tu peux imprimer.'));
        return relire();
      }, function (e) { resultat(res, false, e.message); }).then(function () {
        gen.disabled = false; gen.textContent = 'Générer';
        if (opts.apres) opts.apres('cartes');
      });
    });
    relire();
    return { relire: relire };
  };

  Outils.cloture = function (z, classe, opts) {
    opts = opts || {};
    z.innerHTML = '';
    var rc = el('div', { class: 'alerte' }), rz = el('div', { class: 'alerte' }), rs = el('div', { class: 'alerte' });
    var bClore = el('button', { type: 'button', class: 'danger' }, 'Clôturer cette séance…');
    var bZero = el('button', { type: 'button' }, 'Remettre à zéro…');
    var bCompter = el('button', { type: 'button' }, 'Compter');
    var bSupprimer = el('button', { type: 'button', class: 'danger', disabled: true }, 'Supprimer ces comptes…');
    z.appendChild(el('div', { class: 'carte-blanche' },
      el('h2', null, 'Clôturer la séance'),
      el('p', null, 'Efface ', el('b', null, 'toutes les demandes « J\'ai besoin d\'en parler »'), (opts.texteCloture || '') + ' et ferme la séance : plus rien ne s\'écrit. Les résultats restent lisibles et exportables.'),
      bClore, rc));
    z.appendChild(el('div', { class: 'carte-blanche' },
      el('h2', null, 'Remettre à zéro'),
      el('p', null, 'Après une répétition ou un test : efface tout le travail des élèves de cette séance (participants, réponses, aide…) et la rouvre à l\'étape 0. ',
        el('b', null, 'Les cartes restent valables'), ' : celles qui sont imprimées serviront le jour J.'),
      bZero, rz));
    z.appendChild(el('div', { class: 'carte-blanche' },
      el('h2', null, 'Supprimer les comptes'),
      el('p', null, 'Les comptes des cartes de cette séance, et tout compte créé pour elle qui n\'a ', el('b', null, 'aucune autre classe'), '. 🔴 ',
        el('b', null, 'Leur travail part avec eux'), ' : à faire ', el('b', null, 'après les exports'), '.'),
      el('div', { class: 'rangee' }, bCompter, bSupprimer), rs));

    bClore.addEventListener('click', function () {
      if (!confirm('Clôturer ' + classe.libelle + ' ?\n\nToutes les demandes « J\'ai besoin d\'en parler » seront EFFACÉES, et plus rien ne pourra s\'écrire.')) return;
      if (!confirm('Dernière confirmation : les exports sont faits ?')) return;
      EMC.rpc('emc_cloturer', { p_classe: classe.id }).then(function (n) {
        resultat(rc, true, 'Séance clôturée. ' + n + ' demande(s) d\'aide effacée(s).');
        if (opts.apres) opts.apres('cloture');
      }, function (e) { resultat(rc, false, EMC.message(e)); });
    });
    bZero.addEventListener('click', function () {
      if (!confirm('Remettre ' + classe.libelle + ' à zéro ?\n\nTout le travail des élèves de cette séance sera effacé. Les cartes restent valables.')) return;
      EMC.rpc('emc_reinitialiser', { p_classe: classe.id }).then(function () {
        resultat(rz, true, 'Séance remise à zéro : étape 0, plus aucun participant.');
        try { Object.keys(sessionStorage).forEach(function (k) { if (k.indexOf('emc.') === 0) sessionStorage.removeItem(k); }); } catch (e) {}
        if (opts.apres) opts.apres('zero');
      }, function (e) { resultat(rz, false, EMC.message(e)); });
    });
    var aSupprimer = 0;
    bCompter.addEventListener('click', function () {
      EMC.rpc('emc_supprimer_comptes', { p_classe: classe.id, p_confirmer: false }).then(function (n) {
        aSupprimer = n;
        resultat(rs, true, n + ' compte(s) à supprimer dans cette séance.');
        bSupprimer.disabled = !n;
      }, function (e) { resultat(rs, false, EMC.message(e)); });
    });
    bSupprimer.addEventListener('click', function () {
      if (!confirm('Supprimer ' + aSupprimer + ' compte(s) ?\n\nLeur travail part avec eux. C\'est définitif.')) return;
      if (!confirm('Vraiment ? Les exports de cette séance sont faits ?')) return;
      EMC.rpc('emc_supprimer_comptes', { p_classe: classe.id, p_confirmer: true }).then(function (n) {
        resultat(rs, true, n + ' compte(s) supprimé(s).');
        bSupprimer.disabled = true;
        if (opts.apres) opts.apres('suppression');
      }, function (e) { resultat(rs, false, EMC.message(e)); });
    });
  };

  EMC.Outils = Outils;
})(window);
