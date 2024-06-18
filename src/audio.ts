import { getCurrentPropValue } from './property';
import { audio, scene } from './types';

const getAudioFile = async (audioContext, filepath) => {
  const response = await fetch(filepath);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  return audioBuffer;
};

// https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Advanced_techniques#dial_up_%E2%80%94_loading_a_sound_sample
const initAudioSample = async (audioObj: audio) => {
  const audioCtx = new AudioContext();

  audioObj.sample = {
    context: audioCtx,
    buffer: null,
    sources: [],
  };
  const audioBuffer = await getAudioFile(audioCtx, audioObj.src);
  audioObj.sample.buffer = audioBuffer;
};

// https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode
const initAudioSourceNode = (audioContext, audioBuffer, options) => {
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
    audioObj.sample.sources.forEach((source) => {
      const propEffect = source.effectNodes.find(
        (effect) => effect.id === prop.id
      );

      if (propEffect) {
        if (prop.type === 'gain') {
          propEffect.node.gain.setValueAtTime(
            value,
            audioObj.sample.context.currentTime
          );
        }
      }

      // if (prop.type === 'gain') {
      //   const gainNode = audioObj.context.createGain();

      //   gainNode.connect(audioObj.context.destination);

      //   gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      // }

      // TODO::: Maybe instead collect an array of the calculated values to
      // be applied to the audio object or anmation selector and apply them
      // all at once. That way we can apply all css transforms in one line and
      // and maybe multiple audio effects at once on the same sample.
      // applyAudioProp(audioObj, prop, relativeScrollTop, value);
    });
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

export const initGainNode = (audioContext, value, nodeId) => {
  const gainNode = audioContext.createGain();
  gainNode.gain.setValueAtTime(value, audioContext.currentTime);
  return {
    id: nodeId,
    node: gainNode,
  };
};

export const initEffectNodes = (audioObj, relativeProgress) => {
  const effectNodes = [];

  // Create volume node
  if (audioObj.volume >= 0) {
    const volumeNode = initGainNode(
      audioObj.sample.context,
      audioObj.volume,
      'volume' // TODO NEED TO SEPERATE OUT BASE VOLUME FROM PROP NODES AND THERE IDS
    );
    effectNodes.push(volumeNode);
  }

  audioObj.props.forEach((prop, index) => {
    const value = getCurrentPropValue(prop, relativeProgress);

    if (prop.type === 'gain') {
      const gainNode = initGainNode(audioObj.sample.context, value, prop.id);
      effectNodes.push(gainNode);
      // TODO::: WILL NEED TO MARK OR ID EACH EFFECT NODE SO WE KNOW
      // WHICH ONES TO UPDATE WITH WHAT VALUES ON SCROLL EVENTS.
      // Should the ID be written in the script so we can link the props
      // to the effect nodes? Or do we assume only one type of each prop
      // can exist. One 'gain' prop for example.
    }
  });

  // Connect effect nodes together.
  effectNodes.forEach((effect, index) => {
    if (index < effectNodes.length - 1) {
      effect.node.connect(effectNodes[index + 1].node);
    }
  });

  return effectNodes;
};

const timeTillSchedule = (bpm, timeElapsed) => {
  const beatsPerSecond = bpm / 60;
  const secondsInBeat = 1 / beatsPerSecond;

  const time = timeElapsed;

  const progressThroughBeat = time % secondsInBeat;
  const nextBeatIn = secondsInBeat - progressThroughBeat;

  return nextBeatIn;
};

export const initAudioSource = (audioObj, relativeProgress) => {
  const sourceNode = initAudioSourceNode(
    audioObj.sample.context,
    audioObj.sample.buffer,
    {
      loop: audioObj.loop,
    }
  );

  const effectNodes = initEffectNodes(audioObj, relativeProgress);

  // Connect source node with first effects node and connect
  // last effects node with destination.
  sourceNode.connect(effectNodes[0].node);
  effectNodes[effectNodes.length - 1].node.connect(
    audioObj.sample.context.destination
  );

  const source = {
    sourceNode: sourceNode,
    effectNodes: effectNodes,
  };
  return source;
};

export const getNextSequenceTime = (scene, audioObj, timeElapsed) => {
  // console.log(scene);
  // const sequence = scene.audio.filter(
  //   (otherAudioObj) => otherAudioObj.sequenceGroup === audioObj.sequenceGroup
  // );

  const timeStarted = scene._sequences[audioObj.sequenceGroup]
    ? scene._sequences[audioObj.sequenceGroup]._timeStarted
    : 0;

  console.log('timeStarted', timeStarted);
  // const relativeTime = timeElapsed
  const nextBeatIn = timeTillSchedule(audioObj.bpm, timeElapsed - timeStarted);

  return nextBeatIn;
};

export const triggerAudioSource = (
  scene,
  audioObj,
  audioSource,
  timeElapsed,
  when = 0
) => {
  if (!scene._sequences[audioObj.sequenceGroup]) {
    scene._sequences[audioObj.sequenceGroup] = {
      _timeStarted: timeElapsed,
    };
  }
  audioObj._timeStarted = timeElapsed;

  if (when) {
    audioSource.sourceNode.start(audioObj.sample.context.currentTime + when);
  } else {
    // Play source
    audioSource.sourceNode.start();
  }
  // Remove reference to source once its finished playing
  audioSource.sourceNode.addEventListener('ended', (event) => {
    const sourceIndex = audioObj.sample.sources.findIndex(
      (item) => item.sourceNode === event.target
    );
    audioObj.sample.sources.splice(sourceIndex, 1);
  });
};

const scheduler = () => {
  // let timerID;
  // // While there are notes that will need to play before the next interval,
  // // schedule them and advance the pointer.
  // while (nextNoteTime < audioCtx.currentTime + scheduleAheadTime) {
  //   scheduleNote(currentNote, nextNoteTime);
  //   nextNote();
  // }
  // timerID = setTimeout(scheduler, lookahead);
};

export const checkIfTriggeredStop = (triggerStop, currentPos, prevPos) => {
  if (!triggerStop) return;

  if (typeof triggerStop === 'number') {
    return triggeredByDirection(currentPos, prevPos, triggerStop, 'both');
  } else {
    return (
      triggeredByDirection(currentPos, prevPos, triggerStop[0], 'backwards') ||
      triggeredByDirection(currentPos, prevPos, triggerStop[1], 'forwards')
    );
  }
};

export const checkIfTriggered = (audioObj, currentPos, prevPos) => {
  if (typeof audioObj.triggerStart === 'string') {
    return triggeredByDirection(
      currentPos,
      prevPos,
      audioObj.triggerStart,
      audioObj.triggerDirection
    );
  } else {
    if (audioObj.triggerDirection === 'forwards') {
      return triggeredByDirection(
        currentPos,
        prevPos,
        audioObj.triggerStart[0],
        'forwards'
      );
    } else if (audioObj.triggerDirection === 'backwards') {
      return triggeredByDirection(
        currentPos,
        prevPos,
        audioObj.triggerStart[1],
        'backwards'
      );
    } else {
      return (
        triggeredByDirection(
          currentPos,
          prevPos,
          audioObj.triggerStart[0],
          'forwards'
        ) ||
        triggeredByDirection(
          currentPos,
          prevPos,
          audioObj.triggerStart[1],
          'backwards'
        )
      );
    }
  }
};

export const stopAudioSamples = (audioObj, timeElapsed, when) => {
  audioObj.sample.sources.forEach((source) => {
    if (when) {
      source.sourceNode.stop(audioObj.sample.context.currentTime + when);
    } else {
      // Play source
      source.sourceNode.stop();
    }
  });
};

export const updateAudio = (
  scene,
  audioObj,
  sceneScrollTop,
  prevScrollTop,
  timeElapsed: number
) => {
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
    checkIfTriggeredStop(
      audioObj.triggerStop,
      relativeProgress,
      prevRelativeProgress
    )
  ) {
    console.log('STOP', audioObj.src);
    let when = 0;
    if (audioObj.sequenceGroup) {
      // Fetch timeToStart
      when = getNextSequenceTime(scene, audioObj, timeElapsed);
    }

    stopAudioSamples(audioObj, timeElapsed, when);
  }
  if (checkIfTriggered(audioObj, relativeProgress, prevRelativeProgress)) {
    if (checkCanTriggerAudio(audioObj)) {
      const audioSource = initAudioSource(audioObj, relativeProgress);
      // Store source so we can keep track of how many we're playing.
      audioObj.sample.sources.unshift(audioSource);

      let when = 0;
      if (audioObj.sequenceGroup) {
        // Fetch timeToStart
        console.log('START');
        when = getNextSequenceTime(scene, audioObj, timeElapsed);
      }

      triggerAudioSource(scene, audioObj, audioSource, timeElapsed, when);
    }
  }

  // TODO Handle a check here to see if we should start loading the audio on
  // page load or lazy load it later???
};

