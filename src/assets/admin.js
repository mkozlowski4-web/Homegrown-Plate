/* Owner dashboard. Loaded only on /admin/. Data comes from /api/admin/stats, which only the site owner can open. */
(function () {
  'use strict';
  var root = document.getElementById('dash');
  if (!root) return;
  var NS = 'http://www.w3.org/2000/svg';
  var $ = function (s, p) { return (p || document).querySelector(s); };
  var el = function (tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  var sv = function (tag, attrs) { var n = document.createElementNS(NS, tag); Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); }); return n; };
  var fmt = function (n) { return Number(n || 0).toLocaleString('en-GB'); };
  var days = 30;

  var EVENT_NAMES = { add_crop: 'Added a crop to My Garden', tick_job: 'Ticked off a job', kids_on: 'Turned on Kids mode', region_set: 'Set their area', search: 'Used a search box', install: 'Tapped Install app', signup: 'Created an account' };
  var FILTER_NAMES = { 'known-bot': 'Known bots and crawlers (search engines, AI agents, SEO tools)', 'automated-browser': 'Automated browsers', datacenter: 'Cloud and hosting servers', 'no-user-agent': 'Missing browser details', 'no-language': 'Scripts with no language setting', 'too-fast': 'Far too many pages in an hour', owner: 'Your own visits (never counted)' };
  var regionName = null; try { regionName = new Intl.DisplayNames(['en-GB'], { type: 'region' }); } catch (e) { regionName = null; }
  var country = function (c) { try { return regionName ? regionName.of(c) || c : c; } catch (e) { return c; } };
  var title = function (s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; };

  var msg = function (text, link) {
    root.textContent = '';
    var box = el('div', 'callout'); box.appendChild(el('p', '', text));
    if (link) { var a = el('a', 'btn-small', link[0]); a.href = link[1]; var p = el('p'); p.appendChild(a); box.appendChild(p); }
    root.appendChild(box);
  };

  /* ---- pieces ---- */
  var tile = function (label, value, sub) {
    var d = el('div', 'dash-tile'); d.appendChild(el('div', 'dash-tile-label', label)); d.appendChild(el('div', 'dash-tile-value', value)); if (sub) d.appendChild(el('div', 'dash-tile-sub', sub)); return d;
  };
  var card = function (heading, note) { var c = el('section', 'card dash-card'); c.appendChild(el('h2', '', heading)); if (note) c.appendChild(el('p', 'muted small-note', note)); return c; };

  /* Horizontal bars: one hue, value labels at the end, quiet track. */
  var bars = function (rows, nameOf, valueKey, empty) {
    var list = el('ul', 'dash-bars');
    if (!rows.length) { list.appendChild(el('li', 'muted', empty || 'Nothing yet.')); return list; }
    var max = Math.max.apply(null, rows.map(function (r) { return r[valueKey]; })) || 1;
    rows.forEach(function (r) {
      var li = el('li'); var top = el('div', 'dash-bar-top');
      top.appendChild(el('span', 'dash-bar-name', nameOf(r))); top.appendChild(el('span', 'dash-bar-val', fmt(r[valueKey])));
      var track = el('div', 'dash-bar-track'), fill = el('div', 'dash-bar-fill'); fill.style.width = Math.max(2, Math.round(r[valueKey] / max * 100)) + '%';
      track.appendChild(fill); li.appendChild(top); li.appendChild(track); list.appendChild(li);
    });
    return list;
  };

  /* Line chart of views and unique visitors per day, with hover readout and a table view for screen readers. */
  var lineChart = function (series) {
    var W = Math.min(760, Math.max(280, Math.round(root.clientWidth - 44))), H = W < 480 ? 250 : 280, L = 40, R = 12, T = 14, B = 30, iw = W - L - R, ih = H - T - B;
    var max = Math.max(4, Math.max.apply(null, series.map(function (d) { return Math.max(d.views, d.visitors); })));
    var step = Math.pow(10, Math.floor(Math.log10(max))); var nice = [1, 2, 2.5, 5, 10].map(function (m) { return m * step; }).filter(function (v) { return v >= max / 4; })[0] || step * 10;
    var top = Math.ceil(max / nice) * nice; var ticks = []; for (var v = 0; v <= top; v += nice) ticks.push(v);
    var x = function (i) { return L + (series.length === 1 ? iw / 2 : i * iw / (series.length - 1)); };
    var y = function (v) { return T + ih - v / top * ih; };
    var svg = sv('svg', { viewBox: '0 0 ' + W + ' ' + H, 'class': 'dash-chart', role: 'img', 'aria-label': 'Daily page views and unique visitors' });
    ticks.forEach(function (t) {
      svg.appendChild(sv('line', { x1: L, x2: W - R, y1: y(t), y2: y(t), 'class': 'dash-grid' }));
      var tx = sv('text', { x: L - 8, y: y(t) + 4, 'text-anchor': 'end', 'class': 'dash-axis' }); tx.textContent = fmt(t); svg.appendChild(tx);
    });
    var every = Math.max(1, Math.ceil(series.length / Math.max(2, Math.floor(iw / 75))));
    series.forEach(function (d, i) {
      var last = series.length - 1;
      if (i !== last && (i % every !== 0 || last - i < every * 0.7)) return;
      var dt = new Date(d.day + 'T12:00:00'); var tx = sv('text', { x: x(i), y: H - 8, 'text-anchor': i === 0 ? 'start' : i === series.length - 1 ? 'end' : 'middle', 'class': 'dash-axis' });
      tx.textContent = dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }); svg.appendChild(tx);
    });
    var path = function (key) { return series.map(function (d, i) { return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(d[key]).toFixed(1); }).join(' '); };
    svg.appendChild(sv('path', { d: path('views'), 'class': 'dash-line dash-line-1' }));
    svg.appendChild(sv('path', { d: path('visitors'), 'class': 'dash-line dash-line-2' }));
    if (series.length <= 40) series.forEach(function (d, i) {
      svg.appendChild(sv('circle', { cx: x(i), cy: y(d.views), r: 3, 'class': 'dash-dot dash-dot-1' }));
      svg.appendChild(sv('circle', { cx: x(i), cy: y(d.visitors), r: 3, 'class': 'dash-dot dash-dot-2' }));
    });
    var cross = sv('line', { y1: T, y2: T + ih, 'class': 'dash-cross', visibility: 'hidden' }); svg.appendChild(cross);
    var wrap = el('div', 'dash-chart-wrap'); wrap.appendChild(svg);
    var tip = el('div', 'dash-tip'); tip.hidden = true; wrap.appendChild(tip);
    var move = function (clientX) {
      var r = svg.getBoundingClientRect(); var px = (clientX - r.left) / r.width * W;
      var i = Math.max(0, Math.min(series.length - 1, Math.round((px - L) / iw * (series.length - 1)))); var d = series[i];
      cross.setAttribute('x1', x(i)); cross.setAttribute('x2', x(i)); cross.setAttribute('visibility', 'visible');
      tip.textContent = ''; var dd = new Date(d.day + 'T12:00:00');
      tip.appendChild(el('strong', '', dd.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })));
      [['Page views', d.views, 1], ['Unique visitors', d.visitors, 2], ['Interactions', d.events, 0]].forEach(function (row) {
        var line = el('div', 'dash-tip-row'); var sw = el('span', 'dash-swatch' + (row[2] ? ' s' + row[2] : ' s0')); line.appendChild(sw); line.appendChild(el('span', '', row[0] + ': ' + fmt(row[1]))); tip.appendChild(line);
      });
      tip.hidden = false; var tw = tip.offsetWidth, left = x(i) / W * r.width + 12; if (left + tw > r.width) left = x(i) / W * r.width - tw - 12; tip.style.left = Math.max(0, left) + 'px';
    };
    svg.addEventListener('mousemove', function (e) { move(e.clientX); });
    svg.addEventListener('touchstart', function (e) { if (e.touches[0]) move(e.touches[0].clientX); }, { passive: true });
    svg.addEventListener('touchmove', function (e) { if (e.touches[0]) move(e.touches[0].clientX); }, { passive: true });
    svg.addEventListener('mouseleave', function () { tip.hidden = true; cross.setAttribute('visibility', 'hidden'); });
    return wrap;
  };

  var dataTable = function (series) {
    var det = el('details', 'dash-table'); det.appendChild(el('summary', '', 'Show as a table'));
    var t = el('table'); var h = el('tr'); ['Day', 'Page views', 'Unique visitors', 'Interactions'].forEach(function (c) { h.appendChild(el('th', '', c)); });
    var thead = el('thead'); thead.appendChild(h); t.appendChild(thead); var tb = el('tbody');
    series.slice().reverse().forEach(function (d) { var r = el('tr'); [d.day, fmt(d.views), fmt(d.visitors), fmt(d.events)].forEach(function (c, i) { r.appendChild(el(i ? 'td' : 'th', '', c)); }); tb.appendChild(r); });
    t.appendChild(tb); det.appendChild(t); return det;
  };

  /* ---- page ---- */
  /* ---- Google search (from Search Console) ---- */
  var posChart = function (series) {
    var W = Math.min(760, Math.max(280, Math.round(root.clientWidth - 44))), H = W < 480 ? 230 : 250, L = 40, R = 12, T = 14, B = 30, iw = W - L - R, ih = H - T - B;
    var vals = series.map(function (d) { return d.position; }).filter(function (v) { return v > 0; });
    var lo = Math.max(1, Math.floor(Math.min.apply(null, vals)) - 1), hi = Math.max(lo + 4, Math.ceil(Math.max.apply(null, vals)) + 1);
    var x = function (i) { return L + (series.length === 1 ? iw / 2 : i * iw / (series.length - 1)); };
    var y = function (v) { return T + (v - lo) / (hi - lo) * ih; };   /* position 1 is at the TOP: lower is better */
    var svg = sv('svg', { viewBox: '0 0 ' + W + ' ' + H, 'class': 'dash-chart', role: 'img', 'aria-label': 'Average Google position per day. Higher on the chart is better.' });
    var stepV = Math.max(1, Math.ceil((hi - lo) / 4));
    for (var v = lo; v <= hi; v += stepV) {
      svg.appendChild(sv('line', { x1: L, x2: W - R, y1: y(v), y2: y(v), 'class': 'dash-grid' }));
      var tx = sv('text', { x: L - 8, y: y(v) + 4, 'text-anchor': 'end', 'class': 'dash-axis' }); tx.textContent = String(v); svg.appendChild(tx);
    }
    var every = Math.max(1, Math.ceil(series.length / Math.max(2, Math.floor(iw / 75))));
    series.forEach(function (d, i) {
      var last = series.length - 1; if (i !== last && (i % every !== 0 || last - i < every * 0.7)) return;
      var lab = sv('text', { x: x(i), y: H - 8, 'text-anchor': i === 0 ? 'start' : i === last ? 'end' : 'middle', 'class': 'dash-axis' });
      lab.textContent = new Date(d.date + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }); svg.appendChild(lab);
    });
    svg.appendChild(sv('path', { d: series.map(function (d, i) { return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(d.position).toFixed(1); }).join(' '), 'class': 'dash-line dash-line-1' }));
    series.forEach(function (d, i) {
      var c = sv('circle', { cx: x(i), cy: y(d.position), r: series.length > 40 ? 2 : 3, 'class': 'dash-dot dash-dot-1' });
      var t = sv('title'); t.textContent = new Date(d.date + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) + ': position ' + d.position + ', ' + fmt(d.impressions) + ' impressions, ' + fmt(d.clicks) + ' clicks';
      c.appendChild(t); svg.appendChild(c);
    });
    var wrap = el('div', 'dash-chart-wrap'); wrap.appendChild(svg); return wrap;
  };

  var table = function (rows, firstLabel) {
    var t = el('table', 'dash-rank'); var h = el('tr');
    [firstLabel, 'Position', 'Clicks', 'Impressions'].forEach(function (c, i) { h.appendChild(el('th', i ? 'num' : '', c)); });
    var th = el('thead'); th.appendChild(h); t.appendChild(th); var tb = el('tbody');
    rows.forEach(function (r) { var tr = el('tr'); [r.name, String(r.position), fmt(r.clicks), fmt(r.impressions)].forEach(function (c, i) { tr.appendChild(el(i ? 'td' : 'th', i ? 'num' : '', c)); }); tb.appendChild(tr); });
    t.appendChild(tb); var w = el('div', 'dash-rank-wrap'); w.appendChild(t); return w;
  };

  var setupHelp = function (c, reason, email) {
    var box = el('div', 'callout');
    var texts = {
      'not-configured': 'Not connected yet. Google only shares ranking data through its Search Console service, so this needs a one-time setup.',
      'bad-key': 'The saved Google key could not be used. Please check that the whole key file was pasted into the secret called GOOGLE_SERVICE_ACCOUNT.',
      'no-access': 'Google is refusing access. Add ' + (email || 'the service account email') + ' as a user on your Search Console property (Settings, then Users and permissions, then Add user, with Restricted permission).',
      error: 'Google did not answer just now. Try again in a few minutes. Data from Search Console can also take a few days to start appearing for a new site.'
    };
    box.appendChild(el('p', '', texts[reason] || texts.error));
    if (reason === 'not-configured') {
      var ol = el('ol');
      ['In Google Cloud (console.cloud.google.com), create a project and turn on the Google Search Console API.',
       'Create a service account and download its key as a JSON file.',
       'In Search Console, add the service account email as a Restricted user of your homegrownplate.co.uk property.',
       'In Cloudflare, open the homegrown-plate Worker, then Settings, Variables and Secrets, and add a secret named GOOGLE_SERVICE_ACCOUNT containing the whole JSON file.'].forEach(function (t) { ol.appendChild(el('li', '', t)); });
      box.appendChild(ol);
    }
    c.appendChild(box);
  };

  var loadSearch = function (box, d) {
    var c = card('Google search', 'Where your site appears in Google results, from Search Console. It runs about two days behind.'); box.appendChild(c);
    c.appendChild(el('p', 'muted', 'Loading...'));
    fetch('/api/admin/search?days=' + Math.min(d, 90), { credentials: 'same-origin' }).then(function (r) { return r.ok ? r.json() : { connected: false, reason: 'error' }; }).catch(function () { return { connected: false, reason: 'error' }; }).then(function (g) {
      c.removeChild(c.lastChild);
      if (!g.connected) { setupHelp(c, g.reason, g.email); return; }
      var tiles = el('div', 'dash-tiles');
      tiles.appendChild(tile('Average position', g.totals.impressions ? String(g.totals.position) : 'n/a', 'Lower is better. 1 is the top of page one.'));
      tiles.appendChild(tile('Clicks from Google', fmt(g.totals.clicks), g.start + ' to ' + g.end));
      tiles.appendChild(tile('Impressions', fmt(g.totals.impressions), 'Times you appeared in results'));
      tiles.appendChild(tile('Click rate', g.totals.ctr + '%', 'Clicks as a share of impressions'));
      c.appendChild(tiles);
      if (!g.series.length) { c.appendChild(el('p', 'muted', 'No search data yet. New sites usually take a few weeks to start appearing in Google.')); return; }
      c.appendChild(el('h3', '', 'Average position per day'));
      c.appendChild(posChart(g.series));
      c.appendChild(el('p', 'muted small-note', 'Higher on the chart is better. The average is across every search where you appeared, so it can move when you start appearing for new searches, even if nothing got worse.'));
      var grid = el('div', 'dash-grid2');
      var a = el('div'); a.appendChild(el('h3', '', 'Top searches')); a.appendChild(g.queries.length ? table(g.queries, 'Search') : el('p', 'muted', 'None yet.')); grid.appendChild(a);
      var b = el('div'); b.appendChild(el('h3', '', 'Top pages in Google')); b.appendChild(g.pages.length ? table(g.pages, 'Page') : el('p', 'muted', 'None yet.')); grid.appendChild(b);
      c.appendChild(grid);
    });
  };

  var lastStats = null, lastW = 0;
  var render = function (s) {
    lastStats = s; lastW = root.clientWidth;
    root.textContent = '';
    var avgVisitors = Math.round(s.totals.visitorDays / s.days * 10) / 10;
    var perVisit = s.totals.visitorDays ? Math.round(s.totals.views / s.totals.visitorDays * 10) / 10 : 0;

    var tiles = el('div', 'dash-tiles');
    tiles.appendChild(tile('Page views', fmt(s.totals.views), 'Today: ' + fmt(s.totals.today.views)));
    tiles.appendChild(tile('Unique visitors today', fmt(s.totals.today.visitors), 'Average per day: ' + avgVisitors));
    tiles.appendChild(tile('Interactions', fmt(s.totals.events), 'Adds, ticks, searches and similar'));
    tiles.appendChild(tile('Views per visitor', String(perVisit), 'Pages seen in one day'));
    tiles.appendChild(tile('Bot visits filtered', fmt(s.totals.filtered), 'Not in any figure here'));
    tiles.appendChild(tile('Accounts', fmt(s.accounts.total), '+' + fmt(s.accounts.added) + ' in this period'));
    root.appendChild(tiles);

    var c = card('Visits per day');
    var leg = el('div', 'dash-legend');
    [['s1', 'Page views'], ['s2', 'Unique visitors']].forEach(function (l) { var i = el('span', 'dash-legend-item'); i.appendChild(el('span', 'dash-swatch ' + l[0])); i.appendChild(el('span', '', l[1])); leg.appendChild(i); });
    c.appendChild(leg); c.appendChild(lineChart(s.series)); c.appendChild(dataTable(s.series));
    c.appendChild(el('p', 'muted small-note', 'A unique visitor is one browser on one day. Visitors cannot be linked from day to day, because the site sets no cookies and the code that tells visitors apart changes every day. So the same person coming back on another day counts again.'));
    root.appendChild(c);

    var grid = el('div', 'dash-grid2');
    var a = card('Most viewed pages'); a.appendChild(bars(s.pages, function (r) { return r.path; }, 'views', 'No page views yet.')); grid.appendChild(a);
    var b = card('What people did', 'Interactions on the site, by type'); b.appendChild(bars(s.events, function (r) { return (EVENT_NAMES[r.name] || r.name) + ' (' + fmt(r.people) + ' ' + (r.people === 1 ? 'person' : 'people') + ')'; }, 'n', 'No interactions yet.')); grid.appendChild(b);
    var r1 = card('Where visitors came from', 'Other websites that sent people here. Direct visits and search apps that hide the source are not listed.'); r1.appendChild(bars(s.refs, function (r) { return r.name; }, 'n', 'No referring sites yet.')); grid.appendChild(r1);
    var r2 = card('Countries'); r2.appendChild(bars(s.countries, function (r) { return country(r.name); }, 'n', 'No data yet.')); grid.appendChild(r2);
    var r3 = card('Devices'); r3.appendChild(bars(s.devices, function (r) { return title(r.name); }, 'n', 'No data yet.')); grid.appendChild(r3);
    var r4 = card('Traffic filtered out', 'Requests that looked automated, so they are left out of every figure above. Counted here only so you can see how much there is.');
    r4.appendChild(bars(s.filtered, function (r) { return FILTER_NAMES[r.name] || r.name; }, 'n', 'Nothing filtered yet.')); grid.appendChild(r4);
    root.appendChild(grid);
    var gscBox = el('div', 'dash-gsc'); root.appendChild(gscBox); loadSearch(gscBox, s.days);
    root.appendChild(el('p', 'muted small-note', 'Dates use UK time. Visitors who have Do Not Track or Global Privacy Control switched on are not counted, and no filter is perfect: a bot that behaves exactly like a person can still get through.'));
  };

  var load = function () {
    msg('Loading...');
    fetch('/api/admin/stats?days=' + days, { credentials: 'same-origin' }).then(function (r) {
      if (r.status === 401) { msg('Please sign in as the site owner to see the dashboard.', ['Sign in', '/account/']); return null; }
      if (r.status === 404) { msg('This page is only for the site owner. You are signed in with an account that does not have access.', ['Back to the site', '/']); return null; }
      if (!r.ok) { msg('Could not load the figures. Please try again in a moment.'); return null; }
      return r.json();
    }).then(function (s) { if (s) render(s); }).catch(function () { msg('Could not load the figures. Please check your connection.'); });
  };

  var rt = null; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { if (lastStats && Math.abs(root.clientWidth - lastW) > 30) render(lastStats); }, 200); });

  Array.prototype.forEach.call(document.querySelectorAll('[data-days]'), function (b) {
    b.addEventListener('click', function () {
      days = Number(b.getAttribute('data-days'));
      Array.prototype.forEach.call(document.querySelectorAll('[data-days]'), function (o) { o.setAttribute('aria-pressed', String(o === b)); });
      load();
    });
  });
  load();
})();

