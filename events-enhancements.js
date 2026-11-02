(function(){
"use strict";
const data=window.PAWS_EVENT_DATA||{};
const kittens=Array.isArray(window.PAWS_KITTENS)?window.PAWS_KITTENS:[];
function esc(v){return String(v==null?"":v).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function parts(item){
 if(item&&item.dateISO&&/^\d{4}-\d{2}-\d{2}$/.test(item.dateISO)){const a=item.dateISO.split("-").map(Number);return {y:a[0],m:a[1]-1,d:a[2]};}
 const d=item&&item.date?new Date(item.date+" 12:00:00"):null;
 return d&&!isNaN(d)?{y:d.getFullYear(),m:d.getMonth(),d:d.getDate()}:null;
}
function time(value,fallback){
 if(typeof value==="string"&&/^\d{2}:\d{2}$/.test(value)){const a=value.split(":").map(Number);return {h:a[0],m:a[1]};}
 const x=String(value||"").match(/(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)/i);
 if(!x)return time(fallback||"10:00","10:00");
 let h=Number(x[1])%12;if(/p/i.test(x[3]))h+=12;return {h:h,m:Number(x[2]||0)};
}
function dt(item,t,fallback){const p=parts(item);if(!p)return null;const q=time(t,fallback);return new Date(p.y,p.m,p.d,q.h,q.m,0,0);}
function key(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function cd(start,end,label){
 const now=new Date(),ms=start-now;
 if(ms>0){if(ms<=3600000){const n=Math.max(1,Math.ceil(ms/60000));return (label||"Starts")+" in "+n+" "+(n===1?"minute":"minutes")+"!";}
 const days=Math.ceil(ms/86400000);if(days>=1)return "Coming in "+days+" "+(days===1?"day":"days")+"!";const hours=Math.max(1,Math.ceil(ms/3600000));return hours===1?"Starts in 1 hour!":"Starts in "+hours+" hours!";}
 if(end&&now>=end)return "You missed us today!";
 if(!end&&label==="Kitty Yoga")return "Kitty Yoga is starting!";
 if(end){const n=Math.ceil((end-now)/60000);if(n<=15)return "Last chance to stop by today!";if(n<=30)return "30 minutes left!";if(n<=60)return "1 hour left!";const h=Math.floor(n/60);return h+" "+(h===1?"hour":"hours")+" left!";}
 return "Happening Now!";
}
function countdown(start,end,label){return '<span class="event-countdown" data-start="'+start.toISOString()+'" data-end="'+(end?end.toISOString():"")+'" data-label="'+(label||"")+'">'+esc(cd(start,end,label))+'</span>';}
function tick(){document.querySelectorAll("[data-start]").forEach(function(n){const s=new Date(n.dataset.start),e=n.dataset.end?new Date(n.dataset.end):null;if(!isNaN(s))n.textContent=cd(s,e,n.dataset.label);});}
function map(a,u){return a?'<a class="event-address" href="'+esc(u||("https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(a)))+'" target="_blank" rel="noopener noreferrer">'+esc(a)+'</a>':"";}
function init(){
 const featured=document.querySelector("#event-featured"),homeSpecial=document.querySelector("#home-special-event"),specialHost=document.querySelector("#special-event");
 const ev=data.featuredEvent||{},s=dt(ev,ev.startTime||"10:00","10:00"),e=dt(ev,ev.endTime||"16:00","16:00"),now=new Date();
 if(featured){
  let body="";
  if(ev.active&&s&&key(s)===key(now)&&now>=e)body='<p class="eyebrow">Where to Find Us</p><h2>You missed us today!</h2><p>Our adoption event has wrapped up for the day. Thank you to everyone who stopped by! Check back soon for our next opportunity to meet our adoptable kittens.</p>';
  else if(ev.active&&s&&now<e&&key(s)>=key(new Date(now.getFullYear(),now.getMonth(),now.getDate()))){
   const attending=(ev.attendingKittens||[]).filter(function(n){return kittens.some(function(k){return k.name===n;});});
   body='<p class="eyebrow">Where to Find Us</p><h2>Upcoming Adoption Event</h2>'+countdown(s,e)+(s<=now?'<p class="event-live-label">Happening Now!</p>':"")+'<p class="event-date"><strong>'+esc(ev.date||"Date coming soon")+'</strong></p><p class="event-time"><strong>'+esc(ev.time||"10 a.m. – 4 p.m.")+'</strong></p><p class="event-location-name"><strong>'+esc(ev.location||"Location details to be announced")+'</strong></p>'+map(ev.address,ev.mapsUrl)+(attending.length?'<p class="event-attending"><strong>Kittens attending:</strong><br>'+attending.map(esc).join(", ")+'</p>':"");
  }else body='<p class="eyebrow">Where to Find Us</p><h2 class="coming-soon-title">COMING SOON</h2><p class="coming-soon-copy">Your new best friend might be waiting! Check back soon to see when you can meet our adoptable kittens.</p><div class="coming-soon-details"><strong>Location details to be announced.</strong><p>For more updates and upcoming meet-and-greets, visit our <a href="events/">Events tab</a>!</p></div>';
  featured.innerHTML='<article class="event-card event-card--compact"><div class="event-card-content '+(body.includes("coming-soon-title")?"event-coming-soon":"")+'">'+body+'</div></article>';
 }
 const specials=[data.specialEvent].concat(Array.isArray(data.additionalSpecialEvents)?data.additionalSpecialEvents:[]).filter(function(x){if(!x||x.active===false)return false;const p=parts(x);if(!p)return true;const day=new Date(p.y,p.m,p.d);const today=new Date(now.getFullYear(),now.getMonth(),now.getDate());return day>=today;});
 function specialHTML(item,home){
  const start=dt(item,item.startTime||item.adoptionTime||"10:00","10:00"),end=dt(item,item.endTime||"16:00","16:00"),yoga=dt(item,item.yogaStartTime||item.yogaTime,"11:30");
  const activity=(item.adoptionTime?'<p><strong>Kitten Adoption Event</strong><br>'+esc(item.adoptionTime)+' <span class="event-audience">Open to everyone</span>'+(start?countdown(start,end):"")+'</p>':"")+(item.yogaTime?'<p><strong>Kitty Yoga</strong><br>'+esc(item.yogaTime)+' <span class="members-only">(Members only)</span>'+(yoga?countdown(yoga,null,"Kitty Yoga"):"")+'</p>':"");
  if(home)return '<div class="home-special-event-copy"><p class="eyebrow">Special Event</p><h2>'+esc(item.title||"Special Adoption Event")+'</h2><p><strong>'+esc(item.date||"Date coming soon")+'</strong></p>'+activity+'<p><strong>'+esc(item.location||"Location details to be announced")+'</strong><br>'+map(item.address,item.mapsUrl)+'</p><a class="text-link" href="events/">Learn more →</a></div>';
  return '<article class="special-event-entry"><p class="eyebrow">Special event</p><h2>'+esc(item.title||"Special Adoption Event")+'</h2><p class="special-event-date"><strong>'+esc(item.date||"Date coming soon")+'</strong></p><div class="special-event-activities">'+activity+'</div><p><strong>'+esc(item.location||"Location details to be announced")+'</strong></p>'+map(item.address,item.mapsUrl)+'<p>'+esc(item.description||"Come meet our foster kittens and learn more about this special event.")+'</p></article>';
 }
 if(specialHost&&specials.length){specialHost.innerHTML=specials.map(function(x){return specialHTML(x,false);}).join("");specialHost.hidden=false;}
 if(homeSpecial&&specials.length){homeSpecial.innerHTML=specials.map(function(x){return specialHTML(x,true);}).join("");homeSpecial.hidden=false;}
 tick();if(!window.__pawsEventTick)window.__pawsEventTick=setInterval(tick,30000);
 initMeetGreet();
}
function initMeetGreet(){
 const host=document.getElementById("private-meet-greet");if(!host)return;
 const rescue="https://www.nopawsleftbehindkittyrescue.com/forms";
 const blocked=new Set([data.featuredEvent,data.specialEvent].concat(data.additionalSpecialEvents||[]).filter(function(x){return x&&x.active!==false;}).map(parts).filter(Boolean).map(function(p){return key(new Date(p.y,p.m,p.d));}));
 const eligible=kittens.filter(function(k){return ["Available","Returned — Available"].includes(k.status||k.adoptionStatus);});
 let checks=eligible.map(function(k){return '<label class="meet-greet-kitten"><input type="checkbox" name="kittens[]" value="'+esc(k.name)+'"><span>'+esc(k.name)+'</span></label>';}).join("");
 host.innerHTML='<section class="meet-greet-panel"><p class="eyebrow">A more personal visit</p><h2>Want to Meet the Kittens?</h2><p>Can’t make it to one of our scheduled adoption events? You may still be able to arrange a private meet-and-greet.</p><div class="meet-greet-how"><h3>How it works</h3><ol><li>First, submit an adoption application for the kitten(s) you’re interested in through <a href="'+rescue+'" target="_blank" rel="noopener noreferrer">No Paws Left Behind Kitty Rescue</a>.</li><li>Once you’ve submitted your application, let the rescue know you’d like to schedule a private meet-and-greet.</li><li>Then, fill out the request form below so we can coordinate a time.</li></ol></div><h3>Private Meet-and-Greet Request</h3><p class="meet-greet-required-note">Fields marked <strong>Required</strong> must be completed.</p><form id="meet-greet-form" class="faq-question-form" action="https://formsubmit.co/ajax/pawsandpurrsfosters@gmail.com" method="POST"><input type="hidden" name="_subject" value="New Private Meet-and-Greet Request — Paws &amp; Purr Fosters"><input type="hidden" name="_template" value="table"><input type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true" class="faq-honeypot"><label for="meet-first">First name <span class="required-label">Required</span></label><input id="meet-first" name="first_name" type="text" maxlength="60" autocomplete="given-name" pattern="(?=.*[A-Za-zÀ-ÖØ-öø-ÿ])[A-Za-zÀ-ÖØ-öø-ÿ’\' -]+" title="Please enter a valid first name using letters only." required><label for="meet-last">Last name <span class="required-label">Required</span></label><input id="meet-last" name="last_name" type="text" maxlength="60" autocomplete="family-name" pattern="(?=.*[A-Za-zÀ-ÖØ-öø-ÿ])[A-Za-zÀ-ÖØ-öø-ÿ’\' -]+" title="Please enter a valid last name using letters only." required><label for="meet-email">Email address <span class="required-label">Required</span></label><input id="meet-email" name="email" type="email" maxlength="254" autocomplete="email" required><span class="faq-field-label">Which kittens are you interested in? <span class="required-label">Required — select at least one</span></span><div class="meet-greet-kitten-options">'+(checks||"<p>No currently adoptable kittens are listed.</p>")+'</div><label>Have you submitted an adoption application through No Paws Left Behind Kitty Rescue? <span class="required-label">Required</span></label><div class="meet-greet-radio"><label><input type="radio" name="application_submitted" value="Yes" required> Yes</label><label><input type="radio" name="application_submitted" value="No" required> No</label></div><p id="meet-no-note" class="meet-greet-application-note" hidden>Please submit an <a href="'+rescue+'" target="_blank" rel="noopener noreferrer">adoption application through the rescue</a> first. You can return here once it has been submitted.</p><label>Preferred date <span class="required-label">Required</span></label><div class="meet-calendar"><div class="meet-calendar-heading"><button type="button" id="meet-prev">‹</button><strong id="meet-month"></strong><button type="button" id="meet-next">›</button></div><div id="meet-days" class="meet-calendar-grid"></div></div><div class="meet-calendar-legend"><span><i class="legend-dot available"></i> Available</span><span><i class="legend-dot unavailable"></i> Unavailable</span></div><div id="meet-public-events" class="meet-public-events"></div><p class="meet-calendar-explanation"><strong>Why are some dates gray?</strong> Dates in the past have already passed. Tuesdays and Thursdays are unavailable for private visits. A gray date marked with a public adoption event means you’re welcome to come meet the kittens at that event instead — see the event details below.</p><p class="meet-weekend-note">Weekend requests are tentative. We may have a public adoption event scheduled that day; if so, we’ll reach out to let you know and invite you to meet the kittens there.</p><input type="hidden" id="meet-date" name="preferred_date" required><p id="meet-date-status" class="meet-greet-date-status" role="status">Select an available date on the calendar.</p><label for="meet-time">Preferred time <span class="required-label">Required</span></label><select id="meet-time" name="preferred_time" required><option value="">Choose a time (9:30 a.m. – 4:00 p.m.)</option><option>9:30 a.m.</option><option>10:00 a.m.</option><option>10:30 a.m.</option><option>11:00 a.m.</option><option>11:30 a.m.</option><option>12:00 p.m.</option><option>12:30 p.m.</option><option>1:00 p.m.</option><option>1:30 p.m.</option><option>2:00 p.m.</option><option>2:30 p.m.</option><option>3:00 p.m.</option><option>3:30 p.m.</option><option>4:00 p.m.</option></select><label for="meet-notes">Anything else you’d like us to know? <span>(Optional)</span></label><textarea id="meet-notes" name="additional_notes" rows="3"></textarea><button id="meet-submit" type="submit" class="button button-primary">Request a Meet-and-Greet</button><p id="meet-status" class="faq-form-status" role="status" aria-live="polite"></p><p class="meet-greet-disclaimer">Submitting a request does not confirm an appointment. Private meet-and-greets are subject to availability and scheduling. We’ll contact you by email to discuss your request.</p></form></section>';
 const form=host.querySelector("#meet-greet-form"),date=host.querySelector("#meet-date"),status=host.querySelector("#meet-date-status");
 const today=new Date();today.setHours(0,0,0,0);let month=new Date(today.getFullYear(),today.getMonth(),1),applicationNo=false;
 const upcomingPublicEvents=[data.featuredEvent,data.specialEvent].concat(data.additionalSpecialEvents||[]).filter(function(x){if(!x||x.active===false)return false;const p=parts(x);if(!p)return false;const day=new Date(p.y,p.m,p.d);day.setHours(23,59,59,999);return day>=today;});
 const eventList=host.querySelector("#meet-public-events");
 if(eventList&&upcomingPublicEvents.length){eventList.innerHTML='<p class="meet-public-events-title">Prefer to meet us at a public adoption event?</p>'+upcomingPublicEvents.map(function(x){return '<div class="meet-public-event"><strong>'+esc(x.date||"Upcoming event")+'</strong><span>'+esc(x.location||"Location to be announced")+'</span><small>'+esc(x.time||x.adoptionTime||"")+'</small><p>You’re welcome to come meet the kittens there instead of requesting a private visit.</p></div>';}).join("");}
 function unavailable(d){return d<today||d.getDay()===2||d.getDay()===4||blocked.has(key(d));}
 function reason(d){if(d<today)return "This date has passed.";if(d.getDay()===2||d.getDay()===4)return "Private meet-and-greets are not available on Tuesdays or Thursdays.";if(blocked.has(key(d)))return "A public adoption event is scheduled for this date. You’re welcome to come meet the kittens there instead!";return "";}
 function draw(){
  host.querySelector("#meet-month").textContent=month.toLocaleDateString("en-US",{month:"long",year:"numeric"});
  let html=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(function(x){return '<span class="meet-calendar-weekday">'+x+'</span>';}).join("");
  const offset=new Date(month.getFullYear(),month.getMonth(),1).getDay(),n=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
  for(let i=0;i<offset;i++)html+='<span class="meet-calendar-empty"></span>';
  for(let d=1;d<=n;d++){const x=new Date(month.getFullYear(),month.getMonth(),d),k=key(x),off=unavailable(x);html+='<button type="button" class="meet-calendar-day'+(off?" is-unavailable ":"")+(date.value===k?" is-selected":"")+'" data-day="'+k+'" title="'+esc(reason(x)||"Available for a private meet-and-greet")+'" aria-label="'+esc(x.toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})+(off?". "+reason(x):", available"))+'" '+(off?"disabled":"")+'>'+d+'</button>';}
  host.querySelector("#meet-days").innerHTML=html;
  host.querySelectorAll("[data-day]").forEach(function(b){b.addEventListener("click",function(){date.value=b.dataset.day;status.textContent="Selected "+new Date(date.value+"T12:00:00").toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})+". Choose a preferred time below.";draw();});});
  host.querySelector("#meet-prev").disabled=month<=new Date(today.getFullYear(),today.getMonth(),1);
  host.querySelector("#meet-next").disabled=month>=new Date(today.getFullYear(),today.getMonth()+6,1);
 }
 host.querySelector("#meet-prev").onclick=function(){if(!this.disabled){month=new Date(month.getFullYear(),month.getMonth()-1,1);draw();}};
 host.querySelector("#meet-next").onclick=function(){if(!this.disabled){month=new Date(month.getFullYear(),month.getMonth()+1,1);draw();}};
 form.querySelectorAll('input[name="application_submitted"]').forEach(function(r){r.addEventListener("change",function(){const no=r.value==="No"&&r.checked;applicationNo=no;host.querySelector("#meet-no-note").hidden=!no;host.querySelector("#meet-submit").disabled=no;host.querySelector("#meet-time").disabled=no;draw();});});
 form.addEventListener("submit",async function(e){
  e.preventDefault();const out=host.querySelector("#meet-status"),button=host.querySelector("#meet-submit");
  if(!form.reportValidity())return;
  if(!form.querySelector('input[name="kittens[]"]:checked')){out.textContent="Please select at least one kitten you’re interested in.";return;}
  if(form.querySelector('input[name="application_submitted"]:checked')?.value!=="Yes"){out.textContent="Please submit an adoption application through the rescue before requesting a private meet-and-greet.";return;}
  if(!date.value||unavailable(new Date(date.value+"T12:00:00"))){out.textContent="That date is unavailable. Please choose another date.";return;}
  button.disabled=true;button.textContent="Sending…";out.textContent="Sending your request. Please wait.";
  try{const res=await fetch(form.action,{method:"POST",body:new FormData(form),headers:{"Accept":"application/json"}});const result=await res.json();if(!res.ok||result.success==="false"||result.success===false)throw new Error("send failed");form.reset();date.value="";draw();host.querySelector("#meet-no-note").hidden=true;status.textContent="Tuesdays and Thursdays are unavailable. Dates with public adoption events are reserved for those events.";out.textContent="Thank you! Your private meet-and-greet request has been sent. We’ll be in touch by email soon.";}
  catch(err){out.textContent="Sorry, your request could not be sent right now. Please try again later or email pawsandpurrsfosters@gmail.com directly.";}
  finally{button.disabled=false;button.textContent="Request a Meet-and-Greet";}
 });
 draw();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();