import type { ExtractNotificationArgs } from './types';
export type ExtractProgressEvent = {
    bytes: number;
    totalBytes: number;
    percent: number;
};
type ExtractResult = {
    success: boolean;
    path?: string;
    sha256?: string;
    reason?: string;
};
export declare function extractTarBz2(sourcePath: string, targetPath: string, force?: boolean, onProgress?: (event: ExtractProgressEvent) => void, signal?: AbortSignal, notification?: ExtractNotificationArgs): Promise<ExtractResult>;
export {};
//# sourceMappingURL=extractTarBz2.d.ts.map