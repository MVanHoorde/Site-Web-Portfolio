-- ============================================================
--  025 — Les photos déposées dans les séquences : stockage privé
--        « depots »
--
--  BESOIN (Loïc, 06/10/2026, signalé en classe)
--  Les photos et copies d'écran que les élèves déposent (t0 :
--  3 dépôts et 10 fiches d'élément ; t1 : 6 dépôts ; ES 1re son et
--  musique : 2) n'étaient envoyées nulle part. Elles disparaissaient
--  au rechargement, et l'élève refaisait son travail en boucle.
--
--  ARBITRAGES DE LOÏC
--  · Un STOCKAGE DE FICHIERS, pas la table progression : une photo
--    dans une ligne JSON serait relue et réécrite à chaque sauvegarde
--    de la séquence, et pèserait sur le quota de la base (500 Mo,
--    partagé avec tout le reste) au lieu de celui des fichiers (1 Go).
--  · L'enseignant de la classe VOIT les photos de ses élèves.
--
--  CHEMIN IMPOSÉ :  <auth uid>/<séquence>/<code>.jpg
--    ex.  3f2…c9/snt-t0/SYS-D2.jpg
--  · le premier dossier EST le propriétaire (comme « leitner », 022) ;
--  · le deuxième est la séquence de la page (body[data-sequence]) :
--    sa famille (famille_de_cle, 018) ouvre la lecture au seul
--    enseignant de cette famille. Une collègue d'ES qui a le même
--    élève ne voit pas ses photos de SNT — le cloisonnement de la
--    progression (018), reconduit.
--
--  PLAFONDS : 600 Ko par fichier (le navigateur envoie du 1000 px
--  JPEG, 100 à 250 Ko), JPEG seulement, 60 fichiers par compte (il y
--  a 21 emplacements de dépôt au 06/10/2026). Un nouveau dépôt au
--  même emplacement REMPLACE l'ancien (upsert) : rien ne s'accumule.
--
--  🔴 QUOTA — à surveiller : bdd/outils/occupation.sql. Une purge se
--  fait par séquence ou en fin d'année (même fichier, §3) ; elle
--  n'efface QUE des photos, jamais une réponse ni une progression.
--
--  RGPD : une photo de matériel, rattachée à un compte pseudonyme.
--  La page rappelle « on photographie du matériel, pas des gens ».
--  Effacée par l'élève (« Recommencer la séance »), par la purge, ou
--  avec le compte (le dossier porte l'uid : voir occupation.sql §3).
--
--  Purement additif : un bucket, trois fonctions préfixées depots_,
--  quatre policies sur storage.objects. Rejouable.
-- ============================================================


-- ------------------------------------------------------------
--  1. Le stockage
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('depots', 'depots', false, 614400, array['image/jpeg'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;


-- ------------------------------------------------------------
--  2. Fonctions
-- ------------------------------------------------------------

--  Le propriétaire d'un chemin, sans jamais lever d'erreur : un chemin
--  qui n'a pas exactement la forme <uuid>/<séquence>/<code>.jpg vaut
--  NULL, donc « non » partout.
create or replace function public.depots_proprietaire(p_nom text)
returns uuid
language plpgsql
immutable
set search_path = ''
as $$
begin
  if p_nom !~ '^[0-9a-f-]{36}/[a-z0-9-]{1,40}/[A-Za-z0-9_-]{1,60}\.jpg$' then
    return null;
  end if;
  return split_part(p_nom, '/', 1)::uuid;
exception when others then
  return null;
end;
$$;

comment on function public.depots_proprietaire is
  'Compte propriétaire d''une photo déposée (premier dossier du chemin), NULL si le chemin est mal formé.';

--  L'enseignant connecté a-t-il le propriétaire de ce chemin parmi ses
--  élèves, dans la famille de la séquence (deuxième dossier) ?
create or replace function public.depots_mon_eleve(p_nom text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.eleves e
    where e.auth_id = public.depots_proprietaire(p_nom)
      and public.mon_eleve_pour(e.id, split_part(p_nom, '/', 2))
  )
$$;

comment on function public.depots_mon_eleve is
  'Vrai si la photo appartient à un élève de mes classes de la famille de sa séquence (cloisonnement du 018).';

--  Combien de photos dans MON dossier. Sans paramètre : un compte ne
--  peut pas compter le dossier d'un autre.
create or replace function public.depots_nb()
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::integer
  from storage.objects
  where bucket_id = 'depots'
    and name like (select auth.uid())::text || '/%'
$$;


-- ------------------------------------------------------------
--  3. Règles d'accès
--
--  L'upsert du client (x-upsert) demande INSERT, SELECT et UPDATE.
--  Pas de règle pour anon : sans compte, rien n'entre ni ne sort.
-- ------------------------------------------------------------
drop policy if exists depots_lire on storage.objects;
create policy depots_lire on storage.objects
  for select to authenticated
  using (bucket_id = 'depots'
         and (public.depots_proprietaire(name) = (select auth.uid())
              or public.depots_mon_eleve(name)));

drop policy if exists depots_deposer on storage.objects;
create policy depots_deposer on storage.objects
  for insert to authenticated
  with check (bucket_id = 'depots'
              and public.depots_proprietaire(name) = (select auth.uid())
              and public.depots_nb() < 60);

drop policy if exists depots_remplacer on storage.objects;
create policy depots_remplacer on storage.objects
  for update to authenticated
  using (bucket_id = 'depots'
         and public.depots_proprietaire(name) = (select auth.uid()))
  with check (bucket_id = 'depots'
              and public.depots_proprietaire(name) = (select auth.uid()));

drop policy if exists depots_supprimer on storage.objects;
create policy depots_supprimer on storage.objects
  for delete to authenticated
  using (bucket_id = 'depots'
         and public.depots_proprietaire(name) = (select auth.uid()));


-- ------------------------------------------------------------
--  4. Droits d'appel des fonctions
-- ------------------------------------------------------------
revoke all on function public.depots_proprietaire(text) from public, anon;
revoke all on function public.depots_mon_eleve(text)    from public, anon;
revoke all on function public.depots_nb()               from public, anon;

grant execute on function public.depots_proprietaire(text) to authenticated;
grant execute on function public.depots_mon_eleve(text)    to authenticated;
grant execute on function public.depots_nb()               to authenticated;
