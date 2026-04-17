/**
 * STT model language codes and display names.
 * Per-model lists for Whisper, SenseVoice, and others. Use these for language-hint
 * dropdowns so users only pick valid codes (invalid codes can crash the app, e.g. Whisper).
 */
export interface SttModelLanguage {
    /**
     * Value to pass as language (e.g. "en" for Whisper, "中文" for FunASR Nano).
     * Use as modelOptions.<model>.language (or srcLang/tgtLang where applicable).
     */
    id: string;
    /** Display name in English (e.g. "english", "chinese"). */
    name: string;
}
/** @deprecated Use SttModelLanguage. Kept for backward compatibility. */
export type WhisperLanguage = SttModelLanguage;
/** Ordered list of all Whisper-supported language codes and names. */
export declare const WHISPER_LANGUAGES: readonly SttModelLanguage[];
/**
 * Returns the list of Whisper-supported language codes and display names.
 * Use for building a language-hint dropdown so users only pick valid codes (invalid codes can crash the app).
 */
export declare function getWhisperLanguages(): readonly SttModelLanguage[];
/** Ordered list of SenseVoice-supported language codes and names. */
export declare const SENSEVOICE_LANGUAGES: readonly SttModelLanguage[];
/**
 * Returns the list of SenseVoice-supported language codes and display names.
 * Use for modelOptions.senseVoice.language so users only pick valid codes.
 */
export declare function getSenseVoiceLanguages(): readonly SttModelLanguage[];
/** Canary: en, es, de, fr. */
export declare const CANARY_LANGUAGES: readonly SttModelLanguage[];
/**
 * Returns the list of Canary-supported language codes and display names.
 * Use for modelOptions.canary.srcLang and modelOptions.canary.tgtLang.
 */
export declare function getCanaryLanguages(): readonly SttModelLanguage[];
/** Fun-ASR-Nano-2512: Chinese, English, Japanese. */
export declare const FUNASR_NANO_LANGUAGES: readonly SttModelLanguage[];
/** Fun-ASR-MLT-Nano-2512: multilingual list. */
export declare const FUNASR_MLT_NANO_LANGUAGES: readonly SttModelLanguage[];
/**
 * Returns languages for Fun-ASR-Nano-2512 (中文, 英文, 日文).
 * Id is the value for modelOptions.funasrNano.language (e.g. "中文").
 */
export declare function getFunasrNanoLanguages(): readonly SttModelLanguage[];
/**
 * Returns languages for Fun-ASR-MLT-Nano-2512 (multilingual).
 * Id is the value for modelOptions.funasrNano.language (e.g. "中文").
 */
export declare function getFunasrMltNanoLanguages(): readonly SttModelLanguage[];
//# sourceMappingURL=sttModelLanguages.d.ts.map