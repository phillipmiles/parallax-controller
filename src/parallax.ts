import { getDefaultPropertyValue } from './animation';
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

export const convertScenePropsToPx = (scene) => {
  scene.duration = calcPercentOfWindowHeight(scene.duration);

  // loop animations
  for (let j = 0; j < scene.animations.length; j++) {
    convertAnimationToPx(scene.animations[j], scene.duration);
  }

  // loop audio
  if (scene.audio) {
    scene.audio.forEach((audioObj) => {
      audioObj.start = calcPercentOfValue(audioObj.start, scene.duration);
      audioObj.stop = calcPercentOfValue(audioObj.stop, scene.duration);

      const propDuration =
        audioObj.start && audioObj.stop
          ? audioObj.stop - audioObj.start
          : scene.duration;

      audioObj.trigger = calcPercentOfValue(audioObj.trigger, propDuration);

      if (audioObj.props) {
        // If start stop exist calc keys relative to that range otherwise calc
        // based off scene duration.
        audioObj.props.forEach((prop) => {
          // convert array of keys to pixels
          prop.keys = prop.keys.map((key) =>
            calcPercentOfValue(key, propDuration)
          );
        });
      }
    });
  }
};
// Converts all the values in the scenes object to pixels based off of the the
// height and width of the viewport.
export const convertScenesPropsToPx = (scenes) => {
  return scenes.map((scene) => {
    convertScenePropsToPx(scene);
  });
};

// Converts scene property values that have been defined with shorthand expressions
// instead of using the keys and values arrays.
export const convertSceneShorthandProps = (scene) => {
  // SETS KEYS ARRAY FOR ANIMATIONS WITH NO KEYS SET!!!!!
  // MOVE THIS OUT
  for (let j = 0; j < scene.animations.length; j++) {
    // loop animations

    Object.keys(scene.animations[j]).forEach(function (key) {
      // loop properties
      let value = scene.animations[j][key];

      if (
        key !== 'selector' &&
        value instanceof Array === false &&
        value instanceof Object === false
      ) {
        var valueSet = [];
        valueSet.push(getDefaultPropertyValue(key), value);
        value = valueSet;
      }
      scene.animations[j][key] = value;
    });
  }
};
