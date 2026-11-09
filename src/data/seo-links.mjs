/* Pages close to Google's first page get a one-line quick answer under the heading,
   worded the way people search, and extra links from closely related pages.
   Keys are page paths. Keep each answer to one or two short sentences that match the page. */

export const QUICK_ANSWERS = {
  '/plants/mooli/': 'Harvest mooli 8–10 weeks after sowing, from October onwards, when the roots are 20–30 cm long and about 5 cm wide. Lift them before hard frosts.',
  '/recipes/nasturtium-pesto/': 'Blitz nasturtium leaves and flowers with garlic, parmesan, toasted pumpkin seeds, olive oil and lemon juice. It takes 10 minutes and keeps for 5 days in the fridge.',
  '/recipes/sea-kale-brown-butter/': 'Steam sea kale shoots for 8–10 minutes until just tender, like asparagus, then pour over nutty brown butter and a squeeze of lemon. Ready in 15 minutes.',
  '/plants/radicchio/': 'Radicchio is in season in the UK from October to December. Sow it in June or July and cut the heads when they feel firm.',
  '/plants/strawberry/': 'The best time to plant strawberries in the UK is August to September, for a full crop the next summer. You can also plant in March or April for a lighter first crop.',
  '/plants/salsify/': 'Salsify is a slender winter root that tastes a little like oysters or artichoke. Sow it in April or May and lift the roots from October through the winter.',
  '/pests/white-blister/': 'White blister shows as raised, chalky white spots on brassicas such as rocket, radish, mooli and Brussels sprouts. Pick off affected leaves; the damage is mostly cosmetic and plants keep growing.',
};

/* Links into the near-page-one pages: [link text, page]. */
const IN = {
  mooli: ['Mooli (daikon): when to sow and harvest', '/plants/mooli/'],
  pesto: ['Nasturtium pesto recipe', '/recipes/nasturtium-pesto/'],
  seaKaleRecipe: ['Sea kale with brown butter and lemon', '/recipes/sea-kale-brown-butter/'],
  radicchio: ['Radicchio: when it is in season in the UK', '/plants/radicchio/'],
  strawberry: ['Best time to plant strawberries', '/plants/strawberry/'],
  salsify: ['How to grow salsify', '/plants/salsify/'],
  whiteBlister: ['White blister on brassicas', '/pests/white-blister/'],
  storeVeg: ['How to store your veg over winter', '/guides/storing-veg-over-winter/'],
  christmas: ['Christmas dinner from the veg patch', '/guides/christmas-dinner-from-the-veg-patch/'],
  garlicPots: ['How to grow garlic in pots', '/guides/growing-garlic-in-pots/'],
};

/* Page path -> links to show in a "Related" box at the end of that page. */
export const RELATED_LINKS = {
  '/plants/radish/': [IN.mooli],
  '/plants/chinese-cabbage/': [IN.mooli],
  '/plants/turnip/': [IN.mooli],
  '/plants/pak-choi/': [IN.mooli],
  '/recipes/chinese-cabbage-kimchi/': [IN.mooli],

  '/plants/basil/': [IN.pesto],
  '/plants/rocket/': [IN.pesto],
  '/plants/wild-garlic/': [IN.pesto],
  '/recipes/pesto/': [IN.pesto],
  '/recipes/wild-garlic-pesto/': [IN.pesto],
  '/recipes/pesto-potato-bean-pasta/': [IN.pesto],

  '/plants/sea-kale/': [IN.seaKaleRecipe],
  '/plants/asparagus/': [IN.seaKaleRecipe],
  '/plants/kale/': [IN.seaKaleRecipe],
  '/recipes/asparagus-chive-omelette/': [IN.seaKaleRecipe],
  '/recipes/salsify-brown-butter/': [IN.seaKaleRecipe, IN.salsify],

  '/plants/chicory/': [IN.radicchio],
  '/plants/endive/': [IN.radicchio],
  '/plants/lettuce/': [IN.radicchio],

  '/plants/raspberry/': [IN.strawberry],
  '/plants/blueberry/': [IN.strawberry],
  '/plants/rhubarb/': [IN.strawberry],
  '/weekend-jobs/august/': [IN.strawberry],
  '/weekend-jobs/september/': [IN.strawberry],
  '/recipes/strawberry-jam/': [IN.strawberry],

  '/plants/scorzonera/': [IN.salsify],
  '/plants/parsnip/': [IN.salsify],
  '/plants/jerusalem-artichoke/': [IN.salsify],
  '/plants/horseradish/': [IN.salsify],

  '/pests/clubroot/': [IN.whiteBlister],
  '/pests/flea-beetle/': [IN.whiteBlister],
  '/pests/downy-mildew/': [IN.whiteBlister],

  '/preserving/': [IN.storeVeg],
  '/harvest/': [IN.storeVeg],
  '/what-to-preserve/october/': [IN.storeVeg],
  '/what-to-preserve/november/': [IN.storeVeg],
  '/what-to-sow/october/': [IN.garlicPots],
  '/what-to-sow/november/': [IN.garlicPots],
  '/what-to-sow/march/': [IN.christmas],
  '/sizes/balcony/': [IN.garlicPots],
  '/weekend-jobs/october/': [IN.storeVeg, IN.garlicPots],
  '/weekend-jobs/november/': [IN.storeVeg, IN.garlicPots],
  '/weekend-jobs/december/': [IN.christmas],
  '/recipes/garlic-bread/': [IN.garlicPots],
  '/recipes/roast-elephant-garlic/': [IN.garlicPots],
};
