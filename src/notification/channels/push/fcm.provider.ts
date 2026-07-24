/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
/**
 * Firebase Cloud Messaging (FCM) push provider.
 *
 * Requires: `npm install firebase-admin`
 *
 * @module
 */

import { lazyImport, isPackageInstalled } from '../../../utils';
import type { NotificationProvider } from '../../notification.constants';
import type { ProviderResult } from '../../notification.constants';
import type { PushSendInput } from './push.channel';

const getFirebaseAdmin = lazyImport<any>('firebase-admin', 'FcmPushProvider');

/**
 * Configuration for the FCM push provider.
 */
export interface FcmPushProviderConfig {
  /**
   * Firebase service account credential object.
   * If not provided, uses Application Default Credentials (ADC).
   */
  credential?: Record<string, unknown>;
  /** Firebase project ID. */
  projectId?: string;
}

/**
 * Push notification provider using Firebase Cloud Messaging.
 *
 * Sends push notifications to iOS, Android, and web via FCM.
 *
 * @example
 * ```typescript
 * import { FcmPushProvider } from 'xnest-kit/notification/channel/push';
 *
 * const provider = new FcmPushProvider({
 *   credential: { /* service account *\/ },
 * });
 * ```
 */
export class FcmPushProvider implements NotificationProvider<PushSendInput> {
  readonly name = 'fcm';
  readonly channel = 'push';

  private initialized = false;

  constructor(private readonly config: FcmPushProviderConfig = {}) {}

  private ensureInitialized(): void {
    if (this.initialized) return;

    if (!isFirebaseAdminInstalled()) {
      throw new Error(
        '[FcmPushProvider] "firebase-admin" is not installed. ' +
          'Run: npm install firebase-admin',
      );
    }
    const admin = getFirebaseAdmin();
    admin.initializeApp({
      credential: this.config.credential,
      projectId: this.config.projectId,
    });
    this.initialized = true;
  }

  async send(input: PushSendInput): Promise<ProviderResult> {
    try {
      this.ensureInitialized();
      const admin = getFirebaseAdmin();
      const message = {
        tokens: input.tokens,
        notification: {
          title: input.title,
          body: input.body,
          ...(input.image ? { imageUrl: input.image } : {}),
        },
        data: input.data as Record<string, string> | undefined,
        android: {
          notification: {
            sound: input.sound,
            ...(input.badge !== undefined
              ? { clickAction: 'OPEN_ACTIVITY' }
              : {}),
          },
        },
        apns: {
          payload: {
            aps: {
              sound: input.sound,
              badge: input.badge,
            },
          },
        },
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      const allSuccess = response.responses.every(
        (r: { success: boolean }) => r.success,
      );
      const anySuccess = response.responses.some(
        (r: { success: boolean }) => r.success,
      );

      if (allSuccess) {
        return {
          success: true,
          providerName: this.name,
          channel: this.channel,
          messageId: `fcm-batch-${input.tokens.length}`,
        };
      }

      if (anySuccess) {
        const errors = response.responses
          .filter((r: { success: boolean }) => !r.success)
          .map(
            (r: { error?: { message: string } }) =>
              r.error?.message ?? 'Unknown error',
          );
        return {
          success: false,
          providerName: this.name,
          channel: this.channel,
          error: `Partial failure: ${errors.join(', ')}`,
        };
      }

      const firstError = response.responses[0]?.error as
        { message: string } | undefined;
      return {
        success: false,
        providerName: this.name,
        channel: this.channel,
        error: firstError?.message ?? 'All tokens failed',
      };
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown FCM error';
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
 * Check if firebase-admin is installed.
 *
 * @returns true if `firebase-admin` can be resolved
 */
export function isFirebaseAdminInstalled(): boolean {
  return isPackageInstalled('firebase-admin');
}
