"use strict";

/** Ref-count map keyed by `category:modelId`. A key is "active" (protected
 *  from bulk delete) as long as its count is > 0, which allows multiple
 *  concurrent post-download operations on the same model to coexist safely. */
const activePostProcessCounts = new Map();
export function makeModelOperationKey(category, modelId) {
  return `${category}:${modelId}`;
}
export function registerActivePostProcess(category, modelId) {
  const key = makeModelOperationKey(category, modelId);
  activePostProcessCounts.set(key, (activePostProcessCounts.get(key) ?? 0) + 1);
}
export function unregisterActivePostProcess(category, modelId) {
  const key = makeModelOperationKey(category, modelId);
  const count = activePostProcessCounts.get(key) ?? 0;
  if (count <= 1) {
    activePostProcessCounts.delete(key);
  } else {
    activePostProcessCounts.set(key, count - 1);
  }
}
export function getActivePostProcessKeys() {
  return new Set(activePostProcessCounts.keys());
}
//# sourceMappingURL=activeModelOperations.js.map