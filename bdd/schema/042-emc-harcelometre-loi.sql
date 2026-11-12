-- ============================================================
--  042 — EMC : le harcèlomètre dit ce que dit la loi (12/11/2026)
--
--  BESOIN (Loïc, 12/11/2026)
--  · Après le vote, une fois la zone attendue révélée, discuter du
--    droit : les textes de loi, ce qu'on encourt (prison, amende,
--    sanctions du lycée), les démarches (droit à l'image, preuves,
--    plainte, 3018), et quelques chiffres pour la France.
--
--  CE QUE FAIT CE FICHIER
--    §1  chaque situation reçoit un volet « loi » : titre, ce que
--        dit la loi, ce qu'on risque, que faire, textes ; une
--        situation qui a déjà le sien (retouché au tableau de bord)
--        le garde, une situation ajoutée à la main n'en a pas ;
--    §2  les repères généraux (délit de 2022, harcèlement à
--        plusieurs, mineurs, lycée, réseaux, démarches), la note sur
--        les peines et les chiffres, posés seulement s'ils manquent.
--
--  SOURCES (vérifiées le 12/11/2026)
--    Code pénal 222-33-2-2, 222-33-2-3 (loi n° 2022-299 du 2 mars
--    2022), 131-35-1 (loi SREN n° 2024-449 du 21 mai 2024), 222-13,
--    222-16, 226-1, 226-2, 226-2-1, 226-4-1, 226-8, 323-1, R621-2 ;
--    CJPM L121-5 et L121-7 ; Code civil art. 9 ; Code de
--    l'éducation L511-3-1 ; CPI L121-1.
--    Chiffres : enquête nationale du ministère (novembre 2025,
--    publiée le 9 juin 2026) ; baromètre Caisse d'Épargne –
--    e-Enfance/3018 (Audirep, mai 2025, publié le 30 octobre 2025) ;
--    rapport de transparence 2025 d'e-Enfance/3018.
--    Les peines sont les MAXIMA prévus pour un majeur.
--
--  Aucune donnée d'élève. Purement additif. Rejouable.
--  Banc : _outils/tests/emc-schema.test.mjs (§21)
--  Ordre de publication : ce fichier, PUIS le site.
-- ============================================================


