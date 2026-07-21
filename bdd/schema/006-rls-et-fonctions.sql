-- ============================================================
--  006 — Ouverture contrôlée : règles RLS + fonctions d'accès
--
--  Jusqu'ici, les sept tables étaient FERMÉES : RLS activée, aucune
--  policy. Une table dans cet état ne répond à personne — sauf à la
--  clé  service_role  (le worker de correction, les scripts .bat),
--  qui contourne la RLS par conception. C'était voulu : on ouvre
--  maintenant, table par table, et le moins possible.
--
--  À exécuter EN UNE FOIS, après 001 → 005.
--  Rejouable : chaque objet est supprimé puis recréé.
--
--  ⚠ PRÉALABLE DANS LE TABLEAU DE BORD : Authentication → Providers
--     → activer « Anonymous sign-ins ». Sans cela, aucun élève ne
--     peut obtenir de session, et rien de ce qui suit ne sert.
-- ============================================================


-- ============================================================
--  1. Le principe, en une phrase
--
--  Supabase donne à chaque visiteur une session anonyme ; son
--  identifiant est lisible en SQL avec  auth.uid().  Toutes les
--  règles ci-dessous disent la même chose sous des formes
--  différentes : « tu ne vois et tu n'écris que TES lignes ».
--
--  Deux tables restent totalement fermées :
--   · classes      — sinon n'importe qui listerait tous les codes
--                    de classe ; on y accède par fonction (§3)
--   · sauvegardes  — journal d'exploitation, aucune affaire d'élève
-- ============================================================


-- ------------------------------------------------------------
--  2. Le raccourci  eleve_courant()
--
--  Écrire « l'élève de la session en cours » dans chaque policy
--  donnerait la même sous-requête recopiée dix fois. On la nomme
--  une bonne fois.
--
--  security definer = la fonction s'exécute avec les droits de son
--  propriétaire, donc SANS repasser par la RLS de  eleves.  C'est
--  ce qui évite qu'une policy qui lit  eleves  déclenche la policy
--  de  eleves  qui lit  eleves… (récursion).
--
--  set search_path = '' = on interdit à la fonction de résoudre un
--  nom de table ailleurs que là où on l'écrit explicitement. Sans
--  cette ligne, quelqu'un capable de créer un schéma pourrait faire
--  pointer « eleves » vers SA table. Réflexe à garder sur TOUTE
--  fonction security definer.
--
--  stable = « pour une même requête, cette fonction renvoie toujours
--  la même chose ». PostgreSQL peut alors ne l'appeler qu'une fois
--  au lieu d'une fois par ligne examinée.
-- ------------------------------------------------------------
create or replace function public.eleve_courant()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select e.id
  from public.eleves e
  where e.auth_id = (select auth.uid())
$$;

comment on function public.eleve_courant is
  'Id de l''élève rattaché à la session en cours, ou NULL. Utilisé par les policies.';


-- ------------------------------------------------------------
--  3. eleves — je me vois, moi et personne d'autre
--
--  Pas de policy INSERT : un élève ne crée pas sa fiche lui-même,
--  il passe par  rejoindre_classe()  (§8) qui vérifie le code.
--  Pas de policy UPDATE : le pseudo est l'identité que le
--  professeur a sous les yeux, il ne doit pas changer en cours de
--  route. Pas de policy DELETE : on n'efface pas un élève depuis
--  le navigateur.
-- ------------------------------------------------------------
drop policy if exists eleves_lire_le_mien on public.eleves;
create policy eleves_lire_le_mien
  on public.eleves
  for select
  to authenticated
  using (auth_id = (select auth.uid()));


-- ------------------------------------------------------------
--  4. progression — mon état courant, en lecture et en écriture
--
--  using      = quelles lignes EXISTANTES la règle laisse toucher
--  with check = ce que la ligne doit valoir APRÈS l'écriture
--
--  Les deux sont nécessaires sur un UPDATE : sans  with check,  un
--  élève pourrait prendre une de ses lignes et la réattribuer à
--  quelqu'un d'autre en changeant  eleve_id.
--
--  Pas de DELETE : une progression se corrige, elle ne s'efface pas.
-- ------------------------------------------------------------
drop policy if exists progression_lire on public.progression;
create policy progression_lire
  on public.progression for select to authenticated
  using (eleve_id = (select public.eleve_courant()));

drop policy if exists progression_ecrire on public.progression;
create policy progression_ecrire
  on public.progression for insert to authenticated
  with check (eleve_id = (select public.eleve_courant()));

drop policy if exists progression_mettre_a_jour on public.progression;
create policy progression_mettre_a_jour
  on public.progression for update to authenticated
  using      (eleve_id = (select public.eleve_courant()))
  with check (eleve_id = (select public.eleve_courant()));


