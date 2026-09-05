-- ============================================================
--  016 — Le cloisonnement par enseignant
--
--  BESOIN (Loïc, 04/09/2026, rentrée)
--  Jusqu'ici la base n'a connu qu'un seul professeur. À la
--  rentrée 2026 ils sont cinq à se partager 14 groupes de SNT :
--
--    COUVRAT ......... A · F · K
--    VAN HOORDE ...... B · E · N
--    MARTIN .......... D · H · J · L
--    SANCHEZ ALZATE .. I · M
--    MAGOPHY ......... C · G
--
--  Or  est_enseignant()  est BOOLÉEN. Tel quel, tout compte
--  inscrit dans  enseignants  lit toutes les classes, tous les
--  élèves et toutes les copies du lycée, et peut écrire le
--  cahier de textes ou le plafond d'avance de n'importe quel
--  groupe. C'était sans conséquence à un seul professeur.
--
--  DÉCISION (04/09/2026)
--  Chaque enseignant ne voit et ne touche QUE ses groupes.
--
--  CE QUE CE FICHIER NE CHANGE PAS
--  - est_enseignant() reste, et garde son rôle : « ce compte
--    est-il un compte professeur ? ». C'est elle qui produit le
--    message « Ce compte n'est pas un compte professeur » à la
--    connexion. On lui ajoute une seconde question, on ne la
--    remplace pas.
--  - modeles_correction (011) est DÉJÀ cloisonnée par auth_id :
--    la bibliothèque de réponses types de chacun lui appartient
--    depuis le premier jour. Rien à y faire.
--  - Le worker de pré-correction IA tourne en service_role,
--    donc hors RLS : il continue de traiter toutes les copies en
--    attente de la base, sans filtre. C'est voulu (décision du
--    04/09). Le tri se fait à la LECTURE : une copie corrigée
--    n'apparaît que dans la file de l'enseignant de l'élève.
--    Aucune ligne de code de tri n'existe, et c'est pour ça
--    qu'elle ne peut pas se tromper.
--  - Les élèves ne sont pas concernés : ils passent par
--    rejoindre_classe() et ma_session(), security definer, que
--    les règles enseignant n'atteignent pas.
--
--  CONSÉQUENCE VOULUE, à ne pas prendre pour un bug
--  Une classe rattachée à personne devient invisible de TOUS les
--  tableaux de bord. C'est ainsi que le livret CFA (CFA26A,
--  MVT26A) sort du tableau de bord SNT : sans filtre, sans
--  colonne, sans code. Les apprentis, eux, continuent de
--  s'inscrire et de travailler normalement.
--
--  PRÉCÉDENT : 015 est une PROPOSITION jamais exécutée. Ce
--  fichier ne s'appuie sur rien de ce qu'elle contient.
-- ============================================================


-- ------------------------------------------------------------
--  1. La table de rattachement
--
--  Un enseignant, une classe, une ligne. Le co-enseignement
--  s'écrit tout seul (deux lignes sur la même classe), et une
--  classe sans ligne n'appartient à personne.
--
--  auth_id référence  enseignants, pas  auth.users : on ne peut
--  pas rattacher un compte qui n'est pas déclaré professeur.
--  La contrainte fait le travail à notre place.
-- ------------------------------------------------------------
create table if not exists public.enseignants_classes (
  auth_id uuid not null
    references public.enseignants(auth_id) on delete cascade,

  classe_id uuid not null
    references public.classes(id) on delete cascade,

  primary key (auth_id, classe_id),

  cree_le timestamptz not null default now()
);

comment on table public.enseignants_classes is
  'Qui enseigne où. Une classe sans ligne ici n''apparaît dans aucun tableau de bord.';

alter table public.enseignants_classes enable row level security;


-- ------------------------------------------------------------
--  2. Les trois fonctions de portée
--
--  security definer  parce qu'elles lisent  enseignants_classes,
--  que les policies ci-dessous protègent — sans ça, chaque règle
--  déclencherait la règle suivante en cascade.
--
--  stable  parce qu'elles ne changent rien et rendent le même
--  résultat pendant toute la requête : PostgreSQL peut alors
--  n'appeler qu'une fois au lieu d'une fois par ligne.
--
--  search_path = ''  parce qu'une fonction security definer sans
--  search_path fixé est détournable en glissant une table
--  homonyme dans un schéma que l'appelant contrôle.
-- ------------------------------------------------------------

