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
        <button type="button" class="adoption-unsubscribe-close" aria-label="Close confirmation" hidden>×</button>
        <p class="eyebrow">Paws &amp; Purr Fosters</p>
        <h2 id="adoption-unsubscribe-title">Are You Sure You Want to Unsubscribe?</h2>
        <p id="adoption-unsubscribe-description">Would you like to stop receiving email notifications about upcoming kitten adoption events?</p>
        <div class="adoption-unsubscribe-actions">
          <button type="button" class="adoption-unsubscribe-no">No, keep me subscribed</button>
          <button type="button" class="adoption-unsubscribe-yes">Yes, unsubscribe</button>
        </div>
        <p class="adoption-unsubscribe-status" role="status" aria-live="polite"></p>
      </section>`;
    document.body.appendChild(confirmation);
    document.body.classList.add("adoption-email-modal-open");

    const title = confirmation.querySelector("#adoption-unsubscribe-title");
    const description = confirmation.querySelector("#adoption-unsubscribe-description");
    const actions = confirmation.querySelector(".adoption-unsubscribe-actions");
    const status = confirmation.querySelector(".adoption-unsubscribe-status");
    const yes = confirmation.querySelector(".adoption-unsubscribe-yes");
    const no = confirmation.querySelector(".adoption-unsubscribe-no");
    const close = confirmation.querySelector(".adoption-unsubscribe-close");
    let completed = false;

    function cleanUrl() {
      url.searchParams.delete("unsubscribe");
      window.history.replaceState({}, "", url.pathname + url.search + url.hash);
    }
    function closeConfirmation() {
      confirmation.remove();
      document.body.classList.remove("adoption-email-modal-open");
      cleanUrl();
      document.removeEventListener("keydown", handleConfirmationKeydown);
    }
    function handleConfirmationKeydown(event) {
      if (completed && event.key === "Escape") closeConfirmation();
    }
    close.addEventListener("click", closeConfirmation);
    confirmation.addEventListener("click", function (event) {
      if (completed && event.target === confirmation) closeConfirmation();
    });
    document.addEventListener("keydown", handleConfirmationKeydown);

    no.addEventListener("click", function () {
      title.textContent = "You're Staying Subscribed";
      description.textContent = "No changes were made. You'll continue receiving adoption event email notifications.";
      actions.innerHTML = '<a class="adoption-unsubscribe-website" href="' + SITE_BASE + '/">Visit Paws &amp; Purr Fosters</a>';
      status.textContent = "";
      cleanUrl();
    });

    yes.addEventListener("click", async function () {
      yes.disabled = true;
      no.disabled = true;
      yes.textContent = "Unsubscribing…";
      title.textContent = "Updating Your Email Preferences";
      description.textContent = "Please wait while we process your request.";
      status.textContent = "";
      try {
        const response = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "unsubscribe", token })
        });
        const result = await response.json();
        if (!response.ok || !result.ok) throw new Error(result.error || "We couldn't update your subscription. Please try again.");
        completed = true;
        confirmation.classList.add("is-complete");
        close.hidden = false;
        title.textContent = "You've Been Unsubscribed";
        description.textContent = "You've been unsubscribed from adoption event emails. If you change your mind, you can resubscribe at any time by signing up for Adoption Event Updates on this website.";
        actions.innerHTML = "";
        status.textContent = "";
        cleanUrl();
      } catch (error) {
        title.textContent = "We Couldn't Complete Your Request";
        description.textContent = error.message || "We couldn't process your unsubscribe request. Please try again.";
        yes.disabled = false;
        no.disabled = false;
        yes.textContent = "Yes, unsubscribe";
        status.textContent = "";
      }
    });

    yes.focus();
  }
  processUnsubscribe();
})();