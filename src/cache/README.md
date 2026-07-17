# xnest-kit/cache

Cache utilities for NestJS — zero-config setup via `CACHE_URLS` env variable.

Supports **memory** and **Valkey/Redis** providers simultaneously through [Keyv](https://keyv.org).

## Prerequisites

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

```env
# Memory only (default)
CACHE_URLS=

# Single valkey
CACHE_URLS=valkey://localhost:6379

# Memory + valkey
CACHE_URLS=|valkey://localhost:6379

# Memory + 2 valkey instances
CACHE_URLS=|valkey://host1:6379|valkey://host2:6379
```

> Both `valkey://` and `redis://` protocols are supported.

## Multi-Provider Data Storage

When using multiple providers (e.g., `|valkey://host1|valkey://host2`), data flows as follows:

```
┌─────────────────────────────────────────────────────────┐
│                     CacheModule                         │
├─────────────────────────────────────────────────────────┤
│  Primary (Memory)  →  Fastest, local to each instance   │
│  Secondary (Valkey1) →  Persistent, shared across nodes │
│  Tertiary (Valkey2) →  Fallback / replica               │
├─────────────────────────────────────────────────────────┤
│  WRITE: goes to ALL providers simultaneously            │
│  READ:  checks providers in order (primary → fallback)  │
│  MISS:  auto-backfills from lower layer to upper        │
└─────────────────────────────────────────────────────────┘
```

| Operation | Behavior |
|-----------|----------|
| `cache.set(key, value)` | Writes to **all** stores (memory + valkey1 + valkey2) |
| `cache.get(key)` | Reads from **primary** (memory) first |
| Primary miss | Falls through to **valkey1**, then **valkey2** |
| Auto backfill | On hit from lower layer, **backfills** upper layers |

This creates a **layered caching strategy**: hot data in memory, warm data in Valkey, with automatic promotion.

> Errors (e.g. missing `@keyv/valkey` package, invalid URL) throw immediately and stop the application from starting.

---

## API

### CacheModule.forRoot

Creates the NestJS DynamicModule. Accepts optional configuration — defaults to parsing `CACHE_URLS` env.

```typescript
CacheModule.forRoot(options?): DynamicModule
```

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

---

## Injection Keys

Use these to inject cache stores in any module.

| Token | Type | Description |
|-------|------|-------------|
| `CACHE_KEYV_PRIMARY` | `Keyv` | Primary (first/fastest) Keyv store |
| `CACHE_KEYV_ALL` | `Keyv[]` | All Keyv stores in order |

### Injection

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

---

## Manual Config

```typescript
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
