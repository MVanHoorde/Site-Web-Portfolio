-- ============================================================
--  011 — La bibliothèque de réponses types
--
--  BESOIN (Loïc, 01/08/2026, après le premier test réel)
--  « Je vais recevoir des copies très similaires où il manque
--    toujours la même chose — par exemple, personne ne mentionne
--    Louis Pouzin sur la question CYCLADES. Quand j'écris ma
--    première réponse, je veux pouvoir la garder et la réutiliser. »
--
--  POURQUOI EN BASE ET PAS DANS LE NAVIGATEUR
--  Le stockage local du tableau de bord meurt avec la session
--  (12 h) — c'est une règle qu'on ne veut pas assouplir, elle
--  protège les noms d'élèves. Or ces modèles doivent durer l'année
--  et suivre Loïc de l'iPad au PC. Ce n'est pas une donnée d'élève :
--  c'est SON contenu pédagogique, au même titre qu'une grille.
--
--  RATTACHÉ À UNE QUESTION, PAS GLOBAL
--  Un modèle écrit pour « pourquoi CYCLADES a échoué » n'a aucun
--  sens sur une question de glossaire. La clé porte donc le
--  code_activite : le tableau de bord ne propose que les modèles de
--  la copie affichée, sinon la liste devient un fourre-tout
--  qu'on ne relit plus.
--
--  RGPD : aucune donnée d'élève ici. Un modèle est une phrase de
--  correction écrite par le professeur. Le garde-fou habituel
--  s'applique quand même — ne jamais y recopier le nom d'un élève,
--  puisqu'un modèle est par définition destiné à être réutilisé
--  pour quelqu'un d'autre.
--
--  Rejouable.
-- ============================================================

create table if not exists public.modeles_correction (
  id uuid primary key default gen_random_uuid(),

  -- Le propriétaire. Un modèle appartient à l'enseignant qui l'a
  -- écrit : le jour où des collègues rejoignent le dispositif, ils
  -- ne verront pas la bibliothèque des autres. Cloisonnement posé
  -- dès maintenant, pour ne pas avoir à migrer plus tard.
  auth_id uuid not null references auth.users(id) on delete cascade,

  -- La question concernée : 'NET-R2', 'NET-G-fibre'…
  code_activite text not null
    check (char_length(code_activite) between 2 and 40),

  texte text not null
    check (char_length(btrim(texte)) between 3 and 1000),

  -- Compteur d'usage. Sert à ranger les modèles les plus utiles en
  -- tête plutôt que par ordre de création : au bout de trente
  -- modèles, l'ordre chronologique ne veut plus rien dire.
  usages integer not null default 0,

  cree_le timestamptz not null default now(),

  -- Deux fois la même phrase sur la même question n'a pas de sens.
  unique (auth_id, code_activite, texte)
);

comment on table public.modeles_correction is
  'Bibliothèque de réponses types du professeur, par question. Contenu pédagogique, aucune donnée d''élève.';

alter table public.modeles_correction enable row level security;

-- Chacun ne voit et ne modifie QUE ses propres modèles : le filtre
-- porte sur auth_id, pas seulement sur est_enseignant().
drop policy if exists modeles_les_miens on public.modeles_correction;
create policy modeles_les_miens
  on public.modeles_correction for all to authenticated
  using       ((select auth.uid()) = auth_id and (select public.est_enseignant()))
  with check  ((select auth.uid()) = auth_id and (select public.est_enseignant()));

revoke all on table public.modeles_correction from anon;
grant select, insert, update, delete
  on table public.modeles_correction to authenticated;

-- Incrémente le compteur d'usage. Une fonction plutôt qu'un UPDATE
-- côté client : évite d'exposer une écriture arbitraire sur la
-- colonne, et le client n'a pas à lire la valeur avant de l'écrire.
create or replace function public.modele_utilise(p_modele uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.modeles_correction
     set usages = usages + 1
   where id = p_modele
     and auth_id = (select auth.uid());
end;
$$;

revoke all on function public.modele_utilise(uuid) from public, anon, authenticated;
grant execute on function public.modele_utilise(uuid) to authenticated;

-- ============================================================
--  Vérification
--
-- select c.relname, c.relrowsecurity, count(p.polname)
-- from pg_class c
-- join pg_namespace n on n.oid = c.relnamespace
-- left join pg_policy p on p.polrelid = c.oid
-- where n.nspname='public' and c.relname='modeles_correction'
-- group by c.relname, c.relrowsecurity;
--  → 1 ligne, rls = true, 1 policy
-- ============================================================
