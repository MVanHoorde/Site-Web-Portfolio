-- ============================================================
--  049 — La frise de l'IA : tirage des sujets (18/11/2026)
-- ------------------------------------------------------------
--  Séquence d'ouverture de terminale ES (3.5, data-sequence
--  « est-t3-c5 », pages/term-es-t3-c5-frise-ia.html). Décision
--  EST-FRISE-01. Temps 1 : l'élève dit ce qui l'attire, deux sujets
--  lui sont tirés, il en garde un, SANS RETIRAGE.
--
--  POURQUOI DANS LA BASE
--  La répartition est équitable sur la classe : un sujet ne revient
--  à un deuxième élève que quand tous les autres ont été tirés. Une
--  page élève ne voit pas les autres élèves : le calcul se fait ici.
--
--  LE CALCUL (frise_ia_tirer)
--  · La page envoie TOUS les identifiants de sujets, rangés par
--    préférence (croisement des goûts, égalités mélangées). La liste
--    des sujets vit dans la page (assets/js/frise-ia-sujets.js) : elle
--    se retouche sans SQL.
--  · Pour chaque sujet, l'occupation dans la classe : 1 par élève
--    qui l'a gardé, 0,5 par élève à qui il est proposé et qui n'a pas
--    encore choisi. On prend les deux premiers de la liste de l'élève
--    parmi les moins occupés. Un verrou par classe évite que deux
--    élèves qui tirent à la même seconde reçoivent les mêmes.
--  · Un élève qui a déjà tiré retrouve ses deux sujets : pas de
--    retirage, même en rechargeant la page.
--
--  CLASSE : la classe de terminale ES de l'élève (espace « est »).
--  Un élève sans classe de terminale ES ne peut pas tirer.
--
--  ENSEIGNANT : voit les tirages de ses élèves (mon_eleve_pour,
--  cloisonnement du 018) ; peut effacer un tirage (l'élève retire)
--  ou attribuer un sujet à la main.
--
--  RGPD : un identifiant de sujet et les goûts cochés (époque,
--  thème…), rattachés à un compte pseudonyme. Rien de sensible.
--  Part avec le compte (on delete cascade).
--  Purement additif. Rejouable.
-- ============================================================

create table if not exists public.frise_ia_tirages (
  eleve_id     uuid primary key references public.eleves(id) on delete cascade,
  classe_id    uuid not null references public.classes(id) on delete cascade,
  gouts        jsonb not null default '{}'::jsonb,
  propositions text[] not null
                 check (cardinality(propositions) between 1 and 2),
  sujet        text
                 check (sujet is null or sujet ~ '^[a-z0-9-]{2,40}$'),
  tire_le      timestamptz not null default now(),
  choisi_le    timestamptz
);

create index if not exists frise_ia_tirages_classe on public.frise_ia_tirages (classe_id);

comment on table public.frise_ia_tirages is
  'Frise de l''IA (terminale ES, 049) : goûts, deux sujets proposés, sujet gardé. Écrit par frise_ia_tirer/frise_ia_choisir ; l''enseignant lit, corrige ou efface.';

alter table public.frise_ia_tirages enable row level security;

--  L'élève lit sa ligne (la page passe plutôt par frise_ia_mon_tirage).
drop policy if exists frise_ia_eleve_lire on public.frise_ia_tirages;
create policy frise_ia_eleve_lire
  on public.frise_ia_tirages for select to authenticated
  using (eleve_id = (select public.eleve_courant()));

--  L'enseignant : ses élèves de la famille ES seulement.
drop policy if exists frise_ia_prof on public.frise_ia_tirages;
create policy frise_ia_prof
  on public.frise_ia_tirages for all to authenticated
  using      ((select public.mon_eleve_pour(eleve_id, 'est-t3-c5')))
  with check ((select public.mon_eleve_pour(eleve_id, 'est-t3-c5')));

revoke all on public.frise_ia_tirages from anon;
grant select, update, delete on public.frise_ia_tirages to authenticated;


--  La classe de terminale ES de l'élève connecté (NULL s'il n'en a pas).
create or replace function public.frise_ia_ma_classe()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select ap.classe_id
  from public.eleves e
  join public.eleves_classes ap on ap.eleve_id = e.id
  join public.classes c         on c.id = ap.classe_id
  where e.auth_id = (select auth.uid())
    and c.espace = 'est'
  order by c.code
  limit 1
$$;


--  Le tirage. Rend la ligne de l'élève (nouvelle ou existante).
create or replace function public.frise_ia_tirer(p_ordre text[], p_gouts jsonb default '{}'::jsonb)
returns table (propositions text[], sujet text)
language plpgsql
volatile
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_eleve  uuid := public.eleve_courant();
  v_classe uuid := public.frise_ia_ma_classe();
  v_props  text[];
begin
  if v_eleve is null then
    raise exception 'AUCUNE_SESSION' using errcode = '42501';
  end if;
  if v_classe is null then
    raise exception 'PAS_DE_CLASSE_EST' using errcode = '42501';
  end if;
  if p_ordre is null or cardinality(p_ordre) < 2 or cardinality(p_ordre) > 80 then
    raise exception 'LISTE_INVALIDE' using errcode = '22023';
  end if;
  if exists (select 1 from unnest(p_ordre) s where s !~ '^[a-z0-9-]{2,40}$') then
    raise exception 'LISTE_INVALIDE' using errcode = '22023';
  end if;
  if p_gouts is null or jsonb_typeof(p_gouts) <> 'object' or length(p_gouts::text) > 4000 then
    p_gouts := '{}'::jsonb;
  end if;

  --  un tirage par classe à la fois
  perform pg_advisory_xact_lock(hashtext('frise-ia:' || v_classe::text));

  --  déjà tiré : on rend ce qui a été tiré, rien d'autre
  if exists (select 1 from public.frise_ia_tirages t where t.eleve_id = v_eleve) then
    return query select t.propositions, t.sujet from public.frise_ia_tirages t where t.eleve_id = v_eleve;
    return;
  end if;

  with liste as (
    select u.s, min(u.o) as rang
    from unnest(p_ordre) with ordinality as u(s, o)
    group by u.s
  ),
  occupation as (
    select l.s, l.rang,
           coalesce((select sum(case when t.sujet = l.s then 1.0
                                     when t.sujet is null and l.s = any (t.propositions) then 0.5
                                     else 0 end)
                       from public.frise_ia_tirages t
                      where t.classe_id = v_classe), 0) as occ
    from liste l
  )
  select array_agg(s order by occ, rang) into v_props
  from (select s, occ, rang from occupation order by occ, rang limit 2) d;

  insert into public.frise_ia_tirages (eleve_id, classe_id, gouts, propositions)
  values (v_eleve, v_classe, p_gouts, v_props);

  return query select v_props, null::text;
end;
$$;


--  Le choix : un des deux sujets proposés, une seule fois.
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
  update public.frise_ia_tirages t
     set sujet = p_sujet, choisi_le = now()
   where t.eleve_id = v_eleve
     and t.sujet is null
     and p_sujet = any (t.propositions);
  get diagnostics v_n = row_count;
  if v_n = 0 then
    --  déjà choisi (on rend le choix fait) ou sujet non proposé
    if exists (select 1 from public.frise_ia_tirages t where t.eleve_id = v_eleve and t.sujet is not null) then
      return (select t.sujet from public.frise_ia_tirages t where t.eleve_id = v_eleve);
    end if;
    raise exception 'SUJET_NON_PROPOSE' using errcode = '22023';
  end if;
  return p_sujet;
end;
$$;


--  Ce que la page relit à chaque ouverture.
create or replace function public.frise_ia_mon_tirage()
returns table (propositions text[], sujet text, gouts jsonb)
language sql
stable
security definer
set search_path = ''
as $$
  select t.propositions, t.sujet, t.gouts
  from public.frise_ia_tirages t
  where t.eleve_id = public.eleve_courant()
$$;


revoke all on function public.frise_ia_ma_classe()          from public, anon;
revoke all on function public.frise_ia_tirer(text[], jsonb) from public, anon;
revoke all on function public.frise_ia_choisir(text)        from public, anon;
revoke all on function public.frise_ia_mon_tirage()         from public, anon;
grant execute on function public.frise_ia_ma_classe()          to authenticated;
grant execute on function public.frise_ia_tirer(text[], jsonb) to authenticated;
grant execute on function public.frise_ia_choisir(text)        to authenticated;
grant execute on function public.frise_ia_mon_tirage()         to authenticated;


-- Vérifications : chacune doit rendre vrai.
select
  to_regclass('public.frise_ia_tirages') is not null                                   as table_presente,
  (select relrowsecurity from pg_class where oid = 'public.frise_ia_tirages'::regclass) as rls_active,
  not has_table_privilege('anon', 'public.frise_ia_tirages', 'select')                 as anon_ferme,
  not has_function_privilege('anon', 'public.frise_ia_tirer(text[], jsonb)', 'execute') as tirer_ferme_anon,
  not has_table_privilege('authenticated', 'public.frise_ia_tirages', 'insert')        as insertion_par_fonction_seule;
