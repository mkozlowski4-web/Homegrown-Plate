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

  /* Home page: the "Your month" flow (plant now, cook, keep), set by garden size and region */
  var flow = $('[data-month-flow]');
  if (flow) {
    var panels = $$('[data-month-panel]'), shown = new Date().getMonth();
    var sizeSel = $('[data-home-size]'), zoneSel = $('[data-home-zone]'), forTxt = $('[data-mf-for]'), monthTxt = $('[data-mf-month]');
    var SIZE_KEY = 'hp-size', size = sizeSel ? sizeSel.value : '';
    try { var savedSize = localStorage.getItem(SIZE_KEY); if (savedSize && sizeSel && sizeSel.querySelector('option[value="' + savedSize + '"]')) { sizeSel.value = savedSize; size = savedSize; } } catch (e) { /* storage unavailable */ }
    var gLoad = null, origSow = {};
    panels.forEach(function (p) { var l = p.querySelector('[data-mf-sow]'); if (l) origSow[p.getAttribute('data-month-panel')] = l.innerHTML; });
    var MAX = 4;
    var fitSize = function (li) { var s = (li.getAttribute('data-sizes') || '').split(' '); return !size || s.indexOf(size) > -1; };
    var trim = function (panel) {
      var list = panel.querySelector('[data-mf-sow]'); if (!list) return;
      var kids = document.documentElement.hasAttribute('data-kids'), n = 0;
      Array.prototype.slice.call(list.children).forEach(function (li) {
        var ok = fitSize(li) && !(kids && li.classList.contains('kid-hide'));
        li.hidden = !ok || n >= MAX; if (ok) n++;
      });
      var c = panel.querySelector('[data-mf-count]'); if (c) c.textContent = n;
      var e = panel.querySelector('[data-mf-empty]'); if (e) e.hidden = n > 0;
    };
    var paintSow = function (panel) {
      var m = Number(panel.getAttribute('data-month-panel')), list = panel.querySelector('[data-mf-sow]'), off = Region.off();
      if (!list) return;
      if (!off) { list.innerHTML = origSow[m]; trim(panel); return; }
      if (!gLoad) gLoad = fetch($('#homeRegion').getAttribute('data-garden')).then(function (r) { return r.json(); });
      gLoad.then(function (d) {
        if (Region.off() !== off) return;
        var order = {}; Array.prototype.slice.call(new DOMParser().parseFromString('<ul>' + origSow[m] + '</ul>', 'text/html').querySelectorAll('a')).forEach(function (a, k) { order[a.getAttribute('href')] = k; });
        var sow = d.plants.filter(function (p) { return ['i', 'o'].some(function (k) { return Region.monthState(Region.shifted(p[k], k, off), m) > 0; }); });
        sow.sort(function (a, b) { var x = order['/plants/' + a.id + '/'], y = order['/plants/' + b.id + '/']; return (x == null ? 999 : x) - (y == null ? 999 : y) || a.n.localeCompare(b.n, 'en-GB'); });
        list.textContent = '';
        sow.forEach(function (p) {
          var li = mk('li', 'mf-li' + (p.k ? ' kid-hide' : '')); li.setAttribute('data-sizes', (p.s || []).join(' '));
          var a = mk('a', 'mf-item'); a.href = '/plants/' + p.id + '/';
          var img = mk('img', 'pimg small'); img.src = p.img; img.alt = ''; img.width = 72; img.height = 72; img.loading = 'lazy';
          var t = mk('span'); t.appendChild(mk('strong', null, p.n));
          t.appendChild(mk('span', null, Region.monthState(Region.shifted(p.o, 'o', off), m) ? 'Sow or plant outside' : 'Sow indoors'));
          a.appendChild(img); a.appendChild(t); li.appendChild(a); list.appendChild(li);
        });
        trim(panel);
      }).catch(function () { list.innerHTML = origSow[m]; trim(panel); });
    };
    var paintFor = function () {
      if (!forTxt) return;
      var r = Region.current(), o = sizeSel ? sizeSel.options[sizeSel.selectedIndex] : null;
      var where = r ? 'dates adjusted for ' + r.name : 'typical dates for central England';
      forTxt.textContent = 'For ' + (o ? (/^[aeiou]/i.test(o.textContent) ? 'an ' : 'a ') + o.textContent : 'any garden') + ', with ' + where;
      if (zoneSel) zoneSel.value = r && r.z ? r.z : '';
    };
    var show = function (m) {
      shown = (m + 12) % 12;
      panels.forEach(function (p) { p.hidden = Number(p.getAttribute('data-month-panel')) !== shown; });
      var cur = panels.filter(function (p) { return !p.hidden; })[0];
      if (monthTxt && cur) monthTxt.textContent = cur.getAttribute('data-month-label');
      if (cur) paintSow(cur);
    };
    var prev = $('[data-mf-prev]'), next = $('[data-mf-next]');
    if (prev && next) {
      prev.hidden = next.hidden = false;
      prev.addEventListener('click', function () { show(shown - 1); });
      next.addEventListener('click', function () { show(shown + 1); });
    }
    if (sizeSel) sizeSel.addEventListener('change', function () {
      size = sizeSel.value;
      try { localStorage.setItem(SIZE_KEY, size); } catch (e) { /* storage unavailable */ }
      paintFor(); panels.forEach(trim);
    });
    if (zoneSel) zoneSel.addEventListener('change', function () {
      var o = zoneSel.options[zoneSel.selectedIndex];
      if (!o.value) { Region.set(null); return; }
      Region.set({ z: o.value, off: Number(o.getAttribute('data-off')), name: o.textContent.trim(), pc: '' });
    });
    Region.onChange(function () { paintFor(); show(shown); });
    document.addEventListener('hp-kids', function () { panels.forEach(trim); });
    paintFor(); show(shown);

    /* Phones and small tablets: each step folds, with one button to open or close all three */
    var allBtn = $('[data-mf-all]'), narrow = window.matchMedia('(max-width: 1000px)');
    var openState = [true, false, false];
    var cols = function () { return $$('.month-panel [data-mf-col]'); };
    var applyCols = function () {
      cols().forEach(function (d) {
        var k = Array.prototype.indexOf.call(d.parentNode.children, d);
        d.open = narrow.matches ? !!openState[k] : true;
        var sum = d.querySelector('summary'); if (sum) { if (narrow.matches) sum.removeAttribute('tabindex'); else sum.setAttribute('tabindex', '-1'); }
      });
      if (allBtn) {
        allBtn.hidden = !narrow.matches;
        var all = openState.every(Boolean);
        allBtn.textContent = all ? 'Collapse all' : 'Expand all';
        allBtn.setAttribute('aria-expanded', String(all));
      }
    };
    cols().forEach(function (d) {
      d.querySelector('summary').addEventListener('click', function (ev) {
        ev.preventDefault();
        if (!narrow.matches) return;
        var k = Array.prototype.indexOf.call(d.parentNode.children, d);
        openState[k] = !openState[k]; applyCols();
      });
    });
    if (allBtn) allBtn.addEventListener('click', function () {
      var open = !openState.every(Boolean);
      openState = [open, open, open]; applyCols();
    });
    if (narrow.addEventListener) narrow.addEventListener('change', applyCols); else if (narrow.addListener) narrow.addListener(applyCols);
    applyCols();
  }


  /* ---- Kids mode ---- */
  var kidsToggles = $$('[data-kids-toggle]');
  $$('[data-kids-toggle]').forEach(function (b) { b.hidden = false; });
  var paintKids = function () {
    var on = document.documentElement.hasAttribute('data-kids');
    kidsToggles.forEach(function (t) {
      t.setAttribute(t.getAttribute('role') === 'switch' ? 'aria-checked' : 'aria-pressed', String(on));
      var lab = t.querySelector('.kids-switch-label'); if (lab) lab.textContent = 'Kids mode';
    });
  };
  kidsToggles.forEach(function (t) {
    t.addEventListener('click', function () {
      var on = !document.documentElement.hasAttribute('data-kids');
      if (on) document.documentElement.setAttribute('data-kids', '1'); else document.documentElement.removeAttribute('data-kids');
      try { localStorage.setItem('hp-kids', on ? '1' : '0'); } catch (e) { /* storage unavailable */ }
      paintKids(); document.dispatchEvent(new Event('hp-kids'));
    });
  });
  paintKids();

  /* ---- Mobile menu ---- */
  var navToggle = $('#navToggle'), siteNav = $('#siteNav');
  if (navToggle && siteNav) {
    document.documentElement.classList.add('js-nav');
    navToggle.hidden = false;
    var setNav = function (open) { siteNav.classList.toggle('open', open); navToggle.setAttribute('aria-expanded', String(open)); };
    navToggle.addEventListener('click', function () { setNav(navToggle.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setNav(false); });
    document.addEventListener('click', function (e) { if (!siteNav.contains(e.target) && !navToggle.contains(e.target)) setNav(false); });
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
    /* No filters in the address: use the garden size chosen on the home page, if any */
    if (!location.search) { try { var hs = localStorage.getItem('hp-size'); if (hs && isValid('size', hs)) state.size = hs; } catch (e) { /* storage unavailable */ } }
    search.value = state.q;
    var pgGroups = $$('[data-pg-group]'), pgBadge = $('#pgBadge'), pgBtn = $('#pgFilterBtn'), pgBody = $('#pgFilterBody'), pgDone = $('#pgDone');
    var setPanel = function (open) {
      if (!pgBtn) return;
      pgBtn.setAttribute('aria-expanded', String(open));
      plantFilters.classList.toggle('pg-open', open);
    };
    if (pgBtn) pgBtn.addEventListener('click', function () { setPanel(pgBtn.getAttribute('aria-expanded') !== 'true'); });
    if (pgDone) pgDone.addEventListener('click', function () { setPanel(false); var st = $('.pg-status'); if (st) st.scrollIntoView({ block: 'start' }); });
    var chipLabel = function (group) { var c = chips.filter(function (x) { return x.getAttribute('data-filter') === group && x.getAttribute('data-value') === state[group]; })[0]; if (!c) return ''; var t = c.cloneNode(true); Array.prototype.forEach.call(t.querySelectorAll('[aria-hidden]'), function (n) { n.remove(); }); return t.textContent.trim(); };

    document.addEventListener('hp-kids', function () { if (typeof applyPlants === 'function') applyPlants(); });
    var applyPlants = function () {
      var term = state.q.trim().toLowerCase();
      var shown = 0, kidsOn = document.documentElement.hasAttribute('data-kids'), total = 0;
      plantCards.forEach(function (card) {
        var gone = kidsOn && card.classList.contains('kid-hide'); if (!gone) total++;
        var okSun = state.sun === 'any' || card.getAttribute('data-sun').split(' ').indexOf(state.sun) > -1;
        var okSize = state.size === 'any' || card.getAttribute('data-sizes').split(' ').indexOf(state.size) > -1;
        var okDiff = state.diff === 'any' || card.getAttribute('data-diff') === state.diff;
        var okText = !term || card.getAttribute('data-search').indexOf(term) > -1;
        card.hidden = !(okSun && okSize && okDiff && okText);
        if (!card.hidden && !gone) shown++;
      });
      chips.forEach(function (c) {
        c.setAttribute('aria-pressed', String(state[c.getAttribute('data-filter')] === c.getAttribute('data-value')));
      });
      var picked = ['size', 'sun', 'diff'].filter(function (g) { return state[g] !== 'any'; });
      plantCount.textContent = (shown === total ? 'All ' + total + ' crops' : 'Showing ' + shown + ' of ' + total + ' crops') +
        (picked.length ? ' for ' + picked.map(chipLabel).join(', ').toLowerCase() : '') + (term ? ' matching \u201c' + state.q.trim() + '\u201d' : '');
      plantEmpty.hidden = shown > 0;
      if (pgBadge) { pgBadge.textContent = picked.length; pgBadge.hidden = !picked.length; }
      pgGroups.forEach(function (g) {
        var n = Array.prototype.filter.call(g.querySelectorAll('[data-plant]'), function (c) { return !c.hidden && !(kidsOn && c.classList.contains('kid-hide')); }).length;
        g.hidden = n === 0; var cnt = g.querySelector('[data-pg-count]'); if (cnt) cnt.textContent = n;
      });
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
  /* Wide screens: show every section in a row rather than folded away. */
  var accWide = window.matchMedia ? window.matchMedia('(min-width: 960px)') : null;
  if (accWide && $('details.acc') && $('.plant-top')) {
    var applyWide = function () {
      var wide = accWide.matches;
      document.documentElement.classList.toggle('js-acc', wide);
      $$('details.acc').forEach(function (d, i) { if (wide) d.open = true; else if (i > 0) d.open = false; });
    };
    applyWide();
    if (accWide.addEventListener) accWide.addEventListener('change', applyWide);
  }
  var accToggle = $('#accToggle');
  if (accToggle) {
    var panels = $$('details.acc');
    var syncToggle = function () {
      var allOpen = panels.every(function (p) { return p.open; });
      accToggle.textContent = allOpen ? 'Collapse all' : 'Expand all';
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
        list = gData.plants.filter(function (p) { return p.n.toLowerCase().indexOf(term) > -1 && !(p.k && document.documentElement.hasAttribute('data-kids')); }).slice(0, 30);
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
        lab.appendChild(el('span', null, p.n));
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
          var strong = el('strong', null, p.n + ': ');
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

  /* ---- Beginner's guide: garden size and sunlight buttons ---- */
  var begFilters = $('#begFilters');
  if (begFilters) {
    begFilters.hidden = false;
    var begChips = $$('#begFilters [data-filter]');
    var begState = { bsize: 'all', bsun: 'all' };
    var bp = new URLSearchParams(location.search);
    ['bsize', 'bsun'].forEach(function (g) {
      var v = bp.get(g === 'bsize' ? 'size' : 'sun');
      if (v && begChips.some(function (c) { return c.getAttribute('data-filter') === g && c.getAttribute('data-value') === v; })) begState[g] = v;
    });
    var applyBeg = function () {
      $$('[data-bsize]').forEach(function (sec) { sec.hidden = begState.bsize !== 'all' && sec.getAttribute('data-bsize') !== begState.bsize; });
      $$('[data-bsun]').forEach(function (blk) { blk.hidden = begState.bsun !== 'all' && blk.getAttribute('data-bsun') !== begState.bsun; });
      begChips.forEach(function (c) { c.setAttribute('aria-pressed', String(begState[c.getAttribute('data-filter')] === c.getAttribute('data-value'))); });
    };
    begChips.forEach(function (c) { c.addEventListener('click', function () { begState[c.getAttribute('data-filter')] = c.getAttribute('data-value'); applyBeg(); }); });
    applyBeg();
    /* One-tap "add these crops to my garden" */
    $$('[data-add-crops]').forEach(function (btn) {
      btn.parentNode.hidden = false;
      var msg = btn.parentNode.querySelector('[data-add-msg]');
      var ids = btn.getAttribute('data-add-crops').split(',');
      btn.addEventListener('click', function () {
        var list = loadGarden(), added = 0;
        ids.forEach(function (id) { if (list.indexOf(id) < 0) { list.push(id); added++; } });
        saveGarden(list);
        msg.textContent = '';
        var text = document.createTextNode(added ? 'Added ' + added + (added === 1 ? ' crop. ' : ' crops. ') : 'Already in your garden. ');
        var link = document.createElement('a'); link.href = '/my-garden/'; link.textContent = 'Open my garden';
        msg.appendChild(text); msg.appendChild(link);
      });
    });
  }

  /* ---- Month pages: point "this month" buttons at the right month ---- */
  $$('[data-this-month]').forEach(function (a) {
    var names = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    a.href = '/' + a.getAttribute('data-this-month') + '/' + names[new Date().getMonth()] + '/';
  });


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
  /* ---- Accounts: keep the garden in step across devices (only when signed in) ---- */
  var Acct = (function () {
    var FLAG = 'hp-acct', DONE_RE = /^hp-garden-done-(\d{4})-(\d{1,2})$/;
    var ls = null; try { ls = window.localStorage; } catch (e) { ls = null; }
    var rawSet = ls ? ls.setItem.bind(ls) : function () {}, rawRemove = ls ? ls.removeItem.bind(ls) : function () {};
    var signedIn = function () { try { return ls && ls.getItem(FLAG) === '1'; } catch (e) { return false; } };
    var quiet = false, timer = null;

    var api = function (method, path, body) {
      var opts = { method: method, credentials: 'same-origin', headers: {} };
      if (body !== undefined) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
      return fetch(path, opts).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, status: r.status, body: j }; }); });
    };
    var readJson = function (k, d) { try { var v = JSON.parse(ls.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
    var collect = function () {
      var data = { garden: [], done: {}, region: null, kids: false }, i, k, m;
      if (!ls) return data;
      var g = readJson('hp-garden', []); if (Array.isArray(g)) data.garden = g.filter(function (x) { return typeof x === 'string'; });
      for (i = 0; i < ls.length; i++) { k = ls.key(i); m = DONE_RE.exec(k || ''); if (m) { var d = readJson(k, []); if (Array.isArray(d) && d.length) data.done[m[1] + '-' + m[2]] = d; } }
      var r = readJson('hp-region', null); if (r && typeof r === 'object') data.region = r;
      data.kids = ls.getItem('hp-kids') === '1';
      return data;
    };
    var apply = function (data) {
      quiet = true;
      try {
        rawSet('hp-garden', JSON.stringify(data.garden || []));
        var want = {}; Object.keys(data.done || {}).forEach(function (k) { want['hp-garden-done-' + k] = data.done[k]; });
        var stale = [], i, k; for (i = 0; i < ls.length; i++) { k = ls.key(i); if (DONE_RE.test(k || '') && !want[k]) stale.push(k); }
        stale.forEach(rawRemove);
        Object.keys(want).forEach(function (k) { rawSet(k, JSON.stringify(want[k])); });
        if (data.region) rawSet('hp-region', JSON.stringify(data.region)); else rawRemove('hp-region');
        rawSet('hp-kids', data.kids ? '1' : '0');
      } catch (e) { /* storage unavailable */ }
      quiet = false;
    };
    var same = function (a, b) { return JSON.stringify(norm(a)) === JSON.stringify(norm(b)); };
    var norm = function (d) {
      var done = {}; Object.keys(d.done || {}).sort().forEach(function (k) { done[k] = (d.done[k] || []).slice().sort(); });
      return { g: (d.garden || []).slice().sort(), d: done, r: d.region ? { off: d.region.off, name: d.region.name, z: d.region.z || '', pc: d.region.pc || '' } : null, k: !!d.kids };
    };
    var union = function (a, b) { var s = {}; return (a || []).concat(b || []).filter(function (x) { if (s[x]) return false; s[x] = 1; return true; }); };
    /* First sign-in on a device: keep what is on the device and what is on the account. */
    var merge = function (local, server) {
      var done = {}; Object.keys(local.done || {}).concat(Object.keys(server.done || {})).forEach(function (k) { done[k] = union(local.done[k], server.done && server.done[k]); });
      return { garden: union(server.garden, local.garden), done: done, region: server.region || local.region, kids: server.kids || local.kids };
    };
    var push = function () {
      if (!signedIn()) return Promise.resolve();
      return api('PUT', '/api/data', { data: collect() }).then(function (r) { if (r.status === 401) setOut(); return r; }).catch(function () {});
    };
    var schedulePush = function () { if (quiet || !signedIn()) return; clearTimeout(timer); timer = setTimeout(push, 700); };
    var setOut = function () { try { ls.removeItem(FLAG); } catch (e) { /* ignore */ } };
    var setIn = function () { try { ls.setItem(FLAG, '1'); } catch (e) { /* ignore */ } };

    /* Any change to our own saved keys is sent to the account. */
    if (ls && window.Storage) {
      var origSet = Storage.prototype.setItem, origRemove = Storage.prototype.removeItem;
      Storage.prototype.setItem = function (k, v) { origSet.call(this, k, v); if (this === ls && /^hp-(garden|region|kids)/.test(k)) schedulePush(); };
      Storage.prototype.removeItem = function (k) { origRemove.call(this, k); if (this === ls && /^hp-(garden|region|kids)/.test(k)) schedulePush(); };
    }
    window.addEventListener('pagehide', function () { if (timer && signedIn()) { clearTimeout(timer); try { fetch('/api/data', { method: 'PUT', credentials: 'same-origin', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data: collect() }) }); } catch (e) { /* ignore */ } } });

    var reloadOnce = function () {
      var n = 0; try { n = Number(sessionStorage.getItem('hp-sync-reloads') || 0); } catch (e) { n = 9; }
      if (n >= 2) return; try { sessionStorage.setItem('hp-sync-reloads', String(n + 1)); } catch (e) { return; }
      location.reload();
    };
    /* On every page load while signed in: the account is the source of truth. */
    var pull = function () {
      return api('GET', '/api/data').then(function (r) {
        if (r.status === 401) { setOut(); return null; }
        if (!r.ok || !r.body.data) return null;
        var local = collect();
        if (!same(local, r.body.data)) { apply(r.body.data); reloadOnce(); } else { try { sessionStorage.removeItem('hp-sync-reloads'); } catch (e) { /* ignore */ } }
        return r.body.data;
      }).catch(function () { return null; });
    };
    return { api: api, collect: collect, apply: apply, merge: merge, same: same, push: push, pull: pull, signedIn: signedIn, setIn: setIn, setOut: setOut, quiet: function (v) { quiet = v; } };
  })();

  (function accountUi() {
    var signedIn = Acct.signedIn();
    /* My Garden prompt */
    var prompt = $('[data-acct-prompt]'), saved = $('[data-acct-saved]');
    if (prompt) prompt.hidden = signedIn;
    if (saved) saved.hidden = !signedIn;
    if (signedIn) Acct.pull();
    $$('.acct-dot').forEach(function (d) { d.hidden = !signedIn; });
    $$('.acct-link').forEach(function (l) { l.title = signedIn ? 'Account (signed in)' : 'Account'; });

    var root = $('#acct'); if (!root) return;
    root.hidden = false;
    var out = $('#acctOut'), inn = $('#acctIn');
    var show = function (inState, email) {
      out.hidden = inState; inn.hidden = !inState; if (email) $('#acctEmail').textContent = email;
      var adminLink = $('[data-admin-link]'); if (adminLink) { adminLink.hidden = true; if (inState) Acct.api('GET', '/api/me').then(function (r) { adminLink.hidden = !(r.ok && r.body.user && r.body.user.admin); }).catch(function () { /* hidden */ }); }
    };
    var errorOf = function (form) { return form.querySelector('[data-error]'); };
    var busy = function (form, on) { Array.prototype.forEach.call(form.querySelectorAll('button[type=submit]'), function (b) { b.disabled = on; }); };
    var nice = function (r) { return (r && r.body && r.body.error) || 'Something went wrong. Please check your connection and try again.'; };

    /* tabs */
    var tabIn = $('#tabIn'), tabUp = $('#tabUp'), fIn = $('#formIn'), fUp = $('#formUp');
    var tab = function (up) { tabIn.setAttribute('aria-selected', String(!up)); tabUp.setAttribute('aria-selected', String(up)); fIn.hidden = up; fUp.hidden = !up; };
    tabIn.addEventListener('click', function () { tab(false); }); tabUp.addEventListener('click', function () { tab(true); });
    if (location.hash === '#create') tab(true);

    var afterAuth = function (r, email) {
      Acct.setIn();
      var local = Acct.collect(), merged = Acct.merge(local, r.body.data || { garden: [], done: {}, region: null, kids: false });
      Acct.apply(merged); return Acct.push().then(function () { show(true, email); try { sessionStorage.removeItem('hp-sync-reloads'); } catch (e) { /* ignore */ } });
    };
    fIn.addEventListener('submit', function (e) {
      e.preventDefault(); var err = errorOf(fIn); err.textContent = ''; busy(fIn, true);
      Acct.api('POST', '/api/login', { email: $('#inEmail').value, password: $('#inPass').value }).then(function (r) {
        if (!r.ok) { err.textContent = nice(r); busy(fIn, false); return; }
        $('#inPass').value = ''; return afterAuth(r, r.body.user.email).then(function () { busy(fIn, false); });
      }).catch(function () { err.textContent = nice(); busy(fIn, false); });
    });
    fUp.addEventListener('submit', function (e) {
      e.preventDefault(); var err = errorOf(fUp); err.textContent = ''; busy(fUp, true);
      var pass = $('#upPass').value;
      if (pass.length < 10) { err.textContent = 'Use at least 10 characters for your password.'; busy(fUp, false); return; }
      Acct.api('POST', '/api/signup', { email: $('#upEmail').value, password: pass, data: Acct.collect() }).then(function (r) {
        if (!r.ok) { err.textContent = nice(r); busy(fUp, false); return; }
        $('#upPass').value = ''; Acct.setIn(); show(true, r.body.user.email); busy(fUp, false); if (window.hpTrack) window.hpTrack('signup');
      }).catch(function () { err.textContent = nice(); busy(fUp, false); });
    });
    $('#acctOutBtn').addEventListener('click', function () {
      Acct.api('POST', '/api/logout', {}).finally(function () { Acct.setOut(); show(false); });
    });
    var fPw = $('#formPw'), fDel = $('#formDel');
    fPw.addEventListener('submit', function (e) {
      e.preventDefault(); var err = errorOf(fPw); err.textContent = ''; busy(fPw, true);
      Acct.api('POST', '/api/password', { current: $('#pwCur').value, next: $('#pwNew').value }).then(function (r) {
        busy(fPw, false); if (!r.ok) { err.textContent = nice(r); return; }
        $('#pwCur').value = ''; $('#pwNew').value = ''; err.textContent = ''; var ok = $('#acctStatus'); ok.textContent = 'Password changed. Other devices have been signed out.';
      }).catch(function () { err.textContent = nice(); busy(fPw, false); });
    });
    fDel.addEventListener('submit', function (e) {
      e.preventDefault(); var err = errorOf(fDel); err.textContent = '';
      if (!window.confirm('Delete your account and saved garden permanently? This cannot be undone.')) return;
      busy(fDel, true);
      Acct.api('POST', '/api/delete', { password: $('#delPass').value }).then(function (r) {
        busy(fDel, false); if (!r.ok) { err.textContent = nice(r); return; }
        $('#delPass').value = ''; Acct.setOut(); show(false);
      }).catch(function () { err.textContent = nice(); busy(fDel, false); });
    });

    /* Which state to show on arrival */
    if (signedIn) {
      Acct.api('GET', '/api/me').then(function (r) { if (r.ok && r.body.user) show(true, r.body.user.email); else { Acct.setOut(); show(false); } }).catch(function () { show(false); });
    } else {
      /* A session cookie may exist from before the browser data was cleared: offer it back. */
      Acct.api('GET', '/api/me').then(function (r) { if (r.ok && r.body.user) { Acct.setIn(); Acct.pull().then(function () { show(true, r.body.user.email); }); } }).catch(function () { /* stay signed out */ });
    }
  })();

  /* ---- Counting visits and interactions: no cookies, nothing stored on your device ---- */
  (function track() {
    var skip = false;
    try { skip = navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.msDoNotTrack === '1' || navigator.globalPrivacyControl === true; } catch (e) { skip = false; }
    var path = location.pathname;
    if (skip || !navigator.sendBeacon || /^\/(api|admin|offline)(\/|$)/.test(path)) return;
    var send = function (name) {
      var body = { p: path, w: window.innerWidth || 0, wd: navigator.webdriver ? 1 : 0 };
      if (name) body.e = name; else { try { body.r = document.referrer ? new URL(document.referrer).hostname : ''; } catch (e) { body.r = ''; } }
      try { navigator.sendBeacon('/api/hit', new Blob([JSON.stringify(body)], { type: 'application/json' })); } catch (e) { /* counting is optional */ }
    };
    /* A page view is counted once the page has been visible for a moment (most bots never get this far). */
    var counted = false, wait = function () {
      if (counted) return;
      setTimeout(function () { if (!counted && document.visibilityState === 'visible') { counted = true; send(''); } }, 1200);
    };
    if (document.visibilityState === 'visible') wait(); else document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') wait(); });

    var once = {}, event = function (name) { if (once[name]) return; once[name] = true; send(name); };
    window.hpTrack = event;
    /* Interactions are spotted from the saved changes, so every add-crop button and tick is covered. */
    if (window.Storage) {
      var prev = Storage.prototype.setItem;
      Storage.prototype.setItem = function (k, v) {
        var old = null, self = this; try { old = self.getItem(k); } catch (e) { old = null; }
        prev.call(self, k, v);
        try {
          if (self !== window.localStorage) return;
          var len = function (s) { try { var a = JSON.parse(s); return Array.isArray(a) ? a.length : 0; } catch (e) { return 0; } };
          if (k === 'hp-garden' && len(v) > len(old)) send('add_crop');
          else if (/^hp-garden-done-/.test(k) && len(v) > len(old)) event('tick_job');
          else if (k === 'hp-region' && v && v !== old) event('region_set');
          else if (k === 'hp-kids' && v === '1' && old !== '1') send('kids_on');
        } catch (e) { /* ignore */ }
      };
    }
    document.addEventListener('input', function (e) { var t = e.target; if (t && /^(plantSearch|gSearch|pestSearch|heroSearch)$/.test(t.id) && t.value && t.value.length >= 3) event('search'); });
    document.addEventListener('click', function (e) { if (e.target && e.target.closest && e.target.closest('[data-install-btn]')) event('install'); });
  })();

  /* ---- Installable app ---- */
  if ('serviceWorker' in navigator) window.addEventListener('load', function () { navigator.serviceWorker.register('/sw.js').catch(function () { /* offline support is optional */ }); });
  var installBox = $('[data-install-box]'), installBtn = $('[data-install-btn]'), installedMsg = $('[data-installed]'), deferred = null;
  var standalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  if (installedMsg && standalone) installedMsg.hidden = false;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; if (installBox && !standalone) installBox.hidden = false; });
  if (installBtn) installBtn.addEventListener('click', function () {
    if (!deferred) return; deferred.prompt();
    deferred.userChoice.then(function () { deferred = null; if (installBox) installBox.hidden = true; });
  });
  window.addEventListener('appinstalled', function () { if (installBox) installBox.hidden = true; if (installedMsg) installedMsg.hidden = false; });
})();

