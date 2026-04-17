"use strict";

import { DeviceEventEmitter } from 'react-native';
import SherpaOnnx from "../NativeSherpaOnnx.js";
import { resolveModelPath } from "../utils.js";
let streamingTtsInstanceCounter = 0;
let ttsRequestIdCounter = 0;

/**
 * Flatten model-specific options for the given model type to native init params.
 */
function flattenTtsModelOptionsForNative(modelType, modelOptions) {
  if (!modelOptions || !modelType || modelType === 'auto' || modelType === 'zipvoice') return {
    noiseScale: undefined,
    noiseScaleW: undefined,
    lengthScale: undefined
  };
  const block = modelType === 'vits' ? modelOptions.vits : modelType === 'matcha' ? modelOptions.matcha : modelType === 'kokoro' ? modelOptions.kokoro : modelType === 'kitten' ? modelOptions.kitten : modelType === 'pocket' ? modelOptions.pocket : modelType === 'supertonic' ? modelOptions.supertonic : undefined;
  if (!block) return {
    noiseScale: undefined,
    noiseScaleW: undefined,
    lengthScale: undefined
  };
  const n = block;
  return {
    noiseScale: n.noiseScale !== undefined && typeof n.noiseScale === 'number' ? n.noiseScale : undefined,
    noiseScaleW: n.noiseScaleW !== undefined && typeof n.noiseScaleW === 'number' ? n.noiseScaleW : undefined,
    lengthScale: n.lengthScale !== undefined && typeof n.lengthScale === 'number' ? n.lengthScale : undefined
  };
}
function toNativeTtsOptions(options) {
  if (options == null) return {};
  const out = {};
  if (options.sid !== undefined) out.sid = options.sid;
  if (options.speed !== undefined) out.speed = options.speed;
  if (options.silenceScale !== undefined) out.silenceScale = options.silenceScale;
  if (options.referenceAudio != null) {
    const sr = options.referenceAudio.sampleRate;
    if (typeof __DEV__ !== 'undefined' && __DEV__ && (!Number.isFinite(sr) || sr <= 0)) {
      console.warn('[react-native-sherpa-onnx] TTS referenceAudio.sampleRate must be > 0 for voice cloning (Zipvoice/Pocket).');
    }
    out.referenceAudio = options.referenceAudio.samples;
    out.referenceSampleRate = options.referenceAudio.sampleRate;
  }
  if (options.referenceText !== undefined) out.referenceText = options.referenceText;
  if (options.numSteps !== undefined) out.numSteps = options.numSteps;
  if (options.extra != null && Object.keys(options.extra).length > 0) out.extra = options.extra;
  return out;
}

/**
 * Create a streaming TTS engine instance. Use for incremental generation with
 * chunk callbacks and PCM playback. Call destroy() when done.
 *
 * @param options - TTS initialization options or model path configuration
 * @returns Promise resolving to a StreamingTtsEngine instance
 * @example
 * ```typescript
 * const tts = await createStreamingTTS({
 *   modelPath: { type: 'asset', path: 'models/vits-piper-en' },
 *   modelType: 'vits',
 * });
 * const controller = await tts.generateSpeechStream('Hello', undefined, {
 *   onChunk: (chunk) => playPcm(chunk.samples, chunk.sampleRate),
 *   onEnd: () => {},
 * });
 * await tts.destroy();
 * ```
 */
