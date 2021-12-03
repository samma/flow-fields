
class FlowField {
  constructor(originx, originy, width,height,screenDivisions, noiseScale, particleSpeed, numparticles, backgroundColor) {
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
    this.createField();
    this.initParticles();
  }

  update() {
    this.updateAndDrawParticles();
  }

  createField() {
    this.topology = generateTopology(this.width / this.screenDivisions, this.height / this.screenDivisions);
    this.topology = addPerlinNoise(this.topology, this.width / this.screenDivisions, this.height / this.screenDivisions, this.noiseScale);
    this.gradient = calculateGradient(this.topology, this.width / this.screenDivisions, this.height / this.screenDivisions);
  }
  
  initParticles() {
    for (var i = 0; i < this.numparticles; i++) {
      let newLocation = getrandomPointInWindow(this.width, this.height);
      this.particles[i] = new Point(newLocation.x, newLocation.y, this.particleSpeed, this.screenDivisions);
    }
  }
  
  updateAndDrawParticles() {
    // Iterate over particles
    for (var i = 0; i < this.particles.length; i++) {
      if (this.particles[i].isAlive(this.gradient) ){
        this.particles[i].update(this.gradient);
        this.particles[i].displayAt(this.originx, this.originy);
      } else {
        // TODO remove the dead particle for performance, or keep regenerating them
        let newLocation = getrandomPointInWindow(this.width, this.height);
        this.particles[i] = new Point(newLocation.x, newLocation.y, this.particleSpeed, this.screenDivisions); 
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
        //drawParticleAt(i * 10, j * 10, gradient[i][j].x, gradient[i][j].y, 0, 10);
        
        fill(this.gradient[i][j].x,0,100);
        rect(this.originx + i * this.screenDivisions, this.originy + j * this.screenDivisions, this.screenDivisions, this.screenDivisions);
      
        fill(0,gradient[i][j].y,0,100);
        rect(this.originx + i * this.screenDivisions, this.originy + j * this.screenDivisions, this.screenDivisions, this.screenDivisions);
      }
    }
  }
}

let flowField;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  background(255);
  frameRate(60);

  //noiseSeed(1257);
  
  let screenDivisions = 1;
  let numparticles = 10000;
  let noiseScale = 0.001;
  let particleSpeed = 0.02/noiseScale;

  flowfield = new FlowField(0,0,width,height,screenDivisions,noiseScale,particleSpeed,numparticles,color(0,0,0));

}

function draw() {
  flowfield.update();
}

function getrandomPointInWindow(width, height) {
  return createVector(random(width), random(height));
}

class Point {
  constructor(x, y, speed, screenDivisions) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.screenDivisions = screenDivisions;
    this.previousX = 0;
    this.previousY = 0;
    this.strokeWeight = random(1, 1);
    // Set this.color to a color from a theme
    //this.color = color(random(255), random(255), random(255));
    this.color = getRandomColorFromPalette();
  }

  update(field) {
    this.previousX = this.x;
    this.previousY = this.y;

    // Round the position into a grid index
    let x = floor(this.x/this.screenDivisions);
    let y = floor(this.y/this.screenDivisions);


    // Move perpendicular to gradient
    let perp = getPerpendicularVector(field[x][y])
    this.x += this.speed*perp.x;
    this.y += this.speed*perp.y;
  }

  displayAt(originx, originy){
    
    // Draw a line from the previous position to the current position
    
    stroke(this.color);
    // Draw random stroke width
    strokeWeight(this.strokeWeight);

    line(originx + this.previousX, originy + this.previousY, originx + this.x, originy + this.y);


    //fill(10, 10, 10, 50);
    //fill(this.color);
    //ellipse(this.x, this.y, 1, 1);
  }

  isAlive(field) {
    // Check if x or y is outside the screen

    let x = floor(this.x/this.screenDivisions);
    let y = floor(this.y/this.screenDivisions);

    if (x < 0 || x >= field.length || y < 0 || y >= field[0].length) {
      return false;
    }
    
    if (this.previousX == this.x && this.previousY == this.y) {
      return false;
    }
    
    return true;
  }
}

function getPerpendicularVector(v) {
  return createVector(-v.y, v.x);
}


function drawGradient(gradient, n, m, screenDivisions) {
  for (var i = 0; i < n; i++) {
    for (var j = 0; j < m; j++) {
      //drawParticleAt(i * 10, j * 10, gradient[i][j].x, gradient[i][j].y, 0, 10);
      
      fill(gradient[i][j].x,0,100);
      rect(i * screenDivisions, j * screenDivisions, screenDivisions, screenDivisions);
    
      fill(0,gradient[i][j].y,0,100);
      rect(i * screenDivisions, j * screenDivisions, screenDivisions, screenDivisions);
    }
  }
}

function generateTopology(n, m) {
  var topology = [];
  for (var i = 0; i < n; i++) {
    topology[i] = [];
    for (var j = 0; j < m; j++) {
      topology[i][j] = 0;
    }
  }
  return topology;
}

function addPerlinNoise(topology, n, m, scale) {
  for (var i = 0; i < n; i++) {
    for (var j = 0; j < m; j++) {
      topology[i][j] = 255*noise(i*scale, j*scale);
    }
  }
  return topology;
}

function drawField(topology, n, m, screenDivisions) {
  for (var i = 0; i < n; i++) {
    for (var j = 0; j < m; j++) {
      fill(topology[i][j]);
      rect(i * screenDivisions, j * screenDivisions, screenDivisions, screenDivisions);
    }
  }
}

function calculateGradient(topology, n, m) {
  var gradient = [];
  for (var i = 0; i < n; i++) {
    gradient[i] = [];
    for (var j = 0; j < m; j++) {
      gradient[i][j] = calculateGradientAt(topology, i, j, n, m);
    }
  }
  return gradient
}

// Calculates the gradient vector at a given point in the topology.

function calculateGradientAt(topology, i, j, n, m) {
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

function drawParticleAt(x, y, r, g, b, radius) {
  fill(r, g, b);
  ellipse(x, y, radius,radius);
}




// Create a color palette from these colors #554a35 #e10032 #ffc363 #1c4508
function getRandomColorFromPalette() {
  var palette = [color(85, 74, 53), color(225, 0, 50), color(255, 195, 99), color(28, 68, 8)];

  // Create palette from these colors #E26A2C #FF8243 #FDA65D #FFD07F
  var palette2 = [color(226, 106, 44), color(255, 130, 67), color(253, 168, 93), color(255, 208, 127)];

  return palette2[Math.floor(Math.random() * palette2.length)];
}