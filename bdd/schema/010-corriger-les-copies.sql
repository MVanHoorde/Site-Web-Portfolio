-- ============================================================
--  010 — Corriger les copies (lot 2 du rôle enseignant)
--
--  C'EST LE DERNIER MAILLON. Depuis la mise en service, l'élève
--  envoie, le worker corrige sur le PC de Loïc… et l'élève ne voit
--  jamais rien : l'affichage du retour est conditionné à
--  statut = 'corrige', et RIEN dans le dépôt ne pouvait poser ce
--  statut. Ce fichier ouvre cette porte, et elle seule.
--
--  POURQUOI DES FONCTIONS ET PAS UNE POLICY UPDATE
--  Une policy « le professeur peut modifier reponses_libres » lui
--  donnerait aussi le droit de réécrire le TEXTE de l'élève. Ce
--  serait absurde (la copie ne lui appartient pas) et dangereux
--  (le déclencheur d'archivage se mettrait en marche, remettrait
--  la copie en 'en_attente' et effacerait la correction).
--
--  Trois fonctions, donc, qui ne touchent QUE les colonnes de
--  traitement : statut, corrige_le, commentaire_prof. Le texte de
--  l'élève est hors d'atteinte, par construction et non par
--  discipline.
--
--  security definer : la fonction s'exécute avec les droits de son
--  propriétaire, donc en ignorant la RLS. C'est ce qui lui permet
--  d'écrire là où aucune policy ne l'autorise — et c'est pourquoi
--  CHAQUE fonction commence par vérifier est_enseignant()
--  elle-même. Cette vérification n'est pas une précaution : c'est
--  la serrure. Sans elle, n'importe quel élève connecté pourrait
--  valider ses propres copies.
--
--  set search_path = '' : réflexe obligatoire sur toute fonction
--  security definer. Sans lui, quelqu'un capable de créer un
--  schéma pourrait faire pointer « enseignants » vers SA table et
--  se déclarer professeur.
--
--  AI ACT — le cadre ne change pas d'un iota. L'IA reste une
--  tâche préparatoire au sens de l'article 6(3) : elle propose des
--  critères et un message, jamais une note. Ces fonctions sont
--  précisément ce qui matérialise la décision humaine : aucune
--  copie ne parvient à l'élève sans qu'un professeur ait appelé
--  valider_copie ou signaler_copie. Le worker, lui, n'a toujours
--  aucun moyen de le faire.
--
--  Rejouable : create or replace, plus des grants explicites.
-- ============================================================