export async function createStreamingTTS(options) {
  const instanceId = `streaming_tts_${++streamingTtsInstanceCounter}`;
  let modelPath;
  let modelType;
  let provider;
  let numThreads;
  let debug;
  let modelOptions;
  let ruleFsts;
  let ruleFars;
  let maxNumSentences;
  let silenceScale;
  if ('modelPath' in options) {
    modelPath = options.modelPath;
    modelType = options.modelType;
    provider = options.provider;
    numThreads = options.numThreads;
    debug = options.debug;
    modelOptions = options.modelOptions;
    ruleFsts = options.ruleFsts;
    ruleFars = options.ruleFars;
    maxNumSentences = options.maxNumSentences;
    silenceScale = options.silenceScale;
  } else {
    modelPath = options;
    modelType = undefined;
    provider = undefined;
    numThreads = undefined;
    debug = undefined;
    modelOptions = undefined;
    ruleFsts = undefined;
    ruleFars = undefined;
    maxNumSentences = undefined;
    silenceScale = undefined;
  }
  const flat = flattenTtsModelOptionsForNative(modelType, modelOptions);
  const resolvedPath = await resolveModelPath(modelPath);
  const result = await SherpaOnnx.initializeTts(instanceId, resolvedPath, modelType ?? 'auto', numThreads ?? 2, debug ?? false, flat.noiseScale, flat.noiseScaleW, flat.lengthScale, ruleFsts, ruleFars, maxNumSentences, silenceScale, provider);
  if (!result.success) {
    const nativeError = typeof result.error === 'string' ? result.error.trim() : '';
    const detected = JSON.stringify(result.detectedModels ?? []);
    throw new Error(nativeError.length > 0 ? `Streaming TTS initialization failed: ${nativeError}` : `Streaming TTS initialization failed: ${detected}`);
  }
  let destroyed = false;
  const guard = () => {
    if (destroyed) {
      throw new Error(`Streaming TTS instance ${instanceId} has been destroyed; cannot call methods on it.`);
    }
  };
  const engine = {
    get instanceId() {
      return instanceId;
    },
    async generateSpeechStream(text, opts, handlers) {
      guard();
      const requestId = `tts_req_${++ttsRequestIdCounter}`;
      const subscriptions = [];
      let unsubscribed = false;
      const unsubscribe = () => {
        if (unsubscribed) return;
        unsubscribed = true;
        subscriptions.forEach(sub => sub.remove());
      };
      const matchesRequest = e => (e.instanceId == null || e.instanceId === instanceId) && (e.requestId == null || e.requestId === requestId);
      subscriptions.push(DeviceEventEmitter.addListener('ttsStreamChunk', event => {
        const e = event;
        if (!matchesRequest(e)) {
          return;
        }
        handlers.onChunk?.(e);
      }), DeviceEventEmitter.addListener('ttsStreamEnd', event => {
        const e = event;
        if (!matchesRequest(e)) {
          return;
        }
        try {
          handlers.onEnd?.(e);
        } finally {
          unsubscribe();
        }
      }), DeviceEventEmitter.addListener('ttsStreamError', event => {
        const e = event;
        if (!matchesRequest(e)) {
          return;
        }
        try {
          handlers.onError?.(e);
        } finally {
          unsubscribe();
        }
      }));

      // Yield so the bridge can register listeners before native emits (avoids "no listeners" / "already in progress")
      await new Promise(resolve => {
        if (typeof setImmediate === 'function') {
          setImmediate(resolve);
        } else {
          setTimeout(resolve, 0);
        }
      });
      try {
        await SherpaOnnx.generateTtsStream(instanceId, requestId, text, toNativeTtsOptions(opts));
      } catch (error) {
        unsubscribe();
        throw error;
      }
      const controller = {
        async cancel() {
          guard();
          await SherpaOnnx.cancelTtsStream(instanceId);
          unsubscribe();
        },
        unsubscribe
      };
      return controller;
    },
    async cancelSpeechStream() {
      guard();
      return SherpaOnnx.cancelTtsStream(instanceId);
    },
    async startPcmPlayer(sampleRate, channels) {
      guard();
      return SherpaOnnx.startTtsPcmPlayer(instanceId, sampleRate, channels);
    },
    async writePcmChunk(samples) {
      guard();
      return SherpaOnnx.writeTtsPcmChunk(instanceId, samples);
    },
    async stopPcmPlayer() {
      guard();
      return SherpaOnnx.stopTtsPcmPlayer(instanceId);
    },
    async getModelInfo() {
      guard();
      const [sampleRate, numSpeakers] = await Promise.all([SherpaOnnx.getTtsSampleRate(instanceId), SherpaOnnx.getTtsNumSpeakers(instanceId)]);
      return {
        sampleRate,
        numSpeakers
      };
    },
    async getSampleRate() {
      guard();
      return SherpaOnnx.getTtsSampleRate(instanceId);
    },
    async getNumSpeakers() {
      guard();
      return SherpaOnnx.getTtsNumSpeakers(instanceId);
    },
    async destroy() {
      if (destroyed) return;
      destroyed = true;
      await SherpaOnnx.unloadTts(instanceId);
    }
  };
  return engine;
}
//# sourceMappingURL=streaming.js.map