/* Homegrown Plate: small progressive enhancements.
   Every page works without this file; it adds filters, month highlighting
   and forwards old #/ links to the new URLs. */
(function () {
  'use strict';

  /* ---- Forward old hash URLs (e.g. /#/plants/tomato) to real pages ---- */
  var ALIASES = { 'recipes/potato-leek-pan': 'recipes/crispy-potato-hash' };
  var hash = location.hash;
  if (hash === '#/') { location.replace('/'); return; }
  var m = hash.match(/^#\/(sizes|plants|calendar|howto|harvest|recipes)(?:\/([a-z0-9-]+))?\/?$/);
  if (m) {
    var target = m[1] + (m[2] ? '/' + m[2] : '');
    target = ALIASES[target] || target;
    location.replace('/' + target + '/');
    return;
  }

  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }


  /* ---- Regional timings: shift the default (central England) dates for the visitor's area ---- */
  var mk = function (tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var Region = (function () {
    var KEY_R = 'hp-region';
    var cur = null, listeners = [], zonesPromise = null;
    try {
      var v = JSON.parse(localStorage.getItem(KEY_R) || 'null');
      if (v && typeof v.off === 'number' && v.off >= -3 && v.off <= 4 && typeof v.name === 'string') cur = v;
    } catch (e) { cur = null; }

    function slotsOf(bits) { var s = [], k; for (k = 0; k < 24; k++) s.push(bits.charAt(k >> 1) === '1' ? 1 : 0); return s; }
    /* Runs of 1s around the 24 half-month slots, with unwrapped (possibly > 23) start and end positions. */
    function runsOf(s) {
      var z = s.indexOf(0), runs = [], run = null, k, idx;
      if (z < 0) return null;
      for (k = 1; k <= 24; k++) {
        idx = (z + k) % 24;
        if (s[idx]) { if (!run) { run = { s: z + k, e: z + k }; runs.push(run); } else run.e = z + k; } else run = null;
      }
      return runs;
    }
    /* kind is 'i' (sow indoors), 'o' (sow or plant outside) or 'h' (harvest). Returns 24 half-month slots. */
    function shifted(bits, kind, off) {
      var s = slotsOf(bits), out = [], k;
      if (kind === 'h') off = (off < 0 ? -1 : 1) * Math.ceil(Math.abs(off) / 2) * (off ? 1 : 0); /* summer harvests vary less than frost dates */
      var runs = off ? runsOf(s) : null;
      if (!runs || !runs.length) return s;
      for (k = 0; k < 24; k++) out.push(0);
      runs.forEach(function (r) {
        var sm = Math.floor((r.s % 24) / 2), em = Math.floor((r.e % 24) / 2);
        var ds = kind === 'h' ? (sm <= 8 ? off : 0) : (sm <= 6 ? off : -off);
        var de = em <= 4 ? off : (em <= 7 ? 0 : -off);
        var ns = r.s + ds, ne = r.e + de, p, mid;
        if (ne < ns) { mid = Math.round((ns + ne) / 2); ns = mid; ne = mid + 1; }
        if (ne - ns + 1 < Math.min(r.e - r.s + 1, 4)) ne = ns + Math.min(r.e - r.s + 1, 4) - 1; /* keep a usable window */
        if (ne - ns >= 23) { for (p = 0; p < 24; p++) out[p] = 1; return; }
        for (p = ns; p <= ne; p++) out[((p % 24) + 24) % 24] = 1;
      });
      return out;
    }
    /* 0 = none, 1 = first half, 2 = second half, 3 = whole month */
    function monthState(s, m) { return s[m * 2] + s[m * 2 + 1] * 2; }
    function monthBits(s) { var b = '', m; for (m = 0; m < 12; m++) b += monthState(s, m) ? '1' : '0'; return b; }
    function describe(s) {
      var runs = runsOf(s);
      if (!runs) return 'All year';
      if (!runs.length) return '';
      runs.sort(function (a, b) { return (a.s % 24) - (b.s % 24); });
      return runs.map(function (r) {
        var sm = Math.floor((r.s % 24) / 2), em = Math.floor((r.e % 24) / 2);
        if (sm === em && r.e - r.s < 2) return (r.s % 2 ? 'late ' : 'early ') + MON[sm];
        var a = (r.s % 2 ? 'mid ' : '') + MON[sm], b = (r.e % 2 === 0 ? 'mid ' : '') + MON[em];
        return a === b ? a : a + '–' + b;
      }).join(', ');
    }
    function loadZones(url) {
      if (!zonesPromise) zonesPromise = fetch(url).then(function (r) { return r.json(); });
      return zonesPromise;
    }
    function set(r) {
      cur = r;
      try { if (r) localStorage.setItem(KEY_R, JSON.stringify(r)); else localStorage.removeItem(KEY_R); } catch (e) { /* storage unavailable */ }
      listeners.forEach(function (fn) { fn(); });
    }
    return {
      off: function () { return cur ? cur.off : 0; },
      current: function () { return cur; },
      set: set, shifted: shifted, monthState: monthState, monthBits: monthBits, describe: describe, loadZones: loadZones,
      onChange: function (fn) { listeners.push(fn); },
    };
  })();

  /* The "Your location" bar */
  var regionBars = $$('[data-region-bar]');
  regionBars.forEach(function (bar) {
    bar.hidden = false;
    var txt = bar.querySelector('[data-region-text]'), clear = bar.querySelector('[data-region-clear]');
    var form = bar.querySelector('[data-region-form]'), pc = bar.querySelector('[data-region-pc]');
    var msg = bar.querySelector('[data-region-msg]'), sel = bar.querySelector('[data-region-zone]');
    var manual = bar.querySelector('.region-manual'), more = bar.querySelector('[data-region-more]');
    var origMsg = msg.textContent;
    var refresh = function () {
      var r = Region.current();
      if (!r) { txt.textContent = 'Showing typical dates for central England.'; clear.hidden = true; sel.value = ''; return; }
      var weeks = Math.abs(r.off) * 2;
      txt.textContent = r.off === 0
        ? 'Dates for ' + r.name + (r.pc ? ' (postcode area ' + r.pc + ')' : '') + ', the same as the site default.'
        : 'Adjusted for ' + r.name + (r.pc ? ' (postcode area ' + r.pc + ')' : '') + ': about ' + weeks + ' weeks ' + (r.off < 0 ? 'earlier' : 'later') + ' than central England.';
      clear.hidden = false; sel.value = r.z || '';
    };
    Region.onChange(refresh);
    refresh();
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var v = pc.value.toUpperCase().replace(/[^A-Z0-9]/g, ''), m = v.match(/^([A-Z]{1,2})[0-9]/);
      if (!m) { msg.textContent = 'Please enter your postcode, for example EX4 or SW1A 1AA.'; return; }
      msg.textContent = 'Looking up your area…';
      Region.loadZones(bar.getAttribute('data-zones')).then(function (d) {
        var zid = d.areas[m[1]], zone = null;
        d.zones.forEach(function (z) { if (z.id === zid) zone = z; });
        if (!zone) { msg.textContent = 'Sorry, we do not recognise that postcode area. Please choose your region instead.'; more.open = true; return; }
        msg.textContent = origMsg; pc.value = '';
        more.open = false;
        Region.set({ z: zone.id, off: zone.off, name: zone.name, pc: m[1] });
      }).catch(function () { msg.textContent = 'Sorry, the lookup did not load. Please choose your region instead.'; more.open = true; });
    });
    sel.addEventListener('change', function () {
      var o = sel.options[sel.selectedIndex];
      more.open = false;
      if (!o.value) { Region.set(null); return; }
      Region.set({ z: o.value, off: Number(o.getAttribute('data-off')), name: o.textContent.trim(), pc: '' });
    });
    clear.addEventListener('click', function () { msg.textContent = origMsg; Region.set(null); });
  });

  /* Plant page: month bars and the "Sow" and "Harvest" rows */
  var mbar = $('.mbar[data-i]');
  if (mbar) {
    var rowLabels = { i: 'Sow or start indoors', o: 'Sow or plant outside', h: 'Harvest months' };
    var factCells = {};
    $$('.info-row > div').forEach(function (d) {
      Object.keys(rowLabels).forEach(function (k) { if (d.textContent === rowLabels[k] && d.nextElementSibling) factCells[k] = d.nextElementSibling; });
    });
    Object.keys(factCells).forEach(function (k) { factCells[k].setAttribute('data-orig', factCells[k].textContent); });
    var paintPlant = function () {
      var off = Region.off();
      $$('.mbar .mrow[data-row]').forEach(function (row) {
        var k = row.getAttribute('data-row'), s = Region.shifted(mbar.getAttribute('data-' + k), k, off);
        Array.prototype.slice.call(row.querySelectorAll('.mcells i')).forEach(function (c, m) {
          var st = Region.monthState(s, m);
          c.className = (c.className.indexOf('now') > -1 ? 'now ' : '') + (st ? 'on' : '') + (st === 1 ? ' h1' : st === 2 ? ' h2' : '');
        });
        var sr = row.querySelector('.sr-only'); if (sr) sr.textContent = Region.describe(s);
        if (factCells[k]) factCells[k].textContent = off ? Region.describe(s) : factCells[k].getAttribute('data-orig');
      });
    };
    Region.onChange(paintPlant);
    if (Region.off()) paintPlant();
  }


  /* Plant page: "Care through the year" months */
  var careItems = $$('.care-ul li[data-bits]');
  if (careItems.length) {
    careItems.forEach(function (li) { var w = li.querySelector('.care-when'); if (w) w.setAttribute('data-orig', w.textContent); });
    var paintCare = function () {
      var off = Region.off();
      careItems.forEach(function (li) {
        var w = li.querySelector('.care-when'); if (!w) return;
        w.textContent = off ? Region.describe(Region.shifted(li.getAttribute('data-bits'), 'o', off)) : w.getAttribute('data-orig');
      });
    };
    Region.onChange(paintCare);
    if (Region.off()) paintCare();
  }

  /* Planting calendar */
  var calRows = $$('[data-calrow]');
  if (calRows.length) {
    var barHtml = function (cls, label, st) { return '<span class="bar ' + cls + (st === 1 ? ' h1' : st === 2 ? ' h2' : '') + '"></span><span class="sr-only">' + label + (st === 1 ? ' (first half)' : st === 2 ? ' (second half)' : '') + '</span>'; };
    var paintCal = function () {
      var off = Region.off();
      calRows.forEach(function (tr) {
        var si = Region.shifted(tr.getAttribute('data-i'), 'i', off), so = Region.shifted(tr.getAttribute('data-o'), 'o', off), sh = Region.shifted(tr.getAttribute('data-h'), 'h', off);
        Array.prototype.slice.call(tr.querySelectorAll('td')).forEach(function (td, m) {
          var a = Region.monthState(si, m), b = Region.monthState(so, m), c = Region.monthState(sh, m);
          td.innerHTML = (a ? barHtml('ind', 'Sow indoors', a) : '') + (b ? barHtml('out', 'Sow or plant outside', b) : '') + (c ? barHtml('har', 'Harvest', c) : '');
        });
      });
    };
    Region.onChange(paintCal);
    if (Region.off()) paintCal();
  }

  /* Home page: this month's panel */
  var homePanel = $('.month-panel[data-month-panel]:not([hidden])');
  if (homePanel && $('#homeRegion')) {
    var origPanel = homePanel.innerHTML, homeData = null, homeLoad = null;
    var rankOf = { Easy: 0, Medium: 1, Hard: 2 };
    var paintHome = function () {
      var off = Region.off();
      if (!off) { homePanel.innerHTML = origPanel; return; }
      var m = Number(homePanel.getAttribute('data-month-panel'));
      if (!homeLoad) homeLoad = fetch($('#homeRegion').getAttribute('data-garden')).then(function (r) { return r.json(); });
      homeLoad.then(function (d) {
        if (Region.off() !== off) return;
        var plants = d.plants.slice().sort(function (a, b) { return rankOf[a.d] - rankOf[b.d] || a.n.localeCompare(b.n, 'en-GB'); });
        var inMonth = function (p, keys) { return keys.some(function (k) { return Region.monthState(Region.shifted(p[k], k, off), m) > 0; }); };
        var sow = plants.filter(function (p) { return inMonth(p, ['i', 'o']); }), har = plants.filter(function (p) { return inMonth(p, ['h']); });
        var cols = Array.prototype.slice.call(homePanel.querySelectorAll('.month-cols > div'));
        [sow, har].forEach(function (items, n) {
          var col = cols[n]; if (!col) return;
          col.querySelector('.count').textContent = '(' + items.length + ')';
          var tags = col.querySelector('.card-tags'); tags.textContent = '';
          items.slice(0, 14).forEach(function (p) { var a = mk('a', 'tag tag-link', p.e + ' ' + p.n); a.href = '/plants/' + p.id + '/'; tags.appendChild(a); });
          if (items.length > 14) { var more = mk('a', 'tag tag-link more', '+' + (items.length - 14) + ' more'); more.href = '/calendar/'; tags.appendChild(more); }
          if (!items.length) tags.appendChild(mk('span', 'muted', 'Nothing this month: a good time to plan and tidy.'));
        });
      }).catch(function () { /* keep the default panel */ });
    };
    Region.onChange(paintHome);
    if (Region.off()) paintHome();
  }

  /* ---- Plant guide: sunlight and garden-size buttons, plus name search ---- */
  var plantFilters = $('#plantFilters');
  if (plantFilters) {
    plantFilters.hidden = false;
    var chips = $$('#plantFilters [data-filter]');
    var search = $('#plantSearch');
    var plantCards = $$('[data-plant]');
    var plantCount = $('#plantCount');
    var plantEmpty = $('#plantEmpty');
    var resetBtn = $('#plantReset');
    var state = { sun: 'any', size: 'any', diff: 'any', q: '' };

    var isValid = function (group, value) {
      return chips.some(function (c) {
        return c.getAttribute('data-filter') === group && c.getAttribute('data-value') === value;
      });
    };
    var params = new URLSearchParams(location.search);
    ['sun', 'size', 'diff'].forEach(function (group) {
      var v = params.get(group);
      if (v && isValid(group, v)) state[group] = v;
    });
    if (params.get('q')) state.q = params.get('q').slice(0, 60);
    search.value = state.q;

    var applyPlants = function () {
      var term = state.q.trim().toLowerCase();
      var shown = 0;
      plantCards.forEach(function (card) {
        var okSun = state.sun === 'any' || card.getAttribute('data-sun').split(' ').indexOf(state.sun) > -1;
        var okSize = state.size === 'any' || card.getAttribute('data-sizes').split(' ').indexOf(state.size) > -1;
        var okDiff = state.diff === 'any' || card.getAttribute('data-diff') === state.diff;
        var okText = !term || card.getAttribute('data-search').indexOf(term) > -1;
        card.hidden = !(okSun && okSize && okDiff && okText);
        if (!card.hidden) shown++;
      });
      chips.forEach(function (c) {
        c.setAttribute('aria-pressed', String(state[c.getAttribute('data-filter')] === c.getAttribute('data-value')));
      });
      plantCount.textContent = 'Showing ' + shown + ' of ' + plantCards.length + ' crops';
      plantEmpty.hidden = shown > 0;
      resetBtn.hidden = state.sun === 'any' && state.size === 'any' && state.diff === 'any' && !term;
      var qs = new URLSearchParams();
      if (state.sun !== 'any') qs.set('sun', state.sun);
      if (state.size !== 'any') qs.set('size', state.size);
      if (state.diff !== 'any') qs.set('diff', state.diff);
      if (term) qs.set('q', state.q.trim());
      try { history.replaceState(null, '', location.pathname + (qs.toString() ? '?' + qs.toString() : '')); } catch (e) { /* ignore */ }
    };
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        state[c.getAttribute('data-filter')] = c.getAttribute('data-value');
        applyPlants();
      });
    });
    search.addEventListener('input', function () { state.q = search.value; applyPlants(); });
    resetBtn.addEventListener('click', function () {
      state.sun = 'any'; state.size = 'any'; state.diff = 'any'; state.q = ''; search.value = '';
      applyPlants();
    });
    applyPlants();
  }

  /* ---- Plant page: expand / collapse all, and open a section from the address ---- */
  var accToggle = $('#accToggle');
  if (accToggle) {
    var panels = $$('details.acc');
    var syncToggle = function () {
      var allOpen = panels.every(function (p) { return p.open; });
      accToggle.textContent = allOpen ? 'Collapse all sections' : 'Expand all sections';
    };
    accToggle.hidden = false;
    accToggle.addEventListener('click', function () {
      var allOpen = panels.every(function (p) { return p.open; });
      panels.forEach(function (p) { p.open = !allOpen; });
      syncToggle();
    });
    panels.forEach(function (p) { p.addEventListener('toggle', syncToggle); });
    var target = location.hash.length > 1 ? document.getElementById(location.hash.slice(1)) : null;
    if (target && target.tagName === 'DETAILS') { target.open = true; target.scrollIntoView(); }
    syncToggle();
  }

  /* ---- Recipe filter ---- */
  var recipeFilters = $('#recipeFilters');
  if (recipeFilters) {
    recipeFilters.hidden = false;
    var cropSel = $('#recipeFilter');
    var recipeCards = $$('[data-recipe]');
    var recipeEmpty = $('#recipeEmpty');
    var recipeCount = $('#recipeCount');
    var catChips = $$('#recipeFilters [data-filter="cat"]');
    var rState = { cat: 'any', crop: 'all' };
    var rParams = new URLSearchParams(location.search);
    var rCat = rParams.get('cat');
    if (rCat && catChips.some(function (c) { return c.getAttribute('data-value') === rCat; })) rState.cat = rCat;
    var rCrop = rParams.get('crop');
    if (rCrop && Array.prototype.some.call(cropSel.options, function (o) { return o.value === rCrop; })) { rState.crop = rCrop; cropSel.value = rCrop; }
    var applyRecipes = function () {
      var shown = 0;
      recipeCards.forEach(function (card) {
        var okCat = rState.cat === 'any' || card.getAttribute('data-cat') === rState.cat;
        var okCrop = rState.crop === 'all' || card.getAttribute('data-uses').split(' ').indexOf(rState.crop) > -1;
        card.hidden = !(okCat && okCrop);
        if (!card.hidden) shown++;
      });
      catChips.forEach(function (c) { c.setAttribute('aria-pressed', String(c.getAttribute('data-value') === rState.cat)); });
      recipeCount.textContent = 'Showing ' + shown + ' of ' + recipeCards.length + ' recipes';
      recipeEmpty.hidden = shown > 0;
      var qs = new URLSearchParams();
      if (rState.cat !== 'any') qs.set('cat', rState.cat);
      if (rState.crop !== 'all') qs.set('crop', rState.crop);
      try { history.replaceState(null, '', location.pathname + (qs.toString() ? '?' + qs.toString() : '')); } catch (err) { /* ignore */ }
    };
    catChips.forEach(function (c) {
      c.addEventListener('click', function () { rState.cat = c.getAttribute('data-value'); applyRecipes(); });
    });
    cropSel.addEventListener('change', function () { rState.crop = cropSel.value; applyRecipes(); });
    applyRecipes();
  }

  /* ---- My Garden: crops saved in this browser, monthly jobs and recipes ---- */
  var KEY = 'hp-garden';
  var loadGarden = function () {
    try { var v = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v.filter(function (x) { return typeof x === 'string'; }) : []; } catch (e) { return []; }
  };
  var saveGarden = function (list) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { /* storage unavailable */ } };
  var garden = loadGarden();

  /* Add / remove button on each plant page */
  var addBtn = $('[data-garden-add]');
  if (addBtn) {
    var openLink = $('.garden-link');
    var gid = addBtn.getAttribute('data-garden-add');
    var gname = addBtn.getAttribute('data-name');
    var paintAdd = function () {
      var has = garden.indexOf(gid) > -1;
      addBtn.setAttribute('aria-pressed', String(has));
      addBtn.textContent = has ? '✓ ' + gname + ' is in my garden (remove)' : '+ Add ' + gname + ' to my garden';
      if (openLink) openLink.hidden = !has;
    };
    addBtn.hidden = false;
    addBtn.addEventListener('click', function () {
      garden = loadGarden();
      var at = garden.indexOf(gid);
      if (at > -1) garden.splice(at, 1); else garden.push(gid);
      saveGarden(garden);
      paintAdd();
    });
    paintAdd();
  }

  var gRoot = $('#myGarden');
  if (gRoot) {
    var MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var POPULAR = ['tomato', 'potato', 'strawberry', 'courgette', 'bean', 'carrot', 'basil', 'kale', 'lettuce', 'mint', 'apple', 'garlic'];
    var gData = null, byId = {};
    var now = new Date();
    var view = { y: now.getFullYear(), m: now.getMonth() };
    var el = function (tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
    var doneKey = function () { return 'hp-garden-done-' + view.y + '-' + view.m; };
    var loadDone = function () { try { var v = JSON.parse(localStorage.getItem(doneKey()) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; } };
    var saveDone = function (list) { try { localStorage.setItem(doneKey(), JSON.stringify(list)); } catch (e) { /* ignore */ } };
    var gSearch = $('#gSearch'), gResults = $('#gResults'), gHint = $('#gHint');
    var gSelected = $('#gSelected'), gEmpty = $('#gEmpty'), gCount = $('#gCount'), gClear = $('#gClear');
    var gJobs = $('#gJobs'), gRecipes = $('#gRecipes');

    var plantImgEl = function (p) { var i = el('img'); i.src = p.img; i.alt = ''; i.width = 36; i.height = 36; i.loading = 'lazy'; return i; };

    var renderResults = function () {
      var term = gSearch.value.trim().toLowerCase();
      var list;
      if (term) {
        list = gData.plants.filter(function (p) { return p.n.toLowerCase().indexOf(term) > -1; }).slice(0, 30);
        gHint.textContent = list.length ? 'Matching crops:' : 'No crops match that search.';
      } else {
        list = POPULAR.map(function (id) { return byId[id]; }).filter(Boolean);
        gHint.textContent = 'Popular crops to start with:';
      }
      gResults.textContent = '';
      list.forEach(function (p) {
        var has = garden.indexOf(p.id) > -1;
        var li = el('li');
        li.appendChild(plantImgEl(p));
        li.appendChild(el('span', 'g-name', p.n));
        var b = el('button', 'g-btn', has ? 'Added ✓' : 'Add');
        b.type = 'button';
        b.setAttribute('aria-pressed', String(has));
        b.setAttribute('aria-label', (has ? 'Remove ' : 'Add ') + p.n + (has ? ' from' : ' to') + ' my garden');
        b.addEventListener('click', function () { toggle(p.id); });
        li.appendChild(b);
        gResults.appendChild(li);
      });
    };

    var renderMine = function () {
      gSelected.textContent = '';
      var mine = garden.map(function (id) { return byId[id]; }).filter(Boolean);
      mine.forEach(function (p) {
        var li = el('li');
        li.appendChild(plantImgEl(p));
        var a = el('a', null, p.n); a.href = '/plants/' + p.id + '/'; li.appendChild(a);
        var x = el('button', 'g-x', '×'); x.type = 'button'; x.setAttribute('aria-label', 'Remove ' + p.n);
        x.addEventListener('click', function () { toggle(p.id); });
        li.appendChild(x);
        gSelected.appendChild(li);
      });
      gEmpty.hidden = mine.length > 0;
      gClear.hidden = mine.length === 0;
      gCount.textContent = mine.length ? '(' + mine.length + ')' : '';
    };

    var jobCard = function (title, hint, plants, type, done) {
      var card = el('section', 'card job-card');
      card.appendChild(el('h3', null, title));
      card.appendChild(el('p', 'muted small-note', hint));
      var ul = el('ul', 'job-list');
      if (!plants.length) ul.appendChild(el('li', 'none', 'Nothing to do here this month.'));
      plants.forEach(function (p) {
        var id = p.id + ':' + type;
        var li = el('li');
        var lab = el('label');
        var cb = el('input'); cb.type = 'checkbox'; cb.checked = done.indexOf(id) > -1;
        cb.addEventListener('change', function () {
          var d = loadDone(); var at = d.indexOf(id);
          if (cb.checked && at < 0) d.push(id); else if (!cb.checked && at > -1) d.splice(at, 1);
          saveDone(d);
        });
        lab.appendChild(cb);
        lab.appendChild(el('span', null, p.e + ' ' + p.n));
        li.appendChild(lab);
        ul.appendChild(li);
      });
      card.appendChild(ul);
      return card;
    };

    var careCard = function (mine, m, done) {
      var card = el('section', 'card job-card care-card');
      card.appendChild(el('h3', null, 'Care jobs'));
      card.appendChild(el('p', 'muted small-note', 'Watering, feeding, pruning and protecting your crops this month.'));
      var ul = el('ul', 'job-list');
      var count = 0, missing = 0;
      mine.forEach(function (p) {
        if (!p.c || !p.c.length) { missing++; return; }
        p.c.forEach(function (t, idx) {
          if (t[0].charAt(m) !== '1') return;
          count++;
          var id = p.id + ':c' + idx;
          var li = el('li');
          var lab = el('label');
          var cb = el('input'); cb.type = 'checkbox'; cb.checked = done.indexOf(id) > -1;
          cb.addEventListener('change', function () {
            var d = loadDone(); var at = d.indexOf(id);
            if (cb.checked && at < 0) d.push(id); else if (!cb.checked && at > -1) d.splice(at, 1);
            saveDone(d);
          });
          lab.appendChild(cb);
          var sp = el('span', 'care-text');
          var strong = el('strong', null, p.e + ' ' + p.n + ': ');
          sp.appendChild(strong);
          sp.appendChild(document.createTextNode(t[1]));
          lab.appendChild(sp);
          li.appendChild(lab);
          ul.appendChild(li);
        });
      });
      if (!count) ul.appendChild(el('li', 'none', 'No care jobs for your crops this month.'));
      card.appendChild(ul);
      if (missing) card.appendChild(el('p', 'muted small-note', 'Care jobs are still being written for ' + missing + (missing === 1 ? ' of your crops' : ' of your crops') + '. More are added regularly.'));
      return card;
    };

    var renderMonth = function () {
      var m = view.m;
      var isNow = view.y === now.getFullYear() && m === now.getMonth();
      $('#gMonthTitle').textContent = MONTH_NAMES[m] + ' ' + view.y;
      $('#gToday').hidden = isNow;
      $('#gRecipeTitle').textContent = 'Recipes for ' + MONTH_NAMES[m];
      var mine = garden.map(function (id) { return byId[id]; }).filter(Boolean);
      var done = loadDone();
      gJobs.textContent = '';
      gRecipes.textContent = '';
      if (!mine.length) {
        gJobs.appendChild(el('p', 'empty', 'Add some crops to see your jobs for ' + MONTH_NAMES[m] + '.'));
        return;
      }
      var at = function (key) { return mine.filter(function (p) { return p[key].charAt(m) === '1'; }); };
      var harvest = at('h');
      gJobs.appendChild(jobCard('Sow indoors', 'Start under cover on a windowsill or in a greenhouse.', at('i'), 'i', done));
      gJobs.appendChild(jobCard('Sow or plant outside', 'Direct sow, or plant out young plants, bare-root trees and bushes.', at('o'), 'o', done));
      gJobs.appendChild(jobCard('Harvest', 'Ready to pick or lift this month.', harvest, 'h', done));
      gJobs.appendChild(careCard(mine, m, done));

      var inGarden = {}, inHarvest = {};
      mine.forEach(function (p) { inGarden[p.id] = true; });
      harvest.forEach(function (p) { inHarvest[p.id] = true; });
      var scored = gData.recipes.map(function (r) {
        var hv = r.u.filter(function (u) { return inHarvest[u]; });
        var gd = r.u.filter(function (u) { return inGarden[u]; });
        return { r: r, hv: hv, gd: gd, score: hv.length * 3 + gd.length };
      }).filter(function (s) { return s.score > 0; }).sort(function (a, b) { return b.score - a.score || a.r.t.localeCompare(b.r.t); }).slice(0, 6);
      if (!scored.length) {
        gRecipes.appendChild(el('p', 'empty', 'No recipes match your crops yet. Add more crops to get ideas.'));
        return;
      }
      scored.forEach(function (s) {
        var a = el('a', 'card card-link'); a.href = '/recipes/' + s.r.id + '/';
        a.appendChild(el('h3', null, s.r.t));
        a.appendChild(el('p', 'muted card-meta', s.r.m));
        var tags = el('p', 'card-tags');
        s.gd.forEach(function (u) { tags.appendChild(el('span', 'tag' + (inHarvest[u] ? '' : ' warm'), byId[u].e + ' ' + byId[u].n + (inHarvest[u] ? ' (in season)' : ''))); });
        a.appendChild(tags);
        gRecipes.appendChild(a);
      });
    };

    var toggle = function (id) {
      var at = garden.indexOf(id);
      if (at > -1) garden.splice(at, 1); else garden.push(id);
      saveGarden(garden);
      renderResults(); renderMine(); renderMonth();
    };

    gSearch.addEventListener('input', renderResults);
    gClear.addEventListener('click', function () {
      if (window.confirm('Remove every crop from your garden?')) { garden = []; saveGarden(garden); renderResults(); renderMine(); renderMonth(); }
    });
    var shift = function (d) { view.m += d; if (view.m < 0) { view.m = 11; view.y--; } if (view.m > 11) { view.m = 0; view.y++; } renderMonth(); };
    $('#gPrev').addEventListener('click', function () { shift(-1); });
    $('#gNext').addEventListener('click', function () { shift(1); });
    $('#gToday').addEventListener('click', function () { view = { y: now.getFullYear(), m: now.getMonth() }; renderMonth(); });

    fetch(gRoot.getAttribute('data-src')).then(function (r) { return r.json(); }).then(function (d) {
      gData = d;
      d.plants.forEach(function (p) { byId[p.id] = p; p.i0 = p.i; p.o0 = p.o; p.h0 = p.h; p.c0 = p.c; });
      var regionize = function () {
        var off = Region.off();
        d.plants.forEach(function (p) {
          p.i = Region.monthBits(Region.shifted(p.i0, 'i', off));
          p.o = Region.monthBits(Region.shifted(p.o0, 'o', off));
          p.h = Region.monthBits(Region.shifted(p.h0, 'h', off));
          p.c = p.c0.map(function (t) { return [Region.monthBits(Region.shifted(t[0], 'o', off)), t[1]]; });
        });
      };
      regionize();
      Region.onChange(function () { regionize(); renderMonth(); });
      garden = loadGarden().filter(function (id) { return byId[id]; });
      gRoot.hidden = false;
      renderResults(); renderMine(); renderMonth();
    }).catch(function () {
      gRoot.hidden = false;
      gRoot.textContent = 'Sorry, My Garden could not load. Please refresh the page.';
    });
  }

  /* ---- Pests and diseases: name search and type buttons ---- */
  var pestFilters = $('#pestFilters');
  if (pestFilters) {
    pestFilters.hidden = false;
    var pestCards = $$('[data-pest]');
    var pestChips = $$('#pestFilters [data-filter="kind"]');
    var pestSearch = $('#pestSearch'), pestCount = $('#pestCount'), pestEmpty = $('#pestEmpty'), pestReset = $('#pestReset');
    var pState = { kind: 'any', q: '' };
    var pp = new URLSearchParams(location.search);
    var pk = pp.get('kind');
    if (pk && pestChips.some(function (c) { return c.getAttribute('data-value') === pk; })) pState.kind = pk;
    if (pp.get('q')) pState.q = pp.get('q').slice(0, 60);
    pestSearch.value = pState.q;
    var applyPests = function () {
      var term = pState.q.trim().toLowerCase();
      var shown = 0;
      pestCards.forEach(function (card) {
        var ok = (pState.kind === 'any' || card.getAttribute('data-kind') === pState.kind) && (!term || card.getAttribute('data-search').indexOf(term) > -1);
        card.hidden = !ok;
        if (ok) shown++;
      });
      pestChips.forEach(function (c) { c.setAttribute('aria-pressed', String(c.getAttribute('data-value') === pState.kind)); });
      pestCount.textContent = 'Showing ' + shown + ' of ' + pestCards.length;
      pestEmpty.hidden = shown > 0;
      pestReset.hidden = pState.kind === 'any' && !term;
      var qs = new URLSearchParams();
      if (pState.kind !== 'any') qs.set('kind', pState.kind);
      if (term) qs.set('q', pState.q.trim());
      try { history.replaceState(null, '', location.pathname + (qs.toString() ? '?' + qs.toString() : '')); } catch (err) { /* ignore */ }
    };
    pestChips.forEach(function (c) { c.addEventListener('click', function () { pState.kind = c.getAttribute('data-value'); applyPests(); }); });
    pestSearch.addEventListener('input', function () { pState.q = pestSearch.value; applyPests(); });
    pestReset.addEventListener('click', function () { pState.kind = 'any'; pState.q = ''; pestSearch.value = ''; applyPests(); });
    applyPests();
  }

  /* ---- Preserving: search ---- */
  var storeFilters = $('#storeFilters');
  if (storeFilters) {
    storeFilters.hidden = false;
    var storeItems = $$('[data-store]'), storeGroups = $$('[data-store-group]');
    var storeSearch = $('#storeSearch'), storeCount = $('#storeCount'), storeEmpty = $('#storeEmpty'), storeReset = $('#storeReset');
    var sq = new URLSearchParams(location.search).get('q');
    if (sq) storeSearch.value = sq.slice(0, 60);
    var applyStore = function () {
      var term = storeSearch.value.trim().toLowerCase(), shown = 0;
      storeItems.forEach(function (li) { var ok = !term || li.getAttribute('data-search').indexOf(term) > -1; li.hidden = !ok; if (ok) shown++; });
      storeGroups.forEach(function (g) { g.hidden = !g.querySelector('[data-store]:not([hidden])'); });
      storeCount.textContent = term ? 'Showing ' + shown + ' of ' + storeItems.length : '';
      storeEmpty.hidden = shown > 0;
      storeReset.hidden = !term;
      try { history.replaceState(null, '', location.pathname + (term ? '?q=' + encodeURIComponent(term) : '')); } catch (err) { /* ignore */ }
    };
    storeSearch.addEventListener('input', applyStore);
    storeReset.addEventListener('click', function () { storeSearch.value = ''; applyStore(); });
    applyStore();
  }

  /* ---- Home page: show this month's panel ---- */
  var monthPanels = $$('[data-month-panel]');
  if (monthPanels.length) {
    var thisMonth = String(new Date().getMonth());
    monthPanels.forEach(function (p) { p.hidden = p.getAttribute('data-month-panel') !== thisMonth; });
  }

  /* ---- Plant page: mark the current month on the at-a-glance bars ---- */
  var nowMonth = String(new Date().getMonth());
  $$('.mbar [data-m]').forEach(function (el) {
    if (el.getAttribute('data-m') === nowMonth) el.classList.add('now');
  });

  /* ---- Planting calendar: size filter and current month ---- */
  var calFilters = $('#calFilters');
  if (calFilters) {
    calFilters.hidden = false;
    var calSel = $('#calSize');
    var rows = $$('[data-calrow]');
    var calMine = $('#calMine');
    var applyCal = function () {
      var size = calSel.value, mineOnly = calMine.checked, mine = loadGarden(), shown = 0;
      rows.forEach(function (row) {
        var ok = (size === 'all' || row.getAttribute('data-sizes').split(' ').indexOf(size) > -1) && (!mineOnly || mine.indexOf(row.getAttribute('data-id')) > -1);
        row.hidden = !ok; if (ok) shown++;
      });
      var empty = $('#calEmpty');
      if (empty) empty.hidden = shown > 0;
    };
    calSel.addEventListener('change', applyCal);
    calMine.addEventListener('change', applyCal);
    /* Add to my garden: a button beside each crop name */
    rows.forEach(function (row) {
      var id = row.getAttribute('data-id'), th = row.querySelector('th'), name = th.textContent.trim();
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'cal-add';
      var paint = function () {
        var has = loadGarden().indexOf(id) > -1;
        b.setAttribute('aria-pressed', String(has));
        b.textContent = has ? '\u2713' : '+';
        b.title = has ? 'In my garden (tap to remove)' : 'Add to my garden';
        b.setAttribute('aria-label', has ? name + ' is in my garden. Remove it' : 'Add ' + name + ' to my garden');
      };
      b.addEventListener('click', function () {
        var list = loadGarden(), at = list.indexOf(id);
        if (at > -1) list.splice(at, 1); else list.push(id);
        saveGarden(list); paint(); if (calMine.checked) applyCal();
      });
      paint(); th.appendChild(b);
    });
    var now = String(new Date().getMonth());
    $$('[data-month]').forEach(function (th) {
      if (th.getAttribute('data-month') === now) th.classList.add('now');
    });
  }
})();
