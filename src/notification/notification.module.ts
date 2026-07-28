import {
  type DynamicModule,
  type Provider,
  type Type,
  Module,
  Global,
} from '@nestjs/common';
import {
  NOTIFICATION_MODULE_OPTIONS,
  NOTIFICATION_QUEUE,
  NOTIFICATION_STORE,
  notificationProviderToken,
} from '../shared/notification-keys';
import { NotificationService } from './notification.service';
import type {
  NotificationModuleOptions,
  NotificationModuleAsyncOptions,
  NotificationStore,
} from './notification.type';
import { CHANNELS, type NotificationProvider } from './notification.constants';

function isProviderInstance(value: unknown): value is NotificationProvider {
  return (
    typeof value === 'object' &&
    value !== null &&
    'send' in value &&
    typeof (value as NotificationProvider).send === 'function'
  );
}

/**
 * Resolve a channel entry: if it's a config object, dynamically import
 * and instantiate the corresponding provider. If it's already a provider
 * instance, return as-is.
 */
async function resolveProvider(
  channel: string,
  entry: unknown,
): Promise<NotificationProvider> {
  if (isProviderInstance(entry)) return entry;

  const Ctor = await getChannelConstructor(channel);
  if (!Ctor) return entry as NotificationProvider;
  return new Ctor(entry) as NotificationProvider;
}

async function getChannelConstructor(
  channel: string,
): Promise<new (...args: any[]) => any> {
  const map: Record<string, () => Promise<{ new (...args: any[]): any }>> = {
    email: () =>
      import('./channels/email/nodemailer.provider').then(
        (m) => m.NodemailerEmailProvider,
      ),
    sms: () =>
      import('./channels/sms/twilio.provider').then((m) => m.TwilioSmsProvider),
    push: () =>
      import('./channels/push/fcm.provider').then((m) => m.FcmPushProvider),
    telegram: () =>
      import('./channels/telegram/telegram.provider').then(
        (m) => m.TelegramBotProvider,
      ),
    slack: () =>
      import('./channels/slack/slack.provider').then((m) => m.SlackProvider),
    teams: () =>
      import('./channels/teams/teams.provider').then(
        (m) => m.TeamsWebhookProvider,
      ),
    googlechat: () =>
      import('./channels/googlechat/googlechat.provider').then(
        (m) => m.GoogleChatWebhookProvider,
      ),
    whatsapp: () =>
      import('./channels/whatsapp/whatsapp.provider').then(
        (m) => m.WhatsAppCloudProvider,
      ),
    viber: () =>
      import('./channels/viber/viber.provider').then((m) => m.ViberBotProvider),
    line: () =>
      import('./channels/line/line.provider').then(
        (m) => m.LineMessagingProvider,
      ),
    webpush: () =>
      import('./channels/webpush/webpush.provider').then(
        (m) => m.WebPushProvider,
      ),
    inapp: () =>
      import('./channels/inapp/inapp.provider').then(
        (m) => m.InAppSocketProvider,
      ),
    discord: () =>
      import('./channels/discord/discord.provider').then(
        (m) => m.DiscordProvider,
      ),
    wechat: () =>
      import('./channels/wechat/wechat.provider').then(
        (m) => m.WeChatOfficialProvider,
      ),
  };
  return map[channel]?.();
}

async function resolveAllProviders(
  rawProviders: Record<string, unknown[] | undefined>,
): Promise<Record<string, NotificationProvider[]>> {
  const resolved: Record<string, NotificationProvider[]> = {};

  await Promise.all(
    Object.entries(rawProviders).map(async ([channel, list]) => {
      if (list) {
        resolved[channel] = await Promise.all(
          list.map((entry) => resolveProvider(channel, entry)),
        );
      }
    }),
  );

  return resolved;
}

function buildStorageProviders(
  storage?: NotificationModuleOptions['storage'],
): Provider[] {
  if (!storage?.enabled) return [];
  if (storage.useClass)
    return [{ provide: NOTIFICATION_STORE, useClass: storage.useClass }];
  if (storage.inject)
    return [
      {
        provide: NOTIFICATION_STORE,
        useFactory: (s: NotificationStore): NotificationStore => s,
        inject: [storage.inject as string | symbol],
      },
    ];
  return [];
}

