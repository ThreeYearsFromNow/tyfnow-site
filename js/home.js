/* TYFNOW home.js: tool pit, steps, reviews, closing CTA, owner lines. */
(function () {
  'use strict';
  var W = window, D = document, T = W.TYFNOW || { track: function () {} };
  var reduced = W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* ---------- tool pit: names drop in as balls, bounce, settle; drag, flick or tap them ---------- */
  (function () {
    var pit = D.getElementById('pit'), box = D.getElementById('pit-in'); if (!pit || !box) return;
    var NAMES = ['ChatGPT','Claude','Gemini','Midjourney','Canva','Adobe Express','Figma','Copilot','Notion','Slack','Monday','Asana','Trello','ClickUp','HubSpot','Salesforce','Pipedrive','Zoho CRM','Mailchimp','Klaviyo','Zapier','Make','Airtable','Webflow','Wix','Squarespace','Shopify','Perplexity','Runway','ElevenLabs','Loom','Framer','Semrush','Instagram','TikTok','YouTube','LinkedIn','Facebook','Threads','Nano Banana'];
    var G = 2000, bodies = [], PW = 0, PH = 0, FL = 0, raf = 0, last = 0, still = 0, dragging = null, hist = [], down = null, off = null;
    var started = false, taps = 0, told = {};
    function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; } return a; }

    function build() {
      PW = pit.clientWidth; PH = pit.clientHeight; FL = PH - 14;
      var phone = PW <= 900, n = PW > 1200 ? 30 : (PW > 900 ? 24 : 15), lo = phone ? 56 : 78, hi = phone ? 76 : 112;
      shuffle(NAMES.slice()).slice(0, n).forEach(function (name, i) {
        var d = Math.round(lo + Math.random() * (hi - lo)), el = D.createElement('div');
        el.className = 'pb b' + (i % 7); el.style.setProperty('--d', d + 'px'); el.textContent = name;
        var b = { el: el, name: name, r: d / 2, m: d * d, x: d / 2 + Math.random() * Math.max(1, PW - d), y: -d, vx: 0, vy: 0, alive: false, inside: false, held: false };
        el._b = b; bodies.push(b); box.appendChild(el);
      });
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
        if (a.y > FL - a.r) { a.y = FL - a.r; a.vy = a.vy > 140 ? -a.vy * .52 : 0; a.vx *= .985; }
      }
      for (var it = 0; it < 3; it++) {
        for (i = 0; i < bodies.length; i++) {
          a = bodies[i]; if (!a.alive) continue;
          for (j = i + 1; j < bodies.length; j++) {
            c = bodies[j]; if (!c.alive) continue;
            var dx = c.x - a.x, dy = c.y - a.y, rr = a.r + c.r, d2 = dx * dx + dy * dy;
            if (d2 >= rr * rr || d2 === 0) continue;
            var d = Math.sqrt(d2), nx = dx / d, ny = dy / d, over = rr - d;
            var ia = a.held ? 0 : 1 / a.m, ic = c.held ? 0 : 1 / c.m, s = ia + ic; if (!s) continue;
            a.x -= nx * over * .8 * ia / s; a.y -= ny * over * .8 * ia / s;
            c.x += nx * over * .8 * ic / s; c.y += ny * over * .8 * ic / s;
            var vn = (c.vx - a.vx) * nx + (c.vy - a.vy) * ny;
            if (vn < 0) {
              var e = vn < -140 ? .45 : 0, jn = -(1 + e) * vn / s;
              a.vx -= jn * nx * ia; a.vy -= jn * ny * ia; c.vx += jn * nx * ic; c.vy += jn * ny * ic;
            }
          }
        }
      }
    }
    function frame(now) {
      raf = 0;
      var dt = Math.min(.034, (now - last) / 1000 || .016); last = now;
      step(dt / 2); step(dt / 2);
      var moving = false;
      bodies.forEach(function (b) {
        if (!b.alive) { moving = true; return; }
        put(b);
        if (b.held || Math.abs(b.vx) + Math.abs(b.vy) > 18 || b.y < b.r - 1) moving = true;
      });
      still = moving ? 0 : still + dt;
      if (still < .8 || dragging) raf = W.requestAnimationFrame(frame);
    }
    function wake() { still = 0; if (!raf) { last = W.performance.now(); raf = W.requestAnimationFrame(frame); } }

    function drop() {
      if (started) return; started = true; T.track('tools_pit_view');
      if (reduced) {
        bodies.forEach(function (b, i) { b.alive = true; b.y = b.r + Math.random() * (PH * .5); b.el.classList.add('on'); });
        for (var k = 0; k < 900; k++) step(1 / 60);
        bodies.forEach(put); return;
      }
      bodies.forEach(function (b, i) {
        W.setTimeout(function () { b.alive = true; b.vx = (Math.random() - .5) * 240; b.vy = Math.random() * 120; b.el.classList.add('on'); put(b); wake(); }, 250 + i * 110);
      });
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
      b.x = Math.min(PW - b.r, Math.max(b.r, p.x + off.x)); b.y = Math.min(FL - b.r, Math.max(b.r, p.y + off.y)); b.inside = true;
      hist.push({ x: p.x, y: p.y, t: p.t }); while (hist.length > 2 && p.t - hist[0].t > 120) hist.shift();
    });
    function release(e, cancelled) {
      if (!dragging) return; var b = dragging, p = pt(e), f = hist[0], dtm = Math.max(16, p.t - f.t);
      var moved = Math.abs(p.x - down.x) + Math.abs(p.y - down.y);
      b.held = false; dragging = null; b.el.classList.remove('grab');
      if (cancelled) { b.vx = b.vy = 0; }
      else if (moved < 8 && p.t - down.t < 400) { b.vy = -850; b.vx = (Math.random() - .5) * 320; }   // a tap pokes it
      else { b.vx = Math.max(-2400, Math.min(2400, (p.x - f.x) / dtm * 1000)); b.vy = Math.max(-2400, Math.min(2400, (p.y - f.y) / dtm * 1000)); }
      wake();
    }
    box.addEventListener('pointerup', function (e) { release(e, false); });
    box.addEventListener('pointercancel', function (e) { release(e, true); });

    build();
    if ('IntersectionObserver' in W) {
      var io = new W.IntersectionObserver(function (es) { if (es.some(function (x) { return x.isIntersecting; })) { io.disconnect(); drop(); } }, { threshold: .35 });
      io.observe(pit);
    } else drop();
    var rw; W.addEventListener('resize', function () { W.clearTimeout(rw); rw = W.setTimeout(function () { PW = pit.clientWidth; PH = pit.clientHeight; FL = PH - 14; bodies.forEach(function (b) { b.x = Math.min(PW - b.r, b.x); b.y = Math.min(FL - b.r, b.y); }); if (started) wake(); }, 150); });
  })();

  /* ---------- three steps: revealed one piece at a time by scroll position, reversible ---------- */
  (function () {
    var list = D.getElementById('steps'); if (!list) return;
    var items = [].slice.call(list.querySelectorAll('.stp'));
    if (reduced) return;
    list.classList.add('armed');
    var closing = D.querySelector('#why-now .gap-line');
    if (closing) closing.classList.add('rv');
    // order: number, text, connector (to the next step), ... then the closing line
    var targets = [];
    items.forEach(function (li, i) {
      ['.n', '.txt', '.cn'].forEach(function (sel) {
        var el = li.querySelector(sel); if (el) targets.push({ el: el, step: i, num: sel === '.n', on: false });
      });
    });
    if (closing) targets.push({ el: closing, step: -1, num: false, on: false });
    var told = {}, ticking = false;
    var update = function () {
      ticking = false;
      var line = W.innerHeight * 0.72, slack = 36, prevOn = true;
      targets.forEach(function (t) {
        var top = t.el.getBoundingClientRect().top;
        var want = prevOn && (t.on ? top < line + slack : top < line);
        if (want !== t.on) {
          t.on = want;
          t.el.classList.toggle('is-in', want);
          if (want && t.num && !told[t.step]) { told[t.step] = 1; T.track('step_' + (t.step + 1)); }
        }
        prevOn = t.on;   // anything after a hidden piece stays hidden, so order holds both ways
      });
    };
    var req = function () { if (!ticking) { ticking = true; W.requestAnimationFrame(update); } };
    W.addEventListener('scroll', req, { passive: true });
    W.addEventListener('resize', req);
    update();
  })();

  /* ---------- Branding, Website, Content: four cards travel sideways as the page scrolls down ---------- */
  (function () {
    var hs = D.getElementById('hs'), track = D.getElementById('hs-track'); if (!hs || !track || reduced) return;
    var prev = D.getElementById('hs-prev'), next = D.getElementById('hs-next'), cards = track.children;
    hs.classList.add('hs-on');
    var ticking = false, maxX = 0, told = false, LO = 0, HI = 1;   // no hold: the page moves on the moment the last card reaches the grid
    var measure = function () {
      var d = D.documentElement.clientWidth, head = hs.querySelector('.hs-head');
      var pad = head ? parseFloat(W.getComputedStyle(head).paddingLeft) || 0 : 0;
      var last = cards[cards.length - 1];
      var contentRight = last.getBoundingClientRect().right - track.getBoundingClientRect().left;   // transform cancels out
      maxX = Math.max(0, Math.round(contentRight - (d - pad)));   // last card lands on the right edge of the grid, level with the arrows
      hs.style.height = Math.round(W.innerHeight + maxX * 1.35 + 40) + 'px';
    };
    var span = function () { var r = hs.getBoundingClientRect(); return { top: r.top + W.pageYOffset, total: r.height - W.innerHeight }; };
    var update = function () {
      ticking = false;
      var r = hs.getBoundingClientRect(), total = r.height - W.innerHeight;
      var p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
      var f = Math.min(1, Math.max(0, (p - LO) / (HI - LO)));
      var x = f * maxX;
      track.style.transform = 'translate3d(' + (-x) + 'px,0,0)';
      prev.disabled = x < 2; next.disabled = x > maxX - 2;
      if (f >= 1 && !told) { told = true; T.track('cards_end'); }
    };
    var go = function (dir) {
      var s = span(), step = cards[1].offsetLeft - cards[0].offsetLeft;
      var f = Math.min(1, Math.max(0, (-hs.getBoundingClientRect().top / s.total - LO) / (HI - LO)));
      var x = Math.min(maxX, Math.max(0, Math.round((f * maxX) / step + dir) * step));
      var tf = maxX ? x / maxX : 0;
      W.scrollTo({ top: s.top + (LO + tf * (HI - LO)) * s.total + 1, behavior: 'smooth' });
    };
    prev.addEventListener('click', function () { go(-1); });
    next.addEventListener('click', function () { go(1); });
    var req = function () { if (!ticking) { ticking = true; W.requestAnimationFrame(update); } };
    W.addEventListener('scroll', req, { passive: true });
    W.addEventListener('resize', function () { measure(); req(); });
    W.addEventListener('load', function () { measure(); req(); });
    measure(); update();
  })();

  /* ---------- likes tile: the counter climbs, holds, starts again (JS, so every browser behaves the same) ---------- */
  (function () {
    var el = D.querySelector('.likes .cnt'); if (!el || reduced) return;
    var FROM = 12, TO = 2480, UP = 4200, HOLD = 1800, t0 = 0, raf = 0, on = false;
    var fmt = function (n) { return Math.round(n).toLocaleString('en-GB'); };
    var tick = function (now) {
      if (!on) { raf = 0; return; }
      if (!t0) t0 = now;
      var e = now - t0, p = Math.min(1, e / UP), eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(FROM + (TO - FROM) * eased);
      if (e > UP + HOLD) t0 = now;
      raf = W.requestAnimationFrame(tick);
    };
    var start = function () { if (on) return; on = true; t0 = 0; if (!raf) raf = W.requestAnimationFrame(tick); };
    var stop = function () { on = false; };
    if ('IntersectionObserver' in W) {
      new W.IntersectionObserver(function (es) { es.forEach(function (x) { x.isIntersecting ? start() : stop(); }); }, { threshold: 0.3 }).observe(el);
    } else start();
  })();

  /* ---------- reviews ---------- */
  var reviews = D.querySelectorAll('.review'), dots = D.querySelectorAll('.dots button');
  if (reviews.length) {
    var cur = 0, rt = null;
    function showR(i) {
      cur = i;
      reviews.forEach(function (r, k) { r.classList.toggle('on', k === i); });
      dots.forEach(function (d, k) { d.setAttribute('aria-current', k === i ? 'true' : 'false'); });
    }
    dots.forEach(function (d, k) { d.addEventListener('click', function () { if (rt) W.clearInterval(rt); rt = null; showR(k); }); });
    showR(0);
    if (!reduced) rt = W.setInterval(function () { showR((cur + 1) % reviews.length); }, 5000);
  }

  /* ---------- closing CTA ---------- */
  var f = D.getElementById('cta-form');
  if (f) f.addEventListener('submit', function () { T.track('closing_email_submit'); });

  // Owner lines carousel
  (function () {
    var row = document.getElementById('qrow'); if (!row) return;
    var step = function () { var c = row.querySelector('.qcard'); return c ? c.getBoundingClientRect().width + 20 : 320; };
    document.querySelectorAll('.qbtn').forEach(function (b) {
      b.addEventListener('click', function () {
        var d = +b.getAttribute('data-dir');
        var max = row.scrollWidth - row.clientWidth;
        var next = row.scrollLeft + d * step();
        if (next > max + 2) next = 0; else if (next < -2) next = max;
        row.scrollTo({ left: next, behavior: 'smooth' });
        T.track('owner_lines_' + (d > 0 ? 'next' : 'prev'));
      });
    });
  })();
})();
