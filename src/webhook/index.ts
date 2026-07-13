/**
 * @module xnest-kit/webhook
 * @description Webhook utilities for NestJS.
 * Provides webhook handling, verification, and processing.
 *
 * @example
 * ```typescript
 * import { configWebhook } from 'xnest-kit/webhook';
 *
 * const app = await NestFactory.create(AppModule);
 * configWebhook(app, { secret: process.env.WEBHOOK_SECRET });
 * ```
 */

import { Module } from '@nestjs/common';

/**
 * Stub: Webhook module.
 * @description Will provide webhook handling, verification, and processing.
 * @throws {Error} Not yet implemented.
 */
@Module({})
export class WebhookModule {
  constructor() {
    throw new Error(
      '[xnest-kit/webhook] WebhookModule is not yet implemented. Coming in v0.1.0-alpha.',
    );
  }
}

/**
 * Stub: Configure webhooks for a NestJS application.
 * @param _app - The NestJS application instance.
 * @param _options - Webhook configuration options (secret, routes, etc.).
 * @throws {Error} Not yet implemented.
 */
export function configWebhook(
  _app?: never,
  _options?: Record<string, unknown>,
): never {
  throw new Error(
    '[xnest-kit/webhook] configWebhook() is not yet implemented. Coming in v0.1.0-alpha.',
  );
}
