/**
 * Email channel types.
 *
 * Required packages by provider:
 * - SMTP: `nodemailer`
 * - SendGrid: `@sendgrid/mail`
 * - Mailgun: `form-data`, `mailgun.js`
 * - AWS SES: `@aws-sdk/client-ses`
 *
 * Use `lazyImport()` from `xnest-kit` to lazy-load providers and
 * avoid errors when the package is not installed.
 *
 * @module
 */

/** Email channel input. */
export interface EmailSendInput {
  to: string | string[];
  subject: string;
  body: string;
  text?: string;
  cc?: string[];
  bcc?: string[];
  from?: string;
  replyTo?: string;
  attachments?: Array<{ filename: string; content: Buffer | string }>;
}
