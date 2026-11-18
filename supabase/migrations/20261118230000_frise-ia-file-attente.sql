-- ============================================================
--  050 — La frise de l'IA : décompte, file d'attente, essentiels
--        (18/11/2026, demande de Loïc la veille du lancement)
-- ------------------------------------------------------------
--  Remplace le calcul du 049 (frise_ia_tirer reste appelable, il
--  passe par le nouveau). Les tirages déjà faits sont gardés.
--
--  LES RÈGLES
--  · 49 sujets, dont 25 ESSENTIELS (programme 3.5). La liste vit dans
--    la page (assets/js/frise-ia-sujets.js) ; la page envoie l'ordre
--    de préférence, les sujets qui CORRESPONDENT aux goûts (au moins
--    deux lignes croisées) et la liste des essentiels.
--  · DÉCOMPTE : deux sujets proposés restent réservés 60 s. Sans
--    choix, ils sont libérés et l'élève repasse dans la file. Ses deux
--    mêmes sujets lui reviennent en premier s'ils sont encore libres :
--    laisser filer le décompte ne fait rien gagner (pas de retirage
--    déguisé).
--  · Un sujet est OCCUPÉ s'il est gardé par un élève de la classe ou
--    proposé à un autre élève dont le décompte court. Les sujets
--    proposés sont toujours libres, donc jamais en double tant qu'il
--    en reste.
--  · ESSENTIELS GARANTIS : dès qu'il ne reste pas plus d'élèves sans
--    sujet que d'essentiels libres, on ne propose plus que des
--    essentiels. Avant, les essentiels passent en tête à goûts égaux.
--  · FILE D'ATTENTE : aucun sujet libre ne correspond aux goûts, mais
--    un qui correspond est réservé (décompte en cours) chez un
--    camarade → l'élève attend (la page réessaie toute seule). Au bout
--    de 3 min, ou si rien de ce qui correspond ne peut se libérer, on
--    lui propose les meilleurs sujets libres.
--  · Tout est pris (plus de 49 élèves) : les moins pris, en double.
--
--  RGPD : rien de nouveau (deux horodatages). Rejouable.
--  ORDRE : après le 049, avant la publication de la page.
-- ============================================================

alter table public.frise_ia_tirages add column if not exists propose_le     timestamptz;
alter table public.frise_ia_tirages add column if not exists attente_depuis timestamptz;

