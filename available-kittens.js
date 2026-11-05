function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function statusClassName(status) {
  const normalized = String(status || "Available");
  const map = {
    "Available": "status-available",
    "Returned — Available": "status-returned",
    "Pending Interest": "status-pending",
    "Almost Available": "status-almost",
    "Pre-Adopted": "status-pre-adopted",
    "Coming Soon": "status-coming-soon",
    "Adopted": "status-adopted"
  };
  return map[normalized] || "status-available";
}

function shortBlurb(kitten) {
  const descriptions = typeof globalThis !== "undefined" ? globalThis.PAWS_KITTEN_CARD_DESCRIPTIONS : null;
  if (kitten.description) return kitten.description;
  if (descriptions?.[kitten.id]) return descriptions[kitten.id];
  if (kitten.bio) return kitten.bio;
  return "This sweet kitten is growing, learning, and preparing for their next chapter in foster care.";
}

function isAvailableStatus(kitten) {
  const status = kitten.adoptionStatus || kitten.status || "Available";
  return new Set([
    "Available",
    "Returned — Available",
    "Pending Interest"
  ]).has(status);
}

function renderAvailableKittens() {
  if (typeof document === "undefined") return;
  const owner = typeof window !== "undefined" ? window : globalThis;
  const container = document.querySelector("#available-kittens-grid");
  if (!container || !Array.isArray(owner.PAWS_KITTENS)) return;

  const matches = owner.PAWS_KITTENS.filter(isAvailableStatus);

  if (!matches.length) {
    container.innerHTML = '<div class="empty-state">No kittens are currently available for adoption.</div>';
    return;
  }

  container.innerHTML = matches.map(kitten => {
    const status = kitten.adoptionStatus || kitten.status || "Available";
    const photo = kitten.image
      ? `<img src="${escapeHTML(kitten.image)}" alt="${escapeHTML(kitten.name)}" loading="lazy">`
      : `<div class="photo-placeholder card-photo"><span>Photo coming soon</span></div>`;

    return `<article class="kitten-card">
      <div class="card-photo-wrap">${photo}</div>
      <div class="card-content">
        <span class="status-badge ${statusClassName(status)}">${escapeHTML(status)}</span>
        <h3>${escapeHTML(kitten.name)}</h3>
        <p>${escapeHTML(shortBlurb(kitten))}</p>
        <a class="card-link" href="${escapeHTML(kitten.profileUrl || "#")}">Get to Know ${escapeHTML(kitten.name)} →</a>
      </div>
    </article>`;
  }).join("");
}

if (typeof globalThis !== "undefined") {
  globalThis.escapeHTML = escapeHTML;
  globalThis.statusClassName = statusClassName;
  globalThis.shortBlurb = shortBlurb;
  globalThis.isAvailableStatus = isAvailableStatus;
  globalThis.renderAvailableKittens = renderAvailableKittens;
}

if (typeof document !== "undefined") {
  renderAvailableKittens();
}

if (typeof module !== "undefined") {
  module.exports = {
    escapeHTML,
    statusClassName,
    shortBlurb,
    isAvailableStatus,
    renderAvailableKittens
  };
}
