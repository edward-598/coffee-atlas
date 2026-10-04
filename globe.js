/* =========================================================
   COFFEE ATLAS
   V1.8.2a — INTERACTIVE GLOBE
   ========================================================= */

import * as THREE from "three";

import { OrbitControls } from
  "three/addons/controls/OrbitControls.js";


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

    cancelAnimationFrame(
      animationId
    );

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
