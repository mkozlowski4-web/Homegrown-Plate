/* Nutrition guide for recipes: rough values per portion, worked out at build time from typical values for each ingredient.

   FOODS: per 100 g (or 100 ml for liquids) [kcal, protein, carbs, sugars, fat, saturates, fibre, salt], plus typical weights in grams:
     each (one medium item), tbsp, handful, bunch, head, slice, sprig, leaf, sheet, tin (drained), and d (grams per ml, default 1).
   Values are typical UK supermarket / CoFID-style figures, rounded. They are a guide, not a lab analysis.

   RULES pick a food from the ingredient label (first match wins); otherwise the ingredient's key is used (KEY_FOOD or FOODS).
   BATCH gives a sensible portion for recipes that make a batch (jams, cordials, biscuits) instead of serving a number of people.
   Anything marked optional or "to serve", water, and salt or pepper "to taste" are left out. */

export const NUTRIENTS = [
  ['kcal', 'Energy', 'kcal'], ['fat', 'Fat', 'g'], ['saturates', 'Saturates', 'g'], ['carbs', 'Carbs', 'g'],
  ['sugars', 'Sugars', 'g'], ['fibre', 'Fibre', 'g'], ['protein', 'Protein', 'g'], ['salt', 'Salt', 'g'],
];
const ORDER = ['kcal', 'protein', 'carbs', 'sugars', 'fat', 'saturates', 'fibre', 'salt'];

const F = {};
const f = (id, n, w = {}) => { F[id] = { n, w }; };
const HERB = { tbsp: 4, handful: 15, bunch: 30, sprig: 1, leaf: 0.3, each: 1, head: 5, stalk: 2 };
const LEAF = { handful: 30, bunch: 100, each: 10, head: 300 };

