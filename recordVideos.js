
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
    encoder.width = canvasSize;
    encoder.height = canvasSize;
    encoder.frameRate = videofrate;
    encoder.kbps = 20000; // video quality
    encoder.groupOfPictures = 120; // lower if you have fast actions.
    encoder.initialize();

    for (let frameCount = 0; frameCount < numFramesToSkipAtStart + numFrames; frameCount++) {
      anim();
      if (frameCount >= numFramesToSkipAtStart) {
        if (enableSaveThumbnail) {
          saveThumbnail(seed, frameCount, numFramesToSkipAtStart + numFrames - 1);
        }
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

function saveThumbnail(seed, frameCount, lastFrame) {
  saveThumbnailAtFrame(100, seed, frameCount);
  saveThumbnailAtFrame(lastFrame, seed, frameCount);
}

function saveThumbnailAtFrame(frameToSave, seed, frameCount) {
  if (frameCount == frameToSave) {
    saveCanvas(canvas, projectName + str(seed) + '-frame' + frameCount, 'png');
  }
}
