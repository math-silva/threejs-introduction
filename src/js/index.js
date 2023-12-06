import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.enabled = true;
document.body.appendChild( renderer.domElement );

const scene = new THREE.Scene();

const axesHelper = new THREE.AxesHelper(50);
scene.add( axesHelper );

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(18, 7, 12);

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6 );
scene.add(ambientLight);

const spotlight = new THREE.SpotLight(0xffffff, 0.7);
let target = spotlight.target;
spotlight.position.set(2.5, 12, 2.5);
spotlight.angle = Math.PI / 6;
spotlight.penumbra = 0.5;
spotlight.decay = 1;
spotlight.distance = 0;

spotlight.castShadow = true;
spotlight.shadow.bias = -0.001;
spotlight.shadow.mapSize.width = 1024;
spotlight.shadow.mapSize.height = 1024;
spotlight.shadow.camera.near = 1;
spotlight.shadow.camera.far = 60;
spotlight.shadow.focus = 1;
scene.add(spotlight);
scene.add(target);

const lightHelper = new THREE.SpotLightHelper(spotlight);
scene.add(lightHelper);

const planeGeometry = new THREE.PlaneGeometry(100, 100);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xbcbcbc });

const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
scene.add(plane);

// 3D Model from Sketchfab
// https://sketchfab.com/3d-models/deer-walk-229ba6ba0d1e4811ab89382f74601e16
let deer;
let mixer;
const loader = new GLTFLoader();
loader.load('../../threejs-introduction/assets/deer/scene.gltf', function (gltf) {
  console.log(gltf.scene);
  deer = gltf.scene;
  deer.scale.set(0.01, 0.01, 0.01);
  deer.position.set(0, 0, 0);
  scene.add(deer);

  deer.traverse(function (child) {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  mixer = new THREE.AnimationMixer(deer);
  const action = mixer.clipAction(gltf.animations[0]); // Certifique-se de que 0 é o índice correto para a animação de caminhada
  action.play();
  function animate( time ) {
    requestAnimationFrame(animate);
    
    updateDeer(deer, mixer);
    spotlight.target.position.set(deer.position.x, deer.position.y, deer.position.z);
    lightHelper.update();
    
    renderer.render(scene, camera);
  }
  animate();
});

document.addEventListener('keydown', handleKeyDown);

function handleKeyDown(event) {
  switch (event.key.toLowerCase()) {
    case 'a':
      deer.rotation.y += 0.05;
      break;
    case 'd':
      deer.rotation.y -= 0.05;
      break;
    case 'c':
      spotlight.color.setHex(Math.random() * 0xffffff);
      break;
    default:
      break;
  }
}

function updateDeer(deer, mixer) {
  const speed = 0.012;
  const angle = deer.rotation.y;
  const deltaX = speed * Math.cos(angle);
  const deltaZ = speed * Math.sin(angle);

  deer.position.x += deltaX;
  deer.position.z -= deltaZ;

  if (Math.abs(deer.position.z) > 40 || Math.abs(deer.position.x) > 20) {
    deer.position.set(0, 0, 0);
  }

  mixer.update(0.007);
}
