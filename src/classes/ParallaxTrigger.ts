export interface ParallaxTriggerOptions {
  onTrigger: Function;
  triggerDirection: 'forwards' | 'backwards' | 'both';
}

class ParallaxTrigger {
  triggerAt; // Is either a singular value or array with exactly 2 elements specifiying a range.
  triggerDirection;
  disabled = false;
  onTrigger; // Calback function called when trigger is fired.

  constructor(
    triggerAt: number | [number, number],
    options?: ParallaxTriggerOptions
  ) {
    this.onTrigger = options.onTrigger;

    this.triggerAt = triggerAt;
    this.triggerDirection = options.triggerDirection;
  }

  // Check to see if this trigger is a point trigger or a range trigger.
  hasRange = () => {
    if (this.triggerAt instanceof Array && this.triggerAt.length === 2) {
      return true;
    }
    return false;
  };

  withinRange = (value) => {
    if (!this.hasRange()) return false;

    if (value >= this.triggerAt[0] && value <= this.triggerAt[1]) {
      return true;
    } else {
      return false;
    }
  };

  private calcDirection = (currentValue, prevValue) => {
    return currentValue - prevValue > 0 ? 'forwards' : 'backwards';
  };

  trigger = () => {
    this.onTrigger();
  };
  // private convertTriggerToPx = () => {};

  // Called by parallax controller? Only parallax controller has the actual scroll
  // listener so we limit calculation on scroll deltas to one time per scroll rather
  // than every trigger
  shouldTrigger = (prevScrollValue, scrollValue) => {
    if (this.disabled) return false;

    switch (this.triggerDirection) {
      case 'both':
        if (this.hasRange()) {
          if (
            (prevScrollValue < this.triggerAt[0] &&
              this.triggerAt[0] <= scrollValue) ||
            (scrollValue <= this.triggerAt[1] &&
              this.triggerAt[1] < prevScrollValue)
          ) {
            return true;
          }
        } else if (
          (prevScrollValue < this.triggerAt && this.triggerAt <= scrollValue) ||
          (prevScrollValue > this.triggerAt && this.triggerAt >= scrollValue)
        ) {
          return true;
        }
        break;
      case 'forwards':
        if (this.hasRange()) {
          if (
            prevScrollValue < this.triggerAt[0] &&
            this.triggerAt[0] <= scrollValue
          ) {
            return true;
          }
        } else if (
          prevScrollValue < this.triggerAt &&
          this.triggerAt <= scrollValue
        ) {
          return true;
        }
        break;
      case 'backwards':
        if (this.hasRange()) {
          if (
            prevScrollValue > this.triggerAt[1] &&
            this.triggerAt[1] >= scrollValue
          ) {
            return true;
          }
        } else if (
          prevScrollValue > this.triggerAt &&
          this.triggerAt >= scrollValue
        ) {
          return true;
        }
        break;
    }

    return false;

    // Using current and before values passed and option settings of class determine if
    // this trigger has been triggered
    //   this.onTrigger('trigger start');
    // this.onTrigger('trigger stop');

    // SHOULD WE HAVE A TRIGGER START AND STOP OR SHOULD WE CREATE TWO DIFFERENT
    // PARALLAX TRIGGERS ONE FOR EACH???? Remember range is important for init.
  };
}

export default ParallaxTrigger;

// const trigger1Start = new ParallaxTrigger(AudioScheduler.trigger, {
//   scheduler??
// });

// const parallax = new ParallaxController();

// parallax.addTrigger(trigger1);

// class ParallaxController {
//   constructor() {}
// }

// class AudioContent {}

// class AudioSequence {
//   constructor() {}
// }

/*

- Parallax controller has triggers
- A trigger can have an audio
- An audio can have a schedule???
- Or a trigger can have a schedule???

OR

- Parallax controller has a library
- A library has audio
- Audio has a trigger


*/
