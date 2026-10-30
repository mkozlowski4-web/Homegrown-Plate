/* Variety groups: crops that are grown as distinct types with different timings.
   Merged onto the plant with the same id in plants.mjs. Each group needs:
   name, when (a one-line timing summary), note (what makes the group different) and varieties. */
export const GROUPS = {
  potato: {
    groupsIntro: 'Potatoes are sold in three groups, based on how long they take to mature. Growing one of each spreads your harvest from June to October.',
    groups: [
      { name: 'First earlies', when: 'Plant mid-March to April · Harvest June to July (10–12 weeks)', note: 'Quick-maturing, small to medium new potatoes with thin skins and a waxy, sweet flavour. They are lifted before blight arrives and do not store, so eat them fresh. Ideal for pots and bags.', varieties: ['Rocket', 'Swift', 'Arran Pilot', 'Duke of York', 'Epicure'] },
      { name: 'Second earlies', when: 'Plant late March to April · Harvest July to August (13–15 weeks)', note: 'A slightly larger, heavier crop than first earlies, just as good boiled or in salads. Many are at their best in July and can be stored for a few weeks.', varieties: ['Charlotte', 'Maris Peer', 'Kestrel', 'Nadine', 'Wilja'] },
      { name: 'Maincrop', when: 'Plant mid-April to May · Harvest September to October (18–20 weeks)', note: 'The biggest yields and the best keepers. Lift in autumn once the foliage dies back, cure the skins and store them in the dark for winter. Best for roasting, chips, baking and mash, and they need the most space.', varieties: ['Maris Piper', 'King Edward', 'Desiree', 'Sarpo Mira (blight-resistant)', 'Pink Fir Apple (late salad)'] },
    ] },
  pea: {
    groupsIntro: 'Peas are sorted by sowing time and pod type, which decides when you pick them.',
    groups: [
      { name: 'Earlies (round-seeded)', when: 'Sow March to April · Harvest June (11–12 weeks)', note: 'Hardy, quick and compact, with sweet small peas. The best choice for the first sowings and for overwintering.', varieties: ['Feltham First', 'Meteor', 'Kelvedon Wonder'] },
      { name: 'Maincrop (wrinkled)', when: 'Sow April to June · Harvest July to September (12–14 weeks)', note: 'Taller plants and heavier crops of sweeter peas, but less hardy. They need support.', varieties: ['Hurst Green Shaft', 'Onward', 'Alderman (tall)'] },
      { name: 'Mangetout and sugar snap', when: 'Sow April to June · Harvest July to September', note: 'Eaten whole, picked young. Sugar snaps have plump, crisp pods; mangetout have flat, tender ones.', varieties: ['Oregon Sugar Pod', 'Sugar Ann', 'Delikata'] },
    ] },
  carrot: {
    groupsIntro: 'Carrots are grouped by how fast they mature, and by their shape.',
    groups: [
      { name: 'Earlies', when: 'Sow March to May · Harvest June to August', note: 'Short, sweet, quick roots for baby carrots. Sow under cloches in March for the first pickings.', varieties: ['Early Nantes', 'Amsterdam Forcing', 'Paris Market (round)'] },
      { name: 'Maincrop', when: 'Sow May to July · Harvest September to November', note: 'Longer, heavier roots that store well. Sow after the main carrot fly flight in May, and lift before hard frosts.', varieties: ['Autumn King', 'Berlicum', 'Chantenay Red Cored'] },
      { name: 'Coloured and fly-resistant', when: 'Sow April to July', note: 'Purple, yellow and white carrots for interest, and partly carrot-fly-resistant types for troubled sites.', varieties: ['Purple Haze', 'Flyaway', 'Yellowstone'] },
    ] },
  onion: {
    groupsIntro: 'Onions can be started from sets (small bulbs) or seed, in spring or autumn.',
    groups: [
      { name: 'Spring-planted sets', when: 'Plant March to April · Harvest July to September', note: 'The simplest method. Small bulbs give reliable bulbs for storing through winter.', varieties: ['Sturon', 'Stuttgarter Giant', 'Red Baron'] },
      { name: 'Autumn-planted (overwintering) sets', when: 'Plant September to October · Harvest June to July', note: 'Hardy types that fill the gap before spring-planted onions are ready. They do not store as long.', varieties: ['Radar', 'Electric', 'Senshyu Yellow'] },
      { name: 'Grown from seed', when: 'Sow January to March indoors · Harvest August to September', note: 'Cheaper and gives larger onions, including show types, but needs a longer season.', varieties: ['Ailsa Craig', 'Bedfordshire Champion', 'Kelsae'] },
    ] },
  garlic: {
    groupsIntro: 'There are two main kinds of garlic, which suit different growing and storage needs.',
    groups: [
      { name: 'Hardneck', when: 'Plant October to December · Harvest June to July', note: 'Stronger flavour and a flower stalk (scape) you can eat. Hardier, but stores only 4–6 months.', varieties: ['Germidour', 'Music', 'Purple Wight'] },
      { name: 'Softneck', when: 'Plant November to March · Harvest July to August', note: 'Milder flavour, plaits well, and stores for 8–12 months. Best for storing and for milder areas.', varieties: ['Solent Wight', 'Early Purple Wight', 'Albigensian Wight'] },
    ] },
  cabbage: {
    groupsIntro: 'Cabbages are grouped by the season you eat them, so you can have fresh cabbage nearly all year.',
    groups: [
      { name: 'Spring cabbage', when: 'Sow July to August · Harvest March to May', note: 'Loose, pointed heads (or spring greens), planted out in autumn to overwinter.', varieties: ['April', 'Pyramid', 'Duncan'] },
      { name: 'Summer and autumn cabbage', when: 'Sow March to May · Harvest July to November', note: 'Round, tender heads, best eaten fresh. Red cabbages sit here too.', varieties: ['Greyhound', 'Hispi', 'Primo', 'Red Jewel'] },
      { name: 'Winter cabbage', when: 'Sow April to May · Harvest October to February', note: 'Solid, frost-hardy heads that stand in the garden or store in a cool place. Savoys are the hardiest.', varieties: ['January King', 'Savoy Siberia', 'Tundra'] },
    ] },
  lettuce: {
    groupsIntro: 'Lettuce comes in several leaf types, each suited to a different season and use.',
    groups: [
      { name: 'Cut-and-come-again (loose-leaf)', when: 'Sow March to August · Harvest from 4–8 weeks', note: 'Pick leaves repeatedly from one plant. The easiest and most forgiving type.', varieties: ['Salad Bowl', 'Lollo Rosso', 'Oak Leaf'] },
      { name: 'Hearting (cos, butterhead, crisphead)', when: 'Sow March to August · Harvest 8–12 weeks', note: 'Cut whole heads. Little Gem is the best compact cos; butterheads are soft and sweet.', varieties: ['Little Gem', 'Tom Thumb', 'Webbs Wonderful'] },
      { name: 'Hardy winter lettuce', when: 'Sow September to October under cover · Harvest March to April', note: 'Slow but tough types for overwintering in a cold frame or greenhouse.', varieties: ['Winter Density', 'Arctic King', 'Valdor'] },
    ] },
  tomato: {
    groupsIntro: 'Tomatoes are grouped by growth habit, which affects how you grow and support them, and by fruit size.',
    groups: [
      { name: 'Cordon (indeterminate)', when: 'Sow February to April · Harvest July to October', note: 'Tall single stems tied to a cane, with side shoots pinched out. The longest cropping season, in a greenhouse or sunny spot.', varieties: ['Alicante', 'Moneymaker', 'Sungold', 'Ailsa Craig'] },
      { name: 'Bush (determinate)', when: 'Sow March to April · Harvest August to September', note: 'Compact, self-limiting plants that need no pinching out. Ideal for pots and outdoors.', varieties: ['Red Alert', 'Totem', 'Latah'] },
      { name: 'Trailing and basket', when: 'Sow March to April · Harvest July to September', note: 'Cascading cherry types for hanging baskets and window boxes.', varieties: ['Tumbling Tom', 'Garden Pearl', 'Hundreds and Thousands'] },
    ] },
  strawberry: {
    groupsIntro: 'Strawberries are grouped by when they fruit.',
    groups: [
      { name: 'Summer-fruiting', when: 'Harvest June to July (early, mid, late varieties)', note: 'One heavy crop. Choose early, mid and late varieties to extend the season to about six weeks.', varieties: ['Honeoye (early)', 'Cambridge Favourite (mid)', 'Elsanta (mid)', 'Symphony (late)'] },
      { name: 'Perpetual (everbearing)', when: 'Harvest July to October', note: 'Lighter crops over a long period. Good for pots and small spaces.', varieties: ['Mara des Bois', 'Albion', 'Flamenco'] },
      { name: 'Alpine', when: 'Harvest June to October', note: 'Tiny, intensely flavoured fruits that tolerate partial shade and grow from seed.', varieties: ['Mignonette', 'Alexandria', 'Yellow Wonder'] },
    ] },
  raspberry: {
    groupsIntro: 'Raspberries are summer- or autumn-fruiting, which changes how you prune them.',
    groups: [
      { name: 'Summer-fruiting', when: 'Harvest June to July', note: 'Fruit on last year’s canes. Cut the fruited canes to the ground after harvest and tie in the new ones.', varieties: ['Glen Ample', 'Malling Jewel', 'Tulameen'] },
      { name: 'Autumn-fruiting', when: 'Harvest August to October', note: 'Fruit on this year’s canes. Simply cut everything to the ground in February.', varieties: ['Autumn Bliss', 'Polka', 'Fall Gold (yellow)'] },
    ] },
  apple: {
    groupsIntro: 'Apples are grouped by when they ripen and how well they keep, then by use.',
    groups: [
      { name: 'Early (August to September)', when: 'Eat straight from the tree · Do not store', note: 'Juicy, refreshing, and short-lived. Pick as they ripen and eat within days.', varieties: ['Discovery', 'Beauty of Bath', 'George Cave'] },
      { name: 'Mid-season (September to October)', when: 'Eat within a few weeks', note: 'Good all-rounders that keep for a month or so in a cool place.', varieties: ['James Grieve', 'Sunset', 'Egremont Russet'] },
      { name: 'Late (October onwards)', when: 'Pick in October · Store until spring', note: 'Hard and sharp when picked, mellowing in store. Keep in a cool, dark, frost-free place.', varieties: ['Bramley’s Seedling (cooker)', 'Braeburn', 'Ashmead’s Kernel'] },
    ] },
  plum: {
    groupsIntro: 'Plums, gages and damsons ripen at different times and suit different uses.',
    groups: [
      { name: 'Early plums', when: 'Harvest August', note: 'Quick-ripening dessert types.', varieties: ['Opal', 'Early Rivers'] },
      { name: 'Mid and late plums', when: 'Harvest late August to September', note: 'Heavy croppers for eating, cooking and freezing.', varieties: ['Victoria', 'Marjorie’s Seedling', 'Czar (cooking)'] },
      { name: 'Gages and damsons', when: 'Harvest September to October', note: 'Gages are sweet and rich; damsons are sharp and ideal for jam and gin.', varieties: ['Cambridge Gage', 'Merryweather (damson)'] },
    ] },
  'broad-bean': {
    groupsIntro: 'Broad beans are sown in autumn or spring, with tall and dwarf types.',
    groups: [
      { name: 'Autumn-sown (hardy)', when: 'Sow October to November · Harvest May to June', note: 'The earliest crop, from hardy Longpod types. Best in mild, sheltered areas.', varieties: ['Aquadulce Claudia', 'Super Aquadulce'] },
      { name: 'Spring-sown', when: 'Sow February to April · Harvest June to July', note: 'Larger crops and more plants. Choose Longpod for the most beans per pod or Windsor for a sweeter flavour.', varieties: ['Bunyard’s Exhibition', 'Imperial Green Longpod', 'The Sutton (dwarf)'] },
    ] },
  pear: {
    groupsIntro: 'Pears are grouped by when they ripen. Most are picked hard and ripened indoors.',
    groups: [
      { name: 'Early pears', when: 'Pick late August to September · Eat within days', note: 'Juicy but short-lived. They go soft from the inside very quickly, so pick slightly under-ripe and eat within a week.', varieties: ['Beth', 'Williams’ Bon Chrétien', 'Jargonelle'] },
      { name: 'Mid-season pears', when: 'Pick late September to early October · Keep 2–4 weeks', note: 'The reliable all-rounders, best ripened indoors for a week after picking.', varieties: ['Conference', 'Concorde', 'Louise Bonne of Jersey'] },
      { name: 'Late pears', when: 'Pick October · Store until December or later', note: 'Slow to ripen but the richest in flavour. Store hard in a cool place and bring into the warm to ripen.', varieties: ['Doyenné du Comice', 'Winter Nelis', 'Catillac (cooker)'] },
    ] },
  cherry: {
    groupsIntro: 'Cherries are sweet (for eating) or acid (for cooking), and the two are grown differently.',
    groups: [
      { name: 'Sweet cherries', when: 'Harvest June to August', note: 'Sweet and juicy for eating fresh. They need full sun and shelter, and a fan on a warm wall suits small gardens.', varieties: ['Stella', 'Sunburst', 'Lapins', 'Sweetheart'] },
      { name: 'Acid (Morello) cherries', when: 'Harvest July to August', note: 'Sharp, deep red cherries for pies, jam and brandy. Tolerant of a north-facing wall and always self-fertile.', varieties: ['Morello', 'Nabella', 'Montmorency'] },
    ] },
  grape: {
    groupsIntro: 'Grapes are grown outdoors or under glass, and for the table or for wine.',
    groups: [
      { name: 'Outdoor dessert grapes', when: 'Harvest September to October', note: 'Hardy, disease-resistant varieties that ripen on a sunny wall or pergola without any heat.', varieties: ['Boskoop Glory', 'Mars', 'Lakemont'] },
      { name: 'Outdoor wine grapes', when: 'Harvest late September to October', note: 'Early-ripening varieties for juice or home winemaking, hardy enough for most of southern Britain.', varieties: ['Solaris', 'Regent', 'Phoenix'] },
      { name: 'Greenhouse grapes', when: 'Harvest August to October', note: 'The finest dessert flavour, but they need a heated or sunny greenhouse and careful pruning.', varieties: ['Black Hamburg', 'Muscat of Alexandria', 'Buckland Sweetwater'] },
    ] },
  chicory: {
    groupsIntro: 'Chicory is grown for different crops: forced chicons, hearting heads or loose leaves.',
    groups: [
      { name: 'Witloof (forcing) chicory', when: 'Sow May to June · Lift roots October · Force December to March', note: 'Grown for the pale, tender chicons forced in the dark in winter.', varieties: ['Witloof Zoom', 'Brussels Witloof'] },
      { name: 'Sugarloaf chicory', when: 'Sow June to July · Harvest September to November', note: 'Tall, upright heads of crisp leaves, similar to cos lettuce, but hardier and bitter-sweet.', varieties: ['Pan di Zucchero', 'Snowflake'] },
      { name: 'Radicchio and leaf chicory', when: 'Sow June to August · Harvest October to December', note: 'Red and variegated, very hardy. The colour deepens with cold.', varieties: ['Palla Rossa', 'Treviso', 'Castelfranco'] },
    ] },
  endive: {
    groupsIntro: 'Endive has two leaf types, both sown in summer for autumn cropping.',
    groups: [
      { name: 'Curly endive (frisée)', when: 'Sow June to August · Harvest September to November', note: 'Finely cut, frilly leaves with a pale heart. Sharp and crisp, best blanched.', varieties: ['Frisée de Louviers', 'Bubikopf', 'Cornet de Bordeaux'] },
      { name: 'Broad-leaved endive (escarole)', when: 'Sow June to August · Harvest October to December', note: 'Broader, smoother leaves with a milder taste. Hardier and better in winter.', varieties: ['Batavian Full Heart', 'Nuance', 'Sinco'] },
    ] },
  beetroot: {
    groupsIntro: 'Beetroot is grouped by root shape and by when it is sown, which decides whether you eat it young or store it.',
    groups: [
      { name: 'Early globe beetroot', when: 'Sow March to May (under cloches early) · Harvest June to August', note: 'Quick, tender, round roots that are best pulled young at golf-ball to tennis-ball size.', varieties: ['Boltardy (bolt-resistant)', 'Pablo', 'Detroit 2'] },
      { name: 'Maincrop and storing beetroot', when: 'Sow May to July · Harvest September to October, store for winter', note: 'Larger roots that keep well in boxes of sand or a cool shed.', varieties: ['Cylindra (long, easy to slice)', 'Cheltenham Green Top', 'Egyptian Flat'] },
      { name: 'Coloured beetroot', when: 'Sow April to July · Harvest July to October', note: 'Golden and striped roots that do not bleed red, and have a milder, sweeter flavour.', varieties: ['Burpee’s Golden', 'Chioggia (candy-striped)', 'Albina Verduna (white)'] },
    ] },
  radish: {
    groupsIntro: 'Radishes come in two distinct kinds, which are sown at very different times.',
    groups: [
      { name: 'Summer radishes', when: 'Sow March to September · Harvest in 3–5 weeks', note: 'Small, crisp, quick roots. Sow a short row every fortnight and pick young before they turn woolly.', varieties: ['French Breakfast', 'Cherry Belle', 'Sparkler', 'Scarlet Globe'] },
      { name: 'Winter radishes', when: 'Sow July to August · Harvest October to December', note: 'Large, dense roots with a sharper taste that store well. Mooli is the best known.', varieties: ['China Rose', 'Black Spanish Round', 'Mooli (daikon)'] },
    ] },
  'sprouting-broccoli': {
    groupsIntro: 'Sprouting broccoli is picked in late winter and spring, so the type you choose sets the picking window.',
    groups: [
      { name: 'Early purple', when: 'Sow April to May · Harvest February to March', note: 'The first to crop, usually from late winter. Quick but less hardy.', varieties: ['Early Purple Sprouting', 'Rudolph'] },
      { name: 'Late purple', when: 'Sow April to May · Harvest March to May', note: 'Heavier and hardier, carrying on into spring.', varieties: ['Late Purple Sprouting', 'Claret (F1)'] },
      { name: 'White sprouting', when: 'Sow April to May · Harvest March to April', note: 'Cream-white spears, milder and sweeter.', varieties: ['White Eye', 'White Star'] },
    ] },
  'brussels-sprouts': {
    groupsIntro: 'Sprouts are sold as early, mid-season and late varieties, so you can pick from September to March.',
    groups: [
      { name: 'Early sprouts', when: 'Sow March · Harvest September to November', note: 'Quick to mature, with smaller sprouts that are best eaten fresh.', varieties: ['Oliver', 'Early Half Tall'] },
      { name: 'Mid-season sprouts', when: 'Sow March to April · Harvest October to January', note: 'The best all-rounders, with reliable yields and good flavour.', varieties: ['Revenge', 'Trafalgar', 'Brigitte'] },
      { name: 'Late sprouts', when: 'Sow April · Harvest December to March', note: 'Hardy types whose flavour improves after frost.', varieties: ['Doric', 'Bedford Winter Harvest', 'Red Rubine (red)'] },
    ] },
  cauliflower: {
    groupsIntro: 'Cauliflowers are bred for different seasons, and each needs a different sowing date.',
    groups: [
      { name: 'Summer cauliflower', when: 'Sow February to April · Harvest June to September', note: 'Quick, compact heads, best given steady water.', varieties: ['All the Year Round', 'Clapton', 'Candid Charm'] },
      { name: 'Autumn cauliflower', when: 'Sow April to May · Harvest September to December', note: 'The easiest group for most gardeners.', varieties: ['Skywalker', 'Autumn Giant', 'Cauliflower Mayflower'] },
      { name: 'Winter cauliflower', when: 'Sow May · Harvest February to May', note: 'Slow, hardy heads that mature in the following spring. Best in mild areas.', varieties: ['Galleon', 'Purple Cape', 'Walcheren Winter'] },
    ] },
  kale: {
    groupsIntro: 'Kale is grouped by leaf shape, which also changes flavour and ornamental value.',
    groups: [
      { name: 'Curly kale', when: 'Sow April to June · Harvest October to March', note: 'The hardiest group, with frilly leaves that sweeten after frost.', varieties: ['Darkibor', 'Dwarf Green Curled', 'Winterbor'] },
      { name: 'Cavolo nero (Tuscan kale)', when: 'Sow April to June · Harvest October to March', note: 'Dark, savoury, puckered leaves with a deeper flavour. Superb braised.', varieties: ['Nero di Toscana', 'Black Magic'] },
      { name: 'Red and Russian kale', when: 'Sow April to July · Harvest August to March', note: 'Tender, flat or frilly leaves in red and purple. Good as baby leaf too.', varieties: ['Redbor', 'Red Russian', 'Scarlet'] },
    ] },
  leek: {
    groupsIntro: 'Leeks are early, mid or late, and the choice sets how long the row lasts.',
    groups: [
      { name: 'Early leeks', when: 'Sow February to March · Harvest August to November', note: 'Slimmer, milder leeks for earliest picking.', varieties: ['Bleu de Solaize (hardy)', 'Zermatt', 'Jolant'] },
      { name: 'Mid-season leeks', when: 'Sow March to April · Harvest October to January', note: 'Reliable and thick, the usual choice.', varieties: ['Musselburgh', 'Hannibal', 'Apollo'] },
      { name: 'Late leeks', when: 'Sow April · Harvest January to April', note: 'Very hardy and slow-growing, standing through the toughest winters.', varieties: ['Bandit', 'Below Zero', 'Pandora'] },
    ] },
  courgette: {
    groupsIntro: 'Courgettes come in several colours and shapes, and most gardeners grow two or three types.',
    groups: [
      { name: 'Green courgettes', when: 'Sow April to May indoors · Harvest July to October', note: 'The usual dark green, glossy fruits, heavy and reliable.', varieties: ['Defender', 'Black Beauty', 'Zucchini'] },
      { name: 'Yellow courgettes', when: 'Sow April to May indoors · Harvest July to October', note: 'Golden fruit, easy to spot among the foliage, with a slightly sweeter flavour.', varieties: ['Gold Rush', 'Soleil', 'Atena Polka'] },
      { name: 'Round courgettes', when: 'Sow April to May indoors · Harvest July to September', note: 'Ball-shaped fruits that are perfect for stuffing.', varieties: ['Eight Ball', 'Tondo di Piacenza', 'Rond de Nice'] },
    ] },
  cucumber: {
    groupsIntro: 'Cucumbers are for the greenhouse, the garden, or small spaces, and the choice matters for success.',
    groups: [
      { name: 'Greenhouse cucumbers', when: 'Sow March to May · Harvest June to September', note: 'Long, smooth fruit, needing heat and humidity.', varieties: ['Telegraph Improved', 'Passandra', 'Femspot'] },
      { name: 'Outdoor (ridge) cucumbers', when: 'Sow April to May indoors · Harvest July to September', note: 'Shorter, rougher-skinned and hardier, the best choice for UK gardens.', varieties: ['Marketmore', 'Burpless Tasty Green', 'Tanja'] },
      { name: 'Mini and snack cucumbers', when: 'Sow April to May · Harvest July to September', note: 'Small, thin-skinned fruit that crop heavily in pots.', varieties: ['Mini Munch', 'Crystal Apple', 'Sweet Success'] },
    ] },
  chilli: {
    groupsIntro: 'Chillies are best chosen by heat. All are sown in January to March.',
    groups: [
      { name: 'Mild chillies', when: 'Sow January to March · Harvest July to October', note: 'Pleasant warmth without the burn, ideal for stuffing and for beginners.', varieties: ['Hungarian Hot Wax', 'Padron', 'Anaheim'] },
      { name: 'Medium chillies', when: 'Sow January to March · Harvest August to October', note: 'The cook’s workhorses for curries, salsa and sauces.', varieties: ['Apache', 'Jalapeño', 'Cayenne'] },
      { name: 'Hot chillies', when: 'Sow January to February · Harvest September to October', note: 'Very hot, with a long season. They need a greenhouse or a very warm spot.', varieties: ['Habanero', 'Scotch Bonnet', 'Prairie Fire'] },
    ] },
  'sweet-pepper': {
    groupsIntro: 'Sweet peppers vary by shape and by how quickly they ripen.',
    groups: [
      { name: 'Bell peppers', when: 'Sow February to March · Harvest August to October', note: 'Thick-walled blocky fruit that turn red, yellow or orange when ripe.', varieties: ['Ariane', 'Mini Bell', 'Redskin'] },
      { name: 'Pointed and sweet frying peppers', when: 'Sow February to March · Harvest August to October', note: 'Long, tapered and thin-skinned. Sweeter than bells and more productive.', varieties: ['Marconi Rosso', 'Sweet Banana', 'Romano'] },
    ] },
  bean: {
    groupsIntro: 'Runner beans can be tall or dwarf, and flower in different colours.',
    groups: [
      { name: 'Tall (climbing) runner beans', when: 'Sow May to June · Harvest July to October', note: 'The classic type, needing 2.4 m canes. The heaviest crops.', varieties: ['Scarlet Emperor', 'Enorma', 'Painted Lady'] },
      { name: 'Dwarf runner beans', when: 'Sow May to June · Harvest July to September', note: 'No supports needed, so they suit pots and windy plots.', varieties: ['Hestia', 'Pickwick'] },
      { name: 'White-flowered runner beans', when: 'Sow May to June · Harvest July to October', note: 'White flowers set better in hot weather and the pods are stringless.', varieties: ['White Lady', 'Czar'] },
    ] },
  'french-bean': {
    groupsIntro: 'French beans are either climbing or dwarf, and the pod colour varies.',
    groups: [
      { name: 'Dwarf French beans', when: 'Sow May to July · Harvest July to October', note: 'Compact, no supports, and quick to crop. Good in pots.', varieties: ['Safari', 'Maxi', 'Purple Teepee'] },
      { name: 'Climbing French beans', when: 'Sow May to June · Harvest July to October', note: 'Longer cropping season and bigger yields. Needs canes or netting.', varieties: ['Cobra', 'Blue Lake', 'Hunter (flat pods)'] },
      { name: 'Yellow and purple French beans', when: 'Sow May to July · Harvest July to October', note: 'Easy-to-spot pods; purple varieties turn green when cooked.', varieties: ['Golddukat', 'Purple Queen', 'Royalty'] },
    ] },
  pumpkin: {
    groupsIntro: 'Pumpkins and squashes are grown for carving, for eating, or for storing.',
    groups: [
      { name: 'Carving pumpkins', when: 'Sow April to May · Harvest September to October', note: 'Big, smooth fruit with thin flesh. Perfect for lanterns.', varieties: ['Racer', 'Jack O’Lantern', 'Atlantic Giant'] },
      { name: 'Eating pumpkins', when: 'Sow April to May · Harvest September to October', note: 'Smaller, sweeter, denser flesh that is better for soup and roasting.', varieties: ['Baby Bear', 'Rouge Vif d’Etampes', 'Jack Be Little'] },
    ] },
  sweetcorn: {
    groupsIntro: 'Sweetcorn comes in standard, super-sweet and baby types, and these should not be grown near each other.',
    groups: [
      { name: 'Standard sweet', when: 'Sow April to May · Harvest August to September', note: 'Classic taste and the most reliable. Best eaten straight from the plant.', varieties: ['Swift', 'Sweet Nugget', 'Lark'] },
      { name: 'Super-sweet', when: 'Sow late April to May · Harvest September', note: 'Hold their sugar for longer after picking, but need warm soil. Keep away from standard types.', varieties: ['Incredible', 'Sundance', 'Tyson'] },
      { name: 'Baby corn', when: 'Sow May · Harvest July to August', note: 'Picked young when the silks first show. Good for stir-fries.', varieties: ['Minipop', 'Mini Corn'] },
    ] },
  blueberry: {
    groupsIntro: 'Blueberries ripen over a long period, so plant an early, mid and late for months of fruit.',
    groups: [
      { name: 'Early blueberries', when: 'Harvest July', note: 'Ripen first and give a short, sweet flush.', varieties: ['Duke', 'Earliblue', 'Patriot'] },
      { name: 'Mid-season blueberries', when: 'Harvest late July to August', note: 'Reliable, heavy cropping, and the best all-rounders.', varieties: ['Bluecrop', 'Chandler', 'Sunshine Blue'] },
      { name: 'Late blueberries', when: 'Harvest August to September', note: 'Large, firm, late-keeping berries with excellent flavour.', varieties: ['Brigitta', 'Aurora', 'Elliott'] },
    ] },
  blackcurrant: {
    groupsIntro: 'Blackcurrants are early, mid or late. Planting each gives a spread of harvest.',
    groups: [
      { name: 'Early blackcurrants', when: 'Harvest early to mid July', note: 'Ripen before the main season, but are more at risk from spring frost.', varieties: ['Ben Sarek', 'Ben Hope'] },
      { name: 'Mid-season blackcurrants', when: 'Harvest mid to late July', note: 'Reliable and heavy, best for general use.', varieties: ['Ben Connan', 'Big Ben'] },
      { name: 'Late blackcurrants', when: 'Harvest late July to August', note: 'Frost-tolerant when flowering, with sweeter fruit.', varieties: ['Ben Lomond', 'Titania'] },
    ] },
  gooseberry: {
    groupsIntro: 'Gooseberries are green cooking types or sweeter dessert types.',
    groups: [
      { name: 'Cooking gooseberries', when: 'Pick late May to June, while hard and green', note: 'Tart and green, best cooked with sugar in pies, fools and sauces.', varieties: ['Invicta', 'Careless', 'Leveller'] },
      { name: 'Dessert gooseberries', when: 'Pick July, when soft and coloured', note: 'Left to ripen fully, they become sweet and juicy enough to eat raw.', varieties: ['Hinnonmaki Red', 'Hinnonmaki Yellow', 'Whinham’s Industry'] },
    ] },
  blackberry: {
    groupsIntro: 'Blackberries are thorny or thornless, and the choice affects picking comfort.',
    groups: [
      { name: 'Thornless blackberries', when: 'Harvest August to October', note: 'Easy to prune and pick. Excellent for small gardens.', varieties: ['Loch Ness', 'Oregon Thornless', 'Apache'] },
      { name: 'Thorny blackberries', when: 'Harvest August to October', note: 'Often the best flavour and hardiest, and a wildlife barrier.', varieties: ['Bedford Giant', 'Himalayan Giant', 'Fantasia'] },
    ] },
  mint: {
    groupsIntro: 'There are many mints, each suited to a different use. All spread, so keep them in pots.',
    groups: [
      { name: 'Spearmint and garden mint', when: 'Pick April to October', note: 'The classic mint for sauces, new potatoes and peas.', varieties: ['Spearmint', 'Moroccan mint'] },
      { name: 'Peppermint', when: 'Pick April to October', note: 'Strong menthol flavour, the best for tea and desserts.', varieties: ['Black peppermint', 'Chocolate mint'] },
      { name: 'Fruit and fancy mints', when: 'Pick April to October', note: 'Milder, with apple, pineapple, ginger or orange notes. Good in salads and drinks.', varieties: ['Apple mint', 'Ginger mint', 'Orange mint'] },
    ] },
  basil: {
    groupsIntro: 'Basils differ in flavour as much as appearance. Growing two or three types covers most cooking.',
    groups: [
      { name: 'Sweet basil (Italian)', when: 'Sow April to July · Pick June to October', note: 'The classic for tomatoes, pasta and pesto.', varieties: ['Genovese', 'Lettuce Leaf', 'Sweet Genovese'] },
      { name: 'Small-leaved (Greek) basil', when: 'Sow April to July · Pick June to October', note: 'Neat bushes with tiny leaves and a strong flavour. Good in pots.', varieties: ['Greek', 'Spicy Globe', 'Piccolino'] },
      { name: 'Thai and spiced basils', when: 'Sow April to June · Pick July to October', note: 'Aniseed, cinnamon or lemon notes, for curries and stir-fries.', varieties: ['Siam Queen (Thai)', 'Cinnamon', 'Lemon'] },
    ] },
  parsley: {
    groupsIntro: 'Parsley comes in three main types, with different flavour and use.',
    groups: [
      { name: 'Flat-leaved (Italian) parsley', when: 'Sow March to August · Pick year-round', note: 'The strongest flavour, best for cooking.', varieties: ['Giant of Italy', 'Plain Leaved 2'] },
      { name: 'Curled parsley', when: 'Sow March to August · Pick year-round', note: 'Frilly leaves, ideal for garnish and hardier in winter.', varieties: ['Moss Curled', 'Bravour'] },
      { name: 'Hamburg (root) parsley', when: 'Sow April to May · Harvest October to December', note: 'Grown for its parsnip-like root as well as its leaves.', varieties: ['Hamburg', 'Berliner'] },
    ] },
  rhubarb: {
    groupsIntro: 'Rhubarb is grouped by when it is ready, and forcing brings the season forward.',
    groups: [
      { name: 'Early rhubarb', when: 'Pick March to April (force from January)', note: 'Pink, tender stalks that respond well to forcing under a bucket.', varieties: ['Timperley Early', 'Champagne'] },
      { name: 'Maincrop rhubarb', when: 'Pick April to June', note: 'The heaviest cropper, with thick red-green stalks.', varieties: ['Victoria', 'Raspberry Red'] },
      { name: 'Late rhubarb', when: 'Pick May to July', note: 'Extends the season into summer with tender, sweet stalks.', varieties: ['Stockbridge Arrow', 'Glaskins Perpetual'] },
    ] },
  celery: {
    groupsIntro: 'Celery is grown as self-blanching, trench or leaf celery, and the type decides the work involved.',
    groups: [
      { name: 'Self-blanching celery', when: 'Sow March to April · Harvest August to October', note: 'The easy type, grown in blocks so that plants shade each other.', varieties: ['Celebrity', 'Victoria'] },
      { name: 'Trench celery', when: 'Sow March · Harvest October to December', note: 'Hardier, with the finest flavour, but needs earthing up for blanching.', varieties: ['Giant Pink', 'Giant Red'] },
      { name: 'Leaf celery', when: 'Sow March to June · Harvest June to October', note: 'The easiest type, giving flavoursome leaves and thin stems.', varieties: ['Par-Cel', 'Amsterdam Leaf'] },
    ] },
  spinach: {
    groupsIntro: 'Spinach is sown in spring or in late summer, with different varieties suited to each.',
    groups: [
      { name: 'Spring and summer spinach', when: 'Sow March to May · Harvest May to July', note: 'Bolt-resistant types for spring sowing.', varieties: ['Medania', 'Amazon', 'Reflect'] },
      { name: 'Winter spinach', when: 'Sow August to September · Harvest October to April', note: 'Hardy, slower types that overwinter.', varieties: ['Giant Winter', 'Lazio'] },
    ] },
  rosemary: {
    groupsIntro: 'Rosemary can be upright or trailing, and the form suits different spaces.',
    groups: [
      { name: 'Upright rosemary', when: 'Pick all year', note: 'Tall, bushy shrubs, ideal for hedges and borders.', varieties: ['Miss Jessopp’s Upright', 'Tuscan Blue', 'Sudbury Blue'] },
      { name: 'Prostrate rosemary', when: 'Pick all year', note: 'Trailing stems that tumble over walls and pots. A little less hardy.', varieties: ['Prostratus', 'Capri'] },
    ] },
  thyme: {
    groupsIntro: 'Thymes are grouped by flavour and by habit, from cooking to ground cover.',
    groups: [
      { name: 'Common (cooking) thyme', when: 'Pick all year', note: 'The best all-round flavour for stews, roasts and stuffing.', varieties: ['English thyme', 'French thyme'] },
      { name: 'Lemon thyme', when: 'Pick all year', note: 'Citrus scent, brilliant with fish, chicken and desserts.', varieties: ['Aureus', 'Silver Queen'] },
      { name: 'Creeping thyme', when: 'Flowers June to July', note: 'Low carpets for paths and between paving, which smell lovely underfoot.', varieties: ['Thymus serpyllum', 'Elfin'] },
    ] },
  sage: {
    groupsIntro: 'Sages differ in flavour and colour. Common and purple are the best for cooking.',
    groups: [
      { name: 'Common sage', when: 'Pick all year', note: 'The strongest flavour and the hardiest.', varieties: ['Broad-leaved', 'Berggarten'] },
      { name: 'Purple and variegated sage', when: 'Pick all year', note: 'Decorative leaves in purple, gold or cream. Slightly less hardy.', varieties: ['Purpurascens', 'Icterina', 'Tricolor'] },
    ] },
  fennel: {
    groupsIntro: 'Florence fennel is the bulb type. Herb fennel is grown for leaves and seed, and is covered separately as bronze fennel.',
    groups: [
      { name: 'Quick-maturing bulb fennel', when: 'Sow June to July · Harvest August to October', note: 'Bolt-resistant varieties for summer sowing.', varieties: ['Zefa Fino', 'Orion', 'Rondo'] },
      { name: 'Traditional bulb fennel', when: 'Sow June to July · Harvest September to November', note: 'Larger bulbs, but more prone to bolting.', varieties: ['Romanesco', 'Selma'] },
    ] },
  shallot: {
    groupsIntro: 'Shallots can be grown from sets, as with onions, or from seed.',
    groups: [
      { name: 'Banana and long shallots', when: 'Plant February to April · Harvest July to August', note: 'Long, tapered bulbs that are easier to peel and slice.', varieties: ['Zebrune', 'Longor'] },
      { name: 'Round shallots', when: 'Plant February to April · Harvest July to August', note: 'The classic type, strongly flavoured and a great keeper.', varieties: ['Golden Gourmet', 'Jermor', 'Red Sun'] },
      { name: 'Shallots from seed', when: 'Sow February to March · Harvest August to September', note: 'Cheaper, and avoid virus. Produce a single, medium bulb.', varieties: ['Ambition', 'Matador'] },
    ] },
  swede: {
    groupsIntro: 'Swedes are grown from a single sowing, with varieties chosen for flesh colour and disease resistance.',
    groups: [
      { name: 'Yellow-fleshed swede', when: 'Sow May to June · Harvest October to February', note: 'The classic swede, sweet and heavy.', varieties: ['Marian', 'Magnificent', 'Best of All'] },
      { name: 'Purple-top swede', when: 'Sow May to June · Harvest October to February', note: 'Hardy and mildew resistant, with a rich flavour.', varieties: ['Invitation', 'Ruby'] },
    ] },
  turnip: {
    groupsIntro: 'Turnips are quick summer roots or slower autumn roots.',
    groups: [
      { name: 'Early (summer) turnips', when: 'Sow March to June · Harvest May to August', note: 'Small, sweet, tender roots eaten young.', varieties: ['Purple Top Milan', 'Snowball', 'Tokyo Cross'] },
      { name: 'Maincrop (autumn) turnips', when: 'Sow July to August · Harvest October to December', note: 'Larger, hardier roots for stores and stews.', varieties: ['Golden Ball', 'Green Globe', 'Manchester Market'] },
    ] },
  parsnip: {
    groupsIntro: 'Parsnips are chosen for canker resistance and root shape.',
    groups: [
      { name: 'Short and wedge-shaped parsnips', when: 'Sow March to May · Harvest October to March', note: 'Suited to shallow or stony soil.', varieties: ['Avonresister', 'Gladiator'] },
      { name: 'Long parsnips', when: 'Sow March to May · Harvest October to March', note: 'The biggest roots and the best flavour, needing deep, stone-free soil.', varieties: ['Tender and True', 'Hollow Crown', 'Palace'] },
    ] },
  fig: {
    groupsIntro: 'Figs are hardy and tender types, which change where they can be grown.',
    groups: [
      { name: 'Hardy figs for outdoors', when: 'Harvest August to October', note: 'Well suited to a warm wall in the UK.', varieties: ['Brown Turkey', 'Brunswick', 'Rouge de Bordeaux'] },
      { name: 'Figs for pots and greenhouses', when: 'Harvest July to October', note: 'Compact or less hardy types that reward some shelter.', varieties: ['Little Miss Figgy', 'White Marseilles'] },
    ] },
  calabrese: {
    groupsIntro: 'Calabrese is early, summer or autumn, and a few sowings give a long harvest.',
    groups: [
      { name: 'Early calabrese', when: 'Sow March to April · Harvest June to July', note: 'Quick heads and side shoots in summer.', varieties: ['Aquiles', 'Ironman'] },
      { name: 'Autumn calabrese', when: 'Sow May to June · Harvest September to November', note: 'Large, firm heads, with plenty of side shoots after the main head is cut.', varieties: ['Marathon', 'Green Magic', 'Belstar'] },
    ] },
  'pak-choi': {
    groupsIntro: 'Pak choi comes in white-stemmed and green-stemmed types.',
    groups: [
      { name: 'White-stemmed pak choi', when: 'Sow April to August · Harvest 6–8 weeks later', note: 'The common type, with crisp white stems and dark leaves.', varieties: ['Joi Choi', 'Mei Qing Choi'] },
      { name: 'Green-stemmed and baby pak choi', when: 'Sow April to September', note: 'Tender and quick, ideal for baby leaves.', varieties: ['Canton White', 'Baby Pak Choi'] },
    ] },
};
