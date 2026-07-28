# Examples

## Swagger

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configSwagger } from 'xnest-kit/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  configSwagger(app, {
    title: 'My API',
    description: 'API documentation',
    version: '1.0.0',
    provider: 'swagger',
  });

  await app.listen(3000);
}
bootstrap();
```

## Cache

```typescript
import { Module } from '@nestjs/common';
import { CacheModule } from 'xnest-kit/cache';

@Module({
  imports: [
    CacheModule.forRoot(), // reads CACHE_URLS env
  ],
})
export class AppModule {}
```

Or with explicit stores:

```typescript
import { Module } from '@nestjs/common';
import { CacheModule } from 'xnest-kit/cache';

@Module({
  imports: [
    CacheModule.forRoot({
      stores: [
        { provider: 'memory', namespace: 'session', ttl: 60_000 },
        { provider: 'valkey', url: 'valkey://localhost:6379', namespace: 'cache' },
      ],
      ttl: 30_000,
    }),
  ],
})
export class AppModule {}
```

## Excel

```typescript
import { Controller, Post, UploadedFile } from '@nestjs/common';
import { parseExcel, ExcelUpload } from 'xnest-kit/excel';

@Controller('import')
export class ImportController {
  @Post('users')
  async importUsers(
    @ExcelUpload({ allowedExtensions: ['.xlsx', '.xls'] })
    file: Express.Multer.File,
  ) {
    const data = await parseExcel(file.buffer, {
      sheetName: 'Users',
      headerRow: 1,
    });
    return { imported: data.length };
  }
}
```

## TypeORM

```typescript
import { XEntity, XColumn } from 'xnest-kit/typeorm';

@Entity('users')
export class User {
  @XColumn({ primary: true, generated: true })
  id: number;

  @XColumn()
  name: string;

  @XColumn({ unique: true })
  email: string;
}
```

## Notification

### Module setup

```typescript
import { Module } from '@nestjs/common';
import { NotificationModule } from 'xnest-kit/notification';

@Module({
  imports: [
    NotificationModule.forRoot({
      providers: {
        email: [{ host: 'smtp.example.com', port: 587 }],
        telegram: [{ token: process.env.BOT_TOKEN! }],
        discord: [{ token: process.env.DISCORD_TOKEN! }],
      },
    }),
  ],
})
export class AppModule {}
```

### Async configuration

```typescript
NotificationModule.forRootAsync({
  useFactory: (config: ConfigService) => ({
    providers: {
      email: [{ host: config.get('SMTP_HOST') }],
    },
    storage: { enabled: true, useClass: TypeOrmNotificationStore },
  }),
  imports: [TypeOrmModule.forFeature([NotificationLogEntity])],
  inject: [ConfigService],
})
```

### Sending notifications

```typescript
import { NotificationService } from 'xnest-kit/notification';

@Injectable()
export class OrderService {
  constructor(private readonly notification: NotificationService) {}

  async placeOrder(order: Order) {
    await this.notification.send('email', {
      to: order.email,
      subject: 'Order confirmed',
      body: '<h1>Thanks!</h1>',
    });

    await this.notification.send('telegram', {
      chatId: order.telegramChatId,
      text: `Order #${order.id} confirmed`,
    });
  }
}
```

### With storage

```typescript
import { NotificationModule, NotificationLogEntity } from 'xnest-kit/notification';
import { TypeOrmNotificationStore } from 'xnest-kit/notification/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({ entities: [NotificationLogEntity] }),
    NotificationModule.forRoot({
      providers: { email: [{ host: 'smtp.example.com' }] },
      storage: { enabled: true, useClass: TypeOrmNotificationStore },
    }),
  ],
})
export class AppModule {}
```

### Custom provider

```typescript
import type { NotificationProvider, ProviderResult } from 'xnest-kit/notification';
import type { EmailSendInput } from 'xnest-kit/notification';

export class CustomEmailProvider implements NotificationProvider<EmailSendInput> {
  readonly name = 'custom-email';
  readonly channel = 'email';

  async send(input: EmailSendInput): Promise<ProviderResult> {
    // your implementation
    return { success: true, providerName: this.name, channel: this.channel };
  }
}
```
