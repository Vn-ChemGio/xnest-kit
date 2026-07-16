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

  const queries = [
    NestApiQuery({
      name: 'skip',
      type: Number,
      required: false,
      example: defaultSkip,
      description: 'Number of items to skip',
    }),
    NestApiQuery({
      name: 'take',
      type: Number,
      required: false,
      example: defaultTake,
      description: 'Number of items to take',
    }),
  ];

  if (search) {
    queries.push(
      NestApiQuery({
        name: 'search',
        type: String,
        required: false,
        description: 'Search keyword',
      }),
    );
  }

  return ((target, propertyKey, descriptor) => {
    queries.forEach((deco) => deco(target, propertyKey, descriptor));
  }) as MethodDecorator & ClassDecorator;
}
