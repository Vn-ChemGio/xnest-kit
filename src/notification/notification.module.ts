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
    const providers: Provider[] = [
      { provide: NOTIFICATION_MODULE_OPTIONS, useValue: options },
      NotificationService,
    ];

    // Register per-channel provider tokens for decorator injection
    for (const channel of CHANNELS) {
      const channelProviders = (
        options.providers as Record<string, unknown[] | undefined>
      )[channel];
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
      useFactory: options.useFactory,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      inject: (options.inject ?? []) as any[],
    };

    // Register per-channel provider factory tokens (index 0 only)
    const channelProviders: Provider[] = CHANNELS.map((channel) => ({
      provide: notificationProviderToken(channel, 0),
      useFactory: (opts: NotificationModuleOptions) => {
        const providers = (
          opts.providers as Record<string, unknown[] | undefined>
        )[channel];
        return providers?.[0];
      },
      inject: [NOTIFICATION_MODULE_OPTIONS],
    }));

    return {
      module: NotificationModule,
      global: options.global ?? true,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      imports: (options.imports ?? []) as any[],
      providers: [
        asyncOptionsProvider,
        ...channelProviders,
        NotificationService,
      ],
      exports: [NotificationService],
    };
  }
}
