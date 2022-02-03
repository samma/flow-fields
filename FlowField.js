class FlowField {
  constructor(originx, originy, width, height, screenDivisions, noiseScale, particleSpeed, numparticles, backgroundColor, palette, borderlimit, griddivs, linemode) {
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
    this.lineMode = linemode;
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
      let newStrokeWeight = this.getRandomStrokeWeight();
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
        let newStrokeWeight = this.getRandomStrokeWeight();
        this.particles[i] = new Point(newLocation.x, newLocation.y, this.particleSpeed, this.screenDivisions, this.palette, newStrokeWeight);
      }
    }
  }

  // LineMode can be Thicc, Regular, Varied
  getRandomStrokeWeight() {
    if (this.lineMode == "Thick") {
      return globalScaling * aliasScaling*max(1,random(6, 9) / this.griddivs);
    } else if (this.lineMode == "Slim") {
      return globalScaling * aliasScaling*max(1,random(1, 4) / this.griddivs);
    } else if (this.lineMode == "Varied") {
      return globalScaling * aliasScaling*max(1,random(1, 8) / this.griddivs);
    }
  }

  drawField() {    
    let borderVals = getMinMaxOfTopology(this.topology)

    for (var i = 0; i < this.topology.length; i++) {
      for (var j = 0; j < this.topology[i].length; j++) {
        fill(map(this.topology[i][j], borderVals.min, borderVals.max, 0, 255));
        rect(this.originx + i * this.screenDivisions, this.originy + j * this.screenDivisions, this.screenDivisions, this.screenDivisions);
      }
    }
  }

  drawGradient() {
    let borderVals = getScaleOfField(this.gradient)
    // log bordervals to console
    console.log("Bordervals", borderVals);
    
    for (var i = 0; i < this.gradient.length; i++) {
      for (var j = 0; j < this.gradient[i].length; j++) {
        let x = map(this.gradient[i][j].x, borderVals.minx, borderVals.maxx, 0, 255);
        let y = map(this.gradient[i][j].y, borderVals.miny, borderVals.maxy, 0, 255);

        stroke(x, 0, y);
        point(this.originx + i * this.screenDivisions, this.originy + j * this.screenDivisions);
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
