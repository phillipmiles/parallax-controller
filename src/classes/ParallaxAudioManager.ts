import AudioSource from './AudioSource';
import ParallaxAudioSound from './ParallaxAudioSound';
import ParallaxTrigger from './ParallaxTrigger';

class ParallaxAudioManager {
  sourceNode;
  maxPlaying;
  loop;
  sounds = [];
  effects;

  scheduler;
  schedulerInterval;

  startTrigger;
  stopTrigger;

  onStart;
  onStop;

  constructor(
    source: AudioSource,
    {
      maxPlaying,
      start,
      stop,
      triggerDirection,
      onTriggerStart,
      onTriggerStop,
      onStart,
      onStop,
      effects,
      loop = false,
      scheduler,
      schedulerInterval,
    }
  ) {
    this.sourceNode = source;
    this.maxPlaying = maxPlaying;
    this.onStart = onStart;
    this.onStop = onStop;
    this.loop = loop;
    this.effects = effects;
    this.scheduler = scheduler;
    this.schedulerInterval = schedulerInterval;

    this.startTrigger = new ParallaxTrigger(start, {
      triggerDirection: triggerDirection,
      onTrigger: () => {},
    });

    if (stop) {
      this.stopTrigger = new ParallaxTrigger(stop, {
        triggerDirection:
          triggerDirection === 'both' ? 'both-reversed' : triggerDirection,
        onTrigger: () => {},
      });
    }
  }

  init = (scrollHistory) => {
    // If audio source has not yet finished fetching the file then create a
    // callback listener for when it is ready.
    if (!this.sourceNode.ready) {
      this.sourceNode.onLoad(() => {
        if (this.startTrigger.withinRange(scrollHistory[0])) {
          this.start(scrollHistory);
        }
      });
    } else {
      if (this.startTrigger.withinRange(scrollHistory[0])) {
        this.start(scrollHistory);
      }
    }
  };

  shouldTriggerStart = (scrollHistory) => {
    return this.startTrigger.shouldTrigger(scrollHistory[1], scrollHistory[0]);
  };

  shouldTriggerStop = (scrollHistory) => {
    return (
      this.stopTrigger &&
      this.stopTrigger.shouldTrigger(scrollHistory[1], scrollHistory[0])
    );
  };

  start = (scrollHistory) => {
    if (!this.sourceNode.ready) return false;

    const sound = this.createSound();
    if (!sound) return false;

    if (this.scheduler) {
      this.scheduler.next(sound, this.schedulerInterval);
    } else {
      sound.start(scrollHistory);
      if (this.onStart) this.onStart(sound);
      return true;
    }
  };

  stop = (scrollHistory) => {
    // XXX TOXO: STOP QUEED SOUNDS. CAN BE MUTIPLE BUT ISN"T ALL
    if (this.scheduler) {
      // XXX clear qued sounds
    }
    console.log('STOP SOUND');
    this.stopAll(scrollHistory);
    if (this.onStop) this.onStop();
  };

  // TODO::: Get effects value calculated here once and share it with all
  // sound instances??? But how to stop it calculating when we don't need it to???
  // cause this could be called before the sound has been started. Or maybe we don't
  // maybe update only does something if a sound is already existing? But
  // dodes the stuff up new initialisations. Maybe we need to calc effect
  // values within the start function too???

  update = (scrollHistory) => {
    if (this.sounds.length === 0) return;

    this.sounds.forEach((sound) => {
      sound.update(scrollHistory);
    });
  };

  createSound = () => {
    if (this.sounds.length >= this.maxPlaying) {
      return false;
    }

    const sound = new ParallaxAudioSound(
      this.sourceNode.context,
      this.sourceNode.buffer,
      {
        effects: this.effects,
        loop: this.loop,
      }
    );

    this.sounds.push(sound);

    return sound;
  };

  stopAll = (scrollHistory) => {
    this.sounds.forEach((sound) => {
      console.log(sound);
      // Stop playing sounds only
      if (sound.started) {
        sound.stop(scrollHistory);
      }
    });
    this.sounds = [];
  };
}

export default ParallaxAudioManager;
