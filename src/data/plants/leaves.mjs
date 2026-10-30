/* Salad and leaf crops. See roots.mjs for the field guide. */
export const LEAVES = [
  { id: "lettuce", name: "Lettuce", latin: "Lactuca sativa", emoji: "🥬", sizes: ["balcony", "small", "medium", "large"], difficulty: "Easy",
    sun: ["full", "partial"], sunText: "Full sun in spring; partial shade in summer",
    facts: [["Type", "Hardy to half-hardy annual salad leaf"], ["Sow", "Mar–Aug outdoors; Feb and Sep–Oct under cover"], ["Height", "15–30 cm"], ["Spacing", "15–30 cm apart, depending on type"], ["Sowing depth", "5 mm"], ["Time to harvest", "6–12 weeks from sowing"], ["Good companions", "Carrots, radishes, onions, strawberries"]],
    info: [
      "Lettuce is the classic salad crop and one of the easiest to grow, giving fresh, tender leaves for months from a few packets of seed. There are many types: crisp cos and iceberg, soft butterheads, frilly and colourful loose-leaf varieties, and hardy winter types.",
      "Homegrown lettuce is crisper and sweeter than bagged leaves, and cut-and-come-again types give repeat pickings from a single sowing. Lettuce grows well in pots and window boxes as well as in beds, and tolerates light shade in the heat of summer."],
    varieties: ["Little Gem (small, sweet, reliable cos)", "Salad Bowl (loose-leaf, cut and come again)", "Lollo Rosso (red, frilly leaves)", "Winter Density (hardy cos for autumn sowing)", "Tom Thumb (tiny butterhead for pots)"],
    sow: { p: [
      "Sow thinly outdoors from March, 5 mm deep, in rows 15–30 cm apart, and thin to the final spacing as seedlings grow. Make a new sowing every two weeks until August to avoid gluts. In hot weather, lettuce seed can fail to germinate above about 25°C, so sow in the cool of the evening and water the drill beforehand.",
      "For early crops, sow in trays or modules indoors from February and plant out under cloches in March. In autumn, sow hardy winter varieties in September and October under cloches or in a cold frame. For baby leaves, sow thickly and cut when 5–10 cm tall."],
      tips: ["Sow a short row every two weeks.", "Sow in the evening in summer to avoid heat blocking germination.", "Choose heat-tolerant, bolt-resistant varieties for midsummer.", "Use modules for early and winter sowings."] },
    grow: { p: [
      "Lettuce needs even moisture: water regularly, especially in dry spells, because stressed plants turn bitter and bolt (run to seed). In midsummer, give plants some afternoon shade, for example beside taller crops. Mulch to hold moisture and keep roots cool.",
      "Slugs and snails are the main enemies, so use traps, wool pellets or night-time patrols and keep the bed free of hiding places. Aphids, lettuce root aphid and grey mould can also appear. Remove damaged outer leaves, space plants generously for air flow and rotate the crop."],
      tips: ["Water consistently to keep leaves sweet and crisp.", "Give afternoon shade in hot weather.", "Set slug traps around young plants.", "Thin to the right spacing early."] },
    pests: ["Slugs and snails", "Aphids", "Lettuce root aphid", "Bolting in hot weather", "Grey mould"],
    harvest: { p: [
      "Pick loose-leaf lettuces by taking the outer leaves from around the plant, leaving the centre to grow on and produce more. Hearting types such as cos and butterhead are ready when the heart feels firm; cut them at the base with a sharp knife, leaving the stump, which will often resprout.",
      "Harvest in the morning when the leaves are full of water and the plants are crisp. Cut the whole row of overgrown plants before they start to bolt, because once a flower stem forms the leaves become bitter. Baby leaves are ready within three to four weeks."],
      tips: ["Harvest in the morning for the crispest leaves.", "Take outer leaves first from loose-leaf types.", "Cut before the plants bolt.", "Leave the stump; it often regrows."] },
    use: { p: [
      "Use lettuce in salads, sandwiches and wraps, or lightly cook outer leaves in soups and with peas, as the French do. Little Gem is excellent halved and grilled. Mix a variety of leaf types together for colour and flavour, and dress just before serving so the leaves stay crisp.",
      "Wash, spin dry and keep in the fridge in a bag lined with kitchen paper, where they stay fresh for three to five days. Cut-and-come-again lettuce stays best in the garden, picked as required. Lettuce does not freeze or dry successfully, so sow little and often."],
      tips: ["Dress at the last minute to keep leaves crisp.", "Store in a bag lined with kitchen paper.", "Dry thoroughly after washing.", "Try grilled halved Little Gem hearts."] } },

  { id: "spinach", name: "Spinach", latin: "Spinacia oleracea", emoji: "🍀", sizes: ["balcony", "small", "medium", "large"], difficulty: "Easy",
    sun: ["partial", "full", "shade"], sunText: "Partial shade; full sun in cool weather",
    facts: [["Type", "Hardy annual leaf vegetable"], ["Sow", "Mar–Apr and Aug–Sep, straight into the soil"], ["Height", "20–30 cm"], ["Spacing", "Thin to 10–15 cm apart in rows 30 cm apart"], ["Sowing depth", "2–3 cm"], ["Time to harvest", "6–10 weeks from sowing"], ["Good companions", "Strawberries, peas, beans, brassicas"]],
    info: [
      "Spinach is a cool-season leaf crop that gives tender, sweet leaves in spring and autumn, often a month before the summer salad crops arrive. It is quick to grow, tolerates part shade and is happy in containers.",
      "The main challenge is bolting, which spinach does readily in heat, drought or long days. Sow at the right time, keep the soil moist, and choose slow-bolting varieties, and you will get a heavy crop. In summer, grow perpetual spinach or chard instead."],
    varieties: ["Medania (slow to bolt)", "Amazon (heavy cropper, good flavour)", "Giant Winter (very hardy, for autumn sowing)", "Reflect (F1, good mildew tolerance)", "Bloomsdale (crinkled leaves)"],
    sow: { p: [
      "Sow outdoors in rows 30 cm apart from March to April for spring crops, and from August to September for autumn and winter crops. Sow seeds 2–3 cm deep, thinly, and thin to 10–15 cm for full-size plants, or leave them close and cut as baby leaf. Soaking seed overnight can help germination.",
      "Spinach prefers cool, moist, fertile, slightly alkaline soil, so add lime if yours is very acid, and dig in compost to hold moisture. In summer, sow in partial shade or choose bolt-resistant varieties. Autumn crops can be protected with cloches in cold areas."],
      tips: ["Sow in spring and autumn, not midsummer.", "Choose slow-bolting varieties.", "Sow little and often, every two to three weeks.", "Lime acid soil before sowing."] },
    grow: { p: [
      "Water regularly, as dry soil triggers bolting, and mulch to keep the roots cool and moist. Feed with a nitrogen-rich fertiliser if the leaves turn pale. Keep weeds down, hoeing carefully, as spinach roots are shallow.",
      "Downy mildew, leaf miner, slugs and aphids are the main problems. Remove affected leaves and avoid overcrowding to improve air flow. A pinch of fleece in spring protects against cold snaps and flea beetle, and also helps against leaf miner."],
      tips: ["Water to prevent bolting.", "Pinch off leaves affected by leaf miner.", "Do not crowd plants.", "Cover autumn crops with a cloche."] },
    pests: ["Downy mildew", "Leaf miner", "Slugs", "Bolting in heat or drought"],
    harvest: { p: [
      "Begin picking baby leaves from about four weeks, taking a few from each plant and leaving the centre to produce more. Full leaves are ready at about 8–10 cm long, from six to eight weeks. Pick from the outside of the plant, working inwards. Pick in the morning for the best flavour.",
      "If plants start to bolt, harvest the whole lot right away, because the leaves turn bitter. Winter sowings can be picked sparingly through winter and give a big flush in early spring. Pull out the plants after harvesting and replace with a different crop."],
      tips: ["Pick little and often from the outside.", "Harvest the whole plant if it starts to bolt.", "Pick in the morning.", "Leave a few leaves on each plant to keep it growing."] },
    use: { p: [
      "Eat baby leaves raw in salads and sandwiches, or wilt larger leaves in a pan with garlic and a squeeze of lemon in a couple of minutes. Spinach goes well in curries, pies, quiches, soups, pasta and omelettes. Cook it briefly to keep its colour and flavour; a large bowlful shrinks to a few spoonfuls.",
      "Fresh leaves keep for three to five days in the fridge in a bag, so eat them soon after picking. To freeze, wash, blanch for one minute, cool quickly, squeeze out the water and freeze in portions. Spinach also makes a good soup that freezes well."],
      tips: ["Squeeze out excess water after cooking.", "Blanch for one minute before freezing.", "Add to curries and soups at the last minute.", "Remove thick stalks from large leaves."] } },

  { id: "rocket", name: "Rocket", latin: "Eruca vesicaria subsp. sativa", emoji: "🥗", sizes: ["balcony", "small", "medium"], difficulty: "Easy",
    sun: ["full", "partial"], sunText: "Full sun to partial shade",
    facts: [["Type", "Hardy annual salad leaf (wild rocket is perennial)"], ["Sow", "Mar–Sep, straight into the soil"], ["Height", "20–40 cm"], ["Spacing", "Thin to 10–15 cm apart, or sow thickly for baby leaf"], ["Sowing depth", "1 cm"], ["Time to harvest", "4–6 weeks from sowing"], ["Good companions", "Lettuce, carrots, beetroot"]],
    info: [
      "Rocket is a quick, peppery salad leaf that is ready in about four weeks and is easy to grow in pots, window boxes and any gap in the vegetable bed. Fresh homegrown leaves have a nuttier, stronger flavour than bagged supermarket rocket.",
      "There are two main types: salad rocket, an annual with broader leaves and mild flavour, and wild rocket (also called sylvetta), a perennial with narrow, deeply cut, hotter leaves. Both are productive and will self-seed freely if allowed to flower."],
    varieties: ["Astra (broad, tender salad rocket)", "Wild Rocket (perennial, hotter flavour)", "Dragon’s Tongue (red-veined leaves)", "Apollo (reliable and slow-bolting)"],
    sow: { p: [
      "Sow thinly outdoors from March to September, 1 cm deep, in rows 15 cm apart, or scatter seeds across a pot or tub. Seedlings come up in a few days. Sow a short row every two to three weeks for a constant supply, as plants soon bolt in warm weather.",
      "For summer crops, sow in light shade and keep the soil moist, as hot and dry conditions lead to hot, peppery leaves and early flowering. Autumn sowings in September, under a cloche or in a cold frame, give leaves right into winter."],
      tips: ["Sow a short row every two to three weeks.", "Choose partial shade in midsummer.", "Cover with fine mesh from sowing against flea beetle.", "Scatter-sow into a pot for the windowsill."] },
    grow: { p: [
      "Rocket needs little care, but regular watering is important, as drought makes the leaves bitter and fiery and causes bolting. Keep it weeded and thin plants to 10–15 cm for larger leaves, or leave them close for baby leaf.",
      "Flea beetle is the main pest, leaving numerous small holes in the leaves. Fine mesh from sowing, plus consistent watering, protects the crop. Slugs can eat young seedlings. Rotate rocket with other brassicas, as it is in the same family."],
      tips: ["Water regularly to avoid fiery, bitter leaves.", "Use fine mesh to keep out flea beetle.", "Sow in partial shade during summer.", "Rotate with other brassicas."] },
    pests: ["Flea beetle", "Slugs", "Aphids", "Bolting in hot weather"],
    harvest: { p: [
      "Start picking when the leaves are 5–10 cm long, from four weeks after sowing, using scissors to cut leaves about 2.5 cm above the base. Leave the centre to regrow, and you can cut again two or three times. Young leaves are the mildest, and older ones become hotter.",
      "Pick regularly to delay flowering. Once rocket bolts, the cream flowers are edible and peppery in salads, and wild rocket will go on flowering for weeks. Allow one or two plants to set seed, and they will self-sow around the garden."],
      tips: ["Cut with scissors and allow to regrow.", "Pick young leaves for a milder taste.", "Eat the flowers too.", "Let a plant seed for next year."] },
    use: { p: [
      "Toss rocket into salads, scatter on pizza and pasta just before serving, blend into pesto, or wilt into omelettes and soups. Its pepperiness pairs well with sweet fruit such as pear, with parmesan, with lemon and with olive oil. Add it at the last minute, because heat quickly wilts the leaves.",
      "Rocket is best eaten fresh, as it wilts quickly. Keep leaves in a bag lined with kitchen paper in the fridge for up to four days. It does not dry or freeze well, though you can blend it into pesto and freeze that in small pots."],
      tips: ["Add to hot dishes at the last moment.", "Blend into pesto and freeze in small pots.", "Pair with pear and parmesan.", "Do not wash until needed."] } },

  { id: "swiss-chard", name: "Swiss chard", latin: "Beta vulgaris subsp. cicla var. flavescens", emoji: "🌈", sizes: ["balcony", "small", "medium", "large"], difficulty: "Easy",
    sun: ["full", "partial"], sunText: "Full sun to partial shade",
    facts: [["Type", "Hardy biennial leaf vegetable, grown as an annual"], ["Sow", "Apr–Jun outdoors; Mar–Apr in modules"], ["Height", "40–60 cm"], ["Spacing", "Thin to 30–45 cm apart in rows 45 cm apart"], ["Sowing depth", "2–3 cm"], ["Time to harvest", "8–12 weeks, then for months"], ["Good companions", "Onions, beans, brassicas"]],
    info: [
      "Swiss chard is one of the most useful and decorative leaf vegetables, with large glossy leaves and bright coloured stems in red, yellow, orange, pink and white. It is hardy, productive and easy, and a few plants give leaves for months.",
      "Chard is more tolerant of heat and cold than spinach, with less tendency to bolt, so it can be cropped from early summer right into the following spring in mild areas. It suits borders and containers as well as the vegetable bed."],
    varieties: ["Bright Lights (multicoloured stems)", "Fordhook Giant (white stems, large and reliable)", "Rhubarb Chard (deep red stems)", "Lucullus (pale green, heavy cropper)", "Yellow Chard (golden stems)"],
    sow: { p: [
      "Sow in April to June, 2–3 cm deep, directly into well-prepared, fertile soil in sun or light shade, in rows 45 cm apart. Chard seed is a cluster of several seeds, so each sowing produces several seedlings; thin to the strongest at 30–45 cm apart. You can also start seeds in modules in March and April under cover.",
      "Sow a second batch in July to August for autumn and winter picking, which will crop through the cold months with a cloche or fleece for protection. Soaking the seed overnight speeds germination. Chard also grows happily in large pots at least 30 cm deep."],
      tips: ["Thin each cluster to the strongest seedling.", "Soak seed overnight before sowing.", "Sow again in July for winter leaf.", "Use pots at least 30 cm deep on a balcony."] },
    grow: { p: [
      "Keep plants watered during dry spells, and mulch to conserve moisture and suppress weeds. Feed with a general fertiliser once or twice in summer to keep the plants producing. Cut off any flower stems that appear to extend cropping.",
      "Chard is rarely troubled, but leaf miners can tunnel in the leaves, slugs eat young plants and birds may peck seedlings. Pinch off affected leaves and use traps or nets as needed. In cold winters, cover plants with a cloche or fleece to keep the leaves usable."],
      tips: ["Pinch off leaves with leaf-miner tracks.", "Mulch to keep the soil moist.", "Cover in hard frost.", "Cut flower stems to keep cropping."] },
    pests: ["Leaf miner", "Slugs", "Birds on seedlings", "Downy mildew"],
    harvest: { p: [
      "Pick baby leaves from about six weeks, and full-size leaves from eight to twelve weeks. Cut or twist off the outer leaves about 3 cm above the base, leaving the centre to grow more. Take only a few leaves from each plant at a time, so it can keep growing.",
      "Plants keep producing for many months, and overwintered plants give a second flush of leaves in spring before they flower. Pull out the plants once they run to seed and the leaves turn tough. Frost can scorch leaves, but healthy plants will recover."],
      tips: ["Pick the outer leaves first.", "Take no more than a third of a plant at once.", "Harvest stems and leaves together.", "Pull plants out once they bolt."] },
    use: { p: [
      "Chard is two vegetables in one: the leaves can be cooked like spinach, and the thick colourful stems like asparagus. Strip the stems from the leaves, then cook the stems for about five minutes and the leaves for one or two. Use them in gratins, quiches, pasta, soups and stir-fries.",
      "Unwashed leaves keep for three to four days in the fridge in a bag. For freezing, separate leaves and stalks, blanch for two minutes (leaves) or three minutes (stalks), cool and pack in portions. Raw baby leaves are good in salads."],
      tips: ["Cook stems and leaves separately.", "Use baby leaves raw in salads.", "Blanch before freezing.", "Add garlic and lemon to sautéed chard."] } },

  { id: "perpetual-spinach", name: "Perpetual spinach", latin: "Beta vulgaris subsp. cicla", emoji: "🍃", sizes: ["balcony", "small", "medium", "large"], difficulty: "Easy",
    sun: ["full", "partial", "shade"], sunText: "Full sun to shade; tolerates poorer light",
    facts: [["Type", "Hardy biennial leaf vegetable, grown as an annual"], ["Sow", "Mar–Aug, straight into the soil"], ["Height", "30–45 cm"], ["Spacing", "Thin to 20–30 cm apart in rows 30–45 cm apart"], ["Sowing depth", "2–3 cm"], ["Time to harvest", "8–12 weeks, then for up to 18 months"], ["Good companions", "Onions, beans, brassicas"]],
    info: [
      "Perpetual spinach, also called spinach beet or leaf beet, is a reliable, hard-working relative of chard that gives you spinach-style leaves almost all year. Unlike true spinach, it resists bolting in summer and tolerates cold, shade and poor soil.",
      "It is a good choice for beginners and for those who find spinach difficult: one sowing in spring can crop for up to eighteen months. The leaves are slightly coarser than true spinach but cook just as well and have a mild, earthy flavour."],
    varieties: ["Perpetual Spinach (the standard spinach beet)", "Erbette (tender, Italian type)", "Verde da Taglio (Italian cutting chard)", "Green Pearl (reliable leaf beet)"],
    sow: { p: [
      "Sow in March to July in shallow drills 2–3 cm deep, 30–45 cm apart, in ordinary garden soil in sun or partial shade. The seeds are corky clusters, so thin seedlings to the strongest when 5 cm tall, finishing at 20–30 cm apart. A second sowing in August gives winter leaves.",
      "You can also sow into modules in March and April and plant out, which is useful if slugs are a problem. Perpetual spinach does well in large containers of at least 20 cm depth, and can be picked as baby leaf from only four to five weeks."],
      tips: ["Thin to the strongest seedling per cluster.", "Sow in August for winter leaves.", "Choose partial shade in hot spots.", "A 20 cm pot is enough for baby leaf."] },
    grow: { p: [
      "This is a low-effort crop. Water in dry weather to keep the leaves tender, and mulch to retain moisture and suppress weeds. Feed with a general fertiliser a couple of times in summer. Cut off flower stems in the second year to keep the plants cropping.",
      "Slugs, leaf miner and birds are the main problems. Pinch off damaged leaves and use nets or fleece when seedlings are young. In cold regions, cover winter plants with a cloche. Replace plants after 12–18 months, when they tend to run to seed."],
      tips: ["Mulch to cut watering and weeding.", "Remove flower stems to extend picking.", "Protect winter plants with a cloche.", "Resow every year or so."] },
    pests: ["Slugs", "Leaf miner", "Birds on seedlings", "Downy mildew"],
    harvest: { p: [
      "Pick leaves when they are 10–15 cm long, a few from each plant at a time, working from the outside in. Regular cutting encourages new growth. Young leaves are the tenderest and can be eaten raw in salads, whereas older ones should be cooked.",
      "Plants will often crop right through winter in sheltered gardens and send up flower stems in the second spring. Remove these to extend the harvest, and clear the old plants in summer once they become tough and bitter, replacing them with a new sowing."],
      tips: ["Pick regularly from the outside in.", "Use young leaves raw.", "Remove flower stems promptly.", "Replace old plants after 18 months."] },
    use: { p: [
      "Cook perpetual spinach like true spinach: wilt it in a pan with garlic, stir it into curries, soups, pasta and bakes, or use it in pies and omelettes. The leaves are sturdier than spinach, so allow a couple of extra minutes. The midribs are edible when young, or can be chopped finely.",
      "Fresh leaves keep for three to four days in a bag in the fridge, but it is easier to leave them growing and pick as needed. To freeze, wash, blanch for two minutes, squeeze out the water and freeze in portions."],
      tips: ["Wilt with garlic and a squeeze of lemon.", "Cook slightly longer than true spinach.", "Squeeze water out before freezing.", "Use young leaves raw."] } },

  { id: "lambs-lettuce", name: "Lamb’s lettuce", latin: "Valerianella locusta", emoji: "🥗", sizes: ["balcony", "small", "medium", "large"], difficulty: "Easy",
    sun: ["full", "partial", "shade"], sunText: "Full sun to partial shade",
    facts: [["Type", "Hardy annual winter salad"], ["Sow", "Aug–Oct (also Mar–Apr)"], ["Height", "10–15 cm"], ["Spacing", "Thin to 10 cm, or sow thickly for baby leaf"], ["Sowing depth", "1 cm"], ["Time to harvest", "8–12 weeks, in winter longer"], ["Good companions", "Winter lettuce, onions, garlic"]],
    info: [
      "Lamb’s lettuce, also called corn salad or mâche, is a very hardy, low-growing salad plant that provides mild, nutty rosettes of leaves right through the winter, when there is little fresh salad around. It is one of the best crops for a cold frame, pot or sheltered border.",
      "The compact, spoon-shaped leaves are tender and delicious, and plants will stand frost, snow and shade. Sow it in late summer and autumn, and you will have pickings from October until spring, when it flowers and goes to seed."],
    varieties: ["Verte de Cambrai (traditional, small leaves)", "Vit (larger leaves, mild flavour)", "Jade (reliable, upright)", "Large Leaved Italian (productive)"],
    sow: { p: [
      "Sow from August to October, scattering seed thinly or in rows 10–15 cm apart, 1 cm deep, into fine, firm, moisture-retentive soil. Seed can be slow to germinate in warm soil above 20°C, so sow in a shaded spot in late summer and keep it watered. Seedlings usually appear in 10–14 days.",
      "In cold regions, sow in pots or trays and keep in a cold frame, unheated greenhouse or under a cloche for an easy winter crop. You can sow again in March and April for a spring crop, although it bolts faster in warmth. Thin seedlings to 10 cm for larger rosettes."],
      tips: ["Sow in late summer in the shade, as heat stops germination.", "Firm the soil before sowing.", "Scatter-sow into a pot for winter leaves.", "Cover with a cloche in the coldest areas."] },
    grow: { p: [
      "Lamb’s lettuce needs very little care. Keep the soil moist while seeds germinate and keep weeds out, as the plants are small and easily overcome. Water occasionally in dry spells. No feeding is needed in reasonably fertile soil.",
      "Slugs can damage seedlings, so check regularly on damp nights. In very wet winters, grey mould (botrytis) can affect plants, so remove any yellowing leaves and keep the foliage dry in a covered position. Established plants survive snow and hard frost."],
      tips: ["Weed carefully, as plants are small.", "Remove yellowing leaves.", "Water during dry autumn spells.", "Check for slugs after rain."] },
    pests: ["Slugs", "Grey mould", "Aphids", "Bolting in spring warmth"],
    harvest: { p: [
      "Pick whole rosettes when they are 5–8 cm across, from October onward, by cutting just above the root with scissors. You can also pick individual outer leaves, leaving the plant to continue. Harvest regularly, as plants flower from March.",
      "Plants grow slowly in winter, so harvest a few at a time from each row rather than clearing one patch. Spring sowings are ready in about eight weeks. The small pale blue flowers are edible, and plants will self-seed if you let one or two flower."],
      tips: ["Cut whole rosettes just above the root.", "Take a few from each row.", "Pick often in spring before bolting.", "Let a few flower to self-seed."] },
    use: { p: [
      "Lamb’s lettuce is best raw, with its soft texture and mild, nutty flavour, in salads with beetroot, walnuts, goat’s cheese or oranges. Serve with a simple vinaigrette, and add at the last moment, as the leaves are delicate. It can also be lightly wilted into soups or used as a bed for fish.",
      "The leaves keep for two to three days in the fridge in a bag lined with kitchen paper. For longer storage, the plants themselves are the best store, as they stay fresh in the ground all winter. It does not freeze well."],
      tips: ["Pair with beetroot, walnuts and goat’s cheese.", "Dress lightly at the last moment.", "Rinse gently, as the leaves bruise.", "Leave plants in the ground until needed."] } },

  { id: "winter-purslane", name: "Winter purslane", latin: "Claytonia perfoliata", emoji: "🍃", sizes: ["balcony", "small", "medium", "large"], difficulty: "Easy",
    sun: ["partial", "shade", "full"], sunText: "Partial shade to shade; tolerates sun",
    facts: [["Type", "Hardy annual winter salad (also called miner’s lettuce)"], ["Sow", "Aug–Oct (also Feb–Apr)"], ["Height", "10–25 cm"], ["Spacing", "Thin to 10 cm, or sow thickly"], ["Sowing depth", "5 mm"], ["Time to harvest", "6–10 weeks, in winter longer"], ["Good companions", "Winter lettuce, onions, garlic"]],
    info: [
      "Winter purslane, also known as claytonia or miner’s lettuce, is one of the toughest and most useful winter salad plants. The distinctive round, succulent leaves have a mild, fresh, slightly earthy flavour, and the plants thrive in cold, damp, shady conditions where little else will grow.",
      "It is a native of North America, naturalised in some parts of the UK, and it grows happily in pots, cold frames and shady borders. It self-seeds readily, so a single sowing may give you winter salad for years."],
    varieties: ["Claytonia perfoliata (the usual seed packet type)", "Miner’s lettuce (another name for the same plant)", "Claytonia sibirica (pink purslane, a pink-flowered relative)"],
    sow: { p: [
      "Sow from August to October for winter picking, and again from February to April for spring. Scatter seed thinly on the surface of moist, fine soil, or sow in rows 10–15 cm apart, 5 mm deep, and cover very lightly. Germination can be slow in hot weather, so sow in a shaded spot and keep moist.",
      "In pots or trays, use any multipurpose compost and keep in a cold frame, greenhouse or on a bright windowsill. Plants will grow in nearly any soil and are one of the best crops for a shady corner or the dry soil beneath a wall."],
      tips: ["Sow in a shady spot to help germination.", "Scatter-sow into pots for winter leaves.", "Barely cover the seed.", "Resow in February for spring salads."] },
    grow: { p: [
      "Winter purslane is almost carefree. Keep young plants watered until established, and weed carefully by hand. Plants grow slowly through winter, then race away in spring as the days lengthen and the temperature rises, producing small white flowers from March.",
      "Pests rarely trouble it, though slugs may graze the tender leaves and aphids can appear under cover. Plants are hardy to about -10°C or lower. In very cold weather, a layer of fleece keeps the leaves cleaner. Remove flower stems for further leaf production."],
      tips: ["Water seedlings through dry autumn spells.", "Protect leaves with fleece in heavy frost.", "Remove flower shoots to extend picking.", "Let some self-seed for next year."] },
    pests: ["Slugs", "Aphids under cover", "Grey mould in damp conditions"],
    harvest: { p: [
      "Start picking baby leaves when they are about 5–8 cm tall, six to eight weeks from sowing, by snipping off leaves and stems with scissors about 2.5 cm above the base. The plants will regrow and can be cut several times. Harvest regularly through winter and spring.",
      "In spring, the flowering stems and flowers are also edible. When plants go to seed in April or May, shake the seed heads over the bed to scatter next year’s crop, then clear the spent plants and replace them with summer crops."],
      tips: ["Cut with scissors and allow to regrow.", "Eat the flowers and flower stems.", "Cut little and often.", "Shake seed heads over the bed to resow."] },
    use: { p: [
      "Eat winter purslane raw in salads, where the juicy, crisp texture and mild flavour is refreshing in winter. The leaves, stems and flowers can all be eaten, and the plant makes an attractive garnish. You can also wilt it lightly, add it to sandwiches or use it like spinach in soups.",
      "Use it as soon as possible after harvesting. Leaves keep for two to three days in the fridge in a bag, but they are best picked fresh from the garden. Winter purslane does not freeze or dry well, but a pot on the kitchen windowsill gives you a continuous supply."],
      tips: ["Use in salads with citrus and a light dressing.", "Add whole stems to sandwiches.", "Pick just before eating.", "Use like spinach in a quick stir-fry."] } },

  { id: "land-cress", name: "Land cress", latin: "Barbarea verna", emoji: "🌿", sizes: ["balcony", "small", "medium", "large"], difficulty: "Easy",
    sun: ["partial", "shade", "full"], sunText: "Partial shade; tolerates sun and shade",
    facts: [["Type", "Hardy biennial peppery salad leaf, grown as an annual"], ["Sow", "Mar–Apr and Aug–Sep"], ["Height", "20–30 cm"], ["Spacing", "Thin to 10–15 cm apart in rows 20 cm apart"], ["Sowing depth", "1 cm"], ["Time to harvest", "8–10 weeks from sowing"], ["Good companions", "Lettuce, carrots, onions"]],
    info: [
      "Land cress, also called American cress or Belle Isle cress, tastes just like watercress but grows in ordinary garden soil, with no need for running water. The dark, glossy leaves are peppery and rich in vitamins, and the plant is tough enough to stand hard winters.",
      "It is a useful crop for autumn and winter, when it provides fresh leaves in cold weather, and for spring, when it is very early to grow. It tolerates partial shade and thrives in cool, moist conditions, so is ideal for a damp, sheltered corner of the garden."],
    varieties: ["American land cress (the standard type)", "Winter cress (another common name for the same plant)", "Belle Isle cress (traditional name)"],
    sow: { p: [
      "Sow from March to April for early summer crops, and from August to September for the best autumn and winter pickings. Sow thinly 1 cm deep in rows 20 cm apart, in moist, fertile soil in partial shade. Seedlings appear in about a week and should be thinned to 10–15 cm apart.",
      "Cress dislikes heat and drought, so sow in cool conditions and keep the soil moist. Late summer sowings under cloches or in a cold frame provide leaves all winter. Land cress also grows well in pots and containers on a shady patio."],
      tips: ["Sow in cool, moist conditions.", "Choose a partly shaded spot in summer.", "Sow in August for a winter crop.", "Grow in a container of moist compost."] },
    grow: { p: [
      "Keep land cress watered, because dry spells make the leaves bitter and cause bolting. Mulch to keep the soil cool and moist, and keep weeds down. No feeding is needed in fertile soil. Plants form a leafy rosette in the first year and flower in the second.",
      "Flea beetle can damage the leaves in spring, so cover with fine mesh. Slugs are a nuisance in damp weather, and caterpillars sometimes appear. As a brassica, land cress should be rotated with other members of the cabbage family."],
      tips: ["Water regularly to stop bitter, woody leaves.", "Cover with fine mesh in spring.", "Check for slugs on damp nights.", "Rotate with other brassicas."] },
    pests: ["Flea beetle", "Slugs", "Caterpillars", "Bolting in warm, dry weather"],
    harvest: { p: [
      "Pick the outer leaves when they are 5–8 cm long, usually from eight weeks after sowing, leaving the centre to grow more. Plants can be cut hard back to 2.5 cm above the base and will regrow. Picking regularly keeps the leaves tender and delays flowering.",
      "In spring, the plants send up flower stalks with yellow flowers, which are edible and attractive to bees. Cut these off to prolong leaf production, or leave one or two to set seed for next year. Dig up the plants after flowering and resow."],
      tips: ["Cut outer leaves first.", "Pick young leaves for the mildest flavour.", "Remove flower stalks to extend cropping.", "Eat the yellow flowers in salads."] },
    use: { p: [
      "Use land cress raw in salads, sandwiches and as a garnish, where the peppery bite livens up bland flavours. It is delicious in egg sandwiches, with smoked fish and in potato salad. It can also be made into soup, in the style of watercress soup, or lightly wilted into hot dishes.",
      "Fresh leaves keep for up to three days in the fridge in a bag, wrapped in damp kitchen paper. It does not freeze or dry well, but soup made from it freezes nicely. Plants in the garden are the best form of storage, as they stay fresh until you need them."],
      tips: ["Make a peppery soup with potato and stock.", "Pair with smoked salmon or egg.", "Use as a garnish for flavour and colour.", "Pick just before serving."] } },

  { id: "radicchio", name: "Radicchio", latin: "Cichorium intybus", emoji: "🟣", sizes: ["small", "medium", "large"], difficulty: "Medium",
    sun: ["full", "partial"], sunText: "Full sun to light shade",
    facts: [["Type", "Hardy perennial chicory, grown as an annual"], ["Sow", "Jun–Jul for autumn and winter heads"], ["Height", "20–30 cm"], ["Spacing", "Thin to 25–30 cm apart in rows 30–40 cm apart"], ["Sowing depth", "1 cm"], ["Time to harvest", "12–16 weeks from sowing"], ["Good companions", "Lettuce, onions, fennel"]],
    info: [
      "Radicchio is a red-leaved Italian chicory with a bold, pleasantly bitter flavour and a striking colour. It is hardier than lettuce, so provides fresh salads in autumn and winter, and it is less demanding to grow than many people assume.",
      "There are round-headed types such as Palla Rossa, and elongated ones such as Treviso. The red colour develops as the weather cools, and the bitterness mellows after cold or when the plants are blanched. They are a good crop for medium or large plots."],
    varieties: ["Palla Rossa (round, red heads)", "Rossa di Treviso (elongated, tapered heads)", "Rossa di Verona (reliable red heads)", "Castelfranco (variegated, creamy-green and red leaves)"],
    sow: { p: [
      "Sow in June and July for a crop in autumn and early winter. Sowing too early causes the plants to bolt rather than head up. Sow thinly in a seedbed or in modules, 1 cm deep, and thin or transplant to 25–30 cm apart when the seedlings are 10 cm tall.",
      "Choose a sunny site with fertile, well-drained soil. In very dry conditions, water the drill before sowing. Pests rarely trouble the young plants but slugs may nibble, so protect with traps. Plants establish well, and the roots develop deeply, making them reasonably drought-tolerant."],
      tips: ["Sow in June–July; earlier sowings bolt.", "Thin to 25–30 cm.", "Keep the soil moist during germination.", "Choose a sunny site."] },
    grow: { p: [
      "Water regularly through the summer, keeping the soil moist but not waterlogged. Hoe between plants to control weeds. Cut off the foliage 2.5 cm above the ground in late summer or autumn to encourage a tight head of leaves to form; this also makes the plant produce a neat, red, round head of leaves.",
      "Slugs and snails are the main problem, along with aphids. Fleece or a cloche in late autumn protects the heads from frost damage and wet. Radicchio is hardy but heads can suffer in very hard winters; harvest before prolonged freezing."],
      tips: ["Cut the foliage back in late summer to promote tight heads.", "Water in dry periods.", "Protect heads with fleece in frost.", "Use slug traps."] },
    pests: ["Slugs and snails", "Aphids", "Bolting from early sowing", "Frost damage to heads"],
    harvest: { p: [
      "Cut heads when they feel firm and are about the size of a grapefruit, from October to December. Cut just above ground level with a sharp knife, leaving the root in the soil; many plants will re-grow loose heads in spring. Harvest before hard frosts to protect the heads.",
      "To tame the bitterness, you can lift whole plants in November, trim the leaves to 3 cm and pack the roots in boxes of damp compost in a dark, cool place. The pale, tender new leaves (chicons) grow in three to four weeks and are sweet and delicate."],
      tips: ["Cut firm, grapefruit-sized heads.", "Harvest before prolonged hard frost.", "Force roots in the dark for pale, sweet chicons.", "Leave the root; it may regrow."] },
    use: { p: [
      "Slice radicchio into salads for colour and crunch, balancing the bitterness with sweet fruit, nuts, honey or a creamy dressing. It is also delicious grilled or roasted, which softens the flavour and turns it sweet and smoky. Add it to risotto, pasta and pizza, or braise it gently in butter and wine.",
      "Whole heads keep in the fridge for two weeks, wrapped in damp kitchen paper in a bag. Remove the outer leaves before eating. Cooked radicchio can be frozen, but fresh leaves lose their crisp texture on freezing."],
      tips: ["Soak shredded leaves in cold water to soften the bitterness.", "Grill wedges with olive oil and balsamic vinegar.", "Balance with honey, pears or walnuts.", "Add to risotto at the end."] } },

  { id: "microgreens", name: "Microgreens", latin: "Various (Brassicaceae, legumes and others)", emoji: "🌱", sizes: ["balcony", "small", "medium", "large"], difficulty: "Easy",
    sun: ["partial", "full", "shade"], sunText: "A bright windowsill or any well-lit indoor spot",
    facts: [["Type", "Seedlings of salad, herb and vegetable plants harvested young"], ["Sow", "All year round, indoors"], ["Height", "5–10 cm when cut"], ["Spacing", "Sown thickly across the tray"], ["Sowing depth", "On the surface, or lightly covered"], ["Time to harvest", "7–21 days from sowing"], ["Good companions", "Not applicable: grown in trays"]],
    info: [
      "Microgreens are the young seedlings of salad and vegetable plants, cut after their first true leaves emerge, and they are packed with flavour and colour. They can be grown on any windowsill in as little as a week or two, in any month, with no garden at all, making them the best year-round crop in this guide.",
      "Good choices include radish, mustard, pea shoots, sunflower, broccoli, rocket, coriander, basil, beetroot and fenugreek. They need almost no equipment: a shallow tray or old food container, a little compost or kitchen paper, seed and water."],
    varieties: ["Radish (fast, peppery, ready in 7 days)", "Pea shoots (sweet, crunchy, 14–21 days)", "Sunflower (nutty, crisp)", "Mustard and rocket (hot and peppery)", "Broccoli and kale (mild, 8–10 days)", "Coriander and basil (slower, aromatic)"],
    sow: { p: [
      "Use a shallow tray, about 3–5 cm deep, with drainage holes if possible. Fill with 2–3 cm of moist peat-free multipurpose compost, or use a layer of damp kitchen paper or a coir mat. Firm and level the surface, then scatter seed thickly and evenly so the seeds are almost touching but not overlapping.",
      "Press the seed gently into the surface and mist it well. Some seeds, such as peas and sunflowers, benefit from soaking overnight before sowing. Cover with a lid, plate or another tray for two to three days to keep the seeds dark and moist, then uncover and move to good light. Use seed sold for sprouting or microgreens."],
      tips: ["Sow thickly: microgreens are crops in a tray.", "Cover for two to three days, then move into the light.", "Use a bright windowsill, ideally south-facing.", "Soak large seeds like peas and sunflowers overnight."] },
    grow: { p: [
      "Water the trays from below or with a gentle mist, keeping the compost moist but never waterlogged. Overwatering and poor air flow lead to mould. Keep the tray in a bright, well-ventilated spot at room temperature, and turn it every day so the seedlings grow straight.",
      "If you see white fuzz on the surface, it is usually fine root hairs rather than mould; mould is grey or cottony and smells musty. Good ventilation, thinner sowing and careful watering prevent it. Wash trays between batches in hot water and use fresh compost each time."],
      tips: ["Water from below to keep leaves dry.", "Provide good air flow.", "Turn trays daily for even growth.", "Use fresh compost for each sowing."] },
    pests: ["Mould in humid, stagnant air", "Damping off from overwatering", "Fungus gnats in damp compost"],
    harvest: { p: [
      "Cut microgreens with scissors just above the compost when the first pair of seed leaves has fully opened and, for some types, the first true leaves have started to appear. Radish and mustard take about a week, sunflower and pea shoots two to three weeks, and basil and coriander three weeks or more.",
      "Harvest in the morning when the leaves are crisp, and snip the whole tray or take just what you need. Most do not regrow well after cutting, apart from pea shoots, which may give a second smaller crop. Compost the used compost and roots, then start another tray."],
      tips: ["Cut just above the compost with clean scissors.", "Harvest when the first leaves are open.", "Sow a new tray every week for a steady supply.", "Pea shoots may give a second cut."] },
    use: { p: [
      "Use microgreens as a fresh topping for salads, sandwiches, soups, eggs, pizza and curries, where they add intense flavour and bright colour. Peppery radish and mustard greens liven up bland dishes, sweet pea shoots are lovely in stir-fries and sunflower greens add a satisfying crunch.",
      "Microgreens are best eaten the day they are cut. Keep unwashed, dry greens in a container lined with kitchen paper in the fridge for up to five days. Rinse gently just before use. They do not freeze, so harvest only what you need."],
      tips: ["Add at the last moment to keep their crunch.", "Do not wash until needed.", "Store dry in a lined container.", "Mix different types for flavour and colour."] } },

  { id: "sorrel", name: "Sorrel", latin: "Rumex acetosa", emoji: "🍃", sizes: ["balcony", "small", "medium", "large"], difficulty: "Easy",
    sun: ["full", "partial", "shade"], sunText: "Full sun to partial shade; tolerates shade",
    facts: [["Type", "Hardy perennial leaf herb"], ["Sow", "Mar–Jun, or divide in spring"], ["Height", "30–90 cm"], ["Spacing", "30 cm apart"], ["Sowing depth", "1 cm"], ["Time to harvest", "8–10 weeks from sowing, then for years"], ["Good companions", "Strawberries, lettuce, chives"]],
    info: [
      "Sorrel is a hardy perennial with arrow-shaped leaves and a sharp, lemony flavour. It is among the first greens to appear in spring, and it crops for many years, which makes it one of the most reliable perennial crops for the kitchen garden.",
      "Broad-leaved sorrel has a strong flavour. French or buckler-leaf sorrel (Rumex scutatus) is smaller, gentler and slower-growing. Both are easy in sun or part shade and thrive in pots. The tang comes from oxalic acid, so enjoy it in moderation."],
    varieties: ["Broad-leaved sorrel (large, vigorous leaves)", "Buckler-leaf sorrel (Rumex scutatus, mild and compact)", "Blood-veined sorrel (Rumex sanguineus, red-veined and ornamental)", "Profusion (a non-flowering variety)"],
    sow: { p: [
      "Sow in March to June, 1 cm deep, either indoors in modules or directly outside in rows 30 cm apart. Seedlings emerge in two to three weeks and can be thinned to 30 cm apart. Moist, fertile soil in sun or light shade gives the biggest leaves. Do not allow plants to dry out.",
      "The easiest route is to buy a small plant or to divide an existing clump in spring, replanting the pieces 30 cm apart. Sorrel grows well in pots at least 20 cm wide. One or two plants are enough for most households, as the leaves are strong."],
      tips: ["One or two plants are enough for a household.", "Divide clumps in spring every three years.", "Water pots regularly.", "Choose a non-flowering variety to save effort."] },
    grow: { p: [
      "Keep plants watered in dry weather and cut off flower stems as soon as they appear, to keep the leaves coming and prevent self-seeding. A mulch of compost each spring, and a general liquid feed once or twice in summer, keep the leaves tender and productive.",
      "Sorrel is rarely troubled by disease, though slugs, sawfly larvae and downy mildew can mark the leaves. Cut hard back after a bad attack, and fresh leaves will grow. Divide old, congested clumps every three to four years to renew them."],
      tips: ["Remove flower stems promptly.", "Cut back hard if leaves look tired.", "Feed lightly once or twice in summer.", "Divide every three to four years."] },
    pests: ["Slugs", "Sawfly larvae", "Downy mildew", "Rust"],
    harvest: { p: [
      "Pick young leaves from about eight weeks after sowing, taking a few from each plant, from the outside of the clump. Young leaves are tender and lemony; older leaves become tough and very sharp. In the first year, pick lightly to let the plants establish.",
      "Regular picking and removing flower stems keep fresh growth coming from March to November. In mild winters, sorrel keeps growing slowly. Do not eat huge quantities, because oxalic acid can be a problem for people with kidney stones or gout."],
      tips: ["Pick young leaves; they are less sharp.", "Take leaves from the outside of the clump.", "Cut back flowers to keep it productive.", "Eat in moderation."] },
    use: { p: [
      "Sorrel gives a bright lemony zing to sauces, soups and salads. Add a few young leaves to salads, or cook larger ones until they melt into a sharp purée, ideal with fish, eggs, chicken or potatoes. Classic uses include sorrel soup, French omelettes and sauce for salmon.",
      "The leaves lose their bright green colour when cooked, turning an olive shade, which is normal. Fresh sorrel keeps for two to three days in the fridge. To keep surplus leaves, cook them to a purée and freeze in ice-cube trays, ready to add to sauces and soups."],
      tips: ["Cook briefly: sorrel melts in a minute or two.", "Freeze purée in ice-cube trays.", "Pair with fish, eggs and cream.", "Use small leaves raw in salads."] } },
];
