/**
 * @module xnest-kit/validation
 * @description Validation utilities for NestJS.
 * Provides quick request validation with i18n error descriptions.
 *
 * @example
 * ```typescript
 * import { configValidation } from 'xnest-kit/validation';
 *
 * const app = await NestFactory.create(AppModule);
 * configValidation(app, { whitelist: true, transform: true });
 * ```
 */

import { Module } from '@nestjs/common';

/**
 * Stub: Validation module.
 * @description Will provide validation pipes with i18n support.
 * @throws {Error} Not yet implemented.
 */
@Module({})
export class ValidationModule {
  constructor() {
    throw new Error(
      '[xnest-kit/validation] ValidationModule is not yet implemented. Coming in v0.1.0-alpha.',
    );
  }
}

/**
 * Stub: Configure validation for a NestJS application.
 * @param _app - The NestJS application instance.
 * @param _options - Validation configuration options (whitelist, transform, i18n, etc.).
 * @throws {Error} Not yet implemented.
 */
export function configValidation(
  _app?: never,
  _options?: Record<string, unknown>,
): never {
  throw new Error(
    '[xnest-kit/validation] configValidation() is not yet implemented. Coming in v0.1.0-alpha.',
  );
}
