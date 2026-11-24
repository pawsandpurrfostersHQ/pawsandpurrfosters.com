(() => {
  if (window.location.pathname !== "/" && !window.location.pathname.endsWith("/index.html")) return;
  if (sessionStorage.getItem("paws_match_prompt_dismissed") === "1") return;

  const style = document.createElement("style");
  style.textContent = `
    .paws-match-prompt{position:fixed;right:20px;bottom:20px;z-index:900;background:#fff;border:1px solid #d9d2e7;border-radius:18px;box-shadow:0 12px 34px rgba(45,32,65,.18);width:min(350px,calc(100vw - 32px));padding:20px 46px 18px 20px;color:#393044;opacity:0;transform:translateY(14px);transition:opacity .25s ease,transform .25s ease}
    .paws-match-prompt.is-visible{opacity:1;transform:translateY(0)}
    .paws-match-prompt .prompt-kicker{font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;color:#6d5b83;font-weight:700;margin:0 0 6px}
    .paws-match-prompt h2{font-size:1.15rem;line-height:1.3;margin:0 0 7px;color:#40334e}
    .paws-match-prompt p{font-size:.9rem;line-height:1.5;margin:0 0 13px}
    .paws-match-prompt .prompt-link{display:inline-flex;align-items:center;justify-content:center;background:#6d5686;color:#fff;text-decoration:none;border-radius:999px;padding:10px 16px;font-weight:650;font-size:.88rem}
    .paws-match-prompt .prompt-close{position:absolute;right:12px;top:10px;border:0;background:transparent;color:#655b6d;font-size:1.4rem;line-height:1;cursor:pointer;padding:5px}
    @media(max-width:600px){.paws-match-prompt{right:12px;bottom:12px;width:calc(100vw - 24px);padding:17px 42px 16px 17px}}
    @media(prefers-reduced-motion:reduce){.paws-match-prompt{transition:none}}
  `;
  document.head.appendChild(style);
  const prompt = document.createElement("aside");
  prompt.className = "paws-match-prompt";
  prompt.setAttribute("aria-label","Kitten matching quiz invitation");
  prompt.innerHTML = '<button class="prompt-close" type="button" aria-label="Dismiss suggestion">×</button><p class="prompt-kicker">A little help finding your match?</p><h2>Find a kitten who fits your home.</h2><p>Answer a few thoughtful questions about your household and the kind of companion you’re hoping for.</p><a class="prompt-link" href="find-your-match/">Find Your Kitten Match</a>';
  document.body.appendChild(prompt);
  let shown = false;
  const reveal = () => {
    if (shown) return;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollable > 0 && window.scrollY / scrollable >= .35) {
      shown = true;
      prompt.classList.add("is-visible");
      window.removeEventListener("scroll", reveal);
    }
  };
  prompt.querySelector(".prompt-close").addEventListener("click", () => {
    prompt.remove();
    sessionStorage.setItem("paws_match_prompt_dismissed","1");
    window.removeEventListener("scroll", reveal);
  });
  window.addEventListener("scroll", reveal, {passive:true});
  reveal();
})();