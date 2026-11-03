/* Regional weather for the signed-in weekend plan. Data: MET Norway Locationforecast 2.0 (CC BY 4.0, free for commercial use).
   One representative city per growing region keeps us well inside their terms: at most six upstream requests every three hours. */

const API = 'https://api.met.no/weatherapi/locationforecast/2.0/compact';
const UA = 'HomegrownPlate/1.0 (+https://homegrownplate.co.uk)';
const TTL = 3 * 3600;

/* Representative coordinates (max 4 decimals, as MET Norway asks). Keys match the zone ids in src/data/zones.mjs. */
export const ZONE_POINTS = {
  mild: [50.7184, -3.5339], /* Exeter */
  south: [51.5074, -0.1278], /* London */
  central: [52.4862, -1.8904], /* Birmingham */
  north: [53.8008, -1.5491], /* Leeds */
  scotland: [55.8642, -4.2518], /* Glasgow */
  highlands: [57.4778, -4.2247], /* Inverness */
};

const fmtDay = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit' });
const fmtHour = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', hour: '2-digit', hour12: false });
const dayOf = (d) => fmtDay.format(d);
const hourOf = (d) => Number(fmtHour.format(d)) % 24;

/* Turn the raw timeseries into one summary per UK calendar day: temperatures, rain (mm), top wind (m/s), a midday symbol. */
export function summarise(series, maxDays = 6) {
  const days = new Map();
  let covered = 0;
  for (const e of series || []) {
    const t = new Date(e.time);
    if (Number.isNaN(t.getTime())) continue;
    const key = dayOf(t);
    let d = days.get(key);
    if (!d) { if (days.size >= maxDays) break; d = { date: key, tmax: -99, tmin: 99, rain: 0, wind: 0, sym: '', symHr: 99 }; days.set(key, d); }
    const inst = e.data?.instant?.details || {};
    if (typeof inst.air_temperature === 'number') { d.tmax = Math.max(d.tmax, inst.air_temperature); d.tmin = Math.min(d.tmin, inst.air_temperature); }
    if (typeof inst.wind_speed === 'number') d.wind = Math.max(d.wind, inst.wind_speed);
    const n1 = e.data?.next_1_hours, n6 = e.data?.next_6_hours;
    const ms = t.getTime();
    if (n1) { d.rain += n1.details?.precipitation_amount || 0; covered = ms + 3600e3; }
    else if (n6 && ms >= covered) { d.rain += n6.details?.precipitation_amount || 0; covered = ms + 6 * 3600e3; }
    const sym = n1?.summary?.symbol_code || n6?.summary?.symbol_code;
    if (sym) { const dist = Math.abs(hourOf(t) - 12); if (dist < d.symHr) { d.symHr = dist; d.sym = sym.replace(/_(day|night|polartwilight)$/, ''); } }
  }
  return [...days.values()].filter((d) => d.tmax > -99).map((d) => ({
    date: d.date, tmax: Math.round(d.tmax), tmin: Math.round(d.tmin), rain: Math.round(d.rain * 10) / 10, wind: Math.round(d.wind * 10) / 10, sym: d.sym,
  }));
}

export async function forecast(zone, ctx) {
  const pt = ZONE_POINTS[zone];
  if (!pt) return { error: 'Unknown region.', status: 400 };
  const cache = typeof caches !== 'undefined' ? caches.default : null;
  const key = new Request(`https://weather.cache.invalid/${zone}`);
  if (cache) { const hit = await cache.match(key); if (hit) return { body: await hit.json() }; }
  let res;
  try {
    res = await fetch(`${API}?lat=${pt[0]}&lon=${pt[1]}`, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  } catch { return { error: 'The forecast service is unavailable.', status: 502 }; }
  if (!res.ok) return { error: 'The forecast service is unavailable.', status: 502 };
  let data;
  try { data = await res.json(); } catch { return { error: 'The forecast service is unavailable.', status: 502 }; }
  const body = { zone, days: summarise(data?.properties?.timeseries), credit: 'Weather data from MET Norway (CC BY 4.0)' };
  if (!body.days.length) return { error: 'No forecast available.', status: 502 };
  if (cache) {
    const put = cache.put(key, new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json', 'Cache-Control': `max-age=${TTL}` } }));
    if (ctx?.waitUntil) ctx.waitUntil(put); else await put;
  }
  return { body };
}
