-- ============================================================
--  014-reponses-personnelles.sql — le statut « partage »
--  ------------------------------------------------------------
--  CE QU'ON VEUT
--  Les réponses personnelles — l'enquête auprès des grands-parents,
--  le débat, « et toi ? » — doivent arriver dans le tableau de bord
--  du professeur, qui en tirera une sélection pour lancer la
--  discussion en classe. Elles ne sont PAS notées : elles ne doivent
--  donc entrer ni dans la file de correction, ni sous le worker IA.
--
--  Jusqu'ici elles n'allaient nulle part. Le bouton « Partager avec
--  la classe » passait le textarea en lecture seule et affichait
--  « ✅ Merci — ta réponse nourrit la discussion de classe », sans
--  rien écrire : ni en base, ni en mémoire d'état. Un élève qui
--  rechargeait la page avait perdu son enquête. C'est ce que ce
--  fichier répare, côté base.
--
--  🔴 POURQUOI UN STATUT, ET PAS UNE TABLE
--  Une copie et une réponse personnelle sont la même chose pour
--  l'élève — un texte qu'il écrit — et la même chose pour le
--  professeur, qui les lit au même endroit. Ce qui les sépare est
--  leur DESTIN : l'une est relue et corrigée, l'autre est lue et
--  discutée. Un statut dit exactement cela, et il le dit à un seul
--  endroit. Une seconde table aurait dupliqué la RLS, l'archivage
--  des versions, la fiche élève et la purge de fin d'année.
--
--  CE QUE « partage » CHANGE AILLEURS, SANS QU'ON Y TOUCHE
--   · la file de correction filtre `statut = 'en_attente'`
--     (prof/index.html) : les partages n'y entrent pas ;
--   · l'index partiel `reponses_a_corriger` ne vise que
--     'en_attente' : le worker ne les voit pas non plus ;
--   · la fiche élève lit `reponses_libres` sans filtre de statut :
--     elles s'y affichent, sans une ligne de code en plus.
--
--  CE QUE CE FICHIER NE FAIT PAS
--   · il ne crée aucune table ;
--   · il n'ouvre aucune ligne de plus à l'élève : il ne fait
--     qu'autoriser une SECONDE valeur de statut là où une seule
--     était admise ;
--   · il ne rend rien obligatoire : c'est la page qui décide quelles
--     réponses partent en 'partage'.
--
--  REJOUABLE : `drop constraint if exists`, `drop policy if exists`,
--  `create or replace`.
-- ============================================================


-- ------------------------------------------------------------
--  1. La contrainte de statut accueille une cinquième valeur
--
--  L'ordre compte : on ne peut pas poser la nouvelle contrainte
--  avant d'avoir retiré l'ancienne, qui interdit précisément la
--  valeur qu'on ajoute.
-- ------------------------------------------------------------
alter table public.reponses_libres
  drop constraint if exists reponses_libres_statut_check;

alter table public.reponses_libres
  add constraint reponses_libres_statut_check
  check (statut in ('en_attente', 'en_cours', 'corrige', 'signale', 'partage'));

comment on column public.reponses_libres.statut is
  'Cycle de vie d''une copie : en_attente → en_cours → corrige (ou signale). '
  '« partage » est à part : une réponse personnelle, lue par le professeur, '
  'jamais corrigée, jamais notée — elle ne traverse pas ce cycle.';


-- ------------------------------------------------------------
--  2. Les deux policies d'écriture de l'élève
--
--  Elles disaient `statut = 'en_attente'`, et c'était juste tant
--  qu'il n'y avait qu'une façon d'écrire. Elles disent maintenant
--  « l'un des deux statuts que l'élève a le droit de poser ».
--
--  Ce qu'elles continuent d'interdire, et c'est l'essentiel : se
--  déclarer 'corrige', ou écrire soi-même dans `correction_ia` et
--  `commentaire_prof`. Un élève ne se corrige pas.
--
--  Le reste du fichier 006 est inchangé : on ne retouche que ces
--  deux policies, à l'identique pour le reste de leur texte.
-- ------------------------------------------------------------
drop policy if exists reponses_envoyer on public.reponses_libres;
create policy reponses_envoyer
  on public.reponses_libres for insert to authenticated
  with check (
    eleve_id = (select public.eleve_courant())
    and statut in ('en_attente', 'partage')
    and correction_ia is null
    and commentaire_prof is null
  );

