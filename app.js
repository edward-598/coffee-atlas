let db;
const app=document.querySelector("#app");
const nav=[...document.querySelectorAll(".bottom-nav button")];

const by=(arr,id)=>arr.find(x=>x.id===id);
const tags=a=>`<div class="meta">${(a||[]).map(x=>`<span class="tag">${x}</span>`).join("")}</div>`;
const crumb=(items)=>`<div class="breadcrumb">${items.map((x,i)=>`${i?"›":""}<button data-route="${x.route}">${x.label}</button>`).join("")}</div>`;
function setNav(route){nav.forEach(b=>b.classList.toggle("active",b.dataset.route===route))}
function card(title,sub,meta,route){return `<button class="card" data-route="${route}"><div class="eyebrow">${sub}</div><h3>${title}</h3>${tags(meta)}</button>`}
function route(r){
  location.hash=r;
  render(r);
  scrollTo({top:0,behavior:"smooth"});
}
function render(r=(location.hash.slice(1)||"home")){
  setNav(r.split("/")[0]);
  const p=r.split("/");
  if(r==="home") return home();
  if(r==="explore") return explore();
  if(p[0]==="country") return country(p[1]);
  if(p[0]==="region") return region(p[1]);
  if(p[0]==="station") return station(p[1]);
  if(p[0]==="bean") return bean(p[1]);
  if(r==="search") return search();
  if(r==="learn") return learn();
  if(r==="roasters") return roasters();
  home();
}
function home(){
 app.innerHTML=`<section class="hero"><div class="eyebrow">From origin to cup</div><h1>Coffee<br>Atlas</h1><div class="globe"></div><p>從世界、產區到一杯咖啡。<br>探索咖啡從哪裡來，以及它為什麼有這個味道。</p><button class="primary" data-route="explore">開始探索</button></section>`;
}
function explore(){
 app.innerHTML=`<div class="eyebrow">Explore the world</div><h1 class="page-title">Coffee Origins</h1><p class="intro">V1 先用輕量視覺建立世界入口。真正的 Three.js 地球會在資料與操作流程穩定後接上。</p><div class="globe" style="margin:28px auto"></div><div class="section-title">POPULAR ORIGINS</div><div class="grid">${db.countries.map(c=>card(`${c.name}<br><small>${c.zh}</small>`,c.tagline,c.profile,`country/${c.id}`)).join("")}</div>`;
}
function country(id){
 const c=by(db.countries,id); if(!c)return explore();
 const regs=db.regions.filter(x=>x.country===id);
 app.innerHTML=crumb([{label:"WORLD",route:"explore"}])+`<div class="subtitle">${c.tagline}</div><h1 class="page-title">${c.name}</h1><h2>${c.zh}</h2><p class="intro">${c.intro}</p><div class="section-title">EXPLORE REGIONS</div><div class="grid">${regs.length?regs.map(x=>card(`${x.name}<br><small>${x.zh}</small>`,x.altitude,x.profile,`region/${x.id}`)).join(""):`<div class="empty">這個國家會在後續資料批次擴充。</div>`}</div>`;
}
function region(id){
 const x=by(db.regions,id), c=by(db.countries,x?.country); if(!x)return explore();
 const sts=db.stations.filter(s=>s.region===id);
 app.innerHTML=crumb([{label:c.name,route:`country/${c.id}`},{label:x.name,route:`region/${x.id}`}])+`<div class="subtitle">${c.name}</div><h1 class="page-title">${x.name}</h1><h2>${x.zh}</h2><div class="stat-grid"><div class="stat"><small>Altitude</small><strong>${x.altitude}</strong></div><div class="stat"><small>Known for</small><strong>${x.profile.join(" · ")}</strong></div></div><p class="intro">${x.intro}</p><div class="section-title">STATIONS / FARMS</div><div class="grid">${sts.length?sts.map(s=>card(`${s.name}<br><small>${s.zh}</small>`,s.type,s.profile,`station/${s.id}`)).join(""):`<div class="empty">處理場資料待擴充。</div>`}</div>`;
}
function station(id){
 const s=by(db.stations,id), r=by(db.regions,s?.region), c=by(db.countries,r?.country); if(!s)return explore();
 const bs=db.beans.filter(b=>b.station===id);
 app.innerHTML=crumb([{label:c.name,route:`country/${c.id}`},{label:r.name,route:`region/${r.id}`},{label:s.name,route:`station/${s.id}`}])+`<div class="subtitle">${s.type}</div><h1 class="page-title">${s.name}</h1><h2>${s.zh}</h2><div class="stat-grid"><div class="stat"><small>Altitude</small><strong>${s.altitude}</strong></div><div class="stat"><small>Region</small><strong>${r.name}</strong></div></div><div class="section-title">ABOUT</div><p class="intro">${s.intro}</p><div class="section-title">COMMON PROFILE</div>${tags(s.profile)}<div class="section-title">BEANS FROM HERE</div><div class="grid">${bs.map(b=>card(b.name,`${b.process} · ${b.variety}`,b.flavors,`bean/${b.id}`)).join("")||`<div class="empty">Bean / Lot 待新增。</div>`}</div>`;
}
function bean(id){
 const b=by(db.beans,id),s=by(db.stations,b?.station),r=by(db.regions,s?.region),c=by(db.countries,r?.country); if(!b)return explore();
 const bars=[["Sweetness",b.sweetness],["Acidity",b.acidity],["Body",b.body]].map(([n,v])=>`<div class="bar-row"><span>${n}</span><div class="bar"><i style="width:${v*20}%"></i></div><b>${v}</b></div>`).join("");
 app.innerHTML=crumb([{label:r.name,route:`region/${r.id}`},{label:s.name,route:`station/${s.id}`},{label:"BEAN",route:`bean/${b.id}`}])+`<div class="subtitle">${c.name} · ${r.name}</div><h1 class="page-title">${b.name}</h1>${tags(b.flavors)}<div class="profile">${bars}</div><div class="stat-grid"><div class="stat"><small>Altitude</small><strong>${b.altitude}</strong></div><div class="stat"><small>Process</small><strong>${b.process}</strong></div><div class="stat"><small>Variety</small><strong>${b.variety}</strong></div><div class="stat"><small>From</small><strong>${s.name}</strong></div></div><button class="card" data-route="station/${s.id}"><div class="eyebrow">Explore the station</div><h3>${s.name}</h3><p>${s.zh}</p></button>`;
}
function search(){
 app.innerHTML=`<div class="eyebrow">Global Search</div><h1 class="page-title">Search</h1><input id="q" class="searchbox" type="search" placeholder="國家、產區、處理場、風味、處理法…"><div id="results"></div>`;
 const q=document.querySelector("#q"),out=document.querySelector("#results");
 const run=()=>{
  const k=q.value.trim().toLowerCase();
  if(!k){out.innerHTML=`<p class="note">不知道它是國家、產區還是處理場也沒關係，記得名字或風味的一部分就可以搜尋。</p>`;return}
  const items=[
   ...db.countries.map(x=>({...x,_type:"Country",_route:`country/${x.id}`})),
   ...db.regions.map(x=>({...x,_type:"Region",_route:`region/${x.id}`})),
   ...db.stations.map(x=>({...x,_type:"Station / Farm",_route:`station/${x.id}`})),
   ...db.beans.map(x=>({...x,_type:"Bean",_route:`bean/${x.id}`}))
  ].filter(x=>JSON.stringify(x).toLowerCase().includes(k));
  out.innerHTML=`<div class="section-title">${items.length} RESULTS</div><div class="grid">${items.map(x=>card(`${x.name}${x.zh?`<br><small>${x.zh}</small>`:""}`,x._type,x.profile||x.flavors||[],x._route)).join("")}</div>`;
 };
 q.addEventListener("input",run);run();
}
function learn(){
 app.innerHTML=`<div class="eyebrow">Coffee Basics</div><h1 class="page-title">Learn</h1><p class="intro">V1 先保留最常查的沖煮參數。實際沖煮仍需依豆子、磨豆機與個人口味微調。</p><div class="grid">${db.brews.map(x=>`<article class="card" style="cursor:default"><h3>${x.name}</h3><div class="stat-grid"><div class="stat"><small>Water</small><strong>${x.temp}</strong></div><div class="stat"><small>Ratio</small><strong>${x.ratio}</strong></div><div class="stat"><small>Time</small><strong>${x.time}</strong></div><div class="stat"><small>Grind</small><strong>${x.grind}</strong></div></div><p>適合：${x.roast}</p></article>`).join("")}</div>`;
}
function roasters(){
 const month=db.roasters[0]?.month||"";
 app.innerHTML=`<div class="eyebrow">${month}</div><h1 class="page-title">Roasters<br>of the Month</h1><p class="intro">圖片不是必要條件。正式月選會以文字介紹為主，並保留國家、城市與完整地址。</p><div class="grid">${db.roasters.map(x=>`<article class="card roaster"><div class="eyebrow">${x.country} · ${x.city}</div><h3>${x.name}</h3><p class="address">📍 ${x.address}</p><h4>ABOUT</h4><p>${x.about}</p><h4>SPACE</h4><p>${x.space}</p><h4>COFFEE</h4><p>${x.coffee}</p><h4>FOOD</h4><p>${x.food}</p><h4>WHY WE PICKED IT</h4><p>${x.why}</p></article>`).join("")}</div>`;
}
document.addEventListener("click",e=>{const b=e.target.closest("[data-route]");if(b)route(b.dataset.route)});
addEventListener("hashchange",()=>render());
fetch("data/atlas.json").then(r=>r.json()).then(x=>{db=x;render()}).catch(()=>app.innerHTML=`<div class="empty">資料載入失敗，請確認 data/atlas.json 已上傳。</div>`);
