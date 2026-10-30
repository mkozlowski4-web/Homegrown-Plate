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
      d.plants.forEach(function (p) { byId[p.id] = p; });
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
    calSel.addEventListener('change', function () {
      var size = calSel.value;
      rows.forEach(function (row) {
        row.hidden = !(size === 'all' || row.getAttribute('data-sizes').split(' ').indexOf(size) > -1);
      });
    });
    var now = String(new Date().getMonth());
    $$('[data-month]').forEach(function (th) {
      if (th.getAttribute('data-month') === now) th.classList.add('now');
    });
  }
})();
