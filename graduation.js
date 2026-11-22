(function(){
  var root=document.querySelector("#newest-graduates");
  var records=Array.isArray(window.PAWS_FOSTER_ALUMNI)?window.PAWS_FOSTER_ALUMNI:[];
  if(!root)return;
  var now=new Date();
  var active=records.filter(function(k){
    if(k.status!=="Adopted"||!k.adoptionDate)return false;
    var adopted=new Date(k.adoptionDate+"T00:00:00");
    var age=now.getTime()-adopted.getTime();
    return Number.isFinite(age)&&age>=0&&age<7*24*60*60*1000;
  });
  if(!active.length)return;
  var used=new Set(),groups=[];
  active.forEach(function(kitten){
    if(used.has(kitten.id))return;
    var partner=kitten.companionId?active.find(function(item){return item.id===kitten.companionId&&!used.has(item.id)&&item.adoptionDate===kitten.adoptionDate;}):null;
    var members=partner?[kitten,partner]:[kitten];
    members.forEach(function(item){used.add(item.id);});
    groups.push(members);
  });
  function esc(value){return String(value==null?"":value).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
  function photosFor(k){
    var list=Array.isArray(k.photos)?k.photos.filter(Boolean):[];
    var ordered=[k.image].concat(list.filter(function(photo){return photo!==k.image;})).filter(Boolean);
    return ordered.length?ordered:[k.image||"assets/main-logo.PNG"];
  }
  var photoSets=groups.map(function(group){return group.map(photosFor);});
  var maxSlides=Math.max.apply(null,[1].concat(photoSets.map(function(group){return Math.max.apply(null,group.map(function(list){return list.length;}));})));
  function dateText(value){return new Intl.DateTimeFormat("en-US",{month:"long",day:"numeric",year:"numeric"}).format(new Date(value+"T12:00:00"));}
  var slides=Array.from({length:maxSlides},function(_,index){
    var group=groups[index%groups.length],sets=photoSets[index%photoSets.length];
    var figures=group.map(function(k,slot){return "<figure><img src=\""+esc(sets[slot][index%sets[slot].length])+"\" alt=\""+esc(k.name)+"\" loading=\""+(index===0?"eager":"lazy")+"\"><figcaption>"+esc(k.name)+"</figcaption></figure>";}).join("");
    var copy=group.map(function(k){return esc(k.description||k.bio||"");}).filter(Boolean).join(" ");
    return "<div class=\"graduate-slide"+(index===0?" is-active":"")+"\" style=\"--graduate-columns:"+group.length+"\">"+figures+"<p class=\"graduate-slide-copy\">"+copy+"</p><p class=\"graduate-date\">Graduated "+group.map(function(k){return dateText(k.adoptionDate);}).join(" · ")+"</p></div>";
  }).join("");
  var controls=maxSlides>1?"<div class=\"graduate-controls\"><button type=\"button\" data-graduate-prev aria-label=\"Previous graduation photo\">‹</button><div class=\"graduate-dots\">"+Array.from({length:maxSlides},function(_,i){return "<button class=\"graduate-dot\" type=\"button\" data-graduate-dot=\""+i+"\" aria-label=\"Show photo "+(i+1)+"\" aria-pressed=\""+(i===0)+"\"></button>";}).join("")+"</div><button type=\"button\" data-graduate-next aria-label=\"Next graduation photo\">›</button></div>":"";
  root.innerHTML="<div class=\"graduate-celebration__banner\"><div class=\"graduate-celebration__heading\"><p class=\"eyebrow\">A new chapter begins</p><h2>Celebrating Our Newest Graduates</h2><p>Celebrating the kittens who have recently found their forever homes.</p></div><div class=\"graduate-slides\" aria-label=\"Recently adopted foster kittens\">"+slides+"</div>"+controls+"</div>";
  root.hidden=false;
  var slideNodes=Array.from(root.querySelectorAll(".graduate-slide")),dots=Array.from(root.querySelectorAll("[data-graduate-dot]"));
  var current=0,timer=null;
  function show(index){current=(index+slideNodes.length)%slideNodes.length;slideNodes.forEach(function(el,i){el.classList.toggle("is-active",i===current);});dots.forEach(function(el,i){el.setAttribute("aria-pressed",String(i===current));});}
  root.querySelector("[data-graduate-prev]")?.addEventListener("click",function(){show(current-1);});
  root.querySelector("[data-graduate-next]")?.addEventListener("click",function(){show(current+1);});
  dots.forEach(function(dot){dot.addEventListener("click",function(){show(Number(dot.dataset.graduateDot));});});
  if(slideNodes.length>1&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches)timer=window.setInterval(function(){show(current+1);},5500);
  root.addEventListener("mouseenter",function(){if(timer){clearInterval(timer);timer=null;}});
  root.addEventListener("mouseleave",function(){if(!timer&&slideNodes.length>1&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches)timer=window.setInterval(function(){show(current+1);},5500);});
})();