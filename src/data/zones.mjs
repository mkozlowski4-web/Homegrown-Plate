/* Regional timing zones. "off" is a shift in half-months (about 2 weeks each): negative is earlier, positive is later,
   relative to the central England dates used as the default on the site. Postcode areas are matched by their leading letters. */
export const ZONES = [
  { id: 'mild', name: 'Mild south-west and south coast', off: -2, blurb: 'Cornwall, Devon, Dorset and the milder coastal strip, where frosts end early.' },
  { id: 'south', name: 'London, south and south-east England', off: -1, blurb: 'Warm lowlands and cities, with the last frosts a little earlier than the Midlands.' },
  { id: 'central', name: 'Midlands, East Anglia, Wales and central England', off: 0, blurb: 'The typical dates shown on the site by default.' },
  { id: 'north', name: 'Northern England, Northern Ireland and upland Wales', off: 1, blurb: 'Cooler springs, with the growing season starting around 2 weeks later.' },
  { id: 'scotland', name: 'Southern and central Scotland', off: 2, blurb: 'A later spring and an earlier autumn, around 4 weeks behind central England.' },
  { id: 'highlands', name: 'Northern Scotland and the islands', off: 3, blurb: 'The shortest season, around 6 weeks behind central England.' },
];

const AREAS = {
  mild: 'TR PL TQ EX DT BH BN PO JE GY',
  south: 'E EC N NW SE SW W WC BR CR DA EN HA IG KT RM SM TW UB WD AL CM CT GU ME RH SL SO SP SS TN RG OX SG HP BA BS TA GL CO SN',
  central: 'B CV CW DE DY HR IM IP LE LL LN LU MK NG NN NR PE SK ST SY TF WA WN WR WS WV CB CH FY L M PR BL OL CF NP SA',
  north: 'BB BD BT CA DH DL DN HD HG HU HX LA LD LS NE S SR TS WF YO',
  scotland: 'AB DD DG EH FK G KA KY ML PA PH TD',
  highlands: 'HS IV KW ZE',
};
export const AREA_ZONE = {};
for (const [zone, list] of Object.entries(AREAS)) for (const a of list.split(' ')) AREA_ZONE[a] = zone;
