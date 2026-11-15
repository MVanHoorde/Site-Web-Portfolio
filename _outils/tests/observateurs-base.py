# ============================================================
#  observateurs-base.py — banc de la 046 sur la VRAIE base, sans trace
#  ------------------------------------------------------------
#  Rejoue bdd/schema/046-observateurs.sql dans une transaction qui
#  n'est jamais validée (pas de commit : la CLI ferme, tout est
#  annulé). Un observateur fictif est créé, rattaché aux classes du
#  gestionnaire, puis on tente, avec SON jeton :
#    · une suppression et une modification sur CHAQUE table de public
#      (« where false » : rien ne bouge, mais le verrou par instruction
#      joue quand même) ;
#    · des lectures (elles doivent passer) ;
#    · le stockage, emc_cartes_autoriser, quelques fonctions qui écrivent ;
#  puis avec le jeton du gestionnaire : ses écritures passent toujours.
#  Lancer depuis la racine du dépôt (CLI Supabase liée) :
#    python _outils/tests/observateurs-base.py
#  Aucune donnée d'élève n'est lue : seulement des comptes.
# ============================================================
import json, os, re, subprocess, sys, tempfile
sys.stdout.reconfigure(encoding="utf-8")
DEPOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

mig = open(os.path.join(DEPOT, "bdd/schema/046-observateurs.sql"), encoding="utf-8").read()
# rien ne doit rendre de lignes avant la requête finale (la CLI n'en montre qu'une)
mig = mig[: mig.index("-- Vérifications : chacune doit rendre vrai.")]
mig = mig.replace("select public.verrouiller_observateurs();",
                  "do $v$ begin perform public.verrouiller_observateurs(); end $v$;")

