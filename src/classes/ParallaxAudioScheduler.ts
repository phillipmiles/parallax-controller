class ParallaxAudioScheduler {
  baseInterval;
  interval;
  time;
  started = false;
  currentSoundManager;
  nextSoundManager;

  constructor({ baseInterval }) {
    this.baseInterval = baseInterval;
    this.interval = baseInterval;
  }

  timeTill = () => {
    const timeElapsed = (new Date().getTime() - this.time.getTime()) / 1000;
    const currentIntervalLength =
      this.baseInterval * this.currentSoundManager.schedulerInterval;

    const timeThroughBeat = timeElapsed % currentIntervalLength;
    return currentIntervalLength - timeThroughBeat;
  };

  timeTillNextInterval = (intervalMutiplier) => {
    // !!!!!!!!!!!!!
    // USING WRONG TIME. NOT TIME FROM SCHeDULER NEEDED TIME FROM LAST PLAYED????
    // Maybe each sound should keep a time of when it started.
    // !!!!!!!!!!!!!xx
    const timeElapsed = (new Date().getTime() - this.time.getTime()) / 1000;
    const currentIntervalLength = this.baseInterval * intervalMutiplier;

    const timeThroughBeat = timeElapsed % currentIntervalLength;
    return currentIntervalLength - timeThroughBeat;
  };

  next = (soundManager) => {
    // if (soundManager === this.currentSoundManager) {
    //   console.log('WHAAAIIIT WHATT!?!? NOOOOO');
    //   // XXX Clear next and clear stopWhens
    //   return;
    // }

    if (!this.started) {
      this.time = new Date();
      // JUST PLAY DA SOUND. NO WAIT
      const sound = soundManager.createSound();
      sound.start();
      this.started = true;
      this.currentSoundManager = soundManager;

      console.log('start SCHED');
    } else {
      this.nextSoundManager = soundManager;

      const timeTillCurrentEnds = this.timeTill();
      console.log('WHEN?', timeTillCurrentEnds);

      const sound = soundManager.createSound();

      sound.startWhen(timeTillCurrentEnds);

      // XXX WE NEVER UPDATE CURRENTSOUNDMANGER AFTER A NEW ONE STARTS. CAUSE WE HAVE NO START LISTENERS
      // So how do we keep track of the updated interval.

      // Also this function only lets one sound manager start playing at any one time. What if
      // we wanted multiple sound mangers to start on beat at the same time?

      // OR SET A STOPWHEN AND LISTEN TO CURRENT SOUND TO STOP BEFORE PLAYING NEXT
    }
  };

  setInterval = (newInterval) => {
    this.interval = newInterval;
  };

  stop = (soundManager) => {
    console.log(soundManager.schedulerInterval);
    // const timeTillCurrentEnds = this.timeTill();
    const timeTillCurrentEnds = this.timeTillNextInterval(
      soundManager.schedulerInterval
    );

    console.log(
      'We will stop now',
      this.currentSoundManager,
      timeTillCurrentEnds
    ); // WRONG sound manager trying to stop. issue when stopping and starting
    // are handled by seperate listeners??

    soundManager.stopAllWhen(timeTillCurrentEnds);
  };
}

export default ParallaxAudioScheduler;
