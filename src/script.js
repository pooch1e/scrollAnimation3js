import * as THREE from 'three';
import GUI from 'lil-gui';
import gsap from 'gsap';

/**
 * Debug
 */
const gui = new GUI();

const parameters = {
  materialColor: '#ffeded',
  objectsDistance: 4,
};

const cursorPosition = {
  mouseX: 0,
  mouseY: 0,
};

window.addEventListener('mousemove', (e) => {
  cursorPosition.mouseX = e.clientX / sizes.width - 0.5;
  cursorPosition.mouseY = -e.clientY / sizes.height - 0.5;
});
// SCROLL
let scrollY = window.scrollY;
let currentSection = 0;

window.addEventListener('scroll', () => {
  scrollY = window.scrollY;

  const newSection = Math.round(scrollY / sizes.height);
  if (newSection != currentSection) {
    currentSection = newSection;

    gsap.to(sectionMeshes[currentSection].rotation, {
      duration: 1.5,
      ease: 'power2.inOut',
      x: '+=6',
      y: '+=3',
      z: '+=1.5',
    });
  }
});

gui.addColor(parameters, 'materialColor').onChange(() => {
  material.color.set(parameters.materialColor);
});
gui
  .addColor(particlesMaterial, 'size')
  .min(0.1)
  .max(1)
  .step(0.01)
  .onFinishChange();

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
coneMesh.position.y = parameters.objectsDistance * -1;
torusKnotsMesh.position.y = parameters.objectsDistance * -2;

torusMesh.position.x = 2;
coneMesh.position.x = -2;
torusKnotsMesh.position.x = 2;

const sectionMeshes = [torusMesh, coneMesh, torusKnotsMesh];

const particlesCount = 200;

const positions = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount; i++) {
  positions[i * 3 + 0] = (Math.random() - 0.5) * 10;
  positions[i * 3 + 1] =
    Math.random() * parameters.objectsDistance * sectionMeshes.length;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
}
const particlesGeometry = new THREE.BufferGeometry();

particlesGeometry.setAttribute(
  'position',
  new THREE.BufferAttribute(positions, 3)
);

// Particle Material
const particlesMaterial = new THREE.PointsMaterial({
  color: parameters.materialColor,
  sizeAttenuation: true,
  size: 0.03,
});

// Points
const particles = new THREE.Points(particlesGeometry, particlesMaterial);

scene.add(particles);

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
//Camera Group
const cameraGroup = new THREE.Group();

// Base camera
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 6;
cameraGroup.add(camera);
scene.add(cameraGroup);

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
let prevTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  let deltaTime = elapsedTime - prevTime;
  prevTime = elapsedTime;

  for (let object in sectionMeshes) {
    sectionMeshes[object].rotation.x += deltaTime * 0.1;
    sectionMeshes[object].rotation.y += deltaTime * 0.12;
  }

  //parralax
  const parralaxX = cursorPosition.mouseX;
  const parralaxY = -cursorPosition.mouseY;

  cameraGroup.position.x +=
    (parralaxX - cameraGroup.position.x) * 0.5 * deltaTime;
  cameraGroup.position.y +=
    (parralaxY - cameraGroup.position.y) * 0.5 * deltaTime;

  // lerp to destination

  camera.position.y = (-scrollY / sizes.height) * parameters.objectsDistance;

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
