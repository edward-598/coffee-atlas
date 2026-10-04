/* =========================================================
   V1.8.2 — INTERACTIVE GLOBE MODULE
   ========================================================= */

let destroyCoffeeGlobe = null;

async function mountCoffeeGlobe() {

  const container =
    document.querySelector("#coffeeGlobe");

  if (!container) return;

  try {

    const { initCoffeeGlobe } =
      await import("./globe.js");

    /*
      Route may have changed while
      the module was loading.
    */
    if (
      !document.querySelector(
        "#coffeeGlobe"
      )
    ) {
      return;
    }

    destroyCoffeeGlobe =
      initCoffeeGlobe();

  } catch (error) {

    console.error(
      "Coffee Globe failed to load:",
      error
    );

  }
}


function unmountCoffeeGlobe() {

  if (
    typeof destroyCoffeeGlobe ===
    "function"
  ) {
    destroyCoffeeGlobe();
  }

  destroyCoffeeGlobe = null;
}

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

  /* V1.8.2 — clean previous globe */
  unmountCoffeeGlobe();

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


/* =========================================================
     V1.8.0 — EXPLORE LANDING
     ========================================================= */

  if (route === "explore") {

    /* -----------------------------------------
       LIVE DATABASE STATS
       ----------------------------------------- */

    const countryCount = (db.countries || []).length;
    const regionCount = (db.regions || []).length;
    const originCount = (db.stations || []).length;
    const beanCount = (db.beans || []).length;


    /* -----------------------------------------
       COUNTRY DATA
       Calculate bean count from relationships:
       Country → Region → Station → Bean
       ----------------------------------------- */

    const countriesWithStats = (db.countries || [])
      .map((country) => {

        const regionIds = (db.regions || [])
          .filter((region) =>
            region.country === country.id
          )
          .map((region) => region.id);

        const stationIds = (db.stations || [])
          .filter((station) =>
            regionIds.includes(station.region)
          )
          .map((station) => station.id);

        const countryBeans = (db.beans || [])
          .filter((bean) =>
            stationIds.includes(bean.station)
          );

        return {
          ...country,
          beanCount: countryBeans.length
        };
      })
      .sort((a, b) =>
        b.beanCount - a.beanCount
      );


    /* -----------------------------------------
       COUNTRY CARDS
       ----------------------------------------- */

    const countryCards = countriesWithStats
      .map((country) => {

        const profile = Array.isArray(country.profile)
          ? country.profile
              .filter(Boolean)
              .slice(0, 3)
              .join(" · ")
          : country.profile || "";

        return `
          <button
            class="explore-country-card"
            data-route="country/${country.id}"
          >

            <div class="explore-country-card__top">

              <span class="eyebrow">
                ORIGIN
              </span>

              <span class="explore-country-card__count">
                ${country.beanCount}
                ${country.beanCount === 1 ? "BEAN" : "BEANS"}
              </span>

            </div>

            <h2>
              ${country.name}
            </h2>

            ${
              country.zh
                ? `
                    <div class="explore-country-card__zh">
                      ${country.zh}
                    </div>
                  `
                : ""
            }

            ${
              profile
                ? `
                    <p>
                      ${profile}
                    </p>
                  `
                : ""
            }

            <div class="explore-country-card__arrow">
              EXPLORE
              <span>→</span>
            </div>

          </button>
        `;
      })
      .join("");


    /* -----------------------------------------
       RENDER
       ----------------------------------------- */

    app.innerHTML = `

      <section class="explore-hero">

        <div class="eyebrow">
          EXPLORE THE WORLD
        </div>

        <h1 class="title">
          Coffee Origins
        </h1>

        <p class="intro">
          Discover coffee from origin to cup.
        </p>

        <div class="explore-globe-wrap">

  <div
    id="coffeeGlobe"
    class="coffee-globe"
    aria-label="Interactive coffee origin globe"
  ></div>

</div>


        <div class="explore-stats">

          <div>
            <strong>${countryCount}</strong>
            <span>COUNTRIES</span>
          </div>

          <div>
            <strong>${regionCount}</strong>
            <span>REGIONS</span>
          </div>

          <div>
            <strong>${originCount}</strong>
            <span>ORIGINS</span>
          </div>

          <div>
            <strong>${beanCount}</strong>
            <span>BEANS</span>
          </div>

        </div>

      </section>


      <section class="explore-origins">

        <div class="section">
          COFFEE ORIGINS
        </div>

        <div class="explore-country-grid">
          ${countryCards}
        </div>

      </section>

    `;

    return;
  }

