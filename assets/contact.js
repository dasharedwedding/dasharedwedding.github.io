(function () {
    const form = document.getElementById('contactForm');
    const btn = document.getElementById('sendBtn');
    const ok = document.getElementById('statusOk');
    const err = document.getElementById('statusErr');

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

        // Simple required checks (let browser validations run too)
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        btn.disabled = true;
        btn.textContent = 'Sending…';

        try {
            const formData = new FormData(form);
            const res = await fetch(form.action, {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: formData
            });

            if (res.ok) {
                show(ok);
                hide(btn);
                lockForm(form);
            } else {
                // Try to parse Formspree error message, fallback to generic
                let msg = '';
                try {
                    const data = await res.json();
                    msg = data?.errors?.[0]?.message || '';
                } catch {}
                if (msg) err.textContent = `⚠︎ ${msg}`;
                show(err);
            }
        } catch {
            show(err);
        } finally {
            btn.disabled = false;
            btn.textContent = 'Send';
        }
    });
})();