
let particle;
let gradient;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  background(255);
  //noiseSeed(123);

  renderloop();

  particle = new Point(width / 2, height / 2, 0.5);

}

class Point {
  constructor(x, y, speed) {
    this.x = x;
    this.y = y;
    this.speed = speed;
  }

  update(field) {
    // round number down
    let x = floor(this.x/10);
    let y = floor(this.y/10);

    
    let perp = getPerpendicularVector(field[x][y])

    this.x += this.speed*perp.x;
    this.y += this.speed*perp.y;
  }

  drawCircle() {
    fill(0, 0, 255);
    ellipse(this.x, this.y, 10, 10);
  }

}

function getPerpendicularVector(v) {
  return createVector(-v.y, v.x);
}

function draw() {
  particle.update(gradient);
  particle.drawCircle();

  // log to console
  console.log(particle.x, particle.y);

}

function physicsLoop() {
  for (var i = 0; i < particles.length; i++) {
    particles[i].update();
  }
}

function renderloop() {
  var topology = generateTopology(width / 10, height / 10);
  topology = addPerlinNoise(topology, width / 10, height / 10, 0.05);
  drawField(topology, width / 10, height / 10);
  
  gradient = calculateGradient(topology, width / 10, height / 10);
  //drawGradient(gradient, width / 10, height / 10);
}

function drawGradient(gradient, n, m) {
  for (var i = 0; i < n; i++) {
    for (var j = 0; j < m; j++) {
      //drawParticleAt(i * 10, j * 10, gradient[i][j].x, gradient[i][j].y, 0, 10);
      
      fill(gradient[i][j].x,0,100);
      rect(i * 10, j * 10, 10, 10);
    
      fill(0,gradient[i][j].y,0,100);
      rect(i * 10, j * 10, 10, 10);
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

function drawField(topology, n, m) {
  for (var i = 0; i < n; i++) {
    for (var j = 0; j < m; j++) {
      fill(topology[i][j]);
      rect(i * 10, j * 10, 10, 10);
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