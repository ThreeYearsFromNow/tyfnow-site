/* TYFNOW home.js: globe, reviews, closing CTA. */
(function () {
  'use strict';
  var W = window, D = document, T = W.TYFNOW || { track: function () {} };
  var reduced = W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* ---------- hero tools: pop in one by one ---------- */
  (function () {
    var box = D.getElementById('tools'), hero = box && box.parentNode;
    if (!box) return;
    var NAMES = ['ChatGPT','Claude','Gemini','Midjourney','Canva','Adobe Express','Figma','Copilot','Notion','Slack','Monday','Asana','Trello','ClickUp','HubSpot','Salesforce','Pipedrive','Zoho CRM','Mailchimp','Klaviyo','Zapier','Make','Airtable','Webflow','Wix','Squarespace','Shopify','Perplexity','Runway','ElevenLabs','Loom','Framer','Semrush','Instagram','TikTok','YouTube','LinkedIn','Facebook'];
    var COLS = ['#2B2140','#C85A36','#2F6B4F','#9B7FD1','#E8744F','#5FB08A'];
    /* Logo slot: drop an SVG at /img/tools/<slug>.svg and it replaces the name. */
    var LOGOS = {};
    function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-'); }
    function build() {
      box.innerHTML = '';
      var w = hero.clientWidth, h = hero.clientHeight, slots = [];
      if (w > 900) {
        /* two side columns, grid of circles, random jitter */
        var d = w > 1200 ? 112 : (w > 1000 ? 96 : 80), cols = w > 1200 ? 3 : 2;
        var rows = Math.floor((h - 40) / (d + 18));
        for (var r = 0; r < rows; r++) for (var cI = 0; cI < cols; cI++) {
          var y = 40 + d / 2 + r * (d + 18) + (cI % 2 ? 10 : -6);
          /* the inner column only above and below the headline band */
                    slots.push({ x: 24 + d / 2 + cI * (d + 16), y: y, d: d });
          slots.push({ x: w - (24 + d / 2 + cI * (d + 16)), y: y, d: d });
        }
      } else {
        /* phone: a band above the headline and one below the button */
        var d2 = 66, perRow = Math.floor((w - 16) / (d2 + 10));
        for (var i = 0; i < perRow; i++) {
          slots.push({ x: 8 + d2 / 2 + i * (d2 + 10) + (i % 2 ? 0 : 6), y: 50 + (i % 2 ? 14 : 0), d: d2 });
          slots.push({ x: 8 + d2 / 2 + i * (d2 + 10) + (i % 2 ? 6 : 0), y: h - 62 - (i % 2 ? 0 : 14), d: d2 });
        }
      }
      /* drop any slot that would touch the headline, sub-line or button */
      var hb = hero.getBoundingClientRect();
      var keep = ['h1', '.sub', '.btn'].map(function (q) { var r = hero.querySelector(q).getBoundingClientRect(); return { l: r.left - hb.left - 14, r: r.right - hb.left + 14, t: r.top - hb.top - 14, b: r.bottom - hb.top + 14 }; });
      slots = slots.filter(function (s) {
        var l = s.x - s.d / 2, r = s.x + s.d / 2, tp = s.y - s.d / 2, bt = s.y + s.d / 2;
        return !keep.some(function (k) { return l < k.r && r > k.l && tp < k.b && bt > k.t; });
      });
      /* shuffle appearance order, deterministic per load */
      var order = slots.map(function (s, i) { return i; }).sort(function () { return Math.random() - 0.5; });
      var els = [];
      for (var k = 0; k < order.length && k < NAMES.length; k++) {
        var s = slots[order[k]], name = NAMES[k], el = D.createElement('div');
        el.className = 'tool'; el.style.setProperty('--d', s.d + 'px'); el.style.left = s.x + 'px'; el.style.top = s.y + 'px';
        el.style.color = COLS[k % COLS.length];
        var lg = LOGOS[slug(name)];
        if (lg) { var im = D.createElement('img'); im.src = lg; im.alt = ''; el.appendChild(im); } else { el.textContent = name; }
        box.appendChild(el); els.push(el);
      }
      var delay = reduced ? 0 : 320;
      els.forEach(function (el, i) { W.setTimeout(function () { el.classList.add('on'); }, 500 + i * delay); });
    }
    build();
    var rw; W.addEventListener('resize', function () { W.clearTimeout(rw); rw = W.setTimeout(build, 200); });
  })();

  /* ---------- globe ---------- */
  var svg = D.getElementById('globe');
  if (svg) {
    var NAMES = ['ChatGPT','Claude','Gemini','Nano Banana','Midjourney','Canva','Adobe Express','Figma','Copilot','Notion','Slack','Monday','Asana','Trello','ClickUp','HubSpot','Salesforce','Pipedrive','Zoho CRM','Mailchimp','Klaviyo','Zapier','Make','Airtable','Webflow','Wix','Squarespace','Shopify','Perplexity','Runway','ElevenLabs','Loom','Framer','Semrush','Instagram','TikTok','YouTube','LinkedIn','Facebook','Threads','Newsletters'];
    var COLS = ['#2B2140','#F2B35B','#5FB08A','#E8744F','#9B7FD1','#2F6B4F','#F2B35B','#E8744F'];
    var SIZES = [9,13,7,11,14,8,12,10];
    var n = NAMES.length, golden = Math.PI * (3 - Math.sqrt(5));
    var NS = 'http://www.w3.org/2000/svg';
    var tilt = 0.35, R = 250, cx = 300, cy = 300;
    var ang = Math.random() * Math.PI * 2, dir = Math.random() < 0.5 ? 1 : -1;
    var all = true, hover = -1;

    var nodes = NAMES.map(function (name, i) {
      var y = 1 - (i / (n - 1)) * 2;
      var k = 0.62 + 0.38 * (((i * 7919) % 97) / 96);
      var g = D.createElementNS(NS, 'g');
      var line = D.createElementNS(NS, 'line'); line.setAttribute('x1', cx); line.setAttribute('y1', cy);
      var c = D.createElementNS(NS, 'circle'); c.setAttribute('fill', COLS[i % 8]); c.setAttribute('stroke-width', '2');
      var t = D.createElementNS(NS, 'text'); t.textContent = name;
      g.appendChild(line); g.appendChild(c); g.appendChild(t);
      g.addEventListener('mouseenter', function () { hover = i; draw(); });
      g.addEventListener('mouseleave', function () { hover = -1; draw(); });
      return { id: i, lat: Math.asin(y * 0.92), lon: i * golden, k: k, size: SIZES[i % 8], g: g, line: line, c: c, t: t };
    });
    var centre = D.createElementNS(NS, 'circle'); centre.setAttribute('cx', cx); centre.setAttribute('cy', cy); centre.setAttribute('r', '5'); centre.setAttribute('fill', '#2B2140');

    function draw() {
      var pts = nodes.map(function (nd) {
        var lon = nd.lon + ang;
        var x = Math.cos(nd.lat) * Math.sin(lon), y = Math.sin(nd.lat), z = Math.cos(nd.lat) * Math.cos(lon);
        var y2 = y * Math.cos(tilt) - z * Math.sin(tilt), z2 = y * Math.sin(tilt) + z * Math.cos(tilt);
        var depth = (z2 + 1) / 2, s = 0.55 + 0.45 * depth;
        var px = cx + x * R * nd.k, py = cy + y2 * R * nd.k, r = nd.size * s;
        var right = px >= cx, isHov = hover === nd.id;
        nd.line.setAttribute('x2', px.toFixed(1)); nd.line.setAttribute('y2', py.toFixed(1));
        nd.c.setAttribute('cx', px.toFixed(1)); nd.c.setAttribute('cy', py.toFixed(1)); nd.c.setAttribute('r', r.toFixed(1));
        nd.c.setAttribute('stroke', isHov ? '#2B2140' : 'none');
        nd.t.setAttribute('x', (right ? px + r + 6 : px - r - 6).toFixed(1)); nd.t.setAttribute('y', (py + 4).toFixed(1));
        nd.t.setAttribute('text-anchor', right ? 'start' : 'end');
        nd.t.style.opacity = (all || isHov) ? '1' : '0';
        nd.g.style.opacity = (0.45 + 0.55 * depth).toFixed(2);
        nd.z = z2;
        return nd;
      }).sort(function (a, b) { return a.z - b.z; });
      /* draw order: back nodes, centre dot, front nodes */
      var frag = D.createDocumentFragment(), placedCentre = false;
      pts.forEach(function (p) { if (!placedCentre && p.z >= 0) { frag.appendChild(centre); placedCentre = true; } frag.appendChild(p.g); });
      if (!placedCentre) frag.appendChild(centre);
      svg.appendChild(frag);
    }
    svg.addEventListener('click', function () { all = !all; draw(); T.track('globe_toggle'); });
    draw();
    if (!reduced) {
      var last = 0;
      var step = function (ts) {
        if (hover < 0 && ts - last > 30) { ang += dir * 0.006; last = ts; draw(); }
        W.requestAnimationFrame(step);
      };
      W.requestAnimationFrame(step);
    }
  }

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
})();
