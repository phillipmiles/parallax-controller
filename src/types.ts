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
    // state: string;
    context: AudioContext;
    buffer: AudioBuffer;
    sources: AudioBufferSourceNode[];
  };
  props: prop[];
  trigger?: string | number | string[] | number[]; // Position in scene that will that once passed will generate an instance
  triggerDirection?: 'forwards' | 'backwards' | 'both';
  maxPlaying?: number; // Max instances that this audio sample can have generated at one time
  start?: string | number;
  stop?: string | number;
}

export interface scene {
  wrapper: string;
  duration: string;
  animations: animation[];
  audio: audio[];
}
