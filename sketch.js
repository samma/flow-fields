// Draw settings
let screenDivisions = 1;
let numparticles = 5000;
let noiseScale = 0.0015;
let particleSpeed = 10;

// Backing variables
let particles = [];
let gradient;
let topology;


function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  background("#E26A2C");
  frameRate(60);


  noiseSeed(1257);
  createWorld(screenDivisions);
  initParticles();

  //drawField(topology, width / screenDivisions, height / screenDivisions, screenDivisions);
  //drawGradient(gradient, width / screenDivisions, height / screenDivisions, screenDivisions);

}

function draw() {
  drawParticles();
}

function initParticles() {
  // Init particles
  for (var i = 0; i < numparticles; i++) {
    particles[i] = new Point(getrandomPointOnscreen().x, getrandomPointOnscreen().y, particleSpeed, screenDivisions);
  }
}

function drawParticles()  {
  // Iterate over particles
  for (var i = 0; i < particles.length; i++) {
    if (particles[i].isAlive(gradient) ){
      particles[i].update(gradient);
      particles[i].display();
    } else {
      // TODO remove the dead particle for performance
      particles[i] = new Point(getrandomPointOnscreen().x, getrandomPointOnscreen().y, particleSpeed, screenDivisions); 
    }
  }
}

function getrandomPointOnscreen() {
  return createVector(random(width), random(height));
}

function createWorld(screenDivisions) {
  topology = generateTopology(width / screenDivisions, height / screenDivisions);
  topology = addPerlinNoise(topology, width / screenDivisions, height / screenDivisions, noiseScale);
  
  gradient = calculateGradient(topology, width / screenDivisions, height / screenDivisions);
}

class Point {
  constructor(x, y, speed, screenDivisions) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.screenDivisions = screenDivisions;
    this.previousX = 0;
    this.previousY = 0;
    this.strokeWeight = random(1, 10);
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

  display() {
    
    // Draw a line from the previous position to the current position
    
    stroke(this.color);
    // Draw random stroke width
    strokeWeight(this.strokeWeight);

    line(this.previousX, this.previousY, this.x, this.y);


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