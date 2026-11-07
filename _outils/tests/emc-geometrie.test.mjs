/* emc-geometrie.test.mjs — EMC.zoneDe / EMC.dansZone (assets/js/emc-commun.js)
 * sur les mêmes points que emc_zone_de (emc-schema.test.mjs) :
 * les deux géométries ne peuvent pas diverger sans qu'un banc échoue.
 *   node _outils/tests/emc-geometrie.test.mjs   (depuis la racine du dépôt) */
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const ctx = { window: {}, document: { addEventListener() {}, dispatchEvent() {} }, navigator: { onLine: true },
              setInterval() {}, localStorage: null, CustomEvent: class {} };
ctx.window = ctx; ctx.addEventListener = () => {};
vm.runInNewContext(readFileSync('assets/js/emc-commun.js', 'utf8'), ctx);
const EMC = ctx.EMC;
const { points } = JSON.parse(readFileSync('_outils/tests/emc-points.json', 'utf8'));
let ok = 0, ko = 0;
const verif = (nom, c, d) => { if (c) ok++; else { ko++; console.log('ÉCHEC :', nom, d ?? ''); } };
for (const [x, y, z] of points) verif(`zoneDe(${x}, ${y})`, EMC.zoneDe(x, y) === z, EMC.zoneDe(x, y));
verif('trait dans la zone 1', EMC.dansZone(1, 'trait', { points: [700, -700, 800, -800, 900, -600] }));
verif('trait qui déborde', !EMC.dansZone(1, 'trait', { points: [700, -700, 1000, -1000] }));
verif('texte qui mord sur l\'anneau', !EMC.dansZone(2, 'texte', { x: 800, y: -1300, l: 600, h: 400 }));
verif('texte dans la zone 2', EMC.dansZone(2, 'texte', { x: 1400, y: -1800, l: 300, h: 80 }));
verif('texte sans x', !EMC.dansZone(2, 'texte', { y: -1800, l: 300, h: 80 }));
for (let z = 1; z <= 8; z++) {
  const m = EMC.milieu(z);
  verif(`milieu de la zone ${z} dans la zone`, EMC.zoneDe(m.x, m.y) === z, m);
  const sz = EMC.sousZones(z, ['a', 'b', 'c']);
  verif(`3 sous-zones de la zone ${z}`, sz.length === 3 && sz[2].a1 === EMC.geometrie(z).a1);
  for (const s of sz) {
    const a = (s.a0 + s.a1) / 2 * Math.PI / 180, r = s.rmax ? (s.rmin + s.rmax) / 2 : 1600;
    verif(`sous-zone ${z}.${s.index} dans la zone`, EMC.zoneDe(Math.cos(a) * r, Math.sin(a) * r) === z);
  }
}
console.log(`${ok} contrôles réussis, ${ko} en échec.`);
process.exit(ko ? 1 : 0);
