/**
 * WhatsApp Business API Cloud provider.
 *
 * Uses built-in `fetch` for WhatsApp Cloud API (no external packages required).
 *
 * @module
 */

import type {
  NotificationProvider,
  ProviderResult,
} from '../../notification.constants';
import type { WhatsAppSendInput } from './whatsapp.channel';

/**
 * Configuration for the WhatsApp Cloud API provider.
 */
export interface WhatsAppCloudProviderConfig {
  /** WhatsApp Business API version (e.g., 'v18.0'). */
  apiVersion: string;
  /** Phone number ID from Meta Business Suite. */
  phoneNumberId: string;
  /** Permanent or temporary access token. */
  accessToken: string;
}

/**
 * WhatsApp provider via Meta Cloud API.
 *
 * @example
 * ```typescript
 * import { WhatsAppCloudProvider } from 'xnest-kit/notification/channel/whatsapp';
 *
 * const provider = new WhatsAppCloudProvider({
 *   apiVersion: 'v18.0',
 *   phoneNumberId: process.env.WHATSAPP_PHONE_ID,
 *   accessToken: process.env.WHATSAPP_TOKEN,
 * });
 * ```
 */
export class WhatsAppCloudProvider implements NotificationProvider<WhatsAppSendInput> {
  readonly name = 'whatsapp-cloud';
  readonly channel = 'whatsapp';

  constructor(private readonly config: WhatsAppCloudProviderConfig) {}

  async send(input: WhatsAppSendInput): Promise<ProviderResult> {
    const baseUrl = `https://graph.facebook.com/${this.config.apiVersion}/${this.config.phoneNumberId}/messages`;

    try {
      const messagingProduct = 'whatsapp';
      let body: Record<string, unknown>;

      if (input.template) {
        body = {
          messaging_product: messagingProduct,
          to: input.to.replace('+', ''),
          type: 'template',
          template: {
            name: input.template,
            language: { code: 'en' },
            ...(input.templateParams
              ? {
                  components: [
                    {
                      type: 'body',
                      parameters: Object.entries(input.templateParams).map(
                        ([, value]) => ({ type: 'text', text: value }),
                      ),
                    },
                  ],
                }
              : {}),
          },
        };
      } else if (input.mediaUrl) {
        body = {
          messaging_product: messagingProduct,
          to: input.to.replace('+', ''),
          type: 'image',
          image: {
            link: input.mediaUrl,
            ...(input.caption ? { caption: input.caption } : {}),
          },
        };
      } else {
        body = {
          messaging_product: messagingProduct,
          to: input.to.replace('+', ''),
          type: 'text',
          text: { body: input.body },
        };
      }

      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.accessToken}`,
        },
        body: JSON.stringify(body),
      });

      const data = (await response.json()) as {
        messages?: Array<{ id: string }>;
        error?: { message: string };
      };

      if (!response.ok) {
        return {
          success: false,
          providerName: this.name,
          channel: this.channel,
          error: data.error?.message ?? `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        providerName: this.name,
        channel: this.channel,
        messageId: data.messages?.[0]?.id,
      };
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown WhatsApp error';
      return {
        success: false,
        providerName: this.name,
        channel: this.channel,
        error: errorMessage,
      };
    }
  }
}
