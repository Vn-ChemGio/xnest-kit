# Quick Start

## Import Methods

### Method 1: Import All Modules

```typescript
import { configSwagger, CacheModule } from 'xnest-kit';
```

### Method 2: Import Specific Module (Recommended)

```typescript
import { configSwagger } from 'xnest-kit/swagger';
import { CacheModule } from 'xnest-kit/cache';
```

> **Tip:** Method 2 is recommended for better tree-shaking and smaller bundle sizes.

## Basic Usage

### main.ts

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configSwagger } from 'xnest-kit/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configure OpenAPI documentation
  configSwagger(app, {
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

@Module({
  imports: [
    CacheModule.forRoot(), // reads CACHE_URLS env
  ],
})
export class AppModule {}
```

## Next Steps

- [Configuration Guide](/guide/configuration)
- [API Reference](/api/)
