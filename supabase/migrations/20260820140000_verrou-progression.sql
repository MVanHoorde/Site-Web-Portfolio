-- ============================================================
--  013-verrou-progression.sql — le plafond d'avance des élèves
--  ------------------------------------------------------------
--  CE QU'ON VEUT
--  Une classe peut ouvrir au plus `avance_max` séances (2 par
--  défaut) au-delà de la dernière séance réellement faite, toutes
--  séquences confondues. Le verrou de mérite entre séances existe
--  depuis l'origine — la séance N+1 s'ouvre quand la N est finie ;
--  il n'avait pas de plafond, et un élève rapide traversait la
--  séquence en une soirée. Les deux verrous s'additionnent.
--
--  LE CURSEUR NE SE SAISIT PAS, IL SE DÉDUIT.
--  Il vient de `seances_faites`, donc de la clôture déjà faite pour
--  le cahier de textes (décision du 31/07/2026, fichier 009 : le
--  curseur n'est jamais stocké, il se recalcule). Aucune saisie
--  nouvelle pour le professeur, et rien à retoucher le jour où il
--  recule une séance.
--
--  🔴 POURQUOI UNE FONCTION, ET PAS UNE POLICY
--  `seances_faites` porte `note`, `travail_donne` et `non_termine`
--  — le cahier de textes dicté en fin d'heure. Une policy `select`
--  pour les élèves le leur donnerait à lire. On n'en ajoute donc
--  AUCUNE : la table reste fermée, et le navigateur de l'élève
--  n'obtient que ce que `mon_plafond()` veut bien lui rendre, à
--  savoir des couples (séquence, séance) et deux réglages. Pas une
--  date de séance, pas une note, pas un travail donné.
--
--  CE QUE CE FICHIER NE FAIT PAS
--   · il ne ferme rien tout seul. Tant que le navigateur ne charge
--     pas `verrou-snt.js`, la base peut bien répondre, personne ne
--     l'écoute ;
--   · il ne crée aucune table ;
--   · il n'ouvre aucune ligne de plus à l'élève.
--
--  REJOUABLE : `add column if not exists`, `create or replace`.
-- ============================================================


-- ------------------------------------------------------------
--  1. Deux réglages, sur la classe
--
--  Ils vivent sur `classes` et non sur l'élève : le plafond est un
--  fait de groupe, pas un fait de personne. Rien de nominatif
--  n'entre ici, et il n'y a donc rien de nouveau à déclarer côté
--  RGPD.
-- ------------------------------------------------------------
alter table public.classes
  add column if not exists avance_max integer not null default 2;

alter table public.classes
  add column if not exists ouvert_jusqu_au date;

--  Borne haute à 40 : c'est plus de séances que n'en compte le
--  programme de l'année, donc « tout ouvert » en pratique, tout en
--  gardant une valeur finie — un `null` aurait voulu dire deux
--  choses à la fois (« pas de plafond » et « pas encore réglé »).
--  Borne basse à 0 : rien au-delà de ce qui est fait, ce qui est un
--  réglage légitime en début d'année.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'classes_avance_max_bornee'
  ) then
    alter table public.classes
      add constraint classes_avance_max_bornee
      check (avance_max between 0 and 40);
  end if;
end $$;

comment on column public.classes.avance_max is
  'Nombre de séances qu''une classe peut ouvrir au-delà de la dernière séance faite. 0 = rien au-delà, 40 = tout ouvert.';
comment on column public.classes.ouvert_jusqu_au is
  'Soupape : tant que cette date n''est pas passée, le plafond est levé (vacances, révisions). NULL = plafond actif.';


-- ------------------------------------------------------------
--  2. mon_plafond() — ce que l'élève a le droit de savoir
--
--  Renvoie un seul objet JSON, et rien d'autre :
--    { "classe": false }                          → pas de classe
--    { "classe": true, "avance_max": 2,
--      "plafond_leve": false,
--      "ouvert_jusqu_au": null,
--      "faites": [ {"sequence":"snt-t1","seance":"s2"}, … ] }
--
--  L'ordre des séances n'est PAS calculé ici : il est déjà connu du
--  navigateur par `assets/js/seances-snt.js`, lui-même généré depuis
--  les pages. Le calculer une seconde fois en SQL, ce serait deux
--  vérités pour une seule question — et c'est l'élève qui verrait la
--  différence le jour où elles divergent.
--
--  `security definer` + `set search_path = ''` : même discipline que
--  les fonctions du fichier 006. La fonction s'exécute avec les
--  droits de son propriétaire, donc au-dessus de la RLS ; le
--  `search_path` vide interdit qu'on lui glisse une table homonyme
--  sous les pieds, ce qui est LE piège classique de ces fonctions.
--  Tous les noms sont donc écrits en entier, `public.` compris.
--
--  La date se lit à l'heure de Paris, pas en UTC : entre minuit et
--  2 h en été, `current_date` est déjà au lendemain côté serveur, et
--  la soupape se refermerait un jour trop tôt.
-- ------------------------------------------------------------
create or replace function public.mon_plafond()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (
      select jsonb_build_object(
        'classe',          true,
        'avance_max',      c.avance_max,
        'ouvert_jusqu_au', c.ouvert_jusqu_au,
        'plafond_leve',    (c.ouvert_jusqu_au is not null
                            and c.ouvert_jusqu_au >= (now() at time zone 'Europe/Paris')::date),
        'faites',          coalesce((
                             select jsonb_agg(
                                      jsonb_build_object('sequence', sf.sequence, 'seance', sf.seance)
                                      order by sf.sequence, sf.seance)
                             from public.seances_faites sf
                             where sf.classe_id = c.id
                           ), '[]'::jsonb)
      )
      from public.eleves e
      join public.classes c on c.id = e.classe_id
      where e.auth_id = (select auth.uid())
    ),
    jsonb_build_object('classe', false)
  );
$$;

comment on function public.mon_plafond is
  'Plafond d''avance de la classe de la session courante. Ne rend que (sequence, seance) et deux réglages : jamais une note, jamais une date de séance.';


-- ------------------------------------------------------------
--  3. Qui a le droit d'appeler
--
--  `authenticated` seulement. Un visiteur sans compte n'a pas de
--  classe : la fonction lui répondrait `{"classe": false}`, ce qui
--  est déjà la réponse que le navigateur se donne tout seul quand
--  il n'a pas de session. Autant ne pas ouvrir l'appel.
-- ------------------------------------------------------------
revoke all on function public.mon_plafond() from public, anon, authenticated;
grant execute on function public.mon_plafond() to authenticated;


-- ------------------------------------------------------------
--  4. Vérification — à lancer juste après
-- ------------------------------------------------------------

--  a) les deux colonnes sont là, avec leur défaut
select column_name, data_type, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'classes'
  and column_name in ('avance_max', 'ouvert_jusqu_au')
order by column_name;

--  b) la fonction existe, en security definer, search_path vide
select p.proname,
       p.prosecdef                       as security_definer,
       coalesce(p.proconfig::text, '—')  as config
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname = 'mon_plafond';

--  c) aucune policy n'a été ajoutée sur seances_faites : il doit
--     rester la seule, celle du professeur (fichier 009)
select policyname, cmd, roles
from pg_policies
where schemaname = 'public' and tablename = 'seances_faites'
order by policyname;

--  d) les droits d'appel : authenticated seulement
select grantee, privilege_type
from information_schema.role_routine_grants
where routine_schema = 'public' and routine_name = 'mon_plafond'
order by grantee;
