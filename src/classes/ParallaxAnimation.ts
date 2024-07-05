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
    // sinusoadial in and out
    return (-c / 2) * (Math.cos((Math.PI * t) / d) - 1) + b;
  };

  calcAttributeValue = (scrollPos, positions, values) => {
    const nextIndex = positions.findIndex((position) => position > scrollPos);

    // Return end value if next index is beyond the last position in the positions array.
    if (nextIndex === -1) {
      return values[values.length - 1];
    }
    const currentIndex = nextIndex - 1;
    const positionDuration = positions[nextIndex] - positions[currentIndex];
    const positionProgress = scrollPos - positions[currentIndex];

    const value = this.easeInOutQuad(
      positionProgress,
      values[currentIndex],
      values[nextIndex] - values[currentIndex],
      positionDuration
    );

    return value;
  };

  update = (scrollHistory) => {
    let scale;
    let translate;
    let rotate;

    this.attributes.forEach((item) => {
      const { attribute, positions, values } = item;

      const value = this.calcAttributeValue(
        scrollHistory[0],
        positions,
        values
      );

      if (attribute === 'scale') scale = value;
      else if (attribute === 'translate') translate = value;
      else if (attribute === 'rotate') rotate = value;
      else {
        this.fromDom.map((element) => {
          element.style[attribute] = value;
        });
      }
    });

    if (
      scale !== undefined ||
      translate !== undefined ||
      rotate !== undefined
    ) {
      this.fromDom.map((element) => {
        element.style['transform'] = `scale(${scale})`;
      });
    }
  };
}

export default ParallaxAnimation;
