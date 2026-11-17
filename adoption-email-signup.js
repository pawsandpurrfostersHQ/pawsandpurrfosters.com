(function () {
  "use strict";
  const ENDPOINT = "https://ovnbbpcrwbvotyevghcx.supabase.co/functions/v1/adoption-event-emails";
  const SITE_BASE = "https://pawsandpurrfostershq.github.io/pawsandpurrfosters.com";
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
    submit.textContent = "Signing Up…";
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

    const confirmation = document.createElement("div");
    confirmation.className = "adoption-unsubscribe-modal";
    confirmation.innerHTML = `
      <section class="adoption-unsubscribe-dialog" role="dialog" aria-modal="true" aria-labelledby="adoption-unsubscribe-title" aria-describedby="adoption-unsubscribe-description">
        <p class="eyebrow">Paws &amp; Purr Fosters</p>
        <h2 id="adoption-unsubscribe-title">Unsubscribe from Adoption Updates?</h2>
        <p id="adoption-unsubscribe-description">Are you sure you no longer want to receive email notifications about upcoming kitten adoption events?</p>
        <div class="adoption-unsubscribe-actions">
          <button type="button" class="adoption-unsubscribe-no">No, keep me subscribed</button>
          <button type="button" class="adoption-unsubscribe-yes">Yes, continue</button>
        </div>
        <p class="adoption-unsubscribe-status" role="status" aria-live="polite"></p>
      </section>`;
    document.body.appendChild(confirmation);
    document.body.classList.add("adoption-email-modal-open");

    const dialog = confirmation.querySelector(".adoption-unsubscribe-dialog");
    const title = confirmation.querySelector("#adoption-unsubscribe-title");
    const description = confirmation.querySelector("#adoption-unsubscribe-description");
    const actions = confirmation.querySelector(".adoption-unsubscribe-actions");
    const status = confirmation.querySelector(".adoption-unsubscribe-status");
    const yes = confirmation.querySelector(".adoption-unsubscribe-yes");
    const no = confirmation.querySelector(".adoption-unsubscribe-no");

    function finish() {
      confirmation.remove();
      document.body.classList.remove("adoption-email-modal-open");
      url.searchParams.delete("unsubscribe");
      window.history.replaceState({}, "", url.pathname + url.search + url.hash);
    }
    no.addEventListener("click", function () {
      title.textContent = "You're staying subscribed";
      description.textContent = "No changes were made. You'll continue receiving adoption event email notifications.";
      actions.innerHTML = '<a class="adoption-unsubscribe-website" href="' + SITE_BASE + '/">Return to Paws &amp; Purr Fosters</a>';
      status.textContent = "";
      url.searchParams.delete("unsubscribe");
      window.history.replaceState({}, "", url.pathname + url.search + url.hash);
    });

    yes.addEventListener("click", function () {
      title.textContent = "Please Confirm";
      description.textContent = "Select Confirm Unsubscribe below to stop receiving adoption event emails. You can sign up again at any time.";
      actions.innerHTML = '<button type="button" class="adoption-unsubscribe-no">Go Back</button><button type="button" class="adoption-unsubscribe-confirm">Confirm Unsubscribe</button>';
      actions.querySelector(".adoption-unsubscribe-no").addEventListener("click", function () {
        title.textContent = "Unsubscribe from Adoption Updates?";
        description.textContent = "Are you sure you no longer want to receive email notifications about upcoming kitten adoption events?";
        actions.innerHTML = '<button type="button" class="adoption-unsubscribe-no">No, keep me subscribed</button><button type="button" class="adoption-unsubscribe-yes">Yes, continue</button>';
        actions.querySelector(".adoption-unsubscribe-no").addEventListener("click", function () {
          title.textContent = "You're staying subscribed";
          description.textContent = "No changes were made. You'll continue receiving adoption event email notifications.";
          actions.innerHTML = '<a class="adoption-unsubscribe-website" href="' + SITE_BASE + '/">Return to Paws &amp; Purr Fosters</a>';
          url.searchParams.delete("unsubscribe");
          window.history.replaceState({}, "", url.pathname + url.search + url.hash);
        });
        actions.querySelector(".adoption-unsubscribe-yes").addEventListener("click", confirmStep);
      });
      actions.querySelector(".adoption-unsubscribe-confirm").addEventListener("click", confirmUnsubscribe);
    });

    async function confirmUnsubscribe() {
      const confirmButton = actions.querySelector(".adoption-unsubscribe-confirm");
      if (confirmButton) { confirmButton.disabled = true; confirmButton.textContent = "Unsubscribing…"; }
      title.textContent = "Confirming Your Unsubscription";
      description.textContent = "Please wait while we update your email preferences.";
      status.textContent = "Processing your request…";
      try {
        const response = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "unsubscribe", token })
        });
        const result = await response.json();
        if (!response.ok || !result.ok) throw new Error(result.error || "We couldn't update your subscription.");
        title.textContent = "You've Been Unsubscribed";
        description.textContent = "You will no longer receive adoption event email notifications from Paws & Purr Fosters. You can sign up again at any time.";
        actions.innerHTML = '<a class="adoption-unsubscribe-website" href="' + SITE_BASE + '/">Visit Paws &amp; Purr Fosters</a>';
        status.textContent = "Your email preferences have been updated.";
        url.searchParams.delete("unsubscribe");
        window.history.replaceState({}, "", url.pathname + url.search + url.hash);
      } catch (error) {
        title.textContent = "We Couldn't Update Your Preferences";
        description.textContent = error.message || "We couldn't process this unsubscribe request. Please try again.";
        actions.innerHTML = '<button type="button" class="adoption-unsubscribe-retry">Try Again</button><a class="adoption-unsubscribe-website" href="' + SITE_BASE + '/">Visit Paws &amp; Purr Fosters</a>';
        actions.querySelector(".adoption-unsubscribe-retry").addEventListener("click", confirmUnsubscribe);
        status.textContent = "";
      }
    }

    function confirmStep() {
      title.textContent = "Please Confirm";
      description.textContent = "Select Confirm Unsubscribe below to stop receiving adoption event emails. You can sign up again at any time.";
      actions.innerHTML = '<button type="button" class="adoption-unsubscribe-no">Go Back</button><button type="button" class="adoption-unsubscribe-confirm">Confirm Unsubscribe</button>';
      actions.querySelector(".adoption-unsubscribe-confirm").addEventListener("click", confirmUnsubscribe);
      actions.querySelector(".adoption-unsubscribe-no").addEventListener("click", function () {
        title.textContent = "Unsubscribe from Adoption Updates?";
        description.textContent = "Are you sure you no longer want to receive email notifications about upcoming kitten adoption events?";
        actions.innerHTML = '<button type="button" class="adoption-unsubscribe-no">No, keep me subscribed</button><button type="button" class="adoption-unsubscribe-yes">Yes, continue</button>';
        actions.querySelector(".adoption-unsubscribe-no").addEventListener("click", function () {
          title.textContent = "You're staying subscribed";
          description.textContent = "No changes were made. You'll continue receiving adoption event email notifications.";
          actions.innerHTML = '<a class="adoption-unsubscribe-website" href="' + SITE_BASE + '/">Return to Paws &amp; Purr Fosters</a>';
          url.searchParams.delete("unsubscribe");
          window.history.replaceState({}, "", url.pathname + url.search + url.hash);
        });
        actions.querySelector(".adoption-unsubscribe-yes").addEventListener("click", confirmStep);
      });
    }

    yes.focus();
  }
  processUnsubscribe();
})();