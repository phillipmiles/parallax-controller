export const getDefaultPropertyValue = (property: string) => {
  switch (property) {
    case 'translateX':
      return 0;
    case 'translateY':
      return 0;
    case 'scale':
      return 1;
    case 'rotate':
      return 0;
    case 'opacity':
      return 1;
    default:
      return null;
  }
};

export const easeInOutQuad = (t, b, c, d) => {
  // sinusoadial in and out
  return (-c / 2) * (Math.cos((Math.PI * t) / d) - 1) + b;
};

export const calcPropValue = (
  animationObj,
  propName,
  type,
  sceneDuration,
  sceneProgress
) => {
  const property = animationObj[propName];
  let value;

  if (property && type === 'ease') {
    var currentKey = 0;
    var keyProgress = sceneProgress;
    var keyDuration = sceneDuration;
    let startValue;
    let endValue;
    if (property instanceof Array === false) {
      while (currentKey < property.keys.length - 1) {
        if (
          sceneProgress >= property.keys[currentKey] &&
          sceneProgress <= property.keys[currentKey + 1]
        ) {
          // Adjust current time to account for offset caused by past keys.
          keyProgress = keyProgress - property.keys[currentKey];
          keyDuration =
            property.keys[currentKey + 1] - property.keys[currentKey];
          break;

          // Force to last key if scroll exceeds scene total duration.
        } else if (sceneProgress > sceneDuration) {
          currentKey = property.keys.length - 2;
          keyProgress = keyProgress - property.keys[currentKey];
          keyDuration =
            property.keys[currentKey + 1] - property.keys[currentKey];
          break;
        } else {
          currentKey++;
        }
      }

      startValue = property.positions[currentKey];
      endValue = property.positions[currentKey + 1];
    } else {
      startValue = property[0];
      endValue = property[1];
    }
    // console.log(
    //   'keyProgress',
    //   keyProgress,
    //   'currentKey',
    //   currentKey,
    //   'sceneProgress',
    //   sceneProgress
    // );
    value = easeInOutQuad(
      keyProgress,
      startValue,
      endValue - startValue,
      keyDuration
    );
  } else if (value && type === 'instant') {
    value = property[1];
  } else {
    value = getDefaultPropertyValue(propName);
  }

  /* Return console error when calculation fails */
  if (isNaN(value)) {
    console.log(`NaN returned when calculating animation value ${propName}.`);
  }

  return value;
};
