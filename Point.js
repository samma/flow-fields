// Used for the moving dots / lines
class Point {
  constructor(x, y, speed, screenDivisions, palette, strokeWeight) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.screenDivisions = screenDivisions;
    this.previousX = x + 1; // If prev and currenst is equal they will, the point will be killed
    this.previousY = y + 1;
    this.strokeWeight = strokeWeight;
    this.palette = palette;

    // Set the color to a color from a theme
    this.color = this.palette.getRandomColor();
    this.color.setAlpha(10);
  }

  update(field) {
    this.previousX = this.x;
    this.previousY = this.y;

    // Round the position into a grid index
    let x = floor(this.x / this.screenDivisions);
    let y = floor(this.y / this.screenDivisions);

    // Move perpendicular to gradient
    let perp = this.getPerpendicularVector(field[x][y]);
    this.x += this.speed * perp.x;
    this.y += this.speed * perp.y;
  }

  displayAt(originx, originy) {
    // Draw a line from the previous position to the current position
    stroke(this.color);
    strokeWeight(this.strokeWeight);
    line(originx + this.previousX, originy + this.previousY, originx + this.x, originy + this.y);
  }

  isAlive(field, borderlimit) {
    // Cast the position to a grid index
    let x = floor(this.x / this.screenDivisions);
    let y = floor(this.y / this.screenDivisions);

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
