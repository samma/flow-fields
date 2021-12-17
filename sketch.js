// For generating flow fields and store video.

let projectName = "Flow-Fields-";

// Flow field settings
let startSeed = 0;
let endSeed = 200;

const numVideosToGenerate = endSeed - startSeed; // Total number of fields to generate

// Video and thumbnail capture settings
let enableSaveThumbnail = true;
let enabledSaveVideos = true;
const frate = 30; // frame per second animated. Can be set high?
const videofrate = 30; // Output video
const numSecondsToCapture = 16;
const numberOfFramesToRecord = videofrate * numSecondsToCapture; // num of frames to record
const numSecondsToSkipAtStart = 0.5; // Skip some at the start, to avoid boring thumbnails at the start
const numFramesToSkipAtStart = videofrate * numSecondsToSkipAtStart;

let fields = [];
let canvasSize = 800;
var frameCount = 0;

let settings = {};

// Debug settings
let drawColorRect = false

// Like a constructor for the visualization
function setup() {
  colorMode(RGB);

  // print startSeed to console
  console.log("Start seed: ", startSeed);

  createCanvas(canvasSize, canvasSize);
  frameRate(frate);
  noStroke();

  if (enabledSaveVideos) {
    renderVideos(numVideosToGenerate, startSeed).then(() => { console.log("Done end of setup"); });
  }
}

function draw() {
  if (!enabledSaveVideos) {
    //anim(); 
  }
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

  // Draw a rectangle in the bottom right corner
  if (drawColorRect) {
    drawColorDebugRect();
  }
}

function drawColorDebugRect() {
  let colorname = getColorName(backgroundColor);
  console.log("Color name: ", colorname);
  fill(colorTable[colorname]);
  rect(width - 100, height - 100, 100, 100);
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
  let screenDivisions = 1;
  let numberOfFlows = floor(random(20, 1500));
  let turbulence = random(0.0003, 0.01);
  //turbulence = roundToDecimalPlaces(turbulence, 5);   // Round noisescale to 5 decimals

  let velocity = random(0.3, 1.5); // Adjust particle speed to match the topology
  //velocity = roundToDecimalPlaces(velocity, 5);   // Round particle speed to 5 decimals

  let marginBetweenFields = floor(border / 3); // Border between fields

  // For creating multiple flow fields in same window
  let griddivs = selectDivisions();
  //velocity = velocity * griddivs;

  //turbulence = turbulence / griddivs;
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

  // 50 % chance of this being true
  let fatterLines = random(1) < 0.5;

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
    "gridDivsAsString": gridDivsAsString,
    "fatterLines": fatterLines
  };

  // Print settings to console
  console.log("Settings: ", settings);

  // Create the flow fields
  for (let i = 0; i < gridCoordinates.length; i++) {
    let x = gridCoordinates[i].x;
    let y = gridCoordinates[i].y;
    fields.push(new FlowField(x, y, gridSize, gridSize, screenDivisions, turbulence, velocity, numberOfFlows, backgroundColor, palettes[i], marginBetweenFields, griddivs, fatterLines));
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

// 30% chance of plain background, 5% chance of Signe
function selectBackgroundColor() {
  let randomNum = random(1);
  if (randomNum < 0.3) {
    return color(255,250,240); // Plain background
  } else if (randomNum < 0.35) {
    return color(143,188,143) // Signes color, "Dark Sea Green"
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
  } else if (number == 5) {
    return "Quintuple"
  } else {
    return "?????"
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
  let attributes = [
    {
      "trait_type": "Background Color",
      "value": getPrintableNameOfColor(settings.backgroundColor)
    }, {
      "trait_type": "Number of Flows",
      "value": settings.sumNumberOfFlows
    }, {
      "trait_type": "Turbulence",
      "value": roundToDecimalPlaces(settings.turbulence, 5)
    }, {
      "trait_type": "Velocity",
      "value": roundToDecimalPlaces(settings.velocity, 5)
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

  if ("Dark Sea Green" == getPrintableNameOfColor(settings.backgroundColor)) {
    let signeTrait = {
      "trait_type": "Special",
      "value": "Signes Color"
    };
    attributes.push(signeTrait);
  }

  if (settings.fatterLines) {
    let fatterLinesTrait = {
      "trait_type": "Flow Modifier",
      "value": "Thicc"
    };
    attributes.push(fatterLinesTrait);
  }

  return attributes;

}


