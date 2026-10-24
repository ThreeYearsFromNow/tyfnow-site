/* TYFNOW v06.js: mobile menu for the shared header. Analytics, cookies and tracking stay in site.js. 23 Oct 2026. */
(function () {
  'use strict';
  var btn = document.querySelector('.hdr-menu'), menu = document.getElementById('hdr-mob');
  if (!btn || !menu) return;
  function set(open, focusBtn) {
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.textContent = open ? 'Close' : 'Menu';
    menu.hidden = !open;
    if (open) { var f = menu.querySelector('a'); if (f) f.focus(); }
    else if (focusBtn) { btn.focus(); }
  }
  btn.addEventListener('click', function () { set(menu.hidden, false); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) set(false, false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) set(false, true); });
  document.addEventListener('click', function (e) {
    if (!menu.hidden && !menu.contains(e.target) && e.target !== btn) set(false, false);
  });
  if (window.matchMedia) {
    var mq = window.matchMedia('(min-width:761px)');
    var onChange = function (m) { if (m.matches) set(false, false); };
    if (mq.addEventListener) mq.addEventListener('change', onChange); else if (mq.addListener) mq.addListener(onChange);
  }
})();

/* One-page site (24 Oct 2026): the nav link for the section in view is marked active,
   and links to #contact put the cursor in the Name field on pointer devices. */
(function () {
  'use strict';
  var D = document, W = window;
  if (!D.body.hasAttribute('data-home')) return;
  var links = Array.prototype.slice.call(D.querySelectorAll('.hdr-link[href^="/#"]'));
  var ids = ['how-we-work', 'work', 'contact'];
  function mark(id) {
    links.forEach(function (a) {
      var on = a.getAttribute('href') === '/#' + id;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
    });
  }
  if ('IntersectionObserver' in W) {
    var seen = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { seen[e.target.id] = e.isIntersecting; });
      var cur = null;
      ids.forEach(function (id) { if (seen[id]) cur = id; });
      mark(cur);
    }, { rootMargin: '-45% 0px -50% 0px' });
    ids.forEach(function (id) { var el = D.getElementById(id); if (el) io.observe(el); });
  }
  var name = D.getElementById('c-name');
  var fine = W.matchMedia && W.matchMedia('(pointer:fine)').matches;
  D.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href="#contact"],a[href="/#contact"]');
    if (!a || !name || !fine) return;
    setTimeout(function () { try { name.focus({ preventScroll: true }); } catch (x) { name.focus(); } }, 700);
  });
})();
