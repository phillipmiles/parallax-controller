const isStringClassName = (string) => {
  return string[0] === '.' ? true : false;
};

const isStringIdName = (string) => {
  return string[0] === '#' ? true : false;
};

class ParallaxAnimation {
  selector;
  attributes;
  fromDom;

  constructor(selector, attributes) {
    this.selector = selector;
    this.attributes = attributes;

    this.findInDom(selector);
  }

  // Call to regather dom elements incase dom has changed.
  findInDom = (selector) => {
    if (isStringClassName(selector)) {
      const elements = document.getElementsByClassName(selector.split('.')[1]);
      this.fromDom = [];
      for (let element of elements) {
        this.fromDom.push(element);
      }
    } else {
      this.fromDom = document.getElementById(selector.split('#')[1]);
    }
  };

  easeInOutQuad = (t, b, c, d) => {
    return (-c / 2) * (Math.cos((Math.PI * t) / d) - 1) + b;
  };

  easeLinear = (t, b, c, d) => {
    return c * (t / d) + b;
  };

  easingFunctions = {
    'ease-in-out': this.easeInOutQuad,
    linear: this.easeLinear,
  };

  calcAttributeValue = (scrollPos, positions, values, easeFunc) => {
    const nextIndex = positions.findIndex((position) => position > scrollPos);

    // Return end value if next index is beyond the last position in the positions array.
    if (nextIndex === -1) {
      return values[values.length - 1];
    }
    const currentIndex = nextIndex - 1;
    const positionDuration = positions[nextIndex] - positions[currentIndex];
    const positionProgress = scrollPos - positions[currentIndex];

    const t = positionProgress / positionDuration;

    const value = easeFunc(
      positionProgress,
      values[currentIndex],
      values[nextIndex] - values[currentIndex],
      positionDuration
    );

    return value;
  };

  update = (scrollHistory) => {
    let scale;
    let translateX;
    let translateY;
    let rotate;

    this.attributes.forEach((item) => {
      const { attribute, positions, values, unit, easing } = item;

      const value = this.calcAttributeValue(
        scrollHistory[0],
        positions,
        values,
        this.easingFunctions[easing]
      );

      if (attribute === 'scale') scale = `${value}${unit}`;
      else if (attribute === 'translateX') translateX = `${value}${unit}`;
      else if (attribute === 'translateY') translateY = `${value}${unit}`;
      else if (attribute === 'rotate') rotate = `${value}${unit}`;
      else {
        this.fromDom.map((element) => {
          element.style[attribute] = `${value}${unit}`;
        });
      }
    });

    let transformString = '';

    if (scale !== undefined) {
      transformString = transformString + `scale(${scale})`;
    }

    if (translateX !== undefined && translateY !== undefined) {
      transformString =
        transformString + ` translate(${translateX}, ${translateY})`;
    } else if (translateX !== undefined) {
      transformString = transformString + ` translateX(${translateX})`;
    } else if (translateY !== undefined) {
      transformString = transformString + ` translateY(${translateY})`;
    }

    if (rotate !== undefined) {
      transformString = transformString + ` scale(${rotate})`;
    }

    if (transformString) {
      this.fromDom.map((element) => {
        element.style['transform'] = transformString;
      });
    }
  };
}

export default ParallaxAnimation;
