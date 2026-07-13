# storage

> Cloud storage integration for NestJS

## Status

![](https://img.shields.io/badge/alpha-orange)

## Installation

```bash
npm install xnest-kit
```

## Usage

```typescript
import { configStorage } from 'xnest-kit/storage';

const app = await NestFactory.create(AppModule);
configStorage(app, {
  provider: 's3',
  bucket: 'my-bucket',
});
```

## API

### configStorage(app, options)

Configure storage for a NestJS application.

**Parameters:**
- `app` - NestJS application instance
- `options` - Storage configuration options

**Options:**
- `provider` - Storage provider (`'s3'`, `'gcs'`, `'azure'`)
- `bucket` - Storage bucket name
- `credentials` - Provider credentials

## Status

This module is currently a stub. Full implementation coming in v0.1.0-alpha.
