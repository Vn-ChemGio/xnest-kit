import type { NotificationProvider } from './notification.constants';
import type {
  EmailSendInput,
  NodemailerEmailProviderConfig,
} from './channels/email';
import type { SmsSendInput, TwilioSmsProviderConfig } from './channels/sms';
import type { PushSendInput, FcmPushProviderConfig } from './channels/push';
import type {
  TelegramSendInput,
  TelegramBotProviderConfig,
} from './channels/telegram';
import type { SlackSendInput, SlackProviderConfig } from './channels/slack';
import type { TeamsSendInput } from './channels/teams';
import type { GoogleChatSendInput } from './channels/googlechat';
import type {
  WhatsAppSendInput,
  WhatsAppCloudProviderConfig,
} from './channels/whatsapp';
import type { ViberSendInput, ViberBotProviderConfig } from './channels/viber';
import type {
  LineSendInput,
  LineMessagingProviderConfig,
} from './channels/line';
import type {
  WebPushSendInput,
  WebPushProviderConfig,
} from './channels/webpush';
import type { InAppSendInput } from './channels/inapp';
import type {
  DiscordSendInput,
  DiscordProviderConfig,
} from './channels/discord';
import type {
  WeChatSendInput,
  WeChatOfficialProviderConfig,
} from './channels/wechat';

/** Supported notification channel types. */
export type ChannelType =
  | 'email'
  | 'sms'
  | 'push'
  | 'telegram'
  | 'slack'
  | 'teams'
  | 'googlechat'
  | 'whatsapp'
  | 'viber'
  | 'line'
  | 'webpush'
  | 'inapp'
  | 'discord'
  | 'wechat';

/** Result from a single provider send attempt. */
export interface ProviderSendResult {
  success: boolean;
  providerName: string;
  channel: ChannelType;
  messageId?: string;
  error?: string;
  metadata?: Record<string, unknown>;
}

/** Aggregated results for a single channel. */
export interface ChannelResult {
  channel: ChannelType;
  results: ProviderSendResult[];
}

/** Final result returned by NotificationService.send(). */
export interface NotificationResult {
  id?: string;
  success: boolean;
  channels: ChannelResult[];
  timestamp: Date;
}

