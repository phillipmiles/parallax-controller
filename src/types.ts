export interface animationProp {
  positions: string[];
  keys: string[];
}

export interface animation {
  selector: string;
  translateY?: string | animationProp;
  translateX?: string | animationProp;
  opacity?: string | animationProp;
  scale?: string | animationProp;
}

export interface prop {
  keys: string[];
}

export interface audio {
  src: string;
  sample: {
    state: string;
    context: AudioContext;
    buffer: AudioBuffer;
  };
  props: prop[];
  start?: string | number;
  stop?: string | number;
}

export interface scene {
  wrapper: string;
  duration: string;
  animations: animation[];
  audio: audio[];
}
