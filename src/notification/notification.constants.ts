/**
 * Core types for notification providers.
 *
 * @module
 */

/**
 * Result from a single provider send attempt.
 */
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
 * Implement this to create a custom notification provider
 * (e.g., SendGrid, Twilio, FCM, etc.).
 *
 * @typeParam T - The input type for this provider's channel.
 *
 * @example
 * ```typescript
 * import type { NotificationProvider } from 'xnest-kit/notification';
 *
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
