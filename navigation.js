const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
  });

  nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// Load privacy-first analytics on public pages that share the main navigation.
if (nav) {
  const homeLink = nav.querySelector('a[href="./"], a[href="../"]');
  if (homeLink && !document.querySelector('script[data-paws-analytics]')) {
    const analyticsScript = document.createElement("script");
    analyticsScript.src = new URL("site-analytics.js", homeLink.href).href;
    analyticsScript.defer = true;
    analyticsScript.dataset.pawsAnalytics = "true";
    document.head.appendChild(analyticsScript);
  }
}

// Add the kitten matcher to shared navigation on every page.
if (nav) {
  const homeLink = nav.querySelector('a[href="./"], a[href="../"]');
  const alreadyAdded = nav.querySelector('a[href$="find-your-match/"]');
  if (homeLink && !alreadyAdded) {
    const matchLink = document.createElement("a");
    matchLink.href = new URL("find-your-match/", homeLink.href).href;
    matchLink.textContent = "Find Your Match";
    matchLink.addEventListener("click", () => { nav.classList.remove("open"); menuToggle?.setAttribute("aria-expanded", "false"); });
    const eventsLink = Array.from(nav.querySelectorAll("a")).find(link => (link.getAttribute("href") || "").includes("events/"));
    if (eventsLink) nav.insertBefore(matchLink, eventsLink);
    else nav.appendChild(matchLink);
  }
}


// Load the compact kitten-question paw button on every page.
if (nav && !document.querySelector('script[data-paws-question-helper]')) {
  const homeLink = nav.querySelector('a[href="./"], a[href="../"]');
  if (homeLink) {
    const helperScript = document.createElement("script");
    helperScript.src = new URL("faq-guide.js?v=20261124-paw-helper1", homeLink.href).href;
    helperScript.defer = true;
    helperScript.dataset.pawsQuestionHelper = "true";
    document.body.appendChild(helperScript);
    if (!document.querySelector('link[data-paws-question-helper-style]')) {
      const helperStyle = document.createElement("link");
      helperStyle.rel = "stylesheet";
      helperStyle.href = new URL("faq-guide.css?v=20261124-paw-helper1", homeLink.href).href;
      helperStyle.dataset.pawsQuestionHelperStyle = "true";
      document.head.appendChild(helperStyle);
    }
  }
}
