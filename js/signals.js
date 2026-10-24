/* TYFNOW signals.js: section 4 on Home (F183, live stream F184). Half the nodes show at a time. Every few
   seconds a new signal lands on the left, replacing the oldest, travels through the TYFNOW core, and comes out on
   the right as clean, colour-coded work, pushing the oldest row out. Roadmap questions come out as
   "Being researched and defined", then flip to "Added to roadmap". Each visit starts from a fresh shuffle.
   Runs only while on screen and the tab is visible. Reduced motion: a still set, no cycling. Without JS the static
   four in the HTML show. Examples are illustrative signal types, not client data. 24 Oct 2026. */
(function () {
  'use strict';
  var sig = document.getElementById('sig');
  if (!sig) return;
  var inBox = sig.querySelector('.sig-in'), outBox = sig.querySelector('.sig-out'), core = sig.querySelector('.sig-core');
  var NS = 'http://www.w3.org/2000/svg';
  var FLOW = { web: 'Website', content: 'Content', search: 'Search and AI answers', reach: 'Outreach', road: 'Roadmap' };
  var STROKE = { web: '#7661f6', content: '#2f9e8f', search: '#ff816d', reach: '#8fb31c', road: '#454644' };
  /* [source, signal, flow, work] ; roadmap items carry the topic as the work */
  var POOL = [
    ['LinkedIn', 'A past client has moved office', 'reach', 'Send a note, reconnect'],
    ['Competitor watch', 'A competitor has rebranded', 'web', 'Sharpen your comparison page'],
    ['AI search', '5th order from AI search this month', 'content', 'Turn it into a case study'],
    ['Merchant Centre', 'Product feed errors flagged', 'search', 'Fix the feed, relist the products'],
    ['Search Console', 'Key page dropped from the index', 'search', 'Fix it and resubmit'],
    ['Inbox', 'Same question asked three times', 'web', 'Add it to the FAQ'],
    ['SEO', 'A new search term is climbing', 'content', 'Write the page that owns it'],
    ['AIEO', 'ChatGPT recommends a competitor', 'search', 'Publish answers AI can quote'],
    ['Google reviews', 'New five-star review', 'content', 'Thank them, share it, add it to the site'],
    ['Analytics', 'Pricing page visits are up', 'web', 'Test a clearer pricing layout'],
    ['Events', 'Trade show announced in your sector', 'reach', 'Plan the stand and the follow-up'],
    ['LinkedIn', 'One post beat all the others', 'content', 'Turn it into a short series'],
    ['Voice note', 'Idea recorded on the drive home', 'content', "Draft it as this week's post"],
    ['CRM', 'Quote sent, no reply in a week', 'reach', 'Send a useful follow-up'],
    ['Business Profile', 'Opening hours out of date', 'search', 'Update every listing'],
    ['Sales call', 'A client mentioned a new problem', 'web', 'Add a service page for it'],
    ['Newsletter', 'Open rate dipped', 'reach', 'Test a new subject line'],
    ['Website', 'Contact form drop-offs', 'web', 'Shorten the form'],
    ['Roadmap', "Who's building next quarter's campaign?", 'road', "Next quarter's campaign"],
    ['Roadmap', 'Are newsletters still worth it?', 'road', 'Newsletter: keep, change or stop'],
    ['Roadmap', 'Should we be on TikTok?', 'road', 'TikTok: yes or no'],
    ['Roadmap', 'Is the website pulling its weight?', 'road', 'Website review'],
    ['Roadmap', 'Do we need a podcast?', 'road', 'Podcast: worth the time?']
  ];
  var RESEARCH = 'Being researched and defined', ADDED = 'Added to roadmap';
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var STEP = 2600;

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function narrow() { return window.innerWidth <= 900; }
  var SHOW = narrow() ? 3 : 4;

  /* the queue never serves the same flow twice in a row, and a roadmap question comes up often */
  var queue = [], lastFlow = null, sinceRoad = 0;
  function next() {
    if (queue.length < 6) queue = queue.concat(shuffle(POOL.slice()));
    var idx = -1;
    if (sinceRoad >= 3) idx = queue.findIndex(function (p) { return p[2] === 'road'; });
    if (idx < 0) idx = queue.findIndex(function (p) { return p[2] !== lastFlow && !onScreen(p); });
    if (idx < 0) idx = 0;
    var p = queue.splice(idx, 1)[0];
    lastFlow = p[2]; sinceRoad = p[2] === 'road' ? 0 : sinceRoad + 1;
    return p;
  }
  function onScreen(p) { return chips.some(function (c) { return c.p === p; }) || rows.some(function (r) { return r.p === p; }); }

  var chips = [], rows = [];
  function makeChip(p, band) {
    var li = document.createElement('li'); li.className = 'sig-chip';
    var src = document.createElement('span'); src.className = 'sig-src'; src.textContent = p[0];
    li.appendChild(src); li.appendChild(document.createTextNode(p[1]));
    inBox.appendChild(li);
    return { el: li, p: p, band: band, tilt: rnd(-4.5, 4.5) };
  }
  function makeRow(p) {
    var li = document.createElement('li'); li.className = 'sig-row f-' + p[2];
    var tag = document.createElement('span'); tag.className = 'sig-tag'; tag.textContent = FLOW[p[2]];
    var txt = document.createElement('span'); txt.className = 'sig-txt'; txt.textContent = p[3];
    li.appendChild(tag); li.appendChild(txt);
    var row = { el: li, p: p, status: null };
    if (p[2] === 'road') {
      var st = document.createElement('span'); st.className = 'sig-status'; st.textContent = RESEARCH;
      li.appendChild(st); row.status = st;
    }
    return row;
  }
  function settle(row, delay) {
    if (!row.status) return;
    setTimeout(function () { row.status.textContent = ADDED; row.status.classList.add('done'); }, delay);
  }

  /* first frame: SHOW signals on the left and their work on the right */
  inBox.textContent = ''; outBox.textContent = '';
  var bands = shuffle(Array.apply(null, Array(SHOW)).map(function (_, i) { return i; }));
  for (var i = 0; i < SHOW; i++) {
    var p0 = next();
    chips.push(makeChip(p0, bands[i]));
    var r0 = makeRow(p0); outBox.appendChild(r0.el); rows.push(r0);
    if (r0.status && still) { r0.status.textContent = ADDED; r0.status.classList.add('done'); }
  }
  sig.classList.add('sig-live');

  var svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'sig-lines'); svg.setAttribute('aria-hidden', 'true');
  sig.insertBefore(svg, sig.firstChild);

  function place(c) {
    if (narrow()) { c.el.style.left = ''; c.el.style.top = ''; c.el.style.transform = ''; return; }
    var W = inBox.clientWidth, H = inBox.clientHeight, band = H / SHOW;
    var ow = c.el.offsetWidth, oh = c.el.offsetHeight, rad = Math.abs(c.tilt) * Math.PI / 180;
    var h = ow * Math.sin(rad) + oh * Math.cos(rad), w = ow * Math.cos(rad) + oh * Math.sin(rad);
    var y = c.band * band + 3 + rnd(0, Math.max(0, band - h - 6)) + (h - oh) / 2;
    var x = rnd(0, Math.max(0, W - w)) + (w - ow) / 2;
    c.el.style.left = x.toFixed(0) + 'px'; c.el.style.top = y.toFixed(0) + 'px';
    c.el.style.transform = 'rotate(' + c.tilt.toFixed(1) + 'deg)';
  }

  function pt(el, side) {
    var s = sig.getBoundingClientRect(), r = el.getBoundingClientRect();
    return { x: (side === 'r' ? r.right : r.left) - s.left, y: (r.top + r.bottom) / 2 - s.top };
  }
  function curve(a, b) {
    var mx = (a.x + b.x) / 2;
    return 'M' + a.x.toFixed(1) + ' ' + a.y.toFixed(1) + ' C' + mx.toFixed(1) + ' ' + a.y.toFixed(1) + ' ' + mx.toFixed(1) + ' ' + b.y.toFixed(1) + ' ' + b.x.toFixed(1) + ' ' + b.y.toFixed(1);
  }
  function addPath(d, cls) { var e = document.createElementNS(NS, 'path'); e.setAttribute('d', d); e.setAttribute('class', cls); svg.appendChild(e); return e; }

  var lineFor = new Map();
  function draw() {
    var s = sig.getBoundingClientRect();
    svg.setAttribute('viewBox', '0 0 ' + s.width.toFixed(0) + ' ' + s.height.toFixed(0));
    svg.setAttribute('width', s.width.toFixed(0)); svg.setAttribute('height', s.height.toFixed(0));
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    lineFor = new Map();
    if (narrow()) return;
    var cl = pt(core, 'l'), cr = pt(core, 'r');
    chips.forEach(function (c) { lineFor.set(c.el, addPath(curve(pt(c.el, 'r'), cl), 'sig-ln sig-ln-in')); });
    rows.forEach(function (r) { lineFor.set(r.el, addPath(curve(cr, pt(r.el, 'l')), 'sig-ln f-' + r.p[2])); });
    for (var i = 0; i < rows.length - 1; i++) {
      if (rows[i].p[2] !== rows[i + 1].p[2]) continue;
      var a = pt(rows[i].el, 'r'), b = pt(rows[i + 1].el, 'r'), k = 26;
      addPath('M' + a.x + ' ' + a.y + ' C' + (a.x + k) + ' ' + a.y + ' ' + (b.x + k) + ' ' + b.y + ' ' + b.x + ' ' + b.y, 'sig-ln sig-flow f-' + rows[i].p[2]);
    }
  }

  /* a dot that runs along a line */
  function travel(pathEl, colour, ms, done) {
    if (!pathEl || still) { if (done) done(); return; }
    var len = pathEl.getTotalLength(), dot = document.createElementNS(NS, 'circle');
    dot.setAttribute('r', '4.5'); dot.setAttribute('fill', colour); dot.setAttribute('class', 'sig-dot');
    svg.appendChild(dot);
    var t0 = performance.now();
    (function f(now) {
      var k = Math.min(1, (now - t0) / ms), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, q = pathEl.getPointAtLength(e * len);
      dot.setAttribute('cx', q.x.toFixed(1)); dot.setAttribute('cy', q.y.toFixed(1));
      if (k < 1) requestAnimationFrame(f); else { dot.remove(); if (done) done(); }
    })(t0);
  }

  function tick() {
    var p = next();
    /* left: the oldest signal leaves, the new one takes its band */
    var old = chips.shift();
    old.el.classList.add('sig-out-anim');
    setTimeout(function () { old.el.remove(); }, 380);
    var c = makeChip(p, old.band); c.el.classList.add('sig-in-anim'); chips.push(c);
    place(c); draw();
    travel(lineFor.get(c.el), STROKE[p[2]], 700, function () {
      core.classList.remove('pulse'); void core.offsetWidth; core.classList.add('pulse');
      /* right: the new work slides in at the top, the oldest drops off the bottom */
      var gone = rows.pop();
      gone.el.classList.add('sig-out-anim');
      setTimeout(function () { gone.el.remove(); draw(); }, 380);
      var r = makeRow(p); r.el.classList.add('sig-in-anim');
      outBox.insertBefore(r.el, outBox.firstChild); rows.unshift(r);
      settle(r, 1900);
      draw();
      travel(lineFor.get(r.el), STROKE[p[2]], 600);
    });
  }

  var timer = 0, visible = false;
  function start() { if (timer || still) return; timer = setInterval(tick, STEP); }
  function stop() { clearInterval(timer); timer = 0; }

  chips.forEach(place); draw();
  rows.forEach(function (r, i) { settle(r, 1400 + i * 300); });
  sig.classList.add('sig-go');

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible && !document.hidden) start(); else stop();
    }, { threshold: 0.3 }).observe(sig);
  } else { visible = true; start(); }
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else if (visible) start(); });
  var rt = 0;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { chips.forEach(place); draw(); }, 120); });
})();
