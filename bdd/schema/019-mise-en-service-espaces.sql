-- ============================================================
--  019 — Mise en service des espaces : Loïc retrouve ses classes,
--        les élèves peuvent s'y inscrire
--
--  À EXÉCUTER UNE FOIS, APRÈS LE 018, quand le tableau de bord à
--  espaces et le client élève sont en ligne (livraison du
--  13/09/2026). Aucune structure : deux gestes de données et des
--  vérifications.
--
--    §1  Rattacher Loïc à ses sept classes hors SNT — c'est le §8 du
--        018, qui y était en commentaire. Le compte est retrouvé par
--        son rattachement à SNTDEM, rattachée à Loïc SEUL (017) :
--        aucune adresse à recopier.
--    §2  Ouvrir les cinq classes aux inscriptions.
--    §3  Vérifier.
--
--  Rejouable : les insertions sont « on conflict do nothing », la
--  mise à jour est idempotente.
--
--  CE QUE ÇA CHANGE À L'ÉCRAN
--  · Loïc : au prochain chargement du tableau de bord, l'accueil
--    « Mes espaces » avec cinq cartes.
--  · Les collègues : rien.
--  · Les élèves : les codes ES1R02, EST303, EST606, PC2S01 et AP2S26
--    fonctionnent — à la création d'un compte comme dans « Mes
--    classes » pour un compte existant.
-- ============================================================


-- ------------------------------------------------------------
--  1. Rattacher Loïc
-- ------------------------------------------------------------
do $$
declare
  v_auth uuid;
  v_n    int;
begin
  select count(*), min(ec.auth_id::text)::uuid into v_n, v_auth
    from public.enseignants_classes ec
    join public.classes c on c.id = ec.classe_id
   where c.code = 'SNTDEM';

  if v_n <> 1 then
    raise exception 'RATTACHEMENT ABANDONNÉ : SNTDEM a % enseignant(s), 1 attendu. Rien n''a été écrit.', v_n;
  end if;

  insert into public.enseignants_classes (auth_id, classe_id)
  select v_auth, c.id
    from public.classes c
   where c.code in ('ES1R02','EST303','EST606','PC2S01','AP2S26','CFA26A','MVT26A')
  on conflict do nothing;

  raise notice 'RATTACHEMENT FAIT : % classe(s) hors SNT pour le compte de SNTDEM.',
    (select count(*) from public.enseignants_classes ec
       join public.classes c on c.id = ec.classe_id
      where ec.auth_id = v_auth and c.espace <> 'snt');
end $$;
--  « raise exception » et non « notice » comme dans le 018 : l'éditeur
--  SQL s'arrête alors, et le §2 n'ouvre pas des classes que personne
--  ne pourrait suivre.


-- ------------------------------------------------------------
--  2. Ouvrir les inscriptions
--
--  Pour refermer une classe plus tard (après la deuxième séance,
--  comme les groupes de SNT) :
--    update public.classes set actif = false where code = 'CODE';
--  Elle reste dans le tableau de bord ; seules les inscriptions se
--  ferment.
-- ------------------------------------------------------------
update public.classes
   set actif = true
 where code in ('ES1R02','EST303','EST606','PC2S01','AP2S26');


-- ============================================================
--  3. Vérifications — à lire après exécution
-- ============================================================

--  3a. Qui enseigne quoi, par espace.
select e.libelle as enseignant, c.espace, count(*) as classes,
       string_agg(c.code, ' · ' order by c.code) as codes
from public.enseignants_classes ec
join public.enseignants e on e.auth_id = ec.auth_id
join public.classes     c on c.id      = ec.classe_id
group by e.libelle, c.espace
order by e.libelle, c.espace;
--  → pour Loïc : cfa 2 · es1 1 · est 2 · pc2 2 · snt (ses groupes + démos)

--  3b. Les cinq classes sont ouvertes.
select code, libelle, espace, actif
from public.classes
where code in ('ES1R02','EST303','EST606','PC2S01','AP2S26')
order by code;
--  → 5 lignes, actif = true
