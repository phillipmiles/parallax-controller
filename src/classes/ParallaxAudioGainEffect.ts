import { getCurrentPropValue } from '../property';

// XXXXXX NOOOOPE! WE ARE ONLY MAKING ONE CLASS INSTANCE AND OVERRIDING GAINNODE
// EACH TIME WE CREATE A NEW SOUND!!!!!!!!!!!!! THIS NEEDS TO BE TREATED MORE LIKE
// A RECIEPE!?!?! RATHER THAN A WRAPPER FOR A SPECIFIC GAIN NODE IF I WANT TO
// CREATE IT FROM THE ROOT JS FILE AND PASS IT INTO AN AUDIO MANAGER. AUDIO MANGER
// OR AUDIOSOUND SHOULD HOLD ALL CREATED GAINNODES.

// OR REWRITE CLASS AS AN ParallaxAudioEffectScheme???
class ParallaxAudioGainEffect {
  values;
  keys;
  context;
  node;

  constructor(context, { values, keys }) {
    this.values = values;
    this.keys = keys;

    this.context = context;
    this.node = context.createGain();
  }

  update = (scrollHistory) => {
    const value = getCurrentPropValue(this, scrollHistory[0]);

    this.node.gain.setValueAtTime(value, this.context.currentTime);
  };
}

export default ParallaxAudioGainEffect;
