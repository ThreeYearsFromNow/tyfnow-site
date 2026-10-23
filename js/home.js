/* TYFNOW home.js: the tools ball pit, inside the "The tools" box.
   Tool-name balls fall in and bounce around the box; drag, flick or tap them.
   Falls back to a still pile under reduced motion. 23 Oct 2026. */
(function () {
  'use strict';
  var W = window, D = document, T = W.TYFNOW || { track: function () {} };
  var reduced = W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var pit = D.getElementById('tools-pit'), box = D.getElementById('tools-pit-in');
  if (!pit || !box) return;
  var label = pit.parentNode.querySelector('.rbox-label');

  var NAMES = ['ChatGPT','Claude','Gemini','Canva','Figma','Notion','Slack','Monday','Asana','Trello','HubSpot','Salesforce','Mailchimp','Klaviyo','Zapier','Make','Airtable','Webflow','Semrush','Buffer','Typeform','Calendly','Stripe','Perplexity','Loom','Framer','Descript'];

  var G = 1900, bodies = [], PW = 0, PH = 0, rect = null;
  var raf = 0, last = 0, still = 0, dragging = null, hist = [], down = null, off = null;
  var viewed = false, taps = 0, told = {}, timers = [];
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; } return a; }

  function geometry() {
    PW = pit.clientWidth; PH = pit.clientHeight; rect = null;
    if (label) {
      var pr = pit.getBoundingClientRect(), lr = label.getBoundingClientRect(), m = 12;
      rect = { x: lr.left - pr.left - m, y: lr.top - pr.top - m, w: lr.width + 2 * m, h: lr.height + 2 * m };
    }
  }
  /* keep balls off the label (top-left), pushing them down or sideways, never up */
  function clearRect(b) {
    if (!rect) return;
    var x0 = rect.x - b.r, x1 = rect.x + rect.w + b.r, y0 = rect.y - b.r, y1 = rect.y + rect.h + b.r;
    if (b.x > x0 && b.x < x1 && b.y > y0 && b.y < y1) {
      var dl = b.x - x0, dr = x1 - b.x, db = y1 - b.y, mn = Math.min(dl, dr, db);
      if (mn === db) { b.y = y1; if (b.vy < 0) b.vy = -b.vy * .4; }
      else if (mn === dl) { b.x = x0; if (b.vx > 0) b.vx = -b.vx * .4; }
      else { b.x = x1; if (b.vx < 0) b.vx = -b.vx * .4; }
    }
  }
  function build() {
    bodies.forEach(function (b) { b.el.remove(); }); bodies = [];
    timers.forEach(W.clearTimeout); timers = [];
    geometry();
    var phone = PW <= 560, lo = phone ? 36 : 46, hi = phone ? 56 : 76;
    var n = phone ? 12 : (PW > 1000 ? 24 : 18);
    var names = shuffle(NAMES.slice());
    for (var k = 0; k < n; k++) {
      var d = Math.round(lo + Math.random() * (hi - lo)), el = D.createElement('div');
      el.className = 'pb b' + (k % 7); el.style.setProperty('--d', d + 'px'); el.textContent = names[k % names.length];
      var b = { el: el, name: names[k % names.length], r: d / 2, m: d * d, x: 0, y: -d, vx: 0, vy: 0, alive: false, inside: false, held: false };
      b.x = b.r + Math.random() * Math.max(1, PW - 2 * b.r); el._b = b; bodies.push(b); box.appendChild(el);
    }
  }
  function put(b) { b.el.style.transform = 'translate3d(' + (b.x - b.r).toFixed(1) + 'px,' + (b.y - b.r).toFixed(1) + 'px,0)'; }

  function step(h) {
    var i, j, a, c;
    for (i = 0; i < bodies.length; i++) {
      a = bodies[i]; if (!a.alive || a.held) continue;
      a.vy += G * h; a.x += a.vx * h; a.y += a.vy * h;
      if (a.x < a.r) { a.x = a.r; a.vx = Math.abs(a.vx) * .5; }
      if (a.x > PW - a.r) { a.x = PW - a.r; a.vx = -Math.abs(a.vx) * .5; }
      if (a.y >= a.r) a.inside = true;
      if (a.inside && a.y < a.r) { a.y = a.r; a.vy = Math.abs(a.vy) * .5; }
      if (a.y > PH - a.r) { a.y = PH - a.r; a.vy = a.vy > 130 ? -a.vy * .5 : 0; a.vx *= .985; }
      clearRect(a);
    }
    for (var it = 0; it < 3; it++) {
      for (i = 0; i < bodies.length; i++) {
        a = bodies[i]; if (!a.alive) continue;
        for (j = i + 1; j < bodies.length; j++) {
          c = bodies[j]; if (!c.alive) continue;
          var dx = c.x - a.x, dy = c.y - a.y, rr = a.r + c.r, d2 = dx * dx + dy * dy;
          if (d2 >= rr * rr || d2 === 0) continue;
          var d = Math.sqrt(d2), nx = dx / d, ny = dy / d, ov = rr - d;
          var ia = a.held ? 0 : 1 / a.m, ic = c.held ? 0 : 1 / c.m, s = ia + ic; if (!s) continue;
          a.x -= nx * ov * .8 * ia / s; a.y -= ny * ov * .8 * ia / s;
          c.x += nx * ov * .8 * ic / s; c.y += ny * ov * .8 * ic / s;
          var vn = (c.vx - a.vx) * nx + (c.vy - a.vy) * ny;
          if (vn < 0) { var e = vn < -130 ? .4 : 0, jn = -(1 + e) * vn / s; a.vx -= jn * nx * ia; a.vy -= jn * ny * ia; c.vx += jn * nx * ic; c.vy += jn * ny * ic; }
        }
      }
      for (i = 0; i < bodies.length; i++) { a = bodies[i]; if (a.alive && !a.held) { clearRect(a); if (a.x < a.r) a.x = a.r; if (a.x > PW - a.r) a.x = PW - a.r; if (a.y > PH - a.r) a.y = PH - a.r; } }
    }
  }
  function frame(now) {
    raf = 0;
    var dt = Math.min(.034, (now - last) / 1000 || .016); last = now;
    step(dt / 2); step(dt / 2);
    var moving = false;
    bodies.forEach(function (b) { if (!b.alive) return; put(b); if (b.held || Math.abs(b.vx) + Math.abs(b.vy) > 16 || b.y < b.r - 1) moving = true; });
    still = moving ? 0 : still + dt;
    if (still < .8 || dragging) raf = W.requestAnimationFrame(frame);
  }
  function wake() { still = 0; if (!raf) { last = W.performance.now(); raf = W.requestAnimationFrame(frame); } }
  function viewOnce() { if (!viewed) { viewed = true; T.track('tools_pit_view'); } }

  function release(b) {
    b.alive = true; b.el.classList.add('on', 'pop');
    b.vx = (Math.random() - .5) * 180; b.vy = 40 + Math.random() * 100;
    put(b); viewOnce(); wake();
  }
  function startView() {
    if (reduced) { settleNow(); return; }
    bodies.forEach(function (b, i) { timers.push(W.setTimeout(function () { release(b); }, 120 + i * 80)); });
  }
  function settleNow() {
    bodies.forEach(function (b) { b.alive = true; b.y = b.r + Math.random() * (PH * .5); b.el.classList.add('on'); });
    for (var k = 0; k < 800; k++) step(1 / 60);
    bodies.forEach(put);
  }

  function note(mode, b) {
    taps++;
    if (!told.first) { told.first = 1; T.track('tools_pit_interact', { mode: mode, tool: b.name }); }
    if (taps === 5 && !told.engaged) { told.engaged = 1; T.track('tools_pit_engaged'); }
  }
  function pt(e) { var r = pit.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, t: W.performance.now() }; }
  box.addEventListener('pointerdown', function (e) {
    var el = e.target.closest && e.target.closest('.pb'); if (!el || !el._b) return;
    var b = el._b, p = pt(e); dragging = b; b.held = true; b.vx = b.vy = 0; down = p; off = { x: b.x - p.x, y: b.y - p.y }; hist = [{ x: p.x, y: p.y, t: p.t }];
    el.classList.add('grab'); try { el.setPointerCapture(e.pointerId); } catch (x) {} note('grab', b); wake();
  });
  box.addEventListener('pointermove', function (e) {
    if (!dragging) return; var b = dragging, p = pt(e);
    b.x = Math.min(PW - b.r, Math.max(b.r, p.x + off.x)); b.y = Math.min(PH - b.r, Math.max(b.r, p.y + off.y)); b.inside = true; clearRect(b);
    hist.push({ x: p.x, y: p.y, t: p.t }); while (hist.length > 2 && p.t - hist[0].t > 120) hist.shift();
  });
  function letGo(e, cancelled) {
    if (!dragging) return; var b = dragging, p = pt(e), f = hist[0], dtm = Math.max(16, p.t - f.t);
    var moved = Math.abs(p.x - down.x) + Math.abs(p.y - down.y);
    b.held = false; dragging = null; b.el.classList.remove('grab');
    if (cancelled) { b.vx = b.vy = 0; }
    else if (moved < 8 && p.t - down.t < 400) { b.vy = -700; b.vx = (Math.random() - .5) * 280; }
    else { b.vx = Math.max(-2200, Math.min(2200, (p.x - f.x) / dtm * 1000)); b.vy = Math.max(-2200, Math.min(2200, (p.y - f.y) / dtm * 1000)); }
    wake();
  }
  box.addEventListener('pointerup', function (e) { letGo(e, false); });
  box.addEventListener('pointercancel', function (e) { letGo(e, true); });

  function boot() {
    build();
    if (reduced) { settleNow(); return; }
    if ('IntersectionObserver' in W) {
      var io = new W.IntersectionObserver(function (es) { if (es.some(function (x) { return x.isIntersecting; })) { io.disconnect(); startView(); } }, { threshold: .25 });
      io.observe(pit);
    } else startView();
  }
  var rw, w0 = W.innerWidth;
  W.addEventListener('resize', function () { W.clearTimeout(rw); rw = W.setTimeout(function () { if (Math.abs(W.innerWidth - w0) > 60) { w0 = W.innerWidth; boot(); } else { geometry(); wake(); } }, 200); });
  W.addEventListener('load', function () { geometry(); wake(); });
  boot();
})();
