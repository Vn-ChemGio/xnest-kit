/**
 * Injection tokens for the notification module.
 *
 * These tokens are used with `@Inject()` to retrieve services from
 * the NestJS dependency injection container.
 *
 * @module
 */

/** Injection token for the NotificationModule options. */
export const NOTIFICATION_MODULE_OPTIONS = 'NOTIFICATION_MODULE_OPTIONS';

/** Injection token for the optional Bull/BullMQ queue. */
export const NOTIFICATION_QUEUE = 'NOTIFICATION_QUEUE';

/** Injection token for the optional NotificationStore. */
export const NOTIFICATION_STORE = 'NOTIFICATION_STORE';

/** Injection token for the primary email provider (index 0). */
export const NOTIFICATION_EMAIL_PROVIDER = 'NOTIFICATION_EMAIL_PROVIDER';

/** Injection token for the primary SMS provider (index 0). */
export const NOTIFICATION_SMS_PROVIDER = 'NOTIFICATION_SMS_PROVIDER';

/** Injection token for the primary push provider (index 0). */
export const NOTIFICATION_PUSH_PROVIDER = 'NOTIFICATION_PUSH_PROVIDER';

/** Injection token for the primary Telegram provider (index 0). */
export const NOTIFICATION_TELEGRAM_PROVIDER = 'NOTIFICATION_TELEGRAM_PROVIDER';

/** Injection token for the primary Slack provider (index 0). */
export const NOTIFICATION_SLACK_PROVIDER = 'NOTIFICATION_SLACK_PROVIDER';

/** Injection token for the primary Teams provider (index 0). */
export const NOTIFICATION_TEAMS_PROVIDER = 'NOTIFICATION_TEAMS_PROVIDER';

/** Injection token for the primary Google Chat provider (index 0). */
export const NOTIFICATION_GOOGLECHAT_PROVIDER =
  'NOTIFICATION_GOOGLECHAT_PROVIDER';

/** Injection token for the primary WhatsApp provider (index 0). */
export const NOTIFICATION_WHATSAPP_PROVIDER = 'NOTIFICATION_WHATSAPP_PROVIDER';

/** Injection token for the primary Viber provider (index 0). */
export const NOTIFICATION_VIBER_PROVIDER = 'NOTIFICATION_VIBER_PROVIDER';

/** Injection token for the primary LINE provider (index 0). */
export const NOTIFICATION_LINE_PROVIDER = 'NOTIFICATION_LINE_PROVIDER';

/** Injection token for the primary Web Push provider (index 0). */
export const NOTIFICATION_WEBPUSH_PROVIDER = 'NOTIFICATION_WEBPUSH_PROVIDER';

/** Injection token for the primary In-App provider (index 0). */
export const NOTIFICATION_INAPP_PROVIDER = 'NOTIFICATION_INAPP_PROVIDER';

/** Injection token for the primary Discord provider (index 0). */
export const NOTIFICATION_DISCORD_PROVIDER = 'NOTIFICATION_DISCORD_PROVIDER';

/** Injection token for the primary WeChat provider (index 0). */
export const NOTIFICATION_WECHAT_PROVIDER = 'NOTIFICATION_WECHAT_PROVIDER';

/**
 * Helper to build a per-channel provider injection token.
 *
 * @param channel - The channel name.
 * @param index - Provider index within the channel. @default 0
 * @returns The injection token string.
 */
export function notificationProviderToken(channel: string, index = 0): string {
  return `${NOTIFICATION_MODULE_OPTIONS}:provider:${channel}:${index}`;
}
