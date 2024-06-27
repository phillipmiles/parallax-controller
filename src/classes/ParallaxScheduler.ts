class ParallaxScheduler {
  baseInterval;
  started = false;

  constructor({ baseInterval }) {
    this.baseInterval = baseInterval;
  }

  next = (sound) => {
    console.log('start');

    // IF NO CURRENT THEN NEXT BECOMES CURRENT IMMEDIENTLY

    // XXX NEED TO QUEUE SOUND.... USING START (WHEN)??.
    // ON THE AUDIO MANAGER TRIGGERING THE SOUND STOP WE SHOULD MAKE IT CALL TRIGGER TO CLEAR
    // ITS SOUND FROM THE QUEUE.
    // PUT INDIVIDUALLY FOR EACH INSTANCE OF SOUND. LIKE CLEAR A QUEUED SOUND BUT DON"T TRY
    // TO CLEAR A SOUND ALREADY PLAYING...
    this.started = true;
  };
}

export default ParallaxScheduler;
