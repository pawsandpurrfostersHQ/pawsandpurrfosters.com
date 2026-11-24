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

function formatLitterHeading(litterNumber) {
  const numeric = Number(litterNumber);
  if (!Number.isFinite(numeric) || numeric <= 0) return "Current foster kittens";

  const remainder = numeric % 100;
  let suffix = "th";
  if (remainder >= 11 && remainder <= 13) {
    suffix = "th";
  } else {
    switch (numeric % 10) {
      case 1: suffix = "st"; break;
      case 2: suffix = "nd"; break;
      case 3: suffix = "rd"; break;
      default: suffix = "th";
    }
  }

  return `${numeric}${suffix} Foster Litter`;
}

function groupKittensByLitter(kittenList) {
  const grouped = new Map();

  kittenList.forEach(kitten => {
    const litterNumber = kitten.litterNumber ?? kitten.litter;
    const entryKey = litterNumber === undefined || litterNumber === null || litterNumber === "" ? "unassigned" : Number(litterNumber);
    if (!grouped.has(entryKey)) grouped.set(entryKey, []);
    grouped.get(entryKey).push(kitten);
  });

  return [...grouped.entries()]
    .filter(([key]) => key !== "unassigned")
    .sort(([left], [right]) => Number(left) - Number(right))
    .map(([litterNumber, kittens]) => ({
      litterNumber,
      kittens: Number(litterNumber) === 10
        ? [...kittens].sort((left, right) => ["raymond", "wally"].indexOf(left.id) - ["raymond", "wally"].indexOf(right.id))
        : kittens
    }));
}

function renderKittenCard(kitten) {
  const status = kitten.adoptionStatus || kitten.status || "Available";
  const photo = kitten.image
    ? `<img src="${escapeHTML(kitten.image)}" alt="${escapeHTML(kitten.name)}" loading="lazy">`
    : `<div class="photo-placeholder card-photo"><span>Photo coming soon</span></div>`;

  const profileUrl = kitten.profileUrl
    ? `${kitten.profileUrl}${kitten.profileUrl.includes("?") ? "&" : "?"}from=current&back=${encodeURIComponent(window.location.href)}`
    : "";
  return `<article class="kitten-card" data-kitten-id="${escapeHTML(kitten.id)}"${profileUrl ? ` data-profile-url="${escapeHTML(profileUrl)}" role="link" tabindex="0" aria-label="Meet ${escapeHTML(kitten.name)}"` : ""}>
    <div class="card-photo-wrap">${photo}</div>
    <div class="card-content">
      <span class="status-badge ${statusClassName(status)}">${escapeHTML(status)}</span>
      <h3><span class="all-litters__name">${escapeHTML(kitten.name)}</span></h3>
      <p>${escapeHTML(shortBlurb(kitten))}</p>
    </div>
  </article>`;
}

