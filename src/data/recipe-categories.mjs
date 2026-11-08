/* Recipe categories. Each recipe id maps to one category id. */
export const RECIPE_CATEGORIES = [
  { id: 'starters', label: 'Salads & starters' },
  { id: 'soups', label: 'Soups' },
  { id: 'mains', label: 'Mains' },
  { id: 'sides', label: 'Sides & veg' },
  { id: 'puddings', label: 'Puddings & bakes' },
  { id: 'preserves', label: 'Preserves & sauces' },
  { id: 'snacks', label: 'Breakfast & snacks' },
  { id: 'drinks', label: 'Drinks' },
];

const groups = {
  starters: 'caprese-salad garden-salad roast-beetroot-salad edible-flower-salad winter-leaf-salad bitter-leaf-pear-salad kohlrabi-slaw celeriac-remoulade waldorf-salad fennel-orange-salad cucumber-dill-tzatziki melon-mint-feta-salad green-bean-shallot-salad broad-bean-pea-crostini panzanella greek-salad new-potato-salad garden-coleslaw tomato-bruschetta tabbouleh',
  soups: 'kale-soup leek-potato-soup pea-mint-soup watercress-soup sorrel-soup lovage-soup jerusalem-artichoke-soup butternut-squash-soup lemongrass-chicken-soup roast-tomato-soup carrot-coriander-soup courgette-basil-soup french-onion-soup curried-parsnip-soup celeriac-apple-soup garden-minestrone beetroot-borscht',
  mains: 'courgette-fritters ratatouille bean-stir-fry crispy-potato-hash aubergine-parmigiana pizza-margherita stuffed-peppers stuffed-marrow pumpkin-sage-risotto cauliflower-cheese broccoli-orecchiette oriental-greens-stir-fry chard-orache-gratin shallot-tarte-tatin borlotti-bean-stew garlic-chive-dumplings spring-onion-pancakes hyssop-roast-lamb herby-sausage-patties slow-beef-bay-stew fish-parsley-gremolata asparagus-chive-omelette fines-herbes-omelette courgette-lemon-pasta cottage-pie leek-cheese-tart spinach-ricotta-pasta-bake cauliflower-potato-curry kale-garlic-spaghetti pea-broad-bean-risotto garden-bean-chilli pak-choi-noodles bubble-and-squeak tarragon-chicken thai-green-curry',
  sides: 'roast-patty-pan-platter romanesco-lemon-chilli purple-sprouting-broccoli brussels-sprouts-roast braised-red-cabbage honey-roast-parsnips swede-carrot-mash glazed-turnips salsify-brown-butter sweetcorn-chilli-lime sweet-potato-wedges globe-artichoke-lemon-butter sea-kale-brown-butter roast-elephant-garlic calendula-saffron-rice edamame-chilli-garlic rosemary-roast-potatoes creamed-spinach minted-new-potatoes french-beans-garlic-almonds peas-with-lettuce',
  puddings: 'apple-blackberry-crumble rhubarb-ginger-crumble blackcurrant-fool summer-pudding cherry-clafoutis apricot-almond-tart grilled-peaches-ricotta poached-pears plum-traybake gooseberry-fool fig-goats-cheese-flatbread grape-rosemary-focaccia lavender-shortbread physalis-chocolate courgette-lemon-cake carrot-cake beetroot-brownies dorset-apple-cake roast-rhubarb pumpkin-pie blueberry-muffins',
  preserves: 'pesto wild-garlic-pesto nasturtium-pesto horseradish-sauce redcurrant-jelly raspberry-loganberry-jam quince-membrillo tomatillo-salsa-verde coriander-chutney quick-pickled-gherkins pickled-beetroot candied-angelica chinese-cabbage-kimchi roast-tomato-sauce green-tomato-chutney runner-bean-chutney strawberry-jam mint-sauce chilli-jam garlic-herb-butter',
  snacks: 'stovetop-popcorn strawberry-yoghurt microgreens-toast blueberry-pancakes kiwiberry-yoghurt-parfait cobnut-honey-granola sweetcorn-fritters kale-crisps roast-pumpkin-seeds',
  drinks: 'elderberry-syrup lemon-herb-tea blackcurrant-cordial rhubarb-ginger-cordial strawberry-basil-lemonade mint-cucumber-cooler lemon-balm-iced-tea raspberry-shrub lovage-virgin-mary hot-spiced-apple-punch fresh-mint-tea elderflower-cordial',
};
export const RECIPE_CATEGORY_OF = new Map(Object.entries(groups).flatMap(([cat, ids]) => ids.split(' ').map((id) => [id, cat])));
