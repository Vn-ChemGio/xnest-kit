# metrics

> Prometheus metrics for NestJS

## Status

![](https://img.shields.io/badge/alpha-orange)

## Installation

```bash
npm install xnest-kit
```

## Usage

```typescript
import { configMetrics } from 'xnest-kit/metrics';

const app = await NestFactory.create(AppModule);
configMetrics(app, {
  defaultLabels: { app: 'my-api' },
});
```

## API

### configMetrics(app, options)

Configure metrics for a NestJS application.

**Parameters:**
- `app` - NestJS application instance
- `options` - Metrics configuration options

**Options:**
- `defaultLabels` - Default labels for all metrics
- `prefix` - Metrics prefix

## Status

This module is currently a stub. Full implementation coming in v0.1.0-alpha.
