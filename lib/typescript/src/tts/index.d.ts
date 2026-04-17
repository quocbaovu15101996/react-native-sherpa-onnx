import type { TTSInitializeOptions, TTSModelType, GeneratedAudio, TtsEngine } from './types';
import type { ModelPathConfig } from '../types';
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
export declare function detectTtsModel(modelPath: ModelPathConfig, options?: {
    modelType?: TTSModelType;
}): Promise<{
    success: boolean;
    /** Native validation/detect failure (e.g. missing lexicon for Zipvoice). */
    error?: string;
    detectedModels: Array<{
        type: string;
        modelDir: string;
    }>;
    modelType?: string;
    /** Language ids from detected lexicon files ("default" for lexicon.txt, or e.g. "us-en", "zh" from lexicon-us-en.txt, lexicon-zh.txt). Present for Kokoro/Kitten; use for language selection UI. */
    lexiconLanguageCandidates?: string[];
}>;
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
export declare function createTTS(options: TTSInitializeOptions | ModelPathConfig): Promise<TtsEngine>;
/**
 * Save generated TTS audio to a WAV file.
 */
export declare function saveAudioToFile(audio: GeneratedAudio, filePath: string): Promise<string>;
/**
 * Save generated TTS audio to a WAV file via Android SAF content URI.
 */
export declare function saveAudioToContentUri(audio: GeneratedAudio, directoryUri: string, filename: string): Promise<string>;
/**
 * Save a text file via Android SAF content URI.
 */
export declare function saveTextToContentUri(text: string, directoryUri: string, filename: string, mimeType?: string): Promise<string>;
/**
 * Copy a local file into a document under a SAF directory URI (format-agnostic; Android only).
 * Use for saving converted audio (e.g. MP3, FLAC) to a content URI.
 */
export declare function copyFileToContentUri(filePath: string, directoryUri: string, filename: string, mimeType: string): Promise<string>;
/**
 * Copy a SAF content URI to a cache file for local playback (Android only).
 */
export declare function copyContentUriToCache(fileUri: string, filename: string): Promise<string>;
/**
 * Share a TTS audio file (file path or content URI).
 */
export declare function shareAudioFile(fileUri: string, mimeType?: string): Promise<void>;
export { createStreamingTTS } from './streaming';
export type { StreamingTtsEngine } from './streamingTypes';
export type { TTSInitializeOptions, TTSModelType, TtsModelOptions, TtsVitsModelOptions, TtsMatchaModelOptions, TtsKokoroModelOptions, TtsKittenModelOptions, TtsPocketModelOptions, TtsSupertonicModelOptions, TtsUpdateOptions, TtsGenerationOptions, GeneratedAudio, GeneratedAudioWithTimestamps, TtsSubtitleItem, TTSModelInfo, TtsEngine, TtsStreamController, TtsStreamHandlers, TtsStreamChunk, TtsStreamEnd, TtsStreamError, } from './types';
export { TTS_MODEL_TYPES } from './types';
//# sourceMappingURL=index.d.ts.map