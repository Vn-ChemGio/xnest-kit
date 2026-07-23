# xnest-kit/typeorm

TypeORM utilities for NestJS — config resolution, entity decorators, query builder, and transaction management.

## Prerequisites

```bash
npm install typeorm @nestjs/typeorm
```

## Quick Start

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from 'xnest-kit/typeorm';

@Module({
  imports: [TypeOrmModule.forRoot()], // reads DATABASE_URL / DATABASE_URLS env
})
export class AppModule {}
```

## Table of Contents

- [Config](#config)
- [Entity Decorators](#entity-decorators)
- [Column Decorators](#column-decorators)
- [Index Decorators](#index-decorators)
- [Query Builder (Filterable)](#query-builder)
- [Transaction Management](#transaction-management)

---

## Config

### TypeOrmModule.forRoot

Wraps `@nestjs/typeorm` with automatic env resolution.

```typescript
TypeOrmModule.forRoot(options?): DynamicModule
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `type` | `DatabaseType` | auto | Database type (`postgres`, `mysql`, etc.) |
| `host` | `string` | `localhost` | Database host |
| `port` | `number` | `5432` | Database port |
| `database` | `string` | `postgres` | Database name |
| `username` | `string` | `''` | Database username |
| `password` | `string` | `''` | Database password |
| `url` | `string` | - | Full connection URL (overrides host/port/db/user/pass) |
| `entities` | `any[]` | dist glob | Entity directories, classes, or glob patterns |
| `synchronize` | `boolean` | `false` | Auto-create/update schema on startup |
| `logging` | `boolean` | `false` | Enable query logging |
| `ssl` | `boolean \| object` | `false` | SSL configuration |
| `poolSize` | `number` | `10` | Connection pool size |
| `isGlobal` | `boolean` | `true` | Register as global module |

### configTypeOrm

Standalone config resolver. Use when you need the config object separately.

```typescript
configTypeOrm(options?): TypeOrmModuleOptions
```

### Environment Variables

Priority: explicit options > `DATABASE_URLS` > `DATABASE_URL` > pass-through.

```env
# Single connection
DATABASE_URL=postgres://user:pass@localhost:5432/mydb

# Master/slave replication (pipe-separated, first = master)
DATABASE_URLS=postgres://master:5432/mydb|postgres://slave1:5432/mydb|postgres://slave2:5432/mydb
```

> `DATABASE_URLS` with multiple URLs auto-configures master/slave replication. All URLs must use the same protocol.

### Full Example

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from 'xnest-kit/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      database: 'mydb',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
  ],
})
export class AppModule {}
```

---

## Entity Decorators

### XEntity

Enhanced `@Entity` decorator with auto-applied soft delete and timestamps.

```typescript
@XEntity(tableName?, options?): ClassDecorator
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `softDelete` | `boolean` | `true` | Auto-apply `@DeleteDateColumn()` |
| `timestamps` | `boolean` | `true` | Auto-apply `@CreateDateColumn()` + `@UpdateDateColumn()` |

Plus all standard TypeORM `EntityOptions` (name, schema, engine, etc.).

```typescript
import { XEntity, XId, Column } from 'xnest-kit/typeorm';

@XEntity('users')
export class User {
  @XId()
  id: string;

  @Column()
  name: string;

  // Auto: createdAt, updatedAt, deletedAt
}

// Disable soft delete
@XEntity('logs', { softDelete: false })
export class Log {
  @XId()
  id: string;

  // Auto: createdAt, updatedAt (no deletedAt)
}

// Disable all auto columns
@XEntity('config', { softDelete: false, timestamps: false })
export class Config {
  @Column({ primary: true })
  key: string;
}
```

---

## Column Decorators

All column decorators accept `ColumnOptions` (`{ nullable?, default? }`).

### Identity

| Decorator | TypeORM Equivalent | Description |
|-----------|-------------------|-------------|
| `@XId()` | `@PrimaryGeneratedColumn('uuid')` | UUID primary key |
| `@XIncrementId()` | `@PrimaryGeneratedColumn('increment')` | Auto-increment primary key |

### Timestamps

| Decorator | Column Name | Description |
|-----------|-------------|-------------|
| `@XCreatedAt()` | `created_at` | Set on insert, never updated |
| `@XUpdatedAt()` | `updated_at` | Updated on every persist |
| `@XDeletedAt()` | `deleted_at` | Set on soft delete, `null` when active |
| `@XVersion()` | - | Optimistic locking version column |

### Common Columns

| Decorator | TypeORM Type | Details |
|-----------|-------------|---------|
| `@XUuid()` | `uuid` | UUID column |
| `@XEmail()` | `varchar(255)` | Email column |
| `@XPhone()` | `varchar(20)` | Phone number column |
| `@XUrl()` | `varchar(2048)` | URL column |
| `@XIp()` | `varchar(45)` | IP address (IPv4 + IPv6) |
| `@XJson()` | `jsonb` | JSON/JSONB column |
| `@XMoney(precision?, scale?)` | `decimal` | Money/decimal (default: precision=10, scale=2) |
| `@XBoolean()` | `boolean` | Boolean column |
| `@XEnum(values)` | `enum` | Enum column |

