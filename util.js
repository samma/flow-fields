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
