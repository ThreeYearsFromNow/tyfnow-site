/* TYFNOW tools-pit.js: "The tools" box on Home (F174). Tool balls drop in and bounce until the box is full,
   hold for a moment, then the floor opens, they fall out, and it starts again.
   The text above the box is never covered (balls live in .pit only). Runs only while on screen,
   pauses in background tabs, and stays as the static pills when reduced motion is on or JS is off.
   Logos: drop an SVG at /img/tools/<slug>.svg and add the slug to LOGOS; the ball shows the logo, not the name.
   We do not draw brand marks ourselves. 23 Oct 2026. */
(function () {
  'use strict';
  var pit = document.querySelector('.tools .pit');
  if (!pit || !window.requestAnimationFrame) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var NAMES = ['ChatGPT', 'Canva', 'HubSpot', 'Mailchimp', 'Notion', 'Zapier', 'Slack', 'Trello', 'Asana', 'Hootsuite',
    'Buffer', 'Squarespace', 'Wix', 'Shopify', 'Calendly', 'Typeform', 'Xero', 'Semrush', 'Google Analytics', 'Meta Ads',
    'Klaviyo', 'Airtable', 'Miro', 'Figma', 'Loom', 'Grammarly', 'Monday', 'ClickUp', 'Pipedrive', 'Gamma', 'Lovable',
    'Descript', 'Jasper', 'Later', 'Stripe', 'Dashboard', 'CRM', 'Chatbot', 'Scheduler', 'AI writer'];
  var LOGOS = {}; /* e.g. { canva: true } once /img/tools/canva.svg exists */
  var TONES = ['t-white', 't-white', 't-lilac', 't-mint', 't-peach', 't-lime', 't-ink'];

  var balls = [], W = 0, H = 0, phase = 'fill', phaseAt = 0, lastSpawn = 0, target = 30, running = false, raf = 0, last = 0;
  var G = 2000, E = 0.42, AIR = 0.999;

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function slug(n) { return n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function measure() {
    W = pit.clientWidth; H = pit.clientHeight;
    var rAvg = W > 700 ? 40 : 29;
    target = Math.min(NAMES.length, Math.max(10, Math.floor((W * H * 0.78) / (Math.PI * rAvg * rAvg)))); /* no name twice in one fill */
  }
  function names() { var a = NAMES.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  var queue = [];

  function spawn() {
    if (!queue.length) queue = names();
    var name = queue.pop(), wide = W > 700;
    var r = wide ? rnd(32, 50) : rnd(24, 34);
    var el = document.createElement('span');
    el.className = 'ball ' + TONES[Math.floor(Math.random() * TONES.length)];
    var s = slug(name);
    if (LOGOS[s]) { var img = document.createElement('img'); img.src = '/img/tools/' + s + '.svg'; img.alt = ''; el.appendChild(img); }
    else { el.textContent = name; }
    el.style.width = el.style.height = (r * 2) + 'px';
    var longest = name.split(' ').reduce(function (m, w) { return Math.max(m, w.length); }, 1);
    el.style.fontSize = Math.max(8.5, Math.min(13, r / 3.4, (r * 2 * 0.8) / (longest * 0.6))).toFixed(1) + 'px'; /* longest word always fits */
    pit.appendChild(el);
    balls.push({ el: el, r: r, x: rnd(r, W - r), y: -r - rnd(0, 30), vx: rnd(-70, 70), vy: rnd(40, 160) });
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
          if (rel < 0) {
            var imp = -(1 + E) * rel / 2;
            a.vx -= imp * nx; a.vy -= imp * ny; b.vx += imp * nx; b.vy += imp * ny;
          }
        }
      }
      if (floor) for (i = 0; i < balls.length; i++) { a = balls[i]; if (a.y > H - a.r) a.y = H - a.r; }
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
      if (b.y - b.r < 8 && Math.abs(b.vy) < 60 && b.y > 0) return true; /* the pile has reached the top of the box */
    }
    return false;
  }

  function tick(now) {
    if (!running) return;
    var dt = Math.min(0.033, (now - last) / 1000 || 0.016); last = now;
    if (phase === 'fill') {
      if (now - lastSpawn > 170) { spawn(); lastSpawn = now; }
      if (full()) { phase = 'hold'; phaseAt = now; }
    } else if (phase === 'hold' && now - phaseAt > 1600) {
      phase = 'drain'; phaseAt = now;
      balls.forEach(function (b) { b.vy -= rnd(80, 240); b.vx += rnd(-60, 60); }); /* a little jolt as the floor gives way */
    } else if (phase === 'drain') {
      balls = balls.filter(function (b) { if (b.y - b.r > H + 20) { b.el.remove(); return false; } return true; });
      if (!balls.length) { phase = 'pause'; phaseAt = now; }
    } else if (phase === 'pause' && now - phaseAt > 700) {
      phase = 'fill'; lastSpawn = 0; queue = names();
    }
    var sub = 2;
    for (var s = 0; s < sub; s++) step(dt / sub, phase !== 'drain');
    draw();
    raf = window.requestAnimationFrame(tick);
  }

  function start() { if (running) return; running = true; last = performance.now(); raf = window.requestAnimationFrame(tick); }
  function stop() { running = false; window.cancelAnimationFrame(raf); }

  /* take over from the static pills */
  pit.classList.add('pit-live');
  while (pit.firstChild) pit.removeChild(pit.firstChild);
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
    }, { threshold: 0.2 }).observe(pit);
  } else { visible = true; start(); }
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else if (visible) start(); });
})();
