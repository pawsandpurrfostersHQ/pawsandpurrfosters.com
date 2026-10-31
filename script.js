// ==========================================
// FOSTER PHOTO CAROUSEL — EDIT HERE
// Add or remove your own photo filenames from assets/hero.
// Example: "photo1.jpg"
// ==========================================
const FOSTER_CAROUSEL_PHOTOS = [
  "foster-01.png",
  "foster-02.png",
  "foster-03.png",
  "foster-04.png",
  "foster-05.png",
  "foster-06.png",
  "foster-07.png",
  "foster-08.png",
  "foster-09.png",
  "foster-10.png",
  "foster-11.png",
  "foster-12.png",
  "foster-13.png",
  "foster-14.png",
  "foster-15.png",
  "foster-16.png",
  "foster-17.png",
  "foster-18.png",
  "foster-19.png",
  "foster-20.png",
  "foster-21.png",
  "foster-22.png",
  "foster-23.png"
];

// ==========================================
// ABOUT STORY — EDIT HERE
// Keep the story paragraphs together in this object.
// ==========================================
const ABOUT_STORY = {
  paragraphs: [
    "Paws & Purr Fosters is a small foster team run by my brother and me, with the help of our family. We officially began fostering kittens on February 29, 2024. Before we officially began fostering, we unexpectedly raised a single kitten. That kitten was Figaro, but we called him Fig. Fig passed away in 2020. Fig showed me how much love I could have for a kitten and inspired me to begin fostering.",
    "Beginning fostering on February 29, 2024 allowed me to honor Fig's impact by helping other kittens. We are now on our {{currentLitter}} litter and have fostered {{kittenCount}} kittens so far. Every kitten receives love, care, socialization, positive experiences, play, and opportunities to build confidence while waiting for their forever homes.",
    "All of our kittens are harness-trained to some degree while in our care. The longer they stay with us, the more opportunity they have to become fully comfortable with the harness. Harness training helps kittens build confidence and experience new things, including safe trips to the veterinarian and fun adventures with their future families. We're proud of what we do and look forward to helping many more kittens find the loving homes they deserve."
  ]
};

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function getFosterHistoryTotals() {
  const currentKittens = window.PAWS_KITTENS;
  const alumniKittens = window.PAWS_FOSTER_ALUMNI;
  if (!Array.isArray(currentKittens) || !Array.isArray(alumniKittens)) {
    console.error("Foster history counts could not be calculated because kitten records are missing.");
    return null;
  }

  const kittensById = new Map();
  let currentLitter = 0;
  for (const kitten of [...currentKittens, ...alumniKittens]) {
    const litterNumber = Number(kitten.litterNumber ?? kitten.fosterLitter);
    if (typeof kitten.id !== "string" || !kitten.id.trim() || !Number.isInteger(litterNumber) || litterNumber < 1) {
      console.error("Foster history counts could not be calculated because a kitten record is missing its ID or litter number.");
      return null;
    }
    currentLitter = Math.max(currentLitter, litterNumber);
    kittensById.set(kitten.id, kitten);
  }

  if (!kittensById.size || !currentLitter) {
    console.error("Foster history counts could not be calculated because kitten IDs or litter numbers are missing.");
    return null;
  }

  const litterSuffix = currentLitter % 100 >= 11 && currentLitter % 100 <= 13
    ? "th"
    : ({ 1: "st", 2: "nd", 3: "rd" }[currentLitter % 10] || "th");
  return {
    kittenCount: kittensById.size,
    currentLitter: `${currentLitter}${litterSuffix}`
  };
}

function renderAbout() {
  const container = document.querySelector("#about-content");
  if (!container) return;
  const totals = getFosterHistoryTotals();
  if (!totals) {
    container.innerHTML = '<p class="empty-state" role="alert">Foster history totals could not be loaded.</p>';
    return;
  }
  const paragraphs = ABOUT_STORY.paragraphs.map(text =>
    `<p>${escapeHTML(text.replaceAll("{{currentLitter}}", totals.currentLitter).replaceAll("{{kittenCount}}", String(totals.kittenCount)))}</p>`
  ).join("");

  container.innerHTML = `
    <div class="about-accent"><span>Since</span><strong>2024</strong><span>${totals.kittenCount} kittens fostered</span></div>
    <div>
      <p class="eyebrow">About Paws &amp; Purr Fosters</p>
      <h2>A small foster team, with a lot of love to give.</h2>
      ${paragraphs}
    </div>`;
}

