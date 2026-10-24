/* TYFNOW ring.js: section 4 on the one-page Home, "HumanAIse context to build better" (24 Oct 2026).
   A soft gradient drifts behind the whole section, edge to edge: greens while Human leads, violet and lilac while
   AI leads, blending slowly as the lead swaps every few seconds. Only the leading word in the headline is coloured.
   Inside the TYFNOW ring, task chips (illustrative issues, not client data) flash in the leading colour, hold a
   moment, then fly to their heading (Website, App, Search and AI answers, Content) and its tally goes up; tallies start at zero each visit, a demo count, not a claim. No task shows twice at once.
   The outer ring of disciplines turns slowly. Runs only while on screen and the tab is visible.
   Reduced motion: still ring and gradient, no swaps. No JS: the four headings as tags. */
(function () {
  'use strict';
  var W = window, D = document;
  var sec = D.getElementById('how-it-works'), stage = D.getElementById('rg'), cv = D.getElementById('rg-bg');
  if (!sec || !stage || !cv || !cv.getContext) return;
  var reduce = W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg';

  /* [source, task, heading] ; headings: 0 Website, 1 App, 2 Search and AI answers, 3 Content */
  var POOL = [
    ['Site audit', 'Error 404s', 0], ['Owner', 'Homepage feels dated', 0], ['Crawler', '18 broken links', 0], ['Customers', 'Enquiries have dropped', 0],
    ['SEO audit', 'Meta data missing', 0],
    ['App store', 'Clunky booking', 1], ['Team', 'App feels slow', 1], ['Crash log', 'Crash at checkout', 1],
    ['Search Console', 'Page not indexed', 2], ['Owner', 'Nobody finds us online', 2], ['AI search', 'Not cited by AI', 2],
    ['Team', 'Posting has gone quiet', 3], ['Google reviews', 'Review unanswered', 3], ['Owner', 'Need a launch campaign', 3], ['Sales call', 'No case studies', 3]
  ];
  for (var q = POOL.length - 1; q > 0; q--) { var j = Math.floor(Math.random() * (q + 1)), tmp = POOL[q]; POOL[q] = POOL[j]; POOL[j] = tmp; } /* new mix each visit */
  var OUT = [['Website', 'f-web'], ['App', 'f-app'], ['Search and AI answers', 'f-search'], ['Content', 'f-content']];
  var OUT_S = [['Website', 'f-web'], ['App', 'f-app'], ['Search', 'f-search'], ['Content', 'f-content']];
  var DISC = ['Creative', 'Production', 'Workflow', 'Testing'];

  /* geometry: a wide ring or a smaller one on phones; two tasks at a time on both */
  var WIDE = { vb: [1040, 640], c: [520, 320], rin: 230, rout: 292, core: 104, xy: [[-36, -132], [36, 132]], out: OUT };
  var NARROW = { vb: [340, 380], c: [170, 190], rin: 134, rout: 148, core: 48, narrow: true, chip: 36, xy: [[0, -72], [0, 72]], out: OUT_S };
  var G, svg, outs = [], counts = [0, 0, 0, 0], slots = [], disc = [], pi = 0, rot = 0;

  function el(n, a, p) { var e = D.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  function pt(r, deg) { var a = deg * Math.PI / 180; return [G.c[0] + r * Math.cos(a), G.c[1] + r * Math.sin(a)]; }
  function len(t, fb) { try { return t.getComputedTextLength(); } catch (e) { return fb; } }

  function build() {
    G = W.innerWidth <= 640 ? NARROW : WIDE;
    if (svg) svg.remove();
    outs = []; slots = []; disc = [];
    svg = el('svg', { 'class': 'rg-svg' + (G.narrow ? ' is-narrow' : ''), viewBox: '0 0 ' + G.vb[0] + ' ' + G.vb[1], role: 'presentation' });
    stage.appendChild(svg);
    var dg = el('g', {}, svg);
    el('circle', { 'class': 'rg-out', cx: G.c[0], cy: G.c[1], r: G.rout }, dg);
    DISC.forEach(function (d) {
      var g = el('g', {}, dg), r = el('rect', { 'class': 'rg-dp', height: 26, rx: 13, y: -13 }, g), t = el('text', { 'class': 'rg-dt', 'text-anchor': 'middle', y: 4 }, g);
      t.textContent = d; var w = len(t, d.length * 7) + 24; r.setAttribute('x', -w / 2); r.setAttribute('width', w); disc.push(g);
    });
    el('circle', { 'class': 'rg-in', cx: G.c[0], cy: G.c[1], r: G.rin }, svg);
    el('circle', { 'class': 'rg-link', cx: G.c[0], cy: G.c[1], r: G.rin, pathLength: 360 }, svg); /* marching dots linking the four headings */
    /* spokes: dotted lines from the TYFNOW core out to each heading, dots travelling outwards */
    var sg = el('g', {}, svg), r0 = G.core / 2 + (G.narrow ? 4 : 8);
    for (var k = 0; k < 4; k++) { var a = pt(r0, -90 + k * 90), b = pt(G.rin, -90 + k * 90); el('line', { 'class': 'rg-spoke', x1: a[0], y1: a[1], x2: b[0], y2: b[1] }, sg); }
    G.tg = el('g', {}, svg);
    var h = G.core;
    el('rect', { 'class': 'rg-core', x: G.c[0] - h / 2, y: G.c[1] - h / 2, width: h, height: h, rx: h * 0.23 }, svg);
    var ct = el('text', { 'class': 'rg-core-t', x: G.c[0], y: G.c[1] + (G.narrow ? 3.5 : 7.5), 'text-anchor': 'middle' }, svg); ct.textContent = 'TYFNOW';
    var og = el('g', {}, svg);
    G.out.forEach(function (o, i) {
      var p = pt(G.rin, -90 + i * 90), g = el('g', { 'class': o[1], transform: 'translate(' + p[0] + ',' + p[1] + ')' }, og);
      var r = el('rect', { 'class': 'rg-tag', height: 32, rx: 8, y: -16 }, g), t = el('text', { 'class': 'rg-tagt', y: 4.5 }, g);
      var nb = el('rect', { 'class': 'rg-nbox', height: 22, rx: 6, y: -11 }, g), nt = el('text', { 'class': 'rg-tagn', 'text-anchor': 'middle', y: 4.5 }, g);
      t.textContent = o[0];
      outs.push({ p: p, r: r, t: t, nb: nb, nt: nt, name: o[0] }); setOut(i);
    });
    G.fly = el('g', {}, svg);
    G.xy.forEach(function (_, i) { mk(i, true); });
    place();
  }

  /* black heading tag; its tally sits in its own small light box on the right */
  function setOut(i) {
    var o = outs[i]; o.nt.textContent = counts[i];
    var tw = len(o.t, o.name.length * 7), nw = Math.max(22, len(o.nt, 8) + 12);
    var w = 12 + tw + 8 + nw + 5, x0 = -w / 2;
    o.r.setAttribute('x', x0); o.r.setAttribute('width', w);
    o.t.setAttribute('x', x0 + 12);
    o.nb.setAttribute('x', x0 + 12 + tw + 8); o.nb.setAttribute('width', nw);
    o.nt.setAttribute('x', x0 + 12 + tw + 8 + nw / 2);
  }

  function showing() { return slots.filter(Boolean).map(function (s) { return s.k; }); }
  function nextTask() {
    var on = showing();
    for (var n = 0; n < POOL.length; n++) { var p = POOL[pi++ % POOL.length]; if (on.indexOf(p[1]) < 0) return p; }
    return POOL[pi++ % POOL.length];
  }

  /* a task chip: uppercase source over the task, a slight tilt like a note on a desk */
  function mk(i, first) {
    var p = nextTask(), pos = [G.c[0] + G.xy[i][0], G.c[1] + G.xy[i][1]], tilt = (Math.random() * 5 - 2.5).toFixed(1);
    var g = el('g', { 'class': 'rg-task' + (first ? '' : ' is-new'), transform: 'translate(' + pos[0] + ',' + pos[1] + ') rotate(' + tilt + ')' }, G.tg);
    var ch = G.chip || 42;
    var r = el('rect', { 'class': 'rg-chip', rx: 9, height: ch, y: -ch / 2 }, g);
    var s = el('text', { 'class': 'rg-src', 'text-anchor': 'middle', y: -ch / 2 + 16 }, g); s.textContent = p[0].toUpperCase();
    var t = el('text', { 'class': 'rg-txt', 'text-anchor': 'middle', y: ch / 2 - 8 }, g); t.textContent = p[1];
    var w = Math.max(len(s, 80), len(t, 100)) + 26; r.setAttribute('x', -w / 2); r.setAttribute('width', w);
    if (!first) requestAnimationFrame(function () { requestAnimationFrame(function () { g.classList.remove('is-new'); }); });
    slots[i] = { g: g, o: p[2], pos: pos, k: p[1], tilt: tilt };
  }

  function place() {
    disc.forEach(function (g, i) { var p = pt(G.rout, -45 + i * 90 + rot); g.setAttribute('transform', 'translate(' + p[0] + ',' + p[1] + ')'); });
  }

  /* ---------- gradient: six soft fields drifting; greens for Human, violets for AI ---------- */
  var cx = cv.getContext('2d'), CW = 0, CH = 0;
  var BL = [
    { h: [168, 222, 140], a: [118, 97, 246], r: .55, sx: .21, sy: .17, px: 0, py: 1.3, ox: .2, oy: .3 },
    { h: [225, 245, 210], a: [238, 234, 255], r: .7, sx: .13, sy: .19, px: 2, py: .4, ox: .8, oy: .25 },
    { h: [188, 239, 220], a: [155, 123, 255], r: .45, sx: .17, sy: .11, px: 4, py: 2.2, ox: .75, oy: .75 },
    { h: [223, 255, 155], a: [188, 239, 233], r: .4, sx: .09, sy: .15, px: 1, py: 3.1, ox: .15, oy: .8 },
    { h: [120, 196, 120], a: [90, 80, 220], r: .3, sx: .23, sy: .2, px: 3, py: 5, ox: .5, oy: .55 },
    { h: [240, 249, 232], a: [228, 222, 255], r: .6, sx: .11, sy: .07, px: 5, py: .9, ox: .5, oy: .1 }
  ];
  function size() { var r = sec.getBoundingClientRect(); CW = Math.max(60, Math.round(r.width / 5)); CH = Math.max(60, Math.round(r.height / 5)); cv.width = CW; cv.height = CH; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function paint() {
    var S = Math.max(CW, CH);
    cx.globalCompositeOperation = 'source-over';
    cx.fillStyle = 'rgb(' + [lerp(243, 246, mix), lerp(248, 245, mix), lerp(238, 255, mix)].map(Math.round) + ')';
    cx.fillRect(0, 0, CW, CH);
    BL.forEach(function (b, i) {
      var x = (b.ox + .22 * Math.sin(time * b.sx + b.px)) * CW, y = (b.oy + .2 * Math.cos(time * b.sy + b.py)) * CH, r = b.r * S * (1 + .12 * Math.sin(time * .3 + i));
      var c = [0, 1, 2].map(function (k) { return Math.round(lerp(b.h[k], b.a[k], mix)); }), g = cx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(' + c + ',.8)'); g.addColorStop(.55, 'rgba(' + c + ',.32)'); g.addColorStop(1, 'rgba(' + c + ',0)');
      cx.fillStyle = g; cx.fillRect(0, 0, CW, CH);
    });
    cx.globalCompositeOperation = 'soft-light';
    var lx = (.5 + .4 * Math.sin(time * .17)) * CW, ly = (.5 + .4 * Math.cos(time * .13)) * CH, lg = cx.createRadialGradient(lx, ly, 0, lx, ly, S * .6);
    lg.addColorStop(0, 'rgba(255,255,255,.7)'); lg.addColorStop(1, 'rgba(255,255,255,0)');
    cx.fillStyle = lg; cx.fillRect(0, 0, CW, CH);
    cx.globalCompositeOperation = 'source-over';
  }

  /* ---------- the lead: Human, then AI, then two tasks land ---------- */
  var who = 'h', mix = 0, target = 0, time = 0, since = 0, sinceTw = 0, last = 0, running = false, raf = 0;
  function setLead(w) { who = w; target = w === 'a' ? 1 : 0; sec.classList.toggle('lead-h', w === 'h'); sec.classList.toggle('lead-a', w === 'a'); }
  /* flash, hold, send: a task lights in the leading colour, holds a moment, then flies to its heading */
  function flashSend() {
    var free = slots.map(function (s, i) { return s && !s.busy ? i : -1; }).filter(function (i) { return i >= 0; });
    if (!free.length) return;
    var i = free[Math.floor(Math.random() * free.length)], s = slots[i];
    s.busy = true; s.g.classList.add(who === 'h' ? 'is-h' : 'is-a');
    setTimeout(function () { send(i, s); }, 450);
  }
  function send(i, s) {
    if (!s.g.parentNode) return; /* rebuilt while waiting (resize) */
    var o = outs[s.o], from = s.pos, st = performance.now(); G.fly.appendChild(s.g);
    (function f(now) {
      var k = Math.min(1, (now - st) / 650), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      s.g.setAttribute('transform', 'translate(' + (from[0] + (o.p[0] - from[0]) * e) + ',' + (from[1] + (o.p[1] - from[1]) * e) + ') rotate(' + (s.tilt * (1 - e)) + ') scale(' + (1 - .65 * e) + ')');
      s.g.style.opacity = 1 - e * .85;
      if (k < 1) requestAnimationFrame(f);
      else { s.g.remove(); if (slots[i] === s) slots[i] = null; counts[s.o]++; setOut(s.o); setTimeout(function () { if (G.xy[i] && !slots[i]) mk(i, false); }, 350); }
    })(st);
  }
  function frame(now) {
    if (!running) return;
    var dt = Math.min(.05, (now - last) / 1000 || .016); last = now;
    time += dt; mix += (target - mix) * Math.min(1, dt * .9); rot += dt * 4;
    place(); paint();
    since += dt; sinceTw += dt;
    if (sinceTw > 1.8) { sinceTw = 0; flashSend(); }
    if (since > 4.5) { since = 0; setLead(who === 'a' ? 'h' : 'a'); }
    raf = requestAnimationFrame(frame);
  }
  function start() { if (running || reduce) return; running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
  function stop() { running = false; cancelAnimationFrame(raf); }

  build(); size(); paint(); setLead('h');
  stage.classList.add('rg-live');
  var mode = G;
  W.addEventListener('resize', function () {
    size(); paint();
    var want = W.innerWidth <= 640 ? NARROW : WIDE;
    if (want !== mode) { mode = want; build(); }
  });
  var visible = false;
  if ('IntersectionObserver' in W) {
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible && !D.hidden) start(); else stop(); }, { threshold: 0.1 }).observe(sec);
  } else { visible = true; start(); }
  D.addEventListener('visibilitychange', function () { if (D.hidden) stop(); else if (visible) start(); });
})();
