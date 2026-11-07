/* ============================================================
 *  emc-schema.test.mjs — banc d'essai de bdd/schema/031-emc.sql
 *  PostgreSQL en WebAssembly (PGlite), auth simulé (auth.uid() lit
 *  request.jwt.claim.sub), rôles anon / authenticated, et le strict
 *  nécessaire des tables d'identité (001, 003, 006, 008, 016, 018)
 *  pour que le 031 s'exécute comme en ligne.
 *
 *  Une classe de 40 élèves virtuels, dont 30 comptes créés pour
 *  l'EMC et 10 élèves de SNT qui entrent avec leur compte ; Loïc et
 *  Mme Castel rattachés aux 4 classes EMC, un troisième enseignant
 *  qui ne l'est pas. Puis les intrusions : écrire hors de sa zone,
 *  voter hors de la situation ouverte, lire l'aide, l'enquête…
 *
 *  Lancer (PGlite n'est pas une dépendance du dépôt) :
 *    mkdir <banc> && cd <banc> && npm i @electric-sql/pglite@0.3
 *    cp <dépôt>/_outils/tests/emc-schema.test.mjs <banc>/
 *    node emc-schema.test.mjs <dépôt>
 * ============================================================ */
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const depot = process.argv[2] || '.';
const sql = readFileSync(join(depot, 'bdd/schema/031-emc.sql'), 'utf8')
  + (process.env.SANS_032 ? '' : '\n' + readFileSync(join(depot, 'bdd/schema/032-emc-fusion.sql'), 'utf8'))
  + '\n' + readFileSync(join(depot, 'bdd/schema/033-emc-contenus.sql'), 'utf8');
const { points } = JSON.parse(readFileSync(join(depot, '_outils/tests/emc-points.json'), 'utf8'));

const db = new PGlite();
let ok = 0, ko = 0;
const verif = (nom, cond, detail) => {
  if (cond) ok++;
  else { ko++; console.log('ÉCHEC :', nom, detail === undefined ? '' : JSON.stringify(detail)); }
};

/* ---------- socle : ce que le 031 trouve en ligne ---------- */
await db.exec(`
create role anon nologin; create role authenticated nologin;
create schema auth;
create table auth.users (id uuid primary key, email text);
create function auth.uid() returns uuid language sql stable as
  $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;
grant usage on schema public to anon, authenticated;

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique, libelle text not null, annee_scolaire text not null,
  actif boolean not null default true, avance_max int not null default 2,
  espace text not null default 'snt');
alter table public.classes add constraint classes_espace_connu
  check (espace in ('snt', 'es1', 'est', 'pc2', 'cfa'));
create table public.eleves (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid not null unique references auth.users on delete cascade,
  pseudo text not null,
  classe_id uuid not null references public.classes on delete restrict);
create table public.eleves_classes (
  eleve_id uuid references public.eleves on delete cascade,
  classe_id uuid references public.classes on delete restrict,
  rejoint_le timestamptz not null default clock_timestamp(),
  primary key (eleve_id, classe_id));
create table public.enseignants (auth_id uuid primary key references auth.users on delete cascade, libelle text);
create table public.enseignants_classes (
  auth_id uuid references public.enseignants on delete cascade,
  classe_id uuid references public.classes on delete cascade,
  primary key (auth_id, classe_id));

create function public.eleve_courant() returns uuid language sql stable security definer set search_path = '' as
  $$ select e.id from public.eleves e where e.auth_id = (select auth.uid()) $$;
create function public.est_enseignant() returns boolean language sql stable security definer set search_path = '' as
  $$ select exists(select 1 from public.enseignants where auth_id = (select auth.uid())) $$;
create function public.mes_classes() returns setof uuid language sql stable security definer set search_path = '' as
  $$ select ec.classe_id from public.enseignants_classes ec where ec.auth_id = (select auth.uid()) $$;
grant execute on function public.eleve_courant(), public.est_enseignant(), public.mes_classes() to authenticated;
grant select on public.classes, public.eleves, public.eleves_classes to authenticated;

insert into public.classes (code, libelle, annee_scolaire, espace) values ('SNT26A', 'SNT A', '2026-2027', 'snt');
`);

