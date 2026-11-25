-- ============================================================
--  053 — Diapason : l'indice payant, la calculatrice, l'échelle
--  d'une remise en ordre, l'image de correction
--
--  BESOIN (Loïc, audit du 25/11/2026, pour les BTS MS)
--  1. « Un indice, mais qui coûte : la question ne rapporte plus que la
--     moitié des points. »
--  2. Une calculatrice de collège à côté des questions de calcul.
--  3. Une remise en ordre par glisser-déposer, avec une échelle sur le
--     côté (« la plus petite » en haut, « la plus grande » en bas).
--  4. Une image qui accompagne la solution, montrée à la correction.
--
--  LES NOUVEAUX CHAMPS D'UNE QUESTION (tous facultatifs)
--    indice            texte ($…$ compris) : l'indice payant
--    calculatrice      true : un bouton « Calculatrice » sur le téléphone
--    echelle           ["en haut", "en bas"] : les deux bouts de l'échelle
--                      d'une remise en ordre
--    image_correction  { src, alt } : montrée à la correction seulement
--  Un quiz qui n'en porte aucun se comporte exactement comme avant.
--
--  🔴 L'INDICE NE QUITTE PAS LA BASE AVANT D'ÊTRE PAYÉ
--  · quiz_question_publique ne rend qu'un booléen « a_indice » ;
--  · le texte ne sort que par quiz_indice(jeton, idx), qui ENREGISTRE la
--    prise (table quiz_indices) avant de le rendre — un élève qui ouvre
--    l'inspecteur n'y lit donc rien sans avoir payé ; un indice pris ne
--    se rend pas ;
--  · quiz_repondre divise par deux les GAINS d'une question dont
--    l'indice a été pris (chrono, pari +25 % et points partiels compris ;
--    le pari perdu coûte toujours 200 points : l'indice n'achète pas
--    l'assurance). La réponse garde la trace : quiz_reponses.indice.
--
--  CE QUE CE FICHIER TOUCHE
--  - table neuve quiz_indices (joueur, partie, question, heure) ;
--  - colonne neuve quiz_reponses.indice (faux par défaut) ;
--  - fonction neuve quiz_indice ;
--  - réécrites, à l'identique de 047/052 plus les clés nouvelles :
--    quiz_question_invalide, quiz_question_publique,
--    quiz_question_corrigee (052), quiz_etat (052), quiz_repondre,
--    quiz_suivi.
--
--  POIDS : une ligne de quiz_indices ≈ 60 octets, une par indice pris.
--
--  Suppose 047, 048 et 052 en place (051 indifférent). Rejouable.
--  Banc : _outils/tests/quiz-base.py (+ quiz-indice.test.sql),
--  quiz-parcours.py (navigateur).
-- ============================================================


-- ------------------------------------------------------------
--  1. La trace des indices pris
-- ------------------------------------------------------------
create table if not exists public.quiz_indices (
  joueur_id  uuid not null references public.quiz_joueurs (id) on delete cascade,
  partie_id  uuid not null references public.quiz_parties (id) on delete cascade,
  idx        integer not null check (idx >= 0),
  pris_le    timestamptz not null default now(),
  primary key (joueur_id, idx)
);
create index if not exists quiz_indices_partie on public.quiz_indices (partie_id, idx);
comment on table public.quiz_indices is
  'Diapason (053) : un indice payant pris par un joueur. Lue par l''animateur de la partie.';

alter table public.quiz_reponses
  add column if not exists indice boolean not null default false;

alter table public.quiz_indices enable row level security;
revoke all on public.quiz_indices from anon, authenticated;
grant select, delete on public.quiz_indices to authenticated;
drop policy if exists quiz_indices_animateur on public.quiz_indices;
create policy quiz_indices_animateur on public.quiz_indices for select to authenticated
  using (exists (select 1 from public.quiz_parties p where p.id = partie_id and p.animateur = (select auth.uid())));


-- ------------------------------------------------------------
--  2. Le validateur (047 + les quatre champs)
-- ------------------------------------------------------------
create or replace function public.quiz_question_invalide(q jsonb)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  t text := q->>'type';
  n integer;
  c jsonb;
