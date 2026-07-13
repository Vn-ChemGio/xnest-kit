# audit-log

> Audit logging for NestJS

## Status

![](https://img.shields.io/badge/alpha-orange)

## Installation

```bash
npm install xnest-kit
```

## Usage

```typescript
import { configAuditLog } from 'xnest-kit/audit-log';

const app = await NestFactory.create(AppModule);
configAuditLog(app, {
  storage: 'database',
  retention: 90,
});
```

## API

### configAuditLog(app, options)

Configure audit log for a NestJS application.

**Parameters:**
- `app` - NestJS application instance
- `options` - Audit log configuration options

## Status

This module is currently a stub. Full implementation coming in v0.1.0-alpha.