drop policy if exists reponses_reecrire on public.reponses_libres;
create policy reponses_reecrire
  on public.reponses_libres for update to authenticated
  using (eleve_id = (select public.eleve_courant()))
  with check (
    eleve_id = (select public.eleve_courant())
    and statut in ('en_attente', 'partage')
    and correction_ia is null
    and commentaire_prof is null
  );


-- ------------------------------------------------------------
--  3. Le déclencheur d'archivage doit cesser de tout ramener à
--     « en_attente »
--
--  🔴 C'est le piège de ce fichier, et il est silencieux.
--  `archive_version_reponse()` (005, redéfini en 006) remet
--  `statut = 'en_attente'` dès que le TEXTE change. Sans la
--  correction ci-dessous, un élève qui rectifie son enquête verrait
--  sa réponse personnelle basculer toute seule dans la file de
--  correction et sous le worker IA — sans erreur, sans message,
--  et sans que personne ne s'en aperçoive avant de trouver une
--  anecdote de grand-mère au milieu des copies à corriger.
--
--  La règle : un partage reste un partage. Tout le reste repart à
--  zéro comme avant, et pour la même raison — un nouveau texte
--  mérite une nouvelle relecture.
--
--  On reprend la définition de 006 telle quelle (security definer +
--  search_path vide), on ne change QUE la ligne du statut.
-- ------------------------------------------------------------
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
    --  la seule ligne qui change par rapport au fichier 006
    new.statut           = case when new.statut = 'partage'
                                then 'partage'
                                else 'en_attente' end;
    new.correction_ia    = null;
    new.commentaire_prof = null;
    new.envoye_le        = now();
    new.corrige_le       = null;
  end if;
  return new;
end;
$$;

--  Le déclencheur lui-même n'a pas bougé : il pointe sur la
--  fonction par son nom, et `create or replace` a remplacé le
--  corps sous ses pieds. On le repose quand même, pour que le
--  fichier reste vrai s'il est joué sur une base neuve.
drop trigger if exists reponses_archivage on public.reponses_libres;
create trigger reponses_archivage
  before update on public.reponses_libres
  for each row execute function public.archive_version_reponse();


-- ------------------------------------------------------------
--  4. Vérification — à lancer juste après
-- ------------------------------------------------------------

--  a) la contrainte accepte bien les cinq valeurs
select conname, pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid = 'public.reponses_libres'::regclass
  and conname = 'reponses_libres_statut_check';

--  b) les deux policies d'écriture citent bien les deux statuts
select policyname, cmd, with_check
from pg_policies
where schemaname = 'public' and tablename = 'reponses_libres'
order by policyname;

--  c) la fonction d'archivage est toujours en security definer,
--     search_path vide, et contient désormais le mot « partage »
select p.proname,
       p.prosecdef                        as security_definer,
       coalesce(p.proconfig::text, '—')   as config,
       position('partage' in p.prosrc) > 0 as preserve_le_partage
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname = 'archive_version_reponse';

--  d) l'index partiel du worker n'a PAS bougé : il ne doit viser
--     que 'en_attente', sinon les partages entreraient dans la file
select indexname, indexdef
from pg_indexes
where schemaname = 'public' and indexname = 'reponses_a_corriger';

--  e) l'état des lieux, une ligne par statut
select statut, count(*) as copies
from public.reponses_libres
group by statut
order by statut;
