import type { ModelCategory, ModelMetaBase, ChecksumIssue, DownloadProgress } from './types';
import type { DownloadResult } from './types';
export type RunPostDownloadProcessingOptions = {
    category: ModelCategory;
    id: string;
    model: ModelMetaBase;
    downloadPath: string;
    modelDir: string;
    isArchive: boolean;
    statePath: string;
    signal?: AbortSignal;
    onChecksumIssue?: (issue: ChecksumIssue) => Promise<boolean>;
    deleteArchiveAfterExtract?: boolean;
    onProgress?: (progress: DownloadProgress) => void;
    /**
     * **Android:** Native extraction progress notification (default true), aligned with the download-manager flow.
     * **iOS:** No effect.
     */
    showExtractionNotifications?: boolean;
    /** **Android:** Optional notification title (default: SDK/native default title). */
    extractionNotificationTitle?: string;
    /** **Android:** Optional notification body prefix (progress percent is appended natively). */
    extractionNotificationText?: string;
    /** Called to get current list of downloaded models for emitModelsListUpdated. */
    getDownloadedList: () => Promise<ModelMetaBase[]>;
};
export declare function runPostDownloadProcessing(options: RunPostDownloadProcessingOptions): Promise<DownloadResult>;
//# sourceMappingURL=postDownloadProcessing.d.ts.map