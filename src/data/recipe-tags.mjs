/* Recipe filters beyond dish type and crop: cuisine, diet (vegetarian, vegan) and health (protein, fibre, calories).
   Cuisine is set by hand below. Diet is worked out from the ingredients; health from the nutrition guide
   (src/data/nutrition.mjs). Optional and "to serve" ingredients are ignored, and an ingredient with a
   plant-based choice such as "Chicken (or tofu)" or "Fish sauce or soy sauce" still counts. */

export const CUISINES = [
  { id: 'british', label: 'British' },
  { id: 'italian', label: 'Italian' },
  { id: 'french', label: 'French' },
  { id: 'mediterranean', label: 'Mediterranean' },
  { id: 'middle-eastern', label: 'Middle Eastern' },
  { id: 'indian', label: 'Indian' },
  { id: 'asian', label: 'Asian' },
  { id: 'americas', label: 'American & Mexican' },
];

const cuisineGroups = {
  british: 'garden-salad kale-soup strawberry-yoghurt crispy-potato-hash edible-flower-salad winter-leaf-salad kohlrabi-slaw waldorf-salad leek-potato-soup pea-mint-soup watercress-soup sorrel-soup lovage-soup jerusalem-artichoke-soup microgreens-toast stuffed-marrow roast-patty-pan-platter butternut-squash-soup cauliflower-cheese brussels-sprouts-roast braised-red-cabbage honey-roast-parsnips swede-carrot-mash salsify-brown-butter sea-kale-brown-butter roast-elephant-garlic horseradish-sauce apple-blackberry-crumble rhubarb-ginger-crumble blackcurrant-fool summer-pudding redcurrant-jelly blueberry-pancakes poached-pears plum-traybake gooseberry-fool raspberry-loganberry-jam kiwiberry-yoghurt-parfait cobnut-honey-granola elderberry-syrup physalis-chocolate lemon-herb-tea lavender-shortbread hyssop-roast-lamb herby-sausage-patties slow-beef-bay-stew quick-pickled-gherkins pickled-beetroot candied-angelica nasturtium-pesto fish-parsley-gremolata blackcurrant-cordial rhubarb-ginger-cordial strawberry-basil-lemonade mint-cucumber-cooler lemon-balm-iced-tea raspberry-shrub lovage-virgin-mary hot-spiced-apple-punch roast-tomato-soup carrot-coriander-soup courgette-basil-soup celeriac-apple-soup cottage-pie leek-cheese-tart bubble-and-squeak rosemary-roast-potatoes creamed-spinach minted-new-potatoes new-potato-salad garden-coleslaw courgette-lemon-cake carrot-cake beetroot-brownies dorset-apple-cake roast-rhubarb green-tomato-chutney runner-bean-chutney strawberry-jam mint-sauce garlic-herb-butter kale-crisps roast-pumpkin-seeds fresh-mint-tea elderflower-cordial broccoli-stilton-soup roast-red-pepper-soup pumpkin-lentil-soup sausage-apple-traybake chicken-leek-pie fish-pie-leek-dill toad-in-the-hole lemon-garlic-roast-chicken buttered-leeks balsamic-roast-beetroot garlicky-chard runner-beans-tomato victoria-sponge raspberry-bakewell blackberry-apple-pie pear-upside-down-cake strawberry-ice-cream eton-mess piccalilli plum-jam bramble-jelly blackcurrant-jam pickled-red-cabbage pickled-onions cheese-chive-scones raspberry-mint-smoothie rhubarb-gin lemon-verbena-tea glazed-turnips grape-rosemary-focaccia beetroot-borscht',
  italian: 'caprese-salad courgette-fritters pesto aubergine-parmigiana pizza-margherita pumpkin-sage-risotto romanesco-lemon-chilli broccoli-orecchiette purple-sprouting-broccoli borlotti-bean-stew wild-garlic-pesto grilled-peaches-ricotta garden-minestrone courgette-lemon-pasta spinach-ricotta-pasta-bake kale-garlic-spaghetti pea-broad-bean-risotto panzanella tomato-bruschetta roast-tomato-sauce ribollita vegetable-lasagne chicken-cacciatore pesto-potato-bean-pasta rocket-pear-parmesan-salad aubergine-caponata stuffed-courgette-flowers grilled-courgette-salad garlic-bread',
  french: 'asparagus-chive-omelette fines-herbes-omelette roast-beetroot-salad bitter-leaf-pear-salad celeriac-remoulade green-bean-shallot-salad ratatouille chard-orache-gratin shallot-tarte-tatin globe-artichoke-lemon-butter cherry-clafoutis apricot-almond-tart french-onion-soup tarragon-chicken french-beans-garlic-almonds peas-with-lettuce potato-dauphinoise',
  mediterranean: 'fennel-orange-salad cucumber-dill-tzatziki melon-mint-feta-salad stuffed-peppers broad-bean-pea-crostini fig-goats-cheese-flatbread quince-membrillo greek-salad gazpacho spanish-tortilla spanakopita broad-bean-feta-salad',
  'middle-eastern': 'tabbouleh shakshuka beetroot-hummus spiced-roast-cauliflower calendula-saffron-rice',
  indian: 'coriander-chutney curried-parsnip-soup cauliflower-potato-curry',
  asian: 'bean-stir-fry chinese-cabbage-kimchi oriental-greens-stir-fry edamame-chilli-garlic garlic-chive-dumplings spring-onion-pancakes lemongrass-chicken-soup pak-choi-noodles thai-green-curry chilli-jam chicken-sweetcorn-soup',
  americas: 'sweetcorn-chilli-lime sweet-potato-wedges stovetop-popcorn tomatillo-salsa-verde garden-bean-chilli pumpkin-pie blueberry-muffins sweetcorn-fritters tomato-ketchup chimichurri caesar-salad squash-mac-cheese burger-bowl',
};

