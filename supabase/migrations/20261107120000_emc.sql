-- ============================================================
--  031 — EMC seconde : la séance pilotée autour du
--        « Labyrinthe de Nina »
--
--  BESOIN (Loïc, 07/11/2026 — séances des 12 et 13/11/2026)
--  Quatre créneaux de 2 h, 30 à 40 élèves de seconde, co-animés
--  par Loïc et Mme Castel. Une page élève (emc/index.html), un
--  pilotage (prof/emc.html), une projection, un éditeur de
--  contenus. Architecture : _suivi/AUDIT-EMC.md.
--
--  ARBITRAGES DE LOÏC
--  · Identifiants seulement : AUCUN nom réel en base, même dans
--    « J'ai besoin d'en parler ». La correspondance identifiant →
--    nom passe par une feuille papier en classe.
--  · Pas d'invité : l'élève sans compte en crée un (creerCompte,
--    avec le code EMC). Ces comptes-là sont supprimés après la
--    séance — emc_supprimer_comptes(), §9.
--  · Une classe EMC par créneau (§1), deux enseignants rattachés
--    à chacune (§11, à exécuter à la main).
--  · Les messages d'aide ne vivent que le temps de la séance :
--    emc_cloturer() les efface.
--
--  CE QUE FAIT CE FICHIER
--    §1  l'espace 'emc' et les quatre classes
--    §2  la géométrie de la carte : emc_zone_de, emc_dans_zone
--    §3  les tables emc_*
--    §4  les fonctions d'appartenance (utilisées par les policies)
--    §5  les policies
--    §6  entrer dans une séance, se déclarer prêt
--    §7  l'enquête anonyme
--    §8  masquer un élément de la carte sans le laisser lisible
--    §9  clôturer, supprimer les comptes créés pour l'EMC
--    §10 droits, Realtime, contenus initiaux
--    §11 rattacher les enseignants (commenté — à la main)
--
--  CE QUE CE FICHIER NE CHANGE PAS
--    Aucune table existante n'est modifiée, hormis la contrainte
--    classes_espace_connu (une valeur de plus). famille_de_cle et
--    famille_d_espace ne sont pas touchées : l'EMC n'écrit rien
--    dans  progression .
--
--  RGPD
--  · emc_aide est la seule table qui dit « tel élève va mal ».
--    Lisible des seuls enseignants de la classe, jamais exportée,
--    effacée à la clôture. Un pseudonyme, jamais un nom.
--  · emc_enquete ne porte NI l'élève NI l'heure : rien ne relie
--    une réponse à quelqu'un, pas même « qui a déjà répondu »
--    (§7). Le plafond se fait par le nombre de participants.
--  · Le témoignage libre peut nommer quelqu'un : il n'est lu que
--    des enseignants de la classe.
--
--  Rejouable. Banc d'essai : _outils/tests/emc-schema.test.mjs
-- ============================================================


-- ------------------------------------------------------------
--  1. L'espace 'emc' et les quatre classes
--
--  Une classe par créneau. Le code est ce qu'on écrit au tableau.
--  Le libellé se corrige à la main quand les créneaux sont connus
--  (update sur libelle, jamais sur code : il est déjà dicté).
-- ------------------------------------------------------------
alter table public.classes drop constraint if exists classes_espace_connu;
alter table public.classes add constraint classes_espace_connu
  check (espace in ('snt', 'es1', 'est', 'pc2', 'cfa', 'emc'));

insert into public.classes (code, libelle, annee_scolaire, espace, actif) values
  ('NINA27', 'EMC 2nde — créneau 1', '2026-2027', 'emc', true),
  ('NINA48', 'EMC 2nde — créneau 2', '2026-2027', 'emc', true),
  ('NINA63', 'EMC 2nde — créneau 3', '2026-2027', 'emc', true),
  ('NINA91', 'EMC 2nde — créneau 4', '2026-2027', 'emc', true)
on conflict (code) do nothing;


-- ------------------------------------------------------------
--  2. La géométrie de la carte
--
--  Un carré de 4000 × 4000 unités, centre en (0, 0), y vers le
--  BAS (comme l'écran) : le nord est en y négatif.
--    · centre        r ≤ 520            zone 0 (enseignants)
--    · anneau int.   520 < r ≤ 1250     zones 1, 3, 5, 7
--    · anneau ext.   r > 1250, jusqu'au bord du carré (les coins
--                    comptent)           zones 2, 4, 6, 8
--  Quadrants : NE (x ≥ 0, y < 0) → 1-2 · NO (x < 0, y < 0) → 3-4
--              SO (x < 0, y ≥ 0) → 5-6 · SE (x ≥ 0, y ≥ 0) → 7-8
--  La table N écrit dans la zone N (annexe B du plan).
--
--  🔴 La même géométrie vit dans assets/js/emc-commun.js
--  (EMC.zoneDe). Les deux se changent ENSEMBLE, et le banc
--  d'essai les compare sur les mêmes points.
-- ------------------------------------------------------------
create or replace function public.emc_zone_de(p_x double precision, p_y double precision)
returns int
language sql
immutable
set search_path = ''
as $$
  select case
    when p_x is null or p_y is null or abs(p_x) > 2000 or abs(p_y) > 2000 then null
    when sqrt(p_x * p_x + p_y * p_y) <= 520 then 0
    else (case
            when p_x >= 0 and p_y <  0 then 1
            when p_x <  0 and p_y <  0 then 3
            when p_x <  0 and p_y >= 0 then 5
            else 7
          end)
       + (case when sqrt(p_x * p_x + p_y * p_y) <= 1250 then 0 else 1 end)
  end
$$;

comment on function public.emc_zone_de is
  'Zone de la carte EMC (0 = centre, 1 à 8 = tables) d''un point, ou NULL hors du carré. Miroir de EMC.zoneDe dans emc-commun.js.';

