/* One-off helper: drafts src/data/group-calendar.mjs from each variety group's "when" text.
   Run: node tools/make-group-calendar.mjs  (prints anything it could not read clearly). */
import { writeFileSync } from 'node:fs';
import { GROUPS } from '../src/data/groups.mjs';
import { CALENDAR } from '../src/data/calendar.mjs';

const M = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const MON = '(?:(?:early|mid|late)[- ])?(January|February|March|April|May|June|July|August|September|October|November|December)';
const mi = (w) => M.indexOf(w.slice(0, 3).toLowerCase());
const span = (a, b) => { const out = []; for (let k = a; ; k = (k + 1) % 12) { out.push(k); if (k === b) break; } return out; };
export const slug = (name) => {
  const s = name.toLowerCase().replace(/\(.*?\)/g, ' ').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (s.length <= 32) return s;
  return s.slice(0, 32).replace(/-[^-]*$/, '');
};
const months = (txt) => {
  const set = new Set();
  const re = new RegExp(`${MON}(?:\\s*(?:to|–|-|until)\\s*${MON})?`, 'gi');
  for (const m of txt.matchAll(re)) { const a = mi(m[1]), b = m[2] ? mi(m[2]) : a; span(a, b).forEach((k) => set.add(k)); }
  return set;
};
const bits = (set) => M.map((_, k) => (set.has(k) ? '1' : '0')).join('');

const out = {}, notes = [];
for (const [id, g] of Object.entries(GROUPS)) {
  const base = CALENDAR[id]; if (!base) continue;
  out[id] = {};
  for (const grp of g.groups) {
    const parts = grp.when.split(/\s*·\s*/);
    const I = new Set(), O = new Set(), H = new Set();
    let sawSow = false, sawHarvest = false, relWeeks = null;
    for (const part of parts) {
      const low = part.toLowerCase();
      const mm = months(part);
      if (/^(sow|plant|start)/.test(low)) {
        sawSow = true;
        // split "Sow X indoors, plant out Y" style clauses
        for (const clause of part.split(/[,;]| then /i)) {
          const cm = months(clause); const cl = clause.toLowerCase();
          if (!cm.size) continue;
          const indoor = /indoors|under cover|in heat|greenhouse|windowsill|in pots/.test(cl) && !/plant out|outside|outdoors/.test(cl);
          cm.forEach((k) => {
            if (indoor) I.add(k);
            else if (/^plant|plant out/.test(cl.trim())) O.add(k);
            else if (base.o[k] !== '1' && base.i.includes('1') && (base.i[k] === '1' || k < base.o.indexOf('1'))) I.add(k);
            else O.add(k);
          });
        }
      } else if (/^(harvest|pick|lift|cut|ready)/.test(low)) {
        const wk = low.match(/(\d+)\s*(?:–|-|to)\s*(\d+)\s*weeks/) || low.match(/(\d+)\s*weeks/);
        if (mm.size) { sawHarvest = true; mm.forEach((k) => H.add(k)); }
        else if (wk) { relWeeks = [Number(wk[1]), Number(wk[2] || wk[1])]; }
      }
      else if (/all year/.test(low)) { sawHarvest = true; for (let k = 0; k < 12; k++) H.add(k); }
    }
    /* Started indoors but no planting-out months given: plant out when the crop normally does */
    if (I.size && !O.size && base.o.includes('1')) base.o.split('').forEach((b, k) => b === '1' && O.add(k));
    /* "Harvest 8–12 weeks" style: count on from the sowing months */
    if (!sawHarvest && relWeeks && (I.size || O.size)) {
      const a = Math.max(1, Math.round(relWeeks[0] / 4.3)), b = Math.max(a, Math.round(relWeeks[1] / 4.3));
      [...I, ...O].forEach((k) => { for (let d = a; d <= b; d++) H.add((k + d) % 12); });
      sawHarvest = true;
    }
    /* Fruit types named by season, e.g. "Early (August to September)" */
    if (!sawHarvest) { const nm = months(grp.name); if (nm.size) { nm.forEach((k) => H.add(k)); sawHarvest = true; } }
    if (!sawHarvest && /october onwards/i.test(grp.name)) { [9, 10].forEach((k) => H.add(k)); sawHarvest = true; }
    const why = [];
    if (!sawSow || (!I.size && !O.size)) { base.i.split('').forEach((b, k) => b === '1' && I.add(k)); base.o.split('').forEach((b, k) => b === '1' && O.add(k)); why.push('no sowing months in its text, so it uses the crop’s'); }
    if (!sawHarvest || !H.size) { base.h.split('').forEach((b, k) => b === '1' && H.add(k)); why.push('no harvest months in its text, so it uses the crop’s'); }
    out[id][slug(grp.name)] = { name: grp.name, i: bits(I), o: bits(O), h: bits(H) };
    if (why.length) notes.push(`${id} / ${grp.name}: ${why.join('; ')} ("${grp.when}")`);
  }
}
const lines = Object.entries(out).map(([id, gs]) => `  ${JSON.stringify(id)}: {\n${Object.entries(gs).map(([k, v]) => `    ${JSON.stringify(k)}: { i: "${v.i}", o: "${v.o}", h: "${v.h}" }, // ${v.name}`).join('\n')}\n  },`).join('\n');
writeFileSync(new URL('../src/data/group-calendar.mjs', import.meta.url), `/* Sowing and harvest months for each variety type, keyed by crop id and then by a short type id.
   Same 12-character format as calendar.mjs (January to December, 1 = active): i = sow or start indoors,
   o = sow or plant outside, h = harvest. A crop's overall calendar is its own months plus all of its types'.
   First drafted from each type's "when" line in groups.mjs; edit here to correct a type's timing. */
export const GROUP_CALENDAR = {
${lines}
};
`);
console.log(notes.length + ' types used crop defaults:\n' + notes.join('\n'));
