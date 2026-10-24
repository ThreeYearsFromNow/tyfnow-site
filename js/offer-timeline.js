/* TYFNOW offer-timeline.js: the three working-together terms as a timeline (round 9, 24 Oct 2026).
   A rail runs down the left through each term's dot. As the reader scrolls, the rail fills in ink and each
   term (dot, title, detail) arrives when the fill reaches it; scrolling back up reverses it.
   Reduced motion or no JS: everything shows, rail full. */
(function () {
  'use strict';
  var W = window, D = document, tl = D.getElementById('op-tl');
  if (!tl) return;
  var rail = tl.querySelector('.op-tl-rail'), fill = tl.querySelector('.op-tl-fill');
  var terms = tl.querySelectorAll('.op-term'), dots = tl.querySelectorAll('.op-term .op-dot');
  function place() {
    var t0 = tl.getBoundingClientRect().top, a = dots[0].getBoundingClientRect(), b = dots[dots.length - 1].getBoundingClientRect();
    rail.style.top = (a.top - t0 + a.height / 2) + 'px';
    rail.style.height = (b.top - a.top) + 'px';
  }
  place();
  W.addEventListener('resize', place);
  if (W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  tl.classList.add('is-live');
  var ticking = false;
  function update() {
    ticking = false;
    var line = W.innerHeight * 0.68, r = rail.getBoundingClientRect();
    var p = Math.max(0, Math.min(1, (line - r.top) / Math.max(1, r.height)));
    fill.style.transform = 'scaleY(' + p.toFixed(3) + ')';
    for (var i = 0; i < terms.length; i++) {
      var d = dots[i].getBoundingClientRect(), mid = d.top + d.height / 2;
      if (mid < line - 2) terms[i].classList.add('is-in');
      else if (mid > line + 30) terms[i].classList.remove('is-in'); /* a little give so nothing flickers at the line */
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  W.addEventListener('scroll', onScroll, { passive: true });
  W.addEventListener('resize', onScroll);
  update();
})();
