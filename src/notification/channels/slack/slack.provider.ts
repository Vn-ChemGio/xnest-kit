/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
/**
 * Slack provider via Web API.
 *
 * Requires: `npm install @slack/web-api`
 *
 * @module
 */

import { lazyImport, isPackageInstalled } from '../../../utils';
import type { NotificationProvider } from '../../notification.constants';
import type { ProviderResult } from '../../notification.constants';
import type { SlackSendInput } from './slack.channel';

/** Lazy-loaded @slack/web-api reference. */
const getSlackWebApi = lazyImport<
  new (token: string) => Record<string, unknown>
>('@slack/web-api', 'SlackProvider');

/**
 * Configuration for the Slack provider.
 */
export interface SlackProviderConfig {
  /** Slack Bot OAuth token (xoxb-...). */
  token: string;
  /** Default channel to post messages to. */
  defaultChannel?: string;
}

/**
 * Slack provider using the Slack Web API.
 *
 * @example
 * ```typescript
 * import { SlackProvider } from 'xnest-kit/notification/channel/slack';
 *
 * const provider = new SlackProvider({
 *   token: process.env.SLACK_BOT_TOKEN,
 *   defaultChannel: '#general',
 * });
 * ```
 */
export class SlackProvider implements NotificationProvider<SlackSendInput> {
  readonly name = 'slack';
  readonly channel = 'slack';

  private client: any = null;

  constructor(private readonly config: SlackProviderConfig) {}

  private getClient(): any {
    if (!this.client) {
      if (!isSlackWebApiInstalled()) {
        throw new Error(
          '[SlackProvider] "@slack/web-api" is not installed. ' +
            'Run: npm install @slack/web-api',
        );
      }
      const SlackWebApi = getSlackWebApi();
      this.client = new SlackWebApi(this.config.token);
    }
    return this.client;
  }

  async send(input: SlackSendInput): Promise<ProviderResult> {
    const client = this.getClient();
    const channel = input.channel ?? this.config.defaultChannel;

    if (!channel) {
      return {
        success: false,
        providerName: this.name,
        channel: this.channel,
        error: 'No channel provided and no defaultChannel configured',
      };
    }

    try {
      const params: Record<string, unknown> = {
        channel,
        text: input.text,
      };

      if (input.blocks) params.blocks = input.blocks;
      if (input.attachments) params.attachments = input.attachments;
      if (input.threadTs) params.thread_ts = input.threadTs;

      const result = await client.chat.postMessage(params);

      if (!result.ok) {
        return {
          success: false,
          providerName: this.name,
          channel: this.channel,
          error: 'Slack API returned ok: false',
        };
      }

      return {
        success: true,
        providerName: this.name,
        channel: this.channel,

        messageId: result.ts as string,
      };
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown Slack error';
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
 * Check if @slack/web-api is installed.
 *
 * @returns true if `@slack/web-api` can be resolved
 */
export function isSlackWebApiInstalled(): boolean {
  return isPackageInstalled('@slack/web-api');
}
