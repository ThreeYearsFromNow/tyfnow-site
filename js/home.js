/* TYFNOW home.js: the routes carousel. Arrows step one card; native scroll/swipe
   handles touch and trackpad; no JS = a plain horizontal scroll strip. 23 Oct 2026. */
(function () {
  'use strict';
  var W = window, D = document, T = W.TYFNOW || { track: function () {} };

  var track = D.getElementById('routes-track'),
      prev = D.getElementById('routes-prev'),
      next = D.getElementById('routes-next');
  if (!track) return;

  function stepWidth() {
    var cards = track.querySelectorAll('.rcard');
    if (cards.length < 2) return cards.length ? cards[0].getBoundingClientRect().width + 24 : 320;
    return cards[1].getBoundingClientRect().left - cards[0].getBoundingClientRect().left;
  }
  function maxScroll() { return track.scrollWidth - track.clientWidth; }

  var ticking = false;
  function sync() {
    ticking = false;
    if (!prev || !next) return;
    var x = track.scrollLeft, max = maxScroll();
    prev.disabled = x <= 2;
    next.disabled = x >= max - 2;
  }
  function req() { if (!ticking) { ticking = true; W.requestAnimationFrame(sync); } }

  function go(dir) {
    track.scrollBy({ left: dir * stepWidth(), behavior: 'smooth' });
    T.track('routes_carousel_' + (dir > 0 ? 'next' : 'prev'));
  }
  if (prev) prev.addEventListener('click', function () { go(-1); });
  if (next) next.addEventListener('click', function () { go(1); });

  track.addEventListener('scroll', req, { passive: true });
  W.addEventListener('resize', req);
  W.addEventListener('load', req);
  sync();
})();
