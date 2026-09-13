-- ============================================================
--  018 — Espaces du tableau de bord, et un compte dans plusieurs
--        classes
--
--  POURQUOI
--  Jusqu'ici un compte élève = une classe : eleves.auth_id est
--  unique et porte UN classe_id. Or tout élève de 2nde a déjà son
--  compte SNT, souvent dans le groupe d'un collègue. Pour le
--  suivre aussi en 2nde 1 ou en AP de physique-chimie, il lui
--  aurait fallu un deuxième, voire un troisième compte — et sur
--  un iPad où le jeton de session est commun à tout le site, son
--  travail serait parti dans le mauvais.
--  Décision de Loïc, 13/09/2026 : un compte, plusieurs classes.
--
--  CE QUE FAIT CE FICHIER
--    §1  Un ESPACE sur chaque classe : snt, es1, est, pc2, cfa
--    §2  La table  eleves_classes  — qui est dans quelle classe
--    §3  famille_de_cle() — à quel espace appartient une ligne
--    §4  Les fonctions de portée et les règles, recâblées sur
--        eleves_classes et sur l'espace — progression, absences
--        ET copies : un élève du groupe SNT d'un collègue qui
--        rejoint la 2nde 1 n'apporte pas ses copies SNT à Loïc
--    §5  mon_plafond() cherche la classe SNT de l'élève
--    §6  Côté élève : rejoindre une autre classe, lister les siennes
--    §7  Les cinq classes de Loïc hors SNT — FERMÉES à l'inscription
--    §8  Le rattachement de Loïc — EN COMMENTAIRE (voir plus bas)
--
--  CE QUE CE FICHIER NE CHANGE PAS
--  · eleves.classe_id reste, et reste obligatoire : c'est la
--    classe d'INSCRIPTION, celle du code tapé à la création du
--    compte. ma_session() la lit toujours, le tableau de bord
--    actuel aussi. Tant qu'aucun élève n'a rejoint une seconde
--    classe — impossible avant le lot 3, le client ne sait pas le
--    faire — tout ce qui lit classe_id reste juste.
--  · Les collègues : rattachés à des groupes SNT seulement, ils ne
--    voient rien de plus ni rien de moins.
--  · Le livret CFA, la file de correction SNT, le worker.
--
--  🔴 ORDRE DE LIVRAISON
--  Les classes du §7 naissent avec  actif = false  : aucun élève
--  ne peut s'y inscrire. On les ouvre quand le tableau de bord
--  (lot 2) et le client élève (lot 3) sont en ligne. Motif : un
--  élève inscrit d'abord en 2nde 1 aurait PC2S01 pour classe
--  d'inscription, et le tableau de bord actuel, qui liste les
--  élèves d'un groupe SNT par  eleves.classe_id, ne le verrait
--  pas dans son groupe SNT.
--
--  Rejouable : chaque objet est créé « if not exists » ou
--  supprimé puis recréé, les insertions sont « on conflict do
--  nothing ».
-- ============================================================


-- ------------------------------------------------------------
--  1. L'espace d'une classe
--
--  Le menu d'accueil du tableau de bord se déduit de là : un
--  enseignant voit les espaces où il a au moins une classe. Pas
--  de rôle « super-utilisateur » — Loïc voit cinq espaces parce
--  qu'il est rattaché à des classes de cinq espaces, un collègue
--  en voit un parce qu'il n'a que des groupes SNT.
--
--  Liste FERMÉE, comme le domaine de  progression  : un espace de
--  plus est un acte conscient, pas une faute de frappe.
--    snt  seconde, SNT (groupes, démo, bac à sable des collègues)
--    es1  première, enseignement scientifique
--    est  terminale, enseignement scientifique
--    pc2  seconde, physique-chimie (classe et AP)
--    cfa  livret CFA
--
--  Défaut 'snt' : toutes les classes existantes en sont, sauf les
--  deux du CFA, corrigées juste après.
-- ------------------------------------------------------------
alter table public.classes
  add column if not exists espace text not null default 'snt';

alter table public.classes
  drop constraint if exists classes_espace_connu;
alter table public.classes
  add constraint classes_espace_connu
  check (espace in ('snt', 'es1', 'est', 'pc2', 'cfa'));

update public.classes
   set espace = 'cfa'
 where code in ('CFA26A', 'MVT26A')
   and espace <> 'cfa';

