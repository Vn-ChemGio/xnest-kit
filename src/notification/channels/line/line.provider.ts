/**
 * LINE Messaging API provider.
 *
 * Uses built-in `fetch` for LINE Messaging API (no external packages required).
 *
 * @module
 */

import type {
  NotificationProvider,
  ProviderResult,
} from '../../notification.constants';
import type { LineSendInput } from './line.channel';

/**
 * Configuration for the LINE Messaging API provider.
 */
export interface LineMessagingProviderConfig {
  /** LINE Channel access token. */
  channelAccessToken: string;
}

/**
 * LINE provider via LINE Messaging API.
 *
 * @example
 * ```typescript
 * import { LineMessagingProvider } from 'xnest-kit/notification/channel/line';
 *
 * const provider = new LineMessagingProvider({
 *   channelAccessToken: process.env.LINE_TOKEN,
 * });
 * ```
 */
export class LineMessagingProvider implements NotificationProvider<LineSendInput> {
  readonly name = 'line-messaging';
  readonly channel = 'line';

  private readonly apiUrl = 'https://api.line.me/v2/bot/message/push';

  constructor(private readonly config: LineMessagingProviderConfig) {}

  async send(input: LineSendInput): Promise<ProviderResult> {
    try {
      const messages: Array<Record<string, unknown>> = [];

      if (input.stickerPackageId && input.stickerId) {
        messages.push({
          type: 'sticker',
          packageId: String(input.stickerPackageId),
          stickerId: String(input.stickerId),
        });
      } else if (input.imageUrl) {
        messages.push({
          type: 'image',
          originalContentUrl: input.imageUrl,
          previewImageUrl: input.imageUrl,
        });
      } else if (input.videoUrl) {
        messages.push({
          type: 'video',
          originalContentUrl: input.videoUrl,
          previewImageUrl: input.videoUrl,
        });
      } else if (input.audioUrl) {
        messages.push({
          type: 'audio',
          originalContentUrl: input.audioUrl,
          duration: 60000,
        });
      } else {
        messages.push({
          type: 'text',
          text: input.text,
        });
      }

      if (input.quickReply?.length) {
        const lastMsg = messages[messages.length - 1];
        lastMsg.quickReply = {
          items: input.quickReply.map((item) => ({
            type: 'action',
            action: {
              type: 'message',
              label: item.text,
              text: item.text,
              ...((item.action as Record<string, unknown>) ?? {}),
            },
          })),
        };
      }

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.channelAccessToken}`,
        },
        body: JSON.stringify({
          to: input.to,
          messages,
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { message?: string };
        return {
          success: false,
          providerName: this.name,
          channel: this.channel,
          error: errorData.message ?? `LINE API returned ${response.status}`,
        };
      }

      return {
        success: true,
        providerName: this.name,
        channel: this.channel,
        messageId: `line-${Date.now()}`,
      };
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown LINE error';
      return {
        success: false,
        providerName: this.name,
        channel: this.channel,
        error: errorMessage,
      };
    }
  }
}
