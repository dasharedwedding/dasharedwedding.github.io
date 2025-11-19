document.addEventListener("DOMContentLoaded", () => {
    loadNav().then(() => {
        highlightActiveLink();
        setBodyClass();
    });

    initCountdown();
});

const el = document.getElementById('today');
if (el) {
    el.textContent = new Date().toLocaleDateString(undefined, {
        month: 'long', day: 'numeric'
    });
}

// Load shared nav into #nav-placeholder
async function loadNav() {
    const placeholder = document.getElementById("nav-placeholder");
    if (!placeholder) return;

    try {
        const res = await fetch("nav.html");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const html = await res.text();
        placeholder.innerHTML = html;
    } catch (err) {
        console.error("Failed to load nav:", err);
    }
}

// Highlight the current page in the nav
function highlightActiveLink() {
    const path = window.location.pathname.split("/").pop() || "index.html";
    const links = document.querySelectorAll("nav a");

    links.forEach((a) => {
        const href = a.getAttribute("href");
        if (href === path || (path === "" && href === "index.html")) {
            a.classList.add("active");
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

// Countdown only runs on pages that have #countdown-values
function initCountdown() {
    const countdownEl = document.getElementById("countdown-values");
    if (!countdownEl) return; // do nothing on non-home pages

    const targetDate = new Date("2026-11-07T00:00:00");

    function updateCountdown() {
        const now = new Date();
        const diff = targetDate - now;

        if (diff <= 0) {
            countdownEl.textContent = "It's our wedding day!";
            return;
        }

        const totalSeconds = Math.floor(diff / 1000);
        const days = Math.floor(totalSeconds / (60 * 60 * 24));
        const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
        const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
        const seconds = totalSeconds % 60;

        countdownEl.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
}