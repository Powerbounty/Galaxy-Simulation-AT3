import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as dat from 'dat.gui';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

const BLOOM_LAYER = 1;
const bloomLayer = new THREE.Layers();
bloomLayer.set(BLOOM_LAYER);

// Constants for the galaxy
const GALAXY_THICKNESS = 9;
const CORE_X_DIST = 33;
const CORE_Y_DIST = 33;
const ARM_X_DIST = 100;
const ARM_Y_DIST = 50;
const ARM_X_MEAN = 200;
const ARM_Y_MEAN = 100;
const SPIRAL = 5;  // Strength of the spiral force
const ARMS = 2;      // Number of arms in the galaxy

// Define star colors based on types with more warm colors
const starColors = {
    O: 0x5D99E1, // Blue
    B: 0xA8C0E8, // Light Blue
    A: 0xFFFFFF, // White
    F: 0xFFD700, // Gold (Warm Yellow)
    G: 0xFFFACD, // Light Yellow (Lemon Chiffon)
    K: 0xFF8C00, // Orange
    M: 0xFF4500  // Red
};

// Adjusted star type distribution for more warm colors
const starTypeDistribution = {
    O: 0.01,
    B: 0.02,
    A: 0.2,
    F: 0.35,
    G: 0.25,
    K: 0.20,
    M: 0.15
};

// Initialize the scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Camera positioning
camera.position.z = 50;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Parameters for the galaxy
const params = {
    starCount: 10000,       // Number of stars
    armSeparation: 0.1,     // Tightness of spiral arms
    numArms: 4,             // Number of spiral arms
    coreRadius: 1,          // Radius of the galactic core
    armWidth: 0.2,          // Width of each spiral arm
    noiseFactor: 0.5,       // Randomness in star placement
    zSpread: 0.3,           // Spread in Z-axis for a 3D effect
    colorByDistance: true,  // Color stars based on distance
    density: 5              // Density of stars in the spiral arms
};

// Function to create the galaxy's stars
let starField;

function generateObject(numStars, generator) {
    let objects = [];

    // Inner core stars
    for (let i = 0; i < numStars / 4; i++) {
        let pos = new THREE.Vector3(gaussianRandom(0, CORE_X_DIST), gaussianRandom(0, CORE_Y_DIST), gaussianRandom(0, GALAXY_THICKNESS));
        let obj = generator(pos);
        objects.push(obj);
    }

    // Outer core stars
    for (let i = 0; i < numStars / 4; i++) {
        let pos = new THREE.Vector3(gaussianRandom(0, ARM_X_DIST), gaussianRandom(0, ARM_Y_DIST), gaussianRandom(0, GALAXY_THICKNESS));
        let obj = generator(pos);
        objects.push(obj);
    }

    // Spiral arm stars
    for (let j = 0; j < ARMS; j++) {
        for (let i = 0; i < numStars / 4; i++) {
            let pos = spiral(gaussianRandom(ARM_X_MEAN, ARM_X_DIST), gaussianRandom(ARM_Y_MEAN, ARM_Y_DIST), gaussianRandom(0, GALAXY_THICKNESS), j * 2 * Math.PI / ARMS);
            let obj = generator(pos);
            objects.push(obj);
        }
    }

    return objects;
}

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
    return 'M'; // Default to M type if not assigned
}

// Normal distribution function for z offset
function normalDistribution(mean, stdev) {
    let u = 1 - Math.random();
    let v = Math.random();
    let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * stdev + mean;
}

// Gaussian random function
export function gaussianRandom(mean = 0, stdev = 1) {
    let u = 1 - Math.random();
    let v = Math.random();
    let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * stdev + mean;
}

// Spiral function
function spiral(x, y, z, offset) {
    let r = Math.sqrt(x**2 + y**2);
    let theta = offset;
    theta += x > 0 ? Math.atan(y / x) : Math.atan(y / x) + Math.PI;
    theta += (r / ARM_X_DIST) * SPIRAL;
    return new THREE.Vector3(r * Math.cos(theta), r * Math.sin(theta), z);
}

// Call the galaxy generation function
generateGalaxy();

// Add dat.GUI for real-time control of parameters
const gui = new dat.GUI();
gui.add(params, 'starCount', 1000, 50000).onChange(generateGalaxy); 
gui.add(params, 'armSeparation', 0.1, 2).onChange(generateGalaxy);
gui.add(params, 'numArms', 1, 10).step(1).onChange(generateGalaxy);
gui.add(params, 'coreRadius', 0.5, 5).onChange(generateGalaxy); 
gui.add(params, 'armWidth', 0.1, 1).onChange(generateGalaxy); 
gui.add(params, 'noiseFactor', 0, 1).onChange(generateGalaxy);
gui.add(params, 'zSpread', 0, 2).onChange(generateGalaxy); 
gui.add(params, 'colorByDistance').onChange(generateGalaxy);
gui.add(params, 'density', 1, 10).onChange(generateGalaxy); // Add density control

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