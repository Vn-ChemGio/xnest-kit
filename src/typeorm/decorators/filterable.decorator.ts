import {
  BadRequestException,
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

/** Parameter decorator factory for `@ParsedQuery()`. */
type ParsedQueryDecorator = () => ParameterDecorator;

/**
 * Parse bracket-notation query params into nested objects.
 *
 * Fastify (and some Express configs) parse `?where[name]=John` into
 * `{ 'where[name]': 'John' }` instead of `{ where: { name: 'John' } }`.
 * This function normalizes the flat bracket keys into proper nested objects.
 *
 * If no bracket keys are found, returns the original object unchanged.
 *
 * @param rawQuery - Raw query params from request.query
 * @returns Normalized query with nested objects
 *
 * @internal
 */
function parseBracketNotation(
  rawQuery: Record<string, unknown>,
): Record<string, unknown> {
  const hasBracketKeys = Object.keys(rawQuery).some((k) => k.includes('['));
  if (!hasBracketKeys) return rawQuery;

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(rawQuery)) {
    const match = key.match(/^([^[]+)((?:\[[^\]]*\]))+$/);
    if (!match) {
      result[key] = value;
      continue;
    }

    const rootKey = match[1];
    const bracketParts = key.slice(rootKey.length);
    const segments =
      bracketParts.match(/\[([^\]]*)\]/g)?.map((s) => s.slice(1, -1)) ?? [];

    if (!(rootKey in result)) {
      result[rootKey] = {};
    }

    let current = result[rootKey] as Record<string, unknown>;
    for (let i = 0; i < segments.length - 1; i++) {
      const segment = segments[i];
      if (
        !(segment in current) ||
        typeof current[segment] !== 'object' ||
        current[segment] === null
      ) {
        current[segment] = {};
      }
      current = current[segment] as Record<string, unknown>;
    }

    current[segments[segments.length - 1]] = value;
  }

  return result;
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
export const ParsedQuery: ParsedQueryDecorator = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): FindManyOptions => {
    const request: { query?: Record<string, unknown> } = ctx
      .switchToHttp()
      .getRequest();
    const handler = ctx.getHandler();
    const classRef = ctx.getClass();

    const logger = new Logger('ParsedQuery');

    const metadata = Reflect.getMetadata(
      FILTERABLE_KEY,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      classRef.prototype,
      handler.name,
    ) as FilterableMetadata | undefined;

    const rawQuery: Record<string, unknown> = request.query ?? {};
    const query = parseBracketNotation(rawQuery) as RawQueryParams;

    logger.debug(`Raw query params: ${JSON.stringify(query)}`);

    const options = metadata?.options ?? {};
    const result = buildQuery(query, options);
    const errors = validateQuery(query, options);

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return result;
  },
);