comment on column public.classes.espace is
  'Famille de la classe : snt, es1, est, pc2, cfa. Commande le menu d''accueil du tableau de bord et la part de la progression qu''un enseignant peut lire.';


-- ------------------------------------------------------------
--  2. eleves_classes — qui est dans quelle classe
--
--  Une ligne par appartenance. La classe d'inscription y figure
--  comme les autres : c'est le déclencheur du §2b qui l'y met,
--  pour qu'aucun chemin d'inscription ne puisse l'oublier.
--
--  on delete restrict côté classe : même garde-fou que eleves
--  (003) — on ne supprime pas une classe qui a encore des élèves.
-- ------------------------------------------------------------
create table if not exists public.eleves_classes (
  eleve_id  uuid not null
    references public.eleves(id) on delete cascade,

  classe_id uuid not null
    references public.classes(id) on delete restrict,

  primary key (eleve_id, classe_id),

  rejoint_le timestamptz not null default now()
);

-- Requête chaude : « les élèves de cette classe ». La clé primaire
-- commence par eleve_id et ne sert pas dans ce sens-là.
create index if not exists eleves_classes_par_classe
  on public.eleves_classes (classe_id);

comment on table public.eleves_classes is
  'Appartenance des élèves aux classes. La classe d''inscription (eleves.classe_id) y figure toujours ; les autres s''ajoutent par rejoindre_autre_classe().';

alter table public.eleves_classes enable row level security;


--  2a. Reprise de l'existant : chaque élève dans sa classe
--      d'inscription.
insert into public.eleves_classes (eleve_id, classe_id, rejoint_le)
select e.id, e.classe_id, e.cree_le
from public.eleves e
on conflict do nothing;


--  2b. Le déclencheur qui tient la classe d'inscription à jour.
--
--  À l'insertion d'un élève : son appartenance naît avec lui.
--  Au changement de classe_id (un déplacement fait à la main, comme
--  le §4 du 017) : l'ancienne appartenance part, la nouvelle
--  arrive. Une appartenance SECONDAIRE à l'ancienne classe
--  n'existe pas — la clé primaire l'interdit — il n'y a donc rien
--  d'autre à préserver.
--
--  security definer : l'insertion d'un élève passe par
--  rejoindre_classe(), déjà definer, mais un déclencheur ne doit
--  pas dépendre du chemin qui l'a réveillé.
create or replace function public.tenir_classe_inscription()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' and new.classe_id is not distinct from old.classe_id then
    return new;
  end if;

  if tg_op = 'UPDATE' then
    delete from public.eleves_classes
     where eleve_id = old.id and classe_id = old.classe_id;
  end if;

  insert into public.eleves_classes (eleve_id, classe_id)
  values (new.id, new.classe_id)
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists eleves_tenir_classe on public.eleves;
create trigger eleves_tenir_classe
  after insert or update of classe_id on public.eleves
  for each row execute function public.tenir_classe_inscription();


