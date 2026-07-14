# API Reference

## Module Overview

xnest-kit provides 15 feature modules, each with its own set of utilities and configurations.

## Available Modules

| Module | Description | Import |
|--------|-------------|--------|
| [swagger](/api/openapi) | Swagger/Scalar config & decorators | `xnest-kit/swagger` |
| [cache](/api/cache) | CacheManager with Redis/Valkey | `xnest-kit/cache` |
| [typeorm](/api/typeorm) | TypeORM config & entity decorators | `xnest-kit/typeorm` |
| [queue](/api/queue) | BullMQ config & decorators | `xnest-kit/queue` |
| [validation](/api/validation) | Request validation with i18n | `xnest-kit/validation` |
| [notification](/api/notification) | Multi-adapter notifications | `xnest-kit/notification` |
| [activity-feed](/api/activity-feed) | Activity tracking | `xnest-kit/activity-feed` |
| [audit-log](/api/audit-log) | Audit logging | `xnest-kit/audit-log` |
| [logger](/api/logger) | Enhanced logging | `xnest-kit/logger` |
| [metrics](/api/metrics) | Prometheus metrics | `xnest-kit/metrics` |
| [rate-limit](/api/rate-limit) | Rate limiting | `xnest-kit/rate-limit` |
| [storage](/api/storage) | S3/GCS/Azure storage | `xnest-kit/storage` |
| [stripe](/api/stripe) | Stripe integration | `xnest-kit/stripe` |
| [webhook](/api/webhook) | Webhook handling | `xnest-kit/webhook` |
| [excel](/api/excel) | Excel file processing | `xnest-kit/excel` |

## Import All

```typescript
import { configSwagger, configCache, configTypeOrm } from 'xnest-kit';
```

## Import Individual Module

```typescript
import { configSwagger } from 'xnest-kit/swagger';
```
