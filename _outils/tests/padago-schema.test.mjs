/* ============================================================
 *  padago-schema.test.mjs — banc d'essai de bdd/schema/030-padago.sql
 *  PostgreSQL en WebAssembly (PGlite), auth simulé (auth.uid() lit
 *  request.jwt.claim.sub), rôles anon / authenticated. Rejoue le 030
 *  deux fois, pose SA PROPRE invitation de test (le vrai code n'est
 *  écrit nulle part dans le dépôt), puis 29 contrôles d'intrusion et
 *  les six vérifications de fin de fichier.
 *  Lancer (PGlite n'est pas une dépendance du dépôt) :
 *    mkdir /tmp/banc && cd /tmp/banc && npm i @electric-sql/pglite@0.3
 *    node <dépôt>/_outils/tests/padago-schema.test.mjs <dépôt>/bdd/schema/030-padago.sql
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
insert into auth.users values
 ('00000000-0000-0000-0000-00000000000a','loic@x'),
 ('00000000-0000-0000-0000-00000000000b','collegue@x'),
 ('00000000-0000-0000-0000-00000000000c','eleve@snt.local'),
 ('00000000-0000-0000-0000-00000000000d','squatteur@x');
insert into public.enseignants values ('00000000-0000-0000-0000-00000000000a');
`);
await db.exec(sql);
await db.exec(sql); // rejouable
verif('rejeu', true);
// Invitation propre au banc : le vrai code n'est écrit nulle part dans le dépôt.
await db.exec(`insert into public.padago_invitations (empreinte, libelle)
  values (encode(sha256(convert_to('PADATESTBANC0','UTF8')),'hex'), 'banc d''essai')`);

const comme = async (uid) => {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${uid || ''}', false);`);
  await db.exec(uid ? 'set role authenticated' : 'set role anon');
};
const A='00000000-0000-0000-0000-00000000000a', B='00000000-0000-0000-0000-00000000000b',
      C='00000000-0000-0000-0000-00000000000c', D='00000000-0000-0000-0000-00000000000d';

// Loïc (enseignant) est auteur d'office
await comme(A);
verif('enseignant auteur', (await db.query('select public.padago_suis_auteur() v')).rows[0].v === true);
let t = await tente(`insert into padago_pads (slug,titre,brouillon,publie) values ('abcdefghjk','Pad L','{"code":"SECRET"}','{"h":"x"}')`);
verif('enseignant crée', !t.e);

// La collègue : pas auteur avant invitation
await comme(B);
verif('collègue pas auteur', (await db.query('select public.padago_suis_auteur() v')).rows[0].v === false);
t = await tente(`insert into padago_pads (slug) values ('bcdefghjkm')`);
verif('création refusée sans invitation', !!t.e);
t = await tente(`select public.padago_accepter_invitation('PADA-FAUX-FAUX-FAUX')`);
verif('code faux refusé', t.e && t.e.includes('PADAGO_CODE_INVALIDE'));
t = await tente(`select public.padago_accepter_invitation('pada test banc0')`);
verif('vrai code accepté (normalisé)', !t.e);
verif('collègue auteur', (await db.query('select public.padago_suis_auteur() v')).rows[0].v === true);
t = await tente(`select public.padago_accepter_invitation('PADA-TEST-BANC0')`);
verif('rappel sans dommage', !t.e);
t = await tente(`insert into padago_pads (slug,titre,brouillon,publie,copiable) values ('bcdefghjkm','Pad B','{"code":"B"}','{"h":"y"}',false)`);
verif('collègue crée', !t.e);
verif('collègue ne voit que les siens', (await db.query('select count(*)::int n from padago_pads')).rows[0].n === 1);
t = await tente(`update padago_pads set titre='pirate' where slug='abcdefghjk'`);
verif('ne modifie pas le pad de Loïc', !t.e && t.r.affectedRows === 0);
t = await tente(`update padago_pads set auteur='${A}' where slug='bcdefghjkm' returning auteur`);
verif('auteur immuable', !t.e ? t.r.rows[0]?.auteur === B : true);
t = await tente(`delete from padago_pads where slug='abcdefghjk'`);
verif('ne supprime pas le pad de Loïc', !t.e && t.r.affectedRows === 0);
t = await tente(`select public.padago_copier('ABCDEFGHJK') v`);
verif('copie d\'un pad copiable', !t.e && t.r.rows[0].v.code === 'SECRET');
t = await tente('select * from padago_invitations');
verif('invitations illisibles', !!t.e);
t = await tente('select * from padago_auteurs');
verif('auteurs illisibles', !!t.e);
t = await tente(`insert into padago_auteurs values ('${D}')`);
verif('auto-inscription impossible', !!t.e);

// Le squatteur : le code est déjà utilisé
await comme(D);
t = await tente(`select public.padago_accepter_invitation('PADA-TEST-BANC0')`);
verif('code à usage unique', t.e && t.e.includes('PADAGO_CODE_INVALIDE'));
t = await tente(`select public.padago_copier('abcdefghjk')`);
verif('non-auteur ne copie pas', t.e && t.e.includes('PADAGO_PAS_AUTEUR'));

// Loïc ne copie pas le pad non copiable de B
await comme(A);
t = await tente(`select public.padago_copier('bcdefghjkm') v`);
verif('pad non copiable', !t.e && t.r.rows[0].v === null);

// Élève sans compte : lit la version publiée, rien d'autre
await comme(null);
t = await tente(`select public.padago_lire('abcdefghjk') v`);
verif('anon lit le publié', !t.e && t.r.rows[0].v.h === 'x');
t = await tente('select * from padago_pads');
verif('anon ne liste pas', !!t.e);
t = await tente(`select public.padago_copier('abcdefghjk')`);
verif('anon ne copie pas', !!t.e);
t = await tente(`select public.padago_accepter_invitation('x')`);
verif('anon pas d\'invitation', !!t.e);
t = await tente(`select public.padago_lire('inexistant') v`);
verif('slug inconnu → null', !t.e && t.r.rows[0].v === null);

// Élève connecté (compte du site) : pas auteur
await comme(C);
t = await tente(`insert into padago_pads (slug) values ('cdefghjkmn')`);
verif('élève connecté ne crée pas', !!t.e);

// Taille et slug
await comme(A);
t = await tente(`insert into padago_pads (slug) values ('ABC')`);
verif('slug invalide refusé', !!t.e);
t = await tente(`insert into padago_pads (slug,brouillon) values ('defghjkmnp', jsonb_build_object('x', repeat('a', 500000)))`);
verif('pad trop lourd refusé', !!t.e);

const v = await (async()=>{ await db.exec("reset role"); const r = await db.query(sql.slice(sql.indexOf("select 'trois tables"))); return r.rows; })(); console.log(v.map(x=>(x.ok?"ok ":"KO ")+x.controle).join("\n"));
console.log(`${ok} contrôles passés, ${ko} échecs`);
process.exit(ko ? 1 : 0);
