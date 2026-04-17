"use strict";

const downloadProgressListeners = new Set();
const modelsListUpdatedListeners = new Set();
export const subscribeDownloadProgress = listener => {
  downloadProgressListeners.add(listener);
  return () => {
    downloadProgressListeners.delete(listener);
  };
};
export const subscribeModelsListUpdated = listener => {
  modelsListUpdatedListeners.add(listener);
  return () => {
    modelsListUpdatedListeners.delete(listener);
  };
};
export function emitDownloadProgress(category, modelId, progress) {
  for (const listener of downloadProgressListeners) {
    try {
      listener(category, modelId, progress);
    } catch (error) {
      console.warn('Download progress listener error:', error);
    }
  }
}
export function emitModelsListUpdated(category, models) {
  for (const listener of modelsListUpdatedListeners) {
    try {
      listener(category, models);
    } catch (error) {
      console.warn('Models list listener error:', error);
    }
  }
}
//# sourceMappingURL=downloadEvents.js.map