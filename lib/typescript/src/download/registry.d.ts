import { ModelCategory } from './types';
import type { ModelMetaBase, CacheStatus } from './types';
export declare function fetchChecksumsFromRelease(category: ModelCategory): Promise<Map<string, string>>;
export declare function listModelsByCategory<T extends ModelMetaBase>(category: ModelCategory): Promise<T[]>;
export declare function refreshModelsByCategory<T extends ModelMetaBase>(category: ModelCategory, options?: {
    forceRefresh?: boolean;
    cacheTtlMinutes?: number;
    maxRetries?: number;
    signal?: AbortSignal;
}): Promise<T[]>;
export declare function getModelsCacheStatusByCategory(category: ModelCategory): Promise<CacheStatus>;
export declare function getModelByIdByCategory<T extends ModelMetaBase>(category: ModelCategory, id: string): Promise<T | null>;
export declare function clearMemoryCacheForCategory(category: ModelCategory): void;
//# sourceMappingURL=registry.d.ts.map