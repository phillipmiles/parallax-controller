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

  const gainNode = audioContext.createGain();
  sampleSource.connect(gainNode);
  gainNode.connect(audioContext.destination);
  gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);

  // sampleSource.connect(audioContext.destination);

  sampleSource.start();
  return sampleSource;
};

// SOURCES ARRAY~!!!!!!

// https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Advanced_techniques#dial_up_%E2%80%94_loading_a_sound_sample

const initAudioSample = async (audioObj: audio) => {
  const audioCtx = new AudioContext();
  audioCtx.onstatechange = () => {
    console.log('state2', audioCtx.state);
  };
  audioObj.sample = {
    state: 'loading',
    context: null,
    buffer: null,
    sources: [],
  };
  const audioBuffer = await getAudioFile(audioCtx, audioObj.src);
  audioObj.sample = {
    state: 'ready',
    context: audioCtx,
    buffer: audioBuffer,
    sources: [],
  };
};

const applyAudioProp = (audioObj, prop, relativeScrollTop, value) => {
  console.log('do somethin');
};

const applyAudioProps = (audioObj, relativeScrollTop) => {
  audioObj.props.forEach((prop) => {
    const value = getCurrentPropValue(prop, relativeScrollTop);

    // if (prop.type === 'gain') {
    //   const gainNode = audioObj.context.createGain();

    //   gainNode.connect(audioObj.context.destination);

    //   gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    // }

    // TODO::: Maybe instead collect an array of the calculated values to
    // be applied to the audio object or anmation selector and apply them
    // all at once. That way we can apply all css transforms in one line and
    // and maybe multiple audio effects at once on the same sample.
    applyAudioProp(audioObj, prop, relativeScrollTop, value);
  });
};

export const canTriggerAudio = (
  currentPos,
  prevPos,
  triggerPos,
  triggerDirection
) => {
  if (
    prevPos < triggerPos &&
    currentPos >= triggerPos &&
    triggerDirection !== 'backwards'
  ) {
    console.log('TRIGGER FORWARDS');
    return true;
  } else if (
    prevPos > triggerPos &&
    currentPos <= triggerPos &&
    triggerDirection !== 'forwards'
  ) {
    console.log('TRIGGER BACKWARDS');
    return true;
  }
  return false;
};

export const manageSceneAudio = (
  scene: scene,
  sceneScrollTop,
  prevScrollTop
) => {
  if (!scene.audio) return;
  // console.log('relativeScrollTop', relativeScrollTop, window.scrollY);
  scene.audio.forEach((audioObj) => {
    // Adjust scroll top to be relative to any start/stop values if availalble.
    const relativeScrollTop =
      audioObj.start && typeof audioObj.start === 'number'
        ? sceneScrollTop - audioObj.start
        : sceneScrollTop;

    const prevRelativeScrollTop =
      audioObj.start && typeof audioObj.start === 'number'
        ? prevScrollTop[0] - audioObj.start
        : prevScrollTop[0];

    if (audioObj.props) {
      applyAudioProps(audioObj, relativeScrollTop);
    }

    if (
      canTriggerAudio(
        relativeScrollTop,
        prevRelativeScrollTop,
        audioObj.trigger,
        audioObj.triggerDirection
      )
    ) {
      console.log('TRIGGER', audioObj);
      if (
        audioObj.sample &&
        // audioObj.sample.state === 'ready' &&
        navigator.userActivation.hasBeenActive // checks if user has ever interacted
        // https://developer.mozilla.org/en-US/docs/Web/API/UserActivation
      ) {
        // console.log('play', audioObj.sample.sources.length);

        if (
          !audioObj.maxPlaying ||
          audioObj.maxPlaying > audioObj.sample.sources.length
        ) {
          const source = playSample(
            audioObj.sample.context,
            audioObj.sample.buffer,
            0
          );

          source.addEventListener('ended', (event) => {
            const sourceIndex = audioObj.sample.sources.findIndex(
              (source) => source === event.target
            );
            audioObj.sample.sources.splice(sourceIndex, 1);
          });
          // Store source so we can keep track of how many we're playing.
          audioObj.sample.sources.unshift(source);
        }
      }
    }

    // console.log(sceneScrollTop, relativeScrollTop, audioObj.trigger);

    // TODO Handle a check here to see if we should start loading the audio on
    // page load or lazy load it later???
    // if (!audioObj.sample) {
    //   console.log('INIT AUDIO');
    //   initAudioSample(audioObj);
    // }
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

export const initSceneAudio = (scene) => {
  if (scene.audio) {
    scene.audio.forEach((audioObj) => {
      initAudioSample(audioObj);
    });
  }
};

export const initPageAudio = (scenes) => {
  scenes.forEach((scene) => initSceneAudio(scene));
};
