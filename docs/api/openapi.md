# swagger

> Swagger/Scalar configuration and decorators for NestJS

## Status

![](https://img.shields.io/badge/alpha-orange)

## Installation

```bash
npm install xnest-kit
```

## Usage

```typescript
import { configSwagger } from 'xnest-kit/swagger';

const app = await NestFactory.create(AppModule);
configSwagger(app, {
  title: 'My API',
  description: 'API documentation',
  version: '1.0.0',
  provider: 'swagger',
});
```

## API

### configSwagger(app, options)

Configure OpenAPI documentation for a NestJS application.

**Parameters:**
- `app` - NestJS application instance
- `options` - Configuration options

**Options:**
- `title` - API title
- `description` - API description
- `version` - API version
- `provider` - `'swagger'` or `'scalar'`

### ApiExample(examples)

Decorator for creating API examples.

### ApiParamConfig(paramName, options)

Decorator for simplifying API parameter configuration.

## Status

This module is currently a stub. Full implementation coming in v0.1.0-alpha.
