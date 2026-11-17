/* Affiliate shops and which crop pages show a "Buy" box for them.
 *
 * Each shop is an Awin programme. Links are built as Awin deep links, so any
 * page on the shop's site can be linked without making a new link in Awin.
 *
 * To add a crop: add a line to the shop's `crops` list: crop id (as in the
 * plant page address /plants/<id>/) and the words to search the shop for.
 * To remove a crop, delete its line. To pause a shop, set `live: false`.
 */

export const AWIN_PUBLISHER = '3148015';

export const SHOPS = [
  {
    id: 'hayloft',
    name: 'Hayloft',
    live: true,
    awinmid: '73810',
    search: (q) => `https://www.hayloft.co.uk/catalogsearch/result/?q=${encodeURIComponent(q)}`,
    blurb: 'Hayloft sells young plants, fruit bushes and fruit trees by post, so you can skip sowing and start with a healthy plant.',
    crops: {
      // Fruiting veg
      tomato: 'tomato',
      chilli: 'chilli',
      'sweet-pepper': 'pepper',
      cucumber: 'cucumber',
      courgette: 'courgette',
      aubergine: 'aubergine',
      pumpkin: 'pumpkin',
      'butternut-squash': 'squash',
      melon: 'melon',
      // Soft fruit
      strawberry: 'strawberry',
      raspberry: 'raspberry',
      blueberry: 'blueberry',
      blackcurrant: 'blackcurrant',
      redcurrant: 'redcurrant',
      gooseberry: 'gooseberry',
      blackberry: 'blackberry',
      grape: 'grape vine',
      rhubarb: 'rhubarb',
      // Fruit trees
      apple: 'apple tree',
      pear: 'pear tree',
      plum: 'plum tree',
      cherry: 'cherry tree',
      fig: 'fig',
      // Perennial veg
      asparagus: 'asparagus',
      // Herbs
      basil: 'basil',
      mint: 'mint',
      thyme: 'thyme',
      rosemary: 'rosemary',
      sage: 'sage',
      chives: 'chives',
      lavender: 'lavender',
      bay: 'bay tree',
    },
  },
];

/* Awin deep link. clickref records which crop page the click came from (shown in Awin reports). */
export function awinLink(shop, url, ref) {
  return `https://www.awin1.com/cread.php?awinmid=${shop.awinmid}&awinaffid=${AWIN_PUBLISHER}&clickref=${encodeURIComponent(ref)}&ued=${encodeURIComponent(url)}`;
}

/* Shops with a link for this crop, as [{ shop, href }]. */
export function shopsFor(cropId) {
  return SHOPS.filter((s) => s.live && s.crops[cropId]).map((shop) => ({ shop, href: awinLink(shop, shop.search(shop.crops[cropId]), cropId) }));
}

export const HAS_AFFILIATE_LINKS = SHOPS.some((s) => s.live);
