import { Module } from '@nestjs/common';
import type { DynamicModule, Provider } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { CACHE_KEYV_PRIMARY, CACHE_KEYV_ALL } from '../shared/cache-keys';
import { configCache } from './config';
import type { ConfigCacheOptions } from './types';

/**
 * Cache module for NestJS.
 *
 * Use `CacheModule.forRoot()` with `configCache()` to configure cache stores.
 *
 * @example
 * ```typescript
 * import { CacheModule } from 'xnest-kit/cache';
 *
 * @Module({
 *   imports: [CacheModule.forRoot({ ttl: 60_000 })],
 * })
 * export class AppModule {}
 * ```
 *
 * @example
 * ```typescript
 * // With no config (uses defaults / CACHE_URLS env)
 * @Module({
 *   imports: [CacheModule.forRoot()],
 * })
 * export class AppModule {}
 * ```
 */
@Module({})
export class CacheModule {
  /**
   * Configure cache module with options for configCache().
   *
   * @param options - Options passed to configCache().
   * @returns DynamicModule to import in your AppModule.
   */
  static forRoot(options?: ConfigCacheOptions): DynamicModule {
    const config = configCache(options);

    const keyvStores = config.stores.map((s) => s.store);
    const primaryStore = config.primary.store;

    const cacheManagerModule: DynamicModule = NestCacheModule.register({
      stores: keyvStores.length === 1 ? keyvStores[0] : keyvStores,
      ttl: config.ttl,
      isGlobal: config.isGlobal,
      nonBlocking: config.nonBlocking,
    });

    const extraProviders: Provider[] = [
      { provide: CACHE_KEYV_PRIMARY, useValue: primaryStore },
      { provide: CACHE_KEYV_ALL, useValue: keyvStores },
    ];

    return {
      ...cacheManagerModule,
      module: CacheModule,
      providers: [...(cacheManagerModule.providers ?? []), ...extraProviders],
      exports: [
        ...(cacheManagerModule.exports ?? []),
        CACHE_KEYV_PRIMARY,
        CACHE_KEYV_ALL,
      ],
    };
  }
}
