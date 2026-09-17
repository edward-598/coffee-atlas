let db;const app=document.querySelector("#app"),K="coffeeAtlasFavorites";const by=(a,id)=>a.find(x=>x.id===id),tags=a=>`<div class="tags">${(a||[]).map(x=>`<span class="tag">${x}</span>`).join("")}</div>`,F=()=>{try{return JSON.parse(localStorage.getItem(K)||"[]")}catch{return[]}},saved=id=>F().includes(id);function toggle(id){let f=F();f=f.includes(id)?f.filter(x=>x!==id):[...f,id];localStorage.setItem(K,JSON.stringify(f));render()}function close(){document.querySelector("#menu")?.classList.remove("open");document.querySelector("#shade")?.classList.remove("open")}function go(r){close();location.hash=r;render();scrollTo(0,0)}function card(x,type,route){return `<button class="card" data-route="${route}"><div class="eyebrow">${type}</div><h3>${x.name}${x.zh?`<br><small>${x.zh}</small>`:""}</h3>${tags(x.profile||x.flavors)}</button>`}function crumb(s){return `<div class="crumb">${s}</div>`}function render(){let r=location.hash.slice(1)||"home",p=r.split("/");if(r==="home")return app.innerHTML=`<section class="hero"><div class="eyebrow">From origin to cup</div><h1 class="title">Coffee<br>Atlas</h1><div class="globe"></div><p class="intro">從世界、產區到一杯咖啡。</p><button class="primary" data-route="explore">開始探索</button></section>`;if(r==="explore")return app.innerHTML=`<div class="eyebrow">Explore the world</div><h1 class="title">Coffee Origins</h1><div class="globe"></div><div class="grid">${db.countries.map(x=>card(x,"Origin",`country/${x.id}`)).join("")}</div>`;if(p[0]==="country"){let c=by(db.countries,p[1]),a=db.regions.filter(x=>x.country===c.id);return app.innerHTML=crumb(`<button data-route="explore">WORLD</button> › ${c.name}`)+`<h1 class="title">${c.name}</h1><h2>${c.zh}</h2>${tags(c.profile)}<div class="section">REGIONS</div><div class="grid">${a.map(x=>card(x,x.altitude,`region/${x.id}`)).join("")||'<div class="empty">後續擴充</div>'}</div>`}if(p[0]==="region"){let x=by(db.regions,p[1]),a=db.stations.filter(s=>s.region===x.id);return app.innerHTML=crumb(x.name)+`<h1 class="title">${x.name}</h1><h2>${x.zh}</h2><div class="stats"><div class="stat"><small>Altitude</small>${x.altitude}</div><div class="stat"><small>Known for</small>${x.profile.join(" · ")}</div></div><div class="section">STATIONS / FARMS</div><div class="grid">${a.map(s=>card(s,s.type,`station/${s.id}`)).join("")||'<div class="empty">後續擴充</div>'}</div>`}if(p[0]==="station"){let s=by(db.stations,p[1]),a=db.beans.filter(b=>b.station===s.id);return app.innerHTML=crumb(s.name)+`<h1 class="title">${s.name}</h1><h2>${s.zh}</h2><p class="intro">${s.intro}</p>${tags(s.profile)}<div class="section">BEANS FROM HERE</div><div class="grid">${a.map(b=>card(b,`${b.process} · ${b.variety}`,`bean/${b.id}`)).join("")}</div>`}if(p[0]==="bean"){let b=by(db.beans,p[1]),s=by(db.stations,b.station);return app.innerHTML=crumb(s.name)+`<h1 class="title">${b.name}</h1><button class="fav ${saved(b.id)?"saved":""}" data-fav="${b.id}">${saved(b.id)?"♥":"♡"}</button>${tags(b.flavors)}<div class="stats"><div class="stat"><small>Altitude</small>${b.altitude}</div><div class="stat"><small>Process</small>${b.process}</div><div class="stat"><small>Variety</small>${b.variety}</div><div class="stat"><small>From</small>${s.name}</div></div><p class="intro">Sweetness ${b.sweetness}/5 · Acidity ${b.acidity}/5 · Body ${b.body}/5</p>`}if(r==="favorites"){let a=F().map(id=>by(db.beans,id)).filter(Boolean);return app.innerHTML=`<div class="eyebrow">My collection</div><h1 class="title">My Beans</h1><p class="intro">${a.length} 支喜愛的咖啡豆</p><div class="grid">${a.map(b=>card(b,`${b.process} · ${b.variety}`,`bean/${b.id}`)).join("")||'<div class="empty">還沒有收藏。<br>進入 Bean Card 按 ♡ 即可加入。</div>'}</div>`}if(r==="search"){app.innerHTML=`<div class="eyebrow">Global search</div><h1 class="title">Search</h1><input id="q" class="search" placeholder="國家、產區、處理場、風味…"><div id="res"></div>`;const qEl=document.querySelector("#q"),resEl=document.querySelector("#res");qEl.oninput=()=>{let k=qEl.value.toLowerCase(),a=[...db.countries.map(x=>[x,"Country",`country/${x.id}`]),...db.regions.map(x=>[x,"Region",`region/${x.id}`]),...db.stations.map(x=>[x,"Station",`station/${x.id}`]),...db.beans.map(x=>[x,"Bean",`bean/${x.id}`])].filter(([x])=>JSON.stringify(x).toLowerCase().includes(k)&&k);resEl.innerHTML=`<div class="section">${a.length} RESULTS</div><div class="grid">${a.map(([x,t,r])=>card(x,t,r)).join("")}</div>`};return}if(r==="learn")return app.innerHTML=`<div class="eyebrow">Coffee basics</div><h1 class="title">Learn</h1><div class="grid">${db.brews.map(x=>`<article class="card"><h3>${x.name}</h3><p>${x.temp} · ${x.ratio}<br>${x.time} · ${x.roast}</p></article>`).join("")}</div>`;if(r==="roasters")return app.innerHTML=`<div class="eyebrow">Monthly editorial</div><h1 class="title">Roasters of the Month</h1><p class="intro">V1.5 保留文字型月選版型：國家、城市、完整地址、品牌、空間、咖啡、餐食與推薦理由。圖片非必要。</p>`}

