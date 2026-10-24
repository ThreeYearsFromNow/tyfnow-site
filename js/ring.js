/* TYFNOW ring.js: section 4 on the one-page Home (24 Oct 2026). Replaces the signals stream.
   Signals from a mix of businesses drop in from the top, colour-coded by the work they become. Each one turns
   into the work, then flies to its heading on the ring, whose tally goes up. The disciplines it needs light up
   on the outer ring, with AI underneath every time. Roadmap questions land in the roadmap under the ring.
   Never two chips from the same business on screen. Tallies start at zero each visit: a demo count, not a claim.
   Runs only while on screen and the tab is visible. Reduced motion or no JS: the ring and two roadmap items, still.
   Examples are illustrative signal types, not client data. */
(function () {
  'use strict';
  var W = window, D = document;
  var stage = D.getElementById('rg');
  if (!stage || !stage.animate) return;
  if (W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var band = stage.querySelector('.rg-band'), roadList = stage.querySelector('.rg-road-list'), roadN = stage.querySelector('.rg-road-n');
  /* [business, source, signal, output, work, disciplines] ; roadmap items carry the question as the work */
  var POOL = [
    ['Architect practice', 'Website', 'The site feels static', 'web', 'Add motion and project film', ['creative', 'production']],
    ['Accountancy firm', 'Diary', 'Not doing enough networking', 'reach', 'Plan the next events and follow-ups', ['workflow']],
    ['Fitness studio', 'App store', 'App UI and UX need updating', 'app', 'Redesign the booking screens', ['creative', 'production']],
    ['Coach', 'LinkedIn', 'A past client has moved role', 'reach', 'Send a note, reconnect', ['workflow']],
    ['Dental clinic', 'Google reviews', 'New five-star review', 'content', 'Thank them, share it, add it to the site', ['creative']],
    ['E-commerce brand', 'Merchant Centre', 'Product feed errors flagged', 'search', 'Fix the feed, relist', ['testing']],
    ['Law firm', 'AI search', 'ChatGPT recommends a competitor', 'search', 'Publish answers AI can quote', ['creative', 'testing']],
    ['Builder', 'Inbox', 'Same question asked three times', 'web', 'Add it to the FAQ', ['creative']],
    ['Physio clinic', 'Business Profile', 'Opening hours out of date', 'search', 'Update every listing', ['workflow']],
    ['Recruitment agency', 'CRM', 'Quote sent, no reply in a week', 'reach', 'Send a useful follow-up', ['workflow']],
    ['Estate agent', 'Analytics', 'Valuation page visits are up', 'web', 'Test a clearer valuation form', ['testing']],
    ['Restaurant', 'Instagram', 'One post beat all the others', 'content', 'Turn it into a short series', ['creative', 'production']],
    ['Event supplier', 'Events', 'Trade show announced in your sector', 'reach', 'Plan the stand and the follow-up', ['workflow']],
    ['Coach', 'Voice note', 'Idea recorded on the drive home', 'content', "Draft it as this week's post", ['creative']],
    ['Accountancy firm', 'Search Console', 'Key page dropped from the index', 'search', 'Fix it and resubmit', ['testing']],
    ['Architect practice', 'Competitor watch', 'A competitor has rebranded', 'web', 'Sharpen your comparison page', ['creative']],
    ['E-commerce brand', 'Newsletter', 'Open rate dipped', 'reach', 'Test a new subject line', ['testing']],
    ['Dental clinic', 'Website', 'Contact form drop-offs', 'web', 'Shorten the form', ['testing']],
    ['Law firm', 'Sales call', 'A client mentioned a new problem', 'web', 'Add a service page for it', ['creative']],
    ['Fitness studio', 'SEO', 'A new search term is climbing', 'content', 'Write the page that owns it', ['creative']],
    ['Restaurant', 'Bookings', 'Online bookings app is clunky', 'app', 'Simplify the booking flow', ['creative', 'testing']],
    ['Builder', 'Roadmap', 'Should we be on TikTok?', 'road', 'Should we be on TikTok?', ['workflow']],
    ['Restaurant', 'Roadmap', 'Is the website pulling its weight?', 'road', 'Is the website pulling its weight?', ['testing']],
    ['Coach', 'Roadmap', 'Do we need a podcast?', 'road', 'Do we need a podcast?', ['workflow']],
    ['Recruitment agency', 'Roadmap', "Who's building next quarter's campaign?", 'road', "Next quarter's campaign", ['workflow']],
    ['Physio clinic', 'Roadmap', 'Are newsletters still worth it?', 'road', 'Newsletter: keep, change or stop', ['testing']]
  ];
  var LABEL = { web: 'Website', content: 'Content', search: 'Search and AI answers', reach: 'Outreach', app: 'App', road: 'Roadmap' };
  var SPAWN = 1500, DROP = 600, READ = 1300, WORK = 1000, FLY = 750;

  function narrow() { return W.innerWidth <= 640; }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  var queue = [], live = [], slots = [], sinceRoad = 0, roadCount = 0, timer = 0, running = false;
  var counts = {};

  function next() {
    if (queue.length < 8) queue = queue.concat(shuffle(POOL.slice()));
    var busy = live.map(function (c) { return c.p[0]; });
    var idx = -1;
    if (sinceRoad >= 4) idx = queue.findIndex(function (p) { return p[3] === 'road' && busy.indexOf(p[0]) < 0; });
    if (idx < 0) idx = queue.findIndex(function (p) { return busy.indexOf(p[0]) < 0; });
    if (idx < 0) return null;
    var p = queue.splice(idx, 1)[0];
    sinceRoad = p[3] === 'road' ? 0 : sinceRoad + 1;
    return p;
  }

  function slotCount() { return narrow() ? 2 : 3; }
  function freeSlot() {
    var n = slotCount();
    for (var i = 0; i < n; i++) if (!slots[i]) return i;
    return -1;
  }

  function el(tag, cls, text) { var e = D.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; }

  function spawn() {
    var s = freeSlot(); if (s < 0) return;
    var p = next(); if (!p) return;
    var chip = el('div', 'rg-chip f-' + p[3]);
    chip.appendChild(el('span', 'rg-biz', p[0] + ' · ' + p[1]));
    var line = el('span', 'rg-line', p[2]);
    chip.appendChild(line);
    /* place in its slot: three across the band on desktop, two stacked on phones */
    var n = slotCount();
    if (narrow()) { chip.classList.add('rg-row' + s); }
    else { chip.classList.add('rg-col' + s); chip.classList.add('rg-cols' + n); }
    band.appendChild(chip);
    slots[s] = chip;
    var c = { p: p, chip: chip, slot: s };
    live.push(c);

    chip.animate([{ transform: 'translateY(-70px)', opacity: 0 }, { transform: 'translateY(6px)', opacity: 1, offset: 0.7 }, { transform: 'translateY(0)', opacity: 1 }],
      { duration: DROP, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'both' });

    setTimeout(function () { /* the signal becomes the work */
      chip.classList.add('is-work');
      line.textContent = p[3] === 'road' ? 'Roadmap: ' + p[4] : LABEL[p[3]] + ': ' + p[4];
      light(p[5]);
    }, DROP + READ);

    setTimeout(function () { fly(c); }, DROP + READ + WORK);
  }

  function light(ds) {
    var all = ds.concat(['ai']);
    all.forEach(function (d) {
      var t = stage.querySelector('.rg-d[data-d="' + d + '"]'); if (!t) return;
      t.classList.add('lit');
      setTimeout(function () { t.classList.remove('lit'); }, WORK + FLY);
    });
  }

  function fly(c) {
    var p = c.p, chip = c.chip;
    var target = p[3] === 'road' ? roadList : stage.querySelector('.rg-o[data-k="' + p[3] + '"]');
    var a = chip.getBoundingClientRect(), b = target.getBoundingClientRect();
    var dx = (b.left + b.width / 2) - (a.left + a.width / 2), dy = (p[3] === 'road' ? b.top + 20 : b.top + b.height / 2) - (a.top + a.height / 2);
    slots[c.slot] = null;
    var anim = chip.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.3)', opacity: 0.15 }],
      { duration: FLY, easing: 'cubic-bezier(.5,0,.3,1)', fill: 'forwards' });
    anim.onfinish = function () {
      chip.remove();
      live = live.filter(function (x) { return x !== c; });
      if (p[3] === 'road') addRoad(p[4]); else bump(target, p[3]);
    };
  }

  function bump(target, k) {
    counts[k] = (counts[k] || 0) + 1;
    var n = target.querySelector('.rg-n'); n.textContent = counts[k];
    target.classList.remove('hit'); void target.offsetWidth; target.classList.add('hit');
  }

  function addRoad(q) {
    var li = el('li', 'rg-new');
    li.appendChild(el('span', 'rg-road-q', q));
    li.appendChild(el('span', 'rg-status', 'Being researched and defined'));
    roadList.insertBefore(li, roadList.firstChild);
    var max = narrow() ? 3 : 4;
    while (roadList.children.length > max) roadList.removeChild(roadList.lastChild);
    roadCount++; roadN.textContent = roadCount;
    roadN.parentNode.classList.remove('hit'); void roadN.offsetWidth; roadN.parentNode.classList.add('hit');
  }

  function start() { if (running) return; running = true; spawn(); timer = setInterval(spawn, SPAWN); }
  function stop() { running = false; clearInterval(timer); }

  stage.classList.add('rg-live');
  roadList.innerHTML = '';
  var visible = false;
  if ('IntersectionObserver' in W) {
    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible && !D.hidden) start(); else stop();
    }, { threshold: 0.2 }).observe(stage);
  } else { visible = true; start(); }
  D.addEventListener('visibilitychange', function () { if (D.hidden) stop(); else if (visible) start(); });
})();
