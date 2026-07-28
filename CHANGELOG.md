# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

## [0.0.5] - 2026-07-28

### Added

- Notification module — `NotificationModule.forRoot()`, `NotificationModule.forRootAsync()`
- 14 channel providers — `email`, `sms`, `push`, `telegram`, `slack`, `teams`, `googlechat`, `whatsapp`, `viber`, `line`, `webpush`, `inapp`, `discord`, `wechat`
- `NotificationService.send()` with fully typed overloads per channel
- `NotificationService.getDiagnostics()` — runtime provider/store/queue status
- TypeORM persistence — `TypeOrmNotificationStore`, `NotificationLogEntity`, `notification_logs` table
- Optional queue adapter support via `NotificationModuleOptions.queue`
- Injection decorators — `@InjectNotificationProvider`, `@InjectNotificationStore`, `@InjectNotificationQueue`, `@InjectNotificationOptions`
- Shared injection tokens — `NOTIFICATION_MODULE_OPTIONS`, `NOTIFICATION_STORE`, `NOTIFICATION_QUEUE`, `notificationProviderToken()`
- Config objects auto-resolved to provider instances via lazy imports at startup
- `shared/notification-keys.ts` — injection tokens + `notificationProviderToken()` helper
- `notification/constants.ts` — `CHANNELS`, `ProviderResult`, `NotificationProvider<T>`
- Full notification module documentation (`src/notification/README.md`)
- 740 tests across 33 test suites

### Changed

- `notification.type.ts` barrel imports — consolidated 14 channel type imports into single path
- `notification.type.ts` re-exports all 14 channel `SendInput` types for external consumers
- Root README.md — notification status badge updated to `stable-brightgreen`, added usage examples, per-channel peer dependency install commands
- Docs sidebar — added `stable-brightgreen` badge to notification entry
- `docs/examples.md` — added Notification section (module setup, async config, sending, storage, custom provider)
- `docs/api/notification.md` — full rewrite covering all 14 channels, config vs provider instances, storage, queue, decorators, injection tokens

### Deprecated

- N/A

### Removed

- N/A

### Fixed

- Import consolidation in `notification.service.ts` — 14 channel type imports → single barrel import
- TS2339/TS2345 errors in `notification.module.spec.ts` — type casts for unknown channels
- TS2339/TS2345 errors in `typeorm-notification.store.spec.ts` — `ChannelType`/`ChannelResult` casts

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
- Bracket-notation parsing for Fastify compatibility (`?where[name]=John` → `{ where: { name: 'John' } }`)
- `isNull` operator — `true`/`1` → `IsNull()`, `false`/`0` → `Not(IsNull())`
- Transaction management — `@UseTransaction(options?)`, `@GetManager()`, `TransactionInterceptor`
- Transaction isolation level support (`READ UNCOMMITTED`, `READ COMMITTED`, `REPEATABLE READ`, `SERIALIZABLE`)
- Full TypeORM module documentation (`src/typeorm/README.md`)
- 422 tests across 26 test suites

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

## [0.0.3] - 2026-07-17

### Added

- Cache module — `CacheModule.forRoot()`, `CACHE_URLS` env, `@keyv/valkey` adapter
- Cache injection tokens: `CACHE_KEYV_PRIMARY`, `CACHE_KEYV_ALL`
- `isPackageInstalled` utility — lazy package detection
- 204 tests across 18 test suites (0 errors, 0 warnings)
- Full documentation site (docsify)
- AI agent support (AGENTS.md, copilot-instructions.md)

### Changed

- Updated all docs to reflect `CacheModule.forRoot()` API
- Updated peer dependencies — `@nestjs/swagger`, `@nestjs/cache-manager` now optional
- `@keyv/redis` → `@keyv/valkey` throughout
- Removed `silent` option from `ConfigCacheOptions`
- Removed cache decorator wrappers — use `@Inject(TOKEN)` directly

### Deprecated

- N/A

### Removed

- Cache `CACHE_INSTANCE` token — inject `CACHE_MANAGER` from `@nestjs/cache-manager` directly
- Cache decorator wrappers (`InjectPrimaryCache`, `InjectAllCacheStores`, `InjectCacheInstance`)
- `silent` option from `ConfigCacheOptions`

### Fixed

- Bundlephobia entry point error — removed non-existent `.mjs` references
- CI publish workflow — OIDC Trusted Publishing (no NPM_TOKEN)

### Security

- N/A

---

## [0.0.2] - 2026-07-16

### Added

- Swagger module — `configSwagger`, DocumentBuilder, Scalar integration
- Swagger `defaultResponses` option — auto-generate error responses
- Swagger `@ApiResponses` decorator — `ApiResponseOptions[]` + `defaultResponses` merge
- Swagger `@ApiErrorCodes` decorator — controller-level error responses
- Swagger `applyDefaultResponses` — post-process OpenAPI document
- Swagger `buildDefaultError` — NestJS-style error responses for all HTTP status codes
- Swagger `@ApiProperty` enhanced — custom `XPropertyOptions` with `format` → auto-example
- Swagger `@ApiParam` enhanced — type-safe overloads, auto-example
- Swagger `@ApiQuery` enhanced — type-safe overloads, auto-example, `isArray`
- Swagger `@ApiHideProperty` — custom implementation via `Reflect.defineMetadata`
- Swagger re-exports from `@nestjs/swagger`: `ApiOkResponse`, `ApiOperation`, `ApiProduces`, `ApiTags`
- Swagger security presets
- CI workflow with test + lint + build
- Husky + commitlint setup

### Changed

- Renamed `openapi` module → `swagger`
- Moved `HTTP_STATUS_TEXT` to `src/swagger/shared.ts`
- Moved `buildDefaultError` to `src/swagger/shared.ts` (internal, not exported)
- Removed `bypassDefaults` option — too complex (DiscoveryService unavailable)
- Removed `auto401` — will be integrated into security decorators later
- `DefaultResponses` type changed to `number[]`

### Deprecated

- N/A

### Removed

- `bypassDefaults` option from `configSwagger`
- `auto401` from `DefaultResponses` type
- `buildDefaultError` from public API — now internal to swagger module

### Fixed

- ESLint warnings — `index.ts` cast, rest params pattern in `api-responses.ts`

### Security

- N/A

---

## [0.0.1-alpha.0] - 2024-01-01

### Added

- Initial alpha release
- Project scaffolding
- Feature module stubs

[Unreleased]: https://github.com/Vn-ChemGio/xnest-kit/compare/v0.0.5...HEAD
[0.0.5]: https://github.com/Vn-ChemGio/xnest-kit/compare/v0.0.4...v0.0.5
[0.0.4]: https://github.com/Vn-ChemGio/xnest-kit/compare/v0.0.3...v0.0.4
[0.0.3]: https://github.com/Vn-ChemGio/xnest-kit/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/Vn-ChemGio/xnest-kit/compare/v0.0.1-alpha.0...v0.0.2
[0.0.1-alpha.0]: https://github.com/Vn-ChemGio/xnest-kit/releases/tag/v0.0.1-alpha.0
