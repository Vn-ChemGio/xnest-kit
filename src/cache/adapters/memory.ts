import Keyv from 'keyv';
import type { CacheStoreInstance } from '../types';

/**
 * Create an in-memory cache store.
 *
 * @param namespace - Key prefix namespace. Default: 'memory'.
 * @param ttl - Default TTL in milliseconds.
 * @returns CacheStoreInstance with in-memory Keyv store.
 *
 * @example
 * ```typescript
 * const store = createMemoryStore('session', 60_000);
 * ```
 */
export function createMemoryStore(
  namespace = 'memory',
  ttl?: number,
): CacheStoreInstance {
  const store = new Keyv({ namespace, ttl });
  return { store, provider: 'memory', namespace };
}
