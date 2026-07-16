import { ApiProperty } from '@nestjs/swagger';
import type { Type } from '@nestjs/common';

/**
 * Create a paginated response type wrapper.
 *
 * Returns a class that NestJS Swagger can introspect,
 * with `data`, `total`, `page`, and `limit` properties.
 *
 * @param itemClass - The class of items in the paginated response
 * @returns A new class representing the paginated response
 *
 * @example
 * ```typescript
 * @ApiResponse({ type: Paginated(User) })
 * @Get()
 * findAll() {}
 * ```
 */
export function Paginated<T>(itemClass: Type<T>): Type<{
  data: T[];
  total: number;
  page: number;
  limit: number;
}> {
  class PaginatedResponse {
    @ApiProperty({ type: [itemClass], description: 'Array of items' })
    data!: T[];

    @ApiProperty({
      type: Number,
      example: 100,
      description: 'Total number of items',
    })
    total!: number;

    @ApiProperty({
      type: Number,
      example: 1,
      description: 'Current page number',
    })
    page!: number;

    @ApiProperty({
      type: Number,
      example: 10,
      description: 'Number of items per page',
    })
    limit!: number;
  }

  Object.defineProperty(PaginatedResponse, 'name', {
    value: `Paginated${itemClass.name}`,
  });

  return PaginatedResponse;
}
