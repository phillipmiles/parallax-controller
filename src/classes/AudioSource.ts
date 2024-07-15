class AudioSource {
  src;
  context;
  buffer;
  ready = false;
  onLoadCallbacks = [];

  constructor(src: string) {
    this.src = src;
  }

  private getAudioFile = async (audioContext, filepath) => {
    const response = await fetch(filepath);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    return audioBuffer;
  };

  load = async () => {
    this.context = new AudioContext();
    this.buffer = await this.getAudioFile(this.context, this.src);
    console.log('LOADED!!!!');
    this.ready = true;
    this.onLoadCallbacks.forEach((func) => func());
  };

  onLoad = (func) => {
    this.onLoadCallbacks.push(func);
  };
}

export default AudioSource;
