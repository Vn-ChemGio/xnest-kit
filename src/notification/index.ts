/**
 * @module xnest-kit/notification
 * @description Notification utilities for NestJS.
 * Provides multi-adapter notification support (email, SMS, push)
 * with professional features like queuing, logging, and retry.
 *
 * @example
 * ```typescript
 * import { configNotification } from 'xnest-kit/notification';
 *
 * const app = await NestFactory.create(AppModule);
 * configNotification(app, { adapters: ['email', 'sms'] });
 * ```
 */

import { Module } from '@nestjs/common';

/**
 * Stub: Notification module.
 * @description Will provide multi-adapter notification with queuing, logging, retry.
 * @throws {Error} Not yet implemented.
 */
@Module({})
export class NotificationModule {
  constructor() {
    throw new Error(
      '[xnest-kit/notification] NotificationModule is not yet implemented. Coming in v0.1.0-alpha.',
    );
  }
}

/**
 * Stub: Configure notification system for a NestJS application.
 * @param _app - The NestJS application instance.
 * @param _options - Notification configuration (adapters, providers, retry, etc.).
 * @throws {Error} Not yet implemented.
 */
export function configNotification(
  _app?: never,
  _options?: Record<string, unknown>,
): never {
  throw new Error(
    '[xnest-kit/notification] configNotification() is not yet implemented. Coming in v0.1.0-alpha.',
  );
}

/**
 * Stub: Email notification adapter.
 * @throws {Error} Not yet implemented.
 */
export class EmailAdapter {
  constructor() {
    throw new Error(
      '[xnest-kit/notification] EmailAdapter is not yet implemented. Coming in v0.1.0-alpha.',
    );
  }
}

/**
 * Stub: SMS notification adapter.
 * @throws {Error} Not yet implemented.
 */
export class SmsAdapter {
  constructor() {
    throw new Error(
      '[xnest-kit/notification] SmsAdapter is not yet implemented. Coming in v0.1.0-alpha.',
    );
  }
}

/**
 * Stub: Push notification adapter.
 * @throws {Error} Not yet implemented.
 */
export class PushAdapter {
  constructor() {
    throw new Error(
      '[xnest-kit/notification] PushAdapter is not yet implemented. Coming in v0.1.0-alpha.',
    );
  }
}
