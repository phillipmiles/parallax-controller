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
      // TODO:: XXX Should we call an update function on all audioMangers here before
      // triggering???
      audioManager.update(this.scrollHistory);

      if (audioManager.shouldTriggerStart(this.scrollHistory)) {
        audioManager.start(this.scrollHistory);
      }
      if (audioManager.shouldTriggerStop(this.scrollHistory)) {
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
