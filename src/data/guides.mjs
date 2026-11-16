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

  {
    slug: 'chitting-and-planting-seed-potatoes',
    title: 'How to chit and plant seed potatoes (UK)',
    h1: 'Chitting and planting seed potatoes',
    description: 'When to buy and chit seed potatoes in the UK, how to set them up in egg boxes, and when and how deep to plant first earlies, second earlies and maincrop.',
    image: 'potato',
    quick: 'Chit seed potatoes from late January by standing them in egg boxes, eyes up, somewhere cool, bright and frost-free for about six weeks. Plant first earlies from mid-March, second earlies in April and maincrop from mid-April to May, 10–15 cm deep.',
    lead: 'Seed potatoes arrive in the shops in January, well before it is time to plant. Chitting them on a windowsill in the meantime gives you a head start, and it is one of the first jobs of the growing year.',
    crops: ['potato'],
    sections: [
      { h: 'What chitting is, and do you need to?', p: [
        'Chitting just means letting seed potatoes grow short, sturdy shoots before you plant them. Chitted potatoes come up faster and are ready to dig a week or two earlier.',
        'It matters most for **first and second earlies**, where a few extra weeks can mean new potatoes before [blight](/pests/blight/) arrives in summer. Maincrop potatoes gain less, so if you are short of windowsill space, chit the earlies and plant the maincrop straight from the bag.',
      ] },
      { h: 'Buying seed potatoes', list: [
        '**Buy certified seed potatoes** from a garden centre, seed company or allotment shop. Supermarket potatoes can carry disease and are often treated to stop them sprouting.',
        '**Buy in January or February**, when the choice is best. Look for firm tubers about the size of a hen’s egg, with no soft or rotten patches.',
        '**How many?** A 2 kg bag usually holds 20–30 tubers. At 30–40 cm apart, that fills about 8–10 m of row, or seven to ten potato bags.',
      ] },
      { h: 'Which type to grow', table: {
        head: ['Type', 'Plant', 'Dig up', 'Try'],
        rows: [
          ['First earlies', 'Mid-March to April', 'June to July (10–12 weeks)', 'Rocket, Swift, Arran Pilot'],
          ['Second earlies', 'Late March to April', 'July to August (13–15 weeks)', 'Charlotte, Maris Peer, Kestrel'],
          ['Maincrop', 'Mid-April to May', 'September to October (18–20 weeks)', 'Maris Piper, King Edward, Sarpo Mira'],
        ],
      }, after: ['Earlies are the ones to grow in pots, bags or a small garden. Maincrop give the biggest crop and keep all winter, but they need more space and are in the ground during blight season, so a blight-resistant variety such as Sarpo Mira is worth a look. See the [potato growing guide](/plants/potato/) for more varieties.'] },
      { h: 'How to chit seed potatoes', steps: [
        'Take the potatoes out of their bag or net as soon as you get them home.',
        'Find the end with the most “eyes” (the small dimples where shoots grow). Stand each potato in an egg box or seed tray with that end facing up.',
        'Put them somewhere cool, bright and frost-free, at around 10°C: a windowsill in a cool room, a porch, or a greenhouse or shed with a window. Cover them with fleece or newspaper on frosty nights.',
        'Leave them for about six weeks. They are ready when the shoots are 1.5–2.5 cm long, stubby, and green or purple.',
      ], after: [
        'Long, pale, floppy shoots mean the potatoes are too warm or too dark. Move them somewhere cooler and lighter. The shoots snap easily, so handle the potatoes gently from now on.',
        'For bigger maincrop potatoes, rub off all but the three or four strongest shoots just before planting. Leave all the shoots on earlies for more, smaller new potatoes.',
      ] },
      { h: 'When to plant', p: [
        'Plant when the soil is no longer frozen or waterlogged and has started to warm up. A good test is to pick up a handful: if it crumbles rather than sticks together, it is ready.',
        'The dates above are for central England. In the north and Scotland, plant two to three weeks later. In a mild area, or with fleece to hand, you can plant earlies a little sooner. Enter your postcode on the [planting calendar](/calendar/) to see the dates for where you live.',
      ] },
      { h: 'Planting in the ground', steps: [
        'Choose a sunny spot that did not grow potatoes or tomatoes in the last three years. Dig in some compost or well-rotted manure if you can.',
        'Dig a trench, or separate holes, 10–15 cm deep.',
        'Set the potatoes in with the shoots pointing up. Space first earlies about 30 cm apart in rows 60 cm apart, and second earlies and maincrop about 40 cm apart in rows 75 cm apart.',
        'Cover them gently with soil, so you do not knock the shoots off, and rake it into a low ridge along the row.',
      ] },
      { h: 'Planting in bags and pots', p: [
        'Potatoes grow well in potato bags, large pots or even an old compost bag with holes in the bottom. Use a container that holds at least 30–40 litres.',
        'Put about 15 cm of compost in the bottom, set three seed potatoes on top, and cover them with another 10 cm of compost. As the shoots grow, keep adding compost until the bag is nearly full. Water often, as bags dry out quickly. First earlies are the best choice for containers.',
      ] },
      { h: 'After planting', list: [
        '**Watch out for frost.** Shoots usually come up after two to four weeks. If a frost is forecast, cover them with soil or fleece, as frost blackens the leaves and sets the plants back. See [frost damage](/pests/frost-damage/).',
        '**Earth up.** When the shoots are 20–25 cm tall, pull soil up around the stems so only the tops show. This stops the potatoes turning green and gives a bigger crop. Do it again every couple of weeks until the leaves meet across the row.',
        '**Water in dry weather**, especially once the plants flower, which is when the potatoes are swelling.',
      ] },
      { h: 'Common problems', list: [
        '**Brown patches on the leaves in summer** are usually [blight](/pests/blight/). Cut off all the leaves and stems and bin them straight away.',
        '**Holes in the potatoes** are often [slugs](/pests/slugs-snails/), especially on heavy soil and in wet years. Dig maincrops as soon as they are ready.',
        '**Green potatoes** have been in the light. Earth up more next time, and cut away any green parts before cooking.',
      ] },
      { h: 'Cooking your crop', p: [
        'New potatoes are at their best within a few hours of digging. Lift your maincrop in autumn and [store them in sacks for the winter](/guides/storing-veg-over-winter/). You can also plant a few in August for [Christmas new potatoes](/guides/christmas-dinner-from-the-veg-patch/).',
      ], recipes: ['minted-new-potatoes', 'new-potato-salad', 'rosemary-roast-potatoes'] },
    ],
  },

  {
    slug: 'planting-bare-root-fruit-trees-and-canes',
    title: 'Planting bare-root fruit trees and canes (UK)',
    h1: 'Planting bare-root fruit trees and canes this winter',
    description: 'How to plant bare-root apple, pear, plum and cherry trees, raspberry canes and fruit bushes in the UK between November and March, step by step.',
    image: 'apple',
    quick: 'Plant bare-root fruit trees, canes and bushes from November to March, whenever the soil is not frozen or waterlogged. Soak the roots for an hour or two, plant at the depth they grew in the nursery, stake trees, then water well and mulch.',
    lead: 'Winter is the time to plant fruit. Trees, canes and bushes are sold bare-root while they are dormant, and anything you plant now will have settled in and be ready to grow away in spring.',
    crops: ['apple', 'pear', 'plum', 'cherry', 'quince', 'raspberry', 'blackberry', 'loganberry', 'blackcurrant', 'redcurrant', 'whitecurrant', 'gooseberry', 'rhubarb'],
    sections: [
      { h: 'What bare-root means', p: [
        'Bare-root plants are grown in a nursery field, then dug up while they are dormant in winter and sent out with no pot and no soil on their roots. They are only on sale from about November to March.',
        'They cost much less than the same plant in a pot, there are far more varieties to choose from, and they often settle in better because their roots go straight into your soil. Order in autumn for the best choice.',
      ] },
      { h: 'What to plant, and how', table: {
        head: ['Fruit', 'Space apart', 'Plant at'],
        rows: [
          ['[Apples](/plants/apple/)', '1.2–5 m (by rootstock)', 'Graft 5 cm above soil'],
          ['[Pears](/plants/pear/)', '1.5–4 m', 'Graft 5 cm above soil'],
          ['[Plums](/plants/plum/)', '3–5 m', 'Graft 5 cm above soil'],
          ['[Cherries](/plants/cherry/)', '3–4 m (fans)', 'Graft 5 cm above soil'],
          ['[Quinces](/plants/quince/)', '4–5 m', 'Nursery depth'],
          ['[Raspberries](/plants/raspberry/)', '45–60 cm', 'Nursery depth'],
          ['[Blackberries](/plants/blackberry/)', '2–4 m', 'Nursery depth'],
          ['[Loganberries](/plants/loganberry/)', '2–3 m', 'Nursery depth'],
          ['[Blackcurrants](/plants/blackcurrant/)', '1.5 m', '5 cm deeper'],
          ['[Red and whitecurrants](/plants/redcurrant/)', '1.2–1.5 m', 'Nursery depth'],
          ['[Gooseberries](/plants/gooseberry/)', '1.5 m', 'Nursery depth'],
          ['[Rhubarb crowns](/plants/rhubarb/)', '75–90 cm', 'Buds at soil level'],
        ],
      }, after: [
        'The nursery depth is easy to spot: there is a dark line on the stem where the soil used to be. The graft union on a tree is the knobbly bump near the base where the variety was joined onto its roots. Keep it above the soil, or the tree may lose its dwarfing effect.',
        'Raspberry rows want to be 1.8 m apart, and cherry trees that are not trained as fans need 6 m or more. [Whitecurrants](/plants/whitecurrant/) are planted just like redcurrants. With rhubarb, mulch around the crown but leave the buds uncovered.',
      ] },
      { h: 'Choosing a fruit tree', list: [
        '**Pick the rootstock for your space.** The rootstock decides how big the tree grows. For apples, M27 is very dwarf and good for pots, M9 is dwarf, M26 is small and MM106 is medium. Pears on Quince C stay smaller than on Quince A, and cherries on Gisela 5 suit a large pot.',
        '**Check pollination.** Many apples, pears and cherries need a partner tree that flowers at the same time. If you only have room for one, choose a self-fertile variety, or check whether neighbours have trees nearby.',
        '**Try trained forms in small gardens.** Cordons, espaliers and fans grow flat against a fence or wall on wires, so you can fit several varieties into a small space.',
      ] },
      { h: 'When your plants arrive', p: [
        'Unpack them straight away and check the roots are still damp. Plant within a few days if you can, keeping them in a cool, frost-free shed or garage in the meantime, with the roots wrapped in damp sacking or newspaper.',
        'If the ground is frozen or waterlogged, **heel them in**: dig a shallow trench in a spare corner, lay the plants in it at an angle, cover the roots with soil and firm it down. They will be fine like that for several weeks until conditions improve.',
      ] },
      { h: 'How to plant a fruit tree', steps: [
        'Stand the roots in a bucket of water for an hour or two before planting.',
        'Clear a circle of about 1 m across of grass and weeds. Dig a hole wide enough to spread the roots out fully, but only as deep as the roots. Loosen the soil at the bottom and sides with a fork.',
        'Knock in a short stake on the side the wind usually comes from, before the tree goes in, so you do not damage the roots.',
        'Stand the tree next to the stake, spread the roots out and check the depth: lay a cane across the hole to see where the soil line will be. The graft union should end up about 5 cm above the soil.',
        'Fill the hole back in, gently shaking the tree now and then so soil settles between the roots. Firm it down with your heel.',
        'Fix the tree to the stake with a proper tree tie, not wire or string, which can cut into the bark.',
        'Water well, with at least a full watering can, then spread a 5–8 cm layer of compost or well-rotted manure over the soil, keeping it a few centimetres away from the trunk.',
      ] },
      { h: 'How to plant raspberries and other canes', steps: [
        'Put up the supports first: strong posts at each end of the row with horizontal wires between them. For raspberries, run wires at 60, 90, 120 and 150 cm. For blackberries and loganberries, run them at 1 m, 1.5 m and 1.8 m.',
        'Dig plenty of compost into the row. Raspberries hate sitting in wet soil, so on heavy clay plant them in a raised bed.',
        'Soak the roots, then plant the canes at the same depth as they were in the nursery, spreading the roots out sideways. Raspberry roots are shallow, so do not bury them deep.',
        'Cut each cane down to 20–30 cm above the soil. It feels harsh, but it makes the plant send up strong new canes from the base.',
        'Water in and mulch with compost.',
      ] },
      { h: 'How to plant fruit bushes', p: [
        'Plant [blackcurrants](/plants/blackcurrant/) about 5 cm deeper than they grew in the nursery, then cut every stem down to one bud above the soil. This makes lots of strong new shoots grow from below ground, which is where future crops come from. There will be no fruit in the first summer, but plenty from the second.',
        '[Redcurrants](/plants/redcurrant/), [whitecurrants](/plants/whitecurrant/) and [gooseberries](/plants/gooseberry/) are grown on a short stem, or “leg”, of 10–15 cm, which makes picking and weeding easier. Plant them at the same depth as in the nursery and cut each stem back by about half to an outward-facing bud.',
      ] },
      { h: 'The first year', list: [
        '**Water in dry spells for the first two summers.** This is the most important job, as young roots cannot reach far for water yet. A good soak once a week is better than a little every day.',
        '**Keep the circle around trees and the base of bushes and canes free of weeds and grass**, and top up the mulch each spring.',
        '**Check after frosts and gales** and firm the soil back down if plants have been lifted or rocked loose.',
        '**Check tree ties** each year and loosen them as the trunk thickens.',
        '**Pick off most of the fruitlets on young trees in the first summer**, so the tree puts its energy into roots and branches.',
      ] },
      { h: 'Common problems', list: [
        '**Plums and cherries** should never be pruned in winter, as cuts let in [silver leaf](/pests/silver-leaf/) and [bacterial canker](/pests/bacterial-canker/). Wait until spring or summer.',
        '**Waterlogged soil** causes [root rot](/pests/root-rot/). If water sits in the planting hole for days, plant on a low mound or in a raised bed instead.',
        '**Blossom killed by frost** is common in low spots where cold air collects. Avoid planting at the bottom of a slope. See [frost damage](/pests/frost-damage/).',
        '**Rabbits and deer** strip the bark of young trees. In the country, fit a tree guard around the trunk.',
      ] },
      { h: 'Cooking your crop', p: [
        'Your first proper crops will come in a year or two, from the second summer for canes and bushes and from two to four years for trees. Something to look forward to:',
      ], recipes: ['apple-blackberry-crumble', 'raspberry-loganberry-jam', 'blackcurrant-jam', 'gooseberry-fool', 'plum-jam'] },
    ],
  },

  {
    slug: 'how-to-force-rhubarb',
    title: 'How to force rhubarb (UK)',
    h1: 'How to force rhubarb',
    description: 'Get sweet, pink rhubarb weeks early by covering the crown in winter: when to start, what to cover it with, when to pick, and how to let the plant recover.',
    image: 'rhubarb',
    quick: 'In January or February, cover an established rhubarb crown, at least three years old, with a forcing jar, upturned bucket or dustbin so no light gets in. Pick the tender pink stalks in about 6–8 weeks, then uncover the plant and let it rest for two years before forcing it again.',
    lead: 'Forced rhubarb is one of the treats of late winter: pale pink, tender and sweeter than the summer stalks, and ready weeks before anything else in the garden. All it takes is a bucket.',
    crops: ['rhubarb'],
    sections: [
      { h: 'What forcing does', p: [
        'Rhubarb stores energy in its crown over winter. If you cover it to keep out all the light, it uses that store to push up long, pale stalks early, looking for light. They are thinner, more tender and less sour than normal stalks, and come up in March, or even February, instead of April.',
        'Forcing is a big drain on the plant, so the crown needs time to recover afterwards. In Yorkshire’s famous “Rhubarb Triangle”, growers force crowns in dark sheds and pick the stalks by candlelight.',
      ] },
      { h: 'Which plant to force', list: [
        '**A strong, healthy crown at least three years old.** Never force one you planted in the last couple of years.',
        '**Early varieties force best.** Timperley Early and Champagne are ideal, but most varieties, including Victoria, will work, just a little later.',
        '**Force a different crown each year.** With two or three plants you can take turns. If you only have one, force it every other year at most.',
      ] },
      { h: 'What you need', list: [
        '**Something tall and lightproof to cover the crown**, at least 45 cm high. A traditional terracotta forcing jar with a lid looks lovely, but an upturned bucket, an old dustbin or a large black plastic pot works just as well.',
        '**Something to block any holes**, such as a stone, a tile or a piece of tape over the drainage hole. Even a little light turns the stalks green.',
        '**Optional: straw or manure** to pack around the outside, which keeps the crown warmer and speeds things up.',
      ] },
      { h: 'How to force rhubarb', steps: [
        'Start in January or February, once the plant has had a few frosts. The crown needs a cold spell to wake up properly.',
        'Clear away old dead leaves and weeds from around the crown, as slugs like to hide in them.',
        'Spread a layer of compost or well-rotted manure around the crown, but not over the buds.',
        'Put your cover over the crown and block any holes so no light gets in. Weigh it down with a brick, or push it into the soil, so the wind cannot blow it over.',
        'For an even earlier crop, pack straw or manure around the outside of the cover to keep it warm.',
        'Leave it alone. Have a quick peek after three or four weeks to check for slugs, and put the cover straight back on.',
      ] },
      { h: 'Picking forced rhubarb', p: [
        'The stalks are usually ready 6–8 weeks after covering, when they are 20–30 cm long. Hold each one near the base and pull it with a gentle twist, rather than cutting it, so no stump is left to rot.',
        'Pick them over two or three weeks as they grow. Cut off the small yellow leaves before cooking and put them on the compost heap, as rhubarb leaves are not edible.',
      ] },
      { h: 'Afterwards: let it recover', list: [
        '**Take the cover off** once you have picked the forced stalks, usually by early April.',
        '**Do not pick that plant again this year.** Let its leaves grow and build the crown back up.',
        '**Feed it** with a thick mulch of compost or well-rotted manure, and water it in dry spells over summer.',
        '**Rest it for two years** before forcing it again, and pick it only lightly the year after forcing.',
      ] },
      { h: 'Forcing indoors', p: [
        'You can also force rhubarb in a shed or garage. In November, dig up a strong crown and leave it on top of the soil for a week or two so the frost gets to it. Then plant it in a large pot of compost, cover it so it is completely dark, and keep it somewhere cool but frost-free, at about 10°C. You will be picking in about five to six weeks.',
        'Forcing indoors uses up almost all the crown’s energy, so afterwards either throw it away or split it and plant the pieces back in the garden to build up again for a few years.',
      ] },
      { h: 'Common problems', list: [
        '**Thin, weak stalks** mean the crown is too young, has been forced too often, or needs feeding. Rest it and mulch it well.',
        '**Slugs** love the dark, damp space under the cover. Clear debris before covering, and check when you peek. See [slugs and snails](/pests/slugs-snails/).',
        '**A soft, rotting crown** is usually [crown rot](/pests/root-rot/) from waterlogged soil. Rhubarb needs good drainage, so do not force a plant in a soggy spot.',
      ] },
      { h: 'Cooking forced rhubarb', p: [
        'Forced stalks are so tender they need very little cooking and keep their pink colour. Roasting them whole is the best way to show them off.',
      ], recipes: ['roast-rhubarb', 'rhubarb-ginger-crumble', 'rhubarb-ginger-cordial', 'rhubarb-gin'] },
    ],
  },
];
