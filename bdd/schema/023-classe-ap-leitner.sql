-- ============================================================
--  023 — Le groupe d'AP « Boîte à cartes » (Leitner)
--
--  Un groupe d'accompagnement personnalisé de Loïc, hors de ses
--  classes habituelles, qui travaille sur l'application Leitner.
--  Aucune structure : une ligne dans  classes,  une ligne de
--  rattachement. Comme le 020, il s'exécute dans l'éditeur SQL
--  (ou  supabase db query --linked -f  ce fichier).
--
--  Espace  pc2  : la famille physique-chimie. Le code sert aux élèves
--  qui créent leur compte ; un élève qui a DÉJÀ un compte (SNT, autre
--  classe) l'ajoute depuis « Mon compte » de l'application, par
--  rejoindre_autre_classe() (018).
--
--  Rattachement retrouvé comme au 019 : par la classe pilote SNTDEM,
--  qui n'a qu'un enseignant, Loïc. S'arrête AVANT d'écrire quoi que ce
--  soit si ce n'est pas le cas.
--
--  Rejouable : le code existe déjà → rien n'est recréé.
-- ============================================================

do $$
declare
  v_auth uuid;
  v_n    int;
begin
  select count(*), min(ec.auth_id::text)::uuid into v_n, v_auth
    from public.enseignants_classes ec
    join public.classes c on c.id = ec.classe_id
   where c.code = 'SNTDEM';
  if v_n <> 1 then
    raise exception 'ABANDON : SNTDEM a % enseignant(s), 1 attendu. Rien n''a été écrit.', v_n;
  end if;

  insert into public.classes (code, libelle, annee_scolaire, espace, actif, avance_max)
  values ('APLEIT', 'AP — Boîte à cartes (Leitner)', '2026-2027', 'pc2', true, 40)
  on conflict (code) do nothing;

  insert into public.enseignants_classes (auth_id, classe_id)
  select v_auth, c.id from public.classes c where c.code = 'APLEIT'
  on conflict do nothing;

  raise notice 'GROUPE PRÊT : APLEIT, rattaché au compte de SNTDEM.';
end $$;

-- Vérification
select c.code, c.libelle, c.espace, c.actif, e.libelle as enseignant
from public.classes c
left join public.enseignants_classes ec on ec.classe_id = c.id
left join public.enseignants e on e.auth_id = ec.auth_id
where c.code = 'APLEIT';
