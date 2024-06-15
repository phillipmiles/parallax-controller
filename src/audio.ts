import { easeInOutQuad } from './animation';
import { getCurrentPropValue } from './property';
import { audio, scene } from './types';

// audio: [
//   {
//     src: 'assets/sfx/rocky.wav',
//     isLooped: true,
//     start: 36%,
//     stop: 42%,
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

// https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode
//
const playSample = (audioContext, audioBuffer, time) => {
  const sampleSource = new AudioBufferSourceNode(audioContext, {
    buffer: audioBuffer,
    loop: false,
    playbackRate: 1, // Speed setting
  });
  sampleSource.connect(audioContext.destination);
  sampleSource.start();
  return sampleSource;
};

// https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Advanced_techniques#dial_up_%E2%80%94_loading_a_sound_sample

const initAudioSample = async (audioObj: audio) => {
  const audioCtx = new AudioContext();
  audioCtx.onstatechange = () => {
    console.log('state2', audioCtx.state);
  };
  audioObj.sample = { state: 'loading', context: null, buffer: null };
  const audioBuffer = await getAudioFile(audioCtx, audioObj.src);
  audioObj.sample = { state: 'ready', context: audioCtx, buffer: audioBuffer };
};

const applyAudioProp = (audioObj, prop, relativeScrollTop, value) => {
  console.log('do somethin');
};

const applyAudioProps = (audioObj, relativeScrollTop) => {
  audioObj.props.forEach((prop) => {
    const value = getCurrentPropValue(prop, relativeScrollTop);
    // TODO::: Maybe instead collect an array of the calculated values to
    // be applied to the audio object or anmation selector and apply them
    // all at once. That way we can apply all css transforms in one line and
    // and maybe multiple audio effects at once on the same sample.
    applyAudioProp(audioObj, prop, relativeScrollTop, value);
  });
};

export const manageSceneAudio = (scene: scene, sceneScrollTop) => {
  if (!scene.audio) return;
  // console.log('relativeScrollTop', relativeScrollTop, window.scrollY);
  scene.audio.forEach((audioObj) => {
    // Adjust scroll top to be relative to any start/stop values if availalble.
    const relativeScrollTop =
      audioObj.start && typeof audioObj.start === 'number'
        ? sceneScrollTop - audioObj.start
        : sceneScrollTop;
    // console.log('relativeScrollTop', relativeScrollTop, sceneScrollTop);

    applyAudioProps(audioObj, relativeScrollTop);
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
      console.log('INIT AUDIO');
      initAudioSample(audioObj);
    }
    if (
      audioObj.sample &&
      audioObj.sample.state === 'ready' &&
      navigator.userActivation.hasBeenActive // checks if user has ever interacted
      // https://developer.mozilla.org/en-US/docs/Web/API/UserActivation
    ) {
      console.log('play');

      // NOOOOPE NEED TO STOP MAKING A ZILLION BUFFERSOURCENODES!!!!
      const sample = playSample(
        audioObj.sample.context,
        audioObj.sample.buffer,
        0
      );

      console.log('DO ONCE!!!!');
      audioObj.sample.state = 'playing';
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