function buildQueueProviders(
  queue?: NotificationModuleOptions['queue'],
): Provider[] {
  if (!queue?.enabled) return [];
  if (queue.useClass)
    return [{ provide: NOTIFICATION_QUEUE, useClass: queue.useClass }];
  if (queue.inject)
    return [
      {
        provide: NOTIFICATION_QUEUE,
        useFactory: (q: unknown): unknown => q,
        inject: [queue.inject as string | symbol],
      },
    ];
  return [];
}

/**
 * NestJS DynamicModule for multi-channel notifications.
 *
 * Supports 14 channels with pluggable providers, optional queuing,
 * and persistence.
 *
 * @example
 * ```typescript
 * @Module({
 *   imports: [
 *     NotificationModule.forRoot({
 *       providers: {
 *         email: [{ host: 'smtp.example.com', port: 587 }],
 *       },
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 *
 * @example
 * ```typescript
 * // With TypeORM storage
 * @Module({
 *   imports: [
 *     NotificationModule.forRoot({
 *       providers: { email: [{ host: 'smtp.example.com' }] },
 *       storage: { enabled: true, useClass: TypeOrmNotificationStore },
 *       imports: [TypeOrmModule.forFeature([NotificationLogEntity])],
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 */
@Global()
@Module({})
export class NotificationModule {
  /**
   * Configure the notification module synchronously.
   *
   * @param options - Module configuration options.
   * @returns DynamicModule to import in your AppModule.
   */
  static forRoot(options: NotificationModuleOptions): DynamicModule {
    const optionsProvider: Provider = {
      provide: NOTIFICATION_MODULE_OPTIONS,
      useFactory: async (): Promise<NotificationModuleOptions> => {
        const resolvedProviders = await resolveAllProviders(options.providers);
        return {
          ...options,
          providers: resolvedProviders,
        };
      },
    };

    const providers: Provider[] = [
      optionsProvider,
      NotificationService,
      ...buildStorageProviders(options.storage),
      ...buildQueueProviders(options.queue),
    ];

    // Per-channel provider tokens for @InjectNotificationProvider decorator
    for (const channel of CHANNELS) {
      const entries = (
        options.providers as Record<string, unknown[] | undefined>
      )[channel];
      if (entries) {
        entries.forEach((_entry, index) => {
          providers.push({
            provide: notificationProviderToken(channel, index),
            useFactory: async (): Promise<NotificationProvider> =>
              resolveProvider(channel, entries[index]),
          });
        });
      }
    }

    return {
      module: NotificationModule,
      global: options.global ?? true,
      imports: (options.imports ?? []) as (Type<unknown> | DynamicModule)[],
      providers,
      exports: [NotificationService],
    };
  }

  /**
   * Configure the notification module asynchronously.
   *
   * @param options - Async module configuration.
   * @returns DynamicModule to import in your AppModule.
   */
  static forRootAsync(options: NotificationModuleAsyncOptions): DynamicModule {
    const asyncOptionsProvider: Provider = {
      provide: NOTIFICATION_MODULE_OPTIONS,
      useFactory: async (
        ...args: unknown[]
      ): Promise<NotificationModuleOptions> => {
        const opts = await options.useFactory(...args);
        const resolvedProviders = await resolveAllProviders(opts.providers);
        return {
          ...opts,
          storage: opts.storage ?? options.storage,
          queue: opts.queue ?? options.queue,
          providers: resolvedProviders,
        };
      },
      inject: (options.inject ?? []) as (string | symbol)[],
    };

    return {
      module: NotificationModule,
      global: options.global ?? true,
      imports: (options.imports ?? []) as (Type<unknown> | DynamicModule)[],
      providers: [
        asyncOptionsProvider,
        NotificationService,
        ...buildStorageProviders(options.storage),
        ...buildQueueProviders(options.queue),
      ],
      exports: [NotificationService],
    };
  }
}
