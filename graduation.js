(function(){
  var root=document.querySelector("#newest-graduates");
  var records=Array.isArray(window.PAWS_FOSTER_ALUMNI)?window.PAWS_FOSTER_ALUMNI:[];
  if(!root)return;
  var now=new Date(),todayStart=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  function daysSinceDate(value){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(String(value||"")))return -1;
    var parts=value.split("-").map(Number),adopted=new Date(parts[0],parts[1]-1,parts[2]);
    if(adopted.getFullYear()!==parts[0]||adopted.getMonth()!==parts[1]-1||adopted.getDate()!==parts[2])return -1;
    return Math.round((todayStart-adopted)/86400000);
  }
  var active=records.filter(function(k){
    if(k.status!=="Adopted"||!k.adoptionDate)return false;
    var age=daysSinceDate(k.adoptionDate);
    return age>=0&&age<7;
  }).sort(function(a,b){return b.adoptionDate.localeCompare(a.adoptionDate);});
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
    if(k.image)list=[k.image].concat(list.filter(function(photo){return photo!==k.image;}));
    return list.length?list:[k.image||"assets/main-logo.PNG"];
  }
  function dateText(value){return new Intl.DateTimeFormat("en-US",{month:"long",day:"numeric",year:"numeric"}).format(new Date(value+"T12:00:00"));}
  function groupMarkup(group,groupIndex){
    var names=group.map(function(k){return k.name;}).join(" & ");
    var linkedNames=group.map(function(k){return "<a class=\"graduate-card__name-link\" href=\"foster-alumni/#alumni-"+encodeURIComponent(k.id)+"\">"+esc(k.name)+"</a>";}).join("");
    var photoSets=group.map(photosFor);
    var frames=[];
    var count=Math.max.apply(null,photoSets.map(function(list){return list.length;}));
    for(var index=0;index<count;index++)frames.push({index:index});
    var slides=frames.map(function(frame,index){
      var figures=group.map(function(k,slot){
            var photo=photoSets[slot][frame.index%photoSets[slot].length];
            return "<figure><img src=\""+esc(photo)+"\" alt=\""+esc(k.name)+"\" loading=\""+(index===0?"eager":"lazy")+"\"></figure>";
          }).join("");
      return "<div class=\"graduate-photo-slide"+(index===0?" is-active":"")+"\" style=\"--graduate-columns:"+group.length+"\">"+figures+"</div>";
    }).join("");
    var description=group.map(function(k){return k.graduationDescription||"";}).find(Boolean)
      ||(group.length>1?group.map(function(k){return k.description||k.bio||"";}).filter(Boolean).join(" "):(group[0].description||group[0].bio||""));
    return "<article class=\"graduate-card\" data-graduate-card=\""+groupIndex+"\">"
      +"<div class=\"graduate-photo-slides\" aria-label=\"Photos of "+esc(names)+"\">"+slides+"</div>"
      +"<div class=\"graduate-card__names\" aria-label=\""+esc(names)+"\">"+group.map(function(k){return "<a class=\"graduate-card__name-link\" href=\"foster-alumni/#alumni-"+encodeURIComponent(k.id)+"\">"+esc(k.name)+"</a>";}).join("")+"</div>"
      +"<p class=\"graduate-card__copy\">"+esc(description)+"</p>"
      +"<p class=\"graduate-date\">Graduated "+dateText(group[0].adoptionDate)+"</p>"
      +"</article>";
  }
  root.innerHTML="<div class=\"graduate-celebration__banner\">"
    +"<div class=\"graduate-celebration__heading\"><h2>Celebrating Our Newest Graduates</h2><p>We are celebrating our newest graduates all week as they begin their happy new chapters in their forever homes!</p></div>"
    +"<div class=\"graduate-grid"+(groups.length>1?" has-multiple-graduates":" has-single-graduate")+"\">"+groups.map(groupMarkup).join("")+"</div></div>";
  root.hidden=false;
  root.querySelectorAll(".graduate-card").forEach(function(card){
    var slides=Array.from(card.querySelectorAll(".graduate-photo-slide"));
    if(slides.length<2||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
    var current=0;
    window.setInterval(function(){
      slides[current].classList.remove("is-active");
      current=(current+1)%slides.length;
      slides[current].classList.add("is-active");
    },5600);
  });
})();