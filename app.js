let db;

const app = document.querySelector("#app");
const K = "coffeeAtlasFavorites";

const by = (a, id) => (a || []).find((x) => x.id === id);

const tags = (a) =>
  `<div class="tags">${(a || [])
    .filter(Boolean)
    .map((x) => `<span class="tag">${x}</span>`)
    .join("")}</div>`;

const F = () => {
  try {
    return JSON.parse(localStorage.getItem(K) || "[]");
  } catch {
    return [];
  }
};

const saved = (id) => F().includes(id);

function toggle(id) {
  let f = F();

  f = f.includes(id)
    ? f.filter((x) => x !== id)
    : [...f, id];

  localStorage.setItem(K, JSON.stringify(f));
  render();
}

function go(route) {
  closeMobileMenu();

  const nextHash = `#${route}`;

  if (location.hash === nextHash) {
    render();
  } else {
    location.hash = route;
  }

  window.scrollTo(0, 0);
}

function card(x, type, route) {
  if (!x) return "";

  return `
    <button class="card" data-route="${route}">
      <div class="eyebrow">${type || ""}</div>

      <h3>
        ${x.name || ""}
        ${x.zh ? `<br><small>${x.zh}</small>` : ""}
      </h3>

      ${tags(x.profile || x.flavors)}
    </button>
  `;
}

function crumb(content) {
  return `<div class="crumb">${content}</div>`;
}

function emptyPage(message) {
  app.innerHTML = `
    <div class="empty">
      ${message}
      <br><br>
      <button class="primary" data-route="explore">
        BACK TO EXPLORE
      </button>
    </div>
  `;
}

function scoreText(bean) {
  const scores = [];

  if (bean.sweetness !== null && bean.sweetness !== undefined) {
    scores.push(`Sweetness ${bean.sweetness}/5`);
  }

  if (bean.acidity !== null && bean.acidity !== undefined) {
    scores.push(`Acidity ${bean.acidity}/5`);
  }

  if (bean.body !== null && bean.body !== undefined) {
    scores.push(`Body ${bean.body}/5`);
  }

  if (!scores.length) return "";

  return `<p class="intro">${scores.join(" · ")}</p>`;
}


/* =========================================================
   V1.6.3 — MAIN RENDER
   ========================================================= */

