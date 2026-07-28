<p align="center">
  <a href="https://github.com/Vn-ChemGio/xnest-kit" target="blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="NestJS Logo" />
  </a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/xnest-kit" target="_blank">
    <img src="https://img.shields.io/npm/v/xnest-kit.svg" alt="NPM Version" />
  </a>
  <a href="https://www.npmjs.com/package/xnest-kit" target="_blank">
    <img src="https://img.shields.io/npm/l/xnest-kit.svg" alt="Package License" />
  </a>
  <a href="https://www.npmjs.com/package/xnest-kit" target="_blank">
    <img src="https://img.shields.io/npm/dm/xnest-kit.svg" alt="NPM Downloads" />
  </a>
  <a href="https://github.com/Vn-ChemGio/xnest-kit/actions" target="_blank">
    <img src="https://github.com/Vn-ChemGio/xnest-kit/actions/workflows/ci.yml/badge.svg" alt="CI" />
  </a>
  <a href="https://github.com/Vn-ChemGio/xnest-kit" target="_blank">
    <img src="https://img.shields.io/github/stars/Vn-ChemGio/xnest-kit?style=social" alt="GitHub Stars" />
  </a>
</p>

<p align="center">
  A modular, production-ready <a href="https://nestjs.com" target="_blank">NestJS</a> toolkit — Bootstrap, Auth, SaaS, and Infrastructure integrations in a single package.
</p>

---

## Features

| Module | Description | Status |
|--------|-------------|--------|
| [swagger](./src/swagger) | Swagger/Scalar config & decorators | ![](https://img.shields.io/badge/stable-brightgreen) |
| [cache](./src/cache) | CacheManager with Redis/Valkey | ![](https://img.shields.io/badge/stable-brightgreen) |
| [typeorm](./src/typeorm) | TypeORM config, entity decorators, query builder, transactions | ![](https://img.shields.io/badge/stable-brightgreen) |
| [queue](./src/queue) | BullMQ config & decorators | ![](https://img.shields.io/badge/alpha-orange) |
| [validation](./src/validation) | Request validation with i18n | ![](https://img.shields.io/badge/alpha-orange) |
| [notification](./src/notification) | Multi-channel notifications (14 channels) | ![](https://img.shields.io/badge/stable-brightgreen) |
| [activity-feed](./src/activity-feed) | Activity tracking | ![](https://img.shields.io/badge/alpha-orange) |
| [audit-log](./src/audit-log) | Audit logging | ![](https://img.shields.io/badge/alpha-orange) |
| [logger](./src/logger) | Enhanced logging | ![](https://img.shields.io/badge/alpha-orange) |
| [metrics](./src/metrics) | Prometheus metrics | ![](https://img.shields.io/badge/alpha-orange) |
| [rate-limit](./src/rate-limit) | Rate limiting | ![](https://img.shields.io/badge/alpha-orange) |
| [storage](./src/storage) | S3/GCS/Azure storage | ![](https://img.shields.io/badge/alpha-orange) |
| [stripe](./src/stripe) | Stripe integration | ![](https://img.shields.io/badge/alpha-orange) |
| [webhook](./src/webhook) | Webhook handling | ![](https://img.shields.io/badge/alpha-orange) |
| [excel](./src/excel) | Excel file processing | ![](https://img.shields.io/badge/alpha-orange) |

## Tech Stack

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Redis-DC382D?logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/TypeORM-FE0803?logo=typeorm&logoColor=white" alt="TypeORM" />
  <img src="https://img.shields.io/badge/BullMQ-FF6B6B?logo=bullmq&logoColor=white" alt="BullMQ" />
  <img src="https://img.shields.io/badge/Swagger-85EA2D?logo=swagger&logoColor=white" alt="Swagger" />
</p>

## Installation

```bash
npm install xnest-kit
```

## Quick Start

### Import all modules

```typescript
import { configSwagger, CacheModule } from 'xnest-kit';
```

### Import specific module (recommended for tree-shaking)

```typescript
import { configSwagger } from 'xnest-kit/swagger';
import { CacheModule } from 'xnest-kit/cache';
```

## Usage Examples

### Swagger (Scalar/OpenAPI)

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
    provider: 'swagger', // or 'scalar'
    defaultResponses: [409, 500], // auto-generate error responses
  });
  await app.listen(3000);
}
bootstrap();
```

### Cache

```typescript
import { Module } from '@nestjs/common';
import { CacheModule } from 'xnest-kit/cache';

@Module({
  imports: [CacheModule.forRoot()], // reads CACHE_URLS env
})
export class AppModule {}
```

### TypeORM

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from 'xnest-kit/typeorm';

@Module({
  imports: [TypeOrmModule.forRoot()], // reads DATABASE_URL env
})
export class AppModule {}
```

```typescript
import { UseInterceptors, Controller, Get, Post, Body } from '@nestjs/common';
import { Filterable, ParsedQuery, UseTransaction, GetManager, TransactionInterceptor } from 'xnest-kit/typeorm';

@Controller('users')
@UseInterceptors(TransactionInterceptor)
export class UsersController {
  @Get()
  @Filterable<User>({
    searchable: ['name', 'email', 'age'],
    like: ['name', 'email'],
    relations: ['profile'],
    maxTake: 100,
  })
  async findAll(@ParsedQuery() query: FindManyOptions<User>) {
    return this.userService.find(query);
  }

  @Post()
  @UseTransaction({ isolation: 'SERIALIZABLE' })
  async create(@GetManager() em: EntityManager, @Body() dto: CreateUserDto) {
    return em.save(em.create(User, dto));
  }
}
```

### Excel Processing

```typescript
import { parseExcel, generateExcel } from 'xnest-kit/excel';

// Parse uploaded Excel
const data = await parseExcel(file.buffer);

// Generate Excel for download
const buffer = await generateExcel(data, {
  sheetName: 'Users',
  columns: ['id', 'name', 'email'],
});
```

### Notification

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
      storage: { enabled: true, useClass: TypeOrmNotificationStore },
    }),
  ],
})
export class AppModule {}
```

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

## Requirements

- Node.js >= 18
- NestJS >= 10.0.0

## Peer Dependencies

### Required

| Package | Version |
|---------|---------|
| `@nestjs/common` | `>=10.0.0` |
| `@nestjs/core` | `>=10.0.0` |
| `reflect-metadata` | `>=0.1.0` |
| `rxjs` | `>=7.0.0` |

### Optional (per module)

```bash
# Swagger module
npm install @nestjs/swagger @scalar/nestjs-api-reference

# Cache module
npm install @nestjs/cache-manager cache-manager keyv @keyv/valkey

# TypeORM module
npm install typeorm @nestjs/typeorm

# Notification module (per-channel, install as needed)
npm install nodemailer           # email
npm install twilio               # sms
npm install firebase-admin       # push
npm install telegraf             # telegram
npm install @slack/web-api       # slack
npm install discord.js           # discord
npm install web-push             # webpush
npm install socket.io            # inapp
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Lint
npm run lint

# Test
npm run test

# Test with coverage
npm run test:cov
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) before submitting a Pull Request.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a history of notable changes.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Author

**Wind Blade** - [vn.chemgio@yahoo.com](mailto:vn.chemgio@yahoo.com)

## Links

- [GitHub Repository](https://github.com/Vn-ChemGio/xnest-kit)
- [Issue Tracker](https://github.com/Vn-ChemGio/xnest-kit/issues)
- [NPM Package](https://www.npmjs.com/package/xnest-kit)
