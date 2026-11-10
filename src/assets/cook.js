/* Homegrown Plate: recipe page extras.
   1. Servings: a "Serves 4  −  +" control above the ingredients that rescales every amount it can read
      ("200 g", "1/2 tsp", "2 large", "1–2", "400 ml tin"). Words like "a handful" or "to taste" stay as they are.
      Recipes that make a batch ("makes about 4 jars") get a batch size control instead.
   2. Cooking mode: full-screen, one step at a time, big Back and Next buttons, a timer, and the screen kept on
      (Screen Wake Lock) while it is open.
   The recipe page works the same without this file. */
(function () {
  'use strict';

  var list = document.querySelector('.recipe-ingredients[data-serves]');
  if (!list) return;
  var qtyEls = list.querySelectorAll('.ing-qty');
  if (!qtyEls.length) return;
  var originals = Array.prototype.map.call(qtyEls, function (el) { return el.textContent; });

  /* ---- Reading and writing amounts ---- */
  var NUM = '(\\d+\\s+\\d+\\/\\d+|\\d+\\/\\d+|\\d+(?:\\.\\d+)?)';
  var ADJ = '(?:(large|medium|small|thick|fresh|generous)\\s+)?';
  var NOUNS = { head: 'heads', clove: 'cloves', ball: 'balls', slice: 'slices', nest: 'nests', sheet: 'sheets', loaf: 'loaves',
    bunch: 'bunches', handful: 'handfuls', thumb: 'thumbs', piece: 'pieces', jar: 'jars', bottle: 'bottles', slab: 'slabs',
    bowl: 'bowls', square: 'squares', leaf: 'leaves', tin: 'tins', block: 'blocks' };
  var SINGULAR = {};
  Object.keys(NOUNS).forEach(function (k) { SINGULAR[NOUNS[k]] = k; });
  var nounAlt = Object.keys(NOUNS).concat(Object.keys(SINGULAR)).join('|');
  /* number (or range), then a unit, or a size word and/or a countable word */
  var AMOUNT = new RegExp(NUM + '(?:\\s*[–-]\\s*' + NUM + ')?(?:\\s*(kg|g|ml|litres?|tbsp|tsp|cm)\\b|\\s+' + ADJ + '(' + nounAlt + ')\\b|\\s+(large|medium|small|thick|fresh|generous)\\b)?', 'g');

  function num(t) {
    t = t.trim();
    var m = t.match(/^(\d+)\s+(\d+)\/(\d+)$/);
    if (m) return +m[1] + m[2] / m[3];
    m = t.match(/^(\d+)\/(\d+)$/);
    if (m) return m[1] / m[2];
    return parseFloat(t);
  }
  var GLYPH = { 0.25: '¼', 0.5: '½', 0.75: '¾' };
  function frac(v) {           /* 1.5 -> "1½", 0.25 -> "¼" */
    var whole = Math.floor(v + 1e-9), part = Math.round((v - whole) * 4) / 4;
    if (part === 1) { whole += 1; part = 0; }
    return (whole ? String(whole) : '') + (part ? GLYPH[part] : (whole ? '' : '0'));
  }
  function dec(v) { return String(Math.round(v * 10) / 10); }
  function step(v, by, min) { return Math.max(min || by, Math.round(v / by) * by); }

  /* A scaled number in a unit: returns [number text, unit text] */
  function metric(v, unit) {
    if (unit === 'kg') { if (v < 1) return metric(v * 1000, 'g'); return [dec(step(v, 0.1)), 'kg']; }
    if (/^litre/.test(unit)) { if (v < 1) return metric(v * 1000, 'ml'); v = step(v, 0.1); return [dec(v), v === 1 ? 'litre' : 'litres']; }
    if (unit === 'g' || unit === 'ml') {
      if (v >= 1000) return unit === 'g' ? metric(v / 1000, 'kg') : metric(v / 1000, 'litres');
      return [String(v < 10 ? step(v, 0.5) : v < 100 ? step(v, 5) : step(v, 10)), unit];
    }
    if (unit === 'tsp') { if (v >= 3) return metric(v / 3, 'tbsp'); return [frac(step(v, 0.25)), 'tsp']; }
    if (unit === 'tbsp') { if (v < 0.5) return metric(v * 3, 'tsp'); return [frac(step(v, 0.5)), 'tbsp']; }
    if (unit === 'cm') return [String(step(v, 1)), 'cm'];
    return [frac(v < 1 ? step(v, 0.25) : v < 3 ? step(v, 0.5) : step(v, 1)), ''];
  }

  function scaleText(text, f) {
    if (f === 1) return text;
    /* A pack size: "400 ml tin" is one tin, so it becomes "2 × 400 ml tins" */
    var pack = text.match(/^(\d+(?:\.\d+)?\s*(?:g|ml))\s+(tin|sheet|block)$/);
    if (pack) {
      var n = f < 1 ? step(f, 0.25) : step(f, 0.5);
      return n === 1 ? text : frac(n) + ' × ' + pack[1] + ' ' + (n > 1 ? NOUNS[pack[2]] : pack[2]);
    }
    return text.replace(AMOUNT, function (all, a, b, unit, adj1, noun, adj2) {
      var lo = num(a) * f, hi = b ? num(b) * f : null;
      var adj = adj1 || adj2;
      if (unit) {
        var A = metric(lo, unit), out = A[0];
        if (hi != null) {
          var B = metric(hi, unit);
          if (B[1] === A[1]) out = B[0] === A[0] ? A[0] : A[0] + '–' + B[0];
          else out = A[0] + ' ' + A[1] + '–' + B[0];
          return out + ' ' + B[1];
        }
        return out + ' ' + A[1];
      }
      var lo2 = metric(lo, '')[0], hi2 = hi != null ? metric(hi, '')[0] : null;
      var n = hi2 != null && hi2 !== lo2 ? lo2 + '–' + hi2 : lo2;
      var biggest = hi != null ? hi : lo, many = biggest > 1.01;
      var tail = '';
      if (adj) tail += ' ' + adj;
      if (noun) {
        var one = SINGULAR[noun] || noun;
        tail += ' ' + (many ? NOUNS[one] : one);
      }
      return n + tail;
    });
  }

  /* ---- The control ---- */
  var servesRaw = list.getAttribute('data-serves');
  var people = servesRaw.match(/^(\d+)(?:\s*[–-]\s*(\d+))?$/);
  var batchable = !people && AMOUNT.test(servesRaw);
  AMOUNT.lastIndex = 0;
  if (!people && !batchable) return;

  var base = people ? (people[2] ? (+people[1] + +people[2]) / 2 : +people[1]) : 1;
  var MULTS = [0.5, 1, 1.5, 2, 3, 4];
  var maxPeople = Math.max(12, Math.ceil(base) * 3);
  var current = people ? null : 1; /* null = as written */

  function mk(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  var box = mk('div', 'servings');
  box.setAttribute('role', 'group');
  box.setAttribute('aria-label', people ? 'Number of servings' : 'Batch size');
  var label = mk('span', 'servings-label', people ? 'Serves' : '');
  var minus = mk('button', 'servings-btn', '−'); minus.type = 'button';
  minus.setAttribute('aria-label', people ? 'Fewer servings' : 'Smaller batch');
  var out = mk('output', 'servings-val'); out.setAttribute('aria-live', 'polite');
  var plus = mk('button', 'servings-btn', '+'); plus.type = 'button';
  plus.setAttribute('aria-label', people ? 'More servings' : 'Bigger batch');
  var reset = mk('button', 'servings-reset', 'Back to the original'); reset.type = 'button';
  [label, minus, out, plus, reset].forEach(function (n) { box.appendChild(n); });
  var note = mk('p', 'servings-note muted small-note',
    'Amounts like "a handful" or "to taste" stay as written, so go by eye. Bigger batches may need a bigger pan and a little longer to cook.');
  list.parentNode.insertBefore(box, list);
  list.parentNode.insertBefore(note, list.nextSibling);

  function factor() { return people ? (current == null ? 1 : current / base) : current; }
  function render() {
    var f = factor(), changed = people ? current != null : current !== 1;
    Array.prototype.forEach.call(qtyEls, function (el, i) {
      el.textContent = scaleText(originals[i], f);
      el.classList.toggle('is-changed', el.textContent !== originals[i]);
    });
    if (people) {
      out.textContent = current == null ? servesRaw : String(current);
      minus.disabled = (current == null ? Math.ceil(base) - 1 : current - 1) < 1;
      plus.disabled = (current == null ? Math.floor(base) + 1 : current + 1) > maxPeople;
    } else {
      var y = scaleText(servesRaw, f);
      out.textContent = y.charAt(0).toUpperCase() + y.slice(1);
      minus.disabled = f === MULTS[0];
      plus.disabled = f === MULTS[MULTS.length - 1];
    }
    reset.hidden = !changed;
    note.hidden = !changed;
    list.classList.toggle('is-scaled', changed);
  }
  minus.addEventListener('click', function () {
    if (people) current = current == null ? Math.ceil(base) - 1 : current - 1;
    else current = MULTS[Math.max(0, MULTS.indexOf(current) - 1)];
    if (people && current === base) current = null;
    render();
  });
  plus.addEventListener('click', function () {
    if (people) current = current == null ? Math.floor(base) + 1 : current + 1;
    else current = MULTS[Math.min(MULTS.length - 1, MULTS.indexOf(current) + 1)];
    if (people && current === base) current = null;
    render();
  });
  reset.addEventListener('click', function () { current = people ? null : 1; render(); });
  render();
  window.HGPScale = scaleText; /* for testing */
})();

/* ---- Cooking mode ---- */
(function () {
  'use strict';
  var startBtn = document.querySelector('[data-cook-start]');
  var stepEls = document.querySelectorAll('.recipe-steps li');
  if (!startBtn || !stepEls.length) return;

  var title = (document.querySelector('main h1') || {}).textContent || 'Recipe';
  var steps = Array.prototype.map.call(stepEls, function (li) { return li.textContent.trim(); });
  /* Read live, so cooking mode shows the amounts for the servings chosen on the page. */
  function ingText(li) { return li.textContent.replace(/\(grown in the garden\)/, '').replace(/🌿/g, '').trim(); }
  var ingredients = Array.prototype.map.call(document.querySelectorAll('.recipe-ingredients li'), function (li) {
    return { el: li, text: ingText(li), grown: li.classList.contains('ing-have') };
  });

  /* ---- Which ingredients a step uses ----
     An ingredient line reads "quantity name, preparation", e.g. "2 Red sweet peppers, deseeded".
     Its key words are the first and last main words of each name ("peppers"; "garlic" for "Garlic cloves"; "cumin" and
     "coriander" for "Ground cumin and coriander"), matched as whole words in the step, singular or plural. General words in
     a step ("the herbs", "the cheese", "the fruit") also match the ingredients they cover. */
  function stem(w) {
    return w.replace(/ies$/, 'i').replace(/(o|ch|sh|x|ss)es$/, '$1').replace(/([^s])s$/, '$1').replace(/y$/, 'i');
  }
  function words(t) {
    return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').match(/[a-z]+/g) || [];
  }
  function stemSet(list) { var o = {}; list.split(' ').forEach(function (w) { o[stem(w)] = 1; }); return o; }
  /* Quantities, sizes, parts and describing words: never the main word of an ingredient. */
  var NOT_KEY = stemSet('g kg ml l litre litres liter cl tbsp tsp tablespoon teaspoon cup cups pinch handful handfuls bunch bunches ' +
    'large medium small big little few some about a an of from each splash squeeze dash knob drizzle sprig sprigs stalk stalks clove cloves ' +
    'leaves leaf head heads piece pieces slice slices tin tins can jar jars pack packet bag ball fillet fillets block sheet sheets cm inch ' +
    'stick sticks bulb bulbs spear spears root roots powder kernels kernel flowers flower pod extract flakes flake shapes shape breast thigh ' +
    'fresh dried ground whole plain extra virgin red green yellow white black brown golden dark light sweet hot mild ripe young baby ' +
    'flaky sea table fine coarse caster icing granulated soft firm thick thin double single full fat skimmed semi unsalted salted mature ' +
    'crisp crispy crunchy tender tinned frozen cold warm boiling optional other any mixed mix chopped sliced grated juice zest finely roughly vegetable veg free range smoked ' +
    'to taste serve for frying and or the with in plus your favourite good quality made homemade shop bought spring new culinary cooked');
  /* "Olive oil" is oil, not olives; "Cider vinegar" is vinegar, not cider. */
  var ONLY_LAST = stemSet('oil vinegar stock juice sauce butter milk cream flour sugar syrup water wine paste yoghurt');
  /* A general word in a step, and the ingredient words it covers. */
  var GROUPS = {
    herb: 'herb basil mint parsley chive chervil tarragon dill coriander thyme rosemary sage oregano marjoram savory lovage sorrel bay',
    cheese: 'cheese cheddar gruyere parmesan feta mozzarella stilton ricotta halloumi pecorino goat brie camembert mascarpone',
    pasta: 'pasta spaghetti linguine penne rigatoni orecchiette tagliatelle fusilli macaroni lasagne pappardelle farfalle conchiglie',
    bread: 'bread sourdough ciabatta baguette loaf roll bun',
    toast: 'bread sourdough ciabatta baguette loaf',
    fruit: 'fruit currant redcurrant whitecurrant blackcurrant raspberry loganberry tayberry strawberry blackberry gooseberry blueberry jostaberry',
    currant: 'currant redcurrant whitecurrant blackcurrant',
    berry: 'raspberry loganberry tayberry strawberry blackberry gooseberry blueberry jostaberry',
    spice: 'spice cumin coriander paprika cinnamon ginger nutmeg clove turmeric cardamom allspice',
    leaf: 'leaf lettuce purslane cress radicchio rocket endive mizuna chicory salad',
    green: 'cabbage sprout kale chard spinach cavolo greens',
    pepper: 'pepper' };
  var GROUP_OF = {};
  Object.keys(GROUPS).forEach(function (g) { GROUP_OF[stem(g)] = stemSet(GROUPS[g]); });
  function keyWords(line) {
    var parts = line.split(','), name = '', keys = [];
    for (var i = 0; i < parts.length && !keys.length; i++) {
      name = parts[i].replace(/\([^)]*\)/g, ' ');
      name.split(/\s+(?:and|or|&)\s+|\s*\/\s*/i).forEach(function (part) {
        var ws = words(part).map(stem).filter(function (w) { return w.length > 1 && !NOT_KEY[w]; });
        if (!ws.length) return;
        var last = ws[ws.length - 1];
        keys.push(last);
        if (ws.length > 1 && !ONLY_LAST[last]) keys.push(ws[0]);
      });
    }
    if (!keys.length) { var all = words(line).map(stem); if (all.length) keys.push(all[all.length - 1]); } /* "3 Cloves" */
    return keys;
  }
  function stepUses(step, line) {
    var low = line.toLowerCase();
    var leafy = /\bleaf|\bleaves\b/.test(low);
    var black = /\bpepper\b/.test(low) && !/\b(sweet|bell|red|green|yellow|orange|chilli|padron|romano)\b|\bpeppers\b/.test(low);
    var t = step.toLowerCase();
    /* "season with salt and pepper" is seasoning, not the peppers in the recipe */
    if (!black) t = t.replace(/(?:salt|season(?:ing)?)(?:\s+(?:with|and|well with))+\s+(?:black\s+)?pepper\b/g, 'salt');
    /* "leaves" is salad leaves; "leave to cool" is not */
    var sw = words(t).map(function (w) { return w === 'leaves' ? 'leaf' : stem(w); }), have = {};
    sw.forEach(function (w) {
      have[w] = 1;
      var g = GROUP_OF[w];
      if (g && !(w === 'pepper')) for (var k in g) have[k] = 1;
    });
    if (have.season) { have.salt = 1; if (black) have.pepper = 1; }
    if (have.leaf && leafy) return true;
    /* "Put everything in a large pan", "blend all the ingredients" */
    if (/\b(?:put|place|add|tip|blitz|blend|whizz|mix|combine|stir)\s+(?:\w+\s+)?(?:everything|all the ingredients)\b/.test(t)) return true;
    return keyWords(line).some(function (k) { return have[k]; });
  }

  /* Card 0 is the ingredients, then one card per step, each with the ingredients that step mentions. */
  var pages = [{ kind: 'ing' }].concat(steps.map(function (s, i) {
    return { kind: 'step', n: i + 1, text: s, ings: ingredients.filter(function (ing) { return stepUses(s, ing.text); }) };
  }));

  function mk(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function btn(cls, text, label) { var b = mk('button', cls, text); b.type = 'button'; if (label) b.setAttribute('aria-label', label); return b; }

  /* First time mentioned in a step, in seconds: "simmer for 15 minutes", "roast for 45–60 minutes" (uses 45),
     "1 hour", "1 hr 15 min". Nothing over 12 hours (overnight soaks are not timer jobs). */
  function stepSeconds(text) {
    var re = /(\d+(?:\.\d+)?)(?:\s*(?:–|-|to)\s*\d+(?:\.\d+)?)?\s*(hours?|hrs?|minutes?|mins?|seconds?|secs?)\b(?:\s*(?:and\s*)?(\d+)\s*(minutes?|mins?))?/i;
    var m = text.match(re);
    if (!m) return 0;
    var n = parseFloat(m[1]), unit = m[2].toLowerCase();
    var s = /^h/.test(unit) ? n * 3600 : /^m/.test(unit) ? n * 60 : n;
    if (m[3] && /^h/.test(unit)) s += parseInt(m[3], 10) * 60;
    s = Math.round(s);
    return s > 0 && s <= 12 * 3600 ? s : 0;
  }
  function niceLength(s) {
    var h = Math.floor(s / 3600), m = Math.round((s % 3600) / 60);
    if (s < 60) return s + ' sec';
    return (h ? h + ' hr' + (m ? ' ' : '') : '') + (m ? m + ' min' : '');
  }
  function clock(s) {
    s = Math.max(0, Math.round(s));
    var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    var pad = function (x) { return (x < 10 ? '0' : '') + x; };
    return (h ? h + ':' + pad(m) : m) + ':' + pad(sec);
  }

  /* ---- Build the overlay ---- */
  var ov = mk('div', 'cook-mode');
  ov.setAttribute('role', 'dialog');
  ov.setAttribute('aria-modal', 'true');
  ov.setAttribute('aria-label', 'Cooking mode: ' + title);
  ov.hidden = true;

  var top = mk('div', 'cook-top');
  var topText = mk('div', 'cook-top-text');
  var tTitle = mk('p', 'cook-title', title);
  var awake = mk('p', 'cook-awake');
  topText.appendChild(tTitle); topText.appendChild(awake);
  var closeBtn = btn('cook-close', '×', 'Close cooking mode');
  top.appendChild(topText); top.appendChild(closeBtn);

  var progress = mk('div', 'cook-progress'); progress.setAttribute('aria-hidden', 'true');
  var bar = mk('span'); progress.appendChild(bar);

  var card = mk('div', 'cook-card');
  card.setAttribute('aria-live', 'polite');
  var count = mk('p', 'cook-count');
  var body = mk('div', 'cook-body');
  card.appendChild(count); card.appendChild(body);

  /* Timer */
  var timer = mk('div', 'cook-timer');
  var tRow = mk('div', 'cook-timer-row');
  var tLabel = mk('span', 'cook-timer-label', 'Timer');
  var tDisplay = mk('span', 'cook-timer-display', '0:00');
  tDisplay.setAttribute('role', 'timer');
  tRow.appendChild(tLabel); tRow.appendChild(tDisplay);
  var tSuggest = btn('cook-timer-set', '');
  tSuggest.hidden = true;
  var tBtns = mk('div', 'cook-timer-btns');
  var tMinus = btn('cook-tbtn', '−1 min', 'Take 1 minute off the timer');
  var tGo = btn('cook-tbtn cook-tgo', 'Start');
  var tPlus = btn('cook-tbtn', '+1 min', 'Add 1 minute to the timer');
  var tReset = btn('cook-tbtn', 'Reset');
  [tMinus, tGo, tPlus, tReset].forEach(function (b) { tBtns.appendChild(b); });
  var tHint = mk('p', 'cook-timer-hint', 'Start from 0:00 to count up, or add minutes to count down.');
  timer.appendChild(tRow); timer.appendChild(tSuggest); timer.appendChild(tBtns); timer.appendChild(tHint);

  var nav = mk('div', 'cook-nav');
  var backBtn = btn('cook-back', '← Back');
  var nextBtn = btn('cook-next', 'Next →');
  nav.appendChild(backBtn); nav.appendChild(nextBtn);

  var inner = mk('div', 'cook-inner');
  [top, progress, card, timer].forEach(function (n) { inner.appendChild(n); });
  ov.appendChild(inner); ov.appendChild(nav);
  document.body.appendChild(ov);

  /* ---- Pages ---- */
  var at = 0;
  function render() {
    var p = pages[at];
    body.textContent = '';
    if (p.kind === 'ing') {
      count.textContent = 'Before you start';
      body.appendChild(mk('h2', 'cook-h', 'Ingredients'));
      var ul = mk('ul', 'cook-ings');
      ingredients.forEach(function (i) { var li = mk('li', i.grown ? 'ing-have' : '', ingText(i.el)); ul.appendChild(li); });
      body.appendChild(ul);
    } else {
      count.textContent = 'Step ' + p.n + ' of ' + steps.length;
      body.appendChild(mk('p', 'cook-step', p.text));
      if (p.ings.length) {
        var box = mk('div', 'cook-uses');
        box.appendChild(mk('p', 'cook-uses-h', 'For this step'));
        var ul2 = mk('ul', 'cook-uses-list');
        p.ings.forEach(function (i) { ul2.appendChild(mk('li', i.grown ? 'ing-have' : '', ingText(i.el))); });
        box.appendChild(ul2);
        body.appendChild(box);
      }
    }
    var secs = p.kind === 'step' ? stepSeconds(p.text) : 0;
    tSuggest.hidden = !secs;
    if (secs) { tSuggest.textContent = 'Set timer for ' + niceLength(secs); tSuggest.setAttribute('data-secs', secs); }
    bar.style.width = Math.round((at / (pages.length - 1)) * 100) + '%';
    backBtn.disabled = at === 0;
    nextBtn.textContent = at === pages.length - 1 ? 'Finish' : at === 0 ? 'Start cooking →' : 'Next →';
  }
  function go(d) {
    if (at + d < 0) return;
    if (at + d > pages.length - 1) { close(); return; }
    at += d; render();
    card.scrollTop = 0;
  }
  backBtn.addEventListener('click', function () { go(-1); });
  nextBtn.addEventListener('click', function () { go(1); });

  /* Swipe left/right on the step card */
  var sx = null, sy = null;
  card.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  card.addEventListener('touchend', function (e) {
    if (sx == null) return;
    var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    sx = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
  }, { passive: true });

  /* ---- Timer: counts down when it has time on it, otherwise counts up like a stopwatch ---- */
  var mode = 'down', remain = 0, elapsed = 0, running = false, startedAt = 0, base = 0, tick = null, ringing = null, audio = null;
  function now() { return Date.now(); }
  function current() {
    if (!running) return mode === 'down' ? remain : elapsed;
    var gone = (now() - startedAt) / 1000;
    return mode === 'down' ? base - gone : base + gone;
  }
  function paint() {
    var v = current();
    if (running && mode === 'down' && v <= 0) { done(); return; }
    tDisplay.textContent = clock(mode === 'down' ? Math.ceil(v) : Math.floor(v));
    if (timer.classList.contains('is-done')) return;
    tGo.textContent = running ? 'Pause' : (mode === 'down' && remain > 0) || (mode === 'up' && elapsed > 0) ? 'Resume' : 'Start';
    timer.classList.toggle('is-running', running);
    timer.classList.toggle('is-up', mode === 'up' && (running || elapsed > 0));
    tMinus.disabled = mode === 'up' && (running || elapsed > 0);
  }
  function unlockAudio() {
    try {
      if (!audio) { var AC = window.AudioContext || window.webkitAudioContext; if (AC) audio = new AC(); }
      if (audio && audio.state === 'suspended') audio.resume();
    } catch (e) { /* no sound available */ }
  }
  function beep() {
    if (!audio) return;
    try {
      [0, 0.25, 0.5].forEach(function (t) {
        var o = audio.createOscillator(), g = audio.createGain();
        o.frequency.value = 880; o.type = 'sine';
        g.gain.setValueAtTime(0.0001, audio.currentTime + t);
        g.gain.exponentialRampToValueAtTime(0.4, audio.currentTime + t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + t + 0.2);
        o.connect(g); g.connect(audio.destination);
        o.start(audio.currentTime + t); o.stop(audio.currentTime + t + 0.22);
      });
    } catch (e) { /* ignore */ }
  }
  function start() {
    unlockAudio();
    stopRinging();
    if (mode === 'down' && remain <= 0) { mode = 'up'; }
    base = mode === 'down' ? remain : elapsed;
    startedAt = now(); running = true;
    clearInterval(tick); tick = setInterval(paint, 250);
    paint();
  }
  function pause() {
    if (!running) return;
    var v = current(); running = false; clearInterval(tick);
    if (mode === 'down') remain = Math.max(0, v); else elapsed = v;
    paint();
  }
  function reset() {
    running = false; clearInterval(tick); stopRinging();
    mode = 'down'; remain = 0; elapsed = 0; paint();
  }
  function setDown(secs) {
    stopRinging();
    var was = running;
    running = false; clearInterval(tick);
    mode = 'down'; remain = Math.max(0, secs); elapsed = 0;
    if (was && remain > 0) start(); else paint();
  }
  function adjust(d) {
    if (mode === 'up' && (running || elapsed > 0)) return;
    var v = mode === 'down' ? current() : 0;
    var next = Math.max(0, v + d);
    if (running) { base = next; startedAt = now(); paint(); } else { mode = 'down'; remain = next; paint(); }
  }
  function done() {
    running = false; clearInterval(tick); remain = 0; mode = 'down';
    tDisplay.textContent = '0:00';
    timer.classList.remove('is-running');
    timer.classList.add('is-done');
    tGo.textContent = 'Stop alarm';
    tLabel.textContent = 'Time’s up';
    var rings = 0;
    beep(); if (navigator.vibrate) navigator.vibrate([400, 200, 400, 200, 400]);
    ringing = setInterval(function () {
      rings++; beep(); if (navigator.vibrate) navigator.vibrate([400, 200, 400]);
      if (rings >= 14) stopRinging();
    }, 2000);
  }
  function stopRinging() {
    if (ringing) { clearInterval(ringing); ringing = null; }
    if (navigator.vibrate) navigator.vibrate(0);
    timer.classList.remove('is-done');
    tLabel.textContent = 'Timer';
  }
  tGo.addEventListener('click', function () {
    if (timer.classList.contains('is-done')) { stopRinging(); paint(); return; }
    if (running) pause(); else start();
  });
  tReset.addEventListener('click', reset);
  tPlus.addEventListener('click', function () { adjust(60); });
  tMinus.addEventListener('click', function () { adjust(-60); });
  tSuggest.addEventListener('click', function () { unlockAudio(); setDown(parseInt(tSuggest.getAttribute('data-secs'), 10)); });

  /* ---- Keep the screen on ---- */
  var lock = null, open = false;
  function wake() {
    if (!('wakeLock' in navigator)) { awake.textContent = 'Your browser can’t keep the screen on. Turn off auto-lock in your phone’s settings while you cook.'; return; }
    navigator.wakeLock.request('screen').then(function (l) {
      lock = l; awake.textContent = 'Screen will stay on';
      l.addEventListener('release', function () { if (lock === l) lock = null; });
    }).catch(function () { awake.textContent = 'Screen may turn off. Check battery saver is off.'; });
  }
  document.addEventListener('visibilitychange', function () {
    if (open && document.visibilityState === 'visible') { if (!lock) wake(); paint(); }
  });

  /* ---- Open and close ---- */
  var lastFocus = null, pushed = false;
  function openMode() {
    if (open) return;
    open = true; lastFocus = document.activeElement;
    at = 0; render(); paint();
    ov.hidden = false;
    document.documentElement.classList.add('cook-open');
    wake();
    try { history.pushState({ cook: 1 }, ''); pushed = true; } catch (e) { pushed = false; }
    nextBtn.focus();
  }
  function close(fromHistory) {
    if (!open) return;
    open = false;
    ov.hidden = true;
    document.documentElement.classList.remove('cook-open');
    if (lock) { lock.release().catch(function () {}); lock = null; }
    stopRinging();
    if (pushed && !fromHistory) { pushed = false; history.back(); }
    pushed = false;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  /* The phone's back button closes cooking mode instead of leaving the recipe */
  window.addEventListener('popstate', function () { if (open) close(true); });
  closeBtn.addEventListener('click', function () { close(); });
  document.addEventListener('keydown', function (e) {
    if (!open) return;
    if (e.key === 'Escape') { close(); }
    else if (e.target && /^(BUTTON|INPUT)$/.test(e.target.tagName) && (e.key === ' ' || e.key === 'Enter')) { /* let buttons work */ }
    else if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
  });
  /* Keep keyboard focus inside the overlay */
  ov.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var f = Array.prototype.filter.call(ov.querySelectorAll('button'), function (b) { return !b.disabled && !b.hidden && b.offsetParent !== null; });
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  });

  startBtn.parentNode.hidden = false;
  startBtn.addEventListener('click', openMode);
})();
