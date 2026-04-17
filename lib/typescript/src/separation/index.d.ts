/**
 * Source Separation feature module
 *
 * @remarks
 * This feature is not yet implemented. This module serves as a placeholder
 * for future source separation functionality.
 *
 * @example
 * ```typescript
 * // Future usage:
 * import { initializeSeparation, separateSources } from 'react-native-sherpa-onnx/separation';
 *
 * await initializeSeparation({ modelPath: { type: 'auto', path: 'models/separation-model' } });
 * const sources = await separateSources('path/to/mixed-audio.wav');
 * ```
 */
import type { ModelPathConfig } from '../types';
/**
 * Separation initialization options (placeholder)
 */
export interface SeparationInitializeOptions {
    modelPath: ModelPathConfig;
}
/**
 * Separated audio source
 */
export interface SeparatedSource {
    sourceId: string;
    outputPath: string;
}
/**
 * Initialize Source Separation with model directory.
 *
 * @throws {Error} Not yet implemented
 */
export declare function initializeSeparation(_options: SeparationInitializeOptions): Promise<void>;
/**
 * Separate audio sources from a mixed audio file.
 *
 * @throws {Error} Not yet implemented
 */
export declare function separateSources(_filePath: string): Promise<SeparatedSource[]>;
/**
 * Release separation resources.
 *
 * @throws {Error} Not yet implemented
 */
export declare function unloadSeparation(): Promise<void>;
//# sourceMappingURL=index.d.ts.map