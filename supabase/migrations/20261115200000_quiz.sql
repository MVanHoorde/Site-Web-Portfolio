-- ============================================================
--  047 — Le quiz en classe (outils/quiz/)
--
--  BESOIN (Loïc, 15/11/2026)
--  Remplacer Kahoot (abonnement résilié) par un outil du site :
--  l'enseignant projette, les élèves répondent sur téléphone ou
--  tablette, SANS COMPTE, avec un code PIN (ou le QR code). Les
--  quiz sont stockés en ligne ; les statistiques des réponses sont
--  gardées pour l'enseignant, pas pour les élèves.
--  Cahier des charges : outils/quiz/LISEZMOI.md.
--
--  🔴 FICHIER PUREMENT ADDITIF. Quatre tables neuves préfixées
--  quiz_, des fonctions préfixées quiz_. Aucune table, policy ni
--  fonction existante n'est touchée. Retirer l'outil = supprimer
--  ces objets (§9).
--
--  LE PRINCIPE DE SÉCURITÉ
--  · Les bonnes réponses ne quittent JAMAIS la base avant la
--    correction de la question. L'élève reçoit l'énoncé et les
--    choix (quiz_etat), envoie sa réponse (quiz_repondre) ; c'est
--    la base qui juge et compte les points, avec SON horloge. Un
--    élève qui ouvre l'inspecteur du navigateur n'y lit rien.
--  · L'élève n'a aucun droit sur les tables : il ne passe que par
--    trois fonctions (rejoindre, état, répondre), et ne s'identifie
--    que par un jeton tiré au hasard, valable pour une partie.
--  · Les quiz eux-mêmes (avec leurs corrigés) ne sont lisibles que
--    des enseignants. Ils ne sont PAS dans le dépôt public : un
--    fichier de quiz s'importe depuis outils/quiz/animer.html.
--
--  CE QUI VIT ICI
--    quiz_quiz      un quiz = des métadonnées + ses questions (jsonb)
--    quiz_parties   une séance en classe : PIN, phase, question en
--                   cours, copie FIGÉE des questions (modifier le
--                   quiz ensuite ne fausse pas les statistiques)
--    quiz_joueurs   un élève dans une partie : un pseudonyme, un jeton
--    quiz_reponses  une réponse, jugée par la base
--
--  LA SALLE PERMANENTE ET L'ENTRAÎNEMENT (Loïc, 15/11/2026)
--  · Chaque quiz porte un code de salle FIXE (6 caractères), que le QR
--    code d'une diapositive ou d'une fiche imprimée peut porter, à la
--    différence du PIN, tiré au lancement. L'élève qui scanne attend
--    (quiz_salle) : dès que l'AUTEUR du quiz lance une partie, la page
--    y fait entrer tous ceux qui attendaient. Un collègue qui lance le
--    même quiz partagé garde son PIN : la salle reste à l'auteur.
--  · Sans partie ouverte, l'élève peut s'entraîner seul
--    (quiz_entrainer, puis quiz_solo pour avancer) : une partie
--    'solo' rien qu'à lui, fermée dès sa création, rangée dans les
--    statistiques de l'auteur sous « Entraînement ». La base juge
--    toujours ; la correction s'affiche après chaque réponse.
--
--  RGPD
--  · Pas de compte, pas d'adresse, pas d'appareil enregistré. Le
--    pseudonyme est tapé par l'élève : l'écran demande « prénom +
--    initiale », l'enseignant peut exclure un pseudo déplacé.
--  · Après 30 jours, les pseudonymes sont remplacés par « #1 »,
--    « #2 »… (quiz_anonymiser, lancé à chaque ouverture de l'écran
--    enseignant) : les statistiques par question et par notion
--    restent, plus rien ne désigne un élève.
--
--  POIDS
--    Un quiz de 20 questions ≈ 15 Ko. Une partie de 30 élèves sur
--    20 questions ≈ 600 lignes de réponses ≈ 100 Ko.
--
--  Rejouable : if not exists, create or replace, drop policy if exists.
--  Banc d'essai : _outils/tests/quiz-base.test.sql (Postgres local).
-- ============================================================


-- ------------------------------------------------------------
--  1. Les quiz
-- ------------------------------------------------------------
create table if not exists public.quiz_quiz (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique
              check (slug ~ '^[a-z0-9][a-z0-9-]{1,79}$'),
  titre       text not null check (length(titre) between 1 and 200),
  niveau      text check (length(niveau) <= 80),       -- « BTS MS 1re année »
  matiere     text check (length(matiere) <= 80),
  description text check (length(description) <= 2000),
  questions   jsonb not null default '[]'::jsonb,
  auteur      uuid not null default auth.uid()
              references auth.users (id) on delete cascade,
  partage     boolean not null default true,           -- visible des collègues
  cree_le     timestamptz not null default now(),
  modifie_le  timestamptz not null default now(),
  constraint quiz_quiz_questions_tableau check (jsonb_typeof(questions) = 'array'),
  constraint quiz_quiz_taille check (pg_column_size(questions) < 600000)
);

comment on table public.quiz_quiz is
  'Quiz de outils/quiz/. Corrigés compris : lisible des seuls enseignants (047).';

-- Le code de salle : 6 caractères sans 0/O ni 1/I/L, lisibles à l'oral.
create or replace function public.quiz_code_salle()
returns text
language sql
volatile
set search_path = ''
as $$
  select string_agg(substr('ABCDEFGHJKMNPQRSTUVWXYZ23456789', 1 + floor(random() * 31)::integer, 1), '')
    from generate_series(1, 6)
$$;

-- Ajouté par « alter » pour rester rejouable sur une table déjà créée :
-- le défaut volatil donne un code différent à chaque ligne existante.
alter table public.quiz_quiz
  add column if not exists salle text not null default public.quiz_code_salle()
      check (salle ~ '^[A-HJ-KM-NP-Z2-9]{6}$');
create unique index if not exists quiz_quiz_salle on public.quiz_quiz (salle);


-- ------------------------------------------------------------
--  2. Les parties
-- ------------------------------------------------------------
create table if not exists public.quiz_parties (
  id          uuid primary key default gen_random_uuid(),
  quiz_id     uuid references public.quiz_quiz (id) on delete set null,
  titre       text not null,
  questions   jsonb not null,                -- copie figée au lancement
  animateur   uuid not null default auth.uid()
              references auth.users (id) on delete cascade,
  pin         text not null check (pin ~ '^[1-9][0-9]{5}$'),
  groupe      text check (length(groupe) <= 60),   -- « BTS MS 1 » : jamais un nom d'élève
  options     jsonb not null default '{}'::jsonb,  -- { "pari": true }
  phase       text not null default 'accueil'
              check (phase in ('accueil', 'question', 'correction', 'fin')),
  idx         integer not null default -1,   -- question en cours (0 = la première)
  debut       timestamptz,                   -- de la question en cours
  fin         timestamptz,
  version     integer not null default 0,    -- +1 à chaque changement d'écran
  ouverte_le  timestamptz not null default now(),
  close_le    timestamptz                    -- plus personne n'entre
);

-- Un PIN n'est pris que par une partie encore ouverte.
create unique index if not exists quiz_parties_pin_ouvert
  on public.quiz_parties (pin) where close_le is null;
create index if not exists quiz_parties_animateur
  on public.quiz_parties (animateur, ouverte_le desc);

-- 'classe' : pilotée par l'enseignant · 'solo' : un élève s'entraîne seul
alter table public.quiz_parties
  add column if not exists mode text not null default 'classe'
      check (mode in ('classe', 'solo'));
