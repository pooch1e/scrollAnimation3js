import * as THREE from 'three';
import GUI from 'lil-gui';

/**
 * Debug
 */
const gui = new GUI();

const parameters = {
  materialColor: '#ffeded',
  objectsDistance: 4,
};

let scrollY = window.scrollY;

gui.addColor(parameters, 'materialColor').onChange(() => {
  material.color.set(parameters.materialColor);
});

// Textures
const textureLoader = new THREE.TextureLoader();
const gradientTexture = textureLoader.load('/textures/gradients/5.jpg');
gradientTexture.magFilter = THREE.NearestFilter;

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

// Material
const material = new THREE.MeshToonMaterial({
  color: parameters.materialColor,
  gradientMap: gradientTexture,
});

//Geometries
const torusGeometry = new THREE.TorusGeometry(1, 0.4, 16, 60);

const torusMesh = new THREE.Mesh(torusGeometry, material);

const coneGeometry = new THREE.ConeGeometry(1, 2, 32);

const coneMesh = new THREE.Mesh(coneGeometry, material);

const torusKnotGeometry = new THREE.TorusKnotGeometry(0.8, 0.35, 100, 162);

const torusKnotsMesh = new THREE.Mesh(torusKnotGeometry, material);
scene.add(torusMesh, coneMesh, torusKnotsMesh);

torusMesh.position.y = parameters.objectsDistance * 0;
coneMesh.position.y = parameters.objectsDistance * 1;
torusKnotsMesh.position.y = parameters.objectsDistance * 2;

const sectionMeshes = [torusMesh, coneMesh, torusKnotsMesh];

// Lights
const directionalLight = new THREE.DirectionalLight('#ffffff', 3);
directionalLight.position.set(1, 1, 0);
scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 6;
scene.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  for (let object in sectionMeshes) {
    sectionMeshes[object].rotation.x = elapsedTime * 0.1;
    sectionMeshes[object].rotation.y = elapsedTime * 0.12;
  }

  scrollY = window.scrollY;

  camera.position.z = scrollY;

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
