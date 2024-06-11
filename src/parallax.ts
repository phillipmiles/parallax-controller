import { convertAnimationToPx } from './scenes';

// Returned value is rounded as we work in full pixels not half pixels.
export const calcPercentOfValue = (percent, ofValue) => {
  return Math.round((parseFloat(percent) / 100) * ofValue);
};

export const calcPercentOfWindowHeight = (percent) => {
  return calcPercentOfValue(percent, window.innerHeight);
};

export const calcPercentOfWindowWidth = (percent) => {
  return calcPercentOfValue(percent, window.innerWidth);
};

export const getTotalDuration = (scenes) => {
  let totalDuration = 0;
  scenes.forEach((scene) => {
    totalDuration += scene.duration;
  });
  return totalDuration;
};

// Converts all the values in the scenes object to pixels based off of the the
// height and width of the viewport.
export const convertAllPropsToPx = (scenes) => {
  var i, j, k;

  for (i = 0; i < scenes.length; i++) {
    // loop scenes

    scenes[i].duration = calcPercentOfWindowHeight(scenes[i].duration);

    // loop animations
    for (j = 0; j < scenes[i].animations.length; j++) {
      convertAnimationToPx(scenes[i].animations[j], scenes[i].duration);
    }
  }
};
