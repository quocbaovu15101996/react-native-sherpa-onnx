"use strict";

import SherpaOnnx from "../NativeSherpaOnnx.js";
import { resolveModelPath } from "../utils.js";
let streamingEnhancementInstanceCounter = 0;
function normalizeEnhancedAudio(raw) {
  const samplesArray = Array.isArray(raw.samples) ? raw.samples : Array.from(raw.samples ?? []);
  return {
    samples: Float32Array.from(samplesArray),
    sampleRate: Number(raw.sampleRate ?? 0)
  };
}
export async function createStreamingEnhancement(options) {
  const instanceId = `streaming_enhancement_${++streamingEnhancementInstanceCounter}`;
  const resolvedPath = await resolveModelPath(options.modelPath);
  const result = await SherpaOnnx.initializeOnlineEnhancement(instanceId, resolvedPath, options.modelType ?? 'auto', options.numThreads, options.provider, options.debug);
  if (!result.success) {
    const nativeError = typeof result.error === 'string' ? result.error.trim() : '';
    throw new Error(nativeError.length > 0 ? `Streaming enhancement initialization failed: ${nativeError}` : `Streaming enhancement initialization failed for ${instanceId}`);
  }
  let destroyed = false;
  const guard = () => {
    if (destroyed) {
      throw new Error(`Streaming enhancement instance ${instanceId} has been destroyed; cannot call methods on it.`);
    }
  };
  return {
    get instanceId() {
      return instanceId;
    },
    async feedSamples(samples, sampleRate) {
      guard();
      const raw = await SherpaOnnx.feedEnhancementSamples(instanceId, samples, sampleRate);
      return normalizeEnhancedAudio(raw);
    },
    async flush() {
      guard();
      const raw = await SherpaOnnx.flushOnlineEnhancement(instanceId);
      return normalizeEnhancedAudio(raw);
    },
    async reset() {
      guard();
      await SherpaOnnx.resetOnlineEnhancement(instanceId);
    },
    async getSampleRate() {
      guard();
      return SherpaOnnx.getEnhancementSampleRate(instanceId);
    },
    async getFrameShiftInSamples() {
      guard();
      return Number(result.frameShiftInSamples ?? 0);
    },
    async destroy() {
      if (destroyed) return;
      destroyed = true;
      await SherpaOnnx.unloadOnlineEnhancement(instanceId);
    }
  };
}
//# sourceMappingURL=streaming.js.map