/* All crops, gathered from the group files in ./plants and sorted A to Z. */
import { ROOTS } from './plants/roots.mjs';
import { ALLIUMS } from './plants/alliums.mjs';
import { BRASSICAS } from './plants/brassicas.mjs';
import { LEAVES } from './plants/leaves.mjs';
import { FRUITING } from './plants/fruiting-veg.mjs';
import { LEGUMES_STEMS } from './plants/legumes-stems.mjs';
import { FRUIT } from './plants/fruit.mjs';
import { HERBS } from './plants/herbs.mjs';
import { MORE_ROOTS_BRASSICAS } from './plants/more-roots-brassicas.mjs';
import { MORE_VEG } from './plants/more-veg.mjs';
import { MORE_FRUIT } from './plants/more-fruit.mjs';
import { MORE_HERBS } from './plants/more-herbs.mjs';
import { EXTRAS } from './extras.mjs';
import { GROUPS } from './groups.mjs';

export const PLANTS = [
  ...ROOTS,
  ...ALLIUMS,
  ...BRASSICAS,
  ...LEAVES,
  ...FRUITING,
  ...LEGUMES_STEMS,
  ...FRUIT,
  ...HERBS,
  ...MORE_ROOTS_BRASSICAS,
  ...MORE_VEG,
  ...MORE_FRUIT,
  ...MORE_HERBS,
].map((p) => (GROUPS[p.id] ? { ...p, ...GROUPS[p.id] } : p))
  .map((p) => {
    const x = EXTRAS[p.id];
    if (!x) return p;
    const q = { ...p };
    if (x.info) q.info = [...p.info, ...x.info];
    for (const k of ['sow', 'grow', 'harvest', 'use']) if (x[k]) q[k] = { ...p[k], p: [...p[k].p, ...x[k]] };
    return q;
  }).sort((a, b) => a.name.localeCompare(b.name, 'en-GB'));
