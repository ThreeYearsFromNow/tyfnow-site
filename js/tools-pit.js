/* TYFNOW tools-pit.js: section 3 on Home, "Your competitors have the same tools as you" (F174, reworked F182).
   Tool balls drop across the whole section and pile up around the text, which acts as a solid block so it is
   never covered. When the section is full they hold, the floor gives way, they fall out and it starts again.
   Runs only while on screen, pauses in background tabs, and shows nothing when reduced motion is on or JS is off.
   Logos: drop an official SVG at /img/tools/<slug>.svg and add the slug to LOGOS; the ball then shows the logo.
   We do not draw brand marks ourselves. 24 Oct 2026. */
(function () {
  'use strict';
  var pit = document.querySelector('.pit-section');
  var text = document.querySelector('.same-tools-text');
  if (!pit || !text || !window.requestAnimationFrame) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var NAMES = ['ChatGPT', 'Canva', 'HubSpot', 'Mailchimp', 'Notion', 'Zapier', 'Slack', 'Trello', 'Asana', 'Hootsuite',
    'Buffer', 'Squarespace', 'Wix', 'Shopify', 'Calendly', 'Typeform', 'Xero', 'Semrush', 'Google Analytics', 'Meta Ads',
    'Klaviyo', 'Airtable', 'Miro', 'Figma', 'Loom', 'Grammarly', 'Monday', 'ClickUp', 'Pipedrive', 'Gamma', 'Lovable',
    'Descript', 'Jasper', 'Later', 'Stripe', 'Claude', 'Gemini', 'Copilot', 'Midjourney', 'Perplexity', 'CapCut',
    'Linktree', 'Webflow', 'WordPress', 'Zoom', 'Teams', 'Dropbox', 'Sprout Social', 'ActiveCampaign', 'Pipedream'];
  var LOGOS = {}; /* e.g. { canva: true } once /img/tools/canva.svg exists */
  var TONES = ['t-white', 't-white', 't-white', 't-lilac', 't-mint', 't-peach', 't-lime', 't-ink'];

  var balls = [], W = 0, H = 0, block = null, target = 40, top = 0; /* top: where balls enter (below the text on narrow screens) */
  var phase = 'fill', phaseAt = 0, lastSpawn = 0, running = false, raf = 0, last = 0, queue = [];
  var G = 2000, E = 0.4, AIR = 0.999, GAP = 18;

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function slug(n) { return n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function shuffled() { var a = NAMES.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function wide() { return W > 760; }

  function measure() {
    var p = pit.getBoundingClientRect();
    W = p.width; H = p.height;
    /* solid block = the union of every line of text (the headline can be wider than its column) */
    var l = Infinity, rr = -Infinity, tt = Infinity, bb = -Infinity;
    [text].concat([].slice.call(text.children)).forEach(function (el) {
      var c = el.getBoundingClientRect(); if (!c.width) return;
      l = Math.min(l, c.left); rr = Math.max(rr, c.right); tt = Math.min(tt, c.top); bb = Math.max(bb, c.bottom);
    });
    block = { l: l - p.left - GAP, r: rr - p.left + GAP, t: tt - p.top - GAP, b: bb - p.top + GAP };
    var rAvg = wide() ? 40 : 28;
    /* if there is no real space either side of the text, balls drop into the space beneath it instead */
    top = (block.l < 70 && W - block.r < 70) ? block.b : 0;
    var free = top ? W * (H - top) : W * H - Math.max(0, (block.r - block.l) * (H - block.t));
    target = Math.max(10, Math.floor(free * 0.62 / (Math.PI * rAvg * rAvg))); /* names can repeat in a big fill: everyone has the same tools */
  }

  function spawn() {
    if (!queue.length) queue = shuffled();
    var name = queue.pop();
    var longest = name.split(' ').reduce(function (m, w) { return Math.max(m, w.length); }, 1);
    var r = wide() ? rnd(30, 52) : rnd(22, 34);
    r = Math.min(wide() ? 58 : 46, Math.max(r, longest * (wide() ? 3.5 : 3.3))); /* long names get a ball big enough to read */
    var el = document.createElement('span');
    el.className = 'ball ' + TONES[Math.floor(Math.random() * TONES.length)];
    var s = slug(name);
    if (LOGOS[s]) { var img = document.createElement('img'); img.src = '/img/tools/' + s + '.svg'; img.alt = ''; el.appendChild(img); }
    else el.textContent = name;
    el.style.width = el.style.height = (r * 2) + 'px';
    el.style.fontSize = Math.max(8.5, Math.min(13, r / 3.4, (r * 2 * 0.8) / (longest * 0.6))).toFixed(1) + 'px';
    pit.appendChild(el);
    /* drop mostly into the open space either side of the text */
    var x, sideL = block.l - r, sideR = W - block.r - r;
    var roll = Math.random();
    if (roll < 0.45 && sideL > r) x = rnd(r, block.l - r);
    else if (roll < 0.9 && sideR > r) x = rnd(block.r + r, W - r);
    else x = rnd(r, W - r);
    if (top) x = rnd(r, W - r);
    balls.push({ el: el, r: r, x: x, y: top ? top + r + 2 : -r - rnd(0, 40), vx: rnd(-60, 60), vy: rnd(60, 180) });
  }

  /* push a ball out of the text block (circle vs rectangle) */
  function hitBlock(a) {
    var cx = Math.max(block.l, Math.min(a.x, block.r)), cy = Math.max(block.t, Math.min(a.y, block.b));
    var dx = a.x - cx, dy = a.y - cy, d2 = dx * dx + dy * dy;
    if (d2 >= a.r * a.r) return;
    var nx, ny, d;
    if (d2 === 0) { /* centre inside the block: push out through the nearest side */
      var opts = [[a.x - block.l, -1, 0], [block.r - a.x, 1, 0], [a.y - block.t, 0, -1], [block.b - a.y, 0, 1]];
      opts.sort(function (p, q) { return p[0] - q[0]; });
      nx = opts[0][1]; ny = opts[0][2]; d = -opts[0][0];
    } else { d = Math.sqrt(d2); nx = dx / d; ny = dy / d; }
    var push = a.r - d;
    a.x += nx * push; a.y += ny * push;
    var vn = a.vx * nx + a.vy * ny;
    if (vn < 0) { a.vx -= (1 + E) * vn * nx; a.vy -= (1 + E) * vn * ny; }
    if (ny < -0.6) a.vx += (a.x < (block.l + block.r) / 2 ? -1 : 1) * 14; /* nudge off the top of the text, down the sides */
  }

  function step(dt, floor) {
    var i, j, a, b;
    for (i = 0; i < balls.length; i++) {
      a = balls[i];
      a.vy += G * dt; a.vx *= AIR;
      a.x += a.vx * dt; a.y += a.vy * dt;
      if (a.x < a.r) { a.x = a.r; a.vx = -a.vx * E; }
      if (a.x > W - a.r) { a.x = W - a.r; a.vx = -a.vx * E; }
      if (floor && a.y > H - a.r) { a.y = H - a.r; a.vy = -a.vy * E; a.vx *= 0.9; if (Math.abs(a.vy) < 30) a.vy = 0; }
      hitBlock(a); /* the text stays solid even while the floor is open */
      if (top && a.y - a.r < top) { a.y = top + a.r; if (a.vy < 0) a.vy = 0; }
    }
    for (var k = 0; k < 3; k++) {
      for (i = 0; i < balls.length; i++) {
        a = balls[i];
        for (j = i + 1; j < balls.length; j++) {
          b = balls[j];
          var dx = b.x - a.x, dy = b.y - a.y, min = a.r + b.r, d2 = dx * dx + dy * dy;
          if (d2 >= min * min || d2 === 0) continue;
          var d = Math.sqrt(d2), nx = dx / d, ny = dy / d, push = (min - d) / 2;
          a.x -= nx * push; a.y -= ny * push; b.x += nx * push; b.y += ny * push;
          var rel = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
          if (rel < 0) { var imp = -(1 + E) * rel / 2; a.vx -= imp * nx; a.vy -= imp * ny; b.vx += imp * nx; b.vy += imp * ny; }
        }
      }
      for (i = 0; i < balls.length; i++) { a = balls[i]; if (floor && a.y > H - a.r) a.y = H - a.r; hitBlock(a); }
    }
  }

  function draw() {
    for (var i = 0; i < balls.length; i++) {
      var b = balls[i];
      b.el.style.transform = 'translate(' + (b.x - b.r).toFixed(1) + 'px,' + (b.y - b.r).toFixed(1) + 'px)';
    }
  }

  function full() {
    if (balls.length >= target) return true;
    for (var i = 0; i < balls.length; i++) {
      var b = balls[i];
      if (b.y > top && b.y - b.r < top + 10 && Math.abs(b.vy) < 60) return true; /* the pile has reached the top */
    }
    return false;
  }

  function tick(now) {
    if (!running) return;
    var dt = Math.min(0.033, (now - last) / 1000 || 0.016); last = now;
    if (phase === 'fill') {
      if (now - lastSpawn > 150) { spawn(); lastSpawn = now; }
      if (full()) { phase = 'hold'; phaseAt = now; }
    } else if (phase === 'hold' && now - phaseAt > 1800) {
      phase = 'drain'; phaseAt = now;
      balls.forEach(function (b) { b.vy -= rnd(80, 240); b.vx += rnd(-60, 60); });
    } else if (phase === 'drain') {
      balls = balls.filter(function (b) { if (b.y - b.r > H + 20) { b.el.remove(); return false; } return true; });
      if (!balls.length) { phase = 'pause'; phaseAt = now; }
    } else if (phase === 'pause' && now - phaseAt > 800) {
      phase = 'fill'; lastSpawn = 0; queue = shuffled(); measure();
    }
    step(dt / 2, phase !== 'drain'); step(dt / 2, phase !== 'drain');
    draw();
    raf = window.requestAnimationFrame(tick);
  }

  function start() { if (running) return; running = true; last = performance.now(); raf = window.requestAnimationFrame(tick); }
  function stop() { running = false; window.cancelAnimationFrame(raf); }

  measure();
  window.addEventListener('resize', function () {
    measure();
    balls.forEach(function (b) { b.x = Math.min(Math.max(b.x, b.r), W - b.r); });
  });

  var visible = false;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible && !document.hidden) start(); else stop();
    }, { threshold: 0.25 }).observe(pit);
  } else { visible = true; start(); }
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else if (visible) start(); });
})();
