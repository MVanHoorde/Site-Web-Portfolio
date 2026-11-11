/* ============================================================
 *  prof-nouveautes.js — les nouveautés annoncées aux enseignants
 *  (fenêtre « ✨ Nouveautés » du tableau de bord, prof-gestion.js)
 *
 *  À la connexion, un enseignant voit une fois les éditions qu'il
 *  n'a pas encore vues ; le numéro de la dernière vue est gardé en
 *  base (reglages_enseignant.nouveautes_vues.cours, bdd/schema/038),
 *  donc sur tous ses appareils. Il les revoit quand il veut :
 *  bouton « ✨ Nouveautés » de la barre du haut.
 *
 *  🔴 CONSIGNE DE LOÏC (11/11/2026) : toute évolution qui change
 *  quelque chose pour les collègues s'accompagne d'une édition ici,
 *  que Claude propose d'office.
 *
 *  AJOUTER UNE ÉDITION
 *   · en tête de liste, n = le plus grand numéro + 1 (jamais réutilisé) ;
 *   · espaces : les espaces concernés ('snt', 'es1', 'est', 'pc2',
 *     'cfa', 'emc') ; absent = tous. Un collègue ne voit que les
 *     éditions d'un espace où il a une classe ;
 *   · peu de mots : ce qui change, où le trouver, pas la technique ;
 *   · un visuel par point, en HTML avec les classes nv-… de
 *     prof-gestion.js (nv-ecran, nv-ligne, nv-case, nv-puce, nv-bouton…).
 * ============================================================ */
window.PROF_NOUVEAUTES = [
  {
    n: 2,
    date: '2026-11-11',
    espaces: ['emc'],
    titre: 'EMC : une projection à votre main, et un échange en deux tours',
    points: [
      {
        titre: 'Trois dispositions pour la projection',
        texte: 'En haut de la projection du Labyrinthe : « Rappel » (l’étape en grand, les précédentes à droite), « Étape seule » ou « Mosaïque ». Tout tient dans l’écran.',
        visuel:
          '<div class="nv-ecran">' +
            '<div class="nv-ligne"><span class="nv-bouton">▥ Rappel</span><span class="nv-bouton" style="opacity:.55">▢ Étape seule</span><span class="nv-bouton" style="opacity:.55">▦ Mosaïque</span></div>' +
          '</div>'
      },
      {
        titre: 'Agrandir ou masquer un bloc',
        texte: 'Sur chaque bloc (nuage de mots, émotions, carte mentale…) : ⤢ l’affiche seul en grand, 🙈 le masque. « 🙈 » en haut les rend. Les missions n’affichent que le verbe et la phrase : touchez-en une pour ses questions.',
        visuel:
          '<div class="nv-ecran">' +
            '<div class="nv-titre">Carte mentale <span style="float:right">⤢ 🙈</span></div>' +
            '<div class="nv-choix"><span class="nv-puce">Table 3</span> <b>Identifier</b> les actes…</div>' +
          '</div>'
      },
      {
        titre: 'Jeu de rôle : 2 tours de 10 minutes',
        texte: 'L’échange dure toujours 20 minutes, mais l’écran et les tablettes affichent le tour en cours. À la bascule, un grand « 🔄 On change ! » apparaît, avec un son. Et « Je suis prêt·e » ne se décoche plus.',
        visuel:
          '<div class="nv-ecran nv-coin">' +
            '<div class="nv-titre">Tour 1 sur 2 · 9:42</div>' +
            '<div class="nv-bulle">🔄 On change !</div>' +
          '</div>'
      }
    ]
  },
  {
    n: 1,
    date: '2026-11-11',
    titre: 'Vos élèves, votre affichage, un mot à M. Van Hoorde',
    points: [
      {
        titre: 'Masquer un élève, ou demander sa suppression',
        texte: 'Onglet Suivi → « 👥 Gérer les élèves de la classe ». « Masquer » retire un élève de votre suivi (élève parti, compte de test). « À supprimer » signale un compte en double : M. Van Hoorde l’efface, même s’il est aussi chez un collègue.',
        visuel:
          '<div class="nv-ecran">' +
            '<div class="nv-ligne nv-tete"><span>Élève</span><span>Masquer</span><span>À supprimer</span></div>' +
            '<div class="nv-ligne"><span class="nv-id">plume24</span><span class="nv-case"></span><span class="nv-case"></span></div>' +
            '<div class="nv-ligne nv-barre"><span class="nv-id">plume25 <i class="nv-puce">doublon</i></span><span class="nv-case"></span><span class="nv-case nv-oui nv-rouge">✓</span></div>' +
            '<div class="nv-ligne nv-pale"><span class="nv-id">essai-prof</span><span class="nv-case nv-oui">✓</span><span class="nv-case"></span></div>' +
          '</div>'
      },
      {
        titre: 'Des onglets à votre main',
        texte: 'Onglet Réglages → « Les onglets affichés » : décochez ceux qui ne vous servent pas. Rien n’est effacé, et le réglage vous suit sur vos autres appareils.',
        visuel:
          '<div class="nv-ecran">' +
            '<div class="nv-titre">Les onglets affichés</div>' +
            '<div class="nv-choix"><span class="nv-case nv-oui">✓</span> À corriger</div>' +
            '<div class="nv-choix"><span class="nv-case nv-oui">✓</span> Suivi</div>' +
            '<div class="nv-choix nv-pale"><span class="nv-case"></span> Défi S4</div>' +
          '</div>'
      },
      {
        titre: 'Écrire à M. Van Hoorde, sans quitter le tableau de bord',
        texte: 'Le bouton ✉️ de la barre du haut : une demande, une correction, un compte… Plus besoin de mot dans le casier. Sa réponse s’affiche au même endroit. Pas de nom d’élève : son pseudonyme suffit.',
        visuel:
          '<div class="nv-ecran nv-coin">' +
            '<span class="nv-bouton">✉️ Écrire à M. Van Hoorde</span>' +
            '<div class="nv-bulle">Bonjour, plume25 est un doublon de plume24.</div>' +
          '</div>'
      }
    ]
  }
];
