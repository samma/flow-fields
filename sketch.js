// For generating flow fields and store video.

let projectName = "Flow-Fields-";

// Flow field settings
const targetNumOfPaintingsToGenerate = 3
let startSeed = 0 
const numVideosToGenerate = targetNumOfPaintingsToGenerate-startSeed; // Total number of fields to generate

// Video and thumbnail capture settings
let enableSaveThumbnail = true;
let enabledSaveVideos = true;
const frate = 60; // frame per second animated. Can be set high?
const videofrate = 60; // Output video
const numSecondsToCapture = 16;
const numberOfFramesToRecord = videofrate*numSecondsToCapture; // num of frames to record
const numSecondsToSkipAtStart = 0.5; // Skip some at the start, to avoid boring thumbnails at the start
const numFramesToSkipAtStart = videofrate*numSecondsToSkipAtStart;

let fields = [];
let canvasSize = 800;
var frameCount = 0;

// Like a constructor for the visualization
function setup() {
  createCanvas(canvasSize, canvasSize);
  frameRate(frate);
  colorMode(HSB);
  noStroke();

  renderVideos(numVideosToGenerate, startSeed).then(() => { console.log("Done end of setup"); });
}

// Reset canvas between videos
function resetCanvas() {
  fields = [];
  noStroke();
  background(0);
}

async function renderVideos(numVideosToGenerate, defaultseed) {
  let seed = defaultseed;
  for(let i = 0; i <= numVideosToGenerate; i++) {
    // render video and wait until it is finished before continuing the loop
    await new Promise(doneRecording => window.recordVideos(seed, doneRecording));
    seed = seed + 1;
    resetCanvas();
  }
}

function anim() {
  // Draw the flow field
  for (let i = 0; i < fields.length; i++) {
    fields[i].update();  
  }
}

async function recordVideos(seed, doneRecording) {
    console.log("Recording seed: " + seed);
    createFlowFieldWithRandomSettings(seed);
    await new Promise(finRender => recordVideoUntilFrame(numberOfFramesToRecord, seed, numFramesToSkipAtStart, finRender));
    console.log("Done recording seed: " + seed);
    doneRecording();
}

async function recordVideoUntilFrame(numFrames, seed, numFramesToSkipAtStart, finRender) {

    HME.createH264MP4Encoder().then(async encoder => {
      encoder.outputFilename = projectName + str(seed) + '.png';
      encoder.width = canvasSize;
      encoder.height = canvasSize;
      encoder.frameRate = videofrate;
      encoder.kbps = 10000; // video quality
      encoder.groupOfPictures = 120; // lower if you have fast actions.
      encoder.initialize();

      for (let frameCount = 0; frameCount < numFramesToSkipAtStart+numFrames; frameCount++) {
        anim();
        if (frameCount >= numFramesToSkipAtStart) {
          if (enableSaveThumbnail) {
            saveThumbnail(seed, frameCount, numFramesToSkipAtStart+numFrames-1);
          }
          encoder.addFrameRgba(drawingContext.getImageData(0, 0, canvasSize, canvasSize).data)
          await new Promise(resolve => window.requestAnimationFrame(resolve))
        }
      }

      encoder.finalize()
      if (enabledSaveVideos) {
          const uint8Array = encoder.FS.readFile(encoder.outputFilename);
          const anchor = document.createElement('a');
          anchor.href = URL.createObjectURL(new Blob([uint8Array], { type: 'video/mp4' }));
          anchor.download = encoder.outputFilename;
          anchor.click();
      }
      encoder.delete()
      console.log("encoder delete");
      finRender();
  })
}

function saveThumbnail(seed, frameCount,lastFrame) {
  saveThumbnailAtFrame(100, seed, frameCount);
  saveThumbnailAtFrame(lastFrame, seed, frameCount);   
}

function saveThumbnailAtFrame(frameToSave, seed, frameCount) {
  if (frameCount == frameToSave) {
    saveCanvas(canvas, projectName + str(seed) +'-frame'+frameCount, 'png');
  }
}

