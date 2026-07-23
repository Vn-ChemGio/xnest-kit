/**
 * In-App notification channel types.
 *
 * Required packages by provider:
 * - None (typically uses WebSocket or database-based implementation)
 *
 * @module
 */

/** In-App notification channel input. */
export interface InAppSendInput {
  /** Target user ID(s). */
  userId: string | string[];
  /** Notification title. */
  title: string;
  /** Notification body text. */
  body: string;
  /** Notification type (e.g., 'info', 'warning', 'error', 'success'). */
  type?: 'info' | 'warning' | 'error' | 'success';
  /** Action URL to navigate to on click. */
  actionUrl?: string;
  /** Icon name or URL. */
  icon?: string;
  /** Metadata for custom rendering. */
  metadata?: Record<string, unknown>;
  /** Expiry date for the notification. */
  expiresAt?: Date;
}