/* My Garden tabs */
(function () {
  var wrap = document.getElementById('myGarden');
  if (!wrap) return;
  var tabs = [].slice.call(wrap.querySelectorAll('[data-tab]'));
  var panels = [].slice.call(wrap.querySelectorAll('[data-tabpanel]'));
  if (!tabs.length) return;
  function show(name, focus) {
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-tab') === name;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    panels.forEach(function (p) { p.hidden = p.getAttribute('data-tabpanel') !== name; });
    try { history.replaceState(null, '', '#' + name); } catch (e) {}
  }
  function count() {
    try { var g = JSON.parse(localStorage.getItem('hp-garden') || '[]'); return Array.isArray(g) ? g.length : 0; } catch (e) { return 0; }
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { show(t.getAttribute('data-tab')); });
    t.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      show(tabs[(i + d + tabs.length) % tabs.length].getAttribute('data-tab'), true);
    });
  });
  var h = (location.hash || '').slice(1);
  var ok = tabs.some(function (t) { return t.getAttribute('data-tab') === h; });
  show(ok ? h : (count() ? 'weekend' : 'crops'));
  /* count badge */
  var badge = document.getElementById('gTabCount');
  function upd() { var n = count(); if (badge) badge.textContent = n ? '(' + n + ')' : ''; }
  upd(); setInterval(upd, 1500);
})();