--  Un élément tient-il ENTIÈREMENT dans la zone ?
--  · trait, fleche : chaque point de  points  (tableau à plat
--    x1, y1, x2, y2…, comme Konva), 2 à 4000 nombres ;
--  · texte, autocollant, forme : la boîte  x, y, l, h , contrôlée
--    par ses quatre coins et le milieu de ses quatre côtés (une
--    zone d'anneau n'est pas convexe : les coins seuls laisseraient
--    passer une boîte qui mord sur l'anneau intérieur).
create or replace function public.emc_dans_zone(p_zone int, p_type text, p_donnees jsonb)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_pts jsonb;
  v_n   int;
  i     int;
  x     double precision;
  y     double precision;
  l     double precision;
  h     double precision;
begin
  if p_zone is null or p_donnees is null or jsonb_typeof(p_donnees) <> 'object' then
    return false;
  end if;

  if p_type in ('trait', 'fleche') then
    v_pts := p_donnees -> 'points';
    if v_pts is null or jsonb_typeof(v_pts) <> 'array' then return false; end if;
    v_n := jsonb_array_length(v_pts);
    if v_n < 2 or v_n > 4000 or v_n % 2 <> 0 then return false; end if;
    i := 0;
    while i < v_n loop
      if jsonb_typeof(v_pts -> i) is distinct from 'number' or jsonb_typeof(v_pts -> (i + 1)) is distinct from 'number' then
        return false;
      end if;
      x := (v_pts ->> i)::double precision;
      y := (v_pts ->> (i + 1))::double precision;
      if public.emc_zone_de(x, y) is distinct from p_zone then return false; end if;
      i := i + 2;
    end loop;
    return true;
  end if;

  if p_type in ('texte', 'autocollant', 'forme') then
    if jsonb_typeof(p_donnees -> 'x') is distinct from 'number' or jsonb_typeof(p_donnees -> 'y') is distinct from 'number'
       or jsonb_typeof(p_donnees -> 'l') is distinct from 'number' or jsonb_typeof(p_donnees -> 'h') is distinct from 'number' then
      return false;
    end if;
    x := (p_donnees ->> 'x')::double precision;
    y := (p_donnees ->> 'y')::double precision;
    l := (p_donnees ->> 'l')::double precision;
    h := (p_donnees ->> 'h')::double precision;
    if l < 1 or h < 1 or l > 4000 or h > 4000 then return false; end if;
    return public.emc_zone_de(x,         y)         is not distinct from p_zone
       and public.emc_zone_de(x + l,     y)         is not distinct from p_zone
       and public.emc_zone_de(x,         y + h)     is not distinct from p_zone
       and public.emc_zone_de(x + l,     y + h)     is not distinct from p_zone
       and public.emc_zone_de(x + l / 2, y)         is not distinct from p_zone
       and public.emc_zone_de(x + l / 2, y + h)     is not distinct from p_zone
       and public.emc_zone_de(x,         y + h / 2) is not distinct from p_zone
       and public.emc_zone_de(x + l,     y + h / 2) is not distinct from p_zone;
  end if;

  return false;
end;
$$;

comment on function public.emc_dans_zone is
  'Vrai si l''élément de carte (trait, fleche, texte, autocollant, forme) tient entièrement dans la zone. Appelée par la policy d''écriture de emc_carte.';


-- ------------------------------------------------------------
--  3. Les tables
-- ------------------------------------------------------------

--  3a. Les contenus réglables au tableau de bord, communs aux
--      quatre créneaux. Une clé = un bloc (questions, missions,
--      situations…). Remplis au §10 avec les annexes du plan.
create table if not exists public.emc_contenus (
  cle     text primary key check (cle ~ '^[a-z_]{2,40}$'),
  valeur  jsonb not null,
  maj_le  timestamptz not null default now(),
  maj_par uuid default auth.uid()
);
comment on table public.emc_contenus is
  'EMC : contenus pédagogiques réglables au tableau de bord (annexes du plan). Aucune donnée d''élève.';

--  3b. L'état piloté d'une séance — une par classe EMC.
--      etape : 0 installation · 1 mots · 2 missions · 3 jeu ·
--      4 carte · 5 vidéo · 6 harcèlomètre · 7 enquête.
create table if not exists public.emc_seances (
  classe_id          uuid primary key references public.classes (id) on delete cascade,
  etape              int  not null default 0 check (etape between 0 and 7),
  situation_courante text check (situation_courante ~ '^[a-z0-9_-]{1,20}$'),
  situation_revelee  boolean not null default false,
  carte_figee        boolean not null default false,
  zones_verrouillees int[]  not null default '{}',
  cloturee_le        timestamptz,
  maj_le             timestamptz not null default now()
);
comment on table public.emc_seances is
  'EMC : étape en cours et réglages pilotés par l''enseignant. Une ligne par classe EMC.';

--  3c. Qui est là, à quelle table, et prêt ou non.
create table if not exists public.emc_participants (
  classe_id  uuid not null references public.classes (id) on delete cascade,
  eleve_id   uuid not null references public.eleves (id)  on delete cascade,
  table_num  int  not null check (table_num between 1 and 8),
  pret       boolean not null default false,
  pret_le    timestamptz,
  entre_le   timestamptz not null default now(),
  primary key (classe_id, eleve_id)
);
create index if not exists emc_participants_par_table on public.emc_participants (classe_id, table_num);
comment on table public.emc_participants is
  'EMC : participants d''une séance. La table est tirée par emc_entrer() et liée au compte (se reconnecter redonne la même).';

--  3d. Étape 1 : 1 à 3 mots, 1 ou 2 émojis.
create table if not exists public.emc_mots (
  classe_id uuid not null references public.classes (id) on delete cascade,
  eleve_id  uuid not null references public.eleves (id)  on delete cascade,
  mots      text[] not null default '{}',
  emojis    text[] not null default '{}',
  maj_le    timestamptz not null default now(),
  primary key (classe_id, eleve_id),
  constraint emc_mots_nombre  check (cardinality(mots) between 0 and 3 and cardinality(emojis) between 0 and 2),
  constraint emc_mots_taille  check (char_length(array_to_string(mots, '')) <= 120
                                     and char_length(array_to_string(emojis, '')) <= 32)
);

create table if not exists public.emc_mots_masques (
  classe_id uuid not null references public.classes (id) on delete cascade,
  mot       text not null check (char_length(mot) between 1 and 40),
  primary key (classe_id, mot)
);
comment on table public.emc_mots_masques is
  'EMC : mots du nuage masqués par l''enseignant (forme normalisée : minuscules, sans accents).';

--  3e. Notes de mission : chacun les siennes, lues par sa table.
create table if not exists public.emc_notes (
  classe_id uuid not null references public.classes (id) on delete cascade,
  eleve_id  uuid not null references public.eleves (id)  on delete cascade,
  texte     text not null default '' check (char_length(texte) <= 4000),
  maj_le    timestamptz not null default now(),
  primary key (classe_id, eleve_id)
);

--  3f. La carte mentale. Un élément = un trait, une flèche, un
--      texte, un autocollant ou une forme. L'id est fabriqué par
--      l'iPad : un renvoi après coupure ne crée pas de doublon.
--      canal = « classe:zone », pour que Realtime ne serve à un
--      iPad que sa propre zone (budget de messages, AUDIT §3.4).
create table if not exists public.emc_carte (
  id        uuid primary key,
  classe_id uuid not null references public.classes (id) on delete cascade,
  eleve_id  uuid references public.eleves (id) on delete cascade,
  auteur    uuid not null default auth.uid(),
  zone      int  not null check (zone between 0 and 8),
  type      text not null check (type in ('trait', 'fleche', 'texte', 'autocollant', 'forme')),
  couleur   text not null default 'noir' check (couleur ~ '^[a-z]{2,12}$'),
  donnees   jsonb not null,
  masque    boolean not null default false,
  supprime  boolean not null default false,
  cree_le   timestamptz not null default now(),
  maj_le    timestamptz not null default now(),
  canal     text generated always as (classe_id::text || ':' || zone::text) stored,
  constraint emc_carte_poids check (pg_column_size(donnees) <= 65536)
);
create index if not exists emc_carte_par_maj   on public.emc_carte (classe_id, maj_le);
create index if not exists emc_carte_par_eleve on public.emc_carte (classe_id, eleve_id);
comment on table public.emc_carte is
  'EMC : éléments de la carte mentale. Un élève n''écrit que dans la zone de sa table (emc_dans_zone, vérifié par la policy).';

--  Le contenu d'un élément masqué, à l'abri des élèves (§8).
create table if not exists public.emc_carte_masques (
  id      uuid primary key references public.emc_carte (id) on delete cascade,
  donnees jsonb not null
);

--  3g. Harcèlomètre : un vote par élève et par situation.
create table if not exists public.emc_votes (
  classe_id uuid not null references public.classes (id) on delete cascade,
  situation text not null check (situation ~ '^[a-z0-9_-]{1,20}$'),
  eleve_id  uuid not null references public.eleves (id)  on delete cascade,
  valeur    int  not null check (valeur between 0 and 10),
  maj_le    timestamptz not null default now(),
  primary key (classe_id, situation, eleve_id)
);

--  3h. Enquête anonyme. Ni élève, ni heure, id aléatoire : on ne
--      remonte pas à l'auteur, pas même par l'ordre d'insertion.
create table if not exists public.emc_enquete (
  id         uuid primary key default gen_random_uuid(),
  classe_id  uuid not null references public.classes (id) on delete cascade,
  reponses   jsonb not null default '{}',
  temoignage text check (char_length(temoignage) <= 3000)
);
comment on table public.emc_enquete is
  'EMC : enquête anonyme. Aucune colonne ne relie une réponse à un élève ni à un instant. N''y écrire que par emc_repondre_enquete().';

--  3i. « J'ai besoin d'en parler ». Nominatif PAR LE PSEUDONYME,
--      lu des seuls enseignants de la classe, effacé à la clôture.
create table if not exists public.emc_aide (
  id        uuid primary key default gen_random_uuid(),
  classe_id uuid not null references public.classes (id) on delete cascade,
  eleve_id  uuid not null references public.eleves (id)  on delete cascade,
  cases     text[] not null default '{}' check (cardinality(cases) <= 3),
  message   text check (char_length(message) <= 1000),
  statut    text not null default 'a_traiter' check (statut in ('a_traiter', 'pris_en_charge')),
  cree_le   timestamptz not null default now()
);
create index if not exists emc_aide_par_classe on public.emc_aide (classe_id);
comment on table public.emc_aide is
  'EMC : demandes « J''ai besoin d''en parler ». Pseudonyme seul, enseignants de la classe seuls, effacées par emc_cloturer(). Jamais projetées, jamais exportées.';

--  maj_le tenu par la base : les iPad relisent la carte « depuis »
--  le dernier maj_le vu, il doit donc venir de l'horloge du serveur.
create or replace function public.emc_toucher()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.maj_le := now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['emc_contenus', 'emc_seances', 'emc_mots', 'emc_notes', 'emc_carte', 'emc_votes'] loop
    execute format('drop trigger if exists %I on public.%I', t || '_toucher', t);
    execute format('create trigger %I before insert or update on public.%I
                    for each row execute function public.emc_toucher()', t || '_toucher', t);
  end loop;
end $$;

--  Plafonds : de quoi absorber une séance très active, pas un
--  script qui boucle.
create or replace function public.emc_plafonner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.eleve_id is null then return new; end if;
  if tg_table_name = 'emc_carte' then
    if (select count(*) from public.emc_carte c
         where c.classe_id = new.classe_id and c.eleve_id = new.eleve_id) >= 3000 then
      raise exception 'PLAFOND_CARTE' using hint = '3000 éléments par élève et par séance.';
    end if;
  elsif tg_table_name = 'emc_aide' then
    if (select count(*) from public.emc_aide a
         where a.classe_id = new.classe_id and a.eleve_id = new.eleve_id) >= 10 then
      raise exception 'PLAFOND_AIDE' using hint = '10 messages par élève et par séance.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists emc_carte_plafond on public.emc_carte;
create trigger emc_carte_plafond before insert on public.emc_carte
  for each row execute function public.emc_plafonner();
drop trigger if exists emc_aide_plafond on public.emc_aide;
create trigger emc_aide_plafond before insert on public.emc_aide
  for each row execute function public.emc_plafonner();


-- ------------------------------------------------------------
--  4. Appartenance — les briques des policies
--
--  security definer : elles lisent emc_participants et
--  emc_seances sans repasser par leurs propres policies.
-- ------------------------------------------------------------

--  Suis-je participant de cette séance ?
create or replace function public.emc_participe(p_classe uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.emc_participants p
     where p.classe_id = p_classe
       and p.eleve_id = (select public.eleve_courant())
  )
$$;

--  Ma table dans cette séance (NULL si je n'y suis pas).
create or replace function public.emc_ma_table(p_classe uuid)
returns int
language sql
stable
security definer
set search_path = ''
as $$
  select p.table_num from public.emc_participants p
   where p.classe_id = p_classe
     and p.eleve_id = (select public.eleve_courant())
$$;

--  La table d'un élève (pour « les notes de ma table »).
create or replace function public.emc_table_de(p_classe uuid, p_eleve uuid)
returns int
language sql
stable
security definer
set search_path = ''
as $$
  select p.table_num from public.emc_participants p
   where p.classe_id = p_classe and p.eleve_id = p_eleve
$$;

--  L'étape en cours, si la séance n'est pas close.
create or replace function public.emc_etape(p_classe uuid)
returns int
language sql
stable
security definer
set search_path = ''
as $$
  select s.etape from public.emc_seances s
   where s.classe_id = p_classe and s.cloturee_le is null
$$;

--  Puis-je écrire dans cette zone de la carte, maintenant ?
create or replace function public.emc_peut_dessiner(p_classe uuid, p_zone int)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
      from public.emc_participants p
      join public.emc_seances s on s.classe_id = p.classe_id
     where p.classe_id = p_classe
       and p.eleve_id = (select public.eleve_courant())
       and p.table_num = p_zone
       and s.etape = 4
       and s.cloturee_le is null
       and not s.carte_figee
       and not (p_zone = any (s.zones_verrouillees))
  )
$$;

--  Le vote est-il ouvert sur cette situation ?
create or replace function public.emc_vote_ouvert(p_classe uuid, p_situation text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.emc_seances s
     where s.classe_id = p_classe
       and s.etape = 6
       and s.cloturee_le is null
       and s.situation_courante = p_situation
       and not s.situation_revelee
  )
$$;

--  Suis-je enseignant d'au moins une classe EMC ? (écrire les contenus)
create or replace function public.emc_suis_prof()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
      from public.enseignants_classes ec
      join public.classes c on c.id = ec.classe_id
     where ec.auth_id = (select auth.uid())
       and c.espace = 'emc'
  )
$$;


-- ------------------------------------------------------------
--  5. Policies
--
--  Règle commune : l'enseignant voit et règle les séances de SES
--  classes ( mes_classes() , 016). L'élève ne voit que sa séance,
--  et n'écrit que ses propres lignes.
-- ------------------------------------------------------------
alter table public.emc_contenus      enable row level security;
alter table public.emc_seances       enable row level security;
alter table public.emc_participants  enable row level security;
alter table public.emc_mots          enable row level security;
alter table public.emc_mots_masques  enable row level security;
alter table public.emc_notes         enable row level security;
alter table public.emc_carte         enable row level security;
alter table public.emc_carte_masques enable row level security;
alter table public.emc_votes         enable row level security;
alter table public.emc_enquete       enable row level security;
alter table public.emc_aide          enable row level security;

--  5a. Contenus : lus de tout compte connecté (c'est du contenu de
--      cours, déjà public dans le dépôt), écrits par les enseignants EMC.
drop policy if exists emc_contenus_lire   on public.emc_contenus;
drop policy if exists emc_contenus_ecrire on public.emc_contenus;
create policy emc_contenus_lire on public.emc_contenus
  for select to authenticated using (true);
create policy emc_contenus_ecrire on public.emc_contenus
  for all to authenticated
  using ((select public.emc_suis_prof()))
  with check ((select public.emc_suis_prof()));

--  5b. Séances
drop policy if exists emc_seances_lire_eleve on public.emc_seances;
drop policy if exists emc_seances_prof       on public.emc_seances;
create policy emc_seances_lire_eleve on public.emc_seances
  for select to authenticated using ((select public.emc_participe(classe_id)));
create policy emc_seances_prof on public.emc_seances
  for all to authenticated
  using (classe_id in (select public.mes_classes()))
  with check (classe_id in (select public.mes_classes()));

--  5c. Participants : l'élève lit sa ligne ; l'enseignant lit et
--      réattribue les tables. On n'y entre que par emc_entrer().
drop policy if exists emc_participants_lire_le_mien on public.emc_participants;
drop policy if exists emc_participants_prof         on public.emc_participants;
create policy emc_participants_lire_le_mien on public.emc_participants
  for select to authenticated using (eleve_id = (select public.eleve_courant()));
create policy emc_participants_prof on public.emc_participants
  for all to authenticated
  using (classe_id in (select public.mes_classes()))
  with check (classe_id in (select public.mes_classes()));

--  5d. Mots : l'élève écrit et relit les siens, à l'étape 1.
drop policy if exists emc_mots_le_mien on public.emc_mots;
drop policy if exists emc_mots_ecrire  on public.emc_mots;
drop policy if exists emc_mots_changer on public.emc_mots;
drop policy if exists emc_mots_prof    on public.emc_mots;
create policy emc_mots_le_mien on public.emc_mots
  for select to authenticated using (eleve_id = (select public.eleve_courant()));
create policy emc_mots_ecrire on public.emc_mots
  for insert to authenticated
  with check (eleve_id = (select public.eleve_courant())
              and (select public.emc_participe(classe_id))
              and (select public.emc_etape(classe_id)) = 1);
create policy emc_mots_changer on public.emc_mots
  for update to authenticated
  using (eleve_id = (select public.eleve_courant()))
  with check (eleve_id = (select public.eleve_courant())
              and (select public.emc_etape(classe_id)) = 1);
create policy emc_mots_prof on public.emc_mots
  for select to authenticated using (classe_id in (select public.mes_classes()));

drop policy if exists emc_mots_masques_prof       on public.emc_mots_masques;
create policy emc_mots_masques_prof on public.emc_mots_masques
  for all to authenticated
  using (classe_id in (select public.mes_classes()))
  with check (classe_id in (select public.mes_classes()));

--  5e. Notes : j'écris les miennes, je lis celles de ma table.
drop policy if exists emc_notes_lire_table on public.emc_notes;
drop policy if exists emc_notes_ecrire     on public.emc_notes;
drop policy if exists emc_notes_changer    on public.emc_notes;
drop policy if exists emc_notes_prof       on public.emc_notes;
create policy emc_notes_lire_table on public.emc_notes
  for select to authenticated
  using ((select public.emc_ma_table(classe_id)) = public.emc_table_de(classe_id, eleve_id));
create policy emc_notes_ecrire on public.emc_notes
  for insert to authenticated
  with check (eleve_id = (select public.eleve_courant())
              and (select public.emc_etape(classe_id)) is not null
              and (select public.emc_participe(classe_id)));
create policy emc_notes_changer on public.emc_notes
  for update to authenticated
  using (eleve_id = (select public.eleve_courant()))
  with check (eleve_id = (select public.eleve_courant())
              and (select public.emc_etape(classe_id)) is not null);
create policy emc_notes_prof on public.emc_notes
  for select to authenticated using (classe_id in (select public.mes_classes()));

--  5f. Carte. L'élève lit toute la carte de sa séance, et n'écrit
--      que dans SA zone, à l'étape 4, carte et zone non verrouillées.
--      Un élément masqué reste visible comme ligne (pour que le
--      masquage arrive aux iPad en temps réel) mais son contenu a
--      été vidé (§8).
drop policy if exists emc_carte_lire_eleve on public.emc_carte;
drop policy if exists emc_carte_ecrire     on public.emc_carte;
drop policy if exists emc_carte_changer    on public.emc_carte;
drop policy if exists emc_carte_prof       on public.emc_carte;
create policy emc_carte_lire_eleve on public.emc_carte
  for select to authenticated using ((select public.emc_participe(classe_id)));
create policy emc_carte_ecrire on public.emc_carte
  for insert to authenticated
  with check (eleve_id = (select public.eleve_courant())
              and auteur = (select auth.uid())
              and not masque
              and public.emc_peut_dessiner(classe_id, zone)
              and public.emc_dans_zone(zone, type, donnees));
create policy emc_carte_changer on public.emc_carte
  for update to authenticated
  using (eleve_id = (select public.eleve_courant()) and not masque)
  with check (eleve_id = (select public.eleve_courant())
              and not masque
              and public.emc_peut_dessiner(classe_id, zone)
              and public.emc_dans_zone(zone, type, donnees));
create policy emc_carte_prof on public.emc_carte
  for all to authenticated
  using (classe_id in (select public.mes_classes()))
  with check (classe_id in (select public.mes_classes())
              and (masque or supprime or public.emc_dans_zone(zone, type, donnees)));

drop policy if exists emc_carte_masques_prof on public.emc_carte_masques;
create policy emc_carte_masques_prof on public.emc_carte_masques
  for select to authenticated
  using (exists (select 1 from public.emc_carte c
                  where c.id = emc_carte_masques.id
                    and c.classe_id in (select public.mes_classes())));

--  5g. Votes
drop policy if exists emc_votes_le_mien on public.emc_votes;
drop policy if exists emc_votes_ecrire  on public.emc_votes;
drop policy if exists emc_votes_changer on public.emc_votes;
drop policy if exists emc_votes_prof    on public.emc_votes;
create policy emc_votes_le_mien on public.emc_votes
  for select to authenticated using (eleve_id = (select public.eleve_courant()));
create policy emc_votes_ecrire on public.emc_votes
  for insert to authenticated
  with check (eleve_id = (select public.eleve_courant())
              and (select public.emc_participe(classe_id))
              and public.emc_vote_ouvert(classe_id, situation));
create policy emc_votes_changer on public.emc_votes
  for update to authenticated
  using (eleve_id = (select public.eleve_courant()))
  with check (eleve_id = (select public.eleve_courant())
              and public.emc_vote_ouvert(classe_id, situation));
create policy emc_votes_prof on public.emc_votes
  for select to authenticated using (classe_id in (select public.mes_classes()));

--  5h. Enquête : lue des enseignants ; écrite par la fonction seule.
drop policy if exists emc_enquete_prof on public.emc_enquete;
create policy emc_enquete_prof on public.emc_enquete
  for select to authenticated using (classe_id in (select public.mes_classes()));

--  5i. Aide : l'élève écrit, il ne relit pas. L'enseignant de la
--      classe lit, change le statut, efface.
drop policy if exists emc_aide_ecrire on public.emc_aide;
drop policy if exists emc_aide_prof   on public.emc_aide;
create policy emc_aide_ecrire on public.emc_aide
  for insert to authenticated
  with check (eleve_id = (select public.eleve_courant())
              and statut = 'a_traiter'
              and (select public.emc_participe(classe_id)));
create policy emc_aide_prof on public.emc_aide
  for all to authenticated
  using (classe_id in (select public.mes_classes()))
  with check (classe_id in (select public.mes_classes()));


-- ------------------------------------------------------------
--  6. Entrer dans une séance, se déclarer prêt
--
--  emc_entrer(code) : appelée par la page élève une fois connecté.
--  · Un compte créé avec le code EMC est déjà dans la classe
--    (rejoindre_classe). Un compte existant y est ajouté ici —
--    pas par rejoindre_autre_classe : la règle « un seul groupe
--    SNT » n'a rien à faire là.
--  · Sans code : la dernière classe EMC rejointe.
--  · La table est tirée parmi les moins remplies, au hasard en cas
--    d'égalité, sous verrou (40 élèves qui entrent à la même
--    seconde ne tombent pas tous à la table 1). Elle est liée au
--    compte : un second appel rend la même.
--  Renvoie { classe_id, libelle, table_num, nouveau, etape }.
--  nouveau = le compte a été créé pour l'EMC (classe d'inscription).
-- ------------------------------------------------------------
create or replace function public.emc_entrer(p_code text default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_eleve   uuid;
  v_classe  uuid;
  v_libelle text;
  v_table   int;
  v_insc    uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'AUCUNE_SESSION' using hint = 'Se connecter avant.';
  end if;
  select e.id, e.classe_id into v_eleve, v_insc
    from public.eleves e where e.auth_id = (select auth.uid());
  if v_eleve is null then
    raise exception 'PAS_ENCORE_INSCRIT' using hint = 'Créer son compte avec le code EMC.';
  end if;

  if p_code is not null and btrim(p_code) <> '' then
    select c.id, c.libelle into v_classe, v_libelle
      from public.classes c
     where c.code = upper(btrim(p_code)) and c.espace = 'emc' and c.actif = true;
    if v_classe is null then
      raise exception 'CODE_EMC_INCONNU' using hint = 'Vérifier le code écrit au tableau.';
    end if;
    insert into public.eleves_classes (eleve_id, classe_id)
    values (v_eleve, v_classe)
    on conflict do nothing;
  else
    select c.id, c.libelle into v_classe, v_libelle
      from public.eleves_classes ec
      join public.classes c on c.id = ec.classe_id
     where ec.eleve_id = v_eleve and c.espace = 'emc' and c.actif = true
     order by ec.rejoint_le desc
     limit 1;
    if v_classe is null then
      raise exception 'PAS_DE_CLASSE_EMC' using hint = 'Entrer le code écrit au tableau.';
    end if;
  end if;

  perform pg_advisory_xact_lock(hashtext('emc:' || v_classe::text));

  insert into public.emc_seances (classe_id) values (v_classe)
  on conflict (classe_id) do nothing;

  select p.table_num into v_table
    from public.emc_participants p
   where p.classe_id = v_classe and p.eleve_id = v_eleve;

  if v_table is null then
    select t.n into v_table
      from generate_series(1, 8) as t(n)
      left join public.emc_participants p
        on p.classe_id = v_classe and p.table_num = t.n
     group by t.n
     order by count(p.eleve_id), random()
     limit 1;
    insert into public.emc_participants (classe_id, eleve_id, table_num)
    values (v_classe, v_eleve, v_table);
  end if;

  return jsonb_build_object(
    'classe_id', v_classe,
    'libelle',   v_libelle,
    'table_num', v_table,
    'nouveau',   v_insc = v_classe,
    'etape',     (select s.etape from public.emc_seances s where s.classe_id = v_classe)
  );
end;
$$;

comment on function public.emc_entrer is
  'EMC : entrer dans la séance (code facultatif). Tire la table de façon équilibrée, la garde au compte. Renvoie classe_id, libelle, table_num, nouveau, etape.';

create or replace function public.emc_pret(p_classe uuid, p_pret boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.emc_participants p
     set pret = p_pret,
         pret_le = case when p_pret then now() else null end
   where p.classe_id = p_classe
     and p.eleve_id = (select public.eleve_courant());
  if not found then
    raise exception 'PAS_DANS_LA_SEANCE' using hint = 'Entrer d''abord dans la séance.';
  end if;
end;
$$;


-- ------------------------------------------------------------
--  7. L'enquête anonyme
--
--  Ni l'élève, ni l'instant, ni « a déjà répondu » ne sont gardés.
--  Le seul garde-fou contre la répétition est le plafond : pas plus
--  de réponses que de participants. L'iPad retient de son côté
--  qu'il a répondu (et le dit), c'est suffisant pour une séance.
-- ------------------------------------------------------------
create or replace function public.emc_repondre_enquete(p_classe uuid, p_reponses jsonb, p_temoignage text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.emc_participe(p_classe) then
    raise exception 'PAS_DANS_LA_SEANCE';
  end if;
  if public.emc_etape(p_classe) is distinct from 7 then
    raise exception 'ENQUETE_FERMEE' using hint = 'L''enquête s''ouvre à la dernière étape.';
  end if;
  if p_reponses is null or jsonb_typeof(p_reponses) <> 'object' or pg_column_size(p_reponses) > 4096 then
    raise exception 'REPONSES_ILLISIBLES';
  end if;
  if (select count(*) from public.emc_enquete q where q.classe_id = p_classe)
     >= (select count(*) from public.emc_participants p where p.classe_id = p_classe) then
    raise exception 'ENQUETE_COMPLETE';
  end if;
  insert into public.emc_enquete (classe_id, reponses, temoignage)
  values (p_classe, p_reponses, nullif(btrim(coalesce(p_temoignage, '')), ''));
end;
$$;

comment on function public.emc_repondre_enquete is
  'EMC : seule porte d''écriture de emc_enquete. Ne garde aucune trace de l''auteur.';


-- ------------------------------------------------------------
--  8. Masquer un élément de la carte
--
--  Masquer = le contenu part dans emc_carte_masques (enseignants
--  seuls) et la ligne garde un  donnees  vide. Les iPad reçoivent
--  le masquage en temps réel sans pouvoir relire ce qui était
--  écrit. Démasquer remet le contenu.
-- ------------------------------------------------------------
create or replace function public.emc_carte_masquer()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.masque and not old.masque then
    insert into public.emc_carte_masques (id, donnees) values (old.id, old.donnees)
    on conflict (id) do update set donnees = excluded.donnees;
    new.donnees := '{}'::jsonb;
  elsif old.masque and not new.masque then
    select m.donnees into new.donnees from public.emc_carte_masques m where m.id = old.id;
    new.donnees := coalesce(new.donnees, '{}'::jsonb);
    delete from public.emc_carte_masques m where m.id = old.id;
  end if;
  return new;
end;
$$;

drop trigger if exists emc_carte_masquer on public.emc_carte;
create trigger emc_carte_masquer before update of masque on public.emc_carte
  for each row execute function public.emc_carte_masquer();


-- ------------------------------------------------------------
--  9. Clôturer, supprimer les comptes créés pour l'EMC
-- ------------------------------------------------------------

--  Clôturer : les messages d'aide sont effacés, la séance se fige.
--  Renvoie le nombre de messages effacés.
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
  update public.emc_seances s set cloturee_le = now() where s.classe_id = p_classe;
  return v_n;
end;
$$;

--  Les comptes « créés pour l'EMC » : inscrits par le code de
--  cette classe, et dont TOUTES les classes sont des classes EMC.
--  Un élève de SNT qui a rejoint l'EMC avec son compte n'en fait
--  jamais partie. p_confirmer = false : on compte, sans rien toucher.
--  C'est ce que supprimer_eleve (024) refuserait : les classes EMC
--  ont deux enseignants.
create or replace function public.emc_supprimer_comptes(p_classe uuid, p_confirmer boolean default false)
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare v_n int;
begin
  if not (select public.est_enseignant()) or p_classe not in (select public.mes_classes()) then
    raise exception 'PAS_MA_CLASSE' using errcode = '42501';
  end if;
  if not exists (select 1 from public.classes c where c.id = p_classe and c.espace = 'emc') then
    raise exception 'PAS_UNE_CLASSE_EMC' using errcode = '42501';
  end if;

  select count(*) into v_n
    from public.eleves e
   where e.classe_id = p_classe
     and not exists (
       select 1 from public.eleves_classes ec
         join public.classes c on c.id = ec.classe_id
        where ec.eleve_id = e.id and c.espace <> 'emc');

  if p_confirmer then
    delete from auth.users u
     where u.id in (
       select e.auth_id
         from public.eleves e
        where e.classe_id = p_classe
          and not exists (
            select 1 from public.eleves_classes ec
              join public.classes c on c.id = ec.classe_id
             where ec.eleve_id = e.id and c.espace <> 'emc'));
  end if;
  return v_n;
end;
$$;

comment on function public.emc_supprimer_comptes is
  'EMC : compte (p_confirmer = false) ou supprime (true) les comptes créés avec le code de cette classe et sans aucune classe hors EMC. Leur travail part avec eux.';


-- ------------------------------------------------------------
--  10. Droits, Realtime, contenus initiaux
-- ------------------------------------------------------------
revoke all on function public.emc_zone_de(double precision, double precision) from public, anon, authenticated;
revoke all on function public.emc_dans_zone(int, text, jsonb)                from public, anon, authenticated;
revoke all on function public.emc_toucher()                                  from public, anon, authenticated;
revoke all on function public.emc_plafonner()                                from public, anon, authenticated;
revoke all on function public.emc_participe(uuid)                            from public, anon, authenticated;
revoke all on function public.emc_ma_table(uuid)                             from public, anon, authenticated;
revoke all on function public.emc_table_de(uuid, uuid)                       from public, anon, authenticated;
revoke all on function public.emc_etape(uuid)                                from public, anon, authenticated;
revoke all on function public.emc_peut_dessiner(uuid, int)                   from public, anon, authenticated;
revoke all on function public.emc_vote_ouvert(uuid, text)                    from public, anon, authenticated;
revoke all on function public.emc_suis_prof()                                from public, anon, authenticated;
revoke all on function public.emc_entrer(text)                               from public, anon, authenticated;
revoke all on function public.emc_pret(uuid, boolean)                        from public, anon, authenticated;
revoke all on function public.emc_repondre_enquete(uuid, jsonb, text)        from public, anon, authenticated;
revoke all on function public.emc_carte_masquer()                            from public, anon, authenticated;
revoke all on function public.emc_cloturer(uuid)                             from public, anon, authenticated;
revoke all on function public.emc_supprimer_comptes(uuid, boolean)           from public, anon, authenticated;

grant execute on function public.emc_zone_de(double precision, double precision) to authenticated;
grant execute on function public.emc_dans_zone(int, text, jsonb)                to authenticated;
grant execute on function public.emc_participe(uuid)                            to authenticated;
grant execute on function public.emc_ma_table(uuid)                             to authenticated;
grant execute on function public.emc_table_de(uuid, uuid)                       to authenticated;
grant execute on function public.emc_etape(uuid)                                to authenticated;
grant execute on function public.emc_peut_dessiner(uuid, int)                   to authenticated;
grant execute on function public.emc_vote_ouvert(uuid, text)                    to authenticated;
grant execute on function public.emc_suis_prof()                                to authenticated;
grant execute on function public.emc_entrer(text)                               to authenticated;
grant execute on function public.emc_pret(uuid, boolean)                        to authenticated;
grant execute on function public.emc_repondre_enquete(uuid, jsonb, text)        to authenticated;
grant execute on function public.emc_cloturer(uuid)                             to authenticated;
grant execute on function public.emc_supprimer_comptes(uuid, boolean)           to authenticated;

revoke all on table public.emc_contenus, public.emc_seances, public.emc_participants,
                    public.emc_mots, public.emc_mots_masques, public.emc_notes,
                    public.emc_carte, public.emc_carte_masques, public.emc_votes,
                    public.emc_enquete, public.emc_aide
  from anon, authenticated;

grant select, insert, update, delete on table public.emc_contenus to authenticated;
grant select on table public.emc_seances to authenticated;
grant update (etape, situation_courante, situation_revelee, carte_figee, zones_verrouillees)
  on table public.emc_seances to authenticated;
grant select on table public.emc_participants to authenticated;
grant update (table_num) on table public.emc_participants to authenticated;
grant select, insert on table public.emc_mots to authenticated;
grant update (mots, emojis) on table public.emc_mots to authenticated;
grant select, insert, delete on table public.emc_mots_masques to authenticated;
grant select, insert on table public.emc_notes to authenticated;
grant update (texte) on table public.emc_notes to authenticated;
grant select on table public.emc_carte to authenticated;
grant insert (id, classe_id, eleve_id, auteur, zone, type, couleur, donnees)
  on table public.emc_carte to authenticated;
grant update (donnees, couleur, supprime, masque) on table public.emc_carte to authenticated;
grant select on table public.emc_carte_masques to authenticated;
grant select, insert on table public.emc_votes to authenticated;
grant update (valeur) on table public.emc_votes to authenticated;
grant select on table public.emc_enquete to authenticated;
grant select, insert, delete on table public.emc_aide to authenticated;
grant update (statut) on table public.emc_aide to authenticated;

--  🔴 Une colonne que l'élève ne doit pas pouvoir basculer :
--  masque . La policy emc_carte_changer refuse déjà une ligne
--  masquée (with check … not masque) ; un enseignant passe par
--  emc_carte_prof.

--  Les séances existent dès maintenant (le pilotage les ouvre sans
--  attendre le premier élève).
insert into public.emc_seances (classe_id)
select c.id from public.classes c where c.espace = 'emc'
on conflict (classe_id) do nothing;

--  Realtime : les tables écoutées par les pages. Les policies
--  ci-dessus filtrent aussi ce que chaque abonné reçoit.
do $$
declare t text;
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach t in array array['emc_contenus', 'emc_seances', 'emc_participants', 'emc_mots',
                             'emc_carte', 'emc_votes', 'emc_aide'] loop
      if not exists (select 1 from pg_publication_tables
                      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t) then
        execute format('alter publication supabase_realtime add table public.%I', t);
      end if;
    end loop;
  end if;
end $$;

--  Contenus initiaux : les annexes du plan (validées par Loïc et
--  Mme Castel). « on conflict do nothing » : rejouer ce fichier
--  n'écrase JAMAIS ce qui a été réglé depuis au tableau de bord.
insert into public.emc_contenus (cle, valeur) values
('etapes', $j$[
  {"n":0,"titre":"Installation et connexion","duree":5},
  {"n":1,"titre":"Nuage de mots et météo des émotions","duree":10},
  {"n":2,"titre":"Révélation des missions","duree":3},
  {"n":3,"titre":"Le Labyrinthe de Nina","duree":40},
  {"n":4,"titre":"Carte mentale et débat","duree":35},
  {"n":5,"titre":"Vidéo et numéros d'urgence","duree":7},
  {"n":6,"titre":"Harcèlomètre","duree":15},
  {"n":7,"titre":"Enquête et témoignage anonymes","duree":5}
]$j$::jsonb),
('mots', $j${
  "question_mots": "Quels mots te viennent pour harcèlement / cyberharcèlement ?",
  "aide_mots": "1 à 3 mots",
  "question_emojis": "Quelle émotion ressens-tu ?",
  "aide_emojis": "1 ou 2 émojis",
  "emojis": [
    {"e":"😨","l":"peur"}, {"e":"😢","l":"tristesse"}, {"e":"😡","l":"colère"},
    {"e":"😔","l":"impuissance"}, {"e":"😶","l":"malaise"}, {"e":"🤢","l":"dégoût"},
    {"e":"😟","l":"inquiétude"}, {"e":"🙈","l":"envie de détourner le regard"},
    {"e":"😐","l":"indifférence"}, {"e":"💪","l":"envie d'agir"},
    {"e":"🤝","l":"solidarité"}, {"e":"❓","l":"je ne sais pas"}
  ]
}$j$::jsonb),
('missions', $j$[
  {"table":1,"zone":"NE intérieur","verbe":"Relever","texte":"les moments où une liberté de Nina n'est pas respectée.",
   "questions":["Quelle liberté exactement (image, vie privée, sécurité, création) ?","À quel moment cela commence-t-il ?"],
   "sous_zones":["Les moments relevés","Quelle liberté ?","Quand cela commence-t-il ?"],
   "attendu":"Droit à l'image (photos détournées), vie privée et intimité (dessins exposés, codes divulgués), sécurité physique (EPS), liberté de créer."},
  {"table":2,"zone":"NE extérieur","verbe":"Décrire","texte":"ce que Nina ressent et les signaux qu'elle laisse.",
   "questions":["Où apparaissent-ils (agenda, dessins, messages) ?","Comment vous sentiriez-vous à sa place ?"],
   "sous_zones":["Ce que Nina ressent","Les signaux","À sa place, je…"],
   "attendu":"Honte, isolement, colère, peur d'aller en EPS ; les signaux (agenda, dessins, message supprimé) ; « à sa place, je… »."},
  {"table":3,"zone":"NO intérieur","verbe":"Identifier","texte":"les actes des autres qui dépassent la limite.",
   "questions":["Quel est l'élément déclencheur dans l'esprit des harceleurs ?","Est-ce une justification ?"],
   "sous_zones":["Les actes","Le déclencheur","Une justification ?"],
   "attendu":"Vote humiliant, violences en EPS, faux rendez-vous, dessins modifiés ; le déclencheur ressenti (la jalousie), qui ne justifie rien."},
  {"table":4,"zone":"NO extérieur","verbe":"Distinguer","texte":"la liberté d'expression du harcèlement.",
   "questions":["Quand « c'est pour rire » cesse-t-il de l'être ?","Liker ou partager, est-ce participer ?"],
   "sous_zones":["Expression ou harcèlement ?","« C'est pour rire »","Liker, partager"],
   "attendu":"Les limites de la liberté d'expression ; liker ou partager, c'est participer ; la définition (répétition, rapport de force, effet sur la victime) ; un délit."},
  {"table":5,"zone":"SO intérieur","verbe":"Repérer","texte":"les témoins (adultes ou camarades) qui ont vu sans agir ou sans prendre conscience.",
   "questions":["Qu'est-ce qui a pu les empêcher d'agir ?","Quels freins psychologiques ?"],
   "sous_zones":["Les témoins","Ce qui les a empêchés","Les freins"],
   "attendu":"Ceux qui votent ou rient, l'amie qui cède, l'adulte qui ne voit pas ; les freins (peur d'être la prochaine cible, effet de groupe, « c'est juste une blague »)."},
  {"table":6,"zone":"SO extérieur","verbe":"Proposer","texte":"ce qu'un témoin aurait pu faire, et à quel moment.",
   "questions":["Quel geste simple ?","Que risque-t-on à agir… et à ne pas agir ?"],
   "sous_zones":["Ce qu'un témoin aurait pu faire","Un geste simple","Agir, ne pas agir : les risques"],
   "attendu":"Ne pas liker, dire « stop », soutenir Nina en privé, garder des captures d'écran, prévenir un adulte, signaler, et le faire dès la première humiliation."},
  {"table":7,"zone":"SE intérieur","verbe":"Retracer","texte":"les moments où Nina aurait pu se tourner vers un adulte.",
   "questions":["Vers lequel ?","Qu'est-ce qui l'en a empêchée ?"],
   "sous_zones":["Les moments","Vers quel adulte ?","Ce qui l'en a empêchée"],
   "attendu":"Les moments clés et les adultes possibles (professeur principal, CPE, infirmière, mère) ; les freins (honte, peur d'aggraver la situation ou de ne pas être crue)."},
  {"table":8,"zone":"SE extérieur","verbe":"Comprendre","texte":"la réaction de Nina et lister les ressources.",
   "questions":["Que lui diriez-vous ?","Qui contacter (CPE, infirmière, 3018…) ?"],
   "sous_zones":["Comprendre sa réaction","Que lui dire ?","Qui contacter ?"],
   "attendu":"Sa réaction est compréhensible ; « tu n'y es pour rien », « on va en parler ensemble » ; les ressources (CPE, infirmière, 3018, 3114)."}
]$j$::jsonb),
('carte', $j${
  "titre": "La liberté à l'épreuve du labyrinthe de Nina",
  "centre": "Ma liberté s'arrête là où commence celle des autres.",
  "centre_source": "DDHC 1789, art. 4 : « La liberté consiste à pouvoir faire tout ce qui ne nuit pas à autrui »",
  "nord": "Les libertés en jeu", "sud": "Les actions possibles",
  "est": "Nina", "ouest": "Les autres",
  "quadrants": {
    "NE": "Les libertés de Nina atteintes",
    "NO": "La liberté des autres qui dérape",
    "SO": "Ce que les témoins et adultes auraient pu faire",
    "SE": "Ce que Nina vit et aurait pu faire"
  },
  "anneau_interieur": "Les faits du jeu",
  "anneau_exterieur": "L'analyse, les ressentis, les propositions",
  "couleurs": [
    {"cle":"bleu","hex":"#2563c9","sens":"Fait observé dans le jeu"},
    {"cle":"orange","hex":"#e8743b","sens":"Liberté ou droit en jeu"},
    {"cle":"rouge","hex":"#d6402b","sens":"Émotion, ressenti"},
    {"cle":"violet","hex":"#7a3e8f","sens":"Personne impliquée"},
    {"cle":"vert","hex":"#2fae6a","sens":"Action, solution, ressource"},
    {"cle":"noir","hex":"#161f33","sens":"Décoration, titres, flèches (libre)"}
  ]
}$j$::jsonb),
('harcelometre', $j${
  "echelle": [
    {"de":0,"a":2,"titre":"Pas du harcèlement, ou bonne réaction"},
    {"de":3,"a":5,"titre":"Conflit ou maladresse, à surveiller"},
    {"de":6,"a":8,"titre":"Harcèlement"},
    {"de":9,"a":10,"titre":"Harcèlement grave : alerter tout de suite"}
  ],
  "criteres": ["Est-ce répété ?","Y a-t-il un rapport de force ?","Une intention de nuire, ou un effet de souffrance ?","Une diffusion, un public ?"],
  "situations": [
    {"id":"s10","texte":"Faire une blague, une fois, qui fait rire toute la classe, y compris la personne visée","lien":"Contraste","attendu":"0–2 / 3–5 (débat)","actif":true},
    {"id":"s1","texte":"Organiser un vote en ligne « like la personne que tu aimes le moins » avec des photos de la classe","lien":"Direct","attendu":"9–10","actif":true},
    {"id":"s18","texte":"Dire « arrête, ce n'est pas drôle » à quelqu'un qui se moque","lien":"Témoin","attendu":"0–2 ✅","actif":true},
    {"id":"s6","texte":"Donner à quelqu'un le code d'accès aux créations de son amie","lien":"Direct","attendu":"3–5 (débat)","actif":true},
    {"id":"s3","texte":"Bousculer la même élève à chaque cours de sport, quand le prof ne regarde pas","lien":"Direct","attendu":"9–10","actif":true},
    {"id":"s21","texte":"Prévenir la CPE qu'une élève est mise à l'écart","lien":"Adulte ressource","attendu":"0–2 ✅ (ce n'est pas « balancer »)","actif":true},
    {"id":"s2","texte":"Liker ce vote « juste pour voir »","lien":"Direct (témoins)","attendu":"6–8","actif":true},
    {"id":"s7","texte":"Se disputer une fois avec une amie et se dire des mots durs","lien":"Contraste","attendu":"3–5","actif":true},
    {"id":"s4","texte":"Monter un faux rendez-vous pour se moquer de quelqu'un","lien":"Direct","attendu":"6–8","actif":true},
    {"id":"s16","texte":"S'arranger pour que personne ne s'assoie avec la même élève à la cantine, chaque jour","lien":"Isolement","attendu":"6–8","actif":true},
    {"id":"s5","texte":"Modifier les dessins de quelqu'un et les montrer à la classe","attendu":"6–8","actif":false},
    {"id":"s20","texte":"Faire une capture d'écran pour garder une preuve","attendu":"0–2 ✅","actif":false},
    {"id":"s15","texte":"Diffuser une photo de quelqu'un sans son accord pour s'en moquer","attendu":"9–10","actif":false},
    {"id":"s19","texte":"Envoyer un message de soutien à la personne visée","attendu":"0–2 ✅","actif":false},
    {"id":"s9","texte":"Donner chaque jour un surnom que la personne a déjà dit ne pas aimer","attendu":"6–8","actif":false},
    {"id":"s17","texte":"Envoyer des messages insultants en privé, tous les soirs","attendu":"9–10","actif":false},
    {"id":"s14","texte":"Créer un faux compte au nom de quelqu'un","attendu":"9–10","actif":false},
    {"id":"s22","texte":"Bloquer et signaler un compte qui insulte","attendu":"0–2 ✅","actif":false},
    {"id":"s23","texte":"Appeler le 3018","attendu":"0–2 ✅","actif":false},
    {"id":"s8","texte":"Ne pas inviter quelqu'un à son anniversaire","attendu":"0–2 / 3–5","actif":false},
    {"id":"s11","texte":"Critiquer avec des arguments l'exposé d'un camarade","attendu":"0–2","actif":false},
    {"id":"s12","texte":"Recevoir une mauvaise note d'un professeur","attendu":"0–2","actif":false},
    {"id":"s13","texte":"Quitter un groupe de discussion","attendu":"0–2","actif":false}
  ]
}$j$::jsonb),
('enquete', $j${
  "questions": [
    {"id":"q1","texte":"As-tu déjà été dans la situation de Nina, même un peu ?","choix":["oui","non","je préfère ne pas répondre"]},
    {"id":"q2","texte":"As-tu déjà été témoin d'une situation de ce type ?","choix":["oui","non","je préfère ne pas répondre"]},
    {"id":"q3","texte":"As-tu déjà participé, même sans le vouloir (like, partage, rire) ?","choix":["oui","non","je préfère ne pas répondre"]},
    {"id":"q4","texte":"Après cette séance, saurais-tu vers qui te tourner ?","choix":["oui","non","je ne sais pas"]}
  ],
  "temoignage": "Témoignage libre, anonyme et facultatif.",
  "mention": "Si tu veux qu'un adulte vienne te voir, utilise le cadre « J'ai besoin d'en parler », qui n'est pas anonyme."
}$j$::jsonb),
('aide', $j${
  "titre": "J'ai besoin d'en parler",
  "avertissement": "Ce message n'est pas anonyme : il sera lu par M. Van Hoorde et Mme Castel pour pouvoir venir te voir.",
  "cases": ["Cette activité me met mal à l'aise","Je me sens concerné·e","J'aimerais parler à un adulte"]
}$j$::jsonb),
('numeros', $j$[
  {"numero":"3018","sens":"Harcèlement et cyberharcèlement"},
  {"numero":"3114","sens":"Prévention du suicide"},
  {"numero":"119","sens":"Enfance en danger"},
  {"numero":"17","sens":"Danger immédiat"}
]$j$::jsonb),
('videos', $j$[
  {"titre":"Vidéo de la séance (à vérifier)","mp4":"","lien":"https://youtu.be/WoVTJcw6tkE","credits":""}
]$j$::jsonb)
on conflict (cle) do nothing;


-- ------------------------------------------------------------
--  11. Rattacher les deux enseignants — À LA MAIN, une fois
--
--  Depuis l'éditeur SQL (rattacher_enseignant n'est accordée à
--  aucun rôle, 016). Remplacer les adresses par les vraies :
--
--    select public.rattacher_enseignant('ADRESSE_LOIC', 'VAN HOORDE',
--      array['NINA27','NINA48','NINA63','NINA91']);
--    select public.rattacher_enseignant('ADRESSE_CASTEL', 'CASTEL',
--      array['NINA27','NINA48','NINA63','NINA91']);
--
--  Vérification :
--    select c.code, c.libelle, count(ec.auth_id) as enseignants
--      from public.classes c
--      left join public.enseignants_classes ec on ec.classe_id = c.id
--     where c.espace = 'emc' group by c.code, c.libelle order by c.code;
--    → 4 lignes, enseignants = 2 partout.
--
--    select tablename from pg_publication_tables
--     where pubname = 'supabase_realtime' and tablename like 'emc_%';
--    → 7 lignes.
-- ------------------------------------------------------------
