import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import * as dat from 'dat.gui';
import { generateGalaxy } from './galaxy.js';
import { params } from './utils.js';

// Initialize the bloom layer
const BLOOM_LAYER = 1;
const bloomLayer = new THREE.Layers();
bloomLayer.set(BLOOM_LAYER);

// Initialize perspective camera 
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Camera positioning
camera.position.z = 50;

// Add orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Call the galaxy generation function
generateGalaxy(scene);

function guiSliders(gui) {
    gui.add(params, 'starCount', 1000, 50000).onChange(() => generateGalaxy(scene)); 
    gui.add(params, 'density', 1, 10).onChange(() => generateGalaxy(scene)); // Add density control

    gui.add(params, 'galaxyThickens', 1, 20).onChange(() => {
        params.galaxyThickens = params.galaxyThickens;
        generateGalaxy(scene);
    });

    gui.add(params, 'arms', 1, 10).onChange(() => { 
        params.arms = params.arms;
        generateGalaxy(scene);
    });

    gui.add(params, 'spiral', 0, 10).onChange(() => {
        params.spiral = params.spiral;
        generateGalaxy(scene);
    });

    gui.add(params, 'coreXDist', 1, 100).onChange(() => {
        params.coreXDist = params.coreXDist;
        generateGalaxy(scene);
    });

    gui.add(params, 'coreYDist', 1, 100).onChange(() => {
        params.coreYDist = params.coreYDist;
        generateGalaxy(scene);
    });

    gui.add(params, 'armXDist', 1, 100).onChange(() => {
        params.armXDist = params.armXDist;
        generateGalaxy(scene);
    });

    gui.add(params, 'armYDist', 1, 100).onChange(() => {
        params.armYDist = params.armYDist;
        generateGalaxy(scene);
    });

    gui.add(params, 'armXMean', 1, 100).onChange(() => {
        params.armXMean = params.armXMean;
        generateGalaxy(scene);
    });

    gui.add(params, 'armYMean', 1, 100).onChange(() => {
        params.armYMean = params.armYMean;
        generateGalaxy(scene);
    });
}

const gui = new dat.GUI();
guiSliders(gui);

// Create the bloom composer
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0;
bloomPass.strength = 1.5;
bloomPass.radius = 0;

const bloomComposer = new EffectComposer(renderer);
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    bloomComposer.render();
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});