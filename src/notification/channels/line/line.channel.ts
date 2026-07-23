/**
 * LINE channel types.
 *
 * Required packages by provider:
 * - `@line/bot-sdk` (official LINE SDK)
 *
 * Use `lazyImport()` from `xnest-kit` to lazy-load providers and
 * avoid errors when the package is not installed.
 *
 * @module
 */

/** LINE channel input via LINE Messaging API. */
export interface LineSendInput {
  /** Receiver LINE user ID or group ID. */
  to: string;
  /** Message text. */
  text: string;
  /** Sticker package ID. */
  stickerPackageId?: number;
  /** Sticker ID. */
  stickerId?: number;
  /** Image URL. */
  imageUrl?: string;
  /** Video URL. */
  videoUrl?: string;
  /** Audio URL. */
  audioUrl?: string;
  /** Quick-reply buttons. */
  quickReply?: Array<{ text: string; action?: unknown }>;
}