function createFlowFieldWithRandomSettings(seed) {
  randomSeed(seed);
  noiseSeed(seed);
  
  // Equal chance to create a border or not
  let drawBorders = true;
  let border = drawBorders ? canvasSize/45 : 0;

  let width = canvasSize - border*2;
  let height = width
  let originx = border;
  let originy = border;
  
  // Settings for the actual flowfields
  let screenDivisions = floor(2*random(1,4));
  let numberOfParticles = floor(random(20, 1500));
  let turbulence = random(0.0001, 0.015);
  turbulence = round(turbulence*100000)/100000;   // Round noisescale to 5 decimals

  let velocity = (random(0.002, 0.03)/2)/turbulence; // Adjust particle speed to match the topology
  velocity = round(velocity*100000)/100000;   // Round particle speed to 5 decimals

  let marginBetweenFields = floor(border/2); // Border between fields

  // For creating multiple flow fields in same window
  let griddivs = 1;
  let gridSize = floor(width/griddivs);
  let gridCoordinates = createGridCoordinates(originx, originy, width, height, griddivs);
  let palettes = Palette.generatePalettes(gridCoordinates.length, random(2,5));

  // Create HSB color 127, 20, 71
  backgroundColor = generateRandomHSBColor();
  background(backgroundColor)

  // Write all the settings to a JSON file
  let settings = {
    "seed": seed,
    "screenDivisions": screenDivisions,
    "numberOfParticles": numberOfParticles,
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
    "enableSaveTenSecondVideo": enabledSaveVideos,
    "numFramesToSkipAtStart": numFramesToSkipAtStart,
    "numFrames": numberOfFramesToRecord
  };

  downloadJSON(projectName + str(seed) + '-settings.json', settings);

  // Print settings to console
  console.log("Settings: ", settings);
  
  // Create the flow fields
  for (let i = 0; i < gridCoordinates.length; i++) {
    let x = gridCoordinates[i].x;
    let y = gridCoordinates[i].y;
    fields.push(new FlowField(x,y,gridSize,gridSize,screenDivisions,turbulence,velocity,numberOfParticles,backgroundColor,palettes[i], marginBetweenFields));
  }
}

    // Download an object as a JSON file with error handling
    function downloadJSON(filename, data) {
      var a = document.createElement("a");
      a.download = filename;
      a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
      a.click();
    }

class FlowField {
  constructor(originx, originy, width,height,screenDivisions, noiseScale, particleSpeed, numparticles, backgroundColor, palette, borderlimit) {
    this.originx = originx;
    this.originy = originy;
    this.width = width;
    this.height = height;
    this.screenDivisions = screenDivisions;
    this.noiseScale = noiseScale;
    this.particleSpeed = particleSpeed;
    this.numparticles = numparticles;
    this.backgroundColor = backgroundColor;
    this.particles = [];
    this.gradient;
    this.topology;
    this.palette = palette;
    this.borderlimit = borderlimit;
    this.createField();
    this.initParticles();
    this.drawBackground();
  }

  drawBackground() {
    // Draw a rectangle withing origins and w/l
    fill(this.backgroundColor);
    rect(this.originx, this.originy, this.width, this.height);
  }

  update() {
    this.updateAndDrawParticles();
  }

  createField() {
    this.topology = this.generateTopology(this.width / this.screenDivisions, this.height / this.screenDivisions);
    this.topology = this.addPerlinNoise(this.topology, this.width / this.screenDivisions, this.height / this.screenDivisions, this.noiseScale);
    this.gradient = this.calculateGradient(this.topology);
  }
  
  initParticles() {
    for (var i = 0; i < this.numparticles; i++) {
      let newLocation = getrandomPointInWindowWithBorder(this.width, this.height, this.borderlimit);
      let newStrokeWeight = random(1, 3)*random(1, 4);
      this.particles[i] = new Point(newLocation.x, newLocation.y, this.particleSpeed, this.screenDivisions, this.palette, newStrokeWeight);
    }
  }
  
  updateAndDrawParticles() {
    // Iterate over particles
    for (var i = 0; i < this.particles.length; i++) {
      this.particles[i].update(this.gradient);
      if (this.particles[i].isAlive(this.gradient, this.borderlimit) ){
        this.particles[i].displayAt(this.originx, this.originy);
      } else {
        // TODO remove the dead particle for performance, or keep regenerating them
        let newLocation = getrandomPointInWindowWithBorder(this.width, this.height, this.borderlimit);
        let newStrokeWeight = random(1, 3)*random(1, 4);
        this.particles[i] = new Point(newLocation.x, newLocation.y, this.particleSpeed, this.screenDivisions, this.palette, newStrokeWeight); 
      }
    }
  }

  drawField() {
    for (var i = 0; i < n; i++) {
      for (var j = 0; j < m; j++) {
        fill(this.topology[i][j]);
        rect(this.originx + i * this.screenDivisions, this.originy + j * this.screenDivisions, this.screenDivisions, this.screenDivisions);
      }
    }
  }

  drawGradient() {
    for (var i = 0; i < n; i++) {
      for (var j = 0; j < m; j++) {        
        fill(this.gradient[i][j].x,0,100);
        rect(this.originx + i * this.screenDivisions, this.originy + j * this.screenDivisions, this.screenDivisions, this.screenDivisions);
      
        fill(0,gradient[i][j].y,0,100);
        rect(this.originx + i * this.screenDivisions, this.originy + j * this.screenDivisions, this.screenDivisions, this.screenDivisions);
      }
    }
  }

