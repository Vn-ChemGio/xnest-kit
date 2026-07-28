# xnest-kit/notification

Multi-channel notification module for NestJS — 14 channels, pluggable providers, optional persistence and queuing.

## Prerequisites

Core module has no extra dependencies. Each channel requires its own SDK:

| Channel | Package | Config Type |
|---------|---------|-------------|
| `email` | `nodemailer` | `NodemailerEmailProviderConfig` |
| `sms` | `twilio` | `TwilioSmsProviderConfig` |
| `push` | `firebase-admin` | `FcmPushProviderConfig` |
| `telegram` | `telegraf` | `TelegramBotProviderConfig` |
| `slack` | `@slack/web-api` | `SlackProviderConfig` |
| `teams` | _(webhook)_ | — |
| `googlechat` | _(webhook)_ | — |
| `whatsapp` | _(Cloud API)_ | `WhatsAppCloudProviderConfig` |
| `viber` | `viber-bot` | `ViberBotProviderConfig` |
| `line` | `@line/bot-sdk` | `LineMessagingProviderConfig` |
| `webpush` | `web-push` | `WebPushProviderConfig` |
| `inapp` | `socket.io` | — |
| `discord` | `discord.js` | `DiscordProviderConfig` |
| `wechat` | _(Official API)_ | `WeChatOfficialProviderConfig` |

For TypeORM storage:

```bash
npm install typeorm @nestjs/typeorm
```

## Quick Start

```typescript
import { Module } from '@nestjs/common';
import { NotificationModule } from 'xnest-kit/notification';

@Module({
  imports: [
    NotificationModule.forRoot({
      providers: {
        email: [{ host: 'smtp.example.com', port: 587 }],
      },
    }),
  ],
})
export class AppModule {}
```

Config objects are auto-resolved to provider instances at startup via lazy imports. If the SDK is not installed, startup fails with a clear error.

## 14 Channels

| Channel | Provider | Webhook | Required Package |
|---------|----------|---------|-----------------|
| `email` | `NodemailerEmailProvider` | — | `nodemailer` |
| `sms` | `TwilioSmsProvider` | — | `twilio` |
| `push` | `FcmPushProvider` | — | `firebase-admin` |
| `telegram` | `TelegramBotProvider` | — | `telegraf` |
| `slack` | `SlackProvider` | — | `@slack/web-api` |
| `teams` | `TeamsWebhookProvider` | `webhookUrl` | — |
| `googlechat` | `GoogleChatWebhookProvider` | `webhookUrl` | — |
| `whatsapp` | `WhatsAppCloudProvider` | — | _(Cloud API)_ |
| `viber` | `ViberBotProvider` | — | `viber-bot` |
| `line` | `LineMessagingProvider` | — | `@line/bot-sdk` |
| `webpush` | `WebPushProvider` | — | `web-push` |
| `inapp` | `InAppSocketProvider` | — | `socket.io` |
| `discord` | `DiscordProvider` | `webhookUrl` | `discord.js` |
| `wechat` | `WeChatOfficialProvider` | — | _(Official API)_ |

## Config Objects vs Provider Instances

### Config objects (recommended)

Pass plain config objects — the module auto-resolves them to provider instances:

```typescript
NotificationModule.forRoot({
  providers: {
    email: [{ host: 'smtp.example.com', port: 587, auth: { user: 'u', pass: 'p' } }],
    sms: [{ accountSid: 'AC...', authToken: '...' }],
    discord: [{ token: '...' }],
  },
});
```

### Provider instances

Import and instantiate providers manually:

```typescript
import { NodemailerEmailProvider } from 'xnest-kit/notification';

NotificationModule.forRoot({
  providers: {
    email: [new NodemailerEmailProvider({ host: 'smtp.example.com', port: 587 })],
  },
});
```

### Mixed

Both can coexist in the same channel:

```typescript
NotificationModule.forRoot({
  providers: {
    email: [
      new NodemailerEmailProvider({ host: 'smtp1.example.com' }),
      { host: 'smtp2.example.com' }, // auto-resolved
    ],
  },
});
```

## API

### NotificationModule.forRoot

