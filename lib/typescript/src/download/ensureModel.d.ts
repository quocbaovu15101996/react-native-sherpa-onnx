import type { ModelCategory, ModelMetaBase, ChecksumIssue, DownloadProgress } from './types';
import type { DownloadResult } from './types';
export type EnsureModelOptions = {
    /** Progress callback (percent, phase, speed, eta). */
    onProgress?: (progress: DownloadProgress) => void;
    /** AbortController signal to cancel download or extraction. */
    signal?: AbortSignal;
    /** If true, remove existing model and any incomplete state, then download/extract from scratch. */
    overwrite?: boolean;
    /** Called on checksum mismatch; return true to keep the file. */
    onChecksumIssue?: (issue: ChecksumIssue) => Promise<boolean>;
    /** For archive models: if true (default), delete the archive after extraction to save space. */
    deleteArchiveAfterExtract?: boolean;
};
/**
 * Single entry point to ensure a model is available locally: handles download, extraction,
 * and all edge cases (already ready, incomplete download, incomplete extraction, archive
 * already present). Call this with category, id, and optional opts; the function decides
 * whether to return the existing path, resume an interrupted operation, or start download/extraction.
 *
 * Use this as the main API when you only need "make this model ready"; the lower-level
 * APIs (downloadModelByCategory, resumeDownload, extractModelByCategory, getIncompleteExtractions,
 * etc.) remain available for advanced flows.
 */
export declare function ensureModelByCategory<T extends ModelMetaBase>(category: ModelCategory, id: string, opts?: EnsureModelOptions): Promise<DownloadResult>;
//# sourceMappingURL=ensureModel.d.ts.map