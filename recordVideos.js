
async function recordVideos(seed, doneRecording) {
  console.log("Recording seed: " + seed);
  createFlowFieldWithRandomSettings(seed);
  await new Promise(finRender => recordVideoUntilFrame(numberOfFramesToRecord, seed, numFramesToSkipAtStart, finRender));
  console.log("Done recording seed: " + seed);
  doneRecording();
}

async function recordVideoUntilFrame(numFrames, seed, numFramesToSkipAtStart, finRender) {

  HME.createH264MP4Encoder().then(async (encoder) => {
    encoder.outputFilename = projectName + str(seed) + '.png';
    encoder.width = canvasSize  ;
    encoder.height = canvasSize  ;
    encoder.frameRate = videofrate;
    encoder.kbps = 50000; // video quality
    encoder.groupOfPictures = 60; // lower if you have fast actions.
    encoder.initialize();

    for (let frameCount = 0; frameCount < numFramesToSkipAtStart + numFrames; frameCount++) {
      anim();
      if (frameCount >= numFramesToSkipAtStart) {
        if (enableSaveThumbnail) {
          saveThumbnail(seed, frameCount, numFramesToSkipAtStart + numFrames - 1);
        }
        //encoder.addFrameRgba(blurAndResampleCanvas());
        encoder.addFrameRgba(drawingContext.getImageData(0, 0, canvasSize, canvasSize).data);
        await new Promise(resolve => window.requestAnimationFrame(resolve));
      }
    }

    encoder.finalize();
    if (enabledSaveVideos) {
      const uint8Array = encoder.FS.readFile(encoder.outputFilename);
      const anchor = document.createElement('a');
      anchor.href = URL.createObjectURL(new Blob([uint8Array], { type: 'video/mp4' }));
      anchor.download = encoder.outputFilename;
      anchor.click();
    }
    encoder.delete();
    finRender();
  });
}

function blurAndResampleCanvas() {
  let dataToDraw = drawingContext.getImageData(0, 0, canvasSize, canvasSize).data;
  let blurredData = blurImage(dataToDraw, canvasSize, canvasSize);
  let dataToDrawResized = resizeImageData(blurredData, canvasSize, canvasSize, canvasSize / aliasScaling, canvasSize / aliasScaling);
  return dataToDrawResized;
}

// With help from https://idmnyu.github.io/p5.js-image/Blur/index.html
function blurImage(img, w, h) {

  let newImg = new Uint8ClampedArray(w * h * 4);

  // For gaussian blur (didnt work so well for the lines...)
  //  var k1 = [[1, 2, 1], 
  //  [2, 4, 2],
  //  [1, 2, 1]];

  // For plain blur
  var k1 = [[1, 1, 1],
  [1, 1, 1],
  [1, 1, 1]];

  // iterate over imagedata
  for (var i = 0; i < img.length; i += 1) {
    // convert into x,y coordinates
    var x = i % w;
    var y = Math.floor(i / h);

    var ul = ((x - 1 + w) % w + w * ((y - 1 + h) % h)) * 4; // location of the UPPER LEFT
    var uc = ((x - 0 + w) % w + w * ((y - 1 + h) % h)) * 4; // location of the UPPER CENTER
    var ur = ((x + 1 + w) % w + w * ((y - 1 + h) % h)) * 4; // location of the UPPER RIGHT
    var ml = ((x - 1 + w) % w + w * ((y + 0 + h) % h)) * 4; // location of the LEFT
    var mc = ((x - 0 + w) % w + w * ((y + 0 + h) % h)) * 4; // location of the CENTER PIXEL
    var mr = ((x + 1 + w) % w + w * ((y + 0 + h) % h)) * 4; // location of the RIGHT
    var ll = ((x - 1 + w) % w + w * ((y + 1 + h) % h)) * 4; // location of the LOWER LEFT
    var lc = ((x - 0 + w) % w + w * ((y + 1 + h) % h)) * 4; // location of the LOWER CENTER
    var lr = ((x + 1 + w) % w + w * ((y + 1 + h) % h)) * 4; // location of the LOWER RIGHT

    p0 = img[ul] * k1[0][0]; // upper left
    p1 = img[uc] * k1[0][1]; // upper mid
    p2 = img[ur] * k1[0][2]; // upper right
    p3 = img[ml] * k1[1][0]; // left
    p4 = img[mc] * k1[1][1]; // center pixel
    p5 = img[mr] * k1[1][2]; // right
    p6 = img[ll] * k1[2][0]; // lower left
    p7 = img[lc] * k1[2][1]; // lower mid
    p8 = img[lr] * k1[2][2]; // lower right
    var red = (p0 + p1 + p2 + p3 + p4 + p5 + p6 + p7 + p8) / 9;

    p0 = img[ul + 1] * k1[0][0]; // upper left
    p1 = img[uc + 1] * k1[0][1]; // upper mid
    p2 = img[ur + 1] * k1[0][2]; // upper right
    p3 = img[ml + 1] * k1[1][0]; // left
    p4 = img[mc + 1] * k1[1][1]; // center pixel
    p5 = img[mr + 1] * k1[1][2]; // right
    p6 = img[ll + 1] * k1[2][0]; // lower left
    p7 = img[lc + 1] * k1[2][1]; // lower mid
    p8 = img[lr + 1] * k1[2][2]; // lower right
    var green = (p0 + p1 + p2 + p3 + p4 + p5 + p6 + p7 + p8) / 9;

    p0 = img[ul + 2] * k1[0][0]; // upper left
    p1 = img[uc + 2] * k1[0][1]; // upper mid
    p2 = img[ur + 2] * k1[0][2]; // upper right
    p3 = img[ml + 2] * k1[1][0]; // left
    p4 = img[mc + 2] * k1[1][1]; // center pixel
    p5 = img[mr + 2] * k1[1][2]; // right
    p6 = img[ll + 2] * k1[2][0]; // lower left
    p7 = img[lc + 2] * k1[2][1]; // lower mid
    p8 = img[lr + 2] * k1[2][2]; // lower right
    var blue = (p0 + p1 + p2 + p3 + p4 + p5 + p6 + p7 + p8) / 9;

    newImg[mc] = red;
    newImg[mc + 1] = green;
    newImg[mc + 2] = blue;
    newImg[mc+3] = img[lc+3];

  }
  return newImg;
}


function resizeImageData(data, width, height, newWidth, newHeight) {
  let newData = new Uint8ClampedArray(newWidth * newHeight * 4);
  let ratioX = width / newWidth;
  let ratioY = height / newHeight;
  let ratio = Math.min(ratioX, ratioY);
  let newIndex = 0;
  let index = 0;
  for (let i = 0; i < newHeight; i++) {
    for (let j = 0; j < newWidth; j++) {
      index = (Math.floor(i * ratio) * width + Math.floor(j * ratio)) * 4;
      newData[newIndex++] = data[index++];
      newData[newIndex++] = data[index++];
      newData[newIndex++] = data[index++];
      newData[newIndex++] = data[index++];
    }
  }
  return newData;
}

function saveThumbnail(seed, frameCount, lastFrame) {
  //saveThumbnailAtFrame(100, seed, frameCount);
  saveThumbnailAtFrame(lastFrame, seed, frameCount);
}

function saveThumbnailAtFrame(frameToSave, seed, frameCount) {
  if (frameCount == frameToSave) {
    saveCanvas(canvas, projectName + str(seed) + '-frame' + frameCount, 'png');
  }
}
