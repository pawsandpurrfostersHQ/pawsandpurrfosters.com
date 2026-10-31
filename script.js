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
  if (!slides || !empty || !previous || !next || !dots) return;

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
    dots.querySelectorAll("button").forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === activeIndex);
      dot.setAttribute("aria-current", String(dotIndex === activeIndex));
    });
  };

  dots.innerHTML = images.map((_, index) =>
    `<button type="button" aria-label="Show photo ${index + 1}" aria-current="${index === 0}"></button>`
  ).join("");
  dots.querySelectorAll("button").forEach((dot, index) => dot.addEventListener("click", () => showSlide(index)));
  previous.hidden = images.length < 2;
  next.hidden = images.length < 2;
  dots.hidden = images.length < 2;
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
      dots.hidden = true;
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
  const event = data.featuredEvent || {};
  if (featured) {
    if (event.active) {
      const attendees = event.attendingKittens?.length
        ? `<p><strong>Attending kittens:</strong> ${escapeHTML(event.attendingKittens.join(", "))}</p>`
        : "";
      const notice = event.specialNotice ? `<p class="event-special-note">${escapeHTML(event.specialNotice)}</p>` : "";
      const dateAndTime = [event.date, event.time].filter(Boolean).map(escapeHTML).join(" · ");
      const address = event.address
        ? `<a class="event-address" href="${escapeHTML(mapsLink(event.address, event.mapsUrl))}" target="_blank" rel="noopener noreferrer">${escapeHTML(event.address)}</a>`
        : "";
      const location = event.location
        ? `<strong>${escapeHTML(event.location)}</strong>${address}`
        : address;
      featured.innerHTML = `<div class="event-card">
        <div><p class="eyebrow">This weekend</p><h2>Where to Find Us</h2>
          ${dateAndTime ? `<p class="event-date">${dateAndTime}</p>` : ""}
          ${event.description ? `<p>${escapeHTML(event.description)}</p>` : ""}${attendees}${notice}
        </div>
        <div class="event-location">${location || "<span>See the regular schedule below for our usual locations.</span>"}</div>
      </div>`;
    } else {
      featured.innerHTML = `<div class="event-card event-coming-soon">
        <div><p class="eyebrow">This weekend</p><h2>Where to Find Us</h2><h3 class="placement-location">Weekend placement: Coming soon</h3>
          <p>Our weekend location will be posted here as soon as it is available.</p>
        </div>
        <div class="event-location"><strong>Weekend placement: Coming soon</strong><span>Our weekend location will be posted here as soon as it is available.</span></div>
      </div>`;
    }
    featured.hidden = false;
  }

  const schedule = document.querySelector("#regular-schedule");
  if (schedule && data.regularSchedule?.active) {
    const locations = data.regularSchedule.locations.map(location => `
      <article class="schedule-location"><h3>${escapeHTML(location.name)}</h3>
        <p>${escapeHTML(location.timing)}</p>
        ${location.address ? `<a class="schedule-address" href="${escapeHTML(mapsLink(location.address, location.mapsUrl))}" target="_blank" rel="noopener noreferrer">${escapeHTML(location.address)}</a>` : ""}</article>`
    ).join("");
    schedule.innerHTML = `<p class="eyebrow">Find us regularly</p><h2>Regular Adoption Schedule</h2>
      <div class="schedule-locations">${locations}</div>
      <p class="schedule-note">${escapeHTML(data.regularSchedule.note)}</p>`;
    schedule.hidden = false;
  }

  const special = document.querySelector("#special-event");
  if (special && data.specialEvent?.active) {
    const place = data.specialEvent.address
      ? `<a class="event-address" href="${escapeHTML(mapsLink(data.specialEvent.address, data.specialEvent.mapsUrl))}" target="_blank" rel="noopener noreferrer">${escapeHTML(data.specialEvent.address)}</a>`
      : "";
    special.innerHTML = `<p class="eyebrow">Special Event</p><h2>${escapeHTML(data.specialEvent.title)}</h2>
      <p>${escapeHTML(data.specialEvent.description)}</p>
      <p>${[data.specialEvent.date, data.specialEvent.time, data.specialEvent.location].filter(Boolean).map(escapeHTML).join(" · ")}</p>${place}`;
    special.hidden = false;
  }

 const notice = document.querySelector("#october-notice");
const octoberNotice = data.octoberNotice;

if (notice && octoberNotice) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getLastMondayOfSeptember = (year) => {
    const date = new Date(year, 8, 30);
    date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
    return date;
  };

    const getFridayBeforeSecondWeekendOfNovember = (year) => {
    const novemberFirst = new Date(year, 10, 1);
    const firstSaturday = new Date(
      year,
      10,
      1 + ((6 - novemberFirst.getDay() + 7) % 7)
    );
    const friday = new Date(firstSaturday);
    friday.setDate(firstSaturday.getDate() - 1);
    return friday;
  };

  let year = Math.max(today.getFullYear(), 2027);
  let startDate = getLastMondayOfSeptember(year);
  let endDate = getFridayBeforeSecondWeekendOfNovember(year);

  if (today > endDate) {
    year++;
    startDate = getLastMondayOfSeptember(year);
    endDate = getFridayBeforeSecondWeekendOfNovember(year);
  }

  const isWithinSchedule = today >= startDate && today <= endDate;
  const shouldShow = octoberNotice.active || (octoberNotice.schedule?.enabled && isWithinSchedule);

  if (shouldShow) {
    const formatDate = (date) =>
      date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      });

    const messages = octoberNotice.messages.map(message =>
      message
        .replace("[start date]", formatDate(startDate))
        .replace("[end date]", formatDate(endDate))
    );

    notice.innerHTML = `<h2>${escapeHTML(octoberNotice.title)}</h2>
      ${messages.map(message => `<p>${escapeHTML(message)}</p>`).join("")}`;
    notice.hidden = false;
  } else {
    notice.hidden = true;
  }
}
}
  
renderAbout();
renderFosterPhotoCarousel();
renderKittenCards();
renderEvents();
