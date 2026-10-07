/* =========================================================
   COFFEE ATLAS
   V1.8.2a — INTERACTIVE GLOBE
   ========================================================= */

import * as THREE from "three";

import { OrbitControls } from
  "three/addons/controls/OrbitControls.js";

/* =========================================================
   GEO HELPERS
   Longitude / Latitude → 3D Sphere
   ========================================================= */

function latLngToVector3(
  latitude,
  longitude,
  radius
) {

  const lat =
    THREE.MathUtils.degToRad(
      latitude
    );

  const lon =
    THREE.MathUtils.degToRad(
      longitude
    );

  return new THREE.Vector3(
    radius *
      Math.cos(lat) *
      Math.sin(lon),

    radius *
      Math.sin(lat),

    radius *
      Math.cos(lat) *
      Math.cos(lon)
  );
}

/* =========================================================
   V1.8.2d — COFFEE ORIGIN COORDINATES
   UI metadata for globe markers
   ========================================================= */

const coffeeOriginCoordinates = {
  taiwan: {
    name: "Taiwan",
    lat: 23.7,
    lng: 121.0
  },

  ethiopia: {
    name: "Ethiopia",
    lat: 9.1,
    lng: 40.5
  },

  kenya: {
    name: "Kenya",
    lat: 0.2,
    lng: 37.9
  },

  panama: {
    name: "Panama",
    lat: 8.5,
    lng: -80.8
  },

  colombia: {
    name: "Colombia",
    lat: 4.6,
    lng: -74.1
  },

  "costa-rica": {
    name: "Costa Rica",
    lat: 9.9,
    lng: -84.2
  }
};

/* =========================================================
   INIT
   ========================================================= */

export function initCoffeeGlobe() {

  const container =
    document.querySelector("#coffeeGlobe");

  if (!container) return;


  /* -----------------------------------------
     SCENE
     ----------------------------------------- */

  const scene = new THREE.Scene();


  /* -----------------------------------------
     CAMERA
     ----------------------------------------- */

  const camera =
    new THREE.PerspectiveCamera(
      38,
      1,
      0.1,
      100
    );

  camera.position.set(0, 0, 4.2);


  /* -----------------------------------------
     RENDERER
     ----------------------------------------- */

  const renderer =
    new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });

  renderer.setPixelRatio(
    Math.min(
      window.devicePixelRatio,
      2
    )
  );

  renderer.setClearColor(
    0x000000,
    0
  );

  container.innerHTML = "";
  container.appendChild(
    renderer.domElement
  );


  /* -----------------------------------------
     GLOBE
     ----------------------------------------- */

  const geometry =
    new THREE.SphereGeometry(
      1.35,
      64,
      64
    );


  const material =
    new THREE.MeshStandardMaterial({
      color: 0x2a241c,
      roughness: 0.78,
      metalness: 0.08
    });


  const globe =
    new THREE.Mesh(
      geometry,
      material
    );

  scene.add(globe);

   /* -----------------------------------------
   V1.8.2b — LATITUDE / LONGITUDE GRID
   ----------------------------------------- */

const gridGroup = new THREE.Group();

const gridMaterial =
  new THREE.LineBasicMaterial({
    color: 0xd5a96c,
    transparent: true,
    opacity: 0.16
  });


/* ---------- LATITUDE ---------- */

for (
  let latitude = -60;
  latitude <= 60;
  latitude += 30
) {

  const lat =
    THREE.MathUtils.degToRad(
      latitude
    );

  const radius =
    1.38 * Math.cos(lat);

  const y =
    1.38 * Math.sin(lat);

  const points = [];

  for (
    let angle = 0;
    angle <= 360;
    angle += 4
  ) {

    const a =
      THREE.MathUtils.degToRad(
        angle
      );

    points.push(
      new THREE.Vector3(
        radius * Math.cos(a),
        y,
        radius * Math.sin(a)
      )
    );
  }

  const lineGeometry =
    new THREE.BufferGeometry()
      .setFromPoints(points);

  const line =
    new THREE.Line(
      lineGeometry,
      gridMaterial
    );

  gridGroup.add(line);
}


