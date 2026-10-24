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
