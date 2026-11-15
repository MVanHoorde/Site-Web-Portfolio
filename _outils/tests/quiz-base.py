"""Banc d'essai du 047 (quiz) sur un Postgres LOCAL et jetable.

    python _outils/tests/quiz-base.py
    python _outils/tests/quiz-base.py _quiz/bts/*.json   # + relit ces fichiers de quiz

Crée un cluster Postgres temporaire (initdb), pose les doublures de ce
que Supabase fournit (rôles anon/authenticated, auth.uid(), enseignants,
est_enseignant, verrouiller_observateurs), rejoue bdd/schema/047-quiz.sql
DEUX fois (il doit être rejouable), puis _outils/tests/quiz-base.test.sql.
Rien ne touche la base de production.

Prérequis : PostgreSQL installé (scoop install postgresql), binaires
initdb, pg_ctl et psql dans le PATH ou dans ~/scoop/apps/postgresql/current/bin.
"""
import json
import os
import shutil
import socket
import subprocess
import sys
import tempfile
from pathlib import Path

RACINE = Path(__file__).resolve().parents[2]
SCHEMA = RACINE / 'bdd' / 'schema' / '047-quiz.sql'
ESSAIS = Path(__file__).with_name('quiz-base.test.sql')

DOUBLURES = r"""
create role anon nologin;
create role authenticated nologin;
create schema auth;
create table auth.users (id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::uuid
$$;
grant usage on schema auth to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;
grant usage on schema public to anon, authenticated;
create table public.enseignants (auth_id uuid primary key references auth.users (id));
create function public.est_enseignant() returns boolean language sql stable security definer
  set search_path = '' as $$
  select exists (select 1 from public.enseignants e where e.auth_id = (select auth.uid()))
$$;
create function public.verrouiller_observateurs() returns integer language sql as 'select 0';
"""


def binaire(nom):
    trouve = shutil.which(nom)
    if trouve:
        return trouve
    p = Path.home() / 'scoop' / 'apps' / 'postgresql' / 'current' / 'bin' / (nom + '.exe')
    if p.exists():
        return str(p)
    sys.exit(f'{nom} introuvable : installer PostgreSQL (scoop install postgresql).')


def port_libre():
    with socket.socket() as s:
        s.bind(('127.0.0.1', 0))
        return s.getsockname()[1]


def bonne_reponse(q):
    """La réponse juste d'une question, telle que la page élève l'enverrait
    (mélange neutre pour l'ordre et l'association)."""
    t, q = q['type'], dict(q)
    if t in ('qcm', 'vf'):
        return q, {'choix': q['correct']}
    if t == 'num':
        r = {'valeur': q['num']['valeur']}
        if q['num'].get('unite'):
            r['unite'] = q['num']['unite']
        return q, r
    if t == 'ordre':
        q['melange'] = list(range(len(q['items'])))
        return q, {'ordre': list(range(len(q['items'])))}
    if t == 'assoc':
        q['melange'] = list(range(len(q['paires'])))
        return q, {'paires': [[k, k] for k in range(len(q['paires']))]}
    if t == 'zone':
        c = q['zone']['cibles'][0]
        return q, {'x': c['x'] + c['l'] / 2, 'y': c['y'] + c['h'] / 2}
    if t == 'mot':
        return q, {'texte': q['mot']['acceptes'][0]}
    if t == 'curseur':
        return q, {'valeur': q['curseur']['valeur']}
    return q, {}


def main():
    dossier = Path(tempfile.mkdtemp(prefix='quiz-pg-'))
    donnees, port = dossier / 'data', port_libre()
    env = dict(os.environ, PGPASSWORD='', PGCLIENTENCODING='UTF8', PGOPTIONS='-c lc_messages=C')
    subprocess.run([binaire('initdb'), '-D', str(donnees), '-U', 'postgres', '-A', 'trust',
                    '-E', 'UTF8', '--locale=C'], check=True, capture_output=True)
    subprocess.run([binaire('pg_ctl'), '-D', str(donnees), '-o', f'-p {port} -c listen_addresses=127.0.0.1',
                    '-l', str(dossier / 'log.txt'), '-w', 'start'], check=True,
                   # le serveur hérite des sorties de pg_ctl : un tuyau capturé
                   # ne se fermerait jamais, et Python attendrait sans fin
                   stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        def psql(*args, **kw):
            return subprocess.run([binaire('psql'), '-h', '127.0.0.1', '-p', str(port), '-U', 'postgres',
                                   '-d', 'postgres', '-v', 'ON_ERROR_STOP=1', '-X', '-q', *args],
                                  env=env, text=True, encoding='utf-8', errors='replace', capture_output=True, **kw)

        etapes = [('doublures Supabase', ['-c', DOUBLURES]),
                  ('047, premier passage', ['-f', str(SCHEMA)]),
                  ('047, rejoué', ['-f', str(SCHEMA)]),
                  ('essais', ['-f', str(ESSAIS)])]
        for nom, args in etapes:
            r = psql(*args)
            sortie = (r.stdout + r.stderr).strip()
            if r.returncode != 0 or 'ÉCHEC' in sortie:
                print(f'✗ {nom}\n{sortie}')
                sys.exit(1)
            print(f'✓ {nom}' + (f'\n{sortie}' if nom == 'essais' else ''))

        # Fichiers de quiz passés en argument : chaque question au validateur
        # de la base, puis un essai de jugement de sa bonne réponse.
        mauvais = 0
        for chemin in sys.argv[1:]:
            d = json.loads(Path(chemin).read_text(encoding='utf-8'))
            for z in (d['quiz'] if isinstance(d.get('quiz'), list) else [d]):
                for i, q in enumerate(z.get('questions', []), 1):
                    lit = json.dumps(q, ensure_ascii=False).replace("'", "''")
                    # par l'entrée standard : la ligne de commande Windows n'est pas en UTF-8
                    r = psql('-At', input=f"select coalesce(public.quiz_question_invalide('{lit}'::jsonb), 'ok');")
                    verdict = (r.stdout or r.stderr).strip()
                    if verdict != 'ok':
                        mauvais += 1
                        print(f'✗ {Path(chemin).name} — question {i} : {verdict}')
                        continue
                    # la bonne réponse de l'auteur, jugée par la base : elle doit être juste
                    qj, rep = bonne_reponse(q)
                    lq = json.dumps(qj, ensure_ascii=False).replace("'", "''")
                    lr = json.dumps(rep, ensure_ascii=False).replace("'", "''")
                    r = psql('-At', input=f"select public.quiz_juger('{lq}'::jsonb, '{lr}'::jsonb)->>'juste';")
                    if (r.stdout or '').strip() != 'true':
                        mauvais += 1
                        print(f'✗ {Path(chemin).name} — question {i} : la bonne réponse est jugée fausse ({(r.stdout or r.stderr).strip()})')
                print(f'· {Path(chemin).name} : {len(z.get("questions", []))} questions relues')
        if mauvais:
            sys.exit(1)
    finally:
        subprocess.run([binaire('pg_ctl'), '-D', str(donnees), '-m', 'immediate', 'stop'],
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        shutil.rmtree(dossier, ignore_errors=True)


if __name__ == '__main__':
    main()
