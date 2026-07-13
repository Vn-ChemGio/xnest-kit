# notification

> Multi-adapter notification support for NestJS

## Status

![](https://img.shields.io/badge/alpha-orange)

## Installation

```bash
npm install xnest-kit
```

## Usage

```typescript
import { configNotification } from 'xnest-kit/notification';

const app = await NestFactory.create(AppModule);
configNotification(app, {
  adapters: ['email', 'sms'],
});
```

## API

### configNotification(app, options)

Configure notification system for a NestJS application.

**Parameters:**
- `app` - NestJS application instance
- `options` - Notification configuration options

**Options:**
- `adapters` - Array of adapter types (`'email'`, `'sms'`, `'push'`)
- `retry` - Retry configuration
- `logging` - Enable notification logging

### EmailAdapter

Email notification adapter.

### SmsAdapter

SMS notification adapter.

### PushAdapter

Push notification adapter.

## Status

This module is currently a stub. Full implementation coming in v0.1.0-alpha.
