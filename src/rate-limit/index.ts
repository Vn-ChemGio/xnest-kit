/**
 * @module xnest-kit/rate-limit
 * @description Rate limiting utilities for NestJS.
 * Provides request rate limiting with various strategies.
 *
 * @example
 * ```typescript
 * import { configRateLimit } from 'xnest-kit/rate-limit';
 *
 * const app = await NestFactory.create(AppModule);
 * configRateLimit(app, { windowMs: 60000, max: 100 });
 * ```
 */

import { Module } from '@nestjs/common';

/**
 * Stub: Rate Limit module.
 * @description Will provide request rate limiting with various strategies.
 * @throws {Error} Not yet implemented.
 */
@Module({})
export class RateLimitModule {
  constructor() {
    throw new Error(
      '[xnest-kit/rate-limit] RateLimitModule is not yet implemented. Coming in v0.1.0-alpha.',
    );
  }
}

/**
 * Stub: Configure rate limiting for a NestJS application.
 * @param _app - The NestJS application instance.
 * @param _options - Rate limit configuration options (windowMs, max, strategy, etc.).
 * @throws {Error} Not yet implemented.
 */
export function configRateLimit(
  _app?: never,
  _options?: Record<string, unknown>,
): never {
  throw new Error(
    '[xnest-kit/rate-limit] configRateLimit() is not yet implemented. Coming in v0.1.0-alpha.',
  );
}
