"use strict";

import SherpaOnnx from "../NativeSherpaOnnx.js";
import { resolveModelPath } from "../utils.js";
let streamingSttInstanceCounter = 0;

/**
 * Map detected STT model type (from detectSttModel) to an online (streaming) model type.
 * Throws if the detected type has no streaming support.
 */
export function mapDetectedToOnlineType(detectedType) {
  const t = detectedType ?? '';
  switch (t) {
    case 'transducer':
      return 'transducer';
    case 'paraformer':
      return 'paraformer';
    case 'nemo_ctc':
      return 'nemo_ctc';
    case 'zipformer_ctc':
    case 'ctc':
      return 'zipformer2_ctc';
    case 'tone_ctc':
      return 'tone_ctc';
    default:
      throw new Error(`Model type "${t}" is not supported for streaming STT. Use createSTT() for offline recognition, or pass a supported modelType: transducer, paraformer, zipformer2_ctc, nemo_ctc, tone_ctc.`);
  }
}

/**
 * Returns the online (streaming) model type for a detected STT model type, or null if streaming is not supported.
 * Use this to check whether the current model can be used with createStreamingSTT() (e.g. for live transcription).
 */
export function getOnlineTypeOrNull(detectedType) {
  try {
    return mapDetectedToOnlineType(detectedType);
  } catch {
    return null;
  }
}
let sttStreamCounter = 0;
function normalizeStreamingResult(raw) {
  return {
    text: typeof raw.text === 'string' ? raw.text : '',
    tokens: Array.isArray(raw.tokens) ? raw.tokens : [],
    timestamps: Array.isArray(raw.timestamps) ? raw.timestamps : []
  };
}

/**
 * Flatten StreamingSttInitOptions to native initializeOnlineStt parameters.
 * EndpointConfig (rule1, rule2, rule3) is expanded to 9 flat params.
 */
function flattenInitOptionsForNative(options) {
  const ep = options.endpointConfig;
  return {
    modelDir: '',
    // filled by caller after resolveModelPath
    modelType: options.modelType,
    enableEndpoint: options.enableEndpoint ?? true,
    decodingMethod: options.decodingMethod ?? 'greedy_search',
    maxActivePaths: options.maxActivePaths ?? 4,
    hotwordsFile: options.hotwordsFile,
    hotwordsScore: options.hotwordsScore,
    numThreads: options.numThreads,
    provider: options.provider,
    ruleFsts: options.ruleFsts,
    ruleFars: options.ruleFars,
    dither: options.dither,
    blankPenalty: options.blankPenalty,
    debug: options.debug,
    rule1MustContainNonSilence: ep?.rule1?.mustContainNonSilence,
    rule1MinTrailingSilence: ep?.rule1?.minTrailingSilence,
    rule1MinUtteranceLength: ep?.rule1?.minUtteranceLength,
    rule2MustContainNonSilence: ep?.rule2?.mustContainNonSilence,
    rule2MinTrailingSilence: ep?.rule2?.minTrailingSilence,
    rule2MinUtteranceLength: ep?.rule2?.minUtteranceLength,
    rule3MustContainNonSilence: ep?.rule3?.mustContainNonSilence,
    rule3MinTrailingSilence: ep?.rule3?.minTrailingSilence,
    rule3MinUtteranceLength: ep?.rule3?.minUtteranceLength
  };
}

/**
 * Create a streaming (online) STT engine. Use this for real-time recognition with
 * partial results and endpoint detection. Call destroy() when done.
 *
 * @param options - Streaming STT init options (modelPath required; modelType optional, use 'auto' to detect from directory)
 * @returns Promise resolving to a StreamingSttEngine
 * @example
 * ```typescript
 * // With explicit model type
 * const engine = await createStreamingSTT({
 *   modelPath: { type: 'asset', path: 'models/streaming-zipformer-en' },
 *   modelType: 'transducer',
 * });
 * // With auto-detection
 * const engine = await createStreamingSTT({
 *   modelPath: { type: 'asset', path: 'models/sherpa-onnx-streaming-t-one-russian-2025-09-08' },
 *   modelType: 'auto',
 * });
 * const stream = await engine.createStream();
 * await stream.acceptWaveform(samples, 16000);
 * if (await stream.isReady()) {
 *   await stream.decode();
 *   const result = await stream.getResult();
 *   console.log(result.text);
 * }
 * await stream.release();
 * await engine.destroy();
 * ```
 */
