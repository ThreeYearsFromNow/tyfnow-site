/* TYFNOW pill-goo.js: section 5 pills as connecting blobs (round 9, 24 Oct 2026, after Sherry's metaball reference).
   Each row is drawn twice: a black shape layer under an SVG "goo" filter (blur, then a hard alpha cut), so pills that
   come close melt into one blob, and a crisp white text layer on top. Both rows drift sideways (the second the other
   way); each pill also sways a little, out of step with its neighbours, so the joins form and break as they travel.
   Runs only while on screen. Reduced motion or no JS: the plain pill strip, still or on its CSS loop. */
(function () {
  'use strict';
  var W = window, D = document, tick = D.querySelector('.op-bk-open .op-tick');
  if (!tick || (W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
  var NS = 'http://www.w3.org/2000/svg';

  /* the filter: blur the shapes, then keep only the solid middle so overlaps read as one liquid shape */
  var svg = D.createElementNS(NS, 'svg'); svg.setAttribute('width', '0'); svg.setAttribute('height', '0'); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('class', 'op-goo-defs');
  svg.innerHTML = '<defs><filter id="op-goo" x="-10%" y="-50%" width="120%" height="200%" color-interpolation-filters="sRGB">' +
    '<feGaussianBlur in="SourceGraphic" stdDeviation="7" result="b"/>' +
    '<feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"/></filter></defs>';
  D.body.appendChild(svg);

  var rows = [];
  Array.prototype.forEach.call(tick.querySelectorAll('.op-tick-row'), function (ul, r) {
    var wrap = D.createElement('div'); wrap.className = 'op-goo-row';
    ul.parentNode.insertBefore(wrap, ul);
    var bg = ul.cloneNode(true); bg.classList.add('op-goo-bg');
    ul.classList.add('op-goo-fg');
    wrap.appendChild(bg); wrap.appendChild(ul);
    rows.push({ fg: ul.children, bg: bg.children, ulf: ul, ulb: bg, dir: r % 2 ? 1 : -1, x: 0, setW: 0, per: 7 });
  });
  tick.classList.add('is-goo');

  function measure() {
    rows.forEach(function (o) {
      var a = o.fg[0], b = o.fg[o.per];
      o.setW = b ? b.offsetLeft - a.offsetLeft : o.ulf.scrollWidth / 3;
      if (o.dir > 0 && o.x === 0) o.x = -o.setW;
    });
  }
  measure();

  var t = 0, last = 0, raf = 0, running = false;
  function frame(now) {
    if (!running) return;
    var dt = Math.min(.05, (now - last) / 1000 || .016); last = now; t += dt;
    rows.forEach(function (o, r) {
      var speed = o.setW / (r ? 44 : 38);
      o.x += o.dir * speed * dt;
      if (o.dir < 0 && o.x <= -o.setW) o.x += o.setW;
      if (o.dir > 0 && o.x >= 0) o.x -= o.setW;
      var row = 'translateX(' + o.x.toFixed(2) + 'px)';
      o.ulf.style.transform = row; o.ulb.style.transform = row;
      for (var i = 0; i < o.fg.length; i++) {
        var k = i % o.per, s = 9 * Math.sin(t * (.9 + k * .13) + k * 2.1 + r), y = 2.5 * Math.sin(t * 1.3 + k * 1.7);
        var tr = 'translate(' + s.toFixed(2) + 'px,' + y.toFixed(2) + 'px)';
        o.fg[i].style.transform = tr; o.bg[i].style.transform = tr;
      }
    });
    raf = requestAnimationFrame(frame);
  }
  function start() { if (running) return; running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
  function stop() { running = false; cancelAnimationFrame(raf); }
  W.addEventListener('resize', measure);
  var vis = false;
  if ('IntersectionObserver' in W) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; if (vis && !D.hidden) start(); else stop(); }).observe(tick);
  else start();
  D.addEventListener('visibilitychange', function () { if (D.hidden) stop(); else if (vis) start(); });
})();
