-- ============================================================
--  036 — EMC : les retours de Mme Castel (08/11/2026), après
--        trois parties du Labyrinthe et un essai du jeu de rôle
--
--  BESOIN
--  · Les tables n'ont pas toutes autant à chercher : des tables de
--    5, de 4 et de 3. Tables 1, 3, 4, 5 : 5 places ; 2 et 6 : 4 ;
--    7 et 8 : 3 (34 places). Les petites tables se remplissent en
--    priorité, les tables de 5 se complètent en dernier.
--  · Table 3 : le déclencheur n'est pas explicite (il faut recouper
--    les dates) → un indice dans la question, un attendu précis.
--  · Table 5 : les trois adultes ont fini par agir → les adultes
--    (ont-ils eu la bonne réaction ?) d'un côté, les camarades
--    témoins de l'autre.
--  · Table 8 : « Qui contacter ? » sans exemples.
--  · Jeu de rôle : l'échange et les présentations étaient sous-
--    estimés → échange 20 min, présentations 40 (115 min en tout ;
--    le portrait mystère saute s'il le faut).
--
--  CE QUE FAIT CE FICHIER
--    §1  emc_entrer : le tirage de table tient compte des places
--        (champ « places » de chaque mission, réglable dans
--        Contenus). Sans places : l'équilibre d'avant. Tout est
--        plein : on continue à équilibrer.
--    §2  missions : places, tables 3, 5, 8 — chaque champ seulement
--        s'il est encore celui du 031 (un réglage fait au tableau de
--        bord est gardé).
--    §3  durées du jeu de rôle, seulement si encore celles du 035.
--
--  Rejouable. Banc : _outils/tests/emc-schema.test.mjs (§18)
-- ============================================================


