"use strict";

/**
 * Supported TTS model types.
 *
 * - 'vits': VITS models (includes Piper, Coqui, MeloTTS, MMS variants)
 * - 'matcha': Matcha models (acoustic model + vocoder)
 * - 'kokoro': Kokoro models (multi-speaker, multi-language)
 * - 'kitten': KittenTTS models (lightweight, multi-speaker)
 * - 'pocket': Pocket TTS models
 * - 'zipvoice': Zipvoice models (voice cloning capable)
 * - 'supertonic': Supertonic models
 * - 'auto': Auto-detect model type based on files present (default)
 */

/** Runtime list of supported TTS model types. */
export const TTS_MODEL_TYPES = ['vits', 'matcha', 'kokoro', 'kitten', 'pocket', 'zipvoice', 'supertonic', 'auto'];

// ========== Model-specific options (only applied when that model type is loaded) ==========

/** Options for VITS models. Applied only when modelType is 'vits'. Kotlin OfflineTtsVitsModelConfig. */

/** Options for Matcha models. Applied only when modelType is 'matcha'. Kotlin OfflineTtsMatchaModelConfig. */

/** Options for Kokoro models. Applied only when modelType is 'kokoro'. Kotlin OfflineTtsKokoroModelConfig. */

/** Options for KittenTTS models. Applied only when modelType is 'kitten'. Kotlin OfflineTtsKittenModelConfig. */

/** Options for Pocket TTS models. Applied only when modelType is 'pocket'. Kotlin has no init-time model config for pocket; reserved for future use. */

/** Options for Supertonic models. Applied only when modelType is 'supertonic'. */

/**
 * Model-specific TTS options. Only the block for the actually loaded model type is applied;
 * others are ignored (e.g. vits options have no effect when a kokoro model is loaded).
 */

/**
 * Configuration for TTS initialization.
 */

/**
 * Options for updating TTS model parameters at runtime.
 * Only the block for the given modelType is applied; flattened to native noiseScale / noiseScaleW / lengthScale.
 */

/**
 * Options for TTS generation. Maps to Kotlin GenerationConfig when reference
 * audio or advanced options are used; otherwise simple sid/speed are used.
 */

/**
 * Generated audio data from TTS synthesis.
 *
 * The samples are normalized float values in the range [-1.0, 1.0].
 * To save as a WAV file or play the audio, you'll need to convert
 * these samples to the appropriate format for your use case.
 */

/**
 * Subtitle/timestamp item for synthesized speech.
 */

/**
 * Generated audio with subtitle/timestamp metadata.
 */

/**
 * Streaming chunk event payload for TTS generation.
 */

/**
 * Streaming end event payload.
 */

/**
 * Streaming error event payload.
 */

/**
 * Controller returned by generateSpeechStream().
 * Use cancel() to stop generation, unsubscribe() to remove event listeners.
 */

/**
 * Handlers for TTS streaming generation (chunk, end, error).
 */

/**
 * Instance-based batch TTS engine returned by createTTS().
 * Use for one-shot synthesis (generateSpeech, generateSpeechWithTimestamps).
 * For streaming, use createStreamingTTS() and StreamingTtsEngine instead.
 * Call destroy() when done to free native resources.
 */

/**
 * Information about TTS model capabilities.
 */
//# sourceMappingURL=types.js.map