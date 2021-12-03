
let particle;
let gradient;
let screenDivisions = 2;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  background(255);
  //noiseSeed(123);

  renderloop(screenDivisions);

  particle = new Point(width / 2, height / 2, 1, screenDivisions);

}

function renderloop(screenDivisions) {
  var topology = generateTopology(width / screenDivisions, height / screenDivisions);
  topology = addPerlinNoise(topology, width / screenDivisions, height / screenDivisions, 0.01);
  drawField(topology, width / screenDivisions, height / screenDivisions, screenDivisions);
  
  gradient = calculateGradient(topology, width / screenDivisions, height / screenDivisions);
  //drawGradient(gradient, width / screenDivisions, height / screenDivisions, screenDivisions);
}

class Point {
  constructor(x, y, speed, screenDivisions) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.screenDivisions = screenDivisions
  }

  update(field) {
    // Round the position into a grid index
    let x = floor(this.x/this.screenDivisions);
    let y = floor(this.y/this.screenDivisions);

    // Move perpendicular to gradient
    let perp = getPerpendicularVector(field[x][y])
    this.x += this.speed*perp.x;
    this.y += this.speed*perp.y;
  }

  drawCircle() {
    fill(0, 0, 255);
    ellipse(this.x, this.y, 3, 3);
  }

}

function getPerpendicularVector(v) {
  return createVector(-v.y, v.x);
}

function draw() {
  particle.update(gradient);
  particle.drawCircle();
}

function physicsLoop() {
  for (var i = 0; i < particles.length; i++) {
    particles[i].update();
  }
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