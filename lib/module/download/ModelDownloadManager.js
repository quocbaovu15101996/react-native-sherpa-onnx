"use strict";

// Re-export types and enum for public API
export { ModelCategory } from "./types.js";
export { subscribeDownloadProgress, subscribeModelsListUpdated } from "./downloadEvents.js";
export { listModelsByCategory, refreshModelsByCategory, getModelsCacheStatusByCategory, getModelByIdByCategory } from "./registry.js";
export { listDownloadedModelsByCategory, isModelDownloadedByCategory, getLocalModelPathByCategory, updateModelLastUsed, listDownloadedModelsWithMetadata, cleanupLeastRecentlyUsed, deleteModelByCategory, clearModelCacheByCategory, getDownloadStorageBase } from "./localModels.js";
export { configureModelDownloadBackgroundDownloader, downloadModelByCategory, getIncompleteDownloads, resumeDownload, deleteIncompleteDownload } from "./downloadTask.js";
export { extractModelByCategory, getIncompleteExtractions, resumeExtraction, deleteIncompleteExtraction } from "./modelExtraction.js";
export { ensureModelByCategory } from "./ensureModel.js";
export { getProtectedModelKeysForBulkDelete } from "./protectedModelKeys.js";
export { purgeDownloadedModelArtifacts } from "./bulkPurge.js";
//# sourceMappingURL=ModelDownloadManager.js.map