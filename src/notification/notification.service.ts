import { Inject, Injectable, Optional } from '@nestjs/common';
import {
  NOTIFICATION_MODULE_OPTIONS,
  NOTIFICATION_QUEUE,
  NOTIFICATION_STORE,
} from '../shared/notification-keys';
import type { NotificationProvider } from './notification.constants';
import type {
  ChannelType,
  ChannelResult,
  NotificationModuleOptions,
  NotificationRecord,
  NotificationResult,
  NotificationStore,
  ProviderSendResult,
  SendInput,
} from './notification.type';

/**
 * Core notification service.
 *
 * Orchestrates single-channel notification delivery through configured
 * providers. Supports 14 channels with optional queuing and persistence.
 *
 * @example
 * ```typescript
 * import { NotificationService } from 'xnest-kit/notification';
 *
 * @Injectable()
 * export class OrderService {
 *   constructor(private readonly notification: NotificationService) {}
 *
 *   async placeOrder(order: Order) {
 *     await this.notification.send('email', {
 *       to: order.email,
 *       subject: 'Order confirmed',
 *       body: '<h1>Thanks!</h1>',
 *     });
 *   }
 * }
 * ```
 */
@Injectable()
export class NotificationService {
  constructor(
    @Inject(NOTIFICATION_MODULE_OPTIONS)
    private readonly options: NotificationModuleOptions,
    @Optional()
    @Inject(NOTIFICATION_STORE)
    private readonly store?: NotificationStore,
    @Optional()
    @Inject(NOTIFICATION_QUEUE)
    private readonly queue?: unknown,
  ) {}

  /**
   * Send a notification through a single channel.
   *
   * The channel is determined by the first key present in the input.
   * Only one channel should be specified per call.
   *
   * When queuing is enabled the notification is delegated to `enqueue()`.
   *
   * @param channel - The notification channel to send through.
   * @param payload - Channel-specific payload (e.g., EmailSendInput for 'email').
   * @param template - Optional template name.
   * @param templateData - Optional template data.
   * @returns Result with per-provider outcomes.
   */
  async send<C extends ChannelType>(
    channel: C,
    payload: SendInput[C],
    options?: { template?: string; templateData?: Record<string, unknown> },
  ): Promise<NotificationResult> {
    if (this.options.queue?.enabled && this.queue) {
      const input: SendInput = { [channel]: payload };
      if (options?.template) input.template = options.template;
      if (options?.templateData) input.templateData = options.templateData;
      await this.enqueue(input);
      return {
        id: undefined,
        success: true,
        channels: [],
        timestamp: new Date(),
      };
    }

    const providers = (
      this.options.providers as Record<
        string,
        NotificationProvider[] | undefined
      >
    )[channel];

    if (!providers?.length) {
      return { success: false, channels: [], timestamp: new Date() };
    }

    const result = await this.sendToProviders(channel, payload, providers);

    const allSuccess = result.results.every((r) => r.success);
    const anySuccess = result.results.some((r) => r.success);
    const status = allSuccess ? 'sent' : anySuccess ? 'partial' : 'failed';

    const notificationResult: NotificationResult = {
      id: undefined,
      success: allSuccess,
      channels: [result],
      timestamp: new Date(),
    };

    if (this.options.storage?.enabled && this.store) {
      const record = await this.store.save({
        channels: [channel],
        status,
        results: [result],
        input: { [channel]: payload },
      });
      notificationResult.id = record.id;
    }

    return notificationResult;
  }

  /**
   * Send a notification through a single channel identified from a combined input.
   *
   * Determines the channel from the first key present in the input.
   *
   * @param input - Combined send input with exactly one channel key set.
   * @returns Result with per-provider outcomes.
   */
  async sendFromInput(input: SendInput): Promise<NotificationResult> {
    const channel = this.determineChannel(input);
    if (!channel) {
      return { success: false, channels: [], timestamp: new Date() };
    }

    const payload = (input as Record<string, unknown>)[channel];
    return this.send(channel, payload, {
      template: input.template,
      templateData: input.templateData,
    });
  }

  /**
   * Enqueue a notification for asynchronous delivery.
   *
   * Requires a Bull/BullMQ queue to have been configured in the module options.
   *
   * @param input - Channel-specific payload to enqueue.
   * @returns Queued status with optional job ID.
   */
  async enqueue(
    input: SendInput,
  ): Promise<{ queued: boolean; jobId?: string }> {
    if (!this.queue) {
      return { queued: false };
    }

    try {
      /* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
      const job = await (this.queue as any).add('notification', input);
      return { queued: true, jobId: job.id as string | undefined };
      /* eslint-enable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    } catch {
      return { queued: false };
    }
  }

  /**
   * Retrieve the current status of a previously sent notification.
   *
   * @param id - The notification record ID.
   * @returns The record or null if not found / no store configured.
   */
  async getStatus(id: string): Promise<NotificationRecord | null> {
    if (!this.store) return null;
    return this.store.findById(id);
  }

  /**
   * Get all notification records for a specific channel.
   *
   * @param channel - The channel type to filter by.
   * @param limit - Maximum number of records to return. @default 20
   * @returns Array of matching notification records.
   */
  async getByChannel(
    channel: ChannelType,
    limit = 20,
  ): Promise<NotificationRecord[]> {
    if (!this.store) return [];
    return this.store.findByChannel(channel, limit);
  }

  /**
   * Get the configured providers for a specific channel.
   *
   * @param channel - The channel type.
   * @returns Array of providers, or empty array if none configured.
   */
  getProviders(channel: ChannelType): NotificationProvider[] {
    return (
      (
        this.options.providers as Record<
          string,
          NotificationProvider[] | undefined
        >
      )[channel] ?? []
    );
  }

  private determineChannel(input: SendInput): ChannelType | undefined {
    const channels: ChannelType[] = [
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
    ];
    for (const ch of channels) {
      if ((input as Record<string, unknown>)[ch]) return ch;
    }
    return undefined;
  }

  private async sendToProviders(
    channel: ChannelType,
    message: unknown,
    providers: NotificationProvider[],
  ): Promise<ChannelResult> {
    const results: ProviderSendResult[] = [];

    for (const provider of providers) {
      try {
        const providerResult = await provider.send(message);
        results.push({ ...providerResult, channel });
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : typeof err === 'string'
              ? err
              : 'Unknown error';
        results.push({
          success: false,
          providerName: provider.name,
          channel,
          error: errorMessage,
        });
      }
    }

    return { channel, results };
  }
}
