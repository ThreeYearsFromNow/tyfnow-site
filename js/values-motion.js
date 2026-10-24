/* TYFNOW values-motion.js: slow motion in three of the value icons (24 Oct 2026).
   Curiosity runs in CSS (its o is an eye that looks around and blinks).
   Creativity's three lines become a tipi tent, then a simple hourglass, then the asterisk again.
   Craft's diamond folds its top in to a heart, then becomes a crown, then the diamond again.
   Runs only while the values are on screen. Reduced motion: the icons stay still. */
(function () {
  'use strict';
  var W = window, D = document;
  if (W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var cre = D.getElementById('ico-creativity'), cra = D.getElementById('ico-craft');
  if (!cre || !cra) return;
  var lines = cre.querySelectorAll('line'), poly = cra.querySelector('polygon');

  /* each state: four lines as [x1, y1, x2, y2]; the fourth is a point when not needed */
  var CRE = [
    [[12, 4, 12, 20], [5.07, 8, 18.93, 16], [5.07, 16, 18.93, 8], [12, 12, 12, 12]],    /* asterisk */
    [[4, 20, 20, 20], [6, 20, 14, 4], [18, 20, 10, 4], [12, 20, 12, 15.5]],               /* tipi tent */
    [[6, 4, 18, 4], [7, 5, 17, 19], [17, 5, 7, 19], [6, 20, 18, 20]]                       /* hourglass */
  ];
  /* seven points, clockwise from the top */
  var CRA = [
    [12, 3, 16.5, 7.5, 21, 12, 12, 21, 3, 12, 7.5, 7.5, 9.75, 5.25],                      /* diamond */
    [12, 8, 16.5, 4, 21, 9, 12, 20.5, 3, 9, 7.5, 4, 9.75, 6],                              /* heart: the top folds in */
    [12, 5, 15.5, 11, 21, 6, 19.5, 19, 4.5, 19, 3, 6, 8.5, 11]                             /* crown */
  ];
  var HOLD = 2600, MORPH = 1500;
  function ease(k) { return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }
  function mix(a, b, t) { return a.map(function (v, i) { return v + (b[i] - v) * t; }); }
  function setCre(st) { for (var i = 0; i < 4; i++) { var l = lines[i], v = st[i]; l.setAttribute('x1', v[0].toFixed(2)); l.setAttribute('y1', v[1].toFixed(2)); l.setAttribute('x2', v[2].toFixed(2)); l.setAttribute('y2', v[3].toFixed(2)); } }
  function setCra(p) { var out = []; for (var i = 0; i < p.length; i += 2) out.push(p[i].toFixed(2) + ',' + p[i + 1].toFixed(2)); poly.setAttribute('points', out.join(' ')); }

  var t0 = 0, running = false, raf = 0, paused = 0;
  function frame(now) {
    if (!running) return;
    var cycle = HOLD + MORPH, n = CRE.length, t = Math.max(0, now - t0), step = Math.floor(t / cycle) % n, inStep = t % cycle;
    var k = inStep < HOLD ? 0 : ease((inStep - HOLD) / MORPH), from = step, to = (step + 1) % n;
    setCre(CRE[from].map(function (l, i) { return mix(l, CRE[to][i], k); }));
    /* craft runs half a beat behind creativity, so the two never change together */
    var t2 = t + cycle / 2, s2 = Math.floor(t2 / cycle) % n, i2 = t2 % cycle, k2 = i2 < HOLD ? 0 : ease((i2 - HOLD) / MORPH);
    setCra(mix(CRA[s2], CRA[(s2 + 1) % n], k2));
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
