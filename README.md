# Flow Fields
By Samma 

### Example

Displays an animation for a given seed number.

https://samma.github.io/flow-fields/?seed=123456

### How to download high resolution videos of your flow field. 

Rendering in very high quality may take a lot of time and make your browser very slow, please be patient. Only tested on the FireFox browser.
Important: when rendering a video, you may have to zoom out so that the entire flow field is visible in the browser, otherwise the video will have errors. See https://support.mozilla.org/en-US/kb/font-size-and-zoom-increase-size-of-web-pages for changing zoom levels. 

I recommend going through the three steps below to render properly. Change the "seed" number in the link to the number of your flow field! See more detail below. 

1. Create a in-browser preview of the flow field.
https://samma.github.io/flow-fields/?downloadVideo=false&scaling=1&seed=123456

2. Test high res render of very short video of the flow field, just to see that it works.
https://samma.github.io/flow-fields/?aliasScaling=1&downloadVideo=true&scaling=2&secondsToRecord=1&seed=123456

3. Recomended settings for "final render" of your flow field. Set aliasScaling to 2 for even smoother lines (this may take a lot of time, be patient and the video will be downloaded at the end)
https://samma.github.io/flow-fields/?aliasScaling=1&downloadVideo=true&scaling=4&secondsToRecord=16&seed=123456

Explanation of the parameters:

seed - Your flow field number. Example: 1

scaling - How many times to double the resolution. Example: 4 gives roughly 4k resolution. 1 is default.

downloadVideo - wether to download a render or just watch a preview (previews are much faster), true or false

secondsToRecord - How long the video should be in seconds. 16 seconds is default

aliasScaling - to enable anti-aliasing and make the lines more smooth looking, set this to 2. 

### Mint

https://opensea.io/collection/flowfields

### License 

Attribution-NonCommercial-ShareAlike 3.0 Unported (CC BY-NC-SA 3.0) 

https://creativecommons.org/licenses/by-nc-sa/3.0/

### Attribution

Based on p5.js v1.4.0 June 29, 2021

https://p5js.org/
https://www.npmjs.com/package/h264-mp4-encoder

### Disclaimer

Javascript is not my preferred langauge, use with care... 