/* rejouable : deux passages */
await db.exec(sql);
const rejoue = await db.exec(sql).then(() => true, (e) => e.message);
verif('le 031 se rejoue', rejoue === true, rejoue);

/* ---------- acteurs ---------- */
const U = (n) => '00000000-0000-0000-0000-' + String(n).padStart(12, '0');
const LOIC = U(9001), CASTEL = U(9002), AUTRE = U(9003);
const classe = async (code) => (await db.query(`select id from public.classes where code = $1`, [code])).rows[0].id;
const C1 = await classe('NINA27'), C2 = await classe('NINA48'), SNT = await classe('SNT26A');

await db.exec(`
insert into auth.users values ('${LOIC}', 'loic@x'), ('${CASTEL}', 'castel@x'), ('${AUTRE}', 'autre@x');
insert into public.enseignants values ('${LOIC}', 'VAN HOORDE'), ('${CASTEL}', 'CASTEL'), ('${AUTRE}', 'AUTRE');
insert into public.enseignants_classes select a, c.id from public.classes c,
  unnest(array['${LOIC}', '${CASTEL}']::uuid[]) a where c.espace = 'emc';
insert into public.enseignants_classes values ('${LOIC}', '${SNT}'), ('${AUTRE}', '${SNT}');
`);

/* 30 comptes créés avec le code EMC (classe d'inscription = C1),
   10 élèves de SNT qui entreront avec leur compte. */
const eleves = [];
for (let i = 1; i <= 40; i++) {
  const uid = U(i), insc = i <= 30 ? C1 : SNT;
  await db.query(`insert into auth.users values ($1, $2)`, [uid, `e${i}@snt.local`]);
  const r = await db.query(`insert into public.eleves (auth_id, pseudo, classe_id) values ($1, $2, $3) returning id`, [uid, 'e' + i, insc]);
  await db.query(`insert into public.eleves_classes (eleve_id, classe_id) values ($1, $2)`, [r.rows[0].id, insc]);
  eleves.push({ uid, id: r.rows[0].id, emc: i <= 30 });
}
const intrus = U(99);
await db.query(`insert into auth.users values ($1, 'intrus@snt.local')`, [intrus]);
const ri = await db.query(`insert into public.eleves (auth_id, pseudo, classe_id) values ($1, 'intrus', $2) returning id`, [intrus, SNT]);
await db.query(`insert into public.eleves_classes values ($1, $2)`, [ri.rows[0].id, SNT]);

/* exécuter en tant que… */
async function en(uid, q, params) {
  await db.query(`select set_config('request.jwt.claim.sub', $1, false)`, [uid || '']);
  await db.exec('set role authenticated');
  try { return { r: await db.query(q, params) }; }
  catch (e) { return { e: e.message }; }
  finally { await db.exec('reset role'); }
}
const lignes = (x) => (x.r ? x.r.rows : []);
const nb = (x) => (x.r ? (x.r.affectedRows ?? x.r.rows.length) : -1);

/* ---------- 1. structure ---------- */
verif('4 classes EMC', (await db.query(`select count(*)::int n from public.classes where espace = 'emc'`)).rows[0].n === 4);
verif('4 séances ouvertes d\'office', (await db.query(`select count(*)::int n from public.emc_seances`)).rows[0].n === 4);
const cles = (await db.query(`select cle from public.emc_contenus order by cle`)).rows.map((r) => r.cle);
verif('9 contenus initiaux', cles.length === 9, cles);
const h = (await db.query(`select valeur from public.emc_contenus where cle = 'harcelometre'`)).rows[0].valeur;
verif('harcèlomètre : 10 situations actives, 13 en réserve',
  h.situations.filter((s) => s.actif).length === 10 && h.situations.filter((s) => !s.actif).length === 13);
