"use strict";

import { exists, readFile, mkdir, writeFile } from '@dr.pogodin/react-native-fs';
import { ModelCategory } from "./types.js";
import { CACHE_TTL_MINUTES, MODEL_ARCHIVE_EXT, MODEL_ONNX_EXT } from "./constants.js";
import { getCacheDir, getCachePath, getArchiveFilename, getReleaseUrl, CATEGORY_CONFIG } from "./paths.js";
import { parseChecksumFile } from "./validation.js";
import { retryWithBackoff } from "./retry.js";
import { emitModelsListUpdated } from "./downloadEvents.js";
const memoryCacheByCategory = {};
const checksumCacheByCategory = {};
export async function fetchChecksumsFromRelease(category) {
  if (category === ModelCategory.Qnn) {
    return new Map();
  }
  if (checksumCacheByCategory[category]) {
    return checksumCacheByCategory[category];
  }
  try {
    const checksums = await retryWithBackoff(async () => {
      const response = await fetch(`https://github.com/k2-fsa/sherpa-onnx/releases/download/${CATEGORY_CONFIG[category].tag}/checksum.txt`);
      if (!response.ok) {
        throw new Error(`Failed to fetch checksum.txt for ${category}: ${response.status}`);
      }
      const content = await response.text();
      return parseChecksumFile(content);
    }, {
      maxRetries: 3,
      initialDelayMs: 1000
    });
    checksumCacheByCategory[category] = checksums;
    return checksums;
  } catch (error) {
    console.warn(`SherpaOnnxChecksum: Error fetching checksums for ${category}:`, error);
    return new Map();
  }
}
function toTitleCase(value) {
  return value.split(/[-_\s]+/g).filter(Boolean).map(token => token[0].toUpperCase() + token.slice(1)).join(' ');
}
function deriveDisplayName(id) {
  const cleaned = id.replace(/^sherpa-onnx-/, '');
  return toTitleCase(cleaned);
}
function deriveType(id) {
  const lower = id.toLowerCase();
  if (lower.includes('vits')) return 'vits';
  if (lower.includes('kokoro')) return 'kokoro';
  if (lower.includes('matcha')) return 'matcha';
  if (lower.includes('kitten')) return 'kitten';
  if (lower.includes('pocket')) return 'pocket';
  if (lower.includes('zipvoice')) return 'zipvoice';
  if (lower.includes('supertonic')) return 'supertonic';
  return 'unknown';
}
function deriveQuantization(id) {
  const lower = id.toLowerCase();
  if (lower.includes('int8') && lower.includes('quant')) {
    return 'int8-quantized';
  }
  if (lower.includes('int8')) return 'int8';
  if (lower.includes('fp16')) return 'fp16';
  return 'unknown';
}
function deriveSizeTier(id) {
  const lower = id.toLowerCase();
  if (lower.includes('tiny')) return 'tiny';
  if (lower.includes('small')) return 'small';
  if (lower.includes('medium')) return 'medium';
  if (lower.includes('large')) return 'large';
  if (lower.includes('low')) return 'small';
  return 'unknown';
}
function deriveLanguages(id) {
  const tokens = id.split(/[-_]+/g);
  const languages = new Set();
  for (const token of tokens) {
    if (/^[a-z]{2}$/.test(token)) {
      languages.add(token);
      continue;
    }
    if (/^[a-z]{2}[A-Z]{2}$/.test(token)) {
      languages.add(token.slice(0, 2).toLowerCase());
      continue;
    }
    if (/^[a-z]{2}-[A-Z]{2}$/.test(token)) {
      languages.add(token.slice(0, 2).toLowerCase());
    }
  }
  return Array.from(languages);
}
function getAssetExtension(name) {
  if (name.endsWith(MODEL_ARCHIVE_EXT)) return 'tar.bz2';
  if (name.endsWith(MODEL_ONNX_EXT)) return 'onnx';
  return null;
}
function stripAssetExtension(name, ext) {
  const suffix = `.${ext}`;
  return name.endsWith(suffix) ? name.slice(0, -suffix.length) : name;
}
function isAssetSupportedForCategory(category, name, ext) {
  const lower = name.toLowerCase();
  switch (category) {
    case ModelCategory.Tts:
      return ext === 'tar.bz2';
    case ModelCategory.Stt:
      return ext === 'tar.bz2' && !lower.includes('vad');
    case ModelCategory.Vad:
      return ext === 'onnx' && lower.includes('vad');
    case ModelCategory.Diarization:
      return ext === 'tar.bz2';
    case ModelCategory.Enhancement:
      return ext === 'onnx';
    case ModelCategory.Separation:
      return ext === 'tar.bz2' || ext === 'onnx';
    case ModelCategory.Qnn:
      return ext === 'tar.bz2' && lower.includes('sherpa-onnx-qnn') && lower.includes('binary') && lower.includes('seconds');
    default:
      return false;
  }
}
function parseDigestSha256(value) {
  if (!value) return undefined;
  const match = value.match(/^sha256:([a-f0-9]{64})$/i);
  return match?.[1]?.toLowerCase();
}
function toTtsModelMeta(asset, archiveExt) {
  if (archiveExt !== 'tar.bz2') return null;
  const id = stripAssetExtension(asset.name, archiveExt);
  const type = deriveType(id);
  if (type === 'unknown') {
    console.warn('SherpaOnnxModelList: Unsupported model', id);
  }
  return {
    id,
    displayName: deriveDisplayName(id),
    type,
    languages: deriveLanguages(id),
    quantization: deriveQuantization(id),
    sizeTier: deriveSizeTier(id),
    downloadUrl: asset.browser_download_url,
    archiveExt,
    bytes: asset.size,
    sha256: parseDigestSha256(asset.digest),
    category: ModelCategory.Tts
  };
}
function toGenericModelMeta(category, asset, archiveExt) {
  const id = stripAssetExtension(asset.name, archiveExt);
  return {
    id,
    displayName: deriveDisplayName(id),
    downloadUrl: asset.browser_download_url,
    archiveExt,
    bytes: asset.size,
    sha256: parseDigestSha256(asset.digest),
    category
  };
}
function toModelMeta(category, asset) {
  const archiveExt = getAssetExtension(asset.name);
  if (!archiveExt) return null;
  if (!isAssetSupportedForCategory(category, asset.name, archiveExt)) {
    return null;
  }
  if (category === ModelCategory.Tts) {
    return toTtsModelMeta(asset, archiveExt);
  }
  return toGenericModelMeta(category, asset, archiveExt);
}
async function loadCacheFromDisk(category) {
  const memoryCache = memoryCacheByCategory[category];
  if (memoryCache) return memoryCache;
  const cachePath = getCachePath(category);
  const existsResult = await exists(cachePath);
  if (!existsResult) return null;
  const raw = await readFile(cachePath, 'utf8');
  const parsed = JSON.parse(raw);
  memoryCacheByCategory[category] = parsed;
  return parsed;
}
async function saveCache(category, payload) {
  await mkdir(getCacheDir());
  await writeFile(getCachePath(category), JSON.stringify(payload), 'utf8');
  memoryCacheByCategory[category] = payload;
}
function isCacheFresh(payload, ttlMinutes) {
  const updated = new Date(payload.lastUpdated).getTime();
  if (!updated) return false;
  const ageMs = Date.now() - updated;
  return ageMs < ttlMinutes * 60 * 1000;
}
export async function listModelsByCategory(category) {
  const cache = await loadCacheFromDisk(category);
  return cache?.models ?? [];
}
export async function refreshModelsByCategory(category, options) {
  const ttl = options?.cacheTtlMinutes ?? CACHE_TTL_MINUTES;
  const cached = await loadCacheFromDisk(category);
  if (!options?.forceRefresh && cached && isCacheFresh(cached, ttl)) {
    return cached.models;
  }
  try {
    const body = await retryWithBackoff(async () => {
      const response = await fetch(getReleaseUrl(category));
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`);
      }
      return response.json();
    }, {
      maxRetries: options?.maxRetries ?? 3,
      initialDelayMs: 1000,
      signal: options?.signal
    });
    const assets = Array.isArray(body?.assets) ? body.assets : [];
    const models = assets.map(asset => toModelMeta(category, {
      name: asset.name,
      size: asset.size,
      browser_download_url: asset.browser_download_url,
      digest: asset.digest
    })).filter(model => Boolean(model));
    const checksums = await fetchChecksumsFromRelease(category);
    for (const model of models) {
      const archiveFilename = getArchiveFilename(model.id, model.archiveExt);
      const sha256 = checksums.get(archiveFilename);
      if (sha256) {
        model.sha256 = sha256;
      } else if (model.sha256) {
        model.sha256 = model.sha256.toLowerCase();
      }
    }
    const payload = {
      lastUpdated: new Date().toISOString(),
      models
    };
    await saveCache(category, payload);
    emitModelsListUpdated(category, models);
    return models;
  } catch (error) {
    if (cached) {
      console.warn(`Failed to refresh models for ${category}, using cached data:`, error);
      return cached.models;
    }
    throw error;
  }
}
export async function getModelsCacheStatusByCategory(category) {
  const cached = await loadCacheFromDisk(category);
  if (!cached) {
    return {
      lastUpdated: null,
      source: 'cache'
    };
  }
  return {
    lastUpdated: cached.lastUpdated,
    source: 'cache'
  };
}
export async function getModelByIdByCategory(category, id) {
  const models = await listModelsByCategory(category);
  return models.find(model => model.id === id) ?? null;
}
export function clearMemoryCacheForCategory(category) {
  delete memoryCacheByCategory[category];
  delete checksumCacheByCategory[category];
}
//# sourceMappingURL=registry.js.map