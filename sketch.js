// Creates a flow field and displays it with some moving particles

let fields = [];

function setup() {
  createCanvas(windowHeight, windowHeight);

  frameRate(60);
  colorMode(HSB);
  noStroke();

  // Set seed for random number generator and noise generator
  //randomSeed(554);
  //noiseSeed(55);

  // Create a border around the canvas
  let border = 50;
  let width = windowWidth - border*2;
  let height = windowHeight - border*2;
  let originx = border;
  let originy = border;
  
  // Settings for the actual flowfields
  let screenDivisions = 1;
  let numparticles = 100;
  let noiseScale = 0.005;
  let particleSpeed = 0.005;
  let normalizedSpeed = particleSpeed/noiseScale;
  let borderlimit = 20; 

  // For creating multiple flow fields in same window
  let griddivs = 5;
  let gridSize = width/griddivs;
  let gridCoordinates = createGridCoordinates(originx, originy, width, height, griddivs);
  palettes = Palette.generatePalettes(gridCoordinates.length, 4);
  
  //iterate over gridcoordina
  backgroundColor = color(30, 1, 87);
  background(backgroundColor);

  for (let i = 0; i < gridCoordinates.length; i++) {
    let x = gridCoordinates[i].x;
    let y = gridCoordinates[i].y;
    fields.push(new FlowField(x,y,gridSize,gridSize,screenDivisions,noiseScale,normalizedSpeed,numparticles,backgroundColor,palettes[i], borderlimit));
  }
}

function draw() {
  for (let i = 0; i < fields.length; i++) {
    fields[i].update();  
  }
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
    this.gradient = this.calculateGradient(this.topology, this.width / this.screenDivisions, this.height / this.screenDivisions);
  }
  
  initParticles() {
    for (var i = 0; i < this.numparticles; i++) {
      let newLocation = getrandomPointInWindowWithBorder(this.width, this.height, this.borderlimit);
      this.particles[i] = new Point(newLocation.x, newLocation.y, this.particleSpeed, this.screenDivisions, this.palette);
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
        this.particles[i] = new Point(newLocation.x, newLocation.y, this.particleSpeed, this.screenDivisions, this.palette); 
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

  calculateGradient(topology, n, m) {
    var gradient = [];
    for (var i = 0; i < n; i++) {
      gradient[i] = [];
      for (var j = 0; j < m; j++) {
        gradient[i][j] = this.calculateGradientAt(topology, i, j, n, m);
      }
    }
    return gradient
  }
  
  // Calculates the gradient vector at a given point in the topology.
  calculateGradientAt(topology, i, j, n, m) {
    var gradientVec = createVector(0, 0);
    
    if (i > 0) {
      gradientVec.x -= topology[i - 1][j];
    }
    if (i < n - 1) {
      gradientVec.x += topology[i + 1][j];
    }
    if (j > 0) {
      gradientVec.y -= topology[i][j - 1];
    }
    if (j < m - 1) { 
      gradientVec.y += topology[i][j + 1];
    }
    return gradientVec;
  }
}

// Used for the moving dots / lines
class Point {
  constructor(x, y, speed, screenDivisions, palette) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.screenDivisions = screenDivisions;
    this.previousX = this.x+1;
    this.previousY = 0;
    this.strokeWeight = random(1, 3);
    this.palette = palette;

    // Set the color to a color from a theme
    this.color = this.palette.getRandomColor();
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

    // Used for drawing points instead of lines
    //fill(10, 10, 10, 50);
    //fill(this.color);
    //ellipse(this.x, this.y, 1, 1);
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
  let x = random(borderlimit, width - borderlimit);
  let y = random(borderlimit, height - borderlimit);
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