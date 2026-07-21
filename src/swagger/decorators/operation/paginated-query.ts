import { ApiQuery as NestApiQuery } from '@nestjs/swagger';

export interface PaginatedQueryOptions {
  /** Enable `search` query parameter. Default: `true` */
  search?: boolean;
  /** Default `skip` value. Default: `0` */
  defaultSkip?: number;
  /** Default `take` value. Default: `10` */
  defaultTake?: number;
}

/**
 * Apply pagination query parameters (`skip`, `take`) and optional `search`
 * in a single decorator call.
 *
 * @param options - Configuration options
 * @returns Combined method/class decorator
 *
 * @example
 * ```typescript
 * import { PaginatedQuery } from 'xnest-kit/swagger';
 *
 * @PaginatedQuery()
 * @Get()
 * findAll() {}
 *
 * @PaginatedQuery({ search: false, defaultTake: 20 })
 * @Get()
 * findAll() {}
 * ```
 */
export function PaginatedQuery(
  options: PaginatedQueryOptions = {},
): MethodDecorator & ClassDecorator {
  const { search = true, defaultSkip = 0, defaultTake = 10 } = options;

  return ((target, propertyKey, descriptor) => {
    NestApiQuery({
      name: 'skip',
      type: Number,
      required: false,
      enum: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      example: defaultSkip,
      description: 'Number of items to skip',
    })(target, propertyKey, descriptor);

    NestApiQuery({
      name: 'take',
      type: Number,
      required: false,
      enum: [10, 20, 50, 100],
      example: defaultTake,
      description: 'Number of items to take',
    })(target, propertyKey, descriptor);

    if (search) {
      NestApiQuery({
        name: 'search',
        type: String,
        required: false,
        description: 'Search keyword',
      })(target, propertyKey, descriptor);
    }
  }) as MethodDecorator & ClassDecorator;
}
