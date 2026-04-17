import type { ModelPathConfig } from '../types';
import type { EnhancementDetectResult, EnhancementEngine, EnhancementInitializeOptions } from './types';
export declare function detectEnhancementModel(modelPath: ModelPathConfig, options?: {
    modelType?: EnhancementInitializeOptions['modelType'];
}): Promise<EnhancementDetectResult>;
export declare function createEnhancement(options: EnhancementInitializeOptions): Promise<EnhancementEngine>;
export { createStreamingEnhancement } from './streaming';
export type { OnlineEnhancementEngine, StreamingEnhancementInitializeOptions, } from './streamingTypes';
export type { EnhancementModelType, EnhancedAudio, EnhancementInitializeOptions, EnhancementDetectResult, EnhancementEngine, } from './types';
export { ENHANCEMENT_MODEL_TYPES } from './types';
//# sourceMappingURL=index.d.ts.map