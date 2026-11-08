-- ============================================================
--  037 — EMC, jeu de rôle : tenir dans le créneau de 100 minutes
--
--  BESOIN
--  · Le 036 a porté le jeu de rôle à 115 min (échange 20,
--    présentations 40), mais le créneau du groupe D fait 100 min
--    (jeudi 8 h 30 – 10 h 10). Erreur relevée en écrivant le mémo
--    minuté (08/11/2026).
--  · Échange 20 min (gardé), présentations 35 ; sans le portrait
--    mystère (bonus si l'on a de l'avance), la séance fait 100 min.
--
--  Seulement si les durées sont encore celles du 036.
--  Rejouable. Banc : _outils/tests/emc-schema.test.mjs (§18)
-- ============================================================

update public.emc_contenus c
   set valeur = $j$[
  {"n":0,"titre":"Accueil et connexion","duree":10},
  {"n":1,"titre":"Les consignes","duree":5},
  {"n":2,"titre":"Trouve ton binôme","duree":5},
  {"n":3,"titre":"Choisis tes questions","duree":10},
  {"n":4,"titre":"L'échange","duree":20},
  {"n":5,"titre":"Feu vert, feu rouge","duree":5},
  {"n":6,"titre":"Les présentations","duree":35},
  {"n":7,"titre":"Portrait mystère (bonus, si on a de l'avance)","duree":10},
  {"n":8,"titre":"La liberté, pour moi","duree":5},
  {"n":9,"titre":"Clôture","duree":5}
]$j$::jsonb
 where c.cle = 'etapes_accueil'
   and c.valeur = $j$[
  {"n":0,"titre":"Accueil et connexion","duree":10},
  {"n":1,"titre":"Les consignes","duree":5},
  {"n":2,"titre":"Trouve ton binôme","duree":5},
  {"n":3,"titre":"Choisis tes questions","duree":10},
  {"n":4,"titre":"L'échange","duree":20},
  {"n":5,"titre":"Feu vert, feu rouge","duree":5},
  {"n":6,"titre":"Les présentations","duree":40},
  {"n":7,"titre":"Portrait mystère (si le temps le permet)","duree":10},
  {"n":8,"titre":"La liberté, pour moi","duree":5},
  {"n":9,"titre":"Clôture","duree":5}
]$j$::jsonb;

-- Vérification : 110 (100 sans le portrait mystère)
select (select sum((e ->> 'duree')::int) from jsonb_array_elements(valeur) e) as minutes
  from public.emc_contenus where cle = 'etapes_accueil';
