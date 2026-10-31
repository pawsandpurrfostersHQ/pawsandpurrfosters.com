function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function profilePhotoSource(photo) {
  return /^(?:https?:)?\/\//i.test(photo) ? photo : `../${photo}`;
}

function formatBirthday(dateString) {
  if (!dateString) return "";
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(date);
}

function kittenAge(dateString, today = new Date()) {
  if (!dateString) return "";
  const birthDate = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(birthDate.getTime()) || birthDate > today) return "";

  let months = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());
  if (today.getDate() < birthDate.getDate()) months -= 1;
  if (months < 0) return "";

  if (months < 12) {
    return `${months} ${months === 1 ? "month" : "months"}`;
  }

  const years = Math.floor(months / 12);
  return `${years} ${years === 1 ? "year" : "years"}`;
}

function getPairingData(kitten) {
  const pairing = kitten.pairing || kitten.mustBeAdoptedWith || kitten.preferredPair;
  if (!pairing) return { type: "single" };
  if (typeof pairing === "string") {
    const pairedKitten = window.PAWS_KITTENS?.find(item => item.id === pairing || item.name === pairing);
    return { type: "bonded", kittenId: pairedKitten?.id || pairing, kittenName: pairedKitten?.name || pairing };
  }
  if (typeof pairing === "object") {
    const type = ["bonded", "preferred", "any-sibling", "single"].includes(pairing.type)
      ? pairing.type
      : "bonded";
    const pairedKitten = pairing.kittenId
      ? window.PAWS_KITTENS?.find(item => item.id === pairing.kittenId)
      : window.PAWS_KITTENS?.find(item => item.id === pairing.id || item.name === pairing.name || item.name === pairing.kittenName);
    return {
      type,
      kittenId: pairedKitten?.id || pairing.kittenId || pairing.id || pairing.kittenName || pairing.name || "",
      kittenName: pairedKitten?.name || pairing.kittenName || pairing.name || pairing.kittenId || pairing.id || ""
    };
  }
  return { type: "single" };
}

function getOctoberNoticeDates(notice, today = new Date()) {
  if (!notice) return null;
  const date = new Date(today);
  date.setHours(0, 0, 0, 0);
  const lastMondayOfSeptember = year => {
    const result = new Date(year, 8, 30);
    result.setDate(result.getDate() - ((result.getDay() + 6) % 7));
    return result;
  };
  const fridayBeforeSecondWeekendOfNovember = year => {
    const novemberFirst = new Date(year, 10, 1);
    const firstSaturday = new Date(year, 10, 1 + ((6 - novemberFirst.getDay() + 7) % 7));
    const result = new Date(firstSaturday);
    result.setDate(result.getDate() - 1);
    return result;
  };
  let year = Math.max(date.getFullYear(), 2027);
  let start = lastMondayOfSeptember(year);
  let end = fridayBeforeSecondWeekendOfNovember(year);
  if (date > end) {
    year += 1;
    start = lastMondayOfSeptember(year);
    end = fridayBeforeSecondWeekendOfNovember(year);
  }
  const active = Boolean(notice.active || (notice.schedule?.enabled && date >= start && date <= end));
  const format = value => value.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  return { active, start: format(start), end: format(end) };
}

function getProfileAdoptionNotices(kitten, pairingData, dates) {
  if (!dates?.active) return [];
  const notices = [];
  if (kitten.blackCatAdoptionNotice) {
    notices.push({
      title: "October Adoption Notice",
      message: `From ${dates.start} through ${dates.end}, ${kitten.name} will be temporarily unavailable for adoption in accordance with the rescue's October adoption guidelines. Adoptions for ${kitten.name} will resume after ${dates.end}.`
    });
  }
  if (pairingData?.type === "bonded" && pairingData.kittenId) {
    const partner = window.PAWS_KITTENS?.find(item => item.id === pairingData.kittenId);
    if (partner) {
      notices.push({
        title: "October Adoption Notice",
        message: `From ${dates.start} through ${dates.end}, ${kitten.name} and ${partner.name} will be temporarily unavailable for adoption in accordance with the rescue's October adoption guidelines. As this pair is required to be adopted together, both kittens will remain unavailable during this period. Adoptions for this pair will resume after ${dates.end}.`
      });
    }
  }
  return notices;
}

