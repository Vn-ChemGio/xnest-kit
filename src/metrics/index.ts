/**
 * @module xnest-kit/metrics
 * @description Metrics utilities for NestJS.
 * Provides Prometheus-compatible metrics collection and exposure.
 *
 * @example
 * ```typescript
 * import { configMetrics } from 'xnest-kit/metrics';
 *
 * const app = await NestFactory.create(AppModule);
 * configMetrics(app, { defaultLabels: { app: 'my-api' } });
 * ```
 */

import { Module } from '@nestjs/common';

/**
 * Stub: Metrics module.
 * @description Will provide Prometheus metrics collection and exposure.
 * @throws {Error} Not yet implemented.
 */
@Module({})
export class MetricsModule {
  constructor() {
    throw new Error(
      '[xnest-kit/metrics] MetricsModule is not yet implemented. Coming in v0.1.0-alpha.',
    );
  }
}

/**
 * Stub: Configure metrics for a NestJS application.
 * @param _app - The NestJS application instance.
 * @param _options - Metrics configuration options (defaultLabels, prefix, etc.).
 * @throws {Error} Not yet implemented.
 */
export function configMetrics(
  _app?: never,
  _options?: Record<string, unknown>,
): never {
  throw new Error(
    '[xnest-kit/metrics] configMetrics() is not yet implemented. Coming in v0.1.0-alpha.',
  );
}
