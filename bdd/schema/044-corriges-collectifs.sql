-- ============================================================
--  044 — Les corrigés collectifs, activés à distance (14/11/2026)
-- ------------------------------------------------------------
--  Demande de Loïc : pouvoir afficher à toute une classe la
--  correction des exercices d'enseignement scientifique (1re et
--  terminale), à côté de ce que chaque élève a écrit. Pas pour
--  corriger sa copie : pour qu'il constate l'écart. Utile quand le
--  temps manque pour reprendre l'exercice en classe.
--
--  🔴 La réponse de l'élève n'est JAMAIS touchée : le corrigé vit
--  dans sa propre table, l'élève le lit à côté de sa copie
--  (reponses_libres, progression : rien ne change).
--
--  DEUX TABLES
--  · corriges : un texte par question (code = data-focus-code de
--    la page). Seulement les exercices qui se résolvent avec le
--    cours ou un petit calcul : ni prise de notes, ni réflexion
--    personnelle (règle de Loïc du 14/11). Écrit par le
--    gestionnaire seul, lu par tout enseignant (aperçu avant
--    activation, dans prof/corriges.html).
--  · corriges_actives : quelle question est ouverte à quelle
--    classe. Chaque enseignant ouvre et ferme pour SES classes
--    (mes_classes, 016). Rangé par QUESTION et non par séance : les
--    codes sont stables, les numéros de séance bougent quand un
--    cours se réorganise — une activation par séance se serait
--    décalée en silence. L'écran regroupe par séance pour le clic.
--
--  CÔTÉ ÉLÈVE : aucune lecture directe des tables. La fonction
--  mes_corriges(séquence) ne rend que les corrigés ouverts à une
--  classe de l'élève. Le texte d'un corrigé non activé ne quitte
--  pas la base — c'est pour ça qu'il n'est pas dans le dépôt
--  public (les sources vivent hors Git, dans _corriges-es/).
--
--  RGPD : aucune donnée d'élève. Un corrigé est un contenu de cours.
--  Purement additif. Rejouable.
-- ============================================================

create table if not exists public.corriges (
  code     text primary key
             check (code ~ '^[A-Za-z0-9][A-Za-z0-9_-]{1,40}$'),
  sequence text not null
             check (sequence ~ '^(es1|est)-t[0-9]+-c[0-9]+$'),
  texte    text not null
             check (char_length(btrim(texte)) between 3 and 4000),
  maj_le   timestamptz not null default now()
);

create index if not exists corriges_par_sequence on public.corriges (sequence);

comment on table public.corriges is
  'Corrigé type d''une question rédigée d''ES (code = data-focus-code). Écrit par le gestionnaire, lu par les enseignants ; les élèves passent par mes_corriges() (044).';

alter table public.corriges enable row level security;

drop policy if exists corriges_lire on public.corriges;
create policy corriges_lire
  on public.corriges for select to authenticated
  using ((select public.est_enseignant()));

drop policy if exists corriges_ecrire on public.corriges;
create policy corriges_ecrire
  on public.corriges for all to authenticated
  using ((select public.est_gestionnaire()))
  with check ((select public.est_gestionnaire()));

revoke all on public.corriges from anon;
grant select, insert, update, delete on public.corriges to authenticated;

create or replace function public.corriges_date()
returns trigger language plpgsql set search_path = '' as $$
begin new.maj_le := now(); return new; end $$;

drop trigger if exists corriges_date on public.corriges;
create trigger corriges_date before insert or update on public.corriges
  for each row execute function public.corriges_date();


create table if not exists public.corriges_actives (
  classe_id  uuid not null references public.classes(id) on delete cascade,
  code       text not null references public.corriges(code) on delete cascade,
  primary key (classe_id, code),
  active_par uuid default auth.uid() references auth.users(id) on delete set null,
  active_le  timestamptz not null default now()
);

comment on table public.corriges_actives is
  'Question dont le corrigé est ouvert à une classe. Chaque enseignant ouvre et ferme pour ses classes (044).';

alter table public.corriges_actives enable row level security;

drop policy if exists corriges_actives_mes_classes on public.corriges_actives;
create policy corriges_actives_mes_classes
  on public.corriges_actives for all to authenticated
  using      (classe_id in (select public.mes_classes()))
  with check (classe_id in (select public.mes_classes()));

revoke all on public.corriges_actives from anon;
grant select, insert, delete on public.corriges_actives to authenticated;


--  Ce que l'élève connecté peut lire : les corrigés de cette
--  séquence ouverts à l'une de ses classes. Rien d'autre.
create or replace function public.mes_corriges(p_sequence text)
returns table (code text, texte text)
language sql
stable
security definer
set search_path = ''
as $$
  select distinct c.code, c.texte
  from public.eleves e
  join public.eleves_classes ap   on ap.eleve_id = e.id
  join public.corriges_actives a  on a.classe_id = ap.classe_id
  join public.corriges c          on c.code = a.code
  where e.auth_id = (select auth.uid())
    and c.sequence = p_sequence
$$;

comment on function public.mes_corriges(text) is
  'Corrigés d''une séquence ouverts à une classe de l''élève connecté (044).';

revoke all on function public.mes_corriges(text) from public, anon;
grant execute on function public.mes_corriges(text) to authenticated;


-- Vérifications : chacune doit rendre vrai.
select
  to_regclass('public.corriges') is not null                                as corriges_presente,
  to_regclass('public.corriges_actives') is not null                        as actives_presente,
  (select relrowsecurity from pg_class where oid = 'public.corriges'::regclass)         as rls_corriges,
  (select relrowsecurity from pg_class where oid = 'public.corriges_actives'::regclass) as rls_actives,
  not has_table_privilege('anon', 'public.corriges', 'select')              as anon_ferme,
  not has_function_privilege('anon', 'public.mes_corriges(text)', 'execute') as fonction_fermee_anon;
