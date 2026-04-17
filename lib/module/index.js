"use strict";

import SherpaOnnx from "./NativeSherpaOnnx.js";

// Export common types and utilities

export { assetModelPath, autoModelPath, fileModelPath, getAssetPackPath, getDefaultModelPath, getPlayAssetDeliveryModelsPath, listAssetModels, listModelsAtPath, resolveModelPath } from "./utils.js";
export { copyFileToContentUri } from "./tts/index.js";
export { getModelLicenses } from "./licenses.js";
// Note: Feature-specific exports are available via subpath imports:
// - import { createSTT, createStreamingSTT, ... } from 'react-native-sherpa-onnx/stt'
// - import { createTTS, ... } from 'react-native-sherpa-onnx/tts'
// - import { ... } from 'react-native-sherpa-onnx/download'
// - import { getBundledArchives, listBundledArchives, extractArchive } from 'react-native-sherpa-onnx/extraction'
// - import { ... } from 'react-native-sherpa-onnx/vad' (planned)
// - import { ... } from 'react-native-sherpa-onnx/diarization' (planned)
// - import { ... } from 'react-native-sherpa-onnx/enhancement' (planned)
// - import { ... } from 'react-native-sherpa-onnx/separation' (planned)

/**
 * Test method to verify sherpa-onnx native library is loaded.
 */
export function testSherpaInit() {
  return SherpaOnnx.testSherpaInit();
}

/**
 * QNN support (Android). Optional modelBase64 for canInit (session test); if omitted, SDK uses embedded test model.
 */
export function getQnnSupport(modelBase64) {
  return SherpaOnnx.getQnnSupport(modelBase64);
}

/**
 * Device SoC result: soc is always the device SoC string when available (Android 12+); on iOS or when unavailable, soc is null.
 * isSupported is true when the SoC is SM8xxx (supported for QNN models). Use soc for the label; use isSupported to decide whether to auto-select in the download manager.
 */

export function getDeviceQnnSoc() {
  return SherpaOnnx.getDeviceQnnSoc();
}

/**
 * Return the list of available ONNX Runtime execution providers
 * (e.g. "CPU", "NNAPI", "QNN", "XNNPACK").
 * Requires the ORT Java bridge from the onnxruntime AAR.
 */
export function getAvailableProviders() {
  return SherpaOnnx.getAvailableProviders();
}

/**
 * NNAPI support (Android). Optional modelBase64 for canInit (session test). On iOS returns all false.
 */
export function getNnapiSupport(modelBase64) {
  return SherpaOnnx.getNnapiSupport(modelBase64);
}

/**
 * XNNPACK support. hasAccelerator = true when providerCompiled (CPU-optimized). Optional modelBase64 for canInit. On iOS returns all false.
 */
export function getXnnpackSupport(modelBase64) {
  return SherpaOnnx.getXnnpackSupport(modelBase64);
}

/**
 * Core ML support (iOS). providerCompiled = true (Core ML on iOS 11+), hasAccelerator = Apple Neural Engine. Optional modelBase64 for canInit. On Android returns all false.
 */
export function getCoreMlSupport(modelBase64) {
  return SherpaOnnx.getCoreMlSupport(modelBase64);
}
//# sourceMappingURL=index.js.map