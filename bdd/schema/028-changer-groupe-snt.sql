-- ============================================================
--  028-changer-groupe-snt.sql — un élève change de groupe de SNT
--  ------------------------------------------------------------
--  POURQUOI (17/10/2026)
--  Loïc a remplacé un collègue : ses groupes B (2.2) et E (2.5)
--  ont accueilli les élèves de 2.1 et de 2.6, et comptent 55 et
--  49 élèves. Un nouveau collègue reprend ces élèves dans les
--  groupes A (2.1) et F (2.6). Les dates de création des comptes
--  ne suffisent pas à les trier (45 comptes de E créés le même
--  jeudi à 13 h) : c'est l'élève qui sait où il va.
--
--  Or `rejoindre_autre_classe()` (018) refuse un second groupe de
--  SNT, et il a raison : le plafond d'avance et le tableau de bord
--  supposent un seul groupe par élève. D'où un geste distinct, qui
--  REMPLACE le groupe au lieu d'en ajouter un.
--
--  CE QUE FAIT LA FONCTION
--   · l'élève connecté tape le code de son nouveau groupe ;
--   · son appartenance à l'ancien groupe de SNT est remplacée par
--     le nouveau. Si l'ancien groupe était sa classe d'inscription
--     (`eleves.classe_id`), c'est celle-ci qui change, et le
--     déclencheur `tenir_classe_inscription` (018) suit ;
--   · rien d'autre ne bouge : progression, copies, corrections,
--     absences sont rattachées à l'élève, pas au groupe. Le nouvel
--     enseignant les voit, l'ancien ne les voit plus ;
--   · les classes hors SNT (physique, ES, CFA…) sont intactes.
--
--  CE QU'ELLE NE FAIT PAS
--   · elle n'inscrit pas un élève sans groupe de SNT : c'est le
--     travail de `rejoindre_autre_classe()`, qu'elle renvoie ;
--   · elle ne révèle rien du nouveau groupe que son libellé, comme
--     `rejoindre_autre_classe()`. Connaître le code suffit, comme
--     pour rejoindre : c'est le secret que donne l'enseignant.
--
--  Purement additif. REJOUABLE : `create or replace`.
-- ============================================================

create or replace function public.changer_groupe_snt(p_code text)
returns json
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_eleve       uuid;
  v_inscription uuid;
  v_ancien      uuid;
  v_ancien_lib  text;
  v_classe      uuid;
  v_espace      text;
  v_libelle     text;
begin
  if (select auth.uid()) is null then
    raise exception 'AUCUNE_SESSION'
      using hint = 'Aucune session : se connecter avant.';
  end if;

  select e.id, e.classe_id into v_eleve, v_inscription
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

  if v_espace <> 'snt' then
    raise exception 'PAS_UN_GROUPE_SNT'
      using hint = 'Ce code n''est pas celui d''un groupe de SNT : passer par rejoindre_autre_classe().';
  end if;

  select ap.classe_id, c.libelle into v_ancien, v_ancien_lib
    from public.eleves_classes ap
    join public.classes c on c.id = ap.classe_id
   where ap.eleve_id = v_eleve and c.espace = 'snt'
   order by ap.rejoint_le
   limit 1;

  if v_ancien is null then
    raise exception 'AUCUN_GROUPE_SNT'
      using hint = 'Pas encore de groupe de SNT : passer par rejoindre_autre_classe().';
  end if;

  if v_ancien = v_classe then
    return json_build_object('de', v_ancien_lib, 'vers', v_libelle, 'change', false);
  end if;

  if v_inscription = v_ancien then
    -- Le déclencheur retire l'ancienne appartenance et pose la nouvelle.
    update public.eleves set classe_id = v_classe where id = v_eleve;
  else
    delete from public.eleves_classes
     where eleve_id = v_eleve and classe_id = v_ancien;
    insert into public.eleves_classes (eleve_id, classe_id)
    values (v_eleve, v_classe)
    on conflict do nothing;
  end if;

  -- Un élève inscrit par erreur dans deux groupes de SNT n'en garde qu'un.
  delete from public.eleves_classes ap
   using public.classes c
   where c.id = ap.classe_id and c.espace = 'snt'
     and ap.eleve_id = v_eleve and ap.classe_id <> v_classe;

  return json_build_object('de', v_ancien_lib, 'vers', v_libelle, 'change', true);
end;
$$;

comment on function public.changer_groupe_snt is
  'L''élève connecté quitte son groupe de SNT pour celui du code. Son travail le suit ; ses classes hors SNT sont intactes.';

revoke all on function public.changer_groupe_snt(text) from public, anon, authenticated;
grant execute on function public.changer_groupe_snt(text) to authenticated;
