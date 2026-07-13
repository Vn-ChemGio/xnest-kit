# Configuration

## Global Configuration

Each module can be configured globally when imported in your root module.

## Module-Specific Configuration

### OpenAPI Configuration

```typescript
configOpenApi(app, {
  title: 'My API',
  description: 'API documentation',
  version: '1.0.0',
  provider: 'swagger', // or 'scalar'
});
```

### Cache Configuration

```typescript
configCache(app, {
  store: 'redis',
  host: 'localhost',
  port: 6379,
  ttl: 60,
});
```

### TypeORM Configuration

```typescript
configTypeOrm(app, {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'mydb',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: true,
});
```

## Environment Variables

It's recommended to use environment variables for sensitive configuration:

```typescript
configCache(app, {
  store: 'redis',
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
});
```

## Next Steps

- [API Reference](/api/)
