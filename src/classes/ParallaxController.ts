import ParallaxAudioManager from './ParallaxAudioManager';
import ParallaxTrigger from './ParallaxTrigger';

interface ParallaxControllerOptions {
  distance: number;
  scrollRestoration?: boolean;
  scrollHistorySize?: number;
  onUpdate?: Function;
}

class ParallaxController {
  // stageElement;
  triggers: ParallaxTrigger[] = [];
  audioManagers: ParallaxAudioManager[] = [];
  scrollHistory: number[] = [];
  scrollRestoration;
  ticking = false;
  distance: number;
  onUpdate;

  constructor(options: ParallaxControllerOptions) {
    // Tells to restore scroll position or not on page load.
    if (options.scrollRestoration === true) {
      history.scrollRestoration = 'auto';
    } else {
      history.scrollRestoration = 'manual';
    }

    this.onUpdate = options.onUpdate;
    this.scrollRestoration = options.scrollRestoration;
    this.distance = options.distance;
    // this.stageElement = options.element;
  }

  init = () => {
    document.body.style.height = this.distance + window.innerHeight + 'px';

    this.scrollHistory.push(window.scrollY); // Need to store a value despite
    // scroll restoration as below solution on fires if restoration isn't already
    // at position 0.
    this.setPage();

    // If scroll restoration is true then we need to listen to the browser's
    // scroll event fired by the restoration to be available before getting
    // the init scroll position.
    if (this.scrollRestoration === true) {
      const initPageScroll = () => {
        this.scrollHistory = [window.scrollY];
        this.setPage();
        window.removeEventListener('scroll', initPageScroll, false);
      };
      window.addEventListener('scroll', initPageScroll, false);
    }

    // Sets ongoing scroll listener that runs all page updates.
    window.addEventListener('scroll', this.requestTick, false);
  };

  private setPage = () => {
    this.triggers.forEach((trigger) => {
      if (trigger.withinRange(this.scrollHistory[0])) {
        trigger.trigger();
      }
    });
  };
  // initAudio = () => {
  //   this.audioManagers.forEach((audioManager) => {
  //     audioManager.init(this.scrollHistory);
  //   });
  // };

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

    if (this.onUpdate) this.onUpdate();

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
      } else if (audioManager.shouldTriggerStop(this.scrollHistory)) {
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
