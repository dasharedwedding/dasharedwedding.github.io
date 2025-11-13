// ===== SIMPLE PASSWORD PROTECT (client-side only) ===== //

// You deserve to know the password if you are hacking our site :)
// That does not mean you are invited lol
const WEDDING_PASSWORD = "110726";
const ACCESS_KEY = "wedding_site_access_v1";

(function initPasswordGate() {
    // Mark that we're checking auth so CSS hides content
    document.documentElement.classList.add("auth-check");

    const hasAccess = localStorage.getItem(ACCESS_KEY) === "granted";

    if (hasAccess) {
        // User already unlocked
        document.documentElement.classList.remove("auth-check");
        document.documentElement.classList.add("auth-ok");
        return;
    }

    // Otherwise, build and show overlay
    showPasswordOverlay();
})();

function showPasswordOverlay() {
    const overlay = document.createElement("div");
    overlay.className = "password-overlay";

    overlay.innerHTML = `
    <div class="password-box">
      <h2>Renard & Dasha</h2>
      <p>Enter our wedding password to view the site.</p>
      <input
        type="password"
        class="password-input"
        id="wedding-password-input"
        placeholder="Password"
        autocomplete="off"
      />
      <button class="password-button" id="wedding-password-submit">
        Enter
      </button>
      <div class="password-error" id="wedding-password-error" style="display:none;">
        Incorrect password. Please try again.
      </div>
    </div>
  `;

    document.body.appendChild(overlay);

    const input = document.getElementById("wedding-password-input");
    const button = document.getElementById("wedding-password-submit");
    const error = document.getElementById("wedding-password-error");

    function attempt() {
        const value = (input.value || "").trim();
        if (value === WEDDING_PASSWORD) {
            localStorage.setItem(ACCESS_KEY, "granted");
            document.documentElement.classList.remove("auth-check");
            document.documentElement.classList.add("auth-ok");
            overlay.remove();
        } else {
            error.style.display = "block";
            input.value = "";
            input.focus();
        }
    }

    button.addEventListener("click", attempt);
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") attempt();
    });

    input.focus();
}