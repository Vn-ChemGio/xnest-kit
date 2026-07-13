# activity-feed

> Activity tracking for NestJS

## Status

![](https://img.shields.io/badge/alpha-orange)

## Installation

```bash
npm install xnest-kit
```

## Usage

```typescript
import { configActivityFeed } from 'xnest-kit/activity-feed';

const app = await NestFactory.create(AppModule);
configActivityFeed(app, {
  storage: 'database',
});
```

## API

### configActivityFeed(app, options)

Configure activity feed for a NestJS application.

**Parameters:**
- `app` - NestJS application instance
- `options` - Activity feed configuration options

## Status

This module is currently a stub. Full implementation coming in v0.1.0-alpha.
