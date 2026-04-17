"use strict";

import { DocumentDirectoryPath } from '@dr.pogodin/react-native-fs';
import { ModelCategory } from "./types.js";
import { RELEASE_API_BASE } from "./constants.js";
export const CATEGORY_CONFIG = {
  [ModelCategory.Tts]: {
    tag: 'tts-models',
    cacheFile: 'tts-models.json',
    baseDir: `${DocumentDirectoryPath}/sherpa-onnx/models/tts`
  },
  [ModelCategory.Stt]: {
    tag: 'asr-models',
    cacheFile: 'asr-models.json',
    baseDir: `${DocumentDirectoryPath}/sherpa-onnx/models/stt`
  },
  [ModelCategory.Vad]: {
    tag: 'asr-models',
    cacheFile: 'vad-models.json',
    baseDir: `${DocumentDirectoryPath}/sherpa-onnx/models/vad`
  },
  [ModelCategory.Diarization]: {
    tag: 'speaker-segmentation-models',
    cacheFile: 'diarization-models.json',
    baseDir: `${DocumentDirectoryPath}/sherpa-onnx/models/diarization`
  },
  [ModelCategory.Enhancement]: {
    tag: 'speech-enhancement-models',
    cacheFile: 'enhancement-models.json',
    baseDir: `${DocumentDirectoryPath}/sherpa-onnx/models/enhancement`
  },
  [ModelCategory.Separation]: {
    tag: 'source-separation-models',
    cacheFile: 'separation-models.json',
    baseDir: `${DocumentDirectoryPath}/sherpa-onnx/models/separation`
  },
  [ModelCategory.Qnn]: {
    tag: 'asr-models-qnn-binary',
    cacheFile: 'qnn-models.json',
    baseDir: `${DocumentDirectoryPath}/sherpa-onnx/models/qnn`
  }
};
export function getCacheDir() {
  return `${DocumentDirectoryPath}/sherpa-onnx/cache`;
}
export function getCachePath(category) {
  return `${getCacheDir()}/${CATEGORY_CONFIG[category].cacheFile}`;
}
export function getModelsBaseDir(category) {
  return CATEGORY_CONFIG[category].baseDir;
}
export function getModelDir(category, modelId) {
  return `${getModelsBaseDir(category)}/${modelId}`;
}
export function getArchiveFilename(modelId, archiveExt) {
  return `${modelId}.${archiveExt}`;
}
export function getArchivePath(category, modelId, archiveExt) {
  const filename = getArchiveFilename(modelId, archiveExt);
  if (archiveExt === 'onnx') {
    return `${getModelDir(category, modelId)}/${filename}`;
  }
  return `${getModelsBaseDir(category)}/${filename}`;
}
export function getTarArchivePath(category, modelId) {
  return getArchivePath(category, modelId, 'tar.bz2');
}
export function getOnnxPath(category, modelId) {
  return getArchivePath(category, modelId, 'onnx');
}
export function getReadyMarkerPath(category, modelId) {
  return `${getModelDir(category, modelId)}/.ready`;
}
export function getManifestPath(category, modelId) {
  return `${getModelDir(category, modelId)}/manifest.json`;
}
export function getDownloadStatePath(category, modelId) {
  return `${getModelsBaseDir(category)}/.download-state-${modelId}.json`;
}

/** Path to extraction state file; used to detect and resume incomplete extractions after app restart. */
export function getExtractionStatePath(category, modelId) {
  return `${getModelsBaseDir(category)}/.extraction-state-${modelId}.json`;
}

/**
 * Directory where native `resolveAssetPath` materializes a bundled model folder
 * (`DocumentDirectoryPath/models/{modelId}` — Android internal `files/models/...`).
 * Separate from {@link getModelDir}. `deleteModelByCategory` does not remove this tree; it
 * only deletes download-manager installs under `sherpa-onnx/models/`.
 */
export function getNativeAssetExtractedModelDir(modelId) {
  const safeId = modelId.replace(/[/\\]/g, '');
  return `${DocumentDirectoryPath}/models/${safeId}`.replace(/\/+/g, '/');
}
export function getReleaseUrl(category) {
  return `${RELEASE_API_BASE}/${CATEGORY_CONFIG[category].tag}`;
}
//# sourceMappingURL=paths.js.map