-- ============================================================
--  033 — EMC : contenus enrichis après le premier test
--
--  BESOIN (Loïc, test réel du 07/11/2026)
--  · un autre titre pour l'étape 1 ;
--  · 20 émojis de plus (32 : des rangées pleines de 4 ou de 8) ;
--  · pour chaque numéro : une icône, qui répond, quand appeler ;
--  · les deux vidéos YouTube de la campagne, la campagne 2022-2023
--    en premier ; l'autre cite le 3020, devenu le 3018 ;
--  · une icône par mission (projection, tablettes).
--
--  🔴 N'ÉCRASE RIEN de ce qui a été réglé au tableau de bord :
--  chaque changement ne s'applique que si le contenu est encore
--  celui du 031 (titre d'origine, numéro sans « qui », vidéo
--  d'origine…) ; les émojis s'AJOUTENT, sans doublon.
--  Rejouable. Purement des données : aucun droit, aucune table.
-- ============================================================

--  Étape 1 : le titre
update public.emc_contenus c
   set valeur = (select jsonb_agg(case when (e ->> 'n')::int = 1 and e ->> 'titre' = 'Nuage de mots et météo des émotions'
                                       then jsonb_set(e, '{titre}', '"Premiers mots, premières émotions"')
                                       else e end order by o)
                   from jsonb_array_elements(c.valeur) with ordinality as t(e, o))
 where c.cle = 'etapes'
   and exists (select 1 from jsonb_array_elements(c.valeur) e where e ->> 'titre' = 'Nuage de mots et météo des émotions');

--  Étape 1 : 20 émojis de plus, ajoutés à la suite, sans doublon
update public.emc_contenus c
   set valeur = jsonb_set(c.valeur, '{emojis}',
         coalesce(c.valeur -> 'emojis', '[]'::jsonb) || coalesce((
           select jsonb_agg(n.x order by n.o)
             from jsonb_array_elements($j$[
               {"e":"😰","l":"angoisse"}, {"e":"😞","l":"déception"}, {"e":"😤","l":"révolte"},
               {"e":"😳","l":"honte"}, {"e":"😖","l":"souffrance"}, {"e":"😱","l":"choc"},
               {"e":"😓","l":"culpabilité"}, {"e":"😒","l":"agacement"}, {"e":"🤐","l":"envie de me taire"},
               {"e":"💔","l":"cœur brisé"}, {"e":"🤯","l":"incompréhension"}, {"e":"⚖️","l":"injustice"},
               {"e":"🥀","l":"solitude"}, {"e":"😬","l":"gêne"}, {"e":"🤗","l":"envie de soutenir"},
               {"e":"🛡️","l":"envie de protéger"}, {"e":"🗣️","l":"envie d'en parler"}, {"e":"🤔","l":"questionnement"},
               {"e":"😌","l":"soulagement"}, {"e":"🙏","l":"espoir"}
             ]$j$::jsonb) with ordinality as n(x, o)
            where not exists (select 1 from jsonb_array_elements(c.valeur -> 'emojis') d where d ->> 'e' = n.x ->> 'e')
         ), '[]'::jsonb))
 where c.cle = 'mots';

--  Numéros : icône, qui répond, quand appeler — seulement là où
--  « qui » manque encore.
update public.emc_contenus c
   set valeur = (select jsonb_agg(case when n.x ? 'qui' then n.x else n.x || coalesce(i.ajout, '{}'::jsonb) end order by n.o)
                   from jsonb_array_elements(c.valeur) with ordinality as n(x, o)
                   left join (values
                     ('3018', $j${"icone":"💬",
                       "qui":"Des écoutants de l'association e-Enfance, spécialistes du harcèlement. Gratuit, anonyme et confidentiel, 7 jours sur 7 de 9 h à 23 h ; aussi par tchat sur 3018.fr et dans l'appli 3018.",
                       "quand":"Tu es harcelé·e, à l'école ou en ligne, ou tu en es témoin. Ils peuvent aussi faire retirer une photo ou fermer un compte."}$j$::jsonb),
                     ('3114', $j${"icone":"💙",
                       "qui":"Des infirmiers et des psychologues formés, 24 h sur 24, 7 jours sur 7. Gratuit et confidentiel.",
                       "quand":"Tu as des idées noires, tu penses à mourir, ou tu t'inquiètes pour quelqu'un."}$j$::jsonb),
                     ('119', $j${"icone":"🧒",
                       "qui":"Allô Enfance en danger : des écoutants professionnels, 24 h sur 24, 7 jours sur 7. Gratuit, et l'appel n'apparaît pas sur les factures.",
                       "quand":"Tu subis des violences, à la maison ou ailleurs, ou tu penses qu'un autre mineur est en danger."}$j$::jsonb),
                     ('17', $j${"icone":"🚨",
                       "qui":"La police ou la gendarmerie. Depuis un portable, le 112 marche aussi ; par SMS, le 114.",
                       "quand":"Quelqu'un est en danger tout de suite : une agression, une menace grave en cours."}$j$::jsonb)
                   ) as i(numero, ajout) on i.numero = n.x ->> 'numero')
 where c.cle = 'numeros'
   and exists (select 1 from jsonb_array_elements(c.valeur) e where not e ? 'qui');

--  Vidéos : les deux vidéos de la campagne, si la liste est encore
--  celle du 031 (une seule vidéo « à vérifier »).
update public.emc_contenus c
   set valeur = $j$[
     {"titre":"Et si l'autre c'était toi ?","mp4":"","lien":"https://www.youtube.com/watch?v=gFWq2W0Jly8",
      "credits":"Ministère de l'Éducation nationale — campagne #NonAuHarcèlement 2022-2023","note":""},
     {"titre":"À plusieurs, on est plus fort contre le harcèlement !","mp4":"","lien":"https://www.youtube.com/watch?v=WoVTJcw6tkE",
      "credits":"MAE — campagne Non au harcèlement",
      "note":"⚠️ Cette vidéo cite le 3020 : ce numéro a été remplacé par le 3018, aujourd'hui le numéro national contre le harcèlement."}
   ]$j$::jsonb
 where c.cle = 'videos'
   and jsonb_array_length(c.valeur) = 1
   and c.valeur -> 0 ->> 'titre' = 'Vidéo de la séance (à vérifier)';

--  Missions : une icône, là où il n'y en a pas
update public.emc_contenus c
   set valeur = (select jsonb_agg(case when m.x ? 'icone' then m.x
                                       else m.x || jsonb_build_object('icone',
                                         (array['🔎','💭','🎯','⚖️','👀','💡','🧭','🤝'])[least(greatest((m.x ->> 'table')::int, 1), 8)]) end
                                  order by m.o)
                   from jsonb_array_elements(c.valeur) with ordinality as m(x, o))
 where c.cle = 'missions'
   and exists (select 1 from jsonb_array_elements(c.valeur) e where not e ? 'icone');

--  Vérification :
--    select cle, case cle when 'mots' then jsonb_array_length(valeur -> 'emojis')::text
--                         when 'videos' then valeur -> 0 ->> 'titre'
--                         when 'etapes' then valeur -> 1 ->> 'titre'
--                         when 'numeros' then valeur -> 0 ->> 'icone'
--                         when 'missions' then valeur -> 0 ->> 'icone' end as apres
--      from public.emc_contenus where cle in ('mots', 'videos', 'etapes', 'numeros', 'missions') order by cle;
--    → etapes « Premiers mots… », missions 🔎, mots 32, numeros 💬,
--      videos « Et si l'autre c'était toi ? »