-- ------------------------------------------------------------
--  1. Le volet « loi » de chaque situation
-- ------------------------------------------------------------
update public.emc_contenus c
   set valeur = jsonb_set(c.valeur, '{situations}', (
     select jsonb_agg(case when x.s ? 'loi' or l.loi is null then x.s
                           else x.s || jsonb_build_object('loi', l.loi) end
                      order by x.o)
       from jsonb_array_elements(c.valeur -> 'situations') with ordinality as x(s, o)
       left join (values

('s10', $j${
  "titre": "Pas de délit : c'est la liberté d'expression",
  "texte": "Une blague, une seule fois, que la personne visée prend bien, n'est ni du harcèlement ni une infraction. Le harcèlement suppose une répétition, ou plusieurs personnes qui s'y mettent. Attention quand même : rire avec les autres n'est pas toujours rire de bon cœur.",
  "risque": "Rien, tant que la blague reste isolée. Mais si elle vise l'origine, la religion, le sexe, l'orientation sexuelle ou un handicap, c'est une injure discriminatoire, punissable même « pour rire ».",
  "demarches": "Si la même blague revient chaque jour, ce n'est plus une blague : en parler.",
  "source": "Code pénal, art. 222-33-2-2 (la répétition) ; loi du 29 juillet 1881 (l'injure)."
}$j$::jsonb),

('s1', $j${
  "titre": "Harcèlement scolaire, en ligne, et droit à l'image",
  "texte": "Exposer des camarades au jugement de tous, avec leur photo, c'est s'en prendre à leur dignité devant un public. Celui qui organise entraîne les autres. Et utiliser la photo de quelqu'un sans son accord porte atteinte à son droit à l'image.",
  "risque": "Harcèlement scolaire : jusqu'à 3 ans de prison et 45 000 € d'amende ; 10 ans et 150 000 € si la victime se suicide ou tente de le faire. Le juge peut aussi suspendre les comptes de réseaux sociaux de l'auteur. Droit à l'image : retrait et dommages et intérêts. Au lycée : conseil de discipline.",
  "demarches": "Ne pas voter, ne pas partager. Faire une capture (date, nom du compte), signaler la publication, prévenir la CPE ou appeler le 3018, qui peut faire retirer le contenu.",
  "source": "Code pénal, art. 222-33-2-3 et 131-35-1 ; Code civil, art. 9."
}$j$::jsonb),

('s18', $j${
  "titre": "Le bon réflexe",
  "texte": "Personne ne peut te reprocher de défendre quelqu'un. Le témoin qui réagit prive le harceleur du public dont il a besoin : souvent, il s'arrête quand les rires s'arrêtent.",
  "risque": "Aucun. Et si tu deviens la cible à ton tour, c'est du harcèlement : ça se signale.",
  "demarches": "Le dire calmement, sans insulter ni bousculer (sinon on passe du mauvais côté), puis en parler à un adulte.",
  "source": "Programme pHARe de l'Éducation nationale : le rôle des témoins."
}$j$::jsonb),

('s6', $j${
  "titre": "Trahir un secret, ou ouvrir la porte d'un compte ?",
  "texte": "Se connecter au compte de quelqu'un sans son accord est un délit, même si on connaît le mot de passe. Celui qui donne le code en sachant ce qu'on va en faire peut être poursuivi comme complice.",
  "risque": "Accès frauduleux à un système informatique : jusqu'à 3 ans et 100 000 €. Si des contenus sont modifiés ou supprimés : jusqu'à 5 ans et 150 000 €.",
  "demarches": "Ne jamais donner un code, même à son meilleur ami. Victime : changer ses mots de passe, activer la double authentification.",
  "source": "Code pénal, art. 323-1 et 121-7 (complicité)."
}$j$::jsonb),

('s3', $j${
  "titre": "Violences volontaires, et harcèlement scolaire",
  "texte": "Une bousculade « pour rien » est déjà une violence. Répétée, ciblée, cachée de l'adulte : tous les critères du harcèlement sont réunis (répétition, rapport de force, intention).",
  "risque": "Violences dans un établissement scolaire, même sans blessure : jusqu'à 3 ans et 45 000 €. Harcèlement scolaire : 3 ans et 45 000 €, 5 ans et 75 000 € si l'incapacité de travail (ITT) dépasse 8 jours. Au lycée : conseil de discipline, exclusion possible.",
  "demarches": "La victime peut faire constater ses blessures par un médecin (certificat, ITT). Les témoins le disent au professeur d'EPS ou à la CPE.",
  "source": "Code pénal, art. 222-13 et 222-33-2-3."
}$j$::jsonb),

('s21', $j${
  "titre": "Ce n'est pas « balancer », c'est protéger",
  "texte": "La loi donne à chaque élève le droit à une scolarité sans harcèlement. Une fois prévenue, la CPE doit agir : écouter la victime, la protéger, entendre les auteurs, prévenir les familles (protocole pHARe). On peut demander que son nom ne soit pas cité.",
  "risque": "Aucun pour celui qui alerte.",
  "demarches": "CPE, professeur principal, infirmière, ou le 3018. Dire : qui, quoi, depuis quand, où.",
  "source": "Code de l'éducation, art. L511-3-1."
}$j$::jsonb),

('s2', $j${
  "titre": "Un like, c'est participer",
  "texte": "Le vote n'existe que parce que des gens votent. La loi vise aussi le harcèlement « en meute » : plusieurs personnes, chacune une seule fois, qui savent qu'elles s'ajoutent aux autres. Chaque like fait grandir l'humiliation.",
  "risque": "Harcèlement scolaire, y compris à plusieurs : jusqu'à 3 ans et 45 000 €. Le juge regarde le rôle de chacun : l'organisateur n'est pas jugé comme celui qui a liké une fois, mais liker n'est pas neutre.",
  "demarches": "Ne pas liker, ne pas partager, ne pas commenter. Signaler. Si tu as liké : retire-le, et dis-le à un adulte.",
  "source": "Code pénal, art. 222-33-2-2 (harcèlement à plusieurs, loi du 3 août 2018) et 222-33-2-3."
}$j$::jsonb),

('s7', $j${
  "titre": "Un conflit, pas du harcèlement",
  "texte": "Entre deux amies, à égalité, une seule fois : pas de répétition, pas de rapport de force. C'est un conflit, qui se règle en se parlant, parfois avec l'aide d'un médiateur.",
  "risque": "Pas de délit de harcèlement. Une insulte en privé reste une contravention (injure non publique : 38 € d'amende au plus).",
  "demarches": "Laisser redescendre, puis se parler. Si les mots durs reviennent chaque jour, ou si d'autres s'en mêlent, ça change de nature.",
  "source": "Code pénal, art. R621-2."
}$j$::jsonb),

('s4', $j${
  "titre": "Une humiliation : la loi regarde la suite",
  "texte": "Une fois, sans diffusion : pas forcément un délit, mais une vraie humiliation, que le lycée peut sanctionner. Filmée et postée : atteinte au droit à l'image. Une moquerie de plus dans une série : harcèlement.",
  "risque": "Si une vidéo circule : retrait et dommages et intérêts. Si ça s'ajoute à d'autres moqueries : harcèlement scolaire, jusqu'à 3 ans et 45 000 €.",
  "demarches": "Ne pas jouer le jeu, prévenir la personne visée. Si une vidéo circule : capture, signalement, 3018.",
  "source": "Code civil, art. 9 ; Code pénal, art. 222-33-2-3."
}$j$::jsonb),

('s16', $j${
  "titre": "Isoler quelqu'un, c'est une forme de harcèlement",
  "texte": "Pas un coup, pas un mot, et pourtant : organiser l'exclusion de quelqu'un, chaque jour, dégrade ses conditions de vie. La loi parle de « propos ou comportements répétés » : mettre à l'écart en est un.",
  "risque": "Harcèlement scolaire : jusqu'à 3 ans et 45 000 €, davantage si la santé de la victime est atteinte. Celui qui organise est visé en premier.",
  "demarches": "S'asseoir avec elle : c'est le geste qui casse le mécanisme. Prévenir la CPE ou la vie scolaire.",
  "source": "Code pénal, art. 222-33-2-3 ; Code de l'éducation, art. L511-3-1."
}$j$::jsonb),

('s5', $j${
  "titre": "Abîmer l'œuvre de quelqu'un",
  "texte": "Un dessin appartient à son auteur, même élève : on n'a pas le droit de le modifier sans son accord, ni de le diffuser. S'en servir pour le ridiculiser devant la classe, et recommencer, c'est du harcèlement.",
  "risque": "Atteinte au droit d'auteur : réparation du préjudice. Répété : harcèlement scolaire, jusqu'à 3 ans et 45 000 €.",
  "demarches": "Rendre l'original, s'excuser. Victime : en parler au professeur.",
  "source": "Code de la propriété intellectuelle, art. L121-1 ; Code pénal, art. 222-33-2-3."
}$j$::jsonb),

('s20', $j${
  "titre": "Garder des preuves : oui, et c'est utile",
  "texte": "Une capture faite pour se défendre ou défendre quelqu'un n'est pas une faute : c'est ce que demandent la police et le 3018. On la garde pour soi ou on la remet à un adulte, on ne la fait pas circuler.",
  "risque": "Aucun si elle sert de preuve. La diffuser pour humilier, c'est autre chose.",
  "demarches": "Capturer avec la date, le nom du compte, l'adresse de la page. La ranger dans le coffre-fort de l'appli 3018, ou la montrer à un adulte.",
  "source": "Conseils du 3018 et de la plateforme Pharos."
}$j$::jsonb),

('s15', $j${
  "titre": "Droit à l'image : chacun décide de son image",
  "texte": "Toute personne peut s'opposer à la diffusion de son image. Publier la photo de quelqu'un pour s'en moquer porte atteinte à sa vie privée ; si elle a été prise dans un lieu privé (chambre, vestiaire, toilettes), c'est un délit.",
  "risque": "Photo prise ou diffusée sans accord dans un lieu privé : jusqu'à 1 an et 45 000 €. Image intime : 2 ans et 60 000 €. Montage ou image truquée (IA comprise) : 1 an et 15 000 €, 2 ans et 45 000 € en ligne. Plus les dommages et intérêts, et le harcèlement si ça se répète.",
  "demarches": "Demander le retrait à l'auteur, signaler à la plateforme, appeler le 3018 (les plateformes doivent traiter ses demandes en priorité). Porter plainte au commissariat ou à la gendarmerie. Contenu illégal : signalement sur internet-signalement.gouv.fr (Pharos).",
  "source": "Code civil, art. 9 ; Code pénal, art. 226-1, 226-2, 226-2-1 et 226-8."
}$j$::jsonb),

('s19', $j${
  "titre": "Soutenir, c'est protéger",
  "texte": "Le sentiment d'être seul est ce qui fait le plus de mal. Un message de soutien rappelle à la victime qu'elle n'y est pour rien et qu'on peut l'aider.",
  "risque": "Aucun.",
  "demarches": "« Je suis avec toi, ce n'est pas normal. Tu veux qu'on en parle à quelqu'un ? » Et lui donner le 3018.",
  "source": ""
}$j$::jsonb),

('s9', $j${
  "titre": "La répétition fait le harcèlement",
  "texte": "Un surnom, une fois, ça peut passer. Chaque jour, alors que la personne a dit stop : c'est exactement la définition du harcèlement, des propos répétés qui dégradent ses conditions de vie. S'il vise le physique, l'origine ou le genre, il est en plus discriminatoire.",
  "risque": "Harcèlement scolaire : jusqu'à 3 ans et 45 000 €. Au lycée : sanctions disciplinaires.",
  "demarches": "Victime : dire stop clairement, puis en parler à un adulte. Témoins : ne pas reprendre le surnom, ne pas rire.",
  "source": "Code pénal, art. 222-33-2-3."
}$j$::jsonb),

('s17', $j${
  "titre": "Le harcèlement ne s'arrête pas à la grille du lycée",
  "texte": "En privé ne veut pas dire sans conséquence. Le soir, chez soi, sur son téléphone : la victime n'a plus de refuge. Le harcèlement scolaire vaut aussi en ligne, dès que l'auteur est du même établissement.",
  "risque": "Harcèlement scolaire : jusqu'à 3 ans et 45 000 €. Messages malveillants répétés : 1 an et 15 000 €. Le juge peut suspendre les comptes de réseaux sociaux de l'auteur jusqu'à 6 mois.",
  "demarches": "Ne pas répondre, faire des captures, bloquer et signaler, en parler à un adulte, appeler le 3018. Les captures serviront si on porte plainte.",
  "source": "Code pénal, art. 222-16, 222-33-2-3 et 131-35-1."
}$j$::jsonb),

('s14', $j${
  "titre": "Usurpation d'identité : un délit à part entière",
  "texte": "Se faire passer pour quelqu'un pour nuire à sa réputation ou à sa tranquillité est puni par la loi, y compris en ligne, même « pour rire ».",
  "risque": "Jusqu'à 1 an et 15 000 €, et le harcèlement en plus si les publications se répètent.",
  "demarches": "Signaler le faux compte à la plateforme (« se fait passer pour moi ») ; le 3018 peut obtenir sa fermeture. Garder des captures. Plainte possible.",
  "source": "Code pénal, art. 226-4-1."
}$j$::jsonb),

('s22', $j${
  "titre": "Un droit, et une obligation pour la plateforme",
  "texte": "Le règlement européen sur les services numériques (DSA) oblige les plateformes à traiter les signalements et à retirer rapidement les contenus illicites.",
  "risque": "Aucun.",
  "demarches": "Faire une capture d'abord (le contenu peut disparaître), puis bloquer et signaler. Si rien ne bouge : 3018, Pharos.",
  "source": "Règlement (UE) 2022/2065 sur les services numériques."
}$j$::jsonb),

('s23', $j${
  "titre": "Le 3018 : gratuit, anonyme, efficace",
  "texte": "Des écoutants de l'association e-Enfance, 7 jours sur 7. Ils conseillent, et peuvent faire retirer des contenus : les plateformes doivent traiter leurs demandes en priorité (« signaleur de confiance »).",
  "risque": "Aucun.",
  "demarches": "Par téléphone, par tchat sur 3018.fr, ou dans l'appli 3018 (avec un coffre-fort pour les preuves).",
  "source": "Rapport de transparence 2025 d'e-Enfance/3018.",
  "chiffre": "En 2025, le 3018 a reçu 124 500 sollicitations et transmis 4 150 demandes de suppression de contenus ou de comptes, dont 3 326 pour des victimes mineures."
}$j$::jsonb),

('s8', $j${
  "titre": "On choisit ses amis",
  "texte": "On a le droit de ne pas inviter tout le monde : ce n'est ni un délit ni du harcèlement. Sauf si l'exclusion est organisée, répétée, affichée pour blesser (« tout le monde sauf elle », photos postées pour qu'elle les voie).",
  "risque": "Aucun, en soi.",
  "demarches": "Rester discret sur la fête devant ceux qui ne sont pas invités.",
  "source": ""
}$j$::jsonb),

('s11', $j${
  "titre": "Critiquer un travail, pas une personne",
  "texte": "Critiquer avec des arguments, c'est ce qu'on apprend à faire en classe, et c'est la liberté d'expression. La limite : l'insulte, la moquerie sur la personne.",
  "risque": "Aucun.",
  "demarches": "Critiquer le travail, pas la personne ; proposer une piste pour l'améliorer.",
  "source": "Déclaration des droits de l'homme et du citoyen (1789), art. 11."
}$j$::jsonb),

('s12', $j${
  "titre": "Une évaluation n'est pas du harcèlement",
  "texte": "Une note évalue un travail, selon des critères. Un adulte du lycée peut, lui aussi, être auteur de harcèlement scolaire (humiliations répétées, propos blessants), mais une mauvaise note, seule, n'en est pas.",
  "risque": "Aucun.",
  "demarches": "Demander des explications au professeur, calmement ; le professeur principal ou les parents peuvent relayer.",
  "source": "Code pénal, art. 222-33-2-3 (élèves et personnels)."
}$j$::jsonb),

('s13', $j${
  "titre": "On a le droit de partir",
  "texte": "Quitter un groupe, c'est user de sa liberté. C'est parfois la meilleure réponse quand un groupe devient le lieu des moqueries.",
  "risque": "Aucun.",
  "demarches": "Avant de partir, si des messages visent quelqu'un : une capture, et un adulte prévenu.",
  "source": ""
}$j$::jsonb)

       ) as l(id, loi) on l.id = x.s ->> 'id'))
 where c.cle = 'harcelometre' and jsonb_typeof(c.valeur -> 'situations') = 'array';


