import { Module } from '@nestjs/common';
import type { DynamicModule, Provider } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import type { BullRootModuleOptions } from '@nestjs/bullmq';
import { getQueueToken } from '@nestjs/bullmq';
import { configQueue } from './config';
import type { ConfigQueueOptions } from './types';
import { QUEUE_PRIMARY, QUEUE_ALL } from '../shared/queue-keys';

/**
 * Queue module for NestJS using @nestjs/bullmq.
 *
 * Centralized entry point for declaring Redis connections, queues,
 * and flow producers. All registration happens in one place via
 * `QueueModule.forRoot()` — no need to scatter BullModule calls
 * across feature modules.
 *
 * @example
 * ```typescript
 * import { QueueModule } from 'xnest-kit/queue';
 *
 * @Module({
 *   imports: [
 *     QueueModule.forRoot({
 *       connections: [
 *         { configKey: 'default', url: 'redis://localhost:6379' },
 *       ],
 *       queues: [
 *         { name: 'email' },
 *         { name: 'notifications', defaultJobOptions: { attempts: 3 } },
 *       ],
 *       flows: [
 *         { name: 'order-pipeline' },
 *       ],
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 *
 * @example
 * ```typescript
 * // Using env vars only
 * // QUEUE_URLS=redis://localhost:6379
 * // QUEUE_NAMES=email,notifications
 * @Module({
 *   imports: [QueueModule.forRoot()],
 * })
 * export class AppModule {}
 * ```
 */
@Module({})
export class QueueModule {
  /**
   * Configure queue connections, queues, and flow producers.
   *
   * Accepts explicit options or falls back to environment variables:
   * - `QUEUE_URLS` — pipe-separated Redis URLs
   * - `QUEUE_NAMES` — comma-separated queue names
   * - `QUEUE_FLOWS` — comma-separated flow producer names
   *
   * Internally delegates to `BullModule.forRoot()`, `.registerQueue()`,
   * and `.registerFlowProducer()` to integrate with `@nestjs/bullmq`.
   *
   * @param options - Configuration options.
   * @returns DynamicModule to import in your AppModule.
   */
  static forRoot(options?: ConfigQueueOptions): DynamicModule {
    const config = configQueue(options);

    const imports: DynamicModule[] = [];
    const exports: (string | symbol | DynamicModule)[] = [];

    // Register Redis connections via BullModule.forRoot()
    for (const conn of config.connections) {
      const opts = {
        connection: conn.connection ?? { url: conn.url },
        prefix: conn.prefix,
        defaultJobOptions: conn.defaultJobOptions,
      } as BullRootModuleOptions;

      const configKey = conn.configKey ?? 'default';
      const rootModule =
        configKey === 'default'
          ? BullModule.forRoot(opts)
          : BullModule.forRoot(configKey, opts);

      imports.push(rootModule);
    }

    // Register queues via BullModule.registerQueue()
    if (config.queues.length > 0) {
      const queueModule = BullModule.registerQueue(
        ...config.queues.map((q) => ({
          name: q.name,
          configKey: q.configKey,
          defaultJobOptions: q.defaultJobOptions,
        })),
      );
      imports.push(queueModule);
      exports.push(queueModule);
    }

    // Register flow producers via BullModule.registerFlowProducer()
    if (config.flows.length > 0) {
      const flowModule = BullModule.registerFlowProducer(
        ...config.flows.map((f) => ({
          name: f.name,
          configKey: f.configKey,
        })),
      );
      imports.push(flowModule);
      exports.push(flowModule);
    }

    // Extra injection tokens
    const extraProviders: Provider[] = [];

    if (config.queues.length > 0) {
      const firstQueueName = config.queues[0].name;
      extraProviders.push({
        provide: QUEUE_PRIMARY,
        useExisting: getQueueToken(firstQueueName),
      });
    }

    extraProviders.push({
      provide: QUEUE_ALL,
      useValue: config.queues.map((q) => ({
        name: q.name,
        token: getQueueToken(q.name),
      })),
    });

    return {
      module: QueueModule,
      global: config.isGlobal,
      imports,
      providers: extraProviders,
      exports: [...exports, QUEUE_PRIMARY, QUEUE_ALL],
    };
  }
}
