import type Keyv from 'keyv';
import type { CacheStoreInstance } from '../types';

/**
 * Create a Valkey (or Redis) cache store using @keyv/valkey.
 *
 * @param url - Connection URL, e.g. 'valkey://localhost:6379' or 'redis://localhost:6379'.
 * @param namespace - Key prefix namespace. Default: 'valkey'.
 * @returns CacheStoreInstance with Keyv store backed by Valkey/Redis.
 *
 * @example
 * ```typescript
 * const store = createValkeyStore('valkey://localhost:6379', 'sessions');
 * ```
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
  // Lazy require — @keyv/valkey is an optional peer dependency
  let createKeyv: (url: string, opts?: Record<string, unknown>) => Keyv;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    ({ createKeyv } = require('@keyv/valkey') as {
      createKeyv: (url: string, opts?: Record<string, unknown>) => Keyv;
    });
  } catch {
    throw new Error(
      '[xnest-kit/cache] @keyv/valkey is required for valkey provider. Install it: npm install @keyv/valkey',
    );
  }

  const store = createKeyv(url, { namespace });

  return { store, provider: 'valkey', namespace };
}
