/**
 * @module xnest-kit/logger
 * @description Logger utilities for NestJS.
 * Provides enhanced logging with structured output and multiple transports.
 *
 * @example
 * ```typescript
 * import { configLogger } from 'xnest-kit/logger';
 *
 * const app = await NestFactory.create(AppModule);
 * configLogger(app, { level: 'info', transport: 'pino' });
 * ```
 */

import { Module } from '@nestjs/common';

/**
 * Stub: Logger module.
 * @description Will provide enhanced logging with structured output.
 * @throws {Error} Not yet implemented.
 */
@Module({})
export class LoggerModule {
  constructor() {
    throw new Error(
      '[xnest-kit/logger] LoggerModule is not yet implemented. Coming in v0.1.0-alpha.',
    );
  }
}

/**
 * Stub: Configure logger for a NestJS application.
 * @param _app - The NestJS application instance.
 * @param _options - Logger configuration options (level, transport, format, etc.).
 * @throws {Error} Not yet implemented.
 */
export function configLogger(
  _app?: never,
  _options?: Record<string, unknown>,
): never {
  throw new Error(
    '[xnest-kit/logger] configLogger() is not yet implemented. Coming in v0.1.0-alpha.',
  );
}
