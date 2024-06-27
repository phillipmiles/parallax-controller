class AudioSource {
  src;
  context;
  buffer;
  ready = false;

  constructor(src: string) {
    this.src = src;
  }

  private getAudioFile = async (audioContext, filepath) => {
    const response = await fetch(filepath);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    this.ready = true;
    return audioBuffer;
  };

  load = async () => {
    this.context = new AudioContext();
    this.buffer = await this.getAudioFile(this.context, this.src);
  };
}

export default AudioSource;
