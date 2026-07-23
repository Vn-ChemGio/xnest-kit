/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
/**
 * Discord webhook / bot provider.
 *
 * Uses built-in `fetch` for webhooks, or requires `discord.js` for bot API.
 *
 * @module
 */

import { isPackageInstalled, lazyImport } from '../../../utils';
import type { NotificationProvider } from '../../notification.constants';
import type { ProviderResult } from '../../notification.constants';
import type { DiscordSendInput } from './discord.channel';

const getDiscordJs = lazyImport<any>('discord.js', 'DiscordBotProvider');

/**
 * Configuration for the Discord Bot provider.
 */
export interface DiscordBotProviderConfig {
  /** Discord bot token. */
  token: string;
}

/**
 * Discord provider via Incoming Webhook (no packages required).
 *
 * @example
 * ```typescript
 * import { DiscordWebhookProvider } from 'xnest-kit/notification/channel/discord';
 *
 * const provider = new DiscordWebhookProvider();
 * await provider.send({
 *   webhookUrl: 'https://discord.com/api/webhooks/...',
 *   text: 'Hello from xnest-kit!',
 * });
 * ```
 */
export class DiscordWebhookProvider implements NotificationProvider<DiscordSendInput> {
  readonly name = 'discord-webhook';
  readonly channel = 'discord';

  async send(input: DiscordSendInput): Promise<ProviderResult> {
    if (!input.webhookUrl) {
      return {
        success: false,
        providerName: this.name,
        channel: this.channel,
        error: 'No webhookUrl provided',
      };
    }

    try {
      const body: Record<string, unknown> = {};

      if (input.username) body.username = input.username;
      if (input.avatarUrl) body.avatar_url = input.avatarUrl;

      if (input.embed) {
        const embed: Record<string, unknown> = {};
        if (input.embed.title) embed.title = input.embed.title;
        if (input.embed.description)
          embed.description = input.embed.description;
        if (input.embed.color) embed.color = input.embed.color;
        if (input.embed.url) embed.url = input.embed.url;
        if (input.embed.author) embed.author = input.embed.author;
        if (input.embed.thumbnail) embed.thumbnail = input.embed.thumbnail;
        if (input.embed.image) embed.image = input.embed.image;
        if (input.embed.fields) embed.fields = input.embed.fields;
        if (input.embed.footer) embed.footer = input.embed.footer;
        if (input.embed.timestamp) embed.timestamp = input.embed.timestamp;
        body.embeds = [embed];
      } else if (input.text) {
        body.content = input.text;
      }

      const response = await fetch(input.webhookUrl, {
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
        err instanceof Error ? err.message : 'Unknown Discord error';
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
 * Discord provider via Bot API (requires discord.js).
 *
 * @example
 * ```typescript
 * import { DiscordBotProvider } from 'xnest-kit/notification/channel/discord';
 *
 * const provider = new DiscordBotProvider({ token: process.env.DISCORD_BOT_TOKEN });
 * await provider.send({ channelId: '123456', text: 'Hello!' });
 * ```
 */
export class DiscordBotProvider implements NotificationProvider<DiscordSendInput> {
  readonly name = 'discord-bot';
  readonly channel = 'discord';

  private client: any = null;

  constructor(private readonly config: DiscordBotProviderConfig) {}

  private async getClient(): Promise<any> {
    if (this.client) return this.client;

    const discord = getDiscordJs();
    const Client = discord.Client;
    this.client = new Client({
      intents: [discord.GatewayIntentBits.Guilds],
    });
    await this.client.login(this.config.token);
    return this.client;
  }

  async send(input: DiscordSendInput): Promise<ProviderResult> {
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
        sendOptions.embeds = [
          {
            title: input.embed.title,
            description: input.embed.description,
            color: input.embed.color,
            url: input.embed.url,
            author: input.embed.author,
            thumbnail: input.embed.thumbnail,
            image: input.embed.image,
            fields: input.embed.fields,
            footer: input.embed.footer,
            timestamp: input.embed.timestamp,
          },
        ];
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
}

/**
 * Check if discord.js is installed.
 *
 * @returns true if `discord.js` can be resolved
 */
export function isDiscordJsInstalled(): boolean {
  return isPackageInstalled('discord.js');
}
