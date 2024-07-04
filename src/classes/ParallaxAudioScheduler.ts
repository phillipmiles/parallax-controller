class ParallaxAudioScheduler {
  interval;
  time;
  started = false;
  // currentSoundManager;
  // nextSoundManager;

  constructor({ baseInterval }) {
    this.interval = baseInterval;
  }

  createSilence = () => {
    const context = new AudioContext();
    const buffer = context.createBuffer(2, 1000, context.sampleRate);
    const silence = new AudioBufferSourceNode(context, {
      buffer: buffer,
      // loop: options.loop ? options.loop : false,
      playbackRate: 1, // Speed setting
    });
    silence.start();
    silence.addEventListener('ended', () => {
      console.log('SILENCED ENDED');
    });
    console.log('YAY');
  };

  timeTill = (interval) => {
    const timeElapsed = (performance.now() - this.time) / 1000;
    const timeThroughBeat = timeElapsed % interval;
    return interval - timeThroughBeat;
  };

  resetTime = () => {
    this.createSilence();
    // this.time = performance.now();
  };

  next = (soundManager) => {
    // if (soundManager === this.currentSoundManager) {
    //   console.log('WHAAAIIIT WHATT!?!? NOOOOO');
    //   // XXX Clear next and clear stopWhens
    //   soundManager.clearAllStopWhens();
    //   return;
    // }

    if (!this.started) {
      this.time = performance.now();
      const sound = soundManager.createSound();
      sound.start();
      this.started = true;
    } else {
      const sound = soundManager.createSound();
      if (!sound) return;
      const timeTillCurrentEnds = this.timeTill(this.interval);

      // XXXX WONT CREATE SOUND IF MAX SOUNDS IS 1!!! AND WE ARE GOING BACK TO CURRENT
      // SOUND

      sound.startWhen(timeTillCurrentEnds);

      // setTimeout(() => {
      //   this.currentSoundManager = this.nextSoundManager;
      // });

      // XXX WE NEVER UPDATE CURRENTSOUNDMANGER AFTER A NEW ONE STARTS. CAUSE WE HAVE NO START LISTENERS
      // So how do we keep track of the updated interval.

      // Also this function only lets one sound manager start playing at any one time. What if
      // we wanted multiple sound mangers to start on beat at the same time?

      // OR SET A STOPWHEN AND LISTEN TO CURRENT SOUND TO STOP BEFORE PLAYING NEXT
    }
  };

  setInterval = (newInterval) => {
    this.interval = newInterval;
    // this.time = performance.now();
  };

  stop = (soundManager) => {
    // const timeTillCurrentEnds = this.timeTill();
    const timeTillCurrentEnds = this.timeTill(this.interval);

    soundManager.stopAllWhen(timeTillCurrentEnds);
  };
}

export default ParallaxAudioScheduler;
