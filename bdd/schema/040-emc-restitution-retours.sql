-- ============================================================
--  040 — EMC : la restitution, après les séances du jeudi 12/11
--
--  BESOIN (Loïc, 12/11/2026)
--  · L'analyse du mur « tous ensemble » ne sert pas : elle part, et
--    son temps va au mur (réflexion, écriture, puis passage de
--    chaque groupe au tableau). 7 étapes au lieu de 8, toujours
--    75 min.
--  · Mon parcours : 3 ou 4 ateliers, chacun une fois, rangés du
--    préféré au moins aimé ; la projection montre les CONSIGNES (le
--    classement des ateliers reste au pilotage, pour nous).
--  · Ma définition : elle s'écrit SUR LE LIVRET papier (pas sur le
--    site) ; une nouvelle, nourrie des ateliers, sans recopier celle
--    du début. Seule la consigne s'affiche (tableau et tablette).
--  · La fin devient un RETOUR COMPLET sur les deux jours, anonyme :
--    ressenti, ce qu'on a appris, propositions ; chaque atelier
--    fait ; le jeu de rôle du début ; cette restitution. Puis
--    l'expression libre.
--
--  CE QUE FAIT CE FICHIER
--    §1  le déroulé en 7 étapes, seulement s'il est encore celui du
--        035 (un déroulé retouché au tableau de bord est gardé) ;
--    §2  les textes de la restitution : les nouveaux sont ajoutés
--        s'ils manquent ; ceux qui changent ne sont remplacés que
--        s'ils sont encore ceux d'origine ; l'analyse du mur part ;
--    §3  l'enquête anonyme s'ouvre à la DERNIÈRE étape du module :
--        7 pour le Labyrinthe (inchangé), 6 pour la restitution ; le
--        retour de la restitution, plus long, a droit à 16 Ko.
--
--  Rejouable. Banc : _outils/tests/emc-schema.test.mjs (§20)
--  Ordre de publication : ce fichier, PUIS le site.
-- ============================================================


-- ------------------------------------------------------------
--  1. Le déroulé : 7 étapes, 75 min
-- ------------------------------------------------------------
update public.emc_contenus c set valeur = $j$[
  {"n":0,"titre":"Connexion et retour","duree":5},
  {"n":1,"titre":"La météo des deux jours","duree":5},
  {"n":2,"titre":"Mon parcours","duree":5},
  {"n":3,"titre":"Par atelier","duree":5},
  {"n":4,"titre":"Nos libertés : le mur","duree":35},
  {"n":5,"titre":"Ma définition","duree":10},
  {"n":6,"titre":"Retour sur les deux jours","duree":10}
]$j$::jsonb
 where c.cle = 'etapes_restitution'
   and c.valeur = $j$[
  {"n":0,"titre":"Connexion et retour","duree":5},
  {"n":1,"titre":"La météo des deux jours","duree":5},
  {"n":2,"titre":"Mon parcours","duree":5},
  {"n":3,"titre":"Par atelier","duree":5},
  {"n":4,"titre":"Nos libertés : le mur","duree":30},
  {"n":5,"titre":"Analyse du mur, tous ensemble","duree":10},
  {"n":6,"titre":"Ma définition","duree":10},
  {"n":7,"titre":"Expression libre et clôture","duree":5}
]$j$::jsonb;


