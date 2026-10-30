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
};