OBS = "00000000-0000-4000-8000-0000000b5e01"
TEST = r"""
create temp table r (nom text, ok boolean, detail text);
grant all on r to authenticated;

insert into auth.users (id, email, aud, role, created_at, updated_at)
values ('%(obs)s', 'observateur.banc@exemple.invalid', 'authenticated', 'authenticated', now(), now());
do $x$ begin perform public.rattacher_observateur('observateur.banc@exemple.invalid', 'BANC'); end $x$;

insert into r select 'rattache aux classes du gestionnaire',
  (select count(*) from public.enseignants_classes where auth_id = '%(obs)s')
    = (select count(distinct ec.classe_id) from public.enseignants_classes ec join public.gestionnaires g on g.auth_id = ec.auth_id)
    and (select count(*) from public.enseignants_classes where auth_id = '%(obs)s') > 0,
  (select count(*)::text from public.enseignants_classes where auth_id = '%(obs)s');

-- ===== avec le jeton de l'observateur =====
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"%(obs)s","role":"authenticated"}';
set local "request.jwt.claim.sub" = '%(obs)s';

insert into r select 'est_enseignant', public.est_enseignant(), null;
insert into r select 'est_observateur', public.est_observateur(), null;
insert into r select 'pas gestionnaire', not public.est_gestionnaire(), null;
insert into r select 'lit ses classes', (select count(*) from public.classes) > 0, (select count(*)::text from public.classes);
insert into r select 'lit les élèves de ses classes', (select count(*) from public.eleves) > 0, (select count(*)::text from public.eleves);
insert into r select 'lit le travail EMC', (select count(*) from public.emc_mots) > 0, (select count(*)::text from public.emc_mots);
insert into r select 'ne lit pas « J''ai besoin d''en parler »', (select count(*) from public.emc_aide) = 0, (select count(*)::text from public.emc_aide);

do $x$
declare t text; ecr text; msg text;
begin
  for t in select c.relname from pg_class c join pg_namespace s on s.oid = c.relnamespace
           where s.nspname = 'public' and c.relkind in ('r','p') order by 1 loop
    foreach ecr in array array['delete', 'update'] loop
      begin
        if ecr = 'delete' then
          execute format('delete from public.%%I where false', t);
        else
          execute format('update public.%%I set %%I = %%I where false', t,
            (select a.attname from pg_attribute a where a.attrelid = ('public.' || t)::regclass and a.attnum > 0 and not a.attisdropped and a.attidentity = '' and a.attgenerated = '' order by a.attnum limit 1),
            (select a.attname from pg_attribute a where a.attrelid = ('public.' || t)::regclass and a.attnum > 0 and not a.attisdropped and a.attidentity = '' and a.attgenerated = '' order by a.attnum limit 1));
        end if;
        insert into r values (ecr || ' ' || t,
          t in ('reglages_enseignant', 'messages_gestion'), 'PASSÉ');
      exception when others then
        msg := sqlerrm;
        insert into r values (ecr || ' ' || t,
          t not in ('reglages_enseignant', 'messages_gestion')
          and (msg like 'LECTURE_SEULE%%' or msg like 'permission denied%%'),
          left(msg, 60));
      end;
    end loop;
  end loop;
end $x$;

-- une vraie insertion dans une table de travail
do $x$ begin
  begin
    insert into public.emc_mots_masques (classe_id, mot)
      select classe_id, 'banc-observateur' from public.emc_seances limit 1;
    insert into r values ('insert emc_mots_masques', false, 'PASSÉ');
  exception when others then
    insert into r values ('insert emc_mots_masques', sqlerrm like 'LECTURE_SEULE%%', left(sqlerrm, 60));
  end;
end $x$;

-- des fonctions qui écrivent en contournant la RLS
do $x$ declare c uuid; begin
  select s.classe_id into c from public.emc_seances s where s.classe_id in (select public.mes_classes()) limit 1;
  begin perform public.emc_reinitialiser(c); insert into r values ('emc_reinitialiser', false, 'PASSÉ');
  exception when others then insert into r values ('emc_reinitialiser', sqlerrm like 'LECTURE_SEULE%%', left(sqlerrm, 60)); end;
  begin perform public.emc_cloturer(c); insert into r values ('emc_cloturer', false, 'PASSÉ');
  exception when others then insert into r values ('emc_cloturer', sqlerrm like 'LECTURE_SEULE%%', left(sqlerrm, 60)); end;
  begin perform public.emc_cartes_autoriser(c); insert into r values ('emc_cartes_autoriser', false, 'PASSÉ');
  exception when others then insert into r values ('emc_cartes_autoriser', sqlerrm like 'PAS_MA_CLASSE%%', left(sqlerrm, 60)); end;
end $x$;

-- le stockage
do $x$ begin
  begin
    insert into storage.objects (bucket_id, name, owner) values ('depots', '%(obs)s/banc/x.jpg', '%(obs)s');
    insert into r values ('stockage : déposer', false, 'PASSÉ');
  exception when others then insert into r values ('stockage : déposer', true, left(sqlerrm, 60)); end;
  begin
    insert into storage.objects (bucket_id, name, owner) values ('bilans', 'emc/banc.html', '%(obs)s');
    insert into r values ('bilans : déposer', false, 'PASSÉ');
  exception when others then insert into r values ('bilans : déposer', true, left(sqlerrm, 60)); end;
end $x$;

-- ses propres réglages : permis
do $x$ begin
  begin
    insert into public.reglages_enseignant (auth_id) values ('%(obs)s')
      on conflict (auth_id) do nothing;
    insert into r values ('ses réglages', true, 'PASSÉ');
  exception when others then insert into r values ('ses réglages', false, left(sqlerrm, 60)); end;
end $x$;

-- ===== avec le jeton du gestionnaire =====
reset role;
do $x$ declare g uuid; begin
  select auth_id into g from public.gestionnaires limit 1;
  perform set_config('request.jwt.claims', json_build_object('sub', g, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', g::text, true);
end $x$;
set local role authenticated;

insert into r select 'gestionnaire : pas observateur', not public.est_observateur(), null;
do $x$ begin
  begin
    insert into public.emc_mots_masques (classe_id, mot)
      select classe_id, 'banc-gestionnaire' from public.emc_seances limit 1;
    insert into r values ('gestionnaire : écrit toujours', true, 'PASSÉ');
  exception when others then insert into r values ('gestionnaire : écrit toujours', false, left(sqlerrm, 60)); end;
end $x$;
do $x$ declare c uuid; begin
  select s.classe_id into c from public.emc_seances s where s.classe_id in (select public.mes_classes()) limit 1;
  begin perform public.emc_cartes_autoriser(c); insert into r values ('gestionnaire : cartes EMC', true, 'PASSÉ');
  exception when others then insert into r values ('gestionnaire : cartes EMC', false, left(sqlerrm, 60)); end;
end $x$;
do $x$ begin
  begin
    insert into storage.objects (bucket_id, name, owner)
      values ('bilans', 'emc/banc.html', (select auth_id from public.gestionnaires limit 1));
    insert into r values ('gestionnaire : dépose un bilan', true, 'PASSÉ');
  exception when others then insert into r values ('gestionnaire : dépose un bilan', false, left(sqlerrm, 60)); end;
end $x$;

reset role;
select json_build_object(
  'total', count(*), 'echecs', count(*) filter (where not ok),
  'detail_echecs', coalesce(json_agg(json_build_object('nom', nom, 'detail', detail)) filter (where not ok), '[]'),
  'tables', count(*) filter (where nom like 'delete %%'),
  'echantillon', (select json_agg(x) from (select nom || ' → ' || coalesce(detail, '') x from r where ok order by nom limit 400) s)
) from r;
""" % {"obs": OBS}

sql = "begin;\n" + mig + "\n" + TEST + "\nrollback;\n"
with tempfile.NamedTemporaryFile("w", suffix=".sql", delete=False, encoding="utf-8", newline="\n") as f:
    f.write(sql); chemin = f.name
r = subprocess.run(["supabase", "db", "query", "--linked", "-o", "json", "-f", chemin],
                   cwd=DEPOT, capture_output=True, text=True, encoding="utf-8", shell=True)
os.unlink(chemin)
txt = r.stdout
i = txt.find("{")
if i < 0:
    print("ÉCHEC DE LA CLI", r.stderr[-2000:]); sys.exit(1)
d = json.loads(txt[i:])
res = d["rows"][0]["json_build_object"]
if isinstance(res, str): res = json.loads(res)
print(f"{res['total']} contrôles, {res['echecs']} échec(s), {res['tables']} tables essayées")
for e in res["detail_echecs"]:
    print("  ÉCHEC :", e["nom"], "—", e["detail"])
if "-v" in sys.argv:
    for x in res["echantillon"] or []: print("  ok :", x)
sys.exit(1 if res["echecs"] else 0)
