function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function parseAlumniDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

function formatAlumniDate(date) {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(date);
}

function getZodiacSign(birthday) {
  const date = parseAlumniDate(birthday);
  if (!date) return "";
  const monthDay = (date.getMonth() + 1) * 100 + date.getDate();
  const signs = [
    [120, "Capricorn ♑"], [219, "Aquarius ♒"], [321, "Pisces ♓"], [420, "Aries ♈"],
    [521, "Taurus ♉"], [621, "Gemini ♊"], [723, "Cancer ♋"], [823, "Leo ♌"],
    [923, "Virgo ♍"], [1023, "Libra ♎"], [1122, "Scorpio ♏"], [1222, "Sagittarius ♐"],
    [1232, "Capricorn ♑"]
  ];
  return signs.find(([boundary]) => monthDay < boundary)?.[1] || "Capricorn";
}

function getAlumniAge(birthday, today = new Date()) {
  const birthDate = parseAlumniDate(birthday);
  if (!birthDate) return null;
  let months = (today.getFullYear() - birthDate.getFullYear()) * 12
    + today.getMonth() - birthDate.getMonth();
  if (today.getDate() < birthDate.getDate()) months -= 1;
  if (months < 0) return null;
  if (months < 12) return `${months} ${months === 1 ? "month" : "months"}`;
  const years = Math.floor(months / 12);
  return `${years} ${years === 1 ? "year" : "years"}`;
}

function getAlumniCelebrations(kitten, today = new Date()) {
  const birthday = parseAlumniDate(kitten.birthday);
  const adoptionDate = parseAlumniDate(kitten.adoptionDate);
  const celebratesBirthday = Boolean(birthday && today.getMonth() === birthday.getMonth());
  const birthdayMessage = Boolean(birthday
    && today.getMonth() === birthday.getMonth()
    && today.getDate() === birthday.getDate());
  const gotchaDayMessage = Boolean(adoptionDate
    && today.getMonth() === adoptionDate.getMonth()
    && today.getDate() === adoptionDate.getDate());

  return {
    celebratesBirthday,
    birthdayMessage,
    birthdayYears: birthdayMessage ? today.getFullYear() - birthday.getFullYear() : null,
    gotchaDayMessage
  };
}

function getConfirmedAlumni(kittenList) {
  return kittenList.filter(kitten =>
    kitten
    && kitten.status === "Adopted"
    && kitten.id
    && kitten.name
    && kitten.gender
    && parseAlumniDate(kitten.birthday)
    && parseAlumniDate(kitten.adoptionDate)
    && Number.isInteger(Number(kitten.fosterLitter))
    && Number(kitten.fosterLitter) > 0
  );
}

function sortAlumniByLitterAndAdoptionDate(kittenList) {
  return [...kittenList].sort((left, right) =>
    Number(right.fosterLitter) - Number(left.fosterLitter)
    || parseAlumniDate(right.adoptionDate) - parseAlumniDate(left.adoptionDate)
    || left.name.localeCompare(right.name)
  );
}

function formatAlumniLitter(litterNumber) {
  const number = Number(litterNumber);
  const remainder = number % 100;
  const suffix = remainder >= 11 && remainder <= 13
    ? "th"
    : ({ 1: "st", 2: "nd", 3: "rd" }[number % 10] || "th");
  return `${number}${suffix} Foster Litter`;
}

function formatBirthdayOrdinal(years) {
  const remainder = years % 100;
  const suffix = remainder >= 11 && remainder <= 13
    ? "th"
    : ({ 1: "st", 2: "nd", 3: "rd" }[years % 10] || "th");
  return `${years}${suffix}`;
}

const alumniPhotoCarouselIds = new Set(["mavis", "fawn", "diablo", "scout", "skylar"]);

