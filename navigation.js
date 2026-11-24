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

// Add the kitten matcher to shared navigation on every page.
if (nav) {
  const homeLink = nav.querySelector('a[href="./"], a[href="../"]');
  const alreadyAdded = nav.querySelector('a[href$="find-your-match/"]');
  if (homeLink && !alreadyAdded) {
    const matchLink = document.createElement("a");
    matchLink.href = new URL("find-your-match/", homeLink.href).href;
    matchLink.textContent = "Find Your Match";
    const eventsLink = Array.from(nav.querySelectorAll("a")).find(link => /events\\//.test(link.getAttribute("href") || ""));
    if (eventsLink) nav.insertBefore(matchLink, eventsLink);
    else nav.appendChild(matchLink);
  }
}
