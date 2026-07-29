/**
 * Injection tokens for queue stores.
 * Use these to inject queue providers in any module.
 */

/**
 * Inject the primary (first) queue store.
 * This is the default queue — typically BullMQ backed by Redis.
 *
 * @example
 * ```typescript
 * import { QUEUE_PRIMARY } from 'xnest-kit/queue';
 *
 * @Injectable()
 * export class EmailService {
 *   constructor(@Inject(QUEUE_PRIMARY) private queue: Queue) {}
 * }
 * ```
 */
export const QUEUE_PRIMARY = 'QUEUE_PRIMARY';

/**
 * Inject ALL queue stores as an array.
 * Ordered by priority: first = primary, last = fallback.
 *
 * @example
 * ```typescript
 * import { QUEUE_ALL } from 'xnest-kit/queue';
 *
 * @Injectable()
 * export class QueueService {
 *   constructor(@Inject(QUEUE_ALL) private queues: unknown[]) {}
 * }
 * ```
 */
export const QUEUE_ALL = 'QUEUE_ALL';
