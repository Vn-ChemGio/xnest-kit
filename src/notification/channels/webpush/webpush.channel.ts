/**
 * Web Push channel types.
 *
 * Required packages by provider:
 * - `web-push` (VAPID-based Web Push)
 *
 * Use `lazyImport()` from `xnest-kit` to lazy-load providers and
 * avoid errors when the package is not installed.
 *
 * @module
 */

/** Web Push channel input via Web Push API (VAPID). */
export interface WebPushSendInput {
  /** Push subscription endpoint URL. */
  endpoint: string;
  /** P256dh key for encryption. */
  keys: { p256dh: string; auth: string };
  /** Notification title. */
  title: string;
  /** Notification body text. */
  body: string;
  /** Notification icon URL. */
  icon?: string;
  /** Notification badge URL. */
  badge?: string;
  /** Arbitrary data payload. */
  data?: Record<string, unknown>;
  /** URL to open when notification is clicked. */
  url?: string;
  /** Time-to-live in seconds. */
  ttl?: number;
}