function renderAllKittens() {
  if (typeof document === "undefined") return;
  const owner = typeof window !== "undefined" ? window : globalThis;
  const container = document.querySelector("#all-kittens-grid");
  if (!container || !Array.isArray(owner.PAWS_KITTENS)) return;

  const groups = groupKittensByLitter(owner.PAWS_KITTENS);

  if (!groups.length) {
    container.innerHTML = '<div class="empty-state">No foster kittens are available to display yet.</div>';
    return;
  }

  container.innerHTML = groups.map(({ litterNumber, kittens }) => {
    const heading = formatLitterHeading(litterNumber);
    const headingMarkup = heading.replace(/^(\d+(?:st|nd|rd|th))/, '<span class="all-litters__number">$1</span>');
    return `
      <section class="all-litters__group" id="litter-${escapeHTML(litterNumber)}">
        <h3 class="all-litters__heading">${headingMarkup}</h3>
        <div class="all-litters__carousel">
          <button class="carousel-button all-litters__arrow" type="button" aria-label="Previous kittens in ${escapeHTML(heading)}">‹</button>
          <div class="all-litters__cards" role="region" aria-label="${escapeHTML(heading)} kittens" tabindex="0">${kittens.map(renderKittenCard).join("")}</div>
          <button class="carousel-button all-litters__arrow" type="button" aria-label="Next kittens in ${escapeHTML(heading)}">›</button>
        </div>
      </section>
    `;
  }).join("");

  const targetId = typeof window !== "undefined" ? decodeURIComponent(window.location.hash.slice(1)) : "";
  const targetMatch = targetId.match(/^litter-(\d+)(?:--(.+))?$/);
  if (targetMatch) {
    const target = document.getElementById("litter-" + targetMatch[1]);
    if (target) {
      const highlightedNames = (targetMatch[2] || "").split(",").filter(Boolean);
      const kittenCards = highlightedNames.length
        ? highlightedNames.map(id => target.querySelector('.kitten-card[data-kitten-id="' + CSS.escape(id) + '"]')).filter(Boolean)
        : [];
      const highlightTargets = kittenCards.length ? kittenCards : [target];
      const cardsTrack = target.querySelector(".all-litters__cards");
      let pairHighlight = null;
      let resizeHighlight = null;

      if (kittenCards.length > 1 && cardsTrack) {
        pairHighlight = document.createElement("div");
        pairHighlight.className = "kitten-pair-highlight";
        pairHighlight.setAttribute("aria-hidden", "true");
        cardsTrack.appendChild(pairHighlight);

        const positionPairHighlight = () => {
          if (!pairHighlight?.isConnected || !kittenCards.every(card => card.isConnected)) return;
          const trackRect = cardsTrack.getBoundingClientRect();
          const cardRects = kittenCards.map(card => card.getBoundingClientRect());
          const left = Math.min(...cardRects.map(rect => rect.left - trackRect.left + cardsTrack.scrollLeft));
          const top = Math.min(...cardRects.map(rect => rect.top - trackRect.top + cardsTrack.scrollTop));
          const right = Math.max(...cardRects.map(rect => rect.right - trackRect.left + cardsTrack.scrollLeft));
          const bottom = Math.max(...cardRects.map(rect => rect.bottom - trackRect.top + cardsTrack.scrollTop));
          pairHighlight.style.left = (left - 8) + "px";
          pairHighlight.style.top = (top - 8) + "px";
          pairHighlight.style.width = (right - left + 16) + "px";
          pairHighlight.style.height = (bottom - top + 16) + "px";
        };

        resizeHighlight = positionPairHighlight;
        requestAnimationFrame(positionPairHighlight);
        window.addEventListener("resize", resizeHighlight);
      } else {
        highlightTargets.forEach(item => item.classList.add("is-highlighted"));
      }

      requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        if (cardsTrack && kittenCards.length) {
          cardsTrack.scrollTo({ left: Math.max(0, kittenCards[0].offsetLeft - 8), behavior: "smooth" });
        }
      });

      const dismissHighlight = event => {
        if (!target.contains(event.target)) {
          highlightTargets.forEach(item => item.classList.remove("is-highlighted"));
          pairHighlight?.remove();
          if (resizeHighlight) window.removeEventListener("resize", resizeHighlight);
          document.removeEventListener("click", dismissHighlight, true);
          if (window.history?.replaceState) window.history.replaceState(null, "", window.location.pathname + window.location.search);
        }
      };
      document.addEventListener("click", dismissHighlight, true);
    }
  }

  container.querySelectorAll(".kitten-card[data-profile-url]").forEach(card => {
    const openProfile = () => { window.location.href = card.dataset.profileUrl; };
    card.addEventListener("click", event => {
      if (event.target.closest("a, button")) return;
      openProfile();
    });
    card.addEventListener("keydown", event => {
      if ((event.key === "Enter" || event.key === " ") && event.target === card) {
        event.preventDefault();
        openProfile();
      }
    });
  });

  container.querySelectorAll(".all-litters__carousel").forEach(carousel => {
    const track = carousel.querySelector(".all-litters__cards");
    const [previous, next] = carousel.querySelectorAll(".all-litters__arrow");
    const updateControls = () => {
      const maxScroll = track.scrollWidth - track.clientWidth;
      const atStart = track.scrollLeft <= 2;
      const atEnd = track.scrollLeft >= maxScroll - 2;
      carousel.classList.toggle("has-overflow", maxScroll > 2);
      previous.disabled = atStart;
      next.disabled = atEnd;
      previous.hidden = maxScroll <= 2 || atStart;
      next.hidden = maxScroll <= 2 || atEnd;
    };
    const scrollCards = direction => {
      const card = track.querySelector(".kitten-card");
      if (!card) return;
      const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
      track.scrollBy({ left: direction * (card.getBoundingClientRect().width + gap), behavior: "smooth" });
    };

    previous.addEventListener("click", () => scrollCards(-1));
    next.addEventListener("click", () => scrollCards(1));
    track.addEventListener("scroll", updateControls, { passive: true });
    if (typeof window !== "undefined") window.addEventListener("resize", updateControls);
    updateControls();
  });
}

if (typeof globalThis !== "undefined") {
  globalThis.escapeHTML = escapeHTML;
  globalThis.statusClassName = statusClassName;
  globalThis.shortBlurb = shortBlurb;
  globalThis.groupKittensByLitter = groupKittensByLitter;
  globalThis.renderAllKittens = renderAllKittens;
}

if (typeof document !== "undefined") {
  renderAllKittens();
}

if (typeof module !== "undefined") {
  module.exports = {
    escapeHTML,
    statusClassName,
    shortBlurb,
    groupKittensByLitter,
    renderAllKittens
  };
}
