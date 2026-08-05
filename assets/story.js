// Story page: interactive national parks map.
// Each .park-dot is positioned over the albersUsa map; hovering, focusing or
// tapping one pops up the photo of us at that park. The thumbnail rail below
// the map holds the same twenty parks, paired to the dots by data-park index:
// highlighting either one highlights the other.
document.addEventListener("DOMContentLoaded", initParkMap);

function initParkMap() {
    const stage = document.querySelector(".parkmap-stage");
    const pop = document.getElementById("park-pop");
    if (!stage || !pop) return;

    const dots = Array.from(stage.querySelectorAll(".park-dot"));
    if (!dots.length) return;

    const rail = document.querySelector(".park-rail");
    const thumbs = rail ? Array.from(rail.querySelectorAll(".park-thumb")) : [];

    const img = pop.querySelector("img");
    const caption = pop.querySelector("figcaption");

    let current = null;   // dot currently shown
    let pinned = null;    // dot locked open by a click/tap

    const thumbFor = (dot) => thumbs[Number(dot.dataset.park)];
    const dotFor = (thumb) => dots[Number(thumb.dataset.park)];

    // Bring a thumb into view without yanking the page around: the rail is the
    // only thing that should move, so scroll it directly rather than using
    // scrollIntoView, which would also scroll .page-content.
    //
    // Assigning scrollLeft rather than scrollTo({behavior:"smooth"}) on purpose.
    // The glide comes from `scroll-behavior` in the stylesheet, so where that
    // animation is unavailable the rail still lands in the right place — it
    // just jumps. scrollTo with a smooth behavior can silently do nothing.
    function revealThumb(thumb) {
        if (!rail) return;
        const target = thumb.offsetLeft - (rail.clientWidth - thumb.offsetWidth) / 2;
        const left = Math.max(0, Math.min(target, rail.scrollWidth - rail.clientWidth));
        if (Math.abs(left - rail.scrollLeft) < 2) return;
        rail.scrollLeft = left;
    }

    function show(dot, fromRail) {
        if (current === dot) return;
        current = dot;

        const src = dot.dataset.img;
        if (img.getAttribute("src") !== src) {
            img.setAttribute("src", src);
            img.alt = "Us at " + dot.dataset.name;
        }
        caption.textContent = dot.dataset.name;

        dots.forEach((d) => d.classList.toggle("is-active", d === dot));
        thumbs.forEach((t) => t.classList.toggle("is-active", t === thumbFor(dot)));

        // Only chase the rail when the map drove the change; scrolling the rail
        // out from under the pointer that is hovering it feels like a fight.
        if (!fromRail) {
            const thumb = thumbFor(dot);
            if (thumb) revealThumb(thumb);
        }

        pop.hidden = false;
        // Lay the popup out while it is still invisible so we can measure it.
        position(dot);
        requestAnimationFrame(() => pop.classList.add("is-open"));
    }

    function hide() {
        current = null;
        pinned = null;
        dots.forEach((d) => d.classList.remove("is-active"));
        thumbs.forEach((t) => t.classList.remove("is-active"));
        pop.classList.remove("is-open");
        pop.hidden = true;
    }

    // Place the popup above the dot, flipping below it near the top edge and
    // clamping to the stage so it never spills outside the map.
    function position(dot) {
        const gap = 14;
        const pad = 4;
        const stageW = stage.clientWidth;
        const stageH = stage.clientHeight;
        const dotX = dot.offsetLeft + dot.offsetWidth / 2;
        const dotY = dot.offsetTop + dot.offsetHeight / 2;
        const popW = pop.offsetWidth;
        const popH = pop.offsetHeight;

        const above = dotY - dot.offsetHeight / 2 - gap - popH >= 0;
        const top = above
            ? dotY - dot.offsetHeight / 2 - gap - popH
            : dotY + dot.offsetHeight / 2 + gap;

        let left = dotX - popW / 2;
        left = Math.max(pad, Math.min(left, stageW - popW - pad));

        pop.classList.toggle("above", above);
        pop.classList.toggle("below", !above);
        pop.style.left = left + "px";
        pop.style.top = Math.max(pad, Math.min(top, stageH - popH - pad)) + "px";
        // Keep the little tail pointing at the dot even after clamping.
        pop.style.setProperty("--tail-x", (dotX - left) + "px");
    }

    dots.forEach((dot) => {
        dot.addEventListener("mouseenter", () => {
            if (!pinned) show(dot);
        });

        dot.addEventListener("mouseleave", () => {
            if (!pinned && document.activeElement !== dot) hide();
        });

        dot.addEventListener("focus", () => show(dot));

        dot.addEventListener("blur", () => {
            if (!pinned) hide();
        });

        // Click (and tap, where there is no hover) locks the popup open.
        dot.addEventListener("click", (e) => {
            e.stopPropagation();
            if (pinned === dot) {
                hide();
            } else {
                show(dot);
                pinned = dot;
            }
        });
    });

    // The rail mirrors the map: pointing at a thumb lights up its dot so you
    // can see where the photo was taken, and vice versa.
    thumbs.forEach((thumb) => {
        const dot = dotFor(thumb);
        if (!dot) return;

        thumb.addEventListener("mouseenter", () => {
            if (!pinned) show(dot, true);
        });

        thumb.addEventListener("mouseleave", () => {
            if (!pinned && document.activeElement !== thumb) hide();
        });

        thumb.addEventListener("focus", () => show(dot, true));

        thumb.addEventListener("blur", () => {
            if (!pinned) hide();
        });

        thumb.addEventListener("click", (e) => {
            e.stopPropagation();
            if (pinned === dot) {
                hide();
            } else {
                show(dot, true);
                pinned = dot;
            }
        });
    });

    document.addEventListener("click", () => {
        if (pinned) hide();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && current) {
            const dot = current;
            hide();
            dot.blur();
        }
    });

    // The stage keeps its aspect ratio, but a resize changes the pixel maths.
    window.addEventListener("resize", () => {
        if (current) position(current);
    });

    const scroller = stage.closest(".parkmap-scroll");
    if (scroller) scroller.addEventListener("scroll", () => current && position(current));
}