const checkCanTriggerAudio = (audioObj) => {
  if (!audioObj.sample) return false;
  if (
    audioObj.maxPlaying &&
    audioObj.sample.sources.length >= audioObj.maxPlaying
  )
    return false;

  return true;
};

export const manageSceneAudio = (
  scene: scene,
  sceneScrollTop,
  prevScrollTop,
  timeElapsed: number
) => {
  if (!scene.audio) return;

  // checks if user has ever interacted
  // https://developer.mozilla.org/en-US/docs/Web/API/UserActivation
  if (!navigator.userActivation.hasBeenActive) return;

  // console.log('relativeScrollTop', relativeScrollTop, window.scrollY);
  scene.audio.forEach((audioObj) => {
    updateAudio(scene, audioObj, sceneScrollTop, prevScrollTop, timeElapsed);
  });
};

export const initSceneAudio = (scene, sceneScrollTop, getTimeCallback) => {
  if (scene.audio) {
    scene.audio.forEach(async (audioObj) => {
      await initAudioSample(audioObj);

      if (audioObj.triggerStart instanceof Array) {
        const relativeProgress =
          audioObj.start && typeof audioObj.start === 'number'
            ? sceneScrollTop - audioObj.start
            : sceneScrollTop;

        // Check if we currently sit within trigger range
        if (
          audioObj.triggerStart[0] <= relativeProgress &&
          audioObj.triggerStart[1] >= relativeProgress
        ) {
          if (checkCanTriggerAudio(audioObj)) {
            const audioSource = initAudioSource(audioObj, relativeProgress);
            // Store source so we can keep track of how many we're playing.
            audioObj.sample.sources.unshift(audioSource);
            const elapsedTime = getTimeCallback();

            triggerAudioSource(scene, audioObj, audioSource, elapsedTime, 0);
          }
        }
      }
    });
  }
};

export const initPageAudio = (scenes, sceneScrollTop, getTimeCallback) => {
  scenes.forEach((scene) =>
    initSceneAudio(scene, sceneScrollTop, getTimeCallback)
  );
};
