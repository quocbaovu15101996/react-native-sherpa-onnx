"use strict";

import SherpaOnnx from "../NativeSherpaOnnx.js";
import { resolveModelPath } from "../utils.js";
let enhancementInstanceCounter = 0;
function normalizeEnhancedAudio(raw) {
  const samplesArray = Array.isArray(raw.samples) ? raw.samples : Array.from(raw.samples ?? []);
  return {
    samples: Float32Array.from(samplesArray),
    sampleRate: Number(raw.sampleRate ?? 0)
  };
}
export async function detectEnhancementModel(modelPath, options) {
  const resolvedPath = await resolveModelPath(modelPath);
  const raw = await SherpaOnnx.detectEnhancementModel(resolvedPath, options?.modelType);
  const err = typeof raw.error === 'string' ? raw.error.trim() : '';
  return {
    success: raw.success,
    ...(err.length > 0 ? {
      error: err
    } : {}),
    detectedModels: raw.detectedModels ?? [],
    ...(raw.modelType != null && raw.modelType !== '' ? {
      modelType: raw.modelType
    } : {})
  };
}
export async function createEnhancement(options) {
  const instanceId = `enhancement_${++enhancementInstanceCounter}`;
  const resolvedPath = await resolveModelPath(options.modelPath);
  const init = await SherpaOnnx.initializeEnhancement(instanceId, resolvedPath, options.modelType ?? 'auto', options.numThreads, options.provider, options.debug);
  if (!init.success) {
    const nativeError = typeof init.error === 'string' ? init.error.trim() : '';
    throw new Error(nativeError.length > 0 ? `Enhancement initialization failed: ${nativeError}` : `Enhancement initialization failed for ${instanceId}`);
  }
  let destroyed = false;
  const guard = () => {
    if (destroyed) {
      throw new Error(`Enhancement instance ${instanceId} has been destroyed; cannot call methods on it.`);
    }
  };
  return {
    get instanceId() {
      return instanceId;
    },
    async enhanceFile(inputPath, outputPath) {
      guard();
      const raw = await SherpaOnnx.enhanceFile(instanceId, inputPath, outputPath);
      return normalizeEnhancedAudio(raw);
    },
    async enhanceSamples(samples, sampleRate) {
      guard();
      const raw = await SherpaOnnx.enhanceSamples(instanceId, samples, sampleRate);
      return normalizeEnhancedAudio(raw);
    },
    async getSampleRate() {
      guard();
      return SherpaOnnx.getEnhancementSampleRate(instanceId);
    },
    async destroy() {
      if (destroyed) return;
      destroyed = true;
      await SherpaOnnx.unloadEnhancement(instanceId);
    }
  };
}
export { createStreamingEnhancement } from "./streaming.js";
export { ENHANCEMENT_MODEL_TYPES } from "./types.js";
//# sourceMappingURL=index.js.map