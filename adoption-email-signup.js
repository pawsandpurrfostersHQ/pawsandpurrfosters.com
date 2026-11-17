(function () {
  "use strict";
  const ENDPOINT = "https://ovnbbpcrwbvotyevghcx.supabase.co/functions/v1/adoption-event-emails";
  const modal = document.createElement("div");
  modal.className = "adoption-email-modal";
  modal.hidden = true;
  modal.innerHTML = `
    <div class="adoption-email-dialog" role="dialog" aria-modal="true" aria-labelledby="adoption-email-title" aria-describedby="adoption-email-description">
      <button class="adoption-email-close" type="button" aria-label="Close">×</button>
      <p class="eyebrow">Paws &amp; Purr Fosters</p>
      <h2 id="adoption-email-title">Adoption Event Updates</h2>
      <p id="adoption-email-description">Enter your email address to subscribe. You'll receive email notifications when new adoption events are posted. You can unsubscribe at any time using the link included in our emails.</p>
      <form class="adoption-email-form">
        <label for="adoption-email-address">Email address</label>
        <input id="adoption-email-address" name="email" type="email" autocomplete="email" maxlength="254" placeholder="you@example.com" required>
        <input class="adoption-email-honeypot" type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true">
        <button class="adoption-email-submit" type="submit">Sign Up</button>
        <p class="adoption-email-status" role="status" aria-live="polite"></p>
      </form>
    </div>`;
  document.body.appendChild(modal);

  const form = modal.querySelector("form");
  const emailInput = modal.querySelector('input[name="email"]');
  const submit = modal.querySelector("button[type='submit']");
  const status = modal.querySelector(".adoption-email-status");
  let previousFocus = null;

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove("adoption-email-modal-open");
    if (previousFocus && typeof previousFocus.focus === "function") previousFocus.focus();
  }
  function openModal(trigger) {
    previousFocus = trigger || document.activeElement;
    modal.hidden = false;
    document.body.classList.add("adoption-email-modal-open");
    status.textContent = "";
    window.setTimeout(() => emailInput.focus(), 0);
  }
  document.addEventListener("click", function (event) {
    const trigger = event.target.closest(".adoption-email-open");
    if (trigger) { openModal(trigger); return; }
    if (event.target.closest(".adoption-email-close") || event.target === modal) closeModal();
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !modal.hidden) closeModal();
  });

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;
    submit.disabled = true;
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "subscribe",
          email: emailInput.value.trim(),
          _honey: form.elements._honey.value
        })
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || "We couldn't complete your signup.");
      form.reset();
      status.textContent = "You're subscribed to Adoption Event Updates! We'll email you when a new event is posted.";
    } catch (error) {
      status.textContent = error.message || "Sorry, signup isn't available right now. Please try again later.";
    } finally {
      submit.disabled = false;
      submit.textContent = "Sign Up";
    }
  });

  async function processUnsubscribe() {
    const url = new URL(window.location.href);
    const token = url.searchParams.get("unsubscribe");
    if (!token) return;
    const notice = document.createElement("p");
    notice.className = "adoption-email-notice";
    notice.setAttribute("role", "status");
    notice.textContent = "Updating your email preferences…";
    const banner = document.querySelector(".events-page-banner");
    if (banner) banner.insertAdjacentElement("afterend", notice);
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unsubscribe", token })
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || "We couldn't update your subscription.");
      notice.textContent = "You've been unsubscribed from adoption event emails. You won't receive future event notifications.";
    } catch (error) {
      notice.textContent = error.message || "We couldn't process this unsubscribe link. Please contact pawsandpurrsfosters@gmail.com for help.";
    } finally {
      url.searchParams.delete("unsubscribe");
      window.history.replaceState({}, "", url.pathname + url.search + url.hash);
    }
  }
  processUnsubscribe();
})();