import ParallaxAudioManager from './ParallaxAudioManager';

class ParallaxAudioSequence {
  sound;
  queue: ParallaxAudioManager[] = [];

  constructor() {}

  private next = () => {
    if (!this.queue[0]) {
      this.sound = undefined;
      return;
    }

    const newSound = this.queue[0].createSound();

    this.queue = this.queue.slice(1);

    if (!newSound) return false;

    this.sound = newSound;
    newSound.start(window.scrollY);
    newSound.sourceNode.addEventListener('ended', this.next);
  };

  add = (soundManager) => {
    if (this.sound) {
      this.queue.push(soundManager);
    } else {
      const newSound = soundManager.createSound();
      this.sound = newSound;

      newSound.start(window.scrollY);
      newSound.sourceNode.addEventListener('ended', this.next);
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
