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
