-- ============================================================
--  045 — Corrigés sur le site, réponse aux signalements (15/11/2026)
-- ------------------------------------------------------------
--  DEUX CHANGEMENTS, UN SEUL COLLAGE.
--
--  A. LES TEXTES DES CORRIGÉS QUITTENT LA BASE
--     Demande de Loïc : recoller du SQL à chaque retouche d'un
--     corrigé est trop lourd. Les textes vivent désormais dans le
--     dépôt (assets/data/corriges/<séquence>.json, générés par
--     _outils/corriges/generer-json.mjs) ; ils sont donc publics,
--     choix assumé : « c'est pour réviser, ce n'est pas évalué ».
--     La base ne garde que CE QUI EST OUVERT À QUELLE CLASSE
--     (corriges_actives), toujours réglé depuis prof/corriges.html.
--     · corriges_actives perd sa clé étrangère vers corriges et
--       gagne la séquence de la question ;
--     · mes_corriges(séquence) garde sa signature (le client
--       progression.js ne change pas) mais ne rend plus que les
--       codes ouverts, texte vide : la page lit le texte dans le
--       fichier du site ;
--     · la table corriges (vide au 15/11) et son déclencheur sont
--       supprimés.
--
--  B. LE PROFESSEUR RÉPOND À UN SIGNALEMENT
--     Le « petit canal de message » choisi par Loïc le 15/11 : une
--     réponse écrite au signalement d'un élève, qu'il lit une fois
--     dans une fenêtre 📬 à l'ouverture d'une page de cours. Même
--     mécanique que le +0,5 (026), dont elle reprend les fonctions :
--     mes_bonus_signalement() rend aussi les réponses non lues,
--     bonus_signalement_vus() les marque lues.
--     RGPD : la réponse ne contient que ce que le professeur écrit ;
--     aucun nom n'est ajouté par la base.
--
--  🔴 ORDRE : publier le site AVANT de coller ce fichier. Une page
--  restée sur l'ancien moteur afficherait une réponse comme un
--  « +0,5 » et la marquerait lue.
--  Rejouable.
-- ============================================================

-- ---------- A. Corrigés : la base ne garde que les ouvertures ----------

alter table public.corriges_actives
  drop constraint if exists corriges_actives_code_fkey;

alter table public.corriges_actives
  add column if not exists sequence text;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'corriges_actives_sequence_check') then
    alter table public.corriges_actives add constraint corriges_actives_sequence_check
      check (sequence ~ '^(es1|est)-t[0-9]+-c[0-9]+$');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'corriges_actives_code_check') then
    alter table public.corriges_actives add constraint corriges_actives_code_check
      check (code ~ '^[A-Za-z0-9][A-Za-z0-9_-]{1,40}$');
  end if;
end $$;

-- vide au 15/11/2026 : rien à reprendre ; une ligne sans séquence serait illisible
delete from public.corriges_actives where sequence is null;
alter table public.corriges_actives alter column sequence set not null;

comment on table public.corriges_actives is
  'Question dont le corrigé est ouvert à une classe (044). Le texte vit sur le site, assets/data/corriges/<sequence>.json (045).';

grant select, insert, update, delete on public.corriges_actives to authenticated;

create or replace function public.mes_corriges(p_sequence text)
returns table (code text, texte text)
language sql
stable
security definer
set search_path = ''
as $$
  select distinct a.code, null::text
  from public.eleves e
  join public.eleves_classes ap   on ap.eleve_id = e.id
  join public.corriges_actives a  on a.classe_id = ap.classe_id
  where e.auth_id = (select auth.uid())
    and a.sequence = p_sequence
$$;

comment on function public.mes_corriges(text) is
  'Codes des corrigés d''une séquence ouverts à une classe de l''élève connecté ; le texte est dans le fichier du site (045).';

revoke all on function public.mes_corriges(text) from public, anon;
grant execute on function public.mes_corriges(text) to authenticated;

-- la table emporte son déclencheur ; la clé étrangère est déjà retirée plus haut
drop table if exists public.corriges;
drop function if exists public.corriges_date();


-- ---------- B. La réponse du professeur à un signalement ----------

alter table public.signalements
  add column if not exists reponse       text,
  add column if not exists reponse_le    timestamptz,
  add column if not exists reponse_vu_le timestamptz;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'signalements_reponse_check') then
    alter table public.signalements add constraint signalements_reponse_check
      check (reponse is null or char_length(btrim(reponse)) between 3 and 800);
  end if;
end $$;

-- L'enseignant écrit la réponse et sa date ; jamais « reponse_vu_le ».
grant update (reponse, reponse_le) on table public.signalements to authenticated;

-- Le type de retour change (deux colonnes de plus) : il faut le recréer.
drop function if exists public.mes_bonus_signalement();
create function public.mes_bonus_signalement()
returns table (id uuid, cree_le timestamptz, cle text, etape text,
               extrait text, bonus_le timestamptz,
               reponse text, reponse_le timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select s.id, s.cree_le, s.cle, s.etape,
         left(s.message, 120),
         case when s.bonus_vu_le   is null then s.bonus_le   end,
         case when s.reponse_vu_le is null then s.reponse    end,
         case when s.reponse_vu_le is null then s.reponse_le end
  from public.signalements s
  where s.eleve_id = (select public.eleve_courant())
    and (   (s.bonus_le   is not null and s.bonus_vu_le   is null)
         or (s.reponse_le is not null and s.reponse_vu_le is null and s.reponse is not null))
  order by coalesce(s.reponse_le, s.bonus_le)
$$;

comment on function public.mes_bonus_signalement() is
  'Les +0,5 et les réponses du professeur pas encore vus par l''élève connecté (026, 045).';

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
     set bonus_vu_le   = coalesce(s.bonus_vu_le,   case when s.bonus_le   is not null then now() end),
         reponse_vu_le = coalesce(s.reponse_vu_le, case when s.reponse_le is not null then now() end)
   where s.id = any(p_ids)
     and s.eleve_id = (select public.eleve_courant())
     and (   (s.bonus_le   is not null and s.bonus_vu_le   is null)
          or (s.reponse_le is not null and s.reponse_vu_le is null));
  get diagnostics n = row_count;
  return n;
end;
$$;

comment on function public.bonus_signalement_vus(uuid[]) is
  'L''élève connecté a vu ces +0,5 ou ces réponses. Ne touche que ses lignes (026, 045).';

revoke all on function public.mes_bonus_signalement()         from public, anon;
revoke all on function public.bonus_signalement_vus(uuid[])   from public, anon;
grant execute on function public.mes_bonus_signalement()       to authenticated;
grant execute on function public.bonus_signalement_vus(uuid[]) to authenticated;


-- Vérifications : chacune doit rendre vrai.
select
  to_regclass('public.corriges') is null                                          as textes_hors_base,
  not exists (select 1 from pg_constraint where conname = 'corriges_actives_code_fkey') as plus_de_cle_etrangere,
  exists (select 1 from information_schema.columns where table_schema = 'public'
          and table_name = 'corriges_actives' and column_name = 'sequence')        as sequence_presente,
  exists (select 1 from information_schema.columns where table_schema = 'public'
          and table_name = 'signalements' and column_name = 'reponse_vu_le')       as reponse_presente,
  not has_function_privilege('anon', 'public.mes_bonus_signalement()', 'execute')  as bonus_ferme_anon,
  not has_function_privilege('anon', 'public.mes_corriges(text)', 'execute')       as corriges_ferme_anon;
