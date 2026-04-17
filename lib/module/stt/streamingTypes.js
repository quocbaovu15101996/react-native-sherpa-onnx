"use strict";

/**
 * Online (streaming) STT model types.
 * These models use OnlineRecognizer + OnlineStream in sherpa-onnx.
 * Must match the native OnlineRecognizer model config (transducer, paraformer, zipformer2_ctc, nemo_ctc, tone_ctc).
 */

/** Runtime list of supported online STT model types. */
export const ONLINE_STT_MODEL_TYPES = ['transducer', 'paraformer', 'zipformer2_ctc', 'nemo_ctc', 'tone_ctc'];

/**
 * Single endpoint rule (Kotlin EndpointRule).
 * Used to detect end of utterance in streaming recognition.
 */

/**
 * Endpoint detection config (Kotlin EndpointConfig).
 * Three rules; first match determines end of utterance.
 */

/**
 * Options for initializing the streaming (online) STT engine.
 */

/**
 * Partial or final recognition result from streaming STT (maps to Kotlin OnlineRecognizerResult).
 */

/**
 * Streaming STT stream. Created by StreamingSttEngine.createStream().
 * Feeds audio via acceptWaveform, then decode / getResult / isEndpoint.
 */

/**
 * Streaming STT engine (OnlineRecognizer). Create via createStreamingSTT().
 */
//# sourceMappingURL=streamingTypes.js.map