create index if not exists quiz_parties_salle
  on public.quiz_parties (quiz_id, ouverte_le desc) where close_le is null;


-- ------------------------------------------------------------
--  3. Les joueurs et leurs réponses
-- ------------------------------------------------------------
create table if not exists public.quiz_joueurs (
  id          uuid primary key default gen_random_uuid(),
  partie_id   uuid not null references public.quiz_parties (id) on delete cascade,
  jeton       uuid not null unique default gen_random_uuid(),
  pseudo      text not null check (length(pseudo) between 1 and 24),
  rejoint_le  timestamptz not null default now()
);
create unique index if not exists quiz_joueurs_pseudo
  on public.quiz_joueurs (partie_id, lower(pseudo));

create table if not exists public.quiz_reponses (
  joueur_id   uuid not null references public.quiz_joueurs (id) on delete cascade,
  partie_id   uuid not null references public.quiz_parties (id) on delete cascade,
  idx         integer not null check (idx >= 0),
  reponse     jsonb not null check (pg_column_size(reponse) < 4000),
  juste       boolean not null,
  categorie   text not null,      -- 'juste', 'faux', 'unite', 'piege:N', 'autre', ou le choix « 2 »
  points      integer not null default 0,
  temps_ms    integer not null check (temps_ms >= 0),
  sur         boolean not null default false,   -- pari de confiance
  repondu_le  timestamptz not null default now(),
  primary key (joueur_id, idx)
);
create index if not exists quiz_reponses_partie
  on public.quiz_reponses (partie_id, idx);


