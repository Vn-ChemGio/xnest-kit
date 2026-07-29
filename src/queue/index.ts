/**
 * @module xnest-kit/queue
 * @description Queue utilities for NestJS with BullMQ via @nestjs/bullmq.
 *
 * Provides centralized queue configuration, multi-connection support,
 * and decorator-friendly queue/flow registration.
 *
 * @example
 * ```typescript
 * import { QueueModule } from 'xnest-kit/queue';
 *
 * @Module({
 *   imports: [
 *     QueueModule.forRoot({
 *       connections: [{ url: 'redis://localhost:6379' }],
 *       queues: [{ name: 'email' }],
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 */

import { isPackageInstalled } from '../utils';

if (!isPackageInstalled('@nestjs/bullmq')) {
  throw new Error(
    'xnest-kit/queue requires @nestjs/bullmq to be installed. Run: npm install @nestjs/bullmq',
  );
}

export { configQueue } from './config/config-queue';
export { parseQueueUrls } from './config/parse-queue-urls';
export { QueueModule } from './queue.module';
export { QUEUE_PRIMARY, QUEUE_ALL } from '../shared/queue-keys';
export type {
  QueueConnectionConfig,
  QueueRegisterConfig,
  FlowProducerRegisterConfig,
  ConfigQueueOptions,
  ResolvedQueueConfig,
} from './types';
