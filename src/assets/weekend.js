/* Garden jobs this weekend. Everyone sees the month's UK jobs; signed-in visitors also get a plan built from
   My Garden, their region and the forecast (fetched from our own /api/weather, which needs a signed-in session). */
(function () {
  'use strict';
  var root = document.getElementById('wkGeneric');
  if (!root) return;
  var personal = document.getElementById('wkPersonal');
  var cta = document.getElementById('wkCta');
  var compact = root.hasAttribute('data-compact'); /* home page panel: a short version */
  function showGeneric(on) { if (compact) root.hidden = !on; }
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var ZONE_BY_OFF = { '-2': 'mild', '-1': 'south', '0': 'central', '1': 'north', '2': 'scotland', '3': 'highlands' };
  var ZONE_NAME = { mild: 'the mild south-west and south coast', south: 'London and the south-east', central: 'the Midlands, East Anglia and Wales', north: 'northern England', scotland: 'central Scotland', highlands: 'northern Scotland' };

  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function read(key, fallback) { try { var v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; } catch (e) { return fallback; } }
  function iso(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function signedIn() { try { return localStorage.getItem('hp-acct') === '1'; } catch (e) { return false; } }

  /* ---- Generic UK jobs for the current month and half ---- */
  var now = new Date();
  var half = now.getDate() >= 15 ? 2 : 1;
  Array.prototype.forEach.call(root.querySelectorAll('[data-wk-month]'), function (s) {
    var on = Number(s.getAttribute('data-wk-month')) === now.getMonth();
    s.hidden = !on;
    if (on) Array.prototype.forEach.call(s.querySelectorAll('li[data-half]'), function (li) {
      var h = Number(li.getAttribute('data-half'));
      li.hidden = h !== 0 && h !== half;
    });
    if (on && compact) {
      var shown = 0;
      Array.prototype.forEach.call(s.querySelectorAll('li'), function (li) { if (li.hidden) return; if (++shown > 3) li.hidden = true; });
      Array.prototype.forEach.call(s.querySelectorAll('.wk-more'), function (n) { n.hidden = true; });
    }
  });

  /* ---- Weekend dates: today if it is a weekend day, otherwise the coming Saturday and Sunday ---- */
  function weekendDates() {
    var d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var dow = d.getDay(), out = [];
    if (dow === 6) { out.push(d); out.push(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)); }
    else if (dow === 0) out.push(d);
    else { var sat = new Date(d.getFullYear(), d.getMonth(), d.getDate() + (6 - dow)); out.push(sat); out.push(new Date(sat.getFullYear(), sat.getMonth(), sat.getDate() + 1)); }
    return out;
  }

  /* ---- Weather classification ---- */
  var SYMBOLS = [['thunder', '⛈️', 'Thunder'], ['snow', '❄️', 'Snow'], ['sleet', '🌨️', 'Sleet'], ['heavyrain', '🌧️', 'Heavy rain'], ['rainshowers', '🌦️', 'Showers'], ['lightrain', '🌦️', 'Light rain'], ['rain', '🌧️', 'Rain'], ['fog', '🌫️', 'Fog'], ['partlycloudy', '⛅', 'Sunny spells'], ['fair', '🌤️', 'Mostly sunny'], ['clearsky', '☀️', 'Clear'], ['cloudy', '☁️', 'Cloudy']];
  function symbolOf(code) { for (var i = 0; i < SYMBOLS.length; i++) if ((code || '').indexOf(SYMBOLS[i][0]) > -1) return SYMBOLS[i]; return ['', '🌡️', 'Mixed']; }
  function wet(d) { return d.rain >= 2; }
  function frosty(d) { return d.tmin <= 2; }
  function windy(d) { return d.wind >= 10; }

  /* ---- Garden tasks for the weekend, shifted for the visitor's region ---- */
  function slotsOf(bits) { var s = [], k; for (k = 0; k < 24; k++) s.push(bits.charAt(k >> 1) === '1' ? 1 : 0); return s; }
  function shiftSlots(s, n) { var o = [], k; for (k = 0; k < 24; k++) o.push(0); for (k = 0; k < 24; k++) if (s[k]) o[((k + n) % 24 + 24) % 24] = 1; return o; }
  function gardenTasks(data, ids, off, date) {
    var slot = date.getMonth() * 2 + (date.getDate() >= 15 ? 1 : 0), m = date.getMonth(), kids = document.documentElement.hasAttribute('data-kids');
    var byId = {}, tasks = [];
    data.plants.forEach(function (p) { byId[p.id] = p; });
    ids.forEach(function (id) {
      var p = byId[id];
      if (!p || (kids && p.k)) return;
      var hOff = off ? (off < 0 ? -1 : 1) * Math.ceil(Math.abs(off) / 2) : 0;
      if (shiftSlots(slotsOf(p.i), off)[slot]) tasks.push({ id: id + ':i', tag: 'indoor', p: p, text: 'Sow ' + p.n.toLowerCase() + ' indoors or under cover.' });
      if (shiftSlots(slotsOf(p.o), off)[slot]) tasks.push({ id: id + ':o', tag: 'dry', p: p, text: 'Sow or plant ' + p.n.toLowerCase() + ' outside.' });
      if (shiftSlots(slotsOf(p.h), hOff)[slot]) tasks.push({ id: id + ':h', tag: 'any', p: p, text: 'Harvest ' + p.n.toLowerCase() + ' if it is ready.' });
      (p.c || []).forEach(function (c, idx) { if (c[0].charAt(m) === '1') tasks.push({ id: id + ':c' + idx, tag: /water|feed|mulch|prune|pinch|net |thin|tie|earth up|stake|cut/i.test(c[1]) ? 'dry' : 'any', p: p, text: c[1] }); });
    });
    return tasks;
  }

  /* ---- Day plan: dry-day jobs go to the driest days, indoor and damp-weather jobs to the wettest ---- */
  function plan(days, generic, mine) {
    var out = days.map(function (d) { return { day: d, items: [] }; });
    var order = out.slice().sort(function (a, b) { return a.day.w.rain - b.day.w.rain; });
    var dryDays = order.filter(function (o) { return !wet(o.day.w); });
    var wettest = order[order.length - 1];
    var anyFrost = days.some(function (d) { return frosty(d.w); });
    var turn = 0, leftover = [];
    generic.concat(mine).forEach(function (j) {
      if (j.tag === 'frost') { if (anyFrost) out.forEach(function (o) { if (frosty(o.day.w) && o.items.indexOf(j) < 0 && !o.frostJob) { o.frostJob = true; o.items.push(j); } }); return; }
      if (j.tag === 'dry') { if (dryDays.length) dryDays[turn++ % dryDays.length].items.push(j); else leftover.push(j); return; }
      if (j.tag === 'indoor' || j.tag === 'wet') { wettest.items.push(j); return; }
      order[turn++ % order.length].items.push(j);
    });
    return { days: out, leftover: leftover };
  }

  function weatherLine(w) {
    var s = symbolOf(w.sym);
    var bits = [s[2], w.tmin + '° to ' + w.tmax + '°C', w.rain < 0.2 ? 'dry' : w.rain + ' mm rain', 'wind up to ' + Math.round(w.wind * 2.237) + ' mph'];
    return { icon: s[1], text: bits.join(', ') };
  }

  function tips(days) {
    var t = [];
    if (days.some(function (d) { return frosty(d.w); })) t.push('Frost is possible. Cover tender plants and young shoots with fleece the evening before, and hold off planting out tender crops.');
    if (days.some(function (d) { return windy(d.w); })) t.push('It will be windy at times. Check stakes and ties, and keep fleece and cloches well anchored.');
    if (days.every(function (d) { return wet(d.w); })) t.push('Wet all weekend. Stay off wet soil to avoid compacting it, and use the time for indoor jobs and planning.');
    if (days.some(function (d) { return d.w.tmax >= 25; })) t.push('Hot weather. Water early in the morning or in the evening and shade seedlings and lettuce.');
    return t;
  }

  /* ---- Render ---- */
  var doneKey = '', done = [];
  function saveDone() { try { localStorage.setItem(doneKey, JSON.stringify(done)); } catch (e) { /* ignore */ } }

  function taskRow(j) {
    var li = el('li', 'wk-task');
    var id = 'wk-' + j.id.replace(/[^a-z0-9]/gi, '_') + '-' + doneKey.slice(-10);
    var cb = el('input'); cb.type = 'checkbox'; cb.id = id; cb.checked = done.indexOf(j.id) > -1;
    cb.addEventListener('change', function () { var at = done.indexOf(j.id); if (cb.checked && at < 0) done.push(j.id); if (!cb.checked && at > -1) done.splice(at, 1); saveDone(); });
    var lab = el('label'); lab.setAttribute('for', id);
    if (j.p) { var a = el('a', null, j.p.n); a.href = '/plants/' + j.p.id + '/'; lab.appendChild(a); lab.appendChild(document.createTextNode(': ')); }
    lab.appendChild(document.createTextNode(j.text));
    li.appendChild(cb); li.appendChild(lab);
    return li;
  }

  function render(days, off, hasGarden, usedDefaultRegion, zone, credit) {
    personal.textContent = '';
    var first = days[0].date;
    doneKey = 'hp-weekend-done-' + iso(first);
    done = read(doneKey, []); if (!Array.isArray(done)) done = [];
    if (!compact) personal.appendChild(el('h2', null, 'Your plan for this weekend'));
    personal.appendChild(el('p', 'muted', 'Forecast for ' + ZONE_NAME[zone] + (usedDefaultRegion ? '. Set your area above for a closer forecast and dates.' : '.')));
    var generic = [];
    Array.prototype.forEach.call(root.querySelectorAll('[data-wk-month="' + first.getMonth() + '"] li[data-tag]'), function (li, k) {
      var h = Number(li.getAttribute('data-half'));
      var ph = first.getDate() >= 15 ? 2 : 1;
      if (h !== 0 && h !== ph) return;
      var txt = li.textContent.replace(li.querySelector('.wk-tag').textContent, '').replace(/\s*\((first|second) half of the month\)\s*/, '').replace(/\s+/g, ' ').trim();
      generic.push({ id: 'g' + first.getMonth() + '-' + k, tag: li.getAttribute('data-tag'), text: txt });
    });
    var mine = [];
    if (hasGarden) mine = gardenTasks(hasGarden.data, hasGarden.ids, off, first);
    var result = plan(days, generic, mine);
    var wl = tips(days);
    if (wl.length) { var box = el('div', 'callout'); wl.forEach(function (t) { box.appendChild(el('p', null, t)); }); personal.appendChild(box); }
    var grid = el('div', 'wk-days');
    result.days.forEach(function (o) {
      var card = el('section', 'wk-day');
      var wx = weatherLine(o.day.w);
      var h = el('h3', null, DAYS[o.day.date.getDay()] + ' ' + o.day.date.getDate() + ' ' + MONTHS[o.day.date.getMonth()]);
      card.appendChild(h);
      var p = el('p', 'wk-wx'); var ic = el('span', null, wx.icon); ic.setAttribute('aria-hidden', 'true'); p.appendChild(ic); p.appendChild(document.createTextNode(' ' + wx.text)); card.appendChild(p);
      var ul = el('ul', 'wk-checks');
      var shownItems = compact ? o.items.slice(0, 3) : o.items;
      if (!o.items.length) card.appendChild(el('p', 'muted', 'Nothing specific. A good day to rest.'));
      else { shownItems.forEach(function (j) { ul.appendChild(taskRow(j)); }); card.appendChild(ul); }
      grid.appendChild(card);
    });
    personal.appendChild(grid);
    if (compact) {
      personal.hidden = false; return;
    }
    if (result.leftover.length) {
      personal.appendChild(el('h3', null, 'Wait for a drier day'));
      personal.appendChild(el('p', 'muted', 'Rain is forecast on both days, so these jobs are better left until the soil is drier.'));
      var lu = el('ul', 'wk-checks'); result.leftover.forEach(function (j) { lu.appendChild(taskRow(j)); }); personal.appendChild(lu);
    }
    if (!hasGarden) {
      var tip = el('p', 'muted'); tip.appendChild(document.createTextNode('Add the crops you grow in ')); var a2 = el('a', null, 'My Garden'); a2.href = '/my-garden/'; tip.appendChild(a2); tip.appendChild(document.createTextNode(' and they will appear in this plan too.')); personal.appendChild(tip);
    }
    personal.appendChild(el('p', 'muted small-note', credit + '. Forecasts cover one city in each region, so check your local forecast too.'));
    personal.hidden = false;
  }

  var token = 0;
  function build() {
    var me = ++token;
    if (!signedIn()) { personal.hidden = true; cta.hidden = false; showGeneric(true); return; }
    cta.hidden = true;
    var reg = read('hp-region', null);
    var off = reg && typeof reg.off === 'number' ? reg.off : 0;
    var zone = ZONE_BY_OFF[String(off)] || 'central';
    var dates = weekendDates();
    var ids = read('hp-garden', []); if (!Array.isArray(ids)) ids = [];
    var gp = ids.length ? fetch(personal.getAttribute('data-garden')).then(function (r) { return r.json(); }).then(function (d) { return { data: d, ids: ids }; }).catch(function () { return null; }) : Promise.resolve(null);
    var wp = fetch('/api/weather?zone=' + zone, { credentials: 'same-origin' }).then(function (r) {
      if (r.status === 401) { try { localStorage.removeItem('hp-acct'); } catch (e) { /* ignore */ } return 'out'; }
      return r.ok ? r.json() : null;
    }).catch(function () { return null; });
    Promise.all([wp, gp]).then(function (res) {
      if (me !== token) return;
      var w = res[0];
      if (w === 'out') { personal.hidden = true; cta.hidden = false; showGeneric(true); return; }
      if (!w || !w.days) {
        personal.textContent = '';
        if (!compact) personal.appendChild(el('h2', null, 'Your plan for this weekend'));
        personal.appendChild(el('p', null, 'The forecast is not available just now, so use the UK jobs below and check your own forecast.'));
        personal.hidden = false; showGeneric(true); return;
      }
      var byDate = {}; w.days.forEach(function (d) { byDate[d.date] = d; });
      var days = dates.map(function (d) { return byDate[iso(d)] ? { date: d, w: byDate[iso(d)] } : null; }).filter(Boolean);
      if (!days.length) {
        personal.textContent = '';
        if (!compact) personal.appendChild(el('h2', null, 'Your plan for this weekend'));
        personal.appendChild(el('p', null, 'The weekend is further away than our forecast reaches. Check back from Wednesday or Thursday, and use the UK jobs below for now.'));
        personal.hidden = false; showGeneric(true); return;
      }
      showGeneric(false);
      render(days, off, res[1], !reg, zone, w.credit || 'Weather data from MET Norway');
    });
  }

  build();
  /* Re-plan when the area or garden changes, or the account link is established after the page loads. */
  var last = '';
  function sig() { try { return [localStorage.getItem('hp-region'), localStorage.getItem('hp-garden'), localStorage.getItem('hp-acct')].join('|'); } catch (e) { return ''; } }
  last = sig();
  setInterval(function () { var s = sig(); if (s !== last) { last = s; build(); } }, 1500);
})();