-- ------------------------------------------------------------
--  2. Les textes de la restitution
-- ------------------------------------------------------------
update public.emc_contenus c set valeur = (c.valeur - 'analyse_consigne')
    || jsonb_build_object('parcours_min', coalesce(c.valeur -> 'parcours_min', '3'::jsonb))
    || jsonb_build_object('parcours_max', case
         when c.valeur -> 'parcours_max' is null or c.valeur -> 'parcours_max' = '6'::jsonb then '4'::jsonb
         else c.valeur -> 'parcours_max' end)
    || jsonb_build_object('parcours_consigne', case
         when c.valeur ->> 'parcours_consigne' = 'Choisis les ateliers que tu as faits (repère-toi aux enseignants et à la salle). Pour chacun : un mot-clé, et la liberté qui y était en jeu.'
         then '"Choisis les ateliers que tu as faits (repère-toi aux enseignants et à la salle), **du préféré (1) au moins aimé**. **3 ou 4 ateliers**, chacun une seule fois. Pour chacun : un mot-clé, et la liberté qui y était en jeu."'::jsonb
         else c.valeur -> 'parcours_consigne' end)
    || jsonb_build_object('parcours_projection', coalesce(c.valeur -> 'parcours_projection', $j$[
         "📝 Indique **tes 4 ateliers** (3 si tu en as manqué un), **dans l'ordre de préférence** : 1 = celui que tu as préféré.",
         "🔑 Pour chacun : **un mot-clé**, et **la liberté** qui y était en jeu.",
         "🧩 Ensuite, on forme **un groupe par atelier** : chacun va dans un atelier qu'il a fait, **le plus haut possible dans son classement**.",
         "🎲 Si trop d'élèves ont mis le même atelier en premier, un **tirage au sort** envoie les autres vers **l'atelier suivant de leur liste**."
       ]$j$::jsonb))
    || jsonb_build_object('groupe_consigne', case
         when c.valeur ->> 'groupe_consigne' = 'Retrouve ton groupe : vous avez fait le même atelier. Préparez ensemble : ce qu''on a fait, ce qu''on a appris, quelle liberté était en jeu.'
         then '"Va à la table de ton atelier : vous l''avez tous fait. Préparez ensemble : ce qu''on a fait, ce qu''on a appris, quelle liberté était en jeu."'::jsonb
         else c.valeur -> 'groupe_consigne' end)
    || jsonb_build_object('mur_consigne', case
         when c.valeur ->> 'mur_consigne' = 'Avec ton groupe, remplissez les trois colonnes : ce que vous avez fait, ce que vous avez appris, la liberté en jeu. Un post-it par idée. Puis 1 minute à l''oral par groupe.'
         then '"Avec ton groupe, **prenez le temps d''y réfléchir**, puis remplissez les trois colonnes : ce que vous avez fait, ce que vous avez appris, la liberté en jeu. Un post-it par idée. Ensuite, chaque groupe présente son atelier au tableau, **couleur par couleur** : 1 minute."'::jsonb
         else c.valeur -> 'mur_consigne' end)
    || jsonb_build_object('definition_consigne', coalesce(c.valeur -> 'definition_consigne',
         '"📖 **Sur ton livret** : au début des deux jours, tu y as écrit une définition de la liberté. Écris maintenant une **toute nouvelle** définition, nourrie des ateliers que tu as faits. **Ne recopie pas** la première."'::jsonb))
    || jsonb_build_object('retour', coalesce(c.valeur -> 'retour', $j${
         "intro": "Ton avis nous sert à améliorer ces deux jours pour les prochaines secondes. Sois honnête : c'est anonyme.",
         "global_titre": "Ces deux jours",
         "ressenti_question": "Globalement, comment as-tu vécu ces deux jours ?",
         "appris_question": "As-tu appris des choses ?",
         "proposition_question": "Une proposition pour améliorer ces deux jours ?",
         "ateliers_titre": "Tes ateliers",
         "atelier_note": "Ton avis sur cet atelier",
         "atelier_sert": "Est-ce que ça sert ?",
         "atelier_compris": "As-tu compris pourquoi tu l'as fait ?",
         "atelier_texte": "Un ressenti, une idée (facultatif)",
         "jdr_titre": "Le jeu de rôle du début, « Je m'appelle… »",
         "restit_titre": "Cette séance de restitution",
         "texte_question": "Un mot, une idée (facultatif)"
       }$j$::jsonb))
 where c.cle = 'restitution';


-- ------------------------------------------------------------
--  3. L'enquête anonyme : à la dernière étape du module
--
--  Même fonction qu'au 031 : seules changent l'étape d'ouverture et
--  la taille permise. Toujours ni élève, ni heure, ni « a déjà
--  répondu » ; le plafond reste le nombre de participants.
-- ------------------------------------------------------------
create or replace function public.emc_repondre_enquete(p_classe uuid, p_reponses jsonb, p_temoignage text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_restit boolean := public.emc_module(p_classe) = 'restitution';
begin
  if not public.emc_participe(p_classe) then
    raise exception 'PAS_DANS_LA_SEANCE';
  end if;
  if public.emc_etape(p_classe) is distinct from (case when v_restit then 6 else 7 end) then
    raise exception 'ENQUETE_FERMEE' using hint = 'L''enquête s''ouvre à la dernière étape.';
  end if;
  if p_reponses is null or jsonb_typeof(p_reponses) <> 'object'
     or pg_column_size(p_reponses) > (case when v_restit then 16384 else 4096 end) then
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
  'EMC : seule porte d''écriture de emc_enquete. Ne garde aucune trace de l''auteur. Ouverte à la dernière étape du module (7 Labyrinthe, 6 restitution).';
