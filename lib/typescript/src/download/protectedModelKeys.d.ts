/**
 * Model keys (`category:modelId`) that must not be removed by bulk delete: active JS download tasks,
 * native background-downloader tasks, and models in post-download processing (extraction / validation).
 */
export declare function getProtectedModelKeysForBulkDelete(): Promise<ReadonlySet<string>>;
//# sourceMappingURL=protectedModelKeys.d.ts.map