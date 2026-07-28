/**
 * Discord channel types.
 *
 * Required packages by provider:
 * - `discord.js` (full bot API)
 * - Or use HTTP webhook API directly (no package needed)
 *
 * Use `lazyImport()` from `xnest-kit` to lazy-load providers and
 * avoid errors when the package is not installed.
 *
 * @module
 */

/** Discord channel input via Discord Webhook or Bot API. */
export interface DiscordSendInput {
  /** Webhook URL (for webhook-based sending). */
  webhookUrl?: string;
  /** Channel ID (for bot-based sending). */
  channelId?: string;
  /** Message text or embed description. */
  text?: string;
  /** Embed object for rich messages. */
  embed?: {
    title?: string;
    description?: string;
    color?: number;
    url?: string;
    author?: { name: string; url?: string; iconUrl?: string };
    thumbnail?: { url: string };
    image?: { url: string };
    fields?: Array<{
      name: string;
      value: string;
      inline?: boolean;
    }>;
    footer?: { text: string; iconUrl?: string };
    timestamp?: string;
  };
  /** Username override. */
  username?: string;
  /** Avatar URL override. */
  avatarUrl?: string;
}
