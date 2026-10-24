/* TYFNOW values-motion.js: slow motion in three of the value icons (24 Oct 2026).
   Curiosity runs in CSS (its o is an eye that looks around and blinks).
   Creativity (round 8): three lines only, a little faster: asterisk, then a tipi, then an arrow, then the asterisk again.
   Candour (round 8): a flat line that swells into a voice note, talks, then settles back to a line, on a loop.
   Craft (round 7): the diamond folds its top in to a red heart; the lines turn black, boosters light,
   it drops out of its tile, and the diamond falls back in from the top.
   Runs only while the values are on screen. Reduced motion: the icons stay still. */
(function () {
  'use strict';
  var W = window, D = document;
  if (W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var cre = D.getElementById('ico-creativity'), cra = D.getElementById('ico-craft');
  if (!cre || !cra) return;
  var lines = cre.querySelectorAll('line'), poly = cra.querySelector('polygon'), mover = cra.querySelector('.cr-move');
  var bars = D.querySelectorAll('.op-wave rect');
  /* each bar talks at its own height and speed */
  var BAR = Array.prototype.map.call(bars, function () { return { lo: .2 + Math.random() * .3, hi: .6 + Math.random() * .4, sp: 7 + Math.random() * 9, ph: Math.random() * 6.28 }; });
  var LINE = .12, CAND = 5400; /* one loop: line 1.6s, swell .6s, talk 2.6s, settle .6s */
  function candour(t) {
    var c = t % CAND, e = c < 1600 ? 0 : c < 2200 ? ease((c - 1600) / 600) : c < 4800 ? 1 : 1 - ease((c - 4800) / 600);
    for (var i = 0; i < bars.length; i++) {
      var b = BAR[i], h = b.lo + (b.hi - b.lo) * (.5 + .5 * Math.sin(t / 1000 * b.sp + b.ph));
      bars[i].style.transform = 'scaleY(' + (LINE + (h - LINE) * e).toFixed(3) + ')';
    }
  }

  /* each state: three lines as [x1, y1, x2, y2]; never a fourth */
  var CRE = [
    [[12, 4, 12, 20], [5.07, 8, 18.93, 16], [5.07, 16, 18.93, 8]],    /* asterisk */
    [[4, 20, 20, 20], [6, 20, 13.5, 4], [18, 20, 10.5, 4]],             /* tipi: ground and two crossed poles */
    [[4, 12, 19, 12], [13, 6, 19, 12], [13, 18, 19, 12]]                /* arrow pointing right */
  ];
  /* seven points, clockwise from the top */
  var CRA = [
    [12, 3, 16.5, 7.5, 21, 12, 12, 21, 3, 12, 7.5, 7.5, 9.75, 5.25],                      /* diamond */
    [12, 8, 16.5, 4, 21, 9, 12, 20.5, 3, 9, 7.5, 4, 9.75, 6]                               /* heart: the top folds in */
  ];
  var VIOLET = '#5b45e8', RED = '#e5484d', INK = '#161716', CRAFT = 9000;
  function easeIn(k) { return k * k * k; }
  function easeOutBack(k) { var c = 1.4; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); }
  var craftState = '';
  function look(st) {
    if (st === craftState) return; craftState = st;
    cra.style.color = st === 'heart' ? RED : (st === 'lit' ? INK : VIOLET);
    poly.style.fill = st === 'heart' ? RED : 'transparent';
    cra.classList.toggle('cr-lit', st === 'lit');
  }
  /* one craft cycle: hold the diamond, fold to a heart, hold, go black with boosters, drop out, fall back in */
  function craft(t) {
    var c = t % CRAFT, y = 0;
    if (c < 2400) { setCra(CRA[0]); look('diamond'); }
    else if (c < 3600) { setCra(mix(CRA[0], CRA[1], ease((c - 2400) / 1200))); look(c < 3000 ? 'diamond' : 'heart'); }
    else if (c < 5600) { setCra(CRA[1]); look('heart'); }
    else if (c < 6300) { setCra(CRA[1]); look('lit'); y = Math.sin((c - 5600) / 25) * 0.6; }
    else if (c < 6900) { setCra(CRA[1]); look('lit'); y = easeIn((c - 6300) / 600) * 34; }
    else if (c < 7800) { setCra(CRA[0]); look('diamond'); y = -34 * (1 - easeOutBack((c - 6900) / 900)); }
    else { setCra(CRA[0]); look('diamond'); }
    mover.setAttribute('transform', 'translate(0 ' + y.toFixed(2) + ')');
  }
  var HOLD = 1800, MORPH = 1000;
  function ease(k) { return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }
  function mix(a, b, t) { return a.map(function (v, i) { return v + (b[i] - v) * t; }); }
  function setCre(st) { for (var i = 0; i < lines.length; i++) { var l = lines[i], v = st[i]; l.setAttribute('x1', v[0].toFixed(2)); l.setAttribute('y1', v[1].toFixed(2)); l.setAttribute('x2', v[2].toFixed(2)); l.setAttribute('y2', v[3].toFixed(2)); } }
  function setCra(p) { var out = []; for (var i = 0; i < p.length; i += 2) out.push(p[i].toFixed(2) + ',' + p[i + 1].toFixed(2)); poly.setAttribute('points', out.join(' ')); }

  var t0 = 0, running = false, raf = 0, paused = 0;
  function frame(now) {
    if (!running) return;
    var cycle = HOLD + MORPH, n = CRE.length, t = Math.max(0, now - t0), step = Math.floor(t / cycle) % n, inStep = t % cycle;
    var k = inStep < HOLD ? 0 : ease((inStep - HOLD) / MORPH), from = step, to = (step + 1) % n;
    setCre(CRE[from].map(function (l, i) { return mix(l, CRE[to][i], k); }));
    /* craft runs on its own, longer loop, offset so the two never change together */
    craft(t + 1200);
    candour(t);
    raf = requestAnimationFrame(frame);
  }
  function start() { if (running) return; running = true; t0 = performance.now() - paused; raf = requestAnimationFrame(frame); }
  function stop() { if (!running) return; running = false; paused = performance.now() - t0; cancelAnimationFrame(raf); }
  var box = D.getElementById('values') || cre;
  if ('IntersectionObserver' in W) {
    new IntersectionObserver(function (es) { if (es[0].isIntersecting && !D.hidden) start(); else stop(); }, { threshold: 0.15 }).observe(box);
  } else start();
  D.addEventListener('visibilitychange', function () { if (D.hidden) stop(); });
})();
