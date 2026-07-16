import { ApiResponse as NestApiResponse } from '@nestjs/swagger';
import type { ApiResponseOptions } from '@nestjs/swagger';

const STATUS_MAP: Record<string, number> = {
  GET: 200,
  POST: 201,
  PUT: 200,
  PATCH: 200,
  DELETE: 204,
};

function getStatus(target: object, key: string): number {
  const method: string =
    (Reflect.getMetadata('method', target, key) as string) ?? '';
  return STATUS_MAP[method.toUpperCase()] ?? 200;
}

/**
 * Enhanced `@ApiResponse` decorator.
 *
 * Same as `@nestjs/swagger` `ApiResponse`, but `status` is optional
 * and auto-detected from the HTTP method.
 *
 * @example
 * ```typescript
 * @ApiResponse({ type: User })
 * @Get(':id')
 * findOne(@Param('id') id: string) {}
 *
 * @ApiResponse({ type: PaginatedType(User) })
 * @Get()
 * findAll() {}
 * ```
 */
export function ApiResponse(
  options: ApiResponseOptions,
): MethodDecorator & ClassDecorator {
  return (
    target: object,
    propertyKey?: string | symbol,
    descriptor?: TypedPropertyDescriptor<unknown>,
  ) => {
    if (!propertyKey) return;

    const status = options.status ?? getStatus(target, String(propertyKey));

    NestApiResponse({ ...options, status }, { overrideExisting: true })(
      target,
      propertyKey,
      descriptor,
    );
  };
}
