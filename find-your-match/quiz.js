(() => {
  const root = document.querySelector("#match-quiz");
  if (!root) return;
  const RESCUE_PETFINDER = "https://www.petfinder.com/member/us/ca/oakley/no-paws-left-behind-kitty-rescue-ca3018/";
  const RESCUE_SITE = "https://www.nopawsleftbehindkittyrescue.com/adopt";
  const stepHost = document.querySelector("#quiz-step-content");
  const resultsHost = document.querySelector("#quiz-results");
  const restartWrap = document.querySelector("#quiz-restart-wrap");
  const nextButton = document.querySelector("#quiz-next");
  const backButton = document.querySelector("#quiz-back");
  const progressFill = document.querySelector("#quiz-progress-fill");
  const stepCount = document.querySelector("#quiz-step-count");
  const progressLabel = document.querySelector("#quiz-progress-label");
  const state = {};
  let stepIndex = 0;
  let currentQuestions = [];
  let quizStarted = false;

  const MATCH_PROFILES = {
    "diego-valentina": {
      energy: "high",
      affection: "independent",
      catFit: "yes",
      dogFit: "unknown",
      kidFit: { older: "yes", younger: "possible" },
      intro: "They are comfortable around other cats with a proper introduction. Their experience with dogs is unknown, so a dog household should check with the foster team and rescue before considering them.",
      summary: "The more energetic, curious, outgoing pair. They bring plenty of play and activity, and while both enjoy affection, they are a little more independent than Raymond and Wally.",
      reason: "You described a home looking for an active, playful pair with a little more independence. Diego and Valentina are social and affectionate, but bring a little more independent energy alongside their curiosity and love of exploring.",
      caution: "Their dog compatibility is unknown — they have not had direct experience with dogs. A calm, cat-friendly dog may be a possibility, but this is not a confirmed match."
    },
    "harvey-melody": {
      energy: "calm",
      affection: "middle",
      catFit: "yes",
      dogFit: "no",
      kidFit: { older: "yes", younger: "no" },
      intro: "They should do well with other cats with a proper introduction. A home without dogs and without young children is recommended.",
      summary: "A calmer, more relaxed duo with a little bit of playfulness and a comfortable middle ground for affection.",
      reason: "You described a home looking for a calmer pair with a balanced amount of affection. Harvey and Melody are sweet, people-focused siblings who enjoy playtime and settling in together.",
      caution: "Harvey and Melody are not recommended for homes with dogs or young children."
    },
    "raymond-wally": {
      energy: "mixed",
      affection: "very",
      catFit: "slow",
      dogFit: "no",
      kidFit: { older: "yes", younger: "no" },
      intro: "They may be able to live with other cats, but they prefer to be the only cats in the home. Because they have returned to foster care, plan for a patient, gradual introduction if you already have cats.",
      summary: "A very affectionate pair who enjoy people, playtime, and then slowing down for a nap. They may need a little extra patience while settling into a new home.",
      reason: "You described a home looking for a very affectionate pair with a mix of playfulness and relaxed downtime. Raymond and Wally are people-loving boys who enjoy attention and play, then happily settle in.",
      caution: "They prefer to be the only cats in the home. They may be okay with resident cats, but introductions should be especially slow and patient. They are not recommended for homes with dogs or young children."
    }
  };

  function availableKittens() {
    const all = Array.isArray(window.PAWS_KITTENS) ? window.PAWS_KITTENS : [];
    const allowed = new Set(["Available", "Returned — Available"]);
    return all.filter(k => allowed.has(k.adoptionStatus || k.status));
  }

  function getAvailablePairs() {
    const kittens = availableKittens();
    const byId = new Map(kittens.map(k => [k.id, k]));
    const seen = new Set();
    const pairs = [];
    for (const kitten of kittens) {
      const partnerId = kitten.pairing?.kittenId;
      if (!partnerId || kitten.pairing?.type !== "bonded") continue;
      const partner = byId.get(partnerId);
      if (!partner) continue;
      const ids = [kitten.id, partner.id].sort();
      const key = ids.join("-");
      if (seen.has(key)) continue;
      seen.add(key);
      pairs.push({
        key,
        kittens: ids.map(id => byId.get(id)).sort((a,b) => ["diego","valentina","harvey","melody","raymond","wally"].indexOf(a.id)-["diego","valentina","harvey","melody","raymond","wally"].indexOf(b.id)),
        profile: MATCH_PROFILES[key]
      });
    }
    return pairs.filter(pair => pair.profile);
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  }
  function hasCats() { return state.pets === "cats" || state.pets === "both"; }
  function hasDogs() { return state.pets === "dogs" || state.pets === "both"; }

  function getQuestions() {
    const questions = [{
      id: "pets",
      title: "Who already lives in your home?",
      hint: "This helps us consider the introductions and household dynamics each pair may need.",
      options: [
        ["none","No other pets","The kittens would be your only pets."],
        ["cats","One or more cats","There are already feline family members at home."],
        ["dogs","One or more dogs","There are dogs in the household."],
        ["both","Cats and dogs","Your home includes both cats and dogs."],
        ["other","Other pets","Birds, small animals, or another type of pet."]
      ]
    }];
    if (hasCats()) {
      questions.push({
        id: "residentCat",
        title: "How would you describe your current cat or cats?",
        hint: "Choose the answer that best describes the resident cat(s), not the kitten you hope to adopt.",
        options: [
          ["social","Friendly and social","They enjoy other cats and usually welcome company."],
          ["tolerant","They can adjust with time","They may need space and a gradual introduction."],
          ["solo","They prefer being the only cat","They are happiest with their own space."],
          ["unsure","I’m not sure yet","Their reaction to a new cat is hard to predict."]
        ]
      });
      questions.push({
        id: "residentEnergy",
        title: "What is your resident cat’s general energy level?",
        hint: "This is one more clue for thinking about a comfortable introduction.",
        options: [
          ["bouncy","Bouncy and playful","They enjoy activity and energetic play."],
          ["relaxed","Calm and laid-back","They prefer quiet time and a slower pace."],
          ["lap","A cuddly lap cat","They love people and relaxed companionship."],
          ["independent","Independent","They enjoy their own routine and personal space."],
          ["mixed","A little bit of everything","Their mood and energy vary."]
        ]
      });
    }
    if (hasDogs()) {
      questions.push({
        id: "dogEnergy",
        title: "How would you describe your dog or dogs?",
        hint: "This helps us understand your home, but it cannot replace a kitten’s documented dog-compatibility information.",
        options: [
          ["calm","Calm and cat-aware","They have lived respectfully with cats before."],
          ["active","Playful or high-energy","They are enthusiastic and may need careful management around cats."],
          ["unsure","Not sure / no cat experience","I would need guidance on introductions."]
        ]
      });
    }
    questions.push(
      {
        id: "energy",
        title: "What kind of kitten energy feels right for your home?",
        hint: "Think about the day-to-day rhythm you would enjoy.",
        options: [
          ["high","Playful and energetic","A curious explorer who is always ready for the next adventure."],
          ["calm","Calmer and relaxed","A more laid-back companion who enjoys a gentler pace."],
          ["mixed","A little bit of both","Playtime and activity, followed by cozy downtime."],
          ["any","No strong preference","Personality and household fit matter most."]
        ]
      },
      {
        id: "affection",
        title: "How affectionate would you like your kitten to be?",
        hint: "Every kitten is an individual, but this helps us understand the kind of companionship you’re hoping for.",
        options: [
          ["very","Very affectionate","I love cuddles, attention, and a kitten who wants to be close."],
          ["middle","Somewhere in between","I enjoy affection, but I also appreciate a little independence."],
          ["independent","More independent","I’m comfortable with a kitten who enjoys their own space."],
          ["any","No preference","I’m open to different personalities."]
        ]
      },
      {
        id: "intro",
        title: "How much time and patience can you allow for introductions?",
        hint: "A gradual introduction is important with resident pets. Some kittens may need an especially slow transition.",
        options: [
          ["slow","I can take it slowly","I can use separate spaces and gradual, supervised introductions."],
          ["moderate","I can allow some adjustment time","I can be patient, but I hope for a fairly straightforward transition."],
          ["quick","I need the easiest fit possible","I’m not in a position to manage a longer introduction."],
          ...(state.pets === "none" ? [["none","No resident pets","There are no existing pets to introduce."]] : [])
        ]
      }
    );
    questions.push({
      id: "children",
      title: "Are children part of your household?",
      hint: "Choose the closest fit. We only use compatibility information that is already documented for each kitten.",
      options: [
        ["none","No children","Adults only."],
        ["older","Older children","School-age children or teenagers."],
        ["younger","Young children","Toddlers or younger children."],
        ["mixed","A mix of ages","Both younger and older children."]
      ]
    });
    questions.push({
      id: "pair",
      title: "Would you consider adopting a pair of kittens?",
      hint: "All of our currently adoptable kittens are in bonded pairs.",
      options: [
        ["yes","Yes, I’m looking for a pair","I’m happy to welcome two kittens together."],
        ["single","I prefer one kitten","I’m specifically looking for a single kitten."],
        ["depends","It depends","I’m open to a pair, but I’d like to understand the benefits and what’s involved."]
      ]
    });
    if (state.pair === "depends") {
      questions.push({
        id: "pairConcern",
        title: "What would you like to know more about?",
        hint: "We’ll use this to make the pair-adoption information more helpful.",
        options: [
          ["cost","Adoption costs","I’d like to understand the fee for adopting two."],
          ["space","Space and supplies","I’m not sure whether I have room for two."],
          ["time","Time and care","I want to understand the daily care involved."],
          ["first","I’m new to kitten adoption","I’d like to know whether two kittens are manageable."],
          ["benefits","The benefits","I’m curious about why kittens are often adopted in pairs."]
        ]
      });
    }
    return questions;
  }

  function renderQuestion() {
    currentQuestions = getQuestions();
    if (stepIndex >= currentQuestions.length) {
      renderResults();
      return;
    }
    const question = currentQuestions[stepIndex];
    stepCount.textContent = "Step " + (stepIndex + 1) + " of " + currentQuestions.length;
    progressLabel.textContent = "Your answers help us narrow down the most thoughtful options.";
    progressFill.style.width = Math.round(((stepIndex + 1) / currentQuestions.length) * 100) + "%";
    stepHost.innerHTML = '<h3 class="quiz-question">' + escapeHtml(question.title) + '</h3><p class="quiz-hint">' + escapeHtml(question.hint) + '</p><div class="quiz-options">' +
      question.options.map(([value,label,description]) => '<button class="quiz-option" type="button" data-answer="' + escapeHtml(value) + '" aria-pressed="' + (state[question.id] === value ? "true" : "false") + '"><span class="quiz-option-mark" aria-hidden="true">✓</span><span><strong>' + escapeHtml(label) + '</strong><small>' + escapeHtml(description) + '</small></span></button>').join("") +
      '</div>';
    stepHost.querySelectorAll("[data-answer]").forEach(button => {
      button.addEventListener("click", () => {
        state[question.id] = button.dataset.answer;
        if (!quizStarted) { quizStarted = true; document.dispatchEvent(new CustomEvent("paws:analytics", {detail:{event:"quiz_started", page_path:"/find-your-match/"}})); }
        renderQuestion();
      });
    });
    backButton.disabled = stepIndex === 0;
    nextButton.disabled = !state[question.id];
    nextButton.textContent = stepIndex === currentQuestions.length - 1 ? "See my matches" : "Continue";
    if (quizStarted) document.dispatchEvent(new CustomEvent("paws:analytics", {detail:{event:"quiz_step", page_path:"/find-your-match/", step:question.id}}));
  }

  function getScore(pair) {
    const p = pair.profile;
    let score = 0;
    if (state.energy === p.energy) score += 3;
    else if (state.energy === "any") score += 1;
    else if (state.energy === "mixed" && (p.energy === "high" || p.energy === "calm")) score += 1;
    else if (state.energy === "high" && p.energy === "mixed") score += 1;
    else if (state.energy === "calm" && p.energy === "mixed") score += 1;

    if (state.affection === p.affection) score += 3;
    else if (state.affection === "any") score += 1;
    else if (state.affection === "middle" && p.affection !== "middle") score += 1;
    else if (state.affection === "very" && p.affection === "middle") score += 1;
    else if (state.affection === "independent" && p.affection === "middle") score += 1;

    if (hasCats()) {
      if (p.catFit === "yes") score += 3;
      if (p.catFit === "slow") score -= 3;
      if (state.residentCat === "solo") score -= 5;
      if (state.residentCat === "social" && p.catFit === "yes") score += 1;
      if (state.residentEnergy === "bouncy" && p.energy === "high") score += 1;
      if (state.residentEnergy === "relaxed" && p.energy === "calm") score += 1;
      if (state.residentEnergy === "lap" && p.affection === "middle") score += 1;
      if (state.residentEnergy === "independent" && p.energy === "calm") score += 1;
      if (state.residentEnergy === "mixed" && p.energy === "mixed") score += 1;
      if (state.intro === "quick" && p.catFit === "slow") score -= 5;
    }
    if (hasDogs()) score += p.dogFit === "unknown" ? 0 : -10;
    if (hasCats() && state.residentCat === "solo") {
      resultsHost.innerHTML = noMatchPanel("Your resident cat may prefer to be the only cat.", "Because your current cat prefers being the only cat, we cannot confidently recommend one of our available bonded pairs without a conversation first. Raymond and Wally also prefer to be the only cats, and even the pairs who are comfortable with other cats need gradual introductions. We recommend speaking with the rescue before deciding whether adding two kittens would be right for your household.");
      return;
    }

    if (state.children === "younger" || state.children === "mixed") {
      score += p.kidFit.younger === "yes" ? 2 : p.kidFit.younger === "possible" ? 0 : -8;
    }
    if (state.children === "older") score += p.kidFit.older === "yes" ? 2 : -5;
    if (state.intro === "slow" && p.catFit === "slow") score += 1;
    if (state.intro === "quick" && p.catFit === "slow") score -= 4;
    return score;
  }

  function pairPhoto(kitten) {
    const path = (Array.isArray(kitten.photos) && kitten.photos[0]) || kitten.image || "";
    return path ? '<img src="' + escapeHtml(path) + '" alt="' + escapeHtml(kitten.name) + '" loading="lazy">' : '<div class="photo-placeholder">Photo coming soon</div>';
  }

  function pairCard(pair, cautionOverride = "", reasonOverride = "") {
    const names = pair.kittens.map(k => k.name);
    const photoHtml = pair.kittens.map(pairPhoto).join("");
    const profileLinks = pair.kittens.map(k => '<a href="' + escapeHtml(k.profileUrl || "all-kittens/") + '">Meet ' + escapeHtml(k.name) + '</a>').join("");
    const inquiryKitten = pair.kittens.find(k => k.petfinderUrl);
    const inquiryLinks = inquiryKitten ? '<a class="primary-link" data-kitten-id="' + escapeHtml(inquiryKitten.id) + '" href="' + escapeHtml(inquiryKitten.petfinderUrl) + '" target="_blank" rel="noopener noreferrer">Inquire about this pair</a>' : "";
    return '<article class="quiz-match-card"><div class="quiz-match-photos">' + photoHtml + '</div><div class="quiz-match-body"><p class="quiz-match-kicker">Bonded pair · Must stay together</p><h3>' + escapeHtml(names.join(" & ")) + '</h3><p>' + escapeHtml(pair.profile.summary) + '</p><p class="quiz-match-reason">' + escapeHtml(reasonOverride || pair.profile.reason) + '</p>' +
      (cautionOverride ? '<p class="quiz-match-caution">' + escapeHtml(cautionOverride) + '</p>' : '') +
      '<p>' + escapeHtml(pair.profile.intro) + '</p><div class="quiz-match-links">' + profileLinks + inquiryLinks + '</div></div></article>';
  }

  function pairInfoPanel() {
    const concern = state.pairConcern;
    const detail = {
      cost: "Adoption fees are set by the rescue and can change. Please ask No Paws Left Behind Kitty Rescue for the current fee for a bonded pair before applying.",
      space: "Two kittens need room for separate resources, including litter boxes, food and water stations, resting spots, and places to climb or play. The rescue can help you think through your setup.",
      time: "A pair still needs daily play, attention, veterinary care, and individual bonding with their people. They may also play and interact with each other throughout the day.",
      first: "Adopting two does mean caring for two cats, but a bonded pair already has a familiar companion. You will still want to build a relationship with each kitten individually.",
      benefits: "A bonded pair can play together, groom one another, and have a familiar companion while settling into a new home. They still need daily attention and care from their people; adopting two is not a substitute for interaction."
    }[concern] || "A bonded pair can play together, groom one another, and have a familiar companion while settling into a new home. They still need daily attention and care from their people.";
    return '<section class="quiz-info-panel"><h3>A little about adopting a pair</h3><p>' + escapeHtml(detail) + '</p><p>Right now, all of our currently adoptable kittens are bonded pairs. Bonded pairs must be adopted together, regardless of age. The rescue also requires kittens five months and younger to be adopted in pairs.</p></section>';
  }

  function noMatchPanel(title, message) {
    return '<section class="quiz-no-match"><h3>' + escapeHtml(title) + '</h3><p>' + escapeHtml(message) + '</p><div class="quiz-external-links"><a href="' + RESCUE_PETFINDER + '" target="_blank" rel="noopener noreferrer">See all rescue pets on Petfinder</a><a href="' + RESCUE_SITE + '" target="_blank" rel="noopener noreferrer">Visit the rescue’s adoption page</a></div></section>';
  }

  function renderResults() {
    stepHost.hidden = true;
    document.querySelector("#quiz-controls").hidden = true;
    resultsHost.hidden = false;
    restartWrap.hidden = false;
    progressFill.style.width = "100%";
    stepCount.textContent = "Your results";
    progressLabel.textContent = "Here are the most useful next steps based on your answers.";
    document.dispatchEvent(new CustomEvent("paws:analytics", {detail:{event:"quiz_completed", page_path:"/find-your-match/"}}));

    if (state.pair === "single") {
      resultsHost.innerHTML = pairInfoPanel() + noMatchPanel("Looking for one kitten?", "We completely understand. At the moment, the kittens currently available for adoption are bonded pairs, so we cannot offer one kitten from these pairs on their own. If you are set on adopting a single kitten, we recommend exploring the other cats and kittens available through No Paws Left Behind Kitty Rescue. Their Petfinder page includes the rescue’s wider listings, which may include a single cat who is a better fit for what you are looking for.");
      return;
    }

    if (state.pets === "other") {
      resultsHost.innerHTML = noMatchPanel("Let’s make sure everyone is considered.", "Our current foster profiles do not contain enough documented compatibility information for the other pets in your home. We would rather not guess. Please contact the rescue about the pets in your household before deciding whether one of our foster pairs is a fit.");
      return;
    }

    const pairs = getAvailablePairs();
    if (!pairs.length) {
      resultsHost.innerHTML = noMatchPanel("Our matching list is being updated.", "We could not find a currently available bonded pair to match from the live foster records. Please check the adoptable kitten page or the rescue’s wider listings.");
      return;
    }

    if (hasDogs()) {
      const possible = pairs.find(p => p.key === "diego-valentina");
      resultsHost.innerHTML = noMatchPanel("We don’t have a confirmed dog-household match right now.", "Harvey and Melody, and Raymond and Wally, are not recommended for homes with dogs. Diego and Valentina’s dog compatibility is unknown because they have not had direct experience with dogs. A calm, cat-friendly dog may be a possibility, but we cannot promise compatibility. Please ask the foster team and rescue before moving forward.") + (possible ? pairCard(possible, possible.profile.caution, "This is not a confirmed match. Diego and Valentina are the only pair whose dog compatibility is unknown, so the rescue would need to discuss your dog’s history before you consider applying.") : "");
      return;
    }

    if (state.children === "younger" || state.children === "mixed") {
      const possible = pairs.find(p => p.key === "diego-valentina");
      resultsHost.innerHTML = noMatchPanel("We don’t have a confirmed match for a home with young children.", "Harvey and Melody, and Raymond and Wally, are not recommended for homes with young children. Diego and Valentina may be worth discussing, but their compatibility with younger children has not been directly established. Please ask the foster team and rescue before deciding.") + (possible ? pairCard(possible, "Their profile lists younger-child compatibility as possible, with no direct experience. This is not a confirmed match.", "Diego and Valentina are the only pair whose profiles leave room for a conversation about younger children; please confirm with the rescue before moving forward.") : "");
      return;
    }

    const ranked = pairs.map(pair => ({pair,score:getScore(pair)})).sort((a,b)=>b.score-a.score);
    const best = ranked.filter(item => item.score >= 0);
    if (!best.length) {
      resultsHost.innerHTML = noMatchPanel("We may need to look beyond our current foster pairs.", "Based on your household details, we do not have a pair we can confidently recommend. That does not mean there is no right kitten for you; it means we should not force a match when the profiles do not give us enough confidence. The rescue has other cats and kittens who may be a better fit.");
      return;
    }
    const topScore = best[0].score;
    const selected = best.filter(item => item.score >= topScore - 2).slice(0,2);
    const header = '<div class="quiz-result-intro"><h3>Your potential matches</h3><p>These pairs best line up with the preferences you shared. Read each profile carefully, and reach out to the rescue with any questions about your household before applying.</p></div>';
    resultsHost.innerHTML = header + (state.pair === "depends" ? pairInfoPanel() : "") + '<div class="quiz-match-list">' + selected.map(item => pairCard(item.pair, hasCats() && item.pair.profile.catFit === "slow" ? "This pair prefers to be the only cats in the home. They may adjust to resident cats, but introductions should be especially slow and patient." : "")).join("") + '</div>';
  }

  document.querySelector("#quiz-restart").addEventListener("click", () => {
    Object.keys(state).forEach(key => delete state[key]);
    stepIndex = 0;
    quizStarted = false;
    resultsHost.innerHTML = "";
    resultsHost.hidden = true;
    restartWrap.hidden = true;
    stepHost.hidden = false;
    document.querySelector("#quiz-controls").hidden = false;
    renderQuestion();
  });

  nextButton.addEventListener("click", () => {
    if (nextButton.disabled) return;
    const q = currentQuestions[stepIndex];
    if (!state[q.id]) return;
    if (stepIndex < currentQuestions.length - 1) {
      stepIndex++;
      renderQuestion();
    } else {
      renderResults();
    }
  });
  backButton.addEventListener("click", () => {
    if (stepIndex <= 0) return;
    stepIndex--;
    renderQuestion();
  });
  renderQuestion();
})();