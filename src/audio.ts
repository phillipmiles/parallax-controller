import { getCurrentPropValue } from './property';
import { audio, scene } from './types';

export const getAudioFile = async (audioContext, filepath) => {
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

const timeTillSchedule = (
  bpm,
  nextScheduleInterval,
  timeElapsed,
  delay = 0,
  offset = 0
) => {
  const beatsPerSecond = bpm / 60;
  const secondsInBeat = 1 / beatsPerSecond;

  const nextScheduleIntervalLength = secondsInBeat * nextScheduleInterval;
  const delayIntervalLength = secondsInBeat * delay;

  //
  const offsetIntervalLength = secondsInBeat * offset;
  //
  const time = timeElapsed - delayIntervalLength + offsetIntervalLength;

  const progressThroughBeat = time % nextScheduleIntervalLength;

  const nextBeatIn = nextScheduleIntervalLength - progressThroughBeat;

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

const getTimeElapsed = (time1, time2) => {
  return (time2.getTime() - time1.getTime()) / 1000;
};

export const getNextSequenceTime = (
  scene,
  audioObj,
  timeElapsed,
  sequenceInterval,
  sequenceDelay = 0
) => {
  const elapsed =
    audioObj.sample.context.currentTime -
    scene._sequences[audioObj.sequenceGroup].queue[0].when;

  const offset = scene._sequences[audioObj.sequenceGroup].offset;

  const nextBeatIn = timeTillSchedule(
    audioObj.bpm,
    sequenceInterval,
    // timeElapsed - timeStarted,
    elapsed,
    sequenceDelay,
    offset
  );

  return nextBeatIn;
};

export const triggerAudioSource = (
  scene,
  audioObj,
  audioSource,
  timeElapsed,
  when = 0,
  getTime
) => {
  audioSource.state = 'playing';

  // Play source
  if (when) {
    console.log('DO I USE THIS');
    audioSource.sourceNode.start(audioObj.sample.context.currentTime + when);
  } else {
    console.log(
      `QUEUE ${
        scene._sequences[audioObj.sequenceGroup].queue.length
      } - Starting  ${
        scene._sequences[audioObj.sequenceGroup].queue[0].audio.src
      }`,
      scene._sequences[audioObj.sequenceGroup].queue
    );
    audioSource.sourceNode.start();
  }
  // Remove reference to source once its finished playing
  audioSource.sourceNode.addEventListener('ended', (event) => {
    // Cleanup all sourceNodes
    const sourceIndex = audioObj.sample.sources.findIndex(
      (item) => item.sourceNode === event.target
    );
    audioObj.sample.sources.splice(sourceIndex, 1);

    if (audioObj.sequenceGroup) {
      // If ending track has a sequence delay, save it for the next track for
      // some reason. Otherwise reset to 0. ??? I dunno but it works lol
      if (audioObj.sequenceDelay) {
        scene._sequences[audioObj.sequenceGroup].offset =
          audioObj.sequenceDelay;
      } else {
        scene._sequences[audioObj.sequenceGroup].offset = 0;
      }
      const queue = scene._sequences[audioObj.sequenceGroup].queue;
      // console.log(
      //   'REMOVED',
      //   queue[0].audio.sequenceDelay,
      //   audioObj.sequenceDelay
      // );

      queue.shift();

      if (queue.length > 0) {
        const nextInQueue = queue[0];

        console.log('INIT NEW PLAY!!!', queue);
        triggerAudioSource(
          scene,
          nextInQueue.audio,
          nextInQueue.audio.sample.sources[0], // caution hardcoding first source may have eerors with repeats
          0, // nextInQueue.when,
          0,
          getTime
        );
      }
    }
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

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// TODO:::: Maybe do need to clea scheduled stops rather
// than letting it end and creating a new audio source cause it causes loops
// to restart unecessarily when it could just continue with the current loop
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

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
  // TODO:: Need to clear scheduled stop if we've scrolled back into same zone
  // Maybe store a state saying this audioObj is scheduled to end and then
  // on trigger functions looks for that and if its there clear schedule.

  // TODO:: Also need to save current schedule interval in the _schedule prop
  // to use as reference for when to trigger next song. Um also somehow need
  // to access the interval for the trigger song to use in this function
  // in order to schedule stop...
  audioObj.sample.sources.forEach((source) => {
    source.state = 'expired';
    if (when) {
      source.sourceNode.stop(audioObj.sample.context.currentTime + when);
    } else {
      // Stop source
      source.sourceNode.stop();
    }
  });
};

export const updateAudio = (
  scene,
  audioObj,
  sceneScrollTop,
  prevScrollTop,
  timeElapsed: number,
  getTime
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

  if (checkIfTriggered(audioObj, relativeProgress, prevRelativeProgress)) {
    if (checkCanTriggerAudio(audioObj)) {
      console.log('START', audioObj.src);

      let when = 0;
      const queue = scene._sequences[audioObj.sequenceGroup].queue;

      if (audioObj.sequenceGroup) {
        if (queue.length === 0) {
          const audioSource = initAudioSource(audioObj, relativeProgress);

          // Store source so we can keep track of how many we're playing.
          audioObj.sample.sources.unshift(audioSource);
          const elapsedTime = getTime();

          addAudioToQueue(audioObj, queue);

          triggerAudioSource(
            scene,
            audioObj,
            audioSource,
            elapsedTime,
            0,
            getTime
          );
        } else {
          const sequenceGroup = scene._sequences[audioObj.sequenceGroup];

          if (queue[0] && queue[0].audio === audioObj) {
            queue[0].audio.sample.sources.forEach((source) => {
              source.sourceNode.stop(
                audioObj.sample.context.currentTime + 100000
              );
            });
            clearQueue(queue);
          }

          if (queue[0] && queue[0].audio !== audioObj) {
            console.log('HAVE OLD???', queue[0].audio.sequenceDelay);
            const audioSource = initAudioSource(audioObj, relativeProgress);

            // Store source so we can keep track of how many we're playing.
            audioObj.sample.sources.unshift(audioSource);
            const elapsedTime = getTime();
            when = getNextSequenceTime(
              scene,
              audioObj,
              elapsedTime,
              queue[0].audio.sequenceInterval,
              audioObj.sequenceDelay
            );

            if (scene._sequences[audioObj.sequenceGroup].queue.length >= 2) {
              clearQueue(queue);
            }
            addAudioToQueue(
              audioObj,
              scene._sequences[audioObj.sequenceGroup].queue,
              when
            );

            // If we want to start an audio with a sequence delay then we
            // need to update the audio queued to stop with the new time.
            if (audioObj.sequenceDelay) {
              const delayedWhen = getNextSequenceTime(
                scene,
                sequenceGroup.queue[0].audio,
                timeElapsed,
                sequenceGroup.queue[0].audio.sequenceInterval,
                audioObj.sequenceDelay
              );
              stopAudioSamples(
                sequenceGroup.queue[0].audio,
                timeElapsed,
                delayedWhen
              );
            }
          }
        }
      } else {
        // triggerAudioSource(
        //   scene,
        //   audioObj,
        //   audioSource,
        //   timeElapsed,
        //   when,
        //   getTime
        // );
      }
    }
  } else if (
    checkIfTriggeredStop(
      audioObj.triggerStop,
      relativeProgress,
      prevRelativeProgress
    )
  ) {
    console.log('STOP', audioObj.src);

    let when = 0;
    // Stopping with getTime seems slightly more accurate
    const elapsedTime = getTime();

    if (!audioObj.sequenceGroup) {
      stopAudioSamples(audioObj, elapsedTime, when);
    } else {
      const queue = scene._sequences[audioObj.sequenceGroup].queue;

      if (audioObj.sequenceGroup && queue[0] && queue[0].audio === audioObj) {
        if (audioObj.sequenceDelay) {
          const delayedWhen = getNextSequenceTime(
            scene,
            audioObj,
            timeElapsed,
            audioObj.sequenceInterval,
            -audioObj.sequenceDelay
          );
          stopAudioSamples(audioObj, timeElapsed, delayedWhen);
        } else {
          const testDelay =
            audioObj.src === 'assets/music/count-in.mp3' ? 0 : 0; // I THHHHHINK WE NEED TO ADD TOGETHE ALL DELAYSS!?!?!?!

          when = getNextSequenceTime(
            scene,
            audioObj,
            timeElapsed,
            audioObj.sequenceInterval,
            testDelay // Add back the delay - need to store it for audio that begun with a delay
          );
          stopAudioSamples(audioObj, timeElapsed, when);
        }
      }
    }
  }

  // TODO Handle a check here to see if we should start loading the audio on
  // page load or lazy load it later???
};

const checkCanTriggerAudio = (audioObj) => {
  if (!audioObj.sample) return false;

  const playingSources = audioObj.sample.sources.filter(
    (source) => source.state === 'playing'
  );
  if (audioObj.maxPlaying && playingSources.length >= audioObj.maxPlaying)
    return false;

  return true;
};

export const manageSceneAudio = (
  scene: scene,
  sceneScrollTop,
  prevScrollTop,
  timeElapsed: number,
  getTime
) => {
  if (!scene.audio) return;

  // checks if user has ever interacted
  // https://developer.mozilla.org/en-US/docs/Web/API/UserActivation
  if (!navigator.userActivation.hasBeenActive) return;

  // console.log('relativeScrollTop', relativeScrollTop, window.scrollY);
  scene.audio.forEach((audioObj) => {
    updateAudio(
      scene,
      audioObj,
      sceneScrollTop,
      prevScrollTop,
      timeElapsed,
      getTime
    );
  });
};

export const clearQueue = (queue) => {
  // Destroy all created audio sample sources.
  queue.forEach((item, index) => {
    if (index === 0) return;

    item.audio.sample.sources = [];
  });

  queue.splice(1, queue.length);
};

export const removeFromQueue = (queue, index) => {
  queue[index].audio.sample.sources = [];
};

export const addAudioToQueue = (audioObj, queue, when = 0) => {
  console.log('QUEUE LENGTH', queue.length);
  // if(queue.length >= 2) {}
  if (queue.find((audio) => audio.audio === audioObj)) return;

  queue.push({
    audio: audioObj,
    when: audioObj.sample.context.currentTime + when,
  });
};

export const initSceneAudio = (scene, sceneScrollTop, getTimeCallback) => {
  if (scene.audio) {
    scene.audio.forEach(async (audioObj) => {
      await initAudioSample(audioObj);

      if (audioObj.sequenceGroup && !scene._sequences[audioObj.sequenceGroup]) {
        scene._sequences[audioObj.sequenceGroup] = {
          currentAudioObj: undefined,
          queue: [],
        };
      }

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

            if (audioObj.sequenceGroup) {
              addAudioToQueue(
                audioObj,
                scene._sequences[audioObj.sequenceGroup].queue
              );
            }

            triggerAudioSource(
              scene,
              audioObj,
              audioSource,
              elapsedTime,
              0,
              getTimeCallback
            );
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
