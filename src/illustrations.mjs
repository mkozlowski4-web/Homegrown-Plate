/* Plant illustrations, drawn in code as simple flat SVGs in one house style.
   illustration(id) returns a complete SVG string (120 x 120). To tune a plant, edit its row in LOOKS. */

const G1 = '#5aa469', G2 = '#2d6a4f', G3 = '#8cc88f', BR = '#8a5a2b';
const f = (n) => Math.round(n * 10) / 10;
const leaf = (x, y, a, l, w, fill) =>
  `<path transform="translate(${x} ${y}) rotate(${a})" d="M0 0C${w} ${f(-l * 0.3)} ${w} ${f(-l * 0.75)} 0 ${-l}C${-w} ${f(-l * 0.75)} ${-w} ${f(-l * 0.3)} 0 0Z" fill="${fill}"/>`;
const vein = (x, y, a, l, col) =>
  `<path transform="translate(${x} ${y}) rotate(${a})" d="M0 0V${f(-l * 0.9)}" stroke="${col}" stroke-width="1.3" stroke-linecap="round" fill="none" opacity=".45"/>`;
const circ = (x, y, r, fill, op = 1) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"${op < 1 ? ` opacity="${op}"` : ''}/>`;
const line = (d, col, w = 2, op = 1) => `<path d="${d}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="none"${op < 1 ? ` opacity="${op}"` : ''}/>`;
const shine = (x, y, rx, ry) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#fff" opacity=".3" transform="rotate(-25 ${x} ${y})"/>`;
const tip = (bx, by, a, l) => [bx + l * Math.sin((a * Math.PI) / 180), by - l * Math.cos((a * Math.PI) / 180)];

