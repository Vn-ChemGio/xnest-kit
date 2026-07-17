import type { CacheProvider, CacheStoreOptions } from '../types';

/**
 * Parse CACHE_URLS environment variable into cache store configurations.
 *
 * Format: pipe-separated (`|`) URLs.
 * - Empty string → memory store
 * - Non-empty URL → valkey store (redis://, valkey://, etc.)
 *
 * @param urls - The raw CACHE_URLS string.
 * @param ttl - Default TTL in milliseconds.
 * @returns Array of CacheStoreOptions.
 *
 * @example
 * ```typescript
 * // Single valkey
 * parseCacheUrls('redis://localhost:6379')
 * // → [{ provider: 'valkey', url: 'redis://localhost:6379' }]
 *
 * // Memory + valkey
 * parseCacheUrls('|redis://localhost:6379')
 * // → [{ provider: 'memory' }, { provider: 'valkey', url: 'redis://localhost:6379' }]
 *
 * // Memory only (empty)
 * parseCacheUrls('')
 * // → [{ provider: 'memory' }]
 * ```
 */
export function parseCacheUrls(
  urls: string | undefined,
  ttl?: number,
): CacheStoreOptions[] {
  if (!urls || urls.trim() === '') {
    return [{ provider: 'memory', ttl }];
  }

  const parts = urls.split('|');
  const stores: CacheStoreOptions[] = [];
  let memoryAdded = false;

  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed === '') {
      if (!memoryAdded) {
        stores.push({ provider: 'memory', ttl });
        memoryAdded = true;
      }
    } else {
      const provider: CacheProvider = resolveProvider(trimmed);
      stores.push({ provider, url: trimmed, ttl });
    }
  }

  if (stores.length === 0) {
    return [{ provider: 'memory', ttl }];
  }

  return stores;
}

/**
 * Resolve the provider type from a URL.
 */
function resolveProvider(url: string): CacheProvider {
  const lower = url.toLowerCase();
  if (
    lower.startsWith('redis://') ||
    lower.startsWith('rediss://') ||
    lower.startsWith('valkey://')
  ) {
    return 'valkey';
  }
  return 'valkey';
}
