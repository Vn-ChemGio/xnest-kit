/* eslint-disable @typescript-eslint/no-require-imports */

import { Module } from '@nestjs/common';
import type { DynamicModule, Provider } from '@nestjs/common';
import {
  CACHE_KEYV_PRIMARY,
  CACHE_KEYV_ALL,
  CACHE_INSTANCE,
} from '../shared/cache-keys';
import type { CacheConfig } from './config/config-cache';

/**
 * Cache module for NestJS.
 *
 * Use `CacheModule.forRoot()` with `configCache()` to configure cache stores.
 *
 * @example
 * ```typescript
 * import { CacheModule, configCache } from 'xnest-kit/cache';
 *
 * @Module({
 *   imports: [CacheModule.forRoot(configCache())],
 * })
 * export class AppModule {}
 * ```
 */
@Module({})
export class CacheModule {
  /**
   * Configure cache module with a CacheConfig from configCache().
   *
   * @param config - Result of configCache() call.
   * @returns DynamicModule to import in your AppModule.
   */
  static forRoot(config: CacheConfig): DynamicModule {
    // Lazy require — @nestjs/cache-manager is optional
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { CacheModule: NestCacheModule } = require('@nestjs/cache-manager');

    const keyvStores = config.stores.map((s) => s.store);
    const primaryStore = config.primary.store;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const cacheManagerModule: DynamicModule = NestCacheModule.register({
      stores: keyvStores.length === 1 ? keyvStores[0] : keyvStores,
      ttl: config.ttl,
      isGlobal: config.isGlobal,
      nonBlocking: config.nonBlocking,
    });

    const extraProviders: Provider[] = [
      { provide: CACHE_KEYV_PRIMARY, useValue: primaryStore },
      { provide: CACHE_KEYV_ALL, useValue: keyvStores },
      {
        provide: CACHE_INSTANCE,
        inject: ['CACHE_MANAGER'],
        useFactory: (cacheManager: unknown) => cacheManager,
      },
    ];

    return {
      ...cacheManagerModule,
      module: CacheModule,
      providers: [...(cacheManagerModule.providers ?? []), ...extraProviders],
      exports: [CACHE_KEYV_PRIMARY, CACHE_KEYV_ALL, CACHE_INSTANCE],
    };
  }
}