/* ---------- LONGITUDE ---------- */

for (
  let longitude = 0;
  longitude < 180;
  longitude += 30
) {

  const lon =
    THREE.MathUtils.degToRad(
      longitude
    );

  const points = [];

  for (
    let latitude = -90;
    latitude <= 90;
    latitude += 4
  ) {

    const lat =
      THREE.MathUtils.degToRad(
        latitude
      );

    const radius =
      1.38 * Math.cos(lat);

    const y =
      1.38 * Math.sin(lat);

    points.push(
      new THREE.Vector3(
        radius * Math.cos(lon),
        y,
        radius * Math.sin(lon)
      )
    );
  }

  const lineGeometry =
    new THREE.BufferGeometry()
      .setFromPoints(points);

  const line =
    new THREE.Line(
      lineGeometry,
      gridMaterial
    );

  gridGroup.add(line);
}


scene.add(gridGroup);
   /* =========================================================
   V1.8.2c — WORLD COASTLINES
   ========================================================= */

const continentGroup =
  new THREE.Group();

scene.add(continentGroup);


const coastlineMaterial =
  new THREE.LineBasicMaterial({
    color: 0xd5a96c,
    transparent: true,
    opacity: 0.72
  });


function drawPolygonCoordinates(
  coordinates
) {

  coordinates.forEach(
    (ring) => {

      const points =
        ring.map(
          ([longitude, latitude]) =>
            latLngToVector3(
              latitude,
              longitude,
              1.395
            )
        );

      if (points.length < 2) {
        return;
      }

      const geometry =
        new THREE.BufferGeometry()
          .setFromPoints(points);

      const coastline =
        new THREE.Line(
          geometry,
          coastlineMaterial
        );

      continentGroup.add(
        coastline
      );
    }
  );
}

function drawGeometry(
  geometry
) {

  if (!geometry) return;


  if (
    geometry.type ===
    "Polygon"
  ) {

    drawPolygonCoordinates(
      geometry.coordinates
    );

  }


  if (
    geometry.type ===
    "MultiPolygon"
  ) {

    geometry.coordinates.forEach(
      (polygon) => {

        drawPolygonCoordinates(
          polygon
        );

      }
    );

  }
}

   /* -----------------------------------------
   LOAD WORLD MAP
   ----------------------------------------- */

fetch(
  "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson"
)
  .then(
    (response) => {

      if (!response.ok) {
        throw new Error(
          "World map failed to load"
        );
      }

      return response.json();
    }
  )

  .then(
    (worldData) => {

      worldData.features.forEach(
        (feature) => {

          drawGeometry(
            feature.geometry
          );

        }
      );

    }
  )

  .catch(
    (error) => {

      console.error(
        "Coffee Atlas world map:",
        error
      );

    }
  );

/* =========================================================
   V1.8.2d — COFFEE ORIGIN MARKERS
   ========================================================= */

const markerGroup =
  new THREE.Group();

scene.add(markerGroup);


const markerGeometry =
  new THREE.SphereGeometry(
    0.035,
    20,
    20
  );


const markerMaterial =
  new THREE.MeshBasicMaterial({
    color: 0xf0bd73
  });


Object.entries(
  coffeeOriginCoordinates
).forEach(
  ([countryId, origin]) => {

    const position =
      latLngToVector3(
        origin.lat,
        origin.lng,
        1.43
      );


    const marker =
      new THREE.Mesh(
        markerGeometry,
        markerMaterial
      );


    marker.position.copy(
      position
    );


    marker.userData = {
      countryId,
      name: origin.name
    };


    markerGroup.add(
      marker
    );

  }
);

/* -----------------------------------------
MARKER GLOW
----------------------------------------- */

const glowGeometry =
  new THREE.SphereGeometry(
    0.065,
    20,
    20
  );


