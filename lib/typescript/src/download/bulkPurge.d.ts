export type PurgeDownloadedModelArtifactsResult = {
    deletedComplete: number;
    deletedIncompleteDownloads: number;
    deletedIncompleteExtractions: number;
    skippedProtected: number;
};
/**
 * Deletes completed downloads, incomplete downloads, and incomplete extractions for every
 * {@link ModelCategory}, except keys in `protectKeys` (or current {@link getProtectedModelKeysForBulkDelete}).
 */
export declare function purgeDownloadedModelArtifacts(opts?: {
    protectKeys?: ReadonlySet<string>;
}): Promise<PurgeDownloadedModelArtifactsResult>;
//# sourceMappingURL=bulkPurge.d.ts.map