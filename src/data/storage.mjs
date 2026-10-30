/* Ways to store a surplus of each crop. Format: id: [[method, how, "keeps for"], ...]. Shown on each plant page. */
import { STORE_1 } from './storage/batch1.mjs';
import { STORE_2 } from './storage/batch2.mjs';
import { STORE_3 } from './storage/batch3.mjs';
import { STORE_4 } from './storage/batch4.mjs';
export const STORAGE = { ...STORE_1, ...STORE_2, ...STORE_3, ...STORE_4 };
