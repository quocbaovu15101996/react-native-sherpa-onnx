import type { OnlineSTTModelType, StreamingSttEngine, StreamingSttInitOptions } from './streamingTypes';
/**
 * Map detected STT model type (from detectSttModel) to an online (streaming) model type.
 * Throws if the detected type has no streaming support.
 */
export declare function mapDetectedToOnlineType(detectedType: string | undefined): OnlineSTTModelType;
/**
 * Returns the online (streaming) model type for a detected STT model type, or null if streaming is not supported.
 * Use this to check whether the current model can be used with createStreamingSTT() (e.g. for live transcription).
 */
export declare function getOnlineTypeOrNull(detectedType: string | undefined): OnlineSTTModelType | null;
/**
 * Create a streaming (online) STT engine. Use this for real-time recognition with
 * partial results and endpoint detection. Call destroy() when done.
 *
 * @param options - Streaming STT init options (modelPath required; modelType optional, use 'auto' to detect from directory)
 * @returns Promise resolving to a StreamingSttEngine
 * @example
 * ```typescript
 * // With explicit model type
 * const engine = await createStreamingSTT({
 *   modelPath: { type: 'asset', path: 'models/streaming-zipformer-en' },
 *   modelType: 'transducer',
 * });
 * // With auto-detection
 * const engine = await createStreamingSTT({
 *   modelPath: { type: 'asset', path: 'models/sherpa-onnx-streaming-t-one-russian-2025-09-08' },
 *   modelType: 'auto',
 * });
 * const stream = await engine.createStream();
 * await stream.acceptWaveform(samples, 16000);
 * if (await stream.isReady()) {
 *   await stream.decode();
 *   const result = await stream.getResult();
 *   console.log(result.text);
 * }
 * await stream.release();
 * await engine.destroy();
 * ```
 */
export declare function createStreamingSTT(options: StreamingSttInitOptions): Promise<StreamingSttEngine>;
//# sourceMappingURL=streaming.d.ts.map