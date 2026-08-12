document.addEventListener("DOMContentLoaded", () => {
    loadNav().then(() => {
        highlightActiveLink();
        initNavToggle();
    });

    setBodyClass();
    initCountdown();
    initToday();
    initReveal();
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
