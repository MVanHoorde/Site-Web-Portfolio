-- ============================================================
--  039 — EMC : les retours de l'essai en établissement (11/11/2026)
--
--  BESOIN
--  · Jeu de rôle : la consigne annonce « 15 minutes » d'échange,
--    mais l'étape dure 20 minutes (036) et le chrono compte 20. On
--    garde 20 min, en deux tours de 10 : l'écran et les tablettes
--    affichent le tour en cours et « On change ! » à la bascule.
--  · Labyrinthe, étape 5 : la vidéo de la MAE (« À plusieurs, on est
--    plus fort… ») passe en premier, avec son MP4 sur le OneDrive
--    (YouTube est bloqué au lycée, et la collègue n'a pas de compte).
--
--  CE QUE FAIT CE FICHIER
--    §1  la consigne de l'échange, seulement si c'est encore celle
--        du 035 (un texte retouché au tableau de bord est gardé) ;
--    §2  les vidéos : la MAE en tête, son MP4 posé s'il n'y en a
--        pas encore (un lien réglé au tableau de bord est gardé).
--
--  Rejouable. Banc : _outils/tests/emc-schema.test.mjs (§19)
-- ============================================================


-- ------------------------------------------------------------
--  1. Jeu de rôle : 20 minutes, 10 chacun
-- ------------------------------------------------------------
update public.emc_contenus c
   set valeur = jsonb_set(c.valeur, '{consignes}', (
     select jsonb_agg(
       case when t #>> '{}' = '🗣️ Pendant **15 minutes**, vous vous interrogez **à tour de rôle**. Tu notes les réponses sur ta tablette (seul ton binôme verra tes notes).'
            then to_jsonb('🗣️ Pendant **20 minutes**, vous vous interrogez **à tour de rôle** : **10 minutes chacun**. Le signal « On change ! » s''affiche sur ta tablette et au tableau. Tu notes les réponses sur ta tablette (seul ton binôme verra tes notes).'::text)
            else t end
       order by o)
       from jsonb_array_elements(c.valeur -> 'consignes') with ordinality as x(t, o)))
 where c.cle = 'jdr' and jsonb_typeof(c.valeur -> 'consignes') = 'array';


-- ------------------------------------------------------------
--  2. Vidéos : la MAE d'abord, avec son MP4
-- ------------------------------------------------------------
update public.emc_contenus c
   set valeur = (
     select jsonb_agg(
       case when v ->> 'lien' like '%WoVTJcw6tkE%' and coalesce(v ->> 'mp4', '') = ''
            then v || jsonb_build_object('mp4', 'https://isaacetoile-my.sharepoint.com/:v:/g/personal/l_vanhoorde_enseignant_isaac-etoile_fr/IQAoxpN7DWDvRKGqFAZmLCF1Aad9nKcVCd_LzagmfX3fQOo?e=KSUS72')
            else v end
       order by case when v ->> 'lien' like '%WoVTJcw6tkE%' then 0 else 1 end, o)
       from jsonb_array_elements(c.valeur) with ordinality as x(v, o))
 where c.cle = 'videos' and jsonb_typeof(c.valeur) = 'array' and jsonb_array_length(c.valeur) > 0;


-- Vérification
-- select valeur -> 'consignes' -> 2 from public.emc_contenus where cle = 'jdr';
-- select v ->> 'titre', v ->> 'mp4' from public.emc_contenus, jsonb_array_elements(valeur) v where cle = 'videos';
