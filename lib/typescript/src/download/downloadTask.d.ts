import type { BackgroundDownloaderSetConfigOptions } from './background-downloader-types';
import { ModelCategory, type ModelMetaBase, type ChecksumIssue, type DownloadProgress, type DownloadResult, type DownloadState } from './types';
export type { BackgroundDownloaderSetConfigOptions };
/**
 * Apply your own `@kesha-antonov/react-native-background-downloader` `setConfig` **before** the first
 * model download. When called, the SDK will **not** overwrite it with built-in defaults on first download.
 *
 * Safe to call at app startup (e.g. `App.tsx`). Other `setConfig` options (e.g. headers) are forwarded
 * where the native module supports them on each platform.
 */
export declare function configureModelDownloadBackgroundDownloader(options: BackgroundDownloaderSetConfigOptions): void;
export declare function downloadModelByCategory<T extends ModelMetaBase>(category: ModelCategory, id: string, opts?: {
    onProgress?: (progress: DownloadProgress) => void;
    overwrite?: boolean;
    signal?: AbortSignal;
    maxRetries?: number;
    onChecksumIssue?: (issue: ChecksumIssue) => Promise<boolean>;
    deleteArchiveAfterExtract?: boolean;
}): Promise<DownloadResult>;
export declare function getIncompleteDownloads(category: ModelCategory): Promise<DownloadState[]>;
export declare function resumeDownload<T extends ModelMetaBase>(category: ModelCategory, id: string, opts?: {
    onProgress?: (progress: DownloadProgress) => void;
    signal?: AbortSignal;
    onChecksumIssue?: (issue: ChecksumIssue) => Promise<boolean>;
    deleteArchiveAfterExtract?: boolean;
}): Promise<DownloadResult>;
export declare function deleteIncompleteDownload(category: ModelCategory, id: string): Promise<void>;
/** Task ids in the form `category:modelId` for downloads currently tracked in JS (before post-processing). */
export declare function getActiveDownloadTaskKeys(): string[];
//# sourceMappingURL=downloadTask.d.ts.map