-- ------------------------------------------------------------
--  5. evenements — journal en AJOUT SEUL
--
--  Lire les siens, en ajouter : oui. Modifier ou supprimer : non,
--  et c'est tout l'intérêt d'un journal. L'absence de policy
--  UPDATE/DELETE n'est pas un oubli, c'est la règle elle-même.
--
--  saison est laissée libre à l'insertion : sa valeur par défaut
--  ('2026-2027') s'applique si le client ne dit rien.
-- ------------------------------------------------------------
drop policy if exists evenements_lire on public.evenements;
create policy evenements_lire
  on public.evenements for select to authenticated
  using (eleve_id = (select public.eleve_courant()));

drop policy if exists evenements_ajouter on public.evenements;
create policy evenements_ajouter
  on public.evenements for insert to authenticated
  with check (eleve_id = (select public.eleve_courant()));


-- ------------------------------------------------------------
--  6. reponses_libres — j'écris ma copie, je ne me corrige pas
--
--  Ici le  with check  fait un second travail, plus intéressant que
--  la propriété de la ligne : il interdit à l'élève de se déclarer
--  corrigé. Le statut ne peut être qu'« en_attente », et les deux
--  champs de retour (IA, professeur) doivent rester vides.
--
--  Qui les remplit alors ? Le worker de correction, qui tourne sur
--  le PC de Loïc avec la clé  service_role  — laquelle ignore la
--  RLS. Cette clé ne doit JAMAIS se retrouver dans une page du site.
--
--  Le déclencheur d'archivage posé en 005 remet de toute façon
--  statut/correction/commentaire à zéro dès que le texte change :
--  la règle ci-dessous couvre le cas où l'élève écrirait dans la
--  table sans passer par le site.
-- ------------------------------------------------------------
drop policy if exists reponses_lire on public.reponses_libres;
create policy reponses_lire
  on public.reponses_libres for select to authenticated
  using (eleve_id = (select public.eleve_courant()));

drop policy if exists reponses_envoyer on public.reponses_libres;
create policy reponses_envoyer
  on public.reponses_libres for insert to authenticated
  with check (
    eleve_id = (select public.eleve_courant())
    and statut = 'en_attente'
    and correction_ia is null
    and commentaire_prof is null
  );

drop policy if exists reponses_reecrire on public.reponses_libres;
create policy reponses_reecrire
  on public.reponses_libres for update to authenticated
  using (eleve_id = (select public.eleve_courant()))
  with check (
    eleve_id = (select public.eleve_courant())
    and statut = 'en_attente'
    and correction_ia is null
    and commentaire_prof is null
  );


-- ------------------------------------------------------------
--  7. reponses_versions — relire mes brouillons
--
--  Lecture seule : l'élève relit ses versions précédentes, il n'en
--  fabrique pas. Les lignes y sont déposées par le déclencheur de
--  005 — qui, jusqu'ici, s'exécutait avec les droits de l'élève et
--  se heurtait donc à la RLS de cette table.
--
--  On le recrée ici à l'identique, en  security definer  : le
--  déclencheur écrit désormais au nom de son propriétaire.
--  (Fichier 005 laissé intact, conformément à la discipline de
--   bdd/README.md : on ne modifie pas un fichier déjà exécuté.)
-- ------------------------------------------------------------
drop policy if exists versions_lire on public.reponses_versions;
create policy versions_lire
  on public.reponses_versions for select to authenticated
  using (eleve_id = (select public.eleve_courant()));

create or replace function public.archive_version_reponse()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.texte is distinct from old.texte then
    insert into public.reponses_versions (
      reponse_id, eleve_id, code_activite, version,
      texte, statut, correction_ia, commentaire_prof, envoye_le
    ) values (
      old.id, old.eleve_id, old.code_activite, old.version,
      old.texte, old.statut, old.correction_ia, old.commentaire_prof,
      old.envoye_le
    );
    new.version          = old.version + 1;
    new.statut           = 'en_attente';
    new.correction_ia    = null;
    new.commentaire_prof = null;
    new.envoye_le        = now();
    new.corrige_le       = null;
  end if;
  return new;
end;
$$;


