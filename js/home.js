/* TYFNOW home.js: globe, reviews, closing CTA. */
(function () {
  'use strict';
  var W = window, D = document, T = W.TYFNOW || { track: function () {} };
  var reduced = W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
