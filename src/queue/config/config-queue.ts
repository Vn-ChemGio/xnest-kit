import type {
  ConfigQueueOptions,
  QueueConnectionConfig,
  QueueRegisterConfig,
  FlowProducerRegisterConfig,
  ResolvedQueueConfig,
} from '../types';
import { parseQueueUrls } from './parse-queue-urls';

/**
 * Resolve queue configuration from options or environment variables.
 *
 * Merges explicit options with env var fallbacks:
 * - connections ← options.connections ?? QUEUE_URLS
 * - queues     ← options.queues ?? QUEUE_NAMES
 * - flows      ← options.flows ?? QUEUE_FLOWS
 *
 * Does NOT create a module — use QueueModule.forRoot() instead.
 *
 * @param options - Configuration options.
 * @returns ResolvedQueueConfig with connections, queues, and flows.
 *
 * @example
 * ```typescript
 * const config = configQueue({
 *   connections: [{ configKey: 'default', url: 'redis://localhost:6379' }],
 *   queues: [{ name: 'email' }, { name: 'notifications' }],
 * });
 * console.log(config.connections.length); // 1
 * console.log(config.queues.length);      // 2
 * ```
 */
export function configQueue(
  options: ConfigQueueOptions = {},
): ResolvedQueueConfig {
  const { connections: connOpts, queues, flows, isGlobal = true } = options;

  const connections: QueueConnectionConfig[] =
    connOpts ?? parseQueueUrls(process.env['QUEUE_URLS']);

  const resolvedQueues: QueueRegisterConfig[] =
    queues ?? parseQueueNames(process.env['QUEUE_NAMES']);

  const resolvedFlows: FlowProducerRegisterConfig[] =
    flows ?? parseFlowNames(process.env['QUEUE_FLOWS']);

  if (connections.length === 0) {
    throw new Error(
      '[xnest-kit/queue] No queue connections configured. Check YOUR_QUEUE_URLS env or connections option.',
    );
  }

  return {
    connections,
    queues: resolvedQueues,
    flows: resolvedFlows,
    isGlobal,
  };
}

/**
 * Parse QUEUE_NAMES env var (comma-separated) into queue registrations.
 */
function parseQueueNames(raw: string | undefined): QueueRegisterConfig[] {
  if (!raw || raw.trim() === '') return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((name) => ({ name }));
}

/**
 * Parse QUEUE_FLOWS env var (comma-separated) into flow producer registrations.
 */
function parseFlowNames(raw: string | undefined): FlowProducerRegisterConfig[] {
  if (!raw || raw.trim() === '') return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((name) => ({ name }));
}
