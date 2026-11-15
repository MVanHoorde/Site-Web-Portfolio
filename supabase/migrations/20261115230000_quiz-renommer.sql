-- ============================================================
--  048 — Diapason : changer de nom sans devenir un autre joueur
--
--  BESOIN (Loïc, 15/11/2026)
--  « Ce n'est pas mon nom » faisait quitter la partie puis la
--  rejoindre sous un autre pseudo : l'ancien restait inscrit, et la
--  classe comptait un concurrent de trop. L'élève garde désormais son
--  jeton et change seulement de pseudonyme.
--
--  🔴 PUREMENT ADDITIF : une fonction neuve, quiz_renommer. Rien
--  d'autre n'est touché. Suppose 047 en place.
--  Rejouable (create or replace). Banc : _outils/tests/quiz-base.py.
-- ============================================================

create or replace function public.quiz_renommer(p_jeton uuid, p_pseudo text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_pseudo text := regexp_replace(btrim(coalesce(p_pseudo, '')), '\s+', ' ', 'g');
  j public.quiz_joueurs%rowtype;
begin
  if v_pseudo ~ '[[:cntrl:]<>]' or v_pseudo like '#%' then raise exception 'QUIZ_PSEUDO_INVALIDE'; end if;
  if length(v_pseudo) < 2 or length(v_pseudo) > 24 then raise exception 'QUIZ_PSEUDO_LONGUEUR'; end if;
  select * into j from public.quiz_joueurs where jeton = p_jeton;
  if not found then raise exception 'QUIZ_EXCLU'; end if;
  begin
    update public.quiz_joueurs set pseudo = v_pseudo where id = j.id;
  exception when unique_violation then
    raise exception 'QUIZ_PSEUDO_PRIS';
  end;
  -- les téléphones et l'écran projeté relisent l'état
  update public.quiz_parties set version = version + 1 where id = j.partie_id;
  return jsonb_build_object('pseudo', v_pseudo);
end;
$$;

revoke execute on function public.quiz_renommer(uuid, text) from public, anon, authenticated;
grant execute on function public.quiz_renommer(uuid, text) to anon, authenticated;

select public.verrouiller_observateurs();

select (select count(*) from pg_proc where proname like 'quiz\_%' and pronamespace = 'public'::regnamespace) as fonctions_quiz;
