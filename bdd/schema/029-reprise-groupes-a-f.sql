-- ============================================================
--  029-reprise-groupes-a-f.sql — le cahier de textes suit les élèves
--  ------------------------------------------------------------
--  POURQUOI (17/10/2026)
--  Les élèves de 2.1 et de 2.6 ont suivi leurs premières séances de
--  SNT dans les groupes de Loïc (B et E), pendant un remplacement.
--  Ils passent dans les groupes A et F du collègue qui reprend
--  (`changer_groupe_snt()`, 028). Les séances faites ensemble l'ont
--  été pour eux aussi : on les recopie dans A et F, pour que le
--  tableau de bord du nouvel enseignant parte du bon endroit
--  (frise, grille de suivi, curseur du plafond s'il en pose un).
--
--  B → A : snt-t0 S1 à S3.   E → F : snt-t0 S1 à S4.
--  Le plafond d'avance de A, F et K n'est PAS touché : il reste
--  « tout ouvert », le réglage par défaut que décrit le guide.
--
--  Aucune structure, aucune donnée d'élève. S'exécute dans le SQL
--  Editor ou par :
--    supabase db query --linked -f bdd/schema/029-reprise-groupes-a-f.sql
--  REJOUABLE : `on conflict do nothing` (une séance déjà saisie
--  par le nouvel enseignant n'est jamais écrasée).
-- ============================================================

insert into public.seances_faites
  (classe_id, sequence, seance, faite_le, note, travail_donne, non_termine, origine)
select d.id, s.sequence, s.seance, s.faite_le, s.note, s.travail_donne, s.non_termine, s.origine
  from public.seances_faites s
  join public.classes o on o.id = s.classe_id
  join public.classes d on d.code = case o.code when 'SNT26B' then 'SNT26A'
                                                when 'SNT26E' then 'SNT26F' end
 where o.code in ('SNT26B', 'SNT26E')
on conflict do nothing;

--  Vérification : A → snt-t0 s1, s2, s3 · F → snt-t0 s1, s2, s3, s4
select c.code,
       string_agg(s.sequence || ' ' || s.seance, ', ' order by s.sequence, s.seance) as seances
  from public.classes c
  left join public.seances_faites s on s.classe_id = c.id
 where c.code in ('SNT26A', 'SNT26F')
 group by c.code
 order by c.code;
