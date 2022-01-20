// Various utility functions

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
  let xStep = width / gridSize;
  let yStep = height / gridSize;
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      let x = i * xStep + originx;
      let y = j * yStep + originy;
      gridCoordinates.push(createVector(x, y));
    }
  }
  return gridCoordinates;
}

function roundToDecimalPlaces(num, decimalPlaces) {
  let multiplier = pow(10, decimalPlaces);
  return Math.round(num * multiplier) / multiplier;
}

// find minx, maxx, miny, maxy
function getScaleOfField(field) {
  let minx = Infinity;
  let maxx = -Infinity;
  let miny = Infinity;
  let maxy = -Infinity;
  for (let i = 0; i < field.length; i++) {
    for (let j = 0; j < field[i].length; j++) {
      if (field[i][j].x < minx) {
        minx = field[i][j].x;
      }
      if (field[i][j].x > maxx) {
        maxx = field[i][j].x;
      }
      if (field[i][j].y < miny) {
        miny = field[i][j].y;
      }
      if (field[i][j].y > maxy) {
        maxy = field[i][j].y;
      }
    }
  }

  return {
    minx : minx,
    maxx : maxx,
    miny : miny,
    maxy : maxy
  };
}

// Get max and min of topology
function getMinMaxOfTopology(topology) {
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < topology.length; i++) {
    for (let j = 0; j < topology[i].length; j++) {
      if (topology[i][j] < min) {
        min = topology[i][j];
      }
      if (topology[i][j] > max) {
        max = topology[i][j];
      }
    }
  }
  return {
    min : min,
    max : max
  };
}