/* =========================================================
     V1.8.1 — COUNTRY EXPERIENCE
     ========================================================= */

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
      (region) => region.country === country.id
    );

    const regionIds = regions.map(
      (region) => region.id
    );

    const countryStations = (db.stations || []).filter(
      (station) =>
        regionIds.includes(station.region)
    );

    const stationIds = countryStations.map(
      (station) => station.id
    );

    const countryBeans = (db.beans || []).filter(
      (bean) =>
        stationIds.includes(bean.station)
    );

    const countryProfile = Array.isArray(country.profile)
      ? country.profile.filter(Boolean)
      : country.profile
        ? [country.profile]
        : [];


    const regionCards = regions
      .map((region) => {

        const stations = (db.stations || []).filter(
          (station) =>
            station.region === region.id
        );

        const stationIds = stations.map(
          (station) => station.id
        );

        const beans = (db.beans || []).filter(
          (bean) =>
            stationIds.includes(bean.station)
        );

        const profile = Array.isArray(region.profile)
          ? region.profile
              .filter(Boolean)
              .join(" · ")
          : region.profile || "";

        return `
          <button
            class="atlas-node-card"
            data-route="region/${region.id}"
          >

            <div class="atlas-node-card__top">
              <span class="eyebrow">
                REGION
              </span>

              <span class="atlas-node-card__count">
                ${stations.length} ORIGINS ·
                ${beans.length} BEANS
              </span>
            </div>

            <h2>
              ${region.name}
            </h2>

            ${
              region.zh
                ? `
                    <div class="atlas-node-card__zh">
                      ${region.zh}
                    </div>
                  `
                : ""
            }

            ${
              region.altitude
                ? `
                    <div class="atlas-node-card__meta">
                      ${region.altitude}
                    </div>
                  `
                : ""
            }

            ${
              profile
                ? `
                    <p>
                      ${profile}
                    </p>
                  `
                : ""
            }

            <div class="atlas-node-card__footer">
              EXPLORE REGION
              <span>→</span>
            </div>

          </button>
        `;
      })
      .join("");


    app.innerHTML = `

      ${crumb(`
        <button data-route="explore">
          WORLD
        </button>
        <span>›</span>
        ${country.name}
      `)}

      <section class="atlas-page-hero">

        <div class="eyebrow">
          COFFEE ORIGIN
        </div>

        <h1 class="title">
          ${country.name}
        </h1>

        ${
          country.zh
            ? `
                <div class="atlas-page-zh">
                  ${country.zh}
                </div>
              `
            : ""
        }

        ${
          countryProfile.length
            ? tags(countryProfile)
            : ""
        }


        <div class="atlas-summary">

          <div>
            <strong>${regions.length}</strong>
            <span>REGIONS</span>
          </div>

          <div>
            <strong>${countryStations.length}</strong>
            <span>ORIGINS</span>
          </div>

          <div>
            <strong>${countryBeans.length}</strong>
            <span>BEANS</span>
          </div>

        </div>

      </section>


      <div class="section">
        EXPLORE REGIONS
      </div>

      <div class="atlas-node-grid">
        ${
          regionCards ||
          `
            <div class="empty">
              尚未建立 Region。
            </div>
          `
        }
      </div>
    `;

    return;
  }  

