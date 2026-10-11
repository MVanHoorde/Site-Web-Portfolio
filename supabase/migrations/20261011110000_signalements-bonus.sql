-- ============================================================
--  026 — Le +0,5 des signalements retenus
--
--  BESOIN (Loïc, 11/10/2026)
--  Un élève qui signale une erreur ou propose une amélioration
--  intéressante gagne 0,5 point au prochain contrôle. Depuis le
--  tableau de bord, un bouton accorde ce +0,5 ; l'élève en est
--  prévenu à sa prochaine connexion, sur sa page de travail, pour
--  savoir que c'est enregistré. Y compris pour les signalements
--  déjà traités avant ce fichier.
--
--  ARBITRAGES
--  · Deux colonnes, pas de table : un signalement rapporte 0,5 ou
--    rien. bonus_le = quand l'enseignant l'a accordé ; bonus_vu_le
--    = quand l'élève a vu la notification. L'enseignant voit donc
--    si le message est bien arrivé.
--  · Accorder le bonus marque le signalement traité. La date est
--    celle du serveur, jamais celle de la tablette.
--  · Retirer le bonus (clic par erreur) efface aussi « vu » : un
--    bonus accordé de nouveau se notifie de nouveau.
--  · L'élève ne relit toujours pas ses signalements (021) : deux
--    fonctions lui donnent SES bonus non vus, et les marquent vus.
--    Rien d'autre, et rien d'un autre élève.
--
--  RGPD : deux dates de plus sur une ligne déjà pseudonyme.
--
--  Purement additif. Rejouable.
-- ============================================================


-- ------------------------------------------------------------
--  1. Les colonnes
-- ------------------------------------------------------------
alter table public.signalements
  add column if not exists bonus_le    timestamptz,
  add column if not exists bonus_vu_le timestamptz;

comment on column public.signalements.bonus_le is
  '+0,5 au prochain contrôle accordé par l''enseignant (date serveur), ou NULL.';
comment on column public.signalements.bonus_vu_le is
  'Date à laquelle l''élève a vu la notification du bonus, ou NULL.';


-- ------------------------------------------------------------
--  2. Garde-fou : la date du bonus et « vu » ne se trichent pas
--
--  L'enseignant n'écrit que bonus_le (droit de colonne, §4) ; ce
--  déclencheur en fait la date du serveur, garde la première date
--  si on réaccorde, marque traité, et remet « vu » à zéro quand le
--  bonus change.
-- ------------------------------------------------------------
create or replace function public.signalements_bonus()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.bonus_le is distinct from old.bonus_le then
    if new.bonus_le is not null then
      new.bonus_le := coalesce(old.bonus_le, now());
      new.traite   := true;
    end if;
    if new.bonus_le is distinct from old.bonus_le then
      new.bonus_vu_le := null;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists signalements_bonus on public.signalements;
create trigger signalements_bonus
  before update on public.signalements
  for each row execute function public.signalements_bonus();


-- ------------------------------------------------------------
--  3. Côté élève : mes bonus pas encore vus, et « je les ai vus »
-- ------------------------------------------------------------
create or replace function public.mes_bonus_signalement()
returns table (id uuid, cree_le timestamptz, cle text, etape text,
               extrait text, bonus_le timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select s.id, s.cree_le, s.cle, s.etape,
         left(s.message, 120), s.bonus_le
  from public.signalements s
  where s.eleve_id = (select public.eleve_courant())
    and s.bonus_le is not null
    and s.bonus_vu_le is null
  order by s.bonus_le
$$;

comment on function public.mes_bonus_signalement() is
  'Les +0,5 accordés à l''élève connecté et pas encore vus.';

create or replace function public.bonus_signalement_vus(p_ids uuid[])
returns integer
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  n integer;
begin
  update public.signalements s
     set bonus_vu_le = now()
   where s.id = any(p_ids)
     and s.eleve_id = (select public.eleve_courant())
     and s.bonus_le is not null
     and s.bonus_vu_le is null;
  get diagnostics n = row_count;
  return n;
end;
$$;

comment on function public.bonus_signalement_vus(uuid[]) is
  'L''élève connecté a vu la notification de ces bonus. Ne touche que ses lignes.';


-- ------------------------------------------------------------
--  4. Droits
-- ------------------------------------------------------------
-- L'enseignant modifie « traite » et « bonus_le » ; jamais « bonus_vu_le ».
grant update (traite, bonus_le) on table public.signalements to authenticated;

revoke all on function public.signalements_bonus()            from public, anon, authenticated;
revoke all on function public.mes_bonus_signalement()         from public, anon;
revoke all on function public.bonus_signalement_vus(uuid[])   from public, anon;
grant execute on function public.mes_bonus_signalement()       to authenticated;
grant execute on function public.bonus_signalement_vus(uuid[]) to authenticated;

-- ============================================================
--  Vérification
--
-- select column_name from information_schema.columns
--  where table_schema='public' and table_name='signalements'
--    and column_name like 'bonus%';
--  → 2 lignes : bonus_le, bonus_vu_le
-- ============================================================
