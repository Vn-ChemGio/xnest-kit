/**
 * Twilio SMS provider.
 *
 * Requires: `npm install twilio`
 *
 * @module
 */

import { lazyImport, isPackageInstalled } from '../../../utils';
import type {
  NotificationProvider,
  ProviderResult,
} from '../../notification.constants';
import type { SmsSendInput } from './sms.channel';

/** Lazy-loaded twilio reference. */
const getTwilio = lazyImport<
  (
    accountSid: string,
    authToken: string,
  ) => {
    messages: {
      create: (options: Record<string, unknown>) => Promise<{ sid: string }>;
    };
  }
>('twilio', 'TwilioSmsProvider');

/**
 * Configuration for the Twilio SMS provider.
 */
export interface TwilioSmsProviderConfig {
  /** Twilio Account SID. */
  accountSid: string;
  /** Twilio Auth Token. */
  authToken: string;
  /** Default sender phone number (E.164 format). */
  from: string;
}

/**
 * SMS provider using Twilio.
 *
 * @example
 * ```typescript
 * import { TwilioSmsProvider } from 'xnest-kit/notification/channel/sms';
 *
 * const provider = new TwilioSmsProvider({
 *   accountSid: process.env.TWILIO_SID,
 *   authToken: process.env.TWILIO_TOKEN,
 *   from: '+1234567890',
 * });
 * ```
 */
export class TwilioSmsProvider implements NotificationProvider<SmsSendInput> {
  readonly name = 'twilio';
  readonly channel = 'sms';

  private client: {
    messages: {
      create: (options: Record<string, unknown>) => Promise<{ sid: string }>;
    };
  } | null = null;

  constructor(private readonly config: TwilioSmsProviderConfig) {}

  async send(input: SmsSendInput): Promise<ProviderResult> {
    if (!isTwilioInstalled()) {
      throw new Error(
        '[TwilioSmsProvider] "twilio" is not installed. ' +
          'Run: npm install twilio',
      );
    }
    const twilio = getTwilio();

    if (!this.client) {
      this.client = twilio(this.config.accountSid, this.config.authToken);
    }

    try {
      const message = await this.client.messages.create({
        from: input.from ?? this.config.from,
        to: input.to,
        body: input.body,
      });

      return {
        success: true,
        providerName: this.name,
        channel: this.channel,

        messageId: message.sid,
      };
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown Twilio error';
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
 * Check if twilio is installed.
 *
 * @returns true if `twilio` can be resolved
 */
export function isTwilioInstalled(): boolean {
  return isPackageInstalled('twilio');
}
