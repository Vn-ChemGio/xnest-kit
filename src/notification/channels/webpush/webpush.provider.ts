/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
/**
 * Web Push (VAPID) provider.
 *
 * Requires: `npm install web-push`
 *
 * @module
 */

import { lazyImport, isPackageInstalled } from '../../../utils';
import type { NotificationProvider } from '../../notification.constants';
import type { ProviderResult } from '../../notification.constants';
import type { WebPushSendInput } from './webpush.channel';

const getWebPush = lazyImport<any>('web-push', 'WebPushProvider');

/**
 * Configuration for the Web Push provider.
 */
export interface WebPushProviderConfig {
  /** VAPID subject URL (e.g., 'mailto:admin@example.com'). */
  subject: string;
  /** VAPID public key. */
  publicKey: string;
  /** VAPID private key. */
  privateKey: string;
}

/**
 * Web Push provider using VAPID.
 *
 * @example
 * ```typescript
 * import { WebPushProvider } from 'xnest-kit/notification/channel/webpush';
 *
 * const provider = new WebPushProvider({
 *   subject: 'mailto:admin@example.com',
 *   publicKey: process.env.VAPID_PUBLIC_KEY,
 *   privateKey: process.env.VAPID_PRIVATE_KEY,
 * });
 * ```
 */
export class WebPushProvider implements NotificationProvider<WebPushSendInput> {
  readonly name = 'web-push';
  readonly channel = 'webpush';

  private initialized = false;

  constructor(private readonly config: WebPushProviderConfig) {}

  private ensureInitialized(): void {
    if (this.initialized) return;

    if (!isWebPushInstalled()) {
      throw new Error(
        '[WebPushProvider] "web-push" is not installed. ' +
          'Run: npm install web-push',
      );
    }
    const webPush = getWebPush();
    webPush.setVapidDetails(
      this.config.subject,
      this.config.publicKey,
      this.config.privateKey,
    );
    this.initialized = true;
  }

  async send(input: WebPushSendInput): Promise<ProviderResult> {
    this.ensureInitialized();
    const webPush = getWebPush();

    try {
      const payload = JSON.stringify({
        title: input.title,
        body: input.body,
        icon: input.icon,
        badge: input.badge,
        data: input.data,
        url: input.url,
      });

      const options: Record<string, unknown> = {};
      if (input.ttl !== undefined) options.TTL = input.ttl;

      const result = await webPush.sendNotification(
        input.endpoint,
        payload,
        options,
      );

      return {
        success: true,
        providerName: this.name,
        channel: this.channel,
        messageId: `webpush-${result.statusCode as number}`,
      };
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown Web Push error';
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
 * Check if web-push is installed.
 *
 * @returns true if `web-push` can be resolved
 */
export function isWebPushInstalled(): boolean {
  return isPackageInstalled('web-push');
}
