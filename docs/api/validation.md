# validation

> Request validation with i18n error descriptions for NestJS

## Status

![](https://img.shields.io/badge/alpha-orange)

## Installation

```bash
npm install xnest-kit
```

## Usage

```typescript
import { configValidation } from 'xnest-kit/validation';

const app = await NestFactory.create(AppModule);
configValidation(app, {
  whitelist: true,
  transform: true,
});
```

## API

### configValidation(app, options)

Configure validation for a NestJS application.

**Parameters:**
- `app` - NestJS application instance
- `options` - Validation configuration options

**Options:**
- `whitelist` - Strip non-whitelisted properties
- `transform` - Auto-transform payloads to DTO instances
- `i18n` - Enable i18n error messages

## Status

This module is currently a stub. Full implementation coming in v0.1.0-alpha.