const m = (await db.query(`select valeur from public.emc_contenus where cle = 'missions'`)).rows[0].valeur;
verif('8 missions, 3 sous-zones chacune', m.length === 8 && m.every((x, i) => x.table === i + 1 && x.sous_zones.length === 3));
/* 033, passé deux fois : ajoute sans doublon, et n'écrase pas un réglage */
const val = async (cle) => (await db.query(`select valeur from public.emc_contenus where cle = $1`, [cle])).rows[0].valeur;
const em = (await val('mots')).emojis;
verif('033 : 32 émojis, sans doublon', em.length === 32 && new Set(em.map((x) => x.e)).size === 32, em.length);
verif('033 : titre de l\'étape 1', (await val('etapes'))[1].titre === 'Premiers mots, premières émotions');
const nums = await val('numeros');
verif('033 : 4 numéros avec icône, qui, quand', nums.length === 4 && nums.every((x) => x.icone && x.qui && x.quand));
const vids = await val('videos');
verif('033 : 2 vidéos, la campagne 2022-2023 d\'abord', vids.length === 2 && /gFWq2W0Jly8/.test(vids[0].lien) && /3018/.test(vids[1].note));
verif('033 : une icône par mission', m.length === 8 && (await val('missions')).every((x) => x.icone));
await db.query(`update public.emc_contenus set valeur = '[{"numero":"3018","sens":"réglé à la main"}]' where cle = 'numeros'`);
await db.query(`update public.emc_contenus set valeur = '[{"titre":"ma vidéo","mp4":"","lien":"","credits":""}]' where cle = 'videos'`);
await db.exec(readFileSync(join(depot, 'bdd/schema/033-emc-contenus.sql'), 'utf8'));
verif('033 rejoué : un numéro réglé à la main reçoit les détails, garde son texte',
  (await val('numeros'))[0].sens === 'réglé à la main' && !!(await val('numeros'))[0].qui);
verif('033 rejoué : une vidéo réglée à la main n\'est pas remplacée', (await val('videos'))[0].titre === 'ma vidéo');
await db.query(`update public.emc_contenus set valeur = $1 where cle = 'numeros'`, [JSON.stringify(nums)]);
await db.query(`update public.emc_contenus set valeur = $1 where cle = 'videos'`, [JSON.stringify(vids)]);

/* ---------- 2. géométrie ---------- */
for (const [x, y, z] of points) {
  const r = (await db.query(`select public.emc_zone_de($1, $2) z`, [x, y])).rows[0].z;
  verif(`zone de (${x}, ${y})`, r === z, { obtenu: r, attendu: z });
}
const dz = async (zone, type, d) => (await db.query(`select public.emc_dans_zone($1, $2, $3) v`, [zone, type, JSON.stringify(d)])).rows[0].v;
verif('trait dans la zone 1', await dz(1, 'trait', { points: [700, -700, 800, -800, 900, -600] }));
verif('trait qui déborde en zone 2', !(await dz(1, 'trait', { points: [700, -700, 1000, -1000] })));
verif('trait à nombre impair de coordonnées', !(await dz(1, 'trait', { points: [700, -700, 800] })));
verif('trait avec une coordonnée texte', !(await dz(1, 'trait', { points: [700, '-700'] })));
verif('texte dans la zone 2', await dz(2, 'texte', { x: 1400, y: -1800, l: 300, h: 80, texte: 'x' }));
verif('texte qui mord sur l\'anneau intérieur', !(await dz(2, 'texte', { x: 800, y: -1300, l: 600, h: 400 })));
verif('texte sans x', !(await dz(2, 'texte', { y: -1800, l: 300, h: 80 })));
verif('boîte trop grande', !(await dz(2, 'forme', { x: 1400, y: -1800, l: 5000, h: 80 })));
verif('type inconnu', !(await dz(1, 'image', { x: 700, y: -700, l: 10, h: 10 })));

/* ---------- 3. entrer, tables équilibrées ---------- */
const tables = {};
for (const [i, e] of eleves.entries()) {
  const x = await en(e.uid, `select public.emc_entrer($1) j`, [i < 30 ? null : 'nina27']);
  const j = x.r && x.r.rows[0].j;
  verif('entrer élève ' + (i + 1), j && j.classe_id === C1, x.e);
  if (j) { e.table = j.table_num; tables[j.table_num] = (tables[j.table_num] || 0) + 1; verif('nouveau = compte EMC (' + (i + 1) + ')', j.nouveau === e.emc); }
}
verif('40 élèves → 5 par table', Object.keys(tables).length === 8 && Object.values(tables).every((n) => n === 5), tables);
const re = await en(eleves[0].uid, `select public.emc_entrer(null) j`);
verif('se reconnecter redonne la même table', re.r && re.r.rows[0].j.table_num === eleves[0].table);
const re2 = await en(eleves[35].uid, `select public.emc_entrer('NINA27') j`);
verif('un compte existant qui retape le code garde sa table', re2.r && re2.r.rows[0].j.table_num === eleves[35].table);
verif('code inconnu refusé', /CODE_EMC_INCONNU/.test((await en(intrus, `select public.emc_entrer('XXXXXX')`)).e || ''));
verif('code SNT refusé comme code EMC', /CODE_EMC_INCONNU/.test((await en(intrus, `select public.emc_entrer('SNT26A')`)).e || ''));
verif('sans code ni classe EMC : refus', /PAS_DE_CLASSE_EMC/.test((await en(intrus, `select public.emc_entrer(null)`)).e || ''));
verif('sans session : refus', /AUCUNE_SESSION/.test((await en(null, `select public.emc_entrer('NINA27')`)).e || ''));

