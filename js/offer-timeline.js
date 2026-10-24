/* TYFNOW offer-timeline.js: "What working together looks like" as a centred timeline (round 9, 24 Oct 2026).
   Order, one piece at a time as the reader scrolls: dot, title, detail, the line down to the next dot, and so on;
   the last line runs down into the values sentence, which arrives last.
   Each piece shows once its top passes 72% of the screen and hides again, in reverse, on the way back up.
   Reduced motion or no JS: everything shows. */
(function () {
  'use strict';
  var W = window, D = document, tl = D.getElementById('op-tl');
  if (!tl || (W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
  var host = tl.parentNode, parts = host.querySelectorAll('.op-tl-p'); /* the steps, then the line into the values, then the values */
  host.classList.add('op-tl-live');
  var ticking = false;
  function update() {
    ticking = false;
    var line = W.innerHeight * 0.72;
    var i, top;
    for (i = 0; i < parts.length; i++) { /* down: show in order */
      top = parts[i].getBoundingClientRect().top;
      if (top < line && (i === 0 || parts[i - 1].classList.contains('is-in'))) parts[i].classList.add('is-in');
    }
    for (i = parts.length - 1; i >= 0; i--) { /* up: hide in reverse, with a little give so nothing flickers at the line */
      top = parts[i].getBoundingClientRect().top;
      if (top > line + 36 && (i === parts.length - 1 || !parts[i + 1].classList.contains('is-in'))) parts[i].classList.remove('is-in');
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  W.addEventListener('scroll', onScroll, { passive: true });
  W.addEventListener('resize', onScroll);
  update();
})();
