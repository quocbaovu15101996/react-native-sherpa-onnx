export type ValidationError = 'CHECKSUM_MISMATCH' | 'CHECKSUM_FAILED' | 'MISSING_FILES' | 'INSUFFICIENT_DISK_SPACE';
export declare class ValidationResult {
    success: boolean;
    error?: ValidationError;
    message?: string;
    constructor(success: boolean, error?: ValidationError, message?: string);
}
/**
 * Delete a directory and all contents. No-op if the path is missing.
 * Best-effort: continues on per-entry errors (permissions, race).
 */
export declare function removeDirectoryRecursive(dirPath: string): Promise<void>;
/**
 * Parse checksum.txt format into a Map of filename -> hash
 * Expected format:
 * filename\tsha256hash
 * example:
 * vits-vctk.tar.bz2	4f0a02db66914b3760b144cebc004e65dd4d1aeef43379f2b058849e74002490
 */
export declare function parseChecksumFile(content: string): Map<string, string>;
/**
 * Calculate SHA256 hash of a file in chunks to avoid OOM
 * Reads file in 1MB chunks and processes them efficiently
 */
export declare function calculateFileChecksum(filePath: string, onProgress?: (bytesProcessed: number, totalBytes: number, percent: number) => void): Promise<string>;
/**
 * Validate checksum of downloaded file
 */
export declare function validateChecksum(filePath: string, expectedChecksum: string, onProgress?: (bytesProcessed: number, totalBytes: number, percent: number) => void): Promise<ValidationResult>;
/**
 * Validate that extraction was successful by checking:
 * - Directory exists and is not empty
 * - Contains at least some files (not just directories)
 *
 * The actual model validation (correct files for specific model type)
 * is delegated to the native DetectSttModel / DetectTtsModel functions,
 * so we don't need to check for specific filenames here.
 */
export declare function validateExtractedFiles(modelDir: string, _category: string): Promise<ValidationResult>;
/**
 * Resolve the directory that actually contains model files.
 * After extracting a tarball, model files often end up in a single top-level subdirectory
 * (e.g. installDir/modelId/encoder.onnx). Native APIs expect the path to the folder
 * that directly contains encoder.onnx, decoder.onnx, etc.
 *
 * - If installDir itself contains native model files (.onnx/.bin), returns installDir.
 * - If installDir has exactly one subdirectory that contains native model files, returns that subdirectory path.
 *   (Ignores our metadata: .ready, manifest.json.) This can produce paths like
 *   .../tts/vits-piper-de_DE-thorsten-medium-int8/vits-piper-de_DE-thorsten-medium-int8 when the
 *   archive extracts a top-level folder with the same name as the model id; that is intentional.
 * - Otherwise returns installDir unchanged.
 */
export declare function resolveActualModelDir(installDir: string): Promise<string>;
/**
 * Get available disk space (in bytes)
 * This is a simplified version. For accurate values on Android/iOS, use native modules.
 */
export declare function getAvailableDiskSpace(): Promise<number>;
/**
 * Check if there's enough disk space for download
 * Adds 20% buffer to the required size
 */
export declare function checkDiskSpace(requiredBytes: number): Promise<ValidationResult>;
/**
 * Update expected files configuration for a category
 * DEPRECATED: The native DetectSttModel/DetectTtsModel functions handle model validation.
 * This function is kept for backward compatibility but does nothing.
 */
export declare function setExpectedFilesForCategory(_category: string, _files: string[]): void;
/**
 * Get expected files for a category
 * DEPRECATED: The native DetectSttModel/DetectTtsModel functions handle model validation.
 * This function is kept for backward compatibility.
 */
export declare function getExpectedFilesForCategory(_category: string): string[];
//# sourceMappingURL=validation.d.ts.map