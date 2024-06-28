class ParallaxAudioScheduler {
  baseInterval;
  time;
  started = false;
  currentSound;
  currentSoundMultipler;
  nextSound;
  nextSoundMultiplier;

  constructor({ baseInterval }) {
    this.baseInterval = baseInterval;
  }

  timeTill = (sound) => {
    const timeElapsed = (new Date().getTime() - this.time.getTime()) / 1000;
    const currentIntervalLength =
      this.baseInterval * this.currentSoundMultipler;

    const timeThroughBeat = timeElapsed % currentIntervalLength;
    return currentIntervalLength - timeThroughBeat;
  };

  next = (sound, intervalMultiplier) => {
    if (!this.started) {
      this.time = new Date();
      // JUST PLAY DA SOUND. NO WAIT
      sound.start();
      this.started = true;
      this.currentSound = sound;
      this.currentSoundMultipler = intervalMultiplier;

      // this.timeTill(sound);

      console.log('start');

      // Store playing sound somewhere!!!!
    } else {
      this.nextSound = sound;
      this.nextSoundMultiplier = intervalMultiplier;
      const timeTillCurrentEnds = this.timeTill(sound);
      console.log('WHEN?', timeTillCurrentEnds);
      sound.startWhen(timeTillCurrentEnds);
      // Get playing sound,
      // Calc time till it's finished ITS interval multiplier
      // Set a when on stopping the old sound
      // Set a when on playing this new sound. OR add stop listener and play then
    }

    // IF NO CURRENT THEN NEXT BECOMES CURRENT IMMEDIENTLY

    // XXX NEED TO QUEUE SOUND.... USING START (WHEN)??.
    // ON THE AUDIO MANAGER TRIGGERING THE SOUND STOP WE SHOULD MAKE IT CALL TRIGGER TO CLEAR
    // ITS SOUND FROM THE QUEUE.
    // PUT INDIVIDUALLY FOR EACH INSTANCE OF SOUND. LIKE CLEAR A QUEUED SOUND BUT DON"T TRY
    // TO CLEAR A SOUND ALREADY PLAYING...
  };
}

export default ParallaxAudioScheduler;