-- ------------------------------------------------------------
--  3. famille_de_cle() — à quel espace appartient une ligne
--
--  Le problème : un élève de 2nde est dans le groupe SNT d'un
--  collègue ET en 2nde 1 chez Loïc. Le collègue doit voir sa
--  progression SNT, pas ses outils de physique-chimie ; Loïc,
--  l'inverse. Or  progression  ne porte ni classe ni espace : la
--  seule chose qui dise d'où vient une ligne, c'est sa clé.
--
--  Les clés telles que les pages les écrivent (relevé du 13/09) :
--    snt-t1, snt-m1, notes-t0-…, elem-SYS-…   SNT
--    pc-o1 … pc-o8, notes-pc-o1-…              outils de PC
--    cfa-o00 … cfa-o16                         livret CFA
--    es1-… , est-…                             ES, au branchement
--    es-t1c1-…                                 ES, clés d'étape déjà posées
--  Aucune clé SNT ne commence par pc-, cfa- ni es : vérifié sur les
--  quatre pages branchées (t0-, t1-, t2-, rep-, atelier-, releve-).
--
--  🔴 CONVENTION QUI EN DÉCOULE, à tenir dans toute page future :
--  la clé de séquence (<body data-sequence>) commence par le
--  préfixe de sa famille. Une page de PC dont la clé commencerait
--  par autre chose serait lue comme du SNT — visible des
--  collègues, invisible de l'espace PC.
--
--  Les familles, et non les espaces : es1 et est partagent 'es',
--  un élève n'étant jamais à la fois en première et en terminale.
--
--  Défaut 'snt' : tout ce qui existait avant ce fichier est du SNT
--  ou du CFA, et le CFA est reconnu par son préfixe.
-- ------------------------------------------------------------
create or replace function public.famille_de_cle(p_cle text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when p_cle ~ '^(notes-|elem-)?cfa-'     then 'cfa'
    when p_cle ~ '^(notes-|elem-)?pc-'      then 'pc'
    when p_cle ~ '^(notes-|elem-)?es(1|t)?-' then 'es'
    else 'snt'
  end
$$;

create or replace function public.famille_d_espace(p_espace text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case p_espace
    when 'es1' then 'es'
    when 'est' then 'es'
    when 'pc2' then 'pc'
    else p_espace
  end
$$;

comment on function public.famille_de_cle is
  'Famille (snt, pc, es, cfa) d''une clé de progression ou de séquence, lue sur son préfixe. Défaut snt.';


-- ------------------------------------------------------------
--  4. Les fonctions de portée, recâblées
--
--  Même construction que le 016 : security definer, stable,
--  search_path vide. Les signatures ne changent pas, les règles
--  qui les appellent non plus — sauf trois, réécrites au §4d.
-- ------------------------------------------------------------

--  4a. Cet élève est-il dans une de mes classes, quelle qu'elle soit ?
--      Ne sert plus qu'à  eleves  : voir un pseudo n'apprend rien
--      de son travail.
create or replace function public.mon_eleve(p_eleve uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.eleves_classes ap
    join public.enseignants_classes ec on ec.classe_id = ap.classe_id
    where ap.eleve_id = p_eleve
      and ec.auth_id = (select auth.uid())
  )
$$;

--  4b. Cet élève est-il dans une de mes classes DE CETTE FAMILLE ?
--      Le cœur du cloisonnement par espace.
create or replace function public.mon_eleve_pour(p_eleve uuid, p_cle text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.eleves_classes ap
    join public.enseignants_classes ec on ec.classe_id = ap.classe_id
    join public.classes c              on c.id = ap.classe_id
    where ap.eleve_id = p_eleve
      and ec.auth_id = (select auth.uid())
      and public.famille_d_espace(c.espace) = public.famille_de_cle(p_cle)
  )
$$;

comment on function public.mon_eleve_pour is
  'Vrai si cet élève est dans une de mes classes dont la famille est celle de la clé. Un collègue de SNT ne lit donc pas les outils de PC du même élève.';

--  4c. Les copies — un cas à part
--
--  🔴 Un code d'activité (SYS-R1, NUC-1a) ne porte pas de préfixe
--  de famille : famille_de_cle() ne peut rien en dire. Or le cas
--  se présente dès la rentrée : un élève du groupe SNT d'un
--  collègue rejoint la 2nde 1 de Loïc. Avec la seule appartenance
--  comme critère, ses copies SNT arriveraient dans la file « À
--  corriger » de Loïc, qui pourrait les valider.
--
--  La règle tient à ce qui ENVOIE des copies : les pages de SNT
--  et d'ES, et elles seules (relevé du 13/09 : aucun
--  data-focus-code dans les huit outils de PC, le livret CFA
--  n'écrit que dans progression). Une classe pc2 ou cfa n'ouvre
--  donc jamais l'accès aux copies. Et un élève n'étant jamais à la
--  fois en SNT et en ES, chaque copie n'a qu'une lecture possible.
--
--  Le jour où une page de PC enverra des copies, il faudra
--  préfixer ses codes et revoir ce paragraphe.
create or replace function public.mon_eleve_copies(p_eleve uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.eleves_classes ap
    join public.enseignants_classes ec on ec.classe_id = ap.classe_id
    join public.classes c              on c.id = ap.classe_id
    where ap.eleve_id = p_eleve
      and ec.auth_id = (select auth.uid())
      and c.espace in ('snt', 'es1', 'est')
  )
$$;

comment on function public.mon_eleve_copies is
  'Vrai si cet élève est dans une de mes classes qui produisent des copies (SNT, ES). Une classe de PC ou du CFA n''y donne pas accès.';

create or replace function public.ma_copie(p_copie uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.reponses_libres r
    where r.id = p_copie
      and public.mon_eleve_copies(r.eleve_id)
  )
$$;


--  4d. Les règles
--
--  eleves : lu à travers les appartenances, et non plus la seule
--  classe d'inscription.
drop policy if exists eleves_lire_prof on public.eleves;
create policy eleves_lire_prof
  on public.eleves for select to authenticated
  using ((select public.mon_eleve(eleves.id)));

--  progression : seulement la famille de mes classes.
drop policy if exists progression_lire_prof on public.progression;
create policy progression_lire_prof
  on public.progression for select to authenticated
  using ((select public.mon_eleve_pour(progression.eleve_id, progression.cle)));

--  absences : la séquence dit la famille.
drop policy if exists absences_prof on public.absences;
create policy absences_prof
  on public.absences for all to authenticated
  using      ((select public.mon_eleve_pour(absences.eleve_id, absences.sequence)))
  with check ((select public.mon_eleve_pour(absences.eleve_id, absences.sequence)));

--  reponses_libres : les classes qui produisent des copies (§4c).
drop policy if exists reponses_lire_prof on public.reponses_libres;
create policy reponses_lire_prof
  on public.reponses_libres for select to authenticated
  using ((select public.mon_eleve_copies(reponses_libres.eleve_id)));

--  eleves_classes : l'élève lit les siennes, le professeur celles
--  de ses classes. Personne n'écrit : on passe par les fonctions.
drop policy if exists eleves_classes_lire_les_miennes on public.eleves_classes;
create policy eleves_classes_lire_les_miennes
  on public.eleves_classes for select to authenticated
  using (eleve_id = (select public.eleve_courant()));

drop policy if exists eleves_classes_lire_prof on public.eleves_classes;
create policy eleves_classes_lire_prof
  on public.eleves_classes for select to authenticated
  using (classe_id in (select public.mes_classes()));


-- ------------------------------------------------------------
--  5. mon_plafond() — la classe SNT, pas la classe d'inscription
--
--  Le plafond d'avance ne vaut que pour le SNT. Lu sur la classe
--  d'inscription, il appliquerait à un élève inscrit d'abord en
--  2nde 1 le réglage — et le cahier de textes vide — de PC2S01 :
--  bloqué en SNT dès la deuxième séance.
--
--  S'il avait deux classes SNT (§6 l'interdit, mais la base peut
--  en porter par un geste manuel), la classe d'inscription passe
--  d'abord, puis la plus ancienne.
--
--  Forme de la réponse STRICTEMENT inchangée : verrou-snt.js et
--  progression.js n'ont rien à savoir.
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
      join public.eleves_classes ap on ap.eleve_id = e.id
      join public.classes c         on c.id = ap.classe_id
      where e.auth_id = (select auth.uid())
        and c.espace = 'snt'
      order by (c.id = e.classe_id) desc, ap.rejoint_le
      limit 1
    ),
    jsonb_build_object('classe', false)
  );
