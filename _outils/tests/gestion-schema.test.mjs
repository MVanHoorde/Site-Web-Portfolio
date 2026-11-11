/* ============================================================
 *  gestion-schema.test.mjs — banc d'essai de bdd/schema/038-gestion-collegues.sql
 *  PostgreSQL en WebAssembly (PGlite), auth simulé, rôles anon /
 *  authenticated, et le strict nécessaire des tables 003/008/016/018
 *  (élèves, enseignants, classes, appartenances). Rejoue le 038 deux
 *  fois, puis contrôle les droits : collègue, élève, gestionnaire.
 *  Lancer (PGlite n'est pas une dépendance du dépôt) :
 *    mkdir /tmp/banc && cd /tmp/banc && npm i @electric-sql/pglite@0.3
 *    node <dépôt>/_outils/tests/gestion-schema.test.mjs <dépôt>/bdd/schema/038-gestion-collegues.sql
 *  (depuis /tmp/banc, pour que l'import de PGlite se résolve : copier
 *  le script dans /tmp/banc au besoin)
 * ============================================================ */
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';

const sql = readFileSync(process.argv[2], 'utf8');
const db = new PGlite();
let ok = 0, ko = 0;
const verif = (nom, cond) => { if (cond) { ok++; } else { ko++; console.log('ÉCHEC :', nom); } };
async function tente(q) { try { return { r: await db.query(q) }; } catch (e) { return { e: e.message }; } }

const L = '00000000-0000-0000-0000-00000000000a',   // Loïc, gestionnaire
      C = '00000000-0000-0000-0000-00000000000b',   // la collègue
      E1 = '00000000-0000-0000-0000-000000000001',  // élève partagé (classe commune)
      E2 = '00000000-0000-0000-0000-000000000002',  // élève de Loïc seul
      CL1 = '10000000-0000-0000-0000-000000000001', CL2 = '10000000-0000-0000-0000-000000000002',
      P1 = '20000000-0000-0000-0000-000000000001', P2 = '20000000-0000-0000-0000-000000000002';

await db.exec(`
create role anon nologin; create role authenticated nologin;
create schema auth;
create table auth.users (id uuid primary key, last_sign_in_at timestamptz);
create function auth.uid() returns uuid language sql stable as
  $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;
grant usage on schema public to anon, authenticated;
alter default privileges in schema public grant all on tables to anon, authenticated;
create table public.enseignants (auth_id uuid primary key references auth.users(id) on delete cascade, libelle text not null);
create table public.classes (id uuid primary key, code text, libelle text);
create table public.eleves (id uuid primary key, auth_id uuid not null unique references auth.users(id) on delete cascade,
  pseudo text not null, classe_id uuid, cree_le timestamptz not null default now());
create table public.eleves_classes (eleve_id uuid references public.eleves(id) on delete cascade, classe_id uuid, primary key (eleve_id, classe_id));
create table public.enseignants_classes (auth_id uuid references public.enseignants(auth_id) on delete cascade, classe_id uuid, primary key (auth_id, classe_id));
create function public.est_enseignant() returns boolean language sql stable security definer set search_path = '' as
  $$ select exists (select 1 from public.enseignants e where e.auth_id = (select auth.uid())) $$;
create function public.mon_eleve(p_eleve uuid) returns boolean language sql stable security definer set search_path = '' as
  $$ select exists (select 1 from public.eleves_classes ap join public.enseignants_classes ec on ec.classe_id = ap.classe_id
                    where ap.eleve_id = p_eleve and ec.auth_id = (select auth.uid())) $$;
insert into auth.users values ('${L}', now()), ('${C}', now()), ('${E1}', null), ('${E2}', now());
insert into public.enseignants values ('${L}', 'M. Van Hoorde'), ('${C}', 'Mme Collègue');
insert into public.classes values ('${CL1}', 'SNT26A', 'SNT 2nde 1'), ('${CL2}', 'PC2S01', 'Physique 2nde 1');
insert into public.eleves values ('${P1}', '${E1}', 'plume24', '${CL1}', now()), ('${P2}', '${E2}', 'dd1301', '${CL2}', now());
insert into public.eleves_classes values ('${P1}', '${CL1}'), ('${P2}', '${CL2}');
insert into public.enseignants_classes values ('${L}', '${CL1}'), ('${C}', '${CL1}'), ('${L}', '${CL2}');
`);
await db.exec(sql);
await db.exec(sql); // rejouable
verif('rejeu', true);
verif('Loïc inscrit gestionnaire', (await db.query(`select count(*)::int n from public.gestionnaires where auth_id = '${L}'`)).rows[0].n === 1);

const comme = async (uid) => {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${uid || ''}', false);`);
  await db.exec(uid ? 'set role authenticated' : 'set role anon');
};
const n = async q => (await db.query(q)).rows[0].n;

