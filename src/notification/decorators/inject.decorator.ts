import { Inject, Optional } from '@nestjs/common';
import {
  NOTIFICATION_MODULE_OPTIONS,
  NOTIFICATION_STORE,
  NOTIFICATION_QUEUE,
  notificationProviderToken,
} from '../../shared/notification-keys';

/**
 * Inject the NotificationModule options.
 *
 * @example
 * ```typescript
 * constructor(
 *   @InjectNotificationOptions() private readonly options: NotificationModuleOptions,
 * ) {}
 * ```
 */
export function InjectNotificationOptions(): ParameterDecorator {
  return (
    target: object,
    propertyKey?: string | symbol,
    parameterIndex?: number,
  ) => {
    Optional()(target, propertyKey, parameterIndex);
    Inject(NOTIFICATION_MODULE_OPTIONS)(target, propertyKey, parameterIndex);
  };
}

/**
 * Inject a specific notification provider for a given channel.
 *
 * Reads the providers array from module options and returns the provider
 * at the specified index (default: first provider).
 *
 * @param channel - The notification channel (e.g., 'email', 'sms').
 * @param index - Provider index within the channel array. @default 0
 * @returns Parameter decorator.
 *
 * @example
 * ```typescript
 * import { InjectNotificationProvider } from 'xnest-kit/notification';
 *
 * @Injectable()
 * export class MailService {
 *   constructor(
 *     @InjectNotificationProvider('email') private readonly emailProvider: NotificationProvider,
 *   ) {}
 * }
 * ```
 */
export function InjectNotificationProvider(
  channel: string,
  index = 0,
): ParameterDecorator {
  return (
    target: object,
    propertyKey?: string | symbol,
    parameterIndex?: number,
  ) => {
    Optional()(target, propertyKey, parameterIndex);
    Inject(notificationProviderToken(channel, index))(
      target,
      propertyKey,
      parameterIndex,
    );
  };
}

/**
 * Inject the notification store instance.
 *
 * Returns `undefined` if storage is not enabled.
 *
 * @example
 * ```typescript
 * constructor(
 *   @InjectNotificationStore() private readonly store?: NotificationStore,
 * ) {}
 * ```
 */
export function InjectNotificationStore(): ParameterDecorator {
  return (
    target: object,
    propertyKey?: string | symbol,
    parameterIndex?: number,
  ) => {
    Optional()(target, propertyKey, parameterIndex);
    Inject(NOTIFICATION_STORE)(target, propertyKey, parameterIndex);
  };
}

/**
 * Inject the notification queue instance.
 *
 * Returns `undefined` if queue is not enabled.
 *
 * @example
 * ```typescript
 * constructor(
 *   @InjectNotificationQueue() private readonly queue?: unknown,
 * ) {}
 * ```
 */
export function InjectNotificationQueue(): ParameterDecorator {
  return (
    target: object,
    propertyKey?: string | symbol,
    parameterIndex?: number,
  ) => {
    Optional()(target, propertyKey, parameterIndex);
    Inject(NOTIFICATION_QUEUE)(target, propertyKey, parameterIndex);
  };
}