function renderAlumniCard(kitten, alumniIds, today = new Date()) {
  const celebrations = getAlumniCelebrations(kitten, today);
  const age = getAlumniAge(kitten.birthday, today);
  const designation = kitten.fosterFail
    ? '<span class="alumni-special-badge">Foster Fail</span>'
    : kitten.secondChance
      ? '<span class="alumni-special-badge alumni-special-badge--second-chance">Second Chance</span>'
      : "";
  const photos = Array.isArray(kitten.photos)
    ? kitten.photos.filter(photo => typeof photo === "string" && photo.trim())
    : [];
  const hasPhotoCarousel = alumniPhotoCarouselIds.has(kitten.id) && kitten.image && photos.length === 1;
  const gallery = photos.length && !hasPhotoCarousel
    ? `<div class="alumni-gallery" aria-label="More photos of ${escapeHTML(kitten.name)}">${photos.map((photo, index) => `
      <img src="${escapeHTML(photo)}" alt="${escapeHTML(kitten.name)}${photos.length > 1 ? `, additional photo ${index + 1}` : ", additional photo"}" loading="lazy">
    `).join("")}</div>`
    : "";
  const photoIndicators = hasPhotoCarousel
    ? `<div class="alumni-photo-indicators" role="group" aria-label="${escapeHTML(kitten.name)} photos">
        ${[kitten.image, ...photos].map((photo, index) => `<button class="alumni-photo-indicator" type="button" data-photo="${escapeHTML(photo)}" data-index="${index}" aria-label="Show ${escapeHTML(kitten.name)} photo ${index + 1}" aria-pressed="${index === 0}"></button>`).join("")}
      </div>`
    : "";
  const companionLink = kitten.companionId && alumniIds.has(kitten.companionId)
    ? `<p class="alumni-companion">Adopted with ${escapeHTML(alumniIds.get(kitten.companionId))}</p>`
    : "";
  const birthdayDate = parseAlumniDate(kitten.birthday);
  const birthdayTooltip = `Birthday month — ${kitten.name}'s birthday is ${formatAlumniDate(birthdayDate)}.`;
  const birthdayMessage = celebrations.birthdayMessage
    ? celebrations.birthdayYears > 0
      ? `It's ${escapeHTML(kitten.name)}'s ${formatBirthdayOrdinal(celebrations.birthdayYears)} birthday!`
      : `It's ${escapeHTML(kitten.name)}'s birthday!`
    : "";
  const celebrationMessages = [
    celebrations.birthdayMessage ? `<p class="alumni-celebration" role="status">${birthdayMessage}</p>` : "",
    celebrations.gotchaDayMessage ? `<p class="alumni-celebration alumni-gotcha" role="status">Happy Gotcha Day, ${escapeHTML(kitten.name)}!</p>` : ""
  ].join("");

  return `<article class="kitten-card alumni-card" id="alumni-${escapeHTML(kitten.id)}">
    ${hasPhotoCarousel ? '<div class="alumni-photo-carousel">' : ""}
    <div class="card-photo-wrap alumni-main-photo">
      ${kitten.image ? `<img src="${escapeHTML(kitten.image)}" alt="${escapeHTML(kitten.name)}" loading="lazy">` : ""}
      ${celebrations.celebratesBirthday ? `<span class="alumni-birthday-cake" role="img" tabindex="0" aria-label="${escapeHTML(birthdayTooltip)}" title="${escapeHTML(birthdayTooltip)}" data-tooltip="${escapeHTML(birthdayTooltip)}">🎂</span>` : ""}
    </div>
    ${photoIndicators}
    ${hasPhotoCarousel ? "</div>" : ""}
    <div class="card-content alumni-card-content">
      <h3>${escapeHTML(kitten.name)}${designation ? ` ${designation}` : ""}</h3>
      <dl class="alumni-details">
        <div><dt>Gender</dt><dd>${escapeHTML(kitten.gender)}</dd></div>
        <div><dt>Birthday</dt><dd>${formatAlumniDate(parseAlumniDate(kitten.birthday))}</dd></div>
        <div><dt>Zodiac</dt><dd>${escapeHTML(getZodiacSign(kitten.birthday))}</dd></div>
        <div><dt>Age</dt><dd>${age === null ? "—" : `${escapeHTML(age)} old`}</dd></div>
        <div><dt>Gotcha Day</dt><dd>${formatAlumniDate(parseAlumniDate(kitten.adoptionDate))}</dd></div>
        <div><dt>Foster litter</dt><dd>${escapeHTML(formatAlumniLitter(kitten.fosterLitter))}</dd></div>
      </dl>
      ${gallery}
      ${celebrationMessages}
      ${companionLink}
    </div>
  </article>`;
}

