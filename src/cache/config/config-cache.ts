import { Logger } from '@nestjs/common';
import type {
  CacheStoreInstance,
  ConfigCacheOptions,
  CacheStoreOptions,
} from '../types';
import { createMemoryStore, createValkeyStore } from '../adapters';
import { parseCacheUrls } from './parse-cache-urls';

const logger = new Logger('CacheConfig');

/**
 * Configuration result returned by configCache().
 */
export interface CacheConfig {
  /** Created store instances. */
  stores: CacheStoreInstance[];
  /** Primary store (first in list). */
  primary: CacheStoreInstance;
  /** Default TTL in milliseconds. */
  ttl?: number;
  /** Register as global module. */
  isGlobal: boolean;
  /** Allow non-blocking multi-store operations. */
  nonBlocking: boolean;
}

/**
 * Create cache configuration from options or CACHE_URLS env variable.
 *
 * Does NOT create a module — use CacheModule.forRoot() or CacheModule.register() instead.
 *
 * @param options - Configuration options.
 * @returns CacheConfig with created store instances.
 *
 * @example
 * ```typescript
 * const config = configCache({ ttl: 60_000 });
 * console.log(config.stores.length); // number of stores
 * console.log(config.primary.provider); // 'memory' | 'valkey'
 * ```
 */
export function configCache(options: ConfigCacheOptions = {}): CacheConfig {
  const {
    stores: storeOptions,
    ttl,
    isGlobal = true,
    nonBlocking = false,
    silent = false,
  } = options;

  // Parse from env or use provided options
  const resolvedStores: CacheStoreOptions[] =
    storeOptions ?? parseCacheUrls(process.env['CACHE_URLS'], ttl);

  // Create Keyv store instances
  const instances: CacheStoreInstance[] = [];

  for (const storeOpt of resolvedStores) {
    try {
      const instance = createStoreInstance(storeOpt);
      instances.push(instance);
      if (!silent) {
        logger.log(
          `Cache store [${instance.provider}] namespace=${instance.namespace} initialized`,
        );
      }
    } catch (error) {
      if (!silent) {
        logger.error(
          `Failed to create cache store [${storeOpt.provider}]: ${(error as Error).message}`,
        );
      }
    }
  }

  if (instances.length === 0) {
    if (!silent) {
      logger.warn('No cache stores initialized, falling back to memory');
    }
    instances.push(createMemoryStore());
  }

  return {
    stores: instances,
    primary: instances[0],
    ttl,
    isGlobal,
    nonBlocking,
  };
}

/**
 * Create a single store instance from options.
 */
function createStoreInstance(opt: CacheStoreOptions): CacheStoreInstance {
  switch (opt.provider) {
    case 'memory':
      return createMemoryStore(opt.namespace, opt.ttl);
    case 'valkey':
      if (!opt.url) {
        throw new Error('[xnest-kit/cache] Valkey store requires a url');
      }
      return createValkeyStore(opt.url, opt.namespace);
    default: {
      const unknownProvider = String(opt['provider']);
      throw new Error(`[xnest-kit/cache] Unknown provider: ${unknownProvider}`);
    }
  }
}
