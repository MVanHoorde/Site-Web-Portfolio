-- ============================================================
--  occupation-ligne.sql — UNE ligne, lue par reveil-quotidien.bat
--
--  Sortie (psql -t -A) :
--    2026-11-13 base=17Mo/500 fichiers=2Mo/1024 depots=0Mo padago=0Mo compte_max=0Mo/300 etat=OK
--
--  etat=ALERTE dès 70 % de l'un des deux quotas du plan gratuit
--  (base 500 Mo, fichiers 1 Go), ou dès qu'une autrice Padago dépasse
--  70 % de ses 300 Mo (compte_max, bdd/schema/043). Le réveil recopie la ligne dans
--  C:\Sauvegardes-SNT\occupation.log ; une ALERTE pose en plus un
--  fichier sur le Bureau, et `node verifier.mjs` la relit.
--  Quoi faire alors : bdd/outils/occupation.sql (détail et purge).
--
--  Lecture seule. Aucun caractère < > | & dans la sortie : le .bat
--  la recopie par echo.
-- ============================================================
with m as (
  select pg_database_size(current_database()) / 1048576.0 as base,
         coalesce((select sum((metadata->>'size')::bigint) from storage.objects), 0) / 1048576.0 as fichiers,
         coalesce((select sum((metadata->>'size')::bigint) from storage.objects
                   where bucket_id = 'depots'), 0) / 1048576.0 as depots,
         coalesce((select sum((metadata->>'size')::bigint) from storage.objects
                   where bucket_id = 'padago'), 0) / 1048576.0 as padago,
         coalesce((select max(t) from (select sum((metadata->>'size')::bigint) as t from storage.objects
                   where bucket_id = 'padago' group by split_part(name, '/', 1)) x), 0) / 1048576.0 as compte_max
)
select to_char(now() at time zone 'Europe/Paris', 'YYYY-MM-DD')
       || ' base='     || round(base)     || 'Mo/500'
       || ' fichiers=' || round(fichiers) || 'Mo/1024'
       || ' depots='   || round(depots)   || 'Mo'
       || ' padago='   || round(padago)   || 'Mo'
       || ' compte_max=' || round(compte_max) || 'Mo/300'
       || ' etat='     || case when base > 350 or fichiers > 700 or compte_max > 210 then 'ALERTE' else 'OK' end
from m;
