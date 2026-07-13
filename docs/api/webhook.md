# webhook

> Webhook handling for NestJS

## Status

![](https://img.shields.io/badge/alpha-orange)

## Installation

```bash
npm install xnest-kit
```

## Usage

```typescript
import { configWebhook } from 'xnest-kit/webhook';

const app = await NestFactory.create(AppModule);
configWebhook(app, {
  secret: process.env.WEBHOOK_SECRET,
});
```

## API

### configWebhook(app, options)

Configure webhooks for a NestJS application.

**Parameters:**
- `app` - NestJS application instance
- `options` - Webhook configuration options

**Options:**
- `secret` - Webhook signing secret
- `routes` - Custom webhook routes

## Status

This module is currently a stub. Full implementation coming in v0.1.0-alpha.
