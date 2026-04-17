/**
 * Voice Activity Detection (VAD) feature module
 *
 * @remarks
 * This feature is not yet implemented. This module serves as a placeholder
 * for future VAD functionality.
 *
 * @example
 * ```typescript
 * // Future usage:
 * import { initializeVAD, detectVoiceActivity } from 'react-native-sherpa-onnx/vad';
 *
 * await initializeVAD({ modelPath: { type: 'auto', path: 'models/vad-model' } });
 * const segments = await detectVoiceActivity('path/to/audio.wav');
 * ```
 */
import type { ModelPathConfig } from '../types';
/**
 * VAD initialization options (placeholder)
 */
export interface VADInitializeOptions {
    modelPath: ModelPathConfig;
}
/**
 * Voice activity segment
 */
export interface VoiceSegment {
    start: number;
    end: number;
}
/**
 * Initialize Voice Activity Detection (VAD) with model directory.
 *
 * @throws {Error} Not yet implemented
 */
export declare function initializeVAD(_options: VADInitializeOptions): Promise<void>;
/**
 * Detect voice activity in an audio file.
 *
 * @throws {Error} Not yet implemented
 */
export declare function detectVoiceActivity(_filePath: string): Promise<VoiceSegment[]>;
/**
 * Release VAD resources.
 *
 * @throws {Error} Not yet implemented
 */
export declare function unloadVAD(): Promise<void>;
//# sourceMappingURL=index.d.ts.map