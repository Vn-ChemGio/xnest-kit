# Configuration

## Global Configuration

Each module can be configured globally when imported in your root module.

## Module-Specific Configuration

### Swagger Configuration

```typescript
configSwagger(app, {
  title: 'My API',
  description: 'API documentation',
  version: '1.0.0',
  provider: 'swagger', // or 'scalar'
});
```

### Cache Configuration

```typescript
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

Or use `CACHE_URLS` env for zero-config:

```env
CACHE_URLS=|valkey://localhost:6379
```

```typescript
import { CacheModule } from 'xnest-kit/cache';

@Module({
  imports: [CacheModule.forRoot()],
})
export class AppModule {}
```

### TypeORM Configuration

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

Or use `DATABASE_URL` env for zero-config:

```env
DATABASE_URL=postgres://user:pass@localhost:5432/mydb
```

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from 'xnest-kit/typeorm';

@Module({
  imports: [TypeOrmModule.forRoot()],
})
export class AppModule {}
```

## Environment Variables

It's recommended to use environment variables for sensitive configuration:

```env
CACHE_URLS=|valkey://localhost:6379
```

## Next Steps

- [API Reference](/api/)
