import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Scene

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(18, 7, 12);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.enabled = true;
document.body.appendChild( renderer.domElement );

// Helpers

const axesHelper = new THREE.AxesHelper( 50 );
scene.add( axesHelper );

const controls = new OrbitControls( camera, renderer.domElement );
controls.update();

// Lights

const ambientLight = new THREE.AmbientLight( 0xffffff, 0.5 );
scene.add( ambientLight );

const spotLight = new THREE.SpotLight( 0xffffff, 0.7 );
spotLight.position.set( 2, 12, 2 );
spotLight.angle = Math.PI / 6;
spotLight.penumbra = 0.5;
spotLight.decay = 1;
spotLight.distance = 0;

spotLight.castShadow = true;
spotLight.shadow.bias = -0.001;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
spotLight.shadow.camera.near = 1;
spotLight.shadow.camera.far = 60;
spotLight.shadow.focus = 1;

scene.add( spotLight );
scene.add( spotLight.target );

const spotLightHelper = new THREE.SpotLightHelper( spotLight );
scene.add( spotLightHelper );

const planeGeometry = new THREE.PlaneGeometry( 100, 100 );
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xbcbcbc });

// Plane

const plane = new THREE.Mesh( planeGeometry, planeMaterial );
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
scene.add( plane );

// Importing the deer model

let deer;
let mixer;
const loader = new GLTFLoader();
loader.load('../../threejs-introduction/assets/deer/scene.gltf', function (gltf) {
  console.log(gltf.scene);
  deer = gltf.scene;
  deer.scale.set(0.01, 0.01, 0.01);
  scene.add(deer);

  deer.traverse(function (child) {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  
  mixer = new THREE.AnimationMixer(deer);
  gltf.animations.forEach((clip) => {
    mixer.clipAction(clip).play();
  });
});

// Animation

function animate() {
  requestAnimationFrame( animate );
  renderer.render( scene, camera );
  
  if (mixer) mixer.update(0.01);

  if (deer) {
    deer.position.x += 0.01 * Math.cos(deer.rotation.y);
    deer.position.z -= 0.01 * Math.sin(deer.rotation.y);

    if (Math.abs(deer.position.x) > 30 || Math.abs(deer.position.z) > 30) {
      deer.position.x = 0;
    }
    
    spotLight.target = deer;
    spotLightHelper.update();
  }
}
animate();

// Keyboard controls

window.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'a':
      deer.rotation.y += 0.05;
      break;
    case 'd':
      deer.rotation.y -= 0.05;
      break;
    case 'c':
      spotLight.color.setHex(Math.random() * 0xffffff);
      break;
    case 'r':
      deer.position.set(0, 0, 0);
      deer.rotation.set(0, 0, 0);
      break;
    case 's':
      spotLight.castShadow = !spotLight.castShadow;
      break;
    case 'h':
      spotLightHelper.visible = !spotLightHelper.visible;
      axesHelper.visible = !axesHelper.visible;
      break;
  }
});

window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}, false);