/* ---------- 4. prêt ---------- */
for (const e of eleves.slice(0, 33)) await en(e.uid, `select public.emc_pret($1, true)`, [C1]);
await en(eleves[0].uid, `select public.emc_pret($1, false)`, [C1]);
const prets = lignes(await en(CASTEL, `select count(*) filter (where pret)::int p, count(*)::int n from public.emc_participants where classe_id = $1`, [C1]))[0];
verif('Mme Castel compte 32 prêts sur 40', prets && prets.p === 32 && prets.n === 40, prets);
verif('l\'élève ne voit que sa ligne', lignes(await en(eleves[1].uid, `select * from public.emc_participants`)).length === 1);
verif('le collègue extérieur ne voit aucun participant', lignes(await en(AUTRE, `select * from public.emc_participants`)).length === 0);
verif('prêt hors séance refusé', /PAS_DANS_LA_SEANCE/.test((await en(intrus, `select public.emc_pret($1, true)`, [C1])).e || ''));

/* ---------- 5. pilotage ---------- */
const etape = (n, extra = '') => en(LOIC, `update public.emc_seances set etape = ${n} ${extra} where classe_id = $1`, [C1]);
verif('un élève ne change pas d\'étape', nb(await en(eleves[0].uid, `update public.emc_seances set etape = 7 where classe_id = $1`, [C1])) <= 0);
verif('le collègue extérieur ne change pas d\'étape', nb(await en(AUTRE, `update public.emc_seances set etape = 7 where classe_id = $1`, [C1])) <= 0);
verif('l\'élève lit l\'étape de sa séance', lignes(await en(eleves[0].uid, `select etape from public.emc_seances`)).length === 1);

/* ---------- 6. mots ---------- */
const mot = (e) => en(e.uid, `insert into public.emc_mots (classe_id, eleve_id, mots, emojis) values ($1, $2, $3, $4)`, [C1, e.id, ['Peur', 'moquerie'], ['😢']]);
verif('mots refusés avant l\'étape 1', !!(await mot(eleves[0])).e);
await etape(1);
verif('mots acceptés à l\'étape 1', !(await mot(eleves[0])).e);
/* Ce qu'envoie vraiment la page (merge-duplicates) : PostgREST
   réécrit TOUTES les colonnes envoyées, clé comprise (032). */
const motPgrst = (e) => en(e.uid, `insert into public.emc_mots (classe_id, eleve_id, mots, emojis) values ($1, $2, $3, $4)
  on conflict (classe_id, eleve_id) do update set classe_id = excluded.classe_id, eleve_id = excluded.eleve_id,
  mots = excluded.mots, emojis = excluded.emojis`, [C1, e.id, ['respect'], ['🤝']]);
verif('mots : upsert PostgREST, premier envoi', !(await motPgrst(eleves[4])).e);
const renvoi = await motPgrst(eleves[0]);
verif('mots : upsert PostgREST, renvoi qui corrige', !renvoi.e, renvoi.e);
verif('mots : on ne déplace pas sa ligne vers une autre séance', nb(await en(eleves[0].uid,
  `update public.emc_mots set classe_id = $1 where eleve_id = $2`, [C2, eleves[0].id])) <= 0);
