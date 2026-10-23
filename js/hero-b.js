/* TYFNOW hero-b.js: hero option B (trial, F158). Only runs with ?hero=b in the URL.
   Floating portfolio tiles around the headline, after the Cosmos reference. Every visit or refresh
   picks a new mix: which images, which crop, which slot, angle, size and depth. 23 Oct 2026. */
(function () {
  'use strict';
  var hero = document.querySelector('.hero'), box = document.getElementById('hero-float');
  if (!hero || !box) return;
  var q = new URLSearchParams(window.location.search);
  if (q.get('hero') !== 'b') return;

  hero.classList.add('hero--b');
  box.hidden = false;

  var POOL = [
    { src: '/img/todaytix-480.jpg' }, { src: '/img/amex-puppet-480.jpg' }, { src: '/img/wardrobe-480.jpg' },
    { src: '/img/amex-business-480.jpg' }, { src: '/img/sporthopod-480.jpg' }, { src: '/img/helmet-480.jpg' },
    { src: '/img/cb-brand-before-after.webp', pos: '22% 45%' },   /* Conference Badges, before */
    { src: '/img/cb-brand-before-after.webp', pos: '78% 45%' }    /* Conference Badges, after */
  ];
  /* Slots are kept clear of the headline and button. x, y in % of the hero. */
  var DESK = [[7, 14], [21, 8], [37, 5], [63, 5], [79, 9], [93, 15], [4, 42], [15, 33], [86, 34], [96, 46],
              [9, 72], [22, 80], [78, 76], [92, 68], [36, 90], [64, 91], [50, 95], [3, 90], [97, 88]];
  var MOB = [[10, 6], [40, 4], [72, 7], [94, 12], [8, 90], [36, 94], [66, 91], [92, 87]];

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  var wide = window.innerWidth > 760;
  var slots = shuffle((wide ? DESK : MOB).slice()).slice(0, wide ? 15 : 7);
  var pics = [];
  while (pics.length < slots.length) pics = pics.concat(shuffle(POOL.slice()));
  var ratios = [1, 1.25, 0.8, 1.33, 0.75];
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* keep every tile clear of the headline and button (16px margin), trying spare slots before giving up */
  var hr = hero.getBoundingClientRect(), tr = hero.querySelector('.head').getBoundingClientRect();
  var keep = { l: tr.left - hr.left - 16, r: tr.right - hr.left + 16, t: tr.top - hr.top - 16, b: tr.bottom - hr.top + 16 };
  var spare = shuffle((wide ? DESK : MOB).slice()).filter(function (s) { return slots.indexOf(s) < 0; });
  function place(s, w, h) {
    var x = (s[0] + rnd(-2, 2)) / 100 * hr.width, y = (s[1] + rnd(-2, 2)) / 100 * hr.height;
    var half = Math.max(w, h) * 0.62; /* rotated tile, generous bounding box */
    var clear = x + half < keep.l || x - half > keep.r || y + half < keep.t || y - half > keep.b;
    return clear ? { x: x, y: y } : null;
  }

  slots.forEach(function (s, i) {
    var p = pics[i];
    var tier = Math.random();
    var depth = tier < 0.28 ? 'far' : (tier < 0.6 ? 'mid' : 'near');
    var w = (wide ? rnd(96, 168) : rnd(58, 88)) * (depth === 'far' ? 0.72 : depth === 'mid' ? 0.9 : 1);
    var h = w / ratios[Math.floor(Math.random() * ratios.length)];
    var spot = place(s, w, h);
    while (!spot && spare.length) spot = place(spare.shift(), w, h);
    if (!spot) return;
    var tile = document.createElement('div');
    tile.className = 'ft ' + depth;
    var st = tile.style;
    st.left = spot.x.toFixed(0) + 'px';
    st.top = spot.y.toFixed(0) + 'px';
    st.width = Math.round(w) + 'px';
    st.height = Math.round(h) + 'px';
    st.setProperty('--r', rnd(-26, 26).toFixed(1) + 'deg');
    st.setProperty('--dr', rnd(-5, 5).toFixed(1) + 'deg');
    st.setProperty('--dx', rnd(-14, 14).toFixed(0) + 'px');
    st.setProperty('--dy', rnd(-18, 18).toFixed(0) + 'px');
    st.setProperty('--dur', rnd(7, 13).toFixed(1) + 's');
    st.setProperty('--delay', still ? '0s' : (i * 0.06).toFixed(2) + 's');
    var img = document.createElement('img');
    img.src = p.src; img.alt = ''; img.decoding = 'async';
    img.style.objectPosition = p.pos || (rnd(25, 75).toFixed(0) + '% ' + rnd(25, 75).toFixed(0) + '%');
    tile.appendChild(img);
    box.appendChild(tile);
  });
})();
