// For generating flow fields and store video.

let projectName = "Flow-Fields-";

// Flow field settings
const targetNumOfPaintingsToGenerate = 100

let startSeed = 0;
const numVideosToGenerate = targetNumOfPaintingsToGenerate - startSeed; // Total number of fields to generate

// Video and thumbnail capture settings
let enableSaveThumbnail = false;
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
  // print startSeed to console
  console.log("Start seed: ", startSeed);

  createCanvas(canvasSize, canvasSize);
  frameRate(frate);
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
  
  colorMode(HSB);


  // Equal chance to create a border or not
  let drawBorders = true;
  let border = drawBorders ? canvasSize / 45 : 0;

  let width = canvasSize - border * 2;
  let height = width
  let originx = border;
  let originy = border;

  // Settings for the actual flowfields
  let screenDivisions = 1;
  let numberOfFlows = floor(random(20, 1500));
  let turbulence = random(0.0001, 0.015);
  turbulence = round(turbulence * 100000) / 100000;   // Round noisescale to 5 decimals

  let velocity = (random(0.002, 0.03) / 2) / turbulence; // Adjust particle speed to match the topology
  velocity = round(velocity * 100000) / 100000;   // Round particle speed to 5 decimals

  let marginBetweenFields = floor(border / 10); // Border between fields

  // For creating multiple flow fields in same window
  let griddivs = selectDivisions();

  turbulence = turbulence / griddivs;
  let gridSize = floor(width / griddivs);
  let gridCoordinates = createGridCoordinates(originx, originy, width, height, griddivs);
  let palettes = Palette.generatePalettes(gridCoordinates.length, random(1, 5));

  // for each palette in palettes
  let sumColors = 0;
  for (let i = 0; i < palettes.length; i++) {
    let numColors = palettes[i].getNumColors();
    sumColors += numColors;
  }

  let sumNumberOfFlows = numberOfFlows * griddivs * griddivs;
  let gridDivsAsString = numberToReadableString(griddivs);

  backgroundColor = selectBackgroundColor();
  background(backgroundColor)

  let c = convertHSBColorToRGBColor(backgroundColor)
  let cname = getColorName(c[0], c[1], c[2]);
  console.log(cname);

  // Write all the settings to a JSON file
  settings = {
    "seed": seed,
    "screenDivisions": screenDivisions,
    "sumNumberOfFlows": sumNumberOfFlows,
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
    "sumColors": sumColors,
    "gridDivsAsString": gridDivsAsString
  };

  // Print settings to console
  console.log("Settings: ", settings);

  // Create the flow fields
  for (let i = 0; i < gridCoordinates.length; i++) {
    let x = gridCoordinates[i].x;
    let y = gridCoordinates[i].y;
    fields.push(new FlowField(x, y, gridSize, gridSize, screenDivisions, turbulence, velocity, numberOfFlows, backgroundColor, palettes[i], marginBetweenFields, griddivs));
  }


  let attributes = genereateAttributeFile(settings);
  saveStructAsJSON(projectName + str(seed) + '-attributes.json', attributes);

  // print attributes to console
  console.log("Attributes: ", attributes);
  
  // Decides how many pieces to chop the video into
  // 75 % chance of one, 15% chance of two, 5% chance of three, 4% chance of four, 1% chance of five
  function selectDivisions() {
    let randomNum = random(1);
    print("Random number: ", randomNum);
    if (randomNum < 0.75) {
      return 1;
    } else if (randomNum < 0.9) {
      return 2;
    } else if (randomNum < 0.95) {
      return 3;
    } else if (randomNum < 0.99) {
      return 4;
    } else {
      return 5;
    }
  }
}

// 20% chance of plain background, 5% chance of Signe
function selectBackgroundColor() {
  let randomNum = random(1);
  if (randomNum < 0.2) {
    return color(40, 6, 100); // Plain background
  } else if (randomNum < 0.25) {
    return color(127, 20, 71) // Signes color
  } else {
    return generateRandomHSBColor();
  }
}

function numberToReadableString(number) {
  if (number == 1) {
    return "Single"
  } else if (number == 2) {
    return "Double"
  } else if (number == 3) {
    return "Triple"
  } else if (number == 4) {
    return "Quadruple"
  } else {
    return "Undefined"
  }
}

// Download an object as a JSON file with error handling
function saveStructAsJSON(filename, data) {
  var a = document.createElement("a");
  a.download = filename;
  a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
  a.click();
}

function genereateAttributeFile(settings) {
  let turbulenceScaling = 100;
  let velocityScaling = 2;
  let attributes = [
    {
      "trait_type": "Background Color",
      "value": getColorNameOfHSB(settings.backgroundColor)
    }, {
      "trait_type": "Number of Flows",
      "value": settings.sumNumberOfFlows
    }, {
      "trait_type": "Turbulence",
      "value": settings.turbulence * turbulenceScaling
    }, {
      "trait_type": "Velocity",
      "value": settings.velocity * velocityScaling
    }, {
      "trait_type": "Colors",
      "value": settings.sumColors
    }, {
      "display_type": "number", // Show it under "stats"
      "trait_type": "Seed",
      "value": settings.seed
    }, {
      "trait_type": "Division",
      "value": settings.gridDivsAsString
    }
  ];

  if ("Dark Sea Green" == getColorNameOfHSB(settings.backgroundColor)) {
    let signeTrait = {
      "trait_type": "Special",
      "value": "Signes Color"
    };
    attributes.push(signeTrait);
  }

  return attributes;

}