function getProfileTraits(kitten) {
  const explicitTraits = Array.isArray(kitten.personalityTraits)
    ? kitten.personalityTraits.filter(Boolean).map(item => String(item).trim())
    : [];

  const bioText = [kitten.bio, kitten.description].filter(Boolean).join(" ").toLowerCase();
  const recognizedTraits = [
    ["Active", "active"],
    ["Affectionate", "affectionate"],
    ["Bold", "bold"],
    ["Calm", "calm"],
    ["Confident", "confident"],
    ["Curious", "curious"],
    ["Cuddly", "cuddly"],
    ["Energetic", "energetic"],
    ["Friendly", "friendly"],
    ["Funny", "funny"],
    ["Gentle", "gentle"],
    ["Independent", "independent"],
    ["Lively", "lively"],
    ["Observant", "observant"],
    ["Outgoing", "outgoing"],
    ["Playful", "playful"],
    ["Quiet", "quiet"],
    ["Social", "social"],
    ["Sweet", "sweet"]
  ]
    .filter(([label]) => !explicitTraits.includes(label))
    .filter(([, keyword]) => bioText.includes(keyword))
    .map(([label]) => label);

  return [...new Set([...explicitTraits, ...recognizedTraits])].slice(0, 6);
}

function normalizeHealthChecklist(kitten) {
  const gender = String(kitten.gender || "").trim().toLowerCase();
  const preferred = gender.startsWith("male") ? "Neutered" : gender.startsWith("female") ? "Spayed" : "";
  return [preferred, "Fully vaccinated", "Dewormed", "Flea treated", "Microchipped", "Fostered and socialized"]
    .filter(Boolean)
    .filter((item, index, all) => all.indexOf(item) === index);
}

function formatCompatibilityValue(rawValue) {
  const value = String(rawValue ?? "").trim();
  if (!value) return "Unknown — no direct experience";
  const lowercase = value.toLowerCase();
  if (lowercase.startsWith("yes — prefers to be the only cat")) return value;
  if (lowercase.includes("possibly")) return "Possibly — no direct experience";
  if (lowercase.includes("unknown") || lowercase.includes("no direct experience")) return "Unknown — no direct experience";
  if (lowercase.includes("with proper introduction")) return "Yes — with proper introduction";
  if (lowercase.startsWith("yes")) return "Yes";
  if (lowercase.startsWith("no")) return "No";
  return value;
}

function getPairingDescription(kitten, pairingData) {
  if (!pairingData) return "";
  if (kitten.pairingDescription) return kitten.pairingDescription;
  const pairNames = [kitten.name, pairingData.kittenName].filter(Boolean);
  if (pairNames.includes("Diego") && pairNames.includes("Valentina")) {
    if (kitten.id === "diego") {
      return "Diego and Valentina are brother and sister who have grown up side by side. They love playing, wrestling, cuddling, and simply being around each other. With their similar personalities and close bond, they bring so much fun and love to a home together.";
    }
    if (kitten.id === "valentina") {
      return "Valentina and Diego are brother and sister who have grown up side by side. They love playing, wrestling, cuddling, and being around each other, and are a sweet duo to welcome into a home together.";
    }
    return "Diego and Valentina are biological siblings who have been together since they were born. They love playing, cuddling, and simply being near each other. They have such similar personalities and do wonderfully as a pair, making them a sweet duo to welcome into a home together.";
  }
  if (pairingData.type === "bonded") {
    return `${kitten.name} and ${pairingData.kittenName} are a bonded pair and do best together.`;
  }
  return `${kitten.name} is happiest with ${pairingData.kittenName} and would thrive in a home that keeps them together.`;
}

