/* ============================================================
 *  sequence-snt.js — moteur PARTAGÉ des séquences SNT
 *  ------------------------------------------------------------
 *  Extrait de pages/2nde-snt-t1-internet.html le 23/07/2026, à
 *  l'identique : aucune ligne n'a été modifiée, seulement déplacée,
 *  dans l'ordre de la source.
 *
 *  Contient les mécanismes du §15 des CONSIGNES : barre de progression,
 *  révélation séquentielle, QCM plein écran, trous tolérants (variantes
 *  + Levenshtein + indices), glossaire permanent, mode enseignant
 *  (SHA-256, 30 min), impression, réhydratation des réponses corrigées,
 *  glisser-déposer tactile.
 *
 *  ⚠ Se charge en FIN DE <body>, jamais dans <head> : il travaille sur
 *  un DOM déjà construit et ne pose aucun écouteur DOMContentLoaded.
 *
 *  ⚠ ÉTAT AU 23/07/2026 : seule t1-internet est portée sur ce moteur.
 *  Les sept autres séquences tournent encore sur leur copie inline,
 *  plus ancienne. Les migrer demande d'adapter leur HTML au marquage
 *  attendu ici (data-step, data-gate, .field[data-focus-code],
 *  script.qcm-data, #dico-source…) — à faire séquence par séquence,
 *  en vérifiant chacune. Ne PAS brancher une page sans l'avoir testée.
 *
 *  Dépendance : assets/js/progression.js (chargé avant, dans <head>).
 * ============================================================ */

/* ============================================================
   ÉTAT DES ÉTAPES — lot 1A (24/07/2026)
   ------------------------------------------------------------
   Ce module ENREGISTRE seulement. Il ne révèle rien, ne restaure
   rien, ne change rien à l'écran : c'est le lot 1B.

   Pourquoi il existe : avant lui, seules les questions libres
   (reponses_libres) et les notes du poste étaient sauvegardées.
   Le QCM, les trous et le glisser-déposer posaient « is-done »
   dans le DOM et rien d'autre — donc tout était perdu au premier
   rafraîchissement, et la séance suivante se reverrouillait.

   Où c'est écrit : table progression, domaine 'cours', clé = la
   valeur de <body data-sequence>. Deux informations distinctes
   par étape, « fait » et « juste » (décision du 21/07/2026) ;
   « juste » vaut null quand le bloc ne mesure pas de justesse —
   on n'invente pas une justesse qu'on n'a pas mesurée.

   PAS de data-sequence sur la page ? Le module reste inerte.
   C'est le filet qui protège les sept autres séquences.

   ⚠ Progression.ecrire fusionne au PREMIER NIVEAU seulement : on
   lui renvoie donc la carte complète des étapes à chaque fois.
   ============================================================ */
(function(global){
  var SEQ   = document.body ? (document.body.dataset.sequence || null) : null;
  var ETAT  = { v:1, etapes:{}, champs:{}, vu_le:null };
  var minuteur = null;

  function base(){
    return (typeof Progression !== 'undefined' && Progression.disponible()) ? Progression : null;
  }

  /* Clé d'une étape. Priorité à une clé écrite à la main
     (data-cle), sinon l'id posé par construireBarre, sinon un
     repli positionnel. ⚠ PROVISOIRE : tant que la clé dépend du
     rang, insérer une étape au milieu d'une séance décale l'état
     des élèves. Clés stables à poser au lot 4 (numérotation). */
  function cle(step){
    if(!step) return null;
    if(step.dataset && step.dataset.cle) return step.dataset.cle;
    if(step.id) return step.id;
    var sec = step.closest('.seance');
    if(!sec) return null;
    var n = sec.getAttribute('data-seance') || '?';
    var i = Array.prototype.indexOf.call(sec.querySelectorAll('.step'), step);
    return 'et-s' + n + '-' + i;
  }

  /* Les moteurs posent déjà leur score en dataset avant d'annoncer
     l'étape validée. On le relit ici plutôt que de dupliquer leur
     logique de correction. */
  function scoreDe(step){
    var d = step.dataset || {};
    return d.qcmScore || d.clozeScore || d.triScore || null;
  }
  function justeDe(step){
    var s = scoreDe(step);
    if(!s) return null;
    var m = /^(\d+)\s*\/\s*(\d+)$/.exec(s);
    return m ? (m[1] === m[2]) : null;
  }

  function sauver(){
    var B = base();
    if(!B || !SEQ) return;
    clearTimeout(minuteur);
    minuteur = setTimeout(function(){
      ETAT.vu_le = new Date().toISOString();
      B.ecrire('cours', SEQ, { etapes: ETAT.etapes, champs: ETAT.champs, vu_le: ETAT.vu_le })
       .catch(function(){ /* invité, hors ligne : on n'insiste pas */ });
    }, 1500);           /* on n'écrit pas à chaque validation */
  }

  function noter(step, juste, score){
    if(!SEQ || !step) return;
    var k = cle(step); if(!k) return;
    if(juste === undefined) juste = justeDe(step);
    if(score === undefined) score = scoreDe(step);
    var val   = { fait:true,
                  juste:(juste === true ? true : (juste === false ? false : null)),
                  score:(score || null) };
    var avant = ETAT.etapes[k];
    if(avant && avant.fait === val.fait && avant.juste === val.juste
             && avant.score === val.score) return;              /* rien de neuf */
    ETAT.etapes[k] = val;
    sauver();
  }

  /* Le CONTENU saisi, séparé de l'état — aujourd'hui les textes à
     trous. Clé = clé de l'étape + '/cloze-N'. */
  function noterChamps(k, valeurs){
    if(!SEQ || !k || !valeurs) return;
    var avant = ETAT.champs[k];
    if(avant && avant.join('\u0000') === valeurs.join('\u0000')) return;
    ETAT.champs[k] = valeurs.slice();
    sauver();
  }

  /* « Recommencer la séance » doit aussi effacer en base, sinon le
     rechargement suivant ressusciterait tout le travail effacé. */
  function oublier(step){
    if(!SEQ || !step) return;
    var k = cle(step); if(!k) return;
    var change = false;
    if(k in ETAT.etapes){ delete ETAT.etapes[k]; change = true; }
    Object.keys(ETAT.champs).forEach(function(c){
      if(c === k || c.indexOf(k + '/') === 0){ delete ETAT.champs[c]; change = true; }
    });
    if(change) sauver();
  }

  /* Chargement : on FUSIONNE, l'état local ayant priorité — sinon
     une réponse validée pendant que la requête voyage serait
     écrasée par la version d'avant. */
  var chargement = (function(){
    var B = base();
    if(!B || !SEQ) return Promise.resolve(ETAT);
    return B.lire('cours', SEQ).then(function(v){
      if(v && v.etapes && typeof v.etapes === 'object')
        ETAT.etapes = Object.assign({}, v.etapes, ETAT.etapes);
      if(v && v.champs && typeof v.champs === 'object')
        ETAT.champs = Object.assign({}, v.champs, ETAT.champs);
      if(v && v.vu_le && !ETAT.vu_le) ETAT.vu_le = v.vu_le;
      return ETAT;
    }).catch(function(){ return ETAT; });
  })();

  /* Les moteurs annoncent 'etape-validee' sur l'étape : l'événement
     remonte jusqu'ici. Un seul point d'enregistrement. */
  document.addEventListener('etape-validee', function(e){
    var s = (e.target && e.target.closest) ? e.target.closest('.step') : null;
    if(s) noter(s);
  });

  global.EtatSNT = {
    actif      : function(){ return !!SEQ; },
    cle        : cle,
    noter      : noter,
    noterChamps: noterChamps,
    oublier    : oublier,
    etapes     : function(){ return ETAT.etapes; },
    champs     : function(){ return ETAT.champs; },
    vuLe       : function(){ return ETAT.vu_le; },
    /* Vrai si le dernier passage remonte à plus de N heures. Sert au
       hub : sous le seuil on replace en silence, au-dessus on
       présentera la carte de reprise (seuil retenu : 2 h). */
    absentDepuis: function(heures){
      if(!ETAT.vu_le) return false;
      var d = Date.parse(ETAT.vu_le);
      return isFinite(d) && (Date.now() - d) > (heures || 2) * 3600000;
    },
    charge : chargement          /* promesse */
  };
})(window);

