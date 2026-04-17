"use strict";

import SherpaOnnx from "../NativeSherpaOnnx.js";
import { resolveModelPath } from "../utils.js";
let sttInstanceCounter = 0;
function normalizeSttResult(raw) {
  return {
    text: typeof raw.text === 'string' ? raw.text : '',
    tokens: Array.isArray(raw.tokens) ? raw.tokens : [],
    timestamps: Array.isArray(raw.timestamps) ? raw.timestamps : [],
    lang: typeof raw.lang === 'string' ? raw.lang : '',
    emotion: typeof raw.emotion === 'string' ? raw.emotion : '',
    event: typeof raw.event === 'string' ? raw.event : '',
    durations: Array.isArray(raw.durations) ? raw.durations : []
  };
}

/**
 * Detect STT model type and structure without initializing the recognizer.
 * Uses the same native file-based detection as createSTT. Stateless; no instance required.
 *
 * @param modelPath - Model path configuration (asset, file, or auto)
 * @param options - Optional preferInt8 and modelType (default: auto)
 * @returns Object with success, detectedModels (array of { type, modelDir }), modelType (primary detected type), optional error when success is false, and optionally isHardwareSpecificUnsupported
 * @example
 * ```typescript
 * const path = { type: 'asset' as const, path: 'models/sherpa-onnx-whisper-tiny-en' };
 * const result = await detectSttModel(path);
 * if (result.success && result.detectedModels.length > 0) {
 *   console.log('Detected type:', result.modelType, result.detectedModels);
 * }
 * ```
 */
export async function detectSttModel(modelPath, options) {
  const resolvedPath = await resolveModelPath(modelPath);
  const raw = await SherpaOnnx.detectSttModel(resolvedPath, options?.preferInt8, options?.modelType);
  const err = typeof raw.error === 'string' ? raw.error.trim() : '';
  return {
    success: raw.success,
    ...(err.length > 0 ? {
      error: err
    } : {}),
    ...(raw.isHardwareSpecificUnsupported === true ? {
      isHardwareSpecificUnsupported: true
    } : {}),
    detectedModels: raw.detectedModels ?? [],
    ...(raw.modelType != null && raw.modelType !== '' ? {
      modelType: raw.modelType
    } : {})
  };
}

/**
 * Create an STT engine instance. Call destroy() on the returned engine when done to free native resources.
 *
 * @param options - STT initialization options or model path configuration
 * @returns Promise resolving to an SttEngine instance
 * @example
 * ```typescript
 * const stt = await createSTT({
 *   modelPath: { type: 'asset', path: 'models/whisper-tiny' },
 * });
 * const result = await stt.transcribeFile('/path/to/audio.wav');
 * console.log(result.text);
 * await stt.destroy();
 * ```
 */
export async function createSTT(options) {
  const instanceId = `stt_${++sttInstanceCounter}`;
  let modelPath;
  let preferInt8;
  let modelType;
  let hotwordsFile;
  let hotwordsScore;
  let numThreads;
  let provider;
  let ruleFsts;
  let ruleFars;
  let dither;
  let modelOptions;
  let modelingUnit;
  let bpeVocab;
  if ('modelPath' in options) {
    modelPath = options.modelPath;
    preferInt8 = options.preferInt8;
    modelType = options.modelType;
    hotwordsFile = options.hotwordsFile;
    hotwordsScore = options.hotwordsScore;
    numThreads = options.numThreads;
    provider = options.provider;
    ruleFsts = options.ruleFsts;
    ruleFars = options.ruleFars;
    dither = options.dither;
    modelOptions = options.modelOptions;
    modelingUnit = options.modelingUnit;
    bpeVocab = options.bpeVocab;
  } else {
    modelPath = options;
    preferInt8 = undefined;
    modelType = undefined;
    hotwordsFile = undefined;
    hotwordsScore = undefined;
    numThreads = undefined;
    provider = undefined;
    ruleFsts = undefined;
    ruleFars = undefined;
    dither = undefined;
    modelOptions = undefined;
    modelingUnit = undefined;
    bpeVocab = undefined;
  }
  const debug = 'modelPath' in options ? options.debug : undefined;
  const resolvedPath = await resolveModelPath(modelPath);
  const result = await SherpaOnnx.initializeStt(instanceId, resolvedPath, preferInt8, modelType, debug, hotwordsFile, hotwordsScore, numThreads, provider, ruleFsts, ruleFars, dither, modelOptions, modelingUnit, bpeVocab);
  if (!result.success) {
    const nativeError = typeof result.error === 'string' ? result.error.trim() : '';
    const detected = JSON.stringify(result.detectedModels ?? []);
    throw new Error(nativeError.length > 0 ? `STT initialization failed: ${nativeError}` : `STT initialization failed: ${detected}`);
  }
  let destroyed = false;
  const guard = () => {
    if (destroyed) {
      throw new Error(`STT instance ${instanceId} has been destroyed; cannot call methods on it.`);
    }
  };
  const engine = {
    get instanceId() {
      return instanceId;
    },
    async transcribeFile(filePath) {
      guard();
      const raw = await SherpaOnnx.transcribeFile(instanceId, filePath);
      return normalizeSttResult(raw);
    },
    async transcribeSamples(samples, sampleRate) {
      guard();
      const raw = await SherpaOnnx.transcribeSamples(instanceId, samples, sampleRate);
      return normalizeSttResult(raw);
    },
    async setConfig(config) {
      guard();
      const map = {};
      if (config.decodingMethod != null) map.decodingMethod = config.decodingMethod;
      if (config.maxActivePaths != null) map.maxActivePaths = config.maxActivePaths;
      if (config.hotwordsFile != null) map.hotwordsFile = config.hotwordsFile;
      if (config.hotwordsScore != null) map.hotwordsScore = config.hotwordsScore;
      if (config.blankPenalty != null) map.blankPenalty = config.blankPenalty;
      if (config.ruleFsts != null) map.ruleFsts = config.ruleFsts;
      if (config.ruleFars != null) map.ruleFars = config.ruleFars;
      return SherpaOnnx.setSttConfig(instanceId, map);
    },
    async destroy() {
      if (destroyed) return;
      destroyed = true;
      await SherpaOnnx.unloadStt(instanceId);
    }
  };
  return engine;
}

// Streaming (online) STT
export { createStreamingSTT, mapDetectedToOnlineType, getOnlineTypeOrNull } from "./streaming.js";
export { ONLINE_STT_MODEL_TYPES } from "./streamingTypes.js";

// Export types and runtime type list

export { STT_MODEL_TYPES, STT_HOTWORDS_MODEL_TYPES, sttSupportsHotwords } from "./types.js";
export { getWhisperLanguages, WHISPER_LANGUAGES, getSenseVoiceLanguages, SENSEVOICE_LANGUAGES, getCanaryLanguages, CANARY_LANGUAGES, getFunasrNanoLanguages, FUNASR_NANO_LANGUAGES, getFunasrMltNanoLanguages, FUNASR_MLT_NANO_LANGUAGES } from "./sttModelLanguages.js";
//# sourceMappingURL=index.js.map