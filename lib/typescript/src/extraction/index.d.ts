/**
 * Extraction subpath: list and extract compressed model archives (.tar.zst / .tar.bz2).
 *
 * Three entry points:
 *  - getBundledArchives(packName)    – Android PAD packs (STORAGE_FILES or APK_ASSETS)
 *  - listBundledArchives(dirPath)    – any filesystem directory (cross-platform)
 *  - extractArchive(archive, target) – unified extraction (auto-selects path or asset-stream)
 *
 * After extraction, use listModelsAtPath / autoModelPath from the main package.
 */
import type { BundledArchive, ExtractArchiveOptions, ExtractResult } from './types';
export type { BundledArchive, ExtractArchiveOptions, ExtractNotificationArgs, ExtractResult, ExtractProgressEvent, } from './types';
/**
 * List compressed archives delivered via a **Play Asset Delivery** pack.
 *
 * - **STORAGE_FILES** packs: scans the pack directory on the filesystem.
 * - **APK_ASSETS** packs: queries the Android AssetManager for embedded archive paths.
 *   Archives returned with `fromAsset: true` are extracted by streaming from the APK
 *   (no temp copy needed).
 * - **iOS / unavailable pack**: returns `null`.
 *
 * @param packName  Name of the PAD asset pack (e.g. `"sherpa_models"`)
 */
export declare function getBundledArchives(packName: string): Promise<BundledArchive[] | null>;
/**
 * List `.tar.zst` and `.tar.bz2` archives in a filesystem directory.
 *
 * Works on **all platforms** — use for:
 * - iOS main-bundle archives (`MainBundlePath + '/models'`)
 * - Archives downloaded to the documents directory
 * - Any other folder containing compressed model archives
 *
 * @param directoryPath  Absolute path to the directory to scan
 */
export declare function listBundledArchives(directoryPath: string): Promise<BundledArchive[]>;
/**
 * Extract a single archive to the target directory.
 *
 * Handles both source types transparently:
 * - **Filesystem archives** (from `listBundledArchives` or PAD STORAGE_FILES) —
 *   uses the regular path-based extraction.
 * - **APK asset archives** (`fromAsset: true`, from PAD APK_ASSETS) —
 *   streams directly from the APK without copying the archive to disk first.
 *
 * @param archive    Descriptor returned by `getBundledArchives` or `listBundledArchives`
 * @param targetPath Directory to extract into (e.g. `DocumentDirectoryPath + '/models'`)
 * @param options    `force` (default `true`), `onProgress`, `signal` (AbortSignal)
 */
export declare function extractArchive(archive: BundledArchive, targetPath: string, options?: ExtractArchiveOptions): Promise<ExtractResult>;
//# sourceMappingURL=index.d.ts.map