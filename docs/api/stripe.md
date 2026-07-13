# stripe

> Stripe integration for NestJS

## Status

![](https://img.shields.io/badge/alpha-orange)

## Installation

```bash
npm install xnest-kit
```

## Usage

```typescript
import { configStripe } from 'xnest-kit/stripe';

const app = await NestFactory.create(AppModule);
configStripe(app, {
  apiKey: process.env.STRIPE_SECRET_KEY,
});
```

## API

### configStripe(app, options)

Configure Stripe for a NestJS application.

**Parameters:**
- `app` - NestJS application instance
- `options` - Stripe configuration options

**Options:**
- `apiKey` - Stripe secret API key
- `webhookSecret` - Stripe webhook secret

## Status

This module is currently a stub. Full implementation coming in v0.1.0-alpha.
