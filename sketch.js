// For generating flow fields and store video.

let projectName = "Flow-Fields-";

// Flow field settings
const targetNumOfPaintingsToGenerate = 15

let startSeed = 0;
const numVideosToGenerate = 5;//targetNumOfPaintingsToGenerate - startSeed; // Total number of fields to generate

// Video and thumbnail capture settings
let enableSaveThumbnail = true;
let enabledSaveVideos = true;
const frate = 60; // frame per second animated. Can be set high?
const videofrate = 60; // Output video
const numSecondsToCapture = 16;
const numberOfFramesToRecord = videofrate * numSecondsToCapture; // num of frames to record
const numSecondsToSkipAtStart = 0.5; // Skip some at the start, to avoid boring thumbnails at the start
const numFramesToSkipAtStart = videofrate * numSecondsToSkipAtStart;

let fields = [];
let canvasSize = 800;
var frameCount = 0;

let settings = {};

// Like a constructor for the visualization
function setup() {

  startSeed = Math.floor(random(100, 300));
  // print startSeed to console
  console.log("Start seed: ", startSeed);

  createCanvas(canvasSize, canvasSize);
  frameRate(frate);
  colorMode(HSB);
  noStroke();

  renderVideos(numVideosToGenerate, startSeed).then(() => { console.log("Done end of setup"); });
}


async function renderVideos(numVideosToGenerate, defaultseed) {
  for (let useSeed = defaultseed; useSeed <= defaultseed + numVideosToGenerate; useSeed++) {
    // render video and wait until it is finished before continuing the loop
    await new Promise(doneRecording => window.recordVideos(useSeed, doneRecording));
    resetCanvas();
  }
}

function anim() {
  // Draw the flow field
  for (let i = 0; i < fields.length; i++) {
    fields[i].update();
  }
}

// Reset canvas between videos
function resetCanvas() {
  fields = [];
  noStroke();
  background(0);
}

function createFlowFieldWithRandomSettings(seed) {
  randomSeed(seed);
  noiseSeed(seed);

  // Equal chance to create a border or not
  let drawBorders = true;
  let border = drawBorders ? canvasSize / 45 : 0;

  let width = canvasSize - border * 2;
  let height = width
  let originx = border;
  let originy = border;

  // Settings for the actual flowfields
  let screenDivisions = floor(2 * random(1, 4));
  let numberOfFlows = floor(random(20, 1500));
  let turbulence = random(0.0001, 0.015);
  turbulence = round(turbulence * 100000) / 100000;   // Round noisescale to 5 decimals

  let velocity = (random(0.002, 0.03) / 2) / turbulence; // Adjust particle speed to match the topology
  velocity = round(velocity * 100000) / 100000;   // Round particle speed to 5 decimals

  let marginBetweenFields = floor(border / 2); // Border between fields

  // For creating multiple flow fields in same window
  let griddivs = 1;
  let gridSize = floor(width / griddivs);
  let gridCoordinates = createGridCoordinates(originx, originy, width, height, griddivs);
  let palettes = Palette.generatePalettes(gridCoordinates.length, random(1, 7));

  let numColors = palettes[0].getNumColors();

  // Create HSB color 127, 20, 71
  backgroundColor = generateRandomHSBColor();
  background(backgroundColor)

  let c = convertHSBColorToRGBColor(backgroundColor)
  let cname = getColorName(c[0], c[1], c[2]);
  console.log(cname);

  // Write all the settings to a JSON file
  settings = {
    "seed": seed,
    "screenDivisions": screenDivisions,
    "numberOfFlows": numberOfFlows,
    "turbulence": turbulence,
    "velocity": velocity,
    "marginBetweenFields": marginBetweenFields,
    "griddivs": griddivs,
    "gridSize": gridSize,
    "palettes": palettes,
    "backgroundColor": backgroundColor,
    "drawBorders": drawBorders,
    "projectName": projectName,
    "canvasSize": canvasSize,
    "videofrate": videofrate,
    "enabledSaveVideos": enabledSaveVideos,
    "numFramesToSkipAtStart": numFramesToSkipAtStart,
    "numFrames": numberOfFramesToRecord,
    "numColors": numColors
  };

  // Print settings to console
  console.log("Settings: ", settings);

  // Create the flow fields
  for (let i = 0; i < gridCoordinates.length; i++) {
    let x = gridCoordinates[i].x;
    let y = gridCoordinates[i].y;
    fields.push(new FlowField(x, y, gridSize, gridSize, screenDivisions, turbulence, velocity, numberOfFlows, backgroundColor, palettes[i], marginBetweenFields));
  }


  let attributes = genereateAttributeFile(settings);
  saveStructAsJSON(projectName + str(seed) + '-attributes.json', attributes);

  // print attributes to console
  console.log("Attributes: ", attributes);

}

// Download an object as a JSON file with error handling
function saveStructAsJSON(filename, data) {
  var a = document.createElement("a");
  a.download = filename;
  a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
  a.click();
}

function genereateAttributeFile(settings) {
  let attributes = [
    {
      "trait_type": "Background Color",
      "value": getColorNameOfHSB(settings.backgroundColor)
    }, {
      "trait_type": "Number of Flows",
      "value": settings.numberOfFlows
    }, {
      "trait_type": "Turbulence",
      "value": settings.turbulence
    }, {
      "trait_type": "Velocity",
      "value": settings.velocity
    }, {
      "trait_type": "Colors",
      "value": settings.numColors
    }, {
      "display_type": "number", // Show it under "stats"
      "trait_type": "Seed",
      "value": settings.seed
    }

  ];

  return attributes;

}


