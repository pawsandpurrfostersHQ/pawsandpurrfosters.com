/* Private editor UI foundation. Data is read-only until authenticated API is configured. */
(() => {
  const $ = selector => document.querySelector(selector);
  const kittens = Array.isArray(window.PAWS_KITTENS) ? window.PAWS_KITTENS : [];
  const events = window.PAWS_EVENT_DATA || {};
  const alumni = Array.isArray(window.PAWS_FOSTER_ALUMNI) ? window.PAWS_FOSTER_ALUMNI : [];
  const login = $("#login"), dashboard = $("#dashboard");
  $("#sign-in").addEventListener("click", () => {
    $("#login-message").textContent = "Secure GitHub sign-in is not connected yet. No credentials are collected on this page.";
  });
  $("#sign-out").addEventListener("click", () => { dashboard.hidden = true; login.hidden = false; });
  document.querySelectorAll(".tab").forEach(tab => tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(item => item.classList.toggle("active", item === tab));
    document.querySelectorAll(".view").forEach(view => view.hidden = view.id !== "view-" + tab.dataset.view);
  }));
  $("#kitten-list").innerHTML = kittens.map(kitten => `<div class="record"><img src="../${escapeAttr(kitten.image || "")}" alt=""><span><strong>${escapeText(kitten.name)}</strong><small>${escapeText(kitten.status || kitten.adoptionStatus || "No status")}</small></span></div>`).join("");
  const heroPhotos = (window.FOSTER_CAROUSEL_PHOTOS || []);
  $("#hero-photo-list").innerHTML = heroPhotos.length ? heroPhotos.map((photo,i)=>`<div class="summary-item">${i+1}. ${escapeText(photo)}</div>`).join("") : '<p class="muted">The homepage carousel currently has no configured photo list.</p>';
  const featured = events.featuredEvent || {}, special = events.specialEvent || {};
  $("#event-summary").innerHTML = [`<div class="summary-item"><strong>Featured event:</strong> ${escapeText(featured.location || "Not set")} · ${escapeText(featured.date || "")}</div>`,`<div class="summary-item"><strong>Special event:</strong> ${escapeText(special.title || "Not set")} · ${escapeText(special.date || "")}</div>`,`<div class="summary-item"><strong>Regular locations:</strong> ${(events.regularSchedule?.locations || []).length}</div>`].join("");
  $("#alumni-summary").innerHTML = `<div class="summary-item"><strong>${alumni.length}</strong> alumni records currently on the site.</div><p class="muted">Adoption-to-alumni conversion will be connected after the editor's secure save workflow is ready.</p>`;
  $("#preview").addEventListener("click", () => {
    $("#preview-content").innerHTML = `<p>This is a read-only preview of the current live data. Once editing is enabled, this panel will show your unsaved changes before publication.</p><h3>Current foster profiles (${kittens.length})</h3><ul>${kittens.map(k=>`<li>${escapeText(k.name)} — ${escapeText(k.status || "")}</li>`).join("")}</ul><h3>Alumni records (${alumni.length})</h3>`;
    $("#preview-dialog").showModal();
  });
  $("#close-preview").addEventListener("click", () => $("#preview-dialog").close());
  $("#publish").addEventListener("click", () => {});
  function escapeText(value){return String(value ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  function escapeAttr(value){return escapeText(value);}
})();