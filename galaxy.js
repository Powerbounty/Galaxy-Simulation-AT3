import * as THREE from 'three';
import { BLOOM_LAYER, params, starColors, starTypeDistribution, GALAXY_THICKNESS, CORE_X_DIST, CORE_Y_DIST, ARM_X_DIST, ARM_Y_DIST, ARM_X_MEAN, ARM_Y_MEAN, SPIRAL, ARMS } from './utils.js';

// create empty starfield object
let starField;

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

function generateGalaxy(scene) {
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
    return 'StarNotDefined'; // Edge case if type isnt defined
}

// guassian distribution for z axis
function normalDistribution(mean, stdev) {
    let u = 1 - Math.random();
    let v = Math.random();
    let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * stdev + mean;
}

// Guassian distribution function for star positions
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

export { generateGalaxy };