### Examples

```typescript
import { XEntity, XId, XUuid, XEmail, XMoney, XBoolean, XEnum, XJson } from 'xnest-kit/typeorm';

enum Status { ACTIVE = 'active', INACTIVE = 'inactive' }

@XEntity('products')
export class Product {
  @XId()
  id: string;

  @XUuid()
  trackingId: string;

  @XEmail()
  email: string;

  @XMoney(12, 4)
  price: number;

  @XBoolean()
  isActive: boolean;

  @XEnum(Status)
  status: Status;

  @XJson({ nullable: true })
  metadata: Record<string, unknown>;
}
```

---

## Index Decorators

### HalfIndex

Partial index with `WHERE deleted_at IS NULL` — only indexes active (non-deleted) rows. Supports PostgreSQL, SQLite, and CockroachDB.

```typescript
@HalfIndex(options?): ClassDecorator
@HalfIndex(name?, options?): ClassDecorator
```

| Option | Type | Description |
|--------|------|-------------|
| `columns` | `string[]` | Column(s) to index (omit to index decorated property) |
| `unique` | `boolean` | Create a unique index |
| `name` | `string` | Custom index name |

```typescript
import { XEntity, XId, Column, HalfIndex } from 'xnest-kit/typeorm';

@XEntity('users')
@HalfIndex({ columns: ['email'], unique: true })
export class User {
  @XId()
  id: string;

  @Column()
  email: string;
}
// → CREATE UNIQUE INDEX ... ON users (email) WHERE deleted_at IS NULL

@XEntity('orders')
@HalfIndex('idx_order_status', { columns: ['status'] })
export class Order {
  @XId()
  id: string;

  @Column()
  status: string;
}
// → CREATE INDEX idx_order_status ON orders (status) WHERE deleted_at IS NULL
```

---

## Query Builder

### Filterable + ParsedQuery

Type-safe query param parsing with whitelist filtering, operator support, and auto-validation.

| Decorator | Type | Description |
|-----------|------|-------------|
| `@Filterable<T>(options)` | Method | Marks endpoint as filterable, stores config |
| `@ParsedQuery()` | Parameter | Parses query params into `FindManyOptions<T>` |

#### Filterable Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `searchable` | `DotNotationKey<T>[]` | all | Allowed field names (whitelist) |
| `like` | `DotNotationKey<T>[]` | none | Fields that allow `LIKE` queries |
| `relations` | `string[]` | all | Allowed relations for loading |
| `maxTake` | `number` | `100` | Maximum take limit |
| `defaultTake` | `number` | `20` | Default take when not specified |

#### Supported Operators

| Operator | URL Example | TypeORM Result |
|----------|-------------|----------------|
| `eq` | `?where[name]=John` | `name: 'John'` (default) |
| `gt` | `?where[age][gt]=18` | `age: MoreThan(18)` |
| `gte` | `?where[age][gte]=18` | `age: MoreThanOrEqual(18)` |
| `lt` | `?where[age][lt]=65` | `age: LessThan(65)` |
| `lte` | `?where[age][lte]=65` | `age: LessThanOrEqual(65)` |
| `like` | `?where[name][like]=john` | `name: Like('%john%')` |
| `ilike` | `?where[name][ilike]=john` | `name: ILike('%john%')` |
| `in` | `?where[status][in]=a,b` | `status: In(['a', 'b'])` |
| `between` | `?where[age][between]=18,65` | `age: Between(18, 65)` |
| `not` | `?where[status][not]=deleted` | `status: Not('deleted')` |
| `isNull` | `?where[email][isNull]=true` | `email: IsNull()` |
| `isNull` | `?where[email][isNull]=false` | `email: Not(IsNull())` |

#### Basic Usage

```typescript
import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { Filterable, ParsedQuery } from 'xnest-kit/typeorm';
import { FindManyOptions } from 'typeorm';

@Controller('users')
export class UsersController {
  @Get()
  @Filterable<User>({
    searchable: ['name', 'email', 'age', 'status'],
    like: ['name', 'email'],
    relations: ['profile', 'posts'],
    maxTake: 100,
    defaultTake: 20,
  })
  async findAll(@ParsedQuery() query: FindManyOptions<User>) {
    return this.userService.find(query);
  }
}
```

#### URL Examples

```
# Basic filter + pagination + sort
GET /users?where[name]=John&take=10&skip=0&order[createdAt]=DESC

# Operator map
GET /users?where[age][gte]=18&where[age][lte]=65&where[status][in]=active,pending

# Dot notation for nested relations
GET /users?where[profile.name]=Admin&relations=profile

# LIKE query (field must be in 'like' array)
GET /users?where[name][like]=john

# Bracket notation (Fastify-compatible)
GET /users?where[name]=John&where[age][gte]=18
```

