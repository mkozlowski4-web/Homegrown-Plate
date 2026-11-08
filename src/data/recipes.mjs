import { SALADS_SOUPS_LEAVES } from './recipes/salads-soups-leaves.mjs';
import { MAINS_VEG } from './recipes/mains-veg.mjs';
import { DRINKS } from './recipes/drinks.mjs';
import { FRUIT_HERBS_PRESERVES } from './recipes/fruit-herbs-preserves.mjs';
import { BATCH_TWO } from './recipes/batch-two.mjs';
import { BATCH_THREE } from './recipes/batch-three.mjs';
/* Recipes. 'uses' lists crop ids; each ingredient is [crop id or keyword, label, quantity]. */
const BASE_RECIPES = [
  { id:"caprese-salad", title:"Tomato & Basil Salad", time:"10 min", serves:"2", uses:["tomato","basil"],
    ingredients:[["tomato","Ripe tomatoes, sliced","2 large"],["basil","Fresh basil leaves","a handful"],["olive oil","Extra virgin olive oil","2 tbsp"],["salt","Flaky salt","pinch"],["mozzarella","Mozzarella (optional)","1 ball"]],
    steps:["Slice tomatoes and arrange on a plate.","Tear basil leaves over the top.","Drizzle with olive oil and season with salt.","Add mozzarella if using, and serve at room temperature."],
    tips:["Use tomatoes that have ripened on the plant and have never been in the fridge, which dulls their flavour and texture.", "Tear the basil rather than cutting it so it does not bruise and blacken.", "Salt the tomatoes a few minutes before serving to bring out their juices, which also make the dressing."] },
  { id:"garden-salad", title:"Garden Salad with Radish & Herb Dressing", time:"15 min", serves:"2", uses:["lettuce","radish","mint","onion"],
    ingredients:[["lettuce","Lettuce leaves","1 head"],["radish","Radishes, thinly sliced","6"],["onion","Spring onion, finely sliced","1"],["mint","Mint, chopped","small handful"],["olive oil","Olive oil","3 tbsp"],["lemon","Lemon juice","1 tbsp"]],
    steps:["Tear the lettuce and place in a bowl.","Add sliced radishes and spring onion.","Whisk oil, lemon juice and chopped mint.","Dress just before serving."] },
  { id:"courgette-fritters", title:"Courgette Fritters", time:"25 min", serves:"3–4", uses:["courgette","onion","basil"],
    ingredients:[["courgette","Courgettes, grated","2 medium"],["onion","Onion, finely chopped","1 small"],["egg","Eggs","2"],["flour","Plain flour","4 tbsp"],["basil","Basil, chopped","small handful"],["oil","Oil for frying","2 tbsp"]],
    steps:["Squeeze grated courgette in a towel to remove moisture.","Mix with onion, eggs, flour, basil, salt and pepper.","Fry spoonfuls in hot oil for 2–3 minutes each side.","Drain on kitchen paper and serve warm."],
    tips:["Squeezing the courgette dry is the key step. If the mixture is still loose, add another spoonful of flour.", "Fry in batches without crowding the pan so each fritter crisps rather than steams.", "Keep them warm in a low oven. Leftovers reheat well in a hot oven or can be frozen between sheets of baking paper."] },
  { id:"kale-soup", title:"Garden Kale & Potato Soup", time:"40 min", serves:"4", uses:["kale","potato","onion","carrot"],
    ingredients:[["potato","Potatoes, diced","3 medium"],["kale","Kale, chopped","1 large bunch"],["onion","Onion, diced","1"],["carrot","Carrot, diced","2"],["stock","Vegetable stock","1 litre"],["oil","Olive oil","1 tbsp"]],
    steps:["Fry onion and carrot in oil for 5 minutes.","Add potatoes and stock; simmer for 15 minutes.","Stir in kale and cook for 5 more minutes.","Blend partly for a creamier texture, or serve chunky."] },
  { id:"ratatouille", title:"Summer Garden Ratatouille", time:"50 min", serves:"4", uses:["courgette","tomato","onion","basil"],
    ingredients:[["courgette","Courgettes, chunked","2"],["tomato","Tomatoes, chopped","4"],["onion","Onion, sliced","1"],["basil","Basil","handful"],["oil","Olive oil","3 tbsp"],["garlic","Garlic, minced","2 cloves"]],
    steps:["Fry onion and garlic in oil until soft.","Add courgette and cook 5 minutes.","Stir in tomatoes and simmer 25 minutes until thick.","Finish with torn basil and serve warm or cold."],
    tips:["Cook the vegetables in stages as in the method so each keeps its shape rather than turning to mush.", "Taste at the end and add a pinch of salt or a splash of vinegar to lift the flavours. It tastes better the next day.", "Freezes well for up to three months. Serve it with rice, crusty bread, or baked with an egg on top."] },
  { id:"bean-stir-fry", title:"Runner Bean & Garlic Stir-Fry", time:"15 min", serves:"2", uses:["bean","garlic","chilli","onion"],
    ingredients:[["bean","Runner beans, sliced diagonally","250 g"],["garlic","Garlic, sliced","2 cloves"],["chilli","Chilli, sliced","1"],["onion","Onion, sliced","1"],["soy","Soy sauce","1 tbsp"],["oil","Oil","1 tbsp"]],
    steps:["Heat oil in a wok until very hot.","Stir-fry beans 3–4 minutes until bright green.","Add onion, garlic and chilli for 1 minute.","Splash in soy sauce and serve with rice."] },
  { id:"strawberry-yoghurt", title:"Strawberry & Mint Yoghurt Bowl", time:"5 min", serves:"2", uses:["strawberry","mint"],
    ingredients:[["strawberry","Strawberries, halved","200 g"],["yoghurt","Greek yoghurt","300 g"],["mint","Mint, chopped","small handful"],["honey","Honey","1 tbsp"]],
    steps:["Spoon yoghurt into bowls.","Top with strawberries and chopped mint.","Drizzle with honey and serve."],
    tips:["Use strawberries picked the same day and left at room temperature for the best flavour, because fridge-cold fruit tastes dull.", "Thick Greek yoghurt holds the fruit best. Add the strawberries just before serving so they do not bleed into it.", "Swap the mint for basil, or crumble over a little granola for crunch."] },
  { id:"crispy-potato-hash", title:"Crispy Potato & Herb Hash", time:"30 min", serves:"2", uses:["potato","onion","spinach","chilli"],
    ingredients:[["potato","Potatoes, cubed","4 medium"],["onion","Onion, diced","1"],["spinach","Spinach","2 large handfuls"],["chilli","Chilli flakes","pinch"],["oil","Oil","2 tbsp"]],
    steps:["Parboil potato cubes for 5 minutes and drain.","Fry in hot oil until golden and crisp, about 15 minutes.","Add onion and cook until soft.","Stir in spinach until wilted and season with chilli flakes."],
    tips:["Drain the parboiled potatoes and let them steam dry for a few minutes, because dry potatoes crisp better.", "Leave the potatoes undisturbed for a few minutes at a time so a crust forms before you turn them.", "Top with a fried egg, or stir in any leftover cooked vegetables."] },
  { id:"pesto", title:"Fresh Basil Pesto", time:"10 min", serves:"makes 1 jar", uses:["basil","mint"],
    ingredients:[["basil","Basil leaves","large bunch"],["garlic","Garlic clove","1"],["olive oil","Olive oil","100 ml"],["parmesan","Parmesan, grated","50 g"],["pine nuts","Pine nuts or walnuts","30 g"]],
    steps:["Blitz basil, garlic and nuts in a food processor.","Slowly add oil while blending.","Stir in parmesan and season.","Store in a jar covered with a layer of oil."],
    tips:["Toast the nuts lightly first for a deeper flavour, and pick basil in the morning before the sun wilts it.", "Pulse rather than blitz for a rougher texture, and stir the cheese in by hand so the pesto does not turn bitter.", "Keeps for about a week in the fridge under a layer of oil. For longer, freeze it in ice cube trays and bag the cubes."] }
];

export const RECIPES = [...BASE_RECIPES, ...SALADS_SOUPS_LEAVES, ...MAINS_VEG, ...FRUIT_HERBS_PRESERVES, ...DRINKS, ...BATCH_TWO, ...BATCH_THREE];