--  propositions peut être vide (élève dans la file d'attente)
alter table public.frise_ia_tirages drop constraint if exists frise_ia_tirages_propositions_check;
alter table public.frise_ia_tirages drop constraint if exists frise_ia_propositions_0_a_2;
alter table public.frise_ia_tirages add constraint frise_ia_propositions_0_a_2
  check (cardinality(propositions) <= 2);

--  les tirages en cours au passage du 050 : leur décompte part de maintenant
update public.frise_ia_tirages
   set propose_le = now()
 where sujet is null and propose_le is null and cardinality(propositions) > 0;


create or replace function public.frise_ia_tirage(
  p_ordre      text[],
  p_corresp    text[] default '{}',
  p_essentiels text[] default '{}',
  p_gouts      jsonb  default '{}'::jsonb)
returns table (etat text, propositions text[], sujet text, reste integer)
language plpgsql
volatile
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  c_decompte constant interval := interval '60 seconds';
  c_attente  constant interval := interval '180 seconds';
  v_eleve   uuid := public.eleve_courant();
  v_classe  uuid := public.frise_ia_ma_classe();
  r         public.frise_ia_tirages%rowtype;
  v_libres  text[];
  v_pool    text[];
  v_props   text[];
  v_prev    text[] := '{}';
  v_taille  int;
  v_restant int;
  v_ess     int;
  v_existe  boolean;
begin
  if v_eleve is null then
    raise exception 'AUCUNE_SESSION' using errcode = '42501';
  end if;
  if v_classe is null then
    raise exception 'PAS_DE_CLASSE_EST' using errcode = '42501';
  end if;
  p_corresp    := coalesce(p_corresp, '{}');
  p_essentiels := coalesce(p_essentiels, '{}');
  if p_ordre is null or cardinality(p_ordre) < 2 or cardinality(p_ordre) > 80
     or cardinality(p_corresp) > 80 or cardinality(p_essentiels) > 80 then
    raise exception 'LISTE_INVALIDE' using errcode = '22023';
  end if;
  if exists (select 1 from unnest(p_ordre || p_corresp || p_essentiels) x where x !~ '^[a-z0-9-]{2,40}$') then
    raise exception 'LISTE_INVALIDE' using errcode = '22023';
  end if;
  if p_gouts is null or coalesce(jsonb_typeof(p_gouts), '') <> 'object' or length(p_gouts::text) > 4000 then
    p_gouts := '{}'::jsonb;
  end if;

  perform pg_advisory_xact_lock(hashtext('frise-ia:' || v_classe::text));

  select * into r from public.frise_ia_tirages t where t.eleve_id = v_eleve;
  v_existe := found;

  --  déjà un sujet : rien ne bouge
  if v_existe and r.sujet is not null then
    return query select 'choisi'::text, r.propositions, r.sujet, 0;
    return;
  end if;
  --  décompte en cours : les mêmes deux sujets, le temps qui reste
  if v_existe and r.propose_le is not null and r.propose_le > now() - c_decompte
     and cardinality(r.propositions) > 0 then
    return query select 'propose'::text, r.propositions, null::text,
      greatest(1, ceil(extract(epoch from (r.propose_le + c_decompte - now())))::int);
    return;
  end if;
  if v_existe and r.propose_le is not null then
    v_prev := r.propositions;     -- décompte écoulé : ils reviendront en premier s'ils sont libres
  end if;

  --  les sujets libres, dans l'ordre de préférence de l'élève
  with occupes as (
    select unnest(case when t.sujet is not null then array[t.sujet]
                       when t.propose_le > now() - c_decompte then t.propositions
                       else '{}'::text[] end) as s
    from public.frise_ia_tirages t
    where t.classe_id = v_classe and t.eleve_id <> v_eleve
  ), liste as (
    select u.s, min(u.o) as rang from unnest(p_ordre) with ordinality as u(s, o) group by u.s
  )
  select coalesce(array_agg(l.s order by l.rang), '{}') into v_libres
  from liste l where l.s not in (select o.s from occupes o where o.s is not null);

  --  essentiels garantis
  select count(*) into v_taille from public.eleves_classes ap where ap.classe_id = v_classe;
  select v_taille - count(*) into v_restant
  from public.frise_ia_tirages t
  where t.classe_id = v_classe and t.eleve_id <> v_eleve
    and (t.sujet is not null or t.propose_le > now() - c_decompte);
  select count(*) into v_ess from unnest(v_libres) x where x = any (p_essentiels);
  v_pool := v_libres;
  if v_ess > 0 and v_ess >= v_restant then
    select array_agg(x order by o) into v_pool
    from unnest(v_libres) with ordinality as u(x, o) where x = any (p_essentiels);
  end if;

  --  ce qui correspond aux goûts, essentiels en tête
  select coalesce(array_agg(x order by (x = any (v_prev)) desc, (x = any (p_essentiels)) desc, o), '{}') into v_props
  from unnest(v_pool) with ordinality as u(x, o)
  where x = any (p_corresp) or x = any (v_prev);

  if cardinality(v_props) = 0 then
    --  rien de libre ne correspond : la file d'attente, si un sujet qui
    --  correspond est réservé chez un camarade et peut donc se libérer
    if exists (select 1 from public.frise_ia_tirages t
               where t.classe_id = v_classe and t.eleve_id <> v_eleve and t.sujet is null
                 and t.propose_le > now() - c_decompte and t.propositions && p_corresp)
       and (not v_existe or r.attente_depuis is null or r.attente_depuis > now() - c_attente) then
      insert into public.frise_ia_tirages as t (eleve_id, classe_id, gouts, propositions, propose_le, attente_depuis)
      values (v_eleve, v_classe, p_gouts, '{}', null, now())
      on conflict (eleve_id) do update
        set propositions = '{}', propose_le = null,
            attente_depuis = coalesce(t.attente_depuis, now()), gouts = excluded.gouts;
      return query select 'attente'::text, '{}'::text[], null::text,
        (select greatest(0, ceil(extract(epoch from (t.attente_depuis + c_attente - now())))::int)
           from public.frise_ia_tirages t where t.eleve_id = v_eleve);
      return;
    end if;
  end if;

  --  compléter jusqu'à deux : correspondants, puis le reste du lot (essentiels en tête)
  select array_agg(x order by k) into v_props from (
    select x, min(k) as k from (
      select x, 1000 + o as k from unnest(v_props) with ordinality as a(x, o)
      union all
      select x, 2000 + (case when x = any (p_essentiels) then 0 else 500 end) + o
      from unnest(v_pool) with ordinality as b(x, o)
    ) z group by x order by min(k) limit 2
  ) d;

  --  plus aucun sujet libre : les moins pris, en double
  if v_props is null or cardinality(v_props) = 0 then
    with liste as (
      select u.s, min(u.o) as rang from unnest(p_ordre) with ordinality as u(s, o) group by u.s
    )
    select array_agg(s order by n, rang) into v_props from (
      select l.s, l.rang,
             (select count(*) from public.frise_ia_tirages t where t.classe_id = v_classe and t.sujet = l.s) as n
      from liste l order by 3, l.rang limit 2
    ) d;
  end if;

  insert into public.frise_ia_tirages as t (eleve_id, classe_id, gouts, propositions, propose_le, attente_depuis)
  values (v_eleve, v_classe, p_gouts, v_props, now(), null)
  on conflict (eleve_id) do update
    set propositions = excluded.propositions, propose_le = now(), attente_depuis = null, gouts = excluded.gouts;

  return query select 'propose'::text, v_props, null::text, extract(epoch from c_decompte)::int;
end;
$$;


--  L'ancien appel (049) passe par le nouveau calcul : une page restée
--  en cache continue de fonctionner.
create or replace function public.frise_ia_tirer(p_ordre text[], p_gouts jsonb default '{}'::jsonb)
returns table (propositions text[], sujet text)
language sql
volatile
security definer
set search_path = ''
as $$
  select t.propositions, t.sujet from public.frise_ia_tirage(p_ordre, p_ordre, '{}'::text[], p_gouts) t
$$;


--  Le choix : un des deux sujets proposés, pendant le décompte (5 s de grâce).
create or replace function public.frise_ia_choisir(p_sujet text)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_eleve uuid := public.eleve_courant();
  v_n     int;
begin
  if v_eleve is null then
    raise exception 'AUCUNE_SESSION' using errcode = '42501';
  end if;
  if exists (select 1 from public.frise_ia_tirages t where t.eleve_id = v_eleve and t.sujet is not null) then
    return (select t.sujet from public.frise_ia_tirages t where t.eleve_id = v_eleve);
  end if;
  update public.frise_ia_tirages t
     set sujet = p_sujet, choisi_le = now()
   where t.eleve_id = v_eleve
     and t.sujet is null
     and p_sujet = any (t.propositions)
     and (t.propose_le is null or t.propose_le > now() - interval '65 seconds');
  get diagnostics v_n = row_count;
  if v_n = 0 then
    if exists (select 1 from public.frise_ia_tirages t where t.eleve_id = v_eleve and p_sujet = any (t.propositions)) then
      raise exception 'DECOMPTE_ECOULE' using errcode = '22023';
    end if;
    raise exception 'SUJET_NON_PROPOSE' using errcode = '22023';
  end if;
  return p_sujet;
end;
$$;


--  Ce que la page relit à chaque ouverture : l'état et le temps qui reste.
drop function if exists public.frise_ia_mon_tirage();
create function public.frise_ia_mon_tirage()
returns table (etat text, propositions text[], sujet text, gouts jsonb, reste integer)
language sql
stable
security definer
set search_path = ''
as $$
  select case when t.sujet is not null then 'choisi'
              when cardinality(t.propositions) > 0 and t.propose_le > now() - interval '60 seconds' then 'propose'
              else 'a_relancer' end,
         t.propositions, t.sujet, t.gouts,
         case when t.sujet is null and t.propose_le > now() - interval '60 seconds'
              then greatest(1, ceil(extract(epoch from (t.propose_le + interval '60 seconds' - now())))::int)
              else 0 end
  from public.frise_ia_tirages t
  where t.eleve_id = public.eleve_courant()
$$;


revoke all on function public.frise_ia_tirage(text[], text[], text[], jsonb) from public, anon;
revoke all on function public.frise_ia_tirer(text[], jsonb)                  from public, anon;
revoke all on function public.frise_ia_choisir(text)                         from public, anon;
revoke all on function public.frise_ia_mon_tirage()                          from public, anon;
grant execute on function public.frise_ia_tirage(text[], text[], text[], jsonb) to authenticated;
grant execute on function public.frise_ia_tirer(text[], jsonb)                  to authenticated;
grant execute on function public.frise_ia_choisir(text)                         to authenticated;
grant execute on function public.frise_ia_mon_tirage()                          to authenticated;


-- Vérifications : chacune doit rendre vrai.
select
  exists (select 1 from information_schema.columns
           where table_schema = 'public' and table_name = 'frise_ia_tirages' and column_name = 'propose_le')    as colonne_decompte,
  exists (select 1 from information_schema.columns
           where table_schema = 'public' and table_name = 'frise_ia_tirages' and column_name = 'attente_depuis') as colonne_attente,
  not has_function_privilege('anon', 'public.frise_ia_tirage(text[], text[], text[], jsonb)', 'execute')    as tirage_ferme_anon,
  has_function_privilege('authenticated', 'public.frise_ia_tirage(text[], text[], text[], jsonb)', 'execute') as tirage_ouvert_eleves;
