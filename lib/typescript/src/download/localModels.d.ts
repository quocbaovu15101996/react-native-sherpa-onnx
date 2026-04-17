import type { ModelCategory, ModelMetaBase, ModelWithMetadata } from './types';
export declare function listDownloadedModelsByCategory<T extends ModelMetaBase>(category: ModelCategory): Promise<T[]>;
export declare function isModelDownloadedByCategory(category: ModelCategory, id: string): Promise<boolean>;
export declare function getLocalModelPathByCategory(category: ModelCategory, id: string): Promise<string | null>;
export declare function updateModelLastUsed(category: ModelCategory, id: string): Promise<void>;
export declare function listDownloadedModelsWithMetadata<T extends ModelMetaBase>(category: ModelCategory): Promise<ModelWithMetadata<T>[]>;
export declare function cleanupLeastRecentlyUsed(category: ModelCategory, options?: {
    targetBytes?: number;
    maxModelsToDelete?: number;
    keepCount?: number;
}): Promise<string[]>;
export declare function deleteModelByCategory(category: ModelCategory, id: string): Promise<void>;
export declare function clearModelCacheByCategory(category: ModelCategory): Promise<void>;
export declare function getDownloadStorageBase(): Promise<string>;
//# sourceMappingURL=localModels.d.ts.map