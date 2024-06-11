import { animation } from './animation';
import {
  calcPercentOfValue,
  calcPercentOfWindowHeight,
  calcPercentOfWindowWidth,
} from './parallax';

export interface scene {
  wrapper: string;
  duration: string;
  animations: animation[];
}

export const convertAnimationToPx = (animation: animation, duration) => {
  // loop animation properties
  Object.keys(animation).forEach(function (key) {
    let value = animation[key];

    if (key !== 'selector') {
      if (value instanceof Array) {
        // if its an array
        for (let k = 0; k < value.length; k++) {
          // if value in array is %
          if (typeof value[k] === 'string') {
            if (key === 'translateY') {
              value[k] = calcPercentOfWindowHeight(value[k]);
            } else if (key === 'translateX') {
              value[k] = calcPercentOfWindowWidth(value[k]);
            }
          }
        }

        // If animation property contains keys/positions object.
      } else if (typeof value === 'object') {
        for (let k = 0; k < value.positions.length; k++) {
          // Convert positions to pixels.
          if (typeof value.positions[k] === 'string') {
            if (key === 'translateY') {
              value.positions[k] = calcPercentOfWindowHeight(
                value.positions[k]
              );
            } else if (key === 'translateX') {
              value.positions[k] = calcPercentOfWindowWidth(value.positions[k]);
            }
          }

          // Convert keys to pixels.
          if (typeof value.keys[k] === 'string') {
            value.keys[k] = calcPercentOfValue(value.keys[k], duration);
          }
        }
      } else {
        if (typeof value === 'string') {
          // if single value is a %
          if (key === 'translateY') {
            value = calcPercentOfWindowHeight(value);
          } else if (key === 'translateX') {
            value = calcPercentOfWindowWidth(value);
          }
        }
      }
      animation[key] = value;
    }
  });
};

const setProp = () => {};
