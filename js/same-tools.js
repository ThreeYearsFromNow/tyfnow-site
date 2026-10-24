/* TYFNOW same-tools.js: section 3 motion (round 9, 24 Oct 2026).
   "Same ___." : AI, templates and beige take turns, each rolling up into place.
   "Run a business" grows into "Run a brand whilst others run a business" once the line is on screen.
   Screen readers get both lines in full. Reduced motion or no JS: both lines read in full, still. */
(function () {
  'use strict';
  var W = window, D = document;
  if (W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var rot = D.getElementById('st-rot'), grow = D.getElementById('st-grow');
  if (!rot || !grow || !('IntersectionObserver' in W)) return;

  /* rotating word */
  var words = rot.querySelectorAll('.st-w'), i = 0, timer = 0;
  rot.classList.add('is-live');
  function fit() { rot.style.width = Math.ceil(words[i].getBoundingClientRect().width) + 'px'; }
  function next() {
    var cur = words[i]; i = (i + 1) % words.length;
    var nw = words[i];
    nw.classList.remove('is-out');
    cur.classList.remove('is-on'); cur.classList.add('is-out');
    nw.classList.add('is-on'); fit();
    setTimeout(function () { cur.classList.remove('is-out'); }, 500);
  }
  fit();
  W.addEventListener('resize', fit);

  /* growing line: measured at its full width, then opened from nothing */
  var gin = grow.querySelector('.st-gin'), opened = false;
  grow.classList.add('is-live');
  function open() {
    if (opened) return; opened = true;
    grow.style.width = Math.ceil(gin.getBoundingClientRect().width) + 'px';
    grow.classList.add('is-open');
    /* once open, let the line wrap normally again */
    setTimeout(function () { grow.classList.remove('is-live', 'is-open'); grow.style.width = ''; }, 1300);
  }

  var sec = D.getElementById('problem');
  new IntersectionObserver(function (es) {
    var on = es[0].isIntersecting && !D.hidden;
    clearInterval(timer);
    if (on) timer = setInterval(next, 2200);
  }, { threshold: 0.2 }).observe(sec);
  new IntersectionObserver(function (es, ob) {
    if (es[0].isIntersecting) { setTimeout(open, 700); ob.disconnect(); }
  }, { threshold: 1 }).observe(grow.parentNode);
})();