/*      id                    kcal  prot  carb  sug   fat   sat   fib   salt */
f('olive-oil',              [899, 0, 0, 0, 99.9, 14.3, 0, 0], { tbsp: 13.5, d: 0.92 });
f('veg-oil',                [899, 0, 0, 0, 99.9, 7.0, 0, 0], { tbsp: 13.5, d: 0.92 });
f('sesame-oil',             [899, 0, 0, 0, 99.9, 14.2, 0, 0], { tbsp: 13.5, d: 0.92 });
f('butter',                 [744, 0.6, 0.6, 0.6, 82.2, 52, 0, 1.5], { tbsp: 14, knob: 10 });
f('onion',                  [36, 1.2, 7.9, 5.7, 0.2, 0, 1.4, 0], { each: 150 });
f('spring-onion',           [32, 1.8, 7.3, 2.3, 0.2, 0, 2.6, 0], { each: 15 });
f('shallot',                [72, 2.5, 16.8, 7.9, 0.1, 0, 3.2, 0], { each: 30 });
f('banana-shallot',         [72, 2.5, 16.8, 7.9, 0.1, 0, 3.2, 0], { each: 60 });
f('garlic',                 [149, 6.4, 33, 1, 0.5, 0.1, 2.1, 0], { each: 5, clove: 5, bulb: 50 });
f('elephant-garlic',        [149, 6.4, 33, 1, 0.5, 0.1, 2.1, 0], { each: 120 });
f('wild-garlic',            [30, 2, 6, 1, 0.3, 0, 2, 0], { handful: 30 });
f('sugar',                  [400, 0, 100, 100, 0, 0, 0, 0], { tbsp: 12.5 });
f('brown-sugar',            [380, 0.1, 98, 97, 0, 0, 0, 0.07], { tbsp: 12 });
f('icing-sugar',            [398, 0, 100, 100, 0, 0, 0, 0], { tbsp: 8 });
f('honey',                  [304, 0.3, 82, 82, 0, 0, 0, 0], { tbsp: 21, d: 1.4 });
f('jam',                    [250, 0.4, 62, 49, 0, 0, 1, 0], { tbsp: 20 });
f('lemon-juice',            [22, 0.4, 6.9, 2.5, 0.2, 0, 0.3, 0], { tbsp: 15, each: 40 });
f('lemon',                  [22, 0.4, 6.9, 2.5, 0.2, 0, 0.3, 0], { each: 40, slice: 5 }); /* a lemon counted as its juice */
f('lime',                   [25, 0.4, 8.4, 1.7, 0.1, 0, 0.4, 0], { tbsp: 15, each: 30 });
f('zest',                   [47, 1.5, 16, 4.2, 0.3, 0, 10.6, 0], { each: 2, tbsp: 6 });
f('veg-stock',              [6, 0.3, 0.6, 0.4, 0.2, 0.1, 0, 0.5], {});
f('chicken-stock',          [8, 1, 0.5, 0.3, 0.3, 0.1, 0, 0.5], {});
f('plain-flour',            [364, 10, 77, 1.5, 1.3, 0.2, 3.1, 0], { tbsp: 10 });
f('bread-flour',            [361, 12, 73, 1.5, 1.4, 0.2, 3, 0], { tbsp: 10 });
f('sr-flour',               [361, 9.3, 76, 1.5, 1.2, 0.2, 3, 0.9], { tbsp: 10 });
f('wholemeal-flour',        [340, 13, 64, 2, 2.5, 0.4, 9, 0], { tbsp: 10 });
f('cornflour',              [381, 0.3, 91, 0, 0.1, 0, 0.9, 0], { tbsp: 10 });
f('tomato',                 [18, 0.9, 3.9, 2.6, 0.2, 0, 1.2, 0], { each: 120 });
f('cherry-tomato',          [18, 0.9, 3.9, 2.6, 0.2, 0, 1.2, 0], { each: 15, handful: 100 });
f('tinned-tomato',          [21, 1.2, 3.5, 3, 0.1, 0, 1, 0.1], { tin: 400 });
f('green-tomato',           [23, 1.2, 5.1, 4, 0.2, 0, 1.1, 0], { each: 120 });
f('salt',                   [0, 0, 0, 0, 0, 0, 0, 100], { tbsp: 18, pinch: 0.4 });
f('egg',                    [143, 12.6, 0.7, 0.4, 9.5, 3.1, 0, 0.36], { each: 50 });
f('vinegar',                [21, 0, 0.9, 0.4, 0, 0, 0, 0], { tbsp: 15 });
f('balsamic',               [88, 0.5, 17, 15, 0, 0, 0, 0.06], { tbsp: 16 });
f('spice',                  [300, 10, 50, 3, 10, 1, 30, 0.1], { tbsp: 7.5, each: 0.3, stick: 3, pinch: 0.3 });
f('chilli-flakes',          [314, 12, 57, 10, 17, 3, 27, 0.1], { tbsp: 5, pinch: 0.3 });
f('milk',                   [46, 3.5, 4.7, 4.7, 1.7, 1.1, 0, 0.1], { tbsp: 15, d: 1.03 });
f('whole-milk',             [64, 3.3, 4.6, 4.6, 3.6, 2.3, 0, 0.1], { tbsp: 15, d: 1.03 });
f('chilli',                 [40, 1.9, 9, 5, 0.4, 0, 1.5, 0], { each: 10 });
f('potato',                 [75, 2, 17, 0.6, 0.1, 0, 1.8, 0], { each: 175 });
f('new-potato',             [70, 1.7, 15.5, 1.3, 0.3, 0.1, 1.5, 0], { each: 45 });
f('herb',                   [40, 3, 6, 1, 0.7, 0.1, 4, 0.03], HERB);
f('leaves',                 [20, 2, 3, 1, 0.3, 0, 2, 0.05], LEAF);
f('flowers',                [20, 1, 3, 1, 0.2, 0, 1, 0], { handful: 10, tbsp: 2, each: 2 });
f('parmesan',               [415, 36, 0, 0, 30, 19, 0, 1.7], { tbsp: 6 });
f('single-cream',           [193, 3.3, 3, 3, 19, 12, 0, 0.1], { tbsp: 15 });
f('double-cream',           [445, 1.7, 2.7, 2.7, 48, 30, 0, 0.08], { tbsp: 15 });
f('soured-cream',           [190, 2.9, 4, 4, 19, 12, 0, 0.1], { tbsp: 15 });
f('creme-fraiche',          [300, 2.4, 2.6, 2.6, 30, 20, 0, 0.1], { tbsp: 15 });
f('dijon',                  [162, 7, 4, 3, 11, 0.6, 4, 5.7], { tbsp: 15 });
f('wholegrain-mustard',     [140, 8, 5, 4, 10, 0.6, 5, 5], { tbsp: 15 });
f('english-mustard',        [180, 7, 19, 13, 8, 0.5, 1, 6.5], { tbsp: 15 });
f('mustard-powder',         [508, 26, 28, 7, 36, 2, 12, 0], { tbsp: 7.5 });
f('mustard-seeds',          [508, 26, 28, 7, 36, 2, 12, 0], { tbsp: 9 });
f('greek-yoghurt',          [133, 5.7, 4.8, 4.8, 10.2, 7, 0, 0.15], { tbsp: 15 });
f('yoghurt',                [79, 5.7, 7.8, 7.8, 3, 2, 0, 0.2], { tbsp: 15 });
f('ginger',                 [80, 1.8, 18, 1.7, 0.8, 0.2, 2, 0], { tbsp: 6, thumb: 15, cm: 5, slice: 3, each: 15 });
f('carrot',                 [34, 0.6, 7.9, 7.4, 0.3, 0, 2.4, 0.1], { each: 80 });
f('apple',                  [52, 0.3, 13.8, 10.4, 0.2, 0, 2.4, 0], { each: 150 });
f('cooking-apple',          [35, 0.3, 8.9, 8.9, 0.1, 0, 1.6, 0], { each: 220 });
f('bread',                  [250, 9, 48, 3, 2, 0.4, 2.7, 1], { slice: 40, each: 40, loaf: 400 });
f('baguette',               [263, 9, 52, 3, 1.6, 0.3, 2.7, 1.2], { each: 250 });
f('baguette-slice',         [263, 9, 52, 3, 1.6, 0.3, 2.7, 1.2], { each: 15, slice: 15 });
f('breadcrumbs',            [250, 9, 48, 3, 2, 0.4, 2.7, 1], { tbsp: 8 });
f('flatbread',              [290, 9, 50, 4, 6, 1.2, 2, 1.1], { each: 80 });
f('water',                  [0, 0, 0, 0, 0, 0, 0, 0], {});
f('courgette',              [18, 1.8, 2, 1.7, 0.4, 0.1, 1, 0], { each: 200 });
f('cheddar',                [416, 25, 0.1, 0.1, 34.9, 21.7, 0, 1.8], { tbsp: 7 });
f('gruyere',                [413, 30, 0.4, 0.4, 32, 19, 0, 0.7], {});
f('sweet-pepper',           [31, 1, 6, 4.2, 0.3, 0, 2.1, 0], { each: 160 });
f('pasta',                  [359, 12.5, 72, 3.2, 1.5, 0.3, 3, 0], {});
f('noodles',                [370, 12, 72, 2, 3, 0.8, 3, 0.3], { nest: 60, each: 60 });
f('dumpling-wrapper',       [280, 9, 57, 1, 1, 0.2, 2, 0.5], { each: 8 });
f('puff-pastry',            [551, 6, 38, 1, 40, 20, 1.5, 1], { sheet: 320 });
f('shortcrust',             [527, 6.6, 52, 2, 33, 15, 2, 0.7], { sheet: 320 });
f('cucumber',               [15, 0.7, 3.6, 1.7, 0.1, 0, 0.5, 0], { each: 300 });
f('feta',                   [264, 14, 4, 4, 21, 15, 0, 2.7], { block: 200 });
f('chicken',                [120, 22, 0, 0, 3, 1, 0, 0.2], { each: 150 });
f('whole-chicken',          [140, 16, 0, 0, 8.5, 2.4, 0, 0.12], {}); /* bone in, skin on */
f('chicken-thigh',          [160, 13, 0, 0, 12, 3.4, 0, 0.12], { each: 150 }); /* bone in, skin on */
f('chicken-breast',         [106, 24, 0, 0, 1.1, 0.3, 0, 0.15], { each: 150 });
f('soy',                    [60, 8, 6, 1, 0, 0, 0, 14.5], { tbsp: 16 });
f('fish-sauce',             [35, 5, 3.6, 3.6, 0, 0, 0, 23], { tbsp: 18 });
f('worcestershire',         [78, 0, 19, 10, 0, 0, 0, 2.8], { tbsp: 17 });
f('ketchup',                [110, 1.2, 25, 22, 0.1, 0, 0.3, 1.8], { tbsp: 17 });
f('curry-paste',            [130, 2, 10, 5, 9, 1, 3, 8], { tbsp: 15 });
f('tahini',                 [595, 17, 21, 0.5, 54, 7.5, 9, 0.1], { tbsp: 15 });
f('mayonnaise',             [680, 1, 0.6, 0.6, 75, 6, 0, 1.5], { tbsp: 14 });
f('strawberry',             [32, 0.7, 7.7, 4.9, 0.3, 0, 2, 0], { each: 15 });
f('raspberry',              [32, 1.2, 5, 4.4, 0.3, 0, 6.5, 0], {});
f('loganberry',             [32, 1.2, 5, 4.4, 0.3, 0, 6.5, 0], {});
f('blackberry',             [43, 1.4, 9.6, 4.9, 0.5, 0, 5.3, 0], {});
f('blackcurrant',           [63, 1.4, 15, 7, 0.4, 0, 5, 0], {});
f('redcurrant',             [56, 1.4, 13.8, 7.4, 0.2, 0, 4.3, 0], {});
f('blueberry',              [57, 0.7, 14.5, 10, 0.3, 0, 2.4, 0], {});
f('gooseberry',             [44, 0.9, 10, 7, 0.6, 0, 4.3, 0], {});
f('elderberry',             [73, 0.7, 18.4, 8, 0.5, 0, 7, 0], {});
f('plum',                   [46, 0.7, 11.4, 9.9, 0.3, 0, 1.4, 0], { each: 55 });
f('cherry',                 [63, 1.1, 16, 12.8, 0.2, 0, 2.1, 0], {});
f('apricot',                [48, 1.4, 11, 9.2, 0.4, 0, 2, 0], { each: 40 });
f('peach',                  [39, 0.9, 9.5, 8.4, 0.3, 0, 1.5, 0], { each: 150 });
f('fig',                    [74, 0.8, 19, 16, 0.3, 0.1, 2.9, 0], { each: 50 });
f('grape',                  [69, 0.7, 18, 15.5, 0.2, 0.1, 0.9, 0], {});
f('kiwi',                   [61, 1.1, 14.7, 9, 0.5, 0, 3, 0], {});
f('pear',                   [57, 0.4, 15, 9.8, 0.1, 0, 3.1, 0], { each: 170 });
f('orange',                 [47, 0.9, 11.8, 9.4, 0.1, 0, 2.4, 0], { each: 140 });
f('quince',                 [57, 0.4, 15.3, 10, 0.1, 0, 1.9, 0], { each: 250 });
f('physalis',               [53, 1.9, 11, 6, 0.7, 0, 1, 0], { each: 5 });
f('tomatillo',              [32, 1, 5.8, 3.9, 1, 0.1, 1.9, 0], { each: 35 });
f('banana',                 [89, 1.1, 23, 12, 0.3, 0.1, 2.6, 0], { each: 120 });
f('melon',                  [34, 0.8, 8.2, 7.9, 0.2, 0, 0.9, 0], { each: 1000 });
f('rhubarb',                [21, 0.9, 4.5, 1.1, 0.2, 0, 1.8, 0], {});
f('avocado',                [160, 2, 8.5, 0.7, 14.7, 2.1, 6.7, 0], { each: 150 });
f('raisins',                [300, 2.7, 70, 70, 0.4, 0, 2, 0.1], { tbsp: 10 });
f('beetroot',               [43, 1.6, 9.6, 6.8, 0.2, 0, 2.8, 0.2], { each: 120 });
f('celery',                 [14, 0.7, 3, 1.3, 0.2, 0, 1.6, 0.2], { each: 40, stalk: 40 });
f('bean',                   [31, 1.8, 7, 3.3, 0.2, 0, 2.7, 0], {});
f('cabbage',                [25, 1.3, 5.8, 3.2, 0.1, 0, 2.5, 0], { each: 900, head: 900, handful: 30 });
f('red-cabbage',            [31, 1.4, 7.4, 3.8, 0.2, 0, 2.1, 0], { each: 900, head: 900 });
f('chinese-cabbage',        [13, 1.2, 2.2, 1.4, 0.2, 0, 1.2, 0.1], { each: 800 });
f('lettuce',                [15, 1.4, 2.9, 0.8, 0.2, 0, 1.3, 0], { each: 300, head: 300, handful: 30 });
f('little-gem',             [15, 1.4, 2.9, 0.8, 0.2, 0, 1.3, 0], { each: 100, head: 100 });
f('spinach',                [23, 2.9, 3.6, 0.4, 0.4, 0.1, 2.2, 0.2], { handful: 30 });
f('walnuts',                [654, 15, 14, 2.6, 65, 6, 6.7, 0], { tbsp: 8 });
f('almonds',                [600, 21, 7, 4, 54, 4, 7, 0], { tbsp: 8 });
f('pine-nuts',              [673, 14, 13, 3.6, 68, 4.9, 3.7, 0], { tbsp: 9 });
f('hazelnuts',              [628, 15, 17, 4.3, 61, 4.5, 9.7, 0], { tbsp: 9 });
f('pistachios',             [560, 20, 28, 8, 45, 5.6, 10, 0], { tbsp: 9 });
f('pumpkin-seeds',          [559, 30, 11, 1.4, 49, 8.7, 6, 0], { tbsp: 9 });
f('pumpkin-seeds-shell',    [446, 19, 54, 0, 19, 3.7, 18, 0], {});
f('leek',                   [61, 1.5, 14, 3.9, 0.3, 0, 1.8, 0], { each: 200 });
f('pea',                    [81, 5.4, 14, 5.7, 0.4, 0.1, 5.1, 0], {});
f('wine',                   [82, 0.1, 2.6, 1, 0, 0, 0, 0], {});
f('baking-powder',          [53, 0, 28, 0, 0, 0, 0, 26.7], { tbsp: 12 });
f('mozzarella',             [254, 18, 2, 1, 20, 13, 0, 0.5], { ball: 125, each: 125 });
f('kale',                   [49, 4.3, 8.8, 2.3, 0.9, 0.1, 3.6, 0.1], { bunch: 200, handful: 30 });
f('olives',                 [115, 0.8, 6, 0, 10.7, 1.4, 3.2, 2.1], { each: 4, handful: 40 });
f('rice',                   [350, 7, 78, 0.2, 0.6, 0.2, 1.3, 0], {});
f('cooked-rice',            [130, 2.7, 28, 0, 0.3, 0.1, 0.4, 0], {});
f('pumpkin',                [26, 1, 6.5, 2.8, 0.1, 0, 0.5, 0], { each: 2000 });
f('butternut',              [45, 1, 11.7, 2.2, 0.1, 0, 2, 0], { each: 1000 });
f('cauliflower',            [25, 1.9, 5, 1.9, 0.3, 0.1, 2, 0], { each: 600, head: 600 });
f('pork-mince',             [220, 19, 0, 0, 16, 6, 0, 0.15], {});
f('sausage',                [270, 13, 10, 1.5, 20, 7, 0.8, 1.6], { each: 57 });
f('goats-cheese',           [320, 21, 1, 1, 26, 18, 0, 1.2], {});
f('aubergine',              [25, 1, 6, 3.5, 0.2, 0, 3, 0], { each: 300 });
f('pak-choi',               [13, 1.5, 2.2, 1.2, 0.2, 0, 1, 0.2], { each: 150, head: 150 });
f('parsnip',                [75, 1.2, 18, 4.8, 0.3, 0, 4.9, 0], { each: 150 });
f('sweetcorn',              [86, 3.3, 19, 3.2, 1.4, 0.3, 2.7, 0], { each: 150 });
f('broad-bean',             [88, 7.9, 11.7, 1.5, 0.6, 0.1, 5.4, 0], {});
f('borlotti',               [118, 8, 21, 0.5, 0.5, 0.1, 6, 0], { tin: 240 });
f('ricotta',                [150, 11, 3, 3, 10, 6.4, 0, 0.2], { tbsp: 15 });
f('coconut-milk',           [197, 1.6, 2.8, 2.8, 20, 17.6, 0, 0.1], { tin: 400 });
f('rocket',                 [25, 2.6, 3.7, 2, 0.7, 0.1, 1.6, 0], { handful: 20 });
f('blue-cheese',            [410, 24, 0, 0, 35, 23, 0, 2.3], {});
f('celeriac',               [42, 1.5, 9.2, 1.6, 0.3, 0.1, 1.8, 0.2], { each: 700 });
f('yeast',                  [325, 40, 41, 0, 7.6, 1, 27, 0.13], { tbsp: 9 });
f('beef-mince',             [220, 19, 0, 0, 15, 6.5, 0, 0.15], {});
f('lean-beef-mince',        [125, 21, 0, 0, 5, 2.2, 0, 0.15], {});
f('stewing-beef',           [160, 22, 0, 0, 8, 3.3, 0, 0.15], {});
f('lamb-leg',               [150, 15, 0, 0, 9.8, 4.5, 0, 0.11], {}); /* bone in */
f('calabrese',              [34, 2.8, 6.6, 1.7, 0.4, 0, 2.6, 0], { each: 350, head: 350 });
f('romanesco',              [31, 2.5, 5, 2, 0.3, 0, 2.5, 0], { each: 600, head: 600 });
f('anchovy',                [210, 29, 0, 0, 10, 2.2, 0, 9], { each: 4 });
f('sprouts',                [43, 3.4, 9, 2.2, 0.3, 0, 3.8, 0], { each: 15 });
f('chard',                  [19, 1.8, 3.7, 1.1, 0.2, 0, 1.6, 0.5], { bunch: 300 });
f('oats',                   [375, 11, 60, 1, 8, 1.5, 9, 0], { tbsp: 8 });
f('dark-chocolate',         [598, 7.8, 46, 24, 43, 24, 11, 0.03], {});
f('cocoa',                  [312, 23, 12, 0.5, 21, 13, 28, 0.15], { tbsp: 7 });
f('gherkin',                [12, 0.6, 2.2, 1.4, 0.1, 0, 1, 0], { each: 30 });
f('pickled-gherkin',        [14, 0.6, 2.5, 1.6, 0.1, 0, 1, 2.1], { each: 25 });
f('white-fish',             [82, 18, 0, 0, 0.7, 0.1, 0, 0.2], { each: 140 });
f('fish-pie-mix',           [140, 20, 0, 0, 6, 1.2, 0, 1], {});
f('radish',                 [16, 0.7, 3.4, 1.9, 0.1, 0, 1.6, 0], { each: 10 });
f('asparagus',              [20, 2.2, 3.9, 1.9, 0.1, 0, 2.1, 0], { each: 20 });
f('radicchio',              [23, 1.4, 4.5, 0.6, 0.3, 0, 0.9, 0], { each: 300, head: 300 });
f('chicory',                [17, 0.9, 4, 0.7, 0.2, 0, 3.1, 0], { each: 120, head: 120 });
f('endive',                 [17, 1.3, 3.4, 0.3, 0.2, 0, 3.1, 0], { each: 400, head: 400 });
f('kohlrabi',               [27, 1.7, 6.2, 2.6, 0.1, 0, 3.6, 0], { each: 250 });
f('fennel',                 [31, 1.2, 7.3, 3.9, 0.2, 0, 3.1, 0.1], { each: 250 });
f('watercress',             [11, 2.3, 1.3, 0.2, 0.1, 0, 0.5, 0.1], { handful: 20 });
f('jerusalem-artichoke',    [73, 2, 17, 9.6, 0, 0, 1.6, 0], {});
f('marrow',                 [12, 0.5, 2.2, 1.6, 0.2, 0, 0.6, 0], { each: 1500 });
f('squash',                 [18, 1.2, 3.4, 2.2, 0.2, 0, 1.1, 0], { each: 150 });
f('broccoli',               [35, 3, 6, 1.5, 0.4, 0, 2.6, 0], {});
f('bacon',                  [215, 14, 0.5, 0, 17, 6.5, 0, 2.8], {});
f('mooli',                  [18, 0.6, 4.1, 2.5, 0.1, 0, 1.6, 0], { each: 600 });
f('greens',                 [22, 2.2, 3.5, 1, 0.3, 0, 2, 0.1], { handful: 30, each: 150, head: 150, bunch: 200 });
f('swede',                  [37, 1.1, 8.6, 4.5, 0.2, 0, 2.3, 0], { each: 700 });
f('turnip',                 [28, 0.9, 6.4, 3.8, 0.1, 0, 1.8, 0.1], { each: 100 });
f('salsify',                [82, 3.3, 18.6, 2.9, 0.2, 0, 3.3, 0], {});
f('sweet-potato',           [86, 1.6, 20, 4.2, 0.1, 0, 3, 0.1], { each: 250 });
f('globe-artichoke',        [47, 3.3, 10.5, 1, 0.2, 0, 5.4, 0.2], { each: 120 }); /* edible part */
f('edamame-pods',           [67, 6, 5.5, 1.2, 2.9, 0.3, 2.9, 0], {});
f('horseradish',            [48, 1.2, 11, 8, 0.7, 0, 3.3, 0.8], { tbsp: 15 });
f('popcorn',                [375, 11, 74, 0.9, 4.3, 0.6, 15, 0], {});
f('vanilla',                [288, 0, 13, 13, 0, 0, 0, 0], { tbsp: 13, each: 4 });
f('custard',                [100, 3, 15, 11, 3, 2, 0, 0.15], {});
f('granola',                [450, 10, 62, 20, 17, 3, 7, 0.1], { tbsp: 10 });
f('angelica',               [20, 0.7, 4, 1.5, 0.2, 0, 1.6, 0.1], {});
f('tinned-beans',           [110, 8, 17, 0.5, 0.6, 0.1, 7, 0.3], { tin: 240, each: 240 });
f('chickpeas',              [125, 7.2, 17, 0.4, 2.9, 0.3, 4.8, 0.3], { tin: 240 });
f('lentils',                [318, 24, 48, 2, 1.3, 0.2, 11, 0], {});
f('bulgur',                 [342, 12, 76, 0.4, 1.3, 0.2, 12.5, 0], {});
f('cream-cheese',           [253, 5.5, 4, 3.5, 24, 15, 0, 0.75], { tbsp: 15 });
f('citric-acid',            [0, 0, 0, 0, 0, 0, 0, 0], {});
f('condensed-milk',         [321, 8, 54, 54, 8.7, 5.5, 0, 0.3], { tin: 397 });
f('meringue',               [395, 5, 94, 94, 0, 0, 0, 0.3], { each: 13 });
f('gin',                    [222, 0, 0, 0, 0, 0, 0, 0], {}); /* per 100 ml, energy from alcohol */
f('pepper',                 [0, 0, 0, 0, 0, 0, 0, 0], { each: 0.1 }); /* black pepper: too little to count */
f('lasagne',                [359, 12.5, 72, 3.2, 1.5, 0.3, 3, 0], { each: 20, sheet: 20 });
f('filo',                   [300, 9, 60, 2, 2, 0.3, 2, 1], { each: 25, sheet: 25 });
f('pork',                   [220, 19, 0, 0, 16, 6, 0, 0.15], {});
export const FOODS = F;