--  2a. Mes classes — l'ensemble de référence.
create or replace function public.mes_classes()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select ec.classe_id
  from public.enseignants_classes ec
  where ec.auth_id = (select auth.uid())
$$;

comment on function public.mes_classes is
  'Les classes de la session en cours. Vide pour un élève, pour un visiteur, et pour un professeur sans rattachement.';


--  2b. Cet élève est-il dans une de mes classes ?
--
--  progression, reponses_libres et absences ne portent PAS de
--  classe_id : le modèle ne l'a pas dénormalisé. On passe donc
--  par eleves. L'index  eleves (classe_id, lower(pseudo))  et la
--  clé primaire couvrent les deux sens de la jointure.
create or replace function public.mon_eleve(p_eleve uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.eleves e
    join public.enseignants_classes ec on ec.classe_id = e.classe_id
    where e.id = p_eleve
      and ec.auth_id = (select auth.uid())
  )
$$;

comment on function public.mon_eleve is
  'Vrai si cet élève est dans une des classes de la session en cours.';


--  2c. Cette copie est-elle celle d'un de mes élèves ?
--
--  Sert aux trois fonctions de correction du 010, qui reçoivent
--  un identifiant de COPIE et non d'élève.
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
    join public.eleves e               on e.id = r.eleve_id
    join public.enseignants_classes ec on ec.classe_id = e.classe_id
    where r.id = p_copie
      and ec.auth_id = (select auth.uid())
  )
$$;

comment on function public.ma_copie is
  'Vrai si cette copie appartient à un élève de la session en cours. Faux aussi quand la copie n''existe pas — voulu : on ne renseigne pas sur l''existence d''une ligne qu''on n''a pas le droit de voir.';


-- ------------------------------------------------------------
--  3. Les huit règles réécrites
--
--  Chacune remplace une règle du 008 ou du 009 qui disait
--  « est-ce un professeur ? » et dit désormais « est-ce un de
--  ses groupes ? ». Le  drop … if exists  garde le fichier
--  rejouable.
-- ------------------------------------------------------------

--  3a. classes — la liste déroulante des tableaux de bord.
drop policy if exists classes_lire_prof on public.classes;
create policy classes_lire_prof
  on public.classes for select to authenticated
  using (id in (select public.mes_classes()));

--  Le réglage du plafond d'avance (avance_max, ouvert_jusqu_au)
--  se fait par PATCH depuis l'onglet Séance
--  (prof/index.html, ProfAPI.modifier('classes?id=eq.…')).
--
--  🔴 Or AUCUNE règle d'écriture n'existe sur  classes  dans
--  bdd/schema : le 008 n'a posé que la lecture. Sous RLS, un
--  PATCH sans policy d'update ne modifie rien — et PostgREST
--  répond 200 avec zéro ligne touchée, que le tableau de bord
--  lit comme un succès. Le réglage du plafond n'a donc
--  probablement JAMAIS rien écrit depuis l'interface, le même
--  genre de panne muette que le bouton « Partager avec la
--  classe » du 20/08.
--  À confirmer par la vérification 7f : si une policy d'update
--  y apparaît sous un autre nom, c'est qu'elle a été ajoutée à
--  la main hors du dépôt, et il faut alors la supprimer — deux
--  policies permissives se cumulent en OU, et celle-là rouvrirait
--  toutes les classes à tous.
drop policy if exists classes_regler_prof on public.classes;
create policy classes_regler_prof
  on public.classes for update to authenticated
  using      (id in (select public.mes_classes()))
  with check (id in (select public.mes_classes()));

--  3b. eleves — la grille de suivi.
drop policy if exists eleves_lire_prof on public.eleves;
create policy eleves_lire_prof
  on public.eleves for select to authenticated
  using (classe_id in (select public.mes_classes()));

--  3c. progression — ce que chaque élève a fait.
drop policy if exists progression_lire_prof on public.progression;
create policy progression_lire_prof
  on public.progression for select to authenticated
  using ((select public.mon_eleve(progression.eleve_id)));

--  3d. reponses_libres — la file de correction.
drop policy if exists reponses_lire_prof on public.reponses_libres;
create policy reponses_lire_prof
  on public.reponses_libres for select to authenticated
  using ((select public.mon_eleve(reponses_libres.eleve_id)));

