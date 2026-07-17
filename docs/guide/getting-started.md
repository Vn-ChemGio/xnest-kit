# Getting Started

## Prerequisites

Before using xnest-kit, ensure you have:

- **Node.js** >= 18
- **npm** >= 9
- **NestJS** project (or create one with `@nestjs/cli`)

## Installation

```bash
npm install xnest-kit
```

## Peer Dependencies

### Required

```bash
npm install @nestjs/common @nestjs/core reflect-metadata rxjs
```

These are typically already installed in a NestJS project.

### Optional (per module)

```bash
# Swagger module
npm install @nestjs/swagger @scalar/nestjs-api-reference

# Cache module
npm install @nestjs/cache-manager cache-manager keyv @keyv/valkey
```

## Next Steps

- [Installation Guide](/guide/installation)
- [Quick Start](/guide/quick-start)
- [Configuration](/guide/configuration)
