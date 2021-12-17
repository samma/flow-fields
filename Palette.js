// Collection of colors
class Palette {
  constructor(colors) {
    this.colors = colors;
  }

  addColor(color) {
    this.colors.push(color);
  }

  getRandomColor() {
    return this.colors[Math.floor(Math.random() * this.colors.length)];
  }

  getNumColors() {
    return this.colors.length;
  }

  static generatePalettes(numPalettes, numColors) {
    let palettes = [];
    for (let i = 0; i < numPalettes; i++) {
      let palette = new Palette([]);
      for (let j = 0; j < numColors; j++) {
        palette.addColor(generateRandomHSBColor());
      }
      palettes.push(palette);
    }
    return palettes;
  }
}
