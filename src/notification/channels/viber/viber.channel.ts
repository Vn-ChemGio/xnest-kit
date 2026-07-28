/**
 * Viber channel types.
 *
 * Required packages by provider:
 * - `viber-bot` (official Viber Bot API)
 *
 * Use `lazyImport()` from `xnest-kit` to lazy-load providers and
 * avoid errors when the package is not installed.
 *
 * @module
 */

/** Viber channel input via Viber Bot API. */
export interface ViberSendInput {
  /** Receiver Viber user ID. */
  to: string;
  /** Message text. */
  text: string;
  /** Sender name (displayed in chat). */
  from?: string;
  /** Media URL to send as attachment. */
  mediaUrl?: string;
  /** Thumbnail URL for media messages. */
  thumbnailUrl?: string;
  /** Button array for rich messages. */
  buttons?: Array<{ text: string; url?: string; actionBody?: string }>;
}
