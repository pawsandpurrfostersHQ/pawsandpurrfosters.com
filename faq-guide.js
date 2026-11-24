(() => {
  "use strict";
  const root = document.getElementById("foster-guide");
  if (!root) return;
  const eventData = window.PAWS_EVENT_DATA || {};
  const articles = [
    {id:"supplies",cat:"Bringing a kitten home",q:"What supplies do I need before bringing my kitten home?",aliases:"what should i buy shopping list essentials things to get new cat kitten",body:`
      <p>Preparing a few essentials ahead of time can make your kitten's first days feel much calmer. The right setup can vary with a kitten's age, size, and individual needs.</p>
      <h3>Helpful basics to have ready</h3><ul><li>Kitten-appropriate food and food and water dishes</li><li>A litter box and familiar, kitten-safe litter</li><li>A secure carrier for travel</li><li>Scratching surfaces, toys, and places to rest</li><li>A cozy bed or washable blankets</li><li>A safe room where your kitten can settle in</li></ul>
      <h3>Choosing a litter box</h3><p>For a traditional litter box, we tend to recommend stainless steel. It is durable, nonporous, and easy to clean; it also does not hold odors in the same way scratched plastic can. Choose a size that lets the kitten turn around comfortably and is easy for them to enter.</p>
      <p>Our foster kittens have experience with traditional stainless-steel litter boxes and an automatic litter box. Automatic models can be convenient, but research the exact model carefully. Some designs may pose risks, especially for small kittens. Check the manufacturer's minimum age and weight requirements and safety features before use.</p>
      <p>We currently use the PetPivot 12. That's one option we've had experience with, not a requirement or a guarantee that every automatic box is suitable for every cat.</p>
      <p><em>These are suggestions based on our fostering experience. Your kitten's age, size, and preferences may call for a different setup.</em></p>`},
    {id:"prepare",cat:"Bringing a kitten home",q:"How do I prepare my home for a new kitten?",aliases:"kitten proof house apartment room safe home hazards prepare",body:`
      <p>Before your kitten arrives, take a walk through the spaces they may eventually explore. Secure anything unstable that could be knocked over, put away small objects they could swallow, and keep cleaning products, medications, cords, and other hazards out of reach.</p>
      <h3>Plan for the everyday things</h3><ul><li>Choose a quiet, accessible place for the litter box.</li><li>Set up food and water away from the litter area.</li><li>Provide scratching surfaces, toys, cozy resting spots, and places to climb as your kitten becomes comfortable.</li><li>Check windows, screens, balconies, and doors so there are no easy escape routes.</li><li>Make sure there are places to retreat and places to be near the family.</li></ul>
      <p>You don't need to give a brand-new arrival access to the entire home immediately. Start with a comfortable room, then expand their space as they settle in.</p>
      <p><em>Think of the full-home setup as the next stage, after your kitten has had time to adjust to their starter space.</em></p>`},
    {id:"one-room",cat:"Bringing a kitten home",q:"Should I keep my new kitten in one room at first?",aliases:"single room bathroom spare room office isolate first night",body:`
      <p>We often suggest starting a new kitten in one comfortable room rather than opening the entire home all at once. A bathroom, office, or spare room can work, as long as it is safe, comfortable, and a place people visit regularly.</p>
      <p>A smaller space can help a kitten feel less overwhelmed while they learn the new sounds, smells, and people. Spend calm, positive time with them: offer meals, play gently, sit nearby, and let them approach at their own pace.</p>
      <p>Moving to a new home can be a stressful change. Patience and positive interactions help build trust. When the kitten is eating, using the litter box, exploring, and showing more confidence, you can gradually introduce more of the home.</p>
      <p><em>This is a starting suggestion we've found helpful. The pace can look different for every kitten.</em></p>`},
    {id:"first-days",cat:"Bringing a kitten home",q:"What should I expect during the first few days?",aliases:"first 24 48 hours hiding scared crying not eating adjustment",body:`
      <p>A new home is a big change. A kitten may hide, explore cautiously, vocalize, or need extra quiet time. Give them a predictable safe space with food, water, litter, and a cozy place to rest.</p>
      <p>Keep early interactions gentle and positive. Offer play, meals, and company without forcing contact. Watch that your kitten is eating, drinking, and using the litter box. If they seem unwell, stop eating, or show concerning symptoms, contact a veterinarian promptly.</p>
      <p>Many adopters find the rescue community's <strong>Rule of Three</strong> helpful as a broad adjustment guide: around three days to decompress, three weeks to begin feeling familiar with routines, and three months to feel more settled at home. It is a commonly shared guideline, not a deadline or a promise; each kitten's timeline is individual.</p>`},
    {id:"rule-three",cat:"Bringing a kitten home",q:"What is the Rule of Three when adopting a cat?",aliases:"3 3 3 days weeks months decompress settle routine",body:`
      <p>The Rule of Three is a commonly used rescue guideline that helps adopters think about the adjustment period:</p><ul><li><strong>About 3 days:</strong> a new cat may be decompressing and feeling less overwhelmed.</li><li><strong>About 3 weeks:</strong> they may be learning the household's routines and becoming more comfortable.</li><li><strong>About 3 months:</strong> they may feel increasingly secure and at home.</li></ul>
      <p>It is a general way to set expectations, not a strict schedule. Some kittens settle quickly; others need more time. Continue offering a safe space, consistency, and positive interactions.</p>`},
    {id:"bonded",cat:"Bonded pairs & kitten socialization",q:"Why is adopting a bonded pair a good idea?",aliases:"two kittens benefits adopt together companion siblings friends",body:`
      <p>Adopting a bonded pair can be a wonderful way to welcome kittens into a home. They already know one another, and having a familiar companion can make the transition less lonely and give them a playmate as they grow.</p>
      <ul><li>They can play and burn energy together.</li><li>They have a familiar companion while learning a new home.</li><li>They can practice feline communication and social play with one another.</li><li>They can share many enrichment items, such as toys, beds, scratching posts, and cat trees.</li><li>Welcoming two kittens gives two lives a safe home and creates room in rescue for other animals who need help — twice the rescue impact.</li></ul>
      <p>Two kittens still need individual attention, appropriate food, veterinary care, and resources. But many household items can be shared, and buying larger packages of supplies may offer better value. The total cost is not automatically twice the cost of one kitten.</p>
      <p><em>We often find that a well-matched pair can be a lovely option, including for first-time cat families. The right choice depends on your household and the kittens' needs.</em></p>`},
    {id:"single-kitten",cat:"Bonded pairs & kitten socialization",q:"What is single kitten syndrome?",aliases:"single kitten alone behavior play biting socialization lonely",body:`
      <p>“Single kitten syndrome” is an informal term often used in rescue and cat-care conversations to describe challenges that can arise when a young kitten grows up without another suitable feline playmate. Kittens are social learners, and play with another kitten can help them practice communication, boundaries, and appropriate play.</p>
      <p>A human family can provide lots of love and enrichment, but it cannot always replicate kitten-to-kitten play. A companion can also offer company when people are busy or away.</p>
      <p>This does not mean every kitten adopted alone will develop behavior problems. Individual temperament, age, social history, enrichment, and the household all matter. We encourage adopters to consider the kitten's profile and the rescue's pairing guidance.</p>`},
    {id:"pair-policy",cat:"Bonded pairs & kitten socialization",q:"Why does the rescue keep bonded pairs together and require young kittens to be adopted in pairs?",aliases:"cannot separate split pair under five months five months policy",body:`
      <p>Some kittens have formed a particularly close bond and are required to go home together. Separating an established bonded pair would mean taking away a familiar companion and relationship that matters to them.</p>
      <p>No Paws Left Behind Kitty Rescue generally requires kittens five months old and younger to be adopted in pairs. The goal is to support their social needs while they are young. There can be individual circumstances and profile-specific pairing notes, so please read each kitten's profile carefully.</p>
      <p>Our role as foster parents is to get to know the kittens and help explain their personalities and relationships. The rescue sets and confirms adoption requirements.</p>`},
    {id:"pair-cost",cat:"Bonded pairs & kitten socialization",q:"Does adopting two kittens cost twice as much?",aliases:"cost expense budget food litter supplies toys double",body:`
      <p>Not necessarily. Some costs are individual, but many of the things you buy to make a home welcoming can be shared: toys, beds, scratching posts, cat trees, tunnels, and other enrichment items. Depending on size and safety, some carriers may also work for more than one cat.</p>
      <p>Buying food and litter in larger packages may reduce the cost per unit. Cats may share litter areas, although a commonly recommended setup is one litter box per cat plus one extra, if space allows.</p>
      <p>Each kitten still needs their own food portions and veterinary care. Adoption fees are set by the rescue, and pair promotions or discounts may vary. For current fees, check the rescue's adoption information.</p>
      <p>The encouraging part is that two kittens do not automatically mean twice the overall setup cost — and they can share many of the things that make a home fun and comfortable.</p>`},
    {id:"full-time",cat:"Bonded pairs & kitten socialization",q:"Can I adopt kittens if I work full-time?",aliases:"away at work all day leave home alone schedule",body:`
      <p>Many people who work full-time provide wonderful homes for cats. The important part is planning for the kitten's age, personality, companionship, and daily needs.</p>
      <p>A pair can offer one another play and company while their people are away, but they still need daily interaction, play, care, and a safe environment. Young kittens may need more frequent meals and closer supervision than older kittens.</p>
      <p>When considering a particular kitten, read their profile and talk with the foster team about their routine and needs. We can help you think through whether your schedule is a good match.</p>`},
    {id:"bond-human",cat:"Bonded pairs & kitten socialization",q:"Will two kittens still bond with me?",aliases:"will they love me prefer each other human connection",body:`
      <p>Absolutely, kittens can form strong, affectionate relationships with their people while also enjoying one another's company. A feline companion does not replace the bond you build through feeding, play, gentle handling, and spending time together.</p>
      <p>Each kitten has their own personality. Some seek laps and cuddles, while others show affection by following you, playing nearby, or choosing to rest in the same room.</p>`},
    {id:"cat-intro",cat:"Introducing other pets",q:"How do I introduce a new kitten to my resident cat?",aliases:"older cat hates kitten hissing growling scent swap swapping beds",body:`
      <p>Introductions are usually best handled gradually. Based on our fostering experience, scent swapping can be a helpful early step: exchange a blanket or bed each cat has used so they can become familiar with one another's scent before meeting face-to-face.</p>
      <h3>A gradual starting approach</h3><ol><li>Begin with the new kitten in a comfortable separate room, with their own essentials.</li><li>Swap familiar bedding or soft items and let each cat investigate at their own pace.</li><li>Continue positive experiences around the closed door. Some adopters begin feeding on opposite sides of the door when both cats are comfortable.</li><li>When both cats seem ready, try brief, controlled visual introductions, then gradually increase time together.</li><li>Keep sessions calm and positive with treats or play, and give both cats a way to retreat.</li></ol>
      <p>Hissing or a little growling can be communication that something is unfamiliar. Watch the whole body language and overall intensity. If either cat becomes highly distressed, fixates, chases, or attempts to attack, calmly end the session and return to an easier step. Do not force contact.</p>
      <p>There are many good introduction guides and videos available, and a veterinarian or qualified behavior professional can help with difficult introductions. The pace should be based on the cats, not a fixed calendar. Always aim to finish a session calmly and positively.</p>
      <p><em>This is one approach we've found useful, not a one-size-fits-all formula.</em></p>`},
    {id:"dog-intro",cat:"Introducing other pets",q:"Can kittens live with dogs?",aliases:"introduce puppy dog cat friendly dogs",body:`
      <p>Some cats and dogs learn to live together comfortably, but compatibility depends on both animals. A calm, cat-aware dog with manageable behavior may be a better starting point than a dog who chases or fixates on small animals.</p>
      <p>Introductions should be gradual, supervised, and managed with secure separation at first. Give the kitten escape routes and elevated safe places, and never leave a new kitten alone with a dog until you have established a safe relationship.</p>
      <p>Our foster kittens' experience with dogs varies. Please read each kitten's profile and ask us about that kitten rather than assuming all of our fosters have the same experience.</p>`},
    {id:"other-animals",cat:"Introducing other pets",q:"Can kittens live with rabbits, birds, or other small animals?",aliases:"bird bunny rabbit guinea pig hamster reptiles prey",body:`
      <p>Paws &amp; Purr Fosters does not have direct foster experience with our kittens living alongside rabbits, birds, or other small animals, so we cannot predict how a particular kitten would react.</p>
      <p>We do know that kittens can be very interested in movement. Because of that, we cannot promise that an introduction would be safe, and we do not recommend allowing direct interaction based on assumptions about a kitten's personality.</p>
      <p>Please research the needs and safety guidance for both species and speak with an experienced veterinarian or qualified professional. Secure separation may be necessary. If you have another type of pet, tell us so we can discuss what is known about the specific kitten.</p>`},
    {id:"behavior-bite",cat:"Understanding kitten behavior",q:"Why does my kitten bite my hands or feet?",aliases:"biting scratching attack play aggression",body:`
      <p>Kittens explore and practice hunting-style play with their mouths and paws. Hands and feet can accidentally become exciting moving targets, especially if people have played with them that way.</p>
      <p>Try redirecting play to wand toys, soft toys, or other appropriate items. Pause interaction when teeth or claws touch skin, then resume with a toy when the kitten is calm. Consistent, gentle redirection can help teach what is appropriate to bite and chase.</p>
      <p>If biting is sudden, severe, or seems connected to pain or fear, check with a veterinarian.</p>`},
    {id:"behavior-night",cat:"Understanding kitten behavior",q:"Why does my kitten run around at night?",aliases:"zoomies midnight active sleeping nighttime",body:`
      <p>Many kittens have bursts of energy and are naturally active around dawn and dusk. Play sessions, climbing opportunities, and enrichment during the day can help them use that energy.</p>
      <p>A play session followed by a meal before your bedtime may help establish a calmer routine. Kittens still need plenty of sleep, so provide a comfortable place to rest.</p>`},
    {id:"behavior-hide",cat:"Understanding kitten behavior",q:"Why is my new kitten hiding?",aliases:"scared shy under bed won't come out",body:`
      <p>Hiding is a common response to a new or overwhelming environment. Give your kitten a safe hiding place, keep the room calm, and spend quiet time nearby without reaching in or pulling them out.</p>
      <p>Offer food, treats, and gentle play when they are ready. Let them choose when to approach. If your kitten is not eating, seems ill, or remains unusually withdrawn, contact a veterinarian for advice.</p>`},
    {id:"health-vax",cat:"Health & everyday care",q:"What vaccinations do kittens need?",aliases:"FVRCP shots vaccine rabies vaccine schedule",body:`
      <p>One of the core kitten vaccines is <strong>FVRCP</strong>, which protects against feline viral rhinotracheitis (herpesvirus), calicivirus, and panleukopenia. Kittens typically receive a series of doses while they are growing; the exact schedule is set by the veterinarian based on age and vaccine history.</p>
      <p>Rabies vaccination is also commonly recommended. Timing and recommendations can depend on age, health, lifestyle, exposure, travel plans, and applicable local requirements. Cats who have access to outdoor areas or contact with animals who go outdoors may have different exposure considerations. Travel providers and destinations may also require current rabies vaccination documentation.</p>
      <p>In our foster program, kittens receive the vaccinations and preventive care arranged through No Paws Left Behind Kitty Rescue. Many kittens are still too young for some later vaccinations before adoption. Their take-home medical records show what they have received, and the adopter's veterinarian can advise on the next due dates.</p>
      <p>We recommend bringing the kitten's vaccine paperwork to their first veterinary appointment so the clinic can continue the schedule. Ask the rescue or veterinarian about any questions specific to your kitten.</p>`},
    {id:"health-care",cat:"Health & everyday care",q:"What veterinary care do your foster kittens receive?",aliases:"medical vet spay neuter microchip deworm flea treatment health",body:`
      <p>Our kittens are fostered through <strong>No Paws Left Behind Kitty Rescue</strong>. While they are in the rescue's care, the rescue coordinates their preventive and veterinary care.</p>
      <p>As part of their care, kittens receive age-appropriate vaccinations, deworming, regular flea treatment, and a microchip. They are spayed or neutered once they reach an appropriate, safe weight and are cleared for the procedure.</p>
      <p>What has been completed for an individual kitten is recorded in their medical paperwork. At adoption, review the take-home folder and share those records with your veterinarian so any remaining boosters or follow-up care can be scheduled.</p>`},
    {id:"vet-visits",cat:"Health & everyday care",q:"How often should my cat visit the veterinarian?",aliases:"annual yearly checkup vet appointment wellness",body:`
      <p>Many healthy adult cats have a wellness visit at least once a year, while kittens need more frequent visits during their vaccination and growth period. Senior cats or cats with ongoing health needs may benefit from more frequent checkups.</p>
      <p>Your veterinarian can recommend a schedule based on your cat's age, medical history, lifestyle, and vaccine needs. Keep vaccine records and ask the clinic when the next visit is due.</p>`},
    {id:"nails",cat:"Health & everyday care",q:"How do I trim my kitten's nails?",aliases:"claw clipping scratching nail trim",body:`
      <p>Start slowly and make paw handling a positive experience. When your kitten is relaxed, gently touch a paw, offer a treat, and gradually get them comfortable with the clippers. Trim only the sharp transparent tip and avoid the pink quick inside the nail.</p>
      <p>If you're unsure, ask your veterinarian or a trained groomer to demonstrate. Some kittens need more time to become comfortable with nail trims, and that's okay.</p>`},
    {id:"adoption-guide",cat:"Adoption & meeting our kittens",q:"Do your adopted kittens come with a cat-care guide?",aliases:"first time owner beginner guide booklet folder new cat",body:`
      <p>Yes. Our take-home folder includes a kitten-care guide designed with first-time cat owners in mind. It is there to help you feel more prepared as you learn your new companion's routines and needs.</p>
      <p>The folder also includes available medical and adoption paperwork. We want adopters to have useful information to refer back to after their kitten comes home.</p>`},
    {id:"work",cat:"Adoption & meeting our kittens",q:"Can I adopt if I've never had a cat before?",aliases:"first time cat owner beginner new pet",body:`
      <p>Yes! Being new to cat ownership does not mean you cannot become a wonderful cat parent. It helps to prepare your home, learn the basics, and ask questions before and after adoption.</p>
      <p>Our adopted kittens go home with a cat-care guide intended especially for people who have never had a cat before. We also encourage you to read the kitten's profile, ask us about their personality and routine, and plan a first veterinary visit.</p>
      <p>For young kittens, a suitable companion can be especially helpful. We often suggest considering a pair, while keeping the individual kitten's needs and your household in mind.</p>`},
    {id:"meet",cat:"Adoption & meeting our kittens",q:"How can I meet your foster kittens?",aliases:"meet and greet visit appointment where see kittens",body:`
      <p>Visit our Events page for confirmed adoption events and meeting information. Which kittens attend can vary, so please check the event details and the kittens' profiles.</p>
      <p>If no event is currently scheduled, a private meet-and-greet may be possible by arrangement. Please follow the instructions on our Events page and the How to Adopt page. Adoption applications and approvals are handled by No Paws Left Behind Kitty Rescue; we are the foster team who can tell you about the kittens in our care.</p>`},
    {id:"events",cat:"Adoption & meeting our kittens",q:"When and where are your upcoming adoption events?",aliases:"event schedule weekend location petsmart pittsburg antioch",body:`
      <p>Our event schedule can change, and special events or scheduling conflicts may occasionally affect a regular weekend. We post confirmed updates as soon as we know about them.</p>
      <p>For the latest confirmed dates, times, locations, and which kittens may attend, visit the <a href="events/">Events &amp; Adoption Locations</a> page. Please check that page before traveling rather than relying on a past schedule.</p>`},
    {id:"process",cat:"Adoption & meeting our kittens",q:"Who handles the adoption application and approval?",aliases:"application rescue contract fee adoption process",body:`
      <p>Paws &amp; Purr Fosters is a foster team working with <strong>No Paws Left Behind Kitty Rescue</strong>. We provide a safe foster home, get to know each kitten, and help people understand their personalities and needs.</p>
      <p>The rescue handles adoption applications, application review and approval, contracts, adoption fees, and finalizing adoptions. Visit our <a href="how-to-adopt/">How to Adopt</a> page for the steps and links.</p>`},
    {id:"profiles",cat:"Adoption & meeting our kittens",q:"How can I learn more about each foster kitten?",aliases:"personality profile available kittens current fosters photos",body:`
      <p>Visit <a href="all-kittens/">Our Current Fosters</a> to explore the kittens in our care and their individual profiles. We update profiles with the information we've learned while fostering them, including personality, preferences, and known compatibility details.</p>
      <p>Each kitten is an individual, and our observations reflect what we've seen in their foster environment. If you have a question that isn't covered in a profile, you're welcome to contact us.</p>`}
  ];

  const categories = ["All topics", ...new Set(articles.map(a => a.cat))];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const norm = s => s.toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
  const words = s => norm(s).split(/\s+/).filter(Boolean);
  function score(a, query) {
    const q = norm(query), tokens = words(query);
    if (!q) return 0;
    const title = norm(a.q), alias = norm(a.aliases), hay = title+" "+alias+" "+norm(a.cat);
    let n = 0;
    if (title.includes(q)) n += 18;
    if (alias.includes(q)) n += 14;
    for (const t of tokens) {
      if (title.split(" ").includes(t)) n += 5;
      else if (hay.includes(t)) n += 2;
    }
    const overlap = tokens.filter(t => hay.includes(t)).length;
    n += overlap / Math.max(tokens.length,1) * 8;
    return n;
  }
  root.innerHTML = `
    <section class="guide-search-panel" aria-labelledby="guide-search-title">
      <p class="eyebrow">Paws &amp; Purr Fosters · Learning center</p>
      <h2 id="guide-search-title">What would you like to know?</h2>
      <p>Type a question in your own words. We'll suggest the closest topic from our collection of foster-informed guides. This search matches questions to existing articles; it does not generate custom answers.</p>
      <form class="guide-search" role="search">
        <label class="sr-only" for="guide-search-input">Search kitten-care questions</label>
        <input id="guide-search-input" type="search" placeholder="For example: What do I need before bringing home a kitten?" autocomplete="off">
        <button class="button primary" type="submit">Find an answer</button>
      </form>
      <div id="guide-results" class="guide-results" aria-live="polite"></div>
    </section>
    <section class="guide-browse">
      <div class="guide-section-heading"><p class="eyebrow">Explore the guide</p><h2>Browse by topic</h2><p>Choose a section to explore helpful information, suggestions, and things we've learned while fostering.</p></div>
      <div class="guide-category-grid" id="guide-categories"></div>
      <article class="guide-article" id="guide-article" hidden aria-live="polite"></article>
    </section>
    <section class="guide-event-note" id="guide-event-note"></section>
  `;
  const input = root.querySelector("#guide-search-input");
  const results = root.querySelector("#guide-results");
  const articleBox = root.querySelector("#guide-article");
  const categoryBox = root.querySelector("#guide-categories");
  function showArticle(a) {
    articleBox.hidden = false;
    articleBox.innerHTML = `<button class="guide-back" type="button">← Back to topics</button><p class="eyebrow">${esc(a.cat)}</p><h2>${esc(a.q)}</h2><div class="guide-article-copy">${a.body}</div><p class="guide-perspective">These articles share suggestions from our foster experience and commonly used cat-care practices. Every kitten and household is different, so take what is useful, consider your own pet's needs, and ask a veterinarian or the rescue when you need advice specific to your situation.</p>`;
    articleBox.querySelector(".guide-back").addEventListener("click", () => {articleBox.hidden=true; articleBox.innerHTML="";});
    articleBox.scrollIntoView({behavior:"smooth",block:"start"});
  }
  function showResults(query) {
    const matches = articles.map(a=>({a,s:score(a,query)})).filter(x=>x.s>0).sort((x,y)=>y.s-x.s).slice(0,4);
    if (!matches.length) {
      results.innerHTML = `<p class="guide-no-results">We couldn't find a close match yet. Try a different phrase or browse the topics below. You can also <a href="mailto:pawsandpurrsfosters@gmail.com">send us your question</a>.</p>`;
      return;
    }
    results.innerHTML = `<p class="guide-results-label">Here are a few topics that may help:</p>`+matches.map((m,i)=>`<button type="button" class="guide-result ${i===0?"guide-result-best":""}" data-id="${m.a.id}"><span><strong>${esc(m.a.q)}</strong><small>${esc(m.a.cat)}</small></span><span aria-hidden="true">›</span></button>`).join("");
    results.querySelectorAll("[data-id]").forEach(b=>b.addEventListener("click",()=>showArticle(articles.find(a=>a.id===b.dataset.id))));
  }
  root.querySelector(".guide-search").addEventListener("submit",e=>{e.preventDefault();showResults(input.value);});
  input.addEventListener("input",()=>{if(input.value.trim().length>=3)showResults(input.value);else results.innerHTML="";});
  function showCategory(cat) {
    const list = cat==="All topics" ? articles : articles.filter(a=>a.cat===cat);
    categoryBox.innerHTML = list.map(a=>`<button type="button" class="guide-topic" data-id="${a.id}"><span>${esc(a.q)}</span><span aria-hidden="true">›</span></button>`).join("");
    categoryBox.querySelectorAll("[data-id]").forEach(b=>b.addEventListener("click",()=>showArticle(articles.find(a=>a.id===b.dataset.id))));
  }
  categories.forEach((cat,i)=>{
    const b=document.createElement("button"); b.type="button"; b.className="guide-category"+(i===0?" is-active":""); b.textContent=cat;
    b.addEventListener("click",()=>{root.querySelectorAll(".guide-category").forEach(x=>x.classList.remove("is-active"));b.classList.add("is-active");showCategory(cat);});
    root.querySelector("#guide-categories").append(b);
  });
  showCategory("All topics");
  const feature=eventData.featuredEvent||{};
  const eventBox=root.querySelector("#guide-event-note");
  const date=feature.dateISO ? new Date(feature.dateISO+"T23:59:59") : null;
  const hasUpcoming=feature.active!==false && feature.status!=="wrapped" && date && date.getTime()>=Date.now() && feature.title && feature.location;
  if(hasUpcoming){
    eventBox.innerHTML=`<p class="eyebrow">Upcoming adoption event</p><h2>${esc(feature.title)}</h2><p><strong>${esc(feature.date||"")}</strong> · ${esc(feature.time||"")}</p><p>${esc(feature.location)}${feature.address?" · "+esc(feature.address):""}</p><p>Event details can change. Please check the <a href="events/">Events page</a> before heading out.</p>`;
  } else {
    eventBox.innerHTML=`<p class="eyebrow">Adoption events</p><h2>No upcoming event is currently listed here.</h2><p>Our schedule can change, and additional events or schedule adjustments may come up. We'll post confirmed information as soon as we know. Check the <a href="events/">Events &amp; Adoption Locations</a> page for the latest updates and regular schedule.</p>`;
  }
})();