(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* petit easter egg pour les curieux qui ouvrent la console */
  console.log("%c📡 Bien reçu !","font-size:16px;font-weight:bold;color:#2445c7");
  console.log("%cTu as ouvert la console — le réflexe d'un vrai administrateur réseau.\nEssaie de taper  ping('lycee.fr')  juste ici, et appuie sur Entrée…\n— M. Vanhoorde","font-size:12px;color:#12805c");
  window.ping = function(host){
    host = host || 'localhost';
    var t = Math.floor(Math.random()*40)+8;
    return "Réponse de "+host+" : octets=32 temps="+t+" ms TTL=1973 — (simulation 😉 le vrai ping se tape dans l'Invite de commandes. TTL=1973 ? L'année de CYCLADES, évidemment.)";
  };

  /* innerHTML : les messages sont écrits ici, dans le script — aucun texte
     d'élève ne transite par ce chemin (la réponse rédigée passe par
     [data-focus-echo], en textContent). */
  function verdict(field,cls,msg){var v=field.querySelector('.verdict');if(!v)return;v.className='verdict show '+cls;v.innerHTML=msg;}
  function stepOf(el){return el.closest('[data-step]');}
  /* markDone annonce 'etape-validee' comme les moteurs V2 (QCM, trous, tri) :
     un seul canal, un seul point d'enregistrement (module EtatSNT en tête de
     fichier). L'écouteur ligne ~83 rappelle refresh() — sans effet de bord,
     refresh() est idempotent (seanceWasComplete garde onSeanceComplete). */
  function markDone(el){var s=stepOf(el);if(s){s.classList.remove('is-wait');s.classList.add('is-done');
    s.dispatchEvent(new CustomEvent('etape-validee',{bubbles:true}));}refresh();}
  function showReveal(field){field.querySelectorAll('[data-reveal]').forEach(function(r){r.classList.add('show');});}

  /* ---------- déblocage progressif ---------- */
  function seanceComplete(sec){
    var gates=sec.querySelectorAll('[data-gate]');
    if(!gates.length) return true;
    return Array.from(gates).every(function(g){return g.classList.contains('is-done');});
  }
  var seanceWasComplete={};
  function refresh(){
    document.querySelectorAll('.seance').forEach(function(sec){
      var gates=sec.querySelectorAll('[data-gate]');
      var done=Array.from(gates).filter(function(g){return g.classList.contains('is-done');}).length;
      var bar=sec.querySelector('[data-progress]');
      if(bar) bar.style.width = gates.length ? (100*done/gates.length)+'%' : '0%';
      var id=sec.getAttribute('data-seance');
      var complete = gates.length>0 && done===gates.length;
      if(complete && seanceWasComplete[id]===false){ onSeanceComplete(sec); }
      if(seanceWasComplete[id]===undefined) seanceWasComplete[id]=complete; else seanceWasComplete[id]=complete;
    });
    var s1=document.querySelector('[data-seance="1"]');
    var s2=document.querySelector('[data-seance="2"]');
    var s3=document.querySelector('[data-seance="3"]');
    var s4=document.querySelector('[data-seance="4"]');
    if(s2) s2.classList.toggle('locked', !seanceComplete(s1));
    if(s3) s3.classList.toggle('locked', !(seanceComplete(s1)&&seanceComplete(s2)));
    if(s4) s4.classList.toggle('locked', !(seanceComplete(s1)&&seanceComplete(s2)&&seanceComplete(s3)));
    document.querySelectorAll('[data-navlock]').forEach(function(a){
      var n=a.getAttribute('data-navlock');
      var sec=document.querySelector('[data-seance="'+n+'"]');
      var ico=a.querySelector('.lockico');
      if(ico) ico.style.display = (sec && sec.classList.contains('locked') && !document.body.classList.contains('teacher')) ? '' : 'none';
    });
  }

  /* Les moteurs V2 (trous, QCM plein écran) valident l'étape eux-mêmes et
     annoncent 'etape-validee'. Sans cette écoute, la classe is-done était
     bien posée mais le déblocage de la séance suivante ne suivait pas. */
  document.addEventListener('etape-validee',function(){ refresh(); });

  /* mode enseignant */
  document.getElementById('teacherMode').addEventListener('change',function(){
    document.body.classList.toggle('teacher',this.checked);
    refresh();
  });

  /* ---------- QCM ----------
     Retiré le 21/07/2026 : plus aucun QCM inline dans la page. Le QCM est un
     composant plein écran (bloc MOTEURS V2, initQcm) — CONSIGNES §15.5. */

  /* ---------- trous ----------
     Retiré le 21/07/2026 : la correction des trous appartient au moteur
     tolérant (bloc MOTEURS V2, initCloze). L'ancien correcteur strict
     comparait en toLowerCase() et ne validait que le sans-faute, contraire
     à la validation à l'envoi (CONSIGNES §15.7). Un seul moteur par mécanisme. */

  /* ---------- schéma / association ---------- */
  document.querySelectorAll('[data-check-diagram]').forEach(function(btn){
    btn.addEventListener('click',function(){
      var field=btn.closest('.field');var sels=Array.from(field.querySelectorAll('select'));var all=true;
      sels.forEach(function(s){var ok=s.value===s.dataset.correct;s.classList.toggle('ok',ok);s.classList.toggle('no',!ok);if(!ok)all=false;});
      if(all){verdict(field,'ok','✅ Tout est juste — étape validée.');markDone(btn);}
      else{verdict(field,'no','Pas tout à fait : les menus en rouge sont à revoir.');}
    });
  });

  /* ---------- texte libre ----------
     Retiré le 21/07/2026 : la simulation locale (setTimeout, aucun envoi) est
     contraire à CONSIGNES §7. Les sept champs rédigés sont passés en data-focus
     et partent en base par BASE.envoyerReponse ; sans base, repli local propre. */

  /* ============================================================
     COMPOSANTS TRANSVERSES (spec §7)
     ============================================================ */

  /* --- petit pont vers la base. Absente ? tout continue de
         fonctionner, sans enregistrement. (progression.js §2) --- */
  var BASE = (typeof Progression!=='undefined' && Progression.disponible()) ? Progression : null;

  /* ---------- §1 picto « à voir plus tard » ----------
     Au clic pour le tactile (le survol n'existe pas sur iPad), et
     focusable au clavier. */
  document.querySelectorAll('[data-plustard]').forEach(function(b){
    if(!b.hasAttribute('aria-label')) b.setAttribute('aria-label','Notion abordée plus tard — voir le détail');
    b.addEventListener('click',function(e){
      e.preventDefault();
      document.querySelectorAll('.plustard.ouvert').forEach(function(o){if(o!==b)o.classList.remove('ouvert');});
      b.classList.toggle('ouvert');
    });
  });
  document.addEventListener('click',function(e){
    if(!e.target.closest('.plustard')) document.querySelectorAll('.plustard.ouvert').forEach(function(o){o.classList.remove('ouvert');});
  });

  /* ---------- §7.2 suivi de sortie de page ----------
     On compte les sorties pendant une rédaction en mode strict.
     Aucune sanction, aucun blocage : un message, et le compteur
     part en base pour le professeur. Jamais de comparaison entre
     élèves — c'est le piège RGPD/éthique du tableau de bord. */
  var sortiesStrict = 0, focusStrictActif = null;
  document.addEventListener('visibilitychange',function(){
    if(document.hidden && focusStrictActif){
      sortiesStrict++;
      var z=focusStrictActif.querySelector('[data-sortie]');
      if(z){z.classList.add('show');z.innerHTML='👀 Tu viens de quitter la page. Ce n\'est pas grave et ce n\'est pas noté — mais ici, l\'exercice n\'a d\'intérêt que si la réponse vient <b>de toi</b>. Reprends avec tes mots.';}
      if(BASE) BASE.journal('sortie_page',{code_activite:focusStrictActif.dataset.focusCode||'?',n:sortiesStrict});
    }
  });

  /* ---------- §7.6 mode focus (flou de page) ---------- */
  var scene=null;
  function ouvrirFocus(champ){
    var titre = champ.dataset.focusTitre||'À toi d\'écrire';
    var question = champ.dataset.focusQuestion||'';
    var max = parseInt(champ.dataset.focusMax||'200',10);
    var min = parseInt(champ.dataset.focusMin||'25',10);
    var strict = champ.dataset.focusStrict==='1';
    var compare = champ.dataset.focusCompare ? memoireReponses[champ.dataset.focusCompare] : null;

    scene=document.createElement('div'); scene.className='focus-scene';
    scene.innerHTML =
      '<div class="focus-carte">'+
        '<div class="fk">✍️ '+titre+(strict?' <span style="color:var(--ink-faint)">· sans recherche</span>':'')+'</div>'+
        '<div class="fq">'+question+'</div>'+
        (compare?'<div style="font-size:13px;color:var(--ink-soft);background:var(--surface-2);border-left:3px solid var(--ink-faint);border-radius:0 9px 9px 0;padding:9px 12px;margin-bottom:10px"><b>Ta 1ʳᵉ tentative :</b> '+echapper(compare)+'</div>':'')+
        '<textarea aria-label="'+titre+'"></textarea>'+
        '<div class="focus-sortie" data-sortie></div>'+
        '<div class="focus-foot">'+
          '<span class="focus-jauge" data-jauge>0 / '+max+' caractères</span>'+
          '<span><button class="btn ghost" data-annuler>Annuler</button> <button class="btn" data-valider disabled>Valider</button></span>'+
        '</div>'+
      '</div>';
    document.body.appendChild(scene);
    document.body.classList.add('focus-on');
    if(strict){ focusStrictActif=champ; champ.dataset.focusCode=champ.dataset.focusCode||''; }

    var ta=scene.querySelector('textarea'), jauge=scene.querySelector('[data-jauge]'), ok=scene.querySelector('[data-valider]');
    scene.querySelector('[data-sortie]').setAttribute('data-sortie','');
    champ._zoneSortie=scene.querySelector('[data-sortie]');
    focusStrictActif = strict ? scene : null;
    ta.focus();
    ['paste','drop'].forEach(function(ev){ta.addEventListener(ev,function(e){
      e.preventDefault();
      jauge.innerHTML='<span style="color:var(--err)">⨯ Copier-coller bloqué — écris-le toi-même</span>';
      setTimeout(compter,1600);
    });});
    function compter(){
      var n=ta.value.trim().length;
      jauge.textContent=n+' / '+max+' caractères';
      jauge.classList.toggle('trop',n>max);
      ok.disabled = n<min || n>max;
      if(n<min) jauge.textContent=n+' / '+max+' caractères · encore '+(min-n)+' pour valider';
    }
    ta.addEventListener('input',compter); compter();
    scene.querySelector('[data-annuler]').addEventListener('click',fermerFocus);

    /* Avertissement avant envoi (audit Loïc, étape 1.1) : la réponse part telle
       quelle et ne sera plus modifiable. Le message est rassurant : rien n'est noté.
       La confirmation vit DANS la carte de focus — la modale globale, elle, passe
       sous le voile flouté. */
    var prevenir = champ.dataset.focusPrevenir === '1';
    ok.addEventListener('click',function(){
      var texte = ta.value.trim();
      if(!prevenir){ validerFocus(champ, texte); return; }
      var carte = scene.querySelector('.focus-carte');
      var av = document.createElement('div');
      av.className = 'focus-avert';
      av.innerHTML = '<b>Un instant : c\'est définitif.</b>'+
        '<p>Une fois envoyée, ta définition est <b>enregistrée telle quelle</b> et tu ne pourras plus la modifier. '+
        'Ce n\'est pas grave&nbsp;: elle <b>n\'est pas notée</b>. Elle sert uniquement à comparer avec la définition '+
        'que tu écriras à la fin de l\'étape — c\'est le chemin parcouru qui compte, pas la première réponse.</p>'+
        '<div class="fa-actions"><button class="btn ghost" data-av-non>Continuer à écrire</button> '+
        '<button class="btn" data-av-oui>Envoyer ma définition</button></div>';
      carte.appendChild(av);
      ok.disabled = true;
      av.querySelector('[data-av-oui]').addEventListener('click',function(){ validerFocus(champ, texte); });
      av.querySelector('[data-av-non]').addEventListener('click',function(){
        av.remove(); ok.disabled = false; ta.focus();
      });
    });
  }
  function fermerFocus(){
    if(scene){scene.remove();scene=null;}
    document.body.classList.remove('focus-on');
    focusStrictActif=null;
  }
  function echapper(t){return String(t).replace(/[<>&]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;'}[c];});}

  var memoireReponses = {};   /* en mémoire JS uniquement — jamais en localStorage */

  function validerFocus(champ, texte){
    var code = champ.dataset.focusCode || '';
    memoireReponses[code] = texte;
    fermerFocus();

    var echo = champ.querySelector('[data-focus-echo]');
    if(echo){ echo.textContent = texte; echo.style.display='block'; }
    var action = champ.querySelector('.gaction'); if(action) action.style.display='none';
    champ.classList.add('rempli');

    var mot = champ.dataset.glossaire || (champ.closest('[data-glossaire]')||{dataset:{}}).dataset.glossaire;
    if(mot) glossaire[mot] = texte;

    /* Envoi en base : la copie part en correction. L'étape est
       validée dès l'ENVOI — le travail est rendu ; la correction,
       elle, arrive plus tard et s'affiche quand elle est là.
       (Sans cela, une séance resterait bloquée jusqu'au passage du
        worker : proposition à valider par Loïc.) */
    if(BASE && code){
      verdict(champ,'wait','⏳ Réponse envoyée. Relecture en cours — ton professeur la verra.');
      var s=stepOf(champ); if(s)s.classList.add('is-wait');
      BASE.envoyerReponse(code, texte).then(function(){
        verdict(champ,'ok','✅ Réponse enregistrée. Tu peux passer à la suite — et aider un camarade bloqué.');
        showReveal(champ); markDone(champ);
      }).catch(function(e){
        verdict(champ,'ok','✅ Réponse gardée pour cette séance. (Enregistrement indisponible : pense à télécharger ta fiche.)');
        showReveal(champ); markDone(champ);
      });
    } else {
      verdict(champ,'ok','✅ Réponse gardée pour cette séance. Pense à <b>télécharger ta fiche</b> en fin de séance.');
      showReveal(champ); markDone(champ);
    }
  }
  document.querySelectorAll('[data-focus-ouvrir]').forEach(function(b){
    b.addEventListener('click',function(){ ouvrirFocus(b.closest('[data-focus]')); });
  });

  /* ---------- Ré-hydratation au chargement (retour de l'élève) ----------
     À l'ouverture de la page, on rappelle les réponses déjà envoyées et,
     si le professeur a VALIDÉ (statut 'corrige'), on affiche son retour dans
     le .verdict du champ. Réutilise verdict()/écho/memoireReponses/glossaire :
     même rendu qu'à l'envoi, aucune logique dupliquée.
     • Balaye les [data-focus-code] présents dans la page → une nouvelle
       question libre posée avec le même patron s'affiche seule, sans toucher ce code.
     • Ne fait rien pour un invité : mesReponses renvoie [] (pas de compte),
       donc aucun retour ne s'affiche (décision : réservé aux élèves connectés).
     • Sécurité : le texte de l'élève reste en textContent (écho) ; seul le
       retour IA/prof, échappé, passe en innerHTML. */
  function classeVerdict(v){
    if(v === 'accepté')     return 'ok';
    if(v === 'à compléter') return 'amb';
    return 'diag';                 /* sans objet / diagnostic */
  }
  function rendreRetour(r){
    var a  = (r.correction_ia && r.correction_ia.analyse) || {};
    var v  = a.verdict || 'sans objet';
    var fe = a.feedback_eleve || {};
    var past = v==='accepté' ? '✓ Accepté' : v==='à compléter' ? '✎ À compléter' : '💭 Bien reçu';
    var html = '<span class="vd-pastille">'+past+'</span>';
    /* Politique : le mot du professeur PRIME. S'il a écrit un commentaire,
       l'élève ne lit que ça (pas de texte IA, pas de ligne de transparence).
       Sinon : le message IA qu'il a validé + la ligne de transparence.
       (Pour montrer les deux à la fois, il suffira d'assouplir ce bloc.) */
    if(r.commentaire_prof && r.commentaire_prof.trim()){
      html += '<p class="vd-msg">'+ echapper(r.commentaire_prof) +'</p>';
    } else {
      html += '<p class="vd-msg">'+ echapper(fe.message || '') +'</p>';
      html += '<p class="vd-ia">✎ Ce retour a d\u2019abord été préparé par une intelligence artificielle '+
              'qui tourne seulement sur l\u2019ordinateur de ton professeur \u2014 c\u2019est ça, «\u00a0locale\u00a0» : '+
              'ta réponse ne part pas sur Internet, elle reste dans la classe. '+
              'Ton professeur l\u2019a ensuite relu et validé.</p>';
    }
    if(fe.pour_aller_plus_loin && fe.pour_aller_plus_loin.trim()){
      html += '<div class="vd-plus"><b>🔭 Pour aller plus loin</b><br>'+ echapper(fe.pour_aller_plus_loin) +'</div>';
    }
    return html;
  }
  function rehydraterReponses(){
    if(!BASE || !BASE.mesReponses) return;
    var codes = [];
    document.querySelectorAll('[data-focus-code]').forEach(function(f){
      var c = f.dataset.focusCode; if(c && codes.indexOf(c) < 0) codes.push(c);
    });
    if(!codes.length) return;
    BASE.mesReponses(codes).then(function(lignes){
      (lignes || []).forEach(function(r){
        var sel = (window.CSS && CSS.escape) ? CSS.escape(r.code_activite) : r.code_activite;
        var champ = document.querySelector('[data-focus-code="' + sel + '"]');
        if(!champ) return;
        /* restaurer la réponse envoyée + les états, comme validerFocus */
        var texte = r.texte || '';
        memoireReponses[r.code_activite] = texte;
        var echo = champ.querySelector('[data-focus-echo]');
        if(echo){ echo.textContent = texte; echo.style.display = 'block'; }
        var action = champ.querySelector('.gaction'); if(action) action.style.display = 'none';
        champ.classList.add('rempli');
        var mot = champ.dataset.glossaire || (champ.closest('[data-glossaire]') || {dataset:{}}).dataset.glossaire;
        if(mot) glossaire[mot] = texte;
        /* le retour, seulement s'il est validé */
        if(r.statut === 'corrige'){
          var verd = (r.correction_ia && r.correction_ia.analyse && r.correction_ia.analyse.verdict) || 'sans objet';
          verdict(champ, classeVerdict(verd), rendreRetour(r));
          markDone(champ);
        } else {
          verdict(champ, 'wait', '⏳ Réponse envoyée. Relecture en cours — ton professeur la verra.');
        }
      });
    }).catch(function(){ /* pas de base / invité : on n'affiche rien */ });
  }
  if(document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', rehydraterReponses);
  else
    rehydraterReponses();

  /* ---------- §7.5 glossaire évolutif ---------- */
  var glossaire = {};
  var MOTS_GLOSSAIRE = ['Internet','protocole','routeur','switch','modem','ADSL'];
  function rendreGlossaire(){
    var hote=document.querySelector('[data-glossaire-final]'); if(!hote) return;
    hote.innerHTML = MOTS_GLOSSAIRE.map(function(m){
      var d=glossaire[m];
      return '<div class="gligne'+(d?'':' vide')+'"><span class="gmot">'+m+'</span><span class="gdef">'+
             (d?echapper(d):'à compléter — remonte dans la séquence')+'</span></div>';
    }).join('');
  }
  rendreGlossaire();
  var _valider=validerFocus;
  validerFocus=function(champ,texte){ _valider(champ,texte); rendreGlossaire(); };

  /* ---------- §7.1 notes du poste d'écoute ---------- */
  document.querySelectorAll('[data-notes]').forEach(function(ta){
    var cle=ta.getAttribute('data-notes'); var t=null;
    ta.addEventListener('input',function(){
      clearTimeout(t);
      t=setTimeout(function(){
        if(BASE) BASE.ecrire('cours','notes-'+cle,{texte:ta.value});
      },1200);   /* on n'écrit pas à chaque frappe */
    });
    if(BASE) BASE.lire('cours','notes-'+cle).then(function(v){ if(v && v.texte && !ta.value) ta.value=v.texte; });
  });

  /* ---------- perso (partage, non noté) ---------- */
  document.querySelectorAll('[data-share]').forEach(function(btn){
    btn.addEventListener('click',function(){
      var box=btn.closest('.perso');var ta=box.querySelector('textarea');var note=box.querySelector('[data-share-note]');
      if(ta.value.trim().length<2){note.textContent='Écris un mot avant de partager 🙂';return;}
      ta.readOnly=true;btn.disabled=true;note.textContent='✅ Merci — ta réponse nourrit la discussion de classe.';
    });
  });

  /* ---------- bonus dépliables ---------- */
  document.querySelectorAll('[data-bonus-toggle]').forEach(function(h){
    h.addEventListener('click',function(){h.closest('[data-bonus]').classList.toggle('open');});
  });

  /* ---------- modal réutilisable ---------- */
  var mb=document.createElement('div'); mb.className='modal-back';
  mb.innerHTML='<div class="modal" role="dialog" aria-modal="true"><div class="m-ico"></div><h3></h3><div class="m-body"></div><div class="m-actions"></div></div>';
  document.body.appendChild(mb);
  function closeModal(){mb.classList.remove('show');}
  mb.addEventListener('click',function(e){if(e.target===mb)closeModal();});
  function openModal(ico,title,bodyHTML,actions){
    mb.querySelector('.m-ico').textContent=ico;
    mb.querySelector('.modal h3').textContent=title;
    mb.querySelector('.m-body').innerHTML=bodyHTML;
    var a=mb.querySelector('.m-actions'); a.innerHTML='';
    actions.forEach(function(act){
      var b=document.createElement('button'); b.className='btn '+(act.cls||''); b.textContent=act.label;
      b.addEventListener('click',function(){ if(act.fn)act.fn(); if(act.close!==false)closeModal(); });
      a.appendChild(b);
    });
    mb.classList.add('show');
  }

  /* ---------- fiche de séance ----------
     Refonte du 21/07/2026 (audit Loïc) :
       · plus de « validé / à faire » : la fiche est un document de travail,
         pas un bulletin ;
       · elle emporte L'ESSENTIEL DU COURS (objectifs, à retenir, repères de
         dates, frise corrigée, vocabulaire) et pas seulement les réponses ;
       · elle s'ouvre dans un onglet avec un bouton « Imprimer / PDF » :
         le PDF sort par « Enregistrer en PDF » du navigateur (spec §13.11),
         sans aucune bibliothèque ni CDN. Repli en téléchargement si l'onglet
         est bloqué par le navigateur. */
  function seanceTitle(sec){var h=sec.querySelector('.seance-head h2');return h?h.textContent.replace(/\s+/g,' ').trim():'Séance';}
  function echapper(t){ return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  /* le contenu de cours d'une étape : objectif, « à retenir », repères */
  function collectEtapes(sec){
    var rows=[];
    sec.querySelectorAll('[data-step]').forEach(function(step){
      var t=step.querySelector('.step-title');
      if(!t) return;
      if(step.querySelector('.bonus-wrap')) return;      /* « pour aller plus loin » : hors fiche */
      var obj=step.querySelector('.objective span:last-child');
      var retenirs=[];
      step.querySelectorAll('.retain').forEach(function(r){
        var c=r.cloneNode(true);
        c.querySelectorAll('.niv,.a-noter,.bulle').forEach(function(x){x.remove();});
        c.querySelectorAll('.plustard').forEach(function(b){ b.replaceWith(document.createTextNode('')); });
        retenirs.push(c.innerHTML.trim());
      });
      var ans=[];
      step.querySelectorAll('[data-focus-echo]').forEach(function(e){ if(e.textContent.trim()) ans.push(e.textContent.trim()); });
      step.querySelectorAll('.perso textarea').forEach(function(ta){ if(ta.value.trim()) ans.push(ta.value.trim()); });
      step.querySelectorAll('.cloze input,.label-selects select').forEach(function(x){ if(x.value&&x.value.trim()) ans.push(x.value.trim()); });
      rows.push({title:t.textContent.trim(), objectif:obj?obj.textContent.replace(/\s+/g,' ').trim():'',
                 retenirs:retenirs, answer:ans.join(' · ')});
    });
    return rows;
  }

  /* les tableaux de repères et la frise corrigée, recopiés tels quels */
  function collectReperes(sec){
    var out=[];
    sec.querySelectorAll('table.doc-table').forEach(function(t){
      var etape=t.closest('[data-step]');
      var ti=etape?etape.querySelector('.step-title'):null;
      var c=t.cloneNode(true);
      c.querySelectorAll('.plustard').forEach(function(b){ b.remove(); });
      out.push({titre:ti?ti.textContent.trim():'Repères', html:c.outerHTML});
    });
    sec.querySelectorAll('.frise').forEach(function(fr){
      out.push({titre:'La frise de l\'histoire d\'Internet', html:fr.outerHTML});
    });
    return out;
  }

  /* le vocabulaire rencontré dans la séance (dictionnaire du poste d'écoute) */
  function collectVocabulaire(sec){
    var out=[];
    sec.querySelectorAll('.poste-dico dl').forEach(function(dl){
      var mot=null;
      Array.prototype.slice.call(dl.children).forEach(function(el){
        if(el.tagName==='DT'){ mot=el.textContent.trim(); return; }
        if(el.tagName==='DD' && mot){ out.push({mot:mot, def:el.innerHTML.trim()}); mot=null; }
      });
    });
    return out;
  }

  /* les deux tentatives de définition, côte à côte */
  function collectDefinitions(sec){
    var out=[];
    sec.querySelectorAll('[data-focus-titre]').forEach(function(fl){
      var titre=fl.getAttribute('data-focus-titre')||'';
      if(!/tentative/i.test(titre)) return;
      var e=fl.querySelector('[data-focus-echo]');
      out.push({titre:titre, texte:e?e.textContent.trim():''});
    });
    return out;
  }
  function collectNotes(sec){
    var out=[];
    sec.querySelectorAll('textarea[data-notes]').forEach(function(ta){
      if(!ta.value.trim()) return;
      var etape=ta.closest('[data-step]');
      var t=etape?etape.querySelector('.step-title'):null;
      out.push({titre:t?t.textContent.trim():'Notes', texte:ta.value.trim()});
    });
    return out;
  }
  function collectQcm(sec){
    var out=[];
    sec.querySelectorAll('.qcm-recap').forEach(function(r){
      if(!r.innerHTML.trim()) return;
      var etape=r.closest('[data-step]');
      var t=etape?etape.querySelector('.step-title'):null;
      out.push({titre:t?t.textContent.trim():'QCM', html:r.innerHTML.trim()});
    });
    return out;
  }
  function collectGlossaire(){ return (window.MON_GLOSSAIRE || []).slice(); }
  function collectSources(sec){
    var vus={}, out=[];
    sec.querySelectorAll('figcaption .src').forEach(function(x){
      var t=x.textContent.replace(/\s+/g,' ').trim();
      if(t && !vus[t]){ vus[t]=1; out.push(t); }
    });
    sec.querySelectorAll('.biblio a[href]').forEach(function(a){
      var t=a.textContent.trim()+' — '+a.getAttribute('href');
      if(!vus[t]){ vus[t]=1; out.push(t); }
    });
    sec.querySelectorAll('.res-item[href]').forEach(function(a){
      var h=a.getAttribute('href');
      if(!h || h==='#') return;
      var ti=a.querySelector('.r-title');
      var t=(ti?ti.textContent.trim():h)+' — '+h;
      if(!vus[t]){ vus[t]=1; out.push(t); }
    });
    return out;
  }

  function ficheHTML(sec){
    var title=seanceTitle(sec);
    var when=new Date().toLocaleDateString('fr-FR');
    var rows=collectEtapes(sec), rep=collectReperes(sec), voc=collectVocabulaire(sec),
        defs=collectDefinitions(sec), notes=collectNotes(sec), qcms=collectQcm(sec),
        glo=collectGlossaire(), src=collectSources(sec);

    var h='';

    /* 1. l'essentiel du cours */
    var essentiel=rows.filter(function(r){return r.retenirs.length;});
    if(essentiel.length){
      h+='<h2>L\'essentiel du cours</h2>';
      essentiel.forEach(function(r){
        h+='<div class="e"><div class="hh">'+echapper(r.title)+'</div>'+
           (r.objectif?'<div class="ob">'+echapper(r.objectif)+'</div>':'')+
           r.retenirs.map(function(x){return '<div class="r"><span class="lbl">À retenir</span>'+x+'</div>';}).join('')+
           '</div>';
      });
    }
    /* 2. repères et frise */
    if(rep.length){
      h+='<h2>Les repères à connaître</h2>';
      rep.forEach(function(r){ h+='<div class="e"><div class="hh">'+echapper(r.titre)+'</div>'+r.html+'</div>'; });
    }
    /* 3. vocabulaire */
    if(voc.length){
      h+='<h2>Le vocabulaire de la séance</h2><dl class="voc">'+
        voc.map(function(v){return '<dt>'+echapper(v.mot)+'</dt><dd>'+v.def+'</dd>';}).join('')+'</dl>';
    }
    /* 4. les deux définitions */
    if(defs.length){
      h+='<h2>Ma définition d\'Internet, avant et après</h2><div class="duo">'+
        defs.map(function(x){
          return '<div class="col"><span class="lbl">'+echapper(x.titre)+'</span>'+
                 (x.texte?echapper(x.texte):'<i>non rédigée</i>')+'</div>';
        }).join('')+'</div>';
    }
    /* 5. mes réponses */
    var avec=rows.filter(function(r){return r.answer;});
    if(avec.length){
      h+='<h2>Mes réponses</h2>';
      avec.forEach(function(r){
        h+='<div class="e"><div class="hh">'+echapper(r.title)+'</div>'+
           '<div class="a">'+echapper(r.answer)+'</div></div>';
      });
    }
    /* 6. notes, QCM, glossaire, sources */
    if(notes.length){
      h+='<h2>Mes notes</h2>'+notes.map(function(n2){
        return '<div class="e"><div class="hh">'+echapper(n2.titre)+'</div><div class="a">'+echapper(n2.texte)+'</div></div>';
      }).join('');
    }
    if(qcms.length){
      h+='<h2>Les bonnes réponses des QCM</h2>'+qcms.map(function(q){
        return '<div class="e"><div class="hh">'+echapper(q.titre)+'</div><div class="q">'+q.html+'</div></div>';
      }).join('');
    }
    if(glo.length){
      h+='<h2>Mon glossaire</h2>'+glo.map(function(g){
        return '<div class="e"><div class="hh">'+echapper(g.mot)+'</div><div class="a">'+echapper(g.texte)+'</div></div>';
      }).join('');
    }
    if(src.length){
      h+='<h2>Sources des documents</h2><ul class="src">'+
        src.map(function(x){ return '<li>'+echapper(x)+'</li>'; }).join('')+'</ul>';
    }

    var css=
      'body{font-family:system-ui,sans-serif;max-width:760px;margin:26px auto;padding:0 18px;color:#161f33;line-height:1.55}'+
      'h1{font-size:22px;margin-bottom:2px}.meta{color:#667;font-size:13px;margin-bottom:8px}'+
      '.ident{font-size:13px;color:#4a566e;border:1px dashed #b9c3d4;border-radius:9px;padding:8px 11px;margin-bottom:18px}'+
      '.barre{display:flex;gap:9px;flex-wrap:wrap;margin-bottom:18px}'+
      '.barre button{font:inherit;font-size:14px;cursor:pointer;border:1.5px solid #161f33;background:#161f33;color:#fff;border-radius:9px;padding:8px 15px}'+
      '.barre .g{background:#fff;color:#161f33}'+
      '.aide{font-size:12.5px;color:#8b97ad;margin-bottom:20px}'+
      'h2{font-size:15px;margin:26px 0 10px;padding-bottom:5px;border-bottom:2px solid #161f33}'+
      '.e{border:1px solid #d3dae7;border-radius:10px;padding:12px 14px;margin-bottom:10px;page-break-inside:avoid}'+
      '.hh{font-weight:600}.ob{font-size:13px;color:#4a566e;margin-top:3px}'+
      '.lbl{display:block;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#8b97ad;margin-bottom:3px}'+
      '.r{margin-top:8px;padding:9px 11px;background:#f4f6fb;border-left:3px solid #161f33;border-radius:0 8px 8px 0;font-size:13.5px}'+
      '.r code{background:#e6e9f2;padding:1px 4px;border-radius:3px;font-family:ui-monospace,monospace;font-size:.9em}'+
      '.a{margin-top:8px;padding:9px 11px;background:#e7ebfb;border-radius:8px;white-space:pre-wrap;font-size:14px}'+
      'table{border-collapse:collapse;width:100%;font-size:13px;margin-top:8px}'+
      'th,td{border:1px solid #d3dae7;padding:5px 8px;text-align:left;vertical-align:top}'+
      'th{background:#f4f6fb;font-size:12px}'+
      '.frise{margin-top:8px}.frise .ev{display:flex;gap:10px;padding:5px 0;border-bottom:1px solid #eef1f7;font-size:13.5px}'+
      '.frise .ev:last-child{border-bottom:0}'+
      '.frise .an{font-family:ui-monospace,monospace;font-weight:600;min-width:52px;color:#4a566e}'+
      '.frise .ev.cle .an{color:#1b3391}.frise .ev.cle{background:#f4f6fb}'+
      '.frise-leg{display:none}'+
      'dl.voc dt{font-weight:600;font-size:13.5px;margin-top:7px}dl.voc dd{margin:0;font-size:13.5px;color:#4a566e}'+
      '.duo{display:flex;gap:12px;flex-wrap:wrap}.duo .col{flex:1 1 260px;border:1px solid #d3dae7;'+
      'border-radius:10px;padding:11px 13px;font-size:14px;background:#fbfcfe}'+
      '.q{margin-top:8px;font-size:13.5px}.q .rh{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#8b97ad}'+
      '.q .rl{padding:5px 0;border-bottom:1px solid #eef1f7}.q .rl:last-child{border-bottom:0}'+
      '.q .comp{display:block;font-size:12.5px;color:#4a566e;margin-top:2px}'+
      'ul.src{font-size:12.5px;color:#4a566e;padding-left:18px}ul.src li{margin-bottom:4px}'+
      '@page{size:A4;margin:14mm 12mm}'+
      '@media print{.barre,.aide{display:none}body{margin:0;max-width:none;font-size:11.5pt}'+
      'h2{page-break-after:avoid}.e{page-break-inside:avoid}}';

    return '<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8">'+
      '<title>Ma fiche — '+echapper(title)+'</title><style>'+css+'</style></head><body>'+
      '<h1>Ma fiche SNT — '+echapper(title)+'</h1>'+
      '<div class="meta">Séquence Internet · éditée le '+when+'</div>'+
      '<div class="ident">Nom : ............................................. &nbsp; '+
      'Prénom : ............................................. &nbsp; Classe : ....................</div>'+
      '<div class="barre"><button onclick="window.print()">🖨️ Imprimer / Enregistrer en PDF</button>'+
      '<button class="g" onclick="window.close()">Fermer</button></div>'+
      '<p class="aide">Pour obtenir un PDF : clique sur le bouton, puis choisis « Enregistrer au format PDF » '+
      'comme imprimante. Dépose ensuite le fichier sur ton OneDrive.</p>'+
      h+'</body></html>';
  }

  function downloadFiche(sec){
    var html=ficheHTML(sec);
    var w=null;
    try{ w=window.open('','_blank'); }catch(e){ w=null; }
    if(w && w.document){
      w.document.open(); w.document.write(html); w.document.close();
      try{ w.focus(); }catch(e){}
      return;
    }
    /* onglet bloqué : on retombe sur un fichier, ouvrable puis imprimable */
    var title=seanceTitle(sec);
    var blob=new Blob([html],{type:'text/html'});
    var url=URL.createObjectURL(blob); var a=document.createElement('a');
    var slug=title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40);
    a.href=url; a.download='ma-fiche-'+(slug||'snt')+'.html';
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  }

  /* ---------- recommencer une séance ---------- */
  function resetSeance(sec){
    sec.querySelectorAll('[data-step]').forEach(function(s){s.classList.remove('is-done','is-wait');
      var p=s.querySelector('.step-pip'); if(p){p.style.background='';p.style.borderColor='';}});
    sec.querySelectorAll('.opt').forEach(function(o){o.disabled=false;o.classList.remove('correct','wrong');});
    sec.querySelectorAll('textarea').forEach(function(t){t.value='';t.readOnly=false;});
    sec.querySelectorAll('.cloze input').forEach(function(i){i.value='';i.classList.remove('ok','no','juste','presque','revoir');});
    sec.querySelectorAll('.cloze select').forEach(function(s){s.selectedIndex=0;s.classList.remove('juste','presque','revoir');});
    sec.querySelectorAll('[data-depot-apercu]').forEach(function(a){a.innerHTML='';});
    sec.querySelectorAll('[data-bilan-wrap]').forEach(function(b){b.hidden=true;});
    sec.querySelectorAll('.cloze-msg').forEach(function(m){m.innerHTML='';});
    sec.querySelectorAll('.indice').forEach(function(b){b.disabled=false;b.dataset.niveau='0';});
    sec.querySelectorAll('.indice-txt').forEach(function(z){z.style.display='none';z.textContent='';});
    sec.querySelectorAll('.qcm-recap').forEach(function(r){r.innerHTML='';r.style.display='none';});
    sec.querySelectorAll('.qcm-lanceur button').forEach(function(b){b.textContent='Commencer';});
    sec.querySelectorAll('.qcm-fait').forEach(function(c){c.remove();});
    sec.querySelectorAll('.qcm-consigne').forEach(function(c){c.style.display='';});
    sec.querySelectorAll('[data-focus]').forEach(function(f){
      f.classList.remove('rempli');
      var e=f.querySelector('[data-focus-echo]'); if(e){e.textContent='';e.style.display='';}
      var a=f.querySelector('.gaction'); if(a)a.style.display='';
      var z=f.querySelector('[data-sortie]'); if(z){z.classList.remove('show');z.innerHTML='';}
    });
    sec.querySelectorAll('.osi-drag li,.tri-drag li').forEach(function(li){li.classList.remove('bon','mauvais','survol','en-cours');});
    sec.querySelectorAll('[data-tri-verdict]').forEach(function(v){v.textContent='';v.style.color='';});
    /* scores gardés en dataset pour la vue enseignant : ils repartent aussi */
    sec.querySelectorAll('[data-step]').forEach(function(s){delete s.dataset.qcmScore;delete s.dataset.clozeScore;});
    sec.querySelectorAll('.label-selects select').forEach(function(s){s.value='';s.classList.remove('ok','no');});
    sec.querySelectorAll('.verdict').forEach(function(v){v.className='verdict';v.textContent='';});
    sec.querySelectorAll('[data-reveal]').forEach(function(r){r.classList.remove('show');});
    sec.querySelectorAll('[data-send-free]').forEach(function(b){b.disabled=true;});
    sec.querySelectorAll('[data-share]').forEach(function(b){b.disabled=false;});
    sec.querySelectorAll('[data-share-note]').forEach(function(n){n.textContent='';});
    var id=sec.getAttribute('data-seance'); seanceWasComplete[id]=false;
    /* Recommencer, c'est aussi effacer en base : sans cette purge, le
       rechargement suivant ressusciterait tout le travail effacé
       (l'état, et le contenu des textes à trous). */
    sec.querySelectorAll('[data-step]').forEach(function(s){
      delete s.dataset.triScore; delete s.dataset.dejaVu;
      if(window.EtatSNT) EtatSNT.oublier(s);
    });
    refresh();
  }

  /* barre d'actions (télécharger / recommencer) à la fin de chaque séance à valider */
  document.querySelectorAll('.seance').forEach(function(sec){
    if(!sec.querySelector('[data-gate]')) return;
    var host=sec.querySelector('.lockable'); if(!host) return;
    var bar=document.createElement('div'); bar.className='seance-actions';
    bar.innerHTML='<span class="sa-label">💾 Ta fiche s\'ouvre dans un onglet : imprime-la, ou enregistre-la en PDF, puis dépose-la sur ton OneDrive.</span>';
    var dl=document.createElement('button'); dl.className='btn dl sm'; dl.textContent='📄 Ouvrir ma fiche (PDF)';
    dl.addEventListener('click',function(){downloadFiche(sec);});
    var rs=document.createElement('button'); rs.className='btn reset sm'; rs.textContent='🔁 Recommencer';
    rs.addEventListener('click',function(){
      openModal('🔁','Recommencer cette séance ?',
        '<p>Tu vas repartir d\'une fiche vierge pour cette séance. Tes réponses actuelles seront effacées de l\'écran.<br><b>Ouvre et enregistre d\'abord ta fiche</b> si tu veux garder tes réponses et tes corrections.</p>',
        [{label:'📄 Ouvrir ma fiche d\'abord',cls:'dl',close:false,fn:function(){downloadFiche(sec);}},
         {label:'Recommencer',cls:'reset',fn:function(){resetSeance(sec);}}]);
    });
    bar.appendChild(dl); bar.appendChild(rs); host.appendChild(bar);
  });

  /* pop-up de fin de séance */
  function onSeanceComplete(sec){
    var title=seanceTitle(sec);
    var rows=[]; sec.querySelectorAll('[data-step].is-done .step-title').forEach(function(t){rows.push(t.textContent.trim());});
    var recap='<div class="recap">'+rows.map(function(t){return '<div class="ri"><span>'+t+'</span><b>✓</b></div>';}).join('')+'</div>';
    openModal('🎉','Séance terminée — bravo !',
      recap+'<p style="margin-top:2px">Tu as validé toute la séance. Ouvre ta fiche, enregistre-la en PDF, puis dépose-la sur ton OneDrive.</p>',
      [{label:'📄 Ouvrir ma fiche (PDF)',cls:'dl',close:false,fn:function(){downloadFiche(sec);}},
       {label:'Continuer',cls:'ghost'}]);
  }

  refresh();
})();

/* ============================================================
   MOTEURS V2 — arbitrages Loïc du 21/07/2026
   Ce bloc s'ajoute au JS d'origine sans le remplacer.
   Aucune donnée en localStorage : tout vit en mémoire, et part
   en base via progression.js pour les réponses rédigées.
   ============================================================ */
(function(){
'use strict';
var $  = function(s,r){return (r||document).querySelector(s);};
var $$ = function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));};

/* ---------- 0. Utilitaires ---------- */
function normaliser(t){
  return (t||'').toString().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')     // accents
    .replace(/[’']/g,' ').replace(/[^a-z0-9]+/g,' ')      // ponctuation, tirets
    .replace(/\b(le|la|les|l|un|une|des|du|de|d|the)\b/g,' ')
    .replace(/\s+/g,' ').trim();
}
function distance(a,b){                                    // Levenshtein
  if(a===b) return 0;
  var m=a.length,n=b.length,i,j,prev=[],cur=[];
  if(!m) return n; if(!n) return m;
  for(j=0;j<=n;j++) prev[j]=j;
  for(i=1;i<=m;i++){
    cur[0]=i;
    for(j=1;j<=n;j++){
      cur[j]=Math.min(prev[j]+1,cur[j-1]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));
    }
    prev=cur.slice();
  }
  return prev[n];
}
function seuil(mot){
  /* Aucune tolérance là où une faute d'une lettre change la réponse :
     dates, nombres, et lettres de table de routage. */
  if(/^[0-9]+$/.test(mot)) return 0;
  if(mot.length<=4) return 0;
  return mot.length<=7?1:2;
}

/* ---------- 1. Révélation séquentielle des étapes ---------- */
function initReveal(){
  $$('.seance').forEach(function(sec){
    var pas=$$('.step',sec);
    if(pas.length<2) return;
    pas.forEach(function(p,i){ if(i>0) p.classList.add('masque'); });
    var bt=document.createElement('div');
    bt.className='step-suivant';
    bt.innerHTML='<button type="button">Étape suivante ↓</button>';
    var dernier=pas[pas.length-1];
    dernier.parentNode.insertBefore(bt, dernier.nextSibling);
    bt.querySelector('button').addEventListener('click',function(){
      var cache=$$('.step.masque',sec);
      if(!cache.length) return;
      cache[0].classList.remove('masque');
      cache[0].scrollIntoView({behavior:'smooth',block:'start'});
      if(cache.length===1) bt.style.display='none';
      majBarre();
    });
    sec.dataset.reveal='1';
  });
}
/* le mode enseignant ouvre tout d'un coup */
function toutRevel(on){
  $$('.step').forEach(function(p){ p.classList.toggle('masque',!on && p.dataset.dejaVu!=='1'); });
  if(on) $$('.step').forEach(function(p){ p.classList.remove('masque'); });
  $$('.step-suivant').forEach(function(b){ b.style.display=on?'none':'flex'; });
}

/* ---------- 1bis. Compteur d'étapes des séances repliées ---------- */
function compteurSeances(){
  $$('.seance').forEach(function(sec){
    var ban=$('.lock-banner',sec); if(!ban || $('.compte',ban)) return;
    var n=$$('.step',sec).length;
    var e=document.createElement('span'); e.className='compte';
    e.textContent=n+' étape'+(n>1?'s':'');
    ban.appendChild(e);
  });
}

/* ---------- 1ter. Échelle d'évaluabilité (spec §13.2) ----------
   ★★ à savoir · ★ à savoir faire · ○ support · ✦ bonus · — non évalué.
   Le niveau se déduit de la nature du bloc ; data-niv permet de forcer. */
var NIVEAUX={
  savoir:      {m:'★★', l:'à savoir'},
  faire:       {m:'★',  l:'à savoir faire'},
  support:     {m:'○',  l:'support'},
  bonus:       {m:'✦',  l:'bonus'},
  nonevalue:   {m:'—',  l:'non évalué'}
};
function etiquetteNiveau(cle){
  var n=NIVEAUX[cle]; if(!n) return null;
  var e=document.createElement('span');
  e.className='niv niv-auto'; e.dataset.niveau=cle;
  e.innerHTML=n.m+' <b>'+n.l+'</b>';
  return e;
}
function niveauDeBloc(el){
  if(el.dataset.niv) return el.dataset.niv;
  if(el.classList.contains('retain')) return 'savoir';
  if(el.classList.contains('glosmot')) return 'savoir';
  if(el.classList.contains('france-box')) return 'bonus';
  if(el.classList.contains('bonus-wrap')) return 'bonus';
  if(el.classList.contains('perso-box')) return 'nonevalue';
  if(el.classList.contains('poste')) return 'support';
  if(el.classList.contains('qcmbox')) return 'faire';
  if(el.classList.contains('field')) return 'faire';
  if(el.classList.contains('doc-table')) return 'support';
  return null;
}
function initEvaluabilite(){
  /* 1. les intitulés de bloc portent déjà la grammaire de la séquence */
  $$('.block-label').forEach(function(lab){
    if($('.niv',lab)) return;
    if(lab.closest('.bonus-wrap')) return;
    var t=lab.textContent.toLowerCase(), cle=null;
    if(/^doc|illustration|vidéo|video|podcast|schéma|schema|ressource/.test(t)) cle='support';
    else if(/à retenir|a retenir/.test(t)) cle='savoir';
    else if(/vocabulaire|glossaire|dictionnaire/.test(t)) cle='savoir';
    else if(/exercice|vérifie|verifie|associe|fais glisser|remets|complète|complete|entraîne|entraine|teste/.test(t)) cle='faire';
    if(cle){ var e=etiquetteNiveau(cle); if(e){ e.style.marginLeft='8px'; lab.appendChild(e); } }
  });
  /* 2. les blocs sans intitulé reçoivent une pastille dans leur coin */
  $$('.retain,.glosmot,.france-box,.bonus-wrap,.perso-box,.poste,.qcmbox,.field').forEach(function(el){
    if($('.niv',el)) return;
    if(el.previousElementSibling && el.previousElementSibling.classList &&
       el.previousElementSibling.classList.contains('block-label') &&
       $('.niv',el.previousElementSibling)) return;
    var cle=niveauDeBloc(el); if(!cle) return;
    var e=etiquetteNiveau(cle); if(!e) return;
    /* Audit Loïc : sur un bloc repliable, la pastille collée en bas était mal
       placée dans les deux états (repliée : invisible ; dépliée : orpheline).
       Sur les « pour aller plus loin », l'en-tête porte déjà « hors 100 % » :
       une seule mention suffit, on n'ajoute rien. */
    if(el.querySelector('.bonus-head')) return;
    /* et rien non plus à l'intérieur d'un « pour aller plus loin » : l'en-tête
       du bloc dit déjà « hors 100 % », le reste ne ferait que se répéter. */
    if(el.closest('.bonus-wrap')) return;
    e.classList.add('niv-coin');
    el.style.position=el.style.position||'relative';
    el.appendChild(e);
  });
}

/* ---------- 2. Barre de progression latérale ---------- */
var BARRE=null;
function construireBarre(){
  var box=document.createElement('nav');
  box.id='prog'; box.setAttribute('aria-label','Ma progression');
  var h='<div class="ph"><span class="t">Ma progression</span><span class="pct">0 %</span>'+
        '<button class="reduire" type="button" title="Réduire">⇤</button></div>';
  function esc(x){ return String(x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function propre(n){ return n?n.textContent.replace(/\s+/g,' ').trim():''; }
  $$('.seance').forEach(function(sec){
    /* libellé de séance : le .s-num est isolé du titre (sinon « S1C'est quoi… ») */
    var titre=$('.seance-head h2',sec), num='', reste='Séance';
    if(titre){
      var sn=$('.s-num',titre);
      num = sn?propre(sn):'';
      var c=titre.cloneNode(true), sn2=$('.s-num',c);
      if(sn2) sn2.remove();
      reste = propre(c) || 'Séance';
    }
    h+='<div class="grp">'+(num?'<span class="sn">'+esc(num)+'</span>':'')+esc(reste)+'</div>';
    $$('.step',sec).forEach(function(p,i){
      if(!p.id) p.id='et-'+sec.id+'-'+i;
      /* index repris du kicker (« ÉTAPE 1.3 » → « 1.3 ») */
      var k=propre($('.step-kicker',p)||$('.ix',p)), mi=k.match(/([0-9D]+\.[0-9]+)/), ix=mi?mi[1]:'';
      /* nom : .step-title, à défaut le bandeau .fl / .pl du bloc */
      var lab=propre($('.step-title',p));
      if(!lab){
        var b=propre($('.fl',p)||$('.pl',p)||$('.bl',p));
        lab = b ? b.split('·')[0].split('—')[0].trim() : 'Étape';
      }
      var d=p.dataset.echeance||'';
      h+='<a class="it" href="#'+p.id+'" data-cible="'+p.id+'">'+
         '<span class="pip2"></span><span class="txt">'+
         (ix?'<span class="ix">'+esc(ix)+'</span>':'')+esc(lab)+
         (d?'<span class="date">'+esc(d)+'</span>':'')+'</span></a>';
    });
  });
  box.innerHTML=h;
  document.body.appendChild(box);
  box.querySelector('.reduire').addEventListener('click',function(){
    document.body.classList.add('prog-reduit');
  });

  var b4=document.createElement('div');
  b4.id='prog4';
  b4.innerHTML='<span class="t">Progression</span><span class="bar"><i></i></span>'+
               '<span class="now"></span><span class="pct">0 %</span>'+
               '<button class="rouvrir" type="button" title="Rouvrir le sommaire">⇥</button>';
  var anc=$('.wrap');
  if(anc&&anc.parentNode) anc.parentNode.insertBefore(b4,anc);
  b4.querySelector('.rouvrir').addEventListener('click',function(){
    document.body.classList.remove('prog-reduit');
  });
  BARRE=box;
  if(window.matchMedia('(max-width:1180px)').matches) document.body.classList.add('prog-reduit');
  majBarre();
}
function majBarre(){
  if(!BARRE) return;
  var pas=$$('.step'), faits=0, courant=null;
  pas.forEach(function(p){
    var lien=BARRE.querySelector('[data-cible="'+p.id+'"]');
    if(!lien) return;
    lien.classList.remove('done','wait','cur','locked');
    if(p.classList.contains('is-done')){ lien.classList.add('done'); lien.querySelector('.pip2').textContent='✓'; faits++; }
    else if(p.classList.contains('is-wait')){ lien.classList.add('wait'); lien.querySelector('.pip2').textContent='…'; }
    else if(p.classList.contains('masque')){ lien.classList.add('locked'); lien.querySelector('.pip2').textContent=''; }
    else { if(!courant){ lien.classList.add('cur'); courant=p; } lien.querySelector('.pip2').textContent=''; }
  });
  var pc=pas.length?Math.round(faits*100/pas.length):0;
  $$('#prog .pct,#prog4 .pct').forEach(function(e){ e.textContent=pc+' %'; });
  var jauge=$('#prog4 .bar i'); if(jauge) jauge.style.width=pc+'%';
  var now=$('#prog4 .now');
  if(now){
    var lien=courant?BARRE.querySelector('[data-cible="'+courant.id+'"] .txt'):null;
    if(!lien){ now.textContent=''; }
    else{
      var c=lien.cloneNode(true), ixe=c.querySelector('.ix'), dte=c.querySelector('.date');
      var ix=ixe?ixe.textContent.trim():''; if(ixe) ixe.remove(); if(dte) dte.remove();
      var nom=c.textContent.replace(/\s+/g,' ').trim();
      now.textContent='en cours : '+(ix?ix+' — ':'')+nom;
    }
  }
}

/* ---------- 3. Mode enseignant : code + minuterie 30 min ---------- */
/* Empreinte SHA-256 du code enseignant.
   NE JAMAIS écrire le code en clair ici : le dépôt est public, un Ctrl+F
   suffirait. Le code se note hors dépôt (carnet, gestionnaire de mots de
   passe). Pour en changer : ouvrir la console du navigateur et coller
     sha256('NOUVEAU-CODE').then(console.log)
   puis remplacer l'empreinte ci-dessous par le résultat.                */
var EMPREINTE='4133f80c1eddc09fcd700c562457ea83cc0562f8a1e49b8fc1aabfaec3c6cdea';
var minuteur=null;
function sha256(txt){
  if(!window.crypto||!crypto.subtle) return Promise.resolve(null);
  return crypto.subtle.digest('SHA-256',new TextEncoder().encode(txt)).then(function(buf){
    return Array.prototype.map.call(new Uint8Array(buf),function(b){
      return ('00'+b.toString(16)).slice(-2);
    }).join('');
  });
}
function activerEnseignant(minutes){
  document.body.classList.add('teacher');
  var cb=$('#teacherMode'); if(cb&&!cb.checked){ cb.checked=true; cb.dispatchEvent(new Event('change')); }
  toutRevel(true);
  var reste=minutes*60, aff=$('.ens-actif .chrono');
  clearInterval(minuteur);
  minuteur=setInterval(function(){
    reste--;
    if(aff) aff.textContent=Math.floor(reste/60)+':'+('0'+(reste%60)).slice(-2);
    if(reste<=0) couperEnseignant();
  },1000);
  if(aff) aff.textContent=minutes+':00';
}
function couperEnseignant(){
  clearInterval(minuteur);
  document.body.classList.remove('teacher');
  var cb=$('#teacherMode'); if(cb&&cb.checked){ cb.checked=false; cb.dispatchEvent(new Event('change')); }
}
function initEnseignant(){
  var zone=$('.ens-zone'); if(!zone) return;
  $('.ens-btn',zone).addEventListener('click',function(){
    if(document.body.classList.contains('teacher')){ couperEnseignant(); return; }
    var code=window.prompt('Code enseignant :');
    if(!code) return;
    sha256(code.trim().toUpperCase()).then(function(h){
      if(h===null){ alert("Le code ne peut être vérifié que sur une page servie en https."); return; }
      if(h===EMPREINTE) activerEnseignant(30);
      else alert('Code incorrect.');
    });
  });
  var st=$('.ens-actif .stop'); if(st) st.addEventListener('click',couperEnseignant);
}

/* ---------- 4. Moteur QCM plein écran ---------- */
var fondQcm=null;
function initQcm(){
  fondQcm=document.createElement('div');
  fondQcm.className='qcm-back';
  fondQcm.innerHTML='<div class="qcm-panel" role="dialog" aria-modal="true"></div>';
  document.body.appendChild(fondQcm);

  $$('.qcmbox').forEach(function(box){
    var data;
    try{ data=JSON.parse($('script.qcm-data',box).textContent); }catch(e){ return; }
    var lanceur=document.createElement('div');
    lanceur.className='qcm-lanceur';
    lanceur.innerHTML='<span class="ql">✍️ QCM · '+data.length+(data.length>1?' questions':' question')+'</span>'+
                      '<span class="qcm-consigne" style="font-size:13.5px;color:#8a4c0c">Obligatoire pour valider l\'étape.</span>'+
                      '<button type="button">Commencer</button>';
    box.appendChild(lanceur);
    var recap=document.createElement('div'); recap.className='qcm-recap'; recap.style.display='none';
    box.appendChild(recap);
    lanceur.querySelector('button').addEventListener('click',function(){
      jouerQcm(data,box,recap,lanceur);
    });
  });
}
function jouerQcm(data,box,recap,lanceur){
  var i=0, resultats=[];
  /* PAS focus-on ici : sa règle de flou visait aussi .qcm-back, qui devenait
     illisible et incliquable. Le panneau a déjà son propre voile
     (backdrop-filter). qcm-on ne sert qu'à masquer les éléments flottants. */
  document.body.classList.add('qcm-on');
  fondQcm.classList.add('on');
  var pan=$('.qcm-panel',fondQcm);
  function dessiner(){
    var q=data[i];
    var dots=data.map(function(_,k){
      var c=resultats[k]?(resultats[k].bon?'ok':'ko'):'';
      return '<i class="'+c+(k===i?' cur':'')+'"></i>';
    }).join('');
    pan.innerHTML='<div class="qtop"><span class="qn">Question '+(i+1)+' / '+data.length+
      '</span><span class="qdots">'+dots+'</span>'+
      '<button type="button" class="qclose" aria-label="Abandonner le QCM : rien ne sera validé">'+
      '✕ <span>abandonner</span></button>'+
      '</div><h4>'+q.q+'</h4><div class="qzone"></div>';
    $('.qclose',pan).addEventListener('click',abandonner);
    var zone=$('.qzone',pan);
    q.o.forEach(function(txt,k){
      var b=document.createElement('button');
      b.type='button'; b.className='qopt'; b.textContent=txt;
      b.addEventListener('click',function(){ repondre(k); });
      zone.appendChild(b);
    });
  }
  function repondre(k){
    var q=data[i], bon=(k===q.r);
    resultats[i]={bon:bon,choix:k};
    $$('.qopt',pan).forEach(function(b,n){
      b.disabled=true;
      if(n===q.r) b.classList.add('bon');
      else if(n===k) b.classList.add('mauvais');
    });
    var f=document.createElement('div');
    f.className='qfeed';
    f.innerHTML=(bon?'<b>Bonne réponse.</b> ':'<b>La bonne réponse était : '+q.o[q.r]+'.</b> ')+(q.c||'');
    pan.appendChild(f);
    var act=document.createElement('div');
    act.className='qact';
    act.innerHTML='<button type="button">'+(i<data.length-1?'Question suivante →':'Terminer')+'</button>';
    pan.appendChild(act);
    act.querySelector('button').addEventListener('click',function(){
      if(i<data.length-1){ i++; dessiner(); }
      else terminer();
    });
  }
  function abandonner(){
    /* sortie sans validation : rien n'est enregistré, l'étape reste à faire */
    fondQcm.classList.remove('on');
    document.body.classList.remove('qcm-on');
    pan.innerHTML='';
  }
  fondQcm._abandonner = abandonner;
  function terminer(){
    fondQcm.classList.remove('on');
    document.body.classList.remove('qcm-on');
    var n=resultats.filter(function(r){return r.bon;}).length;
    var h='<div class="rh">Récapitulatif — '+n+' / '+data.length+' bonnes réponses</div>';
    data.forEach(function(q,k){
      h+='<div class="rl">'+q.q+'<br><b>'+q.o[q.r]+'</b>'+(q.c?'<span class="comp">'+q.c+'</span>':'')+'</div>';
    });
    recap.innerHTML=h; recap.style.display='block';
    lanceur.querySelector('button').textContent='Refaire le QCM';
    /* validation À L'ENVOI : le QCM fait est le QCM validé, juste ou faux */
    var etape=box.closest('.step');
    if(etape){
      etape.classList.add('is-done');
      etape.dataset.qcmScore=n+'/'+data.length;
      etape.dispatchEvent(new CustomEvent('etape-validee',{bubbles:true}));
    }
    majBarre();
  }
  dessiner();
}

/* --- Trous : lire, réécrire, et la clé sous laquelle on les range.
       Le bloc n'a pas de code propre : sa clé est celle de l'étape,
       suffixée par son rang parmi les blocs à trous de cette étape.
       Même réserve que pour les étapes : clé positionnelle. --- */
function clozeChamps(bloc){
  return Array.prototype.slice.call(bloc.querySelectorAll('input[data-answer],select[data-answer]'));
}
function clozeLire(bloc){
  return clozeChamps(bloc).map(function(e){ return e.value; });
}
function clozeEcrire(bloc,valeurs){
  clozeChamps(bloc).forEach(function(e,i){ if(i<valeurs.length) e.value=valeurs[i]; });
}
function clozeCle(bloc){
  if(!window.EtatSNT || !EtatSNT.actif()) return null;
  var step=bloc.closest('.step'); if(!step) return null;
  var k=EtatSNT.cle(step); if(!k) return null;
  var freres=step.querySelectorAll('.cloze');
  return k+'/cloze-'+Array.prototype.indexOf.call(freres,bloc);
}

/* ---------- 5. Trous tolérants (3 états + indices) ---------- */
function initCloze(){
  $$('.cloze').forEach(function(bloc){
    /* le bouton Vérifier est un FRÈRE du bloc .cloze (il vit dans le .field),
       pas un descendant : le chercher dans le bloc renvoyait toujours null. */
    var conteneur = bloc.closest('.field') || bloc.parentElement;
    var btn = conteneur ? conteneur.querySelector('[data-check-cloze]') : null;
    if(btn){ var neuf=btn.cloneNode(true); btn.parentNode.replaceChild(neuf,btn); btn=neuf; }
    var msg=document.createElement('div'); msg.className='cloze-msg'; bloc.appendChild(msg);

    $$('input[data-answer]',bloc).forEach(function(inp){
      if(!inp.dataset.indice1) return;
      var b=document.createElement('button');
      b.type='button'; b.className='indice'; b.textContent='indice';
      b.dataset.niveau='0';
      /* Audit Loïc : aucun indice tant que l'élève n'a pas tenté sa chance, puis
         seulement en face des trous faux. Le bouton est créé mais masqué. */
      b.hidden = true;
      var zone=document.createElement('span'); zone.className='indice-txt'; zone.style.display='none';
      inp._indiceBtn = b; inp._indiceZone = zone;
      inp.insertAdjacentElement('afterend',b);
      b.insertAdjacentElement('afterend',zone);
      b.addEventListener('click',function(){
        var n=parseInt(b.dataset.niveau,10)+1;
        var t=inp.dataset['indice'+n];
        if(!t){ b.disabled=true; return; }
        b.dataset.niveau=n; zone.style.display='block'; zone.textContent=t;
        if(!inp.dataset['indice'+(n+1)]) b.disabled=true;
      });
    });

    if(!btn) return;
    btn.addEventListener('click',function(){
      /* Instantané AVANT correction : le moteur réécrit la valeur des
         réponses « presque » avec la bonne orthographe. Capturer après
         ferait perdre à l'élève, au retour, le message qui lui signale
         sa faute — signalée, jamais sanctionnée (décision du 21/07). */
      var kChamp=clozeCle(bloc);
      if(kChamp && window.EtatSNT) EtatSNT.noterChamps(kChamp, clozeLire(bloc));
      var n=0,ok=0,presque=0,fautes=[];
      $$('input[data-answer]',bloc).forEach(function(inp){
        n++;
        inp.classList.remove('juste','presque','revoir');
        var saisi=normaliser(inp.value);
        if(!saisi){ inp.classList.add('revoir'); return; }
        var att=[inp.dataset.answer].concat((inp.dataset.variantes||'').split('|'))
                 .map(normaliser).filter(Boolean);
        var exact=att.indexOf(saisi)>=0;
        var proche=!exact && att.some(function(a){ return distance(saisi,a)<=seuil(a); });
        if(exact){ inp.classList.add('juste'); ok++; }
        else if(proche){
          inp.classList.add('presque'); ok++; presque++;
          fautes.push(inp.dataset.answer);
          inp.value=inp.dataset.answer;
        }
        else inp.classList.add('revoir');
        /* l'indice n'apparaît qu'après cette vérification, et uniquement si c'est faux */
        if(inp._indiceBtn){
          var faux = inp.classList.contains('revoir');
          inp._indiceBtn.hidden = !faux;
          if(!faux && inp._indiceZone) inp._indiceZone.style.display='none';
        }
      });
      /* trous en menu déroulant : correction exacte, sans Levenshtein (ajout 22/07) */
      $$('select[data-answer]',bloc).forEach(function(sel){
        n++;
        sel.classList.remove('juste','presque','revoir');
        if(!sel.value){ sel.classList.add('revoir'); return; }
        if(normaliser(sel.value)===normaliser(sel.dataset.answer)){ sel.classList.add('juste'); ok++; }
        else sel.classList.add('revoir');
      });
      var h='';
      if(ok===n) h+='<span class="m-ok">Tout est juste'+(presque?' — attention à l\'orthographe, je l\'ai corrigée pour toi.':'.')+'</span>';
      else{
        if(presque) h+='<span class="m-presque">'+presque+' réponse(s) acceptée(s) malgré une faute d\'orthographe : '+fautes.join(', ')+'.</span><br>';
        h+='<span class="m-ko">'+(n-ok)+' réponse(s) à revoir. Un <b>indice</b> vient d\'apparaître à côté de chacune d\'elles.</span>';
      }
      $('.cloze-msg',bloc).innerHTML=h;
      /* validation à l'envoi : avoir répondu suffit */
      var etape=bloc.closest('.step');
      if(etape){
        etape.classList.add('is-done');
        etape.dataset.clozeScore=ok+'/'+n;
        etape.dispatchEvent(new CustomEvent('etape-validee',{bubbles:true}));
      }
      majBarre();
    });
  });
}

/* ---------- 6. Glossaire permanent, cherchable ---------- */
var DICO=[];
function initGlossaire(){
  var src=$('#dico-source');
  if(src){ try{ DICO=JSON.parse(src.textContent); }catch(e){ DICO=[]; } }

  /* Règle de la séquence : tout bloc étiqueté « vocabulaire », « glossaire » ou
     « dictionnaire » verse automatiquement ses entrées dans le dictionnaire
     embarqué. Aucun mot à recopier à la main dans #dico-source. */
  function moissonnerVocabulaire(){
    var blocs=[];
    $$('[data-vocab]').forEach(function(b){ blocs.push(b); });
    $$('.glosmot').forEach(function(b){
      if(blocs.indexOf(b)>=0) return;
      var t=$('.gl-head',b);
      if(t && /vocabulaire|glossaire|dictionnaire/i.test(t.textContent)) blocs.push(b);
    });
    blocs.forEach(function(b){
      $$('.ventree',b).forEach(function(e){
        var m=$('.vmot',e), d=$('.vdef',e);
        if(!m) return;
        var mot=m.textContent.trim().replace(/\s+/g,' ');
        var def=d?d.textContent.trim().replace(/\s+/g,' '):'';
        if(!mot) return;
        var ex=DICO.filter(function(x){ return normaliser(x.mot)===normaliser(mot); })[0];
        if(ex){ if(!ex.def) ex.def=def; }
        else DICO.push({mot:mot, def:def, origine:'Séquence Internet'});
      });
    });
  }
  moissonnerVocabulaire();

  /* Depuis le retrait du bloc « Vocabulaire » de l'étape 1.3 (doublon), le
     dictionnaire du poste d'écoute est la seule source de ces mots : il verse
     donc lui aussi ses entrées dans le glossaire permanent. */
  function moissonnerDictionnaire(){
    $$('.poste-dico dl').forEach(function(dl){
      var mot=null;
      Array.prototype.slice.call(dl.children).forEach(function(el){
        if(el.tagName==='DT'){ mot=el.textContent.trim().replace(/\s+/g,' '); return; }
        if(el.tagName!=='DD' || !mot) return;
        var def=el.textContent.trim().replace(/\s+/g,' ');
        var ex=DICO.filter(function(x){ return normaliser(x.mot)===normaliser(mot); })[0];
        if(ex){ if(!ex.def) ex.def=def; }
        else DICO.push({mot:mot, def:def, origine:'Séquence Internet'});
        mot=null;
      });
    });
  }
  moissonnerDictionnaire();
  var b=document.createElement('button');
  b.id='glo-ouvrir'; b.type='button'; b.textContent='📖 Glossaire';
  document.body.appendChild(b);
  var fond=document.createElement('div');
  fond.className='glo-back';
  fond.innerHTML='<div class="glo-panel"><h3>Mon glossaire</h3>'+
    '<p class="sub">Tous les mots définis depuis le début de l\'année. Cherche un mot, il revient.</p>'+
    '<input class="rech" type="search" placeholder="Chercher un mot…" aria-label="Chercher un mot">'+
    '<div class="glo-liste"></div></div>';
  document.body.appendChild(fond);
  function rendre(f){
    var q=normaliser(f||'');
    var liste=DICO.filter(function(e){
      if(!q) return true;
      return normaliser(e.mot).indexOf(q)>=0 || normaliser(e.def||'').indexOf(q)>=0;
    });
    var h=liste.map(function(e){
      var perso=e.eleve||'';
      /* pointillé seulement si le mot n'a AUCUNE définition — ni celle de
         l'élève, ni celle de référence ; sinon l'entrée est pleine. */
      var etat = perso ? '' : (e.def ? ' ref' : ' vide');
      return '<div class="glo-entree'+etat+'"><div class="m">'+e.mot+'</div>'+
        '<div class="o">'+(e.origine||'cette séquence')+'</div>'+
        '<div class="d">'+(perso||e.def||'À définir — tu le rencontreras plus loin.')+'</div></div>';
    }).join('');
    if(!h) h='<p style="font-size:13.5px;color:var(--ink-faint)">Aucun mot ne correspond. Essaie avec moins de lettres.</p>';
    $('.glo-liste',fond).innerHTML=h;
  }
  b.addEventListener('click',function(){ rendre(''); $('.rech',fond).value=''; fond.classList.add('on'); });
  fond.addEventListener('click',function(e){ if(e.target===fond) fond.classList.remove('on'); });
  $('.rech',fond).addEventListener('input',function(e){ rendre(e.target.value); });
  /* le glossaire personnel doit être lisible par la fiche téléchargée,
     qui vit dans un autre bloc de script : on le publie sur window. */
  function publierGlossaire(){
    try{
      window.MON_GLOSSAIRE = DICO.filter(function(e){ return e.eleve && String(e.eleve).trim(); })
        .map(function(e){ return {mot:e.mot, texte:String(e.eleve).trim()}; });
    }catch(err){}
  }
  publierGlossaire();

  /* les définitions validées de l'élève alimentent le dico en direct */
  document.addEventListener('glossaire-valide',function(e){
    var d=e.detail||{};
    var ex=DICO.filter(function(x){ return normaliser(x.mot)===normaliser(d.mot); })[0];
    if(ex) ex.eleve=d.texte; else DICO.push({mot:d.mot,eleve:d.texte,origine:'Internet'});
    publierGlossaire();
  });
}

/* ---------- 7. Agrandissement des images ---------- */
function initZoom(){
  var fond=document.createElement('div');
  fond.className='zoom-back';
  fond.innerHTML='<img alt=""><div class="zc"></div>';
  document.body.appendChild(fond);
  fond.addEventListener('click',function(){ fond.classList.remove('on'); });
  $$('figure.ill img').forEach(function(img){
    img.addEventListener('click',function(){
      $('img',fond).src=img.src;
      $('img',fond).alt=img.alt;
      var cap=img.closest('figure').querySelector('figcaption');
      $('.zc',fond).textContent=cap?cap.textContent.trim():'';
      fond.classList.add('on');
    });
  });
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'){
      fond.classList.remove('on');
      if(fondQcm && fondQcm._abandonner) fondQcm._abandonner();
      else if(fondQcm) fondQcm.classList.remove('on');
    }
  });
}

/* ---------- 8. Démarrage ---------- */
/* ---------- Dépôt de copie d'écran (nouveau mécanisme, 22/07/2026) ----------
   L'image lue reste en mémoire JS (data URL dans le DOM), JAMAIS en localStorage.
   Validation à l'envoi. Correction/relecture IA = plus tard (worker phase 2). */
function initDepot(){
  $$('[data-depot]').forEach(function(zone){
    var input=$('input[type=file]',zone), apercu=$('[data-depot-apercu]',zone);
    if(!input||!apercu) return;
    input.addEventListener('change',function(){
      var f=input.files&&input.files[0]; if(!f) return;
      if(!/^image\//.test(f.type)){ verdict(zone,'no','Choisis un fichier image (une copie d\'écran).'); return; }
      var r=new FileReader();
      r.onload=function(){
        apercu.innerHTML='';
        var img=document.createElement('img'); img.src=r.result; img.alt='Ta copie d\'écran déposée';
        apercu.appendChild(img);
        verdict(zone,'ok','✅ Copie d\'écran déposée — étape validée. (La relecture par l\'IA viendra plus tard.)');
        markDone(zone);
      };
      r.readAsDataURL(f);
    });
  });
}

/* ---------- Mini-calculatrice maison (aucun CDN, aucune eval) ---------- */
function initCalc(){
  $$('[data-calc]').forEach(function(calc){
    var ecran=$('[data-calc-ecran]',calc);
    if(!ecran) return;
    var acc=null, op=null, saisie='0', neuf=true;
    function aff(){ ecran.value=saisie; }
    function nombre(){ return parseFloat(saisie.replace(',','.'))||0; }
    function applique(a,b,o){ if(o==='+')return a+b; if(o==='-')return a-b; if(o==='*')return a*b; if(o==='/')return b===0?NaN:a/b; return b; }
    function fmt(n){ if(!isFinite(n))return 'erreur'; var s=(Math.round(n*1e6)/1e6).toString(); return s.replace('.',','); }
    $$('[data-calc-key]',calc).forEach(function(b){
      b.addEventListener('click',function(){
        var k=b.dataset.calcKey;
        if(/^[0-9]$/.test(k)){ saisie=(neuf||saisie==='0')?k:saisie+k; neuf=false; }
        else if(k==='.'){ if(neuf){saisie='0,';neuf=false;} else if(saisie.indexOf(',')<0) saisie+=','; }
        else if(k==='C'){ acc=null;op=null;saisie='0';neuf=true; }
        else if(k==='back'){ saisie=saisie.length>1?saisie.slice(0,-1):'0'; }
        else if(k==='='){ if(op!==null){ saisie=fmt(applique(acc,nombre(),op)); op=null; acc=null; neuf=true; } }
        else { if(op!==null && !neuf){ acc=applique(acc,nombre(),op); saisie=fmt(acc); } else { acc=nombre(); } op=k; neuf=true; }
        aff();
      });
    });
    aff();
  });
}

/* ---------- Révélation du « à retenir » après l'activité (nouveau, 22/07/2026) ---------- */
function initBilan(){
  $$('[data-reveal-bilan]').forEach(function(btn){
    btn.addEventListener('click',function(){
      var card=btn.closest('.card-body')||document;
      var wrap=$('[data-bilan-wrap]',card);
      if(wrap) wrap.hidden=false;
      btn.disabled=true; btn.textContent='🎯 Bilan affiché';
    });
  });
}

/* ---------- Reprise (lot 1B) ----------
   Remet la page dans l'état où l'élève l'a laissée. Ne s'exécute
   qu'APRÈS résolution de EtatSNT.charge : avant lui, l'état n'est pas
   encore revenu de la base, et initReveal a déjà tout masqué.

   Principe : on ne reconstitue jamais un rendu à la main. On remet la
   saisie en place et on laisse les moteurs existants la corriger
   eux-mêmes — un seul code de correction, donc aucune divergence
   possible entre ce que l'élève a vu et ce qu'il retrouve.

   Le QCM fait exception, par choix : ses réponses ne sont pas
   restaurées, il peut être refait. On en montre la coche et le score. */
function cocheQcm(box,score){
  var lanceur=box.querySelector('.qcm-lanceur'); if(!lanceur) return;
  var bouton=lanceur.querySelector('button');
  if(bouton) bouton.textContent='Refaire le QCM';
  var consigne=lanceur.querySelector('.qcm-consigne');
  if(consigne) consigne.style.display='none';
  if(lanceur.querySelector('.qcm-fait')) return;
  var fait=document.createElement('span');
  fait.className='qcm-fait';
  fait.style.cssText='font-size:13.5px;color:var(--ok);font-weight:500';
  fait.textContent='✓ Déjà fait'+(score?' — '+score:'');
  if(bouton) lanceur.insertBefore(fait,bouton); else lanceur.appendChild(fait);
}

function restaurer(){
  if(!window.EtatSNT || !EtatSNT.actif() || !EtatSNT.charge) return;
  EtatSNT.charge.then(function(){
    var etapes=EtatSNT.etapes(), champs=EtatSNT.champs(), courant=null, quelqueChose=false;

    /* 1. les étapes faites : marquées, révélées, plus la suivante.
          dataset.dejaVu était lu par toutRevel() et n'était jamais
          écrit : il l'est enfin ici. */
    $$('.seance').forEach(function(sec){
      var pas=$$('.step',sec), dernier=-1;
      pas.forEach(function(p,i){
        var k=EtatSNT.cle(p);
        if(k && etapes[k] && etapes[k].fait){ p.classList.add('is-done'); dernier=i; quelqueChose=true; }
      });
      if(dernier<0) return;
      var jusqua=Math.min(dernier+1,pas.length-1);
      for(var i=0;i<=jusqua;i++){ pas[i].classList.remove('masque'); pas[i].dataset.dejaVu='1'; }
      var suivant=sec.querySelector('.step-suivant');
      if(suivant && !sec.querySelectorAll('.step.masque').length) suivant.style.display='none';
    });

    /* 2. les textes à trous : on remet la saisie, le moteur recorrige */
    $$('.cloze').forEach(function(bloc){
      var k=clozeCle(bloc); if(!k || !champs[k]) return;
      clozeEcrire(bloc,champs[k]);
      var conteneur=bloc.closest('.field')||bloc.parentElement;
      var bouton=conteneur?conteneur.querySelector('[data-check-cloze]'):null;
      if(bouton){ bouton.click(); quelqueChose=true; }
    });

    /* 3. les QCM déjà passés */
    $$('.qcmbox').forEach(function(box){
      var step=box.closest('.step'); if(!step) return;
      var k=EtatSNT.cle(step); if(!k || !etapes[k] || !etapes[k].fait) return;
      cocheQcm(box,etapes[k].score);
    });

    if(!quelqueChose) return;

    /* 4. déverrouillage des séances et sommaire à jour. L'écouteur
          d'IIFE 1 rappelle refresh() ; la cible sans .closest est
          ignorée par l'enregistreur, aucune écriture parasite. */
    document.dispatchEvent(new CustomEvent('etape-validee',{bubbles:true}));
    majBarre();

    /* 5. replacement silencieux sur la première étape non faite.
          Une ancre explicite dans l'URL reste prioritaire : elle vient
          d'une intention, pas d'un retour. */
    if(location.hash) return;
    $$('.step').forEach(function(p){
      if(!courant && !p.classList.contains('is-done') && !p.classList.contains('masque')) courant=p;
    });
    if(courant) courant.scrollIntoView({behavior:'auto',block:'start'});
  });
}

function demarrer(){
  /* le bandeau « À retenir » est ajouté en CSS : on enveloppe le contenu */
  $$('.retain').forEach(function(r){
    if(!r.querySelector(':scope > .rb')){
      var d=document.createElement('div'); d.className='rb';
      while(r.firstChild) d.appendChild(r.firstChild);
      r.appendChild(d);
    }
  });
  initReveal();
  compteurSeances();
  initEvaluabilite();
  construireBarre();
  initEnseignant();
  initQcm();
  initCloze();
  initGlossaire();
  initZoom();
  initDepot();
  initCalc();
  initBilan();
  var obs=new MutationObserver(majBarre);
  $$('.steps').forEach(function(s){ obs.observe(s,{attributes:true,subtree:true,attributeFilter:['class']}); });
  restaurer();
  console.log('%cSNT · Internet — tu as ouvert l\'inspecteur. Bravo, c\'est exactement comme ça qu\'on apprend.','color:#2445c7');
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',demarrer);
else demarrer();
})();

(function(){
/* Un seul moteur pour tous les exercices de remise en ordre. */
document.querySelectorAll('[data-tri]').forEach(function(liste){
  var traine=null;
  liste.querySelectorAll('li').forEach(function(li){
    li.setAttribute('draggable','false');
    li.addEventListener('pointerdown', function(e){
      traine=li; li.classList.add('en-cours'); li.setPointerCapture(e.pointerId);
    });
    li.addEventListener('pointermove', function(e){
      if(!traine) return;
      /* défilement automatique près des bords : indispensable pour les longues
         listes au doigt, le pointeur restant capturé pendant tout le glisser */
      var marge=90;
      if(e.clientY < marge) window.scrollBy(0, -14);
      else if(e.clientY > window.innerHeight - marge) window.scrollBy(0, 14);
      var apres=null, items=Array.prototype.slice.call(liste.querySelectorAll('li'));
      for(var i=0;i<items.length;i++){
        var r=items[i].getBoundingClientRect();
        if(items[i]!==traine && e.clientY < r.top + r.height/2){ apres=items[i]; break; }
      }
      items.forEach(function(x){ x.classList.remove('survol'); });
      if(apres) apres.classList.add('survol'); else items[items.length-1].classList.add('survol');
      if(apres) liste.insertBefore(traine, apres); else liste.appendChild(traine);
    });
    ['pointerup','pointercancel'].forEach(function(ev){
      li.addEventListener(ev, function(){
        if(!traine) return;
        traine.classList.remove('en-cours');
        liste.querySelectorAll('li').forEach(function(x){ x.classList.remove('survol'); });
        traine=null;
      });
    });
  });
});
document.querySelectorAll('[data-tri-check]').forEach(function(btn){
  btn.addEventListener('click', function(){
    var champ=btn.closest('.field'), liste=champ.querySelector('[data-tri]');
    if(!liste) return;
    var items=Array.prototype.slice.call(liste.querySelectorAll('li'));
    var attendu=items.map(function(li){ return parseInt(li.dataset.rang,10); }).sort(function(a,b){return a-b;});
    var bon=0;
    items.forEach(function(li,i){
      li.classList.remove('bon','mauvais');
      var juste=(parseInt(li.dataset.rang,10)===attendu[i]);
      li.classList.add(juste?'bon':'mauvais');
      if(juste) bon++;
    });
    var n=items.length, quoi=liste.dataset.triLibelle||'éléments';
    var v=champ.querySelector('[data-tri-verdict]');
    if(v){
      var mot = (bon<=1) ? quoi.replace(/s$/,'') : quoi;
      v.textContent = bon===n ? 'Parfait — tous les '+quoi+' sont dans le bon ordre.'
                              : bon+' '+mot+' sur '+n+' déjà à la bonne place. Continue.';
      v.style.color = bon===n ? 'var(--ok)' : 'var(--ink-soft)';
    }
    /* Audit Loïc : la correction ne tombe plus au premier essai. On peut retenter
       autant de fois qu'on veut ; deux niveaux d'indices dévoilent des dates ;
       la correction s'affiche d'elle-même quand tout est juste, ou à la demande. */
    var suite=champ.querySelector('.tri-suite');
    var bIndice=champ.querySelector('[data-tri-indice]');
    var bCorr=champ.querySelector('[data-tri-correction]');
    if(liste.dataset.triIndices==='1'){
      if(bIndice && bon<n) bIndice.hidden=false;
      if(bCorr) bCorr.hidden=false;
    }
    if(suite && (bon===n || !liste.dataset.triIndices)) suite.hidden=false;
    if(bon===n){ if(bIndice) bIndice.hidden=true; if(bCorr) bCorr.hidden=true; }
    /* validation à l'envoi (§13.7) : avoir proposé un ordre suffit */
    var etape=champ.closest('.step');
    if(etape){ etape.classList.add('is-done');
               etape.dataset.triScore=bon+'/'+n;
               etape.dispatchEvent(new CustomEvent('etape-validee',{bubbles:true})); }
  });
});
/* indices progressifs : quelques dates au 1er niveau, davantage au 2e */
document.querySelectorAll('[data-tri-indice]').forEach(function(btn){
  btn.dataset.niveau='0';
  btn.addEventListener('click', function(){
    var champ=btn.closest('.field'), liste=champ.querySelector('[data-tri]');
    var n=parseInt(btn.dataset.niveau,10)+1;
    btn.dataset.niveau=n;
    liste.querySelectorAll('.an-ind').forEach(function(e){
      if(parseInt(e.dataset.niveau,10)<=n) e.hidden=false;
    });
    var v=champ.querySelector('[data-tri-verdict]');
    if(n===1){
      btn.textContent='💡 Encore un indice';
      if(v){ v.textContent='Quatre dates sont apparues : elles te donnent des points de repère. Réorganise autour d\'elles, puis revérifie.';
             v.style.color='var(--ink-soft)'; }
    } else {
      btn.hidden=true;
      if(v){ v.textContent='Huit dates sur douze sont là. Les quatre restantes se déduisent de ce qui les entoure.';
             v.style.color='var(--ink-soft)'; }
    }
  });
});
document.querySelectorAll('[data-tri-correction]').forEach(function(btn){
  btn.addEventListener('click', function(){
    var champ=btn.closest('.field');
    var suite=champ.querySelector('.tri-suite'); if(suite) suite.hidden=false;
    btn.hidden=true;
    var bI=champ.querySelector('[data-tri-indice]'); if(bI) bI.hidden=true;
    if(suite) suite.scrollIntoView({behavior:'smooth',block:'start'});
  });
});
})();
