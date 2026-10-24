/* TYFNOW work-call.js: "Walk through the project on a call". Email + business website; Sherry vets and sends the invite by hand. */
(function () {
  'use strict';
  var W = window, D = document, T = W.TYFNOW || {};
  var form = D.getElementById('call-form');
  if (!form) return;
  var email = D.getElementById('w-email'), btn = D.getElementById('w-send'), note = D.getElementById('w-note'), done = D.getElementById('w-success');
  var noteText = note.innerHTML;
  function track(n, p) { try { if (T.track) T.track(n, p || {}); } catch (e) {} }

  var site = D.getElementById('w-site'), bad = null;
  /* any email is fine; the business website is how requests get vetted */
  function problem() {
    if (!(email.value || '').trim() || !email.checkValidity()) return [email, 'Please enter a valid email address'];
    if (!/^\s*\S+\.\S+\s*$/.test(site.value || '')) return [site, 'Please add your business website'];
    return null;
  }
  function show(p) {
    if (bad) bad.removeAttribute('aria-invalid');
    bad = p ? p[0] : null;
    if (p) { note.textContent = p[1]; note.classList.add('is-error'); bad.setAttribute('aria-invalid', 'true'); }
    else { note.innerHTML = noteText; note.classList.remove('is-error'); }
  }
  [email, site].forEach(function (el) { el.addEventListener('input', function () { if (bad === el) show(null); }); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var p = problem();
    if (p) { show(p); p[0].focus(); track('work_call_rejected', { field: p[0].id }); return; }
    show(null);
    btn.disabled = true;
    fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(new FormData(form)).toString() })
      .then(function (r) {
        if (!r.ok) throw new Error('bad');
        track('work_call_submit');
        form.hidden = true; note.hidden = true; done.hidden = false; done.focus();
      })
      .catch(function () {
        track('work_call_fail'); btn.disabled = false;
        show([email, "That didn't send. Try again, or email team@threeyearsfromnow.com"]);
      });
  });
})();
