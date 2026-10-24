/* TYFNOW tools-pit.js: section 3 on Home, "Your competitors have the same tools as you" (F174, reworked F182).
   Tool balls drop across the whole section and pile up around the text, which acts as a solid block so it is
   never covered. When the section is full they hold, a trapdoor opens in the middle of the floor and they fall through it, behind the next section, and it starts again.
   Runs only while on screen, pauses in background tabs, and shows nothing when reduced motion is on or JS is off.
   Logos: drop an official SVG at /img/tools/<slug>.svg and add the slug to LOGOS; the ball then shows the logo.
   We do not draw brand marks ourselves. 24 Oct 2026.
   One-page round: mass by size, friction and rolling spin, softer settling, so the pile moves like real balls. */
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
  var TONES = ['t-white', 't-white', 't-white', 't-g1', 't-g1', 't-g2', 't-g3', 't-ink', 't-ink']; /* round 9: greys and black */

  var balls = [], W = 0, H = 0, block = null, target = 40, top = 0; /* top: where balls enter (below the text on narrow screens) */
  var trap = 0, phase = 'fill', phaseAt = 0, lastSpawn = 0, running = false, raf = 0, last = 0, queue = [];
  var FALL = 900, G = 1700, AIR = 0.9985, GAP = 18, MU = 0.18, ITER = 6, SLEEP = 14;
  /* restitution falls with impact speed: hard drops bounce, slow touches settle instead of jittering */
  function rest(v) { v = Math.abs(v); return v > 700 ? 0.5 : v > 250 ? 0.32 : v > 80 ? 0.16 : 0; }

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
    else { var lab = document.createElement('span'); lab.className = 'ball-l'; lab.textContent = name; el.appendChild(lab); }
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
    balls.push({ el: el, r: r, m: r * r, x: x, y: top ? top + r + 2 : -r - rnd(0, 40), vx: rnd(-90, 90), vy: rnd(70, 170), a: rnd(-25, 25), w: rnd(-2, 2) });
  }

  /* tangential friction at a contact point, and spin that matches rolling (w = v / r) */
  function contact(a, nx, ny, ovx, ovy, share) {
    var tx = -ny, ty = nx;
    var slip = (a.vx - ovx) * tx + (a.vy - ovy) * ty - a.w * a.r; /* surface speed at the contact (clockwise spin positive) */
    var f = slip * MU * share;
    a.vx -= f * tx; a.vy -= f * ty;
    a.w += f / a.r * 2; /* solid disc: friction turns slide into roll */
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
    if (vn < 0) { var e = rest(vn); a.vx -= (1 + e) * vn * nx; a.vy -= (1 + e) * vn * ny; contact(a, nx, ny, 0, 0, 1); }
    if (ny < -0.6 && Math.abs(a.vx) < 40) a.vx += (a.x < (block.l + block.r) / 2 ? -1 : 1) * 6; /* a ball resting on the headline rolls off, it does not sit there */
  }

  /* floor: true = closed; 'gap' = a trapdoor opens in the middle and balls drop through it, behind the next section */
  function solid(a) { return !(trap && Math.abs(a.x - W / 2) < trap - a.r * 0.35); }
  function step(dt, floor) {
    var i, j, a, b;
    for (i = 0; i < balls.length; i++) {
      a = balls[i];
      a.vy += G * dt; a.vx *= AIR; a.w *= 0.995;
      a.x += a.vx * dt; a.y += a.vy * dt;
      a.a += a.w * dt * 57.2958;
      if (a.x < a.r) { a.x = a.r; a.vx = -a.vx * rest(a.vx); contact(a, 1, 0, 0, 0, 1); }
      if (a.x > W - a.r) { a.x = W - a.r; a.vx = -a.vx * rest(a.vx); contact(a, -1, 0, 0, 0, 1); }
      if (floor && a.y > H - a.r && solid(a)) { a.y = H - a.r; a.vy = -a.vy * rest(a.vy); contact(a, 0, -1, 0, 0, 1); }
      if (floor === 'gap' && a.y > H - a.r - 3 && a.y < H) a.vx += (a.x < W / 2 ? 1 : -1) * 520 * dt; /* the floor tips towards the trapdoor */
      hitBlock(a); /* the text stays solid even while the floor is open */
      if (top && a.y - a.r < top) { a.y = top + a.r; if (a.vy < 0) a.vy = 0; }
    }
    for (var k = 0; k < ITER; k++) {
      for (i = 0; i < balls.length; i++) {
        a = balls[i];
        for (j = i + 1; j < balls.length; j++) {
          b = balls[j];
          var dx = b.x - a.x, dy = b.y - a.y, min = a.r + b.r, d2 = dx * dx + dy * dy;
          if (d2 >= min * min || d2 === 0) continue;
          var d = Math.sqrt(d2), nx = dx / d, ny = dy / d, over = min - d, mt = a.m + b.m;
          /* heavier (bigger) balls move less */
          a.x -= nx * over * (b.m / mt); a.y -= ny * over * (b.m / mt);
          b.x += nx * over * (a.m / mt); b.y += ny * over * (a.m / mt);
          var rel = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
          if (rel < 0 && k === 0) {
            var imp = -(1 + rest(rel)) * rel / (1 / a.m + 1 / b.m);
            a.vx -= imp / a.m * nx; a.vy -= imp / a.m * ny; b.vx += imp / b.m * nx; b.vy += imp / b.m * ny;
            contact(a, -nx, -ny, b.vx, b.vy, b.m / mt); contact(b, nx, ny, a.vx, a.vy, a.m / mt);
          }
        }
      }
      for (i = 0; i < balls.length; i++) { a = balls[i]; if (floor && a.y > H - a.r && a.y < H && solid(a)) a.y = H - a.r; hitBlock(a); }
    }
    /* settle: near-still balls stop instead of trembling in the pile */
    for (i = 0; i < balls.length; i++) {
      a = balls[i];
      if (floor === true && Math.abs(a.vx) < SLEEP && Math.abs(a.vy) < SLEEP * 2) { a.vx *= 0.6; a.w *= 0.6; }
    }
  }

  function draw() {
    for (var i = 0; i < balls.length; i++) {
      var b = balls[i];
      b.el.style.transform = 'translate(' + (b.x - b.r).toFixed(1) + 'px,' + (b.y - b.r).toFixed(1) + 'px)';
      b.el.firstChild.style.transform = 'rotate(' + b.a.toFixed(1) + 'deg)'; /* the label turns, the shadow stays put */
    }
  }

  function full() {
    if (balls.length >= target) return true;
    for (var i = 0; i < balls.length; i++) {
      var b = balls[i];
      if (b.x > block.l && b.x < block.r) continue; /* a ball resting on the headline is not the pile */
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
      phase = 'drain'; phaseAt = now; trap = Math.max(70, W * 0.11);
    } else if (phase === 'drain') {
      if (now - phaseAt > 2500) trap = Math.min(W / 2 + 60, trap + W * 0.0015); /* the trapdoor widens until everything is through */
      balls = balls.filter(function (b) { if (b.y - b.r > H + FALL) { b.el.remove(); return false; } return true; });
      if (!balls.length) { phase = 'pause'; phaseAt = now; trap = 0; }
    } else if (phase === 'pause' && now - phaseAt > 800) {
      phase = 'fill'; lastSpawn = 0; queue = shuffled(); measure();
    }
    var fl = phase === 'drain' ? 'gap' : true;
    step(dt / 2, fl); step(dt / 2, fl);
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
