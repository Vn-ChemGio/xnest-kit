# xnest-kit/cache

Cache utilities for NestJS — zero-config setup via `CACHE_URLS` env variable.

Supports **memory** and **Valkey/Redis** providers simultaneously through [Keyv](https://keyv.org).

## Prerequisites

```bash
npm install @nestjs/cache-manager cache-manager keyv
```

For Valkey/Redis support:

```bash
npm install @keyv/redis
```

## Quick Start

```typescript
import { Module } from '@nestjs/common';
import { configCache, CacheModule } from 'xnest-kit/cache';

@Module({
  imports: [CacheModule.forRoot(configCache())],
})
export class AppModule {}
```

Reads `CACHE_URLS` from environment automatically.

## CACHE_URLS Format

Pipe-separated (`|`) URLs:

| Value | Store |
|-------|-------|
| (empty / not set) | Memory only |
| `redis://localhost:6379` | Single Valkey |
| `\|redis://host1:6379` | Memory + Valkey |
| `\|redis://host1:6379\|redis://host2:6379` | Memory + 2 Valkey |
| `redis://host1:6379\|redis://host2:6379` | 2 Valkey (no memory) |

```env
# Memory only (default)
CACHE_URLS=

# Single valkey
CACHE_URLS=redis://localhost:6379

# Memory + valkey
CACHE_URLS=|redis://localhost:6379

# Memory + 2 valkey instances
CACHE_URLS=|redis://host1:6379|redis://host2:6379
```

## Multi-Provider Data Storage

When using multiple providers (e.g., `|redis://host1|redis://host2`), data flows as follows:

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
| `cache.set(key, value)` | Writes to **all** stores (memory + redis1 + redis2) |
| `cache.get(key)` | Reads from **primary** (memory) first |
| Primary miss | Falls through to **redis1**, then **redis2** |
| Auto backfill | On hit from lower layer, **backfills** upper layers |

This creates a **layered caching strategy**: hot data in memory, warm data in Redis, with automatic promotion.

---

## API

### configCache

Creates cache configuration. Does NOT create a module.

```typescript
configCache(options?): CacheConfig
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `stores` | `CacheStoreOptions[]` | auto | Cache store configurations (overrides `CACHE_URLS`) |
| `ttl` | `number` | - | Default TTL in milliseconds |
| `isGlobal` | `boolean` | `true` | Register as global module |
| `nonBlocking` | `boolean` | `false` | Allow non-blocking multi-store operations |
| `silent` | `boolean` | `false` | Suppress connection error logs |

### CacheModule.forRoot

Creates the NestJS DynamicModule from a CacheConfig.

```typescript
CacheModule.forRoot(config): DynamicModule
```

---

## Injection Keys

Use these to inject cache stores in any module.

| Token | Type | Description |
|-------|------|-------------|
| `CACHE_KEYV_PRIMARY` | `Keyv` | Primary (first/fastest) Keyv store |
| `CACHE_KEYV_ALL` | `Keyv[]` | All Keyv stores in order |
| `CACHE_INSTANCE` | `Cache` | NestJS Cache instance (cache-manager) |

### Decorators

```typescript
import { InjectPrimaryCache, InjectAllCacheStores, InjectCacheInstance } from 'xnest-kit/cache';

@Injectable()
export class UserService {
  @InjectPrimaryCache()
  private cache!: Keyv;

  @InjectAllCacheStores()
  private stores!: Keyv[];

  @InjectCacheInstance()
  private nestCache!: Cache;
}
```

---

## Manual Config

```typescript
@Module({
  imports: [
    CacheModule.forRoot(configCache({
      stores: [
        { provider: 'memory', namespace: 'session', ttl: 60_000 },
        { provider: 'valkey', url: 'redis://localhost:6379', namespace: 'cache' },
      ],
      ttl: 30_000,
    })),
  ],
})
export class AppModule {}
```

---

## Adapters

### createMemoryStore

```typescript
import { createMemoryStore } from 'xnest-kit/cache';

const store = createMemoryStore('sessions', 60_000);
// store.store → Keyv instance
// store.provider → 'memory'
```

### createValkeyStore

```typescript
import { createValkeyStore } from 'xnest-kit/cache';

const store = createValkeyStore('redis://localhost:6379', 'cache');
// store.store → Keyv instance backed by @keyv/redis
// store.provider → 'valkey'
```