await db.query(`delete from public.emc_mots where eleve_id = $1`, [eleves[4].id]);
verif('mots au nom d\'un autre refusés', !!(await en(eleves[1].uid, `insert into public.emc_mots (classe_id, eleve_id, mots) values ($1, $2, '{a}')`, [C1, eleves[2].id])).e);
verif('4 mots refusés', !!(await en(eleves[3].uid, `insert into public.emc_mots (classe_id, eleve_id, mots) values ($1, $2, '{a,b,c,d}')`, [C1, eleves[3].id])).e);
verif('l\'élève ne lit pas les mots des autres', lignes(await en(eleves[1].uid, `select * from public.emc_mots`)).length === 0);
verif('Mme Castel lit les mots', lignes(await en(CASTEL, `select * from public.emc_mots where classe_id = $1`, [C1])).length === 1);
verif('Mme Castel masque un mot', !(await en(CASTEL, `insert into public.emc_mots_masques values ($1, 'moquerie')`, [C1])).e);
verif('un élève ne masque pas', !!(await en(eleves[1].uid, `insert into public.emc_mots_masques values ($1, 'peur')`, [C1])).e);

/* ---------- 7. notes de table ---------- */
await etape(3);
for (const e of eleves) await en(e.uid, `insert into public.emc_notes (classe_id, eleve_id, texte) values ($1, $2, $3)`, [C1, e.id, 'note de ' + e.id]);
const e0 = eleves[0];
const notePgrst = await en(e0.uid, `insert into public.emc_notes (classe_id, eleve_id, texte) values ($1, $2, $3)
  on conflict (classe_id, eleve_id) do update set classe_id = excluded.classe_id, eleve_id = excluded.eleve_id,
  texte = excluded.texte`, [C1, e0.id, 'note de ' + e0.id]);
verif('notes : upsert PostgREST', !notePgrst.e, notePgrst.e);
const notes = lignes(await en(e0.uid, `select eleve_id from public.emc_notes`));
verif('je lis les 5 notes de ma table, pas les autres', notes.length === 5 && notes.every((n) => eleves.find((x) => x.id === n.eleve_id).table === e0.table), notes.length);
verif('je ne modifie pas la note d\'un autre', nb(await en(e0.uid, `update public.emc_notes set texte = 'x' where eleve_id <> $1`, [e0.id])) <= 0);

/* ---------- 8. carte ---------- */
const pointDansZone = { 1: [700, -700], 2: [1500, -1500], 3: [-700, -700], 4: [-1500, -1500], 5: [-700, 700], 6: [-1500, 1500], 7: [700, 700], 8: [1500, 1500] };
const trait = (z, dx = 0) => ({ points: [pointDansZone[z][0] + dx, pointDansZone[z][1], pointDansZone[z][0] + dx + 20, pointDansZone[z][1] + 20] });
let n = 0;
const uuid = () => '10000000-0000-4000-8000-' + String(++n).padStart(12, '0');
const dessiner = (e, zone, d, type = 'trait', id = uuid()) =>
  en(e.uid, `insert into public.emc_carte (id, classe_id, eleve_id, auteur, zone, type, couleur, donnees) values ($1, $2, $3, $4, $5, $6, 'bleu', $7)`,
    [id, C1, e.id, e.uid, zone, type, JSON.stringify(d)]);
verif('carte fermée avant l\'étape 4', !!(await dessiner(e0, e0.table, trait(e0.table))).e);
await etape(4);
let refusHorsZone = 0, refusForce = 0, acceptes = 0;
for (const e of eleves) {
  const autre = (e.table % 8) + 1;
  if (!(await dessiner(e, e.table, trait(e.table))).e) acceptes++;
  if ((await dessiner(e, autre, trait(autre))).e) refusHorsZone++;          // zone d'une autre table
  if ((await dessiner(e, e.table, trait(autre))).e) refusForce++;           // bonne zone déclarée, points ailleurs
}
verif('40 élèves dessinent dans leur zone', acceptes === 40, acceptes);
verif('40 refus dans la zone d\'une autre table', refusHorsZone === 40, refusHorsZone);
verif('40 refus quand le client ment sur la zone', refusForce === 40, refusForce);
verif('le centre est réservé aux enseignants', !!(await dessiner(e0, 0, { points: [0, 0, 10, 10] })).e);
verif('un élément au nom d\'un autre refusé', !!(await en(e0.uid,
  `insert into public.emc_carte (id, classe_id, eleve_id, auteur, zone, type, donnees) values ($1, $2, $3, $4, $5, 'trait', $6)`,
  [uuid(), C1, eleves[1].id, e0.uid, e0.table, JSON.stringify(trait(e0.table))])).e);