function renderProfile(kitten) {
  if (typeof document === "undefined") return;
  const root = document.querySelector("#profile-main");
  if (!root) return;

  if (!kitten) {
    root.innerHTML = '<div class="profile-not-found"><h1>Kitten profile not found</h1><p>Choose a kitten from the homepage to see their profile.</p><a class="button primary" href="../#kittens">Browse kittens</a></div>';
    return;
  }

  const photoSet = [...new Set([kitten.image, ...(kitten.photos || [])].filter(Boolean))];
  const galleryPhotos = photoSet.length ? photoSet : [];
  const mainImage = galleryPhotos[0] ? profilePhotoSource(galleryPhotos[0]) : "";
  const photoGallery = galleryPhotos.length
    ? `<div class="profile-gallery">
        <button class="profile-main-photo photo-open" type="button" data-index="0" aria-label="Open ${escapeHTML(kitten.name)}'s main photo">
          <img src="${escapeHTML(mainImage)}" alt="${escapeHTML(kitten.name)}">
        </button>
        <div class="profile-thumbnails">${galleryPhotos.slice(1).map((photo, index) => `
          <button class="photo-open" type="button" data-index="${index + 1}" aria-label="Open ${escapeHTML(kitten.name)} photo ${index + 2}">
            <img src="${escapeHTML(profilePhotoSource(photo))}" alt="${escapeHTML(kitten.name)} photo ${index + 2}" loading="lazy">
          </button>`).join("")}</div>
      </div>`
    : '<div class="profile-photo-placeholder">Add this kitten\'s photos in assets/kittens/</div>';

  const bioText = kitten.bio || "Coming Soon";
  const bioMarkup = `<p class="profile-bio">${escapeHTML(bioText)}</p>`;
  const petfinderText = kitten.petfinderUrl
    ? `<a class="button primary" href="${escapeHTML(kitten.petfinderUrl)}" target="_blank" rel="noopener noreferrer">View ${escapeHTML(kitten.name)} on Petfinder</a>`
    : `<p class="profile-meta-label"><strong>Petfinder:</strong> Coming Soon</p>`;

  const profileTraits = getProfileTraits(kitten);
  const traits = "";

  const compatibilityEntries = [
    ["Cats", kitten.compatibility?.cats],
    ["Dogs", kitten.compatibility?.dogs],
    ["Younger Children", kitten.compatibility?.youngerChildren],
    ["Older Children", kitten.compatibility?.olderChildren]
  ].filter(([, value]) => value !== undefined && value !== null && value !== "");

  const idealHomeBlock = `
    <section class="profile-detail profile-ideal-home">
      <h2>Ideal Home</h2>
      ${kitten.idealHome ? `<p class="profile-ideal-description">${escapeHTML(kitten.idealHome)}</p>` : ""}
      ${kitten.idealHomeNote ? `<p>${escapeHTML(kitten.idealHomeNote)}</p>` : ""}
      ${compatibilityEntries.length ? `<div class="compatibility-list">${compatibilityEntries.map(([label, value]) => `<div class="compatibility-item"><span>${escapeHTML(label)}</span> <strong class="compatibility-value compatibility-${formatCompatibilityValue(value).toLowerCase().startsWith("yes") ? "yes" : formatCompatibilityValue(value).toLowerCase().startsWith("no") ? "no" : "unknown"}">${escapeHTML(formatCompatibilityValue(value).startsWith("Possibly") || formatCompatibilityValue(value).startsWith("Unknown") ? "Unknown" : formatCompatibilityValue(value).split(" — ")[0])}</strong></div>`).join("")}</div>` : ""}
    </section>
  `;

  const healthIcons = { "Spayed": "✿", "Neutered": "✦", "Fully vaccinated": "💉", "Dewormed": "🧪", "Flea treated": "🐜", "Microchipped": "▦", "Fostered and socialized": "♥" };
  const health = `<section class="profile-detail profile-health"><h2>Health &amp; Care</h2><div class="health-tiles">${normalizeHealthChecklist(kitten).map(item => `<div class="health-tile"><span aria-hidden="true">${healthIcons[item] || "✓"}</span><strong>${escapeHTML(item)}</strong></div>`).join("")}</div></section>`;

  const requirements = kitten.adoptionRequirements?.length
    ? `<section class="profile-detail"><h2>Adoption requirements</h2><ul>${kitten.adoptionRequirements.map(item => `<li>${escapeHTML(item)}</li>`).join("")}</ul></section>`
    : "";

  const pairingData = getPairingData(kitten);
  const pairingDescription = getPairingDescription(kitten, pairingData);
  const pairing = pairingData.type === "single"
    ? `<section class="profile-detail profile-pairing"><h2>Adoption Pairing</h2><p>Can be adopted individually.</p></section>`
    : pairingData.type === "any-sibling"
    ? `<section class="profile-detail profile-pairing"><h2>Adoption Pairing</h2><p>Must be adopted with a suitable sibling or foster sibling. No specific companion is required.</p></section>`
    : `<section class="profile-detail profile-pairing">
        <h2>${pairingData.type === "bonded" ? "Bonded Pair" : "Preferred Pair"}</h2>
        ${pairingData.kittenId ? `<a class="pair-partner-link" href="${escapeHTML(`profile-template.html?id=${pairingData.kittenId}`)}"><span class="pair-partner-label">Meet their companion</span><strong>${escapeHTML(pairingData.kittenName)}</strong><span>View profile →</span></a>` : ""}
        ${pairingDescription ? `<p class="profile-pairing-copy">${escapeHTML(pairingDescription)}</p>` : ""}
        ${pairingData.kittenId ? `<p><a class="text-link" href="${escapeHTML(`profile-template.html?id=${pairingData.kittenId}`)}">Get to Know ${escapeHTML(pairingData.kittenName)} →</a></p>` : ""}
      </section>`;

  const octoberDates = getOctoberNoticeDates(typeof window !== "undefined" ? window.PAWS_EVENT_DATA?.octoberNotice : null);
  const adoptionNotices = getProfileAdoptionNotices(kitten, pairingData, octoberDates);
  const safetyNotice = adoptionNotices.map(notice => `<section class="profile-detail profile-reminder profile-october-notice">
      <h2>${escapeHTML(notice.title)}</h2><p>${escapeHTML(notice.message)}</p>
    </section>`).join("");

  const meeting = kitten.whereToMeet || kitten.eventInformation
    ? `<section class="profile-detail"><h2>Where to meet ${escapeHTML(kitten.name)}</h2>${kitten.whereToMeet ? `<p>${escapeHTML(kitten.whereToMeet)}</p>` : ""}${kitten.eventInformation ? `<p>${escapeHTML(kitten.eventInformation)}</p>` : ""}</section>`
    : "";

  const video = kitten.videoUrl
    ? `<section class="profile-detail"><h2>Video</h2><a class="text-link" href="${escapeHTML(kitten.videoUrl)}" target="_blank" rel="noopener noreferrer">Watch ${escapeHTML(kitten.name)}'s video ↗</a></section>`
    : "";

  const adoptionReminder = kitten.id === "wally"
    ? `
    <section class="profile-detail profile-reminder">
      <h2>Interested in adopting Wally?</h2>
      <p>Wally must be adopted with his bonded brother, <a class="text-link" href="profile-template.html?id=raymond">Raymond</a>. If you're interested in making them part of your family, you can learn more about Raymond below and review the adoption process to see what comes next.</p>
      <p>Have questions or want to see if Wally is a good fit for your home?</p>
      <p>Reach out to <strong><a href="https://www.nopawsleftbehindkittyrescue.com/">No Paws Left Behind Kitty Rescue</a></strong> with questions or to ask about scheduling a meet-and-greet. You can also visit our <a class="text-link" href="../#events">Events</a> page to find out where Wally will be this weekend. If you have questions about the adoption process, No Paws Left Behind Kitty Rescue is always happy to help. For smaller questions or foster-specific details, you can also email us directly at <a href="mailto:PawsAndPurrFosters@gmail.com">PawsAndPurrFosters@gmail.com</a>.</p>
      <a class="button primary" href="../how-to-adopt/">Learn How to Adopt</a>
    </section>
  `
    : kitten.id === "raymond"
    ? `
    <section class="profile-detail profile-reminder">
      <h2>Interested in adopting Raymond?</h2>
      <p>Raymond must be adopted with his bonded brother, <a class="text-link" href="profile-template.html?id=wally">Wally</a>. If you're interested in making them part of your family, you can learn more about Wally below and review the adoption process to see what comes next.</p>
      <p>Have questions or want to see if Raymond is a good fit for your home?</p>
      <p>Reach out to <strong><a href="https://www.nopawsleftbehindkittyrescue.com/">No Paws Left Behind Kitty Rescue</a></strong> with questions or to ask about scheduling a meet-and-greet. You can also visit our <a class="text-link" href="../#events">Events</a> page to find out where Raymond will be this weekend. If you have questions about the adoption process, <strong><a href="https://www.nopawsleftbehindkittyrescue.com/">No Paws Left Behind Kitty Rescue</a></strong> is always happy to help. For smaller questions or foster-specific details, you can also email us directly at <a href="mailto:PawsAndPurrFosters@gmail.com">PawsAndPurrFosters@gmail.com</a>.</p>
      <a class="button primary" href="../how-to-adopt/">Learn How to Adopt</a>
    </section>
  `
    : kitten.id === "valentina"
    ? `
    <section class="profile-detail profile-reminder">
      <h2>Interested in adopting Valentina?</h2>
      <p>Valentina must be adopted with her brother, <a class="text-link" href="profile-template.html?id=diego">Diego</a>. If you're interested in making them part of your family, you can learn more about Diego below and review the adoption process to see what comes next.</p>
      <p>Have questions or want to see if Valentina is a good fit for your home?</p>
      <p>Reach out to <strong><a href="https://www.nopawsleftbehindkittyrescue.com/">No Paws Left Behind Kitty Rescue</a></strong> with questions or to ask about scheduling a meet-and-greet. You can also visit our <a class="text-link" href="../#events">Events</a> page to find out where Valentina will be this weekend. If you have questions about the adoption process, <strong><a href="https://www.nopawsleftbehindkittyrescue.com/">No Paws Left Behind Kitty Rescue</a></strong> is always happy to help. For smaller questions or foster-specific details, you can also email us directly at <a href="mailto:PawsAndPurrFosters@gmail.com">PawsAndPurrFosters@gmail.com</a>.</p>
      <a class="button primary" href="../how-to-adopt/">Learn How to Adopt</a>
    </section>
  `
    : kitten.id === "diego"
    ? `
    <section class="profile-detail profile-reminder">
      <h2>Interested in adopting Diego?</h2>
      <p>Diego must be adopted with his sister, <a class="text-link" href="profile-template.html?id=valentina">Valentina</a>. If you're interested in making them part of your family, you can learn more about Valentina below and review the adoption process to see what comes next.</p>
      <p>Have questions or want to see if Diego is a good fit for your home?</p>
      <p>Reach out to <strong><a href="https://www.nopawsleftbehindkittyrescue.com/">No Paws Left Behind Kitty Rescue</a></strong> with questions or to ask about scheduling a meet-and-greet. You can also visit our <a class="text-link" href="../#events">Events</a> page to find out where Diego will be this weekend. If you have questions about the adoption process, No Paws Left Behind Kitty Rescue is always happy to help. For smaller questions or foster-specific details, you can also email us directly at <a href="mailto:PawsAndPurrFosters@gmail.com">PawsAndPurrFosters@gmail.com</a>.</p>
      <a class="button primary" href="../how-to-adopt/">Learn How to Adopt</a>
    </section>
  `
    : kitten.id === "melody"
    ? `
    <section class="profile-detail profile-reminder">
      <h2>Interested in adopting Melody?</h2>
      <p>Melody must be adopted with her brother, <a class="text-link" href="profile-template.html?id=harvey">Harvey</a>. If you're interested in making them part of your family, you can learn more about Harvey below and review the adoption process to see what comes next.</p>
      <p>Have questions or want to see if Melody is a good fit for your home?</p>
      <p>Reach out to <strong><a href="https://www.nopawsleftbehindkittyrescue.com/">No Paws Left Behind Kitty Rescue</a></strong> with questions or to ask about scheduling a meet-and-greet. You can also visit our <a class="text-link" href="../#events">Events</a> page to find out where Melody will be this weekend. If you have questions about the adoption process, <strong><a href="https://www.nopawsleftbehindkittyrescue.com/">No Paws Left Behind Kitty Rescue</a></strong> is always happy to help. For smaller questions or foster-specific details, you can also email us directly at <a href="mailto:PawsAndPurrFosters@gmail.com">PawsAndPurrFosters@gmail.com</a>.</p>
      <a class="button primary" href="../how-to-adopt/">Learn How to Adopt</a>
    </section>
  `
    : kitten.id === "harvey"
    ? `
    <section class="profile-detail profile-reminder">
      <h2>Interested in adopting Harvey?</h2>
      <p>Harvey must be adopted with his sister, <a class="text-link" href="profile-template.html?id=melody">Melody</a>. If you're interested in making them part of your family, you can learn more about Melody below and review the adoption process to see what comes next.</p>
      <p>Have questions or want to see if Harvey is a good fit for your home?</p>
      <p>Reach out to <strong><a href="https://www.nopawsleftbehindkittyrescue.com/">No Paws Left Behind Kitty Rescue</a></strong> with questions or to ask about scheduling a meet-and-greet. You can also visit our <a class="text-link" href="../#events">Events</a> page to find out where Harvey will be this weekend. If you have questions about the adoption process, <strong><a href="https://www.nopawsleftbehindkittyrescue.com/">No Paws Left Behind Kitty Rescue</a></strong> is always happy to help. For smaller questions or foster-specific details, you can also email us directly at <a href="mailto:PawsAndPurrFosters@gmail.com">PawsAndPurrFosters@gmail.com</a>.</p>
      <a class="button primary" href="../how-to-adopt/">Learn How to Adopt</a>
    </section>
  `
    : kitten.id === "paloma"
    ? `
    <section class="profile-detail profile-reminder">
      <h2>Interested in adopting Paloma?</h2>
      <p>Paloma must be adopted with her sister, <a class="text-link" href="profile-template.html?id=claudia">Claudia</a>. If you're interested in making them part of your family, you can learn more about Claudia below and review the adoption process to see what comes next.</p>
      <p>Have questions or want to see if Paloma is a good fit for your home?</p>
      <p>Reach out to <strong><a href="https://www.nopawsleftbehindkittyrescue.com/">No Paws Left Behind Kitty Rescue</a></strong> with questions or to ask about scheduling a meet-and-greet. You can also visit our <a class="text-link" href="../#events">Events</a> page to find out where Paloma will be this weekend. If you have questions about the adoption process, <strong><a href="https://www.nopawsleftbehindkittyrescue.com/">No Paws Left Behind Kitty Rescue</a></strong> is always happy to help. For smaller questions or foster-specific details, you can also email us directly at <a href="mailto:PawsAndPurrFosters@gmail.com">PawsAndPurrFosters@gmail.com</a>.</p>
      <a class="button primary" href="../how-to-adopt/">Learn How to Adopt</a>
    </section>
  `
    : kitten.id === "claudia"
    ? `
    <section class="profile-detail profile-reminder">
      <h2>Interested in adopting Claudia?</h2>
      <p>Claudia must be adopted with her sister, <a class="text-link" href="profile-template.html?id=paloma">Paloma</a>. If you're interested in making them part of your family, you can learn more about Paloma below and review the adoption process to see what comes next.</p>
      <p>Have questions or want to see if Claudia is a good fit for your home?</p>
      <p>Reach out to <strong><a href="https://www.nopawsleftbehindkittyrescue.com/">No Paws Left Behind Kitty Rescue</a></strong> with questions or to ask about scheduling a meet-and-greet. You can also visit our <a class="text-link" href="../#events">Events</a> page to find out where Claudia will be this weekend. If you have questions about the adoption process, <strong><a href="https://www.nopawsleftbehindkittyrescue.com/">No Paws Left Behind Kitty Rescue</a></strong> is always happy to help. For smaller questions or foster-specific details, you can also email us directly at <a href="mailto:PawsAndPurrFosters@gmail.com">PawsAndPurrFosters@gmail.com</a>.</p>
      <a class="button primary" href="../how-to-adopt/">Learn How to Adopt</a>
    </section>
  `
    : `
    <section class="profile-detail profile-reminder">
      <h2>Interested in adopting ${escapeHTML(kitten.name)}?</h2>
      ${pairingData ? `<p>${escapeHTML(kitten.name)} ${pairingData.type === "bonded" ? "must be adopted with" : "is happiest with"} <a class="text-link" href="${escapeHTML(`profile-template.html?id=${pairingData.kittenId}`)}">${escapeHTML(pairingData.kittenName)}</a>.</p>` : "<p>We would love to hear from you.</p>"}
      <a class="button primary" href="../how-to-adopt/">Learn How to Adopt</a>
    </section>
  `;

  document.title = `${kitten.name} | Paws & Purr Fosters`;
  const returnFrom = new URLSearchParams(window.location.search).get("from");
  const backHref = returnFrom === "home" ? "../#kittens" : "../all-kittens/";
  const backLabel = returnFrom === "home" ? "Our Fosters" : "Current Fosters";
  root.innerHTML = `<a class="profile-back-link" href="${backHref}" aria-label="Back to ${backLabel}">← <span>${backLabel}</span></a>
  <div class="profile-layout">
    <div>${photoGallery}</div>
    <div class="profile-intro">
      <h1>${escapeHTML(kitten.name)}</h1>
      <p class="profile-status${["raymond", "wally"].includes(kitten.id) && (kitten.adoptionStatus || kitten.status) === "Returned — Available" ? " status-returned" : ""}">${escapeHTML(kitten.adoptionStatus || kitten.status || "")}</p>
      ${kitten.birthday ? `<p><strong>Birthday:</strong> ${escapeHTML(formatBirthday(kitten.birthday))}${kittenAge(kitten.birthday) ? ` · ${escapeHTML(kittenAge(kitten.birthday))} old` : ""}</p>` : ""}
      ${kitten.gender ? `<p><strong>Gender:</strong> ${escapeHTML(kitten.gender)}</p>` : ""}
      ${bioMarkup}
      ${petfinderText}
      ${safetyNotice}
    </div>
  </div>
  <div class="profile-details">
    ${health}${idealHomeBlock}${pairing}${adoptionReminder}${requirements}${meeting}${video}
  </div>`;

  const lightbox = document.querySelector("#photo-lightbox");
  const lightboxImage = lightbox?.querySelector("img");
  const lightboxPrev = document.querySelector(".lightbox-prev");
  const lightboxNext = document.querySelector(".lightbox-next");

  const openLightbox = index => {
    if (!lightbox || !lightboxImage || !galleryPhotos.length) return;
    const nextIndex = (index + galleryPhotos.length) % galleryPhotos.length;
    lightboxImage.src = profilePhotoSource(galleryPhotos[nextIndex]);
    lightboxImage.alt = `${kitten.name} photo ${nextIndex + 1}`;
    lightbox.dataset.index = String(nextIndex);
    lightbox.showModal();
  };

  const closeLightbox = () => {
    if (lightbox && typeof lightbox.close === "function") lightbox.close();
  };

  root.querySelectorAll(".photo-open").forEach(button => {
    button.addEventListener("click", () => {
      const selectedIndex = Number(button.dataset.index || 0);
      openLightbox(selectedIndex);
    });
  });

  lightboxPrev?.addEventListener("click", () => {
    const currentIndex = Number(lightbox.dataset.index || 0);
    openLightbox(currentIndex - 1);
  });

  lightboxNext?.addEventListener("click", () => {
    const currentIndex = Number(lightbox.dataset.index || 0);
    openLightbox(currentIndex + 1);
  });

  document.querySelector(".lightbox-close")?.addEventListener("click", closeLightbox);
  lightbox?.addEventListener("click", event => {
    if (event.target === event.currentTarget) closeLightbox();
  });

  let touchStartX = null;
  lightbox?.addEventListener("touchstart", event => {
    const firstTouch = event.touches[0];
    touchStartX = firstTouch ? firstTouch.clientX : null;
  }, { passive: true });

  lightbox?.addEventListener("touchend", event => {
    const endTouch = event.changedTouches[0];
    if (touchStartX === null || !endTouch) return;
    const delta = endTouch.clientX - touchStartX;
    if (Math.abs(delta) > 40) {
      const currentIndex = Number(lightbox.dataset.index || 0);
      openLightbox(delta < 0 ? currentIndex + 1 : currentIndex - 1);
    }
    touchStartX = null;
  }, { passive: true });

  document.addEventListener("keydown", event => {
    if (!lightbox || !lightbox.open) return;
    if (event.key === "Escape" && lightbox.open) closeLightbox();
    if (event.key === "ArrowRight" && lightbox.open) {
      const currentIndex = Number(lightbox.dataset.index || 0);
      openLightbox(currentIndex + 1);
    }
    if (event.key === "ArrowLeft" && lightbox.open) {
      const currentIndex = Number(lightbox.dataset.index || 0);
      openLightbox(currentIndex - 1);
    }
  });

  document.querySelector("#profile-main")?.addEventListener("error", event => {
    if (event.target instanceof HTMLImageElement) event.target.closest("button")?.classList.add("image-unavailable");
  }, true);
}

if (typeof globalThis !== "undefined") {
  globalThis.escapeHTML = escapeHTML;
  globalThis.formatBirthday = formatBirthday;
  globalThis.kittenAge = kittenAge;
  globalThis.getPairingData = getPairingData;
  globalThis.getOctoberNoticeDates = getOctoberNoticeDates;
  globalThis.getProfileAdoptionNotices = getProfileAdoptionNotices;
  globalThis.getProfileTraits = getProfileTraits;
  globalThis.normalizeHealthChecklist = normalizeHealthChecklist;
  globalThis.formatCompatibilityValue = formatCompatibilityValue;
  globalThis.renderProfile = renderProfile;
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  const profileId = new URLSearchParams(window.location.search).get("id");
  const currentKitten = window.PAWS_KITTENS?.find(kitten => kitten.id === profileId);
  renderProfile(currentKitten);
}

if (typeof module !== "undefined") {
  module.exports = {
    escapeHTML,
    formatBirthday,
    kittenAge,
    getPairingData,
    getOctoberNoticeDates,
    getProfileAdoptionNotices,
    getProfileTraits,
    normalizeHealthChecklist,
    formatCompatibilityValue,
    renderProfile
  };
}
