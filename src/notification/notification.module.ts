import {
  type DynamicModule,
  type Provider,
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
} from './notification.type';
import type { NotificationProvider } from './notification.constants';
import { NodemailerEmailProvider } from './channels/email/nodemailer.provider';
import { TwilioSmsProvider } from './channels/sms/twilio.provider';
import { FcmPushProvider } from './channels/push/fcm.provider';
import { TelegramBotProvider } from './channels/telegram/telegram.provider';
import { SlackProvider } from './channels/slack/slack.provider';
import { TeamsWebhookProvider } from './channels/teams/teams.provider';
import { GoogleChatWebhookProvider } from './channels/googlechat/googlechat.provider';
import { WhatsAppCloudProvider } from './channels/whatsapp/whatsapp.provider';
import { ViberBotProvider } from './channels/viber/viber.provider';
import { LineMessagingProvider } from './channels/line/line.provider';
import { WebPushProvider } from './channels/webpush/webpush.provider';
import { InAppSocketProvider } from './channels/inapp/inapp.provider';
import { DiscordProvider } from './channels/discord/discord.provider';
import { WeChatOfficialProvider } from './channels/wechat/wechat.provider';

/** All supported channel names. */
const CHANNELS = [
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
] as const;

/** Channel → default provider constructor mapping. */
const CHANNEL_CONSTRUCTOR: Record<string, new (...args: any[]) => any> = {
  email: NodemailerEmailProvider,
  sms: TwilioSmsProvider,
  push: FcmPushProvider,
  telegram: TelegramBotProvider,
  slack: SlackProvider,
  teams: TeamsWebhookProvider,
  googlechat: GoogleChatWebhookProvider,
  whatsapp: WhatsAppCloudProvider,
  viber: ViberBotProvider,
  line: LineMessagingProvider,
  webpush: WebPushProvider,
  inapp: InAppSocketProvider,
  discord: DiscordProvider,
  wechat: WeChatOfficialProvider,
};

/**
 * Check if a value is an already-instantiated provider (has a `send` method).
 */
function isProviderInstance(value: unknown): value is NotificationProvider {
  return (
    typeof value === 'object' &&
    value !== null &&
    'send' in value &&
    typeof (value as NotificationProvider).send === 'function'
  );
}

/**
 * Resolve a channel entry: if it's a config object, instantiate the
 * corresponding provider. If it's already a provider instance, return as-is.
 */
function resolveProvider(
  channel: string,
  entry: unknown,
): NotificationProvider {
  if (isProviderInstance(entry)) return entry;

  // Discord: config-based → DiscordProvider handles token internally
  if (
    channel === 'discord' &&
    entry &&
    typeof entry === 'object' &&
    'token' in entry
  ) {
    return new DiscordProvider(
      entry as import('./channels/discord/discord.provider').DiscordProviderConfig,
    );
  }

  const Ctor = CHANNEL_CONSTRUCTOR[channel];
  if (!Ctor) return entry as NotificationProvider;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return new Ctor(entry);
}

/**
 * NestJS DynamicModule for multi-channel notifications.
 *
 * Supports 14 channels with pluggable providers, optional queuing,
 * and persistence.
 *
 * **Queue & Storage**: When enabled, provide the implementations as
 * providers in your module using the same injection token strings
 * passed in `queue.inject` / `storage.inject`.
 *
 * @example
 * ```typescript
 * import { Module } from '@nestjs/common';
 * import { NotificationModule } from 'xnest-kit/notification';
 *
 * @Module({
 *   imports: [
 *     NotificationModule.forRoot({
 *       providers: {
 *         email: [new SmtpEmailProvider({ host: 'smtp.example.com' })],
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
 *       providers: { email: [...] },
 *       storage: { enabled: true, inject: 'NOTIFICATION_TYPEORM_STORE' },
 *     }),
 *     TypeOrmModule.forFeature([NotificationLogEntity]),
 *   ],
 *   providers: [
 *     {
 *       provide: 'NOTIFICATION_TYPEORM_STORE',
 *       useClass: TypeOrmNotificationStore,
 *     },
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
    // Resolve all channel entries (config → provider instance)
    const resolvedProviders: Record<string, NotificationProvider[]> = {};
    for (const channel of CHANNELS) {
      const entries = (
        options.providers as Record<string, unknown[] | undefined>
      )[channel];
      if (entries) {
        resolvedProviders[channel] = entries.map((entry) =>
          resolveProvider(channel, entry),
        );
      }
    }

    const resolvedOptions: NotificationModuleOptions = {
      ...options,
      providers: resolvedProviders,
    };

    const providers: Provider[] = [
      { provide: NOTIFICATION_MODULE_OPTIONS, useValue: resolvedOptions },
      NotificationService,
    ];

    // Register per-channel provider tokens for decorator injection
    for (const channel of CHANNELS) {
      const channelProviders = resolvedProviders[channel];
      if (channelProviders) {
        channelProviders.forEach((provider, index) => {
          providers.push({
            provide: notificationProviderToken(channel, index),
            useValue: provider,
          });
        });
      }
    }

    if (options.storage?.enabled && options.storage.inject) {
      providers.push({
        provide: NOTIFICATION_STORE,
        useExisting: options.storage.inject,
      });
    }

    if (options.queue?.enabled && options.queue.inject) {
      providers.push({
        provide: NOTIFICATION_QUEUE,
        useExisting: options.queue.inject,
      });
    }

    return {
      module: NotificationModule,
      global: options.global ?? true,
      providers,
      exports: [NotificationService],
    };
  }

  /**
   * Configure the notification module asynchronously.
   *
   * The factory returns `NotificationModuleOptions`. When enabling
   * storage or queue, register the implementation providers in your
   * module using the same token strings from the options.
   *
   * @example
   * ```typescript
   * @Module({
   *   imports: [
   *     NotificationModule.forRootAsync({
   *       useFactory: (config: ConfigService) => ({
   *         providers: { email: [...] },
   *         storage: { enabled: true, inject: 'NOTIFICATION_TYPEORM_STORE' },
   *       }),
   *       inject: [ConfigService],
   *     }),
   *     TypeOrmModule.forFeature([NotificationLogEntity]),
   *   ],
   *   providers: [
   *     {
   *       provide: 'NOTIFICATION_TYPEORM_STORE',
   *       useClass: TypeOrmNotificationStore,
   *     },
   *   ],
   * })
   * export class AppModule {}
   * ```
   *
   * @param options - Async module configuration.
   * @returns DynamicModule to import in your AppModule.
   */
  static forRootAsync(options: NotificationModuleAsyncOptions): DynamicModule {
    const asyncOptionsProvider: Provider = {
      provide: NOTIFICATION_MODULE_OPTIONS,
      useFactory: async (...args: unknown[]) => {
        const opts = await options.useFactory(...args);
        // Resolve all channel entries (config → provider instance)
        const resolvedProviders: Record<string, NotificationProvider[]> = {};
        for (const channel of CHANNELS) {
          const entries = (
            opts.providers as Record<string, unknown[] | undefined>
          )[channel];
          if (entries) {
            resolvedProviders[channel] = entries.map((entry) =>
              resolveProvider(channel, entry),
            );
          }
        }
        return {
          ...opts,
          providers:
            resolvedProviders as NotificationModuleOptions['providers'],
        };
      },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      inject: (options.inject ?? []) as any[],
    };

    return {
      module: NotificationModule,
      global: options.global ?? true,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      imports: (options.imports ?? []) as any[],
      providers: [asyncOptionsProvider, NotificationService],
      exports: [NotificationService],
    };
  }
}