-- ------------------------------------------------------------
--  4. Une question bien formée
--
--  Une question est un objet jsonb. Champs communs :
--    type      'qcm' | 'vf' | 'num' | 'ordre' | 'zone' | 'assoc' | 'mot' | 'curseur'
--    enonce    texte, formules LaTeX entre $…$
--    temps     secondes (5 à 240, 20 par défaut)
--    notion, bo, niveau (1 à 3), cours, image {src, alt}
--  Selon le type :
--    qcm   options [2 à 6 textes], correct [indices], pourquoi [par option]
--    vf    options ["Vrai","Faux"], correct [0] ou [1], pourquoi
--    num   num { valeur, tolerance (relative, 0,02 = 2 %), unite,
--                unites [choix proposés], autres [{valeur, unite}],
--                pieges [{valeur, unite?, message}], message_unite }
--    ordre items [2 à 8 textes, DANS LE BON ORDRE]
--    zone  zone { src, alt, cibles [{x, y, l, h} en % de l'image] }
--    assoc paires [[gauche, droite], … 3 à 6 paires]  (points partiels)
--    mot   mot { acceptes [réponses justes, la 1re est montrée en
--                correction], pieges [{mot, message}], indice }
--          comparaison sans majuscules, accents ni ponctuation
--    curseur curseur { min, max, pas, valeur, tolerance (absolue, dans
--                l'unité), marge (absolue : au-delà, 0 point ; 3 × la
--                tolérance par défaut), unite }   (points partiels)
--  Rend NULL si tout va bien, sinon la raison (en clair).
-- ------------------------------------------------------------
-- Un mot tapé, ramené à sa forme comparable : minuscules, sans accents,
-- ponctuation et apostrophes réduites à des espaces, chiffres en indice
-- ou en exposant rendus ordinaires (CO₂ = co2).
create or replace function public.quiz_normaliser(t text)
returns text
language sql
immutable
set search_path = ''
as $$
  select btrim(regexp_replace(
    -- les majuscules accentuées sont traduites à la main : lower() ne les
    -- touche pas sous une collation « C » (DIOXYGÈNE restait dioxygÈne)
    translate(replace(replace(replace(replace(lower(coalesce(t, '')), 'œ', 'oe'), 'Œ', 'oe'), 'æ', 'ae'), 'Æ', 'ae'),
              'àâäáãåçéèêëíìîïñóòôöõúùûüýÿÀÂÄÁÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸ₀₁₂₃₄₅₆₇₈₉⁰¹²³⁴⁵⁶⁷⁸⁹',
              'aaaaaaceeeeiiiinooooouuuuyyaaaaaaceeeeiiiinooooouuuuyy01234567890123456789'),
    '[^a-z0-9]+', ' ', 'g'))
$$;

create or replace function public.quiz_question_invalide(q jsonb)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  t text := q->>'type';
  n integer;
  c jsonb;
begin
  if coalesce(jsonb_typeof(q), '') <> 'object' then return 'une question doit être un objet'; end if;
  if t is null or t not in ('qcm', 'vf', 'num', 'ordre', 'zone', 'assoc', 'mot', 'curseur') then
    return 'type inconnu : ' || coalesce(t, '(vide)');
  end if;
  if coalesce(btrim(q->>'enonce'), '') = '' then return 'énoncé vide'; end if;
  if q ? 'temps' and (coalesce(jsonb_typeof(q->'temps'), '') <> 'number'
                      or (q->>'temps')::numeric < 5 or (q->>'temps')::numeric > 240) then
    return 'temps hors de 5 à 240 s';
  end if;

  if t in ('qcm', 'vf') then
    if t = 'vf' and not q ? 'options' then
      n := 2;                         -- « Vrai », « Faux » par défaut
    else
      if coalesce(jsonb_typeof(q->'options'), '') <> 'array' then return 'options manquantes'; end if;
      n := jsonb_array_length(q->'options');
    end if;
    if n < 2 or n > 6 then return 'il faut 2 à 6 options'; end if;
    if coalesce(jsonb_typeof(q->'correct'), '') <> 'array' or jsonb_array_length(q->'correct') = 0 then
      return 'bonne réponse manquante (correct : [indices])';
    end if;
    for c in select value from jsonb_array_elements(q->'correct') loop
      if coalesce(jsonb_typeof(c), '') <> 'number' or c::text::integer < 0 or c::text::integer >= n then
        return 'indice de bonne réponse hors des options';
      end if;
    end loop;
  elsif t = 'num' then
    if coalesce(jsonb_typeof(q->'num'), '') <> 'object' or coalesce(jsonb_typeof(q->'num'->'valeur'), '') <> 'number' then
      return 'valeur numérique attendue manquante (num.valeur)';
    end if;
    if q->'num' ? 'unites' and coalesce(jsonb_typeof(q->'num'->'unites'), '') <> 'array' then
      return 'num.unites doit être une liste';
    end if;
  elsif t = 'ordre' then
    if coalesce(jsonb_typeof(q->'items'), '') <> 'array' then return 'items manquants'; end if;
    n := jsonb_array_length(q->'items');
    if n < 2 or n > 8 then return 'il faut 2 à 8 éléments à ordonner'; end if;
  elsif t = 'zone' then
    if coalesce(jsonb_typeof(q->'zone'), '') <> 'object' or coalesce(q->'zone'->>'src', '') = '' then
      return 'image de la zone manquante (zone.src)';
    end if;
    if coalesce(jsonb_typeof(q->'zone'->'cibles'), '') <> 'array' or jsonb_array_length(q->'zone'->'cibles') = 0 then
      return 'zone.cibles manquantes';
    end if;
  elsif t = 'assoc' then
    if coalesce(jsonb_typeof(q->'paires'), '') <> 'array' then return 'paires manquantes'; end if;
    n := jsonb_array_length(q->'paires');
    if n < 3 or n > 6 then return 'il faut 3 à 6 paires'; end if;
    for c in select value from jsonb_array_elements(q->'paires') loop
      if coalesce(jsonb_typeof(c), '') <> 'array' or jsonb_array_length(c) <> 2
         or coalesce(btrim(c->>0), '') = '' or coalesce(btrim(c->>1), '') = '' then
        return 'chaque paire est [gauche, droite], deux textes non vides';
      end if;
    end loop;
  elsif t = 'mot' then
    if coalesce(jsonb_typeof(q->'mot'), '') <> 'object' or coalesce(jsonb_typeof(q->'mot'->'acceptes'), '') <> 'array'
       or jsonb_array_length(q->'mot'->'acceptes') = 0 then
      return 'réponses acceptées manquantes (mot.acceptes)';
    end if;
    if exists (select 1 from jsonb_array_elements_text(q->'mot'->'acceptes') a where public.quiz_normaliser(a) = '') then
      return 'une réponse acceptée est vide';
    end if;
  elsif t = 'curseur' then
    if coalesce(jsonb_typeof(q->'curseur'), '') <> 'object' then return 'réglages du curseur manquants (curseur)'; end if;
    if coalesce(jsonb_typeof(q->'curseur'->'min'), '') <> 'number' or coalesce(jsonb_typeof(q->'curseur'->'max'), '') <> 'number'
       or coalesce(jsonb_typeof(q->'curseur'->'valeur'), '') <> 'number' then
      return 'curseur.min, curseur.max et curseur.valeur sont des nombres';
    end if;
    if (q->'curseur'->>'min')::numeric >= (q->'curseur'->>'max')::numeric then return 'curseur.min doit être inférieur à curseur.max'; end if;
    if (q->'curseur'->>'valeur')::numeric not between (q->'curseur'->>'min')::numeric and (q->'curseur'->>'max')::numeric then
      return 'curseur.valeur hors de l''échelle';
    end if;
    if coalesce((q->'curseur'->>'pas')::numeric, 1) <= 0 or coalesce((q->'curseur'->>'tolerance')::numeric, 0) < 0 then
      return 'curseur.pas doit être positif, curseur.tolerance positive ou nulle';
    end if;
  end if;
  return null;
end;
$$;

-- Le contrôle s'applique à toute écriture, par l'import comme par l'atelier.
create or replace function public.quiz_quiz_controle()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  q jsonb;
  i integer := 0;
  m text;
begin
  for q in select value from jsonb_array_elements(new.questions) loop
    i := i + 1;
    m := public.quiz_question_invalide(q);
    if m is not null then
      raise exception 'QUIZ_QUESTION_INVALIDE: question %, %', i, m;
    end if;
  end loop;
  if i > 100 then raise exception 'QUIZ_QUESTION_INVALIDE: 100 questions au plus'; end if;
  new.modifie_le := now();
  if tg_op = 'UPDATE' then new.auteur := old.auteur; new.cree_le := old.cree_le; end if;
  return new;
end;
$$;

drop trigger if exists quiz_quiz_controle on public.quiz_quiz;
create trigger quiz_quiz_controle
  before insert or update on public.quiz_quiz
  for each row execute function public.quiz_quiz_controle();


-- ------------------------------------------------------------
--  5. Juger une réponse — le cœur
--
--  Rend { juste, categorie }. La catégorie sert à la répartition
--  projetée et à choisir le « pourquoi » à montrer à l'élève.
--  Forme des réponses envoyées par la page élève :
--    qcm, vf  { "choix": [indices] }
--    num      { "valeur": 19.6, "unite": "m/s" }
--    ordre    { "ordre": [positions affichées, dans l'ordre choisi] }
--    zone     { "x": 42.5, "y": 61.0 }   (en % de l'image)
--    assoc    { "paires": [[gauche, position à droite], …] }
--    mot      { "texte": "dioxygène" }
--    curseur  { "valeur": 21 }
--  🔴 ordre et assoc : le téléphone ne reçoit que des POSITIONS dans
--  l'ordre mélangé (q.melange, tiré au lancement), jamais l'indice
--  d'origine — sinon l'inspecteur du navigateur livrerait la réponse.
--  Points partiels (assoc, curseur) : la clé « part », entre 0 et 1.
-- ------------------------------------------------------------
create or replace function public.quiz_proche(v numeric, ref numeric, tol numeric)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case
    when ref = 0 then abs(v) <= coalesce(nullif(tol, 0), 1e-9)
    else abs(v - ref) <= abs(ref) * coalesce(tol, 0.01) + 1e-12
  end
$$;

create or replace function public.quiz_juger(q jsonb, r jsonb)
returns jsonb
language plpgsql
immutable
set search_path = ''
as $$
declare
  t text := q->>'type';
  choix jsonb;
  attendu jsonb;
  v numeric;
  u text;
  tol numeric;
  p jsonb;
  i integer;
  n integer;
  c jsonb;
  ok boolean;
  marge numeric;
begin
  if t in ('qcm', 'vf') then
    if coalesce(jsonb_typeof(r->'choix'), '') <> 'array' then
      return jsonb_build_object('juste', false, 'categorie', 'autre');
    end if;
    select coalesce(jsonb_agg(distinct e::integer order by e::integer), '[]'::jsonb) into choix
      from jsonb_array_elements_text(r->'choix') e where e ~ '^[0-9]+$';
    select coalesce(jsonb_agg(distinct e::integer order by e::integer), '[]'::jsonb) into attendu
      from jsonb_array_elements_text(q->'correct') e;
    return jsonb_build_object(
      'juste', choix = attendu,
      'categorie', case when jsonb_array_length(choix) = 1 then choix->>0
                        when choix = attendu then 'juste' else 'faux' end);

  elsif t = 'num' then
    if coalesce(jsonb_typeof(r->'valeur'), '') <> 'number' then
      return jsonb_build_object('juste', false, 'categorie', 'autre');
    end if;
    v := (r->>'valeur')::numeric;
    u := coalesce(r->>'unite', '');
    tol := coalesce((q->'num'->>'tolerance')::numeric, 0.02);
    -- la bonne valeur, ou une écriture équivalente dans une autre unité
    for p in select jsonb_build_object('valeur', q->'num'->'valeur', 'unite', q->'num'->'unite')
             union all
             select value from jsonb_array_elements(coalesce(q->'num'->'autres', '[]'::jsonb)) loop
      if public.quiz_proche(v, (p->>'valeur')::numeric, tol) then
        if coalesce(p->>'unite', '') = '' or p->>'unite' = u then
          return jsonb_build_object('juste', true, 'categorie', 'juste');
        end if;
        return jsonb_build_object('juste', false, 'categorie', 'unite');
      end if;
    end loop;
    -- les erreurs attendues, prévues par l'auteur
    i := 0;
    for p in select value from jsonb_array_elements(coalesce(q->'num'->'pieges', '[]'::jsonb)) loop
      if jsonb_typeof(p->'valeur') = 'number'
         and public.quiz_proche(v, (p->>'valeur')::numeric, coalesce((p->>'tolerance')::numeric, tol))
         and (coalesce(p->>'unite', '') = '' or p->>'unite' = u) then
        return jsonb_build_object('juste', false, 'categorie', 'piege:' || i);
      end if;
      i := i + 1;
    end loop;
    return jsonb_build_object('juste', false, 'categorie', 'autre');

  elsif t = 'ordre' then
    n := jsonb_array_length(q->'items');
    if coalesce(jsonb_typeof(r->'ordre'), '') <> 'array' or jsonb_array_length(r->'ordre') <> n then
      return jsonb_build_object('juste', false, 'categorie', 'autre');
    end if;
    -- juste si la k-ième position choisie porte l'élément d'origine k
    select count(*) = n into ok
      from jsonb_array_elements_text(r->'ordre') with ordinality x(pos, k)
     where x.pos ~ '^[0-9]+$' and (q->'melange'->>(x.pos::integer))::integer = x.k - 1;
    return jsonb_build_object('juste', ok, 'categorie', case when ok then 'juste' else 'faux' end);

  elsif t = 'assoc' then
    n := jsonb_array_length(q->'paires');
    if coalesce(jsonb_typeof(r->'paires'), '') <> 'array' then
      return jsonb_build_object('juste', false, 'categorie', 'autre', 'part', 0);
    end if;
    -- une paire juste : l'élément de gauche g relié à la position droite
    -- qui porte g ; chaque élément de gauche ne compte qu'une fois
    select count(distinct (x.p->>0)) into i
      from jsonb_array_elements(r->'paires') x(p)
     where jsonb_typeof(x.p) = 'array' and (x.p->>0) ~ '^[0-9]+$' and (x.p->>1) ~ '^[0-9]+$'
       and (x.p->>0)::integer < n
       and (q->'melange'->>((x.p->>1)::integer))::integer = (x.p->>0)::integer
       and 1 = (select count(*) from jsonb_array_elements(r->'paires') y(p) where y.p->>0 = x.p->>0);
    return jsonb_build_object('juste', i = n, 'part', round(i::numeric / n, 3),
      'categorie', case when i = n then 'juste' when i = 0 then 'faux' else 'partiel:' || i end);

  elsif t = 'mot' then
    if coalesce(jsonb_typeof(r->'texte'), '') <> 'string' or public.quiz_normaliser(r->>'texte') = '' then
      return jsonb_build_object('juste', false, 'categorie', 'autre');
    end if;
    u := public.quiz_normaliser(r->>'texte');
    if exists (select 1 from jsonb_array_elements_text(q->'mot'->'acceptes') a where public.quiz_normaliser(a) = u) then
      return jsonb_build_object('juste', true, 'categorie', 'juste');
    end if;
    i := 0;
    for p in select value from jsonb_array_elements(coalesce(q->'mot'->'pieges', '[]'::jsonb)) loop
      if public.quiz_normaliser(p->>'mot') = u then
        return jsonb_build_object('juste', false, 'categorie', 'piege:' || i);
      end if;
      i := i + 1;
    end loop;
    return jsonb_build_object('juste', false, 'categorie', 'autre');

  elsif t = 'curseur' then
    if coalesce(jsonb_typeof(r->'valeur'), '') <> 'number' then
      return jsonb_build_object('juste', false, 'categorie', 'autre', 'part', 0);
    end if;
    v := abs((r->>'valeur')::numeric - (q->'curseur'->>'valeur')::numeric);
    tol := coalesce((q->'curseur'->>'tolerance')::numeric, 0);
    -- la marge : au-delà, plus aucun point ; par défaut 3 × la tolérance
    -- (ou 3 pas si la tolérance est nulle)
    marge := greatest(coalesce((q->'curseur'->>'marge')::numeric,
                               3 * nullif(tol, 0), 3 * coalesce((q->'curseur'->>'pas')::numeric, 1)),
                      tol + 1e-9);
    if v <= tol + 1e-9 then
      return jsonb_build_object('juste', true, 'categorie', 'juste', 'part', 1);
    elsif v < marge then
      return jsonb_build_object('juste', false, 'categorie', 'proche',
        'part', round((marge - v) / (marge - tol), 3));
    end if;
    return jsonb_build_object('juste', false, 'categorie', 'loin', 'part', 0);

  elsif t = 'zone' then
    if coalesce(jsonb_typeof(r->'x'), '') <> 'number' or coalesce(jsonb_typeof(r->'y'), '') <> 'number' then
      return jsonb_build_object('juste', false, 'categorie', 'autre');
    end if;
    for c in select value from jsonb_array_elements(q->'zone'->'cibles') loop
      if (r->>'x')::numeric between (c->>'x')::numeric and (c->>'x')::numeric + (c->>'l')::numeric
         and (r->>'y')::numeric between (c->>'y')::numeric and (c->>'y')::numeric + (c->>'h')::numeric then
        return jsonb_build_object('juste', true, 'categorie', 'juste');
      end if;
    end loop;
    return jsonb_build_object('juste', false, 'categorie', 'faux');
  end if;
  return jsonb_build_object('juste', false, 'categorie', 'autre');
end;
$$;

-- Ce que l'élève voit d'une question PENDANT qu'il y répond :
-- ni la correction, ni les « pourquoi », ni le point de cours.
create or replace function public.quiz_question_publique(q jsonb)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select jsonb_strip_nulls(jsonb_build_object(
    'type',    q->>'type',
    'enonce',  q->'enonce',
    'notion',  q->'notion',
    'temps',   coalesce(q->'temps', '20'::jsonb),
    'image',   q->'image',
    'options', case when q->>'type' = 'vf' then coalesce(q->'options', '["Vrai","Faux"]'::jsonb)
                    when q->>'type' = 'qcm' then q->'options' end,
    'multiple', case when q->>'type' = 'qcm' and jsonb_array_length(q->'correct') > 1 then true end,
    'unites',  case when q->>'type' = 'num' then q->'num'->'unites' end,
    -- l'identifiant est la POSITION affichée, pas l'indice d'origine
    'items',   case when q->>'type' = 'ordre' then (
                 select jsonb_agg(jsonb_build_object('id', m.o - 1, 'texte', q->'items'->(m.v::integer))
                                  order by m.o)
                 from jsonb_array_elements_text(q->'melange') with ordinality m(v, o)) end,
    'zone',    case when q->>'type' = 'zone' then jsonb_build_object('src', q->'zone'->'src', 'alt', q->'zone'->'alt') end,
    'gauche',  case when q->>'type' = 'assoc' then (
                 select jsonb_agg(p.v->0 order by p.o) from jsonb_array_elements(q->'paires') with ordinality p(v, o)) end,
    'droite',  case when q->>'type' = 'assoc' then (
                 select jsonb_agg(q->'paires'->(m.v::integer)->1 order by m.o)
                 from jsonb_array_elements_text(q->'melange') with ordinality m(v, o)) end,
    'indice',  case when q->>'type' = 'mot' then q->'mot'->'indice' end,
    'curseur', case when q->>'type' = 'curseur' then jsonb_build_object(
                 'min', q->'curseur'->'min', 'max', q->'curseur'->'max',
                 'pas', coalesce(q->'curseur'->'pas', '1'::jsonb), 'unite', q->'curseur'->'unite') end
  ))
$$;

-- La correction, une fois la question close.
create or replace function public.quiz_question_corrigee(q jsonb)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select jsonb_strip_nulls(jsonb_build_object(
    'correct', case when q->>'type' in ('qcm', 'vf') then q->'correct' end,
    'valeur',  case when q->>'type' = 'num' then q->'num'->'valeur'
                    when q->>'type' = 'curseur' then q->'curseur'->'valeur' end,
    'unite',   case when q->>'type' = 'num' then q->'num'->'unite'
                    when q->>'type' = 'curseur' then q->'curseur'->'unite' end,
    'tolerance', case when q->>'type' = 'curseur' then q->'curseur'->'tolerance' end,
    'autres',  case when q->>'type' = 'num' then q->'num'->'autres' end,
    'items',   case when q->>'type' = 'ordre' then q->'items' end,
    'cibles',  case when q->>'type' = 'zone' then q->'zone'->'cibles' end,
    'paires',  case when q->>'type' = 'assoc' then q->'paires' end,
    'acceptes', case when q->>'type' = 'mot' then q->'mot'->'acceptes' end,
    'cours',   q->'cours'
  ))
$$;

-- Le « pourquoi » qui correspond à la réponse de l'élève.
create or replace function public.quiz_pourquoi(q jsonb, categorie text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when categorie ~ '^[0-9]+$' then q->'pourquoi'->>(categorie::integer)
    when categorie = 'unite' then coalesce(q->'num'->>'message_unite',
         'La valeur est bonne, mais pas l''unité.')
    when categorie ~ '^piege:[0-9]+$' and q->>'type' = 'mot'
      then q->'mot'->'pieges'->(substr(categorie, 7)::integer)->>'message'
    when categorie ~ '^piege:[0-9]+$' then q->'num'->'pieges'->(substr(categorie, 7)::integer)->>'message'
    when categorie = 'proche' then 'Pas loin : quelques points, mais pas tous.'
    else null
  end
$$;

-- Une permutation de 0..n-1 qui n'est pas l'ordre de départ.
create or replace function public.quiz_melange(n integer)
returns jsonb
language plpgsql
volatile
set search_path = ''
as $$
declare
  p jsonb;
  ident jsonb;
begin
  select coalesce(jsonb_agg(g order by g), '[]'::jsonb) into ident from generate_series(0, n - 1) g;
  loop
    select coalesce(jsonb_agg(g order by random()), '[]'::jsonb) into p from generate_series(0, n - 1) g;
    exit when n < 2 or p <> ident;
  end loop;
  return p;
end;
$$;

-- Les points d'une réponse : 1 000 au plus, la moitié perdue au fil
-- du chrono ; pari de confiance : +25 % si juste, −200 si faux.
create or replace function public.quiz_points(juste boolean, temps_ms integer, duree_ms integer, sur boolean)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case
    when juste then round(1000 * (1 - least(temps_ms, duree_ms)::numeric / (2 * greatest(duree_ms, 1)))
                          * case when sur then 1.25 else 1 end)::integer
    when sur then -200
    else 0
  end
$$;


-- ------------------------------------------------------------
--  6. Côté élève (sans compte) : rejoindre, lire l'état, répondre
-- ------------------------------------------------------------

-- Une partie se rejoint pendant 12 h au plus après son ouverture.
create or replace function public.quiz_rejoindre(p_pin text, p_pseudo text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_partie public.quiz_parties%rowtype;
  v_pseudo text := regexp_replace(btrim(coalesce(p_pseudo, '')), '\s+', ' ', 'g');
  v_jeton uuid;
begin
  if v_pseudo ~ '[[:cntrl:]<>]' or v_pseudo like '#%' then raise exception 'QUIZ_PSEUDO_INVALIDE'; end if;
  if length(v_pseudo) < 2 or length(v_pseudo) > 24 then raise exception 'QUIZ_PSEUDO_LONGUEUR'; end if;

  select * into v_partie from public.quiz_parties
   where pin = regexp_replace(coalesce(p_pin, ''), '\D', '', 'g')
     and close_le is null and ouverte_le > now() - interval '12 hours';
  if not found then raise exception 'QUIZ_PIN_INCONNU'; end if;

  if (select count(*) from public.quiz_joueurs where partie_id = v_partie.id) >= 120 then
    raise exception 'QUIZ_COMPLET';
  end if;

  begin
    insert into public.quiz_joueurs (partie_id, pseudo) values (v_partie.id, v_pseudo)
    returning jeton into v_jeton;
  exception when unique_violation then
    raise exception 'QUIZ_PSEUDO_PRIS';
  end;
  return jsonb_build_object('jeton', v_jeton, 'partie', v_partie.id, 'pseudo', v_pseudo);
end;
$$;

-- Tout ce que la page élève affiche, en un appel.
create or replace function public.quiz_etat(p_jeton uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  j public.quiz_joueurs%rowtype;
  p public.quiz_parties%rowtype;
  q jsonb;
  r public.quiz_reponses%rowtype;
  n_total integer;
  v_score integer;
  v_rang integer;
  v_joueurs integer;
  borne integer;     -- on compte les points des questions < borne
  res jsonb;
begin
  select * into j from public.quiz_joueurs where jeton = p_jeton;
  if not found then return jsonb_build_object('phase', 'exclu'); end if;
  select * into p from public.quiz_parties where id = j.partie_id;
  if p.ouverte_le < now() - interval '24 hours' then return jsonb_build_object('phase', 'expiree'); end if;

  n_total := jsonb_array_length(p.questions);
  -- Pendant une question, le score affiché s'arrête à la précédente :
  -- sinon le score qui bouge trahirait la justesse avant la correction.
  borne := case when p.phase = 'question' then p.idx else n_total end;

  select greatest(coalesce(sum(x.points), 0), 0) into v_score from public.quiz_reponses x
   where x.joueur_id = j.id and x.idx < borne;
  select count(*) into v_joueurs from public.quiz_joueurs where partie_id = p.id;
  select 1 + count(*) into v_rang from (
    select jj.id, greatest(coalesce(sum(x.points) filter (where x.idx < borne), 0), 0) s
      from public.quiz_joueurs jj left join public.quiz_reponses x on x.joueur_id = jj.id
     where jj.partie_id = p.id group by jj.id) t
   where t.s > v_score;

  res := jsonb_build_object(
    'phase', p.phase, 'idx', p.idx, 'total', n_total, 'version', p.version,
    'mode', p.mode, 'titre', p.titre, 'pseudo', j.pseudo, 'pari', coalesce((p.options->>'pari')::boolean, false),
    'score', greatest(v_score, 0), 'rang', v_rang, 'joueurs', v_joueurs);

  if p.phase in ('question', 'correction') and p.idx between 0 and n_total - 1 then
    q := p.questions->p.idx;
    res := res || jsonb_build_object('question', public.quiz_question_publique(q));
    select * into r from public.quiz_reponses where joueur_id = j.id and idx = p.idx;
    if found then
      res := res || jsonb_build_object('ma_reponse', r.reponse, 'sur', r.sur);
    end if;
    if p.phase = 'question' then
      res := res || jsonb_build_object('reste_ms',
        greatest(0, floor(extract(epoch from (p.fin - now())) * 1000))::integer);
    else
      res := res || jsonb_build_object('correction',
        public.quiz_question_corrigee(q) || jsonb_strip_nulls(jsonb_build_object(
          'repondu',   r.joueur_id is not null,
          'juste',     coalesce(r.juste, false),
          'points',    coalesce(r.points, 0),
          'categorie', r.categorie,
          'pourquoi',  public.quiz_pourquoi(q, r.categorie))));
    end if;
  elsif p.phase = 'fin' then
    res := res || jsonb_build_object('bilan', (
      select jsonb_build_object(
        'justes', count(*) filter (where x.juste),
        'notions', coalesce((
          select jsonb_agg(jsonb_build_object('notion', t.notion, 'ratees', t.ratees, 'sur', t.n) order by t.ratees desc, t.notion)
            from (select coalesce(qq.value->>'notion', 'Sans notion') notion,
                         count(*) n,
                         count(*) filter (where coalesce(xx.juste, false) = false) ratees
                    from jsonb_array_elements(p.questions) with ordinality qq(value, o)
                    left join public.quiz_reponses xx on xx.joueur_id = j.id and xx.idx = qq.o - 1
                   group by 1) t
           where t.ratees > 0), '[]'::jsonb))
        from public.quiz_reponses x where x.joueur_id = j.id));
  end if;
  return res;
end;
$$;

create or replace function public.quiz_repondre(p_jeton uuid, p_idx integer, p_reponse jsonb, p_sur boolean default false)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  j public.quiz_joueurs%rowtype;
  p public.quiz_parties%rowtype;
  q jsonb;
  v jsonb;
  duree integer;
  t integer;
  sur boolean;
begin
  select * into j from public.quiz_joueurs where jeton = p_jeton;
  if not found then raise exception 'QUIZ_EXCLU'; end if;
  select * into p from public.quiz_parties where id = j.partie_id for share;
  -- 1,5 s de grâce : le temps que la réponse traverse le wifi du lycée
  if p.phase <> 'question' or p.idx <> p_idx or now() > p.fin + interval '1.5 seconds' then
    raise exception 'QUIZ_TROP_TARD';
  end if;
  if pg_column_size(p_reponse) >= 4000 or coalesce(jsonb_typeof(p_reponse), '') <> 'object' then
    raise exception 'QUIZ_REPONSE_INVALIDE';
  end if;

  q := p.questions->p_idx;
  v := public.quiz_juger(q, p_reponse);
  duree := (coalesce((q->>'temps')::numeric, 20) * 1000)::integer;
  t := greatest(0, floor(extract(epoch from (now() - p.debut)) * 1000))::integer;
  sur := coalesce(p_sur, false) and coalesce((p.options->>'pari')::boolean, false);

  begin
    insert into public.quiz_reponses (joueur_id, partie_id, idx, reponse, juste, categorie, points, temps_ms, sur)
    values (j.id, p.id, p_idx, p_reponse, (v->>'juste')::boolean, v->>'categorie',
            -- points partiels (assoc, curseur) : la part des points d'une
            -- réponse juste ; un pari sur une réponse incomplète est perdu
            case when (v->>'juste')::boolean or coalesce((v->>'part')::numeric, 0) = 0
                 then public.quiz_points((v->>'juste')::boolean, t, duree, sur)
                 else round(public.quiz_points(true, t, duree, false) * (v->>'part')::numeric)::integer
                      - case when sur then 200 else 0 end end,
            t, sur);
  exception when unique_violation then
    raise exception 'QUIZ_DEJA_REPONDU';
  end;
  -- entraînement : la correction suit la réponse, sans attendre personne
  if p.mode = 'solo' then
    update public.quiz_parties set phase = 'correction', fin = least(fin, now()), version = version + 1
     where id = p.id;
  end if;
  return jsonb_build_object('enregistre', true);
end;
$$;

-- Le QR code fixe d'un quiz : y a-t-il une partie où entrer ?
-- 'ouverte' + PIN si l'auteur du quiz a lancé une partie de classe
-- (encore ouverte aux arrivées), sinon 'attente' : la page élève
-- redemande toutes les quelques secondes, ou propose l'entraînement.
create or replace function public.quiz_salle(p_code text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  z public.quiz_quiz%rowtype;
  v_pin text;
begin
  select * into z from public.quiz_quiz
   where salle = upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  if not found then raise exception 'QUIZ_SALLE_INCONNUE'; end if;
  select pin into v_pin from public.quiz_parties
   where quiz_id = z.id and animateur = z.auteur and mode = 'classe'
     and close_le is null and phase <> 'fin' and ouverte_le > now() - interval '12 hours'
   order by ouverte_le desc limit 1;
  return jsonb_build_object('titre', z.titre, 'questions', jsonb_array_length(z.questions),
                            'etat', case when v_pin is null then 'attente' else 'ouverte' end)
         || case when v_pin is null then '{}'::jsonb else jsonb_build_object('pin', v_pin) end;
end;
$$;

-- S'entraîner seul : une partie 'solo' rien qu'à l'élève, rangée chez
-- l'auteur du quiz. Fermée dès sa création : personne n'y entre par PIN.
create or replace function public.quiz_entrainer(p_code text, p_pseudo text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  z public.quiz_quiz%rowtype;
  v_pseudo text := regexp_replace(btrim(coalesce(p_pseudo, '')), '\s+', ' ', 'g');
  v_qs jsonb;
  v_id uuid;
  v_jeton uuid;
begin
  if v_pseudo ~ '[[:cntrl:]<>]' or v_pseudo like '#%' then raise exception 'QUIZ_PSEUDO_INVALIDE'; end if;
  if length(v_pseudo) < 2 or length(v_pseudo) > 24 then raise exception 'QUIZ_PSEUDO_LONGUEUR'; end if;
  select * into z from public.quiz_quiz
   where salle = upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  if not found then raise exception 'QUIZ_SALLE_INCONNUE'; end if;
  if jsonb_array_length(z.questions) = 0 then raise exception 'QUIZ_VIDE'; end if;
  -- garde-fou : un QR code diffusé ne doit pas remplir la base
  if (select count(*) from public.quiz_parties
       where quiz_id = z.id and mode = 'solo' and ouverte_le > now() - interval '1 hour') >= 200 then
    raise exception 'QUIZ_TROP_D_ESSAIS';
  end if;

  select jsonb_agg(case when x.q->>'type' = 'ordre'
                        then x.q || jsonb_build_object('melange', public.quiz_melange(jsonb_array_length(x.q->'items')))
                        when x.q->>'type' = 'assoc'
                        then x.q || jsonb_build_object('melange', public.quiz_melange(jsonb_array_length(x.q->'paires')))
                        else x.q end order by x.o)
    into v_qs
    from jsonb_array_elements(z.questions) with ordinality x(q, o);

  insert into public.quiz_parties (quiz_id, titre, questions, animateur, pin, groupe, options, mode, close_le)
  values (z.id, z.titre, v_qs, z.auteur, (100000 + floor(random() * 900000))::integer::text,
          'Entraînement', '{"pari": false}'::jsonb, 'solo', now())
  returning id into v_id;
  insert into public.quiz_joueurs (partie_id, pseudo) values (v_id, v_pseudo)
  returning jeton into v_jeton;
  return jsonb_build_object('jeton', v_jeton, 'partie', v_id, 'pseudo', v_pseudo, 'mode', 'solo');
end;
$$;

-- L'élève qui s'entraîne avance lui-même : 'suivante' (depuis l'accueil
-- ou une correction) ou 'corriger' (il passe, ou le temps est écoulé).
create or replace function public.quiz_solo(p_jeton uuid, p_action text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  j public.quiz_joueurs%rowtype;
  p public.quiz_parties%rowtype;
  i integer;
  duree numeric;
begin
  select * into j from public.quiz_joueurs where jeton = p_jeton;
  if not found then raise exception 'QUIZ_EXCLU'; end if;
  select * into p from public.quiz_parties where id = j.partie_id for update;
  if p.mode <> 'solo' then raise exception 'QUIZ_PAS_SOLO'; end if;

  if p_action = 'suivante' then
    if p.phase not in ('accueil', 'correction') then raise exception 'QUIZ_PAS_MAINTENANT'; end if;
    i := p.idx + 1;
    if i >= jsonb_array_length(p.questions) then
      update public.quiz_parties set phase = 'fin', version = version + 1 where id = p.id returning * into p;
    else
      duree := coalesce((p.questions->i->>'temps')::numeric, 20);
      update public.quiz_parties set phase = 'question', idx = i, debut = now(),
             fin = now() + make_interval(secs => duree), version = version + 1
       where id = p.id returning * into p;
    end if;
  elsif p_action = 'corriger' then
    if p.phase <> 'question' then raise exception 'QUIZ_PAS_DE_QUESTION'; end if;
    update public.quiz_parties set phase = 'correction', fin = least(fin, now()), version = version + 1
     where id = p.id returning * into p;
  else
    raise exception 'QUIZ_ACTION_INCONNUE';
  end if;
  return jsonb_build_object('phase', p.phase, 'idx', p.idx, 'version', p.version);
end;
$$;


-- ------------------------------------------------------------
--  7. Côté enseignant : importer, lancer, piloter, suivre
-- ------------------------------------------------------------

-- Importer (ou mettre à jour) un quiz depuis son fichier JSON.
-- Un slug déjà pris par un collègue est refusé, jamais écrasé.
-- « salle » (facultatif) fixe le code du QR code dans le fichier même :
-- les QR codes des diapositives se préparent avant l'import, et restent
-- valables si le quiz est supprimé puis réimporté.
create or replace function public.quiz_importer(p_quiz jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_auteur uuid;
  v_salle text := nullif(upper(btrim(coalesce(p_quiz->>'salle', ''))), '');
begin
  if not public.est_enseignant() then raise exception 'QUIZ_PAS_ENSEIGNANT'; end if;
  if v_salle is not null and v_salle !~ '^[A-HJ-KM-NP-Z2-9]{6}$' then
    raise exception 'QUIZ_SALLE_INVALIDE';
  end if;
  select id, auteur into v_id, v_auteur from public.quiz_quiz where slug = p_quiz->>'slug';
  if found and v_auteur <> auth.uid() then raise exception 'QUIZ_SLUG_PRIS'; end if;
  begin
    if found then
      update public.quiz_quiz set
        titre = p_quiz->>'titre', niveau = p_quiz->>'niveau', matiere = p_quiz->>'matiere',
        description = p_quiz->>'description', questions = coalesce(p_quiz->'questions', '[]'::jsonb),
        partage = coalesce((p_quiz->>'partage')::boolean, partage),
        salle = coalesce(v_salle, salle)
      where id = v_id;
    else
      insert into public.quiz_quiz (slug, titre, niveau, matiere, description, questions, auteur, partage, salle)
      values (p_quiz->>'slug', p_quiz->>'titre', p_quiz->>'niveau', p_quiz->>'matiere',
              p_quiz->>'description', coalesce(p_quiz->'questions', '[]'::jsonb), auth.uid(),
              coalesce((p_quiz->>'partage')::boolean, true), coalesce(v_salle, public.quiz_code_salle()))
      returning id into v_id;
    end if;
  exception when unique_violation then
    raise exception 'QUIZ_SALLE_PRISE';
  end;
  return v_id;
end;
$$;

-- Ouvrir une partie : copie figée des questions, PIN à 6 chiffres.
create or replace function public.quiz_lancer(p_quiz uuid, p_groupe text default null, p_options jsonb default '{}'::jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  z public.quiz_quiz%rowtype;
  v_qs jsonb;
  v_pin text;
  v_id uuid;
  essais integer := 0;
begin
  if not public.est_enseignant() then raise exception 'QUIZ_PAS_ENSEIGNANT'; end if;
  select * into z from public.quiz_quiz where id = p_quiz and (auteur = auth.uid() or partage);
  if not found then raise exception 'QUIZ_INCONNU'; end if;
  if jsonb_array_length(z.questions) = 0 then raise exception 'QUIZ_VIDE'; end if;

  -- les parties oubliées libèrent leur PIN
  update public.quiz_parties set close_le = now()
   where close_le is null and ouverte_le < now() - interval '12 hours';
  -- une salle d'attente abandonnée du même quiz se ferme : le QR code
  -- fixe mène toujours à la partie qu'on vient d'ouvrir
  update public.quiz_parties set close_le = now()
   where quiz_id = z.id and animateur = auth.uid() and mode = 'classe'
     and close_le is null and phase = 'accueil';

  select jsonb_agg(case when x.q->>'type' = 'ordre'
                        then x.q || jsonb_build_object('melange', public.quiz_melange(jsonb_array_length(x.q->'items')))
                        when x.q->>'type' = 'assoc'
                        then x.q || jsonb_build_object('melange', public.quiz_melange(jsonb_array_length(x.q->'paires')))
                        else x.q end order by x.o)
    into v_qs
    from jsonb_array_elements(z.questions) with ordinality x(q, o);

  loop
    essais := essais + 1;
    v_pin := (100000 + floor(random() * 900000))::integer::text;
    begin
      insert into public.quiz_parties (quiz_id, titre, questions, animateur, pin, groupe, options)
      values (z.id, z.titre, v_qs, auth.uid(), v_pin, nullif(btrim(coalesce(p_groupe, '')), ''),
              jsonb_build_object('pari', coalesce((p_options->>'pari')::boolean, false)))
      returning id into v_id;
      exit;
    exception when unique_violation then
      if essais > 20 then raise; end if;
    end;
  end loop;
  return jsonb_build_object('id', v_id, 'pin', v_pin);
end;
$$;

-- Changer d'écran : 'question' (p_idx, ou la suivante), 'corriger', 'fin'.
create or replace function public.quiz_piloter(p_partie uuid, p_action text, p_idx integer default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  p public.quiz_parties%rowtype;
  i integer;
  duree numeric;
begin
  select * into p from public.quiz_parties where id = p_partie and animateur = auth.uid() for update;
  if not found then raise exception 'QUIZ_PARTIE_INCONNUE'; end if;

  if p_action = 'question' then
    i := coalesce(p_idx, p.idx + 1);
    if i < 0 or i >= jsonb_array_length(p.questions) then raise exception 'QUIZ_QUESTION_HORS_LISTE'; end if;
    duree := coalesce((p.questions->i->>'temps')::numeric, 20);
    update public.quiz_parties set phase = 'question', idx = i, debut = now(),
           fin = now() + make_interval(secs => duree), version = version + 1
     where id = p.id returning * into p;
  elsif p_action = 'corriger' then
    if p.phase <> 'question' then raise exception 'QUIZ_PAS_DE_QUESTION'; end if;
    update public.quiz_parties set phase = 'correction', fin = least(fin, now()), version = version + 1
     where id = p.id returning * into p;
  elsif p_action = 'fin' then
    update public.quiz_parties set phase = 'fin', close_le = coalesce(close_le, now()), version = version + 1
     where id = p.id returning * into p;
  elsif p_action = 'fermer' then          -- plus personne n'entre, le jeu continue
    update public.quiz_parties set close_le = coalesce(close_le, now()), version = version + 1
     where id = p.id returning * into p;
  else
    raise exception 'QUIZ_ACTION_INCONNUE';
  end if;
  return jsonb_build_object('phase', p.phase, 'idx', p.idx, 'version', p.version,
    'reste_ms', case when p.phase = 'question'
                     then greatest(0, floor(extract(epoch from (p.fin - now())) * 1000))::integer end);
end;
$$;

-- Le tableau de suivi de l'écran projeté : joueurs, scores, réponses
-- à la question en cours, temps restant selon l'horloge de la base.
create or replace function public.quiz_suivi(p_partie uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  p public.quiz_parties%rowtype;
begin
  select * into p from public.quiz_parties where id = p_partie and animateur = auth.uid();
  if not found then raise exception 'QUIZ_PARTIE_INCONNUE'; end if;
  return jsonb_build_object(
    'phase', p.phase, 'idx', p.idx, 'version', p.version, 'ferme', p.close_le is not null,
    'reste_ms', case when p.phase = 'question'
                     then greatest(0, floor(extract(epoch from (p.fin - now())) * 1000))::integer end,
    'joueurs', coalesce((
      select jsonb_agg(jsonb_build_object('id', jj.id, 'pseudo', jj.pseudo,
               'score', greatest(0, coalesce((select sum(x.points) from public.quiz_reponses x where x.joueur_id = jj.id), 0)))
             order by jj.rejoint_le)
        from public.quiz_joueurs jj where jj.partie_id = p.id), '[]'::jsonb),
    'reponses', coalesce((
      select jsonb_agg(jsonb_build_object('joueur', x.joueur_id, 'reponse', x.reponse, 'juste', x.juste,
               'categorie', x.categorie, 'points', x.points, 'temps_ms', x.temps_ms, 'sur', x.sur))
        from public.quiz_reponses x where x.partie_id = p.id and x.idx = p.idx), '[]'::jsonb));
end;
$$;

-- Exclure un pseudonyme déplacé : ses réponses partent avec lui.
create or replace function public.quiz_exclure(p_partie uuid, p_joueur uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.quiz_joueurs j
   using public.quiz_parties p
   where j.id = p_joueur and j.partie_id = p_partie
     and p.id = j.partie_id and p.animateur = auth.uid()
$$;

-- RGPD : au-delà de 30 jours, les pseudonymes deviennent #1, #2…
create or replace function public.quiz_anonymiser()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  n integer;
begin
  if not public.est_enseignant() then return 0; end if;
  with a as (
    select j.id, '#' || row_number() over (partition by j.partie_id order by j.rejoint_le) nouveau
      from public.quiz_joueurs j join public.quiz_parties p on p.id = j.partie_id
     where p.ouverte_le < now() - interval '30 days'
       and j.partie_id in (select partie_id from public.quiz_joueurs where pseudo not like '#%'))
  update public.quiz_joueurs j set pseudo = a.nouveau from a where j.id = a.id and j.pseudo <> a.nouveau;
  get diagnostics n = row_count;
  return n;
end;
$$;


-- ------------------------------------------------------------
--  8. RLS et droits
--
--  🔴 Supabase accorde par défaut tous les droits aux rôles anon et
--  authenticated sur une table neuve, et l'exécution de toute
--  fonction neuve à PUBLIC : on retire tout, puis on rend le
--  strict nécessaire.
-- ------------------------------------------------------------
alter table public.quiz_quiz     enable row level security;
alter table public.quiz_parties  enable row level security;
alter table public.quiz_joueurs  enable row level security;
alter table public.quiz_reponses enable row level security;

revoke all on public.quiz_quiz, public.quiz_parties, public.quiz_joueurs, public.quiz_reponses
  from anon, authenticated;
grant select, insert, update, delete on public.quiz_quiz to authenticated;
grant select, delete on public.quiz_parties, public.quiz_joueurs, public.quiz_reponses to authenticated;

drop policy if exists quiz_quiz_lire on public.quiz_quiz;
create policy quiz_quiz_lire on public.quiz_quiz for select to authenticated
  using (public.est_enseignant() and (auteur = (select auth.uid()) or partage));
drop policy if exists quiz_quiz_creer on public.quiz_quiz;
create policy quiz_quiz_creer on public.quiz_quiz for insert to authenticated
  with check (public.est_enseignant() and auteur = (select auth.uid()));
drop policy if exists quiz_quiz_modifier on public.quiz_quiz;
create policy quiz_quiz_modifier on public.quiz_quiz for update to authenticated
  using (auteur = (select auth.uid())) with check (auteur = (select auth.uid()));
drop policy if exists quiz_quiz_supprimer on public.quiz_quiz;
create policy quiz_quiz_supprimer on public.quiz_quiz for delete to authenticated
  using (auteur = (select auth.uid()));

drop policy if exists quiz_parties_animateur on public.quiz_parties;
create policy quiz_parties_animateur on public.quiz_parties for select to authenticated
  using (animateur = (select auth.uid()));
drop policy if exists quiz_parties_supprimer on public.quiz_parties;
create policy quiz_parties_supprimer on public.quiz_parties for delete to authenticated
  using (animateur = (select auth.uid()));

drop policy if exists quiz_joueurs_animateur on public.quiz_joueurs;
create policy quiz_joueurs_animateur on public.quiz_joueurs for select to authenticated
  using (exists (select 1 from public.quiz_parties p where p.id = partie_id and p.animateur = (select auth.uid())));

drop policy if exists quiz_reponses_animateur on public.quiz_reponses;
create policy quiz_reponses_animateur on public.quiz_reponses for select to authenticated
  using (exists (select 1 from public.quiz_parties p where p.id = partie_id and p.animateur = (select auth.uid())));

-- Le jeton d'un élève ne sort jamais, pas même vers l'enseignant.
revoke select on public.quiz_joueurs from authenticated;
grant select (id, partie_id, pseudo, rejoint_le) on public.quiz_joueurs to authenticated;

revoke execute on function
  public.quiz_question_invalide(jsonb), public.quiz_quiz_controle(),
  public.quiz_proche(numeric, numeric, numeric), public.quiz_juger(jsonb, jsonb),
  public.quiz_question_publique(jsonb), public.quiz_question_corrigee(jsonb),
  public.quiz_pourquoi(jsonb, text), public.quiz_melange(integer),
  public.quiz_points(boolean, integer, integer, boolean),
  public.quiz_rejoindre(text, text), public.quiz_etat(uuid),
  public.quiz_repondre(uuid, integer, jsonb, boolean),
  public.quiz_importer(jsonb), public.quiz_lancer(uuid, text, jsonb),
  public.quiz_piloter(uuid, text, integer), public.quiz_suivi(uuid),
  public.quiz_exclure(uuid, uuid), public.quiz_anonymiser(),
  public.quiz_code_salle(), public.quiz_salle(text), public.quiz_normaliser(text),
  public.quiz_entrainer(text, text), public.quiz_solo(uuid, text)
  from public, anon, authenticated;

-- l'élève, sans compte
grant execute on function public.quiz_salle(text)                              to anon, authenticated;
grant execute on function public.quiz_entrainer(text, text)                    to anon, authenticated;
grant execute on function public.quiz_solo(uuid, text)                         to anon, authenticated;
grant execute on function public.quiz_rejoindre(text, text)                    to anon, authenticated;
grant execute on function public.quiz_etat(uuid)                               to anon, authenticated;
grant execute on function public.quiz_repondre(uuid, integer, jsonb, boolean)  to anon, authenticated;
-- l'enseignant (chaque fonction vérifie elle-même le rôle ou l'animateur)
grant execute on function public.quiz_question_invalide(jsonb)        to authenticated;
-- défaut de la colonne salle, et contrôle des questions : évalués avec
-- les droits de qui écrit
grant execute on function public.quiz_normaliser(text)                to authenticated;
grant execute on function public.quiz_code_salle()                    to authenticated;
grant execute on function public.quiz_importer(jsonb)                 to authenticated;
grant execute on function public.quiz_lancer(uuid, text, jsonb)       to authenticated;
grant execute on function public.quiz_piloter(uuid, text, integer)    to authenticated;
grant execute on function public.quiz_suivi(uuid)                     to authenticated;
grant execute on function public.quiz_exclure(uuid, uuid)             to authenticated;
grant execute on function public.quiz_anonymiser()                    to authenticated;


-- ------------------------------------------------------------
--  9. Observateurs (046), puis vérification
-- ------------------------------------------------------------
select public.verrouiller_observateurs();

-- Retirer l'outil (à la main, jamais lancé par ce fichier) :
--   drop table public.quiz_reponses, public.quiz_joueurs, public.quiz_parties, public.quiz_quiz;
--   drop function public.quiz_… (les 23 fonctions ci-dessus);

select
  (select count(*) from pg_tables where schemaname = 'public' and tablename like 'quiz\_%') as tables_quiz,
  (select count(*) from pg_proc where proname like 'quiz\_%' and pronamespace = 'public'::regnamespace) as fonctions_quiz;
