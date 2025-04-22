declare module 'recordrtc' {
  interface RecordRTCOptions {
    type?: 'video' | 'audio' | 'gif' | 'canvas';
    mimeType?: string;
    recorderType?: any;
    numberOfAudioChannels?: number;
    sampleRate?: number;
    desiredSampRate?: number;
    timeSlice?: number;
    disableLogs?: boolean;
    bufferSize?: number;
    frameRate?: number;
    workerPath?: string;
  }

  class RecordRTC {
    constructor(stream: MediaStream, options?: RecordRTCOptions);
    startRecording(): void;
    stopRecording(callback?: (this: RecordRTC) => void): void;
    getBlob(): Promise<Blob>;
    toURL(): string;
    blob: Blob;
    reset(): void;
    destroy(): void;
  }

  namespace RecordRTC {
    const StereoAudioRecorder: any;
    const MediaStreamRecorder: any;
    const WhammyRecorder: any;
    const GifRecorder: any;
    const CanvasRecorder: any;
  }

  export = RecordRTC;
}