"use strict";

/**
 * Supported STT model types.
 * Must match ParseSttModelType() in android/.../sherpa-onnx-model-detect-stt.cpp.
 */

/** Model types that support hotwords (contextual biasing). Transducer and NeMo transducer support hotwords in sherpa-onnx (NeMo: see k2-fsa/sherpa-onnx#3077). */
export const STT_HOTWORDS_MODEL_TYPES = ['transducer', 'nemo_transducer'];

/**
 * Returns true only for model types that support hotwords (transducer, nemo_transducer).
 * Use this to show/hide hotword options in the UI or to validate before init/setSttConfig.
 */
export function sttSupportsHotwords(modelType) {
  return modelType === 'transducer' || modelType === 'nemo_transducer';
}

/** Runtime list of supported STT model types (must match ParseSttModelType in native). */
export const STT_MODEL_TYPES = ['transducer', 'nemo_transducer', 'paraformer', 'nemo_ctc', 'wenet_ctc', 'sense_voice', 'zipformer_ctc', 'ctc', 'whisper', 'funasr_nano', 'qwen3_asr', 'fire_red_asr', 'moonshine', 'dolphin', 'canary', 'omnilingual', 'medasr', 'telespeech_ctc', 'auto'];

/** Result of initializeSTT(). decodingMethod is set when init succeeds (e.g. "greedy_search" or "modified_beam_search"; auto-set when hotwords are used). */

// ========== Model-specific options (only applied when that model type is loaded) ==========

/** Options for Whisper models. Applied only when modelType is 'whisper'. */

/** Options for SenseVoice models. Applied only when modelType is 'sense_voice'. */

/** Options for Canary models. Applied only when modelType is 'canary'. */

/** Options for FunASR Nano models. Applied only when modelType is 'funasr_nano'. */

/** Options for Qwen3 ASR models. Applied only when modelType is 'qwen3_asr'. */

/**
 * Model-specific STT options. Only the block for the actually loaded model type is applied;
 * others are ignored (e.g. whisper options have no effect when a paraformer model is loaded).
 */

/**
 * STT-specific initialization options
 */

/**
 * Full recognition result from offline STT (maps to Kotlin OfflineRecognizerResult).
 */

/**
 * Instance-based STT engine returned by createSTT().
 * Call destroy() when done to free native resources.
 */

/**
 * Runtime config for the offline recognizer (Kotlin OfflineRecognizerConfig).
 * Only fields that can be updated via setConfig are included.
 */
//# sourceMappingURL=types.js.map