-- ------------------------------------------------------------
--  2. Les repères généraux et les chiffres, s'ils manquent
-- ------------------------------------------------------------
update public.emc_contenus c
   set valeur = c.valeur || jsonb_build_object('loi_note',
     'Peines maximales prévues pour un majeur. Entre 13 et 18 ans, la prison encourue est en principe divisée par deux.')
 where c.cle = 'harcelometre' and not c.valeur ? 'loi_note';

update public.emc_contenus c
   set valeur = c.valeur || jsonb_build_object('loi_reperes', $j$[
  {"titre":"⚖️ Un délit depuis 2022",
   "texte":"La loi du 2 mars 2022 fait du harcèlement scolaire un délit : des propos ou comportements répétés contre un élève, par un élève ou un adulte du même établissement, qui dégradent ses conditions de vie. Dans la cour, sur le trajet ou le soir sur les réseaux. Jusqu'à 3 ans de prison et 45 000 € d'amende ; 5 ans et 75 000 € si l'incapacité de travail (ITT) dépasse 8 jours ; 10 ans et 150 000 € si la victime se suicide ou tente de le faire."},
  {"titre":"👥 À plusieurs, chacun compte",
   "texte":"Il y a harcèlement même si chacun n'a agi qu'une fois, quand plusieurs personnes s'y mettent ensemble, ou les unes après les autres en sachant qu'elles s'ajoutent (« raid », loi de 2018)."},
  {"titre":"🧒 Mineur, mais responsable",
   "texte":"Dès 13 ans, on peut être jugé et condamné. La prison encourue est en principe divisée par deux (à partir de 16 ans, le juge peut l'écarter, à titre exceptionnel). Le tribunal pour enfants privilégie les mesures éducatives. Les dommages et intérêts sont payés par les parents."},
  {"titre":"🏫 Et au lycée",
   "texte":"En plus de la justice, et sans l'attendre : conseil de discipline, exclusion temporaire ou définitive. Le lycée doit agir dès qu'il est prévenu (protocole pHARe)."},
  {"titre":"📵 Privé de réseaux",
   "texte":"Depuis la loi de 2024 sur l'espace numérique, le juge peut interdire à un auteur de cyberharcèlement d'utiliser ses comptes de réseaux sociaux pendant 6 mois (1 an en récidive)."},
  {"titre":"🧾 Que faire ?",
   "texte":"Parler à un adulte (CPE, professeur, infirmière, parents). Garder des preuves : captures avec la date, le nom du compte, le lien. Signaler sur la plateforme. Appeler le 3018. Porter plainte au commissariat ou à la gendarmerie, avec un parent ou un adulte de confiance ; un certificat médical (ITT) appuie la plainte."}
]$j$::jsonb)
 where c.cle = 'harcelometre' and not c.valeur ? 'loi_reperes';

