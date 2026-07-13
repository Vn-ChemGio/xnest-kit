/**
 * @module xnest-kit/stripe
 * @description Stripe integration utilities for NestJS.
 * Provides Stripe payment processing helpers and decorators.
 *
 * @example
 * ```typescript
 * import { configStripe } from 'xnest-kit/stripe';
 *
 * const app = await NestFactory.create(AppModule);
 * configStripe(app, { apiKey: process.env.STRIPE_SECRET_KEY });
 * ```
 */

import { Module } from '@nestjs/common';

/**
 * Stub: Stripe module.
 * @description Will provide Stripe payment processing integration.
 * @throws {Error} Not yet implemented.
 */
@Module({})
export class StripeModule {
  constructor() {
    throw new Error(
      '[xnest-kit/stripe] StripeModule is not yet implemented. Coming in v0.1.0-alpha.',
    );
  }
}

/**
 * Stub: Configure Stripe for a NestJS application.
 * @param _app - The NestJS application instance.
 * @param _options - Stripe configuration options (apiKey, webhookSecret, etc.).
 * @throws {Error} Not yet implemented.
 */
export function configStripe(
  _app?: never,
  _options?: Record<string, unknown>,
): never {
  throw new Error(
    '[xnest-kit/stripe] configStripe() is not yet implemented. Coming in v0.1.0-alpha.',
  );
}
