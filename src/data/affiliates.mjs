/* Affiliate shops and which crop pages show a "Buy" box for them.
 *
 * Each shop is an Awin programme. Links are built as Awin deep links, so any
 * page on the shop's site can be linked without making a new link in Awin.
 *
 * To add a crop: add a line to the shop's `crops` list: crop id (as in the
 * plant page address /plants/<id>/) and the words to search the shop for.
 * `sells: 'seeds'` makes the box heading say "seeds and plants".
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
  {
    id: 'marshalls',
    name: 'Marshalls Garden',
    live: true,
    awinmid: '122984',
    sells: 'seeds',
    search: (q) => `https://www.marshallsgarden.com/search?q=${encodeURIComponent(q)}`,
    blurb: 'Marshalls Garden sells vegetable and herb seeds, seed potatoes, onion sets and young veg plants by post, with lots of varieties to choose from.',
    crops: {
      // Fruiting veg
      tomato: 'tomato',
      chilli: 'chilli',
      'sweet-pepper': 'pepper',
      cucumber: 'cucumber',
      gherkin: 'gherkin',
      courgette: 'courgette',
      marrow: 'marrow',
      'patty-pan': 'patty pan',
      aubergine: 'aubergine',
      pumpkin: 'pumpkin',
      'butternut-squash': 'squash',
      melon: 'melon',
      sweetcorn: 'sweetcorn',
      // Roots
      beetroot: 'beetroot',
      carrot: 'carrot',
      parsnip: 'parsnip',
      radish: 'radish',
      mooli: 'mooli',
      turnip: 'turnip',
      swede: 'swede',
      kohlrabi: 'kohlrabi',
      celeriac: 'celeriac',
      celery: 'celery',
      potato: 'seed potatoes',
      'sweet-potato': 'sweet potato',
      // Onion family
      onion: 'onion',
      shallot: 'shallot',
      garlic: 'garlic',
      leek: 'leek',
      'spring-onion': 'spring onion',
      // Leaves and salad
      lettuce: 'lettuce',
      rocket: 'rocket',
      spinach: 'spinach',
      'perpetual-spinach': 'perpetual spinach',
      'swiss-chard': 'chard',
      'lambs-lettuce': 'corn salad',
      endive: 'endive',
      radicchio: 'radicchio',
      chicory: 'chicory',
      'pak-choi': 'pak choi',
      'chinese-cabbage': 'chinese cabbage',
      mizuna: 'mizuna',
      'mustard-greens': 'mustard',
      microgreens: 'microgreens',
      // Cabbage family
      kale: 'kale',
      cabbage: 'cabbage',
      cauliflower: 'cauliflower',
      calabrese: 'calabrese',
      'sprouting-broccoli': 'sprouting broccoli',
      'brussels-sprouts': 'brussels sprout',
      romanesco: 'romanesco',
      // Peas and beans
      pea: 'pea',
      'broad-bean': 'broad bean',
      'french-bean': 'french bean',
      bean: 'runner bean',
      'borlotti-bean': 'borlotti',
      // Perennial veg
      asparagus: 'asparagus',
      'globe-artichoke': 'artichoke',
      fennel: 'florence fennel',
      // Fruit
      strawberry: 'strawberry',
      rhubarb: 'rhubarb',
      // Herbs
      basil: 'basil',
      parsley: 'parsley',
      coriander: 'coriander',
      dill: 'dill',
      chives: 'chives',
      mint: 'mint',
      thyme: 'thyme',
      sage: 'sage',
      oregano: 'oregano',
      rosemary: 'rosemary',
      chervil: 'chervil',
      'sweet-marjoram': 'marjoram',
      nasturtium: 'nasturtium',
      calendula: 'calendula',
      borage: 'borage',
    },
  },
  {
    id: 'thompson-morgan',
    name: 'Thompson & Morgan',
    live: true,
    awinmid: '2283',
    sells: 'seeds',
    search: (q) => `https://www.thompson-morgan.com/search-results?q=${encodeURIComponent(q)}`,
    blurb: 'Thompson & Morgan has sold seeds since 1855 and has one of the biggest ranges in the UK: veg and herb seeds, young plants, fruit bushes and fruit trees, all by post.',
    crops: {
      // Fruiting veg
      tomato: 'tomato',
      chilli: 'chilli',
      'sweet-pepper': 'pepper',
      cucumber: 'cucumber',
      gherkin: 'gherkin',
      courgette: 'courgette',
      marrow: 'marrow',
      'patty-pan': 'patty pan',
      aubergine: 'aubergine',
      pumpkin: 'pumpkin',
      'butternut-squash': 'squash',
      melon: 'melon',
      sweetcorn: 'sweetcorn',
      // Roots
      beetroot: 'beetroot',
      carrot: 'carrot',
      parsnip: 'parsnip',
      radish: 'radish',
      mooli: 'mooli',
      turnip: 'turnip',
      swede: 'swede',
      kohlrabi: 'kohlrabi',
      celeriac: 'celeriac',
      celery: 'celery',
      potato: 'seed potatoes',
      'sweet-potato': 'sweet potato',
      // Onion family
      onion: 'onion',
      shallot: 'shallot',
      garlic: 'garlic',
      leek: 'leek',
      'spring-onion': 'spring onion',
      // Leaves and salad
      lettuce: 'lettuce',
      rocket: 'rocket',
      spinach: 'spinach',
      'perpetual-spinach': 'perpetual spinach',
      'swiss-chard': 'chard',
      'lambs-lettuce': 'corn salad',
      endive: 'endive',
      radicchio: 'radicchio',
      chicory: 'chicory',
      'pak-choi': 'pak choi',
      'chinese-cabbage': 'chinese cabbage',
      mizuna: 'mizuna',
      'mustard-greens': 'mustard',
      microgreens: 'microgreens',
      // Cabbage family
      kale: 'kale',
      cabbage: 'cabbage',
      cauliflower: 'cauliflower',
      calabrese: 'calabrese',
      'sprouting-broccoli': 'sprouting broccoli',
      'brussels-sprouts': 'brussels sprout',
      romanesco: 'romanesco',
      // Peas and beans
      pea: 'pea',
      'broad-bean': 'broad bean',
      'french-bean': 'french bean',
      bean: 'runner bean',
      'borlotti-bean': 'borlotti',
      // Perennial veg
      asparagus: 'asparagus',
      'globe-artichoke': 'artichoke',
      fennel: 'florence fennel',
      // Fruit
      strawberry: 'strawberry',
      rhubarb: 'rhubarb',
      // Herbs
      basil: 'basil',
      parsley: 'parsley',
      coriander: 'coriander',
      dill: 'dill',
      chives: 'chives',
      mint: 'mint',
      thyme: 'thyme',
      sage: 'sage',
      oregano: 'oregano',
      rosemary: 'rosemary',
      chervil: 'chervil',
      'sweet-marjoram': 'marjoram',
      nasturtium: 'nasturtium',
      calendula: 'calendula',
      borage: 'borage',
      // More fruit
      raspberry: 'raspberry',
      blueberry: 'blueberry',
      blackcurrant: 'blackcurrant',
      redcurrant: 'redcurrant',
      gooseberry: 'gooseberry',
      blackberry: 'blackberry',
      grape: 'grape vine',
      apple: 'apple tree',
      pear: 'pear tree',
      plum: 'plum tree',
      cherry: 'cherry tree',
      fig: 'fig',
      // More herbs
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