function renderFosterPhotoCarousel() {
  const slides = document.querySelector("#hero-slides");
  const empty = document.querySelector("#hero-empty");
  const previous = document.querySelector("#hero-previous");
  const next = document.querySelector("#hero-next");
  const dots = document.querySelector("#hero-dots");
  if (!slides || !empty || !previous || !next) return;

  const photoPaths = FOSTER_CAROUSEL_PHOTOS.filter(Boolean).map(filename => `assets/hero/${filename}`);
  if (!photoPaths.length) return;

  empty.hidden = true;
  slides.innerHTML = photoPaths.map((path, index) => `
    <img class="hero-photo${index === 0 ? " is-active" : ""}" src="${escapeHTML(path)}"
      alt="Paws &amp; Purr foster kitten${photoPaths.length > 1 ? "s" : ""}" ${index ? "loading=\"lazy\"" : ""}>
  `).join("");

  const images = Array.from(slides.querySelectorAll("img"));
  let activeIndex = 0;
  let timer;
  const showSlide = index => {
    activeIndex = (index + images.length) % images.length;
    images.forEach((image, imageIndex) => image.classList.toggle("is-active", imageIndex === activeIndex));

  };


  previous.hidden = images.length < 2;
  next.hidden = images.length < 2;
  if (dots) dots.hidden = true;
  previous.addEventListener("click", () => showSlide(activeIndex - 1));
  next.addEventListener("click", () => showSlide(activeIndex + 1));

  if (images.length > 1 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    timer = window.setInterval(() => showSlide(activeIndex + 1), 5000);
    const carousel = document.querySelector("#hero-carousel");
    carousel.addEventListener("mouseenter", () => window.clearInterval(timer));
    carousel.addEventListener("mouseleave", () => {
      window.clearInterval(timer);
      timer = window.setInterval(() => showSlide(activeIndex + 1), 5000);
    });
  }

  images.forEach(image => image.addEventListener("error", () => {
    image.remove();
    const remainingImages = slides.querySelectorAll("img");
    if (!remainingImages.length) {
      slides.hidden = true;
      empty.hidden = false;
      previous.hidden = true;
      next.hidden = true;
      if (dots) dots.hidden = true;
    }
  }));
}

function renderKittenCards() {
  const track = document.querySelector("#kitten-track");
  if (!track || !Array.isArray(window.PAWS_KITTENS)) return;

  track.innerHTML = window.PAWS_KITTENS.map(kitten => {
    const photo = kitten.image
      ? `<img src="${escapeHTML(kitten.image)}" alt="${escapeHTML(kitten.name)}" loading="lazy">`
      : `<div class="photo-placeholder card-photo"><span>Photo coming soon</span></div>`;
    const profileAction = kitten.profileUrl
      ? `<a href="${escapeHTML(`${kitten.profileUrl}${kitten.profileUrl.includes("?") ? "&" : "?"}from=home`)}" class="card-link">Meet ${escapeHTML(kitten.name)} →</a>`
      : `<span class="card-link profile-coming-soon">Profile coming soon</span>`;
    const status = kitten.adoptionStatus || kitten.status || "Available";
    const returnedStatusClass = status === "Returned — Available" ? " status-returned" : "";
    const description = window.PAWS_KITTEN_CARD_DESCRIPTIONS?.[kitten.id] || kitten.description;
    return `<article class="kitten-card">
      <div class="card-photo-wrap">${photo}</div>
      <div class="card-content">
        <div class="status${returnedStatusClass}">${escapeHTML(status)}</div>
        <h3>${escapeHTML(kitten.name)}</h3>
        <p>${escapeHTML(description)}</p>
        ${profileAction}
      </div>
    </article>`;
  }).join("");

  const previous = document.querySelector("#kitten-previous");
  const next = document.querySelector("#kitten-next");
  const updateControls = () => {
    const maxScroll = track.scrollWidth - track.clientWidth;
    previous.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= maxScroll - 2;
    previous.hidden = maxScroll <= 2;
    next.hidden = maxScroll <= 2;
  };
  const scrollCards = direction => {
    const card = track.querySelector(".kitten-card");
    if (card) track.scrollBy({ left: direction * (card.getBoundingClientRect().width + 22), behavior: "smooth" });
  };
  previous.addEventListener("click", () => scrollCards(-1));
  next.addEventListener("click", () => scrollCards(1));
  track.addEventListener("scroll", updateControls, { passive: true });
  window.addEventListener("resize", updateControls);
  updateControls();
}

