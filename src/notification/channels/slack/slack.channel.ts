/**
 * Slack channel types.
 *
 * Required packages by provider:
 * - `@slack/web-api` (Web API)
 * - `@slack/webhook` (Incoming Webhooks)
 *
 * Use `lazyImport()` from `xnest-kit` to lazy-load providers and
 * avoid errors when the package is not installed.
 *
 * @module
 */

/** Slack channel input. */
export interface SlackSendInput {
  channel: string;
  text: string;
  blocks?: unknown[];
  attachments?: unknown[];
  threadTs?: string;
}
