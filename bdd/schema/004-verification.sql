-- ============================================================
--  004 — Vérification (ne crée rien, ne modifie rien)
--  À exécuter après 003 pour contrôler que tout est en place.
-- ============================================================

-- Les six tables sont-elles là, et fermées par RLS ?
select
  c.relname                            as table_,
  c.relrowsecurity                     as rls_active,
  (select count(*) from pg_policies p
    where p.schemaname = 'public' and p.tablename = c.relname) as nb_regles
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
order by c.relname;

-- Attendu : 6 lignes, rls_active = true, nb_regles = 0 partout.
-- nb_regles = 0 signifie « fermé à tout le monde ». C'est l'état
-- correct AVANT le jalon 5.
