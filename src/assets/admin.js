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
