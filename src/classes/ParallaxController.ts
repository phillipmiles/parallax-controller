import ParallaxAudioManager from './ParallaxAudioManager';
import ParallaxTrigger from './ParallaxTrigger';

interface ParallaxControllerOptions {
  distance: number;
  scrollRestoration?: boolean;
  scrollHistorySize?: number;
}

class ParallaxController {
  // stageElement;
  triggers: ParallaxTrigger[] = [];
  audioManagers: ParallaxAudioManager[] = [];
  scrollHistory: number[] = [];
  scrollRestoration;
  ticking = false;
  distance: number;

  constructor(options: ParallaxControllerOptions) {
    // Tells to restore scroll position or not on page load.
    if (options.scrollRestoration === true) {
      history.scrollRestoration = 'auto';
    } else {
      history.scrollRestoration = 'manual';
    }

    this.scrollRestoration = options.scrollRestoration;
    this.distance = options.distance;
    // this.stageElement = options.element;
  }

  init = () => {
    document.body.style.height = this.distance + window.innerHeight + 'px';

    this.scrollHistory.push(window.scrollY); // Need to store a value despite
    // scroll restoration as below solution on fires if restoration isn't already
    // at position 0.

    // If scroll restoration is true then we need to listen to the browser's
    // scroll event fired by the restoration to be available before getting
    // the init scroll position.
    if (this.scrollRestoration === true) {
      const initPageScroll = () => {
        this.scrollHistory = [window.scrollY];
        window.removeEventListener('scroll', initPageScroll, false);
      };
      window.addEventListener('scroll', initPageScroll, false);
    }

    // Sets ongoing scroll listener that runs all page updates.
    window.addEventListener('scroll', this.requestTick, false);
  };

  initAudio = () => {
    console.log(this.scrollHistory);
    this.audioManagers.forEach((audioManager) => {
      audioManager.init(this.scrollHistory);
    });
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
    this.processAudioManagers();

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

  processAudioManagers = () => {
    this.audioManagers.forEach((audioManager) => {
      audioManager.update(this.scrollHistory);

      if (audioManager.shouldTriggerStart(this.scrollHistory)) {
        audioManager.start(this.scrollHistory);
      }
      if (audioManager.shouldTriggerStop(this.scrollHistory)) {
        console.log('STOP!');
        audioManager.stop(this.scrollHistory);
      }
    });
  };

  addTrigger = (trigger: ParallaxTrigger) => {
    this.triggers.push(trigger);
  };

  addAudio = (audioManager: ParallaxAudioManager) => {
    this.audioManagers.push(audioManager);
  };
}

export default ParallaxController;
