/**
 * @module xnest-kit/queue
 * @description Queue utilities for NestJS with BullMQ.
 * Provides quick configuration for BullMQ and queue decorators.
 *
 * @example
 * ```typescript
 * import { configQueue } from 'xnest-kit/queue';
 *
 * const app = await NestFactory.create(AppModule);
 * configQueue(app, { redis: { host: 'localhost', port: 6379 } });
 * ```
 */

import { Module } from '@nestjs/common';

/**
 * Stub: Queue module.
 * @description Will provide BullMQ configuration and queue decorators.
 * @throws {Error} Not yet implemented.
 */
@Module({})
export class QueueModule {
  constructor() {
    throw new Error(
      '[xnest-kit/queue] QueueModule is not yet implemented. Coming in v0.1.0-alpha.',
    );
  }
}

/**
 * Stub: Configure BullMQ queues for a NestJS application.
 * @param _app - The NestJS application instance.
 * @param _options - BullMQ configuration options (redis, defaultJobOptions, etc.).
 * @throws {Error} Not yet implemented.
 */
export function configQueue(
  _app?: never,
  _options?: Record<string, unknown>,
): never {
  throw new Error(
    '[xnest-kit/queue] configQueue() is not yet implemented. Coming in v0.1.0-alpha.',
  );
}

/**
 * Stub: Decorator for defining a BullMQ processor.
 * @param _queueName - The name of the queue to process.
 * @throws {Error} Not yet implemented.
 */
export function XProcessor(_queueName?: string): ClassDecorator {
  throw new Error(
    '[xnest-kit/queue] XProcessor decorator is not yet implemented. Coming in v0.1.0-alpha.',
  );
}
