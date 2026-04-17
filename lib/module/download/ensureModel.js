"use strict";

import { exists, stat } from '@dr.pogodin/react-native-fs';
import { getArchivePath } from "./paths.js";
import { getModelByIdByCategory } from "./registry.js";
import { isModelDownloadedByCategory, getLocalModelPathByCategory, deleteModelByCategory } from "./localModels.js";
import { downloadModelByCategory } from "./downloadTask.js";
import { getIncompleteDownloads, resumeDownload } from "./downloadTask.js";
import { getIncompleteExtractions, resumeExtraction, extractModelByCategory, deleteIncompleteExtraction } from "./modelExtraction.js";
import { deleteIncompleteDownload } from "./downloadTask.js";
/**
 * Single entry point to ensure a model is available locally: handles download, extraction,
 * and all edge cases (already ready, incomplete download, incomplete extraction, archive
 * already present). Call this with category, id, and optional opts; the function decides
 * whether to return the existing path, resume an interrupted operation, or start download/extraction.
 *
 * Use this as the main API when you only need "make this model ready"; the lower-level
 * APIs (downloadModelByCategory, resumeDownload, extractModelByCategory, getIncompleteExtractions,
 * etc.) remain available for advanced flows.
 */
export async function ensureModelByCategory(category, id, opts) {
  const model = await getModelByIdByCategory(category, id);
  if (!model) {
    throw new Error(`Unknown model id: ${id}`);
  }
  const isArchive = model.archiveExt === 'tar.bz2';
  if (opts?.overwrite) {
    await deleteModelByCategory(category, id);
    await deleteIncompleteExtraction(category, id);
    await deleteIncompleteDownload(category, id);
  }
  if (!opts?.overwrite && (await isModelDownloadedByCategory(category, id))) {
    const localPath = await getLocalModelPathByCategory(category, id);
    if (localPath) {
      return {
        modelId: id,
        localPath
      };
    }
  }
  if (isArchive) {
    const incompleteExtractions = await getIncompleteExtractions(category);
    const extractionState = incompleteExtractions.find(s => s.modelId === id);
    if (extractionState) {
      return resumeExtraction(category, id, {
        onProgress: opts?.onProgress,
        signal: opts?.signal,
        onChecksumIssue: opts?.onChecksumIssue,
        deleteArchiveAfterExtract: opts?.deleteArchiveAfterExtract
      });
    }
  }
  const incompleteDownloads = await getIncompleteDownloads(category);
  const downloadState = incompleteDownloads.find(s => s.modelId === id);
  if (downloadState) {
    return resumeDownload(category, id, {
      onProgress: opts?.onProgress,
      signal: opts?.signal,
      onChecksumIssue: opts?.onChecksumIssue,
      deleteArchiveAfterExtract: opts?.deleteArchiveAfterExtract
    });
  }
  if (isArchive) {
    const downloadPath = getArchivePath(category, id, model.archiveExt);
    if (await exists(downloadPath)) {
      try {
        const st = await stat(downloadPath);
        if (model.bytes <= 0 || st.size != null && st.size >= model.bytes) {
          return extractModelByCategory(category, id, {
            onProgress: opts?.onProgress,
            signal: opts?.signal,
            onChecksumIssue: opts?.onChecksumIssue,
            deleteArchiveAfterExtract: opts?.deleteArchiveAfterExtract
          });
        }
      } catch {
        // fall through to download
      }
    }
  }
  return downloadModelByCategory(category, id, {
    onProgress: opts?.onProgress,
    overwrite: opts?.overwrite ?? false,
    signal: opts?.signal,
    onChecksumIssue: opts?.onChecksumIssue,
    deleteArchiveAfterExtract: opts?.deleteArchiveAfterExtract
  });
}
//# sourceMappingURL=ensureModel.js.map