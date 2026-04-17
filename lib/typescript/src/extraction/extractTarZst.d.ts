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
export declare function extractTarZst(sourcePath: string, targetPath: string, force?: boolean, onProgress?: (event: ExtractProgressEvent) => void, signal?: AbortSignal, notification?: ExtractNotificationArgs): Promise<ExtractResult>;
export {};
//# sourceMappingURL=extractTarZst.d.ts.map