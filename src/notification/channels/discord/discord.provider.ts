/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
/**
 * Discord provider.
 *
 * - Payload with `webhookUrl` → webhook mode (no token/channelId needed)
 * - Payload without `webhookUrl` → bot mode (requires token in config + channelId in payload)
 *
 * Requires for bot mode: `npm install discord.js`
 * Webhook mode uses built-in `fetch` (no packages required).
 *
 * @module
 */

import { isPackageInstalled, lazyImport } from '../../../utils';
import type { NotificationProvider } from '../../notification.constants';
import type { ProviderResult } from '../../notification.constants';
import type { DiscordSendInput } from './discord.channel';

const getDiscordJs = lazyImport<any>('discord.js', 'DiscordProvider');

/**
 * Configuration for the Discord provider.
 */
export interface DiscordProviderConfig {
  /**
   * Bot token (required for bot-based sending when no webhookUrl is provided).
   */
  token?: string;
  /** Default webhook URL (can be overridden per input). */
  defaultWebhookUrl?: string;
}

/**
 * Unified Discord provider.
 *
 * Automatically routes to webhook or bot API based on the input payload:
 * - If `webhookUrl` is present → uses HTTP webhook (no packages required)
 * - If no `webhookUrl` → uses bot API via `discord.js` (requires token + channelId)
 *
 * @example
 * ```typescript
 * import { DiscordProvider } from 'xnest-kit/notification/channel/discord';
 *
 * // Webhook mode
 * const provider = new DiscordProvider();
 * await provider.send({
 *   webhookUrl: 'https://discord.com/api/webhooks/...',
 *   text: 'Hello from webhook!',
 * });
 *
 * // Bot mode
 * const botProvider = new DiscordProvider({ token: process.env.DISCORD_BOT_TOKEN });
 * await botProvider.send({ channelId: '123456', text: 'Hello from bot!' });
 * ```
 */
export class DiscordProvider implements NotificationProvider<DiscordSendInput> {
  readonly name = 'discord';
  readonly channel = 'discord';

  private client: any = null;

  constructor(private readonly config: DiscordProviderConfig = {}) {}

  async send(input: DiscordSendInput): Promise<ProviderResult> {
    const webhookUrl = input.webhookUrl ?? this.config.defaultWebhookUrl;

    if (webhookUrl) {
      return this.sendWebhook(webhookUrl, input);
    }

    return this.sendBot(input);
  }

  private async sendWebhook(
    webhookUrl: string,
    input: DiscordSendInput,
  ): Promise<ProviderResult> {
    try {
      const body: Record<string, unknown> = {};

      if (input.username) body.username = input.username;
      if (input.avatarUrl) body.avatar_url = input.avatarUrl;

      if (input.embed) {
        body.embeds = [this.buildEmbedPayload(input.embed)];
      } else if (input.text) {
        body.content = input.text;
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        return {
          success: false,
          providerName: this.name,
          channel: this.channel,
          error: `Discord webhook returned ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        providerName: this.name,
        channel: this.channel,
        messageId: `discord-${Date.now()}`,
      };
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown Discord webhook error';
      return {
        success: false,
        providerName: this.name,
        channel: this.channel,
        error: errorMessage,
      };
    }
  }

  private async sendBot(input: DiscordSendInput): Promise<ProviderResult> {
    if (!this.config.token) {
      return {
        success: false,
        providerName: this.name,
        channel: this.channel,
        error:
          'Bot token is required for bot-based sending. Provide token in config or use webhookUrl.',
      };
    }

    if (!input.channelId) {
      return {
        success: false,
        providerName: this.name,
        channel: this.channel,
        error: 'No channelId provided for bot-based sending',
      };
    }

    try {
      const client = await this.getClient();
      const channel = client.channels.cache.get(input.channelId);

      if (!channel) {
        return {
          success: false,
          providerName: this.name,
          channel: this.channel,
          error: `Channel ${input.channelId} not found`,
        };
      }

      const sendOptions: Record<string, unknown> = {};

      if (input.embed) {
        sendOptions.embeds = [this.buildEmbedPayload(input.embed)];
      } else if (input.text) {
        sendOptions.content = input.text;
      }

      await channel.send(sendOptions);

      return {
        success: true,
        providerName: this.name,
        channel: this.channel,
        messageId: `discord-bot-${Date.now()}`,
      };
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown Discord Bot error';
      return {
        success: false,
        providerName: this.name,
        channel: this.channel,
        error: errorMessage,
      };
    }
  }

  private async getClient(): Promise<any> {
    if (this.client) return this.client;

    if (!isDiscordJsInstalled()) {
      throw new Error(
        '[DiscordProvider] "discord.js" is not installed. ' +
          'Run: npm install discord.js',
      );
    }
    const discord = getDiscordJs();
    const Client = discord.Client;
    this.client = new Client({
      intents: [discord.GatewayIntentBits.Guilds],
    });
    await this.client.login(this.config.token);
    return this.client;
  }

  private buildEmbedPayload(
    embed: DiscordSendInput['embed'],
  ): Record<string, unknown> {
    if (!embed) return {};
    return {
      title: embed.title,
      description: embed.description,
      color: embed.color,
      url: embed.url,
      author: embed.author,
      thumbnail: embed.thumbnail,
      image: embed.image,
      fields: embed.fields,
      footer: embed.footer,
      timestamp: embed.timestamp,
    };
  }
}

/**
 * Check if discord.js is installed.
 *
 * @returns true if `discord.js` can be resolved
 */
export function isDiscordJsInstalled(): boolean {
  return isPackageInstalled('discord.js');
}
