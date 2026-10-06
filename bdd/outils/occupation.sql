-- ============================================================
--  occupation.sql — où passe la place, et comment en refaire
--
--  À lancer quand l'alerte se lève (fichier ALERTE-QUOTA-SUPABASE
--  sur le Bureau, ou point de vigilance de `node verifier.mjs`),
--  et avant la purge de fin d'année :
--
--    supabase db query --linked -f bdd/outils/occupation.sql -o table
--
--  Lecture seule : ce fichier ne modifie rien.
--
--  QUOTAS DU PLAN GRATUIT (à vérifier dans le tableau de bord,
--  Organization → Usage, s'ils ont changé) :
--    · base de données   500 Mo — partagée par TOUT : réponses,
--      progression, classes, Boîte à cartes, et les collègues ;
--    · fichiers          1 Go   — photos « depots » et « leitner ».
--  L'alerte se lève à 70 % (occupation-ligne.sql).
-- ============================================================

-- Une seule requête, trois rubriques : la ligne de commande Supabase
-- n'affiche que le DERNIER tableau d'un fichier.
--   1 total · 2 plus grosses tables · 3 fichiers par stockage et séquence
--   (chemin des photos déposées : <compte>/<séquence>/<code>.jpg)
with total as (
  select 1 as r, 'base de données (quota 500 Mo)' as quoi,
         pg_database_size(current_database()) as octets
  union all
  select 1, 'fichiers, tous stockages (quota 1 Go)',
         coalesce(sum((metadata->>'size')::bigint), 0)
  from storage.objects
), tables_ as (
  select 2 as r, 'table ' || c.relname as quoi, pg_total_relation_size(c.oid) as octets
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'r'
  order by 3 desc limit 8
), fichiers as (
  select 3 as r, groupe || ' (' || count(*) || ' fichiers)' as quoi,
         sum(taille) as octets
  from (select bucket_id || case when bucket_id = 'depots'
                                 then ' / ' || split_part(name, '/', 2) else '' end as groupe,
               (metadata->>'size')::bigint as taille
        from storage.objects) o
  group by groupe
)
select r as rubrique, quoi, pg_size_pretty(octets) as taille
from (select * from total union all select * from tables_ union all select * from fichiers) t
order by r, octets desc;


-- ============================================================
--  FAIRE DE LA PLACE
--
--  🔴 Une photo ne s'efface PAS en SQL : Supabase l'interdit
--  (déclencheur storage.protect_delete — effacer la ligne laisserait
--  le fichier orphelin). Deux voies :
--
--  A. Tableau de bord → Storage → « depots » : cocher des dossiers,
--     Delete. Le plus simple pour quelques comptes.
--
--  B. En ligne de commande, depuis la racine du dépôt :
--
--     · purge de FIN D'ANNÉE (tout le stockage des dépôts) :
--         supabase storage rm -r ss:///depots --linked --experimental
--
--     · purge d'UNE séquence (ici t0) — lister les chemins, puis
--       les passer à la commande :
--         supabase db query --linked "select 'ss:///depots/' || name
--           from storage.objects where bucket_id = 'depots'
--           and split_part(name, '/', 2) = 'snt-t0'"
--         supabase storage rm ss:///depots/<chemin> ... --linked --experimental
--
--  Ce qu'une purge efface : les photos, et rien d'autre. Les
--  réponses, la progression et les étapes validées restent ; l'élève
--  qui revient voit « dépose ta photo » à la place de la sienne.
--
--  🔴 Avant une purge de fin d'année : prévenir les collègues (leurs
--  élèves d'ES ont aussi des dépôts), et rappeler aux élèves que la
--  fiche de séance PDF garde leurs photos.
--
--  Les photos ne sont PAS dans la sauvegarde hebdomadaire
--  (pg_dump --schema=public) : elles vivent dans le stockage.
--  Purger est donc définitif.
-- ============================================================
