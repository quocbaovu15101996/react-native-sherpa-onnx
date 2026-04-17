import type { STTInitializeOptions, STTModelType, SttEngine } from './types';
import type { ModelPathConfig } from '../types';
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
export declare function detectSttModel(modelPath: ModelPathConfig, options?: {
    preferInt8?: boolean;
    modelType?: STTModelType;
}): Promise<{
    success: boolean;
    /** Native validation/detect failure. */
    error?: string;
    detectedModels: Array<{
        type: string;
        modelDir: string;
    }>;
    modelType?: string;
    isHardwareSpecificUnsupported?: boolean;
}>;
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
export declare function createSTT(options: STTInitializeOptions | ModelPathConfig): Promise<SttEngine>;
export { createStreamingSTT, mapDetectedToOnlineType, getOnlineTypeOrNull, } from './streaming';
export type { OnlineSTTModelType, StreamingSttEngine, StreamingSttInitOptions, StreamingSttResult, SttStream, EndpointConfig, EndpointRule, } from './streamingTypes';
export { ONLINE_STT_MODEL_TYPES } from './streamingTypes';
export type { STTInitializeOptions, STTModelType, SttModelOptions, SttQwen3AsrModelOptions, SttRecognitionResult, SttRuntimeConfig, SttEngine, SttInitResult, } from './types';
export { STT_MODEL_TYPES, STT_HOTWORDS_MODEL_TYPES, sttSupportsHotwords, } from './types';
export { getWhisperLanguages, WHISPER_LANGUAGES, getSenseVoiceLanguages, SENSEVOICE_LANGUAGES, getCanaryLanguages, CANARY_LANGUAGES, getFunasrNanoLanguages, FUNASR_NANO_LANGUAGES, getFunasrMltNanoLanguages, FUNASR_MLT_NANO_LANGUAGES, } from './sttModelLanguages';
export type { SttModelLanguage, WhisperLanguage } from './sttModelLanguages';
//# sourceMappingURL=index.d.ts.map