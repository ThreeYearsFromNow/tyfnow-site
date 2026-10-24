/* TYFNOW offer-head.js (24 Oct 2026): "What working together" starts at the left edge of the screen and
   "looks like" at the right; as the offer section scrolls up they slide in and meet in the middle.
   Scroll-linked, no timers. Reduced motion: the headline just sits together. */
(function () {
  'use strict';
  var W = window, D = document;
  var h = D.querySelector('.op-meet');
  if (!h) return;
  var l = h.querySelector('.op-meet-l'), r = h.querySelector('.op-meet-r');
  if (!l || !r) return;
  if (W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var dl = 0, dr = 0, tick = false;

  /* how far each half has to travel from its screen edge (16px gutter) to its place in the line */
  function measure() {
    l.style.transform = ''; r.style.transform = '';
    var g = 16, a = l.getBoundingClientRect(), b = r.getBoundingClientRect();
    dl = Math.min(0, g - a.left);
    dr = Math.max(0, (D.documentElement.clientWidth - g) - b.right);
    update();
  }
  function ease(k) { return 1 - Math.pow(1 - k, 3); }
  /* 0 when the headline's top reaches the bottom of the screen, 1 when it has climbed 55% of the way up */
  function update() {
    tick = false;
    var vh = W.innerHeight, top = h.getBoundingClientRect().top;
    var p = Math.min(1, Math.max(0, (vh - top) / (vh * 0.55))), k = 1 - ease(p);
    l.style.transform = 'translateX(' + (dl * k).toFixed(1) + 'px)';
    r.style.transform = 'translateX(' + (dr * k).toFixed(1) + 'px)';
  }
  W.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(update); } }, { passive: true });
  W.addEventListener('resize', function () { requestAnimationFrame(measure); });
  if (D.fonts && D.fonts.ready) D.fonts.ready.then(measure); else measure();
  measure();
})();
