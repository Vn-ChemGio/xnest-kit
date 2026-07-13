/**
 * @module xnest-kit/activity-feed
 * @description Activity feed utilities for NestJS.
 * Provides activity tracking and feed management.
 *
 * @example
 * ```typescript
 * import { configActivityFeed } from 'xnest-kit/activity-feed';
 *
 * const app = await NestFactory.create(AppModule);
 * configActivityFeed(app, { storage: 'database' });
 * ```
 */

import { Module } from '@nestjs/common';

/**
 * Stub: Activity Feed module.
 * @description Will provide activity tracking and feed management.
 * @throws {Error} Not yet implemented.
 */
@Module({})
export class ActivityFeedModule {
  constructor() {
    throw new Error(
      '[xnest-kit/activity-feed] ActivityFeedModule is not yet implemented. Coming in v0.1.0-alpha.',
    );
  }
}

/**
 * Stub: Configure activity feed for a NestJS application.
 * @param _app - The NestJS application instance.
 * @param _options - Activity feed configuration options.
 * @throws {Error} Not yet implemented.
 */
export function configActivityFeed(
  _app?: never,
  _options?: Record<string, unknown>,
): never {
  throw new Error(
    '[xnest-kit/activity-feed] configActivityFeed() is not yet implemented. Coming in v0.1.0-alpha.',
  );
}
