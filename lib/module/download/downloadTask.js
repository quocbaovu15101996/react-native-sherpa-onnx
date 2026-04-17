"use strict";

import { Platform } from 'react-native';
import { createDownloadTask, completeHandler, getExistingDownloadTasks, setConfig } from '@kesha-antonov/react-native-background-downloader';
import { exists, readFile, mkdir, writeFile, stat, unlink } from '@dr.pogodin/react-native-fs';
import { checkDiskSpace, removeDirectoryRecursive } from "./validation.js";
import { getModelsBaseDir, getModelDir, getArchivePath, getReadyMarkerPath, getDownloadStatePath, getNativeAssetExtractedModelDir, getTarArchivePath, getOnnxPath } from "./paths.js";
import { emitDownloadProgress } from "./downloadEvents.js";
import { runPostDownloadProcessing } from "./postDownloadProcessing.js";
import { getModelByIdByCategory } from "./registry.js";
import { listDownloadedModelsByCategory } from "./localModels.js";
function makeDownloadTaskId(category, id) {
  return `${category}:${id}`;
}
const activeDownloadTasks = new Map();
let androidDownloaderNotificationConfigApplied = false;
let didWarnConfigFailure = false;
function warnBackgroundDownloaderConfigFailure(context, error) {
  if (didWarnConfigFailure) return;
  didWarnConfigFailure = true;
  const reason = error instanceof Error ? error.message : String(error);
  console.warn(`[Download] Background downloader config failed (${context}): ${reason}`);
}
/**
 * Apply your own `@kesha-antonov/react-native-background-downloader` `setConfig` **before** the first
 * model download. When called, the SDK will **not** overwrite it with built-in defaults on first download.
 *
 * Safe to call at app startup (e.g. `App.tsx`). Other `setConfig` options (e.g. headers) are forwarded
 * where the native module supports them on each platform.
 */
export function configureModelDownloadBackgroundDownloader(options) {
  try {
    setConfig(options);
    androidDownloaderNotificationConfigApplied = true;
  } catch (error) {
    // Keep fallback default config enabled if custom config fails.
    warnBackgroundDownloaderConfigFailure('custom', error);
  }
}

/**
 * Library default is showNotificationsEnabled: false (silent empty FGS notification).
 * Enable visible notifications unless the host app already called `configureModelDownloadBackgroundDownloader`.
 */
