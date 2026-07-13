/**
 * @module xnest-kit/cache
 * @description Cache utilities for NestJS.
 * Provides quick configuration for CacheManager with Redis/Valkey support.
 *
 * @example
 * ```typescript
 * import { configCache } from 'xnest-kit/cache';
 *
 * const app = await NestFactory.create(AppModule);
 * configCache(app, { store: 'redis', host: 'localhost', port: 6379 });
 * ```
 */

import { Module } from '@nestjs/common';

/**
 * Stub: Cache module.
 * @description Will provide CacheManager configuration with Redis/Valkey services.
 * @throws {Error} Not yet implemented.
 */
@Module({})
export class CacheModule {
  constructor() {
    throw new Error(
      '[xnest-kit/cache] CacheModule is not yet implemented. Coming in v0.1.0-alpha.',
    );
  }
}

/**
 * Stub: Configure CacheManager for a NestJS application.
 * @param _app - The NestJS application instance.
 * @param _options - Cache configuration options (store, host, port, ttl, etc.).
 * @throws {Error} Not yet implemented.
 */
export function configCache(
  _app?: never,
  _options?: Record<string, unknown>,
): never {
  throw new Error(
    '[xnest-kit/cache] configCache() is not yet implemented. Coming in v0.1.0-alpha.',
  );
}

/**
 * Stub: Redis service for cache operations.
 * @description Will provide Redis/Valkey integration with built-in features.
 * @throws {Error} Not yet implemented.
 */
export class RedisService {
  constructor() {
    throw new Error(
      '[xnest-kit/cache] RedisService is not yet implemented. Coming in v0.1.0-alpha.',
    );
  }
}
