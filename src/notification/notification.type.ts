import type { NotificationProvider } from './notification.constants';
import type { EmailSendInput } from './channels/email/email.channel';
import type { SmsSendInput } from './channels/sms/sms.channel';
import type { PushSendInput } from './channels/push/push.channel';
import type { TelegramSendInput } from './channels/telegram/telegram.channel';
import type { SlackSendInput } from './channels/slack/slack.channel';
import type { TeamsSendInput } from './channels/teams/teams.channel';
import type { GoogleChatSendInput } from './channels/googlechat/googlechat.channel';
import type { WhatsAppSendInput } from './channels/whatsapp/whatsapp.channel';
import type { ViberSendInput } from './channels/viber/viber.channel';
import type { LineSendInput } from './channels/line/line.channel';
import type { WebPushSendInput } from './channels/webpush/webpush.channel';
import type { InAppSendInput } from './channels/inapp/inapp.channel';
import type { DiscordSendInput } from './channels/discord/discord.channel';
import type { WeChatSendInput } from './channels/wechat/wechat.channel';

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
    email?: NotificationProvider<EmailSendInput>[];
    sms?: NotificationProvider<SmsSendInput>[];
    push?: NotificationProvider<PushSendInput>[];
    telegram?: NotificationProvider<TelegramSendInput>[];
    slack?: NotificationProvider<SlackSendInput>[];
    teams?: NotificationProvider<TeamsSendInput>[];
    googlechat?: NotificationProvider<GoogleChatSendInput>[];
    whatsapp?: NotificationProvider<WhatsAppSendInput>[];
    viber?: NotificationProvider<ViberSendInput>[];
    line?: NotificationProvider<LineSendInput>[];
    webpush?: NotificationProvider<WebPushSendInput>[];
    inapp?: NotificationProvider<InAppSendInput>[];
    discord?: NotificationProvider<DiscordSendInput>[];
    wechat?: NotificationProvider<WeChatSendInput>[];
  };
  queue?: {
    enabled: boolean;
    /** Injection token for the Bull/BullMQ queue instance. */
    inject?: string;
  };
  storage?: {
    enabled: boolean;
    /** Injection token for a NotificationStore implementation. */
    inject?: string;
  };
  /** Register as global module. @default true */
  global?: boolean;
  /** Default sender info per channel. */
  defaultFrom?: {
    email?: string;
    sms?: string;
    whatsapp?: string;
  };
}

/** Async module configuration options. */
export interface NotificationModuleAsyncOptions {
  useFactory: (
    ...args: unknown[]
  ) => Promise<NotificationModuleOptions> | NotificationModuleOptions;
  inject?: unknown[];
  imports?: unknown[];
  global?: boolean;
}

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
