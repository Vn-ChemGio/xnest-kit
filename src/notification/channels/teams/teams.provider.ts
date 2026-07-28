/**
 * Microsoft Teams webhook provider.
 *
 * Uses built-in `fetch` (no external packages required).
 *
 * @module
 */

import type {
  NotificationProvider,
  ProviderResult,
} from '../../notification.constants';
import type { TeamsSendInput } from './teams.channel';

/**
 * Microsoft Teams provider via Incoming Webhook.
 *
 * Posts Adaptive Card or simple messages to a Teams channel.
 *
 * @example
 * ```typescript
 * import { TeamsWebhookProvider } from 'xnest-kit/notification/channel/teams';
 *
 * const provider = new TeamsWebhookProvider();
 * await provider.send({
 *   webhookUrl: 'https://outlook.office.com/webhook/...',
 *   text: 'Hello from xnest-kit!',
 * });
 * ```
 */
export class TeamsWebhookProvider implements NotificationProvider<TeamsSendInput> {
  readonly name = 'teams-webhook';
  readonly channel = 'teams';

  async send(input: TeamsSendInput): Promise<ProviderResult> {
    try {
      const payload: Record<string, unknown> = {
        '@type': 'MessageCard',
        '@context': 'http://schema.org/extensions',
        themeColor: input.themeColor ?? '0076D7',
        summary: input.summary ?? input.text,
        sections: [],
      };

      if (input.title) {
        (payload.sections as unknown[]).push({
          activityTitle: input.title,
          text: input.text,
        });
      } else {
        payload.text = input.text;
      }

      if (input.sections?.length) {
        for (const section of input.sections) {
          (payload.sections as unknown[]).push({
            activityTitle: section.activityTitle,
            activitySubtitle: section.activitySubtitle,
            activityText: section.activityText,
            facts: section.facts,
            text: section.text,
          });
        }
      }

      const response = await fetch(input.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        return {
          success: false,
          providerName: this.name,
          channel: this.channel,
          error: `Teams webhook returned ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        providerName: this.name,
        channel: this.channel,
        messageId: `teams-${Date.now()}`,
      };
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown Teams error';
      return {
        success: false,
        providerName: this.name,
        channel: this.channel,
        error: errorMessage,
      };
    }
  }
}