function render() {
  if (!db) return;

  const route = location.hash.slice(1) || "home";
  const parts = route.split("/");


  /* HOME */

  if (route === "home") {
    app.innerHTML = `
      <section class="hero">
        <div class="eyebrow">From origin to cup</div>

        <h1 class="title">
          Coffee<br>Atlas
        </h1>

        <div class="globe"></div>

        <p class="intro">
          從世界、產區到一杯咖啡。
        </p>

        <button class="primary" data-route="explore">
          開始探索
        </button>
      </section>
    `;

    return;
  }


  /* EXPLORE */

  if (route === "explore") {
    app.innerHTML = `
      <div class="eyebrow">
        Explore the world
      </div>

      <h1 class="title">
        Coffee Origins
      </h1>

      <div class="globe"></div>

      <div class="grid">
        ${(db.countries || [])
          .map((x) =>
            card(
              x,
              "Origin",
              `country/${x.id}`
            )
          )
          .join("")}
      </div>
    `;

    return;
  }


  /* COUNTRY */

  if (parts[0] === "country") {
    const country = by(
      db.countries,
      parts[1]
    );

    if (!country) {
      emptyPage("找不到這個 Coffee Origin。");
      return;
    }

    const regions = (db.regions || []).filter(
      (x) => x.country === country.id
    );

    app.innerHTML =
      crumb(`
        <button data-route="explore">
          WORLD
        </button>
        ›
        ${country.name}
      `) +
      `
        <h1 class="title">
          ${country.name}
        </h1>

        <h2>
          ${country.zh || ""}
        </h2>

        ${tags(country.profile)}

        <div class="section">
          REGIONS
        </div>

        <div class="grid">
          ${
            regions
              .map((x) =>
                card(
                  x,
                  x.altitude || "Region",
                  `region/${x.id}`
                )
              )
              .join("") ||
            `
              <div class="empty">
                後續擴充
              </div>
            `
          }
        </div>
      `;

    return;
  }


  /* REGION */

  if (parts[0] === "region") {
    const region = by(
      db.regions,
      parts[1]
    );

    if (!region) {
      emptyPage("找不到這個 Coffee Region。");
      return;
    }

    const stations = (db.stations || []).filter(
      (station) =>
        station.region === region.id
    );

    const profileText = Array.isArray(region.profile)
      ? region.profile.join(" · ")
      : region.profile || "";

    app.innerHTML =
      crumb(region.name) +
      `
        <h1 class="title">
          ${region.name}
        </h1>

        <h2>
          ${region.zh || ""}
        </h2>

        <div class="stats">

          ${
            region.altitude
              ? `
                <div class="stat">
                  <small>Altitude</small>
                  ${region.altitude}
                </div>
              `
              : ""
          }

          ${
            profileText
              ? `
                <div class="stat">
                  <small>Known for</small>
                  ${profileText}
                </div>
              `
              : ""
          }

        </div>

        <div class="section">
          STATIONS / FARMS
        </div>

        <div class="grid">
          ${
            stations
              .map((station) =>
                card(
                  station,
                  station.type || "Station / Farm",
                  `station/${station.id}`
                )
              )
              .join("") ||
            `
              <div class="empty">
                後續擴充
              </div>
            `
          }
        </div>
      `;

    return;
  }


  /* STATION / FARM */

  if (parts[0] === "station") {
    const station = by(
      db.stations,
      parts[1]
    );

    if (!station) {
      emptyPage("找不到這個 Station / Farm。");
      return;
    }

    const beans = (db.beans || []).filter(
      (bean) =>
        bean.station === station.id
    );

    app.innerHTML =
      crumb(station.name) +
      `
        <h1 class="title">
          ${station.name}
        </h1>

        <h2>
          ${station.zh || ""}
        </h2>

        ${
          station.intro
            ? `
              <p class="intro">
                ${station.intro}
              </p>
            `
            : ""
        }

        ${tags(station.profile)}

        <div class="section">
          BEANS FROM HERE
        </div>

        <div class="grid">

          ${
            beans
              .map((bean) =>
                card(
                  bean,
                  [
                    bean.process,
                    bean.variety
                  ]
                    .filter(Boolean)
                    .join(" · "),
                  `bean/${bean.id}`
                )
              )
              .join("") ||
            `
              <div class="empty">
                目前尚未建立 Coffee Bean / Lot。
              </div>
            `
          }

        </div>
      `;

    return;
  }


  /* BEAN */

  if (parts[0] === "bean") {
    const bean = by(
      db.beans,
      parts[1]
    );

    if (!bean) {
      emptyPage("找不到這支 Coffee Bean。");
      return;
    }

    const station = by(
      db.stations,
      bean.station
    );

    app.innerHTML =
      crumb(
        station
          ? `
            <button
              data-route="station/${station.id}"
            >
              ${station.name}
            </button>
          `
          : "Coffee Atlas"
      ) +
      `
        <h1 class="title">
          ${bean.name}
        </h1>

        <button
          class="fav ${
            saved(bean.id)
              ? "saved"
              : ""
          }"
          data-fav="${bean.id}"
          aria-label="Favorite"
        >
          ${
            saved(bean.id)
              ? "♥"
              : "♡"
          }
        </button>

        ${tags(bean.flavors)}

        <div class="stats">

          ${
            bean.altitude
              ? `
                <div class="stat">
                  <small>Altitude</small>
                  ${bean.altitude}
                </div>
              `
              : ""
          }

          ${
            bean.process
              ? `
                <div class="stat">
                  <small>Process</small>
                  ${bean.process}
                </div>
              `
              : ""
          }

          ${
            bean.variety
              ? `
                <div class="stat">
                  <small>Variety</small>
                  ${bean.variety}
                </div>
              `
              : ""
          }

          ${
            station
              ? `
                <button
                  class="stat"
                  data-route="station/${station.id}"
                >
                  <small>From</small>
                  ${station.name}
                </button>
              `
              : ""
          }

        </div>

        ${scoreText(bean)}
      `;

    return;
  }


  /* FAVORITES */

  if (route === "favorites") {
    const beans = F()
      .map((id) =>
        by(db.beans, id)
      )
      .filter(Boolean);

    app.innerHTML = `
      <div class="eyebrow">
        My collection
      </div>

      <h1 class="title">
        My Beans
      </h1>

      <p class="intro">
        ${beans.length} 支喜愛的咖啡豆
      </p>

      <div class="grid">

        ${
          beans
            .map((bean) =>
              card(
                bean,
                [
                  bean.process,
                  bean.variety
                ]
                  .filter(Boolean)
                  .join(" · "),
                `bean/${bean.id}`
              )
            )
            .join("") ||
          `
            <div class="empty">
              還沒有收藏。
              <br>
              進入 Bean Card 按 ♡ 即可加入。
            </div>
          `
        }

      </div>
    `;

    return;
  }


  /* SEARCH */

  if (route === "search") {
    app.innerHTML = `
      <div class="eyebrow">
        Global search
      </div>

      <h1 class="title">
        Search
      </h1>

      <input
        id="q"
        class="search"
        placeholder="國家、產區、處理場、風味…"
        autocomplete="off"
      >

      <div id="res"></div>
    `;

    const qEl =
      document.querySelector("#q");

    const resEl =
      document.querySelector("#res");

    qEl.addEventListener(
      "input",
      function () {
        const keyword =
          qEl.value
            .trim()
            .toLowerCase();

        if (!keyword) {
          resEl.innerHTML = "";
          return;
        }

        const searchable = [
          ...(db.countries || []).map(
            (x) => [
              x,
              "Country",
              `country/${x.id}`
            ]
          ),

          ...(db.regions || []).map(
            (x) => [
              x,
              "Region",
              `region/${x.id}`
            ]
          ),

          ...(db.stations || []).map(
            (x) => [
              x,
              "Station",
              `station/${x.id}`
            ]
          ),

          ...(db.beans || []).map(
            (x) => [
              x,
              "Bean",
              `bean/${x.id}`
            ]
          )
        ];

        const results =
          searchable.filter(
            ([item]) =>
              JSON.stringify(item)
                .toLowerCase()
                .includes(keyword)
          );

        resEl.innerHTML = `
          <div class="section">
            ${results.length} RESULTS
          </div>

          <div class="grid">
            ${results
              .map(
                ([item, type, route]) =>
                  card(
                    item,
                    type,
                    route
                  )
              )
              .join("")}
          </div>
        `;
      }
    );

    return;
  }


  /* LEARN */

  if (route === "learn") {
    app.innerHTML = `
      <div class="eyebrow">
        Coffee basics
      </div>

      <h1 class="title">
        Learn
      </h1>

      <div class="grid">

        ${(db.brews || [])
          .map(
            (x) => `
              <article class="card">
                <h3>
                  ${x.name}
                </h3>

                <p>
                  ${x.temp || ""}
                  ${
                    x.ratio
                      ? ` · ${x.ratio}`
                      : ""
                  }

                  <br>

                  ${x.time || ""}
                  ${
                    x.roast
                      ? ` · ${x.roast}`
                      : ""
                  }
                </p>
              </article>
            `
          )
          .join("")}

      </div>
    `;

    return;
  }


  /* ROASTERS */

  if (route === "roasters") {
    app.innerHTML = `
      <div class="eyebrow">
        Monthly editorial
      </div>

      <h1 class="title">
        Roasters of the Month
      </h1>

      <p class="intro">
        V1.5 保留文字型月選版型：
        國家、城市、完整地址、品牌、
        空間、咖啡、餐食與推薦理由。
        圖片非必要。
      </p>
    `;

    return;
  }


  /* UNKNOWN ROUTE */

  emptyPage("找不到這個 Coffee Atlas 頁面。");
}


