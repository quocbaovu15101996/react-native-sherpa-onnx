"use strict";

import { Platform } from 'react-native';
import { DocumentDirectoryPath, exists, readFile, readDir, unlink, writeFile } from '@dr.pogodin/react-native-fs';
import { getCachePath, getModelsBaseDir, getModelDir, getManifestPath, getReadyMarkerPath, getTarArchivePath, getOnnxPath } from "./paths.js";
import { resolveActualModelDir } from "./validation.js";
import { emitModelsListUpdated } from "./downloadEvents.js";
import { clearMemoryCacheForCategory } from "./registry.js";
export async function listDownloadedModelsByCategory(category) {
  const baseDir = getModelsBaseDir(category);
  const existsResult = await exists(baseDir);
  if (!existsResult) return [];
  const entries = await readDir(baseDir);
  const models = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const manifestPath = getManifestPath(category, entry.name);
    const manifestExists = await exists(manifestPath);
    if (!manifestExists) continue;
    try {
      const raw = await readFile(manifestPath, 'utf8');
      const manifest = JSON.parse(raw);
      if (manifest.model) {
        models.push(manifest.model);
      }
    } catch {
      // ignore invalid manifest
    }
  }
  return models;
}
export async function isModelDownloadedByCategory(category, id) {
  const readyPath = getReadyMarkerPath(category, id);
  return exists(readyPath);
}
export async function getLocalModelPathByCategory(category, id) {
  const ready = await isModelDownloadedByCategory(category, id);
  if (!ready) return null;
  await updateModelLastUsed(category, id);
  const installDir = getModelDir(category, id);
  return resolveActualModelDir(installDir);
}
export async function updateModelLastUsed(category, id) {
  const manifestPath = getManifestPath(category, id);
  const existsResult = await exists(manifestPath);
  if (!existsResult) return;
  try {
    const raw = await readFile(manifestPath, 'utf8');
    const manifest = JSON.parse(raw);
    manifest.lastUsed = new Date().toISOString();
    await writeFile(manifestPath, JSON.stringify(manifest), 'utf8');
  } catch (error) {
    console.warn(`Failed to update lastUsed for ${category}:${id}:`, error);
  }
}
export async function listDownloadedModelsWithMetadata(category) {
  const baseDir = getModelsBaseDir(category);
  const existsResult = await exists(baseDir);
  if (!existsResult) return [];
  const entries = await readDir(baseDir);
  const modelsWithMetadata = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const manifestPath = getManifestPath(category, entry.name);
    const manifestExists = await exists(manifestPath);
    if (manifestExists) {
      try {
        const raw = await readFile(manifestPath, 'utf8');
        const manifest = JSON.parse(raw);
        if (manifest.model) {
          modelsWithMetadata.push({
            model: manifest.model,
            downloadedAt: manifest.downloadedAt,
            lastUsed: manifest.lastUsed ?? null,
            sizeOnDisk: manifest.sizeOnDisk ?? entry.size,
            status: 'ready'
          });
        }
      } catch (error) {
        console.warn(`Failed to read manifest for ${category}:${entry.name}:`, error);
      }
    }
  }
  return modelsWithMetadata;
}
export async function cleanupLeastRecentlyUsed(category, options) {
  const modelsWithMetadata = await listDownloadedModelsWithMetadata(category);
  if (modelsWithMetadata.length === 0) {
    return [];
  }
  const keepCount = options?.keepCount ?? 1;
  if (modelsWithMetadata.length <= keepCount) {
    return [];
  }
  const sorted = modelsWithMetadata.sort((a, b) => {
    const aTime = a.lastUsed ?? a.downloadedAt;
    const bTime = b.lastUsed ?? b.downloadedAt;
    return new Date(aTime).getTime() - new Date(bTime).getTime();
  });
  const deletedIds = [];
  let bytesFreed = 0;
  const targetBytes = options?.targetBytes ?? 0;
  const maxToDelete = options?.maxModelsToDelete ?? sorted.length - keepCount;
  for (let i = 0; i < sorted.length - keepCount && i < maxToDelete; i++) {
    const item = sorted[i];
    if (!item) continue;
    try {
      await deleteModelByCategory(category, item.model.id);
      deletedIds.push(item.model.id);
      bytesFreed += item.sizeOnDisk ?? 0;
      console.log(`[LRU Cleanup] Deleted ${category}:${item.model.id} (freed ${(item.sizeOnDisk ?? 0) / 1024 / 1024} MB)`);
      if (targetBytes > 0 && bytesFreed >= targetBytes) {
        break;
      }
    } catch (error) {
      console.warn(`[LRU Cleanup] Failed to delete ${category}:${item.model.id}:`, error);
    }
  }
  return deletedIds;
}
export async function deleteModelByCategory(category, id) {
  const modelDir = getModelDir(category, id);
  const tarPath = getTarArchivePath(category, id);
  const onnxPath = getOnnxPath(category, id);
  if (await exists(modelDir)) {
    await unlink(modelDir);
  }
  if (await exists(tarPath)) {
    await unlink(tarPath);
  }
  if (await exists(onnxPath)) {
    await unlink(onnxPath);
  }
  const list = await listDownloadedModelsByCategory(category);
  emitModelsListUpdated(category, list);
}
export async function clearModelCacheByCategory(category) {
  const cachePath = getCachePath(category);
  if (await exists(cachePath)) {
    await unlink(cachePath);
  }
  clearMemoryCacheForCategory(category);
}
export async function getDownloadStorageBase() {
  if (Platform.OS === 'ios') {
    return DocumentDirectoryPath;
  }
  return DocumentDirectoryPath;
}
//# sourceMappingURL=localModels.js.map