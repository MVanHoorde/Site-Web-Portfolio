-- ============================================================
--  043 — Padago : les fichiers déposés par les autrices
--
--  BESOIN (collègue autrice, relayé par Loïc le 13/11/2026)
--  Déposer dans un pad, depuis son ordinateur, ses propres
--  documents : PDF, Word, Excel, PowerPoint, photos. Les élèves les
--  ouvrent ou les téléchargent. Jusqu'ici Padago n'acceptait que
--  des liens (décision du 31/10, remplacée ce jour).
--
--  ARBITRAGES DE LOÏC (13/11/2026)
--  · 10 Mo par fichier, 300 Mo par compte d'autrice ;
--  · les VIDÉOS NE S'HÉBERGENT PAS ICI : lien OneDrive, YouTube ou
--    autre plateforme. Une vidéo vue par quatre classes épuiserait
--    à elle seule les 5 Go de téléchargement mensuels de l'offre
--    gratuite — et c'est tout le site qui serait bridé (SNT, ES,
--    Leitner, EMC). Le changement d'échelle se fera avec
--    l'établissement ;
--  · seules les autrices déposent. L'élève n'envoie toujours RIEN :
--    ses dépôts restent sur sa tablette (030, inchangé).
--
--  LECTURE PUBLIQUE, ET POURQUOI
--  Les élèves n'ont pas de compte : le fichier doit s'ouvrir par
--  son adresse seule. Le stockage est donc « public » au sens de
--  Supabase — lisible par qui connaît l'adresse exacte, mais SANS
--  annuaire : un anonyme ne peut pas lister les fichiers. L'adresse
--  porte deux identifiants aléatoires (compte, pad) et un tirage de
--  8 caractères. 🔴 Conséquence à dire aux autrices : aucun document
--  portant des noms d'élèves ou des notes.
--
--  CHEMIN IMPOSÉ :  <auth uid>/<id du pad>/<tirage>-<nom>.<ext>
--    ex.  3f2…c9/7a1…e4/k3m9q2xa-fiche-ondes.pdf
--  · le premier dossier EST la propriétaire (comme 022 et 025) ;
--  · le deuxième est un pad À ELLE (padago_pads, 030) : on ne dépose
--    pas dans le dossier d'un pad qui n'existe pas ;
--  · le nom est réduit par l'éditeur à [a-z0-9._-].
--
--  PLAFONDS
--  · 10 Mo par fichier : imposé par le stockage lui-même ;
--  · 300 Mo par compte : vérifié AVANT chaque envoi sur ce qui est
--    déjà déposé (la taille du fichier entrant n'est pas connue à ce
--    moment-là) ; le dépassement possible est donc d'un fichier,
--    10 Mo au plus. L'éditeur, lui, refuse dès que l'envoi ferait
--    passer la jauge au-delà ;
--  · formats : bureautique (Microsoft et LibreOffice), PDF, images,
--    son. Ni vidéo, ni HTML, ni SVG (qui peuvent porter du script).
--
--  QUOTA DU PROJET : ces fichiers comptent dans le 1 Go du plan
--  gratuit, avec les photos « depots » (025) et « leitner » (022).
--  Surveillance : bdd/outils/occupation-ligne.sql (alerte à 70 %) et
--  occupation.sql (détail par compte, fichiers orphelins).
--
--  Purement additif : un bucket, trois fonctions préfixées
--  padago_fichier/padago_occupation, trois policies sur
--  storage.objects. Ne touche ni au 030 ni aux autres stockages.
--  Rejouable.
-- ============================================================


-- ------------------------------------------------------------
--  1. Le stockage
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('padago', 'padago', true, 10485760, array[
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.oasis.opendocument.presentation',
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'audio/mpeg', 'audio/mp4'
])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;


-- ------------------------------------------------------------
--  2. Fonctions
-- ------------------------------------------------------------

--  La propriétaire d'un chemin, sans jamais lever d'erreur : un
--  chemin qui n'a pas exactement la forme <uuid>/<uuid>/<nom> vaut
--  NULL, donc « non » partout.
create or replace function public.padago_fichier_proprietaire(p_nom text)
returns uuid
language plpgsql
immutable
set search_path = ''
as $$
begin
  if p_nom !~ '^[0-9a-f-]{36}/[0-9a-f-]{36}/[a-z0-9][a-z0-9._-]{0,119}$' then
    return null;
  end if;
  return split_part(p_nom, '/', 1)::uuid;
exception when others then
  return null;
end;
$$;

comment on function public.padago_fichier_proprietaire is
  'Compte propriétaire d''un fichier Padago (premier dossier), NULL si le chemin est mal formé.';

