/* TYFNOW site.js: storage, dates, cookie notice, analytics, menu. Gate, toast and exit message removed 18 Oct 2026 (F37); gate.js parked. */
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
    cookieNotice(); menu(); youSaid();
    D.querySelectorAll('[data-track]').forEach(function (el) {
      el.addEventListener('click', function () { track(el.getAttribute('data-track')); });
    });
  });
})();
