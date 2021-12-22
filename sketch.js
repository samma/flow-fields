// For generating flow fields and store video.

let projectName = "Flow-Fields-";

// Flow field settings
let startSeed = 1;
let endSeed = 1250;
let aliasScaling = 2.0; // render high res, then reduce res and blur for better video.

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
let canvasSize = aliasScaling*800;
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

  // Playing around with seed numbers because it seems seeds close to eachother are to similar
  randomSeed((seed*seed*seed) % 100000);
  noiseSeed((seed*seed*seed) % 100000);

  // Equal chance to create a border or not
  let drawBorders = true;
  let border = drawBorders ? canvasSize / 45 : 0;

  let width = canvasSize - border * 2;
  let height = width
  let originx = border;
  let originy = border;

  // Settings for the actual flowfields
  let screenDivisions = 1;
  let numberOfFlows = floor(random(30, 2000));
  let turbulence = random(0.00001, 0.002);
  let velocity = random(0.8, 1.5)/(turbulence*100); // Adjust particle speed to match the topology
  let marginBetweenFields = floor(border / 3); // Border between fields

  // For creating multiple flow fields in same window
  let griddivs = selectDivisions();   
  let gridSize = floor(width / griddivs);
  let gridCoordinates = createGridCoordinates(originx, originy, width, height, griddivs);
  let palettes = Palette.generatePalettes(gridCoordinates.length, random(1, 5));

  let sumColors = summarizeColorNum(palettes);
  let sumNumberOfFlows = getNumberofFlow(numberOfFlows, griddivs);
  let gridDivsAsString = numberToReadableString(griddivs);

  console.log("numberOfFlows: ", numberOfFlows);
  console.log("sumNumberOfFlows: ", sumNumberOfFlows);

  backgroundColor = selectBackgroundColor();
  background(backgroundColor)

  // 50 % chance of this being true
  let lineMode = selectLineMode();

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
    "lineMode": lineMode
  };

  // Print settings to console
  console.log("Settings: ", settings);

  // Create the flow fields
  for (let i = 0; i < gridCoordinates.length; i++) {
    let x = gridCoordinates[i].x;
    let y = gridCoordinates[i].y;
    fields.push(new FlowField(x, y, gridSize, gridSize, screenDivisions, turbulence, velocity, numberOfFlows, backgroundColor, palettes[i], marginBetweenFields, griddivs, lineMode));
  }

  let metaData = generateMetaData(settings);
  savePrettyJSONfileWithLineBreaks(projectName + str(seed) + '-metadata.json', metaData);

  // print attributes to console
  console.log("Metadata: ", metaData);
  
  // Decides how many pieces to chop the video into
  // 75 % chance of one, 15% chance of two, 5% chance of three, 4% chance of four, 1% chance of five
  function selectDivisions() {
    let randomNum = random(0,1);
    console.log("randomNum: ", randomNum);
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

function getNumberofFlow(numberOfFlows, griddivs) {
  return numberOfFlows * griddivs * griddivs;
}

function summarizeColorNum(palettes) {
  let sumColors = 0
  for (let i = 0; i < palettes.length; i++) {
    let numColors = palettes[i].getNumColors();
    sumColors += numColors;
  }
  return sumColors;
}

// 30% chance of plain background, 5% chance of Signe
function selectBackgroundColor() {
  let randomNum = random(0,1);
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
    return "None"
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

// 20% chance of fat, 40% chance of regular, 40% chance of Varied
function selectLineMode() {
  let randomNum = random(1);
  if (randomNum < 0.1) {
    return "Thicc";
  } else if (randomNum < 0.6) {
    return "Regular";
  } else {
    return "Varied";
  }
}

function getNameOfArtPiece(settings) {
  return "Flow Fields #" + str(settings.seed)
}

function getDescriptionOfArtPiece() {
  return "Smooth lines and particles form to illustrate intricate outlines of a secret unrevealed generated art piece - the end result of which is Flow Fields."
}

// Download an object as a JSON file with error handling
function saveStructAsJSON(filename, data) {
  var a = document.createElement("a");
  a.download = filename;
  a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
  a.click();
}

function savePrettyJSONfileWithLineBreaks(filename, data) {
  var a = document.createElement("a");
  a.download = filename;
  a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
  a.click();
}


/* Generated meta data:
{
"name": "..."
"description": "..."
"image": "...."(this is just a link for IPFS)
"attributes": [{"trait_type": "Background Color", "trait_value": "Floral White"},....,  {}]
}
*/

function generateMetaData(settings) {
  let metaData = {
    "name": getNameOfArtPiece(settings),
    "description": getDescriptionOfArtPiece(),
    "image": "https://ipfs.io/",
    "attributes": genereateAttributes(settings)
  }
  return metaData;
}

function genereateAttributes(settings) {
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
      "trait_type": "Duplication",
      "value": settings.gridDivsAsString
    }, {
      "trait_type": "Line Mode",
      "value": settings.lineMode
    }
  ];

  if ("Dark Sea Green" == getPrintableNameOfColor(settings.backgroundColor)) {
    let signeTrait = {
      "trait_type": "Special",
      "value": "Signes Color"
    };
    attributes.push(signeTrait);
  }

  return attributes;

}