$$;


-- ------------------------------------------------------------
--  6. Côté élève
--
--  6a. rejoindre_autre_classe() — le second code
--
--  Pour un élève QUI A DÉJÀ un compte. Un nouveau venu passe
--  toujours par rejoindre_classe(), qui crée sa fiche.
--
--  Mêmes précautions que rejoindre_classe() : la table  classes
--  reste fermée, le code n'est jamais lisible, seulement proposé.
--  Ne renvoie que le libellé, pour que l'élève voie où il est
--  entré.
--
--  UNE SEULE CLASSE SNT par élève. Deux groupes SNT, ce seraient
--  deux plafonds d'avance et deux enseignants pour la même copie ;
--  et un élève pourrait se glisser dans un groupe plus avancé que
--  le sien. En PC en revanche, 2nde 1 et AP se cumulent : c'est le
--  cas prévu.
--
--  Rejouable : rejoindre une classe où l'on est déjà ne fait rien
--  et le dit sans échouer.
-- ------------------------------------------------------------
create or replace function public.rejoindre_autre_classe(p_code text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_eleve   uuid;
  v_classe  uuid;
  v_espace  text;
  v_libelle text;
begin
  if (select auth.uid()) is null then
    raise exception 'AUCUNE_SESSION'
      using hint = 'Aucune session : se connecter avant.';
  end if;

  select e.id into v_eleve
    from public.eleves e
   where e.auth_id = (select auth.uid());

  if v_eleve is null then
    raise exception 'PAS_ENCORE_INSCRIT'
      using hint = 'Ce compte n''a pas de classe : passer par rejoindre_classe().';
  end if;

  select c.id, c.espace, c.libelle
    into v_classe, v_espace, v_libelle
    from public.classes c
   where c.code = upper(btrim(p_code)) and c.actif = true;

  if v_classe is null then
    raise exception 'CODE_CLASSE_INCONNU'
      using hint = 'Code inexistant, ou inscriptions fermées sur cette classe.';
  end if;

  if exists (select 1 from public.eleves_classes
              where eleve_id = v_eleve and classe_id = v_classe) then
    return v_libelle;
  end if;

  if v_espace = 'snt' and exists (
       select 1
         from public.eleves_classes ap
         join public.classes c on c.id = ap.classe_id
        where ap.eleve_id = v_eleve and c.espace = 'snt') then
    raise exception 'DEJA_UNE_CLASSE_SNT'
      using hint = 'Un élève n''est que dans un groupe de SNT.';
  end if;

  insert into public.eleves_classes (eleve_id, classe_id)
  values (v_eleve, v_classe);

  return v_libelle;
end;
$$;

comment on function public.rejoindre_autre_classe is
  'Ajoute une classe à un élève déjà inscrit. Refuse un second groupe SNT. Ne révèle que le libellé de la classe rejointe.';


--  6b. mes_inscriptions() — le badge « connecté comme… »
--
--  ma_session() garde sa forme (une classe) : la changer
--  obligerait à la supprimer puis la recréer, et tout client en
--  cache se casserait. Celle-ci s'y ajoute.
create or replace function public.mes_inscriptions()
returns table (
  classe_libelle text,
  espace         text,
  inscription    boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select c.libelle, c.espace, (c.id = e.classe_id)
  from public.eleves e
  join public.eleves_classes ap on ap.eleve_id = e.id
  join public.classes c         on c.id = ap.classe_id
  where e.auth_id = (select auth.uid())
  order by (c.id = e.classe_id) desc, ap.rejoint_le
$$;


-- ------------------------------------------------------------
--  Droits d'appel — on retire tout, on accorde le nécessaire.
-- ------------------------------------------------------------
revoke all on function public.tenir_classe_inscription()         from public, anon, authenticated;
revoke all on function public.famille_de_cle(text)               from public, anon, authenticated;
revoke all on function public.famille_d_espace(text)             from public, anon, authenticated;
revoke all on function public.mon_eleve_pour(uuid, text)         from public, anon, authenticated;
revoke all on function public.mon_eleve_copies(uuid)             from public, anon, authenticated;
revoke all on function public.rejoindre_autre_classe(text)       from public, anon, authenticated;
revoke all on function public.mes_inscriptions()                 from public, anon, authenticated;

grant execute on function public.famille_de_cle(text)            to authenticated;
grant execute on function public.famille_d_espace(text)          to authenticated;
grant execute on function public.mon_eleve_pour(uuid, text)      to authenticated;
grant execute on function public.mon_eleve_copies(uuid)          to authenticated;
grant execute on function public.rejoindre_autre_classe(text)    to authenticated;
grant execute on function public.mes_inscriptions()              to authenticated;
--  tenir_classe_inscription : aucun grant, c'est un déclencheur.

revoke all on table public.eleves_classes from anon;
grant select on table public.eleves_classes to authenticated;


-- ------------------------------------------------------------
--  7. Les classes de Loïc hors SNT
--
--  Libellés sans nom d'enseignant, comme au 017 : la base ne porte
--  pas d'annuaire. L'AP ne dit rien de l'origine de ses élèves.
--
--  🔴 actif = false : voir « ORDRE DE LIVRAISON » en tête. Pour
--  ouvrir, le jour venu :
--    update public.classes set actif = true
--     where code in ('ES1R02','EST303','EST606','PC2S01','AP2S26');
--
--  avance_max = 40 : le plafond ne vaut que pour le SNT (§5), la
--  valeur est sans effet ; on la met à « tout ouvert » pour que
--  personne ne la lise un jour comme un réglage.
-- ------------------------------------------------------------
insert into public.classes (code, libelle, annee_scolaire, espace, actif, avance_max) values
  ('ES1R02', '1re 2 — enseignement scientifique',        '2026-2027', 'es1', false, 40),
  ('EST303', 'Terminale 3 — enseignement scientifique',  '2026-2027', 'est', false, 40),
  ('EST606', 'Terminale 6 — enseignement scientifique',  '2026-2027', 'est', false, 40),
  ('PC2S01', '2nde 1 — physique-chimie',                  '2026-2027', 'pc2', false, 40),
  ('AP2S26', '2nde — AP physique-chimie',                 '2026-2027', 'pc2', false, 40)
on conflict (code) do nothing;


-- ============================================================
--  8. Rattacher Loïc à ses classes hors SNT
--
--  🔴 EN COMMENTAIRE, À JOUER AVEC LE LOT 2.
--  Le tableau de bord actuel met toutes les classes rattachées
--  dans une seule liste déroulante « SNT ». Joué avant le lot 2,
--  ce bloc y ferait apparaître les deux classes du CFA, la 1re 2,
--  les terminales et la 2nde 1, mêlées aux groupes de SNT.
--
--  Le compte est retrouvé par son rattachement à SNTDEM, la
--  classe de démonstration rattachée à Loïc SEUL (017) : pas
--  d'adresse à recopier. Le bloc s'arrête et le dit si SNTDEM a
--  zéro ou plusieurs enseignants.
--
--  CFA26A et MVT26A y figurent : le livret CFA entre dans le
--  tableau de bord, dans son propre espace. Cela remplace la
--  décision RE-4 du 04/09 (« le tableau de bord est un outil de
--  SNT »).
-- ============================================================
-- do $$
-- declare
--   v_auth uuid;
--   v_n    int;
-- begin
--   select count(*), min(ec.auth_id::text)::uuid into v_n, v_auth
--     from public.enseignants_classes ec
--     join public.classes c on c.id = ec.classe_id
--    where c.code = 'SNTDEM';
--
--   if v_n <> 1 then
--     raise notice 'RATTACHEMENT ABANDONNÉ : SNTDEM a % enseignant(s), 1 attendu. Rien n''a été écrit.', v_n;
--     return;
--   end if;
--
--   insert into public.enseignants_classes (auth_id, classe_id)
--   select v_auth, c.id
--     from public.classes c
--    where c.code in ('ES1R02','EST303','EST606','PC2S01','AP2S26','CFA26A','MVT26A')
--   on conflict do nothing;
--
--   raise notice 'RATTACHEMENT FAIT : % classe(s) hors SNT pour le compte de SNTDEM.',
--     (select count(*) from public.enseignants_classes ec
--        join public.classes c on c.id = ec.classe_id
--       where ec.auth_id = v_auth and c.espace <> 'snt');
-- end $$;


-- ============================================================
--  9. Vérifications — à lire après exécution
-- ============================================================

--  9a. Chaque élève a au moins son appartenance d'inscription.
select count(*) as eleves_sans_appartenance
from public.eleves e
where not exists (select 1 from public.eleves_classes ap
                   where ap.eleve_id = e.id and ap.classe_id = e.classe_id);
--  → 0

--  9b. Les espaces.
select espace, count(*) as classes, bool_or(actif) as une_ouverte
from public.classes
group by espace
order by espace;
--  → cfa 2 · es1 1 (fermée) · est 2 (fermées) · pc2 2 (fermées) ·
--    snt 16 (14 groupes + SNTDEM + PROF26)

--  9c. Aucune règle « prof » ne dit encore  e.classe_id  en direct.
select tablename, policyname,
       case when qual like '%mon_eleve%' or qual like '%mes_classes%'
            then 'ok — cloisonnée' else '🔴 NON CLOISONNÉE' end as verdict
from pg_policies
where schemaname = 'public' and policyname like '%prof%'
order by tablename, policyname;
--  → aucune ligne 🔴

--  9d. Les fonctions definer ont toutes un search_path vide.
select p.proname, p.prosecdef as definer, coalesce(p.proconfig::text, '—') as config
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('tenir_classe_inscription', 'mon_eleve', 'mon_eleve_pour', 'mon_eleve_copies',
                    'ma_copie', 'mon_plafond', 'rejoindre_autre_classe',
                    'mes_inscriptions', 'famille_de_cle', 'famille_d_espace')
order by p.proname;
--  → config = {search_path=""} partout ; definer = true sauf les deux
--    famille_*, qui ne lisent aucune table
