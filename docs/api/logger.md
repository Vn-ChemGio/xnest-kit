# logger

> Enhanced logging for NestJS

## Status

![](https://img.shields.io/badge/alpha-orange)

## Installation

```bash
npm install xnest-kit
```

## Usage

```typescript
import { configLogger } from 'xnest-kit/logger';

const app = await NestFactory.create(AppModule);
configLogger(app, {
  level: 'info',
  transport: 'pino',
});
```

## API

### configLogger(app, options)

Configure logger for a NestJS application.

**Parameters:**
- `app` - NestJS application instance
- `options` - Logger configuration options

**Options:**
- `level` - Log level (`'debug'`, `'info'`, `'warn'`, `'error'`)
- `transport` - Log transport (`'console'`, `'pino'`)

## Status

This module is currently a stub. Full implementation coming in v0.1.0-alpha.
