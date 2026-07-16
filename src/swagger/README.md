# xnest-kit/swagger

Swagger/Scalar configuration and enhanced decorators for NestJS.

> Write less boilerplate. Get fully documented APIs in minutes.

## Prerequisites

```bash
npm install @nestjs/swagger
```

Optional — for Scalar UI:

```bash
npm install @scalar/nestjs-api-reference
```

## Quick Start

```typescript
import { NestFactory } from '@nestjs/core';
import { configSwagger } from 'xnest-kit/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configSwagger(app, { title: 'My API', version: '1.0.0' });
  await app.listen(3000);
}
bootstrap();
```

Automatically uses **Scalar** if `@scalar/nestjs-api-reference` is installed, otherwise **Swagger UI**.

## configSwagger

```typescript
configSwagger(app, options?): OpenAPIObject
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | `string` | `'API'` | API title |
| `description` | `string` | `''` | API description |
| `version` | `string` | `'1.0.0'` | API version |
| `path` | `string` | `'api/docs'` | Docs path (no leading `/`) |
| `tags` | `TagObject[]` | - | API tags for grouping |
| `servers` | `ServerObject[]` | - | Server URLs |
| `securities` | `SwaggerSecurity[]` | - | Security schemes |
| `defaultResponses` | `number[]` | - | Default error responses for all endpoints |

```typescript
configSwagger(app, {
  title: 'My API',
  securities: [{ name: 'bearer', preset: 'bearer' }],
  defaultResponses: [400, 401, 403, 404, 500],
});
```

---

## Decorators

### @ApiResponse

`status` is **auto-detected** from the HTTP method — no need to specify manually.

| Method | Status |
|--------|--------|
| `GET` | `200` |
| `POST` | `201` |
| `PUT` / `PATCH` | `200` |
| `DELETE` | `204` |

**Before** (raw `@nestjs/swagger`):

```typescript
import { ApiResponse } from '@nestjs/swagger';

@ApiResponse({ status: 200, type: User })
@Get(':id')
findOne() {}

@ApiResponse({ status: 201, type: User })
@Post()
create() {}

@ApiResponse({ status: 200, type: [User] })
@Get()
findAll() {}
```

**After** (xnest-kit):

```typescript
import { ApiResponse } from 'xnest-kit/swagger';

// status auto-detected: 200, 201, 200
@ApiResponse({ type: User })
@Get(':id')
findOne() {}

@ApiResponse({ type: User })
@Post()
create() {}

@ApiResponse({ type: [User] })
@Get()
findAll() {}
```

> Saves 3 × `status: xxx` repetitions per controller.

---

### @ApiResponses

Apply multiple `@ApiResponse` in one call. Merges with `defaultResponses` from `configSwagger`.

**Before:**

```typescript
@ApiResponse({ status: 201, type: User })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@Post()
create() {}
```

**After:**

```typescript
import { ApiResponses } from 'xnest-kit/swagger';

// 3 decorators → 1 call + auto defaultResponses
@ApiResponses([{ status: 201, type: User }, { status: 400, description: 'Bad request' }])
@Post()
create() {}
```

---

### PaginatedType

Create a paginated response type in one line.

**Before:**

```typescript
class PaginatedUser {
  @ApiProperty({ type: [User] })
  data: User[];

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;
}
```

**After:**

```typescript
import { PaginatedType } from 'xnest-kit/swagger';

// 12 lines → 1 line
@ApiResponse({ type: PaginatedType(User) })
@Get()
findAll() {}
```

---

### @PaginatedQuery

Apply `skip`, `take`, `search` query params in one decorator.

**Before:**

```typescript
@ApiResponse({ type: PaginatedType(User) })
@ApiQuery({ name: 'skip', type: Number, required: false, example: 0 })
@ApiQuery({ name: 'take', type: Number, required: false, example: 10 })
@ApiQuery({ name: 'search', type: String, required: false })
@Get()
findAll() {}
```

**After:**

```typescript
import { PaginatedQuery, PaginatedType } from 'xnest-kit/swagger';

// 3 @ApiQuery → 1 @PaginatedQuery
@PaginatedQuery()
@ApiResponse({ type: PaginatedType(User) })
@Get()
findAll() {}
```

Options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `search` | `boolean` | `true` | Enable `search` query param |
| `defaultSkip` | `number` | `0` | Default skip value |
| `defaultTake` | `number` | `10` | Default take value |

---

### @ApiProperty

Auto-example generation based on `type` + `format`.

**Before:**

```typescript
@ApiProperty({ type: String, example: '550e8400-e29b-41d4-a716-446655440000' })
id: string;

@ApiProperty({ type: String, example: 'user@example.com' })
email: string;
```

**After:**

```typescript
import { ApiProperty } from 'xnest-kit/swagger';

// example auto-generated from format
@ApiProperty({ type: String, format: 'uuid' })
id: string;

@ApiProperty({ type: String, format: 'email' })
email: string;
```

---

### @ApiQuery

Type-safe `format` options. Defaults to `required: false`.

```typescript
import { ApiQuery } from 'xnest-kit/swagger';

@ApiQuery({ name: 'email', format: 'email' })
findByEmail() {}

@ApiQuery({ name: 'page', type: Number, format: 'int32' })
findAll() {}
```

---

### @ApiParam

Auto-example from `format`.

```typescript
import { ApiParam } from 'xnest-kit/swagger';

@ApiParam({ name: 'id', type: String, format: 'uuid' })
findOne() {}
```

---

### @ApiErrorCodes

```typescript
import { ApiErrorCodes } from 'xnest-kit/swagger';

@ApiErrorCodes([400, 404, 500])
@Controller('users')
export class UserController {}
```

---

## Full CRUD Example

```typescript
import { ApiResponse, ApiResponses, PaginatedType, PaginatedQuery } from 'xnest-kit/swagger';

@Controller('users')
export class UserController {
  @PaginatedQuery()
  @ApiResponse({ type: PaginatedType(User) })
  @Get()
  findAll() {}

  @ApiResponse({ type: User })
  @Get(':id')
  findOne(@Param('id') id: string) {}

  @ApiResponses([{ status: 201, type: User }, { status: 400, description: 'Bad request' }])
  @Post()
  create(@Body() dto: CreateUserDto) {}

  @ApiResponse({ type: User })
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {}

  @ApiResponse({ status: 204 })
  @Delete(':id')
  remove(@Param('id') id: string) {}
}
```

---

## Re-exported from @nestjs/swagger

- **Decorators**: `@ApiOperation`, `@ApiTags`, `@ApiConsumes`, `@ApiProduces`, `@ApiBody`, `@ApiHeader`, `@ApiExtraModels`, `@ApiExcludeEndpoint`, `@ApiExtension`, `@ApiOkResponse`
- **Security**: `@ApiBearerAuth`, `@ApiBasicAuth`, `@ApiOAuth2`, `@ApiSecurity`, `@ApiCookieAuth`
- **Map**: `OmitType`, `PickType`, `PartialType`, `DeepPartialType`, `IntersectionType`