/** Persisted notification record shape. */
export interface NotificationRecord {
  id: string;
  channels: ChannelType[];
  status: 'pending' | 'sent' | 'partial' | 'failed';
  results: ChannelResult[];
  input: SendInput;
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Interface for notification storage adapters.
 *
 * Implement this interface to persist notification records to your database.
 *
 * @example
 * ```typescript
 * import { Injectable } from '@nestjs/common';
 * import { InjectRepository } from '@nestjs/typeorm';
 * import { Repository } from 'typeorm';
 * import { NotificationLogEntity } from 'xnest-kit/notification/typeorm';
 * import type { NotificationStore } from 'xnest-kit/notification';
 *
 * @Injectable()
 * export class TypeOrmNotificationStore implements NotificationStore {
 *   constructor(
 *     @InjectRepository(NotificationLogEntity)
 *     private readonly repo: Repository<NotificationLogEntity>,
 *   ) {}
 *
 *   async save(record) {
 *     const entity = this.repo.create(record);
 *     return this.repo.save(entity);
 *   }
 *
 *   async findById(id) {
 *     return this.repo.findOneBy({ id });
 *   }
 *
 *   async findByChannel(channel, limit = 20) {
 *     return this.repo.find({
 *       where: { channels: Any([channel]) },
 *       take: limit,
 *       order: { createdAt: 'DESC' },
 *     });
 *   }
 *
 *   async updateStatus(id, status) {
 *     await this.repo.update(id, { status });
 *   }
 * }
 * ```
 */
export interface NotificationStore {
  save(
    record: Omit<NotificationRecord, 'id' | 'createdAt'>,
  ): Promise<NotificationRecord>;
  findById(id: string): Promise<NotificationRecord | null>;
  findByChannel(
    channel: ChannelType,
    limit?: number,
  ): Promise<NotificationRecord[]>;
  updateStatus(id: string, status: NotificationRecord['status']): Promise<void>;
}

/** Synchronous module configuration options. */
export interface NotificationModuleOptions {
  providers: {
    email?:
      NotificationProvider<EmailSendInput>[] | NodemailerEmailProviderConfig[];
    sms?: NotificationProvider<SmsSendInput>[] | TwilioSmsProviderConfig[];
    push?: NotificationProvider<PushSendInput>[] | FcmPushProviderConfig[];
    telegram?:
      NotificationProvider<TelegramSendInput>[] | TelegramBotProviderConfig[];
    slack?: NotificationProvider<SlackSendInput>[] | SlackProviderConfig[];
    teams?: NotificationProvider<TeamsSendInput>[];
    googlechat?: NotificationProvider<GoogleChatSendInput>[];
    whatsapp?:
      NotificationProvider<WhatsAppSendInput>[] | WhatsAppCloudProviderConfig[];
    viber?: NotificationProvider<ViberSendInput>[] | ViberBotProviderConfig[];
    line?:
      NotificationProvider<LineSendInput>[] | LineMessagingProviderConfig[];
    webpush?:
      NotificationProvider<WebPushSendInput>[] | WebPushProviderConfig[];
    inapp?: NotificationProvider<InAppSendInput>[];
    discord?:
      NotificationProvider<DiscordSendInput>[] | DiscordProviderConfig[];
    wechat?:
      NotificationProvider<WeChatSendInput>[] | WeChatOfficialProviderConfig[];
  };
  queue?: {
    enabled: boolean;
    /** Injection token for the Bull/BullMQ queue instance. */
    inject?: string;
    /** Class to instantiate as queue adapter (mutually exclusive with inject). */
    useClass?: new (...args: unknown[]) => unknown;
  };
  storage?: {
    enabled: boolean;
    /** Injection token for a NotificationStore implementation. */
    inject?: string;
    /** Class to instantiate as storage adapter (mutually exclusive with inject). */
    useClass?: new (...args: unknown[]) => unknown;
  };
  /** Additional modules to import into NotificationModule scope. */
  imports?: unknown[];
  /** Register as global module. @default true */
  global?: boolean;
}

/** Async module configuration options. */
export interface NotificationModuleAsyncOptions {
  useFactory: (
    ...args: unknown[]
  ) => Promise<NotificationModuleOptions> | NotificationModuleOptions;
  inject?: unknown[];
  imports?: unknown[];
  global?: boolean;
  storage?: NotificationModuleOptions['storage'];
  queue?: NotificationModuleOptions['queue'];
}

export type {
  EmailSendInput,
  SmsSendInput,
  PushSendInput,
  TelegramSendInput,
  SlackSendInput,
  TeamsSendInput,
  GoogleChatSendInput,
  WhatsAppSendInput,
  ViberSendInput,
  LineSendInput,
  WebPushSendInput,
  InAppSendInput,
  DiscordSendInput,
  WeChatSendInput,
};

/**
 * Union of all channel-specific send inputs.
 * Used by `SendInput` as the payload value type.
 */
export type ChannelSendInput =
  | EmailSendInput
  | SmsSendInput
  | PushSendInput
  | TelegramSendInput
  | SlackSendInput
  | TeamsSendInput
  | GoogleChatSendInput
  | WhatsAppSendInput
  | ViberSendInput
  | LineSendInput
  | WebPushSendInput
  | InAppSendInput
  | DiscordSendInput
  | WeChatSendInput;

/**
 * Input for `NotificationService.send()`.
 *
 * Specify exactly one channel key with its corresponding payload.
 */
export interface SendInput {
  template?: string;
  templateData?: Record<string, unknown>;
  email?: EmailSendInput;
  sms?: SmsSendInput;
  push?: PushSendInput;
  telegram?: TelegramSendInput;
  slack?: SlackSendInput;
  teams?: TeamsSendInput;
  googlechat?: GoogleChatSendInput;
  whatsapp?: WhatsAppSendInput;
  viber?: ViberSendInput;
  line?: LineSendInput;
  webpush?: WebPushSendInput;
  inapp?: InAppSendInput;
  discord?: DiscordSendInput;
  wechat?: WeChatSendInput;
}

/**
 * Diagnostic snapshot returned by `NotificationService.getDiagnostics()`.
 *
 * Useful for health-check endpoints or debugging module wiring issues.
 */
export interface NotificationDiagnostics {
  /** Whether storage persistence is enabled in module options. */
  storageEnabled: boolean;
  /** Whether the store provider was successfully resolved and injected. */
  storageInitialized: boolean;
  /** Whether queue-based delivery is enabled in module options. */
  queueEnabled: boolean;
  /** Whether the queue provider was successfully resolved and injected. */
  queueInitialized: boolean;
  /** Map of channel name to configured provider count. */
  providers: Record<string, number>;
}