export const RECIPE_CUISINE_OF = new Map(Object.entries(cuisineGroups).flatMap(([c, ids]) => ids.split(' ').map((id) => [id, c])));

export const DIETS = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
];

/* Thresholds are per serving (or per portion for batch recipes). High fibre and high protein follow the
   spirit of the UK labelling rules (fibre at least 3 g per 100 kcal; at least 20% of energy from protein)
   with a minimum amount so a cup of tea does not count. */
export const HEALTH = [
  { id: 'high-protein', label: 'High protein', note: 'High protein means at least 15 g of protein a serving.' },
  { id: 'high-fibre', label: 'High fibre', note: 'High fibre means at least 6 g of fibre a serving.' },
  { id: 'low-cal', label: 'Lower calorie', note: 'Lower calorie means under 350 kcal a serving (jams, sauces and drinks are left out).' },
];

const leftOut = (label, qty) => /\boptional\b|\bto serve\b|to garnish|for serving/i.test(label) || /optional/i.test(qty);

const MEAT = /\b(chicken|beef|lamb|pork|bacon|pancetta|sausages?|mince|ham|chorizo|fish|anchov\w*|salmon|haddock|cod|hake|prawns?|worcestershire|gelatine|goose fat|lard|suet|curry paste)\b/i;
const DAIRY = /\b(milk|butter|cream|cheese|cheddar|parmesan|feta|mozzarella|ricotta|gruy[eè]re|stilton|yoghurt|custard|cr[eè]me fra[iî]che|ghee)\b/i;
const NOT_DAIRY = /coconut|oat milk|soy milk|almond milk|peanut butter|plant|dairy-free|vegan/i;
const EGG = /\b(eggs?|egg yolks?|meringues?|mayonnaise)\b/i;
const HONEY = /\b(honey|granola)\b/i;
/* A title that names meat or fish keeps the recipe off the vegetarian list even if the ingredient has a swap. */
const MEAT_TITLE = /\b(chicken|beef|lamb|pork|sausages?|fish|bacon|burger)\b/i;
const VEG_BURGER = /\bveggie\b|\bbean burger\b/i;

/* "Fish sauce or soy sauce" -> ["Fish sauce", "soy sauce"]; "Chicken, sliced (or tofu)" -> ["Chicken, sliced", "tofu"] */
const choices = (label) => label.replace(/\(or ([^)]*)\)/gi, ' or $1').split(/\s+or\s+/i).map((s) => s.trim()).filter(Boolean);

/* An ingredient fails a diet only if every choice in its label fails; with no choice, its key is checked too. */
function itemFails(label, key, test) {
  const opts = choices(label);
  return opts.length > 1 ? opts.every(test) : test(`${label} ${key}`);
}

export function recipeDiets(r) {
  const meat = (s) => MEAT.test(s.replace(/lamb'?s[ -]lettuce/gi, ''));
  const dairy = (s) => DAIRY.test(s) && !NOT_DAIRY.test(s);
  const egg = (s) => EGG.test(s) && !/egg noodles|eggless|egg-free/i.test(s);
  const honey = (s) => HONEY.test(s);
  let veg = !(MEAT_TITLE.test(r.title) && !VEG_BURGER.test(r.title));
  let vegan = veg;
  for (const [key, label, qty] of r.ingredients) {
    if (leftOut(label, qty)) continue;
    if (itemFails(label, key, meat)) veg = vegan = false;
    if (itemFails(label, key, (s) => meat(s) || dairy(s) || egg(s) || honey(s))) vegan = false;
  }
  const out = [];
  if (veg) out.push('vegetarian');
  if (vegan) out.push('vegan');
  return out;
}

/* Health tags from per-serving nutrition values (null when the recipe could not be worked out). Preserves
   and sauces are left out: a spoonful of jam is not a low-calorie meal. */
export function recipeHealth(r, values, category) {
  if (!values || category === 'preserves') return [];
  const out = [];
  const { kcal, protein, fibre } = values;
  if (protein >= 15 && kcal > 0 && (protein * 4) / kcal >= 0.2) out.push('high-protein');
  if (fibre >= 6 && kcal > 0 && (fibre / kcal) * 100 >= 3) out.push('high-fibre');
  if (kcal < 350 && category !== 'drinks') out.push('low-cal'); /* drinks left out: a cordial is not a light meal */
  return out;
}

/* Recipes that use Parmesan count as vegetarian; the filter shows a note to swap in a vegetarian hard cheese. */
export const usesParmesan = (r) => r.ingredients.some(([key, label, qty]) => !leftOut(label, qty) && (key === 'parmesan' || /parmesan/i.test(label)));
