class ParallaxAudioSound {
  sourceNode;

  constructor(context, buffer, options) {
    console.log(context);
    this.sourceNode = new AudioBufferSourceNode(context, {
      buffer: buffer,
      loop: options.loop ? options.loop : false,
      playbackRate: 1, // Speed setting
    });

    // BUT WHERE DO WE PUT EFFECTS
    this.sourceNode.connect(context.destination);
  }

  start = () => {
    this.sourceNode.start();
  };

  stop = () => {
    this.sourceNode.stop();
  };
}

export default ParallaxAudioSound;
