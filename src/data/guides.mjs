/* Long-form seasonal guides, published at /guides/<slug>/.
   Text format: [link text](/path/) makes a link and **words** makes bold. Every link is checked at build time.
   Facts here should match the plant pages and storage notes; update both together. */

export const GUIDES = [
  {
    slug: 'storing-veg-over-winter',
    title: 'How to store vegetables over winter (UK guide)',
    h1: 'How to store your veg over winter',
    description: 'Keep home-grown veg into spring: what to leave in the ground, boxes of damp sand, potato clamps, onion ropes and which crops keep where.',
    image: 'potato',
    quick: 'Leave hardy roots and winter greens in the ground, pack carrots, beetroot and celeriac in boxes of damp sand, keep potatoes in paper sacks, hang onions and garlic, and keep squash on a shelf indoors. Everything needs to be cool, dark (except squash) and frost-free.',
    lead: 'Every plant page on this site has its own storage notes. This guide puts them together so you can plan your shed, garage and spare corners for the whole winter in one go.',
    crops: ['potato', 'carrot', 'parsnip', 'beetroot', 'celeriac', 'swede', 'onion', 'garlic', 'shallot', 'butternut-squash', 'pumpkin', 'apple', 'cabbage', 'leek'],
    sections: [
      { h: 'Three rules for everything you store', list: [
        '**Store only perfect crops.** Anything bruised, split, forked badly or nibbled by slugs will rot and spread it to its neighbours. Eat those first.',
        '**Keep it cool, dark and frost-free.** A shed or garage at roughly 2–10°C suits most roots. A frost will turn them to mush, but somewhere too warm makes them sprout.',
        '**Check once a month.** Take out anything soft or mouldy. One bad potato can spoil a sack.',
      ] },
      { h: 'Start with the easiest store: the ground', p: [
        'Many winter crops keep better in the soil than anywhere else, and some taste sweeter after frost. Just lift them as you need them.',
      ], list: [
        '[Parsnips](/plants/parsnip/), [swedes](/plants/swede/), [leeks](/plants/leek/), [salsify](/plants/salsify/) and [Jerusalem artichokes](/plants/jerusalem-artichoke/) are hardy enough to stay in the ground all winter.',
        '[Brussels sprouts](/plants/brussels-sprouts/) and [kale](/plants/kale/) keep best on the plant. Pick from the bottom of the sprout stalk upwards.',
        '[Carrots](/plants/carrot/), [celeriac](/plants/celeriac/) and [beetroot](/plants/beetroot/) can stay put in milder areas under a thick layer of straw. In cold or very wet gardens, lift them in November and box them up instead.',
      ], after: [
        'Lay straw or fleece over the rows before a hard freeze, and mark the ends with canes, so you can still dig when the top of the soil is frozen or covered in snow. Lift any parsnips, salsify and Jerusalem artichokes that are left by March, before they start to regrow and turn woody.',
      ] },
      { h: 'Boxes of damp sand for roots', p: [
        'This is the classic way to keep [carrots](/plants/carrot/), [beetroot](/plants/beetroot/), [celeriac](/plants/celeriac/), [parsnips](/plants/parsnip/), [swedes](/plants/swede/), [turnips](/plants/turnip/), [mooli](/plants/mooli/) and [horseradish](/plants/horseradish/) for three to six months. The sand keeps the roots from drying out and stops rot jumping from one to the next.',
      ], steps: [
        'Lift on a dry day. Twist the leaves off (don’t cut into the root), leaving a short stub, and gently rub off loose soil. Don’t wash them.',
        'Use a wooden box, crate or old plastic storage box with a few holes. Put a few centimetres of slightly damp sand (play sand or builder’s sand) or old potting compost in the bottom.',
        'Lay the roots in a single layer so they don’t touch, then cover with sand. Repeat in layers, finishing with sand on top.',
        'Keep the box in a frost-free shed or garage. Take roots from the top as you need them.',
      ], after: ['The sand should feel like a sandcastle, not wet. Too wet and roots rot; too dry and they go rubbery.'] },
      { h: 'Make a clamp if you have no shed', p: [
        'A clamp is an old allotment trick for storing a big crop of [potatoes](/plants/potato/) or roots outdoors. It is a mound of straw and soil that keeps the frost out and the rain off.',
      ], steps: [
        'Choose a well-drained spot. Put down a layer of straw about 15–20 cm thick.',
        'Pile your roots or potatoes on it in a ridge or cone shape.',
        'Cover with another 15–20 cm of straw, then about 15 cm of soil, patted firm with the back of a spade.',
        'Pull a tuft of straw through the soil at the top as a little chimney, so damp air can escape.',
        'Dig a shallow trench round the outside so rain drains away.',
      ], after: ['To use it, open one end, take what you need for the next week or two, and seal it up again. Clamps can attract mice and rats, so check them often.'] },
      { h: 'Potatoes in sacks', p: [
        'Let maincrop [potatoes](/plants/potato/) dry on the soil surface for a few hours after digging so the skins harden, then brush off the soil. Store them in paper or hessian sacks, never plastic, somewhere dark and frost-free at around 5–10°C. Light turns them green, so fold the tops of the sacks over. They keep for four to six months.',
      ] },
      { h: 'Hang onions, shallots and garlic', p: [
        '[Onions](/plants/onion/), [shallots](/plants/shallot/) and [garlic](/plants/garlic/) need to be dried properly first, in a warm, airy place, until the necks are tight and the skins are papery. After that, they want somewhere cool, dry and airy: a shed, garage or cool porch. Unlike roots, they hate damp.',
      ], list: [
        '**Nets:** old onion nets or fruit nets hung from a hook.',
        '**Old tights:** drop in an onion, tie a knot, drop in the next one. Snip off the bottom one when you need it.',
        '**Ropes and plaits:** softneck garlic and onions with soft dry stems can be plaited together. They look good and keep air moving around each bulb.',
      ], after: ['Onions keep six to nine months like this, softneck garlic six to eight, and hardneck garlic only three to five, so eat hardnecks first.'] },
      { h: 'Squash, pumpkins, apples and cabbages', list: [
        '**[Squash](/plants/butternut-squash/) and [pumpkins](/plants/pumpkin/):** cut them with a long stalk before the first frost and leave them in the sun for about ten days to harden their skins. Then keep them on a shelf in a dry room at 10–15°C. They like it warmer than roots do, so a cool bedroom or the top of a kitchen cupboard is better than a cold shed.',
        '**[Apples](/plants/apple/) and [pears](/plants/pear/):** only late varieties store well. Wrap each sound fruit in newspaper and lay them in a single layer in trays, not touching, somewhere cool and frost-free. Keep them away from potatoes, which they can make sprout.',
        '**[Winter cabbages](/plants/cabbage/):** cut firm heads, pull off loose outer leaves, and hang them upside down by the stalk in a frost-free shed. They keep for two to four months.',
      ] },
      { h: 'What keeps where, at a glance', table: {
        head: ['Crop', 'How', 'Where', 'Keeps'],
        rows: [
          ['[Parsnips](/plants/parsnip/)', 'Leave in the ground', 'The veg bed', 'Oct to Mar'],
          ['[Leeks](/plants/leek/)', 'Leave in the ground', 'The veg bed', 'Oct to Apr'],
          ['[Swedes](/plants/swede/)', 'Leave in the ground, or damp sand', 'Veg bed or shed', 'Oct to Mar'],
          ['[Brussels sprouts](/plants/brussels-sprouts/)', 'Leave on the plant', 'The veg bed', 'Oct to Mar'],
          ['[Carrots](/plants/carrot/)', 'Boxes of damp sand', 'Frost-free shed', '4–6 months'],
          ['[Beetroot](/plants/beetroot/)', 'Boxes of damp sand', 'Frost-free shed', '3–5 months'],
          ['[Celeriac](/plants/celeriac/)', 'Boxes of damp sand', 'Frost-free shed', '3–5 months'],
          ['[Potatoes](/plants/potato/)', 'Paper or hessian sacks', 'Dark, frost-free shed', '4–6 months'],
          ['[Onions](/plants/onion/)', 'Nets, tights or ropes', 'Cool, dry and airy', '6–9 months'],
          ['[Garlic](/plants/garlic/)', 'Nets or plaits', 'Cool, dry and airy', '3–8 months'],
          ['[Squash](/plants/butternut-squash/)', 'Shelves', 'Indoors at 10–15°C', '3–6 months'],
          ['[Apples](/plants/apple/)', 'Wrapped, in trays', 'Cool, frost-free', '3–6 months'],
          ['[Cabbages](/plants/cabbage/)', 'Hung by the stalk', 'Frost-free shed', '2–4 months'],
        ],
      } },
      { h: 'When something won’t keep', p: [
        'Not every crop stores whole. If you find a few roots starting to go soft, or have more than you can eat, turn them into something else: see [every way to freeze, pickle and preserve your harvest](/preserving/), or [what to preserve in November](/what-to-preserve/november/). Roots that have started to wrinkle are still fine in [soups](/recipes/curried-parsnip-soup/) and [mash](/recipes/swede-carrot-mash/).',
      ] },
    ],
  },

  {
    slug: 'christmas-dinner-from-the-veg-patch',
    title: 'Christmas dinner from the veg patch: what to grow (UK)',
    h1: 'Christmas dinner from the veg patch',
    description: 'What to grow, and when to sow it, for home-grown sprouts, parsnips, carrots, roast potatoes and red cabbage on Christmas Day, plus recipes for each.',
    image: 'brussels-sprouts',
    quick: 'For home-grown Christmas veg, sow parsnips in March or April, sprouts indoors in March or April, maincrop carrots by early summer, and plant potatoes in bags in August. Most of it then waits in the ground until Christmas Eve.',
    lead: 'Picking your own sprouts and pulling your own parsnips on Christmas Eve is one of the best bits of growing your own. It just takes a bit of planning, because some of these crops are sown nine months before the big day.',
    crops: ['brussels-sprouts', 'parsnip', 'carrot', 'potato', 'cabbage', 'leek', 'swede', 'sage', 'thyme', 'horseradish'],
    sections: [
      { h: 'Your year at a glance', table: {
        head: ['When', 'What to do'],
        rows: [
          ['January', 'Order seeds: parsnips, sprouts, carrots and red cabbage. Use fresh parsnip seed each year.'],
          ['March to April', 'Sow [parsnips](/plants/parsnip/) outside. Sow [Brussels sprouts](/plants/brussels-sprouts/) and [red cabbage](/plants/cabbage/) indoors in modules.'],
          ['May to June', 'Plant out sprouts and red cabbage into firm soil, and net them. Sow maincrop [carrots](/plants/carrot/).'],
          ['August', 'Plant seed potatoes in bags or tubs for [Christmas new potatoes](/plants/potato/).'],
          ['October to November', 'Stake sprouts against the wind. Move potato bags under cover before the first frost. Lay straw over carrots and parsnips.'],
          ['Christmas Eve', 'Pick, pull and dig. Everything is at its freshest.'],
        ],
      } },
      { h: 'Brussels sprouts', p: [
        'Sprouts take a long time, about 28–36 weeks from sowing, so start them in March or April. Sow indoors in modules, then plant out in May or June, about 60–75 cm apart. They need firm soil, so tread the bed before planting rather than digging it, and plant deeply up to the lowest leaves. Net them straight away against pigeons and cabbage white butterflies.',
        'An April sowing will be cropping by Christmas. If you are buying seed specially, check the packet for a variety that crops in December. Frost makes sprouts sweeter, and they keep on the stalk, so pick from the bottom upwards on Christmas Eve. Tall plants can rock in autumn winds, so tie them to a stake.',
      ], recipes: ['brussels-sprouts-roast', 'bubble-and-squeak'] },
      { h: 'Parsnips', p: [
        'Sow [parsnips](/plants/parsnip/) straight into the ground from mid-March to April, three seeds every 15 cm, and thin to the strongest. They are slow to come up, taking three to four weeks, so mark the row with a few radishes. Always use seed from this year’s packet, as old parsnip seed rarely comes up.',
        'Roots are ready from October, but the first hard frosts turn some of the starch to sugar, so Christmas parsnips are the sweetest of the year. If a big freeze is forecast in the week before Christmas, lift what you need a few days early and keep them in a box of damp sand.',
      ], recipes: ['honey-roast-parsnips', 'curried-parsnip-soup'] },
      { h: 'Carrots', p: [
        'For Christmas, sow a maincrop variety that keeps well, such as Autumn King, in May or June. Sow thinly where they will grow, in stone-free soil, and cover with fleece or fine mesh against carrot fly.',
        'In milder areas leave them in the ground under a thick layer of straw and pull them as you need them. In cold or wet gardens, lift them in November and store them in [boxes of damp sand](/guides/storing-veg-over-winter/), where they keep until spring.',
      ], recipes: ['swede-carrot-mash'] },
      { h: 'Roast potatoes and Christmas new potatoes', p: [
        'Maincrop [potatoes](/plants/potato/) lifted in September and stored in paper sacks will see you through to Christmas for roasties.',
        'For a treat, grow new potatoes for Christmas Day. In August, plant seed potatoes sold for late planting in large bags or tubs, three to a 30–40 cm container. Keep them outside while it is mild, then move them into a greenhouse, porch or cool conservatory before the first frost. Leave the potatoes in the compost until Christmas Eve, then tip the bag out.',
      ], recipes: ['rosemary-roast-potatoes', 'potato-dauphinoise'] },
      { h: 'Red cabbage', p: [
        'Sow a red [cabbage](/plants/cabbage/) such as Red Jewel indoors in March or April and plant out in May or June, again into firm soil, under a net. The heads are ready in autumn. Cut them before hard frosts and hang them in a frost-free shed, where they keep for two to four months, or make a jar of pickled red cabbage to go with the cold meats on Boxing Day.',
      ], recipes: ['braised-red-cabbage', 'pickled-red-cabbage'] },
      { h: 'The extras', list: [
        '**[Leeks](/plants/leek/)** sown in March or April stand in the ground all winter. Lovely as buttered leeks or in the stuffing.',
        '**[Swedes](/plants/swede/)** sown in May or June are ready from October for a carrot and swede mash.',
        '**[Sage](/plants/sage/), [thyme](/plants/thyme/) and [bay](/plants/bay/)** in pots give you fresh herbs for the stuffing and gravy all year.',
        '**[Horseradish](/plants/horseradish/)** roots dug in December make a fiery fresh sauce if you are having beef.',
      ], recipes: ['buttered-leeks', 'horseradish-sauce', 'herby-sausage-patties'] },
      { h: 'Boxing Day', p: [
        'Fry the leftover sprouts, potatoes and cabbage into [bubble and squeak](/recipes/bubble-and-squeak/), and warm everyone up with a [hot spiced apple punch](/recipes/hot-spiced-apple-punch/) made from stored apples.',
      ] },
    ],
  },

  {
    slug: 'growing-garlic-in-pots',
    title: 'How to grow garlic in pots (UK)',
    h1: 'How to grow garlic in pots',
    description: 'Grow garlic on a balcony, patio or doorstep: pot sizes, how many cloves per pot, when to plant in the UK, winter care, feeding and harvesting.',
    image: 'garlic',
    quick: 'Plant garlic cloves in pots from October to December, 10 cm apart and 2.5–5 cm deep, in a pot at least 20 cm deep filled with compost mixed with grit. Leave the pot outside in the sun all winter and harvest in June or July.',
    lead: 'Garlic is one of the best crops for a small space. It needs no support, very little care, and it sits quietly through the winter when your pots would otherwise be empty. A single 30 cm pot gives you five or six bulbs.',
    crops: ['garlic', 'elephant-garlic'],
    sections: [
      { h: 'What you need', list: [
        '**A pot at least 20 cm deep**, with drainage holes. Plastic, terracotta, a window box or a big trough all work. Wider is better than deeper.',
        '**Peat-free multipurpose compost, mixed with grit or perlite.** About two parts compost to one part grit keeps it free-draining. Wet compost is the main reason garlic in pots rots.',
        '**Garlic bulbs bought for planting.** Supermarket garlic is often grown abroad for a warmer climate and can carry disease, so buy certified bulbs from a garden centre or seed company.',
      ], photos: [
        { file: 'garlic-pot-empty.jpg', alt: 'An empty grey plastic pot with drainage holes in the base, standing on the floor of a greenhouse', caption: 'A wide pot with drainage holes in the base.' },
        { file: 'garlic-pot-filled.jpg', alt: 'The same grey pot filled with compost to just below the rim', caption: 'Filled with compost to about 3 cm below the rim.' },
      ] },
      { h: 'How many cloves per pot', table: {
        head: ['Pot', 'Garlic', 'Elephant garlic'],
        rows: [
          ['20 cm pot', '3', '1'],
          ['30 cm pot', '5–6', '2'],
          ['40 cm pot', '8–10', '3'],
          ['60 cm trough', '10–12', '3–4'],
        ],
      }, after: ['These spacings are a little closer than in the ground (10 cm rather than 15 cm), which is fine in good compost as long as you feed in spring. [Elephant garlic](/plants/elephant-garlic/) has giant cloves and needs about 20 cm each way.'] },
      { h: 'Which garlic to grow', p: [
        '**Softneck** garlic, such as Solent Wight or Germidour, gives more cloves per bulb and stores longest, up to six to eight months. Its soft stems can be plaited.',
        '**Hardneck** garlic, such as Lautrec Wight or Chesnok Red, has fewer, bigger cloves and a stronger flavour. It sends up a curly flower stem (the scape) in early summer, which is a free extra crop. Hardnecks only keep for three to five months.',
        'If you only have room for one pot, a softneck is the safer choice. See the [garlic growing guide](/plants/garlic/) for more on each type.',
      ], photos: [
        { file: 'garlic-germidour-label.jpg', wide: true, alt: 'A garlic packet label reading Germidour, 2 French garlic, mild flavour, violet cloves, softneck, plant in autumn', caption: 'Germidour: a mild French softneck with violet cloves, planted in autumn.' },
      ] },
      { h: 'When to plant', p: [
        'October to December is best, and November is perfect. Garlic needs a spell of cold weather over winter to split into separate cloves, so autumn planting gives the biggest bulbs. You can plant softnecks as late as February or March, but the bulbs will be smaller.',
        'For the same reason, keep the pot outside all winter. Garlic grown indoors on a warm windowsill usually makes a single round bulb with no cloves.',
      ] },
      { h: 'How to plant', steps: [
        'Fill the pot with your compost and grit mix to about 3 cm below the rim.',
        'Break the bulb into cloves just before planting. Use the biggest, fattest outer cloves and cook the small middle ones.',
        'Push each clove in with the pointed end up and the flat end down, so the tip sits 2.5–5 cm below the surface, about 10 cm apart and 5 cm in from the edge.',
        'Water once to settle the compost, then leave it.',
      ], photos: [
        { file: 'garlic-bulb.jpg', alt: 'A whole garlic bulb with purple-streaked skin held in a hand', caption: 'Start with one firm, healthy bulb.' },
        { file: 'garlic-cloves.jpg', alt: 'Six garlic cloves in an open hand, papery skins still on', caption: 'Split it into cloves and keep the papery skins on.' },
        { file: 'garlic-planting-clove.jpg', alt: 'A hand pushing a garlic clove, pointed end up, into compost in a pot', caption: 'Push each clove in, pointed end up.' },
        { file: 'garlic-watering-in.jpg', alt: 'A green watering can with a rose sprinkling water over the planted pot', caption: 'Water in once with a rose on the can.' },
      ] },
      { h: 'Winter care', list: [
        'Stand the pot in the sunniest spot you have, and raise it on pot feet or bricks so water can drain away.',
        'Only water if the compost is dry a finger’s depth down. Winter rain is usually plenty.',
        'Birds love pulling out newly planted cloves. Cover the pot with netting or a few sticks for the first few weeks.',
        'Garlic is very hardy and doesn’t mind frost. In a long, hard freeze, move the pot against a house wall to stop the compost freezing solid for weeks.',
      ] },
      { h: 'Spring care', list: [
        'Once growth picks up in March, water whenever the top of the compost feels dry. Pots dry out much faster than beds.',
        'Feed every two weeks from March to May with a liquid seaweed or general-purpose feed. Plants in pots run out of food much sooner than in the ground.',
        'On hardneck garlic, snap off the curly scape when it appears in early summer, so the plant puts its energy into the bulb. Use scapes like spring onions, or in [pesto](/recipes/pesto/).',
        'Stop watering once the leaves start to turn yellow, so the bulbs ripen and store well.',
      ] },
      { h: 'Harvesting', p: [
        'Garlic in pots is usually ready in June or July. Harvest when the lower leaves have gone yellow and brown but the top few are still green. The easiest way is to tip the whole pot out and pick out the bulbs.',
        'Dry them for two to three weeks somewhere warm, airy and out of direct sun, with the leaves still on, until the skins are papery. Then [store them hung in nets or plaits](/guides/storing-veg-over-winter/).',
        'Want garlic sooner? Pull a couple of plants in April or May as green garlic. It is mild and juicy and you use the whole thing, like a spring onion.',
      ] },
      { h: 'Common problems', list: [
        '**Orange spots on the leaves** are [rust](/pests/rust/). It looks bad but bulbs usually still form. Pick off the worst leaves and don’t overcrowd.',
        '**Yellowing and rotting in winter** is usually waterlogging. Add more grit next time and raise the pot on feet.',
        '**Fluffy white mould on the base** is [onion white rot](/pests/onion-white-rot/). Bin the plants and the compost, not on the compost heap.',
        '**Small bulbs** usually mean too little food or water in spring, planting too late, or keeping the pot somewhere too warm over winter.',
      ] },
      { h: 'Cooking your crop', p: [
        'Try [garlic bread](/recipes/garlic-bread/), a batch of [garlic and herb butter](/recipes/garlic-herb-butter/) for the freezer, or [kale, garlic and chilli spaghetti](/recipes/kale-garlic-spaghetti/). If you grew elephant garlic, [roast it whole](/recipes/roast-elephant-garlic/) until it is soft and sweet.',
        'Short of space for other crops? See [what to grow on a balcony](/sizes/balcony/).',
      ] },
    ],
  },
];
