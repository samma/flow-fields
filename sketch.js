// For generating flow fields and store video.

let projectName = "Flow-Fields-";

// Flow field settings
const targetNumOfPaintingsToGenerate = 15
let startSeed = 5
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
  for(let useSeed = defaultseed; useSeed <= numVideosToGenerate; useSeed++) {
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
  let palettes = Palette.generatePalettes(gridCoordinates.length, random(1,7));
  
  let numColors = palettes[0].getNumColors();

  // Create HSB color 127, 20, 71
  backgroundColor = generateRandomHSBColor();
  background(backgroundColor)

  let c = convertHSBColorToRGBColor(backgroundColor)
  let cname = getColorName(c[0], c[1], c[2]);
  console.log(cname);

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
    "enabledSaveVideos": enabledSaveVideos,
    "numFramesToSkipAtStart": numFramesToSkipAtStart,
    "numFrames": numberOfFramesToRecord,
    "numColors": numColors
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

  getNumColors() {
    return this.colors.length;
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

// A function for converting RGB values to color name. Example input: RGB(255,255,255), Example output: "White".
function getColorName(r, g, b) {
  let minDistance = Infinity;
  let closestColorName = "";
  for (let colorName in colorTable) {
    let distance = getColorDistance(colorTable[colorName], [r, g, b]);
    if (distance < minDistance) {
      minDistance = distance;
      closestColorName = colorName;
    }
  }
  return closestColorName;
}

function getColorDistance(color1, color2) {
  let distance = 0;
  for (let i = 0; i < 3; i++) {
    distance += Math.pow(color1[i] - color2[i], 2);
  }
  return Math.sqrt(distance);
}

function convertHSBColorToRGBColor(c) {
  return [red(c), green(c), blue(c)];
}

function hsbToRGB(h, s, b) {
  let c = color(h, s, b);
  colorMode(RGB);
  let red = red(c);
  let green = green(c);
  let blue = blue(c);
  return [red, green, blue];
}

let colorTable = {
  "maroon": [128, 0, 0],
  "dark red": [139, 0, 0],
  "brown": [165, 42, 42],
  "fire brick": [178, 34, 34],
  "crimson": [220, 20, 60],
  "red": [255, 0, 0],
  "tomato": [255, 99, 71],
  "coral": [255, 127, 80],
  "indian red": [205, 92, 92],
  "light coral": [240, 128, 128],
  "dark salmon": [233, 150, 122],
  "salmon": [250, 128, 114],
  "light salmon": [255, 160, 122],
  "orange red": [255, 69, 0],
  "dark orange": [255, 140, 0],
  "orange": [255, 165, 0],
  "gold": [255, 215, 0],
  "dark golden rod": [184, 134, 11],
  "golden rod": [218, 165, 32],
  "pale golden rod": [238, 232, 170],
  "dark khaki": [189, 183, 107],
  "khaki": [240, 230, 140],
  "olive": [128, 128, 0],
  "yellow": [255, 255, 0],
  "yellow green": [154, 205, 50],
  "dark olive green": [85, 107, 47],
  "olive drab": [107, 142, 35],
  "lawn green": [124, 252, 0],
  "chartreuse": [127, 255, 0],
  "green yellow": [173, 255, 47],
  "dark green": [0, 100, 0],
  "green": [0, 128, 0],
  "forest green": [34, 139, 34],
  "lime": [0, 255, 0],
  "lime green": [50, 205, 50],
  "light green": [144, 238, 144],
  "pale green": [152, 251, 152],
  "dark sea green": [143, 188, 143],
  "medium spring green": [0, 250, 154],
  "spring green": [0, 255, 127],
  "sea green": [46, 139, 87],
  "medium aquamarine": [102, 205, 170],
  "medium sea green": [60, 179, 113],
  "light sea green": [32, 178, 170],
  "dark slate gray": [47, 79, 79],
  "teal": [0, 128, 128],
  "dark cyan": [0, 139, 139],
  "aqua": [0, 255, 255],
  "cyan": [0, 255, 255],
  "light cyan": [224, 255, 255],
  "dark turquoise": [0, 206, 209],
  "turquoise": [64, 224, 208],
  "medium turquoise": [72, 209, 204],
  "pale turquoise": [175, 238, 238],
  "aquamarine": [127, 255, 212],
  "powder blue": [176, 224, 230],
  "cadet blue": [95, 158, 160],
  "steel blue": [70, 130, 180],
  "cornflower blue": [100, 149, 237],
  "deep sky blue": [0, 191, 255],
  "dodger blue": [30, 144, 255],
  "light blue": [173, 216, 230],
  "sky blue": [135, 206, 235],
  "light sky blue": [135, 206, 250],
  "midnight blue": [25, 25, 112],
  "navy": [0, 0, 128],
  "dark blue": [0, 0, 139],
  "medium blue": [0, 0, 205],
  "blue": [0, 0, 255],
  "royal blue": [65, 105, 225],
  "blue violet": [138, 43, 226],
  "indigo": [75, 0, 130],
  "dark slate blue": [72, 61, 139],
  "slate blue": [106, 90, 205],
  "medium slate blue": [123, 104, 238],
  "medium purple": [147, 112, 219],
  "dark magenta": [139, 0, 139],
  "dark violet": [148, 0, 211],
  "dark orchid": [153, 50, 204],
  "medium orchid": [186, 85, 211],
  "purple": [128, 0, 128],
  "thistle": [216, 191, 216],
  "plum": [221, 160, 221],
  "violet": [238, 130, 238],
  "fuchsia": [255, 0, 255],
  "orchid": [218, 112, 214],
  "medium violet red": [199, 21, 133],
  "pale violet red": [219, 112, 147],
  "deep pink": [255, 20, 147],
  "hot pink": [255, 105, 180],
  "light pink": [255, 182, 193],
  "pink": [255, 192, 203],
  "antique white": [250, 235, 215],
  "beige": [245, 245, 220],
  "bisque": [255, 228, 196],
  "blanched almond": [255, 235, 205],
  "wheat": [245, 222, 179],
  "corn silk": [255, 248, 220],
  "lemon chiffon": [255, 250, 205],
  "light golden rod yellow": [250, 250, 210],
  "light yellow": [255, 255, 224],
  "saddle brown": [139, 69, 19],
  "sienna": [160, 82, 45],
  "chocolate": [210, 105, 30],
  "peru": [205, 133, 63],
  "sandy brown": [244, 164, 96],
  "burly wood": [222, 184, 135],
  "tan": [210, 180, 140],
  "rosy brown": [188, 143, 143],
  "moccasin": [255, 228, 181],
  "navajo white": [255, 222, 173],
  "peach puff": [255, 218, 185],
  "misty rose": [255, 228, 225],
  "lavender blush": [255, 240, 245],
  "linen": [250, 240, 230],
  "old lace": [253, 245, 230],
  "papaya whip": [255, 239, 213],
  "sea shell": [255, 245, 238],
  "mint cream": [245,255,250],
  "slate gray": [112,128,144],
  "light slate gray": [119,136,153],
  "light steel blue": [176,196,222],
  "lavender": [230,230,250],
  "floral white": [255,250,240],
  "alice blue": [240,248,255],
  "ghost white": [248,248,255],
  "honey dew": [240,255,240],
  "ivory": [255,255,240],
  "azure": [240,255,255],
  "snow": [255,250,250],
  "black": [0,0,0],
  "dim gray": [105,105,105],
  "gray": [128,128,128],
  "dark gray": [169,169,169],
  "silver": [192,192,192],
  "light gray": [211,211,211],
  "gainsboro": [220,220,220],
  "white smoke": [245,245,245],
  "white": [255,255,255]
}