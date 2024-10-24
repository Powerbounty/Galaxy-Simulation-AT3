import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import * as dat from 'dat.gui';

// Initialize the bloom layer
const BLOOM_LAYER = 1;
const bloomLayer = new THREE.Layers();
bloomLayer.set(BLOOM_LAYER);

// Constants for the galaxy
let GALAXY_THICKNESS = 9;
let CORE_X_DIST = 33;
let CORE_Y_DIST = 33;
let ARM_X_DIST = 100;
let ARM_Y_DIST = 50;
let ARM_X_MEAN = 200;
let ARM_Y_MEAN = 100;
let SPIRAL = 5;  
let ARMS = 2;      

// Parameters for the galaxy
const params = {
    starCount: 10000,       
    armSeparation: 0.1,     
    numArms: 4,             
    coreRadius: 1,          
    armWidth: 0.2,          
    noiseFactor: 0.5,       
    zSpread: 0.3,           
    colorByDistance: true,  
    density: 5,         
    galaxyThickens: GALAXY_THICKNESS,
    coreXDist: CORE_X_DIST,
    coreYDist: CORE_Y_DIST,
    armXDist: ARM_X_DIST,
    armYDist: ARM_Y_DIST,
    armXMean: ARM_X_MEAN,
    armYMean: ARM_Y_MEAN,
    spiral: SPIRAL,
    arms: ARMS 
};

const starColors = {
    O: 0x5D99E1, // Blue
    B: 0xA8C0E8, // Light Blue
    A: 0xFFFFFF, // White
    F: 0xFFD700, // Gold 
    G: 0xFFFACD, // Light Yellow 
    K: 0xFF8C00, // Orange
    M: 0xFF4500  // Red
};

const starTypeDistribution = {
    O: 0.01,
    B: 0.02,
    A: 0.2,
    F: 0.35,
    G: 0.25,
    K: 0.20,
    M: 0.15
};

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

// Create empty starfield object
let starField;

function generateGalaxy() {
    if (starField) scene.remove(starField); // Remove the old starfield when parameters change
    
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const sizes = [];

    const stars = generateObject(params.starCount, (pos) => {
        positions.push(pos.x, pos.y, pos.z);

        // Get a random star type and corresponding color
        const starType = getRandomStarType();
        const color = starColors[starType];

        // Set colors (r, g, b) for each star
        colors.push(((color >> 16) & 255) / 255); // Red
        colors.push(((color >> 8) & 255) / 255); // Green
        colors.push((color & 255) / 255); // Blue

        // Set a default size for each star
        sizes.push(1.0);

        return pos;
    });

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    // Material for the stars
    const material = new THREE.PointsMaterial({
        size: 0.7,
        transparent: true,
        vertexColors: true // Enable vertex colors
    });

    // Create the points (stars) from the geometry
    starField = new THREE.Points(geometry, material);
    starField.layers.enable(BLOOM_LAYER);
    scene.add(starField);
}

function generateObject(numStars, generator) {
    let objects = [];

    // Inner core stars
    for (let i = 0; i < numStars / 4; i++) {
        // Pass in a random position based on normal distribution
        let pos = new THREE.Vector3(gaussianRandom(0, CORE_X_DIST), gaussianRandom(0, CORE_Y_DIST), gaussianRandom(0, GALAXY_THICKNESS));
        let obj = generator(pos);
        objects.push(obj); // Add the object to the array
    }

    // Outer core stars
    for (let i = 0; i < numStars / 4; i++) {
        // Same as above but with spiral arm parameters passed as core values
        let pos = new THREE.Vector3(gaussianRandom(0, ARM_X_DIST), gaussianRandom(0, ARM_Y_DIST), gaussianRandom(0, GALAXY_THICKNESS));
        let obj = generator(pos);
        objects.push(obj);
    }

    // Spiral arm stars
    for (let j = 0; j < ARMS; j++) {
        for (let i = 0; i < numStars / 4; i++) {
            let pos = logarithmicSpiral(gaussianRandom(ARM_X_MEAN, ARM_X_DIST), gaussianRandom(ARM_Y_MEAN, ARM_Y_DIST), gaussianRandom(0, GALAXY_THICKNESS), j * 2 * Math.PI / ARMS);
            let obj = generator(pos);
            objects.push(obj);
        }
    }

    return objects;
}

// Function to get a random star type based on distribution
function getRandomStarType() {
    const rand = Math.random();
    let cumulativeProbability = 0;

    for (const [type, probability] of Object.entries(starTypeDistribution)) {
        cumulativeProbability += probability;
        if (rand < cumulativeProbability) {
            return type;
        }
    }
    return 'StarNotDefined'; // Edge case if type isnt defined
}

// Gaussian distribution for z axis
function normalDistribution(mean, stdev) {
    let u = 1 - Math.random();
    let v = Math.random();
    let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * stdev + mean;
}

// Gaussian distribution function for star positions
function gaussianRandom(mean = 0, stdev = 1) {
    let u = 1 - Math.random();
    let v = Math.random();
    let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * stdev + mean;
}

// Log Spiral function
function logarithmicSpiral(x, y, z, offset) {
    let r = Math.sqrt(x**2 + y**2);
    let theta = offset;
    theta += x > 0 ? Math.atan(y / x) : Math.atan(y / x) + Math.PI;
    theta += (r / ARM_X_DIST) * SPIRAL;
    return new THREE.Vector3(r * Math.cos(theta), r * Math.sin(theta), z);
}

// Call the galaxy generation function
generateGalaxy();

function guiSliders(gui) {
    gui.add(params, 'starCount', 1000, 50000).onChange(generateGalaxy); 
    gui.add(params, 'density', 1, 10).onChange(generateGalaxy); // Add density control

    gui.add(params, 'galaxyThickens', 1, 20).onChange(() => {
        GALAXY_THICKNESS = params.galaxyThickens;
        generateGalaxy();
    });

    gui.add(params, 'arms', 1, 10).onChange(() => { 
        ARMS = params.arms;
        generateGalaxy();
    });

    gui.add(params, 'spiral', 0, 10).onChange(() => {
        SPIRAL = params.spiral;
        generateGalaxy();
    });

    gui.add(params, 'coreXDist', 1, 100).onChange(() => {
        CORE_X_DIST = params.coreXDist;
        generateGalaxy();
    });

    gui.add(params, 'coreYDist', 1, 100).onChange(() => {
        CORE_Y_DIST = params.coreYDist;
        generateGalaxy();
    });

    gui.add(params, 'armXDist', 1, 100).onChange(() => {
        ARM_X_DIST = params.armXDist;
        generateGalaxy();
    });

    gui.add(params, 'armYDist', 1, 100).onChange(() => {
        ARM_Y_DIST = params.armYDist;
        generateGalaxy();
    });

    gui.add(params, 'armXMean', 1, 100).onChange(() => {
        ARM_X_MEAN = params.armXMean;
        generateGalaxy();
    });

    gui.add(params, 'armYMean', 1, 100).onChange(() => {
        ARM_Y_MEAN = params.armYMean;
        generateGalaxy();
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