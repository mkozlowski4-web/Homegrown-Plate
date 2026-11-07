/* Garden jobs for the week. Everyone sees the month's UK weekend jobs. Members also get a week-ahead plan:
   their own crops' jobs plus the month's general jobs, the forecast for their region, and the best days for each job
   (forecast from our own /api/weather, which only answers for members). */
(function () {
  'use strict';
  var root = document.getElementById('wkGeneric');
  if (!root) return;
  var personal = document.getElementById('wkPersonal');
  var cta = document.getElementById('wkCta');
  var compact = root.hasAttribute('data-compact'); /* home page and My Garden panel: a short version */
  /* The month's general list is shown unless the member's week plan (which already includes those jobs) is on screen. */
  function showGeneric(on) { root.hidden = !on; }
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var ZONE_BY_OFF = { '-2': 'mild', '-1': 'south', '0': 'central', '1': 'north', '2': 'scotland', '3': 'highlands' };
  var ZONE_NAME = { mild: 'the mild south-west and south coast', south: 'London and the south-east', central: 'the Midlands, East Anglia and Wales', north: 'northern England', scotland: 'central Scotland', highlands: 'northern Scotland' };

  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function read(key, fallback) { try { var v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; } catch (e) { return fallback; } }
  function iso(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function signedIn() { try { return localStorage.getItem('hp-acct') === '1'; } catch (e) { return false; } }
  function member() { try { return signedIn() && localStorage.getItem('hp-plan') === 'member'; } catch (e) { return false; } }
  function dayName(d, short) { return (short ? SHORT : DAYS)[d.getDay()] + ' ' + d.getDate(); }

  /* ---- Generic UK jobs for the current month and half (everyone) ---- */
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

  /* ---- Invitation for visitors who are not members ---- */
  function showCta() {
    personal.hidden = true; showGeneric(true);
    cta.textContent = '';
    cta.appendChild(el('strong', null, 'Plan the week ahead. '));
    cta.appendChild(document.createTextNode('Members get this week’s jobs for their own crops, the forecast for their area, and the best days to do each job. '));
    var a = el('a', 'btn-small', signedIn() ? 'Become a member' : 'See membership'); a.href = '/membership/';
    cta.appendChild(a);
    cta.hidden = false;
  }

  /* ---- Weather ---- */
  var SYMBOLS = [['thunder', '⛈️', 'Thunder'], ['snow', '❄️', 'Snow'], ['sleet', '🌨️', 'Sleet'], ['heavyrain', '🌧️', 'Heavy rain'], ['rainshowers', '🌦️', 'Showers'], ['lightrain', '🌦️', 'Light rain'], ['rain', '🌧️', 'Rain'], ['fog', '🌫️', 'Fog'], ['partlycloudy', '⛅', 'Sunny spells'], ['fair', '🌤️', 'Mostly sunny'], ['clearsky', '☀️', 'Clear'], ['cloudy', '☁️', 'Cloudy']];
  function symbolOf(code) { for (var i = 0; i < SYMBOLS.length; i++) if ((code || '').indexOf(SYMBOLS[i][0]) > -1) return SYMBOLS[i]; return ['', '🌡️', 'Mixed']; }
  function wet(w) { return w.rain >= 2; }
  function frosty(w) { return w.tmin <= 2; }
  function windy(w) { return w.wind >= 10; }
  function rough(w) { return /thunder|snow|sleet/.test(w.sym || ''); }
  function mph(ms) { return Math.round(ms * 2.237); }
  /* A day good for outdoor work: mostly dry, not too windy, not freezing. Lower score is better. */
  function outdoorOk(w) { return !wet(w) && w.wind < 11 && w.tmax >= 3 && !rough(w); }
  function plantOk(w) { return outdoorOk(w) && w.tmin > 2; }
  function score(w) { return w.rain + w.wind * 0.15 + (w.tmin <= 2 ? 1 : 0) - (w.tmax >= 8 && w.tmax <= 24 ? 0.5 : 0); }

  /* ---- Jobs from My Garden, shifted for the visitor's region ---- */
  function slotsOf(bits) { var s = [], k; for (k = 0; k < 24; k++) s.push(bits.charAt(k >> 1) === '1' ? 1 : 0); return s; }
  function shiftSlots(s, n) { var o = [], k; for (k = 0; k < 24; k++) o.push(0); for (k = 0; k < 24; k++) if (s[k]) o[((k + n) % 24 + 24) % 24] = 1; return o; }
  function gardenTasks(data, ids, off, dates) {
    var kids = document.documentElement.hasAttribute('data-kids');
    var byId = {}, tasks = [], seen = {};
    data.plants.forEach(function (p) { byId[p.id] = p; });
    var add = function (t) { if (!seen[t.id]) { seen[t.id] = 1; tasks.push(t); } };
    dates.forEach(function (date) {
      var slot = date.getMonth() * 2 + (date.getDate() >= 15 ? 1 : 0), m = date.getMonth();
      ids.forEach(function (id) {
        var p = byId[id];
        if (!p || (kids && p.k)) return;
        var hOff = off ? (off < 0 ? -1 : 1) * Math.ceil(Math.abs(off) / 2) : 0;
        if (shiftSlots(slotsOf(p.i), off)[slot]) add({ id: id + ':i', kind: 'indoor', p: p, text: 'Sow ' + p.n.toLowerCase() + ' indoors or under cover.' });
        if (shiftSlots(slotsOf(p.o), off)[slot]) add({ id: id + ':o', kind: 'plant', p: p, text: 'Sow or plant ' + p.n.toLowerCase() + ' outside.' });
        if (shiftSlots(slotsOf(p.h), hOff)[slot]) add({ id: id + ':h', kind: 'harvest', p: p, text: 'Harvest ' + p.n.toLowerCase() + ' if it is ready.' });
        (p.c || []).forEach(function (c, idx) {
          if (c[0].charAt(m) !== '1') return;
          add({ id: id + ':c' + idx, kind: /water|feed|mulch|prune|pinch|net |thin|tie|earth up|stake|cut/i.test(c[1]) ? 'dry' : 'any', p: p, text: c[1], water: /\bwater/i.test(c[1]) });
        });
      });
    });
    return tasks;
  }
  /* The month's general UK jobs, read from the page (for every half-month the week touches). */
  function genericTasks(dates) {
    var out = [], seen = {};
    dates.forEach(function (d) {
      var ph = d.getDate() >= 15 ? 2 : 1;
      Array.prototype.forEach.call(root.querySelectorAll('[data-wk-month="' + d.getMonth() + '"] li[data-tag]'), function (li, k) {
        var h = Number(li.getAttribute('data-half')), id = 'g' + d.getMonth() + '-' + k;
        if ((h !== 0 && h !== ph) || seen[id]) return;
        seen[id] = 1;
        var tagEl = li.querySelector('.wk-tag'), muted = li.querySelector('.muted');
        var txt = li.textContent; if (tagEl) txt = txt.replace(tagEl.textContent, ''); if (muted) txt = txt.replace(muted.textContent, '');
        out.push({ id: id, kind: li.getAttribute('data-tag'), text: txt.replace(/\s+/g, ' ').trim() });
      });
    });
    return out;
  }

  /* ---- Best days for each job ---- */
  function best(days, ok, n) {
    return days.filter(function (d) { return ok(d.w); }).sort(function (a, b) { return score(a.w) - score(b.w); }).slice(0, n || 2)
      .sort(function (a, b) { return a.date - b.date; });
  }
  function suggest(job, days, weekRain) {
    var picks, note = '';
    switch (job.kind) {
      case 'frost': {
        var f = days.filter(function (d) { return frosty(d.w); });
        if (!f.length) return null; /* only needed when frost is forecast */
        return { days: [f[0]], label: 'Before', note: 'Frost is forecast for ' + DAYS[f[0].date.getDay()] + ' (down to ' + f[0].w.tmin + '°C). Do this the evening before.' };
      }
      case 'plant':
        picks = best(days, plantOk);
        if (!picks.length) { picks = best(days, outdoorOk); if (picks.length) note = 'Nights are cold, so cover with fleece or wait if the plants are tender.'; }
        break;
      case 'dry':
        picks = best(days, outdoorOk);
        if (job.water && weekRain >= 10) note = 'Plenty of rain is forecast, so you may not need to water this week.';
        break;
      case 'harvest':
        picks = best(days, outdoorOk);
        if (!picks.length) return { days: [], label: 'Any day', note: 'Pick when it is ready, whatever the weather.' };
        break;
      case 'indoor':
        picks = days.filter(function (d) { return wet(d.w) || d.w.tmax < 5; }).slice(0, 2);
        return picks.length ? { days: picks, label: 'Good for a wet day', note: '' } : { days: [], label: 'Any day', note: '' };
      case 'wet':
        picks = days.filter(function (d) { return d.w.rain >= 0.5 && d.w.wind < 14 && !rough(d.w); }).slice(0, 2);
        if (!picks.length) picks = best(days, function (w) { return w.wind < 14; });
        break;
      default:
        return { days: [], label: 'Any day', note: '' };
    }
    if (!picks.length) return { days: [], label: 'No good day', note: note || 'Too wet, windy or cold all week. Leave it for a better spell.', bad: true };
    return { days: picks, label: 'Best', note: note };
  }

  function tips(days) {
    var t = [];
    if (days.some(function (d) { return frosty(d.w); })) t.push('Frost is possible this week. Cover tender plants and young shoots with fleece the evening before, and hold off planting out tender crops.');
    if (days.some(function (d) { return windy(d.w); })) t.push('It will be windy at times. Check stakes and ties, and keep fleece and cloches well anchored.');
    if (days.every(function (d) { return wet(d.w); })) t.push('Wet every day this week. Stay off wet soil to avoid compacting it, and use the time for indoor jobs and planning.');
    if (days.some(function (d) { return d.w.tmax >= 25; })) t.push('Hot weather is forecast. Water early in the morning or in the evening, and shade seedlings and lettuce.');
    return t;
  }

  /* ---- Render ---- */
  var doneKey = '', done = [];
  function saveDone() { try { localStorage.setItem(doneKey, JSON.stringify(done)); } catch (e) { /* ignore */ } }
  function weekKey(d) { var m = new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7)); return 'hp-week-done-' + iso(m); }

  function forecastStrip(days) {
    var ul = el('ul', 'wkf-strip');
    ul.setAttribute('aria-label', 'Forecast');
    days.forEach(function (d) {
      var s = symbolOf(d.w.sym), li = el('li', 'wkf-day' + (outdoorOk(d.w) ? ' is-good' : ''));
      li.title = s[2] + ', ' + d.w.tmin + '° to ' + d.w.tmax + '°C, ' + (d.w.rain < 0.2 ? 'dry' : d.w.rain + ' mm rain') + ', wind up to ' + mph(d.w.wind) + ' mph';
      li.appendChild(el('span', 'wkf-name', dayName(d.date, true)));
      var ic = el('span', 'wkf-icon', s[1]); ic.setAttribute('aria-hidden', 'true'); li.appendChild(ic);
      li.appendChild(el('span', 'sr-only', s[2] + '.'));
      li.appendChild(el('span', 'wkf-temp', d.w.tmax + '° / ' + d.w.tmin + '°'));
      li.appendChild(el('span', 'wkf-rain', d.w.rain < 0.2 ? 'Dry' : d.w.rain + ' mm'));
      if (windy(d.w)) li.appendChild(el('span', 'wkf-wind', mph(d.w.wind) + ' mph'));
      ul.appendChild(li);
    });
    return ul;
  }

  function jobRow(j) {
    var li = el('li', 'wk-task wk-job');
    var id = 'wk-' + j.id.replace(/[^a-z0-9]/gi, '_');
    var cb = el('input'); cb.type = 'checkbox'; cb.id = id; cb.checked = done.indexOf(j.id) > -1;
    cb.addEventListener('change', function () { var at = done.indexOf(j.id); if (cb.checked && at < 0) done.push(j.id); if (!cb.checked && at > -1) done.splice(at, 1); saveDone(); });
    var lab = el('label'); lab.setAttribute('for', id);
    if (j.p) { var a = el('a', null, j.p.n); a.href = '/plants/' + (j.p.b || j.p.id) + '/' + (j.p.a ? '#' + j.p.a : ''); lab.appendChild(a); lab.appendChild(document.createTextNode(': ')); }
    lab.appendChild(document.createTextNode(j.text));
    var body = el('div', 'wk-job-body'); body.appendChild(lab);
    var sg = j.sg, line = el('p', 'wk-when' + (sg.bad ? ' is-bad' : ''));
    line.appendChild(el('span', 'wk-when-label', sg.label + (sg.days.length ? ':' : '')));
    sg.days.forEach(function (d) {
      var s = symbolOf(d.w.sym), chip = el('span', 'wk-day-chip');
      var ic = el('span', null, s[1] + ' '); ic.setAttribute('aria-hidden', 'true'); chip.appendChild(ic);
      chip.appendChild(document.createTextNode(dayName(d.date, true)));
      line.appendChild(chip);
    });
    if (sg.note) line.appendChild(el('span', 'wk-when-note', sg.note));
    body.appendChild(line);
    li.appendChild(cb); li.appendChild(body);
    return li;
  }

  function render(days, off, garden, usedDefaultRegion, zone, credit) {
    personal.textContent = '';
    doneKey = weekKey(days[0].date);
    done = read(doneKey, []); if (!Array.isArray(done)) done = [];
    var first = days[0].date, last = days[days.length - 1].date;
    if (!compact) personal.appendChild(el('h2', null, 'Your week ahead'));
    personal.appendChild(el('p', 'muted', dayName(first) + ' ' + MONTHS[first.getMonth()] + ' to ' + dayName(last) + ' ' + MONTHS[last.getMonth()] + '. Forecast for ' + ZONE_NAME[zone] + (usedDefaultRegion ? '. Set your area for a closer forecast and dates.' : '.')));
    personal.appendChild(forecastStrip(days));
    var wl = tips(days);
    if (wl.length && !compact) { var box = el('div', 'callout'); wl.forEach(function (t) { box.appendChild(el('p', null, t)); }); personal.appendChild(box); }

    var dates = [first, last];
    var weekRain = days.reduce(function (s, d) { return s + d.w.rain; }, 0);
    var withSg = function (list) {
      return list.map(function (j) { j.sg = suggest(j, days, weekRain); return j; }).filter(function (j) { return j.sg; })
        .sort(function (a, b) { var x = a.sg.days[0], y = b.sg.days[0]; return (x ? x.date : 9e15) - (y ? y.date : 9e15); });
    };
    var mine = garden ? withSg(gardenTasks(garden.data, garden.ids, off, dates)) : [];
    var general = withSg(genericTasks(dates));

    if (compact) {
      var top = mine.concat(general).filter(function (j) { return j.sg.days.length; }).slice(0, 4);
      if (top.length) { var cu = el('ul', 'wk-checks wk-jobs'); top.forEach(function (j) { cu.appendChild(jobRow(j)); }); personal.appendChild(cu); }
      personal.hidden = false; return;
    }
    var section = function (title, hint, list, empty) {
      personal.appendChild(el('h3', null, title));
      if (hint) personal.appendChild(el('p', 'muted small-note', hint));
      if (!list.length) { personal.appendChild(el('p', 'muted', empty)); return; }
      var ul = el('ul', 'wk-checks wk-jobs'); list.forEach(function (j) { ul.appendChild(jobRow(j)); }); personal.appendChild(ul);
    };
    if (garden) section('Your crops', 'Sowing, planting, harvesting and care for the crops in My Garden.', mine, 'Nothing to do for your crops this week.');
    else {
      var tip = el('p', 'muted'); tip.appendChild(document.createTextNode('Add the crops you grow in ')); var a2 = el('a', null, 'My Garden'); a2.href = '/my-garden/'; tip.appendChild(a2); tip.appendChild(document.createTextNode(' and their jobs will appear here too.')); personal.appendChild(tip);
    }
    section('Around the garden', 'General jobs for the time of year.', general, 'No general jobs this week.');
    personal.appendChild(el('p', 'muted small-note', 'Best days are the driest, calmest days in the forecast for each kind of job. ' + credit + '. Forecasts cover one city in each region, so check your local forecast too.'));
    personal.hidden = false;
  }

  function message(text) {
    personal.textContent = '';
    if (!compact) personal.appendChild(el('h2', null, 'Your week ahead'));
    personal.appendChild(el('p', null, text));
    personal.hidden = false; showGeneric(true);
  }

  var token = 0;
  function build() {
    var me = ++token;
    if (!member()) { showCta(); return; }
    cta.hidden = true;
    var reg = read('hp-region', null);
    var off = reg && typeof reg.off === 'number' ? reg.off : 0;
    var zone = ZONE_BY_OFF[String(off)] || 'central';
    var ids = read('hp-garden', []); if (!Array.isArray(ids)) ids = [];
    var gp = ids.length ? fetch(personal.getAttribute('data-garden')).then(function (r) { return r.json(); }).then(function (d) { return { data: d, ids: ids }; }).catch(function () { return null; }) : Promise.resolve(null);
    var wp = fetch('/api/weather?zone=' + zone, { credentials: 'same-origin' }).then(function (r) {
      if (r.status === 401) { try { localStorage.removeItem('hp-acct'); localStorage.removeItem('hp-plan'); } catch (e) { /* ignore */ } return 'out'; }
      if (r.status === 402) { try { localStorage.removeItem('hp-plan'); } catch (e) { /* ignore */ } return 'out'; }
      return r.ok ? r.json() : null;
    }).catch(function () { return null; });
    Promise.all([wp, gp]).then(function (res) {
      if (me !== token) return;
      var w = res[0];
      if (w === 'out') { showCta(); return; }
      if (!w || !w.days) { message('The forecast is not available just now, so use the UK jobs below and check your own forecast.'); return; }
      var today = iso(new Date());
      var days = w.days.filter(function (d) { return d.date >= today; }).slice(0, 7).map(function (d) {
        var p = d.date.split('-'); return { date: new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2])), w: d };
      });
      if (!days.length) { message('The forecast is not available just now, so use the UK jobs below and check your own forecast.'); return; }
      showGeneric(false);
      render(days, off, res[1], !reg, zone, w.credit || 'Weather data from MET Norway');
    });
  }

  build();
  /* Re-plan when the area, garden, sign-in or membership changes. */
  var last = '';
  function sig() { try { return ['hp-region', 'hp-garden', 'hp-acct', 'hp-plan', 'hp-kids'].map(function (k) { return localStorage.getItem(k); }).join('|'); } catch (e) { return ''; } }
  last = sig();
  setInterval(function () { var s = sig(); if (s !== last) { last = s; build(); } }, 1500);
})();
