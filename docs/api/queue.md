# queue

> BullMQ configuration and decorators for NestJS

## Status

![](https://img.shields.io/badge/alpha-orange)

## Installation

```bash
npm install xnest-kit
```

## Usage

```typescript
import { configQueue } from 'xnest-kit/queue';

const app = await NestFactory.create(AppModule);
configQueue(app, {
  redis: { host: 'localhost', port: 6379 },
});
```

## API

### configQueue(app, options)

Configure BullMQ queues for a NestJS application.

**Parameters:**
- `app` - NestJS application instance
- `options` - BullMQ configuration options

**Options:**
- `redis` - Redis connection options
- `defaultJobOptions` - Default job options

### XProcessor(queueName)

Decorator for defining a BullMQ processor.

## Status

This module is currently a stub. Full implementation coming in v0.1.0-alpha.
