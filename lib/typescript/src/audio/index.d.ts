export type PcmLiveStreamOptions = {
    sampleRate?: number;
    channelCount?: number;
    bufferSizeFrames?: number;
};
export type PcmLiveStreamHandle = {
    start: () => Promise<void>;
    stop: () => Promise<void>;
    onData: (callback: (samples: Float32Array, sampleRate: number) => void) => () => void;
    onError: (callback: (message: string) => void) => () => void;
};
/**
 * Create a PCM live stream from the device microphone. Native capture and resampling ensure
 * PCM is always delivered at the requested sampleRate (e.g. 16000 for STT). The app must have
 * RECORD_AUDIO (Android) and NSMicrophoneUsageDescription (iOS) and grant permission before start().
 */
export declare function createPcmLiveStream(options?: PcmLiveStreamOptions): PcmLiveStreamHandle;
/**
 * Convert any supported audio file to a requested format (e.g. "mp3", "flac", "wav", "m4a", "opus", "webm").
 * On Android this requires FFmpeg prebuilts. WAV output is always 16 kHz mono (sherpa-onnx).
 * For MP3, optional outputSampleRateHz: 32000, 44100, or 48000; 0/undefined = 44100.
 * For Opus, optional outputSampleRateHz: 8000, 12000, 16000, 24000, or 48000.
 * For M4A/AAC, standard bitrates apply.
 * Resolves on success, rejects with an error message on failure.
 */
export declare function convertAudioToFormat(inputPath: string, outputPath: string, format: string, outputSampleRateHz?: number): Promise<void>;
/**
 * Convert any supported audio file to WAV 16 kHz mono 16-bit PCM.
 * On Android this requires FFmpeg prebuilts. Resolves on success, rejects with an error message on failure.
 */
export declare function convertAudioToWav16k(inputPath: string, outputPath: string): Promise<void>;
export type DecodedAudioFloatSamples = {
    samples: number[];
    sampleRate: number;
};
/**
 * Decode a supported audio file to mono float PCM in [-1, 1] plus sample rate.
 * Same decode coverage as {@link convertAudioToFormat} (FFmpeg-backed on Android when not WAV).
 * @param targetSampleRateHz - Resample to this rate when > 0; use native decoded rate when 0 or omitted.
 */
export declare function decodeAudioFileToFloatSamples(inputPath: string, targetSampleRateHz?: number): Promise<DecodedAudioFloatSamples>;
//# sourceMappingURL=index.d.ts.map