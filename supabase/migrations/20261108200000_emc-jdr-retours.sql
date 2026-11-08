-- ============================================================
--  035 — EMC, jeu de rôle : les retours de Loïc après son essai
--        du 08/11/2026
--
--  BESOIN (Loïc, essai du jeu de rôle)
--  · Les NOTES de l'échange sont montrées au binôme à l'étape 5 :
--    il relit ce qu'on a noté de lui et donne ses feux en
--    connaissance de cause. (Avant : elles ne quittaient jamais
--    l'iPad, décision du brief v2.)
--  · Durées : accueil 10, consignes 5, questions 10, échange 15.
--  · Consignes plus visuelles (émoji, gras) ; l'exemple de Pierre
--    Marchand en trois temps : questions, réponses notées, portrait.
--
--  CE QUE FAIT CE FICHIER
--    §1  emc_jdr_notes : les notes d'un élève, lisibles de LUI et de
--        SON BINÔME seulement — PAS des enseignants (aucune policy
--        prof). Écrites à partir de l'étape 5, effacées à l'étape 8
--        par la tablette, et à la clôture / remise à zéro par la base.
--    §2  emc_cloturer, emc_reinitialiser : effacent aussi ces notes.
--    §3  contenus : durées, consignes, exemple, échange de 15 min —
--        seulement là où le contenu est encore celui du 034.
--    §4  restitution : ateliers choisis dans une liste, expression
--        libre (colonne emc_restit.expression), son nuage.
--
--  RGPD
--  · Les notes parlent de la famille, des peurs… Elles ne vivent en
--    base que de l'étape 5 à l'étape 8 (quelques dizaines de minutes),
--    pour une seule autre personne : celle qu'elles décrivent.
--
--  Rejouable. Banc : _outils/tests/emc-schema.test.mjs (§17)
-- ============================================================


-- ------------------------------------------------------------
--  1. Les notes, pour le binôme seulement
-- ------------------------------------------------------------
create table if not exists public.emc_jdr_notes (
  classe_id uuid not null references public.classes (id) on delete cascade,
  eleve_id  uuid not null references public.eleves (id)  on delete cascade,
  notes     jsonb not null default '{}'::jsonb
    check (jsonb_typeof(notes) = 'object' and char_length(notes::text) <= 8000),
  maj_le    timestamptz not null default now(),
  primary key (classe_id, eleve_id)
);
comment on table public.emc_jdr_notes is
  'EMC, jeu de rôle : les notes d''un élève sur son binôme ({ "numéro de question": "note" }). Lisibles de l''auteur et de son binôme SEULEMENT (pas des enseignants). Écrites à partir de l''étape 5, effacées à l''étape 8 et à la clôture.';

drop trigger if exists emc_jdr_notes_toucher on public.emc_jdr_notes;
create trigger emc_jdr_notes_toucher before insert or update on public.emc_jdr_notes
  for each row execute function public.emc_toucher();

alter table public.emc_jdr_notes enable row level security;
drop policy if exists emc_jdr_notes_lire    on public.emc_jdr_notes;
drop policy if exists emc_jdr_notes_ecrire  on public.emc_jdr_notes;
drop policy if exists emc_jdr_notes_changer on public.emc_jdr_notes;
drop policy if exists emc_jdr_notes_effacer on public.emc_jdr_notes;
--  🔴 Pas de policy pour les enseignants : ils ne lisent pas les notes.
create policy emc_jdr_notes_lire on public.emc_jdr_notes
  for select to authenticated
  using (eleve_id = (select public.eleve_courant())
         or exists (select 1 from public.emc_binomes b
                     where b.classe_id = emc_jdr_notes.classe_id and b.eleve_id = emc_jdr_notes.eleve_id
                       and b.binome = (select public.emc_mon_binome(emc_jdr_notes.classe_id))));
create policy emc_jdr_notes_ecrire on public.emc_jdr_notes
  for insert to authenticated
  with check (eleve_id = (select public.eleve_courant())
              and (select public.emc_participe(classe_id))
              and (select public.emc_module(classe_id)) = 'accueil'
              and (select public.emc_etape(classe_id)) between 5 and 7);
create policy emc_jdr_notes_changer on public.emc_jdr_notes
  for update to authenticated
  using (eleve_id = (select public.eleve_courant()))
  with check (eleve_id = (select public.eleve_courant())
              and (select public.emc_etape(classe_id)) between 5 and 7);
create policy emc_jdr_notes_effacer on public.emc_jdr_notes
  for delete to authenticated
  using (eleve_id = (select public.eleve_courant()));

revoke all on table public.emc_jdr_notes from anon, authenticated;
grant select, insert, delete on table public.emc_jdr_notes to authenticated;
grant update (classe_id, eleve_id, notes) on table public.emc_jdr_notes to authenticated;


-- ------------------------------------------------------------
--  2. Clôture et remise à zéro effacent aussi les notes
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
  delete from public.emc_jdr_notes n where n.classe_id = p_classe;
  update public.emc_seances s set cloturee_le = now() where s.classe_id = p_classe;
  return v_n;
end;
$$;

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
  delete from public.emc_jdr_notes    where classe_id = p_classe;
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

revoke all on function public.emc_cloturer(uuid)      from public, anon, authenticated;
revoke all on function public.emc_reinitialiser(uuid) from public, anon, authenticated;
grant execute on function public.emc_cloturer(uuid)      to authenticated;
grant execute on function public.emc_reinitialiser(uuid) to authenticated;


-- ------------------------------------------------------------
--  3. Contenus — seulement s'ils sont encore ceux du 034
-- ------------------------------------------------------------
--  Durées : accueil 10, consignes 5, questions 10, échange 15,
--  présentations 30 ; une étape de plus avant la clôture : la
--  liberté, pour moi, sur une fiche papier (l'aller d'une boucle dont
--  le retour est « Ma définition », à la restitution du vendredi).
update public.emc_contenus c
   set valeur = $j$[
  {"n":0,"titre":"Accueil et connexion","duree":10},
  {"n":1,"titre":"Les consignes","duree":5},
  {"n":2,"titre":"Trouve ton binôme","duree":5},
  {"n":3,"titre":"Choisis tes questions","duree":10},
  {"n":4,"titre":"L'échange","duree":15},
  {"n":5,"titre":"Feu vert, feu rouge","duree":5},
  {"n":6,"titre":"Les présentations","duree":30},
  {"n":7,"titre":"Portrait mystère","duree":10},
  {"n":8,"titre":"La liberté, pour moi","duree":5},
  {"n":9,"titre":"Clôture","duree":5}
]$j$::jsonb
 where c.cle = 'etapes_accueil'
   and c.valeur = $j$[
  {"n":0,"titre":"Accueil et connexion","duree":15},
  {"n":1,"titre":"Les consignes","duree":10},
  {"n":2,"titre":"Trouve ton binôme","duree":5},
  {"n":3,"titre":"Choisis tes questions","duree":5},
  {"n":4,"titre":"L'échange","duree":10},
  {"n":5,"titre":"Feu vert, feu rouge","duree":5},
  {"n":6,"titre":"Les présentations","duree":35},
  {"n":7,"titre":"Portrait mystère","duree":10},
  {"n":8,"titre":"Clôture","duree":5}
]$j$::jsonb;

--  L'échange : 15 minutes.
update public.emc_contenus c set valeur = jsonb_set(c.valeur, '{echange_minutes}', '15')
 where c.cle = 'jdr' and c.valeur -> 'echange_minutes' = '10'::jsonb;

--  Les consignes : un émoji, du gras (**…**), une couleur par carte
--  (la couleur vient de la page). Seulement si ce sont celles du 034.
update public.emc_contenus c set valeur = jsonb_set(c.valeur, '{consignes}', $j$[
  "👥 Tu formes un **binôme** avec un ou une élève d'**une autre classe**, que tu ne connais pas.",
  "❓ Chacun choisit **6 à 8 questions** dans la fiche-guide, avec **au moins une par thème**. « Prénom, nom » est obligatoire, en plus.",
  "🗣️ Pendant **15 minutes**, vous vous interrogez **à tour de rôle**. Tu notes les réponses sur ta tablette (seul ton binôme verra tes notes).",
  "🚦 Ton binôme relit tes notes et te dit ce que tu peux raconter (**feu vert**) et ce qui reste entre vous (**feu rouge**).",
  "🎤 Tu présentes ton binôme devant le groupe, **à la première personne** : « **Je m'appelle…** ». Environ **1 minute**.",
  "📖 Un **petit récit** qui s'enchaîne, pas une liste de questions-réponses !"
]$j$::jsonb)
 where c.cle = 'jdr'
   and c.valeur -> 'consignes' ->> 0 = 'Tu vas former un binôme avec un ou une élève d''une autre classe, que tu ne connais pas.';

-- ------------------------------------------------------------
--  4. Restitution (retours de Loïc, 08/11)
--  · Les élèves CHOISISSENT leurs ateliers dans une liste
--    (enseignants et salle, pour s'y retrouver), puis ajoutent le
--    nom, un mot-clé, la liberté. 🔴 La liste (noms des collègues)
--    n'est PAS dans ce fichier (dépôt public) : elle se règle au
--    tableau de bord, Contenus → Restitution → Ateliers.
--  · Une expression libre (un mot, une phrase) à la clôture, et son
--    nuage.
-- ------------------------------------------------------------
alter table public.emc_restit add column if not exists expression text;
alter table public.emc_restit drop constraint if exists emc_restit_expression_taille;
alter table public.emc_restit add constraint emc_restit_expression_taille
  check (expression is null or char_length(btrim(expression)) between 1 and 120);
grant update (classe_id, eleve_id, parcours, mot, expression) on table public.emc_restit to authenticated;

update public.emc_contenus c set valeur = c.valeur
    || jsonb_build_object('ateliers', coalesce(c.valeur -> 'ateliers', '[]'::jsonb))
    || jsonb_build_object('expression_question', coalesce(c.valeur -> 'expression_question',
         '"Ces deux jours, en un mot ou une phrase : ce que tu retiens, ce que tu ressens, ce que tu veux dire."'::jsonb))
    || jsonb_build_object('parcours_consigne', case
         when c.valeur ->> 'parcours_consigne' = 'Écris les ateliers que tu as faits (un nom court, comme tu t''en souviens). Pour chacun : un mot-clé, et la liberté qui y était en jeu.'
         then '"Choisis les ateliers que tu as faits (repère-toi aux enseignants et à la salle). Pour chacun : un mot-clé, et la liberté qui y était en jeu."'::jsonb
         else c.valeur -> 'parcours_consigne' end)
 where c.cle = 'restitution';

--  Le déroulé de la restitution : par atelier 5 min, le mur 30, une
--  ANALYSE DU MUR en classe entière (nouvelle), puis la définition,
--  l'expression libre. Seulement s'il est encore celui du 034.
update public.emc_contenus c set valeur = $j$[
  {"n":0,"titre":"Connexion et retour","duree":5},
  {"n":1,"titre":"La météo des deux jours","duree":5},
  {"n":2,"titre":"Mon parcours","duree":5},
  {"n":3,"titre":"Par atelier","duree":5},
  {"n":4,"titre":"Nos libertés : le mur","duree":30},
  {"n":5,"titre":"Analyse du mur, tous ensemble","duree":10},
  {"n":6,"titre":"Ma définition","duree":10},
  {"n":7,"titre":"Expression libre et clôture","duree":5}
]$j$::jsonb
 where c.cle = 'etapes_restitution'
   and c.valeur = $j$[
  {"n":0,"titre":"Connexion et retour","duree":5},
  {"n":1,"titre":"La météo des deux jours","duree":5},
  {"n":2,"titre":"Mon parcours","duree":10},
  {"n":3,"titre":"Par atelier","duree":15},
  {"n":4,"titre":"Nos libertés : le mur","duree":25},
  {"n":5,"titre":"Ma définition","duree":10},
  {"n":6,"titre":"Clôture","duree":5}
]$j$::jsonb;

update public.emc_contenus c set valeur = c.valeur
    || jsonb_build_object('analyse_consigne', coalesce(c.valeur -> 'analyse_consigne',
         '"Tous les post-it, rangés par colonne. Quelles libertés reviennent d''un atelier à l''autre ? Lesquelles se heurtent ? Qu''est-ce qui vous surprend ?"'::jsonb))
    || jsonb_build_object('mur_consigne', case
         when c.valeur ->> 'mur_consigne' = 'Postez vos post-it dans la colonne de votre groupe : ce que vous avez fait, ce que vous avez appris, la liberté en jeu. Puis 1 minute à l''oral par groupe.'
         then '"Avec ton groupe, remplissez les trois colonnes : ce que vous avez fait, ce que vous avez appris, la liberté en jeu. Un post-it par idée. Puis 1 minute à l''oral par groupe."'::jsonb
         else c.valeur -> 'mur_consigne' end)
 where c.cle = 'restitution';

--  Le jeu de rôle : le texte de l'étape « La liberté, pour moi ».
update public.emc_contenus c set valeur = c.valeur
    || jsonb_build_object('liberte_fiche', coalesce(c.valeur -> 'liberte_fiche',
         '"Prends la fiche qu''on te distribue. Écris ce qu''est pour toi la liberté : un mot, une phrase, un exemple. Vendredi, on y reviendra."'::jsonb))
 where c.cle = 'jdr';

--  L'exemple : on ajoute les réponses notées (en mots-clés, comme un
--  élève les prend), si elles n'y sont pas encore.
update public.emc_contenus c set valeur = jsonb_set(c.valeur, '{exemple,reponses}', $j$[
  {"q":2,"r":"Grande sœur, Léa. Disputes pour la salle de bains le matin… mais c'est elle qu'il appelle quand ça ne va pas."},
  {"q":9,"r":"On peut compter sur lui. A toujours une 2e calculatrice !"},
  {"q":15,"r":"Les lasagnes de sa grand-mère, surtout le coin un peu brûlé."},
  {"q":17,"r":"Le mercredi : handball l'après-midi."},
  {"q":22,"r":"Les araignées, même toutes petites → il sort de la pièce."},
  {"q":27,"r":"Le piano, pour rejouer les musiques de films."}
]$j$::jsonb)
 where c.cle = 'jdr' and c.valeur ? 'exemple' and not (c.valeur -> 'exemple' ? 'reponses');
