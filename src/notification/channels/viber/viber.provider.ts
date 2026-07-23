/**
 * Viber Bot API provider.
 *
 * Uses built-in `fetch` for Viber Bot API (no external packages required).
 *
 * @module
 */

import type { NotificationProvider } from '../../notification.constants';
import type { ProviderResult } from '../../notification.constants';
import type { ViberSendInput } from './viber.channel';

/**
 * Configuration for the Viber Bot provider.
 */
export interface ViberBotProviderConfig {
  /** Viber Bot authentication token. */
  authToken: string;
}

/**
 * Viber provider via Viber Bot API.
 *
 * @example
 * ```typescript
 * import { ViberBotProvider } from 'xnest-kit/notification/channel/viber';
 *
 * const provider = new ViberBotProvider({
 *   authToken: process.env.VIBER_BOT_TOKEN,
 * });
 * ```
 */
export class ViberBotProvider implements NotificationProvider<ViberSendInput> {
  readonly name = 'viber-bot';
  readonly channel = 'viber';

  private readonly apiUrl = 'https://chatapi.viber.com/pa/send_message';

  constructor(private readonly config: ViberBotProviderConfig) {}

  async send(input: ViberSendInput): Promise<ProviderResult> {
    try {
      let body: Record<string, unknown>;

      if (input.mediaUrl) {
        body = {
          receiver: input.to,
          min_api_version: 1,
          sender: { name: input.from ?? 'xnest-kit' },
          tracking_data: 'xnest-kit',
          type: 'picture',
          text: input.text,
          media: input.mediaUrl,
          thumbnail: input.thumbnailUrl
            ? { url: input.thumbnailUrl }
            : undefined,
        };
      } else if (input.buttons?.length) {
        body = {
          receiver: input.to,
          min_api_version: 1,
          sender: { name: input.from ?? 'xnest-kit' },
          tracking_data: 'xnest-kit',
          type: 'keyboard',
          keyboard: {
            buttons: input.buttons.map((btn) => ({
              ActionType: btn.url ? 'open-url' : 'reply',
              Text: btn.text,
              ...(btn.url ? { ActionBody: btn.url } : {}),
              ...(btn.actionBody ? { ActionBody: btn.actionBody } : {}),
            })),
          },
          text: input.text,
        };
      } else {
        body = {
          receiver: input.to,
          min_api_version: 1,
          sender: { name: input.from ?? 'xnest-kit' },
          tracking_data: 'xnest-kit',
          type: 'text',
          text: input.text,
        };
      }

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Viber-Auth-Token': this.config.authToken,
        },
        body: JSON.stringify(body),
      });

      const data = (await response.json()) as {
        status: number;
        message: string;
        message_token?: number;
      };

      if (data.status !== 0) {
        return {
          success: false,
          providerName: this.name,
          channel: this.channel,
          error: `Viber API error ${data.status}: ${data.message}`,
        };
      }

      return {
        success: true,
        providerName: this.name,
        channel: this.channel,
        messageId: data.message_token ? String(data.message_token) : undefined,
      };
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown Viber error';
      return {
        success: false,
        providerName: this.name,
        channel: this.channel,
        error: errorMessage,
      };
    }
  }
}
