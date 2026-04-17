import type { AccelerationSupport } from './NativeSherpaOnnx';
export type { AccelerationSupport } from './NativeSherpaOnnx';
export type { ModelPathConfig } from './types';
export { assetModelPath, autoModelPath, fileModelPath, getAssetPackPath, getDefaultModelPath, getPlayAssetDeliveryModelsPath, listAssetModels, listModelsAtPath, resolveModelPath, } from './utils';
export { copyFileToContentUri } from './tts';
export { getModelLicenses, type ModelLicense } from './licenses';
/**
 * Test method to verify sherpa-onnx native library is loaded.
 */
export declare function testSherpaInit(): Promise<string>;
/**
 * QNN support (Android). Optional modelBase64 for canInit (session test); if omitted, SDK uses embedded test model.
 */
export declare function getQnnSupport(modelBase64?: string): Promise<AccelerationSupport>;
/**
 * Device SoC result: soc is always the device SoC string when available (Android 12+); on iOS or when unavailable, soc is null.
 * isSupported is true when the SoC is SM8xxx (supported for QNN models). Use soc for the label; use isSupported to decide whether to auto-select in the download manager.
 */
export type DeviceQnnSocResult = {
    soc: string | null;
    isSupported: boolean;
};
export declare function getDeviceQnnSoc(): Promise<DeviceQnnSocResult>;
/**
 * Return the list of available ONNX Runtime execution providers
 * (e.g. "CPU", "NNAPI", "QNN", "XNNPACK").
 * Requires the ORT Java bridge from the onnxruntime AAR.
 */
export declare function getAvailableProviders(): Promise<string[]>;
/**
 * NNAPI support (Android). Optional modelBase64 for canInit (session test). On iOS returns all false.
 */
export declare function getNnapiSupport(modelBase64?: string): Promise<AccelerationSupport>;
/**
 * XNNPACK support. hasAccelerator = true when providerCompiled (CPU-optimized). Optional modelBase64 for canInit. On iOS returns all false.
 */
export declare function getXnnpackSupport(modelBase64?: string): Promise<AccelerationSupport>;
/**
 * Core ML support (iOS). providerCompiled = true (Core ML on iOS 11+), hasAccelerator = Apple Neural Engine. Optional modelBase64 for canInit. On Android returns all false.
 */
export declare function getCoreMlSupport(modelBase64?: string): Promise<AccelerationSupport>;
//# sourceMappingURL=index.d.ts.map