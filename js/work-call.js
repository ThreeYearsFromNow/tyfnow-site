/* TYFNOW work-call.js: "Walk through the project on a call". Business email only; Sherry sends the invite by hand. */
(function () {
  'use strict';
  var W = window, D = document, T = W.TYFNOW || {};
  var form = D.getElementById('call-form');
  if (!form) return;
  var email = D.getElementById('w-email'), btn = D.getElementById('w-send'), note = D.getElementById('w-note'), done = D.getElementById('w-success');
  var noteText = note.innerHTML;
  function track(n, p) { try { if (T.track) T.track(n, p || {}); } catch (e) {} }

  /* personal mailboxes are turned away: this is for business owners */
  var FREE = ['gmail.com', 'googlemail.com', 'hotmail.com', 'hotmail.co.uk', 'outlook.com', 'outlook.co.uk', 'live.com', 'live.co.uk', 'msn.com',
    'yahoo.com', 'yahoo.co.uk', 'ymail.com', 'icloud.com', 'me.com', 'mac.com', 'aol.com', 'aol.co.uk', 'btinternet.com', 'sky.com',
    'virginmedia.com', 'talktalk.net', 'ntlworld.com', 'blueyonder.co.uk', 'protonmail.com', 'proton.me', 'pm.me', 'gmx.com', 'gmx.co.uk',
    'mail.com', 'zoho.com', 'yandex.com', 'tutanota.com', 'hey.com', 'fastmail.com'];

  function problem() {
    var v = (email.value || '').trim().toLowerCase();
    if (!v || !email.checkValidity()) return 'Please enter a valid email address';
    var dom = v.split('@').pop();
    if (FREE.indexOf(dom) !== -1) return 'Please use your business email';
    return '';
  }
  function show(msg) {
    if (msg) { note.textContent = msg; note.classList.add('is-error'); email.setAttribute('aria-invalid', 'true'); }
    else { note.innerHTML = noteText; note.classList.remove('is-error'); email.removeAttribute('aria-invalid'); }
  }
  email.addEventListener('input', function () { if (email.getAttribute('aria-invalid')) show(''); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var p = problem();
    if (p) { show(p); email.focus(); track('work_call_rejected', { reason: p.indexOf('business') !== -1 ? 'free_domain' : 'invalid' }); return; }
    show('');
    btn.disabled = true;
    fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(new FormData(form)).toString() })
      .then(function (r) {
        if (!r.ok) throw new Error('bad');
        track('work_call_submit');
        form.hidden = true; note.hidden = true; done.hidden = false; done.focus();
      })
      .catch(function () {
        track('work_call_fail'); btn.disabled = false;
        show("That didn't send. Try again, or email team@threeyearsfromnow.com");
      });
  });
})();
