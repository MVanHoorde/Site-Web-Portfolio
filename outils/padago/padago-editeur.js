/* ============================================================
 *  padago-editeur.js — l'espace de la prof
 *  ------------------------------------------------------------
 *  Vues : connexion · invitation · mes pads · éditeur.
 *  Adresse :  index.html            → mes pads
 *             index.html#pad=<id>   → l'éditeur de ce pad
 *             index.html#copier=<lien> → copier le pad d'une collègue
 *  Sauvegarde automatique 1,5 s après la dernière modification :
 *  le brouillon (codes en clair) ET la version élève (empreintes).
 * ============================================================ */
(function () {
  'use strict';
  var P = window.Padago, Api = P.Api, esc = P.esc;
  var app = document.getElementById('app');
  var BASE = location.href.replace(/[#?].*$/, '').replace(/[^/]*$/, '');

  /* occ : la jauge (padago_occupation, 043) — null tant qu'elle n'est pas lue.
     enAttente : fichiers envoyés dont la carte n'est pas encore enregistrée
     (le ménage n'y touche pas). aMenager : un fichier a pu devenir orphelin. */
  var etat = { pad: null, modifie: false, minuteur: null, enCours: false, occ: null, enAttente: {}, aMenager: false };

  /* ---------- petits outils d'interface ---------- */
  function $(sel, racine) { return (racine || document).querySelector(sel); }
  function $$(sel, racine) { return Array.prototype.slice.call((racine || document).querySelectorAll(sel)); }
  function toast(msg) {
    var t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg;
    document.body.appendChild(t); setTimeout(function () { t.remove(); }, 2600);
  }
  function erreur(zone, e) { zone.hidden = false; zone.textContent = P.messageErreur(e); }
  function champMdp(id, auto) {
    return '<div class="mdp"><input type="password" id="' + id + '" autocomplete="' + auto + '" required minlength="8">'
      + '<button type="button" class="btn discret petit" data-voir="' + id + '">Voir</button></div>';
  }
  function brancherVoir(racine) {
    $$('[data-voir]', racine).forEach(function (b) {
      b.addEventListener('click', function () {
        var i = document.getElementById(b.getAttribute('data-voir'));
        i.type = i.type === 'password' ? 'text' : 'password';
        b.textContent = i.type === 'password' ? 'Voir' : 'Cacher';
      });
    });
  }
  function aide(texte) {
    return '<button type="button" class="aide-q" aria-label="Aide" data-aide>?</button><span class="bulle" hidden>' + texte + '</span>';
  }
  function brancherAides(racine) {
    $$('[data-aide]', racine).forEach(function (b) {
      b.addEventListener('click', function (ev) { ev.preventDefault(); var s = b.nextElementSibling; s.hidden = !s.hidden; });
    });
  }

  /* Boîte de dialogue générique. boutons : [{txt, classe, action(dlg) → false pour ne pas fermer, gauche}] */
  function dialogue(titre, corps, boutons, auDepart) {
    var d = document.createElement('dialog');
    d.innerHTML = '<div class="dlg-tete"><h2>' + titre + '</h2><button type="button" class="btn discret btn-ico" data-fermer aria-label="Fermer">✕</button></div>'
      + '<div class="dlg-corps">' + corps + '</div><div class="dlg-pied"></div>';
    var pied = $('.dlg-pied', d);
    (boutons || [{ txt: 'Fermer' }]).forEach(function (b) {
      var x = document.createElement('button'); x.type = 'button'; x.className = 'btn ' + (b.classe || '') + (b.gauche ? ' gauche' : '');
      x.innerHTML = b.txt;
      x.addEventListener('click', function () {
        var r = b.action ? b.action(d) : true;
        Promise.resolve(r).then(function (v) { if (v !== false) fermer(); });
      });
      pied.appendChild(x);
    });
    function fermer() { d.close(); d.remove(); }
    $('[data-fermer]', d).addEventListener('click', fermer);
    d.addEventListener('cancel', function () { setTimeout(function () { d.remove(); }, 0); });
    document.body.appendChild(d);
    brancherAides(d); brancherVoir(d);
    if (auDepart) auDepart(d);
    d.showModal();
    return d;
  }

  /* ============================================================
   *  FICHIERS DÉPOSÉS (bdd/schema/043)
   *  Chemin : <compte>/<id du pad>/<tirage>-<nom>. Une carte « fichier »
   *  ou « image » garde { chemin, nom, taille, mime }.
   * ============================================================ */
  function cheminsDe(B) {
    var l = [];
    (B.colonnes || []).forEach(function (c) { (c.cartes || []).forEach(function (k) { if (P.cheminSur(k.chemin)) l.push(k); }); });
    return l;
  }
  function chargerJauge() {
    return Api.occupation().then(function (o) {
      etat.occ = { total: +o.total || 0, pads: o.pads || {} }; majJauge();
    }).catch(function () { etat.occ = null; majJauge(); });
  }
  function majJauge() {
    var o = etat.occ, z;
    if ((z = $('#jauge'))) {
      if (!o) { z.hidden = true; return; }
      var ici = (etat.pad && o.pads[etat.pad.id]) || 0;
      z.hidden = false;
      z.textContent = '📎 ' + P.tailleLisible(ici) + ' · ' + Math.round(o.total / 1048576) + ' / ' + Math.round(P.PLAFOND / 1048576) + ' Mo';
      z.title = 'Fichiers de ce pad : ' + P.tailleLisible(ici) + '. Ton espace : ' + P.tailleLisible(o.total) + ' sur 300 Mo.';
      z.classList.toggle('haute', o.total > 0.8 * P.PLAFOND);
    }
    if ((z = $('#jauge-liste'))) {
      if (!o) { z.hidden = true; return; }
      var pc = Math.min(100, Math.round(100 * o.total / P.PLAFOND));
      z.hidden = false;
      z.innerHTML = '<span>📎 Tes fichiers déposés&nbsp;: <b>' + esc(P.tailleLisible(o.total)) + '</b> sur 300 Mo</span>'
        + '<span class="jauge-barre' + (pc > 80 ? ' haute' : '') + '"><i style="width:' + pc + '%"></i></span>';
    }
  }

  /* Une grande photo n'a pas besoin de 12 mégapixels : 1600 px, JPEG.
     On garde l'original s'il est déjà léger, ou si la réduction ne
     fait pas gagner de place. */
  function reduireImage(fichier, f) {
    if (fichier.size < 800 * 1024) return Promise.resolve({ blob: fichier, nom: fichier.name, mime: f.mime });
    return new Promise(function (ok) {
      var url = URL.createObjectURL(fichier), img = new Image();
      img.onload = function () {
        var r = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
        var c = document.createElement('canvas');
        c.width = Math.round(img.naturalWidth * r); c.height = Math.round(img.naturalHeight * r);
        var g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
        g.drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
        c.toBlob(function (b) {
          if (!b || b.size >= fichier.size) return ok({ blob: fichier, nom: fichier.name, mime: f.mime });
          ok({ blob: b, nom: fichier.name.replace(/\.[^.]*$/, '') + '.jpg', mime: 'image/jpeg' });
        }, 'image/jpeg', 0.85);
      };
      img.onerror = function () { URL.revokeObjectURL(url); ok({ blob: fichier, nom: fichier.name, mime: f.mime }); };
      img.src = url;
    });
  }

  /* Envoie un fichier dans le dossier du pad ouvert. Rend
     { chemin, nom, taille, mime }. Les refus (vidéo, format, poids,
     espace plein) se décident ici, avant tout envoi. */
  function deposer(fichier, progres) {
    if (P.VIDEOS.test(fichier.name)) return Promise.reject(new Error('VIDEO'));
    var f = P.formatDe(fichier.name);
    if (!f) return Promise.reject(new Error('FORMAT'));
    var prep = /^image\/(jpeg|png|webp)$/.test(f.mime) ? reduireImage(fichier, f)
      : Promise.resolve({ blob: fichier, nom: fichier.name, mime: f.mime });
    return prep.then(function (x) {
      if (x.blob.size > P.FICHIER_MAX) throw new Error('TROP_LOURD');
      if (etat.occ && etat.occ.total + x.blob.size > P.PLAFOND) throw new Error('PLEIN');
      var padId = etat.pad.id;
      var chemin = Api.monUid() + '/' + padId + '/' + P.aleatoire(8) + '-' + P.nomPropre(x.nom);
      etat.enAttente[chemin] = true;
      return Api.envoyerFichier(chemin, x.blob, x.mime, progres).then(function () {
        if (etat.occ) { etat.occ.total += x.blob.size; etat.occ.pads[padId] = (etat.occ.pads[padId] || 0) + x.blob.size; majJauge(); }
        return { chemin: chemin, nom: x.nom, taille: x.blob.size, mime: x.mime };
      }, function (e) { delete etat.enAttente[chemin]; throw e; });
    });
  }

  /* Efface du dossier du pad ce qu'aucune carte n'utilise plus : une
     carte supprimée, un fichier remplacé, une fenêtre fermée en cours
     d'envoi. Ne touche ni aux envois en attente, ni aux autres pads. */
  function menage() {
    var pad = etat.pad; if (!pad) return;
    etat.aMenager = false;
    var refs = {}; cheminsDe(pad.b).forEach(function (k) { refs[k.chemin] = true; });
    var base = Api.monUid() + '/' + pad.id + '/';
    Api.fichiersDuPad(pad.id).then(function (l) {
      var morts = l.map(function (f) { return base + f.name; })
        .filter(function (c) { return P.cheminSur(c) && !refs[c] && !etat.enAttente[c]; });
      if (morts.length) return Api.effacerFichiers(morts).then(chargerJauge);
    }).catch(function () { etat.aMenager = true; });
  }

  /* Un pad créé à partir d'un autre (dupliquer, copier une collègue,
     importer) : ses fichiers sont recopiés dans SON dossier, côté
     serveur. Sans cela, effacer le pad d'origine casserait la copie. */
  function rattacher(ligne, br) {
    var base = Api.monUid() + '/' + ligne.id + '/', rates = 0;
    var cartes = cheminsDe(br).filter(function (k) { return k.chemin.indexOf(base) !== 0; });
    if (!cartes.length) return Promise.resolve();
    return cartes.reduce(function (p, k) {
      return p.then(function () {
        var vers = base + k.chemin.split('/')[2];
        return Api.copierFichier(k.chemin, vers).then(function () { k.chemin = vers; }, function () { rates++; });
      });
    }, Promise.resolve()).then(function () {
      return P.publier(br).then(function (pub) { return Api.enregistrerPad(ligne.id, { brouillon: br, publie: pub }); });
    }).then(function () {
      if (rates) toast(rates + ' fichier(s) n\'ont pas pu être recopiés : ils restent liés au pad d\'origine.');
    });
  }

  /* ============================================================
   *  DÉMARRAGE ET ADRESSES
   * ============================================================ */
  function demarrer() {
    var h = location.hash;
    if (/access_token=/.test(h)) {
      var type = Api.adopterRetourMail(h);
      history.replaceState(null, '', location.pathname);
      if (type === 'recovery') return vueNouveauMdp();
    }
    if (!Api.connecte()) return vueConnexion('connecter');
    $('#moi').textContent = Api.email();
    $('#btn-deconnexion').hidden = false;
    Api.suisAuteur().then(function (oui) {
      if (!oui) return vueInvitation();
      route();
    }).catch(function (e) {
      if (/SESSION_EXPIREE/.test(e.message)) return vueConnexion('connecter');
      app.innerHTML = '<div class="page"><p class="erreur">' + esc(P.messageErreur(e)) + '</p><button class="btn" onclick="location.reload()">Réessayer</button></div>';
    });
  }
  function route() {
    var m;
    if ((m = /^#pad=([\w-]+)/.exec(location.hash))) return vueEditeur(m[1]);
    if ((m = /^#copier=(.+)$/.exec(location.hash))) return copierDepuisLien(decodeURIComponent(m[1]));
    vueListe();
  }
  window.addEventListener('hashchange', function () {
    if (etat.modifie) sauver();
    if (Api.connecte()) route();
  });
  window.addEventListener('beforeunload', function (ev) {
    if (etat.modifie) { sauver(); ev.preventDefault(); ev.returnValue = ''; }
  });
  $('#btn-deconnexion').addEventListener('click', function () {
    Api.deconnecter(); location.hash = ''; location.reload();
  });

  /* ============================================================
   *  CONNEXION, CRÉATION DE COMPTE, INVITATION
   * ============================================================ */
  function vueConnexion(onglet) {
    $('#btn-deconnexion').hidden = true; $('#moi').textContent = '';
    var creer = onglet === 'creer';
    app.innerHTML = '<div class="carte-form">'
      + '<h1><span aria-hidden="true">🗝</span> ' + esc(P.NOM) + '</h1>'
      + '<p class="muet">Des pads en colonnes, comme Digipad, mais chaque colonne se termine par un cadenas&nbsp;: les élèves avancent à leur rythme, ouvrent des coffres et collectionnent des médailles.</p>'
      + '<div class="onglets" role="tablist">'
      +   '<button class="onglet' + (creer ? '' : ' actif') + '" data-o="connecter" type="button">Me connecter</button>'
      +   '<button class="onglet' + (creer ? ' actif' : '') + '" data-o="creer" type="button">Créer mon compte</button>'
      + '</div>'
      + '<p class="erreur" id="err" role="alert" hidden></p>'
      + '<form id="f" novalidate>'
      +   '<label class="champ"><span>Adresse mail</span><input type="email" id="email" autocomplete="email" required></label>'
      +   '<label class="champ"><span>Mot de passe' + (creer ? ' <small>8 caractères au moins</small>' : '') + '</span>' + champMdp('mdp', creer ? 'new-password' : 'current-password') + '</label>'
      +   (creer ? '<label class="champ"><span>Code d\'invitation <small>Il est dans le mail que tu as reçu. Il sert une seule fois.</small></span><input type="text" id="code" autocomplete="off" autocapitalize="characters" placeholder="PADA-XXXX-XXXX-XXXX" required></label>' : '')
      +   '<button class="btn primaire" type="submit" style="width:100%;margin-top:.6rem">' + (creer ? 'Créer mon compte' : 'Me connecter') + '</button>'
      + '</form>'
      + (creer ? '<p class="muet" style="font-size:.85rem;margin-top:1rem">🔒 Ton mot de passe est chiffré&nbsp;: personne ne peut le lire. Ce compte sert à enregistrer tes pads&nbsp;; les élèves, eux, n\'ont pas de compte.</p>'
               : '<p style="margin-top:1rem"><button class="lien-btn" type="button" id="perdu">J\'ai perdu mon mot de passe</button></p>')
      + '<p class="muet" style="font-size:.85rem">Tu as déjà un compte sur le tableau de bord du site&nbsp;? Ce sont les mêmes identifiants.</p>'
      + '</div>';
    brancherVoir(app);
    $$('[data-o]').forEach(function (b) { b.addEventListener('click', function () { vueConnexion(b.getAttribute('data-o')); }); });
    var err = $('#err');
    $('#f').addEventListener('submit', function (ev) {
      ev.preventDefault(); err.hidden = true;
      var email = $('#email').value, mdp = $('#mdp').value;
      if (!/.+@.+\..+/.test(email)) return erreur(err, 'Adresse mail à vérifier.');
      if (mdp.length < 8) return erreur(err, 'Mot de passe trop court : 8 caractères au moins.');
      var bouton = $('button[type=submit]', app); bouton.disabled = true;
      var suite;
      if (creer) {
        var code = $('#code').value;
        if (!code.trim()) { bouton.disabled = false; return erreur(err, 'Le code d\'invitation est nécessaire pour créer un compte.'); }
        try { sessionStorage.setItem('padago.code', code); } catch (e) { /* rien */ }
        suite = Api.creerCompte(email, mdp).then(function (connecteTout) {
          if (!connecteTout) {
            app.innerHTML = '<div class="carte-form"><h1>Presque fini</h1><p class="info">Un mail de confirmation vient de partir vers <b>' + esc(email)
              + '</b>. Clique sur son lien, puis reviens ici et connecte-toi&nbsp;: ton code d\'invitation te sera redemandé une dernière fois.</p></div>';
            return;
          }
          /* Le compte existe désormais, même si le code est faux : on
             passe à l'écran « code d'invitation », sans recréer le compte. */
          return Api.accepterInvitation(code).then(function () { location.reload(); }, function (e) {
            $('#moi').textContent = Api.email(); $('#btn-deconnexion').hidden = false;
            vueInvitation(); erreur($('#err'), e);
          });
        });
      } else {
        suite = Api.seConnecter(email, mdp).then(function () { location.reload(); });
      }
      suite.catch(function (e) { bouton.disabled = false; erreur(err, e); });
    });
    var perdu = $('#perdu');
    if (perdu) perdu.addEventListener('click', function () {
      var email = $('#email').value;
      if (!/.+@.+\..+/.test(email)) return erreur(err, 'Écris d\'abord ton adresse mail ci-dessus, puis reclique.');
      Api.motDePassePerdu(email, BASE + 'index.html').then(function () {
        err.hidden = true;
        toast('Un mail de réinitialisation est parti (s\'il y a bien un compte à cette adresse).');
      }).catch(function (e) { erreur(err, e); });
    });
  }

  function vueNouveauMdp() {
    app.innerHTML = '<div class="carte-form"><h1>Nouveau mot de passe</h1><p class="erreur" id="err" hidden></p>'
      + '<form id="f"><label class="champ"><span>Nouveau mot de passe <small>8 caractères au moins</small></span>' + champMdp('mdp', 'new-password') + '</label>'
      + '<button class="btn primaire" type="submit" style="width:100%">Enregistrer</button></form></div>';
    brancherVoir(app);
    $('#f').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var mdp = $('#mdp').value;
      if (mdp.length < 8) return erreur($('#err'), 'Mot de passe trop court : 8 caractères au moins.');
      Api.changerMotDePasse(mdp).then(function () { toast('Mot de passe changé.'); setTimeout(function () { location.reload(); }, 800); })
        .catch(function (e) { erreur($('#err'), e); });
    });
  }

  function vueInvitation() {
    var code = ''; try { code = sessionStorage.getItem('padago.code') || ''; } catch (e) { /* rien */ }
    app.innerHTML = '<div class="carte-form"><h1>Ton code d\'invitation</h1>'
      + '<p>Ce compte est bien connecté, mais il n\'a pas encore le droit de créer des pads. Entre le code reçu par mail&nbsp;: c\'est à faire une seule fois.</p>'
      + '<p class="erreur" id="err" hidden></p>'
      + '<form id="f"><label class="champ"><span>Code d\'invitation</span><input type="text" id="code" autocomplete="off" autocapitalize="characters" placeholder="PADA-XXXX-XXXX-XXXX" value="' + esc(code) + '"></label>'
      + '<button class="btn primaire" type="submit" style="width:100%">Valider</button></form></div>';
    $('#f').addEventListener('submit', function (ev) {
      ev.preventDefault();
      Api.accepterInvitation($('#code').value).then(function () {
        try { sessionStorage.removeItem('padago.code'); } catch (e) { /* rien */ }
        toast('Bienvenue dans ' + P.NOM + ' !'); route();
      }).catch(function (e) { erreur($('#err'), e); });
    });
  }

  /* ============================================================
   *  MES PADS
   * ============================================================ */

  /* « ✨ Nouveau » : Padago a ses propres autrices (compte par
     invitation), qui ne voient pas la fenêtre Nouveautés du tableau
     de bord. Un bandeau, jusqu'à « J'ai compris » (sur cet appareil).
     Nouvelle annonce : changer NOUVEAUTE et le texte. */
  var NOUVEAUTE = '2026-11-13-fichiers';
  function nouveaute() {
    try { if (localStorage.getItem('padago.nouveaute') === NOUVEAUTE) return ''; } catch (e) { /* on montre */ }
    return '<div class="info nv-padago" id="nv-padago"><p style="margin:0 0 .3rem"><b>✨ Nouveau&nbsp;: dépose tes fichiers</b></p>'
      + '<p style="margin:0 0 .3rem">Fais glisser un <b>PDF, Word, Excel, PowerPoint</b> ou une <b>photo</b> depuis ton ordinateur jusque sur une colonne&nbsp;: la carte se crée toute seule. Les élèves l\'ouvrent ou le téléchargent.</p>'
      + '<p style="margin:0 0 .5rem"><small>10 Mo par fichier, 300 Mo en tout · les vidéos restent des liens (OneDrive, YouTube…) · pas de noms d\'élèves ni de notes.</small></p>'
      + '<button class="btn petit" type="button" id="nv-fermer">J\'ai compris</button></div>';
  }
  function vueListe() {
    etat.pad = null;
    app.innerHTML = '<div class="page"><div class="entete-liste"><h1>Mes pads</h1>'
      + '<button class="btn primaire" id="nouveau" type="button">＋ Nouveau pad</button>'
      + '<button class="btn" id="tuto" type="button">🎓 Partir du pad tuto</button>'
      + '<button class="btn" id="copier" type="button">👥 Copier le pad d\'une collègue</button>'
      + '<label class="btn" style="cursor:pointer">⬆ Importer un fichier<input type="file" id="importer" accept=".json,application/json" hidden></label>'
      + '</div>' + nouveaute() + '<p class="jauge-liste" id="jauge-liste" hidden></p><div id="liste"><p class="muet">Chargement…</p></div></div>';
    chargerJauge();
    var nv = $('#nv-fermer');
    if (nv) nv.addEventListener('click', function () {
      try { localStorage.setItem('padago.nouveaute', NOUVEAUTE); } catch (e) { /* rien */ }
      $('#nv-padago').remove();
    });
    $('#nouveau').addEventListener('click', function () { creer(P.padVierge()); });
    $('#tuto').addEventListener('click', partirDuTuto);
    $('#copier').addEventListener('click', demanderLienCollegue);
    $('#importer').addEventListener('change', importer);
    Api.mesPads().then(function (pads) {
      var z = $('#liste');
      if (!pads || !pads.length) {
        z.innerHTML = '<div class="vide-liste"><p style="font-size:2rem;margin:0">🗝</p><p><b>Aucun pad pour l\'instant.</b></p>'
          + '<p>Le plus simple pour commencer&nbsp;: <b>« Partir du pad tuto »</b>. Il montre chaque type de cadenas, un coffre et des médailles, et tu peux le modifier à ta guise.</p></div>';
        return;
      }
      z.innerHTML = '<div class="grille-pads">' + pads.map(function (p) {
        return '<article class="tuile"><div class="couv">🗝</div><div class="corps"><h2>' + esc(p.titre) + '</h2>'
          + '<div class="date">Modifié le ' + new Date(p.maj_le).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) + '</div></div>'
          + '<div class="actions"><a class="btn primaire petit" href="#pad=' + esc(p.id) + '">Ouvrir</a>'
          + '<a class="btn petit" href="pad.html?p=' + esc(p.slug) + '" target="_blank" rel="noopener">Vue élève</a>'
          + '<button class="btn petit" type="button" data-dup="' + esc(p.id) + '">Dupliquer</button>'
          + '<button class="btn petit danger" type="button" data-sup="' + esc(p.id) + '" data-titre="' + esc(p.titre) + '">Supprimer</button></div></article>';
      }).join('') + '</div>';
      $$('[data-dup]').forEach(function (b) {
        b.addEventListener('click', function () {
          Api.lirePad(b.getAttribute('data-dup')).then(function (l) {
            var c = JSON.parse(JSON.stringify(l.brouillon)); c.id = P.nouvelId('pad'); c.titre = (c.titre || '') + ' (copie)';
            return creer(c, true);
          }).catch(function (e) { toast(P.messageErreur(e)); });
        });
      });
      $$('[data-sup]').forEach(function (b) {
        b.addEventListener('click', function () {
          if (!confirm('Supprimer définitivement « ' + b.getAttribute('data-titre') + ' » et ses fichiers ?\nLe lien donné aux élèves ne marchera plus.')) return;
          var id = b.getAttribute('data-sup'), base = Api.monUid() + '/' + id + '/';
          // ses fichiers d'abord : un fichier sans pad occuperait l'espace pour rien
          Api.fichiersDuPad(id).then(function (l) {
            return Api.effacerFichiers(l.map(function (f) { return base + f.name; }).filter(P.cheminSur));
          }).catch(function () { /* l'outil occupation.sql repère les orphelins */ })
            .then(function () { return Api.supprimerPad(id); })
            .then(vueListe).catch(function (e) { toast(P.messageErreur(e)); });
        });
      });
    }).catch(function (e) { $('#liste').innerHTML = '<p class="erreur">' + esc(P.messageErreur(e)) + '</p>'; });
  }

  function creer(brouillon, resterSurListe) {
    brouillon.sel = brouillon.sel || P.aleatoire(16);
    var slug = P.aleatoire(10);
    return P.publier(brouillon).then(function (publie) {
      return Api.creerPad({ slug: slug, titre: (brouillon.titre || 'Pad sans titre').slice(0, 200), brouillon: brouillon, publie: publie });
    }).then(function (ligne) {
      return rattacher(ligne, brouillon).catch(function () {
        toast('Pad créé, mais ses fichiers n\'ont pas pu être recopiés.');
      }).then(function () {
        if (resterSurListe) { toast('Copie créée.'); vueListe(); }
        else location.hash = '#pad=' + ligne.id;
      });
    }).catch(function (e) { toast(P.messageErreur(e)); });
  }

  function partirDuTuto() {
    fetch('pads/tuto.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (t) {
      t.id = P.nouvelId('pad'); t.sel = P.aleatoire(16); creer(t);
    }).catch(function () { toast('Le pad tuto est introuvable.'); });
  }

  function importer(ev) {
    var f = ev.target.files[0]; if (!f) return;
    var lec = new FileReader();
    lec.onload = function () {
      try {
        var b = JSON.parse(lec.result);
        if (b && b.brouillon) b = b.brouillon;
        if (!b || !Array.isArray(b.colonnes)) throw new Error('format');
        b.id = P.nouvelId('pad'); creer(b);
      } catch (e) { toast('Ce fichier n\'est pas un pad ' + P.NOM + '.'); }
    };
    lec.readAsText(f);
  }

  function extraireSlug(s) {
    var m = /(?:[?&#](?:p|copier)=)([a-hjkmnp-z2-9]{10})/i.exec(s) || /^\s*([a-hjkmnp-z2-9]{10})\s*$/i.exec(s);
    return m ? m[1].toLowerCase() : null;
  }
  function demanderLienCollegue() {
    dialogue('Copier le pad d\'une collègue',
      '<p>Colle le <b>lien de copie</b> que ta collègue t\'a envoyé (bouton « Partager » de son pad). Le lien élève marche aussi.</p>'
      + '<label class="champ"><span>Lien</span><input type="url" id="lien-col" placeholder="https://…"></label><p class="erreur" id="err-col" hidden></p>',
      [{ txt: 'Annuler' }, { txt: 'Copier dans mes pads', classe: 'primaire', action: function (d) {
        var slug = extraireSlug($('#lien-col', d).value);
        if (!slug) { erreur($('#err-col', d), 'Ce lien ne ressemble pas à un lien de pad.'); return false; }
        copierDepuisLien(slug); return true;
      } }]);
  }
  function copierDepuisLien(s) {
    var slug = extraireSlug(s) || extraireSlug('?p=' + s);
    history.replaceState(null, '', location.pathname);
    if (!slug) { toast('Lien de copie illisible.'); return vueListe(); }
    Api.copierPad(slug).then(function (b) {
      if (!b) { toast('Pad introuvable, ou sa propriétaire ne l\'a pas ouvert à la copie.'); return vueListe(); }
      b.id = P.nouvelId('pad'); b.titre = (b.titre || 'Pad') + ' (copie)';
      creer(b);
    }).catch(function (e) { toast(P.messageErreur(e)); vueListe(); });
  }

  /* ============================================================
   *  L'ÉDITEUR
   * ============================================================ */
  function vueEditeur(id) {
    if (etat.pad && etat.pad.id === id) return dessiner();
    app.innerHTML = '<p class="page muet">Ouverture du pad…</p>';
    Api.lirePad(id).then(function (l) {
      if (!l) { toast('Pad introuvable.'); location.hash = ''; return; }
      var b = l.brouillon || {};
      b.colonnes = b.colonnes || []; b.medailles = b.medailles || []; b.options = b.options || {};
      b.sel = b.sel || P.aleatoire(16);
      etat.pad = { id: l.id, slug: l.slug, copiable: l.copiable, b: b };
      etat.modifie = false;
      dessiner();
      // la jauge, puis le ménage des fichiers que plus aucune carte n'utilise
      chargerJauge().then(menage);
    }).catch(function (e) { app.innerHTML = '<p class="page erreur">' + esc(P.messageErreur(e)) + '</p>'; });
  }

  /* --- sauvegarde --- */
  function modifie() {
    etat.modifie = true; afficherEtat('Modifications en cours…');
    clearTimeout(etat.minuteur); etat.minuteur = setTimeout(sauver, 1500);
  }
  function afficherEtat(t, ko) { var e = $('#etat-sauv'); if (e) { e.textContent = t; e.classList.toggle('ko', !!ko); } }
  function sauver() {
    clearTimeout(etat.minuteur);
    var pad = etat.pad; if (!pad || !etat.modifie) return Promise.resolve();
    if (etat.enCours) { etat.minuteur = setTimeout(sauver, 800); return Promise.resolve(); }
    etat.enCours = true; etat.modifie = false; afficherEtat('Enregistrement…');
    return P.publier(pad.b).then(function (publie) {
      return Api.enregistrerPad(pad.id, { titre: (pad.b.titre || 'Pad sans titre').slice(0, 200), brouillon: pad.b, publie: publie, copiable: pad.copiable });
    }).then(function () {
      etat.enCours = false;
      afficherEtat(etat.modifie ? 'Modifications en cours…' : 'Enregistré ✓');
      if (etat.aMenager && !etat.modifie) menage();
    }).catch(function (e) {
      etat.enCours = false; etat.modifie = true;
      afficherEtat('⚠ Pas enregistré — ' + P.messageErreur(e), true);
      etat.minuteur = setTimeout(sauver, 8000);
    });
  }

  /* --- recherche dans le pad --- */
  function b() { return etat.pad.b; }
  function colonne(cid) { return b().colonnes.filter(function (c) { return c.id === cid; })[0]; }
  function trouverCarte(kid) {
    var r = null;
    b().colonnes.forEach(function (c, ic) { c.cartes.forEach(function (k, ik) { if (k.id === kid) r = { col: c, ic: ic, carte: k, ik: ik }; }); });
    return r;
  }
  function coffres() {
    var l = []; b().colonnes.forEach(function (c) { if (c.coffre) l.push({ id: c.coffre.id, titre: c.coffre.titre || 'Coffre', col: c }); }); return l;
  }
  function medaille(mid) { return b().medailles.filter(function (m) { return m.id === mid; })[0]; }
  function pastilleMedaille(m, petite) {
    if (!m) return '';
    return '<span class="medaille' + (petite ? ' petite' : '') + '" style="--t:' + esc(P.teinte(m.couleur)) + '" title="' + esc(m.nom) + '">' + esc(m.icone || '🏅') + '</span>';
  }

  var CADENAS = {
    libre:      { ico: '🔓', nom: 'Libre',            expl: 'La colonne suivante est ouverte d\'office.' },
    code:       { ico: '🔢', nom: 'Code',             expl: 'L\'élève tape un mot ou un nombre trouvé dans le document (ou donné par toi).' },
    depot:      { ico: '📥', nom: 'Dépôt',            expl: 'L\'élève dépose une production (texte court ou photo de son ardoise). Déposer suffit à ouvrir.' },
    validation: { ico: '🙋', nom: 'Validation prof',  expl: 'L\'élève dépose, puis lève son tétraèdre : tu viens, tu regardes, tu tapes ton code maître sur sa tablette.' }
  };

  function avertissements(c, i) {
    var a = [], cad = c.cadenas || { type: 'libre' };
    if (cad.type === 'code' && !String(cad.code || '').trim()) a.push('Cadenas à code : code à renseigner.');
    if (cad.type === 'validation' && !String(b().codeMaitre || '').trim()) a.push('Validation prof : choisis ton code maître (⚙ Réglages).');
    if (c.coffre) {
      var cf = c.coffre;
      if (!String(cf.code || '').trim()) a.push('Coffre : code à renseigner.');
      if (!cf.medaille || !medaille(cf.medaille)) a.push('Coffre : aucune médaille choisie.');
      var frag = 0; b().colonnes.forEach(function (cc) { cc.cartes.forEach(function (k) { if (k.type === 'chiffre' && k.coffre === cf.id) frag++; }); });
      var lg = String(cf.code || '').replace(/\s/g, '').length;
      if (frag && lg && frag !== lg) a.push('Coffre : ' + frag + ' fragment(s) caché(s) pour un code de ' + lg + ' caractères.');
    }
    if (c.secrete && !b().options.salleSecrete) a.push('Salle secrète : active l\'option dans ⚙ Réglages, sinon cette colonne est invisible.');
    return a;
  }

  function dessiner() {
    var pad = etat.pad, B = pad.b;
    var ctx = { coffres: {}, indices: !!B.options.indices, indicesVus: {} };
    coffres().forEach(function (c) { ctx.coffres[c.id] = c.titre; });
    $('#moi').textContent = Api.email();
    app.innerHTML = '<div class="barre-ed">'
      + '<a class="btn discret petit" href="#">← Mes pads</a>'
      + '<input class="titre-pad" id="titre-pad" aria-label="Titre du pad" value="' + esc(B.titre) + '">'
      + '<span class="etat-sauv" id="etat-sauv" aria-live="polite">' + (etat.modifie ? 'Modifications en cours…' : 'Enregistré ✓') + '</span>'
      + '<button class="btn petit" type="button" id="b-reglages">⚙ Réglages</button>'
      + '<button class="btn petit" type="button" id="b-medailles">🏅 Médailles</button>'
      + '<button class="btn petit" type="button" id="b-tester">👁 Tester comme un élève</button>'
      + '<button class="btn petit bleu" type="button" id="b-partager">🔗 Partager</button>'
      + '<span class="jauge" id="jauge" hidden></span>'
      + '</div><div class="tableau" id="tableau">'
      + B.colonnes.map(function (c, i) { return dessinerColonne(c, i, ctx); }).join('')
      + '<button class="ajout-col" type="button" id="ajout-col">＋ Colonne</button></div>';

    $('#titre-pad').addEventListener('input', function (e) { B.titre = e.target.value; modifie(); });
    $('#b-reglages').addEventListener('click', dlgReglages);
    $('#b-medailles').addEventListener('click', dlgMedailles);
    $('#b-tester').addEventListener('click', tester);
    $('#b-partager').addEventListener('click', dlgPartager);
    $('#ajout-col').addEventListener('click', function () {
      B.colonnes.push({ id: P.nouvelId('c'), titre: 'Document ' + (B.colonnes.length + 1), secrete: false, cartes: [], cadenas: { type: 'libre' }, coffre: null });
      modifie(); dessiner();
      var t = $('#tableau'); t.scrollLeft = t.scrollWidth;
    });
    brancherColonnes();
  }

  function dessinerColonne(c, i, ctx) {
    var cad = c.cadenas || { type: 'libre' }, info = CADENAS[cad.type] || CADENAS.libre;
    var detail = cad.type === 'code' ? (cad.code ? 'Code : « ' + esc(cad.code) + ' »' : 'Code à renseigner')
      : (cad.type === 'depot' || cad.type === 'validation') ? esc(cad.consigne || 'Consigne du dépôt à écrire') : info.expl;
    var cf = c.coffre, m = cf && medaille(cf.medaille);
    var av = avertissements(c, i);
    return '<section class="colonne' + (c.secrete ? ' secrete' : '') + '" data-col="' + esc(c.id) + '">'
      + '<div class="col-tete"><span class="poignee" draggable="true" title="Glisser pour déplacer la colonne" aria-hidden="true">⠿</span>'
      + '<input value="' + esc(c.titre) + '" data-titre-col aria-label="Titre de la colonne">'
      + '<button class="btn discret btn-ico petit" type="button" data-menu-col aria-label="Options de la colonne">⋯</button></div>'
      + '<div class="col-num">' + (c.secrete ? '✨ Salle secrète' : 'Étape ' + (i + 1)) + '</div>'
      + '<div class="col-cartes" data-cartes>'
      + c.cartes.map(function (k) {
          return '<article class="kcarte ed" draggable="true" data-k="' + esc(k.id) + '" tabindex="0" aria-label="Modifier la carte">'
            + '<span class="k-type">' + TYPES[k.type].ico + '</span>' + P.rendreCarte(k, ctx)
            + (k.indice && k.indice.texte && !b().options.indices ? '<p class="avert">💡 Indice (option désactivée)</p>' : '')
            + '</article>';
        }).join('')
      + '</div><button class="btn discret col-ajout" type="button" data-ajout-carte>＋ Carte</button>'
      + '<div class="col-pied">'
      + '<button class="cadenas-btn" type="button" data-cadenas><span class="ico">' + info.ico + '</span><span><b>Cadenas&nbsp;: ' + info.nom + '</b><small>' + detail + '</small></span></button>'
      + (cf ? '<button class="coffre-btn" type="button" data-coffre><span class="ico">🧰</span><span><b>' + esc(cf.titre || 'Coffre') + (cf.final ? ' · final' : '') + '</b><small>Code : ' + esc(cf.code || '—') + '</small></span>' + pastilleMedaille(m, true) + '</button>'
            : '<button class="coffre-btn vide" type="button" data-coffre><span class="ico">🧰</span><span>＋ Ajouter un coffre</span></button>')
      + av.map(function (t) { return '<p class="avert">⚠ ' + esc(t) + '</p>'; }).join('')
      + '</div></section>';
  }

  function brancherColonnes() {
    $$('.colonne').forEach(function (el) {
      var c = colonne(el.getAttribute('data-col'));
      $('[data-titre-col]', el).addEventListener('input', function (e) { c.titre = e.target.value; modifie(); });
      $('[data-ajout-carte]', el).addEventListener('click', function () { dlgCarte(c, null); });
      $('[data-cadenas]', el).addEventListener('click', function () { dlgCadenas(c); });
      $('[data-coffre]', el).addEventListener('click', function () { dlgCoffre(c); });
      $('[data-menu-col]', el).addEventListener('click', function () { dlgColonne(c); });
      $$('.kcarte', el).forEach(function (k) {
        function ouvrir(ev) { if (ev.target.closest('a,button,video,audio')) return; dlgCarte(c, trouverCarte(k.getAttribute('data-k')).carte); }
        k.addEventListener('click', ouvrir);
        k.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') ouvrir(ev); });
      });
    });
    brancherGlisser();
  }

  /* --- glisser-déposer : cartes entre colonnes, colonnes entre elles --- */
  function brancherGlisser() {
    var tableau = $('#tableau'), glisse = null;
    $$('.kcarte').forEach(function (k) {
      k.addEventListener('dragstart', function (ev) {
        glisse = { carte: k.getAttribute('data-k') }; k.classList.add('glisse');
        ev.dataTransfer.effectAllowed = 'move'; ev.dataTransfer.setData('text/plain', 'carte');
      });
      k.addEventListener('dragend', function () { k.classList.remove('glisse'); glisse = null; });
    });
    $$('.poignee').forEach(function (p) {
      p.addEventListener('dragend', function () { glisse = null; });
      p.addEventListener('dragstart', function (ev) {
        var col = p.closest('.colonne');
        glisse = { col: col.getAttribute('data-col') };
        ev.dataTransfer.effectAllowed = 'move'; ev.dataTransfer.setData('text/plain', 'colonne');
        if (ev.dataTransfer.setDragImage) ev.dataTransfer.setDragImage(col, 20, 20);
      });
    });
    $$('.colonne').forEach(function (col) {
      col.addEventListener('dragover', function (ev) {
        // une carte, une colonne… ou des fichiers venus de l'ordinateur
        var fichiers = !glisse && ev.dataTransfer && Array.prototype.indexOf.call(ev.dataTransfer.types || [], 'Files') >= 0;
        if (glisse || fichiers) { ev.preventDefault(); col.classList.add('glisse-sur'); }
      });
      col.addEventListener('dragleave', function () { col.classList.remove('glisse-sur'); });
      col.addEventListener('drop', function (ev) {
        ev.preventDefault(); col.classList.remove('glisse-sur');
        var cible = colonne(col.getAttribute('data-col'));
        if (!glisse) {
          if (ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files.length) deposerDansColonne(cible, ev.dataTransfer.files);
          return;
        }
        if (glisse.carte) {
          var src = trouverCarte(glisse.carte); if (!src) return;
          var index = cible.cartes.length;
          $$('.kcarte', col).some(function (k, j) {
            var r = k.getBoundingClientRect();
            if (ev.clientY < r.top + r.height / 2) { index = j; return true; } return false;
          });
          src.col.cartes.splice(src.ik, 1);
          if (src.col === cible && src.ik < index) index--;
          cible.cartes.splice(index, 0, src.carte);
        } else if (glisse.col && glisse.col !== cible.id) {
          var L = b().colonnes, de = L.indexOf(colonne(glisse.col)), vers = L.indexOf(cible);
          var x = L.splice(de, 1)[0]; L.splice(vers, 0, x);
        }
        glisse = null; modifie(); var sl = tableau.scrollLeft; dessiner(); $('#tableau').scrollLeft = sl;
      });
    });
  }

  /* Fichiers lâchés sur une colonne : une carte chacun, dans l'ordre.
     Une image devient une carte « image », le reste une carte « fichier ». */
  function deposerDansColonne(c, liste) {
    var fichiers = Array.prototype.slice.call(liste), faits = 0;
    fichiers.reduce(function (p, f) {
      return p.then(function () {
        toast('Envoi de « ' + f.name + ' »…');
        return deposer(f).then(function (r) {
          var image = /^image\//.test(r.mime);
          c.cartes.push({ id: P.nouvelId('k'), type: image ? 'image' : 'fichier', chemin: r.chemin, nom: r.nom, taille: r.taille, mime: r.mime });
          delete etat.enAttente[r.chemin]; faits++;
          modifie(); var sl = $('#tableau').scrollLeft; dessiner(); $('#tableau').scrollLeft = sl;
        }, function (e) { toast('« ' + f.name + ' » : ' + P.messageErreur(e)); });
      });
    }, Promise.resolve()).then(function () { if (faits) toast(faits + ' fichier(s) ajouté(s).'); });
  }

  /* --- les cartes --- */
  var TYPES = {
    texte:   { ico: '📝', nom: 'Texte',          expl: 'Consigne, document, question' },
    fichier: { ico: '📎', nom: 'Fichier',        expl: 'PDF, Word, Excel… depuis ton ordinateur' },
    image:   { ico: '🖼', nom: 'Image',          expl: 'Depuis ton ordinateur, ou un lien' },
    lien:    { ico: '🔗', nom: 'Lien',           expl: 'Document Drive/ENT, PDF, site' },
    video:   { ico: '🎬', nom: 'Vidéo',          expl: 'Un lien OneDrive, YouTube…' },
    chiffre: { ico: '🗝', nom: 'Chiffre caché',  expl: 'Un morceau du code d\'un coffre' }
  };
  var EMOJIS = ['🏅', '🥇', '⭐', '🌟', '🏆', '👑', '💎', '🔍', '🧪', '⚗️', '🔬', '🧲', '⚡', '🔥', '🌍', '🪐', '🚀', '🧠', '📚', '✏️', '🎯', '🧩', '🦉', '🐉', '🗝', '🛡', '⚖️', '🌱'];

  function dlgCarte(c, k) {
    var neuve = !k;
    var brouillon = k ? JSON.parse(JSON.stringify(k)) : { id: P.nouvelId('k'), type: 'texte', contenu: '' };
    var lesCoffres = coffres();

    function champs() {
      var t = brouillon.type, h = '';
      if (t !== 'chiffre') h += '<label class="champ"><span>Titre <small>facultatif</small></span><input type="text" data-f="titre" value="' + esc(brouillon.titre || '') + '"></label>';
      if (t === 'texte') {
        h += '<div class="champ"><span style="font-weight:600">Texte</span>'
          + '<div class="outils-txt"><button type="button" class="btn petit" data-md="**">G</button><button type="button" class="btn petit" data-md="*"><i>I</i></button>'
          + '<button type="button" class="btn petit" data-md="- ">• Liste</button><button type="button" class="btn petit" data-md="lien">🔗 Lien</button></div>'
          + '<textarea data-f="contenu" rows="7">' + esc(brouillon.contenu || '') + '</textarea>'
          + '<small class="muet">**gras** · *italique* · une ligne qui commence par « - » fait une liste · [texte](https://…) fait un lien</small></div>';
      } else if (t === 'fichier') {
        h += zoneFichier('fichier')
          + '<label class="champ"><span>Une phrase pour dire ce que c\'est <small>facultatif</small></span><input type="text" data-f="contenu" value="' + esc(brouillon.contenu || '') + '"></label>';
      } else if (t === 'image') {
        h += zoneFichier('image')
          + (brouillon.chemin ? '' : '<label class="champ"><span>…ou le lien d\'une image en ligne ' + aide('Clic droit sur une image en ligne → « Copier l\'adresse de l\'image ».') + '</span><input type="url" data-f="src" value="' + esc(brouillon.src || '') + '" placeholder="https://…"></label>')
          + '<label class="champ"><span>Légende <small>facultatif</small></span><input type="text" data-f="legende" value="' + esc(brouillon.legende || '') + '"></label>'
          + '<label class="champ"><span>Description pour un lecteur d\'écran <small>facultatif</small></span><input type="text" data-f="alt" value="' + esc(brouillon.alt || '') + '"></label>';
      } else if (t === 'lien') {
        h += '<label class="champ"><span>Adresse</span><input type="url" data-f="url" value="' + esc(brouillon.url || '') + '" placeholder="https://…"></label>'
          + '<label class="champ"><span>Une phrase pour dire ce que c\'est <small>facultatif</small></span><input type="text" data-f="contenu" value="' + esc(brouillon.contenu || '') + '"></label>';
      } else if (t === 'video') {
        h += '<p class="info">🎬 Les vidéos ne se déposent pas dans ' + esc(P.NOM) + '&nbsp;: elles sont trop lourdes pour notre hébergement gratuit. Colle ici le <b>lien de partage</b> de ta vidéo&nbsp;: OneDrive, YouTube, ou la plateforme où elle se trouve.</p>'
          + '<label class="champ"><span>Lien de la vidéo ' + aide('OneDrive : clic droit sur la vidéo → « Partager » → « Copier le lien » (réglage « Toute personne disposant du lien »). La vidéo se lit alors dans le pad, même au lycée. Un lien YouTube s\'ouvre dans un autre onglet (YouTube est bloqué au lycée).') + '</span><input type="url" data-f="url" value="' + esc(brouillon.url || '') + '" placeholder="https://…"></label>'
          + '<label class="champ"><span>Crédit <small>la chaîne ou l\'auteur de la vidéo</small></span><input type="text" data-f="credit" value="' + esc(brouillon.credit || '') + '"></label>';
      } else if (t === 'chiffre') {
        if (!lesCoffres.length) h += '<p class="info">Ajoute d\'abord un coffre au bas d\'une colonne (🧰). Un chiffre caché est un morceau de son code.</p>';
        h += '<label class="champ"><span>Coffre concerné</span><select data-f="coffre">' + lesCoffres.map(function (cf) {
          return '<option value="' + esc(cf.id) + '"' + (brouillon.coffre === cf.id ? ' selected' : '') + '>' + esc(cf.titre) + '</option>';
        }).join('') + '</select></label>'
          + '<label class="champ"><span>Le chiffre ou la lettre</span><input type="text" data-f="valeur" maxlength="6" value="' + esc(brouillon.valeur || '') + '"></label>'
          + '<label class="champ"><span>Position dans le code <small>facultatif — laisse vide pour que les élèves cherchent l\'ordre</small></span><input type="number" min="1" max="6" data-f="position" value="' + esc(brouillon.position || '') + '"></label>'
          + '<label class="champ"><span>Petit texte d\'accompagnement <small>facultatif</small></span><input type="text" data-f="contenu" value="' + esc(brouillon.contenu || '') + '"></label>';
      }
      if (b().options.indices || (brouillon.indice && brouillon.indice.texte)) {
        var ind = brouillon.indice || {};
        h += '<fieldset style="border:1px solid var(--filet);border-radius:10px;margin-top:1rem"><legend>💡 Indice <small class="muet">facultatif</small>'
          + (b().options.indices ? '' : ' <small class="avert">— option désactivée dans ⚙ Réglages</small>') + '</legend>'
          + '<label class="champ"><span>Texte de l\'indice</span><input type="text" data-i="texte" value="' + esc(ind.texte || '') + '"></label>'
          + '<label class="champ"><span>Coût ' + aide('Si l\'élève regarde l\'indice, la médaille du prochain coffre ne pourra pas dépasser ce niveau.') + '</span><select data-i="cout">'
          + '<option value="">Gratuit</option><option value="argent"' + (ind.cout === 'argent' ? ' selected' : '') + '>La médaille plafonne à l\'argent</option>'
          + '<option value="bronze"' + (ind.cout === 'bronze' ? ' selected' : '') + '>La médaille plafonne au bronze</option></select></label></fieldset>';
      }
      if (!neuve) {
        h += '<label class="champ"><span>Colonne</span><select data-deplacer>' + b().colonnes.map(function (cc, i) {
          return '<option value="' + esc(cc.id) + '"' + (cc === c ? ' selected' : '') + '>' + (i + 1) + '. ' + esc(cc.titre) + '</option>';
        }).join('') + '</select></label>';
      }
      return h;
    }

    /* La zone de dépôt (cartes « fichier » et « image »). */
    function zoneFichier(sorte) {
      var img = sorte === 'image', h = '';
      if (brouillon.chemin) {
        var ff = P.formatDe(brouillon.nom || brouillon.chemin) || { ico: '📎' };
        h += '<p class="depot-actuel"><span aria-hidden="true">' + ff.ico + '</span> <b>' + esc(brouillon.nom || 'fichier') + '</b> <small class="muet">'
          + esc(P.tailleLisible(brouillon.taille)) + '</small> <button type="button" class="btn petit" data-retirer>Retirer</button></p>';
      }
      h += '<div class="depot-zone" data-zone>'
        + '<p><b>' + (brouillon.chemin ? 'Pour le remplacer, glisse ' : 'Glisse ') + (img ? 'une image' : 'un fichier') + ' ici</b><br><small class="muet">ou</small></p>'
        + '<label class="btn">📂 Choisir sur mon ordinateur<input type="file" data-choisir hidden accept="'
        + (img ? '.jpg,.jpeg,.png,.webp,.gif' : '.pdf,.doc,.docx,.odt,.xls,.xlsx,.ods,.ppt,.pptx,.odp,.jpg,.jpeg,.png,.webp,.gif,.mp3,.m4a') + '"></label>'
        + '<progress data-progres max="1" value="0" hidden></progress><p class="erreur" data-err-depot hidden></p>'
        + '<small class="muet">' + (img ? 'JPEG, PNG, WebP ou GIF. Les grandes photos sont réduites toutes seules.'
            : 'PDF, Word, Excel, PowerPoint, LibreOffice, image ou son · 10 Mo au plus · pas de vidéo') + '</small></div>';
      if (!img) h += '<p class="info" style="font-size:.88rem">🔒 Tout élève qui a le lien du pad peut ouvrir ce fichier&nbsp;: pas de document avec des noms d\'élèves ou des notes.</p>';
      return h;
    }
    var envoyes = [], garde = false;   // fichiers envoyés depuis l'ouverture de cette fenêtre
    function brancherZone(d) {
      var zone = $('[data-zone]', d);
      var ret = $('[data-retirer]', d);
      if (ret) ret.addEventListener('click', function () {
        lire(d); ['chemin', 'nom', 'taille', 'mime'].forEach(function (x) { delete brouillon[x]; }); remplir(d);
      });
      if (!zone) return;
      function prendre(fichier) {
        lire(d);
        var err = $('[data-err-depot]', d), pr = $('[data-progres]', d);
        err.hidden = true; pr.hidden = false; pr.value = 0;
        deposer(fichier, function (x) { pr.value = x; }).then(function (r) {
          envoyes.push(r.chemin);
          brouillon.chemin = r.chemin; brouillon.nom = r.nom; brouillon.taille = r.taille; brouillon.mime = r.mime;
          delete brouillon.src;
          remplir(d);
        }).catch(function (e) { pr.hidden = true; err.hidden = false; err.textContent = P.messageErreur(e); });
      }
      $('[data-choisir]', d).addEventListener('change', function (e) { if (e.target.files[0]) prendre(e.target.files[0]); });
      zone.addEventListener('dragover', function (e) { e.preventDefault(); zone.classList.add('survol'); });
      zone.addEventListener('dragleave', function () { zone.classList.remove('survol'); });
      zone.addEventListener('drop', function (e) {
        e.preventDefault(); zone.classList.remove('survol');
        var f = e.dataTransfer && e.dataTransfer.files[0]; if (f) prendre(f);
      });
    }

    var corps = '<div class="choix" data-types>' + Object.keys(TYPES).map(function (t) {
      return '<button type="button" data-type="' + t + '"' + (brouillon.type === t ? ' class="actif"' : '') + '><span class="ico">' + TYPES[t].ico + '</span>' + TYPES[t].nom + '<small>' + TYPES[t].expl + '</small></button>';
    }).join('') + '</div><div data-champs></div>';

    function lire(d) {
      $$('[data-f]', d).forEach(function (i) { brouillon[i.getAttribute('data-f')] = i.value; });
      var it = $('[data-i="texte"]', d);
      if (it) {
        if (it.value.trim()) brouillon.indice = { texte: it.value, cout: $('[data-i="cout"]', d).value };
        else delete brouillon.indice;
      }
    }
    function remplir(d) {
      $('[data-champs]', d).innerHTML = champs(); brancherAides(d); brancherZone(d);
      $$('[data-md]', d).forEach(function (bt) {
        bt.addEventListener('click', function () {
          var ta = $('textarea[data-f="contenu"]', d), m = bt.getAttribute('data-md');
          var a = ta.selectionStart, z = ta.selectionEnd, sel = ta.value.slice(a, z), ins;
          if (m === 'lien') { var u = prompt('Adresse du lien (https://…)'); if (!u) return; ins = '[' + (sel || 'texte du lien') + '](' + u + ')'; }
          else if (m === '- ') ins = (a && ta.value[a - 1] !== '\n' ? '\n' : '') + '- ' + (sel || '');
          else ins = m + (sel || 'texte') + m;
          ta.setRangeText(ins, a, z, 'end'); ta.focus();
        });
      });
    }
    var boutons = [];
    if (!neuve) boutons.push({ txt: 'Supprimer', classe: 'danger', gauche: true, action: function () {
      if (!confirm('Supprimer cette carte ?')) return false;
      var r = trouverCarte(k.id); r.col.cartes.splice(r.ik, 1);
      if (k.chemin) etat.aMenager = true;
      modifie(); dessiner();
    } });
    boutons.push({ txt: 'Annuler' });
    boutons.push({ txt: neuve ? 'Ajouter la carte' : 'Enregistrer', classe: 'primaire', action: function (d) {
      lire(d);
      if (brouillon.type === 'chiffre' && !brouillon.coffre) { toast('Choisis un coffre.'); return false; }
      if (brouillon.type === 'fichier' && !brouillon.chemin) { toast('Dépose d\'abord un fichier.'); return false; }
      if (brouillon.type !== 'fichier' && brouillon.type !== 'image') ['chemin', 'nom', 'taille', 'mime'].forEach(function (x) { delete brouillon[x]; });
      if (brouillon.chemin) delete brouillon.src;
      // un fichier remplacé, retiré ou envoyé pour rien : le ménage suivra l'enregistrement
      if (envoyes.length || (k && k.chemin && k.chemin !== brouillon.chemin)) etat.aMenager = true;
      garde = true;
      ['src', 'url'].forEach(function (f) { if (brouillon[f] && !P.urlSure(brouillon[f])) brouillon[f] = ''; else if (brouillon[f]) brouillon[f] = P.urlSure(brouillon[f]); });
      var dest = $('[data-deplacer]', d) ? colonne($('[data-deplacer]', d).value) : c;
      if (neuve) dest.cartes.push(brouillon);
      else {
        var r = trouverCarte(k.id);
        if (dest === r.col) r.col.cartes[r.ik] = brouillon;
        else { r.col.cartes.splice(r.ik, 1); dest.cartes.push(brouillon); }
      }
      modifie(); dessiner();
    } });
    dialogue(neuve ? 'Nouvelle carte' : 'Modifier la carte', corps, boutons, function (d) {
      remplir(d);
      /* Fenêtre fermée sans enregistrer : ce qui a été envoyé repart.
         Enregistrée : les envois redeviennent des fichiers ordinaires,
         que le ménage efface s'ils ne servent pas. */
      d.addEventListener('close', function () {
        envoyes.forEach(function (ch) { delete etat.enAttente[ch]; });
        if (!garde && envoyes.length) Api.effacerFichiers(envoyes).then(chargerJauge).catch(function () { etat.aMenager = true; });
      });
      $$('[data-type]', d).forEach(function (bt) {
        bt.addEventListener('click', function () {
          lire(d); brouillon.type = bt.getAttribute('data-type');
          if (brouillon.type === 'chiffre' && !brouillon.coffre && lesCoffres[0]) brouillon.coffre = lesCoffres[0].id;
          $$('[data-type]', d).forEach(function (x) { x.classList.toggle('actif', x === bt); });
          remplir(d);
        });
      });
    });
  }

  /* --- le cadenas d'une colonne --- */
  function dlgCadenas(c) {
    var cad = JSON.parse(JSON.stringify(c.cadenas || { type: 'libre' }));
    var dernier = b().colonnes.filter(function (x) { return !x.secrete; }).slice(-1)[0] === c;
    function champs() {
      var t = cad.type, h = '<p class="muet">' + CADENAS[t].expl + '</p>';
      if (t === 'code') {
        h += '<label class="champ"><span>Le code attendu ' + aide('Majuscules, accents et espaces en trop ne comptent pas : « Électron » = « electron ». Les élèves ne peuvent pas le lire dans le code de la page.') + '</span><input type="text" data-c="code" value="' + esc(cad.code || '') + '" autocomplete="off"></label>'
          + '<label class="champ"><span>Phrase affichée à l\'élève <small>facultatif — par défaut « Entre le code pour ouvrir la suite »</small></span><input type="text" data-c="consigne" value="' + esc(cad.consigne || '') + '"></label>';
      }
      if (t === 'depot' || t === 'validation') {
        var f = cad.formats || ['texte', 'photo'];
        h += '<label class="champ"><span>Consigne du dépôt</span><input type="text" data-c="consigne" value="' + esc(cad.consigne || '') + '" placeholder="Ex. : Photographie ton ardoise avec ton schéma"></label>'
          + '<div class="champ"><span style="font-weight:600">L\'élève peut déposer</span>'
          + '<label class="coche"><input type="checkbox" data-format="texte"' + (f.indexOf('texte') >= 0 ? ' checked' : '') + '> un texte court</label>'
          + '<label class="coche"><input type="checkbox" data-format="photo"' + (f.indexOf('photo') >= 0 ? ' checked' : '') + '> une photo (son ardoise, sa feuille)</label></div>'
          + '<p class="muet" style="font-size:.85rem">📱 La production reste sur la tablette de l\'élève : rien ne part sur Internet.</p>';
      }
      if (t === 'validation') {
        h += '<label class="champ"><span>Ton code maître ' + aide('Le même pour tout le pad. Tu le tapes sur la tablette de l\'élève pour valider. Choisis-le court (4 chiffres, par exemple) et ne le dis pas !') + '</span>'
          + '<input type="text" data-maitre inputmode="numeric" value="' + esc(b().codeMaitre || '') + '" autocomplete="off"></label>';
      }
      if (dernier && t !== 'libre') h += '<p class="info">C\'est la dernière colonne : son cadenas sert à marquer l\'étape comme terminée.</p>';
      return h;
    }
    var corps = '<div class="choix">' + Object.keys(CADENAS).map(function (t) {
      return '<button type="button" data-t="' + t + '"' + (cad.type === t ? ' class="actif"' : '') + '><span class="ico">' + CADENAS[t].ico + '</span>' + CADENAS[t].nom + '</button>';
    }).join('') + '</div><div data-champs></div>';
    function lire(d) {
      $$('[data-c]', d).forEach(function (i) { cad[i.getAttribute('data-c')] = i.value; });
      var fs = $$('[data-format]', d); if (fs.length) cad.formats = fs.filter(function (x) { return x.checked; }).map(function (x) { return x.getAttribute('data-format'); });
      var m = $('[data-maitre]', d); if (m) b().codeMaitre = m.value.trim();
    }
    dialogue('Cadenas de « ' + esc(c.titre) + ' »', corps, [{ txt: 'Annuler' }, { txt: 'Enregistrer', classe: 'primaire', action: function (d) {
      lire(d);
      if ((cad.type === 'depot' || cad.type === 'validation') && (!cad.formats || !cad.formats.length)) { toast('Coche au moins un type de dépôt.'); return false; }
      var propre = { type: cad.type };
      if (cad.type === 'code') { propre.code = (cad.code || '').trim(); if (cad.consigne) propre.consigne = cad.consigne; }
      if (cad.type === 'depot' || cad.type === 'validation') { propre.consigne = cad.consigne || ''; propre.formats = cad.formats; }
      c.cadenas = propre; modifie(); dessiner();
    } }], function (d) {
      $('[data-champs]', d).innerHTML = champs(); brancherAides(d);
      $$('[data-t]', d).forEach(function (bt) {
        bt.addEventListener('click', function () {
          lire(d); cad.type = bt.getAttribute('data-t');
          $$('[data-t]', d).forEach(function (x) { x.classList.toggle('actif', x === bt); });
          $('[data-champs]', d).innerHTML = champs(); brancherAides(d);
        });
      });
    });
  }

  /* --- le coffre d'une colonne --- */
  function dlgCoffre(c) {
    var neuf = !c.coffre;
    var cf = c.coffre ? JSON.parse(JSON.stringify(c.coffre)) : { id: P.nouvelId('f'), titre: 'Coffre ' + (coffres().length + 1), code: '', medaille: '', final: false };
    function optionsMed() {
      return '<option value="">— choisir —</option>' + b().medailles.map(function (m) {
        return '<option value="' + esc(m.id) + '"' + (cf.medaille === m.id ? ' selected' : '') + '>' + esc((m.icone || '🏅') + ' ' + m.nom) + '</option>';
      }).join('') + '<option value="__nouvelle">＋ Nouvelle médaille…</option>';
    }
    var corps = '<p class="muet">Le coffre se place au bas de la colonne. L\'élève fait tourner des molettes ; le bon code ouvre le coffre et lui remet une médaille.</p>'
      + '<label class="champ"><span>Nom du coffre</span><input type="text" id="cf-titre" value="' + esc(cf.titre) + '"></label>'
      + '<label class="champ"><span>Code du coffre <small>3 à 6 chiffres ou lettres</small></span><input type="text" id="cf-code" maxlength="6" autocapitalize="characters" autocomplete="off" value="' + esc(cf.code) + '"></label>'
      + '<label class="champ"><span>Médaille remise</span><select id="cf-med">' + optionsMed() + '</select></label>'
      + '<label class="coche"><input type="checkbox" id="cf-final"' + (cf.final ? ' checked' : '') + '><span><b>Coffre final</b> ' + aide('Il ne s\'ouvre que si l\'élève a déjà toutes les autres médailles du pad, même avec le bon code.') + '</span></label>'
      + '<div style="margin-top:1rem;padding:.7rem;border:1px dashed var(--filet-fonce);border-radius:10px"><b>🗝 Cacher les morceaux du code</b>'
      + '<p class="muet" style="margin:.3rem 0">Crée une carte « chiffre caché » par caractère, réparties dans les colonnes qui précèdent ce coffre. Tu pourras ensuite les déplacer.</p>'
      + '<button class="btn petit" type="button" id="cf-repartir">Répartir le code dans les colonnes</button></div>';
    var boutons = [];
    if (!neuf) boutons.push({ txt: 'Retirer le coffre', classe: 'danger', gauche: true, action: function () {
      if (!confirm('Retirer ce coffre ? Les cartes « chiffre caché » qui s\'y rapportent seront supprimées aussi.')) return false;
      b().colonnes.forEach(function (cc) { cc.cartes = cc.cartes.filter(function (k) { return !(k.type === 'chiffre' && k.coffre === cf.id); }); });
      c.coffre = null; modifie(); dessiner();
    } });
    function lire(d) {
      cf.titre = $('#cf-titre', d).value.trim() || 'Coffre';
      cf.code = $('#cf-code', d).value.replace(/\s/g, '').toUpperCase();
      cf.medaille = $('#cf-med', d).value === '__nouvelle' ? cf.medaille : $('#cf-med', d).value;
      cf.final = $('#cf-final', d).checked;
    }
    function valide() {
      if (!/^[0-9A-Z]{3,6}$/.test(P.normaliser(cf.code).toUpperCase())) { toast('Le code : 3 à 6 chiffres ou lettres, sans accents.'); return false; }
      return true;
    }
    boutons.push({ txt: 'Annuler' });
    boutons.push({ txt: 'Enregistrer', classe: 'primaire', action: function (d) {
      lire(d); if (!valide()) return false;
      c.coffre = cf; modifie(); dessiner();
    } });
    dialogue(neuf ? 'Nouveau coffre' : 'Coffre « ' + esc(cf.titre) + ' »', corps, boutons, function (d) {
      $('#cf-med', d).addEventListener('change', function (e) {
        if (e.target.value !== '__nouvelle') return;
        e.target.value = cf.medaille || '';
        lire(d);
        dlgMedaille(null, function (m) { cf.medaille = m.id; $('#cf-med', d).innerHTML = optionsMed(); });
      });
      $('#cf-repartir', d).addEventListener('click', function () {
        lire(d); if (!valide()) return;
        var avant = b().colonnes.slice(0, b().colonnes.indexOf(c) + 1).filter(function (x) { return !x.secrete; });
        b().colonnes.forEach(function (cc) { cc.cartes = cc.cartes.filter(function (k) { return !(k.type === 'chiffre' && k.coffre === cf.id); }); });
        cf.code.split('').forEach(function (ch, i) {
          var cible = avant[Math.floor(i * avant.length / cf.code.length)];
          cible.cartes.push({ id: P.nouvelId('k'), type: 'chiffre', coffre: cf.id, valeur: ch, position: String(i + 1), contenu: '' });
        });
        c.coffre = cf; modifie();
        toast(cf.code.length + ' chiffres cachés créés.');
        d.close(); d.remove(); dessiner();
      });
    });
  }

  /* --- médailles --- */
  function dlgMedaille(m, apres) {
    var neuve = !m;
    var x = m ? JSON.parse(JSON.stringify(m)) : { id: P.nouvelId('m'), nom: '', icone: '🏅', couleur: 'or' };
    var corps = '<label class="champ"><span>Nom</span><input type="text" id="md-nom" value="' + esc(x.nom) + '" placeholder="Ex. : Détective des sources"></label>'
      + '<div class="champ"><span style="font-weight:600">Icône</span><div class="emojis">' + EMOJIS.map(function (e) {
        return '<button type="button" data-e="' + e + '"' + (x.icone === e ? ' class="actif"' : '') + ' aria-label="' + e + '">' + e + '</button>';
      }).join('') + '</div><label class="champ"><span>…ou un autre émoji</span><input type="text" id="md-ico" maxlength="4" value="' + esc(x.icone) + '"></label></div>'
      + '<label class="champ"><span>Couleur</span><select id="md-coul">'
      + ['or', 'argent', 'bronze'].map(function (c) { return '<option value="' + c + '"' + (x.couleur === c ? ' selected' : '') + '>' + c[0].toUpperCase() + c.slice(1) + '</option>'; }).join('')
      + '<option value="libre"' + (/^#/.test(x.couleur) ? ' selected' : '') + '>Autre couleur…</option></select></label>'
      + '<input type="color" id="md-hex" value="' + (/^#/.test(x.couleur) ? x.couleur : '#2f6b70') + '"' + (/^#/.test(x.couleur) ? '' : ' hidden') + ' style="width:80px;height:44px">'
      + '<p style="margin-top:1rem">Aperçu&nbsp;: <span id="md-ap"></span></p>';
    function maj(d) {
      x.nom = $('#md-nom', d).value; x.icone = $('#md-ico', d).value || '🏅';
      x.couleur = $('#md-coul', d).value === 'libre' ? $('#md-hex', d).value : $('#md-coul', d).value;
      $('#md-hex', d).hidden = $('#md-coul', d).value !== 'libre';
      $('#md-ap', d).innerHTML = pastilleMedaille(x) + ' <b>' + esc(x.nom || '…') + '</b>';
    }
    dialogue(neuve ? 'Nouvelle médaille' : 'Médaille', corps, [{ txt: 'Annuler' }, { txt: 'Enregistrer', classe: 'primaire', action: function (d) {
      maj(d); if (!x.nom.trim()) { toast('Donne un nom à la médaille.'); return false; }
      x.nom = x.nom.trim();
      if (neuve) b().medailles.push(x); else b().medailles[b().medailles.indexOf(m)] = x;
      modifie(); if (apres) apres(x); else dessiner();
    } }], function (d) {
      maj(d);
      $$('[data-e]', d).forEach(function (bt) {
        bt.addEventListener('click', function () {
          $('#md-ico', d).value = bt.getAttribute('data-e');
          $$('[data-e]', d).forEach(function (y) { y.classList.toggle('actif', y === bt); }); maj(d);
        });
      });
      ['#md-nom', '#md-ico', '#md-coul', '#md-hex'].forEach(function (s) { $(s, d).addEventListener('input', function () { maj(d); }); });
    });
  }
  function dlgMedailles() {
    function liste() {
      if (!b().medailles.length) return '<p class="muet">Aucune médaille pour l\'instant. Chaque coffre en remet une.</p>';
      return b().medailles.map(function (m) {
        var utilise = coffres().filter(function (cf) { return cf.col.coffre.medaille === m.id; }).map(function (cf) { return cf.titre; });
        return '<div class="ligne-med">' + pastilleMedaille(m, true) + '<span class="nom"><b>' + esc(m.nom) + '</b><br><small class="muet">'
          + (utilise.length ? 'Remise par : ' + esc(utilise.join(', ')) : 'Pas encore dans un coffre') + '</small></span>'
          + '<button class="btn petit" type="button" data-mod="' + esc(m.id) + '">Modifier</button>'
          + '<button class="btn petit danger" type="button" data-sup="' + esc(m.id) + '" aria-label="Supprimer">✕</button></div>';
      }).join('');
    }
    var d = dialogue('Les médailles du pad', '<div id="ls-med">' + liste() + '</div>', [
      { txt: '＋ Nouvelle médaille', gauche: true, action: function () { dlgMedaille(null, function () { dessiner(); dlgMedailles(); }); } },
      { txt: 'Fermer', classe: 'primaire' }]);
    function brancher() {
      $$('[data-mod]', d).forEach(function (bt) { bt.addEventListener('click', function () { var m = medaille(bt.getAttribute('data-mod')); d.close(); d.remove(); dlgMedaille(m); }); });
      $$('[data-sup]', d).forEach(function (bt) {
        bt.addEventListener('click', function () {
          var id = bt.getAttribute('data-sup');
          if (!confirm('Supprimer cette médaille ? Les coffres qui la remettaient n\'en remettront plus.')) return;
          b().medailles = b().medailles.filter(function (m) { return m.id !== id; });
          b().colonnes.forEach(function (c) { if (c.coffre && c.coffre.medaille === id) c.coffre.medaille = ''; });
          modifie(); $('#ls-med', d).innerHTML = liste(); brancher(); dessiner();
        });
      });
    }
    brancher();
  }

  /* --- menu d'une colonne --- */
  function dlgColonne(c) {
    var L = b().colonnes, i = L.indexOf(c);
    var corps = '<div style="display:flex;gap:.5rem;flex-wrap:wrap">'
      + '<button class="btn" type="button" id="col-g"' + (i === 0 ? ' disabled' : '') + '>◀ Déplacer à gauche</button>'
      + '<button class="btn" type="button" id="col-d"' + (i === L.length - 1 ? ' disabled' : '') + '>Déplacer à droite ▶</button></div>'
      + '<label class="coche" style="margin-top:1rem"><input type="checkbox" id="col-sec"' + (c.secrete ? ' checked' : '') + '><span><b>✨ Salle secrète</b> '
      + aide('Une colonne bonus que l\'élève ne voit qu\'après avoir terminé toutes les autres. Pense à activer l\'option « Salle secrète » dans ⚙ Réglages.') + '</span></label>';
    dialogue('Colonne « ' + esc(c.titre) + ' »', corps, [
      { txt: 'Supprimer la colonne', classe: 'danger', gauche: true, action: function () {
        if (c.cartes.length && !confirm('Supprimer cette colonne et ses ' + c.cartes.length + ' carte(s) ?')) return false;
        if (c.coffre) b().colonnes.forEach(function (cc) { cc.cartes = cc.cartes.filter(function (k) { return !(k.type === 'chiffre' && k.coffre === c.coffre.id); }); });
        L.splice(L.indexOf(c), 1); etat.aMenager = true; modifie(); dessiner();
      } },
      { txt: 'Fermer', classe: 'primaire', action: function (d) { c.secrete = $('#col-sec', d).checked; modifie(); dessiner(); } }
    ], function (d) {
      function bouger(delta) { var j = L.indexOf(c); L.splice(j, 1); L.splice(j + delta, 0, c); modifie(); d.close(); d.remove(); dessiner(); }
      $('#col-g', d).addEventListener('click', function () { bouger(-1); });
      $('#col-d', d).addEventListener('click', function () { bouger(1); });
    });
  }

  /* --- réglages du pad --- */
  function dlgReglages() {
    var B = b(), o = B.options;
    var corps = '<label class="champ"><span>Titre du pad</span><input type="text" id="rg-titre" value="' + esc(B.titre) + '"></label>'
      + '<label class="champ"><span>Image de couverture <small>facultatif — un lien vers une image</small></span><input type="url" id="rg-couv" value="' + esc(B.couverture || '') + '"></label>'
      + '<label class="champ"><span>Code maître ' + aide('Ton code personnel pour ce pad : tu le tapes sur la tablette d\'un élève pour valider une étape « Validation prof ». Les élèves ne peuvent pas le lire dans la page.') + '</span>'
      + '<input type="text" id="rg-maitre" inputmode="numeric" autocomplete="off" value="' + esc(B.codeMaitre || '') + '" placeholder="Ex. : 4 chiffres"></label>'
      + '<h3 style="margin:1.2rem 0 .2rem;font-size:1.05rem">Options</h3>'
      + '<label class="coche"><input type="checkbox" id="op-parcours"' + (o.carteParcours !== false ? ' checked' : '') + '><span><b>Carte du parcours</b> — une frise des étapes en haut de l\'écran, cadenas ouverts ou fermés.</span></label>'
      + '<label class="coche"><input type="checkbox" id="op-indices"' + (o.indices ? ' checked' : '') + '><span><b>Indices</b> — un bouton « 💡 indice » sur les cartes où tu en écris un, avec un coût possible.</span></label>'
      + '<label class="coche"><input type="checkbox" id="op-secrete"' + (o.salleSecrete ? ' checked' : '') + '><span><b>Salle secrète</b> — les colonnes marquées ✨ n\'apparaissent qu\'à ceux qui ont tout fini.</span></label>'
      + '<label class="coche"><input type="checkbox" id="op-ressentis"' + (o.ressentis ? ' checked' : '') + '><span><b>Ressenti</b> — à la fin de chaque étape, l\'élève choisit un visage (rien compris, trop dur, à l\'aise, trop facile).</span></label>'
      + '<h3 style="margin:1.2rem 0 .2rem;font-size:1.05rem">Partage avec les collègues</h3>'
      + '<label class="coche"><input type="checkbox" id="op-copiable"' + (etat.pad.copiable ? ' checked' : '') + '><span>Une collègue qui a le <b>lien de copie</b> peut copier ce pad dans ses pads (codes compris). Ta version ne change pas.</span></label>';
    dialogue('⚙ Réglages du pad', corps, [{ txt: 'Annuler' }, { txt: 'Enregistrer', classe: 'primaire', action: function (d) {
      B.titre = $('#rg-titre', d).value.trim() || 'Pad sans titre';
      B.couverture = P.urlSure($('#rg-couv', d).value);
      B.codeMaitre = $('#rg-maitre', d).value.trim();
      o.carteParcours = $('#op-parcours', d).checked; o.indices = $('#op-indices', d).checked;
      o.salleSecrete = $('#op-secrete', d).checked; o.ressentis = $('#op-ressentis', d).checked;
      etat.pad.copiable = $('#op-copiable', d).checked;
      modifie(); dessiner();
    } }]);
  }

  /* --- tester, partager, exporter --- */
  function tester() {
    try { localStorage.setItem('padago.apercu', JSON.stringify(b())); } catch (e) { return toast('Aperçu impossible dans ce navigateur.'); }
    window.open('pad.html?apercu=1', '_blank', 'noopener');
  }
  function svgQR(texte) {
    var q = window.qrcode(0, 'M'); q.addData(texte); q.make();
    return q.createSvgTag({ cellSize: 6, margin: 4, scalable: true });
  }
  function dlgPartager() {
    sauver();
    var lien = BASE + 'pad.html?p=' + etat.pad.slug;
    var lienCopie = BASE + 'index.html#copier=' + etat.pad.slug;
    var corps = '<h3 style="margin:.2rem 0;font-size:1.05rem">Pour les élèves</h3>'
      + '<div class="qr" id="qr">' + svgQR(lien) + '</div>'
      + '<div class="lien-copie" style="margin-top:.6rem"><input type="text" readonly value="' + esc(lien) + '" id="lien-el"><button class="btn" type="button" data-copier="lien-el">Copier</button></div>'
      + '<p class="muet" style="font-size:.85rem">Projette le QR code, ou colle le lien dans l\'ENT. Les élèves n\'ont pas besoin de compte. Le lien reste le même quand tu modifies le pad.</p>'
      + '<h3 style="margin:1.2rem 0 .2rem;font-size:1.05rem">Pour une collègue</h3>'
      + (etat.pad.copiable
        ? '<div class="lien-copie"><input type="text" readonly value="' + esc(lienCopie) + '" id="lien-col"><button class="btn" type="button" data-copier="lien-col">Copier</button></div>'
          + '<p class="muet" style="font-size:.85rem">Avec ce lien, une collègue qui a un compte ' + esc(P.NOM) + ' copie le pad dans ses pads et l\'adapte. Ta version ne change pas.</p>'
        : '<p class="muet">La copie par les collègues est fermée pour ce pad (⚙ Réglages).</p>')
      + '<p style="margin-top:1rem"><button class="btn petit" type="button" id="exporter">⬇ Télécharger le fichier du pad (.json)</button> '
      + aide('Une sauvegarde sur ton ordinateur, ou un moyen de transmettre le pad par mail. On le recharge avec « Importer un fichier » sur la page Mes pads. Attention : le fichier contient les codes en clair.') + '</p>';
    dialogue('🔗 Partager', corps, [
      { txt: '⛶ Projeter le QR code', gauche: true, action: function () { projeter(lien); return false; } },
      { txt: 'Fermer', classe: 'primaire' }], function (d) {
      $$('[data-copier]', d).forEach(function (bt) {
        bt.addEventListener('click', function () {
          var i = document.getElementById(bt.getAttribute('data-copier')); i.select();
          (navigator.clipboard ? navigator.clipboard.writeText(i.value) : Promise.reject()).then(function () { toast('Lien copié.'); })
            .catch(function () { document.execCommand('copy'); toast('Lien copié.'); });
        });
      });
      $('#exporter', d).addEventListener('click', exporter);
    });
  }
  function projeter(lien) {
    var d = document.createElement('dialog');
    d.style.cssText = 'max-width:none;width:100vw;height:100vh;max-height:none;margin:0;border-radius:0';
    d.innerHTML = '<div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;padding:1rem;text-align:center">'
      + '<h2 style="margin:0;font-size:clamp(1.5rem,4vw,2.6rem)">' + esc(b().titre) + '</h2>'
      + '<div style="width:min(70vh,80vw)">' + svgQR(lien).replace('<svg', '<svg style="width:100%;height:auto"') + '</div>'
      + '<p style="font-family:\'IBM Plex Mono\',monospace;font-size:clamp(.9rem,2vw,1.3rem);margin:0;word-break:break-all">' + esc(lien) + '</p>'
      + '<button class="btn" type="button">Fermer</button></div>';
    document.body.appendChild(d);
    $('button', d).addEventListener('click', function () { d.close(); d.remove(); });
    d.addEventListener('cancel', function () { setTimeout(function () { d.remove(); }, 0); });
    d.showModal();
  }
  function exporter() {
    var nom = (b().titre || 'pad').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
    var blob = new Blob([JSON.stringify(b(), null, 2)], { type: 'application/json' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'padago-' + (nom || 'pad') + '.json';
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  demarrer();
})();
