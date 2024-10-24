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

// Define BLOOM_LAYER
const BLOOM_LAYER = 1;

export { params, starColors, starTypeDistribution, BLOOM_LAYER, GALAXY_THICKNESS, CORE_X_DIST, CORE_Y_DIST, ARM_X_DIST, ARM_Y_DIST, ARM_X_MEAN, ARM_Y_MEAN, SPIRAL, ARMS };