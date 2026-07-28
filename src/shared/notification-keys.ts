/**
 * Injection tokens for the notification module.
 *
 * @module
 */

/** Injection token for the NotificationModule options. */
export const NOTIFICATION_MODULE_OPTIONS = 'NOTIFICATION_MODULE_OPTIONS';

/** Injection token for the optional Bull/BullMQ queue. */
export const NOTIFICATION_QUEUE = 'NOTIFICATION_QUEUE';

/** Injection token for the optional NotificationStore. */
export const NOTIFICATION_STORE = 'NOTIFICATION_STORE';

/**
 * Build a per-channel provider injection token.
 *
 * @param channel - The channel name.
 * @param index - Provider index within the channel. @default 0
 * @returns The injection token string.
 */
export function notificationProviderToken(channel: string, index = 0): string {
  return `${NOTIFICATION_MODULE_OPTIONS}:provider:${channel}:${index}`;
}
