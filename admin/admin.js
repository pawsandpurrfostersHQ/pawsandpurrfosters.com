/* Editor prototype: changes remain in this browser session until secure publishing is installed. */
(() => {
  const $ = s => document.querySelector(s);
  const clone = value => JSON.parse(JSON.stringify(value));
  const draft = {
    kittens: clone(window.PAWS_KITTENS || []),
    events: clone(window.PAWS_EVENT_DATA || {}),
    alumni: clone(window.PAWS_FOSTER_ALUMNI || []),
    heroPhotos: [...(window.FOSTER_CAROUSEL_PHOTOS || [])]
  };
  let selectedId = null, dirty = false;
  const authConfig = window.PAWS_SUPABASE_CONFIG || {};
  const supabaseReady = !!(window.supabase && authConfig.url && authConfig.publishableKey &&
    !String(authConfig.url).includes("YOUR_") && !String(authConfig.publishableKey).includes("YOUR_"));
  const supabaseClient = supabaseReady
    ? window.supabase.createClient(authConfig.url, authConfig.publishableKey)
    : null;
  const ADMIN_USERNAME = "pawsandpurrfosters";
  const ADMIN_EMAIL = "pawsandpurrfosters@gmail.com";
  async function restoreSession() {
    if (!supabaseClient) return;
    const { data, error } = await supabaseClient.auth.getSession();
    if (error) return;
    if (data.session && data.session.user?.email?.toLowerCase() === ADMIN_EMAIL) {
      $("#login").hidden = true;
      $("#dashboard").hidden = false;
    } else if (data.session) {
      await supabaseClient.auth.signOut();
    }
  }
  $("#login-form")?.addEventListener("submit", async event => {
    event.preventDefault();
    const username = $("#login-username").value.trim().toLowerCase();
    const password = $("#login-password").value;
    const message = $("#login-message");
    if (!supabaseClient) {
      message.textContent = "Supabase connection is not configured yet. The editor remains locked.";
      return;
    }
    if (username !== ADMIN_USERNAME) {
      message.textContent = "That username is not authorized.";
      return;
    }
    $("#sign-in").disabled = true;
    message.textContent = "Signing in securely…";
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email: ADMIN_EMAIL, password });
      if (error) throw error;
      if (data.user?.email?.toLowerCase() !== ADMIN_EMAIL) {
        await supabaseClient.auth.signOut();
        throw new Error("This account is not authorized for the private editor.");
      }
      $("#login").hidden = true;
      $("#dashboard").hidden = false;
      message.textContent = "";
      $("#login-password").value = "";
    } catch (error) {
      message.textContent = error.message || "Sign-in failed. Please check your details.";
    } finally {
      $("#sign-in").disabled = false;
    }
  });
  const esc = value => String(value ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  let markDirty = () => { dirty=true; $("#save-status").textContent="You have unpublished draft changes in this session."; };
  $("#sign-out").addEventListener("click",async()=>{
    if (supabaseClient) await supabaseClient.auth.signOut();
    $("#dashboard").hidden=true; $("#login").hidden=false;
  });
  restoreSession();
  document.querySelectorAll(".tab").forEach(tab=>tab.addEventListener("click",()=>{
    document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===tab));
    document.querySelectorAll(".view").forEach(x=>x.hidden=x.id!=="view-"+tab.dataset.view);
  }));
  function renderKittenList(){
    $("#kitten-list").innerHTML=draft.kittens.map(k=>`<button class="record" data-kitten="${esc(k.id)}"><img src="../${esc(k.image)}" alt=""><span><strong>${esc(k.name)}</strong><small>${esc(k.status||k.adoptionStatus||"")}</small></span></button>`).join("");
    document.querySelectorAll("[data-kitten]").forEach(b=>b.addEventListener("click",()=>editKitten(b.dataset.kitten)));
  }
  function editKitten(id){
    selectedId=id; const k=draft.kittens.find(x=>x.id===id); if(!k)return;
    $("#kitten-editor")?.remove();
    const form=document.createElement("section");form.id="kitten-editor";form.className="editor-form";
    const fields=[["name","Name"],["birthday","Birthday","date"],["gender","Gender"],["litterNumber","Foster litter number","number"],["description","Card description"],["bio","Bio","textarea"],["idealHome","Ideal home","textarea"],["petfinderUrl","Petfinder link"],["status","Adoption status"]];
    form.innerHTML=`<div class="form-heading"><div><p class="eyebrow">Editing profile</p><h3>${esc(k.name)}</h3></div><button type="button" class="quiet" id="close-kitten">Close</button></div><div class="fields">${fields.map(([key,label,type])=>`<label>${label}${type==="textarea"?`<textarea data-field="${key}" rows="5">${esc(k[key])}</textarea>`:`<input data-field="${key}" type="${type||"text"}" value="${esc(k[key])}">`}</label>`).join("")}<label>Dogs<select data-compat="dogs">${options(["Unknown — no direct experience","Yes","Yes — with proper introduction","No","Possibly — no direct experience"],k.compatibility?.dogs)}</select></label><label>Cats<select data-compat="cats">${options(["Unknown — no direct experience","Yes","Yes — with proper introduction","No","Prefers to be the only cat"],k.compatibility?.cats)}</select></label><label>Younger children<select data-compat="youngerChildren">${options(["Unknown — no direct experience","Yes","Possibly — no direct experience","No"],k.compatibility?.youngerChildren)}</select></label><label>Older children<select data-compat="olderChildren">${options(["Unknown — no direct experience","Yes","Possibly — no direct experience","No"],k.compatibility?.olderChildren)}</select></label></div><h4>Profile photo gallery</h4><p class="muted">Add photos from your device. They will be saved to the private draft branch when you publish.</p><div id="profile-photos"></div><label class="upload-label">Choose additional photos<input id="profile-upload" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple></label><button type="button" class="primary" id="save-kitten-draft">Save profile draft</button>`;
    $("#view-kittens").append(form);
    $("#close-kitten").onclick=()=>form.remove();
    form.querySelectorAll("[data-field]").forEach(input=>input.addEventListener("input",()=>{k[input.dataset.field]=input.type==="number"?Number(input.value):input.value;}));
    form.querySelectorAll("[data-compat]").forEach(input=>input.addEventListener("change",()=>{k.compatibility ||= {};k.compatibility[input.dataset.compat]=input.value;}));
    const renderPhotos=()=>{$("#profile-photos").innerHTML=(k.photos||[]).map((p,i)=>`<div class="photo-row"><img src="${p.startsWith("blob:")?esc(p):"../"+esc(p)}" alt=""><span>${esc(p.split("/").pop())}</span><button type="button" data-up="${i}" ${i===0?"disabled":""}>↑</button><button type="button" data-down="${i}" ${i===k.photos.length-1?"disabled":""}>↓</button><button type="button" data-remove="${i}">Remove</button></div>`).join("");form.querySelectorAll("[data-up]").forEach(b=>b.onclick=()=>move(Number(b.dataset.up),-1));form.querySelectorAll("[data-down]").forEach(b=>b.onclick=()=>move(Number(b.dataset.down),1));form.querySelectorAll("[data-remove]").forEach(b=>b.onclick=()=>{const removed=k.photos.splice(Number(b.dataset.remove),1)[0];if(removed?.startsWith("blob:")){URL.revokeObjectURL(removed);pendingPhotoUploads.delete(removed);}renderPhotos();markDirty();});};
    function move(i,d){[k.photos[i],k.photos[i+d]]=[k.photos[i+d],k.photos[i]];renderPhotos();}
    renderPhotos();
    $("#profile-upload").onchange=e=>{const files=[...e.target.files];for(const file of files){if(!["image/jpeg","image/png","image/webp","image/gif"].includes(file.type)){alert("Please choose a JPG, PNG, WEBP, or GIF image.");continue;}if(file.size>20*1024*1024){alert("Please choose a photo smaller than 20 MB.");continue;}const local=URL.createObjectURL(file);pendingPhotoUploads.set(local,{file,kittenId:String(k.id||"kitten")});k.photos.push(local);}renderPhotos();markDirty();e.target.value="";};
    $("#save-kitten-draft").onclick=()=>{markDirty();renderKittenList();$("#save-status").textContent=k.name+" profile draft saved in this session. Not published.";};
  }
  function options(values,current){return values.map(v=>`<option ${v===current?"selected":""}>${esc(v)}</option>`).join("");}
  function renderEvents(){
    const e=draft.events,f=e.featuredEvent||{},s=e.specialEvent||{};
    $("#event-summary").innerHTML=`<div class="editor-form"><h3>Featured event</h3>${eventFields("featured",f)}<h3>Special event</h3>${eventFields("special",s)}<h3>Regular schedule</h3><p class="muted">Current locations: ${(e.regularSchedule?.locations||[]).map(x=>esc(x.name)).join(", ")}</p><button class="primary" id="save-events">Save event draft</button></div>`;
    document.querySelectorAll("[data-event]").forEach(input=>input.addEventListener("input",()=>{const [group,key]=input.dataset.event.split(":");e[group==="featured"?"featuredEvent":"specialEvent"][key]=input.value;}));
    $("#save-events").onclick=()=>{markDirty();$("#save-status").textContent="Event drafts saved in this session. Not published.";};
  }
  function eventFields(group,obj){return ["title","location","date","time","address","mapsUrl","description"].map(key=>`<label>${key==="mapsUrl"?"Map link":key[0].toUpperCase()+key.slice(1)}<input data-event="${group}:${key}" value="${esc(obj[key]||"")}"></label>`).join("");}
  function renderPhotos(){$("#hero-photo-list").innerHTML=draft.heroPhotos.map((p,i)=>`<div class="photo-row"><span>${i+1}. ${esc(p)}</span><button data-hero-up="${i}" ${i===0?"disabled":""}>↑</button><button data-hero-down="${i}" ${i===draft.heroPhotos.length-1?"disabled":""}>↓</button><button data-hero-remove="${i}">Remove</button></div>`).join("")||"<p>No homepage photos are configured.</p>";document.querySelectorAll("[data-hero-up]").forEach(b=>b.onclick=()=>heroMove(+b.dataset.heroUp,-1));document.querySelectorAll("[data-hero-down]").forEach(b=>b.onclick=()=>heroMove(+b.dataset.heroDown,1));document.querySelectorAll("[data-hero-remove]").forEach(b=>b.onclick=()=>{draft.heroPhotos.splice(+b.dataset.heroRemove,1);renderPhotos();markDirty();});}
  function heroMove(i,d){[draft.heroPhotos[i],draft.heroPhotos[i+d]]=[draft.heroPhotos[i+d],draft.heroPhotos[i]];renderPhotos();markDirty();}
  function renderAlumni(){
    $("#alumni-summary").innerHTML=`<div class="summary-item"><strong>${draft.alumni.length}</strong> existing alumni records.</div><div class="summary-item"><label>Prepare an alumni entry from a current foster<select id="alumni-kitten">${draft.kittens.map(k=>`<option value="${esc(k.id)}">${esc(k.name)}</option>`).join("")}</select></label><label>Gotcha date<input type="date" id="gotcha-date"></label><label>Adopted with<input id="adopted-with" placeholder="Name (if applicable)"></label><button id="prepare-alumni" class="secondary" type="button">Prepare alumni preview</button><div id="alumni-prepared"></div></div>`;
    $("#prepare-alumni").onclick=()=>{
      const k=draft.kittens.find(x=>x.id===$("#alumni-kitten").value);
      if(!k)return;
      const partner=k.pairing?.type==="bonded"?draft.kittens.find(x=>x.id===k.pairing.kittenId):null;
      const gotcha=$("#gotcha-date").value;
      const adoptedWith=$("#adopted-with").value.trim();
      $("#alumni-prepared").innerHTML=`<p><strong>${esc(k.name)}</strong>${partner?" and <strong>"+esc(partner.name)+"</strong> are marked as a bonded pair.":""}</p><p>Birthday: ${esc(k.birthday)} · Gender: ${esc(k.gender)} · Litter: ${esc(k.litterNumber)}</p><p>Gotcha date: ${esc(gotcha||"Not entered")}</p><p>Adopted with: ${esc(adoptedWith||partner?.name||"Not entered")}</p>${partner?`<label class="confirm-pair"><input id="confirm-bonded-pair" type="checkbox"> I confirm both ${esc(k.name)} and ${esc(partner.name)} were adopted together.</label>`:""}<p class="muted">Preview only. No kitten status or alumni records have been changed.</p>`;
    };
  }
  $("#preview").onclick=()=>{const changed=draft.kittens.filter((k,i)=>JSON.stringify(k)!==JSON.stringify(window.PAWS_KITTENS[i]));$("#preview-content").innerHTML=`<p><strong>Draft preview</strong> — nothing has been published.</p><h3>Kitten profiles (${draft.kittens.length})</h3><ul>${draft.kittens.map(k=>`<li>${esc(k.name)} — ${esc(k.status)} · ${(k.photos||[]).length} gallery photos</li>`).join("")}</ul><h3>Homepage photos</h3><p>${draft.heroPhotos.length} photos in the draft carousel.</p><h3>Events</h3><p>${esc(draft.events.featuredEvent?.location)} — ${esc(draft.events.featuredEvent?.date)}</p><p>${esc(draft.events.specialEvent?.title)} — ${esc(draft.events.specialEvent?.date)}</p><h3>Alumni</h3><p>${draft.alumni.length} existing alumni records. New adoption entries are preview-only at this stage.</p><p>${changed.length} kitten profile(s) differ from the loaded site data.</p>`;$("#preview-dialog").showModal();};
  $("#close-preview").onclick=()=>$("#preview-dialog").close();
  const publishButton = $("#publish");
  publishButton.disabled = true;

  function replaceAssignedArray(source, assignment, value) {
    const start = source.indexOf(assignment);
    const end = source.indexOf("];", start);
    if (start < 0 || end < 0) throw new Error("Could not prepare " + assignment + " for saving.");
    return source.slice(0, start) + assignment + " = " + JSON.stringify(value, null, 2) + ";" + source.slice(end + 2);
  }

  const pendingPhotoUploads = new Map();

  async function photoToBase64(file) {
    const dataUrl = await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error("Could not read one of the selected photos."));reader.readAsDataURL(file);});
    return String(dataUrl).split(",")[1] || "";
  }

  async function preparePhoto(file) {
    if (!window.createImageBitmap) {
      if (file.size > 3 * 1024 * 1024) throw new Error("This photo is too large for a reliable upload. Please choose a smaller image (under 3 MB).");
      return { file, contentType:file.type };
    }
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    const blob = await new Promise(resolve=>canvas.toBlob(resolve,"image/jpeg",0.78));
    if (!blob || blob.size > 4 * 1024 * 1024) throw new Error("This photo could not be compressed small enough. Please choose another image.");
    return { file:new File([blob],file.name.replace(/\\.[^.]+$/,"")+".jpg",{type:"image/jpeg"}), contentType:"image/jpeg" };
  }

  async function buildDraftFiles() {
    const [kittenSource, eventSource, alumniSource, scriptSource] = await Promise.all([
      fetch("../kitten-data.js", { cache: "no-store" }).then(r => { if (!r.ok) throw new Error("Could not load kitten data."); return r.text(); }),
      fetch("../event-data.js", { cache: "no-store" }).then(r => { if (!r.ok) throw new Error("Could not load event data."); return r.text(); }),
      fetch("../alumni-data.js", { cache: "no-store" }).then(r => { if (!r.ok) throw new Error("Could not load alumni data."); return r.text(); }),
      fetch("../script.js", { cache: "no-store" }).then(r => { if (!r.ok) throw new Error("Could not load homepage settings."); return r.text(); })
    ]);
    const uploads = [];
    const photoMap = {};
    const kittensDraft = clone(draft.kittens);
    for (const kitten of kittensDraft) {
      kitten.photos = await Promise.all((kitten.photos || []).map(async photo => {
        if (!String(photo).startsWith("blob:")) return photo;
        const pending = pendingPhotoUploads.get(photo);
        if (!pending) throw new Error("A selected photo is no longer available. Please choose it again.");
        const prepared = await preparePhoto(pending.file);
        const ext = "jpg";
        const safeId = String(kitten.id || pending.kittenId || "kitten").toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/^-|-$/g,"").slice(0,40) || "kitten";
        const filename = `${safeId}-${Date.now()}-${uploads.length+1}.${ext}`;
        const savedPath = `assets/kittens/${filename}`;
        const contentBase64 = await photoToBase64(prepared.file);
        const totalUploadSize = uploads.reduce((sum,item)=>sum+item.contentBase64.length,0) + contentBase64.length;
        if (totalUploadSize > 5_000_000) throw new Error("These photos are too large to send together. Publish fewer new photos at a time.");
        uploads.push({ path:savedPath, contentType:prepared.contentType, contentBase64 });
        photoMap[photo] = savedPath;
        return savedPath;
      }));
    }
    const kittens = replaceAssignedArray(kittenSource, "appRoot.PAWS_KITTENS", kittensDraft);
    const eventsMatch = eventSource.match(/window\.PAWS_EVENT_DATA\s*=\s*\{[\s\S]*\};\s*$/);
    if (!eventsMatch) throw new Error("Could not prepare event data for saving.");
    const events = eventSource.replace(eventsMatch[0], "window.PAWS_EVENT_DATA = " + JSON.stringify(draft.events, null, 2) + ";\n");
    const alumni = replaceAssignedArray(alumniSource, "alumniRoot.PAWS_FOSTER_ALUMNI", draft.alumni);
    const hero = replaceAssignedArray(scriptSource, "const FOSTER_CAROUSEL_PHOTOS", draft.heroPhotos);
    return { files: { "kitten-data.js": kittens, "event-data.js": events, "alumni-data.js": alumni, "script.js": hero }, uploads, photoMap };
  }

  publishButton.addEventListener("click", async () => {
    if (!supabaseClient || publishButton.disabled) return;
    if (!window.confirm("Publish these approved changes to the private editor branch? The public website will not change.")) return;
    publishButton.disabled = true;
    $("#save-status").textContent = "Sending your approved draft to the private branch…";
    try {
      const draftPayload = await buildDraftFiles();
      const { data, error } = await supabaseClient.functions.invoke("publish-draft", {
        body: { ...draftPayload, message: "Update foster website draft from private editor" }
      });
      if (error) {
        let detail = error.message || "Publishing request failed.";
        try { const body = await error.context?.json(); if (body?.error) detail = body.error; } catch {}
        throw new Error(detail);
      }
      if (!data?.ok || data.branch !== "private-editor-foundation") {
        throw new Error(data?.error || "The service did not confirm a private-branch save.");
      }
      for (const kitten of draft.kittens) kitten.photos = (kitten.photos || []).map(photo => {
        const savedPath = draftPayload.photoMap[photo];
        if (!savedPath) return photo;
        URL.revokeObjectURL(photo);
        pendingPhotoUploads.delete(photo);
        return savedPath;
      });
      renderKittenList();
      dirty = false;
      $("#save-status").textContent = "Draft saved to private-editor-foundation. The public website has not changed.";
    } catch (error) {
      $("#save-status").textContent = "Draft was not confirmed as saved: " + (error.message || "Unknown error.");
      publishButton.disabled = false;
    }
  });

  function updatePublishAvailability() { publishButton.disabled = !dirty || !supabaseClient; }
  const originalMarkDirty = markDirty;
  markDirty = () => { originalMarkDirty(); updatePublishAvailability(); };
  renderKittenList();renderPhotos();renderEvents();renderAlumni();
})();