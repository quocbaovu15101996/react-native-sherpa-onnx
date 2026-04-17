import type { ModelCategory, ModelMetaBase, DownloadProgress, DownloadProgressListener, ModelsListUpdatedListener } from './types';
export declare const subscribeDownloadProgress: (listener: DownloadProgressListener) => (() => void);
export declare const subscribeModelsListUpdated: (listener: ModelsListUpdatedListener) => (() => void);
export declare function emitDownloadProgress(category: ModelCategory, modelId: string, progress: DownloadProgress): void;
export declare function emitModelsListUpdated(category: ModelCategory, models: ModelMetaBase[]): void;
//# sourceMappingURL=downloadEvents.d.ts.map