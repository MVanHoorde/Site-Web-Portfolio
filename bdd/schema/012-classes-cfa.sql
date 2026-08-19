-- ============================================================
--  012-classes-cfa.sql — les deux groupes du livret CFA
--  ------------------------------------------------------------
--  Le livret CFA (dix-sept fiches-outils) rejoint le dispositif de
--  comptes déjà en service pour la SNT. Aucune table n'est créée ni
--  modifiée : la progression du livret s'écrit dans `progression`,
--  domaine `cours`, clés `cfa-o00` … `cfa-o16`. Le domaine `cours`
--  fait partie de la liste fermée d'origine, il n'y a donc rien à
--  ouvrir.
--
--  Ce fichier ne fait qu'une chose : ouvrir les deux codes de classe
--  que les apprentis taperont à la création de leur compte.
--
--  RAPPEL — le code fait EXACTEMENT six caractères, il est
--  sensible à la casse (« CFA26A » et « cfa26a » seraient deux codes
--  différents), et il s'imprime tel quel au tableau.
--
--  Fermer les inscriptions après la deuxième séance :
--    update public.classes set actif = false where code = 'CFA26A';
--  Les élèves déjà inscrits ne sont pas affectés : `actif` ne
--  commande que l'entrée.
-- ============================================================

insert into public.classes (code, libelle, annee_scolaire)
values
  ('CFA26A', 'CFA — BTS MMCM',        '2026-2027'),
  ('MVT26A', 'CFA — bac pro MVTR',    '2026-2027')
on conflict (code) do nothing;


-- ------------------------------------------------------------
--  Vérification — doit renvoyer les deux lignes, actif = true
-- ------------------------------------------------------------
select code, libelle, annee_scolaire, actif
from public.classes
where code in ('CFA26A', 'MVT26A')
order by code;