/* =========================================================
     V1.8.1 — REGION EXPERIENCE
     ========================================================= */

  if (parts[0] === "region") {
    const region = by(
      db.regions,
      parts[1]
    );

    if (!region) {
      emptyPage("找不到這個 Coffee Region。");
      return;
    }

    const country = by(
      db.countries,
      region.country
    );

    const stations = (db.stations || []).filter(
      (station) =>
        station.region === region.id
    );

    const stationIds = stations.map(
      (station) => station.id
    );

    const regionBeans = (db.beans || []).filter(
      (bean) =>
        stationIds.includes(bean.station)
    );

    const profile = Array.isArray(region.profile)
      ? region.profile.filter(Boolean)
      : region.profile
        ? [region.profile]
        : [];


    const stationCards = stations
      .map((station) => {

        const beans = (db.beans || []).filter(
          (bean) =>
            bean.station === station.id
        );

        const stationProfile =
          Array.isArray(station.profile)
            ? station.profile
                .filter(Boolean)
                .join(" · ")
            : station.profile || "";

        return `
          <button
            class="atlas-node-card"
            data-route="station/${station.id}"
          >

            <div class="atlas-node-card__top">

              <span class="eyebrow">
                ${station.type || "ORIGIN"}
              </span>

              <span class="atlas-node-card__count">
                ${beans.length}
                ${beans.length === 1
                  ? "BEAN"
                  : "BEANS"}
              </span>

            </div>

            <h2>
              ${station.name}
            </h2>

            ${
              station.zh
                ? `
                    <div class="atlas-node-card__zh">
                      ${station.zh}
                    </div>
                  `
                : ""
            }

            ${
              station.altitude
                ? `
                    <div class="atlas-node-card__meta">
                      ${station.altitude}
                    </div>
                  `
                : ""
            }

            ${
              stationProfile
                ? `
                    <p>
                      ${stationProfile}
                    </p>
                  `
                : ""
            }

            <div class="atlas-node-card__footer">
              VIEW ORIGIN
              <span>→</span>
            </div>

          </button>
        `;
      })
      .join("");


    app.innerHTML = `

      ${crumb(`
        <button data-route="explore">
          WORLD
        </button>

        <span>›</span>

        ${
          country
            ? `
                <button
                  data-route="country/${country.id}"
                >
                  ${country.name}
                </button>

                <span>›</span>
              `
            : ""
        }

        ${region.name}
      `)}


      <section class="atlas-page-hero">

        <div class="eyebrow">
          COFFEE REGION
        </div>

        <h1 class="title">
          ${region.name}
        </h1>

        ${
          region.zh
            ? `
                <div class="atlas-page-zh">
                  ${region.zh}
                </div>
              `
            : ""
        }


        ${
          region.altitude
            ? `
                <div class="atlas-region-altitude">
                  ${region.altitude}
                </div>
              `
            : ""
        }


        ${
          profile.length
            ? `
                <div class="section">
                  KNOWN FOR
                </div>

                ${tags(profile)}
              `
            : ""
        }


        <div class="atlas-summary atlas-summary--two">

          <div>
            <strong>${stations.length}</strong>
            <span>ORIGINS</span>
          </div>

          <div>
            <strong>${regionBeans.length}</strong>
            <span>BEANS</span>
          </div>

        </div>

      </section>


      <div class="section">
        EXPLORE ORIGINS
      </div>

      <div class="atlas-node-grid">

        ${
          stationCards ||
          `
            <div class="empty">
              尚未建立 Station / Farm。
            </div>
          `
        }

      </div>
    `;

    return;
  } 

  /* =========================================================
     V1.8.1 — ORIGIN / STATION EXPERIENCE
     ========================================================= */

  if (parts[0] === "station") {

    const station = by(
      db.stations,
      parts[1]
    );

    if (!station) {
      emptyPage("找不到這個 Station / Farm。");
      return;
    }


    /* -----------------------------------------
       RELATIONSHIPS
       ----------------------------------------- */

    const region = by(
      db.regions,
      station.region
    );

    const country = region
      ? by(db.countries, region.country)
      : null;

    const beans = (db.beans || []).filter(
      (bean) =>
        bean.station === station.id
    );

    const profile =
      Array.isArray(station.profile)
        ? station.profile.filter(Boolean)
        : station.profile
          ? [station.profile]
          : [];


    /* -----------------------------------------
       BEAN CARDS
       ----------------------------------------- */

    const beanCards = beans
      .map((bean) => {

        const beanMeta = [
          bean.process,
          bean.variety
        ]
          .filter(Boolean)
          .join(" · ");

        const flavors =
          Array.isArray(bean.flavors)
            ? bean.flavors.filter(Boolean)
            : [];

        return `
          <button
            class="origin-bean-card"
            data-route="bean/${bean.id}"
          >

            <div class="origin-bean-card__top">

              <span class="eyebrow">
                COFFEE / LOT
              </span>

              ${
                beanMeta
                  ? `
                    <span class="origin-bean-card__meta">
                      ${beanMeta}
                    </span>
                  `
                  : ""
              }

            </div>


            <h2>
              ${bean.name}
            </h2>


            ${
              bean.altitude
                ? `
                    <div class="origin-bean-card__altitude">
                      ${bean.altitude}
                    </div>
                  `
                : ""
            }


            ${
              flavors.length
                ? `
                    <div class="origin-bean-card__flavors">
                      ${tags(flavors)}
                    </div>
                  `
                : ""
            }


            <div class="origin-bean-card__footer">
              VIEW COFFEE
              <span>→</span>
            </div>

          </button>
        `;
      })
      .join("");


    /* -----------------------------------------
       RENDER
       ----------------------------------------- */

    app.innerHTML = `

      ${crumb(`

        <button data-route="explore">
          WORLD
        </button>

        ${
          country
            ? `
                <span>›</span>

                <button
                  data-route="country/${country.id}"
                >
                  ${country.name}
                </button>
              `
            : ""
        }

        ${
          region
            ? `
                <span>›</span>

                <button
                  data-route="region/${region.id}"
                >
                  ${region.name}
                </button>
              `
            : ""
        }

        <span>›</span>

        ${station.name}

      `)}


      <section class="atlas-page-hero origin-hero">

        <div class="eyebrow">
          ${station.type || "COFFEE ORIGIN"}
        </div>

        <h1 class="title">
          ${station.name}
        </h1>

        ${
          station.zh
            ? `
                <div class="atlas-page-zh">
                  ${station.zh}
                </div>
              `
            : ""
        }


        ${
          station.altitude
            ? `
                <div class="origin-altitude">
                  ${station.altitude}
                </div>
              `
            : ""
        }


        ${
          station.intro
            ? `
                <p class="intro origin-intro">
                  ${station.intro}
                </p>
              `
            : ""
        }


        ${
          profile.length
            ? `
                <div class="section">
                  TYPICAL PROFILE
                </div>

                ${tags(profile)}
              `
            : ""
        }


        <div class="atlas-summary atlas-summary--single">

          <div>
            <strong>${beans.length}</strong>

            <span>
              ${beans.length === 1 ? "COFFEE" : "COFFEES"}
            </span>
          </div>

        </div>

      </section>


      <div class="section">
        COFFEE FROM HERE
      </div>


      <div class="origin-bean-grid">

        ${
          beanCards ||
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

/* =========================================================
   V1.7.0 — BEAN DETAIL
   ========================================================= */

if (parts[0] === "bean") {
  const bean = by(
    db.beans,
    parts[1]
  );

  if (!bean) {
    emptyPage("找不到這支 Coffee Bean。");
    return;
  }

  /* -----------------------------------------
     RELATIONSHIP
     Bean → Station → Region → Country
     ----------------------------------------- */

  const station = by(
    db.stations,
    bean.station
  );

  const region = station
    ? by(db.regions, station.region)
    : null;

  const country = region
    ? by(db.countries, region.country)
    : null;


  /* -----------------------------------------
     PAGE EYEBROW
     Example: GUJI · ETHIOPIA
     ----------------------------------------- */

  const originEyebrow = [
    region?.name,
    country?.name
  ]
    .filter(Boolean)
    .join(" · ")
    .toUpperCase();


  /* -----------------------------------------
     ORIGIN PATH
     Ethiopia → Guji → Guduba
     ----------------------------------------- */

  const originPath = [
    country
      ? `
        <button
          data-route="country/${country.id}"
        >
          ${country.name}
        </button>
      `
      : "",

    region
      ? `
        <button
          data-route="region/${region.id}"
        >
          ${region.name}
        </button>
      `
      : "",

    station
      ? `
        <button
          data-route="station/${station.id}"
        >
          ${station.name}
        </button>
      `
      : ""
  ]
    .filter(Boolean)
    .join(`<span class="origin-arrow">→</span>`);


  /* -----------------------------------------
     COFFEE PROFILE
     Only show available data
     ----------------------------------------- */

  const coffeeProfile = [
    bean.process
      ? `
        <div class="stat">
          <small>Process</small>
          ${bean.process}
        </div>
      `
      : "",

    bean.variety
      ? `
        <div class="stat">
          <small>Variety</small>
          ${bean.variety}
        </div>
      `
      : "",

    bean.altitude
      ? `
        <div class="stat">
          <small>Altitude</small>
          ${bean.altitude}
        </div>
      `
      : ""
  ]
    .filter(Boolean)
    .join("");


  /* -----------------------------------------
     SENSORY SCORES
     Hide when data is unavailable
     ----------------------------------------- */

  const sensoryScores = [
    bean.sweetness !== null &&
    bean.sweetness !== undefined
      ? `
        <div class="stat">
          <small>Sweetness</small>
          ${bean.sweetness}/5
        </div>
      `
      : "",

    bean.acidity !== null &&
    bean.acidity !== undefined
      ? `
        <div class="stat">
          <small>Acidity</small>
          ${bean.acidity}/5
        </div>
      `
      : "",

    bean.body !== null &&
    bean.body !== undefined
      ? `
        <div class="stat">
          <small>Body</small>
          ${bean.body}/5
        </div>
      `
      : ""
  ]
    .filter(Boolean)
    .join("");


  /* -----------------------------------------
     SOURCE
     ----------------------------------------- */

  const sourceSection = bean.source
    ? `
      <div class="section">
        SOURCE
      </div>

      <p class="intro">
        <a
          class="source-link"
          href="${bean.source}"
          target="_blank"
          rel="noopener noreferrer"
        >
          View source ↗
        </a>
      </p>
    `
    : "";


  /* -----------------------------------------
     RENDER
     ----------------------------------------- */

  app.innerHTML = `

    ${
      originEyebrow
        ? `
          <div class="eyebrow">
            ${originEyebrow}
          </div>
        `
        : ""
    }

    <div class="bean-title-row">

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

    </div>

    ${
      bean.flavors?.length
        ? tags(bean.flavors)
        : ""
    }

    ${
      originPath
        ? `
          <div class="section">
            ORIGIN
          </div>

          <div class="origin-path">
            ${originPath}
          </div>
        `
        : ""
    }

    ${
      coffeeProfile
        ? `
          <div class="section">
            COFFEE PROFILE
          </div>

          <div class="stats">
            ${coffeeProfile}
          </div>
        `
        : ""
    }

    ${
      bean.flavors?.length
        ? `
          <div class="section">
            CUP PROFILE
          </div>

          <p class="intro">
            ${bean.flavors.join(" · ")}
          </p>
        `
        : ""
    }

    ${
      sensoryScores
        ? `
          <div class="section">
            SENSORY
          </div>

          <div class="stats">
            ${sensoryScores}
          </div>
        `
        : ""
    }


    ${
      station
        ? `
          <div class="section">
            PRODUCER / STATION
          </div>

          <button
            class="card"
            data-route="station/${station.id}"
          >

            <div class="eyebrow">
              ${station.type || "Origin"}
            </div>

            <h3>
              ${station.name}

              ${
                station.zh
                  ? `
                    <br>
                    <small>
                      ${station.zh}
                    </small>
                  `
                  : ""
              }
            </h3>

            ${
              station.intro
                ? `
                  <p>
                    ${station.intro}
                  </p>
                `
                : ""
            }

          </button>
        `
        : ""
    }


    ${sourceSection}

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

    mountCoffeeGlobe();

    return;
  }
