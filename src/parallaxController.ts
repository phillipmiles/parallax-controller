function parallaxController(scenes) {
  var windowHeight = 0,
    windowWidth = 0,
    bodyHeight = 0,
    scrollTop = 0,
    totalDuration = 0,
    currentWrapper = null,
    wrappers = [],
    ticking = false,
    scrollIntervalID = 0,
    prevScenesDurations = 0,
    relativeScrollTop = 0,
    currentScene = 0;

  init();

  function init() {
    windowHeight = window.innerHeight;
    windowWidth = window.innerWidth;
    scrollTop = window.scrollY;

    convertAllPropsToPx();

    buildPage();
    setPage();

    // debugMessages();

    // Need to look into which has better performance. My guess would be scrollInterval, but it
    // does mean the function is called even when the user isn't scrolling. The way requestTick is
    // set up prevents anything from running when the program isn't ready for it, so the EventListener
    // option may not actually be bad.
    //
    // Looks like scrollInterval is faster. The scroll fire takes about 0.02ms to 0.10ms to complete
    // before running the animation code which averages at about 0.35ms. The scroll interval does appear
    // to fire twice each frame, the second one having it's tick rejected. However it does run through
    // the animation calculations even if the user hasn't scrolled.
    window.addEventListener('scroll', requestTick, false);
    // scrollIntervalID = setInterval(requestTick, 10);
  }

  function debugMessages() {
    console.log('===========================');
    console.log('ScrollTop = ' + window.scrollY);
    console.log('Viewport height ' + windowHeight);
    console.log('Body Height = ' + bodyHeight);
    console.log('Total duration = ' + totalDuration);
    console.log('Duration for scene[0] = ' + scenes[0].duration);
    console.log('===========================');
  }

  function convertAllPropsToPx() {
    var i, j, k;

    for (i = 0; i < scenes.length; i++) {
      // loop scenes

      scenes[i].duration = convertPercentToPx(scenes[i].duration, 'y');
      totalDuration += scenes[i].duration;

      // loop animations
      for (j = 0; j < scenes[i].animations.length; j++) {
        // loop properties
        Object.keys(scenes[i].animations[j]).forEach(function (key) {
          let value = scenes[i].animations[j][key];

          if (key !== 'selector') {
            if (value instanceof Array) {
              // if its an array
              for (k = 0; k < value.length; k++) {
                // if value in array is %
                if (typeof value[k] === 'string') {
                  if (key === 'translateY') {
                    value[k] = convertPercentToPx(value[k], 'y');
                  } else if (key === 'translateX') {
                    value[k] = convertPercentToPx(value[k], 'x');
                  }
                }
              }

              // If animation property contains keys/positions object.
            } else if (typeof value === 'object') {
              for (k = 0; k < value.positions.length; k++) {
                // Convert positions to pixels.
                if (typeof value.positions[k] === 'string') {
                  if (key === 'translateY') {
                    value.positions[k] = convertPercentToPx(
                      value.positions[k],
                      'y'
                    );
                  } else if (key === 'translateX') {
                    value.positions[k] = convertPercentToPx(
                      value.positions[k],
                      'x'
                    );
                  }
                }

                // Convert keys to pixels.
                if (typeof value.keys[k] === 'string') {
                  value.keys[k] = convertPercentToPx(
                    value.keys[k],
                    scenes[i].duration
                  );
                }
              }
            } else {
              if (typeof value === 'string') {
                // if single value is a %
                if (key === 'translateY') {
                  value = convertPercentToPx(value, 'y');
                } else if (key === 'translateX') {
                  value = convertPercentToPx(value, 'x');
                }
              }
            }
            scenes[i].animations[j][key] = value;
          }
        });
      }
    }
  }

  function buildPage() {
    var i, j, k;

    for (i = 0; i < scenes.length; i++) {
      // loop scenes

      bodyHeight += scenes[i].duration;

      if (!wrappers.includes(scenes[i].wrapper)) {
        wrappers.push(scenes[i].wrapper);
      }

      for (j = 0; j < scenes[i].animations.length; j++) {
        // loop animations

        Object.keys(scenes[i].animations[j]).forEach(function (key) {
          // loop properties
          let value = scenes[i].animations[j][key];

          if (
            key !== 'selector' &&
            value instanceof Array === false &&
            value instanceof Object === false
          ) {
            var valueSet = [];
            valueSet.push(getDefaultPropertyValue(key), value);
            value = valueSet;
          }
          scenes[i].animations[j][key] = value;
        });
      }
    }

    document.body.style.height = bodyHeight + windowHeight + 'px';

    setScrollTops();
    currentWrapper = wrappers[0];

    let element;

    if (isStringIdName(currentWrapper)) {
      element = document.getElementById(currentWrapper.split('#')[1]);
    } else {
      throw 'Cant handle classnames here yet';
    }

    element.style.display = 'block';
  }

  function convertPercentToPx(value, relativeTo) {
    if (typeof value === 'string' && value.match(/%/g)) {
      if (typeof relativeTo === 'string') {
        if (relativeTo === 'y')
          value = Math.round((parseFloat(value) / 100) * windowHeight);
        if (relativeTo === 'x')
          value = Math.round((parseFloat(value) / 100) * windowWidth);
      } else if (typeof relativeTo === 'number') {
        value = Math.round((parseFloat(value) / 100) * relativeTo);
      }
    }
    return value;
  }

  function setScrollTops() {
    scrollTop = window.scrollY;

    /* No overscroll screwing things up */
    if (scrollTop > totalDuration) {
      scrollTop = totalDuration;
    }

    relativeScrollTop = scrollTop - prevScenesDurations;
  }

  function requestTick() {
    if (!ticking) {
      requestAnimationFrame(updatePage);
    }
    ticking = true;
  }

  function updatePage() {
    setScene();
    setScrollTops();
    animateElements();
    ticking = false;
  }

  function setScene() {
    // If blah blah and scroll position hasn't exceeded the documents height.
    if (
      scrollTop > scenes[currentScene].duration + prevScenesDurations &&
      scrollTop < totalDuration + windowHeight
    ) {
      forceAnimationEnd();

      prevScenesDurations += scenes[currentScene].duration;
      currentScene++;

      showCurrentWrappers();
    } else if (scrollTop < prevScenesDurations && scrollTop >= 0) {
      forceAnimationStart();

      currentScene--;
      prevScenesDurations -= scenes[currentScene].duration;
      showCurrentWrappers();
    }
  }

  // This is intended to run at the end of a scene forcing all animations to reach their
  // end positions, a necessary function due to intentional frame skips leaving objects in the wrong
  // position or state after a scene transition.
  function forceAnimationEnd() {
    var animation, translateY, translateX, scale, rotate, opacity;

    for (var i = 0; i < scenes[currentScene].animations.length; i++) {
      animation = scenes[currentScene].animations[i];
      translateY = getPropValue(animation, 'translateY', 'end');
      translateX = getPropValue(animation, 'translateX', 'end');
      scale = getPropValue(animation, 'scale', 'end');
      rotate = getPropValue(animation, 'rotate', 'end');
      opacity = getPropValue(animation, 'opacity', 'end');

      animateSelector(
        animation.selector,
        translateX,
        translateY,
        scale,
        rotate,
        opacity
      );
    }
  }

  // This is intended to run at the end of a scene forcing all animations to reach their
  // end positions, a necessary function due to intentional frame skips leaving objects in the wrong
  // position or state after a scene transition.
  function forceAnimationStart() {
    var animation, translateY, translateX, scale, rotate, opacity;

    for (var i = 0; i < scenes[currentScene].animations.length; i++) {
      animation = scenes[currentScene].animations[i];
      translateY = getPropValue(animation, 'translateY', 'start');
      translateX = getPropValue(animation, 'translateX', 'start');
      scale = getPropValue(animation, 'scale', 'start');
      rotate = getPropValue(animation, 'rotate', 'start');
      opacity = getPropValue(animation, 'opacity', 'start');

      animateSelector(
        animation.selector,
        translateX,
        translateY,
        scale,
        rotate,
        opacity
      );
    }
  }

  function showCurrentWrappers() {
    var i;

    if (scenes[currentScene].wrapper != currentWrapper) {
      let oldWrapperElement;
      let currentWrapperElement;

      if (isStringIdName(currentWrapper)) {
        oldWrapperElement = document.getElementById(
          currentWrapper.split('#')[1]
        );
      } else {
        throw 'Cant handle classnames here yet';
      }

      if (isStringIdName(scenes[currentScene].wrapper)) {
        currentWrapperElement = document.getElementById(
          currentWrapper.split('#')[1]
        );
      } else {
        throw 'Cant handle classnames here yet';
      }

      oldWrapperElement.style.display = 'none';
      currentWrapperElement.style.display = 'block';

      currentWrapper = scenes[currentScene].wrapper;
    }
  }

  // This function sets all the elements to their correct, non-default position as per the pages
  // current scroll position at page load.
  function setPage() {
    while (scrollTop > scenes[currentScene].duration + prevScenesDurations) {
      prevScenesDurations += scenes[currentScene].duration;
      currentScene++;
    }

    for (var i = 0; i < currentScene; i++) {
      // Run through and set all animated elements to their end positions until we hit the current Scene.
      if (currentScene != i) {
        for (let j = 0; j < scenes[i].animations.length; j++) {
          var animation, translateY, translateX, scale, rotate, opacity;

          animation = scenes[i].animations[j];
          translateY = getPropValue(animation, 'translateY', 'end');
          translateX = getPropValue(animation, 'translateX', 'end');
          scale = getPropValue(animation, 'scale', 'end');
          rotate = getPropValue(animation, 'rotate', 'end');
          opacity = getPropValue(animation, 'opacity', 'end');

          animateSelector(
            animation.selector,
            translateX,
            translateY,
            scale,
            rotate,
            opacity
          );
        }
      } else {
        animateElements();
      }
    }
  }

  function getDefaultPropertyValue(property) {
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
  }

  // ==================
  // Animation function
  // ==================

  function animateElements() {
    var current_scroll = scrollTop;
    var animation, translateY, translateX, scale, rotate, opacity;

    for (var i = 0; i < scenes[currentScene].animations.length; i++) {
      animation = scenes[currentScene].animations[i];
      translateY = calcPropValue(animation, 'translateY', 'ease');
      translateX = calcPropValue(animation, 'translateX', 'ease');
      scale = calcPropValue(animation, 'scale', 'ease');
      rotate = calcPropValue(animation, 'rotate', 'ease');
      opacity = calcPropValue(animation, 'opacity', 'ease');

      // translateY = current_scroll / 2.5;
      // translateY = Math.round(translateY);
      // el.style['transform'] = "translate3d(0px" + ", -" + translateY + "px" + ", 0)";
      // console.log(translateY);

      animateSelector(
        animation.selector,
        translateX,
        translateY,
        scale,
        rotate,
        opacity
      );
    }
  }

  function animateSelector(
    selector,
    translateX,
    translateY,
    scale,
    rotate,
    opacity
  ) {
    if (isStringClassName(selector)) {
      const fromDom = document.getElementsByClassName(selector.split('.')[1]);
      for (let element of fromDom) {
        animateElement(element, translateX, translateY, scale, rotate, opacity);
      }
    } else {
      const fromDom = document.getElementById(selector.split('#')[1]);
      animateElement(fromDom, translateX, translateY, scale, rotate, opacity);
    }
  }

  // Animate an element with transform: translate3D CSS property.
  function animateElement(
    element,
    translateX,
    translateY,
    scale,
    rotate,
    opacity
  ) {
    element.style.opacity = opacity;
    element.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale}) rotate(${rotate}deg)`;
  }

  // Fetches the position value for an animated elements property.
  function getPropValue(animation, property, position) {
    var value = animation[property];

    if (value) {
      if (value instanceof Array === false) {
        if (position == 'start') {
          value = animation[property].positions[0];
        } else if (position == 'end') {
          value =
            animation[property].positions[
              animation[property].positions.length - 1
            ];
        }
      } else {
        if (position == 'start') {
          value = value[0];
        } else if (position == 'end') {
          value = value[1];
        }
      }
    } else {
      value = getDefaultPropertyValue(property);
    }

    return value;
  }

  function calcPropValue(animation, property, type) {
    var value = animation[property];
    var currentKey = 0;

    var currentTime = relativeScrollTop;
    var duration = scenes[currentScene].duration;

    var startValue;
    let endValue;

    if (value && type === 'ease') {
      if (value instanceof Array === false) {
        while (currentKey < animation[property].keys.length - 1) {
          if (
            relativeScrollTop >= animation[property].keys[currentKey] &&
            relativeScrollTop <= animation[property].keys[currentKey + 1]
          ) {
            // Adjust current time to account for offset caused by past keys.
            currentTime = currentTime - animation[property].keys[currentKey];
            duration =
              animation[property].keys[currentKey + 1] -
              animation[property].keys[currentKey];
            break;

            // Force to last key if scroll exceeds scene total duration.
          } else if (relativeScrollTop > duration) {
            currentKey = animation[property].keys.length - 2;
            currentTime = currentTime - animation[property].keys[currentKey];
            duration =
              animation[property].keys[currentKey + 1] -
              animation[property].keys[currentKey];
            break;
          } else {
            currentKey++;
          }
        }

        startValue = animation[property].positions[currentKey];
        endValue = animation[property].positions[currentKey + 1];
      } else {
        startValue = value[0];
        endValue = value[1];
      }

      value = easeInOutQuad(
        currentTime,
        startValue,
        endValue - startValue,
        duration
      );
    } else if (value && type === 'instant') {
      value = value[1];
    } else {
      value = getDefaultPropertyValue(property);
    }

    /* Return console error when calculation fails */
    if (isNaN(value)) {
      console.log('NaN returned when caculating animation value.');
    }

    return value;
  }

  function easeInOutQuad(t, b, c, d) {
    // sinusoadial in and out
    return (-c / 2) * (Math.cos((Math.PI * t) / d) - 1) + b;
  }

  return {
    // Getters
    getCurrentWrapper: function () {
      return currentWrapper;
    },
    getCurrentScene: function () {
      return currentScene;
    },
    getTotalDuration: function () {
      return totalDuration;
    }, // In pixels

    // Functions
    start: function () {
      console.log('Public starting');
    },

    stop: function () {
      console.log('Public stoping');
    },
  };
}

// TODO: Make into an NPM module.
// module.exports = parallaxController;

function getElementBySelector(selector) {
  if (selector[0] === '#') {
    return document.getElementById(selector.split('#')[1]);
  } else if (selector[0] === '.') {
    return document.getElementsByClassName(selector.split('.')[1]);
  }
}

const isStringClassName = (string) => {
  return string[0] === '.' ? true : false;
};

const isStringIdName = (string) => {
  return string[0] === '#' ? true : false;
};
