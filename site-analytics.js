(() => {
  const OPT_OUT_KEY = "paws_purr_analytics_opt_out";
  const OPT_OUT_PARAM = "analytics";
  const params = new URLSearchParams(window.location.search);
  if (params.get(OPT_OUT_PARAM) === "off") {
    try { localStorage.setItem(OPT_OUT_KEY, "true"); } catch (_) {}
    params.delete(OPT_OUT_PARAM);
    const cleanUrl = window.location.pathname + (params.toString() ? "?" + params.toString() : "") + window.location.hash;
    window.history.replaceState({}, document.title, cleanUrl);
  }
  try { if (localStorage.getItem(OPT_OUT_KEY) === "true") return; } catch (_) { return; }

  const ENDPOINT = "https://ovnbbpcrwbvotyevghcx.supabase.co/functions/v1/site-analytics";
  const PUBLISHABLE_KEY = "sb_publishable_" + "ZXH8vHOT0p3-rgQgK280uw_BWsMJzAK";
  let sessionId = "";
  try {
    sessionId = sessionStorage.getItem("paws_purr_analytics_session") || "";
    if (!sessionId) {
      sessionId = crypto.randomUUID ? crypto.randomUUID() : "sess-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem("paws_purr_analytics_session", sessionId);
    }
  } catch (_) { return; }

  function sourceFromReferrer() {
    const referrer = document.referrer;
    if (!referrer) return "direct";
    try {
      const host = new URL(referrer).hostname.toLowerCase();
      if (host.includes("instagram.com")) return "instagram";
      if (host.includes("facebook.com") || host.includes("fb.com")) return "facebook";
      if (host.includes("google.")) return "google";
      if (host.includes("petfinder.com")) return "petfinder";
      return "other";
    } catch (_) { return "other"; }
  }

  function send(eventName, kittenId) {
    const payload = {
      event_name: eventName,
      page_path: window.location.pathname.slice(0, 180) || "/",
      source: sourceFromReferrer(),
      session_id: sessionId,
      kitten_id: kittenId || null
    };
    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: PUBLISHABLE_KEY },
      body: JSON.stringify(payload),
      keepalive: true,
      credentials: "omit"
    }).catch(() => {});
  }

  send("page_view");
  if (/\/kittens\/profile-template\.html$/.test(window.location.pathname)) {
    const kittenId = new URLSearchParams(window.location.search).get("id");
    if (kittenId) send("profile_view", kittenId);
  }

  document.addEventListener("click", event => {
    const link = event.target && event.target.closest ? event.target.closest("a[href]") : null;
    if (!link) return;
    const href = link.href || "";
    if (/petfinder\.com\//i.test(href)) {
      send("adoption_click", link.getAttribute("data-kitten-id") || "");
    }
  });

  document.addEventListener("paws:analytics", event => {
    const name = event.detail && event.detail.event;
    if (["quiz_started", "quiz_completed", "quiz_step"].includes(name)) {
      send(name, event.detail.kitten_id || "");
    }
  });
})();