/* ============================================================
 *  padago-fichiers.test.mjs — banc d'essai de bdd/schema/043-padago-fichiers.sql
 *  PostgreSQL en WebAssembly (PGlite), auth et storage simulés
 *  (storage.buckets, storage.objects sous RLS, comme chez Supabase),
 *  rôles anon / authenticated. Rejoue 030 puis 043 deux fois, puis
 *  contrôles d'intrusion et vérifications de fin de fichier.
 *  Lancer (PGlite n'est pas une dépendance du dépôt) :
 *    mkdir banc && cd banc && npm i @electric-sql/pglite@0.3
 *    cp <dépôt>/_outils/tests/padago-fichiers.test.mjs .
 *    node padago-fichiers.test.mjs <dépôt>/bdd/schema/030-padago.sql <dépôt>/bdd/schema/043-padago-fichiers.sql
 * ============================================================ */
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';

const sql030 = readFileSync(process.argv[2], 'utf8');
const sql043 = readFileSync(process.argv[3], 'utf8');
const db = new PGlite();
let ok = 0, ko = 0;
const verif = (nom, cond) => { if (cond) { ok++; } else { ko++; console.log('ÉCHEC :', nom); } };
async function tente(q) { try { return { r: await db.query(q) }; } catch (e) { return { e: e.message }; } }

await db.exec(`
create role anon nologin; create role authenticated nologin;
create schema auth;
create table auth.users (id uuid primary key, email text);
create function auth.uid() returns uuid language sql stable as
  $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;
grant usage on schema public to anon, authenticated;
create table public.enseignants (auth_id uuid primary key references auth.users(id));
create schema storage;
create table storage.buckets (id text primary key, name text, public boolean,
  file_size_limit bigint, allowed_mime_types text[]);
create table storage.objects (id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets(id), name text, owner uuid default auth.uid(),
  metadata jsonb, unique (bucket_id, name));
alter table storage.objects enable row level security;
grant usage on schema storage to anon, authenticated;
grant select, insert, update, delete on storage.objects to anon, authenticated;
grant select on storage.buckets to anon, authenticated;
insert into auth.users values
 ('00000000-0000-0000-0000-00000000000a','loic@x'),
 ('00000000-0000-0000-0000-00000000000b','collegue@x'),
 ('00000000-0000-0000-0000-00000000000c','eleve@snt.local');
insert into public.enseignants values ('00000000-0000-0000-0000-00000000000a');
`);
await db.exec(sql030);
await db.exec(sql043);
await db.exec(sql043); // rejouable
verif('rejeu', true);

const comme = async (uid) => {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${uid || ''}', false);`);
  await db.exec(uid ? 'set role authenticated' : 'set role anon');
};
const A = '00000000-0000-0000-0000-00000000000a', B = '00000000-0000-0000-0000-00000000000b',
      C = '00000000-0000-0000-0000-00000000000c';
const PA = '11111111-1111-1111-1111-111111111111', PB = '22222222-2222-2222-2222-222222222222';
const depose = (nom, taille) => tente(`insert into storage.objects (bucket_id, name, metadata)
  values ('padago', '${nom}', jsonb_build_object('size', ${taille || 1000}))`);

// Deux pads : PA à Loïc, PB à la collègue (inscrite autrice à la main)
await db.exec(`reset role;
  insert into public.padago_auteurs values ('${B}');
  insert into public.padago_pads (id, slug, auteur) values ('${PA}', 'abcdefghjk', '${A}'), ('${PB}', 'bcdefghjkm', '${B}');`);

await comme(A);
let t = await depose(`${A}/${PA}/k3m9q2xa-fiche.pdf`);
verif('autrice dépose dans son pad', !t.e);
t = await depose(`${A}/${PB}/k3m9q2xa-intrus.pdf`);
verif('pas dans le pad d\'une autre', !!t.e);
t = await depose(`${B}/${PB}/k3m9q2xa-intrus.pdf`);
verif('pas dans le dossier d\'une autre', !!t.e);
t = await depose(`${A}/33333333-3333-3333-3333-333333333333/x.pdf`);
verif('pas dans un pad inexistant', !!t.e);
t = await depose(`${A}/${PA}/../../x.pdf`);
verif('chemin mal formé refusé', !!t.e);
t = await depose(`${A}/${PA}/Fiche Ondes.PDF`);
verif('nom non normalisé refusé', !!t.e);
t = await tente(`update storage.objects set metadata = '{"size":1}' where bucket_id = 'padago'`);
verif('pas de remplacement', !t.e && t.r.affectedRows === 0);

// Jauge
t = await tente(`select public.padago_occupation() v`);
verif('jauge lisible', !t.e && +t.r.rows[0].v.total === 1000 && t.r.rows[0].v.nb === 1 && +t.r.rows[0].v.pads[PA] === 1000);

// Plafond de 300 Mo : on remplit jusqu'à 300 Mo, le dépôt suivant est refusé
t = await depose(`${A}/${PA}/aaaaaaaa-gros.pdf`, 314572800 - 1000);
verif('dépôt sous le plafond accepté', !t.e);
t = await depose(`${A}/${PA}/bbbbbbbb-de-trop.pdf`);
verif('dépôt au-delà de 300 Mo refusé', !!t.e);

// La collègue : sa jauge ne voit pas les fichiers de Loïc ; elle peut lire (copie)
await comme(B);
t = await tente(`select public.padago_occupation() v`);
verif('jauge cloisonnée', !t.e && +t.r.rows[0].v.total === 0);
t = await tente(`select count(*)::int n from storage.objects where bucket_id = 'padago'`);
verif('autrice lit pour copier', !t.e && t.r.rows[0].n === 2);
t = await tente(`delete from storage.objects where bucket_id = 'padago'`);
verif('n\'efface pas les fichiers d\'une autre', !t.e && t.r.affectedRows === 0);
t = await depose(`${B}/${PB}/k3m9q2xa-cours.docx`);
verif('collègue invitée dépose', !t.e);

// Élève connecté et visiteur sans compte : rien
await comme(C);
t = await tente(`select count(*)::int n from storage.objects where bucket_id = 'padago'`);
verif('élève connecté ne liste pas', !t.e && t.r.rows[0].n === 0);
t = await depose(`${C}/${PA}/x.pdf`);
verif('élève connecté ne dépose pas', !!t.e);
await comme(null);
t = await tente(`select count(*)::int n from storage.objects where bucket_id = 'padago'`);
verif('anon ne liste pas', !t.e && t.r.rows[0].n === 0);
t = await depose(`${A}/${PA}/x.pdf`);
verif('anon ne dépose pas', !!t.e);
t = await tente(`select public.padago_occupation()`);
verif('anon sans jauge', !!t.e);

// Loïc efface son fichier
await comme(A);
t = await tente(`delete from storage.objects where bucket_id = 'padago' and name like '%-fiche.pdf'`);
verif('propriétaire efface', !t.e && t.r.affectedRows === 1);

await db.exec('reset role');
const v = (await db.query(sql043.slice(sql043.indexOf("select 'stockage padago")))).rows;
console.log(v.map(x => (x.ok ? 'ok ' : 'KO ') + x.controle).join('\n'));
v.forEach(x => verif('vérification : ' + x.controle, x.ok));
console.log(`${ok} contrôles passés, ${ko} échecs`);
process.exit(ko ? 1 : 0);
