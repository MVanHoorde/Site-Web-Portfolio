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

  /* ----------------------------------------------------------
     RÉSUMÉ POUR LE HUB SNT
     Le hub des huit thèmes doit dessiner un anneau de progression par
     thème. Or la base ne stocke que les étapes FAITES : ni le nombre
     total d'étapes, ni le nom des séances. Sans totaux, pas de ratio.

     Deux façons de lui donner ces chiffres :
       · un manifeste écrit à la main dans le hub — qui dériverait du
         contenu réel dès la première séance ajoutée ;
       · la page elle-même les écrit en même temps que son état.

     C'est la seconde, ici. Le résumé est produit par la séquence, à
     partir de son propre DOM : il ne PEUT pas être en retard sur elle.
     Le hub lit huit résumés en une requête et n'a rien à savoir du
     contenu des pages.

     RGPD : que du contenu de cours (noms de séances, compteurs).
     Aucune donnée personnelle n'entre ici.
     ---------------------------------------------------------- */
  function texteSeance(sec){
    var h = sec.querySelector('.seance-head h2');
    if(!h) return { num:'', nom:'' };
    var sn = h.querySelector('.s-num');
    var num = sn ? sn.textContent.replace(/\s+/g,' ').trim() : '';
    var c = h.cloneNode(true), sn2 = c.querySelector('.s-num');
    if(sn2) sn2.remove();
    return { num:num, nom:c.textContent.replace(/\s+/g,' ').trim() };
  }
  function resume(){
    var out = { seances:[], f:0, t:0 };
    Array.prototype.forEach.call(document.querySelectorAll('.seance'), function(sec){
      var pas = sec.querySelectorAll('.step'), f = 0;
      Array.prototype.forEach.call(pas, function(p){
        var k = cle(p);
        /* on compte depuis l'ÉTAT, pas depuis les classes du DOM :
           l'état est la source de vérité, le DOM peut être en retard */
        if(k && ETAT.etapes[k] && ETAT.etapes[k].fait) f++;
      });
      var t = texteSeance(sec);
      out.seances.push({ id:sec.id, num:t.num, nom:t.nom, f:f, t:pas.length });
      out.f += f; out.t += pas.length;
    });
    return out;
  }

  function sauver(){
    var B = base();
    if(!B || !SEQ) return;
    clearTimeout(minuteur);
    minuteur = setTimeout(function(){
      ETAT.vu_le = new Date().toISOString();
      B.ecrire('cours', SEQ, { etapes: ETAT.etapes, champs: ETAT.champs,
                               vu_le: ETAT.vu_le, resume: resume() })
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
    /* Cascade de déverrouillage — généralisée le 26/07/2026.
       Elle était écrite à la main pour QUATRE séances (s1…s4). Le jour où
       la séquence Internet est passée à cinq, la cinquième serait restée
       verrouillée à vie sans que rien ne le signale : aucune erreur, juste
       une séance inaccessible. On boucle désormais sur ce que la page
       contient réellement, dans l'ordre de data-seance. */
    var suite=Array.prototype.slice.call(document.querySelectorAll('.seance'))
      .sort(function(a,b){
        return (+a.getAttribute('data-seance')||0)-(+b.getAttribute('data-seance')||0);
      });
    var precedentesOk=true;
    suite.forEach(function(sec,rang){
      /* Deux verrous, et ils s'additionnent (20/08/2026).
         · le MÉRITE, d'origine : la séance N+1 s'ouvre quand la N est finie ;
         · le PLAFOND : la classe ne dépasse pas la dernière séance faite de
           plus de avance_max séances (verrou-snt.js).
         C'est '.locked' qui commande le sommaire, la barre « tu es ici » et
         les gardes de saisie : elle doit donc porter les deux. La classe
         '.plafonne', posée par verrou-snt.js, ne sert qu'à choisir le texte
         du bandeau — dire « finis la séance précédente » à un élève qui l'a
         finie serait un mensonge.
         Sans verrou-snt.js chargé (t3…t7, pages non raccordées à la base),
         'plafonne' vaut false et rien ne change. */
      var plafonne = !!(window.VerrouSNT && sec.id && !window.VerrouSNT.ouverte(sec.id));
      if(rang>0 || plafonne) sec.classList.toggle('locked', !precedentesOk || plafonne);
      precedentesOk = precedentesOk && seanceComplete(sec);
    });
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
  /* Le plafond arrive de la base APRÈS le premier rendu : sans cette
     écoute, la cascade ne se rejouerait jamais et la page resterait
     ouverte alors que la classe n'y a pas droit. */
  document.addEventListener('plafond-connu',function(){ refresh(); });

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

    /* REPRISE D'UNE RÉPONSE (01/08/2026) — on repart de ce qui a été
       écrit, on ne repart pas de zéro.
       Motif : quand le professeur renvoie une copie, il manque
       souvent une phrase. Faire tout retaper est décourageant, et
       l'élève réécrit alors moins bien que la première fois.
       Le texte précédent est donc pré-rempli et surligné : il se
       voit, se modifie, et un bouton l'efface d'un geste pour ceux
       qui préfèrent recommencer.
       On NE pré-remplit PAS une première rédaction : sur l'étape 1.1
       (« ta définition, sans recherche »), il n'y a rien à reprendre. */
    var precedent = memoireReponses[champ.dataset.focusCode||''] || '';
    var reprise = precedent && champ.classList.contains('a-refaire');
    if(reprise){
      ta.value = precedent;
      ta.classList.add('repris');
      var rap=document.createElement('div');
      rap.className='focus-reprise';
      rap.innerHTML='<span>Ta réponse précédente est déjà là : complète-la ou modifie-la.</span>'+
        '<button type="button" class="btn ghost" data-vider>Repartir de zéro</button>';
      ta.parentNode.insertBefore(rap, ta);
      rap.querySelector('[data-vider]').addEventListener('click',function(){
        ta.value=''; ta.classList.remove('repris'); ta.focus();
        ta.dispatchEvent(new Event('input'));
      });
      /* curseur à la FIN, pas au début : on vient presque toujours
         ajouter quelque chose. */
      ta.setSelectionRange(ta.value.length, ta.value.length);
    }
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
      /* On quitte l'état « à refaire » dès le nouvel envoi : sans cela
         le bouton resterait visible et l'élève pourrait renvoyer en
         boucle la même copie. */
      champ.classList.remove('a-refaire');
      verdict(champ,'wait','⏳ Réponse envoyée. Relecture en cours — ton professeur la verra.');
      var s=stepOf(champ); if(s)s.classList.add('is-wait');
      BASE.envoyerReponse(code, texte).then(function(){
        verdict(champ,'ok','✅ Réponse enregistrée. Tu peux passer à la suite — et aider un camarade bloqué.');
        showReveal(champ); markDone(champ);
        /* rendu, mais pas encore relu : pastille creuse (voir CSS) */
        var se=stepOf(champ); if(se) se.classList.add('attente-corr');
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
  /* Copie RENVOYÉE (statut 'signale', posé par signaler_copie côté
     base) : le professeur demande une réécriture. Rendu distinct du
     retour ordinaire, pour deux raisons :
      · pas de ligne de transparence sur l'IA — renvoyer une copie
        est une décision du professeur, l'IA ne renvoie rien ;
      · l'invitation à réécrire doit être explicite, sinon l'élève
        lit un reproche sans savoir qu'il a la main.
     Le mot du professeur prime, comme dans rendreRetour ; à défaut,
     le message de l'IA qu'il a validé (la base refuse un renvoi qui
     ne dirait ni l'un ni l'autre — voir 010-corriger-les-copies). */
  function rendreRenvoi(r){
    var fe  = (r.correction_ia && r.correction_ia.analyse
               && r.correction_ia.analyse.feedback_eleve) || {};
    var mot = (r.commentaire_prof && r.commentaire_prof.trim())
                ? r.commentaire_prof : (fe.message || '');
    return '<span class="vd-pastille">\u270e À reprendre</span>' +
           '<p class="vd-msg">' + echapper(mot) + '</p>' +
           '<p class="vd-msg">Reprends ta réponse\u00a0: ton nouvel envoi remplacera le précédent.</p>';
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
          var sc=stepOf(champ); if(sc) sc.classList.remove('attente-corr');
        } else if(r.statut === 'signale'){
          /* À refaire. La classe 'a-refaire' rouvre le bouton d'envoi :
             sans elle, la règle CSS '.rempli .gaction{display:none}'
             l'emporte sur tout style inline, et l'élève lit « reprends
             ta réponse » sans pouvoir le faire (bug constaté en test
             réel le 01/08/2026 — la boucle était rompue).
             On garde l'écho : il doit relire ce qu'il avait écrit.
             Pas de markDone : l'étape n'est pas acquise. */
          champ.classList.add('a-refaire');
          if(action) action.style.display = '';
          verdict(champ, 'no', rendreRenvoi(r));
        } else {
          /* Copie envoyée, pas encore corrigée. markDone EST
             indispensable ici : à l'envoi, validerFocus() marque
             l'étape faite sans attendre le worker. Si le rechargement
             ne le refaisait pas, rouvrir la page ferait RECULER la
             progression et verrouillerait la séance jusqu'au passage
             du worker — panne constatée le 01/08/2026 après un
             redémarrage du PC, étape 1.5 restée bloquée.
             Règle générale : un rechargement ne doit jamais faire
             perdre une progression déjà acquise. */
          verdict(champ, 'wait', '⏳ Réponse envoyée. Relecture en cours — ton professeur la verra.');
          markDone(champ);
          var sw=stepOf(champ); if(sw) sw.classList.add('attente-corr');
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

  /* ---------- replier une étape en cliquant sur son titre ----------
     La classe .replie existait dans le CSS mais rien ne l'activait :
     on pouvait ouvrir une étape, jamais la refermer (signalé en test
     réel le 01/08/2026). On ne replie JAMAIS l'étape courante non
     terminée : refermer ce sur quoi on travaille n'a pas de sens et
     donnerait l'impression d'un bug. */
  /* Toutes les étapes n'ont pas de .step-title : les encadrés
     spéciaux (.france-box « Fierté française », bonus) portent leur
     titre dans .fl ou h4. Ne viser que .step-title laissait ces
     étapes impossibles à replier — signalé sur l'étape 1.5 le
     01/08/2026. On prend le premier titre disponible, quel que soit
     le gabarit de la carte. */
  document.querySelectorAll('.step').forEach(function(st){
    var t = st.querySelector('.step-title')
         || st.querySelector('.france-box > .fl')
         || st.querySelector('.bonus-head')
         || st.querySelector('.france-box > h4');
    if(!t || t.dataset.replieCable) return;
    t.dataset.replieCable='1';
    t.classList.add('titre-repliable');
    monterRepli(t);
  });
  function monterRepli(t){
    t.setAttribute('role','button');
    t.setAttribute('tabindex','0');
    var basculer=function(){
      var st=t.closest('.step');
      if(!st) return;
      if(!st.classList.contains('replie') && !st.classList.contains('is-done')
         && !st.classList.contains('is-wait')) return;
      st.classList.toggle('replie');
      st.dataset.replieManuel='1';
      t.setAttribute('aria-expanded', st.classList.contains('replie') ? 'false' : 'true');
    };
    t.addEventListener('click',basculer);
    t.addEventListener('keydown',function(e){
      if(e.key==='Enter'||e.key===' '){ e.preventDefault(); basculer(); }
    });
  }

  /* ---------- Aller aux corrections ----------
     Placée ICI, dans le même IIFE que la pastille : définie plus bas
     au niveau global, elle était invisible depuis ce module — les
     portées ne communiquent pas et la remontée de déclaration ne
     traverse pas un IIFE. La pastille ne se créait donc jamais
     (ReferenceError silencieux, diagnostiqué au test le 01/08/2026).
   Parcourt les champs qui portent un retour du professeur, dans
   l'ordre de la page. Sert à la carte de reprise ET au bouton
   permanent : une seule façon de naviguer vers un retour, donc un
   seul comportement à comprendre. */
  var _corrIndex=0;
  function champsCorriges(){
    /* querySelectorAll direct, pas le raccourci $$ : celui-ci est
       assigné à une var plus bas dans le fichier, donc encore
       indéfini quand la pastille se construit. Diagnostiqué au test
       le 01/08/2026 — la pastille n'apparaissait jamais. */
    return Array.prototype.slice.call(
      document.querySelectorAll('[data-focus-code]')).filter(function(c){
      var v=c.querySelector('.verdict');
      return v && v.classList.contains('show')
               && !v.classList.contains('wait');
    });
  }
  /* Ce sur quoi la pastille NAVIGUE — pas la même chose que ce
     qu'elle compte. Dès qu'une copie est à reprendre, le parcours ne
     porte QUE sur celles-là : sinon la pastille annonçait « 2 à
     reprendre » puis emmenait sur une étape validée au 3ᵉ clic
     (signalé en test réel le 01/08/2026). Ce qui est à reprendre
     demande une action ; un retour déjà validé, non. */
  function champsANaviguer(){
    var tous=champsCorriges();
    var refaire=tous.filter(function(c){ return c.classList.contains('a-refaire'); });
    return refaire.length ? refaire : tous;
  }
  function allerCorrection(i){
    var l=champsANaviguer();
  if(!l.length) return;
  _corrIndex = (typeof i==='number') ? i : (_corrIndex % l.length);
  var cible=l[_corrIndex];
  _corrIndex=(_corrIndex+1)%l.length;
  var st=cible.closest('.step');
  if(st) st.classList.remove('replie');
  /* même temporisation que defilerVers (défini plus bas, hors de ce
     module) : on vient de déplier l'étape, la page n'a pas encore été
     recalculée. Sans cette attente, on arrive trop bas. */
  if(window.requestAnimationFrame){
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        cible.scrollIntoView({behavior:'smooth',block:'start'});
      });
    });
  } else cible.scrollIntoView({behavior:'smooth',block:'start'});
  cible.classList.add('surligne');
  setTimeout(function(){ cible.classList.remove('surligne'); },2200);
}
  /* ---------- pastille de corrections, permanente ----------
     Demandée le 01/08/2026 : pouvoir sauter à ses retours à tout
     moment, sans les chercher dans une page de 26 étapes. Elle
     n'apparaît que s'il y a quelque chose à voir, se recompte à
     chaque validation, et alerte en rouge s'il reste une copie à
     reprendre — c'est le cas où l'élève DOIT agir. */
  var pastille=null;
  function majPastilleCorr(){
    var l=champsCorriges();
    var aRefaire=l.filter(function(c){
      return c.classList.contains('a-refaire'); }).length;
    if(!l.length){ if(pastille) pastille.hidden=true; return; }
    if(!pastille){
      pastille=document.createElement('button');
      pastille.type='button';
      pastille.id='corr-pastille';
      pastille.addEventListener('click',function(){
        var l=champsANaviguer();
        /* une seule entrée : y aller directement, un menu d'un seul
           élément serait une politesse inutile. */
        if(l.length<2){ allerCorrection(0); return; }
        majListeCorr();
        liste.hidden=!liste.hidden;
      });
      document.body.appendChild(pastille);
    }
    pastille.hidden=false;
    pastille.classList.toggle('urgent', aRefaire>0);
    pastille.innerHTML='<span aria-hidden="true">'+(aRefaire?'✏️':'💬')+'</span> '+
      (aRefaire ? aRefaire+' à reprendre' : l.length+' retour'+(l.length>1?'s':''));
    pastille.setAttribute('aria-label',
      aRefaire ? aRefaire+' réponse(s) à reprendre' : l.length+' retour(s) du professeur');
    majListeCorr();
  }
  /* Liste dépliable : savoir OÙ aller, pas seulement y aller.
     Sur une séquence de cinq séances, « 2 à reprendre » ne dit pas
     s'il faut remonter en séance 1 ou descendre en séance 4 — et
     cliquer à l'aveugle pour le découvrir est désagréable.
     Demandé le 01/08/2026. */
  var liste=null;
  function majListeCorr(){
    var l=champsANaviguer();
    if(!liste){
      liste=document.createElement('div');
      liste.id='corr-liste'; liste.hidden=true;
      document.body.appendChild(liste);
      document.addEventListener('click',function(e){
        if(liste.hidden) return;
        if(!liste.contains(e.target) && e.target!==pastille) liste.hidden=true;
      });
      document.addEventListener('keydown',function(e){
        if(e.key==='Escape') liste.hidden=true;
      });
    }
    liste.innerHTML='';
    l.forEach(function(c,n){
      var st=c.closest('.step'), sec=c.closest('.seance');
      var num=sec?(sec.querySelector('.s-num')||{}).textContent:'';
      var ix=st?(st.querySelector('.step-kicker')||{}).textContent:'';
      var nom=st?(st.querySelector('.step-title')||{}).textContent:'';
      var refaire=c.classList.contains('a-refaire');
      var b=document.createElement('button');
      b.type='button'; b.className='cl-item'+(refaire?' cl-refaire':'');
      var e1=document.createElement('span'); e1.className='cl-ou';
      e1.textContent=((num||'').trim()+' · '+(ix||'').replace(/\s+/g,' ').trim()).replace(/^ ·\s*/,'');
      var e2=document.createElement('span'); e2.className='cl-nom';
      e2.textContent=(nom||'').trim();
      var e3=document.createElement('span'); e3.className='cl-etat';
      e3.textContent=refaire?'à reprendre':'corrigé';
      b.appendChild(e1); b.appendChild(e2); b.appendChild(e3);
      b.addEventListener('click',function(){ liste.hidden=true; allerCorrection(n); });
      liste.appendChild(b);
    });
  }

  /* seul point d'entrée depuis l'extérieur du module : la carte de
     reprise, définie plus bas au niveau global, en a besoin. */
  window.SNTallerCorrection = allerCorrection;
  document.addEventListener('etape-validee',function(){ setTimeout(majPastilleCorr,60); });
  setTimeout(majPastilleCorr,1200);   /* après la ré-hydratation */

  /* ---------- bonus dépliables ---------- */
  document.querySelectorAll('[data-bonus-toggle]').forEach(function(h){
    h.addEventListener('click',function(){h.closest('[data-bonus]').classList.toggle('open');});
  });

  /* ---------- manip « piège à clic » (séquence Web, étape clickbait) ----------
     100 % local : le bouton ne fait que colorer la page trois secondes. Rien
     n'est installé, rien n'est envoyé, rien n'est collecté — c'est le propos
     même de l'expérience. La prise de conscience vaut validation de l'étape.
     Aucun effet sur les séquences qui n'ont pas ces attributs. */
  document.querySelectorAll('[data-trap]').forEach(function(btn){
    btn.addEventListener('click',function(){
      document.body.classList.add('pwned');
      setTimeout(function(){document.body.classList.remove('pwned');},reduce?0:3600);
      var rev=btn.parentElement.querySelector('[data-trap-reveal]');
      if(rev) rev.classList.add('show');
      btn.disabled=true; btn.style.opacity=.5; btn.style.animation='none';
      markDone(btn);
    });
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
    sec.querySelectorAll('[data-bilan-wrap]').forEach(function(b){b.hidden=true;delete b.dataset.ouvert;});
    sec.querySelectorAll('[data-reveal-bilan]').forEach(function(b){b.style.display='';b.disabled=true;});
    sec.querySelectorAll('.cloze-msg').forEach(function(m){m.innerHTML='';});
    sec.querySelectorAll('.indice').forEach(function(b){b.disabled=false;b.dataset.niveau='0';});
    sec.querySelectorAll('.indice-txt').forEach(function(z){z.style.display='none';z.textContent='';});
    /* variante « étiquette compacte » : vider le pied d'indices et remasquer les
       numéros de trou, sinon un « recommencer » les laisserait affichés */
    sec.querySelectorAll('.indices-pied').forEach(function(pd){pd.innerHTML='';});
    sec.querySelectorAll('.cloze .num-trou').forEach(function(nb){nb.hidden=true;});
    sec.querySelectorAll('.cloze .indice').forEach(function(b){b.hidden=true;});
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
    sec.querySelectorAll('[data-trap]').forEach(function(b){b.disabled=false;b.style.opacity='';b.style.animation='';});
    sec.querySelectorAll('[data-trap-reveal]').forEach(function(r){r.classList.remove('show');});
    var id=sec.getAttribute('data-seance'); seanceWasComplete[id]=false;
    /* Recommencer, c'est aussi effacer en base : sans cette purge, le
       rechargement suivant ressusciterait tout le travail effacé
       (l'état, et le contenu des textes à trous). */
    sec.querySelectorAll('[data-step]').forEach(function(s){
      delete s.dataset.triScore; delete s.dataset.dejaVu;
      s.classList.remove('replie');
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

/* ---------- Défiler vers un élément, après recalcul de la page ----------
   Piège rencontré le 01/08/2026 : scrollIntoView() appelé JUSTE après
   avoir démasqué une étape visait sa position d'AVANT — l'étape était
   encore à hauteur nulle, et replierFaites() venait en plus de
   raccourcir la page au-dessus. Résultat : on arrivait trop bas, le
   haut du cadre passait sous la barre.
   Deux frames d'attente : la première laisse le navigateur appliquer
   les changements de classe, la seconde le laisse recalculer la mise
   en page. Le décalage sous la barre, lui, vient de scroll-margin-top
   (CSS) — on ne le recalcule pas ici, sinon il y aurait deux vérités. */
function defilerVers(el, doux){
  if(!el) return;
  var aller=function(){
    el.scrollIntoView({behavior: doux===false ? 'auto' : 'smooth', block:'start'});
  };
  if(window.requestAnimationFrame){
    requestAnimationFrame(function(){ requestAnimationFrame(aller); });
  } else setTimeout(aller,60);
}

/* Le bouton « Étape suivante » se place sous la DERNIÈRE ÉTAPE
   RÉVÉLÉE, pas en bas de la séance. Tant que les étapes à venir
   étaient en display:none, les deux revenaient au même ; depuis
   qu'elles s'affichent en lignes fantômes, le bouton se retrouvait
   sous une pile de lignes grises, très loin du travail en cours. */
function placerBoutonSuivant(sec){
  var bt=sec.querySelector('.step-suivant'); if(!bt) return;
  var cache=sec.querySelectorAll('.step.masque');
  if(!cache.length){ bt.style.display='none'; return; }
  bt.style.display='flex';
  var premier=cache[0];
  if(premier.parentNode===bt.parentNode && premier.previousElementSibling!==bt)
    bt.parentNode.insertBefore(bt,premier);
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
      replierFaites(sec);          /* on passe à la suite : le fait se replie */
      cache[0].classList.remove('masque');
      defilerVers(cache[0]);
      placerBoutonSuivant(sec);
      majBarre();
    });
    sec.dataset.reveal='1';
    placerBoutonSuivant(sec);
  });
}
/* le mode enseignant ouvre tout d'un coup */
function toutRevel(on){
  $$('.step').forEach(function(p){ p.classList.toggle('masque',!on && p.dataset.dejaVu!=='1'); });
  if(on) $$('.step').forEach(function(p){ p.classList.remove('masque','replie'); });
  if(typeof majLignes==='function') majLignes();
  $$('.seance').forEach(placerBoutonSuivant);
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

/* ============================================================
   HUB DE THÈME — carte-réseau (lot 6, refondu lot 9 du 24/07/2026)
   ------------------------------------------------------------
   Premier écran de la séquence : les séances en nœuds reliés par des
   câbles, chacun ceint d'un anneau de progression.

   Le DESSIN a été sorti d'ici : il vit dans assets/js/carte-reseau.js,
   partagé avec le hub SNT (la page des huit thèmes). Motif : le hub
   SNT veut la même grammaire graphique mais n'a pas de DOM de séquence
   à lire — s'il faut un DOM de séquence pour dessiner, on ne peut pas
   réutiliser. La frontière est donc : le moteur dessine à partir de
   données, ce fichier-ci traduit le DOM en données.

   Ce qui reste ici :
     hubSeances()  le DOM → une liste de nœuds
     hubCarte()    l'appel au moteur
     initHub()     l'insertion dans la page
     hubReprise()  la carte de reprise (propre à une séquence)
     majHub()      le DOM → des états d'avancement

   ANNEAU DE RÉVISION : toujours non dessiné (décision de Loïc). Le
   rayon lui est réservé dans carte-reseau.js (R_REVISION), pour qu'il
   puisse être ajouté un jour sans redessiner la carte.
   ============================================================ */
/* Le conteneur du CONTENU, pas le premier .wrap venu : la page en
   compte trois (celui du bandeau de titre, celui de la nav, celui des
   séances). Viser le premier plaçait la barre collante À L'INTÉRIEUR
   du bandeau de titre — elle disparaissait donc avec lui au défilement,
   ce qui vidait de son sens une barre censée ne jamais quitter l'écran. */
function wrapContenu(){
  var l=$$('.wrap').filter(function(x){ return x.querySelector('.seance'); });
  return l[0] || $('.wrap');
}
function hubEsc(x){ return String(x).replace(/&/g,'&amp;').replace(/</g,'&lt;')
                     .replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function hubSeances(){
  return $$('.seance').map(function(sec){
    var t=$('.seance-head h2',sec), num='', nom='';
    if(t){
      var sn=$('.s-num',t); num=sn?propreTxt(sn):'';
      var c=t.cloneNode(true), sn2=c.querySelector('.s-num'); if(sn2) sn2.remove();
      nom=propreTxt(c);
    }
    return { sec:sec, id:sec.id, num:num, nom:nom, n:(sec.getAttribute('data-seance')||'') };
  });
}
/* Adaptateur : une séance du DOM devient un nœud pour le moteur.
   La classe sc1…sc4 porte la teinte de séance (lot 4) ; le moteur ne
   la connaît pas, il se contente de la recopier. */
function hubCarte(liste){
  if(!window.CarteReseau) return '';
  return CarteReseau.dessiner(liste.map(function(s){
    return { id:s.id, num:s.num, nom:s.nom, classe:'sc'+s.n };
  }));
}
function initHub(){
  /* Idempotent : deux appels créeraient deux id="hub", donc un id
     dupliqué — le genre de défaut que verifier.mjs signale et qu'on
     ne veut pas fabriquer soi-même. Ne coûte rien, ferme la porte. */
  if(document.getElementById('hub')) return;
  var anc=wrapContenu(); if(!anc) return;
  var liste=hubSeances(); if(liste.length<2) return;
  var hub=document.createElement('section');
  hub.className='hub'; hub.id='hub';
  /* la carte de reprise n'est plus un encart dans la page : c'est une
     modale bloquante (hubReprise). Plus de conteneur à réserver ici. */
  hub.innerHTML=hubCarte(liste);
  anc.insertBefore(hub,anc.firstChild);
  /* Le retour au sommaire du thème n'est proposé QUE si le hub existe :
     on ne promet pas une destination qu'on n'a pas construite. */
  var nav=$('#prog4 .p4-nav');
  if(nav && !$('.p4-sommaire',nav)){
    var a=document.createElement('a');
    a.className='p4-sommaire';
    a.href='#hub';
    a.title='Revenir au sommaire du thème';
    a.setAttribute('aria-label','Revenir au sommaire du thème');
    a.innerHTML='<span aria-hidden="true">\u2302</span><span class="p4-lab">Sommaire</span>';
    /* Le href reste : sans JS, le lien saute à l'ancre du hub. Avec JS,
       on ouvre la carte en grand plutôt que de faire défiler jusqu'en
       haut — on ne quitte pas sa place pour consulter le plan. */
    a.addEventListener('click',function(ev){ ev.preventDefault(); ouvrirSommaire(); });
    nav.appendChild(a);
  }
  majHub();
}
/* ---------- Sommaire en grand (modale) ----------
   La carte du haut de page sert d'accueil ; celle-ci sert de plan
   consultable à tout moment, depuis n'importe quelle étape. Elle est
   DESSINÉE À NEUF plutôt que déplacée : le moteur travaille à partir
   de données, en refaire une ne coûte rien, et déplacer la carte
   d'origine dans une modale la ferait disparaître de la page en
   dessous — l'élève perdrait son repère en fermant.

   Elle se ferme d'elle-même dès qu'on choisit une séance : ouvrir un
   plan pour devoir ensuite le ranger à la main est une étape de trop.
   Échap et le clic sur le fond ferment aussi. Le focus revient sur le
   bouton qui l'a ouverte. */
var SOMMAIRE_OUVREUR=null;
function fermerSommaire(){
  var m=$('.hub-modale'); if(!m) return;
  m.remove();
  document.body.classList.remove('modale-ouverte');
  if(SOMMAIRE_OUVREUR){ SOMMAIRE_OUVREUR.focus(); SOMMAIRE_OUVREUR=null; }
}
function ouvrirSommaire(){
  if($('.hub-modale')) { fermerSommaire(); return; }
  if(!window.CarteReseau) return;
  var liste=hubSeances(); if(!liste.length) return;
  SOMMAIRE_OUVREUR=document.activeElement;

  var m=document.createElement('div');
  m.className='hub-modale';
  m.innerHTML='<div class="hm-carte" role="dialog" aria-modal="true" aria-label="Sommaire du thème">'+
      '<div class="hm-tete"><span class="hm-titre">Sommaire du thème</span>'+
      '<button class="hm-fermer" type="button" aria-label="Fermer le sommaire">\u00d7</button></div>'+
      '<div class="hub hub-hote">'+hubCarte(liste)+'</div>'+
      '<div class="hm-pied">Choisis une séance pour t\u2019y rendre.</div>'+
    '</div>';
  document.body.appendChild(m);
  document.body.classList.add('modale-ouverte');
  CarteReseau.majNoeuds($('.hub-hote',m),etatsSeances());

  /* un clic sur un nœud : on ferme, PUIS on laisse le lien agir */
  $$('.hub-n a',m).forEach(function(a){
    a.addEventListener('click',function(){ if(a.getAttribute('href')) fermerSommaire(); });
  });
  $('.hm-fermer',m).addEventListener('click',fermerSommaire);
  m.addEventListener('click',function(ev){ if(ev.target===m) fermerSommaire(); });
  document.addEventListener('keydown',function esc(ev){
    if(ev.key==='Escape'){ fermerSommaire(); document.removeEventListener('keydown',esc); }
  });
  $('.hm-fermer',m).focus();
}

/* Carte de reprise : seulement après une vraie coupure. Sous le
   seuil, l'élève est simplement remis à sa place, en silence — un
   rafraîchissement de page n'est pas un retour. */
function hubReprise(){
  if(!window.EtatSNT||!EtatSNT.actif()) return;
  if(!EtatSNT.absentDepuis(2)) return;
  if($('.hub-modale')) return;                 /* une modale à la fois */
  var prof=document.body.classList.contains('teacher');
  var courant=null;
  $$('.step').some(function(p){
    if(p.classList.contains('is-done')) return false;
    var sec=p.closest('.seance');
    if(sec&&sec.classList.contains('locked')&&!prof) return false;
    courant=p; return true;
  });
  if(!courant) return;
  var faits=$$('.step').filter(function(p){ return p.classList.contains('is-done'); }).length;
  if(!faits) return;                           /* rien à reprendre */

  var sec=courant.closest('.seance'), info=infosEtape(courant);
  var t=$('.seance-head h2',sec), num='';
  if(t){ var sn=$('.s-num',t); num=sn?propreTxt(sn):''; }
  var retour=$('nav.seances a.retour');
  var versHub=retour?retour.getAttribute('href'):'2nde-snt.html';

  var m=document.createElement('div');
  m.className='hub-modale hm-reprise';
  m.innerHTML='<div class="hm-carte" role="dialog" aria-modal="true" aria-labelledby="hm-t">'+
      '<div class="hr-haut" id="hm-t">Bon retour</div>'+
      '<div class="hr-ou">Tu en étais à</div>'+
      '<div class="hr-ligne"><span class="hr-s sc'+(sec.getAttribute('data-seance')||'')+'">'+
        hubEsc(num)+'</span><span class="hr-ix">étape '+hubEsc(info.ix)+'</span></div>'+
      '<div class="hr-nom">'+hubEsc(info.nom)+'</div>'+
      '<div class="hr-bas">'+faits+' étape'+(faits>1?'s':'')+' sur '+$$('.step').length+' déjà faites</div>'+
      '<div class="hr-corr" hidden></div>'+
      '<div class="hr-actions">'+
        '<button class="hr-go" type="button">Continuer &rarr;</button>'+
        '<a class="hr-sortie" href="'+hubEsc(versHub)+'">Revenir au sommaire principal</a>'+
      '</div>'+
    '</div>';
  document.body.appendChild(m);
  document.body.classList.add('modale-ouverte');

  function fermer(){
    m.remove();
    document.body.classList.remove('modale-ouverte');
  }
  /* Bloquante VOLONTAIREMENT : pas de fermeture au clic sur le fond ni
     à l'Échap. Décision de Loïc — l'élève doit voir où il en est et
     choisir. Deux issues seulement, toutes deux explicites. Le point
     de sortie existe toujours (« Revenir au sommaire principal ») :
     bloquant ne veut pas dire piégé. */
  $('.hr-go',m).addEventListener('click',function(){
    fermer();
    defilerVers(courant);
  });
  $('.hr-go',m).focus();

  /* Récapitulatif des corrections reçues pendant l'absence.
     Demandé le 01/08/2026 : l'élève revient et ne sait pas que son
     professeur a répondu — le retour est enterré au milieu de la
     page. On l'annonce ici, et le bouton emmène directement dessus.
     Chargement APRÈS l'affichage de la carte : la modale ne doit
     jamais attendre le réseau pour apparaître. */
  if(window.BASE && BASE.mesReponses){
    var codes=[]; $$('[data-focus-code]').forEach(function(c){
      if(c.dataset.focusCode) codes.push(c.dataset.focusCode); });
    if(codes.length){
      BASE.mesReponses(codes).then(function(lignes){
        var vus=(lignes||[]).filter(function(r){
          return r.statut==='corrige' || r.statut==='signale'; });
        if(!vus.length) return;
        var z=$('.hr-corr',m); if(!z) return;
        var aRefaire=vus.filter(function(r){ return r.statut==='signale'; }).length;
        z.hidden=false;
        z.innerHTML='<b>'+vus.length+' réponse'+(vus.length>1?'s':'')+' corrigée'+
          (vus.length>1?'s':'')+'</b>'+
          (aRefaire? ' — dont '+aRefaire+' à reprendre' : '')+
          ' <button type="button" class="hr-voir">Voir</button>';
        $('.hr-voir',z).addEventListener('click',function(){
          fermer();
          if(window.SNTallerCorrection) window.SNTallerCorrection(0);
        });
      }).catch(function(){});
    }
  }
}



/* Les états d'avancement, calculés UNE fois depuis le DOM.
   Séparé de l'affichage parce qu'il y a désormais deux cartes à
   nourrir : celle du haut de page, et celle de la modale « Sommaire ».
   Les recalculer deux fois donnerait deux vérités possibles. */
function etatsSeances(){
  var prof=document.body.classList.contains('teacher');
  var secCourante=null;
  $$('.step').some(function(p){
    if(p.classList.contains('is-done')) return false;
    var s=p.closest('.seance');
    if(s&&s.classList.contains('locked')&&!prof) return false;
    secCourante=s; return true;
  });
  var etats={};
  $$('.seance').forEach(function(sec){
    var dedans=$$('.step',sec);
    var f=dedans.filter(function(p){ return p.classList.contains('is-done'); }).length;
    var verrou=sec.classList.contains('locked')&&!prof;
    etats[sec.id]={
      part  : dedans.length?f/dedans.length:0,
      verrou: verrou,
      ici   : sec===secCourante,
      href  : '#'+sec.id,
      etat  : verrou ? 'verrouillée'
            : (dedans.length&&f===dedans.length) ? 'terminée'
            : f+' sur '+dedans.length
    };
  });
  return etats;
}
function majHub(){
  if(!window.CarteReseau) return;
  var etats=etatsSeances();
  [$('#hub'),$('.hub-modale .hub-hote')].forEach(function(racine){
    if(racine) CarteReseau.majNoeuds(racine,etats);
  });
}

/* ---------- Numérotation calculée (lot 4) ----------
   L'index n'est plus tapé à la main dans le HTML : il se calcule à
   partir du rang de l'étape dans sa séance. Motif : la numérotation
   écrite à la main avait déjà dérivé (1.1 1.2 1.3 1.4 puis 1.6), et
   le sommaire, la barre et les lignes repliées la lisaient telle
   quelle — une faute de frappe devenait une faute d'orientation.
   Le kicker devient « S1 · étape 1.4 » : le numéro ne se décode plus. */
function numeroter(){
  $$('.seance').forEach(function(sec){
    var num=sec.getAttribute('data-seance')||'';
    $$('.step',sec).forEach(function(p,i){
      var code=num+'.'+(i+1);
      p.dataset.num=code;
      /* Deux familles d'étapes, et il fallait les traiter toutes les
         deux. 18 étapes sur 26 portent leur numéro dans un
         .step-kicker ; les 8 autres — encart France, « et toi ? »,
         « pour aller plus loin » — le portent dans un .ix niché dans
         leur bandeau. Ne réécrire que les premières laissait deux
         sources de vérité, et c'est ce qui a fait apparaître un
         bandeau « 3.6 » sous un sommaire annonçant « 3.5 ». */
      var ix=$('.fl .ix, .pl .ix, .bonus-head .ix',p)||$('.ix',p);
      if(ix) ix.textContent=code;
      var k=$('.step-kicker',p); if(!k || $('.k-seance',k)) return;
      /* on ne retire QUE le texte de tête : le badge « à valider » et
         tout ce que la page a mis là doivent survivre. */
      var n=k.firstChild;
      while(n && n.nodeType===3){ var suiv=n.nextSibling; k.removeChild(n); n=suiv; }
      var txt=document.createElement('span');
      txt.className='k-num'; txt.textContent='étape '+code;
      k.insertBefore(txt,k.firstChild);
      var past=document.createElement('span');
      past.className='k-seance'; past.textContent='S'+num;
      k.insertBefore(past,k.firstChild);
    });
  });
}

/* Index et nom d'une étape, lus une seule fois pour tout le monde :
   le sommaire, la barre et les lignes repliées doivent dire la même
   chose. (L'index vient encore du .step-kicker écrit à la main ; le
   lot 4 le calculera.) */
function propreTxt(n){ return n?n.textContent.replace(/\s+/g,' ').trim():''; }
/* Comme propreTxt, mais sans l'index : les bandeaux .fl / .pl / .bonus-head
   ouvrent par un <span class="ix"> que numeroter() remplit. Le lire avec le
   reste affichait le numéro deux fois de suite dans le sommaire et dans les
   lignes repliées — « 1.5 · 1.5Fierté française ». On copie le nœud pour
   ne rien retirer de ce que l'élève voit à l'écran. */
function propreTxtSansIx(n){
  if(!n) return '';
  var c=n.cloneNode(true), ix=c.querySelector('.ix');
  if(ix) ix.remove();
  return c.textContent.replace(/\s+/g,' ').trim();
}
function infosEtape(p){
  var k=propreTxt($('.step-kicker',p)||$('.ix',p)), mi=k.match(/([0-9D]+\.[0-9]+)/);
  if(p.dataset && p.dataset.num) mi=[p.dataset.num,p.dataset.num];
  var nom=propreTxt($('.step-title',p));
  if(!nom){
    var b=propreTxtSansIx($('.fl',p)||$('.pl',p)||$('.bl',p));
    nom = b ? b.split('·')[0].split('—')[0].trim() : 'Étape';
  }
  return { ix: mi?mi[1]:'', nom: nom };
}

/* ---------- Lignes d'étape : repliée (faite) et fantôme (à venir) ---------- */
function initLignes(){
  $$('.step').forEach(function(p){
    if($('.step-ligne',p)) return;
    var info=infosEtape(p);
    var b=document.createElement('button');
    b.type='button'; b.className='step-ligne';
    b.innerHTML='<span class="sl-ix"></span><span class="sl-titre"></span>'+
                '<span class="sl-etat"></span><span class="sl-chev">▾</span>';
    $('.sl-ix',b).textContent=info.ix;
    $('.sl-titre',b).textContent=info.nom;
    /* avant le contenu, quel qu'il soit : toutes les étapes n'ont pas
       de .card (encart France, « et toi ? », « pour aller plus loin »). */
    var apres=null;
    for(var i=0;i<p.children.length;i++){
      var e=p.children[i];
      if(e.classList.contains('rail')||e.classList.contains('step-pip')) continue;
      apres=e; break;
    }
    if(apres) p.insertBefore(b,apres); else p.appendChild(b);
    b.addEventListener('click',function(){
      /* une étape à venir ne s'ouvre pas d'ici : le bouton « Étape
         suivante » reste le seul geste pour avancer. */
      if(p.classList.contains('masque')) return;
      p.classList.remove('replie');
      majLignes();
      defilerVers(p);
    });
  });
  majLignes();
}
function majLignes(){
  $$('.step').forEach(function(p){
    var e=$('.sl-etat',p); if(!e) return;
    /* Trois états et non deux : « rendu, pas encore relu » doit se
       lire ICI aussi, pas seulement sur la pastille de l'étape.
       Sans cela, la colonne de gauche affiche « validée » alors que
       le professeur n'a rien lu.

       ⚠ BOUCLE INFINIE ÉVITÉE ICI (01/08/2026, page bloquée au
       chargement). Un MutationObserver surveille TOUT changement de
       classe dans .steps et rappelle majBarre() → majLignes(). Un
       classList.remove/add inconditionnel se redéclenchait donc
       lui-même sans fin, et l'onglet se figeait.
       Règle : dans cette fonction, ne JAMAIS écrire une classe ou un
       texte sans avoir vérifié qu'il change réellement. Toute
       écriture inconditionnelle relance l'observateur. */
    var att = p.classList.contains('attente-corr')
              && !p.classList.contains('masque')
              && !p.classList.contains('is-wait');
    if(e.classList.contains('att') !== att) e.classList.toggle('att', att);

    var txt;
    if(p.classList.contains('masque'))       txt='à venir';
    else if(p.classList.contains('is-wait')) txt='en attente de correction';
    else if(att)                             txt='rendu · en attente';
    else if(p.classList.contains('is-done')) txt='validée';
    else txt='';
    if(e.textContent!==txt) e.textContent=txt;

    var b=$('.step-ligne',p);
    if(b){
      var lab = p.classList.contains('masque')
        ? 'Étape à venir : '+infosEtape(p).nom
        : 'Rouvrir l\u2019étape '+infosEtape(p).nom;
      if(b.getAttribute('aria-label')!==lab) b.setAttribute('aria-label',lab);
    }
  });
}
/* Replie les étapes faites. JAMAIS au moment de la validation :
   l'élève vient de recevoir sa correction — message des trous,
   verdict, « à retenir » révélé — et doit pouvoir la lire. On replie
   quand il passe à la suite, et à son retour sur la page. */
function replierFaites(sec){
  $$('.step',sec||document).forEach(function(p){
    if(p.classList.contains('is-done') && !p.classList.contains('masque')) p.classList.add('replie');
  });
  majLignes();
}

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
    h+='<div class="grp-bloc" data-grp="'+esc(sec.id)+'">'+
       '<button class="grp" type="button">'+(num?'<span class="sn">'+esc(num)+'</span>':'')+
       esc(reste)+'<span class="grp-etat"></span><span class="grp-chev">\u25be</span></button>'+
       '<div class="grp-corps">';
    $$('.step',sec).forEach(function(p,i){
      if(!p.id) p.id='et-'+sec.id+'-'+i;
      var info=infosEtape(p), ix=info.ix, lab=info.nom;
      var d=p.dataset.echeance||'';
      h+='<a class="it" href="#'+p.id+'" data-cible="'+p.id+'">'+
         '<span class="pip2"></span><span class="txt">'+
         (ix?'<span class="ix">'+esc(ix)+'</span>':'')+esc(lab)+
         (d?'<span class="date">'+esc(d)+'</span>':'')+'</span></a>';
    });
    h+='</div></div>';
  });
  box.innerHTML=h;
  document.body.appendChild(box);
  box.querySelector('.reduire').addEventListener('click',function(){
    document.body.classList.add('prog-reduit');
  });
  /* poignée : sur mobile la feuille se ferme en tirant vers le bas ;
     c'est le même geste que fermer, donc le même bouton. */
  var poignee=document.createElement('button');
  poignee.type='button'; poignee.className='prog-poignee';
  poignee.setAttribute('aria-label','Fermer le sommaire');
  poignee.addEventListener('click',function(){ document.body.classList.add('prog-reduit'); });
  box.insertBefore(poignee,box.firstChild);
  /* une séance se plie : avec 26 étapes, une liste plate déborde de
     l'écran d'un téléphone et redit exactement le problème qu'on
     cherche à résoudre. */
  $$('.grp',box).forEach(function(t){
    t.addEventListener('click',function(){
      t.parentNode.dataset.manuel='1';
      t.parentNode.classList.toggle('plie');
    });
  });

  /* --- Barre « tu es ici » (lot 2). Construite ici, à partir du DOM :
         aucune modification du HTML des séquences, donc rien à refaire
         page par page au moment du portage. --- */
  var b4=document.createElement('div');
  b4.id='prog4';
  var retour=$('nav.seances a.retour');
  /* Deux retours, pas un.
     Une flèche seule ne dit pas OÙ elle ramène, et il manquait le
     retour vers le sommaire du thème : depuis le bas d'une séquence
     de 26 étapes, l'élève n'avait aucun moyen de remonter à la carte
     autrement qu'en faisant défiler. Le second lien est ajouté par
     initHub(), seulement si un hub existe réellement sur la page —
     un bouton qui pointe vers une ancre absente est pire que rien. */
  var h4='<div class="p4-haut">'+
         '<span class="p4-nav">'+
         '<a class="p4-retour" href="'+esc(retour?retour.getAttribute('href'):'2nde-snt.html')+'" '+
           'title="Revenir à tous les thèmes SNT" aria-label="Revenir à tous les thèmes SNT">'+
           '<span aria-hidden="true">←</span><span class="p4-lab">Thèmes</span></a>'+
         '</span>'+
         '<span class="p4-fil">'+
           '<span class="p4-s"></span><span class="p4-seance"></span>'+
           '<span class="p4-sep">›</span><span class="p4-ix"></span>'+
           '<span class="p4-etape"></span></span>'+
         '<span class="p4-compte"></span>'+
         '<button class="p4-menu rouvrir" type="button" title="Sommaire" aria-label="Ouvrir ou fermer le sommaire">☰</button>'+
         '</div><div class="p4-jauge">';
  $$('.seance').forEach(function(sec){
    var t=$('.seance-head h2',sec), n='';
    if(t){ var sn=$('.s-num',t); n=sn?propre(sn):''; }
    h4+='<a class="p4-seg" href="#'+esc(sec.id)+'" data-seg="'+esc(sec.id)+'">'+
        '<i><b></b></i><s>'+esc(n)+'</s></a>';
  });
  h4+='</div>';
  b4.innerHTML=h4;
  var anc=wrapContenu();
  if(anc&&anc.parentNode) anc.parentNode.insertBefore(b4,anc);

  /* Hauteur réelle de la barre, mesurée APRÈS son insertion.
     Le CSS garde une valeur de repli, mais elle ne peut être
     qu'approximative : la barre change de hauteur selon la largeur
     d'écran, le nombre de séances et la longueur des libellés — et
     c'est elle qui décide si le titre d'une étape est visible ou
     caché à l'arrivée. On remesure au redimensionnement et à la
     rotation d'une tablette.
     Placer ce bloc AVANT l'insertion ne poserait rien : b4 n'a pas
     encore de hauteur (diagnostiqué au test le 01/08/2026). */
  (function hauteurBarre(){
    var poser=function(){
      var h=Math.round(b4.getBoundingClientRect().height);
      if(h>0) document.documentElement.style.setProperty('--barre-h', h+'px');
    };
    poser();
    if(window.ResizeObserver){ new ResizeObserver(poser).observe(b4); }
    else { window.addEventListener('resize',poser); }
    window.addEventListener('orientationchange',function(){ setTimeout(poser,220); });
  })();
  b4.querySelector('.p4-menu').addEventListener('click',function(){
    document.body.classList.toggle('prog-reduit');
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
    /* Une étape pas encore révélée n'est PAS cliquable, et doit le
       montrer. Avant : le href pointait vers une étape masquée — le
       clic partait, il ne se passait rien, et le survol allumait
       quand même un cadre gris. Une promesse de clic sans clic est
       pire qu'un verrou visible. On retire donc le href (ce qui la
       sort aussi de la tabulation) et on l'annonce aux lecteurs
       d'écran ; le CSS pose le cadenas. */
    if(lien.classList.contains('locked')){
      lien.removeAttribute('href'); lien.setAttribute('aria-disabled','true');
    } else {
      lien.setAttribute('href','#'+p.id); lien.removeAttribute('aria-disabled');
    }
  });
  var pc=pas.length?Math.round(faits*100/pas.length):0;

  /* Le fil d'Ariane ne suit PAS le même pointeur que le sommaire.
     Le sommaire surligne l'étape ouverte ; le fil doit dire « ce qui
     te reste à faire », donc il compte aussi une étape pas encore
     révélée — après avoir validé 1.1, on est en route vers 1.2, même
     si le bouton « Étape suivante » n'a pas encore été cliqué.
     En revanche il ne pointe JAMAIS dans une séance verrouillée :
     l'ancien bandeau le faisait, et annonçait une séance à laquelle
     l'élève n'avait pas accès. */
  var prof=document.body.classList.contains('teacher');
  courant=null;
  pas.some(function(p){
    if(p.classList.contains('is-done')) return false;
    var sec=p.closest('.seance');
    if(sec && sec.classList.contains('locked') && !prof) return false;
    courant=p; return true;
  });
  $$('#prog .pct').forEach(function(e){ e.textContent=pc+' %'; });
  document.body.classList.toggle('a-commence', faits>0);

  /* --- Barre « tu es ici » : le fil d'Ariane dit la séance ET l'étape,
         la jauge segmentée dit où on en est dans l'ensemble. --- */
  var compte=$('#prog4 .p4-compte');
  if(compte) compte.textContent=faits+' / '+pas.length;

  var secCourante=courant?courant.closest('.seance'):null;
  var elS=$('#prog4 .p4-s'), elSeance=$('#prog4 .p4-seance'),
      elIx=$('#prog4 .p4-ix'), elEtape=$('#prog4 .p4-etape'), elSep=$('#prog4 .p4-sep');
  if(elS){
    if(secCourante){
      var titre=$('.seance-head h2',secCourante), num='', nom='';
      if(titre){
        var sn=$('.s-num',titre); num=sn?sn.textContent.replace(/\s+/g,' ').trim():'';
        var c2=titre.cloneNode(true), sn2=c2.querySelector('.s-num');
        if(sn2) sn2.remove();
        nom=c2.textContent.replace(/\s+/g,' ').trim();
      }
      elS.textContent=num; elS.style.display='';
      var b4=document.getElementById('prog4');
      if(b4) b4.dataset.sc=secCourante.getAttribute('data-seance')||'';
      elSeance.textContent=nom;
      /* l'index et le nom de l'étape sont repris du sommaire déjà construit */
      var lien=BARRE.querySelector('[data-cible="'+courant.id+'"] .txt');
      var ix='', libelle='';
      if(lien){
        var c3=lien.cloneNode(true), ixe=c3.querySelector('.ix'), dte=c3.querySelector('.date');
        ix=ixe?ixe.textContent.trim():''; if(ixe) ixe.remove(); if(dte) dte.remove();
        libelle=c3.textContent.replace(/\s+/g,' ').trim();
      }
      elIx.textContent=ix;
      elEtape.textContent=libelle;
      if(elSep) elSep.style.display=libelle?'':'none';
    } else {
      /* tout est fait : le fil ne montre plus d'étape en cours */
      elS.style.display='none'; elSeance.textContent='Séquence terminée';
      elIx.textContent=''; elEtape.textContent='';
      if(elSep) elSep.style.display='none';
    }
  }

  if(typeof majLignes==='function') majLignes();
  if(typeof majHub==='function') majHub();

  $$('#prog .grp-bloc').forEach(function(bloc){
    var sec=document.getElementById(bloc.dataset.grp); if(!sec) return;
    var dedans=$$('.step',sec);
    var f=dedans.filter(function(x){ return x.classList.contains('is-done'); }).length;
    /* Au niveau de la séance aussi : S2 et S3 avaient l'air de simples
       titres inertes. Elles sont pliables (c'est utile), mais rien ne
       disait qu'elles étaient verrouillées. */
    var verrouS=sec.classList.contains('locked')&&!document.body.classList.contains('teacher');
    bloc.classList.toggle('verrou',verrouS);
    var e=$('.grp-etat',bloc);
    if(e) e.textContent=verrouS?'\uD83D\uDD12':(f+'/'+dedans.length);
    var bt=$('.grp',bloc);
    if(bt) bt.title=verrouS?'Séance pas encore ouverte':'';
    /* pliage automatique : seule la séance où l'on travaille reste
       ouverte, sauf si l'élève en a décidé autrement d'un clic. */
    if(!bloc.dataset.manuel) bloc.classList.toggle('plie',sec!==secCourante);
  });

  $$('#prog4 .p4-seg').forEach(function(seg){
    var sec=document.getElementById(seg.dataset.seg); if(!sec) return;
    var dedans=$$('.step',sec);
    var f=dedans.filter(function(p){ return p.classList.contains('is-done'); }).length;
    var jauge=seg.querySelector('b');
    if(jauge) jauge.style.width=(dedans.length?Math.round(100*f/dedans.length):0)+'%';
    var verrou=sec.classList.contains('locked') && !document.body.classList.contains('teacher');
    seg.classList.toggle('verrou',verrou);
    seg.classList.toggle('ici',sec===secCourante);
    seg.setAttribute('aria-disabled',verrou?'true':'false');
  });
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
    /* La consigne dit la vérité selon l'étape qui porte le QCM : un bloc
       posé dans un bonus (pas de data-gate) n'entre ni dans la validation
       ni dans les 100 %, et l'annoncer « obligatoire » était faux — c'était
       déjà le cas de WEB-Q2b dans la séquence du Web. */
    var etapeDuQcm=box.closest('[data-step]');
    var obligatoire=!!(etapeDuQcm && etapeDuQcm.hasAttribute('data-gate'));
    lanceur.innerHTML='<span class="ql">✍️ QCM · '+data.length+(data.length>1?' questions':' question')+'</span>'+
                      '<span class="qcm-consigne" style="font-size:13.5px;color:'+(obligatoire?'#8a4c0c':'var(--ink-soft)')+'">'+
                      (obligatoire?"Obligatoire pour valider l'étape.":"Facultatif : ne compte pas dans ta progression.")+'</span>'+
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
    /* CHOIX MULTIPLE (01/08/2026) : si q.r est un TABLEAU d'indices,
       on bascule en mode « coche tout ce qui convient ». Un entier
       reste un choix unique — tous les QCM déjà écrits fonctionnent
       sans être touchés.
       Le mode multiple ne valide pas au clic : il faut cocher puis
       confirmer, sinon le premier clic fermerait la question. */
    var multi = Array.isArray(q.r);
    if(multi){
      var c=document.createElement('p');
      c.className='qmulti-consigne';
      c.textContent='Coche tout ce qui convient ('+q.r.length+' réponses), puis valide.';
      zone.appendChild(c);
    }
    q.o.forEach(function(txt,k){
      var b=document.createElement('button');
      b.type='button'; b.className='qopt'+(multi?' qmulti':'');
      /* Le libellé d'une option peut porter du balisage — <code> pour
         une adresse IP, <sup> pour « 1er ». La question (q.q) passait
         déjà par innerHTML ; l'option, elle, était en textContent et
         affichait « <code>192.168.1.226</code> » en toutes lettres.
         Incohérence corrigée le 01/08/2026 (signalée en test réel).
         On n'ouvre pas innerHTML en grand pour autant : seules
         quelques balises de mise en forme sont rendues, le reste
         reste du texte. La source est le fichier de cours, donc de
         confiance — mais une réponse d'élève ne doit JAMAIS passer
         par ce chemin (voir rendreRetour, qui échappe tout). */
      b.innerHTML = baliserSobre(txt);
      if(multi){
        b.setAttribute('aria-pressed','false');
        b.addEventListener('click',function(){
          var on=b.classList.toggle('coche');
          b.setAttribute('aria-pressed', on?'true':'false');
          var valider=zone.parentNode.querySelector('.qmulti-ok');
          if(valider) valider.disabled = !zone.querySelector('.qopt.coche');
        });
      } else {
        b.addEventListener('click',function(){ repondre(k); });
      }
      zone.appendChild(b);
    });
    if(multi){
      var v=document.createElement('button');
      v.type='button'; v.className='qmulti-ok'; v.disabled=true;
      v.textContent='Valider ma réponse';
      v.addEventListener('click',function(){
        var choisis=[];
        $$('.qopt',pan).forEach(function(b,n){ if(b.classList.contains('coche')) choisis.push(n); });
        repondre(choisis);
      });
      pan.appendChild(v);
    }
  }
  /* Échappe tout, puis restaure une courte liste de balises de mise en
     forme. Ordre important : on échappe D'ABORD, sinon un attribut
     malicieux passerait. */
  function baliserSobre(t){
    var e = String(t)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    return e.replace(/&lt;(\/?)(code|b|i|sup|sub|em|strong|abbr)&gt;/g, '<$1$2>');
  }
  function repondre(k){
    var q=data[i], multi=Array.isArray(q.r);
    /* En multiple, k est un tableau d'indices. Juste = exactement le
       bon ensemble : ni oubli, ni case en trop. Cocher tout ne doit
       pas donner le point. */
    var attendus = multi ? q.r.slice().sort(function(a,b){return a-b;}) : null;
    var bon = multi
      ? (k.length===attendus.length && k.slice().sort(function(a,b){return a-b;})
           .every(function(v,n){ return v===attendus[n]; }))
      : (k===q.r);
    resultats[i]={bon:bon,choix:k};
    var estBonne = function(n){ return multi ? q.r.indexOf(n)>=0 : n===q.r; };
    var aChoisi  = function(n){ return multi ? k.indexOf(n)>=0 : n===k; };
    $$('.qopt',pan).forEach(function(b,n){
      b.disabled=true;
      b.classList.remove('coche');
      if(estBonne(n)) b.classList.add('bon');
      else if(aChoisi(n)) b.classList.add('mauvais');
    });
    var ok=pan.querySelector('.qmulti-ok'); if(ok) ok.remove();
    var libelle = multi
      ? q.r.map(function(n){ return q.o[n]; }).join(' + ')
      : q.o[q.r];
    var f=document.createElement('div');
    f.className='qfeed';
    f.innerHTML=(bon?'<b>Bonne réponse.</b> ':'<b>Il fallait : '+libelle+'.</b> ')+(q.c||'');
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

    /* Variante « étiquette compacte » (25/07/2026) : le texte des indices ne
       s'insère plus dans le flux du paragraphe — il se range ici, en pied de
       bloc, relié au trou par un numéro. Le paragraphe ne bouge plus. */
    var pied=document.createElement('div'); pied.className='indices-pied';
    bloc.insertBefore(pied,msg);

    /* Aide « où chercher » (25/07/2026). Sur un exercice de lecture de document
       — carte, schéma —, l'information est déjà à l'écran : la seule aide
       légitime dit OÙ la trouver, jamais ce qu'elle est. Elle est donc visible
       d'emblée, comme une consigne, et aucun indice de contenu n'est installé.
       Retirer data-aide="localisation" du bloc restaure les indices : les
       attributs data-indice1/2 restent en place, rien n'est perdu. */
    var aideLoc = bloc.dataset.aide === 'localisation';
    if(aideLoc && bloc.dataset.ou){
      var ou=document.createElement('div'); ou.className='cloze-ou';
      var lab=document.createElement('b'); lab.textContent='Où chercher';
      ou.appendChild(lab);
      ou.appendChild(document.createTextNode(' — '+bloc.dataset.ou));
      bloc.insertBefore(ou, bloc.firstChild);
    }

    $$('input[data-answer]',bloc).forEach(function(inp,rang){
      /* La largeur suit la réponse attendue au lieu d'être imposée en pixels :
         le rythme typographique du paragraphe est préservé. Marge de 2 pour ne
         pas livrer la longueur exacte, bornes pour rester lisible. */
      if(!inp.getAttribute('size')){
        var L=(inp.dataset.answer||'').length;
        var court=inp.classList.contains('short');
        inp.setAttribute('size', String(court
          ? Math.min(8, Math.max(3, L+1))
          : Math.min(18, Math.max(5, L+2))));
      }
      if(aideLoc || !inp.dataset.indice1) return;

      var num=document.createElement('sup');
      num.className='num-trou'; num.textContent=String(rang+1); num.hidden=true;
      inp.insertAdjacentElement('afterend',num);

      var b=document.createElement('button');
      b.type='button'; b.className='indice'; b.textContent='indice';
      b.dataset.niveau='0';
      /* Audit Loïc : aucun indice tant que l'élève n'a pas tenté sa chance, puis
         seulement en face des trous faux. Le bouton est créé mais masqué. */
      b.hidden = true;
      inp._indiceBtn = b; inp._indiceNum = num; inp._indiceRang = rang+1;
      num.insertAdjacentElement('afterend',b);

      b.addEventListener('click',function(){
        var n=parseInt(b.dataset.niveau,10)+1;
        var t=inp.dataset['indice'+n];
        if(!t){ b.disabled=true; return; }
        b.dataset.niveau=n;
        var item=pied.querySelector('[data-trou="'+rang+'"]');
        if(!item){
          item=document.createElement('div');
          item.className='ind-item'; item.dataset.trou=String(rang);
          item.innerHTML='<span class="ind-num"></span><span class="ind-txt"></span>';
          item.querySelector('.ind-num').textContent=String(rang+1);
          pied.appendChild(item);
        }
        item.querySelector('.ind-txt').textContent=t;
        if(!inp.dataset['indice'+(n+1)]) b.disabled=true;
      });
    });
    bloc._piedIndices = pied;

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
          /* le numéro n'apparaît qu'avec l'indice : tant que tout va bien, le
             paragraphe reste propre */
          if(inp._indiceNum) inp._indiceNum.hidden = !faux;
          if(!faux && bloc._piedIndices){
            var vieux=bloc._piedIndices.querySelector('[data-trou="'+(inp._indiceRang-1)+'"]');
            if(vieux) vieux.remove();
          }
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
        h+='<span class="m-ko">'+(n-ok)+' réponse(s) à revoir.'
             + (aideLoc
                ? ' Tout est dans le document : relis le rappel « Où chercher » en haut de l\'exercice.'
                : ' Un bouton <b>indice</b> vient d\'apparaître sur chacune d\'elles : le texte s\'affiche juste en dessous de l\'exercice.')
             + '</span>';
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


/* ============================================================
   RÉVÉLATION CONDITIONNELLE (lot 3 — 26/07/2026)
   ------------------------------------------------------------
   Deux demandes de la relecture de Loïc, qui sont la même idée prise
   par les deux bouts :

     « le bilan ne doit s'afficher que s'il y a des réponses à toutes
      les questions précédentes, dans la totalité de l'étape »
     « quand il y a une question d'intuition avant tout, le reste de
      l'étape ne devrait pas être visible »

   Autrement dit : le corrigé ne se lit pas avant d'avoir cherché, et
   le cours ne se lit pas avant d'avoir dit ce qu'on croyait savoir.
   Le bouton « Afficher le à retenir » reste dans la page, mais il ne
   sert plus qu'à dire ce qui manque : la révélation, elle, se fait
   toute seule dès la dernière réponse.

   Ce moteur ne CORRIGE rien et ne valide rien — il regarde seulement
   si les champs sont remplis. Un élève qui répond faux voit son
   « à retenir » comme les autres : c'est justement là qu'il en a le
   plus besoin.
   ============================================================ */
function bqRempli(el,step){
  if(el.matches('[data-focus]'))
    return el.classList.contains('rempli') ||
           !!(el.querySelector('[data-focus-echo]') || {textContent:''}).textContent.trim();
  if(el.matches('.qcmbox')){
    /* Trois traces possibles, et il faut les trois : « ✓ déjà fait » n'est
       posé qu'à la restauration d'une session précédente, le score n'est
       en dataset que si le moteur l'y a mis, et le récapitulatif est ce
       qui apparaît immédiatement après un QCM passé dans la séance en
       cours. N'en lire qu'une laissait le bilan fermé juste après un QCM
       tout juste terminé. */
    if(el.querySelector('.qcm-fait')) return true;
    if(step && step.dataset && step.dataset.qcmScore) return true;
    var rec=el.querySelector('.qcm-recap');
    return !!(rec && rec.textContent.trim());
  }
  if(el.matches('[data-tri]'))
    return !!(step && step.dataset && step.dataset.triScore);
  if(el.matches('.label-selects,.cloze')){
    var ch=el.querySelectorAll('select,input');
    if(!ch.length) return true;
    return Array.prototype.every.call(ch,function(x){ return x.value && x.value.trim(); });
  }
  if(el.matches('textarea')) return !!el.value.trim();
  return true;
}
/* Combien de blocs de réponse restent vides dans cette étape. On ne
   regarde ni le bloc bilan lui-même (il contiendrait sa propre
   réponse) ni les « pour aller plus loin » (hors 100 %). */
function bqReste(step,saufDans){
  var sel='[data-focus],.qcmbox,.label-selects,.cloze,[data-tri],.perso textarea';
  var n=0;
  $$(sel,step).forEach(function(el){
    if(saufDans && saufDans.contains(el)) return;
    if(el.closest('.bonus-wrap')) return;
    if(el.closest('[data-bilan-wrap]')) return;
    /* un .field qui enveloppe un .label-selects ne compte qu'une fois */
    if(el.matches('[data-focus]') && el.querySelector('.label-selects,.cloze')) return;
    if(!bqRempli(el,step)) n++;
  });
  return n;
}
function bqMaj(){
  /* 1. le « à retenir » / bilan de fin d'étape */
  $$('[data-bilan-wrap]').forEach(function(wrap){
    var step=wrap.closest('[data-step]'); if(!step) return;
    var btn=$('[data-reveal-bilan]',step);
    if(wrap.dataset.ouvert==='1'){ wrap.hidden=false; if(btn) btn.style.display='none'; return; }
    var reste=bqReste(step,wrap);
    if(reste===0){
      wrap.hidden=false;
      wrap.dataset.ouvert='1';
      if(btn) btn.style.display='none';
    }else{
      wrap.hidden=true;
      if(btn){
        btn.style.display='';
        btn.disabled=true;
        btn.textContent=(reste===1)
          ? '\uD83D\uDD12 Encore une r\u00e9ponse et le \u00ab \u00e0 retenir \u00bb s\u2019affiche'
          : '\uD83D\uDD12 Le \u00ab \u00e0 retenir \u00bb s\u2019affichera : '+reste+' r\u00e9ponses \u00e0 compl\u00e9ter';
      }
    }
  });
  /* 2. les portes d'intuition : tant que la question d'ouverture est
        vide, la suite de l'étape n'est pas là. */
  $$('[data-porte]').forEach(function(porte){
    var ta=$('textarea',porte);
    var ouvert=!!(ta && ta.value.trim());
    var n=porte.nextElementSibling;
    while(n){ n.classList.toggle('porte-close',!ouvert); n=n.nextElementSibling; }
    var mot=$('.porte-mot',porte);
    if(!mot){
      mot=document.createElement('div');
      mot.className='porte-mot';
      porte.appendChild(mot);
    }
    mot.textContent=ouvert ? '' :
      '\u2193 \u00c9cris ton intuition : la suite de l\u2019\u00e9tape s\u2019ouvrira juste apr\u00e8s.';
    mot.hidden=ouvert;
  });
}

/* ---------- Révélation du « à retenir » après l'activité (nouveau, 22/07/2026) ---------- */
function initBilan(){
  $$('[data-reveal-bilan]').forEach(function(btn){
    btn.addEventListener('click',function(){
      /* Le bouton est désormais désactivé tant que l'étape n'est pas
         répondue : ce clic ne survient donc qu'en mode enseignant, où il
         faut pouvoir montrer le corrigé au tableau sans tout remplir. */
      var card=btn.closest('.card-body')||document;
      var wrap=$('[data-bilan-wrap]',card);
      if(wrap){ wrap.hidden=false; wrap.dataset.ouvert='1'; }
      btn.style.display='none';
    });
  });
  bqMaj();
  ['input','change','etape-validee'].forEach(function(ev){
    document.addEventListener(ev,bqMaj);
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
      placerBoutonSuivant(sec);
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

    replierFaites();          /* retour sur la page : le couloir se raccourcit */

    if(!quelqueChose) return;

    /* 4. déverrouillage des séances et sommaire à jour. L'écouteur
          d'IIFE 1 rappelle refresh() ; la cible sans .closest est
          ignorée par l'enregistreur, aucune écriture parasite. */
    document.dispatchEvent(new CustomEvent('etape-validee',{bubbles:true}));
    majBarre();
    /* le hub APRÈS refresh() : avant, les séances que la reprise vient
       de déverrouiller sont encore marquées locked, et la carte de
       reprise ne trouve aucune étape où revenir. */
    if(typeof majHub==='function') majHub();
    if(typeof hubReprise==='function') hubReprise();

    /* 5. replacement silencieux sur la première étape non faite.
          Une ancre explicite dans l'URL reste prioritaire : elle vient
          d'une intention, pas d'un retour. */
    if(location.hash) return;
    $$('.step').forEach(function(p){
      if(!courant && !p.classList.contains('is-done') && !p.classList.contains('masque')) courant=p;
    });
    /* Collé en haut, comme tous les autres défilements.
       Le centrage venait d'un contournement : la barre « tu es ici »
       est collante et mangeait le début de l'étape. Ce n'est plus le
       cas depuis scroll-margin-top (CSS, 01/08/2026), qui réserve sa
       hauteur — le titre est donc visible sans centrer.
       Et on veut voir le titre en arrivant : centrer plaçait le nom
       de l'étape hors champ vers le haut, ce qui était précisément
       le défaut signalé. */
    defilerVers(courant, false);
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
  numeroter();
  initReveal();
  compteurSeances();
  initEvaluabilite();
  construireBarre();
  initLignes();
  initHub();
  initEnseignant();
  initQcm();
  initCloze();
  initGlossaire();
  initZoom();
  initDepot();
  initCalc();
  initBilan();
  var obs=new MutationObserver(function(){ majBarre(); bqMaj(); });
  $$('.steps').forEach(function(s){ obs.observe(s,{attributes:true,subtree:true,attributeFilter:['class']}); });
  restaurer();
  document.body.classList.add('js-ok');   /* la nav ne se masque qu'ici */
  /* le nom du thème vient de la page : ce moteur sert les huit séquences */
  console.log('%c'+(document.title.split('—')[0].trim()||'SNT')+
    ' — tu as ouvert l\'inspecteur. Bravo, c\'est exactement comme ça qu\'on apprend.','color:#2445c7');
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
    /* Validation de l'étape (§13.7 : « avoir proposé suffit »), MAIS
       pas dès le premier clic sur Vérifier.
       Constaté en test réel le 01/08/2026 : la frise se marquait faite
       au premier essai, même avec un seul élément bien placé — et le
       pop-up « Séance terminée » s'ouvrait pendant que l'élève
       replaçait encore ses dates.
       Sur un tri, vérifier n'est pas rendre : on valide quand l'ordre
       est juste, ou au 3e essai (l'élève a alors vraiment cherché, et
       on ne bloque personne sur une frise difficile). */
    var etape=champ.closest('.step');
    if(etape){
      var essais = (parseInt(etape.dataset.triEssais,10) || 0) + 1;
      etape.dataset.triEssais = essais;
      etape.dataset.triScore = bon+'/'+n;
      if(bon===n || essais>=3){
        etape.classList.add('is-done');
        etape.dispatchEvent(new CustomEvent('etape-validee',{bubbles:true}));
      } else if(v){
        v.textContent += ' (essai '+essais+' sur 3)';
      }
    }
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
    if(suite) defilerVers(suite);
  });
});
})();
