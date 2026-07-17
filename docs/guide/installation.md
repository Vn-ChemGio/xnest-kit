# Installation

## Using npm

```bash
npm install xnest-kit
```

## Using yarn

```bash
yarn add xnest-kit
```

## Using pnpm

```bash
pnpm add xnest-kit
```

## Peer Dependencies

### Required

```bash
npm install @nestjs/common @nestjs/core reflect-metadata rxjs
```

### Optional (per module)

```bash
# Swagger module
npm install @nestjs/swagger @scalar/nestjs-api-reference

# Cache module
npm install @nestjs/cache-manager cache-manager keyv @keyv/valkey
```

## Verify Installation

```typescript
import { configSwagger } from 'xnest-kit/swagger';
console.log('xnest-kit installed successfully');
```

## Next Steps

- [Quick Start](/guide/quick-start)
