# typeorm

> TypeORM configuration and entity decorators for NestJS

## Status

![](https://img.shields.io/badge/alpha-orange)

## Installation

```bash
npm install xnest-kit
```

## Usage

```typescript
import { configTypeOrm } from 'xnest-kit/typeorm';

const app = await NestFactory.create(AppModule);
configTypeOrm(app, {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'mydb',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: true,
});
```

## API

### configTypeOrm(app, options)

Configure TypeORM for a NestJS application.

**Parameters:**
- `app` - NestJS application instance
- `options` - TypeORM configuration options

**Options:**
- `type` - Database type (`'postgres'`, `'mysql'`, `'sqlite'`, etc.)
- `host` - Database host
- `port` - Database port
- `database` - Database name
- `entities` - Entity classes
- `synchronize` - Auto-sync schema (dev only)

### XEntity(tableName)

Decorator for quickly defining TypeORM entities.

### XColumn(options)

Decorator for quickly defining TypeORM columns.

## Status

This module is currently a stub. Full implementation coming in v0.1.0-alpha.
