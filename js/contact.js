/* TYFNOW contact.js: prefill from the gate and the closing CTA, submit by fetch. */
(function () {
  'use strict';
  var W = window, D = document, T = W.TYFNOW;
  var form = D.getElementById('contact-form');
  if (!form || !T) return;
  var email = D.getElementById('c-email'), msg = D.getElementById('c-message'), consent = D.getElementById('c-consent'), btn = D.getElementById('c-send'), note = D.getElementById('c-note');

  /* prefill: ?email= from the home CTA, work line from the gate */
  try {
    var q = new URLSearchParams(W.location.search).get('email');
    if (q && !email.value) email.value = q;
    if (q) W.history.replaceState(null, '', W.location.pathname);
  } catch (e) {}
  var g = T.goals();
  if (g && g.work && T.store.get('tyfnow_gate') === 'answered' && !msg.value) {
    msg.value = 'You said: ' + g.work + "\n\nWhat's blocking it?\n";
  }

  function check() { btn.disabled = !(form.checkValidity() && consent.checked); }
  form.addEventListener('input', check); consent.addEventListener('change', check); check();

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity() || !consent.checked) return;
    var fd = new FormData(form);
    fd.set('consent', 'yes');
    btn.disabled = true; note.textContent = '';
    fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(fd).toString() })
      .then(function (r) {
        if (!r.ok) throw new Error('bad');
        T.track('contact_submit', { with_goal: !!(g && g.work) });
        var s = D.getElementById('c-success'); s.hidden = false; form.hidden = true; s.focus();
      })
      .catch(function () { T.track('contact_fail'); btn.disabled = false; note.textContent = "That didn't send. Try again, or email team@threeyearsfromnow.com."; });
  });
})();
