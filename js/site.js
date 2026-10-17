/* TYFNOW site.js: storage, dates, banner, exit message, cookie notice, analytics, menu. */
(function () {
  'use strict';
  var W = window, D = document;

  /* ---------- storage (always guarded) ---------- */
  var store = {
    get: function (k) { try { return W.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { W.localStorage.setItem(k, v); } catch (e) {} },
    del: function (k) { try { W.localStorage.removeItem(k); } catch (e) {} },
    sget: function (k) { try { return W.sessionStorage.getItem(k); } catch (e) { return null; } },
    sset: function (k, v) { try { W.sessionStorage.setItem(k, v); } catch (e) {} }
  };
  var goals = function () { try { return JSON.parse(store.get('tyfnow_goals') || 'null'); } catch (e) { return null; } };

  /* ---------- dates ---------- */
  var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  function addYears(d, n) {
    var y = d.getFullYear() + n, m = d.getMonth(), day = d.getDate();
    if (m === 1 && day === 29) { m = 2; day = 1; } /* leap day: 29 Feb + N years → 1 Mar */
    return new Date(y, m, day);
  }
  function fmt(d) { return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); }
  function iso(d) { var p = function (n) { return (n < 10 ? '0' : '') + n; }; return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); }

  /* ---------- analytics (consent-gated, events only) ---------- */
  var gaId = (D.documentElement.getAttribute('data-ga') || '').trim();
  var consent = store.get('tyfnow_cookies'); /* 'yes' | 'no' | null */
  function loadGA() {
    if (!gaId || W.__tyfnowGA) return;
    W.__tyfnowGA = true;
    W.dataLayer = W.dataLayer || [];
    W.gtag = function () { W.dataLayer.push(arguments); };
    W.gtag('js', new Date());
    W.gtag('config', gaId, { anonymize_ip: true, allow_google_signals: false, allow_ad_personalization_signals: false });
    var s = D.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(gaId);
    D.head.appendChild(s);
  }
  function track(name, params) {
    if (consent === 'yes' && W.gtag) { try { W.gtag('event', name, params || {}); } catch (e) {} }
  }
  if (consent === 'yes') loadGA();

  /* ---------- cookie notice ---------- */
  function cookieNotice() {
    var el = D.getElementById('cookie');
    if (!el || consent || !gaId) return;
    el.classList.add('show');
    el.querySelector('[data-accept]').addEventListener('click', function () { consent = 'yes'; store.set('tyfnow_cookies', 'yes'); el.classList.remove('show'); loadGA(); });
    el.querySelector('[data-decline]').addEventListener('click', function () { consent = 'no'; store.set('tyfnow_cookies', 'no'); el.classList.remove('show'); });
  }

  /* ---------- banner: skipped or side door ---------- */
  function banner() {
    var el = D.getElementById('banner');
    if (!el) return;
    var state = store.get('tyfnow_gate');
    var isHome = D.body.hasAttribute('data-home');
    var show = state === 'skipped' || (!state && !isHome);
    if (!state && !isHome) track('deep_link_entry');
    if (!show || store.sget('tyfnow_banner_dismissed')) return;
    el.classList.add('show');
    track('banner_view');
    el.querySelector('[data-answer]').addEventListener('click', function () { track('banner_click'); });
    el.querySelector('[data-close]').addEventListener('click', function () { el.classList.remove('show'); store.sset('tyfnow_banner_dismissed', '1'); track('banner_dismiss'); });
  }

  /* ---------- exit message: once per visitor ---------- */
  function exitMessage() {
    var el = D.getElementById('exit');
    if (!el) return;
    var fired = false;
    function open() {
      if (fired || store.get('tyfnow_exit_shown')) return;
      if (D.documentElement.classList.contains('gate-pending')) return; /* never over the gate */
      fired = true; store.set('tyfnow_exit_shown', '1');
      var g = goals(), state = store.get('tyfnow_gate');
      var answered = state === 'answered' && g;
      el.querySelector('[data-answered]').hidden = !answered;
      el.querySelector('[data-skipped]').hidden = !!answered;
      if (answered) {
        el.querySelector('[data-date]').textContent = fmt(addYears(new Date(g.entry), 3));
        el.querySelector('[data-email-line]').hidden = !g.emailed;
      }
      el.classList.add('on');
      trapFocus(el);
      track('exit_view');
    }
    el.querySelectorAll('[data-close]').forEach(function (b) { b.addEventListener('click', function () { el.classList.remove('on'); track('exit_close'); }); });
    var wn = el.querySelector('[data-write-now]'); if (wn) wn.addEventListener('click', function () { track('exit_write_now'); });
    el.addEventListener('click', function (e) { if (e.target === el) { el.classList.remove('on'); } });
    D.addEventListener('keydown', function (e) { if (e.key === 'Escape' && el.classList.contains('on')) el.classList.remove('on'); });
    D.addEventListener('visibilitychange', function () { if (D.visibilityState === 'hidden') open(); });
    W.addEventListener('beforeunload', function () { open(); });
    /* mobile fallback: after the contact page, or five minutes idle */
    if (D.body.hasAttribute('data-contact')) { W.setTimeout(open, 20000); }
    var idle = W.setTimeout(open, 5 * 60 * 1000);
    ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach(function (ev) {
      D.addEventListener(ev, function () { W.clearTimeout(idle); idle = W.setTimeout(open, 5 * 60 * 1000); }, { passive: true });
    });
  }

  /* ---------- focus trap ---------- */
  function trapFocus(container) {
    var f = container.querySelectorAll('a[href],button:not([disabled]),input,textarea,[tabindex]:not([tabindex="-1"])');
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    first.focus();
    container.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey && D.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && D.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ---------- mobile menu ---------- */
  function menu() {
    var b = D.querySelector('.menu-btn'), n = D.querySelector('.site-header nav');
    if (!b || !n) return;
    b.addEventListener('click', function () {
      var open = n.classList.toggle('open');
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      b.textContent = open ? 'Close' : 'Menu';
    });
  }

  /* ---------- "You said" lines ---------- */
  function youSaid() {
    var g = goals();
    D.querySelectorAll('[data-you-said]').forEach(function (el) {
      if (g && g.work && store.get('tyfnow_gate') === 'answered') {
        el.querySelector('[data-work]').textContent = g.work;
        el.hidden = false;
      }
    });
  }

  W.TYFNOW = { store: store, goals: goals, addYears: addYears, fmt: fmt, iso: iso, track: track, trapFocus: trapFocus };

  D.addEventListener('DOMContentLoaded', function () {
    cookieNotice(); banner(); exitMessage(); menu(); youSaid();
    D.querySelectorAll('[data-track]').forEach(function (el) {
      el.addEventListener('click', function () { track(el.getAttribute('data-track')); });
    });
  });
})();
