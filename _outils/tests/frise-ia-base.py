"""Banc d'essai du 049 (frise de l'IA, tirage des sujets) sur un Postgres LOCAL et jetable.

    python _outils/tests/frise-ia-base.py

Même principe que quiz-base.py : initdb temporaire, doublures de ce que
Supabase et les fichiers 001-018 fournissent (eleves, classes,
eleves_classes, enseignants_classes, eleve_courant, mon_eleve_pour…),
049 rejoué DEUX fois, puis _outils/tests/frise-ia-base.test.sql.
Rien ne touche la base de production.
"""
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

RACINE = Path(__file__).resolve().parents[2]
SCHEMA = RACINE / 'bdd' / 'schema' / '049-frise-ia.sql'
ESSAIS = Path(__file__).with_name('frise-ia-base.test.sql')
SCHEMA_050 = RACINE / 'bdd' / 'schema' / '050-frise-ia-file-attente.sql'
ESSAIS_050 = Path(__file__).with_name('frise-ia-050.test.sql')

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
create table public.classes (id uuid primary key default gen_random_uuid(), code text unique, espace text);
create table public.eleves (id uuid primary key default gen_random_uuid(),
  auth_id uuid unique references auth.users(id) on delete cascade, pseudo text,
  classe_id uuid references public.classes(id));
create table public.eleves_classes (eleve_id uuid references public.eleves(id) on delete cascade,
  classe_id uuid references public.classes(id), primary key (eleve_id, classe_id));
create table public.enseignants_classes (auth_id uuid, classe_id uuid references public.classes(id));
create function public.eleve_courant() returns uuid language sql stable security definer set search_path = '' as $$
  select e.id from public.eleves e where e.auth_id = (select auth.uid()) $$;
create function public.famille_d_espace(p text) returns text language sql immutable as $$
  select case when p in ('es1','est') then 'es' else p end $$;
create function public.famille_de_cle(p text) returns text language sql immutable as $$
  select case when p ~ '^es(1|t)?-' then 'es' else 'snt' end $$;
create function public.mon_eleve_pour(p_eleve uuid, p_cle text) returns boolean language sql stable
  security definer set search_path = '' as $$
  select exists (select 1 from public.eleves_classes ap
    join public.enseignants_classes ec on ec.classe_id = ap.classe_id
    join public.classes c on c.id = ap.classe_id
    where ap.eleve_id = p_eleve and ec.auth_id = (select auth.uid())
      and public.famille_d_espace(c.espace) = public.famille_de_cle(p_cle)) $$;
grant execute on function public.eleve_courant(), public.mon_eleve_pour(uuid, text),
  public.famille_d_espace(text), public.famille_de_cle(text) to authenticated;
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
    import socket
    with socket.socket() as s:
        s.bind(('127.0.0.1', 0))
        return s.getsockname()[1]


def main():
    dossier = Path(tempfile.mkdtemp(prefix='frise-pg-'))
    donnees, port = dossier / 'data', port_libre()
    env = dict(os.environ, PGPASSWORD='', PGCLIENTENCODING='UTF8', PGOPTIONS='-c lc_messages=C')
    subprocess.run([binaire('initdb'), '-D', str(donnees), '-U', 'postgres', '-A', 'trust',
                    '-E', 'UTF8', '--locale=C'], check=True, capture_output=True)
    subprocess.run([binaire('pg_ctl'), '-D', str(donnees), '-o', f'-p {port} -c listen_addresses=127.0.0.1',
                    '-l', str(dossier / 'log.txt'), '-w', 'start'], check=True,
                   stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        def psql(*args):
            return subprocess.run([binaire('psql'), '-h', '127.0.0.1', '-p', str(port), '-U', 'postgres',
                                   '-d', 'postgres', '-v', 'ON_ERROR_STOP=1', '-X', '-q', *args],
                                  env=env, text=True, encoding='utf-8', errors='replace', capture_output=True)
        etapes = [('doublures', ['-c', DOUBLURES]),
                  ('049, premier passage', ['-f', str(SCHEMA)]),
                  ('049, rejoué', ['-f', str(SCHEMA)]),
                  ('essais', ['-f', str(ESSAIS)]),
                  ('050, premier passage', ['-f', str(SCHEMA_050)]),
                  ('050, rejoué', ['-f', str(SCHEMA_050)]),
                  ('essais 050', ['-f', str(ESSAIS_050)])]
        for nom, args in etapes:
            r = psql(*args)
            sortie = (r.stdout + r.stderr).strip()
            if r.returncode != 0 or 'ÉCHEC' in sortie or ' f\n' in sortie + '\n' and nom.startswith('049'):
                print(f'✗ {nom}\n{sortie}')
                sys.exit(1)
            print(f'✓ {nom}' + (f'\n{sortie}' if nom != 'doublures' else ''))
    finally:
        subprocess.run([binaire('pg_ctl'), '-D', str(donnees), '-m', 'immediate', 'stop'],
                       stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        shutil.rmtree(dossier, ignore_errors=True)


if __name__ == '__main__':
    main()
