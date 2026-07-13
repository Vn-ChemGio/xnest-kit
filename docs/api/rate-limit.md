# rate-limit

> Rate limiting for NestJS

## Status

![](https://img.shields.io/badge/alpha-orange)

## Installation

```bash
npm install xnest-kit
```

## Usage

```typescript
import { configRateLimit } from 'xnest-kit/rate-limit';

const app = await NestFactory.create(AppModule);
configRateLimit(app, {
  windowMs: 60000,
  max: 100,
});
```

## API

### configRateLimit(app, options)

Configure rate limiting for a NestJS application.

**Parameters:**
- `app` - NestJS application instance
- `options` - Rate limit configuration options

**Options:**
- `windowMs` - Time window in milliseconds
- `max` - Maximum requests per window
- `strategy` - Rate limiting strategy

## Status

This module is currently a stub. Full implementation coming in v0.1.0-alpha.