const T = {
  root: (c1, c2) => [-30, 0, 30].map((a) => leaf(60, 42, a, 32, 7, a ? G1 : G2)).join('') +
    `<path d="M44 40Q60 33 76 40Q70 80 60 108Q50 80 44 40Z" fill="${c1}"/>` + [56, 70, 84].map((y, i) => line(`M${52 + i * 2} ${y}h${12 - i * 3}`, c2, 1.6, 0.5)).join('') + shine(54, 56, 3, 9),
  roundroot: (c1, c2, o = {}) => [-34, 0, 34].map((a) => leaf(60, 46, a, 30, 7, a ? G1 : G2)).join('') +
    circ(60, 74, o.r || 27, c1) + `<ellipse cx="60" cy="50" rx="13" ry="5" fill="${c2}"/>` + line('M60 100v12', c2, 2.5) + line('M44 76a18 18 0 0 0 16 16', c2, 2, 0.35) + shine(50, 66, 5, 9),
  kohl: (c1, c2) => [-62, -38, 0, 38, 62].map((a) => `${line(`M60 ${52}L${f(60 + 36 * Math.sin((a * Math.PI) / 180))} ${f(52 - 30 * Math.cos((a * Math.PI) / 180))}`, G2, 2.5)}${leaf(...tip(60, 52, a, 28), a * 0.9, 26, 8, G1)}`).join('') + circ(60, 76, 26, c1) + shine(50, 68, 5, 9),
  bulb: (c1, c2, o = {}) => `<path d="M60 18C62 36 92 48 92 76A32 32 0 0 1 28 76C28 48 58 36 60 18Z" fill="${c1}"/>` +
    [-14, 0, 14].map((x) => line(`M${60 + x * 0.3} 30Q${60 + x * 2.2} 70 ${60 + x * 1.4} 106`, c2, 1.8, 0.4)).join('') + (o.cloves ? line('M60 40V104', c2, 1.5, 0.4) : '') +
    line('M50 108l-4 8M60 108v8M70 108l4 8', BR, 2) + shine(46, 72, 5, 13),
  leek: (c1, c2, o = {}) => (o.thin ? [38, 50, 62, 74, 86] : [42, 60, 78]).map((x, i) => {
    const w = o.thin ? 5 : 11;
    return leaf(x, 62, (x - 60) * 0.9, 50 - (i % 2) * 6, w + 2, c2) + `<rect x="${x - w / 2}" y="58" width="${w}" height="${o.thin ? 40 : 46}" rx="${w / 2}" fill="${c1}"/>` + (o.thin ? circ(x, 100, 5, c1) : '');
  }).join('') + line('M44 108l-4 6M60 108v7M76 108l4 6', BR, 1.6) + (o.pom ? circ(60, 22, 11, o.pom) : ''),
  rosette: (c1, c2, o = {}) => {
    const n = o.n || 9; const len = o.len || 56; const w = o.w || 15; let s = '';
    const order = [...Array(n).keys()].sort((p, q) => Math.abs(q - (n - 1) / 2) - Math.abs(p - (n - 1) / 2));
    for (const i of order) {
      const a = -78 + (156 * i) / (n - 1); const l = len - Math.abs(a) * 0.12;
      s += leaf(60, 104, a, l, w, i % 2 ? c1 : c2) + vein(60, 104, a, l, '#fff');
      if (o.frill) { const [tx, ty] = tip(60, 104, a, l * 0.82); s += circ(f(tx - 4), f(ty + 2), 4, i % 2 ? c1 : c2) + circ(f(tx + 4), f(ty + 2), 4, i % 2 ? c1 : c2); }
    }
    return s + circ(60, 100, 6, c2);
  },
  bok: (c1, c2) => [-26, -9, 9, 26].map((a) => { const [tx, ty] = tip(60, 108, a, 44); return `<path transform="translate(60 108) rotate(${a})" d="M-6 0L-9 -44H9L6 0Z" fill="${c1}"/>${leaf(f(tx), f(ty), a * 1.3, 40, 17, c2)}`; }).join(''),
  head: (c1, c2) => leaf(34, 100, -34, 50, 17, c2) + leaf(86, 100, 34, 50, 17, c2) + circ(60, 66, 36, c1) +
    line('M60 32Q44 66 60 100', c2, 1.8, 0.45) + line('M60 32Q76 66 60 100', c2, 1.8, 0.45) + line('M28 62Q60 76 92 62', c2, 1.6, 0.35) + shine(46, 52, 6, 12),
  tallhead: (c1, c2) => `<ellipse cx="60" cy="64" rx="24" ry="44" fill="${c2}"/><ellipse cx="60" cy="58" rx="18" ry="38" fill="${c1}"/>` + [30, 46, 62, 78].map((y) => line(`M44 ${y}Q60 ${y + 8} 76 ${y}`, c2, 1.6, 0.5)).join('') + line('M60 24V96', '#fff', 1.4, 0.5),
  curd: (c1, c2, o = {}) => [-40, -14, 14, 40].map((a) => leaf(60, 100, a, 56, 17, c2)).join('') +
    (o.spiky
      ? [[60, 30], [44, 44], [76, 44], [32, 62], [88, 62], [60, 56], [48, 72], [72, 72]].map(([x, y]) => `<path d="M${x} ${y - 14}L${x + 11} ${y + 10}L${x - 11} ${y + 10}Z" fill="${c1}"/>`).join('')
      : [[60, 40], [42, 48], [78, 48], [32, 64], [88, 64], [50, 62], [70, 62], [60, 78], [42, 80], [78, 80]].map(([x, y]) => circ(x, y, 13, c1)).join('') + (o.dim ? '' : circ(54, 48, 4, '#fff', 0.35))),
  stalkball: (c1, c2) => line('M62 112V14', BR, 4) + [[46, 92], [78, 80], [46, 66], [78, 54], [46, 40], [78, 28]].map(([x, y]) => circ(x, y, 12, c1) + line(`M${x - 5} ${y}h10`, c2, 1.4, 0.5)).join('') + leaf(62, 20, -25, 16, 6, G1) + leaf(62, 20, 25, 16, 6, G1),
  chicon: (c1, c2) => `<path d="M60 14C84 34 82 84 76 104H44C38 84 36 34 60 14Z" fill="${c1}"/>` + [34, 52, 70].map((y) => line(`M${46 + (y - 34) / 10} ${y}Q60 ${y + 8} ${74 - (y - 34) / 10} ${y}`, c2, 1.8, 0.7)).join('') + line('M60 20V102', c2, 1.4, 0.4),
  round: (c1, c2, o = {}) => {
    const r = o.r || 30; const cy = o.cy || 72; let s = '';
    if (o.husk) s += `<path d="M60 22L88 56C98 78 84 104 60 106C36 104 22 78 32 56Z" fill="${o.husk}" opacity=".85"/>` + line('M60 24V104', c2, 1.2, 0.35) + line('M40 54Q60 96 80 54', c2, 1.2, 0.35);
    s += circ(60, cy, r, c1);
    if (o.cleft) s += line(`M60 ${cy - r + 4}Q52 ${cy} 60 ${cy + r - 4}`, c2, 2, 0.5);
    if (o.net) s += [-16, 0, 16].map((x) => line(`M${60 + x} ${cy - r + 4}Q${60 + x * 1.4} ${cy} ${60 + x} ${cy + r - 4}`, c2, 1.4, 0.5)).join('') + [-12, 6, 22].map((y) => line(`M${60 - r + 2} ${cy + y}Q60 ${cy + y + 6} ${60 + r - 2} ${cy + y}`, c2, 1.4, 0.5)).join('');
    s += shine(60 - r * 0.38, cy - r * 0.3, r * 0.18, r * 0.32);
    if (o.calyx !== false && !o.husk) s += [-70, -35, 0, 35, 70].map((a) => leaf(60, cy - r + 4, a, 15, 4.5, G2)).join('') + line(`M60 ${cy - r + 4}V${cy - r - 8}`, BR, 2.5);
    if (o.leaf) s += leaf(64, cy - r - 4, 55, 26, 9, G1);
    return s;
  },
  pear: (c1, c2, o = {}) => `<path d="M60 26C69 26 70 40 74 52C90 66 90 100 60 104C30 100 30 66 46 52C50 40 51 26 60 26Z" fill="${c1}"/>` + line('M60 28Q62 18 68 14', BR, 2.5) + leaf(64, 22, 60, 22, 8, G1) + shine(48, 78, 4, 11) + (o.dots ? [[52, 80], [68, 74], [60, 92]].map(([x, y]) => circ(x, y, 1.4, c2)).join('') : ''),
  fig: (c1, c2) => `<path d="M60 30C66 30 66 40 70 50C92 62 90 100 60 104C30 100 28 62 50 50C54 40 54 30 60 30Z" fill="${c1}"/>` + line('M50 60Q60 74 70 60', c2, 1.4, 0.45) + line('M44 80Q60 92 76 80', c2, 1.4, 0.45) + line('M60 30V22', BR, 3) + leaf(66, 26, 55, 24, 9, G1) + shine(46, 78, 4, 10),
  cherries: (c1, c2) => line('M60 20Q50 40 40 76', BR, 2) + line('M60 20Q72 40 82 72', BR, 2) + circ(40, 84, 17, c1) + circ(82, 80, 17, c1) + shine(34, 78, 3, 7) + shine(76, 74, 3, 7) + leaf(60, 22, -40, 28, 9, G1) + leaf(60, 22, 40, 24, 8, G2),
  bell: (c1, c2) => `<path d="M36 52C34 36 86 36 84 52C94 70 88 100 72 104C66 106 54 106 48 104C32 100 26 70 36 52Z" fill="${c1}"/>` + line('M60 48V102', c2, 1.6, 0.35) + line('M46 50Q42 80 50 102', c2, 1.4, 0.3) + line('M74 50Q78 80 70 102', c2, 1.4, 0.3) + `<path d="M50 42Q60 30 70 42Z" fill="${G2}"/>` + line('M60 38V22', G2, 4) + shine(42, 66, 4, 11),
  chilli: (c1, c2) => `<path d="M34 42C70 30 94 62 80 112C62 92 42 74 34 42Z" fill="${c1}"/>` + `<path d="M30 40Q36 30 48 38L40 48Z" fill="${G2}"/>` + line('M34 38L24 26', G2, 3.5) + line('M46 52Q64 62 72 90', '#fff', 1.6, 0.35),
  cylinder: (c1, c2, o = {}) => `<g transform="rotate(-32 60 62)"><rect x="14" y="48" width="92" height="28" rx="14" fill="${c1}"/>` +
    (o.stripes ? [30, 46, 62, 78].map((x) => line(`M${x} 50v24`, c2, 1.6, 0.3)).join('') : '') +
    (o.bumps ? [26, 42, 58, 74, 90].map((x, i) => circ(x, 56 + (i % 2) * 12, 1.8, c2, 0.5)).join('') : '') +
    `<rect x="102" y="56" width="10" height="12" rx="3" fill="${G2}"/>${o.flower ? circ(14, 62, 7, '#f7c548') : ''}` + `<ellipse cx="40" cy="56" rx="14" ry="3" fill="#fff" opacity=".28"/></g>`,
  squash: (c1, c2, o = {}) => (o.flat
    ? `<ellipse cx="60" cy="74" rx="38" ry="24" fill="${c1}"/>` + [...Array(10)].map((_, i) => { const a = (i / 10) * Math.PI * 2; return circ(f(60 + 38 * Math.cos(a)), f(74 + 24 * Math.sin(a)), 7, c1); }).join('') + `<ellipse cx="60" cy="68" rx="14" ry="8" fill="${c2}" opacity=".5"/>`
    : [[90, 9], [30, 9], [76, 14], [44, 14], [60, 17]].map(([x, rx]) => `<ellipse cx="${x}" cy="72" rx="${rx}" ry="30" fill="${c1}"/>` + line(`M${x - rx * 0.4} 46Q${x - rx * 0.6} 72 ${x - rx * 0.4} 98`, c2, 1.6, 0.4)).join('')) +
    `<path d="M56 ${o.flat ? 56 : 42}Q56 30 66 24" stroke="${BR}" stroke-width="6" fill="none" stroke-linecap="round"/>` + leaf(70, 34, 60, 24, 9, G1),
  butternut: (c1, c2) => `<path d="M50 28C50 40 46 52 40 62C28 76 32 102 60 104C88 102 92 76 80 62C74 52 70 40 70 28Z" fill="${c1}"/>` + line('M60 30V100', c2, 1.4, 0.3) + `<rect x="54" y="18" width="12" height="14" rx="4" fill="${BR}"/>` + shine(46, 80, 4, 12),
  pod: (c1, c2, o = {}) => leaf(32, 44, -50, 26, 9, G1) + `<path d="M22 82C38 40 82 32 102 44C94 76 58 94 22 82Z" fill="${c1}"/>` +
    Array.from({ length: o.n || 5 }, (_, i) => { const t = (i + 0.6) / ((o.n || 5) + 0.2); return circ(f(34 + t * 56), f(72 - Math.sin(t * Math.PI) * 18 - t * 12 + 8), o.r || 7, c2); }).join('') + line('M102 44q6-8 4-16', G2, 2.5),
  corn: (c1, c2) => leaf(60, 108, -26, 74, 18, G1) + leaf(60, 108, 26, 74, 18, G2) + `<ellipse cx="60" cy="62" rx="16" ry="40" fill="${c1}"/>` +
    [...Array(5)].flatMap((_, r) => [...Array(4)].map((_, k) => circ(f(51 + k * 6), 30 + r * 14 + (k % 2) * 3, 2.3, c2, 0.55))).join('') + leaf(60, 108, 0, 60, 14, G1),
  raspberry: (c1, c2) => cluster([[60, 38], [48, 48], [72, 48], [38, 60], [60, 60], [82, 60], [46, 74], [72, 74], [60, 86], [54, 98], [66, 98]], 9, c1) + [-60, -20, 20, 60].map((a) => leaf(60, 32, a, 18, 5, G2)).join(''),
  blackberry: (c1, c2) => cluster([[60, 42], [44, 52], [76, 52], [36, 68], [58, 66], [82, 68], [46, 82], [70, 82], [58, 96]], 10, c1) + [-60, -20, 20, 60].map((a) => leaf(60, 36, a, 18, 5, G2)).join(''),
  blueberries: (c1, c2) => [[44, 76], [78, 76], [60, 52]].map(([x, y]) => circ(x, y, 19, c1) + circ(x, y - 6, 5, c2, 0.55) + shine(x - 7, y - 8, 3, 6)).join('') + leaf(60, 28, -30, 20, 7, G1),
  currants: (c1, c2) => line('M60 14Q64 36 60 100', G2, 2.5) + [[50, 34], [70, 38], [48, 52], [72, 56], [50, 70], [70, 74], [54, 88], [66, 92]].map(([x, y]) => circ(x, y, 9, c1) + shine(x - 3, y - 3, 1.6, 3)).join('') + leaf(60, 18, -40, 20, 7, G1),
  gooseberry: (c1, c2) => `<ellipse cx="60" cy="68" rx="25" ry="30" fill="${c1}"/>` + [-12, 0, 12].map((x) => line(`M${60 + x} 40Q${60 + x * 1.4} 68 ${60 + x} 96`, c2, 1.6, 0.4)).join('') + line('M60 38V26', BR, 2.5) + leaf(62, 28, 50, 20, 7, G1) + shine(48, 56, 4, 9),
  strawberry: (c1, c2) => `<path d="M60 108C30 86 24 58 34 48C44 40 54 46 60 50C66 46 76 40 86 48C96 58 90 86 60 108Z" fill="${c1}"/>` + [[48, 62], [62, 60], [74, 66], [54, 76], [68, 82], [60, 94], [42, 74]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="1.6" ry="2.4" fill="#f7e08a"/>`).join('') + [-70, -35, 0, 35, 70].map((a) => leaf(60, 48, a, 20, 5.5, G2)).join(''),
  grapes: (c1, c2) => cluster([[36, 46], [52, 44], [68, 44], [84, 46], [44, 60], [60, 60], [76, 60], [52, 74], [68, 74], [60, 88]], 9, c1) + line('M60 38V24', BR, 3) + leaf(66, 26, 55, 26, 11, G1),
  celery: (c1, c2) => [-20, -10, 0, 10, 20].map((a, i) => `<path transform="translate(60 108) rotate(${a})" d="M-6 0L-5 -66H5L6 0Z" fill="${i % 2 ? c1 : c2}"/>` + vein(60, 108, a, 66, '#fff')).join('') + [-24, -8, 8, 24].map((a) => leaf(...tip(60, 108, a * 0.9, 62), a * 1.6, 22, 8, G1)).join(''),
  rhubarb: (c1, c2) => [-18, 0, 18].map((a) => `<path transform="translate(60 108) rotate(${a})" d="M-5 0L-4 -56H4L5 0Z" fill="${c1}"/>`).join('') + leaf(...tip(60, 108, -18, 54), -28, 36, 24, G1) + leaf(...tip(60, 108, 18, 54), 28, 36, 24, G2) + leaf(...tip(60, 108, 0, 56), 0, 38, 26, G1),
  asparagus: (c1, c2) => [38, 49, 60, 71, 82].map((x, i) => { const h = 62 + (i % 2 ? 8 : 22); return `<rect x="${x - 3.5}" y="${112 - h}" width="7" height="${h}" rx="3.5" fill="${c1}"/><path d="M${x - 4.5} ${122 - h}Q${x} ${100 - h} ${x + 4.5} ${122 - h}Z" fill="${c2}"/>` + line(`M${x - 3} ${112 - h + 14}h6M${x - 3} ${112 - h + 22}h6`, c2, 1.2, 0.5); }).join(''),
  fennelbulb: (c1, c2) => `<path d="M24 78C24 52 96 52 96 78C96 100 76 108 60 108C44 108 24 100 24 78Z" fill="${c1}"/>` + [-16, 0, 16].map((x) => line(`M${60 + x} 58Q${60 + x * 1.5} 82 ${60 + x} 106`, c2, 1.5, 0.35)).join('') + [-22, 0, 22].map((x) => line(`M${60 + x * 0.6} 58L${60 + x * 1.3} 18`, G2, 3)).join('') + [-30, -10, 10, 30].map((x) => leaf(60 + x, 20, x, 22, 4, G3)).join(''),
  artichoke: (c1, c2) => line('M60 112V84', G2, 6) + [[60, 70, 20, 34], [42, 70, 15, 30], [78, 70, 15, 30], [30, 74, 11, 24], [90, 74, 11, 24]].map(([x, y, rx, ry], i) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${i % 2 ? c2 : c1}"/>`).join('') + [48, 62, 76].map((y) => line(`M44 ${y}Q60 ${y - 8} 76 ${y}`, '#fff', 1.4, 0.35)).join('') + leaf(34, 108, -60, 30, 8, G1) + leaf(86, 108, 60, 30, 8, G1),
  sprig: (c1, c2, o = {}) => {
    const kind = o.kind || 'oval'; let s = line('M60 112Q52 70 60 18', G2, 2.6);
    if (kind === 'oval' || kind === 'round') {
      [[96, 26], [80, 24], [64, 21], [48, 17], [34, 13]].forEach(([y, l], i) => {
        const w = kind === 'round' ? 11 : o.w || 8;
        s += leaf(f(58 - i * 1.5), y, -62, l + (o.len || 0), w, i % 2 ? c1 : c2) + leaf(f(60 - i * 1.5), y - 6, 62, l + (o.len || 0), w, i % 2 ? c2 : c1);
      });
      s += leaf(60, 24, 0, 18, 6, c1);
    } else if (kind === 'needle') {
      for (let y = 100; y > 22; y -= 7) { s += line(`M${57 + (100 - y) * 0.06} ${y}l-14 -9`, c1, 2.2) + line(`M${57 + (100 - y) * 0.06} ${y}l14 -9`, c2, 2.2); }
    } else if (kind === 'feather') {
      [[90, 1], [68, 0.85], [48, 0.7], [30, 0.55]].forEach(([y, k]) => { for (const sd of [-1, 1]) { s += line(`M60 ${y}Q${60 + sd * 22 * k} ${y - 4} ${60 + sd * 34 * k} ${y - 20 * k}`, c1, 1.8) + [0.3, 0.6, 0.95].map((t) => circ(f(60 + sd * 34 * k * t), f(y - 20 * k * t * t - 4 * t), 2.4, c2)).join(''); } });
    } else if (kind === 'trefoil') {
      s += line('M60 40L44 24M60 40L76 24M60 40V16', G2, 2.2) + [[44, 22], [76, 22], [60, 14]].map(([x, y]) => circ(x, y, 12, c1) + circ(x, y, 6, c2, 0.5)).join('') + [[54, 80, -50], [66, 66, 50]].map(([x, y, a]) => leaf(x, y, a, 22, 9, c1)).join('');
    } else if (kind === 'spike') {
      s += [...Array(11)].map((_, i) => { const y = 14 + i * 7; return circ(52 + (i % 2) * 16, y, 5.2, i % 3 ? c1 : c2); }).join('') + leaf(60, 112, -30, 40, 4, G1) + leaf(60, 112, 30, 40, 4, G1);
    } else if (kind === 'grass') {
      s = [-42, -26, -12, 0, 12, 26, 42].map((a) => `<path d="M60 112Q${60 + a} 60 ${60 + a * 1.9} ${18 + Math.abs(a) * 0.4}" stroke="${Math.abs(a) % 24 ? c1 : c2}" stroke-width="3" fill="none" stroke-linecap="round"/>`).join('');
      if (o.pom) s += circ(60, 24, 10, o.pom) + [0, 1, 2, 3, 4, 5].map((i) => circ(f(60 + 11 * Math.cos(i)), f(24 + 11 * Math.sin(i)), 3, o.pom)).join('');
    }
    return s;
  },
  flower: (c1, c2, o = {}) => {
    const n = o.n || 8; let s = line('M60 112V70', G2, 3.5) + (o.pad ? circ(36, 96, 17, G1) + line('M36 96L60 108', G2, 2) + circ(84, 90, 14, G2) : leaf(60, 100, -50, 36, 10, G1) + leaf(60, 92, 50, 30, 9, G2));
    for (let i = 0; i < n; i++) { s += `<ellipse cx="60" cy="${f(46 - (o.pr || 20) * 0.5)}" rx="${o.pw || 8}" ry="${o.pr || 20}" fill="${c1}" transform="rotate(${f((360 / n) * i)} 60 52)"/>`; }
    return s + circ(60, 52, o.cr || 9, c2);
  },
  umbel: (c1, c2) => line('M60 112V50', G2, 3) + [-48, -30, -14, 0, 14, 30, 48].map((a) => { const [x, y] = tip(60, 50, a, 34); return line(`M60 50L${f(x)} ${f(y)}`, G2, 1.6) + circ(f(x), f(y), 6, c1) + circ(f(x + (a > 0 ? 4 : -4)), f(y + 7), 3.6, c1); }).join('') + leaf(60, 108, -50, 30, 9, G1) + leaf(60, 108, 50, 30, 9, G2),
  starflower: (c1, c2) => [-50, -18, 18, 50].map((a) => leaf(60, 112, a, 52 - Math.abs(a) * 0.2, 14, G1)).join('') + line('M60 112V40', G2, 2.5) + flowerStars(c1),
  tuber: (c1, c2, o = {}) => (o.long
    ? `<path d="M16 78C24 50 70 40 102 56C108 76 76 98 40 96C22 94 14 88 16 78Z" fill="${c1}"/>` + line('M34 70Q56 60 90 62', c2, 1.4, 0.4) + line('M30 82Q56 86 84 76', c2, 1.4, 0.4) + leaf(24, 74, -80, 20, 6, G1)
    : o.knobs
      ? `<path d="M30 70C22 52 40 40 52 48C58 34 80 34 84 50C100 52 104 74 92 84C96 98 72 106 62 98C50 108 26 100 34 84C24 82 24 74 30 70Z" fill="${c1}"/>`
      : `<path d="M22 70C20 46 50 34 76 40C100 46 104 76 88 92C70 108 30 100 22 70Z" fill="${c1}"/>`) +
    (o.knobs ? '' : [[44, 60], [66, 72], [52, 86], [78, 58]].map(([x, y]) => circ(x, y, 2.2, c2, 0.6)).join('')) + shine(46, 52, 5, 10),
  nuts: (c1, c2) => leaf(60, 24, -30, 26, 9, G1) + leaf(60, 24, 30, 26, 9, G2) + [[44, 76], [76, 70]].map(([x, y]) => `<path d="M${x - 17} ${y - 8}Q${x} ${y - 30} ${x + 17} ${y - 8}L${x + 14} ${y + 2}Q${x} ${y - 10} ${x - 14} ${y + 2}Z" fill="${G1}"/><ellipse cx="${x}" cy="${y + 10}" rx="16" ry="20" fill="${c1}"/>` + shine(x - 6, y + 4, 3, 8)).join(''),
  tray: (c1, c2) => `<rect x="14" y="78" width="92" height="28" rx="6" fill="${BR}"/>` + `<rect x="14" y="78" width="92" height="6" rx="3" fill="#6b4421"/>` + [...Array(11)].map((_, i) => { const x = 22 + i * 7.6; return line(`M${f(x)} 80v-${14 + (i % 3) * 6}`, '#c9e3b8', 1.8) + circ(f(x - 3), 64 - (i % 3) * 6, 3.4, i % 2 ? c1 : c2) + circ(f(x + 3), 64 - (i % 3) * 6, 3.4, i % 2 ? c2 : c1); }).join(''),
  lantern: (c1, c2) => `<path d="M60 18L90 50C100 76 84 104 60 106C36 104 20 76 30 50Z" fill="${c1}" opacity=".95"/>` + [-12, 0, 12].map((x) => line(`M${60 + x * 0.5} 22Q${60 + x * 2.4} 62 ${60 + x * 1.2} 104`, c2, 1.5, 0.5)).join('') + circ(60, 82, 14, '#f4a720') + shine(56, 76, 2.5, 5),
  kiwi: (c1, c2) => [[46, 72], [76, 66], [62, 90]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="17" ry="14" fill="${c1}"/>` + `<ellipse cx="${x}" cy="${y}" rx="8" ry="6" fill="${c2}" opacity=".5"/>`).join('') + line('M60 20Q50 44 46 58M66 28Q74 44 76 54', G2, 2) + leaf(60, 22, -45, 24, 9, G1) + leaf(60, 22, 45, 24, 9, G2),
};

function cluster(points, r, fill) {
  return points.map(([x, y]) => circ(x, y, r, fill) + circ(x - 2.4, y - 2.4, 1.8, '#fff', 0.35)).join('');
}
function flowerStars(c) {
  return [[44, 30], [60, 22], [76, 30], [52, 40], [68, 40]].map(([x, y]) => [0, 72, 144, 216, 288].map((a) => `<ellipse cx="${x}" cy="${y - 5}" rx="2.4" ry="5" fill="${c}" transform="rotate(${a} ${x} ${y})"/>`).join('')).join('');
}

/* id: [shape, main colour, accent colour, background tint, options] */
const LV = '#e6f4ea', WARM = '#fdf0e1', RED = '#fbe6e6', PUR = '#efe8f6', YEL = '#fbf5d9', SOIL = '#f3ebe0', BLU = '#e6eef8';
const L = {
  angelica: ['umbel', '#d8efc8', '', LV], apple: ['round', '#d9372b', '#8a1a14', LV, { leaf: true }], apricot: ['round', '#f4a259', '#c4721f', WARM, { cleft: true, leaf: true }],
  asparagus: ['asparagus', '#7dbb62', '#3f7d3a', LV], aubergine: ['pear', '#5b2a86', '#3a1757', PUR], basil: ['sprig', '#4c9a54', '#2f7a3d', LV, { kind: 'oval', w: 11 }],
  bay: ['sprig', '#3f7d4a', '#2d6a4f', LV, { kind: 'oval', w: 7, len: 6 }], beetroot: ['roundroot', '#a3194f', '#6b0f33', RED], blackberry: ['blackberry', '#2c2540', '', PUR],
  blackcurrant: ['currants', '#2c2a4a', '', PUR], blueberry: ['blueberries', '#4a5fb0', '#2b3a80', BLU], borage: ['flower', '#5a8be0', '#2c3e8f', BLU, { n: 5, pw: 9, pr: 17, cr: 7 }],
  'borlotti-bean': ['pod', '#e9a0a0', '#b4294a', RED, { n: 5, r: 7 }], 'broad-bean': ['pod', '#8ec96a', '#e9f3d8', LV, { n: 4, r: 8 }], 'bronze-fennel': ['sprig', '#9a6a4a', '#6f4a2e', WARM, { kind: 'feather' }],
  'brussels-sprouts': ['stalkball', '#6dae5c', '#2f6e3f', LV], 'butternut-squash': ['butternut', '#e8b36a', '#a7742c', WARM], cabbage: ['head', '#79b36e', '#2f6e3f', LV],
  calabrese: ['curd', '#3f8a52', '#2f6e3f', LV, { dim: true }], calendula: ['flower', '#f59a23', '#9a4e0a', WARM, { n: 14, pw: 4.5, pr: 21, cr: 8 }], carrot: ['root', '#f08a24', '#a8540c', WARM],
  cauliflower: ['curd', '#f6f1e2', '#4f9d5d', LV], celeriac: ['roundroot', '#cbb99a', '#8a7650', SOIL, { r: 28 }], celery: ['celery', '#a8d58a', '#6fb05a', LV],
  chamomile: ['flower', '#ffffff', '#f5b82e', YEL, { n: 12, pw: 4.5, pr: 20, cr: 9 }], cherry: ['cherries', '#c4162d', '', RED], chervil: ['sprig', '#74b866', '#3f8a52', LV, { kind: 'feather' }],
  chicory: ['chicon', '#f4efd0', '#b9ad6a', YEL], chilli: ['chilli', '#d9301f', '#8a1a14', RED], 'chinese-cabbage': ['tallhead', '#c9e6a6', '#5a9a52', LV],
  chives: ['sprig', '#4c9a54', '#2f7a3d', LV, { kind: 'grass', pom: '#b07ad0' }], cobnut: ['nuts', '#c89a5e', '', WARM], coriander: ['sprig', '#4c9a54', '#7dbb62', LV, { kind: 'trefoil' }],
  courgette: ['cylinder', '#3d8a45', '#1f5a2c', LV, { stripes: true, flower: true }], cucumber: ['cylinder', '#4f9d4d', '#2f6e3f', LV, { bumps: true }], dill: ['sprig', '#74b866', '#f2d23c', LV, { kind: 'feather' }],
  edamame: ['pod', '#8ec96a', '#4f9d4d', LV, { n: 3, r: 8 }], elderberry: ['umbel', '#3a2a55', '', PUR], 'elephant-garlic': ['bulb', '#f1e4f0', '#b58ab0', PUR, { cloves: true }],
  endive: ['rosette', '#b7dd7a', '#7dbb62', LV, { n: 11, w: 10, len: 54, frill: true }], fig: ['fig', '#6a3a8a', '#3d1f5c', PUR], fennel: ['fennelbulb', '#e9f1cc', '#8bb35c', LV],
  'french-bean': ['pod', '#6dae5c', '#3f8a52', LV, { n: 6, r: 4.5 }], tarragon: ['sprig', '#4c9a54', '#2f7a3d', LV, { kind: 'oval', w: 4, len: 8 }], garlic: ['bulb', '#f6f1ea', '#b9a89a', SOIL, { cloves: true }],
  'garlic-chives': ['sprig', '#4c9a54', '#7dbb62', LV, { kind: 'grass', pom: '#ffffff' }], gherkin: ['cylinder', '#5aa053', '#2f6e3f', LV, { bumps: true }], 'globe-artichoke': ['artichoke', '#7c9c64', '#5b7d4a', LV],
  gooseberry: ['gooseberry', '#b8d97a', '#7a9a3a', LV], grape: ['grapes', '#6a3a8a', '', PUR], 'hardy-kiwi': ['kiwi', '#8bc34a', '#4a7a2a', LV], horseradish: ['root', '#efe3c8', '#a89a76', SOIL],
  hyssop: ['sprig', '#3f6fb0', '#2d6a4f', BLU, { kind: 'needle' }], 'jerusalem-artichoke': ['tuber', '#c9a26b', '#8a6a3a', SOIL, { knobs: true }], kale: ['rosette', '#2f7a4a', '#1f5a3a', LV, { n: 9, w: 13, frill: true }],
  kohlrabi: ['kohl', '#a6d684', '#5a9a52', LV], komatsuna: ['rosette', '#4f9d4d', '#2f6e3f', LV, { n: 8, w: 12 }], 'lambs-lettuce': ['rosette', '#74b866', '#4c9a54', LV, { n: 9, w: 9, len: 40 }],
  'land-cress': ['sprig', '#2f7a4a', '#3f8a52', LV, { kind: 'round' }], lavender: ['sprig', '#8a5fc8', '#b89be0', PUR, { kind: 'spike' }], leek: ['leek', '#f4f1dc', '#4f9d4d', LV],
  'lemon-balm': ['sprig', '#74b866', '#4c9a54', LV, { kind: 'round' }], 'lemon-verbena': ['sprig', '#8bc34a', '#5b9a2a', YEL, { kind: 'oval', w: 4, len: 10 }], lemongrass: ['sprig', '#a8c957', '#6f9a3a', YEL, { kind: 'grass' }],
  lettuce: ['rosette', '#9dd36a', '#5aa469', LV, { n: 9, w: 17 }], loganberry: ['raspberry', '#8a1f4a', '', RED], lovage: ['sprig', '#4c9a54', '#3f8a52', LV, { kind: 'trefoil' }],
  marrow: ['cylinder', '#a9c76a', '#5b7d2a', LV, { stripes: true }], melon: ['round', '#e6c27a', '#a9843a', YEL, { net: true, calyx: false }], microgreens: ['tray', '#7dbb62', '#3f8a52', LV],
  mint: ['sprig', '#3f8a52', '#5aa469', LV, { kind: 'oval', w: 9 }], mizuna: ['rosette', '#74b866', '#4c9a54', LV, { n: 11, w: 7, len: 54, frill: true }], mooli: ['root', '#f4f1ea', '#bdb7a8', SOIL],
  'mustard-greens': ['rosette', '#8a3f6f', '#4f9d4d', PUR, { n: 9, w: 13, frill: true }], nasturtium: ['flower', '#f2761f', '#c4271a', WARM, { n: 5, pw: 11, pr: 17, cr: 6, pad: true }], onion: ['bulb', '#d9a35a', '#8a5a1a', WARM],
  orache: ['rosette', '#b03a5a', '#7a2040', RED, { n: 7, w: 12 }], oregano: ['sprig', '#4c9a54', '#7dbb62', LV, { kind: 'oval', w: 6 }], 'pak-choi': ['bok', '#eef5e0', '#3f8a52', LV],
  parsley: ['sprig', '#2f7a4a', '#4c9a54', LV, { kind: 'trefoil' }], parsnip: ['root', '#f1e6c4', '#b09a64', YEL], 'patty-pan': ['squash', '#f6e7a3', '#c9ad3a', YEL, { flat: true }],
  pea: ['pod', '#7dbb62', '#d6efb4', LV, { n: 6, r: 6 }], peach: ['round', '#f6a97a', '#d9602a', WARM, { cleft: true, leaf: true }], pear: ['pear', '#bcd35a', '#8a9a20', LV, { dots: true }],
  'perpetual-spinach': ['rosette', '#3f8a52', '#2f6e3f', LV, { n: 8, w: 15 }], physalis: ['lantern', '#f6c36a', '#c4851f', WARM], plum: ['round', '#6a3a8a', '#3d1f5c', PUR, { cleft: true, leaf: true }],
  potato: ['tuber', '#d9b988', '#8a6a3a', SOIL], pumpkin: ['squash', '#f08a24', '#a8540c', WARM], quince: ['pear', '#e6cf4a', '#a8921a', YEL],
  radicchio: ['head', '#a3194f', '#6b0f33', RED], radish: ['roundroot', '#e0245e', '#a3194f', RED, { r: 22 }], raspberry: ['raspberry', '#d81e5b', '', RED],
  redcurrant: ['currants', '#d81e2f', '', RED], rhubarb: ['rhubarb', '#c4283a', '#8a1a28', RED], rocket: ['rosette', '#4f9d4d', '#2f6e3f', LV, { n: 9, w: 8, len: 56, frill: true }],
  romanesco: ['curd', '#b7dd5a', '#4f9d4d', LV, { spiky: true }], rosemary: ['sprig', '#3f7d4a', '#2d6a4f', LV, { kind: 'needle' }], bean: ['pod', '#4f9d4d', '#2f6e3f', LV, { n: 5, r: 4.5 }],
  sage: ['sprig', '#8aa88a', '#6f8f72', LV, { kind: 'oval', w: 8, len: 6 }], salsify: ['root', '#efe3c8', '#b09a64', SOIL], savory: ['sprig', '#4c9a54', '#7dbb62', LV, { kind: 'needle' }],
  scorzonera: ['root', '#3a2f2a', '#1f1814', SOIL], 'sea-kale': ['rosette', '#5f9aa6', '#3f7a86', BLU, { n: 7, w: 17 }], shallot: ['bulb', '#c97a5a', '#8a3f2a', WARM],
  sorrel: ['sprig', '#74b866', '#4c9a54', LV, { kind: 'oval', w: 7, len: 6 }], spinach: ['rosette', '#2f7a4a', '#1f5a3a', LV, { n: 8, w: 14 }], 'spring-onion': ['leek', '#f4f1dc', '#4f9d4d', LV, { thin: true }],
  'sprouting-broccoli': ['curd', '#7a4f9a', '#3f8a52', PUR, { dim: true }], strawberry: ['strawberry', '#e0243a', '', RED], swede: ['roundroot', '#d9a8c4', '#9a5a86', PUR, { r: 28 }],
  'sweet-cicely': ['sprig', '#74b866', '#a8d58a', LV, { kind: 'feather' }], 'sweet-marjoram': ['sprig', '#8aa88a', '#6f8f72', LV, { kind: 'round' }], 'sweet-pepper': ['bell', '#e8312a', '#8a1a14', RED],
  'sweet-potato': ['tuber', '#c4603a', '#8a3a1f', WARM, { long: true }], sweetcorn: ['corn', '#f6cf3a', '#b58a12', YEL], 'swiss-chard': ['bok', '#d9304a', '#2f7a4a', RED],
  tatsoi: ['rosette', '#2f7a4a', '#4f9d4d', LV, { n: 8, w: 17, len: 46 }], thyme: ['sprig', '#4c8a5a', '#6aa86f', LV, { kind: 'needle' }], tomatillo: ['round', '#9ccc5a', '#4f7a2a', LV, { husk: '#e8d8a8' }],
  tomato: ['round', '#e8372a', '#a31f14', RED, { leaf: true }], turnip: ['roundroot', '#f4eef4', '#a85a9a', PUR, { r: 25 }], viola: ['flower', '#7a4fb0', '#f5c92e', PUR, { n: 5, pw: 11, pr: 17, cr: 6 }],
  watercress: ['sprig', '#2f7a4a', '#3f8a52', LV, { kind: 'round' }], whitecurrant: ['currants', '#f1ecc4', '', YEL], 'wild-garlic': ['starflower', '#ffffff', '', LV], 'winter-purslane': ['rosette', '#74b866', '#4c9a54', LV, { n: 9, w: 12, len: 42 }],
};

export function illustration(id) {
  const look = L[id];
  if (!look) throw new Error(`No illustration defined for plant "${id}" (add a row in src/illustrations.mjs)`);
  const [shape, c1, c2, bg, o] = look;
  const draw = T[shape];
  if (!draw) throw new Error(`Unknown illustration shape "${shape}" for plant "${id}"`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120" fill="none"><rect width="120" height="120" rx="26" fill="${bg}"/>${draw(c1, c2, o || {})}</svg>\n`;
}
export const illustratedIds = () => Object.keys(L).filter((k) => L[k]);
