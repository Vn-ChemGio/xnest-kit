/**
 * @module xnest-kit/cache
 * @description Cache utilities for NestJS.
 * Provides quick configuration for CacheManager with memory and Valkey/Redis support via Keyv.
 *
 * Supports multiple cache stores simultaneously.
 * Parses `CACHE_URLS` environment variable for zero-config setup.
 *
 * @example
 * ```typescript
 * import { configCache, CacheModule } from 'xnest-kit/cache';
 *
 * @Module({
 *   imports: [CacheModule.forRoot(configCache())],
 * })
 * export class AppModule {}
 * ```
 */

export { configCache } from './config/config-cache';
export type { CacheConfig } from './config/config-cache';
export { parseCacheUrls } from './config/parse-cache-urls';
export { CacheModule } from './cache.module';
export { createMemoryStore } from './adapters/memory';
export { createValkeyStore } from './adapters/valkey';
export {
  InjectPrimaryCache,
  InjectAllCacheStores,
  InjectCacheInstance,
} from './decorators';
