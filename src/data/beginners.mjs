/* Beginner's guide content. Crop picks are checked at build time: each must be rated Easy and suit the garden size and sunlight. */
export const PICKS = {
  balcony: { full: ['lettuce', 'radish', 'strawberry', 'chives'], partial: ['radish', 'perpetual-spinach', 'lettuce', 'chives'], shade: ['mint', 'perpetual-spinach', 'lambs-lettuce', 'lemon-balm'] },
  small: { full: ['courgette', 'potato', 'french-bean', 'beetroot'], partial: ['kale', 'pea', 'beetroot', 'strawberry'], shade: ['spinach', 'perpetual-spinach', 'redcurrant', 'mint'] },
  medium: { full: ['courgette', 'potato', 'bean', 'garlic'], partial: ['kale', 'pea', 'raspberry', 'rhubarb'], shade: ['perpetual-spinach', 'redcurrant', 'blackberry', 'mint'] },
  large: { full: ['potato', 'courgette', 'onion', 'bean'], partial: ['kale', 'pea', 'leek', 'raspberry'], shade: ['blackberry', 'redcurrant', 'spinach', 'mint'] },
};

/* One line on why each crop suits a first-timer. */
export const WHY = {
  lettuce: 'Grows quickly from seed and can be picked leaf by leaf. Sow a little every few weeks.',
  radish: 'Ready in about 4 weeks, so it is the fastest way to a first harvest.',
  strawberry: 'Reliable in pots, baskets and beds, and the fruit is far better than shop-bought.',
  chives: 'A tough herb that comes back every year. Snip it all summer.',
  'perpetual-spinach': 'Forgiving, tolerates some shade and keeps cropping for months.',
  mint: 'Almost impossible to kill. Grow it in its own pot, because it spreads.',
  'lambs-lettuce': 'A hardy winter salad that grows happily in cool, shady spots.',
  'lemon-balm': 'Easy, fragrant and happy in shade. Good for tea.',
  courgette: 'One or two plants give plenty. Very reliable in a sunny spot.',
  potato: 'Easy in the ground or in a large bag or bucket. Digging them up is great fun.',
  'french-bean': 'Fast and heavy cropping. Dwarf types need no supports.',
  beetroot: 'Easy from seed, and you can eat the young leaves too.',
  kale: 'Very hardy and not fussy. It crops through winter when little else does.',
  pea: 'Sweet, fast, and lovely eaten straight from the pod.',
  spinach: 'Quick, cool-season leaves that cope with partial shade.',
  redcurrant: 'A tough fruit bush that fruits well even in shade, and lives for years.',
  bean: 'Runner beans climb quickly and crop heavily from July until the first frost.',
  garlic: 'Plant cloves in autumn, then mostly forget about them until summer.',
  raspberry: 'Plant once and pick fruit for years. Autumn types are the simplest to prune.',
  rhubarb: 'Almost no work. Comes back every spring and tolerates partial shade.',
  blackberry: 'Hardy and cheerful, and even gives fruit in light shade. Choose a thornless type.',
  onion: 'Plant small bulbs (sets) rather than seed. They are very forgiving.',
  leek: 'Hardy and sturdy, and stands in the ground all winter.',
};

export const SOIL = {
  ground: {
    title: 'A bed in the ground',
    steps: [
      ['Pick the spot', 'Most vegetables want at least 6 hours of sun a day. Choose somewhere level, sheltered from strong wind and close to a tap or water butt.'],
      ['Clear it', 'Remove weeds, stones and rubbish. Dig out the roots of dandelions, docks and bindweed, because even small pieces regrow. To remove grass, cut the turf off and stack it upside down to rot, or smother the area with cardboard.'],
      ['Know your soil', 'Squeeze a handful of damp soil. Gritty and falling apart means sandy soil, which drains fast. Sticky and shiny means clay, which holds water. Crumbly and holding together loosely is ideal. Both sand and clay improve with lots of compost.'],
      ['Loosen and feed', 'Fork the soil over to the depth of the fork and spread a 5 to 10 cm layer of well-rotted compost or manure on top. Alternatively, skip the digging and just lay the compost over the cardboard. This “no-dig” method is easier on your back.'],
      ['Rake it fine', 'Rake the top into a fine, crumbly layer, called a tilth, for sowing seed. Remove stones and break up lumps.'],
      ['Keep off it', 'Mark out beds no wider than 1.2 m so you can reach the middle without stepping on the soil. Standing on it squashes the air out.'],
    ],
    tip: 'Do not dig when the soil is soggy or frozen. Wait until it crumbles in your hand.',
  },
  raised: {
    title: 'A raised bed',
    steps: [
      ['Size it for reaching', 'Keep beds no wider than 1.2 m. A depth of 20 to 30 cm is fine for most crops, and 40 cm is better for carrots and potatoes.'],
      ['Line the base', 'On grass, lay cardboard in the bottom to stop weeds. On paving, make sure water can drain away.'],
      ['Fill it', 'Use about two parts good topsoil to one part compost, or a bagged raised-bed mix. Fill right to the top, because it sinks over the first few weeks.'],
      ['Top up each year', 'Add 5 cm of compost every spring. The soil level drops as it settles and plants use it up.'],
    ],
    tip: 'Raised beds drain faster than the ground, so water them more in dry spells.',
  },
  pots: {
    title: 'Pots, grow bags and containers',
    steps: [
      ['Choose big enough', 'Salad and herbs need about 20 cm of depth. Courgettes, potatoes and beans do better in 30 to 40 litres, such as a large pot, bucket or potato bag.'],
      ['Drainage is vital', 'Every pot needs holes in the bottom. Stand it on pot feet so water can escape, and do not add a layer of stones, which does not help.'],
      ['Use the right compost', 'Fill with multipurpose compost, ideally peat-free. Do not use soil from the garden, which sets hard in pots and may bring weeds and disease.'],
      ['Feed and water', 'Compost in pots runs out of food after about 6 weeks. Mix in slow-release feed at planting, or give a liquid feed every 1 to 2 weeks once plants are growing. Check pots daily in summer.'],
    ],
    tip: 'Push a finger 2 cm into the compost. If it feels dry, water it. If it is damp, wait.',
  },
};

