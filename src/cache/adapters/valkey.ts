/* eslint-disable @typescript-eslint/no-require-imports */

import type Keyv from 'keyv';
import type { CacheStoreInstance } from '../types';

/**
 * Create a Valkey (or Redis) cache store using @keyv/redis.
 *
 * @param url - Connection URL, e.g. 'redis://localhost:6379'.
 * @param namespace - Key prefix namespace. Default: 'valkey'.
 * @returns CacheStoreInstance with Keyv store backed by Valkey/Redis.
 *
 * @example
 * ```typescript
 * const store = createValkeyStore('redis://localhost:6379', 'sessions');
 * ```
 */
export function createValkeyStore(
  url: string,
  namespace = 'valkey',
): CacheStoreInstance {
  // Lazy require — @keyv/redis is an optional peer dependency
  const { createKeyv } = require('@keyv/redis') as {
    createKeyv: (url: string, opts?: Record<string, unknown>) => Keyv;
  };

  const store = createKeyv(url, { namespace });

  return { store, provider: 'valkey', namespace };
}
