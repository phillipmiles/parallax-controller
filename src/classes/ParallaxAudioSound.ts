class ParallaxAudioSound {
  sourceNode;
  effects = [];

  constructor(context, buffer, options) {
    this.sourceNode = new AudioBufferSourceNode(context, {
      buffer: buffer,
      loop: options.loop ? options.loop : false,
      playbackRate: 1, // Speed setting
    });

    options.effects.forEach((effect) => {
      const effectInstance = new effect.handler(context, effect);
      this.sourceNode.connect(effectInstance.node);
      this.effects.push(effectInstance);
    });

    this.effects[this.effects.length - 1].node.connect(context.destination);
  }

  start = (scrollHistory) => {
    this.sourceNode.start();
  };

  stop = (scrollHistory) => {
    this.sourceNode.stop();
  };

  update = (scrollHistory) => {
    this.effects.forEach((effect) => {
      effect.update(0.1);
    });
    // XXX TODO: CALC EFFECT VALUES HERE AND PASS THEM THROUGH???? OR DO THAT FROM
    // AUDIO MANAGER!?!?!?
    // const value = getCurrentPropValue(this, scrollHistory[0]);
    // this.effects[0].update(1);
    // const value = this.values[key]; // XX TODO NEED TO CALC VALUE WITH THAT QUAD FUNCTION
  };
}

export default ParallaxAudioSound;
