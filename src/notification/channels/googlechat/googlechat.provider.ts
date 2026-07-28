/**
 * Google Chat webhook provider.
 *
 * Uses built-in `fetch` (no external packages required).
 *
 * @module
 */

import type {
  NotificationProvider,
  ProviderResult,
} from '../../notification.constants';
import type { GoogleChatSendInput } from './googlechat.channel';

/**
 * Google Chat provider via Incoming Webhook.
 *
 * Posts messages to a Google Chat space.
 *
 * @example
 * ```typescript
 * import { GoogleChatWebhookProvider } from 'xnest-kit/notification/channel/googlechat';
 *
 * const provider = new GoogleChatWebhookProvider();
 * await provider.send({
 *   webhookUrl: 'https://chat.googleapis.com/v1/spaces/...',
 *   text: 'Hello from xnest-kit!',
 * });
 * ```
 */
export class GoogleChatWebhookProvider implements NotificationProvider<GoogleChatSendInput> {
  readonly name = 'googlechat-webhook';
  readonly channel = 'googlechat';

  async send(input: GoogleChatSendInput): Promise<ProviderResult> {
    try {
      const url = new URL(input.webhookUrl);
      if (input.threadKey) {
        url.searchParams.set('threadKey', input.threadKey);
      }

      let body: Record<string, unknown>;

      if (input.cards?.length) {
        const cards = input.cards.map((card) => ({
          header: card.header,
          sections: card.sections?.map((section) => ({
            header: section.header,
            widgets: section.widgets,
          })),
        }));
        body = { cards };
      } else {
        body = { text: input.text };
      }

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        return {
          success: false,
          providerName: this.name,
          channel: this.channel,
          error: `Google Chat webhook returned ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        providerName: this.name,
        channel: this.channel,
        messageId: `gchat-${Date.now()}`,
      };
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown Google Chat error';
      return {
        success: false,
        providerName: this.name,
        channel: this.channel,
        error: errorMessage,
      };
    }
  }
}
