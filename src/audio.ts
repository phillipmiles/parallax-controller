import { audio, scene } from './types';

// audio: [
//   {
//     src: 'assets/sfx/rocky.wav',
//     isLooped: true,
//     props: [{
//         type: 'gain',
//         values: [0, 0, 100, 0, 0],
//         keys: ['0%', '40%', '50%', '60%', '100%'],
//         isMotionControlled: true
//     }],
//   }
// ],

const getAudioFile = async (audioContext, filepath) => {
  const response = await fetch(filepath);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  return audioBuffer;
};

const playSample = (audioContext, audioBuffer, time) => {
  const sampleSource = new AudioBufferSourceNode(audioContext, {
    buffer: audioBuffer,
    playbackRate: 1, // Speed setting
  });
  sampleSource.connect(audioContext.destination);
  sampleSource.start();
  return sampleSource;
};

// https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Advanced_techniques#dial_up_%E2%80%94_loading_a_sound_sample

const initAudioSample = async (audioObj: audio) => {
  const audioCtx = new AudioContext();
  const audioBuffer = await getAudioFile(audioCtx, audioObj.src);
  audioObj.sample = { context: audioCtx, buffer: audioBuffer };
};

export const manageSceneAudio = (scene: scene, relativeScrollTop) => {
  if (!scene.audio) return;
  scene.audio.forEach((audioObj) => {
    // translateX = calcPropValue(
    //   audioObj,
    //   'translateX',
    //   'ease',
    //   scenes[currentScene].duration,
    //   relativeScrollTop
    // );

    // TODO Handle a check here to see if we should start loading the audio on
    // page load or lazy load it later???
    if (!audioObj.sample) {
      initAudioSample(audioObj);
    } else {
      playSample(audioObj.sample.context, audioObj.sample.buffer, 0);
    }
  });

  // const gainNode = audioCtx.createGain();

  // // create Oscillator node
  // const oscillator = audioCtx.createOscillator();

  // oscillator.type = 'square';
  // oscillator.frequency.setValueAtTime(3000, audioCtx.currentTime); // value in hertz
  // oscillator.connect(audioCtx.destination);
  // oscillator.start();
  // console.log('derp');
};