#### Dot Notation for Nested Relations

```typescript
@Filterable<User>({
  searchable: ['name', 'profile.name', 'profile.bio'],
  like: ['name', 'profile.name'],
  relations: ['profile'],
})
async findAll(@ParsedQuery() query: FindManyOptions<User>) {}

// URL: ?where[profile.name]=Admin
// Result: { where: { 'profile.name': 'Admin' } }
```

#### Validation

`@ParsedQuery()` automatically validates query params and throws `BadRequestException` with error details:

```typescript
// URL: ?take=abc&where[secret]=hack
// Throws 400: [
//   "take: must be a positive integer, got 'abc'",
//   "where.secret: field not in searchable list ['name', 'email']"
// ]
```

#### Standalone Usage

```typescript
import { buildQuery, validateQuery } from 'xnest-kit/typeorm';

const options = buildQuery(req.query, {
  searchable: ['name', 'email', 'age'],
  like: ['name', 'email'],
  relations: ['profile'],
  maxTake: 100,
  defaultTake: 20,
});

const errors = validateQuery(req.query, {
  searchable: ['name', 'email', 'age'],
});
if (errors.length > 0) {
  throw new BadRequestException(errors);
}

const users = await userRepository.find(options);
```

---

## Transaction Management

### UseTransaction + GetManager + TransactionInterceptor

Automatic database transaction management with error rollback.

| Decorator/Class | Type | Description |
|----------------|------|-------------|
| `@UseTransaction(options?)` | Method | Wraps handler in a transaction |
| `@GetManager()` | Parameter | Injects the transactional `EntityManager` |
| `TransactionInterceptor` | Interceptor | Reads metadata, manages transaction lifecycle |

#### Transaction Options

| Option | Type | Description |
|--------|------|-------------|
| `isolation` | `IsolationLevel` | Database isolation level |

Isolation levels: `READ UNCOMMITTED`, `READ COMMITTED`, `REPEATABLE READ`, `SERIALIZABLE`.

#### Usage

```typescript
import { UseInterceptors, Controller, Post, Body } from '@nestjs/common';
import { UseTransaction, GetManager, TransactionInterceptor } from 'xnest-kit/typeorm';

@Controller('orders')
@UseInterceptors(TransactionInterceptor)
export class OrdersController {
  @Post()
  @UseTransaction({ isolation: 'SERIALIZABLE' })
  async create(
    @GetManager() em: EntityManager,
    @Body() dto: CreateOrderDto,
  ) {
    const order = em.create(Order, dto);
    await em.save(order);
    // auto-commit on success, auto-rollback on error
    return order;
  }
}
```

#### Lifecycle

```
Request → @UseTransaction() detected → startTransaction()
  → Handler executes with @GetManager() EntityManager
    → Success: commitTransaction() → release()
    → Error: rollbackTransaction() → release() → re-throw
```

- **No `@UseTransaction()`** — handler executes normally (no transaction)
- **Success** — transaction is committed, query runner released
- **Error** — transaction is rolled back, error re-thrown, query runner always released
- **Isolation level** — optional, passed to `startTransaction()`

#### Multi-Table Example

```typescript
@Post()
@UseTransaction()
async transferFunds(
  @GetManager() em: EntityManager,
  @Body() dto: TransferDto,
) {
  const sender = await em.findOneOrFail(Account, { where: { id: dto.from } });
  const receiver = await em.findOneOrFail(Account, { where: { id: dto.to } });

  sender.balance -= dto.amount;
  receiver.balance += dto.amount;

  await em.save([sender, receiver]);
  // Both save atomically — rollback if either fails
  return { sender, receiver };
}
```

---

## Package Exports

```typescript
// Config
import { configTypeOrm, TypeOrmModule } from 'xnest-kit/typeorm';

// Entity decorators
import { XEntity, HalfIndex } from 'xnest-kit/typeorm';

// Column decorators
import {
  XId, XIncrementId, XUuid, XEmail, XPhone, XUrl,
  XIp, XJson, XMoney, XBoolean, XEnum,
  XCreatedAt, XUpdatedAt, XDeletedAt, XVersion,
} from 'xnest-kit/typeorm';

// Query builder
import { Filterable, ParsedQuery, buildQuery, validateQuery } from 'xnest-kit/typeorm';

// Transactions
import { UseTransaction, GetManager, TransactionInterceptor } from 'xnest-kit/typeorm';

// Types
import type {
  TransactionOptions,
  BuildQueryOptions,
  BuildQueryResult,
  DotNotationKey,
  QueryOperator,
  RawQueryParams,
  ColumnOptions,
  XEntityOptions,
  HalfIndexOptions,
} from 'xnest-kit/typeorm';
```
