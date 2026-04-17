"use strict";

import SherpaOnnx from "../NativeSherpaOnnx.js";
import { resolveModelPath } from "../utils.js";
let ttsInstanceCounter = 0;

/**
 * Flatten model-specific options for the given model type to native init/update params.
 * When modelType is 'auto' or missing, returns undefined for all (native uses defaults).
 */
function flattenTtsModelOptionsForNative(modelType, modelOptions) {
  if (!modelOptions || !modelType || modelType === 'auto' || modelType === 'zipvoice' // Zipvoice does not use noise/length scale; native uses its own defaults
  ) return {
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
  const out = {
    noiseScale: undefined,
    noiseScaleW: undefined,
    lengthScale: undefined
  };
  const n = block;
  if (n.noiseScale !== undefined && typeof n.noiseScale === 'number') out.noiseScale = n.noiseScale;
  if (n.noiseScaleW !== undefined && typeof n.noiseScaleW === 'number') out.noiseScaleW = n.noiseScaleW;
  if (n.lengthScale !== undefined && typeof n.lengthScale === 'number') out.lengthScale = n.lengthScale;
  return out;
}

/**
 * Detect TTS model type and structure without initializing the engine.
 * Uses the same native file-based detection as createTTS. Stateless; no instance required.
 * For Kokoro/Kitten multi-language models, the result includes lexiconLanguageCandidates (e.g. ["default"] or ["us-en", "gb-en", "zh"]) derived from lexicon.txt and lexicon-*.txt; use these for a language selection dropdown (language change requires re-initialization).
 *
 * @param modelPath - Model path configuration (asset, file, or auto)
 * @param options - Optional modelType (default: 'auto')
 * @returns Object with success, detectedModels (array of { type, modelDir }), modelType (primary detected type), optional error when success is false, and optionally lexiconLanguageCandidates (language ids for multi-lang Kokoro/Kitten)
 * @example
 * ```typescript
 * const result = await detectTtsModel({ type: 'asset', path: 'models/vits-piper-en' });
 * if (result.success) console.log('Detected type:', result.modelType, result.detectedModels);
 * if (result.lexiconLanguageCandidates?.length) {
 *   // Kokoro/Kitten multi-lang: show language dropdown (e.g. "us-en", "zh")
 * }
 * ```
 */
export async function detectTtsModel(modelPath, options) {
  const resolvedPath = await resolveModelPath(modelPath);
  const raw = await SherpaOnnx.detectTtsModel(resolvedPath, options?.modelType);
  const err = typeof raw.error === 'string' ? raw.error.trim() : '';
  return {
    success: raw.success,
    ...(err.length > 0 ? {
      error: err
    } : {}),
    detectedModels: raw.detectedModels ?? [],
    ...(raw.modelType != null && raw.modelType !== '' ? {
      modelType: raw.modelType
    } : {}),
    ...(raw.lexiconLanguageCandidates != null && raw.lexiconLanguageCandidates.length > 0 ? {
      lexiconLanguageCandidates: raw.lexiconLanguageCandidates
    } : {})
  };
}

/**
 * Convert TtsGenerationOptions to a flat object for the native bridge.
 * Flattens referenceAudio { samples, sampleRate } to referenceAudio array + referenceSampleRate.
 */
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

// TTS stream events are sent from native via sendEventWithName; use DeviceEventEmitter

/**
 * Create a TTS engine instance. Call destroy() on the returned engine when done to free native resources.
 *
 * @param options - TTS initialization options or model path configuration
 * @returns Promise resolving to a TtsEngine instance
 * @example
 * ```typescript
 * const tts = await createTTS({
 *   modelPath: { type: 'asset', path: 'models/vits-piper-en' },
 *   modelType: 'vits',
 *   modelOptions: { vits: { noiseScale: 0.667 } },
 * });
 * const audio = await tts.generateSpeech('Hello world');
 * await tts.destroy();
 * ```
 */
export async function createTTS(options) {
  const instanceId = `tts_${++ttsInstanceCounter}`;
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
    throw new Error(nativeError.length > 0 ? `TTS initialization failed: ${nativeError}` : `TTS initialization failed: ${detected}`);
  }
  const firstDetected = result.detectedModels?.[0];
  const effectiveModelType = modelType && modelType !== 'auto' ? modelType : firstDetected?.type;
  let destroyed = false;
  const guard = () => {
    if (destroyed) {
      throw new Error(`TTS instance ${instanceId} has been destroyed; cannot call methods on it.`);
    }
  };
  const engine = {
    get instanceId() {
      return instanceId;
    },
    async generateSpeech(text, opts) {
      guard();
      return SherpaOnnx.generateTts(instanceId, text, toNativeTtsOptions(opts));
    },
    async generateSpeechWithTimestamps(text, opts) {
      guard();
      return SherpaOnnx.generateTtsWithTimestamps(instanceId, text, toNativeTtsOptions(opts));
    },
    async updateParams(opts) {
      guard();
      const effectiveModelTypeForUpdate = opts.modelType && opts.modelType !== 'auto' ? opts.modelType : effectiveModelType;
      const flatOpts = flattenTtsModelOptionsForNative(effectiveModelTypeForUpdate, opts.modelOptions);
      const noiseArg = flatOpts.noiseScale === undefined ? Number.NaN : flatOpts.noiseScale;
      const noiseWArg = flatOpts.noiseScaleW === undefined ? Number.NaN : flatOpts.noiseScaleW;
      const lengthArg = flatOpts.lengthScale === undefined ? Number.NaN : flatOpts.lengthScale;
      return SherpaOnnx.updateTtsParams(instanceId, noiseArg, noiseWArg, lengthArg);
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

// ========== Module-level utilities (stateless, no instance required) ==========

/**
 * Save generated TTS audio to a WAV file.
 */
export function saveAudioToFile(audio, filePath) {
  return SherpaOnnx.saveTtsAudioToFile(audio.samples, audio.sampleRate, filePath);
}

/**
 * Save generated TTS audio to a WAV file via Android SAF content URI.
 */
export function saveAudioToContentUri(audio, directoryUri, filename) {
  return SherpaOnnx.saveTtsAudioToContentUri(audio.samples, audio.sampleRate, directoryUri, filename);
}

/**
 * Save a text file via Android SAF content URI.
 */
export function saveTextToContentUri(text, directoryUri, filename, mimeType = 'text/plain') {
  return SherpaOnnx.saveTtsTextToContentUri(text, directoryUri, filename, mimeType);
}

/**
 * Copy a local file into a document under a SAF directory URI (format-agnostic; Android only).
 * Use for saving converted audio (e.g. MP3, FLAC) to a content URI.
 */
export function copyFileToContentUri(filePath, directoryUri, filename, mimeType) {
  return SherpaOnnx.copyFileToContentUri(filePath, directoryUri, filename, mimeType);
}

/**
 * Copy a SAF content URI to a cache file for local playback (Android only).
 */
export function copyContentUriToCache(fileUri, filename) {
  return SherpaOnnx.copyTtsContentUriToCache(fileUri, filename);
}

/**
 * Share a TTS audio file (file path or content URI).
 */
export function shareAudioFile(fileUri, mimeType = 'audio/wav') {
  return SherpaOnnx.shareTtsAudio(fileUri, mimeType);
}

// Streaming TTS (separate engine; use createStreamingTTS for chunk callbacks and PCM playback)
export { createStreamingTTS } from "./streaming.js";

// Export types and runtime type list

export { TTS_MODEL_TYPES } from "./types.js";
//# sourceMappingURL=index.js.map