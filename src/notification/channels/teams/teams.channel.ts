/**
 * Microsoft Teams channel types.
 *
 * Required packages by provider:
 * - None (uses built-in `fetch` for webhook-based sending)
 *
 * @module
 */

/** Microsoft Teams channel input. */
export interface TeamsSendInput {
  webhookUrl: string;
  title?: string;
  text: string;
  summary?: string;
  themeColor?: string;
  sections?: Array<{
    activityTitle?: string;
    activitySubtitle?: string;
    activityText?: string;
    facts?: Array<{ name: string; value: string }>;
    text?: string;
  }>;
}
