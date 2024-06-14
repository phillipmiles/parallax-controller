import { calcPropValue, easeInOutQuad } from './animation';
import { manageSceneAudio } from './audio';
import {
  convertScenesPropsToPx,
  convertSceneShorthandProps,
  getTotalDuration,
} from './parallax';

interface config {
  scrollRestoration: boolean;
}

export const parallaxController = (scenes, config: config) => {
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

    if (config.scrollRestoration === true) {
      history.scrollRestoration = 'auto';
    } else if (config.scrollRestoration === false) {
      history.scrollRestoration = 'manual';
    }

    convertScenesPropsToPx(scenes);
    scenes.forEach((scene) => {
      convertSceneShorthandProps(scene);
    });
    totalDuration = getTotalDuration(scenes);

    buildPage();

    // If scroll restoration is true then we need to listen to the
    // scroll event to be avaiable before getting the scroll position
    // and initilising past scenes
    if (config.scrollRestoration === true) {
      const initPageScroll = () => {
        setScrollTops();
        setPage();
        window.removeEventListener('scroll', initPageScroll, false);
      };
      window.addEventListener('scroll', initPageScroll, false);
    }

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

  function buildPage() {
    // loop scenes
    for (let i = 0; i < scenes.length; i++) {
      bodyHeight += scenes[i].duration;

      if (!wrappers.includes(scenes[i].wrapper)) {
        wrappers.push(scenes[i].wrapper);
      }
    }

    document.body.style.height = bodyHeight + windowHeight + 'px';

    currentWrapper = wrappers[0];

    let element;

    if (isStringIdName(currentWrapper)) {
      element = document.getElementById(currentWrapper.split('#')[1]);
    } else {
      throw 'Cant handle classnames here yet';
    }

    element.style.display = 'block';
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
    manageSceneAudio(scenes[currentScene], relativeScrollTop);
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
    // ERROR!!!!
    // ERROR!!!!
    // This function is suppose to set all previous scenes to the correct
    // values on page load but we can't get the scroll position yet. It still returns
    // zero and hasn't restored itself yet.
    // ERROR!!!!
    // ERROR!!!!
    console.log('currentScene', currentScene, scrollTop);
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
      translateY = calcPropValue(
        animation,
        'translateY',
        'ease',
        scenes[currentScene].duration,
        relativeScrollTop
      );
      translateX = calcPropValue(
        animation,
        'translateX',
        'ease',
        scenes[currentScene].duration,
        relativeScrollTop
      );
      scale = calcPropValue(
        animation,
        'scale',
        'ease',
        scenes[currentScene].duration,
        relativeScrollTop
      );
      rotate = calcPropValue(
        animation,
        'rotate',
        'ease',
        scenes[currentScene].duration,
        relativeScrollTop
      );
      opacity = calcPropValue(
        animation,
        'opacity',
        'ease',
        scenes[currentScene].duration,
        relativeScrollTop
      );

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
};

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
