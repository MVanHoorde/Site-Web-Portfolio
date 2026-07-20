-- ============================================================
--  002 — Correctif sur  classes
--  Motif : le commentaire de 001 annonçait un code insensible à la
--  casse (citext), mais la colonne a été créée en text simple, donc
--  SENSIBLE à la casse. Un élève tapant "snt26a" ne trouvait pas sa
--  classe. Erreur de rédaction, corrigée ici.
--
--  Choix retenu : imposer les MAJUSCULES en base, et laisser le
--  navigateur mettre en majuscules ce que l'élève tape.
--  Plus simple à lire et à déboguer qu'un index sur upper(code).
-- ============================================================

-- 1. Normaliser l'existant (si un code minuscule s'était glissé).
update public.classes set code = upper(code) where code <> upper(code);

-- 2. Interdire désormais toute autre écriture que les majuscules.
alter table public.classes
  add constraint classes_code_majuscules check (code = upper(code));

-- 3. Documenter la règle dans la base elle-même.
comment on column public.classes.code is
  'Code d''accès à 6 caractères, TOUJOURS en majuscules (contrainte). Le client doit appliquer .toUpperCase() avant d''interroger.';
