# Changelog

All notable changes to xnest-kit will be documented in this file.

## [Unreleased]

### Added

- N/A

### Changed

- N/A

### Deprecated

- N/A

### Removed

- N/A

### Fixed

- N/A

### Security

- N/A

---

## [0.0.4] - 2026-07-23

### Added

- TypeORM module — `TypeOrmModule.forRoot()`, `configTypeOrm()`, `DATABASE_URL`/`DATABASE_URLS` env resolution
- `DATABASE_URLS` master/slave replication support (pipe-separated URLs)
- Entity decorators — `XEntity` (soft delete + timestamps), `HalfIndex` (partial index `WHERE deleted_at IS NULL`)
- Column decorators — `XId`, `XIncrementId`, `XUuid`, `XEmail`, `XPhone`, `XUrl`, `XIp`, `XJson`, `XMoney`, `XBoolean`, `XEnum`, `XCreatedAt`, `XUpdatedAt`, `XDeletedAt`, `XVersion`
- Query builder — `buildQuery()`, `validateQuery()` with 11 operators (`eq`, `gt`, `gte`, `lt`, `lte`, `like`, `ilike`, `in`, `between`, `not`, `isNull`)
- `@Filterable<T>()` decorator — type-safe query config with `searchable`, `like`, `relations`, `maxTake`, `defaultTake`
- `@ParsedQuery()` parameter decorator — auto-parses query params into TypeORM `FindManyOptions`, throws `BadRequestException` on validation errors
- Bracket-notation parsing for Fastify compatibility (`?where[name]=John` -> `{ where: { name: 'John' } }`)
- `isNull` operator — `true`/`1` -> `IsNull()`, `false`/`0` -> `Not(IsNull())`
- Transaction management — `@UseTransaction(options?)`, `@GetManager()`, `TransactionInterceptor`
- Transaction isolation level support (`READ UNCOMMITTED`, `READ COMMITTED`, `REPEATABLE READ`, `SERIALIZABLE`)
- Full TypeORM module documentation
- 442 tests across 28 test suites

### Changed

- `ParsedQuery` now throws `BadRequestException` immediately on validation errors instead of returning errors silently
- Replaced `console.log` with NestJS `Logger` in `ParsedQuery` decorator

### Deprecated

- N/A

### Removed

- N/A

### Fixed

- Fastify bracket-notation query param parsing (`?where[name]=John` now works correctly)
- `isNull` operator with `'false'`/`'0'` now correctly returns `Not(IsNull())` instead of `null`
- `filterable.decorator.ts` branch coverage improved from 75% to 95%

### Security

- N/A

---

See [GitHub Releases](https://github.com/Vn-ChemGio/xnest-kit/releases) for detailed version history.
