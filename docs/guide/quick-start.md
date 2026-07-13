# Quick Start

## Import Methods

### Method 1: Import All Modules

```typescript
import { configOpenApi, configCache, configTypeOrm } from 'xnest-kit';
```

### Method 2: Import Specific Module (Recommended)

```typescript
import { configOpenApi } from 'xnest-kit/openapi';
import { configCache } from 'xnest-kit/cache';
import { configTypeOrm } from 'xnest-kit/typeorm';
```

> **Tip:** Method 2 is recommended for better tree-shaking and smaller bundle sizes.

## Basic Usage

### main.ts

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configOpenApi } from 'xnest-kit/openapi';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configure OpenAPI documentation
  configOpenApi(app, {
    title: 'My API',
    description: 'API documentation for my application',
    version: '1.0.0',
  });

  await app.listen(3000);
}
bootstrap();
```

### app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { CacheModule } from 'xnest-kit/cache';
import { TypeOrmModule } from 'xnest-kit/typeorm';

@Module({
  imports: [
    CacheModule.register({
      store: 'redis',
      host: 'localhost',
      port: 6379,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      database: 'mydb',
    }),
  ],
})
export class AppModule {}
```

## Next Steps

- [Configuration Guide](/guide/configuration)
- [API Reference](/api/)
