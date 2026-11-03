/* Sowing and harvest months for each variety type, keyed by crop id and then by a short type id.
   Same 12-character format as calendar.mjs (January to December, 1 = active): i = sow or start indoors,
   o = sow or plant outside, h = harvest. A crop's overall calendar is its own months plus all of its types'.
   First drafted from each type's "when" line in groups.mjs; edit here to correct a type's timing. */
export const GROUP_CALENDAR = {
  "potato": {
    "first-earlies": { i: "000000000000", o: "001100000000", h: "000001100000" }, // First earlies
    "second-earlies": { i: "000000000000", o: "001100000000", h: "000000110000" }, // Second earlies
    "maincrop": { i: "000000000000", o: "000110000000", h: "000000001100" }, // Maincrop
  },
  "pea": {
    "earlies": { i: "000000000000", o: "001100000000", h: "000001000000" }, // Earlies (round-seeded)
    "maincrop": { i: "000000000000", o: "000111000000", h: "000000111000" }, // Maincrop (wrinkled)
    "mangetout-and-sugar-snap": { i: "000000000000", o: "000111000000", h: "000000111000" }, // Mangetout and sugar snap
  },
  "carrot": {
    "earlies": { i: "000000000000", o: "001110000000", h: "000001110000" }, // Earlies
    "maincrop": { i: "000000000000", o: "000011100000", h: "000000001110" }, // Maincrop
    "coloured-and-fly-resistant": { i: "000000000000", o: "000111100000", h: "000000111110" }, // Coloured and fly-resistant
  },
  "onion": {
    "spring-planted-sets": { i: "000000000000", o: "001100000000", h: "000000111000" }, // Spring-planted sets
    "autumn-planted-sets": { i: "000000000000", o: "000000001110", h: "000001100000" }, // Autumn-planted (overwintering) sets
    "grown-from-seed": { i: "111000000000", o: "001100000000", h: "000000011000" }, // Grown from seed
  },
  "garlic": {
    "hardneck": { i: "000000000000", o: "000000000111", h: "000001100000" }, // Hardneck
    "softneck": { i: "000000000000", o: "111000000011", h: "000000110000" }, // Softneck
  },
  "cabbage": {
    "spring-cabbage": { i: "000000000000", o: "000000110000", h: "001110000000" }, // Spring cabbage
    "summer-and-autumn-cabbage": { i: "001100000000", o: "000010000000", h: "000000111110" }, // Summer and autumn cabbage
    "winter-cabbage": { i: "000100000000", o: "000010000000", h: "110000000111" }, // Winter cabbage
  },
  "lettuce": {
    "cut-and-come-again": { i: "000000000000", o: "001111110000", h: "000111111100" }, // Cut-and-come-again (loose-leaf)
    "hearting": { i: "000000000000", o: "001111110000", h: "000011111110" }, // Hearting (cos, butterhead, crisphead)
    "hardy-winter-lettuce": { i: "000000001100", o: "001111111000", h: "001100000000" }, // Hardy winter lettuce
  },
  "tomato": {
    "cordon": { i: "011100000000", o: "000011000000", h: "000000111100" }, // Cordon (indeterminate)
    "bush": { i: "001100000000", o: "000011000000", h: "000000011000" }, // Bush (determinate)
    "trailing-and-basket": { i: "001100000000", o: "000011000000", h: "000000111000" }, // Trailing and basket
  },
  "strawberry": {
    "summer-fruiting": { i: "000000000000", o: "001100001100", h: "000001100000" }, // Summer-fruiting
    "perpetual": { i: "000000000000", o: "001100001100", h: "000000111100" }, // Perpetual (everbearing)
    "alpine": { i: "000000000000", o: "001100001100", h: "000001111100" }, // Alpine
  },
  "raspberry": {
    "summer-fruiting": { i: "000000000000", o: "111000000011", h: "000001100000" }, // Summer-fruiting
    "autumn-fruiting": { i: "000000000000", o: "111000000011", h: "000000011100" }, // Autumn-fruiting
  },
  "apple": {
    "early": { i: "000000000000", o: "111000000011", h: "000000011000" }, // Early (August to September)
    "mid-season": { i: "000000000000", o: "111000000011", h: "000000001100" }, // Mid-season (September to October)
    "late": { i: "000000000000", o: "111000000011", h: "000000000100" }, // Late (October onwards)
  },
  "plum": {
    "early-plums": { i: "000000000000", o: "111000000011", h: "000000010000" }, // Early plums
    "mid-and-late-plums": { i: "000000000000", o: "111000000011", h: "000000011000" }, // Mid and late plums
    "gages-and-damsons": { i: "000000000000", o: "111000000011", h: "000000001100" }, // Gages and damsons
  },
  "broad-bean": {
    "autumn-sown": { i: "000000000000", o: "000000000110", h: "000011000000" }, // Autumn-sown (hardy)
    "spring-sown": { i: "000000000000", o: "011100000000", h: "000001100000" }, // Spring-sown
  },
  "pear": {
    "early-pears": { i: "000000000000", o: "111000000011", h: "000000011000" }, // Early pears
    "mid-season-pears": { i: "000000000000", o: "111000000011", h: "000000001100" }, // Mid-season pears
    "late-pears": { i: "000000000000", o: "111000000011", h: "000000000100" }, // Late pears
  },
  "cherry": {
    "sweet-cherries": { i: "000000000000", o: "111000000011", h: "000001110000" }, // Sweet cherries
    "acid-cherries": { i: "000000000000", o: "111000000011", h: "000000110000" }, // Acid (Morello) cherries
  },
  "grape": {
    "outdoor-dessert-grapes": { i: "000000000000", o: "111000000011", h: "000000001100" }, // Outdoor dessert grapes
    "outdoor-wine-grapes": { i: "000000000000", o: "111000000011", h: "000000001100" }, // Outdoor wine grapes
    "greenhouse-grapes": { i: "000000000000", o: "111000000011", h: "000000011100" }, // Greenhouse grapes
  },
  "chicory": {
    "witloof-chicory": { i: "000000000000", o: "000011000000", h: "000000000100" }, // Witloof (forcing) chicory
    "sugarloaf-chicory": { i: "000000000000", o: "000001100000", h: "000000001110" }, // Sugarloaf chicory
    "radicchio-and-leaf-chicory": { i: "000000000000", o: "000001110000", h: "000000000111" }, // Radicchio and leaf chicory
  },
  "endive": {
    "curly-endive": { i: "000000000000", o: "000001110000", h: "000000001110" }, // Curly endive (frisée)
    "broad-leaved-endive": { i: "000000000000", o: "000001110000", h: "000000000111" }, // Broad-leaved endive (escarole)
  },
  "beetroot": {
    "early-globe-beetroot": { i: "000000000000", o: "001110000000", h: "000001110000" }, // Early globe beetroot
    "maincrop-and-storing-beetroot": { i: "000000000000", o: "000011100000", h: "000000001100" }, // Maincrop and storing beetroot
    "coloured-beetroot": { i: "000000000000", o: "000111100000", h: "000000111100" }, // Coloured beetroot
  },
  "radish": {
    "summer-radishes": { i: "000000000000", o: "001111111000", h: "000111111100" }, // Summer radishes
    "winter-radishes": { i: "000000000000", o: "000000110000", h: "000000000111" }, // Winter radishes
  },
  "sprouting-broccoli": {
    "early-purple": { i: "000110000000", o: "000001000000", h: "011000000000" }, // Early purple
    "late-purple": { i: "000110000000", o: "000001000000", h: "001110000000" }, // Late purple
    "white-sprouting": { i: "000110000000", o: "000001000000", h: "001100000000" }, // White sprouting
  },
  "brussels-sprouts": {
    "early-sprouts": { i: "001000000000", o: "000011000000", h: "000000001110" }, // Early sprouts
    "mid-season-sprouts": { i: "001100000000", o: "000011000000", h: "100000000111" }, // Mid-season sprouts
    "late-sprouts": { i: "000100000000", o: "000011000000", h: "111000000001" }, // Late sprouts
  },
  "cauliflower": {
    "summer-cauliflower": { i: "011100000000", o: "000011100000", h: "000001111000" }, // Summer cauliflower
    "autumn-cauliflower": { i: "000100000000", o: "000010000000", h: "000000001111" }, // Autumn cauliflower
    "winter-cauliflower": { i: "000000000000", o: "000010000000", h: "011110000000" }, // Winter cauliflower
  },
  "kale": {
    "curly-kale": { i: "000100000000", o: "000011000000", h: "111000000111" }, // Curly kale
    "cavolo-nero": { i: "000100000000", o: "000011000000", h: "111000000111" }, // Cavolo nero (Tuscan kale)
    "red-and-russian-kale": { i: "000100000000", o: "000011100000", h: "111000011111" }, // Red and Russian kale
  },
  "leek": {
    "early-leeks": { i: "011000000000", o: "000001100000", h: "000000011110" }, // Early leeks
    "mid-season-leeks": { i: "001100000000", o: "000001100000", h: "100000000111" }, // Mid-season leeks
    "late-leeks": { i: "000100000000", o: "000001100000", h: "111100000000" }, // Late leeks
  },
  "courgette": {
    "green-courgettes": { i: "000110000000", o: "000011000000", h: "000000111100" }, // Green courgettes
    "yellow-courgettes": { i: "000110000000", o: "000011000000", h: "000000111100" }, // Yellow courgettes
    "round-courgettes": { i: "000110000000", o: "000011000000", h: "000000111000" }, // Round courgettes
  },
  "cucumber": {
    "greenhouse-cucumbers": { i: "001100000000", o: "000010000000", h: "000001111000" }, // Greenhouse cucumbers
    "outdoor-cucumbers": { i: "000110000000", o: "000011000000", h: "000000111000" }, // Outdoor (ridge) cucumbers
    "mini-and-snack-cucumbers": { i: "000100000000", o: "000010000000", h: "000000111000" }, // Mini and snack cucumbers
  },
  "chilli": {
    "mild-chillies": { i: "111000000000", o: "000011000000", h: "000000111100" }, // Mild chillies
    "medium-chillies": { i: "111000000000", o: "000011000000", h: "000000011100" }, // Medium chillies
    "hot-chillies": { i: "110000000000", o: "000011000000", h: "000000001100" }, // Hot chillies
  },
  "sweet-pepper": {
    "bell-peppers": { i: "011000000000", o: "000001100000", h: "000000011100" }, // Bell peppers
    "pointed-and-sweet-frying-peppers": { i: "011000000000", o: "000001100000", h: "000000011100" }, // Pointed and sweet frying peppers
  },
  "bean": {
    "tall-runner-beans": { i: "000000000000", o: "000011000000", h: "000000111100" }, // Tall (climbing) runner beans
    "dwarf-runner-beans": { i: "000000000000", o: "000011000000", h: "000000111000" }, // Dwarf runner beans
    "white-flowered-runner-beans": { i: "000000000000", o: "000011000000", h: "000000111100" }, // White-flowered runner beans
  },
  "french-bean": {
    "dwarf-french-beans": { i: "000000000000", o: "000011100000", h: "000000111100" }, // Dwarf French beans
    "climbing-french-beans": { i: "000000000000", o: "000011000000", h: "000000111100" }, // Climbing French beans
    "yellow-and-purple-french-beans": { i: "000000000000", o: "000011100000", h: "000000111100" }, // Yellow and purple French beans
  },
  "pumpkin": {
    "carving-pumpkins": { i: "000100000000", o: "000010000000", h: "000000001100" }, // Carving pumpkins
    "eating-pumpkins": { i: "000100000000", o: "000010000000", h: "000000001100" }, // Eating pumpkins
  },
  "sweetcorn": {
    "standard-sweet": { i: "000100000000", o: "000010000000", h: "000000011000" }, // Standard sweet
    "super-sweet": { i: "000100000000", o: "000010000000", h: "000000001000" }, // Super-sweet
    "baby-corn": { i: "000000000000", o: "000010000000", h: "000000110000" }, // Baby corn
  },
  "blueberry": {
    "early-blueberries": { i: "000000000000", o: "111000000011", h: "000000100000" }, // Early blueberries
    "mid-season-blueberries": { i: "000000000000", o: "111000000011", h: "000000110000" }, // Mid-season blueberries
    "late-blueberries": { i: "000000000000", o: "111000000011", h: "000000011000" }, // Late blueberries
  },
  "blackcurrant": {
    "early-blackcurrants": { i: "000000000000", o: "111000000011", h: "000000100000" }, // Early blackcurrants
    "mid-season-blackcurrants": { i: "000000000000", o: "111000000011", h: "000000100000" }, // Mid-season blackcurrants
    "late-blackcurrants": { i: "000000000000", o: "111000000011", h: "000000110000" }, // Late blackcurrants
  },
  "gooseberry": {
    "cooking-gooseberries": { i: "000000000000", o: "111000000011", h: "000011000000" }, // Cooking gooseberries
    "dessert-gooseberries": { i: "000000000000", o: "111000000011", h: "000000100000" }, // Dessert gooseberries
  },
  "blackberry": {
    "thornless-blackberries": { i: "000000000000", o: "111000000011", h: "000000011100" }, // Thornless blackberries
    "thorny-blackberries": { i: "000000000000", o: "111000000011", h: "000000011100" }, // Thorny blackberries
  },
  "mint": {
    "spearmint-and-garden-mint": { i: "000000000000", o: "000110000000", h: "000111111100" }, // Spearmint and garden mint
    "peppermint": { i: "000000000000", o: "000110000000", h: "000111111100" }, // Peppermint
    "fruit-and-fancy-mints": { i: "000000000000", o: "000110000000", h: "000111111100" }, // Fruit and fancy mints
  },
  "basil": {
    "sweet-basil": { i: "000100000000", o: "000011100000", h: "000001111100" }, // Sweet basil (Italian)
    "small-leaved-basil": { i: "000100000000", o: "000011100000", h: "000001111100" }, // Small-leaved (Greek) basil
    "thai-and-spiced-basils": { i: "000100000000", o: "000011000000", h: "000000111100" }, // Thai and spiced basils
  },
  "parsley": {
    "flat-leaved-parsley": { i: "001000000000", o: "000111110000", h: "000001111110" }, // Flat-leaved (Italian) parsley
    "curled-parsley": { i: "001000000000", o: "000111110000", h: "000001111110" }, // Curled parsley
    "hamburg-parsley": { i: "000000000000", o: "000110000000", h: "000000000111" }, // Hamburg (root) parsley
  },
  "rhubarb": {
    "early-rhubarb": { i: "000000000000", o: "111000000011", h: "101100000000" }, // Early rhubarb
    "maincrop-rhubarb": { i: "000000000000", o: "111000000011", h: "000111000000" }, // Maincrop rhubarb
    "late-rhubarb": { i: "000000000000", o: "111000000011", h: "000011100000" }, // Late rhubarb
  },
  "celery": {
    "self-blanching-celery": { i: "001100000000", o: "000001100000", h: "000000011100" }, // Self-blanching celery
    "trench-celery": { i: "001000000000", o: "000001100000", h: "000000000111" }, // Trench celery
    "leaf-celery": { i: "001110000000", o: "000001000000", h: "000001111100" }, // Leaf celery
  },
  "spinach": {
    "spring-and-summer-spinach": { i: "000000000000", o: "001110000000", h: "000011100000" }, // Spring and summer spinach
    "winter-spinach": { i: "000000000000", o: "000000011000", h: "111100000111" }, // Winter spinach
  },
  "rosemary": {
    "upright-rosemary": { i: "000000000000", o: "001111000000", h: "111111111111" }, // Upright rosemary
    "prostrate-rosemary": { i: "000000000000", o: "001111000000", h: "111111111111" }, // Prostrate rosemary
  },
  "thyme": {
    "common-thyme": { i: "000000000000", o: "001111000000", h: "111111111111" }, // Common (cooking) thyme
    "lemon-thyme": { i: "000000000000", o: "001111000000", h: "111111111111" }, // Lemon thyme
    "creeping-thyme": { i: "000000000000", o: "001111000000", h: "111111111111" }, // Creeping thyme
  },
  "sage": {
    "common-sage": { i: "000000000000", o: "001111000000", h: "111111111111" }, // Common sage
    "purple-and-variegated-sage": { i: "000000000000", o: "001111000000", h: "111111111111" }, // Purple and variegated sage
  },
  "fennel": {
    "quick-maturing-bulb-fennel": { i: "000000000000", o: "000001100000", h: "000000011100" }, // Quick-maturing bulb fennel
    "traditional-bulb-fennel": { i: "000000000000", o: "000001100000", h: "000000001110" }, // Traditional bulb fennel
  },
  "shallot": {
    "banana-and-long-shallots": { i: "000000000000", o: "011100000000", h: "000000110000" }, // Banana and long shallots
    "round-shallots": { i: "000000000000", o: "011100000000", h: "000000110000" }, // Round shallots
    "shallots-from-seed": { i: "000000000000", o: "011000000000", h: "000000011000" }, // Shallots from seed
  },
  "swede": {
    "yellow-fleshed-swede": { i: "000000000000", o: "000011000000", h: "110000000111" }, // Yellow-fleshed swede
    "purple-top-swede": { i: "000000000000", o: "000011000000", h: "110000000111" }, // Purple-top swede
  },
  "turnip": {
    "early-turnips": { i: "000000000000", o: "001111000000", h: "000011110000" }, // Early (summer) turnips
    "maincrop-turnips": { i: "000000000000", o: "000000110000", h: "000000000111" }, // Maincrop (autumn) turnips
  },
  "parsnip": {
    "short-and-wedge-shaped-parsnips": { i: "000000000000", o: "001110000000", h: "111000000111" }, // Short and wedge-shaped parsnips
    "long-parsnips": { i: "000000000000", o: "001110000000", h: "111000000111" }, // Long parsnips
  },
  "fig": {
    "hardy-figs-for-outdoors": { i: "000000000000", o: "001100000000", h: "000000011100" }, // Hardy figs for outdoors
    "figs-for-pots-and-greenhouses": { i: "000000000000", o: "001100000000", h: "000000111100" }, // Figs for pots and greenhouses
  },
  "calabrese": {
    "early-calabrese": { i: "001000000000", o: "000100000000", h: "000001100000" }, // Early calabrese
    "autumn-calabrese": { i: "000000000000", o: "000011000000", h: "000000001110" }, // Autumn calabrese
  },
  "pak-choi": {
    "white-stemmed-pak-choi": { i: "000000000000", o: "000111110000", h: "000011111100" }, // White-stemmed pak choi
    "green-stemmed-and-baby-pak-choi": { i: "000000000000", o: "000111111000", h: "000011111100" }, // Green-stemmed and baby pak choi
  },
};
