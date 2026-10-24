/* TYFNOW close-mosaic.js: the closing card's gradient drawn as a mosaic of square tiles (round 9, 24 Oct 2026).
   The card's own gradient (violet to lilac to peach, with a coral glow top right) is sampled once per tile;
   each tile gets a small random shift in lightness, and a hairline gap shows the grid. Static: no motion.
   No JS or no canvas: the CSS gradient underneath shows instead. */
(function () {
  'use strict';
  var W = window, D = document, cv = D.getElementById('cl-mosaic');
  if (!cv || !cv.getContext) return;
  var card = cv.parentNode, seed = [];
  function rnd(i) { if (seed[i] === undefined) seed[i] = Math.random() * 2 - 1; return seed[i]; }
  function draw() {
    var r = card.getBoundingClientRect(), dpr = Math.min(2, W.devicePixelRatio || 1);
    if (!r.width) return;
    var tile = r.width < 700 ? 34 : 52, cols = Math.ceil(r.width / tile), rows = Math.ceil(r.height / tile);
    /* sample: paint the gradient at one pixel per tile */
    var s = D.createElement('canvas'); s.width = cols; s.height = rows;
    var g = s.getContext('2d'), a = 115 * Math.PI / 180, dx = Math.sin(a) * cols / 2, dy = -Math.cos(a) * rows / 2;
    var lin = g.createLinearGradient(cols / 2 - dx, rows / 2 - dy, cols / 2 + dx, rows / 2 + dy);
    lin.addColorStop(0, '#b4a3fb'); lin.addColorStop(.5, '#e5caff'); lin.addColorStop(1, '#ffddc9');
    g.fillStyle = lin; g.fillRect(0, 0, cols, rows);
    function glow(x, y, rad, c) { var rg = g.createRadialGradient(x, y, 0, x, y, rad); rg.addColorStop(0, c); rg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = rg; g.fillRect(0, 0, cols, rows); }
    var diag = Math.hypot(cols, rows);
    glow(cols, rows * .15, diag * .35, 'rgba(248,175,156,1)');
    glow(cols * .7, rows * 1.1, diag * .44, 'rgba(199,186,255,1)');
    var px = g.getImageData(0, 0, cols, rows).data;
    cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
    var c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.fillStyle = 'rgba(255,255,255,.28)'; c.fillRect(0, 0, r.width, r.height); /* the hairline grid */
    for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) {
      var i = (y * cols + x) * 4, k = 1 + rnd(y * 997 + x) * .045;
      c.fillStyle = 'rgb(' + Math.min(255, Math.round(px[i] * k)) + ',' + Math.min(255, Math.round(px[i + 1] * k)) + ',' + Math.min(255, Math.round(px[i + 2] * k)) + ')';
      c.fillRect(x * tile + .5, y * tile + .5, tile - 1, tile - 1);
    }
  }
  draw();
  var t = 0; W.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(draw, 150); });
  if ('ResizeObserver' in W) new ResizeObserver(function () { clearTimeout(t); t = setTimeout(draw, 150); }).observe(card);
})();
