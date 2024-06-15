import { easeInOutQuad } from './animation';

// Functions assumes values in array are ordered in ascending order.
export const getCurrentPropKeyIndex = (array, value) => {
  return array.findLastIndex((item) => item <= value);
};

export const calcPropValue = (prop, index, propProgress) => {
  if (index === -1 || propProgress < 0) {
    // If index doesn't exist or progress through the prop has yet
    // to reach a positive number then assume we haven't reached the
    // first prop key yet so return the first value.
    return prop.values[0];
  } else if (index === prop.keys.length - 1) {
    // If last index then return last value.
    return prop.values[index];
  } else {
    // Otherwise calculate the interprolated value.
    // TODO:: Handle different easings (linear, quad, instant)
    const startValue = prop.values[index];
    const endValue = prop.values[index + 1];
    const duration = prop.keys[index + 1] - prop.keys[index];

    const keyProgress = propProgress - prop.keys[index];

    return easeInOutQuad(
      keyProgress,
      startValue,
      endValue - startValue,
      duration
    );
  }
};

export const getCurrentPropValue = (prop, relativeScrollTop) => {
  const currentIndex = getCurrentPropKeyIndex(prop.keys, relativeScrollTop);
  const value = calcPropValue(prop, currentIndex, relativeScrollTop);
  return value;
};