update public.emc_contenus c
   set valeur = c.valeur || jsonb_build_object('chiffres', $j$[
  {"valeur":"2 %","texte":"des lycéens se disent harcelés, 4 % des collégiens, 3 % des écoliers.",
   "source":"Enquête nationale du ministère de l'Éducation nationale, novembre 2025 (publiée en juin 2026)"},
  {"valeur":"37 %","texte":"des 6-18 ans disent avoir déjà subi une forme de harcèlement ou de cyberharcèlement.",
   "source":"Baromètre Caisse d'Épargne – e-Enfance/3018, mai 2025"},
  {"valeur":"124 500","texte":"sollicitations reçues par le 3018 en 2025 ; 4 150 demandes de suppression de contenus ou de comptes.",
   "source":"Rapport de transparence 2025 d'e-Enfance/3018"}
]$j$::jsonb,
   'chiffres_question', '2 % ou 37 % ? Les deux enquêtes ne posent pas la même question : l''une compte les élèves harcelés au moment de l''enquête, avec une définition stricte ; l''autre, ceux qui ont subi au moins une fois une forme de harcèlement, à l''école ou en ligne. Qu''en pensez-vous ?')
 where c.cle = 'harcelometre' and not c.valeur ? 'chiffres';


-- Vérification : doit rendre vrai, vrai, vrai.
select (select count(*) from public.emc_contenus c, jsonb_array_elements(c.valeur -> 'situations') s
         where c.cle = 'harcelometre' and s ? 'loi') >= 23                       as situations_avec_loi,
       (select jsonb_array_length(valeur -> 'loi_reperes') from public.emc_contenus where cle = 'harcelometre') = 6 as six_reperes,
       (select jsonb_array_length(valeur -> 'chiffres') from public.emc_contenus where cle = 'harcelometre') = 3     as trois_chiffres;
