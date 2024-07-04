import ParallaxAudioManager from './ParallaxAudioManager';

class ParallaxAudioSequence {
  sound;
  queue: ParallaxAudioManager[] = [];
  timeStarted;

  constructor() {}

  private ended = () => {
    if (!this.queue[0]) {
      this.sound = undefined;
      return;
    }

    const newSound = this.queue[0].createSound();

    this.queue = this.queue.slice(1);

    if (!newSound) return false;

    this.sound = newSound;
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

      newSound.start(window.scrollY);
      this.timeStarted = performance.now();

      newSound.sourceNode.addEventListener('ended', this.ended);
    }
  };

  remove = (queueIndex) => {
    this.queue = this.queue
      .slice(0, queueIndex)
      .concat(this.queue.slice(queueIndex + 1));

    console.log([...this.queue], queueIndex);
  };
}

export default ParallaxAudioSequence;
