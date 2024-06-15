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

  const gainNode2 = audioContext.createGain();
  gainNode.connect(gainNode2);
  gainNode2.connect(audioContext.destination);
  gainNode2.gain.setValueAtTime(1, audioContext.currentTime);

  // sampleSource.connect(audioContext.destination);

  sampleSource.start();
  return sampleSource;
};

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

const initAudioSource = (audioContext, audioBuffer, options) => {
  const sampleSource = new AudioBufferSourceNode(audioContext, {
    buffer: audioBuffer,
    loop: options.loop ? options.loop : false,
    playbackRate: 1, // Speed setting
  });
  return sampleSource;
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

export const triggeredByDirection = (
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
    return true;
  } else if (
    prevPos > triggerPos &&
    currentPos <= triggerPos &&
    triggerDirection !== 'forwards'
  ) {
    return true;
  }
  return false;
};

export const initGrainNode = (audioObj, source, value) => {
  const gainNode = audioObj.sample.context.createGain();
  source.effectNodes[source.effectNodes.length - 1].connect(gainNode);

  gainNode.gain.setValueAtTime(value, audioObj.sample.context.currentTime);

  source.effectNodes.push(gainNode);
};

export const initAudioProps = (audioObj, source, relativeProgress) => {
  audioObj.props.forEach((prop) => {
    const value = getCurrentPropValue(prop, relativeProgress);
    console.log('VALUE!!!', value);
    if (prop.type === 'gain') {
      initGrainNode(audioObj, source, value);
    }

    // TODO::: Maybe instead collect an array of the calculated values to
    // be applied to the audio object or anmation selector and apply them
    // all at once. That way we can apply all css transforms in one line and
    // and maybe multiple audio effects at once on the same sample.
    // applyAudioProp(audioObj, prop, relativeProgress, value);
  });
};

export const triggerAudioSource = (audioObj, relativeProgress) => {
  const sourceNode = initAudioSource(
    audioObj.sample.context,
    audioObj.sample.buffer,
    {
      loop: false,
    }
  );

  const source = {
    sourceNode: sourceNode,
    effectNodes: [],
  };

  // Create volume node
  // if (audioObj.volume) {
  const volumeNode = audioObj.sample.context.createGain();
  sourceNode.connect(volumeNode);

  volumeNode.gain.setValueAtTime(
    audioObj.volume >= 0 ? audioObj.volume : 1,
    audioObj.sample.context.currentTime
  );
  source.effectNodes.push(volumeNode);
  // }

  initAudioProps(audioObj, source, relativeProgress);

  source.effectNodes[source.effectNodes.length - 1].connect(
    audioObj.sample.context.destination
  );
  sourceNode.start();

  // Remove reference to source once its finished playing
  sourceNode.addEventListener('ended', (event) => {
    const sourceIndex = audioObj.sample.sources.findIndex(
      (item) => item.sourceNode === event.target
    );
    audioObj.sample.sources.splice(sourceIndex, 1);
  });
  // Store source so we can keep track of how many we're playing.
  audioObj.sample.sources.unshift(source);
};

export const manageSceneAudio = (
  scene: scene,
  sceneScrollTop,
  prevScrollTop
) => {
  if (!scene.audio) return;

  // checks if user has ever interacted
  // https://developer.mozilla.org/en-US/docs/Web/API/UserActivation
  if (!navigator.userActivation.hasBeenActive) return;

  // console.log('relativeScrollTop', relativeScrollTop, window.scrollY);
  scene.audio.forEach((audioObj) => {
    // Adjust scroll top to be relative to any start/stop values if availalble.
    const relativeProgress =
      audioObj.start && typeof audioObj.start === 'number'
        ? sceneScrollTop - audioObj.start
        : sceneScrollTop;

    const prevRelativeProgress =
      audioObj.start && typeof audioObj.start === 'number'
        ? prevScrollTop[0] - audioObj.start
        : prevScrollTop[0];

    if (audioObj.props) {
      applyAudioProps(audioObj, relativeProgress);
    }

    // TODO: If range is supplied and a boolean is true make sounds stop
    // that have left range.

    if (
      triggeredByDirection(
        relativeProgress,
        prevRelativeProgress,
        audioObj.trigger,
        audioObj.triggerDirection
      )
    ) {
      if (audioObj.sample) {
        if (
          !audioObj.maxPlaying ||
          audioObj.maxPlaying > audioObj.sample.sources.length
        ) {
          triggerAudioSource(audioObj, relativeProgress);
        }
      } else {
        console.warn('Attempted to trigger audio source but no sample found.');
      }
    }

    // TODO Handle a check here to see if we should start loading the audio on
    // page load or lazy load it later???
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
