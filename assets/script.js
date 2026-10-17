document.addEventListener("DOMContentLoaded", () => {
    loadNav().then(() => {
        highlightActiveLink();
        initNavToggle();
    });

    setBodyClass();
    initCountdown();
    initToday();
    initReveal();
    initSevenEgg();
});

// Load shared nav into #nav-placeholder
async function loadNav() {
    const placeholder = document.getElementById("nav-placeholder");
    if (!placeholder) return;

    try {
        const res = await fetch("nav.html");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        placeholder.innerHTML = await res.text();
    } catch (err) {
        console.error("Failed to load nav:", err);
    }
}

// Highlight the current page in the nav
function highlightActiveLink() {
    const path = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-links a").forEach((a) => {
        const href = a.getAttribute("href");
        if (href === path || (path === "" && href === "index.html")) {
            a.classList.add("active");
        }
    });
}

// Mobile hamburger menu
function initNavToggle() {
    const nav = document.querySelector(".site-nav");
    if (!nav) return;
    const toggle = nav.querySelector(".nav-toggle");
    const links = nav.querySelector(".nav-links");
    if (!toggle || !links) return;

    toggle.addEventListener("click", () => {
        const open = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    // Close the menu after choosing a page
    links.addEventListener("click", (e) => {
        if (e.target.closest("a")) {
            nav.classList.remove("open");
            toggle.setAttribute("aria-expanded", "false");
        }
    });
}

// Add .home or .page class to <body> if not already set
function setBodyClass() {
    const body = document.body;
    if (body.classList.contains("home") || body.classList.contains("page")) return;

    const path = window.location.pathname.split("/").pop() || "index.html";
    if (path === "index.html" || path === "") {
        body.classList.add("home");
    } else {
        body.classList.add("page");
    }
}

// Countdown tiles only run on pages that have #countdown
function initCountdown() {
    const wrap = document.getElementById("countdown");
    if (!wrap) return;

    const daysEl = document.getElementById("cd-days");
    const hoursEl = document.getElementById("cd-hours");
    const minsEl = document.getElementById("cd-mins");
    const secsEl = document.getElementById("cd-secs");

    const targetDate = new Date("2026-11-07T15:00:00");
    const pad = (n) => String(n).padStart(2, "0");
    let timer;

    function tick() {
        const diff = targetDate - new Date();

        if (diff <= 0) {
            wrap.innerHTML = '<p class="count-done">It’s our wedding day!</p>';
            clearInterval(timer);
            return;
        }

        const totalSeconds = Math.floor(diff / 1000);
        daysEl.textContent = Math.floor(totalSeconds / 86400);
        hoursEl.textContent = pad(Math.floor((totalSeconds % 86400) / 3600));
        minsEl.textContent = pad(Math.floor((totalSeconds % 3600) / 60));
        secsEl.textContent = pad(totalSeconds % 60);
    }

    tick();
    timer = setInterval(tick, 1000);
}

// Fill in today's date on pages that show it (Travel weather section)
function initToday() {
    const el = document.getElementById("today");
    if (!el) return;
    el.textContent = new Date().toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
    });
}

// Gentle scroll-in reveal for card sections
function initReveal() {
    const els = document.querySelectorAll(".reveal");
    if (!els.length) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
        els.forEach((el) => el.classList.add("in"));
        return;
    }

    // Explicit root: these sections scroll inside .page-content, not the
    // document. Mobile Chrome doesn't reliably fire IntersectionObserver
    // callbacks for a target scrolled inside a nested overflow container
    // when left to the default (viewport) root, leaving .reveal sections
    // stuck at opacity:0 until something forces a layout recalc (e.g. a
    // rotation). Passing the actual scrolling ancestor as root fixes it.
    const io = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("in");
                    io.unobserve(entry.target);
                }
            });
        },
        { root: document.querySelector(".page-content"), threshold: 0.12, rootMargin: "0px 0px -30px 0px" }
    );

    els.forEach((el) => io.observe(el));
}

// Easter egg: click the "7" in the home page date 7 times
function initSevenEgg() {
    const seven = document.getElementById("egg-seven");
    if (!seven) return;

    const CLICKS_NEEDED = 7;
    let clicks = 0;

    seven.addEventListener("click", () => {
        clicks += 1;
        if (clicks < CLICKS_NEEDED) return;
        clicks = 0;

        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (!reduced) burstConfetti(seven);
        showEggCode("0803"); // if you see this you're a cheater lol
    });
}

// Confetti explosion from the center of an element, drawn on a temporary canvas
function burstConfetti(origin) {
    const canvas = document.createElement("canvas");
    canvas.className = "egg-confetti";
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);

    const rect = origin.getBoundingClientRect();
    const x0 = rect.left + rect.width / 2;
    const y0 = rect.top + rect.height / 2;
    const css = getComputedStyle(document.documentElement);
    const colors = ["--accent", "--accent-bright", "--ink", "--egg-purple", "--egg-purple-light"]
        .map((name) => css.getPropertyValue(name).trim());

    const pieces = Array.from({ length: 180 }, () => {
        const angle = Math.random() * Math.PI * 2;
        const speed = 6 + Math.random() * 14;
        return {
            x: x0,
            y: y0,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 6,
            w: 6 + Math.random() * 6,
            h: 8 + Math.random() * 8,
            rot: Math.random() * Math.PI,
            spin: (Math.random() - 0.5) * 0.4,
            color: colors[Math.floor(Math.random() * colors.length)],
        };
    });

    const start = performance.now();
    const DURATION = 3200;

    function frame(now) {
        const t = now - start;
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        ctx.globalAlpha = Math.max(0, 1 - Math.max(0, t - DURATION * 0.6) / (DURATION * 0.4));

        pieces.forEach((p) => {
            p.vx *= 0.985;
            p.vy = p.vy * 0.985 + 0.25;
            p.x += p.vx;
            p.y += p.vy;
            p.rot += p.spin;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            // Squash horizontally over time so pieces look like they flutter
            ctx.scale(Math.cos(p.rot * 2), 1);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.restore();
        });

        if (t < DURATION) {
            requestAnimationFrame(frame);
        } else {
            canvas.remove();
        }
    }

    requestAnimationFrame(frame);
}

// Big purple code in the middle of the screen; tap anywhere or press Esc to close
function showEggCode(code) {
    if (document.querySelector(".egg-reveal")) return;

    const reveal = document.createElement("div");
    reveal.className = "egg-reveal";
    reveal.setAttribute("role", "status");
    reveal.innerHTML = `<span class="egg-code">${code}</span>`;
    document.body.appendChild(reveal);

    function close() {
        reveal.classList.add("out");
        setTimeout(() => reveal.remove(), 400);
        document.removeEventListener("keydown", onKey);
    }

    function onKey(e) {
        if (e.key === "Escape") close();
    }

    reveal.addEventListener("click", close);
    document.addEventListener("keydown", onKey);
}
