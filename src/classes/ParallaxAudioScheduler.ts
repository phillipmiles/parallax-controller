class ParallaxAudioScheduler {
  baseInterval;
  time;
  started = false;
  currentSoundManager;
  nextSoundManager;

  constructor({ baseInterval }) {
    this.baseInterval = baseInterval;
  }

  timeTill = () => {
    const timeElapsed = (new Date().getTime() - this.time.getTime()) / 1000;
    const currentIntervalLength =
      this.baseInterval * this.currentSoundManager.schedulerInterval;

    const timeThroughBeat = timeElapsed % currentIntervalLength;
    return currentIntervalLength - timeThroughBeat;
  };

  next = (soundManager) => {
    if (soundManager === this.currentSoundManager) {
      // XXX Clear next and clear stopWhens
      return;
    }

    if (!this.started) {
      this.time = new Date();
      // JUST PLAY DA SOUND. NO WAIT
      const sound = soundManager.createSound();
      sound.start();
      this.started = true;
      this.currentSoundManager = soundManager;

      console.log('start');
    } else {
      this.nextSoundManager = soundManager;

      const timeTillCurrentEnds = this.timeTill();
      console.log('WHEN?', timeTillCurrentEnds);

      const sound = soundManager.createSound();
      sound.startWhen(timeTillCurrentEnds);

      // OR SET A STOPWHEN AND LISTEN TO CURRENT SOUND TO STOP BEFORE PLAYING NEXT
    }
  };

  stop = () => {
    const timeTillCurrentEnds = this.timeTill();
    console.log(timeTillCurrentEnds);

    // XXX TODO LOOP THROUGH ALL SOUNDS
    // this.currentSoundManager.stopAllWhen(timeTillCurrentEnds);

    // this.currentSound.stopWhen(timeTillCurrentEnds);
  };
}

export default ParallaxAudioScheduler;
