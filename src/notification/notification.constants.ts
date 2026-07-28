/**
 * Core types and constants for the notification module.
 *
 * @module
 */

/** All supported notification channel names. */
export const CHANNELS = [
  'email',
  'sms',
  'push',
  'telegram',
  'slack',
  'teams',
  'googlechat',
  'whatsapp',
  'viber',
  'line',
  'webpush',
  'inapp',
  'discord',
  'wechat',
] as const;

/** Result from a single provider send attempt. */
export interface ProviderResult {
  success: boolean;
  providerName: string;
  channel: string;
  messageId?: string;
  error?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Base interface for notification providers.
 *
 * Implement this to create a custom notification provider.
 *
 * @typeParam T - The input type for this provider's channel.
 *
 * @example
 * ```typescript
 * class SendGridEmailProvider implements NotificationProvider<EmailSendInput> {
 *   readonly name = 'sendgrid';
 *   readonly channel = 'email' as const;
 *
 *   async send(input: EmailSendInput): Promise<ProviderResult> {
 *     // ... send via SendGrid
 *     return { success: true, providerName: this.name, channel: this.channel };
 *   }
 * }
 * ```
 */
export interface NotificationProvider<T = unknown> {
  readonly name: string;
  readonly channel: string;
  send(message: T): Promise<ProviderResult>;
}
