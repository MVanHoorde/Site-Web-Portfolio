-- ============================================================
--  034 — EMC : les six séances des 12 et 13/11/2026, les cartes
--        éphémères, le jeu de rôle d'accueil
--
--  BESOIN (Loïc, brief v2 du 08/11/2026)
--  Le Labyrinthe de Nina n'est qu'une partie du dispositif. Six
--  séances, trois « modules » :
--    · accueil du groupe D (jeu de rôle « Je m'appelle… »),
--      jeudi 8 h 30 – 10 h 10 ;
--    · Labyrinthe de Nina, groupes A, B, J, G (2 h chacun) ;
--    · restitution avec la 2nde 1, vendredi 14 h – 15 h 15.
--  Les élèves passent une seule fois : ils entrent par une CARTE
--  imprimée (identifiant + code à 4 chiffres), préparée par le prof,
--  et le compte disparaît après la séance.
--
--  ARBITRAGES DE LOÏC (08/11/2026)
--  · Tous les élèves entrent par une carte, y compris ceux qui ont
--    un compte sur le site : plus de création de compte par
--    l'élève, plus de porte « j'ai déjà un compte ».
--  · Le mot de passe réel est DÉRIVÉ du code : 4821 → Emc-4821
--    (la politique du projet exige 6 caractères, une majuscule,
--    un chiffre ; on ne l'assouplit pas pour tout le site).
--    10 000 combinaisons par carte : accepté, les comptes vivent
--    deux jours et ne portent rien de sensible.
--  · Le groupe accueilli à 8 h 30 (D) n'est pas le groupe A.
--
--  CE QUE FAIT CE FICHIER
--    §1  modules de séance, libellés, deux classes de plus
--    §2  les cartes éphémères (emc_cartes) et leurs fonctions
--    §3  remettre une séance à zéro (après une répétition)
--    §4  le jeu de rôle : emc_jdr, emc_binomes, le tirage
--    §5  le mur modéré : emc_mur (portrait mystère, « ce que je
--        retiens », définitions de la restitution)
--    §5b la restitution : emc_restit (ateliers écrits librement, mot),
--        emc_postits (le mur de post-it), emc_mon_groupe
--    §6  clôture : ce qui touche une personne est effacé
--    §7  droits, Realtime
--    §8  contenus initiaux (jeu de rôle, restitution)
--
--  Les comptes des cartes sont créés par la fonction Edge
--  emc-cartes (supabase/functions/emc-cartes) : un navigateur ne
--  peut pas créer 35 comptes d'affilée (limite d'Auth par adresse
--  IP, et chaque inscription remplacerait la session du prof).
--  Elle appelle emc_cartes_autoriser() AVEC le jeton du prof
--  (c'est la base qui décide), puis emc_carte_inscrire() avec la
--  clé de service.
--
--  RGPD
--  · Toujours aucun nom : identifiant de carte seulement. La
--    feuille de correspondance papier circule comme avant.
--  · Les notes de l'échange du jeu de rôle (famille, phobies…) ne
--    viennent JAMAIS en base : elles restent sur l'iPad. Ne
--    remontent que des numéros de questions, des feux (oui/non,
--    sans contenu) et une note « je me suis reconnu·e ».
--  · Le portrait mystère et « ce que je retiens » parlent d'une
--    personne : ils sont effacés à la clôture (§6).
--  · Le code de la carte est gardé en clair dans emc_cartes, lisible
--    des seuls enseignants de la classe, pour réimprimer une carte
--    perdue. Il part avec le compte.
--
--  Rejouable. N'écrase rien de ce qui a été réglé au tableau de
--  bord. Banc d'essai : _outils/tests/emc-schema.test.mjs
-- ============================================================


-- ------------------------------------------------------------
--  1. Modules de séance, libellés, deux classes de plus
--
--  module  : nina | accueil | restitution — ce que la page élève
--            et le pilotage affichent.
--  prefixe : la lettre des identifiants de cartes (a-renard-07).
--  etat    : l'état propre au module, piloté par le prof (ordre de
--            passage, binôme en cours, chrono…). Le Labyrinthe n'en
--            a pas besoin.
-- ------------------------------------------------------------
alter table public.emc_seances add column if not exists module  text  not null default 'nina';
alter table public.emc_seances add column if not exists prefixe text;
alter table public.emc_seances add column if not exists etat    jsonb not null default '{}'::jsonb;

alter table public.emc_seances drop constraint if exists emc_seances_module_connu;
alter table public.emc_seances add constraint emc_seances_module_connu
  check (module in ('nina', 'accueil', 'restitution'));
alter table public.emc_seances drop constraint if exists emc_seances_prefixe_format;
alter table public.emc_seances add constraint emc_seances_prefixe_format
  check (prefixe is null or prefixe ~ '^[a-z]$');
--  Le jeu de rôle a 9 étapes (0 à 8) : on élargit à 0-9.
alter table public.emc_seances drop constraint if exists emc_seances_etape_check;
alter table public.emc_seances add constraint emc_seances_etape_check
  check (etape between 0 and 9);

--  Les deux classes de plus. Les codes ne se dictent plus (les
--  élèves entrent par carte) : ils ne servent qu'à l'URL du pilotage.
insert into public.classes (code, libelle, annee_scolaire, espace, actif) values
  ('JDRD12', 'EMC 2nde — accueil groupe D', '2026-2027', 'emc', true),
  ('REST21', 'EMC 2nde 1 — restitution',    '2026-2027', 'emc', true)
on conflict (code) do nothing;

--  Les libellés, avec le jour et l'heure. Seulement s'ils sont
--  encore ceux d'origine (un libellé retouché à la main est gardé).
update public.classes c set libelle = v.libelle
  from (values
    ('NINA27', 'EMC 2nde — créneau 1', 'Groupe A · jeudi 12/11, 10 h 30 – 12 h 30 · Labyrinthe de Nina'),
    ('NINA48', 'EMC 2nde — créneau 2', 'Groupe B · jeudi 12/11, 14 h – 16 h · Labyrinthe de Nina'),
    ('NINA63', 'EMC 2nde — créneau 3', 'Groupe J · vendredi 13/11, 8 h 15 – 10 h 15 · Labyrinthe de Nina'),
    ('NINA91', 'EMC 2nde — créneau 4', 'Groupe G · vendredi 13/11, 10 h 35 – 12 h 35 · Labyrinthe de Nina'),
    ('JDRD12', 'EMC 2nde — accueil groupe D', 'Groupe D · jeudi 12/11, 8 h 30 – 10 h 10 · Accueil, jeu de rôle (salle 136)'),
    ('REST21', 'EMC 2nde 1 — restitution', '2nde 1 · vendredi 13/11, 14 h – 15 h 15 · Restitution')
  ) as v(code, ancien, libelle)
 where c.code = v.code and c.libelle = v.ancien;

--  Une séance par classe, avec son module et son préfixe.
insert into public.emc_seances (classe_id)
select c.id from public.classes c where c.espace = 'emc'
on conflict (classe_id) do nothing;

update public.emc_seances s set module = v.module, prefixe = coalesce(s.prefixe, v.prefixe)
  from (values ('NINA27', 'nina', 'a'), ('NINA48', 'nina', 'b'), ('NINA63', 'nina', 'j'),
               ('NINA91', 'nina', 'g'), ('JDRD12', 'accueil', 'd'), ('REST21', 'restitution', 's'))
       as v(code, module, prefixe),
       public.classes c
 where c.code = v.code and s.classe_id = c.id;

--  Les enseignants des nouvelles classes : ceux du premier créneau
--  (Loïc et Mme Castel, rattachés à la main par le §11 du 031).
insert into public.enseignants_classes (auth_id, classe_id)
select ec.auth_id, n.id
  from public.enseignants_classes ec
  join public.classes c on c.id = ec.classe_id and c.code = 'NINA27'
  cross join public.classes n
 where n.code in ('JDRD12', 'REST21')
on conflict do nothing;

--  Le module d'une séance (pour les policies du §4 et du §5).
create or replace function public.emc_module(p_classe uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select s.module from public.emc_seances s where s.classe_id = p_classe
$$;


-- ------------------------------------------------------------
--  2. Les cartes éphémères
--
--  Une carte = un compte d'authentification (adresse
--  <identifiant>@emc.local, mot de passe Emc-<code>), une fiche
--  élève inscrite dans la classe EMC, et cette ligne-ci.
--  Personne n'écrit ici depuis un navigateur.
-- ------------------------------------------------------------
create table if not exists public.emc_cartes (
  identifiant text primary key
    check (identifiant ~ '^[a-z]-[a-z]{3,12}-[0-9]{2}$'),
  classe_id   uuid not null references public.classes (id) on delete cascade,
  eleve_id    uuid not null unique references public.eleves (id) on delete cascade,
  code        text not null check (code ~ '^[0-9]{4}$'),
  cree_le     timestamptz not null default now()
);
create index if not exists emc_cartes_par_classe on public.emc_cartes (classe_id);
comment on table public.emc_cartes is
  'EMC : cartes éphémères (identifiant + code à 4 chiffres). Lisibles des seuls enseignants de la classe, pour réimprimer. Partent avec le compte.';

alter table public.emc_cartes enable row level security;
drop policy if exists emc_cartes_prof on public.emc_cartes;
create policy emc_cartes_prof on public.emc_cartes
  for select to authenticated using (classe_id in (select public.mes_classes()));

--  Appelée par la fonction Edge AVEC le jeton du prof : c'est ici,
--  et pas dans la fonction Edge, que se décide qui peut préparer
--  des cartes. Renvoie { prefixe, libelle, cartes } (cartes = déjà
--  faites pour cette classe).
create or replace function public.emc_cartes_autoriser(p_classe uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare v jsonb;
begin
  if not (select public.est_enseignant()) or p_classe not in (select public.mes_classes()) then
    raise exception 'PAS_MA_CLASSE' using errcode = '42501';
  end if;
  select jsonb_build_object('prefixe', s.prefixe, 'libelle', c.libelle,
           'cartes', (select count(*) from public.emc_cartes k where k.classe_id = c.id))
    into v
    from public.classes c
    join public.emc_seances s on s.classe_id = c.id
   where c.id = p_classe and c.espace = 'emc';
  if v is null or v ->> 'prefixe' is null then
    raise exception 'PAS_UNE_CLASSE_EMC' using errcode = '42501';
  end if;
  return v;
end;
$$;

--  Appelée par la fonction Edge avec la clé de SERVICE, une fois le
--  compte d'authentification créé : la fiche élève (pseudo =
--  identifiant ; le déclencheur de 018 l'inscrit dans
--  eleves_classes) et la carte. Renvoie l'id de l'élève.
create or replace function public.emc_carte_inscrire(p_classe uuid, p_auth uuid, p_identifiant text, p_code text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare v_eleve uuid;
begin
  if not exists (select 1 from public.classes c where c.id = p_classe and c.espace = 'emc') then
    raise exception 'PAS_UNE_CLASSE_EMC';
  end if;
  insert into public.eleves (auth_id, pseudo, classe_id)
  values (p_auth, p_identifiant, p_classe)
  returning id into v_eleve;
  insert into public.emc_cartes (identifiant, classe_id, eleve_id, code)
  values (p_identifiant, p_classe, v_eleve, p_code);
  return v_eleve;
end;
$$;

comment on function public.emc_carte_inscrire is
  'EMC : fiche élève et carte d''un compte que la fonction Edge emc-cartes vient de créer. Clé de service seulement.';

--  emc_supprimer_comptes (031) n'a pas à changer : une carte est
--  inscrite dans sa classe EMC et nulle part ailleurs, elle est
--  donc dans son périmètre ; un compte qui a une classe hors EMC
--  reste épargné. La ligne emc_cartes part avec la fiche élève.


-- ------------------------------------------------------------
--  3. Remettre une séance à zéro
--
--  Après une répétition, ou le test du 07/11 : tout le travail des
--  élèves de cette classe est effacé, la séance revient à l'étape 0
--  et se rouvre. Les COMPTES ne sont pas touchés (les cartes
--  imprimées restent valables) : les supprimer reste un geste à part.
-- ------------------------------------------------------------
create or replace function public.emc_reinitialiser(p_classe uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not (select public.est_enseignant()) or p_classe not in (select public.mes_classes()) then
    raise exception 'PAS_MA_CLASSE' using errcode = '42501';
  end if;
  if not exists (select 1 from public.classes c where c.id = p_classe and c.espace = 'emc') then
    raise exception 'PAS_UNE_CLASSE_EMC' using errcode = '42501';
  end if;
  delete from public.emc_mots         where classe_id = p_classe;
  delete from public.emc_mots_masques where classe_id = p_classe;
  delete from public.emc_notes        where classe_id = p_classe;
  delete from public.emc_carte        where classe_id = p_classe;
  delete from public.emc_votes        where classe_id = p_classe;
  delete from public.emc_enquete      where classe_id = p_classe;
  delete from public.emc_aide         where classe_id = p_classe;
  delete from public.emc_jdr          where classe_id = p_classe;
  delete from public.emc_binomes      where classe_id = p_classe;
  delete from public.emc_mur          where classe_id = p_classe;
  delete from public.emc_restit       where classe_id = p_classe;
  delete from public.emc_postits      where classe_id = p_classe;
  delete from public.emc_participants where classe_id = p_classe;
  update public.emc_seances s
     set etape = 0, situation_courante = null, situation_revelee = false,
         carte_figee = false, zones_verrouillees = '{}', cloturee_le = null,
         etat = '{}'::jsonb
   where s.classe_id = p_classe;
end;
$$;


-- ------------------------------------------------------------
--  4. Le jeu de rôle (module « accueil »)
--
--  emc_jdr : une ligne par élève.
--    origine   : sa classe de seconde (1 à 10), pour croiser les
--                binômes ;
--    questions : les numéros des questions qu'IL posera (6 à 8,
--                une par thème au moins : contrôlé sur l'iPad, les
--                thèmes se règlent au tableau de bord) ;
--    feux      : { "12": true, "22": false } — ce que SON binôme
--                peut dire de LUI devant le groupe ;
--    reconnu   : 1 à 4 (😕 🙂 😃 🤩), après sa présentation.
--  🔴 Aucune réponse aux questions ici : les notes restent sur l'iPad.
--
--  emc_binomes : le tirage, figé en base (une reconnexion retrouve
--  le même binôme). binome = numéro, symbole = l'émoji partagé.
-- ------------------------------------------------------------
create table if not exists public.emc_jdr (
  classe_id uuid not null references public.classes (id) on delete cascade,
  eleve_id  uuid not null references public.eleves (id)  on delete cascade,
  origine   int  check (origine between 1 and 10),
  questions int[] not null default '{}'
    check (cardinality(questions) <= 8 and 1 <= all (questions) and 99 >= all (questions)),
  feux      jsonb not null default '{}'::jsonb check (jsonb_typeof(feux) = 'object'),
  reconnu   int  check (reconnu between 1 and 4),
  maj_le    timestamptz not null default now(),
  primary key (classe_id, eleve_id)
);
comment on table public.emc_jdr is
  'EMC, jeu de rôle : classe d''origine, numéros des questions choisies, feux vert/rouge, « reconnu·e ». AUCUNE réponse : les notes restent sur l''iPad.';

create table if not exists public.emc_binomes (
  classe_id uuid not null references public.classes (id) on delete cascade,
  eleve_id  uuid not null references public.eleves (id)  on delete cascade,
  binome    int  not null check (binome between 1 and 99),
  symbole   text not null check (char_length(symbole) between 1 and 16),
  primary key (classe_id, eleve_id)
);
create index if not exists emc_binomes_par_binome on public.emc_binomes (classe_id, binome);
comment on table public.emc_binomes is
  'EMC, jeu de rôle : le tirage des binômes (trinôme si impair), figé pour qu''une reconnexion retrouve le même.';

drop trigger if exists emc_jdr_toucher on public.emc_jdr;
create trigger emc_jdr_toucher before insert or update on public.emc_jdr
  for each row execute function public.emc_toucher();

--  Mon numéro de binôme.
create or replace function public.emc_mon_binome(p_classe uuid)
returns int
language sql
stable
security definer
set search_path = ''
as $$
  select b.binome from public.emc_binomes b
   where b.classe_id = p_classe and b.eleve_id = (select public.eleve_courant())
$$;

--  Le tirage. p_tout = true : on refait tout ; sinon on ne place
--  que les élèves qui n'ont pas encore de binôme (les retardataires).
--
--  Croiser les classes d'origine : on range les élèves par classe
--  d'origine (classes dans un ordre tiré au sort, élèves aussi), et
--  on associe le i-ème au (i + n/2)-ème. Tant qu'aucune classe ne
--  pèse plus de la moitié du groupe, deux élèves associés viennent
--  toujours de classes différentes. Un élève sans classe d'origine
--  compte comme une classe à lui seul. Nombre impair : le dernier
--  rejoint un binôme où sa classe n'est pas, ce qui fait un trinôme.
--  Un retardataire seul rejoint de la même façon un binôme existant.
--  Renvoie le nombre d'élèves placés.
create or replace function public.emc_jdr_tirer(p_classe uuid, p_tout boolean default false)
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ids      uuid[];
  v_orig     int[];
  v_n        int;
  v_h        int;
  v_num      int;
  v_symboles text[];
  v_cible    int;
  i          int;
begin
  if not (select public.est_enseignant()) or p_classe not in (select public.mes_classes()) then
    raise exception 'PAS_MA_CLASSE' using errcode = '42501';
  end if;
  perform pg_advisory_xact_lock(hashtext('emc:binomes:' || p_classe::text));

  if p_tout then
    delete from public.emc_binomes where classe_id = p_classe;
  end if;

  select coalesce(array_agg(x.t order by x.ordre_classe, x.ordre_eleve), '{}'),
         coalesce(array_agg(x.origine order by x.ordre_classe, x.ordre_eleve), '{}')
    into v_ids, v_orig
    from (
      select p.eleve_id as t, j.origine,
             -- l'ordre de la classe d'origine : tiré au sort, le même pour
             -- tous ses élèves ; sans origine, l'élève est sa propre classe
             md5(coalesce(j.origine::text, p.eleve_id::text) || g.sel) as ordre_classe,
             random() as ordre_eleve
        from public.emc_participants p
        left join public.emc_jdr j on j.classe_id = p.classe_id and j.eleve_id = p.eleve_id
        cross join (select gen_random_uuid()::text as sel) g
       where p.classe_id = p_classe
         and not exists (select 1 from public.emc_binomes b
                          where b.classe_id = p_classe and b.eleve_id = p.eleve_id)
    ) x;

  v_n := coalesce(array_length(v_ids, 1), 0);
  if v_n = 0 then return 0; end if;

  select array(select jsonb_array_elements_text(c.valeur -> 'symboles'))
    into v_symboles
    from public.emc_contenus c where c.cle = 'jdr';
  if v_symboles is null or array_length(v_symboles, 1) is null then
    v_symboles := array['🦊', '🚀', '🌵', '🐙', '🎸', '🍕', '🦄', '🐢', '⚡', '🌈', '🎈', '🍩',
                        '🐝', '🦖', '🎲', '🌻', '🐳', '🍉', '🦉', '🎯', '🧩', '🐧', '🌮', '🪐'];
  end if;

  select coalesce(max(b.binome), 0) into v_num from public.emc_binomes b where b.classe_id = p_classe;
  v_h := v_n / 2;

  for i in 1 .. v_h loop
    v_num := v_num + 1;
    insert into public.emc_binomes (classe_id, eleve_id, binome, symbole) values
      (p_classe, v_ids[i],       v_num, v_symboles[1 + (v_num - 1) % array_length(v_symboles, 1)]),
      (p_classe, v_ids[i + v_h], v_num, v_symboles[1 + (v_num - 1) % array_length(v_symboles, 1)]);
  end loop;

  if v_n % 2 = 1 then
    --  le dernier : un binôme de deux où sa classe n'est pas, sinon
    --  n'importe quel binôme de deux, sinon (il est seul) un binôme à lui
    select b.binome into v_cible
      from public.emc_binomes b
      left join public.emc_jdr j on j.classe_id = b.classe_id and j.eleve_id = b.eleve_id
     where b.classe_id = p_classe
     group by b.binome
    having count(*) = 2
     order by bool_or(j.origine is not distinct from v_orig[v_n] and v_orig[v_n] is not null), random()
     limit 1;
    if v_cible is null then
      v_num := v_num + 1;
      v_cible := v_num;
    end if;
    insert into public.emc_binomes (classe_id, eleve_id, binome, symbole)
    values (p_classe, v_ids[v_n], v_cible,
            coalesce((select b.symbole from public.emc_binomes b where b.classe_id = p_classe and b.binome = v_cible limit 1),
                     v_symboles[1 + (v_cible - 1) % array_length(v_symboles, 1)]));
  end if;

  return v_n;
end;
$$;

--  Échanger deux élèves de binôme (le prof voit deux élèves qui se
--  connaissent trop bien).
create or replace function public.emc_jdr_echanger(p_classe uuid, p_a uuid, p_b uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  a public.emc_binomes;
  b public.emc_binomes;
begin
  if not (select public.est_enseignant()) or p_classe not in (select public.mes_classes()) then
    raise exception 'PAS_MA_CLASSE' using errcode = '42501';
  end if;
  select * into a from public.emc_binomes x where x.classe_id = p_classe and x.eleve_id = p_a;
  select * into b from public.emc_binomes x where x.classe_id = p_classe and x.eleve_id = p_b;
  if a.eleve_id is null or b.eleve_id is null then
    raise exception 'PAS_DE_BINOME';
  end if;
  update public.emc_binomes x set binome = b.binome, symbole = b.symbole
   where x.classe_id = p_classe and x.eleve_id = p_a;
  update public.emc_binomes x set binome = a.binome, symbole = a.symbole
   where x.classe_id = p_classe and x.eleve_id = p_b;
end;
$$;

alter table public.emc_jdr     enable row level security;
alter table public.emc_binomes enable row level security;

--  emc_jdr : je lis ma ligne et celles de mon binôme (il me faut
--  ses questions pour donner mes feux) ; j'écris la mienne, dans
--  une séance « accueil » ouverte.
drop policy if exists emc_jdr_lire     on public.emc_jdr;
drop policy if exists emc_jdr_ecrire   on public.emc_jdr;
drop policy if exists emc_jdr_changer  on public.emc_jdr;
drop policy if exists emc_jdr_prof     on public.emc_jdr;
create policy emc_jdr_lire on public.emc_jdr
  for select to authenticated
  using (eleve_id = (select public.eleve_courant())
         or exists (select 1 from public.emc_binomes b
                     where b.classe_id = emc_jdr.classe_id and b.eleve_id = emc_jdr.eleve_id
                       and b.binome = (select public.emc_mon_binome(emc_jdr.classe_id))));
create policy emc_jdr_ecrire on public.emc_jdr
  for insert to authenticated
  with check (eleve_id = (select public.eleve_courant())
              and (select public.emc_participe(classe_id))
              and (select public.emc_etape(classe_id)) is not null
              and (select public.emc_module(classe_id)) = 'accueil');
create policy emc_jdr_changer on public.emc_jdr
  for update to authenticated
  using (eleve_id = (select public.eleve_courant()))
  with check (eleve_id = (select public.eleve_courant())
              and (select public.emc_etape(classe_id)) is not null
              and (select public.emc_module(classe_id)) = 'accueil');
create policy emc_jdr_prof on public.emc_jdr
  for all to authenticated
  using (classe_id in (select public.mes_classes()))
  with check (classe_id in (select public.mes_classes()));

--  emc_binomes : je lis mon binôme (mes partenaires et moi) ; seul
--  le prof écrit (par les fonctions ci-dessus, ou à la main).
drop policy if exists emc_binomes_lire on public.emc_binomes;
drop policy if exists emc_binomes_prof on public.emc_binomes;
create policy emc_binomes_lire on public.emc_binomes
  for select to authenticated
  using (binome = (select public.emc_mon_binome(classe_id)));
create policy emc_binomes_prof on public.emc_binomes
  for all to authenticated
  using (classe_id in (select public.mes_classes()))
  with check (classe_id in (select public.mes_classes()));


-- ------------------------------------------------------------
--  5. Le mur modéré
--
--  Un texte court par élève et par sorte :
--    portrait   : le détail surprenant sur son binôme, pris dans
--                 une question en feu vert (jeu de rôle, étape 7) ;
--    retiens    : « ce que je retiens de mon binôme » (étape 8) ;
--    definition : « pour moi, la liberté, c'est… » (restitution).
--  Rien n'est projeté sans que le prof l'ait validé. L'élève corrige
--  son texte tant qu'il n'est pas modéré.
-- ------------------------------------------------------------
create table if not exists public.emc_mur (
  classe_id uuid not null references public.classes (id) on delete cascade,
  eleve_id  uuid not null references public.eleves (id)  on delete cascade,
  sorte     text not null check (sorte in ('portrait', 'retiens', 'definition')),
  question  int  check (question between 1 and 99),
  texte     text not null check (char_length(btrim(texte)) between 1 and 300),
  statut    text not null default 'propose' check (statut in ('propose', 'valide', 'masque')),
  maj_le    timestamptz not null default now(),
  primary key (classe_id, eleve_id, sorte)
);
comment on table public.emc_mur is
  'EMC : textes courts modérés (portrait mystère, ce que je retiens, définitions). Projetés seulement une fois validés, jamais avec un identifiant.';

drop trigger if exists emc_mur_toucher on public.emc_mur;
create trigger emc_mur_toucher before insert or update on public.emc_mur
  for each row execute function public.emc_toucher();

alter table public.emc_mur enable row level security;
drop policy if exists emc_mur_le_mien on public.emc_mur;
drop policy if exists emc_mur_ecrire  on public.emc_mur;
drop policy if exists emc_mur_changer on public.emc_mur;
drop policy if exists emc_mur_prof    on public.emc_mur;
create policy emc_mur_le_mien on public.emc_mur
  for select to authenticated using (eleve_id = (select public.eleve_courant()));
create policy emc_mur_ecrire on public.emc_mur
  for insert to authenticated
  with check (eleve_id = (select public.eleve_courant())
              and statut = 'propose'
              and (select public.emc_participe(classe_id))
              and (select public.emc_etape(classe_id)) is not null);
create policy emc_mur_changer on public.emc_mur
  for update to authenticated
  using (eleve_id = (select public.eleve_courant()) and statut = 'propose')
  with check (eleve_id = (select public.eleve_courant()) and statut = 'propose'
              and (select public.emc_etape(classe_id)) is not null);
create policy emc_mur_prof on public.emc_mur
  for all to authenticated
  using (classe_id in (select public.mes_classes()))
  with check (classe_id in (select public.mes_classes()));


-- ------------------------------------------------------------
--  5 bis. La restitution avec la 2nde 1 (module « restitution »)
--
--  Décision de Loïc (08/11) : pas de liste des ateliers des
--  collègues, chaque élève ÉCRIT les ateliers qu'il a faits ; la
--  production commune est un MUR DE POST-IT.
--
--  emc_restit : une ligne par élève.
--    parcours : [{ "atelier": "…", "mot": "…", "liberte": "…" }],
--               6 au plus ;
--    mot      : son mot pour « la liberté » (le nuage de l'étape 5 ;
--               la phrase, elle, va au mur modéré, sorte definition).
--  Les GROUPES sont posés par le prof dans emc_seances.etat
--  (affectations : { eleve_id: n }) : l'élève les lit, ne les
--  change pas.
--
--  emc_postits : le mur. Un post-it = un groupe, une sorte (fait ·
--  appris · liberte), 140 caractères. Lisible de toute la séance
--  (c'est une production commune), masquable par le prof.
-- ------------------------------------------------------------
create table if not exists public.emc_restit (
  classe_id uuid not null references public.classes (id) on delete cascade,
  eleve_id  uuid not null references public.eleves (id)  on delete cascade,
  parcours  jsonb not null default '[]'::jsonb
    check (jsonb_typeof(parcours) = 'array' and jsonb_array_length(parcours) <= 6 and char_length(parcours::text) <= 3000),
  mot       text check (char_length(btrim(mot)) between 1 and 30),
  maj_le    timestamptz not null default now(),
  primary key (classe_id, eleve_id)
);
comment on table public.emc_restit is
  'EMC, restitution : les ateliers vécus (écrits par l''élève), son mot pour la liberté.';

create table if not exists public.emc_postits (
  id        uuid primary key,
  classe_id uuid not null references public.classes (id) on delete cascade,
  eleve_id  uuid not null references public.eleves (id)  on delete cascade,
  groupe    int  not null check (groupe between 1 and 12),
  sorte     text not null check (sorte in ('fait', 'appris', 'liberte')),
  texte     text not null check (char_length(btrim(texte)) between 1 and 140),
  masque    boolean not null default false,
  cree_le   timestamptz not null default now(),
  maj_le    timestamptz not null default now()
);
create index if not exists emc_postits_par_classe on public.emc_postits (classe_id, cree_le);
comment on table public.emc_postits is
  'EMC, restitution : le mur de post-it « Nos libertés ». Production commune, masquable par l''enseignant.';

drop trigger if exists emc_restit_toucher on public.emc_restit;
create trigger emc_restit_toucher before insert or update on public.emc_restit
  for each row execute function public.emc_toucher();
drop trigger if exists emc_postits_toucher on public.emc_postits;
create trigger emc_postits_toucher before insert or update on public.emc_postits
  for each row execute function public.emc_toucher();

--  Mon groupe (posé par le prof dans l'état de la séance).
create or replace function public.emc_mon_groupe(p_classe uuid)
returns int
language sql
stable
security definer
set search_path = ''
as $$
  select nullif(s.etat -> 'affectations' ->> ((select public.eleve_courant())::text), '')::int
    from public.emc_seances s where s.classe_id = p_classe
$$;

alter table public.emc_restit  enable row level security;
alter table public.emc_postits enable row level security;

drop policy if exists emc_restit_le_mien on public.emc_restit;
drop policy if exists emc_restit_ecrire  on public.emc_restit;
drop policy if exists emc_restit_changer on public.emc_restit;
drop policy if exists emc_restit_prof    on public.emc_restit;
create policy emc_restit_le_mien on public.emc_restit
  for select to authenticated using (eleve_id = (select public.eleve_courant()));
create policy emc_restit_ecrire on public.emc_restit
  for insert to authenticated
  with check (eleve_id = (select public.eleve_courant())
              and (select public.emc_participe(classe_id))
              and (select public.emc_etape(classe_id)) is not null
              and (select public.emc_module(classe_id)) = 'restitution');
create policy emc_restit_changer on public.emc_restit
  for update to authenticated
  using (eleve_id = (select public.eleve_courant()))
  with check (eleve_id = (select public.eleve_courant())
              and (select public.emc_etape(classe_id)) is not null
              and (select public.emc_module(classe_id)) = 'restitution');
create policy emc_restit_prof on public.emc_restit
  for all to authenticated
  using (classe_id in (select public.mes_classes()))
  with check (classe_id in (select public.mes_classes()));

drop policy if exists emc_postits_lire    on public.emc_postits;
drop policy if exists emc_postits_ecrire  on public.emc_postits;
drop policy if exists emc_postits_retirer on public.emc_postits;
drop policy if exists emc_postits_prof    on public.emc_postits;
create policy emc_postits_lire on public.emc_postits
  for select to authenticated
  using ((select public.emc_participe(classe_id)) and (not masque or eleve_id = (select public.eleve_courant())));
create policy emc_postits_ecrire on public.emc_postits
  for insert to authenticated
  with check (eleve_id = (select public.eleve_courant())
              and not masque
              and (select public.emc_etape(classe_id)) = 4
              and (select public.emc_module(classe_id)) = 'restitution'
              and groupe = (select public.emc_mon_groupe(classe_id)));
create policy emc_postits_retirer on public.emc_postits
  for delete to authenticated
  using (eleve_id = (select public.eleve_courant()) and (select public.emc_etape(classe_id)) = 4);
create policy emc_postits_prof on public.emc_postits
  for all to authenticated
  using (classe_id in (select public.mes_classes()))
  with check (classe_id in (select public.mes_classes()));


-- ------------------------------------------------------------
--  6. Clôture
--
--  Comme au 031 (les demandes d'aide sont effacées, la séance se
--  fige), et en plus : ce qui parle d'une personne précise —
--  portrait mystère, « ce que je retiens » — est effacé.
-- ------------------------------------------------------------
create or replace function public.emc_cloturer(p_classe uuid)
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare v_n int;
begin
  if p_classe not in (select public.mes_classes()) then
    raise exception 'PAS_MA_CLASSE' using errcode = '42501';
  end if;
  delete from public.emc_aide a where a.classe_id = p_classe;
  get diagnostics v_n = row_count;
  delete from public.emc_mur m where m.classe_id = p_classe and m.sorte in ('portrait', 'retiens');
  update public.emc_seances s set cloturee_le = now() where s.classe_id = p_classe;
  return v_n;
end;
$$;


-- ------------------------------------------------------------
--  7. Droits, Realtime
-- ------------------------------------------------------------
revoke all on function public.emc_module(uuid)                       from public, anon, authenticated;
revoke all on function public.emc_cartes_autoriser(uuid)             from public, anon, authenticated;
revoke all on function public.emc_carte_inscrire(uuid, uuid, text, text) from public, anon, authenticated;
revoke all on function public.emc_reinitialiser(uuid)                from public, anon, authenticated;
revoke all on function public.emc_mon_binome(uuid)                   from public, anon, authenticated;
revoke all on function public.emc_jdr_tirer(uuid, boolean)           from public, anon, authenticated;
revoke all on function public.emc_jdr_echanger(uuid, uuid, uuid)     from public, anon, authenticated;
revoke all on function public.emc_cloturer(uuid)                     from public, anon, authenticated;
revoke all on function public.emc_mon_groupe(uuid)                   from public, anon, authenticated;

grant execute on function public.emc_module(uuid)                    to authenticated;
grant execute on function public.emc_cartes_autoriser(uuid)          to authenticated;
grant execute on function public.emc_carte_inscrire(uuid, uuid, text, text) to service_role;
grant execute on function public.emc_reinitialiser(uuid)             to authenticated;
grant execute on function public.emc_mon_binome(uuid)                to authenticated;
grant execute on function public.emc_jdr_tirer(uuid, boolean)        to authenticated;
grant execute on function public.emc_jdr_echanger(uuid, uuid, uuid)  to authenticated;
grant execute on function public.emc_cloturer(uuid)                  to authenticated;
grant execute on function public.emc_mon_groupe(uuid)                to authenticated;

grant update (etat) on table public.emc_seances to authenticated;

revoke all on table public.emc_cartes, public.emc_jdr, public.emc_binomes, public.emc_mur
  from anon, authenticated;
grant select on table public.emc_cartes to authenticated;
--  Les upsert de PostgREST réécrivent toutes les colonnes envoyées,
--  clé comprise (leçon du 032) : la clé est dans les droits d'update.
grant select, insert, delete on table public.emc_jdr to authenticated;
grant update (classe_id, eleve_id, origine, questions, feux, reconnu) on table public.emc_jdr to authenticated;
grant select, insert, update, delete on table public.emc_binomes to authenticated;
grant select, insert, delete on table public.emc_mur to authenticated;
--  statut n'est pas dans la liste : un élève ne valide pas son texte.
--  Le prof modère par la policy emc_mur_prof et ce droit-ci.
grant update (classe_id, eleve_id, sorte, question, texte, statut) on table public.emc_mur to authenticated;
revoke all on table public.emc_restit, public.emc_postits from anon, authenticated;
grant select, insert, delete on table public.emc_restit to authenticated;
grant update (classe_id, eleve_id, parcours, mot) on table public.emc_restit to authenticated;
grant select, insert, delete on table public.emc_postits to authenticated;
--  seul le prof masque (policy emc_postits_prof) ; l'élève n'a pas
--  de policy d'update
grant update (masque) on table public.emc_postits to authenticated;

do $$
declare t text;
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach t in array array['emc_jdr', 'emc_binomes', 'emc_mur', 'emc_restit', 'emc_postits'] loop
      if not exists (select 1 from pg_publication_tables
                      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t) then
        execute format('alter publication supabase_realtime add table public.%I', t);
      end if;
    end loop;
  end if;
end $$;


-- ------------------------------------------------------------
--  8. Contenus initiaux du jeu de rôle
--
--  « on conflict do nothing » : rejouer ce fichier n'écrase jamais
--  ce qui a été réglé au tableau de bord.
--  La fiche-guide est le document de l'équipe EMC (30 questions,
--  5 thèmes). L'exemple de Pierre Marchand est une PROPOSITION de
--  Claude, à relire par Loïc : il reprend les questions 2, 9, 15,
--  17, 22 et 27, comme celui du guide enseignant.
-- ------------------------------------------------------------
insert into public.emc_contenus (cle, valeur) values
('etapes_accueil', $j$[
  {"n":0,"titre":"Accueil et connexion","duree":15},
  {"n":1,"titre":"Les consignes","duree":10},
  {"n":2,"titre":"Trouve ton binôme","duree":5},
  {"n":3,"titre":"Choisis tes questions","duree":5},
  {"n":4,"titre":"L'échange","duree":10},
  {"n":5,"titre":"Feu vert, feu rouge","duree":5},
  {"n":6,"titre":"Les présentations","duree":35},
  {"n":7,"titre":"Portrait mystère","duree":10},
  {"n":8,"titre":"Clôture","duree":5}
]$j$::jsonb),
('jdr', $j${
  "titre": "Je m'appelle…",
  "accroche": "Tu vas faire connaissance avec quelqu'un que tu ne connais pas… puis le présenter au groupe comme si tu étais lui ou elle.",
  "consignes": [
    "Tu vas former un binôme avec un ou une élève d'une autre classe, que tu ne connais pas.",
    "Chacun choisit 6 à 8 questions dans la fiche-guide, avec au moins une question par thème. La question « Prénom, nom » est obligatoire et ne compte pas.",
    "Pendant 10 minutes, vous vous interrogez : 5 minutes chacun. Note les réponses sur ta tablette : tes notes ne quittent jamais ton iPad.",
    "Ensuite, ton binôme te dit ce que tu as le droit de raconter (feu vert) et ce qui reste entre vous (feu rouge).",
    "Enfin, tu présentes ton binôme devant le groupe, à la première personne, comme si tu étais lui ou elle : « Je m'appelle… ». Environ 1 minute.",
    "Ta présentation est un petit récit qui s'enchaîne, pas une liste de questions-réponses."
  ],
  "obligatoire": "Quel est ton prénom, ton nom ?",
  "min": 6,
  "max": 8,
  "themes": [
    {"n":1,"titre":"Identité","icone":"🪪","questions":[
      {"id":1,"texte":"Quel âge as-tu ?"},
      {"id":2,"texte":"As-tu des frères et sœurs ? Si oui, comment t'entends-tu avec eux ? Sinon, aimerais-tu en avoir ?"},
      {"id":3,"texte":"Qu'est-ce qui fait ta différence avec les autres personnes que tu connais ?"},
      {"id":4,"texte":"Où habites-tu ? Aimes-tu cette ville/ce village ? Pourquoi ?"},
      {"id":5,"texte":"Penses-tu être quelqu'un de drôle ? Si oui, quelle est ta meilleure blague ?"},
      {"id":6,"texte":"As-tu un 2e ou un 3e prénom qui fait référence à quelqu'un en particulier ? Si oui, pourquoi cette personne ?"}]},
    {"n":2,"titre":"Ceux que j'aime et ceux qui m'aiment","icone":"💞","questions":[
      {"id":7,"texte":"Quelle est la personne de ton entourage dont tu te sens le/la plus proche ? Pourquoi ?"},
      {"id":8,"texte":"As-tu une idole, un modèle dans la vie ? Qui est-ce et pourquoi ?"},
      {"id":9,"texte":"À ton avis, qu'est-ce que tes proches, tes amis apprécient chez toi ?"},
      {"id":10,"texte":"Y a-t-il une personne (vivante ou morte) que tu admires ? Pourquoi ?"},
      {"id":11,"texte":"Penses-tu être le/la meilleur(e) ami(e) de quelqu'un ? Si oui, pourquoi, à ton avis, es-tu son/sa meilleur(e) ami(e) ?"},
      {"id":12,"texte":"As-tu un animal de compagnie ? Si oui, quelle place a-t-il dans ta vie ?"}]},
    {"n":3,"titre":"Les goûts et les couleurs","icone":"🎨","questions":[
      {"id":13,"texte":"Quelle est ta couleur préférée ? Pourquoi ?"},
      {"id":14,"texte":"Quel est ton loisir préféré ? Qu'est-ce qui te plaît dans ce loisir ?"},
      {"id":15,"texte":"Quel est ton aliment préféré ? Pourquoi ?"},
      {"id":16,"texte":"Quel est l'objet auquel tu es le plus attaché ? Pourquoi ?"},
      {"id":17,"texte":"Quel est le jour de la semaine que tu préfères ? Pourquoi ?"},
      {"id":18,"texte":"Quel(le) est ton film/ta série préféré(e) ? Pourquoi ?"}]},
    {"n":4,"titre":"Le meilleur et le pire","icone":"⚖️","questions":[
      {"id":19,"texte":"Quelle est ta principale qualité ? Dans quelle situation cela se voit-il ?"},
      {"id":20,"texte":"Quel est ton principal défaut ? Dans quelle situation cela se voit-il ?"},
      {"id":21,"texte":"Te souviens-tu d'un événement particulièrement drôle que tu as vécu ? Lequel ?"},
      {"id":22,"texte":"Quelle est ta plus grande phobie ? Pourquoi cela te fait-il peur ?"},
      {"id":23,"texte":"Est-ce qu'il t'est déjà arrivé de faire une grosse gaffe/maladresse ? Que s'est-il passé ?"},
      {"id":24,"texte":"As-tu réalisé une action dont tu as été particulièrement fier/fière ? Si oui, laquelle ?"}]},
    {"n":5,"titre":"Mes rêves","icone":"🌠","questions":[
      {"id":25,"texte":"Quel métier aimerais-tu exercer plus tard ? Pourquoi ?"},
      {"id":26,"texte":"Quel âge aimerais-tu avoir ? Pourquoi ?"},
      {"id":27,"texte":"Quel est le talent que tu aimerais acquérir ? Pourquoi celui-là ?"},
      {"id":28,"texte":"Quelle voiture aimerais-tu avoir plus tard ? Pourquoi ?"},
      {"id":29,"texte":"Quel(le) est le héros/l'héroïne dans lequel/laquelle tu aimerais t'incarner ? Qu'est-ce qui te plaît chez lui/elle ?"},
      {"id":30,"texte":"Si tu pouvais réaliser ta journée idéale, en quoi consisterait-elle ? Que ferais-tu cette journée-là ?"}]}
  ],
  "exemple": {
    "titre": "Exemple : le portrait de Pierre Marchand",
    "questions": [2, 9, 15, 17, 22, 27],
    "texte": "Je m'appelle Pierre Marchand. J'ai une grande sœur, Léa : on se dispute la salle de bains tous les matins, mais c'est elle que j'appelle quand ça ne va pas. Mes amis disent qu'on peut compter sur moi… et c'est vrai que c'est toujours moi qui ai une deuxième calculatrice. Mon plat préféré, ce sont les lasagnes de ma grand-mère, surtout le coin un peu brûlé. Mon jour préféré, c'est le mercredi, parce que l'après-midi j'ai handball. Ma plus grande peur ? Les araignées : même une toute petite, je sors de la pièce. Et si je pouvais apprendre un talent d'un seul coup, ce serait le piano, pour rejouer les musiques de films que j'adore."
  },
  "echange_minutes": 10,
  "presentation_secondes": 60,
  "feux": "Ce que ton binôme t'a confié lui appartient. C'est lui ou elle qui décide ce que tu peux raconter devant le groupe : c'est son consentement. Parler à la place de quelqu'un, oui, mais seulement avec son accord.",
  "feux_consigne": "Voici les questions que ton binôme t'a posées. Pour chacune, dis s'il ou elle peut en parler devant le groupe.",
  "reconnu_question": "Je me suis reconnu·e dans ce portrait ?",
  "reconnu": [
    {"v":1,"e":"😕","l":"Pas vraiment"},
    {"v":2,"e":"🙂","l":"Un peu"},
    {"v":3,"e":"😃","l":"Oui !"},
    {"v":4,"e":"🤩","l":"Carrément moi"}
  ],
  "portrait_consigne": "Choisis un détail surprenant sur ton binôme, dans une réponse en feu vert. Écris-le à la première personne, sans prénom : la classe devra deviner de qui il s'agit.",
  "portrait_exemple": "J'ai peur des araignées, même des toutes petites.",
  "retiens_question": "Ce que je retiens de mon binôme (facultatif)",
  "origines": 10,
  "symboles": ["🦊", "🚀", "🌵", "🐙", "🎸", "🍕", "🦄", "🐢", "⚡", "🌈", "🎈", "🍩",
               "🐝", "🦖", "🎲", "🌻", "🐳", "🍉", "🦉", "🎯", "🧩", "🐧", "🌮", "🪐"]
}$j$::jsonb),
--  La restitution (séance 6, 75 min). Déroulé validé par Loïc le
--  08/11 ; ateliers écrits librement, mur de post-it. La liste des
--  libertés est une PROPOSITION de Claude, à relire.
('etapes_restitution', $j$[
  {"n":0,"titre":"Connexion et retour","duree":5},
  {"n":1,"titre":"La météo des deux jours","duree":5},
  {"n":2,"titre":"Mon parcours","duree":10},
  {"n":3,"titre":"Par atelier","duree":15},
  {"n":4,"titre":"Nos libertés : le mur","duree":25},
  {"n":5,"titre":"Ma définition","duree":10},
  {"n":6,"titre":"Clôture","duree":5}
]$j$::jsonb),
('restitution', $j${
  "titre": "Nos libertés",
  "accroche": "Pendant deux jours, vous avez été dispersés dans tous les groupes. On rassemble ce que vous avez vécu… et on cherche la liberté qui était en jeu.",
  "meteo_question": "Comment je ressors de ces deux jours ?",
  "meteo_aide": "1 ou 2 émojis",
  "parcours_consigne": "Écris les ateliers que tu as faits (un nom court, comme tu t'en souviens). Pour chacun : un mot-clé, et la liberté qui y était en jeu.",
  "parcours_max": 6,
  "libertes": ["Liberté d'expression", "Liberté de conscience et de religion", "Liberté d'aller et venir", "Respect de la vie privée", "Droit à l'image", "Liberté de réunion", "Liberté d'association", "Liberté de la presse", "Égalité, non-discrimination", "Sûreté : ne pas subir de violence", "Liberté de choisir sa vie"],
  "groupe_consigne": "Retrouve ton groupe : vous avez fait le même atelier. Préparez ensemble : ce qu'on a fait, ce qu'on a appris, quelle liberté était en jeu.",
  "postits": [
    {"sorte":"fait","titre":"Ce qu'on a fait","couleur":"#ffe58a"},
    {"sorte":"appris","titre":"Ce qu'on a appris","couleur":"#9fe2c4"},
    {"sorte":"liberte","titre":"La liberté en jeu","couleur":"#ffc2a8"}
  ],
  "mur_consigne": "Postez vos post-it dans la colonne de votre groupe : ce que vous avez fait, ce que vous avez appris, la liberté en jeu. Puis 1 minute à l'oral par groupe.",
  "presentation_secondes": 60,
  "mot_question": "La liberté, en un mot ?",
  "definition_question": "Pour moi, la liberté, c'est…",
  "merci": "Merci pour ces deux jours !"
}$j$::jsonb)
on conflict (cle) do nothing;
