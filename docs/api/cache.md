# cache

> Cache utilities for NestJS — zero-config setup via `CACHE_URLS` env variable.

## Status

![](https://img.shields.io/badge/alpha-orange)

## Installation

```bash
npm install xnest-kit
```

## Peer Dependencies

```bash
npm install @nestjs/cache-manager cache-manager keyv
```

For Valkey/Redis support:

```bash
npm install @keyv/valkey
```

## Quick Start

```typescript
import { Module } from '@nestjs/common';
import { CacheModule } from 'xnest-kit/cache';

@Module({
  imports: [CacheModule.forRoot()],
})
export class AppModule {}
```

Reads `CACHE_URLS` from environment automatically.

## CACHE_URLS Format

Pipe-separated (`|`) URLs:

| Value | Store |
|-------|-------|
| (empty / not set) | Memory only |
| `valkey://localhost:6379` | Single Valkey |
| `\|valkey://host1:6379` | Memory + Valkey |
| `\|valkey://host1:6379\|valkey://host2:6379` | Memory + 2 Valkey |
| `valkey://host1:6379\|valkey://host2:6379` | 2 Valkey (no memory) |

## API

### CacheModule.forRoot

Creates the NestJS DynamicModule. Accepts optional configuration.

```typescript
CacheModule.forRoot(options?): DynamicModule
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `stores` | `CacheStoreOptions[]` | auto | Cache store configurations (overrides `CACHE_URLS`) |
| `ttl` | `number` | - | Default TTL in milliseconds |
| `isGlobal` | `boolean` | `true` | Register as global module |
| `nonBlocking` | `boolean` | `false` | Allow non-blocking multi-store operations |

### configCache

Creates cache configuration. Useful if you need the `CacheConfig` object separately.

```typescript
configCache(options?): CacheConfig
```

Accepts the same options as `CacheModule.forRoot()`.

## Injection Keys

| Token | Type | Description |
|-------|------|-------------|
| `CACHE_KEYV_PRIMARY` | `Keyv` | Primary (first/fastest) Keyv store |
| `CACHE_KEYV_ALL` | `Keyv[]` | All Keyv stores in order |

### Injection Example

```typescript
import { Inject } from '@nestjs/common';
import { CACHE_KEYV_PRIMARY, CACHE_KEYV_ALL } from 'xnest-kit/cache';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class UserService {
  constructor(
    @Inject(CACHE_KEYV_PRIMARY) private cache: Keyv,
    @Inject(CACHE_KEYV_ALL) private stores: Keyv[],
    @Inject(CACHE_MANAGER) private nestCache: Cache,
  ) {}
}
```

## Manual Config

```typescript
import { Module } from '@nestjs/common';
import { CacheModule } from 'xnest-kit/cache';

@Module({
  imports: [
    CacheModule.forRoot({
      stores: [
        { provider: 'memory', namespace: 'session', ttl: 60_000 },
        { provider: 'valkey', url: 'valkey://localhost:6379', namespace: 'cache' },
      ],
      ttl: 30_000,
    }),
  ],
})
export class AppModule {}
```
