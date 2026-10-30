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

  /* ---- Plant guide filters ---- */
  var plantFilters = $('#plantFilters');
  if (plantFilters) {
    plantFilters.hidden = false;
    var search = $('#plantSearch');
    var sizeSel = $('#plantSize');
    var plantCards = $$('[data-plant]');
    var plantEmpty = $('#plantEmpty');
    var applyPlants = function () {
      var term = search.value.trim().toLowerCase();
      var size = sizeSel.value;
      var shown = 0;
      plantCards.forEach(function (card) {
        var okSize = size === 'all' || card.getAttribute('data-sizes').split(' ').indexOf(size) > -1;
        var okText = !term || card.getAttribute('data-search').indexOf(term) > -1;
        card.hidden = !(okSize && okText);
        if (!card.hidden) shown++;
      });
      plantEmpty.hidden = shown > 0;
    };
    search.addEventListener('input', applyPlants);
    sizeSel.addEventListener('change', applyPlants);
  }

  /* ---- Recipe filter ---- */
  var recipeFilters = $('#recipeFilters');
  if (recipeFilters) {
    recipeFilters.hidden = false;
    var cropSel = $('#recipeFilter');
    var recipeCards = $$('[data-recipe]');
    var recipeEmpty = $('#recipeEmpty');
    cropSel.addEventListener('change', function () {
      var crop = cropSel.value;
      var shown = 0;
      recipeCards.forEach(function (card) {
        var ok = crop === 'all' || card.getAttribute('data-uses').split(' ').indexOf(crop) > -1;
        card.hidden = !ok;
        if (ok) shown++;
      });
      recipeEmpty.hidden = shown > 0;
    });
  }

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
