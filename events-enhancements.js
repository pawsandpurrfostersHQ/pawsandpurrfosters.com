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
 const today=new Date(now.getFullYear(),now.getMonth(),now.getDate()),eventDay=new Date(start.getFullYear(),start.getMonth(),start.getDate()),days=Math.round((eventDay-today)/86400000);if(days===1)return "Coming tomorrow!";if(days>1)return "Coming in "+days+" days!";const hours=Math.max(1,Math.ceil(ms/3600000));return hours===1?"Starts in 1 hour!":"Starts in "+hours+" hours!";}
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
  }else body='<p class="eyebrow">Where to Find Us</p><h2 class="coming-soon-title">COMING SOON</h2><p class="coming-soon-copy">Your new best friend might be waiting! Check back soon to see when you can meet our adoptable kittens.</p><div class="coming-soon-details"><strong>Location details to be announced.</strong><p>Check back here for updates and future opportunities to meet our adoptable kittens.</p></div>';
  if(featured.classList.contains("home-event-square"))body+='<p class="home-event-more"><a class="text-link" href="events/">Go to the Events tab for more information.</a></p>';
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
function meetTodayDate() {
 const p={};new Intl.DateTimeFormat("en-US",{timeZone:"America/Los_Angeles",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date()).forEach(x=>p[x.type]=x.value);
 return new Date(Number(p.year),Number(p.month)-1,Number(p.day));
}
function meetLocalIso(dateKey, hour, minute) {
 const [y,m,d]=dateKey.split("-").map(Number);
 const target=Date.UTC(y,m-1,d,hour,minute);
 let guess=target;
 for(let i=0;i<3;i++){
  const parts=new Intl.DateTimeFormat("en-US",{timeZone:"America/Los_Angeles",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(new Date(guess));
  const p={};parts.forEach(x=>p[x.type]=x.value);
  const represented=Date.UTC(Number(p.year),Number(p.month)-1,Number(p.day),Number(p.hour),Number(p.minute));
  guess+=target-represented;
 }
 return new Date(guess).toISOString();
}
function meetTimeParts(label) {
 const m=String(label).match(/(\d{1,2}):(\d{2})\s*(a\.m\.|p\.m\.)/i);
 if(!m)return null;let h=Number(m[1])%12;if(/p/i.test(m[3]))h+=12;
 return {hour:h,minute:Number(m[2])};
}
function initMeetGreet(){
 const host=document.getElementById("private-meet-greet");if(!host)return;
 const manageToken=new URLSearchParams(window.location.search).get("meet-manage");
 if(manageToken){
  const manageMin=meetTodayDate();
  host.innerHTML='<section class="meet-greet-panel"><p class="eyebrow">Appointment details</p><h2>Manage your Meet-and-Greet</h2><p>Use this secure page to cancel your confirmed appointment or request a different time.</p><div class="editor-form"><h3>Cancel appointment</h3><label for="manage-cancel-reason">Reason for cancellation (required)</label><textarea id="manage-cancel-reason" rows="3" maxlength="1000"></textarea><button id="manage-cancel" class="button button-primary" type="button">Cancel appointment</button><p id="manage-status" role="status"></p></div><div class="editor-form"><h3>Request a different time</h3><p>Your current appointment remains confirmed unless we approve the new time.</p><label for="manage-new-date">New date</label><input id="manage-new-date" type="date"><label for="manage-new-time">New start time</label><select id="manage-new-time"><option value="">Choose a time</option><option>9:30 a.m.</option><option>10:00 a.m.</option><option>10:30 a.m.</option><option>11:00 a.m.</option><option>11:30 a.m.</option><option>12:00 p.m.</option><option>12:30 p.m.</option><option>1:00 p.m.</option><option>1:30 p.m.</option><option>2:00 p.m.</option><option>2:30 p.m.</option><option>3:00 p.m.</option><option>3:30 p.m.</option><option>4:00 p.m.</option></select><label for="manage-reschedule-reason">Reason for rescheduling (required)</label><textarea id="manage-reschedule-reason" rows="3" maxlength="1000"></textarea><button id="manage-reschedule" class="button button-primary" type="button">Request new time</button></div></section>';
  host.querySelector("#manage-new-date").min=key(manageMin);
  const manageDate=host.querySelector("#manage-new-date"),manageTime=host.querySelector("#manage-new-time");
  const manageTimeOptions=Array.from(manageTime.options).filter(o=>o.value);
  manageDate.addEventListener("change",async()=>{
   manageTime.value="";
   manageTimeOptions.forEach(o=>{o.disabled=true;o.textContent=o.value;});
   if(!manageDate.value)return;
   const day=manageDate.value,parts=day.split("-").map(Number),next=new Date(parts[0],parts[1]-1,parts[2]+1),nextKey=key(next);
   try{
    const res=await fetch("https://ovnbbpcrwbvotyevghcx.supabase.co/functions/v1/meet-greet",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"availability",from:meetLocalIso(day,0,0),to:meetLocalIso(nextKey,0,0)})});
    const result=await res.json();if(!res.ok)throw new Error(result.error||"Availability unavailable");
    const weekday=new Date(day+"T12:00:00").getDay(),full=(result.daily_counts?.[day]||0)>=4;
    const publicDay=[data.featuredEvent,data.specialEvent].concat(data.additionalSpecialEvents||[]).filter(x=>x&&x.active!==false).map(parts).filter(Boolean).some(p=>key(new Date(p.y,p.m,p.d))===day);
    manageTimeOptions.forEach(o=>{
     const p=meetTimeParts(o.value),start=meetLocalIso(day,p.hour,p.minute),end=new Date(new Date(start).getTime()+((p.hour>14||(p.hour===14&&p.minute>=30))?2:4)*3600000).toISOString();
     const overlap=(result.blocked||[]).some(x=>new Date(x.starts_at)<new Date(end)&&new Date(x.ends_at)>new Date(start));
     o.disabled=weekday===2||weekday===4||publicDay||overlap||full||isDateClosed(day);
     o.textContent=o.value+(overlap||weekday===2||weekday===4||publicDay||full||isDateClosed(day)?" — unavailable":"");
    });
   }catch(e){manageTimeOptions.forEach(o=>o.disabled=true);host.querySelector("#manage-status").textContent="We couldn't load availability. Please try again.";}
  });
  const call=async(payload)=>{const r=await fetch("https://ovnbbpcrwbvotyevghcx.supabase.co/functions/v1/meet-greet",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});const j=await r.json();if(!r.ok)throw new Error(j.error||"Unable to complete request.");return j;};
  host.querySelector("#manage-cancel").onclick=async()=>{const reason=host.querySelector("#manage-cancel-reason").value.trim();if(!reason){host.querySelector("#manage-status").textContent="Please enter a cancellation reason.";return;}if(!window.confirm("Cancel your confirmed meet-and-greet?"))return;try{await call({action:"visitor-cancel",visitor_token:manageToken,reason});host.querySelector("#manage-status").textContent="Your appointment has been canceled. We’ve notified the foster.";host.querySelector("#manage-cancel").disabled=true;}catch(e){host.querySelector("#manage-status").textContent=e.message;}};
  host.querySelector("#manage-reschedule").onclick=async()=>{const date=host.querySelector("#manage-new-date").value,time=host.querySelector("#manage-new-time").value,reason=host.querySelector("#manage-reschedule-reason").value.trim();if(!date||!time||!reason){host.querySelector("#manage-status").textContent="Please enter a new date, time, and reason.";return;}const m=time.match(/(\d{1,2}):(\d{2})\s*(a\.m\.|p\.m\.)/i);let hh=Number(m[1])%12;if(/p/i.test(m[3]))hh+=12;const starts_at=meetLocalIso(date,hh,Number(m[2]));const eventDates=[data.featuredEvent,data.specialEvent].concat(data.additionalSpecialEvents||[]).filter(x=>x&&x.active!==false).map(parts).filter(Boolean).map(p=>key(new Date(p.y,p.m,p.d)));try{await call({action:"reschedule-request",visitor_token:manageToken,starts_at,reason,event_dates:eventDates});host.querySelector("#manage-status").textContent="Your new time request has been sent. Your original appointment remains confirmed while we review it.";host.querySelector("#manage-reschedule").disabled=true;}catch(e){host.querySelector("#manage-status").textContent=e.message;}};
  return;
 }
 const rescue="https://www.nopawsleftbehindkittyrescue.com/forms";
 const blocked=new Set([data.featuredEvent,data.specialEvent].concat(data.additionalSpecialEvents||[]).filter(function(x){return x&&x.active!==false;}).map(parts).filter(Boolean).map(function(p){return key(new Date(p.y,p.m,p.d));}));
 const eligible=kittens.filter(function(k){return ["Available","Returned — Available"].includes(k.status||k.adoptionStatus);});
 let checks=eligible.map(function(k){return '<label class="meet-greet-kitten"><input type="checkbox" name="kittens[]" value="'+esc(k.name)+'"><span>'+esc(k.name)+'</span></label>';}).join("");
 host.innerHTML='<section class="meet-greet-panel"><p class="eyebrow">A more personal visit</p><h2>Want to Meet the Kittens?</h2><p>Can’t make it to one of our scheduled adoption events? You may still be able to arrange a private meet-and-greet. We’ll share the meeting location after your request is approved.</p><div class="meet-greet-how"><h3>How it works</h3><ol><li>First, submit an adoption application for the kitten(s) you’re interested in through <a href="'+rescue+'" target="_blank" rel="noopener noreferrer">No Paws Left Behind Kitty Rescue</a>.</li><li>Once you’ve submitted your application, let the rescue know you’d like to schedule a private meet-and-greet.</li><li>Then, fill out the request form below so we can coordinate a time. We’ll share the meeting location after your request is approved.</li></ol></div><h3>Private Meet-and-Greet Request</h3><p class="meet-greet-required-note">Fields marked <strong>Required</strong> must be completed.</p><form id="meet-greet-form" class="faq-question-form" action="#" method="POST"><input type="hidden" name="_subject" value="New Private Meet-and-Greet Request — Paws &amp; Purr Fosters"><input type="hidden" name="_template" value="table"><input type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true" class="faq-honeypot"><label for="meet-first">First name <span class="required-label">Required</span></label><input id="meet-first" name="first_name" type="text" maxlength="60" autocomplete="given-name" pattern="(?=.*[A-Za-zÀ-ÖØ-öø-ÿ])[A-Za-zÀ-ÖØ-öø-ÿ’\' -]+" title="Please enter a valid first name using letters only." required><label for="meet-last">Last name <span class="required-label">Required</span></label><input id="meet-last" name="last_name" type="text" maxlength="60" autocomplete="family-name" pattern="(?=.*[A-Za-zÀ-ÖØ-öø-ÿ])[A-Za-zÀ-ÖØ-öø-ÿ’\' -]+" title="Please enter a valid last name using letters only." required><label for="meet-email">Email address <span class="required-label">Required</span></label><input id="meet-email" name="email" type="email" maxlength="254" autocomplete="email" required><span class="faq-field-label">Which kittens are you interested in? <span class="required-label">Required — select at least one</span></span><div class="meet-greet-kitten-options">'+(checks||"<p>No currently adoptable kittens are listed.</p>")+'</div><label>Have you submitted an adoption application through No Paws Left Behind Kitty Rescue? <span class="required-label">Required</span></label><div class="meet-greet-radio"><label><input type="radio" name="application_submitted" value="Yes" required> Yes</label><label><input type="radio" name="application_submitted" value="No" required> No</label></div><p id="meet-no-note" class="meet-greet-application-note" hidden>Please submit an <a href="'+rescue+'" target="_blank" rel="noopener noreferrer">adoption application through the rescue</a> first. You can return here once it has been submitted.</p><label>Preferred date <span class="required-label">Required</span></label><div class="meet-calendar-layout"><div class="meet-calendar"><div class="meet-calendar-heading"><button type="button" id="meet-prev" aria-label="Previous month"><span class="meet-arrow-glyph">‹</span></button><strong id="meet-month"></strong><button type="button" id="meet-next" aria-label="Next month"><span class="meet-arrow-glyph">›</span></button></div><div id="meet-days" class="meet-calendar-grid"></div></div><aside class="meet-calendar-side"><div class="meet-calendar-legend"><span><i class="legend-dot available"></i> Available</span><span><i class="legend-dot unavailable"></i> Unavailable</span><span><i class="legend-dot fully-booked"></i> Fully booked</span><span><i class="legend-dot past"></i> Past date</span><p class="meet-weekend-note">Weekend requests are tentative. If an adoption event is added for your selected date, we’ll email you with the event details and invite you to meet the kittens there.</p></div><div id="meet-public-events" class="meet-public-events"></div></aside></div><p class="meet-time-note">Choose a start time. Most meet-and-greets are reserved in a four-hour window to allow enough time, although you may not need the full four hours. Appointments starting after 2:00 p.m. are limited to two hours. The latest start time is 4:00 p.m., ending at 6:00 p.m. If you need a longer appointment, please contact us.</p><input type="hidden" id="meet-date" name="preferred_date" required><p id="meet-date-status" class="meet-greet-date-status" role="status">Select an available date on the calendar.</p><label for="meet-time">Preferred time <span class="required-label">Required</span></label><select id="meet-time" name="preferred_time" required><option value="">Choose a time (9:30 a.m. – 4:00 p.m.)</option><option>9:30 a.m.</option><option>10:00 a.m.</option><option>10:30 a.m.</option><option>11:00 a.m.</option><option>11:30 a.m.</option><option>12:00 p.m.</option><option>12:30 p.m.</option><option>1:00 p.m.</option><option>1:30 p.m.</option><option>2:00 p.m.</option><option>2:30 p.m.</option><option>3:00 p.m.</option><option>3:30 p.m.</option><option>4:00 p.m.</option></select><p id="meet-time-window" class="meet-time-window" aria-live="polite"></p><p id="meet-four-pm-note" class="meet-four-pm-note" hidden>Appointments starting after 2:00 p.m. are limited to two hours. The latest start time is 4:00 p.m., ending at 6:00 p.m. If you need a longer meet-and-greet, please contact us.</p><label for="meet-notes">Anything else you’d like us to know? <span>(Optional)</span></label><textarea id="meet-notes" name="additional_notes" rows="3"></textarea><button id="meet-submit" type="submit" class="button button-primary">Request a Meet-and-Greet</button><p id="meet-status" class="faq-form-status" role="status" aria-live="polite"></p><p class="meet-greet-disclaimer">Submitting a request does not confirm an appointment. Private meet-and-greets are subject to availability and scheduling. We’ll contact you by email to discuss your request.</p></form></section>';
 const form=host.querySelector("#meet-greet-form"),date=host.querySelector("#meet-date"),status=host.querySelector("#meet-date-status");
 const timeSelect=host.querySelector("#meet-time");
 const timeOptions=Array.from(timeSelect.options).filter(o=>o.value);
  function updateSelectedWindow(){const value=timeSelect.value,windowLabel=host.querySelector("#meet-time-window"),fourNote=host.querySelector("#meet-four-pm-note");if(!value){windowLabel.textContent="";fourNote.hidden=true;return;}const p=meetTimeParts(value),startLabel=value.trim(),endDate=new Date(2000,0,1,p.hour,p.minute);const shortVisit=p.hour>14||(p.hour===14&&p.minute>=30);endDate.setHours(p.hour,p.minute+(shortVisit?120:240));const eh=endDate.getHours(),ampm=eh>=12?"p.m.":"a.m.",h=eh%12||12,minutes=endDate.getMinutes(),endLabel=h+(minutes?":"+String(minutes).padStart(2,"0"):"")+" "+ampm;windowLabel.textContent=startLabel+" – "+endLabel;fourNote.hidden=!shortVisit;}
 let occupied=[];let dailyCounts={};
 async function refreshAvailability(){
  const from=meetLocalIso(key(new Date(month.getFullYear(),month.getMonth(),1)),0,0);
  const to=meetLocalIso(key(new Date(month.getFullYear(),month.getMonth()+1,1)),0,0);
  try{
   const response=await fetch("https://ovnbbpcrwbvotyevghcx.supabase.co/functions/v1/meet-greet",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"availability",from,to})});
   const result=await response.json();if(!response.ok)throw new Error(result.error||"Availability could not be loaded.");
   occupied=result.blocked||[];dailyCounts=result.daily_counts||{};timeSelect.disabled=false;updateTimeOptions();draw();
  }catch(e){occupied=null;timeSelect.disabled=true;status.textContent="Live availability is temporarily unavailable. Please refresh the page before choosing a time.";}
 }
 function updateTimeOptions(){
  const selected=date.value;
  if(!selected||!occupied){timeOptions.forEach(option=>{option.disabled=true;option.textContent=option.value;});timeSelect.disabled=true;return;}
  timeOptions.forEach(option=>{
   const p=meetTimeParts(option.value);if(!p)return;
   const start=meetLocalIso(selected,p.hour,p.minute),end=new Date(new Date(start).getTime()+((p.hour>14||(p.hour===14&&p.minute>=30))?2:4)*3600000).toISOString();
   const overlaps=(occupied||[]).some(x=>new Date(x.starts_at)<new Date(end)&&new Date(x.ends_at)>new Date(start));
   option.disabled=!selected||!occupied||overlaps||(dailyCounts[selected]||0)>=4||isDateClosed(selected);
   option.textContent=option.value;
  });
  timeSelect.value="";
  updateSelectedWindow();
  timeSelect.disabled=!selected||!occupied||applicationNo;
 }

 timeSelect.addEventListener("change",updateSelectedWindow);
 const today=meetTodayDate();let month=new Date(today.getFullYear(),today.getMonth(),1),applicationNo=false;
 const upcomingPublicEvents=[data.featuredEvent,data.specialEvent].concat(data.additionalSpecialEvents||[]).filter(function(x){if(!x||x.active===false)return false;const p=parts(x);if(!p)return false;const day=new Date(p.y,p.m,p.d);day.setHours(23,59,59,999);return day>=today;});
 const eventList=host.querySelector("#meet-public-events");
 if(eventList){eventList.innerHTML=upcomingPublicEvents.length?'<p class="meet-public-events-title">Upcoming public adoption events</p>'+upcomingPublicEvents.map(function(x){return '<div class="meet-public-event"><strong>'+esc(x.date||"Upcoming event")+'</strong><span>'+esc(x.location||"Location to be announced")+'</span><small>'+esc(x.time||x.adoptionTime||"")+'</small></div>';}).join(""): '<div class="meet-public-events-empty"><strong>No upcoming public adoption event is listed right now.</strong><p>Please check our Events tab for the next adoption and our regular schedule.</p></div>';}
 function isFullyBooked(dateKey){return !!occupied&&(dailyCounts[dateKey]||0)>=4;}
 function isDateClosed(dateKey){const d=new Date(dateKey+"T12:00:00");const thanksgiving=(()=>{const first=new Date(d.getFullYear(),10,1),firstThu=1+((4-first.getDay()+7)%7);return new Date(d.getFullYear(),10,firstThu+21);})();const start=new Date(thanksgiving);start.setDate(thanksgiving.getDate()-((thanksgiving.getDay()+6)%7));const end=new Date(start);end.setDate(start.getDate()+6);const x=new Date(dateKey+"T12:00:00");return (x>=start&&x<=end)||(x>=new Date(d.getFullYear(),11,21)&&x<=new Date(d.getFullYear(),11,27));}
 function unavailable(d){const k=key(d),todayPassed=d<today||(k===key(today)&&new Date()>=new Date(meetLocalIso(k,16,0)));return todayPassed||d.getDay()===2||d.getDay()===4||blocked.has(k)||isDateClosed(k)||isFullyBooked(k);}
 function reason(d){if(d<today||(key(d)===key(today)&&new Date()>=new Date(meetLocalIso(key(today),16,0))))return "This date has passed.";if(d.getDay()===2||d.getDay()===4||isDateClosed(key(d)))return "Unavailable";if(blocked.has(key(d)))return "A public adoption event is scheduled for this date. Please check the Events tab for the schedule.";if(isFullyBooked(key(d)))return "This date has reached its limit of four meet-and-greet bookings.";return "";}
 function draw(){
  host.querySelector("#meet-month").textContent=month.toLocaleDateString("en-US",{month:"long",year:"numeric"});
  let html=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(function(x){return '<span class="meet-calendar-weekday">'+x+'</span>';}).join("");
  const offset=new Date(month.getFullYear(),month.getMonth(),1).getDay(),n=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
  for(let i=0;i<offset;i++)html+='<span class="meet-calendar-empty"></span>';
  for(let d=1;d<=n;d++){const x=new Date(month.getFullYear(),month.getMonth(),d),k=key(x),past=x<today||(k===key(today)&&new Date()>=new Date(meetLocalIso(k,16,0))),eventDay=blocked.has(k),full=isFullyBooked(k),off=unavailable(x);html+='<button type="button" class="meet-calendar-day'+(off?" is-unavailable ":"")+(past?" is-past ":"")+(full?" is-fully-booked ":"")+(eventDay?" is-event-reserved ":"")+(date.value===k?" is-selected":"")+'" data-day="'+k+'" title="'+esc(reason(x)||"Available for a private meet-and-greet")+'" aria-label="'+esc(x.toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})+(off?". "+reason(x):", available"))+'" '+(off?"disabled":"")+'>'+d+'</button>';}
  host.querySelector("#meet-days").innerHTML=html;
  host.querySelectorAll("[data-day]").forEach(function(b){b.addEventListener("click",function(){date.value=b.dataset.day;status.textContent="Selected "+new Date(date.value+"T12:00:00").toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})+". Choose an available start time below.";updateTimeOptions();draw();});});
  host.querySelector("#meet-prev").disabled=month<=new Date(today.getFullYear(),today.getMonth(),1);
  host.querySelector("#meet-next").disabled=month>=new Date(today.getFullYear(),today.getMonth()+6,1);
 }
 host.querySelector("#meet-prev").onclick=function(){if(!this.disabled){month=new Date(month.getFullYear(),month.getMonth()-1,1);draw();refreshAvailability();}};
 host.querySelector("#meet-next").onclick=function(){if(!this.disabled){month=new Date(month.getFullYear(),month.getMonth()+1,1);draw();refreshAvailability();}};
 form.querySelectorAll('input[name="application_submitted"]').forEach(function(r){r.addEventListener("change",function(){const no=r.value==="No"&&r.checked;applicationNo=no;host.querySelector("#meet-no-note").hidden=!no;host.querySelector("#meet-submit").disabled=no;host.querySelector("#meet-time").disabled=no;draw();});});
 form.addEventListener("submit",async function(e){
  e.preventDefault();const out=host.querySelector("#meet-status"),button=host.querySelector("#meet-submit");
  if(!form.reportValidity())return;
  if(!form.querySelector('input[name="kittens[]"]:checked')){out.textContent="Please select at least one kitten you’re interested in.";return;}
  if(form.querySelector('input[name="application_submitted"]:checked')?.value!=="Yes"){out.textContent="Please submit an adoption application through the rescue before requesting a private meet-and-greet.";return;}
  if(!date.value||unavailable(new Date(date.value+"T12:00:00"))){out.textContent="That date is unavailable. Please choose another date.";return;}
  button.disabled=true;button.textContent="Sending…";out.textContent="Sending your request. Please wait.";
  try{const selectedTime=host.querySelector("#meet-time").value;const timeMatch=selectedTime.match(/(\d{1,2}):(\d{2})\s*(a\.m\.|p\.m\.)/i);if(!timeMatch)throw new Error("Please choose a valid start time.");let hh=Number(timeMatch[1])%12;if(/p/i.test(timeMatch[3]))hh+=12;const mm=Number(timeMatch[2]);const startsAt=meetLocalIso(date.value,hh,mm);const eventDates=[data.featuredEvent,data.specialEvent].concat(data.additionalSpecialEvents||[]).filter(x=>x&&x.active!==false).map(parts).filter(Boolean).map(p=>key(new Date(p.y,p.m,p.d)));const response=await fetch("https://ovnbbpcrwbvotyevghcx.supabase.co/functions/v1/meet-greet",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"request",first_name:form.elements.first_name.value,last_name:form.elements.last_name.value,email:form.elements.email.value,kittens:Array.from(form.querySelectorAll('input[name="kittens[]"]:checked')).map(x=>x.value),application_submitted:form.querySelector('input[name="application_submitted"]:checked')?.value==="Yes",starts_at:startsAt,additional_notes:form.elements.additional_notes.value,event_dates:eventDates,_honey:form.elements._honey.value})});const result=await response.json();if(!response.ok)throw new Error(result.error||"Your request could not be sent.");form.reset();date.value="";draw();host.querySelector("#meet-no-note").hidden=true;status.textContent="Select an available date on the calendar.";out.textContent="Thank you! Your request has been received. It is not confirmed until we review it and email you.";}
  catch(err){out.textContent="Sorry, your request could not be sent right now. Please try again later or email pawsandpurrsfosters@gmail.com directly.";}
  finally{button.disabled=false;button.textContent="Request a Meet-and-Greet";}
 });
 draw();refreshAvailability();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();