-- ============================================================
--  8. rejoindre_classe() — la seule porte d'entrée
--
--  Le problème : pour créer sa fiche, l'élève doit traduire le code
--  qu'il tape (« SNT26A ») en  classe_id.  Autoriser la lecture de
--  la table  classes  reviendrait à publier la liste de tous les
--  codes de toutes les classes. On ne le fait pas.
--
--  À la place, une fonction  security definer  : elle seule voit
--  la table  classes,  elle vérifie, elle crée, elle ne renvoie
--  qu'un identifiant. Le code de classe n'est jamais lisible depuis
--  le navigateur — il ne peut qu'être proposé et validé.
--
--  Idempotente : si la session a déjà une fiche, on la renvoie au
--  lieu d'échouer (l'élève qui recharge la page ne casse rien).
-- ============================================================
create or replace function public.rejoindre_classe(
  p_code   text,
  p_pseudo text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_auth   uuid := (select auth.uid());
  v_classe uuid;
  v_eleve  uuid;
begin
  if v_auth is null then
    raise exception 'AUCUNE_SESSION'
      using hint = 'Aucune session anonyme : appeler signInAnonymously avant.';
  end if;

  -- Déjà inscrit ? On met à jour la date de dernière visite et on sort.
  select id into v_eleve from public.eleves where auth_id = v_auth;
  if v_eleve is not null then
    update public.eleves set vu_le = now() where id = v_eleve;
    return v_eleve;
  end if;

  -- upper() : la contrainte de 002 impose des codes en majuscules ;
  -- on épargne à l'élève la casse de son clavier.
  select id into v_classe
  from public.classes
  where code = upper(trim(p_code)) and actif = true;

  if v_classe is null then
    raise exception 'CODE_CLASSE_INCONNU'
      using hint = 'Code inexistant, ou inscriptions fermées sur cette classe.';
  end if;

  begin
    insert into public.eleves (auth_id, pseudo, classe_id)
    values (v_auth, trim(p_pseudo), v_classe)
    returning id into v_eleve;
  exception when unique_violation then
    -- L'index  eleves_pseudo_par_classe  a parlé : ce pseudo est pris
    -- dans CETTE classe (la comparaison ignore la casse).
    raise exception 'PSEUDO_DEJA_PRIS'
      using hint = 'Ce pseudo est déjà utilisé dans cette classe.';
  end;

  return v_eleve;
end;
$$;

comment on function public.rejoindre_classe is
  'Inscrit la session anonyme dans une classe. Seule fonction autorisée à lire la table classes.';


-- ============================================================
--  9. ma_session() — qui suis-je, et dans quelle classe ?
--
--  La page d'accueil doit afficher « Bonjour Dracaufeu — 2nde SNT
--  groupe A ». Le libellé de classe vit dans  classes,  fermée :
--  d'où, là encore, une fonction.
--  Ne renvoie QUE la ligne de la session en cours.
-- ============================================================
create or replace function public.ma_session()
returns table (
  eleve_id       uuid,
  pseudo         text,
  classe_libelle text,
  annee_scolaire text
)
language sql
stable
security definer
set search_path = ''
as $$
  select e.id, e.pseudo, c.libelle, c.annee_scolaire
  from public.eleves e
  join public.classes c on c.id = e.classe_id
  where e.auth_id = (select auth.uid())
$$;


-- ============================================================
--  10. Droits d'appel des fonctions
--
--  GRANT et RLS répondent à deux questions différentes :
--   · GRANT : « as-tu le droit de toucher à cet objet ? »
--   · RLS   : « quelles LIGNES de cet objet ? »
--  Une fonction n'a pas de lignes : seul le GRANT la concerne.
--
--  anon          = visiteur sans session (avant signInAnonymously)
--  authenticated = session anonyme obtenue, élève ou non inscrit
--
--  rejoindre_classe est ouverte aux deux : la session vient d'être
--  créée, et la fonction vérifie elle-même  auth.uid().
-- ============================================================
revoke all on function public.eleve_courant()      from public, anon, authenticated;
revoke all on function public.rejoindre_classe(text, text) from public, anon, authenticated;
revoke all on function public.ma_session()         from public, anon, authenticated;

grant execute on function public.eleve_courant()   to authenticated;
grant execute on function public.rejoindre_classe(text, text) to anon, authenticated;
grant execute on function public.ma_session()      to authenticated;


-- ============================================================
--  11. Vérification — à lancer juste après
--
--  Attendu :
--   · classes et sauvegardes  → 0 policy (fermées, c'est voulu)
--   · eleves                  → 1
--   · progression             → 3
--   · evenements              → 2
--   · reponses_libres         → 3
--   · reponses_versions       → 1
--  et rls_active = true partout.
-- ============================================================
select
  c.relname                       as table_name,
  c.relrowsecurity                as rls_active,
  count(p.polname)                as nb_policies
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
left join pg_policy p on p.polrelid = c.oid
where n.nspname = 'public' and c.relkind = 'r'
group by c.relname, c.relrowsecurity
order by c.relname;