const glowMaterial =
  new THREE.MeshBasicMaterial({
    color: 0xd5a96c,
    transparent: true,
    opacity: 0.18
  });


const originMarkers =
  [...markerGroup.children];


originMarkers.forEach(
  (marker) => {

    const glow =
      new THREE.Mesh(
        glowGeometry,
        glowMaterial
      );

    glow.position.copy(
      marker.position
    );

    markerGroup.add(
      glow
    );

  }
);
   
  /* -----------------------------------------
     ATMOSPHERE / OUTLINE
     ----------------------------------------- */

  const atmosphereGeometry =
    new THREE.SphereGeometry(
      1.39,
      64,
      64
    );

  const atmosphereMaterial =
    new THREE.MeshBasicMaterial({
      color: 0xd5a96c,
      transparent: true,
      opacity: 0.07,
      side: THREE.BackSide
    });

  const atmosphere =
    new THREE.Mesh(
      atmosphereGeometry,
      atmosphereMaterial
    );

  scene.add(atmosphere);


  /* -----------------------------------------
     LIGHTING
     ----------------------------------------- */

  const ambientLight =
    new THREE.AmbientLight(
      0xd8c6aa,
      1.25
    );

  scene.add(ambientLight);


  const keyLight =
    new THREE.DirectionalLight(
      0xf1c98c,
      3
    );

  keyLight.position.set(
    -3,
    3,
    5
  );

  scene.add(keyLight);


  const rimLight =
    new THREE.DirectionalLight(
      0x6f5437,
      1.4
    );

  rimLight.position.set(
    4,
    -2,
    -3
  );

  scene.add(rimLight);


  /* -----------------------------------------
     CONTROLS
     ----------------------------------------- */

  const controls =
    new OrbitControls(
      camera,
      renderer.domElement
    );

  controls.enableDamping = true;
  controls.dampingFactor = 0.06;

  controls.enableZoom = false;
  controls.enablePan = false;

  controls.rotateSpeed = 0.55;

  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.45;

/* =========================================================
   V1.8.2d — MARKER INTERACTION
   Hover label + Click navigation
   ========================================================= */

const raycaster =
  new THREE.Raycaster();

const pointer =
  new THREE.Vector2();


/* ---------- TOOLTIP ---------- */

const tooltip =
  document.createElement("div");

tooltip.style.position = "absolute";
tooltip.style.pointerEvents = "none";

tooltip.style.padding = "6px 10px";

tooltip.style.border =
  "1px solid rgba(213,169,108,0.45)";

tooltip.style.borderRadius =
  "999px";

tooltip.style.background =
  "rgba(17,16,14,0.92)";

tooltip.style.color =
  "#f4eee4";

tooltip.style.fontSize =
  "12px";

tooltip.style.letterSpacing =
  "0.08em";

tooltip.style.whiteSpace =
  "nowrap";

tooltip.style.transform =
  "translate(-50%, -140%)";

tooltip.style.opacity = "0";

tooltip.style.transition =
  "opacity 0.15s ease";

tooltip.style.zIndex = "10";

container.appendChild(
  tooltip
);


/* ---------- POINTER POSITION ---------- */

function updatePointer(event) {

  const rect =
    renderer.domElement
      .getBoundingClientRect();

  pointer.x =
    (
      (
        event.clientX -
        rect.left
      ) /
      rect.width
    ) * 2 - 1;

  pointer.y =
    -(
      (
        event.clientY -
        rect.top
      ) /
      rect.height
    ) * 2 + 1;

}


/* ---------- FIND VISIBLE MARKER ---------- */

function getMarkerHit() {

  raycaster.setFromCamera(
    pointer,
    camera
  );

  /*
    Include globe so markers on the
    back side cannot be selected
    through the Earth.
  */

  const objects = [
    globe,
    ...originMarkers
  ];

  const hits =
    raycaster.intersectObjects(
      objects,
      false
    );

  if (!hits.length) {
    return null;
  }

  const firstHit =
    hits[0].object;

  if (
    firstHit.userData &&
    firstHit.userData.countryId
  ) {
    return firstHit;
  }

  return null;
}

