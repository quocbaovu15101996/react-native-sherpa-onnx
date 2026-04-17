"use strict";

import { Buffer } from 'buffer';
import { DeviceEventEmitter } from 'react-native';
import SherpaOnnx from "../NativeSherpaOnnx.js";

/**
 * Decode base64-encoded Int16 PCM to float array in [-1, 1].
 * Uses a preallocated Float32Array to avoid GC pressure on the live-mic hot path.
 */
function base64PcmToFloatArray(base64) {
  const bytes = Buffer.from(base64, 'base64');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const len = bytes.byteLength / 2;
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    out[i] = view.getInt16(i * 2, true) / 32768;
  }
  return out;
}
/**
 * Create a PCM live stream from the device microphone. Native capture and resampling ensure
 * PCM is always delivered at the requested sampleRate (e.g. 16000 for STT). The app must have
 * RECORD_AUDIO (Android) and NSMicrophoneUsageDescription (iOS) and grant permission before start().
 */
export function createPcmLiveStream(options) {
  const sampleRate = options?.sampleRate ?? 16000;
  const channelCount = options?.channelCount ?? 1;
  const bufferSizeFrames = options?.bufferSizeFrames ?? 0;
  return {
    start: () => SherpaOnnx.startPcmLiveStream({
      sampleRate,
      channelCount,
      bufferSizeFrames
    }),
    stop: () => SherpaOnnx.stopPcmLiveStream(),
    onData: callback => {
      const sub = DeviceEventEmitter.addListener('pcmLiveStreamData', event => {
        const base64 = event?.base64Pcm ?? '';
        const sr = event?.sampleRate ?? sampleRate;
        if (base64) {
          const samples = base64PcmToFloatArray(base64);
          callback(samples, sr);
        }
      });
      return () => sub.remove();
    },
    onError: callback => {
      const sub = DeviceEventEmitter.addListener('pcmLiveStreamError', event => {
        callback(event?.message ?? 'Unknown error');
      });
      return () => sub.remove();
    }
  };
}

/**
 * Convert any supported audio file to a requested format (e.g. "mp3", "flac", "wav", "m4a", "opus", "webm").
 * On Android this requires FFmpeg prebuilts. WAV output is always 16 kHz mono (sherpa-onnx).
 * For MP3, optional outputSampleRateHz: 32000, 44100, or 48000; 0/undefined = 44100.
 * For Opus, optional outputSampleRateHz: 8000, 12000, 16000, 24000, or 48000.
 * For M4A/AAC, standard bitrates apply.
 * Resolves on success, rejects with an error message on failure.
 */
export function convertAudioToFormat(inputPath, outputPath, format, outputSampleRateHz) {
  return SherpaOnnx.convertAudioToFormat(inputPath, outputPath, format, outputSampleRateHz ?? 0);
}

/**
 * Convert any supported audio file to WAV 16 kHz mono 16-bit PCM.
 * On Android this requires FFmpeg prebuilts. Resolves on success, rejects with an error message on failure.
 */
export function convertAudioToWav16k(inputPath, outputPath) {
  return SherpaOnnx.convertAudioToWav16k(inputPath, outputPath);
}
/**
 * Decode a supported audio file to mono float PCM in [-1, 1] plus sample rate.
 * Same decode coverage as {@link convertAudioToFormat} (FFmpeg-backed on Android when not WAV).
 * @param targetSampleRateHz - Resample to this rate when > 0; use native decoded rate when 0 or omitted.
 */
export function decodeAudioFileToFloatSamples(inputPath, targetSampleRateHz) {
  return SherpaOnnx.decodeAudioFileToFloatSamples(inputPath, targetSampleRateHz ?? 0);
}
//# sourceMappingURL=index.js.map