/* Label rules: [pattern on the lower-case ingredient label, food]. First match wins. */
const RULES = [
  [/^water$|cold water|boiling water|sparkling water|^ice\b/, 'water'],
  [/\bzest\b/, 'zest'],
  [/^garlic\b|garlic cloves?|cloves? of garlic/, 'garlic'],
  [/lemon.*juice|juice of .*lemon|lemons?, (juiced|squeezed)/, 'lemon-juice'],
  [/lime.*juice|limes?, (juiced|zested and juiced)/, 'lime'],
  [/sesame oil|sesame or vegetable oil/, 'sesame-oil'],
  [/rapeseed|vegetable oil|sunflower oil|oil for frying|for frying|groundnut/, 'veg-oil'],
  [/olive oil|^oil\b/, 'olive-oil'],
  [/chicken stock/, 'chicken-stock'],
  [/stock/, 'veg-stock'],
  [/icing sugar/, 'icing-sugar'],
  [/brown sugar|muscovado|demerara/, 'brown-sugar'],
  [/sugar/, 'sugar'],
  [/self-raising/, 'sr-flour'],
  [/strong .*flour|bread flour/, 'bread-flour'],
  [/wholemeal/, 'wholemeal-flour'],
  [/cornflour/, 'cornflour'],
  [/\bflour\b/, 'plain-flour'],
  [/baking powder|bicarbonate/, 'baking-powder'],
  [/double cream|whipping cream/, 'double-cream'],
  [/soured cream|sour cream/, 'soured-cream'],
  [/cr[eè]me fra[iî]che/, 'creme-fraiche'],
  [/cream cheese/, 'cream-cheese'],
  [/\bcream\b/, 'single-cream'],
  [/coconut milk/, 'coconut-milk'],
  [/condensed milk/, 'condensed-milk'],
  [/whole milk/, 'whole-milk'],
  [/greek yoghurt|greek-style/, 'greek-yoghurt'],
  [/yoghurt|yogurt/, 'yoghurt'],
  [/cherry tomato/, 'cherry-tomato'],
  [/green tomato/, 'green-tomato'],
  [/tinned tomato|chopped tomatoes \(tin|passata/, 'tinned-tomato'],
  [/balsamic/, 'balsamic'],
  [/vinegar/, 'vinegar'],
  [/fish sauce/, 'fish-sauce'],
  [/soy sauce|tamari/, 'soy'],
  [/worcestershire/, 'worcestershire'],
  [/dijon/, 'dijon'],
  [/wholegrain mustard/, 'wholegrain-mustard'],
  [/english mustard/, 'english-mustard'],
  [/mustard powder/, 'mustard-powder'],
  [/mustard seed/, 'mustard-seeds'],
  [/chilli flakes|gochugaru|chilli powder/, 'chilli-flakes'],
  [/pepper ?corns|black pepper|salt and pepper/, 'pepper'],
  [/sea salt|pickling salt|flaky salt|^salt\b/, 'salt'],
  [/banana shallot/, 'banana-shallot'],
  [/spring onion/, 'spring-onion'],
  [/new potato|baby potato/, 'new-potato'],
  [/little gem/, 'little-gem'],
  [/red cabbage/, 'red-cabbage'],
  [/cabbage or kale/, 'cabbage'],
  [/whole chicken/, 'whole-chicken'],
  [/chicken thighs?\b(?! or)/, 'chicken-thigh'],
  [/chicken breast/, 'chicken-breast'],
  [/sausage/, 'sausage'],
  [/beef mince \(5%/, 'lean-beef-mince'],
  [/beef or lamb mince|beef mince|lamb mince/, 'beef-mince'],
  [/stewing beef|braising steak/, 'stewing-beef'],
  [/leg of lamb/, 'lamb-leg'],
  [/minced pork/, 'pork-mince'],
  [/fish pie mix/, 'fish-pie-mix'],
  [/white fish|\bcod\b|haddock/, 'white-fish'],
  [/pickled gherkin/, 'pickled-gherkin'],
  [/baguette or ciabatta slice|baguette slice/, 'baguette-slice'],
  [/baguette/, 'baguette'],
  [/breadcrumbs/, 'breadcrumbs'],
  [/flatbread|naan/, 'flatbread'],
  [/lasagne sheet/, 'lasagne'],
  [/filo/, 'filo'],
  [/puff pastry/, 'puff-pastry'],
  [/pastry/, 'shortcrust'],
  [/gruy[eè]re/, 'gruyere'],
  [/cheddar/, 'cheddar'],
  [/stilton|blue cheese/, 'blue-cheese'],
  [/goat'?s cheese/, 'goats-cheese'],
  [/pine nuts/, 'pine-nuts'],
  [/pumpkin seeds|sunflower seeds/, 'pumpkin-seeds'],
  [/seeds from .*pumpkin/, 'pumpkin-seeds-shell'],
  [/cobnut|hazelnut/, 'hazelnuts'],
  [/elderflower/, 'flowers'],
  [/cinnamon|cloves?$|allspice|nutmeg|cumin|coriander seed|ground coriander|turmeric|paprika|ground ginger|star anise|pickling spice|cardamom|fennel seed|caraway|mixed spice|bay lea/, 'spice'],
  [/flowers|petals|blossom/, 'flowers'],
  [/cooked rice/, 'cooked-rice'],
  [/kidney beans|black beans|cannellini|butter beans/, 'tinned-beans'],
  [/vanilla/, 'vanilla'],
  [/tomato ketchup/, 'ketchup'],
  [/curry paste/, 'curry-paste'],
  [/dumpling wrapper/, 'dumpling-wrapper'],
  [/cooking apple/, 'cooking-apple'],
  [/edamame/, 'edamame-pods'],
  [/sultanas|raisins/, 'raisins'],
];

/* Ingredient key -> food, where the key is not itself a food id */
const KEY_FOOD = {
  'oil': 'olive-oil', 'olive oil': 'olive-oil', 'brown sugar': 'brown-sugar', 'icing sugar': 'icing-sugar', 'stock': 'veg-stock',
  'flour': 'plain-flour', 'cream': 'single-cream', 'mustard': 'dijon', 'thyme': 'herb', 'mint': 'herb', 'basil': 'herb',
  'parsley': 'herb', 'coriander': 'herb', 'chives': 'herb', 'sage': 'herb', 'dill': 'herb', 'rosemary': 'herb', 'oregano': 'herb',
  'tarragon': 'herb', 'lovage': 'herb', 'savory': 'herb', 'chervil': 'herb', 'bronze-fennel': 'herb', 'lemon-balm': 'herb',
  'lemon-verbena': 'herb', 'bay': 'spice', 'garlic-chives': 'herb', 'sweet-cicely': 'herb', 'hyssop': 'herb', 'sweet-marjoram': 'herb',
  'lemongrass': 'herb', 'chamomile': 'flowers', 'lavender': 'flowers', 'calendula': 'flowers', 'borage': 'flowers', 'viola': 'flowers',
  'nasturtium': 'leaves', 'winter-purslane': 'leaves', 'land-cress': 'leaves', 'lambs-lettuce': 'leaves', 'microgreens': 'leaves',
  'sorrel': 'leaves', 'orache': 'greens', 'perpetual-spinach': 'spinach', 'tatsoi': 'greens', 'komatsuna': 'greens', 'mizuna': 'leaves',
  'mustard-greens': 'greens', 'sea-kale': 'greens', 'swiss-chard': 'chard', 'brussels-sprouts': 'sprouts', 'calabrese': 'calabrese',
  'sprouting-broccoli': 'broccoli', 'scorzonera': 'salsify', 'patty-pan': 'squash', 'butternut-squash': 'butternut', 'pine nuts': 'pine-nuts',
  'pumpkin seeds': 'pumpkin-seeds', 'seeds': 'pumpkin-seeds', 'goat\'s cheese': 'goats-cheese', 'blue cheese': 'blue-cheese',
  'coconut milk': 'coconut-milk', 'cream cheese': 'cream-cheese', 'condensed milk': 'condensed-milk', 'dark chocolate': 'dark-chocolate',
  'chilli flakes': 'chilli-flakes', 'sesame oil': 'sesame-oil', 'fish sauce': 'fish-sauce', 'baking powder': 'baking-powder',
  'mustard seeds': 'mustard-seeds', 'sparkling water': 'water', 'citric acid': 'citric-acid', 'dumpling wrappers': 'dumpling-wrapper',
  'whitecurrant': 'redcurrant', 'hardy-kiwi': 'kiwi', 'borlotti-bean': 'borlotti', 'french-bean': 'bean', 'pea': 'pea',
  'cobnut': 'hazelnuts', 'peppercorns': 'pepper', 'beans': 'tinned-beans', 'paste': 'curry-paste', 'mince': 'beef-mince',
  'beef': 'stewing-beef', 'lamb': 'lamb-leg', 'fish': 'white-fish', 'nutmeg': 'spice', 'paprika': 'spice', 'mayonnaise': 'mayonnaise',
  'wild-garlic': 'wild-garlic', 'lettuce': 'lettuce', 'cabbage': 'cabbage', 'chinese-cabbage': 'chinese-cabbage', 'bread': 'bread',
  'sweet-pepper': 'sweet-pepper', 'butternut': 'butternut', 'jam': 'jam', 'lime': 'lime', 'lemon': 'lemon',
};

/* Recipes that make a batch: what one portion is, and either how many portions or the finished weight in grams.
   factor: share of an ingredient that ends up eaten (salt rinsed off, brine left in the jar, fruit strained out). */
const RINSED_SALT = { salt: 0.15 };
const BRINE = { vinegar: 0.3, sugar: 0.3, 'brown-sugar': 0.3, salt: 0.15, spice: 0.3 };
const STRAINED = { fruit: 0.6 };
export const BATCH = {
  'pesto':                    { portion: '1 tablespoon', g: 15 },
  'wild-garlic-pesto':        { portion: '1 tablespoon', g: 15 },
  'nasturtium-pesto':         { portion: '1 tablespoon', g: 15 },
  'chinese-cabbage-kimchi':   { portion: 'a small side helping (about 50 g)', g: 50, yield: 1100, factor: RINSED_SALT },
  'horseradish-sauce':        { portion: '1 tablespoon', g: 15 },
  'redcurrant-jelly':         { portion: '1 tablespoon', g: 15, yield: 1100, factor: STRAINED },
  'raspberry-loganberry-jam': { portion: '1 tablespoon', g: 15, yield: 1600 },
  'cobnut-honey-granola':     { portion: 'a 50 g bowlful', g: 50, yield: 540 },
  'elderberry-syrup':         { portion: '1 tablespoon', g: 15, yield: 450, factor: { fruit: 0.7 } },
  'quince-membrillo':         { portion: '1 slice (about 25 g)', g: 25, yield: 1400 },
  'physalis-chocolate':       { portion: '1 dipped physalis', portions: 20 },
  'tomatillo-salsa-verde':    { portion: '2 tablespoons', g: 30 },
  'coriander-chutney':        { portion: '2 tablespoons', g: 30 },
  'lavender-shortbread':      { portion: '1 biscuit', portions: 16 },
  'quick-pickled-gherkins':   { portion: '1 gherkin (about 30 g)', g: 30, yield: 500, factor: BRINE },
  'pickled-beetroot':         { portion: 'a 50 g helping', g: 50, yield: 900, factor: BRINE },
  'candied-angelica':         { portion: '1 piece (about 10 g)', g: 10, yield: 350, factor: { salt: 0 } },
  'blackcurrant-cordial':     { portion: '25 ml of cordial (one glass, diluted)', g: 25, yield: 1000, factor: { fruit: 0.5 } },
  'rhubarb-ginger-cordial':   { portion: '25 ml of cordial (one glass, diluted)', g: 25, yield: 750, factor: { fruit: 0.5 } },
  'raspberry-shrub':          { portion: '25 ml of shrub (one glass, diluted)', g: 25, yield: 500, factor: { fruit: 0.5 } },
  'elderflower-cordial':      { portion: '25 ml of cordial (one glass, diluted)', g: 25, yield: 1500, factor: { lemon: 0.3 } },
  'beetroot-brownies':        { portion: '1 square', portions: 16 },
  'roast-tomato-sauce':       { portion: '150 ml (enough for one plate of pasta)', g: 150, yield: 1500 },
  'green-tomato-chutney':     { portion: '1 tablespoon', g: 20, yield: 1800 },
  'runner-bean-chutney':      { portion: '1 tablespoon', g: 20, yield: 1800 },
  'strawberry-jam':           { portion: '1 tablespoon', g: 15, yield: 1800 },
  'chilli-jam':               { portion: '1 tablespoon', g: 15, yield: 1300 },
  'garlic-herb-butter':       { portion: '1 slice (about 10 g)', g: 10 },
  'piccalilli':               { portion: '1 tablespoon', g: 20, yield: 1800, factor: RINSED_SALT },
  'plum-jam':                 { portion: '1 tablespoon', g: 15, yield: 1800 },
  'bramble-jelly':            { portion: '1 tablespoon', g: 15, yield: 1300, factor: STRAINED },
  'blackcurrant-jam':         { portion: '1 tablespoon', g: 15, yield: 2200 },
  'pickled-red-cabbage':      { portion: 'a 40 g helping', g: 40, yield: 800, factor: BRINE },
  'pickled-onions':           { portion: '2 onions (about 30 g)', g: 30, yield: 1000, factor: BRINE },
  'tomato-ketchup':           { portion: '1 tablespoon', g: 15, yield: 500 },
  'cheese-chive-scones':      { portion: '1 scone', portions: 8 },
  'rhubarb-gin':              { portion: 'a 25 ml measure', g: 25, yield: 1000, factor: { fruit: 0.3 } },
};
const FRUIT = new Set(['redcurrant', 'blackcurrant', 'blackberry', 'raspberry', 'loganberry', 'elderberry', 'rhubarb', 'cooking-apple', 'apple', 'quince', 'plum', 'strawberry', 'gooseberry']);

/* ---------- reading quantities ---------- */
const UNIT_WORDS = {
  g: 'g', kg: 'kg', ml: 'ml', litre: 'l', litres: 'l', tsp: 'tsp', tbsp: 'tbsp', cm: 'cm', pinch: 'pinch',
  handful: 'handful', handfuls: 'handful', bunch: 'bunch', bunches: 'bunch', head: 'head', heads: 'head', clove: 'clove', cloves: 'clove',
  slice: 'slice', slices: 'slice', sheet: 'sheet', ball: 'ball', nest: 'nest', nests: 'nest', loaf: 'loaf', thumb: 'thumb',
  piece: 'each', tin: 'tin', tins: 'tin', block: 'block', knob: 'knob',
};
const SIZE = { small: 0.65, medium: 1, large: 1.5, thick: 1.3, generous: 1.3 };
function num(t) {
  const m = t.match(/^(\d+)\s+(\d+)\/(\d+)$/); if (m) return +m[1] + m[2] / m[3];
  const fr = t.match(/^(\d+)\/(\d+)$/); if (fr) return fr[1] / fr[2];
  return parseFloat(t);
}
const NUM = String.raw`(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)`;

/* One ingredient line -> grams of its food (null when it cannot be read). */
function grams(qty, label, food) {
  const w = FOODS[food].w, d = w.d || 1;
  const q = qty.toLowerCase().trim(), lab = label.toLowerCase();
  const perUnit = (unit, size = 1) => {
    switch (unit) {
      case 'g': return 1; case 'kg': return 1000; case 'ml': return d; case 'l': return 1000 * d;
      case 'tbsp': return (w.tbsp ?? 15 * d) * size;
      case 'tsp': return (w.tbsp ?? 15 * d) / 3 * size;
      case 'pinch': return (w.pinch ?? 0.4) * size;
      case 'handful': return (w.handful ?? 30) * size;
      case 'bunch': return (w.bunch ?? 80) * size;
      case 'head': return (w.head ?? w.each ?? 300) * size;
      case 'clove': return 5 * size;
      case 'slice': return (w.slice ?? 30) * size;
      case 'sheet': return (w.sheet ?? 320) * size;
      case 'ball': return (w.ball ?? 125) * size;
      case 'nest': return (w.nest ?? 60) * size;
      case 'loaf': return (w.loaf ?? 400) * size;
      case 'thumb': return (w.thumb ?? 15) * size;
      case 'cm': return (w.cm ?? 5) * size;
      case 'tin': return (w.tin ?? 400) * size;
      case 'block': return (w.block ?? 200) * size;
      case 'knob': return (w.knob ?? 10) * size;
      case 'each': {
        /* the label can say what is being counted: sprigs, leaves, stalks */
        if (/sprig/.test(lab) && w.sprig) return w.sprig * size;
        if (/\blea(f|ves)\b/.test(lab) && w.leaf) return w.leaf * size;
        if (/\bstalks?\b|\bsticks?\b/.test(lab) && (w.stalk || w.stick)) return (w.stalk || w.stick) * size;
        if (/\bslices\b/.test(lab) && w.slice) return w.slice * size;
        if (/\bheads?\b/.test(lab) && w.head) return w.head * size;
        if (/\bbulbs?\b/.test(lab) && w.bulb) return w.bulb * size;
        if (/\btins?\b/.test(lab) && w.tin) return w.tin * size;
        return w.each != null ? w.each * size : null;
      }
    }
    return null;
  };

  /* "4 medium (about 800 g)": use the weight in brackets */
  const inBrackets = q.match(new RegExp(`\\(about ${NUM}\\s*(g|kg)\\)`));
  if (inBrackets) return num(inBrackets[1]) * (inBrackets[2] === 'kg' ? 1000 : 1);
  /* "400 ml tin", "320 g sheet", "200 g block": one pack of that size */
  const pack = q.match(/^(\d+(?:\.\d+)?)\s*(g|ml)\s+(tin|sheet|block)$/);
  if (pack) return +pack[1] * (pack[2] === 'ml' ? d : 1) * (food === 'chickpeas' || food === 'tinned-beans' ? 0.6 : 1);

  /* Words with no number */
  const words = {
    'pinch': perUnit('pinch'), 'to taste': 0, 'generous': 0, 'splash': 10 * d, 'squeeze': 5 * d, 'few drops': 1,
    'small knob': 8, 'thumb-sized piece': 15, 'for shallow frying': 30,
  };
  if (q in words) return words[q];
  let m = q.match(/^(?:a\s+)?(small|large)?\s*(handful|bunch)$/);
  if (m) return perUnit(m[2], SIZE[m[1] || 'medium']);

  /* "1 each" / "1 tsp each": once for each item named in the label ("Mustard powder and ground turmeric") */
  let times = 1, rest = q;
  if (/\beach$/.test(q)) { times = label.split(/,|\band\b/).filter((s) => s.trim()).length; rest = q.replace(/\s*each$/, ''); }

  /* One or more amounts: "2 tbsp and 1 tbsp", "1 tsp, 1/2 tsp, 1/2 tsp", "1–2", "about 300 g", "2 large handfuls" */
  const re = new RegExp(`${NUM}(?:\\s*[–-]\\s*${NUM})?(?:\\s*(kg|g|ml|litres?|tbsp|tsp|cm)\\b)?(?:\\s+(small|medium|large|thick|fresh))?(?:\\s+([a-z]+))?`, 'g');
  let total = 0, found = false;
  rest = rest.replace(/^about\s+/, '');
  for (const a of rest.matchAll(re)) {
    found = true;
    const n = a[2] ? (num(a[1]) + num(a[2])) / 2 : num(a[1]);
    const size = SIZE[a[4]] || 1;
    let unit = a[3] ? UNIT_WORDS[a[3]] : (a[5] && UNIT_WORDS[a[5]]) || 'each';
    if (a[5] === 'pinch') unit = 'pinch';
    const g = perUnit(unit, size);
    if (g == null) return null;
    total += n * g;
  }
  if (!found) return null;
  return total * times;
}

function foodFor(key, label) {
  const lab = label.toLowerCase().replace(/\(or [^)]*\)/g, '');
  for (const [re, id] of RULES) if (re.test(lab)) return id;
  if (KEY_FOOD[key]) return KEY_FOOD[key];
  if (FOODS[key]) return key;
  return null;
}

const leftOut = (label, qty) => /\boptional\b|\bto serve\b|to garnish|for serving/i.test(label) || /optional/i.test(qty);

/* Totals for one recipe: { values (per portion), portion, portions, unread: [labels] } */
export function recipeNutrition(r) {
  const batch = BATCH[r.id];
  const sum = Object.fromEntries(ORDER.map((k) => [k, 0]));
  const unread = [];
  let weight = 0;
  for (const [key, label, qty] of r.ingredients) {
    if (leftOut(label, qty)) continue;
    const food = foodFor(key, label);
    if (!food) { unread.push(`${qty} ${label} (no food for "${key}")`); continue; }
    const g = grams(qty, label, food);
    if (g == null) { unread.push(`${qty} ${label} (cannot weigh)`); continue; }
    let share = 1;
    const fac = batch?.factor;
    if (fac) {
      if (fac[food] != null) share = fac[food];
      else if (fac.fruit != null && FRUIT.has(food)) share = fac.fruit;
    }
    weight += g * share;
    FOODS[food].n.forEach((v, i) => { sum[ORDER[i]] += v * g / 100 * share; });
  }
  let portions, portion;
  if (batch) {
    portion = batch.portion;
    portions = batch.portions || (batch.yield || weight) / batch.g;
  } else {
    const m = String(r.serves).match(/^(\d+)(?:\s*[–-]\s*(\d+))?$/);
    if (!m) { unread.push(`serves "${r.serves}" (no BATCH entry)`); return { values: null, unread }; }
    portions = m[2] ? (+m[1] + +m[2]) / 2 : +m[1];
    portion = m[2] ? `1 serving (if it serves ${Math.round(portions)})` : '1 serving';
  }
  const values = Object.fromEntries(ORDER.map((k) => [k, sum[k] / portions]));
  return { values, portion, portions, unread };
}

/* "312 kcal", "12 g", "0.8 g", "<0.1 g" */
export function fmtNutrient(key, v) {
  if (key === 'kcal') return `${v < 10 ? Math.round(v) : Math.round(v / 5) * 5} kcal`;
  if (key === 'salt') return v < 0.05 ? '0 g' : `${(Math.round(v * 10) / 10).toFixed(1)} g`;
  if (v < 0.5) return v < 0.05 ? '0 g' : `${(Math.round(v * 10) / 10).toFixed(1)} g`;
  return v < 10 ? `${Math.round(v * 10) / 10} g` : `${Math.round(v)} g`;
}
