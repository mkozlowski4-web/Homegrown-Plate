/* Root vegetables.
   Fields: id, name, latin, emoji, sizes, difficulty, sun (full / partial / shade the crop copes with, main need first),
   sunText, facts (must include a short ['Sow', ...]), info, varieties, sow / grow / harvest / use ({ p: paragraphs, tips }),
   pests. Optional: sowTitle (for crops that are mostly planted, not sown). */
export const ROOTS = [
  { id: "carrot", name: "Carrot", latin: "Daucus carota", emoji: "🥕", sizes: ["small", "medium", "large"], difficulty: "Medium",
    sun: ["full", "partial"], sunText: "Full sun to light shade",
    facts: [["Type", "Hardy biennial root vegetable, grown as an annual"], ["Sow", "Mar–Jul, straight into the soil"], ["Height", "30–45 cm"], ["Spacing", "Thin to 5–8 cm apart in rows 15–30 cm apart"], ["Sowing depth", "1 cm"], ["Time to harvest", "10–16 weeks from sowing"], ["Good companions", "Onions, leeks, chives, rocket"]],
    info: [
      "Home-grown carrots are sweeter and more tender than most shop-bought ones, and they come in colours supermarkets rarely stock, from purple and yellow to white and deep orange. They are a cool-season crop that is sown where it will grow, and they suit raised beds and deep pots as well as open ground.",
      "The main challenge in the UK is carrot fly, a small pest whose larvae tunnel into the roots. Everything else is straightforward: a light, stone-free soil, even moisture and sowings spread from spring to midsummer will give you fresh roots for most of the year."],
    varieties: ["Nantes 5 (sweet and reliable)", "Early Nantes (first sowings)", "Autumn King (heavy cropper that stores well)", "Flyaway (partly carrot fly resistant)", "Paris Market (round roots for shallow pots)", "Purple Haze (purple skin, orange core)"],
    sow: { p: [
      "Carrots dislike being moved, so sow them where they will grow. Prepare a fine, stone-free bed in full sun, raking out lumps and stones that make roots fork. Avoid fresh manure, which also causes forking; soil that was improved the previous year is ideal. Water the drill first, sow thinly in rows 15–30 cm apart, cover with 1 cm of soil and firm lightly.",
      "Sow earlies under cloches or fleece from March, then maincrops from April to July. Seed can take two to three weeks to germinate, so mark the rows and keep the soil moist. In containers choose a pot at least 30 cm deep, using short or round varieties in shallower ones."],
      tips: ["Sow thinly to cut down on thinning, which releases the scent that attracts carrot fly.", "Mix the fine seed with dry sand to space it more evenly.", "Sow a short row every three weeks to avoid a glut.", "Cover the seedbed with fleece to keep it warm and damp until seedlings appear."] },
    grow: { p: [
      "Thin seedlings to 5–8 cm apart once they are about 5 cm tall. Water steadily, because roots split if the soil dries out and is then soaked. A thin mulch of grass clippings or compost keeps moisture even. Weed gently while the seedlings are small, as they are slow to start and easily smothered.",
      "Protect against carrot fly with a 60 cm high barrier of fine mesh or fleece around the bed, as the female flies low to the ground. Sowing early or late to miss the main flights in May and again in August and September, and choosing resistant varieties, also helps. Avoid high-nitrogen feeds, which give hairy, forked roots and plenty of leaf."],
      tips: ["A 60 cm barrier of fine mesh is the most effective carrot fly defence.", "Thin on a calm evening, then water and take the thinnings away.", "Rotate carrots to a new bed each year, away from parsnips.", "Cover any shoulders poking out of the soil so they do not turn green."] },
    pests: ["Carrot fly", "Aphids", "Slugs on seedlings", "Splitting from uneven watering"],
    harvest: { p: [
      "Early varieties are ready 10–12 weeks after sowing and maincrops in 14–16 weeks. Pull one or two to check: baby carrots are delicious at finger width, while maincrops are best around 2–3 cm across the shoulder. Water the row the day before to soften the soil, then loosen it with a fork before pulling so roots do not snap.",
      "Lifting disturbs the soil and releases scent, so pull in the evening or under a cover when carrot fly is about. Maincrops sown in late spring can stay in the ground and be lifted as needed until the soil freezes hard. In cold or very wet areas, lift them in November."],
      tips: ["Twist off the foliage straight away, as leaves draw moisture out of the root.", "Pull every other carrot in a row first to give the rest room to swell.", "Cover rows with straw in winter so you can still lift in frost.", "Lift everything before slugs or hard frost damage the roots."] },
    use: { p: [
      "Carrots work raw and cooked: grate them into salads and slaws, roast with honey and thyme, boil and mash with swede, or simmer in soups and stews. Home-grown roots have thin, sweet skin, so scrubbing is usually enough. The feathery tops can be used in small amounts, for example blitzed into a salsa verde or pesto.",
      "For short-term storage, twist off the tops and keep unwashed roots in a paper bag or box in the fridge, where they last three to four weeks. For longer storage, layer undamaged roots in boxes of slightly damp sand or compost in a cool, frost-free shed, where they keep for three to five months. They also freeze well when sliced and blanched for three minutes."],
      tips: ["Store only undamaged roots, and eat any with slug holes or splits first.", "Check stored roots every few weeks and remove any that are going soft.", "Blanch for three minutes, cool quickly, then freeze in portions.", "Roast at 200°C for about 30 minutes for the sweetest flavour."] } },

  { id: "parsnip", name: "Parsnip", latin: "Pastinaca sativa", emoji: "🥕", sizes: ["medium", "large"], difficulty: "Medium",
    sun: ["full", "partial"], sunText: "Full sun to light shade",
    facts: [["Type", "Hardy biennial root vegetable, grown as an annual"], ["Sow", "Mar–Apr, straight into the soil"], ["Height", "60–90 cm"], ["Spacing", "Thin to 15 cm apart in rows 30 cm apart"], ["Sowing depth", "1–2 cm"], ["Time to harvest", "24–32 weeks from sowing"], ["Good companions", "Onions, garlic, radishes"]],
    info: [
      "Parsnips are a classic winter root: sweet, nutty and completely hardy, so they stay in the ground until you need them. They are slow, taking most of the growing season, but need little attention once they are up.",
      "They need a long, deep, stone-free soil to grow straight, which makes them a better choice for medium and large plots or deep raised beds than for small containers. Always sow fresh seed, as parsnip seed loses viability within a year."],
    varieties: ["Gladiator (reliable F1)", "Tender and True (long, smooth roots)", "Hollow Crown (traditional, full flavour)", "Javelin (F1, smooth roots)"],
    sow: { p: [
      "Sow from March to April once the soil has started to warm, ideally in a bed dug over deeply the previous autumn. Parsnips germinate slowly and unevenly, taking three to four weeks, and cold, wet soil rots the seed. Sow three seeds every 15 cm in drills 1–2 cm deep, then thin to the strongest seedling.",
      "Mark the row with a quick-growing radish, as the parsnips are slow to appear and you will not want to hoe them out by accident. Do not add fresh manure, and remove stones to at least spade depth. Pre-germinating seed on damp kitchen paper for a week can speed things up, but handle the fragile roots gently."],
      tips: ["Use seed from this year’s packet only.", "Sow in mid-March to April; earlier sowings often rot in cold wet soil.", "Interplant with radishes to mark the row and loosen the soil surface.", "Keep the soil surface moist, as a crust stops seedlings emerging."] },
    grow: { p: [
      "Keep the bed weeded while the plants are small, then the leaves quickly shade out weeds. Water in dry spells, as uneven moisture causes splitting and forked roots. Parsnips need little feeding; too much nitrogen gives a lot of leaf and poor roots.",
      "The main problems are carrot fly, canker (rusty-brown patches on the shoulders) and leaf miner. Resistant varieties and sowing in well-drained soil limit canker, and a barrier of fine mesh deals with carrot fly. Always wear gloves and long sleeves when handling the foliage in sun, as the sap can cause skin blistering."],
      tips: ["Choose canker-resistant varieties if the disease has been a problem before.", "Wear gloves when weeding and harvesting: parsnip sap can burn skin in sunlight.", "Mulch lightly in summer to hold moisture.", "Rotate with carrots, celery and parsley, which share the same pests."] },
    pests: ["Parsnip canker", "Carrot fly", "Celery leaf miner", "Parsnip moth"],
    harvest: { p: [
      "Roots are ready from October, but the flavour improves after the first hard frosts, which convert starch to sugar. Water first if the soil is dry, then loosen with a fork well to the side of the row and lift the roots carefully, as long roots snap easily.",
      "You can leave parsnips in the ground until early spring and lift them as needed. Lift any left by March, as new growth turns them woody and bitter. In very cold areas, cover the row with straw so you can dig in a freeze."],
      tips: ["Always loosen the soil before pulling; do not tug by the leaves.", "Harvest after the first frosts for the sweetest roots.", "Lift all roots by early spring before they start to regrow.", "Mark the rows if you use cover, so you can find them in snow."] },
    use: { p: [
      "Roast parsnips with honey or maple syrup for a Sunday-lunch favourite, or make creamy parsnip and apple soup, mash them with butter, bake them into cakes or cut them into crisps. Younger, smaller roots can be eaten whole, while larger ones have a woody core that is worth cutting out.",
      "Unwashed roots keep for two to three weeks in a bag in the fridge, or for several months layered in damp sand in a cool, frost-free place. Leaving them in the ground is the simplest storage of all. For the freezer, peel, slice, blanch for two minutes and freeze in portions, or freeze after roasting."],
      tips: ["Cut out the woody core from large roots before cooking.", "Parboil for five minutes before roasting for crispy edges.", "Do not store alongside apples, whose ethylene turns roots bitter.", "Roast and freeze in trays for easy meal-prep."] } },

  { id: "beetroot", name: "Beetroot", latin: "Beta vulgaris subsp. vulgaris", emoji: "🟣", sizes: ["small", "medium", "large"], difficulty: "Easy",
    sun: ["full", "partial"], sunText: "Full sun to light shade",
    facts: [["Type", "Hardy biennial root vegetable, grown as an annual"], ["Sow", "Mar–Jul, straight into the soil"], ["Height", "30–45 cm"], ["Spacing", "Thin to 8–10 cm apart in rows 30 cm apart"], ["Sowing depth", "2 cm"], ["Time to harvest", "8–12 weeks from sowing"], ["Good companions", "Onions, lettuce, kohlrabi, dwarf beans"]],
    info: [
      "Beetroot is one of the easiest and most forgiving root crops, giving both sweet roots and nutritious leaves that can be eaten like chard. It grows well in pots, beds and between other crops, and a few short rows sown every few weeks keep a steady supply going from early summer to late autumn.",
      "Beetroot seed is actually a dried fruit that contains several seeds, so each ‘seed’ produces a small cluster of seedlings. Thinning is therefore part of the job, but the thinnings make a tasty salad leaf."],
    varieties: ["Boltardy (reliable and resists bolting)", "Chioggia (candy-striped flesh)", "Burpee’s Golden (sweet yellow roots, no staining)", "Cylindra (long roots, easy to slice)", "Pablo (smooth, uniform globes)"],
    sow: { p: [
      "Sow from March under cloches or fleece, then outdoors in April to July once the soil is above about 7°C. Colder soil can cause young plants to bolt. Sow seed 2 cm deep in rows 30 cm apart, one cluster every 5–10 cm. Seedlings appear in 10–14 days, and soaking the seed in water for a few hours before sowing speeds germination.",
      "Sow a short row every three or four weeks for a steady supply, and finish with a late sowing in July for autumn roots. In containers, use a pot at least 20 cm deep and sow thinly across the surface, thinning to 5 cm for baby beets."],
      tips: ["Choose a bolt-resistant variety such as Boltardy for early sowings.", "Thin to one seedling per cluster when they reach 5 cm.", "Sow thinly in a pot for a baby-beet crop on a balcony.", "Do not sow into freshly manured soil."] },
    grow: { p: [
      "Thin seedlings in stages, finishing at 8–10 cm apart for full-size roots. Water regularly, because dry spells followed by rain cause splitting and tough, woody roots. A mulch of compost or grass clippings keeps the soil evenly moist and suppresses weeds, which beetroot dislikes competing with.",
      "Beetroot is rarely troubled by serious problems. Leaf miners leave pale tunnels in the foliage, so pinch off affected leaves. Birds sometimes peck seedlings, and boron deficiency in very alkaline or sandy soil can cause dark, corky patches in the roots, which a light application of borax-containing fertiliser addresses."],
      tips: ["Water consistently; uneven watering is the main cause of poor roots.", "Pinch off leaves with miner damage and bin them.", "Feed lightly if growth stalls, but avoid high nitrogen.", "Eat the thinnings in salads."] },
    pests: ["Leaf miner", "Flea beetle", "Birds on seedlings", "Bolting in cold snaps"],
    harvest: { p: [
      "Baby beets can be pulled from about eight weeks, when they are the size of a golf ball. For maincrop roots, wait until they are 5–8 cm across, around 12 weeks. Larger roots tend to be woodier, so harvest before they exceed a tennis ball. Lift with a fork to avoid damaging the skin, as the roots bleed colour.",
      "Twist off the leaves 2–3 cm above the root rather than cutting them, as cutting makes the beetroot bleed. Lift all roots from the ground by mid to late October, before hard frosts. Leaves can be picked sparingly throughout the season."],
      tips: ["Twist, do not cut, the leaves to stop colour loss.", "Use a fork and keep it well away from the roots.", "Pick a few leaves from each plant; taking too many weakens the root.", "Harvest before hard frosts for the best storage."] },
    use: { p: [
      "Roast whole beets in foil for an hour, then peel the skins off, or boil them for 30–45 minutes. Grate raw into slaws, blend into hummus and chocolate cakes, or pickle with vinegar for a jar to enjoy through the winter. The young leaves can be wilted like spinach or added raw to salads.",
      "Twist off the leaves, leave 2 cm of stalk and keep roots unwashed in a bag in the fridge for two to three weeks. For longer storage, pack undamaged roots in boxes of dry sand or compost in a cool, frost-free shed, where they last three to five months. Cooked beetroot freezes well, or can be pickled and kept for a year."],
      tips: ["Wear gloves when peeling cooked beetroot to avoid stained hands.", "Pickle small roots whole for a jar that keeps for months.", "Wilt the leaves in butter like chard.", "Freeze cooked, peeled cubes on a tray before bagging them."] } },

  { id: "radish", name: "Radish", latin: "Raphanus sativus", emoji: "🔴", sizes: ["balcony", "small", "medium", "large"], difficulty: "Easy",
    sun: ["full", "partial"], sunText: "Full sun to partial shade",
    facts: [["Type", "Hardy annual root vegetable"], ["Sow", "Mar–Sep, straight into the soil"], ["Height", "15–20 cm"], ["Spacing", "Thin to 2–3 cm apart in rows 15 cm apart"], ["Sowing depth", "1 cm"], ["Time to harvest", "3–5 weeks from sowing"], ["Good companions", "Carrots, parsnips, lettuce, beans"]],
    info: [
      "Radishes are the fastest crop you can grow, going from seed to salad in as little as three weeks. They are ideal for beginners and children, for sowing between slower crops and for filling gaps, and they grow in a pot on a windowsill as happily as in a bed.",
      "They prefer cool, moist weather and turn hot, woody and bitter if they dry out or are left too long. Small, frequent sowings give the best flavour, while winter radishes such as mooli and Chinese radish are sown in summer for autumn and winter roots."],
    varieties: ["French Breakfast (long, mild and crisp)", "Cherry Belle (round and quick)", "Sparkler (bright red and white tips)", "Scarlet Globe (classic and reliable)", "Mooli (large winter radish)", "Rat-tail (grown for its edible seed pods)"],
    sow: { p: [
      "Sow thinly in shallow drills 1 cm deep from March to September, in rows 15 cm apart, and cover lightly. Seedlings appear within a few days. For a continuous supply, sow a short row every two weeks rather than all at once. In summer, choose a spot with partial shade to stop plants bolting in heat.",
      "Sow winter radishes such as mooli, black Spanish and China Rose in July and August, and thin to 15 cm apart as they grow larger. Radishes are great sown between slower crops like parsnips, where they mark the row and are harvested long before they compete."],
      tips: ["Sow little and often, ideally every two weeks.", "Sow in part shade in summer to avoid bolting.", "Use a pot at least 15 cm deep for a windowsill crop.", "Sow winter radishes in midsummer for autumn harvests."] },
    grow: { p: [
      "Radishes need very little care apart from steady moisture. Water regularly, particularly in dry weather, because drought gives hot, woody roots that split. Thin seedlings to 2–3 cm apart once they are about 2 cm tall, giving each root room to swell.",
      "Flea beetle is the main pest, peppering the leaves with tiny holes. Cover rows with fine mesh or fleece from sowing and keep plants watered, as healthy plants grow away from damage. Keep weeds down early, and rotate radishes with the rest of the brassica group to avoid clubroot."],
      tips: ["Cover with fine mesh at sowing to keep flea beetle off.", "Water during dry spells for sweet, crisp roots.", "Thin early so the roots can swell.", "Grow in a different bed each year, as radish is a brassica."] },
    pests: ["Flea beetle", "Slugs", "Cabbage root fly", "Bolting in hot, dry weather"],
    harvest: { p: [
      "Most varieties are ready three to five weeks after sowing, when the roots are about 2–3 cm across. Pull a few to check. Left too long, they turn woody, pithy and fiery, so harvest promptly and eat while crisp. Pull gently and in the morning, when the roots are at their juiciest.",
      "Winter radishes need 8–12 weeks and can be left in the ground until needed, though lift them before hard frosts in cold areas. If a plant bolts, let it flower and form seed pods: the green pods are crunchy, peppery and delicious in salads and stir-fries."],
      tips: ["Harvest quickly: older radishes turn woody fast.", "Pick in the morning for the crispest texture.", "Twist off the leaves right away.", "Let one plant go to seed to eat the pods."] },
    use: { p: [
      "Slice radishes into salads, eat them with butter and salt, add them to sandwiches and tacos, or roast them for a surprisingly sweet side dish. Pickle them in vinegar and sugar for a bright garnish in about an hour. The young leaves are edible too and can be stir-fried or made into a peppery soup.",
      "Remove the leaves, wash the roots and store them in the fridge wrapped in damp kitchen paper for one to two weeks. Revive floppy ones in iced water for 15 minutes. Radishes do not freeze or dry well, so sow little and often and enjoy them fresh, or quick-pickle surplus roots."],
      tips: ["Revive limp radishes in iced water for 15 minutes.", "Roast at 200°C for 15–20 minutes to mellow the heat.", "Quick-pickle with vinegar, sugar and salt.", "Add the leaves to soups for a peppery kick."] } },

  { id: "potato", name: "Potato", latin: "Solanum tuberosum", emoji: "🥔", sizes: ["small", "medium", "large"], difficulty: "Easy", sowTitle: "How to plant",
    sun: ["full"], sunText: "Full sun (6+ hours); tolerates light shade with a smaller crop",
    facts: [["Type", "Half-hardy tuberous perennial, grown as an annual"], ["Sow", "Mar–May, planting seed potatoes"], ["Height", "60–90 cm"], ["Spacing", "30–40 cm apart in rows 60–75 cm apart"], ["Planting depth", "10–15 cm"], ["Time to harvest", "10–12 weeks (first earlies) to 20 weeks (maincrop)"], ["Good companions", "Beans, sweetcorn, nasturtiums"]],
    info: [
      "Potatoes are among the most productive and satisfying crops you can grow, and freshly dug new potatoes taste far better than anything from a shop. They are grown from ‘seed’ potatoes, which are small tubers saved or sold for planting, and come in three groups: first earlies, second earlies and maincrops.",
      "You can grow them in open ground, raised beds, large pots, sacks or bags, making them suitable for gardens of almost any size. Always buy certified seed potatoes, as supermarket potatoes can carry disease and are not treated for planting."],
    varieties: ["Rocket (first early, reliable)", "Charlotte (second early, salad)", "Maris Peer (second early, creamy and versatile)", "Sarpo Mira (maincrop, strong blight resistance)", "Maris Piper (maincrop, all-rounder)", "Pink Fir Apple (late salad, superb flavour)"],
    sow: { p: [
      "From late January, stand seed potatoes in egg boxes with the end with most ‘eyes’ upwards, in a cool, bright, frost-free place. This is called chitting, and gives short, sturdy shoots that give earlier crops. Plant first earlies in mid-March to early April, second earlies in early to mid April and maincrops from mid-April to May.",
      "Dig a trench or individual holes 10–15 cm deep, plant with the shoots upwards, space 30–40 cm apart and cover with soil. In large pots or potato bags, put 15 cm of compost in the base, plant three tubers per 30–40 cm pot, then add compost as they grow. Protect emerging shoots from frost with fleece or soil."],
      tips: ["Chit seed potatoes in a bright, cool place for six weeks before planting.", "Rub off all but 3–4 of the strongest shoots for bigger potatoes.", "Cover shoots with fleece if a late frost is forecast.", "Never plant shop-bought potatoes: use certified seed."] },
    grow: { p: [
      "When shoots reach 20–25 cm, ‘earth up’ by drawing soil from between the rows up around the stems, leaving just the tops showing. This stops tubers turning green and poisonous and boosts yield. Repeat every two weeks until the foliage meets across the row. Water well in dry weather, especially once the plants flower.",
      "Potato blight, a fast-spreading disease in warm, humid weather, is the biggest threat, usually from July. Check leaves regularly for brown patches; if you see them, cut off all foliage straight away and bin it, leaving tubers in the soil for two weeks before lifting. Choosing blight-resistant varieties and growing earlies, which are lifted before blight arrives, are the best defences."],
      tips: ["Earth up regularly to stop tubers turning green.", "Water deeply once plants are in flower.", "Lift earlies before blight season to dodge the disease.", "Rotate with a three- or four-year gap, as potatoes share diseases with tomatoes."] },
    pests: ["Potato blight", "Slugs", "Potato cyst nematode", "Scab and blackleg"],
    harvest: { p: [
      "First earlies are ready from June, when plants flower, around 10–12 weeks after planting. Lift carefully with a fork well away from the stems, and dig a test plant first. Second earlies follow from July. Lift maincrops from September, when the foliage has yellowed and died back.",
      "For maincrops, cut off the haulm (the top growth) about two weeks before lifting so skins can set, which helps storage. Dig on a dry day and leave the tubers on the surface for a few hours to dry, then brush off the soil. Remove any damaged or slug-eaten tubers and eat them first."],
      tips: ["Dig a test plant of earlies before lifting the whole row.", "Use a fork, pushing it in well away from the stems.", "Cut off maincrop foliage two weeks before lifting.", "Do not wash potatoes you plan to store."] },
    use: { p: [
      "New potatoes are best boiled with mint and tossed in butter, while salad varieties suit potato salads. Maincrops are the roasting, mashing, chipping and baking potatoes, and the waxy or floury texture of each variety decides what it does best. Never eat green or sprouting tubers, as they contain solanine, which is toxic; cut off any green patches completely.",
      "Earlies are best eaten within days. Cure maincrops by drying them for a few hours, then store in paper or hessian sacks in a cool, dark, frost-free place at 4–10°C, where they keep for five months or more. Never store potatoes in plastic bags or in the fridge, which makes them sweet and damp. Store them away from onions."],
      tips: ["Keep potatoes in the dark to stop them turning green.", "Check stored potatoes monthly and remove any rotting ones.", "Never eat green or sprouting tubers.", "Boil waxy varieties and bake or roast floury ones."] } },

  { id: "swede", name: "Swede", latin: "Brassica napus subsp. rapifera", emoji: "🥔", sizes: ["medium", "large"], difficulty: "Easy",
    sun: ["full", "partial"], sunText: "Full sun to light shade",
    facts: [["Type", "Hardy biennial root vegetable, grown as an annual"], ["Sow", "May–Jun, straight into the soil"], ["Height", "30–40 cm"], ["Spacing", "Thin to 23 cm apart in rows 38 cm apart"], ["Sowing depth", "1–2 cm"], ["Time to harvest", "20–26 weeks from sowing"], ["Good companions", "Peas, beans, onions"]],
    info: [
      "Swede is a hardy, undemanding winter root that is ideal for the cold part of the year when little else is cropping. The flesh is sweet and golden, a lot more flavoursome when freshly grown, and it stands in the ground from October to March.",
      "It belongs to the brassica family, so it shares cabbage’s problems, such as clubroot and flea beetle, and it likes a firm, moist soil that is not too acidic. A sowing in early summer is all you need, making swede one of the lowest-effort crops for a medium or large plot."],
    varieties: ["Marian (good mildew resistance)", "Tweed (smooth, uniform roots)", "Gowrie (traditional heavy cropper)", "Best of All (reliable and hardy)"],
    sow: { p: [
      "Sow in late May to June, directly where plants will grow, in a sunny site with firm, fertile, moisture-retentive soil that has been limed if it is acidic. Sow thinly in shallow drills 1–2 cm deep and 38 cm apart. Later sowings are less prone to mildew and flea beetle but will not reach full size, so do not leave sowing past mid-June.",
      "Seedlings emerge in a week to ten days. Thin them in two stages, first to 10 cm and later to 23 cm apart, so the final plants have room to swell. A prepared bed raked to a fine tilth gives the most even germination."],
      tips: ["Sow in late May to mid-June, not later.", "Lime acidic soils to guard against clubroot.", "Firm the seedbed by treading before sowing.", "Cover with fine mesh to protect from flea beetle."] },
    grow: { p: [
      "Keep the bed weeded and water in dry weather, because irregular moisture causes splitting, woody roots and brown heart (a boron deficiency). A mulch after thinning conserves moisture. Swedes need little feeding on reasonably fertile soil, and too much nitrogen gives leafy plants with small roots.",
      "Clubroot is the serious disease, causing swollen, distorted roots, and it lives in the soil for many years, so lime the soil and rotate brassicas. Flea beetle on seedlings, caterpillars on the leaves and powdery mildew on older ones are the other likely troubles. Mildew-resistant varieties and watering well help most."],
      tips: ["Lime acidic soil to a pH of 6.5–7 before sowing.", "Water steadily to avoid split and woody roots.", "Rotate brassicas on a four-year plan.", "Net against pigeons and cabbage white caterpillars."] },
    pests: ["Clubroot", "Flea beetle", "Powdery mildew", "Cabbage root fly"],
    harvest: { p: [
      "Roots are ready from October, when they are about the size of a tennis ball, although they can grow larger without becoming woody. Frosts improve the flavour, so there is no hurry. Lift with a fork, twist off the leaves and trim the roots, taking care not to damage the skin.",
      "Swedes will stand in the ground until March in most areas and are lifted as needed. In hard winters, cover rows with straw or fleece to keep the soil workable. Lift any remaining roots before spring regrowth turns them hard and fibrous."],
      tips: ["Harvest after the first frost for sweeter roots.", "Lift as needed through winter.", "Use straw or fleece in severe frost.", "Do not leave them in the ground after March."] },
    use: { p: [
      "Boil and mash swede with butter and black pepper, or with carrots for a classic ‘neeps’ dish. It roasts beautifully, goes into stews, soups and pasties, and can be grated raw into slaws when young. Cubed swede is a good low-carbohydrate alternative to potatoes in curries.",
      "Lifted roots store for several weeks in a cool, airy place, or for months layered in dry sand in a frost-free shed, though they are best left in the ground until needed. Peel thickly, as the skin is tough and waxy. Cubed and blanched for three minutes, swede freezes well."],
      tips: ["Peel thickly to remove the tough outer layer.", "Roast cubes in oil with rosemary at 200°C.", "Blanch for three minutes before freezing.", "Mash with butter and plenty of black pepper."] } },

  { id: "turnip", name: "Turnip", latin: "Brassica rapa subsp. rapa", emoji: "🟣", sizes: ["small", "medium", "large"], difficulty: "Easy",
    sun: ["full", "partial"], sunText: "Full sun to light shade",
    facts: [["Type", "Hardy annual or biennial root vegetable"], ["Sow", "Mar–Apr and Jul–Aug, straight into the soil"], ["Height", "30 cm"], ["Spacing", "Thin to 10–15 cm apart in rows 23–30 cm apart"], ["Sowing depth", "1–2 cm"], ["Time to harvest", "6–10 weeks from sowing"], ["Good companions", "Peas, onions, lettuce"]],
    info: [
      "Turnips are quick, easy roots that can be harvested young as tender, mild, sweet baby turnips, or left to size up for winter. They are among the fastest of the brassicas, and sowings in spring and again in late summer give two main harvest windows.",
      "Both the root and the leaves, known as turnip tops or greens, are edible, and the tops are a useful early spring cut. They like cool, moist weather and bolt or turn woody if they are stressed by drought, so keep them well watered."],
    varieties: ["Purple Top Milan (fast and flat, for early crops)", "Snowball (white and sweet)", "Golden Ball (yellow flesh, stores well)", "Tokyo Cross (very fast baby turnips)", "Market Express (early and bolt resistant)"],
    sow: { p: [
      "For an early crop, sow from March to April under cloches or fleece, choosing a quick, bolt-resistant variety. For autumn and winter roots, sow in July and August, when moisture is steadier and flea beetle is less of a problem. Sow thinly in shallow drills 1–2 cm deep, in rows 23–30 cm apart, then thin as they grow.",
      "Turnips grow best in fertile, moisture-retentive soil that has been well dug and is free of fresh manure. In a small garden, sow a short row every two or three weeks, which gives tender baby turnips from 6–8 weeks. They can also be grown in deep containers for an easy crop on a balcony."],
      tips: ["Sow short rows every two to three weeks for baby turnips.", "Use fleece in March to protect against cold and flea beetle.", "Make a main sowing in July or August for autumn crops.", "Water the drill before sowing in dry spells."] },
    grow: { p: [
      "Thin seedlings to 10–15 cm apart in two stages, the first when they are 2–3 cm tall. Water regularly: turnips need steady moisture to swell evenly, and drought gives woody, hot-tasting roots. Hoe between rows to keep weeds down, taking care not to disturb the shallow roots.",
      "Flea beetle makes tiny holes in the leaves, particularly in spring, and is best prevented by fine mesh or by keeping plants well watered. Like all brassicas, turnips are prone to clubroot on acid soils, so lime when needed and rotate crops every year, with a gap of at least four years."],
      tips: ["Fine insect mesh from sowing is the best flea beetle control.", "Water evenly to avoid splitting and woody roots.", "Rotate with other brassicas on a four-year plan.", "Lime acid soils for clubroot control."] },
    pests: ["Flea beetle", "Clubroot", "Cabbage root fly", "Aphids"],
    harvest: { p: [
      "Baby turnips are ready from about six weeks, at the size of a golf ball, and are at their sweetest and most tender then. Maincrop turnips are best at about 5–7 cm across; larger roots get woody and strong-tasting. Pull or lift with a fork and cut off the tops.",
      "Turnip tops can be cut as greens from about four weeks, picking a few leaves from each plant. Late-sown turnips can stay in the ground through autumn and be lifted as needed, although in colder areas lift them before hard frosts and store."],
      tips: ["Pick small turnips for the best flavour.", "Cut the tops as greens while young.", "Lift before hard frosts in cold areas.", "Pull in the morning and keep roots cool."] },
    use: { p: [
      "Young turnips are lovely raw, grated or sliced thin in salads, or lightly steamed and buttered. Larger roots are better roasted, mashed with potatoes, or added to stews and soups. The tops can be sautéed with garlic and chilli, much like spring greens.",
      "Twist off the tops and keep the roots in a bag in the fridge for up to two weeks. For longer storage, keep undamaged roots in a box of dry sand or compost in a cool, frost-free shed for two to three months. Cubed turnips can be blanched for two minutes and frozen."],
      tips: ["Roast with honey and thyme for sweetness.", "Use the tops quickly, like spinach.", "Peel larger roots thickly.", "Blanch cubes for two minutes before freezing."] } },

  { id: "celeriac", name: "Celeriac", latin: "Apium graveolens var. rapaceum", emoji: "🌱", sizes: ["medium", "large"], difficulty: "Medium", sowTitle: "How to sow and plant",
    sun: ["full", "partial"], sunText: "Full sun to partial shade",
    facts: [["Type", "Hardy biennial root vegetable, grown as an annual"], ["Sow", "Mar–Apr indoors, plant out May–Jun"], ["Height", "45–60 cm"], ["Spacing", "30–40 cm apart each way"], ["Sowing depth", "On the surface"], ["Time to harvest", "28–36 weeks from sowing"], ["Good companions", "Leeks, beans, brassicas"]],
    info: [
      "Celeriac is a knobbly root with a smooth, nutty, celery-like flavour, and it is one of the most useful winter vegetables for soups, mash and the French salad céleri rémoulade. It is not difficult but has a long growing season and needs a good start indoors.",
      "Celeriac loves a fertile, moisture-retentive soil and regular watering. In return it will stand in the ground through most of the winter, so it is a handy crop for a medium or large plot that wants late-season produce."],
    varieties: ["Prinz (reliable, smooth roots)", "Monarch (large and well-flavoured)", "Brilliant (good stored quality)", "Giant Prague (traditional and heavy cropping)"],
    sow: { p: [
      "Sow in March to early April in seed trays of moist, peat-free seed compost, pressing seeds onto the surface without covering, as they need light to germinate. Keep at about 15–20°C in a propagator or warm windowsill. Germination can take two to three weeks, so be patient.",
      "Prick out seedlings into individual small pots when they have two true leaves, harden them off in May and plant out in late May to June, 30–40 cm apart each way. Plant with the base of the stems at soil level or slightly above, as burying the crown gives misshapen roots."],
      tips: ["Do not cover the seed; it needs light to germinate.", "Keep warm and moist until seedlings appear.", "Harden off over two weeks before planting.", "Plant with the crown at soil level, never buried."] },
    grow: { p: [
      "Water frequently and generously throughout summer: dry spells make celeriac woody and hollow. Mulch with compost or grass clippings to hold moisture, and feed every two to three weeks with a general liquid fertiliser. Remove any side shoots and the lowest leaves in late summer to expose the shoulders of the root.",
      "Slugs are the main nuisance when plants are young, and celery leaf miner and celery fly can damage the foliage; pick off affected leaves. Celeriac is fairly hardy, but a thick mulch of straw protects the roots in cold winters."],
      tips: ["Never let the soil dry out.", "Remove the lowest leaves in late summer.", "Feed every few weeks during summer.", "Mulch heavily with straw in hard winters."] },
    pests: ["Slugs", "Celery leaf miner", "Celery fly", "Carrot fly"],
    harvest: { p: [
      "Roots are ready from October and size up through autumn, reaching 10–15 cm across. They are hardy and can stay in the ground, but lift before severe frosts or cover well with straw. Use a fork to loosen the soil, then lift and trim off the leaves and fibrous roots.",
      "In mild areas, harvest as required until March. Roots left after that will start to produce a flower stem and become woody and hollow, so lift any remaining ones by early spring."],
      tips: ["Cover with straw for winter harvesting.", "Lift before the soil freezes hard.", "Trim off leaves and roots before storing.", "Larger roots are not always better; check for hollows."] },
    use: { p: [
      "Peel off the knobbly skin, cut into pieces and put straight into water with a squeeze of lemon, as it browns quickly. Celeriac makes a creamy soup, an excellent mash with potatoes, a golden roast, or a crisp raw salad shredded in mustard mayonnaise. It also adds depth to stews and gratins.",
      "Trimmed roots keep for two to three months in boxes of slightly damp sand or compost in a cool, frost-free shed, or for several weeks in the vegetable drawer of the fridge. Cubed and blanched for three minutes, they freeze well, as does celeriac soup."],
      tips: ["Drop peeled pieces into acidulated water to stop browning.", "Use a sturdy knife to cut off the skin.", "Roast cubes with garlic and thyme.", "Mash with potato for a lighter, nuttier purée."] } },

  { id: "jerusalem-artichoke", name: "Jerusalem artichoke", latin: "Helianthus tuberosus", emoji: "🌻", sizes: ["medium", "large"], difficulty: "Easy", sowTitle: "How to plant",
    sun: ["full", "partial"], sunText: "Full sun to partial shade",
    facts: [["Type", "Hardy perennial sunflower grown for its tubers"], ["Sow", "Feb–Apr, planting tubers"], ["Height", "2–3 m"], ["Spacing", "30–40 cm apart in rows 90 cm apart"], ["Planting depth", "10–15 cm"], ["Time to harvest", "28–32 weeks after planting"], ["Good companions", "Best grown on their own"]],
    info: [
      "Despite the name, Jerusalem artichokes are neither from Jerusalem nor artichokes: they are the knobbly tubers of a tall native North American sunflower. They are very hardy, almost impossible to kill, and give a heavy crop of sweet, nutty tubers from autumn to early spring with almost no attention.",
      "The plants grow 2–3 m tall and make an excellent windbreak or summer screen. The main caution is that they spread: every tuber left in the ground regrows, so plant them in a spot where this is welcome, such as a corner of the plot or a large raised bed."],
    varieties: ["Fuseau (long, smooth tubers that are easy to clean)", "Stampede (early, heavy cropper)", "Dwarf Sunray (shorter and tidier)", "White Fuseau (smooth and white)"],
    sow: { p: [
      "Plant tubers from February to April in any reasonably fertile soil, in sun or part shade. You can buy tubers from garden centres or use ones from a greengrocer, as they are not prone to the same diseases as potatoes. Plant them 10–15 cm deep and 30–40 cm apart, in rows about 90 cm apart.",
      "Because they spread vigorously, consider planting in a contained area such as a large bottomless pot or a bed edged with a barrier sunk 30 cm deep. Choose a site where tall plants will not shade neighbouring crops, such as the north side of the plot, or use the plants as a windbreak."],
      tips: ["Plant at the north end of the plot so they do not shade other crops.", "Even small tuber pieces will grow.", "Edge with a buried barrier if you need to limit spread.", "Mulch with compost after planting."] },
    grow: { p: [
      "Jerusalem artichokes need almost no care. Water in the first few weeks and during very dry spells, and earth up the stems lightly when they reach 30 cm to improve stability. Tall plants can blow over in strong winds, so cut them back to about 1.5 m in midsummer or support them with stakes and string.",
      "Cut off any flower buds if you want to maximise the tuber crop, though the bright yellow blooms are attractive and loved by pollinators. Slugs eat tubers, and sclerotinia and powdery mildew can affect the stems in damp summers, but severe problems are rare."],
      tips: ["Cut stems to 1.5 m in midsummer to prevent wind rock.", "Remove flower buds for a bigger crop.", "Mulch to suppress weeds.", "Grow them on their own, as they are very competitive."] },
    pests: ["Slugs", "Sclerotinia stem rot", "Powdery mildew", "Wind damage"],
    harvest: { p: [
      "When the foliage has turned brown and died back in October or November, cut the stems down to about 15 cm and lift the tubers with a fork as you need them. They store best in the ground and have thin skins that dry quickly once lifted. Dig carefully, as the knobbly tubers snap easily.",
      "Harvest through to March, then lift all the tubers so the bed does not become overrun, saving some of the smoothest ones to replant. Any small pieces left in the soil will re-sprout, so check carefully if you want to move or clear the bed."],
      tips: ["Leave tubers in the ground until needed.", "Cut stems to 15 cm and use them as markers.", "Pick out every piece if you want to stop regrowth.", "Save your best tubers for replanting."] },
    use: { p: [
      "The tubers have a creamy, nutty flavour a bit like artichoke hearts. Scrub, peel if you wish, and use in soups, roasts, gratins or purées, or slice raw into salads. They are rich in inulin, which can cause wind for some people, so start with small portions and cook them thoroughly. Adding a little lemon juice keeps the cut flesh from browning.",
      "Tubers shrivel quickly once lifted, so dig only what you need. Unwashed tubers keep for one to two weeks in a bag in the fridge, or you can store scrubbed tubers in slightly damp sand. Cooked purée and soup freeze very well."],
      tips: ["Start with small portions, as inulin can cause wind.", "Roast with olive oil, garlic and thyme at 200°C.", "Add lemon juice when cutting to prevent browning.", "Make a velvety soup with stock and cream."] } },
];