function ensureAndroidBackgroundDownloaderNotifications() {
  if (androidDownloaderNotificationConfigApplied) return;
  if (Platform.OS !== 'android') return;
  try {
    setConfig({
      showNotificationsEnabled: true,
      notificationsGrouping: {
        enabled: false,
        mode: 'individual',
        texts: {
          downloadTitle: 'Model download',
          downloadStarting: 'Starting download…',
          downloadProgress: 'Downloading… {progress}%'
        }
      }
    });
    androidDownloaderNotificationConfigApplied = true;
  } catch (error) {
    warnBackgroundDownloaderConfigFailure('default', error);
  }
}
export async function downloadModelByCategory(category, id, opts) {
  const isAborted = () => Boolean(opts?.signal?.aborted);
  if (opts?.signal?.aborted) {
    const abortError = new Error('Download aborted');
    abortError.name = 'AbortError';
    throw abortError;
  }
  const model = await getModelByIdByCategory(category, id);
  if (!model) {
    throw new Error(`Unknown model id: ${id}`);
  }
  const baseDir = getModelsBaseDir(category);
  await mkdir(baseDir);
  const downloadPath = getArchivePath(category, id, model.archiveExt);
  const isArchive = model.archiveExt === 'tar.bz2';
  const modelDir = getModelDir(category, id);
  const sleep = ms => new Promise(resolve => {
    setTimeout(resolve, ms);
  });
  const cleanupPartial = async () => {
    if (!isArchive) return;
    if (await exists(modelDir)) {
      await unlink(modelDir);
    }
  };
  const cleanupPartialWithRetry = async () => {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      await cleanupPartial();
      if (!(await exists(modelDir))) return;
      await sleep(400);
    }
    if (await exists(modelDir)) {
      console.warn(`Model cleanup after abort did not fully complete for ${category}:${id}`);
    }
  };
  const diskSpaceCheck = await checkDiskSpace(model.bytes);
  if (!diskSpaceCheck.success) {
    throw new Error(`Insufficient disk space: ${diskSpaceCheck.message}`);
  }
  ensureAndroidBackgroundDownloaderNotifications();
  const statePath = getDownloadStatePath(category, id);
  if (opts?.overwrite) {
    if (await exists(modelDir)) await unlink(modelDir);
    if (await exists(downloadPath)) await unlink(downloadPath);
    if (await exists(statePath)) await unlink(statePath);
  } else {
    const readyMarkerExists = await exists(getReadyMarkerPath(category, id));
    if (!readyMarkerExists && isArchive) {
      if (await exists(modelDir)) await unlink(modelDir);
    }
  }
  try {
    const downloadState = {
      modelId: id,
      category,
      phase: 'downloading',
      startedAt: new Date().toISOString(),
      archivePath: downloadPath,
      model,
      totalBytes: model.bytes
    };
    await mkdir(getModelsBaseDir(category));
    await writeFile(statePath, JSON.stringify(downloadState), 'utf8');
    if (!isArchive) {
      await mkdir(modelDir);
    }
    const taskId = makeDownloadTaskId(category, id);
    return new Promise((resolve, reject) => {
      let abortHandler;
      const cleanup = () => {
        if (abortHandler && opts?.signal) {
          opts.signal.removeEventListener('abort', abortHandler);
          abortHandler = undefined;
        }
        activeDownloadTasks.delete(taskId);
      };
      const task = createDownloadTask({
        id: taskId,
        url: model.downloadUrl,
        destination: downloadPath,
        metadata: {}
      }).progress(({
        bytesDownloaded,
        bytesTotal
      }) => {
        if (isAborted()) return;
        const total = bytesTotal ?? model.bytes ?? 0;
        const percent = total > 0 ? bytesDownloaded / total * 100 : 0;
        const progress = {
          bytesDownloaded,
          totalBytes: total,
          percent,
          phase: 'downloading'
        };
        opts?.onProgress?.(progress);
        emitDownloadProgress(category, id, progress);
      }).done(async () => {
        cleanup();
        try {
          const result = await runPostDownloadProcessing({
            category,
            id,
            model,
            downloadPath,
            modelDir,
            isArchive,
            statePath,
            signal: opts?.signal,
            onChecksumIssue: opts?.onChecksumIssue,
            deleteArchiveAfterExtract: opts?.deleteArchiveAfterExtract,
            onProgress: opts?.onProgress,
            getDownloadedList: () => listDownloadedModelsByCategory(category)
          });
          completeHandler(taskId);
          resolve(result);
        } catch (e) {
          completeHandler(taskId);
          reject(e);
        }
      }).error(({
        error,
        errorCode
      }) => {
        cleanup();
        completeHandler(taskId);
        (async () => {
          try {
            if (await exists(statePath)) await unlink(statePath);
          } catch {
            // ignore
          }
        })();
        reject(new Error(typeof error === 'string' ? error : String(errorCode ?? error)));
      });
      activeDownloadTasks.set(taskId, task);
      if (opts?.signal) {
        abortHandler = () => {
          task.stop();
          cleanup();
          (async () => {
            try {
              if (await exists(statePath)) await unlink(statePath);
            } catch {
              // ignore
            }
          })();
          const err = new Error('Download aborted');
          err.name = 'AbortError';
          reject(err);
        };
        opts.signal.addEventListener('abort', abortHandler);
      }
      task.start();
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError' || isAborted()) {
      await cleanupPartialWithRetry();
      try {
        if (await exists(statePath)) await unlink(statePath);
      } catch {
        // ignore
      }
    }
    if (isArchive && !(err instanceof Error && err.name === 'AbortError')) {
      try {
        if (await exists(downloadPath)) {
          const archiveStat = await stat(downloadPath);
          if (model.bytes > 0 && archiveStat.size < model.bytes) {
            console.warn(`[Download] Deleting truncated archive for ${category}:${id} (${archiveStat.size}/${model.bytes})`);
            await unlink(downloadPath);
          }
        }
      } catch {
        // ignore
      }
    }
    throw err;
  }
}
export async function getIncompleteDownloads(category) {
  const prefix = category + ':';
  const states = [];
  const existingTasks = await getExistingDownloadTasks();
  for (const task of existingTasks) {
    if (!task.id || !task.id.startsWith(prefix)) continue;
    const modelId = task.id.slice(prefix.length);
    const readyPath = getReadyMarkerPath(category, modelId);
    if (await exists(readyPath)) continue;
    const statePath = getDownloadStatePath(category, modelId);
    let model;
    let totalBytes;
    let archivePath;
    let startedAt;
    if (await exists(statePath)) {
      try {
        const raw = await readFile(statePath, 'utf8');
        const fromFile = JSON.parse(raw);
        model = fromFile.model;
        totalBytes = fromFile.totalBytes ?? fromFile.model?.bytes;
        archivePath = fromFile.archivePath;
        startedAt = fromFile.startedAt;
      } catch {
        // ignore
      }
    }
    if (!model) {
      const meta = await getModelByIdByCategory(category, modelId);
      if (!meta) continue;
      model = meta;
      totalBytes = model.bytes;
      archivePath = getArchivePath(category, modelId, model.archiveExt);
    }
    let bytesDownloaded;
    if (archivePath) {
      try {
        const st = await stat(archivePath);
        if (st?.size != null && st.size >= 0) bytesDownloaded = st.size;
      } catch {
        // ignore
      }
    }
    states.push({
      modelId,
      category,
      phase: 'downloading',
      startedAt: startedAt ?? new Date().toISOString(),
      archivePath: archivePath ?? '',
      model,
      bytesDownloaded,
      totalBytes: totalBytes ?? model.bytes
    });
  }
  return states;
}
export async function resumeDownload(category, id, opts) {
  ensureAndroidBackgroundDownloaderNotifications();
  const taskId = makeDownloadTaskId(category, id);
  const existingTasks = await getExistingDownloadTasks();
  const existing = existingTasks.find(t => t.id === taskId);
  if (!existing) {
    return downloadModelByCategory(category, id, {
      onProgress: opts?.onProgress,
      signal: opts?.signal,
      onChecksumIssue: opts?.onChecksumIssue,
      deleteArchiveAfterExtract: opts?.deleteArchiveAfterExtract
    });
  }
  const model = await getModelByIdByCategory(category, id);
  if (!model) throw new Error(`Unknown model id: ${id}`);
  const downloadPath = getArchivePath(category, id, model.archiveExt);
  const modelDir = getModelDir(category, id);
  const isArchive = model.archiveExt === 'tar.bz2';
  const statePath = getDownloadStatePath(category, id);
  const isAborted = () => Boolean(opts?.signal?.aborted);
  return new Promise((resolve, reject) => {
    let abortHandler;
    const cleanup = () => {
      if (abortHandler && opts?.signal) {
        opts.signal.removeEventListener('abort', abortHandler);
        abortHandler = undefined;
      }
      activeDownloadTasks.delete(taskId);
    };
    existing.progress(({
      bytesDownloaded,
      bytesTotal
    }) => {
      if (isAborted()) return;
      const total = bytesTotal ?? model.bytes ?? 0;
      const percent = total > 0 ? bytesDownloaded / total * 100 : 0;
      opts?.onProgress?.({
        bytesDownloaded,
        totalBytes: total,
        percent,
        phase: 'downloading'
      });
      emitDownloadProgress(category, id, {
        bytesDownloaded,
        totalBytes: total,
        percent,
        phase: 'downloading'
      });
    }).done(async () => {
      cleanup();
      try {
        const result = await runPostDownloadProcessing({
          category,
          id,
          model,
          downloadPath,
          modelDir,
          isArchive,
          statePath,
          signal: opts?.signal,
          onChecksumIssue: opts?.onChecksumIssue,
          deleteArchiveAfterExtract: opts?.deleteArchiveAfterExtract,
          onProgress: opts?.onProgress,
          getDownloadedList: () => listDownloadedModelsByCategory(category)
        });
        completeHandler(taskId);
        resolve(result);
      } catch (e) {
        completeHandler(taskId);
        reject(e);
      }
    }).error(({
      error,
      errorCode
    }) => {
      cleanup();
      completeHandler(taskId);
      (async () => {
        try {
          if (await exists(statePath)) await unlink(statePath);
        } catch {
          // ignore
        }
      })();
      reject(new Error(typeof error === 'string' ? error : String(errorCode ?? error)));
    });
    activeDownloadTasks.set(taskId, existing);
    if (opts?.signal) {
      abortHandler = () => {
        existing.stop();
        cleanup();
        (async () => {
          try {
            if (await exists(statePath)) await unlink(statePath);
          } catch {
            // ignore
          }
        })();
        const err = new Error('Download aborted');
        err.name = 'AbortError';
        reject(err);
      };
      opts.signal.addEventListener('abort', abortHandler);
    }
    existing.resume().catch(() => {});
  });
}
export async function deleteIncompleteDownload(category, id) {
  const taskId = makeDownloadTaskId(category, id);
  const existingTasks = await getExistingDownloadTasks();
  const task = existingTasks.find(t => t.id === taskId);
  if (task) {
    task.stop();
    activeDownloadTasks.delete(taskId);
  }
  const modelDir = getModelDir(category, id);
  if (await exists(modelDir)) {
    await unlink(modelDir);
  }
  const tarPath = getTarArchivePath(category, id);
  const onnxPath = getOnnxPath(category, id);
  if (await exists(tarPath)) {
    await unlink(tarPath);
  }
  if (await exists(onnxPath)) {
    await unlink(onnxPath);
  }
  const statePath = getDownloadStatePath(category, id);
  if (await exists(statePath)) {
    await unlink(statePath);
  }
  await removeDirectoryRecursive(getNativeAssetExtractedModelDir(id));
}

/** Task ids in the form `category:modelId` for downloads currently tracked in JS (before post-processing). */
export function getActiveDownloadTaskKeys() {
  return [...activeDownloadTasks.keys()];
}
//# sourceMappingURL=downloadTask.js.map