export const BUY = {
  essentials: [
    ['Compost', 'Peat-free multipurpose compost for pots and sowing. For beds, a few bags of garden compost or well-rotted manure.'],
    ['Seeds or young plants', 'Seeds are cheap but need more time. Young “plug” plants cost more but give a head start. Buy from a reputable UK supplier.'],
    ['Trowel', 'A hand trowel for planting and digging out weeds. Choose a strong, one-piece one.'],
    ['Watering can with a rose', 'A can with a sprinkler head waters gently without washing seeds away. Around 5 to 10 litres is plenty to start.'],
    ['Plant labels and a pencil', 'You will forget what you sowed where. A pencil does not fade like a pen.'],
    ['Gloves', 'Gardening gloves protect against thorns, splinters and dirt.'],
  ],
  bySize: {
    balcony: ['A few pots 25 to 30 cm wide, with drainage holes, and saucers or pot feet', 'A window box or hanging basket for herbs and salad', 'A small bag of slow-release plant food', 'A lightweight bag of compost, since you may have to carry it up stairs'],
    small: ['A raised bed (1.2 m × 0.8 m is a good size) or 2 or 3 large containers', 'A couple of grow bags or potato bags', 'A hand fork', 'Garden string and a few bamboo canes for peas and beans', 'A small water butt, if you have a downpipe'],
    medium: ['A garden fork and spade', 'A rake for making a fine surface', 'A hoe for quick weeding', 'A compost bin, so you can make your own compost', 'A hose with a spray head, and a water butt', 'Fine mesh netting for caterpillars and birds'],
    large: ['A garden fork, spade and rake', 'A hoe and a wheelbarrow', 'Secateurs, for tidying fruit bushes', 'A large compost bin or two', 'A hose, or several water butts', 'Netting and canes to protect fruit and brassicas', 'A shed or storage box'],
  },
  later: ['Fleece, to protect early sowings from frost', 'A cloche or a cold frame to extend the season', 'A tomato feed if you start growing tomatoes', 'A good pair of pruning scissors', 'A soil pH testing kit'],
  skip: ['Chemical sprays. Try hand-picking, barriers and encouraging wildlife first.', 'Expensive tool sets. Buy a few good basic tools instead.', 'Too many seed packets. Choose 3 to 5 crops for your first year.'],
  budget: [
    ['Balcony or windowsill', 'around £30–£60'],
    ['Small garden or patio', 'around £60–£130'],
    ['Medium garden', 'around £100–£200'],
    ['Large garden or allotment', 'around £150–£300, and many allotments offer cheap or shared tools'],
  ],
};

export const YEAR = [
  ['Now to February', 'Plan your crops, order seeds, and prepare your bed or pots. Winter is a good time to build raised beds.'],
  ['March to April', 'Sow the hardy crops outside or on a windowsill, such as peas, broad beans, radish and lettuce. Plant potatoes.'],
  ['May', 'After the last frost, plant out tender crops such as courgettes and beans. Harden them off first.'],
  ['June to September', 'Water regularly, weed little and often, and pick crops as they ripen. Regular picking keeps plants cropping.'],
  ['October to November', 'Clear spent crops, spread compost on beds, and plant garlic and broad beans for next year.'],
];
