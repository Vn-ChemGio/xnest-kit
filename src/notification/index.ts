/**
 * @module xnest-kit/notification
 * @description Multi-channel notification module for NestJS.
 *
 * Supports 14 channels with pluggable providers, optional queuing,
 * and persistence.
 *
 * @example
 * ```typescript
 * import { NotificationModule, NotificationService } from 'xnest-kit/notification';
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
 */

// ── Keys ──────────────────────────────────────────────────────────────────
export {
  NOTIFICATION_MODULE_OPTIONS,
  NOTIFICATION_QUEUE,
  NOTIFICATION_STORE,
  notificationProviderToken,
} from '../shared/notification-keys';

// ── Constants & Provider interface ────────────────────────────────────────
export { CHANNELS } from './notification.constants';
export type {
  NotificationProvider,
  ProviderResult,
} from './notification.constants';

// ── Types ────────────────────────────────────────────────────────────────
export type {
  ChannelType,
  ProviderSendResult,
  ChannelResult,
  NotificationResult,
  SendInput,
  ChannelSendInput,
  NotificationRecord,
  NotificationStore,
  NotificationModuleOptions,
  NotificationModuleAsyncOptions,
  NotificationDiagnostics,
} from './notification.type';

// ── Channel types ────────────────────────────────────────────────────────
export type { EmailSendInput } from './channels/email';
export type { SmsSendInput } from './channels/sms';
export type { PushSendInput } from './channels/push';
export type { TelegramSendInput } from './channels/telegram';
export type { SlackSendInput } from './channels/slack';
export type { TeamsSendInput } from './channels/teams';
export type { GoogleChatSendInput } from './channels/googlechat';
export type { WhatsAppSendInput } from './channels/whatsapp';
export type { ViberSendInput } from './channels/viber';
export type { LineSendInput } from './channels/line';
export type { WebPushSendInput } from './channels/webpush';
export type { InAppSendInput } from './channels/inapp';
export type { DiscordSendInput } from './channels/discord';
export type { WeChatSendInput } from './channels/wechat';

// ── Channel providers ────────────────────────────────────────────────────
export {
  NodemailerEmailProvider,
  isNodemailerInstalled,
} from './channels/email';
export type { NodemailerEmailProviderConfig } from './channels/email';

export { TwilioSmsProvider, isTwilioInstalled } from './channels/sms';
export type { TwilioSmsProviderConfig } from './channels/sms';

export { FcmPushProvider, isFirebaseAdminInstalled } from './channels/push';
export type { FcmPushProviderConfig } from './channels/push';

export {
  TelegramBotProvider,
  isTelegramBotInstalled,
} from './channels/telegram';
export type { TelegramBotProviderConfig } from './channels/telegram';

export { SlackProvider, isSlackWebApiInstalled } from './channels/slack';
export type { SlackProviderConfig } from './channels/slack';

export { TeamsWebhookProvider } from './channels/teams';

export { GoogleChatWebhookProvider } from './channels/googlechat';

export { WhatsAppCloudProvider } from './channels/whatsapp';
export type { WhatsAppCloudProviderConfig } from './channels/whatsapp';

export { ViberBotProvider } from './channels/viber';
export type { ViberBotProviderConfig } from './channels/viber';

export { LineMessagingProvider } from './channels/line';
export type { LineMessagingProviderConfig } from './channels/line';

export { WebPushProvider, isWebPushInstalled } from './channels/webpush';
export type { WebPushProviderConfig } from './channels/webpush';

export { InAppSocketProvider, isSocketIoInstalled } from './channels/inapp';

export { DiscordProvider, isDiscordJsInstalled } from './channels/discord';
export type { DiscordProviderConfig } from './channels/discord';

export { WeChatOfficialProvider } from './channels/wechat';
export type { WeChatOfficialProviderConfig } from './channels/wechat';

// ── Module & Service ─────────────────────────────────────────────────────
export { NotificationModule } from './notification.module';
export { NotificationService } from './notification.service';

// ── Decorators ───────────────────────────────────────────────────────────
export {
  InjectNotificationOptions,
  InjectNotificationProvider,
  InjectNotificationStore,
  InjectNotificationQueue,
} from './decorators';