```typescript
NotificationModule.forRoot(options: NotificationModuleOptions): DynamicModule
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `providers` | `Record<ChannelType, (NotificationProvider \| config)[]>` | — | Channel providers. Accepts instances or config objects. |
| `storage` | `{ enabled, inject?, useClass? }` | — | Optional persistence store |
| `queue` | `{ enabled, inject?, useClass? }` | — | Optional queue adapter |
| `imports` | `unknown[]` | `[]` | Additional modules to import |
| `global` | `boolean` | `true` | Register as global module |

### NotificationModule.forRootAsync

```typescript
NotificationModule.forRootAsync(options: NotificationModuleAsyncOptions): DynamicModule
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `useFactory` | `(...args) => Promise<NotificationModuleOptions> \| NotificationModuleOptions` | — | Async factory function |
| `inject` | `unknown[]` | `[]` | Dependencies injected into factory |
| `imports` | `unknown[]` | `[]` | Additional modules to import |
| `storage` | `NotificationModuleOptions['storage']` | — | Top-level storage config (merged with factory result) |
| `queue` | `NotificationModuleOptions['queue']` | — | Top-level queue config |
| `global` | `boolean` | `true` | Register as global module |

### NotificationService.send

Fully typed overloads — channel determines payload type:

```typescript
send(channel: 'email', payload: EmailSendInput, options?): Promise<NotificationResult>;
send(channel: 'sms', payload: SmsSendInput, options?): Promise<NotificationResult>;
send(channel: 'push', payload: PushSendInput, options?): Promise<NotificationResult>;
send(channel: 'telegram', payload: TelegramSendInput, options?): Promise<NotificationResult>;
send(channel: 'slack', payload: SlackSendInput, options?): Promise<NotificationResult>;
send(channel: 'teams', payload: TeamsSendInput, options?): Promise<NotificationResult>;
send(channel: 'googlechat', payload: GoogleChatSendInput, options?): Promise<NotificationResult>;
send(channel: 'whatsapp', payload: WhatsAppSendInput, options?): Promise<NotificationResult>;
send(channel: 'viber', payload: ViberSendInput, options?): Promise<NotificationResult>;
send(channel: 'line', payload: LineSendInput, options?): Promise<NotificationResult>;
send(channel: 'webpush', payload: WebPushSendInput, options?): Promise<NotificationResult>;
send(channel: 'inapp', payload: InAppSendInput, options?): Promise<NotificationResult>;
send(channel: 'discord', payload: DiscordSendInput, options?): Promise<NotificationResult>;
send(channel: 'wechat', payload: WeChatSendInput, options?): Promise<NotificationResult>;
```

**Throws** when no providers are configured for the channel or all providers fail.

```typescript
@Injectable()
export class OrderService {
  constructor(private readonly notification: NotificationService) {}

  async placeOrder(order: Order) {
    // TypeScript enforces EmailSendInput for 'email' channel
    await this.notification.send('email', {
      to: order.email,
      subject: 'Order confirmed',
      body: '<h1>Thanks!</h1>',
    });

    // TypeScript enforces TelegramSendInput for 'telegram' channel
    await this.notification.send('telegram', {
      chatId: order.telegramChatId,
      text: 'Your order is confirmed!',
    });
  }
}
```

### NotificationService.getDiagnostics

Returns current initialization status — useful for health-check endpoints:

```typescript
getDiagnostics(): NotificationDiagnostics
```

```typescript
{
  storageEnabled: boolean;
  storageInitialized: boolean;
  queueEnabled: boolean;
  queueInitialized: boolean;
  providers: Record<string, number>; // channel -> provider count
}
```

## Storage

Enable persistence to save every `send()` result to a database:

```typescript
import {
  NotificationModule,
  NotificationLogEntity,
} from 'xnest-kit/notification';
import { TypeOrmNotificationStore } from 'xnest-kit/notification/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({ entities: [NotificationLogEntity] }),
    NotificationModule.forRoot({
      providers: { email: [{ host: 'smtp.example.com' }] },
      storage: {
        enabled: true,
        useClass: TypeOrmNotificationStore,
      },
    }),
  ],
})
export class AppModule {}
```

### TypeOrmNotificationStore

Built-in store implementation. Saves to `notification_logs` table.

| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` | Auto-generated primary key |
| `channels` | `simple-array` | Channel names used |
| `status` | `string` | `pending` / `sent` / `partial` / `failed` |
| `results` | `simple-json` | Per-provider results |
| `input` | `simple-json` | Original send input |
| `created_at` | `timestamp` | Creation time |
| `updated_at` | `timestamp` | Last update time |

### NotificationStore interface

Implement this to create a custom store:

```typescript
interface NotificationStore {
  save(record: Omit<NotificationRecord, 'id' | 'createdAt'>): Promise<NotificationRecord>;
  findById(id: string): Promise<NotificationRecord | null>;
  findByChannel(channel: ChannelType, limit?: number): Promise<NotificationRecord[]>;
  updateStatus(id: string, status: NotificationRecord['status']): Promise<void>;
}
```

### Storage config options

| Option | Type | Description |
|--------|------|-------------|
| `enabled` | `boolean` | Enable/disable persistence |
| `inject` | `string` | Injection token for an existing `NotificationStore` provider |
| `useClass` | `Constructor` | Class to instantiate as store (mutually exclusive with `inject`) |

## Queue

Enable async delivery via Bull/BullMQ:

```typescript
NotificationModule.forRoot({
  providers: { email: [{ host: 'smtp.example.com' }] },
  queue: {
    enabled: true,
    inject: 'BULLMQ_QUEUE', // your queue provider token
  },
});
```

When enabled, `send()` delegates to the queue instead of sending immediately.

| Option | Type | Description |
|--------|------|-------------|
| `enabled` | `boolean` | Enable/disable queuing |
| `inject` | `string` | Injection token for queue instance |
| `useClass` | `Constructor` | Class to instantiate as queue adapter |

## Decorators

### @InjectNotificationProvider

Inject a specific channel's provider by index:

```typescript
import { InjectNotificationProvider } from 'xnest-kit/notification';

@Injectable()
export class MailService {
  constructor(
    @InjectNotificationProvider('email')
    private readonly emailProvider: NotificationProvider,

    @InjectNotificationProvider('email', 1) // second provider
    private readonly backupProvider: NotificationProvider,
  ) {}
}
```

### @InjectNotificationStore

Inject the notification store (returns `undefined` if not enabled):

```typescript
import { InjectNotificationStore } from 'xnest-kit/notification';

@Injectable()
export class AuditService {
  constructor(
    @InjectNotificationStore()
    private readonly store?: NotificationStore,
  ) {}
}
```

### @InjectNotificationQueue

Inject the queue adapter (returns `undefined` if not enabled):

```typescript
import { InjectNotificationQueue } from 'xnest-kit/notification';

@Injectable()
export class QueueService {
  constructor(
    @InjectNotificationQueue()
    private readonly queue?: unknown,
  ) {}
}
```

### @InjectNotificationOptions

Inject the module options:

```typescript
import { InjectNotificationOptions } from 'xnest-kit/notification';

@Injectable()
export class ConfigService {
  constructor(
    @InjectNotificationOptions()
    private readonly options: NotificationModuleOptions,
  ) {}
}
```

## Injection Tokens

| Token | Type | Description |
|-------|------|-------------|
| `NOTIFICATION_MODULE_OPTIONS` | `string` | Module configuration |
| `NOTIFICATION_STORE` | `string` | Store instance |
| `NOTIFICATION_QUEUE` | `string` | Queue adapter instance |
| `notificationProviderToken(channel, index)` | `string` | Per-channel provider |

## Error Handling

`send()` **throws** when:

- No providers configured for the channel
- All providers in the channel fail

```typescript
try {
  await this.notification.send('email', { to: 'user@example.com', subject: 'Hi', body: 'Hello' });
} catch (error) {
  this.logger.error('Notification failed', error);
}
```

At startup, `NotificationService.onModuleInit()` logs warnings when:

- Storage is enabled but `NOTIFICATION_STORE` was not resolved
- Queue is enabled but `NOTIFICATION_QUEUE` was not resolved

Use `getDiagnostics()` to check status programmatically.

## Custom Provider

Implement `NotificationProvider<T>`:

```typescript
import type {
  NotificationProvider,
  ProviderResult,
} from 'xnest-kit/notification';
import type { EmailSendInput } from 'xnest-kit/notification';

export class CustomEmailProvider implements NotificationProvider<EmailSendInput> {
  readonly name = 'custom-email';
  readonly channel = 'email';

  async send(input: EmailSendInput): Promise<ProviderResult> {
    // your implementation
    return {
      success: true,
      providerName: this.name,
      channel: this.channel,
      messageId: '...',
    };
  }
}
```
