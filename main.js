// imports
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as dat from 'dat.gui';

// Constants for the galaxy
const GALAXY_THICKNESS = 5;
const CORE_X_DIST = 33;
const CORE_Y_DIST = 33;
const ARM_X_DIST = 100;
const ARM_Y_DIST = 50;
const ARM_X_MEAN = 200;
const ARM_Y_MEAN = 100;
const SPIRAL_TIGHTNESS = 1.5;  // Higher values make a tighter spiral
const ARMS = 4;                // Number of arms in the galaxy
const SPIRAL_ANGLE_OFFSET = Math.PI / 3;  // Controls the winding of the arms

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
    armSeparation: 0.5,     // Tightness of spiral arms
    numArms: 4,             // Number of spiral arms
    coreRadius: 1,          // Radius of the galactic core
    armWidth: 0.2,          // Width of each spiral arm
    noiseFactor: 0.2,       // Randomness in star placement
    zSpread: 0.3,           // Spread in Z-axis for a 3D effect
    colorByDistance: true   // Color stars based on distance
};

// Function to create the galaxy's stars
let starField;

function generateGalaxy() {
    if (starField) scene.remove(starField); // Remove the old starfield when parameters change
    
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const sizes = [];

    const arms = params.numArms; // Number of spiral arms
    const density = 5; // Stars per arm
    const a = 1; // Constant for Archimedean spiral
    const b = 0.1; // Constant for Archimedean spiral

    for (let i = 0; i < params.starCount; i++) {
        // Calculate the angle and radius for spiral placement
        let armIndex = i % arms;
        let angle = (i / density) * (Math.PI * 2) / arms + armIndex * params.armSeparation; // Spiral angle
        let radius = a + b * angle; // Archimedean spiral radius

        // Add noise to the radius and angle
        radius += (Math.random() - 0.5) * params.noiseFactor;
        angle += (Math.random() - 0.5) * params.noiseFactor;

        // Calculate x, y positions in a spiral pattern
        let x = radius * Math.cos(angle);
        let y = radius * Math.sin(angle);
        let z = normalDistribution(0, params.zSpread); // Slight random z offset for depth

        // Set positions for each star (x, y, z)
        positions.push(x, y, z);

        // Get a random star type and corresponding color
        const starType = getRandomStarType();
        const color = starColors[starType];

        // Set colors (r, g, b) for each star
        colors.push(((color >> 16) & 255) / 255); // Red
        colors.push(((color >> 8) & 255) / 255); // Green
        colors.push((color & 255) / 255); // Blue

        // Set a default size for each star
        sizes.push(1.0);
    }

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
    return 'terrence'; // edge case
}

// Normal distribution function for z offset
function normalDistribution(mean, stdev) {
    let u = 1 - Math.random();
    let v = Math.random();
    let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * stdev + mean;
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

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});