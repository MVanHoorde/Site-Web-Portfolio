-- ============================================================
--  027 — Les réponses types des collègues
--
--  BESOIN (Loïc, 16/10/2026)
--  Sur une question, voir les réponses types que les collègues
--  ont gardées pour cette même question, et en reprendre une dans
--  sa propre bibliothèque. Partage dans les deux sens : chacun
--  voit celles des autres.
--
--  ARBITRAGES DE LOÏC
--  · On ne corrige pas directement avec la phrase d'un collègue :
--    on la GARDE d'abord chez soi (avec sa décision), puis on
--    l'utilise comme les siennes. Sa bibliothèque reste la sienne,
--    triée par ses usages à lui.
--  · Lecture seule. Personne ne modifie ni ne supprime la phrase
--    d'un autre : la policy modeles_les_miens (011) reste intacte.
--
--  POURQUOI UNE FONCTION ET PAS UNE POLICY
--  Ouvrir la lecture de la table aux enseignants exposerait aussi
--  auth_id. La fonction rend le texte, la décision et le nom du
--  collègue (enseignants.libelle, déjà vu par tous dans le
--  tableau de bord) — rien d'autre.
--
--  RGPD : aucune donnée d'élève. Une réponse type est un contenu
--  pédagogique (commentaire de la table, 011).
--
--  Purement additif. Rejouable.
-- ============================================================

create or replace function public.modeles_collegues(p_code text)
returns table (texte text, decision text, auteur text, usages integer)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.est_enseignant() then
    raise exception 'Action réservée au professeur.'
      using errcode = '42501';
  end if;
  return query
    select m.texte, m.decision, coalesce(e.libelle, 'Collègue'), m.usages
      from public.modeles_correction m
      left join public.enseignants e on e.auth_id = m.auth_id
     where m.code_activite = p_code
       and m.auth_id <> (select auth.uid())
       /* une phrase que j'ai déjà gardée ne m'est pas reproposée —
          à la casse et aux espaces près (« disque dur ? » / « disque dur? ») */
       and not exists (
         select 1 from public.modeles_correction x
          where x.auth_id = (select auth.uid())
            and x.code_activite = m.code_activite
            and lower(regexp_replace(x.texte, '\s', '', 'g'))
              = lower(regexp_replace(m.texte, '\s', '', 'g')))
     order by m.usages desc, m.cree_le desc;
end;
$$;

comment on function public.modeles_collegues(text) is
  'Réponses types des autres enseignants pour une question : texte, décision, nom du collègue. Lecture seule.';

revoke all on function public.modeles_collegues(text) from public, anon;
grant execute on function public.modeles_collegues(text) to authenticated;
