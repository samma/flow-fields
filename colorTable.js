// Used for classifying colors into named colors, mostly


function getColorDistance(c1, c2) {
  lab1 = rgb2lab([red(c1), green(c1), blue(c1)]);
  lab2 = rgb2lab([red(c2), green(c2), blue(c2)]);

  labdistance = Math.sqrt(Math.pow(lab1[0] - lab2[0], 2) + Math.pow(lab1[1] - lab2[1], 2) + Math.pow(lab1[2] - lab2[2], 2));
  return labdistance
}

// Found somewhere on the Internet in Python, converted to JS with openai
function rgb2lab ( inputColor ) {
  var RGB = [0, 0, 0];
   
  for (var num = 0; num < 3; num++) {
    value = inputColor[num];

    value =  value / 255 ;

    if ( value > 0.04045 ) {
      value = ( ( value + 0.055 ) / 1.055 ) ** 2.4;
    } else {
      value = value / 12.92;
    }
    RGB[ num ] = value * 100;
  }


  var XYZ = [0, 0, 0];

  var X = RGB[ 0 ] * 0.4124 + RGB[ 1 ] * 0.3576 + RGB[ 2 ] * 0.1805;
  var Y = RGB[ 0 ] * 0.2126 + RGB[ 1 ] * 0.7152 + RGB[ 2 ] * 0.0722;
  var Z = RGB[ 0 ] * 0.0193 + RGB[ 1 ] * 0.1192 + RGB[ 2 ] * 0.9505;
  XYZ[ 0 ] = round( X, 4 );
  XYZ[ 1 ] = round( Y, 4 );
  XYZ[ 2 ] = round( Z, 4 );

  XYZ[ 0 ] = ( XYZ[ 0 ] / 95.047 );         // ref_X =  95.047   Observer= 2°, Illuminant= D65
  XYZ[ 1 ] = ( XYZ[ 1 ] / 100.0 );          // ref_Y = 100.000
  XYZ[ 2 ] = ( XYZ[ 2 ] / 108.883 );        // ref_Z = 108.883


  for (var num = 0; num < 3; num++) {
    value = inputColor[num];

    if ( value > 0.008856 ) {
      value = value ** ( 0.3333333333333333 );
    } else {
      value = ( 7.787 * value ) + ( 16 / 116 );
    }

    XYZ[ num ] = value;
  }

  var Lab = [0, 0, 0];

  var L = ( 116 * XYZ[ 1 ] ) - 16;
  var a = 500 * ( XYZ[ 0 ] - XYZ[ 1 ] );
  var b = 200 * ( XYZ[ 1 ] - XYZ[ 2 ] );

  Lab[ 0 ] = round( L, 4 );
  Lab[ 1 ] = round( a, 4 );
  Lab[ 2 ] = round( b, 4 );

  return Lab;
}

// Find the most similar color in the colorTable to the given color and return its name
function getColorName(color) {
  let minDistance = Infinity;
  let closestColorName = "";
  for (let colorName in colorTable) {
    let distance = getColorDistance(colorTable[colorName], color);
    if (distance < minDistance) {
      minDistance = distance;
      closestColorName = colorName;
    }
  }
 
  return closestColorName;
}

function getPrintableNameOfColor(col) {
  let name = getColorName(col);
  return upperCaseWordsInString(name);
}

// Using HSB because it is kind of a cool color space for random colors. Way better than RGB.
function generateRandomHSBColor() {
  let hue = random(0, 360);
  let saturation = random(0, 100);
  let value = random(0, 100);

  let rgbVals = HSVtoRGB(hue/360.0, saturation/100.0, value/100.0);

  return color(rgbVals.r, rgbVals.g, rgbVals.b);
}

/* accepts parameters
 * h  Object = {h:x, s:y, v:z}
 * OR 
 * h, s, v [0-1]
*/
function HSVtoRGB(h, s, v) {
  var r, g, b, i, f, p, q, t;
  if (arguments.length === 1) {
      s = h.s, v = h.v, h = h.h;
  }
  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
      case 0: r = v, g = t, b = p; break;
      case 1: r = q, g = v, b = p; break;
      case 2: r = p, g = v, b = t; break;
      case 3: r = p, g = q, b = v; break;
      case 4: r = t, g = p, b = v; break;
      case 5: r = v, g = p, b = q; break;
  }
  return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
  };
}

// Function that takes a random element from colorTable and returns it as a color object.
function getRandomTemplateColor() {
  let randomColor = colorTable[random(Object.keys(colorTable))];
  let c = color(randomColor[0], randomColor[1], randomColor[2]);
  return c;
}

function upperCaseWordsInString(str) {
  let words = str.split(" ");
  for (let i = 0; i < words.length; i++) {
    words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
  }
  return words.join(" ");
}

