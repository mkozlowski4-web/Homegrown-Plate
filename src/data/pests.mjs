import { PEST_ORGANISMS } from './pests/organisms.mjs';
import { PEST_PROBLEMS } from './pests/problems.mjs';

export const PEST_KINDS = [
  { id: 'pest', label: 'Pests', one: 'Pest' },
  { id: 'disease', label: 'Diseases', one: 'Disease' },
  { id: 'wildlife', label: 'Wildlife', one: 'Wildlife' },
  { id: 'problem', label: 'Growing problems', one: 'Growing problem' },
];
export const PESTS = [...PEST_ORGANISMS, ...PEST_PROBLEMS];

/* Find the pest entry for a plant's "Watch out for" label: the longest matching phrase wins, earlier entries win ties. */
export function pestForLabel(label) {
  const text = label.toLowerCase();
  let best = null; let bestLen = 0;
  for (const p of PESTS) for (const m of p.match) if (text.includes(m) && m.length > bestLen) { best = p; bestLen = m.length; }
  return best;
}
