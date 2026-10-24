/* TYFNOW close-gradient.js: the closing card's violet-to-peach gradient, drifting slowly (round 9, 24 Oct 2026).
   Same method as section 4 (js/ring.js): soft colour fields painted on a small canvas, stretched to the card
   so they blend smoothly. Each field's hue swings slowly round its own colour, out of step with the others,
   so the whole card shifts through violets, pinks and corals. Runs only while the card is on screen and the tab is visible.
   Reduced motion: one still frame. No JS: the CSS gradient underneath. */
(function () {
  'use strict';
  var W = window, D = document, cv = D.getElementById('cl-grad');
  if (!cv || !cv.getContext) return;
  var card = cv.parentNode, cx = cv.getContext('2d'), CW = 0, CH = 0;
  var reduce = W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var BL = [
    { c: [180, 163, 251], r: .75, sx: .13, sy: .17, px: 0, py: 1.3, ox: .15, oy: .35 },
    { c: [229, 202, 255], r: .7, sx: .11, sy: .09, px: 2, py: .4, ox: .5, oy: .5 },
    { c: [255, 221, 201], r: .6, sx: .17, sy: .13, px: 4, py: 2.2, ox: .9, oy: .7 },
    { c: [248, 175, 156], r: .45, sx: .09, sy: .15, px: 1, py: 3.1, ox: .95, oy: .15 },
    { c: [199, 186, 255], r: .55, sx: .15, sy: .11, px: 3, py: 5, ox: .65, oy: 1 },
    { c: [157, 140, 245], r: .4, sx: .19, sy: .21, px: 5, py: .9, ox: .3, oy: .9 }
  ];
  function hsl(c) { var r = c[0] / 255, g = c[1] / 255, b = c[2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), h = 0, s = 0, l = (mx + mn) / 2, d = mx - mn;
    if (d) { s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; }
    return [h, s * 100, l * 100]; }
  BL.forEach(function (b) { b.h = hsl(b.c); });
  function size() { var r = card.getBoundingClientRect(); CW = Math.max(60, Math.round(r.width / 6)); CH = Math.max(60, Math.round(r.height / 6)); cv.width = CW; cv.height = CH; }
  var time = 0;
  function paint() {
    var S = Math.max(CW, CH);
    cx.globalCompositeOperation = 'source-over';
    cx.fillStyle = 'rgb(222,205,255)'; cx.fillRect(0, 0, CW, CH);
    BL.forEach(function (b, i) {
      var x = (b.ox + .22 * Math.sin(time * b.sx + b.px)) * CW, y = (b.oy + .2 * Math.cos(time * b.sy + b.py)) * CH, r = b.r * S * (1 + .12 * Math.sin(time * .3 + i));
      var g = cx.createRadialGradient(x, y, 0, x, y, r);
      var hue = (b.h[0] + 55 * Math.sin(time * .22 + i * 1.7) + 360) % 360, col = hue.toFixed(1) + ',' + b.h[1].toFixed(1) + '%,' + b.h[2].toFixed(1) + '%';
      g.addColorStop(0, 'hsla(' + col + ',.95)'); g.addColorStop(.55, 'hsla(' + col + ',.4)'); g.addColorStop(1, 'hsla(' + col + ',0)');
      cx.fillStyle = g; cx.fillRect(0, 0, CW, CH);
    });
    cx.globalCompositeOperation = 'soft-light';
    var lx = (.5 + .4 * Math.sin(time * .17)) * CW, ly = (.5 + .4 * Math.cos(time * .13)) * CH, lg = cx.createRadialGradient(lx, ly, 0, lx, ly, S * .6);
    lg.addColorStop(0, 'rgba(255,255,255,.6)'); lg.addColorStop(1, 'rgba(255,255,255,0)');
    cx.fillStyle = lg; cx.fillRect(0, 0, CW, CH);
    cx.globalCompositeOperation = 'source-over';
  }
  var running = false, raf = 0, last = 0, visible = false;
  function frame(now) { if (!running) return; time += 1.5 * Math.min(.05, (now - last) / 1000 || .016); last = now; paint(); raf = requestAnimationFrame(frame); }
  function start() { if (running || reduce) return; running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
  function stop() { running = false; cancelAnimationFrame(raf); }
  size(); paint();
  W.addEventListener('resize', function () { size(); paint(); });
  if ('IntersectionObserver' in W) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible && !D.hidden) start(); else stop(); }, { threshold: 0.05 }).observe(card);
  else { visible = true; start(); }
  D.addEventListener('visibilitychange', function () { if (D.hidden) stop(); else if (visible) start(); });
})();