function mapsLink(address, mapsUrl = "") {
  return mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || "")}`;
}

function renderEvents() {
  const data = window.PAWS_EVENT_DATA;
  if (!data) return;
  const featured = document.querySelector("#event-featured");
  const homeSpecial = document.querySelector("#home-special-event");
  const event = data.featuredEvent || {};
  const kittens = Array.isArray(window.PAWS_KITTENS) ? window.PAWS_KITTENS : [];
  const availableStatuses = window.PAWS_AVAILABLE_KITTEN_STATUSES || new Set(["Available", "Returned — Available", "Pending Interest"]);
  const eligibleNames = new Set(kittens.filter(k => availableStatuses.has(k.status || k.adoptionStatus)).map(k => k.name));
  const attending = (event.attendingKittens || []).filter(name => eligibleNames.has(name));
  const eventDate = event.date ? new Date(event.date) : null;
  if (eventDate && !Number.isNaN(eventDate.getTime())) eventDate.setHours(23, 59, 59, 999);
  else if (eventDate) eventDate.setTime(NaN);
  const eventPassed = Boolean(eventDate && new Date() > eventDate);
  const allTooYoung = kittens.length > 0 && !kittens.some(k => availableStatuses.has(k.status || k.adoptionStatus));
  const allNotReady = kittens.length > 0 && kittens.every(k => ["Coming Soon", "Almost Available", "Adopted", "Pre-Adopted"].includes(k.status || k.adoptionStatus));
  const mapAnchor = (address, url) => address
    ? `<a class="event-address" href="${escapeHTML(url || mapsLink(address))}" target="_blank" rel="noopener noreferrer">${escapeHTML(address)}</a>`
    : "";
  const currentEvent = event.active && !eventPassed && !allTooYoung && !allNotReady;
  if (featured) {
    if (currentEvent) {
      const attendingMarkup = attending.length
        ? `<p class="event-attending"><strong>Kittens attending:</strong> ${escapeHTML(attending.join(", "))}</p>`
        : "";
      featured.innerHTML = `<article class="event-card event-card--compact">
        <div class="event-card-content"><p class="eyebrow"><span aria-hidden="true">🐾</span> Where to Find Us</p><h2>Upcoming Adoption Event</h2>
        <p class="event-date"><strong>${escapeHTML(event.date || "")}</strong></p><p class="event-time"><strong>${escapeHTML(event.time || "")}</strong></p>
        <p class="event-location-name"><strong>${escapeHTML(event.location || "")}</strong></p>
        ${mapAnchor(event.address,event.mapsUrl)}${attendingMarkup}</div>
      </article>`;
    } else {
      const heading = allTooYoung || allNotReady
        ? "Our current foster kittens are still growing, learning, and getting ready for their next chapter. They are not quite ready for adoption events yet. Please give them a little more time and check back soon."
        : "Our next adoption location is being arranged. We’ll post the details here as soon as they’re confirmed. In the meantime, see our regular adoption schedule below.";
      featured.innerHTML = `<article class="event-card event-card--compact event-coming-soon">
        <div class="event-card-content"><p class="eyebrow">Adoption locations</p><h2>Next Location Coming Soon</h2><p>${heading}</p><a class="text-link" href="#regular-schedule">View our regular adoption schedule →</a></div>
      </article>`;
    }
    featured.hidden = false;
  }

  const schedule = document.querySelector("#regular-schedule");
  if (schedule && data.regularSchedule?.active) {
    const locations = data.regularSchedule.locations.map(location => `
      <article class="schedule-location"><h3>${escapeHTML(location.name)}</h3>
      <p>${escapeHTML(location.timing)}</p>${mapAnchor(location.address,location.mapsUrl)}</article>`).join("");
    schedule.innerHTML = `<p class="eyebrow">Plan a visit</p><h2>Regular Adoption Schedule</h2><div class="schedule-locations">${locations}</div><p class="schedule-note">${escapeHTML(data.regularSchedule.note || "Schedule is subject to change.")}</p>`;
    schedule.hidden = false;
  }

  const special = document.querySelector("#special-event");
  const e = data.specialEvent || {};
  const specialDate = e.date ? new Date(e.date) : null;
  if (specialDate) specialDate.setHours(23,59,59,999);
  if (special && e.active && (!specialDate || new Date() <= specialDate)) {
    special.innerHTML = `<p class="eyebrow">Special event</p><h2>${escapeHTML(e.title || "Special Adoption Event")}</h2>
      <p class="special-event-date"><strong>${escapeHTML(e.date || "")}</strong></p><div class="special-event-activities"><p><span class="event-activity-icon" aria-hidden="true">🐈</span><strong>Kitten Adoption Event</strong><br>${escapeHTML(e.adoptionTime || "")} <span class="event-audience">Open to everyone</span></p><p><span class="event-activity-icon" aria-hidden="true">🧘</span><strong>Kitty Yoga</strong><br>${escapeHTML(e.yogaTime || "")} <span class="members-only">(Members only)</span></p></div>
      <p><strong>${escapeHTML(e.location || "")}</strong></p>${mapAnchor(e.address,e.mapsUrl)}
      <p>No Paws Left Behind Kitty Rescue is hosting this event. Our foster kittens will be there alongside other adoptable kittens from the rescue. Come meet them, say hello, and learn more about adoption.</p>`;
    special.hidden = false;
  }

  if (homeSpecial && e.active && (!specialDate || new Date() <= specialDate)) {
    homeSpecial.innerHTML = `<div class="home-special-event-copy"><p class="eyebrow"><span aria-hidden="true">✦</span> Special Event</p><h2>${escapeHTML(e.title || "")}</h2>
      <p><strong>${escapeHTML(e.date || "")}</strong> · Adoption event: ${escapeHTML(e.adoptionTime || "")}</p>
      <p>Kitty Yoga: ${escapeHTML(e.yogaTime || "")} <strong>(Members only)</strong></p>
      <p><strong>${escapeHTML(e.location || "")}</strong><br>${mapAnchor(e.address,e.mapsUrl)}</p>
      <a class="text-link" href="events/">Learn more →</a></div>`;
    homeSpecial.hidden = false;
  }
}

renderAbout();
renderFosterPhotoCarousel();
renderKittenCards();
renderEvents();

