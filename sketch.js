// Creates a flow field and displays it with some moving particles

let fields = [];

function setup() {
  createCanvas(windowHeight, windowHeight);
  //noStroke();
  background(255);
  frameRate(60);

  //noiseSeed(1257);
  
  let screenDivisions = 1;
  let numparticles = 1000;
  let noiseScale = 0.001;
  let particleSpeed = 0.02/noiseScale;
  let palette = new Palette([color(226, 106, 44), color(255, 130, 67), color(253, 168, 93), color(255, 208, 127)]);
  let borderlimit = 0; 

  let griddivs = 4;
  let gridSize = width/griddivs;
  let gridCoordinates = createGridCoordinates(0, 0, width, height, griddivs);
  
  //iterate over gridcoordinates
  for (let i = 0; i < gridCoordinates.length; i++) {
    let x = gridCoordinates[i].x;
    let y = gridCoordinates[i].y;
    fields.push(new FlowField(x,y,gridSize,gridSize,screenDivisions,noiseScale,particleSpeed,numparticles,color(0,0,0),palette, borderlimit));
  }
  
}

function draw() {
  for (let i = 0; i < fields.length; i++) {
    fields[i].update();
  }
}

function createGridCoordinates(x, y, width, height, gridSize) {
  let gridCoordinates = [];
  let xStep = width/gridSize;
  let yStep = height/gridSize;
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      let x = i*xStep;
      let y = j*yStep;
      gridCoordinates.push(createVector(x,y));
    }
  }
  return gridCoordinates;
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
      let newLocation = getrandomPointInWindow(this.width, this.height);
      this.particles[i] = new Point(newLocation.x, newLocation.y, this.particleSpeed, this.screenDivisions, this.palette);
    }
  }
  
  updateAndDrawParticles() {
    // Iterate over particles
    for (var i = 0; i < this.particles.length; i++) {
      this.particles[i].update(this.gradient);
      if (this.particles[i].isAlive(this.gradient) ){
        this.particles[i].displayAt(this.originx, this.originy);
      } else {
        // TODO remove the dead particle for performance, or keep regenerating them
        let newLocation = getrandomPointInWindow(this.width, this.height);
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
    // new vector
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

function getrandomPointInWindow(width, height) {
  return createVector(random(width), random(height));
}



class Point {
  constructor(x, y, speed, screenDivisions, palette) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.screenDivisions = screenDivisions;
    this.previousX = 0;
    this.previousY = 0;
    this.strokeWeight = random(1, 1);
    this.palette = palette;

    // Set this.color to a color from a theme
    //this.color = color(random(255), random(255), random(255));
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

    //fill(10, 10, 10, 50);
    //fill(this.color);
    //ellipse(this.x, this.y, 1, 1);
  }

  isAlive(field) {
    // Cast the position to a grid index
    let x = floor(this.x/this.screenDivisions);
    let y = floor(this.y/this.screenDivisions);

    // Check if x or y is outside the screen
    if (x < 0 || x >= field.length || y < 0 || y >= field[0].length) {
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

class Palette {
  constructor(colors) {
    this.colors = colors;
  }

  getRandomColor() {
    return this.colors[Math.floor(Math.random() * this.colors.length)];
  }
}

