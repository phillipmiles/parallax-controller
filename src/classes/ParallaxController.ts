import ParallaxTrigger from './ParallaxTrigger';

interface ParallaxControllerOptions {
  distance: number;
  scrollRestoration?: boolean;
}

class ParallaxController {
  // stageElement;
  triggers: ParallaxTrigger[] = [];
  scrollHistory: number[] = [];
  scrollRestoration;
  ticking = false;
  distance: number;

  constructor(options: ParallaxControllerOptions) {
    if (options.scrollRestoration === true) {
      history.scrollRestoration = 'auto';
    } else if (options.scrollRestoration === false) {
      history.scrollRestoration = 'manual';
    }

    this.scrollRestoration = options.scrollRestoration;
    this.distance = options.distance;
    // this.stageElement = options.element;
    window.addEventListener('scroll', this.requestTick, false);
  }

  init = () => {
    document.body.style.height = this.distance + window.innerHeight + 'px';

    // TODO SET ANIMATED ELEMENTS
  };

  private requestTick = () => {
    if (!this.ticking) {
      requestAnimationFrame(this.updatePage);
    }
    this.ticking = true;
  };

  private updatePage = () => {
    this.updateScrollHistory();
    this.processTriggers();

    this.ticking = false;
  };

  updateScrollHistory = () => {
    if (this.scrollHistory.length === 5) {
      this.scrollHistory.pop();
    }

    let scrollTop = window.scrollY;

    /* No overscroll screwing things up */
    if (scrollTop > this.distance) {
      scrollTop = this.distance;
    }

    this.scrollHistory.unshift(scrollTop);
  };

  processTriggers = () => {
    this.triggers.forEach((trigger) => {
      const shouldTrigger = trigger.shouldTrigger(
        this.scrollHistory[1],
        this.scrollHistory[0]
      );

      if (shouldTrigger) {
        trigger.trigger();
      }
    });
  };

  addTrigger = (trigger) => {
    this.triggers.push(trigger);
  };
}

export default ParallaxController;
