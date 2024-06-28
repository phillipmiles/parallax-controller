class ParallaxAudioSound {
  sourceNode;
  started = false;
  effects = [];

  constructor(context, buffer, options) {
    const { effects } = options;

    this.sourceNode = new AudioBufferSourceNode(context, {
      buffer: buffer,
      loop: options.loop ? options.loop : false,
      playbackRate: 1, // Speed setting
    });

    if (effects) {
      effects.forEach((effect, index) => {
        const effectInstance = new effect.handler(context, effect);

        if (index === 0) {
          this.sourceNode.connect(effectInstance.node);
        } else {
          effects[index - 1].node.connect(effectInstance.node);
        }

        this.effects.push(effectInstance);
      });

      this.effects[this.effects.length - 1].node.connect(context.destination);
    } else {
      this.sourceNode.connect(context.destination);
    }
  }

  start = (scrollHistory) => {
    this.update(scrollHistory); // Make sure sound effects are updated before starting
    this.sourceNode.start();
    this.started = true;
  };

  stop = (scrollHistory) => {
    this.sourceNode.stop();
  };

  update = (scrollHistory) => {
    this.effects.forEach((effect) => {
      effect.update(scrollHistory);
    });
  };
}

export default ParallaxAudioSound;