--  Le dépôt est-il permis ? Le chemin est bien formé, il est dans MON
--  dossier, le pad du deuxième dossier est à MOI, je suis autrice, et
--  mon dossier n'a pas atteint 300 Mo.
create or replace function public.padago_fichier_permis(p_nom text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_pad uuid;
begin
  if v_uid is null or public.padago_fichier_proprietaire(p_nom) is distinct from v_uid then
    return false;
  end if;
  if not public.padago_suis_auteur() then
    return false;
  end if;
  v_pad := split_part(p_nom, '/', 2)::uuid;
  if not exists (select 1 from public.padago_pads p where p.id = v_pad and p.auteur = v_uid) then
    return false;
  end if;
  return coalesce((select sum((o.metadata->>'size')::bigint)
                     from storage.objects o
                    where o.bucket_id = 'padago'
                      and o.name like v_uid::text || '/%'), 0) < 314572800;
exception when others then
  return false;
end;
$$;

comment on function public.padago_fichier_permis is
  'Vrai si la session peut déposer ce fichier Padago : son dossier, son pad, autrice, moins de 300 Mo déjà déposés.';

--  Ma jauge : total déposé, plafonds, et le détail par pad. Sans
--  paramètre : on ne lit que SON dossier.
create or replace function public.padago_occupation()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with f as (
    select split_part(o.name, '/', 2) as pad,
           coalesce((o.metadata->>'size')::bigint, 0) as taille
      from storage.objects o
     where o.bucket_id = 'padago'
       and o.name like (select auth.uid())::text || '/%'
  )
  select jsonb_build_object(
    'total',       coalesce((select sum(taille) from f), 0),
    'nb',          (select count(*) from f),
    'plafond',     314572800,
    'fichier_max', 10485760,
    'pads',        coalesce((select jsonb_object_agg(pad, t)
                               from (select pad, sum(taille) as t from f group by pad) x), '{}'::jsonb)
  )
$$;

comment on function public.padago_occupation is
  'Jauge Padago de la session : octets déposés, nombre de fichiers, plafonds, détail par pad.';


-- ------------------------------------------------------------
--  3. Règles d'accès
--
--  La lecture des élèves passe par l'adresse publique, qui ne
--  consulte pas ces règles. Celles-ci gouvernent l'API (lister,
--  déposer, copier, effacer) :
--  · lire / lister : les autrices — la copie d'un pad entre
--    collègues recopie ses fichiers côté serveur, ce qui demande de
--    lire la source ; un anonyme ne liste rien ;
--  · déposer : padago_fichier_permis ;
--  · remplacer : personne (chaque dépôt a un nom neuf) ;
--  · effacer : la propriétaire.
-- ------------------------------------------------------------
drop policy if exists padago_fichiers_lire on storage.objects;
create policy padago_fichiers_lire on storage.objects
  for select to authenticated
  using (bucket_id = 'padago' and (select public.padago_suis_auteur()));

drop policy if exists padago_fichiers_deposer on storage.objects;
create policy padago_fichiers_deposer on storage.objects
  for insert to authenticated
  with check (bucket_id = 'padago' and public.padago_fichier_permis(name));

drop policy if exists padago_fichiers_effacer on storage.objects;
create policy padago_fichiers_effacer on storage.objects
  for delete to authenticated
  using (bucket_id = 'padago'
         and public.padago_fichier_proprietaire(name) = (select auth.uid()));


-- ------------------------------------------------------------
--  4. Droits d'appel des fonctions
-- ------------------------------------------------------------
revoke all on function public.padago_fichier_proprietaire(text) from public, anon;
revoke all on function public.padago_fichier_permis(text)       from public, anon;
revoke all on function public.padago_occupation()               from public, anon;

grant execute on function public.padago_fichier_proprietaire(text) to authenticated;
grant execute on function public.padago_fichier_permis(text)       to authenticated;
grant execute on function public.padago_occupation()               to authenticated;


-- ------------------------------------------------------------
--  5. Vérifications — à lire après « Run » : cinq lignes « ok »
-- ------------------------------------------------------------
select 'stockage padago public, 10 Mo, sans vidéo' as controle,
       exists (select 1 from storage.buckets
                where id = 'padago' and public and file_size_limit = 10485760
                  and not ('video/mp4' = any (allowed_mime_types))) as ok
union all
select 'trois policies padago sur storage.objects',
       (select count(*) from pg_policies
         where schemaname = 'storage' and tablename = 'objects'
           and policyname like 'padago\_fichiers\_%') = 3
union all
select 'aucune policy de remplacement (pas d''upsert)',
       not exists (select 1 from pg_policies
                    where schemaname = 'storage' and tablename = 'objects'
                      and policyname like 'padago%' and cmd = 'UPDATE')
union all
select 'jauge fermée aux visiteurs sans compte',
       not has_function_privilege('anon', 'public.padago_occupation()', 'execute')
union all
select 'chemin mal formé refusé',
       public.padago_fichier_proprietaire('../x/y.pdf') is null;