const idTexte = uuid();
verif('texte dans ma zone', !(await dessiner(e0, e0.table, { x: pointDansZone[e0.table][0], y: pointDansZone[e0.table][1], l: 60, h: 30, texte: 'insulte' }, 'texte', idTexte)).e);
verif('renvoi du même élément (coupure) : refusé sans doublon', !!(await dessiner(e0, e0.table, trait(e0.table), 'trait', idTexte)).e);
verif('annuler (supprime) mon élément', nb(await en(e0.uid, `update public.emc_carte set supprime = true where id = $1`, [idTexte])) === 1);
await en(e0.uid, `update public.emc_carte set supprime = false where id = $1`, [idTexte]);
verif('je ne touche pas l\'élément d\'un autre', nb(await en(e0.uid, `update public.emc_carte set supprime = true where eleve_id <> $1`, [e0.id])) <= 0);
verif('je ne masque pas moi-même', nb(await en(e0.uid, `update public.emc_carte set masque = true where id = $1`, [idTexte])) <= 0
  || lignes(await en(LOIC, `select masque from public.emc_carte where id = $1`, [idTexte]))[0].masque === false);
verif('Loïc masque le texte', nb(await en(LOIC, `update public.emc_carte set masque = true where id = $1`, [idTexte])) === 1);
const vu = lignes(await en(eleves[1].uid, `select donnees, masque from public.emc_carte where id = $1`, [idTexte]))[0];
verif('masqué : l\'élève voit la ligne vide', vu && vu.masque && Object.keys(vu.donnees).length === 0, vu);
verif('masqué : l\'élève ne lit pas le contenu caché', lignes(await en(eleves[1].uid, `select * from public.emc_carte_masques`)).length === 0);
verif('masqué : Mme Castel le lit', lignes(await en(CASTEL, `select donnees from public.emc_carte_masques where id = $1`, [idTexte]))[0]?.donnees.texte === 'insulte');
verif('masqué : l\'auteur ne peut plus le modifier', nb(await en(e0.uid, `update public.emc_carte set supprime = true where id = $1`, [idTexte])) <= 0);
await en(LOIC, `update public.emc_carte set masque = false where id = $1`, [idTexte]);
verif('démasqué : le contenu revient', lignes(await en(eleves[1].uid, `select donnees from public.emc_carte where id = $1`, [idTexte]))[0]?.donnees.texte === 'insulte');
verif('Loïc écrit au centre', !(await en(LOIC, `insert into public.emc_carte (id, classe_id, zone, type, donnees) values ($1, $2, 0, 'texte', $3)`,
  [uuid(), C1, JSON.stringify({ x: -200, y: -40, l: 400, h: 80, texte: 'titre' })])).e);
await etape(4, `, zones_verrouillees = array[${e0.table}]`);
verif('zone verrouillée : refus', !!(await dessiner(e0, e0.table, trait(e0.table, 5))).e);
await etape(4, `, zones_verrouillees = '{}', carte_figee = true`);
verif('carte figée : refus', !!(await dessiner(e0, e0.table, trait(e0.table, 5))).e);
await etape(4, `, carte_figee = false`);
verif('un élève d\'une autre séance ne lit pas la carte', lignes(await en(intrus, `select * from public.emc_carte`)).length === 0);
verif('le collègue extérieur ne lit pas la carte', lignes(await en(AUTRE, `select * from public.emc_carte`)).length === 0);
verif('canal = classe:zone', lignes(await en(LOIC, `select canal, zone from public.emc_carte limit 1`))[0]?.canal.endsWith(':' + lignes(await en(LOIC, `select zone from public.emc_carte limit 1`))[0].zone));

/* ---------- 9. harcèlomètre ---------- */
const voter = (e, s, v) => en(e.uid, `insert into public.emc_votes (classe_id, situation, eleve_id, valeur) values ($1, $2, $3, $4)
  on conflict (classe_id, situation, eleve_id) do update set valeur = excluded.valeur`, [C1, s, e.id, v]);