// Colortable found on https://learn.coderslang.com/0028-html-colors-with-names-hex-and-rgb-codes/
// adapted with beta.openai.com
let colorTable = {
  "maroon": [128, 0, 0],
  "dark red": [139, 0, 0],
  "brown": [165, 42, 42],
  "fire brick": [178, 34, 34],
  "crimson": [220, 20, 60],
  "red": [255, 0, 0],
  "tomato": [255, 99, 71],
  "coral": [255, 127, 80],
  "indian red": [205, 92, 92],
  "light coral": [240, 128, 128],
  "dark salmon": [233, 150, 122],
  "salmon": [250, 128, 114],
  "light salmon": [255, 160, 122],
  "orange red": [255, 69, 0],
  "dark orange": [255, 140, 0],
  "orange": [255, 165, 0],
  "gold": [255, 215, 0],
  "dark golden rod": [184, 134, 11],
  "golden rod": [218, 165, 32],
  "pale golden rod": [238, 232, 170],
  "dark khaki": [189, 183, 107],
  "khaki": [240, 230, 140],
  "olive": [128, 128, 0],
  "yellow": [255, 255, 0],
  "yellow green": [154, 205, 50],
  "dark olive green": [85, 107, 47],
  "olive drab": [107, 142, 35],
  "lawn green": [124, 252, 0],
  "chartreuse": [127, 255, 0],
  "green yellow": [173, 255, 47],
  "dark green": [0, 100, 0],
  "green": [0, 128, 0],
  "forest green": [34, 139, 34],
  "lime": [0, 255, 0],
  "lime green": [50, 205, 50],
  "light green": [144, 238, 144],
  "pale green": [152, 251, 152],
  "dark sea green": [143, 188, 143],
  "medium spring green": [0, 250, 154],
  "spring green": [0, 255, 127],
  "sea green": [46, 139, 87],
  "medium aquamarine": [102, 205, 170],
  "medium sea green": [60, 179, 113],
  "light sea green": [32, 178, 170],
  "dark slate gray": [47, 79, 79],
  "teal": [0, 128, 128],
  "dark cyan": [0, 139, 139],
  "aqua": [0, 255, 255],
  "cyan": [0, 255, 255],
  "light cyan": [224, 255, 255],
  "dark turquoise": [0, 206, 209],
  "turquoise": [64, 224, 208],
  "medium turquoise": [72, 209, 204],
  "pale turquoise": [175, 238, 238],
  "aquamarine": [127, 255, 212],
  "powder blue": [176, 224, 230],
  "cadet blue": [95, 158, 160],
  "steel blue": [70, 130, 180],
  "cornflower blue": [100, 149, 237],
  "deep sky blue": [0, 191, 255],
  "dodger blue": [30, 144, 255],
  "light blue": [173, 216, 230],
  "sky blue": [135, 206, 235],
  "light sky blue": [135, 206, 250],
  "midnight blue": [25, 25, 112],
  "navy": [0, 0, 128],
  "dark blue": [0, 0, 139],
  "medium blue": [0, 0, 205],
  "blue": [0, 0, 255],
  "royal blue": [65, 105, 225],
  "blue violet": [138, 43, 226],
  "indigo": [75, 0, 130],
  "dark slate blue": [72, 61, 139],
  "slate blue": [106, 90, 205],
  "medium slate blue": [123, 104, 238],
  "medium purple": [147, 112, 219],
  "dark magenta": [139, 0, 139],
  "dark violet": [148, 0, 211],
  "dark orchid": [153, 50, 204],
  "medium orchid": [186, 85, 211],
  "purple": [128, 0, 128],
  "thistle": [216, 191, 216],
  "plum": [221, 160, 221],
  "violet": [238, 130, 238],
  "fuchsia": [255, 0, 255],
  "orchid": [218, 112, 214],
  "medium violet red": [199, 21, 133],
  "pale violet red": [219, 112, 147],
  "deep pink": [255, 20, 147],
  "hot pink": [255, 105, 180],
  "light pink": [255, 182, 193],
  "pink": [255, 192, 203],
  "antique white": [250, 235, 215],
  "beige": [245, 245, 220],
  "bisque": [255, 228, 196],
  "blanched almond": [255, 235, 205],
  "wheat": [245, 222, 179],
  "corn silk": [255, 248, 220],
  "lemon chiffon": [255, 250, 205],
  "light golden rod yellow": [250, 250, 210],
  "light yellow": [255, 255, 224],
  "saddle brown": [139, 69, 19],
  "sienna": [160, 82, 45],
  "chocolate": [210, 105, 30],
  "peru": [205, 133, 63],
  "sandy brown": [244, 164, 96],
  "burly wood": [222, 184, 135],
  "tan": [210, 180, 140],
  "rosy brown": [188, 143, 143],
  "moccasin": [255, 228, 181],
  "navajo white": [255, 222, 173],
  "peach puff": [255, 218, 185],
  "misty rose": [255, 228, 225],
  "lavender blush": [255, 240, 245],
  "linen": [250, 240, 230],
  "old lace": [253, 245, 230],
  "papaya whip": [255, 239, 213],
  "sea shell": [255, 245, 238],
  "mint cream": [245, 255, 250],
  "slate gray": [112, 128, 144],
  "light slate gray": [119, 136, 153],
  "light steel blue": [176, 196, 222],
  "lavender": [230, 230, 250],
  "floral white": [255, 250, 240],
  "alice blue": [240, 248, 255],
  "ghost white": [248, 248, 255],
  "honey dew": [240, 255, 240],
  "ivory": [255, 255, 240],
  "azure": [240, 255, 255],
  "snow": [255, 250, 250],
  "black": [0, 0, 0],
  "dim gray": [105, 105, 105],
  "gray": [128, 128, 128],
  "dark gray": [169, 169, 169],
  "silver": [192, 192, 192],
  "light gray": [211, 211, 211],
  "gainsboro": [220, 220, 220],
  "white smoke": [245, 245, 245],
  "white": [255, 255, 255]
};
