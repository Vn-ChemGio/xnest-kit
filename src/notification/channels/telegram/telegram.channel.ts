/**
 * Telegram channel types.
 *
 * Required packages by provider:
 * - `node-telegram-bot-api`
 * - Or use HTTP API directly (no package needed)
 *
 * Use `lazyImport()` from `xnest-kit` to lazy-load providers and
 * avoid errors when the package is not installed.
 *
 * @module
 */

/** Telegram channel input. */
export interface TelegramSendInput {
  chatId: string | number;
  text: string;
  parseMode?: 'HTML' | 'MarkdownV2';
  buttons?: Array<Array<{ text: string; url?: string; callbackData?: string }>>;
  photo?: string;
  document?: string;
}