-- ------------------------------------------------------------
--  1. valider_copie — le geste ordinaire
--
--  Décision du 31/07/2026 : deux façons de valider, pas trois.
--   · sans commentaire  → l'élève reçoit le message de l'IA que le
--     professeur vient de relire, suivi de la ligne de
--     transparence (« ce retour a d'abord été préparé par une IA
--     locale… ton professeur l'a relu et validé »).
--   · avec commentaire  → le mot du professeur PRIME et remplace
--     tout. C'est déjà la politique câblée dans rendreRetour()
--     côté séquence ; cette fonction ne fait que l'alimenter.
--  Le message de l'IA n'est jamais réécrit : on le valide tel
--  quel, ou on écrit le sien.
--
--  Rejouable sur une même copie : re-valider avec un nouveau
--  commentaire le remplace. Utile pour se corriger après coup.
--  Passer null ou une chaîne vide CONSERVE le commentaire déjà
--  écrit — on n'efface pas par omission. Pour retirer un
--  commentaire, il faut passer un espace… non : voir rouvrir_copie.
-- ------------------------------------------------------------
create or replace function public.valider_copie(
  p_copie       uuid,
  p_commentaire text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_lignes int;
begin
  if not public.est_enseignant() then
    -- 42501 = insufficient_privilege. Le client reçoit un vrai
    -- refus, pas un « 0 ligne modifiée » qu'il croirait normal.
    raise exception 'Action réservée au professeur.'
      using errcode = '42501';
  end if;

  update public.reponses_libres
     set statut           = 'corrige',
         corrige_le       = now(),
         commentaire_prof = coalesce(
                              nullif(btrim(p_commentaire), ''),
                              commentaire_prof)
   where id = p_copie;

  get diagnostics v_lignes = row_count;

  if v_lignes = 0 then
    raise exception 'Copie introuvable : %', p_copie
      using errcode = 'P0002';
  end if;
end;
$$;

comment on function public.valider_copie(uuid, text) is
  'Rend la correction visible à l''élève. Sans commentaire : le message IA validé. Avec : le mot du professeur, qui prime.';


-- ------------------------------------------------------------
--  2. signaler_copie — à refaire
--
--  Décision du 31/07/2026 : « signalée » veut dire « à refaire,
--  l'élève doit réécrire ». Ce n'est pas un drapeau interne.
--
--  GARDE PÉDAGOGIQUE : on refuse de renvoyer une copie sans dire
--  pourquoi. Si le professeur n'écrit rien ET que l'IA n'a produit
--  aucun message, l'élève lirait « à reprendre » sans savoir quoi
--  reprendre — le contraire d'un retour formatif. La fonction
--  lève alors une exception.
--  Pour retirer cette garde un jour : supprimer le bloc  if  qui
--  suit, rien d'autre n'en dépend.
--
--  Le texte de l'élève reste intact. Quand il réécrira, le
--  déclencheur archive_version_reponse fera son travail : archive
--  de l'ancienne version, version + 1, retour en 'en_attente',
--  correction_ia remise à null. Le worker la reprendra
--  naturellement au tour suivant. La boucle se referme sans une
--  ligne de code supplémentaire.
-- ------------------------------------------------------------
create or replace function public.signaler_copie(
  p_copie       uuid,
  p_commentaire text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_lignes  int;
  v_message text;
begin
  if not public.est_enseignant() then
    raise exception 'Action réservée au professeur.'
      using errcode = '42501';
  end if;

  select nullif(btrim(
           r.correction_ia -> 'analyse' -> 'feedback_eleve' ->> 'message'
         ), '')
    into v_message
    from public.reponses_libres r
   where r.id = p_copie;

  if nullif(btrim(coalesce(p_commentaire, '')), '') is null
     and v_message is null then
    raise exception
      'Une copie renvoyée doit dire pourquoi : écris un commentaire.'
      using errcode = 'P0001';
  end if;

  update public.reponses_libres
     set statut           = 'signale',
         corrige_le       = now(),
         commentaire_prof = coalesce(
                              nullif(btrim(p_commentaire), ''),
                              commentaire_prof)
   where id = p_copie;

  get diagnostics v_lignes = row_count;

  if v_lignes = 0 then
    raise exception 'Copie introuvable : %', p_copie
      using errcode = 'P0002';
  end if;
end;
$$;

comment on function public.signaler_copie(uuid, text) is
  'Renvoie la copie à l''élève pour réécriture. Refuse si rien n''explique pourquoi.';


-- ------------------------------------------------------------
--  3. rouvrir_copie — le filet
--
--  Un clic malheureux sur 300 copies, ça arrive. Cette fonction
--  ramène la copie dans la file : statut 'en_attente',
--  corrige_le effacé.
--
--  Elle NE touche PAS à correction_ia : le travail du worker n'est
--  pas perdu, la copie réapparaît telle qu'il l'avait préparée.
--
--  Le commentaire du professeur, lui, est effacé — c'est le sens
--  même de « je me suis trompé ». C'est aussi le seul moyen de
--  retirer un commentaire écrit par erreur, puisque valider_copie
--  conserve l'existant quand on ne lui passe rien.
-- ------------------------------------------------------------
create or replace function public.rouvrir_copie(p_copie uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_lignes int;
begin
  if not public.est_enseignant() then
    raise exception 'Action réservée au professeur.'
      using errcode = '42501';
  end if;

  update public.reponses_libres
     set statut           = 'en_attente',
         corrige_le       = null,
         commentaire_prof = null
   where id = p_copie;

  get diagnostics v_lignes = row_count;

  if v_lignes = 0 then
    raise exception 'Copie introuvable : %', p_copie
      using errcode = 'P0002';
  end if;
end;
$$;

comment on function public.rouvrir_copie(uuid) is
  'Annule une correction : la copie retourne dans la file. correction_ia est conservée, le commentaire du professeur est effacé.';


-- ------------------------------------------------------------
--  4. Droits d'appel
--
--  Rappel du 006 : le GRANT dit « as-tu le droit de toucher à cet
--  objet », la RLS dit « quelles lignes ». Une fonction n'a pas de
--  lignes ; seul le GRANT la concerne — et à l'intérieur, c'est
--  est_enseignant() qui filtre.
--
--  On révoque d'abord depuis  public,  anon  et  authenticated  :
--  PostgreSQL accorde EXECUTE à  public  par défaut sur toute
--  fonction nouvellement créée. Sans ce revoke, un visiteur non
--  connecté pourrait appeler la fonction — il serait refusé par la
--  vérification interne, mais on ne laisse pas une porte battante
--  sous prétexte qu'il y a un vigile derrière.
-- ------------------------------------------------------------
revoke all on function public.valider_copie(uuid, text)  from public, anon, authenticated;
revoke all on function public.signaler_copie(uuid, text) from public, anon, authenticated;
revoke all on function public.rouvrir_copie(uuid)        from public, anon, authenticated;

grant execute on function public.valider_copie(uuid, text)  to authenticated;
grant execute on function public.signaler_copie(uuid, text) to authenticated;
grant execute on function public.rouvrir_copie(uuid)        to authenticated;


-- ============================================================
--  5. Vérification — à lancer juste après, dans l'éditeur SQL
--
--  a) les trois fonctions existent et sont security definer
--
-- select p.proname, p.prosecdef as security_definer
-- from pg_proc p join pg_namespace n on n.oid = p.pronamespace
-- where n.nspname = 'public'
--   and p.proname in ('valider_copie','signaler_copie','rouvrir_copie')
-- order by p.proname;
--  → trois lignes, security_definer = true partout
--
--  b) seul  authenticated  peut les appeler
--
-- select p.proname, r.rolname
-- from pg_proc p
-- join pg_namespace n on n.oid = p.pronamespace
-- cross join lateral aclexplode(p.proacl) a
-- join pg_roles r on r.oid = a.grantee
-- where n.nspname = 'public'
--   and p.proname in ('valider_copie','signaler_copie','rouvrir_copie')
--   and a.privilege_type = 'EXECUTE'
-- order by p.proname, r.rolname;
--  → uniquement  authenticated  (et le propriétaire  postgres)
--    ni  anon,  ni  public
-- ============================================================