verif('vote refusé hors étape 6', !!(await voter(e0, 's10', 3)).e);
await etape(6, `, situation_courante = 's10', situation_revelee = false`);
let somme = 0;
for (const [i, e] of eleves.entries()) { const v = i % 11; somme += v; await voter(e, 's10', v); }
verif('vote modifiable tant que la situation est ouverte', !(await voter(e0, 's10', 10)).e);
const votePgrst = await en(e0.uid, `insert into public.emc_votes (classe_id, situation, eleve_id, valeur) values ($1, 's10', $2, 10)
  on conflict (classe_id, situation, eleve_id) do update set classe_id = excluded.classe_id, situation = excluded.situation,
  eleve_id = excluded.eleve_id, valeur = excluded.valeur`, [C1, e0.id]);
verif('votes : upsert PostgREST', !votePgrst.e, votePgrst.e);
somme += 10;
const moy = lignes(await en(CASTEL, `select avg(valeur)::float m, count(*)::int n from public.emc_votes where classe_id = $1 and situation = 's10'`, [C1]))[0];
verif('moyenne exacte sur 40 votes', moy && moy.n === 40 && Math.abs(moy.m - somme / 40) < 1e-9, moy);
verif('vote sur une autre situation refusé', !!(await voter(e0, 's1', 5)).e);
await etape(6, `, situation_revelee = true`);
verif('vote refusé une fois la zone révélée', !!(await voter(e0, 's10', 2)).e);
verif('l\'élève ne lit pas les votes des autres', lignes(await en(e0.uid, `select * from public.emc_votes`)).length === 1);

/* ---------- 10. enquête ---------- */
const repondre = (e) => en(e.uid, `select public.emc_repondre_enquete($1, $2, $3)`, [C1, JSON.stringify({ q1: 'non', q4: 'oui' }), 'rien']);
verif('enquête fermée avant l\'étape 7', /ENQUETE_FERMEE/.test((await repondre(e0)).e || ''));
await etape(7);
for (const e of eleves) await repondre(e);
verif('41e réponse refusée (plafond = participants)', /ENQUETE_COMPLETE/.test((await repondre(e0)).e || ''));
const colonnes = (await db.query(`select column_name from information_schema.columns where table_name = 'emc_enquete'`)).rows.map((r) => r.column_name).sort();
verif('emc_enquete ne porte ni élève ni heure', JSON.stringify(colonnes) === JSON.stringify(['classe_id', 'id', 'reponses', 'temoignage']), colonnes);
verif('l\'élève ne relit pas l\'enquête', lignes(await en(e0.uid, `select * from public.emc_enquete`)).length === 0);
verif('pas d\'écriture directe dans l\'enquête', !!(await en(e0.uid, `insert into public.emc_enquete (classe_id) values ($1)`, [C1])).e);
verif('Mme Castel lit 40 réponses', lignes(await en(CASTEL, `select * from public.emc_enquete where classe_id = $1`, [C1])).length === 40);
verif('hors séance : refus', /PAS_DANS_LA_SEANCE/.test((await en(intrus, `select public.emc_repondre_enquete($1, '{}', null)`, [C1])).e || ''));

/* ---------- 11. aide ---------- */
const aide = (e) => en(e.uid, `insert into public.emc_aide (classe_id, eleve_id, cases, message) values ($1, $2, $3, 'je voudrais parler')`, [C1, e.id, ['J\'aimerais parler à un adulte']]);
verif('message d\'aide envoyé', !(await aide(e0)).e);
verif('aide au nom d\'un autre refusée', !!(await en(e0.uid, `insert into public.emc_aide (classe_id, eleve_id) values ($1, $2)`, [C1, eleves[1].id])).e);
verif('aide déjà « prise en charge » refusée', !!(await en(e0.uid, `insert into public.emc_aide (classe_id, eleve_id, statut) values ($1, $2, 'pris_en_charge')`, [C1, e0.id])).e);
verif('l\'élève ne relit pas l\'aide', lignes(await en(e0.uid, `select * from public.emc_aide`)).length === 0);
verif('un autre élève ne lit pas l\'aide', lignes(await en(eleves[1].uid, `select * from public.emc_aide`)).length === 0);
verif('Loïc lit l\'aide', lignes(await en(LOIC, `select * from public.emc_aide`)).length === 1);
verif('Mme Castel lit l\'aide', lignes(await en(CASTEL, `select * from public.emc_aide`)).length === 1);
verif('le collègue extérieur ne lit pas l\'aide', lignes(await en(AUTRE, `select * from public.emc_aide`)).length === 0);
verif('Mme Castel passe en « pris en charge »', nb(await en(CASTEL, `update public.emc_aide set statut = 'pris_en_charge'`)) === 1);
for (let i = 0; i < 9; i++) await aide(eleves[2]);
verif('plafond : 11e message refusé', /PLAFOND_AIDE/.test((await aide(eleves[2])).e || ((await aide(eleves[2])).e) || ''));

