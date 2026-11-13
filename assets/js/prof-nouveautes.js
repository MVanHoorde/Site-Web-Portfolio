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
    n: 9,
    date: '2026-11-13',
    espaces: ['es1'],
    titre: 'Les cristaux : des figures en 3D',
    points: [
      {
        titre: 'Des mailles à faire tourner',
        texte: 'Les trois mailles (éclatées et compactes), le diamant et le graphite se tournent au doigt ; les six mailles tournent ensemble. ⤢ les agrandit, pratique au tableau.',
        visuel:
          '<div class="nv-ecran">' +
            '<div class="nv-ligne"><span class="nv-puce">CS</span><span class="nv-puce">CC</span><span class="nv-puce">CFC</span><span>↻ fais-moi tourner</span><span class="nv-bouton">⤢</span></div>' +
          '</div>'
      },
      {
        titre: 'Deux animations revues',
        texte: 'Figure 1 : un vrai zoom arrière, des nanomètres au centimètre. Figure 12 : les couches A, B, A s’empilent, puis la maille hexagonale apparaît.',
        visuel:
          '<div class="nv-ecran">' +
            '<div class="nv-ligne"><span class="nv-puce">5 nm</span><span>→</span><span class="nv-puce">10 µm</span><span>→</span><span class="nv-puce">2 cm</span></div>' +
          '</div>'
      }
    ]
  },
  {
    n: 8,
    date: '2026-11-13',
    espaces: ['es1'],
    titre: 'ES 1re : « Les cristaux » est ouvert',
    points: [
      {
        titre: 'Un troisième chapitre pour vos élèves',
        texte: 'Quatre séances, dont une de révision : du cristal à la maille, la compacité, la masse volumique. Lien sur la page de première, fiche de séance en PDF, rappels d’entrée de séance.',
        visuel:
          '<div class="nv-ecran">' +
            '<div class="nv-ligne"><span class="nv-puce">C1 Nucléosynthèse</span><span class="nv-puce">C2 Radioactivité</span><span class="nv-puce">C3 Cristaux ✨</span></div>' +
          '</div>'
      }
    ]
  },
  {
    n: 7,
    date: '2026-11-11',
    espaces: ['snt', 'es1', 'est', 'pc2', 'cfa'],
    titre: 'Suivi : le thème en cours, et un export pour Excel',
    points: [
      {
        titre: 'Le Suivi s’ouvre là où en est la classe',
        texte: 'Plus besoin de chercher le thème ou le chapitre : c’est celui de la dernière séance clôturée, ou le suivant s’il est terminé. Le menu reste là pour en changer.',
        visuel:
          '<div class="nv-ecran">' +
            '<div class="nv-ligne"><span class="nv-bouton">2nde 3 ▾</span><span class="nv-bouton">Thème 2 ▾</span><span class="nv-puce">en cours</span></div>' +
          '</div>'
      },
      {
        titre: 'Les résumés de la classe dans un fichier',
        texte: '« ⬇ Exporter les résumés », sous la classe : un élève par ligne, les étapes validées de chaque séance, un % par thème. Sans les noms, sauf si vous cochez « avec les noms ».',
        visuel:
          '<div class="nv-ecran">' +
            '<div class="nv-ligne"><span class="nv-bouton">⬇ Exporter les résumés</span><span>☐ avec les noms</span></div>' +
          '</div>'
      }
    ]
  },
  {
    n: 6,
    date: '2026-11-12',
    espaces: ['emc'],
    titre: 'EMC : le harcèlomètre dit ce que dit la loi',
    points: [
      {
        titre: 'Après « Révéler », la loi',
        texte: 'Pour chaque situation : ce que dit la loi, ce qu’on risque, que faire, et les articles. Sur les tablettes et, au tableau, dans une tuile à côté du harcèlomètre.',
        visuel:
          '<div class="nv-ecran">' +
            '<div class="nv-ligne"><span class="nv-puce">⚖️ Ce qu’on risque</span><span class="nv-puce">Que faire ?</span></div>' +
          '</div>'
      },
      {
        titre: 'La loi en bref, et des chiffres',
        texte: 'Une tuile en rappel pour discuter : délit de 2022, mineurs, réseaux, démarches, et trois chiffres pour la France. Tout se retouche dans Contenus → Étape 6.',
        visuel:
          '<div class="nv-ecran">' +
            '<div class="nv-ligne"><span class="nv-puce">2 %</span><span class="nv-puce">37 %</span><span class="nv-puce">124 500</span></div>' +
          '</div>'
      }
    ]
  },
  {
    n: 5,
    date: '2026-11-12',
    espaces: ['emc'],
    titre: 'EMC : la restitution de vendredi, revue après jeudi',
    points: [
      {
        titre: 'Une table par atelier, selon les préférences',
        texte: 'Les élèves classent leurs 3 ou 4 ateliers. « Proposer les groupes » place chacun à la table de son atelier (atelier 3 → table 3), le 1er choix d’abord, tirage au sort s’il y a trop de monde.',
        visuel:
          '<div class="nv-ecran">' +
            '<div class="nv-ligne"><span class="nv-puce">Table 1 · 🦊</span><span class="nv-puce">Table 2 · 🚀</span><span class="nv-puce">Table 3 · 🌵</span></div>' +
          '</div>'
      },
      {
        titre: 'Le mur : chaque groupe en plein écran',
        texte: 'Au tableau, une tuile par table, qu’on touche pour la déplier. Puis « 🎲 Tirer au sort » met un groupe en plein écran, et « Couleur suivante » dévoile ses post-it couleur par couleur.',
        visuel:
          '<div class="nv-ecran">' +
            '<div class="nv-ligne"><span class="nv-bouton">🎲 Tirer au sort</span><span class="nv-bouton">Couleur suivante ▶</span></div>' +
          '</div>'
      },
      {
        titre: 'Un retour anonyme, et le classement des ateliers',
        texte: 'À la fin, les élèves donnent leur avis sur les deux jours, sur chaque atelier fait, le jeu de rôle et la restitution. Onglet « 📊 Retours » : le classement des ateliers. La définition, elle, s’écrit sur le livret.',
        visuel:
          '<div class="nv-ecran">' +
            '<div class="nv-ligne"><span class="nv-bouton">📊 Retours</span><span class="nv-puce">1. Atelier A · 4,2 / 5</span></div>' +
          '</div>'
      }
    ]
  },
  {
    n: 3,
    date: '2026-11-11',
    titre: 'La table des noms se charge directement depuis Excel',
    points: [
      {
        titre: 'Plus besoin d’enregistrer en CSV',
        texte: 'Dans Réglages → La table des noms, choisissez le classeur .xlsx tel qu’il est sur le OneDrive de l’établissement. Il est lu sur votre appareil et n’est jamais envoyé.',
        visuel:
          '<div class="nv-ecran">' +
            '<div class="nv-ligne"><span class="nv-bouton">📄 Table des noms.xlsx</span><span class="nv-puce">✓ 28 noms chargés</span></div>' +
          '</div>'
      }
    ]
  },
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