// ---- la collègue
await comme(C);
verif('collègue pas gestionnaire', (await db.query('select public.est_gestionnaire() v')).rows[0].v === false);
let t = await tente(`insert into public.demandes_suppression (eleve_id, motif) values ('${P1}', 'doublon de plume25')`);
verif('collègue demande pour son élève', !t.e);
t = await tente(`insert into public.demandes_suppression (eleve_id) values ('${P2}')`);
verif('collègue refusée hors de ses classes', !!t.e);
t = await tente(`insert into public.demandes_suppression (eleve_id, demande_par) values ('${P1}', '${L}')`);
verif('collègue ne demande pas au nom de Loïc', !!t.e);
verif('collègue ne lit pas les demandes des autres', (await db.query('select * from public.gestion_suppressions()')).rows.length === 0);
t = await tente(`select public.effacer_eleve_demande('${P1}')`);
verif('collègue ne peut pas effacer', /GESTIONNAIRE_SEUL/.test(t.e || ''));
t = await tente(`insert into public.reglages_enseignant (eleves_masques, onglets_masques, nouveautes_vues) values ('{${P1}}', '{defi}', '{"cours":1}')`);
verif('collègue enregistre ses réglages', !t.e);
t = await tente(`insert into public.reglages_enseignant (auth_id) values ('${L}')`);
verif('collègue n\'écrit pas les réglages de Loïc', !!t.e);
t = await tente(`insert into public.messages_gestion (message, ou) values ('Deux doublons en SNT26A.', 'Tableau de bord · Suivi')`);
verif('collègue écrit un message', !t.e);
t = await tente(`insert into public.messages_gestion (message, reponse) values ('triche', 'réponse')`);
verif('collègue ne pose pas de réponse', !!t.e);
await tente(`update public.messages_gestion set reponse = 'moi-même'`);
verif('collègue ne répond pas', await n(`select count(*)::int n from public.messages_gestion where reponse is not null`) === 0);
verif('collègue ne lit pas gestion_messages', (await db.query('select * from public.gestion_messages()')).rows.length === 0);

// ---- un élève
await comme(E1);
verif('élève ne lit aucun message', await n('select count(*)::int n from public.messages_gestion') === 0);
t = await tente(`insert into public.messages_gestion (message) values ('je suis élève')`);
verif('élève n\'écrit pas', !!t.e);
t = await tente(`insert into public.demandes_suppression (eleve_id, demande_par) values ('${P2}', '${E1}')`);
verif('élève ne demande rien', !!t.e);
verif('élève ne lit aucun réglage', await n('select count(*)::int n from public.reglages_enseignant') === 0);

// ---- Loïc
await comme(L);
verif('Loïc gestionnaire', (await db.query('select public.est_gestionnaire() v')).rows[0].v === true);
const s = (await db.query('select * from public.gestion_suppressions()')).rows;
verif('Loïc voit la demande', s.length === 1 && s[0].pseudo === 'plume24' && s[0].demande_par === 'Mme Collègue' && s[0].motif === 'doublon de plume25');
verif('Loïc voit les deux enseignants de l\'élève', s[0] && s[0].enseignants.length === 2);
verif('Loïc ne lit pas les réglages de la collègue', await n('select count(*)::int n from public.reglages_enseignant') === 0);
const m = (await db.query('select * from public.gestion_messages()')).rows;
verif('Loïc lit le message avec son auteur', m.length === 1 && m[0].auteur === 'Mme Collègue');
await db.exec(`update public.messages_gestion set reponse = 'C''est fait.', message = 'altéré'`);
const m2 = (await db.query('select message, reponse, repondu_le, lu_le from public.messages_gestion')).rows[0];
verif('réponse datée par le serveur, message intact', m2.reponse === 'C\'est fait.' && m2.repondu_le && m2.lu_le && m2.message === 'Deux doublons en SNT26A.');
t = await tente(`select public.effacer_eleve_demande('00000000-0000-0000-0000-0000000000ff')`);
verif('élève inconnu refusé', /ELEVE_INCONNU/.test(t.e || ''));
t = await tente(`select public.effacer_eleve_demande('${P1}')`);
verif('Loïc efface l\'élève partagé', !t.e);
await db.exec('reset role');
verif('compte, élève et demande partis', await n(`select count(*)::int n from auth.users where id = '${E1}'`) === 0
  && await n(`select count(*)::int n from public.eleves where id = '${P1}'`) === 0
  && await n('select count(*)::int n from public.demandes_suppression') === 0);
// un enseignant qui aurait aussi une fiche élève n'est jamais effacé
await db.exec(`insert into public.eleves values ('20000000-0000-0000-0000-000000000009', '${C}', 'piege', null, now())`);
await comme(L);
t = await tente(`select public.effacer_eleve_demande('20000000-0000-0000-0000-000000000009')`);
verif('jamais un compte enseignant', /COMPTE_ENSEIGNANT/.test(t.e || ''));

// ---- anonyme
await comme(null);
t = await tente('select public.gestion_suppressions()');
verif('anonyme : rien', !!t.e);

console.log(`${ok} contrôles réussis, ${ko} en échec`);
process.exit(ko ? 1 : 0);
