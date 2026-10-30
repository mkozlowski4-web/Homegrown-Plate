/* Soft fruit, bush fruit and tree fruit. All are perennial, so the sow section is "How to plant". */
export const FRUIT = [
  { id: "strawberry", name: "Strawberry", latin: "Fragaria × ananassa", emoji: "🍓", sizes: ["balcony", "small", "medium", "large"], difficulty: "Easy", sowTitle: "How to plant",
    sun: ["full", "partial"], sunText: "Full sun; tolerates light shade",
    facts: [["Type", "Hardy perennial"], ["Sow", "Plant Aug–Sep or Mar–Apr"], ["Height", "15–30 cm"], ["Spacing", "30–45 cm apart in rows 75 cm apart"], ["Planting depth", "Crown level with the soil surface"], ["Time to harvest", "Jun–Jul (summer types); Jul–Oct (perpetual)"], ["Good companions", "Borage, chives, spinach, thyme"]],
    info: [
      "Strawberries are the most popular soft fruit and are easy to grow in beds, pots, hanging baskets and growbags, so suit gardens of every size. Nothing beats the flavour of a fully ripe homegrown berry, warm from the sun.",
      "There are three main types: summer-fruiting varieties give a big crop in June and July, perpetual (everbearing) types fruit lightly from summer to autumn, and alpine strawberries produce tiny, intensely flavoured fruit and tolerate part shade."],
    varieties: ["Cambridge Favourite (reliable, heavy summer cropper)", "Honeoye (early, heavy and sweet)", "Elsanta (large, firm, mid-season)", "Mara des Bois (perpetual, aromatic, wild flavour)", "Albion (perpetual, large, sweet)", "Mignonette (alpine, from seed)"],
    sow: { p: [
      "Plant bare-root runners in late summer (August to September) for the best crop the following summer, or in March–April for a lighter first crop. Potted plants can go in almost any time. Choose a sunny, sheltered spot with fertile, well-drained, slightly acidic soil, and dig in compost before planting.",
      "Plant with the crown (where the leaves emerge) exactly level with the soil: too deep and it rots, too shallow and it dries out. Space 30–45 cm apart, in rows 75 cm apart. In pots, use a 25 cm pot for three plants, or a hanging basket or strawberry tower. Water in well."],
      tips: ["Plant the crown level with the surface.", "Plant in August for the best first crop.", "Buy certified virus-free plants.", "Replace plants every three years."] },
    grow: { p: [
      "Water regularly, especially when the fruits form, but aim at the base, not the fruit. Mulch with straw around the plants just as the fruits begin to swell, to keep berries clean and suppress weeds. Net the plants to keep birds off, and use slug traps or wool pellets.",
      "After the summer harvest, cut off the old foliage 5 cm above the crowns, clear it away, feed with a general fertiliser and remove excess runners. Peg runners into pots of compost to create new plants. Replace plants every three to four years, as the yield falls and viruses build up."],
      tips: ["Mulch with straw as berries form.", "Net against birds.", "Cut back foliage after fruiting.", "Peg runners to make new plants."] },
    pests: ["Slugs and snails", "Birds", "Grey mould (botrytis)", "Vine weevil in pots", "Aphids and viruses"],
    harvest: { p: [
      "Pick strawberries when fully red all over, with no white or green near the stalk, usually from late May or June for summer types. Pick every two days in the warm, preferably in the morning when the fruit is cool. Leave the green calyx and a short stalk on the fruit by pinching the stalk off with your fingernails.",
      "Remove any rotting or mouldy fruit promptly to avoid spreading grey mould. Perpetual types give small flushes through the summer. Avoid picking when wet, which makes fruit rot quicker."],
      tips: ["Pick when fully red.", "Pick with the stalk, not the berry.", "Remove mouldy fruit at once.", "Pick in the cool of morning."] },
    use: { p: [
      "Eat fresh with cream, add to salads and desserts such as Eton mess, pavlova and tarts, or make jam, coulis, sorbet and smoothies. Strawberries pair well with mint, balsamic vinegar and black pepper. Over-ripe fruit is best for jam and sauces.",
      "Fresh strawberries keep for only 1–3 days in the fridge, so use them quickly, and bring them to room temperature before eating. Freeze whole berries on a tray, then bag, for up to a year; they will be soft when thawed, so are best for sauces, smoothies and baking."],
      tips: ["Don’t wash until just before eating.", "Freeze on a tray, then bag.", "Pair with mint or balsamic.", "Use soft berries for jam."] } },

  { id: "raspberry", name: "Raspberry", latin: "Rubus idaeus", emoji: "🍇", sizes: ["small", "medium", "large"], difficulty: "Easy", sowTitle: "How to plant",
    sun: ["full", "partial"], sunText: "Full sun to light shade",
    facts: [["Type", "Hardy perennial cane fruit"], ["Sow", "Plant bare-root canes Nov–Mar"], ["Height", "1.5–1.8 m"], ["Spacing", "45–60 cm apart in rows 1.8 m apart"], ["Planting depth", "Same depth as in the nursery"], ["Time to harvest", "Jun–Jul (summer); Aug–Oct (autumn)"], ["Good companions", "Garlic, chives, marigolds"]],
    info: [
      "Raspberries are among the easiest soft fruits, cropping heavily for ten years or more once established. They are expensive and fragile in shops, so a few canes are well worth growing for freshly picked, perfumed fruit.",
      "Summer-fruiting types crop in June and July, autumn-fruiting types in August to October on the current year’s canes, and are simpler to prune. They tolerate light shade and suit large pots, but they are best in the ground with a simple support."],
    varieties: ["Glen Ample (heavy cropping, summer)", "Tulameen (large, late summer)", "Autumn Bliss (the standard autumn type)", "Polka (large autumn fruit)", "Malling Jewel (traditional summer)", "Fall Gold (yellow, autumn)"],
    sow: { p: [
      "Plant bare-root canes between November and March, when the soil is not frozen or waterlogged. Choose a sunny or lightly shaded site with moist but well-drained, slightly acidic soil, and dig in plenty of compost. Raspberries dislike waterlogging, so use raised beds on heavy soils.",
      "Space canes 45–60 cm apart in rows 1.8 m apart, planting at the same depth as they grew in the nursery. After planting, cut canes to 25 cm above the ground. Install posts and wires (at 60, 90, 120 and 150 cm) to support them, and mulch with compost."],
      tips: ["Plant between November and March.", "Cut canes to 25 cm after planting.", "Put up a post-and-wire support.", "Avoid sites with previous raspberries."] },
    grow: { p: [
      "Mulch each spring with compost or well-rotted manure and water in dry spells, particularly when the fruit forms. Tie in new canes to the wires as they grow. Weed carefully by hand as the roots are shallow, and remove any suckers that appear outside the row.",
      "Prune summer-fruiting types after harvest by cutting all canes that have fruited to the ground, and tie in 6–8 of the best new canes per metre. Autumn-fruiting types are simply cut to the ground in February. Raspberry beetle can infest fruit, and cane diseases can occur in wet soil."],
      tips: ["Cut out fruited canes after harvest (summer types).", "Cut autumn types to the ground in February.", "Mulch each spring.", "Remove suckers outside the row."] },
    pests: ["Raspberry beetle", "Birds", "Cane blight and spur blight", "Raspberry viruses", "Root rot in wet soil"],
    harvest: { p: [
      "Pick raspberries when they are fully coloured and come away easily from the plug (the core remains on the plant). Ripe berries are plump and soft. Pick every two or three days, preferably in the morning when dry, and handle gently.",
      "Berries do not ripen further after picking, so wait until they are fully ripe. Use shallow containers to avoid crushing. Net the plants to protect from birds. Autumn varieties give fruit until the first frosts."],
      tips: ["Pick when they come away easily.", "Pick every 2–3 days.", "Use shallow containers.", "Net against birds."] },
    use: { p: [
      "Eat fresh with cream or yoghurt, in desserts such as cranachan, pavlova and Eton mess, or turn into jam, coulis, ripple sauces, vinegars and liqueurs. They freeze very well. Raspberries pair with chocolate, almonds, peach and lemon.",
      "Fresh berries keep for 2–3 days in the fridge, so use them quickly. Freeze on a tray without washing, then bag for up to a year; frozen raspberries hold their shape better than most berries. Raspberry jam is one of the best preserves."],
      tips: ["Freeze unwashed on a tray.", "Sieve for a seedless coulis.", "Pair with chocolate and almonds.", "Make jam from surplus."] } },

  { id: "blueberry", name: "Blueberry", latin: "Vaccinium corymbosum", emoji: "🫐", sizes: ["balcony", "small", "medium", "large"], difficulty: "Medium", sowTitle: "How to plant",
    sun: ["full", "partial"], sunText: "Full sun to light shade",
    facts: [["Type", "Hardy deciduous shrub"], ["Sow", "Plant Oct–Mar"], ["Height", "1–1.5 m"], ["Spacing", "1–1.5 m apart"], ["Planting depth", "Same depth as in the pot"], ["Time to harvest", "Jul–Sep, from year 2–3"], ["Good companions", "Rhododendron, heather, cranberry"]],
    info: [
      "Blueberries are attractive shrubs with white spring flowers, fine autumn colour and generous crops of nutrient-packed berries. They need acid soil, but grow very happily in pots of ericaceous compost, so any gardener can grow them.",
      "Plant two different varieties for better pollination and bigger crops. Choose early, mid and late varieties for a long season. Compact varieties such as Sunshine Blue and Top Hat are ideal for patios."],
    varieties: ["Bluecrop (reliable, mid-season)", "Duke (early, upright)", "Chandler (very large berries, late)", "Sunshine Blue (compact, good for pots)", "Top Hat (dwarf, ideal for containers)", "Brigitta (late, heavy)"],
    sow: { p: [
      "Plant in autumn or spring in a sunny site. Blueberries need acid soil with a pH of 4.5–5.5; if your soil is neutral or alkaline, grow them in pots of ericaceous (peat-free) compost, in containers of at least 40 cm. Plant two or more varieties for cross-pollination.",
      "In pots, use a mix of ericaceous compost with a layer of crocks for drainage, and plant at the same depth as in the nursery pot. Mulch with pine bark or composted bracken. Water with rainwater, as tap water in hard-water areas gradually raises the pH."],
      tips: ["Use ericaceous compost in pots.", "Water with rainwater where possible.", "Plant two varieties.", "Mulch with bark."] },
    grow: { p: [
      "Keep the soil constantly moist, but not waterlogged, especially while the fruit swells; shallow roots dry out quickly in pots. Feed with an ericaceous fertiliser in spring. Pick off the flowers in the first year to build a stronger bush.",
      "Prune lightly in the first years. From year four, in winter, remove a quarter of the oldest stems to the base, and any weak or crossing growth. Net the bushes as soon as fruit forms, since birds love blueberries. Yellow leaves with green veins signal iron deficiency from high pH."],
      tips: ["Never let pots dry out.", "Feed with ericaceous fertiliser.", "Remove old stems in winter.", "Net against birds."] },
    pests: ["Birds", "Chlorosis (yellow leaves from high pH)", "Vine weevil in pots", "Botrytis in damp summers"],
    harvest: { p: [
      "Berries ripen over several weeks from July, in succession. Wait until they are fully blue all over, with no red tinge, then wait another few days for the best flavour, as they sweeten after turning blue. Ripe berries come off with a gentle roll of the thumb.",
      "Pick every few days. Berries from the top of the bush ripen first. Net the fruit before it starts to colour. Autumn leaf colour in October is a bonus."],
      tips: ["Wait a few days after they turn blue.", "Pick every few days.", "Net early.", "Roll berries off with your thumb."] },
    use: { p: [
      "Eat fresh, add to porridge and yoghurt, bake in muffins, pancakes and pies, or cook into jam, compote and sauces. Blueberries pair with lemon, vanilla, almonds and cream. Their skins are rich in antioxidants and hold their shape when cooked.",
      "Fresh blueberries keep for up to two weeks in the fridge, longer than most fruit. They freeze very well: spread unwashed on a tray, freeze, and bag for up to a year. Dried blueberries are a healthy snack."],
      tips: ["Freeze unwashed on a tray.", "Toss in flour before baking.", "Store dry in the fridge.", "Pair with lemon in cakes."] } },

  { id: "blackcurrant", name: "Blackcurrant", latin: "Ribes nigrum", emoji: "🫐", sizes: ["small", "medium", "large"], difficulty: "Easy", sowTitle: "How to plant",
    sun: ["full", "partial"], sunText: "Full sun to partial shade",
    facts: [["Type", "Hardy deciduous shrub"], ["Sow", "Plant Nov–Mar"], ["Height", "1.5 m"], ["Spacing", "1.5 m apart"], ["Planting depth", "5 cm deeper than in the nursery"], ["Time to harvest", "Jul–Aug, from year 2"], ["Good companions", "Chives, nasturtium, garlic"]],
    info: [
      "Blackcurrants are exceptionally hardy and productive bushes, packed with vitamin C, giving heavy crops of glossy black berries from July. They thrive in the UK’s cool climate and tolerate some shade, and bushes crop reliably for 15 years or more.",
      "They are simple to grow and prune, and the fruit is excellent for jam, cordials and desserts. Compact varieties such as Ben Sarek are suited to smaller plots and large pots."],
    varieties: ["Ben Lomond (late flowering, frost-tolerant)", "Ben Sarek (compact, heavy cropper)", "Ben Connan (large berries, mildew-resistant)", "Big Ben (large, sweet berries)", "Titania (disease-resistant, late)"],
    sow: { p: [
      "Plant bare-root bushes between November and March in a sunny or lightly shaded site with fertile, moisture-retentive soil, enriched with compost. Plant 5 cm deeper than they were in the nursery, as this encourages strong new shoots from the base.",
      "Space bushes 1.5 m apart. After planting, cut all stems down to one bud above the ground; this feels drastic but promotes strong growth. Mulch generously and water in. No fruit will be borne in the first year, but crops begin in year two."],
      tips: ["Plant deeper than in the nursery.", "Cut stems to one bud after planting.", "Enrich the soil with compost.", "Mulch generously."] },
    grow: { p: [
      "Mulch every spring with compost and apply a nitrogen-rich feed such as chicken manure pellets. Water in dry spells while the fruit swells. Net the bushes against birds as the fruit ripens.",
      "Prune in winter after fruiting: remove about a third of the oldest, darkest stems at ground level and cut out weak or low-lying growth, as blackcurrants fruit best on young wood. Big bud mite, which causes swollen buds, and reversion virus are the main problems. Pick off swollen buds in winter."],
      tips: ["Remove a third of old stems each winter.", "Feed with nitrogen in spring.", "Pick off swollen buds.", "Net against birds."] },
    pests: ["Big bud mite", "Birds", "Aphids", "Leaf spot and mildew", "Frost damage to flowers"],
    harvest: { p: [
      "Pick berries when fully black and slightly soft, usually in July and August, with the whole truss at once. Dessert varieties can be picked as they ripen; for jam, the whole strig can be cut off with scissors. Pick on a dry day.",
      "Berries ripen over a couple of weeks, and the whole bush can be harvested in one or two sessions. Berries can be left on the bush for a short time, but birds will find them, so net them early."],
      tips: ["Pick on a dry day.", "Cut whole trusses for speed.", "Net early.", "Wait until fully black."] },
    use: { p: [
      "Blackcurrants are tart and strongly flavoured, so they suit cooking more than eating raw. Make jam (they set well), cordial, crumbles, pies, compotes, sorbets and sauces, or the classic summer pudding. Add sugar to taste. Remove the ‘tops and tails’ if you like, though it is not strictly necessary for jam.",
      "Fresh berries keep for a week in the fridge. They freeze brilliantly: strip from the truss with a fork, freeze on a tray, then bag, and use straight from frozen. Blackcurrant cordial can be frozen or bottled."],
      tips: ["Strip from the truss with a fork.", "Freeze whole and cook from frozen.", "Make cordial for winter colds.", "Add sugar to taste."] } },

  { id: "redcurrant", name: "Redcurrant", latin: "Ribes rubrum", emoji: "🍒", sizes: ["balcony", "small", "medium", "large"], difficulty: "Easy", sowTitle: "How to plant",
    sun: ["full", "partial", "shade"], sunText: "Sun or shade; one of the best fruits for a north wall",
    facts: [["Type", "Hardy deciduous shrub"], ["Sow", "Plant Nov–Mar"], ["Height", "1.2–1.5 m"], ["Spacing", "1.2–1.5 m apart (cordons 30–40 cm)"], ["Planting depth", "Same depth as in the nursery"], ["Time to harvest", "Jul–Aug, from year 2"], ["Good companions", "Chives, nasturtium"]],
    info: [
      "Redcurrants are among the most trouble-free fruits and tolerate partial shade, making them useful for a spot where little else will crop. The translucent red berries hang in jewel-like trusses and are delicious in preserves, sauces and desserts.",
      "Bushes can be trained as cordons against a fence or wall, saving space, and suit small gardens. White currants are a similar, sweeter relative. Plants live for 20 years and rarely suffer from frost damage."],
    varieties: ["Jonkheer van Tets (early, heavy-cropping)", "Rovada (late, long trusses)", "Junifer (very early)", "Stanza (late, dessert)", "White Versailles (white currant, sweet)"],
    sow: { p: [
      "Plant bare-root bushes between November and March in moisture-retentive, fertile soil, in sun or partial shade. Space bushes 1.2–1.5 m apart, or cordons 30–40 cm apart against a fence or wall. Plant at the same depth as in the nursery, with the stem clear of the soil.",
      "Use a ‘leg’ of 10–15 cm of clear stem, as this makes picking and pruning easier. Cut back the stems by half after planting to encourage a good framework. Mulch with compost and water in well. Redcurrants also grow in 30 cm pots."],
      tips: ["Plant in sun or shade.", "Cut stems by half after planting.", "Train as cordons to save space.", "Mulch well."] },
    grow: { p: [
      "Water in dry spells and mulch each spring with compost. Redcurrants fruit on spurs on older wood, unlike blackcurrants. In winter, prune the main branches by half of the new growth, and cut side shoots back to two buds, to create an open, goblet-shaped bush. Cordons are summer-pruned in July.",
      "Net the bushes before the fruit starts to colour, because birds adore them. Currant blister aphid, which makes red blisters on the leaves, and sawfly caterpillars, which strip the leaves in spring, are the main pests; hand-pick the caterpillars."],
      tips: ["Prune to open, spurred branches in winter.", "Net before the berries colour.", "Look for sawfly caterpillars in spring.", "Mulch each year."] },
    pests: ["Currant sawfly", "Currant blister aphid", "Birds", "Coral spot fungus on dead wood"],
    harvest: { p: [
      "Pick whole trusses in July and August when the berries are fully red and glossy, using scissors or by pulling the truss off the stem. Fruits will hang on the bush for weeks if netted, which extends the season. Pick when dry.",
      "Handle trusses gently, as the berries are fragile, and hold the stalk, not the berries. Berries in the shade stay on the bush longer and keep the flavour. White varieties are sweeter and better eaten fresh."],
      tips: ["Pick whole trusses.", "Handle gently.", "Pick when dry.", "Net to keep fruit on the bush for longer."] },
    use: { p: [
      "Redcurrants are tart, so they are best used in cooking: make jelly (the classic accompaniment for lamb and game), sauces such as Cumberland sauce, jam, coulis, tarts and summer pudding. A few fresh sprigs make a lovely decoration on desserts and cocktails.",
      "Fresh trusses keep for up to a week in the fridge. To freeze, leave the berries on their stalks on a tray, freeze, then strip off with a fork and pack. Redcurrant jelly keeps for a year."],
      tips: ["Make jelly with lamb or game.", "Freeze trusses and strip with a fork.", "Garnish desserts with fresh sprigs.", "Pair with raspberries."] } },

  { id: "gooseberry", name: "Gooseberry", latin: "Ribes uva-crispa", emoji: "🟢", sizes: ["small", "medium", "large"], difficulty: "Easy", sowTitle: "How to plant",
    sun: ["full", "partial"], sunText: "Full sun to partial shade",
    facts: [["Type", "Hardy deciduous thorny shrub"], ["Sow", "Plant Nov–Mar"], ["Height", "1–1.5 m"], ["Spacing", "1.5 m apart"], ["Planting depth", "Same depth as in the nursery"], ["Time to harvest", "May–Jul, from year 2"], ["Good companions", "Chives, tansy, nasturtium"]],
    info: [
      "Gooseberries are one of the first soft fruits of the year, from late May, and are tough, hardy and adaptable plants, tolerating shade and cold. Green cooking varieties are tart and wonderful in puddings, while red and yellow dessert types are sweet enough to eat raw.",
      "Bushes are thorny, which makes picking a challenge, but also deters wildlife and works as a barrier. They can be trained as standards or cordons, or grown in large pots, and they rarely suffer from frost."],
    varieties: ["Invicta (heavy, mildew-resistant, green)", "Hinnonmaki Red (sweet, red, mildew-resistant)", "Hinnonmaki Yellow (yellow, sweet)", "Captivator (almost thornless, red)", "Whinham’s Industry (dark red, dessert)"],
    sow: { p: [
      "Plant bare-root bushes between November and March in a sunny or lightly shaded position in fertile, well-drained soil. Gooseberries dislike very wet or very dry soil. Space bushes 1.5 m apart, and plant at the same depth as in the nursery, leaving a clear ‘leg’ of 15 cm.",
      "After planting, cut back stems by half, to an outward-facing bud. Mulch with well-rotted compost and keep weeds down. Choose mildew-resistant varieties, since American gooseberry mildew is the main disease."],
      tips: ["Choose mildew-resistant varieties.", "Leave a 15 cm clear stem.", "Cut stems by half at planting.", "Avoid very wet soil."] },
    grow: { p: [
      "Mulch each spring and water in dry spells, particularly when the fruit is forming. Prune in winter to an open, goblet shape, cutting back new growth by half and side shoots to two buds. Thin the fruits in May: picking every other berry as a ‘thinning’ gives larger berries and the thinnings are good to cook.",
      "Gooseberry sawfly caterpillars can strip a bush in a few days in spring, so check regularly from April and remove by hand. American gooseberry mildew leaves white powder on fruits and shoots; prune out affected tips and keep the bush open to air flow."],
      tips: ["Thin berries in May and use the thinnings.", "Check for sawfly from April.", "Prune to keep air flowing.", "Mulch every spring."] },
    pests: ["Gooseberry sawfly", "American gooseberry mildew", "Birds", "Aphids"],
    harvest: { p: [
      "Pick cooking gooseberries when they are hard and green, from late May, when still tart, and later pick the rest to ripen for sweetening. Dessert types are ready in July when soft and coloured. Wear thick gloves and long sleeves, and use scissors for awkward berries.",
      "Pick in two goes: thin the bush in May for cooking, and leave the rest to ripen for eating raw. Berries keep on the bush for a while, but birds and wasps may take them."],
      tips: ["Wear gloves.", "Pick half green and leave half to ripen.", "Top and tail before cooking.", "Net if birds are a problem."] },
    use: { p: [
      "Cook green gooseberries with sugar into crumbles, pies, fools, sauces (classic with mackerel), chutneys and jam. A sprig of elderflower in the pan adds a beautiful muscat flavour. Ripe dessert types are lovely raw, in fruit salads and with cream.",
      "Fresh gooseberries keep for a week in the fridge. They freeze well: top and tail, freeze on a tray and bag for up to a year, and cook from frozen. Gooseberry jam and chutney are good for storing a glut."],
      tips: ["Add elderflower when stewing.", "Top and tail before cooking.", "Freeze on a tray and bag.", "Serve the sauce with oily fish."] } },

  { id: "blackberry", name: "Blackberry", latin: "Rubus fruticosus", emoji: "🫐", sizes: ["small", "medium", "large"], difficulty: "Easy", sowTitle: "How to plant",
    sun: ["full", "partial", "shade"], sunText: "Full sun to shade; tolerates poor sites",
    facts: [["Type", "Hardy perennial cane fruit"], ["Sow", "Plant Nov–Mar"], ["Height", "1.8–3 m (trained)"], ["Spacing", "2–4 m apart (thornless types need more space)"], ["Planting depth", "Same depth as in the nursery"], ["Time to harvest", "Aug–Oct"], ["Good companions", "Chives, garlic"]],
    info: [
      "Cultivated blackberries are bigger, juicier and less seedy than wild ones, and the thornless varieties are easy to pick. They crop heavily in late summer and autumn, and grow in a wide range of conditions, including partial shade and poor soil.",
      "They are vigorous climbers best trained along a wire fence, trellis or wall, and a single plant can cover several metres. They are ideal for hiding eyesores and for wildlife-friendly gardens, as the flowers and fruits are loved by pollinators and birds."],
    varieties: ["Loch Ness (thornless, heavy and sweet)", "Oregon Thornless (thornless, decorative leaves)", "Apache (large, thornless, upright)", "Waldo (compact, thornless)", "Reuben (autumn-fruiting, very large)"],
    sow: { p: [
      "Plant bare-root or potted canes between November and March in a sunny or partially shaded spot with fertile, well-drained soil. Dig in plenty of compost. Space plants 2–4 m apart depending on vigour, as they can spread widely.",
      "Install posts and horizontal wires at 1 m, 1.5 m and 1.8 m. After planting, cut the cane to 20–30 cm above the ground. Water in well and mulch around the base. Compact varieties such as Waldo can be grown in large pots."],
      tips: ["Set up wires before planting.", "Cut canes to 25 cm after planting.", "Allow plenty of room.", "Choose thornless varieties for easy picking."] },
    grow: { p: [
      "Mulch each spring with compost and water in dry periods. Tie in new canes to the wires as they grow, keeping new growth separate from the old canes that will fruit this year: tie the new growth to one side and the fruiting canes to the other.",
      "After fruiting, cut the old canes that bore fruit to the ground, and tie in the new canes to replace them. This is the main pruning job. Birds and wasps will take the fruit, and cane spot or botrytis can occur in wet years; good air flow helps."],
      tips: ["Train new canes separately from fruiting ones.", "Cut out fruited canes after harvest.", "Mulch each spring.", "Keep ties loose to avoid girdling."] },
    pests: ["Raspberry beetle", "Birds and wasps", "Botrytis", "Cane spot", "Spotted wing drosophila"],
    harvest: { p: [
      "Pick blackberries when fully black and glossy, and they come off the plant with a gentle tug; unripe ones are shiny and stay stuck. Berries ripen gradually from August to October, so pick every few days. Ripe berries are soft and sweet.",
      "Pick in the morning on a dry day, and handle gently, as berries bruise easily. Use shallow containers and do not stack deeply. Wear gloves and sleeves for thorny types."],
      tips: ["Pick when fully black and soft.", "Pick every few days.", "Use shallow containers.", "Pick on a dry day."] },
    use: { p: [
      "Eat fresh with cream or yoghurt, or cook in crumbles, pies, jams, jellies, sauces and cordials. Blackberries and apple is a classic autumn pairing. They also make wonderful ice cream, syrup, and brambly vinegars, and bring colour to puddings.",
      "Fresh berries keep for only 2–3 days in the fridge, so process quickly. Freeze unwashed on a tray, then bag for up to a year, and use straight from the freezer in crumbles and jam. Bottled blackberry syrup and jelly store well on a shelf."],
      tips: ["Pair with apple in crumbles.", "Freeze on a tray and bag.", "Make jelly from surplus.", "Sieve for seedless syrup."] } },

  { id: "apple", name: "Apple", latin: "Malus domestica", emoji: "🍎", sizes: ["small", "medium", "large"], difficulty: "Medium", sowTitle: "How to plant",
    sun: ["full", "partial"], sunText: "Full sun; sheltered from strong wind",
    facts: [["Type", "Hardy deciduous tree"], ["Sow", "Plant bare-root trees Nov–Mar"], ["Height", "2–5 m, depending on rootstock"], ["Spacing", "1.2–5 m apart, depending on form and rootstock"], ["Planting depth", "Graft union 5 cm above soil"], ["Time to harvest", "Aug–Nov, from year 2–4"], ["Good companions", "Chives, nasturtium, daffodils"]],
    info: [
      "Apples are the great British fruit tree, with thousands of varieties adapted to our climate and a wide range of flavours, from crisp sweet eaters to sharp cookers. A single tree on a dwarf rootstock gives bumper crops in a small garden or a large pot.",
      "Most apples need a pollination partner flowering at the same time, so choose compatible varieties, or take advantage of neighbours’ trees and crab apples. Trees can be trained as cordons, espaliers or fans to save space, making them suitable even for small gardens."],
    varieties: ["Discovery (early, crisp, red-flushed)", "Egremont Russet (nutty, stores well)", "Cox’s Orange Pippin (classic flavour, needs care)", "Bramley’s Seedling (the cooking apple, self-sterile)", "Sunset (Cox-like, more reliable)", "James Grieve (dual purpose, early)"],
    sow: { p: [
      "Plant bare-root trees from November to March, when the soil is not frozen or waterlogged, in a sunny, sheltered site with fertile, well-drained soil. Container-grown trees can be planted year round if watered well. Choose rootstock for the space: M27 (very dwarf, pots), M9 (dwarf), M26 (semi-dwarf), MM106 (medium).",
      "Dig a hole wide enough to spread the roots, drive in a stake, plant so the graft union is 5 cm above ground, and firm in. Tie to the stake with a tree tie and water well. Mulch around the base, leaving the trunk clear. In grass, keep a 1 m circle weed-free."],
      tips: ["Choose a rootstock to suit your space.", "Keep the graft union above soil.", "Stake the tree firmly.", "Check pollination partners."] },
    grow: { p: [
      "Water newly planted trees regularly for the first two years, particularly in dry spells. Mulch each spring and feed with a general fertiliser. Prune in winter (November to March) to an open framework, removing dead, diseased or crossing branches and shortening new growth; spur-bearing types are pruned on a regular, light basis. Summer-prune trained forms in August.",
      "Thin fruitlets in June to one per cluster, 10–15 cm apart, for larger apples and to prevent biennial cropping. Codling moth (maggots in fruit), apple scab, canker and aphids are the common problems. Pheromone traps catch codling moths, and clearing fallen leaves reduces scab."],
      tips: ["Thin fruitlets in June.", "Prune in winter.", "Clear fallen leaves to reduce scab.", "Water young trees well."] },
    pests: ["Codling moth", "Apple scab", "Canker", "Aphids", "Brown rot", "Birds in winter"],
    harvest: { p: [
      "Apples are ready when they come away easily with a gentle lift and twist; the pips turn brown and the fruit has full colour. Early varieties ripen in August and September and should be eaten soon, while late varieties are picked in October and stored. Don’t pull, as it will damage spurs.",
      "Pick carefully to avoid bruising and handle each apple like an egg. Windfalls are good for immediate cooking but won’t store. Late-season apples often improve in flavour during storage and are best left on the tree as long as frost allows."],
      tips: ["Lift and twist: ripe fruit comes away easily.", "Handle gently to avoid bruising.", "Eat early varieties quickly.", "Store late varieties."] },
    use: { p: [
      "Eat dessert apples fresh, in salads and slaws, or slice them for baking. Cookers such as Bramley collapse into a fluffy purée for pies, crumbles, sauces and chutneys. Apples can be juiced and made into cider, jelly, and dried rings. They pair well with cheese, pork, cinnamon and blackberries.",
      "Store sound, unbruised late apples in a cool (3–5°C), dark, frost-free place such as a garage or shed, wrapped in newspaper or in trays with space between. Check weekly and remove any that rot. Many varieties keep until February to March. Cooked apple purée freezes well."],
      tips: ["Wrap late apples individually for storage.", "Check stored fruit weekly.", "Freeze purée in portions.", "Juice windfalls."] } },

  { id: "plum", name: "Plum", latin: "Prunus domestica", emoji: "🟣", sizes: ["medium", "large"], difficulty: "Medium", sowTitle: "How to plant",
    sun: ["full"], sunText: "Full sun; sheltered, ideally south-facing",
    facts: [["Type", "Hardy deciduous tree"], ["Sow", "Plant Nov–Mar, or container trees in spring"], ["Height", "3–5 m (fans 2–3 m)"], ["Spacing", "3–5 m apart"], ["Planting depth", "Graft union 5 cm above soil"], ["Time to harvest", "Aug–Sep, from year 3–4"], ["Good companions", "Chives, nasturtium, comfrey"]],
    info: [
      "Plums, damsons and gages are among the most rewarding tree fruits, with a juicy, sweet flesh and a rich flavour you rarely find in shops. Many varieties are self-fertile, so a single tree gives good crops without a pollination partner.",
      "Plums flower early, so a sheltered spot is important; blossom damaged by late frost is the main cause of poor crops. Fan-trained trees on a sunny wall are space-saving and well protected, and compact rootstocks such as Pixy suit smaller gardens."],
    varieties: ["Victoria (the classic, self-fertile, heavy)", "Marjorie’s Seedling (late, self-fertile, good in the north)", "Czar (early cooker, hardy, self-fertile)", "Opal (early, sweet dessert, self-fertile)", "Cambridge Gage (excellent flavour, self-fertile)", "Merryweather (damson, self-fertile)"],
    sow: { p: [
      "Plant bare-root trees in November to March, or container-grown trees in spring, in a sunny, sheltered, frost-free spot with fertile, well-drained soil. Avoid frost pockets at the bottom of slopes, since blossom is very susceptible to late frosts.",
      "Stake firmly and plant with the graft union 5 cm above ground level. Water well and mulch around the trunk. Plums are pruned in spring or summer, never winter, to avoid silver leaf disease. Fan-trained trees need a frame of horizontal wires on a warm wall or fence."],
      tips: ["Avoid frost pockets.", "Never prune in winter.", "Choose self-fertile varieties.", "Fan-train against a sunny wall for shelter."] },
    grow: { p: [
      "Water well in the first years and in dry spells, and mulch each spring. Prune in spring or summer only, when the sap is rising, to lessen the risk of silver leaf and bacterial canker. Remove dead, diseased and crossing branches, and keep the centre open.",
      "In good years, trees overload, so thin fruitlets in June to 5–8 cm apart, preventing broken branches and improving the size. Support heavy-laden branches. Plum moth causes maggots in fruit, aphids attack young leaves, and wasps attack ripe fruit. Brown rot is common in wet weather."],
      tips: ["Prune only from spring to late summer.", "Thin fruitlets in June.", "Support laden branches.", "Pick off brown-rot fruit."] },
    pests: ["Plum moth", "Silver leaf", "Bacterial canker", "Aphids", "Brown rot", "Wasps"],
    harvest: { p: [
      "Plums are ready from August to September, depending on variety. They should be fully coloured and slightly soft, and come away from the tree with a gentle twist. Pick over several visits, since a tree’s fruit ripens over two or three weeks. Cooking plums can be picked a little earlier.",
      "Leave dessert plums to ripen on the tree for the best sugar. Handle the delicate skin carefully, as bruises spoil the fruit. Pick regularly to reduce wasp and brown-rot damage, and remove rotten fruit."],
      tips: ["Pick over several visits.", "Leave dessert plums to ripen fully.", "Handle gently.", "Remove rotten fruit."] },
    use: { p: [
      "Eat ripe plums fresh, or bake in tarts, crumbles, cakes and clafoutis, roast with spices, or turn into jam, chutney, sauces (such as Chinese plum sauce) and plum gin. Damsons are tart and ideal for jam, cheese and gin. Plums pair well with almonds, cinnamon and duck.",
      "Ripe plums keep 3–5 days in the fridge. To freeze, halve and stone, freeze on a tray and bag for up to a year. Plum jam and chutney preserve gluts nicely, and plums can be bottled in syrup or dried into prunes in a low oven."],
      tips: ["Halve and stone before freezing.", "Roast with cinnamon.", "Make damson gin in autumn.", "Preserve gluts as chutney."] } },

  { id: "fig", name: "Fig", latin: "Ficus carica", emoji: "🟤", sizes: ["balcony", "small", "medium", "large"], difficulty: "Medium", sowTitle: "How to plant",
    sun: ["full"], sunText: "Full sun; a warm, sheltered, south-facing wall is ideal",
    facts: [["Type", "Hardy-ish deciduous tree or shrub"], ["Sow", "Plant Mar–Apr, or container trees in spring"], ["Height", "2–3 m (restricted); more if unrestricted"], ["Spacing", "2.5–3 m apart"], ["Planting depth", "Same depth as in the pot"], ["Time to harvest", "Aug–Oct, from year 2–3"], ["Good companions", "Lavender, thyme"]],
    info: [
      "Figs are surprisingly happy in the UK, especially in the south, with a warm wall and a restricted root run. Their bold lobed leaves are very ornamental, and the sweet, honeyed fruits are a delicacy you rarely taste at their best in a shop.",
      "Restricting the roots, in a large pot or a pit lined with paving slabs, encourages fruit rather than leaves. Only the figs that form in late summer and overwinter as embryo fruit need protecting; the following year they ripen. Figs are self-fertile, so one tree is enough."],
    varieties: ["Brown Turkey (hardy and reliable, the usual UK choice)", "Brunswick (large fruits, hardy)", "Little Miss Figgy (compact, perfect for pots)", "White Marseilles (pale, sweet, good in warm sites)", "Rouge de Bordeaux (compact, good in pots)"],
    sow: { p: [
      "Plant in spring in a hot, sunny, sheltered spot, ideally against a south- or west-facing wall. For good fruiting, restrict the roots by planting in a 40–50 cm pot, or in a pit 60 cm square lined with concrete slabs or thick plastic, with rubble in the bottom for drainage.",
      "Use a loam-based compost such as John Innes No. 3 mixed with grit. Plant at the same depth as in the nursery pot and water well. Keep potted figs in the sunniest spot, and move to a sheltered location or wrap with fleece in cold winters."],
      tips: ["Restrict the roots for more fruit.", "Choose a warm, sunny wall.", "Use gritty, free-draining compost.", "Wrap potted trees in winter."] },
    grow: { p: [
      "Water potted figs regularly through the summer, and feed with a high-potash fertiliser every two weeks from the time fruit forms. Pot-grown figs dry out quickly in a heatwave. Repot into a slightly larger pot every few years, or refresh the top 5 cm of compost annually.",
      "In late autumn, remove all fruit larger than a pea (they will not survive winter), and keep the pea-sized fruit that will ripen next year. Protect with fleece or straw in cold areas. Prune in spring to keep the shape, removing damaged shoots, and in early summer pinch out new shoot tips to five leaves."],
      tips: ["Remove large unripe figs in late autumn.", "Feed with potash in summer.", "Wrap in fleece for winter.", "Pinch out shoot tips in summer."] },
    pests: ["Frost damage", "Coral spot on dead wood", "Red spider mite under glass", "Wasps and birds", "Fruit drop from irregular watering"],
    harvest: { p: [
      "Figs are ripe in August to October when the fruit droops on its stalk, the skin is soft, slightly wrinkled and coloured, and a drop of nectar may appear at the base. Gently twist or cut the stalk to pick. An unripe fig will not continue to ripen after picking.",
      "Pick figs when you are ready to eat them, as they bruise easily and keep poorly. Wear gloves, since the sap can irritate skin. Cover trees with netting to keep birds and wasps from ripe fruit."],
      tips: ["Pick when drooping and soft.", "Wear gloves for the sap.", "Net against birds.", "Eat soon after picking."] },
    use: { p: [
      "Eat figs fresh, on their own or with cheese such as goat’s cheese, blue cheese or mozzarella, with ham, honey or yoghurt. Roast or grill halved figs with honey, make jam, chutney, or bake them in tarts and cakes. Dried figs, made in a low oven, keep well.",
      "Ripe figs keep only 2–3 days in the fridge, so eat or process them quickly. They freeze whole or halved on a tray, then bagged, for up to a year, for use in baking or sauces. Fig jam keeps for a year."],
      tips: ["Roast with honey and thyme.", "Pair with goat’s cheese.", "Freeze whole on a tray.", "Make jam from a glut."] } },
];
