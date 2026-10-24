/* TYFNOW ring.js: section 4 on the one-page Home, "HumanAIse context to build better" (24 Oct 2026).
   A soft gradient drifts behind the card: coral and peach while Human leads, violet and lilac while AI leads,
   blending slowly as the lead swaps every few seconds. Inside the TYFNOW ring, task pills (illustrative issues,
   not client data) light up in the leading colour. After each full Human-then-AI turn, two tasks finish, fly to
   their heading (Website, App, Search and AI answers, Content) and its tally goes up; tallies start at zero each
   visit, a demo count, not a claim. The outer ring of disciplines turns slowly.
   Runs only while on screen and the tab is visible. Reduced motion: still ring, still gradient, no swaps.
   No JS: the four headings as a list. */
(function () {
  'use strict';
  var W = window, D = document;
  var card = D.getElementById('rg-card'), stage = D.getElementById('rg'), cv = D.getElementById('rg-bg');
  if (!card || !stage || !cv || !cv.getContext) return;
  var reduce = W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg';

  /* ---------- tasks: sharp, issue-led, each tied to the heading it lands on ---------- */
  var POOL = [
    ['Error 404s', 0], ['18 broken links', 0], ['Meta data missing', 0], ['Slow on mobile', 0], ['Form drop-offs', 0], ['Alt text missing', 0],
    ['Clunky booking', 1], ['Login drop-off', 1], ['Outdated screens', 1], ['Crash at checkout', 1],
    ['Page not indexed', 2], ['Feed errors', 2], ['Not cited by AI', 2], ['Listings outdated', 2], ['Schema missing', 2],
    ['Posting stalled', 3], ['Review unanswered', 3], ['No case studies', 3], ['Event not promoted', 3], ['Video unedited', 3]
  ];
  var OUT = ['Website', 'App', 'Search and AI answers', 'Content'];
  var OUT_S = ['Website', 'App', 'Search', 'Content'];
  var DISC = ['Creative', 'Production', 'Workflow', 'Testing'];

  /* geometry: wide ring with ten tasks in rows inside it, or a smaller ring with four tasks on phones */
  var WIDE = { vb: [680, 470], c: [340, 235], rin: 160, rout: 215, rcore: 42, xy: [[0, -105], [-72, -70], [72, -70], [-96, -32], [96, -32], [-96, 32], [96, 32], [-72, 70], [72, 70], [0, 105]], out: OUT };
  var NARROW = { vb: [320, 350], c: [160, 175], rin: 108, rout: 142, rcore: 32, narrow: true, xy: [[-58, -50], [58, -50], [-58, 50], [58, 50]], out: OUT_S };
  var G, svg, outs = [], counts = [0, 0, 0, 0], slots = [], disc = [], pi = 0, rot = 0;

  function el(n, a, p) { var e = D.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  function pt(r, deg) { var a = deg * Math.PI / 180; return [G.c[0] + r * Math.cos(a), G.c[1] + r * Math.sin(a)]; }
  function pill(parent, text, cls, pad, h, tcls) {
    var g = el('g', {}, parent), r = el('rect', { 'class': cls, rx: h / 2, height: h }, g), t = el('text', { 'class': tcls, 'text-anchor': 'middle', y: h * 0.18 }, g);
    t.textContent = text;
    var w = (t.getComputedTextLength ? t.getComputedTextLength() : text.length * 6.5) + pad * 2;
    r.setAttribute('x', -w / 2); r.setAttribute('y', -h / 2); r.setAttribute('width', w);
    return { g: g, r: r, t: t, w: w };
  }

  function build() {
    G = W.innerWidth <= 640 ? NARROW : WIDE;
    if (svg) svg.remove();
    outs = []; slots = []; disc = [];
    svg = el('svg', { 'class': 'rg-svg' + (G.narrow ? ' is-narrow' : ''), viewBox: '0 0 ' + G.vb[0] + ' ' + G.vb[1], role: 'presentation' });
    stage.appendChild(svg);
    var dg = el('g', {}, svg);
    el('circle', { 'class': 'rg-out', cx: G.c[0], cy: G.c[1], r: G.rout }, dg);
    DISC.forEach(function (d) { disc.push(pill(dg, d, 'rg-dp', 11, 22, 'rg-dt').g); });
    el('circle', { 'class': 'rg-in', cx: G.c[0], cy: G.c[1], r: G.rin }, svg);
    var tg = el('g', {}, svg);
    el('circle', { 'class': 'rg-core', cx: G.c[0], cy: G.c[1], r: G.rcore }, svg);
    var ct = el('text', { 'class': 'rg-core-t', x: G.c[0], y: G.c[1] + 4.5, 'text-anchor': 'middle' }, svg); ct.textContent = 'TYFNOW';
    var og = el('g', {}, svg);
    G.out.forEach(function (name, i) {
      var p = pt(G.rin, -90 + i * 90), g = el('g', { transform: 'translate(' + p[0] + ',' + p[1] + ')' }, og);
      var label = pill(g, name, 'rg-op', 14, 30, 'rg-ot');
      outs.push({ p: p, label: label, name: name });
      setOut(i);
    });
    G.tg = tg; G.fly = el('g', {}, svg);
    G.xy.forEach(function (_, i) { mk(i, true); });
    place();
  }

  /* heading label with its tally in bold */
  function setOut(i) {
    var o = outs[i], t = o.label.t; t.textContent = o.name + '  ';
    var n = el('tspan', { 'class': 'rg-on' }, t); n.textContent = counts[i];
    var w = (t.getComputedTextLength ? t.getComputedTextLength() : 80) + 28; o.label.r.setAttribute('x', -w / 2); o.label.r.setAttribute('width', w);
  }

  function mk(i, first) {
    var p = POOL[pi++ % POOL.length], pos = [G.c[0] + G.xy[i][0], G.c[1] + G.xy[i][1]];
    var g = el('g', { 'class': 'rg-task' + (first ? '' : ' is-new'), transform: 'translate(' + pos[0] + ',' + pos[1] + ')' }, G.tg);
    pill(g, p[0], 'rg-tp', 9, 20, 'rg-tt');
    if (!first) requestAnimationFrame(function () { requestAnimationFrame(function () { g.classList.remove('is-new'); }); });
    slots[i] = { g: g, o: p[1], pos: pos };
  }

  function place() {
    disc.forEach(function (g, i) { var p = pt(G.rout, -45 + i * 90 + rot); g.setAttribute('transform', 'translate(' + p[0] + ',' + p[1] + ')'); });
  }

  /* ---------- gradient: six soft fields drifting; colours blend from Human to AI ---------- */
  var cx = cv.getContext('2d'), CW = 0, CH = 0;
  var BL = [
    { h: [255, 129, 109], a: [118, 97, 246], r: .55, sx: .21, sy: .17, px: 0, py: 1.3, ox: .25, oy: .3 },
    { h: [255, 225, 217], a: [238, 234, 255], r: .7, sx: .13, sy: .19, px: 2, py: .4, ox: .75, oy: .25 },
    { h: [255, 190, 160], a: [155, 123, 255], r: .45, sx: .17, sy: .11, px: 4, py: 2.2, ox: .7, oy: .75 },
    { h: [223, 255, 155], a: [188, 239, 233], r: .4, sx: .09, sy: .15, px: 1, py: 3.1, ox: .2, oy: .8 },
    { h: [255, 150, 120], a: [90, 80, 220], r: .35, sx: .23, sy: .2, px: 3, py: 5, ox: .5, oy: .55 },
    { h: [255, 240, 232], a: [228, 222, 255], r: .6, sx: .11, sy: .07, px: 5, py: .9, ox: .5, oy: .1 }
  ];
  function size() { var r = card.getBoundingClientRect(); CW = Math.max(60, Math.round(r.width / 4)); CH = Math.max(60, Math.round(r.height / 4)); cv.width = CW; cv.height = CH; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function paint() {
    var S = Math.max(CW, CH);
    cx.globalCompositeOperation = 'source-over';
    cx.fillStyle = 'rgb(' + [lerp(255, 246, mix), lerp(246, 245, mix), lerp(242, 255, mix)].map(Math.round) + ')';
    cx.fillRect(0, 0, CW, CH);
    BL.forEach(function (b, i) {
      var x = (b.ox + .22 * Math.sin(time * b.sx + b.px)) * CW, y = (b.oy + .2 * Math.cos(time * b.sy + b.py)) * CH, r = b.r * S * (1 + .12 * Math.sin(time * .3 + i));
      var c = [0, 1, 2].map(function (k) { return Math.round(lerp(b.h[k], b.a[k], mix)); }), g = cx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(' + c + ',.85)'); g.addColorStop(.55, 'rgba(' + c + ',.35)'); g.addColorStop(1, 'rgba(' + c + ',0)');
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
  function setLead(w) { who = w; target = w === 'a' ? 1 : 0; card.classList.toggle('lead-h', w === 'h'); card.classList.toggle('lead-a', w === 'a'); }
  function twinkle() {
    var s = slots[Math.floor(Math.random() * slots.length)]; if (!s || s.busy) return;
    var cls = who === 'h' ? 'is-h' : 'is-a'; s.g.classList.add(cls);
    setTimeout(function () { s.g.classList.remove(cls); }, 700);
  }
  function land() {
    var idx = slots.map(function (_, i) { return i; }).sort(function () { return Math.random() - .5; }).slice(0, 2);
    idx.forEach(function (i) {
      var s = slots[i]; if (!s || s.busy) return; s.busy = true;
      var o = outs[s.o], from = s.pos, st = performance.now(); G.fly.appendChild(s.g);
      (function f(now) {
        var k = Math.min(1, (now - st) / 700), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        s.g.setAttribute('transform', 'translate(' + (from[0] + (o.p[0] - from[0]) * e) + ',' + (from[1] + (o.p[1] - from[1]) * e) + ') scale(' + (1 - .6 * e) + ')');
        s.g.style.opacity = 1 - e * .8;
        if (k < 1) requestAnimationFrame(f);
        else { s.g.remove(); counts[s.o]++; setOut(s.o); setTimeout(function () { if (G.xy[i]) mk(i, false); }, 300); }
      })(st);
    });
  }
  function frame(now) {
    if (!running) return;
    var dt = Math.min(.05, (now - last) / 1000 || .016); last = now;
    time += dt; mix += (target - mix) * Math.min(1, dt * .9); rot += dt * 4;
    place(); paint();
    since += dt; sinceTw += dt;
    if (sinceTw > .45) { sinceTw = 0; twinkle(); }
    if (since > 4.5) { since = 0; if (who === 'a') land(); setLead(who === 'a' ? 'h' : 'a'); }
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
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible && !D.hidden) start(); else stop(); }, { threshold: 0.1 }).observe(card);
  } else { visible = true; start(); }
  D.addEventListener('visibilitychange', function () { if (D.hidden) stop(); else if (visible) start(); });
})();
