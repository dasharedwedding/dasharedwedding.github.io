(function () {
    const form = document.getElementById('rsvpForm');
    const btn = document.getElementById('rsvpBtn');
    const ok = document.getElementById('rsvpOk');
    const err = document.getElementById('rsvpErr');

    function show(el) { el.style.display = 'inline-flex'; }
    function hide(el) { el.style.display = 'none'; }

    function lockForm(formEl) {
        formEl.classList.add('is-disabled');
        formEl.setAttribute('aria-disabled', 'true');
        formEl.setAttribute('inert', ''); // modern browsers block focus/interaction
        formEl.querySelectorAll('input, textarea, button, select').forEach(el => {
            el.disabled = true;
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        hide(ok); hide(err);

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        btn.disabled = true;
        btn.textContent = 'Sending…';

        try {
            const formData = new FormData(form);
            // Google Forms doesn't allow CORS, so the response is opaque —
            // we can't read success/failure from it, only from a thrown network error.
            await fetch(form.action, {
                method: 'POST',
                mode: 'no-cors',
                body: formData
            });

            show(ok);
            hide(btn);
            lockForm(form);
        } catch {
            show(err);
        } finally {
            btn.disabled = false;
            btn.textContent = 'Send RSVP';
        }
    });
})();
