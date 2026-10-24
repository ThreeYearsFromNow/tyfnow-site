/* TYFNOW signals.js: section 4 on Home (F183). Jumbled signals on the left run through the TYFNOW core and
   come out on the right as clean, colour-coded work, joined into flows. Every visit or refresh picks a new mix of
   signals and a new jumble. Without JS the static six in the HTML show; with reduced motion everything shows at once.
   Examples are illustrative signal types, not client data. 24 Oct 2026. */
(function () {
  'use strict';
  var sig = document.getElementById('sig');
  if (!sig) return;
  var inBox = sig.querySelector('.sig-in'), outBox = sig.querySelector('.sig-out'), core = sig.querySelector('.sig-core');
  var NS = 'http://www.w3.org/2000/svg';
  var FLOW = { web: 'Website', content: 'Content', search: 'Search and AI answers', reach: 'Outreach' };
  var POOL = [
    ['LinkedIn', 'A past client has moved office', 'reach', 'Send a note, reconnect'],
    ['Competitor watch', 'A competitor has rebranded', 'web', 'Sharpen your comparison page'],
    ['AI search', '5th order from AI search this month', 'content', 'Turn it into a case study'],
    ['Merchant Centre', 'Product feed errors flagged', 'search', 'Fix the feed, relist the products'],
    ['Search Console', 'Key page dropped from the index', 'search', 'Fix it and resubmit'],
    ['Inbox', 'Same question asked three times', 'web', 'Add it to the FAQ'],
    ['SEO', 'A new search term is climbing', 'content', 'Write the page that owns it'],
    ['AIEO', 'ChatGPT recommends a competitor', 'search', 'Publish answers AI can quote'],
    ['Google reviews', 'New five-star review', 'content', 'Thank them, share it, add it to the site'],
    ['Analytics', 'Pricing page visits are up', 'web', 'Test a clearer pricing layout'],
    ['Events', 'Trade show announced in your sector', 'reach', 'Plan the stand and the follow-up'],
    ['LinkedIn', 'One post beat all the others', 'content', 'Turn it into a short series'],
    ['Voice note', 'Idea recorded on the drive home', 'content', "Draft it as this week's post"],
    ['CRM', 'Quote sent, no reply in a week', 'reach', 'Send a useful follow-up'],
    ['Business Profile', 'Opening hours out of date', 'search', 'Update every listing'],
    ['Sales call', 'A client mentioned a new problem', 'web', 'Add a service page for it'],
    ['Newsletter', 'Open rate dipped', 'reach', 'Test a new subject line'],
    ['Website', 'Contact form drop-offs', 'web', 'Shorten the form']
  ];
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function narrow() { return window.innerWidth <= 900; }

  /* pick a fresh mix: at least one of each flow, then fill */
  var picks = [], byFlow = {};
  shuffle(POOL.slice()).forEach(function (p) { (byFlow[p[2]] = byFlow[p[2]] || []).push(p); });
  Object.keys(FLOW).forEach(function (f) { if (byFlow[f] && byFlow[f].length) picks.push(byFlow[f].shift()); });
  var rest = shuffle([].concat.apply([], Object.keys(byFlow).map(function (f) { return byFlow[f]; })));
  var COUNT = narrow() ? 5 : 7;
  while (picks.length < COUNT && rest.length) picks.push(rest.shift());
  picks = shuffle(picks);

  /* outputs are listed grouped by flow, so the flow lines on the right join neighbours */
  var order = Object.keys(FLOW);
  var outs = picks.slice().sort(function (a, b) { return order.indexOf(a[2]) - order.indexOf(b[2]); });

  inBox.textContent = ''; outBox.textContent = '';
  var chips = picks.map(function (p, i) {
    var li = document.createElement('li'); li.className = 'sig-chip';
    var src = document.createElement('span'); src.className = 'sig-src'; src.textContent = p[0];
    li.appendChild(src); li.appendChild(document.createTextNode(p[1]));
    inBox.appendChild(li);
    return { el: li, p: p, tilt: rnd(-4.5, 4.5) };
  });
  var rows = outs.map(function (p) {
    var li = document.createElement('li'); li.className = 'sig-row f-' + p[2];
    var tag = document.createElement('span'); tag.className = 'sig-tag'; tag.textContent = FLOW[p[2]];
    li.appendChild(tag); li.appendChild(document.createTextNode(p[3]));
    outBox.appendChild(li);
    return { el: li, p: p };
  });
  sig.classList.add('sig-live');

  var svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'sig-lines'); svg.setAttribute('aria-hidden', 'true');
  sig.insertBefore(svg, sig.firstChild);

  /* scatter the chips in the left area: one shuffled band each, so they look jumbled but never touch (desktop only) */
  function scatter() {
    if (narrow()) { chips.forEach(function (c) { c.el.style.left = ''; c.el.style.top = ''; c.el.style.transform = ''; }); return; }
    var W = inBox.clientWidth, H = inBox.clientHeight, band = H / chips.length;
    var slots = shuffle(chips.map(function (_, i) { return i; }));
    chips.forEach(function (c, i) {
      var ow = c.el.offsetWidth, oh = c.el.offsetHeight, rad = Math.abs(c.tilt) * Math.PI / 180;
      var h = ow * Math.sin(rad) + oh * Math.cos(rad), w = ow * Math.cos(rad) + oh * Math.sin(rad);
      var slack = Math.max(0, band - h - 6);
      var y = slots[i] * band + 3 + rnd(0, slack) + (h - oh) / 2;
      var x = rnd(0, Math.max(0, W - w)) + (w - ow) / 2;
      c.el.style.left = x.toFixed(0) + 'px';
      c.el.style.top = y.toFixed(0) + 'px';
      c.el.style.transform = 'rotate(' + c.tilt.toFixed(1) + 'deg)';
    });
  }

  function pt(el, side) {
    var s = sig.getBoundingClientRect(), r = el.getBoundingClientRect();
    return { x: (side === 'r' ? r.right : side === 'l' ? r.left : (r.left + r.right) / 2) - s.left, y: (r.top + r.bottom) / 2 - s.top };
  }
  function path(d, cls, delay) {
    var e = document.createElementNS(NS, 'path');
    e.setAttribute('d', d); e.setAttribute('class', cls);
    if (!still) e.style.animationDelay = delay.toFixed(2) + 's';
    svg.appendChild(e); return e;
  }
  function curve(a, b) {
    var mx = (a.x + b.x) / 2;
    return 'M' + a.x.toFixed(1) + ' ' + a.y.toFixed(1) + ' C' + mx.toFixed(1) + ' ' + a.y.toFixed(1) + ' ' + mx.toFixed(1) + ' ' + b.y.toFixed(1) + ' ' + b.x.toFixed(1) + ' ' + b.y.toFixed(1);
  }

  function draw() {
    var s = sig.getBoundingClientRect();
    svg.setAttribute('viewBox', '0 0 ' + s.width.toFixed(0) + ' ' + s.height.toFixed(0));
    svg.setAttribute('width', s.width.toFixed(0)); svg.setAttribute('height', s.height.toFixed(0));
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    if (narrow()) return;
    var cl = pt(core, 'l'), cr = pt(core, 'r');
    chips.forEach(function (c, i) {
      var d = (still ? 0 : 0.35 + i * 0.32);
      path(curve(pt(c.el, 'r'), cl), 'sig-ln sig-ln-in', d);
      var row = rows.filter(function (r) { return r.p === c.p; })[0];
      if (!row) return;
      path(curve(cr, pt(row.el, 'l')), 'sig-ln f-' + c.p[2], d + 0.45);
      if (!still) { row.el.style.animationDelay = (d + 0.75).toFixed(2) + 's'; c.el.style.animationDelay = (i * 0.08).toFixed(2) + 's'; }
    });
    /* flow lines: join neighbouring outputs of the same colour along the right edge */
    for (var i = 0; i < rows.length - 1; i++) {
      if (rows[i].p[2] !== rows[i + 1].p[2]) continue;
      var a = pt(rows[i].el, 'r'), b = pt(rows[i + 1].el, 'r'), bulge = 26;
      path('M' + a.x + ' ' + a.y + ' C' + (a.x + bulge) + ' ' + a.y + ' ' + (b.x + bulge) + ' ' + b.y + ' ' + b.x + ' ' + b.y, 'sig-ln sig-flow f-' + rows[i].p[2], still ? 0 : 0.35 + chips.length * 0.32 + 0.6);
    }
  }

  var started = false;
  function go() { if (started) return; started = true; scatter(); draw(); sig.classList.add('sig-go'); }
  if (!still && 'IntersectionObserver' in window) {
    scatter(); draw();
    new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { ob.disconnect(); go(); } }, { threshold: 0.3 }).observe(sig);
  } else { go(); }
  var t = 0;
  window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(function () { scatter(); draw(); }, 120); });
})();
