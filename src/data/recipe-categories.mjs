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
  starters: 'caprese-salad garden-salad roast-beetroot-salad edible-flower-salad winter-leaf-salad bitter-leaf-pear-salad kohlrabi-slaw celeriac-remoulade waldorf-salad fennel-orange-salad cucumber-dill-tzatziki melon-mint-feta-salad green-bean-shallot-salad broad-bean-pea-crostini',
  soups: 'kale-soup leek-potato-soup pea-mint-soup watercress-soup sorrel-soup lovage-soup jerusalem-artichoke-soup butternut-squash-soup lemongrass-chicken-soup',
  mains: 'courgette-fritters ratatouille bean-stir-fry crispy-potato-hash aubergine-parmigiana pizza-margherita stuffed-peppers stuffed-marrow pumpkin-sage-risotto cauliflower-cheese broccoli-orecchiette oriental-greens-stir-fry chard-orache-gratin shallot-tarte-tatin borlotti-bean-stew garlic-chive-dumplings spring-onion-pancakes hyssop-roast-lamb herby-sausage-patties slow-beef-bay-stew fish-parsley-gremolata asparagus-chive-omelette fines-herbes-omelette',
  sides: 'roast-patty-pan-platter romanesco-lemon-chilli purple-sprouting-broccoli brussels-sprouts-roast braised-red-cabbage honey-roast-parsnips swede-carrot-mash glazed-turnips salsify-brown-butter sweetcorn-chilli-lime sweet-potato-wedges globe-artichoke-lemon-butter sea-kale-brown-butter roast-elephant-garlic calendula-saffron-rice edamame-chilli-garlic',
  puddings: 'apple-blackberry-crumble rhubarb-ginger-crumble blackcurrant-fool summer-pudding cherry-clafoutis apricot-almond-tart grilled-peaches-ricotta poached-pears plum-traybake gooseberry-fool fig-goats-cheese-flatbread grape-rosemary-focaccia lavender-shortbread physalis-chocolate',
  preserves: 'pesto wild-garlic-pesto nasturtium-pesto horseradish-sauce redcurrant-jelly raspberry-loganberry-jam quince-membrillo tomatillo-salsa-verde coriander-chutney quick-pickled-gherkins candied-angelica chinese-cabbage-kimchi',
  snacks: 'strawberry-yoghurt microgreens-toast blueberry-pancakes kiwiberry-yoghurt-parfait cobnut-honey-granola',
  drinks: 'elderberry-syrup lemon-herb-tea blackcurrant-cordial rhubarb-ginger-cordial strawberry-basil-lemonade mint-cucumber-cooler lemon-balm-iced-tea raspberry-shrub lovage-virgin-mary hot-spiced-apple-punch',
};
export const RECIPE_CATEGORY_OF = new Map(Object.entries(groups).flatMap(([cat, ids]) => ids.split(' ').map((id) => [id, cat])));
