# Flow Fields
By Samma ( Torgeir Lien, samma(at)samma.no / https://twitter.com/SammaCreative )

### Example

Displays an animation for a random seed number.

https://samma.github.io/flow-fields/

### To render high res

Rendering in very high quality may take a lot of time and make your browser very slow, please be patient.
Only tested in FireFox on Windows. If it does not work please download FireFox and try again.

I recommend going through the three steps below, link by link, to render properly. Change the "seed" number to the number of your flow field! See more detail below. 

1. Create a in-browser preview of the flow field.
https://samma.github.io/flow-fields?seed=1&scaling=1&downloadVideo=false

2. Test high res render of very short video of the flow field, just to see that it works.
https://samma.github.io/flow-fields?seed=1&scaling=2&downloadVideo=true&secondsToRecord=1&aliasScaling=1

3. Recomended settings for "final render" of your flow field. Set aliasScaling to 2 for even smoother lines (this may take a lot of time, be patient)
https://samma.github.io/flow-fields?seed=1&scaling=4&downloadVideo=true&secondsToRecord=16&aliasScaling=1

Explanation of the parameters (change these as you like)
seed - Your flow field number. Example: 1
scaling - How many times to double the resolution. Example: 4 gives roughly 4k resolution
downloadVideo - wether to show a preview or actually render the video, true or false
secondsToRecord - How long the video should be in seconds. 16 seconds is default

### Mint

http://flowfields.io/

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
