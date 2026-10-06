-- ============================================================
--  occupation-ligne.sql — UNE ligne, lue par reveil-quotidien.bat
--
--  Sortie (psql -t -A) :
--    2026-10-06 base=17Mo/500 fichiers=2Mo/1024 depots=0Mo etat=OK
--
--  etat=ALERTE dès 70 % de l'un des deux quotas du plan gratuit
--  (base 500 Mo, fichiers 1 Go). Le réveil recopie la ligne dans
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
                   where bucket_id = 'depots'), 0) / 1048576.0 as depots
)
select to_char(now() at time zone 'Europe/Paris', 'YYYY-MM-DD')
       || ' base='     || round(base)     || 'Mo/500'
       || ' fichiers=' || round(fichiers) || 'Mo/1024'
       || ' depots='   || round(depots)   || 'Mo'
       || ' etat='     || case when base > 350 or fichiers > 700 then 'ALERTE' else 'OK' end
from m;