-- ------------------------------------------------------------
--  1. Le tirage de table, avec des places
-- ------------------------------------------------------------
create or replace function public.emc_entrer(p_code text default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_eleve   uuid;
  v_classe  uuid;
  v_libelle text;
  v_table   int;
  v_insc    uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'AUCUNE_SESSION' using hint = 'Se connecter avant.';
  end if;
  select e.id, e.classe_id into v_eleve, v_insc
    from public.eleves e where e.auth_id = (select auth.uid());
  if v_eleve is null then
    raise exception 'PAS_ENCORE_INSCRIT' using hint = 'Créer son compte avec le code EMC.';
  end if;

  if p_code is not null and btrim(p_code) <> '' then
    select c.id, c.libelle into v_classe, v_libelle
      from public.classes c
     where c.code = upper(btrim(p_code)) and c.espace = 'emc' and c.actif = true;
    if v_classe is null then
      raise exception 'CODE_EMC_INCONNU' using hint = 'Vérifier le code écrit au tableau.';
    end if;
    insert into public.eleves_classes (eleve_id, classe_id)
    values (v_eleve, v_classe)
    on conflict do nothing;
  else
    select c.id, c.libelle into v_classe, v_libelle
      from public.eleves_classes ec
      join public.classes c on c.id = ec.classe_id
     where ec.eleve_id = v_eleve and c.espace = 'emc' and c.actif = true
     order by ec.rejoint_le desc
     limit 1;
    if v_classe is null then
      raise exception 'PAS_DE_CLASSE_EMC' using hint = 'Entrer le code écrit au tableau.';
    end if;
  end if;

  perform pg_advisory_xact_lock(hashtext('emc:' || v_classe::text));

  insert into public.emc_seances (classe_id) values (v_classe)
  on conflict (classe_id) do nothing;

  select p.table_num into v_table
    from public.emc_participants p
   where p.classe_id = v_classe and p.eleve_id = v_eleve;

  if v_table is null then
    --  D'abord une table qui a encore de la place ; parmi elles, la
    --  moins remplie ; à égalité, la plus petite (les tables de 3 et
    --  de 4 se remplissent avant que les tables de 5 se complètent).
    --  Tout est plein (plus de 34 élèves) : les surnuméraires vont
    --  d'abord aux grandes tables, une par une.
    with places as (
      select (m ->> 'table')::int as n, (m ->> 'places')::int as places
        from public.emc_contenus c, jsonb_array_elements(c.valeur) m
       where c.cle = 'missions' and jsonb_typeof(c.valeur) = 'array'
         and m ->> 'table' ~ '^[1-8]$' and m ->> 'places' ~ '^[0-9]{1,2}$'
    )
    select t.n into v_table
      from generate_series(1, 8) as t(n)
      left join places pl on pl.n = t.n
      left join public.emc_participants p
        on p.classe_id = v_classe and p.table_num = t.n
     group by t.n, pl.places
     order by count(p.eleve_id) >= coalesce(pl.places, 99),
              case when count(p.eleve_id) >= coalesce(pl.places, 99)
                   then count(p.eleve_id) - pl.places else count(p.eleve_id) end,
              case when count(p.eleve_id) >= coalesce(pl.places, 99)
                   then -pl.places else coalesce(pl.places, 99) end,
              random()
     limit 1;
    insert into public.emc_participants (classe_id, eleve_id, table_num)
    values (v_classe, v_eleve, v_table);
  end if;

  return jsonb_build_object(
    'classe_id', v_classe,
    'libelle',   v_libelle,
    'table_num', v_table,
    'nouveau',   v_insc = v_classe,
    'etape',     (select s.etape from public.emc_seances s where s.classe_id = v_classe)
  );
end;
$$;

comment on function public.emc_entrer is
  'EMC : entrer dans la séance (code facultatif). Tire la table selon les places de chaque mission (petites tables d''abord, puis équilibre), la garde au compte. Renvoie classe_id, libelle, table_num, nouveau, etape.';


-- ------------------------------------------------------------
--  2. Les missions : places, tables 3, 5 et 8
-- ------------------------------------------------------------
update public.emc_contenus c
   set valeur = (
     select jsonb_agg(
       case (m ->> 'table')::int
         when 3 then m
           || case when m -> 'questions' = $j$["Quel est l'élément déclencheur dans l'esprit des harceleurs ?","Est-ce une justification ?"]$j$::jsonb
                   then jsonb_build_object('questions', $j$["Quel est l'élément déclencheur dans l'esprit des harceleurs ? Indice : recoupez les dates (l'agenda de Nina, la conversation de la classe, les posts d'Instalike). Que se passe-t-il le 3 novembre ?","Est-ce une justification ?"]$j$::jsonb)
                   else '{}'::jsonb end
           || case when m ->> 'attendu' = 'Vote humiliant, violences en EPS, faux rendez-vous, dessins modifiés ; le déclencheur ressenti (la jalousie), qui ne justifie rien.'
                   then jsonb_build_object('attendu', 'Vote humiliant, violences en EPS, faux rendez-vous, dessins modifiés. Le déclencheur : le 3 novembre, Tess annonce sur Instalike qu''elle aura la meilleure note en français ; c''est Nina qui l''obtient, devant elle (Hannah la félicite dans la conversation des 2nde 2). La jalousie, qui ne justifie rien. Les dates sont à recouper : aider la table si elle bloque.')
                   else '{}'::jsonb end
         when 5 then m
           || case when m ->> 'texte' = 'les témoins (adultes ou camarades) qui ont vu sans agir ou sans prendre conscience.'
                   then jsonb_build_object('texte', 'les témoins : les adultes qui ont réagi, et les camarades qui ont vu sans agir.')
                   else '{}'::jsonb end
           || case when m -> 'questions' = $j$["Qu'est-ce qui a pu les empêcher d'agir ?","Quels freins psychologiques ?"]$j$::jsonb
                   then jsonb_build_object('questions', $j$["Les adultes : pensez-vous qu'ils auraient dû agir autrement, ou qu'ils ont eu la bonne réaction ?","Les camarades : qu'est-ce qui a pu les empêcher d'agir ?","Les camarades : quels freins psychologiques ?"]$j$::jsonb)
                   else '{}'::jsonb end
           || case when m -> 'sous_zones' = $j$["Les témoins","Ce qui les a empêchés","Les freins"]$j$::jsonb
                   then jsonb_build_object('sous_zones', $j$["Les adultes : la bonne réaction ?","Les camarades témoins","Ce qui les a empêchés d'agir"]$j$::jsonb)
                   else '{}'::jsonb end
           || case when m ->> 'attendu' = 'Ceux qui votent ou rient, l''amie qui cède, l''adulte qui ne voit pas ; les freins (peur d''être la prochaine cible, effet de groupe, « c''est juste une blague »).'
                   then jsonb_build_object('attendu', 'Les adultes (M. Hamelin, le professeur d''EPS, la mère de Nina) ont fini par réagir : assez tôt ? autrement ? Pas de réponse unique, c''est un débat. Les camarades : ceux qui votent, rient, likent ou commentent (Emma, Imène, Nicolas, Hannah…), l''amie qui cède ; les freins (peur d''être la prochaine cible, effet de groupe, « c''est juste une blague »).')
                   else '{}'::jsonb end
         when 8 then m
           || case when m -> 'questions' = $j$["Que lui diriez-vous ?","Qui contacter (CPE, infirmière, 3018…) ?"]$j$::jsonb
                   then jsonb_build_object('questions', $j$["Que lui diriez-vous ?","Qui contacter ?"]$j$::jsonb)
                   else '{}'::jsonb end
         else m
       end
       || case when m ? 'places' then '{}'::jsonb
               else jsonb_build_object('places', case (m ->> 'table')::int when 2 then 4 when 6 then 4 when 7 then 3 when 8 then 3 else 5 end) end
       order by o)
       from jsonb_array_elements(c.valeur) with ordinality as x(m, o))
 where c.cle = 'missions' and jsonb_typeof(c.valeur) = 'array';


-- ------------------------------------------------------------
--  3. Jeu de rôle : échange 20 min, présentations 40
-- ------------------------------------------------------------
update public.emc_contenus c
   set valeur = $j$[
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
]$j$::jsonb
 where c.cle = 'etapes_accueil'
   and c.valeur = $j$[
  {"n":0,"titre":"Accueil et connexion","duree":10},
  {"n":1,"titre":"Les consignes","duree":5},
  {"n":2,"titre":"Trouve ton binôme","duree":5},
  {"n":3,"titre":"Choisis tes questions","duree":10},
  {"n":4,"titre":"L'échange","duree":15},
  {"n":5,"titre":"Feu vert, feu rouge","duree":5},
  {"n":6,"titre":"Les présentations","duree":30},
  {"n":7,"titre":"Portrait mystère","duree":10},
  {"n":8,"titre":"La liberté, pour moi","duree":5},
  {"n":9,"titre":"Clôture","duree":5}
]$j$::jsonb;

update public.emc_contenus c set valeur = jsonb_set(c.valeur, '{echange_minutes}', '20')
 where c.cle = 'jdr' and c.valeur -> 'echange_minutes' = '15'::jsonb;


-- Vérification
-- select m ->> 'table' t, m ->> 'places' places, m -> 'questions' q
--   from public.emc_contenus c, jsonb_array_elements(c.valeur) m where c.cle = 'missions';