export async function createStreamingSTT(options) {
  const instanceId = `streaming_stt_${++streamingSttInstanceCounter}`;
  const resolvedPath = await resolveModelPath(options.modelPath);
  let effectiveModelType;
  if (options.modelType === 'auto' || options.modelType === undefined) {
    const detectResult = await SherpaOnnx.detectSttModel(resolvedPath, undefined, undefined);
    if (!detectResult.success) {
      const errMsg = 'error' in detectResult && typeof detectResult.error === 'string' ? detectResult.error : 'Unknown error';
      throw new Error(`Streaming STT auto-detection failed for ${resolvedPath}. ${errMsg}`);
    }
    effectiveModelType = mapDetectedToOnlineType(detectResult.modelType);
  } else {
    effectiveModelType = options.modelType;
  }
  const optionsWithResolvedType = {
    ...options,
    modelType: effectiveModelType
  };
  const flat = flattenInitOptionsForNative(optionsWithResolvedType);
  flat.modelDir = resolvedPath;

  // Build options with only defined values (no undefined) to avoid iOS TurboModule marshalling crash when options contain undefined.
  const nativeOptions = {
    modelDir: flat.modelDir,
    modelType: flat.modelType,
    enableEndpoint: flat.enableEndpoint,
    decodingMethod: flat.decodingMethod,
    maxActivePaths: flat.maxActivePaths
  };
  if (flat.hotwordsFile !== undefined) nativeOptions.hotwordsFile = flat.hotwordsFile;
  if (flat.hotwordsScore !== undefined) nativeOptions.hotwordsScore = flat.hotwordsScore;
  if (flat.numThreads !== undefined) nativeOptions.numThreads = flat.numThreads;
  if (flat.provider !== undefined) nativeOptions.provider = flat.provider;
  if (flat.ruleFsts !== undefined) nativeOptions.ruleFsts = flat.ruleFsts;
  if (flat.ruleFars !== undefined) nativeOptions.ruleFars = flat.ruleFars;
  if (flat.dither !== undefined) nativeOptions.dither = flat.dither;
  if (flat.blankPenalty !== undefined) nativeOptions.blankPenalty = flat.blankPenalty;
  if (flat.debug !== undefined) nativeOptions.debug = flat.debug;
  if (flat.rule1MustContainNonSilence !== undefined) nativeOptions.rule1MustContainNonSilence = flat.rule1MustContainNonSilence;
  if (flat.rule1MinTrailingSilence !== undefined) nativeOptions.rule1MinTrailingSilence = flat.rule1MinTrailingSilence;
  if (flat.rule1MinUtteranceLength !== undefined) nativeOptions.rule1MinUtteranceLength = flat.rule1MinUtteranceLength;
  if (flat.rule2MustContainNonSilence !== undefined) nativeOptions.rule2MustContainNonSilence = flat.rule2MustContainNonSilence;
  if (flat.rule2MinTrailingSilence !== undefined) nativeOptions.rule2MinTrailingSilence = flat.rule2MinTrailingSilence;
  if (flat.rule2MinUtteranceLength !== undefined) nativeOptions.rule2MinUtteranceLength = flat.rule2MinUtteranceLength;
  if (flat.rule3MustContainNonSilence !== undefined) nativeOptions.rule3MustContainNonSilence = flat.rule3MustContainNonSilence;
  if (flat.rule3MinTrailingSilence !== undefined) nativeOptions.rule3MinTrailingSilence = flat.rule3MinTrailingSilence;
  if (flat.rule3MinUtteranceLength !== undefined) nativeOptions.rule3MinUtteranceLength = flat.rule3MinUtteranceLength;
  const result = await SherpaOnnx.initializeOnlineSttWithOptions(instanceId, nativeOptions);
  if (!result.success) {
    const nativeError = typeof result.error === 'string' ? result.error.trim() : '';
    throw new Error(nativeError.length > 0 ? `Streaming STT initialization failed: ${nativeError}` : `Streaming STT initialization failed for ${instanceId}`);
  }
  const enableInputNormalization = options.enableInputNormalization !== false;
  let destroyed = false;
  const guard = () => {
    if (destroyed) {
      throw new Error(`Streaming STT engine ${instanceId} has been destroyed; cannot call methods on it.`);
    }
  };
  const engine = {
    get instanceId() {
      return instanceId;
    },
    async createStream(hotwords) {
      guard();
      const streamId = `stt_stream_${++sttStreamCounter}`;
      await SherpaOnnx.createSttStream(instanceId, streamId, hotwords);
      let released = false;
      const streamGuard = () => {
        if (destroyed) {
          throw new Error(`Streaming STT engine ${instanceId} has been destroyed.`);
        }
        if (released) {
          throw new Error(`Stream ${streamId} has been released; cannot call methods on it.`);
        }
      };
      const stream = {
        get streamId() {
          return streamId;
        },
        async acceptWaveform(samples, sampleRate) {
          streamGuard();
          await SherpaOnnx.acceptSttWaveform(streamId, samples, sampleRate);
        },
        async inputFinished() {
          streamGuard();
          await SherpaOnnx.sttStreamInputFinished(streamId);
        },
        async decode() {
          streamGuard();
          await SherpaOnnx.decodeSttStream(streamId);
        },
        async isReady() {
          streamGuard();
          return SherpaOnnx.isSttStreamReady(streamId);
        },
        async getResult() {
          streamGuard();
          const raw = await SherpaOnnx.getSttStreamResult(streamId);
          return normalizeStreamingResult(raw);
        },
        async isEndpoint() {
          streamGuard();
          return SherpaOnnx.isSttStreamEndpoint(streamId);
        },
        async reset() {
          streamGuard();
          await SherpaOnnx.resetSttStream(streamId);
        },
        async release() {
          if (released) return;
          released = true;
          await SherpaOnnx.releaseSttStream(streamId);
        },
        async processAudioChunk(samples, sampleRate) {
          streamGuard();
          let toSend = samples;
          if (enableInputNormalization && samples.length > 0) {
            let maxAbs = 1e-10;
            for (let i = 0; i < samples.length; i++) {
              const abs = Math.abs(samples[i]);
              if (abs > maxAbs) maxAbs = abs;
            }
            const scale = maxAbs < 0.01 ? 80 : Math.min(80, 0.8 / maxAbs);
            const normalized = new Float32Array(samples.length);
            for (let i = 0; i < samples.length; i++) {
              const v = samples[i] * scale;
              normalized[i] = v < -1 ? -1 : v > 1 ? 1 : v;
            }
            toSend = normalized;
          }
          // Bridge expects a plain array; Float32Array may not serialize as ReadableArray on all platforms.
          const samplesArray = Array.isArray(toSend) ? toSend : Array.from(toSend);
          const raw = await SherpaOnnx.processSttAudioChunk(streamId, samplesArray, sampleRate);
          return {
            result: normalizeStreamingResult(raw),
            isEndpoint: Boolean(raw.isEndpoint)
          };
        }
      };
      return stream;
    },
    async destroy() {
      if (destroyed) return;
      destroyed = true;
      await SherpaOnnx.unloadOnlineStt(instanceId);
    }
  };
  return engine;
}
//# sourceMappingURL=streaming.js.map