/* Access codes (owner only): make codes, see how many times each has been used, turn them off. */
(function () {
  'use strict';
  var box = document.getElementById('codes');
  if (!box) return;
  var list = document.getElementById('codeList'), form = document.getElementById('codeNew');
  var el = function (tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  var day = function (ms) { return new Date(ms).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); };
  var api = function (method, path, body) {
    var o = { method: method, credentials: 'same-origin', headers: {} };
    if (body) { o.headers['Content-Type'] = 'application/json'; o.body = JSON.stringify(body); }
    return fetch(path, o).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, status: r.status, body: j }; }); });
  };
  var linkFor = function (code) { return location.origin + '/account/?code=' + encodeURIComponent(code); };
  var copy = function (text, btn) {
    var done = function () { var t = btn.textContent; btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = t; }, 1500); };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () { window.prompt('Copy this:', text); });
    else window.prompt('Copy this:', text);
  };
  var render = function (codes) {
    list.textContent = '';
    if (!codes.length) { list.appendChild(el('p', 'muted', 'No codes yet.')); return; }
    var wrap = el('div', 'table-wrap'), t = el('table', 'codes-table');
    var head = el('tr'); ['Code', 'Gives', 'Used', 'Use by', 'Note', ''].forEach(function (h) { head.appendChild(el('th', null, h)); });
    var th = el('thead'); th.appendChild(head); t.appendChild(th);
    var tb = el('tbody');
    codes.forEach(function (c) {
      var expired = c.redeemBy && c.redeemBy < Date.now(), full = c.maxUses != null && c.uses >= c.maxUses;
      var tr = el('tr', !c.active || expired || full ? 'is-off' : '');
      var cc = el('td'); cc.appendChild(el('code', null, c.code));
      if (!c.active) cc.appendChild(el('span', 'code-state', 'Turned off')); else if (expired) cc.appendChild(el('span', 'code-state', 'Expired')); else if (full) cc.appendChild(el('span', 'code-state', 'Used up'));
      tr.appendChild(cc);
      tr.appendChild(el('td', null, c.days + (c.days === 1 ? ' day' : ' days')));
      tr.appendChild(el('td', null, c.uses + (c.maxUses != null ? ' of ' + c.maxUses : '')));
      tr.appendChild(el('td', null, c.redeemBy ? day(c.redeemBy) : 'Any time'));
      tr.appendChild(el('td', null, c.note || ''));
      var act = el('td', 'code-actions');
      var cl = el('button', 'chip', 'Copy link'); cl.type = 'button'; cl.addEventListener('click', function () { copy(linkFor(c.code), cl); }); act.appendChild(cl);
      var tg = el('button', 'chip', c.active ? 'Turn off' : 'Turn on'); tg.type = 'button';
      tg.addEventListener('click', function () { tg.disabled = true; api('POST', '/api/admin/codes/active', { code: c.code, active: !c.active }).then(load); });
      act.appendChild(tg);
      tr.appendChild(act); tb.appendChild(tr);
    });
    t.appendChild(tb); wrap.appendChild(t); list.appendChild(wrap);
    list.appendChild(el('p', 'muted small-note', 'Turning a code off stops new people using it. Anyone who already used it keeps the time they were given.'));
  };
  var load = function () {
    api('GET', '/api/admin/codes').then(function (r) { if (!r.ok) return; box.hidden = false; render(r.body.codes || []); }).catch(function () {});
  };
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var err = form.querySelector('[data-error]'); err.textContent = ''; err.classList.remove('is-ok');
    var btn = form.querySelector('button[type=submit]'); btn.disabled = true;
    api('POST', '/api/admin/codes', { days: Number(document.getElementById('cnDays').value), maxUses: document.getElementById('cnUses').value, redeemBy: document.getElementById('cnBy').value, code: document.getElementById('cnCode').value, note: document.getElementById('cnNote').value })
      .then(function (r) {
        btn.disabled = false;
        if (!r.ok) { err.textContent = (r.body && r.body.error) || 'Could not make that code.'; return; }
        ['cnUses', 'cnBy', 'cnCode', 'cnNote'].forEach(function (id) { document.getElementById(id).value = ''; });
        err.textContent = 'Made ' + r.body.code + '. Use Copy link below to send it.'; err.classList.add('is-ok');
        load();
      }).catch(function () { btn.disabled = false; err.textContent = 'Could not reach the site. Please try again.'; });
  });
  load();
})();