/* ---------- HOVER ---------- */

function handlePointerMove(event) {

  /*
    While dragging the globe,
    do not show marker tooltip.
  */

  if (event.buttons !== 0) {

    tooltip.style.opacity = "0";

    renderer.domElement.style.cursor =
      "grabbing";

    return;
  }


  updatePointer(event);

  const marker =
    getMarkerHit();


if (!marker) {

  tooltip.style.opacity = "0";

  renderer.domElement.style.cursor =
    "grab";

  originMarkers.forEach(
    (item) => {
      item.scale.setScalar(1);
    }
  );

  return;
}


  const rect =
    container.getBoundingClientRect();


  tooltip.textContent =
    marker.userData.name.toUpperCase();


  tooltip.style.left =
    `${event.clientX - rect.left}px`;

  tooltip.style.top =
    `${event.clientY - rect.top}px`;


  tooltip.style.opacity = "1";

  renderer.domElement.style.cursor =
    "pointer";
}

/* ---------- CLICK / TAP ---------- */

let pointerDownPosition =
  null;


function handlePointerDown(event) {

  pointerDownPosition = {
    x: event.clientX,
    y: event.clientY
  };

}

function handlePointerUp(event) {

  if (!pointerDownPosition) {
    return;
  }

  const distance =
    Math.hypot(
      event.clientX -
        pointerDownPosition.x,

      event.clientY -
        pointerDownPosition.y
    );


  pointerDownPosition = null;


  /*
    More than 6px means the user
    was rotating the globe.
  */

  if (distance > 6) {
    return;
  }


  updatePointer(event);

  const marker =
    getMarkerHit();


  if (!marker) {
    return;
  }


  const countryId =
    marker.userData.countryId;


  window.location.hash =
    `country/${countryId}`;

}

/* ---------- EVENTS ---------- */

renderer.domElement.addEventListener(
  "pointermove",
  handlePointerMove
);

renderer.domElement.addEventListener(
  "pointerdown",
  handlePointerDown
);

renderer.domElement.addEventListener(
  "pointerup",
  handlePointerUp
);
/* -----------------------------------------
     RESPONSIVE SIZE
----------------------------------------- */

  function resizeGlobe() {

    const size =
      Math.min(
        container.clientWidth,
        390
      );

    const height =
      Math.min(
        Math.max(size, 260),
        390
      );

    renderer.setSize(
      size,
      height,
      false
    );

    camera.aspect =
      size / height;

    camera.updateProjectionMatrix();
  }

  resizeGlobe();


  /* -----------------------------------------
     RESIZE OBSERVER
     ----------------------------------------- */

  const resizeObserver =
    new ResizeObserver(
      resizeGlobe
    );

  resizeObserver.observe(
    container
  );


  /* -----------------------------------------
     ANIMATION
     ----------------------------------------- */

  let animationId;

  function animate() {

    animationId =
      requestAnimationFrame(
        animate
      );

    controls.update();

    renderer.render(
      scene,
      camera
    );
  }

  animate();


  /* -----------------------------------------
     CLEANUP
     ----------------------------------------- */

  return function destroyGlobe() {

  renderer.domElement.removeEventListener(
    "pointermove",
    handlePointerMove
  );

  renderer.domElement.removeEventListener(
    "pointerdown",
    handlePointerDown
  );

  renderer.domElement.removeEventListener(
    "pointerup",
    handlePointerUp
  );

  tooltip.remove();


  cancelAnimationFrame(
    animationId
  );

  resizeObserver.disconnect();

  controls.dispose();

     
    resizeObserver.disconnect();

    controls.dispose();

    geometry.dispose();
    material.dispose();

    atmosphereGeometry.dispose();
    atmosphereMaterial.dispose();

    renderer.dispose();

    container.innerHTML = "";
  };
}