--  3e. seances_faites — le cahier de textes.
drop policy if exists seances_faites_prof on public.seances_faites;
create policy seances_faites_prof
  on public.seances_faites for all to authenticated
  using      (classe_id in (select public.mes_classes()))
  with check (classe_id in (select public.mes_classes()));

--  3f. absences — la note de travail, par élève.
drop policy if exists absences_prof on public.absences;
create policy absences_prof
  on public.absences for all to authenticated
  using      ((select public.mon_eleve(absences.eleve_id)))
  with check ((select public.mon_eleve(absences.eleve_id)));

--  3g. jalons — la progression prévisionnelle.
drop policy if exists jalons_prof on public.jalons;
create policy jalons_prof
  on public.jalons for all to authenticated
  using      (classe_id in (select public.mes_classes()))
  with check (classe_id in (select public.mes_classes()));

--  3h. enseignants_classes — chacun lit ses propres
--  rattachements, personne n'écrit (voir §5).
drop policy if exists enseignants_classes_me_lire on public.enseignants_classes;
create policy enseignants_classes_me_lire
  on public.enseignants_classes for select to authenticated
  using (auth_id = (select auth.uid()));


-- ------------------------------------------------------------
--  4. Les trois fonctions de correction, resserrées
--
--  🔴 C'EST LE POINT LE PLUS IMPORTANT DU FICHIER.
--
--  Les policies du §3 ferment la LECTURE. Les corrections, elles,
--  ne passent pas par un update direct mais par ces trois
--  fonctions du 010 — et une fonction  security definer
--  CONTOURNE la RLS par construction. Sans ce paragraphe, un
--  enseignant pourrait valider ou rouvrir n'importe quelle copie
--  du lycée en connaissant son identifiant. Le cloisonnement du
--  §3 rend cet identifiant introuvable, mais « introuvable »
--  n'est pas « interdit », et une serrure ne se pose pas sur une
--  hypothèse.
--
--  Le corps de chaque fonction est repris À L'IDENTIQUE du 010.
--  Seul le contrôle change : un second  if  après le premier.
--  Il est placé AVANT toute lecture de la copie — sinon les
--  messages d'erreur eux-mêmes renseigneraient sur l'existence
--  et le contenu de copies qu'on n'a pas le droit de voir.
-- ------------------------------------------------------------