/* =========================================================
   V1.5.2 — DOM REFERENCES
   ========================================================= */

const menuToggle =
  document.querySelector("#menuToggle");

const mobileMenu =
  document.querySelector("#mobileMenu");

const menuClose =
  document.querySelector("#menuClose");

const menuBackdrop =
  document.querySelector("#menuBackdrop");

const MOBILE_BREAKPOINT = 760;


/* =========================================================
   V1.5.2 — MOBILE NAVBAR
   ========================================================= */

function openMobileMenu() {
  mobileMenu?.classList.add("is-open");
  menuBackdrop?.classList.add("is-open");

  mobileMenu?.setAttribute(
    "aria-hidden",
    "false"
  );

  menuBackdrop?.setAttribute(
    "aria-hidden",
    "false"
  );

  menuToggle?.setAttribute(
    "aria-expanded",
    "true"
  );
}

function closeMobileMenu() {
  mobileMenu?.classList.remove("is-open");
  menuBackdrop?.classList.remove("is-open");

  mobileMenu?.setAttribute(
    "aria-hidden",
    "true"
  );

  menuBackdrop?.setAttribute(
    "aria-hidden",
    "true"
  );

  menuToggle?.setAttribute(
    "aria-expanded",
    "false"
  );
}

menuToggle?.addEventListener(
  "click",
  function (event) {
    event.preventDefault();
    event.stopPropagation();

    openMobileMenu();
  }
);

menuClose?.addEventListener(
  "click",
  function (event) {
    event.preventDefault();

    closeMobileMenu();
  }
);

menuBackdrop?.addEventListener(
  "click",
  function () {
    closeMobileMenu();
  }
);


/* =========================================================
   V1.5.2 — RWD STATE SYNC
   ========================================================= */

const mobileMedia =
  window.matchMedia(
    `(max-width: ${
      MOBILE_BREAKPOINT - 1
    }px)`
  );

function syncResponsiveNavigation(event) {
  if (!event.matches) {
    closeMobileMenu();
  }
}

if (mobileMedia.addEventListener) {
  mobileMedia.addEventListener(
    "change",
    syncResponsiveNavigation
  );
} else {
  mobileMedia.addListener(
    syncResponsiveNavigation
  );
}


/* =========================================================
   GLOBAL CLICK ROUTING
   ========================================================= */

document.addEventListener(
  "click",
  function (event) {
    const favoriteButton =
      event.target.closest("[data-fav]");

    if (favoriteButton) {
      toggle(
        favoriteButton.dataset.fav
      );

      return;
    }

    const routeButton =
      event.target.closest(
        "[data-route]"
      );

    if (routeButton) {
      event.preventDefault();

      go(
        routeButton.dataset.route
      );
    }
  }
);


/* =========================================================
   APP START
   ========================================================= */

window.addEventListener(
  "hashchange",
  render
);

fetch("data/atlas.json")
  .then(function (response) {
    if (!response.ok) {
      throw new Error(
        "atlas.json 載入失敗"
      );
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
        資料載入失敗，
        請確認 data/atlas.json 已正確上傳。
      </div>
    `;
  });
