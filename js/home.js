/* TYFNOW home.js: hero tools, steps, reviews, closing CTA, owner lines. */
(function () {
  'use strict';
  var W = window, D = document, T = W.TYFNOW || { track: function () {} };
  var reduced = W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* ---------- hero tools: random, full-bleed, keep changing ---------- */
  (function () {
    var box = D.getElementById('tools'), hero = box && box.parentNode;
    if (!box) return;
    var NAMES = ['ChatGPT','Claude','Gemini','Midjourney','Canva','Adobe Express','Figma','Copilot','Notion','Slack','Monday','Asana','Trello','ClickUp','HubSpot','Salesforce','Pipedrive','Zoho CRM','Mailchimp','Klaviyo','Zapier','Make','Airtable','Webflow','Wix','Squarespace','Shopify','Perplexity','Runway','ElevenLabs','Loom','Framer','Semrush','Instagram','TikTok','YouTube','LinkedIn','Facebook','Threads','Nano Banana'];
    var COLS = ['#2B2140','#C85A36','#2F6B4F','#9B7FD1','#E8744F','#5FB08A'];
    /* Logo slot: drop an SVG at /img/tools/<slug>.svg and map it here; the circle shows the logo instead of the name. */
    var LOGOS = {};
    function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-'); }
    var placed = [], pool = [], timer = null, cycle = null;

    function keepOut() {
      var hb = hero.getBoundingClientRect();
      return ['h1', '.sub', '.btn'].map(function (q) {
        var r = hero.querySelector(q).getBoundingClientRect();
        return { l: r.left - hb.left - 16, r: r.right - hb.left + 16, t: r.top - hb.top - 16, b: r.bottom - hb.top + 16 };
      });
    }
    function clear(s, zones) {
      var l = s.x - s.d / 2, r = s.x + s.d / 2, tp = s.y - s.d / 2, bt = s.y + s.d / 2;
      if (zones.some(function (k) { return l < k.r && r > k.l && tp < k.b && bt > k.t; })) return false;
      return !placed.some(function (o) { var dx = o.x - s.x, dy = o.y - s.y; return Math.sqrt(dx * dx + dy * dy) < (o.d + s.d) / 2 + 14; });
    }
    function spot(w, h, zones) {
      var phone = w <= 900, minD = phone ? 56 : 76, maxD = phone ? 76 : 124;
      for (var i = 0; i < 400; i++) {
        var d = minD + Math.random() * (maxD - minD);
        var s = { x: d / 2 + 8 + Math.random() * (w - d - 16), y: d / 2 + 8 + Math.random() * (h - d - 16), d: d };
        if (clear(s, zones)) return s;
      }
      return null;
    }
    function make(name, s) {
      var el = D.createElement('div');
      el.className = 'tool'; el.style.setProperty('--d', Math.round(s.d) + 'px'); el.style.left = Math.round(s.x) + 'px'; el.style.top = Math.round(s.y) + 'px';
      el.style.color = COLS[Math.floor(Math.random() * COLS.length)];
      var lg = LOGOS[slug(name)];
      if (lg) { var im = D.createElement('img'); im.src = lg; im.alt = ''; el.appendChild(im); } else { el.textContent = name; }
      box.appendChild(el);
      return el;
    }
    function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; } return a; }

    function build() {
      W.clearTimeout(timer); W.clearInterval(cycle);
      box.innerHTML = ''; placed = [];
      var w = hero.clientWidth, h = hero.clientHeight, zones = keepOut();
      var max = w <= 900 ? 10 : (w < 1200 ? 18 : 28);
      pool = shuffle(NAMES.slice());
      var els = [];
      for (var k = 0; k < max; k++) {
        var s = spot(w, h, zones); if (!s) break;
        var name = pool.shift(); pool.push(name);
        var el = make(name, s); s.el = el; s.name = name; placed.push(s); els.push(el);
      }
      var gap = reduced ? 0 : 300;
      els.forEach(function (el, i) { W.setTimeout(function () { el.classList.add('on'); }, 400 + i * gap); });
      if (reduced) return;
      /* once they're all in, keep swapping one at a time: out, new name, new spot, in */
      timer = W.setTimeout(function () {
        cycle = W.setInterval(function () {
          if (D.hidden || !placed.length) return;
          var i = Math.floor(Math.random() * placed.length), old = placed[i];
          old.el.classList.remove('on');
          W.setTimeout(function () {
            placed.splice(placed.indexOf(old), 1); old.el.remove();
            var s = spot(w, h, zones) || { x: old.x, y: old.y, d: old.d };
            var name = pool.shift(); pool.push(name);
            var el = make(name, s); s.el = el; s.name = name; placed.push(s);
            W.setTimeout(function () { el.classList.add('on'); }, 30);
          }, 380);
        }, 1100);
      }, 400 + els.length * gap + 600);
    }
    build();
    var rw; W.addEventListener('resize', function () { W.clearTimeout(rw); rw = W.setTimeout(build, 200); });
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
    var ticking = false, maxX = 0, told = false, LO = 0.04, HI = 0.96;   // a short hold at each end
    var measure = function () {
      maxX = Math.max(0, track.scrollWidth - W.innerWidth);
      hs.style.height = Math.round(W.innerHeight + maxX * 2.2 + 120) + 'px';
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