function renderAlumniLitter(litter, kittens, alumniIds, today, paired = false, extraCardMarkup = "", extraCardAfterId = "") {
  const heading = formatAlumniLitter(litter);
  const cards = kittens.map(kitten =>
    `${renderAlumniCard(kitten, alumniIds, today)}${kitten.id === extraCardAfterId ? extraCardMarkup : ""}`
  ).join("");
  const controls = paired
    ? ""
    : `<div class="alumni-carousel-controls" aria-label="${escapeHTML(heading)} card controls">
        <button class="carousel-button alumni-arrow" type="button" aria-label="Previous alumni in ${escapeHTML(heading)}">‹</button>
        <button class="carousel-button alumni-arrow" type="button" aria-label="Next alumni in ${escapeHTML(heading)}">›</button>
      </div>`;
  return `<section class="alumni-litter${paired ? " alumni-litter--paired" : ""}" aria-labelledby="alumni-litter-${litter}">
    <div class="alumni-litter-heading">
      <h2 id="alumni-litter-${litter}">${escapeHTML(heading)}</h2>
      ${controls}
    </div>
    <div class="alumni-cards" role="region" aria-label="${escapeHTML(heading)} alumni" tabindex="0">${cards}</div>
  </section>`;
}

function renderTemporaryAlumniLitter(litter, noticeMarkup) {
  const heading = formatAlumniLitter(litter);
  return `<section class="alumni-litter alumni-litter--temporary" aria-labelledby="alumni-litter-${litter}">
    <div class="alumni-litter-heading">
      <h2 id="alumni-litter-${litter}">${escapeHTML(heading)}</h2>
    </div>
    <div class="alumni-cards" role="region" aria-label="${escapeHTML(heading)}" tabindex="0">${noticeMarkup}</div>
  </section>`;
}

