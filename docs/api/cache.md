# cache

> CacheManager with Redis/Valkey support for NestJS

## Status

![](https://img.shields.io/badge/alpha-orange)

## Installation

```bash
npm install xnest-kit
```

## Usage

```typescript
import { configCache } from 'xnest-kit/cache';

const app = await NestFactory.create(AppModule);
configCache(app, {
  store: 'redis',
  host: 'localhost',
  port: 6379,
  ttl: 60,
});
```

## API

### configCache(app, options)

Configure CacheManager for a NestJS application.

**Parameters:**
- `app` - NestJS application instance
- `options` - Cache configuration options

**Options:**
- `store` - Cache store type (`'redis'`, `'valkey'`, `'memory'`)
- `host` - Redis/Valkey host
- `port` - Redis/Valkey port
- `ttl` - Time-to-live in seconds
- `password` - Authentication password

### RedisService

Service for direct Redis operations.

## Status

This module is currently a stub. Full implementation coming in v0.1.0-alpha.
