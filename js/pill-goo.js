/* TYFNOW pill-goo.js: section 5 pills as connecting blobs (round 9, 24 Oct 2026, after Sherry's metaball reference).
   Each row gets an SVG behind it holding one black rounded shape per pill, under an SVG "goo" filter (blur, then a
   hard alpha cut), so pills that come close melt into one blob. The pill text stays as crisp HTML on top. Both rows
   drift sideways (the second the other way) and each pill sways a little, out of step with its neighbours, so joins
   form and break as they travel. Drawing the shapes inside the SVG (not filtering HTML) keeps Safari happy.
   Runs only while on screen. Reduced motion or no JS: the plain pill strip. */
(function () {
  'use strict';
  var W = window, D = document, tick = D.querySelector('.op-bk-open .op-tick');
  if (!tick || (W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
  var NS = 'http://www.w3.org/2000/svg', PAD = 14;
  function el(n, a, p) { var e = D.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }

  var rows = [];
  Array.prototype.forEach.call(tick.querySelectorAll('.op-tick-row'), function (ul, r) {
    var wrap = D.createElement('div'); wrap.className = 'op-goo-row';
    ul.parentNode.insertBefore(wrap, ul);
    var svg = el('svg', { 'class': 'op-goo-svg', 'aria-hidden': 'true', focusable: 'false' });
    var f = el('filter', { id: 'op-goo-' + r, filterUnits: 'userSpaceOnUse', x: '-100', y: '-100', width: '6000', height: '400', 'color-interpolation-filters': 'sRGB' }, el('defs', {}, svg));
    el('feGaussianBlur', { 'in': 'SourceGraphic', stdDeviation: '7', result: 'b' }, f);
    el('feColorMatrix', { 'in': 'b', mode: 'matrix', values: '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9' }, f);
    var g = el('g', { filter: 'url(#op-goo-' + r + ')', fill: '#161716' }, svg);
    wrap.appendChild(svg); wrap.appendChild(ul);
    ul.classList.add('op-goo-fg');
    var li = ul.children, shapes = [];
    for (var i = 0; i < li.length; i++) shapes.push(el('rect', {}, g));
    rows.push({ ul: ul, svg: svg, li: li, shapes: shapes, box: [], dir: r % 2 ? 1 : -1, x: 0, setW: 0, per: 7 });
  });
  tick.classList.add('is-goo');

  function measure() {
    rows.forEach(function (o) {
      o.box = Array.prototype.map.call(o.li, function (e) { return [e.offsetLeft, e.offsetTop, e.offsetWidth, e.offsetHeight]; });
      o.setW = o.li[o.per] ? o.box[o.per][0] - o.box[0][0] : o.ul.scrollWidth / 3;
      if (o.dir > 0 && o.x === 0) o.x = -o.setW;
      var h = o.ul.offsetHeight + PAD * 2;
      o.svg.setAttribute('width', tick.clientWidth); o.svg.setAttribute('height', h);
      o.svg.setAttribute('viewBox', '0 ' + (-PAD) + ' ' + tick.clientWidth + ' ' + h);
      o.shapes.forEach(function (s, i) { var b = o.box[i]; s.setAttribute('width', b[2]); s.setAttribute('height', b[3]); s.setAttribute('rx', b[3] / 2); });
    });
  }

  var t = 0, last = 0, raf = 0, running = false;
  function draw() {
    rows.forEach(function (o, r) {
      o.ul.style.transform = 'translateX(' + o.x.toFixed(2) + 'px)';
      var vw = tick.clientWidth;
      for (var i = 0; i < o.li.length; i++) {
        var k = i % o.per, sx = 9 * Math.sin(t * (.9 + k * .13) + k * 2.1 + r), sy = 2.5 * Math.sin(t * 1.3 + k * 1.7), b = o.box[i];
        o.li[i].style.transform = 'translate(' + sx.toFixed(2) + 'px,' + sy.toFixed(2) + 'px)';
        var x = b[0] + o.x + sx;
        if (x > vw + 40 || x + b[2] < -40) { o.shapes[i].setAttribute('display', 'none'); continue; }
        o.shapes[i].removeAttribute('display');
        o.shapes[i].setAttribute('x', x.toFixed(2)); o.shapes[i].setAttribute('y', (b[1] + sy).toFixed(2));
      }
    });
  }
  function frame(now) {
    if (!running) return;
    var dt = Math.min(.05, (now - last) / 1000 || .016); last = now; t += dt;
    rows.forEach(function (o, r) {
      o.x += o.dir * (o.setW / (r ? 44 : 38)) * dt;
      if (o.dir < 0 && o.x <= -o.setW) o.x += o.setW;
      if (o.dir > 0 && o.x >= 0) o.x -= o.setW;
    });
    draw();
    raf = requestAnimationFrame(frame);
  }
  function start() { if (running) return; running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
  function stop() { running = false; cancelAnimationFrame(raf); }
  measure(); draw();
  if (D.fonts && D.fonts.ready) D.fonts.ready.then(function () { measure(); draw(); }); /* pill widths change once Inter loads */
  W.addEventListener('resize', function () { measure(); draw(); });
  var vis = false;
  if ('IntersectionObserver' in W) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; if (vis && !D.hidden) start(); else stop(); }).observe(tick);
  else start();
  D.addEventListener('visibilitychange', function () { if (D.hidden) stop(); else if (vis) start(); });
})();