/* =========================================================
   V1.5.2 — DOM REFERENCES
   ========================================================= */

const menuToggle = document.querySelector("#menuToggle");
const mobileMenu = document.querySelector("#mobileMenu");
const menuClose = document.querySelector("#menuClose");
const menuBackdrop = document.querySelector("#menuBackdrop");

const MOBILE_BREAKPOINT = 760;


/* =========================================================
   V1.5.2 — MOBILE NAVBAR
   ========================================================= */

function openMobileMenu() {
  mobileMenu.classList.add("is-open");
  menuBackdrop.classList.add("is-open");

  mobileMenu.setAttribute("aria-hidden", "false");
  menuBackdrop.setAttribute("aria-hidden", "false");
  menuToggle.setAttribute("aria-expanded", "true");
}

function closeMobileMenu() {
  mobileMenu.classList.remove("is-open");
  menuBackdrop.classList.remove("is-open");

  mobileMenu.setAttribute("aria-hidden", "true");
  menuBackdrop.setAttribute("aria-hidden", "true");
  menuToggle.setAttribute("aria-expanded", "false");
}

menuToggle.addEventListener("click", function (event) {
  event.preventDefault();
  event.stopPropagation();
  openMobileMenu();
});

menuClose.addEventListener("click", function (event) {
  event.preventDefault();
  closeMobileMenu();
});

menuBackdrop.addEventListener("click", function () {
  closeMobileMenu();
});


/* =========================================================
   V1.5.2 — RWD STATE SYNC
   Important for Chrome/F12 and resizing desktop windows.
   ========================================================= */

const mobileMedia = window.matchMedia(
  `(max-width: ${MOBILE_BREAKPOINT - 1}px)`
);

function syncResponsiveNavigation(event) {
  if (!event.matches) {
    closeMobileMenu();
  }
}

if (mobileMedia.addEventListener) {
  mobileMedia.addEventListener("change", syncResponsiveNavigation);
} else {
  // Safari compatibility
  mobileMedia.addListener(syncResponsiveNavigation);
}


/* =========================================================
   GLOBAL CLICK ROUTING
   ========================================================= */

document.addEventListener("click", function (event) {
  const favoriteButton = event.target.closest("[data-fav]");

  if (favoriteButton) {
    toggle(favoriteButton.dataset.fav);
    return;
  }

  const routeButton = event.target.closest("[data-route]");

  if (routeButton) {
    closeMobileMenu();
    go(routeButton.dataset.route);
  }
});


/* =========================================================
   APP START
   ========================================================= */

window.addEventListener("hashchange", render);

fetch("data/atlas.json")
  .then(function (response) {
    if (!response.ok) {
      throw new Error("atlas.json 載入失敗");
    }

    return response.json();
  })
  .then(function (data) {
    db = data;
    render();
  })
  .catch(function (error) {
    console.error(error);

    app.innerHTML = `
      <div class="empty">
        資料載入失敗，請確認 data/atlas.json 已正確上傳。
      </div>
    `;
  });
