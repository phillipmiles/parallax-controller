import ParallaxAudioManager from './ParallaxAudioManager';

class ParallaxAudioSequence {
  sound;
  current: ParallaxAudioManager;
  queue: ParallaxAudioManager[] = [];
  timeStarted;
  onNext: Function;

  constructor(onNext) {
    this.onNext = onNext;
  }

  private ended = () => {
    if (this.onNext) this.onNext();
    if (!this.queue[0]) {
      this.sound = undefined;
      this.current = undefined;
      return;
    }

    const newSound = this.queue[0].createSound();

    if (!newSound) return false;
    this.current = this.queue[0];
    this.sound = newSound;
    this.queue = this.queue.slice(1);

    newSound.start(window.scrollY);
    this.timeStarted = performance.now();
    newSound.sourceNode.addEventListener('ended', this.ended);
  };

  // next = (when?) => {
  //   this.sound.sourceNode.addEventListener('ended', this.ended);
  //   this.sound.stop(when);
  // };

  add = (soundManager) => {
    if (this.sound) {
      this.queue.push(soundManager);
    } else {
      const newSound = soundManager.createSound();
      this.sound = newSound;
      this.current = soundManager;

      newSound.start(window.scrollY);
      this.timeStarted = performance.now();

      newSound.sourceNode.addEventListener('ended', this.ended);
    }
  };

  remove = (queueIndex) => {
    this.queue = this.queue
      .slice(0, queueIndex)
      .concat(this.queue.slice(queueIndex + 1));
  };
}

export default ParallaxAudioSequence;
