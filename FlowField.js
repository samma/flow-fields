class FlowField {
  constructor(originx, originy, width, height, screenDivisions, noiseScale, particleSpeed, numparticles, backgroundColor, palette, borderlimit, griddivs) {
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
    this.griddivs = griddivs;
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
      let newStrokeWeight = random(1, 3) * random(1, 4) / this.griddivs^2;
      this.particles[i] = new Point(newLocation.x, newLocation.y, this.particleSpeed, this.screenDivisions, this.palette, newStrokeWeight);
    }
  }

  updateAndDrawParticles() {
    // Iterate over particles
    for (var i = 0; i < this.particles.length; i++) {
      this.particles[i].update(this.gradient);
      if (this.particles[i].isAlive(this.gradient, this.borderlimit)) {
        this.particles[i].displayAt(this.originx, this.originy);
      } else {
        // TODO remove the dead particle for performance, or keep regenerating them
        let newLocation = getrandomPointInWindowWithBorder(this.width, this.height, this.borderlimit);
        let newStrokeWeight = random(1, 3) * random(1, 4) / this.griddivs^2;
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
        fill(this.gradient[i][j].x, 0, 100);
        rect(this.originx + i * this.screenDivisions, this.originy + j * this.screenDivisions, this.screenDivisions, this.screenDivisions);

        fill(0, gradient[i][j].y, 0, 100);
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
        topology[i][j] = 255 * noise((this.originx + i) * scale, (this.originy + j) * scale);
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
    return gradient;
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
