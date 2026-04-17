import type { ModelCategory, ModelMetaBase, ChecksumIssue, DownloadProgress, ExtractionState } from './types';
import type { DownloadResult } from './types';
/**
 * Start extraction for a model: archive must already exist (e.g. after download or from PAD).
 * Writes extraction state so that if the app crashes, extraction can be resumed via
 * getIncompleteExtractions + resumeExtraction.
 * Use signal to abort (pause) extraction.
 */
export declare function extractModelByCategory<T extends ModelMetaBase>(category: ModelCategory, id: string, opts?: {
    onProgress?: (progress: DownloadProgress) => void;
    signal?: AbortSignal;
    onChecksumIssue?: (issue: ChecksumIssue) => Promise<boolean>;
    deleteArchiveAfterExtract?: boolean;
}): Promise<DownloadResult>;
/**
 * Returns models in the given category that have incomplete extractions (e.g. after app
 * crash during extraction). Use with resumeExtraction to continue.
 */
export declare function getIncompleteExtractions(category: ModelCategory): Promise<ExtractionState[]>;
/**
 * Resume an incomplete extraction (e.g. after app restart). Use getIncompleteExtractions
 * to discover items to resume. Runs extraction from the start (archive is overwritten into
 * model dir with force).
 */
export declare function resumeExtraction<T extends ModelMetaBase>(category: ModelCategory, id: string, opts?: {
    onProgress?: (progress: DownloadProgress) => void;
    signal?: AbortSignal;
    onChecksumIssue?: (issue: ChecksumIssue) => Promise<boolean>;
    deleteArchiveAfterExtract?: boolean;
}): Promise<DownloadResult>;
/**
 * Cancel/delete an incomplete extraction: removes extraction state and partial model dir.
 * Does not delete the archive so the user can retry extraction later.
 */
export declare function deleteIncompleteExtraction(category: ModelCategory, id: string): Promise<void>;
//# sourceMappingURL=modelExtraction.d.ts.map