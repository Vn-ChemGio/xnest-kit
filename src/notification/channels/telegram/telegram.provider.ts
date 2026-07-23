/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
/**
 * Telegram Bot API provider.
 *
 * Requires: `npm install node-telegram-bot-api`
 *
 * @module
 */

import { lazyImport, isPackageInstalled } from '../../../utils';
import type { NotificationProvider } from '../../notification.constants';
import type { ProviderResult } from '../../notification.constants';
import type { TelegramSendInput } from './telegram.channel';

/** Lazy-loaded node-telegram-bot-api reference. */
const getTelegramBot = lazyImport<
  new (
    token: string,
    options?: Record<string, unknown>,
  ) => Record<string, unknown>
>('node-telegram-bot-api', 'TelegramBotProvider');

/**
 * Configuration for the Telegram Bot provider.
 */
export interface TelegramBotProviderConfig {
  /** Telegram Bot API token. */
  token: string;
  /** Default chat ID to send messages to. */
  defaultChatId?: string | number;
  /** Parse mode. @default 'HTML' */
  parseMode?: 'HTML' | 'MarkdownV2';
}

/**
 * Telegram Bot API provider.
 *
 * @example
 * ```typescript
 * import { TelegramBotProvider } from 'xnest-kit/notification/channel/telegram';
 *
 * const provider = new TelegramBotProvider({
 *   token: process.env.TELEGRAM_BOT_TOKEN,
 * });
 * ```
 */
export class TelegramBotProvider implements NotificationProvider<TelegramSendInput> {
  readonly name = 'telegram-bot';
  readonly channel = 'telegram';

  private bot: any = null;

  constructor(private readonly config: TelegramBotProviderConfig) {}

  private getBot(): any {
    if (!this.bot) {
      const TelegramBot = getTelegramBot();
      this.bot = new TelegramBot(this.config.token, { polling: false });
    }
    return this.bot;
  }

  async send(input: TelegramSendInput): Promise<ProviderResult> {
    const bot = this.getBot();
    const chatId = input.chatId ?? this.config.defaultChatId;

    if (!chatId) {
      return {
        success: false,
        providerName: this.name,
        channel: this.channel,
        error: 'No chatId provided and no defaultChatId configured',
      };
    }

    try {
      const options: Record<string, unknown> = {
        parse_mode: input.parseMode ?? this.config.parseMode ?? 'HTML',
      };

      if (input.buttons?.length) {
        const keyboard = input.buttons.map((row) =>
          row.map((btn) => {
            const button: Record<string, unknown> = { text: btn.text };
            if (btn.url) button.url = btn.url;
            if (btn.callbackData) button.callback_data = btn.callbackData;
            return button;
          }),
        );
        options.reply_markup = JSON.stringify({ inline_keyboard: keyboard });
      }

      let result: { message_id: number };

      if (input.photo) {
        result = await bot.sendPhoto(chatId, input.photo, options);
      } else if (input.document) {
        result = await bot.sendDocument(chatId, input.document, options);
      } else {
        result = await bot.sendMessage(chatId, input.text, options);
      }

      return {
        success: true,
        providerName: this.name,
        channel: this.channel,
        messageId: String(result.message_id),
      };
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown Telegram error';
      return {
        success: false,
        providerName: this.name,
        channel: this.channel,
        error: errorMessage,
      };
    }
  }
}

/**
 * Check if node-telegram-bot-api is installed.
 *
 * @returns true if `node-telegram-bot-api` can be resolved
 */
export function isTelegramBotInstalled(): boolean {
  return isPackageInstalled('node-telegram-bot-api');
}
