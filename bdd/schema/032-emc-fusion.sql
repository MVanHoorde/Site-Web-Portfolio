-- ============================================================
--  032 — EMC : les mots, les notes et les votes s'enregistrent
--
--  PANNE (Loïc, test réel du 07/11/2026)
--  La carte s'enregistrait, pas les mots, les notes ni les votes :
--  « pas possible maintenant » à chaque envoi.
--
--  CAUSE
--  Ces trois écritures sont des « upsert » (Prefer:
--  resolution=merge-duplicates). PostgREST les traduit en
--    insert … on conflict (clé) do update set <TOUTES les colonnes
--    envoyées> = excluded.…
--  donc aussi classe_id, eleve_id (et situation). Le 031 n'accordait
--  l'update que sur mots/emojis, texte, valeur : refus de droit
--  (42501). La carte écrit en ignore-duplicates : pas touchée.
--
--  CORRECTION
--  · update accordé aussi sur les colonnes de la clé ;
--  · pour qu'on ne puisse pas, par là, déplacer sa ligne vers une
--    autre séance, les policies « changer » exigent en plus d'être
--    participant de la séance visée (eleve_id = soi l'était déjà).
--
--  Rejouable. Banc : _outils/tests/emc-schema.test.mjs (charge 031
--  puis 032, écrit comme PostgREST).
-- ============================================================

grant update (classe_id, eleve_id)            on table public.emc_mots  to authenticated;
grant update (classe_id, eleve_id)            on table public.emc_notes to authenticated;
grant update (classe_id, situation, eleve_id) on table public.emc_votes to authenticated;

drop policy if exists emc_mots_changer on public.emc_mots;
create policy emc_mots_changer on public.emc_mots
  for update to authenticated
  using (eleve_id = (select public.eleve_courant()))
  with check (eleve_id = (select public.eleve_courant())
              and (select public.emc_participe(classe_id))
              and (select public.emc_etape(classe_id)) = 1);

drop policy if exists emc_notes_changer on public.emc_notes;
create policy emc_notes_changer on public.emc_notes
  for update to authenticated
  using (eleve_id = (select public.eleve_courant()))
  with check (eleve_id = (select public.eleve_courant())
              and (select public.emc_participe(classe_id))
              and (select public.emc_etape(classe_id)) is not null);

drop policy if exists emc_votes_changer on public.emc_votes;
create policy emc_votes_changer on public.emc_votes
  for update to authenticated
  using (eleve_id = (select public.eleve_courant()))
  with check (eleve_id = (select public.eleve_courant())
              and (select public.emc_participe(classe_id))
              and public.emc_vote_ouvert(classe_id, situation));

--  Vérification : 3 lignes, chacune avec ses colonnes de clé.
--    select table_name, string_agg(column_name, ', ' order by column_name)
--      from information_schema.column_privileges
--     where grantee = 'authenticated' and privilege_type = 'UPDATE'
--       and table_name in ('emc_mots', 'emc_notes', 'emc_votes')
--     group by table_name;
