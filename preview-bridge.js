(() => {
  "use strict";
  const KEY = "pawsandpurr-preview-draft-v1";
  const EDITOR_ORIGIN = "https://ovnbbpcrwbvotyevghcx.supabase.co";
  const PREVIEW_QUERY = new URLSearchParams(location.search).has("paws-preview");
  let draft = null;
  try { draft = JSON.parse(sessionStorage.getItem(KEY) || "null"); } catch {}
  const isPreview = Boolean(draft || PREVIEW_QUERY);
  if (!isPreview) return;

  function applyDraft(value) {
    draft = value;
    window.__PAWS_PREVIEW_DATA = value;
    if (Array.isArray(value.kittens)) window.PAWS_KITTENS = value.kittens;
    if (value.events && typeof value.events === "object") window.PAWS_EVENT_DATA = value.events;
    if (Array.isArray(value.alumni)) window.PAWS_FOSTER_ALUMNI = value.alumni;
    if (Array.isArray(value.heroPhotos)) window.PAWS_FOSTER_CAROUSEL_PHOTOS = value.heroPhotos;
    document.documentElement.classList.add("paws-preview-mode");
  }

  if (draft) applyDraft(draft);

  window.addEventListener("message", event => {
    if (event.source !== window.parent || event.origin !== EDITOR_ORIGIN) return;
    const message = event.data || {};
    if (message.type === "paws-preview-set-draft" && message.draft && typeof message.draft === "object") {
      try {
        sessionStorage.setItem(KEY, JSON.stringify(message.draft));
        event.source.postMessage({ type: "paws-preview-saved" }, EDITOR_ORIGIN);
        location.reload();
      } catch (error) {
        event.source.postMessage({ type: "paws-preview-error", message: "The preview could not store all draft photos. Try fewer or smaller new photos." }, EDITOR_ORIGIN);
      }
    } else if (message.type === "paws-preview-clear") {
      sessionStorage.removeItem(KEY);
      window.__PAWS_PREVIEW_DATA = null;
      document.documentElement.classList.remove("paws-preview-mode");
      event.source.postMessage({ type: "paws-preview-cleared" }, EDITOR_ORIGIN);
    }
  });

  if (window.parent !== window) {
    window.parent.postMessage({ type: "paws-preview-ready", needsDraft: !draft }, EDITOR_ORIGIN);
  }

  const nativeFetch = window.fetch.bind(window);
  window.fetch = function(input, init) {
    const url = typeof input === "string" ? input : input && input.url || "";
    if (url.includes("/functions/v1/meet-greet") && String(init && init.method || "GET").toUpperCase() === "POST") {
      let payload = {};
      try { payload = JSON.parse(init.body || "{}"); } catch {}
      if (!["availability", "visitor-details"].includes(payload.action)) {
        return Promise.reject(new Error("This is a preview. Real Meet & Greet requests and appointment changes are disabled."));
      }
    }
    return nativeFetch(input, init);
  };

  document.addEventListener("submit", event => {
    if (event.target && event.target.closest("#private-meet-greet")) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);
  document.addEventListener("click", event => {
    const button = event.target && event.target.closest("#private-meet-greet button");
    if (!button) return;
    if (/submit|request|cancel|confirm|reschedul|book/i.test(button.textContent || "")) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const status = document.querySelector("#private-meet-greet .meet-greet-status, #private-meet-greet [role='status']");
      if (status) status.textContent = "Preview mode: no real Meet & Greet request or appointment change was sent.";
    }
  }, true);

  const addNotice = () => {
    if (!document.body || document.getElementById("paws-preview-notice")) return;
    const notice = document.createElement("div");
    notice.id = "paws-preview-notice";
    notice.textContent = "Preview mode · Changes are not live · Meet & Greet requests are disabled";
    notice.style.cssText = "position:fixed;z-index:99999;right:12px;bottom:12px;max-width:calc(100vw - 24px);padding:9px 14px;border:1px solid #d8cde5;border-radius:999px;background:#eee9f4;color:#57456f;font:600 12px/1.35 system-ui,sans-serif;box-shadow:0 4px 18px #24212622";
    document.body.appendChild(notice);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", addNotice, { once:true });
  else addNotice();
})();