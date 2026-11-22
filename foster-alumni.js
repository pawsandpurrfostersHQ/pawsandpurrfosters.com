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

function formatAlumniBirthday(date) {
  const full = formatAlumniDate(date);
  const short = date ? new Intl.DateTimeFormat(undefined, {
    year: "numeric", month: "short", day: "numeric"
  }).format(date) : "—";
  return '<span class="alumni-date-full">' + escapeHTML(full) + '</span><span class="alumni-date-short">' + escapeHTML(short) + '</span>';
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
  const birthdayMessage = Boolean(birthday && today.getMonth() === birthday.getMonth() && today.getDate() === birthday.getDate());
  const yearsSinceAdoption = adoptionDate ? today.getFullYear() - adoptionDate.getFullYear() - (today.getMonth() < adoptionDate.getMonth() || (today.getMonth() === adoptionDate.getMonth() && today.getDate() < adoptionDate.getDate()) ? 1 : 0) : 0;
  const gotchaDayMessage = Boolean(adoptionDate && yearsSinceAdoption >= 1 && today.getMonth() === adoptionDate.getMonth() && today.getDate() === adoptionDate.getDate());
  const adoptionStart = adoptionDate ? new Date(adoptionDate.getFullYear(), adoptionDate.getMonth(), adoptionDate.getDate()) : null;
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const daysSinceAdoption = adoptionStart ? Math.floor((todayStart - adoptionStart) / 86400000) : -1;
  return {
    celebratesBirthday,
    birthdayMessage,
    birthdayYears: birthdayMessage ? today.getFullYear() - birthday.getFullYear() : null,
    gotchaDayMessage,
    graduationMessage: daysSinceAdoption >= 0 && daysSinceAdoption < 7
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

const ALUMNI_LITTER_TOTALS = { 1:4, 2:3, 3:7, 4:1, 5:1, 6:4, 7:4, 8:3, 9:4, 10:4, 11:4, 12:4 };
function getAlumniLitterTotal(litterNumber) { return ALUMNI_LITTER_TOTALS[Number(litterNumber)] || 0; }

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

function getAlumniGalleryPhotos(kitten) {
  return [...new Set([
    ...(kitten.image ? [kitten.image] : []),
    ...(Array.isArray(kitten.photos) ? kitten.photos : [])
  ].filter(photo => typeof photo === "string" && photo.trim()))];
}

function renderAlumniCard(kitten, alumniIds, today = new Date()) {
  const celebrations = getAlumniCelebrations(kitten, today);
  const age = getAlumniAge(kitten.birthday, today);
  const designation = kitten.fosterFail
    ? '<span class="alumni-special-badge">Foster Fail</span>'
    : kitten.secondChance
      ? '<span class="alumni-special-badge alumni-special-badge--second-chance">Second Chance</span>'
      : "";
  const photos = getAlumniGalleryPhotos(kitten);
  const mainPhoto = photos[0] || "";
  const birthdayDate = parseAlumniDate(kitten.birthday);
  const photoCarousel = mainPhoto
    ? '<div class="alumni-photo-carousel"><div class="card-photo-wrap alumni-main-photo">' +
        '<button class="alumni-main-photo-button" type="button" data-alumni-gallery="' + escapeHTML(kitten.id) + '" data-photo-index="0" aria-label="Open all photos of ' + escapeHTML(kitten.name) + '">' +
          '<img src="' + escapeHTML(mainPhoto) + '" alt="' + escapeHTML(kitten.name) + '" loading="lazy">' +
          (photos.length > 1 ? '<span class="alumni-photo-hint" aria-hidden="true"><span class="alumni-photo-hint--desktop">Click to view photos</span><span class="alumni-photo-hint--mobile">Tap to view photos</span><span class="alumni-photo-hint__icon">↗</span></span>' : '') +
        '</button><span class="alumni-photo-symbols">' +
          (celebrations.celebratesBirthday ? '<span class="alumni-symbol-wrap"><button class="alumni-photo-symbol" type="button" data-alumni-info aria-expanded="false" aria-label="Birthday information for ' + escapeHTML(kitten.name) + '">' + (celebrations.birthdayMessage ? "🎂" : "🎁") + '</button><span class="alumni-symbol-tooltip" role="status" hidden>' + (celebrations.birthdayMessage ? 'Happy birthday! Today is ' + escapeHTML(kitten.name) + "'s special day." : escapeHTML(kitten.name) + "'s birthday is this month. Their birthday is " + escapeHTML(formatAlumniDate(birthdayDate)) + ".") + '</span></span>' : "") +
          (celebrations.gotchaDayMessage ? '<span class="alumni-symbol-wrap"><button class="alumni-photo-symbol" type="button" data-alumni-info aria-expanded="false" aria-label="Gotcha Day information for ' + escapeHTML(kitten.name) + '">🎉</button><span class="alumni-symbol-tooltip" role="status" hidden>Happy Gotcha Day! It has been one year since ' + escapeHTML(kitten.name) + ' found their forever home.</span></span>' : "") +
        '</span>' +
        (celebrations.graduationMessage ? '<span class="alumni-graduation-corner"><button class="alumni-graduation-icon" type="button" aria-label="Celebrate ' + escapeHTML(kitten.name) + "'s recent graduation" + '" aria-expanded="false" data-graduation-info>🎓</button><span class="alumni-graduation-tooltip" role="status" hidden><strong>A whole week to celebrate!</strong> ' + escapeHTML(kitten.name) + ' has officially graduated from foster care. This week is all about celebrating them and their happy new chapter!</span></span>' : '') +
        '</div>' +
        (photos.length > 1 ? '<div class="alumni-photo-indicators" role="group" aria-label="' + escapeHTML(kitten.name) + ' photo navigation">' +
          photos.map((photo,index) => '<button class="alumni-photo-indicator" type="button" data-index="' + index + '" aria-label="Show photo ' + (index+1) + ' of ' + photos.length + '" aria-pressed="' + (index===0) + '"></button>').join("") +
        '</div>' : "") + '</div>'
    : "";
  const companionId = kitten.companionId || kitten.pairing?.kittenId;
  const companionName = (kitten.adoptedWith || (companionId && alumniIds.has(companionId) ? alumniIds.get(companionId) : "")) || "";
  const birthdayMessage = celebrations.birthdayMessage
    ? celebrations.birthdayYears > 0 ? "Happy " + formatBirthdayOrdinal(celebrations.birthdayYears) + " birthday, " + escapeHTML(kitten.name) + "!" : "Happy birthday, " + escapeHTML(kitten.name) + "!"
    : "";
  const celebrationMessages = [
    celebrations.graduationMessage ? '<p class="alumni-celebration alumni-graduation" role="status">Congratulations, ' + escapeHTML(kitten.name) + '! You have graduated from foster care!</p>' : "",
    celebrations.birthdayMessage ? '<p class="alumni-celebration alumni-birthday-message" role="status">' + birthdayMessage + '</p>' : "",
    celebrations.gotchaDayMessage ? '<p class="alumni-celebration alumni-gotcha" role="status">Happy Gotcha Day, ' + escapeHTML(kitten.name) + '!</p>' : ""
  ].join("");
  const graduationBadge = celebrations.graduationMessage ? '<span class="alumni-graduation-badge">Recent Graduate</span>' : "";
  const badges = [designation, graduationBadge].filter(Boolean).join("");
  return '<article class="kitten-card alumni-card" id="alumni-' + escapeHTML(kitten.id) + '">' +
    photoCarousel + '<div class="card-content alumni-card-content">' +
      (badges ? '<div class="alumni-card-badges">' + badges + '</div>' : '') +
      '<h3>' + escapeHTML(kitten.name) + '</h3>' +
      '<dl class="alumni-details">' +
        '<div><dt>Gender</dt><dd>' + escapeHTML(kitten.gender || "—") + '</dd></div>' +
        '<div><dt>Birthday</dt><dd>' + formatAlumniBirthday(birthdayDate) + '</dd></div>' +
        '<div><dt>Age</dt><dd>' + (age === null ? "—" : escapeHTML(age) + " old") + '</dd></div>' +
        '<div><dt>Zodiac</dt><dd>' + escapeHTML(getZodiacSign(kitten.birthday)) + '</dd></div>' +
        '<div><dt>Gotcha Day</dt><dd>' + formatAlumniBirthday(parseAlumniDate(kitten.adoptionDate)) + '</dd></div>' +
        '<div><dt>Foster litter</dt><dd>' + escapeHTML(formatAlumniLitter(kitten.fosterLitter)) + '</dd></div>' +
        (companionName ? '<div><dt>Adopted with</dt><dd>' + escapeHTML(companionName) + '</dd></div>' : '') +
      '</dl>' + celebrationMessages + '</div></article>';
}
function renderAlumniLitter(litter, kittens, alumniIds, today, paired = false, extraCardMarkup = "", extraCardAfterId = "") {
  const total = getAlumniLitterTotal(litter);
  const heading = formatAlumniLitter(litter) + " — " + total + (total === 1 ? " kitten" : " kittens");
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
    </div>
    <div class="alumni-carousel${paired ? " alumni-carousel--paired" : ""}">
      <div class="alumni-cards${kittens.length === 1 && !paired ? " alumni-cards--single" : ""}" role="region" aria-label="${escapeHTML(heading)} alumni" tabindex="0">${cards}</div>
      ${controls}
    </div>
  </section>`;
}

function renderTemporaryAlumniCard(litter, kittens) {
  const names = kittens.map(kitten => {
    const href = kitten.profileUrl || "kittens/profile-template.html?id=" + encodeURIComponent(kitten.id);
    return '<a class="text-link" href="' + escapeHTML(href) + '">' + escapeHTML(kitten.name) + '</a>';
  });
  const joinedNames = names.length > 1 ? names.slice(0,-1).join(", ") + " and " + names[names.length-1] : names[0] || "Our kittens";
  const countWords = ["Zero","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten"];
  const countText = (countWords[names.length] || names.length) + (names.length === 1 ? " kitten from this litter" : " kittens from this litter");
  const verb = names.length === 1 ? "is" : "are";
  const currentFostersLink = 'all-kittens/#litter-' + Number(litter);
  const kittenNames = kittens.map(kitten => kitten.name);
  const meetLabel = kittenNames.length > 1
    ? 'Meet ' + kittenNames.slice(0, -1).join(', ') + ' and ' + kittenNames[kittenNames.length - 1]
    : 'Meet ' + (kittenNames[0] || 'these kittens');
  return '<article class="alumni-temporary-notice alumni-temporary-notice--pair"><h3>Their Next Chapter Starts With You</h3>' +
    '<p>' + countText + " " + verb + ' still in foster care and waiting for their forever homes. Meet ' + joinedNames + '.</p>' +
    '<a class="alumni-current-fosters-link" href="' + currentFostersLink + '--' + kittens.map(kitten => encodeURIComponent(kitten.id)).join(',') + '">' + escapeHTML(meetLabel) + '</a></article>';
}
function renderTemporaryAlumniLitter(litter, kittens) {
  const total = getAlumniLitterTotal(litter);
  const heading = formatAlumniLitter(litter) + " — " + total + (total === 1 ? " kitten" : " kittens");
  return '<section class="alumni-litter alumni-litter--temporary" aria-labelledby="alumni-litter-' + litter + '">' +
    '<div class="alumni-litter-heading"><h2 id="alumni-litter-' + litter + '">' + escapeHTML(heading) + '</h2></div>' +
    '<div class="alumni-cards" role="region" aria-label="' + escapeHTML(heading) + '">' + renderTemporaryAlumniCard(litter, kittens) + '</div>' +
    '</section>';
}

function renderFosterAlumni(kittenList, today = new Date()) {
  if (typeof document === "undefined") return;
  const container = document.querySelector("#foster-alumni");
  if (!container) return;

  const alumni = sortAlumniByLitterAndAdoptionDate(getConfirmedAlumni(kittenList));
  const currentKittens = (Array.isArray(window.PAWS_KITTENS) ? window.PAWS_KITTENS : [])
    .filter(kitten => (kitten.adoptionStatus || kitten.status) !== "Adopted" && Number(kitten.litterNumber ?? kitten.litter) > 0);
  if (!alumni.length && !currentKittens.length) {
    container.innerHTML = '<div class="empty-state">Our forever-home alumni will be celebrated here. Check back to meet the kittens who have found their families!</div>';
    return;
  }

  const alumniIds = new Map(alumni.map(kitten => [kitten.id, kitten.name]));
  const groups = new Map();
  alumni.forEach(kitten => {
    const litter = Number(kitten.fosterLitter);
    if (!groups.has(litter)) groups.set(litter, []);
    groups.get(litter).push(kitten);
  });
  const currentGroups = new Map();
  currentKittens.forEach(kitten => {
    const litter = Number(kitten.litterNumber ?? kitten.litter);
    if (!currentGroups.has(litter)) currentGroups.set(litter, []);
    currentGroups.get(litter).push(kitten);
  });

  const litterNumbers = [...new Set([...groups.keys(), ...currentGroups.keys()])].sort((a, b) => b - a);
  container.innerHTML = litterNumbers.map(litter => {
    const kittens = groups.get(litter) || [];
    const waiting = currentGroups.get(litter) || [];
    const noticeMarkup = waiting.length ? renderTemporaryAlumniCard(litter, waiting) : "";
    if (kittens.length) return renderAlumniLitter(litter, kittens, alumniIds, today, false, noticeMarkup, kittens[kittens.length - 1]?.id || "");
    return renderTemporaryAlumniLitter(litter, waiting);
  }).join("");

  initAlumniPhotoLightbox(container, alumni);

  container.querySelectorAll(".alumni-litter:not(.alumni-litter--temporary) .alumni-cards").forEach(track => {
    track.scrollLeft = 0;
    requestAnimationFrame(() => { track.scrollLeft = 0; });
  });

  container.querySelectorAll("[data-graduation-info], [data-alumni-info]").forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      const tooltip = button.parentElement?.querySelector(".alumni-graduation-tooltip, .alumni-symbol-tooltip");
      const isOpen = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!isOpen));
      if (tooltip) tooltip.hidden = isOpen;
    });
  });

  if (typeof IntersectionObserver !== "undefined") {
    container.querySelectorAll(".alumni-card").forEach(card => {
      const hint = card.querySelector(".alumni-photo-hint");
      if (!hint) return;
      let showTimer = null;
      let hideTimer = null;
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            clearTimeout(showTimer);
            clearTimeout(hideTimer);
            showTimer = setTimeout(() => {
              if (!card.isConnected) return;
              hint.classList.add("is-hint-active");
              hideTimer = setTimeout(() => hint.classList.remove("is-hint-active"), 2400);
            }, 450);
          } else {
            clearTimeout(showTimer);
            clearTimeout(hideTimer);
            hint.classList.remove("is-hint-active");
          }
        });
      }, { threshold: [0, 0.6] });
      observer.observe(card);
    });
  }

  container.querySelectorAll(".alumni-photo-carousel").forEach(carousel => {
    const image = carousel.querySelector(".alumni-main-photo-button > img");
    const photoArea = carousel.querySelector(".alumni-main-photo");
    const trigger = carousel.querySelector(".alumni-main-photo-button");
    const indicators = [...carousel.querySelectorAll(".alumni-photo-indicator")];
    if (!image || !photoArea || !trigger || !indicators.length) return;
    const kitten = alumni.find(item => item.id === trigger.dataset.alumniGallery);
    const photos = getAlumniGalleryPhotos(kitten || {});
    let activeIndex = 0;
    const showPhoto = index => {
      activeIndex = (index + photos.length) % photos.length;
      image.src = photos[activeIndex];
      image.alt = kitten.name + " photo " + (activeIndex + 1);
      trigger.dataset.photoIndex = String(activeIndex);
      indicators.forEach((button, buttonIndex) => button.setAttribute("aria-pressed", String(buttonIndex === activeIndex)));
    };
    indicators.forEach((button,index) => button.addEventListener("click", () => showPhoto(index)));
    let touchStartX = null;
    photoArea.addEventListener("touchstart", event => { touchStartX = event.touches[0]?.clientX ?? null; }, {passive:true});
    photoArea.addEventListener("touchend", event => {
      const touchEndX = event.changedTouches[0]?.clientX;
      if (touchStartX === null || touchEndX === undefined) return;
      const movement = touchEndX - touchStartX;
      if (Math.abs(movement) > 40) {
        showPhoto(activeIndex + (movement < 0 ? 1 : -1));
        trigger.dataset.ignoreNextClick = "true";
      }
      touchStartX = null;
    }, {passive:true});
  });

  container.querySelectorAll(".alumni-litter:not(.alumni-litter--temporary)").forEach(section => {
    const track = section.querySelector(".alumni-cards");
    const [previous, next] = section.querySelectorAll(".alumni-arrow");
    if (!track || !previous || !next) return;
    const updateControls = () => {
      const maxScroll = track.scrollWidth - track.clientWidth;
      previous.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= maxScroll - 2;
      previous.hidden = maxScroll <= 2;
      next.hidden = maxScroll <= 2;
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

function initAlumniPhotoLightbox(container, alumni) {
  const dialog = document.querySelector("#alumni-photo-lightbox");
  const image = dialog?.querySelector("img");
  const close = dialog?.querySelector(".alumni-lightbox-close");
  const previous = dialog?.querySelector(".alumni-lightbox-prev");
  const next = dialog?.querySelector(".alumni-lightbox-next");
  if (!dialog || !image) return;
  let photos = [], index = 0, returnFocus = null, label = "Foster alumni";
  const show = nextIndex => {
    index = (nextIndex + photos.length) % photos.length;
    image.src = photos[index];
    image.alt = label + " photo " + (index + 1) + " of " + photos.length;
    if (previous) previous.hidden = photos.length < 2;
    if (next) next.hidden = photos.length < 2;
  };
  container.querySelectorAll("[data-alumni-gallery]").forEach(button => button.addEventListener("click", () => {
    if (button.dataset.ignoreNextClick === "true") { delete button.dataset.ignoreNextClick; return; }
    const kitten = alumni.find(item => item.id === button.dataset.alumniGallery);
    if (!kitten) return;
    photos = getAlumniGalleryPhotos(kitten);
    if (!photos.length) return;
    label = kitten.name;
    returnFocus = button;
    show(Number(button.dataset.photoIndex || 0));
    if (!dialog.open) dialog.showModal();
  }));
  close?.addEventListener("click", () => dialog.close());
  previous?.addEventListener("click", () => show(index - 1));
  next?.addEventListener("click", () => show(index + 1));
  let lightboxTouchStartX = null;
  image.addEventListener("touchstart", event => { lightboxTouchStartX = event.touches[0]?.clientX ?? null; }, { passive:true });
  image.addEventListener("touchend", event => {
    const endX = event.changedTouches[0]?.clientX;
    if (lightboxTouchStartX === null || endX === undefined) return;
    const movement = endX - lightboxTouchStartX;
    if (Math.abs(movement) > 40 && photos.length > 1) show(index + (movement < 0 ? 1 : -1));
    lightboxTouchStartX = null;
  }, { passive:true });
  dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener("close", () => {
    image.removeAttribute("src");
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
    returnFocus = null;
  });
  document.addEventListener("keydown", event => {
    if (!dialog.open) return;
    if (event.key === "ArrowLeft") { event.preventDefault(); show(index - 1); }
    if (event.key === "ArrowRight") { event.preventDefault(); show(index + 1); }
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
    getAlumniLitterTotal,
    formatAlumniLitter,
    renderAlumniCard,
    renderTemporaryAlumniLitter,
    renderFosterAlumni
  };
}
