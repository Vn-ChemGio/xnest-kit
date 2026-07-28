import {
  Inject,
  Injectable,
  Logger,
  Optional,
  OnModuleInit,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import {
  NOTIFICATION_MODULE_OPTIONS,
  NOTIFICATION_QUEUE,
  NOTIFICATION_STORE,
} from '../shared/notification-keys';
import { CHANNELS, type NotificationProvider } from './notification.constants';
import type {
  ChannelType,
  ChannelSendInput,
  ChannelResult,
  DiscordSendInput,
  EmailSendInput,
  GoogleChatSendInput,
  InAppSendInput,
  LineSendInput,
  NotificationDiagnostics,
  NotificationModuleOptions,
  NotificationRecord,
  NotificationResult,
  NotificationStore,
  ProviderSendResult,
  PushSendInput,
  SendInput,
  SlackSendInput,
  SmsSendInput,
  TeamsSendInput,
  TelegramSendInput,
  ViberSendInput,
  WeChatSendInput,
  WhatsAppSendInput,
  WebPushSendInput,
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
export class NotificationService implements OnModuleInit {
  private readonly logger = new Logger(NotificationService.name);
  private store?: NotificationStore;

  constructor(
    @Inject(NOTIFICATION_MODULE_OPTIONS)
    private readonly options: NotificationModuleOptions,
    @Optional()
    @Inject(NOTIFICATION_STORE)
    injectedStore?: NotificationStore,
    @Optional()
    @Inject(NOTIFICATION_QUEUE)
    private readonly queue?: unknown,
    private readonly moduleRef?: ModuleRef,
  ) {
    this.store = injectedStore;
  }

  /**
   * Validate module initialization at startup.
   *
   * Logs warnings when storage or queue is enabled but the
   * corresponding provider was not resolved. This makes
   * misconfiguration visible immediately instead of silently
   * failing on the first `send()` call.
   *
   * Also dynamically creates the store from `useClass` when it was
   * provided inside a factory return (not registered as a top-level
   * NestJS provider).
   */
  async onModuleInit(): Promise<void> {
    // Dynamic store creation for useClass in factory-resolved options
    if (
      this.options.storage?.enabled &&
      !this.store &&
      this.options.storage.useClass &&
      this.moduleRef
    ) {
      try {
        this.store = (await this.moduleRef.create(
          this.options.storage.useClass,
        )) as NotificationStore;
        this.logger.log('Notification store initialized via useClass');
      } catch (error) {
        this.logger.error(
          'Failed to initialize notification store from useClass: ' +
            (error instanceof Error ? error.message : String(error)),
        );
      }
    }

    if (this.options.storage?.enabled && !this.store) {
      this.logger.warn(
        'Notification storage is enabled but the store provider was not resolved. ' +
          'Logs will NOT be persisted. Make sure the NOTIFICATION_STORE provider ' +
          'is registered in your module.',
      );
    }

    if (this.options.queue?.enabled && !this.queue) {
      this.logger.warn(
        'Notification queue is enabled but the queue provider was not resolved. ' +
          'Notifications will be sent synchronously. Make sure the NOTIFICATION_QUEUE ' +
          'provider is registered in your module.',
      );
    }
  }

  /**
   * Return the current initialization status of the notification service.
   *
   * Useful for health-check endpoints or debugging module wiring.
   *
   * @returns Diagnostic object describing provider/store/queue status.
   */
  getDiagnostics(): NotificationDiagnostics {
    const providers: Record<string, number> = {};
    const channelProviders = this.options.providers as Record<
      string,
      unknown[] | undefined
    >;

    for (const [channel, list] of Object.entries(channelProviders)) {
      providers[channel] = list?.length ?? 0;
    }

    return {
      storageEnabled: this.options.storage?.enabled ?? false,
      storageInitialized: this.store !== undefined && this.store !== null,
      queueEnabled: this.options.queue?.enabled ?? false,
      queueInitialized: this.queue !== undefined && this.queue !== null,
      providers,
    };
  }

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
   * @param options - Optional template configuration.
   * @returns Result with per-provider outcomes.
   */
  async send(
    channel: 'email',
    payload: EmailSendInput,
    options?: { template?: string; templateData?: Record<string, unknown> },
  ): Promise<NotificationResult>;
  async send(
    channel: 'sms',
    payload: SmsSendInput,
    options?: { template?: string; templateData?: Record<string, unknown> },
  ): Promise<NotificationResult>;
  async send(
    channel: 'push',
    payload: PushSendInput,
    options?: { template?: string; templateData?: Record<string, unknown> },
  ): Promise<NotificationResult>;
  async send(
    channel: 'telegram',
    payload: TelegramSendInput,
    options?: { template?: string; templateData?: Record<string, unknown> },
  ): Promise<NotificationResult>;
  async send(
    channel: 'slack',
    payload: SlackSendInput,
    options?: { template?: string; templateData?: Record<string, unknown> },
  ): Promise<NotificationResult>;
  async send(
    channel: 'teams',
    payload: TeamsSendInput,
    options?: { template?: string; templateData?: Record<string, unknown> },
  ): Promise<NotificationResult>;
  async send(
    channel: 'googlechat',
    payload: GoogleChatSendInput,
    options?: { template?: string; templateData?: Record<string, unknown> },
  ): Promise<NotificationResult>;
  async send(
    channel: 'whatsapp',
    payload: WhatsAppSendInput,
    options?: { template?: string; templateData?: Record<string, unknown> },
  ): Promise<NotificationResult>;
  async send(
    channel: 'viber',
    payload: ViberSendInput,
    options?: { template?: string; templateData?: Record<string, unknown> },
  ): Promise<NotificationResult>;
  async send(
    channel: 'line',
    payload: LineSendInput,
    options?: { template?: string; templateData?: Record<string, unknown> },
  ): Promise<NotificationResult>;
  async send(
    channel: 'webpush',
    payload: WebPushSendInput,
    options?: { template?: string; templateData?: Record<string, unknown> },
  ): Promise<NotificationResult>;
  async send(
    channel: 'inapp',
    payload: InAppSendInput,
    options?: { template?: string; templateData?: Record<string, unknown> },
  ): Promise<NotificationResult>;
  async send(
    channel: 'discord',
    payload: DiscordSendInput,
    options?: { template?: string; templateData?: Record<string, unknown> },
  ): Promise<NotificationResult>;
  async send(
    channel: 'wechat',
    payload: WeChatSendInput,
    options?: { template?: string; templateData?: Record<string, unknown> },
  ): Promise<NotificationResult>;
  async send<C extends ChannelType>(
    channel: C,
    payload: SendInput[C],
    options?: { template?: string; templateData?: Record<string, unknown> },
  ): Promise<NotificationResult>;
  async send(
    channel: ChannelType,
    payload: ChannelSendInput,
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
      throw new Error(
        `No providers configured for channel "${channel}". ` +
          `Add a provider in NotificationModule.forRoot({ providers: { ${channel}: [...] } }).`,
      );
    }

    let result: ChannelResult;
    let status: 'sent' | 'partial' | 'failed';
    let providerError: unknown;

    try {
      result = await this.sendToProviders(channel, payload, providers);
      const allSuccess = result.results.every((r) => r.success);
      const anySuccess = result.results.some((r) => r.success);
      status = allSuccess ? 'sent' : anySuccess ? 'partial' : 'failed';
    } catch (error) {
      providerError = error;
      result = {
        channel,
        results: [
          {
            channel,
            success: false,
            providerName: providers[0]?.name ?? 'unknown',
            messageId: undefined,
            error: error instanceof Error ? error.message : String(error),
          },
        ],
      };
      status = 'failed';
    }

    const notificationResult: NotificationResult = {
      id: undefined,
      success: status === 'sent',
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

    if (providerError) throw providerError;
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
      const queue = this.queue as {
        add: (name: string, data: unknown) => Promise<{ id?: string }>;
      };
      const job = await queue.add('notification', input);
      return { queued: true, jobId: job.id };
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
    for (const ch of CHANNELS) {
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
      const providerResult = await provider.send(message);
      results.push({ ...providerResult, channel });
    }

    return { channel, results };
  }
}
