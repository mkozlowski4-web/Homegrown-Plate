/* All crops, gathered from the group files in ./plants and sorted A to Z. */
import { ROOTS } from './plants/roots.mjs';
import { ALLIUMS } from './plants/alliums.mjs';
import { BRASSICAS } from './plants/brassicas.mjs';
import { LEAVES } from './plants/leaves.mjs';
import { FRUITING } from './plants/fruiting-veg.mjs';
import { LEGUMES_STEMS } from './plants/legumes-stems.mjs';
import { FRUIT } from './plants/fruit.mjs';
import { HERBS } from './plants/herbs.mjs';

export const PLANTS = [
  ...ROOTS,
  ...ALLIUMS,
  ...BRASSICAS,
  ...LEAVES,
  ...FRUITING,
  ...LEGUMES_STEMS,
  ...FRUIT,
  ...HERBS,
].sort((a, b) => a.name.localeCompare(b.name, 'en-GB'));