begin
  if coalesce(jsonb_typeof(q), '') <> 'object' then return 'une question doit être un objet'; end if;
  if t is null or t not in ('qcm', 'vf', 'num', 'ordre', 'zone', 'assoc', 'mot', 'curseur') then
    return 'type inconnu : ' || coalesce(t, '(vide)');
  end if;
  if coalesce(btrim(q->>'enonce'), '') = '' then return 'énoncé vide'; end if;
  if q ? 'temps' and (coalesce(jsonb_typeof(q->'temps'), '') <> 'number'
                      or (q->>'temps')::numeric < 5 or (q->>'temps')::numeric > 240) then
    return 'temps hors de 5 à 240 s';
  end if;

  -- 053 : les champs communs nouveaux
  if q ? 'indice' then
    if coalesce(jsonb_typeof(q->'indice'), '') <> 'string' or btrim(q->>'indice') = '' then
      return 'indice vide : écrire le texte de l''indice, ou retirer le champ';
    end if;
    if length(q->>'indice') > 800 then return 'indice trop long (800 caractères au plus)'; end if;
  end if;
  if q ? 'calculatrice' and coalesce(jsonb_typeof(q->'calculatrice'), '') <> 'boolean' then
    return 'calculatrice : true ou false';
  end if;
  if q ? 'image_correction' and (coalesce(jsonb_typeof(q->'image_correction'), '') <> 'object'
       or coalesce(jsonb_typeof(q->'image_correction'->'src'), '') <> 'string'
       or btrim(q->'image_correction'->>'src') = '' or length(q->'image_correction'->>'src') > 500) then
    return 'image_correction : { "src": "assets/img/…", "alt": "…" }';
  end if;
  if q ? 'echelle' and (coalesce(jsonb_typeof(q->'echelle'), '') <> 'array' or jsonb_array_length(q->'echelle') <> 2
       or exists (select 1 from jsonb_array_elements(q->'echelle') e
                   where jsonb_typeof(e) <> 'string' or length(e #>> '{}') > 80)) then
    return 'echelle : deux libellés, ["en haut", "en bas"]';
  end if;

  if t in ('qcm', 'vf') then
    if t = 'vf' and not q ? 'options' then
      n := 2;                         -- « Vrai », « Faux » par défaut
    else
      if coalesce(jsonb_typeof(q->'options'), '') <> 'array' then return 'options manquantes'; end if;
      n := jsonb_array_length(q->'options');
    end if;
    if n < 2 or n > 6 then return 'il faut 2 à 6 options'; end if;
    if coalesce(jsonb_typeof(q->'correct'), '') <> 'array' or jsonb_array_length(q->'correct') = 0 then
      return 'bonne réponse manquante (correct : [indices])';
    end if;
    for c in select value from jsonb_array_elements(q->'correct') loop
      if coalesce(jsonb_typeof(c), '') <> 'number' or c::text::integer < 0 or c::text::integer >= n then
        return 'indice de bonne réponse hors des options';
      end if;
    end loop;
  elsif t = 'num' then
    if coalesce(jsonb_typeof(q->'num'), '') <> 'object' or coalesce(jsonb_typeof(q->'num'->'valeur'), '') <> 'number' then
      return 'valeur numérique attendue manquante (num.valeur)';
    end if;
    if q->'num' ? 'unites' and coalesce(jsonb_typeof(q->'num'->'unites'), '') <> 'array' then
      return 'num.unites doit être une liste';
    end if;
  elsif t = 'ordre' then
    if coalesce(jsonb_typeof(q->'items'), '') <> 'array' then return 'items manquants'; end if;
    n := jsonb_array_length(q->'items');
    if n < 2 or n > 8 then return 'il faut 2 à 8 éléments à ordonner'; end if;
  elsif t = 'zone' then
    if coalesce(jsonb_typeof(q->'zone'), '') <> 'object' or coalesce(q->'zone'->>'src', '') = '' then
      return 'image de la zone manquante (zone.src)';
    end if;
    if coalesce(jsonb_typeof(q->'zone'->'cibles'), '') <> 'array' or jsonb_array_length(q->'zone'->'cibles') = 0 then
      return 'zone.cibles manquantes';
    end if;
  elsif t = 'assoc' then
    if coalesce(jsonb_typeof(q->'paires'), '') <> 'array' then return 'paires manquantes'; end if;
    n := jsonb_array_length(q->'paires');
    if n < 3 or n > 6 then return 'il faut 3 à 6 paires'; end if;
    for c in select value from jsonb_array_elements(q->'paires') loop
      if coalesce(jsonb_typeof(c), '') <> 'array' or jsonb_array_length(c) <> 2
         or coalesce(btrim(c->>0), '') = '' or coalesce(btrim(c->>1), '') = '' then
        return 'chaque paire est [gauche, droite], deux textes non vides';
      end if;
    end loop;
  elsif t = 'mot' then
    if coalesce(jsonb_typeof(q->'mot'), '') <> 'object' or coalesce(jsonb_typeof(q->'mot'->'acceptes'), '') <> 'array'
       or jsonb_array_length(q->'mot'->'acceptes') = 0 then
      return 'réponses acceptées manquantes (mot.acceptes)';
    end if;
    if exists (select 1 from jsonb_array_elements_text(q->'mot'->'acceptes') a where public.quiz_normaliser(a) = '') then
      return 'une réponse acceptée est vide';
    end if;
  elsif t = 'curseur' then
    if coalesce(jsonb_typeof(q->'curseur'), '') <> 'object' then return 'réglages du curseur manquants (curseur)'; end if;
    if coalesce(jsonb_typeof(q->'curseur'->'min'), '') <> 'number' or coalesce(jsonb_typeof(q->'curseur'->'max'), '') <> 'number'
       or coalesce(jsonb_typeof(q->'curseur'->'valeur'), '') <> 'number' then
      return 'curseur.min, curseur.max et curseur.valeur sont des nombres';
    end if;
    if (q->'curseur'->>'min')::numeric >= (q->'curseur'->>'max')::numeric then return 'curseur.min doit être inférieur à curseur.max'; end if;
    if (q->'curseur'->>'valeur')::numeric not between (q->'curseur'->>'min')::numeric and (q->'curseur'->>'max')::numeric then
      return 'curseur.valeur hors de l''échelle';
    end if;
    if coalesce((q->'curseur'->>'pas')::numeric, 1) <= 0 or coalesce((q->'curseur'->>'tolerance')::numeric, 0) < 0 then
      return 'curseur.pas doit être positif, curseur.tolerance positive ou nulle';
    end if;
  end if;
  return null;
end;
$$;


-- ------------------------------------------------------------
--  3. Ce que l'élève voit pendant la question (047 + trois clés)
--     a_indice : un booléen, JAMAIS le texte de l'indice.
--     🔴 à ne pas confondre avec « indice » (mot.indice, le petit
--     texte gratuit sous le champ d'une question « mot »).
-- ------------------------------------------------------------
create or replace function public.quiz_question_publique(q jsonb)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select jsonb_strip_nulls(jsonb_build_object(
    'type',    q->>'type',
    'enonce',  q->'enonce',
    'notion',  q->'notion',
    'temps',   coalesce(q->'temps', '20'::jsonb),
    'image',   q->'image',
    'options', case when q->>'type' = 'vf' then coalesce(q->'options', '["Vrai","Faux"]'::jsonb)
                    when q->>'type' = 'qcm' then q->'options' end,
    'multiple', case when q->>'type' = 'qcm' and jsonb_array_length(q->'correct') > 1 then true end,
    'unites',  case when q->>'type' = 'num' then q->'num'->'unites' end,
    -- l'identifiant est la POSITION affichée, pas l'indice d'origine
    'items',   case when q->>'type' = 'ordre' then (
                 select jsonb_agg(jsonb_build_object('id', m.o - 1, 'texte', q->'items'->(m.v::integer))
                                  order by m.o)
                 from jsonb_array_elements_text(q->'melange') with ordinality m(v, o)) end,
    'echelle', case when q->>'type' = 'ordre' and jsonb_typeof(q->'echelle') = 'array' then q->'echelle' end,
    'zone',    case when q->>'type' = 'zone' then jsonb_build_object('src', q->'zone'->'src', 'alt', q->'zone'->'alt') end,
    'gauche',  case when q->>'type' = 'assoc' then (
                 select jsonb_agg(p.v->0 order by p.o) from jsonb_array_elements(q->'paires') with ordinality p(v, o)) end,
    'droite',  case when q->>'type' = 'assoc' then (
                 select jsonb_agg(q->'paires'->(m.v::integer)->1 order by m.o)
                 from jsonb_array_elements_text(q->'melange') with ordinality m(v, o)) end,
    'indice',  case when q->>'type' = 'mot' then q->'mot'->'indice' end,
    'curseur', case when q->>'type' = 'curseur' then jsonb_build_object(
                 'min', q->'curseur'->'min', 'max', q->'curseur'->'max',
                 'pas', coalesce(q->'curseur'->'pas', '1'::jsonb), 'unite', q->'curseur'->'unite') end,
    'a_indice', case when jsonb_typeof(q->'indice') = 'string' and btrim(q->>'indice') <> '' then true end,
    'calculatrice', case when q->'calculatrice' = 'true'::jsonb then true end
  ))
$$;


-- ------------------------------------------------------------
--  4. La correction (052 + l'image de correction)
-- ------------------------------------------------------------
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
    'revoir',  q->'revoir',
    'image_correction', case when jsonb_typeof(q->'image_correction') = 'object' then q->'image_correction' end
  ))
$$;


-- ------------------------------------------------------------
--  5. Prendre l'indice : la prise est écrite AVANT que le texte sorte
-- ------------------------------------------------------------
create or replace function public.quiz_indice(p_jeton uuid, p_idx integer)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  j public.quiz_joueurs%rowtype;
  p public.quiz_parties%rowtype;
  q jsonb;
begin
  select * into j from public.quiz_joueurs where jeton = p_jeton;
  if not found then raise exception 'QUIZ_EXCLU'; end if;
  select * into p from public.quiz_parties where id = j.partie_id for share;
  if p.phase <> 'question' or p.idx <> p_idx or now() > p.fin + interval '1.5 seconds' then
    raise exception 'QUIZ_TROP_TARD';
  end if;
  q := p.questions->p_idx;
  if coalesce(jsonb_typeof(q->'indice'), '') <> 'string' or btrim(q->>'indice') = '' then
    raise exception 'QUIZ_PAS_D_INDICE';
  end if;
  -- après la réponse, l'indice ne sert plus à rien et ne se prend plus
  if exists (select 1 from public.quiz_reponses where joueur_id = j.id and idx = p_idx) then
    raise exception 'QUIZ_DEJA_REPONDU';
  end if;
  insert into public.quiz_indices (joueur_id, partie_id, idx) values (j.id, p.id, p_idx)
  on conflict do nothing;
  return jsonb_build_object('indice', q->'indice');
end;
$$;


-- ------------------------------------------------------------
--  6. L'état d'un joueur (052 + l'indice déjà pris, rendu à qui l'a payé)
-- ------------------------------------------------------------
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
    -- 053 : l'indice que CE joueur a payé (rechargement de la page compris)
    if exists (select 1 from public.quiz_indices i where i.joueur_id = j.id and i.idx = p.idx) then
      res := res || jsonb_build_object('mon_indice', q->'indice');
    end if;
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
          'indice',    case when r.indice then true end,
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


-- ------------------------------------------------------------
--  7. Répondre (047 + la moitié des gains si l'indice a été pris)
-- ------------------------------------------------------------
create or replace function public.quiz_repondre(p_jeton uuid, p_idx integer, p_reponse jsonb, p_sur boolean default false)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  j public.quiz_joueurs%rowtype;
  p public.quiz_parties%rowtype;
  q jsonb;
  v jsonb;
  duree integer;
  t integer;
  sur boolean;
  juste boolean;
  part numeric;
  gain integer;
  v_indice boolean;
begin
  select * into j from public.quiz_joueurs where jeton = p_jeton;
  if not found then raise exception 'QUIZ_EXCLU'; end if;
  select * into p from public.quiz_parties where id = j.partie_id for share;
  -- 1,5 s de grâce : le temps que la réponse traverse le wifi du lycée
  if p.phase <> 'question' or p.idx <> p_idx or now() > p.fin + interval '1.5 seconds' then
    raise exception 'QUIZ_TROP_TARD';
  end if;
  if pg_column_size(p_reponse) >= 4000 or coalesce(jsonb_typeof(p_reponse), '') <> 'object' then
    raise exception 'QUIZ_REPONSE_INVALIDE';
  end if;

  q := p.questions->p_idx;
  v := public.quiz_juger(q, p_reponse);
  juste := (v->>'juste')::boolean;
  part := coalesce((v->>'part')::numeric, 0);
  duree := (coalesce((q->>'temps')::numeric, 20) * 1000)::integer;
  t := greatest(0, floor(extract(epoch from (now() - p.debut)) * 1000))::integer;
  sur := coalesce(p_sur, false) and coalesce((p.options->>'pari')::boolean, false);
  v_indice := exists (select 1 from public.quiz_indices i where i.joueur_id = j.id and i.idx = p_idx);

  -- les gains : 1 000 au plus, la moitié perdue au fil du chrono, +25 %
  -- avec le pari ; une part seulement pour les points partiels (assoc,
  -- curseur) ; la MOITIÉ si l'indice a été pris (053)
  gain := case when juste then public.quiz_points(true, t, duree, sur)
               when part > 0 then round(public.quiz_points(true, t, duree, false) * part)::integer
               else 0 end;
  if v_indice then gain := round(gain / 2.0)::integer; end if;

  begin
    insert into public.quiz_reponses (joueur_id, partie_id, idx, reponse, juste, categorie, points, temps_ms, sur, indice)
    values (j.id, p.id, p_idx, p_reponse, juste, v->>'categorie',
            -- un pari sur une réponse fausse ou incomplète coûte 200 points
            gain - case when sur and not juste then 200 else 0 end,
            t, sur, v_indice);
  exception when unique_violation then
    raise exception 'QUIZ_DEJA_REPONDU';
  end;
  -- entraînement : la correction suit la réponse, sans attendre personne
  if p.mode = 'solo' then
    update public.quiz_parties set phase = 'correction', fin = least(fin, now()), version = version + 1
     where id = p.id;
  end if;
  return jsonb_build_object('enregistre', true);
end;
$$;


-- ------------------------------------------------------------
--  8. Le suivi de l'écran projeté (047 + les indices de la question)
-- ------------------------------------------------------------
create or replace function public.quiz_suivi(p_partie uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  p public.quiz_parties%rowtype;
begin
  select * into p from public.quiz_parties where id = p_partie and animateur = auth.uid();
  if not found then raise exception 'QUIZ_PARTIE_INCONNUE'; end if;
  return jsonb_build_object(
    'phase', p.phase, 'idx', p.idx, 'version', p.version, 'ferme', p.close_le is not null,
    'reste_ms', case when p.phase = 'question'
                     then greatest(0, floor(extract(epoch from (p.fin - now())) * 1000))::integer end,
    'joueurs', coalesce((
      select jsonb_agg(jsonb_build_object('id', jj.id, 'pseudo', jj.pseudo,
               'score', greatest(0, coalesce((select sum(x.points) from public.quiz_reponses x where x.joueur_id = jj.id), 0)))
             order by jj.rejoint_le)
        from public.quiz_joueurs jj where jj.partie_id = p.id), '[]'::jsonb),
    'reponses', coalesce((
      select jsonb_agg(jsonb_build_object('joueur', x.joueur_id, 'reponse', x.reponse, 'juste', x.juste,
               'categorie', x.categorie, 'points', x.points, 'temps_ms', x.temps_ms, 'sur', x.sur, 'indice', x.indice))
        from public.quiz_reponses x where x.partie_id = p.id and x.idx = p.idx), '[]'::jsonb),
    -- 053 : combien ont pris l'indice de la question en cours
    'indices', (select count(*) from public.quiz_indices i where i.partie_id = p.id and i.idx = p.idx));
end;
$$;


-- ------------------------------------------------------------
--  9. Droits
-- ------------------------------------------------------------
revoke execute on function public.quiz_indice(uuid, integer) from public, anon, authenticated;
grant execute on function public.quiz_indice(uuid, integer) to anon, authenticated;

select public.verrouiller_observateurs();

select
  (select count(*) from pg_tables where schemaname = 'public' and tablename like 'quiz\_%') as tables_quiz,
  (select count(*) from information_schema.columns
    where table_schema = 'public' and table_name = 'quiz_reponses' and column_name = 'indice') as colonne_indice,
  (select count(*) from pg_proc where proname = 'quiz_indice' and pronamespace = 'public'::regnamespace) as fonction_indice;