/* ---------- 12. contenus ---------- */
verif('Mme Castel modifie un contenu', nb(await en(CASTEL, `update public.emc_contenus set valeur = valeur where cle = 'mots'`)) === 1);
verif('un élève ne modifie pas les contenus', nb(await en(e0.uid, `update public.emc_contenus set valeur = '{}' where cle = 'mots'`)) <= 0);
verif('le collègue extérieur ne modifie pas les contenus', nb(await en(AUTRE, `update public.emc_contenus set valeur = '{}' where cle = 'mots'`)) <= 0);
verif('un élève lit les contenus', lignes(await en(e0.uid, `select cle from public.emc_contenus`)).length === 9);

/* ---------- 13. réattribution de table ---------- */
verif('Loïc réattribue une table', nb(await en(LOIC, `update public.emc_participants set table_num = 8 where eleve_id = $1`, [eleves[5].id])) === 1);
verif('un élève ne change pas sa table', nb(await en(eleves[6].uid, `update public.emc_participants set table_num = 1 where eleve_id = $1`, [eleves[6].id])) <= 0);

/* ---------- 14. clôture et suppression des comptes ---------- */
verif('le collègue extérieur ne clôture pas', /PAS_MA_CLASSE/.test((await en(AUTRE, `select public.emc_cloturer($1)`, [C1])).e || ''));
const efface = lignes(await en(LOIC, `select public.emc_cloturer($1) n`, [C1]))[0];
verif('clôture : messages d\'aide effacés', efface && efface.n === 11 && (await db.query(`select count(*)::int n from public.emc_aide`)).rows[0].n === 0, efface);
verif('après clôture, la carte est fermée', !!(await dessiner(eleves[3], eleves[3].table, trait(eleves[3].table, 7))).e);
verif('après clôture, les notes sont fermées', nb(await en(e0.uid, `update public.emc_notes set texte = 'tard' where eleve_id = $1`, [e0.id])) <= 0);
verif('supprimer : refusé à un élève', !!(await en(e0.uid, `select public.emc_supprimer_comptes($1, true)`, [C1])).e);
verif('supprimer : refusé au collègue extérieur', /PAS_MA_CLASSE/.test((await en(AUTRE, `select public.emc_supprimer_comptes($1, true)`, [C1])).e || ''));
/* un des comptes EMC a aussi rejoint la SNT : il doit être épargné */
await db.query(`insert into public.eleves_classes values ($1, $2)`, [eleves[10].id, SNT]);
const apercu = lignes(await en(CASTEL, `select public.emc_supprimer_comptes($1) n`, [C1]))[0];
verif('aperçu : 29 comptes créés pour l\'EMC seulement', apercu && apercu.n === 29, apercu);
verif('aperçu : rien n\'est supprimé', (await db.query(`select count(*)::int n from auth.users`)).rows[0].n === 44);
const supp = lignes(await en(CASTEL, `select public.emc_supprimer_comptes($1, true) n`, [C1]))[0];
verif('suppression : 29 comptes', supp && supp.n === 29, supp);
verif('restent : 3 enseignants, 10 élèves de SNT, le compte EMC aussi en SNT, l\'intrus', (await db.query(`select count(*)::int n from auth.users`)).rows[0].n === 15);
verif('les participations des comptes supprimés partent avec eux', (await db.query(`select count(*)::int n from public.emc_participants`)).rows[0].n === 11);

console.log(`\n${ok} contrôles réussis, ${ko} en échec.`);
process.exit(ko ? 1 : 0);