  generateTopology(n, m) {
    var topology = [];
    for (var i = 0; i < n; i++) {
      topology[i] = [];
      for (var j = 0; j < m; j++) {
        topology[i][j] = 0;
      }
    }
    return topology;
  }

  addPerlinNoise(topology, n, m, scale) {
    for (var i = 0; i < n; i++) {
      for (var j = 0; j < m; j++) {
        topology[i][j] = 255*noise((this.originx+i)*scale, (this.originy+j)*scale);
      }
    }
    return topology;
  }

  calculateGradient(topology) {
    var gradient = [];
    for (var i = 0; i < topology.length; i++) {
      gradient[i] = [];
      for (var j = 0; j < topology[0].length; j++) {
        gradient[i][j] = this.calculateGradientAt(topology, i, j, topology.length, topology[0].length);
      }
    }
    return gradient
  }
  
  // Calculates the gradient vector at a given point in the topology.
  calculateGradientAt(topology, i, j) {
    var gradientVec = createVector(0, 0);
    
    if (i > 0 && i < topology.length - 1) {
      gradientVec.x -= topology[i - 1][j];
      gradientVec.x += topology[i + 1][j];
    } else {
      gradientVec.x = 0;
    }

    if (j > 0 && j < topology[0].length - 1) {
      gradientVec.y -= topology[i][j - 1];
      gradientVec.y += topology[i][j + 1];
    } else {
      gradientVec.y = 0;
    }

    return gradientVec;
  }
}

// Used for the moving dots / lines
class Point {
  constructor(x, y, speed, screenDivisions, palette, strokeWeight) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.screenDivisions = screenDivisions;
    this.previousX = x+1; // If prev and currenst is equal they will, the point will be killed
    this.previousY = y+1;
    this.strokeWeight = strokeWeight;
    this.palette = palette;

    // Set the color to a color from a theme
    this.color = this.palette.getRandomColor();
    this.color.setAlpha(10);
  }

  update(field) {
    this.previousX = this.x;
    this.previousY = this.y;

    // Round the position into a grid index
    let x = floor(this.x/this.screenDivisions);
    let y = floor(this.y/this.screenDivisions);  

    // Move perpendicular to gradient
    let perp = this.getPerpendicularVector(field[x][y])
    this.x += this.speed*perp.x;
    this.y += this.speed*perp.y;
  }

  displayAt(originx, originy){
    // Draw a line from the previous position to the current position
    stroke(this.color);
    strokeWeight(this.strokeWeight);
    line(originx + this.previousX, originy + this.previousY, originx + this.x, originy + this.y);
  }

  isAlive(field, borderlimit) {
    // Cast the position to a grid index
    let x = floor(this.x/this.screenDivisions);
    let y = floor(this.y/this.screenDivisions);

    // Check if x or y is outside the screen
    if (x < borderlimit || x >= field.length - borderlimit || y < borderlimit || y >= field[0].length - borderlimit) {
      return false;
    }
    
    // And check if the particle has stopped moving
    if (this.previousX == this.x && this.previousY == this.y) {
      return false;
    }
    return true;
  }

  getPerpendicularVector(v) {
    return createVector(-v.y, v.x);
  }
}

// Collection of colors
class Palette {
  constructor(colors) {
    this.colors = colors;
  }

  addColor(color) {
    this.colors.push(color);
  }

  getRandomColor() {
    return this.colors[Math.floor(Math.random() * this.colors.length)];
  }

  static generatePalettes(numPalettes, numColors) {
    let palettes = [];
    for (let i = 0; i < numPalettes; i++) {
      let palette = new Palette([]);
      for (let j = 0; j < numColors; j++) {
        palette.addColor(generateRandomHSBColor());
      }
      palettes.push(palette);
    }
    return palettes;
  }
}

// Various utility functions

function generateRandomHSBColor() {
  let hue = random(0, 360);
  let saturation = random(0, 100);
  let value = random(0, 100);
  return color(hue, saturation, value);
}

function getrandomPointInWindowWithBorder(width, height, borderlimit) {
  let x = floor(random(borderlimit, width - borderlimit));
  let y = floor(random(borderlimit, height - borderlimit));
  return createVector(x, y);
}

function getrandomPointInWindow(width, height) {
  return createVector(random(width), random(height));
}

function createGridCoordinates(originx, originy, width, height, gridSize) {
  let gridCoordinates = [];
  let xStep = width/gridSize;
  let yStep = height/gridSize;
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      let x = i*xStep + originx;
      let y = j*yStep + originy;
      gridCoordinates.push(createVector(x,y));
    }
  }
  return gridCoordinates;
}