--  4a. valider_copie — rend la correction visible à l'élève.
create or replace function public.valider_copie(
  p_copie       uuid,
  p_commentaire text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_lignes int;
begin
  if not public.est_enseignant() then
    -- 42501 = insufficient_privilege. Le client reçoit un vrai
    -- refus, pas un « 0 ligne modifiée » qu'il croirait normal.
    raise exception 'Action réservée au professeur.'
      using errcode = '42501';
  end if;

  if not public.ma_copie(p_copie) then
    raise exception 'Cette copie n''est pas celle d''un de tes élèves.'
      using errcode = '42501';
  end if;

  update public.reponses_libres
     set statut           = 'corrige',
         corrige_le       = now(),
         commentaire_prof = coalesce(
                              nullif(btrim(p_commentaire), ''),
                              commentaire_prof)
   where id = p_copie;

  get diagnostics v_lignes = row_count;

  if v_lignes = 0 then
    raise exception 'Copie introuvable : %', p_copie
      using errcode = 'P0002';
  end if;
end;
$$;

comment on function public.valider_copie(uuid, text) is
  'Rend la correction visible à l''élève. Sans commentaire : le message IA validé. Avec : le mot du professeur, qui prime. Refuse une copie hors de ses classes.';


--  4b. signaler_copie — à refaire.
--
--  La garde pédagogique du 010 est conservée telle quelle : on
--  refuse de renvoyer une copie sans dire pourquoi.
create or replace function public.signaler_copie(
  p_copie       uuid,
  p_commentaire text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_lignes  int;
  v_message text;
begin
  if not public.est_enseignant() then
    raise exception 'Action réservée au professeur.'
      using errcode = '42501';
  end if;

  if not public.ma_copie(p_copie) then
    raise exception 'Cette copie n''est pas celle d''un de tes élèves.'
      using errcode = '42501';
  end if;

  select nullif(btrim(
           r.correction_ia -> 'analyse' -> 'feedback_eleve' ->> 'message'
         ), '')
    into v_message
    from public.reponses_libres r
   where r.id = p_copie;

  if nullif(btrim(coalesce(p_commentaire, '')), '') is null
     and v_message is null then
    raise exception
      'Une copie renvoyée doit dire pourquoi : écris un commentaire.'
      using errcode = 'P0001';
  end if;

  update public.reponses_libres
     set statut           = 'signale',
         corrige_le       = now(),
         commentaire_prof = coalesce(
                              nullif(btrim(p_commentaire), ''),
                              commentaire_prof)
   where id = p_copie;

  get diagnostics v_lignes = row_count;

  if v_lignes = 0 then
    raise exception 'Copie introuvable : %', p_copie
      using errcode = 'P0002';
  end if;
end;
$$;

comment on function public.signaler_copie(uuid, text) is
  'Renvoie la copie à l''élève pour réécriture. Refuse si rien n''explique pourquoi, et refuse une copie hors de ses classes.';


--  4c. rouvrir_copie — le filet.
create or replace function public.rouvrir_copie(p_copie uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_lignes int;
begin
  if not public.est_enseignant() then
    raise exception 'Action réservée au professeur.'
      using errcode = '42501';
  end if;

  if not public.ma_copie(p_copie) then
    raise exception 'Cette copie n''est pas celle d''un de tes élèves.'
      using errcode = '42501';
  end if;

  update public.reponses_libres
     set statut           = 'en_attente',
         corrige_le       = null,
         commentaire_prof = null
   where id = p_copie;

  get diagnostics v_lignes = row_count;

  if v_lignes = 0 then
    raise exception 'Copie introuvable : %', p_copie
      using errcode = 'P0002';
  end if;
end;
$$;

comment on function public.rouvrir_copie(uuid) is
  'Annule une correction : la copie retourne dans la file. correction_ia est conservée, le commentaire du professeur est effacé. Refuse une copie hors de ses classes.';


-- ------------------------------------------------------------
--  5. Rattacher un enseignant — la commande d'administration
--
--  Écrite pour que personne n'ait jamais à recopier un UUID :
--  on donne une adresse de connexion, un libellé et des codes de
--  classe, la fonction retrouve le compte elle-même.
--
--  🔴 Elle n'est accordée à PERSONNE (voir §6). Elle s'exécute
--  depuis l'éditeur SQL du tableau de bord Supabase, sous le
--  rôle propriétaire. Accordée à  authenticated, elle
--  permettrait à n'importe quel enseignant de se rattacher au
--  groupe d'un collègue — c'est-à-dire exactement ce que tout ce
--  fichier interdit.
--
--  Idempotente : rejouée, elle met à jour le libellé et ajoute
--  les rattachements manquants sans toucher aux autres.
--
--  Usage :
--    select public.rattacher_enseignant(
--      'adresse@exemple.fr', 'MARTIN',
--      array['SNT26D','SNT26H','SNT26J','SNT26L']);
-- ------------------------------------------------------------
create or replace function public.rattacher_enseignant(
  p_adresse text,
  p_libelle text,
  p_codes   text[]
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_auth   uuid;
  v_code   text;
  v_classe uuid;
  v_ajouts int := 0;
begin
  select u.id into v_auth
    from auth.users u
   where lower(u.email) = lower(btrim(p_adresse));

  if v_auth is null then
    raise exception
      'Aucun compte pour %. Crée-le d''abord dans Auth → Users.', p_adresse
      using errcode = 'P0002';
  end if;

  insert into public.enseignants (auth_id, libelle)
  values (v_auth, p_libelle)
  on conflict (auth_id) do update set libelle = excluded.libelle;

  foreach v_code in array p_codes loop
    select c.id into v_classe
      from public.classes c
     where c.code = upper(btrim(v_code));

    if v_classe is null then
      raise exception 'Code de classe inconnu : %', v_code
        using errcode = 'P0002';
    end if;

    insert into public.enseignants_classes (auth_id, classe_id)
    values (v_auth, v_classe)
    on conflict do nothing;

    if found then v_ajouts := v_ajouts + 1; end if;
  end loop;

  return p_libelle || ' : ' || v_ajouts || ' rattachement(s) ajouté(s), '
      || array_length(p_codes, 1) || ' demandé(s).';
end;
$$;

comment on function public.rattacher_enseignant is
  'Administration. Rattache un enseignant à des classes par son adresse de connexion. N''est accordée à aucun rôle : s''exécute depuis l''éditeur SQL.';


-- ------------------------------------------------------------
--  6. Droits d'appel
--
--  Règle de la maison : on retire tout, puis on accorde ce qui
--  est nécessaire. Une fonction dont on a « oublié » les droits
--  reste ouverte à  public  par défaut.
-- ------------------------------------------------------------
revoke all on function public.mes_classes()          from public, anon, authenticated;
revoke all on function public.mon_eleve(uuid)        from public, anon, authenticated;
revoke all on function public.ma_copie(uuid)         from public, anon, authenticated;
revoke all on function public.rattacher_enseignant(text, text, text[])
                                                     from public, anon, authenticated;

grant execute on function public.mes_classes()   to authenticated;
grant execute on function public.mon_eleve(uuid) to authenticated;
grant execute on function public.ma_copie(uuid)  to authenticated;
--  rattacher_enseignant : AUCUN grant. C'est délibéré.

revoke all on table public.enseignants_classes from anon;
grant select on table public.enseignants_classes to authenticated;


-- ============================================================
--  7. Vérifications — à lire après exécution
-- ============================================================

--  7a. La table existe, RLS active, une seule policy (lecture).
select c.relname,
       c.relrowsecurity as rls_active,
       count(p.oid)     as nb_regles
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
left join pg_policy p on p.polrelid = c.oid
where n.nspname = 'public' and c.relname = 'enseignants_classes'
group by c.relname, c.relrowsecurity;
--  → 1 ligne, rls_active = true, nb_regles = 1

--  7b. Les cinq fonctions sont security definer ET search_path vide.
select p.proname,
       p.prosecdef                      as security_definer,
       coalesce(p.proconfig::text, '—') as config
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('mes_classes', 'mon_eleve', 'ma_copie',
                    'rattacher_enseignant', 'est_enseignant')
order by p.proname;
--  → 5 lignes, toutes security_definer = true, config = {search_path=}

--  7c. Plus AUCUNE règle ne dit « est_enseignant » toute seule.
--      Le seul reste attendu est modeles_correction, qui la
--      combine avec auth.uid() — c'est son cloisonnement à elle.
select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
  and qual like '%est_enseignant%'
order by tablename, policyname;
--  → 1 ligne : modeles_correction

--  7d. Les trois fonctions de correction contrôlent la classe.
select p.proname,
       position('ma_copie' in p.prosrc) > 0 as controle_de_classe
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('valider_copie', 'signaler_copie', 'rouvrir_copie')
order by p.proname;
--  → 3 lignes, toutes à true

--  7e. rattacher_enseignant n'est accordée à personne.
select grantee, privilege_type
from information_schema.role_routine_grants
where routine_schema = 'public'
  and routine_name = 'rattacher_enseignant';
--  → 0 ligne (ou le seul propriétaire)

--  7f. 🔴 L'AUDIT QUI COMPTE — toutes les règles des sept tables.
--
--  Les policies permissives se CUMULENT EN OU : il suffit d'une
--  seule règle oubliée, ou ajoutée à la main hors du dépôt, pour
--  que tout ce fichier ne serve à rien. On les lit donc toutes,
--  et on vérifie que chaque règle « prof » mentionne bien
--  mes_classes ou mon_eleve.
select tablename,
       policyname,
       cmd,
       case
         when policyname like '%prof%'
          and qual not like '%mes_classes%'
          and qual not like '%mon_eleve%'  then '🔴 NON CLOISONNÉE'
         when policyname like '%prof%'                then 'ok — cloisonnée'
         else 'règle élève, hors sujet'
       end as verdict
from pg_policies
where schemaname = 'public'
  and tablename in ('classes', 'eleves', 'progression', 'reponses_libres',
                    'seances_faites', 'absences', 'jalons',
                    'enseignants_classes')
order by tablename, policyname;
--  → aucune ligne ne doit porter « 🔴 NON CLOISONNÉE ».
--    Attendu sur  classes : classes_lire_prof (select) et
--    classes_regler_prof (update), et RIEN D'AUTRE. Toute autre
--    règle d'écriture y serait un reste à supprimer.

--  7g. Qui enseigne où. Vide tant que le 017 n'est pas joué.
select e.libelle, c.code, c.libelle as classe
from public.enseignants_classes ec
join public.enseignants e on e.auth_id = ec.auth_id
join public.classes     c on c.id      = ec.classe_id
order by e.libelle, c.code;
