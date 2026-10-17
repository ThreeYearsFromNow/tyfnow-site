/* TYFNOW gate.js: gate v2. Quote typewriter, one field, email step, skip interrupt, terms drawer. */
(function () {
  'use strict';
  var W = window, D = document, T = W.TYFNOW;
  var html = D.documentElement;
  var gate = D.getElementById('gate');
  if (!gate || !T) return;

  var state = T.store.get('tyfnow_gate');
  var force = /[?&]gate=1/.test(W.location.search);
  if (state && !force) { html.classList.remove('gate-pending'); return; }
  html.classList.add('gate-pending');

  var reduced = W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var now = new Date();
  var screens = { s1: D.getElementById('gate-s1'), s1b: D.getElementById('gate-s1b'), s2: D.getElementById('gate-s2') };
  var work = D.getElementById('work');
  var hold = D.getElementById('hold');

  /* dates */
  D.querySelectorAll('[data-three-years]').forEach(function (el) { el.textContent = T.fmt(T.addYears(now, 3)); });
  [1, 2, 3].forEach(function (n) { D.querySelectorAll('[data-year-' + n + ']').forEach(function (el) { el.textContent = T.fmt(T.addYears(now, n)); }); });

  function show(name) {
    Object.keys(screens).forEach(function (k) { screens[k].classList.toggle('on', k === name); });
    gate.scrollTop = 0;
    var first = screens[name].querySelector('textarea,input:not([type=hidden]),button');
    if (first && !(name === 's1' && W.innerWidth < 900)) first.focus();
  }
  function openSite() {
    html.classList.remove('gate-pending');
    gate.style.display = 'none';
    if (force) { try { W.history.replaceState(null, '', W.location.pathname); } catch (e) {} }
    D.dispatchEvent(new Event('tyfnow:gate-closed'));
  }

  /* ---------- quotes ---------- */
  var FALLBACK = [["Write it down. Make it real.", "TYFNOW"]];
  var quoteEl = D.getElementById('quote'), authorEl = D.getElementById('quote-author'), caret = D.getElementById('caret'), countEl = D.getElementById('quote-count');
  var srEl = D.getElementById('quote-sr');
  var quotes = FALLBACK, i = 0, n = 0, timer = null, holdTicks = 0;

  function paint() {
    var q = quotes[i], done = n >= q[0].length;
    quoteEl.textContent = q[0].slice(0, n);
    authorEl.textContent = done ? q[1] : '';
    caret.classList.toggle('off', done);
    if (countEl) countEl.textContent = (i + 1) + ' / ' + quotes.length;
    srEl.textContent = q[0] + ' ' + q[1];
  }
  function tick() {
    var q = quotes[i];
    if (n < q[0].length) { n++; holdTicks = 0; }
    else if (holdTicks < 70) { holdTicks++; }
    else { go(1); return; }
    paint();
  }
  function go(d) { i = (i + d + quotes.length) % quotes.length; n = reduced ? quotes[i][0].length : 0; holdTicks = 0; paint(); }
  function again() { n = reduced ? quotes[i][0].length : 0; holdTicks = 0; paint(); }
  function start() {
    i = Math.floor(Math.random() * quotes.length);
    n = reduced ? quotes[i][0].length : 0;
    paint();
    if (!reduced) timer = W.setInterval(tick, 45);
  }
  D.getElementById('q-prev').addEventListener('click', function () { go(-1); });
  D.getElementById('q-next').addEventListener('click', function () { go(1); });
  D.getElementById('q-again').addEventListener('click', again);

  fetch('/js/quotes.json', { cache: 'force-cache' }).then(function (r) { return r.ok ? r.json() : FALLBACK; })
    .then(function (q) { if (Array.isArray(q) && q.length) quotes = q; start(); })
    .catch(function () { start(); });

  /* ---------- field and button ---------- */
  function check() { hold.disabled = !work.value.trim(); }
  work.addEventListener('input', check); check();

  var saved = T.goals();
  if (saved && saved.work) { work.value = saved.work; check(); }

  hold.addEventListener('click', function () {
    var text = work.value.trim();
    if (!text) return;
    var entry = T.iso(now);
    T.store.set('tyfnow_goals', JSON.stringify({ work: text, entry: entry, emailed: false }));
    T.store.set('tyfnow_gate', 'answered');
    T.track('gate_submit');
    if (timer) W.clearInterval(timer);
    show('s1b');
  });

  /* ---------- screen 1b: email ---------- */
  var email = D.getElementById('gate-email'), consentBox = D.getElementById('gate-consent'), send = D.getElementById('gate-send'), note = D.getElementById('gate-note');
  function checkSend() { send.disabled = !(email.validity.valid && email.value && consentBox.checked); }
  email.addEventListener('input', checkSend); consentBox.addEventListener('change', checkSend); checkSend();

  D.getElementById('gate-nothanks').addEventListener('click', function () { T.track('email_skip'); openSite(); });

  send.addEventListener('click', function () {
    var g = T.goals() || {};
    var body = new URLSearchParams({
      'form-name': 'gate-goals',
      'work': g.work || '',
      'email': email.value.trim(),
      'consent': 'yes',
      'entry-date': g.entry || T.iso(now),
      'three-years': T.iso(T.addYears(now, 3)),
      'website': D.getElementById('gate-hp').value
    });
    send.disabled = true; note.textContent = '';
    fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() })
      .then(function (r) {
        if (!r.ok) throw new Error('bad');
        g.emailed = true; T.store.set('tyfnow_goals', JSON.stringify(g));
        T.track('email_submit'); openSite();
      })
      .catch(function () { T.track('email_fail'); send.disabled = false; note.textContent = "That didn't send. Try again, or just go in."; });
  });

  /* ---------- skip and interrupt ---------- */
  D.getElementById('skip').addEventListener('click', function () { T.track('gate_skip'); T.track('interrupt_view'); show('s2'); });
  D.getElementById('s2-back').addEventListener('click', function () { T.track('interrupt_return'); show('s1'); });
  D.getElementById('s2-skip').addEventListener('click', function () {
    T.store.set('tyfnow_gate', 'skipped');
    T.track('interrupt_skip');
    openSite();
    var b = D.getElementById('banner'); if (b) { b.classList.add('show'); }
  });

  /* ---------- terms drawer ---------- */
  var tOverlay = D.getElementById('gate-terms'), tOpen = D.getElementById('terms-open');
  function closeTerms() { tOverlay.classList.remove('on'); }
  tOpen.addEventListener('click', function (e) { e.preventDefault(); tOverlay.classList.add('on'); T.trapFocus(tOverlay); T.track('terms_open'); });
  D.getElementById('terms-accept').addEventListener('click', function () { closeTerms(); work.focus(); });
  D.getElementById('terms-later').addEventListener('click', function () { closeTerms(); tOpen.focus(); });
  tOverlay.addEventListener('click', function (e) { if (e.target === tOverlay) closeTerms(); });
  D.addEventListener('keydown', function (e) { if (e.key === 'Escape' && tOverlay.classList.contains('on')) closeTerms(); });

  show('s1');
  T.track('gate_view');
})();
