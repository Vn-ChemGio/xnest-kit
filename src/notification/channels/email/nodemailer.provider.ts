/**
 * Nodemailer (SMTP) email provider.
 *
 * Requires: `npm install nodemailer @types/nodemailer`
 *
 * @module
 */

import { lazyImport, isPackageInstalled } from '../../../utils';
import type { NotificationProvider } from '../../notification.constants';
import type { ProviderResult } from '../../notification.constants';
import type { EmailSendInput } from './email.channel';

/** Lazy-loaded nodemailer reference. */
const getNodemailer = lazyImport<{
  createTransport: (options: Record<string, unknown>) => {
    sendMail: (
      options: Record<string, unknown>,
    ) => Promise<{ messageId: string }>;
    close: () => void;
  };
}>('nodemailer', 'NodemailerEmailProvider');

/**
 * Configuration for the Nodemailer SMTP provider.
 */
export interface NodemailerEmailProviderConfig {
  /** SMTP host. */
  host: string;
  /** SMTP port. @default 587 */
  port?: number;
  /** Whether to use TLS. @default false */
  secure?: boolean;
  /** SMTP auth user. */
  user?: string;
  /** SMTP auth pass. */
  pass?: string;
  /** Default sender email address. */
  from?: string;
}

/**
 * Email provider using Nodemailer (SMTP).
 *
 * Supports any SMTP server (Gmail, Outlook, custom, etc.).
 *
 * @example
 * ```typescript
 * import { NodemailerEmailProvider } from 'xnest-kit/notification/channel/email';
 *
 * const provider = new NodemailerEmailProvider({
 *   host: 'smtp.gmail.com',
 *   port: 587,
 *   secure: false,
 *   user: 'user@gmail.com',
 *   pass: 'app-password',
 *   from: 'user@gmail.com',
 * });
 * ```
 */
export class NodemailerEmailProvider implements NotificationProvider<EmailSendInput> {
  readonly name = 'nodemailer';
  readonly channel = 'email';

  private transport: {
    sendMail: (
      options: Record<string, unknown>,
    ) => Promise<{ messageId: string }>;
    close: () => void;
  } | null = null;

  constructor(private readonly config: NodemailerEmailProviderConfig) {}

  async send(input: EmailSendInput): Promise<ProviderResult> {
    const nodemailer = getNodemailer();

    this.transport = nodemailer.createTransport({
      host: this.config.host,
      port: this.config.port ?? 587,
      secure: this.config.secure ?? false,
      auth:
        this.config.user && this.config.pass
          ? { user: this.config.user, pass: this.config.pass }
          : undefined,
    });

    try {
      const info = await this.transport.sendMail({
        from: input.from ?? this.config.from,
        to: Array.isArray(input.to) ? input.to.join(', ') : input.to,
        cc: input.cc?.join(', '),
        bcc: input.bcc?.join(', '),
        subject: input.subject,
        text: input.text ?? input.body,
        html: input.body,
        replyTo: input.replyTo,
        attachments: input.attachments,
      });

      return {
        success: true,
        providerName: this.name,
        channel: this.channel,
        messageId: info.messageId,
      };
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown SMTP error';
      return {
        success: false,
        providerName: this.name,
        channel: this.channel,
        error: errorMessage,
      };
    } finally {
      this.transport?.close();
      this.transport = null;
    }
  }
}

/**
 * Check if nodemailer is installed.
 *
 * @returns true if `nodemailer` can be resolved
 */
export function isNodemailerInstalled(): boolean {
  return isPackageInstalled('nodemailer');
}
