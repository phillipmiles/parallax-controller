import AudioSource from './AudioSource';
import ParallaxAudioSound from './ParallaxAudioSound';

class ParallaxAudioManager {
  sourceNode;
  maxPlaying;
  sounds = [];

  constructor(source: AudioSource, { maxPlaying }) {
    this.sourceNode = source;
    this.maxPlaying = maxPlaying;
  }

  createSound = () => {
    if (this.sounds.length >= this.maxPlaying) {
      return false;
    }

    const sound = new ParallaxAudioSound(
      this.sourceNode.context,
      this.sourceNode.buffer,
      {}
    );
    this.sounds.push(sound);

    return sound;
  };

  stopAll = () => {
    this.sounds.forEach((sound) => {
      sound.stop();
    });
  };
}

export default ParallaxAudioManager;
