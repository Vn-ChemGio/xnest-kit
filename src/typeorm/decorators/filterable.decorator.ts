import {
  createParamDecorator,
  type ExecutionContext,
  Logger,
} from '@nestjs/common';
import type { FindManyOptions } from 'typeorm';
import { buildQuery, validateQuery } from '../query/build-query';
import type { BuildQueryOptions, RawQueryParams } from '../query/types';

const FILTERABLE_KEY = 'xnest-kit:filterable';

interface FilterableMetadata<T = Record<string, unknown>> {
  options: BuildQueryOptions<T>;
}

/**
 * Method decorator that marks an endpoint as filterable via query params.
 *
 * Stores the filter configuration so that `@ParsedQuery()` can automatically
 * parse and validate the incoming query parameters.
 *
 * @typeParam T - Entity type for type-safe field names
 * @param options - Filter configuration (searchable fields, LIKE fields, allowed relations, etc.)
 * @returns Method decorator
 *
 * @example
 * ```typescript
 * import { Filterable, ParsedQuery } from 'xnest-kit/typeorm';
 * import { FindManyOptions } from 'typeorm';
 *
 * @Controller('users')
 * export class UsersController {
 *   @Get()
 *   @Filterable<User>({
 *     searchable: ['name', 'email', 'age', 'status'],
 *     like: ['name', 'email'],
 *     relations: ['profile', 'posts'],
 *     maxTake: 100,
 *     defaultTake: 20,
 *   })
 *   async findAll(@ParsedQuery() query: FindManyOptions<User>) {
 *     return this.userService.find(query);
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // URL: ?where[name]=John&where[age][gte]=18&take=10&order[name]=ASC&relations=profile
 * // Parsed query will be:
 * // {
 * //   where: { name: Like('%John%'), age: MoreThanOrEqual(18) },
 * //   take: 10,
 * //   order: { name: 'ASC' },
 * //   relations: ['profile'],
 * // }
 * ```
 *
 * @example
 * ```typescript
 * // With dot notation for nested relations
 * @Filterable<User>({
 *   searchable: ['name', 'profile.name', 'profile.bio'],
 *   like: ['name', 'profile.name'],
 *   relations: ['profile'],
 * })
 * // URL: ?where[profile.name]=Admin
 * // Result: { where: { 'profile.name': 'Admin' } }
 * ```
 */
export function Filterable<T>(
  options: BuildQueryOptions<T> = {},
): MethodDecorator {
  return (
    target: object,
    propertyKey: string | symbol,
    _descriptor: TypedPropertyDescriptor<unknown>,
  ) => {
    Reflect.defineMetadata(
      FILTERABLE_KEY,
      { options } satisfies FilterableMetadata<T>,
      target,
      propertyKey,
    );
  };
}

/**
 * Parameter decorator that parses query params into TypeORM FindManyOptions.
 *
 * Reads the configuration from `@Filterable()` decorator on the same method.
 * Falls back to parsing raw query params without whitelist filtering.
 *
 * Returns a `ParsedQueryResult` which includes both the parsed options and
 * any validation errors that were found during parsing.
 *
 * @typeParam T - Entity type for type-safe query result
 * @returns Parameter decorator that yields `ParsedQueryResult<T>`
 *
 * @example
 * ```typescript
 * import { Filterable, ParsedQuery } from 'xnest-kit/typeorm';
 * import { FindManyOptions } from 'typeorm';
 *
 * @Controller('users')
 * export class UsersController {
 *   @Get()
 *   @Filterable<User>({
 *     searchable: ['name', 'email', 'age'],
 *     like: ['name', 'email'],
 *     relations: ['profile'],
 *     maxTake: 100,
 *   })
 *   async findAll(@ParsedQuery() query: FindManyOptions<User>) {
 *     return this.userService.find(query);
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // With validation error handling
 * @Get()
 * @Filterable<User>({
 *   searchable: ['name', 'age'],
 *   like: ['name'],
 * })
 * async findAll(@ParsedQuery() result: ParsedQueryResult<User>) {
 *   if (result.errors.length > 0) {
 *     throw new BadRequestException(result.errors);
 *   }
 *   return this.userService.find(result.options);
 * }
 * ```
 */
export const ParsedQuery = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): FindManyOptions => {
    const request: { query?: RawQueryParams } = ctx.switchToHttp().getRequest();
    const handler = ctx.getHandler();
    const classRef = ctx.getClass();

    const metadata = Reflect.getMetadata(
      FILTERABLE_KEY,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      classRef.prototype,
      handler.name,
    ) as FilterableMetadata | undefined;

    const query: RawQueryParams = request.query ?? {};

    const options = metadata?.options ?? {};
    const result = buildQuery(query, options);
    const errors = validateQuery(query, options);

    if (errors.length > 0) {
      const logger = new Logger('ParsedQuery');
      logger.warn(`Query validation errors: ${errors.join(', ')}`);
    }

    return result;
  },
);
