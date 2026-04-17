/**
 * Retry helper with exponential backoff
 * @param fn - The async function to retry
 * @param options - Retry configuration
 * @returns The result of the function
 * @throws The last error if all retries fail or AbortError if aborted
 */
export declare function retryWithBackoff<T>(fn: () => Promise<T>, options?: {
    maxRetries?: number;
    initialDelayMs?: number;
    maxDelayMs?: number;
    backoffFactor?: number;
    signal?: AbortSignal;
}): Promise<T>;
//# sourceMappingURL=retry.d.ts.map