function renderFosterAlumni(kittenList, today = new Date()) {
  if (typeof document === "undefined") return;
  const container = document.querySelector("#foster-alumni");
  if (!container) return;

  const alumni = sortAlumniByLitterAndAdoptionDate(getConfirmedAlumni(kittenList));
  if (!alumni.length) {
    container.innerHTML = '<div class="empty-state">Our forever-home alumni will be celebrated here. Check back to meet the kittens who have found their families!</div>';
    return;
  }

  const alumniIds = new Map(alumni.map(kitten => [kitten.id, kitten.name]));
  const raymondNotice = document.querySelector("#raymond-wally-notice")?.innerHTML.trim();
  const twelfthLitterNotice = document.querySelector("#twelfth-litter-notice")?.innerHTML.trim();
  const eleventhLitterNotice = document.querySelector("#eleventh-litter-notice")?.innerHTML.trim();
  if (!raymondNotice || !twelfthLitterNotice || !eleventhLitterNotice) {
    container.innerHTML = '<div class="empty-state" role="alert">Foster alumni notices could not be loaded. Please try again later.</div>';
    console.error("Foster alumni temporary notice templates are missing.");
    return;
  }
  const groups = new Map();
  alumni.forEach(kitten => {
    const litter = Number(kitten.fosterLitter);
    if (!groups.has(litter)) groups.set(litter, []);
    groups.get(litter).push(kitten);
  });

  const hasDiabloFinnPair = groups.has(5) && groups.has(4);
  let eleventhLitterRendered = false;
  container.innerHTML = [...groups.entries()].map(([litter, kittens]) => {
    if (litter === 12) {
      eleventhLitterRendered = true;
      const twelfthLitter = renderAlumniLitter(litter, kittens, alumniIds, today, false, twelfthLitterNotice, kittens[kittens.length - 1]?.id);
      return `${twelfthLitter}${renderTemporaryAlumniLitter(11, eleventhLitterNotice)}`;
    }
    if (litter === 10) {
      const litterTen = renderAlumniLitter(litter, kittens, alumniIds, today, false, raymondNotice, "matilda");
      return `${eleventhLitterRendered ? "" : renderTemporaryAlumniLitter(11, eleventhLitterNotice)}${litterTen}`;
    }
    if (hasDiabloFinnPair && litter === 5) {
      return `<div class="alumni-litter-pair">
        ${renderAlumniLitter(5, groups.get(5), alumniIds, today, true)}
        ${renderAlumniLitter(4, groups.get(4), alumniIds, today, true)}
      </div>`;
    }
    if (hasDiabloFinnPair && litter === 4) return "";
    return renderAlumniLitter(litter, kittens, alumniIds, today);
  }).join("");

  container.querySelectorAll(".alumni-photo-carousel").forEach(carousel => {
    const image = carousel.querySelector(".alumni-main-photo > img");
    const photoArea = carousel.querySelector(".alumni-main-photo");
    const indicators = [...carousel.querySelectorAll(".alumni-photo-indicator")];
    if (!image || !photoArea || indicators.length !== 2) return;

    let activeIndex = 0;
    const showPhoto = index => {
      activeIndex = (index + indicators.length) % indicators.length;
      const indicator = indicators[activeIndex];
      image.src = indicator.dataset.photo;
      image.alt = `${carousel.closest(".alumni-card").querySelector("h3").textContent.trim()} photo ${activeIndex + 1}`;
      indicators.forEach((button, buttonIndex) => button.setAttribute("aria-pressed", String(buttonIndex === activeIndex)));
    };
    indicators.forEach((button, index) => button.addEventListener("click", () => showPhoto(index)));

    let touchStartX = null;
    photoArea.addEventListener("touchstart", event => {
      touchStartX = event.touches[0]?.clientX ?? null;
    }, { passive: true });
    photoArea.addEventListener("touchend", event => {
      const touchEndX = event.changedTouches[0]?.clientX;
      if (touchStartX === null || touchEndX === undefined) return;
      const movement = touchEndX - touchStartX;
      if (Math.abs(movement) > 40) showPhoto(activeIndex + (movement < 0 ? 1 : -1));
      touchStartX = null;
    }, { passive: true });
  });

  container.querySelectorAll(".alumni-litter:not(.alumni-litter--paired):not(.alumni-litter--temporary)").forEach(section => {
    const track = section.querySelector(".alumni-cards");
    const [previous, next] = section.querySelectorAll(".alumni-arrow");
    const updateControls = () => {
      const maxScroll = track.scrollWidth - track.clientWidth;
      previous.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= maxScroll - 2;
    };
    const scrollCards = direction => {
      const card = track.querySelector(".alumni-card");
      if (!card) return;
      const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
      track.scrollBy({ left: direction * (card.getBoundingClientRect().width + gap), behavior: "smooth" });
    };

    previous.addEventListener("click", () => scrollCards(-1));
    next.addEventListener("click", () => scrollCards(1));
    track.addEventListener("scroll", updateControls, { passive: true });
    window.addEventListener("resize", updateControls);
    updateControls();
  });
}

if (typeof window !== "undefined") {
  const alumni = window.PAWS_FOSTER_ALUMNI;
  if (!Array.isArray(alumni)) {
    const container = document.querySelector("#foster-alumni");
    if (container) {
      container.innerHTML = '<div class="empty-state" role="alert">Foster alumni could not be loaded. Please try again later.</div>';
    }
    console.error("Foster alumni data is missing or invalid.");
  } else {
    renderFosterAlumni(alumni);
  }
}

if (typeof module !== "undefined") {
  module.exports = {
    escapeHTML,
    parseAlumniDate,
    getZodiacSign,
    getAlumniAge,
    getAlumniCelebrations,
    getConfirmedAlumni,
    sortAlumniByLitterAndAdoptionDate,
    formatAlumniLitter,
    renderAlumniCard,
    renderTemporaryAlumniLitter,
    renderFosterAlumni
  };
}
