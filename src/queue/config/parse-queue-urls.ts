import type { QueueConnectionConfig } from '../types';

/**
 * Parse QUEUE_URLS environment variable into connection configurations.
 *
 * Format: pipe-separated (`|`) Redis URLs.
 * - Empty string → single connection to redis://localhost:6379
 * - Single URL → one connection with configKey 'default'
 * - Multiple URLs → each gets its own configKey
 *   (first = 'default', subsequent = 'queue-1', 'queue-2', ...)
 *
 * @param urls - The raw QUEUE_URLS string.
 * @returns Array of QueueConnectionConfig.
 *
 * @example
 * ```typescript
 * // Single Redis
 * parseQueueUrls('redis://localhost:6379')
 * // → [{ configKey: 'default', url: 'redis://localhost:6379' }]
 *
 * // Multiple Redis instances
 * parseQueueUrls('redis://host1:6379|redis://host2:6380')
 * // → [
 * //     { configKey: 'default', url: 'redis://host1:6379' },
 * //     { configKey: 'queue-1', url: 'redis://host2:6380' },
 * //   ]
 *
 * // Empty (defaults)
 * parseQueueUrls('')
 * // → [{ configKey: 'default', url: 'redis://localhost:6379' }]
 * ```
 */
export function parseQueueUrls(
  urls: string | undefined,
): QueueConnectionConfig[] {
  if (!urls || urls.trim() === '') {
    return [{ configKey: 'default', url: 'redis://localhost:6379' }];
  }

  const parts = urls.split('|');
  const connections: QueueConnectionConfig[] = [];
  let defaultAdded = false;

  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed === '') {
      if (!defaultAdded) {
        connections.push({
          configKey: 'default',
          url: 'redis://localhost:6379',
        });
        defaultAdded = true;
      }
    } else {
      const configKey = defaultAdded
        ? `queue-${connections.length}`
        : 'default';
      const conn: QueueConnectionConfig = { configKey, url: trimmed };
      connections.push(conn);
      if (!defaultAdded) defaultAdded = true;
    }
  }

  return connections;
}
