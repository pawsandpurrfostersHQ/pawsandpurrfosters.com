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
