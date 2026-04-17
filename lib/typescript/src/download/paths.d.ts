import { ModelCategory } from './types';
import type { ModelArchiveExt } from './types';
export declare const CATEGORY_CONFIG: Record<ModelCategory, {
    tag: string;
    cacheFile: string;
    baseDir: string;
}>;
export declare function getCacheDir(): string;
export declare function getCachePath(category: ModelCategory): string;
export declare function getModelsBaseDir(category: ModelCategory): string;
export declare function getModelDir(category: ModelCategory, modelId: string): string;
export declare function getArchiveFilename(modelId: string, archiveExt: ModelArchiveExt): string;
export declare function getArchivePath(category: ModelCategory, modelId: string, archiveExt: ModelArchiveExt): string;
export declare function getTarArchivePath(category: ModelCategory, modelId: string): string;
export declare function getOnnxPath(category: ModelCategory, modelId: string): string;
export declare function getReadyMarkerPath(category: ModelCategory, modelId: string): string;
export declare function getManifestPath(category: ModelCategory, modelId: string): string;
export declare function getDownloadStatePath(category: ModelCategory, modelId: string): string;
/** Path to extraction state file; used to detect and resume incomplete extractions after app restart. */
export declare function getExtractionStatePath(category: ModelCategory, modelId: string): string;
/**
 * Directory where native `resolveAssetPath` materializes a bundled model folder
 * (`DocumentDirectoryPath/models/{modelId}` — Android internal `files/models/...`).
 * Separate from {@link getModelDir}. `deleteModelByCategory` does not remove this tree; it
 * only deletes download-manager installs under `sherpa-onnx/models/`.
 */
export declare function getNativeAssetExtractedModelDir(modelId: string): string;
export declare function getReleaseUrl(category: ModelCategory): string;
//# sourceMappingURL=paths.d.ts.map