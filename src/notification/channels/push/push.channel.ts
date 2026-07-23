/**
 * Push notification channel types.
 *
 * Required packages by provider:
 * - Firebase Cloud Messaging: `firebase-admin`
 * - OneSignal: `onesignal-node`
 * - Web Push (VAPID): `web-push`
 *
 * Use `lazyImport()` from `xnest-kit` to lazy-load providers and
 * avoid errors when the package is not installed.
 *
 * @module
 */

/** Push notification channel input. */
export interface PushSendInput {
  tokens: string[];
  title: string;
  body: string;
  data?: Record<string, unknown>;
  image?: string;
  badge?: number;
  sound?: string;
}
