-- ============================================================
--  052 — Diapason : « à revoir », le lien entre une erreur et le cours
--
--  BESOIN (Loïc, 21/11/2026)
--  « Dans leur résumé à la fin des QCM, leur dire : allez revoir telle
--  ou telle partie, c'est réexpliqué ici. »
--
--  Une question peut porter
--    "revoir": { "texte": "S5 · Le routage", "lien": "pages/2nde-snt-t1-internet.html#etape-t1-routage" }
--  (étape #etape-<clé>, séance #sN, ou la page seule). Ce fichier :
--  - quiz_question_corrigee rend aussi `revoir` (correction d'une question) ;
--  - quiz_etat, en fin de partie, joint à chaque notion ratée les
--    `revoir` distincts de ses questions ratées.
--  Rien d'autre ne change : deux fonctions réécrites à l'identique du 047,
--  une clé en plus. Le lien n'est pas une donnée sensible : il ne dit
--  rien de la bonne réponse (il est rendu APRÈS la correction).
--
--  Suppose 047 en place. Rejouable. Banc : _outils/tests/quiz-base.py.
-- ============================================================

create or replace function public.quiz_question_corrigee(q jsonb)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select jsonb_strip_nulls(jsonb_build_object(
    'correct', case when q->>'type' in ('qcm', 'vf') then q->'correct' end,
    'valeur',  case when q->>'type' = 'num' then q->'num'->'valeur'
                    when q->>'type' = 'curseur' then q->'curseur'->'valeur' end,
    'unite',   case when q->>'type' = 'num' then q->'num'->'unite'
                    when q->>'type' = 'curseur' then q->'curseur'->'unite' end,
    'tolerance', case when q->>'type' = 'curseur' then q->'curseur'->'tolerance' end,
    'autres',  case when q->>'type' = 'num' then q->'num'->'autres' end,
    'items',   case when q->>'type' = 'ordre' then q->'items' end,
    'cibles',  case when q->>'type' = 'zone' then q->'zone'->'cibles' end,
    'paires',  case when q->>'type' = 'assoc' then q->'paires' end,
    'acceptes', case when q->>'type' = 'mot' then q->'mot'->'acceptes' end,
    'cours',   q->'cours',
    'revoir',  q->'revoir'
  ))
$$;

create or replace function public.quiz_etat(p_jeton uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  j public.quiz_joueurs%rowtype;
  p public.quiz_parties%rowtype;
  q jsonb;
  r public.quiz_reponses%rowtype;
  n_total integer;
  v_score integer;
  v_rang integer;
  v_joueurs integer;
  borne integer;     -- on compte les points des questions < borne
  res jsonb;
begin
  select * into j from public.quiz_joueurs where jeton = p_jeton;
  if not found then return jsonb_build_object('phase', 'exclu'); end if;
  select * into p from public.quiz_parties where id = j.partie_id;
  if p.ouverte_le < now() - interval '24 hours' then return jsonb_build_object('phase', 'expiree'); end if;

  n_total := jsonb_array_length(p.questions);
  -- Pendant une question, le score affiché s'arrête à la précédente :
  -- sinon le score qui bouge trahirait la justesse avant la correction.
  borne := case when p.phase = 'question' then p.idx else n_total end;

  select greatest(coalesce(sum(x.points), 0), 0) into v_score from public.quiz_reponses x
   where x.joueur_id = j.id and x.idx < borne;
  select count(*) into v_joueurs from public.quiz_joueurs where partie_id = p.id;
  select 1 + count(*) into v_rang from (
    select jj.id, greatest(coalesce(sum(x.points) filter (where x.idx < borne), 0), 0) s
      from public.quiz_joueurs jj left join public.quiz_reponses x on x.joueur_id = jj.id
     where jj.partie_id = p.id group by jj.id) t
   where t.s > v_score;

  res := jsonb_build_object(
    'phase', p.phase, 'idx', p.idx, 'total', n_total, 'version', p.version,
    'mode', p.mode, 'titre', p.titre, 'pseudo', j.pseudo, 'pari', coalesce((p.options->>'pari')::boolean, false),
    'score', greatest(v_score, 0), 'rang', v_rang, 'joueurs', v_joueurs);

  if p.phase in ('question', 'correction') and p.idx between 0 and n_total - 1 then
    q := p.questions->p.idx;
    res := res || jsonb_build_object('question', public.quiz_question_publique(q));
    select * into r from public.quiz_reponses where joueur_id = j.id and idx = p.idx;
    if found then
      res := res || jsonb_build_object('ma_reponse', r.reponse, 'sur', r.sur);
    end if;
    if p.phase = 'question' then
      res := res || jsonb_build_object('reste_ms',
        greatest(0, floor(extract(epoch from (p.fin - now())) * 1000))::integer);
    else
      res := res || jsonb_build_object('correction',
        public.quiz_question_corrigee(q) || jsonb_strip_nulls(jsonb_build_object(
          'repondu',   r.joueur_id is not null,
          'juste',     coalesce(r.juste, false),
          'points',    coalesce(r.points, 0),
          'categorie', r.categorie,
          'pourquoi',  public.quiz_pourquoi(q, r.categorie))));
    end if;
  elsif p.phase = 'fin' then
    res := res || jsonb_build_object('bilan', (
      select jsonb_build_object(
        'justes', count(*) filter (where x.juste),
        'notions', coalesce((
          select jsonb_agg(jsonb_strip_nulls(jsonb_build_object('notion', t.notion, 'ratees', t.ratees, 'sur', t.n,
                                                                -- 052 : les parties du cours à revoir, celles des questions ratées
                                                                'revoir', (select jsonb_agg(distinct qq2.value->'revoir')
                                                                             from jsonb_array_elements(p.questions) with ordinality qq2(value, o2)
                                                                             left join public.quiz_reponses x2 on x2.joueur_id = j.id and x2.idx = qq2.o2 - 1
                                                                            where coalesce(qq2.value->>'notion', 'Sans notion') = t.notion
                                                                              and coalesce(x2.juste, false) = false
                                                                              and jsonb_typeof(qq2.value->'revoir') = 'object'))) order by t.ratees desc, t.notion)
            from (select coalesce(qq.value->>'notion', 'Sans notion') notion,
                         count(*) n,
                         count(*) filter (where coalesce(xx.juste, false) = false) ratees
                    from jsonb_array_elements(p.questions) with ordinality qq(value, o)
                    left join public.quiz_reponses xx on xx.joueur_id = j.id and xx.idx = qq.o - 1
                   group by 1) t
           where t.ratees > 0), '[]'::jsonb))
        from public.quiz_reponses x where x.joueur_id = j.id));
  end if;
  return res;
end;
$$;

select public.verrouiller_observateurs();
